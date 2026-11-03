import { useEffect, useState } from 'react';

export function AlgorithmThoughtModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);
  return (
    <>
      <button type="button" className="header-dialog-trigger" aria-haspopup="dialog" onClick={() => setOpen(true)}>算法思路</button>
      {open && (
        <div className="thought-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section className="thought-modal" role="dialog" aria-modal="true" aria-labelledby="thought-title">
            <header><h2 id="thought-title">算法思路：双指针为什么正确？</h2><button type="button" aria-label="关闭算法思路" onClick={() => setOpen(false)}>×</button></header>
            <div className="thought-content">
              <p>面积由两件事共同决定：<b>水位 × 宽度</b>。水位只能到较短的那条边；宽度是两根线之间的索引差。</p>
              <div className="proof-card"><b>为什么移动短边</b><span>固定短边，另一边无论多高，水位都不会超过短边；指针向内后宽度还会变小，所以面积不可能超过刚才这次。</span></div>
              <div className="proof-card"><b>为什么不漏掉答案</b><span>被排除的短边无法与区间内任何边组成更大容器。于是只需保留未排除区间，逐步收敛后，历史最大面积就是答案。</span></div>
              <p className="thought-example">本例第一步：min(1, 7) × 8 = 8。高度 1 是短板，所以排除索引 0；其他边界仍留在搜索区间。</p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
