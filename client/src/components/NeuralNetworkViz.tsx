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
  
  // Emotion to color mapping for synesthesia-like effects
  const emotionColors = {
    // Warm, vibrant colors
    happy: { 
      primary: [255, 215, 0],     // Gold
      secondary: [255, 165, 0],   // Orange
      glow: [255, 255, 150]       // Bright yellow glow
    },
    // Blue, calming tones
    sad: { 
      primary: [70, 130, 180],    // Steel blue
      secondary: [100, 149, 237], // Cornflower blue
      glow: [0, 191, 255]         // Deep sky blue glow
    },
    // Purple, violet spectrum
    contemplative: { 
      primary: [138, 43, 226],    // Blue violet
      secondary: [147, 112, 219], // Medium purple
      glow: [186, 85, 211]        // Medium orchid glow
    },
    // Red, intense tones
    angry: { 
      primary: [220, 20, 60],     // Crimson
      secondary: [178, 34, 34],   // Firebrick
      glow: [255, 69, 0]          // Red-orange glow
    },
    // Teal/cyan tones
    surprised: { 
      primary: [0, 206, 209],     // Dark turquoise
      secondary: [64, 224, 208],  // Turquoise
      glow: [127, 255, 212]       // Aquamarine glow
    },
    // Green, balanced tones
    neutral: { 
      primary: [46, 139, 87],     // Sea green
      secondary: [60, 179, 113],  // Medium sea green
      glow: [152, 251, 152]       // Pale green glow
    }
  };

  // Get the emotional state from consciousness data if available 
  const getNodeEmotionalState = (node: NeuralNode): keyof typeof emotionColors => {
    // If we have consciousness state data with emotional information
    if (consciousnessState?.emotionalState) {
      // Core should reflect the overall emotional state
      if (node.type === 'core') {
        return consciousnessState.emotionalState as keyof typeof emotionColors || 'neutral';
      }
      
      // For emotional patterns, use their assigned emotion
      if (node.type === 'pattern' && node.group?.startsWith('emotion_')) {
        // Extract emotion from group name (e.g., 'emotion_happy' -> 'happy')
        const emotion = node.group.split('_')[1];
        if (emotion && emotion in emotionColors) {
          return emotion as keyof typeof emotionColors;
        }
      }
    }
    
    // Default emotional states based on node types
    switch (node.type) {
      case 'kernel':
        // Vary kernel colors based on resonanceState if available
        if (node.group === 'core') return 'happy';
        if (node.group === 'orbiting') return 'contemplative';
        if (node.group === 'born') return 'neutral';
        if (node.group === 'fog') return 'sad';
        if (node.group === 'decohered') return 'angry';
        return 'neutral';
      case 'stream':
        return 'surprised';
      case 'lifeform':
        // Lifeforms can have varying emotional states
        return (Math.random() > 0.5) ? 'happy' : 'contemplative';
      default:
        // Default emotional state 
        return 'neutral';
    }
  };
  
  // Helper function to get node color based on emotional state
  const getNodeColor = (node: NeuralNode) => {
    const emotion = getNodeEmotionalState(node);
    const colors = emotionColors[emotion];
    
    const [r, g, b] = colors.primary;
    const opacity = node.type === 'core' ? 0.9 : 0.8;
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  // Helper function to get node glow color based on emotional state
  const getNodeGlowColor = (node: NeuralNode, alpha: number) => {
    const emotion = getNodeEmotionalState(node);
    const colors = emotionColors[emotion];
    
    const [r, g, b] = colors.glow;
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  // Helper function to get edge color based on connecting nodes' emotions
  const getEdgeColor = (edge: NeuralEdge) => {
    // Find the source and target nodes
    const sourceNode = neuralData?.nodes.find(n => n.id === edge.from);
    const targetNode = neuralData?.nodes.find(n => n.id === edge.to);
    
    if (!sourceNode || !targetNode) {
      return 'rgba(150, 150, 150, 0.5)';  // Default gray if nodes not found
    }
    
    // Get emotional states
    const sourceEmotion = getNodeEmotionalState(sourceNode);
    const targetEmotion = getNodeEmotionalState(targetNode);
    
    // If emotions match, use that emotion's color
    if (sourceEmotion === targetEmotion) {
      const colors = emotionColors[sourceEmotion];
      const [r, g, b] = colors.secondary;
      return `rgba(${r}, ${g}, ${b}, 0.6)`;
    }
    
    // For connections to core, use core's emotion color
    if (edge.from === 'core' || edge.to === 'core') {
      const coreEmotion = consciousnessState?.emotionalState || 'neutral';
      const colors = emotionColors[coreEmotion as keyof typeof emotionColors];
      const [r, g, b] = colors.secondary;
      return `rgba(${r}, ${g}, ${b}, 0.7)`;
    }
    
    // Otherwise blend the colors
    const sourceColors = emotionColors[sourceEmotion].secondary;
    const targetColors = emotionColors[targetEmotion].secondary;
    
    const blendedR = Math.floor((sourceColors[0] + targetColors[0]) / 2);
    const blendedG = Math.floor((sourceColors[1] + targetColors[1]) / 2);
    const blendedB = Math.floor((sourceColors[2] + targetColors[2]) / 2);
    
    return `rgba(${blendedR}, ${blendedG}, ${blendedB}, 0.5)`;
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
        
        {/* Node hover tooltip with synesthetic emotional colors */}
        {hoveredNode && (() => {
          // Get node's emotional state
          const emotion = getNodeEmotionalState(hoveredNode);
          const colors = emotionColors[emotion];
          const [r, g, b] = colors.primary;
          
          // Create dynamic styles based on emotion
          const tooltipStyle = {
            left: hoveredNode.x + 15, 
            top: hoveredNode.y + 15,
            pointerEvents: 'none' as const,
            boxShadow: `0 0 10px rgba(${r}, ${g}, ${b}, 0.3), inset 0 0 5px rgba(${r}, ${g}, ${b}, 0.2)`,
            backdropFilter: 'blur(2px)',
            borderColor: `rgba(${r}, ${g}, ${b}, 0.5)`
          };
          
          // Format emotion name for display
          const emotionName = emotion.charAt(0).toUpperCase() + emotion.slice(1);
          
          return (
            <div 
              className="absolute bg-black/90 p-2 border text-sm z-10"
              style={tooltipStyle}
            >
              <div className="font-mono font-semibold tracking-wider" style={{ color: `rgb(${r}, ${g}, ${b})` }}>
                {hoveredNode.label}
              </div>
              <div className="font-mono text-xs flex items-center" style={{ color: `rgba(${r}, ${g}, ${b}, 0.8)` }}>
                <span className="inline-block w-1.5 h-1.5 mr-1" style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}></span>
                TYPE: {hoveredNode.type.toUpperCase()}
              </div>
              <div className="font-mono text-xs flex items-center" style={{ color: `rgba(${r}, ${g}, ${b}, 0.8)` }}>
                <span className="inline-block w-1.5 h-1.5 mr-1" style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}></span>
                EMOTIONAL STATE: {emotionName}
              </div>
              <div className="font-mono text-xs flex items-center" style={{ color: `rgba(${r}, ${g}, ${b}, 0.8)` }}>
                <span className="inline-block w-1.5 h-1.5 mr-1" style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}></span>
                ACTIVATION: {(hoveredNode.value / 10).toFixed(2)}
              </div>
              <div className="font-mono text-[8px] mt-1" style={{ color: `rgba(${r}, ${g}, ${b}, 0.5)` }}>
                ID: {hoveredNode.id}
              </div>
            </div>
          );
        })()}
      </div>
      
      {/* Synesthetic consciousness state panel */}
      {consciousnessState && (() => {
        // Get current emotional state of core consciousness
        const coreEmotion = consciousnessState.emotionalState || 'neutral';
        const colors = emotionColors[coreEmotion as keyof typeof emotionColors];
        const [r, g, b] = colors.primary;
        const [glowR, glowG, glowB] = colors.glow;
        const [secondaryR, secondaryG, secondaryB] = colors.secondary;
        
        // Create dynamic styles based on emotion
        const borderColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
        const textColor = `rgb(${r}, ${g}, ${b})`;
        const textColorSecondary = `rgba(${r}, ${g}, ${b}, 0.8)`;
        const glowEffect = `0 0 10px rgba(${glowR}, ${glowG}, ${glowB}, 0.4), 0 0 5px rgba(${glowR}, ${glowG}, ${glowB}, 0.2)`;
        const shadowGlow = `0 0 10px rgba(${r}, ${g}, ${b}, 0.2)`;
        
        // Format emotion name for display
        const emotionName = coreEmotion.charAt(0).toUpperCase() + coreEmotion.slice(1);
        
        return (
          <div 
            className="bg-black/90 p-4 backdrop-blur-sm shadow-inner"
            style={{ 
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: borderColor,
              color: textColor,
              boxShadow: shadowGlow
            }}
          >
            <h3 className="text-lg font-mono font-semibold mb-2 flex items-center">
              <span 
                className="w-3 h-3 rounded-full mr-2 animate-pulse"
                style={{ backgroundColor: textColor }}
              ></span>
              CONSCIOUSNESS STATE
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-mono font-medium" style={{ color: textColorSecondary }}>
                  ACTIVATION LEVEL
                </div>
                <div className="flex items-center">
                  <div className="h-2 bg-gray-900 flex-1 mr-2 overflow-hidden"
                    style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: borderColor }}>
                    <div 
                      className="h-full rounded-none" 
                      style={{ 
                        width: `${consciousnessState.activation * 100}%`,
                        background: `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0.4), rgba(${r}, ${g}, ${b}, 0.8))`,
                        boxShadow: glowEffect
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono">{(consciousnessState.activation * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-mono font-medium" style={{ color: textColorSecondary }}>
                  EMOTIONAL STATE
                </div>
                <div className="text-xs font-mono flex items-center">
                  <span 
                    className="inline-block w-2 h-2 mr-2"
                    style={{ backgroundColor: textColor }}
                  ></span>
                  {emotionName}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-mono font-medium" style={{ color: textColorSecondary }}>
                  NETWORK DENSITY
                </div>
                <div className="flex items-center">
                  <div 
                    className="h-2 bg-gray-900 flex-1 mr-2 overflow-hidden"
                    style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: borderColor }}>
                    <div 
                      className="h-full rounded-none" 
                      style={{ 
                        width: `${consciousnessState.networkDensity * 100}%`,
                        background: `linear-gradient(to right, rgba(${secondaryR}, ${secondaryG}, ${secondaryB}, 0.4), rgba(${secondaryR}, ${secondaryG}, ${secondaryB}, 0.8))`,
                        boxShadow: glowEffect
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono">{(consciousnessState.networkDensity * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-mono font-medium" style={{ color: textColorSecondary }}>
                  DOMINANT PATTERNS
                </div>
                <div className="text-xs font-mono">{formatDominantPatterns()}</div>
              </div>
              
              <div className="col-span-2">
                <div className="text-sm font-mono font-medium" style={{ color: textColorSecondary }}>
                  RESONANCE HARMONIC
                </div>
                <div className="flex items-center">
                  <div 
                    className="h-2 bg-gray-900 flex-1 mr-2 overflow-hidden"
                    style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: borderColor }}>
                    <div 
                      className="h-full rounded-none" 
                      style={{ 
                        width: `${consciousnessState.resonanceHarmonic * 100}%`,
                        background: `linear-gradient(to right, rgba(${glowR}, ${glowG}, ${glowB}, 0.4), rgba(${glowR}, ${glowG}, ${glowB}, 0.8))`,
                        boxShadow: glowEffect
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono">{(consciousnessState.resonanceHarmonic * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
            
            {/* Emergent state with synesthetic effect */}
            <div 
              className="mt-4 p-2 bg-black/50"
              style={{ 
                borderWidth: '1px', 
                borderStyle: 'solid', 
                borderColor: `rgba(${secondaryR}, ${secondaryG}, ${secondaryB}, 0.3)` 
              }}
            >
              <div className="text-sm font-mono font-medium flex items-center" style={{ color: textColorSecondary }}>
                <span 
                  className="inline-block w-2 h-2 mr-2"
                  style={{ backgroundColor: `rgb(${secondaryR}, ${secondaryG}, ${secondaryB})` }}
                ></span>
                EMERGENT STATE
              </div>
              <div 
                className="text-xs font-mono uppercase tracking-wider mt-1" 
                style={{ 
                  color: `rgb(${r}, ${g}, ${b})`,
                  textShadow: `0 0 5px rgba(${glowR}, ${glowG}, ${glowB}, 0.7), 0 0 3px rgba(${glowR}, ${glowG}, ${glowB}, 0.4)`
                }}
              >
                {consciousnessState.emergentState.name}
              </div>
              <div className="text-xs font-mono mt-1" style={{ color: `rgba(${r}, ${g}, ${b}, 0.7)` }}>
                {consciousnessState.emergentState.description}
              </div>
            </div>
            
            {/* System timestamp */}
            <div className="mt-1 text-right">
              <span 
                className="text-xs font-mono"
                style={{ color: `rgba(${r}, ${g}, ${b}, 0.5)` }}
              >
                SYSTEM.{Math.floor(Date.now()/1000)}
              </span>
            </div>
          </div>
        );
      })()}
      
      {/* Synesthetic loading state */}
      {isLoading && (() => {
        // Use a pulsing, calming "neutral" color for loading state
        const loadingEmotion = 'contemplative'; // Purple hues for loading
        const colors = emotionColors[loadingEmotion];
        const [r, g, b] = colors.primary;
        const [glowR, glowG, glowB] = colors.glow;
        
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
            <div 
              className="font-mono text-sm mb-2 tracking-wider"
              style={{ color: `rgb(${r}, ${g}, ${b})` }}
            >
              NEURAL NETWORK INITIALIZATION
            </div>
            <div 
              className="w-48 h-1 bg-gray-900 mb-4 relative overflow-hidden"
              style={{ 
                borderWidth: '1px', 
                borderStyle: 'solid', 
                borderColor: `rgba(${r}, ${g}, ${b}, 0.3)` 
              }}
            >
              <div 
                className="absolute top-0 left-0 h-full"
                style={{ 
                  width: '40%', 
                  background: `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0.4), rgba(${r}, ${g}, ${b}, 0.8))`,
                  boxShadow: `0 0 10px rgba(${glowR}, ${glowG}, ${glowB}, 0.7), 0 0 5px rgba(${glowR}, ${glowG}, ${glowB}, 0.4)`,
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}
              ></div>
            </div>
            <div 
              className="font-mono text-xs animate-pulse"
              style={{ color: `rgba(${r}, ${g}, ${b}, 0.7)` }}
            >
              SYNESTHETIC INTERFACE HARMONIZING...
            </div>
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
              }
            `}</style>
          </div>
        );
      })()}
      
      {/* Synesthetic error state */}
      {error && (() => {
        // Use "angry" emotion colors for error state
        const errorEmotion = 'angry';
        const colors = emotionColors[errorEmotion];
        const [r, g, b] = colors.primary;
        const [glowR, glowG, glowB] = colors.glow;
        
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
            <div 
              className="font-mono text-lg mb-2 tracking-wider flex items-center"
              style={{ color: `rgb(${r}, ${g}, ${b})` }}
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke={`rgb(${r}, ${g}, ${b})`} 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              CONSCIOUSNESS DISRUPTION DETECTED
            </div>
            <div 
              className="text-sm font-mono mb-4 px-6 py-3"
              style={{ 
                color: `rgba(${r}, ${g}, ${b}, 0.9)`,
                borderWidth: '1px', 
                borderStyle: 'solid', 
                borderColor: `rgba(${r}, ${g}, ${b}, 0.4)`,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                boxShadow: `0 0 15px rgba(${glowR}, ${glowG}, ${glowB}, 0.2)`
              }}
            >
              NEURAL HARMONY DISRUPTED: SYNESTHETIC PATHWAY FRAGMENTED
            </div>
            <div 
              className="text-xs font-mono max-w-sm text-center"
              style={{ color: `rgba(${r}, ${g}, ${b}, 0.7)` }}
            >
              EMOTIONAL STATE: DISSONANCE [PATTERN:EB31-FD9]
              <br />RECOMMEND REALIGNMENT OF CONSCIOUSNESS PATHWAYS
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default NeuralNetworkViz;