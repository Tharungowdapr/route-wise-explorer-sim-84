
import { Node, Edge } from 'reactflow';
import { Algorithm, SimulationResult } from '../types';

// Convert ReactFlow nodes and edges to our graph structure
interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  population?: number;
  importance?: number;
  trafficLevel?: number;
}

interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  roadType?: 'highway' | 'city' | 'rural';
  trafficFactor?: number;
  weatherImpact?: number;
}

interface Graph {
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
  adjacencyMatrix: number[][];
  nodeIndices: Record<string, number>;
  indexToNode: Record<number, string>;
}

// Real-world factors for TSP optimization
const ROAD_TYPE_MULTIPLIERS = {
  highway: 0.8,
  city: 1.2,
  rural: 1.0
};

const TRAFFIC_MULTIPLIERS = {
  low: 1.0,
  medium: 1.3,
  high: 1.6
};

const WEATHER_MULTIPLIERS = {
  sunny: 1.0,
  rainy: 1.4,
  foggy: 1.3,
  snowy: 1.8
};

const TIME_OF_DAY_MULTIPLIERS = {
  morning: 1.2,
  afternoon: 1.0,
  evening: 1.3,
  night: 0.9
};

// Convert ReactFlow data to graph structure with adjacency matrix
const convertToGraph = (nodes: Node[], edges: Edge[]): Graph => {
  const graphNodes: Record<string, GraphNode> = {};
  const graphEdges: GraphEdge[] = [];
  const nodeIndices: Record<string, number> = {};
  const indexToNode: Record<number, string> = {};

  // Build node mappings with real-world properties
  nodes.forEach((node, index) => {
    const label = node.data.label as string;
    graphNodes[node.id] = {
      id: node.id,
      label,
      x: node.position.x,
      y: node.position.y,
      population: Math.floor(Math.random() * 1000000) + 50000, // Random population 50k-1M
      importance: Math.random() * 100, // Economic importance score
      trafficLevel: Math.random() * 3 // Traffic level 0-3
    };
    nodeIndices[node.id] = index;
    indexToNode[index] = node.id;
  });

  // Create adjacency matrix
  const n = nodes.length;
  const adjacencyMatrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(Infinity));
  
  // Fill diagonal with 0
  for (let i = 0; i < n; i++) {
    adjacencyMatrix[i][i] = 0;
  }

  // Process edges with real-world factors
  edges.forEach(edge => {
    const baseWeight = parseInt(edge.label as string) || calculateEuclideanDistance(
      graphNodes[edge.source], 
      graphNodes[edge.target]
    );
    
    // Add real-world factors to edge weight
    const roadTypes: ('highway' | 'city' | 'rural')[] = ['highway', 'city', 'rural'];
    const roadType = roadTypes[Math.floor(Math.random() * roadTypes.length)];
    const trafficFactor = Math.random() * 2 + 0.5; // 0.5 to 2.5
    const weatherImpact = Math.random() * 0.5 + 1; // 1.0 to 1.5
    
    const realWorldWeight = baseWeight * 
      ROAD_TYPE_MULTIPLIERS[roadType] * 
      trafficFactor * 
      weatherImpact;

    const fromIndex = nodeIndices[edge.source];
    const toIndex = nodeIndices[edge.target];
    
    if (fromIndex !== undefined && toIndex !== undefined) {
      adjacencyMatrix[fromIndex][toIndex] = realWorldWeight;
      adjacencyMatrix[toIndex][fromIndex] = realWorldWeight; // Make bidirectional
      
      graphEdges.push({
        from: edge.source,
        to: edge.target,
        weight: realWorldWeight,
        roadType,
        trafficFactor,
        weatherImpact
      });
      graphEdges.push({
        from: edge.target,
        to: edge.source,
        weight: realWorldWeight,
        roadType,
        trafficFactor,
        weatherImpact
      });
    }
  });

  return { 
    nodes: graphNodes, 
    edges: graphEdges, 
    adjacencyMatrix,
    nodeIndices,
    indexToNode
  };
};

