<template>
  <view class="reading-log-page">
    <!-- 头部统计 -->
    <view class="header">
      <view class="header-content">
        <text class="page-title">📖 阅读打卡</text>
        <text class="page-subtitle">记录每日阅读时光</text>
      </view>
    </view>

    <!-- 今日打卡卡片 -->
    <view class="today-card" :class="{checked: store.hasCheckedInToday}">
      <view class="today-left">
        <view class="streak-badge">
          <text class="streak-icon">🔥</text>
          <text class="streak-count">{{ store.streakDays }}</text>
          <text class="streak-label">连续天数</text>
        </view>
      </view>
      <view class="today-center">
        <view class="check-status">
          <text class="check-icon">{{ store.hasCheckedInToday ? '✅' : '📝' }}</text>
          <text class="check-text">
            {{ store.hasCheckedInToday ? '今日已完成' : '今日未打卡' }}
          </text>
        </view>
        <text class="today-date">{{ todayStr }}</text>
      </view>
      <view class="today-right">
        <view class="stats-mini">
          <view class="stat-item">
            <text class="stat-value">{{ store.readingStats?.totalPages || 0 }}</text>
            <text class="stat-label">本周阅读</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ store.readingStats?.totalMinutes || 0 }}</text>
            <text class="stat-label">阅读分钟</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 阅读打卡表单 -->
    <view class="checkin-form" v-if="!store.hasCheckedInToday">
      <view class="form-card">
        <text class="form-title">今日阅读记录</text>
        
        <!-- 选择书籍 -->
        <view class="form-section">
          <text class="form-label">选择书籍</text>
          <view class="book-selector" @tap="showBookPicker">
            <text v-if="selectedBook">{{ selectedBook.title }}</text>
            <text v-else class="placeholder">请选择正在阅读的书籍</text>
            <text class="arrow">›</text>
          </view>
        </view>
        
        <!-- 阅读页数 -->
        <view class="form-section">
          <text class="form-label">阅读页数</text>
          <view class="page-input">
            <input 
              type="number" 
              v-model="logData.startPage" 
              placeholder="起始页"
              class="page-field"
            />
            <text class="page-separator">-</text>
            <input 
              type="number" 
              v-model="logData.endPage" 
              placeholder="结束页"
              class="page-field"
            />
          </view>
        </view>
        
        <!-- 阅读时长 -->
        <view class="form-section">
          <text class="form-label">阅读时长（分钟）</text>
          <input 
            type="number" 
            v-model="logData.duration" 
            placeholder="请输入阅读时长"
            class="duration-input"
          />
        </view>
        
        <!-- 今日感悟 -->
        <view class="form-section">
          <text class="form-label">今日感悟（选填）</text>
          <textarea 
            v-model="logData.note" 
            placeholder="写下今天的阅读感受..."
            class="note-input"
          />
        </view>
        
        <button class="checkin-btn" @tap="doCheckIn">打卡</button>
      </view>
    </view>

    <!-- 阅读记录列表 -->
    <view class="log-list-section">
      <view class="section-header">
        <text class="section-title">阅读记录</text>
        <view class="tab-bar">
          <view 
            class="tab" 
            :class="{active: activeTab === 'week'}"
            @tap="switchTab('week')"
          >
            本周
          </view>
          <view 
            class="tab"
            :class="{active: activeTab === 'month'}"
            @tap="switchTab('month')"
          >
            本月
          </view>
        </view>
      </view>
      
      <view class="log-list" v-if="filteredLogs.length > 0">
        <view 
          v-for="log in filteredLogs" 
          :key="log.id"
          class="log-item"
        >
          <view class="log-date-badge">
            <text class="log-day">{{ formatDay(log.date) }}</text>
            <text class="log-month">{{ formatMonth(log.date) }}</text>
          </view>
          <view class="log-content">
            <text class="log-book-title">{{ log.bookTitle || '未知书籍' }}</text>
            <view class="log-meta">
              <text class="log-pages">阅读 {{ log.pagesRead || (log.endPage - log.startPage) || 0 }} 页</text>
              <text class="log-duration">{{ log.duration || 0 }}分钟</text>
            </view>
            <text class="log-note" v-if="log.note">{{ log.note }}</text>
          </view>
        </view>
      </view>
      
      <view class="empty-logs" v-else>
        <text class="empty-icon">📚</text>
        <text class="empty-text">还没有阅读记录</text>
        <text class="empty-hint">开始今天的阅读打卡吧</text>
      </view>
    </view>

    <!-- 书籍选择弹窗 -->
    <view class="modal" v-if="showBooks" @tap.stop="closeBookPicker">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">选择书籍</text>
          <view class="close-btn" @tap="closeBookPicker">×</view>
        </view>
        
        <view class="book-list-modal">
          <view 
            v-for="book in store.books" 
            :key="book.id"
            class="book-option"
            :class="{selected: selectedBookId === book.id}"
            @tap="selectBook(book)"
          >
            <view class="book-option-cover">
              <text class="book-icon-small">📖</text>
            </view>
            <view class="book-option-info">
              <text class="book-option-title">{{ book.title }}</text>
              <text class="book-option-author">{{ book.author }}</text>
            </view>
            <text class="check-mark" v-if="selectedBookId === book.id">✓</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useReadingStore } from '@/stores/readingStore.js'

