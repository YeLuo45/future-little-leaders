import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import gamificationService from '@/services/gamificationService.js'

/**
 * V23 Gamification Store
 * 管理赛季挑战、徽章进化、排行榜
 */
export const useGamificationStore = defineStore('gamification', () => {
  // 状态
  const currentSeason = ref(null)
  const seasonalChallenges = ref([])
  const userBadges = ref({})
  const userFragments = ref(0)
  const leaderboard = ref([])
  const leaderboardScope = ref('global')
  const historicalSeasons = ref([])
  const seasonalProgress = ref({})
  const showEvolutionAnimation = ref(false)
  const evolvingBadge = ref(null)

  // 初始化
  const init = () => {
    loadCurrentSeason()
    loadSeasonalChallenges()
    loadUserBadges()
    loadUserFragments()
    loadHistoricalSeasons()
    loadSeasonalProgress()
  }

  // 加载当前赛季
  const loadCurrentSeason = () => {
    currentSeason.value = gamificationService.getCurrentSeason()
  }

  // 加载赛季任务
  const loadSeasonalChallenges = () => {
    seasonalChallenges.value = gamificationService.getSeasonalChallenges()
  }

  // 加载用户徽章
  const loadUserBadges = () => {
    userBadges.value = gamificationService.getUserBadges()
  }

  // 加载用户碎片
  const loadUserFragments = () => {
    userFragments.value = gamificationService.getUserFragments()
  }

  // 加载历史赛季
  const loadHistoricalSeasons = () => {
    historicalSeasons.value = gamificationService.getHistoricalSeasons()
  }

  // 加载赛季进度
  const loadSeasonalProgress = () => {
    try {
      const stored = uni.getStorageSync('user_seasonal_progress')
      seasonalProgress.value = stored ? JSON.parse(stored) : {}
    } catch (e) {
      seasonalProgress.value = {}
    }
  }

  // 保存赛季进度
  const saveSeasonalProgress = () => {
    uni.setStorageSync('user_seasonal_progress', JSON.stringify(seasonalProgress.value))
  }

  // 更新任务进度
  const updateChallengeProgress = (challengeId, progress) => {
    const challenge = seasonalChallenges.value.find(c => c.id === challengeId)
    if (challenge) {
      challenge.progress = Math.min(progress, challenge.target)
      checkChallengeCompletion(challenge)
    }
  }

  // 检查任务完成
  const checkChallengeCompletion = (challenge) => {
    if (challenge.progress >= challenge.target && challenge.status === 'ongoing') {
      challenge.status = 'completed'
      // 发放奖励
      const pointsStore = null // 暂不依赖
      if (challenge.pointsReward) {
        uni.$emit('seasonalRewardEarned', { points: challenge.pointsReward })
      }
      if (challenge.badgeReward) {
        unlockSeasonalBadge(challenge.badgeReward)
      }
      uni.$emit('challengeCompleted', challenge)
    }
  }

  // 解锁赛季徽章
  const unlockSeasonalBadge = (badgeReward) => {
    const result = gamificationService.unlockBadge(badgeReward.id, badgeReward.tier)
    userBadges.value = gamificationService.getUserBadges()
    uni.$emit('badgeUnlocked', { badgeId: badgeReward.id, tier: badgeReward.tier })
    return result
  }

  // 计算属性
  const currentSeasonInfo = computed(() => {
    if (!currentSeason.value) return null
    const { startDate, endDate } = gamificationService.getSeasonDateRange(currentSeason.value)
    const now = new Date()
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    const elapsedDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))
    const remainingDays = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)))
    return {
      ...currentSeason.value,
      startDate,
      endDate,
      totalDays,
      elapsedDays,
      remainingDays,
      progressPercent: Math.round((elapsedDays / totalDays) * 100)
    }
  })

  const completedChallenges = computed(() => {
    return seasonalChallenges.value.filter(c => c.status === 'completed')
  })

  const ongoingChallenges = computed(() => {
    return seasonalChallenges.value.filter(c => c.status === 'ongoing')
  })

  const overallProgress = computed(() => {
    if (seasonalChallenges.value.length === 0) return 0
    const completed = completedChallenges.value.length
    return Math.round((completed / seasonalChallenges.value.length) * 100)
  })

  // 徽章相关计算属性
  const allBadges = computed(() => gamificationService.getBadgeList())

  const unlockedBadgeList = computed(() => {
    const unlocked = []
    allBadges.value.forEach(badge => {
      if (userBadges.value[badge.id]?.unlocked) {
        unlocked.push({
          ...badge,
          tier: userBadges.value[badge.id].tier || badge.tier,
          unlockedAt: userBadges.value[badge.id].unlockedAt,
          evolvedAt: userBadges.value[badge.id].evolvedAt
        })
      }
    })
    return unlocked
  })

  const lockedBadgeList = computed(() => {
    return allBadges.value.filter(badge => !userBadges.value[badge.id]?.unlocked)
  })

  const badgesByCategory = computed(() => {
    const categories = {
      task: [],
      streak: [],
      points: [],
      seasonal: [],
      family: [],
      achievement: []
    }
    allBadges.value.forEach(badge => {
      if (userBadges.value[badge.id]?.unlocked) {
        badge.userTier = userBadges.value[badge.id].tier || badge.tier
        badge.unlockedAt = userBadges.value[badge.id].unlockedAt
      }
      if (categories[badge.category]) {
        categories[badge.category].push(badge)
      }
    })
    return categories
  })

  const totalBadgesCount = computed(() => allBadges.value.length)

  const unlockedBadgesCount = computed(() => unlockedBadgeList.value.length)

  const badgeCompletionRate = computed(() => {
    if (totalBadgesCount.value === 0) return 0
    return Math.round((unlockedBadgesCount.value / totalBadgesCount.value) * 100)
  })

  // 进化徽章
  const evolveBadge = (badgeId) => {
    const badge = allBadges.value.find(b => b.id === badgeId)
    if (!badge) return false

    const userBadge = userBadges.value[badgeId]
    if (!userBadge?.unlocked) return false

    const currentTier = userBadge.tier || badge.tier
    const tierOrder = ['bronze', 'silver', 'gold', 'diamond']
    const currentIndex = tierOrder.indexOf(currentTier)
    
    if (currentIndex >= tierOrder.length - 1) return false // 已达最高

    const nextTier = tierOrder[currentIndex + 1]
    const requiredFragments = gamificationService.getBadgeFragmentsRequired(nextTier)

    if (userFragments.value < requiredFragments) {
      uni.showToast({ title: `需要${requiredFragments}碎片`, icon: 'none' })
      return false
    }

    // 扣除碎片
    userFragments.value -= requiredFragments
    uni.setStorageSync('user_fragments', userFragments.value.toString())

    // 更新徽章等级
    const result = gamificationService.updateBadgeEvolution(badgeId, nextTier)
    userBadges.value = gamificationService.getUserBadges()

    // 触发进化动画
    evolvingBadge.value = { ...badge, newTier, oldTier: currentTier }
    showEvolutionAnimation.value = true

    uni.$emit('badgeEvolved', { badgeId, oldTier: currentTier, newTier })
    
    setTimeout(() => {
      showEvolutionAnimation.value = false
      evolvingBadge.value = null
    }, 3000)

    return true
  }

  // 获取徽章当前等级
  const getBadgeTier = (badgeId) => {
    const badge = allBadges.value.find(b => b.id === badgeId)
    if (!badge) return 'bronze'
    return userBadges.value[badgeId]?.tier || badge.tier
  }

  // 获取徽章是否已解锁
  const isBadgeUnlocked = (badgeId) => {
    return userBadges.value[badgeId]?.unlocked || false
  }

  // 获取徽章进化信息
  const getBadgeEvolutionInfo = (badgeId) => {
    const badge = allBadges.value.find(b => b.id === badgeId)
    if (!badge) return null

    const currentTier = getBadgeTier(badgeId)
    const tierOrder = ['bronze', 'silver', 'gold', 'diamond']
    const currentIndex = tierOrder.indexOf(currentTier)
    
    if (currentIndex >= tierOrder.length - 1) {
      return { canEvolve: false, isMaxTier: true, nextTier: null, requiredFragments: 0 }
    }

    const nextTier = tierOrder[currentIndex + 1]
    const requiredFragments = gamificationService.getBadgeFragmentsRequired(nextTier)
    const canEvolve = userFragments.value >= requiredFragments

    return {
      canEvolve,
      isMaxTier: false,
      nextTier,
      requiredFragments,
      currentFragments: userFragments.value
    }
  }

  // 排行榜
  const loadLeaderboard = (scope = 'global') => {
    leaderboardScope.value = scope
    leaderboard.value = gamificationService.getSeasonalLeaderboard(scope)
  }

  const changeLeaderboardScope = (scope) => {
    loadLeaderboard(scope)
  }

  // 获取赛季奖励配置
  const getSeasonRewards = () => {
    return gamificationService.getSeasonRewards()
  }

  // 添加碎片（完成任务等）
  const earnFragments = (count) => {
    userFragments.value = gamificationService.addFragments(count)
    uni.$emit('fragmentsEarned', { count, total: userFragments.value })
  }

  return {
    // 状态
    currentSeason,
    seasonalChallenges,
    userBadges,
    userFragments,
    leaderboard,
    leaderboardScope,
    historicalSeasons,
    seasonalProgress,
    showEvolutionAnimation,
    evolvingBadge,

    // 计算属性
    currentSeasonInfo,
    completedChallenges,
    ongoingChallenges,
    overallProgress,
    allBadges,
    unlockedBadgeList,
    lockedBadgeList,
    badgesByCategory,
    totalBadgesCount,
    unlockedBadgesCount,
    badgeCompletionRate,

    // 方法
    init,
    updateChallengeProgress,
    evolveBadge,
    getBadgeTier,
    isBadgeUnlocked,
    getBadgeEvolutionInfo,
    loadLeaderboard,
    changeLeaderboardScope,
    getSeasonRewards,
    earnFragments
  }
})
