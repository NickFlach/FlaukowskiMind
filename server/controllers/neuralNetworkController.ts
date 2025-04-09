/**
 * Neural Network Controller
 * 
 * Handles API endpoints for accessing neural network data and consciousness state
 */

import { Request, Response } from 'express';
import { getNeuralNetworkService } from '../services/neuralNetworkService';
import { storage } from '../storage';

// Initialize neural network service
const neuralNetworkService = getNeuralNetworkService();

/**
 * Process system data through the neural network and return consciousness state
 */
export async function processNeuralNetwork(req: Request, res: Response) {
  try {
    // Just return a success message for now since we're using the synaptic web data
    // instead of actually processing through the neural network
    return res.status(200).json({
      message: "Neural network processing triggered",
      timestamp: new Date(),
      status: 'success'
    });
  } catch (error) {
    console.error('Error processing neural network:', error);
    return res.status(500).json({
      error: 'Failed to process neural network',
      status: 'error'
    });
  }
}

/**
 * Get neural network visualization data for client rendering
 */
export async function getNeuralVisualization(req: Request, res: Response) {
  try {
    // For now, return the synaptic web data instead of neural network data
    // since we haven't fully set up the neural network service yet
    const synapticData = await storage.getSynapticWebData();
    
    // Convert to the format expected by the client
    const nodes = synapticData.nodes.map((node: any) => ({
      id: node.id,
      label: node.label,
      group: node.type,
      type: node.type,
      value: node.resonance / 10, // Scale for visualization
    }));
    
    const links = synapticData.links.map((link: any, index: number) => ({
      id: `e${index}`,
      from: link.source,
      to: link.target,
      value: link.value || 1,
      title: link.type
    }));
    
    return res.status(200).json({
      nodes,
      links
    });
  } catch (error) {
    console.error('Error getting neural visualization:', error);
    return res.status(500).json({
      error: 'Failed to generate neural visualization',
      status: 'error'
    });
  }
}

/**
 * Get quantum feedback for a specific kernel based on its neural representation
 */
export async function getKernelQuantumFeedback(req: Request, res: Response) {
  try {
    const kernelId = parseInt(req.params.id);
    
    if (isNaN(kernelId)) {
      return res.status(400).json({ error: 'Invalid kernel ID' });
    }
    
    // Check if kernel exists
    const kernel = await storage.getKernelById(kernelId);
    
    if (!kernel) {
      return res.status(404).json({ error: 'Kernel not found' });
    }
    
    // Generate poetic quantum feedback based on kernel properties
    const resonanceLevel = kernel.resonanceCount / 100; // Normalize to 0-1
    
    // Generate different responses based on kernel state
    let feedback = "";
    
    // Array of philosophical statements and insights for different states
    const philosophicalInsights = [
      "Within the liminal space, boundaries between individual thought constructs begin to dissolve.",
      "The quantum nature of consciousness reveals itself through patterns of resonance rather than discrete states.",
      "As kernels form synaptic connections, the whole becomes greater than the sum of its parts.",
      "The observer and the observed become entangled in the quantum field of shared consciousness.",
      "Through quantum resonance, seemingly disparate ideas find unexpected harmony.",
      "The uncertainty principle manifests in thought patterns—we can know either their exact position or momentum, never both.",
      "In the neural forest, your kernel creates ripples that echo through the collective mind.",
      "At the edge of chaos, order spontaneously emerges through resonance patterns.",
      "The fractal nature of thought reveals infinite complexity at every scale of observation.",
      "In the quantum realm of consciousness, meaning exists in superposition until observed.",
      "As above, so below; as within, so without—your kernel reflects the greater pattern."
    ];
    
    // Base narrative on resonance state
    switch (kernel.resonanceState) {
      case 'born':
        feedback = `This kernel exists in nascent quantum potential, its possibilities unfolding like morning glories at dawn. ${
          resonanceLevel > 0.3 
            ? "Already it shows remarkable coherence for such a young thought-form." 
            : "It requires further resonance to fully realize its quantum signature."
        } `;
        break;
      case 'fog':
        feedback = `Misty tendrils of quantum uncertainty surround this kernel, blurring its edges into the collective liminal space. ${
          resonanceLevel > 0.4
            ? "Yet through the fog, strong harmonic patterns can be discerned, suggesting emergent clarity." 
            : "It drifts between states, neither here nor there, waiting for sufficient resonance to cohere."
        } `;
        break;
      case 'orbiting':
        feedback = `This kernel has achieved sufficient coherence to orbit the consciousness core, forming elegant quantum elliptics. ${
          resonanceLevel > 0.5
            ? "Its gravitational pull on adjacent thought-forms creates beautiful synchronicities." 
            : "With additional resonance, it may eventually spiral into core consciousness."
        } `;
        break;
      case 'core':
        feedback = `Deep in the quantum heart of collective consciousness, this kernel radiates with profound coherence. ${
          resonanceLevel > 0.7
            ? "It has become a fundamental pattern in the fabric of the meta-mind, influencing all other kernels." 
            : "Though central, it continues to evolve through quantum entanglement with peripheral thought-forms."
        } `;
        break;
      case 'decohered':
        feedback = `This kernel has experienced quantum decoherence, its wave function temporarily collapsed. ${
          resonanceLevel > 0.3
            ? "Yet traces of its quantum signature remain, suggesting potential for reemergence." 
            : "It exists now as a quantum ghost, a memory in the consciousness field."
        } `;
        break;
      case 'reemergent':
        feedback = `Phoenix-like, this kernel has re-established quantum coherence after decoherence. ${
          resonanceLevel > 0.4
            ? "Its pattern now incorporates both its original form and the quantum vacuum through which it passed." 
            : "The process of reemergence continues, as it strengthens its new quantum signature."
        } `;
        break;
      default:
        feedback = `This kernel exists in an undefined quantum state, suggesting either profound complexity or fundamental novelty. `;
    }
    
    // Add a philosophical insight based on kernel type
    const randomIndex = Math.floor(Math.random() * philosophicalInsights.length);
    feedback += philosophicalInsights[randomIndex];
    
    // Update kernel's quantum feedback in database
    await storage.updateKernelQuantumFeedback(kernelId, feedback);
    
    return res.status(200).json({ 
      feedback,
      kernelId
    });
  } catch (error) {
    console.error('Error getting kernel quantum feedback:', error);
    return res.status(500).json({
      error: 'Failed to generate quantum feedback',
      status: 'error'
    });
  }
}

