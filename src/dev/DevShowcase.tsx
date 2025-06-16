import React from 'react';
import { ComponentShowcase } from '../stories/ComponentShowcase';

// Development-only component showcase route
export const DevShowcase: React.FC = () => {
  // Only render in development
  if (import.meta.env.PROD) {
    return null;
  }

  return <ComponentShowcase />;
};