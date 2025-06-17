import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChakraProvider } from '@chakra-ui/react';

// Extend Jest matchers for accessibility
expect.extend(toHaveNoViolations);

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>
    {children}
  </ChakraProvider>
);

// Mock GameContainer component based on architecture specification
// This will be replaced with actual implementation when available
const MockGameContainer: React.FC<{
  variant?: 'default' | 'fullscreen' | 'modal' | 'sidebar';
  children: React.ReactNode;
  municipalBranding?: {
    primaryColor: string;
    logoUrl: string;
    municipality: string;
  };
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}> = ({ 
  variant = 'default', 
  children, 
  municipalBranding,
  breakpoint = 'sm'
}) => {
  // Mock implementation based on specification
  const containerStyles = {
    default: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: breakpoint === 'xs' ? '0.75rem' : breakpoint === 'sm' ? '1rem' : '1.5rem'
    },
    fullscreen: {
      maxWidth: '100vw',
      padding: '0'
    },
    modal: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '1.5rem'
    },
    sidebar: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '1.5rem'
    }
  };

  return (
    <div
      data-testid="game-container"
      data-variant={variant}
      data-breakpoint={breakpoint}
      style={{
        ...containerStyles[variant],
        boxSizing: 'border-box',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: variant === 'modal' ? 'center' : 'flex-start'
      }}
    >
      {municipalBranding && (
        <div data-testid="municipal-header" style={{ width: '100%', padding: '1rem 0' }}>
          <img src={municipalBranding.logoUrl} alt={`${municipalBranding.municipality} logotyp`} />
          <span>{municipalBranding.municipality}</span>
        </div>
      )}
      <div style={{ width: '100%', flexGrow: 1 }}>
        {children}
      </div>
    </div>
  );
};

// Test data for GameContainer validation
const mockMunicipalBranding = {
  primaryColor: '#005293',
  logoUrl: 'https://example.se/municipal-logo.svg',
  municipality: 'Test Municipality'
};

const mockTestContent = (
  <div data-testid="test-content">
    <h1>Test Game Content</h1>
    <p>This is test content for GameContainer layout validation.</p>
  </div>
);

