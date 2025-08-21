import { Location, MapType, RouteGraph } from "../types";

// Extended location coordinates for Karnataka, India with more cities
export const mapLocations: Record<MapType, Location[]> = {
  karnataka: [
    { id: "k1", name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
    { id: "k2", name: "Mysuru", lat: 12.2958, lng: 76.6394 },
    { id: "k3", name: "Mangaluru", lat: 12.9141, lng: 74.8560 },
    { id: "k4", name: "Hubli", lat: 15.3647, lng: 75.1240 },
    { id: "k5", name: "Belagavi", lat: 15.8497, lng: 74.4977 },
    { id: "k6", name: "Kalaburagi", lat: 17.3297, lng: 76.8343 },
    { id: "k7", name: "Davangere", lat: 14.4644, lng: 75.9932 },
    { id: "k8", name: "Ballari", lat: 15.1394, lng: 76.9214 },
    { id: "k9", name: "Tumakuru", lat: 13.3379, lng: 77.1140 },
    { id: "k10", name: "Shimoga", lat: 13.9299, lng: 75.5681 },
    { id: "k11", name: "Hassan", lat: 13.0033, lng: 76.0955 },
    { id: "k12", name: "Mandya", lat: 12.5218, lng: 76.8951 },
    { id: "k13", name: "Chikmagalur", lat: 13.3161, lng: 75.7720 },
    { id: "k14", name: "Raichur", lat: 16.2120, lng: 77.3439 },
    { id: "k15", name: "Bijapur", lat: 16.8302, lng: 75.7100 },
  ],
  bengaluru: [
    { id: "b1", name: "Majestic", lat: 12.9762, lng: 77.5993 },
    { id: "b2", name: "Koramangala", lat: 12.9279, lng: 77.6271 },
    { id: "b3", name: "Indiranagar", lat: 12.9719, lng: 77.6412 },
    { id: "b4", name: "Whitefield", lat: 12.9698, lng: 77.7500 },
    { id: "b5", name: "Electronic City", lat: 12.8456, lng: 77.6603 },
    { id: "b6", name: "Hebbal", lat: 13.0358, lng: 77.5970 },
    { id: "b7", name: "Jayanagar", lat: 12.9279, lng: 77.5937 },
    { id: "b8", name: "Malleshwaram", lat: 13.0030, lng: 77.5747 },
    { id: "b9", name: "BTM Layout", lat: 12.9165, lng: 77.6101 },
    { id: "b10", name: "Sarjapur", lat: 12.8795, lng: 77.6898 },
  ],
  mysuru: [
    { id: "m1", name: "Mysuru Palace", lat: 12.3051, lng: 76.6551 },
    { id: "m2", name: "Chamundi Hills", lat: 12.2724, lng: 76.6730 },
    { id: "m3", name: "KRS Dam", lat: 12.4244, lng: 76.5692 },
    { id: "m4", name: "Brindavan Gardens", lat: 12.4244, lng: 76.5692 },
    { id: "m5", name: "Mysuru Zoo", lat: 12.3009, lng: 76.6543 },
    { id: "m6", name: "Lalitha Mahal", lat: 12.2830, lng: 76.6390 },
    { id: "m7", name: "Karanji Lake", lat: 12.3167, lng: 76.6594 },
  ],
};

// Calculate more realistic road distance
const calculateRoadDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
           Math.cos(φ1) * Math.cos(φ2) *
           Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;

  // Realistic road factor for Karnataka
  const roadFactor = 1.2 + Math.random() * 0.1; // 1.2 to 1.3 times straight distance
  return straightDistance * roadFactor;
};

// Calculate realistic travel time
const calculateTravelTime = (distance: number, mapType: MapType, fromLat: number, toLat: number): number => {
  // Real average speeds in Karnataka
  const baseSpeedByMapType: Record<MapType, number> = {
    karnataka: 70, // Good highways in Karnataka
    bengaluru: 30, // City traffic
    mysuru: 50, // Medium city speeds
  };

  let baseSpeed = baseSpeedByMapType[mapType];
  
  // Small adjustments for terrain
  const isHillRoute = Math.abs(fromLat - toLat) > 1.0;
  const isCoastalRoute = toLat < 13.5;
  
  if (isHillRoute) {
    baseSpeed *= 0.9; // Slightly slower for hills
  }
  if (isCoastalRoute) {
    baseSpeed *= 0.95; // Slightly slower for coastal roads
  }

  // Minimal traffic variation
  const trafficVariation = 0.9 + Math.random() * 0.2; // 90% to 110% of base speed
  const actualSpeed = baseSpeed * trafficVariation;

  // Calculate time in seconds
  const timeInHours = (distance / 1000) / actualSpeed;
  return timeInHours * 3600; // Convert to seconds
};

// Generate route graphs with realistic connections
export const getRouteGraph = (mapType: MapType): RouteGraph => {
  console.log("Generating route graph for:", mapType);
  const locations = mapLocations[mapType];
  const nodes: Record<string, { id: string; lat: number; lng: number }> = {};
  const edges: { from: string; to: string; distance: number; time: number; trafficFactor: number }[] = [];

  // Add all locations as nodes
  locations.forEach((loc) => {
    nodes[loc.id] = {
      id: loc.id,
      lat: loc.lat,
      lng: loc.lng,
    };
  });

  // Create FULLY CONNECTED graph with realistic traffic factors
  for (let i = 0; i < locations.length; i++) {
    for (let j = 0; j < locations.length; j++) {
      if (i !== j) {
        const loc1 = locations[i];
        const loc2 = locations[j];
        
        const distance = calculateRoadDistance(loc1.lat, loc1.lng, loc2.lat, loc2.lng);
        const baseTime = calculateTravelTime(distance, mapType, loc1.lat, loc2.lat);
        
        // Realistic traffic factors
        let trafficFactor = 1.0;
        
        if (mapType === 'bengaluru') {
          trafficFactor = 1.3 + Math.random() * 0.4; // City traffic
        } else if (mapType === 'karnataka') {
          const isLongDistance = distance > 150000; // 150km+
          const isShortDistance = distance < 50000;  // 50km-
          
          if (isLongDistance) {
            trafficFactor = 1.0 + Math.random() * 0.1; // Good highways
          } else if (isShortDistance) {
            trafficFactor = 1.1 + Math.random() * 0.2; // Local roads
          } else {
            trafficFactor = 1.05 + Math.random() * 0.15; // State highways
          }
        } else if (mapType === 'mysuru') {
          trafficFactor = 1.1 + Math.random() * 0.2; // Medium city traffic
        }

        // Apply minimal traffic factor
        const time = baseTime * trafficFactor;

        edges.push({
          from: loc1.id,
          to: loc2.id,
          distance,
          time,
          trafficFactor,
        });
      }
    }
  }

  console.log(`Generated graph with ${Object.keys(nodes).length} nodes and ${edges.length} edges`);
  return { nodes, edges };
};

// Get map center coordinates
export const getMapCenter = (mapType: MapType): [number, number] => {
  switch (mapType) {
    case 'karnataka':
      return [14.5204, 75.7224];
    case 'bengaluru':
      return [12.9716, 77.5946];
    case 'mysuru':
      return [12.2958, 76.6394];
    default:
      return [12.9716, 77.5946];
  }
};

// Get initial zoom level
export const getMapZoom = (mapType: MapType): number => {
  switch (mapType) {
    case 'karnataka':
      return 7;
    case 'bengaluru':
      return 11;
    case 'mysuru':
      return 12;
    default:
      return 11;
  }
};
