import * as openaiClient from '../../../client/src/lib/openai';
import { apiRequest } from '../../../client/src/lib/queryClient';

// Mock the queryClient module
jest.mock('../../../client/src/lib/queryClient', () => ({
  apiRequest: jest.fn()
}));

describe('OpenAI Client Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestEchoGeneration', () => {
    test('should call apiRequest with the correct endpoint', async () => {
      (apiRequest as jest.Mock).mockResolvedValue({ id: 1, content: 'Echo content' });
      
      const result = await openaiClient.requestEchoGeneration();
      
      expect(apiRequest).toHaveBeenCalledWith('/api/echoes/generate', 'POST');
      expect(result).toEqual({ id: 1, content: 'Echo content' });
    });

    test('should throw error when API request fails', async () => {
      const error = new Error('API error');
      (apiRequest as jest.Mock).mockRejectedValue(error);
      
      await expect(openaiClient.requestEchoGeneration()).rejects.toThrow('API error');
    });
  });

  describe('analyzeContent', () => {
    test('should call apiRequest with the correct endpoint and data', async () => {
      const mockResult = { symbols: ['test'], numerics: [1], dialect: 'quantum' };
      (apiRequest as jest.Mock).mockResolvedValue(mockResult);
      
      const result = await openaiClient.analyzeContent('Test content', 'stream');
      
      expect(apiRequest).toHaveBeenCalledWith(
        '/api/symbolic/analyze', 
        'POST', 
        { content: 'Test content', type: 'stream' }
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUserResonancePatterns', () => {
    test('should call apiRequest with the correct endpoint', async () => {
      const mockPatterns = { patterns: [{ type: 'theme', strength: 0.8 }] };
      (apiRequest as jest.Mock).mockResolvedValue(mockPatterns);
      
      const result = await openaiClient.getUserResonancePatterns(1);
      
      expect(apiRequest).toHaveBeenCalledWith('/api/users/1/resonance-patterns', 'GET');
      expect(result).toEqual(mockPatterns);
    });
  });

  describe('generateUserSigil', () => {
    test('should call apiRequest with the correct endpoint', async () => {
      const mockSigil = { sigil: 'svg-data', elements: ['fire'] };
      (apiRequest as jest.Mock).mockResolvedValue(mockSigil);
      
      const result = await openaiClient.generateUserSigil(1);
      
      expect(apiRequest).toHaveBeenCalledWith('/api/users/1/sigil', 'POST');
      expect(result).toEqual(mockSigil);
    });
  });

  describe('getSynapticWebData', () => {
    test('should call apiRequest with the correct endpoint', async () => {
      const mockData = { nodes: [], edges: [] };
      (apiRequest as jest.Mock).mockResolvedValue(mockData);
      
      const result = await openaiClient.getSynapticWebData();
      
      expect(apiRequest).toHaveBeenCalledWith('/api/synaptic-web', 'GET');
      expect(result).toEqual(mockData);
    });
  });

  describe('lifeform operations', () => {
    test('createLifeform should call apiRequest with correct endpoint and data', async () => {
      const lifeformData = {
        name: 'Test Lifeform',
        type: 'cellular',
        initialState: { cells: [[0, 1, 0], [0, 0, 1], [1, 1, 1]] }
      };
      
      const mockResponse = { id: 1, ...lifeformData };
      (apiRequest as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await openaiClient.createLifeform(lifeformData);
      
      expect(apiRequest).toHaveBeenCalledWith('/api/lifeforms', 'POST', lifeformData);
      expect(result).toEqual(mockResponse);
    });

    test('getAllLifeforms should call apiRequest with correct endpoint', async () => {
      const mockLifeforms = [{ id: 1, name: 'Lifeform 1' }, { id: 2, name: 'Lifeform 2' }];
      (apiRequest as jest.Mock).mockResolvedValue(mockLifeforms);
      
      const result = await openaiClient.getAllLifeforms();
      
      expect(apiRequest).toHaveBeenCalledWith('/api/lifeforms', 'GET');
      expect(result).toEqual(mockLifeforms);
    });

    test('getLifeformById should call apiRequest with correct endpoint', async () => {
      const mockLifeform = { id: 1, name: 'Lifeform 1' };
      (apiRequest as jest.Mock).mockResolvedValue(mockLifeform);
      
      const result = await openaiClient.getLifeformById(1);
      
      expect(apiRequest).toHaveBeenCalledWith('/api/lifeforms/1', 'GET');
      expect(result).toEqual(mockLifeform);
    });

    test('getLifeformsByType should call apiRequest with correct endpoint', async () => {
      const mockLifeforms = [{ id: 1, name: 'Lifeform 1', type: 'cellular' }];
      (apiRequest as jest.Mock).mockResolvedValue(mockLifeforms);
      
      const result = await openaiClient.getLifeformsByType('cellular');
      
      expect(apiRequest).toHaveBeenCalledWith('/api/lifeforms/type/cellular', 'GET');
      expect(result).toEqual(mockLifeforms);
    });

    test('evolveLifeform should call apiRequest with correct endpoint and data', async () => {
      const environmentData = { temperature: 0.8, resources: 0.5 };
      const mockResponse = { 
        id: 1, 
        generation: 2,
        previousState: { cells: [[0, 0, 0]] },
        newState: { cells: [[1, 1, 1]] }
      };
      
      (apiRequest as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await openaiClient.evolveLifeform(1, environmentData);
      
      expect(apiRequest).toHaveBeenCalledWith(
        '/api/lifeforms/1/evolve', 
        'POST', 
        { environmentData }
      );
      expect(result).toEqual(mockResponse);
    });

    test('getLifeformEvolutions should call apiRequest with correct endpoint', async () => {
      const mockEvolutions = [
        { id: 1, generation: 1, lifeformId: 1 },
        { id: 2, generation: 2, lifeformId: 1 }
      ];
      
      (apiRequest as jest.Mock).mockResolvedValue(mockEvolutions);
      
      const result = await openaiClient.getLifeformEvolutions(1);
      
      expect(apiRequest).toHaveBeenCalledWith('/api/lifeforms/1/evolutions', 'GET');
      expect(result).toEqual(mockEvolutions);
    });

    test('getTopResonantLifeforms should call apiRequest with correct endpoint', async () => {
      const mockLifeforms = [
        { id: 1, name: 'Lifeform 1', resonanceCount: 15 },
        { id: 2, name: 'Lifeform 2', resonanceCount: 10 }
      ];
      
      (apiRequest as jest.Mock).mockResolvedValue(mockLifeforms);
      
      const result = await openaiClient.getTopResonantLifeforms(2);
      
      expect(apiRequest).toHaveBeenCalledWith('/api/lifeforms/top-resonant?limit=2', 'GET');
      expect(result).toEqual(mockLifeforms);
    });
  });
});