/**
 * SAML Redirect Component
 * Loading states during SAML authentication handshake
 * 
 * Roadmap Ref: Q1-MER-Milestone-1.3
 * Design Integration: Proposal-020 Enterprise SSO Login Flow
 */

import React, { useEffect, useState } from 'react';
import { Shield, ArrowRight, CheckCircle, AlertCircle, RotateCw } from 'lucide-react';

interface SAMLRedirectProps {
  tenantId: string;
  tenantName: string;
  tenantLogo?: string;
  primaryColor?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

type LoadingState = 'initiating' | 'redirecting' | 'processing' | 'success' | 'error';

export const SAMLRedirect: React.FC<SAMLRedirectProps> = ({
  tenantId,
  tenantName,
  tenantLogo,
  primaryColor = '#3B82F6',
  onSuccess,
  onError,
  className = ''
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>('initiating');
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    _initiateLogin();
  }, [tenantId]);

  const _initiateLogin = async () => {
    try {
      setLoadingState('initiating');
      setProgress(20);

      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const response = await fetch('/api/auth/saml/status', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      setProgress(60);

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to initiate SAML login');
      }

      setLoadingState('redirecting');
      setProgress(80);

      // Simulate redirect delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to IdP
      window.location.href = data.loginUrl;
      
      setProgress(100);
      setLoadingState('processing');

    } catch (err) {
      console.error('SAML login initiation failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoadingState('error');
      onError?.(err instanceof Error ? err.message : 'Login failed');
    }
  };




  return (
    <div className={`max-w-2xl mx-auto p-8 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div 
          className="px-8 py-6 text-white"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}DD 100%)`
          }}
        >
          <div className="flex items-center space-x-4">
            {tenantLogo ? (
              <img
                src={tenantLogo}
                alt={`${tenantName} logo`}
                className="h-12 w-12 object-contain bg-white rounded-lg p-1"
              />
            ) : (
              <div className="h-12 w-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">Secure Login</h1>
              <p className="text-white text-opacity-90">{tenantName}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full transition-all duration-500 ease-out"
            style={{ 
              width: `${progress}%`,
              backgroundColor: primaryColor
            }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {loadingState !== 'error' ? (
            <div className="text-center">
              {/* Loading Animation */}
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <RotateCw className="h-8 w-8 animate-spin mx-auto" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Loading...
                </h2>
                <p className="text-gray-600">
                  You will be redirected to your organization's login page in a moment.
                </p>
              </div>

              {/* Steps Indicator */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div 
                    className={`h-3 w-3 rounded-full ${
                      progress >= 20 ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                  <span className="text-sm text-gray-600">Connect</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="flex items-center space-x-2">
                  <div 
                    className={`h-3 w-3 rounded-full ${
                      progress >= 60 ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                  <span className="text-sm text-gray-600">Redirect</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="flex items-center space-x-2">
                  <div 
                    className={`h-3 w-3 rounded-full ${
                      progress >= 100 ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                  <span className="text-sm text-gray-600">Authenticate</span>
                </div>
              </div>

              {loadingState === 'processing' && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> If you're not redirected automatically, 
                    please ensure pop-ups are enabled for this site.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Error State */
            <div className="text-center">
              <div className="mb-6">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Authentication Failed
                </h2>
                <p className="text-gray-600 mb-4">{error}</p>
                
                <div className="space-y-3">
                  <button
                    onClick={_initiateLogin}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => window.history.back()}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-900 mb-2">
                  Common Issues:
                </h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Ensure pop-ups are enabled</li>
                  <li>• Try refreshing the page</li>
                  <li>• Contact your IT administrator if the problem persists</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>Protected by SAML 2.0 Security</span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-900">Security Notice</h3>
            <p className="text-sm text-yellow-700 mt-1">
              You are being securely redirected to {tenantName}'s authentication system. 
              Never enter your credentials on any other site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};