/**
 * V50 Gamified Science Lab Store
 * 游戏化科学实验室 Store - 虚拟实验操作、科学知识问答、科学竞赛和探索任务
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import scienceLabService from '@/services/scienceLabService.js'

export const useScienceLabStore = defineStore('scienceLab', () => {
  // =========================================================================
  // 状态
  // =========================================================================
  
  // 实验相关
  const experiments = ref([])
  const currentExperiment = ref(null)
  const currentStep = ref(0)
  
  // 任务相关
  const scienceQuests = ref([])
  const currentQuest = ref(null)
  
  // 百科相关
  const encyclopedia = ref([])
  const currentArticle = ref(null)
  
  // 积分相关
  const sciencePoints = ref({ totalPoints: 0, level: 1, weeklyProgress: 0, streak: { current: 0, longest: 0 } })
  
  // 成就相关
  const achievements = ref([])
  const unlockedAchievements = ref([])
  
  // 竞赛相关
  const competitions = ref([])
  
  // UI 状态
  const currentTab = ref('lab') // lab | quests | encyclopedia | competitions
  const selectedScienceType = ref('chemistry')
  
  // =========================================================================
  // 初始化
  // =========================================================================
  
  const init = () => {
    loadExperiments()
    loadScienceQuests()
    loadEncyclopedia()
    loadSciencePoints()
    loadAchievements()
    loadCompetitions()
  }
  
  // =========================================================================
  // 加载方法
  // =========================================================================
  
  const loadExperiments = () => {
    experiments.value = scienceLabService.getScienceExperiments()
  }
  
  const loadScienceQuests = () => {
    scienceQuests.value = scienceLabService.getScienceQuests()
  }
  
  const loadEncyclopedia = () => {
    encyclopedia.value = scienceLabService.getScienceEncyclopedia()
  }
  
  const loadSciencePoints = () => {
    sciencePoints.value = scienceLabService.getSciencePoints()
  }
  
  const loadAchievements = () => {
    achievements.value = scienceLabService.getScienceAchievements()
    unlockedAchievements.value = achievements.value.filter(a => a.isUnlocked)
  }
  
  const loadCompetitions = () => {
    competitions.value = scienceLabService.SCIENCE_COMPETITIONS
  }
  
  // =========================================================================
  // 实验管理
  // =========================================================================
  
  const selectExperiment = (experimentId) => {
    currentExperiment.value = experiments.value.find(e => e.id === experimentId)
    currentStep.value = 0
    return currentExperiment.value
  }
  
  const nextStep = () => {
    if (currentExperiment.value && currentStep.value < currentExperiment.value.steps.length - 1) {
      currentStep.value++
      return true
    }
    return false
  }
  
  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
      return true
    }
    return false
  }
  
  const completeCurrentExperiment = (record) => {
    if (currentExperiment.value) {
      const result = scienceLabService.completeExperiment(currentExperiment.value.id, record)
      if (result) {
        loadExperiments()
        loadSciencePoints()
        checkAndUnlockAchievements()
        currentExperiment.value = null
        currentStep.value = 0
        return result
      }
    }
    return null
  }
  
  const resetCurrentExperiment = () => {
    currentExperiment.value = null
    currentStep.value = 0
  }
  
  // =========================================================================
  // 任务管理
  // =========================================================================
  
  const selectQuest = (questId) => {
    currentQuest.value = scienceQuests.value.find(q => q.id === questId)
    return currentQuest.value
  }
  
  const updateQuestTask = (taskId) => {
    if (currentQuest.value) {
      const result = scienceLabService.updateQuestProgress(currentQuest.value.id, taskId)
      if (result) {
        loadScienceQuests()
        loadSciencePoints()
        checkAndUnlockAchievements()
        // 更新currentQuest的progress
        const updated = scienceQuests.value.find(q => q.id === currentQuest.value.id)
        if (updated) {
          currentQuest.value = updated
        }
        return result
      }
    }
    return null
  }
  
  // =========================================================================
  // 百科管理
  // =========================================================================
  
  const selectArticle = (articleId) => {
    currentArticle.value = encyclopedia.value.find(a => a.id === articleId)
    return currentArticle.value
  }
  
  const markArticleRead = () => {
    if (currentArticle.value) {
      const result = scienceLabService.markEncyclopediaRead(currentArticle.value.id)
      if (result) {
        loadEncyclopedia()
        currentArticle.value = result
        checkAndUnlockAchievements()
        return result
      }
    }
    return null
  }
  
  // =========================================================================
  // 竞赛管理
  // =========================================================================
  
  const joinContest = (competitionId) => {
    const success = scienceLabService.joinCompetition(competitionId)
    if (success) {
      loadCompetitions()
    }
    return success
  }
  
  // =========================================================================
  // 成就检查
  // =========================================================================
  
  const checkAndUnlockAchievements = () => {
    const unlocked = scienceLabService.checkAndUnlockAchievements()
    if (unlocked.length > 0) {
      loadAchievements()
      return unlocked
    }
    return null
  }
  
  // =========================================================================
  // 计算属性
  // =========================================================================
  
  // 按类型筛选实验
  const experimentsByType = computed(() => {
    return (type) => experiments.value.filter(e => e.type === type)
  })
  
  // 已完成实验数
  const completedExperimentsCount = computed(() => {
    return experiments.value.filter(e => e.isCompleted).length
  })
  
  // 活跃任务数
  const activeQuests = computed(() => {
    return scienceQuests.value.filter(q => !q.isCompleted)
  })
  
  // 已完成任务数
  const completedQuestsCount = computed(() => {
    return scienceQuests.value.filter(q => q.isCompleted).length
  })
  
  // 百科分类
  const encyclopediaByCategory = computed(() => {
    const categories = {}
    encyclopedia.value.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = []
      }
      categories[item.category].push(item)
    })
    return categories
  })
  
  // 科学等级
  const scienceLevel = computed(() => sciencePoints.value.level)
  
  // 距离下一级还需要多少积分
  const pointsToNextLevel = computed(() => {
    const currentLevelPoints = (sciencePoints.value.level - 1) * 150
    return 150 - (sciencePoints.value.totalPoints - currentLevelPoints)
  })
  
  // 科学类型列表
  const scienceTypes = computed(() => Object.values(scienceLabService.SCIENCE_TYPES))
  
  // 竞赛状态
  const activeCompetitions = computed(() => {
    return competitions.value.filter(c => c.status === 'active')
  })
  
  return {
    // 状态
    experiments,
    currentExperiment,
    currentStep,
    scienceQuests,
    currentQuest,
    encyclopedia,
    currentArticle,
    sciencePoints,
    achievements,
    unlockedAchievements,
    competitions,
    currentTab,
    selectedScienceType,
    
    // 初始化
    init,
    
    // 加载方法
    loadExperiments,
    loadScienceQuests,
    loadEncyclopedia,
    loadSciencePoints,
    loadAchievements,
    loadCompetitions,
    
    // 实验管理
    selectExperiment,
    nextStep,
    prevStep,
    completeCurrentExperiment,
    resetCurrentExperiment,
    
    // 任务管理
    selectQuest,
    updateQuestTask,
    
    // 百科管理
    selectArticle,
    markArticleRead,
    
    // 竞赛管理
    joinContest,
    
    // 成就
    checkAndUnlockAchievements,
    
    // 计算属性
    experimentsByType,
    completedExperimentsCount,
    activeQuests,
    completedQuestsCount,
    encyclopediaByCategory,
    scienceLevel,
    pointsToNextLevel,
    scienceTypes,
    activeCompetitions
  }
})
