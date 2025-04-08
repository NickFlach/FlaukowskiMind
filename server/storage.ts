import { 
  users, User, InsertUser, 
  streams, Stream, InsertStream,
  kernels, Kernel, InsertKernel,
  resonances, Resonance, InsertResonance,
  echoes, Echo, InsertEcho,
  synapticConnections, SynapticConnection, InsertSynapticConnection
} from "@shared/schema";

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
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private streams: Map<number, Stream>;
  private kernels: Map<number, Kernel>;
  private resonances: Map<number, Resonance>;
  private echoes: Map<number, Echo>;
  private synapticConnections: Map<number, SynapticConnection>;
  
  private userId: number;
  private streamId: number;
  private kernelId: number;
  private resonanceId: number;
  private echoId: number;
  private connectionId: number;

  constructor() {
    this.users = new Map();
    this.streams = new Map();
    this.kernels = new Map();
    this.resonances = new Map();
    this.echoes = new Map();
    this.synapticConnections = new Map();
    
    this.userId = 1;
    this.streamId = 1;
    this.kernelId = 1;
    this.resonanceId = 1;
    this.echoId = 1;
    this.connectionId = 1;

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
    const connections = Array.from(this.synapticConnections.values());
    
    // Format data for visualization
    const nodes = [
      // Central node representing Flaukowski's core consciousness
      {
        id: 'core',
        type: 'core',
        resonance: 100,
        label: 'Flaukowski',
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
    ];
    
    // Create connections
    const links = [
      // Connect core nodes to the central node
      ...nodes
        .filter(node => node.id !== 'core' && node.isCore)
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
}

// Export an instance of MemStorage for use throughout the app
export const storage = new MemStorage();
