import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import geographyService from '@/services/geographyService.js'

/**
 * V62 Geography Store
 * 世界地理与文化状态管理
 */
export const useGeographyStore = defineStore('geography', () => {
  // ==================== 状态 ====================
  const destinations = ref([])
  const checkins = ref([])
  const cultures = ref([])
  const learnedFacts = ref([])
  const penPals = ref([])
  const languages = ref([])
  const userStats = ref(null)
  const badges = ref([])
  const isLoading = ref(false)

  // ==================== 初始化 ====================
  const init = () => {
    loadAllData()
  }

  const loadAllData = () => {
    destinations.value = geographyService.getDestinations()
    checkins.value = geographyService.getCheckins()
    cultures.value = geographyService.getLearnedCultures()
    learnedFacts.value = geographyService.getLearnedFacts()
    penPals.value = geographyService.getPenPals()
    languages.value = geographyService.getLanguages()
    userStats.value = geographyService.getUserStats()
    badges.value = geographyService.getBadges()
  }

  // ==================== 计算属性 ====================

  // 总积分
  const totalPoints = computed(() => userStats.value?.totalPoints || 0)

  // 访问的国家数
  const countriesVisited = computed(() => userStats.value?.countriesVisited || 0)

  // 探索的文化数
  const culturesExplored = computed(() => userStats.value?.culturesExplored || 0)

  // 已学习的地理知识
  const factsLearned = computed(() => userStats.value?.factsLearned || 0)

  // 笔友数量
  const penPalsCount = computed(() => userStats.value?.penPalsCount || 0)

  // 已访问的目的地
  const visitedDestinations = computed(() => {
    const visitedIds = checkins.value.map(c => c.destinationId)
    return destinations.value.filter(d => visitedIds.includes(d.id))
  })

  // 未访问的目的地
  const unvisitedDestinations = computed(() => {
    const visitedIds = checkins.value.map(c => c.destinationId)
    return destinations.value.filter(d => !visitedIds.includes(d.id))
  })

  // 地理知识列表
  const geographyFacts = computed(() => geographyService.getGeographyFacts())
  const geographyCategories = computed(() => geographyService.getGeographyCategories())

  // 文化内容列表
  const cultureList = computed(() => geographyService.getCultures())
  const cultureCategories = computed(() => geographyService.getCultureCategories())

  // 地理测试
  const geographyQuiz = computed(() => geographyService.getGeographyQuiz())

  // 徽章定义
  const badgeDefinitions = computed(() => geographyService.getBadgeDefinitions())

  // 推荐笔友
  const recommendedPenPals = computed(() => geographyService.getRecommendedPenPals())

  // ==================== 旅行相关方法 ====================

  // 旅行打卡
  const checkin = (destinationId) => {
    const result = geographyService.checkin(destinationId)
    if (result) {
      checkins.value = geographyService.getCheckins()
      userStats.value = geographyService.getUserStats()
      badges.value = geographyService.getBadges()
      uni.$emit('geographyUpdated', { type: 'checkin' })
    }
    return result
  }

  // 按大洲筛选目的地
  const getDestinationsByContinent = (continent) => {
    return geographyService.getDestinationsByContinent(continent)
  }

  // 获取目的地详情
  const getDestination = (id) => {
    return geographyService.getDestination(id)
  }

  // ==================== 文化相关方法 ====================

  // 学习文化
  const learnCulture = (cultureId) => {
    geographyService.learnCulture(cultureId)
    cultures.value = geographyService.getLearnedCultures()
    userStats.value = geographyService.getUserStats()
    badges.value = geographyService.getBadges()
    uni.$emit('geographyUpdated', { type: 'culture' })
  }

  // 获取文化内容
  const getCulture = (id) => {
    return geographyService.getCulture(id)
  }

  // 获取文化分类
  const getCulturesByCategory = (category) => {
    return geographyService.getCultures(category)
  }

  // 检查文化是否已学习
  const isCultureLearned = (cultureId) => {
    return cultures.value.includes(cultureId)
  }

  // ==================== 地理知识相关方法 ====================

  // 学习地理知识
  const learnGeographyFact = (factId) => {
    geographyService.learnGeographyFact(factId)
    learnedFacts.value = geographyService.getLearnedFacts()
    userStats.value = geographyService.getUserStats()
    badges.value = geographyService.getBadges()
    uni.$emit('geographyUpdated', { type: 'fact' })
  }

  // 检查知识是否已学习
  const isFactLearned = (factId) => {
    return learnedFacts.value.includes(factId)
  }

  // 获取地理分类知识
  const getFactsByCategory = (category) => {
    return geographyService.getGeographyFacts(category)
  }

  // ==================== 语言学习相关方法 ====================

  // 学习语言基础
  const learnLanguageBasics = (languageId) => {
    geographyService.learnLanguageBasics(languageId)
    languages.value = geographyService.getLanguages()
    userStats.value = geographyService.getUserStats()
    badges.value = geographyService.getBadges()
    uni.$emit('geographyUpdated', { type: 'language' })
  }

  // 更新语言进度
  const updateLanguageProgress = (languageId, progress) => {
    geographyService.updateLanguageProgress(languageId, progress)
    languages.value = geographyService.getLanguages()
  }

  // ==================== 笔友相关方法 ====================

  // 添加笔友
  const addPenPal = (palTemplateId) => {
    const result = geographyService.addPenPal(palTemplateId)
    if (result) {
      penPals.value = geographyService.getPenPals()
      userStats.value = geographyService.getUserStats()
      badges.value = geographyService.getBadges()
      uni.$emit('geographyUpdated', { type: 'penpal' })
    }
    return result
  }

  // 发送信件
  const sendLetter = (palId, content) => {
    return geographyService.sendLetter(palId, content)
  }

  // ==================== 通用方法 ====================

  // 刷新数据
  const refresh = () => {
    loadAllData()
  }

  // 清空所有数据
  const clearAllData = () => {
    geographyService.clearAllData()
    loadAllData()
    uni.$emit('geographyUpdated', { type: 'all' })
  }

  return {
    // 状态
    destinations,
    checkins,
    cultures,
    learnedFacts,
    penPals,
    languages,
    userStats,
    badges,
    isLoading,

    // 计算属性 - 统计
    totalPoints,
    countriesVisited,
    culturesExplored,
    factsLearned,
    penPalsCount,

    // 计算属性 - 目的地
    visitedDestinations,
    unvisitedDestinations,

    // 计算属性 - 知识
    geographyFacts,
    geographyCategories,
    geographyQuiz,

    // 计算属性 - 文化
    cultureList,
    cultureCategories,

    // 计算属性 - 其他
    badgeDefinitions,
    recommendedPenPals,

    // 方法 - 通用
    init,
    loadAllData,
    refresh,
    clearAllData,

    // 方法 - 旅行
    checkin,
    getDestinationsByContinent,
    getDestination,

    // 方法 - 文化
    learnCulture,
    getCulture,
    getCulturesByCategory,
    isCultureLearned,

    // 方法 - 地理知识
    learnGeographyFact,
    isFactLearned,
    getFactsByCategory,

    // 方法 - 语言
    learnLanguageBasics,
    updateLanguageProgress,

    // 方法 - 笔友
    addPenPal,
    sendLetter
  }
})
