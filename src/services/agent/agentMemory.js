/**
 * Agent Memory System — L0-L4 Five-Layer Memory Architecture
 * V102: Persistent learning memory across sessions
 */

class AgentMemory {
  constructor(agentId, agentType) {
    this.agentId = agentId
    this.agentType = agentType
    this.layers = {
      L0: [], // WorkingMemory: current conversation context
      L1: [], // ShortTermMemory: today's learning records (24h)
      L2: [], // MediumTermMemory: this week's learning trajectory (7d)
      L3: [], // LongTermMemory: monthly learning summary (30d)
      L4: null // PersistentMemory: permanent learning archive
    }
    this.lastSync = Date.now()
    this.initialized = false
  }

  // L0: Working memory — current session
  pushWorking(content) {
    this.layers.L0.push({
      ts: Date.now(),
      content: content,
      type: 'working'
    })
    // Keep last 50 working memories
    if (this.layers.L0.length > 50) {
      this.layers.L0.shift()
    }
  }

  getWorking() {
    return this.layers.L0.slice(-20) // Last 20 interactions
  }

  // L1: Short-term memory — today
  pushShortTerm(event) {
    this.layers.L1.push({
      ts: Date.now(),
      date: new Date().toISOString().split('T')[0],
      event: event,
      type: 'short'
    })
    this.cleanShortTerm()
  }

  cleanShortTerm() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000 // 24h
    this.layers.L1 = this.layers.L1.filter(m => m.ts > cutoff)
  }

  // L2: Medium-term memory — this week
  pushMediumTerm(record) {
    this.layers.L2.push({
      ts: Date.now(),
      week: this.getWeekKey(),
      record: record,
      type: 'medium'
    })
    this.cleanMediumTerm()
  }

  cleanMediumTerm() {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000 // 7d
    this.layers.L2 = this.layers.L2.filter(m => m.ts > cutoff)
  }

  getWeekKey() {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - d.getDay())
    return d.toISOString().split('T')[0]
  }

  // L3: Long-term memory — monthly
  pushLongTerm(summary) {
    this.layers.L3.push({
      ts: Date.now(),
      month: new Date().toISOString().substring(0, 7),
      summary: summary,
      type: 'long'
    })
  }

  getLongTermByMonth(month) {
    return this.layers.L3.filter(m => m.month === month)
  }

  // L4: Persistent memory — permanent archive
  async loadPersistent(storage) {
    try {
      const data = await storage.get(`memory_${this.agentId}`)
      if (data) {
        this.layers.L4 = JSON.parse(data)
        this.initialized = true
      }
    } catch (e) {
      console.warn(`Failed to load L4 memory for ${this.agentId}:`, e)
    }
  }

  async savePersistent(storage) {
    try {
      await storage.set(`memory_${this.agentId}`, JSON.stringify(this.layers.L4))
    } catch (e) {
      console.warn(`Failed to save L4 memory for ${this.agentId}:`, e)
    }
  }

  // Merge upward: working → short → medium → long
  async consolidate() {
    const now = Date.now()
    // Working → Short (every 30 min or on significant event)
    if (this.layers.L0.length > 0) {
      const significant = this.layers.L0.filter(m => m.content.significance > 0.7)
      significant.forEach(m => {
        this.pushShortTerm({
          agentId: this.agentId,
          content: m.content,
          ts: m.ts
        })
      })
    }

    // Short → Medium (daily)
    const lastMedium = this.layers.L2[this.layers.L2.length - 1]
    if (!lastMedium || lastMedium.week !== this.getWeekKey()) {
      const daySummary = this.summarizeDay()
      if (daySummary) {
        this.pushMediumTerm(daySummary)
      }
    }

    this.lastSync = now
  }

  summarizeDay() {
    const todayRecords = this.layers.L1.filter(m => m.date === new Date().toISOString().split('T')[0])
    if (todayRecords.length === 0) return null

    return {
      date: new Date().toISOString().split('T')[0],
      totalEvents: todayRecords.length,
      topics: [...new Set(todayRecords.map(r => r.event.topic))],
      performance: this.calcPerformance(todayRecords),
      engagement: this.calcEngagement(todayRecords)
    }
  }

  calcPerformance(records) {
    const scores = records.filter(r => r.event.score !== undefined).map(r => r.event.score)
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  }

  calcEngagement(records) {
    return Math.min(1, records.length / 10) // normalized 0-1
  }

  // Retrieve relevant memories by query
  retrieve(query, maxResults = 5) {
    const results = []
    // Search L0-L3
    const allMemories = [
      ...this.layers.L0.map(m => ({ ...m, layer: 'L0', score: 0 })),
      ...this.layers.L1.map(m => ({ ...m, layer: 'L1', score: 0 })),
      ...this.layers.L2.map(m => ({ ...m, layer: 'L2', score: 0 })),
      ...this.layers.L3.map(m => ({ ...m, layer: 'L3', score: 0 }))
    ]

    // Simple relevance scoring based on topic match
    allMemories.forEach(m => {
      const content = m.content?.topic || m.event?.topic || ''
      if (content.includes(query) || query.includes(content)) {
        m.score = content === query ? 1 : 0.5
        results.push(m)
      }
    })

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
  }

  // Get learning progress for this agent
  getProgress() {
    return {
      agentId: this.agentId,
      agentType: this.agentType,
      totalSessions: this.layers.L0.length,
      topicsLearned: this.layers.L2.length,
      monthlyProgress: this.layers.L3.length,
      lastActivity: this.lastSync,
      initialized: this.initialized
    }
  }
}

// Memory Manager for all agents
class AgentMemoryManager {
  constructor(storage) {
    this.storage = storage
    this.agents = new Map()
  }

  getAgentMemory(agentId, agentType) {
    if (!this.agents.has(agentId)) {
      const mem = new AgentMemory(agentId, agentType)
      this.agents.set(agentId, mem)
    }
    return this.agents.get(agentId)
  }

  async saveAll() {
    for (const [agentId, mem] of this.agents) {
      await mem.savePersistent(this.storage)
    }
  }

  async loadAll(agentIds) {
    for (const agentId of agentIds) {
      const mem = this.getAgentMemory(agentId, 'unknown')
      await mem.loadPersistent(this.storage)
    }
  }
}

export { AgentMemory, AgentMemoryManager }