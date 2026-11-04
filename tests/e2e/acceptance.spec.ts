import { expect, test } from '@playwright/test';

test('E2E-001 单屏首屏与画布空间预算', async ({ page }) => {
  for (const viewport of [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const metrics = await page.evaluate(() => {
      const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      return {
        scrollHeight: document.documentElement.scrollHeight,
        height: innerHeight,
        header: box('.app-header').height,
        card: box('.canvas-card').height,
        svg: box('.bars-svg').height,
      };
    });
    expect(metrics.scrollHeight).toBe(metrics.height);
    expect(metrics.header).toBeLessThanOrEqual(52);
    expect(metrics.card / metrics.height).toBeGreaterThanOrEqual(viewport.width === 1366 ? 0.62 : 0.76);
    expect(metrics.svg / metrics.height).toBeGreaterThanOrEqual(viewport.width === 1366 ? 0.5 : 0.66);
    await page.waitForFunction(() => {
      const bars = [...document.querySelectorAll<SVGRectElement>('.bar-shape')];
      const svgHeight = document.querySelector('.bars-svg')!.getBoundingClientRect().height;
      return bars.length >= 2 && bars.every((bar) => Number(bar.getAttribute('width')) > 0) && Math.max(...bars.map((bar) => Number(bar.getAttribute('height')))) / svgHeight > 0.3;
    });
    const plot = await page.locator('.bar-shape').evaluateAll((bars) => bars.map((bar) => Number(bar.getAttribute('height'))));
    expect(Math.max(...plot) / metrics.svg).toBeGreaterThan(0.3);
    await expect(page.locator('.operation-badge')).toBeVisible();
    await expect(page.locator('.step-narration')).toBeVisible();
    await expect(page.locator('[data-testid="canvas-legend"]')).toBeVisible();
    await expect(page.getByLabel('算法代码与变量')).toBeVisible();
    const workspace = await page.locator('.visual-workspace').evaluate((element) => ({ width: element.clientWidth, canvas: element.querySelector('.canvas-card')!.clientWidth, code: element.querySelector('.code-panel')!.clientWidth }));
    expect(workspace.canvas / workspace.width).toBeGreaterThanOrEqual(0.68);
    expect(workspace.code).toBeGreaterThanOrEqual(320);
    expect(workspace.code).toBeLessThanOrEqual(400);
    await page.screenshot({ path: `test-results/visual-${viewport.width}x${viewport.height}.png` });
  }
});

test('E2E-002 手机宽度下步骤提示不覆盖柱图', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (let frame = 0; frame < 4; frame += 1) await page.getByLabel('下一步').click();
  await expect(page.locator('.step-indicator strong')).toHaveText('5');
  await expect(page.locator('.step-explanation')).toBeHidden();
  await expect(page.locator('.intuition-strip')).toContainText('水位取较短边 7');
  const boxes = await page.evaluate(() => {
    const svg = document.querySelector('.bars-svg')!.getBoundingClientRect();
    const stage = document.querySelector('.canvas-stage')!.getBoundingClientRect();
    return [...document.querySelectorAll('.bar-shape')].map((shape) => {
      const box = shape.getBoundingClientRect();
      return box.top >= svg.top && box.bottom <= stage.bottom;
    });
  });
  expect(boxes.every(Boolean)).toBe(true);
});

test('E2E-003 调整视口时短屏画布模式同步切换', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const stage = page.locator('.canvas-stage');
  await expect(stage).not.toHaveClass(/compact-stage|short-stage/);

  await page.setViewportSize({ width: 390, height: 640 });
  await expect(stage).toHaveClass(/compact-stage/);
  await expect(stage).toHaveClass(/short-stage/);
  await expect.poll(() => page.locator('.bars-svg').evaluate((svg) => {
    const stageBox = svg.closest('.canvas-stage')!.getBoundingClientRect();
    const svgBox = svg.getBoundingClientRect();
    return svgBox.width === stageBox.width && svgBox.height < stageBox.height && svgBox.bottom <= stageBox.bottom;
  })).toBe(true);

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(stage).not.toHaveClass(/compact-stage|short-stage/);
});

test('E2E-004 矮屏提示条保持在画布内', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 640 }, { width: 1024, height: 600 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const boxes = await page.evaluate(() => {
      const hint = document.querySelector('.intuition-strip')!.getBoundingClientRect();
      const stage = document.querySelector('.canvas-stage')!.getBoundingClientRect();
      return { hintRight: hint.right, stageRight: stage.right, hintLeft: hint.left, stageLeft: stage.left };
    });
    expect(boxes.hintLeft).toBeGreaterThanOrEqual(boxes.stageLeft);
    expect(boxes.hintRight).toBeLessThanOrEqual(boxes.stageRight);
  }
});

