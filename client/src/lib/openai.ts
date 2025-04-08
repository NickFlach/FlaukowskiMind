/**
 * Client-side utility functions for interacting with OpenAI via the backend
 */

import { apiRequest } from './queryClient';

/**
 * Request the generation of an echo from the backend
 */
export async function requestEchoGeneration() {
  try {
    const response = await apiRequest('/api/echoes/generate', 'POST');
    return response;
  } catch (error) {
    console.error('Error requesting echo generation:', error);
    throw error;
  }
}

/**
 * Submit content for symbolic analysis
 */
export async function analyzeContent(content: string, type: string) {
  try {
    const response = await apiRequest('/api/symbolic/analyze', 'POST', { content, type });
    return response;
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
}

/**
 * Get a user's resonance analysis
 */
export async function getUserResonancePatterns(userId: number) {
  try {
    const response = await apiRequest(`/api/users/${userId}/resonance-patterns`, 'GET');
    return response;
  } catch (error) {
    console.error('Error getting user resonance patterns:', error);
    throw error;
  }
}

/**
 * Generate a user sigil
 */
export async function generateUserSigil(userId: number) {
  try {
    const response = await apiRequest(`/api/users/${userId}/sigil`, 'POST');
    return response;
  } catch (error) {
    console.error('Error generating user sigil:', error);
    throw error;
  }
}

/**
 * Get synaptic web visualization data
 */
export async function getSynapticWebData() {
  try {
    const response = await apiRequest('/api/synaptic-web', 'GET');
    return response;
  } catch (error) {
    console.error('Error getting synaptic web data:', error);
    throw error;
  }
}

/**
 * Create a new lifeform in the emergence lab
 */
export async function createLifeform(lifeformData: {
  name: string;
  type: string;
  initialState: any;
}) {
  try {
    const response = await apiRequest('/api/lifeforms', 'POST', lifeformData);
    return response;
  } catch (error) {
    console.error('Error creating lifeform:', error);
    throw error;
  }
}

/**
 * Get all lifeforms
 */
export async function getAllLifeforms() {
  try {
    const response = await apiRequest('/api/lifeforms', 'GET');
    return response;
  } catch (error) {
    console.error('Error getting lifeforms:', error);
    throw error;
  }
}

/**
 * Get a specific lifeform by ID
 */
export async function getLifeformById(id: number) {
  try {
    const response = await apiRequest(`/api/lifeforms/${id}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error getting lifeform:', error);
    throw error;
  }
}

/**
 * Get lifeforms by type
 */
export async function getLifeformsByType(type: string) {
  try {
    const response = await apiRequest(`/api/lifeforms/type/${type}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error getting lifeforms by type:', error);
    throw error;
  }
}

/**
 * Trigger a lifeform adaptation/evolution
 */
export async function evolveLifeform(lifeformId: number, environmentData: any) {
  try {
    const response = await apiRequest(`/api/lifeforms/${lifeformId}/evolve`, 'POST', { environmentData });
    return response;
  } catch (error) {
    console.error('Error evolving lifeform:', error);
    throw error;
  }
}

/**
 * Get recent evolution records for a lifeform
 */
export async function getLifeformEvolutions(lifeformId: number) {
  try {
    const response = await apiRequest(`/api/lifeforms/${lifeformId}/evolutions`, 'GET');
    return response;
  } catch (error) {
    console.error('Error getting lifeform evolutions:', error);
    throw error;
  }
}

/**
 * Get top resonant lifeforms
 */
export async function getTopResonantLifeforms(limit = 5) {
  try {
    const response = await apiRequest(`/api/lifeforms/top-resonant?limit=${limit}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error getting top resonant lifeforms:', error);
    throw error;
  }
}