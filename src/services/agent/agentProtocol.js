/**
 * V101 Agent Protocol
 * Multi-Agent Orchestration Protocol - JSON消息定义、任务转介机制、上下文传递
 */

// ============================================================================
// 消息类型定义
// ============================================================================

export const MESSAGE_TYPES = {
  // 基础消息类型
  REQUEST: 'request',
  RESPONSE: 'response',
  TRANSFER: 'transfer',        // 任务转介
  CONTEXT_UPDATE: 'context_update',
  HEARTBEAT: 'heartbeat',
  
  // 任务相关
  TASK_INIT: 'task_init',
  TASK_PROGRESS: 'task_progress',
  TASK_COMPLETE: 'task_complete',
  TASK_FAILED: 'task_failed',
  
  // 学习相关
  LEARNING_START: 'learning_start',
  LEARNING_NEXT: 'learning_next',
  LEARNING_FEEDBACK: 'learning_feedback',
  LEARNING_REVIEW: 'learning_review'  // 错题重练
}

// ============================================================================
// Agent类型定义
// ============================================================================

export const AGENT_TYPES = {
  COORDINATOR: 'coordinator',
  MATH: 'math',
  CHINESE: 'chinese',
  ENGLISH: 'english',
  LIFE: 'life'
}

// ============================================================================
// 任务优先级
// ============================================================================

export const TASK_PRIORITY = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  URGENT: 3
}

// ============================================================================
// 消息结构定义
// ============================================================================

export const createMessage = (type, payload, metadata = {}) => {
  return {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    type,
    payload,
    metadata: {
      timestamp: Date.now(),
      version: '1.0.0',
      ...metadata
    }
  }
}

// ============================================================================
// 请求消息创建
// ============================================================================

export const createRequest = (agentType, action, data = {}, options = {}) => {
  return createMessage(MESSAGE_TYPES.REQUEST, {
    agentType,
    action,
    data,
    options: {
      priority: TASK_PRIORITY.NORMAL,
      timeout: 30000,
      retry: 0,
      ...options
    }
  }, { agentType })
}

// ============================================================================
// 响应消息创建
// ============================================================================

export const createResponse = (requestId, success, data = {}, error = null) => {
  return createMessage(MESSAGE_TYPES.RESPONSE, {
    requestId,
    success,
    data,
    error: error ? { code: error.code || 'UNKNOWN', message: error.message } : null
  })
}

// ============================================================================
// 任务转介消息创建
// ============================================================================

export const createTransferMessage = (fromAgent, toAgent, task, context = {}) => {
  return createMessage(MESSAGE_TYPES.TRANSFER, {
    fromAgent,
    toAgent,
    task,
    context,
    reason: task.transferReason || 'TASK_TRANSFER'
  }, { fromAgent, toAgent })
}

// ============================================================================
// 上下文更新消息
// ============================================================================

export const createContextUpdate = (agentType, contextDelta) => {
  return createMessage(MESSAGE_TYPES.CONTEXT_UPDATE, {
    agentType,
    contextDelta
  })
}

// ============================================================================
// 学习反馈消息
// ============================================================================

export const createLearningFeedback = (agentType, taskId, isCorrect, data = {}) => {
  return createMessage(MESSAGE_TYPES.LEARNING_FEEDBACK, {
    agentType,
    taskId,
    isCorrect,
    data: {
      timestamp: Date.now(),
      ...data
    }
  })
}

// ============================================================================
// 难度级别定义
// ============================================================================

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',     // 简单
  INTERMEDIATE: 'intermediate', // 中等
  ADVANCED: 'advanced',     // 困难
  EXPERT: 'expert'         // 专家
}

// ============================================================================
// 学习主题定义
// ============================================================================

export const LEARNING_THEMES = {
  // Math
  MATH_ADD: { agent: AGENT_TYPES.MATH, topic: 'addition', name: '加法' },
  MATH_SUB: { agent: AGENT_TYPES.MATH, topic: 'subtraction', name: '减法' },
  MATH_MUL: { agent: AGENT_TYPES.MATH, topic: 'multiplication', name: '乘法' },
  MATH_DIV: { agent: AGENT_TYPES.MATH, topic: 'division', name: '除法' },
  
  // Chinese
  CHINESE_PINYIN: { agent: AGENT_TYPES.CHINESE, topic: 'pinyin', name: '拼音' },
  CHINESE_CHAR: { agent: AGENT_TYPES.CHINESE, topic: 'characters', name: '识字' },
  CHINESE_STROKE: { agent: AGENT_TYPES.CHINESE, topic: 'stroke_order', name: '笔画顺序' },
  
  // English
  ENGLISH_VOCAB: { agent: AGENT_TYPES.ENGLISH, topic: 'vocabulary', name: '单词' },
  ENGLISH_SPEAK: { agent: AGENT_TYPES.ENGLISH, topic: 'speaking', name: '口语' },
  ENGLISH_DIALOG: { agent: AGENT_TYPES.ENGLISH, topic: 'dialogue', name: '情景对话' },
  
  // Life Skills
  LIFE_CLEAN: { agent: AGENT_TYPES.LIFE, topic: 'cleaning', name: '整理房间' },
  LIFE_HYGIENE: { agent: AGENT_TYPES.LIFE, topic: 'hygiene', name: '刷牙洗护' },
  LIFE_TIME: { agent: AGENT_TYPES.LIFE, topic: 'time_management', name: '时间管理' },
  LIFE_EMOTION: { agent: AGENT_TYPES.LIFE, topic: 'emotion_management', name: '情绪管理' }
}

// ============================================================================
// 任务状态定义
// ============================================================================

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
}

// ============================================================================
// 工具函数
// ============================================================================

export const isValidMessage = (msg) => {
  return msg && 
         msg.id && 
         msg.type && 
         msg.payload &&
         msg.metadata &&
         msg.metadata.timestamp
}

export const getMessagePriority = (msg) => {
  return msg?.payload?.options?.priority || TASK_PRIORITY.NORMAL
}

export const cloneMessage = (msg) => {
  return JSON.parse(JSON.stringify(msg))
}