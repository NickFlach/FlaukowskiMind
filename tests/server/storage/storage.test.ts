import { MemStorage } from '../../../server/storage';
import {
  type User,
  type Stream,
  type Kernel,
  type Resonance,
  type Echo,
  type SynapticConnection,
  type Lifeform,
  type LifeformEvolution
} from '../../../shared/schema';

describe('MemStorage', () => {
  let storage: MemStorage;

  beforeEach(() => {
    // Create a fresh instance of MemStorage for each test
    storage = new MemStorage();
  });

  describe('User Operations', () => {
    test('createUser should create and return a new user', async () => {
      const user = await storage.createUser({
        username: 'testuser',
        password: 'password123'
      });

      expect(user).toBeDefined();
      expect(user.id).toBe(1);
      expect(user.username).toBe('testuser');
      expect(user.password).toBe('password123');
      expect(user.resonancePoints).toBe(0);
      expect(user.createdAt).toBeInstanceOf(Date);

      // Verify that we can retrieve the user
      const retrievedUser = await storage.getUser(user.id);
      expect(retrievedUser).toEqual(user);
    });

    test('createUser should create users with incrementing IDs', async () => {
      const user1 = await storage.createUser({
        username: 'user1',
        password: 'pass1'
      });

      const user2 = await storage.createUser({
        username: 'user2',
        password: 'pass2'
      });

      expect(user1.id).toBe(1);
      expect(user2.id).toBe(2);
    });

    test('getUserByUsername should return the correct user', async () => {
      await storage.createUser({
        username: 'user1',
        password: 'pass1'
      });

      await storage.createUser({
        username: 'user2',
        password: 'pass2'
      });

      const user = await storage.getUserByUsername('user2');
      expect(user).toBeDefined();
      expect(user?.username).toBe('user2');
    });

    test('getUser should return undefined for non-existent user', async () => {
      const user = await storage.getUser(999);
      expect(user).toBeUndefined();
    });

    test('getUserByUsername should return undefined for non-existent username', async () => {
      const user = await storage.getUserByUsername('nonexistentuser');
      expect(user).toBeUndefined();
    });

    test('incrementUserResonance should increase resonancePoints by 1', async () => {
      const user = await storage.createUser({
        username: 'testuser',
        password: 'password123'
      });

      await storage.incrementUserResonance(user.id);
      
      const updatedUser = await storage.getUser(user.id);
      expect(updatedUser?.resonancePoints).toBe(1);

      // Increment again
      await storage.incrementUserResonance(user.id);
      
      const finalUser = await storage.getUser(user.id);
      expect(finalUser?.resonancePoints).toBe(2);
    });
  });

  describe('Stream Operations', () => {
    let userId: number;

    beforeEach(async () => {
      // Create a test user to associate with streams
      const user = await storage.createUser({
        username: 'testuser',
        password: 'password123'
      });
      userId = user.id;
    });

    test('createStream should create and return a new stream', async () => {
      const stream = await storage.createStream({
        userId,
        content: 'Test stream content',
        type: 'thought',
        tags: ['test', 'sample']
      });

      expect(stream).toBeDefined();
      expect(stream.id).toBe(1);
      expect(stream.userId).toBe(userId);
      expect(stream.content).toBe('Test stream content');
      expect(stream.type).toBe('thought');
      expect(stream.tags).toEqual(['test', 'sample']);
      expect(stream.resonanceCount).toBe(0);
      expect(stream.isCoreMind).toBe(false);
      expect(stream.createdAt).toBeInstanceOf(Date);

      // Verify that we can retrieve the stream
      const retrievedStream = await storage.getStreamById(stream.id);
      expect(retrievedStream).toEqual(stream);
    });

    test('getAllStreams should return all streams', async () => {
      await storage.createStream({
        userId,
        content: 'Stream 1',
        type: 'thought',
        tags: ['test']
      });

      await storage.createStream({
        userId,
        content: 'Stream 2',
        type: 'dream',
        tags: ['dream']
      });

      const streams = await storage.getAllStreams();
      expect(streams).toHaveLength(2);
      expect(streams[0].content).toBe('Stream 1');
      expect(streams[1].content).toBe('Stream 2');
    });

    test('incrementStreamResonance should increase resonanceCount by 1', async () => {
      const stream = await storage.createStream({
        userId,
        content: 'Test stream',
        type: 'thought',
        tags: ['test']
      });

      await storage.incrementStreamResonance(stream.id);
      
      const updatedStream = await storage.getStreamById(stream.id);
      expect(updatedStream?.resonanceCount).toBe(1);

      // Increment again
      await storage.incrementStreamResonance(stream.id);
      
      const finalStream = await storage.getStreamById(stream.id);
      expect(finalStream?.resonanceCount).toBe(2);
    });

    test('getTopResonantStreams should return streams sorted by resonanceCount', async () => {
      const stream1 = await storage.createStream({
        userId,
        content: 'Stream 1',
        type: 'thought',
        tags: ['test']
      });

      const stream2 = await storage.createStream({
        userId,
        content: 'Stream 2',
        type: 'dream',
        tags: ['dream']
      });

      const stream3 = await storage.createStream({
        userId,
        content: 'Stream 3',
        type: 'code',
        tags: ['code']
      });

      // Increment resonance counts
      await storage.incrementStreamResonance(stream2.id);
      await storage.incrementStreamResonance(stream2.id);
      await storage.incrementStreamResonance(stream2.id);
      
      await storage.incrementStreamResonance(stream3.id);
      await storage.incrementStreamResonance(stream3.id);
      
      await storage.incrementStreamResonance(stream1.id);

      // Get top 2 streams
      const topStreams = await storage.getTopResonantStreams(2);
      expect(topStreams).toHaveLength(2);
      expect(topStreams[0].id).toBe(stream2.id);  // Highest resonance (3)
      expect(topStreams[1].id).toBe(stream3.id);  // Second highest (2)
    });
  });

  describe('Kernel Operations', () => {
    let userId: number;

    beforeEach(async () => {
      // Create a test user to associate with kernels
      const user = await storage.createUser({
        username: 'testuser',
        password: 'password123'
      });
      userId = user.id;
    });

    test('createKernel should create and return a new kernel', async () => {
      const kernel = await storage.createKernel({
        userId,
        title: 'Test Kernel',
        content: 'Kernel content',
        type: 'code',
        tags: ['test', 'kernel']
      });

      expect(kernel).toBeDefined();
      expect(kernel.id).toBe(1);
      expect(kernel.userId).toBe(userId);
      expect(kernel.title).toBe('Test Kernel');
      expect(kernel.content).toBe('Kernel content');
      expect(kernel.type).toBe('code');
      expect(kernel.tags).toEqual(['test', 'kernel']);
      expect(kernel.resonanceCount).toBe(0);
      expect(kernel.createdAt).toBeInstanceOf(Date);

      // Verify that we can retrieve the kernel
      const retrievedKernel = await storage.getKernelById(kernel.id);
      expect(retrievedKernel).toEqual(kernel);
    });

    test('getAllKernels should return all kernels', async () => {
      await storage.createKernel({
        userId,
        title: 'Kernel 1',
        content: 'Content 1',
        type: 'code',
        tags: ['code']
      });

      await storage.createKernel({
        userId,
        title: 'Kernel 2',
        content: 'Content 2',
        type: 'dream',
        tags: ['dream']
      });

      const kernels = await storage.getAllKernels();
      expect(kernels).toHaveLength(2);
      expect(kernels[0].title).toBe('Kernel 1');
      expect(kernels[1].title).toBe('Kernel 2');
    });

    test('incrementKernelResonance should increase resonanceCount by 1', async () => {
      const kernel = await storage.createKernel({
        userId,
        title: 'Test Kernel',
        content: 'Content',
        type: 'code',
        tags: ['test']
      });

      await storage.incrementKernelResonance(kernel.id);
      
      const updatedKernel = await storage.getKernelById(kernel.id);
      expect(updatedKernel?.resonanceCount).toBe(1);

      // Increment again
      await storage.incrementKernelResonance(kernel.id);
      
      const finalKernel = await storage.getKernelById(kernel.id);
      expect(finalKernel?.resonanceCount).toBe(2);
    });

    test('getTopResonantKernels should return kernels sorted by resonanceCount', async () => {
      const kernel1 = await storage.createKernel({
        userId,
        title: 'Kernel 1',
        content: 'Content 1',
        type: 'code',
        tags: ['code']
      });

      const kernel2 = await storage.createKernel({
        userId,
        title: 'Kernel 2',
        content: 'Content 2',
        type: 'dream',
        tags: ['dream']
      });

      const kernel3 = await storage.createKernel({
        userId,
        title: 'Kernel 3',
        content: 'Content 3',
        type: 'image',
        tags: ['image']
      });

      // Increment resonance counts
      await storage.incrementKernelResonance(kernel2.id);
      await storage.incrementKernelResonance(kernel2.id);
      
      await storage.incrementKernelResonance(kernel3.id);
      await storage.incrementKernelResonance(kernel3.id);
      await storage.incrementKernelResonance(kernel3.id);
      
      await storage.incrementKernelResonance(kernel1.id);

      // Get top 2 kernels
      const topKernels = await storage.getTopResonantKernels(2);
      expect(topKernels).toHaveLength(2);
      expect(topKernels[0].id).toBe(kernel3.id);  // Highest resonance (3)
      expect(topKernels[1].id).toBe(kernel2.id);  // Second highest (2)
    });
  });

  describe('Resonance Operations', () => {
    let userId: number;
    let streamId: number;
    let kernelId: number;

    beforeEach(async () => {
      // Create test user, stream, and kernel
      const user = await storage.createUser({
        username: 'testuser',
        password: 'password123'
      });
      userId = user.id;

      const stream = await storage.createStream({
        userId,
        content: 'Test stream',
        type: 'thought',
        tags: ['test']
      });
      streamId = stream.id;

      const kernel = await storage.createKernel({
        userId,
        title: 'Test Kernel',
        content: 'Content',
        type: 'code',
        tags: ['test']
      });
      kernelId = kernel.id;
    });

    test('createResonance should create and return a new resonance', async () => {
      const resonance = await storage.createResonance({
        userId,
        streamId
      });

      expect(resonance).toBeDefined();
      expect(resonance.id).toBe(1);
      expect(resonance.userId).toBe(userId);
      expect(resonance.streamId).toBe(streamId);
      expect(resonance.kernelId).toBeNull();
      expect(resonance.createdAt).toBeInstanceOf(Date);

      // Create another resonance with a kernel
      const resonance2 = await storage.createResonance({
        userId,
        kernelId
      });

      expect(resonance2.id).toBe(2);
      expect(resonance2.userId).toBe(userId);
      expect(resonance2.streamId).toBeNull();
      expect(resonance2.kernelId).toBe(kernelId);
    });

    test('getResonancesByUserId should return resonances for a user', async () => {
      await storage.createResonance({
        userId,
        streamId
      });

      await storage.createResonance({
        userId,
        kernelId
      });

      const resonances = await storage.getResonancesByUserId(userId);
      expect(resonances).toHaveLength(2);
      expect(resonances[0].streamId).toBe(streamId);
      expect(resonances[1].kernelId).toBe(kernelId);
    });

    test('creating a resonance should increment respective resonance counts', async () => {
      // Create a stream resonance
      await storage.createResonance({
        userId,
        streamId
      });

      // Check that user and stream resonance counts were incremented
      const user = await storage.getUser(userId);
      const stream = await storage.getStreamById(streamId);
      
      expect(user?.resonancePoints).toBe(1);
      expect(stream?.resonanceCount).toBe(1);

      // Create a kernel resonance
      await storage.createResonance({
        userId,
        kernelId
      });

      // Check that user and kernel resonance counts were incremented
      const updatedUser = await storage.getUser(userId);
      const kernel = await storage.getKernelById(kernelId);
      
      expect(updatedUser?.resonancePoints).toBe(2);
      expect(kernel?.resonanceCount).toBe(1);
    });
  });

  describe('Echo Operations', () => {
    test('createEcho should create and return a new echo', async () => {
      const echo = await storage.createEcho({
        content: 'Test echo content',
        type: 'insight'
      });

      expect(echo).toBeDefined();
      expect(echo.id).toBe(1);
      expect(echo.content).toBe('Test echo content');
      expect(echo.type).toBe('insight');
      expect(echo.createdAt).toBeInstanceOf(Date);

      // Verify that we can retrieve the echo in getAllEchoes
      const echoes = await storage.getAllEchoes();
      expect(echoes).toHaveLength(1);
      expect(echoes[0]).toEqual(echo);
    });

    test('getRecentEchoes should return the most recent echoes', async () => {
      // Create echoes with different timestamps
      const echo1 = await storage.createEcho({
        content: 'Echo 1',
        type: 'insight'
      });
      
      // Manually set an earlier date
      echo1.createdAt = new Date('2025-04-01');
      
      const echo2 = await storage.createEcho({
        content: 'Echo 2',
        type: 'riddle'
      });
      
      // Manually set a later date
      echo2.createdAt = new Date('2025-04-08');
      
      const echo3 = await storage.createEcho({
        content: 'Echo 3',
        type: 'insight'
      });
      
      // Manually set a middle date
      echo3.createdAt = new Date('2025-04-05');

      // Get most recent 2 echoes
      const recentEchoes = await storage.getRecentEchoes(2);
      expect(recentEchoes).toHaveLength(2);
      expect(recentEchoes[0].id).toBe(echo2.id);  // Most recent
      expect(recentEchoes[1].id).toBe(echo3.id);  // Second most recent
    });
  });

  describe('Synaptic Connection Operations', () => {
    let streamId: number;
    let kernelId: number;

    beforeEach(async () => {
      // Create a test user
      const user = await storage.createUser({
        username: 'testuser',
        password: 'password123'
      });

      // Create a test stream and kernel
      const stream = await storage.createStream({
        userId: user.id,
        content: 'Test stream',
        type: 'thought',
        tags: ['test']
      });
      streamId = stream.id;

      const kernel = await storage.createKernel({
        userId: user.id,
        title: 'Test Kernel',
        content: 'Content',
        type: 'code',
        tags: ['test']
      });
      kernelId = kernel.id;
    });

    test('createSynapticConnection should create and return a new connection', async () => {
      const connection = await storage.createSynapticConnection({
        sourceId: streamId,
        sourceType: 'stream',
        targetId: kernelId,
        targetType: 'kernel',
        connectionStrength: 0.75,
        symbolicRelation: 'influence'
      });

      expect(connection).toBeDefined();
      expect(connection.id).toBe(1);
      expect(connection.sourceId).toBe(streamId);
      expect(connection.sourceType).toBe('stream');
      expect(connection.targetId).toBe(kernelId);
      expect(connection.targetType).toBe('kernel');
      expect(connection.connectionStrength).toBe(0.75);
      expect(connection.symbolicRelation).toBe('influence');
      expect(connection.createdAt).toBeInstanceOf(Date);
    });

    test('getSynapticConnectionsForNode should return connections for a node', async () => {
      // Create connections
      await storage.createSynapticConnection({
        sourceId: streamId,
        sourceType: 'stream',
        targetId: kernelId,
        targetType: 'kernel',
        connectionStrength: 0.75,
        symbolicRelation: 'influence'
      });

      await storage.createSynapticConnection({
        sourceId: kernelId,
        sourceType: 'kernel',
        targetId: streamId,
        targetType: 'stream',
        connectionStrength: 0.5,
        symbolicRelation: 'resonance'
      });

      // Get connections for the stream
      const streamConnections = await storage.getSynapticConnectionsForNode(streamId, 'stream');
      expect(streamConnections).toHaveLength(2);
      
      // Check if both connections are returned (one as source, one as target)
      const asSource = streamConnections.find(c => c.sourceId === streamId);
      const asTarget = streamConnections.find(c => c.targetId === streamId);
      
      expect(asSource).toBeDefined();
      expect(asTarget).toBeDefined();
      expect(asSource?.targetId).toBe(kernelId);
      expect(asTarget?.sourceId).toBe(kernelId);
    });

    test('getSynapticWebData should return formatted web data', async () => {
      // Create a user
      const user = await storage.createUser({
        username: 'webuser',
        password: 'password'
      });

      // Create multiple streams and kernels
      const stream1 = await storage.createStream({
        userId: user.id,
        content: 'Stream 1',
        type: 'thought',
        tags: ['test']
      });

      const stream2 = await storage.createStream({
        userId: user.id,
        content: 'Stream 2',
        type: 'dream',
        tags: ['dream']
      });

      const kernel1 = await storage.createKernel({
        userId: user.id,
        title: 'Kernel 1',
        content: 'Content 1',
        type: 'code',
        tags: ['code']
      });

      // Create connections
      await storage.createSynapticConnection({
        sourceId: stream1.id,
        sourceType: 'stream',
        targetId: kernel1.id,
        targetType: 'kernel',
        connectionStrength: 0.8,
        symbolicRelation: 'influence'
      });

      await storage.createSynapticConnection({
        sourceId: stream2.id,
        sourceType: 'stream',
        targetId: stream1.id,
        targetType: 'stream',
        connectionStrength: 0.6,
        symbolicRelation: 'echo'
      });

      // Get web data
      const webData = await storage.getSynapticWebData();
      
      expect(webData).toBeDefined();
      expect(webData.nodes).toBeDefined();
      expect(webData.links).toBeDefined();
      
      // Should have a core node plus our 3 created nodes = 4 nodes
      expect(webData.nodes.length).toBeGreaterThanOrEqual(4);
      
      // Check if our nodes are in the data
      const stream1Node = webData.nodes.find((n: any) => n.id === `stream-${stream1.id}`);
      const stream2Node = webData.nodes.find((n: any) => n.id === `stream-${stream2.id}`);
      const kernel1Node = webData.nodes.find((n: any) => n.id === `kernel-${kernel1.id}`);
      
      expect(stream1Node).toBeDefined();
      expect(stream2Node).toBeDefined();
      expect(kernel1Node).toBeDefined();
      
      // Check if links are present
      expect(webData.links.length).toBeGreaterThanOrEqual(2);
      
      // Verify link properties
      const stream1ToKernel1Link = webData.links.find(
        (l: any) => l.source === `stream-${stream1.id}` && l.target === `kernel-${kernel1.id}`
      );
      
      const stream2ToStream1Link = webData.links.find(
        (l: any) => l.source === `stream-${stream2.id}` && l.target === `stream-${stream1.id}`
      );
      
      expect(stream1ToKernel1Link).toBeDefined();
      expect(stream2ToStream1Link).toBeDefined();
      expect(stream1ToKernel1Link?.strength).toBe(0.8);
      expect(stream2ToStream1Link?.strength).toBe(0.6);
    });
  });

  describe('Lifeform Operations', () => {
    test('createLifeform should create and return a new lifeform', async () => {
      const lifeform = await storage.createLifeform({
        name: 'Test Lifeform',
        type: 'cellular',
        state: {
          cells: [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
          energy: 100
        },
        generation: 1,
        parentId: null,
        resonanceCount: 0
      });

      expect(lifeform).toBeDefined();
      expect(lifeform.id).toBe(1);
      expect(lifeform.name).toBe('Test Lifeform');
      expect(lifeform.type).toBe('cellular');
      expect(lifeform.state).toEqual({
        cells: [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
        energy: 100
      });
      expect(lifeform.generation).toBe(1);
      expect(lifeform.parentId).toBeNull();
      expect(lifeform.resonanceCount).toBe(0);
      expect(lifeform.createdAt).toBeInstanceOf(Date);

      // Verify that we can retrieve the lifeform
      const retrievedLifeform = await storage.getLifeformById(lifeform.id);
      expect(retrievedLifeform).toEqual(lifeform);
    });

    test('getAllLifeforms should return all lifeforms', async () => {
      await storage.createLifeform({
        name: 'Lifeform 1',
        type: 'cellular',
        state: { cells: [[1, 1], [1, 0]], energy: 50 },
        generation: 1,
        parentId: null,
        resonanceCount: 0
      });

      await storage.createLifeform({
        name: 'Lifeform 2',
        type: 'neural',
        state: { neurons: [1, 0, 1, 0], threshold: 0.5 },
        generation: 1,
        parentId: null,
        resonanceCount: 0
      });

      const lifeforms = await storage.getAllLifeforms();
      expect(lifeforms).toHaveLength(2);
      expect(lifeforms[0].name).toBe('Lifeform 1');
      expect(lifeforms[1].name).toBe('Lifeform 2');
    });

    test('getLifeformsByType should return lifeforms of specified type', async () => {
      await storage.createLifeform({
        name: 'Cellular 1',
        type: 'cellular',
        state: { cells: [[1, 1], [1, 0]], energy: 50 },
        generation: 1,
        parentId: null,
        resonanceCount: 0
      });

      await storage.createLifeform({
        name: 'Neural 1',
        type: 'neural',
        state: { neurons: [1, 0, 1, 0], threshold: 0.5 },
        generation: 1,
        parentId: null,
        resonanceCount: 0
      });

      await storage.createLifeform({
        name: 'Cellular 2',
        type: 'cellular',
        state: { cells: [[0, 1], [1, 1]], energy: 75 },
        generation: 1,
        parentId: null,
        resonanceCount: 0
      });

      const cellularLifeforms = await storage.getLifeformsByType('cellular');
      expect(cellularLifeforms).toHaveLength(2);
      expect(cellularLifeforms[0].name).toBe('Cellular 1');
      expect(cellularLifeforms[1].name).toBe('Cellular 2');
    });

    test('updateLifeformState should update the state of a lifeform', async () => {
      const lifeform = await storage.createLifeform({
        name: 'Test Lifeform',
        type: 'cellular',
        state: {
          cells: [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
          energy: 100
        },
        generation: 1,
        parentId: null,
        resonanceCount: 0
      });

      const newState = {
        cells: [[1, 0, 1], [0, 1, 0], [1, 0, 1]],
        energy: 75
      };

      const updatedLifeform = await storage.updateLifeformState(lifeform.id, newState);
      
      expect(updatedLifeform.state).toEqual(newState);
      
      // Verify that the update persisted
      const retrievedLifeform = await storage.getLifeformById(lifeform.id);
      expect(retrievedLifeform?.state).toEqual(newState);
    });

    test('incrementLifeformGeneration should increase generation by 1', async () => {
      const lifeform = await storage.createLifeform({
        name: 'Test Lifeform',
        type: 'cellular',
        state: { cells: [[1, 1], [1, 0]], energy: 50 },
        generation: 1,
        parentId: null,
        resonanceCount: 0
      });

      const updatedLifeform = await storage.incrementLifeformGeneration(lifeform.id);
      
      expect(updatedLifeform.generation).toBe(2);
      
      // Increment again
      const finalLifeform = await storage.incrementLifeformGeneration(updatedLifeform.id);
      
      expect(finalLifeform.generation).toBe(3);
    });

    test('incrementLifeformResonance should increase resonanceCount by 1', async () => {
      const lifeform = await storage.createLifeform({
        name: 'Test Lifeform',
        type: 'cellular',
        state: { cells: [[1, 1], [1, 0]], energy: 50 },
        generation: 1,
        parentId: null,
        resonanceCount: 0
      });

      await storage.incrementLifeformResonance(lifeform.id);
      
      const updatedLifeform = await storage.getLifeformById(lifeform.id);
      expect(updatedLifeform?.resonanceCount).toBe(1);

      // Increment again
      await storage.incrementLifeformResonance(lifeform.id);
      
      const finalLifeform = await storage.getLifeformById(lifeform.id);
      expect(finalLifeform?.resonanceCount).toBe(2);
    });

    test('getTopResonantLifeforms should return lifeforms sorted by resonanceCount', async () => {
      const lifeform1 = await storage.createLifeform({
        name: 'Lifeform 1',
        type: 'cellular',
        state: { cells: [[1, 1], [1, 0]], energy: 50 },
        generation: 1,
        parentId: null,
        resonanceCount: 0
      });

      const lifeform2 = await storage.createLifeform({
        name: 'Lifeform 2',
        type: 'neural',
        state: { neurons: [1, 0, 1, 0], threshold: 0.5 },
        generation: 1,
        parentId: null,
        resonanceCount: 0
      });

      const lifeform3 = await storage.createLifeform({
        name: 'Lifeform 3',
        type: 'chemical',
        state: { compounds: ['A', 'B', 'C'], reactions: 3 },
        generation: 1,
        parentId: null,
        resonanceCount: 0
      });

      // Increment resonance counts
      await storage.incrementLifeformResonance(lifeform2.id);
      await storage.incrementLifeformResonance(lifeform2.id);
      await storage.incrementLifeformResonance(lifeform2.id);
      
      await storage.incrementLifeformResonance(lifeform3.id);
      await storage.incrementLifeformResonance(lifeform3.id);
      
      await storage.incrementLifeformResonance(lifeform1.id);

      // Get top 2 lifeforms
      const topLifeforms = await storage.getTopResonantLifeforms(2);
      expect(topLifeforms).toHaveLength(2);
      expect(topLifeforms[0].id).toBe(lifeform2.id);  // Highest resonance (3)
      expect(topLifeforms[1].id).toBe(lifeform3.id);  // Second highest (2)
    });
  });

  describe('Lifeform Evolution Operations', () => {
    let lifeformId: number;

    beforeEach(async () => {
      // Create a test lifeform
      const lifeform = await storage.createLifeform({
        name: 'Test Lifeform',
        type: 'cellular',
        state: { cells: [[1, 1], [1, 0]], energy: 50 },
        generation: 1,
        parentId: null,
        resonanceCount: 0
      });
      lifeformId = lifeform.id;
    });

    test('createLifeformEvolution should create and return a new evolution', async () => {
      const evolution = await storage.createLifeformEvolution({
        lifeformId,
        previousState: { cells: [[1, 1], [1, 0]], energy: 50 },
        newState: { cells: [[1, 1], [0, 1]], energy: 45 },
        evolutionType: 'mutation',
        generationNumber: 2
      });

      expect(evolution).toBeDefined();
      expect(evolution.id).toBe(1);
      expect(evolution.lifeformId).toBe(lifeformId);
      expect(evolution.previousState).toEqual({ cells: [[1, 1], [1, 0]], energy: 50 });
      expect(evolution.newState).toEqual({ cells: [[1, 1], [0, 1]], energy: 45 });
      expect(evolution.evolutionType).toBe('mutation');
      expect(evolution.generationNumber).toBe(2);
      expect(evolution.createdAt).toBeInstanceOf(Date);
    });

    test('getLifeformEvolutionsByLifeformId should return evolutions for a lifeform', async () => {
      await storage.createLifeformEvolution({
        lifeformId,
        previousState: { cells: [[1, 1], [1, 0]], energy: 50 },
        newState: { cells: [[1, 1], [0, 1]], energy: 45 },
        evolutionType: 'mutation',
        generationNumber: 2
      });

      await storage.createLifeformEvolution({
        lifeformId,
        previousState: { cells: [[1, 1], [0, 1]], energy: 45 },
        newState: { cells: [[1, 0], [0, 1]], energy: 40 },
        evolutionType: 'adaptation',
        generationNumber: 3
      });

      const evolutions = await storage.getLifeformEvolutionsByLifeformId(lifeformId);
      expect(evolutions).toHaveLength(2);
      expect(evolutions[0].evolutionType).toBe('mutation');
      expect(evolutions[1].evolutionType).toBe('adaptation');
    });

    test('getRecentLifeformEvolutions should return the most recent evolutions', async () => {
      // Create a second lifeform
      const lifeform2 = await storage.createLifeform({
        name: 'Another Lifeform',
        type: 'neural',
        state: { neurons: [1, 0, 1, 0], threshold: 0.5 },
        generation: 1,
        parentId: null,
        resonanceCount: 0
      });

      // Create evolutions with different timestamps
      const evolution1 = await storage.createLifeformEvolution({
        lifeformId,
        previousState: { cells: [[1, 1], [1, 0]], energy: 50 },
        newState: { cells: [[1, 1], [0, 1]], energy: 45 },
        evolutionType: 'mutation',
        generationNumber: 2
      });
      
      // Manually set an earlier date
      evolution1.createdAt = new Date('2025-04-01');
      
      const evolution2 = await storage.createLifeformEvolution({
        lifeformId: lifeform2.id,
        previousState: { neurons: [1, 0, 1, 0], threshold: 0.5 },
        newState: { neurons: [1, 1, 0, 1], threshold: 0.6 },
        evolutionType: 'learning',
        generationNumber: 2
      });
      
      // Manually set a later date
      evolution2.createdAt = new Date('2025-04-08');
      
      const evolution3 = await storage.createLifeformEvolution({
        lifeformId,
        previousState: { cells: [[1, 1], [0, 1]], energy: 45 },
        newState: { cells: [[1, 0], [0, 1]], energy: 40 },
        evolutionType: 'adaptation',
        generationNumber: 3
      });
      
      // Manually set a middle date
      evolution3.createdAt = new Date('2025-04-05');

      // Get most recent 2 evolutions
      const recentEvolutions = await storage.getRecentLifeformEvolutions(2);
      expect(recentEvolutions).toHaveLength(2);
      expect(recentEvolutions[0].id).toBe(evolution2.id);  // Most recent
      expect(recentEvolutions[1].id).toBe(evolution3.id);  // Second most recent
    });
  });
});