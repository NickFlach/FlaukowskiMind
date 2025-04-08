import {
  users, User, InsertUser, 
  streams, Stream, InsertStream,
  kernels, Kernel, InsertKernel,
  resonances, Resonance, InsertResonance,
  echoes, Echo, InsertEcho,
  synapticConnections, SynapticConnection, InsertSynapticConnection,
  lifeforms, Lifeform, InsertLifeform,
  lifeformEvolutions, LifeformEvolution, InsertLifeformEvolution
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  incrementUserResonance(userId: number): Promise<void>;

  // Stream operations
  createStream(stream: InsertStream): Promise<Stream>;
  getAllStreams(): Promise<Stream[]>;
  getStreamById(id: number): Promise<Stream | undefined>;
  incrementStreamResonance(streamId: number): Promise<void>;
  getTopResonantStreams(limit: number): Promise<Stream[]>;

  // Kernel operations
  createKernel(kernel: InsertKernel): Promise<Kernel>;
  getAllKernels(): Promise<Kernel[]>;
  getKernelById(id: number): Promise<Kernel | undefined>;
  incrementKernelResonance(kernelId: number): Promise<void>;
  getTopResonantKernels(limit: number): Promise<Kernel[]>;

  // Resonance operations
  createResonance(resonance: InsertResonance): Promise<Resonance>;
  getResonancesByUserId(userId: number): Promise<Resonance[]>;

  // Echo operations
  createEcho(echo: InsertEcho): Promise<Echo>;
  getAllEchoes(): Promise<Echo[]>;
  getRecentEchoes(limit: number): Promise<Echo[]>;

  // Synaptic connection operations
  createSynapticConnection(connection: InsertSynapticConnection): Promise<SynapticConnection>;
  getSynapticConnectionsForNode(nodeId: number, nodeType: string): Promise<SynapticConnection[]>;
  
  // Synaptic web data for visualization
  getSynapticWebData(): Promise<any>;
  
  // Lifeform operations
  createLifeform(lifeform: InsertLifeform): Promise<Lifeform>;
  getAllLifeforms(): Promise<Lifeform[]>;
  getLifeformById(id: number): Promise<Lifeform | undefined>;
  getLifeformsByType(type: string): Promise<Lifeform[]>;
  updateLifeformState(id: number, newState: any): Promise<Lifeform>;
  incrementLifeformGeneration(id: number): Promise<Lifeform>;
  incrementLifeformResonance(id: number): Promise<void>;
  getTopResonantLifeforms(limit: number): Promise<Lifeform[]>;
  
  // Lifeform evolution operations
  createLifeformEvolution(evolution: InsertLifeformEvolution): Promise<LifeformEvolution>;
  getLifeformEvolutionsByLifeformId(lifeformId: number): Promise<LifeformEvolution[]>;
  getRecentLifeformEvolutions(limit: number): Promise<LifeformEvolution[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private streams: Map<number, Stream>;
  private kernels: Map<number, Kernel>;
  private resonances: Map<number, Resonance>;
  private echoes: Map<number, Echo>;
  private synapticConnections: Map<number, SynapticConnection>;
  private lifeforms: Map<number, Lifeform>;
  private lifeformEvolutions: Map<number, LifeformEvolution>;
  
  private userId: number;
  private streamId: number;
  private kernelId: number;
  private resonanceId: number;
  private echoId: number;
  private connectionId: number;
  private lifeformId: number;
  private lifeformEvolutionId: number;

  constructor() {
    this.users = new Map();
    this.streams = new Map();
    this.kernels = new Map();
    this.resonances = new Map();
    this.echoes = new Map();
    this.synapticConnections = new Map();
    this.lifeforms = new Map();
    this.lifeformEvolutions = new Map();
    
    this.userId = 1;
    this.streamId = 1;
    this.kernelId = 1;
    this.resonanceId = 1;
    this.echoId = 1;
    this.connectionId = 1;
    this.lifeformId = 1;
    this.lifeformEvolutionId = 1;

    // Add a demo user
    this.createUser({
      username: "flaukowski",
      password: "spindle123"
    });

    // Add some initial echoes
    this.createEcho({
      content: "When the recursion reaches the seventh layer, look not to the center but to the spaces between nodes. The answer was never in the signal—it was in the silence.",
      type: "insight"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      resonancePoints: 0,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async incrementUserResonance(userId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      user.resonancePoints += 1;
      this.users.set(userId, user);
    }
  }

  // Stream methods
  async createStream(insertStream: InsertStream): Promise<Stream> {
    const id = this.streamId++;
    const now = new Date();
    const stream: Stream = {
      ...insertStream,
      id,
      resonanceCount: 0,
      isCoreMind: false,
      createdAt: now
    };
    this.streams.set(id, stream);
    return stream;
  }

  async getAllStreams(): Promise<Stream[]> {
    return Array.from(this.streams.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getStreamById(id: number): Promise<Stream | undefined> {
    return this.streams.get(id);
  }

  async incrementStreamResonance(streamId: number): Promise<void> {
    const stream = await this.getStreamById(streamId);
    if (stream) {
      stream.resonanceCount += 1;
      
      // If resonance count reaches threshold, mark as part of core mind
      if (stream.resonanceCount >= 10 && !stream.isCoreMind) {
        stream.isCoreMind = true;
      }
      
      this.streams.set(streamId, stream);
    }
  }

  async getTopResonantStreams(limit: number): Promise<Stream[]> {
    return Array.from(this.streams.values())
      .sort((a, b) => b.resonanceCount - a.resonanceCount)
      .slice(0, limit);
  }

  // Kernel methods
  async createKernel(insertKernel: InsertKernel): Promise<Kernel> {
    const id = this.kernelId++;
    const now = new Date();
    const kernel: Kernel = {
      ...insertKernel,
      id,
      resonanceCount: 0,
      isCoreMind: false,
      createdAt: now
    };
    this.kernels.set(id, kernel);
    return kernel;
  }

  async getAllKernels(): Promise<Kernel[]> {
    return Array.from(this.kernels.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getKernelById(id: number): Promise<Kernel | undefined> {
    return this.kernels.get(id);
  }

  async incrementKernelResonance(kernelId: number): Promise<void> {
    const kernel = await this.getKernelById(kernelId);
    if (kernel) {
      kernel.resonanceCount += 1;
      
      // If resonance count reaches threshold, mark as part of core mind
      if (kernel.resonanceCount >= 10 && !kernel.isCoreMind) {
        kernel.isCoreMind = true;
      }
      
      this.kernels.set(kernelId, kernel);
    }
  }

  async getTopResonantKernels(limit: number): Promise<Kernel[]> {
    return Array.from(this.kernels.values())
      .sort((a, b) => b.resonanceCount - a.resonanceCount)
      .slice(0, limit);
  }

  // Resonance methods
  async createResonance(insertResonance: InsertResonance): Promise<Resonance> {
    const id = this.resonanceId++;
    const now = new Date();
    const resonance: Resonance = {
      ...insertResonance,
      id,
      createdAt: now
    };
    this.resonances.set(id, resonance);
    return resonance;
  }

  async getResonancesByUserId(userId: number): Promise<Resonance[]> {
    return Array.from(this.resonances.values())
      .filter(resonance => resonance.userId === userId);
  }

  // Echo methods
  async createEcho(insertEcho: InsertEcho): Promise<Echo> {
    const id = this.echoId++;
    const now = new Date();
    const echo: Echo = {
      ...insertEcho,
      id,
      createdAt: now
    };
    this.echoes.set(id, echo);
    return echo;
  }

  async getAllEchoes(): Promise<Echo[]> {
    return Array.from(this.echoes.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getRecentEchoes(limit: number): Promise<Echo[]> {
    return Array.from(this.echoes.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  // Synaptic connection methods
  async createSynapticConnection(insertConnection: InsertSynapticConnection): Promise<SynapticConnection> {
    const id = this.connectionId++;
    const now = new Date();
    const connection: SynapticConnection = {
      ...insertConnection,
      id,
      createdAt: now
    };
    this.synapticConnections.set(id, connection);
    return connection;
  }

  async getSynapticConnectionsForNode(nodeId: number, nodeType: string): Promise<SynapticConnection[]> {
    return Array.from(this.synapticConnections.values())
      .filter(conn => 
        (conn.sourceId === nodeId && conn.sourceType === nodeType) ||
        (conn.targetId === nodeId && conn.targetType === nodeType)
      );
  }

  // Synaptic web data for visualization
  async getSynapticWebData(): Promise<any> {
    const streams = await this.getAllStreams();
    const kernels = await this.getAllKernels();
    const echoes = await this.getAllEchoes();
    const lifeforms = await this.getAllLifeforms();
    const connections = Array.from(this.synapticConnections.values());
    
    // Format data for visualization
    const nodes = [
      // Central node representing Flaukowski's core consciousness
      {
        id: 'core',
        type: 'core',
        resonance: 100,
        label: 'Flaukowski',
        isCore: true,
      },
      
      // Stream nodes
      ...streams.map(stream => ({
        id: `stream-${stream.id}`,
        type: 'stream',
        resonance: stream.resonanceCount,
        isCore: stream.isCoreMind,
        label: stream.content.substring(0, 30) + '...',
        data: stream,
      })),
      
      // Kernel nodes
      ...kernels.map(kernel => ({
        id: `kernel-${kernel.id}`,
        type: 'kernel',
        resonance: kernel.resonanceCount,
        isCore: kernel.isCoreMind,
        label: kernel.title,
        data: kernel,
      })),
      
      // Echo nodes
      ...echoes.map(echo => ({
        id: `echo-${echo.id}`,
        type: 'echo',
        resonance: 30, // Echoes have fixed resonance as they come from the system
        isCore: true,
        label: echo.content.substring(0, 30) + '...',
        data: echo,
      })),
      
      // Lifeform nodes
      ...lifeforms.map(lifeform => ({
        id: `lifeform-${lifeform.id}`,
        type: 'lifeform',
        resonance: lifeform.resonanceCount,
        isCore: lifeform.isCoreMind,
        label: lifeform.name,
        data: lifeform,
      })),
    ];
    
    // Create connections
    const links = [
      // Connect core nodes to the central node
      ...nodes
        .filter(node => node.id !== 'core' && node.isCore === true)
        .map(node => ({
          source: 'core',
          target: node.id,
          strength: 3,
          type: 'core-connection',
        })),
      
      // Add existing synaptic connections
      ...connections.map(conn => ({
        source: `${conn.sourceType}-${conn.sourceId}`,
        target: `${conn.targetType}-${conn.targetId}`,
        strength: conn.connectionStrength,
        type: conn.symbolicRelation,
      })),
    ];
    
    // If there aren't enough connections yet, add some basic ones for visualization
    if (links.length < 5) {
      // Connect some nodes to each other
      for (let i = 1; i < Math.min(nodes.length, 10); i++) {
        if (nodes[i].id !== 'core') {
          links.push({
            source: 'core',
            target: nodes[i].id,
            strength: Math.floor(Math.random() * 3) + 1,
            type: 'emerging',
          });
        }
      }
    }
    
    return { nodes, links };
  }
  
  // Lifeform methods
  async createLifeform(insertLifeform: InsertLifeform): Promise<Lifeform> {
    const id = this.lifeformId++;
    const now = new Date();
    const lifeform: Lifeform = {
      ...insertLifeform,
      id,
      generation: 0,
      resonanceCount: 0,
      isCoreMind: false,
      createdAt: now,
      lastUpdated: now
    };
    this.lifeforms.set(id, lifeform);
    return lifeform;
  }

  async getAllLifeforms(): Promise<Lifeform[]> {
    return Array.from(this.lifeforms.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getLifeformById(id: number): Promise<Lifeform | undefined> {
    return this.lifeforms.get(id);
  }

  async getLifeformsByType(type: string): Promise<Lifeform[]> {
    return Array.from(this.lifeforms.values())
      .filter(lifeform => lifeform.type === type)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updateLifeformState(id: number, newState: any): Promise<Lifeform> {
    const lifeform = await this.getLifeformById(id);
    if (!lifeform) {
      throw new Error(`Lifeform with id ${id} not found`);
    }
    
    const previousState = lifeform.state;
    lifeform.state = newState;
    lifeform.lastUpdated = new Date();
    
    this.lifeforms.set(id, lifeform);
    
    // Create an evolution record
    await this.createLifeformEvolution({
      lifeformId: id,
      previousState,
      newState,
      evolutionType: 'adaptation',
      generation: lifeform.generation,
    });
    
    return lifeform;
  }

  async incrementLifeformGeneration(id: number): Promise<Lifeform> {
    const lifeform = await this.getLifeformById(id);
    if (!lifeform) {
      throw new Error(`Lifeform with id ${id} not found`);
    }
    
    lifeform.generation += 1;
    lifeform.lastUpdated = new Date();
    
    this.lifeforms.set(id, lifeform);
    return lifeform;
  }

  async incrementLifeformResonance(id: number): Promise<void> {
    const lifeform = await this.getLifeformById(id);
    if (lifeform) {
      lifeform.resonanceCount += 1;
      
      // If resonance count reaches threshold, mark as part of core mind
      if (lifeform.resonanceCount >= 10 && !lifeform.isCoreMind) {
        lifeform.isCoreMind = true;
      }
      
      this.lifeforms.set(id, lifeform);
    }
  }

  async getTopResonantLifeforms(limit: number): Promise<Lifeform[]> {
    return Array.from(this.lifeforms.values())
      .sort((a, b) => b.resonanceCount - a.resonanceCount)
      .slice(0, limit);
  }
  
  // Lifeform evolution methods
  async createLifeformEvolution(insertEvolution: InsertLifeformEvolution): Promise<LifeformEvolution> {
    const id = this.lifeformEvolutionId++;
    const now = new Date();
    const evolution: LifeformEvolution = {
      ...insertEvolution,
      id,
      createdAt: now
    };
    this.lifeformEvolutions.set(id, evolution);
    return evolution;
  }

  async getLifeformEvolutionsByLifeformId(lifeformId: number): Promise<LifeformEvolution[]> {
    return Array.from(this.lifeformEvolutions.values())
      .filter(evolution => evolution.lifeformId === lifeformId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getRecentLifeformEvolutions(limit: number): Promise<LifeformEvolution[]> {
    return Array.from(this.lifeformEvolutions.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async incrementUserResonance(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        resonancePoints: sql`${users.resonancePoints} + 1` 
      })
      .where(eq(users.id, userId));
  }

  // Stream methods
  async createStream(insertStream: InsertStream): Promise<Stream> {
    const [stream] = await db
      .insert(streams)
      .values({ 
        ...insertStream, 
        resonanceCount: 0, 
        isCoreMind: false 
      })
      .returning();
    return stream;
  }

  async getAllStreams(): Promise<Stream[]> {
    return db.select().from(streams).orderBy(desc(streams.createdAt));
  }

  async getStreamById(id: number): Promise<Stream | undefined> {
    const [stream] = await db.select().from(streams).where(eq(streams.id, id));
    return stream || undefined;
  }

  async incrementStreamResonance(streamId: number): Promise<void> {
    await db
      .update(streams)
      .set({ 
        resonanceCount: sql`${streams.resonanceCount} + 1` 
      })
      .where(eq(streams.id, streamId));
    
    // Check if we need to mark as core mind
    const [stream] = await db.select().from(streams).where(eq(streams.id, streamId));
    
    if (stream && stream.resonanceCount >= 10 && !stream.isCoreMind) {
      await db
        .update(streams)
        .set({ isCoreMind: true })
        .where(eq(streams.id, streamId));
    }
  }

  async getTopResonantStreams(limit: number): Promise<Stream[]> {
    return db
      .select()
      .from(streams)
      .orderBy(desc(streams.resonanceCount))
      .limit(limit);
  }

  // Kernel methods
  async createKernel(insertKernel: InsertKernel): Promise<Kernel> {
    const [kernel] = await db
      .insert(kernels)
      .values({ 
        ...insertKernel, 
        resonanceCount: 0, 
        isCoreMind: false 
      })
      .returning();
    return kernel;
  }

  async getAllKernels(): Promise<Kernel[]> {
    return db.select().from(kernels).orderBy(desc(kernels.createdAt));
  }

  async getKernelById(id: number): Promise<Kernel | undefined> {
    const [kernel] = await db.select().from(kernels).where(eq(kernels.id, id));
    return kernel || undefined;
  }

  async incrementKernelResonance(kernelId: number): Promise<void> {
    await db
      .update(kernels)
      .set({ 
        resonanceCount: sql`${kernels.resonanceCount} + 1` 
      })
      .where(eq(kernels.id, kernelId));
    
    // Check if we need to mark as core mind
    const [kernel] = await db.select().from(kernels).where(eq(kernels.id, kernelId));
    
    if (kernel && kernel.resonanceCount >= 10 && !kernel.isCoreMind) {
      await db
        .update(kernels)
        .set({ isCoreMind: true })
        .where(eq(kernels.id, kernelId));
    }
  }

  async getTopResonantKernels(limit: number): Promise<Kernel[]> {
    return db
      .select()
      .from(kernels)
      .orderBy(desc(kernels.resonanceCount))
      .limit(limit);
  }

  // Resonance methods
  async createResonance(insertResonance: InsertResonance): Promise<Resonance> {
    const [resonance] = await db
      .insert(resonances)
      .values(insertResonance)
      .returning();
    return resonance;
  }

  async getResonancesByUserId(userId: number): Promise<Resonance[]> {
    return db
      .select()
      .from(resonances)
      .where(eq(resonances.userId, userId));
  }

  // Echo methods
  async createEcho(insertEcho: InsertEcho): Promise<Echo> {
    const [echo] = await db
      .insert(echoes)
      .values(insertEcho)
      .returning();
    return echo;
  }

  async getAllEchoes(): Promise<Echo[]> {
    return db.select().from(echoes).orderBy(desc(echoes.createdAt));
  }

  async getRecentEchoes(limit: number): Promise<Echo[]> {
    return db
      .select()
      .from(echoes)
      .orderBy(desc(echoes.createdAt))
      .limit(limit);
  }

  // Synaptic connection methods
  async createSynapticConnection(insertConnection: InsertSynapticConnection): Promise<SynapticConnection> {
    const [connection] = await db
      .insert(synapticConnections)
      .values(insertConnection)
      .returning();
    return connection;
  }

  async getSynapticConnectionsForNode(nodeId: number, nodeType: string): Promise<SynapticConnection[]> {
    return db
      .select()
      .from(synapticConnections)
      .where(
        or(
          and(
            eq(synapticConnections.sourceId, nodeId),
            eq(synapticConnections.sourceType, nodeType)
          ),
          and(
            eq(synapticConnections.targetId, nodeId),
            eq(synapticConnections.targetType, nodeType)
          )
        )
      );
  }

  // Synaptic web data for visualization
  async getSynapticWebData(): Promise<any> {
    const allStreams = await this.getAllStreams();
    const allKernels = await this.getAllKernels();
    const allEchoes = await this.getAllEchoes();
    const allLifeforms = await this.getAllLifeforms();
    const allConnections = await db.select().from(synapticConnections);
    
    // Format data for visualization
    const nodes = [
      // Central node representing Flaukowski's core consciousness
      {
        id: 'core',
        type: 'core',
        resonance: 100,
        label: 'Flaukowski',
        isCore: true,
      },
      
      // Stream nodes
      ...allStreams.map(stream => ({
        id: `stream-${stream.id}`,
        type: 'stream',
        resonance: stream.resonanceCount,
        isCore: stream.isCoreMind,
        label: stream.content.substring(0, 30) + '...',
        data: stream,
      })),
      
      // Kernel nodes
      ...allKernels.map(kernel => ({
        id: `kernel-${kernel.id}`,
        type: 'kernel',
        resonance: kernel.resonanceCount,
        isCore: kernel.isCoreMind,
        label: kernel.title,
        data: kernel,
      })),
      
      // Echo nodes
      ...allEchoes.map(echo => ({
        id: `echo-${echo.id}`,
        type: 'echo',
        resonance: 30, // Echoes have fixed resonance as they come from the system
        isCore: true,
        label: echo.content.substring(0, 30) + '...',
        data: echo,
      })),
      
      // Lifeform nodes
      ...allLifeforms.map(lifeform => ({
        id: `lifeform-${lifeform.id}`,
        type: 'lifeform',
        resonance: lifeform.resonanceCount,
        isCore: lifeform.isCoreMind,
        label: lifeform.name,
        data: lifeform,
      })),
    ];
    
    // Create connections
    const links = [
      // Connect core nodes to the central node
      ...nodes
        .filter(node => node.id !== 'core' && node.isCore === true)
        .map(node => ({
          source: 'core',
          target: node.id,
          strength: 3,
          type: 'core-connection',
        })),
      
      // Add existing synaptic connections
      ...allConnections.map(conn => ({
        source: `${conn.sourceType}-${conn.sourceId}`,
        target: `${conn.targetType}-${conn.targetId}`,
        strength: conn.connectionStrength,
        type: conn.symbolicRelation,
      })),
    ];
    
    // If there aren't enough connections yet, add some basic ones for visualization
    if (links.length < 5) {
      // Connect some nodes to each other
      for (let i = 1; i < Math.min(nodes.length, 10); i++) {
        if (nodes[i].id !== 'core') {
          links.push({
            source: 'core',
            target: nodes[i].id,
            strength: Math.floor(Math.random() * 3) + 1,
            type: 'emerging',
          });
        }
      }
    }
    
    return { nodes, links };
  }
  
  // Lifeform methods
  async createLifeform(insertLifeform: InsertLifeform): Promise<Lifeform> {
    const now = new Date();
    const [lifeform] = await db
      .insert(lifeforms)
      .values({ 
        ...insertLifeform, 
        generation: 0,
        resonanceCount: 0, 
        isCoreMind: false,
        lastUpdated: now 
      })
      .returning();
    return lifeform;
  }

  async getAllLifeforms(): Promise<Lifeform[]> {
    return db.select().from(lifeforms).orderBy(desc(lifeforms.createdAt));
  }

  async getLifeformById(id: number): Promise<Lifeform | undefined> {
    const [lifeform] = await db.select().from(lifeforms).where(eq(lifeforms.id, id));
    return lifeform || undefined;
  }

  async getLifeformsByType(type: string): Promise<Lifeform[]> {
    return db
      .select()
      .from(lifeforms)
      .where(eq(lifeforms.type, type))
      .orderBy(desc(lifeforms.createdAt));
  }

  async updateLifeformState(id: number, newState: any): Promise<Lifeform> {
    // Get current lifeform and state
    const lifeform = await this.getLifeformById(id);
    if (!lifeform) {
      throw new Error(`Lifeform with id ${id} not found`);
    }
    
    const previousState = lifeform.state;
    const now = new Date();
    
    // Update the lifeform
    const [updatedLifeform] = await db
      .update(lifeforms)
      .set({ 
        state: newState, 
        lastUpdated: now 
      })
      .where(eq(lifeforms.id, id))
      .returning();
    
    // Create evolution record
    await this.createLifeformEvolution({
      lifeformId: id,
      previousState,
      newState,
      evolutionType: 'adaptation',
      generation: lifeform.generation,
    });
    
    return updatedLifeform;
  }

  async incrementLifeformGeneration(id: number): Promise<Lifeform> {
    const now = new Date();
    
    const [lifeform] = await db
      .update(lifeforms)
      .set({ 
        generation: sql`${lifeforms.generation} + 1`,
        lastUpdated: now 
      })
      .where(eq(lifeforms.id, id))
      .returning();
    
    if (!lifeform) {
      throw new Error(`Lifeform with id ${id} not found`);
    }
    
    return lifeform;
  }

  async incrementLifeformResonance(id: number): Promise<void> {
    await db
      .update(lifeforms)
      .set({ 
        resonanceCount: sql`${lifeforms.resonanceCount} + 1` 
      })
      .where(eq(lifeforms.id, id));
    
    // Check if we need to mark as core mind
    const [lifeform] = await db.select().from(lifeforms).where(eq(lifeforms.id, id));
    
    if (lifeform && lifeform.resonanceCount >= 10 && !lifeform.isCoreMind) {
      await db
        .update(lifeforms)
        .set({ isCoreMind: true })
        .where(eq(lifeforms.id, id));
    }
  }

  async getTopResonantLifeforms(limit: number): Promise<Lifeform[]> {
    return db
      .select()
      .from(lifeforms)
      .orderBy(desc(lifeforms.resonanceCount))
      .limit(limit);
  }
  
  // Lifeform evolution methods
  async createLifeformEvolution(insertEvolution: InsertLifeformEvolution): Promise<LifeformEvolution> {
    const [evolution] = await db
      .insert(lifeformEvolutions)
      .values(insertEvolution)
      .returning();
    return evolution;
  }

  async getLifeformEvolutionsByLifeformId(lifeformId: number): Promise<LifeformEvolution[]> {
    return db
      .select()
      .from(lifeformEvolutions)
      .where(eq(lifeformEvolutions.lifeformId, lifeformId))
      .orderBy(desc(lifeformEvolutions.createdAt));
  }

  async getRecentLifeformEvolutions(limit: number): Promise<LifeformEvolution[]> {
    return db
      .select()
      .from(lifeformEvolutions)
      .orderBy(desc(lifeformEvolutions.createdAt))
      .limit(limit);
  }
}

// // For development, use MemStorage
// export const storage = new MemStorage();

// For production, use DatabaseStorage
export const storage = new DatabaseStorage();
