# 盛最多水的容器 - 算法可视化

这是一个基于React和D3.js的算法可视化项目，用于演示LeetCode第11题"盛最多水的容器"的解法。通过交互式动画展示双指针法解决问题的过程，帮助理解算法原理。

## 项目特点

- 响应式设计，适配各种屏幕尺寸
- 交互式动画控制，包括播放/暂停/步进/重置
- 自定义输入，可测试不同的高度数组
- 直观的水容器可视化展示
- 详细的算法步骤说明

## 算法介绍

"盛最多水的容器"问题：给定一个正整数数组，其中每个元素代表坐标轴上的一个点的高度，找出其中的两个点，使得它们与x轴共同构成的容器可以容纳最多的水。

本项目实现了双指针法解决此问题：
1. 初始化左右指针分别指向数组的两端
2. 计算当前指针对应的容器面积
3. 移动指向较短高度的指针向内移动一步
4. 重复步骤2-3直至两指针相遇
5. 返回过程中找到的最大面积

## 技术栈

- React + TypeScript
- D3.js (数据可视化)
- Vite (构建工具)

## 开发与构建

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
/src
  /components
    /algorithm
      AlgorithmAnimation.tsx  # 主动画组件
      ControlPanel.tsx        # 播放控制面板
      VerticalBars.tsx        # 垂直线组件
      WaterContainer.tsx      # 水容器组件
  /hooks
    useAlgorithmAnimation.ts  # 动画控制钩子
  /types
    algorithm.ts              # 类型定义
  /utils
    algorithmUtils.ts         # 算法工具函数
  App.tsx                     # 应用入口
  main.tsx                    # 主渲染文件
```

## 许可证

MIT
