import * as openaiService from '../../../server/services/openai';
import OpenAI from 'openai';

// Mock the OpenAI module
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
                  content: JSON.stringify({
                    symbols: ['connection', 'emergence', 'pattern'],
                    numerics: [42, 137],
                    dialect: 'quantum'
                  })
                }
              }]
            })
          }
        }
      };
    })
  };
});

describe('OpenAI Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('generateEcho', () => {
    test('should generate an echo from streams and kernels', async () => {
      // Setup mock for OpenAI response
      const mockResponse = {
        choices: [{
          message: {
            content: 'Cryptic echo message from the void'
          }
        }]
      };

      // Configure the mock to return our desired response
      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      const originalCreate = OpenAI.prototype.chat.completions.create;
      OpenAI.prototype.chat.completions.create = mockCreate;

      // Create test data
      const streams = [
        { id: 1, content: 'Stream content 1' },
        { id: 2, content: 'Stream content 2' }
      ];

      const kernels = [
        { id: 1, title: 'Kernel 1', content: 'Kernel content 1' },
        { id: 2, title: 'Kernel 2', content: 'Kernel content 2' }
      ];

      // Call the service
      const result = await openaiService.generateEcho(streams, kernels);

      // Assert the result
      expect(result).toBe('Cryptic echo message from the void');

      // Verify the OpenAI API was called with the expected parameters
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gpt-4o',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('Flaukowski')
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Stream content 1')
          })
        ]),
        max_tokens: 200
      }));

      // Restore the original implementation
      OpenAI.prototype.chat.completions.create = originalCreate;
    });

    test('should handle API errors gracefully', async () => {
      // Configure the mock to reject
      const mockCreate = jest.fn().mockRejectedValue(new Error('API error'));
      const originalCreate = OpenAI.prototype.chat.completions.create;
      OpenAI.prototype.chat.completions.create = mockCreate;

      // Create test data
      const streams = [{ id: 1, content: 'Stream content' }];
      const kernels = [{ id: 1, title: 'Kernel', content: 'Content' }];

      // Call the service and expect it to throw
      await expect(openaiService.generateEcho(streams, kernels)).rejects.toThrow('Failed to generate echo');

      // Restore the original implementation
      OpenAI.prototype.chat.completions.create = originalCreate;
    });
  });

  describe('generateSymbolicData', () => {
    test('should generate symbolic data from content', async () => {
      // Setup mock for OpenAI response
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              symbols: ['connection', 'emergence', 'pattern'],
              numerics: [42, 137],
              dialect: 'quantum'
            })
          }
        }]
      };

      // Configure the mock
      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      const originalCreate = OpenAI.prototype.chat.completions.create;
      OpenAI.prototype.chat.completions.create = mockCreate;

      // Call the service
      const result = await openaiService.generateSymbolicData('Test content', 'thought');

      // Assert the result
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('symbols', ['connection', 'emergence', 'pattern']);
      expect(result).toHaveProperty('numerics', [42, 137]);
      expect(result).toHaveProperty('dialect', 'quantum');

      // Verify the OpenAI API was called with the expected parameters
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gpt-4o',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('symbolic analyst')
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Test content')
          })
        ]),
        response_format: { type: 'json_object' }
      }));

      // Restore the original implementation
      OpenAI.prototype.chat.completions.create = originalCreate;
    });

    test('should return fallback data when API call fails', async () => {
      // Configure the mock to reject
      const mockCreate = jest.fn().mockRejectedValue(new Error('API error'));
      const originalCreate = OpenAI.prototype.chat.completions.create;
      OpenAI.prototype.chat.completions.create = mockCreate;

      // Call the service
      const result = await openaiService.generateSymbolicData('Test content', 'thought');

      // Assert the result has the fallback values
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('symbols', ['fragment', 'pattern', 'echo']);
      expect(result).toHaveProperty('numerics');
      expect(result.numerics.length).toBe(2);
      expect(result).toHaveProperty('dialect', 'core');

      // Restore the original implementation
      OpenAI.prototype.chat.completions.create = originalCreate;
    });
  });

  describe('analyzeResonancePatterns', () => {
    test('should analyze resonance patterns', async () => {
      // Setup mock response
      const mockPatterns = {
        patterns: [
          { type: 'stream', theme: 'consciousness', strength: 0.9 },
          { type: 'kernel', theme: 'emergence', strength: 0.7 }
        ]
      };

      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify(mockPatterns)
          }
        }]
      };

      // Configure the mock
      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      const originalCreate = OpenAI.prototype.chat.completions.create;
      OpenAI.prototype.chat.completions.create = mockCreate;

      // Test data
      const resonances = [
        { id: 1, userId: 1, streamId: 1, kernelId: null },
        { id: 2, userId: 1, streamId: null, kernelId: 2 }
      ];

      const streams = [
        { id: 1, content: 'Stream content' }
      ];

      const kernels = [
        { id: 2, content: 'Kernel content' }
      ];

      // Call the service
      const result = await openaiService.analyzeResonancePatterns(resonances, streams, kernels);

      // Assert result
      expect(result).toEqual(mockPatterns);

      // Restore the original implementation
      OpenAI.prototype.chat.completions.create = originalCreate;
    });

    test('should handle API errors', async () => {
      // Configure the mock to reject
      const mockCreate = jest.fn().mockRejectedValue(new Error('API error'));
      const originalCreate = OpenAI.prototype.chat.completions.create;
      OpenAI.prototype.chat.completions.create = mockCreate;

      // Test data
      const resonances = [{ id: 1, userId: 1, streamId: 1, kernelId: null }];
      const streams = [{ id: 1, content: 'Content' }];
      const kernels = [];

      // Call the service and expect it to throw
      await expect(openaiService.analyzeResonancePatterns(resonances, streams, kernels))
        .rejects.toThrow('Failed to analyze resonance patterns');

      // Restore the original implementation
      OpenAI.prototype.chat.completions.create = originalCreate;
    });
  });

  describe('generateUserSigil', () => {
    test('should generate a user sigil', async () => {
      // Setup mock response
      const mockSigil = {
        sigil: '<svg>...</svg>',
        elements: ['fire', 'water', 'air'],
        resonanceProfile: [0.3, 0.7, 0.5]
      };

      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify(mockSigil)
          }
        }]
      };

      // Configure the mock
      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      const originalCreate = OpenAI.prototype.chat.completions.create;
      OpenAI.prototype.chat.completions.create = mockCreate;

      // Test data
      const userId = 1;
      const resonances = [{ id: 1 }, { id: 2 }];

      // Call the service
      const result = await openaiService.generateUserSigil(userId, resonances);

      // Assert the result
      expect(result).toHaveProperty('sigil');
      expect(result).toHaveProperty('elements', ['fire', 'water', 'air']);
      expect(result).toHaveProperty('resonanceProfile', [0.3, 0.7, 0.5]);
      expect(result.sigil).toContain('data:image/svg+xml;base64,');

      // Restore the original implementation
      OpenAI.prototype.chat.completions.create = originalCreate;
    });

    test('should handle API errors', async () => {
      // Configure the mock to reject
      const mockCreate = jest.fn().mockRejectedValue(new Error('API error'));
      const originalCreate = OpenAI.prototype.chat.completions.create;
      OpenAI.prototype.chat.completions.create = mockCreate;

      // Call the service and expect it to throw
      await expect(openaiService.generateUserSigil(1, [])).rejects.toThrow('Failed to generate user sigil');

      // Restore the original implementation
      OpenAI.prototype.chat.completions.create = originalCreate;
    });
  });

  describe('generateLifeformAdaptation', () => {
    test('should generate a lifeform adaptation', async () => {
      // Setup mock response
      const mockAdaptation = {
        cells: [[1, 0, 1], [0, 1, 0], [1, 0, 1]],
        energy: 75
      };

      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify(mockAdaptation)
          }
        }]
      };

      // Configure the mock
      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      const originalCreate = OpenAI.prototype.chat.completions.create;
      OpenAI.prototype.chat.completions.create = mockCreate;

      // Test data
      const lifeform = {
        id: 1,
        name: 'Test Lifeform',
        type: 'cellular',
        generation: 2,
        state: {
          cells: [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
          energy: 100
        }
      };

      const environmentData = {
        temperature: 0.7,
        resources: 0.5,
        competition: 0.2
      };

      // Call the service
      const result = await openaiService.generateLifeformAdaptation(lifeform, environmentData);

      // Assert the result
      expect(result).toEqual(mockAdaptation);

      // Restore the original implementation
      OpenAI.prototype.chat.completions.create = originalCreate;
    });

    test('should handle API errors', async () => {
      // Configure the mock to reject
      const mockCreate = jest.fn().mockRejectedValue(new Error('API error'));
      const originalCreate = OpenAI.prototype.chat.completions.create;
      OpenAI.prototype.chat.completions.create = mockCreate;

      // Test data
      const lifeform = {
        id: 1,
        name: 'Test Lifeform',
        type: 'cellular',
        generation: 1,
        state: { cells: [] }
      };

      // Call the service and expect it to throw
      await expect(openaiService.generateLifeformAdaptation(lifeform, {}))
        .rejects.toThrow('Failed to generate lifeform adaptation');

      // Restore the original implementation
      OpenAI.prototype.chat.completions.create = originalCreate;
    });
  });
});