// Calculate Euclidean distance between two nodes with real-world scaling
const calculateEuclideanDistance = (node1: GraphNode, node2: GraphNode): number => {
  const dx = node1.x - node2.x;
  const dy = node1.y - node2.y;
  // Scale to approximate real kilometers (assuming canvas units represent relative distances)
  return Math.sqrt(dx * dx + dy * dy) * 0.1; // Scale factor for realism
};

// Enhanced TSP algorithms with real-world considerations

// TSP Brute Force algorithm with real-world optimization
const bruteForce = (graph: Graph, start: string, conditions?: any): { path: string[]; distance: number; time: number } => {
  console.log('Running Enhanced Brute Force TSP with real-world factors');
  const allNodes = Object.keys(graph.nodes);
  
  if (allNodes.length < 2) {
    return { path: [start], distance: 0, time: 0 };
  }

  const otherNodes = allNodes.filter(node => node !== start);
  let bestPath: string[] = [];
  let bestDistance = Infinity;
  
  // Generate all permutations
  const permute = (arr: string[]): string[][] => {
    if (arr.length <= 1) return [arr];
    const result: string[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = arr.slice(0, i).concat(arr.slice(i + 1));
      const perms = permute(rest);
      for (const perm of perms) {
        result.push([arr[i]].concat(perm));
      }
    }
    return result;
  };
  
  const permutations = permute(otherNodes);
  console.log(`Evaluating ${permutations.length} permutations with real-world factors`);
  
  // Try each permutation with real-world cost calculation
  for (const perm of permutations) {
    const fullPath = [start, ...perm, start];
    const pathDistance = calculateRealWorldDistance(fullPath, graph, conditions);
    
    if (pathDistance < bestDistance) {
      bestDistance = pathDistance;
      bestPath = fullPath;
    }
  }
  
  console.log(`Best real-world optimized path: ${bestPath.join(' -> ')}, Distance: ${bestDistance.toFixed(2)}km`);
  
  return {
    path: bestPath,
    distance: bestDistance,
    time: calculateTravelTime(bestDistance, bestPath, graph, conditions),
  };
};

// Calculate real-world travel time based on multiple factors
const calculateTravelTime = (distance: number, path: string[], graph: Graph, conditions?: any): number => {
  let baseTime = distance * 60; // Base: 1 hour per km (slow for demonstration)
  
  // Apply real-world multipliers
  if (conditions?.timeOfDay) {
    baseTime *= TIME_OF_DAY_MULTIPLIERS[conditions.timeOfDay as keyof typeof TIME_OF_DAY_MULTIPLIERS] || 1.0;
  }
  
  if (conditions?.weather) {
    baseTime *= WEATHER_MULTIPLIERS[conditions.weather as keyof typeof WEATHER_MULTIPLIERS] || 1.0;
  }
  
  // Factor in city importance (larger cities take longer to navigate)
  let cityDelayFactor = 1.0;
  path.forEach(nodeId => {
    const node = graph.nodes[nodeId];
    if (node?.population && node.population > 500000) {
      cityDelayFactor += 0.1; // 10% extra time for large cities
    }
  });
  
  return baseTime * cityDelayFactor;
};

// Calculate total distance for a path with real-world factors
const calculateRealWorldDistance = (path: string[], graph: Graph, conditions?: any): number => {
  if (path.length < 2) return 0;
  
  let totalDistance = 0;
  
  for (let i = 0; i < path.length - 1; i++) {
    const fromIndex = graph.nodeIndices[path[i]];
    const toIndex = graph.nodeIndices[path[i + 1]];
    
    if (fromIndex === undefined || toIndex === undefined) {
      return Infinity;
    }
    
    let edgeWeight = graph.adjacencyMatrix[fromIndex][toIndex];
    
    // If no direct edge, calculate with real-world factors
    if (edgeWeight === Infinity) {
      const fromNode = graph.nodes[path[i]];
      const toNode = graph.nodes[path[i + 1]];
      edgeWeight = calculateEuclideanDistance(fromNode, toNode);
      
      // Apply real-world multipliers for calculated distances
      if (conditions?.weather) {
        edgeWeight *= WEATHER_MULTIPLIERS[conditions.weather as keyof typeof WEATHER_MULTIPLIERS] || 1.0;
      }
      if (conditions?.timeOfDay) {
        edgeWeight *= TIME_OF_DAY_MULTIPLIERS[conditions.timeOfDay as keyof typeof TIME_OF_DAY_MULTIPLIERS] || 1.0;
      }
    }
    
    totalDistance += edgeWeight;
  }
  
  return totalDistance;
};

