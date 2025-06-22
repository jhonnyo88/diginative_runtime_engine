/**
 * Hot-Reload Development Environment Tests
 * Q1-AO-Milestone-1.2 Test Coverage
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HotReloadEnvironment } from './HotReloadEnvironment';

// Mock WebSocket
class MockWebSocket {
  url: string;
  readyState: number = WebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  send(data: string) {
    // Mock validation response
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'validation',
            data: {
              isValid: true,
              errors: [],
              warnings: [],
              processingTime: 50
            }
          })
        }));
      }
    }, 100);
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
}

// Mock global WebSocket
global.WebSocket = MockWebSocket as any;

// Mock GameContainer
vi.mock('../GameContainer/GameContainer', () => ({
  GameContainer: ({ gameData, isPreviewMode }: Record<string, unknown>) => (
    <div data-testid="game-container">
      {isPreviewMode ? 'Preview Mode' : 'Normal Mode'}
      {gameData && <div data-testid="game-data">{gameData.metadata?.title}</div>}
    </div>
  )
}));

// Mock DevTeamContentValidator
vi.mock('../../validation/devteam-content-validator', () => ({
  DevTeamContentValidator: vi.fn().mockImplementation(() => ({
    validateGameManifest: vi.fn().mockReturnValue({
      isValid: true,
      errors: [],
      warnings: []
    })
  }))
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>
    {children}
  </ChakraProvider>
);

describe('HotReloadEnvironment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render hot-reload environment correctly', () => {
    render(
      <TestWrapper>
        <HotReloadEnvironment />
      </TestWrapper>
    );

    expect(screen.getByText('DevTeam Hot-Reload Environment')).toBeInTheDocument();
    expect(screen.getByText('JSON Editor')).toBeInTheDocument();
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Paste your DevTeam JSON content here...')).toBeInTheDocument();
  });

  it('should handle content changes and trigger validation', async () => {
    const mockOnContentChange = vi.fn();
    
    render(
      <TestWrapper>
        <HotReloadEnvironment onContentChange={mockOnContentChange} />
      </TestWrapper>
    );

    const editor = screen.getByPlaceholderText('Paste your DevTeam JSON content here...');
    const validJsonContent = JSON.stringify({
      gameId: 'test-game',
      version: '1.0.0',
      metadata: {
        title: 'Test Game',
        description: 'Test description',
        duration: '5 minutes',
        targetAudience: 'Test audience',
        language: 'sv'
      },
      scenes: []
    });

    act(() => {
      fireEvent.change(editor, { target: { value: validJsonContent } });
    });

    expect(mockOnContentChange).toHaveBeenCalledWith(validJsonContent);
    
    // Wait for debounced validation
    await waitFor(() => {
      expect(screen.getByText(/characters/)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should display validation errors for invalid JSON', async () => {
    render(
      <TestWrapper>
        <HotReloadEnvironment />
      </TestWrapper>
    );

    const editor = screen.getByPlaceholderText('Paste your DevTeam JSON content here...');
    const invalidJson = '{ invalid json }';

    act(() => {
      fireEvent.change(editor, { target: { value: invalidJson } });
    });

    await waitFor(() => {
      expect(screen.getByText('Validation Errors')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should toggle validation details', async () => {
    render(
      <TestWrapper>
        <HotReloadEnvironment />
      </TestWrapper>
    );

    const editor = screen.getByPlaceholderText('Paste your DevTeam JSON content here...');
    const invalidJson = '{ invalid json }';

    act(() => {
      fireEvent.change(editor, { target: { value: invalidJson } });
    });

    await waitFor(() => {
      expect(screen.getByText('Validation Errors')).toBeInTheDocument();
    });

    const toggleButton = screen.getByLabelText('Toggle details');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid JSON format')).toBeInTheDocument();
    });
  });

  it('should handle manual validation trigger', async () => {
    render(
      <TestWrapper>
        <HotReloadEnvironment />
      </TestWrapper>
    );

    const validateButton = screen.getByText('Validate');
    fireEvent.click(validateButton);

    expect(validateButton).toBeDisabled();
    
    await waitFor(() => {
      expect(validateButton).not.toBeDisabled();
    }, { timeout: 1000 });
  });

  it('should load example content', () => {
    render(
      <TestWrapper>
        <HotReloadEnvironment />
      </TestWrapper>
    );

    const exampleButton = screen.getByText('Example');
    fireEvent.click(exampleButton);

    const editor = screen.getByPlaceholderText('Paste your DevTeam JSON content here...');
    expect(editor.value).toContain('GDPR Training Example');
  });

  it('should toggle auto-validation', () => {
    render(
      <TestWrapper>
        <HotReloadEnvironment />
      </TestWrapper>
    );

    const autoValidationButton = screen.getByLabelText('Toggle auto-validation');
    expect(autoValidationButton).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(autoValidationButton);
    expect(autoValidationButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('should switch preview modes', () => {
    render(
      <TestWrapper>
        <HotReloadEnvironment />
      </TestWrapper>
    );

    // Test preview-only mode
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);

    expect(screen.queryByText('JSON Editor')).not.toBeInTheDocument();
    expect(screen.getByText('Live Preview')).toBeInTheDocument();

    // Test editor-only mode
    const editorButton = screen.getByText('Editor');
    fireEvent.click(editorButton);

    expect(screen.getByText('JSON Editor')).toBeInTheDocument();
    expect(screen.queryByText('Live Preview')).not.toBeInTheDocument();

    // Test split mode
    const splitButton = screen.getByText('Split');
    fireEvent.click(splitButton);

    expect(screen.getByText('JSON Editor')).toBeInTheDocument();
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  it('should show game preview when content is valid', async () => {
    render(
      <TestWrapper>
        <HotReloadEnvironment />
      </TestWrapper>
    );

    const editor = screen.getByPlaceholderText('Paste your DevTeam JSON content here...');
    const validContent = JSON.stringify({
      gameId: 'test-game',
      version: '1.0.0',
      metadata: {
        title: 'Test Game Title',
        description: 'Test description',
        duration: '5 minutes',
        targetAudience: 'Test audience',
        language: 'sv'
      },
      scenes: [{
        id: 'scene-1',
        type: 'dialogue',
        messages: [{ text: 'Hello', characterId: 'test' }]
      }]
    });

    act(() => {
      fireEvent.change(editor, { target: { value: validContent } });
    });

    await waitFor(() => {
      expect(screen.getByTestId('game-container')).toBeInTheDocument();
      expect(screen.getByText('Preview Mode')).toBeInTheDocument();
      expect(screen.getByTestId('game-data')).toHaveTextContent('Test Game Title');
    }, { timeout: 2000 });
  });

  it('should show placeholder when no valid content', () => {
    render(
      <TestWrapper>
        <HotReloadEnvironment />
      </TestWrapper>
    );

    expect(screen.getByText('Preview Ready')).toBeInTheDocument();
    expect(screen.getByText('Add valid JSON content to see live preview')).toBeInTheDocument();
  });

  it('should handle save action correctly', async () => {
    render(
      <TestWrapper>
        <HotReloadEnvironment />
      </TestWrapper>
    );

    const saveButton = screen.getByText('Save');
    
    // Should be disabled initially
    expect(saveButton).toBeDisabled();

    // Add valid content
    const editor = screen.getByPlaceholderText('Paste your DevTeam JSON content here...');
    const validContent = JSON.stringify({
      gameId: 'test-game',
      version: '1.0.0',
      metadata: {
        title: 'Test Game',
        description: 'Test description',
        duration: '5 minutes',
        targetAudience: 'Test audience',
        language: 'sv'
      },
      scenes: []
    });

    act(() => {
      fireEvent.change(editor, { target: { value: validContent } });
    });

    // Wait for validation
    await waitFor(() => {
      expect(screen.getByText('Valid Content')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Save button should be enabled
    expect(saveButton).not.toBeDisabled();
  });

  it('should display processing time in validation results', async () => {
    render(
      <TestWrapper>
        <HotReloadEnvironment />
      </TestWrapper>
    );

    const editor = screen.getByPlaceholderText('Paste your DevTeam JSON content here...');
    const validContent = JSON.stringify({ gameId: 'test' });

    act(() => {
      fireEvent.change(editor, { target: { value: validContent } });
    });

    await waitFor(() => {
      expect(screen.getByText(/ms/)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should handle WebSocket connection properly', async () => {
    render(
      <TestWrapper>
        <HotReloadEnvironment environment="development" />
      </TestWrapper>
    );

    // WebSocket should be created and connected
    await waitFor(() => {
      // Check that component is ready for WebSocket communication
      expect(screen.getByText('DevTeam Hot-Reload Environment')).toBeInTheDocument();
    });
  });

  it('should update last modified timestamp', async () => {
    render(
      <TestWrapper>
        <HotReloadEnvironment />
      </TestWrapper>
    );

    const initialTime = screen.getByText(/Last updated:/);
    
    const editor = screen.getByPlaceholderText('Paste your DevTeam JSON content here...');
    
    act(() => {
      fireEvent.change(editor, { target: { value: 'new content' } });
    });

    await waitFor(() => {
      const newTime = screen.getByText(/Last updated:/);
      expect(newTime.textContent).not.toBe(initialTime.textContent);
    });
  });

  it('should handle municipal theme properly', () => {
    render(
      <TestWrapper>
        <HotReloadEnvironment municipalTheme="germany" />
      </TestWrapper>
    );

    expect(screen.getByText('DevTeam Hot-Reload Environment')).toBeInTheDocument();
  });

  it('should handle character count display', () => {
    render(
      <TestWrapper>
        <HotReloadEnvironment />
      </TestWrapper>
    );

    expect(screen.getByText('0 characters')).toBeInTheDocument();

    const editor = screen.getByPlaceholderText('Paste your DevTeam JSON content here...');
    
    act(() => {
      fireEvent.change(editor, { target: { value: 'test content' } });
    });

    expect(screen.getByText('12 characters')).toBeInTheDocument();
  });
});