export default {
  data() {
    return {
      todayStr: '',
      activeTab: 'week',
      selectedBookId: '',
      selectedBook: null,
      showBooks: false,
      logData: {
        startPage: '',
        endPage: '',
        duration: '',
        note: ''
      }
    }
  },
  
  computed: {
    store() {
      return useReadingStore()
    },
    
    filteredLogs() {
      if (!this.store.readingLogs) return []
      
      const now = new Date()
      let startDate = new Date(now)
      
      if (this.activeTab === 'week') {
        startDate.setDate(startDate.getDate() - 7)
      } else {
        startDate.setMonth(startDate.getMonth() - 1)
      }
      
      return this.store.readingLogs.filter(log => {
        const logDate = new Date(log.date)
        return logDate >= startDate
      })
    }
  },
  
  onLoad(options) {
    this.todayStr = this.formatToday()
    
    if (options.bookId) {
      this.selectedBookId = options.bookId
      this.selectedBook = this.store.books.find(b => b.id === options.bookId)
    }
    
    this.store.loadReadingLogs()
    this.store.loadReadingStats()
  },
  
  methods: {
    formatToday() {
      const now = new Date()
      return `${now.getMonth() + 1}月${now.getDate()}日 ${['日','一','二','三','四','五','六'][now.getDay()]}`
    },
    
    formatDay(dateStr) {
      return new Date(dateStr).getDate()
    },
    
    formatMonth(dateStr) {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}月`
    },
    
    switchTab(tab) {
      this.activeTab = tab
      this.store.loadReadingStats(this.store.currentBabyId, tab === 'week' ? 'week' : 'month')
    },
    
    showBookPicker() {
      this.showBooks = true
    },
    
    closeBookPicker() {
      this.showBooks = false
    },
    
    selectBook(book) {
      this.selectedBook = book
      this.selectedBookId = book.id
      this.closeBookPicker()
    },
    
    doCheckIn() {
      if (!this.selectedBookId) {
        uni.showToast({ title: '请选择书籍', icon: 'none' })
        return
      }
      
      if (!this.logData.duration) {
        uni.showToast({ title: '请输入阅读时长', icon: 'none' })
        return
      }
      
      const pagesRead = this.logData.endPage 
        ? (parseInt(this.logData.endPage) - parseInt(this.logData.startPage || 0))
        : 0
      
      this.store.checkIn({
        bookId: this.selectedBookId,
        bookTitle: this.selectedBook.title,
        startPage: parseInt(this.logData.startPage) || 0,
        endPage: parseInt(this.logData.endPage) || 0,
        pagesRead,
        duration: parseInt(this.logData.duration) || 0,
        note: this.logData.note
      })
      
      uni.showToast({ title: '打卡成功', icon: 'success' })
      
      // 更新挑战进度
      this.updateChallengeProgress()
    },
    
    updateChallengeProgress() {
      // 更新连续打卡挑战
      const streakChallenge = this.store.challenges.find(c => c.type === 'streak')
      if (streakChallenge) {
        this.store.refreshChallengeProgress(streakChallenge.id, this.store.streakDays)
      }
      
      // 更新阅读时间挑战
      const timeChallenge = this.store.challenges.find(c => c.type === 'time')
      if (timeChallenge && this.store.readingStats) {
        this.store.refreshChallengeProgress(timeChallenge.id, this.store.readingStats.totalMinutes)
      }
    }
  }
}
</script>

<style scoped>
.reading-log-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

.header {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  padding: 40px 20px 30px;
  color: white;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 5px;
}

.today-card {
  background: white;
  margin: -20px 15px 15px;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  position: relative;
  z-index: 10;
}

.today-card.checked {
  border: 2px solid #4CAF50;
}

.today-left {
  flex: 1;
}

.streak-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.streak-icon {
  font-size: 28px;
}

.streak-count {
  font-size: 28px;
  font-weight: bold;
  color: #FF6B35;
}

.streak-label {
  font-size: 11px;
  color: #999;
}

.today-center {
  flex: 2;
  text-align: center;
}

.check-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.check-icon {
  font-size: 24px;
}

.check-text {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.today-date {
  font-size: 13px;
  color: #999;
  margin-top: 5px;
}

.today-right {
  flex: 1;
}

.stats-mini {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: block;
}

.stat-label {
  font-size: 10px;
  color: #999;
}

.checkin-form {
  padding: 0 15px;
  margin-bottom: 20px;
}

.form-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.form-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  display: block;
}

.form-section {
  margin-bottom: 18px;
}

.form-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.book-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f5f5f5;
  border-radius: 10px;
  font-size: 14px;
  color: #333;
}

.book-selector .placeholder {
  color: #999;
}

.book-selector .arrow {
  font-size: 18px;
  color: #ccc;
}

.page-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-field {
  flex: 1;
  height: 44px;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 0 15px;
  font-size: 14px;
  text-align: center;
}

.page-separator {
  font-size: 18px;
  color: #999;
}

.duration-input {
  width: 100%;
  height: 44px;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 0 15px;
  font-size: 14px;
}

.note-input {
  width: 100%;
  height: 100px;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 12px 15px;
  font-size: 14px;
}

.checkin-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;
}

.log-list-section {
  padding: 0 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.tab-bar {
  display: flex;
  gap: 5px;
}

.tab {
  padding: 6px 15px;
  border-radius: 15px;
  font-size: 13px;
  color: #666;
  background: #e0e0e0;
}

.tab.active {
  background: #4CAF50;
  color: white;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-item {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.log-date-badge {
  width: 50px;
  text-align: center;
  padding-right: 15px;
  border-right: 1px solid #eee;
  margin-right: 15px;
}

.log-day {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  display: block;
}

.log-month {
  font-size: 11px;
  color: #999;
}

.log-content {
  flex: 1;
}

.log-book-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.log-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 5px;
}

.log-pages, .log-duration {
  font-size: 12px;
  color: #666;
}

.log-note {
  font-size: 12px;
  color: #999;
  display: block;
  margin-top: 5px;
  line-height: 1.4;
}

.empty-logs {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 20px;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 50px;
  margin-bottom: 15px;
}

.empty-text {
  font-size: 15px;
  color: #333;
  font-weight: bold;
}

.empty-hint {
  font-size: 13px;
  color: #999;
  margin-top: 5px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 28px;
  color: #999;
  padding: 0 10px;
}

.book-list-modal {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.book-option {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 10px;
  gap: 12px;
}

.book-option.selected {
  background: #E8F5E9;
  border: 1px solid #4CAF50;
}

.book-option-cover {
  width: 45px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-icon-small {
  font-size: 20px;
}

.book-option-info {
  flex: 1;
}

.book-option-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
}

.book-option-author {
  font-size: 12px;
  color: #666;
}

.check-mark {
  font-size: 20px;
  color: #4CAF50;
  font-weight: bold;
}
</style>
