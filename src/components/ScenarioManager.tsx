import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Save, X, Play, Info } from 'lucide-react';
import { SimulationParams } from '../types';
import { toast } from '@/components/ui/sonner';

interface Scenario {
  id: string;
  name: string;
  params: SimulationParams;
  createdAt: string;
  description?: string;
  isExample?: boolean;
}

interface ScenarioManagerProps {
  currentParams: SimulationParams;
  onLoadScenario: (params: SimulationParams) => void;
  onRunSimulation: () => void;
}

// Enhanced example TSP scenarios with better diversity for comparisons
const exampleScenarios: Scenario[] = [
  {
    id: 'example-1',
    name: 'Urban TSP Rush Hour',
    description: 'TSP tour through Bengaluru during heavy traffic conditions. Tests how algorithms handle high-congestion scenarios when visiting all cities.',
    params: {
      algorithm: 'nearest-neighbor',
      mapType: 'karnataka',
      weather: 'rainy',
      timeOfDay: 'morning',
      startLocation: 'k1',
      vehicle: 'car',
      selectedCities: ['k1', 'k2', 'k3', 'k4', 'k5']
    },
    createdAt: new Date().toISOString(),
    isExample: true
  },
  {
    id: 'example-2',
    name: 'Emergency TSP Route',
    description: 'Emergency vehicle TSP routing in adverse weather. Compares Dynamic Programming vs Nearest Neighbor for time-critical TSP scenarios.',
    params: {
      algorithm: 'dynamic-programming',
      mapType: 'karnataka',
      weather: 'foggy',
      timeOfDay: 'night',
      startLocation: 'k1',
      vehicle: 'ambulance',
      selectedCities: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6']
    },
    createdAt: new Date().toISOString(),
    isExample: true
  },
  {
    id: 'example-3',
    name: 'Karnataka State TSP',
    description: 'Long-distance TSP tour across Karnataka. Tests algorithm efficiency on sparse networks for complete state coverage.',
    params: {
      algorithm: 'branch-and-bound',
      mapType: 'karnataka',
      weather: 'sunny',
      timeOfDay: 'afternoon',
      startLocation: 'k1',
      vehicle: 'truck',
      selectedCities: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7']
    },
    createdAt: new Date().toISOString(),
    isExample: true
  },
  {
    id: 'example-4',
    name: 'Eco-Friendly TSP',
    description: 'Electric vehicle TSP routing through Karnataka. Optimizes for energy efficiency and range while visiting all cities.',
    params: {
      algorithm: 'brute-force',
      mapType: 'karnataka',
      weather: 'windy',
      timeOfDay: 'evening',
      startLocation: 'k1',
      vehicle: 'ev',
      selectedCities: ['k1', 'k2', 'k3', 'k4']
    },
    createdAt: new Date().toISOString(),
    isExample: true
  },
  {
    id: 'example-5',
    name: 'Small Route Optimal',
    description: 'Perfect for testing all algorithms on a small dataset where brute force is feasible. Shows clear performance differences.',
    params: {
      algorithm: 'brute-force',
      mapType: 'karnataka',
      weather: 'sunny',
      timeOfDay: 'afternoon',
      startLocation: 'k1',
      vehicle: 'car',
      selectedCities: ['k1', 'k2', 'k3']
    },
    createdAt: new Date().toISOString(),
    isExample: true
  },
  {
    id: 'example-6',
    name: 'Large Dataset Challenge',
    description: 'Tests scalability with many cities. Only Nearest Neighbor will be practical, while others show exponential growth.',
    params: {
      algorithm: 'nearest-neighbor',
      mapType: 'karnataka',
      weather: 'sunny',
      timeOfDay: 'afternoon',
      startLocation: 'k1',
      vehicle: 'car',
      selectedCities: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9', 'k10']
    },
    createdAt: new Date().toISOString(),
    isExample: true
  }
];

