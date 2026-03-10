import { useEffect, useRef } from 'react';
import { Trash2, Copy, RotateCw, Layers, FlipHorizontal, FlipVertical } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onDelete: () => void;
  onDuplicate: () => void;
  onRotate: () => void;
  onBringToFront: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onClose: () => void;
}

export default function ContextMenu({
  x,
  y,
  onDelete,
  onDuplicate,
  onRotate,
  onBringToFront,
  onFlipHorizontal,
  onFlipVertical,
  onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[180px]"
      style={{ left: x, top: y }}
    >
      <button
        onClick={() => {
          onDuplicate();
          onClose();
        }}
        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-sm"
      >
        <Copy className="w-4 h-4" />
        复制贴图
      </button>
      <button
        onClick={() => {
          onRotate();
          onClose();
        }}
        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-sm"
      >
        <RotateCw className="w-4 h-4" />
        旋转 90°
      </button>
      <button
        onClick={() => {
          onBringToFront();
          onClose();
        }}
        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-sm"
      >
        <Layers className="w-4 h-4" />
        置于顶层
      </button>
      <button
        onClick={() => {
          onFlipHorizontal();
          onClose();
        }}
        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-sm"
      >
        <FlipHorizontal className="w-4 h-4" />
        水平翻转
      </button>
      <button
        onClick={() => {
          onFlipVertical();
          onClose();
        }}
        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-sm"
      >
        <FlipVertical className="w-4 h-4" />
        垂直翻转
      </button>
      <div className="border-t border-gray-200 my-2" />
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-red-600"
      >
        <Trash2 className="w-4 h-4" />
        删除贴图
      </button>
    </div>
  );
}