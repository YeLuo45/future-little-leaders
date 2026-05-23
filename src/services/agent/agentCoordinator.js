/**
 * V101 Agent Coordinator
 * Multi-Agent Orchestration System - 统一入口，跨Agent任务编排，维护对话上下文
 */

import { AGENT_TYPES, createRequest, createResponse, createTransferMessage, createContextUpdate, TASK_STATUS, LEARNING_THEMES } from './agentProtocol.js'

// ============================================================================
// Agent实例管理
// ============================================================================

let mathAgent = null
let chineseAgent = null
let englishAgent = null
let lifeAgent = null

// ============================================================================
// 对话上下文
// ============================================================================

const conversationContext = {
  sessionId: null,
  childProfile: null,
  recentTopics: [],
  taskQueue: [],
  activeAgent: null,
  learningHistory: [],
  difficultyLevel: 'INTERMEDIATE'
}

// ============================================================================
// 初始化Agent
// ============================================================================

export const initializeAgents = async () => {
  // 动态导入避免循环依赖
  const mathAgentModule = await import('./mathAgent.js')
  const chineseAgentModule = await import('./chineseAgent.js')
  const englishAgentModule = await import('./englishAgent.js')
  const lifeAgentModule = await import('./lifeAgent.js')
  
  mathAgent = mathAgentModule.MathAgent
  chineseAgent = chineseAgentModule.ChineseAgent
  englishAgent = englishAgentModule.EnglishAgent
  lifeAgent = lifeAgentModule.LifeAgent
  
  return {
    mathAgent,
    chineseAgent,
    englishAgent,
    lifeAgent
  }
}

// ============================================================================
// 请求路由 - 分析请求类型，分派到对应专业Agent
// ============================================================================

export const routeRequest = async (userMessage, context = {}) => {
  // 更新上下文
  updateContext(context)
  
  // 分析请求类型
  const requestType = analyzeRequestType(userMessage)
  
  // 创建请求
  const request = createRequest(requestType.agent, requestType.action, {
    message: userMessage,
    context: { ...conversationContext }
  })
  
  // 路由到对应Agent
  let response
  switch (requestType.agent) {
    case AGENT_TYPES.MATH:
      response = await mathAgent.handleRequest(request)
      break
    case AGENT_TYPES.CHINESE:
      response = await chineseAgent.handleRequest(request)
      break
    case AGENT_TYPES.ENGLISH:
      response = await englishAgent.handleRequest(request)
      break
    case AGENT_TYPES.LIFE:
      response = await lifeAgent.handleRequest(request)
      break
    default:
      response = createResponse(request.id, false, null, { code: 'UNKNOWN_AGENT', message: '未知的Agent类型' })
  }
  
  // 更新学习历史
  if (response.success) {
    updateLearningHistory(requestType.agent, requestType.action, response.payload)
  }
  
  // 检查是否需要转介
  if (response.payload?.shouldTransfer) {
    return handleTransfer(response.payload.transferTo, request, response)
  }
  
  return response
}

// ============================================================================
// 请求类型分析
// ============================================================================

const analyzeRequestType = (message) => {
  const msgLower = message.toLowerCase()
  
  // 数学相关
  if (/数学|计算|加法|减法|乘法|除法|算术|数学游戏/.test(msgLower)) {
    if (/加法/.test(msgLower)) return { agent: AGENT_TYPES.MATH, action: 'addition' }
    if (/减法/.test(msgLower)) return { agent: AGENT_TYPES.MATH, action: 'subtraction' }
    if (/乘法/.test(msgLower)) return { agent: AGENT_TYPES.MATH, action: 'multiplication' }
    if (/除法/.test(msgLower)) return { agent: AGENT_TYPES.MATH, action: 'division' }
    return { agent: AGENT_TYPES.MATH, action: 'general' }
  }
  
  // 语文相关
  if (/拼音|汉字|生字|笔画|语文|写字|认字/.test(msgLower)) {
    if (/拼音|声调/.test(msgLower)) return { agent: AGENT_TYPES.CHINESE, action: 'pinyin' }
    if (/汉字|识字|认字/.test(msgLower)) return { agent: AGENT_TYPES.CHINESE, action: 'characters' }
    if (/笔画/.test(msgLower)) return { agent: AGENT_TYPES.CHINESE, action: 'stroke_order' }
    return { agent: AGENT_TYPES.CHINESE, action: 'general' }
  }
  
  // 英语相关
  if (/英语|英文|单词|口语|对话/.test(msgLower)) {
    if (/单词|背单词/.test(msgLower)) return { agent: AGENT_TYPES.ENGLISH, action: 'vocabulary' }
    if (/口语|说英语/.test(msgLower)) return { agent: AGENT_TYPES.ENGLISH, action: 'speaking' }
    if (/对话|情景/.test(msgLower)) return { agent: AGENT_TYPES.ENGLISH, action: 'dialogue' }
    return { agent: AGENT_TYPES.ENGLISH, action: 'general' }
  }
  
  // 生活技能相关
  if (/整理|房间|打扫|刷牙|洗护|时间|情绪|管理|生活习惯/.test(msgLower)) {
    if (/整理|打扫|房间/.test(msgLower)) return { agent: AGENT_TYPES.LIFE, action: 'cleaning' }
    if (/刷牙|洗护|卫生/.test(msgLower)) return { agent: AGENT_TYPES.LIFE, action: 'hygiene' }
    if (/时间/.test(msgLower)) return { agent: AGENT_TYPES.LIFE, action: 'time_management' }
    if (/情绪/.test(msgLower)) return { agent: AGENT_TYPES.LIFE, action: 'emotion_management' }
    return { agent: AGENT_TYPES.LIFE, action: 'general' }
  }
  
  // 默认返回主界面Agent选择
  return { agent: AGENT_TYPES.COORDINATOR, action: 'select_agent' }
}

