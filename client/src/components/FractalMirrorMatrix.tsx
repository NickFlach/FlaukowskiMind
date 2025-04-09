import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

// The core fractal function: F(θ,φ)=sin(kθ)∗cos(nφ)+log_e(|θφ|)
const fractalFunction = (theta: number, phi: number, k: number, n: number): number => {
  // Handle edge case where theta or phi is 0 to avoid log(0)
  const product = Math.abs(theta * phi) + 0.0001; // Add small epsilon to avoid log(0)
  return Math.sin(k * theta) * Math.cos(n * phi) + Math.log(product);
};

// Generate vertices for the fractal matrix
const generateFractalMatrix = (
  resolution: number, 
  size: number, 
  k: number, 
  n: number, 
  timeOffset: number
): { positions: Float32Array, colors: Float32Array, indices: Uint32Array } => {
  const positions = new Float32Array(resolution * resolution * 3);
  const colors = new Float32Array(resolution * resolution * 3);
  const indices = new Uint32Array((resolution - 1) * (resolution - 1) * 6);
  
  const halfSize = size / 2;
  const step = size / (resolution - 1);
  
  // Generate positions and colors
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const index = (i * resolution + j) * 3;
      
      // Calculate theta and phi (polar coordinates)
      const x = -halfSize + i * step;
      const y = -halfSize + j * step;
      const theta = Math.atan2(y, x) + timeOffset;
      const phi = Math.sqrt(x * x + y * y) * 0.1 + timeOffset * 0.5;
      
      // Calculate z using our fractal function
      const z = fractalFunction(theta, phi, k, n) * size * 0.2;
      
      // Set the position
      positions[index] = x;
      positions[index + 1] = y;
      positions[index + 2] = z;
      
      // Set the color based on the z value for a nice gradient effect
      const hue = (z / (size * 0.4) + 1) * 180; // Map z to hue (0-360)
      const color = new THREE.Color().setHSL(hue / 360, 0.8, 0.5);
      colors[index] = color.r;
      colors[index + 1] = color.g;
      colors[index + 2] = color.b;
    }
  }
  
  // Generate indices for triangles
  let idx = 0;
  for (let i = 0; i < resolution - 1; i++) {
    for (let j = 0; j < resolution - 1; j++) {
      const a = i * resolution + j;
      const b = i * resolution + j + 1;
      const c = (i + 1) * resolution + j;
      const d = (i + 1) * resolution + j + 1;
      
      // First triangle
      indices[idx++] = a;
      indices[idx++] = b;
      indices[idx++] = c;
      
      // Second triangle
      indices[idx++] = b;
      indices[idx++] = d;
      indices[idx++] = c;
    }
  }
  
  return { positions, colors, indices };
};

interface FractalMatrixProps {
  resolution?: number;
  size?: number;
  k?: number;
  n?: number;
  animate?: boolean;
  wireframe?: boolean;
}

