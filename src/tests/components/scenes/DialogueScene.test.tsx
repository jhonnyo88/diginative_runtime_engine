import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DialogueScene } from '../../../components/scenes/DialogueScene';
import { ChakraThemeProvider } from '../../../theme/ChakraThemeProvider';
import type { DialogueScene as DialogueSceneType } from '../../../types/game-manifest';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraThemeProvider>
    {children}
  </ChakraThemeProvider>
);


const sampleDialogueScene: DialogueSceneType = {
  id: 'dialogue-test',
  type: 'dialogue',
  title: 'Privacy Conversation',
  description: 'Learn about data privacy through dialogue',
  content: {
    character: {
      name: 'Anna Svensson',
      avatar: '/avatars/anna.png',
      role: 'Data Protection Officer'
    },
    messages: [
      {
        id: 'msg-1',
        speaker: 'Anna Svensson',
        text: 'Hej! Welcome to our privacy training.',
        timestamp: 0
      },
      {
        id: 'msg-2',
        speaker: 'Anna Svensson', 
        text: 'Today we\'ll learn about GDPR compliance in municipal work.',
        timestamp: 2000
      },
      {
        id: 'msg-3',
        speaker: 'User',
        text: 'I\'m ready to learn!',
        timestamp: 4000
      },
      {
        id: 'msg-4',
        speaker: 'Anna Svensson',
        text: 'Perfect! Let\'s start with the basics of personal data handling.',
        timestamp: 6000
      }
    ],
    actions: [
      {
        id: 'continue',
        text: 'Continue Learning',
        type: 'continue'
      },
      {
        id: 'ask-question',
        text: 'Ask a Question',
        type: 'interaction'
      }
    ]
  }
};


