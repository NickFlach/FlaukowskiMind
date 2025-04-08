import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { 
  insertStreamSchema, 
  insertKernelSchema, 
  insertResonanceSchema,
  insertUserSchema,
  insertEchoSchema,
  insertLifeformSchema,
  insertLifeformEvolutionSchema,
  insertSynapticConnectionSchema,
  insertFileUploadSchema
} from "@shared/schema";
import { WebSocketServer } from "ws";
import * as openaiService from "./services/openai";
import * as kernelStateController from "./controllers/kernelStateController";
import * as fileUploadController from "./controllers/fileUploadController";
import multer from 'multer';
import fs from 'fs';
import path from 'path';

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Add a health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // User routes
  app.post('/api/users', async (req, res) => {
    try {
      const userInput = insertUserSchema.parse(req.body);
      const user = await dbStorage.createUser(userInput);
      res.status(201).json({ id: user.id, username: user.username, resonancePoints: user.resonancePoints });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await dbStorage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ id: user.id, username: user.username, resonancePoints: user.resonancePoints });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stream routes
  app.post('/api/streams', async (req, res) => {
    try {
      const streamInput = insertStreamSchema.parse(req.body);
      const stream = await dbStorage.createStream(streamInput);
      res.status(201).json(stream);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/streams', async (req, res) => {
    try {
      const streams = await dbStorage.getAllStreams();
      res.json(streams);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Kernel routes
  app.post('/api/kernels', async (req, res) => {
    try {
      const kernelInput = insertKernelSchema.parse(req.body);
      const kernel = await dbStorage.createKernel(kernelInput);
      res.status(201).json(kernel);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/kernels', async (req, res) => {
    try {
      // Check if we need to filter by resonance state
      if (req.query.state) {
        const state = req.query.state as string;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        const kernels = await dbStorage.getKernelsByResonanceState(state, limit);
        return res.json(kernels);
      }
      
      const kernels = await dbStorage.getAllKernels();
      res.json(kernels);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Get a specific kernel by ID
  app.get('/api/kernels/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid kernel ID' });
      }
      
      const kernel = await dbStorage.getKernelById(id);
      if (!kernel) {
        return res.status(404).json({ error: 'Kernel not found' });
      }
      
      res.json(kernel);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Get all kernels for a specific user
  app.get('/api/users/:userId/kernels', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const kernels = await dbStorage.getUserKernels(userId);
      res.json(kernels);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Kernel Phase Model (KPM) routes
  app.get('/api/kernels/:id/state', kernelStateController.getKernelState);
  
  app.post('/api/kernels/:id/progress-state', kernelStateController.progressKernelState);
  
  app.post('/api/kernels/:id/set-state', kernelStateController.setKernelState);
  
  app.post('/api/kernels/:id/quantum-feedback', kernelStateController.generateQuantumFeedback);

  // Resonance routes
  app.post('/api/resonances', async (req, res) => {
    try {
      const resonanceInput = insertResonanceSchema.parse(req.body);
      const resonance = await dbStorage.createResonance(resonanceInput);
      
      // Update resonance count for the related content
      if (resonanceInput.streamId) {
        await dbStorage.incrementStreamResonance(resonanceInput.streamId);
      } else if (resonanceInput.kernelId) {
        await dbStorage.incrementKernelResonance(resonanceInput.kernelId);
      }
      
      // Update user's resonance points
      await dbStorage.incrementUserResonance(resonanceInput.userId);
      
      res.status(201).json(resonance);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Echo routes
  app.get('/api/echoes', async (req, res) => {
    try {
      const echoes = await dbStorage.getAllEchoes();
      res.json(echoes);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  app.post('/api/echo', async (req, res) => {
    try {
      const echoInput = insertEchoSchema.parse(req.body);
      const echo = await dbStorage.createEcho(echoInput);
      res.status(201).json(echo);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Generate an echo (insight from OpenAI)
  app.post('/api/echoes/generate', async (req, res) => {
    try {
      // Get the most resonant streams and kernels
      const topStreams = await dbStorage.getTopResonantStreams(5);
      const topKernels = await dbStorage.getTopResonantKernels(3);
      
      // Use OpenAI service to generate echo
      const echoContent = await openaiService.generateEcho(topStreams, topKernels);
      
      // Store the generated echo
      const echo = await dbStorage.createEcho({
        content: echoContent,
        type: "insight" // You could randomize this between insight, riddle, coordinate, task
      });
      
      res.status(201).json(echo);
    } catch (error) {
      console.error("Error generating echo:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate echo" });
    }
  });

  // Synaptic Web routes
  app.get('/api/synaptic-web', async (req, res) => {
    try {
      const nodes = await dbStorage.getSynapticWebData();
      res.json(nodes);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // OpenAI Integration endpoints for symbolic analysis
  app.post('/api/symbolic/analyze', async (req, res) => {
    try {
      const { content, type } = req.body;
      if (!content || !type) {
        return res.status(400).json({ error: 'Content and type are required' });
      }
      
      const symbolicData = await openaiService.generateSymbolicData(content, type);
      res.status(200).json(symbolicData);
    } catch (error) {
      console.error('Error analyzing content:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to analyze content' });
    }
  });

  // User resonance pattern analysis
  app.get('/api/users/:userId/resonance-patterns', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      // Get the user's resonances
      const resonances = await dbStorage.getResonancesByUserId(userId);
      
      // Get the streams and kernels the user has resonated with
      const streamIds = resonances
        .filter(r => r.streamId !== null)
        .map(r => r.streamId as number);
      
      const kernelIds = resonances
        .filter(r => r.kernelId !== null)
        .map(r => r.kernelId as number);
      
      // Collect the content
      const streams = await Promise.all(
        streamIds.map(id => dbStorage.getStreamById(id))
      );
      
      const kernels = await Promise.all(
        kernelIds.map(id => dbStorage.getKernelById(id))
      );
      
      // Filter out undefined values
      const validStreams = streams.filter(s => s !== undefined) as any[];
      const validKernels = kernels.filter(k => k !== undefined) as any[];
      
      // Analyze the patterns
      const patterns = await openaiService.analyzeResonancePatterns(
        resonances,
        validStreams,
        validKernels
      );
      
      res.status(200).json(patterns);
    } catch (error) {
      console.error('Error analyzing resonance patterns:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to analyze resonance patterns' });
    }
  });

  // Generate a user sigil
  app.post('/api/users/:userId/sigil', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      // Get the user's resonances
      const resonances = await dbStorage.getResonancesByUserId(userId);
      
      // Generate a sigil
      const sigil = await openaiService.generateUserSigil(userId, resonances);
      
      res.status(200).json(sigil);
    } catch (error) {
      console.error('Error generating user sigil:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate user sigil' });
    }
  });

  // Lifeform routes
  app.post('/api/lifeforms', async (req, res) => {
    try {
      const { name, type, initialState } = req.body;
      if (!name || !type || !initialState) {
        return res.status(400).json({ error: 'Name, type, and initialState are required' });
      }
      
      // Generate a DNA string (could be random or based on parameters)
      const dna = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      
      const lifeformInput = insertLifeformSchema.parse({
        name,
        type,
        dna,
        state: initialState
      });
      
      const lifeform = await dbStorage.createLifeform(lifeformInput);
      res.status(201).json(lifeform);
    } catch (error) {
      console.error('Error creating lifeform:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create lifeform' });
    }
  });

  app.get('/api/lifeforms', async (req, res) => {
    try {
      const lifeforms = await dbStorage.getAllLifeforms();
      res.status(200).json(lifeforms);
    } catch (error) {
      console.error('Error getting lifeforms:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get lifeforms' });
    }
  });

  app.get('/api/lifeforms/top-resonant', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      const lifeforms = await dbStorage.getTopResonantLifeforms(limit);
      res.status(200).json(lifeforms);
    } catch (error) {
      console.error('Error getting top resonant lifeforms:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get top resonant lifeforms' });
    }
  });

  app.get('/api/lifeforms/type/:type', async (req, res) => {
    try {
      const type = req.params.type;
      if (!type) {
        return res.status(400).json({ error: 'Type is required' });
      }
      
      const lifeforms = await dbStorage.getLifeformsByType(type);
      res.status(200).json(lifeforms);
    } catch (error) {
      console.error('Error getting lifeforms by type:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get lifeforms by type' });
    }
  });

  app.post('/api/lifeforms/:id/evolve', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid lifeform ID' });
      }
      
      const { environmentData } = req.body;
      if (!environmentData) {
        return res.status(400).json({ error: 'Environment data is required' });
      }
      
      // Get the lifeform
      const lifeform = await dbStorage.getLifeformById(id);
      if (!lifeform) {
        return res.status(404).json({ error: 'Lifeform not found' });
      }
      
      // Generate adaptation
      const newState = await openaiService.generateLifeformAdaptation(lifeform, environmentData);
      
      // Store the previous state to track evolution
      const previousState = lifeform.state;
      
      // Create evolution record
      const evolution = await dbStorage.createLifeformEvolution({
        lifeformId: id,
        generation: lifeform.generation,
        previousState,
        newState,
        evolutionType: 'environmental_adaptation'
      });
      
      // Update lifeform with new state
      await dbStorage.updateLifeformState(id, newState);
      
      // Increment generation
      const updatedLifeform = await dbStorage.incrementLifeformGeneration(id);
      
      res.status(200).json({
        evolution,
        lifeform: updatedLifeform
      });
    } catch (error) {
      console.error('Error evolving lifeform:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to evolve lifeform' });
    }
  });

  app.get('/api/lifeforms/:id/evolutions', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid lifeform ID' });
      }
      
      const evolutions = await dbStorage.getLifeformEvolutionsByLifeformId(id);
      res.status(200).json(evolutions);
    } catch (error) {
      console.error('Error getting lifeform evolutions:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get lifeform evolutions' });
    }
  });

  // This specific route goes after the wildcard routes to avoid conflicts
  app.get('/api/lifeforms/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid lifeform ID' });
      }
      
      const lifeform = await dbStorage.getLifeformById(id);
      if (!lifeform) {
        return res.status(404).json({ error: 'Lifeform not found' });
      }
      
      res.status(200).json(lifeform);
    } catch (error) {
      console.error('Error getting lifeform:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get lifeform' });
    }
  });

  // File Upload Processing routes
  // Handle file uploads with multer
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Configure multer storage
  const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
  
  const upload = multer({ storage: multerStorage });
  
  // Handle file uploads
  app.post('/api/uploads', upload.single('file'), fileUploadController.handleFileUpload);
  
  // Process uploaded code files
  app.post('/api/uploads/code/:fileUploadId/process', fileUploadController.processCodeFile);
  
  // Get a specific file upload
  app.get('/api/uploads/:fileUploadId', fileUploadController.getFileUpload);
  
  // Get all file uploads for a user
  app.get('/api/users/:userId/uploads', fileUploadController.getUserFileUploads);
  
  // Get all file uploads associated with a kernel
  app.get('/api/kernels/:kernelId/uploads', fileUploadController.getKernelFileUploads);
  
  // Link a file upload to a kernel
  app.post('/api/uploads/:fileUploadId/link-kernel', fileUploadController.linkFileToKernel);

  return httpServer;
}