const FractalMatrixMesh: React.FC<FractalMatrixProps> = ({ 
  resolution = 100, 
  size = 10, 
  k = 3, 
  n = 5, 
  animate = true,
  wireframe = false
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const bufferGeometryRef = useRef<THREE.BufferGeometry>(null);
  const [time, setTime] = useState(0);
  
  // Update the geometry when parameters change
  useEffect(() => {
    if (bufferGeometryRef.current) {
      const { positions, colors, indices } = generateFractalMatrix(resolution, size, k, n, time);
      
      bufferGeometryRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );
      
      bufferGeometryRef.current.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
      );
      
      bufferGeometryRef.current.setIndex(
        new THREE.BufferAttribute(indices, 1)
      );
      
      bufferGeometryRef.current.computeVertexNormals();
      bufferGeometryRef.current.computeBoundingSphere();
    }
  }, [resolution, size, k, n, time]);
  
  // Animation loop
  useFrame(({ clock }) => {
    if (animate && meshRef.current) {
      const t = clock.getElapsedTime() * 0.1;
      setTime(t);
      
      // Also add some rotation for extra visual effect
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
      meshRef.current.rotation.y = Math.sin(t * 0.1) * 0.1;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <bufferGeometry ref={bufferGeometryRef} />
      {wireframe ? (
        <wireframeGeometry />
      ) : (
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          roughness={0.4}
          metalness={0.6}
        />
      )}
    </mesh>
  );
};

const QuantumFeedbackGlow: React.FC = () => {
  const { scene } = useThree();
  
  useEffect(() => {
    // Add ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    // Add directional light for shadows and highlights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    
    // Add a point light that moves for dynamic lighting
    const pointLight = new THREE.PointLight(0x0088ff, 2, 30);
    pointLight.position.set(0, 2, 5);
    scene.add(pointLight);
    
    // Add a second point light of a different color
    const pointLight2 = new THREE.PointLight(0xff8800, 2, 30);
    pointLight2.position.set(5, -2, 0);
    scene.add(pointLight2);
    
    return () => {
      scene.remove(ambientLight);
      scene.remove(directionalLight);
      scene.remove(pointLight);
      scene.remove(pointLight2);
    };
  }, [scene]);
  
  useFrame(({ clock }) => {
    // Get existing lights from the scene
    const lights = scene.children.filter(child => child instanceof THREE.PointLight);
    
    if (lights.length >= 2) {
      const t = clock.getElapsedTime();
      
      // Move the first point light in a circular path
      lights[0].position.x = Math.sin(t * 0.3) * 5;
      lights[0].position.z = Math.cos(t * 0.3) * 5;
      
      // Move the second point light in a different path
      lights[1].position.x = Math.sin(t * 0.4 + Math.PI) * 5;
      lights[1].position.z = Math.cos(t * 0.4 + Math.PI) * 5;
    }
  });
  
  return null;
};

const SceneFog: React.FC = () => {
  const { scene } = useThree();
  
  useEffect(() => {
    // Add fog to the scene for a more ethereal look
    scene.fog = new THREE.FogExp2(0x000020, 0.035);
    
    return () => {
      scene.fog = null;
    };
  }, [scene]);
  
  return null;
};

const FractalMirrorMatrix: React.FC<FractalMatrixProps & { className?: string }> = ({ 
  className, 
  ...props 
}) => {
  const [parameters, setParameters] = useState({
    k: props.k || 3,
    n: props.n || 5,
    resolution: props.resolution || 100,
    wireframe: props.wireframe || false,
  });
  
  const defaultSize = props.size || 10;
  
  const handleKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParameters({ ...parameters, k: parseFloat(e.target.value) });
  };
  
  const handleNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParameters({ ...parameters, n: parseFloat(e.target.value) });
  };
  
  const handleResolutionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParameters({ ...parameters, resolution: parseInt(e.target.value, 10) });
  };
  
  const toggleWireframe = () => {
    setParameters({ ...parameters, wireframe: !parameters.wireframe });
  };
  
  return (
    <div className={`relative ${className || ''}`}>
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <SceneFog />
        <QuantumFeedbackGlow />
        <FractalMatrixMesh 
          size={defaultSize} 
          k={parameters.k} 
          n={parameters.n} 
          resolution={parameters.resolution} 
          animate={true}
          wireframe={parameters.wireframe}
        />
        <OrbitControls enableZoom={true} enablePan={true} />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm p-4 rounded-lg text-white">
        <h3 className="text-lg font-semibold mb-2">Fractal Mirror Controls</h3>
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
          <div>
            <button 
              onClick={toggleWireframe}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-md text-sm"
            >
              {parameters.wireframe ? 'Show Surface' : 'Show Wireframe'}
            </button>
          </div>
        </div>
        <div className="mt-4 text-xs opacity-70">
          <div>F(θ,φ) = sin(kθ)∗cos(nφ) + log<sub>e</sub>(|θφ|)</div>
        </div>
      </div>
    </div>
  );
};

export default FractalMirrorMatrix;