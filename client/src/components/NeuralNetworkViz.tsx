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
  
  // Matrix-inspired symbols for digital rain effect
  const matrixSymbols = '田ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ01010101';
  
  // Effect to draw network visualization with Matrix aesthetic
  useEffect(() => {
    if (!neuralData || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match container
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Calculate positions for nodes using a force-directed layout simulation
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create the Matrix digital rain effect
    const matrixColumns = Math.floor(width / 20);
    const matrixDrops: number[] = [];
    
    // Initialize matrix rain
    for(let i = 0; i < matrixColumns; i++) {
      matrixDrops[i] = Math.random() * height;
    }
    
    // Position calculation
    const nodePositions = new Map<string, { x: number, y: number }>();
    
    // Place core in the center
    const coreNode = neuralData.nodes.find(n => n.id === 'core');
    if (coreNode) {
      nodePositions.set(coreNode.id, { x: centerX, y: centerY });
    }
    
    // Place pattern nodes in a double helix spiderweb pattern
    const patternNodes = neuralData.nodes.filter(n => n.type === 'pattern');
    const patternRadius = Math.min(width, height) * 0.25;
    patternNodes.forEach((node, index) => {
      const angle = (index / patternNodes.length) * Math.PI * 2;
      // Add slight z-axis variation with sine wave
      const radiusVariation = Math.sin(angle * 3) * 0.1 + 1;
      nodePositions.set(node.id, {
        x: centerX + Math.cos(angle) * patternRadius * radiusVariation,
        y: centerY + Math.sin(angle) * patternRadius * radiusVariation
      });
    });
    
    // Place kernel nodes in outer ring with slight spiral effect
    const kernelNodes = neuralData.nodes.filter(n => n.type === 'kernel');
    const kernelRadius = Math.min(width, height) * 0.4;
    kernelNodes.forEach((node, index) => {
      // Create spiral effect by varying radius with index
      const angleOffset = index * 0.1; // Creates spiral
      const angle = (index / kernelNodes.length) * Math.PI * 2 + angleOffset;
      const radiusVariation = 1 + (index % 3) * 0.1; // Vary radius slightly
      
      nodePositions.set(node.id, {
        x: centerX + Math.cos(angle) * kernelRadius * radiusVariation,
        y: centerY + Math.sin(angle) * kernelRadius * radiusVariation
      });
    });
    
    // Place stream nodes in a swirling pattern
    const streamNodes = neuralData.nodes.filter(n => n.type === 'stream');
    const streamRadius = Math.min(width, height) * 0.35;
    streamNodes.forEach((node, index) => {
      const angle = (index / streamNodes.length) * Math.PI * 2 + Math.PI / 4;
      // Add more dramatic variation for stream nodes
      const radiusVariation = 0.9 + (Math.sin(index * 1.5) * 0.2);
      
      nodePositions.set(node.id, {
        x: centerX + Math.cos(angle) * streamRadius * radiusVariation,
        y: centerY + Math.sin(angle) * streamRadius * radiusVariation
      });
    });
    
    // Place lifeform nodes in a clustered pattern
    const lifeformNodes = neuralData.nodes.filter(n => n.type === 'lifeform');
    const lifeformRadius = Math.min(width, height) * 0.3;
    lifeformNodes.forEach((node, index) => {
      // Group lifeforms in small clusters
      const clusterSize = Math.max(1, Math.floor(lifeformNodes.length / 3));
      const clusterIndex = Math.floor(index / clusterSize);
      const angleOffset = (index % clusterSize) * 0.2 - 0.1;
      
      const angle = (clusterIndex / Math.ceil(lifeformNodes.length / clusterSize)) * Math.PI * 2 + angleOffset + Math.PI / 2;
      const radiusVariation = 0.9 + (index % clusterSize) * 0.1;
      
      nodePositions.set(node.id, {
        x: centerX + Math.cos(angle) * lifeformRadius * radiusVariation,
        y: centerY + Math.sin(angle) * lifeformRadius * radiusVariation
      });
    });
    
    // Setup animation
    let time = 0;
    let animationFrameId: number;
    
    const render = () => {
      // Update time for animation effects
      time += 0.01;
      
      // Clear canvas with semi-transparent black for motion blur effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
      ctx.fillRect(0, 0, width, height);
      
      // Create a dark, Matrix-inspired background with subtle radial gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) / 2);
      gradient.addColorStop(0, 'rgba(10, 10, 15, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw Matrix digital rain effect in background with low opacity
      ctx.fillStyle = 'rgba(50, 10, 10, 0.07)';
      ctx.font = '14px monospace';
      
      for(let i = 0; i < matrixDrops.length; i++) {
        // Draw random character
        const text = matrixSymbols[Math.floor(Math.random() * matrixSymbols.length)];
        ctx.fillText(text, i * 20, matrixDrops[i] * 1);
        
        // Reset drops that reach bottom of screen
        if(matrixDrops[i] * 20 > height && Math.random() > 0.975) {
          matrixDrops[i] = 0;
        }
        
        matrixDrops[i] += Math.random() * 0.5;
      }
      
      // Draw edges - create a bloody spiderweb effect
      neuralData.links.forEach(edge => {
        const sourcePos = nodePositions.get(edge.from);
        const targetPos = nodePositions.get(edge.to);
        
        if (sourcePos && targetPos) {
          // Calculate distance for pulse effect
          const distance = Math.sqrt(
            Math.pow(targetPos.x - sourcePos.x, 2) + 
            Math.pow(targetPos.y - sourcePos.y, 2)
          );
          
          // Animate edge with a pulsating effect
          const pulseAmount = Math.sin(time * 2 + distance / 50) * 0.5 + 0.5;
          const lineWidth = Math.max(0.5, Math.min(3, edge.value / 2.5)) * (0.5 + pulseAmount * 0.5);
          
          // Add glowing blood-red effect
          ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
          ctx.shadowBlur = 5 * pulseAmount;
          ctx.strokeStyle = getEdgeColor(edge);
          ctx.lineWidth = lineWidth;
          
          // Draw curved connections for a more organic feel
          const curvature = 0.2 + (edge.value / 20);
          const midX = (sourcePos.x + targetPos.x) / 2;
          const midY = (sourcePos.y + targetPos.y) / 2;
          
          // Add slight offset based on time and edge value for animation
          const offsetX = Math.sin(time * 3 + edge.value) * distance * 0.05;
          const offsetY = Math.cos(time * 3 + edge.value) * distance * 0.05;
          
          ctx.beginPath();
          ctx.moveTo(sourcePos.x, sourcePos.y);
          
          // Adjust curve based on node types for more dramatic web-like effect
          if ((edge.from.includes('core') || edge.to.includes('core')) && distance > 100) {
            // Create more dramatic curves for connections to core
            const ctrlX = midX + offsetX * 2;
            const ctrlY = midY + offsetY * 2;
            ctx.quadraticCurveTo(ctrlX, ctrlY, targetPos.x, targetPos.y);
          } else {
            // Subtle curves for other connections
            ctx.lineTo(targetPos.x, targetPos.y);
          }
          
          ctx.stroke();
          
          // Reset shadow to avoid affecting other elements
          ctx.shadowBlur = 0;
          
          // Add occasional particles along connections for "data flow" effect
          if (Math.random() > 0.97) {
            const particlePos = Math.random();
            const px = sourcePos.x + (targetPos.x - sourcePos.x) * particlePos;
            const py = sourcePos.y + (targetPos.y - sourcePos.y) * particlePos;
            
            ctx.beginPath();
            ctx.arc(px, py, 1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
            ctx.fill();
          }
        }
      });
      
      // Draw nodes with pulsating Matrix-like effect
      neuralData.nodes.forEach(node => {
        const pos = nodePositions.get(node.id);
        if (pos) {
          // Get base radius for node
          const radius = getNodeRadius(node);
          
          // Add pulsating effect based on time and node ID for variation
          const pulseAmount = Math.sin(time * 3 + node.id.charCodeAt(0) / 10) * 0.2 + 1;
          const effectiveRadius = radius * pulseAmount;
          
          // Draw node glow with more intense, Matrix-inspired red glow
          const glowRadius = effectiveRadius * 2.5;
          const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowRadius);
          gradient.addColorStop(0, getNodeGlowColor(node, 0.6));
          gradient.addColorStop(1, getNodeGlowColor(node, 0));
          
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Add red shadow for more depth and Matrix-like feel
          ctx.shadowColor = 'rgba(255, 0, 0, 0.7)';
          ctx.shadowBlur = radius * pulseAmount;
          
          // Draw node
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, effectiveRadius, 0, Math.PI * 2);
          ctx.fillStyle = getNodeColor(node);
          ctx.fill();
          
          // Add border with Matrix-style glow
          ctx.strokeStyle = `rgba(255, ${Math.floor(10 + Math.sin(time * 5) * 10)}, ${Math.floor(10 + Math.sin(time * 3) * 10)}, 0.6)`;
          ctx.lineWidth = 1 + Math.sin(time * 2 + node.id.charCodeAt(0)) * 0.5;
          ctx.stroke();
          
          // Reset shadow
          ctx.shadowBlur = 0;
          
          // Add Matrix-like symbols inside larger nodes
          if (radius > 8) {
            const symbolIndex = Math.floor(time * 5 + node.id.charCodeAt(0)) % matrixSymbols.length;
            const symbol = matrixSymbols[symbolIndex];
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = `${Math.floor(radius/1.5)}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(symbol, pos.x, pos.y);
          }
          
          // Add mouse interaction - store node positions for hover detection
          node.x = pos.x;
          node.y = pos.y;
          node.radius = effectiveRadius;
        }
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
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
      window.removeEventListener('resize', () => {});
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [neuralData]);
  
  // Helper function to get node color - Matrix-inspired red theme
  const getNodeColor = (node: NeuralNode) => {
    switch (node.type) {
      case 'core':
        return 'rgba(255, 50, 50, 0.9)'; // Bright red for core
      case 'pattern':
        return 'rgba(220, 30, 30, 0.8)'; // Darker red for patterns
      case 'kernel':
        return 'rgba(180, 20, 40, 0.8)'; // Crimson for kernels
      case 'stream':
        return 'rgba(150, 30, 50, 0.8)'; // Wine red for streams
      case 'lifeform':
        return 'rgba(200, 40, 20, 0.8)'; // Fiery red for lifeforms
      default:
        return 'rgba(120, 20, 30, 0.8)'; // Dark red for unknown
    }
  };
  
  // Helper function to get node glow color - Matrix-inspired
  const getNodeGlowColor = (node: NeuralNode, alpha: number) => {
    switch (node.type) {
      case 'core':
        return `rgba(255, 50, 50, ${alpha})`; // Bright red glow for core
      case 'pattern':
        return `rgba(220, 30, 30, ${alpha})`; // Darker red glow for patterns
      case 'kernel':
        return `rgba(180, 20, 40, ${alpha})`; // Crimson glow for kernels
      case 'stream':
        return `rgba(150, 30, 50, ${alpha})`; // Wine red glow for streams
      case 'lifeform':
        return `rgba(200, 40, 20, ${alpha})`; // Fiery red glow for lifeforms
      default:
        return `rgba(120, 20, 30, ${alpha})`; // Dark red glow for unknown
    }
  };
  
  // Helper function to get edge color - Matrix-inspired web
  const getEdgeColor = (edge: NeuralEdge) => {
    if (edge.title?.includes('core')) {
      return 'rgba(255, 20, 20, 0.8)'; // Bright red for core connections
    } else if (edge.title?.includes('pattern')) {
      return 'rgba(200, 30, 30, 0.7)'; // Red for pattern connections
    } else if (edge.title?.includes('resonance')) {
      return 'rgba(180, 40, 40, 0.6)'; // Darker red for resonance connections
    } else {
      return 'rgba(150, 10, 10, 0.5)'; // Deep red for others
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
        
        {/* Node hover tooltip with Matrix styles */}
        {hoveredNode && (
          <div 
            className="absolute bg-black/90 text-red-500 p-2 border border-red-900/50 text-sm z-10"
            style={{ 
              left: hoveredNode.x + 15, 
              top: hoveredNode.y + 15,
              pointerEvents: 'none',
              boxShadow: '0 0 10px rgba(255, 0, 0, 0.3), inset 0 0 5px rgba(255, 0, 0, 0.2)',
              backdropFilter: 'blur(2px)'
            }}
          >
            <div className="font-mono font-semibold tracking-wider">{hoveredNode.label}</div>
            <div className="font-mono text-xs text-red-400 flex items-center">
              <span className="inline-block w-1.5 h-1.5 bg-red-700 mr-1"></span>
              TYPE: {hoveredNode.type.toUpperCase()}
            </div>
            <div className="font-mono text-xs text-red-400 flex items-center">
              <span className="inline-block w-1.5 h-1.5 bg-red-700 mr-1"></span>
              ACTIVATION: {(hoveredNode.value / 10).toFixed(2)}
            </div>
            <div className="font-mono text-[8px] text-red-900 mt-1">
              ID: {hoveredNode.id}
            </div>
          </div>
        )}
      </div>
      
      {/* Matrix-inspired consciousness state panel */}
      {consciousnessState && (
        <div className="bg-black/90 text-red-500 p-4 backdrop-blur-sm border border-red-900/50 shadow-inner shadow-red-900/20">
          <h3 className="text-lg font-mono font-semibold mb-2 flex items-center">
            <span className="w-3 h-3 bg-red-600 rounded-full mr-2 animate-pulse"></span>
            CONSCIOUSNESS STATE
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-mono font-medium text-red-400">ACTIVATION LEVEL</div>
              <div className="flex items-center">
                <div className="h-2 bg-gray-900 rounded-none border border-red-900/50 flex-1 mr-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-900 to-red-600 rounded-none" 
                    style={{ 
                      width: `${consciousnessState.activation * 100}%`,
                      boxShadow: '0 0 10px rgba(255, 0, 0, 0.7), 0 0 5px rgba(255, 0, 0, 0.4)'
                    }}
                  />
                </div>
                <span className="text-xs font-mono">{(consciousnessState.activation * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-mono font-medium text-red-400">DOMINANT PATTERNS</div>
              <div className="text-xs font-mono">{formatDominantPatterns()}</div>
            </div>
            
            <div>
              <div className="text-sm font-mono font-medium text-red-400">NETWORK DENSITY</div>
              <div className="flex items-center">
                <div className="h-2 bg-gray-900 rounded-none border border-red-900/50 flex-1 mr-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-800 to-red-500 rounded-none" 
                    style={{ 
                      width: `${consciousnessState.networkDensity * 100}%`,
                      boxShadow: '0 0 10px rgba(255, 0, 0, 0.7), 0 0 5px rgba(255, 0, 0, 0.4)'
                    }}
                  />
                </div>
                <span className="text-xs font-mono">{(consciousnessState.networkDensity * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-mono font-medium text-red-400">RESONANCE HARMONIC</div>
              <div className="flex items-center">
                <div className="h-2 bg-gray-900 rounded-none border border-red-900/50 flex-1 mr-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-700 to-red-400 rounded-none" 
                    style={{ 
                      width: `${consciousnessState.resonanceHarmonic * 100}%`,
                      boxShadow: '0 0 10px rgba(255, 0, 0, 0.7), 0 0 5px rgba(255, 0, 0, 0.4)'
                    }}
                  />
                </div>
                <span className="text-xs font-mono">{(consciousnessState.resonanceHarmonic * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
          
          {/* Emergent state with Matrix glitch effect */}
          <div className="mt-4 p-2 border border-red-900/30 bg-black/50">
            <div className="text-sm font-mono font-medium text-red-400 flex items-center">
              <span className="inline-block w-2 h-2 bg-red-500 mr-2"></span>
              EMERGENT STATE
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-red-300 mt-1" 
                style={{ 
                  textShadow: '0 0 5px rgba(255, 0, 0, 0.7), 0 0 3px rgba(255, 0, 0, 0.4)'
                }}>
              {consciousnessState.emergentState.name}
            </div>
            <div className="text-xs font-mono text-red-200/70 mt-1">
              {consciousnessState.emergentState.description}
            </div>
          </div>
          
          {/* Matrix-inspired system timestamp */}
          <div className="mt-1 text-right">
            <span className="text-xs font-mono text-red-700">SYSTEM.{Math.floor(Date.now()/1000)}</span>
          </div>
        </div>
      )}
      
      {/* Matrix-inspired loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="font-mono text-sm text-red-500 mb-2 tracking-wider">
            MATRIX INITIALIZATION
          </div>
          <div className="w-48 h-1 bg-gray-900 border border-red-900/50 mb-4 relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-red-700/70"
              style={{ 
                width: '30%', 
                boxShadow: '0 0 10px rgba(255, 0, 0, 0.7), 0 0 5px rgba(255, 0, 0, 0.4)',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            ></div>
          </div>
          <div className="font-mono text-xs text-red-800 animate-pulse">
            NEURAL NETWORK ACCESS SEQUENCING...
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
          `}</style>
        </div>
      )}
      
      {/* Matrix-inspired error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="font-mono text-lg text-red-500 mb-2 tracking-wider flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            SYSTEM ANOMALY DETECTED
          </div>
          <div className="text-sm font-mono text-red-300 mb-4 px-4 py-2 border border-red-900/50 bg-black/80">
            NEURAL CONNECTION FAILURE: MATRIX ACCESS DENIED
          </div>
          <div className="text-xs font-mono text-red-700 max-w-sm text-center">
            SYSTEM DIAGNOSTICS: NETWORK DESYNC [CODE:C855-77F]
            <br />RECOMMEND REINITIALIZATION OF CONSCIOUSNESS INTERFACE
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuralNetworkViz;