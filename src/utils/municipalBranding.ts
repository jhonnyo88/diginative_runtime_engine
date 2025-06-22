// Municipal branding injection system for multi-tenant theming
// Handles runtime branding customization for Swedish municipal clients

interface MunicipalBranding {
  municipality: string;
  primaryColor: string;
  secondaryColor?: string;
  logoUrl?: string;
  brandingConfig?: {
    fontFamily?: string;
    borderRadius?: string;
    spacing?: 'compact' | 'standard' | 'spacious';
  };
  culturalContext: 'swedish' | 'german' | 'french' | 'dutch';
}

interface BrandingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedBranding: MunicipalBranding;
}

// Default municipal branding fallbacks
const DEFAULT_BRANDING: Record<string, MunicipalBranding> = {
  swedish: {
    municipality: 'Svenska Kommuner',
    primaryColor: '#005AA0',
    secondaryColor: '#E6F3FF',
    culturalContext: 'swedish',
    brandingConfig: {
      fontFamily: 'Inter, -apple-system, sans-serif',
      borderRadius: '8px',
      spacing: 'standard'
    }
  },
  german: {
    municipality: 'Deutsche Gemeinde',
    primaryColor: '#1F2937',
    secondaryColor: '#F3F4F6',
    culturalContext: 'german',
    brandingConfig: {
      fontFamily: 'Inter, sans-serif',
      borderRadius: '4px',
      spacing: 'compact'
    }
  },
  french: {
    municipality: 'Commune Française',
    primaryColor: '#7C3AED',
    secondaryColor: '#F3E8FF',
    culturalContext: 'french',
    brandingConfig: {
      fontFamily: 'Inter, Georgia, serif',
      borderRadius: '12px',
      spacing: 'spacious'
    }
  },
  dutch: {
    municipality: 'Nederlandse Gemeente',
    primaryColor: '#EA580C',
    secondaryColor: '#FFF7ED',
    culturalContext: 'dutch',
    brandingConfig: {
      fontFamily: 'Inter, sans-serif',
      borderRadius: '6px',
      spacing: 'standard'
    }
  }
};

// Anna Svensson mobile-first optimization

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!branding) {
    return {
      isValid: true,
      errors: [],
      warnings: ['No municipal branding provided - using Swedish default'],
      sanitizedBranding: DEFAULT_BRANDING.swedish
    };
  }

  // Municipality name validation
  if (!branding.municipality || branding.municipality.trim().length === 0) {
    errors.push('Municipality name is required');
  }

  // Primary color validation
  if (!branding.primaryColor) {
    warnings.push('No primary color specified - using default');
  } else if (!isValidHexColor(branding.primaryColor)) {
    errors.push(`Invalid primary color format: ${branding.primaryColor}. Use hex format (#RRGGBB)`);
  } else if (!meetsContrastRequirements(branding.primaryColor)) {
    warnings.push(`Primary color ${branding.primaryColor} may not meet WCAG AA contrast requirements`);
  }

  // Logo URL validation
  if (branding.logoUrl) {
    if (!isValidUrl(branding.logoUrl)) {
      errors.push(`Invalid logo URL: ${branding.logoUrl}`);
    } else if (!isSupportedImageFormat(branding.logoUrl)) {
      warnings.push('Logo should be SVG, PNG, or JPG for best mobile performance');
    }
  }

  // Cultural context validation
  if (!DEFAULT_BRANDING[culturalContext]) {
    warnings.push(`Unknown cultural context: ${culturalContext}. Using Swedish default.`);
  }

  // Create sanitized branding with fallbacks
  const sanitizedBranding: MunicipalBranding = {
    municipality: branding.municipality?.trim() || baseBranding.municipality,
    primaryColor: isValidHexColor(branding.primaryColor) ? branding.primaryColor! : baseBranding.primaryColor,
    secondaryColor: isValidHexColor(branding.secondaryColor) ? branding.secondaryColor : baseBranding.secondaryColor,
    logoUrl: isValidUrl(branding.logoUrl) ? branding.logoUrl : undefined,
    culturalContext: culturalContext as any,
    brandingConfig: {
      ...baseBranding.brandingConfig,
      ...branding.brandingConfig
    }
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedBranding
  };
};

  return {
    '--municipal-primary': branding.primaryColor,
    '--municipal-secondary': branding.secondaryColor || lightenColor(branding.primaryColor, 0.9),
    '--municipal-font': branding.brandingConfig?.fontFamily || 'Inter, sans-serif',
    '--municipal-radius': branding.brandingConfig?.borderRadius || '8px',
    '--municipal-spacing': getSpacingValue(branding.brandingConfig?.spacing || 'standard')
  } as React.CSSProperties;
};

  return {
    colors: {
      brand: {
        50: lightenColor(branding.primaryColor, 0.95),
        100: lightenColor(branding.primaryColor, 0.9),
        200: lightenColor(branding.primaryColor, 0.8),
        300: lightenColor(branding.primaryColor, 0.6),
        400: lightenColor(branding.primaryColor, 0.4),
        500: branding.primaryColor,
        600: darkenColor(branding.primaryColor, 0.1),
        700: darkenColor(branding.primaryColor, 0.2),
        800: darkenColor(branding.primaryColor, 0.3),
        900: darkenColor(branding.primaryColor, 0.4)
      }
    },
    fonts: {
      body: branding.brandingConfig?.fontFamily || 'Inter, sans-serif',
      heading: branding.brandingConfig?.fontFamily || 'Inter, sans-serif'
    },
    radii: {
      base: branding.brandingConfig?.borderRadius || '8px',
      md: branding.brandingConfig?.borderRadius || '8px'
    },
    space: getSpacingScale(branding.brandingConfig?.spacing || 'standard')
  };
};

