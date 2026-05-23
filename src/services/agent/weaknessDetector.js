/**
 * Weakness Detector — Identify learning weak points
 * V103: Auto-detect薄弱知识点 and recommend reinforcement
 */

class WeaknessDetector {
  constructor() {
    this.threshold = 0.4 // Below 40% mastery = weakness
  }

  // Analyze agent memories to find weak points
  async detectWeaknesses(childId, memoryService) {
    const agents = ['math', 'chinese', 'english', 'life']
    const weaknesses = []

    for (const agentType of agents) {
      const mem = await memoryService.getAgentMemory(`${childId}_${agentType}`, agentType)
      const weekData = mem.layers.L2

      if (weekData.length === 0) {
        weaknesses.push({
          agentType: agentType,
          level: 'warning',
          message: `${this.getAgentLabel(agentType)} 学习数据不足，建议增加练习`,
          topics: []
        })
        continue
      }

      // Analyze performance patterns
      const recentPerformance = this.analyzePerformance(weekData)
      const topicScores = this.calculateTopicScores(weekData)

      // Find weak topics
      const weakTopics = topicScores.filter(t => t.score < this.threshold)

      if (weakTopics.length > 0) {
        weaknesses.push({
          agentType: agentType,
          level: weakTopics.length > 2 ? 'critical' : 'warning',
          message: `${this.getAgentLabel(agentType)} 需加强: ${weakTopics.map(t => t.topic).join(', ')}`,
          topics: weakTopics,
          recommendedActions: this.getRecommendedActions(agentType, weakTopics)
        })
      }
    }

    return weaknesses
  }

  analyzePerformance(records) {
    const scores = records.map(r => r.record?.performance || 0.5)
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    const trend = this.calcTrend(scores)
    return { average: avg, trend: trend, count: scores.length }
  }

  calcTrend(scores) {
    if (scores.length < 2) return 'stable'
    const half = Math.floor(scores.length / 2)
    const recent = scores.slice(half).reduce((a, b) => a + b, 0) / half
    const older = scores.slice(0, half).reduce((a, b) => a + b, 0) / half
    if (recent > older * 1.2) return 'improving'
    if (recent < older * 0.8) return 'declining'
    return 'stable'
  }

  calculateTopicScores(records) {
    const topicMap = new Map()
    records.forEach(r => {
      const topic = r.record?.topic || 'general'
      const score = r.record?.performance || 0.5
      if (!topicMap.has(topic)) {
        topicMap.set(topic, { scores: [], topic })
      }
      topicMap.get(topic).scores.push(score)
    })

    return Array.from(topicMap.values()).map(t => ({
      topic: t.topic,
      score: t.scores.reduce((a, b) => a + b, 0) / t.scores.length,
      attempts: t.scores.length
    }))
  }

  getAgentLabel(agent) {
    const labels = { math: '数学', chinese: '中文', english: '英语', life: '生活技能' }
    return labels[agent] || agent
  }

  getRecommendedActions(agentType, weakTopics) {
    const actions = []
    weakTopics.forEach(t => {
      actions.push({
        topic: t.topic,
        action: this.getActionForTopic(agentType, t.topic)
      })
    })
    return actions
  }

  getActionForTopic(agentType, topic) {
    // Topic-specific recommendations
    const recommendations = {
      math: {
        '加法': '每日10道加法练习',
        '减法': '使用实物练习减法',
        '乘法': '乘法表背诵 + 游戏',
        '除法': '理解除法概念而非死记',
        '分数': '使用圆形图理解分数'
      },
      chinese: {
        '拼音': '每日拼读练习',
        '识字': '闪卡记忆法',
        '写字': '笔画顺序练习',
        '成语': '成语故事理解'
      },
      english: {
        '单词': '每日单词卡',
        '口语': '跟读练习',
        '听力': '英文儿歌',
        '阅读': '分级绘本'
      },
      life: {
        '整理': '分类游戏练习',
        '卫生': '步骤分解练习',
        '时间': '番茄钟管理',
        '社交': '情景模拟'
      }
    }

    return recommendations[agentType]?.[topic] || '针对性练习'
  }

  // Get overall weakness summary
  async getSummary(childId, memoryService) {
    const weaknesses = await this.detectWeaknesses(childId, memoryService)
    const criticalCount = weaknesses.filter(w => w.level === 'critical').length
    const warningCount = weaknesses.filter(w => w.level === 'warning').length

    return {
      childId: childId,
      totalWeaknesses: weaknesses.length,
      criticalCount: criticalCount,
      warningCount: warningCount,
      overallLevel: criticalCount > 0 ? 'needs_attention' : warningCount > 0 ? 'watching' : 'healthy',
      weaknesses: weaknesses,
      recommendations: this.getOverallRecommendations(weaknesses)
    }
  }

  getOverallRecommendations(weaknesses) {
    const recs = []
    if (weaknesses.length > 2) {
      recs.push('建议减少学习领域，专注薄弱点突破')
    }
    const criticalAgents = weaknesses.filter(w => w.level === 'critical')
    if (criticalAgents.length > 0) {
      recs.push(`优先加强: ${criticalAgents.map(w => this.getAgentLabel(w.agentType)).join(', ')}`)
    }
    return recs
  }
}

let detectorInstance = null

export async function getWeaknessDetector() {
  if (!detectorInstance) {
    detectorInstance = new WeaknessDetector()
  }
  return detectorInstance
}

export { WeaknessDetector }