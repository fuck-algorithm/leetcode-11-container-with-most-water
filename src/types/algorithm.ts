// 动画帧快照数据类型
export interface FrameSnapshot {
  // 左指针位置
  leftPointer: number;
  // 右指针位置
  rightPointer: number;
  // 当前计算的最大面积
  maxArea: number;
  // 当前计算的面积
  currentArea: number;
  // 是否为关键帧（如找到更大面积的时刻）
  isKeyFrame: boolean;
  // 当前操作说明
  description: string;
}

// 算法状态类型
export interface AlgorithmState {
  // 动画播放状态
  isPlaying: boolean;
  // 当前帧索引
  currentFrame: number;
  // 总帧数
  totalFrames: number;
  // 算法类型
  algorithmType: 'bruteForce' | 'twoPointer';
  // 动画数据快照（每帧的关键数据）
  frameSnapshots: FrameSnapshot[];
  // 当前选中的高度数组
  heightArray: number[];
  // 动画播放速度（毫秒/帧）
  animationSpeed: number;
}

// 垂直线数据类型
export interface BarData {
  height: number;
  index: number;
  color: string;
  isHighlighted: boolean;
}

// 水容器数据类型
export interface ContainerData {
  leftIndex: number;
  rightIndex: number;
  height: number;
  area: number;
  isMaxArea: boolean;
} 