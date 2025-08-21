import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SimulationResult } from '../types';
import { mapLocations } from '../data/maps';
import { formatTSPPath } from '../utils/algorithms';
import { Trophy, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface ComparisonTableProps {
  result: SimulationResult | null;
  compareResult: SimulationResult | null;
}

const ComparisonTable = ({ result, compareResult }: ComparisonTableProps) => {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatCost = (cost: number): string => {
    return `₹${cost.toFixed(0)}`;
  };

  const formatFuel = (fuel: number, vehicle: string): string => {
    if (vehicle === 'ev') {
      return `${fuel.toFixed(1)} kWh`;
    }
    return `${fuel.toFixed(1)} L`;
  };

  const getLocationMap = (mapType: string) => {
    const locations = mapLocations[mapType as keyof typeof mapLocations] || [];
    const map: Record<string, string> = {};
    locations.forEach(loc => {
      map[loc.id] = loc.name;
    });
    return map;
  };

  const formatPath = (path: string[], mapType: string): string => {
    const locationMap = getLocationMap(mapType);
    return formatTSPPath(path, locationMap);
  };

  const getBetterAlgorithm = (metric: string, value1: number, value2: number, algorithm1: string, algorithm2: string) => {
    if (!compareResult) return null;
    
    const diff = Math.abs(value1 - value2);
    const threshold = metric === 'totalScore' ? 0.5 : (metric === 'cost' ? 50 : 10);
    
    if (diff < threshold) {
      return { winner: 'tie', icon: Minus, color: 'text-muted-foreground' };
    }
    
    // For most metrics, lower is better
    const lowerIsBetter = ['time', 'distance', 'cost', 'fuel', 'totalScore'].includes(metric);
    const higherIsBetter = ['trafficImpact', 'weatherImpact'].includes(metric) && metric !== 'totalScore';
    
    let winner;
    if (lowerIsBetter) {
      winner = value1 < value2 ? algorithm1 : algorithm2;
    } else if (higherIsBetter) {
      winner = value1 > value2 ? algorithm1 : algorithm2;
    } else {
      winner = value1 < value2 ? algorithm1 : algorithm2;
    }
    
    return {
      winner,
      icon: winner === algorithm1 ? TrendingUp : TrendingDown,
      color: winner === algorithm1 ? 'text-green-600' : 'text-blue-600'
    };
  };

  if (!result) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>TSP Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Run a TSP simulation to see results
          </p>
        </CardContent>
      </Card>
    );
  }

  const showComparison = compareResult !== null;

  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <CardTitle>TSP Algorithm Results</CardTitle>
        {showComparison && (
          <p className="text-sm text-muted-foreground">
            Comparing {result.algorithm} vs {compareResult.algorithm}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* TSP Path Display */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Tour Path</h3>
            <div className="space-y-2">
              <div className="p-3 bg-muted rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{result.algorithm}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {result.path.length - 1} cities
                  </span>
                </div>
                <p className="text-sm font-mono break-all">
                  {formatPath(result.path, 'karnataka')}
                </p>
              </div>
              
              {showComparison && compareResult && (
                <div className="p-3 bg-muted/50 rounded-md border-dashed border-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{compareResult.algorithm}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {compareResult.path.length - 1} cities
                    </span>
                  </div>
                  <p className="text-sm font-mono break-all">
                    {formatPath(compareResult.path, 'karnataka')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Metrics Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">
                  {result.algorithm.charAt(0).toUpperCase() + result.algorithm.slice(1)}
                </TableHead>
                {showComparison && compareResult && (
                  <>
                    <TableHead className="text-right">
                      {compareResult.algorithm.charAt(0).toUpperCase() + compareResult.algorithm.slice(1)}
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Trophy className="h-4 w-4" />
                        Better Algorithm
                      </div>
                    </TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Travel Time</TableCell>
                <TableCell className="text-right font-mono">
                  {formatTime(result.metrics.time)}
                </TableCell>
                {showComparison && compareResult && (
                  <>
                    <TableCell className="text-right font-mono">
                      {formatTime(compareResult.metrics.time)}
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const better = getBetterAlgorithm('time', result.metrics.time, compareResult.metrics.time, result.algorithm, compareResult.algorithm);
                        if (!better) return null;
                        const Icon = better.icon;
                        return (
                          <div className={`flex items-center justify-center gap-1 ${better.color}`}>
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {better.winner === 'tie' ? 'TIE' : better.winner.toUpperCase()}
                            </span>
                          </div>
                        );
                      })()}
                    </TableCell>
                  </>
                )}
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Total Distance</TableCell>
                <TableCell className="text-right font-mono">
                  {formatDistance(result.metrics.distance)}
                </TableCell>
                {showComparison && compareResult && (
                  <>
                    <TableCell className="text-right font-mono">
                      {formatDistance(compareResult.metrics.distance)}
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const better = getBetterAlgorithm('distance', result.metrics.distance, compareResult.metrics.distance, result.algorithm, compareResult.algorithm);
                        if (!better) return null;
                        const Icon = better.icon;
                        return (
                          <div className={`flex items-center justify-center gap-1 ${better.color}`}>
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {better.winner === 'tie' ? 'TIE' : better.winner.toUpperCase()}
                            </span>
                          </div>
                        );
                      })()}
                    </TableCell>
                  </>
                )}
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Total Cost</TableCell>
                <TableCell className="text-right font-mono">
                  {formatCost(result.metrics.cost)}
                </TableCell>
                {showComparison && compareResult && (
                  <>
                    <TableCell className="text-right font-mono">
                      {formatCost(compareResult.metrics.cost)}
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const better = getBetterAlgorithm('cost', result.metrics.cost, compareResult.metrics.cost, result.algorithm, compareResult.algorithm);
                        if (!better) return null;
                        const Icon = better.icon;
                        return (
                          <div className={`flex items-center justify-center gap-1 ${better.color}`}>
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {better.winner === 'tie' ? 'TIE' : better.winner.toUpperCase()}
                            </span>
                          </div>
                        );
                      })()}
                    </TableCell>
                  </>
                )}
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Fuel Consumption</TableCell>
                <TableCell className="text-right font-mono">
                  {formatFuel(result.metrics.fuel, 'car')}
                </TableCell>
                {showComparison && compareResult && (
                  <>
                    <TableCell className="text-right font-mono">
                      {formatFuel(compareResult.metrics.fuel, 'car')}
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const better = getBetterAlgorithm('fuel', result.metrics.fuel, compareResult.metrics.fuel, result.algorithm, compareResult.algorithm);
                        if (!better) return null;
                        const Icon = better.icon;
                        return (
                          <div className={`flex items-center justify-center gap-1 ${better.color}`}>
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {better.winner === 'tie' ? 'TIE' : better.winner.toUpperCase()}
                            </span>
                          </div>
                        );
                      })()}
                    </TableCell>
                  </>
                )}
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Traffic Impact</TableCell>
                <TableCell className="text-right">
                  <Badge variant={result.metrics.trafficImpact > 7 ? 'destructive' : 
                                result.metrics.trafficImpact > 4 ? 'default' : 'secondary'}>
                    {result.metrics.trafficImpact.toFixed(1)}/10
                  </Badge>
                </TableCell>
                {showComparison && compareResult && (
                  <>
                    <TableCell className="text-right">
                      <Badge variant={compareResult.metrics.trafficImpact > 7 ? 'destructive' : 
                                    compareResult.metrics.trafficImpact > 4 ? 'default' : 'secondary'}>
                        {compareResult.metrics.trafficImpact.toFixed(1)}/10
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Minus className="h-4 w-4" />
                        <span className="text-sm font-medium">CONDITION</span>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Weather Impact</TableCell>
                <TableCell className="text-right">
                  <Badge variant={result.metrics.weatherImpact > 7 ? 'destructive' : 
                                result.metrics.weatherImpact > 4 ? 'default' : 'secondary'}>
                    {result.metrics.weatherImpact.toFixed(1)}/10
                  </Badge>
                </TableCell>
                {showComparison && compareResult && (
                  <>
                    <TableCell className="text-right">
                      <Badge variant={compareResult.metrics.weatherImpact > 7 ? 'destructive' : 
                                    compareResult.metrics.weatherImpact > 4 ? 'default' : 'secondary'}>
                        {compareResult.metrics.weatherImpact.toFixed(1)}/10
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Minus className="h-4 w-4" />
                        <span className="text-sm font-medium">CONDITION</span>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>

              <TableRow className="border-t-2">
                <TableCell className="font-bold">Overall Score</TableCell>
                <TableCell className="text-right">
                  <Badge variant={result.metrics.totalScore > 70 ? 'destructive' : 
                                result.metrics.totalScore > 40 ? 'default' : 'secondary'}>
                    {result.metrics.totalScore.toFixed(1)}
                  </Badge>
                </TableCell>
                {showComparison && compareResult && (
                  <>
                    <TableCell className="text-right">
                      <Badge variant={compareResult.metrics.totalScore > 70 ? 'destructive' : 
                                    compareResult.metrics.totalScore > 40 ? 'default' : 'secondary'}>
                        {compareResult.metrics.totalScore.toFixed(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const better = getBetterAlgorithm('totalScore', result.metrics.totalScore, compareResult.metrics.totalScore, result.algorithm, compareResult.algorithm);
                        if (!better) return null;
                        const Icon = better.icon;
                        return (
                          <div className={`flex items-center justify-center gap-1 ${better.color} font-bold`}>
                            <Trophy className="h-4 w-4" />
                            <span className="text-sm font-bold">
                              {better.winner === 'tie' ? 'TIE' : better.winner.toUpperCase()}
                            </span>
                          </div>
                        );
                      })()}
                    </TableCell>
                  </>
                )}
              </TableRow>
            </TableBody>
          </Table>

          {/* Performance Note */}
          <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-md">
            <p><strong>Note:</strong> Lower scores indicate better overall performance.</p>
            <p><strong>Cost:</strong> Includes fuel, driver wages (₹120/hour), and weather surcharges.</p>
            <p><strong>Time:</strong> Based on realistic road speeds and traffic conditions.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonTable;
