/**
 * V99 Growth Portfolio Service
 * 成长档案袋服务 - 综合素质档案、作品集管理、成长时间线、档案导出
 */

// 存储键
const PORTFOLIO_KEY = 'growth_portfolio'
const WORKS_KEY = 'growth_portfolio_works'
const TIMELINE_KEY = 'growth_portfolio_timeline'
const MILESTONES_KEY = 'growth_portfolio_milestones'

// 档案分类
export const PORTFOLIO_CATEGORIES = {
  academic: { id: 'academic', name: '学业发展', icon: '📚', color: '#4a90d9' },
  social: { id: 'social', name: '社会交往', icon: '👫', color: '#67c23a' },
  physical: { id: 'physical', name: '身心健康', icon: '🏃', color: '#e6a23c' },
  art: { id: 'art', name: '艺术素养', icon: '🎨', color: '#f56c6c' },
  practice: { id: 'practice', name: '实践创新', icon: '🔧', color: '#909399' }
}

// 作品类型
export const WORK_TYPES = {
  drawing: { id: 'drawing', name: '绘画', icon: '🖼️' },
  writing: { id: 'writing', name: '写作', icon: '✏️' },
  photo: { id: 'photo', name: '摄影', icon: '📷' },
  video: { id: 'video', name: '视频', icon: '🎬' },
  music: { id: 'music', name: '音乐', icon: '🎵' },
  craft: { id: 'craft', name: '手工', icon: '🧩' },
  other: { id: 'other', name: '其他', icon: '📎' }
}

// 获取档案数据
export const getPortfolio = (babyId) => {
  try {
    const stored = uni.getStorageSync(PORTFOLIO_KEY)
    if (stored) {
      const portfolios = JSON.parse(stored)
      return portfolios.find(p => p.babyId === babyId) || createDefaultPortfolio(babyId)
    }
    return createDefaultPortfolio(babyId)
  } catch (e) {
    console.error('获取档案失败:', e)
    return createDefaultPortfolio(babyId)
  }
}

