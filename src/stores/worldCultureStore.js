/**
 * V95 World Culture Store
 * 世界文化探索系统状态管理
 * 环球文化之旅、各国风土人情、文化体验活动
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import worldCultureService, {
  CULTURE_TYPE,
  JOURNEY_TYPE,
  CUSTOMS_TYPE,
  ACTIVITIES_TYPE,
  EXPLORE_STATUS
} from '@/services/worldCultureService.js'

export const useWorldCultureStore = defineStore('worldCulture', () => {
  // ==================== 状态 ====================

  // 所有文化数据
  const cultures = ref([])

  // 探索记录
  const explorations = ref([])

  // 收集的印章
  const stamps = ref([])

  // 已完成活动
  const completedActivities = ref([])

  // 当前选中的文化
  const currentCulture = ref(null)

  // 当前Tab
  const currentTab = ref('journey') // journey | customs | activities

  // 当前子Tab
  const currentSubTab = ref('all') // all | world_trip | country_explore | culture_route | ...

  // 加载状态
  const isLoading = ref(false)

  // 错误信息
  const errorMessage = ref('')

  // ==================== 计算属性 ====================

  const babyStore = useBabyStore()
  const currentBabyId = computed(() => babyStore.currentBabyId)
  const currentBaby = computed(() => babyStore.currentBaby)

  // 环球文化之旅
  const journeys = computed(() => {
    return cultures.value.filter(c => c.type === CULTURE_TYPE.JOURNEY)
  })

  // 风土人情
  const customs = computed(() => {
    return cultures.value.filter(c => c.type === CULTURE_TYPE.CUSTOMS)
  })

  // 文化体验活动
  const activities = computed(() => {
    return cultures.value.filter(c => c.type === CULTURE_TYPE.ACTIVITIES)
  })

  // 按子类型筛选
  const culturesBySubType = computed(() => {
    if (currentSubTab.value === 'all') {
      return cultures.value
    }
    return cultures.value.filter(c => c.subType === currentSubTab.value)
  })

  // 获取探索进度
  const cultureProgress = computed(() => {
    const progress = {}
    explorations.value.forEach(e => {
      progress[e.cultureId] = e
    })
    return progress
  })

  // 统计数据
  const statistics = computed(() => {
    if (!currentBabyId.value) {
      return {
        totalCultures: 0,
        completedCultures: 0,
        totalStamps: 0,
        totalActivities: 0,
        totalPoints: 0,
        explorationRate: 0
      }
    }
    return worldCultureService.getStatistics(currentBabyId.value)
  })

  // 已完成的文化数量
  const completedCulturesCount = computed(() => {
    return explorations.value.filter(e => e.status === EXPLORE_STATUS.COMPLETED).length
  })

  // ==================== 动作 ====================

  // 加载数据
  function loadData() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      cultures.value = worldCultureService.getAllCultures()

      if (currentBabyId.value) {
        explorations.value = worldCultureService.getExplorations(currentBabyId.value)
        stamps.value = worldCultureService.getStamps(currentBabyId.value)
        completedActivities.value = worldCultureService.getCompletedActivities(currentBabyId.value)
      }
    } catch (e) {
      errorMessage.value = '加载数据失败'
      console.error('Failed to load world culture data:', e)
    } finally {
      isLoading.value = false
    }
  }

  // 切换主Tab
  function switchTab(tab) {
    currentTab.value = tab
    // 根据tab重置子类型筛选
    switch (tab) {
      case 'journey':
        currentSubTab.value = 'all'
        break
      case 'customs':
        currentSubTab.value = 'all'
        break
      case 'activities':
        currentSubTab.value = 'all'
        break
    }
  }

  // 切换子Tab
  function switchSubTab(subTab) {
    currentSubTab.value = subTab
  }

  // 选择文化
  function selectCulture(culture) {
    currentCulture.value = culture
  }

  // 开始探索
  function startExploration(cultureId) {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }

    const exploration = worldCultureService.startExploration(currentBabyId.value, cultureId)
    if (exploration) {
      // 更新本地状态
      const index = explorations.value.findIndex(e => e.id === exploration.id)
      if (index >= 0) {
        explorations.value[index] = exploration
      } else {
        explorations.value.push(exploration)
      }
    }
    return exploration
  }

  // 完成探索
  function completeExploration(cultureId) {
    if (!currentBabyId.value) return null

    const exploration = worldCultureService.completeExploration(currentBabyId.value, cultureId)
    if (exploration) {
      // 收集印章
      const stamp = worldCultureService.collectStamp(currentBabyId.value, cultureId)
      if (stamp) {
        stamps.value.push(stamp)
      }

      // 更新本地探索记录
      const index = explorations.value.findIndex(e => e.cultureId === cultureId)
      if (index >= 0) {
        explorations.value[index] = exploration
      }
    }
    return exploration
  }

  // 完成文化活动
  function completeActivity(cultureId, activityName) {
    if (!currentBabyId.value) return null

    const completed = worldCultureService.completeActivity(currentBabyId.value, cultureId, activityName)
    if (completed) {
      completedActivities.value.push(completed)
    }
    return completed
  }

  // 检查文化是否已探索
  function isCultureExplored(cultureId) {
    const exploration = explorations.value.find(e => e.cultureId === cultureId)
    return exploration && exploration.status === EXPLORE_STATUS.COMPLETED
  }

  // 检查文化是否正在进行中
  function isCultureInProgress(cultureId) {
    const exploration = explorations.value.find(e => e.cultureId === cultureId)
    return exploration && exploration.status === EXPLORE_STATUS.IN_PROGRESS
  }

  // 获取文化探索状态
  function getCultureStatus(cultureId) {
    const exploration = explorations.value.find(e => e.cultureId === cultureId)
    return exploration ? exploration.status : null
  }

  // 检查印章是否已收集
  function isStampCollected(cultureId) {
    return stamps.value.some(s => s.cultureId === cultureId)
  }

  // 清除错误
  function clearError() {
    errorMessage.value = ''
  }

  return {
    // 状态
    cultures,
    explorations,
    stamps,
    completedActivities,
    currentCulture,
    currentTab,
    currentSubTab,
    isLoading,
    errorMessage,

    // 计算属性
    journeys,
    customs,
    activities,
    culturesBySubType,
    cultureProgress,
    statistics,
    completedCulturesCount,

    // 动作
    loadData,
    switchTab,
    switchSubTab,
    selectCulture,
    startExploration,
    completeExploration,
    completeActivity,
    isCultureExplored,
    isCultureInProgress,
    getCultureStatus,
    isStampCollected,
    clearError
  }
})
