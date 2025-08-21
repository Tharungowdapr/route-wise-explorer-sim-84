
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ComparisonScenariosManager from '../components/ComparisonScenariosManager';
import { SimulationParams } from '../types';
import { toast } from '@/components/ui/sonner';

const ComparisonScenariosPage = () => {
  const [currentParams] = useState<SimulationParams>({
    algorithm: 'nearest-neighbor',
    mapType: 'karnataka',
    weather: 'sunny',
    timeOfDay: 'afternoon',
    startLocation: 'k1',
    vehicle: 'car',
    selectedCities: ['k1', 'k2', 'k3', 'k4', 'k5'],
  });

  const handleLoadComparison = (primary: SimulationParams, comparison: SimulationParams) => {
    // For now, just show a toast. In a full implementation, this would navigate back to the main page
    // with the loaded parameters
    toast.success('Comparison loaded! Navigate back to the main page to run the simulation.');
    console.log('Primary params:', primary);
    console.log('Comparison params:', comparison);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto p-4">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Simulator
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Comparison Scenarios Manager</h1>
          <p className="text-muted-foreground mt-2">
            Create, save, and manage different algorithm comparison scenarios to analyze performance differences.
          </p>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto p-4">
        <ComparisonScenariosManager
          currentParams={currentParams}
          onLoadComparison={handleLoadComparison}
        />
      </div>
    </div>
  );
};

export default ComparisonScenariosPage;
