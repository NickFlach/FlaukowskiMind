import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useIsMobile } from '@/hooks/use-mobile';

type Emotion = "neutral" | "happy" | "sad" | "surprised" | "angry" | "contemplative";

interface Face3DProps {
  emotion?: Emotion;
  height?: string;
  autoRotate?: boolean;
  allowControls?: boolean;
  className?: string;
}

export default function Face3D({ 
  emotion = "neutral",
  height = "300px",
  autoRotate = true,
  allowControls = false,
  className = ""
}: Face3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number>(0);
  const faceMeshRef = useRef<THREE.Group>(new THREE.Group());
  const eyesRef = useRef<{left: THREE.Mesh, right: THREE.Mesh} | null>(null);
  const mouthRef = useRef<THREE.Mesh | null>(null);
  const eyebrowsRef = useRef<{left: THREE.Mesh, right: THREE.Mesh} | null>(null);
  
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>(emotion);
  const isMobile = useIsMobile();

  // Update emotion when prop changes
  useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);

  // Create the 3D scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f0f16');
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls if allowed
    if (allowControls) {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enableZoom = false;
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.5;
      controlsRef.current = controls;
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Create the face
    createFace();

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      // Update controls if they exist
      if (controlsRef.current) {
        controlsRef.current.update();
      } else if (autoRotate && faceMeshRef.current) {
        // Simple auto-rotation if no controls
        faceMeshRef.current.rotation.y += 0.01;
      }
      
      // Animate face based on emotion
      animateFaceForEmotion(currentEmotion);

      // Render the scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();

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

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      
      window.removeEventListener('resize', handleResize);
    };
  }, [autoRotate, allowControls]);

  // Create the face mesh
  const createFace = () => {
    if (!sceneRef.current) return;
    
    // Clear previous mesh if it exists
    if (faceMeshRef.current.children.length > 0) {
      faceMeshRef.current.remove(...faceMeshRef.current.children);
    }
    
    // Face material
    const faceMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x9333ea, // Purple (primary color)
      emissive: 0x4a148c,
      specular: 0xffffff,
      shininess: 30,
      transparent: true,
      opacity: 0.9
    });
    
    // Create face head
    const headGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const head = new THREE.Mesh(headGeometry, faceMaterial);
    faceMeshRef.current.add(head);
    
    // Create eyes
    const eyeGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.5, 0.3, 1.3);
    faceMeshRef.current.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.5, 0.3, 1.3);
    faceMeshRef.current.add(rightEye);
    
    eyesRef.current = { left: leftEye, right: rightEye };
    
    // Create pupils
    const pupilGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const pupilMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(0, 0, 0.2);
    leftEye.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0, 0, 0.2);
    rightEye.add(rightPupil);
    
    // Create mouth
    const mouthGeometry = new THREE.TorusGeometry(0.4, 0.1, 16, 32, Math.PI);
    const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.5, 1.3);
    mouth.rotation.z = Math.PI;
    faceMeshRef.current.add(mouth);
    
    mouthRef.current = mouth;
    
    // Create eyebrows
    const eyebrowGeometry = new THREE.BoxGeometry(0.4, 0.06, 0.1);
    const eyebrowMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    
    const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    leftEyebrow.position.set(-0.5, 0.65, 1.3);
    faceMeshRef.current.add(leftEyebrow);
    
    const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    rightEyebrow.position.set(0.5, 0.65, 1.3);
    faceMeshRef.current.add(rightEyebrow);
    
    eyebrowsRef.current = { left: leftEyebrow, right: rightEyebrow };
    
    // Add ambient glow
    const glowGeometry = new THREE.SphereGeometry(1.6, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x9333ea,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide 
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    faceMeshRef.current.add(glow);
    
    // Add energy particles
    const particleCount = 50;
    const particles = new THREE.Group();
    
    const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.7
    });
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 1.8 + Math.random() * 0.5;
      
      particle.position.x = radius * Math.sin(phi) * Math.cos(theta);
      particle.position.y = radius * Math.sin(phi) * Math.sin(theta);
      particle.position.z = radius * Math.cos(phi);
      
      // Store original position for animation
      particle.userData = {
        originalPosition: particle.position.clone(),
        speed: 0.005 + Math.random() * 0.01,
        amplitude: 0.05 + Math.random() * 0.1
      };
      
      particles.add(particle);
    }
    
    faceMeshRef.current.add(particles);
    
    // Add the face to the scene
    sceneRef.current.add(faceMeshRef.current);
    
    // Set initial emotion
    setFaceEmotion(currentEmotion);
  };

  // Function to animate particles
  const animateParticles = () => {
    if (!faceMeshRef.current) return;
    
    const particles = faceMeshRef.current.children.find(child => child instanceof THREE.Group) as THREE.Group;
    if (!particles) return;
    
    particles.children.forEach((particle: THREE.Mesh) => {
      if (particle.userData) {
        const { originalPosition, speed, amplitude } = particle.userData;
        const time = Date.now() * speed;
        
        particle.position.x = originalPosition.x + Math.sin(time) * amplitude;
        particle.position.y = originalPosition.y + Math.cos(time) * amplitude;
        particle.position.z = originalPosition.z + Math.cos(time + Math.PI/4) * amplitude;
      }
    });
  };

  // Function to animate eyes
  const animateEyes = () => {
    if (!eyesRef.current) return;
    
    const { left, right } = eyesRef.current;
    
    // Subtle eye movement
    const time = Date.now() * 0.001;
    left.lookAt(new THREE.Vector3(
      Math.sin(time * 0.5) * 3,
      Math.cos(time * 0.3) * 2,
      10
    ));
    
    right.lookAt(new THREE.Vector3(
      Math.sin(time * 0.5) * 3,
      Math.cos(time * 0.3) * 2,
      10
    ));
  };

  // Function to set face emotion
  const setFaceEmotion = (emotion: Emotion) => {
    if (!mouthRef.current || !eyebrowsRef.current) return;
    
    const mouth = mouthRef.current;
    const { left: leftEyebrow, right: rightEyebrow } = eyebrowsRef.current;
    
    switch (emotion) {
      case "happy":
        // Happy mouth
        mouth.rotation.z = Math.PI;
        mouth.position.y = -0.5;
        // Happy eyebrows
        leftEyebrow.rotation.z = 0.3;
        rightEyebrow.rotation.z = -0.3;
        break;
        
      case "sad":
        // Sad mouth
        mouth.rotation.z = 0;
        mouth.position.y = -0.6;
        // Sad eyebrows
        leftEyebrow.rotation.z = -0.3;
        rightEyebrow.rotation.z = 0.3;
        break;
        
      case "surprised":
        // Surprised mouth - make it a circle
        if (mouth.geometry instanceof THREE.TorusGeometry) {
          mouth.geometry.dispose();
          mouth.geometry = new THREE.CircleGeometry(0.3, 32);
        }
        mouth.position.y = -0.5;
        // Surprised eyebrows - raised
        leftEyebrow.position.y = 0.8;
        rightEyebrow.position.y = 0.8;
        leftEyebrow.rotation.z = 0;
        rightEyebrow.rotation.z = 0;
        break;
        
      case "angry":
        // Angry mouth
        mouth.rotation.z = 0;
        mouth.position.y = -0.6;
        // Angry eyebrows
        leftEyebrow.position.y = 0.6;
        rightEyebrow.position.y = 0.6;
        leftEyebrow.rotation.z = -0.5;
        rightEyebrow.rotation.z = 0.5;
        break;
        
      case "contemplative":
        // Contemplative mouth - straight line
        if (mouth.geometry instanceof THREE.TorusGeometry) {
          mouth.geometry.dispose();
          const lineGeometry = new THREE.BoxGeometry(0.6, 0.06, 0.1);
          mouth.geometry = lineGeometry;
        }
        mouth.rotation.z = 0;
        mouth.position.y = -0.5;
        // Contemplative eyebrows - one raised
        leftEyebrow.position.y = 0.65;
        rightEyebrow.position.y = 0.75;
        leftEyebrow.rotation.z = 0;
        rightEyebrow.rotation.z = 0;
        break;
        
      case "neutral":
      default:
        // Reset mouth to default
        if (mouth.geometry instanceof THREE.BoxGeometry) {
          mouth.geometry.dispose();
          mouth.geometry = new THREE.TorusGeometry(0.4, 0.1, 16, 32, Math.PI);
        }
        mouth.rotation.z = Math.PI;
        mouth.position.y = -0.5;
        // Reset eyebrows
        leftEyebrow.position.y = 0.65;
        rightEyebrow.position.y = 0.65;
        leftEyebrow.rotation.z = 0;
        rightEyebrow.rotation.z = 0;
        break;
    }
  };

  // Function to animate the face based on the current emotion
  const animateFaceForEmotion = (emotion: Emotion) => {
    // Animate particles
    animateParticles();
    
    // Animate eyes
    animateEyes();
    
    // Set face emotion
    setFaceEmotion(emotion);
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden ${className}`} 
      style={{ height }}
    />
  );
}