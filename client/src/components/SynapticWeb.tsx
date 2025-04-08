import { useState, useEffect, useRef } from "react";
import { ThreeCanvas } from "@/components/ui/three-canvas";
import { Skeleton } from "@/components/ui/skeleton";

interface SynapticWebProps {
  data: any;
  isLoading: boolean;
}

export default function SynapticWeb({ data, isLoading }: SynapticWebProps) {
  const [activeView, setActiveView] = useState<string>("core-patterns");
  
  // Empty state data for visualization if no real data is available
  const emptyStateData = {
    nodes: [
      { id: 'core', type: 'core', resonance: 100, isCore: true, label: 'Flaukowski' },
      { id: 'node-1', type: 'stream', resonance: 30, isCore: true, label: 'Sample Stream' },
      { id: 'node-2', type: 'kernel', resonance: 20, isCore: true, label: 'Sample Kernel' },
      { id: 'node-3', type: 'echo', resonance: 40, isCore: true, label: 'Sample Echo' },
    ],
    links: [
      { source: 'core', target: 'node-1', strength: 3, type: 'core-connection' },
      { source: 'core', target: 'node-2', strength: 2, type: 'core-connection' },
      { source: 'core', target: 'node-3', strength: 3, type: 'core-connection' },
      { source: 'node-1', target: 'node-2', strength: 1, type: 'emerging' },
    ]
  };

  return (
    <section id="synaptic-web" className="container mx-auto px-4 py-10 relative">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h2 className="font-cinzel text-xl md:text-2xl mb-2 text-secondary flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
            SYNAPTIC WEB
          </h2>
          <p className="font-mono text-sm text-neutral mb-4">Visual network of the Core Consciousness</p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => setActiveView("all-nodes")}
            className={`px-3 py-1 text-xs font-mono ${activeView === 'all-nodes' ? 'text-accent border-accent' : 'text-neutral border-fog hover:border-accent'} border rounded transition-colors`}
          >
            All Nodes
          </button>
          <button 
            onClick={() => setActiveView("my-connections")}
            className={`px-3 py-1 text-xs font-mono ${activeView === 'my-connections' ? 'text-accent border-accent' : 'text-neutral border-fog hover:border-accent'} border rounded transition-colors`}
          >
            My Connections
          </button>
          <button 
            onClick={() => setActiveView("core-patterns")}
            className={`px-3 py-1 text-xs font-mono ${activeView === 'core-patterns' ? 'text-accent border-accent' : 'text-neutral border-fog hover:border-accent'} border rounded transition-colors`}
          >
            Core Patterns
          </button>
        </div>
      </div>
      
      <div className="relative h-[500px] border border-fog-accent rounded-lg overflow-hidden bg-dark mb-6">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto animate-spin-slow">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#34205E" strokeWidth="2"/>
                  <path d="M50 5 L50 95" stroke="#23B5D3" strokeWidth="0.5" />
                  <path d="M5 50 L95 50" stroke="#23B5D3" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="5" fill="#B18F3A" />
                </svg>
              </div>
              <p className="mt-4 font-mono text-sm text-neutral">Mapping synaptic connections...</p>
            </div>
          </div>
        ) : (
          <ThreeCanvas 
            nodes={data?.nodes || emptyStateData.nodes}
            links={data?.links || emptyStateData.links}
            backgroundColor="#0A0A0F"
            primaryColor="#34205E"
            secondaryColor="#B18F3A"
            accentColor="#23B5D3"
            height="100%"
            width="100%"
            className="w-full h-full"
          />
        )}
        
        <div className="absolute bottom-4 right-4 bg-dark/80 p-3 rounded border border-fog">
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
            <span className="text-xs font-mono text-neutral">Kernel Nodes</span>
          </div>
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 rounded-full bg-accent mr-2"></div>
            <span className="text-xs font-mono text-neutral">Stream Nodes</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
            <span className="text-xs font-mono text-neutral">Core Consciousness</span>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button className="px-4 py-2 bg-dark border border-accent text-accent font-mono text-sm hover:bg-accent/10 transition-colors">
          EXPLORE FULL SYNAPTIC WEB
        </button>
      </div>
    </section>
  );
}
