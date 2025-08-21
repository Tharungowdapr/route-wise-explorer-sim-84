import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Download, Upload, Plus, Trash, Hash, Play, Save, FolderOpen, RefreshCw } from 'lucide-react';
import { MapType, Algorithm, SimulationParams, SimulationResult } from '../types';
import { runGraphSimulation } from '../utils/graphAlgorithms';

// Initial empty state
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

interface GraphBuilderProps {
  onSaveGraph?: (nodes: Node[], edges: Edge[]) => void;
  mapType?: MapType;
  showControls?: boolean;
  isEmbedded?: boolean;
  params?: SimulationParams;
  setParams?: React.Dispatch<React.SetStateAction<SimulationParams>>;
  onRunSimulation?: () => void;
}

const GraphBuilder: React.FC<GraphBuilderProps> = ({ 
  onSaveGraph, 
  mapType = 'karnataka', 
  showControls = false,
  isEmbedded = false,
  params,
  setParams,
  onRunSimulation
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeName, setNodeName] = useState('');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [edgeWeight, setEdgeWeight] = useState<string>('1');
  const [startNode, setStartNode] = useState<string>('');
  const [endNode, setEndNode] = useState<string>('');
  const [algorithm, setAlgorithm] = useState<Algorithm>('nearest-neighbor');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [compareAlgorithm, setCompareAlgorithm] = useState<Algorithm | null>(null);
  const [compareResult, setCompareResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Handle connecting two nodes with an edge
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: `e${connection.source}-${connection.target}`,
        label: '1',
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#FFFFFF', color: '#000000', fillOpacity: 0.7 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      toast.success('Edge added between nodes');
    },
    [setEdges],
  );

  // Add a new node to the graph
  const handleAddNode = () => {
    if (!nodeName.trim()) {
      toast.error('Please provide a node name');
      return;
    }
    
    // Check for duplicate names
    const existingNode = nodes.find(node => node.data.label === nodeName.trim());
    if (existingNode) {
      toast.error('Node with this name already exists');
      return;
    }
    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      data: { label: nodeName.trim() },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      style: {
        background: '#ffffff',
        border: '2px solid #1a192b',
        borderRadius: '10px',
        fontSize: '12px',
        fontWeight: 'bold',
        width: 100,
        height: 50,
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    setNodeName('');
    toast.success(`Node "${nodeName}" added`);
  };

  // Add a new edge with weight
  const handleAddEdge = () => {
    if (!selectedSource || !selectedTarget) {
      toast.error('Please select both source and target nodes');
      return;
    }

    if (selectedSource === selectedTarget) {
      toast.error('Source and target nodes must be different');
      return;
    }

    const weight = parseInt(edgeWeight) || 1;
    if (weight <= 0) {
      toast.error('Edge weight must be positive');
      return;
    }
    
    const edgeExists = edges.some(
      edge => (edge.source === selectedSource && edge.target === selectedTarget) ||
               (edge.source === selectedTarget && edge.target === selectedSource)
    );

    if (edgeExists) {
      setEdges(eds => 
        eds.map(edge => {
          if ((edge.source === selectedSource && edge.target === selectedTarget) ||
              (edge.source === selectedTarget && edge.target === selectedSource)) {
            return {
              ...edge,
              label: weight.toString(),
            };
          }
          return edge;
        })
      );
      toast.success(`Updated edge weight: ${weight}`);
    } else {
      // Add bidirectional edges for TSP
      const edge1: Edge = {
        id: `e${selectedSource}-${selectedTarget}`,
        source: selectedSource,
        target: selectedTarget,
        label: weight.toString(),
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#FFFFFF', color: '#000000', fillOpacity: 0.7 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
      
      const edge2: Edge = {
        id: `e${selectedTarget}-${selectedSource}`,
        source: selectedTarget,
        target: selectedSource,
        label: weight.toString(),
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#FFFFFF', color: '#000000', fillOpacity: 0.7 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
      
      setEdges(eds => [...eds, edge1, edge2]);
      toast.success(`Bidirectional edge added with weight: ${weight}`);
    }

    // Reset selections
    setSelectedSource(null);
    setSelectedTarget(null);
    setEdgeWeight('1');
  };

  // Delete selected nodes and edges
  const handleDeleteSelected = () => {
    const selectedNodes = nodes.filter(node => node.selected);
    const selectedEdges = edges.filter(edge => edge.selected);
    
    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      toast.info('No elements selected for deletion');
      return;
    }
    
    setNodes(nds => nds.filter(node => !node.selected));
    setEdges(eds => eds.filter(edge => !edge.selected));
    
    toast.info(`Deleted ${selectedNodes.length} nodes and ${selectedEdges.length} edges`);
  };

  // Reset the graph
  const handleResetGraph = () => {
    if (nodes.length === 0 && edges.length === 0) {
      toast.info('Graph is already empty');
      return;
    }
    
    setNodes([]);
    setEdges([]);
    setSelectedSource(null);
    setSelectedTarget(null);
    setEdgeWeight('1');
    setStartNode('');
    setEndNode('');
    setResult(null);
    setCompareResult(null);
    toast.info('Graph has been reset');
  };

  // Create a sample TSP graph
  const createSampleGraph = () => {
    const sampleNodes: Node[] = [
      {
        id: 'A',
        data: { label: 'City A' },
        position: { x: 100, y: 100 },
        style: { background: '#ffffff', border: '2px solid #1a192b', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', width: 100, height: 50 },
      },
      {
        id: 'B',
        data: { label: 'City B' },
        position: { x: 300, y: 100 },
        style: { background: '#ffffff', border: '2px solid #1a192b', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', width: 100, height: 50 },
      },
      {
        id: 'C',
        data: { label: 'City C' },
        position: { x: 200, y: 250 },
        style: { background: '#ffffff', border: '2px solid #1a192b', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', width: 100, height: 50 },
      },
      {
        id: 'D',
        data: { label: 'City D' },
        position: { x: 50, y: 250 },
        style: { background: '#ffffff', border: '2px solid #1a192b', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', width: 100, height: 50 },
      },
    ];

    const sampleEdges: Edge[] = [
      { id: 'eA-B', source: 'A', target: 'B', label: '10', labelBgPadding: [8, 4], labelBgBorderRadius: 4, labelBgStyle: { fill: '#FFFFFF', color: '#000000', fillOpacity: 0.7 }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'eB-A', source: 'B', target: 'A', label: '10', labelBgPadding: [8, 4], labelBgBorderRadius: 4, labelBgStyle: { fill: '#FFFFFF', color: '#000000', fillOpacity: 0.7 }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'eA-C', source: 'A', target: 'C', label: '15', labelBgPadding: [8, 4], labelBgBorderRadius: 4, labelBgStyle: { fill: '#FFFFFF', color: '#000000', fillOpacity: 0.7 }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'eC-A', source: 'C', target: 'A', label: '15', labelBgPadding: [8, 4], labelBgBorderRadius: 4, labelBgStyle: { fill: '#FFFFFF', color: '#000000', fillOpacity: 0.7 }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'eB-C', source: 'B', target: 'C', label: '12', labelBgPadding: [8, 4], labelBgBorderRadius: 4, labelBgStyle: { fill: '#FFFFFF', color: '#000000', fillOpacity: 0.7 }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'eC-B', source: 'C', target: 'B', label: '12', labelBgPadding: [8, 4], labelBgBorderRadius: 4, labelBgStyle: { fill: '#FFFFFF', color: '#000000', fillOpacity: 0.7 }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'eA-D', source: 'A', target: 'D', label: '8', labelBgPadding: [8, 4], labelBgBorderRadius: 4, labelBgStyle: { fill: '#FFFFFF', color: '#000000', fillOpacity: 0.7 }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'eD-A', source: 'D', target: 'A', label: '8', labelBgPadding: [8, 4], labelBgBorderRadius: 4, labelBgStyle: { fill: '#FFFFFF', color: '#000000', fillOpacity: 0.7 }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'eB-D', source: 'B', target: 'D', label: '20', labelBgPadding: [8, 4], labelBgBorderRadius: 4, labelBgStyle: { fill: '#FFFFFF', color: '#000000', fillOpacity: 0.7 }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'eD-B', source: 'D', target: 'B', label: '20', labelBgPadding: [8, 4], labelBgBorderRadius: 4, labelBgStyle: { fill: '#FFFFFF', color: '#000000', fillOpacity: 0.7 }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'eC-D', source: 'C', target: 'D', label: '7', labelBgPadding: [8, 4], labelBgBorderRadius: 4, labelBgStyle: { fill: '#FFFFFF', color: '#000000', fillOpacity: 0.7 }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'eD-C', source: 'D', target: 'C', label: '7', labelBgPadding: [8, 4], labelBgBorderRadius: 4, labelBgStyle: { fill: '#FFFFFF', color: '#000000', fillOpacity: 0.7 }, markerEnd: { type: MarkerType.ArrowClosed } },
    ];

    setNodes(sampleNodes);
    setEdges(sampleEdges);
    setStartNode('A');
    toast.success('Sample TSP graph created with 4 cities');
  };

  // Run algorithm simulation on the current graph
  const handleRunGraphSimulation = async () => {
    if (nodes.length === 0) {
      toast.error('Please add nodes to the graph first');
      return;
    }

    if (nodes.length < 2) {
      toast.error('TSP requires at least 2 nodes');
      return;
    }

    if (!startNode) {
      toast.error('Please select a start node');
      return;
    }

    setIsRunning(true);
    
    try {
      // Clear previous results
      setResult(null);
      setCompareResult(null);
      clearHighlight();
      
      console.log('Starting TSP simulation...');
      const simulationResult = runGraphSimulation(algorithm, nodes, edges, startNode, '');
      
      if (simulationResult.path.length === 0) {
        toast.warning('No valid TSP tour found. Make sure your graph is connected.');
      } else {
        setResult(simulationResult);
        highlightPath(simulationResult.path, 'primary');
        toast.success(`TSP tour found! Distance: ${simulationResult.metrics.distance.toFixed(2)}`);
      }
      
      // Run comparison algorithm if selected
      if (compareAlgorithm && compareAlgorithm !== algorithm) {
        console.log('Running comparison algorithm...');
        const comparisonResult = runGraphSimulation(compareAlgorithm, nodes, edges, startNode, '');
        
        if (comparisonResult.path.length > 0) {
          setCompareResult(comparisonResult);
          highlightPath(comparisonResult.path, 'comparison');
        }
      }
      
    } catch (error) {
      console.error('Graph simulation error:', error);
      toast.error('Error running TSP simulation');
    } finally {
      setIsRunning(false);
    }
  };

  // Clear path highlighting
  const clearHighlight = () => {
    setNodes(nds => 
      nds.map(node => ({
        ...node,
        style: {
          ...node.style,
          background: '#ffffff',
          color: '#000000',
          border: '2px solid #1a192b',
        }
      }))
    );

    setEdges(eds =>
      eds.map(edge => ({
        ...edge,
        style: {
          stroke: '#b1b1b7',
          strokeWidth: 1,
          strokeDasharray: 'none',
        }
      }))
    );
  };

  // Highlight the path in the graph
  const highlightPath = (path: string[], type: 'primary' | 'comparison') => {
    if (path.length === 0) return;
    
    // Convert labels back to node IDs
    const nodeIds = path.map(label => {
      const node = nodes.find(n => n.data.label === label);
      return node ? node.id : null;
    }).filter(id => id !== null) as string[];
    
    // Highlight nodes
    setNodes(nds => 
      nds.map(node => {
        const isInPath = nodeIds.includes(node.id);
        const isStart = nodeIds[0] === node.id;
        
        return {
          ...node,
          style: {
            ...node.style,
            background: isInPath ? (type === 'primary' ? '#22c55e' : '#ef4444') : '#ffffff',
            color: isInPath ? '#ffffff' : '#000000',
            border: isStart ? '3px solid #fbbf24' : (isInPath ? `2px solid ${type === 'primary' ? '#16a34a' : '#dc2626'}` : '2px solid #1a192b'),
          }
        };
      })
    );

    // Highlight edges
    setEdges(eds =>
      eds.map(edge => {
        const isInPath = nodeIds.some((nodeId, index) => {
          const nextNode = nodeIds[index + 1];
          return nextNode && edge.source === nodeId && edge.target === nextNode;
        });
        
        return {
          ...edge,
          style: {
            stroke: isInPath ? (type === 'primary' ? '#22c55e' : '#ef4444') : '#b1b1b7',
            strokeWidth: isInPath ? 3 : 1,
            strokeDasharray: type === 'comparison' && isInPath ? '5,5' : 'none',
          }
        };
      })
    );
  };

  // Export graph as JSON
  const handleExportGraph = () => {
    if (nodes.length === 0) {
      toast.error('Graph is empty, nothing to export');
      return;
    }
    
    const graphData = { nodes, edges };
    const dataStr = JSON.stringify(graphData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `graph-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Graph exported successfully');
  };

  // Import graph from JSON file
  const handleImportGraph = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const graphData = JSON.parse(content);
        
        if (graphData.nodes && graphData.edges) {
          setNodes(graphData.nodes);
          setEdges(graphData.edges);
          toast.success('Graph imported successfully');
        } else {
          toast.error('Invalid graph file format');
        }
      } catch (error) {
        toast.error('Error importing graph file');
      }
    };
    reader.readAsText(file);
  };

  // Save the graph to localStorage
  const handleSaveGraph = () => {
    if (nodes.length === 0) {
      toast.error('Graph is empty, nothing to save');
      return;
    }
    
    const graphName = prompt('Enter a name for this graph:');
    if (!graphName) return;
    
    const savedGraphs = JSON.parse(localStorage.getItem('savedGraphs') || '{}');
    savedGraphs[graphName] = { nodes, edges };
    localStorage.setItem('savedGraphs', JSON.stringify(savedGraphs));
    
    if (onSaveGraph) {
      onSaveGraph(nodes, edges);
    }
    
    toast.success(`Graph "${graphName}" saved successfully`);
  };

  // Load graph from localStorage
  const handleLoadGraph = () => {
    const savedGraphs = JSON.parse(localStorage.getItem('savedGraphs') || '{}');
    const graphNames = Object.keys(savedGraphs);
    
    if (graphNames.length === 0) {
      toast.error('No saved graphs found');
      return;
    }
    
    // For simplicity, show a prompt. In production, you'd use a proper dialog
    const graphName = prompt(`Select a graph to load:\n${graphNames.join('\n')}`);
    if (!graphName || !savedGraphs[graphName]) return;
    
    const graphData = savedGraphs[graphName];
    setNodes(graphData.nodes);
    setEdges(graphData.edges);
    toast.success(`Graph "${graphName}" loaded successfully`);
  };

  const flowStyles = isEmbedded 
    ? { height: '100%', width: '100%' } 
    : { height: '700px', width: '100%' };

  const nodeOptions = nodes.map(node => ({
    id: node.id,
    label: node.data.label as string
  }));

  return (
    <div className="flex flex-col h-full space-y-6">
      {showControls && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Node and Edge Creation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Graph Construction</h3>
            
            {/* Node Creation */}
            <div className="p-4 bg-background rounded-md border">
              <Label className="text-sm font-medium mb-2 block">Add Node</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  placeholder="Node name (e.g., City A)"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNode()}
                />
                <Button onClick={handleAddNode} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Edge Creation */}
            <div className="p-4 bg-background rounded-md border">
              <Label className="text-sm font-medium mb-2 block">Add Bidirectional Edge</Label>
              <div className="space-y-2">
                <Select value={selectedSource || ''} onValueChange={setSelectedSource}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Source node" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeOptions.map(node => (
                      <SelectItem key={`source-${node.id}`} value={node.id}>{node.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedTarget || ''} onValueChange={setSelectedTarget}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Target node" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeOptions.map(node => (
                      <SelectItem key={`target-${node.id}`} value={node.id}>{node.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <div className="flex items-center flex-1">
                    <Hash className="h-4 w-4 mr-1 text-muted-foreground" />
                    <Input
                      type="number"
                      min="1"
                      value={edgeWeight}
                      onChange={(e) => setEdgeWeight(e.target.value)}
                      placeholder="Distance"
                    />
                  </div>
                  <Button onClick={handleAddEdge} size="sm">Add Edge</Button>
                </div>
              </div>
            </div>
            
            {/* Graph Management */}
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleDeleteSelected} variant="destructive" size="sm">
                <Trash className="h-4 w-4 mr-1" /> Delete
              </Button>
              <Button onClick={handleResetGraph} variant="destructive" size="sm">
                Reset
              </Button>
              <Button onClick={createSampleGraph} variant="outline" size="sm" className="col-span-2">
                <RefreshCw className="h-4 w-4 mr-1" /> Load Sample
              </Button>
            </div>
          </div>

          {/* Middle Column - Algorithm Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">TSP Algorithm Setup</h3>
            
            <div className="p-4 bg-background rounded-md border space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Start City</Label>
                <Select value={startNode} onValueChange={setStartNode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select start city" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeOptions.map(node => (
                      <SelectItem key={`start-${node.id}`} value={node.id}>{node.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Primary Algorithm</Label>
                <Select value={algorithm} onValueChange={(value: Algorithm) => setAlgorithm(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brute-force">Brute Force (≤6 nodes)</SelectItem>
                    <SelectItem value="dynamic-programming">Dynamic Programming (≤10 nodes)</SelectItem>
                    <SelectItem value="nearest-neighbor">Nearest Neighbor (Fast)</SelectItem>
                    <SelectItem value="branch-and-bound">Branch & Bound (≤8 nodes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Compare With</Label>
                <Select value={compareAlgorithm || 'none'} onValueChange={(value) => setCompareAlgorithm(value === 'none' ? null : value as Algorithm)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {["brute-force", "dynamic-programming", "nearest-neighbor", "branch-and-bound"]
                      .filter(algo => algo !== algorithm)
                      .map(algo => (
                        <SelectItem key={algo} value={algo}>
                          {algo === "brute-force" ? "Brute Force" : 
                           algo === "dynamic-programming" ? "Dynamic Programming" : 
                           algo === "nearest-neighbor" ? "Nearest Neighbor" : 
                           "Branch & Bound"}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleRunGraphSimulation} className="w-full" disabled={isRunning}>
                <Play className="h-4 w-4 mr-2" /> 
                {isRunning ? 'Running...' : 'Run TSP Algorithm'}
              </Button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">TSP Results</h3>
            
            {(result || compareResult) ? (
              <div className="space-y-4">
                {result && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <h4 className="font-medium text-green-800 mb-2 flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      {result.algorithm.toUpperCase()}
                    </h4>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Total Distance:</span> {result.metrics.distance.toFixed(1)} units</p>
                      <p><span className="font-medium">Execution Time:</span> {result.metrics.time.toFixed(1)}ms</p>
                      <p><span className="font-medium">Cities Visited:</span> {result.path.length - 1}</p>
                      <p><span className="font-medium">Tour:</span></p>
                      <p className="text-xs bg-white p-2 rounded border font-mono">
                        {result.path.length > 0 ? result.path.join(' → ') : 'No tour found'}
                      </p>
                    </div>
                  </div>
                )}
                
                {compareResult && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <h4 className="font-medium text-red-800 mb-2 flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      {compareResult.algorithm.toUpperCase()}
                    </h4>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Total Distance:</span> {compareResult.metrics.distance.toFixed(1)} units</p>
                      <p><span className="font-medium">Execution Time:</span> {compareResult.metrics.time.toFixed(1)}ms</p>
                      <p><span className="font-medium">Cities Visited:</span> {compareResult.path.length - 1}</p>
                      <p><span className="font-medium">Tour:</span></p>
                      <p className="text-xs bg-white p-2 rounded border font-mono">
                        {compareResult.path.length > 0 ? compareResult.path.join(' → ') : 'No tour found'}
                      </p>
                    </div>
                  </div>
                )}

                {result && compareResult && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="font-medium text-blue-800 mb-2">Comparison</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Distance Difference:</span> {Math.abs(result.metrics.distance - compareResult.metrics.distance).toFixed(1)} units</p>
                      <p><span className="font-medium">Time Difference:</span> {Math.abs(result.metrics.time - compareResult.metrics.time).toFixed(1)}ms</p>
                      <p><span className="font-medium">Better Solution:</span> {
                        result.metrics.distance <= compareResult.metrics.distance ? 
                        result.algorithm.toUpperCase() : 
                        compareResult.algorithm.toUpperCase()
                      } (shorter distance)</p>
                      <p><span className="font-medium">Legend:</span> Solid line = Primary, Dashed line = Comparison</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-600 mb-2">
                  Build your TSP graph and run algorithms to see results here.
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Add at least 3-4 cities as nodes</p>
                  <p>• Connect cities with weighted edges</p>
                  <p>• Select a starting city</p>
                  <p>• Choose an algorithm and run</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Graph Visualization */}
      <div className="flex-1 border rounded-md overflow-hidden" style={{ minHeight: isEmbedded ? '600px' : '700px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          style={flowStyles}
        >
          <Controls />
          <MiniMap />
          <Background />
          
          {!showControls && (
            <Panel position="top-left" className="bg-background/80 p-2 rounded-md border shadow-sm backdrop-blur-sm">
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={createSampleGraph}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Sample
                </Button>
                <Button size="sm" variant="outline" onClick={handleResetGraph}>
                  <Trash className="h-4 w-4 mr-1" /> Reset
                </Button>
                <Button size="sm" variant="outline" onClick={handleRunGraphSimulation} disabled={isRunning}>
                  <Play className="h-4 w-4 mr-1" /> {isRunning ? 'Running...' : 'Run TSP'}
                </Button>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Save/Load/Import/Export Controls */}
      {showControls && (
        <div className="grid grid-cols-4 gap-2">
          <Button onClick={handleSaveGraph} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
          
          <Button onClick={handleLoadGraph} variant="outline" size="sm">
            <FolderOpen className="h-4 w-4 mr-1" /> Load
          </Button>
          
          <Button onClick={handleExportGraph} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>

          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportGraph}
              style={{ display: 'none' }}
              id="import-graph"
            />
            <Button 
              onClick={() => document.getElementById('import-graph')?.click()}
              variant="outline" 
              size="sm"
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-1" /> Import
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphBuilder;
