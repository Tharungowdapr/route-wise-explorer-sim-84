
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Save, Play, Trash2, Eye, GitCompare } from 'lucide-react';
import { SimulationParams, SimulationResult } from '../types';
import { runSimulation } from '../utils/algorithms';
import { toast } from '@/components/ui/sonner';

interface ComparisonScenario {
  id: string;
  name: string;
  description: string;
  scenarios: {
    primary: {
      params: SimulationParams;
      result: SimulationResult | null;
    };
    comparison: {
      params: SimulationParams;
      result: SimulationResult | null;
    };
  };
  createdAt: string;
  lastRun: string | null;
}

interface ComparisonScenariosManagerProps {
  currentParams: SimulationParams;
  onLoadComparison: (primary: SimulationParams, comparison: SimulationParams) => void;
}

const ComparisonScenariosManager: React.FC<ComparisonScenariosManagerProps> = ({
  currentParams,
  onLoadComparison
}) => {
  const [scenarios, setScenarios] = useState<ComparisonScenario[]>([]);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [selectedComparison, setSelectedComparison] = useState<ComparisonScenario | null>(null);

  // Load scenarios from localStorage
  useEffect(() => {
    const savedScenarios = localStorage.getItem('comparison-scenarios');
    if (savedScenarios) {
      try {
        const parsed = JSON.parse(savedScenarios);
        setScenarios(parsed);
      } catch (error) {
        console.error('Error loading comparison scenarios:', error);
      }
    }
  }, []);

  // Save scenarios to localStorage
  useEffect(() => {
    localStorage.setItem('comparison-scenarios', JSON.stringify(scenarios));
  }, [scenarios]);

  const createComparisonScenario = () => {
    if (!scenarioName.trim()) {
      toast.error('Please enter a scenario name');
      return;
    }

    // Create comparison with different algorithm
    const comparisonParams: SimulationParams = {
      ...currentParams,
      algorithm: currentParams.algorithm === 'nearest-neighbor' ? 'dynamic-programming' : 'nearest-neighbor'
    };

    const newScenario: ComparisonScenario = {
      id: `comparison-${Date.now()}`,
      name: scenarioName,
      description: scenarioDescription || `Comparison between ${currentParams.algorithm} and ${comparisonParams.algorithm}`,
      scenarios: {
        primary: {
          params: currentParams,
          result: null
        },
        comparison: {
          params: comparisonParams,
          result: null
        }
      },
      createdAt: new Date().toISOString(),
      lastRun: null
    };

    setScenarios([...scenarios, newScenario]);
    setScenarioName('');
    setScenarioDescription('');
    toast.success(`Created comparison scenario "${newScenario.name}"`);
  };

  const runComparisonScenario = async (scenario: ComparisonScenario) => {
    toast.info(`Running comparison scenario: ${scenario.name}`);

    try {
      // Run both simulations
      const primaryResult = runSimulation(scenario.scenarios.primary.params);
      const comparisonResult = runSimulation(scenario.scenarios.comparison.params);

      // Update scenario with results
      const updatedScenario: ComparisonScenario = {
        ...scenario,
        scenarios: {
          primary: {
            ...scenario.scenarios.primary,
            result: primaryResult
          },
          comparison: {
            ...scenario.scenarios.comparison,
            result: comparisonResult
          }
        },
        lastRun: new Date().toISOString()
      };

      // Update scenarios list
      setScenarios(prev => prev.map(s => s.id === scenario.id ? updatedScenario : s));
      
      toast.success(`Completed comparison: ${scenario.name}`);
    } catch (error) {
      console.error('Error running comparison:', error);
      toast.error('Failed to run comparison scenario');
    }
  };

  const deleteScenario = (id: string, name: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
    toast.info(`Deleted scenario "${name}"`);
  };

  const loadScenario = (scenario: ComparisonScenario) => {
    onLoadComparison(scenario.scenarios.primary.params, scenario.scenarios.comparison.params);
    toast.success(`Loaded comparison scenario: ${scenario.name}`);
  };

  const formatMetric = (value: number, type: 'time' | 'distance' | 'cost' | 'fuel'): string => {
    switch (type) {
      case 'time':
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      case 'distance':
        return value >= 1000 ? `${(value / 1000).toFixed(1)} km` : `${Math.round(value)} m`;
      case 'cost':
        return `₹${value.toFixed(0)}`;
      case 'fuel':
        return `${value.toFixed(1)} L`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Comparison Scenario */}
      <Card>
        <CardHeader>
          <CardTitle>Create Comparison Scenario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="scenario-name">Scenario Name</Label>
            <Input
              id="scenario-name"
              placeholder="e.g., Urban vs Rural Comparison"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="scenario-description">Description (Optional)</Label>
            <Input
              id="scenario-description"
              placeholder="Brief description of what this comparison demonstrates"
              value={scenarioDescription}
              onChange={(e) => setScenarioDescription(e.target.value)}
            />
          </div>
          <Button onClick={createComparisonScenario} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Comparison Scenario
          </Button>
        </CardContent>
      </Card>

      {/* Existing Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Comparison Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          {scenarios.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No comparison scenarios saved yet. Create one to start comparing different algorithm configurations.
            </p>
          ) : (
            <div className="space-y-4">
              {scenarios.map((scenario) => (
                <Card key={scenario.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{scenario.name}</h3>
                        <p className="text-sm text-muted-foreground">{scenario.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(scenario.createdAt).toLocaleDateString()}
                          {scenario.lastRun && ` • Last run: ${new Date(scenario.lastRun).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadScenario(scenario)}
                        >
                          <GitCompare className="h-4 w-4 mr-1" />
                          Load
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => runComparisonScenario(scenario)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Run
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedComparison(scenario)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteScenario(scenario.id, scenario.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Quick Preview */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-2 border rounded">
                        <h4 className="font-medium">Primary Algorithm</h4>
                        <p>Algorithm: <Badge variant="outline">{scenario.scenarios.primary.params.algorithm}</Badge></p>
                        <p>Map: {scenario.scenarios.primary.params.mapType}</p>
                        <p>Vehicle: {scenario.scenarios.primary.params.vehicle}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <h4 className="font-medium">Comparison Algorithm</h4>
                        <p>Algorithm: <Badge variant="outline">{scenario.scenarios.comparison.params.algorithm}</Badge></p>
                        <p>Map: {scenario.scenarios.comparison.params.mapType}</p>
                        <p>Vehicle: {scenario.scenarios.comparison.params.vehicle}</p>
                      </div>
                    </div>

                    {/* Results Preview */}
                    {scenario.scenarios.primary.result && scenario.scenarios.comparison.result && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="font-medium mb-2">Results Summary</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Metric</TableHead>
                              <TableHead>{scenario.scenarios.primary.params.algorithm}</TableHead>
                              <TableHead>{scenario.scenarios.comparison.params.algorithm}</TableHead>
                              <TableHead>Better</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>Time</TableCell>
                              <TableCell>{formatMetric(scenario.scenarios.primary.result.metrics.time, 'time')}</TableCell>
                              <TableCell>{formatMetric(scenario.scenarios.comparison.result.metrics.time, 'time')}</TableCell>
                              <TableCell>
                                <Badge variant={scenario.scenarios.primary.result.metrics.time < scenario.scenarios.comparison.result.metrics.time ? 'default' : 'secondary'}>
                                  {scenario.scenarios.primary.result.metrics.time < scenario.scenarios.comparison.result.metrics.time 
                                    ? scenario.scenarios.primary.params.algorithm 
                                    : scenario.scenarios.comparison.params.algorithm}
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Cost</TableCell>
                              <TableCell>{formatMetric(scenario.scenarios.primary.result.metrics.cost, 'cost')}</TableCell>
                              <TableCell>{formatMetric(scenario.scenarios.comparison.result.metrics.cost, 'cost')}</TableCell>
                              <TableCell>
                                <Badge variant={scenario.scenarios.primary.result.metrics.cost < scenario.scenarios.comparison.result.metrics.cost ? 'default' : 'secondary'}>
                                  {scenario.scenarios.primary.result.metrics.cost < scenario.scenarios.comparison.result.metrics.cost 
                                    ? scenario.scenarios.primary.params.algorithm 
                                    : scenario.scenarios.comparison.params.algorithm}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed View Modal-like Card */}
      {selectedComparison && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Detailed Results: {selectedComparison.name}</CardTitle>
              <Button variant="ghost" onClick={() => setSelectedComparison(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedComparison.scenarios.primary.result && selectedComparison.scenarios.comparison.result ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-center">
                        {selectedComparison.scenarios.primary.params.algorithm}
                      </TableHead>
                      <TableHead className="text-center">
                        {selectedComparison.scenarios.comparison.params.algorithm}
                      </TableHead>
                      <TableHead className="text-center">Difference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Time</TableCell>
                      <TableCell className="text-center">
                        {formatMetric(selectedComparison.scenarios.primary.result.metrics.time, 'time')}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatMetric(selectedComparison.scenarios.comparison.result.metrics.time, 'time')}
                      </TableCell>
                      <TableCell className="text-center">
                        {Math.abs(selectedComparison.scenarios.primary.result.metrics.time - selectedComparison.scenarios.comparison.result.metrics.time).toFixed(0)}s
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Distance</TableCell>
                      <TableCell className="text-center">
                        {formatMetric(selectedComparison.scenarios.primary.result.metrics.distance, 'distance')}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatMetric(selectedComparison.scenarios.comparison.result.metrics.distance, 'distance')}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatMetric(Math.abs(selectedComparison.scenarios.primary.result.metrics.distance - selectedComparison.scenarios.comparison.result.metrics.distance), 'distance')}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Cost</TableCell>
                      <TableCell className="text-center">
                        {formatMetric(selectedComparison.scenarios.primary.result.metrics.cost, 'cost')}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatMetric(selectedComparison.scenarios.comparison.result.metrics.cost, 'cost')}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatMetric(Math.abs(selectedComparison.scenarios.primary.result.metrics.cost - selectedComparison.scenarios.comparison.result.metrics.cost), 'cost')}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Fuel Usage</TableCell>
                      <TableCell className="text-center">
                        {formatMetric(selectedComparison.scenarios.primary.result.metrics.fuel, 'fuel')}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatMetric(selectedComparison.scenarios.comparison.result.metrics.fuel, 'fuel')}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatMetric(Math.abs(selectedComparison.scenarios.primary.result.metrics.fuel - selectedComparison.scenarios.comparison.result.metrics.fuel), 'fuel')}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Run this scenario to see detailed results
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComparisonScenariosManager;
