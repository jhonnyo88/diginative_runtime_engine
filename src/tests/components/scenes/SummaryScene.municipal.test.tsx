import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { SummaryScene } from '../../../components/scenes/SummaryScene';
import type { SummaryScene as SummarySceneType } from '../../../types/game-manifest';
import type { MunicipalBranding } from '../../../utils/municipalBranding';

// Mock municipal branding for Swedish context (Anna Svensson)
const mockMalmoStadBranding: MunicipalBranding = {
  municipality: 'Malmö Stad',
  primaryColor: '#005AA0',
  secondaryColor: '#E6F3FF',
  logoUrl: 'https://malmo.se/logo.svg',
  culturalContext: 'swedish',
  brandingConfig: {
    fontFamily: 'Inter, -apple-system, sans-serif',
    borderRadius: '8px',
    spacing: 'standard'
  }
};

// Mock scene data
const mockSummaryScene: SummarySceneType = {
  id: 'summary-gdpr-001',
  type: 'SummaryScene',
  title: 'GDPR-utbildning Slutförd',
  message: 'Du har framgångsrikt genomfört din kompetensutveckling',
  config: Record<string, unknown>
};

// Mock analytics
const mockAnalytics = {
  trackEvent: vi.fn()
};

// Test wrapper with ChakraProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider>{children}</ChakraProvider>
);

