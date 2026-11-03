import { useState } from 'react';

export function AlgorithmThoughtModal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="input-btn" onClick={() => setOpen(true)}>算法思路</button>
      {open && (
        <div className="thought-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section className="thought-modal" role="dialog" aria-modal="true" aria-labelledby="thought-title">
            <header><h2 id="thought-title">为什么移动较短边？</h2><button type="button" aria-label="关闭算法思路" onClick={() => setOpen(false)}>×</button></header>
            <p>容器面积 = 较短边高度 × 两边距离。每次移动都会让宽度变小；如果固定较短边，另一边即使更高，水位仍受短边限制，面积只会更小。</p>
            <p>因此只移动较短边，才有机会遇到更高的边并弥补宽度损失。每一步排除的容器都不可能超过当前候选，最终最大值不会丢失。</p>
          </section>
        </div>
      )}
    </>
  );
}
