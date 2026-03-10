import { Animation, Sticker } from '../pages/Editor';
import { parseAIAnimation } from './aiAnimationParser';

// Helper function to apply intensity to animation values
function applyIntensity(value: number, intensity: number = 100): number {
  return value * (intensity / 100);
}

// Helper function to apply intensity to array of values
function applyIntensityToArray(values: number[], intensity: number = 100): number[] {
  return values.map(v => applyIntensity(v, intensity));
}

export function getAnimationProps(sticker: Sticker) {
  const { animation, duration: stickerDuration } = sticker;
  if (!animation) return {};
  
  const { type } = animation;
  const duration = stickerDuration || animation.duration;
  const intensity = animation.intensity || 100;

  switch (type) {
    case 'move-swing':
      return {
        animate: {
          x: applyIntensityToArray([0, -(animation.moveDistance || 200), 0], intensity),
          rotate: applyIntensityToArray([0, animation.swingAmount || 15, 0, -(animation.swingAmount || 15), 0], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

    case 'cloth-wave':
      return {
        animate: {
          rotateY: applyIntensityToArray([0, animation.waveIntensity || 20, 0, -(animation.waveIntensity || 20), 0], intensity),
          rotateX: applyIntensityToArray([0, (animation.waveIntensity || 20) / 2, 0, -(animation.waveIntensity || 20) / 2, 0], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
        style: {
          transformStyle: 'preserve-3d',
        },
      };

    case 'jump-bounce':
      return {
        animate: {
          y: applyIntensityToArray([0, -100, -50, -80, 0], intensity),
          scaleY: applyIntensityToArray([1, 1, 0.9, 1, 1], intensity),
          scaleX: applyIntensityToArray([1, 1, 1.1, 1, 1], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        },
      };

    case 'spin':
      return {
        animate: {
          rotate: applyIntensityToArray([0, 360], intensity),
          scale: applyIntensityToArray([1, 1.1, 1], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'linear',
        },
      };

    case 'shake':
      return {
        animate: {
          x: applyIntensityToArray([0, -10, 10, -10, 10, 0], intensity),
          rotate: applyIntensityToArray([0, -5, 5, -5, 5, 0], intensity),
        },
        transition: {
          duration: duration * 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

    case 'fade':
      return {
        animate: {
          opacity: applyIntensityToArray([1, 0.3, 1], intensity),
          scale: applyIntensityToArray([1, 0.95, 1], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

    case 'grow':
      return {
        animate: {
          scale: applyIntensityToArray([1, 1.5, 1], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

    case 'shrink':
      return {
        animate: {
          scale: applyIntensityToArray([1, 0.5, 1], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

    case 'wave':
      return {
        animate: {
          y: applyIntensityToArray([0, -30, 0, 30, 0], intensity),
          rotateZ: applyIntensityToArray([0, 10, 0, -10, 0], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

    case 'float':
      return {
        animate: {
          y: applyIntensityToArray([0, -20, 0, -15, 0], intensity),
          x: applyIntensityToArray([0, 10, 0, -10, 0], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

    case 'swing':
      return {
        animate: {
          rotate: applyIntensityToArray([0, 15, -15, 10, -10, 0], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

    case 'pulse':
      return {
        animate: {
          scale: applyIntensityToArray([1, 1.2, 1, 1.15, 1], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

    case 'glitch':
      return {
        animate: {
          x: applyIntensityToArray([0, -5, 5, -3, 3, 0, -2, 2, 0], intensity),
          opacity: applyIntensityToArray([1, 0.8, 1, 0.9, 1, 0.85, 1], intensity),
          skewX: applyIntensityToArray([0, -5, 5, 0, -3, 3, 0], intensity),
        },
        transition: {
          duration: duration * 0.4,
          repeat: Infinity,
          ease: 'linear',
        },
      };

    case 'octopus-ink':
      return {
        animate: {
          scale: applyIntensityToArray([1, 1.2, 1.1, 1.3, 1], intensity),
          opacity: applyIntensityToArray([1, 1, 0.8, 0.3, 1], intensity),
          rotate: applyIntensityToArray([0, -5, 5, -5, 0], intensity),
          filter: [
            'blur(0px)',
            'blur(2px)',
            'blur(5px)',
            'blur(8px)',
            'blur(0px)'
          ],
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

    case 'fish-swim':
      return {
        animate: {
          x: applyIntensityToArray([0, 50, 0, -50, 0], intensity),
          rotateY: applyIntensityToArray([0, -15, 0, 15, 0], intensity),
          y: applyIntensityToArray([0, -10, 0, 10, 0], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
        style: {
          transformStyle: 'preserve-3d',
        },
      };

    case 'bird-fly':
      return {
        animate: {
          y: applyIntensityToArray([0, -80, -60, -100, 0], intensity),
          rotate: applyIntensityToArray([0, -10, 5, -8, 0], intensity),
          scaleY: applyIntensityToArray([1, 0.9, 1.1, 0.95, 1], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        },
      };

    case 'butterfly':
      return {
        animate: {
          x: applyIntensityToArray([0, 30, -20, 40, 0], intensity),
          y: applyIntensityToArray([0, -40, -20, -50, 0], intensity),
          rotate: applyIntensityToArray([0, 15, -10, 20, 0], intensity),
          scale: applyIntensityToArray([1, 1.05, 0.98, 1.08, 1], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

    case 'fire':
      return {
        animate: {
          y: applyIntensityToArray([0, -20, -10, -30, 0], intensity),
          scale: applyIntensityToArray([1, 1.1, 0.95, 1.15, 1], intensity),
          rotate: applyIntensityToArray([0, 5, -5, 8, 0], intensity),
          opacity: applyIntensityToArray([1, 0.9, 1, 0.85, 1], intensity),
        },
        transition: {
          duration: duration * 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

    case 'water':
      return {
        animate: {
          y: applyIntensityToArray([0, 10, -10, 15, 0], intensity),
          scaleY: applyIntensityToArray([1, 1.05, 0.95, 1.08, 1], intensity),
          rotateX: applyIntensityToArray([0, 5, -5, 8, 0], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
        style: {
          transformStyle: 'preserve-3d',
        },
      };

    case 'electric':
      return {
        animate: {
          x: applyIntensityToArray([0, -5, 5, -3, 3, 0], intensity),
          y: applyIntensityToArray([0, -3, 3, -5, 5, 0], intensity),
          opacity: applyIntensityToArray([1, 0.7, 1, 0.8, 1, 1], intensity),
          scale: applyIntensityToArray([1, 1.05, 1, 1.03, 1, 1], intensity),
        },
        transition: {
          duration: duration * 0.3,
          repeat: Infinity,
          ease: 'linear',
        },
      };

    case 'patrol-horizontal':
      // 横向往返巡逻 - 添加镜像翻转效果
      const horizontalDistance = animation.patrolDistance || 300;
      return {
        animate: {
          x: applyIntensityToArray([0, horizontalDistance, 0], intensity),
          scaleX: [1, 1, -1, -1, 1], // 往返时左右镜像
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.45, 0.5, 0.95, 1], // 精确控制镜像时机
        },
      };

    case 'patrol-vertical':
      // 纵向往返巡逻 - 添加上下镜像效果
      const verticalDistance = animation.patrolDistance || 200;
      return {
        animate: {
          y: applyIntensityToArray([0, verticalDistance, 0], intensity),
          scaleY: [1, 1, -1, -1, 1], // 往返时上下镜像
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.45, 0.5, 0.95, 1],
        },
      };

    // 自然元素动画
    case 'flowing-water':
      // 流水效果 - 持续流动，带波纹感
      return {
        animate: {
          x: applyIntensityToArray([0, -30, 0, 30, 0], intensity),
          y: applyIntensityToArray([0, 5, 0, -5, 0], intensity),
          scaleX: applyIntensityToArray([1, 1.05, 1, 0.95, 1], intensity),
          opacity: applyIntensityToArray([0.8, 1, 0.8, 1, 0.8], intensity),
        },
        transition: {
          duration: duration * 0.8,
          repeat: Infinity,
          ease: 'linear',
        },
      };

    case 'water-ripple':
      // 水波涟漪 - 从中心向外扩散
      return {
        animate: {
          scale: applyIntensityToArray([1, 1.3, 1.5], intensity),
          opacity: applyIntensityToArray([0.8, 0.5, 0], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeOut',
        },
      };

    case 'fountain-spray':
      // 喷泉喷涌 - 向上喷射后落下
      return {
        animate: {
          y: applyIntensityToArray([0, -150, -100, -120, 0], intensity),
          scaleY: applyIntensityToArray([1, 1.2, 0.8, 1.1, 1], intensity),
          opacity: applyIntensityToArray([1, 1, 0.7, 0.9, 1], intensity),
        },
        transition: {
          duration: duration * 0.7,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        },
      };

    case 'rain-drop':
      // 雨滴飘落
      return {
        animate: {
          y: applyIntensityToArray([0, 300], intensity),
          x: applyIntensityToArray([0, -20], intensity),
          opacity: applyIntensityToArray([0, 1, 1, 0.5], intensity),
          scaleY: applyIntensityToArray([0.8, 1.2, 1.2, 1], intensity),
        },
        transition: {
          duration: duration * 0.6,
          repeat: Infinity,
          ease: 'linear',
        },
      };

    case 'snow-fall':
      // 雪花飘落 - 缓慢摇摆飘落
      return {
        animate: {
          y: applyIntensityToArray([0, 250], intensity),
          x: applyIntensityToArray([0, 30, -30, 20, 0], intensity),
          rotate: applyIntensityToArray([0, 180, 360], intensity),
          opacity: applyIntensityToArray([0, 1, 1, 0.8], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'linear',
        },
      };

    case 'cloud-drift':
      // 云朵飘动 - 缓慢横向移动
      return {
        animate: {
          x: applyIntensityToArray([0, 400], intensity),
          y: applyIntensityToArray([0, -10, 0, 10, 0], intensity),
          opacity: applyIntensityToArray([0.7, 0.9, 0.8, 0.9, 0.7], intensity),
        },
        transition: {
          duration: duration * 3,
          repeat: Infinity,
          ease: 'linear',
        },
      };

    case 'smoke-rise':
      // 烟雾上升 - 向上飘散
      return {
        animate: {
          y: applyIntensityToArray([0, -200], intensity),
          x: applyIntensityToArray([0, -20, 20, -10, 0], intensity),
          scale: applyIntensityToArray([0.8, 1.2, 1.5], intensity),
          opacity: applyIntensityToArray([1, 0.8, 0.3, 0], intensity),
          rotate: applyIntensityToArray([0, -15, 15, -10, 0], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeOut',
        },
      };

    // 人物角色动画
    case 'character-run':
      // 跑步 - 快速上下弹跳 + 前倾
      return {
        animate: {
          x: applyIntensityToArray([0, 50, 100, 150, 200], intensity),
          y: applyIntensityToArray([0, -15, 0, -15, 0], intensity),
          rotate: applyIntensityToArray([0, 5, 0, 5, 0], intensity),
          scaleX: applyIntensityToArray([1, 0.95, 1, 0.95, 1], intensity),
          scaleY: applyIntensityToArray([1, 1.05, 1, 1.05, 1], intensity),
        },
        transition: {
          duration: duration * 0.5,
          repeat: Infinity,
          ease: 'linear',
        },
      };

    case 'character-walk':
      // 走路 - 轻微上下摆动
      return {
        animate: {
          x: applyIntensityToArray([0, 100], intensity),
          y: applyIntensityToArray([0, -8, 0, -8, 0], intensity),
          rotate: applyIntensityToArray([0, -2, 0, 2, 0], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'linear',
        },
      };

    case 'character-dive':
      // 潜水 - 快速向下并前倾
      return {
        animate: {
          y: applyIntensityToArray([0, 200], intensity),
          x: applyIntensityToArray([0, 50], intensity),
          rotate: applyIntensityToArray([0, 45, 60], intensity),
          scaleY: applyIntensityToArray([1, 0.9, 0.8], intensity),
        },
        transition: {
          duration: duration * 0.6,
          repeat: Infinity,
          ease: [0.4, 0, 0.6, 1],
        },
      };

    case 'character-swim':
      // 游泳 - 波浪式前进
      return {
        animate: {
          x: applyIntensityToArray([0, 150], intensity),
          y: applyIntensityToArray([0, -20, 0, 20, 0], intensity),
          rotate: applyIntensityToArray([0, -10, 0, 10, 0], intensity),
          scaleX: applyIntensityToArray([1, 0.95, 1, 0.95, 1], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

    case 'character-climb':
      // 攀爬 - 向上移动 + 左右摆动
      return {
        animate: {
          y: applyIntensityToArray([0, -150], intensity),
          x: applyIntensityToArray([0, -10, 10, -5, 5, 0], intensity),
          rotate: applyIntensityToArray([0, -5, 5, -3, 3, 0], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: 'linear',
        },
      };

    case 'character-slide':
      // 滑行 - 快速平滑移动 + 后倾
      return {
        animate: {
          x: applyIntensityToArray([0, 250], intensity),
          rotate: applyIntensityToArray([0, -15, -12], intensity),
          y: applyIntensityToArray([0, 5, 0], intensity),
        },
        transition: {
          duration: duration * 0.7,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        },
      };

    case 'character-wave':
      // 挥手 - 手臂摆动效果
      return {
        animate: {
          rotate: applyIntensityToArray([0, -20, 20, -15, 15, -10, 10, 0], intensity),
          x: applyIntensityToArray([0, -5, 5, -3, 3, 0], intensity),
        },
        transition: {
          duration: duration * 0.6,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

    case 'character-nod':
      // 点头 - 上下点头
      return {
        animate: {
          rotate: applyIntensityToArray([0, 10, 0, 10, 0], intensity),
          y: applyIntensityToArray([0, 5, 0, 5, 0], intensity),
        },
        transition: {
          duration: duration * 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

    case 'character-breathe':
      // 呼吸 - 微小的缩放变化
      return {
        animate: {
          scaleY: applyIntensityToArray([1, 1.03, 1], intensity),
          scaleX: applyIntensityToArray([1, 0.99, 1], intensity),
          y: applyIntensityToArray([0, -2, 0], intensity),
        },
        transition: {
          duration: duration * 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

    case 'character-jump':
      // 角色跳跃 - 更自然的跳跃动作
      return {
        animate: {
          y: applyIntensityToArray([0, -120, -80, -100, 0], intensity),
          scaleY: applyIntensityToArray([1, 1.05, 0.9, 1, 1.1, 1], intensity),
          scaleX: applyIntensityToArray([1, 0.95, 1.1, 1, 0.9, 1], intensity),
          rotate: applyIntensityToArray([0, -5, 5, 0], intensity),
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        },
      };

    case 'ai-custom':
      // Use AI animation parser
      const aiConfig = parseAIAnimation(animation.aiPrompt || '', duration);
      return {
        animate: aiConfig.keyframes,
        transition: aiConfig.transition,
        style: aiConfig.style,
      };

    default:
      return {};
  }
}