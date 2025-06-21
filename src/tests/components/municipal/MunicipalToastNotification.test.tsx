/**
 * Municipal Toast Notification Component Tests
 * Task: proposal-028 - Component Testing Infrastructure
 * Priority: P0 - CRITICAL (Municipal-facing)
 * 
 * Tests municipal branding, accessibility, and Swedish notifications
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import MunicipalToastNotification from '../../../components/notifications/MunicipalToastNotification';

// Mock framer-motion for stable testing
vi.mock('framer-motion', () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  },
  AnimatePresence: vi.fn(({ children }) => children),
}));

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('MunicipalToastNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Municipal Branding Compliance', () => {
    it('displays Malmö municipal styling for success notifications', () => {
      renderWithChakra(
        <MunicipalToastNotification 
          type="success"
          title="Framgångsrikt slutfört"
          message="GDPR-utbildningen har slutförts"
          municipality="malmö"
          isVisible={true}
        />
      );

      const toast = screen.getByTestId('municipal-toast-notification');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveAttribute('data-municipality', 'malmö');
      expect(toast).toHaveAttribute('data-type', 'success');
      
      // Verify Swedish text
      expect(screen.getByText('Framgångsrikt slutfört')).toBeInTheDocument();
      expect(screen.getByText('GDPR-utbildningen har slutförts')).toBeInTheDocument();
    });

    it('applies municipal brand colors for different notification types', () => {
      const { rerender } = renderWithChakra(
        <MunicipalToastNotification 
          type="info"
          title="Information"
          message="Ny modul tillgänglig"
          municipality="malmö"
          isVisible={true}
        />
      );

      let toast = screen.getByTestId('municipal-toast-notification');
      expect(toast).toHaveAttribute('data-type', 'info');
      
      // Test warning type
      rerender(
        <ChakraProvider>
          <MunicipalToastNotification 
            type="warning"
            title="Varning"
            message="Sessionen löper ut snart"
            municipality="malmö"
            isVisible={true}
          />
        </ChakraProvider>
      );

      toast = screen.getByTestId('municipal-toast-notification');
      expect(toast).toHaveAttribute('data-type', 'warning');
      
      // Test error type
      rerender(
        <ChakraProvider>
          <MunicipalToastNotification 
            type="error"
            title="Fel"
            message="Kunde inte spara framsteg"
            municipality="malmö"
            isVisible={true}
          />
        </ChakraProvider>
      );

      toast = screen.getByTestId('municipal-toast-notification');
      expect(toast).toHaveAttribute('data-type', 'error');
    });

    it('displays municipal logo and context', () => {
      renderWithChakra(
        <MunicipalToastNotification 
          type="success"
          title="Certifiering klar"
          message="Din digitala kompetens är nu certifierad"
          municipality="malmö"
          showLogo={true}
          isVisible={true}
        />
      );

      // Should show municipal logo
      const logo = screen.getByTestId('municipal-logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('alt', 'Malmö Stad logotyp');
    });

    it('supports multiple municipality contexts', () => {
      const municipalities = ['malmö', 'stockholm', 'göteborg'];
      
      municipalities.forEach(municipality => {
        const { rerender } = renderWithChakra(
          <MunicipalToastNotification 
            type="info"
            title="Municipal Test"
            message={`Test för ${municipality}`}
            municipality={municipality}
            isVisible={true}
          />
        );

        const toast = screen.getByTestId('municipal-toast-notification');
        expect(toast).toHaveAttribute('data-municipality', municipality);
      });
    });
  });

  describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
    it('provides proper ARIA attributes and roles', () => {
      renderWithChakra(
        <MunicipalToastNotification 
          type="success"
          title="Accessibility Test"
          message="This is a test notification for accessibility"
          municipality="malmö"
          isVisible={true}
        />
      );

      const toast = screen.getByTestId('municipal-toast-notification');
      
      // Should have alert role for immediate announcement
      expect(toast).toHaveAttribute('role', 'alert');
      expect(toast).toHaveAttribute('aria-live', 'assertive');
      expect(toast).toHaveAttribute('aria-atomic', 'true');
      
      // Should have proper labeling
      expect(toast).toHaveAttribute('aria-labelledby');
      expect(toast).toHaveAttribute('aria-describedby');
    });

    it('supports keyboard navigation and dismissal', () => {
      const onDismissMock = vi.fn();
      
      renderWithChakra(
        <MunicipalToastNotification 
          type="info"
          title="Keyboard Test"
          message="Press Escape to dismiss"
          municipality="malmö"
          isVisible={true}
          onDismiss={onDismissMock}
          dismissible={true}
        />
      );

      const toast = screen.getByTestId('municipal-toast-notification');
      
      // Should be focusable
      expect(toast).toHaveAttribute('tabIndex', '0');
      
      // Test keyboard focus
      toast.focus();
      expect(toast).toHaveFocus();
      
      // Test Escape key dismissal
      fireEvent.keyDown(toast, { key: 'Escape', code: 'Escape' });
      expect(onDismissMock).toHaveBeenCalled();
    });

    it('provides screen reader friendly content', () => {
      renderWithChakra(
        <MunicipalToastNotification 
          type="error"
          title="Fel vid inloggning"
          message="Kontrollera dina uppgifter och försök igen"
          municipality="malmö"
          isVisible={true}
          screenReaderText="Fel: Inloggningen misslyckades. Kontrollera dina uppgifter och försök igen."
        />
      );

      // Should have screen reader specific text
      const srText = screen.getByText('Fel: Inloggningen misslyckades. Kontrollera dina uppgifter och försök igen.');
      expect(srText).toHaveClass('sr-only');
    });

    it('maintains focus management for modal notifications', () => {
      const onDismissMock = vi.fn();
      
      renderWithChakra(
        <MunicipalToastNotification 
          type="warning"
          title="Viktigt meddelande"
          message="Din session löper ut om 5 minuter"
          municipality="malmö"
          isVisible={true}
          modal={true}
          onDismiss={onDismissMock}
        />
      );

      const toast = screen.getByTestId('municipal-toast-notification');
      
      // Should trap focus when modal
      expect(toast).toHaveAttribute('data-modal', 'true');
      
      // Should focus dismiss button
      const dismissButton = screen.getByRole('button', { name: /stäng/i });
      expect(dismissButton).toBeInTheDocument();
      
      fireEvent.click(dismissButton);
      expect(onDismissMock).toHaveBeenCalled();
    });

    it('respects reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      renderWithChakra(
        <MunicipalToastNotification 
          type="success"
          title="Motion Reduced Test"
          message="Animation should be disabled"
          municipality="malmö"
          isVisible={true}
          animated={true}
        />
      );

      const toast = screen.getByTestId('municipal-toast-notification');
      expect(toast).toHaveAttribute('data-reduced-motion', 'true');
    });
  });

  describe('Auto-dismiss and Timing', () => {
    it('auto-dismisses after specified duration', async () => {
      const onDismissMock = vi.fn();
      
      renderWithChakra(
        <MunicipalToastNotification 
          type="info"
          title="Auto Dismiss Test"
          message="This will auto-dismiss in 3 seconds"
          municipality="malmö"
          isVisible={true}
          duration={3000}
          onDismiss={onDismissMock}
        />
      );

      expect(screen.getByTestId('municipal-toast-notification')).toBeInTheDocument();
      
      // Fast-forward time
      vi.advanceTimersByTime(3000);
      
      await waitFor(() => {
        expect(onDismissMock).toHaveBeenCalled();
      });
    });

    it('pauses auto-dismiss on hover', async () => {
      const onDismissMock = vi.fn();
      
      renderWithChakra(
        <MunicipalToastNotification 
          type="success"
          title="Hover Pause Test"
          message="Hover to pause auto-dismiss"
          municipality="malmö"
          isVisible={true}
          duration={2000}
          pauseOnHover={true}
          onDismiss={onDismissMock}
        />
      );

      const toast = screen.getByTestId('municipal-toast-notification');
      
      // Hover after 1 second
      vi.advanceTimersByTime(1000);
      fireEvent.mouseEnter(toast);
      
      // Should not dismiss while hovered
      vi.advanceTimersByTime(2000);
      expect(onDismissMock).not.toHaveBeenCalled();
      
      // Resume on mouse leave
      fireEvent.mouseLeave(toast);
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(onDismissMock).toHaveBeenCalled();
      });
    });

    it('prevents auto-dismiss when focused', async () => {
      const onDismissMock = vi.fn();
      
      renderWithChakra(
        <MunicipalToastNotification 
          type="warning"
          title="Focus Pause Test"
          message="Focus to prevent auto-dismiss"
          municipality="malmö"
          isVisible={true}
          duration={1500}
          pauseOnFocus={true}
          onDismiss={onDismissMock}
        />
      );

      const toast = screen.getByTestId('municipal-toast-notification');
      
      // Focus the toast
      toast.focus();
      
      // Should not auto-dismiss while focused
      vi.advanceTimersByTime(2000);
      expect(onDismissMock).not.toHaveBeenCalled();
      
      // Blur and should then dismiss
      fireEvent.blur(toast);
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        expect(onDismissMock).toHaveBeenCalled();
      });
    });
  });

  describe('Action Buttons and Interactions', () => {
    it('renders action buttons with proper Swedish labels', () => {
      const onActionMock = vi.fn();
      const onCancelMock = vi.fn();
      
      renderWithChakra(
        <MunicipalToastNotification 
          type="info"
          title="Bekräftelse krävs"
          message="Vill du fortsätta med nästa modul?"
          municipality="malmö"
          isVisible={true}
          actions={[
            { label: 'Fortsätt', onClick: onActionMock, variant: 'primary' },
            { label: 'Avbryt', onClick: onCancelMock, variant: 'secondary' }
          ]}
        />
      );

      const continueButton = screen.getByRole('button', { name: 'Fortsätt' });
      const cancelButton = screen.getByRole('button', { name: 'Avbryt' });
      
      expect(continueButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
      
      fireEvent.click(continueButton);
      expect(onActionMock).toHaveBeenCalled();
      
      fireEvent.click(cancelButton);
      expect(onCancelMock).toHaveBeenCalled();
    });

    it('handles loading states for action buttons', () => {
      const onActionMock = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      renderWithChakra(
        <MunicipalToastNotification 
          type="success"
          title="Spara framsteg"
          message="Klicka för att spara ditt framsteg"
          municipality="malmö"
          isVisible={true}
          actions={[
            { label: 'Spara', onClick: onActionMock, variant: 'primary', showLoading: true }
          ]}
        />
      );

      const saveButton = screen.getByRole('button', { name: 'Spara' });
      fireEvent.click(saveButton);
      
      // Should show loading state
      expect(saveButton).toBeDisabled();
      expect(screen.getByText('Sparar...')).toBeInTheDocument();
    });
  });

  describe('Notification Queue and Stacking', () => {
    it('supports stacking multiple notifications', () => {
      const { rerender } = renderWithChakra(
        <div>
          <MunicipalToastNotification 
            type="info"
            title="Första meddelandet"
            message="Detta är det första meddelandet"
            municipality="malmö"
            isVisible={true}
            stackPosition={1}
          />
          <MunicipalToastNotification 
            type="success"
            title="Andra meddelandet"
            message="Detta är det andra meddelandet"
            municipality="malmö"
            isVisible={true}
            stackPosition={2}
          />
        </div>
      );

      const notifications = screen.getAllByTestId('municipal-toast-notification');
      expect(notifications).toHaveLength(2);
      
      // Check stacking positions
      expect(notifications[0]).toHaveAttribute('data-stack-position', '1');
      expect(notifications[1]).toHaveAttribute('data-stack-position', '2');
    });

    it('handles notification removal from stack', () => {
      const onFirstDismissMock = vi.fn();
      const onSecondDismissMock = vi.fn();
      
      const { rerender } = renderWithChakra(
        <div>
          <MunicipalToastNotification 
            type="warning"
            title="Stack Test 1"
            message="First notification"
            municipality="malmö"
            isVisible={true}
            onDismiss={onFirstDismissMock}
            dismissible={true}
          />
          <MunicipalToastNotification 
            type="error"
            title="Stack Test 2"
            message="Second notification"
            municipality="malmö"
            isVisible={true}
            onDismiss={onSecondDismissMock}
            dismissible={true}
          />
        </div>
      );

      // Dismiss first notification
      const dismissButtons = screen.getAllByRole('button', { name: /stäng/i });
      fireEvent.click(dismissButtons[0]);
      
      expect(onFirstDismissMock).toHaveBeenCalled();
      
      // Second notification should still be visible
      expect(screen.getByText('Stack Test 2')).toBeInTheDocument();
    });
  });

  describe('Municipal Network Performance', () => {
    it('renders efficiently with complex content', () => {
      const startTime = performance.now();
      
      const complexContent = Array.from({ length: 100 }, (_, i) => `Rad ${i + 1}`).join('\n');
      
      renderWithChakra(
        <MunicipalToastNotification 
          type="info"
          title="Performance Test"
          message={complexContent}
          municipality="malmö"
          isVisible={true}
          actions={Array.from({ length: 5 }, (_, i) => ({
            label: `Åtgärd ${i + 1}`,
            onClick: vi.fn(),
            variant: i % 2 === 0 ? 'primary' : 'secondary'
          }))}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within performance budget
      expect(renderTime).toBeLessThan(100); // 100ms budget
      
      const toast = screen.getByTestId('municipal-toast-notification');
      expect(toast).toBeInTheDocument();
    });

    it('handles rapid show/hide cycles efficiently', () => {
      const { rerender } = renderWithChakra(
        <MunicipalToastNotification 
          type="success"
          title="Rapid Toggle Test"
          message="Testing rapid visibility changes"
          municipality="malmö"
          isVisible={false}
        />
      );

      const startTime = performance.now();
      
      // Rapidly toggle visibility
      for (let i = 0; i < 20; i++) {
        rerender(
          <ChakraProvider>
            <MunicipalToastNotification 
              type="success"
              title="Rapid Toggle Test"
              message="Testing rapid visibility changes"
              municipality="malmö"
              isVisible={i % 2 === 0}
            />
          </ChakraProvider>
        );
      }

      const endTime = performance.now();
      const toggleTime = endTime - startTime;
      
      // Should handle rapid toggles efficiently
      expect(toggleTime).toBeLessThan(300); // 300ms for 20 toggles
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles missing required props gracefully', () => {
      // Should not crash with minimal props
      expect(() => {
        renderWithChakra(
          <MunicipalToastNotification 
            isVisible={true}
          />
        );
      }).not.toThrow();
      
      const toast = screen.getByTestId('municipal-toast-notification');
      expect(toast).toBeInTheDocument();
    });

    it('handles very long messages appropriately', () => {
      const longMessage = 'Detta är ett mycket långt meddelande som sträcker sig över flera rader och testar hur komponenten hanterar längre textinnehåll utan att förstöra layouten eller användarupplevelsen.'.repeat(5);
      
      renderWithChakra(
        <MunicipalToastNotification 
          type="info"
          title="Långt meddelande"
          message={longMessage}
          municipality="malmö"
          isVisible={true}
        />
      );

      const toast = screen.getByTestId('municipal-toast-notification');
      expect(toast).toBeInTheDocument();
      
      // Should handle text overflow gracefully
      const messageElement = screen.getByText(longMessage);
      expect(messageElement).toBeInTheDocument();
    });

    it('handles invalid municipality fallback', () => {
      renderWithChakra(
        <MunicipalToastNotification 
          type="error"
          title="Invalid Municipality Test"
          message="Testing with invalid municipality"
          municipality="nonexistent"
          isVisible={true}
        />
      );

      const toast = screen.getByTestId('municipal-toast-notification');
      
      // Should use default styling
      expect(toast).toHaveAttribute('data-municipality', 'default');
    });
  });
});