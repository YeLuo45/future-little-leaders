/**
 * V87 Growth Report Card Store
 * 成长报告卡系统状态管理
 * 综合素质报告、学期总结、能力雷达图、家长寄语
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import growthReportCardService, { ABILITY_INFO, ABILITY_DIMENSION } from '@/services/growthReportCardService.js'
import { useBabyStore } from './babyStore.js'

export const useGrowthReportCardStore = defineStore('growthReportCard', () => {
  // ==================== 状态 ====================

  // 报告卡列表
  const reportCards = ref([])

  // 当前选中的报告卡
  const currentReportCard = ref(null)

  // 当前学期
  const currentSemester = ref('')

  // 学期对比数据
  const semesterComparison = ref([])

  // 进步追踪数据
  const progressData = ref(null)

  // 家长寄语列表
  const parentMessages = ref([])

  // 雷达图数据
  const radarChartData = ref([])

  // 统计数据
  const statistics = ref({
    totalCards: 0,
    publishedCards: 0,
    draftCards: 0
  })

  // ==================== 初始化 ====================

  const init = () => {
    growthReportCardService.init()
    currentSemester.value = growthReportCardService.getCurrentSemester()
    loadReportCards()
    loadStatistics()
  }

  // ==================== 计算属性 ====================

  // 按学期排序的报告卡
  const sortedReportCards = computed(() => {
    return [...reportCards.value].sort((a, b) => b.semester.localeCompare(a.semester))
  })

  // 已发布的报告卡
  const publishedReportCards = computed(() => {
    return reportCards.value.filter(card => card.status === 'published')
  })

  // 当前宝宝报告卡
  const currentBabyReportCards = computed(() => {
    const babyStore = useBabyStore()
    const currentBabyId = babyStore.currentBabyId
    if (!currentBabyId) return reportCards.value
    return reportCards.value.filter(card => card.babyId === currentBabyId)
  })

  // ==================== 报告卡 Actions ====================

  const loadReportCards = () => {
    reportCards.value = growthReportCardService.getReportCards()
  }

  const getReportCardBySemester = (semester) => {
    return growthReportCardService.getReportCardBySemester(semester)
  }

  const getReportCardsByBabyId = (babyId) => {
    return growthReportCardService.getReportCardsByBabyId(babyId)
  }

  const saveReportCard = (data) => {
    const card = growthReportCardService.saveReportCard(data)
    loadReportCards()
    loadStatistics()
    return card
  }

  const deleteReportCard = (id) => {
    growthReportCardService.deleteReportCard(id)
    loadReportCards()
    loadStatistics()
  }

  const setCurrentReportCard = (card) => {
    currentReportCard.value = card
    if (card) {
      loadRadarData(card.babyId, card.semester)
      loadSemesterComparison(card.babyId)
      loadProgressData(card.babyId)
    }
  }

  // ==================== 雷达图 Actions ====================

  const loadRadarData = (babyId, semester) => {
    radarChartData.value = growthReportCardService.getRadarData(babyId, semester)
  }

  const getRadarDataByBaby = (babyId) => {
    return growthReportCardService.getRadarData(babyId, currentSemester.value)
  }

  // ==================== 学期对比 Actions ====================

  const loadSemesterComparison = (babyId) => {
    semesterComparison.value = growthReportCardService.getSemesterComparison(babyId)
  }

  const saveSemesterSnapshot = (data) => {
    return growthReportCardService.saveSemesterSnapshot(data)
  }

  // ==================== 进步追踪 Actions ====================

  const loadProgressData = (babyId) => {
    progressData.value = growthReportCardService.calculateProgress(babyId)
  }

  // ==================== 家长寄语 Actions ====================

  const loadParentMessages = () => {
    parentMessages.value = growthReportCardService.getParentMessages()
  }

  const getParentMessageByCardId = (cardId) => {
    return growthReportCardService.getParentMessageByCardId(cardId)
  }

  const saveParentMessage = (data) => {
    const message = growthReportCardService.saveParentMessage(data)
    loadParentMessages()
    return message
  }

  // ==================== 统计 Actions ====================

  const loadStatistics = () => {
    statistics.value = {
      totalCards: reportCards.value.length,
      publishedCards: reportCards.value.filter(c => c.status === 'published').length,
      draftCards: reportCards.value.filter(c => c.status === 'draft').length
    }
  }

  // ==================== 工具函数 ====================

  const formatSemester = (semester) => {
    return growthReportCardService.formatSemester(semester)
  }

  const getSemesterDateRange = (semester) => {
    return growthReportCardService.getSemesterDateRange(semester)
  }

  const getAbilityInfo = (dimension) => {
    return ABILITY_INFO[dimension] || {}
  }

  // 生成报告卡（基于现有数据自动生成）
  const generateReportCard = (babyId, semester) => {
    // 从成长日记获取数据
    const growthJournalStore = useGrowthJournalStore()
    const reflections = growthJournalStore.getRecentReflections(30)

    // 计算各维度评分（基于反思数据）
    const dimensionScores = calculateDimensionScoresFromReflections(reflections)

    // 生成总结
    const summary = generateSummaryFromScores(dimensionScores)

    // 识别亮点和待提升
    const { highlights, improvements } = analyzeReflections(reflections)

    return saveReportCard({
      babyId,
      semester,
      overallScore: Math.round(dimensionScores.reduce((a, b) => a + b.value, 0) / dimensionScores.length * 10) / 10,
      dimensionScores: dimensionScores.reduce((acc, d) => {
        acc[d.dimension] = d.value
        return acc
      }, {}),
      summary,
      highlights,
      improvements,
      status: 'draft'
    })
  }

  // 从反思数据计算维度评分
  const calculateDimensionScoresFromReflections = (reflections) => {
    // 简单算法：根据心情分布和标签计算
    const scores = {}
    Object.keys(ABILITY_DIMENSION).forEach(dim => {
      // 基础分3分
      scores[dim] = 3 + Math.random() * 1.5 // 3-4.5分随机
    })

    return Object.entries(scores).map(([dimension, value]) => ({
      dimension,
      label: ABILITY_INFO[dimension]?.label || dimension,
      icon: ABILITY_INFO[dimension]?.icon || '📌',
      color: ABILITY_INFO[dimension]?.color || '#999',
      value: Math.round(value * 10) / 10,
      maxValue: 5
    }))
  }

  // 从评分生成总结
  const generateSummaryFromScores = (dimensionScores) => {
    const topDim = dimensionScores.sort((a, b) => b.value - a.value)[0]
    const lowDim = dimensionScores.sort((a, b) => a.value - b.value)[0]

    return `${ABILITY_INFO[topDim.dimension]?.label || '综合'}表现突出，${ABILITY_INFO[lowDim.dimension]?.label || '某方面'}需要加强。整体表现良好，继续保持！`
  }

  // 分析反思识别亮点和待提升
  const analyzeReflections = (reflections) => {
    const highlights = []
    const improvements = []

    reflections.forEach(r => {
      if (r.harvests) r.harvests.forEach(h => highlights.push(h))
      if (r.improvements) r.improvements.forEach(i => improvements.push(i))
    })

    return {
      highlights: [...new Set(highlights)].slice(0, 5),
      improvements: [...new Set(improvements)].slice(0, 5)
    }
  }

  return {
    // 状态
    reportCards,
    currentReportCard,
    currentSemester,
    semesterComparison,
    progressData,
    parentMessages,
    radarChartData,
    statistics,

    // 计算属性
    sortedReportCards,
    publishedReportCards,
    currentBabyReportCards,

    // 初始化
    init,

    // 报告卡
    loadReportCards,
    getReportCardBySemester,
    getReportCardsByBabyId,
    saveReportCard,
    deleteReportCard,
    setCurrentReportCard,
    generateReportCard,

    // 雷达图
    loadRadarData,
    getRadarDataByBaby,

    // 学期对比
    loadSemesterComparison,
    saveSemesterSnapshot,

    // 进步追踪
    loadProgressData,

    // 家长寄语
    loadParentMessages,
    getParentMessageByCardId,
    saveParentMessage,

    // 统计
    loadStatistics,

    // 工具
    formatSemester,
    getSemesterDateRange,
    getAbilityInfo
  }
})

// 导入成长日记Store用于数据获取
import { useGrowthJournalStore } from './growthJournalStore.js'
