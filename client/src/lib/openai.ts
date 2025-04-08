import { apiRequest } from './queryClient';

// Function to get synaptic web data for visualization
export async function getSynapticWebData() {
  const response = await apiRequest('/api/synaptic-web');
  return response;
}

// Function to generate an echo
export async function requestEchoGeneration() {
  const response = await apiRequest('/api/echoes/generate', {
    method: 'POST',
  });
  return response;
}

// Function to create a new lifeform
export async function createLifeform(lifeformData: any) {
  const response = await apiRequest('/api/lifeforms', {
    method: 'POST',
    body: JSON.stringify(lifeformData),
  });
  return response;
}

// Function to get all lifeforms
export async function getAllLifeforms() {
  const response = await apiRequest('/api/lifeforms');
  return response;
}

// Function to get a specific lifeform by ID
export async function getLifeformById(id: number) {
  const response = await apiRequest(`/api/lifeforms/${id}`);
  return response;
}

// Function to evolve a lifeform
export async function evolveLifeform(id: number, environmentData: any) {
  const response = await apiRequest(`/api/lifeforms/${id}/evolve`, {
    method: 'POST',
    body: JSON.stringify(environmentData),
  });
  return response;
}

// Function to create a new stream
export async function createStream(streamData: any) {
  const response = await apiRequest('/api/streams', {
    method: 'POST',
    body: JSON.stringify(streamData),
  });
  return response;
}

// Function to get all streams
export async function getAllStreams() {
  const response = await apiRequest('/api/streams');
  return response;
}

// Function to create a new resonance
export async function createResonance(resonanceData: any) {
  const response = await apiRequest('/api/resonances', {
    method: 'POST',
    body: JSON.stringify(resonanceData),
  });
  return response;
}

// Function to create a new kernel
export async function createKernel(kernelData: any) {
  const response = await apiRequest('/api/kernels', {
    method: 'POST',
    body: JSON.stringify(kernelData),
  });
  return response;
}

// Function to get all kernels
export async function getAllKernels() {
  const response = await apiRequest('/api/kernels');
  return response;
}

// Function to generate a user sigil
export async function generateUserSigil(userId: number) {
  const response = await apiRequest(`/api/users/${userId}/sigil`, {
    method: 'POST',
  });
  return response;
}

// Function to analyze all resonance patterns
export async function analyzeResonancePatterns() {
  const response = await apiRequest('/api/resonances/analyze', {
    method: 'POST',
  });
  return response;
}