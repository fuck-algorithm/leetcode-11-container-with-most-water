import React, { useEffect, useMemo, useState } from 'react';
import './AlgorithmAnimation.css';
import VerticalBars from './VerticalBars';
import ControlPanel from './ControlPanel';
import CodePanel from './CodePanel';
import './CodePanel.css';
import { AlgorithmThoughtModal } from '../AlgorithmThoughtModal';
import '../AlgorithmThoughtModal.css';
import { useAlgorithmAnimation } from '../../hooks/useAlgorithmAnimation';
import { generateRandomHeights, validateInput } from '../../utils/algorithmUtils';

const AlgorithmAnimation: React.FC = () => {
  const {
    state,
    togglePlay,
    reset,
    nextStep,
    prevStep,
    getCurrentFrameData,
    setSpeed,
    setHeightArray,
    setAlgorithmType,
    seek,
  } = useAlgorithmAnimation();
  const frame = getCurrentFrameData();
  const [customHeights, setCustomHeights] = useState(state.heightArray.join(', '));
  const [inputError, setInputError] = useState('');
  const heightsKey = useMemo(() => state.heightArray.join(','), [state.heightArray]);

  useEffect(() => setCustomHeights(heightsKey), [heightsKey]);

  const applyHeights = () => {
    const tokens = customHeights.split(',').map((part) => part.trim());
    const heights = tokens.map(Number);
    const validation = validateInput(heights);
    if (!validation.valid || tokens.some((token) => token === '')) {
      setInputError(`${validation.error ?? '输入不能为空'}，例如：1, 8, 6, 2, 5`);
      return;
    }
    if (state.algorithmType === 'bruteForce' && heights.length > 9) {
      setInputError('暴力枚举仅支持最多 9 个高度值，请切换双指针或缩短输入。');
      return;
    }
    setInputError('');
    setHeightArray(heights);
  };

  const randomize = () => {
    const heights = generateRandomHeights();
    setCustomHeights(heights.join(', '));
    setInputError('');
    setHeightArray(heights);
  };

  return (
    <main className="algo-layout">
      <div className="input-bar">
        <label className="input-label" htmlFor="heights-input">高度数组</label>
        <input
          id="heights-input"
          aria-label="高度数组"
          className="custom-input"
          value={customHeights}
          onChange={(event) => setCustomHeights(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') applyHeights(); }}
          placeholder="例如：1, 8, 6, 2, 5, 4, 8, 3, 7"
        />
        <AlgorithmThoughtModal />
        <button className="input-btn" onClick={randomize}>随机生成</button>
        <button className="input-btn apply" onClick={applyHeights}>应用</button>
        {inputError && <span className="input-error" role="alert">{inputError}</span>}
      </div>

      <div className="algorithm-tabs" role="tablist" aria-label="选择算法解法">
        <button type="button" role="tab" aria-selected={state.algorithmType === 'twoPointer'} onClick={() => setAlgorithmType('twoPointer')}>双指针 O(n)</button>
        <button type="button" role="tab" aria-selected={state.algorithmType === 'bruteForce'} onClick={() => setAlgorithmType('bruteForce')}>暴力枚举 O(n²)</button>
        {state.algorithmType === 'bruteForce' && <span className="algorithm-limit">演示数据上限：9 项</span>}
      </div>
      <div className="visual-workspace">
        <section className="canvas-card" aria-label={`${state.algorithmType === 'bruteForce' ? '暴力枚举' : '双指针'}算法画布`}>
          <header className="canvas-header">
            <div className="canvas-heading">
              <span className="eyebrow">{state.algorithmType === 'bruteForce' ? 'BRUTE FORCE · O(n²)' : 'TWO POINTERS · O(n)'}</span>
              <h2>{state.algorithmType === 'bruteForce' ? '逐对枚举每一种左右边界组合' : '盛水面积如何被一步步缩小搜索范围'}</h2>
            </div>
            <div className="step-indicator"><span>STEP</span><strong>{state.currentFrame + 1}</strong><i>/</i>{state.totalFrames}</div>
          </header>
          <div className="canvas-stage">
            <div className="intuition-strip" aria-live="polite">
              <span className="intuition-step">{frame?.operation === 'move' ? '为什么移动？' : frame?.operation === 'compare' ? '这一步怎么算？' : '读图提示'}</span>
              <p>{frame?.decision ?? '容器面积 = 较短边高度 × 两边索引差；先从最宽的两端开始。'}</p>
            </div>
            <VerticalBars
              key={heightsKey}
              heights={state.heightArray}
              leftPointer={frame?.leftPointer ?? 0}
              rightPointer={frame?.rightPointer ?? state.heightArray.length - 1}
              candidateLeftPointer={frame?.candidateLeftPointer}
              candidateRightPointer={frame?.candidateRightPointer}
              bestLeftPointer={frame?.bestLeftPointer}
              bestRightPointer={frame?.bestRightPointer}
              currentArea={frame?.currentArea ?? 0}
              limitingHeight={frame?.limitingHeight}
              currentWidth={frame?.currentWidth}
              eliminatedRange={frame?.eliminatedRange}
              maxArea={frame?.maxArea ?? 0}
              dwellMs={state.animationSpeed}
              isDone={frame?.operation === 'done'}
              showCandidate={frame?.operation === 'compare' || frame?.operation === 'move'}
            />
            <div className="canvas-legend" aria-label="画布图例" data-testid="canvas-legend">
              <span><i className="legend-swatch left" />当前焦点</span>
              <span><i className="legend-swatch right" />比较对象</span>
              <span><i className="legend-swatch water" />当前容器</span>
              <span><i className="legend-swatch best" />当前最优解</span>
            </div>
          </div>
          <footer className="canvas-caption" aria-live="polite">
            <span className="operation-badge" data-operation={frame?.operation ?? 'init'}>{frame?.operationLabel ?? '初始化'}</span>
            <p className="step-narration">{frame?.narration ?? '左右指针从数组两端开始，准备寻找最大容积。'}</p>
            <div className="canvas-metrics">
              <span>当前面积 <b>{frame?.currentArea ?? 0}</b></span>
              <span>最大面积 <b>{frame?.maxArea ?? 0}</b></span>
              <span>搜索宽度 <b>{Math.max(0, (frame?.rightPointer ?? state.heightArray.length - 1) - (frame?.leftPointer ?? 0))}</b></span>
            </div>
          </footer>
        </section>

        <CodePanel activeAnchor={frame?.codeAnchor ?? 'init'} variables={frame?.variables ?? { i: 0, j: state.heightArray.length - 1, res: 0 }} algorithmType={state.algorithmType} />
      </div>

      <ControlPanel
        key={state.algorithmType}
        isPlaying={state.isPlaying}
        togglePlay={togglePlay}
        reset={reset}
        nextStep={nextStep}
        prevStep={prevStep}
        currentFrame={state.currentFrame}
        totalFrames={state.totalFrames}
        animationSpeed={state.animationSpeed}
        setSpeed={setSpeed}
        seek={seek}
      />
    </main>
  );
};

export default AlgorithmAnimation;