// Enhanced TSP Dynamic Programming with real-world considerations
const dynamicProgramming = (graph: Graph, start: string, conditions?: any): { path: string[]; distance: number; time: number } => {
  console.log('Running Enhanced Dynamic Programming TSP with real-world optimization');
  const allNodes = Object.keys(graph.nodes);
  const n = allNodes.length;
  
  if (n <= 1) return { path: [start], distance: 0, time: 0 };
  if (n > 12) { // Increased limit due to optimization
    console.log('Too many nodes for exact DP, using optimized approximation');
    return nearestNeighbor(graph, start, conditions);
  }
  
  const startIndex = graph.nodeIndices[start];
  if (startIndex === undefined) return { path: [], distance: 0, time: 0 };
  
  // DP table with real-world cost consideration
  const dp: Map<string, Map<number, number>> = new Map();
  const parent: Map<string, Map<number, number>> = new Map();
  
  // Initialize with real-world adjusted distances
  const startMask = 1 << startIndex;
  dp.set(startMask.toString(), new Map([[startIndex, 0]]));
  
  // Fill DP table with real-world factors
  for (let mask = 1; mask < (1 << n); mask++) {
    const maskStr = mask.toString();
    if (!dp.has(maskStr)) continue;
    
    const currentStates = dp.get(maskStr)!;
    
    for (const [u, cost] of currentStates) {
      for (let v = 0; v < n; v++) {
        if (mask & (1 << v)) continue;
        
        let distance = graph.adjacencyMatrix[u][v];
        
        // Apply real-world factors if no direct edge exists
        if (distance === Infinity) {
          const fromNode = graph.nodes[graph.indexToNode[u]];
          const toNode = graph.nodes[graph.indexToNode[v]];
          distance = calculateEuclideanDistance(fromNode, toNode);
          
          // Apply conditions
          if (conditions?.weather) {
            distance *= WEATHER_MULTIPLIERS[conditions.weather as keyof typeof WEATHER_MULTIPLIERS] || 1.0;
          }
          if (conditions?.timeOfDay) {
            distance *= TIME_OF_DAY_MULTIPLIERS[conditions.timeOfDay as keyof typeof TIME_OF_DAY_MULTIPLIERS] || 1.0;
          }
        }
        
        if (distance === Infinity) continue;
        
        const newMask = mask | (1 << v);
        const newMaskStr = newMask.toString();
        const newCost = cost + distance;
        
        if (!dp.has(newMaskStr)) {
          dp.set(newMaskStr, new Map());
          parent.set(newMaskStr, new Map());
        }
        
        const newStates = dp.get(newMaskStr)!;
        const newParents = parent.get(newMaskStr)!;
        
        if (!newStates.has(v) || newCost < newStates.get(v)!) {
          newStates.set(v, newCost);
          newParents.set(v, u);
        }
      }
    }
  }
  
  // Find minimum cost to return to start with real-world factors
  const fullMask = (1 << n) - 1;
  const fullMaskStr = fullMask.toString();
  let minCost = Infinity;
  let lastCity = -1;
  
  if (dp.has(fullMaskStr)) {
    const finalStates = dp.get(fullMaskStr)!;
    for (const [city, cost] of finalStates) {
      if (city === startIndex) continue;
      
      let returnCost = graph.adjacencyMatrix[city][startIndex];
      if (returnCost === Infinity) {
        const fromNode = graph.nodes[graph.indexToNode[city]];
        const toNode = graph.nodes[graph.indexToNode[startIndex]];
        returnCost = calculateEuclideanDistance(fromNode, toNode);
        
        // Apply real-world factors
        if (conditions?.weather) {
          returnCost *= WEATHER_MULTIPLIERS[conditions.weather as keyof typeof WEATHER_MULTIPLIERS] || 1.0;
        }
        if (conditions?.timeOfDay) {
          returnCost *= TIME_OF_DAY_MULTIPLIERS[conditions.timeOfDay as keyof typeof TIME_OF_DAY_MULTIPLIERS] || 1.0;
        }
      }
      
      if (returnCost !== Infinity) {
        const totalCost = cost + returnCost;
        if (totalCost < minCost) {
          minCost = totalCost;
          lastCity = city;
        }
      }
    }
  }
  
  if (lastCity === -1) {
    console.log('No valid TSP tour found');
    return { path: [], distance: 0, time: 0 };
  }
  
  // Reconstruct path
  const path: string[] = [];
  let currentMask = fullMask;
  let currentCity = lastCity;
  
  while (currentMask > 0) {
    path.unshift(graph.indexToNode[currentCity]);
    if (currentMask === startMask) break;
    
    const currentMaskStr = currentMask.toString();
    const parents = parent.get(currentMaskStr);
    if (!parents || !parents.has(currentCity)) break;
    
    const prevCity = parents.get(currentCity)!;
    currentMask ^= (1 << currentCity);
    currentCity = prevCity;
  }
  
  path.push(start);
  
  console.log(`Enhanced DP path: ${path.join(' -> ')}, Distance: ${minCost.toFixed(2)}km`);
  
  return {
    path,
    distance: minCost,
    time: calculateTravelTime(minCost, path, graph, conditions),
  };
};

