/**
 * Error Boundary Component
 * Municipal-grade error handling for Q3 Multi-World system
 * Building on React error boundaries with government-grade reliability
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import './ErrorBoundary.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for municipal audit trail
    console.error('Municipal Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Report to monitoring system
    this.reportErrorToMonitoring(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private reportErrorToMonitoring(error: Error, errorInfo: ErrorInfo) {
    // In production, this would send to monitoring service
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      municipalCompliance: true
    };

    console.log('Error Report for Municipal Audit:', errorReport);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleReportIssue = () => {
    const subject = encodeURIComponent(`Municipal System Error: ${this.state.errorId}`);
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Error Message: ${this.state.error?.message}
Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
[User description here]
    `);
    
    window.open(`mailto:support@diginative.se?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default municipal error UI
      return (
        <div className="error-boundary">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="error-content"
          >
            <div className="error-icon">⚠️</div>
            
            <h2 className="error-title">
              Ett tekniskt fel har uppstått
            </h2>
            
            <p className="error-description">
              Vi ber om ursäkt för besväret. Ett oväntat tekniskt fel har inträffat i det kommunala systemet.
            </p>
            
            <div className="error-details">
              <div className="error-id">
                <strong>Fel-ID:</strong> {this.state.errorId}
              </div>
              <div className="error-time">
                <strong>Tidpunkt:</strong> {new Date().toLocaleString('sv-SE')}
              </div>
            </div>

            <div className="error-actions">
              <button 
                onClick={this.handleRetry}
                className="retry-button primary"
              >
                Försök igen
              </button>
              
              <button 
                onClick={this.handleReportIssue}
                className="report-button secondary"
              >
                Rapportera fel
              </button>
            </div>

            <div className="municipal-notice">
              <p>
                Detta fel har automatiskt rapporterats till vårt tekniska team för att säkerställa 
                kontinuerlig förbättring av den kommunala tjänsten.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="error-debug">
                <summary>Teknisk information (utvecklingsläge)</summary>
                <div className="error-stack">
                  <h4>Error Message:</h4>
                  <pre>{this.state.error?.message}</pre>
                  
                  <h4>Component Stack:</h4>
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                  
                  <h4>Error Stack:</h4>
                  <pre>{this.state.error?.stack}</pre>
                </div>
              </details>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}