<template>
  <view class="history-page">
    <!-- Header -->
    <view class="header">
      <text class="title">对话历史</text>
      <view class="header-actions">
        <button class="icon-btn" @click="toggleSearch">🔍</button>
        <button class="icon-btn" @click="showFilters = !showFilters">⚙️</button>
      </view>
    </view>

    <!-- Search Bar -->
    <view class="search-bar" v-if="showSearch">
      <input v-model="searchQuery" placeholder="搜索对话内容..." class="search-input" @confirm="doSearch" />
      <button class="search-btn" @click="doSearch">搜索</button>
    </view>

    <!-- Filters -->
    <view class="filters" v-if="showFilters">
      <view class="filter-group">
        <text class="filter-label">Agent:</text>
        <view class="filter-options">
          <button v-for="agent in agentTypes" :key="agent.id"
            :class="['filter-btn', { active: selectedAgent === agent.id ]}"
            @click="selectAgent(agent.id)">
            {{ agent.label }}
          </button>
        </view>
      </view>
      <view class="filter-group">
        <text class="filter-label">排序:</text>
        <view class="filter-options">
          <button :class="['filter-btn', { active: sortBy === 'recent' }]" @click="sortBy = 'recent'">最新</button>
          <button :class="['filter-btn', { active: sortBy === 'favorite' }]" @click="sortBy = 'favorite'">收藏</button>
        </view>
      </view>
    </view>

    <!-- Stats Bar -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-value">{{ stats.total }}</text>
        <text class="stat-label">对话总数</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.thisWeek }}</text>
        <text class="stat-label">本周</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.favorites }}</text>
        <text class="stat-label">收藏</text>
      </view>
    </view>

    <!-- Conversation List -->
    <scroll-view class="conv-list" scroll-y @scrolltolower="loadMore">
      <view class="conv-items">
        <view v-for="(item, i) in conversations" :key="item.id" class="conv-item" @click="openConv(item)">
          <view class="conv-header">
            <view class="agent-badge" :style="{ background: getAgentColor(item.agentId) }">
              {{ getAgentLabel(item.agentId) }}
            </view>
            <text class="conv-date">{{ formatDate(item.createdAt) }}</text>
            <text v-if="item.metadata.favorite" class="fav-icon">⭐</text>
          </view>
          <view class="conv-preview">
            <text class="preview-text">{{ getLastMessage(item) }}</text>
          </view>
          <view class="conv-topics" v-if="item.metadata.topics?.length > 0">
            <span v-for="(topic, j) in item.metadata.topics.slice(0, 3)" :key="j" class="topic-tag">
              {{ topic }}
            </span>
          </view>
          <view class="conv-actions">
            <button class="action-btn" @click.stop="toggleFav(item)">
              {{ item.metadata.favorite ? '⭐' : '☆' }}
            </button>
            <button class="action-btn" @click.stop="startReview(item)">📖</button>
          </view>
        </view>
      </view>
      <view v-if="hasMore" class="load-more" @click="loadMore">
        <text>加载更多...</text>
      </view>
      <view v-if="conversations.length === 0" class="empty-state">
        <text class="empty-icon">💬</text>
        <text class="empty-text">暂无对话记录</text>
      </view>
    </scroll-view>

    <!-- Detail Modal -->
    <view class="detail-modal" v-if="selectedConv" @click="selectedConv = null">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ getAgentLabel(selectedConv.agentId) }} 对话</text>
          <button class="close-btn" @click="selectedConv = null">✕</button>
        </view>
        <scroll-view class="modal-messages" scroll-y>
          <view v-for="(msg, i) in selectedConv.messages" :key="i" class="message" :class="msg.role">
            <text class="msg-role">{{ msg.role === 'user' ? '我' : 'Agent' }}</text>
            <text class="msg-content">{{ msg.content }}</text>
            <text class="msg-time">{{ formatTime(msg.ts) }}</text>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <button class="footer-btn" @click="startReview(selectedConv)">开始复习</button>
          <button class="footer-btn" @click="toggleFav(selectedConv)">
            {{ selectedConv.metadata.favorite ? '取消收藏' : '收藏' }}
          </button>
        </view>
      </view>
    </view>

    <!-- Review Mode -->
    <view class="review-mode" v-if="reviewCard">
      <view class="review-card">
        <view class="review-header">
          <text class="review-title">知识点回顾</text>
          <text class="review-progress">{{ reviewCard.progress.current }}/{{ reviewCard.progress.total }}</text>
        </view>
        <view class="topic-display">
          <text class="topic-text">{{ reviewCard.topic }}</text>
          <text class="difficulty-badge" :class="reviewCard.difficulty">{{ reviewCard.difficulty }}</text>
        </view>
        <view class="question-area">
          <text class="question-text">{{ reviewCard.question }}</text>
        </view>
        <view class="answer-area" v-if="showAnswer">
          <text class="answer-label">答案:</text>
          <text class="answer-text">{{ reviewCard.answer }}</text>
        </view>
        <view class="review-actions">
          <button v-if="!showAnswer" class="reveal-btn" @click="showAnswer = true">显示答案</button>
          <view v-else class="judge-buttons">
            <button class="judge-btn wrong" @click="judgeAnswer(false)">没掌握</button>
            <button class="judge-btn correct" @click="judgeAnswer(true)">掌握了</button>
          </view>
        </view>
        <button class="exit-review" @click="exitReview">退出复习</button>
      </view>
    </view>
  </view>
