# 单屏幕自适应布局重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development`
> Steps use checkbox (`- [ ]`) syntax.

**Goal:** 将演示界面重构为单屏幕自适应应用——根据屏幕尺寸自动适配，无网页级滚动条，仅允许侧栏局部滚动。

**Architecture:** 三段式 flex 布局：顶部 header（标题/返回/GitHub，固定高）→ 中部主体（左可视化区 flex:1 + 右侧栏固定 340px，窄屏转纵向）→ 输入栏（固定高）。可视化区尺寸改用 ResizeObserver 测量容器实际 clientWidth/clientHeight 传入 SVG props（取代基于 `window.innerWidth` 的固定计算），两个 SVG 各占容器高度一半。

**Tech Stack:** React 19, TypeScript 5.7, Vite 6, d3 7.9，纯 CSS（无 UI 框架）

**Risks:**
- Task 3 ResizeObserver 首帧测量为 0 → 缓解：dimensions 为 0 时不渲染 SVG，渲染占位提示
- Task 3/4 改动组件渲染结构可能影响 d3 useEffect 依赖 → 缓解：VerticalBars/WaterContainer 内部逻辑与 props 接口完全不动，仅由父组件传入正确尺寸
- 窄屏（<860px）侧栏内容多 → 缓解：侧栏 `overflow:auto` 局部滚动，不触发页面滚动

---

### Task 1: 全局单屏基础样式

**Depends on:** None
**Files:**
- Modify: `src/index.css:25-31`
- Modify: `src/App.css`（整体重写）

- [ ] **Step 1: 修改 index.css — 锁定 html/body/#root 为视口高度并禁止页面滚动**
文件: `src/index.css:25-31`（替换 body 规则块，并在其后新增 html/#root 规则）

```css
/* 替换 src/index.css:25-31 的 body 规则，并追加 html/#root 锁屏规则 */

html, body, #root {
  height: 100%;
  overflow: hidden;
}

body {
  margin: 0;
  min-width: 320px;
  display: flex;
  place-items: center;
}
```

- [ ] **Step 2: 重写 App.css — app-shell 为全屏 flex column，移除 fixed 浮层样式**
文件: `src/App.css`（整体替换）

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.5;
}

/* 单屏根容器：占满视口、纵向 flex、禁止滚动 */
#root {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-shell {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 动画效果 */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fade-in 0.5s ease-in;
}

/* 辅助样式类 */
.text-center {
  text-align: center;
}
```

- [ ] **Step 3: 验证样式无语法错误**
Run: `npx vite build --mode development 2>&1 | head -20`
Expected:
  - Exit code: 0
  - Output does NOT contain: "Error" or "failed"

- [ ] **Step 4: 提交**
Run: `git add src/index.css src/App.css && git commit -m "refactor(layout): 锁定视口高度禁止页面滚动，重写App.css为全屏flex"`

---

### Task 2: App.tsx Header 结构调整

**Depends on:** Task 1
**Files:**
- Modify: `src/App.tsx:1-17`

- [ ] **Step 1: 重写 App.tsx — 将返回链接与 GitHub 图标内联进 header，移除 fixed 浮层**

```typescript
// src/App.tsx（整体替换）
import './App.css';
import AlgorithmAnimation from './components/algorithm/AlgorithmAnimation';
import GitHubIcon from './assets/github.svg';

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <a
          href="https://fuck-algorithm.github.io/leetcode-hot-100/"
          target="_blank"
          rel="noopener noreferrer"
          className="header-link"
        >
          ← 返回LeetCode Hot 100
        </a>
        <h1 className="app-title">盛最多水的容器 - 双指针法动画演示</h1>
        <a
          href="https://github.com/fuck-algorithm/leetcode-11-container-with-most-water"
          target="_blank"
          rel="noopener noreferrer"
          className="header-link"
        >
          <img src={GitHubIcon} alt="GitHub" className="github-icon" />
        </a>
      </header>
      <AlgorithmAnimation />
    </div>
  );
}

export default App;
```

- [ ] **Step 2: 在 App.css 追加 header 样式 — 固定高度、两端对齐**

```css
/* 追加到 src/App.css 末尾 */

.app-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e9ecef;
  min-height: 52px;
}

