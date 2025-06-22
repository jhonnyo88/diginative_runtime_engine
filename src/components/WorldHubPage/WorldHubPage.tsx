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
  const { code } = useParams<{ code: string }>();

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
