/**
 * V91 Social Skills Dojo Store
 * 社交技能道场状态管理
 * 社交情景模拟、对话练习、社交成就系统
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import socialSkillsDojoService, {
  SOCIAL_SCENARIO_TYPE,
  SCENARIO_STATUS,
  DIALOGUE_ROLE,
  RATING_LEVEL,
  ACHIEVEMENT_TYPE,
  SKILL_TYPE
} from '@/services/socialSkillsDojoService.js'

export const useSocialSkillsDojoStore = defineStore('socialSkillsDojo', () => {
  // ==================== 状态 ====================

  // 社交情景列表
  const scenarios = ref([])

  // 当前选中的情景
  const currentScenario = ref(null)

  // 当前对话列表
  const currentDialogues = ref([])

  // 当前对话索引
  const currentDialogueIndex = ref(0)

  // 对话结果记录
  const dialogueResults = ref([])

  // 练习记录列表
  const practiceRecords = ref([])

  // 成就列表
  const achievements = ref([])

  // 技能进度
  const skillsProgress = ref({})

  // 总社交积分
  const totalSocialPoints = ref(0)

  // 加载状态
  const isLoading = ref(false)

  // 错误信息
  const errorMessage = ref('')

  // 当前Tab
  const currentTab = ref('scenarios') // scenarios | practice | achievements

  // 情景类型筛选
  const filterType = ref('')

  // 练习状态
  const isPracticing = ref(false)
  const practiceResult = ref(null)

  // ==================== 计算属性 ====================

  const babyStore = useBabyStore()
  const currentBabyId = computed(() => babyStore.currentBabyId)
  const currentBaby = computed(() => babyStore.currentBaby)

  // 按类型分组的社交情景
  const scenariosByType = computed(() => {
    const grouped = {}
    Object.keys(SOCIAL_SCENARIO_TYPE).forEach(key => {
      const type = SOCIAL_SCENARIO_TYPE[key]
      grouped[type] = scenarios.value.filter(s => s.type === type)
    })
    return grouped
  })

  // 可用的情景
  const availableScenarios = computed(() => {
    return scenarios.value.filter(s => s.status === SCENARIO_STATUS.AVAILABLE)
  })

  // 已完成的情景
  const completedScenarios = computed(() => {
    return practiceRecords.value.reduce((acc, record) => {
      if (!acc.includes(record.scenarioId)) {
        acc.push(record.scenarioId)
      }
      return acc
    }, [])
  })

  // 技能列表（带等级信息）
  const skillsList = computed(() => {
    return Object.values(SKILL_TYPE).map(skill => ({
      type: skill,
      ...socialSkillsDojoService.getSkillLevelInfo(skill)
    }))
  })

  // 社交情景类型选项
  const scenarioTypeOptions = computed(() => [
    { value: SOCIAL_SCENARIO_TYPE.SELF_INTRO, label: '🌟 自我介绍', icon: '🌟' },
    { value: SOCIAL_SCENARIO_TYPE.MAKE_FRIENDS, label: '🤝 交朋友', icon: '🤝' },
    { value: SOCIAL_SCENARIO_TYPE.CONFLICT_HANDLING, label: '💬 冲突处理', icon: '💬' }
  ])

  // 已获得的成就
  const earnedAchievements = computed(() => {
    return achievements.value.filter(a => a.earned)
  })

  // 未获得的成就
  const unearnedAchievements = computed(() => {
    return achievements.value.filter(a => !a.earned)
  })

  // 当前对话
  const currentDialogue = computed(() => {
    return currentDialogues.value[currentDialogueIndex.value] || null
  })

  // 进度百分比
  const practiceProgress = computed(() => {
    if (currentDialogues.value.length === 0) return 0
    return Math.round((currentDialogueIndex.value / currentDialogues.value.length) * 100)
  })

  // ==================== 初始化 ====================

  const init = () => {
    if (!currentBabyId.value) return
    loadAllData()
  }

  const loadAllData = () => {
    if (!currentBabyId.value) return

    isLoading.value = true
    errorMessage.value = ''

    try {
      loadScenarios()
      loadPracticeRecords()
      loadAchievements()
      loadSkillsProgress()
      loadTotalPoints()
    } catch (e) {
      errorMessage.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  // ==================== 加载方法 ====================

  /**
   * 加载社交情景列表
   */
  const loadScenarios = (filter = {}) => {
    scenarios.value = socialSkillsDojoService.getScenariosList(filter)
  }

  /**
   * 加载情景详情和对话
   */
  const loadScenarioDetail = (scenarioId) => {
    currentScenario.value = socialSkillsDojoService.getScenarioById(scenarioId)
    if (currentScenario.value) {
      currentDialogues.value = socialSkillsDojoService.getScenarioDialogues(scenarioId)
      currentDialogueIndex.value = 0
      dialogueResults.value = []
    }
    return currentScenario.value
  }

  /**
   * 加载练习记录
   */
  const loadPracticeRecords = () => {
    if (!currentBabyId.value) return
    practiceRecords.value = socialSkillsDojoService.getBabyPracticeRecords(currentBabyId.value)
  }

  /**
   * 加载成就
   */
  const loadAchievements = () => {
    if (!currentBabyId.value) return
    achievements.value = socialSkillsDojoService.getBabyAchievements(currentBabyId.value)
  }

  /**
   * 加载技能进度
   */
  const loadSkillsProgress = () => {
    skillsProgress.value = socialSkillsDojoService.getBabySkillsProgress(currentBabyId.value)
  }

  /**
   * 加载总积分
   */
  const loadTotalPoints = () => {
    if (!currentBabyId.value) return
    totalSocialPoints.value = socialSkillsDojoService.getBabyTotalSocialPoints(currentBabyId.value)
  }

  // ==================== 练习方法 ====================

  /**
   * 开始练习
   */
  const startPractice = (scenarioId) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return false
    }

    loadScenarioDetail(scenarioId)
    isPracticing.value = true
    practiceResult.value = null
    dialogueResults.value = []

    return true
  }

  /**
   * 提交对话答案
   */
  const submitAnswer = (selectedOptionIndex) => {
    const dialogue = currentDialogue.value
    if (!dialogue || dialogue.role !== DIALOGUE_ROLE.USER) return null

    const option = dialogue.options[selectedOptionIndex]
    if (!option) return null

    const result = {
      dialogueId: dialogue.id,
      selectedOption: option.text,
      score: option.score,
      feedback: option.feedback
    }

    dialogueResults.value.push(result)

    return result
  }

  /**
   * 进入下一轮对话
   */
  const nextDialogue = () => {
    if (currentDialogueIndex.value < currentDialogues.value.length - 1) {
      currentDialogueIndex.value++
      return true
    }
    return false
  }

  /**
   * 完成练习
   */
  const finishPractice = () => {
    if (!currentBabyId.value || !currentScenario.value) {
      errorMessage.value = '练习数据不完整'
      return null
    }

    const result = socialSkillsDojoService.completeScenarioPractice(
      currentBabyId.value,
      currentScenario.value.id,
      dialogueResults.value
    )

    if (result) {
      practiceResult.value = result
      loadPracticeRecords()
      loadAchievements()
      loadSkillsProgress()
      loadTotalPoints()
    }

    isPracticing.value = false

    return result
  }

  /**
   * 重置练习
   */
  const resetPractice = () => {
    isPracticing.value = false
    practiceResult.value = null
    currentDialogueIndex.value = 0
    dialogueResults.value = []
    currentScenario.value = null
    currentDialogues.value = []
  }

  /**
   * 获取情景最佳成绩
   */
  const getScenarioBestScore = (scenarioId) => {
    if (!currentBabyId.value) return null
    return socialSkillsDojoService.getBabyBestScore(currentBabyId.value, scenarioId)
  }

  /**
   * 获取情景平均成绩
   */
  const getScenarioAvgScore = (scenarioId) => {
    const records = practiceRecords.value.filter(r => r.scenarioId === scenarioId)
    if (records.length === 0) return null
    const sum = records.reduce((acc, r) => acc + r.score, 0)
    return Math.round(sum / records.length)
  }

  /**
   * 获取情景完成次数
   */
  const getScenarioCompleteCount = (scenarioId) => {
    return practiceRecords.value.filter(r => r.scenarioId === scenarioId).length
  }

  // ==================== 辅助方法 ====================

  /**
   * 切换Tab
   */
  const switchTab = (tab) => {
    currentTab.value = tab
  }

  /**
   * 设置类型筛选
   */
  const setFilterType = (type) => {
    filterType.value = type
    loadScenarios(type ? { type } : {})
  }

  /**
   * 获取情景类型名称
   */
  const getScenarioTypeName = (type) => {
    const typeMap = {
      [SOCIAL_SCENARIO_TYPE.SELF_INTRO]: '自我介绍',
      [SOCIAL_SCENARIO_TYPE.MAKE_FRIENDS]: '交朋友',
      [SOCIAL_SCENARIO_TYPE.CONFLICT_HANDLING]: '冲突处理'
    }
    return typeMap[type] || type
  }

  /**
   * 获取情景难度标签
   */
  const getDifficultyLabel = (difficulty) => {
    const labels = {
      1: { text: '简单', color: '#07c160' },
      2: { text: '中等', color: '#ff9500' },
      3: { text: '困难', color: '#ff4d4f' }
    }
    return labels[difficulty] || labels[1]
  }

  /**
   * 获取评分等级名称
   */
  const getRatingName = (rating) => {
    const ratingMap = {
      [RATING_LEVEL.EXCELLENT]: { text: '优秀', color: '#07c160' },
      [RATING_LEVEL.GOOD]: { text: '良好', color: '#1677ff' },
      [RATING_LEVEL.NEEDS_PRACTICE]: { text: '需练习', color: '#ff9500' }
    }
    return ratingMap[rating] || { text: '未知', color: '#999999' }
  }

  /**
   * 获取技能类型名称
   */
  const getSkillName = (skillType) => {
    const skillMap = {
      [SKILL_TYPE.COMMUNICATION]: '沟通能力',
      [SKILL_TYPE.EMPATHY]: '同理心',
      [SKILL_TYPE.CONFLICT_RESOLUTION]: '冲突解决',
      [SKILL_TYPE.LEADERSHIP]: '领导力',
      [SKILL_TYPE.TEAMWORK]: '团队协作'
    }
    return skillMap[skillType] || skillType
  }

  /**
   * 获取技能图标
   */
  const getSkillIcon = (skillType) => {
    const iconMap = {
      [SKILL_TYPE.COMMUNICATION]: '💬',
      [SKILL_TYPE.EMPATHY]: '❤️',
      [SKILL_TYPE.CONFLICT_RESOLUTION]: '⚖️',
      [SKILL_TYPE.LEADERSHIP]: '👑',
      [SKILL_TYPE.TEAMWORK]: '🤝'
    }
    return iconMap[skillType] || '⭐'
  }

  /**
   * 获取成就稀有度样式
   */
  const getAchievementRarityStyle = (rarity) => {
    const styleMap = {
      common: { color: '#999999', label: '普通' },
      rare: { color: '#1677ff', label: '稀有' },
      epic: { color: '#8477fa', label: '史诗' },
      legendary: { color: '#ff9500', label: '传说' }
    }
    return styleMap[rarity] || styleMap.common
  }

  /**
   * 检查情景是否已完成
   */
  const isScenarioCompleted = (scenarioId) => {
    return completedScenarios.value.includes(scenarioId)
  }

  return {
    // ==================== 状态 ====================
    scenarios,
    currentScenario,
    currentDialogues,
    currentDialogueIndex,
    dialogueResults,
    practiceRecords,
    achievements,
    skillsProgress,
    totalSocialPoints,
    isLoading,
    errorMessage,
    currentTab,
    filterType,
    isPracticing,
    practiceResult,

    // ==================== 计算属性 ====================
    scenariosByType,
    availableScenarios,
    completedScenarios,
    skillsList,
    scenarioTypeOptions,
    earnedAchievements,
    unearnedAchievements,
    currentDialogue,
    practiceProgress,

    // ==================== 初始化 ====================
    init,
    loadAllData,

    // ==================== 加载方法 ====================
    loadScenarios,
    loadScenarioDetail,
    loadPracticeRecords,
    loadAchievements,
    loadSkillsProgress,
    loadTotalPoints,

    // ==================== 练习方法 ====================
    startPractice,
    submitAnswer,
    nextDialogue,
    finishPractice,
    resetPractice,
    getScenarioBestScore,
    getScenarioAvgScore,
    getScenarioCompleteCount,

    // ==================== 辅助方法 ====================
    switchTab,
    setFilterType,
    getScenarioTypeName,
    getDifficultyLabel,
    getRatingName,
    getSkillName,
    getSkillIcon,
    getAchievementRarityStyle,
    isScenarioCompleted
  }
})
