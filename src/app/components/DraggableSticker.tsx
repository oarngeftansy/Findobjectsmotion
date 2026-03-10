import { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sticker } from '../pages/Editor';
import { getAnimationProps } from '../utils/animations';

interface DraggableStickerProps {
  sticker: Sticker;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Sticker>) => void;
  onContextMenu: (e: React.MouseEvent, stickerId: string) => void;
}

export default function DraggableSticker({
  sticker,
  isSelected,
  onSelect,
  onUpdate,
  onContextMenu,
}: DraggableStickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - sticker.x,
      y: e.clientY - sticker.y,
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: sticker.width,
      height: sticker.height,
    };
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, sticker.id);
  };

  // Use useEffect to manage global mouse event listeners for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onUpdate({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onUpdate]);

  // Use useEffect to manage global mouse event listeners for resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;
      
      // Calculate new dimensions maintaining aspect ratio
      const aspectRatio = resizeStartRef.current.width / resizeStartRef.current.height;
      const delta = Math.max(deltaX, deltaY);
      
      const newWidth = Math.max(50, resizeStartRef.current.width + delta);
      const newHeight = Math.max(50, newWidth / aspectRatio);

      onUpdate({
        width: newWidth,
        height: newHeight,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onUpdate]);

  const animationProps = sticker.animation
    ? getAnimationProps(sticker)
    : {};

  return (
    <div
      className="absolute pointer-events-auto cursor-move"
      style={{
        left: sticker.x,
        top: sticker.y,
        width: sticker.width,
        height: sticker.height,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      <motion.div
        className="w-full h-full"
        style={{
          transformOrigin: 'center center',
        }}
        {...animationProps}
      >
        <img
          src={sticker.src}
          alt="Sticker"
          className="w-full h-full object-contain select-none"
          style={{
            transform: `rotate(${sticker.rotation}deg) scaleX(${sticker.flipX ? -1 : 1}) scaleY(${sticker.flipY ? -1 : 1})`,
          }}
          draggable={false}
        />
      </motion.div>
      {isSelected && (
        <div className="absolute inset-0 border-2 border-indigo-500 pointer-events-none">
          {/* Corner dots */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-indigo-500 rounded-full" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-indigo-500 rounded-full" />
          
          {/* Resize handle - bottom right corner */}
          <div
            className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border-2 border-indigo-500 rounded-full cursor-nwse-resize pointer-events-auto hover:bg-indigo-100 transition-colors"
            onMouseDown={handleResizeMouseDown}
            title="拖拽缩放"
          />
        </div>
      )}
    </div>
  );
}