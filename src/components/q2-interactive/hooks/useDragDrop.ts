/**
 * useDragDrop Hook - Municipal Drag-Drop Functionality
 * Task: proposal-029 - Q2 Interactive Mechanics Implementation
 * 
 * Optimized drag-drop hook with 60fps performance för Anna Svensson iPhone 12
 * Includes accessibility support and municipal validation
 */

import { useState, useCallback, useRef } from 'react';

interface DragDropConfig {
  onDrop: (itemId: string, targetId: string) => Promise<boolean>;
  validateDrop?: (itemId: string, targetId: string) => boolean;
  onDragStart?: (itemId: string) => void;
  onDragEnd?: () => void;
  performanceOptimized?: boolean;
}

interface DragDropState {
  isDragging: boolean;
  draggedItem: string | null;
  dragOffset: { x: number; y: number };
  validDropTarget: string | null;
}

export const useDragDrop = (config: DragDropConfig) => {
  const [state, setState] = useState<DragDropState>({
    isDragging: false,
    draggedItem: null,
    dragOffset: { x: 0, y: 0 },
    validDropTarget: null
  });

  const dragElementRef = useRef<HTMLElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const handleDragStart = useCallback((event: React.DragEvent, itemId: string) => {
    const element = event.currentTarget as HTMLElement;
    dragElementRef.current = element;

    // Get initial drag offset för smooth visual feedback
    const rect = element.getBoundingClientRect();
    const offset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    setState(prev => ({
      ...prev,
      isDragging: true,
      draggedItem: itemId,
      dragOffset: offset
    }));

    // Add drag data för accessibility
    event.dataTransfer.setData('text/plain', itemId);
    event.dataTransfer.effectAllowed = 'move';

    // Custom drag image för better UX
    if (config.performanceOptimized !== false) {
      const dragImage = element.cloneNode(true) as HTMLElement;
      dragImage.style.transform = 'rotate(3deg)';
      dragImage.style.opacity = '0.8';
      dragImage.style.pointerEvents = 'none';
      
      // Temporarily add to DOM för drag image
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, offset.x, offset.y);
      
      // Clean up after a frame
      requestAnimationFrame(() => {
        document.body.removeChild(dragImage);
      });
    }

    config.onDragStart?.(itemId);

    // Add drag class för styling
    element.classList.add('dragging');
  }, [config]);

  const handleDragEnd = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDragging: false,
      draggedItem: null,
      validDropTarget: null
    }));

    // Clean up styling
    if (dragElementRef.current) {
      dragElementRef.current.classList.remove('dragging');
      dragElementRef.current = null;
    }

    // Cancel any pending animation frames
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    config.onDragEnd?.();
  }, [config]);

  const handleDragOver = useCallback((event: React.DragEvent, targetId: string) => {
    event.preventDefault();

    const { draggedItem } = state;
    if (!draggedItem) return;

    // Validate drop target
    const isValidDrop = config.validateDrop?.(draggedItem, targetId) !== false;
    
    if (isValidDrop) {
      event.dataTransfer.dropEffect = 'move';
      
      setState(prev => ({
        ...prev,
        validDropTarget: targetId
      }));
    } else {
      event.dataTransfer.dropEffect = 'none';
      
      setState(prev => ({
        ...prev,
        validDropTarget: null
      }));
    }

    // Performance-optimized visual feedback
    if (config.performanceOptimized !== false) {
      const element = event.currentTarget as HTMLElement;
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        if (isValidDrop) {
          element.classList.add('drag-over-valid');
          element.classList.remove('drag-over-invalid');
        } else {
          element.classList.add('drag-over-invalid');
          element.classList.remove('drag-over-valid');
        }
      });
    }
  }, [state, config]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    const element = event.currentTarget as HTMLElement;
    
    setState(prev => ({
      ...prev,
      validDropTarget: null
    }));

    // Clean up drag-over styling
    if (config.performanceOptimized !== false) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        element.classList.remove('drag-over-valid', 'drag-over-invalid');
      });
    }
  }, [config]);

  const handleDrop = useCallback(async (event: React.DragEvent, targetId: string) => {
    event.preventDefault();
    
    const itemId = event.dataTransfer.getData('text/plain') || state.draggedItem;
    if (!itemId) return;

    // Clean up visual feedback immediately
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('drag-over-valid', 'drag-over-invalid');

    // Validate drop one more time
    const isValidDrop = config.validateDrop?.(itemId, targetId) !== false;
    if (!isValidDrop) {
      console.warn('Invalid drop detected');
      return;
    }

    try {
      // Perform the drop operation
      const success = await config.onDrop(itemId, targetId);
      
      if (success) {
        // Success animation (optional)
        if (config.performanceOptimized !== false) {
          element.classList.add('drop-success');
          setTimeout(() => {
            element.classList.remove('drop-success');
          }, 300);
        }
      } else {
        // Error feedback
        if (config.performanceOptimized !== false) {
          element.classList.add('drop-error');
          setTimeout(() => {
            element.classList.remove('drop-error');
          }, 300);
        }
      }
    } catch (error) {
      console.error('Drop operation failed:', error);
      
      // Error feedback
      if (config.performanceOptimized !== false) {
        element.classList.add('drop-error');
        setTimeout(() => {
          element.classList.remove('drop-error');
        }, 300);
      }
    }
  }, [state, config]);

  // Touch support för mobile devices (Anna Svensson iPhone 12)
  const handleTouchStart = useCallback((event: React.TouchEvent, itemId: string) => {
    const touch = event.touches[0];
    const element = event.currentTarget as HTMLElement;
    
    setState(prev => ({
      ...prev,
      isDragging: true,
      draggedItem: itemId,
      dragOffset: {
        x: touch.clientX - element.getBoundingClientRect().left,
        y: touch.clientY - element.getBoundingClientRect().top
      }
    }));

    config.onDragStart?.(itemId);
    element.classList.add('touch-dragging');
  }, [config]);

  const handleTouchEnd = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDragging: false,
      draggedItem: null,
      validDropTarget: null
    }));

    // Clean up touch styling
    if (dragElementRef.current) {
      dragElementRef.current.classList.remove('touch-dragging');
    }

    config.onDragEnd?.();
  }, [config]);

  return {
    // State
    isDragging: state.isDragging,
    draggedItem: state.draggedItem,
    validDropTarget: state.validDropTarget,
    
    // Event handlers
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    
    // Touch support
    handleTouchStart,
    handleTouchEnd,
    
    // Utility methods
    canDrop: (itemId: string, targetId: string) => {
      return config.validateDrop?.(itemId, targetId) !== false;
    }
  };
};