import React, { useEffect, useState, useRef } from 'react';
import { SimulationResult, MapType, Location } from '../types';
import { mapLocations, getMapCenter } from '../data/maps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Zap, Clock, TrendingUp, AlertCircle, Route, ArrowRight } from 'lucide-react';
import { GeminiService, GeminiRouteData } from '../services/geminiService';
import { Badge } from '@/components/ui/badge';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// @ts-ignore
import 'leaflet-routing-machine';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GeminiMapViewProps {
  mapType: MapType;
  result: SimulationResult | null;
  compareResult?: SimulationResult | null;
  startLocation: string;
  showCompare?: boolean;
}

const ApiKeyInput = ({ onApiKeySet }: { onApiKeySet: (key: string) => void }) => {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState(localStorage.getItem('gemini-api-key') || '');

  const handleSubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini-api-key', apiKey.trim());
      setSavedKey(apiKey.trim());
      onApiKeySet(apiKey.trim());
    }
  };

  const handleUseSaved = () => {
    if (savedKey) {
      onApiKeySet(savedKey);
    }
  };

  return (
    <Card className="m-4 max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Gemini API Key Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          To use Gemini AI for real-time route optimization, please enter your API key. You can get one from{' '}
          <a 
            href="https://makersuite.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google AI Studio
          </a>
        </div>
        
        {savedKey && (
          <div className="space-y-2">
            <div className="text-sm text-green-600">Found saved API key</div>
            <Button onClick={handleUseSaved} className="w-full">
              Use Saved Key
            </Button>
            <div className="text-center text-sm text-muted-foreground">or enter a new one</div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="api-key">Gemini API Key</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Enter your Gemini API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <Button onClick={handleSubmit} disabled={!apiKey.trim()} className="w-full">
          Set API Key & Enable AI Optimization
        </Button>
      </CardContent>
    </Card>
  );
};

const GeminiMapView = ({ mapType, result, compareResult, startLocation, showCompare = false }: GeminiMapViewProps) => {
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('gemini-api-key'));
  const [geminiData, setGeminiData] = useState<GeminiRouteData | null>(null);
  const [trafficData, setTrafficData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showingRealRoads, setShowingRealRoads] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const routingControlRef = useRef<any>(null);
  const compareRoutingControlRef = useRef<any>(null);

  const locations = mapLocations[mapType] || [];
  const centerCoords = getMapCenter(mapType);

  // Store Gemini data globally for analysis page
  useEffect(() => {
    if (geminiData) {
      localStorage.setItem('gemini-data', JSON.stringify(geminiData));
    }
    if (trafficData) {
      localStorage.setItem('traffic-data', JSON.stringify(trafficData));
    }
  }, [geminiData, trafficData]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map with satellite view
    const map = L.map(mapRef.current, {
      center: [centerCoords[0], centerCoords[1]],
      zoom: 7,
      zoomControl: true,
    });

    // Add satellite tile layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18,
    }).addTo(map);

    // Add labels overlay
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      attribution: '',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;
    routeLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      if (routingControlRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current);
      }
      if (compareRoutingControlRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeControl(compareRoutingControlRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerCoords]);

  // Create numbered sequence markers
  const createSequenceMarker = (position: number, cityId: string, color: string, isComparison: boolean = false) => {
    const location = locations.find(loc => loc.id === cityId);
    if (!location) return null;

    const isStart = position === 1;
    const isEnd = result && position === result.path.length;
    
    let displayNumber = position;
    if (isEnd && result && result.path.length > 2) {
      displayNumber = 1; // Show 1 for return to start
    }

    const markerHtml = `
      <div style="
        background-color: ${color}; 
        width: 28px; 
        height: 28px; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        color: white;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
        ${isComparison ? 'opacity: 0.85; border-width: 2px;' : ''}
        ${isStart || isEnd ? 'border-width: 4px; transform: scale(1.1);' : ''}
      ">${displayNumber}</div>
    `;

    const icon = L.divIcon({
      html: markerHtml,
      className: 'sequence-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const statusText = isStart ? 'Start' : isEnd ? 'End (Return to Start)' : `Stop ${displayNumber}`;
    const algorithmText = isComparison ? 'Comparison Route' : 'Primary Route';

    return L.marker([location.lat, location.lng], { icon })
      .bindPopup(`
        <div style="font-size: 13px;">
          <strong>${location.name}</strong><br/>
          <span style="color: ${color}; font-weight: bold;">${algorithmText}</span><br/>
          ${statusText}
        </div>
      `);
  };

  // Algorithm-specific routing profiles for VERY different routes
  const getAlgorithmRoutingProfile = (algorithm: string, isComparison: boolean) => {
    const profiles = {
      'brute-force': {
        primary: { avoidHighways: false, avoidTolls: false, avoidFerries: false },
        comparison: { avoidHighways: true, avoidTolls: true, avoidFerries: true }
      },
      'dynamic-programming': {
        primary: { avoidHighways: true, avoidTolls: false, avoidFerries: false },
        comparison: { avoidHighways: false, avoidTolls: false, avoidFerries: true }
      },
      'nearest-neighbor': {
        primary: { avoidHighways: false, avoidTolls: true, avoidFerries: false },
        comparison: { avoidHighways: true, avoidTolls: false, avoidFerries: false }
      },
      'branch-and-bound': {
        primary: { avoidHighways: false, avoidTolls: false, avoidFerries: true },
        comparison: { avoidHighways: true, avoidTolls: true, avoidFerries: false }
      }
    };

    const profile = profiles[algorithm as keyof typeof profiles] || profiles['nearest-neighbor'];
    return isComparison ? profile.comparison : profile.primary;
  };

  // Enhanced function to create road-based routes
  const createRoadRoute = (waypoints: L.LatLng[], color: string, isDashed: boolean = false, algorithm: string = 'nearest-neighbor') => {
    if (!mapInstanceRef.current || waypoints.length < 2) return;

    const routingProfile = getAlgorithmRoutingProfile(algorithm, isDashed);

    // Create routing control with algorithm-specific options
    const routingControl = (L as any).Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      createMarker: () => null, // We'll create our own sequence markers
      lineOptions: {
        styles: [{
          color: color,
          weight: isDashed ? 4 : 6,
          opacity: isDashed ? 0.8 : 0.9,
          dashArray: isDashed ? '12, 8' : undefined
        }]
      },
      router: (L as any).Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving',
        ...routingProfile
      }),
      show: false,
      collapsible: false,
    }).addTo(mapInstanceRef.current);

    // Store routing control reference
    if (isDashed) {
      compareRoutingControlRef.current = routingControl;
    } else {
      routingControlRef.current = routingControl;
    }

    return routingControl;
  };

  // Enhanced map update with sequence display
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;

    console.log('Updating map with routes and sequences:', { 
      primaryResult: result?.path.length, 
      compareResult: compareResult?.path.length,
      showingRealRoads,
      primaryAlgorithm: result?.algorithm,
      compareAlgorithm: compareResult?.algorithm
    });

    // Clear existing layers
    routeLayerRef.current.clearLayers();

    // Remove existing routing controls
    if (routingControlRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    if (compareRoutingControlRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeControl(compareRoutingControlRef.current);
      compareRoutingControlRef.current = null;
    }

    // Add primary route sequence markers
    if (result && result.path.length > 1) {
      result.path.forEach((cityId, index) => {
        const marker = createSequenceMarker(index + 1, cityId, '#ef4444', false);
        if (marker) {
          routeLayerRef.current!.addLayer(marker);
        }
      });

      // Create route
      const waypoints = result.path.map(cityId => {
        const location = locations.find(loc => loc.id === cityId);
        return location ? L.latLng(location.lat, location.lng) : null;
      }).filter(coord => coord !== null) as L.LatLng[];

      if (waypoints.length > 1) {
        if (showingRealRoads) {
          createRoadRoute(waypoints, '#ef4444', false, result.algorithm);
        } else {
          // Direct polyline
          const routeCoords = waypoints.map(wp => [wp.lat, wp.lng] as [number, number]);
          L.polyline(routeCoords, {
            color: '#ef4444',
            weight: 6,
            opacity: 0.9,
          }).addTo(routeLayerRef.current!);
        }
      }
    }

    // Add comparison route sequence markers
    if (showCompare && compareResult && compareResult.path.length > 1) {
      setTimeout(() => {
        compareResult.path.forEach((cityId, index) => {
          const marker = createSequenceMarker(index + 1, cityId, '#22c55e', true);
          if (marker) {
            routeLayerRef.current!.addLayer(marker);
          }
        });

        // Create comparison route
        const compareWaypoints = compareResult.path.map(cityId => {
          const location = locations.find(loc => loc.id === cityId);
          return location ? L.latLng(location.lat, location.lng) : null;
        }).filter(coord => coord !== null) as L.LatLng[];

        if (compareWaypoints.length > 1) {
          if (showingRealRoads) {
            createRoadRoute(compareWaypoints, '#22c55e', true, compareResult.algorithm);
          } else {
            // Direct polyline
            const compareCoords = compareWaypoints.map(wp => [wp.lat, wp.lng] as [number, number]);
            L.polyline(compareCoords, {
              color: '#22c55e',
              weight: 5,
              opacity: 0.8,
              dashArray: '12, 8',
            }).addTo(routeLayerRef.current!);
          }
        }
      }, 1000);
    }

    // Add unvisited city markers
    locations.forEach((location) => {
      const isPrimaryVisited = result?.path.includes(location.id);
      const isCompareVisited = compareResult?.path.includes(location.id);
      
      if (!isPrimaryVisited && !isCompareVisited) {
        const icon = L.divIcon({
          html: `<div style="
            background-color: #64748b; 
            width: 12px; 
            height: 12px; 
            border-radius: 50%; 
            border: 2px solid white; 
            box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            opacity: 0.6;
          "></div>`,
          className: 'unvisited-marker',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const marker = L.marker([location.lat, location.lng], { icon })
          .bindPopup(`<strong>${location.name}</strong><br/>Not visited in current routes`)
          .addTo(routeLayerRef.current!);
      }
    });

    // Fit map to show all relevant locations
    if (result && result.path.length > 0) {
      const pathLocations = result.path.map(cityId => 
        locations.find(loc => loc.id === cityId)
      ).filter(loc => loc !== null);
      
      if (pathLocations.length > 0) {
        const bounds = L.latLngBounds(pathLocations.map(loc => [loc!.lat, loc!.lng]));
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }

  }, [result, compareResult, locations, startLocation, showCompare, showingRealRoads]);

  // Hide routing instructions globally
  useEffect(() => {
    const hideRoutingInstructions = () => {
      const containers = document.querySelectorAll('.leaflet-routing-container, .leaflet-control-container .leaflet-routing-container, .leaflet-routing-alt');
      containers.forEach(container => {
        (container as HTMLElement).style.display = 'none !important';
        (container as HTMLElement).style.visibility = 'hidden !important';
        (container as HTMLElement).style.position = 'absolute !important';
        (container as HTMLElement).style.left = '-9999px !important';
        (container as HTMLElement).style.top = '-9999px !important';
        (container as HTMLElement).style.width = '0 !important';
        (container as HTMLElement).style.height = '0 !important';
        (container as HTMLElement).style.overflow = 'hidden !important';
      });
    };

    hideRoutingInstructions();
    const interval = setInterval(hideRoutingInstructions, 500);

    return () => clearInterval(interval);
  }, []);

  // Fetch real-time data when result changes
  useEffect(() => {
    if (!apiKey || !result || !result.path.length) return;

    const fetchGeminiData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const gemini = new GeminiService(apiKey);
        const cityNames = result.path.slice(0, -1).map(cityId => {
          const city = locations.find(loc => loc.id === cityId);
          return city ? city.name : cityId;
        });

        const [routeData, traffic] = await Promise.all([
          gemini.optimizeRoute(cityNames, 'car', 'sunny', 'afternoon'),
          gemini.getRealTimeTrafficData(cityNames)
        ]);

        setGeminiData(routeData);
        setTrafficData(traffic);
      } catch (err) {
        console.error('Gemini fetch error:', err);
        setError('Failed to fetch real-time data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGeminiData();
  }, [apiKey, result, mapType]);

  if (!apiKey) {
    return <ApiKeyInput onApiKeySet={setApiKey} />;
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border relative">
      <div 
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
      
      {/* Route Toggle Button */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Button
          onClick={() => setShowingRealRoads(!showingRealRoads)}
          variant="outline"
          size="sm"
          className="bg-card/95 backdrop-blur-sm"
        >
          <Route className="h-4 w-4 mr-2" />
          {showingRealRoads ? 'Real Roads' : 'Direct Lines'}
        </Button>
      </div>

      {/* Sequence Display Panel */}
      {result && result.path.length > 1 && (
        <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 max-w-sm z-[1000]">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="h-4 w-4 text-red-500" />
            <span className="font-semibold text-sm">Visit Sequence</span>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs font-medium text-red-500">
              Primary: {result.algorithm.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
            <div className="text-xs space-y-0.5">
              {result.path.slice(0, -1).map((cityId, index) => {
                const city = locations.find(loc => loc.id === cityId);
                const isStart = index === 0;
                return (
                  <div key={`${cityId}-${index}`} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span className="text-xs">
                      {city?.name || cityId} {isStart && '(Start)'}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>Return to Start</span>
              </div>
            </div>

            {showCompare && compareResult && compareResult.path.length > 1 && (
              <>
                <div className="border-t pt-2 mt-2">
                  <div className="text-xs font-medium text-green-500">
                    Compare: {compareResult.algorithm.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-xs space-y-0.5">
                    {compareResult.path.slice(0, -1).map((cityId, index) => {
                      const city = locations.find(loc => loc.id === cityId);
                      const isStart = index === 0;
                      return (
                        <div key={`compare-${cityId}-${index}`} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <span className="text-xs">
                            {city?.name || cityId} {isStart && '(Start)'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[1000]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <div>Loading AI-powered real-time data...</div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 right-4 bg-destructive/10 text-destructive p-3 rounded-lg border border-destructive/20 z-[1000]">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Traffic data panel */}
      {trafficData && (
        <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 max-w-xs z-[1000]">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-green-500" />
            <span className="font-semibold text-sm">Live Traffic</span>
          </div>
          
          <div className="text-xs space-y-1">
            {Object.entries(trafficData.trafficData).slice(0, 3).map(([city, data]: [string, any]) => (
              <div key={city} className="flex justify-between items-center">
                <span className="truncate">{city}:</span>
                <Badge 
                  variant={data.congestion > 0.7 ? "destructive" : data.congestion > 0.4 ? "secondary" : "default"}
                  className="text-xs ml-1"
                >
                  {Math.round(data.congestion * 100)}%
                </Badge>
              </div>
            ))}
            <div className="pt-1 text-xs text-muted-foreground border-t">
              Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Map Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 z-[1000]">
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold border-2 border-white">1</div>
            <span>Primary Route Sequence</span>
          </div>
          {showCompare && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold border-2 border-white">1</div>
              <span>Compare Route Sequence</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-500 opacity-60"></div>
            <span>Unvisited Cities</span>
          </div>
          
          {result && (
            <div className="flex items-center gap-2 border-t pt-1">
              <div className="w-6 h-1 bg-red-500"></div>
              <span className="text-xs">Primary: {result.algorithm}</span>
            </div>
          )}
          {showCompare && compareResult && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-green-500 border-dashed border border-green-500"></div>
              <span className="text-xs">Compare: {compareResult.algorithm}</span>
            </div>
          )}
          
          <div className="border-t pt-1 text-xs text-muted-foreground">
            Click markers to see city details
          </div>
        </div>
      </div>

      {/* Hide routing instructions completely */}
      <style>
        {`
          .leaflet-routing-container,
          .leaflet-routing-alt,
          .leaflet-control-container .leaflet-routing-container,
          .leaflet-routing-geocoders,
          .leaflet-routing-alternatives-container {
            display: none !important;
            visibility: hidden !important;
            position: absolute !important;
            left: -9999px !important;
            top: -9999px !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
            pointer-events: none !important;
          }
          .sequence-marker {
            pointer-events: auto;
            z-index: 1000;
          }
          .unvisited-marker {
            pointer-events: auto;
            z-index: 999;
          }
        `}
      </style>
    </div>
  );
};

export default GeminiMapView;
