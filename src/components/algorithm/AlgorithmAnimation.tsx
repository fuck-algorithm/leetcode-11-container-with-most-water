import React, { useState, useEffect, useRef } from 'react';
import './AlgorithmAnimation.css';
import VerticalBars from './VerticalBars';
import WaterContainer from './WaterContainer';
import ControlPanel from './ControlPanel';
import { useAlgorithmAnimation } from '../../hooks/useAlgorithmAnimation';
import { generateRandomHeights } from '../../utils/algorithmUtils';

const AlgorithmAnimation: React.FC = () => {
  const vizRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const {
    state,
    togglePlay,
    reset,
    nextStep,
    prevStep,
    getCurrentFrameData,
    setSpeed,
    setHeightArray,
  } = useAlgorithmAnimation();

  const currentFrame = getCurrentFrameData();

  // ResizeObserver 测量可视化容器实际尺寸
  useEffect(() => {
    const el = vizRef.current;
    if (!el) return;

    const update = () => {
      setDimensions({
        width: el.clientWidth,
        height: el.clientHeight,
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 两个 SVG 各占容器高度一半（减去 8px 间隙）
  const svgHeight = Math.max(0, Math.floor((dimensions.height - 8) / 2));
  const svgWidth = dimensions.width;

  const [customHeights, setCustomHeights] = useState('');

  const handleCustomHeights = () => {
    try {
      const heights = customHeights
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item !== '')
        .map((item) => parseInt(item, 10));

      if (heights.length < 2) {
        alert('至少需要两个高度值');
        return;
      }
      if (heights.some(isNaN)) {
        alert('所有值必须为数字');
        return;
      }
      if (heights.some((h) => h < 0)) {
        alert('高度值不能为负数');
        return;
      }
      setHeightArray(heights);
    } catch {
      alert('解析高度数组失败，请检查格式');
    }
  };

  const handleRandomHeights = () => {
    const randomHeights = generateRandomHeights();
    setHeightArray(randomHeights);
    setCustomHeights(randomHeights.join(', '));
  };

  const ready = svgWidth > 0 && svgHeight > 0;

  return (
    <div className="algo-layout">
      <div className="input-bar">
        <input
          type="text"
          className="custom-input"
          value={customHeights}
          onChange={(e) => setCustomHeights(e.target.value)}
          placeholder="输入高度数组，如: 1,8,6,2,5,4,8,3,7"
        />
        <button
          className="input-btn random"
          onClick={handleRandomHeights}
          title="生成随机数据"
        >
          🎲
        </button>
        <button className="input-btn apply" onClick={handleCustomHeights}>
          应用
        </button>
      </div>

      <div className="algo-main">
        <div className="viz-pane">
          <div className="viz-svg-wrap" ref={vizRef}>
            {ready ? (
              <VerticalBars
                heights={state.heightArray}
                leftPointer={currentFrame?.leftPointer ?? 0}
                rightPointer={
                  currentFrame?.rightPointer ?? state.heightArray.length - 1
                }
                containerWidth={svgWidth}
                containerHeight={svgHeight}
              />
            ) : (
              <div className="viz-placeholder">正在初始化画布…</div>
            )}
          </div>
          <div className="viz-svg-wrap">
            {ready ? (
              <WaterContainer
                heights={state.heightArray}
                leftPointer={currentFrame?.leftPointer ?? 0}
                rightPointer={
                  currentFrame?.rightPointer ?? state.heightArray.length - 1
                }
                containerWidth={svgWidth}
                containerHeight={svgHeight}
                currentArea={currentFrame?.currentArea ?? 0}
                maxArea={currentFrame?.maxArea ?? 0}
              />
            ) : (
              <div className="viz-placeholder">正在初始化画布…</div>
            )}
          </div>
        </div>

        <aside className="side-pane">
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
            onRandomize={handleRandomHeights}
          />
          <div className="algo-explanation">
            <h3>算法原理</h3>
            <p>
              双指针法从数组两端开始，每次移动指向较短高度的指针。
              因为若移动较高的指针，容器高度取决于较短边，新容器高度最多不变而宽度必减，面积必减。
              只有移动较短指针才可能找到更大容器。
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AlgorithmAnimation;