test('E2E-005 窄屏图表不在柱体上叠放最大值文本', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 390, height: 640 }, { width: 1024, height: 600 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('.best-label')).toBeHidden();
  }
});

test('E2E-006 宽屏矮视口保留有效柱图高度', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 640 });
  await page.goto('/');
  await expect(page.locator('.canvas-stage')).toHaveClass(/short-stage/);
  await expect.poll(() => page.locator('.bar-shape').evaluateAll((bars) =>
    bars.every((bar) => Number(bar.getAttribute('height')) >= 0),
  )).toBe(true);
  const dimensions = await page.evaluate(() => {
    const svg = document.querySelector('.bars-svg')!.getBoundingClientRect();
    const bars = [...document.querySelectorAll<SVGRectElement>('.bar-shape')];
    return { svgHeight: svg.height, maxBar: Math.max(...bars.map((bar) => Number(bar.getAttribute('height')))) };
  });
  expect(dimensions.maxBar / dimensions.svgHeight).toBeGreaterThan(0.3);
});

test('E2E-004 外链行为', async ({ page }) => {
  await page.goto('/');
  const hot100 = page.locator('.header-link').first();
  await expect(hot100).toHaveAttribute('href', 'https://fuck-algorithm.github.io/leetcode-hot-100/');
  await expect(hot100).toHaveAttribute('target', '_blank');
  await expect(page.getByRole('heading', { name: /11\. 盛最多水的容器/ }).locator('a')).toHaveAttribute('href', 'https://leetcode.cn/problems/container-with-most-water/');
  await expect(page.locator('.github-badge')).toHaveAttribute('href', 'https://github.com/fuck-algorithm/leetcode-11-container-with-most-water');
});

test('E2E-003 非法输入不更新，合法输入重置动画', async ({ page }) => {
  await page.goto('/');
  await page.locator('#heights-input').fill('1, nope, 3');
  await page.getByText('应用', { exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('.step-indicator strong')).toHaveText('1');
  await page.locator('#heights-input').fill('2, 3, 4');
  await page.getByText('应用', { exact: true }).click();
  await expect(page.locator('.bar-node')).toHaveCount(3);
  await expect(page.locator('.step-indicator strong')).toHaveText('1');
});

test('E2E-004 随机数据', async ({ page }) => {
  await page.goto('/');
  await page.getByText('随机生成').click();
  await expect(page.locator('.bar-node')).toHaveCount(await page.locator('#heights-input').evaluate((input) => (input as HTMLInputElement).value.split(',').length));
});

test('E2E-005 多解法仍支持代码语言切换与记忆', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.canvas-card')).toBeVisible();
  await expect(page.getByLabel('算法代码与变量')).toBeVisible();
  await expect(page.getByLabel('代码语言')).toHaveValue('Java');
  await page.getByLabel('代码语言').selectOption('Python');
  await page.getByRole('tab', { name: '暴力枚举 O(n²)' }).click();
  await expect(page.locator('.code-list')).toHaveAttribute('aria-label', 'Python 暴力枚举实现');
  await page.reload();
  await expect(page.getByLabel('代码语言')).toHaveValue('Python');
  await expect(page.locator('.code-list')).toHaveAttribute('aria-label', 'Python 双指针实现');
});

test('E2E-006 操作、解说和画布随步骤同步', async ({ page }) => {
  await page.goto('/');
  const narration = page.locator('.step-narration');
  const before = await narration.textContent();
  await page.getByLabel('下一步').click();
  await expect(page.locator('.operation-badge')).toHaveAttribute('data-operation', 'compare');
  await expect(narration).not.toHaveText(before ?? '');
  await expect(page.locator('.water-area')).toHaveCount(1);
  await expect.poll(() => page.locator('.water-area').evaluate((water) => {
    const leftBar = document.querySelector<SVGGElement>('.bar-node[data-node-id="bar-0"]')!;
    const rightBar = document.querySelector<SVGGElement>('.bar-node[data-node-id="bar-8"]')!;
    const leftShape = leftBar.querySelector('rect')!;
    const left = Number(leftBar.getAttribute('transform')!.split('(')[1].split(',')[0]) + Number(leftShape.getAttribute('width'));
    const right = Number(rightBar.getAttribute('transform')!.split('(')[1].split(',')[0]);
    return Math.abs(Number(water.getAttribute('x')) - left) < 0.1 && Math.abs(Number(water.getAttribute('x')) + Number(water.getAttribute('width')) - right) < 0.1;
  })).toBe(true);
  await expect(page.locator('.intuition-strip')).toContainText('面积 =');
  await expect(page.locator('.area-label')).toContainText('面积 1 × 8 = 8');
  await expect(page.locator('.intuition-strip')).toContainText('水位');
  await expect(page.getByLabel('当前步骤解释')).toContainText('索引 0 与 8');
  await expect(page.getByLabel('当前步骤解释')).toContainText('面积 8');
  await expect(page.getByLabel('当前步骤解释')).toContainText('比较并更新历史最大值');
  await expect(page.locator('.code-line.is-active').first()).toHaveAttribute('data-anchor', 'compare-area');
  await page.getByLabel('下一步').click();
  await expect(page.locator('.operation-badge')).toHaveAttribute('data-operation', 'update');
  await expect(page.getByLabel('当前步骤解释')).toContainText('新纪录 8');
  await expect(page.locator('.code-line.is-active').first()).toHaveAttribute('data-anchor', 'update');
  await expect(page.getByLabel('关键变量')).toContainText('res');
  await page.getByLabel('代码语言').selectOption('Go');
  await expect(page.locator('.code-line.is-active').first()).toHaveAttribute('data-anchor', 'update');
  await page.getByLabel('代码语言').selectOption('JavaScript');
  await expect(page.locator('.code-line.is-active').first()).toHaveAttribute('data-anchor', 'update');
});

