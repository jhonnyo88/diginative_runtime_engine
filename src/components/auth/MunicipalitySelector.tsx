/**
 * Municipality Selector Component
 * Enterprise SSO login flow for municipal authentication
 * 
 * Roadmap Ref: Q1-MER-Milestone-1.3
 * Design Integration: Proposal-020 Enterprise SSO Login Flow
 */

import React, { useState, useEffect } from 'react';
import { Search, Building, ArrowRight, Shield, Globe } from 'lucide-react';
import type { MunicipalTenant } from '../../services/enterprise-saml-provider';

interface MunicipalitySelectorProps {
  onSelect: (tenantId: string) => void;
  className?: string;
}

interface MunicipalityOption extends Omit<MunicipalTenant, 'samlConfig'> {
  stats?: {
    activeSessions: number;
    lastLogin?: string;
  };
}



export const MunicipalitySelector: React.FC<MunicipalitySelectorProps> = ({
  onSelect,
  className = ''
}) => {
  const [municipalities, setMunicipalities] = useState<MunicipalityOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [rememberedMunicipality, setRememberedMunicipality] = useState<string>('');

  const _loadRememberedChoice = () => {
    const remembered = localStorage.getItem('preferredMunicipalityId');
    if (remembered) {
      setRememberedMunicipality(remembered);
    }
  };

  const _handleSelect = (municipalityId: string, municipalityName: string) => {
    localStorage.setItem('preferredMunicipalityId', municipalityId);
    localStorage.setItem('preferredMunicipalityName', municipalityName);
    onSelect(municipalityId);
  };

  useEffect(() => {
    _loadMunicipalities();
    _loadRememberedChoice();
  }, []);

  const _loadMunicipalities = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/municipalities');
      const data = await response.json();
      
      if (data.success) {
        setMunicipalities(data.municipalities);
      } else {
        setError('Failed to load municipalities');
      }
    } catch (err) {
      setError('Network error loading municipalities');
      console.error('Failed to load municipalities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMunicipalities = municipalities.filter((municipality) => {
    const matchesSearch = municipality.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || municipality.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });


  if (isLoading) {
    return (
      <div className={`max-w-2xl mx-auto p-8 ${className}`}>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Shield className="h-8 w-8 text-blue-600 animate-pulse" />
            <h1 className="text-2xl font-bold text-gray-900">Loading Municipalities...</h1>
          </div>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`max-w-2xl mx-auto p-8 ${className}`}>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={_loadMunicipalities}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-8 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Municipal SSO Login</h1>
          </div>
          <p className="text-blue-100">
            Select your municipality to continue with secure authentication
          </p>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search municipalities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Countries</option>
                <option value="SE">Sweden (SE)</option>
                <option value="NO">Norway (NO)</option>
                <option value="DK">Denmark (DK)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Remembered Choice */}
        {rememberedMunicipality && (
          <div className="p-6 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Continue with your previous choice</p>
                  <p className="text-sm text-blue-700">
                    {localStorage.getItem('preferredMunicipalityName') || rememberedMunicipality}
                  </p>
                </div>
              </div>
              <button
                onClick={() => _handleSelect(rememberedMunicipality, localStorage.getItem('preferredMunicipalityName') || rememberedMunicipality)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Municipality List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredMunicipalities.length === 0 ? (
            <div className="p-8 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No municipalities found matching your search</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMunicipalities.map((municipality) => (
                <div
                  key={municipality.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => _handleSelect(municipality.id, municipality.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {municipality.brandingConfig.logoUrl ? (
                        <img
                          src={municipality.brandingConfig.logoUrl}
                          alt={`${municipality.name} logo`}
                          className="h-12 w-12 object-contain"
                        />
                      ) : (
                        <div 
                          className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: municipality.brandingConfig.primaryColor || '#3B82F6' }}
                        >
                          {municipality.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {municipality.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Globe className="h-4 w-4" />
                            <span>{municipality.country}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Shield className="h-4 w-4" />
                            <span>{municipality.idpType}</span>
                          </div>
                          {municipality.brandingConfig.customDomain && (
                            <span className="text-blue-600">
                              {municipality.brandingConfig.customDomain}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {municipality.stats?.activeSessions && municipality.stats.activeSessions > 0 && (
                        <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {municipality.stats.activeSessions} active
                        </div>
                      )}
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Secure SAML 2.0 Authentication</span>
            </div>
            <div>
              {filteredMunicipalities.length} of {municipalities.length} municipalities
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Need Help?</h3>
        <p className="text-sm text-blue-700">
          If you don't see your municipality listed, please contact your IT administrator to set up SSO integration.
          For technical support, email <a href="mailto:support@diginativa.se" className="underline">support@diginativa.se</a>
        </p>
      </div>
    </div>
  );
};