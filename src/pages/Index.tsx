import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TabbedSidebar from '../components/TabbedSidebar';
import MapView from '../components/MapView';
import GraphBuilder from '../components/GraphBuilder';
import ComparisonTable from '../components/ComparisonTable';
import AlgorithmExplanation from '../components/AlgorithmExplanation';
import ComparisonScenariosManager from '../components/ComparisonScenariosManager';
import { Algorithm, MapType, SimulationParams, SimulationResult } from '../types';
import { runSimulation } from '../utils/algorithms';
import { mapLocations } from '../data/maps';
import { toast } from '@/components/ui/sonner';
import { DownloadIcon, ArrowRightLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportToPDF } from '../utils/pdfExport';
import GoogleMapView from '../components/GoogleMapView';
import GeminiMapView from '../components/GeminiMapView';
import { runGeminiEnhancedSimulation } from '../utils/geminiAlgorithms';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  // Initialize simulation parameters for TSP with default city selection
  const [params, setParams] = useState<SimulationParams>({
    algorithm: 'nearest-neighbor',
    mapType: 'karnataka',
    weather: 'sunny',
    timeOfDay: 'afternoon',
    startLocation: mapLocations.karnataka[0].id,
    vehicle: 'car',
    selectedCities: mapLocations.karnataka.slice(0, 5).map(city => city.id), // Default to first 5 cities
  });
  
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [compareAlgorithm, setCompareAlgorithm] = useState<Algorithm | null>(null);
  const [compareResult, setCompareResult] = useState<SimulationResult | null>(null);
  const [viewMode, setViewMode] = useState<'simulation' | 'graph' | 'scenarios'>('simulation');
  const [sidebarTab, setSidebarTab] = useState('simulation');
  
  // New state for comparison parameters
  const [compareParams, setCompareParams] = useState<Partial<SimulationParams>>({});
  
  // Add Gemini API key state
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(
    localStorage.getItem('gemini-api-key')
  );
  
  // Set dark theme on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  
  // Handle running the TSP simulation
  const handleRunSimulation = async () => {
    try {
      // Validate selected cities
      if (!params.selectedCities || params.selectedCities.length < 2) {
        toast.error("Please select at least 2 cities for TSP simulation");
        return;
      }

      toast.info("Running AI-enhanced TSP simulation...");

      // Run the enhanced TSP simulation with Gemini
      const simulationResult = geminiApiKey 
        ? await runGeminiEnhancedSimulation(params, geminiApiKey)
        : runSimulation(params);
      
      // Check if TSP tour was found
      if (simulationResult.path.length === 0) {
        toast.warning("No valid TSP tour found for the selected cities");
      } else {
        const message = geminiApiKey 
          ? `AI-optimized TSP tour calculated for ${params.selectedCities.length} cities!`
          : `TSP tour calculated for ${params.selectedCities.length} cities!`;
        toast.success(message);
      }
      
      setResult(simulationResult);
      
      // Also run comparison algorithm if selected
      if (compareAlgorithm) {
        const comparisonParams = {
          ...params,
          ...compareParams,
          algorithm: compareAlgorithm
        };
        const comparisonResult = geminiApiKey
          ? await runGeminiEnhancedSimulation(comparisonParams, geminiApiKey)
          : runSimulation(comparisonParams);
        setCompareResult(comparisonResult);
      } else {
        setCompareResult(null);
      }
      
    } catch (error) {
      console.error("TSP simulation error:", error);
      toast.error("Error running TSP simulation");
    }
  };
  
  // Handle comparison algorithm change
  const handleCompareAlgorithmChange = (algorithm: Algorithm | null) => {
    if (algorithm === params.algorithm) {
      toast.warning("Comparison algorithm must be different from primary algorithm");
      return;
    }
    setCompareAlgorithm(algorithm);
    setCompareResult(null);
  };
  
  // Handle comparison parameter changes
  const handleCompareParamChange = (key: keyof SimulationParams, value: any) => {
    setCompareParams(prev => ({ ...prev, [key]: value }));
    setCompareResult(null);
  };
  
  // Reset result when parameters change
  useEffect(() => {
    setResult(null);
    setCompareResult(null);
  }, [params.mapType, params.selectedCities]);
  
  // Reset comparison results when primary algorithm changes
  useEffect(() => {
    if (compareAlgorithm === params.algorithm) {
      setCompareAlgorithm(null);
      setCompareResult(null);
    }
  }, [params.algorithm, compareAlgorithm]);

  // Update selected cities when map type changes
  useEffect(() => {
    const availableCities = mapLocations[params.mapType] || [];
    const defaultSelection = availableCities.slice(0, 5).map(city => city.id);
    setParams(prev => ({
      ...prev,
      selectedCities: defaultSelection,
      startLocation: defaultSelection[0] || availableCities[0]?.id || ''
    }));
  }, [params.mapType]);

  // Generate and download PDF using our utility
  const handleDownloadPDF = () => {
    exportToPDF(params, result, compareAlgorithm, compareResult);
  };

  // Listen for sidebar tab changes
  useEffect(() => {
    const handleSidebarTabChange = (event: CustomEvent) => {
      setSidebarTab(event.detail);
    };

    window.addEventListener('sidebar-tab-change', handleSidebarTabChange as EventListener);
    
    return () => {
      window.removeEventListener('sidebar-tab-change', handleSidebarTabChange as EventListener);
    };
  }, []);

  // Handle loading comparison scenario
  const handleLoadComparison = (primaryParams: SimulationParams, comparisonParams: SimulationParams) => {
    setParams(primaryParams);
    setCompareAlgorithm(comparisonParams.algorithm);
    setCompareParams(comparisonParams);
    toast.success('Loaded comparison scenario successfully');
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <TabbedSidebar 
        params={params} 
        setParams={setParams} 
        onRunSimulation={handleRunSimulation} 
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-4 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground">Karnataka TSP Solver with AI</h1>
            
            <div className="flex flex-wrap items-center gap-2">
              <Link 
                to="/detailed-report"
                className="text-primary hover:text-primary/80 underline"
              >
                📋 Detailed Report
              </Link>
              
              <Link 
                to="/explanation" 
                state={{ algorithm: params.algorithm, result }}
                className="text-primary hover:text-primary/80 underline"
              >
                View Full Explanation
              </Link>
              
              {result && (
                <Link 
                  to="/analysis" 
                  state={{ params, result, compareResult }}
                >
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Detailed Analysis
                  </Button>
                </Link>
              )}
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleDownloadPDF}
                disabled={!result}
              >
                <DownloadIcon className="h-4 w-4" /> 
                Export PDF
              </Button>
            </div>
          </div>

          {/* View Mode Tabs */}
          <Tabs defaultValue="simulation" value={viewMode} onValueChange={(value) => setViewMode(value as 'simulation' | 'graph' | 'scenarios')} className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="simulation">AI-Enhanced TSP Simulation</TabsTrigger>
              <TabsTrigger value="graph">Graph Builder</TabsTrigger>
              <TabsTrigger value="scenarios">Comparison Scenarios</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {viewMode === 'simulation' && (
            <>
              {/* City Selection Summary with AI indicator */}
              {params.selectedCities && (
                <div className="bg-muted/40 p-4 rounded-md border">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-medium mb-2 flex items-center gap-2">
                        Selected Cities for AI-Enhanced TSP
                        {geminiApiKey && <Badge variant="secondary" className="text-xs">AI Powered</Badge>}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Running {geminiApiKey ? 'AI-enhanced' : 'standard'} TSP on {params.selectedCities.length} cities: {' '}
                        {params.selectedCities.map(cityId => {
                          const city = mapLocations[params.mapType].find(c => c.id === cityId);
                          return city ? city.name : cityId;
                        }).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Algorithm comparison with parameter selection */}
              <div className="bg-muted/40 p-4 rounded-md border">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5" />
                    <h2 className="text-lg font-medium">Algorithm Comparison</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Compare Algorithm</Label>
                      <RadioGroup 
                        className="flex flex-wrap gap-4" 
                        value={compareAlgorithm || "none"}
                        onValueChange={(value) => handleCompareAlgorithmChange(value === "none" ? null : value as Algorithm)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="none" id="none" />
                          <Label htmlFor="none">None</Label>
                        </div>
                        
                        {["brute-force", "dynamic-programming", "nearest-neighbor", "branch-and-bound"].filter(algo => algo !== params.algorithm).map((algo) => (
                          <div key={algo} className="flex items-center space-x-2">
                            <RadioGroupItem value={algo} id={algo} />
                            <Label htmlFor={algo}>
                              {algo === "brute-force" ? "Brute Force" : 
                               algo === "dynamic-programming" ? "Dynamic Programming" : 
                               algo === "nearest-neighbor" ? "Nearest Neighbor" : 
                               "Branch and Bound"}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {compareAlgorithm && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Comparison Parameters</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Time of Day</Label>
                            <Select 
                              value={compareParams.timeOfDay || params.timeOfDay} 
                              onValueChange={(value) => handleCompareParamChange('timeOfDay', value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="morning">Morning</SelectItem>
                                <SelectItem value="afternoon">Afternoon</SelectItem>
                                <SelectItem value="evening">Evening</SelectItem>
                                <SelectItem value="night">Night</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-muted-foreground">Weather</Label>
                            <Select 
                              value={compareParams.weather || params.weather} 
                              onValueChange={(value) => handleCompareParamChange('weather', value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
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
                          
                          <div>
                            <Label className="text-xs text-muted-foreground">Vehicle</Label>
                            <Select 
                              value={compareParams.vehicle || params.vehicle} 
                              onValueChange={(value) => handleCompareParamChange('vehicle', value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
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
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {compareAlgorithm && compareResult && (
                    <div className="text-sm text-muted-foreground border-t pt-3">
                      Comparing <span className="font-medium">{params.algorithm}</span> (solid line) with{' '}
                      <span className="font-medium">{compareAlgorithm}</span> (dashed line) under different conditions
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          <div id="pdf-content" className="space-y-6">
            {viewMode === 'graph' ? (
              <div className="h-[800px]">
                <GraphBuilder 
                  isEmbedded={false}
                  showControls={true}
                />
              </div>
            ) : viewMode === 'scenarios' ? (
              <div className="h-[800px]">
                <ComparisonScenariosManager 
                  currentParams={params}
                  onLoadComparison={handleLoadComparison}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Full width Gemini-powered Map at top */}
                <div className="w-full h-[500px]">
                  <GeminiMapView 
                    mapType={params.mapType as MapType} 
                    result={result} 
                    compareResult={compareResult}
                    startLocation={params.startLocation}
                    showCompare={!!compareAlgorithm && !!compareResult}
                  />
                </div>
                
                {/* Full width analysis section below */}
                <div className="w-full">
                  <ComparisonTable result={result} compareResult={compareResult} />
                </div>
              </div>
            )}
          </div>
          
          {viewMode === 'simulation' && (
            <div className="mt-8">
              <AlgorithmExplanation 
                algorithm={params.algorithm as Algorithm} 
                result={result}
                compareAlgorithm={compareAlgorithm as Algorithm | undefined}
                compareResult={compareResult}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
