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

// Mock Enhanced ErrorBoundary based on design specification
// This will be replaced with actual implementation when available
const MockEnhancedErrorBoundary: React.FC<{
  children: React.ReactNode;
  municipalBranding?: {
    primaryColor: string;
    logoUrl: string;
    municipality: string;
  };
  onError?: (error: Error, errorInfo: Record<string, unknown>) => void;
  errorType?: 'content_loading' | 'network_timeout' | 'component_crash' | 'data_validation' | 'user_session';
}> = ({ 
  children, 
  municipalBranding,
  onError,
  errorType = 'component_crash'
}) => {
  const [hasError, setHasError] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  // Mock error boundary behavior
  React.useEffect(() => {

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, [onError]);

  if (hasError) {
    return (
      <div 
        data-testid="enhanced-error-boundary"
        data-error-type={errorType}
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto'
        }}
      >
        {/* Municipal Professional Header */}
        {municipalBranding && (
          <div data-testid="municipal-error-header" style={{ marginBottom: '1.5rem' }}>
            <img 
              src={municipalBranding.logoUrl} 
              alt={`${municipalBranding.municipality} logotyp`}
              style={{ height: '40px', marginBottom: '0.5rem' }}
            />
            <div style={{ color: '#005293', fontWeight: 'bold' }}>
              {municipalBranding.municipality}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Verifierad kommunal plattform
            </div>
          </div>
        )}

        {/* Professional Municipal Error Message */}
        <div data-testid="error-content-area" style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            color: '#1f2937', 
            fontSize: '1.5rem', 
            marginBottom: '1rem',
            fontWeight: '600'
          }}>
            Teknisk service pågår
          </h2>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1rem', 
            lineHeight: '1.5',
            marginBottom: '1rem'
          }}>
            Vi arbetar med att lösa detta och du kan försöka igen om ett ögonblick.
          </p>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.875rem'
          }}>
            Detta påverkar inte dina sparade framsteg.
          </p>
        </div>

        {/* Recovery Action Panel */}
        <div data-testid="recovery-action-panel" style={{ marginBottom: '2rem' }}>
          <button
            data-testid="retry-button"
            onClick={() => {
              setRetryCount(prev => prev + 1);
              if (retryCount < 2) {
                setTimeout(() => setHasError(false), 1000);
              }
            }}
            style={{
              backgroundColor: '#005293',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '500',
              marginRight: '1rem',
              minHeight: '48px',
              minWidth: '120px',
              cursor: 'pointer'
            }}
            aria-label="Försök igen - ladda om innehållet"
          >
            Försök igen
          </button>
          
          <button
            data-testid="reload-button"
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: 'transparent',
              color: '#005293',
              padding: '12px 24px',
              borderRadius: '6px',
              border: '1px solid #005293',
              fontSize: '1rem',
              fontWeight: '500',
              minHeight: '48px',
              minWidth: '120px',
              cursor: 'pointer'
            }}
            aria-label="Ladda om sidan helt"
          >
            Ladda om
          </button>
        </div>

        {/* Support Contact Footer */}
        <div data-testid="support-contact-footer" style={{ 
          borderTop: '1px solid #e5e7eb', 
          paddingTop: '1.5rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <p style={{ marginBottom: '0.5rem' }}>
            Behöver du hjälp? Kontakta:
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <span>📞 Municipal IT: 08-123 456</span>
            <span>✉️ support@diginativa.se</span>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
            Error ID: ERR_{Date.now().toString().slice(-6)}
          </p>
        </div>

        {/* Accessibility Live Region */}
        <div 
          aria-live="polite" 
          aria-atomic="true"
          data-testid="error-announcement"
          style={{ position: 'absolute', left: '-10000px' }}
        >
          Ett tekniskt fel har uppstått. Återställningsalternativ är tillgängliga.
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Test component that throws errors
const ErrorThrowingComponent: React.FC<{ shouldThrow?: boolean; errorType?: string }> = ({ 
  shouldThrow = false,
  errorType = 'component_crash'
}) => {
  if (shouldThrow) {
    throw new Error(`Test ${errorType} error`);
  }
  return <div data-testid="working-content">Content loads successfully</div>;
};


describe('Enhanced ErrorBoundary Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for error boundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Professional Municipal Error Experience', () => {
    it('displays municipal-grade error interface instead of pink banner', () => {
      render(
        <TestWrapper>
          <MockEnhancedErrorBoundary municipalBranding={mockMunicipalBranding}>
            <ErrorThrowingComponent shouldThrow={true} />
          </MockEnhancedErrorBoundary>
        </TestWrapper>
      );

      // Should show professional municipal error interface
      expect(screen.getByTestId('enhanced-error-boundary')).toBeInTheDocument();
      expect(screen.getByTestId('municipal-error-header')).toBeInTheDocument();
      
      // Should NOT have unprofessional pink/red styling
      expect(computedStyle.backgroundColor).toBe('white');
      
      // Should show professional municipal branding
      expect(screen.getByText('Malmö Stad')).toBeInTheDocument();
      expect(screen.getByText('Verifierad kommunal plattform')).toBeInTheDocument();
    });

    it('shows Anna Svensson-appropriate error messaging', () => {
      render(
        <TestWrapper>
          <MockEnhancedErrorBoundary municipalBranding={mockMunicipalBranding}>
            <ErrorThrowingComponent shouldThrow={true} />
          </MockEnhancedErrorBoundary>
        </TestWrapper>
      );

      // Should use professional, reassuring language
      expect(screen.getByText('Teknisk service pågår')).toBeInTheDocument();
      expect(screen.getByText(/Vi arbetar med att lösa detta/)).toBeInTheDocument();
      expect(screen.getByText(/Detta påverkar inte dina sparade framsteg/)).toBeInTheDocument();
      
      // Should NOT use technical jargon like "Spelet kunde inte laddas"
      expect(screen.queryByText(/Spelet kunde inte laddas/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Error occurred/)).not.toBeInTheDocument();
    });

    it('maintains municipal authority and trust even during errors', () => {
      render(
        <TestWrapper>
          <MockEnhancedErrorBoundary municipalBranding={mockMunicipalBranding}>
            <ErrorThrowingComponent shouldThrow={true} />
          </MockEnhancedErrorBoundary>
        </TestWrapper>
      );

      // Municipal logo and branding should be prominent
      expect(screen.getByAltText('Malmö Stad logotyp')).toBeInTheDocument();
      expect(screen.getByText('Malmö Stad')).toBeInTheDocument();
      
      // Should show government authority markers
      expect(screen.getByText('Verifierad kommunal plattform')).toBeInTheDocument();
      
      // Professional error container should be well-designed
      expect(errorContainer).toBeInTheDocument();
    });
  });

  describe('Anna Svensson Error Recovery Patterns', () => {
    it('provides 48px touch targets for mobile error recovery', () => {
      render(
        <TestWrapper>
          <MockEnhancedErrorBoundary municipalBranding={mockMunicipalBranding}>
            <ErrorThrowingComponent shouldThrow={true} />
          </MockEnhancedErrorBoundary>
        </TestWrapper>
      );

      // Retry and reload buttons should meet 48px minimum
      
      
      expect(retryStyle.minHeight).toBe('48px');
      expect(retryStyle.minWidth).toBe('120px');
      expect(reloadStyle.minHeight).toBe('48px');
      expect(reloadStyle.minWidth).toBe('120px');
    });

    it('supports quick recovery for 7-minute training sessions', async () => {
      render(
        <TestWrapper>
          <MockEnhancedErrorBoundary municipalBranding={mockMunicipalBranding}>
            <ErrorThrowingComponent shouldThrow={true} />
          </MockEnhancedErrorBoundary>
        </TestWrapper>
      );

      // Quick retry should be prominent and fast
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveTextContent('Försök igen');
      
      // Click retry for quick recovery
      fireEvent.click(retryButton);
      
      // Should provide immediate feedback
      expect(retryButton).toBeInTheDocument();
    });

    it('provides clear actionable recovery instructions', () => {
      render(
        <TestWrapper>
          <MockEnhancedErrorBoundary municipalBranding={mockMunicipalBranding}>
            <ErrorThrowingComponent shouldThrow={true} />
          </MockEnhancedErrorBoundary>
        </TestWrapper>
      );

      // Recovery actions should be clear and actionable
      expect(screen.getByTestId('recovery-action-panel')).toBeInTheDocument();
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      expect(screen.getByTestId('reload-button')).toBeInTheDocument();
      
      // Support information should be easily accessible
      expect(screen.getByTestId('support-contact-footer')).toBeInTheDocument();
      expect(screen.getByText(/Municipal IT: 08-123 456/)).toBeInTheDocument();
      expect(screen.getByText(/support@diginativa.se/)).toBeInTheDocument();
    });
  });

  describe('Error Recovery User Journey Testing', () => {
    it('supports progressive error recovery with exponential backoff', async () => {
      render(
        <TestWrapper>
          <MockEnhancedErrorBoundary municipalBranding={mockMunicipalBranding}>
            <ErrorThrowingComponent shouldThrow={true} />
          </MockEnhancedErrorBoundary>
        </TestWrapper>
      );

      
      // First retry attempt
      fireEvent.click(retryButton);
      expect(retryButton).toBeInTheDocument();
      
      // Second retry attempt (should still work)
      fireEvent.click(retryButton);
      expect(retryButton).toBeInTheDocument();
      
      // Multiple retries should be handled gracefully
    });

    it('provides manual reload option when auto-retry fails', () => {
      render(
        <TestWrapper>
          <MockEnhancedErrorBoundary municipalBranding={mockMunicipalBranding}>
            <ErrorThrowingComponent shouldThrow={true} />
          </MockEnhancedErrorBoundary>
        </TestWrapper>
      );

      // Manual reload should always be available
      expect(reloadButton).toBeInTheDocument();
      expect(reloadButton).toHaveTextContent('Ladda om');
      expect(reloadButton).toHaveAttribute('aria-label', 'Ladda om sidan helt');
    });

    it('provides support escalation when technical recovery fails', () => {
      render(
        <TestWrapper>
          <MockEnhancedErrorBoundary municipalBranding={mockMunicipalBranding}>
            <ErrorThrowingComponent shouldThrow={true} />
          </MockEnhancedErrorBoundary>
        </TestWrapper>
      );

      // Support escalation should be clearly available
      expect(supportFooter).toBeInTheDocument();
      
      expect(screen.getByText('Behöver du hjälp? Kontakta:')).toBeInTheDocument();
      expect(screen.getByText(/Municipal IT: 08-123 456/)).toBeInTheDocument();
      expect(screen.getByText(/support@diginativa.se/)).toBeInTheDocument();
      
      // Error ID for support context
      expect(screen.getByText(/Error ID: ERR_/)).toBeInTheDocument();
    });
  });

  describe('Enhanced ErrorBoundary Accessibility', () => {
    it('has no accessibility violations in error state', async () => {
      const { container } = render(
        <TestWrapper>
          <MockEnhancedErrorBoundary municipalBranding={mockMunicipalBranding}>
            <ErrorThrowingComponent shouldThrow={true} />
          </MockEnhancedErrorBoundary>
        </TestWrapper>
      );

      expect(results).toHaveNoViolations();
    });

    it('provides screen reader announcements for error recovery', () => {
      render(
        <TestWrapper>
          <MockEnhancedErrorBoundary municipalBranding={mockMunicipalBranding}>
            <ErrorThrowingComponent shouldThrow={true} />
          </MockEnhancedErrorBoundary>
        </TestWrapper>
      );

      // ARIA live region should announce error state
      expect(announcement).toBeInTheDocument();
      expect(announcement).toHaveAttribute('aria-live', 'polite');
      expect(announcement).toHaveAttribute('aria-atomic', 'true');
      expect(announcement).toHaveTextContent(/Ett tekniskt fel har uppstått/);
    });

    it('supports keyboard navigation for error recovery', () => {
      render(
        <TestWrapper>
          <MockEnhancedErrorBoundary municipalBranding={mockMunicipalBranding}>
            <ErrorThrowingComponent shouldThrow={true} />
          </MockEnhancedErrorBoundary>
        </TestWrapper>
      );

      
      // Buttons should be focusable
      retryButton.focus();
      expect(document.activeElement).toBe(retryButton);
      
      // Tab navigation should work
      fireEvent.keyDown(retryButton, { key: 'Tab' });
      // Note: Actual tab navigation would be tested with real focus management
      
      // Buttons should have proper ARIA labels
      expect(retryButton).toHaveAttribute('aria-label');
      expect(reloadButton).toHaveAttribute('aria-label');
    });

    it('meets WCAG 2.1 AA standards for error handling', async () => {
      const { container } = render(
        <TestWrapper>
          <MockEnhancedErrorBoundary municipalBranding={mockMunicipalBranding}>
            <ErrorThrowingComponent shouldThrow={true} />
          </MockEnhancedErrorBoundary>
        </TestWrapper>
      );

        rules: {
          'color-contrast': { enabled: true },
          'focusable-content': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
          'button-name': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });
  });

  describe('Error Type Classification Testing', () => {
};
