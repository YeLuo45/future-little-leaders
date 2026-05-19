# PRD-V45: 节点执行动画 + 连线流动特效

## 1. 概述

**功能**：实现流程执行时的节点动画和连线流动特效，让执行过程更直观。

**问题**：
1. 执行时没有视觉反馈，用户不清楚当前执行到哪个节点
2. 连线没有流动特效，执行链路不直观

## 2. 解决方案

### 2.1 FlowConnector 流动特效

```css
/* 已存在部分动画 */
.connector-path.running {
  stroke-dasharray: 8, 4;
  animation: flowAnimation 0.8s linear infinite;
}

@keyframes flowAnimation {
  to { stroke-dashoffset: -24; }
}
```

### 2.2 FlowNode 执行动画

```css
/* 节点执行中的脉冲动画 */
.flow-node.running {
  animation: nodePulse 1s ease-in-out infinite;
  box-shadow: 0 0 20px var(--primary-color);
}

@keyframes nodePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### 2.3 FlowEditor 传递执行状态

FlowEditor 需要：
- 接收 `isExecuting` prop
- 传递 `isRunning` prop 给当前执行的节点
- 添加 `running-connection` class 给活跃连线

## 3. 验收标准

- [ ] 执行中节点有脉冲动画
- [ ] 执行中的连线有流动动画
- [ ] 执行完成后动画消失
- [ ] node --check 语法验证通过
