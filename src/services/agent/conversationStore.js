/**
 * Conversation Store — Agent conversation history persistence
 * V104: Store, search, and retrieve agent conversations
 */

class ConversationStore {
  constructor() {
    this.conversations = new Map() // childId -> agentId -> conversations[]
    this.maxPerAgent = 100 // Keep last 100 conversations per agent
  }

  // Save a conversation turn
  saveConversation(childId, agentId, messages, metadata = {}) {
    if (!this.conversations.has(childId)) {
      this.conversations.set(childId, new Map())
    }
    const childMap = this.conversations.get(childId)
    if (!childMap.has(agentId)) {
      childMap.set(agentId, [])
    }

    const conversation = {
      id: this.generateId(),
      childId: childId,
      agentId: agentId,
      messages: messages, // [{role: 'user'|'agent', content: '', ts: Date}]
      metadata: {
        topics: metadata.topics || [],
        duration: metadata.duration || 0,
        satisfaction: metadata.satisfaction || null,
        ...metadata
      },
      createdAt: Date.now(),
      date: new Date().toISOString().split('T')[0]
    }

    const agentConversations = childMap.get(agentId)
    agentConversations.unshift(conversation) // Newest first

    // Trim old conversations
    if (agentConversations.length > this.maxPerAgent) {
      childMap.set(agentId, agentConversations.slice(0, this.maxPerAgent))
    }

    return conversation
  }

  generateId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get conversations for child + agent
  getConversations(childId, agentId, options = {}) {
    if (!this.conversations.has(childId)) return []
    const agentConvs = this.conversations.get(childId).get(agentId) || []

    let results = [...agentConvs]

    // Filter by date range
    if (options.startDate) {
      results = results.filter(c => c.createdAt >= new Date(options.startDate).getTime())
    }
    if (options.endDate) {
      results = results.filter(c => c.createdAt <= new Date(options.endDate).getTime())
    }

    // Filter by search query
    if (options.query) {
      const q = options.query.toLowerCase()
      results = results.filter(c =>
        c.messages.some(m => m.content.toLowerCase().includes(q)) ||
        c.metadata.topics.some(t => t.toLowerCase().includes(q))
      )
    }

    // Filter by favorited
    if (options.favoritesOnly) {
      results = results.filter(c => c.metadata.favorite === true)
    }

    // Pagination
    const page = options.page || 1
    const pageSize = options.pageSize || 20
    const start = (page - 1) * pageSize

    return {
      items: results.slice(start, start + pageSize),
      total: results.length,
      page: page,
      pageSize: pageSize,
      hasMore: start + pageSize < results.length
    }
  }

  // Get all conversations for a child (across all agents)
  getAllConversations(childId, options = {}) {
    if (!this.conversations.has(childId)) return { items: [], total: 0 }

    const allConvs = []
    const childMap = this.conversations.get(childId)
    for (const [agentId, convs] of childMap) {
      convs.forEach(c => {
        allConvs.push({ ...c, agentId }) // Spread to avoid mutation
      })
    }

    // Sort by createdAt descending
    allConvs.sort((a, b) => b.createdAt - a.createdAt)

    // Filter
    if (options.agentType) {
      const filtered = allConvs.filter(c => c.agentId === options.agentType)
      return { items: filtered.slice(0, 20), total: filtered.length }
    }

    return {
      items: allConvs.slice(0, options.limit || 20),
      total: allConvs.length
    }
  }

  // Toggle favorite
  toggleFavorite(childId, agentId, conversationId) {
    if (!this.conversations.has(childId)) return null
    const childMap = this.conversations.get(childId)
    if (!childMap.has(agentId)) return null

    const convs = childMap.get(agentId)
    const conv = convs.find(c => c.id === conversationId)
    if (conv) {
      conv.metadata.favorite = !conv.metadata.favorite
      return conv.metadata.favorite
    }
    return null
  }

  // Get conversation by ID
  getConversation(childId, agentId, conversationId) {
    if (!this.conversations.has(childId)) return null
    const childMap = this.conversations.get(childId)
    if (!childMap.has(agentId)) return null
    return childMap.get(agentId).find(c => c.id === conversationId) || null
  }

  // Delete conversation
  deleteConversation(childId, agentId, conversationId) {
    if (!this.conversations.has(childId)) return false
    const childMap = this.conversations.get(childId)
    if (!childMap.has(agentId)) return false

    const convs = childMap.get(agentId)
    const index = convs.findIndex(c => c.id === conversationId)
    if (index !== -1) {
      convs.splice(index, 1)
      return true
    }
    return false
  }

  // Get statistics for a child
  getStats(childId) {
    if (!this.conversations.has(childId)) {
      return { total: 0, byAgent: {}, thisWeek: 0, favorites: 0 }
    }

    const childMap = this.conversations.get(childId)
    let total = 0
    let favorites = 0
    let thisWeek = 0
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const byAgent = {}

    for (const [agentId, convs] of childMap) {
      byAgent[agentId] = convs.length
      total += convs.length
      favorites += convs.filter(c => c.metadata.favorite).length
      thisWeek += convs.filter(c => c.createdAt > weekAgo).length
    }

    return { total, byAgent, thisWeek, favorites }
  }

  // Extract key topics from conversation
  extractTopics(conversation) {
    const topics = new Set(conversation.metadata.topics || [])
    conversation.messages.forEach(m => {
      // Simple keyword extraction
      const words = m.content.match(/[\u4e00-\u9fa5]{2,}/g) || []
      words.slice(0, 5).forEach(w => topics.add(w))
    })
    return Array.from(topics).slice(0, 10)
  }
}

// Singleton
let storeInstance = null

export function getConversationStore() {
  if (!storeInstance) {
    storeInstance = new ConversationStore()
  }
  return storeInstance
}

export { ConversationStore }