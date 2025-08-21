
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Shuffle } from 'lucide-react';
import { MapType } from '../types';
import { mapLocations } from '../data/maps';

interface CitySelectorProps {
  mapType: MapType;
  selectedCities: string[];
  onCitiesChange: (cities: string[]) => void;
}

const CitySelector: React.FC<CitySelectorProps> = ({
  mapType,
  selectedCities,
  onCitiesChange
}) => {
  const [numCities, setNumCities] = useState<number>(5);
  const [customCityName, setCustomCityName] = useState('');
  const [customCityLat, setCustomCityLat] = useState('');
  const [customCityLng, setCustomCityLng] = useState('');

  const availableCities = mapLocations[mapType] || [];

  // Update selected cities when number changes
  useEffect(() => {
    if (selectedCities.length !== numCities) {
      const newSelection = selectedCities.slice(0, numCities);
      // Fill remaining slots with available cities
      while (newSelection.length < numCities && newSelection.length < availableCities.length) {
        const remainingCities = availableCities.filter(city => !newSelection.includes(city.id));
        if (remainingCities.length > 0) {
          newSelection.push(remainingCities[0].id);
        } else {
          break;
        }
      }
      onCitiesChange(newSelection);
    }
  }, [numCities, availableCities.length]);

  const handleCityToggle = (cityId: string, checked: boolean) => {
    let newSelection = [...selectedCities];
    
    if (checked && !newSelection.includes(cityId)) {
      if (newSelection.length < numCities) {
        newSelection.push(cityId);
      } else {
        // Replace the last city
        newSelection[newSelection.length - 1] = cityId;
      }
    } else if (!checked) {
      newSelection = newSelection.filter(id => id !== cityId);
    }
    
    onCitiesChange(newSelection);
  };

  const handleRandomSelection = () => {
    const shuffled = [...availableCities].sort(() => Math.random() - 0.5);
    const randomSelection = shuffled.slice(0, Math.min(numCities, availableCities.length)).map(city => city.id);
    onCitiesChange(randomSelection);
  };

  const getCityName = (cityId: string) => {
    return availableCities.find(city => city.id === cityId)?.name || cityId;
  };

  const handleRemoveCity = (cityId: string) => {
    const newSelection = selectedCities.filter(id => id !== cityId);
    onCitiesChange(newSelection);
    if (numCities > newSelection.length) {
      setNumCities(newSelection.length);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="num-cities" className="text-sm font-medium">
          Number of Cities
        </Label>
        <div className="flex items-center gap-2 mt-1">
          <Select 
            value={numCities.toString()} 
            onValueChange={(value) => setNumCities(parseInt(value))}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: Math.min(15, availableCities.length) }, (_, i) => i + 2).map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRandomSelection}
            className="flex items-center gap-1"
          >
            <Shuffle className="h-4 w-4" />
            Random
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">
          Selected Cities ({selectedCities.length}/{numCities})
        </Label>
        <div className="flex flex-wrap gap-1 mb-3">
          {selectedCities.map(cityId => (
            <Badge key={cityId} variant="secondary" className="flex items-center gap-1">
              {getCityName(cityId)}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => handleRemoveCity(cityId)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">
          Available Cities
        </Label>
        <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2">
          {availableCities.map(city => (
            <div key={city.id} className="flex items-center space-x-2">
              <Checkbox
                id={city.id}
                checked={selectedCities.includes(city.id)}
                onCheckedChange={(checked) => handleCityToggle(city.id, checked as boolean)}
                disabled={!selectedCities.includes(city.id) && selectedCities.length >= numCities}
              />
              <Label 
                htmlFor={city.id} 
                className="text-sm cursor-pointer flex-1"
              >
                {city.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {selectedCities.length < numCities && (
        <div className="text-sm text-muted-foreground">
          Select {numCities - selectedCities.length} more cities to reach your target of {numCities}.
        </div>
      )}
    </div>
  );
};

export default CitySelector;
