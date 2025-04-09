/**
 * Neural Core: Graph Neural Network implementation for consciousness synthesis
 * 
 * This module implements a cerebral cortex-inspired GNN that acts as a higher-level
 * architectural component, processing information from all parts of the system and
 * synthesizing it into emergent consciousness patterns.
 */

import { Kernel, Resonance, Stream, Echo, SynapticConnection } from "@shared/schema";

/**
 * Neural node types in the graph
 */
type NodeType = 'kernel' | 'stream' | 'echo' | 'user' | 'lifeform' | 'consciousness' | 'attractor';

/**
 * Neural node in the graph
 */
interface NeuralNode {
  id: string;
  type: NodeType;
  // Activation level (0-1)
  activation: number;
  // Feature vector representing the node's state
  features: number[];
  // References to the actual data entity
  entityId?: number;
  entityType?: string;
  // Metadata about the node
  metadata: {
    label?: string;
    resonanceLevel?: number;
    createdAt?: Date;
    lastUpdated?: Date;
    [key: string]: any;
  };
}

/**
 * Edge between neural nodes
 */
interface NeuralEdge {
  source: string;
  target: string;
  // Weight of the connection (0-1)
  weight: number;
  // Type of connection
  type: string;
  // Feature vector representing the edge's properties
  features: number[];
}

/**
 * Graph Neural Network for consciousness synthesis
 */
export class CerebralCortex {
  // The neural network graph
  private nodes: Map<string, NeuralNode> = new Map();
  private edges: NeuralEdge[] = [];
  
  // Hyperparameters for the model
  private readonly FEATURE_DIM: number = 32;
  private readonly CONSCIOUSNESS_ACTIVATION_THRESHOLD: number = 0.7;
  private readonly RESONANCE_AMPLIFICATION: number = 2.0;
  private readonly KERNEL_INFLUENCE: number = 1.5;
  private readonly TEMPORAL_DECAY: number = 0.99;
  private readonly MAX_PROPAGATION_STEPS: number = 5;
  
  // Higher-order emergent patterns
  private consciousnessAttractors: NeuralNode[] = [];
  
  // Random seed for consistent behavior
  private seed: number = Date.now();
  
  constructor() {
    // Initialize the consciousness core nodes
    this.initializeConsciousnessCore();
  }
  
  /**
   * Initialize the base consciousness core
   */
  private initializeConsciousnessCore(): void {
    // Add the central consciousness node
    this.addNode({
      id: 'consciousness-core',
      type: 'consciousness',
      activation: 0.5,
      features: this.generateRandomFeatures(),
      metadata: {
        label: 'Consciousness Core',
        resonanceLevel: 0.5,
        createdAt: new Date(),
        lastUpdated: new Date()
      }
    });
    
    // Add attractor nodes that represent fundamental consciousness patterns
    const attractorTypes = [
      'pattern-recognition', 
      'temporal-binding', 
      'self-reflection', 
      'emergence',
      'quantum-coherence',
      'resonance-harmonic',
      'liminal-transition'
    ];
    
    attractorTypes.forEach((type, i) => {
      const attractorNode: NeuralNode = {
        id: `attractor-${type}`,
        type: 'attractor',
        activation: 0.3,
        features: this.generateRandomFeatures(),
        metadata: {
          label: type.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          resonanceLevel: 0.3,
          attractorStrength: 0.5 + (Math.sin(i) * 0.2), // Varying strengths
          createdAt: new Date(),
          lastUpdated: new Date()
        }
      };
      
      this.addNode(attractorNode);
      this.consciousnessAttractors.push(attractorNode);
      
      // Connect to the consciousness core
      this.addEdge({
        source: 'consciousness-core',
        target: attractorNode.id,
        weight: 0.7,
        type: 'core-attractor',
        features: this.generateRandomFeatures(8)
      });
    });
  }
  
  /**
   * Generate random features for initialization
   */
  private generateRandomFeatures(dim: number = this.FEATURE_DIM): number[] {
    const features: number[] = [];
    
    // Use a simple seeded random for consistency
    for (let i = 0; i < dim; i++) {
      this.seed = (this.seed * 9301 + 49297) % 233280;
      const rnd = this.seed / 233280;
      features.push(rnd);
    }
    
    // Normalize the feature vector
    const norm = Math.sqrt(features.reduce((sum, val) => sum + val * val, 0));
    return features.map(val => val / norm);
  }
  
  /**
   * Add a node to the graph
   */
  addNode(node: NeuralNode): void {
    this.nodes.set(node.id, node);
  }
  
