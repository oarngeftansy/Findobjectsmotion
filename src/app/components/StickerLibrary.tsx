import { Upload, Plus } from 'lucide-react';

interface StickerLibraryProps {
  uploadedStickers: string[];
  onUploadSticker: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddSticker: (src: string, x: number, y: number) => void;
}

export default function StickerLibrary({
  uploadedStickers,
  onUploadSticker,
  onAddSticker,
}: StickerLibraryProps) {
  const handleAddToCanvas = (src: string) => {
    // Add sticker to center of canvas
    const x = 400;
    const y = 300;
    onAddSticker(src, x, y);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl mb-4">贴图库</h2>
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 hover:bg-indigo-50 transition-all">
            <div className="flex flex-col items-center justify-center text-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-700">上传贴图元素</p>
              <p className="text-xs text-gray-500 mt-1">支持 PNG, SVG 格式</p>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onUploadSticker}
            className="hidden"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {uploadedStickers.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>还没有上传贴图</p>
            <p className="text-sm mt-2">点击上方按钮上传</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {uploadedStickers.map((src, index) => (
              <div
                key={index}
                className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-400 transition-all cursor-pointer"
                onClick={() => handleAddToCanvas(src)}
              >
                <img
                  src={src}
                  alt={`Sticker ${index + 1}`}
                  className="w-full h-full object-contain p-2"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center pointer-events-none">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-indigo-600 text-white rounded-full p-3">
                      <Plus className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}