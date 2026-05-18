// src/stores/aiRecommendStore.js
// V19 AI 推荐引擎 Store - 管理推荐状态和对话上下文

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getRecommendations,
  chatWithAI,
  generateSchedule,
  getDifficultyLevel,
  recordRecommendationFeedback
} from '@/services/aiRecommendService.js'
import { useBabyStore } from './babyStore.js'

// 对话上下文最大长度
const MAX_CONTEXT_LENGTH = 5

export const useAIRecommendStore = defineStore('aiRecommend', () => {
  // ==================== 状态 ====================

  // 推荐任务列表
  const recommendations = ref([])

  // 推荐刷新时间
  const nextRefreshTime = ref(0)

  // 加载状态
  const isLoading = ref(false)

  // AI 对话消息列表
  const chatMessages = ref([])

  // 对话上下文（保留最近5轮）
  const chatContext = ref([])

  // 当前日程安排
  const currentSchedule = ref(null)

  // 错误信息
  const errorMessage = ref('')

  // ==================== 计算属性 ====================

  // 是否有推荐
  const hasRecommendations = computed(() => recommendations.value.length > 0)

  // 是否可以刷新推荐
  const canRefresh = computed(() => Date.now() >= nextRefreshTime.value)

  // AI 是否正在回复
  const isAIReplying = computed(() => isLoading.value && chatMessages.value.length > 0)

  // 推荐任务总数
  const totalRecommendedPoints = computed(() => {
    return recommendations.value.reduce((sum, t) => sum + (t.points || 0), 0)
  })

  // ==================== 方法 ====================

  /**
   * 加载推荐任务
   */
  async function loadRecommendations() {
    const babyStore = useBabyStore()
    if (!babyStore.currentBabyId) {
      errorMessage.value = '请先选择宝宝'
      return false
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const result = await getRecommendations(babyStore.currentBabyId)
      recommendations.value = result.tasks || []
      nextRefreshTime.value = result.next_refresh || 0
      return true
    } catch (e) {
      console.error('[AI Recommend] Failed to load recommendations:', e)
      errorMessage.value = '加载推荐失败，请稍后重试'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 刷新推荐
   */
  async function refreshRecommendations() {
    return loadRecommendations()
  }

  /**
   * 发送消息给 AI
   */
  async function sendMessage(content) {
    if (!content || !content.trim()) return false

    const babyStore = useBabyStore()
    if (!babyStore.currentBabyId) {
      errorMessage.value = '请先选择宝宝'
      return false
    }

    // 添加用户消息
    chatMessages.value.push({
      id: Date.now(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    })

    // 更新上下文
    chatContext.value.push({
      role: 'user',
      content: content.trim()
    })

    // 限制上下文长度
    if (chatContext.value.length > MAX_CONTEXT_LENGTH * 2) {
      chatContext.value = chatContext.value.slice(-MAX_CONTEXT_LENGTH * 2)
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await chatWithAI(content.trim(), chatContext.value)

      // 添加 AI 消息
      chatMessages.value.push({
        id: Date.now() + 1,
        role: 'ai',
        content: response.reply,
        timestamp: new Date().toISOString(),
        actions: response.actions || []
      })

      // 更新上下文
      chatContext.value.push({
        role: 'ai',
        content: response.reply
      })

      // 处理动作
      await handleActions(response.actions)

      return true
    } catch (e) {
      console.error('[AI Recommend] Failed to send message:', e)
      errorMessage.value = 'AI 回复失败，请稍后重试'

      // 添加错误消息
      chatMessages.value.push({
        id: Date.now() + 1,
        role: 'ai',
        content: '抱歉，我遇到了一些问题，请稍后再试。',
        timestamp: new Date().toISOString(),
        isError: true
      })

      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 处理 AI 返回的动作
   */
  async function handleActions(actions) {
    if (!actions || !Array.isArray(actions)) return

    for (const action of actions) {
      switch (action.type) {
        case 'generate_schedule':
          await generateTodaySchedule()
          break

        case 'show_recommendations':
          await loadRecommendations()
          break

        case 'show_stats':
          // 统计信息已包含在回复中
          break

        case 'suggest_time':
          // 时间建议已包含在回复中
          break
      }
    }
  }

  /**
   * 生成今日日程
   */
  async function generateTodaySchedule() {
    const babyStore = useBabyStore()
    if (!babyStore.currentBabyId) return false

    isLoading.value = true

    try {
      const today = new Date().toISOString().split('T')[0]
      const schedule = await generateSchedule(babyStore.currentBabyId, today)
      currentSchedule.value = schedule
      return true
    } catch (e) {
      console.error('[AI Recommend] Failed to generate schedule:', e)
      errorMessage.value = '生成日程失败'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取任务难度信息
   */
  function getTaskDifficulty(taskType) {
    return getDifficultyLevel(taskType)
  }

  /**
   * 记录推荐反馈
   */
  function submitFeedback(taskId, feedback) {
    recordRecommendationFeedback(taskId, feedback)
  }

  /**
   * 清空对话
   */
  function clearChat() {
    chatMessages.value = []
    chatContext.value = []
  }

  /**
   * 清空所有状态
   */
  function reset() {
    recommendations.value = []
    nextRefreshTime.value = 0
    chatMessages.value = []
    chatContext.value = []
    currentSchedule.value = null
    errorMessage.value = ''
    isLoading.value = false
  }

  // ==================== 初始化 ====================

  const init = () => {
    // 初始化时可以预加载推荐
    // loadRecommendations()
  }

  return {
    // 状态
    recommendations,
    nextRefreshTime,
    isLoading,
    chatMessages,
    chatContext,
    currentSchedule,
    errorMessage,

    // 计算属性
    hasRecommendations,
    canRefresh,
    isAIReplying,
    totalRecommendedPoints,

    // 方法
    loadRecommendations,
    refreshRecommendations,
    sendMessage,
    generateTodaySchedule,
    getTaskDifficulty,
    submitFeedback,
    clearChat,
    reset,
    init
  }
})