// Enhanced Nearest Neighbor with real-world smart city selection
const nearestNeighbor = (graph: Graph, start: string, conditions?: any): { path: string[]; distance: number; time: number } => {
  console.log('Running Enhanced Nearest Neighbor TSP with smart city prioritization');
  const allNodes = Object.keys(graph.nodes);
  const visited: Set<string> = new Set();
  const path: string[] = [start];
  let current = start;
  let totalDistance = 0;
  
  visited.add(start);
  
  // Visit all other nodes with smart selection
  while (visited.size < allNodes.length) {
    let bestNode = "";
    let bestScore = Infinity;
    
    const currentIndex = graph.nodeIndices[current];
    if (currentIndex === undefined) break;
    
    // Smart city selection considering multiple factors
    for (const nodeId of allNodes) {
      if (!visited.has(nodeId)) {
        const nodeIndex = graph.nodeIndices[nodeId];
        if (nodeIndex === undefined) continue;
        
        let distance = graph.adjacencyMatrix[currentIndex][nodeIndex];
        
        // Calculate distance with real-world factors if no direct edge
        if (distance === Infinity) {
          distance = calculateEuclideanDistance(graph.nodes[current], graph.nodes[nodeId]);
          
          // Apply real-world conditions
          if (conditions?.weather) {
            distance *= WEATHER_MULTIPLIERS[conditions.weather as keyof typeof WEATHER_MULTIPLIERS] || 1.0;
          }
          if (conditions?.timeOfDay) {
            distance *= TIME_OF_DAY_MULTIPLIERS[conditions.timeOfDay as keyof typeof TIME_OF_DAY_MULTIPLIERS] || 1.0;
          }
        }
        
        // Smart scoring: consider distance, city importance, and population
        const cityNode = graph.nodes[nodeId];
        let score = distance;
        
        // Prioritize important cities (lower score = higher priority)
        if (cityNode.importance) {
          score *= (1 - cityNode.importance / 200); // Reduce score for important cities
        }
        
        // Consider population (larger cities might be more important to visit)
        if (cityNode.population && cityNode.population > 300000) {
          score *= 0.9; // Slight preference for larger cities
        }
        
        if (score < bestScore) {
          bestScore = score;
          bestNode = nodeId;
        }
      }
    }
    
    if (bestNode === "") break;
    
    path.push(bestNode);
    visited.add(bestNode);
    
    // Calculate actual distance for accumulation
    const currentIndex2 = graph.nodeIndices[current];
    const bestNodeIndex = graph.nodeIndices[bestNode];
    if (currentIndex2 !== undefined && bestNodeIndex !== undefined) {
      let actualDistance = graph.adjacencyMatrix[currentIndex2][bestNodeIndex];
      if (actualDistance === Infinity) {
        actualDistance = calculateEuclideanDistance(graph.nodes[current], graph.nodes[bestNode]);
        // Apply conditions for calculated distances
        if (conditions?.weather) {
          actualDistance *= WEATHER_MULTIPLIERS[conditions.weather as keyof typeof WEATHER_MULTIPLIERS] || 1.0;
        }
        if (conditions?.timeOfDay) {
          actualDistance *= TIME_OF_DAY_MULTIPLIERS[conditions.timeOfDay as keyof typeof TIME_OF_DAY_MULTIPLIERS] || 1.0;
        }
      }
      totalDistance += actualDistance;
    }
    
    current = bestNode;
  }
  
  // Return to start with real-world factors
  if (visited.size === allNodes.length) {
    const currentIndex = graph.nodeIndices[current];
    const startIndex = graph.nodeIndices[start];
    
    if (currentIndex !== undefined && startIndex !== undefined) {
      let returnDistance = graph.adjacencyMatrix[currentIndex][startIndex];
      
      if (returnDistance === Infinity) {
        returnDistance = calculateEuclideanDistance(graph.nodes[current], graph.nodes[start]);
        // Apply conditions
        if (conditions?.weather) {
          returnDistance *= WEATHER_MULTIPLIERS[conditions.weather as keyof typeof WEATHER_MULTIPLIERS] || 1.0;
        }
        if (conditions?.timeOfDay) {
          returnDistance *= TIME_OF_DAY_MULTIPLIERS[conditions.timeOfDay as keyof typeof TIME_OF_DAY_MULTIPLIERS] || 1.0;
        }
      }
      
      path.push(start);
      totalDistance += returnDistance;
    }
  }
  
  console.log(`Smart NN path: ${path.join(' -> ')}, Distance: ${totalDistance.toFixed(2)}km`);
  
  return {
    path,
    distance: totalDistance,
    time: calculateTravelTime(totalDistance, path, graph, conditions),
  };
};

