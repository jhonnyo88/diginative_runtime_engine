/**
 * Central World Hub Page Component
 * Primary navigation interface for Q3 Multi-World Game Engine
 * Building on Q2 component patterns with municipal professional styling
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { multiWorldStateManager } from '../../services/multi-world-state-manager';
import { WorldHubState, WorldCompletionStatus, calculateTotalScore } from '../../types/q3-multi-world';
import { HubScoreDisplay } from './components/HubScoreDisplay';
import { WorldSelectionGrid } from './components/WorldSelectionGrid';
import { ProgressVisualization } from './components/ProgressVisualization';
import { MunicipalBrandingHeader } from './components/MunicipalBrandingHeader';
import { CulturalAdaptationProvider } from '../../contexts/CulturalAdaptationContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import './WorldHubPage.css';

interface WorldHubPageProps {
  uniqueCode?: string;
}

export const WorldHubPage: React.FC<WorldHubPageProps> = ({ uniqueCode }) => {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const hubCode = uniqueCode || code;

  // State management
  const [hubState, setHubState] = useState<WorldHubState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorld, setSelectedWorld] = useState<number | null>(null);
  const [hubLoadStartTime] = useState(Date.now());

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState({
    hubLoadTime: 0,
    componentsRendered: 0,
    lastUpdateTime: Date.now()
  });

  /**
   * Initialize hub session with unique code authentication
   */
  const initializeHubSession = useCallback(async () => {
    if (!hubCode) {
      setError('Ingen unik kod tillhandahållen för hub-session');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Authenticate with unique code
      const authenticatedHubState = await multiWorldStateManager.authenticateWithUniqueCode(hubCode);
      
      if (!authenticatedHubState) {
        setError('Ogiltig eller utgången unik kod. Kontrollera koden och försök igen.');
        setLoading(false);
        return;
      }

      setHubState(authenticatedHubState);
      
      // Calculate hub load time (target: <800ms)
      const loadTime = Date.now() - hubLoadStartTime;
      setPerformanceMetrics(prev => ({
        ...prev,
        hubLoadTime: loadTime,
        componentsRendered: prev.componentsRendered + 1
      }));

      // Log performance for Anna Svensson requirement monitoring
      if (loadTime > 800) {
        console.warn(`Hub load time ${loadTime}ms exceeds 800ms target`);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error initializing hub session:', err);
      setError('Ett fel uppstod vid inläsning av hub-sessionen. Försök igen.');
      setLoading(false);
    }
  }, [hubCode, hubLoadStartTime]);

  /**
   * Handle world selection and navigation
   */
  const handleWorldSelection = useCallback(async (worldIndex: number) => {
    if (!hubState) return;

    try {
      setSelectedWorld(worldIndex);
      
      // Check if world is available
      const worldStatus = hubState.worldCompletionStatus.find(w => w.worldIndex === worldIndex);
      if (!worldStatus || worldStatus.status === 'locked') {
        alert('Denna värld är inte tillgänglig än. Slutför tidigare världar först.');
        setSelectedWorld(null);
        return;
      }

      // Start world session
      const worldSession = await multiWorldStateManager.startWorldSession(
        hubState.hubSessionId,
        worldIndex,
        `world-${worldIndex}-game`
      );

      if (!worldSession) {
        alert('Kunde inte starta värld-sessionen. Försök igen.');
        setSelectedWorld(null);
        return;
      }

      // Update hub state
      setHubState(worldSession.hubState);

      // Navigate to world (preserving Q2 game navigation patterns)
      navigate(`/game/${worldSession.gameState.sessionId}`, {
        state: {
          hubSessionId: hubState.hubSessionId,
          worldIndex,
          returnToHub: true
        }
      });
    } catch (err) {
      console.error('Error starting world session:', err);
      alert('Ett fel uppstod vid start av värld. Försök igen.');
      setSelectedWorld(null);
    }
  }, [hubState, navigate]);

  /**
   * Handle return from completed world
   */
  const handleWorldCompletion = useCallback(async (worldIndex: number, results: Record<string, unknown>) => {
    if (!hubState) return;

    try {
      // Update hub state with world completion
      const updatedHubState = await multiWorldStateManager.completeWorld(
        hubState.hubSessionId,
        worldIndex,
        results
      );

      if (updatedHubState) {
        setHubState(updatedHubState);
        
        // Show completion celebration
        // This will integrate with existing Q2 achievement celebration patterns
        console.log(`World ${worldIndex} completed! New total score: ${updatedHubState.totalScore}`);
      }
    } catch (err) {
      console.error('Error handling world completion:', err);
    }
  }, [hubState]);

  /**
   * Cultural adaptation based on hub state
   */
  const getCulturalContent = useCallback(() => {
    if (!hubState) return null;

    const culturalContent = {
      swedish_municipal: {
        welcomeMessage: 'Välkommen till din kommunala utvecklingsresa',
        progressEncouragement: 'Utmärkt framsteg! Fortsätt utveckla din kompetens.',
        completionMessage: 'Fantastiskt! Du har visat excellent kommunal kompetens.'
      },
      german_municipal: {
        welcomeMessage: 'Willkommen zu Ihrer kommunalen Entwicklungsreise',
        progressEncouragement: 'Ausgezeichneter Fortschritt! Setzen Sie Ihre Kompetenzentwicklung fort.',
        completionMessage: 'Hervorragend! Sie haben exzellente kommunale Kompetenz gezeigt.'
      },
      french_municipal: {
        welcomeMessage: 'Bienvenue dans votre parcours de développement municipal',
        progressEncouragement: 'Excellent progrès! Continuez à développer vos compétences.',
        completionMessage: 'Magnifique! Vous avez démontré une excellente compétence municipale.'
      },
      dutch_municipal: {
        welcomeMessage: 'Welkom bij uw gemeentelijke ontwikkelingsreis',
        progressEncouragement: 'Uitstekende voortgang! Blijf uw competenties ontwikkelen.',
        completionMessage: 'Uitstekend! U heeft uitstekende gemeentelijke competentie getoond.'
      }
    };

    return culturalContent[hubState.culturalContext];
  }, [hubState]);

  // Initialize hub session on mount
  useEffect(() => {
    initializeHubSession();
  }, [initializeHubSession]);

  // Auto-refresh hub state every 30 seconds (Q2 autosave pattern)
  useEffect(() => {
    if (!hubState) return;

    const refreshInterval = setInterval(async () => {
      try {
        const refreshedState = await multiWorldStateManager.getHubSession(hubState.hubSessionId);
        if (refreshedState) {
          setHubState(refreshedState);
          setPerformanceMetrics(prev => ({
            ...prev,
            lastUpdateTime: Date.now()
          }));
        }
      } catch (err) {
        console.error('Error refreshing hub state:', err);
      }
    }, 30000); // 30 seconds (Q2 pattern)

    return () => clearInterval(refreshInterval);
  }, [hubState]);

  // Loading state
  if (loading) {
    return (
      <div className="world-hub-loading">
        <LoadingSpinner />
        <p>Laddar din kommunala utvecklingshub...</p>
        <div className="performance-info">
          <small>Mål: &lt;800ms laddningstid</small>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="world-hub-error">
        <h2>Kunde inte ladda Hub</h2>
        <p>{error}</p>
        <button 
          onClick={initializeHubSession}
          className="retry-button"
        >
          Försök igen
        </button>
      </div>
    );
  }

  // No hub state
  if (!hubState) {
    return (
      <div className="world-hub-no-state">
        <h2>Ingen hub-session hittades</h2>
        <p>Kontrollera din unika kod och försök igen.</p>
      </div>
    );
  }

  const culturalContent = getCulturalContent();

  return (
    <ErrorBoundary>
      <CulturalAdaptationProvider culturalContext={hubState.culturalContext}>
        <div className="world-hub-page" data-cultural-context={hubState.culturalContext}>
          {/* Municipal Branding Header */}
          <MunicipalBrandingHeader 
            tenantId={hubState.tenantId}
            culturalContext={hubState.culturalContext}
          />

          {/* Main Hub Content */}
          <main className="hub-main-content">
            {/* Welcome Section */}
            <section className="hub-welcome-section">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="welcome-content"
              >
                <h1 className="hub-title">
                  {culturalContent?.welcomeMessage || 'Välkommen till din utvecklingsresa'}
                </h1>
                <p className="hub-subtitle">
                  Utveckla din kommunala kompetens genom fem specialiserade världar
                </p>
              </motion.div>
            </section>

            {/* Score Display Section */}
            <section className="hub-score-section">
              <HubScoreDisplay 
                hubState={hubState}
                performanceMetrics={performanceMetrics}
              />
            </section>

            {/* Progress Visualization */}
            <section className="hub-progress-section">
              <ProgressVisualization 
                hubState={hubState}
                culturalContext={hubState.culturalContext}
              />
            </section>

            {/* World Selection Grid */}
            <section className="hub-worlds-section">
              <h2 className="section-title">Välj din nästa värld</h2>
              <WorldSelectionGrid
                hubState={hubState}
                onWorldSelect={handleWorldSelection}
                selectedWorld={selectedWorld}
                culturalContext={hubState.culturalContext}
              />
            </section>

            {/* Achievement Highlights */}
            <section className="hub-achievements-section">
              <h2 className="section-title">Dina prestationer</h2>
              <div className="achievements-grid">
                {hubState.hubProgressData.unlockedAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="achievement-card"
                  >
                    <div className="achievement-icon">🏆</div>
                    <div className="achievement-title">{achievement}</div>
                  </motion.div>
                ))}
              </div>
            </section>
          </main>

          {/* Performance Debug Info (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="performance-debug">
              <details>
                <summary>Performance Metrics</summary>
                <ul>
                  <li>Hub Load Time: {performanceMetrics.hubLoadTime}ms (target: &lt;800ms)</li>
                  <li>Components Rendered: {performanceMetrics.componentsRendered}</li>
                  <li>Last Update: {new Date(performanceMetrics.lastUpdateTime).toLocaleTimeString()}</li>
                  <li>Memory Usage: {(window.performance as any)?.memory?.usedJSHeapSize ? 
                    Math.round((window.performance as any).memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A'}</li>
                </ul>
              </details>
            </div>
          )}
        </div>
      </CulturalAdaptationProvider>
    </ErrorBoundary>
  );
};

export default WorldHubPage;