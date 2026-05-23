/**
 * V101 Agent Store
 * Agent状态管理、对话历史、任务状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AgentCoordinator, initializeAgents } from '../services/agent/agentCoordinator.js'
import { AGENT_TYPES, MESSAGE_TYPES } from '../services/agent/agentProtocol.js'

export const useAgentStore = defineStore('agent', () => {
  // =========================================================================
  // 状态
  // =========================================================================

  // Agent初始化状态
  const isInitialized = ref(false)
  const initializationError = ref(null)

  // 当前选中的Agent
  const currentAgent = ref(null)

  // 对话历史
  const conversationHistory = ref([])

  // 任务队列
  const taskQueue = ref([])

  // 当前任务状态
  const currentTask = ref(null)

  // Agent状态映射
  const agentStatuses = ref({
    coordinator: { active: false },
    math: { active: false },
    chinese: { active: false },
    english: { active: false },
    life: { active: false }
  })

  // 加载状态
  const isLoading = ref(false)

  // 错误信息
  const errorMessage = ref(null)

  // =========================================================================
  // 计算属性
  // =========================================================================

  const recentConversations = computed(() => {
    return conversationHistory.value.slice(-20)
  })

  const pendingTasks = computed(() => {
    return taskQueue.value.filter(t => t.status === 'pending')
  })

  const completedTasks = computed(() => {
    return taskQueue.value.filter(t => t.status === 'completed')
  })

  const hasActiveTask = computed(() => {
    return currentTask.value !== null && currentTask.value.status === 'in_progress'
  })

  const activeAgentName = computed(() => {
    const agentNames = {
      [AGENT_TYPES.COORDINATOR]: '智能助手',
      [AGENT_TYPES.MATH]: '数学Agent',
      [AGENT_TYPES.CHINESE]: '语文Agent',
      [AGENT_TYPES.ENGLISH]: '英语Agent',
      [AGENT_TYPES.LIFE]: '生活Agent'
    }
    return currentAgent.value ? agentNames[currentAgent.value] || currentAgent.value : null
  })

  // =========================================================================
  // 初始化
  // =========================================================================

  const initialize = async () => {
    if (isInitialized.value) return

    isLoading.value = true
    errorMessage.value = null

    try {
      await AgentCoordinator.initialize()
      isInitialized.value = true
      
      // 更新Agent状态
      const status = AgentCoordinator.getAgentStatus()
      agentStatuses.value = status
    } catch (error) {
      initializationError.value = error.message
      console.error('Agent初始化失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // =========================================================================
  // 选择Agent
  // =========================================================================

  const selectAgent = (agentType) => {
    currentAgent.value = agentType
    addToHistory({
      type: 'system',
      agent: agentType,
      message: `已选择${activeAgentName.value}`,
      timestamp: Date.now()
    })
  }

  // =========================================================================
  // 发送消息
  // =========================================================================

  const sendMessage = async (message) => {
    if (!message || !message.trim()) {
      errorMessage.value = '消息不能为空'
      return null
    }

    isLoading.value = true
    errorMessage.value = null

    // 添加用户消息到历史
    addToHistory({
      type: 'user',
      message,
      timestamp: Date.now()
    })

    try {
      const response = await AgentCoordinator.routeRequest(message, {
        sessionId: getSessionId(),
        currentAgent: currentAgent.value
      })

      // 添加AI响应到历史
      addToHistory({
        type: 'ai',
        agent: response.metadata?.agentType,
        message: response.payload,
        success: response.success,
        timestamp: Date.now()
      })

      // 更新任务状态
      if (response.payload?.taskId) {
        updateTaskStatus(response.payload.taskId, response)
      }

      return response
    } catch (error) {
      errorMessage.value = error.message
      addToHistory({
        type: 'error',
        message: error.message,
        timestamp: Date.now()
      })
      return null
    } finally {
      isLoading.value = false
    }
  }

  // =========================================================================
  // 对话历史管理
  // =========================================================================

  const addToHistory = (entry) => {
    conversationHistory.value.push({
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      ...entry
    })

    // 保持历史记录在合理范围内
    if (conversationHistory.value.length > 100) {
      conversationHistory.value = conversationHistory.value.slice(-100)
    }
  }

  const clearHistory = () => {
    conversationHistory.value = []
  }

  // =========================================================================
  // 任务管理
  // =========================================================================

  const addTask = (task) => {
    const taskEntry = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: Date.now(),
      ...task
    }
    taskQueue.value.push(taskEntry)
    return taskEntry.id
  }

  const updateTaskStatus = (taskId, response) => {
    const task = taskQueue.value.find(t => t.id === taskId)
    if (task) {
      task.status = response.success ? 'completed' : 'failed'
      task.response = response
      task.completedAt = Date.now()
    }
  }

  const getTaskById = (taskId) => {
    return taskQueue.value.find(t => t.id === taskId)
  }

  // =========================================================================
  // Session管理
  // =========================================================================

  const getSessionId = () => {
    let sessionId = uni.getStorageSync('agent_session_id')
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      uni.setStorageSync('agent_session_id', sessionId)
    }
    return sessionId
  }

  const clearSession = () => {
    AgentCoordinator.clearConversationContext()
    clearHistory()
    taskQueue.value = []
    currentTask.value = null
    uni.removeStorageSync('agent_session_id')
  }

  // =========================================================================
  // Agent状态获取
  // =========================================================================

  const refreshAgentStatus = () => {
    if (isInitialized.value) {
      agentStatuses.value = AgentCoordinator.getAgentStatus()
    }
  }

  // =========================================================================
  // 多Agent任务编排
  // =========================================================================

  const orchestrateMultiAgent = async (taskSequence) => {
    if (!isInitialized.value) {
      await initialize()
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const results = await AgentCoordinator.orchestrateMultiAgentTask(taskSequence)
      
      results.forEach((response, index) => {
        addToHistory({
          type: 'ai',
          agent: taskSequence[index].agent,
          message: response.payload,
          success: response.success,
          timestamp: Date.now()
        })
      })

      return results
    } catch (error) {
      errorMessage.value = error.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  // =========================================================================
  // 导出状态
  // =========================================================================

  return {
    // 状态
    isInitialized,
    initializationError,
    currentAgent,
    conversationHistory,
    taskQueue,
    currentTask,
    agentStatuses,
    isLoading,
    errorMessage,

    // 计算属性
    recentConversations,
    pendingTasks,
    completedTasks,
    hasActiveTask,
    activeAgentName,

    // 方法
    initialize,
    selectAgent,
    sendMessage,
    addToHistory,
    clearHistory,
    addTask,
    updateTaskStatus,
    getTaskById,
    getSessionId,
    clearSession,
    refreshAgentStatus,
    orchestrateMultiAgent
  }
})

export default useAgentStore