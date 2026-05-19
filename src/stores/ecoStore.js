import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import ecoService from '@/services/ecoService.js'

/**
 * V61 Eco Store
 * 环保意识教育状态管理
 */
export const useEcoStore = defineStore('eco', () => {
  // ==================== 状态 ====================
  const tasks = ref([])
  const challenges = ref([])
  const learnedKnowledge = ref([])
  const userStats = ref(null)
  const badges = ref([])
  const isLoading = ref(false)

  // ==================== 初始化 ====================
  const init = () => {
    loadAllData()
  }

  const loadAllData = () => {
    tasks.value = ecoService.getDailyTasks()
    challenges.value = ecoService.getChallenges()
    learnedKnowledge.value = ecoService.getLearnedKnowledge()
    userStats.value = ecoService.getUserStats()
    badges.value = ecoService.getBadges()
  }

  // ==================== 计算属性 ====================

  // 总积分
  const totalPoints = computed(() => userStats.value?.totalPoints || 0)

  // 今日任务
  const todayTasks = computed(() => tasks.value.filter(t => t.date === new Date().toDateString()))

  // 今日完成任务数
  const todayCompletedCount = computed(() => 
    todayTasks.value.filter(t => t.completed).length
  )

  // 进行中的挑战
  const activeChallenges = computed(() => 
    challenges.value.filter(c => c.status === 'in_progress')
  )

  // 已完成的挑战
  const completedChallenges = computed(() => 
    challenges.value.filter(c => c.status === 'completed')
  )

  // 已学习的知识
  const knowledgeList = computed(() => ecoService.getKnowledge())
  const knowledgeCategories = computed(() => ecoService.getKnowledgeCategories())
  const knowledgeQuiz = computed(() => ecoService.getKnowledgeQuiz())

  // 任务统计
  const taskStats = computed(() => ecoService.getTaskStats())

  // 排行榜
  const leaderboard = computed(() => ecoService.getLeaderboard())

  // 徽章定义
  const badgeDefinitions = computed(() => ecoService.getBadgeDefinitions())

  // ==================== 任务相关方法 ====================

  // 接受任务
  const acceptTask = (taskId) => {
    const task = ecoService.acceptTask(taskId)
    if (task) {
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = { ...tasks.value[index], accepted: true }
      }
    }
    return task
  }

  // 完成任务
  const completeTask = (taskId) => {
    const task = ecoService.completeTask(taskId)
    if (task) {
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = { ...tasks.value[index], ...task }
      }
      userStats.value = ecoService.getUserStats()
      badges.value = ecoService.getBadges()
      uni.$emit('ecoUpdated', { type: 'task' })
    }
    return task
  }

  // 刷新每日任务
  const refreshDailyTasks = () => {
    tasks.value = ecoService.getDailyTasks()
  }

  // ==================== 知识相关方法 ====================

  // 学习知识
  const learnKnowledge = (knowledgeId) => {
    ecoService.markKnowledgeLearned(knowledgeId)
    learnedKnowledge.value = ecoService.getLearnedKnowledge()
    userStats.value = ecoService.getUserStats()
    uni.$emit('ecoUpdated', { type: 'knowledge' })
  }

  // 检查知识是否已学习
  const isKnowledgeLearned = (knowledgeId) => {
    return learnedKnowledge.value.includes(knowledgeId)
  }

  // 获取知识分类
  const getKnowledgeByCategory = (category) => {
    return ecoService.getKnowledge(category)
  }

  // ==================== 挑战相关方法 ====================

  // 开始挑战
  const startChallenge = (challengeId) => {
    const challenge = ecoService.startChallenge(challengeId)
    if (challenge) {
      challenges.value = ecoService.getChallenges()
      uni.$emit('ecoUpdated', { type: 'challenge' })
    }
    return challenge
  }

  // 更新挑战进度
  const updateChallengeProgress = (challengeId, value) => {
    const challenge = ecoService.updateChallengeProgress(challengeId, value)
    if (challenge) {
      challenges.value = ecoService.getChallenges()
      userStats.value = ecoService.getUserStats()
      badges.value = ecoService.getBadges()
      uni.$emit('ecoUpdated', { type: 'challenge' })
    }
    return challenge
  }

  // 记录挑战日完成
  const recordChallengeDay = (challengeId, dayIndex) => {
    const challenge = ecoService.recordChallengeDay(challengeId, dayIndex)
    if (challenge) {
      challenges.value = ecoService.getChallenges()
      userStats.value = ecoService.getUserStats()
      badges.value = ecoService.getBadges()
      uni.$emit('ecoUpdated', { type: 'challenge' })
    }
    return challenge
  }

  // ==================== 环保统计方法 ====================

  // 更新环保数据
  const updateEcoStats = (type, value) => {
    userStats.value = ecoService.updateEcoStats(type, value)
    uni.$emit('ecoUpdated', { type: 'stats' })
  }

  // ==================== 通用方法 ====================

  // 刷新数据
  const refresh = () => {
    loadAllData()
  }

  // 清空所有数据
  const clearAllData = () => {
    ecoService.clearAllData()
    loadAllData()
    uni.$emit('ecoUpdated', { type: 'all' })
  }

  return {
    // 状态
    tasks,
    challenges,
    learnedKnowledge,
    userStats,
    badges,
    isLoading,

    // 计算属性 - 任务
    todayTasks,
    todayCompletedCount,
    taskStats,

    // 计算属性 - 知识
    knowledgeList,
    knowledgeCategories,
    knowledgeQuiz,

    // 计算属性 - 挑战
    activeChallenges,
    completedChallenges,

    // 计算属性 - 其他
    totalPoints,
    leaderboard,
    badgeDefinitions,

    // 方法 - 通用
    init,
    loadAllData,
    refresh,
    clearAllData,

    // 方法 - 任务
    acceptTask,
    completeTask,
    refreshDailyTasks,

    // 方法 - 知识
    learnKnowledge,
    isKnowledgeLearned,
    getKnowledgeByCategory,

    // 方法 - 挑战
    startChallenge,
    updateChallengeProgress,
    recordChallengeDay,

    // 方法 - 统计
    updateEcoStats
  }
})
