
export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export type MapType = 'karnataka' | 'bengaluru' | 'mysuru';

export type Algorithm = 'nearest-neighbor' | 'brute-force' | 'dynamic-programming' | 'branch-and-bound';

export type Weather = 'sunny' | 'rainy' | 'foggy' | 'snowy' | 'windy';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type Vehicle = 'car' | 'bike' | 'truck' | 'ambulance' | 'bus' | 'ev';

export interface SimulationParams {
  algorithm: Algorithm;
  mapType: MapType;
  weather: Weather;
  timeOfDay: TimeOfDay;
  startLocation: string;
  vehicle: Vehicle;
  selectedCities?: string[]; // New field for custom city selection
}

export interface SimulationResult {
  algorithm: Algorithm;
  path: string[];
  metrics: {
    distance: number;
    time: number;
    cost: number;
    fuel: number;
    trafficImpact: number;
    weatherImpact: number;
    totalScore: number;
  };
}

export interface RouteGraph {
  nodes: Record<string, { id: string; lat: number; lng: number }>;
  edges: { from: string; to: string; distance: number; time: number; trafficFactor: number }[];
}
