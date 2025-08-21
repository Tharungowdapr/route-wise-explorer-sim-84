import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { SimulationResult, MapType, Location } from '../types';
import { mapLocations, getMapCenter, getMapZoom } from '../data/maps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Move, Trophy } from 'lucide-react';

// Define custom icons
const startIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
const visitedIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
const cityIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Define MapViewProps interface
interface MapViewProps {
  mapType: MapType;
  result: SimulationResult | null;
  compareResult?: SimulationResult | null;
  startLocation: string;
  showCompare?: boolean;
}

// Draggable Route Info Component
const DraggableRouteInfo = ({
  result,
  compareResult,
  showCompare,
  getLocationName,
  onClose
}: {
  result: SimulationResult;
  compareResult?: SimulationResult | null;
  showCompare?: boolean;
  getLocationName: (id: string) => string;
  onClose: () => void;
}) => {
  const [position, setPosition] = useState({
    x: 20,
    y: 20
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);
  const formatRoute = (path: string[]) => {
    return path.map(id => {
      const cityName = getLocationName(id);
      if (!cityName || cityName === id) {
        console.warn(`City name not found for ID: ${id}`);
        return id;
      }
      return cityName;
    }).join(' → ');
  };
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  const formatDistance = (meters: number) => {
    return `${(meters / 1000).toFixed(1)} km`;
  };
  const formatCost = (cost: number) => {
    return `₹${cost.toFixed(0)}`;
  };

  // Fixed winner determination logic with proper threshold
  const getWinner = () => {
    if (!compareResult) return null;
    
    const mainScore = result.metrics.totalScore;
    const compareScore = compareResult.metrics.totalScore;
    
    console.log("Comparing scores - Main:", mainScore, "Compare:", compareScore);
    
    const scoreDiff = Math.abs(mainScore - compareScore);
    
    // Only show tie if difference is very small (less than 0.5 points)
    if (scoreDiff < 0.5) {
      return {
        algorithm: 'tie',
        difference: '0.0'
      };
    }
    
    // Lower score wins (better performance)
    if (mainScore < compareScore) {
      return {
        algorithm: result.algorithm,
        difference: (compareScore - mainScore).toFixed(1)
      };
    } else {
      return {
        algorithm: compareResult.algorithm,
        difference: (mainScore - compareScore).toFixed(1)
      };
    }
  };
  const winner = getWinner();
  return <div ref={dragRef} className="fixed z-[2000] select-none" style={{
    left: `${position.x}px`,
    top: `${position.y}px`,
    cursor: isDragging ? 'grabbing' : 'grab'
  }}>
      <Card className="backdrop-blur-sm border-2 border-primary/20 shadow-2xl max-w-sm bg-card">
        <CardHeader className="pb-2 cursor-move bg-primary/5 rounded-t-lg" onMouseDown={handleMouseDown}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Move className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold text-primary">TSP Route Analysis</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-primary/20" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? '□' : '−'}
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-destructive/20 text-destructive" onClick={onClose}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && <CardContent className="p-4 space-y-4">
            {/* Winner Display */}
            {showCompare && compareResult && winner && <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-amber-600" />
                  <span className="font-bold text-amber-800 dark:text-amber-200">Algorithm Winner</span>
                </div>
                {winner.algorithm === 'tie' ? <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                    🤝 It's a TIE! Both algorithms performed equally well.
                  </p> : <p className="text-sm text-amber-700 dark:text-amber-300">
                    🏆 <span className="font-bold uppercase">{winner.algorithm}</span> wins by{' '}
                    <span className="font-bold">{winner.difference} points</span>
                    <br />
                    <span className="text-xs">Better overall efficiency and performance</span>
                  </p>}
              </div>}

            {/* Main Algorithm Results */}
            <div className="space-y-3">
              <h3 className="font-semibold text-primary border-b border-primary/20 pb-1">
                {result.algorithm.toUpperCase()} Algorithm
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div><strong>Cities:</strong> {result.path.length - 1}</div>
                  <div><strong>Distance:</strong> {formatDistance(result.metrics.distance)}</div>
                </div>
                <div className="space-y-1">
                  <div><strong>Time:</strong> {formatTime(result.metrics.time)}</div>
                  <div><strong>Cost:</strong> {formatCost(result.metrics.cost)}</div>
                </div>
              </div>
              <div className="mt-3">
                <strong className="text-xs">Route Path:</strong>
                <div className="text-xs text-muted-foreground mt-1 p-2 bg-muted/50 rounded border-l-2 border-primary/30 max-h-20 overflow-y-auto">
                  {formatRoute(result.path)}
                </div>
              </div>
              <div className="text-xs">
                <strong>Efficiency Score:</strong> 
                <span className="ml-1 text-primary font-bold">{result.metrics.totalScore.toFixed(1)}/100</span>
                <span className="text-xs text-muted-foreground ml-1">(lower is better)</span>
              </div>
            </div>

            {/* Comparison Results */}
            {showCompare && compareResult && <div className="border-t pt-3 space-y-3">
                <h3 className="font-semibold text-green-600 border-b border-green-600/20 pb-1">
                  {compareResult.algorithm.toUpperCase()} Comparison
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div><strong>Cities:</strong> {compareResult.path.length - 1}</div>
                    <div><strong>Distance:</strong> {formatDistance(compareResult.metrics.distance)}</div>
                  </div>
                  <div className="space-y-1">
                    <div><strong>Time:</strong> {formatTime(compareResult.metrics.time)}</div>
                    <div><strong>Cost:</strong> {formatCost(compareResult.metrics.cost)}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <strong className="text-xs">Route Path:</strong>
                  <div className="text-xs text-muted-foreground mt-1 p-2 bg-green-50 dark:bg-green-950 rounded border-l-2 border-green-600/30 max-h-20 overflow-y-auto">
                    {formatRoute(compareResult.path)}
                  </div>
                </div>
                <div className="text-xs">
                  <strong>Efficiency Score:</strong> 
                  <span className="ml-1 text-green-600 font-bold">{compareResult.metrics.totalScore.toFixed(1)}/100</span>
                  <span className="text-xs text-muted-foreground ml-1">(lower is better)</span>
                </div>
              </div>}
          </CardContent>}
      </Card>
    </div>;
};

