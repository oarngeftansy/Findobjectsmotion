import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, ImageIcon, X, Plus, Edit2, Grid3x3 } from 'lucide-react';
import { useImage } from '../context/ImageContext';

export default function Home() {
  const { imageSlots, addImageSlot, removeImageSlot, clearAllSlots } = useImage();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file, index) => {
      if (imageSlots.length >= 6) {
        alert('最多只能上传6张图片');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        addImageSlot(imageUrl, file.name);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (imageSlots.length >= 6) {
        alert('最多只能上传6张图片');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        addImageSlot(imageUrl, file.name);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleContinue = () => {
    if (imageSlots.length > 0) {
      navigate('/editor');
    } else {
      alert('请先上传至少一张图片');
    }
  };

  const canAddMore = imageSlots.length < 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <ImageIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl mb-2">贴图动画编辑器</h1>
          <p className="text-gray-600">上传最多6张图片，独立编辑后可拼接导出</p>
        </div>

        <div className="space-y-6">
          {/* Image Grid */}
          {imageSlots.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Grid3x3 className="w-4 h-4" />
                  <span>已上传 {imageSlots.length}/6 张图片</span>
                </div>
                <button
                  onClick={clearAllSlots}
                  className="text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  清空全部
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {imageSlots.map((slot, index) => (
                  <div
                    key={slot.id}
                    className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200"
                  >
                    <img
                      src={slot.image}
                      alt={slot.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
                      <button
                        onClick={() => removeImageSlot(slot.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-white text-xs bg-black bg-opacity-70 px-2 py-1 rounded truncate">
                          #{index + 1} - {slot.name}
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                      #{index + 1}
                    </div>
                  </div>
                ))}

                {/* Add More Button */}
                {canAddMore && (
                  <label className="aspect-video bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer flex items-center justify-center">
                    <div className="text-center">
                      <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">添加图片</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Upload Area */}
          {imageSlots.length === 0 && (
            <label
              className="block cursor-pointer"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div
                className={`border-2 border-dashed rounded-xl p-12 transition-all duration-200 ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-100'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                }`}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-700 mb-2">
                    点击上传或拖拽图片到这里
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    支持 PNG, JPG, WEBP 格式
                  </p>
                  <p className="text-xs text-gray-400">
                    可同时上传多张，最多6张图片
                  </p>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {imageSlots.length > 0 && canAddMore && (
              <label className="flex-1">
                <button className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  继续添加图片
                </button>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
            <button
              onClick={handleContinue}
              disabled={imageSlots.length === 0}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Edit2 className="w-5 h-5" />
              开始编辑 {imageSlots.length > 0 && `(${imageSlots.length}张)`}
            </button>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-900">
              <p className="mb-2 flex items-center gap-2">
                <span className="text-blue-600">💡</span>
                <strong>使用提示：</strong>
              </p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>上传最多6张图片，可以是同一作品的不同部分</li>
                <li>在编辑器中可以切换图片，为每张图片独立添加贴图和动画</li>
                <li>导出时可以选择单独导出每张图片，或拼接成一张大图</li>
                <li>推荐上传相同尺寸的图片以获得更好的拼接效果</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
