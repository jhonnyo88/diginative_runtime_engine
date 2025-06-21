import React, { useRef, useEffect, useState } from 'react';
import { Box, BoxProps } from '@chakra-ui/react';
import { useDragDrop } from './DragDropProvider';

interface DraggableProps extends BoxProps {
  itemId: string;
  itemType: string;
  itemData?: any;
  children: React.ReactNode;
  isDisabled?: boolean;
  sourceZone?: string;
}

export const Draggable: React.FC<DraggableProps> = ({
  itemId,
  itemType,
  itemData,
  children,
  isDisabled = false,
  sourceZone,
  ...boxProps
}) => {
  const { startDrag, endDrag, isDragging, draggedItem } = useDragDrop();
  const elementRef = useRef<HTMLDivElement>(null);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingThis, setIsDraggingThis] = useState(false);

  const isCurrentlyDragging = isDragging && draggedItem?.id === itemId;

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDisabled) return;
    e.preventDefault();
    
    setIsDraggingThis(true);
    startDrag({
      id: itemId,
      type: itemType,
      data: itemData,
      sourceZone,
    });
  };

  const handleMouseUp = () => {
    if (isDraggingThis) {
      setIsDraggingThis(false);
      endDrag();
    }
  };

  // Handle touch events for Anna Svensson's iPhone 12
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDisabled) return;
    
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
    setIsDraggingThis(true);
    
    startDrag({
      id: itemId,
      type: itemType,
      data: itemData,
      sourceZone,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingThis) return;
    
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (isDraggingThis) {
      setIsDraggingThis(false);
      setTouchPosition(null);
      endDrag();
    }
  };

  // Global mouse/touch event listeners
  useEffect(() => {
    if (isDraggingThis) {
      const handleGlobalMouseUp = () => handleMouseUp();
      const handleGlobalTouchEnd = () => handleTouchEnd();

      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchend', handleGlobalTouchEnd);

      return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [isDraggingThis]);

  return (
    <>
      <Box
        ref={elementRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        cursor={isDisabled ? 'not-allowed' : isCurrentlyDragging ? 'grabbing' : 'grab'}
        opacity={isCurrentlyDragging ? 0.5 : 1}
        transform={isCurrentlyDragging ? 'scale(1.05)' : 'scale(1)'}
        transition="all 0.2s"
        userSelect="none"
        touchAction="none"
        position="relative"
        _hover={!isDisabled ? {
          transform: 'scale(1.02)',
          boxShadow: 'md',
        } : {}}
        aria-grabbed={isCurrentlyDragging}
        aria-dropeffect={isCurrentlyDragging ? 'move' : 'none'}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            if (!isCurrentlyDragging) {
              handleMouseDown(e as any);
            } else {
              handleMouseUp();
            }
          }
        }}
        {...boxProps}
      >
        {children}
      </Box>
      
      {/* Ghost image for touch dragging */}
      {isCurrentlyDragging && touchPosition && (
        <Box
          position="fixed"
          left={`${touchPosition.x}px`}
          top={`${touchPosition.y}px`}
          transform="translate(-50%, -50%)"
          pointerEvents="none"
          zIndex={9999}
          opacity={0.8}
        >
          <Box
            bg="white"
            borderRadius="md"
            boxShadow="lg"
            p={2}
            border="2px solid"
            borderColor="blue.500"
          >
            {children}
          </Box>
        </Box>
      )}
    </>
  );
};