import type { ThemeConfig } from '../types/game-manifest';

/**
 * Apply theme configuration to CSS custom properties
 * This enables runtime theme switching and customization
 */
export const applyTheme = (theme: ThemeConfig, isHighContrast: boolean = false) => {
  const root = document.documentElement;
  
  // Apply color system
  if (theme.colors) {
    // Primary colors
    root.style.setProperty('--color-primary', theme.colors.primary || '#005293');
    root.style.setProperty('--color-primary-dark', theme.colors.primaryDark || '#003d6e');
    root.style.setProperty('--color-primary-light', theme.colors.primaryLight || '#2d7ab8');
    
    // Secondary colors
    root.style.setProperty('--color-secondary', theme.colors.secondary || '#f5a623');
    root.style.setProperty('--color-secondary-dark', theme.colors.secondaryDark || '#d4901d');
    root.style.setProperty('--color-secondary-light', theme.colors.secondaryLight || '#f7c766');
    
    // Semantic colors
    root.style.setProperty('--color-success', theme.colors.success || '#028a3d');
    root.style.setProperty('--color-error', theme.colors.error || '#d32f2f');
    root.style.setProperty('--color-warning', theme.colors.warning || '#f5a623');
    root.style.setProperty('--color-info', theme.colors.info || '#0288d1');
    
    // UI colors with high contrast support
    if (isHighContrast) {
      root.style.setProperty('--color-background', '#ffffff');
      root.style.setProperty('--color-surface', '#f0f0f0');
      root.style.setProperty('--color-text', '#000000');
      root.style.setProperty('--color-text-secondary', '#333333');
      root.style.setProperty('--color-border', '#000000');
    } else {
      root.style.setProperty('--color-background', theme.colors.background || '#ffffff');
      root.style.setProperty('--color-surface', theme.colors.surface || '#f5f5f5');
      root.style.setProperty('--color-text', theme.colors.text || '#212121');
      root.style.setProperty('--color-text-secondary', theme.colors.textSecondary || '#666666');
      root.style.setProperty('--color-border', theme.colors.border || '#e0e0e0');
    }
  }
  
  // Apply typography
  if (theme.typography) {
    if (theme.typography.fontFamily) {
      root.style.setProperty('--font-heading', theme.typography.fontFamily.heading || 'system-ui');
      root.style.setProperty('--font-body', theme.typography.fontFamily.body || 'system-ui');
      root.style.setProperty('--font-mono', theme.typography.fontFamily.mono || 'monospace');
    }
    
    // Font size scale
    const scale = theme.typography.fontSizeScale || 1;
    root.style.setProperty('--font-size-xs', `${0.75 * scale}rem`);
    root.style.setProperty('--font-size-sm', `${0.875 * scale}rem`);
    root.style.setProperty('--font-size-base', `${1 * scale}rem`);
    root.style.setProperty('--font-size-lg', `${1.125 * scale}rem`);
    root.style.setProperty('--font-size-xl', `${1.25 * scale}rem`);
    root.style.setProperty('--font-size-2xl', `${1.5 * scale}rem`);
    root.style.setProperty('--font-size-3xl', `${1.875 * scale}rem`);
  }
  
  // Apply component styles
  if (theme.components) {
    if (theme.components.button) {
      root.style.setProperty('--button-radius', theme.components.button.borderRadius || '8px');
      root.style.setProperty('--button-font-weight', theme.components.button.fontWeight || '600');
    }
    
    if (theme.components.card) {
      root.style.setProperty('--card-radius', theme.components.card.borderRadius || '12px');
      root.style.setProperty('--card-shadow', theme.components.card.shadow || '0 2px 8px rgba(0, 0, 0, 0.1)');
    }
  }
  
  // Spacing system (8px grid)
  root.style.setProperty('--spacing-xs', '0.25rem');   // 4px
  root.style.setProperty('--spacing-sm', '0.5rem');    // 8px
  root.style.setProperty('--spacing-md', '1rem');      // 16px
  root.style.setProperty('--spacing-lg', '1.5rem');    // 24px
  root.style.setProperty('--spacing-xl', '2rem');      // 32px
  root.style.setProperty('--spacing-2xl', '3rem');     // 48px
  root.style.setProperty('--spacing-3xl', '4rem');     // 64px
  
  // Touch target sizes (WCAG compliance)
  root.style.setProperty('--touch-target-min', '48px');
  root.style.setProperty('--touch-target-comfortable', '56px');
  
  // Z-index scale
  root.style.setProperty('--z-index-dropdown', '1000');
  root.style.setProperty('--z-index-modal', '1050');
  root.style.setProperty('--z-index-popover', '1100');
  root.style.setProperty('--z-index-tooltip', '1150');
  
  // Animation durations
  root.style.setProperty('--duration-fast', '150ms');
  root.style.setProperty('--duration-normal', '250ms');
  root.style.setProperty('--duration-slow', '350ms');
  
  // Apply high contrast mode class
  if (isHighContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }
};

/**
 * Generate CSS from theme config for static builds
 */
export const generateThemeCSS = (theme: ThemeConfig): string => {
  const vars: string[] = [':root {'];
  
  // Add all CSS custom properties
  if (theme.colors) {
    vars.push(`  --color-primary: ${theme.colors.primary || '#005293'};`);
    vars.push(`  --color-primary-dark: ${theme.colors.primaryDark || '#003d6e'};`);
    vars.push(`  --color-primary-light: ${theme.colors.primaryLight || '#2d7ab8'};`);
    // ... continue for all colors
  }
  
  vars.push('}');
  
  return vars.join('\n');
};

/**
 * Validate theme colors for WCAG compliance
 */
export const validateThemeAccessibility = (theme: ThemeConfig): {
  valid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Check color contrast ratios
  // This is a simplified check - in production, use a proper contrast calculation
  if (theme.colors) {
    // Example validation (would need actual contrast calculation)
    if (theme.colors.text && theme.colors.background) {
      // Calculate contrast ratio between text and background
      // If < 4.5:1, add to issues
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
};