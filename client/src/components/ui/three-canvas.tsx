import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

interface ThreeCanvasProps {
  nodes?: any[];
  links?: any[];
  backgroundColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  height?: string | number;
  width?: string | number;
  className?: string;
}

export function ThreeCanvas({
  nodes = [],
  links = [],
  backgroundColor = "#0A0A0F",
  primaryColor = "#34205E",
  secondaryColor = "#B18F3A",
  accentColor = "#23B5D3",
  height = "100%",
  width = "100%",
  className = "",
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const nodesRef = useRef<THREE.Object3D[]>([]);
  
  // Initialize the scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 50;
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create a radial gradient background
    const backgroundGeometry = new THREE.SphereGeometry(200, 32, 32);
    backgroundGeometry.scale(-1, 1, 1); // Invert the sphere to see the texture from inside
    
    const backgroundMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        uniform vec3 colorPrimary;
        uniform vec3 colorBackground;
        
        void main() {
          float intensity = 1.0 - smoothstep(0.0, 0.8, length(vPosition) / 200.0);
          gl_FragColor = vec4(mix(colorBackground, colorPrimary, intensity * 0.15), 1.0);
        }
      `,
      uniforms: {
        colorPrimary: { value: new THREE.Color(primaryColor) },
        colorBackground: { value: new THREE.Color(backgroundColor) }
      },
      side: THREE.BackSide
    });
    
    const backgroundSphere = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    scene.add(backgroundSphere);
    
    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Animate nodes gently floating
      nodesRef.current.forEach((node, index) => {
        const time = Date.now() * 0.001;
        const offset = index * 0.2;
        node.position.y += Math.sin(time + offset) * 0.005;
        node.position.x += Math.cos(time + offset) * 0.003;
        node.position.z += Math.sin(time * 0.7 + offset) * 0.002;
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [backgroundColor, primaryColor]);
  
  // Update nodes and links when data changes
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Clear existing nodes
    nodesRef.current.forEach(node => {
      sceneRef.current?.remove(node);
    });
    nodesRef.current = [];
    
    // Add central node
    const centralNodeGeometry = new THREE.SphereGeometry(5, 32, 32);
    const centralNodeMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(secondaryColor),
      emissive: new THREE.Color(primaryColor),
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8
    });
    
    const centralNode = new THREE.Mesh(centralNodeGeometry, centralNodeMaterial);
    sceneRef.current.add(centralNode);
    nodesRef.current.push(centralNode);
    
    // Add other nodes
    nodes.forEach((node, index) => {
      if (node.id === 'core') return; // Skip the core node as we already added it
      
      let nodeColor;
      if (node.type === 'stream') {
        nodeColor = accentColor;
      } else if (node.type === 'kernel') {
        nodeColor = secondaryColor;
      } else if (node.type === 'echo') {
        nodeColor = primaryColor;
      } else {
        nodeColor = '#ffffff';
      }
      
      // Create a sphere for this node
      const radius = Math.max(1, Math.min(3, node.resonance / 10)); // Scale by resonance, but cap size
      const nodeGeometry = new THREE.SphereGeometry(radius, 16, 16);
      const nodeMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color(nodeColor),
        transparent: true,
        opacity: 0.7
      });
      
      const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
      
      // Position the node randomly around the center
      const angle = (index / nodes.length) * Math.PI * 2;
      const distance = 15 + Math.random() * 15;
      nodeMesh.position.x = Math.cos(angle) * distance;
      nodeMesh.position.y = Math.sin(angle) * distance;
      nodeMesh.position.z = (Math.random() - 0.5) * 20;
      
      if (sceneRef.current) {
        sceneRef.current.add(nodeMesh);
        nodesRef.current.push(nodeMesh);
        
        // Create connections (lines) between nodes
        links.forEach(link => {
          if (link.source === node.id || link.target === node.id) {
            const sourceNode = link.source === 'core' ? centralNode : 
              nodesRef.current.find((_, i) => nodes[i - 1]?.id === link.source);
            
            const targetNode = link.target === 'core' ? centralNode : 
              nodesRef.current.find((_, i) => nodes[i - 1]?.id === link.target);
            
            if (sourceNode && targetNode && sceneRef.current) {
              const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                sourceNode.position,
                targetNode.position
              ]);
              
              const lineMaterial = new THREE.LineBasicMaterial({
                color: link.type === 'core-connection' ? secondaryColor : accentColor,
                transparent: true,
                opacity: 0.3,
                linewidth: link.strength || 1
              });
              
              const line = new THREE.Line(lineGeometry, lineMaterial);
              const currentScene = sceneRef.current;
              if (currentScene) {
                currentScene.add(line);
              }
            }
          }
        });
      }
    });
    
  }, [nodes, links, primaryColor, secondaryColor, accentColor]);
  
  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width, 
        height: typeof height === 'number' ? `${height}px` : height 
      }}
    />
  );
}
