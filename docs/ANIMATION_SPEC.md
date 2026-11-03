# 动画规格：LeetCode 11 盛最多水的容器

## 结构与可观察状态

- 主结构为高度数组 `height[i]`；辅助状态为双指针 `i/j`、候选面积 `area`、最优面积 `res`。
- 每条快照包含唯一 `operation`、步骤标题、因果 `narration`、稳定 `codeAnchor` 与关键变量快照。
- 已实现步骤：init → compare-area →（若刷新纪录）update → move-left/right → done。compare 和 update 为独立帧；每帧最多两个焦点（左右指针）。
- 代码映射使用同一 anchor 集合绑定 Java、Python、Go、JavaScript 四份实现；行号随显示列表生成。

## 空间预算

## 画布优先


- 单屏工作区先预留输入和控制条，余下区域交给 canvas 与代码栏；≥1100px 时横向分栏，画布占 ≥68%，代码栏 `clamp(320px, 24vw, 400px)`；窄屏代码栏下移且页面不滚动。
- 画布 SVG 使用 ResizeObserver 得出容器尺寸，逻辑坐标依高度索引分布，不依赖前一帧或随机位置。
- 画布默认居中，可平移和缩放，步进不重置镜头。

## 稳定布局


## 稳定布局与 D3 更新

- 柱节点使用 `bar-${index}` 稳定 ID；左右指针使用稳定语义身份。
- 所有结构位于持久 scene layer；通过 keyed join 更新，不按帧清空 SVG。
- 水面矩形随候选边界更新；移动帧保留最近比较时快照边界，呈现“面积计算→为什么移动”的因果关系。
- 退场元素淡出完成后清理；新帧到来时中断命名过渡后从当前插值继续。

## 状态图例

## 状态图例与教学层

固定图例：current（左指针/当前焦点）、compare（右指针/比较对象）、visited（已排除）、done（最优解）、当前容器、水面最大面积。

画布常驻操作徽标、Step 编号、两句以内解释和三个快照指标（当前面积、最大面积、搜索宽度）；柱体状态除颜色外还以指针字母、位置、边框和指标说明。箭头/标注规范：候选水面由 `area` 和固定指针边界定义，徽标明确标出比较/更新/移动语义。

## 运动语法

## 箭头与标注规范

箭头应标注动作和对象；指针箭头有明确左右端语义。水面和数值标签绑定快照边界，避开柱体值与固定图例，不穿过节点中心。

## prefers-reduced-motion

- 时间 token 位于 `features/animation/motion.ts`：enter 220ms、move 360ms、exit 180ms、state 240ms。
- 实际时长按停留时间和播放速度缩放，动画预算不超过停留时间 40%；reduced motion 下 JS 过渡归零、CSS 过渡关闭，步骤状态、解说和代码同步仍更新。
- 同一帧的主动作保持聚焦；compare 和 update 拆分，避免同时堆叠多个语义动作。

## 辅助结构容器

`features/animation/structures.ts` 提供稳定容量的 `createStack/createQueue`，`features/animation/render/containers.ts` 使用 `.layer-containers`/容器 kind、固定槽位、容量计数、空状态与方向指针渲染。当前本题主解法无栈/队列，因此该通用容器能力不进入演示帧。

## 布局验证

Playwright E2E-001 量测 1366×768 与 1920×1080，断言无纵向滚动、header 高度、canvas/SVG 高度、画布宽度占比和代码栏宽度，并输出视口截图。
