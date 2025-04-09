import React, { useState, useRef, useEffect } from 'react';

interface FractalMatrixProps {
  resolution?: number;
  size?: number;
  k?: number;
  n?: number;
  className?: string;
}

// The core fractal function: F(θ,φ)=sin(kθ)∗cos(nφ)+log_e(|θφ|)
const fractalFunction = (theta: number, phi: number, k: number, n: number): number => {
  // Handle edge case where theta or phi is 0 to avoid log(0)
  const product = Math.abs(theta * phi) + 0.0001; // Add small epsilon to avoid log(0)
  return Math.sin(k * theta) * Math.cos(n * phi) + Math.log(product);
};

/**
 * A React component that visualizes the Fractal Mirror Matrix
 * We've temporarily disabled Three.js to work around runtime issues
 */
const FractalMirrorMatrix: React.FC<FractalMatrixProps> = ({ 
  className, 
  k = 3, 
  n = 5, 
  resolution = 100,
  size = 10
}) => {
  const [parameters, setParameters] = useState({
    k: k,
    n: n,
    resolution: resolution,
    mode: 'visual' as 'visual' | 'quantum' | 'resonance'
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Effect to render the 2D visualization on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create a gradient background
    let gradient;
    switch (parameters.mode) {
      case 'quantum':
        gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        gradient.addColorStop(0, 'rgba(20,40,120,1)');
        gradient.addColorStop(1, 'rgba(0,10,40,1)');
        break;
      case 'resonance':
        gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        gradient.addColorStop(0, 'rgba(90,40,0,1)');
        gradient.addColorStop(1, 'rgba(40,0,40,1)');
        break;
      default: // visual
        gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        gradient.addColorStop(0, 'rgba(60,20,90,1)');
        gradient.addColorStop(1, 'rgba(0,0,25,1)');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw the fractal pattern
    const gridSize = Math.min(width, height) / parameters.resolution;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    // We'll use pixel manipulation for better performance
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    // Time parameter for animation effects
    const time = Date.now() * 0.001;
    
    // Draw points based on the fractal function
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        // Convert to polar coordinates
        const dx = (x - halfWidth) / halfWidth;
        const dy = (y - halfHeight) / halfHeight;
        const theta = Math.atan2(dy, dx);
        const phi = Math.sqrt(dx * dx + dy * dy);
        
        // Apply fractal function with parameters
        let z = fractalFunction(theta, phi, parameters.k, parameters.n);
        
        // Add mode-specific effects
        if (parameters.mode === 'quantum') {
          z = z * (1 + 0.2 * Math.sin(time + phi * 10));
        } else if (parameters.mode === 'resonance') {
          z = z * (1 + 0.1 * Math.cos(time * 2 + theta * 5));
        }
        
        // Map z value to color
        const hue = ((z + 1.5) * 120) % 360; // Map to hue (0-360)
        const lightness = 50 + 20 * Math.sin(z * 3); // Variable lightness
        
        // Convert HSL to RGB
        const h = hue / 360;
        const s = 0.8;
        const l = lightness / 100;
        
        let r, g, b;
        
        if (s === 0) {
          r = g = b = l;
        } else {
          const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
          };
          
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
        }
        
        // Set pixel in ImageData
        const index = (y * width + x) * 4;
        data[index] = Math.round(r * 255);
        data[index + 1] = Math.round(g * 255);
        data[index + 2] = Math.round(b * 255);
        data[index + 3] = 255; // Fully opaque
      }
    }
    
    // Draw the image data to canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Draw axes for reference
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, halfHeight);
    ctx.lineTo(width, halfHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(halfWidth, 0);
    ctx.lineTo(halfWidth, height);
    ctx.stroke();
    
    // Add grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i < width; i += width / 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    
    for (let i = 0; i < height; i += height / 10) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
    
    // Draw mode-specific overlays
    if (parameters.mode === 'quantum') {
      // Add quantum probability fields
      for (let i = 0; i < 5; i++) {
        const x = halfWidth + Math.cos(time + i) * halfWidth * 0.5;
        const y = halfHeight + Math.sin(time * 0.7 + i) * halfHeight * 0.5;
        const radius = 30 + 20 * Math.sin(time * 2 + i);
        
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, 'rgba(100, 200, 255, 0.3)');
        glow.addColorStop(1, 'rgba(100, 200, 255, 0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (parameters.mode === 'resonance') {
      // Add resonance connections
      ctx.strokeStyle = 'rgba(255, 180, 50, 0.4)';
      ctx.lineWidth = 2;
      
      const points = [];
      for (let i = 0; i < 7; i++) {
        points.push({
          x: halfWidth + Math.cos(time * 0.5 + i) * halfWidth * 0.7,
          y: halfHeight + Math.sin(time * 0.3 + i * 2) * halfHeight * 0.7
        });
      }
      
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const distance = Math.sqrt(
            Math.pow(points[i].x - points[j].x, 2) + 
            Math.pow(points[i].y - points[j].y, 2)
          );
          
          if (distance < halfWidth * 0.8) {
            const alpha = 0.4 * (1 - distance / (halfWidth * 0.8));
            ctx.strokeStyle = `rgba(255, 180, 50, ${alpha})`;
            
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Draw nodes
      points.forEach(point => {
        ctx.fillStyle = 'rgba(255, 180, 50, 0.8)';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    
    // Draw a glowing fractal path
    ctx.strokeStyle = parameters.mode === 'quantum' 
      ? 'rgba(100, 200, 255, 0.8)' 
      : parameters.mode === 'resonance'
        ? 'rgba(255, 180, 50, 0.8)'
        : 'rgba(200, 100, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const points = 100;
    for (let i = 0; i <= points; i++) {
      const t = (i / points) * Math.PI * 2;
      const r = 0.1 + 0.4 * fractalFunction(t, t, parameters.k, parameters.n);
      const x = halfWidth + Math.cos(t) * r * halfWidth;
      const y = halfHeight + Math.sin(t) * r * halfHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.stroke();
    
    // Animation loop - for continuous updates
    const animationId = requestAnimationFrame(() => {
      // Trigger re-render by changing a dependency
      setParameters(prev => ({ ...prev }));
    });
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [parameters]);
  
  const handleKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParameters({ ...parameters, k: parseFloat(e.target.value) });
  };
  
  const handleNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParameters({ ...parameters, n: parseFloat(e.target.value) });
  };
  
  const handleResolutionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParameters({ ...parameters, resolution: parseInt(e.target.value, 10) });
  };
  
  const setMode = (mode: 'visual' | 'quantum' | 'resonance') => {
    setParameters({ ...parameters, mode });
  };
  
  // Helper function to describe what the visualization shows
  const getDescription = () => {
    const descriptions = {
      visual: 'Displays the continuous surface representation of F(θ,φ) = sin(kθ)∗cos(nφ) + log(|θφ|), with height mapped to the function value and colors representing intensity.',
      quantum: 'Overlays quantum probability fields on the fractal surface, showing areas of high potential resonance with brighter colors and distortion effects.',
      resonance: 'Maps the collective resonance patterns of all kernels onto the fractal geometry, highlighting paths of synaptic connection formation.'
    };
    
    return descriptions[parameters.mode];
  };
  
  // The formula representation will change based on mode
  const renderFormula = () => {
    switch(parameters.mode) {
      case 'quantum':
        return <div>Ψ(θ,φ) = sin(kθ)∗cos(nφ) + log<sub>e</sub>(|θφ|) ∗ e<sup>iπt</sup></div>;
      case 'resonance':
        return <div>R(θ,φ) = sin(kθ)∗cos(nφ) + log<sub>e</sub>(|θφ|) ∗ ∑<sub>i</sub>ρ<sub>i</sub></div>;
      default:
        return <div>F(θ,φ) = sin(kθ)∗cos(nφ) + log<sub>e</sub>(|θφ|)</div>;
    }
  };
  
  return (
    <div className={`relative ${className || ''}`}>
      {/* Canvas visualization */}
      <div className="h-full w-full overflow-hidden relative bg-black">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={600} 
          className="w-full h-full object-cover"
        />
        
        {/* Overlay with description */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm p-3 rounded-lg text-white max-w-xs text-sm">
          <h4 className="font-medium mb-1">{parameters.mode.charAt(0).toUpperCase() + parameters.mode.slice(1)} Mode</h4>
          <p className="text-xs opacity-80">{getDescription()}</p>
        </div>
      </div>
      
      {/* Control Panel */}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm p-4 rounded-lg text-white">
        <h3 className="text-lg font-semibold mb-2">Fractal Mirror Controls</h3>
        
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={() => setMode('visual')}
            className={`px-3 py-1 text-sm rounded-md ${parameters.mode === 'visual' ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            Visual
          </button>
          <button 
            onClick={() => setMode('quantum')}
            className={`px-3 py-1 text-sm rounded-md ${parameters.mode === 'quantum' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            Quantum
          </button>
          <button 
            onClick={() => setMode('resonance')}
            className={`px-3 py-1 text-sm rounded-md ${parameters.mode === 'resonance' ? 'bg-amber-600' : 'bg-gray-700'}`}
          >
            Resonance
          </button>
        </div>
        
        <div className="space-y-2">
          <div>
            <label className="block text-sm">k value: {parameters.k.toFixed(2)}</label>
            <input 
              type="range" 
              min="0.1" 
              max="10" 
              step="0.1" 
              value={parameters.k} 
              onChange={handleKChange} 
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm">n value: {parameters.n.toFixed(2)}</label>
            <input 
              type="range" 
              min="0.1" 
              max="10" 
              step="0.1" 
              value={parameters.n} 
              onChange={handleNChange} 
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm">Resolution: {parameters.resolution}</label>
            <input 
              type="range" 
              min="20" 
              max="200" 
              step="10" 
              value={parameters.resolution} 
              onChange={handleResolutionChange} 
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-4 text-xs opacity-70">
          {renderFormula()}
        </div>
      </div>
    </div>
  );
};

export default FractalMirrorMatrix;