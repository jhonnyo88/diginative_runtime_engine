import type { ThemeConfig } from '../types/game-manifest';

/**
 * Default theme for DigiNativa Runtime Engine
 * Optimized for Swedish public sector and Anna Svensson persona
 * WCAG 2.1 AA compliant colors
 */
export const defaultTheme: ThemeConfig = {
  brand: {
    name: 'DigiNativa',
    logo: {
      url: '/logo-diginativa.svg',
      alt: 'DigiNativa - Digital Learning Platform',
      placement: 'header',
      maxHeight: '48px',
    },
  },
  
  colors: {
    // Swedish public sector inspired colors
    primary: '#005293',        // Swedish blue
    primaryDark: '#003d6e',
    primaryLight: '#2d7ab8',
    
    secondary: '#f5a623',      // Warm accent
    secondaryDark: '#d4901d',
    secondaryLight: '#f7c766',
    
    // Semantic colors
    success: '#028a3d',        // Green
    error: '#d32f2f',          // Red
    warning: '#f5a623',        // Orange
    info: '#0288d1',           // Light blue
    
    // UI colors
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#212121',           // High contrast black
    textSecondary: '#666666',
    border: '#e0e0e0',
  },
  
  typography: {
    fontFamily: {
      // System fonts for performance and compatibility
      heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
    },
    fontSizeScale: 1.0, // Base scale, can be adjusted for accessibility
  },
  
  components: {
    button: {
      borderRadius: '8px',
      fontWeight: '600',
    },
    card: {
      borderRadius: '12px',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
  },
};

/**
 * Example theme for a Swedish municipality
 */
export const municipalityTheme: ThemeConfig = {
  brand: {
    name: 'Malmö Stad',
    logo: {
      url: '/logo-malmo.svg',
      alt: 'Malmö Stad',
      placement: 'header',
      maxHeight: '56px',
    },
  },
  
  colors: {
    primary: '#00685e',        // Malmö green
    primaryDark: '#004d46',
    primaryLight: '#2d8a82',
    
    secondary: '#e20e17',      // Malmö red accent
    secondaryDark: '#b30b13',
    secondaryLight: '#e8464d',
  },
};

/**
 * Example theme for a corporate client
 */
export const corporateTheme: ThemeConfig = {
  brand: {
    name: 'TechCorp AB',
    logo: {
      url: '/logo-techcorp.svg',
      alt: 'TechCorp',
      placement: 'corner',
      maxHeight: '40px',
    },
  },
  
  colors: {
    primary: '#1976d2',
    primaryDark: '#115293',
    primaryLight: '#4791db',
    
    secondary: '#7c4dff',
    secondaryDark: '#5e35b1',
    secondaryLight: '#9575cd',
    
    background: '#fafafa',
    surface: '#ffffff',
  },
  
  typography: {
    fontFamily: {
      heading: '"Inter", -apple-system, sans-serif',
      body: '"Inter", -apple-system, sans-serif',
    },
  },
  
  components: {
    button: {
      borderRadius: '4px',
      fontWeight: '500',
    },
    card: {
      borderRadius: '8px',
      shadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
    },
  },
};

/**
 * Example theme for an NGO
 */
export const ngoTheme: ThemeConfig = {
  brand: {
    name: 'Green Future',
    logo: {
      url: '/logo-greenfuture.svg',
      alt: 'Green Future NGO',
      placement: 'header',
      maxHeight: '52px',
    },
  },
  
  colors: {
    primary: '#2e7d32',        // Environmental green
    primaryDark: '#1b5e20',
    primaryLight: '#4caf50',
    
    secondary: '#ff6f00',      // Warm orange
    secondaryDark: '#e65100',
    secondaryLight: '#ff9800',
    
    background: '#f1f8e9',     // Light green tint
    surface: '#ffffff',
  },
  
  typography: {
    fontFamily: {
      heading: '"Poppins", -apple-system, sans-serif',
      body: '"Open Sans", -apple-system, sans-serif',
    },
  },
  
  components: {
    button: {
      borderRadius: '24px',     // Rounded, friendly
      fontWeight: '600',
    },
    card: {
      borderRadius: '16px',
      shadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
  },
};