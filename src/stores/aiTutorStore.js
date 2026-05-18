// src/stores/aiTutorStore.js
// V36 AI Tutor Store - Multi-Agent Collaborative Learning State Management

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  executePipeline,
  createSession,
  saveSession,
  loadAllSessions,
  deleteSession,
  getSessionHistory,
  saveLearningRecord,
  getLearningRecords,
  getAgentConfig,
  getEnabledAgents,
  AGENT_CONFIGS,
  AGENT_TYPES,
  TUTOR_MOODS
} from '@/services/aiTutorService.js'

// 对话上下文最大长度
const MAX_CONTEXT_LENGTH = 10

// 最大历史会话数
const MAX_HISTORY_SESSIONS = 20

export const useAITutorStore = defineStore('aiTutor', () => {
  // ==================== 状态 ====================

  // 当前会话
  const currentSession = ref(null)

  // 消息列表
  const messages = ref([])

  // 对话上下文（用于AI处理）
  const chatContext = ref([])

  // Agent配置
  const agentConfigs = ref({...AGENT_CONFIGS})

  // 历史会话列表
  const historySessions = ref([])

  // 学习记录
  const learningRecords = ref([])

  // 是否正在处理
  const isProcessing = ref(false)

  // 当前活跃Agent
  const activeAgentId = ref('orchestrator')

  // 管道状态
  const pipelineStatus = ref('idle')  // idle | pending | processing | completed

  // 错误信息
  const errorMessage = ref('')

  // ==================== 计算属性 ====================

  // 是否有历史会话
  const hasHistory = computed(() => historySessions.value.length > 0)

  // 活跃Agent列表
  const activeAgents = computed(() => {
    return Object.values(agentConfigs.value).filter(config => config.enabled)
  })

  // 参与协作的Agent
  const participatingAgents = computed(() => {
    if (!currentSession.value?.agents) return []
    return currentSession.value.agents.map(id => agentConfigs.value[id]).filter(Boolean)
  })

  // 是否有未完成的处理
  const isHandling = computed(() => isProcessing.value || pipelineStatus.value === 'processing')

  // 最新消息
  const latestMessage = computed(() => {
    if (messages.value.length === 0) return null
    return messages.value[messages.value.length - 1]
  })

  // 学习统计
  const learningStats = computed(() => {
    const records = learningRecords.value
    const stats = {
      totalSessions: historySessions.value.length,
      totalInteractions: records.length,
      byAgent: {},
      recentTopics: []
    }

    // 按Agent统计
    records.forEach(record => {
      if (!stats.byAgent[record.agentId]) {
        stats.byAgent[record.agentId] = 0
      }
      stats.byAgent[record.agentId]++
    })

    // 最近话题
    const recentRecords = records.slice(-10)
    stats.recentTopics = recentRecords.map(r => r.topic).filter(Boolean)

    return stats
  })

  // ==================== 核心方法 ====================

  /**
   * 初始化Store
   */
  function init() {
    loadHistorySessions()
    loadLearningRecords()
    loadAgentConfigs()
  }

  /**
   * 发送消息并获取AI回复
   */
  async function sendMessage(content) {
    if (!content || !content.trim()) return false
    if (isProcessing.value) return false

    const text = content.trim()

    // 添加用户消息
    const userMsg = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      agentId: null
    }
    messages.value.push(userMsg)

    // 更新上下文
    chatContext.value.push({
      role: 'user',
      content: text
    })

    // 限制上下文长度
    if (chatContext.value.length > MAX_CONTEXT_LENGTH * 2) {
      chatContext.value = chatContext.value.slice(-MAX_CONTEXT_LENGTH * 2)
    }

    // 设置处理状态
    isProcessing.value = true
    pipelineStatus.value = 'processing'
    errorMessage.value = ''

    try {
      // 调用管道执行
      const result = await executePipeline(text, chatContext.value)

      // 添加AI回复消息
      const aiMsg = {
        id: generateId(),
        role: result.agentId || 'orchestrator',
        agentId: result.agentId,
        content: result.reply,
        timestamp: new Date().toISOString(),
        steps: result.steps || [],
        actions: result.actions || [],
        mood: result.mood || TUTOR_MOODS.CALM,
        collaborative: result.collaborative || false,
        participatingAgents: result.participatingAgents || []
      }
      messages.value.push(aiMsg)

      // 更新上下文
      chatContext.value.push({
        role: result.agentId || 'ai',
        content: result.reply
      })

      // 更新活跃Agent
      activeAgentId.value = result.agentId || 'orchestrator'

      // 更新会话
      if (currentSession.value) {
        currentSession.value.messages = [...messages.value]
        saveSession(currentSession.value)
      }

      // 保存学习记录
      saveLearningRecord({
        sessionId: currentSession.value?.id,
        babyId: currentSession.value?.babyId,
        agentId: result.agentId,
        topic: text.substring(0, 50),
        interactionType: 'question',
        content: text
      })

      return true
    } catch (e) {
      console.error('[AITutorStore] Failed to process message:', e)
      errorMessage.value = '处理失败，请稍后重试'

      // 添加错误消息
      messages.value.push({
        id: generateId(),
        role: 'orchestrator',
        agentId: 'orchestrator',
        content: '抱歉，我遇到了一些问题，请稍后再试。',
        timestamp: new Date().toISOString(),
        isError: true
      })

      return false
    } finally {
      isProcessing.value = false
      pipelineStatus.value = 'completed'

      // 延迟重置状态
      setTimeout(() => {
        pipelineStatus.value = 'idle'
      }, 500)
    }
  }

  /**
   * 快速回复
   */
  async function sendQuickReply(reply) {
    return sendMessage(reply)
  }

  /**
   * 创建新会话
   */
  function startNewSession(babyId, initialMessage = '') {
    // 创建新会话
    const session = createSession(babyId, initialMessage)
    currentSession.value = session

    // 重置消息和上下文
    messages.value = [...session.messages]
    chatContext.value = []

    // 如果有初始消息，处理它
    if (initialMessage) {
      // 初始消息已在createSession中处理，这里只更新上下文
      chatContext.value.push({
        role: 'user',
        content: initialMessage
      })
    }

    // 保存会话
    saveSession(session)

    // 更新历史列表
    loadHistorySessions()

    return session
  }

  /**
   * 恢复历史会话
   */
  function resumeSession(sessionId) {
    const session = getSessionHistory(sessionId)
    if (!session) {
      errorMessage.value = '会话不存在'
      return false
    }

    currentSession.value = session
    messages.value = [...session.messages]

    // 重建上下文（只包含用户消息和AI回复的content）
    chatContext.value = session.messages
      .filter(m => m.role === 'user' || (m.role !== 'user' && !m.role.startsWith('user')))
      .slice(-MAX_CONTEXT_LENGTH * 2)
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'ai',
        content: m.content
      }))

    return true
  }

  /**
   * 结束当前会话
   */
  function endSession() {
    if (currentSession.value) {
      currentSession.value.status = 'completed'
      currentSession.value.updatedAt = new Date().toISOString()
      saveSession(currentSession.value)
    }

    // 重置状态
    currentSession.value = null
    messages.value = []
    chatContext.value = []
    activeAgentId.value = 'orchestrator'
    pipelineStatus.value = 'idle'
  }

  /**
   * 清空对话
   */
  function clearChat() {
    messages.value = []
    chatContext.value = []

    // 保留会话但清空消息
    if (currentSession.value) {
      currentSession.value.messages = []
      saveSession(currentSession.value)
    }
  }

  /**
   * 删除历史会话
   */
  function removeHistorySession(sessionId) {
    deleteSession(sessionId)
    loadHistorySessions()

    // 如果删除的是当前会话，结束它
    if (currentSession.value?.id === sessionId) {
      endSession()
    }
  }

  // ==================== Agent配置方法 ====================

  /**
   * 切换Agent启用状态
   */
  function toggleAgent(agentId) {
    if (agentConfigs.value[agentId]) {
      agentConfigs.value[agentId].enabled = !agentConfigs.value[agentId].enabled
      saveAgentConfigs()
    }
  }

  /**
   * 更新Agent配置
   */
  function updateAgentConfig(agentId, config) {
    if (agentConfigs.value[agentId]) {
      agentConfigs.value[agentId] = {
        ...agentConfigs.value[agentId],
        ...config
      }
      saveAgentConfigs()
    }
  }

  /**
   * 重置Agent配置
   */
  function resetAgentConfigs() {
    agentConfigs.value = {...AGENT_CONFIGS}
    saveAgentConfigs()
  }

  // ==================== 持久化方法 ====================

  /**
   * 加载历史会话
   */
  function loadHistorySessions() {
    const sessions = loadAllSessions()
    // 按更新时间排序，取最新的
    historySessions.value = sessions
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, MAX_HISTORY_SESSIONS)
  }

  /**
   * 加载学习记录
   */
  function loadLearningRecords() {
    learningRecords.value = getLearningRecords()
  }

  /**
   * 加载Agent配置
   */
  function loadAgentConfigs() {
    try {
      const stored = uni.getStorageSync('tutor_agents_config')
      if (stored) {
        const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored
        agentConfigs.value = { ...AGENT_CONFIGS, ...parsed }
      }
    } catch (e) {
      console.error('[AITutorStore] Failed to load agent configs:', e)
    }
  }

  /**
   * 保存Agent配置
   */
  function saveAgentConfigs() {
    try {
      uni.setStorageSync('tutor_agents_config', JSON.stringify(agentConfigs.value))
    } catch (e) {
      console.error('[AITutorStore] Failed to save agent configs:', e)
    }
  }

  // ==================== 辅助方法 ====================

  /**
   * 生成唯一ID
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  /**
   * 获取Agent头像信息
   */
  function getAgentAvatar(agentId) {
    const config = agentConfigs.value[agentId]
    if (!config) return null
    return {
      id: config.id,
      name: config.name,
      emoji: config.emoji,
      personality: config.personality
    }
  }

  /**
   * 获取Agent欢迎语
   */
  function getAgentWelcome(agentId) {
    const config = agentConfigs.value[agentId]
    return config?.welcomeMsg || '你好！'
  }

  /**
   * 标记消息已读
   */
  function markAsRead(messageId) {
    const msg = messages.value.find(m => m.id === messageId)
    if (msg) {
      msg.read = true
    }
  }

  /**
   * 重置所有状态
   */
  function reset() {
    currentSession.value = null
    messages.value = []
    chatContext.value = []
    isProcessing.value = false
    activeAgentId.value = 'orchestrator'
    pipelineStatus.value = 'idle'
    errorMessage.value = ''
  }

  // ==================== 初始化 ====================

  // 自动初始化
  init()

  // ==================== 导出 ====================

  return {
    // 状态
    currentSession,
    messages,
    chatContext,
    agentConfigs,
    historySessions,
    learningRecords,
    isProcessing,
    activeAgentId,
    pipelineStatus,
    errorMessage,

    // 计算属性
    hasHistory,
    activeAgents,
    participatingAgents,
    isHandling,
    latestMessage,
    learningStats,

    // 核心方法
    sendMessage,
    sendQuickReply,
    startNewSession,
    resumeSession,
    endSession,
    clearChat,
    removeHistorySession,

    // Agent配置
    toggleAgent,
    updateAgentConfig,
    resetAgentConfigs,

    // 辅助方法
    getAgentAvatar,
    getAgentWelcome,
    markAsRead,

    // 生命周期
    init,
    reset
  }
})
