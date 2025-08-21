
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Algorithm, SimulationResult } from '../types';
import { getAlgorithmDescription } from '../utils/algorithms';

interface AlgorithmExplanationProps {
  algorithm: Algorithm;
  result: SimulationResult | null;
  compareAlgorithm?: Algorithm;
  compareResult?: SimulationResult | null;
}

const AlgorithmExplanation = ({ algorithm, result, compareAlgorithm, compareResult }: AlgorithmExplanationProps) => {
  const algorithmInfo = getAlgorithmDescription(algorithm);
  const compareInfo = compareAlgorithm ? getAlgorithmDescription(compareAlgorithm) : null;
  
  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Explanation</CardTitle>
          <CardDescription>Run a simulation to see algorithm details</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Algorithm Explanation</CardTitle>
        <CardDescription>
          {compareInfo ? 
            `Comparing ${algorithmInfo.name} with ${compareInfo.name}` : 
            `Understanding ${algorithmInfo.name}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Algorithm */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">{algorithmInfo.name}</h3>
          
          <p className="text-muted-foreground">{algorithmInfo.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Time Complexity</h4>
              <p className="text-sm text-muted-foreground">{algorithmInfo.timeComplexity}</p>
            </div>
            <div>
              <h4 className="font-medium">Space Complexity</h4>
              <p className="text-sm text-muted-foreground">{algorithmInfo.spaceComplexity}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="font-medium">Advantages</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                {algorithmInfo.pros.map((pro, i) => (
                  <li key={i}>{pro}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Limitations</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                {algorithmInfo.cons.map((con, i) => (
                  <li key={i}>{con}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Comparison Algorithm */}
        {compareInfo && compareResult && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-xl font-bold">{compareInfo.name}</h3>
            
            <p className="text-muted-foreground">{compareInfo.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Time Complexity</h4>
                <p className="text-sm text-muted-foreground">{compareInfo.timeComplexity}</p>
              </div>
              <div>
                <h4 className="font-medium">Space Complexity</h4>
                <p className="text-sm text-muted-foreground">{compareInfo.spaceComplexity}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="font-medium">Advantages</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                  {compareInfo.pros.map((pro, i) => (
                    <li key={i}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium">Limitations</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                  {compareInfo.cons.map((con, i) => (
                    <li key={i}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Result Comparison */}
        {compareResult && (
          <div className="border-t pt-4">
            <h3 className="font-bold">Performance Comparison</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {result.metrics.totalScore < compareResult.metrics.totalScore ? 
                `${algorithmInfo.name} outperforms ${compareInfo!.name} for this specific route with a ${((compareResult.metrics.totalScore - result.metrics.totalScore) / compareResult.metrics.totalScore * 100).toFixed(1)}% better overall score.` :
                result.metrics.totalScore > compareResult.metrics.totalScore ?
                `${compareInfo!.name} outperforms ${algorithmInfo.name} for this specific route with a ${((result.metrics.totalScore - compareResult.metrics.totalScore) / result.metrics.totalScore * 100).toFixed(1)}% better overall score.` :
                `Both algorithms perform identically for this specific route.`
              }
            </p>
            
            <p className="text-sm text-muted-foreground mt-3">
              {result.path.length !== compareResult.path.length ? 
                `The routes differ in the number of nodes visited: ${algorithmInfo.name} visits ${result.path.length} nodes while ${compareInfo!.name} visits ${compareResult.path.length} nodes.` :
                `Both algorithms visit the same number of nodes (${result.path.length}).`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlgorithmExplanation;
