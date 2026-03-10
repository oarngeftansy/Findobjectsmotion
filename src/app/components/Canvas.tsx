import { useRef, useEffect } from 'react';
import { Sticker } from '../pages/Editor';
import DraggableSticker from './DraggableSticker';

interface CanvasProps {
  backgroundImage: string;
  stickers: Sticker[];
  selectedSticker: string | null;
  onSelectSticker: (id: string | null) => void;
  onUpdateSticker: (id: string, updates: Partial<Sticker>) => void;
  onStickerContextMenu: (e: React.MouseEvent, stickerId: string) => void;
}

export default function Canvas({
  backgroundImage,
  stickers,
  selectedSticker,
  onSelectSticker,
  onUpdateSticker,
  onStickerContextMenu,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectSticker(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-white rounded-lg shadow-lg overflow-hidden mx-auto"
      style={{ maxWidth: '1200px', maxHeight: '800px' }}
      onClick={handleBackgroundClick}
    >
      {/* Background Image */}
      <img
        src={backgroundImage}
        alt="Background"
        className="w-full h-auto block"
        draggable={false}
      />

      {/* Stickers Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {stickers.map((sticker) => (
          <DraggableSticker
            key={sticker.id}
            sticker={sticker}
            isSelected={selectedSticker === sticker.id}
            onSelect={() => onSelectSticker(sticker.id)}
            onUpdate={(updates) => onUpdateSticker(sticker.id, updates)}
            onContextMenu={onStickerContextMenu}
          />
        ))}
      </div>
    </div>
  );
}