import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioRecorder from '../AudioRecorder';

// Mock RecordRTC
jest.mock('recordrtc', () => ({
  StereoAudioRecorder: 'StereoAudioRecorder'
}));

// Mock navigator.mediaDevices.getUserMedia
const mockGetUserMedia = jest.fn();
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia
  },
  writable: true
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Mock setInterval and clearInterval
global.setInterval = jest.fn();
global.clearInterval = jest.fn();

// Mock window.alert
global.alert = jest.fn();

describe('AudioRecorder Component', () => {
  const mockOnAudioReady = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));
  });

  test('renders with initial state', () => {
    render(<AudioRecorder onAudioReady={mockOnAudioReady} />);

    expect(screen.getByText('Record Your Presentation')).toBeInTheDocument();
    expect(screen.getByText('0:00')).toBeInTheDocument();
    expect(screen.getByText('Speak for at least 3 minutes for best results')).toBeInTheDocument();
    expect(screen.getByText('Start Recording')).toBeInTheDocument();
  });

  test('shows loading state when initializing recording', () => {
    render(<AudioRecorder onAudioReady={mockOnAudioReady} />);

    const startButton = screen.getByText('Start Recording');
    fireEvent.click(startButton);

    // Should show loading state
    expect(screen.getByText('Initializing...')).toBeInTheDocument();
    expect(startButton).toBeDisabled();
  });

  test('handles microphone access error gracefully', async () => {
    render(<AudioRecorder onAudioReady={mockOnAudioReady} />);

    const startButton = screen.getByText('Start Recording');
    
    await act(async () => {
      fireEvent.click(startButton);
    });

    // Should show error message
    expect(global.alert).toHaveBeenCalledWith('Could not access microphone. Please check permissions and try again.');
  });

  test('formats time correctly', () => {
    render(<AudioRecorder onAudioReady={mockOnAudioReady} />);

    // The component should show 0:00 initially
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  test('button is disabled during loading', () => {
    render(<AudioRecorder onAudioReady={mockOnAudioReady} />);

    const startButton = screen.getByText('Start Recording');
    fireEvent.click(startButton);

    // Button should be disabled and show loading text
    expect(startButton).toBeDisabled();
    expect(screen.getByText('Initializing...')).toBeInTheDocument();
  });

  test('component exports correctly', () => {
    expect(AudioRecorder).toBeDefined();
    expect(typeof AudioRecorder).toBe('function');
  });

  test('has correct styling classes', () => {
    const { container } = render(<AudioRecorder onAudioReady={mockOnAudioReady} />);
    
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('max-w-md', 'mx-auto', 'p-6', 'bg-white', 'rounded-lg', 'shadow-lg');
  });

  test('has loading state management', () => {
    render(<AudioRecorder onAudioReady={mockOnAudioReady} />);
    
    const startButton = screen.getByText('Start Recording');
    expect(startButton).toHaveClass('disabled:bg-gray-400');
  });
});