test('E2E-007 方向键、空格和重置快捷键', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.step-indicator strong')).toHaveText('2');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.step-indicator strong')).toHaveText('1');
  await page.keyboard.press('Space');
  await expect(page.getByLabel('暂停')).toBeVisible();
  await page.keyboard.press('r');
  await expect(page.locator('.step-indicator strong')).toHaveText('1');
});

test('E2E-008 拖动进度范围', async ({ page }) => {
  await page.goto('/');
  const progress = page.getByLabel('动画进度');
  await progress.fill('5');
  await expect(page.locator('.step-indicator strong')).toHaveText('6');
});

test('E2E-009 画布缩放后步进和改变视口均不重置或污染视角', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const scene = page.locator('.scene');
  await page.getByLabel('放大画布').click();
  await expect.poll(() => scene.getAttribute('transform')).toContain('scale(1.2)');
  await page.getByLabel('下一步').click();
  await expect.poll(() => scene.getAttribute('transform')).toContain('scale(1.2)');
  await expect(page.locator('.intuition-strip')).toBeVisible();
  for (let i = 0; i < 5; i += 1) await page.getByLabel('放大画布').click();
  await expect(page.locator('.canvas-stage')).toHaveClass(/zoomed-stage/);
  await expect(page.locator('.intuition-strip')).toBeHidden();
  await page.getByLabel('重置画布视图').click();
  await expect(page.locator('.canvas-stage')).not.toHaveClass(/zoomed-stage/);
  await expect(page.locator('.intuition-strip')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 640 });
  await expect(page.locator('.canvas-stage')).toHaveClass(/compact-stage/);
  await expect.poll(() => scene.getAttribute('transform')).not.toMatch(/NaN|Infinity/);
  await expect.poll(() => scene.getAttribute('transform')).toMatch(/scale\((0\.[6-9]\d*|1(?:\.\d+)?)\)/);
  await expect(page.locator('.bar-shape').first()).toHaveAttribute('height', /\d/);
});

test('E2E-010 题目描述和算法思路是两个独立弹窗', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: '题目描述' })).toBeVisible();
  await expect(page.getByLabel('题目信息').getByRole('button', { name: '算法思路' })).toBeVisible();

  await page.getByRole('button', { name: '题目描述' }).click();
  await expect(page.getByRole('dialog', { name: '题目描述：盛最多水的容器' })).toBeVisible();
  await expect(page.getByText(/输出：49/)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByLabel('题目信息').getByRole('button', { name: '算法思路' }).click();
  await expect(page.getByRole('dialog', { name: '算法思路：双指针为什么正确？' })).toBeVisible();
  await expect(page.getByText('为什么不漏掉答案')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.operation-badge')).toBeVisible();
  await expect(page.locator('.step-narration')).toBeVisible();
});

