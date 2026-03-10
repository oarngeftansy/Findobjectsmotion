import { Sticker } from '../pages/Editor';
import { getAnimationProps } from './animations';

export interface RenderFrame {
  canvas: HTMLCanvasElement;
  time: number;
}

/**
 * 计算动画在特定时间点的变换值
 */
function calculateAnimationTransform(sticker: Sticker, progress: number): {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
} {
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
}

/**
 * 渲染单帧动画到canvas
 */
export async function renderFrame(
  canvas: HTMLCanvasElement,
  backgroundImage: string,
  stickers: Sticker[],
  time: number,
  displayWidth: number = 1200,
  displayHeight: number = 800
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法获取canvas上下文');

  // 加载背景图
  const bgImg = await loadImage(backgroundImage);

  // 设置画布尺寸为背景图原始尺寸
  canvas.width = bgImg.naturalWidth || bgImg.width;
  canvas.height = bgImg.naturalHeight || bgImg.height;

  // 计算缩放比例
  const scaleX = canvas.width / displayWidth;
  const scaleY = canvas.height / displayHeight;
  const scale = Math.max(scaleX, scaleY);

  // 绘制背景
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // 绘制所有贴图
  for (const sticker of stickers) {
    const img = await loadImage(sticker.src);

    // 计算动画进度
    const duration = (sticker.duration || sticker.animation?.duration || 3) * 1000;
    const progress = (time % duration) / duration;

    // 获取动画变换
    const transform = calculateAnimationTransform(sticker, progress);

    ctx.save();

    // 应用缩放和位置
    const scaledX = sticker.x * scale;
    const scaledY = sticker.y * scale;
    const scaledWidth = sticker.width * scale;
    const scaledHeight = sticker.height * scale;

    // 移动到贴图中心
    ctx.translate(
      scaledX + scaledWidth / 2 + transform.x * scale,
      scaledY + scaledHeight / 2 + transform.y * scale
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

    // 绘制图片
    ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);

    ctx.restore();
  }
}

/**
 * 加载图片的辅助函数
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 计算动画总时长（所有贴图中最长的）
 */
export function calculateTotalDuration(stickers: Sticker[]): number {
  let maxDuration = 3; // 默认3秒

  for (const sticker of stickers) {
    if (sticker.animation) {
      // 使用sticker.duration优先，否则使用animation.duration
      const duration = sticker.duration || sticker.animation.duration || 3;
      
      // 限制单个动画最大时长为10秒，防止异常值
      const safeDuration = Math.min(duration, 10);
      maxDuration = Math.max(maxDuration, safeDuration);
    }
  }

  // 返回值也限制在1-10秒之间
  return Math.min(Math.max(maxDuration, 1), 10);
}