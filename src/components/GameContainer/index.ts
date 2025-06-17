/**
 * GameContainer Component Exports
 * Professional Municipal Layout System for DigiNativa Runtime Engine
 */

export { 
  GameContainer,
  DefaultGameContainer,
  FullscreenGameContainer,
  ModalGameContainer,
  SidebarGameContainer
} from './GameContainer';

export type {
  GameContainerProps,
  GameContainerVariant,
  MunicipalTheme,
  BrandingLevel
} from './GameContainer';

export {
  EnhancedErrorBoundary
} from './EnhancedErrorBoundary';

export type {
  ErrorFallbackProps
} from './EnhancedErrorBoundary';

// Default export
export { GameContainer as default } from './GameContainer';