describe('DialogueScene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });


  it('renders dialogue scene header correctly', () => {
    render(
      <TestWrapper>
        <DialogueScene {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Privacy Conversation')).toBeInTheDocument();
    expect(screen.getByText('Learn about data privacy through dialogue')).toBeInTheDocument();
  });

  it('displays character information', () => {
    render(
      <TestWrapper>
        <DialogueScene {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Anna Svensson')).toBeInTheDocument();
    expect(screen.getByText('Data Protection Officer')).toBeInTheDocument();
    expect(screen.getByAltText('Anna Svensson avatar')).toBeInTheDocument();
  });

  it('shows first message immediately', () => {
    render(
      <TestWrapper>
        <DialogueScene {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Hej! Welcome to our privacy training.')).toBeInTheDocument();
  });

  it('progressively reveals messages with timing', async () => {
    render(
      <TestWrapper>
        <DialogueScene {...defaultProps} />
      </TestWrapper>
    );

    // First message should be visible
    expect(screen.getByText('Hej! Welcome to our privacy training.')).toBeInTheDocument();
    
    // Second message should not be visible yet
    expect(screen.queryByText('Today we\'ll learn about GDPR compliance')).not.toBeInTheDocument();

    // Advance time by 2 seconds
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText('Today we\'ll learn about GDPR compliance in municipal work.')).toBeInTheDocument();
    });

    // Third message (user message) should not be visible yet
    expect(screen.queryByText('I\'m ready to learn!')).not.toBeInTheDocument();

    // Advance time by another 2 seconds
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText('I\'m ready to learn!')).toBeInTheDocument();
    });
  });

  it('allows skipping to see all messages', async () => {
    render(
      <TestWrapper>
        <DialogueScene {...defaultProps} />
      </TestWrapper>
    );

    // Click skip button
    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(screen.getByText('Perfect! Let\'s start with the basics')).toBeInTheDocument();
    });

    // All messages should be visible
    expect(screen.getByText('Hej! Welcome to our privacy training.')).toBeInTheDocument();
    expect(screen.getByText('Today we\'ll learn about GDPR compliance')).toBeInTheDocument();
    expect(screen.getByText('I\'m ready to learn!')).toBeInTheDocument();
    expect(screen.getByText('Perfect! Let\'s start with the basics')).toBeInTheDocument();
  });

  it('shows action buttons when dialogue is complete', async () => {
    render(
      <TestWrapper>
        <DialogueScene {...defaultProps} />
      </TestWrapper>
    );

    // Skip to end to show all messages
    fireEvent.click(screen.getByText('Skip to end'));

    await waitFor(() => {
      expect(screen.getByText('Continue Learning')).toBeInTheDocument();
      expect(screen.getByText('Ask a Question')).toBeInTheDocument();
    });
  });

  it('handles continue action correctly', async () => {
    render(
      <TestWrapper>
        <DialogueScene {...defaultProps} />
      </TestWrapper>
    );

    // Skip to end and click continue
    fireEvent.click(screen.getByText('Skip to end'));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Continue Learning'));
    });

    expect(mockOnComplete).toHaveBeenCalledWith({
      sceneId: 'dialogue-test',
      action: 'continue',
      timeSpent: expect.any(Number),
      messagesRead: 4
    });
  });

  it('tracks analytics events', async () => {
    render(
      <TestWrapper>
        <DialogueScene {...defaultProps} />
      </TestWrapper>
    );

    // Scene start should be tracked
    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('dialogue_scene_started', {
      sceneId: 'dialogue-test',
      characterName: 'Anna Svensson',
      messageCount: 4
    });

    // Skip action should be tracked
    fireEvent.click(screen.getByText('Skip to end'));

    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('dialogue_skipped', {
      sceneId: 'dialogue-test',
      messagesSkipped: expect.any(Number)
    });
  });

  it('supports keyboard navigation', async () => {
    render(
      <TestWrapper>
        <DialogueScene {...defaultProps} />
      </TestWrapper>
    );

    // Skip to show action buttons
    fireEvent.click(screen.getByText('Skip to end'));

    await waitFor(() => {
      continueButton.focus();
      
      expect(document.activeElement).toBe(continueButton);

      // Enter key should trigger continue
      fireEvent.keyDown(continueButton, { key: 'Enter' });
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('handles different speaker types correctly', () => {
    render(
      <TestWrapper>
        <DialogueScene {...defaultProps} />
      </TestWrapper>
    );

    // Skip to show all messages
    fireEvent.click(screen.getByText('Skip to end'));

    // Check for different speaker styling
    const _annaMessages = screen.getAllByText(/Anna Svensson/).filter(el => 
      el.textContent?.includes('Anna Svensson') && !el.textContent?.includes('Data Protection')
    );
    expect(annaMessages.length).toBeGreaterThan(0);

    expect(userMessages.length).toBeGreaterThan(0);
  });

  it('shows progress indicator', () => {
    render(
      <TestWrapper>
        <DialogueScene {...defaultProps} />
      </TestWrapper>
    );

    // Progress should start at 25% (1 of 4 messages)
    expect(progressBar).toHaveAttribute('aria-valuenow', '25');
  });

  it('updates progress as messages appear', async () => {
    render(
      <TestWrapper>
        <DialogueScene {...defaultProps} />
      </TestWrapper>
    );

    // Advance time to show second message
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });
  });

  it('handles empty dialogue gracefully', () => {
    const emptyDialogue: DialogueSceneType = {
      ...sampleDialogueScene,
      content: {
        ...sampleDialogueScene.content,
        messages: []
      }
    };

    render(
      <TestWrapper>
        <DialogueScene 
          scene={emptyDialogue}
          onComplete={mockOnComplete}
          analytics={mockAnalytics}
        />
      </TestWrapper>
    );

    expect(screen.getByText('No dialogue available')).toBeInTheDocument();
  });

  it('supports accessibility features', () => {
    render(
      <TestWrapper>
        <DialogueScene {...defaultProps} />
      </TestWrapper>
    );

    // Should have proper ARIA labels
    expect(screen.getByRole('region', { name: /dialogue scene/i })).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Dialogue progress');
    
    // Skip button should have proper aria-label
    expect(skipButton).toHaveAttribute('aria-label', 'Skip to end of dialogue');
  });

  it('auto-advances after all messages are shown', async () => {
    const autoAdvanceScene: DialogueSceneType = {
      ...sampleDialogueScene,
      content: {
        ...sampleDialogueScene.content,
        autoAdvance: true,
        autoAdvanceDelay: 2000
      }
    };

    render(
      <TestWrapper>
        <DialogueScene 
          scene={autoAdvanceScene}
          onComplete={mockOnComplete}
          analytics={mockAnalytics}
        />
      </TestWrapper>
    );

    // Wait for all messages to appear (6 seconds total)
    vi.advanceTimersByTime(6000);

    // Wait for auto-advance delay
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith({
        sceneId: 'dialogue-test',
        action: 'auto_advance',
        timeSpent: expect.any(Number),
        messagesRead: 4
      });
    });
  });

  it('handles character avatar loading errors', () => {
    render(
      <TestWrapper>
        <DialogueScene {...defaultProps} />
      </TestWrapper>
    );

    
    // Simulate image load error
    fireEvent.error(avatarImg);

    // Should show fallback avatar
    expect(screen.getByText('AS')).toBeInTheDocument(); // Initials fallback
  });

  it('pauses dialogue when window loses focus', async () => {
    render(
      <TestWrapper>
        <DialogueScene {...defaultProps} />
      </TestWrapper>
    );

    // Simulate window blur
    fireEvent.blur(window);

    // Advance time - messages should not appear while paused
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByText('Today we\'ll learn about GDPR compliance')).not.toBeInTheDocument();
    });

    // Resume when window gains focus
    fireEvent.focus(window);
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText('Today we\'ll learn about GDPR compliance')).toBeInTheDocument();
    });
  });
});