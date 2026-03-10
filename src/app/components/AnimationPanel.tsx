import { useState } from 'react';
import { Sticker, Animation } from '../pages/Editor';
import { Trash2, Play, Settings, ChevronDown, ChevronRight } from 'lucide-react';

interface AnimationPanelProps {
  selectedSticker: Sticker | undefined;
  onUpdateAnimation: (animation: Animation) => void;
  onUpdateRotation: (rotation: number) => void;
  onUpdateDuration: (duration: number) => void;
}

// 定义每个动画的参数配置
interface AnimationParams {
  [key: string]: any;
}

const DEFAULT_PARAMS: Record<string, AnimationParams> = {
  'move-swing': { moveDistance: 200, swingAmount: 15, intensity: 100 },
  'swing': { swingAmount: 20, intensity: 100 },
  'shake': { shakeIntensity: 10, intensity: 100 },
  'wave': { waveIntensity: 15, intensity: 100 },
  'float': { floatDistance: 30, intensity: 100 },
  'jump-bounce': { jumpHeight: 50, bounceIntensity: 30, intensity: 100 },
  'spin': { spinSpeed: 360, intensity: 100 },
  'pulse': { pulseScale: 1.2, intensity: 100 },
  'glitch': { glitchIntensity: 20, intensity: 100 },
  'grow': { growScale: 1.5, intensity: 100 },
  'shrink': { shrinkScale: 0.5, intensity: 100 },
  'fade': { fadeOpacity: 0.3, intensity: 100 },
  'cloth-wave': { waveIntensity: 20, intensity: 100 },
  'patrol-horizontal': { patrolDistance: 300, intensity: 100 },
  'patrol-vertical': { patrolDistance: 300, intensity: 100 },
  'flowing-water': { flowSpeed: 100, waveIntensity: 15, intensity: 100 },
  'water-ripple': { rippleIntensity: 20, rippleCount: 3, intensity: 100 },
  'fountain-spray': { sprayHeight: 80, sprayIntensity: 30, intensity: 100 },
  'rain-drop': { dropSpeed: 150, dropIntensity: 20, intensity: 100 },
  'snow-fall': { fallSpeed: 80, swayIntensity: 15, intensity: 100 },
  'cloud-drift': { driftSpeed: 50, intensity: 100 },
  'smoke-rise': { riseSpeed: 100, expandIntensity: 20, intensity: 100 },
  'character-run': { runSpeed: 200, bounceIntensity: 10, intensity: 100 },
  'character-walk': { walkSpeed: 100, swayIntensity: 8, intensity: 100 },
  'character-jump': { jumpHeight: 80, intensity: 100 },
  'character-dive': { diveDepth: 150, intensity: 100 },
  'character-swim': { swimSpeed: 120, waveIntensity: 10, intensity: 100 },
  'character-climb': { climbSpeed: 100, swayIntensity: 8, intensity: 100 },
  'character-slide': { slideSpeed: 180, intensity: 100 },
  'character-wave': { waveIntensity: 25, intensity: 100 },
  'character-nod': { nodIntensity: 15, intensity: 100 },
  'character-breathe': { breatheIntensity: 8, intensity: 100 },
  'octopus-ink': { inkIntensity: 30, intensity: 100 },
  'fish-swim': { swimSpeed: 120, waveIntensity: 15, intensity: 100 },
  'bird-fly': { flySpeed: 150, flapIntensity: 20, intensity: 100 },
  'butterfly': { flySpeed: 80, flutterIntensity: 25, intensity: 100 },
  'fire': { flameIntensity: 30, flickerSpeed: 20, intensity: 100 },
  'water': { waveIntensity: 20, flowSpeed: 15, intensity: 100 },
  'electric': { boltIntensity: 40, flashSpeed: 10, intensity: 100 },
  'ai-custom': { aiPrompt: '', intensity: 100 },
};

