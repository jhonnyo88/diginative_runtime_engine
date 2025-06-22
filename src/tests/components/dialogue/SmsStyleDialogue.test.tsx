import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChakraProvider } from '@chakra-ui/react';
import { DialogueScene } from '../../../components/DialogueScene/DialogueScene';

// Extend Jest matchers for accessibility
expect.extend(toHaveNoViolations);

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>
    {children}
  </ChakraProvider>
);

// Test data for SMS-style dialogue with Erik Slottner scenario



describe('SMS-Style Dialogue Interface Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('SMS-Style Chat Bubble Rendering', () => {
    it('renders Erik Slottner messages with correct chat bubble styling', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Erik Slottner's message should be left-aligned with proper bubble styling
      
      expect(chatBubble).toBeInTheDocument();
      // Erik messages should be left-aligned (flex-start)
      expect(erikMessage).toBeInTheDocument();
    });

    it('handles player messages with different alignment and styling', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Advance to player message
      fireEvent.click(screen.getByText('Nästa'));
      
      await waitFor(() => {
        expect(playerMessage).toBeInTheDocument();
        
        // Player should show as "Anna Svensson" not "Player"
        expect(screen.getByText('Anna Svensson')).toBeInTheDocument();
      }, { timeout: 15000 });
    });

    it('displays chat bubble tails correctly for left and right messages', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Erik's message should have proper styling
      
      expect(erikBubble).toBeInTheDocument();
      // Chat bubble should be properly styled with border radius
      expect(erikMessage).toBeInTheDocument();
    });

    it('applies correct color scheme for Erik vs Player messages', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
            municipalBranding={mockMunicipalBranding}
          />
        </TestWrapper>
      );

      // Check Erik's message is displayed correctly
      expect(erikMessage).toBeInTheDocument();
      expect(screen.getByText('Erik Slottner')).toBeInTheDocument();

      // Advance to player message
      fireEvent.click(screen.getByText('Nästa'));
      
      await waitFor(() => {
        // Player message should be displayed correctly
        expect(playerMessage).toBeInTheDocument();
        expect(screen.getByText('Anna Svensson')).toBeInTheDocument();
      }, { timeout: 15000 });
    });
  });

  describe('Player Name Integration Testing', () => {
    it('displays custom player name instead of generic "Du"', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Should show Erik Slottner's name
      expect(screen.getByText('Erik Slottner')).toBeInTheDocument();
      
      // Navigate to player message to test player name
      fireEvent.click(screen.getByText('Nästa'));
      
      waitFor(() => {
        expect(screen.getByText('Anna Svensson')).toBeInTheDocument();
        expect(screen.queryByText('Du')).not.toBeInTheDocument();
      });
    });

    it('handles long player names correctly in chat bubbles', () => {
      
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName={longPlayerName}
          />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Nästa'));
      
      waitFor(() => {
        expect(screen.getByText(longPlayerName)).toBeInTheDocument();
        
        // Chat bubble should still maintain proper layout with long names
        expect(chatContainer).toHaveStyle({ maxWidth: '85%' });
      });
    });

    it('handles special characters in player names', () => {
      
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName={specialCharName}
          />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Nästa'));
      
      waitFor(() => {
        expect(screen.getByText(specialCharName)).toBeInTheDocument();
      });
    });

    it('handles empty or undefined player name gracefully', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName=""
          />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Nästa'));
      
      waitFor(() => {
        // Should fall back to character name "Du"
        expect(screen.getByText('Du')).toBeInTheDocument();
      });
    });

    it('creates proper avatar initials for custom player names', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Nästa'));
      
      waitFor(() => {
        // Avatar should show player name initials "AS"
        expect(avatar).toBeInTheDocument();
      });
    });
  });

  describe('Erik Slottner vs Player Message Differentiation', () => {
    it('differentiates Erik Slottner and Player messages visually', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Erik's message should be displayed
      expect(erikMessage).toBeInTheDocument();
      expect(screen.getByText('Erik Slottner')).toBeInTheDocument();

      // Advance to player message
      fireEvent.click(screen.getByText('Nästa'));
      
      await waitFor(() => {
        // Player's message should be displayed with player name
        expect(playerMessage).toBeInTheDocument();
        expect(screen.getByText('Anna Svensson')).toBeInTheDocument();
      }, { timeout: 15000 });
    });

    it('shows correct role labels for Erik Slottner vs Player', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Erik should show "Digitaliseringschef"
      expect(screen.getByText('Digitaliseringschef')).toBeInTheDocument();

      // Advance to player message
      fireEvent.click(screen.getByText('Nästa'));
      
      await waitFor(() => {
        // Player should show "Municipal Employee"
        expect(screen.getByText('Municipal Employee')).toBeInTheDocument();
      }, { timeout: 15000 });
    });

    it('applies different avatar styling for Erik vs Player', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
            municipalBranding={mockMunicipalBranding}
          />
        </TestWrapper>
      );

      // Erik's avatar
      expect(erikAvatar).toBeInTheDocument();

      // Advance to player message
      fireEvent.click(screen.getByText('Nästa'));
      
      await waitFor(() => {
        // Player's avatar should have different styling
        expect(playerAvatar).toBeInTheDocument();
      });
    });

    it('maintains conversation flow between Erik and Player', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Track conversation sequence
      expect(screen.getByText('Erik Slottner')).toBeInTheDocument(); // Turn 1: Erik

      fireEvent.click(screen.getByText('Nästa'));
      await waitFor(() => {
        expect(screen.getByText('Anna Svensson')).toBeInTheDocument(); // Turn 2: Player
      });

      fireEvent.click(screen.getByText('Nästa'));
      await waitFor(() => {
        expect(screen.getByText('Erik Slottner')).toBeInTheDocument(); // Turn 3: Erik again
      });

      fireEvent.click(screen.getByText('Nästa'));
      await waitFor(() => {
        expect(screen.getByText('Anna Svensson')).toBeInTheDocument(); // Turn 4: Player again
      });
    });
  });

  describe('Chat Interface Accessibility', () => {
    it('has no accessibility violations in SMS-style interface', async () => {
      const { container } = render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      expect(results).toHaveNoViolations();
    });

    it('provides proper screen reader announcements for chat messages', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Check for aria-live region announcing conversation progress
      expect(liveRegion).toBeInTheDocument();
    });

    it('supports keyboard navigation in chat interface', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Test space key navigation
      fireEvent.keyDown(window, { key: 'Space' });
      
      await waitFor(() => {
        expect(screen.getByText('Tack Erik! I\'m excited to learn about the new digital initiatives.')).toBeInTheDocument();
      }, { timeout: 15000 });

      // Test enter key navigation
      fireEvent.keyDown(window, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Perfect! Let\'s start with our citizen service transformation.')).toBeInTheDocument();
      }, { timeout: 15000 });
    });

    it('provides proper ARIA labels for chat elements', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Next button should have descriptive aria-label
      expect(nextButton).toHaveAttribute('aria-label');
      
      // Progress bar should have accessibility label
      expect(progressBar).toHaveAttribute('aria-label');
    });

    it('maintains focus management during chat progression', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      nextButton.focus();
      expect(document.activeElement).toBe(nextButton);

      fireEvent.click(nextButton);
      
      await waitFor(() => {
        // Focus should remain on the next button after message change
        expect(document.activeElement).toBe(updatedButton);
      });
    });
  });

  describe('Municipal Branding in Chat Interface', () => {
    it('applies municipal branding colors to chat interface', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
            municipalBranding={mockMunicipalBranding}
          />
        </TestWrapper>
      );

      // Municipal branding should be visible
      expect(screen.getByText('Stockholm SMS Test')).toBeInTheDocument();
      expect(screen.getByAltText('Stockholm SMS Test logotyp')).toBeInTheDocument();
    });

    it('maintains branding consistency across different message types', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
            municipalBranding={mockMunicipalBranding}
          />
        </TestWrapper>
      );

      // Both Erik and Player messages should respect municipal branding
      expect(screen.getByText('Stockholm SMS Test')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Nästa'));
      
      await waitFor(() => {
        // Branding should persist across message changes
        expect(screen.getByText('Stockholm SMS Test')).toBeInTheDocument();
      });
    });

    it('integrates municipal colors into chat bubbles correctly', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
            municipalBranding={mockMunicipalBranding}
          />
        </TestWrapper>
      );

      // Primary color should be applied to municipal branding elements
      expect(brandingElement).toBeInTheDocument();
    });
  });

  describe('Mobile SMS Interface Optimization', () => {
    it('optimizes chat bubbles for Anna Svensson iPhone 12 use case', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Chat container should be mobile-optimized
      expect(chatBubble).toBeInTheDocument();

      // Next button should have proper touch target size
      expect(nextButton).toHaveStyle({ minHeight: '48px', minWidth: '120px' });
    });

    it('handles text sizing for mobile readability', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Text should be properly sized for mobile reading
      expect(messageText).toBeInTheDocument();
    });

    it('maintains proper spacing between chat messages on mobile', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // VStack should provide proper spacing between elements
      expect(chatContainer).toBeInTheDocument();
    });
  });

  describe('Performance and Animation Testing', () => {
    it('animates chat message transitions smoothly', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      fireEvent.click(nextButton);

      // Motion component should handle transitions
      await waitFor(() => {
        expect(screen.getByText('Tack Erik! I\'m excited to learn about the new digital initiatives.')).toBeInTheDocument();
      });
    });

    it('prevents rapid clicking during chat transitions', async () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      fireEvent.click(nextButton);
      fireEvent.click(nextButton); // Rapid click should be ignored

      vi.advanceTimersByTime(300);

      // Should only advance one message
      await waitFor(() => {
        expect(screen.getByText('Tack Erik! I\'m excited to learn about the new digital initiatives.')).toBeInTheDocument();
      });

      expect(screen.queryByText('Perfect! Let\'s start with our citizen service transformation.')).not.toBeInTheDocument();
    });

    it('maintains performance with complex SMS styling', () => {
      
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
            municipalBranding={mockMunicipalBranding}
          />
        </TestWrapper>
      );


      // Rendering should be fast even with SMS styling
      expect(renderTime).toBeLessThan(100); // 100ms threshold
    });
  });

  describe('Error Handling in Chat Interface', () => {
    it('handles missing player character gracefully', () => {

      render(
        <TestWrapper>
          <DialogueScene
            sceneData={incompleteData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Should still render Erik's message
      expect(screen.getByText('Hej! Welcome to our digitalization strategy discussion.')).toBeInTheDocument();
    });

    it('handles undefined player name in chat context', () => {
      render(
        <TestWrapper>
          <DialogueScene
            sceneData={erikSlottnerDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName={undefined}
          />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Nästa'));
      
      waitFor(() => {
        // Should fall back to character name
        expect(screen.getByText('Du')).toBeInTheDocument();
      });
    });

    it('handles empty dialogue array gracefully', () => {

      render(
        <TestWrapper>
          <DialogueScene
            sceneData={emptyDialogueData}
            onComplete={mockOnComplete}
            culturalContext="swedish"
            playerName="Anna Svensson"
          />
        </TestWrapper>
      );

      // Should show error message
      expect(screen.getByText('Ingen dialogdata tillgänglig')).toBeInTheDocument();
    });
  });
});