# 测试计划

## 失败分流与回归策略

构建/lint/type-check 失败先修类型与静态问题；单测失败检查快照、输入校验和动效 token；E2E 失败用 trace 定位 UI/视口回归。修复后运行受影响测试，再跑完整 `qa:full`。

覆盖 AC-001~AC-023 中本项目实际实现的项目；所有 AC 记录证据或写出 N/A 理由，不把 N/A 当 PASS。
最终验收使用 B1-B7：任一 blocking gate 未过则 FAIL。

## 自动化单元测试

运行 `npm run test:unit`：校验默认答案、步骤操作和解说完整、移动帧保留比较边界、短数组/重复高度正确性、动效 token、栈/队列数据边界、容器 D3 渲染及输入组件非法值保护。

运行 `npm run test:coverage`：Vitest + V8 覆盖率，统计 `src/features/` 与 `src/services/`，门槛 lines/functions ≥60%、branches ≥50%。当前功能统计范围仅有 `motion.ts`，报告为 100%；算法工具另有快照测试，但不计入 skill 指定覆盖率范围。

## 浏览器回归

用 Chromium 在 1366×768、1920×1080、390×844 检查：视口无滚动条；画布与 SVG 高度；步进、当前水面延续、非法输入不改变帧；浏览器控制台无运行时异常。

## 尚未覆盖

完整 15 项 Playwright E2E、浏览器缩放/平移、键盘快捷键、reduced-motion 自动化、动画录屏和多分辨率截图证据尚未形成可重复测试。不得据部分回归宣称符合完整验收标准。
