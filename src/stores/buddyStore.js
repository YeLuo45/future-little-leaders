// src/stores/buddyStore.js
// V34 AI Companion Buddy Store - 管理 AI 伙伴状态、心情和对话

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  chatWithBuddy,
  detectMood,
  generateEncouragement,
  checkSpecialResponse,
  updateContext,
  extractContextInfo,
  MOODS
} from '@/services/aiCompanionService.js'

// 对话上下文最大长度
const MAX_CONTEXT_LENGTH = 10

// 心情历史最大保存数
const MAX_MOOD_HISTORY = 20

export const useBuddyStore = defineStore('buddy', () => {
  // ==================== 状态 ====================

  // 伙伴配置
  const buddyConfig = ref({
    name: '小伙伴',
    emoji: '🤖',
    level: 1,
    accessoryType: '' // star, crown, bow
  })

  // 当前心情
  const currentMood = ref('happy')

  // 当前表情
  const currentExpression = ref('smile')

  // 心情历史
  const moodHistory = ref([])

  // 对话消息列表
  const chatMessages = ref([])

  // 对话上下文
  const chatContext = ref([])

  // 是否正在回复
  const isReplying = ref(false)

  // 是否展开
  const isExpanded = ref(false)

  // 是否显示鼓励
  const showEncouragement = ref(false)

  // 当前鼓励语
  const currentEncouragement = ref('')

  // 成就解锁动画
  const currentAnimation = ref('')

  // 错误信息
  const errorMessage = ref('')

  // ==================== 计算属性 ====================

  // 是否有未读消息
  const hasUnread = computed(() => {
    return chatMessages.value.some(m => !m.read && m.role === 'ai')
  })

  // 最新消息
  const latestMessage = computed(() => {
    if (chatMessages.value.length === 0) return null
    return chatMessages.value[chatMessages.value.length - 1]
  })

  // 心情统计
  const moodStats = computed(() => {
    const stats = {}
    moodHistory.value.forEach(item => {
      stats[item.mood] = (stats[item.mood] || 0) + 1
    })
    return stats
  })

  // 是否显示心情追踪
  const shouldShowMoodTracker = computed(() => {
    return moodHistory.value.length > 0
  })

  // ==================== 方法 ====================

  /**
   * 发送消息
   */
  async function sendMessage(content) {
    if (!content || !content.trim()) return false

    const text = content.trim()

    // 添加用户消息
    const userMsg = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      read: true
    }
    chatMessages.value.push(userMsg)

    // 更新上下文
    chatContext.value.push({
      role: 'user',
      content: text
    })

    // 限制上下文长度
    if (chatContext.value.length > MAX_CONTEXT_LENGTH * 2) {
      chatContext.value = chatContext.value.slice(-MAX_CONTEXT_LENGTH * 2)
    }

    isReplying.value = true
    errorMessage.value = ''

    try {
      // 调用 AI 服务
      const response = await simulateAIResponse(text, chatContext.value)

      // 检测心情变化
      const moodResult = detectMood(text)
      if (moodResult.confidence > 0.5) {
        updateMood(moodResult.mood)
      }

      // 添加 AI 消息
      const aiMsg = {
        id: generateId(),
        role: 'ai',
        content: response.reply,
        timestamp: new Date().toISOString(),
        actions: response.actions || [],
        read: false
      }
      chatMessages.value.push(aiMsg)

      // 更新上下文
      chatContext.value.push({
        role: 'ai',
        content: response.reply
      })

      // 更新表情
      updateExpression(response.mood)

      // 处理特殊回应
      handleSpecialResponse(response)

      // 更新当前鼓励语
      if (response.mood === 'sad' || response.mood === 'worried') {
        showEncouragement.value = true
        currentEncouragement.value = response.reply
      }

      return true
    } catch (e) {
      console.error('[BuddyStore] Failed to send message:', e)
      errorMessage.value = '发送失败，请稍后重试'

      // 添加错误消息
      chatMessages.value.push({
        id: generateId(),
        role: 'ai',
        content: '抱歉，我遇到了一些问题，请稍后再试。',
        timestamp: new Date().toISOString(),
        isError: true,
        read: false
      })

      return false
    } finally {
      isReplying.value = false
    }
  }

  /**
   * 模拟 AI 响应（异步包装）
   */
  async function simulateAIResponse(text, context) {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        const result = chatWithBuddy(text, context)
        resolve(result)
      }, 500 + Math.random() * 500)
    })
  }

  /**
   * 快速回复
   */
  async function sendQuickReply(reply) {
    return sendMessage(reply)
  }

  /**
   * 更新心情
   */
  function updateMood(mood) {
    const prevMood = currentMood.value
    currentMood.value = mood

    // 记录心情历史
    moodHistory.value.push({
      mood,
      timestamp: new Date().toISOString()
    })

    // 限制历史长度
    if (moodHistory.value.length > MAX_MOOD_HISTORY) {
      moodHistory.value = moodHistory.value.slice(-MAX_MOOD_HISTORY)
    }

    // 持久化（可选）
    saveMoodHistory()
  }

  /**
   * 更新表情
   */
  function updateExpression(mood) {
    const expressionMap = {
      happy: 'smile',
      encouraging: 'smile',
      excited: 'laugh',
      calm: 'smile',
      sad: 'worried',
      worried: 'worried'
    }
    currentExpression.value = expressionMap[mood] || 'smile'
  }

  /**
   * 处理特殊回应（成就、解锁等）
   */
  function handleSpecialResponse(response) {
    // 根据心情设置动画
    if (response.mood === 'excited') {
      currentAnimation.value = 'cheer'
    } else if (response.mood === 'happy') {
      currentAnimation.value = 'clap'
    }

    // 动画自动清除
    if (currentAnimation.value) {
      setTimeout(() => {
        currentAnimation.value = ''
      }, 2000)
    }
  }

  /**
   * 触发成就庆祝
   */
  function celebrateAchievement(achievementName) {
    // 更新鼓励语
    currentEncouragement.value = generateEncouragement('', 'achievementUnlock', {
      achievementName
    })
    showEncouragement.value = true

    // 更新心情和表情
    updateMood('excited')
    currentExpression.value = 'laugh'
    currentAnimation.value = 'cheer'

    // 清除动画
    setTimeout(() => {
      currentAnimation.value = ''
    }, 2000)
  }

  /**
   * 触发连续打卡鼓励
   */
  function encourageStreak(days) {
    currentEncouragement.value = generateEncouragement('', 'streakContinue', { days })
    showEncouragement.value = true

    // 更新心情
    updateMood('excited')
    currentAnimation.value = 'clap'

    setTimeout(() => {
      currentAnimation.value = ''
    }, 2000)
  }

  /**
   * 任务完成鼓励
   */
  function encourageTaskComplete(taskName) {
    currentEncouragement.value = generateEncouragement('', 'taskComplete', { taskName })
    showEncouragement.value = true
  }

  /**
   * 展开聊天
   */
  function expand() {
    isExpanded.value = true
    // 标记所有消息已读
    chatMessages.value.forEach(m => {
      m.read = true
    })
  }

  /**
   * 折叠聊天
   */
  function collapse() {
    isExpanded.value = false
  }

  /**
   * 清空对话
   */
  function clearChat() {
    chatMessages.value = []
    chatContext.value = []
    errorMessage.value = ''
  }

  /**
   * 隐藏鼓励提示
   */
  function hideEncouragement() {
    showEncouragement.value = false
    currentEncouragement.value = ''
  }

  /**
   * 标记消息已读
   */
  function markAsRead(messageId) {
    const msg = chatMessages.value.find(m => m.id === messageId)
    if (msg) {
      msg.read = true
    }
  }

  /**
   * 标记所有消息已读
   */
  function markAllAsRead() {
    chatMessages.value.forEach(m => {
      m.read = true
    })
  }

  /**
   * 设置伙伴配置
   */
  function setBuddyConfig(config) {
    buddyConfig.value = {
      ...buddyConfig.value,
      ...config
    }
  }

  /**
   * 保存心情历史
   */
  function saveMoodHistory() {
    try {
      uni.setStorageSync('buddy_mood_history', moodHistory.value)
    } catch (e) {
      console.error('[BuddyStore] Failed to save mood history:', e)
    }
  }

  /**
   * 加载心情历史
   */
  function loadMoodHistory() {
    try {
      const history = uni.getStorageSync('buddy_mood_history')
      if (Array.isArray(history)) {
        moodHistory.value = history
      }
    } catch (e) {
      console.error('[BuddyStore] Failed to load mood history:', e)
    }
  }

  /**
   * 重置所有状态
   */
  function reset() {
    currentMood.value = 'happy'
    currentExpression.value = 'smile'
    chatMessages.value = []
    chatContext.value = []
    isReplying.value = false
    isExpanded.value = false
    showEncouragement.value = false
    currentEncouragement.value = ''
    currentAnimation.value = ''
    errorMessage.value = ''
  }

  // ==================== 初始化 ====================

  const init = () => {
    loadMoodHistory()
  }

  // 自动初始化
  init()

  return {
    // 状态
    buddyConfig,
    currentMood,
    currentExpression,
    moodHistory,
    chatMessages,
    chatContext,
    isReplying,
    isExpanded,
    showEncouragement,
    currentEncouragement,
    currentAnimation,
    errorMessage,

    // 计算属性
    hasUnread,
    latestMessage,
    moodStats,
    shouldShowMoodTracker,

    // 方法
    sendMessage,
    sendQuickReply,
    updateMood,
    updateExpression,
    celebrateAchievement,
    encourageStreak,
    encourageTaskComplete,
    expand,
    collapse,
    clearChat,
    hideEncouragement,
    markAsRead,
    markAllAsRead,
    setBuddyConfig,
    loadMoodHistory,
    reset,
    init
  }
})