// 创建默认档案
export const createDefaultPortfolio = (babyId) => {
  return {
    id: 'portfolio_' + Date.now(),
    babyId,
    coverImage: '',
    title: '我的成长档案',
    subtitle: '',
    categories: Object.keys(PORTFOLIO_CATEGORIES).map(key => ({
      ...PORTFOLIO_CATEGORIES[key],
      entries: []
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// 保存档案
export const savePortfolio = (portfolio) => {
  try {
    const stored = uni.getStorageSync(PORTFOLIO_KEY)
    const portfolios = stored ? JSON.parse(stored) : []
    const index = portfolios.findIndex(p => p.babyId === portfolio.babyId)
    
    portfolio.updatedAt = new Date().toISOString()
    
    if (index >= 0) {
      portfolios[index] = portfolio
    } else {
      portfolios.push(portfolio)
    }
    
    uni.setStorageSync(PORTFOLIO_KEY, JSON.stringify(portfolios))
  } catch (e) {
    console.error('保存档案失败:', e)
  }
}

// 更新档案封面
export const updatePortfolioCover = (babyId, coverImage, title) => {
  const portfolio = getPortfolio(babyId)
  if (coverImage) portfolio.coverImage = coverImage
  if (title) portfolio.title = title
  savePortfolio(portfolio)
  return portfolio
}

// 添加档案记录
export const addPortfolioEntry = (babyId, categoryId, entry) => {
  const portfolio = getPortfolio(babyId)
  const category = portfolio.categories.find(c => c.id === categoryId)
  
  if (category) {
    const newEntry = {
      id: 'entry_' + Date.now(),
      ...entry,
      createdAt: new Date().toISOString()
    }
    category.entries.push(newEntry)
    savePortfolio(portfolio)
    return newEntry
  }
  return null
}

// 获取作品列表
export const getWorks = (babyId) => {
  try {
    const stored = uni.getStorageSync(WORKS_KEY)
    if (stored) {
      const allWorks = JSON.parse(stored)
      return allWorks.filter(w => w.babyId === babyId).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
    }
    return []
  } catch (e) {
    console.error('获取作品列表失败:', e)
    return []
  }
}

// 保存作品
export const saveWorks = (works) => {
  uni.setStorageSync(WORKS_KEY, JSON.stringify(works))
}

// 添加作品
export const addWork = (babyId, workData) => {
  const stored = uni.getStorageSync(WORKS_KEY)
  const works = stored ? JSON.parse(stored) : []
  
  const newWork = {
    id: 'work_' + Date.now(),
    babyId,
    ...workData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likes: 0,
    views: 0
  }
  
  works.push(newWork)
  saveWorks(works)
  return newWork
}

// 更新作品
export const updateWork = (workId, updates) => {
  const stored = uni.getStorageSync(WORKS_KEY)
  const works = stored ? JSON.parse(stored) : []
  const work = works.find(w => w.id === workId)
  
  if (work) {
    Object.assign(work, updates, { updatedAt: new Date().toISOString() })
    saveWorks(works)
    return work
  }
  return null
}

// 删除作品
export const deleteWork = (workId) => {
  const stored = uni.getStorageSync(WORKS_KEY)
  const works = stored ? JSON.parse(stored) : []
  const filtered = works.filter(w => w.id !== workId)
  saveWorks(filtered)
}

// 获取成长时间线
export const getTimeline = (babyId) => {
  try {
    const stored = uni.getStorageSync(TIMELINE_KEY)
    if (stored) {
      const allTimeline = JSON.parse(stored)
      return allTimeline.filter(t => t.babyId === babyId).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      )
    }
    return []
  } catch (e) {
    console.error('获取时间线失败:', e)
    return []
  }
}

// 保存时间线
export const saveTimeline = (timeline) => {
  uni.setStorageSync(TIMELINE_KEY, JSON.stringify(timeline))
}

// 添加时间线事件
export const addTimelineEvent = (babyId, eventData) => {
  const stored = uni.getStorageSync(TIMELINE_KEY)
  const timeline = stored ? JSON.parse(stored) : []
  
  const newEvent = {
    id: 'event_' + Date.now(),
    babyId,
    ...eventData,
    createdAt: new Date().toISOString()
  }
  
  timeline.push(newEvent)
  saveTimeline(timeline)
  return newEvent
}

// 删除时间线事件
export const deleteTimelineEvent = (eventId) => {
  const stored = uni.getStorageSync(TIMELINE_KEY)
  const timeline = stored ? JSON.parse(stored) : []
  const filtered = timeline.filter(t => t.id !== eventId)
  saveTimeline(filtered)
}

// 获取里程碑
export const getMilestones = (babyId) => {
  try {
    const stored = uni.getStorageSync(MILESTONES_KEY)
    if (stored) {
      const allMilestones = JSON.parse(stored)
      return allMilestones.filter(m => m.babyId === babyId).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      )
    }
    return []
  } catch (e) {
    console.error('获取里程碑失败:', e)
    return []
  }
}

// 保存里程碑
export const saveMilestones = (milestones) => {
  uni.setStorageSync(MILESTONES_KEY, JSON.stringify(milestones))
}

// 添加里程碑
export const addMilestone = (babyId, milestoneData) => {
  const stored = uni.getStorageSync(MILESTONES_KEY)
  const milestones = stored ? JSON.parse(stored) : []
  
  const newMilestone = {
    id: 'milestone_' + Date.now(),
    babyId,
    ...milestoneData,
    createdAt: new Date().toISOString(),
    isAchieved: false
  }
  
  milestones.push(newMilestone)
  saveMilestones(milestones)
  return newMilestone
}

// 标记里程碑达成
export const achieveMilestone = (milestoneId, achievedDate) => {
  const stored = uni.getStorageSync(MILESTONES_KEY)
  const milestones = stored ? JSON.parse(stored) : []
  const milestone = milestones.find(m => m.id === milestoneId)
  
  if (milestone) {
    milestone.isAchieved = true
    milestone.achievedDate = achievedDate || new Date().toISOString()
    saveMilestones(milestones)
    return milestone
  }
  return null
}

// 导出档案数据
export const exportPortfolioData = (babyId) => {
  const portfolio = getPortfolio(babyId)
  const works = getWorks(babyId)
  const timeline = getTimeline(babyId)
  const milestones = getMilestones(babyId)
  
  const exportData = {
    exportDate: new Date().toISOString(),
    portfolio,
    works,
    timeline,
    milestones,
    statistics: {
      totalWorks: works.length,
      totalTimelineEvents: timeline.length,
      totalMilestones: milestones.length,
      achievedMilestones: milestones.filter(m => m.isAchieved).length
    }
  }
  
  return exportData
}

// 生成档案导出文本
export const generatePortfolioReport = (babyId, babyName) => {
  const exportData = exportPortfolioData(babyId)
  
  let report = `📁 ${babyName}的成长档案\n`
  report += `导出时间: ${new Date().toLocaleDateString()}\n\n`
  
  report += `【档案概览】\n`
  report += `- 作品数量: ${exportData.statistics.totalWorks}\n`
  report += `- 成长事件: ${exportData.statistics.totalTimelineEvents}\n`
  report += `- 里程碑: ${exportData.statistics.achievedMilestones}/${exportData.statistics.totalMilestones}\n\n`
  
  if (exportData.works.length > 0) {
    report += `【作品集】\n`
    exportData.works.slice(0, 5).forEach(work => {
      report += `- ${work.title} (${work.type})\n`
    })
    if (exportData.works.length > 5) {
      report += `- ...还有 ${exportData.works.length - 5} 件作品\n`
    }
    report += '\n'
  }
  
  if (exportData.timeline.length > 0) {
    report += `【成长时间线】\n`
    exportData.timeline.slice(0, 5).forEach(event => {
      report += `- ${event.date}: ${event.title}\n`
    })
    if (exportData.timeline.length > 5) {
      report += `- ...还有 ${exportData.timeline.length - 5} 条记录\n`
    }
  }
  
  return report
}

// 获取作品统计
export const getWorkStatistics = (babyId) => {
  const works = getWorks(babyId)
  
  const stats = {
    total: works.length,
    byType: {}
  }
  
  Object.keys(WORK_TYPES).forEach(type => {
    stats.byType[type] = works.filter(w => w.type === type).length
  })
  
  return stats
}

export default {
  PORTFOLIO_CATEGORIES,
  WORK_TYPES,
  getPortfolio,
  createDefaultPortfolio,
  savePortfolio,
  updatePortfolioCover,
  addPortfolioEntry,
  getWorks,
  addWork,
  updateWork,
  deleteWork,
  getTimeline,
  addTimelineEvent,
  deleteTimelineEvent,
  getMilestones,
  addMilestone,
  achieveMilestone,
  exportPortfolioData,
  generatePortfolioReport,
  getWorkStatistics
}
