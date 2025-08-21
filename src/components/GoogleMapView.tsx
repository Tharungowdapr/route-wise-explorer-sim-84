
import React from 'react';
import { SimulationResult, MapType } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Zap, ArrowRight } from 'lucide-react';
import GeminiMapView from './GeminiMapView';

interface GoogleMapViewProps {
  mapType: MapType;
  result: SimulationResult | null;
  compareResult?: SimulationResult | null;
  startLocation: string;
  showCompare?: boolean;
}

const GoogleMapView = ({ mapType, result, compareResult, startLocation, showCompare = false }: GoogleMapViewProps) => {
  // Since we're focusing on Gemini API, redirect to GeminiMapView
  return (
    <div className="w-full h-full">
      <GeminiMapView 
        mapType={mapType}
        result={result}
        compareResult={compareResult}
        startLocation={startLocation}
        showCompare={showCompare}
      />
    </div>
  );
};

export default GoogleMapView;
