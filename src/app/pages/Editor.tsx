import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Upload, Settings, Download, ArrowLeft, Trash2, ChevronLeft, ChevronRight, Layers2 } from 'lucide-react';
import Canvas from '../components/Canvas';
import StickerLibrary from '../components/StickerLibrary';
import AnimationPanel from '../components/AnimationPanel';
import ExportPanel from '../components/ExportPanel';
import ContextMenu from '../components/ContextMenu';
import { useImage, ImageSlot } from '../context/ImageContext';

export interface Sticker {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  flipX?: boolean; // 左右镜像
  flipY?: boolean; // 上下镜像
  animation?: Animation;
  duration?: number; // 每个贴图独立的动画时长
}

export interface Animation {
  type: 'move-swing' | 'cloth-wave' | 'ai-custom' | 'jump-bounce' | 'spin' | 'shake' | 'fade' | 'grow' | 'shrink' | 'wave' | 'float' | 'swing' | 'pulse' | 'glitch' | 'octopus-ink' | 'fish-swim' | 'bird-fly' | 'butterfly' | 'fire' | 'water' | 'electric' | 'patrol-horizontal' | 'patrol-vertical' | 
  // 自然元素
  'flowing-water' | 'water-ripple' | 'fountain-spray' | 'rain-drop' | 'snow-fall' | 'cloud-drift' | 'smoke-rise' | 
  // 人物角色
  'character-run' | 'character-walk' | 'character-dive' | 'character-swim' | 'character-climb' | 'character-slide' | 'character-wave' | 'character-nod' | 'character-breathe' | 'character-jump';
  duration: number;
  moveDistance?: number;
  swingAmount?: number;
  waveIntensity?: number;
  aiPrompt?: string;
  patrolDistance?: number;
  intensity?: number; // 整体强度 0-200%
}

// Store stickers per image slot
interface ImageStickerMap {
  [slotId: string]: Sticker[];
}