</template>

<script>
import { getConversationStore } from '@/services/agent/conversationStore.js'
import { ConversationListItem } from '@/services/agent/conversationCard.js'
import { getReviewMode } from '@/services/agent/reviewMode.js'

export default {
  data() {
    return {
      childId: 'child1',
      conversations: [],
      selectedConv: null,
      reviewCard: null,
      showSearch: false,
      showFilters: false,
      showAnswer: false,
      searchQuery: '',
      selectedAgent: 'all',
      sortBy: 'recent',
      page: 1,
      hasMore: true,
      stats: { total: 0, thisWeek: 0, favorites: 0 },
      agentTypes: [
        { id: 'all', label: '全部' },
        { id: 'math', label: '数学' },
        { id: 'chinese', label: '中文' },
        { id: 'english', label: '英语' },
        { id: 'life', label: '生活' }
      ]
    }
  },
  onLoad() {
    this.store = getConversationStore()
    this.listItemRenderer = new ConversationListItem()
    this.loadConversations()
    this.loadStats()
  },
  methods: {
    loadConversations() {
      const opts = { page: this.page, pageSize: 20 }
      if (this.selectedAgent !== 'all') opts.agentType = this.selectedAgent
      if (this.searchQuery) opts.query = this.searchQuery

      const result = this.store.getAllConversations(this.childId, opts)
      if (this.page === 1) {
        this.conversations = result.items
      } else {
        this.conversations.push(...result.items)
      }
      this.hasMore = result.items.length === 20
    },
    loadStats() {
      this.stats = this.store.getStats(this.childId)
    },
    loadMore() {
      if (!this.hasMore) return
      this.page++
      this.loadConversations()
    },
    doSearch() {
      this.page = 1
      this.loadConversations()
    },
    selectAgent(agentId) {
      this.selectedAgent = agentId
      this.page = 1
      this.loadConversations()
    },
    openConv(conv) {
      this.selectedConv = conv
    },
    toggleFav(conv) {
      this.store.toggleFavorite(this.childId, conv.agentId, conv.id)
      this.loadConversations()
      this.loadStats()
    },
    startReview(conv) {
      this.selectedConv = null
      this.showAnswer = false
      const review = getReviewMode(this.store)
      const session = review.startReviewSession(this.childId, conv.agentId, { topic: conv.metadata.topics?.[0] })
      this.reviewCard = review.getCurrentCard()
      this.reviewMode = review
    },
    judgeAnswer(correct) {
      const result = this.reviewMode.submitAnswer(correct)
      if (result?.isComplete) {
        uni.showModal({
          title: '复习完成',
          content: `得分: ${result.score}分，${result.recommendation}`,
          showCancel: false
        })
        this.reviewCard = null
      } else if (result) {
        this.reviewCard = this.reviewMode.getCurrentCard()
        this.showAnswer = false
      }
    },
    exitReview() {
      this.reviewCard = null
      this.showAnswer = false
    },
    getAgentLabel(id) {
      return { math: '数学', chinese: '中文', english: '英语', life: '生活' }[id] || id
    },
    getAgentColor(id) {
      return { math: '#4f46e5', chinese: '#059669', english: '#d97706', life: '#dc2626' }[id] || '#6b7280'
    },
    getLastMessage(conv) {
      const msg = conv.messages[conv.messages.length - 1]
      const text = msg?.content || ''
      return text.length > 80 ? text.substring(0, 80) + '...' : text
    },
    formatDate(ts) {
      return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    },
    formatTime(ts) {
      if (!ts) return ''
      return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: #f3f4f6;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 20rpx;
  background: #fff;
}
.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1f2937;
}
.header-actions {
  display: flex;
  gap: 16rpx;
}
.icon-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  font-size: 28rpx;
}
.search-bar {
  display: flex;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.search-input {
  flex: 1;
  height: 72rpx;
  background: #f3f4f6;
  border-radius: 16rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}
.search-btn {
  width: 120rpx;
  background: #4f46e5;
  color: #fff;
  border-radius: 16rpx;
  border: none;
  font-size: 28rpx;
}
.filters {
  padding: 16rpx 20rpx;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}
.filter-label {
  font-size: 26rpx;
  color: #6b7280;
  width: 80rpx;
}
.filter-options {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}
.filter-btn {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  background: #f3f4f6;
  border: none;
  font-size: 24rpx;
  color: #374151;
}
.filter-btn.active {
  background: #4f46e5;
  color: #fff;
}
.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 20rpx;
  background: #fff;
  margin-bottom: 16rpx;
}
.stat-item {
  text-align: center;
}
.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #4f46e5;
  display: block;
}
.stat-label {
  font-size: 22rpx;
  color: #6b7280;
}
.conv-list {
  height: calc(100vh - 300rpx);
}
.conv-items {
  padding: 0 20rpx;
}
.conv-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.conv-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}
.agent-badge {
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  color: #fff;
  font-size: 22rpx;
}
.conv-date {
  font-size: 24rpx;
  color: #9ca3af;
}
.fav-icon {
  margin-left: auto;
  font-size: 28rpx;
}
.conv-preview {
  margin-bottom: 12rpx;
}
.preview-text {
  font-size: 28rpx;
  color: #374151;
  line-height: 1.5;
}
.conv-topics {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
  margin-bottom: 12rpx;
}
.topic-tag {
  background: #e0e7ff;
  color: #4338ca;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
}
.conv-actions {
  display: flex;
  gap: 12rpx;
}
.action-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  font-size: 28rpx;
}
.load-more {
  text-align: center;
  padding: 24rpx;
  color: #6b7280;
  font-size: 26rpx;
}
.empty-state {
  text-align: center;
  padding: 80rpx 0;
}
.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}
.empty-text {
  font-size: 28rpx;
  color: #9ca3af;
}
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal-content {
  width: 90%;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1px solid #e5e7eb;
}
.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}
.close-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  font-size: 28rpx;
}
.modal-messages {
  height: 400rpx;
  padding: 24rpx;
}
.message {
  margin-bottom: 20rpx;
}
.message.user {
  text-align: right;
}
.msg-role {
  font-size: 22rpx;
  color: #9ca3af;
  margin-bottom: 4rpx;
  display: block;
}
.msg-content {
  font-size: 28rpx;
  color: #374151;
  display: block;
  line-height: 1.5;
}
.msg-time {
  font-size: 20rpx;
  color: #d1d5db;
}
.modal-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx;
  border-top: 1px solid #e5e7eb;
}
.footer-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #4f46e5;
  color: #fff;
  border: none;
  font-size: 28rpx;
}
.review-mode {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.review-card {
  width: 90%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
}
.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}
.review-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1f2937;
}
.review-progress {
  font-size: 28rpx;
  color: #6b7280;
}
.topic-display {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 30rpx;
}
.topic-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #4f46e5;
}
.difficulty-badge {
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
}
.difficulty-badge.easy { background: #d1fae5; color: #059669; }
.difficulty-badge.medium { background: #fef3c7; color: #d97706; }
.difficulty-badge.hard { background: #fee2e2; color: #dc2626; }
.question-area {
  background: #f3f4f6;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
}
.question-text {
  font-size: 30rpx;
  color: #374151;
  line-height: 1.6;
}
.answer-area {
  background: #e0e7ff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}
.answer-label {
  font-size: 24rpx;
  color: #4338ca;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
}
.answer-text {
  font-size: 28rpx;
  color: #3730a3;
  line-height: 1.5;
}
.review-actions {
  margin-bottom: 20rpx;
}
.reveal-btn, .judge-btn {
  width: 100%;
  padding: 24rpx;
  border-radius: 16rpx;
  border: none;
  font-size: 30rpx;
  font-weight: 600;
}
.reveal-btn {
  background: #4f46e5;
  color: #fff;
}
.judge-buttons {
  display: flex;
  gap: 16rpx;
}
.judge-btn {
  flex: 1;
}
.judge-btn.wrong {
  background: #fee2e2;
  color: #dc2626;
}
.judge-btn.correct {
  background: #d1fae5;
  color: #059669;
}
.exit-review {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 26rpx;
}
</style>