import React from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import type { ThemeConfig } from '../types/game-manifest';
import { defaultTheme } from './defaultTheme';
import { municipalButtonTheme } from './municipalButtonTheme';

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
    components: {
      Button: {
        ...municipalButtonTheme,
        baseStyle: {
          ...municipalButtonTheme.baseStyle,
          fontWeight: '600',
          borderRadius: 'md',
          _focus: {
            boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.5)',
          },
        },
        sizes: {
          ...municipalButtonTheme.sizes,
          lg: {
            h: '48px',
            minW: '48px',
            fontSize: 'lg',
            px: 6,
          },
        },
        variants: {
          ...municipalButtonTheme.variants,
          solid: (props: Record<string, unknown>) => {
            const { colorScheme } = props;
            if (colorScheme === 'brand') {
              return {
                bg: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
                color: 'white',
                border: '1px solid transparent',
                boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)',
                _hover: {
                  bg: 'linear-gradient(135deg, #0052A3 0%, #003366 100%)',
                  boxShadow: '0 6px 16px rgba(0, 102, 204, 0.4)',
                  transform: 'translateY(-1px)',
                  _disabled: {
                    bg: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
                    transform: 'none',
                  },
                },
                _active: {
                  bg: 'linear-gradient(135deg, #003d73 0%, #002244 100%)',
                  transform: 'translateY(0px)',
                  boxShadow: '0 2px 8px rgba(0, 102, 204, 0.3)',
                },
                _disabled: {
                  opacity: 0.6,
                  cursor: 'not-allowed',
                  _hover: {
                    bg: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
                    transform: 'none',
                  },
                },
              };
            }
            if (colorScheme === 'blue') {
              return {
                bg: 'linear-gradient(135deg, #2B6CB0 0%, #2C5282 100%)',
                color: 'white',
                border: '1px solid transparent',
                boxShadow: '0 4px 12px rgba(43, 108, 176, 0.3)',
                _hover: {
                  bg: 'linear-gradient(135deg, #2A5490 0%, #1A365D 100%)',
                  boxShadow: '0 6px 16px rgba(43, 108, 176, 0.4)',
                  transform: 'translateY(-1px)',
                  _disabled: {
                    bg: 'linear-gradient(135deg, #2B6CB0 0%, #2C5282 100%)',
                    transform: 'none',
                  },
                },
                _active: {
                  bg: 'linear-gradient(135deg, #1A365D 0%, #153E75 100%)',
                  transform: 'translateY(0px)',
                  boxShadow: '0 2px 8px rgba(43, 108, 176, 0.3)',
                },
              };
            }
            if (colorScheme === 'green') {
              return {
                bg: 'linear-gradient(135deg, #38A169 0%, #2F855A 100%)',
                color: 'white',
                border: '1px solid transparent',
                boxShadow: '0 4px 12px rgba(56, 161, 105, 0.3)',
                _hover: {
                  bg: 'linear-gradient(135deg, #2F855A 0%, #276749 100%)',
                  boxShadow: '0 6px 16px rgba(56, 161, 105, 0.4)',
                  transform: 'translateY(-1px)',
                },
                _active: {
                  bg: 'linear-gradient(135deg, #276749 0%, #22543D 100%)',
                  transform: 'translateY(0px)',
                  boxShadow: '0 2px 8px rgba(56, 161, 105, 0.3)',
                },
              };
            }
            return {};
          },
          outline: (props: Record<string, unknown>) => {
            const { colorScheme } = props;
            if (colorScheme === 'blue') {
              return {
                border: '2px solid',
                borderColor: 'blue.500',
                color: 'blue.600',
                bg: 'transparent',
                _hover: {
                  bg: 'blue.50',
                  borderColor: 'blue.600',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(43, 108, 176, 0.2)',
                },
                _active: {
                  bg: 'blue.100',
                  transform: 'translateY(0px)',
                },
              };
            }
            if (colorScheme === 'purple') {
              return {
                border: '2px solid',
                borderColor: 'purple.500',
                color: 'purple.600',
                bg: 'transparent',
                _hover: {
                  bg: 'purple.50',
                  borderColor: 'purple.600',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(128, 90, 213, 0.2)',
                },
                _active: {
                  bg: 'purple.100',
                  transform: 'translateY(0px)',
                },
              };
            }
            return {};
          },
          ghost: {
            bg: 'transparent',
            _hover: {
              bg: 'gray.100',
              transform: 'translateY(-1px)',
            },
            _active: {
              bg: 'gray.200',
              transform: 'translateY(0px)',
            },
          },
        },
      },
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