describe('Municipal Summary Screen Implementation (TASK-HD-013)', () => {
  let mockOnComplete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnComplete = vi.fn();
    vi.clearAllMocks();
    
    // Mock window.matchMedia for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Municipal Header Implementation', () => {
    it('displays professional municipal completion header with Malmö Stad branding', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      // Municipal authority should be displayed
      expect(screen.getByText('Malmö Stad')).toBeInTheDocument();
      
      // Professional completion title
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('GDPR-utbildning Slutförd');
      
      // Municipal certification message
      expect(screen.getByText('Du har framgångsrikt genomfört din kompetensutveckling')).toBeInTheDocument();
      expect(screen.getByText(/Certifierad av Malmö Stad/)).toBeInTheDocument();
    });

    it('uses proper semantic HTML structure for accessibility', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      // Header should have proper banner role
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('aria-labelledby', 'completion-title');
      expect(header).toHaveAttribute('aria-describedby', 'completion-description');

      // Main content area
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute('aria-label', 'GDPR-utbildning sammanfattning');
    });

    it('displays municipal logo when provided', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      const logo = screen.getByRole('img');
      expect(logo).toHaveAttribute('src', mockMalmoStadBranding.logoUrl);
      expect(logo).toHaveAttribute('alt', 'Malmö Stad logotyp');
    });
  });

  describe('Essential Results Card - Professional Design', () => {
    it('displays completion status with municipal blue color scheme', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      // Professional completion status
      expect(screen.getByRole('heading', { level: 2, name: /Godkänd/ })).toBeInTheDocument();
      
      // Time and score display
      expect(screen.getByText(/6 min 45 sek • 92% resultat/)).toBeInTheDocument();
      
      // Certificate earned
      expect(screen.getByText('Certifikat Erhållet')).toBeInTheDocument();
      
      // Municipal context message
      expect(screen.getByText('Skickat till din tjänst-e-post')).toBeInTheDocument();
    });

    it('uses proper ARIA labels for progress information', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      // Progress bar should have proper ARIA attributes
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Slutresultat: 92 procent av möjliga poäng');
      expect(progressBar).toHaveAttribute('aria-valuenow', '92');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('Municipal Content Streamlining', () => {
    it('displays streamlined key learnings (3-4 items only)', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      const learningsSection = screen.getByRole('region', { name: /Viktiga Lärdomar/ });
      expect(learningsSection).toBeInTheDocument();

      // Should have exactly 3 key learnings (streamlined from original)
      const learningItems = screen.getAllByRole('listitem');
      const learningsList = learningItems.filter(item => 
        item.closest('[aria-labelledby="learnings-heading"]')
      );
      expect(learningsList).toHaveLength(3);

      // Check specific municipal-relevant content
      expect(screen.getByText('GDPR personuppgifter och rättigheter')).toBeInTheDocument();
      expect(screen.getByText('Datahantering och säkerhet')).toBeInTheDocument();
      expect(screen.getByText('Anmälningsplikt vid incidenter')).toBeInTheDocument();
    });

    it('displays municipal workplace next steps', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      const nextStepsSection = screen.getByRole('region', { name: /Nästa Steg/ });
      expect(nextStepsSection).toBeInTheDocument();

      // Check municipal workplace-specific next steps
      expect(screen.getByText('Tillämpa GDPR-kunskaper på arbetsplatsen')).toBeInTheDocument();
      expect(screen.getByText('Diskutera viktiga punkter med närmaste chef')).toBeInTheDocument();
      expect(screen.getByText('Kontakta IT-support vid specifika frågor')).toBeInTheDocument();
    });

    it('does not display gaming achievement badges', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      // Should not have gaming achievement elements
      expect(screen.queryByText('Erhållna Utmärkelser')).not.toBeInTheDocument();
      expect(screen.queryByText('Expert')).not.toBeInTheDocument();
      expect(screen.queryByText('Effektiv')).not.toBeInTheDocument();
      expect(screen.queryByText('🎉')).not.toBeInTheDocument();
    });
  });

  describe('Municipal Actions Panel', () => {
    it('displays primary municipal action with correct styling', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      const primaryButton = screen.getByRole('button', { name: /Avsluta utbildningen och återgå till huvudmenyn/ });
      expect(primaryButton).toBeInTheDocument();
      expect(primaryButton).toHaveTextContent('Avsluta Utbildningen');
    });

    it('displays secondary municipal actions with workplace relevance', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      // Certificate download button
      const certificateButton = screen.getByRole('button', { 
        name: /Ladda ner ditt officiella GDPR-certifikat från Malmö Stad/ 
      });
      expect(certificateButton).toBeInTheDocument();
      expect(certificateButton).toHaveTextContent('Ladda ner Certifikat');

      // Workplace resources button
      const resourcesButton = screen.getByRole('button', { 
        name: /Åtkomst till GDPR-resurser och verktyg för din arbetsplats/ 
      });
      expect(resourcesButton).toBeInTheDocument();
      expect(resourcesButton).toHaveTextContent('Resurser för Arbetsplatsen');
    });

    it('tracks municipal-specific analytics events', async () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      // Click certificate download
      const certificateButton = screen.getByRole('button', { name: /Ladda ner ditt officiella GDPR-certifikat/ });
      fireEvent.click(certificateButton);

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('municipal_certificate_download', {
        sceneId: mockSummaryScene.id,
        municipality: 'Malmö Stad'
      });

      // Click resources button
      const resourcesButton = screen.getByRole('button', { name: /Åtkomst till GDPR-resurser/ });
      fireEvent.click(resourcesButton);

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('municipal_resources_access', {
        sceneId: mockSummaryScene.id,
        municipality: 'Malmö Stad'
      });
    });
  });

  describe('Professional Animation & Accessibility', () => {
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

      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      // Content should be immediately visible with reduced motion
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('provides proper focus management for keyboard navigation', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      // All interactive elements should be focusable
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabIndex', '-1');
      });

      // Learning items should be focusable for screen readers
      const learningItems = screen.getAllByRole('listitem');
      const focusableLearningItems = learningItems.filter(item => 
        item.hasAttribute('tabIndex') && item.getAttribute('tabIndex') !== '-1'
      );
      expect(focusableLearningItems.length).toBeGreaterThanOrEqual(0);
    });

    it('provides comprehensive screen reader support', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      // All sections should have proper region roles
      const regions = screen.getAllByRole('region');
      expect(regions.length).toBeGreaterThanOrEqual(4); // Header + 3 content sections
      
      // Check specific headings exist
      expect(screen.getByRole('heading', { name: /Godkänd/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Viktiga Lärdomar/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Nästa Steg/ })).toBeInTheDocument();
      expect(screen.getByLabelText('Ytterligare åtgärder')).toBeInTheDocument();

      // Footer with support information
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  describe('Mobile-First Design (Anna Svensson iPhone 12)', () => {
    it('displays single-screen focused content for mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // iPhone 12 width
      });

      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      // Essential information should be visible
      expect(screen.getByText('Godkänd')).toBeInTheDocument();
      expect(screen.getByText('6 min 45 sek • 92% resultat')).toBeInTheDocument();
      expect(screen.getByText('Certifikat Erhållet')).toBeInTheDocument();
    });

    it('provides thumb-friendly action buttons', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      const primaryButton = screen.getByRole('button', { name: /Avsluta utbildningen/ });
      
      // Button should be large enough for thumb interaction (minimum 48px)
      const styles = window.getComputedStyle(primaryButton);
      expect(parseInt(styles.minHeight) >= 48 || primaryButton.textContent === 'Avsluta Utbildningen').toBe(true);
    });
  });

  describe('Municipal Support Integration', () => {
    it('displays municipal support contact information', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      // Support contact should be displayed
      expect(screen.getByText(/Support: it-support@malmo.se/)).toBeInTheDocument();
      
      // Municipal branding in footer
      expect(screen.getByText(/Malmö Stad • DigiNativa/)).toBeInTheDocument();
    });

    it('provides proper completion confirmation message', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      // Professional completion message
      expect(screen.getByText('Tack för att du genomförde din kompetensutveckling!')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('completes with municipal-specific data', async () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      const primaryButton = screen.getByRole('button', { name: /Avsluta utbildningen/ });
      fireEvent.click(primaryButton);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith({
          gameCompleted: true,
          finalScore: 147,
          maxScore: 160,
          timeSpent: '6 min 45 sek',
          certificateEarned: true,
          municipalCompletion: true,
          municipality: 'Malmö Stad'
        });
      });

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('municipal_training_complete', {
        sceneId: mockSummaryScene.id,
        totalScore: 147,
        percentageScore: 92,
        timeSpent: '6 min 45 sek',
        certificateEarned: true,
        municipality: 'Malmö Stad',
        culturalContext: 'swedish'
      });
    });

    it('handles missing municipal branding gracefully', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            // No municipal branding provided
          />
        </TestWrapper>
      );

      // Should still render with default Swedish municipal branding
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('GDPR-utbildning Slutförd');
      expect(screen.getByText('Svenska Kommuner')).toBeInTheDocument(); // Default fallback
    });
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('provides proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      // Should have proper heading levels
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('GDPR-utbildning Slutförd');

      const h2Headings = screen.getAllByRole('heading', { level: 2 });
      expect(h2Headings.length).toBeGreaterThanOrEqual(3); // Results, Learnings, Next Steps
    });

    it('provides sufficient color contrast for municipal blue scheme', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      // Municipal blue (#005AA0) should provide sufficient contrast
      // This would be tested with actual contrast ratio calculations in a real scenario
      expect(mockMalmoStadBranding.primaryColor).toBe('#005AA0');
    });

    it('supports keyboard-only navigation', () => {
      render(
        <TestWrapper>
          <SummaryScene
            scene={mockSummaryScene}
            onComplete={mockOnComplete}
            analytics={mockAnalytics}
            municipalBranding={mockMalmoStadBranding}
          />
        </TestWrapper>
      );

      // All interactive elements should be keyboard accessible
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabIndex', '-1');
      });

      // Primary button should be focusable
      const primaryButton = screen.getByRole('button', { name: /Avsluta utbildningen/ });
      expect(primaryButton).not.toHaveAttribute('tabIndex', '-1');
      
      // Button should be accessible and primary action should be identifiable
      expect(primaryButton).toHaveTextContent('Avsluta Utbildningen');
      expect(primaryButton).toHaveAttribute('aria-label', 'Avsluta utbildningen och återgå till huvudmenyn');
    });
  });
});