// Enhanced Branch and Bound with real-world pruning
const branchAndBound = (graph: Graph, start: string, conditions?: any): { path: string[]; distance: number; time: number } => {
  console.log('Running Enhanced Branch and Bound TSP with real-world optimization');
  const allNodes = Object.keys(graph.nodes);
  const n = allNodes.length;
  
  if (n > 10) { // Increased due to better pruning
    console.log('Too many nodes for B&B, using Smart Nearest Neighbor');
    return nearestNeighbor(graph, start, conditions);
  }
  
  interface BnBNode {
    path: string[];
    cost: number;
    visited: Set<string>;
    bound: number;
  }
  
  const calculateBound = (path: string[], visited: Set<string>): number => {
    if (visited.size === allNodes.length) {
      const lastNode = path[path.length - 1];
      const lastIndex = graph.nodeIndices[lastNode];
      const startIndex = graph.nodeIndices[start];
      
      if (lastIndex !== undefined && startIndex !== undefined) {
        let distance = graph.adjacencyMatrix[lastIndex][startIndex];
        if (distance === Infinity) {
          distance = calculateEuclideanDistance(graph.nodes[lastNode], graph.nodes[start]);
          // Apply real-world factors
          if (conditions?.weather) {
            distance *= WEATHER_MULTIPLIERS[conditions.weather as keyof typeof WEATHER_MULTIPLIERS] || 1.0;
          }
          if (conditions?.timeOfDay) {
            distance *= TIME_OF_DAY_MULTIPLIERS[conditions.timeOfDay as keyof typeof TIME_OF_DAY_MULTIPLIERS] || 1.0;
          }
        }
        return distance;
      }
      return Infinity;
    }
    
    // Enhanced bound calculation with real-world minimum spanning tree
    let bound = 0;
    const unvisited = allNodes.filter(node => !visited.has(node));
    
    // Use minimum edge costs for remaining nodes
    for (const nodeId of unvisited) {
      let minEdge = Infinity;
      const nodeIndex = graph.nodeIndices[nodeId];
      
      if (nodeIndex !== undefined) {
        for (let i = 0; i < n; i++) {
          let edgeWeight = graph.adjacencyMatrix[nodeIndex][i];
          if (edgeWeight === Infinity) {
            const fromNode = graph.nodes[nodeId];
            const toNode = graph.nodes[graph.indexToNode[i]];
            if (fromNode && toNode) {
              edgeWeight = calculateEuclideanDistance(fromNode, toNode);
              // Apply minimal real-world factors for bound estimation
              if (conditions?.weather) {
                edgeWeight *= Math.min(WEATHER_MULTIPLIERS[conditions.weather as keyof typeof WEATHER_MULTIPLIERS] || 1.0, 1.2);
              }
            }
          }
          if (edgeWeight < minEdge) {
            minEdge = edgeWeight;
          }
        }
        if (minEdge !== Infinity) {
          bound += minEdge;
        }
      }
    }
    
    return bound;
  };
  
  const queue: BnBNode[] = [{
    path: [start],
    cost: 0,
    visited: new Set([start]),
    bound: calculateBound([start], new Set([start]))
  }];
  
  let bestSolution: BnBNode | null = null;
  let bestCost = Infinity;
  let iterations = 0;
  const maxIterations = 50000; // Increased for better solutions
  
  while (queue.length > 0 && iterations < maxIterations) {
    iterations++;
    queue.sort((a, b) => (a.cost + a.bound) - (b.cost + b.bound));
    const current = queue.shift()!;
    
    // Enhanced pruning with real-world considerations
    if (current.cost + current.bound >= bestCost) continue;
    
    if (current.visited.size === allNodes.length) {
      const lastNode = current.path[current.path.length - 1];
      const lastIndex = graph.nodeIndices[lastNode];
      const startIndex = graph.nodeIndices[start];
      
      if (lastIndex !== undefined && startIndex !== undefined) {
        let returnCost = graph.adjacencyMatrix[lastIndex][startIndex];
        if (returnCost === Infinity) {
          returnCost = calculateEuclideanDistance(graph.nodes[lastNode], graph.nodes[start]);
          // Apply real-world factors
          if (conditions?.weather) {
            returnCost *= WEATHER_MULTIPLIERS[conditions.weather as keyof typeof WEATHER_MULTIPLIERS] || 1.0;
          }
          if (conditions?.timeOfDay) {
            returnCost *= TIME_OF_DAY_MULTIPLIERS[conditions.timeOfDay as keyof typeof TIME_OF_DAY_MULTIPLIERS] || 1.0;
          }
        }
        
        if (returnCost !== Infinity) {
          const totalCost = current.cost + returnCost;
          
          if (totalCost < bestCost) {
            bestCost = totalCost;
            bestSolution = {
              path: [...current.path, start],
              cost: totalCost,
              visited: current.visited,
              bound: 0
            };
          }
        }
      }
      continue;
    }
    
    const currentNode = current.path[current.path.length - 1];
    const currentIndex = graph.nodeIndices[currentNode];
    
    if (currentIndex === undefined) continue;
    
    // Expand to unvisited neighbors with real-world costs
    for (const nextNode of allNodes) {
      if (!current.visited.has(nextNode)) {
        const nextIndex = graph.nodeIndices[nextNode];
        if (nextIndex === undefined) continue;
        
        let edgeCost = graph.adjacencyMatrix[currentIndex][nextIndex];
        if (edgeCost === Infinity) {
          edgeCost = calculateEuclideanDistance(graph.nodes[currentNode], graph.nodes[nextNode]);
          // Apply real-world factors
          if (conditions?.weather) {
            edgeCost *= WEATHER_MULTIPLIERS[conditions.weather as keyof typeof WEATHER_MULTIPLIERS] || 1.0;
          }
          if (conditions?.timeOfDay) {
            edgeCost *= TIME_OF_DAY_MULTIPLIERS[conditions.timeOfDay as keyof typeof TIME_OF_DAY_MULTIPLIERS] || 1.0;
          }
        }
        
        if (edgeCost === Infinity) continue;
        
        const newVisited = new Set(current.visited);
        newVisited.add(nextNode);
        const newPath = [...current.path, nextNode];
        const newCost = current.cost + edgeCost;
        const newBound = calculateBound(newPath, newVisited);
        
        if (newCost + newBound < bestCost) {
          queue.push({
            path: newPath,
            cost: newCost,
            visited: newVisited,
            bound: newBound
          });
        }
      }
    }
  }
  
  console.log(`Enhanced B&B completed in ${iterations} iterations`);
  
  return bestSolution ? {
    path: bestSolution.path,
    distance: bestSolution.cost,
    time: calculateTravelTime(bestSolution.cost, bestSolution.path, graph, conditions),
  } : { path: [], distance: 0, time: 0 };
};

