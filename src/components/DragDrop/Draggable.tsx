import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, BoxProps } from '@chakra-ui/react';
import { useDragDrop } from './DragDropProvider';

interface DraggableProps extends BoxProps {
  itemId: string;
  itemType: string;
  itemData?: Record<string, unknown>;
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
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingThis, setIsDraggingThis] = useState(false);

  // Handle mouse events

  return (
    <Box>
      {children}
    </Box>
  );
};
