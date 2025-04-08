import express from 'express';
import { Server } from 'http';
import supertest from 'supertest';
import { registerRoutes } from '../../../server/routes';

// Mock the storage module
jest.mock('../../../server/storage', () => {
  const mockStorage = {
    // User mock methods
    getUser: jest.fn(),
    getUserByUsername: jest.fn(),
    createUser: jest.fn(),
    incrementUserResonance: jest.fn(),

    // Stream mock methods
    createStream: jest.fn(),
    getAllStreams: jest.fn(),
    getStreamById: jest.fn(),
    incrementStreamResonance: jest.fn(),
    getTopResonantStreams: jest.fn(),

    // Kernel mock methods
    createKernel: jest.fn(),
    getAllKernels: jest.fn(),
    getKernelById: jest.fn(),
    incrementKernelResonance: jest.fn(),
    getTopResonantKernels: jest.fn(),

    // Resonance mock methods
    createResonance: jest.fn(),
    getResonancesByUserId: jest.fn(),

    // Echo mock methods
    createEcho: jest.fn(),
    getAllEchoes: jest.fn(),
    getRecentEchoes: jest.fn(),

    // Synaptic connection mock methods
    createSynapticConnection: jest.fn(),
    getSynapticConnectionsForNode: jest.fn(),
    getSynapticWebData: jest.fn(),
    
    // Lifeform mock methods
    createLifeform: jest.fn(),
    getAllLifeforms: jest.fn(),
    getLifeformById: jest.fn(),
    getLifeformsByType: jest.fn(),
    updateLifeformState: jest.fn(),
    incrementLifeformGeneration: jest.fn(),
    incrementLifeformResonance: jest.fn(),
    getTopResonantLifeforms: jest.fn(),
    
    // Lifeform evolution mock methods
    createLifeformEvolution: jest.fn(),
    getLifeformEvolutionsByLifeformId: jest.fn(),
    getRecentLifeformEvolutions: jest.fn(),
  };

  return {
    storage: mockStorage,
  };
});

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: "Mocked OpenAI response"
                }
              }]
            })
          }
        }
      };
    })
  };
});