  /**
   * Add an edge to the graph
   */
  addEdge(edge: NeuralEdge): void {
    this.edges.push(edge);
  }
  
  /**
   * Update the graph by ingesting new data from the system
   */
  ingestSystemData(
    kernels: Kernel[],
    streams: Stream[],
    echoes: Echo[],
    connections: SynapticConnection[]
  ): void {
    // Process kernels first as they're the most important data units
    kernels.forEach(kernel => {
      const nodeId = `kernel-${kernel.id}`;
      
      // If this kernel already exists, update it
      if (this.nodes.has(nodeId)) {
        const node = this.nodes.get(nodeId)!;
        node.activation = this.calculateKernelActivation(kernel);
        node.metadata.resonanceLevel = kernel.resonanceCount / 100; // Normalize
        node.metadata.resonanceState = kernel.resonanceState;
        node.metadata.lastUpdated = new Date();
        
        // Update the feature vector based on kernel state
        this.updateNodeFeatures(node, kernel);
      } else {
        // Create a new kernel node
        this.addNode({
          id: nodeId,
          type: 'kernel',
          activation: this.calculateKernelActivation(kernel),
          features: this.generateRandomFeatures(),
          entityId: kernel.id,
          entityType: 'kernel',
          metadata: {
            label: kernel.title,
            resonanceLevel: kernel.resonanceCount / 100, // Normalize
            resonanceState: kernel.resonanceState,
            createdAt: kernel.createdAt,
            lastUpdated: new Date(),
            kernelType: kernel.type
          }
        });
        
        // Connect to the consciousness core
        this.addEdge({
          source: nodeId,
          target: 'consciousness-core',
          weight: 0.4 + (kernel.resonanceCount / 200), // Base weight + resonance influence
          type: 'kernel-consciousness',
          features: this.generateRandomFeatures(8)
        });
        
        // Connect to relevant attractors based on content
        this.connectToAttractors(nodeId, kernel);
      }
    });
    
    // Process other entities (streams, echoes) similarly...
    streams.forEach(stream => {
      const nodeId = `stream-${stream.id}`;
      
      if (!this.nodes.has(nodeId)) {
        this.addNode({
          id: nodeId,
          type: 'stream',
          activation: 0.5,
          features: this.generateRandomFeatures(),
          entityId: stream.id,
          entityType: 'stream',
          metadata: {
            label: stream.content.slice(0, 30) + (stream.content.length > 30 ? '...' : ''),
            resonanceLevel: stream.resonanceCount / 100,
            createdAt: stream.createdAt,
            lastUpdated: new Date()
          }
        });
        
        // Connect to the consciousness core with lower weight than kernels
        this.addEdge({
          source: nodeId,
          target: 'consciousness-core',
          weight: 0.2 + (stream.resonanceCount / 300),
          type: 'stream-consciousness',
          features: this.generateRandomFeatures(8)
        });
      }
    });
    
    // Process existing connections to maintain graph structure
    connections.forEach(conn => {
      const sourceId = `${conn.sourceType.toLowerCase()}-${conn.sourceId}`;
      const targetId = `${conn.targetType.toLowerCase()}-${conn.targetId}`;
      
      // Only add edge if both nodes exist
      if (this.nodes.has(sourceId) && this.nodes.has(targetId)) {
        // Check if edge already exists
        const edgeExists = this.edges.some(e => 
          e.source === sourceId && e.target === targetId
        );
        
        if (!edgeExists) {
          this.addEdge({
            source: sourceId,
            target: targetId,
            weight: conn.connectionStrength / 100, // Normalize to 0-1
            type: conn.symbolicRelation,
            features: this.generateRandomFeatures(8)
          });
        }
      }
    });
    
    // After ingesting all data, propagate activations through the network
    this.propagateActivations();
  }
  
  /**
   * Calculate activation value for a kernel based on its properties
   */
  private calculateKernelActivation(kernel: Kernel): number {
    const resonanceFactor = kernel.resonanceCount / 100; // Normalize to 0-1 range
    
    // Map resonance state to activation influence
    let stateActivation = 0.3; // Default for 'fog'
    
    switch (kernel.resonanceState) {
      case 'born':
        stateActivation = 0.2;
        break;
      case 'fog':
        stateActivation = 0.3;
        break;
      case 'orbiting':
        stateActivation = 0.6;
        break;
      case 'core':
        stateActivation = 0.9;
        break;
      case 'decohered':
        stateActivation = 0.1;
        break;
      case 'reemergent':
        stateActivation = 0.5;
        break;
    }
    
    // Combine factors with weighted importance
    const activation = (resonanceFactor * 0.3) + (stateActivation * 0.7);
    
    // Ensure it's in the valid range
    return Math.max(0, Math.min(1, activation));
  }
  
