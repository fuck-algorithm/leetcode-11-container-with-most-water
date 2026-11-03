import { useEffect, useState } from 'react';
import './AlgorithmThoughtModal.css';

export function ProblemDescriptionModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);
  return (
    <>
      <button type="button" className="header-dialog-trigger" aria-haspopup="dialog" onClick={() => setOpen(true)}>题目描述</button>
      {open && (
        <div className="thought-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section className="thought-modal problem-modal" role="dialog" aria-modal="true" aria-labelledby="problem-title">
            <header><h2 id="problem-title">题目描述：盛最多水的容器</h2><button type="button" aria-label="关闭题目描述" onClick={() => setOpen(false)}>×</button></header>
            <div className="problem-content">
              <p>给定 n 条垂线，第 i 条线的高度为 height[i]。任选两条线与 x 轴组成容器，返回容器最多可以装多少水。</p>
              <div className="problem-formula"><b>容积公式</b><span>面积 = min(height[i], height[j]) × (j − i)</span><small>水位由较短的边限制，宽度是两条线之间的距离。</small></div>
              <h3>示例</h3>
              <pre>输入：height = [1,8,6,2,5,4,8,3,7]{'\n'}输出：49{'\n'}解释：索引 1 和 8 的较短边高 7，宽度为 7，面积 = 7 × 7 = 49。</pre>
              <h3>约束</h3>
              <ul><li>2 ≤ n ≤ 10⁵</li><li>0 ≤ height[i] ≤ 10⁴</li></ul>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
