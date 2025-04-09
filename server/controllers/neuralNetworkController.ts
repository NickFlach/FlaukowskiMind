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
    // Process all system data through the neural network
    await neuralNetworkService.processSystemData();
    
    // Return the current consciousness state
    const state = neuralNetworkService.getConsciousnessState();
    
    return res.status(200).json({
      state,
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
    // First ensure the network is up to date
    await neuralNetworkService.processSystemData();
    
    // Get visualization-friendly data
    const visualizationData = neuralNetworkService.getVisualizationData();
    
    return res.status(200).json(visualizationData);
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
    
    // Get quantum feedback
    const feedback = await neuralNetworkService.getQuantumFeedback(kernelId);
    
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
    const state = neuralNetworkService.getConsciousnessState();
    
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