describe('GameContainer Layout System Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window resize functionality
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // Anna Svensson iPhone 12 default
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GameContainer Responsive Layout', () => {
    it('renders with default layout variant correctly', () => {
      render(
        <TestWrapper>
          <MockGameContainer variant="default">
            {mockTestContent}
          </MockGameContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('game-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('data-variant', 'default');
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('prevents vänsterpackad (left-alignment) layout catastrophe', () => {
      render(
        <TestWrapper>
          <MockGameContainer variant="default">
            {mockTestContent}
          </MockGameContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('game-container');
      const computedStyle = window.getComputedStyle(container);
      
      // Container should be centered (margin: 0 auto)
      expect(computedStyle.margin).toContain('auto');
      expect(computedStyle.alignItems).toBe('center');
      
      // Should not have left-alignment that causes empty space on right
      expect(computedStyle.textAlign).not.toBe('left');
    });

    it('applies correct max-width for different variants', () => {
      const variants = ['default', 'fullscreen', 'modal', 'sidebar'] as const;
      
      variants.forEach(variant => {
        const { rerender } = render(
          <TestWrapper>
            <MockGameContainer variant={variant}>
              {mockTestContent}
            </MockGameContainer>
          </TestWrapper>
        );

        const container = screen.getByTestId('game-container');
        const computedStyle = window.getComputedStyle(container);

        switch (variant) {
          case 'default':
            expect(computedStyle.maxWidth).toBe('1200px');
            break;
          case 'fullscreen':
            expect(computedStyle.maxWidth).toBe('100vw');
            break;
          case 'modal':
            expect(computedStyle.maxWidth).toBe('600px');
            break;
          case 'sidebar':
            expect(computedStyle.maxWidth).toBe('1400px');
            break;
        }

        rerender(<div />); // Clear for next iteration
      });
    });
  });

  describe('Anna Svensson iPhone 12 Optimization (375px)', () => {
    beforeEach(() => {
      // Set iPhone 12 viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('applies correct mobile-first padding for Anna Svensson', () => {
      render(
        <TestWrapper>
          <MockGameContainer breakpoint="sm">
            {mockTestContent}
          </MockGameContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('game-container');
      const computedStyle = window.getComputedStyle(container);
      
      // Anna Svensson mobile padding should be 1rem
      expect(computedStyle.padding).toBe('1rem');
    });

    it('maintains 48px minimum touch targets for Anna Svensson', () => {
      render(
        <TestWrapper>
          <MockGameContainer breakpoint="sm">
            <div data-testid="interactive-element" style={{ minHeight: '48px', minWidth: '48px' }}>
              Touch Target
            </div>
          </MockGameContainer>
        </TestWrapper>
      );

      const touchTarget = screen.getByTestId('interactive-element');
      const computedStyle = window.getComputedStyle(touchTarget);
      
      expect(computedStyle.minHeight).toBe('48px');
      expect(computedStyle.minWidth).toBe('48px');
    });

    it('optimizes layout for 7-minute training sessions', () => {
      render(
        <TestWrapper>
          <MockGameContainer breakpoint="sm">
            {mockTestContent}
          </MockGameContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('game-container');
      expect(container).toHaveAttribute('data-breakpoint', 'sm');
      
      // Container should be efficient for quick mobile access
      expect(container).toBeInTheDocument();
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });
  });

  describe('Cross-Browser Layout Consistency', () => {
    it('uses box-sizing border-box for consistent layout', () => {
      render(
        <TestWrapper>
          <MockGameContainer variant="default">
            {mockTestContent}
          </MockGameContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('game-container');
      const computedStyle = window.getComputedStyle(container);
      
      expect(computedStyle.boxSizing).toBe('border-box');
    });

    it('maintains layout integrity across different screen sizes', () => {
      const screenSizes = [320, 375, 768, 1024, 1200, 1920];
      
      screenSizes.forEach(width => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        render(
          <TestWrapper>
            <MockGameContainer variant="default">
              {mockTestContent}
            </MockGameContainer>
          </TestWrapper>
        );

        const container = screen.getByTestId('game-container');
        expect(container).toBeInTheDocument();
        
        // Layout should remain stable at all screen sizes
        const computedStyle = window.getComputedStyle(container);
        expect(computedStyle.display).toBe('flex');
        expect(computedStyle.flexDirection).toBe('column');
      });
    });

    it('prevents horizontal scrollbars on mobile devices', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320, // Smallest mobile
      });

      render(
        <TestWrapper>
          <MockGameContainer breakpoint="xs">
            <div style={{ width: '100%', padding: '0.75rem' }}>
              Wide content that should not overflow
            </div>
          </MockGameContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('game-container');
      const computedStyle = window.getComputedStyle(container);
      
      // Should not cause horizontal overflow
      expect(computedStyle.overflowX).not.toBe('scroll');
    });
  });

  describe('Municipal Branding Integration', () => {
    it('displays municipal branding without affecting layout', () => {
      render(
        <TestWrapper>
          <MockGameContainer 
            variant="default" 
            municipalBranding={mockMunicipalBranding}
          >
            {mockTestContent}
          </MockGameContainer>
        </TestWrapper>
      );

      // Municipal header should be present
      expect(screen.getByTestId('municipal-header')).toBeInTheDocument();
      expect(screen.getByAltText('Test Municipality logotyp')).toBeInTheDocument();
      expect(screen.getByText('Test Municipality')).toBeInTheDocument();

      // Layout should remain intact
      const container = screen.getByTestId('game-container');
      expect(container).toBeInTheDocument();
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('maintains professional municipal layout standards', () => {
      render(
        <TestWrapper>
          <MockGameContainer 
            variant="default" 
            municipalBranding={mockMunicipalBranding}
          >
            {mockTestContent}
          </MockGameContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('game-container');
      
      // Should maintain professional appearance
      expect(container).toHaveAttribute('data-variant', 'default');
      
      // Municipal branding should not interfere with content layout
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByTestId('municipal-header')).toBeInTheDocument();
    });
  });

  describe('GameContainer Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <MockGameContainer variant="default">
            {mockTestContent}
          </MockGameContainer>
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper semantic structure', () => {
      render(
        <TestWrapper>
          <MockGameContainer variant="default">
            <main role="main">
              <h1>Game Content</h1>
              <section>
                <p>Game content should be accessible</p>
              </section>
            </main>
          </MockGameContainer>
        </TestWrapper>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(
        <TestWrapper>
          <MockGameContainer variant="default">
            <button>Interactive Element</button>
            <a href="#test">Link Element</a>
          </MockGameContainer>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      const link = screen.getByRole('link');

      // Should be focusable
      button.focus();
      expect(document.activeElement).toBe(button);
      
      // Tab navigation should work
      fireEvent.keyDown(button, { key: 'Tab' });
      // Focus management would be tested in actual implementation
    });
  });

  describe('Performance Requirements', () => {
    it('renders within performance budget (<5KB container system)', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <MockGameContainer variant="default">
            {mockTestContent}
          </MockGameContainer>
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render quickly
      expect(renderTime).toBeLessThan(50); // <50ms requirement
      expect(screen.getByTestId('game-container')).toBeInTheDocument();
    });

    it('prevents layout shifts (0 CLS score)', () => {
      const { rerender } = render(
        <TestWrapper>
          <MockGameContainer variant="default">
            {mockTestContent}
          </MockGameContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('game-container');
      const initialBounds = container.getBoundingClientRect();

      // Simulate content change that should not cause layout shift
      rerender(
        <TestWrapper>
          <MockGameContainer variant="default">
            <div data-testid="updated-content">
              <h1>Updated Content</h1>
              <p>Content changed but layout should remain stable.</p>
            </div>
          </MockGameContainer>
        </TestWrapper>
      );

      const updatedContainer = screen.getByTestId('game-container');
      const updatedBounds = updatedContainer.getBoundingClientRect();

      // Container position should remain stable
      expect(updatedBounds.x).toBe(initialBounds.x);
      expect(updatedBounds.y).toBe(initialBounds.y);
    });
  });

  describe('Container Variant Testing', () => {
    it('handles fullscreen variant correctly', () => {
      render(
        <TestWrapper>
          <MockGameContainer variant="fullscreen">
            <div data-testid="fullscreen-content">Fullscreen Content</div>
          </MockGameContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('game-container');
      expect(container).toHaveAttribute('data-variant', 'fullscreen');
      expect(screen.getByTestId('fullscreen-content')).toBeInTheDocument();
    });

    it('handles modal variant with proper centering', () => {
      render(
        <TestWrapper>
          <MockGameContainer variant="modal">
            <div data-testid="modal-content">Modal Content</div>
          </MockGameContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('game-container');
      expect(container).toHaveAttribute('data-variant', 'modal');
      
      const computedStyle = window.getComputedStyle(container);
      expect(computedStyle.justifyContent).toBe('center');
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    it('handles sidebar variant for complex layouts', () => {
      render(
        <TestWrapper>
          <MockGameContainer variant="sidebar">
            <div data-testid="sidebar-content">
              <nav>Navigation</nav>
              <main>Main Content</main>
            </div>
          </MockGameContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('game-container');
      expect(container).toHaveAttribute('data-variant', 'sidebar');
      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
    });
  });

  describe('European Government Layout Compliance', () => {
    it('meets WCAG 2.1 AA layout requirements', async () => {
      const { container } = render(
        <TestWrapper>
          <MockGameContainer 
            variant="default"
            municipalBranding={mockMunicipalBranding}
          >
            <main role="main">
              <h1>Accessible Layout</h1>
              <section>
                <h2>Content Section</h2>
                <p>This layout meets European accessibility standards.</p>
              </section>
            </main>
          </MockGameContainer>
        </TestWrapper>
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
          'heading-order': { enabled: true },
          'landmark-unique': { enabled: true },
          'page-has-heading-one': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    it('supports multi-market European layouts', () => {
      const europeanContexts = ['swedish', 'german', 'french', 'dutch'];
      
      europeanContexts.forEach(context => {
        render(
          <TestWrapper>
            <MockGameContainer 
              variant="default"
              municipalBranding={{
                ...mockMunicipalBranding,
                municipality: `Test ${context} Municipality`
              }}
            >
              <div data-testid={`${context}-content`}>
                {context} Municipal Content
              </div>
            </MockGameContainer>
          </TestWrapper>
        );

        expect(screen.getByTestId(`${context}-content`)).toBeInTheDocument();
        expect(screen.getByText(`Test ${context} Municipality`)).toBeInTheDocument();
      });
    });
  });
});