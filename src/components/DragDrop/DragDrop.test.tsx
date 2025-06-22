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

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByText('Context provided')).toBeInTheDocument();
  });

  it('throws error when used outside provider', () => {

    // Suppress console.error for this test
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
    

    const { rerender } = render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

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
    
    render(
      <TestWrapper>
        <Draggable itemId="test" itemType="document">
          <div>Test Document</div>
        </Draggable>
      </TestWrapper>
    );

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

    expect(draggable).toHaveStyle({ cursor: 'not-allowed' });
    expect(draggable).toHaveAttribute('tabIndex', '-1');
  });
});

describe('DropZone', () => {
  it('renders children correctly', () => {
    
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

    fireEvent.dragOver(dropZone);

    await waitFor(() => {
      expect(screen.getByText('Släpp här')).toBeInTheDocument();
    });
  });

  it('does not accept incompatible items', () => {
    let startDragFn: Record<string, unknown>;
    

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

    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone);

    expect(handleDrop).not.toHaveBeenCalled();
  });

  it('calls onDrop when compatible item is dropped', () => {
    let startDragFn: Record<string, unknown>;
    

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );


    startDragFn(dragItem);

    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone);

    expect(handleDrop).toHaveBeenCalledWith(dragItem);
  });
});