export default function AnimationPanel({
  selectedSticker,
  onUpdateAnimation,
  onUpdateRotation,
  onUpdateDuration,
}: AnimationPanelProps) {
  const [animationType, setAnimationType] = useState<Animation['type']>(
    selectedSticker?.animation?.type || 'move-swing'
  );
  const [duration, setDuration] = useState(selectedSticker?.duration || selectedSticker?.animation?.duration || 3);
  const [rotation, setRotation] = useState(selectedSticker?.rotation || 0);
  const [expandedAnimation, setExpandedAnimation] = useState<string | null>(null);
  
  // 通用参数状态
  const [animationParams, setAnimationParams] = useState<Record<string, AnimationParams>>(() => {
    const initialParams: Record<string, AnimationParams> = {};
    Object.keys(DEFAULT_PARAMS).forEach(key => {
      initialParams[key] = { ...DEFAULT_PARAMS[key] };
    });
    return initialParams;
  });

  const handleApply = () => {
    const params = animationParams[animationType] || {};
    const animation: Animation = {
      type: animationType,
      duration,
      ...(animationType === 'move-swing' && { 
        moveDistance: params.moveDistance, 
        swingAmount: params.swingAmount 
      }),
      ...(animationType === 'cloth-wave' && { waveIntensity: params.waveIntensity }),
      ...((animationType === 'patrol-horizontal' || animationType === 'patrol-vertical') && { 
        patrolDistance: params.patrolDistance 
      }),
      ...(animationType === 'ai-custom' && { aiPrompt: params.aiPrompt }),
    };
    onUpdateAnimation(animation);
    onUpdateRotation(rotation);
    onUpdateDuration(duration);
  };

  if (!selectedSticker) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-2">未选中贴图</p>
          <p className="text-sm">请先在画布上选择一个贴图元素</p>
        </div>
      </div>
    );
  }

  const updateParam = (animType: string, paramName: string, value: any) => {
    setAnimationParams(prev => ({
      ...prev,
      [animType]: {
        ...prev[animType],
        [paramName]: value,
      },
    }));
  };

  const toggleExpanded = (animValue: string) => {
    setExpandedAnimation(expandedAnimation === animValue ? null : animValue);
  };

  const renderParamControls = (animValue: string) => {
    const params = animationParams[animValue] || {};
    
    // 根据动画类型渲染不同的参数控制
    const renderControls = () => {
      switch (animValue) {
        case 'move-swing':
          return (
            <>
              <div>
                <label className="block text-xs mb-1 text-gray-600">移动距离: {params.moveDistance}px</label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={params.moveDistance}
                  onChange={(e) => updateParam(animValue, 'moveDistance', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">摇摆幅度: {params.swingAmount}°</label>
                <input
                  type="range"
                  min="0"
                  max="45"
                  step="1"
                  value={params.swingAmount}
                  onChange={(e) => updateParam(animValue, 'swingAmount', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">整体强度: {params.intensity}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={params.intensity}
                  onChange={(e) => updateParam(animValue, 'intensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          );
        
        case 'swing':
          return (
            <>
              <div>
                <label className="block text-xs mb-1 text-gray-600">摇摆幅度: {params.swingAmount}°</label>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="1"
                  value={params.swingAmount}
                  onChange={(e) => updateParam(animValue, 'swingAmount', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">整体强度: {params.intensity}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={params.intensity}
                  onChange={(e) => updateParam(animValue, 'intensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          );

        case 'shake':
          return (
            <>
              <div>
                <label className="block text-xs mb-1 text-gray-600">震动强度: {params.shakeIntensity}px</label>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={params.shakeIntensity}
                  onChange={(e) => updateParam(animValue, 'shakeIntensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">整体强度: {params.intensity}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={params.intensity}
                  onChange={(e) => updateParam(animValue, 'intensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          );

        case 'wave':
          return (
            <>
              <div>
                <label className="block text-xs mb-1 text-gray-600">波动强度: {params.waveIntensity}px</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={params.waveIntensity}
                  onChange={(e) => updateParam(animValue, 'waveIntensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">整体强度: {params.intensity}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={params.intensity}
                  onChange={(e) => updateParam(animValue, 'intensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          );

        case 'float':
          return (
            <>
              <div>
                <label className="block text-xs mb-1 text-gray-600">漂浮距离: {params.floatDistance}px</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={params.floatDistance}
                  onChange={(e) => updateParam(animValue, 'floatDistance', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">整体强度: {params.intensity}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={params.intensity}
                  onChange={(e) => updateParam(animValue, 'intensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          );

        case 'jump-bounce':
          return (
            <>
              <div>
                <label className="block text-xs mb-1 text-gray-600">跳跃高度: {params.jumpHeight}px</label>
                <input
                  type="range"
                  min="20"
                  max="150"
                  step="5"
                  value={params.jumpHeight}
                  onChange={(e) => updateParam(animValue, 'jumpHeight', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">弹跳强度: {params.bounceIntensity}px</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={params.bounceIntensity}
                  onChange={(e) => updateParam(animValue, 'bounceIntensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">整体强度: {params.intensity}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={params.intensity}
                  onChange={(e) => updateParam(animValue, 'intensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          );

        case 'spin':
          return (
            <>
              <div>
                <label className="block text-xs mb-1 text-gray-600">旋转速度: {params.spinSpeed}°</label>
                <input
                  type="range"
                  min="90"
                  max="1080"
                  step="90"
                  value={params.spinSpeed}
                  onChange={(e) => updateParam(animValue, 'spinSpeed', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">整体强度: {params.intensity}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={params.intensity}
                  onChange={(e) => updateParam(animValue, 'intensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          );

        case 'pulse':
          return (
            <>
              <div>
                <label className="block text-xs mb-1 text-gray-600">脉冲缩放: {params.pulseScale.toFixed(1)}x</label>
                <input
                  type="range"
                  min="1.0"
                  max="2.0"
                  step="0.1"
                  value={params.pulseScale}
                  onChange={(e) => updateParam(animValue, 'pulseScale', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">整体强度: {params.intensity}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={params.intensity}
                  onChange={(e) => updateParam(animValue, 'intensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          );

        case 'glitch':
          return (
            <>
              <div>
                <label className="block text-xs mb-1 text-gray-600">故障强度: {params.glitchIntensity}px</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={params.glitchIntensity}
                  onChange={(e) => updateParam(animValue, 'glitchIntensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">整体强度: {params.intensity}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={params.intensity}
                  onChange={(e) => updateParam(animValue, 'intensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          );

        case 'grow':
          return (
            <>
              <div>
                <label className="block text-xs mb-1 text-gray-600">放大倍数: {params.growScale.toFixed(1)}x</label>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  value={params.growScale}
                  onChange={(e) => updateParam(animValue, 'growScale', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">整体强度: {params.intensity}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={params.intensity}
                  onChange={(e) => updateParam(animValue, 'intensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          );

        case 'shrink':
          return (
            <>
              <div>
                <label className="block text-xs mb-1 text-gray-600">缩小倍数: {params.shrinkScale.toFixed(1)}x</label>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={params.shrinkScale}
                  onChange={(e) => updateParam(animValue, 'shrinkScale', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">整体强度: {params.intensity}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={params.intensity}
                  onChange={(e) => updateParam(animValue, 'intensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          );

        case 'fade':
          return (
            <>
              <div>
                <label className="block text-xs mb-1 text-gray-600">最低透明度: {(params.fadeOpacity * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0"
                  max="0.9"
                  step="0.1"
                  value={params.fadeOpacity}
                  onChange={(e) => updateParam(animValue, 'fadeOpacity', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">整体强度: {params.intensity}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={params.intensity}
                  onChange={(e) => updateParam(animValue, 'intensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          );

        case 'cloth-wave':
          return (
            <>
              <div>
                <label className="block text-xs mb-1 text-gray-600">摇摆强度: {params.waveIntensity}</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={params.waveIntensity}
                  onChange={(e) => updateParam(animValue, 'waveIntensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">整体强度: {params.intensity}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={params.intensity}
                  onChange={(e) => updateParam(animValue, 'intensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          );

        case 'patrol-horizontal':
        case 'patrol-vertical':
          return (
            <>
              <div>
                <label className="block text-xs mb-1 text-gray-600">巡逻距离: {params.patrolDistance}px</label>
                <input
                  type="range"
                  min="100"
                  max="600"
                  step="10"
                  value={params.patrolDistance}
                  onChange={(e) => updateParam(animValue, 'patrolDistance', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">整体强度: {params.intensity}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={params.intensity}
                  onChange={(e) => updateParam(animValue, 'intensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
                💡 自动镜像翻转模拟真实调头效果
              </div>
            </>
          );

        case 'ai-custom':
          return (
            <div>
              <label className="block text-xs mb-1 text-gray-600">AI 动画描述</label>
              <textarea
                value={params.aiPrompt || ''}
                onChange={(e) => updateParam(animValue, 'aiPrompt', e.target.value)}
                placeholder="例如：这是一个章鱼，帮它加上喷墨的动画"
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>
          );

        // 所有其他动画类型都有intensity参数
        default:
          return (
            <div>
              <label className="block text-xs mb-1 text-gray-600">整体强度: {params.intensity}%</label>
              <input
                type="range"
                min="0"
                max="200"
                step="10"
                value={params.intensity}
                onChange={(e) => updateParam(animValue, 'intensity', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          );
      }
    };

    return (
      <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
        {renderControls()}
      </div>
    );
  };

  const animationGroups = [
    {
      title: '基础动画',
      options: [
        { value: 'move-swing', label: '向左移动并摇摆' },
        { value: 'swing', label: '摇摆' },
        { value: 'shake', label: '震动抖动' },
        { value: 'wave', label: '波动起伏' },
        { value: 'float', label: '漂浮悬浮' },
      ],
    },
    {
      title: '往返巡逻（带镜像）',
      options: [
        { value: 'patrol-horizontal', label: '横向往返巡逻 🔄' },
        { value: 'patrol-vertical', label: '纵向往返巡逻 🔄' },
      ],
    },
    {
      title: '动作效果',
      options: [
        { value: 'jump-bounce', label: '跳跃弹跳' },
        { value: 'spin', label: '旋转转圈' },
        { value: 'pulse', label: '脉冲心跳' },
        { value: 'glitch', label: '故障闪烁' },
      ],
    },
    {
      title: '缩放透明',
      options: [
        { value: 'grow', label: '变大放大' },
        { value: 'shrink', label: '变小缩小' },
        { value: 'fade', label: '渐隐淡出' },
      ],
    },
    {
      title: '3D效果',
      options: [
        { value: 'cloth-wave', label: '布料摇摆' },
      ],
    },
    {
      title: '自然元素 💧',
      options: [
        { value: 'flowing-water', label: '流水效果' },
        { value: 'water-ripple', label: '水波涟漪' },
        { value: 'fountain-spray', label: '喷泉喷涌' },
        { value: 'rain-drop', label: '雨滴飘落' },
        { value: 'snow-fall', label: '雪花飘落' },
        { value: 'cloud-drift', label: '云朵飘动' },
        { value: 'smoke-rise', label: '烟雾上升' },
      ],
    },
    {
      title: '人物角色 🏃',
      options: [
        { value: 'character-run', label: '跑步冲刺' },
        { value: 'character-walk', label: '行走移动' },
        { value: 'character-jump', label: '跳跃腾空' },
        { value: 'character-dive', label: '潜水下潜' },
        { value: 'character-swim', label: '游泳前进' },
        { value: 'character-climb', label: '攀爬上升' },
        { value: 'character-slide', label: '滑行滑动' },
        { value: 'character-wave', label: '挥手示意' },
        { value: 'character-nod', label: '点头确认' },
        { value: 'character-breathe', label: '待机呼吸' },
      ],
    },
    {
      title: '动物主题',
      options: [
        { value: 'octopus-ink', label: '章鱼喷墨' },
        { value: 'fish-swim', label: '鱼游泳' },
        { value: 'bird-fly', label: '鸟飞翔' },
        { value: 'butterfly', label: '蝴蝶飞舞' },
      ],
    },
    {
      title: '元素效果',
      options: [
        { value: 'fire', label: '火焰燃烧' },
        { value: 'water', label: '水波水花' },
        { value: 'electric', label: '闪电电流' },
      ],
    },
    {
      title: 'AI自定义',
      options: [
        { value: 'ai-custom', label: 'AI智能动画' },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl mb-4">动画设置</h2>
        <div className="text-sm text-gray-600">
          为选中的贴图元素添加动画效果
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Animation Type Selection */}
        <div>
          <label className="block text-sm mb-3 font-medium">动画类型</label>
          {animationGroups.map((group) => (
            <div key={group.title} className="mb-4">
              <div className="text-xs text-gray-500 mb-2">{group.title}</div>
              <div className="space-y-1">
                {group.options.map((option) => (
                  <div key={option.value}>
                    <div className="flex items-center gap-2">
                      <label
                        className={`flex-1 flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                          animationType === option.value
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="animationType"
                          value={option.value}
                          checked={animationType === option.value}
                          onChange={(e) => setAnimationType(e.target.value as Animation['type'])}
                          className="text-indigo-600"
                        />
                        <span className="text-sm flex-1">{option.label}</span>
                      </label>
                      <button
                        onClick={() => toggleExpanded(option.value)}
                        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                          expandedAnimation === option.value ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400'
                        }`}
                        title="调整幅度"
                      >
                        {expandedAnimation === option.value ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <Settings className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {expandedAnimation === option.value && renderParamControls(option.value)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm mb-2 font-medium">
            动画时长 (秒)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.1"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              min="0.5"
              max="10"
              step="0.1"
              value={duration}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val >= 0.5 && val <= 10) {
                  setDuration(val);
                }
              }}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-sm mb-2 font-medium">旋转角度 (度)</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              min="0"
              max="360"
              step="1"
              value={rotation}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 0 && val <= 360) {
                  setRotation(val);
                }
              }}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Preview Info */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Play className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-indigo-900">
              <p className="mb-1 font-medium">动画预览</p>
              <p className="text-xs text-indigo-700">
                点击每个动画旁边的设置按钮 <Settings className="w-3 h-3 inline" /> 可调整幅度参数。点击\"应用动画\"后可在画布上实时预览效果。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200">
        <button
          onClick={handleApply}
          className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          应用动画
        </button>
      </div>
    </div>
  );
}