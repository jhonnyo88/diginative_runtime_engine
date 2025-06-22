/**
 * Q3 Multi-World Router
 * Routing system for Q3 Multi-World Game Engine
 * Building on Q2 routing patterns with Q3 hub and world navigation
 */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { WorldHubPage } from '../components/WorldHubPage/WorldHubPage';
import { WorldFactory } from '../worlds/WorldFactory';
import { q3PerformanceMonitor } from '../performance/Q3PerformanceMonitor';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

// World route component
const WorldRoute: React.FC = () => {
  const { code, worldIndex } = useParams<{ code: string; worldIndex: string }>();
  const location = useLocation();
  const worldIdx = parseInt(worldIndex || '1', 10);

  useEffect(() => {
    // Start performance monitoring for world transition
    q3PerformanceMonitor.startWorldTransitionMeasurement(worldIdx);
  }, [worldIdx]);

  if (!code || isNaN(worldIdx) || worldIdx < 1 || worldIdx > 5) {
    return <Navigate to="/" replace />;
  }

  // Get cultural context from location state or default to Swedish
  const culturalContext = location.state?.culturalContext || 'swedish_municipal';
  const hubSessionId = location.state?.hubSessionId || '';

  if (!hubSessionId) {
    // Redirect to hub if no session
    return <Navigate to={`/hub/${code}`} replace />;
  }

  const worldComponent = WorldFactory.createWorldByIndex(
    worldIdx,
    hubSessionId,
    code,
    culturalContext
  );

  if (!worldComponent) {
    return (
      <div className="world-not-found">
        <h2>Värld inte hittad</h2>
        <p>Värld {worldIdx} kunde inte laddas.</p>
        <button onClick={() => window.history.back()}>
          Gå tillbaka
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {worldComponent}
    </ErrorBoundary>
  );
};

// Hub route component
const HubRoute: React.FC = () => {
  const { code } = useParams<{ code: string }>();

  useEffect(() => {
    // Start performance monitoring for hub loading
    q3PerformanceMonitor.startHubLoadMeasurement();
  }, []);

  if (!code) {
    return <Navigate to="/" replace />;
  }

  return (
    <ErrorBoundary>
      <WorldHubPage uniqueCode={code} />
    </ErrorBoundary>
  );
};

// Q3 Multi-World Router component
export const Q3MultiWorldRouter: React.FC = () => {
  useEffect(() => {
    // Initialize performance monitoring
    q3PerformanceMonitor.startMonitoring();

    return () => {
      q3PerformanceMonitor.stopMonitoring();
    };
  }, []);

  return (
    <Routes>
      {/* Hub Routes */}
      <Route path="/hub/:code" element={<HubRoute />} />
      
      {/* World Routes */}
      <Route path="/world/:code/:worldIndex" element={<WorldRoute />} />
      
      {/* Legacy Q2 Game Routes - Preserved for backwards compatibility */}
      <Route path="/game/:sessionId" element={<LegacyGameRoute />} />
      
      {/* Home redirect */}
      <Route path="/" element={<Navigate to="/hub/DEMO1234" replace />} />
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Legacy Q2 game route for backwards compatibility
const LegacyGameRoute: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();

  // Check if this is a Q3 hub session
  if (sessionId?.startsWith('hub_')) {
    // Extract unique code and redirect to hub
    const uniqueCode = location.state?.uniqueCode || 'DEMO1234';
    return <Navigate to={`/hub/${uniqueCode}`} replace />;
  }

  // Handle regular Q2 game sessions
  return (
    <ErrorBoundary>
      <div className="legacy-game-route">
        <h2>Läser in spel...</h2>
        <p>Detta är en Q2 spelsession som kommer att laddas.</p>
      </div>
    </ErrorBoundary>
  );
};

export default Q3MultiWorldRouter;