.app-title {
  flex: 1 1 auto;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-link {
  flex: 0 0 auto;
  color: #2c3e50;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.header-link:hover {
  color: #1a73e8;
  background-color: #f1f3f5;
}

.github-icon {
  width: 24px;
  height: 24px;
  display: block;
}

/* 窄屏：标题隐藏，仅保留链接 */
@media (max-width: 600px) {
  .app-title {
    display: none;
  }
}
```

- [ ] **Step 3: 验证 App 编译**
Run: `npx vite build 2>&1 | tail -5`
Expected:
  - Exit code: 0
  - Output contains: "built in"

- [ ] **Step 4: 提交**
Run: `git add src/App.tsx src/App.css && git commit -m "refactor(layout): 将返回链接与GitHub图标内联进header，移除fixed浮层"`

---

### Task 3: AlgorithmAnimation 单屏布局重构

**Depends on:** Task 2
**Files:**
- Create: `src/components/algorithm/AlgorithmAnimation.css`
- Modify: `src/components/algorithm/AlgorithmAnimation.tsx`（整体重写）

- [ ] **Step 1: 创建 AlgorithmAnimation.css — 三段式 flex 布局，含窄屏纵向退化**

```css
/* src/components/algorithm/AlgorithmAnimation.css */

.algo-layout {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  min-height: 0;
  overflow: hidden;
}

/* 顶部输入栏：固定高度 */
.input-bar {
  flex: 0 0 auto;
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-bar .custom-input {
  flex: 1 1 auto;
  min-width: 0;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.input-bar .input-btn {
  flex: 0 0 auto;
  padding: 8px 16px;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.input-bar .input-btn:hover {
  opacity: 0.85;
}

.input-bar .input-btn.apply {
  background-color: #2ecc71;
}

.input-bar .input-btn.random {
  background-color: #3498db;
  width: 44px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 主体：左可视化 + 右侧栏 */
.algo-main {
  flex: 1 1 auto;
  display: flex;
  gap: 8px;
  min-height: 0;
  overflow: hidden;
}

/* 左可视化区：占满剩余空间 */
.viz-pane {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  min-height: 0;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px;
  overflow: hidden;
}

.viz-svg-wrap {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  overflow: hidden;
}

.viz-svg-wrap > svg {
  width: 100%;
  height: 100%;
  display: block;
}

.viz-placeholder {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

/* 右侧栏：固定宽度，局部可滚动 */
.side-pane {
  flex: 0 0 340px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  overflow: auto;
}

.algo-explanation {
  flex: 0 0 auto;
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  line-height: 1.6;
  font-size: 13px;
}

.algo-explanation h3 {
  margin-bottom: 6px;
  font-size: 14px;
  color: #2c3e50;
}

/* 窄屏：主体转纵向，侧栏在下且限高 */
@media (max-width: 860px) {
  .algo-main {
    flex-direction: column;
  }

  .viz-pane {
    flex: 1 1 auto;
  }

  .side-pane {
    flex: 0 0 auto;
    max-height: 42vh;
    overflow: auto;
  }
}
```

- [ ] **Step 2: 重写 AlgorithmAnimation.tsx — ResizeObserver 测量容器尺寸，flex 布局，dimensions 为 0 时显示占位**

```typescript
// src/components/algorithm/AlgorithmAnimation.tsx（整体替换）
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
    } catch (error) {
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
```

- [ ] **Step 3: 验证组件编译**
Run: `npx vite build 2>&1 | tail -8`
Expected:
  - Exit code: 0
  - Output contains: "built in"
  - Output does NOT contain: "error" or "TS"

- [ ] **Step 4: 提交**
Run: `git add src/components/algorithm/AlgorithmAnimation.tsx src/components/algorithm/AlgorithmAnimation.css && git commit -m "refactor(layout): AlgorithmAnimation改为ResizeObserver测量+flex单屏布局"`

---

### Task 4: ControlPanel 样式重构

**Depends on:** Task 3
**Files:**
- Create: `src/components/algorithm/ControlPanel.css`
- Modify: `src/components/algorithm/ControlPanel.tsx`（整体重写）

- [ ] **Step 1: 创建 ControlPanel.css — 紧凑单屏控制面板样式**

```css
/* src/components/algorithm/ControlPanel.css */

.control-panel {
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  flex: 0 0 auto;
}

.cp-progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cp-progress {
  flex: 1;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.cp-progress-bar {
  height: 100%;
  background-color: #3498db;
  transition: width 0.3s ease;
}

.cp-frame-counter {
  font-size: 13px;
  color: #666;
  min-width: 60px;
  text-align: right;
}

.cp-description {
  padding: 8px 10px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-height: 36px;
  line-height: 1.5;
}

.cp-buttons {
  display: flex;
  gap: 8px;
}

.cp-button {
  flex: 1;
  padding: 8px 10px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.cp-button:hover {
  opacity: 0.85;
}

.cp-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  opacity: 1;
}

.cp-button.random {
  background-color: #e67e22;
}

.cp-speed-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cp-label {
  font-size: 13px;
  color: #666;
}

.cp-slider {
  flex: 1;
}

.cp-speed-display {
  font-size: 13px;
  color: #666;
  min-width: 64px;
  text-align: right;
}
```

- [ ] **Step 2: 重写 ControlPanel.tsx — 用 CSS 类替换内联 styles 对象**

```typescript
// src/components/algorithm/ControlPanel.tsx（整体替换）
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
```

- [ ] **Step 3: 验证 ControlPanel 编译**
Run: `npx vite build 2>&1 | tail -8`
Expected:
  - Exit code: 0
  - Output contains: "built in"

- [ ] **Step 4: 提交**
Run: `git add src/components/algorithm/ControlPanel.tsx src/components/algorithm/ControlPanel.css && git commit -m "refactor(layout): ControlPanel用CSS类替换内联样式以适配单屏布局"`

---

### Task 5: 全量构建验证与部署预检

**Depends on:** Task 4
**Files:**
- Modify: 无（仅验证）

- [ ] **Step 1: TypeScript 类型检查**
Run: `npx tsc -b`
Expected:
  - Exit code: 0
  - Output does NOT contain: "error TS"

- [ ] **Step 2: 生产构建**
Run: `npm run build`
Expected:
  - Exit code: 0
  - Output contains: "built in"
  - Output does NOT contain: "error" or "Error"

- [ ] **Step 3: ESLint 检查**
Run: `npm run lint`
Expected:
  - Exit code: 0
  - Output does NOT contain: "error" (warning 可接受)

- [ ] **Step 4: 启动 dev server 冒烟验证（后台 5 秒）**
Run: `timeout 6 npx vite --port 4173 2>&1 | head -10 || true`
Expected:
  - Output contains: "Local:" 或 "ready in"
  - 无启动报错

- [ ] **Step 5: 提交（如有遗留改动）**
Run: `git status --porcelain`
Expected:
  - 若输出为空，跳过提交
  - 若有改动：`git add -A && git commit -m "chore(layout): 单屏自适应布局重构完成"`