// Utility functions




const _hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};





// Municipal context utilities
  if (!tenantId) return 'swedish';
  
  
  if (tenantLower.includes('de') || tenantLower.includes('german') || tenantLower.includes('deutschland')) {
    return 'german';
  }
  if (tenantLower.includes('fr') || tenantLower.includes('french') || tenantLower.includes('france')) {
    return 'french';
  }
  if (tenantLower.includes('nl') || tenantLower.includes('dutch') || tenantLower.includes('nederland')) {
    return 'dutch';
  }
  
  return 'swedish';
};

  return DEFAULT_BRANDING[culturalContext] || DEFAULT_BRANDING.swedish;
};

/**
 * DevTeam Integration: Apply municipal branding to game manifest
 * Used by automated deployment pipeline
 */
  gameManifest: Record<string, unknown>,
  branding: MunicipalBranding & { brandingLevel?: string }
): Record<string, unknown> => {
  
  // Initialize theme if not exists
  if (!brandedManifest.theme) {
    brandedManifest.theme = {};
  }
  
  // Apply branding configuration
  brandedManifest.theme.brand = {
    name: branding.municipality,
    logo: {
      url: branding.logoUrl || '',
      alt: `${branding.municipality} logotyp`,
      placement: 'header',
      maxHeight: '48px'
    }
  };
  
  // Apply color scheme
  brandedManifest.theme.colors = {
    primary: branding.primaryColor,
    primaryLight: branding.secondaryColor || lightenColor(branding.primaryColor, 0.9),
    secondary: darkenColor(branding.primaryColor, 0.3),
    success: '#38A169',
    background: '#FFFFFF',
    text: '#1A202C'
  };
  
  // Apply typography
  brandedManifest.theme.typography = {
    fontFamily: {
      heading: branding.brandingConfig?.fontFamily || 'Inter, sans-serif',
      body: branding.brandingConfig?.fontFamily || 'Inter, sans-serif'
    }
  };
  
  // Apply settings
  brandedManifest.theme.settings = {
    borderRadius: branding.brandingConfig?.borderRadius || '8px',
    spacing: branding.brandingConfig?.spacing || 'standard'
  };
  
  // Add municipal metadata
  brandedManifest.theme.municipalMetadata = {
    municipality: branding.municipality,
    culturalContext: branding.culturalContext,
    brandingLevel: branding.brandingLevel || 'standard',
    appliedAt: new Date().toISOString()
  };
  
  return brandedManifest;
};

export { type MunicipalBranding, type BrandingValidationResult };
