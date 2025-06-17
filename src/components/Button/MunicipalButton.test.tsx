import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MunicipalButton } from './MunicipalButton';
import { createChakraTheme } from '../../theme/ChakraThemeProvider';

// Helper to render with theme
const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createChakraTheme();
  return render(
    <ChakraProvider theme={theme}>
      {ui}
    </ChakraProvider>
  );
};

describe('MunicipalButton', () => {
  describe('Variants', () => {
    it('renders municipal-primary variant correctly', () => {
      renderWithTheme(
        <MunicipalButton variant="municipal-primary">
          Starta utbildningen
        </MunicipalButton>
      );
      
      const button = screen.getByRole('button', { name: 'Starta utbildningen' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveStyle({
        fontWeight: '500',
        borderRadius: '6px'
      });
    });

    it('renders municipal-secondary variant correctly', () => {
      renderWithTheme(
        <MunicipalButton variant="municipal-secondary">
          Avbryt
        </MunicipalButton>
      );
      
      const button = screen.getByRole('button', { name: 'Avbryt' });
      expect(button).toBeInTheDocument();
    });

    it('renders municipal-outline variant correctly', () => {
      renderWithTheme(
        <MunicipalButton variant="municipal-outline">
          Läs mer
        </MunicipalButton>
      );
      
      const button = screen.getByRole('button', { name: 'Läs mer' });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Cultural Context', () => {
    it('applies Swedish cultural context', () => {
      renderWithTheme(
        <MunicipalButton culturalContext="swedish" municipalEntity="Malmö Stad">
          Fortsätt
        </MunicipalButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-cultural-context', 'swedish');
      expect(button).toHaveAttribute('data-municipal-entity', 'Malmö Stad');
    });

    it('shows correct loading text for German context', () => {
      renderWithTheme(
        <MunicipalButton culturalContext="german" isLoading>
          Weiter
        </MunicipalButton>
      );
      
      expect(screen.getByText('Verarbeitung...')).toBeInTheDocument();
    });

    it('shows correct loading text for French context', () => {
      renderWithTheme(
        <MunicipalButton culturalContext="french" isLoading>
          Continuer
        </MunicipalButton>
      );
      
      expect(screen.getByText('Traitement...')).toBeInTheDocument();
    });

    it('shows correct loading text for Dutch context', () => {
      renderWithTheme(
        <MunicipalButton culturalContext="dutch" isLoading>
          Doorgaan
        </MunicipalButton>
      );
      
      expect(screen.getByText('Verwerken...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has minimum touch target size for Anna Svensson', () => {
      renderWithTheme(
        <MunicipalButton annaOptimization={true}>
          Svara
        </MunicipalButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        minHeight: '48px'
      });
    });

    it('supports aria-label', () => {
      renderWithTheme(
        <MunicipalButton aria-label="Svara på frågan">
          Svara
        </MunicipalButton>
      );
      
      const button = screen.getByRole('button', { name: 'Svara på frågan' });
      expect(button).toBeInTheDocument();
    });

    it('applies accessibility standard attribute', () => {
      renderWithTheme(
        <MunicipalButton accessibilityStandard="DOS2018">
          Fortsätt
        </MunicipalButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-accessibility-standard', 'DOS2018');
    });
  });

  describe('Interactions', () => {
    it('handles click events', () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <MunicipalButton onClick={handleClick}>
          Klicka här
        </MunicipalButton>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('respects disabled state', () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <MunicipalButton onClick={handleClick} isDisabled>
          Inaktiverad
        </MunicipalButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('shows loading state with custom text', () => {
      renderWithTheme(
        <MunicipalButton isLoading loadingText="Sparar...">
          Spara
        </MunicipalButton>
      );
      
      expect(screen.getByText('Sparar...')).toBeInTheDocument();
    });
  });

  describe('Government Context', () => {
    it('applies government level attributes', () => {
      renderWithTheme(
        <MunicipalButton 
          governmentLevel="municipal"
          municipalEntity="Malmö Stad"
        >
          Kommun knapp
        </MunicipalButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-government-level', 'municipal');
    });
  });
});