// Get route coordinates from path
const getRouteCoordinates = (path: string[], locations: Location[]): [number, number][] => {
  if (!path || !locations || path.length === 0) {
    console.log("No path or locations provided");
    return [];
  }
  console.log("Converting path to coordinates:", path);
  const coordinates = path.map(locationId => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) {
      console.warn(`Location not found for ID: ${locationId}`);
      return null;
    }
    return [location.lat, location.lng] as [number, number];
  }).filter((coord): coord is [number, number] => coord !== null);
  console.log("Route coordinates:", coordinates);
  return coordinates;
};

// MapUpdater component
const MapUpdater = ({
  mapType,
  result
}: {
  mapType: MapType;
  result: SimulationResult | null;
}) => {
  const map = useMap();
  useEffect(() => {
    const center = getMapCenter(mapType);
    const zoom = getMapZoom(mapType);
    map.setView(center, zoom);
  }, [map, mapType]);
  return null;
};
const MapView = ({
  mapType,
  result,
  compareResult,
  startLocation,
  showCompare = false
}: MapViewProps) => {
  const [initialized, setInitialized] = useState(false);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [compareRoutePath, setCompareRoutePath] = useState<[number, number][]>([]);
  const [showRouteInfo, setShowRouteInfo] = useState(true);
  const mapRef = useRef(null);
  const center = getMapCenter(mapType);
  const zoom = getMapZoom(mapType);
  const locations = mapLocations[mapType] || [];

  // Update route when result changes
  useEffect(() => {
    console.log("Result changed:", result);
    if (result && result.path.length > 0 && locations.length > 0) {
      const coordinates = getRouteCoordinates(result.path, locations);
      console.log("Setting main route coordinates:", coordinates);
      setRoutePath(coordinates);
      setShowRouteInfo(true); // Show info window when new result is available
    } else {
      console.log("Clearing main route");
      setRoutePath([]);
      setShowRouteInfo(false);
    }
    if (showCompare && compareResult && compareResult.path.length > 0 && locations.length > 0) {
      const compareCoordinates = getRouteCoordinates(compareResult.path, locations);
      console.log("Setting compare route coordinates:", compareCoordinates);
      setCompareRoutePath(compareCoordinates);
    } else {
      console.log("Clearing compare route");
      setCompareRoutePath([]);
    }
  }, [result, compareResult, mapType, locations, showCompare]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Get step number for a location
  const getStepNumber = (locationId: string, path: string[]): number => {
    return path.indexOf(locationId) + 1;
  };

  // Get location name by ID
  const getLocationName = (locationId: string): string => {
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : locationId;
  };
  if (!initialized) {
    return <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">Loading map...</div>;
  }
  return <div className="w-full h-full rounded-lg overflow-hidden border border-border relative">
      {initialized && <MapContainer ref={mapRef} center={center} zoom={zoom} style={{
      height: "100%",
      width: "100%"
    }}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          <MapUpdater mapType={mapType} result={result} />
          
          {/* Place markers for all locations */}
          {locations.map(location => {
        let icon = cityIcon;
        let popupInfo = "";
        if (location.id === startLocation) {
          icon = startIcon;
          popupInfo = "Start/End Point";
        } else if (result && result.path.includes(location.id)) {
          icon = visitedIcon;
          const stepNum = getStepNumber(location.id, result.path);
          popupInfo = `Step ${stepNum} in route`;
        }
        return <Marker key={location.id} position={[location.lat, location.lng]} icon={icon}>
                <Popup>
                  <div className="text-center">
                    <strong>{location.name}</strong>
                    {popupInfo && <div className="text-sm text-green-600 mt-1">{popupInfo}</div>}
                    {result && result.path.includes(location.id) && <div className="text-xs text-muted-foreground mt-1">
                        Part of {result.algorithm} tour
                      </div>}
                  </div>
                </Popup>
              </Marker>;
      })}
          
          {/* Draw main route with high visibility colors */}
          {routePath.length > 1 && <Polyline key={`main-route-${result?.algorithm}-${routePath.length}`} positions={routePath} color="#FF0000" weight={6} opacity={1.0} />}

          {/* Draw comparison route with contrasting high visibility color */}
          {showCompare && compareRoutePath.length > 1 && <Polyline key={`compare-route-${compareResult?.algorithm}-${compareRoutePath.length}`} positions={compareRoutePath} color="#00FF00" weight={6} opacity={0.9} dashArray="15,10" />}
        </MapContainer>}

      {/* Draggable Route Info Window */}
      {result && result.path.length > 0 && showRouteInfo && <DraggableRouteInfo result={result} compareResult={compareResult} showCompare={showCompare} getLocationName={getLocationName} onClose={() => setShowRouteInfo(false)} />}
    </div>;
};
export default MapView;
