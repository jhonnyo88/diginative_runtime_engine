import React, { createContext, useContext, useEffect, useMemo } from 'react';
import type { ThemeConfig } from '../types/game-manifest';
import { defaultTheme } from './defaultTheme';
import { applyTheme } from './themeUtils';

interface ThemeContextValue {
  theme: ThemeConfig;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: ThemeConfig;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  theme: customTheme 
}) => {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  // Merge custom theme with defaults
  const theme = useMemo(() => {
    if (!customTheme) return defaultTheme;
    
    return {
      brand: {
        ...defaultTheme.brand,
        ...customTheme.brand,
        logo: customTheme.brand?.logo || defaultTheme.brand.logo,
      },
      colors: {
        ...defaultTheme.colors,
        ...customTheme.colors,
      },
      typography: {
        ...defaultTheme.typography,
        ...customTheme.typography,
        fontFamily: {
          ...defaultTheme.typography?.fontFamily,
          ...customTheme.typography?.fontFamily,
        },
      },
      components: {
        ...defaultTheme.components,
        ...customTheme.components,
        button: {
          ...defaultTheme.components?.button,
          ...customTheme.components?.button,
        },
        card: {
          ...defaultTheme.components?.card,
          ...customTheme.components?.card,
        },
      },
    };
  }, [customTheme]);

  // Apply theme to CSS custom properties
  useEffect(() => {
    applyTheme(theme, isHighContrast);
  }, [theme, isHighContrast]);

  // Check for user's system preference for high contrast
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const toggleHighContrast = () => setIsHighContrast(prev => !prev);

  const value = useMemo(
    () => ({ theme, isHighContrast, toggleHighContrast }),
    [theme, isHighContrast]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};