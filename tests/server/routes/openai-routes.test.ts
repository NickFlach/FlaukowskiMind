import express from 'express';
import request from 'supertest';
import { registerRoutes } from '../../../server/routes';
import { storage } from '../../../server/storage';
import * as openaiService from '../../../server/services/openai';

// Mock the storage and OpenAI service
jest.mock('../../../server/storage', () => ({
  storage: {
    getTopResonantStreams: jest.fn(),
    getTopResonantKernels: jest.fn(),
    createEcho: jest.fn(),
    getResonancesByUserId: jest.fn(),
    getStreamById: jest.fn(),
    getKernelById: jest.fn(),
    getLifeformById: jest.fn(),
    createLifeformEvolution: jest.fn(),
    updateLifeformState: jest.fn(),
    incrementLifeformGeneration: jest.fn()
  }
}));

jest.mock('../../../server/services/openai', () => ({
  generateEcho: jest.fn(),
  generateSymbolicData: jest.fn(),
  analyzeResonancePatterns: jest.fn(),
  generateUserSigil: jest.fn(),
  generateLifeformAdaptation: jest.fn()
}));

describe('OpenAI Integration Routes', () => {
  let app: express.Application;
  let server: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
    
    // Clear all mock calls
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (server && server.close) {
      server.close();
    }
  });

  describe('POST /api/echoes/generate', () => {
    test('should generate an echo using the OpenAI service', async () => {
      // Mock data
      const mockStreams = [{ id: 1, content: 'Stream content' }];
      const mockKernels = [{ id: 1, title: 'Kernel', content: 'Kernel content' }];
      const mockEcho = { id: 1, content: 'Generated echo', type: 'insight' };
      
      // Set up mocks
      (storage.getTopResonantStreams as jest.Mock).mockResolvedValue(mockStreams);
      (storage.getTopResonantKernels as jest.Mock).mockResolvedValue(mockKernels);
      (openaiService.generateEcho as jest.Mock).mockResolvedValue('Generated echo');
      (storage.createEcho as jest.Mock).mockResolvedValue(mockEcho);

      // Make the request
      const response = await request(app)
        .post('/api/echoes/generate')
        .expect(201);

      // Assertions
      expect(storage.getTopResonantStreams).toHaveBeenCalledWith(5);
      expect(storage.getTopResonantKernels).toHaveBeenCalledWith(3);
      expect(openaiService.generateEcho).toHaveBeenCalledWith(mockStreams, mockKernels);
      expect(storage.createEcho).toHaveBeenCalledWith({
        content: 'Generated echo',
        type: 'insight'
      });
      expect(response.body).toEqual(mockEcho);
    });

    test('should handle errors properly', async () => {
      // Make the service throw an error
      (storage.getTopResonantStreams as jest.Mock).mockRejectedValue(new Error('Storage error'));

      // Make the request
      const response = await request(app)
        .post('/api/echoes/generate')
        .expect(500);

      // Assertions
      expect(response.body).toHaveProperty('error', 'Storage error');
    });
  });

  describe('POST /api/symbolic/analyze', () => {
    test('should analyze content using the OpenAI service', async () => {
      // Mock data
      const requestBody = { content: 'Test content', type: 'stream' };
      const mockResult = {
        symbols: ['test', 'symbol'],
        numerics: [42, 108],
        dialect: 'quantum',
        timestamp: '2024-04-08T12:00:00Z'
      };
      
      // Set up mocks
      (openaiService.generateSymbolicData as jest.Mock).mockResolvedValue(mockResult);

      // Make the request
      const response = await request(app)
        .post('/api/symbolic/analyze')
        .send(requestBody)
        .expect(200);

      // Assertions
      expect(openaiService.generateSymbolicData).toHaveBeenCalledWith('Test content', 'stream');
      expect(response.body).toEqual(mockResult);
    });

    test('should validate required fields', async () => {
      // Make the request without content
      const response = await request(app)
        .post('/api/symbolic/analyze')
        .send({ type: 'stream' })
        .expect(400);

      // Assertions
      expect(response.body).toHaveProperty('error', 'Content and type are required');
    });
  });

  describe('GET /api/users/:userId/resonance-patterns', () => {
    test('should analyze resonance patterns for a user', async () => {
      // Mock data
      const userId = 1;
      const mockResonances = [
        { id: 1, userId: 1, streamId: 1, kernelId: null },
        { id: 2, userId: 1, streamId: null, kernelId: 2 }
      ];
      const mockStreams = [{ id: 1, content: 'Stream content' }];
      const mockKernels = [{ id: 2, content: 'Kernel content' }];
      const mockPatterns = {
        patterns: [
          { type: 'stream', theme: 'consciousness', strength: 0.8 },
          { type: 'kernel', theme: 'emergence', strength: 0.6 }
        ]
      };
      
      // Set up mocks
      (storage.getResonancesByUserId as jest.Mock).mockResolvedValue(mockResonances);
      (storage.getStreamById as jest.Mock).mockResolvedValue(mockStreams[0]);
      (storage.getKernelById as jest.Mock).mockResolvedValue(mockKernels[0]);
      (openaiService.analyzeResonancePatterns as jest.Mock).mockResolvedValue(mockPatterns);

      // Make the request
      const response = await request(app)
        .get(`/api/users/${userId}/resonance-patterns`)
        .expect(200);

      // Assertions
      expect(storage.getResonancesByUserId).toHaveBeenCalledWith(userId);
      expect(storage.getStreamById).toHaveBeenCalledWith(1);
      expect(storage.getKernelById).toHaveBeenCalledWith(2);
      expect(openaiService.analyzeResonancePatterns).toHaveBeenCalledWith(
        mockResonances,
        [mockStreams[0]],
        [mockKernels[0]]
      );
      expect(response.body).toEqual(mockPatterns);
    });

    test('should validate user ID', async () => {
      // Make the request with invalid ID
      const response = await request(app)
        .get('/api/users/invalid/resonance-patterns')
        .expect(400);

      // Assertions
      expect(response.body).toHaveProperty('error', 'Invalid user ID');
    });
  });

  describe('POST /api/users/:userId/sigil', () => {
    test('should generate a user sigil', async () => {
      // Mock data
      const userId = 1;
      const mockResonances = [{ id: 1 }, { id: 2 }];
      const mockSigil = {
        sigil: 'data:image/svg+xml;base64,...',
        elements: ['fire', 'water'],
        resonanceProfile: [0.6, 0.8, 0.4]
      };
      
      // Set up mocks
      (storage.getResonancesByUserId as jest.Mock).mockResolvedValue(mockResonances);
      (openaiService.generateUserSigil as jest.Mock).mockResolvedValue(mockSigil);

      // Make the request
      const response = await request(app)
        .post(`/api/users/${userId}/sigil`)
        .expect(200);

      // Assertions
      expect(storage.getResonancesByUserId).toHaveBeenCalledWith(userId);
      expect(openaiService.generateUserSigil).toHaveBeenCalledWith(userId, mockResonances);
      expect(response.body).toEqual(mockSigil);
    });
  });

  describe('POST /api/lifeforms/:id/evolve', () => {
    test('should evolve a lifeform', async () => {
      // Mock data
      const lifeformId = 1;
      const environmentData = { temperature: 0.7, resources: 0.5 };
      const mockLifeform = {
        id: lifeformId,
        name: 'Test Lifeform',
        type: 'cellular',
        generation: 1,
        state: { cells: [[0, 1, 0], [1, 1, 1], [0, 1, 0]] }
      };
      const mockNewState = { cells: [[1, 1, 1], [1, 0, 1], [1, 1, 1]] };
      const mockEvolution = {
        id: 1,
        lifeformId,
        generation: 1,
        evolutionType: 'environmental_adaptation'
      };
      const mockUpdatedLifeform = {
        ...mockLifeform,
        generation: 2,
        state: mockNewState
      };
      
      // Set up mocks
      (storage.getLifeformById as jest.Mock).mockResolvedValue(mockLifeform);
      (openaiService.generateLifeformAdaptation as jest.Mock).mockResolvedValue(mockNewState);
      (storage.createLifeformEvolution as jest.Mock).mockResolvedValue(mockEvolution);
      (storage.updateLifeformState as jest.Mock).mockResolvedValue({ ...mockLifeform, state: mockNewState });
      (storage.incrementLifeformGeneration as jest.Mock).mockResolvedValue(mockUpdatedLifeform);

      // Make the request
      const response = await request(app)
        .post(`/api/lifeforms/${lifeformId}/evolve`)
        .send({ environmentData })
        .expect(200);

      // Assertions
      expect(storage.getLifeformById).toHaveBeenCalledWith(lifeformId);
      expect(openaiService.generateLifeformAdaptation).toHaveBeenCalledWith(mockLifeform, environmentData);
      expect(storage.createLifeformEvolution).toHaveBeenCalledWith({
        lifeformId,
        generation: 1,
        previousState: mockLifeform.state,
        newState: mockNewState,
        evolutionType: 'environmental_adaptation'
      });
      expect(storage.updateLifeformState).toHaveBeenCalledWith(lifeformId, mockNewState);
      expect(storage.incrementLifeformGeneration).toHaveBeenCalledWith(lifeformId);
      expect(response.body).toEqual({
        evolution: mockEvolution,
        lifeform: mockUpdatedLifeform
      });
    });

    test('should validate request body', async () => {
      // Make the request without environment data
      const response = await request(app)
        .post('/api/lifeforms/1/evolve')
        .send({})
        .expect(400);

      // Assertions
      expect(response.body).toHaveProperty('error', 'Environment data is required');
    });
  });
});