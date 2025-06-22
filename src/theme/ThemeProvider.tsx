import React, { createContext, useContext, useEffect, useMemo } from 'react';
import type { ThemeConfig } from '../types/game-manifest';
import { defaultTheme } from './defaultTheme';
import { applyTheme } from './themeUtils';

interface ThemeContextValue {
  theme: ThemeConfig;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
}


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
};
