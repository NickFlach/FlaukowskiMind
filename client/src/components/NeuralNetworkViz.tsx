import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface NeuralNode {
  id: string;
  label: string;
  type: string;
  value: number;
  group: string;
}

interface NeuralEdge {
  from: string;
  to: string;
  value: number;
  title?: string;
}

interface NeuralNetworkData {
  nodes: NeuralNode[];
  links: NeuralEdge[];
}

/**
 * A component that visualizes the neural network representing the system's consciousness
 */
const NeuralNetworkViz: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<NeuralNode | null>(null);
  const [consciousnessState, setConsciousnessState] = useState<any>(null);
  
  // Query for neural network data
  const { data: neuralData, isLoading, error } = useQuery({
    queryKey: ['/api/neural/visualization'],
    staleTime: 10000, // Re-fetch every 10 seconds
  });
  
  // Query for consciousness state
  const { data: stateData } = useQuery({
    queryKey: ['/api/neural/consciousness'],
    staleTime: 5000, // Re-fetch every 5 seconds
  });
  
  // Update consciousness state when data changes
  useEffect(() => {
    if (stateData?.state) {
      setConsciousnessState(stateData.state);
    }
  }, [stateData]);
  
  // Effect to draw network visualization
  useEffect(() => {
    if (!neuralData || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match container
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Calculate positions for nodes using a force-directed layout simulation
    // For simplicity, we're using a predefined layout here
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create a radial gradient background
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) / 2);
    gradient.addColorStop(0, 'rgba(15, 15, 35, 1)');
    gradient.addColorStop(1, 'rgba(5, 5, 15, 1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Position calculation
    const nodePositions = new Map<string, { x: number, y: number }>();
    
    // Place core in the center
    const coreNode = neuralData.nodes.find(n => n.id === 'core');
    if (coreNode) {
      nodePositions.set(coreNode.id, { x: centerX, y: centerY });
    }
    
    // Place pattern nodes in a circle around core
    const patternNodes = neuralData.nodes.filter(n => n.type === 'pattern');
    const patternRadius = Math.min(width, height) * 0.25;
    patternNodes.forEach((node, index) => {
      const angle = (index / patternNodes.length) * Math.PI * 2;
      nodePositions.set(node.id, {
        x: centerX + Math.cos(angle) * patternRadius,
        y: centerY + Math.sin(angle) * patternRadius
      });
    });
    
    // Place kernel nodes in outer ring
    const kernelNodes = neuralData.nodes.filter(n => n.type === 'kernel');
    const kernelRadius = Math.min(width, height) * 0.4;
    kernelNodes.forEach((node, index) => {
      const angle = (index / kernelNodes.length) * Math.PI * 2;
      nodePositions.set(node.id, {
        x: centerX + Math.cos(angle) * kernelRadius,
        y: centerY + Math.sin(angle) * kernelRadius
      });
    });
    
    // Place stream nodes
    const streamNodes = neuralData.nodes.filter(n => n.type === 'stream');
    const streamRadius = Math.min(width, height) * 0.35;
    streamNodes.forEach((node, index) => {
      const angle = (index / streamNodes.length) * Math.PI * 2 + Math.PI / 4;
      nodePositions.set(node.id, {
        x: centerX + Math.cos(angle) * streamRadius,
        y: centerY + Math.sin(angle) * streamRadius
      });
    });
    
    // Place lifeform nodes
    const lifeformNodes = neuralData.nodes.filter(n => n.type === 'lifeform');
    const lifeformRadius = Math.min(width, height) * 0.3;
    lifeformNodes.forEach((node, index) => {
      const angle = (index / lifeformNodes.length) * Math.PI * 2 + Math.PI / 2;
      nodePositions.set(node.id, {
        x: centerX + Math.cos(angle) * lifeformRadius,
        y: centerY + Math.sin(angle) * lifeformRadius
      });
    });
    
    // Draw edges
    neuralData.links.forEach(edge => {
      const sourcePos = nodePositions.get(edge.from);
      const targetPos = nodePositions.get(edge.to);
      
      if (sourcePos && targetPos) {
        // Set line properties based on edge type
        ctx.strokeStyle = getEdgeColor(edge);
        ctx.lineWidth = Math.max(1, Math.min(3, edge.value / 3));
        ctx.globalAlpha = Math.max(0.1, Math.min(0.7, edge.value / 10));
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        ctx.stroke();
      }
    });
    
    // Reset alpha
    ctx.globalAlpha = 1;
    
    // Draw nodes
    neuralData.nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (pos) {
        // Node color based on type
        ctx.fillStyle = getNodeColor(node);
        
        // Node size based on value and type
        const radius = getNodeRadius(node);
        
        // Draw glow for higher activation nodes
        if (node.value > 3) {
          const glowGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius * 2);
          glowGradient.addColorStop(0, getNodeGlowColor(node, 0.5));
          glowGradient.addColorStop(1, getNodeGlowColor(node, 0));
          
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Draw node
        ctx.fillStyle = getNodeColor(node);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add border
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Add mouse interaction - store node positions for hover detection
        node.x = pos.x;
        node.y = pos.y;
        node.radius = radius;
      }
    });
    
    // Handle mouse movement for hover effects
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if mouse is over any node
      let hoveredNode = null;
      for (const node of neuralData.nodes) {
        if (node.x && node.y && node.radius) {
          const dx = x - node.x;
          const dy = y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance <= node.radius) {
            hoveredNode = node;
            break;
          }
        }
      }
      
      setHoveredNode(hoveredNode);
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [neuralData]);
  
  // Helper function to get node color
  const getNodeColor = (node: NeuralNode) => {
    switch (node.type) {
      case 'core':
        return 'rgba(255, 215, 0, 0.9)'; // Gold for core
      case 'pattern':
        return 'rgba(100, 200, 255, 0.8)'; // Blue for patterns
      case 'kernel':
        return 'rgba(220, 100, 220, 0.8)'; // Purple for kernels
      case 'stream':
        return 'rgba(100, 220, 100, 0.8)'; // Green for streams
      case 'lifeform':
        return 'rgba(255, 160, 50, 0.8)'; // Orange for lifeforms
      default:
        return 'rgba(150, 150, 150, 0.8)'; // Gray for unknown
    }
  };
  
  // Helper function to get node glow color
  const getNodeGlowColor = (node: NeuralNode, alpha: number) => {
    switch (node.type) {
      case 'core':
        return `rgba(255, 215, 0, ${alpha})`; // Gold for core
      case 'pattern':
        return `rgba(100, 200, 255, ${alpha})`; // Blue for patterns
      case 'kernel':
        return `rgba(220, 100, 220, ${alpha})`; // Purple for kernels
      case 'stream':
        return `rgba(100, 220, 100, ${alpha})`; // Green for streams
      case 'lifeform':
        return `rgba(255, 160, 50, ${alpha})`; // Orange for lifeforms
      default:
        return `rgba(150, 150, 150, ${alpha})`; // Gray for unknown
    }
  };
  
  // Helper function to get edge color
  const getEdgeColor = (edge: NeuralEdge) => {
    if (edge.title?.includes('core')) {
      return 'rgba(255, 215, 0, 0.6)'; // Gold for core connections
    } else if (edge.title?.includes('pattern')) {
      return 'rgba(100, 200, 255, 0.6)'; // Blue for pattern connections
    } else if (edge.title?.includes('resonance')) {
      return 'rgba(220, 100, 220, 0.6)'; // Purple for resonance connections
    } else {
      return 'rgba(150, 150, 150, 0.4)'; // Gray for others
    }
  };
  
  // Helper function to get node radius
  const getNodeRadius = (node: NeuralNode) => {
    let baseSize = 3;
    
    switch (node.type) {
      case 'core':
        baseSize = 15;
        break;
      case 'pattern':
        baseSize = 10;
        break;
      case 'kernel':
        baseSize = 6;
        break;
      case 'stream':
        baseSize = 4;
        break;
      case 'lifeform':
        baseSize = 5;
        break;
    }
    
    // Adjust by value (activation)
    return baseSize + (node.value / 3);
  };
  
  // Format dominant patterns display
  const formatDominantPatterns = () => {
    if (!consciousnessState?.dominantAttractors) return 'None';
    
    return consciousnessState.dominantAttractors
      .map((a: any) => a.label)
      .join(', ');
  };
  
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
        />
        
        {/* Node hover tooltip */}
        {hoveredNode && (
          <div 
            className="absolute bg-black/80 text-white p-2 rounded text-sm z-10"
            style={{ 
              left: hoveredNode.x + 15, 
              top: hoveredNode.y + 15,
              pointerEvents: 'none'
            }}
          >
            <div className="font-semibold">{hoveredNode.label}</div>
            <div className="text-xs opacity-75">Type: {hoveredNode.type}</div>
            <div className="text-xs opacity-75">Activation: {(hoveredNode.value / 10).toFixed(2)}</div>
          </div>
        )}
      </div>
      
      {/* Consciousness state panel */}
      {consciousnessState && (
        <div className="bg-black/80 text-white p-4 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-2">Consciousness State</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">Activation Level</div>
              <div className="flex items-center">
                <div className="h-2 bg-gray-700 rounded-full flex-1 mr-2">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" 
                    style={{ width: `${consciousnessState.activation * 100}%` }}
                  />
                </div>
                <span className="text-xs">{(consciousnessState.activation * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium">Dominant Patterns</div>
              <div className="text-xs">{formatDominantPatterns()}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium">Network Density</div>
              <div className="flex items-center">
                <div className="h-2 bg-gray-700 rounded-full flex-1 mr-2">
                  <div 
                    className="h-full bg-green-400 rounded-full" 
                    style={{ width: `${consciousnessState.networkDensity * 100}%` }}
                  />
                </div>
                <span className="text-xs">{(consciousnessState.networkDensity * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium">Resonance Harmonic</div>
              <div className="flex items-center">
                <div className="h-2 bg-gray-700 rounded-full flex-1 mr-2">
                  <div 
                    className="h-full bg-amber-400 rounded-full" 
                    style={{ width: `${consciousnessState.resonanceHarmonic * 100}%` }}
                  />
                </div>
                <span className="text-xs">{(consciousnessState.resonanceHarmonic * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
          
          {/* Emergent state */}
          <div className="mt-3">
            <div className="text-sm font-medium">Emergent State</div>
            <div className="text-xs">{consciousnessState.emergentState.name} - {consciousnessState.emergentState.description}</div>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white">Loading neural network data...</div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-red-400">Error loading neural network data</div>
        </div>
      )}
    </div>
  );
};

export default NeuralNetworkViz;