import { FrameSnapshot } from '../types/algorithm';

export function validateInput(heights: number[]): { valid: boolean; error?: string } {
  if (heights.length < 2) return { valid: false, error: '至少需要两个高度值' };
  if (heights.some((height) => !Number.isInteger(height) || height < 0)) return { valid: false, error: '高度必须为非负整数' };
  return { valid: true };
}

// 双指针法生成所有帧
export function generateTwoPointerFrames(heights: number[]): FrameSnapshot[] {
  const frames: FrameSnapshot[] = [];
  let leftPointer = 0;
  let rightPointer = heights.length - 1;
  let maxArea = 0;
  let bestLeftPointer = 0;
  let bestRightPointer = Math.max(0, heights.length - 1);
  
  // 初始帧
  frames.push({
    leftPointer,
    rightPointer,
    maxArea: 0,
    currentArea: 0,
    isKeyFrame: true,
    description: '初始化左右指针分别指向数组两端',
    operation: 'init',
    operationLabel: '初始化',
    narration: '先保留数组两端作为最大宽度候选，后续每一步只缩小较短边一侧。',
    codeAnchor: 'init',
    variables: { i: leftPointer, j: rightPointer, res: maxArea },
  });
  
  while (leftPointer < rightPointer) {
    // 计算当前面积
    const height = Math.min(heights[leftPointer], heights[rightPointer]);
    const width = rightPointer - leftPointer;
    const area = height * width;
    
    // 判断是否更新最大面积
    const previousMax = maxArea;
    const isNewMax = area > previousMax;

    // 添加计算面积帧
    frames.push({
      leftPointer,
      rightPointer,
      maxArea: previousMax,
      currentArea: area,
      isKeyFrame: false,
      description: `比较两端高度 ${heights[leftPointer]} 与 ${heights[rightPointer]}，候选面积为 ${area}。`,
      operation: 'compare',
      operationLabel: '比较面积',
      narration: `比较高度 ${heights[leftPointer]} 与 ${heights[rightPointer]}，较短边 ${height} 限定水位，候选面积为 ${area}。`,
      bestLeftPointer,
      bestRightPointer,
      codeAnchor: 'compare-area',
      variables: { i: leftPointer, j: rightPointer, res: previousMax, area },
      candidateLeftPointer: leftPointer,
      candidateRightPointer: rightPointer,
    });
    if (isNewMax) {
      maxArea = area;
      bestLeftPointer = leftPointer;
      bestRightPointer = rightPointer;
      frames.push({
        leftPointer, rightPointer, maxArea: previousMax, currentArea: area, isKeyFrame: true,
        description: `面积 ${area} 超过此前记录，更新最大面积。`,
        operation: 'update', operationLabel: '更新最大值',
        narration: `候选面积 ${area} 大于旧纪录，因此将最优容器更新为索引 ${leftPointer} 到 ${rightPointer}。`,
        bestLeftPointer: leftPointer, bestRightPointer: rightPointer, codeAnchor: 'update',
        variables: { i: leftPointer, j: rightPointer, res: area },
      });
    }

    // 根据高度决定移动哪个指针
    if (heights[leftPointer] < heights[rightPointer]) {
      leftPointer++;
      frames.push({
        leftPointer,
        rightPointer,
        maxArea,
        currentArea: area,
        isKeyFrame: false,
        description: `左端高度 ${heights[leftPointer - 1]} 较短，移动左指针以寻找更高边。`,
        operation: 'move',
        operationLabel: '移动左指针',
        narration: `左边高度 ${heights[leftPointer - 1]} 更短，面积受它限制；固定它只会让宽度继续变小，因此只移动左指针。`,
        candidateLeftPointer: leftPointer - 1,
        candidateRightPointer: rightPointer,
        bestLeftPointer,
        bestRightPointer,
        codeAnchor: 'move-left',
        variables: { i: leftPointer, j: rightPointer, res: maxArea, area },
      });
    } else {
      rightPointer--;
      frames.push({
        leftPointer,
        rightPointer,
        maxArea,
        currentArea: area,
        isKeyFrame: false,
        description: `右端高度 ${heights[rightPointer + 1]} 不高于左端，移动右指针以寻找更高边。`,
        operation: 'move',
        operationLabel: '移动右指针',
        narration: `右边高度 ${heights[rightPointer + 1]} 较短或相等，固定它不可能得到更大面积，因此左移右指针。`,
        candidateLeftPointer: leftPointer,
        candidateRightPointer: rightPointer + 1,
        bestLeftPointer,
        bestRightPointer,
        codeAnchor: 'move-right',
        variables: { i: leftPointer, j: rightPointer, res: maxArea, area },
      });
    }
  }
  
  // 结束帧
  frames.push({
    leftPointer,
    rightPointer,
    maxArea,
    currentArea: 0,
    isKeyFrame: true,
    description: `搜索区间收敛，最大面积为 ${maxArea}。`,
    operation: 'done',
    operationLabel: '搜索完成',
    narration: `左右指针已经相遇，没有可继续检查的宽度；所有可能的更优容器均已排除，答案为 ${maxArea}。`,
    bestLeftPointer,
    bestRightPointer,
    codeAnchor: 'return',
    variables: { i: leftPointer, j: rightPointer, res: maxArea },
  });

  return frames;
}

// 计算示例数据的所有帧
export function getExampleFrames(): FrameSnapshot[] {
  const exampleHeights = [1, 8, 6, 2, 5, 4, 8, 3, 7];
  return generateTwoPointerFrames(exampleHeights);
}

// 获取默认高度数组
export function getDefaultHeights(): number[] {
  return [1, 8, 6, 2, 5, 4, 8, 3, 7];
}

// 生成随机高度数组
export function generateRandomHeights(minLength = 5, maxLength = 15): number[] {
  // 随机确定数组长度
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  
  // 生成随机高度数组
  const heights: number[] = [];
  for (let i = 0; i < length; i++) {
    // 高度范围1-15
    heights.push(Math.floor(Math.random() * 15) + 1);
  }
  
  return heights;
} 