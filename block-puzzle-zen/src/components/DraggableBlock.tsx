import React, { useState, useRef } from 'react';
import { Block } from '../types/game';

interface DraggableBlockProps {
  block: Block;
  onDragStart: (block: Block) => void;
  onDragEnd: () => void;
  onDragMove: (x: number, y: number) => void;
  disabled?: boolean;
}

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  block,
  onDragStart,
  onDragEnd,
  onDragMove,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    onDragStart(block);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    onDragStart(block);
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onDragMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      onDragEnd();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, onDragMove, onDragEnd]);

  const cellSize = 28;

  return (
    <div
      ref={blockRef}
      className={`
        cursor-grab active:cursor-grabbing
        transition-all duration-200
        ${isDragging ? 'opacity-50 scale-90' : 'hover:scale-105'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
      `}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        touchAction: 'none',
      }}
    >
      <div
        className="grid gap-[1px] p-1"
        style={{
          gridTemplateColumns: `repeat(${block.shape[0].length}, ${cellSize}px)`,
        }}
      >
        {block.shape.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                rounded-sm transition-all
                ${cell ? 'shadow-md' : ''}
              `}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: cell ? block.color : 'transparent',
                boxShadow: cell
                  ? `inset 2px 2px 4px rgba(255,255,255,0.4),
                     inset -2px -2px 4px rgba(0,0,0,0.2),
                     2px 2px 6px rgba(0,0,0,0.3)`
                  : undefined,
              }}
            >
              {/* Wood grain effect */}
              {cell && (
                <div
                  className="w-full h-full rounded-sm opacity-20"
                  style={{
                    background: `repeating-linear-gradient(
                      ${45 + rowIndex * 10}deg,
                      transparent,
                      transparent 1px,
                      rgba(0,0,0,0.15) 1px,
                      rgba(0,0,0,0.15) 2px
                    )`,
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Floating preview while dragging
interface DragPreviewProps {
  block: Block | null;
  position: { x: number; y: number };
  visible: boolean;
}

export const DragPreview: React.FC<DragPreviewProps> = ({
  block,
  position,
  visible,
}) => {
  if (!block || !visible) return null;

  const cellSize = 40;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="grid gap-[2px] opacity-90"
        style={{
          gridTemplateColumns: `repeat(${block.shape[0].length}, ${cellSize}px)`,
        }}
      >
        {block.shape.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="rounded-sm"
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: cell ? block.color : 'transparent',
                boxShadow: cell
                  ? `inset 2px 2px 4px rgba(255,255,255,0.4),
                     inset -2px -2px 4px rgba(0,0,0,0.2),
                     4px 4px 10px rgba(0,0,0,0.4)`
                  : undefined,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};