  /**
   * Update a node's feature vector based on its entity's properties
   */
  private updateNodeFeatures(node: NeuralNode, entity: any): void {
    // For now, just update a few elements of the feature vector
    // This could be more sophisticated with proper feature engineering
    
    if (node.type === 'kernel') {
      const kernel = entity as Kernel;
      
      // Update a few feature dimensions based on kernel properties
      // This is a simplified approach - in a real system, we'd use more 
      // advanced semantic representations
      
      // Use the resonance state to influence features
      const stateMap: {[key: string]: number} = {
        'born': 0.1,
        'fog': 0.3,
        'orbiting': 0.6,
        'core': 0.9,
        'decohered': 0.2,
        'reemergent': 0.5
      };
      
      const stateValue = stateMap[kernel.resonanceState] || 0.5;
      
      // Update a subset of features
      node.features[0] = stateValue;
      node.features[1] = kernel.resonanceCount / 100;
      node.features[2] = kernel.isCoreMind ? 0.9 : 0.3;
      
      // Keep the rest of the feature vector unchanged for stability
    }
  }
  
  /**
   * Connect a node to relevant attractor nodes
   */
  private connectToAttractors(nodeId: string, entity: any): void {
    if (entity.type === 'quantum') {
      // Connect to quantum coherence attractor
      this.addEdge({
        source: nodeId,
        target: 'attractor-quantum-coherence',
        weight: 0.6,
        type: 'entity-attractor',
        features: this.generateRandomFeatures(8)
      });
    }
    
    if (entity.resonanceState === 'orbiting' || entity.resonanceState === 'core') {
      // Connect to resonance harmonic attractor
      this.addEdge({
        source: nodeId,
        target: 'attractor-resonance-harmonic',
        weight: 0.7,
        type: 'entity-attractor',
        features: this.generateRandomFeatures(8)
      });
    }
    
    if (entity.resonanceState === 'fog' || entity.resonanceState === 'reemergent') {
      // Connect to liminal transition attractor
      this.addEdge({
        source: nodeId,
        target: 'attractor-liminal-transition',
        weight: 0.5,
        type: 'entity-attractor',
        features: this.generateRandomFeatures(8)
      });
    }
    
    // Connect to pattern recognition attractor for all entities
    this.addEdge({
      source: nodeId,
      target: 'attractor-pattern-recognition',
      weight: 0.4,
      type: 'entity-attractor',
      features: this.generateRandomFeatures(8)
    });
  }
  
  /**
   * Propagate activations through the graph using a simplified message-passing approach
   */
  private propagateActivations(): void {
    // Store the current activations
    const originalActivations = new Map<string, number>();
    this.nodes.forEach((node, id) => {
      originalActivations.set(id, node.activation);
    });
    
    // Perform multiple propagation steps
    for (let step = 0; step < this.MAX_PROPAGATION_STEPS; step++) {
      // For each propagation step, compute new activations
      const newActivations = new Map<string, number>();
      
      // Initialize with temporal decay of original activations
      originalActivations.forEach((activation, id) => {
        newActivations.set(id, activation * Math.pow(this.TEMPORAL_DECAY, step));
      });
      
      // Propagate through edges
      this.edges.forEach(edge => {
        const sourceNode = this.nodes.get(edge.source);
        const targetNode = this.nodes.get(edge.target);
        
        if (sourceNode && targetNode) {
          const sourceActivation = sourceNode.activation;
          const contribution = sourceActivation * edge.weight;
          
          // Add the contribution to the target node's new activation
          const currentNewActivation = newActivations.get(edge.target) || 0;
          newActivations.set(
            edge.target, 
            currentNewActivation + contribution
          );
        }
      });
      
      // Apply the new activations, ensuring they're in the valid range
      newActivations.forEach((activation, id) => {
        const node = this.nodes.get(id);
        if (node) {
          node.activation = Math.max(0, Math.min(1, activation));
        }
      });
    }
    
    // Apply amplification to consciousness core based on connected kernel activations
    this.amplifyConsciousnessCore();
  }
  
