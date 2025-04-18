import React, { useState, useEffect } from 'react';
import VerticalBars from './VerticalBars';
import WaterContainer from './WaterContainer';
import ControlPanel from './ControlPanel';
import { useAlgorithmAnimation } from '../../hooks/useAlgorithmAnimation';
import { generateRandomHeights } from '../../utils/algorithmUtils';

const AlgorithmAnimation: React.FC = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth > 1200 ? 1200 : window.innerWidth - 40,
    height: window.innerHeight > 800 ? 500 : window.innerHeight * 0.5
  });

  const { 
    state, 
    togglePlay, 
    reset, 
    nextStep, 
    prevStep, 
    getCurrentFrameData,
    setSpeed,
    setHeightArray 
  } = useAlgorithmAnimation();
  
  const currentFrame = getCurrentFrameData();
  
  // 响应式处理
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth > 1200 ? 1200 : window.innerWidth - 40,
        height: window.innerHeight > 800 ? 500 : window.innerHeight * 0.5
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 自定义高度输入处理
  const [customHeights, setCustomHeights] = useState('');
  
  const handleCustomHeights = () => {
    try {
      // 解析输入字符串为数组
      const heights = customHeights
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '')
        .map(item => parseInt(item, 10));
      
      // 验证数值有效性
      if (heights.length < 2) {
        alert('至少需要两个高度值');
        return;
      }
      
      if (heights.some(isNaN)) {
        alert('所有值必须为数字');
        return;
      }
      
      if (heights.some(h => h < 0)) {
        alert('高度值不能为负数');
        return;
      }
      
      // 更新高度数组
      setHeightArray(heights);
    } catch (error) {
      alert('解析高度数组失败，请检查格式');
    }
  };

  // 随机生成高度数组
  const handleRandomHeights = () => {
    const randomHeights = generateRandomHeights();
    setHeightArray(randomHeights);
    // 更新输入框显示
    setCustomHeights(randomHeights.join(', '));
  };
  
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>盛最多水的容器 - 双指针法动画演示</h1>
      
      <div style={styles.customInputContainer}>
        <input
          type="text"
          value={customHeights}
          onChange={(e) => setCustomHeights(e.target.value)}
          placeholder="输入高度数组，如: 1,8,6,2,5,4,8,3,7"
          style={styles.customInput}
        />
        <button 
          onClick={handleRandomHeights}
          title="生成随机数据"
          style={{
            ...styles.customButton,
            backgroundColor: '#3498db',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '50px'
          }}
        >
          🎲
        </button>
        <button 
          onClick={handleCustomHeights}
          style={styles.customButton}
        >
          应用
        </button>
      </div>
      
      <div style={styles.visualizationContainer}>
        <div style={styles.canvasContainer}>
          <VerticalBars
            heights={state.heightArray}
            leftPointer={currentFrame?.leftPointer ?? 0}
            rightPointer={currentFrame?.rightPointer ?? state.heightArray.length - 1}
            containerWidth={dimensions.width}
            containerHeight={dimensions.height / 2 - 20}
          />
          <WaterContainer
            heights={state.heightArray}
            leftPointer={currentFrame?.leftPointer ?? 0}
            rightPointer={currentFrame?.rightPointer ?? state.heightArray.length - 1}
            containerWidth={dimensions.width}
            containerHeight={dimensions.height / 2 - 20}
            currentArea={currentFrame?.currentArea ?? 0}
            maxArea={currentFrame?.maxArea ?? 0}
          />
        </div>
        
        <div style={styles.controlContainer}>
          <ControlPanel
            isPlaying={state.isPlaying}
            togglePlay={togglePlay}
            reset={reset}
            nextStep={nextStep}
            prevStep={prevStep}
            currentFrame={state.currentFrame}
            totalFrames={state.totalFrames}
            animationSpeed={state.animationSpeed}
            setSpeed={setSpeed}
            description={currentFrame?.description ?? '准备开始算法动画'}
          />
        </div>
      </div>
      
      <div style={styles.algorithmExplanation}>
        <h3>算法原理:</h3>
        <p>
          双指针法从数组两端开始，每次移动指向较短高度的指针。
          这是因为如果移动较高的指针，由于容器的高度取决于较短的高度，新容器的高度最多不变，
          而宽度一定减小，所以面积一定减小。只有移动较短高度指针，才可能找到更大的容器。
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    textAlign: 'center' as const,
    marginBottom: '20px',
    color: '#2c3e50'
  },
  customInputContainer: {
    display: 'flex',
    marginBottom: '20px',
    gap: '10px'
  },
  customInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd'
  },
  customButton: {
    padding: '8px 16px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  visualizationContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    marginBottom: '30px'
  },
  canvasContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '10px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
  },
  controlContainer: {
    width: '100%'
  },
  algorithmExplanation: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '8px',
    lineHeight: 1.6
  }
};

export default AlgorithmAnimation; 