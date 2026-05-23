/**
 * Conversation Card — Display agent conversation with styling
 * V104: Message pair display with timestamps and topic tags
 */

class ConversationCard {
  constructor(options = {}) {
    this.options = {
      maxMessages: options.maxMessages || 10,
      showTimestamp: options.showTimestamp !== false,
      showTopics: options.showTopics !== false,
      compact: options.compact || false,
      ...options
    }
  }

  // Render a conversation into HTML
  render(conversation) {
    const { messages, metadata, agentId, createdAt, id } = conversation
    const agentLabel = this.getAgentLabel(agentId)
    const agentColor = this.getAgentColor(agentId)

    let html = `<div class="conv-card" data-id="${id}">`

    // Header
    html += `<div class="conv-header" style="border-left: 4px solid ${agentColor}">`
    html += `<span class="agent-badge" style="background: ${agentColor}">${agentLabel}</span>`
    html += `<span class="conv-time">${this.formatTime(createdAt)}</span>`
    if (metadata.favorite) {
      html += `<span class="favorite-icon">⭐</span>`
    }
    html += '</div>'

    // Messages
    const displayMessages = messages.slice(-this.options.maxMessages)
    html += '<div class="conv-messages">'

    displayMessages.forEach(msg => {
      const isUser = msg.role === 'user'
      const msgClass = isUser ? 'user-msg' : 'agent-msg'
      const avatar = isUser ? '👤' : this.getAgentEmoji(agentId)

      html += `<div class="message ${msgClass}">`
      html += `<span class="avatar">${avatar}</span>`
      html += `<div class="msg-content">`
      html += `<p class="msg-text">${this.escapeHtml(msg.content || '')}</p>`
      if (this.options.showTimestamp && msg.ts) {
        html += `<span class="msg-time">${this.formatTime(msg.ts)}</span>`
      }
      html += '</div>'
      html += '</div>'
    })

    html += '</div>'

    // Topics
    if (this.options.showTopics && metadata.topics?.length > 0) {
      html += '<div class="conv-topics">'
      metadata.topics.slice(0, 5).forEach(topic => {
        html += `<span class="topic-tag">${topic}</span>`
      })
      html += '</div>'
    }

    // Footer with stats
    if (!this.options.compact) {
      html += `<div class="conv-footer">`
      if (metadata.duration) {
        html += `<span class="stat">⏱️ ${Math.round(metadata.duration / 60)}min</span>`
      }
      if (metadata.satisfaction) {
        html += `<span class="stat">${'⭐'.repeat(metadata.satisfaction)}</span>`
      }
      html += '</div>'
    }

    html += '</div>'
    return html
  }

  getAgentLabel(agentId) {
    const labels = {
      math: '数学Agent',
      chinese: '中文Agent',
      english: '英语Agent',
      life: '生活Agent',
      coordinator: '协调者'
    }
    return labels[agentId] || agentId
  }

  getAgentColor(agentId) {
    const colors = {
      math: '#4f46e5',
      chinese: '#059669',
      english: '#d97706',
      life: '#dc2626',
      coordinator: '#7c3aed'
    }
    return colors[agentId] || '#6b7280'
  }

  getAgentEmoji(agentId) {
    const emojis = {
      math: '🔢',
      chinese: '📚',
      english: '🌍',
      life: '🌟',
      coordinator: '🤖'
    }
    return emojis[agentId] || '🤖'
  }

  formatTime(ts) {
    const d = new Date(ts)
    const now = new Date()
    const diff = now - d

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`

    return d.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  escapeHtml(text) {
    const div = { innerHTML: '' }
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>')
  }

  // Render a list of conversations
  renderList(conversations) {
    return conversations.map(c => this.render(c)).join('')
  }
}

// Compact version for history list
class ConversationListItem {
  render(conversation) {
    const { agentId, createdAt, messages, metadata } = conversation
    const lastMsg = messages[messages.length - 1]?.content || ''
    const preview = lastMsg.length > 60 ? lastMsg.substring(0, 60) + '...' : lastMsg

    return `<div class="conv-list-item" data-id="${conversation.id}">
      <div class="item-header">
        <span class="agent-dot" style="background: ${this.getAgentColor(agentId)}"></span>
        <span class="agent-name">${this.getAgentLabel(agentId)}</span>
        <span class="item-time">${this.formatTime(createdAt)}</span>
      </div>
      <p class="item-preview">${preview}</p>
      ${metadata.topics?.length > 0 ? `<div class="item-topics">${metadata.topics.slice(0, 2).map(t => `<span class="mini-tag">${t}</span>`).join('')}</div>` : ''}
    </div>`
  }

  getAgentLabel(id) {
    return { math: '数学', chinese: '中文', english: '英语', life: '生活' }[id] || id
  }

  getAgentColor(id) {
    return { math: '#4f46e5', chinese: '#059669', english: '#d97706', life: '#dc2626' }[id] || '#6b7280'
  }

  formatTime(ts) {
    const d = new Date(ts)
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

export { ConversationCard, ConversationListItem }