const ScenarioManager: React.FC<ScenarioManagerProps> = ({ 
  currentParams, 
  onLoadScenario,
  onRunSimulation
}) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenarioName, setScenarioName] = useState('');
  const [expandedExample, setExpandedExample] = useState<string | null>(null);

  // Load scenarios from localStorage on component mount
  useEffect(() => {
    const savedScenarios = localStorage.getItem('daa-scenarios');
    let userScenarios: Scenario[] = [];
    
    if (savedScenarios) {
      try {
        userScenarios = JSON.parse(savedScenarios);
      } catch (error) {
        console.error('Error loading scenarios:', error);
        toast.error('Failed to load saved scenarios');
      }
    }
    
    // Combine example scenarios with user scenarios
    setScenarios([...exampleScenarios, ...userScenarios]);
  }, []);

  // Save only user scenarios to localStorage
  useEffect(() => {
    const userScenarios = scenarios.filter(s => !s.isExample);
    localStorage.setItem('daa-scenarios', JSON.stringify(userScenarios));
  }, [scenarios]);

  const handleSaveScenario = () => {
    if (!scenarioName.trim()) {
      toast.error('Please enter a scenario name');
      return;
    }

    // Check if a user scenario with this name already exists
    const existingIndex = scenarios.findIndex(s => s.name === scenarioName && !s.isExample);
    
    if (existingIndex >= 0) {
      // Update existing scenario
      const updatedScenarios = [...scenarios];
      updatedScenarios[existingIndex] = {
        ...updatedScenarios[existingIndex],
        params: currentParams,
        createdAt: new Date().toISOString()
      };
      
      setScenarios(updatedScenarios);
      toast.success(`Updated scenario "${scenarioName}"`);
    } else {
      // Create new scenario
      const newScenario: Scenario = {
        id: `scenario-${Date.now()}`,
        name: scenarioName,
        params: currentParams,
        createdAt: new Date().toISOString(),
        isExample: false
      };
      
      setScenarios([...scenarios, newScenario]);
      toast.success(`Saved scenario "${scenarioName}"`);
    }
    
    setScenarioName('');
  };

  const handleLoadScenario = (scenario: Scenario) => {
    onLoadScenario(scenario.params);
    toast.success(`Loaded scenario "${scenario.name}"`);
  };

  const handleDeleteScenario = (id: string, name: string) => {
    // Only allow deletion of user scenarios, not examples
    const scenario = scenarios.find(s => s.id === id);
    if (scenario?.isExample) {
      toast.error('Cannot delete example scenarios');
      return;
    }
    
    setScenarios(scenarios.filter(s => s.id !== id));
    toast.info(`Deleted scenario "${name}"`);
  };

  const handleRunScenario = (scenario: Scenario) => {
    onLoadScenario(scenario.params);
    setTimeout(onRunSimulation, 100);
    toast.success(`Running scenario "${scenario.name}"`);
  };

  const userScenarios = scenarios.filter(s => !s.isExample);
  const examples = scenarios.filter(s => s.isExample);

  return (
    <div className="flex flex-col h-full">
      <Card className="bg-sidebar-accent border-sidebar-border mb-4">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="scenario-name">Scenario Name</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="scenario-name"
                  placeholder="My Scenario"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="bg-sidebar-accent text-sidebar-foreground border-sidebar-border"
                />
                <Button 
                  onClick={handleSaveScenario}
                  className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
                >
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Example Scenarios Section */}
        <div>
          <h3 className="text-sidebar-foreground font-medium mb-2">Example Scenarios</h3>
          <div className="space-y-2">
            {examples.map((scenario) => (
              <Card 
                key={scenario.id} 
                className="bg-sidebar-accent border-sidebar-border"
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sidebar-foreground">{scenario.name}</h4>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground hover:text-sidebar-foreground"
                      onClick={() => setExpandedExample(
                        expandedExample === scenario.id ? null : scenario.id
                      )}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {expandedExample === scenario.id && (
                    <div className="text-xs text-muted-foreground mb-2 p-2 bg-background/50 rounded">
                      {scenario.description}
                    </div>
                  )}
                  
                  <div className="text-xs text-sidebar-foreground mb-2">
                    <div>Algorithm: {scenario.params.algorithm}</div>
                    <div>Map: {scenario.params.mapType}</div>
                    <div>Vehicle: {scenario.params.vehicle}</div>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleLoadScenario(scenario)}
                    >
                      Load
                    </Button>
                    <Button 
                      size="sm"
                      className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-xs flex items-center gap-1"
                      onClick={() => handleRunScenario(scenario)}
                    >
                      <Play className="h-3 w-3" /> Run
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* User Scenarios Section */}
        <div>
          <h3 className="text-sidebar-foreground font-medium mb-2">My Scenarios</h3>
          
          {userScenarios.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No scenarios saved yet. Configure a simulation and save it to start.
            </p>
          ) : (
            <div className="space-y-2">
              {userScenarios.map((scenario) => (
                <Card 
                  key={scenario.id} 
                  className="bg-sidebar-accent border-sidebar-border"
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium text-sidebar-foreground">{scenario.name}</h4>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteScenario(scenario.id, scenario.name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-2">
                      {new Date(scenario.createdAt).toLocaleString()}
                    </div>
                    
                    <div className="text-xs text-sidebar-foreground mb-2">
                      <div>Algorithm: {scenario.params.algorithm}</div>
                      <div>Map: {scenario.params.mapType}</div>
                      <div>Conditions: {scenario.params.weather}, {scenario.params.timeOfDay}</div>
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => handleLoadScenario(scenario)}
                      >
                        Load
                      </Button>
                      <Button 
                        size="sm"
                        className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-xs flex items-center gap-1"
                        onClick={() => handleRunScenario(scenario)}
                      >
                        <Play className="h-3 w-3" /> Run
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioManager;
