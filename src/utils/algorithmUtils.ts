import { FrameSnapshot } from '../types/algorithm';

// 双指针法生成所有帧
export function generateTwoPointerFrames(heights: number[]): FrameSnapshot[] {
  const frames: FrameSnapshot[] = [];
  let leftPointer = 0;
  let rightPointer = heights.length - 1;
  let maxArea = 0;
  
  // 初始帧
  frames.push({
    leftPointer,
    rightPointer,
    maxArea: 0,
    currentArea: 0,
    isKeyFrame: true,
    description: "初始化左右指针分别指向数组两端"
  });
  
  while (leftPointer < rightPointer) {
    // 计算当前面积
    const height = Math.min(heights[leftPointer], heights[rightPointer]);
    const width = rightPointer - leftPointer;
    const area = height * width;
    
    // 判断是否更新最大面积
    const isNewMax = area > maxArea;
    if (isNewMax) {
      maxArea = area;
    }
    
    // 添加计算面积帧
    frames.push({
      leftPointer,
      rightPointer,
      maxArea,
      currentArea: area,
      isKeyFrame: isNewMax,
      description: isNewMax 
        ? `计算面积: ${area} > 当前最大面积，更新最大面积` 
        : `计算面积: ${area}`
    });
    
    // 根据高度决定移动哪个指针
    if (heights[leftPointer] < heights[rightPointer]) {
      leftPointer++;
      frames.push({
        leftPointer,
        rightPointer,
        maxArea,
        currentArea: area,
        isKeyFrame: false,
        description: "左指针高度小于右指针高度，向右移动左指针"
      });
    } else {
      rightPointer--;
      frames.push({
        leftPointer,
        rightPointer,
        maxArea,
        currentArea: area,
        isKeyFrame: false,
        description: "右指针高度小于或等于左指针高度，向左移动右指针"
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
    description: `算法结束，最大面积为 ${maxArea}`
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