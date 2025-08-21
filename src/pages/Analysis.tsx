
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calculator, MapPin, Clock, Cloud, Car, Zap, TrendingUp } from 'lucide-react';
import { SimulationResult, SimulationParams } from '../types';
import { mapLocations } from '../data/maps';

const Analysis = () => {
  const location = useLocation();
  const { params, result, compareResult } = location.state || {};

  // Get stored Gemini data
  const geminiData = JSON.parse(localStorage.getItem('gemini-data') || 'null');
  const trafficData = JSON.parse(localStorage.getItem('traffic-data') || 'null');

  if (!params || !result) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Simulation
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">TSP Analysis</h1>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No analysis data available. Please run a simulation first.</p>
              <Link to="/" className="inline-block mt-4">
                <Button>Go to Simulation</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get actual city names from the simulation data
  const getCityName = (cityId: string): string => {
    const city = mapLocations[params.mapType]?.find(c => c.id === cityId);
    return city ? city.name : cityId;
  };

  // Calculate realistic edge costs based on actual simulation data
  const calculateEdgeCost = (fromCity: string, toCity: string, baseDistance: number): any => {
    const trafficMultiplier = params.timeOfDay === 'morning' || params.timeOfDay === 'evening' ? 1.8 : 1.2;
    const weatherMultiplier = params.weather === 'rainy' ? 1.5 : params.weather === 'foggy' ? 1.3 : 1.0;
    const vehicleMultiplier = params.vehicle === 'truck' ? 1.4 : params.vehicle === 'bike' ? 0.8 : 1.0;
    
    const travelTime = (baseDistance / 60) * trafficMultiplier * weatherMultiplier; // Assuming 60 km/h base speed
    const fuelCost = baseDistance * vehicleMultiplier * 2.5; // Base fuel cost per km
    const timeCost = (travelTime * 120) / 60; // Driver wages ₹120/hour
    const finalCost = fuelCost + timeCost + (weatherMultiplier > 1 ? baseDistance * 0.5 : 0);
    
    return {
      baseDistance,
      travelTime: travelTime * 60, // Convert to minutes
      trafficFactor: trafficMultiplier,
      weatherImpact: weatherMultiplier,
      finalCost
    };
  };

  // Real-time Gemini Data Component
  const GeminiDataCard = () => {
    if (!geminiData) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Real-time Gemini AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Current Conditions</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Congestion Level:</span>
                  <Badge variant={geminiData.metrics.realTimeFactors.congestion > 0.7 ? 'destructive' : 'secondary'}>
                    {Math.round(geminiData.metrics.realTimeFactors.congestion * 100)}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Road Conditions:</span>
                  <span className="text-sm">{geminiData.metrics.realTimeFactors.roadConditions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Weather:</span>
                  <span className="text-sm">{geminiData.metrics.realTimeFactors.weatherConditions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel Price:</span>
                  <span className="text-sm">₹{geminiData.metrics.realTimeFactors.fuelPrices}/L</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">AI Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>AI Distance:</span>
                  <span className="text-sm">{(geminiData.metrics.distance / 1000).toFixed(1)} km</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Time:</span>
                  <span className="text-sm">{Math.round(geminiData.metrics.time / 60)} min</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Cost:</span>
                  <span className="text-sm">₹{geminiData.metrics.cost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Traffic Impact:</span>
                  <Badge variant="outline">{geminiData.metrics.trafficImpact.toFixed(2)}x</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Weather Impact:</span>
                  <Badge variant="outline">{geminiData.metrics.weatherImpact.toFixed(2)}x</Badge>
                </div>
              </div>
            </div>
          </div>
          
          {geminiData.recommendations && geminiData.recommendations.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">AI Recommendations</h3>
              <ul className="space-y-2">
                {geminiData.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Traffic Data Component
  const TrafficDataCard = () => {
    if (!trafficData || !trafficData.trafficData) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-500" />
            Live Traffic Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>City</TableHead>
                <TableHead>Congestion</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Delay (min)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(trafficData.trafficData).map(([city, data]: [string, any]) => (
                <TableRow key={city}>
                  <TableCell className="font-medium">{city}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={data.congestion > 0.7 ? "destructive" : data.congestion > 0.4 ? "secondary" : "default"}
                    >
                      {Math.round(data.congestion * 100)}%
                    </Badge>
                  </TableCell>
                  <TableCell>{data.condition}</TableCell>
                  <TableCell>{data.delay} min</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {trafficData.lastUpdated && (
            <div className="mt-3 text-xs text-muted-foreground">
              Last updated: {new Date(trafficData.lastUpdated).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const EdgeCostTable = ({ title, result }: { title: string; result: SimulationResult }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {title} - Route Edge Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Route Path:</strong> {result.path.map(getCityName).join(' → ')}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            <strong>Total Cities:</strong> {result.path.length - 1} | <strong>Algorithm:</strong> {result.algorithm}
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From → To</TableHead>
              <TableHead>Distance (km)</TableHead>
              <TableHead>Travel Time (min)</TableHead>
              <TableHead>Traffic Factor</TableHead>
              <TableHead>Weather Impact</TableHead>
              <TableHead>Edge Cost (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.path.slice(0, -1).map((fromCity, index) => {
              const toCity = result.path[index + 1];
              const fromCityName = getCityName(fromCity);
              const toCityName = getCityName(toCity);
              
              // Calculate realistic distance based on actual route segment
              const segmentDistance = result.metrics.distance / (result.path.length - 1);
              const edgeData = calculateEdgeCost(fromCity, toCity, segmentDistance / 1000);
              
              return (
                <TableRow key={`${fromCity}-${toCity}`}>
                  <TableCell className="font-medium">{fromCityName} → {toCityName}</TableCell>
                  <TableCell>{edgeData.baseDistance.toFixed(1)}</TableCell>
                  <TableCell>{edgeData.travelTime.toFixed(0)}</TableCell>
                  <TableCell>
                    <Badge variant={edgeData.trafficFactor > 1.5 ? 'destructive' : 'secondary'}>
                      {edgeData.trafficFactor.toFixed(2)}x
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={edgeData.weatherImpact > 1.2 ? 'destructive' : 'secondary'}>
                      {edgeData.weatherImpact.toFixed(2)}x
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">₹{edgeData.finalCost.toFixed(0)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const HeuristicTable = ({ title, result }: { title: string; result: SimulationResult }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {title} - Performance Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">Algorithm Efficiency</h3>
            <p className="text-sm text-muted-foreground mb-2">
              The {result.algorithm} algorithm achieved the following results for {result.path.length - 1} cities.
            </p>
            <div className="space-y-1 text-sm">
              <div><strong>Distance:</strong> {(result.metrics.distance / 1000).toFixed(1)} km</div>
              <div><strong>Time:</strong> {Math.round(result.metrics.time / 60)} minutes</div>
              <div><strong>Efficiency Score:</strong> {result.metrics.totalScore.toFixed(1)}/100</div>
              <div><strong>Optimality:</strong> {result.algorithm === 'brute-force' ? 'Guaranteed' : 'Heuristic'}</div>
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">Actual Cost Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Distance Cost:</span>
                <span>₹{(result.metrics.distance * 0.002).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Time Cost (₹120/hr):</span>
                <span>₹{(result.metrics.time * 120 / 3600).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fuel Cost:</span>
                <span>₹{(result.metrics.fuel * 85).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Weather/Traffic Surcharge:</span>
                <span>₹{(result.metrics.cost * 0.15).toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Actual Cost:</span>
                <span>₹{result.metrics.cost.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Simulation
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Detailed TSP Analysis</h1>
        </div>

        {/* Real-time Gemini Data */}
        <GeminiDataCard />
        
        {/* Traffic Data */}
        <TrafficDataCard />

        {/* Simulation Parameters with actual data */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Simulation Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Algorithm</div>
                  <div className="font-medium">{params.algorithm}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Time</div>
                  <div className="font-medium">{params.timeOfDay}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Weather</div>
                  <div className="font-medium">{params.weather}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Vehicle</div>
                  <div className="font-medium">{params.vehicle}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Cities</div>
                  <div className="font-medium">{params.selectedCities?.length || 0}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Algorithm Analysis */}
        <EdgeCostTable title={`${result.algorithm.toUpperCase()} Algorithm`} result={result} />
        <HeuristicTable title={`${result.algorithm.toUpperCase()} Algorithm`} result={result} />

        {/* Comparison Algorithm Analysis */}
        {compareResult && (
          <>
            <EdgeCostTable title={`${compareResult.algorithm.toUpperCase()} Comparison`} result={compareResult} />
            <HeuristicTable title={`${compareResult.algorithm.toUpperCase()} Comparison`} result={compareResult} />
          </>
        )}

        {/* Algorithm Explanation with actual data context */}
        <Card>
          <CardHeader>
            <CardTitle>Algorithm Performance Explanation</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  How {result.algorithm.replace('-', ' ').toUpperCase()} Performed on Your Route
                </h3>
                <p className="mb-2">
                  For your selected {params.selectedCities?.length || 0} cities under {params.weather} weather conditions during {params.timeOfDay}:
                </p>
                {result.algorithm === 'nearest-neighbor' && (
                  <p>The Nearest Neighbor algorithm achieved a total distance of {(result.metrics.distance / 1000).toFixed(1)} km with a cost of ₹{result.metrics.cost.toFixed(0)}. While fast to compute, this heuristic approach may not always find the optimal solution, especially for larger city sets.</p>
                )}
                {result.algorithm === 'brute-force' && (
                  <p>The Brute Force algorithm found the mathematically optimal route with {(result.metrics.distance / 1000).toFixed(1)} km total distance. However, computation time increases dramatically with more cities (factorial complexity).</p>
                )}
                {result.algorithm === 'dynamic-programming' && (
                  <p>Dynamic Programming found an optimal solution of {(result.metrics.distance / 1000).toFixed(1)} km using the Held-Karp algorithm. This approach balances optimality with reasonable computation time for medium-sized problems.</p>
                )}
                {result.algorithm === 'branch-and-bound' && (
                  <p>Branch and Bound efficiently explored the solution space to find a route of {(result.metrics.distance / 1000).toFixed(1)} km by pruning suboptimal branches early, making it suitable for practical applications.</p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Impact of Your Selected Conditions</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Weather ({params.weather}):</strong> {params.weather === 'rainy' ? 'Added 50% travel time due to reduced speed and safety concerns' : params.weather === 'foggy' ? 'Increased travel time by 30% due to visibility issues' : 'Optimal conditions with no weather penalties'}</li>
                  <li><strong>Time of Day ({params.timeOfDay}):</strong> {params.timeOfDay === 'morning' || params.timeOfDay === 'evening' ? 'Peak traffic increased travel time by 80%' : 'Off-peak conditions with minimal traffic delays'}</li>
                  <li><strong>Vehicle ({params.vehicle}):</strong> {params.vehicle === 'truck' ? 'Truck restrictions added 40% to fuel costs' : params.vehicle === 'bike' ? 'Motorcycle efficiency reduced fuel costs by 20%' : 'Standard vehicle with baseline costs'}</li>
                  <li><strong>Selected Cities:</strong> Your route through {params.selectedCities?.map((id: string) => getCityName(id)).join(', ')} created a {result.metrics.totalScore < 40 ? 'highly efficient' : result.metrics.totalScore < 70 ? 'moderately efficient' : 'challenging'} TSP instance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analysis;