export default function Editor() {
  const navigate = useNavigate();
  const { imageSlots } = useImage();

  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [stickersBySlot, setStickersBySlot] = useState<ImageStickerMap>({});
  const [uploadedStickers, setUploadedStickers] = useState<string[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'stickers' | 'animation' | 'export'>('stickers');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; stickerId: string } | null>(null);

  // Redirect if no images
  useEffect(() => {
    if (imageSlots.length === 0) {
      console.log('No images found, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [imageSlots, navigate]);

  if (imageSlots.length === 0) {
    return null;
  }

  const currentSlot = imageSlots[currentSlotIndex];
  const currentStickers = stickersBySlot[currentSlot.id] || [];

  const handleAddSticker = (src: string, x: number, y: number) => {
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}-${Math.random()}`,
      src,
      x,
      y,
      width: 150,
      height: 150,
      rotation: 0,
    };

    setStickersBySlot((prev) => ({
      ...prev,
      [currentSlot.id]: [...(prev[currentSlot.id] || []), newSticker],
    }));
  };

  const handleUpdateSticker = (id: string, updates: Partial<Sticker>) => {
    setStickersBySlot((prev) => ({
      ...prev,
      [currentSlot.id]: (prev[currentSlot.id] || []).map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  };

  const handleDeleteSticker = (id: string) => {
    setStickersBySlot((prev) => ({
      ...prev,
      [currentSlot.id]: (prev[currentSlot.id] || []).filter((s) => s.id !== id),
    }));
    if (selectedSticker === id) {
      setSelectedSticker(null);
    }
  };

  const handleStickerContextMenu = (e: React.MouseEvent, stickerId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, stickerId });
    setSelectedSticker(stickerId);
  };

  const handleDuplicateSticker = (id: string) => {
    const sticker = currentStickers.find((s) => s.id === id);
    if (sticker) {
      const newSticker: Sticker = {
        ...sticker,
        id: `sticker-${Date.now()}-${Math.random()}`,
        x: sticker.x + 20,
        y: sticker.y + 20,
      };
      setStickersBySlot((prev) => ({
        ...prev,
        [currentSlot.id]: [...(prev[currentSlot.id] || []), newSticker],
      }));
    }
  };

  const handleRotateSticker = (id: string) => {
    handleUpdateSticker(id, { 
      rotation: ((currentStickers.find((s) => s.id === id)?.rotation || 0) + 90) % 360 
    });
  };

  const handleBringToFront = (id: string) => {
    setStickersBySlot((prev) => {
      const stickers = prev[currentSlot.id] || [];
      const sticker = stickers.find((s) => s.id === id);
      if (!sticker) return prev;
      return {
        ...prev,
        [currentSlot.id]: [...stickers.filter((s) => s.id !== id), sticker],
      };
    });
  };

  const handleFlipHorizontal = (id: string) => {
    const sticker = currentStickers.find((s) => s.id === id);
    if (sticker) {
      handleUpdateSticker(id, { flipX: !sticker.flipX });
    }
  };

  const handleFlipVertical = (id: string) => {
    const sticker = currentStickers.find((s) => s.id === id);
    if (sticker) {
      handleUpdateSticker(id, { flipY: !sticker.flipY });
    }
  };

  const handleStickerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          setUploadedStickers((prev) => [...prev, imageUrl]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleUpdateAnimation = (animation: Animation) => {
    if (selectedSticker) {
      handleUpdateSticker(selectedSticker, { animation });
    }
  };

  const handleUpdateRotation = (rotation: number) => {
    if (selectedSticker) {
      handleUpdateSticker(selectedSticker, { rotation });
    }
  };

  const handleUpdateDuration = (duration: number) => {
    if (selectedSticker) {
      handleUpdateSticker(selectedSticker, { duration });
    }
  };

  const selectedStickerData = currentStickers.find((s) => s.id === selectedSticker);

  const goToPreviousSlot = () => {
    if (currentSlotIndex > 0) {
      setCurrentSlotIndex(currentSlotIndex - 1);
      setSelectedSticker(null);
    }
  };

  const goToNextSlot = () => {
    if (currentSlotIndex < imageSlots.length - 1) {
      setCurrentSlotIndex(currentSlotIndex + 1);
      setSelectedSticker(null);
    }
  };

  const getTotalStickersCount = () => {
    return Object.values(stickersBySlot).reduce((total, stickers) => total + stickers.length, 0);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="返回首页"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl">贴图动画编辑器</h1>
              <p className="text-sm text-gray-500">
                图片 {currentSlotIndex + 1}/{imageSlots.length} - 共 {getTotalStickersCount()} 个贴图
              </p>
            </div>
          </div>

          {/* Image Switcher */}
          {imageSlots.length > 1 && (
            <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-2">
              <button
                onClick={goToPreviousSlot}
                disabled={currentSlotIndex === 0}
                className="p-2 hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="上一张"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2">
                {imageSlots.map((slot, index) => (
                  <button
                    key={slot.id}
                    onClick={() => {
                      setCurrentSlotIndex(index);
                      setSelectedSticker(null);
                    }}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentSlotIndex
                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                        : 'border-gray-300 hover:border-gray-400 opacity-70 hover:opacity-100'
                    }`}
                    title={`切换到图片 ${index + 1}`}
                  >
                    <img
                      src={slot.image}
                      alt={`Slot ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-0.5 left-0.5 text-xs px-1.5 py-0.5 rounded ${
                      index === currentSlotIndex
                        ? 'bg-indigo-600 text-white'
                        : 'bg-black bg-opacity-50 text-white'
                    }`}>
                      #{index + 1}
                    </div>
                    {stickersBySlot[slot.id]?.length > 0 && (
                      <div className="absolute bottom-0.5 right-0.5 text-xs px-1.5 py-0.5 rounded bg-green-500 text-white flex items-center gap-0.5">
                        <Layers2 className="w-3 h-3" />
                        {stickersBySlot[slot.id].length}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={goToNextSlot}
                disabled={currentSlotIndex === imageSlots.length - 1}
                className="p-2 hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="下一张"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="text-sm text-gray-500">
            {currentSlot.name}
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 p-6 overflow-auto">
            <Canvas
              backgroundImage={currentSlot.image}
              stickers={currentStickers}
              selectedSticker={selectedSticker}
              onSelectSticker={setSelectedSticker}
              onUpdateSticker={handleUpdateSticker}
              onStickerContextMenu={handleStickerContextMenu}
            />
          </div>

          {/* Side Panel */}
          <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Panel Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActivePanel('stickers')}
                className={`flex-1 px-4 py-3 text-sm transition-colors flex items-center justify-center gap-2 ${
                  activePanel === 'stickers'
                    ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Upload className="w-4 h-4" />
                贴图库
              </button>
              <button
                onClick={() => setActivePanel('animation')}
                className={`flex-1 px-4 py-3 text-sm transition-colors flex items-center justify-center gap-2 ${
                  activePanel === 'animation'
                    ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-4 h-4" />
                动画
              </button>
              <button
                onClick={() => setActivePanel('export')}
                className={`flex-1 px-4 py-3 text-sm transition-colors flex items-center justify-center gap-2 ${
                  activePanel === 'export'
                    ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Download className="w-4 h-4" />
                导出
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-hidden">
              {activePanel === 'stickers' && (
                <StickerLibrary
                  uploadedStickers={uploadedStickers}
                  onAddSticker={handleAddSticker}
                  onUploadSticker={handleStickerFileUpload}
                />
              )}
              {activePanel === 'animation' && (
                <AnimationPanel
                  selectedSticker={selectedStickerData}
                  onUpdateAnimation={handleUpdateAnimation}
                  onUpdateRotation={handleUpdateRotation}
                  onUpdateDuration={handleUpdateDuration}
                />
              )}
              {activePanel === 'export' && (
                <ExportPanel
                  imageSlots={imageSlots}
                  stickersBySlot={stickersBySlot}
                  currentSlotId={currentSlot.id}
                />
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDelete={() => handleDeleteSticker(contextMenu.stickerId)}
          onDuplicate={() => handleDuplicateSticker(contextMenu.stickerId)}
          onRotate={() => handleRotateSticker(contextMenu.stickerId)}
          onBringToFront={() => handleBringToFront(contextMenu.stickerId)}
          onFlipHorizontal={() => handleFlipHorizontal(contextMenu.stickerId)}
          onFlipVertical={() => handleFlipVertical(contextMenu.stickerId)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </DndProvider>
  );
}