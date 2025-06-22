import { useRef, useCallback, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface SmoothDragOptions {
  onDragStart?: (position: Position) => void;
  onDragMove?: (position: Position) => void;
  onDragEnd?: (position: Position) => void;
  threshold?: number;
}

  const {
    onDragStart,
    onDragMove,
    onDragEnd,
    threshold = 5,
  } = options;


  // Use RAF for smooth 60fps updates
