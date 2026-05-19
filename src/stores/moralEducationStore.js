// src/stores/moralEducationStore.js
// V58 Moral Education Store
// 品德教育状态管理

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import {
  getAllStories,
  getStoryById,
  getStoriesByType,
  getAllCharacterBios,
  getValueScenarios,
  getRandomScenarios,
  getVolunteerTasks,
  getVolunteerTaskById,
  getVolunteerTasksByType,
  recordValueProgress,
  getValueProgress,
  getValueStats,
  createVolunteerRecord,
  getVolunteerRecords,
  getVolunteerStats,
  createMoralBadge,
  getMoralBadges,
  addHonorBoardRecord,
  getHonorBoardRecords,
  getCoreValues,
  getValueInfo,
  checkAndAwardBadges,
  CORE_VALUES,
  VALUE_EMOJIS,
  VALUE_COLORS,
  STORY_TYPES,
  VOLUNTEER_TYPES,
  BADGE_LEVELS
} from '@/services/moralEducationService.js'

export const useMoralEducationStore = defineStore('moralEducation', () => {
  // ==================== 状态 ====================
  
  // 故事列表
  const stories = ref([])
  
  // 当前故事
  const currentStory = ref(null)
  
  // 人物传记
  const characterBios = ref([])
  
  // 情景判断题
  const scenarios = ref([])
  
  // 当前题目索引
  const currentScenarioIndex = ref(0)
  
  // 答题结果
  const scenarioResults = ref([])
  
  // 志愿服务任务
  const volunteerTasks = ref([])
  
  // 当前任务
  const currentVolunteerTask = ref(null)
  
  // 志愿服务记录
  const volunteerRecords = ref([])
  
  // 志愿服务统计
  const volunteerStatsData = ref(null)
  
  // 价值观进度
  const valueProgressData = ref([])
  
  // 价值观统计
  const valueStatsData = ref(null)
  
  // 品德徽章
  const badges = ref([])
  
  // 荣誉榜
  const honorBoard = ref([])
  
  // 是否加载中
  const isLoading = ref(false)
  
  // 错误信息
  const errorMessage = ref('')
  
  // 价值观积分
  const valuePoints = ref(0)
  
  // ==================== 计算属性 ====================
  
  const babyStore = useBabyStore()
  
  // 当前宝宝ID
  const currentBabyId = computed(() => babyStore.currentBabyId)
  
  // 是否有故事
  const hasStories = computed(() => stories.value.length > 0)
  
  // 当前情景题
  const currentScenario = computed(() => {
    if (scenarios.value.length === 0) return null
    return scenarios.value[currentScenarioIndex.value] || null
  })
  
  // 答题进度
  const scenarioProgress = computed(() => {
    if (scenarios.value.length === 0) return 0
    return Math.round((currentScenarioIndex.value / scenarios.value.length) * 100)
  })
  
  // 答题正确率
  const scenarioAccuracy = computed(() => {
    if (scenarioResults.value.length === 0) return 0
    const correct = scenarioResults.value.filter(r => r.correct).length
    return Math.round((correct / scenarioResults.value.length) * 100)
  })
  
  // 徽章数量
  const badgeCount = computed(() => badges.value.length)
  
  // 荣誉榜数量
  const honorBoardCount = computed(() => honorBoard.value.length)
  
  // ==================== 故事相关方法 ====================
  
  /**
   * 加载故事列表
   */
  const loadStories = (type = null) => {
    if (type) {
      stories.value = getStoriesByType(type)
    } else {
      stories.value = getAllStories()
    }
  }
  
  /**
   * 加载故事详情
   */
  const loadStoryDetail = (storyId) => {
    currentStory.value = getStoryById(storyId)
    return currentStory.value
  }
  
  /**
   * 加载人物传记
   */
  const loadCharacterBios = () => {
    characterBios.value = getAllCharacterBios()
  }
  
  /**
   * 获取故事类型
   */
  const getStoryTypes = () => {
    return Object.values(STORY_TYPES)
  }
  
  // ==================== 价值观学习相关方法 ====================
  
  /**
   * 加载情景判断题
   */
  const loadScenarios = (count = 5) => {
    scenarios.value = getRandomScenarios(count)
    currentScenarioIndex.value = 0
    scenarioResults.value = []
  }
  
  /**
   * 回答情景题
   */
  const answerScenario = (selectedValue) => {
    if (!currentScenario.value) return null
    
    const correct = selectedValue === currentScenario.value.value
    const isMultiCorrect = currentScenario.value.options.filter(o => o.isCorrect).length > 1
    
    // 特殊处理多正确答案
    let partialCorrect = false
    if (isMultiCorrect) {
      // 简化的多选处理：正确选项包含所选答案
      const correctOptions = currentScenario.value.options.filter(o => o.isCorrect).map(o => o.value)
      partialCorrect = correctOptions.includes(selectedValue)
    }
    
    const result = {
      scenarioId: currentScenario.value.id,
      selectedValue,
      correctValue: currentScenario.value.value,
      correct: correct || partialCorrect,
      timestamp: new Date().toISOString()
    }
    
    scenarioResults.value.push(result)
    
    // 计算积分
    const points = correct ? 10 : (partialCorrect ? 5 : 0)
    valuePoints.value += points
    
    // 移动到下一个
    const hasNext = currentScenarioIndex.value < scenarios.value.length - 1
    if (hasNext) {
      currentScenarioIndex.value++
    }
    
    return { correct, partialCorrect, hasNext, points }
  }
  
  /**
   * 完成价值观学习
   */
  const finishValueLearning = () => {
    if (!currentBabyId.value) return null
    
    const result = {
      score: scenarioAccuracy.value,
      correctCount: scenarioResults.value.filter(r => r.correct).length,
      totalCount: scenarioResults.value.length,
      points: valuePoints.value
    }
    
    // 记录每种价值观的学习进度
    const valueCounts = {}
    scenarioResults.value.forEach(r => {
      if (!valueCounts[r.correctValue]) {
        valueCounts[r.correctValue] = { correct: 0, total: 0 }
      }
      valueCounts[r.correctValue].total++
      if (r.correct) {
        valueCounts[r.correctValue].correct++
      }
    })
    
    // 为每种价值观记录进度
    Object.entries(valueCounts).forEach(([valueType, counts]) => {
      const score = Math.round((counts.correct / counts.total) * 100)
      recordValueProgress(currentBabyId.value, valueType, score, 0)
    })
    
    // 添加荣誉榜记录
    if (result.score >= 80) {
      addHonorBoardRecord(currentBabyId.value, {
        reason: `价值观学习获得${result.score}分`,
        valueType: 'learning',
        points: result.points
      })
    }
    
    // 检查并颁发徽章
    const newBadges = checkAndAwardBadges(currentBabyId.value)
    if (newBadges.length > 0) {
      badges.value.unshift(...newBadges)
    }
    
    // 重置状态
    valuePoints.value = 0
    
    return result
  }
  
  /**
   * 获取核心价值观列表
   */
  const getCoreValuesList = () => {
    return getCoreValues()
  }
  
  /**
   * 获取价值观信息
   */
  const getValue = (valueType) => {
    return getValueInfo(valueType)
  }
  
  /**
   * 获取所有价值观emoji
   */
  const getValueEmojis = () => {
    return VALUE_EMOJIS
  }
  
  /**
   * 获取所有价值观颜色
   */
  const getValueColors = () => {
    return VALUE_COLORS
  }
  
  // ==================== 志愿服务相关方法 ====================
  
  /**
   * 加载志愿服务任务
   */
  const loadVolunteerTasks = (type = null) => {
    if (type) {
      volunteerTasks.value = getVolunteerTasksByType(type)
    } else {
      volunteerTasks.value = getVolunteerTasks()
    }
  }
  
  /**
   * 加载志愿服务任务详情
   */
  const loadVolunteerTaskDetail = (taskId) => {
    currentVolunteerTask.value = getVolunteerTaskById(taskId)
    return currentVolunteerTask.value
  }
  
  /**
   * 加载志愿服务记录
   */
  const loadVolunteerRecords = () => {
    if (!currentBabyId.value) return
    volunteerRecords.value = getVolunteerRecords(currentBabyId.value)
    volunteerStatsData.value = getVolunteerStats(currentBabyId.value)
  }
  
  /**
   * 记录完成志愿服务
   */
  const completeVolunteerTask = (taskId, data) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }
    
    try {
      const record = createVolunteerRecord(currentBabyId.value, taskId, data)
      volunteerRecords.value.unshift(record)
      
      // 刷新统计
      volunteerStatsData.value = getVolunteerStats(currentBabyId.value)
      
      // 添加荣誉榜记录
      addHonorBoardRecord(currentBabyId.value, {
        reason: `完成志愿服务：${record.taskTitle}`,
        valueType: VOLUNTEER_TYPES.COMMUNITY,
        points: record.points
      })
      
      // 检查并颁发徽章
      const newBadges = checkAndAwardBadges(currentBabyId.value)
      if (newBadges.length > 0) {
        badges.value.unshift(...newBadges)
      }
      
      return record
    } catch (e) {
      errorMessage.value = e.message
      return null
    }
  }
  
  /**
   * 获取志愿服务类型
   */
  const getVolunteerTypes = () => {
    return Object.values(VOLUNTEER_TYPES)
  }
  
  // ==================== 徽章相关方法 ====================
  
  /**
   * 加载徽章
   */
  const loadBadges = () => {
    if (!currentBabyId.value) return
    badges.value = getMoralBadges(currentBabyId.value)
  }
  
  /**
   * 获取徽章等级
   */
  const getBadgeLevels = () => {
    return Object.values(BADGE_LEVELS)
  }
  
  // ==================== 荣誉榜相关方法 ====================
  
  /**
   * 加载荣誉榜
   */
  const loadHonorBoard = (limit = 20) => {
    honorBoard.value = getHonorBoardRecords(limit)
  }
  
  // ==================== 统计相关方法 ====================
  
  /**
   * 加载价值观统计
   */
  const loadValueStats = () => {
    if (!currentBabyId.value) return
    valueStatsData.value = getValueStats(currentBabyId.value)
    valueProgressData.value = getValueProgress(currentBabyId.value)
  }
  
  /**
   * 初始化
   */
  const init = () => {
    if (!currentBabyId.value) return
    
    loadStories()
    loadCharacterBios()
    loadVolunteerTasks()
    loadVolunteerRecords()
    loadBadges()
    loadHonorBoard()
    loadValueStats()
  }
  
  /**
   * 宝宝切换时重新加载
   */
  const onBabyChange = (babyId) => {
    loadVolunteerRecords()
    loadBadges()
    loadValueStats()
  }
  
  // ==================== 暴露 ====================
  
  return {
    // 状态
    stories,
    currentStory,
    characterBios,
    scenarios,
    currentScenarioIndex,
    scenarioResults,
    volunteerTasks,
    currentVolunteerTask,
    volunteerRecords,
    volunteerStatsData,
    valueProgressData,
    valueStatsData,
    badges,
    honorBoard,
    isLoading,
    errorMessage,
    valuePoints,
    
    // 计算属性
    currentBabyId,
    hasStories,
    currentScenario,
    scenarioProgress,
    scenarioAccuracy,
    badgeCount,
    honorBoardCount,
    
    // 故事方法
    loadStories,
    loadStoryDetail,
    loadCharacterBios,
    getStoryTypes,
    
    // 价值观方法
    loadScenarios,
    answerScenario,
    finishValueLearning,
    getCoreValuesList,
    getValue,
    getValueEmojis,
    getValueColors,
    
    // 志愿服务方法
    loadVolunteerTasks,
    loadVolunteerTaskDetail,
    loadVolunteerRecords,
    completeVolunteerTask,
    getVolunteerTypes,
    
    // 徽章方法
    loadBadges,
    getBadgeLevels,
    
    // 荣誉榜方法
    loadHonorBoard,
    
    // 统计方法
    loadValueStats,
    
    // 生命周期
    init,
    onBabyChange
  }
})
