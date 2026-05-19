/**
 * V67 Science Experiment Store
 * 科学实验系统状态管理 - 实验库、虚拟实验、实验记录、科学成就
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import {
  getScienceExperiments,
  filterExperiments,
  getExperimentById,
  completeExperiment,
  getJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalEntryById,
  getSciencePoints,
  updateSciencePoints,
  getScienceAwards,
  checkAndUnlockAwards,
  getLeaderboard,
  SCIENCE_CATEGORIES,
  DIFFICULTY_LEVELS,
  SAFETY_LEVELS
} from '@/services/scienceService.js'

export const useScienceStore = defineStore('science', () => {
  // =========================================================================
  // 状态
  // =========================================================================

  // 实验相关
  const experiments = ref([])
  const currentExperiment = ref(null)
  const currentStep = ref(0)
  const isVirtualLabActive = ref(false)
  
  // 筛选条件
  const filters = ref({
    category: '',
    difficulty: '',
    completedOnly: false,
    keyword: ''
  })

  // 虚拟实验状态
  const virtualLabState = ref({
    currentStepIndex: 0,
    isPlaying: false,
    observations: [],
    isCompleted: false
  })

  // 实验记录相关
  const journalEntries = ref([])
  const currentJournalEntry = ref(null)

  // 积分相关
  const sciencePoints = ref({ totalPoints: 0, level: 1, completedCount: 0 })

  // 成就相关
  const awards = ref([])
  const unlockedAwards = ref([])

  // 排行榜
  const leaderboard = ref([])

  // UI状态
  const currentTab = ref('experiments') // experiments | virtual-lab | journal | awards
  const isLoading = ref(false)
  const errorMessage = ref('')

  // =========================================================================
  // 计算属性
  // =========================================================================

  const babyStore = useBabyStore()
  const currentBabyId = computed(() => babyStore.currentBabyId)

  // 筛选后的实验列表
  const filteredExperiments = computed(() => {
    return filterExperiments(filters.value)
  })

  // 按分类分组的实验
  const experimentsByCategory = computed(() => {
    const grouped = {}
    Object.keys(SCIENCE_CATEGORIES).forEach(cat => {
      grouped[cat] = experiments.value.filter(e => e.category === cat)
    })
    return grouped
  })

  // 已完成实验数
  const completedExperimentsCount = computed(() => {
    return experiments.value.filter(e => e.isCompleted).length
  })

  // 已解锁成就数
  const unlockedAwardsCount = computed(() => {
    return awards.value.filter(a => a.isUnlocked).length
  })

  // 当前实验的步骤
  const currentExperimentSteps = computed(() => {
    if (!currentExperiment.value) return []
    return currentExperiment.value.steps || []
  })

  // 当前步骤详情
  const currentStepDetail = computed(() => {
    if (!currentExperiment.value || !currentExperiment.value.steps) return null
    return currentExperiment.value.steps[currentStep.value] || null
  })

  // 实验分类列表
  const categories = computed(() => Object.values(SCIENCE_CATEGORIES))

  // 难度等级列表
  const difficultyLevels = computed(() => Object.values(DIFFICULTY_LEVELS))

  // 安全等级列表
  const safetyLevels = computed(() => Object.values(SAFETY_LEVELS))

  // =========================================================================
  // 方法
  // =========================================================================

  /**
   * 初始化
   */
  const init = () => {
    if (!currentBabyId.value) return
    loadExperiments()
    loadJournalEntries()
    loadSciencePoints()
    loadAwards()
    loadLeaderboard()
  }

  /**
   * 加载实验列表
   */
  const loadExperiments = () => {
    experiments.value = getScienceExperiments()
  }

  /**
   * 设置筛选条件
   */
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * 清除筛选条件
   */
  const clearFilters = () => {
    filters.value = {
      category: '',
      difficulty: '',
      completedOnly: false,
      keyword: ''
    }
  }

  /**
   * 选择实验
   */
  const selectExperiment = (experimentId) => {
    currentExperiment.value = getExperimentById(experimentId)
    currentStep.value = 0
    virtualLabState.value = {
      currentStepIndex: 0,
      isPlaying: false,
      observations: [],
      isCompleted: false
    }
    return currentExperiment.value
  }

  /**
   * 进入下一步
   */
  const nextStep = () => {
    if (currentExperiment.value && currentStep.value < currentExperiment.value.steps.length - 1) {
      currentStep.value++
      virtualLabState.value.currentStepIndex = currentStep.value
      return true
    }
    return false
  }

  /**
   * 返回上一步
   */
  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
      virtualLabState.value.currentStepIndex = currentStep.value
      return true
    }
    return false
  }

  /**
   * 跳转到指定步骤
   */
  const goToStep = (stepIndex) => {
    if (currentExperiment.value && stepIndex >= 0 && stepIndex < currentExperiment.value.steps.length) {
      currentStep.value = stepIndex
      virtualLabState.value.currentStepIndex = stepIndex
      return true
    }
    return false
  }

  // =========================================================================
  // 虚拟实验室
  // =========================================================================

  /**
   * 启动虚拟实验室
   */
  const startVirtualLab = () => {
    if (!currentExperiment.value) return false
    isVirtualLabActive.value = true
    currentStep.value = 0
    virtualLabState.value = {
      currentStepIndex: 0,
      isPlaying: true,
      observations: [],
      isCompleted: false
    }
    return true
  }

  /**
   * 退出虚拟实验室
   */
  const exitVirtualLab = () => {
    isVirtualLabActive.value = false
    virtualLabState.value = {
      currentStepIndex: 0,
      isPlaying: false,
      observations: [],
      isCompleted: false
    }
  }

  /**
   * 添加观察记录
   */
  const addObservation = (observation) => {
    virtualLabState.value.observations.push({
      stepIndex: currentStep.value,
      content: observation,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * 完成虚拟实验
   */
  const completeVirtualExperiment = (record) => {
    if (!currentExperiment.value) return null
    
    const result = completeExperiment(currentExperiment.value.id, record)
    if (result) {
      loadExperiments()
      loadSciencePoints()
      loadAwards()
      virtualLabState.value.isCompleted = true
    }
    return result
  }

  // =========================================================================
  // 实验记录 (Journal)
  // =========================================================================

  /**
   * 加载实验记录
   */
  const loadJournalEntries = () => {
    journalEntries.value = getJournalEntries()
  }

  /**
   * 添加实验记录
   */
  const addEntry = (entryData) => {
    const entry = addJournalEntry(entryData)
    if (entry) {
      journalEntries.value.unshift(entry)
      checkAndUnlockAwards()
    }
    return entry
  }

  /**
   * 更新实验记录
   */
  const updateEntry = (entryId, updates) => {
    const entry = updateJournalEntry(entryId, updates)
    if (entry) {
      const index = journalEntries.value.findIndex(e => e.id === entryId)
      if (index !== -1) {
        journalEntries.value[index] = entry
      }
    }
    return entry
  }

  /**
   * 删除实验记录
   */
  const removeEntry = (entryId) => {
    const success = deleteJournalEntry(entryId)
    if (success) {
      journalEntries.value = journalEntries.value.filter(e => e.id !== entryId)
    }
    return success
  }

  /**
   * 选择记录
   */
  const selectJournalEntry = (entryId) => {
    currentJournalEntry.value = getJournalEntryById(entryId)
    return currentJournalEntry.value
  }

  // =========================================================================
  // 积分与成就
  // =========================================================================

  /**
   * 加载积分
   */
  const loadSciencePoints = () => {
    sciencePoints.value = getSciencePoints()
  }

  /**
   * 加载成就
   */
  const loadAwards = () => {
    awards.value = getScienceAwards()
    unlockedAwards.value = awards.value.filter(a => a.isUnlocked)
  }

  /**
   * 加载排行榜
   */
  const loadLeaderboard = () => {
    leaderboard.value = getLeaderboard()
  }

  /**
   * 检查并解锁成就
   */
  const checkAwards = () => {
    const unlocked = checkAndUnlockAwards()
    if (unlocked.length > 0) {
      loadAwards()
      return unlocked
    }
    return []
  }

  // =========================================================================
  // 暴露
  // =========================================================================

  return {
    // 状态
    experiments,
    currentExperiment,
    currentStep,
    isVirtualLabActive,
    filters,
    virtualLabState,
    journalEntries,
    currentJournalEntry,
    sciencePoints,
    awards,
    unlockedAwards,
    leaderboard,
    currentTab,
    isLoading,
    errorMessage,

    // 计算属性
    currentBabyId,
    filteredExperiments,
    experimentsByCategory,
    completedExperimentsCount,
    unlockedAwardsCount,
    currentExperimentSteps,
    currentStepDetail,
    categories,
    difficultyLevels,
    safetyLevels,

    // 方法
    init,
    loadExperiments,
    setFilters,
    clearFilters,
    selectExperiment,
    nextStep,
    prevStep,
    goToStep,
    startVirtualLab,
    exitVirtualLab,
    addObservation,
    completeVirtualExperiment,
    loadJournalEntries,
    addEntry,
    updateEntry,
    removeEntry,
    selectJournalEntry,
    loadSciencePoints,
    loadAwards,
    loadLeaderboard,
    checkAwards
  }
})
