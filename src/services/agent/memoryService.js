/**
 * Memory Service — Unified memory access API
 * V102: Cross-agent memory sharing and unified interface
 */

import { AgentMemory, AgentMemoryManager } from './agentMemory.js'
import { getAgentMemoryStorage } from './agentMemoryStorage.js'

class MemoryService {
  constructor() {
    this.manager = null
    this.storage = null
    this.initialized = false
  }

  async init() {
    if (this.initialized) return
    this.storage = await getAgentMemoryStorage()
    this.manager = new AgentMemoryManager(this.storage)
    this.initialized = true
  }

  // Get or create agent memory
  async getAgentMemory(agentId, agentType) {
    await this.init()
    return this.manager.getAgentMemory(agentId, agentType)
  }

  // Push content to agent's working memory
  async pushWorking(agentId, agentType, content) {
    const mem = await this.getAgentMemory(agentId, agentType)
    mem.pushWorking(content)
    return mem
  }

  // Record a learning event
  async recordEvent(agentId, agentType, event) {
    const mem = await this.getAgentMemory(agentId, agentType)
    mem.pushShortTerm({
      agentId: agentId,
      event: event,
      ts: Date.now()
    })
    // Consolidate to higher layers periodically
    await mem.consolidate()
    await this.save(agentId)
    return mem
  }

  // Retrieve relevant memories
  async retrieve(agentId, query, maxResults = 5) {
    const mem = await this.getAgentMemory(agentId, 'unknown')
    return mem.retrieve(query, maxResults)
  }

  // Get learning progress
  async getProgress(agentId) {
    const mem = await this.getAgentMemory(agentId, 'unknown')
    return mem.getProgress()
  }

  // Save all agent memories
  async save(agentId = null) {
    await this.init()
    if (agentId) {
      const mem = this.manager.agents.get(agentId)
      if (mem) await mem.savePersistent(this.storage)
    } else {
      await this.manager.saveAll()
    }
  }

  // Load memories for agents
  async loadAgents(agentIds) {
    await this.init()
    await this.manager.loadAll(agentIds)
  }

  // Get cross-agent shared context
  async getSharedContext(childId) {
    await this.init()
    const sharedMemories = []
    for (const [agentId, mem] of this.manager.agents) {
      if (agentId.includes(childId)) {
        const L2 = mem.layers.L2
        const L3 = mem.layers.L3
        sharedMemories.push(...L2, ...L3)
      }
    }
    return sharedMemories
  }

  // Record learning preference
  async recordPreference(agentId, preference) {
    const mem = await this.getAgentMemory(agentId, 'unknown')
    mem.pushShortTerm({
      agentId: agentId,
      event: { type: 'preference', data: preference },
      ts: Date.now()
    })
    await this.save(agentId)
  }

  // Get learning preferences
  async getPreferences(agentId) {
    const mem = await this.getAgentMemory(agentId, 'unknown')
    const prefs = mem.layers.L1.filter(m => m.event?.type === 'preference')
    return prefs.map(p => p.event.data)
  }

  // Weekly summary for parent
  async getWeeklySummary(childId) {
    const mems = []
    for (const [agentId, mem] of this.manager.agents) {
      if (agentId.includes(childId)) {
        mems.push(mem)
      }
    }

    const summary = {
      childId: childId,
      week: new Date().toISOString().substring(0, 10),
      agents: [],
      totalTopics: 0,
      overallPerformance: 0,
      engagement: 0
    }

    for (const mem of mems) {
      const weekData = mem.layers.L2.filter(m => m.week === mem.getWeekKey())
      const progress = mem.getProgress()
      summary.agents.push({
        agentType: mem.agentType,
        topicsThisWeek: weekData.length,
        progress: progress
      })
      summary.totalTopics += weekData.length
    }

    return summary
  }
}

// Singleton
let serviceInstance = null

export async function getMemoryService() {
  if (!serviceInstance) {
    serviceInstance = new MemoryService()
    await serviceInstance.init()
  }
  return serviceInstance
}

export { MemoryService }