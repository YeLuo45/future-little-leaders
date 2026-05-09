/**
 * 任务服务
 * 负责任务管理，包括归属和共享功能
 */

import { getCurrentMemberId, getCurrentMember, getFamilyMembers, FAMILY_ROLES } from './familyService'

// 动态引入 collaborationService，避免循环依赖
let collaborationService = null
try {
  collaborationService = require('./collaborationService')
} catch (e) {
  // collaborationService 不存在，忽略
}

const TASKS_KEY = 'tasks'
const TASK_RECORDS_KEY = 'task_records'

// 获取所有任务
export const getTasks = () => {
  try {
    const stored = uni.getStorageSync(TASKS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取任务列表失败:', e)
    return []
  }
}

// 保存任务列表
export const saveTasks = (tasks) => {
  uni.setStorageSync(TASKS_KEY, JSON.stringify(tasks))
}

// 获取当前成员的任务
export const getMyTasks = () => {
  const memberId = getCurrentMemberId()
  if (!memberId) return getTasks()
  
  return getTasks().filter(task => task.createdBy === memberId)
}

// 获取家庭共享任务
export const getFamilyTasks = () => {
  return getTasks().filter(task => task.isFamilyShare === true)
}

// 获取所有可见任务（我的 + 家庭共享）
export const getVisibleTasks = () => {
  const memberId = getCurrentMemberId()
  if (!memberId) return getTasks()
  
  const currentMember = getCurrentMember()
  const members = getFamilyMembers()
  
  return getTasks().filter(task => {
    // 创建者自己的任务
    if (task.createdBy === memberId) return true
    // 家庭共享任务
    if (task.isFamilyShare === true) return true
    return false
  }).map(task => {
    // 附加创建者信息
    const creator = members.find(m => m.id === task.createdBy)
    if (creator) {
      const roleInfo = FAMILY_ROLES[creator.role] || FAMILY_ROLES.other
      task.createdByName = creator.nickname
      task.createdByIcon = roleInfo.icon
    }
    return task
  })
}

// 创建任务
export const createTask = (taskData) => {
  const memberId = getCurrentMemberId()
  
  const task = {
    id: 'task_' + Date.now(),
    createdBy: memberId,
    createdAt: new Date().toISOString(),
    isFamilyShare: taskData.isFamilyShare || false, // 是否家庭共享
    status: 'active',
    // 新增字段
    assigneeId: taskData.assigneeId || null,
    rewardPoints: taskData.rewardPoints || 0,
    hasFlow: taskData.assigneeId ? true : false,
    ...taskData
  }
  
  const tasks = getTasks()
  tasks.push(task)
  saveTasks(tasks)
  
  // 如果有 assigneeId，自动创建 TaskFlow
  if (task.assigneeId && collaborationService && collaborationService.createTaskFlow) {
    try {
      collaborationService.createTaskFlow({
        taskId: task.id,
        assigneeId: task.assigneeId,
        rewardPoints: task.rewardPoints
      })
    } catch (e) {
      console.error('创建 TaskFlow 失败:', e)
    }
  }
  
  return task
}

// 更新任务
export const updateTask = (taskId, updates) => {
  const tasks = getTasks()
  const index = tasks.findIndex(t => t.id === taskId)
  
  if (index === -1) {
    throw new Error('任务不存在')
  }
  
  tasks[index] = { ...tasks[index], ...updates }
  saveTasks(tasks)
  
  return tasks[index]
}

// 删除任务
export const deleteTask = (taskId) => {
  const tasks = getTasks()
  const filtered = tasks.filter(t => t.id !== taskId)
  saveTasks(filtered)
}

// 获取宝宝的任务
export const getBabyTasks = (babyId) => {
  return getVisibleTasks().filter(task => task.babyId === babyId)
}

// 完成任务
export const completeTask = (taskId) => {
  const tasks = getTasks()
  const index = tasks.findIndex(t => t.id === taskId)
  
  if (index === -1) {
    throw new Error('任务不存在')
  }
  
  const task = tasks[index]
  task.status = 'completed'
  task.completedAt = new Date().toISOString()
  saveTasks(tasks)
  
  // 如果任务有 hasFlow，调用 completeTaskFlow
  if (task.hasFlow && collaborationService && collaborationService.completeTaskFlow) {
    try {
      collaborationService.completeTaskFlow({ taskId: task.id, assigneeId: task.assigneeId })
    } catch (e) {
      console.error('完成 TaskFlow 失败:', e)
    }
  }
  
  // 记录到任务记录
  const records = uni.getStorageSync(TASK_RECORDS_KEY) || '[]'
  const recordList = JSON.parse(records)
  
  recordList.unshift({
    id: 'record_' + Date.now(),
    taskId: task.id,
    taskTitle: task.title,
    babyId: task.babyId,
    completedAt: task.completedAt,
    createdBy: task.createdBy
  })
  
  uni.setStorageSync(TASK_RECORDS_KEY, JSON.stringify(recordList))
  
  return task
}

// 获取任务记录
export const getTaskRecords = () => {
  try {
    const stored = uni.getStorageSync(TASK_RECORDS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取任务记录失败:', e)
    return []
  }
}

// 判断任务是否可被当前成员操作
export const canOperateTask = (task) => {
  const memberId = getCurrentMemberId()
  if (!memberId) return false
  
  // 创建者可以操作
  if (task.createdBy === memberId) return true
  
  // 家庭共享任务，其他成员可以打卡但不能删除
  if (task.isFamilyShare === true) return true
  
  return false
}

export default {
  getTasks,
  saveTasks,
  getMyTasks,
  getFamilyTasks,
  getVisibleTasks,
  createTask,
  updateTask,
  deleteTask,
  getBabyTasks,
  completeTask,
  getTaskRecords,
  canOperateTask
}
