/**
 * Municipal Progress Indicator Component Tests
 * Task: proposal-028 - Component Testing Infrastructure
 * Priority: P0 - CRITICAL (Municipal-facing)
 * 
 * Tests municipal branding, accessibility, and Swedish context
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import MunicipalProgressIndicator from '../../../components/progress/MunicipalProgressIndicator';

// Mock framer-motion for stable testing
vi.mock('framer-motion', () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    circle: vi.fn(({ children, ...props }) => <circle {...props}>{children}</circle>),
  },
  AnimatePresence: vi.fn(({ children }) => children),
}));


describe('MunicipalProgressIndicator', () => {
  describe('Municipal Branding Compliance', () => {
    it('displays Malmö municipal styling', () => {
      renderWithChakra(
        <MunicipalProgressIndicator 
          progress={50} 
          municipality="malmö"
          title="GDPR Utbildning"
        />
      );

      // Check for municipal progress container
      expect(progressContainer).toBeInTheDocument();
      
      // Verify Malmö branding elements
      expect(progressContainer).toHaveAttribute('data-municipality', 'malmö');
    });

    it('applies correct Malmö brand colors', () => {
      renderWithChakra(
        <MunicipalProgressIndicator 
          progress={75} 
          municipality="malmö"
          title="Digitaliseringsstrategi"
        />
      );

      expect(progressBar).toBeInTheDocument();
      
      // Verify progress value
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('displays Swedish language content correctly', () => {
      renderWithChakra(
        <MunicipalProgressIndicator 
          progress={30} 
          municipality="malmö"
          title="Säkerhetsutbildning"
          subtitle="Genomförd: 3 av 10 moduler"
        />
      );

      // Verify Swedish text rendering
      expect(screen.getByText('Säkerhetsutbildning')).toBeInTheDocument();
      expect(screen.getByText('Genomförd: 3 av 10 moduler')).toBeInTheDocument();
      
      // Check for Swedish progress indication
      expect(screen.getByText('30%')).toBeInTheDocument();
    });

    it('handles multiple municipality contexts', () => {
      const { rerender } = renderWithChakra(
        <MunicipalProgressIndicator 
          progress={60} 
          municipality="stockholm"
          title="E-förvaltning"
        />
      );

      expect(screen.getByTestId('municipal-progress-indicator'))
        .toHaveAttribute('data-municipality', 'stockholm');

      // Test switching municipalities
      rerender(
        <ChakraProvider>
          <MunicipalProgressIndicator 
            progress={60} 
            municipality="göteborg"
            title="E-förvaltning"
          />
        </ChakraProvider>
      );

      expect(screen.getByTestId('municipal-progress-indicator'))
        .toHaveAttribute('data-municipality', 'göteborg');
    });
  });

  describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
    it('provides proper ARIA labels and roles', () => {
      renderWithChakra(
        <MunicipalProgressIndicator 
          progress={45} 
          municipality="malmö"
          title="GDPR Compliance Training"
          subtitle="Modul 4 av 8 komplett"
        />
      );

      expect(progressBar).toHaveAttribute('aria-label', 'GDPR Compliance Training framsteg');
      expect(progressBar).toHaveAttribute('aria-describedby');
      
      // Check for description
      expect(description).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      renderWithChakra(
        <MunicipalProgressIndicator 
          progress={70} 
          municipality="malmö"
          title="Interaktiv Utbildning"
          interactive={true}
        />
      );

      
      // Should be focusable if interactive
      expect(progressContainer).toHaveAttribute('tabIndex', '0');
      
      // Test keyboard focus
      progressContainer.focus();
      expect(progressContainer).toHaveFocus();
    });

    it('provides screen reader announcements for progress changes', () => {
      const { rerender } = renderWithChakra(
        <MunicipalProgressIndicator 
          progress={20} 
          municipality="malmö"
          title="Säkerhetsmodul"
          announceChanges={true}
        />
      );

      // Check for live region
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');

      // Update progress
      rerender(
        <ChakraProvider>
          <MunicipalProgressIndicator 
            progress={40} 
            municipality="malmö"
            title="Säkerhetsmodul"
            announceChanges={true}
          />
        </ChakraProvider>
      );

      // Should announce progress change
      expect(liveRegion).toHaveTextContent('Framsteg uppdaterat till 40%');
    });

    it('maintains sufficient color contrast', () => {
      renderWithChakra(
        <MunicipalProgressIndicator 
          progress={55} 
          municipality="malmö"
          title="Accessibility Test"
        />
      );

      
      // Progress bar should have high contrast styling
      expect(progressBar).toHaveStyle({
        // These styles should provide sufficient contrast
        border: expect.stringContaining('1px'),
      });
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
        <MunicipalProgressIndicator 
          progress={80} 
          municipality="malmö"
          title="Motion Reduced Test"
          animated={true}
        />
      );

      expect(progressContainer).toHaveAttribute('data-reduced-motion', 'true');
    });
  });

  describe('Interactive Features', () => {
    it('handles click events when interactive', () => {
      
      renderWithChakra(
        <MunicipalProgressIndicator 
          progress={35} 
          municipality="malmö"
          title="Klickbar Progress"
          interactive={true}
          onClick={onClickMock}
        />
      );

      fireEvent.click(progressContainer);
      
      expect(onClickMock).toHaveBeenCalledWith(35);
    });

    it('displays detailed progress information on hover', () => {
      renderWithChakra(
        <MunicipalProgressIndicator 
          progress={65} 
          municipality="malmö"
          title="Hover Information"
          showDetails={true}
          totalSteps={10}
          completedSteps={6}
        />
      );

      
      // Hover to show details
      fireEvent.mouseEnter(progressContainer);
      
      // Should show detailed information
      expect(screen.getByText('6 av 10 steg klara')).toBeInTheDocument();
      expect(screen.getByText('4 steg kvar')).toBeInTheDocument();
    });

    it('supports step-by-step navigation', () => {
      
      renderWithChakra(
        <MunicipalProgressIndicator 
          progress={40} 
          municipality="malmö"
          title="Steg-för-steg Navigation"
          showSteps={true}
          totalSteps={5}
          completedSteps={2}
          onStepClick={onStepClickMock}
        />
      );

      // Should show individual step indicators
      expect(steps).toHaveLength(5);
      
      // Test clicking on a specific step
      fireEvent.click(steps[3]); // Click step 4
      expect(onStepClickMock).toHaveBeenCalledWith(4);
    });
  });

  describe('Municipal Network Performance', () => {
    it('renders efficiently with large datasets', () => {
      
      renderWithChakra(
        <MunicipalProgressIndicator 
          progress={90} 
          municipality="malmö"
          title="Performance Test"
          showSteps={true}
          totalSteps={100}
          completedSteps={90}
        />
      );

      
      // Should render within performance budget for municipal networks
      expect(renderTime).toBeLessThan(100); // 100ms budget
      
      // Verify all steps are rendered
      expect(progressContainer).toBeInTheDocument();
    });

    it('handles frequent progress updates efficiently', () => {
      const { rerender } = renderWithChakra(
        <MunicipalProgressIndicator 
          progress={0} 
          municipality="malmö"
          title="Rapid Updates Test"
        />
      );

      
      // Simulate frequent updates
      for (let i = 1; i <= 100; i += 10) {
        rerender(
          <ChakraProvider>
            <MunicipalProgressIndicator 
              progress={i} 
              municipality="malmö"
              title="Rapid Updates Test"
            />
          </ChakraProvider>
        );
      }

      
      // Should handle rapid updates efficiently
      expect(updateTime).toBeLessThan(500); // 500ms for 10 updates
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles invalid progress values gracefully', () => {
      renderWithChakra(
        <MunicipalProgressIndicator 
          progress={150} // Invalid: over 100%
          municipality="malmö"
          title="Error Handling Test"
        />
      );

      
      // Should clamp to valid range
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('handles negative progress values', () => {
      renderWithChakra(
        <MunicipalProgressIndicator 
          progress={-10} // Invalid: negative
          municipality="malmö"
          title="Negative Progress Test"
        />
      );

      
      // Should clamp to minimum value
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('provides fallback when municipality is not specified', () => {
      renderWithChakra(
        <MunicipalProgressIndicator 
          progress={50} 
          title="Generic Progress"
        />
      );

      
      // Should use default styling
      expect(progressContainer).toHaveAttribute('data-municipality', 'default');
    });

    it('handles missing title gracefully', () => {
      renderWithChakra(
        <MunicipalProgressIndicator 
          progress={75} 
          municipality="malmö"
        />
      );

      
      // Should have default accessible label
      expect(progressBar).toHaveAttribute('aria-label', 'Framsteg indikator');
    });
  });

  describe('Mobile and Touch Support', () => {
    it('provides appropriate touch targets for mobile', () => {
      renderWithChakra(
        <MunicipalProgressIndicator 
          progress={60} 
          municipality="malmö"
          title="Mobile Touch Test"
          interactive={true}
        />
      );

      
      // Should meet minimum touch target size
      expect(progressContainer).toHaveStyle({
        minHeight: '44px', // iOS minimum
        minWidth: '44px'
      });
    });

    it('handles touch gestures appropriately', () => {
      
      renderWithChakra(
        <MunicipalProgressIndicator 
          progress={45} 
          municipality="malmö"
          title="Touch Gesture Test"
          interactive={true}
          onTouch={onTouchMock}
        />
      );

      
      // Simulate touch events
      fireEvent.touchStart(progressContainer);
      fireEvent.touchEnd(progressContainer);
      
      expect(onTouchMock).toHaveBeenCalled();
    });
  });
});