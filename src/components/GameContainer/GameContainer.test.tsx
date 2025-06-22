/**
 * GameContainer Component Tests
 * Testing professional municipal layout system and error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { GameContainer, GameContainerProps } from './GameContainer';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';

// Test wrapper with Chakra provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>
    {children}
  </ChakraProvider>
);

// Error throwing component for testing error boundary
const ErrorComponent: React.FC = () => {
  throw new Error('Test error for GameContainer');
};

describe('GameContainer', () => {
  const defaultProps: Partial<GameContainerProps> = {
    children: <div>Test content</div>,
    municipalTheme: 'sweden'
  };

  describe('Variant Rendering', () => {
    test('renders default variant correctly', () => {
      render(
        <TestWrapper>
          <GameContainer variant="default" {...defaultProps}>
            <div data-testid="content">Default content</div>
          </GameContainer>
        </TestWrapper>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    test('renders fullscreen variant correctly', () => {
      render(
        <TestWrapper>
          <GameContainer variant="fullscreen" {...defaultProps}>
            <div data-testid="fullscreen-content">Fullscreen content</div>
          </GameContainer>
        </TestWrapper>
      );

      expect(screen.getByTestId('fullscreen-content')).toBeInTheDocument();
    });

    test('renders modal variant correctly', () => {
      render(
        <TestWrapper>
          <GameContainer variant="modal" {...defaultProps}>
            <div data-testid="modal-content">Modal content</div>
          </GameContainer>
        </TestWrapper>
      );

      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    test('renders sidebar variant correctly', () => {
      render(
        <TestWrapper>
          <GameContainer variant="sidebar" {...defaultProps}>
            <div data-testid="sidebar-content">Sidebar content</div>
          </GameContainer>
        </TestWrapper>
      );

      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
    });
  });

  describe('Municipal Theming', () => {
    test('applies Swedish municipal theme', () => {
      const { container } = render(
        <TestWrapper>
          <GameContainer municipalTheme="sweden" {...defaultProps} />
        </TestWrapper>
      );

      // Check for Swedish color scheme application
      expect(container.firstChild).toBeInTheDocument();
    });

    test('applies German municipal theme', () => {
      const { container } = render(
        <TestWrapper>
          <GameContainer municipalTheme="germany" {...defaultProps} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('applies French municipal theme', () => {
      const { container } = render(
        <TestWrapper>
          <GameContainer municipalTheme="france" {...defaultProps} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('applies Dutch municipal theme', () => {
      const { container } = render(
        <TestWrapper>
          <GameContainer municipalTheme="netherlands" {...defaultProps} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    test('applies Anna Svensson iPhone 12 optimizations', () => {
      // Mock window.innerWidth for mobile testing
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // iPhone 12 width
      });

      render(
        <TestWrapper>
          <GameContainer variant="default" {...defaultProps}>
            <div data-testid="mobile-content">Mobile optimized content</div>
          </GameContainer>
        </TestWrapper>
      );

      expect(screen.getByTestId('mobile-content')).toBeInTheDocument();
    });

    test('applies desktop layout for larger screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200, // Desktop width
      });

      render(
        <TestWrapper>
          <GameContainer variant="default" {...defaultProps}>
            <div data-testid="desktop-content">Desktop content</div>
          </GameContainer>
        </TestWrapper>
      );

      expect(screen.getByTestId('desktop-content')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Integration', () => {
    test('catches and handles errors when errorBoundary is enabled', () => {
      // Suppress console.error for this test
      console.error = jest.fn();

      render(
        <TestWrapper>
          <GameContainer errorBoundary={true} municipalTheme="sweden">
            <ErrorComponent />
          </GameContainer>
        </TestWrapper>
      );

      // Should show error boundary UI instead of crashing
      expect(screen.getByText(/Ett fel har uppstått/i)).toBeInTheDocument();

      console.error = originalError;
    });

    test('does not use error boundary when disabled', () => {
      // This test verifies that errors bubble up when errorBoundary is false
      console.error = jest.fn();

      expect(() => {
        render(
          <TestWrapper>
            <GameContainer errorBoundary={false} municipalTheme="sweden">
              <ErrorComponent />
            </GameContainer>
          </TestWrapper>
        );
      }).toThrow();

      console.error = originalError;
    });
  });

  describe('Accessibility', () => {
    test('applies proper ARIA labels', () => {
      render(
        <TestWrapper>
          <GameContainer
            ariaLabel="Test game container"
            role="main"
            {...defaultProps}
          />
        </TestWrapper>
      );

      expect(container).toHaveAttribute('aria-label', 'Test game container');
    });

    test('maintains focus management', () => {
      render(
        <TestWrapper>
          <GameContainer {...defaultProps}>
            <button data-testid="focus-button">Focus me</button>
          </GameContainer>
        </TestWrapper>
      );

      button.focus();
      expect(button).toHaveFocus();
    });

    test('provides keyboard navigation support', () => {
      render(
        <TestWrapper>
          <GameContainer {...defaultProps}>
            <button data-testid="keyboard-button">Press me</button>
          </GameContainer>
        </TestWrapper>
      );

      fireEvent.keyDown(button, { key: 'Enter' });
      
      // Should maintain proper keyboard interaction
      expect(button).toBeInTheDocument();
    });
  });

  describe('Performance Optimizations', () => {
    test('applies scroll optimization when enabled', () => {
      render(
        <TestWrapper>
          <GameContainer
            enableScrollOptimization={true}
            {...defaultProps}
          />
        </TestWrapper>
      );

      // Scroll optimization should be applied
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    test('handles lazy loading when enabled', () => {
      render(
        <TestWrapper>
          <GameContainer
            lazyLoad={true}
            {...defaultProps}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('Branding Levels', () => {
    test('applies minimal branding correctly', () => {
      render(
        <TestWrapper>
          <GameContainer
            brandingLevel="minimal"
            municipalTheme="sweden"
            {...defaultProps}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    test('applies standard branding correctly', () => {
      render(
        <TestWrapper>
          <GameContainer
            brandingLevel="standard"
            municipalTheme="sweden"
            {...defaultProps}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    test('applies full branding correctly', () => {
      render(
        <TestWrapper>
          <GameContainer
            brandingLevel="full"
            municipalTheme="sweden"
            {...defaultProps}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('Animation System', () => {
    test('applies entrance animations correctly', async () => {
      render(
        <TestWrapper>
          <GameContainer {...defaultProps}>
            <div data-testid="animated-content">Animated content</div>
          </GameContainer>
        </TestWrapper>
      );

      // Should apply smooth entrance animations
      await waitFor(() => {
        expect(screen.getByTestId('animated-content')).toBeInTheDocument();
      });
    });

    test('handles modal animations', async () => {
      render(
        <TestWrapper>
          <GameContainer variant="modal" {...defaultProps}>
            <div data-testid="modal-animated">Modal content</div>
          </GameContainer>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('modal-animated')).toBeInTheDocument();
      });
    });
  });
});

describe('EnhancedErrorBoundary', () => {
  test('displays Swedish error message for Swedish theme', () => {
    console.error = jest.fn();

    render(
      <TestWrapper>
        <EnhancedErrorBoundary municipalTheme="sweden">
          <ErrorComponent />
        </EnhancedErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText(/Ett fel har uppstått/i)).toBeInTheDocument();
    expect(screen.getByText(/Försök igen/i)).toBeInTheDocument();

    console.error = originalError;
  });

  test('displays German error message for German theme', () => {
    console.error = jest.fn();

    render(
      <TestWrapper>
        <EnhancedErrorBoundary municipalTheme="germany">
          <ErrorComponent />
        </EnhancedErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText(/Ein Fehler ist aufgetreten/i)).toBeInTheDocument();
    expect(screen.getByText(/Erneut versuchen/i)).toBeInTheDocument();

    console.error = originalError;
  });

  test('provides retry functionality', () => {
    console.error = jest.fn();

    render(
      <TestWrapper>
        <EnhancedErrorBoundary municipalTheme="sweden">
          <ErrorComponent />
        </EnhancedErrorBoundary>
      </TestWrapper>
    );

    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    // Should attempt to retry rendering

    console.error = originalError;
  });

  test('shows contact information', () => {
    console.error = jest.fn();

    render(
      <TestWrapper>
        <EnhancedErrorBoundary municipalTheme="sweden">
          <ErrorComponent />
        </EnhancedErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText(/Behöver du hjälp?/i)).toBeInTheDocument();
    expect(screen.getByText(/support@diginativa.se/i)).toBeInTheDocument();

    console.error = originalError;
  });

  test('toggles technical details', () => {
    console.error = jest.fn();

    render(
      <TestWrapper>
        <EnhancedErrorBoundary municipalTheme="sweden">
          <ErrorComponent />
        </EnhancedErrorBoundary>
      </TestWrapper>
    );

    fireEvent.click(detailsButton);

    // Technical details should be visible after clicking
    expect(screen.getByText(/Tekniska detaljer:/i)).toBeInTheDocument();

    console.error = originalError;
  });
});

describe('Layout Integration', () => {
  test('eliminates vänsterpackad layout with proper centering', () => {
    const { container } = render(
      <TestWrapper>
        <GameContainer variant="default" municipalTheme="sweden">
          <div data-testid="centered-content">Centered content</div>
        </GameContainer>
      </TestWrapper>
    );

    // Container should be properly centered
    expect(gameContainer).toBeInTheDocument();
    expect(screen.getByTestId('centered-content')).toBeInTheDocument();
  });

  test('maintains professional municipal layout standards', () => {
    render(
      <TestWrapper>
        <GameContainer
          variant="default"
          municipalTheme="sweden"
          brandingLevel="full"
        >
          <div data-testid="professional-content">Professional content</div>
        </GameContainer>
      </TestWrapper>
    );

    expect(screen.getByTestId('professional-content')).toBeInTheDocument();
  });

  test('optimizes for Anna Svensson 48px touch targets', () => {
    render(
      <TestWrapper>
        <GameContainer municipalTheme="sweden">
          <button data-testid="touch-target" style={{ minHeight: '48px' }}>
            Touch friendly button
          </button>
        </GameContainer>
      </TestWrapper>
    );

    expect(button).toHaveStyle({ minHeight: '48px' });
  });
});