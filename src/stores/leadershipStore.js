/**
 * V75 Leadership Challenge Store
 * 领导力挑战系统状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import leadershipService from '@/services/leadershipService.js'

export const useLeadershipStore = defineStore('leadership', () => {
  // ==================== 状态 ====================

  // 领导力任务
  const quests = ref([])

  // 当前选中的任务
  const currentQuest = ref(null)

  // 角色扮演场景
  const scenarios = ref([])

  // 当前选中的场景
  const currentScenario = ref(null)

  // 用户领导力数据
  const userStats = ref(null)

  // 加载状态
  const isLoading = ref(false)

  // 任务进行状态
  const activeQuest = ref(null)

  // 场景进行状态
  const activeScenario = ref(null)

  // ==================== 初始化 ====================

  const init = () => {
    loadQuests()
    loadScenarios()
    loadUserStats()
  }

  const loadQuests = () => {
    quests.value = leadershipService.getQuests()
  }

  const loadScenarios = () => {
    scenarios.value = leadershipService.getScenarios()
  }

  const loadUserStats = () => {
    userStats.value = leadershipService.getUserStats()
  }

  // ==================== 计算属性 ====================

  // 任务进度
  const questProgress = computed(() => leadershipService.getQuestProgress())

  // 场景进度
  const scenarioProgress = computed(() => leadershipService.getScenarioProgress())

  // 领导力属性
  const leadershipStats = computed(() => userStats.value ? {
    influence: userStats.value.influence,
    decision: userStats.value.decision,
    communication: userStats.value.communication
  } : {
    influence: 0,
    decision: 0,
    communication: 0
  })

  // 总评分
  const totalScore = computed(() => leadershipService.getTotalScore())

  // 等级
  const level = computed(() => userStats.value?.level || 1)

  // 等级称号
  const levelTitle = computed(() => leadershipService.getLevelTitle(level.value))

  // 经验值进度
  const expProgress = computed(() => {
    if (!userStats.value) return 0
    const exp = userStats.value.experience || 0
    const expForNext = level.value * 50
    return Math.round((exp / expForNext) * 100)
  })

  // 已完成任务
  const completedQuests = computed(() => leadershipService.getCompletedQuests())

  // 已完成场景
  const completedScenarios = computed(() => leadershipService.getCompletedScenarios())

  // 成长轨迹
  const growthTrail = computed(() => leadershipService.getGrowthTrail())

  // ==================== 任务操作 ====================

  // 按难度获取任务
  const getQuestsByDifficulty = (difficulty) => {
    return quests.value.filter(q => q.difficulty === difficulty)
  }

  // 按角色获取任务
  const getQuestsByRole = (role) => {
    return quests.value.filter(q => q.role === role)
  }

  // 选择任务
  const selectQuest = (quest) => {
    currentQuest.value = quest
  }

  // 获取任务
  const getQuest = (questId) => {
    return leadershipService.getQuest(questId)
  }

  // 接受任务
  const acceptQuest = (questId) => {
    const result = leadershipService.acceptQuest(questId)
    loadUserStats()
    return result
  }

  // 开始任务
  const startQuest = (quest) => {
    activeQuest.value = {
      questId: quest.id,
      startTime: Date.now(),
      objectives: [...quest.objectives],
      currentObjectiveIndex: 0
    }
    return activeQuest.value
  }

  // 更新任务进度
  const updateQuestProgress = (objectiveIndex) => {
    if (activeQuest.value) {
      activeQuest.value.currentObjectiveIndex = objectiveIndex
    }
  }

  // 完成任务
  const completeQuest = (questId, result = {}) => {
    const completionResult = leadershipService.completeQuest(questId, result)
    activeQuest.value = null
    loadUserStats()
    return completionResult
  }

  // 放弃任务
  const abandonQuest = (questId) => {
    const success = leadershipService.abandonQuest(questId)
    if (activeQuest.value?.questId === questId) {
      activeQuest.value = null
    }
    loadUserStats()
    return success
  }

  // ==================== 场景操作 ====================

  // 按类型获取场景
  const getScenariosByType = (type) => {
    return scenarios.value.filter(s => s.type === type)
  }

  // 按角色获取场景
  const getScenariosByRole = (role) => {
    return scenarios.value.filter(s => s.role === role)
  }

  // 选择场景
  const selectScenario = (scenario) => {
    currentScenario.value = scenario
  }

  // 获取场景
  const getScenario = (scenarioId) => {
    return leadershipService.getScenario(scenarioId)
  }

  // 开始场景
  const startScenario = (scenario) => {
    const result = leadershipService.startScenario(scenario.id)
    activeScenario.value = {
      scenarioId: scenario.id,
      startTime: Date.now(),
      currentSituation: scenario.situation
    }
    return result
  }

  // 完成场景选择
  const completeScenarioChoice = (scenarioId, optionId) => {
    const result = leadershipService.completeScenario(scenarioId, optionId)
    activeScenario.value = null
    loadUserStats()
    return result
  }

  // 取消场景
  const cancelScenario = () => {
    activeScenario.value = null
  }

  // ==================== 工具方法 ====================

  // 获取属性信息
  const getStatsInfo = () => leadershipService.getStatsInfo()

  // 获取角色信息
  const getRoleInfo = () => leadershipService.getRoleInfo()

  // 获取难度信息
  const getDifficultyInfo = () => leadershipService.getDifficultyInfo()

  // 获取场景类型信息
  const getScenarioTypeInfo = () => leadershipService.getScenarioTypeInfo()

  // 重置数据
  const resetData = () => {
    const success = leadershipService.resetData()
    if (success) {
      loadUserStats()
    }
    return success
  }

  return {
    // 状态
    quests,
    currentQuest,
    scenarios,
    currentScenario,
    userStats,
    isLoading,
    activeQuest,
    activeScenario,

    // 计算属性
    questProgress,
    scenarioProgress,
    leadershipStats,
    totalScore,
    level,
    levelTitle,
    expProgress,
    completedQuests,
    completedScenarios,
    growthTrail,

    // 方法 - 初始化
    init,
    loadQuests,
    loadScenarios,
    loadUserStats,

    // 方法 - 任务操作
    getQuestsByDifficulty,
    getQuestsByRole,
    selectQuest,
    getQuest,
    acceptQuest,
    startQuest,
    updateQuestProgress,
    completeQuest,
    abandonQuest,

    // 方法 - 场景操作
    getScenariosByType,
    getScenariosByRole,
    selectScenario,
    getScenario,
    startScenario,
    completeScenarioChoice,
    cancelScenario,

    // 方法 - 工具方法
    getStatsInfo,
    getRoleInfo,
    getDifficultyInfo,
    getScenarioTypeInfo,
    resetData
  }
})
