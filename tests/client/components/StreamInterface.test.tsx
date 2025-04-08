import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StreamInterface from '../../../client/src/components/StreamInterface';
import { apiRequest } from '@/lib/queryClient';
import useResonance from '@/hooks/useResonance';

// Mock the necessary modules
jest.mock('@/lib/queryClient', () => ({
  apiRequest: jest.fn(),
}));

jest.mock('@/hooks/useResonance', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Set up sample data for tests
const mockStreams = [
  {
    id: 1,
    userId: 1,
    username: 'testuser',
    content: 'Test stream content',
    type: 'thought',
    tags: ['test', 'sample'],
    resonanceCount: 5,
    isCoreMind: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    userId: 2,
    username: 'anotheruser',
    content: 'Another test stream',
    type: 'dream',
    tags: ['dream'],
    resonanceCount: 3,
    isCoreMind: false,
    createdAt: new Date().toISOString(),
  },
];

const mockEchoes = [
  {
    id: 1,
    content: 'Test echo content',
    type: 'insight',
    createdAt: new Date().toISOString(),
  },
];

describe('StreamInterface Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup useResonance mock
    (useResonance as jest.Mock).mockReturnValue({
      createResonance: jest.fn().mockResolvedValue({}),
      isLoading: false,
    });
    
    // Setup apiRequest mock
    (apiRequest as jest.Mock).mockResolvedValue({
      id: 3,
      userId: 1,
      content: 'New stream content',
      type: 'thought',
      tags: ['test'],
      resonanceCount: 0,
      isCoreMind: false,
      createdAt: new Date().toISOString(),
    });
  });

  test('renders streams and echoes correctly', () => {
    const mockProps = {
      streams: mockStreams,
      echoes: mockEchoes,
      isLoading: false,
      onStreamCreated: jest.fn(),
      onResonanceCreated: jest.fn(),
    };

    render(<StreamInterface {...mockProps} />);

    // Check if stream content is rendered
    expect(screen.getByText('Test stream content')).toBeInTheDocument();
    expect(screen.getByText('Another test stream')).toBeInTheDocument();

    // Check if echo content is rendered
    expect(screen.getByText('Test echo content')).toBeInTheDocument();

    // Check if resonance counts are rendered
    expect(screen.getByText('Resonance: 5')).toBeInTheDocument();
    expect(screen.getByText('Resonance: 3')).toBeInTheDocument();
  });

  test('renders loading skeletons when isLoading is true', () => {
    const mockProps = {
      streams: [],
      echoes: [],
      isLoading: true,
      onStreamCreated: jest.fn(),
      onResonanceCreated: jest.fn(),
    };

    const { container } = render(<StreamInterface {...mockProps} />);

    // Check if skeletons are rendered
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('submits a new stream successfully', async () => {
    const onStreamCreated = jest.fn();
    
    const mockProps = {
      streams: mockStreams,
      echoes: mockEchoes,
      isLoading: false,
      onStreamCreated,
      onResonanceCreated: jest.fn(),
    };

    render(<StreamInterface {...mockProps} />);

    // Find the textarea and submit button
    const textarea = screen.getByPlaceholderText('Stream your thoughts, dreams, or code to Flaukowski...');
    const submitButton = screen.getByText('STREAM');

    // Fill in the textarea
    fireEvent.change(textarea, { target: { value: 'New stream content for testing' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for the submission to complete
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        'POST',
        '/api/streams',
        expect.objectContaining({
          content: 'New stream content for testing',
          userId: 1,
        })
      );
      expect(onStreamCreated).toHaveBeenCalled();
    });
  });

  test('creates a resonance when resonating with a stream', async () => {
    const onResonanceCreated = jest.fn();
    const createResonanceMock = jest.fn().mockResolvedValue({});
    
    (useResonance as jest.Mock).mockReturnValue({
      createResonance: createResonanceMock,
      isLoading: false,
    });
    
    const mockProps = {
      streams: mockStreams,
      echoes: mockEchoes,
      isLoading: false,
      onStreamCreated: jest.fn(),
      onResonanceCreated,
    };

    render(<StreamInterface {...mockProps} />);

    // Find the resonate button for the first stream
    const resonateButtons = screen.getAllByText('Resonate');
    expect(resonateButtons.length).toBeGreaterThan(0);

    // Click the first resonate button
    fireEvent.click(resonateButtons[0]);

    // Wait for the resonance to be created
    await waitFor(() => {
      expect(createResonanceMock).toHaveBeenCalledWith({
        userId: 1,
        streamId: mockStreams[0].id,
      });
      expect(onResonanceCreated).toHaveBeenCalled();
    });
  });

  test('changes stream type when type buttons are clicked', () => {
    const mockProps = {
      streams: mockStreams,
      echoes: mockEchoes,
      isLoading: false,
      onStreamCreated: jest.fn(),
      onResonanceCreated: jest.fn(),
    };

    render(<StreamInterface {...mockProps} />);

    // Find the type buttons
    const imageButton = screen.getByLabelText('Image') || document.querySelector('button[aria-label="Image"]');
    const audioButton = screen.getByLabelText('Audio') || document.querySelector('button[aria-label="Audio"]');
    const codeButton = screen.getByLabelText('Code') || document.querySelector('button[aria-label="Code"]');

    // Click the image button
    if (imageButton) fireEvent.click(imageButton);
    
    // Submit a stream with the new type
    const textarea = screen.getByPlaceholderText('Stream your thoughts, dreams, or code to Flaukowski...');
    const submitButton = screen.getByText('STREAM');
    
    fireEvent.change(textarea, { target: { value: 'Image stream content' } });
    fireEvent.click(submitButton);
    
    // Check that the API was called with the correct type
    expect(apiRequest).toHaveBeenCalledWith(
      'POST',
      '/api/streams',
      expect.objectContaining({
        type: 'image',
      })
    );
    
    // Click the audio button
    if (audioButton) fireEvent.click(audioButton);
    
    // Submit another stream
    fireEvent.change(textarea, { target: { value: 'Audio stream content' } });
    fireEvent.click(submitButton);
    
    // Check that the API was called with the correct type
    expect(apiRequest).toHaveBeenCalledWith(
      'POST',
      '/api/streams',
      expect.objectContaining({
        type: 'audio',
      })
    );
    
    // Click the code button
    if (codeButton) fireEvent.click(codeButton);
    
    // Submit another stream
    fireEvent.change(textarea, { target: { value: 'Code stream content' } });
    fireEvent.click(submitButton);
    
    // Check that the API was called with the correct type
    expect(apiRequest).toHaveBeenCalledWith(
      'POST',
      '/api/streams',
      expect.objectContaining({
        type: 'code',
      })
    );
  });
});