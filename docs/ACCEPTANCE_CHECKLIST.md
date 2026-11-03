# 验收检查清单：画布改进轮次

## 必过规则

必须记录 AC-001~AC-023；任一阻塞项失败则 B1-B7 总评为 FAIL。

- [x] 单屏画布优先，1366×768 与 1920×1080 空间预算浏览器断言通过
- [x] 标题/输入/控制单行；单屏多视口无滚动条
- [x] 算法步骤预计算快照，含 operation、因果 narration、稳定柱体 ID 和候选/最优边界
- [x] 分层 D3 keyed join，入场/更新/退场；无整屏刷新
- [x] 画布平移缩放、默认居中、按钮工具、跨步保持 camera transform
- [x] 固定状态图例、current/compare/visited/best 语义区别、教学徽标、解说与三个指标
- [x] MOTION token 随倍速/停留时长缩放；reduced-motion 关闭 JS 过渡
- [x] 输入校验、快捷键、进度拖动、速度持久化
- [x] `npm run build` / `lint` / `type-check` / `qa:guard` / `test:unit` / `test:coverage` / `test:e2e` 通过
- [x] 暴力枚举与双指针具有独立步骤、四语言代码映射、复杂度展示和切换重置；暴力演示上限保护已测
- [ ] B1-B7 全量验收通过后方可报告整体 PASS

## Round 3 双解法回归

- [x] 暴力枚举与双指针独立快照、代码锚点、复杂度信息与切换重置
- [x] 两种解法示例答案均为 49；暴力枚举超过 30 项时输入被保护
- [x] E2E-011 双解法分别跳到末帧并核对答案，切回重置到首帧
- [x] E2E-016 1x 自动播放完成且生成 video.webm
- [ ] 发布后线上回归，以及 AC-023 录屏/reduced-motion/相邻帧证据
