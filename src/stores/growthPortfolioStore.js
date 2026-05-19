import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import growthPortfolioService from '@/services/growthPortfolioService.js'

/**
 * V99 Growth Portfolio Store
 * 成长档案袋状态管理 - 综合素质档案、作品集管理、成长时间线
 */
export const useGrowthPortfolioStore = defineStore('growthPortfolio', () => {
  // 状态
  const currentPortfolio = ref(null)
  const works = ref([])
  const timeline = ref([])
  const milestones = ref([])
  const currentBabyId = ref(null)
  const isLoading = ref(false)
  const selectedCategory = ref(null)

  // 初始化
  const init = (babyId) => {
    setCurrentBaby(babyId)
    loadPortfolio()
    loadWorks()
    loadTimeline()
    loadMilestones()
  }

  // 设置当前宝宝
  const setCurrentBaby = (babyId) => {
    currentBabyId.value = babyId
  }

  // 加载档案
  const loadPortfolio = () => {
    if (!currentBabyId.value) return
    currentPortfolio.value = growthPortfolioService.getPortfolio(currentBabyId.value)
  }

  // 加载作品
  const loadWorks = () => {
    if (!currentBabyId.value) return
    works.value = growthPortfolioService.getWorks(currentBabyId.value)
  }

  // 加载时间线
  const loadTimeline = () => {
    if (!currentBabyId.value) return
    timeline.value = growthPortfolioService.getTimeline(currentBabyId.value)
  }

  // 加载里程碑
  const loadMilestones = () => {
    if (!currentBabyId.value) return
    milestones.value = growthPortfolioService.getMilestones(currentBabyId.value)
  }

  // 更新档案封面
  const updateCover = (coverImage, title) => {
    if (!currentBabyId.value) return
    currentPortfolio.value = growthPortfolioService.updatePortfolioCover(
      currentBabyId.value,
      coverImage,
      title
    )
  }

  // 添加档案记录
  const addEntry = (categoryId, entry) => {
    if (!currentBabyId.value) return null
    const newEntry = growthPortfolioService.addPortfolioEntry(
      currentBabyId.value,
      categoryId,
      entry
    )
    loadPortfolio()
    return newEntry
  }

  // 添加作品
  const addWork = (workData) => {
    if (!currentBabyId.value) return null
    const newWork = growthPortfolioService.addWork(currentBabyId.value, workData)
    loadWorks()
    return newWork
  }

  // 更新作品
  const updateWork = (workId, updates) => {
    const work = growthPortfolioService.updateWork(workId, updates)
    loadWorks()
    return work
  }

  // 删除作品
  const removeWork = (workId) => {
    growthPortfolioService.deleteWork(workId)
    loadWorks()
  }

  // 添加时间线事件
  const addEvent = (eventData) => {
    if (!currentBabyId.value) return null
    const newEvent = growthPortfolioService.addTimelineEvent(currentBabyId.value, eventData)
    loadTimeline()
    return newEvent
  }

  // 删除时间线事件
  const removeEvent = (eventId) => {
    growthPortfolioService.deleteTimelineEvent(eventId)
    loadTimeline()
  }

  // 添加里程碑
  const addMilestoneItem = (milestoneData) => {
    if (!currentBabyId.value) return null
    const newMilestone = growthPortfolioService.addMilestone(currentBabyId.value, milestoneData)
    loadMilestones()
    return newMilestone
  }

  // 达成里程碑
  const achieveMilestoneItem = (milestoneId, achievedDate) => {
    const milestone = growthPortfolioService.achieveMilestone(milestoneId, achievedDate)
    loadMilestones()
    return milestone
  }

  // 导出档案
  const exportData = () => {
    if (!currentBabyId.value) return null
    return growthPortfolioService.exportPortfolioData(currentBabyId.value)
  }

  // 生成报告
  const generateReport = (babyName) => {
    if (!currentBabyId.value) return ''
    return growthPortfolioService.generatePortfolioReport(currentBabyId.value, babyName)
  }

  // 计算属性
  const workStats = computed(() => {
    return growthPortfolioService.getWorkStatistics(currentBabyId.value)
  })

  const achievedMilestones = computed(() => {
    return milestones.value.filter(m => m.isAchieved)
  })

  const pendingMilestones = computed(() => {
    return milestones.value.filter(m => !m.isAchieved)
  })

  const worksByType = computed(() => {
    const grouped = {}
    works.value.forEach(work => {
      if (!grouped[work.type]) {
        grouped[work.type] = []
      }
      grouped[work.type].push(work)
    })
    return grouped
  })

  const timelineByYear = computed(() => {
    const grouped = {}
    timeline.value.forEach(event => {
      const year = new Date(event.date).getFullYear()
      if (!grouped[year]) {
        grouped[year] = []
      }
      grouped[year].push(event)
    })
    return grouped
  })

  const sortedYears = computed(() => {
    return Object.keys(timelineByYear.value).sort((a, b) => b - a)
  })

  return {
    // 状态
    currentPortfolio,
    works,
    timeline,
    milestones,
    currentBabyId,
    isLoading,
    selectedCategory,

    // 方法
    init,
    setCurrentBaby,
    loadPortfolio,
    loadWorks,
    loadTimeline,
    loadMilestones,
    updateCover,
    addEntry,
    addWork,
    updateWork,
    removeWork,
    addEvent,
    removeEvent,
    addMilestoneItem,
    achieveMilestoneItem,
    exportData,
    generateReport,

    // 计算属性
    workStats,
    achievedMilestones,
    pendingMilestones,
    worksByType,
    timelineByYear,
    sortedYears
  }
})
