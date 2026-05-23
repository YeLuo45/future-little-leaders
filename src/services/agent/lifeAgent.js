/**
 * V101 Life Agent
 * 生活Agent - 整理房间/刷牙洗护、时间管理/情绪管理
 */

import { AGENT_TYPES, createResponse, DIFFICULTY_LEVELS } from './agentProtocol.js'

// ============================================================================
// LifeAgent状态
// ============================================================================

const lifeAgentState = {
  currentTask: null,
  taskHistory: [],
  completedTasks: [],
  streakDays: {},
  difficultyLevel: 'INTERMEDIATE',
  sessionStartTime: null,
  currentStep: 0
}

// ============================================================================
// 生活技能任务数据
// ============================================================================

const LIFE_TASKS = {
  cleaning: {
    title: '整理房间',
    steps: [
      { id: 1, instruction: '先把地板上的玩具收拾好', tip: '把玩具放进玩具箱' },
      { id: 2, instruction: '把书本放回书架', tip: '按大小或种类分类摆放' },
      { id: 3, instruction: '整理床铺', tip: '把被子叠整齐' },
      { id: 4, instruction: '用抹布擦桌子', tip: '从里往外擦' },
      { id: 5, instruction: '把垃圾扔进垃圾桶', tip: '垃圾分类哦' }
    ],
    duration: '15分钟',
    rewards: { points: 20, stars: 1 }
  },
  hygiene: {
    title: '刷牙洗护',
    steps: [
      { id: 1, instruction: '先洗手', tip: '用流动的水和肥皂' },
      { id: 2, instruction: '挤适量牙膏在牙刷上', tip: '大约豌豆大小' },
      { id: 3, instruction: '刷牙2-3分钟', tip: '上下刷，每个牙面都要刷到' },
      { id: 4, instruction: '漱口并清洗牙刷', tip: '吐掉漱口水，冲干净牙刷' },
      { id: 5, instruction: '洗脸并擦干', tip: '用毛巾轻轻擦干脸' }
    ],
    duration: '5分钟',
    rewards: { points: 15, stars: 1 }
  },
  time_management: {
    title: '时间管理',
    steps: [
      { id: 1, instruction: '想想今天有哪些事情要做', tip: '列出任务清单' },
      { id: 2, instruction: '按重要程度排序', tip: '先做重要的事' },
      { id: 3, instruction: '估计每个任务需要多长时间', tip: '合理安排时间' },
      { id: 4, instruction: '制作简单的日程表', tip: '用图画或文字表示' },
      { id: 5, instruction: '定时检查进度', tip: '看看是否按计划进行' }
    ],
    duration: '10分钟',
    rewards: { points: 15, stars: 1 }
  },
  emotion_management: {
    title: '情绪管理',
    steps: [
      { id: 1, instruction: '先深呼吸三次', tip: '慢慢吸气，慢慢呼气' },
      { id: 2, instruction: '说出自己的感受', tip: '我感到...因为...' },
      { id: 3, instruction: '分析为什么会这样', tip: '找到原因' },
      { id: 4, instruction: '想一个让自己开心起来的方法', tip: '听音乐、画画、运动...' },
      { id: 5, instruction: '给自己一个鼓励', tip: '我可以做到的！' }
    ],
    duration: '5分钟',
    rewards: { points: 15, stars: 1 }
  }
}

// ============================================================================
// 处理请求
// ============================================================================

export const handleRequest = async (request) => {
  const { action, data } = request.payload
  
  lifeAgentState.sessionStartTime = lifeAgentState.sessionStartTime || Date.now()
  
  switch (action) {
    case 'cleaning':
    case 'hygiene':
    case 'time_management':
    case 'emotion_management':
      return startLifeTask(action, data)
    case 'general':
      return getGeneralLifeResponse(data)
    case 'next_step':
      return nextTaskStep(data)
    case 'complete_step':
      return completeStep(data)
    case 'get_progress':
      return getTaskProgress(data)
    case 'motivate':
      return getMotivation(data)
    default:
      return createResponse(request.id, false, null, { code: 'UNKNOWN_ACTION', message: '未知操作' })
  }
}

// ============================================================================
// 处理转介
// ============================================================================