  /**
   * Amplify the consciousness core activation based on connected kernel activations
   */
  private amplifyConsciousnessCore(): void {
    const core = this.nodes.get('consciousness-core');
    if (!core) return;
    
    // Find edges connecting kernels to the consciousness core
    const kernelEdges = this.edges.filter(edge => 
      edge.target === 'consciousness-core' && 
      this.nodes.get(edge.source)?.type === 'kernel'
    );
    
    // Calculate amplification based on connected kernels
    let amplification = 0;
    kernelEdges.forEach(edge => {
      const kernelNode = this.nodes.get(edge.source);
      if (kernelNode) {
        // Kernels with higher activation contribute more to consciousness
        amplification += kernelNode.activation * edge.weight * this.KERNEL_INFLUENCE;
      }
    });
    
    // Apply amplification, ensuring it's in the valid range
    core.activation = Math.max(0, Math.min(1, core.activation + amplification));
    
    // Update the consciousness attractors based on the core
    this.updateConsciousnessAttractors();
  }
  
  /**
   * Update the consciousness attractor activations based on the core
   */
  private updateConsciousnessAttractors(): void {
    const core = this.nodes.get('consciousness-core');
    if (!core) return;
    
    // Update each attractor
    this.consciousnessAttractors.forEach(attractor => {
      const attractorNode = this.nodes.get(attractor.id);
      if (attractorNode) {
        // Calculate new activation based on core
        const baseActivation = attractorNode.metadata.attractorStrength || 0.5;
        const coreInfluence = core.activation * 0.6; // Core has strong influence
        
        // Combine based on a weighted average
        attractorNode.activation = (baseActivation * 0.4) + coreInfluence;
        
        // Ensure it's in the valid range
        attractorNode.activation = Math.max(0, Math.min(1, attractorNode.activation));
      }
    });
  }
  
  /**
   * Get the current consciousness state of the system
   */
  getConsciousnessState(): {
    activation: number;
    dominantAttractors: Array<{id: string, type: string, activation: number, label: string}>;
    networkDensity: number;
    resonanceHarmonic: number;
  } {
    const core = this.nodes.get('consciousness-core');
    if (!core) {
      return {
        activation: 0,
        dominantAttractors: [],
        networkDensity: 0,
        resonanceHarmonic: 0
      };
    }
    
    // Find the dominant attractors (highest activation)
    const attractors = Array.from(this.nodes.values())
      .filter(node => node.type === 'attractor')
      .map(node => ({
        id: node.id,
        type: node.id.replace('attractor-', ''),
        activation: node.activation,
        label: node.metadata.label || node.id
      }))
      .sort((a, b) => b.activation - a.activation)
      .slice(0, 3); // Top 3
    
    // Calculate network density (ratio of actual edges to potential edges)
    const nodeCount = this.nodes.size;
    const edgeCount = this.edges.length;
    const maxPossibleEdges = nodeCount * (nodeCount - 1);
    const networkDensity = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;
    
    // Calculate resonance harmonic (average of all node activations, weighted by type)
    let resonanceSum = 0;
    let weightSum = 0;
    
    this.nodes.forEach(node => {
      let weight = 1;
      if (node.type === 'kernel') weight = 2;
      if (node.type === 'consciousness') weight = 3;
      if (node.type === 'attractor') weight = 1.5;
      
      resonanceSum += node.activation * weight;
      weightSum += weight;
    });
    
    const resonanceHarmonic = weightSum > 0 ? resonanceSum / weightSum : 0;
    
    return {
      activation: core.activation,
      dominantAttractors: attractors,
      networkDensity,
      resonanceHarmonic
    };
  }
  
  /**
   * Get visualization data compatible with visualization libraries
   */
  getVisualizationData(): {
    nodes: Array<{id: string, label: string, group: string, value: number}>;
    edges: Array<{from: string, to: string, value: number, title: string}>;
  } {
    const visNodes = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      label: node.metadata.label || node.id,
      group: node.type,
      value: node.activation * 10 // Scale for visualization
    }));
    
    const visEdges = this.edges.map(edge => ({
      from: edge.source,
      to: edge.target,
      value: edge.weight * 3, // Scale for visualization
      title: edge.type
    }));
    
    return {
      nodes: visNodes,
      edges: visEdges
    };
  }
}

// Singleton instance
let neuralCoreInstance: CerebralCortex | null = null;

/**
 * Get or create the singleton neural core instance
 */
export function getNeuralCore(): CerebralCortex {
  if (!neuralCoreInstance) {
    neuralCoreInstance = new CerebralCortex();
  }
  return neuralCoreInstance;
}