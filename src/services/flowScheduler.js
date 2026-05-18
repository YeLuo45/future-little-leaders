/**
 * FlowScheduler — 流程定时调度服务
 * 将 scheduled 节点注册到 SchedulerService，支持定时触发后通知 FlowExecutor 继续执行
 */

import { CHANNELS } from './notificationService.js'

const FLOW_SCHEDULE_PREFIX = 'flow_schedule_'

/**
 * 从 localStorage 加载流程调度配置
 */
function loadFlowSchedules() {
  try {
    const stored = uni.getStorageSync('flow_schedules') || '{}'
    return typeof stored === 'string' ? JSON.parse(stored) : stored
  } catch (e) {
    return {}
  }
}

/**
 * 保存流程调度配置
 */
function saveFlowSchedules(schedules) {
  try {
    uni.setStorageSync('flow_schedules', JSON.stringify(schedules))
  } catch (e) {
    console.error('[FlowScheduler] saveFlowSchedules failed:', e)
  }
}

/**
 * 注册一个 flow 的 scheduled 节点
 * @param {string} flowId - 流程ID
 * @param {string} nodeId - 节点ID
 * @param {object} scheduleConfig - 调度配置 { cycle, weekdays, timeOfDay }
 * @param {object} nodeInfo - 节点信息 { label, title, description }
 */
function registerFlowSchedule(flowId, nodeId, scheduleConfig, nodeInfo = {}) {
  const schedules = loadFlowSchedules()
  const key = `${FLOW_SCHEDULE_PREFIX}${flowId}_${nodeId}`
  
  // 构建模板数据
  const template = {
    id: key,
    title: nodeInfo.title || nodeInfo.label || '流程任务',
    description: nodeInfo.description || '',
    cycle: scheduleConfig.cycle || 'daily',
    weekdays: scheduleConfig.weekdays || [],
    timeOfDay: scheduleConfig.timeOfDay || null,
    enabled: true,
    createdAt: Date.now(),
    lastTriggered: 0,
    flowId,
    nodeId
  }
  
  schedules[key] = template
  saveFlowSchedules(schedules)
  
  // 注册到 SchedulerService（如果可用）
  try {
    const SchedulerService = require('./schedulerService')
    if (SchedulerService && SchedulerService.createTemplate) {
      SchedulerService.createTemplate({
        title: template.title,
        description: template.description,
        babyId: null, // scheduled 节点不绑定特定宝宝
        rewardPoints: 0,
        cycle: template.cycle,
        weekdays: template.weekdays,
        timeOfDay: template.timeOfDay,
        auditDeadline: 3
      })
    }
  } catch (e) {
    console.warn('[FlowScheduler] SchedulerService not available:', e.message)
  }
  
  console.log('[FlowScheduler] Registered schedule:', key, template.cycle, template.timeOfDay)
  return template
}

/**
 * 触发一个已注册的 scheduled 节点
 * @param {string} flowId 
 * @param {string} nodeId 
 */
function triggerScheduledNode(flowId, nodeId) {
  const schedules = loadFlowSchedules()
  const key = `${FLOW_SCHEDULE_PREFIX}${flowId}_${nodeId}`
  const schedule = schedules[key]
  
  if (!schedule) {
    console.warn('[FlowScheduler] Schedule not found:', key)
    return false
  }
  
  // 发送通知
  try {
    const NotificationService = require('./notificationService')
    if (NotificationService && NotificationService.send) {
      NotificationService.send({
        type: 'flow_reminder',
        channel: CHANNELS.REMINDER,
        recipientId: 'family_broadcast',
        title: schedule.title || '流程提醒',
        content: schedule.description || '定时任务待执行',
        data: { flowId, nodeId, type: 'scheduled_trigger' }
      })
    }
  } catch (e) {
    console.warn('[FlowScheduler] NotificationService not available:', e.message)
  }
  
  // 通知 FlowExecutor 继续执行（通过全局事件）
  uni.$emit('flow:scheduleTriggered', { flowId, nodeId, timestamp: Date.now() })
  
  console.log('[FlowScheduler] Triggered:', key)
  return true
}

/**
 * 取消注册一个 scheduled 节点
 */
function unregisterFlowSchedule(flowId, nodeId) {
  const schedules = loadFlowSchedules()
  const key = `${FLOW_SCHEDULE_PREFIX}${flowId}_${nodeId}`
  
  if (schedules[key]) {
    delete schedules[key]
    saveFlowSchedules(schedules)
    
    // 从 SchedulerService 删除
    try {
      const SchedulerService = require('./schedulerService')
      if (SchedulerService && SchedulerService.deleteTemplate) {
        SchedulerService.deleteTemplate(key)
      }
    } catch (e) {
      // ignore
    }
    
    console.log('[FlowScheduler] Unregistered:', key)
    return true
  }
  return false
}

/**
 * 获取某个 flow 的所有调度
 */
function getFlowSchedules(flowId) {
  const schedules = loadFlowSchedules()
  return Object.values(schedules).filter(s => s.flowId === flowId)
}

/**
 * 监听 SchedulerService 的触发事件（用于后台运行时）
 * 在 App.vue 或页面初始化时调用
 */
function initScheduleListener() {
  uni.$on('scheduler:templateTriggered', (data) => {
    const { templateId } = data
    if (templateId && templateId.startsWith(FLOW_SCHEDULE_PREFIX)) {
      const parts = templateId.replace(FLOW_SCHEDULE_PREFIX, '').split('_')
      if (parts.length >= 2) {
        const flowId = parts.slice(0, -1).join('_')
        const nodeId = parts[parts.length - 1]
        triggerScheduledNode(flowId, nodeId)
      }
    }
  })
  console.log('[FlowScheduler] Schedule listener initialized')
}

const FlowScheduler = {
  registerFlowSchedule,
  triggerScheduledNode,
  unregisterFlowSchedule,
  getFlowSchedules,
  initScheduleListener,
  loadFlowSchedules
}

export default FlowScheduler
