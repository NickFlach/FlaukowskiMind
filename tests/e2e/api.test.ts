import express, { Express } from 'express';
import { Server } from 'http';
import supertest from 'supertest';
import { registerRoutes } from '../../server/routes';
import { storage } from '../../server/storage';

describe('E2E API Tests', () => {
  let app: Express;
  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;
  let testUser: any;
  let testStream: any;
  let testKernel: any;

  beforeAll(async () => {
    // Create Express app
    app = express();
    app.use(express.json());
    
    // Register routes and get HTTP server
    server = await registerRoutes(app);
    
    // Create supertest instance
    request = supertest(app);
  });

  afterAll((done) => {
    server.close(done);
  });

  // Test the full user, stream, kernel and resonance flow
  describe('Full User Journey', () => {
    test('Should create a user', async () => {
      const response = await request
        .post('/api/users')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', 'testuser');
      expect(response.body).toHaveProperty('resonancePoints', 0);
      
      testUser = response.body;
    });

    test('Should create a stream', async () => {
      const response = await request
        .post('/api/streams')
        .send({
          userId: testUser.id,
          content: 'Test stream content',
          type: 'thought',
          tags: ['test', 'e2e']
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('content', 'Test stream content');
      expect(response.body).toHaveProperty('type', 'thought');
      expect(response.body).toHaveProperty('tags');
      expect(response.body.tags).toContain('test');
      expect(response.body.tags).toContain('e2e');
      
      testStream = response.body;
    });

    test('Should create a kernel', async () => {
      const response = await request
        .post('/api/kernels')
        .send({
          userId: testUser.id,
          title: 'Test Kernel',
          content: 'Test kernel content',
          type: 'code',
          tags: ['test', 'code']
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'Test Kernel');
      expect(response.body).toHaveProperty('content', 'Test kernel content');
      expect(response.body).toHaveProperty('type', 'code');
      
      testKernel = response.body;
    });

    test('Should create a resonance for a stream', async () => {
      const response = await request
        .post('/api/resonances')
        .send({
          userId: testUser.id,
          streamId: testStream.id
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', testUser.id);
      expect(response.body).toHaveProperty('streamId', testStream.id);
      
      // Verify that stream resonance count was incremented
      const streamResponse = await request.get(`/api/streams/${testStream.id}`);
      expect(streamResponse.body.resonanceCount).toBe(1);
      
      // Verify that user resonance points were incremented
      const userResponse = await request.get(`/api/users/${testUser.id}`);
      expect(userResponse.body.resonancePoints).toBe(1);
    });

    test('Should create a resonance for a kernel', async () => {
      const response = await request
        .post('/api/resonances')
        .send({
          userId: testUser.id,
          kernelId: testKernel.id
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', testUser.id);
      expect(response.body).toHaveProperty('kernelId', testKernel.id);
      
      // Verify that kernel resonance count was incremented
      const kernelResponse = await request.get(`/api/kernels/${testKernel.id}`);
      expect(kernelResponse.body.resonanceCount).toBe(1);
      
      // Verify that user resonance points were incremented
      const userResponse = await request.get(`/api/users/${testUser.id}`);
      expect(userResponse.body.resonancePoints).toBe(2);
    });

    test('Should generate an echo', async () => {
      // Skip this test if OPENAI_API_KEY is not set
      if (!process.env.OPENAI_API_KEY) {
        console.log('Skipping echo generation test as OPENAI_API_KEY is not set');
        return;
      }
      
      const response = await request.post('/api/echoes/generate');
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('type');
    });

    test('Should return synaptic web data', async () => {
      const response = await request.get('/api/synaptic-web');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('nodes');
      expect(response.body).toHaveProperty('links');
      
      // Our test user's content should be part of the synaptic web
      const nodeIds = response.body.nodes.map((node: any) => node.id);
      expect(nodeIds).toContain(`stream-${testStream.id}`);
      expect(nodeIds).toContain(`kernel-${testKernel.id}`);
    });
  });
});