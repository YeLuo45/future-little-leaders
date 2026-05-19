/**
 * V87 Growth Report Card Service
 * 成长报告卡系统服务层
 * 综合素质报告、学期总结、能力雷达图、家长寄语
 */

// ============================================================================
// Types & Constants
// ============================================================================

// 能力维度
export const ABILITY_DIMENSION = {
  INTELLECT: 'intellect',         // 智力
  EMOTION: 'emotion',             // 情商
  SOCIAL: 'social',               // 社交
  PHYSICAL: 'physical',           // 体能
  CREATIVITY: 'creativity',       // 创造力
  LANGUAGE: 'language',           // 语言
  INDEPENDENCE: 'independence'    // 自立
}

export const ABILITY_INFO = {
  [ABILITY_DIMENSION.INTELLECT]: { label: '智力发展', icon: '🧠', color: '#1890FF' },
  [ABILITY_DIMENSION.EMOTION]: { label: '情商培养', icon: '💗', color: '#EB2F96' },
  [ABILITY_DIMENSION.SOCIAL]: { label: '社交能力', icon: '👨‍👩‍👧', color: '#52C41A' },
  [ABILITY_DIMENSION.PHYSICAL]: { label: '体能发展', icon: '💪', color: '#FA8C16' },
  [ABILITY_DIMENSION.CREATIVITY]: { label: '创造力', icon: '🎨', color: '#722ED1' },
  [ABILITY_DIMENSION.LANGUAGE]: { label: '语言能力', icon: '📚', color: '#13C2C2' },
  [ABILITY_DIMENSION.INDEPENDENCE]: { label: '自立能力', icon: '⭐', color: '#FAAD14' }
}

// 报告状态
export const REPORT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
}

// localStorage keys
const REPORT_CARD_KEY = 'growth_report_card_data'
const PARENT_MESSAGE_KEY = 'growth_report_parent_messages'
const SEMESTER_COMPARE_KEY = 'growth_report_semester_compare'

// ============================================================================
// Helper Functions
// ============================================================================

