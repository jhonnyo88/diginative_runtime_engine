import React from 'react';
import { Icon } from '@chakra-ui/react';

// Base icon component following Game Designer's specifications
// - 24px minimum touch targets
// - 2px stroke width for mobile visibility
// - WCAG AA contrast compliance
// - Screen reader accessibility

// Define our own IconProps since Chakra UI v2 might not export it
interface IconProps {
  color?: string;
  boxSize?: string | number;
  w?: string | number;
  h?: string | number;
  'aria-label'?: string;
}

interface GameIconProps extends Omit<IconProps, 'children'> {
  'aria-label'?: string;
}

export const NextIcon: React.FC<GameIconProps> = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      d="M9 6l6 6-6 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export const PreviousIcon: React.FC<GameIconProps> = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      d="M15 18l-6-6 6-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export const PlayIcon: React.FC<GameIconProps> = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      d="M8 5v14l11-7z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export const CheckIcon: React.FC<GameIconProps> = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      d="M20 6L9 17l-5-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export const CloseIcon: React.FC<GameIconProps> = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      d="M18 6L6 18M6 6l12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export const InfoIcon: React.FC<GameIconProps> = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M12 16v-4M12 8h.01"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export const StarIcon: React.FC<GameIconProps> = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export const CertificateIcon: React.FC<GameIconProps> = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      d="M15 3v4.5l-3.5 2L8 7.5V3h7zM8 21v-8l3.5 2L15 13v8l-3.5-2L8 21z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="4"
      y="3"
      width="16"
      height="10"
      rx="1"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  </Icon>
);

export const ProgressIcon: React.FC<GameIconProps> = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 4L12 14.01l-3-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export const ClockIcon: React.FC<GameIconProps> = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M12 6v6l4 2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export const RestartIcon: React.FC<GameIconProps> = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 16H3v5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

// Game Designer's specification: Icon usage with proper accessibility
export const GameIconButton: React.FC<{
  icon: React.ComponentType<GameIconProps>;
  'aria-label': string;
  onClick?: () => void;
  size?: string;
  color?: string;
  disabled?: boolean;
}> = ({ 
  icon: IconComponent, 
  'aria-label': ariaLabel, 
  onClick, 
  size = "24px", 
  color = "currentColor",
  disabled = false
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    style={{
      background: 'none',
      border: 'none',
      padding: '12px', // 48px total touch target
      cursor: disabled ? 'not-allowed' : 'pointer',
      color: disabled ? '#a0a0a0' : color,
      minWidth: '48px',
      minHeight: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
    }}
  >
    <IconComponent 
      aria-label={ariaLabel}
      w={size} 
      h={size}
    />
  </button>
);