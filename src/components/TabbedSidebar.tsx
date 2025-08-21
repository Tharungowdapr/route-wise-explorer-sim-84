
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from './Sidebar';
import ScenarioManager from './ScenarioManager';
import { SimulationParams } from '../types';
import { Settings, Save } from 'lucide-react';

interface TabbedSidebarProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  onRunSimulation: () => void;
}

const TabbedSidebar: React.FC<TabbedSidebarProps> = ({
  params,
  setParams,
  onRunSimulation,
}) => {
  const [activeTab, setActiveTab] = useState('simulation');

  // Emit custom event when tab changes
  useEffect(() => {
    const event = new CustomEvent('sidebar-tab-change', { detail: activeTab });
    window.dispatchEvent(event);
  }, [activeTab]);

  return (
    <div className="bg-sidebar p-4 rounded-lg w-80 flex flex-col gap-2 h-full max-h-screen overflow-hidden">
      <div className="flex items-center justify-center mb-2">
        <h2 className="text-sidebar-foreground text-2xl font-bold">RouteWise Explorer</h2>
      </div>
      
      <Tabs 
        defaultValue="simulation" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="simulation" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Simulation</span>
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center gap-1">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Scenarios</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-auto">
          <TabsContent value="simulation" className="h-full mt-0">
            <Sidebar 
              params={params}
              setParams={setParams}
              onRunSimulation={onRunSimulation}
              tabbed={true}
            />
          </TabsContent>
          
          <TabsContent value="scenarios" className="h-full mt-0">
            <ScenarioManager
              currentParams={params}
              onLoadScenario={(scenarioParams) => setParams(scenarioParams)}
              onRunSimulation={onRunSimulation}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default TabbedSidebar;