export const handleTransfer = async (transferMsg) => {
  const { task, context } = transferMsg.payload
  
  if (context) {
    lifeAgentState.difficultyLevel = context.difficultyLevel || 'INTERMEDIATE'
  }
  
  return handleRequest({
    id: transferMsg.id,
    payload: {
      action: task.action,
      data: { ...task.data, context }
    }
  })
}

// ============================================================================
// 开始生活任务
// ============================================================================

const startLifeTask = (taskType, data = {}) => {
  const taskData = LIFE_TASKS[taskType]
  
  if (!taskData) {
    return createResponse('task_' + Date.now(), false, null, { code: 'INVALID_TASK', message: '无效的任务类型' })
  }
  
  lifeAgentState.currentTask = {
    type: taskType,
    title: taskData.title,
    steps: [...taskData.steps],
    currentStep: 0,
    completedSteps: [],
    rewards: taskData.rewards,
    startTime: Date.now()
  }
  
  return createResponse('task_' + Date.now(), true, {
    type: 'life_task',
    taskType,
    title: taskData.title,
    totalSteps: taskData.steps.length,
    duration: taskData.duration,
    currentStep: 1,
    instruction: taskData.steps[0].instruction,
    tip: taskData.stips ? taskData.steps[0].tip : '你可以的！',
    rewards: taskData.rewards,
    encouragement: getTaskEncouragement(taskType)
  })
}

// ============================================================================
// 下一步
// ============================================================================

const nextTaskStep = (data) => {
  if (!lifeAgentState.currentTask) {
    return createResponse('next_step_' + Date.now(), false, null, { code: 'NO_ACTIVE_TASK', message: '没有正在进行的任务' })
  }
  
  const task = lifeAgentState.currentTask
  const nextStep = task.currentStep + 1
  
  if (nextStep >= task.steps.length) {
    return completeLifeTask()
  }
  
  task.currentStep = nextStep
  const stepData = task.steps[nextStep]
  
  return createResponse('next_step_' + Date.now(), true, {
    currentStep: nextStep + 1,
    totalSteps: task.steps.length,
    instruction: stepData.instruction,
    tip: stepData.tip,
    progress: Math.round(((nextStep + 1) / task.steps.length) * 100),
    encouragement: getStepEncouragement(nextStep)
  })
}

// ============================================================================
// 完成步骤
// ============================================================================

const completeStep = (data) => {
  if (!lifeAgentState.currentTask) {
    return createResponse('complete_' + Date.now(), false, null, { code: 'NO_ACTIVE_TASK', message: '没有正在进行的任务' })
  }
  
  const task = lifeAgentState.currentTask
  const currentStepData = task.steps[task.currentStep]
  
  task.completedSteps.push({
    ...currentStepData,
    completedAt: Date.now()
  })
  
  // 检查是否完成
  if (task.completedSteps.length >= task.steps.length) {
    return completeLifeTask()
  }
  
  return createResponse('complete_' + Date.now(), true, {
    completedStep: task.currentStep + 1,
    remainingSteps: task.steps.length - task.completedSteps.length,
    progress: Math.round((task.completedSteps.length / task.steps.length) * 100),
    encouragement: '太棒了！继续加油！🌟'
  })
}

// ============================================================================
// 完成生活任务
// ============================================================================

const completeLifeTask = () => {
  const task = lifeAgentState.currentTask
  
  // 更新连续完成任务
  const today = new Date().toDateString()
  lifeAgentState.streakDays[task.type] = lifeAgentState.streakDays[task.type] || { lastDate: null, count: 0 }
  
  if (lifeAgentState.streakDays[task.type].lastDate !== today) {
    lifeAgentState.streakDays[task.type].count++
    lifeAgentState.streakDays[task.type].lastDate = today
  }
  
  // 记录完成的任务
  lifeAgentState.completedTasks.push({
    ...task,
    completedAt: Date.now(),
    duration: Date.now() - task.startTime
  })
  
  const result = createResponse('complete_task_' + Date.now(), true, {
    type: 'task_complete',
    title: task.title,
    rewards: task.rewards,
    streakCount: lifeAgentState.streakDays[task.type].count,
    totalCompleted: lifeAgentState.completedTasks.length,
    celebration: getCelebrationMessage(),
    badge: getBadgeForTask(task.type)
  })
  
  // 重置当前任务
  lifeAgentState.currentTask = null
  lifeAgentState.currentStep = 0
  
  return result
}

// ============================================================================
// 获取任务进度
// ============================================================================

