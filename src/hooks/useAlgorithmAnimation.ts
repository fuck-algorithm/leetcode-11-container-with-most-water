import { useState, useEffect, useRef } from 'react';
import { AlgorithmState, FrameSnapshot } from '../types/algorithm';
import { generateTwoPointerFrames, getDefaultHeights } from '../utils/algorithmUtils';

export function useAlgorithmAnimation() {
  const [state, setState] = useState<AlgorithmState>({
    isPlaying: false,
    currentFrame: 0,
    totalFrames: 0,
    algorithmType: 'twoPointer',
    frameSnapshots: [],
    heightArray: getDefaultHeights(),
    animationSpeed: 800
  });
  
  const timerRef = useRef<number | null>(null);
  
  // 初始化帧数据
  useEffect(() => {
    const frames = generateTwoPointerFrames(state.heightArray);
    setState(prev => ({
      ...prev,
      frameSnapshots: frames,
      totalFrames: frames.length,
      currentFrame: 0
    }));
  }, [state.heightArray, state.algorithmType]);
  
  // 动画播放控制
  useEffect(() => {
    if (state.isPlaying) {
      // 清除现有定时器
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      
      // 如果未到最后一帧，继续播放
      if (state.currentFrame < state.totalFrames - 1) {
        timerRef.current = window.setTimeout(() => {
          setState(prev => ({
            ...prev,
            currentFrame: prev.currentFrame + 1
          }));
        }, state.animationSpeed);
      } else {
        // 到达最后一帧，停止播放
        setState(prev => ({
          ...prev,
          isPlaying: false
        }));
      }
    }
    
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [state.isPlaying, state.currentFrame, state.totalFrames, state.animationSpeed]);
  
  // 播放/暂停
  const togglePlay = () => {
    setState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };
  
  // 重置
  const reset = () => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentFrame: 0
    }));
  };
  
  // 下一步
  const nextStep = () => {
    if (state.currentFrame < state.totalFrames - 1) {
      setState(prev => ({
        ...prev,
        currentFrame: prev.currentFrame + 1,
        isPlaying: false
      }));
    }
  };
  
  // 上一步
  const prevStep = () => {
    if (state.currentFrame > 0) {
      setState(prev => ({
        ...prev,
        currentFrame: prev.currentFrame - 1,
        isPlaying: false
      }));
    }
  };
  
  // 获取当前帧数据
  const getCurrentFrameData = (): FrameSnapshot | null => {
    if (!state.frameSnapshots.length) return null;
    return state.frameSnapshots[state.currentFrame];
  };
  
  // 更改播放速度
  const setSpeed = (speed: number) => {
    setState(prev => ({
      ...prev,
      animationSpeed: speed
    }));
  };
  
  // 更改高度数组
  const setHeightArray = (heights: number[]) => {
    setState(prev => ({
      ...prev,
      heightArray: heights,
      isPlaying: false,
      currentFrame: 0
    }));
  };

  return {
    state,
    togglePlay,
    reset,
    nextStep,
    prevStep,
    getCurrentFrameData,
    setSpeed,
    setHeightArray
  };
} 