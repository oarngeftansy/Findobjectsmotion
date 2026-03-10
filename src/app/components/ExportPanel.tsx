import { useState, useRef } from 'react';
import { Download, FileImage, Video, Layers, FileCode, FileJson, Grid3x3, LayoutGrid, Film } from 'lucide-react';
import { Sticker } from '../pages/Editor';
import { ImageSlot } from '../context/ImageContext';
import JSZip from 'jszip';
import GIF from 'gif.js';
import { renderFrame, calculateTotalDuration } from '../utils/animationRenderer';
import { getAnimationProps } from '../utils/animations';

interface ExportPanelProps {
  imageSlots: ImageSlot[];
  stickersBySlot: { [slotId: string]: Sticker[] };
  currentSlotId: string;
}

type ExportFormat = 
  | 'static-png' 
  | 'png-sequence'
  | 'video-mp4' 
  | 'video-webm'
  | 'video-gif'
  | 'unity-clip' 
  | 'unity-json'
  | 'unreal-anim'
  | 'spine-json'
  | 'lottie-json'
  | 'css-keyframes'
  | 'svg-animate';

type ExportMode = 'current' | 'all-separate' | 'merge-grid-2x3' | 'merge-grid-3x2' | 'merge-horizontal' | 'merge-vertical';

export default function ExportPanel({
  imageSlots,
  stickersBySlot,
  currentSlotId,
}: ExportPanelProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('static-png');
  const [exportMode, setExportMode] = useState<ExportMode>('current');
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentStickers = stickersBySlot[currentSlotId] || [];

  const handleExport = async () => {
    setIsExporting(true);

    try {
      switch (exportFormat) {
        case 'static-png':
          await exportStaticImage();
          break;
        case 'png-sequence':
          await exportPNGSequence();
          break;
        case 'video-mp4':
          await exportVideo('mp4');
          break;
        case 'video-webm':
          await exportVideo('webm');
          break;
        case 'video-gif':
          await exportGIF();
          break;
        case 'unity-clip':
          await exportUnityClip();
          break;
        case 'unity-json':
          await exportUnityJSON();
          break;
        case 'unreal-anim':
          await exportUnrealAnimation();
          break;
        case 'spine-json':
          await exportSpineJSON();
          break;
        case 'lottie-json':
          await exportLottieJSON();
          break;
        case 'css-keyframes':
          await exportCSSKeyframes();
          break;
        case 'svg-animate':
          await exportSVGAnimate();
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const exportStaticImage = async () => {
    if (exportMode === 'current') {
      await exportSingleImage(currentSlotId);
    } else if (exportMode === 'all-separate') {
      await exportAllImagesSeparate();
    } else {
      await exportMergedImage();
    }
  };

  const exportPNGSequence = async () => {
    try {
      const allStickers = getAllStickersForExport();
      
      // 计算动画总时长，限制在合理范围
      let totalDuration = calculateTotalDuration(allStickers);
      
      // 如果没有动画贴图，默认3秒
      const hasAnimation = allStickers.some(s => s.animation);
      if (!hasAnimation) {
        totalDuration = 3;
      }
      
      // 强制限制最大时长为10秒
      totalDuration = Math.min(totalDuration, 10);
      totalDuration = Math.max(totalDuration, 1); // 至少1秒
      
      const frameRate = 30; // 30 FPS
      const totalFrames = Math.ceil(totalDuration * frameRate);
      
      // 显示导出信息
      const confirmMessage = `即将导出 PNG 序列帧：
      
📊 导出参数：
• 动画时长: ${totalDuration.toFixed(1)} 秒
• 帧率: ${frameRate} FPS
• 总帧数: ${totalFrames} 帧
• 导出模式: ${getModeLabel(exportMode)}
• 包含贴图: ${allStickers.length} 个
• 包含动画: ${allStickers.filter(s => s.animation).length} 个

⚠️ 提示：
• 导出的ZIP文件包含所有帧的PNG图片
• 可使用FFmpeg、Premiere、AE等工具合成视频
• 推荐命令：ffmpeg -r 30 -i frame_%04d.png output.mp4

是否继续？`;

      if (!confirm(confirmMessage)) {
        setIsExporting(false);
        return;
      }

      setExportMessage(`准备导出 ${totalFrames} 帧...`);
      setExportProgress(0);

      // 1. 预加载所有图片（一次性）
      setExportMessage('加载图片资源...');
      const loadedImages = await Promise.all(
        imageSlots.map(async (slot) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = slot.image;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          
          // 计算显示尺寸和缩放比例（考虑maxWidth和maxHeight）
          const originalWidth = img.naturalWidth || img.width;
          const originalHeight = img.naturalHeight || img.height;
          const maxDisplayWidth = 1200;
          const maxDisplayHeight = 800;
          
          // 计算宽度约束下的尺寸
          let displayWidth = Math.min(maxDisplayWidth, originalWidth);
          let displayHeight = (displayWidth / originalWidth) * originalHeight;
          
          // 如果高度超过maxHeight，需要按高度重新计算
          if (displayHeight > maxDisplayHeight) {
            displayHeight = maxDisplayHeight;
            displayWidth = (displayHeight / originalHeight) * originalWidth;
          }
          
          const scale = originalWidth / displayWidth;
          
          return { slot, img, originalWidth, originalHeight, scale, displayWidth, displayHeight };
        })
      );

      // 预加载所有贴图
      const stickerImageCache = new Map<string, HTMLImageElement>();
      for (const slot of imageSlots) {
        const stickers = stickersBySlot[slot.id] || [];
        for (const sticker of stickers) {
          if (!stickerImageCache.has(sticker.src)) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = sticker.src;
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });
            stickerImageCache.set(sticker.src, img);
          }
        }
      }

      // 2. 计算布局
      let cols = 1, rows = 1;
      if (exportMode === 'merge-grid-2x3') {
        cols = 2;
        rows = 3;
      } else if (exportMode === 'merge-grid-3x2') {
        cols = 3;
        rows = 2;
      } else if (exportMode === 'merge-horizontal') {
        cols = imageSlots.length;
        rows = 1;
      } else if (exportMode === 'merge-vertical') {
        cols = 1;
        rows = imageSlots.length;
      }

      const cellWidth = loadedImages[0].originalWidth;
      const cellHeight = loadedImages[0].originalHeight;
      const canvasWidth = cellWidth * cols;
      const canvasHeight = cellHeight * rows;

      // 3. 创建ZIP
      const zip = new JSZip();

      // 4. 逐帧渲染并添加到ZIP
      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
        // 更新进度
        const progress = Math.round(((frameIndex + 1) / totalFrames) * 100);
        setExportProgress(progress);
        setExportMessage(`正在渲染帧 ${frameIndex + 1}/${totalFrames}...`);

        // 计算当前帧的时间（秒）
        const currentTime = (frameIndex / frameRate) * 1000; // 转换为毫秒

        // 创建临时canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // 绘制白色背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制每个图片槽位
        for (let i = 0; i < loadedImages.length; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const offsetX = col * cellWidth;
          const offsetY = row * cellHeight;

          const { slot, img, originalWidth, originalHeight, scale, displayWidth, displayHeight } = loadedImages[i];

          // 绘制背景
          ctx.drawImage(img, offsetX, offsetY, originalWidth, originalHeight);

          // 绘制贴图（包含动画）
          const stickers = stickersBySlot[slot.id] || [];
          for (const sticker of stickers) {
            const stickerImg = stickerImageCache.get(sticker.src);
            if (!stickerImg) continue;

            // 计算动画进度
            const duration = (sticker.duration || sticker.animation?.duration || 3) * 1000;
            const animProgress = (currentTime % duration) / duration;

            // 获取动画变换（使用renderFrame中的逻辑）
            const transform = calculateAnimationTransform(sticker, animProgress);

            ctx.save();

            // 应用缩放
            const scaledX = sticker.x * scale;
            const scaledY = sticker.y * scale;
            const scaledWidth = sticker.width * scale;
            const scaledHeight = sticker.height * scale;

            // 移动到贴图中心（包含动画偏移）
            ctx.translate(
              offsetX + scaledX + scaledWidth / 2 + transform.x * scale,
              offsetY + scaledY + scaledHeight / 2 + transform.y * scale
            );

            // 应用旋转（基础旋转 + 动画旋转）
            ctx.rotate(((sticker.rotation + transform.rotation) * Math.PI) / 180);

            // 应用缩放和镜像
            ctx.scale(
              (sticker.flipX ? -1 : 1) * transform.scaleX,
              (sticker.flipY ? -1 : 1) * transform.scaleY
            );

            // 应用透明度
            ctx.globalAlpha = transform.opacity;

            ctx.drawImage(
              stickerImg,
              -scaledWidth / 2,
              -scaledHeight / 2,
              scaledWidth,
              scaledHeight
            );
            ctx.restore();
          }
        }

        // 转换为PNG并添加到ZIP
        const dataURL = canvas.toDataURL('image/png', 0.92); // 使用压缩质量
        const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
        const paddedIndex = frameIndex.toString().padStart(4, '0');
        zip.file(`frame_${paddedIndex}.png`, base64Data, { base64: true });

        // 让出主线程，防止卡死
        if (frameIndex % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      // 5. 生成ZIP文件
      setExportMessage('正在打包ZIP文件...');
      const content = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      // 6. 下载
      setExportMessage('准备下载...');
      const link = document.createElement('a');
      link.download = `animation-${totalFrames}frames-${Date.now()}.zip`;
      link.href = URL.createObjectURL(content);
      link.click();

      setExportMessage('导出完成！');
      setTimeout(() => {
        setExportMessage('');
        setExportProgress(0);
      }, 2000);

    } catch (error) {
      console.error('PNG序列导出失败:', error);
      alert('PNG序列导出失败: ' + (error as Error).message);
      setExportMessage('');
      setExportProgress(0);
    }
  };

  const exportSingleImage = async (slotId: string) => {
    const slot = imageSlots.find((s) => s.id === slotId);
    if (!slot) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 创建一个临时图片来获取原始尺寸
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = slot.image;
    
    await new Promise((resolve) => {
      bgImg.onload = resolve;
    });

    // 使用背景图的原始尺寸作为画布尺寸
    const originalWidth = bgImg.naturalWidth || bgImg.width;
    const originalHeight = bgImg.naturalHeight || bgImg.height;
    
    canvas.width = originalWidth;
    canvas.height = originalHeight;
    
    // 计算Canvas组件中的实际显示尺寸（考虑maxWidth和maxHeight的约束）
    const maxDisplayWidth = 1200;
    const maxDisplayHeight = 800;
    
    // 计算宽度约束下的尺寸
    let displayWidth = Math.min(maxDisplayWidth, originalWidth);
    let displayHeight = (displayWidth / originalWidth) * originalHeight;
    
    // 如果高度超过maxHeight，需要按高度重新计算
    if (displayHeight > maxDisplayHeight) {
      displayHeight = maxDisplayHeight;
      displayWidth = (displayHeight / originalHeight) * originalWidth;
    }
    
    // 计算从显示尺寸到原始尺寸的缩放比例
    const scale = originalWidth / displayWidth;
    
    // 绘制背景
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // 绘制贴图
    const stickers = stickersBySlot[slotId] || [];
    for (const sticker of stickers) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = sticker.src;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      ctx.save();
      
      // 将显示坐标转换为原始尺寸坐标
      const scaledX = sticker.x * scale;
      const scaledY = sticker.y * scale;
      const scaledWidth = sticker.width * scale;
      const scaledHeight = sticker.height * scale;
      
      ctx.translate(scaledX + scaledWidth / 2, scaledY + scaledHeight / 2);
      ctx.rotate((sticker.rotation * Math.PI) / 180);
      
      // 应用镜像翻转
      if (sticker.flipX || sticker.flipY) {
        ctx.scale(sticker.flipX ? -1 : 1, sticker.flipY ? -1 : 1);
      }
      
      ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
      ctx.restore();
    }

    const link = document.createElement('a');
    link.download = `${slot.name.replace(/\.[^/.]+$/, '')}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const exportAllImagesSeparate = async () => {
    for (let i = 0; i < imageSlots.length; i++) {
      await exportSingleImage(imageSlots[i].id);
      // Add delay to prevent browser blocking multiple downloads
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  const exportMergedImage = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load all images first and get their display info
    const loadedImages = await Promise.all(
      imageSlots.map(async (slot) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = slot.image;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        // Calculate display dimensions
        const originalWidth = img.naturalWidth || img.width;
        const originalHeight = img.naturalHeight || img.height;
        const maxDisplayWidth = 1200;
        const aspectRatio = originalWidth / originalHeight;
        const displayWidth = Math.min(maxDisplayWidth, originalWidth);
        const displayHeight = displayWidth / aspectRatio;
        const scale = originalWidth / displayWidth;
        
        return { slot, img, originalWidth, originalHeight, scale };
      })
    );

    if (loadedImages.length === 0) return;

    // Calculate layout
    let cols = 1, rows = 1;
    if (exportMode === 'merge-grid-2x3') {
      cols = 2;
      rows = 3;
    } else if (exportMode === 'merge-grid-3x2') {
      cols = 3;
      rows = 2;
    } else if (exportMode === 'merge-horizontal') {
      cols = imageSlots.length;
      rows = 1;
    } else if (exportMode === 'merge-vertical') {
      cols = 1;
      rows = imageSlots.length;
    }

    // Use first image's original dimensions as cell size
    const cellWidth = loadedImages[0].originalWidth;
    const cellHeight = loadedImages[0].originalHeight;

    canvas.width = cellWidth * cols;
    canvas.height = cellHeight * rows;

    // Draw background with white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw each image with its stickers
    for (let i = 0; i < loadedImages.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const offsetX = col * cellWidth;
      const offsetY = row * cellHeight;

      const { slot, img, originalWidth, originalHeight, scale } = loadedImages[i];

      // Draw background image
      ctx.drawImage(img, offsetX, offsetY, originalWidth, originalHeight);

      // Draw stickers with correct scaling
      const stickers = stickersBySlot[slot.id] || [];
      for (const sticker of stickers) {
        const stickerImg = new Image();
        stickerImg.crossOrigin = 'anonymous';
        stickerImg.src = sticker.src;
        
        await new Promise((resolve) => {
          stickerImg.onload = resolve;
        });

        ctx.save();
        
        // Apply scaling to convert from display coordinates to original coordinates
        const scaledX = sticker.x * scale;
        const scaledY = sticker.y * scale;
        const scaledWidth = sticker.width * scale;
        const scaledHeight = sticker.height * scale;
        
        ctx.translate(
          offsetX + scaledX + scaledWidth / 2,
          offsetY + scaledY + scaledHeight / 2
        );
        ctx.rotate((sticker.rotation * Math.PI) / 180);
        
        // Apply flip
        if (sticker.flipX || sticker.flipY) {
          ctx.scale(sticker.flipX ? -1 : 1, sticker.flipY ? -1 : 1);
        }
        
        ctx.drawImage(
          stickerImg,
          -scaledWidth / 2,
          -scaledHeight / 2,
          scaledWidth,
          scaledHeight
        );
        ctx.restore();
      }
    }

    const link = document.createElement('a');
    link.download = `merged-composition-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const exportVideo = async (format: 'mp4' | 'webm') => {
    alert(`${format.toUpperCase()} 视频导出功能已触发！\n\n在实际应用中，这将使用 MediaRecorder API 或 WebCodecs API 来录制动画并导出为 ${format.toUpperCase()} 文件。\n\n导出模式: ${getModeLabel(exportMode)}`);
  };

  const exportGIF = async () => {
    alert('GIF 动画导出功能正在开发中！\n\n由于浏览器限制，GIF 导出需要额外配置。\n\n建议使用 PNG 序列导出，然后使用专业工具（如 Photoshop、GIMP、FFmpeg）制作 GIF。\n\n导出模式: ' + getModeLabel(exportMode));
  };

  const exportUnityClip = async () => {
    const allStickers = getAllStickersForExport();
    const clipData = {
      version: '2022.3',
      type: 'AnimationClip',
      frameRate: 60,
      length: Math.max(...allStickers.filter(s => s.animation).map(s => s.animation!.duration), 1),
      exportMode,
      imageSlots: imageSlots.map((slot) => ({
        id: slot.id,
        name: slot.name,
        order: slot.order,
      })),
      sprites: allStickers.filter(s => s.animation).map((sticker) => ({
        name: sticker.id,
        slotId: getSlotIdForSticker(sticker.id),
        curves: generateUnityCurves(sticker),
      })),
    };

    downloadJSON(clipData, `animation-${Date.now()}.clip`);
  };

  const exportUnityJSON = async () => {
    const allStickers = getAllStickersForExport();
    const unityData = {
      version: '1.0',
      exportMode,
      imageSlots: imageSlots.map((slot) => ({
        id: slot.id,
        name: slot.name,
        order: slot.order,
      })),
      sprites: allStickers.map((sticker) => ({
        id: sticker.id,
        slotId: getSlotIdForSticker(sticker.id),
        position: { x: sticker.x, y: sticker.y },
        size: { width: sticker.width, height: sticker.height },
        rotation: sticker.rotation,
        animation: sticker.animation
          ? {
              type: sticker.animation.type,
              duration: sticker.animation.duration,
              parameters: {
                moveDistance: sticker.animation.moveDistance,
                swingAmount: sticker.animation.swingAmount,
                waveIntensity: sticker.animation.waveIntensity,
                aiPrompt: sticker.animation.aiPrompt,
              },
            }
          : null,
      })),
    };

    downloadJSON(unityData, `unity-animation-${Date.now()}.json`);
  };

  const exportUnrealAnimation = async () => {
    const allStickers = getAllStickersForExport();
    const unrealData = {
      version: '5.0',
      type: 'LevelSequence',
      exportMode,
      imageSlots: imageSlots.map((slot) => ({
        id: slot.id,
        name: slot.name,
        order: slot.order,
      })),
      actors: allStickers.map((sticker) => ({
        name: sticker.id,
        slotId: getSlotIdForSticker(sticker.id),
        class: 'SpriteActor',
        transform: {
          location: { x: sticker.x, y: sticker.y, z: 0 },
          rotation: { pitch: 0, yaw: sticker.rotation, roll: 0 },
          scale: { x: sticker.width / 100, y: sticker.height / 100, z: 1 },
        },
        animation: sticker.animation
          ? {
              type: sticker.animation.type,
              duration: sticker.animation.duration,
              tracks: generateUnrealTracks(sticker),
            }
          : null,
      })),
    };

    downloadJSON(unrealData, `unreal-animation-${Date.now()}.json`);
  };

  const exportSpineJSON = async () => {
    const allStickers = getAllStickersForExport();
    const spineData = {
      skeleton: {
        hash: 'spine-export',
        spine: '4.1',
        width: 1920,
        height: 1080,
        exportMode,
      },
      bones: [{ name: 'root' }],
      slots: allStickers.map((sticker, index) => ({
        name: `slot-${index}`,
        bone: 'root',
        attachment: sticker.id,
        slotId: getSlotIdForSticker(sticker.id),
      })),
      skins: {
        default: {
          attachments: Object.fromEntries(
            allStickers.map((sticker, index) => [
              `slot-${index}`,
              {
                [sticker.id]: {
                  type: 'region',
                  x: sticker.x,
                  y: sticker.y,
                  width: sticker.width,
                  height: sticker.height,
                  rotation: sticker.rotation,
                },
              },
            ])
          ),
        },
      },
      animations: Object.fromEntries(
        allStickers
          .filter((s) => s.animation)
          .map((sticker) => [
            sticker.id,
            generateSpineAnimation(sticker),
          ])
      ),
    };

    downloadJSON(spineData, `spine-animation-${Date.now()}.json`);
  };

  const exportLottieJSON = async () => {
    const allStickers = getAllStickersForExport();
    const lottieData = {
      v: '5.7.4',
      fr: 60,
      ip: 0,
      op: 180,
      w: 1920,
      h: 1080,
      nm: 'Animation',
      ddd: 0,
      exportMode,
      assets: [],
      layers: allStickers.map((sticker, index) => ({
        ddd: 0,
        ind: index,
        ty: 2,
        nm: sticker.id,
        slotId: getSlotIdForSticker(sticker.id),
        ks: generateLottieTransform(sticker),
        ao: 0,
        ip: 0,
        op: 180,
        st: 0,
        bm: 0,
      })),
    };

    downloadJSON(lottieData, `lottie-animation-${Date.now()}.json`);
  };

  const exportCSSKeyframes = async () => {
    const allStickers = getAllStickersForExport();
    let css = `/* CSS 动画关键帧 */\n/* 导出模式: ${getModeLabel(exportMode)} */\n\n`;
    
    allStickers.forEach((sticker, index) => {
      if (sticker.animation) {
        css += `@keyframes animation-${index} {\n`;
        css += generateCSSKeyframes(sticker);
        css += '}\n\n';
        
        css += `.sticker-${index} {\n`;
        css += `  animation: animation-${index} ${sticker.animation.duration}s ease-in-out infinite;\n`;
        css += `  position: absolute;\n`;
        css += `  left: ${sticker.x}px;\n`;
        css += `  top: ${sticker.y}px;\n`;
        css += `  width: ${sticker.width}px;\n`;
        css += `  height: ${sticker.height}px;\n`;
        css += `  transform: rotate(${sticker.rotation}deg);\n`;
        css += `  /* Slot ID: ${getSlotIdForSticker(sticker.id)} */\n`;
        css += '}\n\n';
      }
    });

    downloadText(css, `animations-${Date.now()}.css`);
  };

  const exportSVGAnimate = async () => {
    const allStickers = getAllStickersForExport();
    let svg = `<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">\n`;
    svg += `  <!-- 导出模式: ${getModeLabel(exportMode)} -->\n`;
    svg += `  <defs>\n`;
    svg += `    <style>\n`;
    svg += `      .sticker { transform-origin: center; }\n`;
    svg += `    </style>\n`;
    svg += `  </defs>\n\n`;

    allStickers.forEach((sticker, index) => {
      svg += `  <image\n`;
      svg += `    class="sticker"\n`;
      svg += `    data-slot="${getSlotIdForSticker(sticker.id)}"\n`;
      svg += `    x="${sticker.x}"\n`;
      svg += `    y="${sticker.y}"\n`;
      svg += `    width="${sticker.width}"\n`;
      svg += `    height="${sticker.height}"\n`;
      svg += `    href="${sticker.src}"\n`;
      svg += `    transform="rotate(${sticker.rotation} ${sticker.x + sticker.width/2} ${sticker.y + sticker.height/2})"\n`;
      svg += `  >\n`;
      
      if (sticker.animation) {
        svg += generateSVGAnimate(sticker);
      }
      
      svg += `  </image>\n\n`;
    });

    svg += `</svg>`;
    downloadText(svg, `animation-${Date.now()}.svg`);
  };

  // Helper functions
  const getAllStickersForExport = (): Sticker[] => {
    if (exportMode === 'current') {
      return currentStickers;
    }
    // For all other modes, export all stickers from all slots
    return imageSlots.flatMap((slot) => stickersBySlot[slot.id] || []);
  };

  const getSlotIdForSticker = (stickerId: string): string => {
    for (const [slotId, stickers] of Object.entries(stickersBySlot)) {
      if (stickers.some((s) => s.id === stickerId)) {
        return slotId;
      }
    }
    return '';
  };

  const getModeLabel = (mode: ExportMode): string => {
    const labels: Record<ExportMode, string> = {
      current: '当前图片',
      'all-separate': '所有图片分别导出',
      'merge-grid-2x3': '拼接 2x3 网格',
      'merge-grid-3x2': '拼接 3x2 网格',
      'merge-horizontal': '拼接横向排列',
      'merge-vertical': '拼接纵向排列',
    };
    return labels[mode];
  };

  const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const generateUnityCurves = (sticker: Sticker) => {
    if (!sticker.animation) return {};
    
    return {
      position: {
        x: { keyframes: [{ time: 0, value: sticker.x }, { time: sticker.animation.duration, value: sticker.x }] },
        y: { keyframes: [{ time: 0, value: sticker.y }, { time: sticker.animation.duration, value: sticker.y }] },
      },
      rotation: {
        z: { keyframes: [{ time: 0, value: sticker.rotation }, { time: sticker.animation.duration, value: sticker.rotation }] },
      },
    };
  };

  const generateUnrealTracks = (sticker: Sticker) => {
    if (!sticker.animation) return [];
    
    return [
      {
        type: 'Transform',
        keys: [
          { time: 0, value: { x: sticker.x, y: sticker.y, rotation: sticker.rotation } },
          { time: sticker.animation.duration, value: { x: sticker.x, y: sticker.y, rotation: sticker.rotation } },
        ],
      },
    ];
  };

  const generateSpineAnimation = (sticker: Sticker) => {
    if (!sticker.animation) return {};
    
    return {
      bones: {
        root: {
          translate: [
            { time: 0, x: 0, y: 0 },
            { time: sticker.animation.duration, x: 0, y: 0 },
          ],
          rotate: [
            { time: 0, angle: 0 },
            { time: sticker.animation.duration, angle: 0 },
          ],
        },
      },
    };
  };

  const generateLottieTransform = (sticker: Sticker) => {
    return {
      a: { a: 0, k: [sticker.width / 2, sticker.height / 2, 0] },
      p: { a: 0, k: [sticker.x + sticker.width / 2, sticker.y + sticker.height / 2, 0] },
      r: { a: 0, k: sticker.rotation },
      s: { a: 0, k: [100, 100, 100] },
    };
  };

  const generateCSSKeyframes = (sticker: Sticker) => {
    if (!sticker.animation) return '';
    
    let keyframes = '';
    const { type } = sticker.animation;
    
    if (type === 'move-swing') {
      keyframes += '  0% { transform: translateX(0) rotate(0deg); }\n';
      keyframes += '  50% { transform: translateX(-200px) rotate(15deg); }\n';
      keyframes += '  100% { transform: translateX(0) rotate(0deg); }\n';
    } else if (type === 'cloth-wave') {
      keyframes += '  0% { transform: rotateY(0deg); }\n';
      keyframes += '  50% { transform: rotateY(20deg); }\n';
      keyframes += '  100% { transform: rotateY(0deg); }\n';
    }
    
    return keyframes;
  };

  const generateSVGAnimate = (sticker: Sticker) => {
    if (!sticker.animation) return '';
    
    const { type, duration } = sticker.animation;
    let animate = '';
    
    if (type === 'move-swing') {
      animate += `    <animateTransform\n`;
      animate += `      attributeName="transform"\n`;
      animate += `      type="translate"\n`;
      animate += `      values="0,0; -200,0; 0,0"\n`;
      animate += `      dur="${duration}s"\n`;
      animate += `      repeatCount="indefinite"\n`;
      animate += `    />\n`;
    }
    
    return animate;
  };

  const toggleStickerSelection = (stickerId: string) => {
    setSelectedStickers((prev) =>
      prev.includes(stickerId)
        ? prev.filter((id) => id !== stickerId)
        : [...prev, stickerId]
    );
  };

  const allStickers = getAllStickersForExport();
  const animatedStickers = allStickers.filter((s) => s.animation);

  const formatGroups = [
    {
      title: '静态图片',
      formats: [
        { value: 'static-png', label: 'PNG 图片', icon: FileImage, desc: '合成后的静态图片' },
        { value: 'png-sequence', label: 'PNG 序列', icon: FileImage, desc: '导出每帧为单独的 PNG 文件' },
      ],
    },
    {
      title: '视频格式',
      formats: [
        { value: 'video-mp4', label: 'MP4 视频', icon: Video, desc: '标准视频格式' },
        { value: 'video-webm', label: 'WebM 视频', icon: Video, desc: 'Web 优化格式' },
        { value: 'video-gif', label: 'GIF 动画', icon: Video, desc: '循环动画图片' },
      ],
    },
    {
      title: 'Unity 引擎',
      formats: [
        { value: 'unity-clip', label: 'Unity AnimationClip', icon: Layers, desc: '.clip 动画文件' },
        { value: 'unity-json', label: 'Unity JSON', icon: FileJson, desc: 'JSON 数据格式' },
      ],
    },
    {
      title: 'Unreal 引擎',
      formats: [
        { value: 'unreal-anim', label: 'UE5 LevelSequence', icon: Layers, desc: 'Unreal 动画序列' },
      ],
    },
    {
      title: '2D 动画工具',
      formats: [
        { value: 'spine-json', label: 'Spine JSON', icon: FileJson, desc: 'Spine 骨骼动画' },
        { value: 'lottie-json', label: 'Lottie JSON', icon: FileJson, desc: 'Bodymovin/Lottie' },
      ],
    },
    {
      title: 'Web 格式',
      formats: [
        { value: 'css-keyframes', label: 'CSS Keyframes', icon: FileCode, desc: 'CSS 动画代码' },
        { value: 'svg-animate', label: 'SVG SMIL', icon: FileCode, desc: 'SVG 动画标记' },
      ],
    },
  ];

  const exportModes: { value: ExportMode; label: string; icon: any; desc: string; disabled?: boolean }[] = [
    { value: 'current', label: '当前图片', icon: FileImage, desc: '仅导出当前正在编辑的图片' },
    { value: 'all-separate', label: '所有图片', icon: Layers, desc: '分别导出所有图片（多个文件）' },
    { value: 'merge-grid-2x3', label: '拼接 2×3', icon: Grid3x3, desc: '拼接成 2列×3行 网格', disabled: imageSlots.length > 6 },
    { value: 'merge-grid-3x2', label: '拼接 3×2', icon: LayoutGrid, desc: '拼接成 3列×2行 网格', disabled: imageSlots.length > 6 },
    { value: 'merge-horizontal', label: '横向拼接', icon: LayoutGrid, desc: '所有图片横向排列成一行' },
    { value: 'merge-vertical', label: '纵向拼接', icon: LayoutGrid, desc: '所有图片纵向排列成一列' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl mb-4">导出选项</h2>
        <div className="text-sm text-gray-600">
          共 {imageSlots.length} 张图片，{allStickers.length} 个贴图元素
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Export Mode Selection */}
        {imageSlots.length > 1 && (
          <div>
            <h3 className="text-sm text-gray-700 mb-3 font-medium">导出模式</h3>
            <div className="space-y-2">
              {exportModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.value}
                    onClick={() => !mode.disabled && setExportMode(mode.value)}
                    disabled={mode.disabled}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      exportMode === mode.value
                        ? 'border-green-500 bg-green-50'
                        : mode.disabled
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{mode.label}</div>
                      <div className="text-xs text-gray-500 truncate">{mode.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Export Format Groups */}
        <div>
          <h3 className="text-sm text-gray-700 mb-3 font-medium">导出格式</h3>
          <div className="space-y-4">
            {formatGroups.map((group) => (
              <div key={group.title}>
                <h4 className="text-xs text-gray-500 mb-2">{group.title}</h4>
                <div className="space-y-2">
                  {group.formats.map((format) => {
                    const Icon = format.icon;
                    return (
                      <button
                        key={format.value}
                        onClick={() => setExportFormat(format.value as ExportFormat)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                          exportFormat === format.value
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{format.label}</div>
                          <div className="text-xs text-gray-500 truncate">{format.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-900">
            <p className="mb-2 font-medium">当前配置：</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 导出模式: {getModeLabel(exportMode)}</li>
              <li>• 导出格式: {formatGroups.flatMap(g => g.formats).find(f => f.value === exportFormat)?.label}</li>
              <li>• 包含贴图: {allStickers.length} 个</li>
              <li>• 包含动画: {animatedStickers.length} 个</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              导出中...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              开始导出
            </>
          )}
        </button>
        
        {/* Progress Indicator */}
        {isExporting && exportProgress > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{exportMessage}</span>
              <span>{exportProgress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// 动画变换计算函数（从animationRenderer.ts复制）
const calculateAnimationTransform = (sticker: Sticker, progress: number): {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
} => {
  if (!sticker.animation) {
    return {
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
    };
  }

  const animProps = getAnimationProps(sticker);
  const animate = animProps.animate || {};

  // 辅助函数：从关键帧数组中插值
  const interpolate = (keyframes: number[] | undefined, defaultValue: number): number => {
    if (!keyframes || keyframes.length === 0) return defaultValue;
    if (keyframes.length === 1) return keyframes[0];

    const totalFrames = keyframes.length;
    const position = progress * (totalFrames - 1);
    const index = Math.floor(position);
    const fraction = position - index;

    if (index >= totalFrames - 1) return keyframes[totalFrames - 1];

    const value1 = keyframes[index];
    const value2 = keyframes[index + 1];

    // 线性插值
    return value1 + (value2 - value1) * fraction;
  };

  return {
    x: interpolate(animate.x as number[] | undefined, 0),
    y: interpolate(animate.y as number[] | undefined, 0),
    rotation: interpolate(animate.rotate as number[] | undefined, 0),
    scaleX: interpolate(animate.scaleX as number[] | undefined, 1),
    scaleY: interpolate(animate.scaleY as number[] | undefined, 1),
    opacity: interpolate(animate.opacity as number[] | undefined, 1),
  };
};