const getTaskProgress = (data) => {
  if (!lifeAgentState.currentTask) {
    return createResponse('progress_' + Date.now(), false, null, { code: 'NO_ACTIVE_TASK', message: '没有正在进行的任务' })
  }
  
  const task = lifeAgentState.currentTask
  
  return createResponse('progress_' + Date.now(), true, {
    title: task.title,
    currentStep: task.currentStep + 1,
    totalSteps: task.steps.length,
    progress: Math.round(((task.currentStep + 1) / task.steps.length) * 100),
    completedSteps: task.completedSteps.map(s => s.id)
  })
}

// ============================================================================
// 获取激励
// ============================================================================

const getMotivation = (data) => {
  const motivations = [
    '你是个生活小能手！💪',
    '良好的习惯让你更优秀！🌟',
    '坚持就是胜利！🏆',
    '相信自己，你能做到！⭐',
    '小小的努力，大大的收获！🌈'
  ]
  
  return createResponse('motivate_' + Date.now(), true, {
    message: motivations[Math.floor(Math.random() * motivations.length)],
    tip: '每天进步一点点'
  })
}

// ============================================================================
// 获取任务鼓励语
// ============================================================================

const getTaskEncouragement = (taskType) => {
  const encouragements = {
    cleaning: '整理房间，让生活更美好！🏠',
    hygiene: '保持卫生，健康生活！🧼',
    time_management: '合理安排时间，做时间的小主人！⏰',
    emotion_management: '情绪管理，让你更强大！💪'
  }
  return encouragements[taskType] || '加油！你能做到的！'
}

// ============================================================================
// 获取步骤鼓励语
// ============================================================================

const getStepEncouragement = (stepIndex) => {
  const encouragements = [
    '很好！继续下一个！👍',
    '做得太棒了！🌟',
    '你真厉害！👏',
    '保持这个势头！💪',
    '下一个也很简单！🎯'
  ]
  return encouragements[stepIndex % encouragements.length]
}

// ============================================================================
// 获取庆祝消息
// ============================================================================

const getCelebrationMessage = () => {
  const celebrations = [
    '🎉 太棒了！你完成了任务！',
    '🌟 完美！你真是个生活小达人！',
    '🏆 恭喜！继续保持！',
    '⭐ 太厉害了！继续加油！',
    '🎊 完成了！你真棒！'
  ]
  return celebrations[Math.floor(Math.random() * celebrations.length)]
}

// ============================================================================
// 获取任务徽章
// ============================================================================

const getBadgeForTask = (taskType) => {
  const badges = {
    cleaning: { name: '整洁达人', icon: '🏠' },
    hygiene: { name: '卫生小标兵', icon: '🧼' },
    time_management: { name: '时间管理者', icon: '⏰' },
    emotion_management: { name: '情绪大师', icon: '😊' }
  }
  return badges[taskType] || { name: '生活达人', icon: '⭐' }
}

// ============================================================================
// 通用生活响应
// ============================================================================

const getGeneralLifeResponse = (data) => {
  return createResponse('life_general_' + Date.now(), true, {
    message: '生活Agent准备好啦！你想练习什么技能呢？',
    options: [
      { action: 'cleaning', name: '整理房间', icon: '🏠' },
      { action: 'hygiene', name: '刷牙洗护', icon: '🧼' },
      { action: 'time_management', name: '时间管理', icon: '⏰' },
      { action: 'emotion_management', name: '情绪管理', icon: '😊' }
    ]
  })
}

// ============================================================================
// 获取Agent状态
// ============================================================================

export const getLifeAgentStatus = () => {
  return { 
    ...lifeAgentState,
    streakDays: { ...lifeAgentState.streakDays },
    totalCompleted: lifeAgentState.completedTasks.length
  }
}

// ============================================================================
// 重置Agent状态
// ============================================================================

export const resetLifeAgent = () => {
  lifeAgentState.currentTask = null
  lifeAgentState.taskHistory = []
  lifeAgentState.completedTasks = []
  lifeAgentState.difficultyLevel = 'INTERMEDIATE'
  lifeAgentState.sessionStartTime = null
  lifeAgentState.currentStep = 0
}

// ============================================================================
// 导出LifeAgent单例
// ============================================================================

export const LifeAgent = {
  handleRequest,
  handleTransfer,
  getStatus: getLifeAgentStatus,
  reset: resetLifeAgent
}

export default LifeAgent