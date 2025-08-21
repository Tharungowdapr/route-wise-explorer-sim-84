
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimulationParams, MapType, Algorithm, Weather, TimeOfDay, Vehicle } from '../types';
import { Play } from 'lucide-react';
import CitySelector from './CitySelector';

interface SidebarProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  onRunSimulation: () => void;
  tabbed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ params, setParams, onRunSimulation, tabbed = false }) => {
  const handleParamChange = (key: keyof SimulationParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleCitiesChange = (cities: string[]) => {
    setParams(prev => ({ 
      ...prev, 
      selectedCities: cities,
      startLocation: cities.length > 0 ? cities[0] : prev.startLocation
    }));
  };

  return (
    <div className={`space-y-6 ${tabbed ? 'h-full overflow-y-auto' : ''}`}>
      {/* Algorithm Selection */}
      <div>
        <Label htmlFor="algorithm" className="text-sm font-medium mb-2 block">
          TSP Algorithm
        </Label>
        <Select 
          value={params.algorithm} 
          onValueChange={(value: Algorithm) => handleParamChange('algorithm', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nearest-neighbor">Nearest Neighbor</SelectItem>
            <SelectItem value="brute-force">Brute Force</SelectItem>
            <SelectItem value="dynamic-programming">Dynamic Programming</SelectItem>
            <SelectItem value="branch-and-bound">Branch and Bound</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Map Selection */}
      <div>
        <Label htmlFor="map" className="text-sm font-medium mb-2 block">
          Map Region
        </Label>
        <Select 
          value={params.mapType} 
          onValueChange={(value: MapType) => handleParamChange('mapType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select map" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="karnataka">Karnataka State</SelectItem>
            <SelectItem value="bengaluru">Bengaluru City</SelectItem>
            <SelectItem value="mysuru">Mysuru City</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* City Selection */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          City Selection for TSP
        </Label>
        <div className="border rounded-lg p-3 bg-muted/20">
          <CitySelector
            mapType={params.mapType}
            selectedCities={params.selectedCities || []}
            onCitiesChange={handleCitiesChange}
          />
        </div>
      </div>

      {/* Weather Conditions */}
      <div>
        <Label htmlFor="weather" className="text-sm font-medium mb-2 block">
          Weather Conditions
        </Label>
        <Select 
          value={params.weather} 
          onValueChange={(value: Weather) => handleParamChange('weather', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select weather" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sunny">Sunny</SelectItem>
            <SelectItem value="rainy">Rainy</SelectItem>
            <SelectItem value="foggy">Foggy</SelectItem>
            <SelectItem value="snowy">Snowy</SelectItem>
            <SelectItem value="windy">Windy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Time of Day */}
      <div>
        <Label htmlFor="time" className="text-sm font-medium mb-2 block">
          Time of Day
        </Label>
        <Select 
          value={params.timeOfDay} 
          onValueChange={(value: TimeOfDay) => handleParamChange('timeOfDay', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="morning">Morning</SelectItem>
            <SelectItem value="afternoon">Afternoon</SelectItem>
            <SelectItem value="evening">Evening</SelectItem>
            <SelectItem value="night">Night</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vehicle Type */}
      <div>
        <Label htmlFor="vehicle" className="text-sm font-medium mb-2 block">
          Vehicle Type
        </Label>
        <Select 
          value={params.vehicle} 
          onValueChange={(value: Vehicle) => handleParamChange('vehicle', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select vehicle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="car">Car</SelectItem>
            <SelectItem value="bike">Bike</SelectItem>
            <SelectItem value="truck">Truck</SelectItem>
            <SelectItem value="ambulance">Ambulance</SelectItem>
            <SelectItem value="bus">Bus</SelectItem>
            <SelectItem value="ev">Electric Vehicle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Run Simulation Button */}
      <Button 
        onClick={onRunSimulation} 
        className="w-full flex items-center gap-2"
        disabled={!params.selectedCities || params.selectedCities.length < 2}
      >
        <Play className="h-4 w-4" />
        Run TSP Simulation
      </Button>

      {params.selectedCities && params.selectedCities.length < 2 && (
        <p className="text-sm text-muted-foreground text-center">
          Please select at least 2 cities to run TSP simulation
        </p>
      )}
    </div>
  );
};

export default Sidebar;
