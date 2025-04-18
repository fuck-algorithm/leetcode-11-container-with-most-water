import React from 'react';

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
  description
}) => {
  return (
    <div className="control-panel" style={styles.container}>
      <div style={styles.progressContainer}>
        <div style={styles.progress}>
          <div 
            style={{
              ...styles.progressBar,
              width: `${(currentFrame / (totalFrames - 1)) * 100}%`
            }}
          />
        </div>
        <div style={styles.frameCounter}>
          {currentFrame + 1} / {totalFrames}
        </div>
      </div>
      
      <div style={styles.description}>
        {description}
      </div>
      
      <div style={styles.controlButtons}>
        <button 
          style={styles.button} 
          onClick={prevStep}
          disabled={currentFrame === 0}
        >
          上一步
        </button>
        
        <button 
          style={styles.button} 
          onClick={togglePlay}
        >
          {isPlaying ? '暂停' : '播放'}
        </button>
        
        <button 
          style={styles.button} 
          onClick={nextStep}
          disabled={currentFrame === totalFrames - 1}
        >
          下一步
        </button>
        
        <button 
          style={styles.button} 
          onClick={reset}
        >
          重置
        </button>
      </div>
      
      <div style={styles.speedControl}>
        <label htmlFor="speed-slider" style={styles.label}>
          速度:
        </label>
        <input
          id="speed-slider"
          type="range"
          min="100"
          max="2000"
          step="100"
          value={animationSpeed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          style={styles.slider}
        />
        <span style={styles.speedDisplay}>
          {(animationSpeed / 1000).toFixed(1)}秒/步
        </span>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
    width: '100%'
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  progress: {
    flex: 1,
    height: '10px',
    backgroundColor: '#e0e0e0',
    borderRadius: '5px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3498db',
    transition: 'width 0.3s ease'
  },
  frameCounter: {
    fontSize: '14px',
    color: '#666',
    minWidth: '60px',
    textAlign: 'right' as const
  },
  description: {
    padding: '10px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '15px',
    minHeight: '40px'
  },
  controlButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px'
  },
  button: {
    flex: 1,
    padding: '8px 12px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#2980b9'
    },
    ':disabled': {
      backgroundColor: '#bdc3c7',
      cursor: 'not-allowed'
    }
  },
  speedControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  label: {
    fontSize: '14px',
    color: '#666'
  },
  slider: {
    flex: 1
  },
  speedDisplay: {
    fontSize: '14px',
    color: '#666',
    minWidth: '70px'
  }
};

export default ControlPanel; 