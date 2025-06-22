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
const MOBILE_BRANDING_CONSTRAINTS = {
  minTouchTarget: 48, // 48px minimum for iPhone 12
  maxLogoWidth: 120, // Prevent logo overflow on mobile
  maxLogoHeight: 60,
  colorContrastRatio: 4.5, // WCAG AA compliance
  loadingBudget: 100 // 100ms max for branding assets
};

export const validateMunicipalBranding = (branding?: Partial<MunicipalBranding>): BrandingValidationResult => {
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
  const culturalContext = branding.culturalContext || 'swedish';
  if (!DEFAULT_BRANDING[culturalContext]) {
    warnings.push(`Unknown cultural context: ${culturalContext}. Using Swedish default.`);
  }

  // Create sanitized branding with fallbacks
  const baseBranding = DEFAULT_BRANDING[culturalContext] || DEFAULT_BRANDING.swedish;
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

export const injectMunicipalBranding = (branding: MunicipalBranding): React.CSSProperties => {
  return {
    '--municipal-primary': branding.primaryColor,
    '--municipal-secondary': branding.secondaryColor || lightenColor(branding.primaryColor, 0.9),
    '--municipal-font': branding.brandingConfig?.fontFamily || 'Inter, sans-serif',
    '--municipal-radius': branding.brandingConfig?.borderRadius || '8px',
    '--municipal-spacing': getSpacingValue(branding.brandingConfig?.spacing || 'standard')
  } as React.CSSProperties;
};

export const getMunicipalThemeOverrides = (branding: MunicipalBranding) => {
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
const isValidHexColor = (color?: string): boolean => {
  if (!color) return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

const isValidUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isSupportedImageFormat = (url: string): boolean => {
  const supportedFormats = ['.svg', '.png', '.jpg', '.jpeg', '.webp'];
  return supportedFormats.some(format => url.toLowerCase().includes(format));
};

const meetsContrastRequirements = (color: string): boolean => {
  // Basic contrast check - in production use proper contrast calculation
  const rgb = hexToRgb(color);
  if (!rgb) return false;
  
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.3 && luminance < 0.7; // Reasonable contrast range
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const lightenColor = (color: string, amount: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const lighten = (channel: number) => Math.min(255, Math.round(channel + (255 - channel) * amount));
  
  return `#${lighten(rgb.r).toString(16).padStart(2, '0')}${lighten(rgb.g).toString(16).padStart(2, '0')}${lighten(rgb.b).toString(16).padStart(2, '0')}`;
};

const darkenColor = (color: string, amount: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const darken = (channel: number) => Math.max(0, Math.round(channel * (1 - amount)));
  
  return `#${darken(rgb.r).toString(16).padStart(2, '0')}${darken(rgb.g).toString(16).padStart(2, '0')}${darken(rgb.b).toString(16).padStart(2, '0')}`;
};

const getSpacingValue = (spacing: string): string => {
  const spacingMap = {
    compact: '0.75rem',
    standard: '1rem',
    spacious: '1.5rem'
  };
  return spacingMap[spacing as keyof typeof spacingMap] || spacingMap.standard;
};

const getSpacingScale = (spacing: string) => {
  const scales = {
    compact: {
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem'
    },
    standard: {
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem'
    },
    spacious: {
      1: '0.5rem',
      2: '0.75rem',
      3: '1rem',
      4: '1.5rem',
      5: '2rem',
      6: '2.5rem',
      8: '3rem'
    }
  };
  
  return scales[spacing as keyof typeof scales] || scales.standard;
};

// Municipal context utilities
export const getMunicipalContext = (tenantId?: string): 'swedish' | 'german' | 'french' | 'dutch' => {
  if (!tenantId) return 'swedish';
  
  const tenantLower = tenantId.toLowerCase();
  
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

export const getDefaultBranding = (culturalContext: 'swedish' | 'german' | 'french' | 'dutch'): MunicipalBranding => {
  return DEFAULT_BRANDING[culturalContext] || DEFAULT_BRANDING.swedish;
};

/**
 * DevTeam Integration: Apply municipal branding to game manifest
 * Used by automated deployment pipeline
 */
export const applyMunicipalBrandingToManifest = (
  gameManifest: Record<string, unknown>,
  branding: MunicipalBranding & { brandingLevel?: string }
): Record<string, unknown> => {
  const brandedManifest = JSON.parse(JSON.stringify(gameManifest)); // Deep clone
  
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
