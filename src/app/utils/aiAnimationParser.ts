// AI动画指令解析器 - 根据用户输入的描述生成动画参数

interface AIAnimationConfig {
  keyframes: any;
  transition: any;
  style?: any;
}

export function parseAIAnimation(prompt: string, duration: number): AIAnimationConfig {
  const lowerPrompt = prompt.toLowerCase();
  
  // 识别动作类型关键词
  const hasJump = /跳|跃|蹦|弹/.test(lowerPrompt);
  const hasSpin = /旋转|转圈|打转|自转/.test(lowerPrompt);
  const hasShake = /震动|摇晃|抖动|颤抖/.test(lowerPrompt);
  const hasFade = /渐隐|消失|淡出|透明/.test(lowerPrompt);
  const hasGrow = /变大|放大|增长|膨胀/.test(lowerPrompt);
  const hasShrink = /变小|缩小|收缩/.test(lowerPrompt);
  const hasWave = /波动|起伏|波浪|飘/.test(lowerPrompt);
  const hasFloat = /漂浮|浮动|悬浮/.test(lowerPrompt);
  const hasBounce = /弹跳|反弹/.test(lowerPrompt);
  const hasSwing = /摆动|摇摆|晃动/.test(lowerPrompt);
  const hasPulse = /脉冲|跳动|心跳/.test(lowerPrompt);
  const hasGlitch = /故障|闪烁|错位/.test(lowerPrompt);
  
  // 往返巡逻关键词
  const hasPatrol = /巡逻|往返|来回|巡视/.test(lowerPrompt);
  const hasHorizontal = /横|左右|水平/.test(lowerPrompt);
  const hasVertical = /竖|纵|上下|垂直/.test(lowerPrompt);
  const hasFlip = /翻转|镜像|调头|转身/.test(lowerPrompt);
  
  // 自然元素关键词
  const hasFlowing = /流水|水流|流动/.test(lowerPrompt);
  const hasRipple = /涟漪|波纹|水波纹/.test(lowerPrompt);
  const hasFountain = /喷泉|喷涌|喷射/.test(lowerPrompt);
  const hasRain = /雨|雨滴|下雨/.test(lowerPrompt);
  const hasSnow = /雪|雪花|下雪/.test(lowerPrompt);
  const hasCloud = /云|云朵|云彩/.test(lowerPrompt);
  const hasSmoke = /烟|烟雾|烟雾缭绕/.test(lowerPrompt);
  
  // 人物角色关键词
  const hasRun = /跑|奔跑|冲刺/.test(lowerPrompt);
  const hasWalk = /走|行走|步行/.test(lowerPrompt);
  const hasDive = /潜水|下潜|跳水/.test(lowerPrompt);
  const hasSwim = /游泳|游水/.test(lowerPrompt);
  const hasClimb = /攀爬|爬|攀登/.test(lowerPrompt);
  const hasSlide = /滑行|滑动|滑/.test(lowerPrompt);
  const hasWaveHand = /挥手|招手/.test(lowerPrompt);
  const hasNod = /点头|点头同意/.test(lowerPrompt);
  const hasBreathe = /呼吸|待机|idle/.test(lowerPrompt);
  
  // 动物相关动画
  const hasOctopus = /章鱼|墨鱼|乌贼/.test(lowerPrompt);
  const hasFish = /鱼|游泳/.test(lowerPrompt);
  const hasBird = /鸟|飞|扇翅|拍翅/.test(lowerPrompt);
  const hasButterfly = /蝴蝶/.test(lowerPrompt);
  
  // 特殊效果关键词
  const hasInk = /墨|喷墨|墨汁/.test(lowerPrompt);
  const hasFire = /火|燃烧|火焰/.test(lowerPrompt);
  const hasWater = /水|水花|水滴/.test(lowerPrompt);
  const hasWind = /风|吹/.test(lowerPrompt);
  const hasElectric = /电|闪电|雷/.test(lowerPrompt);
  
  // 根据关键词组合生成动画
  
  // 自然元素动画
  if (hasFlowing) {
    return {
      keyframes: {
        x: [0, -30, 0, 30, 0],
        y: [0, 5, 0, -5, 0],
        scaleX: [1, 1.05, 1, 0.95, 1],
        opacity: [0.8, 1, 0.8, 1, 0.8],
      },
      transition: {
        duration: duration * 0.8,
        repeat: Infinity,
        ease: 'linear',
      },
    };
  }
  
  if (hasRipple) {
    return {
      keyframes: {
        scale: [1, 1.3, 1.5],
        opacity: [0.8, 0.5, 0],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeOut',
      },
    };
  }
  
  if (hasFountain) {
    return {
      keyframes: {
        y: [0, -150, -100, -120, 0],
        scaleY: [1, 1.2, 0.8, 1.1, 1],
        opacity: [1, 1, 0.7, 0.9, 1],
      },
      transition: {
        duration: duration * 0.7,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1],
      },
    };
  }
  
  if (hasRain) {
    return {
      keyframes: {
        y: [0, 300],
        x: [0, -20],
        opacity: [0, 1, 1, 0.5],
        scaleY: [0.8, 1.2, 1.2, 1],
      },
      transition: {
        duration: duration * 0.6,
        repeat: Infinity,
        ease: 'linear',
      },
    };
  }
  
  if (hasSnow) {
    return {
      keyframes: {
        y: [0, 250],
        x: [0, 30, -30, 20, 0],
        rotate: [0, 180, 360],
        opacity: [0, 1, 1, 0.8],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'linear',
      },
    };
  }
  
  if (hasCloud) {
    return {
      keyframes: {
        x: [0, 400],
        y: [0, -10, 0, 10, 0],
        opacity: [0.7, 0.9, 0.8, 0.9, 0.7],
      },
      transition: {
        duration: duration * 3,
        repeat: Infinity,
        ease: 'linear',
      },
    };
  }
  
  if (hasSmoke) {
    return {
      keyframes: {
        y: [0, -200],
        x: [0, -20, 20, -10, 0],
        scale: [0.8, 1.2, 1.5],
        opacity: [1, 0.8, 0.3, 0],
        rotate: [0, -15, 15, -10, 0],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeOut',
      },
    };
  }
  
  // 人物角色动画
  if (hasRun) {
    return {
      keyframes: {
        x: [0, 50, 100, 150, 200],
        y: [0, -15, 0, -15, 0],
        rotate: [0, 5, 0, 5, 0],
        scaleX: [1, 0.95, 1, 0.95, 1],
        scaleY: [1, 1.05, 1, 1.05, 1],
      },
      transition: {
        duration: duration * 0.5,
        repeat: Infinity,
        ease: 'linear',
      },
    };
  }
  
  if (hasWalk) {
    return {
      keyframes: {
        x: [0, 100],
        y: [0, -8, 0, -8, 0],
        rotate: [0, -2, 0, 2, 0],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'linear',
      },
    };
  }
  
  if (hasDive) {
    return {
      keyframes: {
        y: [0, 200],
        x: [0, 50],
        rotate: [0, 45, 60],
        scaleY: [1, 0.9, 0.8],
      },
      transition: {
        duration: duration * 0.6,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1],
      },
    };
  }
  
  if (hasSwim) {
    return {
      keyframes: {
        x: [0, 150],
        y: [0, -20, 0, 20, 0],
        rotate: [0, -10, 0, 10, 0],
        scaleX: [1, 0.95, 1, 0.95, 1],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    };
  }
  
  if (hasClimb) {
    return {
      keyframes: {
        y: [0, -150],
        x: [0, -10, 10, -5, 5, 0],
        rotate: [0, -5, 5, -3, 3, 0],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'linear',
      },
    };
  }
  
  if (hasSlide) {
    return {
      keyframes: {
        x: [0, 250],
        rotate: [0, -15, -12],
        y: [0, 5, 0],
      },
      transition: {
        duration: duration * 0.7,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1],
      },
    };
  }
  
  if (hasWaveHand) {
    return {
      keyframes: {
        rotate: [0, -20, 20, -15, 15, -10, 10, 0],
        x: [0, -5, 5, -3, 3, 0],
      },
      transition: {
        duration: duration * 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    };
  }
  
  if (hasNod) {
    return {
      keyframes: {
        rotate: [0, 10, 0, 10, 0],
        y: [0, 5, 0, 5, 0],
      },
      transition: {
        duration: duration * 0.8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    };
  }
  
  if (hasBreathe) {
    return {
      keyframes: {
        scaleY: [1, 1.03, 1],
        scaleX: [1, 0.99, 1],
        y: [0, -2, 0],
      },
      transition: {
        duration: duration * 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    };
  }
  
  // 横向往返巡逻（带镜像）
  if ((hasPatrol || hasFlip) && hasHorizontal) {
    return {
      keyframes: {
        x: [0, 300, 0],
        scaleX: [1, 1, -1, -1, 1],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        times: [0, 0.45, 0.5, 0.95, 1],
      },
    };
  }
  
  // 纵向往返巡逻（带镜像）
  if ((hasPatrol || hasFlip) && hasVertical) {
    return {
      keyframes: {
        y: [0, 200, 0],
        scaleY: [1, 1, -1, -1, 1],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        times: [0, 0.45, 0.5, 0.95, 1],
      },
    };
  }
  
  // 章鱼喷墨效果
  if (hasOctopus && hasInk) {
    return {
      keyframes: {
        scale: [1, 1.2, 1.1, 1.3, 1],
        opacity: [1, 1, 0.8, 0.3, 1],
        rotate: [0, -5, 5, -5, 0],
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
  }
  
  // 鱼游泳
  if (hasFish) {
    return {
      keyframes: {
        x: [0, 50, 0, -50, 0],
        rotateY: [0, -15, 0, 15, 0],
        y: [0, -10, 0, 10, 0],
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
  }
  
  // 鸟飞翔
  if (hasBird) {
    return {
      keyframes: {
        y: [0, -80, -60, -100, 0],
        rotate: [0, -10, 5, -8, 0],
        scaleY: [1, 0.9, 1.1, 0.95, 1],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1],
      },
    };
  }
  
  // 蝴蝶飞舞
  if (hasButterfly) {
    return {
      keyframes: {
        x: [0, 30, -20, 40, 0],
        y: [0, -40, -20, -50, 0],
        rotate: [0, 15, -10, 20, 0],
        scale: [1, 1.05, 0.98, 1.08, 1],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    };
  }
  
  // 火焰效果
  if (hasFire) {
    return {
      keyframes: {
        y: [0, -20, -10, -30, 0],
        scale: [1, 1.1, 0.95, 1.15, 1],
        rotate: [0, 5, -5, 8, 0],
        opacity: [1, 0.9, 1, 0.85, 1],
      },
      transition: {
        duration: duration * 0.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    };
  }
  
  // 水波效果
  if (hasWater) {
    return {
      keyframes: {
        y: [0, 10, -10, 15, 0],
        scaleY: [1, 1.05, 0.95, 1.08, 1],
        rotateX: [0, 5, -5, 8, 0],
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
  }
  
  // 闪电效果
  if (hasElectric) {
    return {
      keyframes: {
        x: [0, -5, 5, -3, 3, 0],
        y: [0, -3, 3, -5, 5, 0],
        opacity: [1, 0.7, 1, 0.8, 1, 1],
        scale: [1, 1.05, 1, 1.03, 1, 1],
      },
      transition: {
        duration: duration * 0.3,
        repeat: Infinity,
        ease: 'linear',
      },
    };
  }
  
  // 基础动作类型
  if (hasJump || hasBounce) {
    return {
      keyframes: {
        y: [0, -100, -50, -80, 0],
        scaleY: [1, 1, 0.9, 1, 1],
        scaleX: [1, 1, 1.1, 1, 1],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1],
      },
    };
  }
  
  if (hasSpin) {
    return {
      keyframes: {
        rotate: [0, 360],
        scale: [1, 1.1, 1],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'linear',
      },
    };
  }
  
  if (hasShake) {
    return {
      keyframes: {
        x: [0, -10, 10, -10, 10, 0],
        rotate: [0, -5, 5, -5, 5, 0],
      },
      transition: {
        duration: duration * 0.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    };
  }
  
  if (hasFade) {
    return {
      keyframes: {
        opacity: [1, 0.3, 1],
        scale: [1, 0.95, 1],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    };
  }
  
  if (hasGrow) {
    return {
      keyframes: {
        scale: [1, 1.5, 1],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    };
  }
  
  if (hasShrink) {
    return {
      keyframes: {
        scale: [1, 0.5, 1],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    };
  }
  
  if (hasWave) {
    return {
      keyframes: {
        y: [0, -30, 0, 30, 0],
        rotateZ: [0, 10, 0, -10, 0],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    };
  }
  
  if (hasFloat) {
    return {
      keyframes: {
        y: [0, -20, 0, -15, 0],
        x: [0, 10, 0, -10, 0],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    };
  }
  
  if (hasSwing) {
    return {
      keyframes: {
        rotate: [0, 15, -15, 10, -10, 0],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    };
  }
  
  if (hasPulse) {
    return {
      keyframes: {
        scale: [1, 1.2, 1, 1.15, 1],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    };
  }
  
  if (hasGlitch) {
    return {
      keyframes: {
        x: [0, -5, 5, -3, 3, 0, -2, 2, 0],
        opacity: [1, 0.8, 1, 0.9, 1, 0.85, 1],
        skewX: [0, -5, 5, 0, -3, 3, 0],
      },
      transition: {
        duration: duration * 0.4,
        repeat: Infinity,
        ease: 'linear',
      },
    };
  }
  
  // 默认动画（如果没有匹配到任何关键词）
  return {
    keyframes: {
      y: [0, -30, 0, -20, 0],
      scale: [1, 1.1, 1, 1.05, 1],
      rotate: [0, 5, 0, -5, 0],
    },
    transition: {
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };
}