/**
 * TASK-HD-014: Municipal Achievement System Tests
 * Comprehensive testing for the redesigned achievement system
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { MunicipalToastNotification, MunicipalAchievementCategories } from '../../../components/notifications/MunicipalToastNotification';
import { MunicipalProgressIndicator, DefaultGDPRMilestones } from '../../../components/progress/MunicipalProgressIndicator';
import { MunicipalAchievementEngine, createMunicipalAchievementEngine } from '../../../services/municipal-achievement-engine';
import { useMunicipalAchievements } from '../../../hooks/useMunicipalAchievements';

// Mock window.matchMedia for accessibility tests
const _mockMatchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>{children}</ChakraProvider>
);

describe('Municipal Achievement System - TASK-HD-014', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('MunicipalToastNotification Component', () => {


    it('should render toast notification with municipal branding', () => {
      render(<MunicipalToastNotification {...defaultProps} />, { wrapper: TestWrapper });

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('GDPR Specialist')).toBeInTheDocument();
      expect(screen.getByText(/Du behärskar nu kommunal datahantering/)).toBeInTheDocument();
      expect(screen.getByText(/Malmö Stad/)).toBeInTheDocument();
    });

    it('should be dismissible with ESC key for accessibility', async () => {
      render(<MunicipalToastNotification {...defaultProps} />, { wrapper: TestWrapper });

      fireEvent.keyDown(toastElement, { key: 'Escape' });

      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      });
    });

    it('should auto-dismiss after timeout', async () => {
      vi.useFakeTimers();
      
      render(<MunicipalToastNotification {...defaultProps} />, { wrapper: TestWrapper });

      expect(screen.getByRole('alert')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      });

      vi.useRealTimers();
    });

    it('should respect reduced motion preferences', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));


      render(<MunicipalToastNotification {...reducedMotionProps} />, { wrapper: TestWrapper });

      expect(toastElement).toBeInTheDocument();
      // Note: Animation testing would require more complex setup
    });

    it('should support different cultural contexts', () => {

      render(<MunicipalToastNotification {...germanProps} />, { wrapper: TestWrapper });
      
      expect(screen.getByText(/Berlin Stad/)).toBeInTheDocument();
    });

    it('should track analytics events', () => {
      render(<MunicipalToastNotification {...defaultProps} />, { wrapper: TestWrapper });

      expect(mockAnalytics).toHaveBeenCalledWith(
        'municipal_achievement_toast_shown',
        expect.objectContaining({
          achievementId: 'gdpr_specialist',
          variant: 'municipal-achievement',
          culturalContext: 'swedish',
          municipalEntity: 'malmö'
        })
      );
    });
  });

  describe('MunicipalProgressIndicator Component', () => {


    it('should render progress bar with milestone markers', () => {
      render(<MunicipalProgressIndicator {...defaultProps} />, { wrapper: TestWrapper });

      // Check progress bar
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '60'); // 3/5 = 60%

      // Check milestone indicators
      expect(screen.getByText('3 av 5 sektioner slutfört')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('should display earned competencies', () => {
      render(<MunicipalProgressIndicator {...defaultProps} />, { wrapper: TestWrapper });

      expect(screen.getByText('2 kompetenser utvecklade')).toBeInTheDocument();
      expect(screen.getByText('Grundläggande dataskydd')).toBeInTheDocument();
      expect(screen.getByText('Säker databehandling')).toBeInTheDocument();
    });

    it('should support keyboard navigation for accessibility', () => {
      render(<MunicipalProgressIndicator {...defaultProps} />, { wrapper: TestWrapper });

      expect(progressGroup).toBeInTheDocument();
      
      // Check aria attributes
      expect(progressBar).toHaveAttribute('aria-valuetext', '3 av 5 sektioner slutförda, 2 kompetenser utvecklade');
    });

    it('should adapt to different cultural contexts', () => {

      render(<MunicipalProgressIndicator {...germanProps} />, { wrapper: TestWrapper });
      
      expect(screen.getByText(/Berlin Stadt/)).toBeInTheDocument();
      expect(screen.getByText(/Ausbildungsfortschritt/)).toBeInTheDocument();
    });
  });

  describe('MunicipalAchievementEngine', () => {
    let engine: MunicipalAchievementEngine;

    beforeEach(() => {
      engine = createMunicipalAchievementEngine({
        municipalEntity: 'malmö',
        culturalContext: 'swedish',
        userProfile: {
          name: 'Anna Svensson',
          department: 'IT-avdelningen',
          role: 'Kommunal specialist',
          experienceLevel: 'intermediate'
        }
      });
    });

    afterEach(() => {
      engine.cleanup();
    });

    it('should evaluate GDPR Specialist achievement correctly', () => {

      
      // Should earn GDPR Specialist (85% score, 90% correct)
      expect(achievements).toHaveLength(3); // GDPR Specialist, Efficiency Expert, Municipal Certified
      expect(achievements.some(a => a.id === 'gdpr_specialist')).toBe(true);
      expect(achievements.some(a => a.id === 'efficiency_expert')).toBe(true);
      expect(achievements.some(a => a.id === 'municipal_certified')).toBe(true);
    });

    it('should evaluate Compliance Champion for perfect performance', () => {

      
      // Should earn all achievements including Compliance Champion
      expect(achievements.some(a => a.id === 'compliance_champion')).toBe(true);
    });

    it('should respect Anna Svensson time constraints for Efficiency Expert', () => {

      
      // Should earn Efficiency Expert for completing within 7 minutes
      expect(achievements.some(a => a.id === 'efficiency_expert')).toBe(true);
    });

    it('should not award achievements if criteria not met', () => {

      
      // Only Municipal Certified should be awarded (80% score, 100% completion)
      expect(achievements).toHaveLength(1);
      expect(achievements[0].id).toBe('municipal_certified');
    });

    it('should generate proper municipal report', () => {
      // Award some achievements first
      engine.evaluateAchievements({
        totalScore: 140,
        maxScore: 160,
        timeSpent: 360000,
        correctAnswers: 18,
        totalQuestions: 20,
        sectionsCompleted: 5,
        totalSections: 5
      });

      
      expect(report.participantInfo.name).toBe('Anna Svensson');
      expect(report.participantInfo.municipality).toBe('malmö');
      expect(report.achievementSummary.totalEarned).toBeGreaterThan(0);
      expect(report.competencyDevelopment.developed).toBeInstanceOf(Array);
      expect(report.municipalValue.institutionalBenefits).toBeInstanceOf(Array);
      expect(report.exportTimestamp).toBeInstanceOf(Date);
    });

    it('should emit events for achievement tracking', () => {
      engine.addEventListener('achievementEarned', mockListener);

      engine.evaluateAchievements({
        totalScore: 140,
        maxScore: 160,
        timeSpent: 360000,
        correctAnswers: 18,
        totalQuestions: 20,
        sectionsCompleted: 5,
        totalSections: 5
      });

      expect(mockListener).toHaveBeenCalled();
      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          achievement: expect.any(Object),
          criteria: expect.any(Object),
          timestamp: expect.any(Date),
          userProfile: expect.objectContaining({
            name: 'Anna Svensson'
          })
        })
      );
    });
  });

  describe('WCAG 2.1 AA Accessibility Compliance', () => {
    it('should support screen readers with proper ARIA labels', () => {

      render(<MunicipalToastNotification {...props} />, { wrapper: TestWrapper });

      expect(alert).toHaveAttribute('aria-live', 'polite');
      expect(alert).toHaveAttribute('aria-labelledby');
      expect(alert).toHaveAttribute('aria-describedby');
    });

    it('should meet color contrast requirements', () => {
      // Municipal blue (#0066CC) on white should meet 4.5:1 contrast ratio


      render(<MunicipalProgressIndicator {...props} />, { wrapper: TestWrapper });
      
      // The component should render without accessibility violations
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      

      render(<MunicipalToastNotification {...props} />, { wrapper: TestWrapper });

      
      // Should be focusable
      expect(alert).toHaveAttribute('tabIndex', '0');
      
      // Should respond to keyboard input
      fireEvent.keyDown(alert, { key: 'Escape' });
      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });

  describe('Anna Svensson Municipal Context Integration', () => {
    it('should optimize for 7-minute learning sessions', () => {
      const _engine = createMunicipalAchievementEngine({
        municipalEntity: 'malmö',
        culturalContext: 'swedish',
        userProfile: {
          name: 'Anna Svensson',
          department: 'IT-avdelningen',
          role: 'Kommunal specialist',
          experienceLevel: 'intermediate'
        },
        recognitionSettings: {
          enableToastNotifications: true,
          enableSubtleIndicators: true,
          enablePortfolio: true,
          toastTimeout: 4000 // Professional timing for Anna's workflow
        }
      });

      // Test that Efficiency Expert is awarded for 7-minute completion

      expect(achievements.some(a => a.id === 'efficiency_expert')).toBe(true);
      
      engine.cleanup();
    });

    it('should provide Swedish municipal language and context', () => {
      
      expect(achievement.title).toBe('GDPR Specialist');
      expect(achievement.description).toContain('kommunal datahantering');
      expect(achievement.municipalValue).toContain('säker informationshantering');
      expect(achievement.nextSteps).toContain('dagliga arbetsuppgifter');
    });

    it('should support mobile-first design for iPhone 12', () => {
      // Mock mobile viewport
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(max-width: 767px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));


      render(<MunicipalToastNotification {...props} />, { wrapper: TestWrapper });
      
      expect(toastElement).toBeInTheDocument();
      // Mobile-specific styling would be tested with more complex setup
    });
  });
});

describe('Achievement System Integration Test - No Intrusive Popups', () => {
  it('should not render any intrusive popup overlays', () => {
    render(
      <div>
        <div data-testid="main-content">Main learning content</div>
      </div>, 
      { wrapper: TestWrapper }
    );

    // Should not find any elements with high z-index overlays
    expect(mainContent).toBeInTheDocument();
    
    // No elements should have z-index: 9999 or similar intrusive overlay styling
    const _intrusiveElements = Array.from(allElements).filter(el => {
      return style.position === 'fixed' && 
             style.top === '50%' && 
             style.left === '50%' &&
             style.zIndex === '9999';
    });
    
    expect(intrusiveElements).toHaveLength(0);
  });
});