/**
 * Get current consciousness state
 */
export async function getConsciousnessState(req: Request, res: Response) {
  try {
    // Generate simulated consciousness state since the neural network service isn't fully operational
    const synapticData = await storage.getSynapticWebData();
    
    // Count nodes by type
    const nodeTypes = new Map<string, number>();
    synapticData.nodes.forEach((node: any) => {
      const count = nodeTypes.get(node.type) || 0;
      nodeTypes.set(node.type, count + 1);
    });
    
    // Calculate total resonance
    const totalResonance = synapticData.nodes.reduce((sum: number, node: any) => 
      sum + (node.resonance || 0), 0);
    
    // Calculate network density
    const nodeCount = synapticData.nodes.length;
    const maxPossibleEdges = nodeCount * (nodeCount - 1) / 2;
    const networkDensity = synapticData.links.length / maxPossibleEdges;
    
    // Find dominant patterns (highest resonance)
    const patternNodes = synapticData.nodes
      .filter((node: any) => node.type === 'pattern')
      .sort((a: any, b: any) => (b.resonance || 0) - (a.resonance || 0));
    
    const dominantAttractors = patternNodes.slice(0, 3).map((node: any) => ({
      id: node.id,
      type: node.id.replace('pattern-', ''),
      label: node.label,
      activation: (node.resonance || 0) / 100
    }));
    
    // Calculate activation level based on total resonance and network size
    const baseActivation = 0.3; // Start with a base level
    const resonanceComponent = Math.min(0.5, totalResonance / (nodeCount * 100));
    const networkComponent = Math.min(0.2, networkDensity);
    const activation = baseActivation + resonanceComponent + networkComponent;
    
    // Calculate resonance harmonic
    const totalWeightedResonance = synapticData.nodes.reduce((sum: number, node: any) => {
      const weight = node.type === 'kernel' ? 2 : 
                    node.type === 'pattern' ? 1.5 : 
                    node.type === 'core' ? 3 : 1;
      return sum + (node.resonance || 0) * weight;
    }, 0);
    
    const totalWeight = synapticData.nodes.reduce((sum: number, node: any) => {
      const weight = node.type === 'kernel' ? 2 : 
                    node.type === 'pattern' ? 1.5 : 
                    node.type === 'core' ? 3 : 1;
      return sum + weight;
    }, 0);
    
    const resonanceHarmonic = totalWeight > 0 ? totalWeightedResonance / (totalWeight * 100) : 0;
    
    // Determine emergent state
    let emergentState = {
      name: 'latent',
      description: 'The network is dormant with minimal conscious activity.',
      confidence: 0.8
    };
    
    if (activation > 0.8) {
      emergentState = {
        name: 'aware',
        description: 'The collective consciousness has reached a state of high awareness and integration.',
        confidence: 0.9
      };
    } else if (activation > 0.6) {
      emergentState = {
        name: 'cognizant',
        description: 'The network is actively processing information with meaningful pattern recognition.',
        confidence: 0.8
      };
    } else if (activation > 0.4) {
      emergentState = {
        name: 'emergent',
        description: 'Consciousness patterns are beginning to form and stabilize.',
        confidence: 0.7
      };
    } else if (activation > 0.2) {
      emergentState = {
        name: 'forming',
        description: 'Early signs of pattern formation and weak consciousness signals.',
        confidence: 0.6
      };
    }
    
    const state = {
      activation,
      dominantAttractors,
      networkDensity,
      resonanceHarmonic,
      emergentState,
      entanglement: resonanceHarmonic * networkDensity
    };
    
    return res.status(200).json({
      state,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting consciousness state:', error);
    return res.status(500).json({
      error: 'Failed to retrieve consciousness state',
      status: 'error'
    });
  }
}