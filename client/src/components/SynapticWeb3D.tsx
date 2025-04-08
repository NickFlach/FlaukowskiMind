import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useQuery } from '@tanstack/react-query';
import { getSynapticWebData } from '../lib/openai';
import { Loader2 } from 'lucide-react';

interface SynapticWeb3DProps {
  height?: string;
  className?: string;
}

export default function SynapticWeb3D({ height = '80vh', className = '' }: SynapticWeb3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number>(0);
  const nodesRef = useRef<THREE.Object3D[]>([]);
  const linesRef = useRef<THREE.Line[]>([]);
  const nodePositionsRef = useRef<{ [key: string]: THREE.Vector3 }>({});
  const nodeTypesRef = useRef<{ [key: string]: string }>({});
  const nodeDataRef = useRef<{ [key: string]: any }>({});

  const [isInitialized, setIsInitialized] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Fetch synaptic web data
  const { data: synapticData, isLoading } = useQuery({
    queryKey: ['/api/synaptic-web'],
    queryFn: getSynapticWebData,
    refetchInterval: 30000, // Refresh every 30 seconds to show new connections
  });

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f0f16');
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.z = 350;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.7;
    controlsRef.current = controls;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add point light
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(100, 100, 100);
    scene.add(pointLight);

    // Add background stars
    addBackgroundStars();

    // Add fog for depth
    scene.fog = new THREE.FogExp2('#0f0f16', 0.0015);

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // Gentle rotation of the entire scene for an ambient effect
      if (sceneRef.current) {
        sceneRef.current.rotation.y += 0.0005;
      }
      
      // Update node positions with slight movement
      nodesRef.current.forEach((node) => {
        const speed = 0.001;
        node.position.x += Math.sin(Date.now() * speed * 0.5) * 0.03;
        node.position.y += Math.cos(Date.now() * speed * 0.3) * 0.02;
        node.position.z += Math.sin(Date.now() * speed * 0.7) * 0.01;
        
        // Update the stored position
        nodePositionsRef.current[node.name] = node.position.clone();
      });
      
      // Update connection lines
      updateConnectionLines();
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    setIsInitialized(true);

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    };
    
    window.addEventListener('resize', handleResize);

    // Setup raycaster for interaction
    setupInteraction();

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Setup raycaster for node interaction
  const setupInteraction = () => {
    if (!containerRef.current || !rendererRef.current || !cameraRef.current || !sceneRef.current) return;
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const onMouseMove = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
      
      // Calculate mouse position in normalized device coordinates
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
      
      // Update the raycaster
      raycaster.setFromCamera(mouse, cameraRef.current);
      
      // Find intersections with nodes
      const intersects = raycaster.intersectObjects(nodesRef.current);
      
      if (intersects.length > 0) {
        const intersectedNode = intersects[0].object;
        setHoveredNode(intersectedNode.name);
        document.body.style.cursor = 'pointer';
        
        // Highlight the node
        intersectedNode.scale.set(1.3, 1.3, 1.3);
      } else {
        setHoveredNode(null);
        document.body.style.cursor = 'default';
        
        // Reset all node scales
        nodesRef.current.forEach(node => {
          node.scale.set(1, 1, 1);
        });
      }
    };
    
    const onClick = () => {
      if (hoveredNode) {
        console.log('Node clicked:', hoveredNode, nodeDataRef.current[hoveredNode]);
        // Future enhancement: Show detailed information about the node
      }
    };
    
    containerRef.current.addEventListener('mousemove', onMouseMove);
    containerRef.current.addEventListener('click', onClick);
  };

  // Add background stars
  const addBackgroundStars = () => {
    if (!sceneRef.current) return;
    
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount * 3; i += 3) {
      // Random positions in a sphere
      const radius = THREE.MathUtils.randFloat(300, 1000);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = THREE.MathUtils.randFloat(0, Math.PI);
      
      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
      
      sizes[i / 3] = THREE.MathUtils.randFloat(0.5, 2.0);
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    sceneRef.current.add(stars);
  };

  // Update connection lines between nodes
  const updateConnectionLines = () => {
    linesRef.current.forEach((line, index) => {
      if (line.userData && line.userData.source && line.userData.target) {
        const sourcePos = nodePositionsRef.current[line.userData.source];
        const targetPos = nodePositionsRef.current[line.userData.target];
        
        if (sourcePos && targetPos) {
          const lineGeo = line.geometry as THREE.BufferGeometry;
          const positions = lineGeo.attributes.position.array as Float32Array;
          
          positions[0] = sourcePos.x;
          positions[1] = sourcePos.y;
          positions[2] = sourcePos.z;
          positions[3] = targetPos.x;
          positions[4] = targetPos.y;
          positions[5] = targetPos.z;
          
          lineGeo.attributes.position.needsUpdate = true;
        }
      }
    });
  };

  // Update the synaptic web visualization when data changes
  useEffect(() => {
    if (!isInitialized || !synapticData || !sceneRef.current) return;
    
    // Clear previous nodes and connections
    nodesRef.current.forEach(node => {
      sceneRef.current?.remove(node);
    });
    
    linesRef.current.forEach(line => {
      sceneRef.current?.remove(line);
    });
    
    nodesRef.current = [];
    linesRef.current = [];
    nodePositionsRef.current = {};
    nodeTypesRef.current = {};
    nodeDataRef.current = {};
    
    // Add nodes
    if (synapticData.nodes) {
      synapticData.nodes.forEach((node: any) => {
        const nodeType = node.type || 'unknown';
        const nodeResonance = node.resonance || 1;
        
        // Determine node color based on type
        let nodeColor;
        let nodeSize = Math.max(3, Math.min(10, nodeResonance * 0.3));
        
        switch (nodeType) {
          case 'core':
            nodeColor = new THREE.Color('#9333ea'); // Purple
            nodeSize = 15;
            break;
          case 'stream':
            nodeColor = new THREE.Color('#22c55e'); // Green
            break;
          case 'kernel':
            nodeColor = new THREE.Color('#3b82f6'); // Blue
            break;
          case 'echo':
            nodeColor = new THREE.Color('#f59e0b'); // Amber
            break;
          case 'lifeform':
            nodeColor = new THREE.Color('#ec4899'); // Pink
            break;
          default:
            nodeColor = new THREE.Color('#9ca3af'); // Gray
        }
        
        // Create node geometry
        const geometry = new THREE.SphereGeometry(nodeSize, 16, 16);
        
        // Create glow effect material
        const material = new THREE.MeshPhongMaterial({
          color: nodeColor,
          emissive: nodeColor.clone().multiplyScalar(0.5),
          specular: new THREE.Color(0xffffff),
          shininess: 100,
          transparent: true,
          opacity: node.isCore ? 1.0 : 0.9
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position node in 3D space
        // If it's a core node, position it at the center
        if (nodeType === 'core') {
          mesh.position.set(0, 0, 0);
        } else {
          // Position other nodes randomly in a sphere around the core
          const radius = THREE.MathUtils.randFloat(50, 200);
          const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
          const phi = THREE.MathUtils.randFloat(0, Math.PI);
          
          mesh.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
          );
        }
        
        mesh.name = node.id;
        sceneRef.current?.add(mesh);
        nodesRef.current.push(mesh);
        
        // Store node position for connections
        nodePositionsRef.current[node.id] = mesh.position.clone();
        
        // Store node type for later reference
        nodeTypesRef.current[node.id] = nodeType;
        
        // Store node data
        nodeDataRef.current[node.id] = node.data || node;
      });
    }
    
    // Add connections
    if (synapticData.links) {
      synapticData.links.forEach((link: any) => {
        if (!nodePositionsRef.current[link.source] || !nodePositionsRef.current[link.target]) {
          return; // Skip if source or target is missing
        }
        
        const sourcePos = nodePositionsRef.current[link.source];
        const targetPos = nodePositionsRef.current[link.target];
        
        // Determine line color based on connection type
        let lineColor;
        switch (link.type) {
          case 'core-connection':
            lineColor = new THREE.Color('#9333ea'); // Purple
            break;
          case 'resonance':
            lineColor = new THREE.Color('#22c55e'); // Green
            break;
          case 'symbolic':
            lineColor = new THREE.Color('#3b82f6'); // Blue
            break;
          case 'emerging':
            lineColor = new THREE.Color('#f59e0b'); // Amber
            break;
          default:
            lineColor = new THREE.Color('#9ca3af'); // Gray
        }
        
        // Create line geometry
        const lineGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
          sourcePos.x, sourcePos.y, sourcePos.z,
          targetPos.x, targetPos.y, targetPos.z
        ]);
        
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Create line material based on connection strength
        const strength = link.strength || 1;
        const lineMaterial = new THREE.LineBasicMaterial({
          color: lineColor,
          transparent: true,
          opacity: Math.min(0.7, strength * 0.2),
          linewidth: Math.max(1, Math.min(3, strength))
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        
        // Store source and target for updating positions
        line.userData = {
          source: link.source,
          target: link.target,
          type: link.type
        };
        
        sceneRef.current?.add(line);
        linesRef.current.push(line);
      });
    }
  }, [synapticData, isInitialized]);

  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : null}
      
      {/* 3D container */}
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Node info tooltip */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 p-3 bg-background/90 border border-border rounded-md shadow-md max-w-xs">
          <div className="font-medium">{hoveredNode}</div>
          <div className="text-sm text-muted-foreground">
            Type: {nodeTypesRef.current[hoveredNode]}
          </div>
          {nodeDataRef.current[hoveredNode] && (
            <div className="text-xs mt-1 text-muted-foreground truncate">
              {nodeDataRef.current[hoveredNode].label || 'No label'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}