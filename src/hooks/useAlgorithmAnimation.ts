import { useState, useEffect, useRef } from 'react';
import { AlgorithmState, FrameSnapshot } from '../types/algorithm';
import { MOTION, motionDuration, playbackFrameDelay } from '../features/animation/motion';
import { generateBruteForceFrames, generateTwoPointerFrames, getDefaultHeights } from '../utils/algorithmUtils';

export function useAlgorithmAnimation() {
  const [state, setState] = useState<AlgorithmState>({
    isPlaying: false,
    currentFrame: 0,
    totalFrames: 0,
    algorithmType: 'twoPointer',
    frameSnapshots: [],
    heightArray: getDefaultHeights(),
    animationSpeed: Number(localStorage.getItem('animationSpeed')) || 800
  });
  
  const timerRef = useRef<number | null>(null);
  
  // 初始化帧数据
  useEffect(() => {
    const frames = state.algorithmType === 'bruteForce'
      ? generateBruteForceFrames(state.heightArray)
      : generateTwoPointerFrames(state.heightArray);
    setState(prev => ({
      ...prev,
      frameSnapshots: frames,
      totalFrames: frames.length,
      currentFrame: 0
    }));
  }, [state.heightArray, state.algorithmType]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName)) return;
      if (event.code === 'Space') { event.preventDefault(); togglePlay(); }
      else if (event.key === 'ArrowRight') nextStep();
      else if (event.key === 'ArrowLeft') prevStep();
      else if (event.key.toLowerCase() === 'r') reset();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // 动画播放控制
  useEffect(() => {
    if (state.isPlaying) {
      // 清除现有定时器
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      
      // 如果未到最后一帧，继续播放
      if (state.currentFrame < state.totalFrames - 1) {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const transitionMs = motionDuration(MOTION.state, state.animationSpeed, reducedMotion);
        timerRef.current = window.setTimeout(() => {
          setState(prev => ({
            ...prev,
            currentFrame: prev.currentFrame + 1
          }));
        }, playbackFrameDelay(state.animationSpeed, transitionMs, reducedMotion));
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
  
  // 跳转到指定快照
  const seek = (frame: number) => {
    setState(prev => ({
      ...prev,
      currentFrame: Math.max(0, Math.min(frame, prev.totalFrames - 1)),
      isPlaying: false
    }));
  };

  // 更改播放速度
  const setSpeed = (speed: number) => {
    localStorage.setItem('animationSpeed', String(speed));
    setState(prev => ({
      ...prev,
      animationSpeed: speed
    }));
  };
  
  const setAlgorithmType = (algorithmType: AlgorithmState['algorithmType']) => {
    setState((prev) => ({ ...prev, algorithmType, currentFrame: 0, isPlaying: false }));
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
    seek,
    setSpeed,
    setHeightArray,
    setAlgorithmType
  };
} 