import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { DragDropProvider, useDragDrop } from './DragDropProvider';
import { Draggable } from './Draggable';
import { DropZone } from './DropZone';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>
    <DragDropProvider>{children}</DragDropProvider>
  </ChakraProvider>
);

describe('DragDropProvider', () => {
  it('provides drag drop context to children', () => {
    const TestComponent = () => {
      const context = useDragDrop();
      return <div>{context ? 'Context provided' : 'No context'}</div>;
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByText('Context provided')).toBeInTheDocument();
  });

  it('throws error when used outside provider', () => {
    const TestComponent = () => {
      const context = useDragDrop();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => render(<TestComponent />)).toThrow(
      'useDragDrop must be used within DragDropProvider'
    );

    console.error = originalError;
  });
});

describe('Draggable', () => {
  it('renders children correctly', () => {
    render(
      <TestWrapper>
        <Draggable itemId="test" itemType="document">
          <div>Test Document</div>
        </Draggable>
      </TestWrapper>
    );

    expect(screen.getByText('Test Document')).toBeInTheDocument();
  });

  it('starts drag on mouse down', () => {
    let draggedItem: Record<string, unknown> = null;
    
    const TestComponent = () => {
      const { draggedItem: item } = useDragDrop();
      draggedItem = item;
      return (
        <Draggable itemId="test" itemType="document">
          <div>Test Document</div>
        </Draggable>
      );
    };

    const { rerender } = render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const draggable = screen.getByText('Test Document').parentElement!;
    fireEvent.mouseDown(draggable);
    
    rerender(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(draggedItem).toEqual({
      id: 'test',
      type: 'document',
      data: undefined,
      sourceZone: undefined,
    });
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Draggable itemId="test" itemType="document">
          <div>Test Document</div>
        </Draggable>
      </TestWrapper>
    );

    const draggable = screen.getByRole('button');
    await user.tab();
    expect(draggable).toHaveFocus();
    
    await user.keyboard(' ');
    expect(draggable).toHaveAttribute('aria-grabbed', 'true');
  });

  it('respects isDisabled prop', () => {
    render(
      <TestWrapper>
        <Draggable itemId="test" itemType="document" isDisabled>
          <div>Test Document</div>
        </Draggable>
      </TestWrapper>
    );

    const draggable = screen.getByText('Test Document').parentElement!;
    expect(draggable).toHaveStyle({ cursor: 'not-allowed' });
    expect(draggable).toHaveAttribute('tabIndex', '-1');
  });
});

describe('DropZone', () => {
  it('renders children correctly', () => {
    const handleDrop = jest.fn();
    
    render(
      <TestWrapper>
        <DropZone zoneId="test" accepts={['document']} onDrop={handleDrop}>
          <div>Drop here</div>
        </DropZone>
      </TestWrapper>
    );

    expect(screen.getByText('Drop here')).toBeInTheDocument();
  });

  it('shows drop indicator when compatible item is dragged over', async () => {
    let startDragFn: Record<string, unknown>;
    
    const TestComponent = () => {
      const { startDrag } = useDragDrop();
      startDragFn = startDrag;
      
      return (
        <DropZone zoneId="test" accepts={['document']} onDrop={jest.fn()}>
          <div>Drop here</div>
        </DropZone>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Start dragging a compatible item
    startDragFn({
      id: 'test-item',
      type: 'document',
      data: Record<string, unknown>,
    });

    const dropZone = screen.getByRole('region');
    fireEvent.dragOver(dropZone);

    await waitFor(() => {
      expect(screen.getByText('Släpp här')).toBeInTheDocument();
    });
  });

  it('does not accept incompatible items', () => {
    let startDragFn: Record<string, unknown>;
    const handleDrop = jest.fn();
    
    const TestComponent = () => {
      const { startDrag } = useDragDrop();
      startDragFn = startDrag;
      
      return (
        <DropZone zoneId="test" accepts={['document']} onDrop={handleDrop}>
          <div>Drop here</div>
        </DropZone>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Start dragging an incompatible item
    startDragFn({
      id: 'test-item',
      type: 'image',
      data: Record<string, unknown>,
    });

    const dropZone = screen.getByRole('region');
    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone);

    expect(handleDrop).not.toHaveBeenCalled();
  });

  it('calls onDrop when compatible item is dropped', () => {
    let startDragFn: Record<string, unknown>;
    const handleDrop = jest.fn();
    
    const TestComponent = () => {
      const { startDrag } = useDragDrop();
      startDragFn = startDrag;
      
      return (
        <DropZone zoneId="test" accepts={['document']} onDrop={handleDrop}>
          <div>Drop here</div>
        </DropZone>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const dragItem = {
      id: 'test-item',
      type: 'document',
      data: { title: 'Test Doc' },
    };

    startDragFn(dragItem);

    const dropZone = screen.getByRole('region');
    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone);

    expect(handleDrop).toHaveBeenCalledWith(dragItem);
  });
});