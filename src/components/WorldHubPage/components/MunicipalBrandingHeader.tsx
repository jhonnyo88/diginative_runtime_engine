/**
 * Municipal Branding Header Component
 * Cultural adaptation and municipal branding for Q3 Multi-World Hub
 * Building on Q2 municipal standards with enhanced European localization
 */

import React from 'react';
import { motion } from 'framer-motion';
import './MunicipalBrandingHeader.css';

interface MunicipalBrandingHeaderProps {
  tenantId: string;
  culturalContext: 'swedish_municipal' | 'german_municipal' | 'french_municipal' | 'dutch_municipal';
}

export const MunicipalBrandingHeader: React.FC<MunicipalBrandingHeaderProps> = ({
  tenantId,
  culturalContext
}) => {
  const getCulturalBranding = () => {
    const brandings = {
      swedish_municipal: {
        flag: '🇸🇪',
        greeting: 'Välkommen',
        subtitle: 'Kommunal Kompetensutveckling',
        governmentLevel: 'Sveriges Kommuner och Regioner',
        qualityMark: 'Kvalitetssäkrad utbildning enligt svenska standarder',
        colors: {
          primary: '#006AA7', // Swedish blue
          secondary: '#FFCD00', // Swedish yellow
          accent: '#004B87'
        }
      },
      german_municipal: {
        flag: '🇩🇪',
        greeting: 'Willkommen',
        subtitle: 'Kommunale Kompetenzentwicklung',
        governmentLevel: 'Deutscher Städte- und Gemeindebund',
        qualityMark: 'Qualitätsgesicherte Ausbildung nach deutschen Standards',
        colors: {
          primary: '#000000', // German black
          secondary: '#DD0000', // German red
          accent: '#FFCE00' // German gold
        }
      },
      french_municipal: {
        flag: '🇫🇷',
        greeting: 'Bienvenue',
        subtitle: 'Développement des Compétences Municipales',
        governmentLevel: 'Association des Maires de France',
        qualityMark: 'Formation certifiée selon les normes françaises',
        colors: {
          primary: '#0055A4', // French blue
          secondary: '#EF4135', // French red
          accent: '#FFFFFF' // French white
        }
      },
      dutch_municipal: {
        flag: '🇳🇱',
        greeting: 'Welkom',
        subtitle: 'Gemeentelijke Competentieontwikkeling',
        governmentLevel: 'Vereniging van Nederlandse Gemeenten',
        qualityMark: 'Kwaliteitsgewaarborgde training volgens Nederlandse normen',
        colors: {
          primary: '#21468B', // Dutch blue
          secondary: '#FF6C00', // Dutch orange
          accent: '#FFFFFF' // Dutch white
        }
      }
    };
    return brandings[culturalContext] || brandings.swedish_municipal;
  };

  const getMunicipalInfo = () => {
    // Mock municipal data based on tenantId - in production this would come from tenant configuration
    const municipalData = {
      demo_tenant: {
        swedish_municipal: {
          municipalityName: 'Stockholms Kommun',
          municipalityType: 'Storstad',
          logo: '🏛️',
          slogan: 'För en bättre framtid tillsammans'
        },
        german_municipal: {
          municipalityName: 'Stadt München',
          municipalityType: 'Großstadt',
          logo: '🏛️',
          slogan: 'Weltstadt mit Herz'
        },
        french_municipal: {
          municipalityName: 'Ville de Lyon',
          municipalityType: 'Métropole',
          logo: '🏛️',
          slogan: 'Seulement Lyon'
        },
        dutch_municipal: {
          municipalityName: 'Gemeente Amsterdam',
          municipalityType: 'Gemeente',
          logo: '🏛️',
          slogan: 'Samen maken we de stad'
        }
      }
    };
    
    const defaultData = municipalData.demo_tenant || municipalData.demo_tenant;
    return defaultData[culturalContext] || defaultData.swedish_municipal;
  };

  const branding = getCulturalBranding();
  const municipalInfo = getMunicipalInfo();

  const getCurrentTime = () => {
    const timeFormats = {
      swedish_municipal: 'sv-SE',
      german_municipal: 'de-DE',
      french_municipal: 'fr-FR',
      dutch_municipal: 'nl-NL'
    };
    
    return new Date().toLocaleString(timeFormats[culturalContext], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header 
      className="municipal-branding-header" 
      data-cultural-context={culturalContext}
      style={{ 
        borderBottom: `3px solid ${branding.colors.primary}`,
        background: `linear-gradient(90deg, ${branding.colors.primary}05 0%, ${branding.colors.secondary}05 100%)`
      }}
    >
      <div className="header-container">
        {/* Left Section - Municipal Identity */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="municipal-identity"
        >
          <div className="municipal-logo">
            <span className="country-flag">{branding.flag}</span>
            <span className="municipality-logo">{municipalInfo.logo}</span>
          </div>
          
          <div className="municipal-text">
            <div className="municipality-name">
              {municipalInfo.municipalityName}
            </div>
            <div className="municipality-type">
              {municipalInfo.municipalityType} • {branding.subtitle}
            </div>
          </div>
        </motion.div>

        {/* Center Section - Platform Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="platform-branding"
        >
          <div className="platform-title">
            <span className="greeting">{branding.greeting}</span>
            <span className="platform-name">DigiNative Multi-World</span>
          </div>
          <div className="platform-subtitle">
            {municipalInfo.slogan}
          </div>
        </motion.div>

        {/* Right Section - Session Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="session-info"
        >
          <div className="session-time">
            {getCurrentTime()}
          </div>
          <div className="quality-assurance">
            <span className="quality-icon">✓</span>
            <span className="quality-text">{branding.qualityMark}</span>
          </div>
        </motion.div>
      </div>

      {/* Government Standards Bar */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="government-standards-bar"
        style={{ backgroundColor: `${branding.colors.primary}10` }}
      >
        <div className="standards-container">
          <div className="standards-left">
            <span className="government-body">{branding.governmentLevel}</span>
            <span className="separator">•</span>
            <span className="compliance-info">GDPR Compliant • WCAG 2.1 AA</span>
          </div>
          
          <div className="standards-right">
            <div className="certification-badges">
              <span className="cert-badge">🛡️ Säker</span>
              <span className="cert-badge">♿ Tillgänglig</span>
              <span className="cert-badge">📱 Mobilvänlig</span>
              <span className="cert-badge">🌍 Miljövänlig</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cultural Navigation Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="cultural-hint"
      >
        <div className="hint-content">
          <span className="hint-icon">🌍</span>
          <span className="hint-text">
            Utbildningen anpassas automatiskt till svenska kommunala standarder och arbetssätt
          </span>
        </div>
      </motion.div>

      {/* Mobile Optimization Indicator */}
      <div className="mobile-optimization-indicator">
        <div className="responsive-badges">
          <span className="responsive-badge desktop">🖥️ Desktop</span>
          <span className="responsive-badge tablet">📱 Tablet</span>
          <span className="responsive-badge mobile">📱 Mobile</span>
        </div>
      </div>

      {/* Performance Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="performance-header-info">
          <div className="perf-badge">
            <span className="perf-label">Performance Target:</span>
            <span className="perf-value">&lt;800ms Hub Load</span>
          </div>
          <div className="perf-badge">
            <span className="perf-label">Anna Svensson:</span>
            <span className="perf-value">&lt;2s Requirement</span>
          </div>
        </div>
      )}
    </header>
  );
};