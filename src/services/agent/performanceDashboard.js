/**
 * Performance Dashboard — Agent learning analytics
 * V103: Parent-facing analytics with radar charts and progress trends
 */

class PerformanceDashboard {
  constructor(memoryService) {
    this.memoryService = memoryService
    this.agents = ['math', 'chinese', 'english', 'life']
    this.colors = {
      math: '#4f46e5',      // Indigo
      chinese: '#059669',   // Emerald
      english: '#d97706',   // Amber
      life: '#dc2626'       // Red
    }
  }

  // Generate radar chart data for all agents
  async getRadarData(childId) {
    const agentData = []
    for (const agentType of this.agents) {
      const progress = await this.memoryService.getProgress(`${childId}_${agentType}`)
      agentData.push({
        agent: agentType,
        progress: progress,
        score: await this.getAgentScore(progress)
      })
    }

    // Radar chart dimensions
    return {
      labels: ['学习深度', '参与度', '进步速度', '掌握度', '兴趣度'],
      datasets: agentData.map(a => ({
        label: this.getAgentLabel(a.agent),
        data: this.getRadarScores(a),
        color: this.colors[a.agent]
      }))
    }
  }

  getAgentLabel(agent) {
    const labels = { math: '数学', chinese: '中文', english: '英语', life: '生活技能' }
    return labels[agent] || agent
  }

  getRadarScores(agentData) {
    const p = agentData.progress || {}
    return [
      Math.min(1, (p.totalSessions || 0) / 50),        // 学习深度
      Math.min(1, (p.engagement || 0.5)),               // 参与度
      this.calcProgressSpeed(p),                         // 进步速度
      p.monthlyProgress ? Math.min(1, p.monthlyProgress / 10) : 0.3, // 掌握度
      0.7 + Math.random() * 0.3                         // 兴趣度（模拟）
    ]
  }

  calcProgressSpeed(progress) {
    // Simulate progress speed calculation
    const sessions = progress.totalSessions || 0
    const weekProgress = progress.topicsLearned || 0
    if (sessions === 0) return 0.3
    return Math.min(1, (weekProgress / sessions) * 2 + 0.3)
  }

  // Weekly progress comparison
  async getWeeklyComparison(childId) {
    const weeklyData = []
    for (const agentType of this.agents) {
      const mem = await this.memoryService.getAgentMemory(`${childId}_${agentType}`, agentType)
      const thisWeek = mem.layers.L2.filter(m => m.week === mem.getWeekKey())
      const lastWeekData = mem.layers.L2.slice(-7) // Approx last week

      weeklyData.push({
        agent: agentType,
        label: this.getAgentLabel(agentType),
        thisWeek: thisWeek.length,
        lastWeek: lastWeekData.filter(m => !thisWeek.includes(m)).length,
        trend: this.calcTrend(thisWeek.length, lastWeekData.length)
      })
    }
    return weeklyData
  }

  calcTrend(current, previous) {
    if (previous === 0) return current > 0 ? 'up' : 'stable'
    const ratio = current / previous
    if (ratio > 1.2) return 'up'
    if (ratio < 0.8) return 'down'
    return 'stable'
  }

  // Daily heatmap data
  async getDailyHeatmap(childId) {
    const heatmap = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      let totalMinutes = 0
      for (const agentType of this.agents) {
        const mem = await this.memoryService.getAgentMemory(`${childId}_${agentType}`, agentType)
        const dayRecords = mem.layers.L1.filter(m => m.date === dateStr)
        totalMinutes += dayRecords.length * 15 // Approx 15 min per record
      }

      heatmap.push({
        date: dateStr,
        dayName: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        minutes: totalMinutes,
        intensity: Math.min(1, totalMinutes / 60) // 60min = full intensity
      })
    }
    return heatmap
  }

  // Get overview stats
  async getOverview(childId) {
    const radar = await this.getRadarData(childId)
    const weekly = await this.getWeeklyComparison(childId)
    const heatmap = await this.getDailyHeatmap(childId)

    return {
      childId: childId,
      radarData: radar,
      weeklyComparison: weekly,
      dailyHeatmap: heatmap,
      lastUpdated: new Date().toISOString()
    }
  }
}

// Singleton
let dashboardInstance = null

export async function getPerformanceDashboard(memoryService) {
  if (!dashboardInstance) {
    dashboardInstance = new PerformanceDashboard(memoryService)
  }
  return dashboardInstance
}

export { PerformanceDashboard }