// ============================================================================
// 任务转介处理
// ============================================================================

const handleTransfer = async (toAgent, originalRequest, originalResponse) => {
  const transferMsg = createTransferMessage(
    originalRequest.metadata.agentType,
    toAgent,
    originalRequest.payload,
    conversationContext
  )
  
  let response
  switch (toAgent) {
    case AGENT_TYPES.MATH:
      response = await mathAgent.handleTransfer(transferMsg)
      break
    case AGENT_TYPES.CHINESE:
      response = await chineseAgent.handleTransfer(transferMsg)
      break
    case AGENT_TYPES.ENGLISH:
      response = await englishAgent.handleTransfer(transferMsg)
      break
    case AGENT_TYPES.LIFE:
      response = await lifeAgent.handleTransfer(transferMsg)
      break
    default:
      response = createResponse(originalRequest.id, false, null, { code: 'TRANSFER_FAILED', message: '转介失败' })
  }
  
  return response
}

// ============================================================================
// 上下文管理
// ============================================================================

const updateContext = (contextUpdate) => {
  if (contextUpdate.sessionId) conversationContext.sessionId = contextUpdate.sessionId
  if (contextUpdate.childProfile) conversationContext.childProfile = contextUpdate.childProfile
  if (contextUpdate.difficultyLevel) conversationContext.difficultyLevel = contextUpdate.difficultyLevel
}

export const getConversationContext = () => {
  return { ...conversationContext }
}

export const clearConversationContext = () => {
  conversationContext.sessionId = null
  conversationContext.recentTopics = []
  conversationContext.taskQueue = []
  conversationContext.activeAgent = null
  conversationContext.learningHistory = []
}

// ============================================================================
// 学习历史管理
// ============================================================================

const updateLearningHistory = (agentType, action, data) => {
  conversationContext.learningHistory.push({
    agentType,
    action,
    data,
    timestamp: Date.now()
  })
  
  // 更新最近主题
  if (!conversationContext.recentTopics.includes(action)) {
    conversationContext.recentTopics.push(action)
    if (conversationContext.recentTopics.length > 10) {
      conversationContext.recentTopics.shift()
    }
  }
}

// ============================================================================
// 跨Agent任务编排
// ============================================================================

export const orchestrateMultiAgentTask = async (taskSequence) => {
  const results = []
  
  for (const task of taskSequence) {
    const request = createRequest(task.agent, task.action, task.data)
    
    let response
    switch (task.agent) {
      case AGENT_TYPES.MATH:
        response = await mathAgent.handleRequest(request)
        break
      case AGENT_TYPES.CHINESE:
        response = await chineseAgent.handleRequest(request)
        break
      case AGENT_TYPES.ENGLISH:
        response = await englishAgent.handleRequest(request)
        break
      case AGENT_TYPES.LIFE:
        response = await lifeAgent.handleRequest(request)
        break
    }
    
    results.push(response)
    
    // 如果任务失败，停止执行
    if (!response.success) break
  }
  
  return results
}

// ============================================================================
// 获取Agent状态
// ============================================================================

export const getAgentStatus = () => {
  return {
    coordinator: {
      active: true,
      context: { ...conversationContext }
    },
    math: mathAgent ? { active: true } : { active: false },
    chinese: chineseAgent ? { active: true } : { active: false },
    english: englishAgent ? { active: true } : { active: false },
    life: lifeAgent ? { active: true } : { active: false }
  }
}

// ============================================================================
// 导出Coordinator单例
// ============================================================================

export const AgentCoordinator = {
  initialize: initializeAgents,
  routeRequest,
  getConversationContext,
  clearConversationContext,
  orchestrateMultiAgentTask,
  getAgentStatus
}

export default AgentCoordinator