test('E2E-011 多解法视图隔离且均可完整播放', async ({ page }, testInfo) => {
  await page.goto('/');
  const progress = page.getByLabel('动画进度');
  await progress.fill(await progress.getAttribute('max') ?? '0');
  await expect(page.locator('.operation-badge')).toHaveAttribute('data-operation', 'done');
  await expect(page.locator('.canvas-metrics')).toContainText('49');
  await expect(page.locator('.bar-node[data-status="best"]')).toHaveCount(2);

  await page.getByRole('tab', { name: '暴力枚举 O(n²)' }).click();
  await expect(page.getByRole('tab', { name: '暴力枚举 O(n²)' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.step-indicator strong')).toHaveText('1');
  await expect(page.locator('.code-list')).toHaveAttribute('aria-label', 'Java 暴力枚举实现');
  await expect(page.locator('.complexity')).toContainText('O(n²)');
  await progress.fill(await progress.getAttribute('max') ?? '0');
  await expect(page.locator('.operation-badge')).toHaveAttribute('data-operation', 'done');
  await expect(page.locator('.canvas-metrics')).toContainText('49');

  await page.getByRole('tab', { name: '双指针 O(n)' }).click();
  await expect(page.locator('.step-indicator strong')).toHaveText('1');
  await expect(page.locator('.code-list')).toHaveAttribute('aria-label', 'Java 双指针实现');
  await page.screenshot({ path: testInfo.outputPath('two-pointer-step-1.png') });
  await page.getByLabel('下一步').click();
  await page.screenshot({ path: testInfo.outputPath('two-pointer-step-2.png') });
  await page.getByLabel('下一步').click();
  await page.screenshot({ path: testInfo.outputPath('two-pointer-step-3.png') });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByLabel('下一步').click();
  await expect(page.locator('.step-narration')).toContainText('面积');
  await page.screenshot({ path: testInfo.outputPath('reduced-motion.png') });
});

test('E2E-016 自动播放的每帧之间有可见停顿', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('播放速度').selectOption('200');
  const intervals = await page.evaluate(() => new Promise<number[]>((resolve) => {
    const frame = document.querySelector('.step-indicator strong')!;
    let previous = performance.now();
    const elapsed: number[] = [];
    const observer = new MutationObserver(() => {
      elapsed.push(performance.now() - previous);
      previous = performance.now();
      if (elapsed.length === 3) {
        observer.disconnect();
        resolve(elapsed);
      }
    });
    observer.observe(frame, { childList: true, characterData: true, subtree: true });
    document.querySelector<HTMLButtonElement>('.play-button')!.click();
  }));
  expect(intervals.every((interval) => interval >= 550)).toBe(true);
});

test('E2E-017 1x 双指针动画完整播放并输出录屏', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('播放速度').selectOption('800');
  await page.getByRole('button', { name: '播放' }).click();
  await expect(page.locator('.operation-badge')).toHaveAttribute('data-operation', 'done', { timeout: 120_000 });
  await expect(page.locator('.canvas-metrics')).toContainText('49');
});

test('E2E-012 操作后无旧节点残留', async ({ page }) => {
  await page.goto('/');
  await page.locator('#heights-input').fill('3, 1, 2, 4');
  await page.getByText('应用', { exact: true }).click();
  await expect(page.locator('.bar-node')).toHaveCount(4);
  await expect.poll(() => page.locator('.bar-node[opacity="0"]').count()).toBe(0);
});

test('E2E-013 播放速度刷新后保留', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('播放速度').selectOption('400');
  await page.reload();
  await expect(page.getByLabel('播放速度')).toHaveValue('400');
});

test('E2E-014 GitHub 链接可用', async ({ page }) => {
  await page.goto('/');
  const github = page.locator('.github-badge');
  await expect(github).toHaveAttribute('target', '_blank');
  await expect(github.locator('img')).toHaveAttribute('alt', 'GitHub');
  await expect(github).toHaveAttribute('aria-label', /^GitHub \d+ stars$/);
});

test('E2E-015 社群浮层二维码与无紫色主题', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '交流群' }).hover();
  const qr = page.getByAltText('算法交流群二维码');
  await expect(qr).toBeVisible();
  const qrBox = await qr.boundingBox();
  expect(qrBox).not.toBeNull();
  expect(Math.abs(qrBox!.width / qrBox!.height - 1)).toBeLessThan(0.02);
  const css = await page.evaluate(() => [...document.styleSheets].map((sheet) => {
    try { return [...sheet.cssRules].map((rule) => rule.cssText).join(' '); } catch { return ''; }
  }).join(' '));
  expect(css.toLowerCase()).not.toContain('purple');
  const colors = css.match(/#[0-9a-f]{3,8}\b/gi) ?? [];
  expect(colors.some((color) => {
    const hex = color.slice(1);
    const full = hex.length === 3 ? [...hex].map((digit) => digit + digit).join('') : hex.slice(0, 6);
    const red = parseInt(full.slice(0, 2), 16);
    const green = parseInt(full.slice(2, 4), 16);
    const blue = parseInt(full.slice(4, 6), 16);
    return blue > red * 1.2 && blue > green * 1.1 && red > green * 0.8;
  })).toBe(false);
});
