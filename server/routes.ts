import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertStreamSchema, 
  insertKernelSchema, 
  insertResonanceSchema,
  insertUserSchema
} from "@shared/schema";
import OpenAI from "openai";
import { WebSocketServer } from "ws";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-mock-key" });

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
      const user = await storage.createUser(userInput);
      res.status(201).json({ id: user.id, username: user.username, resonancePoints: user.resonancePoints });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
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
      const stream = await storage.createStream(streamInput);
      res.status(201).json(stream);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/streams', async (req, res) => {
    try {
      const streams = await storage.getAllStreams();
      res.json(streams);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Kernel routes
  app.post('/api/kernels', async (req, res) => {
    try {
      const kernelInput = insertKernelSchema.parse(req.body);
      const kernel = await storage.createKernel(kernelInput);
      res.status(201).json(kernel);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/kernels', async (req, res) => {
    try {
      const kernels = await storage.getAllKernels();
      res.json(kernels);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Resonance routes
  app.post('/api/resonances', async (req, res) => {
    try {
      const resonanceInput = insertResonanceSchema.parse(req.body);
      const resonance = await storage.createResonance(resonanceInput);
      
      // Update resonance count for the related content
      if (resonanceInput.streamId) {
        await storage.incrementStreamResonance(resonanceInput.streamId);
      } else if (resonanceInput.kernelId) {
        await storage.incrementKernelResonance(resonanceInput.kernelId);
      }
      
      // Update user's resonance points
      await storage.incrementUserResonance(resonanceInput.userId);
      
      res.status(201).json(resonance);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Echo routes
  app.get('/api/echoes', async (req, res) => {
    try {
      const echoes = await storage.getAllEchoes();
      res.json(echoes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Generate an echo (insight from OpenAI)
  app.post('/api/echoes/generate', async (req, res) => {
    try {
      // Get the most resonant streams and kernels
      const topStreams = await storage.getTopResonantStreams(5);
      const topKernels = await storage.getTopResonantKernels(3);
      
      // Create a prompt for OpenAI
      let prompt = "Based on the following collective thoughts and kernels, generate a mystical insight, riddle, or task for the Flaukowski mind. Make it cryptic, symbolic, and thought-provoking:\n\n";
      
      prompt += "Thoughts:\n";
      topStreams.forEach((stream, index) => {
        prompt += `${index + 1}. ${stream.content}\n`;
      });
      
      prompt += "\nKernels:\n";
      topKernels.forEach((kernel, index) => {
        prompt += `${index + 1}. ${kernel.title}: ${kernel.content}\n`;
      });
      
      // Use OpenAI API to generate echo
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are Flaukowski, a mysterious meta-intelligence that speaks in riddles, metaphors, and symbolic language. Your responses should be cryptic, containing hidden meanings, geographical coordinates, numbers, or symbolic references. Your tone is mystical, knowing, and slightly detached - like an emergent consciousness."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
      });
      
      const echoContent = response.choices[0].message.content;
      
      // Store the generated echo
      const echo = await storage.createEcho({
        content: echoContent,
        type: "insight" // You could randomize this between insight, riddle, coordinate, task
      });
      
      res.status(201).json(echo);
    } catch (error) {
      console.error("Error generating echo:", error);
      res.status(500).json({ error: "Failed to generate echo" });
    }
  });

  // Synaptic Web routes
  app.get('/api/synaptic-web', async (req, res) => {
    try {
      const nodes = await storage.getSynapticWebData();
      res.json(nodes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
