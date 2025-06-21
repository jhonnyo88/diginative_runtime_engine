import React, { useEffect, useRef, useState } from 'react';
import { Box, BoxProps } from '@chakra-ui/react';
import { useDragDrop, DragItem } from './DragDropProvider';

interface DropZoneProps extends BoxProps {
  zoneId: string;
  accepts: string[];
  onDrop: (item: DragItem) => void;
  children: React.ReactNode;
  isDisabled?: boolean;
  showDropIndicator?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  zoneId,
  accepts,
  onDrop,
  children,
  isDisabled = false,
  showDropIndicator = true,
  ...boxProps
}) => {
  const { draggedItem, registerDropZone, unregisterDropZone, endDrag } = useDragDrop();
  const [isOver, setIsOver] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const canAccept = draggedItem && accepts.includes(draggedItem.type);
  const showHighlight = isOver && canAccept && !isDisabled;

  useEffect(() => {
    registerDropZone(zoneId, {
      accepts,
      onDrop,
      isOver: false,
    });

    return () => {
      unregisterDropZone(zoneId);
    };
  }, [zoneId, accepts, onDrop, registerDropZone, unregisterDropZone]);

  // Handle drag over for mouse
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canAccept && !isOver) {
      setIsOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (canAccept && !isDisabled) {
      onDrop(draggedItem);
      setIsOver(false);
      endDrag();
    }
  };

  // Handle touch events for mobile
  useEffect(() => {
    if (!elementRef.current || !draggedItem) return;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      
      if (element && elementRef.current.contains(element)) {
        if (!isOver && canAccept) {
          setIsOver(true);
        }
      } else if (isOver) {
        setIsOver(false);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      
      if (element && elementRef.current.contains(element) && canAccept && !isDisabled) {
        onDrop(draggedItem);
        setIsOver(false);
      }
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [draggedItem, canAccept, isDisabled, isOver, onDrop]);

  return (
    <Box
      ref={elementRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      position="relative"
      minH="100px"
      borderWidth={showDropIndicator ? 2 : 0}
      borderStyle="dashed"
      borderColor={showHighlight ? 'blue.500' : 'gray.300'}
      borderRadius="md"
      bg={showHighlight ? 'blue.50' : 'transparent'}
      transition="all 0.2s"
      aria-dropeffect={canAccept ? 'move' : 'none'}
      role="region"
      aria-label={`Drop zone ${zoneId}`}
      {...boxProps}
    >
      {children}
      
      {showHighlight && showDropIndicator && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          bg="blue.500"
          color="white"
          px={4}
          py={2}
          borderRadius="md"
          fontSize="sm"
          fontWeight="medium"
          pointerEvents="none"
          zIndex={1}
        >
          Släpp här
        </Box>
      )}
    </Box>
  );
};