const generateId = () => {
  return 'grc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

const getLocalData = (key, defaultValue = []) => {
  try {
    const data = uni.getStorageSync(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (e) {
    console.error(`Failed to get ${key}:`, e)
    return defaultValue
  }
}

const setLocalData = (key, data) => {
  try {
    uni.setStorageSync(key, JSON.stringify(data))
  } catch (e) {
    console.error(`Failed to set ${key}:`, e)
  }
}

// ============================================================================
// Service API
// ============================================================================

const growthReportCardService = {
  // -------------------- 初始化 --------------------
  init() {
    if (!uni.getStorageSync(REPORT_CARD_KEY)) {
      uni.setStorageSync(REPORT_CARD_KEY, '[]')
    }
    if (!uni.getStorageSync(PARENT_MESSAGE_KEY)) {
      uni.setStorageSync(PARENT_MESSAGE_KEY, '[]')
    }
    if (!uni.getStorageSync(SEMESTER_COMPARE_KEY)) {
      uni.setStorageSync(SEMESTER_COMPARE_KEY, '[]')
    }
  },

  // -------------------- 报告卡数据 --------------------

  // 获取所有报告卡
  getReportCards() {
    return getLocalData(REPORT_CARD_KEY)
  },

  // 获取指定学期的报告卡
  getReportCardBySemester(semester) {
    const cards = this.getReportCards()
    return cards.find(c => c.semester === semester)
  },

  // 获取指定宝宝ID的报告卡
  getReportCardsByBabyId(babyId) {
    const cards = this.getReportCards()
    return cards.filter(c => c.babyId === babyId)
  },

  // 创建/更新报告卡
  saveReportCard(data) {
    const cards = this.getReportCards()
    const now = new Date().toISOString()
    const existingIndex = cards.findIndex(c => c.semester === data.semester && c.babyId === data.babyId)

    const card = {
      id: existingIndex >= 0 ? cards[existingIndex].id : generateId(),
      babyId: data.babyId,
      semester: data.semester, // 格式: "2024-1" 或 "2024-2"
      generatedAt: existingIndex >= 0 ? cards[existingIndex].generatedAt : now,
      updatedAt: now,
      status: data.status || REPORT_STATUS.DRAFT,

      // 综合素质评分 (1-5星)
      overallScore: data.overallScore || 3,

      // 各维度评分
      dimensionScores: data.dimensionScores || {
        [ABILITY_DIMENSION.INTELLECT]: 3,
        [ABILITY_DIMENSION.EMOTION]: 3,
        [ABILITY_DIMENSION.SOCIAL]: 3,
        [ABILITY_DIMENSION.PHYSICAL]: 3,
        [ABILITY_DIMENSION.CREATIVITY]: 3,
        [ABILITY_DIMENSION.LANGUAGE]: 3,
        [ABILITY_DIMENSION.INDEPENDENCE]: 3
      },

      // 学期总结
      summary: data.summary || '',

      // 亮点
      highlights: data.highlights || [],

      // 待提升
      improvements: data.improvements || [],

      // 家长寄语
      parentMessage: data.parentMessage || null
    }

    if (existingIndex >= 0) {
      cards[existingIndex] = card
    } else {
      cards.unshift(card)
    }

    setLocalData(REPORT_CARD_KEY, cards)
    return card
  },

  // 删除报告卡
  deleteReportCard(id) {
    const cards = this.getReportCards()
    const filtered = cards.filter(c => c.id !== id)
    setLocalData(REPORT_CARD_KEY, filtered)
  },

  // -------------------- 能力雷达图数据 --------------------

  // 获取雷达图数据
  getRadarData(babyId, semester) {
    const card = this.getReportCards().find(
      c => c.babyId === babyId && c.semester === semester
    )
    if (!card) {
      // 返回默认数据
      return Object.keys(ABILITY_DIMENSION).map(key => ({
        dimension: key,
        label: ABILITY_INFO[key].label,
        icon: ABILITY_INFO[key].icon,
        color: ABILITY_INFO[key].color,
        value: 60, // 默认60分
        maxValue: 100
      }))
    }

    return Object.entries(card.dimensionScores).map(([dimension, value]) => ({
      dimension,
      label: ABILITY_INFO[dimension]?.label || dimension,
      icon: ABILITY_INFO[dimension]?.icon || '📌',
      color: ABILITY_INFO[dimension]?.color || '#999',
      value,
      maxValue: 5
    }))
  },

  // -------------------- 学期对比数据 --------------------

  // 获取学期对比数据
  getSemesterComparison(babyId) {
    const cards = this.getReportCardsByBabyId(babyId)
    return cards
      .sort((a, b) => a.semester.localeCompare(b.semester))
      .map(card => ({
        semester: card.semester,
        overallScore: card.overallScore,
        dimensionScores: card.dimensionScores,
        summary: card.summary,
        generatedAt: card.generatedAt
      }))
  },

  // 保存学期对比快照
  saveSemesterSnapshot(data) {
    const snapshots = getLocalData(SEMESTER_COMPARE_KEY)
    const now = new Date().toISOString()

    const snapshot = {
      id: generateId(),
      babyId: data.babyId,
      semester: data.semester,
      overallScore: data.overallScore,
      dimensionScores: data.dimensionScores,
      savedAt: now
    }

    snapshots.push(snapshot)
    setLocalData(SEMESTER_COMPARE_KEY, snapshots)
    return snapshot
  },

  // -------------------- 家长寄语 --------------------

  // 获取所有家长寄语
  getParentMessages() {
    return getLocalData(PARENT_MESSAGE_KEY)
  },

  // 获取指定报告卡的家长寄语
  getParentMessageByCardId(cardId) {
    const messages = this.getParentMessages()
    return messages.find(m => m.cardId === cardId)
  },

  // 保存家长寄语
  saveParentMessage(data) {
    const messages = this.getParentMessages()
    const now = new Date().toISOString()
    const existingIndex = messages.findIndex(m => m.cardId === data.cardId)

    const message = {
      id: existingIndex >= 0 ? messages[existingIndex].id : generateId(),
      cardId: data.cardId,
      babyId: data.babyId,
      content: data.content || '',
      // 期望设定
      expectations: data.expectations || [],
      // 鼓励留言
      encouragement: data.encouragement || '',
      createdAt: existingIndex >= 0 ? messages[existingIndex].createdAt : now,
      updatedAt: now
    }

    if (existingIndex >= 0) {
      messages[existingIndex] = message
    } else {
      messages.unshift(message)
    }

    setLocalData(PARENT_MESSAGE_KEY, messages)

    // 同时更新报告卡的parentMessage字段
    const cards = this.getReportCards()
    const cardIndex = cards.findIndex(c => c.id === data.cardId)
    if (cardIndex >= 0) {
      cards[cardIndex].parentMessage = message
      cards[cardIndex].updatedAt = now
      setLocalData(REPORT_CARD_KEY, cards)
    }

    return message
  },

  // -------------------- 进步追踪 --------------------

  // 计算进步数据
  calculateProgress(babyId) {
    const comparison = this.getSemesterComparison(babyId)
    if (comparison.length < 2) {
      return null
    }

    const latest = comparison[comparison.length - 1]
    const previous = comparison[comparison.length - 2]

    // 计算各维度进步
    const dimensionProgress = {}
    Object.keys(ABILITY_DIMENSION).forEach(dim => {
      const latestScore = latest.dimensionScores?.[dim] || 0
      const previousScore = previous.dimensionScores?.[dim] || 0
      dimensionProgress[dim] = {
        current: latestScore,
        previous: previousScore,
        change: latestScore - previousScore,
        improved: latestScore > previousScore
      }
    })

    return {
      semester: latest.semester,
      previousSemester: previous.semester,
      overallProgress: {
        current: latest.overallScore,
        previous: previous.overallScore,
        change: latest.overallScore - previous.overallScore
      },
      dimensionProgress
    }
  },

  // -------------------- 工具函数 --------------------

  // 获取当前学期
  getCurrentSemester() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    // 第一学期: 9-12月, 第二学期: 1-8月
    const semester = month >= 9 ? `${year}-1` : `${year - 1}-2`
    return semester
  },

  // 格式化学期显示
  formatSemester(semester) {
    if (!semester) return ''
    const [year, num] = semester.split('-')
    return `${year}学年第${num === '1' ? '一' : '二'}学期`
  },

  // 获取学期日期范围
  getSemesterDateRange(semester) {
    const [year, num] = semester.split('-')
    if (num === '1') {
      // 第一学期: 9月1日 - 1月31日
      return {
        startDate: `${year}-09-01`,
        endDate: `${parseInt(year) + 1}-01-31`
      }
    } else {
      // 第二学期: 2月1日 - 7月31日
      return {
        startDate: `${year}-02-01`,
        endDate: `${year}-07-31`
      }
    }
  }
}

export default growthReportCardService
