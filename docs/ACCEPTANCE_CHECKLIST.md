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
- [ ] 完整 Skill 产品能力与 AC-001~AC-023（本轮目标为画布质量，仍存在未实现项）
- [ ] B1-B7 全量验收通过后方可报告整体 PASS
