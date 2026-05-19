# PRD-V44: 定时执行 + 通知系统

## 1. 概述

**功能**：实现流程节点的定时执行和通知推送，完整化执行链路闭环。

**问题**：
1. `scheduled` 节点类型存在但未实现定时逻辑
2. FlowExecutor 未处理 `scheduled` 节点
3. 定时触发后没有通知推送

## 2. 解决方案

### 2.1 FlowScheduler 服务

```javascript
// flowScheduler.js
// 集成 SchedulerService 与 FlowExecutor
const FlowScheduler = {
  // 将 flow 的 scheduled 节点注册到 SchedulerService
  registerFlowSchedule(flowId, nodeId, scheduleConfig) {
    // { cycle, weekdays, timeOfDay }
    SchedulerService.createTemplate({ ... })
  },
  
  // 触发 scheduled 节点
  triggerScheduledNode(flowId, nodeId) {
    // 发送通知
    NotificationService.send({ ... })
    // 通知 FlowExecutor 继续执行
    uni.$emit('flow:scheduleTriggered', { flowId, nodeId })
  }
}
```

### 2.2 FlowExecutor 处理 scheduled 节点

```javascript
case 'scheduled': {
  const { cycle, weekdays, timeOfDay, reminderTitle, reminderContent } = node.config
  // 注册到调度器
  FlowScheduler.registerFlowSchedule(this.currentFlowId, node.id, { cycle, weekdays, timeOfDay })
  // 立即发送一次通知
  NotificationService.send({
    type: 'flow_reminder',
    channel: CHANNELS.REMINDER,
    title: reminderTitle || node.label,
    content: reminderContent || '任务待执行',
    data: { flowId: this.currentFlowId, nodeId: node.id }
  })
  return { context: { _scheduledRegistered: true } }
}
```

### 2.3 监听调度触发

在 FlowExecutor 启动时监听调度事件：

```javascript
uni.$on('flow:scheduleTriggered', ({ flowId, nodeId }) => {
  if (flowId === this.currentFlowId) {
    this.currentNodeId = nodeId
    this._resumeExecution()
  }
})
```

## 3. 验收标准

- [ ] scheduled 节点配置后注册到 SchedulerService
- [ ] 定时触发时发送通知
- [ ] FlowExecutor 收到触发事件后继续执行
- [ ] node --check 语法验证通过
