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
  seek: (frame: number) => void;
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
  seek,
}) => (
  <footer className="control-panel playback-footer" aria-label="动画控制">
    <div className="cp-buttons">
      <button className="cp-button secondary" onClick={prevStep} disabled={currentFrame === 0} aria-label="上一步">←</button>
      <button className="cp-button play-button" onClick={togglePlay} aria-label={isPlaying ? '暂停' : '播放'}>{isPlaying ? '暂停' : '播放'}</button>
      <button className="cp-button secondary" onClick={nextStep} disabled={currentFrame >= totalFrames - 1} aria-label="下一步">→</button>
      <button className="cp-button secondary reset-button" onClick={reset}>重置</button>
    </div>
    <input
      className="cp-progress"
      type="range"
      min={0}
      max={Math.max(0, totalFrames - 1)}
      value={Math.min(currentFrame, Math.max(0, totalFrames - 1))}
      onChange={(event) => seek(Number(event.target.value))}
      aria-label="动画进度"
      style={{ '--progress': `${totalFrames > 1 ? currentFrame / (totalFrames - 1) * 100 : 0}%` } as React.CSSProperties}
    />
    <span className="cp-frame-counter">{currentFrame + 1} <i>/</i> {totalFrames}</span>
    <label className="cp-speed-row">
      <span>速度</span>
      <select value={animationSpeed} onChange={(event) => setSpeed(Number(event.target.value))} aria-label="播放速度">
        <option value={1200}>0.75×</option><option value={800}>1×</option><option value={400}>2×</option><option value={200}>4×</option>
      </select>
    </label>
  </footer>
);

export default ControlPanel;
