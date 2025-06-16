import React from 'react';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import type { ThemeConfig } from '../types/game-manifest';
import { defaultTheme } from './defaultTheme';

/**
 * Create Chakra system with our custom theme
 */
export const createChakraSystem = (gameTheme?: ThemeConfig) => {
  const theme = gameTheme || defaultTheme;
  
  return createSystem({
    ...defaultConfig,
    theme: {
      tokens: {
        colors: {
          brand: {
            50: { value: theme.colors?.primaryLight || '#e3f2fd' },
            100: { value: theme.colors?.primaryLight || '#bbdefb' },
            500: { value: theme.colors?.primary || '#005293' },
            600: { value: theme.colors?.primaryDark || '#003d6e' },
            900: { value: theme.colors?.primaryDark || '#0d47a1' },
          },
          secondary: {
            500: { value: theme.colors?.secondary || '#f5a623' },
            600: { value: theme.colors?.secondaryDark || '#d4901d' },
          },
        },
        fonts: {
          heading: { value: theme.typography?.fontFamily?.heading || 'system-ui' },
          body: { value: theme.typography?.fontFamily?.body || 'system-ui' },
        },
        spacing: {
          xs: { value: '4px' },
          sm: { value: '8px' },
          md: { value: '16px' },
          lg: { value: '24px' },
          xl: { value: '32px' },
        },
      },
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
  const system = createChakraSystem(gameTheme);
  
  return (
    <ChakraProvider value={system}>
      {children}
    </ChakraProvider>
  );
};