describe('API Routes', () => {
  let app: express.Express;
  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;
  let storage: any;

  beforeAll(async () => {
    // Create Express app
    app = express();
    app.use(express.json());
    
    // Register routes and get HTTP server
    server = await registerRoutes(app);
    
    // Create supertest instance
    request = supertest(app);
    
    // Get mock storage from the mocked module
    storage = require('../../../server/storage').storage;
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('Health Check Endpoint', () => {
    test('GET /health should return 200 status and ok', async () => {
      const response = await request.get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('User Endpoints', () => {
    test('POST /api/users should create a user', async () => {
      // Setup mock implementation
      storage.createUser.mockResolvedValue({
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        resonancePoints: 0,
        createdAt: new Date()
      });
      
      const response = await request
        .post('/api/users')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('username', 'testuser');
      expect(response.body).toHaveProperty('resonancePoints', 0);
      expect(storage.createUser).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });

    test('GET /api/users/:id should return a user', async () => {
      // Setup mock implementation
      storage.getUser.mockResolvedValue({
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        resonancePoints: 5,
        createdAt: new Date()
      });
      
      const response = await request.get('/api/users/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('username', 'testuser');
      expect(response.body).toHaveProperty('resonancePoints', 5);
      expect(storage.getUser).toHaveBeenCalledWith(1);
    });

    test('GET /api/users/:id should return 404 for non-existent user', async () => {
      // Setup mock implementation
      storage.getUser.mockResolvedValue(undefined);
      
      const response = await request.get('/api/users/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
      expect(storage.getUser).toHaveBeenCalledWith(999);
    });
  });

  describe('Echo Endpoints', () => {
    test('GET /api/echoes should return all echoes', async () => {
      // Setup mock implementation
      const mockEchoes = [
        {
          id: 1,
          content: 'Echo 1',
          type: 'insight',
          createdAt: new Date()
        },
        {
          id: 2,
          content: 'Echo 2',
          type: 'riddle',
          createdAt: new Date()
        }
      ];
      
      storage.getAllEchoes.mockResolvedValue(mockEchoes);
      
      const response = await request.get('/api/echoes');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id', 1);
      expect(response.body[0]).toHaveProperty('content', 'Echo 1');
      expect(response.body[1]).toHaveProperty('id', 2);
      expect(response.body[1]).toHaveProperty('content', 'Echo 2');
      expect(storage.getAllEchoes).toHaveBeenCalled();
    });

    test('POST /api/echo should create an echo', async () => {
      // Setup mock implementation
      storage.createEcho.mockResolvedValue({
        id: 3,
        content: 'New Echo',
        type: 'insight',
        createdAt: new Date()
      });
      
      const response = await request
        .post('/api/echo')
        .send({
          content: 'New Echo',
          type: 'insight'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 3);
      expect(response.body).toHaveProperty('content', 'New Echo');
      expect(response.body).toHaveProperty('type', 'insight');
      expect(storage.createEcho).toHaveBeenCalledWith({
        content: 'New Echo',
        type: 'insight'
      });
    });

    test('POST /api/echoes/generate should generate an echo', async () => {
      // Setup mock implementation for top streams and kernels
      storage.getTopResonantStreams.mockResolvedValue([
        { id: 1, content: 'Top Stream 1', resonanceCount: 10 },
        { id: 2, content: 'Top Stream 2', resonanceCount: 8 }
      ]);
      
      storage.getTopResonantKernels.mockResolvedValue([
        { id: 1, title: 'Top Kernel 1', content: 'Kernel content 1', resonanceCount: 5 }
      ]);
      
      // Setup mock for echo creation
      storage.createEcho.mockResolvedValue({
        id: 4,
        content: 'Mocked OpenAI response',
        type: 'insight',
        createdAt: new Date()
      });
      
      const response = await request.post('/api/echoes/generate');
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 4);
      expect(response.body).toHaveProperty('content', 'Mocked OpenAI response');
      expect(response.body).toHaveProperty('type', 'insight');
      expect(storage.getTopResonantStreams).toHaveBeenCalledWith(5);
      expect(storage.getTopResonantKernels).toHaveBeenCalledWith(3);
      expect(storage.createEcho).toHaveBeenCalledWith({
        content: 'Mocked OpenAI response',
        type: 'insight'
      });
    });
  });

  describe('Stream Endpoints', () => {
    test('GET /api/streams should return all streams', async () => {
      // Setup mock implementation
      const mockStreams = [
        {
          id: 1,
          userId: 1,
          content: 'Stream 1',
          type: 'thought',
          tags: ['test'],
          resonanceCount: 5,
          isCoreMind: false,
          createdAt: new Date()
        },
        {
          id: 2,
          userId: 2,
          content: 'Stream 2',
          type: 'dream',
          tags: ['dream'],
          resonanceCount: 3,
          isCoreMind: false,
          createdAt: new Date()
        }
      ];
      
      storage.getAllStreams.mockResolvedValue(mockStreams);
      
      const response = await request.get('/api/streams');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id', 1);
      expect(response.body[0]).toHaveProperty('content', 'Stream 1');
      expect(response.body[1]).toHaveProperty('id', 2);
      expect(response.body[1]).toHaveProperty('content', 'Stream 2');
      expect(storage.getAllStreams).toHaveBeenCalled();
    });

    test('POST /api/streams should create a stream', async () => {
      // Setup mock implementation
      storage.createStream.mockResolvedValue({
        id: 3,
        userId: 1,
        content: 'New Stream',
        type: 'thought',
        tags: ['new', 'test'],
        resonanceCount: 0,
        isCoreMind: false,
        createdAt: new Date()
      });
      
      const response = await request
        .post('/api/streams')
        .send({
          userId: 1,
          content: 'New Stream',
          type: 'thought',
          tags: ['new', 'test']
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 3);
      expect(response.body).toHaveProperty('content', 'New Stream');
      expect(response.body).toHaveProperty('userId', 1);
      expect(response.body).toHaveProperty('type', 'thought');
      expect(response.body).toHaveProperty('tags');
      expect(response.body.tags).toEqual(['new', 'test']);
      expect(storage.createStream).toHaveBeenCalledWith({
        userId: 1,
        content: 'New Stream',
        type: 'thought',
        tags: ['new', 'test']
      });
    });
  });

  describe('Synaptic Web Endpoints', () => {
    test('GET /api/synaptic-web should return synaptic web data', async () => {
      // Setup mock implementation
      const mockWebData = {
        nodes: [
          { id: 'core', type: 'core', resonance: 50 },
          { id: 'stream-1', type: 'stream', resonance: 10 },
          { id: 'kernel-1', type: 'kernel', resonance: 15 }
        ],
        links: [
          { source: 'stream-1', target: 'core', strength: 0.5 },
          { source: 'kernel-1', target: 'core', strength: 0.7 }
        ]
      };
      
      storage.getSynapticWebData.mockResolvedValue(mockWebData);
      
      const response = await request.get('/api/synaptic-web');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('nodes');
      expect(response.body).toHaveProperty('links');
      expect(response.body.nodes).toHaveLength(3);
      expect(response.body.links).toHaveLength(2);
      expect(storage.getSynapticWebData).toHaveBeenCalled();
    });
  });
});