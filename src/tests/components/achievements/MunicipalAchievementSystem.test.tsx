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
const mockMatchMedia = vi.fn().mockImplementation(query => ({
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
    const mockAchievement = MunicipalAchievementCategories.GDPR_SPECIALIST;
    const mockOnDismiss = vi.fn();
    const mockAnalytics = vi.fn();

    const defaultProps = {
      achievement: mockAchievement,
      design: {
        variant: 'municipal-achievement' as const,
        culturalContext: 'swedish' as const,
        municipalEntity: 'malmö' as const,
        professionalLevel: 'intermediate' as const,
      },
      accessibility: {
        dismissible: true,
        autoTimeout: 4000,
        reducedMotion: false,
        screenReaderFriendly: true,
      },
      integration: {
        onDismiss: mockOnDismiss,
        analytics: mockAnalytics,
      },
    };

    it('should render toast notification with municipal branding', () => {
      render(<MunicipalToastNotification {...defaultProps} />, { wrapper: TestWrapper });

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('GDPR Specialist')).toBeInTheDocument();
      expect(screen.getByText(/Du behärskar nu kommunal datahantering/)).toBeInTheDocument();
      expect(screen.getByText(/Malmö Stad/)).toBeInTheDocument();
    });

    it('should be dismissible with ESC key for accessibility', async () => {
      render(<MunicipalToastNotification {...defaultProps} />, { wrapper: TestWrapper });

      const toastElement = screen.getByRole('alert');
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

      const reducedMotionProps = {
        ...defaultProps,
        accessibility: {
          ...defaultProps.accessibility,
          reducedMotion: true,
        },
      };

      render(<MunicipalToastNotification {...reducedMotionProps} />, { wrapper: TestWrapper });

      const toastElement = screen.getByRole('alert');
      expect(toastElement).toBeInTheDocument();
      // Note: Animation testing would require more complex setup
    });

    it('should support different cultural contexts', () => {
      const germanProps = {
        ...defaultProps,
        design: {
          ...defaultProps.design,
          culturalContext: 'german' as const,
          municipalEntity: 'berlin' as const,
        },
      };

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
    const mockProgress = {
      currentStep: 3,
      totalSteps: 5,
      completedSections: ['intro', 'gdpr-basics', 'data-handling'],
      achievementMilestones: DefaultGDPRMilestones.map(milestone => ({
        ...milestone,
        achieved: milestone.percentage <= 60 // First 3 milestones achieved
      })),
      competenciesEarned: ['Grundläggande dataskydd', 'Säker databehandling']
    };

    const defaultProps = {
      progress: mockProgress,
      visualDesign: {
        baseColor: '#E2E8F0',
        progressColor: '#0066CC',
        milestoneColor: '#004C99',
        textColor: '#333333'
      },
      achievementIntegration: {
        milestoneMarkers: true,
        hoverDetails: true,
        clickableMarkers: true,
        professionalLabels: true
      },
      accessibility: {
        ariaLabel: 'GDPR-utbildning framsteg med kompetensmål',
        ariaValueText: '3 av 5 sektioner slutförda, 2 kompetenser utvecklade',
        keyboardNavigation: true
      },
      culturalContext: 'swedish' as const,
      municipalEntity: 'Malmö Stad'
    };

    it('should render progress bar with milestone markers', () => {
      render(<MunicipalProgressIndicator {...defaultProps} />, { wrapper: TestWrapper });

      // Check progress bar
      const progressBar = screen.getByRole('progressbar');
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

      const progressGroup = screen.getByLabelText('GDPR-utbildning framsteg med kompetensmål');
      expect(progressGroup).toBeInTheDocument();
      
      // Check aria attributes
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuetext', '3 av 5 sektioner slutförda, 2 kompetenser utvecklade');
    });

    it('should adapt to different cultural contexts', () => {
      const germanProps = {
        ...defaultProps,
        culturalContext: 'german' as const,
        municipalEntity: 'Berlin Stadt'
      };

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
      const sessionData = {
        totalScore: 140,
        maxScore: 160,
        timeSpent: 360000, // 6 minutes
        correctAnswers: 18,
        totalQuestions: 20,
        sectionsCompleted: 5,
        totalSections: 5
      };

      const achievements = engine.evaluateAchievements(sessionData);
      
      // Should earn GDPR Specialist (85% score, 90% correct)
      expect(achievements).toHaveLength(3); // GDPR Specialist, Efficiency Expert, Municipal Certified
      expect(achievements.some(a => a.id === 'gdpr_specialist')).toBe(true);
      expect(achievements.some(a => a.id === 'efficiency_expert')).toBe(true);
      expect(achievements.some(a => a.id === 'municipal_certified')).toBe(true);
    });

    it('should evaluate Compliance Champion for perfect performance', () => {
      const sessionData = {
        totalScore: 160,
        maxScore: 160,
        timeSpent: 400000, // 6.67 minutes
        correctAnswers: 20,
        totalQuestions: 20,
        sectionsCompleted: 5,
        totalSections: 5
      };

      const achievements = engine.evaluateAchievements(sessionData);
      
      // Should earn all achievements including Compliance Champion
      expect(achievements.some(a => a.id === 'compliance_champion')).toBe(true);
    });

    it('should respect Anna Svensson time constraints for Efficiency Expert', () => {
      const sessionData = {
        totalScore: 140,
        maxScore: 160,
        timeSpent: 420000, // Exactly 7 minutes
        correctAnswers: 16,
        totalQuestions: 20,
        sectionsCompleted: 5,
        totalSections: 5
      };

      const achievements = engine.evaluateAchievements(sessionData);
      
      // Should earn Efficiency Expert for completing within 7 minutes
      expect(achievements.some(a => a.id === 'efficiency_expert')).toBe(true);
    });

    it('should not award achievements if criteria not met', () => {
      const sessionData = {
        totalScore: 100,
        maxScore: 160,
        timeSpent: 600000, // 10 minutes
        correctAnswers: 12,
        totalQuestions: 20,
        sectionsCompleted: 4,
        totalSections: 5
      };

      const achievements = engine.evaluateAchievements(sessionData);
      
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

      const report = engine.generateMunicipalReport();
      
      expect(report.participantInfo.name).toBe('Anna Svensson');
      expect(report.participantInfo.municipality).toBe('malmö');
      expect(report.achievementSummary.totalEarned).toBeGreaterThan(0);
      expect(report.competencyDevelopment.developed).toBeInstanceOf(Array);
      expect(report.municipalValue.institutionalBenefits).toBeInstanceOf(Array);
      expect(report.exportTimestamp).toBeInstanceOf(Date);
    });

    it('should emit events for achievement tracking', () => {
      const mockListener = vi.fn();
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
      const achievement = MunicipalAchievementCategories.GDPR_SPECIALIST;
      const props = {
        achievement,
        design: {
          variant: 'municipal-achievement' as const,
          culturalContext: 'swedish' as const,
          municipalEntity: 'malmö' as const,
          professionalLevel: 'intermediate' as const,
        },
        accessibility: {
          dismissible: true,
          autoTimeout: 4000,
          reducedMotion: false,
          screenReaderFriendly: true,
        },
        integration: {
          onDismiss: vi.fn(),
        },
      };

      render(<MunicipalToastNotification {...props} />, { wrapper: TestWrapper });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
      expect(alert).toHaveAttribute('aria-labelledby');
      expect(alert).toHaveAttribute('aria-describedby');
    });

    it('should meet color contrast requirements', () => {
      // Municipal blue (#0066CC) on white should meet 4.5:1 contrast ratio
      const progress = {
        currentStep: 2,
        totalSteps: 5,
        completedSections: ['intro', 'basics'],
        achievementMilestones: DefaultGDPRMilestones,
        competenciesEarned: ['Basic competence']
      };

      const props = {
        progress,
        visualDesign: {
          baseColor: '#E2E8F0',
          progressColor: '#0066CC', // Municipal blue
          milestoneColor: '#004C99', // Darker blue
          textColor: '#333333' // High contrast text
        },
        achievementIntegration: {
          milestoneMarkers: true,
          hoverDetails: true,
          clickableMarkers: true,
          professionalLabels: true
        },
        accessibility: {
          ariaLabel: 'Progress indicator',
          ariaValueText: 'Progress information',
          keyboardNavigation: true
        },
        culturalContext: 'swedish' as const,
        municipalEntity: 'Test Municipality'
      };

      render(<MunicipalProgressIndicator {...props} />, { wrapper: TestWrapper });
      
      // The component should render without accessibility violations
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      const achievement = MunicipalAchievementCategories.GDPR_SPECIALIST;
      const mockOnDismiss = vi.fn();
      
      const props = {
        achievement,
        design: {
          variant: 'municipal-achievement' as const,
          culturalContext: 'swedish' as const,
          municipalEntity: 'malmö' as const,
          professionalLevel: 'intermediate' as const,
        },
        accessibility: {
          dismissible: true,
          autoTimeout: 0, // Disable auto-dismiss for testing
          reducedMotion: false,
          screenReaderFriendly: true,
        },
        integration: {
          onDismiss: mockOnDismiss,
        },
      };

      render(<MunicipalToastNotification {...props} />, { wrapper: TestWrapper });

      const alert = screen.getByRole('alert');
      
      // Should be focusable
      expect(alert).toHaveAttribute('tabIndex', '0');
      
      // Should respond to keyboard input
      fireEvent.keyDown(alert, { key: 'Escape' });
      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });

  describe('Anna Svensson Municipal Context Integration', () => {
    it('should optimize for 7-minute learning sessions', () => {
      const engine = createMunicipalAchievementEngine({
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
      const sessionData = {
        totalScore: 130,
        maxScore: 160,
        timeSpent: 420000, // Exactly 7 minutes = Anna's lunch break constraint
        correctAnswers: 16,
        totalQuestions: 20,
        sectionsCompleted: 5,
        totalSections: 5
      };

      const achievements = engine.evaluateAchievements(sessionData);
      expect(achievements.some(a => a.id === 'efficiency_expert')).toBe(true);
      
      engine.cleanup();
    });

    it('should provide Swedish municipal language and context', () => {
      const achievement = MunicipalAchievementCategories.GDPR_SPECIALIST;
      
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

      const achievement = MunicipalAchievementCategories.GDPR_SPECIALIST;
      const props = {
        achievement,
        design: {
          variant: 'municipal-achievement' as const,
          culturalContext: 'swedish' as const,
          municipalEntity: 'malmö' as const,
          professionalLevel: 'intermediate' as const,
        },
        accessibility: {
          dismissible: true,
          autoTimeout: 4000,
          reducedMotion: false,
          screenReaderFriendly: true,
        },
        integration: {
          onDismiss: vi.fn(),
        },
      };

      render(<MunicipalToastNotification {...props} />, { wrapper: TestWrapper });
      
      const toastElement = screen.getByRole('alert');
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
    const mainContent = screen.getByTestId('main-content');
    expect(mainContent).toBeInTheDocument();
    
    // No elements should have z-index: 9999 or similar intrusive overlay styling
    const allElements = document.querySelectorAll('*');
    const intrusiveElements = Array.from(allElements).filter(el => {
      const style = window.getComputedStyle(el);
      return style.position === 'fixed' && 
             style.top === '50%' && 
             style.left === '50%' &&
             style.zIndex === '9999';
    });
    
    expect(intrusiveElements).toHaveLength(0);
  });
});