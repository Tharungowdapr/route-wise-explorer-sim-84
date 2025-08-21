import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAlgorithmDescription } from '../utils/algorithms';
import { Algorithm, SimulationResult } from '../types';
import { ChevronLeft } from 'lucide-react';

const Explanation = () => {
  const location = useLocation();
  const { algorithm, result } = location.state || { algorithm: 'brute-force', result: null };
  
  const algorithmInfo = getAlgorithmDescription(algorithm as Algorithm);
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ChevronLeft size={16} />
              Back to Simulator
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{algorithmInfo.name}</h1>
        </div>
        
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="complexity">Complexity</TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Algorithm Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{algorithmInfo.description}</p>
                
                <h3 className="text-lg font-medium mt-4">Key Characteristics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Advantages</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {algorithmInfo.pros.map((pro, index) => (
                        <li key={index}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Limitations</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {algorithmInfo.cons.map((con, index) => (
                        <li key={index}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {algorithm === 'brute-force' && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">How Brute Force Algorithm Works</h3>
                    <p className="mt-2">
                      The Brute Force algorithm exhaustively explores all possible paths between the source and destination nodes.
                      It generates all permutations of intermediate nodes and calculates the total path cost for each route.
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-1">
                      <li>Generate all possible permutations of intermediate nodes between source and destination</li>
                      <li>For each permutation, create a complete path from source to destination</li>
                      <li>Calculate the total cost for each path by summing edge weights</li>
                      <li>Compare all paths and select the one with minimum cost</li>
                      <li>Return the optimal path and its total cost</li>
                    </ol>
                  </div>
                )}
                
                {algorithm === 'dynamic-programming' && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">How Dynamic Programming Algorithm Works</h3>
                    <p className="mt-2">
                      The Dynamic Programming approach uses memoization to store previously computed shortest paths,
                      avoiding redundant calculations when exploring different routes.
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-1">
                      <li>Initialize memoization table to store computed subproblem results</li>
                      <li>For each node, recursively compute shortest path to destination</li>
                      <li>Store results in memo table to avoid recomputation</li>
                      <li>Use visited set to prevent cycles during exploration</li>
                      <li>Return optimal path by combining cached subproblem solutions</li>
                    </ol>
                  </div>
                )}
                
                {algorithm === 'nearest-neighbor' && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">How Nearest Neighbor Algorithm Works</h3>
                    <p className="mt-2">
                      The Nearest Neighbor algorithm is a greedy approach that always chooses the nearest unvisited node
                      as the next step in the path construction.
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-1">
                      <li>Start at the source node and mark it as visited</li>
                      <li>From current node, find all unvisited neighboring nodes</li>
                      <li>Select the neighbor with minimum edge weight (nearest neighbor)</li>
                      <li>Move to selected neighbor and mark it as visited</li>
                      <li>Repeat until destination is reached or no unvisited neighbors exist</li>
                    </ol>
                  </div>
                )}
                
                {algorithm === 'branch-and-bound' && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">How Branch and Bound Algorithm Works</h3>
                    <p className="mt-2">
                      Branch and Bound systematically explores the solution space while using bounds to prune
                      unpromising branches, combining the thoroughness of brute force with intelligent pruning.
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-1">
                      <li>Initialize priority queue with source node and upper bound to infinity</li>
                      <li>For each state, calculate lower bound using heuristic (e.g., straight-line distance)</li>
                      <li>Expand only states whose lower bound is less than current upper bound</li>
                      <li>When destination is reached, update upper bound if better solution found</li>
                      <li>Continue until queue is empty or optimal solution confirmed</li>
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="complexity" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Algorithm Complexity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium">Time Complexity</h3>
                    <div className="bg-muted p-3 rounded-md mt-2">
                      <code className="font-mono text-lg">{algorithmInfo.timeComplexity}</code>
                    </div>
                    <p className="mt-2">
                      {algorithm === 'brute-force' && 
                       "Where n is the number of nodes. The algorithm explores all possible permutations of intermediate nodes, resulting in factorial time complexity. This makes it impractical for large graphs but guarantees the optimal solution."}
                      
                      {algorithm === 'dynamic-programming' && 
                       "Where n is the number of nodes and m is the number of edges. The memoization technique reduces redundant calculations, but in the worst case, it may still need to explore exponential number of states."}
                      
                      {algorithm === 'nearest-neighbor' && 
                       "Where n is the number of nodes and m is the number of edges. At each step, the algorithm examines all neighbors of the current node, making it much faster than exhaustive approaches but potentially suboptimal."}
                      
                      {algorithm === 'branch-and-bound' && 
                       "The actual runtime heavily depends on the quality of the heuristic function and pruning effectiveness. With good bounds, it can significantly outperform brute force while still guaranteeing optimality."}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Space Complexity</h3>
                    <div className="bg-muted p-3 rounded-md mt-2">
                      <code className="font-mono text-lg">{algorithmInfo.spaceComplexity}</code>
                    </div>
                    <p className="mt-2">
                      {algorithm === 'brute-force' && 
                       "Space is needed to store the current path being explored and the best path found so far. The recursion depth is limited by the number of nodes."}
                      
                      {algorithm === 'dynamic-programming' && 
                       "The algorithm requires space for the memoization table, visited set, and recursion stack. In worst case, it might need to store exponential number of states."}
                      
                      {algorithm === 'nearest-neighbor' && 
                       "Space is needed for the visited set, current path, and neighbor exploration. The space requirement is linear in the number of nodes."}
                      
                      {algorithm === 'branch-and-bound' && 
                       "Space is required for the priority queue, which in worst case might contain exponential number of states. The actual space usage depends on pruning effectiveness."}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium">Comparison with Other Algorithms</h3>
                  <div className="overflow-x-auto mt-2">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 text-left font-medium">Aspect</th>
                          <th className="py-2 px-4 text-left font-medium">Brute Force</th>
                          <th className="py-2 px-4 text-left font-medium">Dynamic Programming</th>
                          <th className="py-2 px-4 text-left font-medium">Nearest Neighbor</th>
                          <th className="py-2 px-4 text-left font-medium">Branch and Bound</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="py-2 px-4 font-medium">Time Complexity</td>
                          <td className="py-2 px-4">O(n!)</td>
                          <td className="py-2 px-4">O(n·2ⁿ)</td>
                          <td className="py-2 px-4">O(n·m)</td>
                          <td className="py-2 px-4">O(2ⁿ)*</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 font-medium">Optimal Solution</td>
                          <td className="py-2 px-4">Yes</td>
                          <td className="py-2 px-4">Yes</td>
                          <td className="py-2 px-4">No</td>
                          <td className="py-2 px-4">Yes</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 font-medium">Practical for Large Graphs</td>
                          <td className="py-2 px-4">No</td>
                          <td className="py-2 px-4">Limited</td>
                          <td className="py-2 px-4">Yes</td>
                          <td className="py-2 px-4">Better than Brute Force</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 font-medium">Memory Usage</td>
                          <td className="py-2 px-4">Low</td>
                          <td className="py-2 px-4">High</td>
                          <td className="py-2 px-4">Low</td>
                          <td className="py-2 px-4">Variable</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-xs mt-2">* Branch and Bound complexity depends on pruning quality</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="visualization" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Algorithm Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-6">
                  {algorithm === 'brute-force' && 
                   "The Brute Force algorithm works by generating all possible permutations of intermediate nodes and calculating the total path cost for each route. Here's how it would execute on a simple graph:"}
                  {algorithm === 'dynamic-programming' && 
                   "Dynamic Programming algorithm uses memoization to store previously computed shortest paths, avoiding redundant calculations. This visualization shows how it would explore nodes in a graph:"}
                  {algorithm === 'nearest-neighbor' && 
                   "The Nearest Neighbor algorithm works by always choosing the nearest unvisited node as the next step in the path construction. This visualization shows how it would explore nodes in a graph:"}
                  {algorithm === 'branch-and-bound' && 
                   "Branch and Bound algorithm systematically explores the solution space while using bounds to prune unpromising branches. This visualization shows how it would explore nodes in a graph:"}
                </p>
                
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium mb-4">Pseudocode</h3>
                  <pre className="font-mono text-sm overflow-x-auto p-2">
                    {algorithm === 'brute-force' && 
                     `function brute_force(graph, source, destination):
    generate all permutations of intermediate nodes between source and destination
    for each permutation, create a complete path from source to destination
    calculate the total cost for each path by summing edge weights
    compare all paths and select the one with minimum cost
    return the optimal path and its total cost`}
                    
                    {algorithm === 'dynamic-programming' && 
                     `function dynamic_programming(graph, source, destination):
    initialize memoization table to store computed subproblem results
    for each node, recursively compute shortest path to destination
    store results in memo table to avoid recomputation
    use visited set to prevent cycles during exploration
    return optimal path by combining cached subproblem solutions`}
                    
                    {algorithm === 'nearest-neighbor' && 
                     `function nearest_neighbor(graph, source, destination):
    start at the source node and mark it as visited
    from current node, find all unvisited neighboring nodes
    select the neighbor with minimum edge weight (nearest neighbor)
    move to selected neighbor and mark it as visited
    repeat until destination is reached or no unvisited neighbors exist`}
                    
                    {algorithm === 'branch-and-bound' && 
                     `function branch_and_bound(graph, source, destination):
    initialize priority queue with source node and upper bound to infinity
    for each state, calculate lower bound using heuristic (e.g., straight-line distance)
    expand only states whose lower bound is less than current upper bound
    when destination is reached, update upper bound if better solution found
    continue until queue is empty or optimal solution confirmed`}
                  </pre>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Execution Steps</h3>
                  {result ? (
                    <div className="space-y-4">
                      <p>
                        {algorithm === 'brute-force' && 
                         "In the simulation, the Brute Force algorithm generated all possible permutations of intermediate nodes and calculated the total path cost for each route. It selected the route with the minimum cost."}
                        {algorithm === 'dynamic-programming' && 
                         "The Dynamic Programming algorithm in this simulation used memoization to store previously computed shortest paths, avoiding redundant calculations. It explored nodes in a graph and selected the optimal path."}
                        {algorithm === 'nearest-neighbor' && 
                         "The Nearest Neighbor algorithm in this simulation always chose the nearest unvisited node as the next step in the path construction. It explored nodes in a graph and selected the optimal path."}
                        {algorithm === 'branch-and-bound' && 
                         "The Branch and Bound algorithm in this simulation systematically explored the solution space while using bounds to prune unpromising branches. It selected the optimal path."}
                      </p>
                      
                      <div className="border border-border rounded-md p-4">
                        <h4 className="font-medium mb-2">Path Found</h4>
                        <p>
                          {result.path.length > 0 ? 
                           `The algorithm found a path through ${result.path.length} nodes with a total distance of ${(result.metrics.distance / 1000).toFixed(2)} km.` : 
                           "No path was found between the selected locations."}
                        </p>
                        {result.path.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {result.path.map((nodeId, index) => (
                              <React.Fragment key={nodeId}>
                                <span className="px-2 py-1 bg-primary/10 rounded">{nodeId}</span>
                                {index < result.path.length - 1 && <span>→</span>}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p>Run the simulation to see a step-by-step visualization of the algorithm execution.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="applications" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Real-World Applications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Common Use Cases</h3>
                  {algorithm === 'brute-force' && (
                    <div className="mt-2 space-y-4">
                      <p>
                        The Brute Force algorithm is useful in scenarios where finding the shortest or least-cost path is critical and the graph is small enough to explore all possible paths.
                      </p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <strong>Optimization Problems:</strong> Used in optimization problems where the goal is to find the best possible solution among many alternatives.
                        </li>
                        <li>
                          <strong>Game Development:</strong> Used in game development for pathfinding in complex environments.
                        </li>
                        <li>
                          <strong>Network Routing:</strong> Used in network routing to find the most efficient path for data packets.
                        </li>
                        <li>
                          <strong>Robotics:</strong> Used for path planning in robotics navigation systems.
                        </li>
                      </ul>
                    </div>
                  )}
                  
                  {algorithm === 'dynamic-programming' && (
                    <div className="mt-2 space-y-4">
                      <p>
                        Dynamic Programming is particularly useful in scenarios where the problem can be broken down into overlapping subproblems and optimal solutions to subproblems can be combined to solve the original problem.
                      </p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <strong>Optimization Problems:</strong> Used in optimization problems where the goal is to find the best possible solution among many alternatives.
                        </li>
                        <li>
                          <strong>Game Development:</strong> Used in game development for pathfinding in complex environments.
                        </li>
                        <li>
                          <strong>Network Routing:</strong> Used in network routing to find the most efficient path for data packets.
                        </li>
                        <li>
                          <strong>Robotics:</strong> Used for path planning in robotics navigation systems.
                        </li>
                      </ul>
                    </div>
                  )}
                  
                  {algorithm === 'nearest-neighbor' && (
                    <div className="mt-2 space-y-4">
                      <p>
                        The Nearest Neighbor algorithm is a greedy approach that is useful in scenarios where the graph is small and the goal is to find a good approximate solution quickly.
                      </p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <strong>Optimization Problems:</strong> Used in optimization problems where the goal is to find the best possible solution among many alternatives.
                        </li>
                        <li>
                          <strong>Game Development:</strong> Used in game development for pathfinding in complex environments.
                        </li>
                        <li>
                          <strong>Network Routing:</strong> Used in network routing to find the most efficient path for data packets.
                        </li>
                        <li>
                          <strong>Robotics:</strong> Used for path planning in robotics navigation systems.
                        </li>
                      </ul>
                    </div>
                  )}
                  
                  {algorithm === 'branch-and-bound' && (
                    <div className="mt-2 space-y-4">
                      <p>
                        Branch and Bound is a systematic approach that is useful in scenarios where the problem can be broken down into overlapping subproblems and optimal solutions to subproblems can be combined to solve the original problem.
                      </p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <strong>Optimization Problems:</strong> Used in optimization problems where the goal is to find the best possible solution among many alternatives.
                        </li>
                        <li>
                          <strong>Game Development:</strong> Used in game development for pathfinding in complex environments.
                        </li>
                        <li>
                          <strong>Network Routing:</strong> Used in network routing to find the most efficient path for data packets.
                        </li>
                        <li>
                          <strong>Robotics:</strong> Used for path planning in robotics navigation systems.
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium">Performance in Different Scenarios</h3>
                  <div className="overflow-x-auto mt-2">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 text-left font-medium">Scenario</th>
                          <th className="py-2 px-4 text-left font-medium">Performance</th>
                          <th className="py-2 px-4 text-left font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {algorithm === 'brute-force' && (
                          <>
                            <tr>
                              <td className="py-2 px-4 font-medium">Small graphs</td>
                              <td className="py-2 px-4">Good</td>
                              <td className="py-2 px-4">Efficient for small graphs where all possible paths can be explored</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 font-medium">Large graphs</td>
                              <td className="py-2 px-4">Poor</td>
                              <td className="py-2 px-4">Impractical for large graphs due to factorial time complexity</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 font-medium">Dynamic conditions</td>
                              <td className="py-2 px-4">Good</td>
                              <td className="py-2 px-4">Can be rerun efficiently when edge weights change</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 font-medium">Negative weights</td>
                              <td className="py-2 px-4">Poor</td>
                              <td className="py-2 px-4">Cannot handle negative edge weights</td>
                            </tr>
                          </>
                        )}
                        
                        {algorithm === 'dynamic-programming' && (
                          <>
                            <tr>
                              <td className="py-2 px-4 font-medium">Small graphs</td>
                              <td className="py-2 px-4">Good</td>
                              <td className="py-2 px-4">Efficient for small graphs where all possible paths can be explored</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 font-medium">Large graphs</td>
                              <td className="py-2 px-4">Poor</td>
                              <td className="py-2 px-4">Impractical for large graphs due to exponential time complexity</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 font-medium">Dynamic conditions</td>
                              <td className="py-2 px-4">Good</td>
                              <td className="py-2 px-4">Can be rerun efficiently when edge weights change</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 font-medium">Negative weights</td>
                              <td className="py-2 px-4">Poor</td>
                              <td className="py-2 px-4">Cannot handle negative edge weights</td>
                            </tr>
                          </>
                        )}
                        
                        {algorithm === 'nearest-neighbor' && (
                          <>
                            <tr>
                              <td className="py-2 px-4 font-medium">Small graphs</td>
                              <td className="py-2 px-4">Good</td>
                              <td className="py-2 px-4">Efficient for small graphs where all possible paths can be explored</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 font-medium">Large graphs</td>
                              <td className="py-2 px-4">Poor</td>
                              <td className="py-2 px-4">Impractical for large graphs due to exponential time complexity</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 font-medium">Dynamic conditions</td>
                              <td className="py-2 px-4">Good</td>
                              <td className="py-2 px-4">Can be rerun efficiently when edge weights change</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 font-medium">Negative weights</td>
                              <td className="py-2 px-4">Poor</td>
                              <td className="py-2 px-4">Cannot handle negative edge weights</td>
                            </tr>
                          </>
                        )}
                        
                        {algorithm === 'branch-and-bound' && (
                          <>
                            <tr>
                              <td className="py-2 px-4 font-medium">Small graphs</td>
                              <td className="py-2 px-4">Good</td>
                              <td className="py-2 px-4">Efficient for small graphs where all possible paths can be explored</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 font-medium">Large graphs</td>
                              <td className="py-2 px-4">Poor</td>
                              <td className="py-2 px-4">Impractical for large graphs due to exponential time complexity</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 font-medium">Dynamic conditions</td>
                              <td className="py-2 px-4">Good</td>
                              <td className="py-2 px-4">Can be rerun efficiently when edge weights change</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 font-medium">Negative weights</td>
                              <td className="py-2 px-4">Poor</td>
                              <td className="py-2 px-4">Cannot handle negative edge weights</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium">Relevance to Current Technology</h3>
                  <p className="mt-2">
                    {algorithm === 'brute-force' && 
                     "Despite being developed in 1956, the Brute Force algorithm remains fundamental to modern navigation systems and network routing. It forms the basis for many specialized routing algorithms and continues to be enhanced with various optimizations like bidirectional search and hierarchical techniques."}
                    
                    {algorithm === 'dynamic-programming' && 
                     "Dynamic Programming is a powerful algorithm that is widely used in optimization problems and game development. It is particularly useful in scenarios where the problem can be broken down into overlapping subproblems and optimal solutions to subproblems can be combined to solve the original problem."}
                    
                    {algorithm === 'nearest-neighbor' && 
                     "The Nearest Neighbor algorithm is a simple and efficient approach that is useful in scenarios where the graph is small and the goal is to find a good approximate solution quickly."}
                    
                    {algorithm === 'branch-and-bound' && 
                     "Branch and Bound is a systematic approach that is useful in scenarios where the problem can be broken down into overlapping subproblems and optimal solutions to subproblems can be combined to solve the original problem."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explanation;
