/**
 * Loading Spinner Component
 * Municipal-grade loading indicator for Q3 Multi-World system
 * Building on Q2 UI patterns with performance optimization
 */

import React from 'react';
import { motion } from 'framer-motion';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'municipal';
  text?: string;
  showPerformanceTarget?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  text,
  showPerformanceTarget = false
}) => {


  return (
    <div className={`loading-spinner-container ${size}`}>
      <motion.div
        className={`loading-spinner ${color}`}
        style={{
          width: spinnerSize,
          height: spinnerSize
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="spinner-inner" />
      </motion.div>
      
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="loading-text"
        >
          {text}
        </motion.p>
      )}
      
      {showPerformanceTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="performance-target"
        >
          <small>Mål: &lt;800ms laddningstid</small>
        </motion.div>
      )}
    </div>
  );
};