import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Box } from '@chakra-ui/react';

export interface DragItem {
  id: string;
  type: string;
  data: Record<string, unknown>;
  sourceZone?: string;
}

interface DragDropContextType {
  draggedItem: DragItem | null;
  isDragging: boolean;
  startDrag: (item: DragItem) => void;
  endDrag: () => void;
  dropZones: Map<string, DropZoneData>;
  registerDropZone: (zoneId: string, data: DropZoneData) => void;
  unregisterDropZone: (zoneId: string) => void;
}

interface DropZoneData {
  accepts: string[];
  onDrop: (item: DragItem) => void;
  isOver: boolean;
}

const DragDropContext = createContext<DragDropContextType | null>(null);

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider');
  }
  return context;
};

interface DragDropProviderProps {
  children: ReactNode;
  municipalTheme?: 'sweden' | 'germany' | 'france' | 'netherlands';
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({ 
  children,
  municipalTheme = 'sweden' 
}) => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dropZones] = useState(new Map<string, DropZoneData>());

  const startDrag = useCallback((item: DragItem) => {
    setDraggedItem(item);
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const endDrag = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const registerDropZone = useCallback((zoneId: string, data: DropZoneData) => {
    dropZones.set(zoneId, data);
  }, [dropZones]);

  const unregisterDropZone = useCallback((zoneId: string) => {
    dropZones.delete(zoneId);
  }, [dropZones]);

  const value: DragDropContextType = {
    draggedItem,
    isDragging: !!draggedItem,
    startDrag,
    endDrag,
    dropZones,
    registerDropZone,
    unregisterDropZone,
  };

  return (
    <DragDropContext.Provider value={value}>
      <Box 
        position="relative" 
        minH="100vh"
        data-municipal-theme={municipalTheme}
      >
        {children}
      </Box>
    </DragDropContext.Provider>
  );
};