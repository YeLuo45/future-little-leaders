import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import interestDiscoveryService from '@/services/interestDiscoveryService.js'

/**
 * V98 Interest Discovery Store
 * 兴趣发现状态管理 - 兴趣测评、推荐探索、兴趣追踪
 */
export const useInterestDiscoveryStore = defineStore('interestDiscovery', () => {
  // 状态
  const interestProfile = ref(null)
  const assessmentAnswers = ref([])
  const currentQuestionIndex = ref(0)
  const isAssessmentComplete = ref(false)
  const explorationRecords = ref([])
  const trackingRecords = ref([])
  const badges = ref([])
  const recommendedActivities = ref([])
  const learningPaths = ref([])
  const isLoading = ref(false)
  const showBadgeModal = ref(false)
  const newBadges = ref([])

  // 初始化
  const init = () => {
    loadInterestProfile()
    loadExplorationRecords()
    loadTrackingRecords()
    loadBadgeRecords()
    loadRecommendedActivities()
  }

  // 加载兴趣档案
  const loadInterestProfile = () => {
    interestProfile.value = interestDiscoveryService.getInterestProfile()
    if (interestProfile.value) {
      isAssessmentComplete.value = true
    }
  }

  // 加载探索记录
  const loadExplorationRecords = () => {
    explorationRecords.value = interestDiscoveryService.getExplorationRecords()
  }

  // 加载追踪记录
  const loadTrackingRecords = () => {
    trackingRecords.value = interestDiscoveryService.getTrackingRecords()
  }

  // 加载徽章记录
  const loadBadgeRecords = () => {
    badges.value = interestDiscoveryService.getBadgeRecords()
  }

  // 加载推荐活动
  const loadRecommendedActivities = () => {
    recommendedActivities.value = interestDiscoveryService.getRecommendedActivities(
      interestProfile.value,
      6
    )
  }

  // 开始测评
  const startAssessment = () => {
    assessmentAnswers.value = []
    currentQuestionIndex.value = 0
    isAssessmentComplete.value = false
  }

  // 回答测评问题
  const answerQuestion = (answerIndex) => {
    assessmentAnswers.value[currentQuestionIndex.value] = answerIndex
  }

  // 下一题
  const nextQuestion = () => {
    if (currentQuestionIndex.value < interestDiscoveryService.ASSESSMENT_QUESTIONS.length - 1) {
      currentQuestionIndex.value++
      return true
    }
    return false
  }

  // 上一题
  const prevQuestion = () => {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--
      return true
    }
    return false
  }

  // 提交测评
  const submitAssessment = () => {
    if (assessmentAnswers.value.length < interestDiscoveryService.ASSESSMENT_QUESTIONS.length) {
      uni.showToast({ title: '请完成所有问题', icon: 'none' })
      return null
    }

    isLoading.value = true
    try {
      // 处理测评结果
      const dimensionScores = interestDiscoveryService.processAssessmentResults(assessmentAnswers.value)
      
      // 保存答案
      interestDiscoveryService.saveAssessmentAnswers(assessmentAnswers.value)
      
      // 创建或更新兴趣档案
      if (interestProfile.value) {
        interestProfile.value = interestDiscoveryService.updateInterestProfile({
          ...interestDiscoveryService.createInterestProfile(dimensionScores),
          assessmentCount: interestProfile.value.assessmentCount + 1,
          lastAssessmentDate: new Date().toISOString().split('T')[0]
        })
      } else {
        interestProfile.value = interestDiscoveryService.createInterestProfile(dimensionScores)
      }
      
      isAssessmentComplete.value = true
      assessmentAnswers.value = []
      
      // 检查并授予徽章
      const awardedBadges = interestDiscoveryService.checkAndAwardBadges()
      if (awardedBadges.length > 0) {
        newBadges.value = awardedBadges
        showBadgeModal.value = true
        loadBadgeRecords()
      }
      
      // 刷新推荐
      loadRecommendedActivities()
      
      uni.showToast({ title: '测评完成！', icon: 'success' })
      uni.$emit('interestAssessmentComplete', interestProfile.value)
      
      return interestProfile.value
    } finally {
      isLoading.value = false
    }
  }

  // 完成探索活动
  const completeExploration = (activity) => {
    const record = interestDiscoveryService.addExplorationRecord(activity)
    if (record) {
      explorationRecords.value.push(record)
      
      // 检查徽章
      const awardedBadges = interestDiscoveryService.checkAndAwardBadges()
      if (awardedBadges.length > 0) {
        newBadges.value = awardedBadges
        showBadgeModal.value = true
        loadBadgeRecords()
      }
      
      // 刷新推荐
      loadRecommendedActivities()
      
      uni.$emit('explorationCompleted', record)
    }
    return record
  }

  // 添加追踪记录
  const addTrackingEntry = (dimensionId, activity, notes) => {
    const record = interestDiscoveryService.addTrackingRecord(dimensionId, activity, notes)
    if (record) {
      trackingRecords.value.push(record)
      
      // 检查徽章
      const awardedBadges = interestDiscoveryService.checkAndAwardBadges()
      if (awardedBadges.length > 0) {
        newBadges.value = awardedBadges
        showBadgeModal.value = true
        loadBadgeRecords()
      }
    }
    return record
  }

  // 关闭徽章弹窗
  const closeBadgeModal = () => {
    showBadgeModal.value = false
    newBadges.value = []
  }

  // 计算属性
  const hasProfile = computed(() => !!interestProfile.value)

  const topInterests = computed(() => {
    return interestProfile.value?.topInterests || []
  })

  const assessmentProgress = computed(() => {
    const total = interestDiscoveryService.ASSESSMENT_QUESTIONS.length
    const answered = assessmentAnswers.value.filter(a => a !== undefined && a !== null).length
    return Math.round((answered / total) * 100)
  })

  const totalExplorations = computed(() => {
    return explorationRecords.value.length
  })

  const uniqueExplorations = computed(() => {
    return new Set(explorationRecords.value.map(r => r.activityId)).size
  })

  const explorationByDimension = computed(() => {
    const counts = {}
    explorationRecords.value.forEach(r => {
      counts[r.dimension] = (counts[r.dimension] || 0) + 1
    })
    return counts
  })

  const trackingStreak = computed(() => {
    return interestDiscoveryService.calculateTrackingStreak(trackingRecords.value)
  })

  const trackingByDimension = computed(() => {
    const grouped = {}
    trackingRecords.value.forEach(r => {
      if (!grouped[r.dimensionId]) {
        grouped[r.dimensionId] = []
      }
      grouped[r.dimensionId].push(r)
    })
    return grouped
  })

  const recentBadges = computed(() => {
    return badges.value.slice(-5).reverse()
  })

  const allDimensions = computed(() => {
    return Object.values(interestDiscoveryService.INTEREST_DIMENSIONS)
  })

  const learningPathData = computed(() => {
    const paths = []
    allDimensions.value.forEach(dim => {
      paths.push(interestDiscoveryService.getLearningPath(dim.id))
    })
    return paths
  })

  const completedDimensions = computed(() => {
    return Object.keys(explorationByDimension.value)
  })

  const expGainedFromExploration = computed(() => {
    return explorationRecords.value.reduce((sum, r) => sum + (r.expGained || 0), 0)
  })

  return {
    // 状态
    interestProfile,
    assessmentAnswers,
    currentQuestionIndex,
    isAssessmentComplete,
    explorationRecords,
    trackingRecords,
    badges,
    recommendedActivities,
    learningPaths,
    isLoading,
    showBadgeModal,
    newBadges,

    // 方法
    init,
    loadInterestProfile,
    loadExplorationRecords,
    loadTrackingRecords,
    loadBadgeRecords,
    loadRecommendedActivities,
    startAssessment,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    submitAssessment,
    completeExploration,
    addTrackingEntry,
    closeBadgeModal,

    // 计算属性
    hasProfile,
    topInterests,
    assessmentProgress,
    totalExplorations,
    uniqueExplorations,
    explorationByDimension,
    trackingStreak,
    trackingByDimension,
    recentBadges,
    allDimensions,
    learningPathData,
    completedDimensions,
    expGainedFromExploration
  }
})
