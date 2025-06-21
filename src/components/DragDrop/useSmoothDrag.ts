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

export const useSmoothDrag = (options: SmoothDragOptions = {}) => {
  const {
    onDragStart,
    onDragMove,
    onDragEnd,
    threshold = 5,
  } = options;

  const isDraggingRef = useRef(false);
  const startPositionRef = useRef<Position>({ x: 0, y: 0 });
  const currentPositionRef = useRef<Position>({ x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  // Use RAF for smooth 60fps updates
  const updatePosition = useCallback(() => {
    if (!isDraggingRef.current) return;

    onDragMove?.(currentPositionRef.current);
    rafIdRef.current = requestAnimationFrame(updatePosition);
  }, [onDragMove]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    startPositionRef.current = { x: clientX, y: clientY };
    currentPositionRef.current = { x: clientX, y: clientY };
    
    onDragStart?.(startPositionRef.current);
    
    // Start animation loop
    rafIdRef.current = requestAnimationFrame(updatePosition);
  }, [onDragStart, updatePosition]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;

    // Check threshold to prevent accidental drags
    const dx = Math.abs(clientX - startPositionRef.current.x);
    const dy = Math.abs(clientY - startPositionRef.current.y);
    
    if (dx > threshold || dy > threshold) {
      currentPositionRef.current = { x: clientX, y: clientY };
    }
  }, [threshold]);

  const handleEnd = useCallback(() => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    onDragEnd?.(currentPositionRef.current);
  }, [onDragEnd]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  }, [handleStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Set up and clean up event listeners
  const attachListeners = useCallback((element: HTMLElement) => {
    elementRef.current = element;
    
    // Mouse events
    element.addEventListener('mousedown', handleMouseDown);
    
    // Touch events
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    // Global move and end events
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleGlobalTouchMove = (e: TouchEvent) => handleTouchMove(e);
    const handleGlobalTouchEnd = () => handleTouchEnd();
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
    window.addEventListener('touchend', handleGlobalTouchEnd, { passive: true });
    
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
      
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    attachListeners,
    isDragging: isDraggingRef.current,
    position: currentPositionRef.current,
  };
};