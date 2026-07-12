import React from 'react';
import './ControlPanel.css';

interface ControlPanelProps {
  isPlaying: boolean;
  togglePlay: () => void;
  reset: () => void;
  nextStep: () => void;
  prevStep: () => void;
  currentFrame: number;
  totalFrames: number;
  animationSpeed: number;
  setSpeed: (speed: number) => void;
  description: string;
  onRandomize?: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  togglePlay,
  reset,
  nextStep,
  prevStep,
  currentFrame,
  totalFrames,
  animationSpeed,
  setSpeed,
  description,
  onRandomize,
}) => {
  const progress =
    totalFrames > 1 ? (currentFrame / (totalFrames - 1)) * 100 : 0;

  return (
    <div className="control-panel">
      <div className="cp-progress-row">
        <div className="cp-progress">
          <div
            className="cp-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="cp-frame-counter">
          {currentFrame + 1} / {totalFrames}
        </div>
      </div>

      <div className="cp-description">{description}</div>

      <div className="cp-buttons">
        <button
          className="cp-button"
          onClick={prevStep}
          disabled={currentFrame === 0}
        >
          上一步
        </button>
        <button className="cp-button" onClick={togglePlay}>
          {isPlaying ? '暂停' : '播放'}
        </button>
        <button
          className="cp-button"
          onClick={nextStep}
          disabled={currentFrame === totalFrames - 1}
        >
          下一步
        </button>
        <button className="cp-button" onClick={reset}>
          重置
        </button>
        {onRandomize && (
          <button
            className="cp-button random"
            onClick={onRandomize}
            title="生成随机数据"
          >
            随机
          </button>
        )}
      </div>

      <div className="cp-speed-row">
        <label htmlFor="speed-slider" className="cp-label">
          速度:
        </label>
        <input
          id="speed-slider"
          className="cp-slider"
          type="range"
          min="100"
          max="2000"
          step="100"
          value={animationSpeed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
        <span className="cp-speed-display">
          {(animationSpeed / 1000).toFixed(1)}秒/步
        </span>
      </div>
    </div>
  );
};

export default ControlPanel;
