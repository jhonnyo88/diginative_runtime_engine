import React from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import type { ThemeConfig } from '../types/game-manifest';
import { defaultTheme } from './defaultTheme';

/**
 * Create Chakra theme with our custom configuration for v2
 */
export const createChakraTheme = (gameTheme?: ThemeConfig) => {
  const theme = gameTheme || defaultTheme;
  
  return extendTheme({
    colors: {
      brand: {
        50: theme.colors?.primaryLight || '#e3f2fd',
        100: theme.colors?.primaryLight || '#bbdefb',
        500: theme.colors?.primary || '#005293',
        600: theme.colors?.primaryDark || '#003d6e',
        900: theme.colors?.primaryDark || '#0d47a1',
      },
      secondary: {
        500: theme.colors?.secondary || '#f5a623',
        600: theme.colors?.secondaryDark || '#d4901d',
      },
    },
    fonts: {
      heading: theme.typography?.fontFamily?.heading || 'system-ui',
      body: theme.typography?.fontFamily?.body || 'system-ui',
    },
    space: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
    config: {
      initialColorMode: 'light',
      useSystemColorMode: false,
    },
  });
};

interface ChakraThemeProviderProps {
  children: React.ReactNode;
  gameTheme?: ThemeConfig;
}

export const ChakraThemeProvider: React.FC<ChakraThemeProviderProps> = ({ 
  children, 
  gameTheme 
}) => {
  const theme = createChakraTheme(gameTheme);
  
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
};