// Main function to run enhanced TSP simulation on graph
export const runGraphSimulation = (
  algorithm: Algorithm,
  nodes: Node[],
  edges: Edge[],
  start: string,
  end: string, // Not used in TSP, but kept for interface compatibility
  conditions?: any
): SimulationResult => {
  console.log(`Running enhanced ${algorithm} algorithm with ${nodes.length} nodes and ${edges.length} edges`);
  console.log('Real-world conditions:', conditions);
  
  if (nodes.length < 2) {
    console.log('Need at least 2 nodes for TSP');
    return {
      algorithm,
      path: [],
      metrics: {
        time: 0,
        distance: 0,
        cost: 0,
        fuel: 0,
        trafficImpact: 1,
        weatherImpact: 1,
        totalScore: 0,
      },
    };
  }
  
  const graph = convertToGraph(nodes, edges);
  console.log('Enhanced graph created with real-world factors:', {
    nodes: Object.keys(graph.nodes).length,
    edges: graph.edges.length / 2,
    startNode: start,
    realWorldFactors: true
  });
  
  let result;
  const startTime = performance.now();
  
  try {
    switch (algorithm) {
      case 'brute-force':
        result = bruteForce(graph, start, conditions);
        break;
      case 'dynamic-programming':
        result = dynamicProgramming(graph, start, conditions);
        break;
      case 'nearest-neighbor':
        result = nearestNeighbor(graph, start, conditions);
        break;
      case 'branch-and-bound':
        result = branchAndBound(graph, start, conditions);
        break;
      default:
        result = nearestNeighbor(graph, start, conditions);
    }
  } catch (error) {
    console.error('Enhanced algorithm execution error:', error);
    result = { path: [], distance: 0, time: 0 };
  }
  
  const executionTime = performance.now() - startTime;
  console.log(`Enhanced algorithm completed in ${executionTime.toFixed(2)}ms`);
  
  const { path, distance, time } = result;
  
  // Convert path to use node labels instead of IDs
  const labelPath = path.map(nodeId => {
    const node = graph.nodes[nodeId];
    return node ? node.label : nodeId;
  });

  // Calculate realistic metrics with real-world factors
  const vehicleEfficiency = conditions?.vehicle === 'ev' ? 0.08 : 0.12;
  const fuelConsumption = distance * vehicleEfficiency;
  
  // Enhanced cost calculation
  const baseCost = distance * (conditions?.vehicle === 'truck' ? 2.5 : 1.2);
  const timeCost = time * 0.8;
  const weatherCostFactor = conditions?.weather ? 
    (WEATHER_MULTIPLIERS[conditions.weather as keyof typeof WEATHER_MULTIPLIERS] || 1.0) : 1.0;
  const totalCost = (baseCost + timeCost) * weatherCostFactor + (executionTime * 0.01);

  // Enhanced traffic and weather impact calculation
  const trafficImpact = conditions?.timeOfDay ? 
    (TIME_OF_DAY_MULTIPLIERS[conditions.timeOfDay as keyof typeof TIME_OF_DAY_MULTIPLIERS] || 1.0) : 
    1 + Math.random() * 0.5;
  
  const weatherImpact = conditions?.weather ? 
    (WEATHER_MULTIPLIERS[conditions.weather as keyof typeof WEATHER_MULTIPLIERS] || 1.0) : 
    1 + Math.random() * 0.3;

  // Enhanced efficiency scoring
  const efficiencyScore = distance > 0 ? 
    ((distance + time/60) * trafficImpact * weatherImpact) / 10 : 0;

  return {
    algorithm,
    path: labelPath,
    metrics: {
      time: time + executionTime,
      distance,
      cost: totalCost,
      fuel: fuelConsumption,
      trafficImpact,
      weatherImpact,
      totalScore: efficiencyScore,
    },
  };
};
