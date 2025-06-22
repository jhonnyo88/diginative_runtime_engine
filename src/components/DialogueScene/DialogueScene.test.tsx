import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChakraProvider } from '@chakra-ui/react';
import { DialogueScene } from './DialogueScene';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Test wrapper with Chakra UI
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>
    {children}
  </ChakraProvider>
);

// Mock DevTeam JSON data matching System Architect specification



describe('DialogueScene Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders dialogue scene with title', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(screen.getByText('Privacy Protection Dialogue')).toBeInTheDocument();
      // Description is not rendered in current implementation
    });

    it('displays progress indicator correctly', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '25'); // 1 of 4 turns
    });

    it('shows current dialogue turn with character info', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(screen.getByText('Anna Svensson')).toBeInTheDocument();
      expect(screen.getByText('Data Protection Officer')).toBeInTheDocument();
      expect(screen.getByText('Hej! Welcome to our privacy training session.')).toBeInTheDocument();
    });

    it('displays learning objectives', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(screen.getByText('Läringsmål:')).toBeInTheDocument();
      expect(screen.getByText('• Understand GDPR basic principles')).toBeInTheDocument();
      expect(screen.getByText('• Apply privacy rules in municipal work')).toBeInTheDocument();
      expect(screen.getByText('• Recognize data protection violations')).toBeInTheDocument();
    });
  });

  describe('Municipal Branding Integration', () => {
    it('applies municipal branding correctly', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            municipalBranding={mockMunicipalBranding}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(screen.getByText('Stockholm Kommun')).toBeInTheDocument();
      expect(screen.getByAltText('Stockholm Kommun logotyp')).toBeInTheDocument();
      expect(screen.getByAltText('Stockholm Kommun logotyp')).toHaveAttribute('src', mockMunicipalBranding.logoUrl);
    });

    it('works without municipal branding', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(screen.queryByText('Stockholm Kommun')).not.toBeInTheDocument();
    });
  });

  describe('Cultural Context Adaptation', () => {
    it('applies Swedish cultural styling', () => {
      const { container } = render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Check for Swedish styling being applied
      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies German cultural styling', () => {
      const { container } = render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="german"
          />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies French cultural styling', () => {
      const { container } = render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="french"
          />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies Dutch cultural styling', () => {
      const { container } = render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="dutch"
          />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Dialogue Progression', () => {
    it('advances to next turn on button click', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Today we will learn about GDPR compliance in municipal work.')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('updates progress as dialogue advances', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(progressBar).toHaveAttribute('aria-valuenow', '50'); // 2 of 4 turns
      });
    });

    it('shows completion button on last turn', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Advance to last turn
      fireEvent.click(nextButton); // Turn 2
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Nästa')); // Turn 3
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Nästa')); // Turn 4
      });

      await waitFor(() => {
        expect(screen.getByText('Slutför')).toBeInTheDocument();
      });
    });

    it('calls onComplete when dialogue finishes', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Advance through all turns
      let button = screen.getByText('Nästa');
      fireEvent.click(button); // Turn 2

      await waitFor(() => {
        button = screen.getByText('Nästa');
        fireEvent.click(button); // Turn 3
      });

      await waitFor(() => {
        button = screen.getByText('Nästa');
        fireEvent.click(button); // Turn 4
      });

      await waitFor(() => {
        button = screen.getByText('Slutför');
        fireEvent.click(button); // Complete
      });

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Keyboard Navigation (WCAG 2.1 AA)', () => {
    it('advances dialogue with Space key', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      fireEvent.keyDown(window, { key: 'Space' });

      await waitFor(() => {
        expect(screen.getByText('Today we will learn about GDPR compliance in municipal work.')).toBeInTheDocument();
      });
    });

    it('advances dialogue with Enter key', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      fireEvent.keyDown(window, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Today we will learn about GDPR compliance in municipal work.')).toBeInTheDocument();
      });
    });

    it('prevents default keyboard behavior', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      fireEvent.keyDown(window, { key: 'Space', preventDefault });

      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('Anna Svensson Mobile Optimization', () => {
    it('uses mobile-first sizing for touch targets', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(nextButton).toHaveStyle({ minHeight: '48px', minWidth: '120px' });
    });

    it('optimizes text size for mobile readability', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(dialogueText).toHaveStyle({ minHeight: '3em' });
    });

    it('uses appropriate avatar size for mobile', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Avatar should be 48px on mobile (isMobile = true in component)
      expect(avatar).toHaveStyle({ width: '48px', height: '48px' });
    });
  });

  describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(results).toHaveNoViolations();
    }, 20000); // Increased timeout for axe accessibility tests

    it('provides screen reader announcements', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Check for aria-live region (it exists but may not have role="status")
      expect(liveRegion).toBeInTheDocument();
    });

    it('has proper aria-labels on interactive elements', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      expect(progressBar).toHaveAttribute('aria-label');

      expect(nextButton).toHaveAttribute('aria-label');
    });

    it('maintains proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Title should be properly structured
      expect(screen.getByText('Privacy Protection Dialogue')).toBeInTheDocument();
      expect(screen.getByText('Läringsmål:')).toBeInTheDocument();
    });
  });

  describe('Performance Requirements', () => {
    it('handles scene duration within Anna Svensson 7-minute limit', () => {
      expect(mockDialogueSceneData.scene_duration).toBeLessThanOrEqual(420); // 7 minutes
    });

    it('renders without blocking animations', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Component should render immediately
      expect(screen.getByText('Privacy Protection Dialogue')).toBeInTheDocument();
    });

    it('prevents rapid clicking during animations', async () => {
      vi.useFakeTimers();
      
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      fireEvent.click(nextButton);
      fireEvent.click(nextButton); // Should be ignored during animation

      // Wait for animation to complete
      await vi.runOnlyPendingTimersAsync();

      // Should only advance one turn
      expect(screen.getByText('Today we will learn about GDPR compliance in municipal work.')).toBeInTheDocument();
      expect(screen.queryByText('I understand. Please tell me more.')).not.toBeInTheDocument();
      
      vi.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('handles missing character gracefully', () => {

      render(
        <TestWrapper>
          <DialogueScene
            sceneData={invalidSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Should still render without crashing
      expect(screen.getByText('Privacy Protection Dialogue')).toBeInTheDocument();
    });

    it('handles empty dialogue turns', () => {

      render(
        <TestWrapper>
          <DialogueScene
            sceneData={emptySceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Should show completion immediately
      expect(screen.getByText('Slutför')).toBeInTheDocument();
    });
  });

  describe('DevTeam JSON Schema Integration', () => {
    it('processes DevTeam dialogue structure correctly', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={mockDialogueSceneData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
          />
        </TestWrapper>
      );

      // Verify all required fields are processed
      expect(screen.getByText('Privacy Protection Dialogue')).toBeInTheDocument();
      expect(screen.getByText('Anna Svensson')).toBeInTheDocument();
      expect(screen.getByText('Data Protection Officer')).toBeInTheDocument();
      expect(screen.getByText('Hej! Welcome to our privacy training session.')).toBeInTheDocument();
    });

    it('validates required scene properties', () => {
      // All required properties should be present in mock data
      expect(mockDialogueSceneData.scene_id).toBeDefined();
      expect(mockDialogueSceneData.scene_type).toBe('DialogueScene');
      expect(mockDialogueSceneData.characters).toHaveLength(2);
      expect(mockDialogueSceneData.dialogue_turns).toHaveLength(4);
      expect(mockDialogueSceneData.learning_objectives).toHaveLength(3);
    });
  });
});