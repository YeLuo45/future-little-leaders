<template>
  <view class="challenges-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <text class="page-title">🏆 阅读挑战</text>
        <text class="page-subtitle">完成挑战赢取积分</text>
      </view>
    </view>

    <!-- 我的阅读统计 -->
    <view class="stats-overview">
      <view class="stat-card">
        <text class="stat-icon">📚</text>
        <text class="stat-value">{{ totalBooksRead }}</text>
        <text class="stat-label">已读书籍</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">🔥</text>
        <text class="stat-value">{{ store.streakDays }}</text>
        <text class="stat-label">连续天数</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">⏱️</text>
        <text class="stat-value">{{ store.readingStats?.totalMinutes || 0 }}</text>
        <text class="stat-label">阅读分钟</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">⭐</text>
        <text class="stat-value">{{ totalPoints }}</text>
        <text class="stat-label">获得积分</text>
      </view>
    </view>

    <!-- 挑战列表 -->
    <view class="challenges-section">
      <view class="section-header">
        <text class="section-title">进行中的挑战</text>
      </view>

      <view class="challenge-list" v-if="activeChallenges.length > 0">
        <view 
          v-for="challenge in activeChallenges" 
          :key="challenge.id"
          class="challenge-card"
          @tap="viewChallenge(challenge)"
        >
          <view class="challenge-header">
            <view class="challenge-icon-wrap" :style="{background: getChallengeColor(challenge.type)}">
              <text class="challenge-icon">{{ getChallengeIcon(challenge.type) }}</text>
            </view>
            <view class="challenge-info">
              <text class="challenge-title">{{ challenge.title }}</text>
              <text class="challenge-desc">{{ challenge.description }}</text>
            </view>
          </view>
          
          <view class="challenge-progress">
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :style="{width: getProgressPercent(challenge) + '%', background: getChallengeColor(challenge.type)}"
              ></view>
            </view>
            <view class="progress-text">
              <text class="progress-current">{{ getProgressValue(challenge) }}</text>
              <text class="progress-target">/ {{ getTargetDisplay(challenge) }}</text>
            </view>
          </view>
          
          <view class="challenge-footer">
            <view class="challenge-points">
              <text class="points-icon">⭐</text>
              <text class="points-value">{{ challenge.points }}积分</text>
            </view>
            <view class="challenge-status" :class="getChallengeStatus(challenge)">
              <text>{{ getStatusText(challenge) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-challenges" v-else>
        <text class="empty-icon">🎯</text>
        <text class="empty-text">暂无进行中的挑战</text>
      </view>
    </view>

    <!-- 全部挑战 -->
    <view class="challenges-section">
      <view class="section-header">
        <text class="section-title">全部挑战</text>
      </view>

      <view class="challenge-list">
        <view 
          v-for="challenge in store.challenges" 
          :key="challenge.id"
          class="challenge-card compact"
          @tap="viewChallenge(challenge)"
        >
          <view class="challenge-icon-wrap small" :style="{background: getChallengeColor(challenge.type)}">
            <text class="challenge-icon">{{ getChallengeIcon(challenge.type) }}</text>
          </view>
          <view class="challenge-info">
            <text class="challenge-title">{{ challenge.title }}</text>
            <text class="challenge-desc">{{ challenge.description }}</text>
          </view>
          <text class="challenge-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 排行榜入口 -->
    <view class="leaderboard-section" @tap="goToLeaderboard">
      <view class="leaderboard-content">
        <text class="leaderboard-icon">📊</text>
        <view class="leaderboard-info">
          <text class="leaderboard-title">阅读积分排行榜</text>
          <text class="leaderboard-desc">看看谁读得最多</text>
        </view>
      </view>
      <text class="leaderboard-arrow">›</text>
    </view>

    <!-- 挑战详情弹窗 -->
    <view class="modal" v-if="showDetailModal" @tap.stop="closeDetail">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">挑战详情</text>
          <view class="close-btn" @tap="closeDetail">×</view>
        </view>
        
        <view class="detail-content" v-if="selectedChallenge">
          <view class="detail-header">
            <view class="detail-icon-wrap" :style="{background: getChallengeColor(selectedChallenge.type)}">
              <text class="detail-icon">{{ getChallengeIcon(selectedChallenge.type) }}</text>
            </view>
            <view class="detail-title-wrap">
              <text class="detail-title">{{ selectedChallenge.title }}</text>
              <text class="detail-desc">{{ selectedChallenge.description }}</text>
            </view>
          </view>
          
          <view class="detail-progress-section">
            <text class="detail-label">当前进度</text>
            <view class="detail-progress-bar">
              <view 
                class="detail-progress-fill" 
                :style="{width: getProgressPercent(selectedChallenge) + '%', background: getChallengeColor(selectedChallenge.type)}"
              ></view>
            </view>
            <view class="detail-progress-text">
              <text class="detail-current">{{ getProgressValue(selectedChallenge) }}</text>
              <text class="detail-target">{{ getTargetDisplay(selectedChallenge) }}</text>
            </view>
          </view>
          
          <view class="detail-info-grid">
            <view class="detail-info-item">
              <text class="detail-info-label">奖励积分</text>
              <text class="detail-info-value">{{ selectedChallenge.points }}</text>
            </view>
            <view class="detail-info-item">
              <text class="detail-info-label">挑战类型</text>
              <text class="detail-info-value">{{ getTypeName(selectedChallenge.type) }}</text>
            </view>
            <view class="detail-info-item">
              <text class="detail-info-label">开始日期</text>
              <text class="detail-info-value">{{ selectedChallenge.startDate }}</text>
            </view>
            <view class="detail-info-item">
              <text class="detail-info-label">结束日期</text>
              <text class="detail-info-value">{{ selectedChallenge.endDate }}</text>
            </view>
          </view>
          
          <view class="detail-action">
            <button class="join-btn" v-if="!isJoined" @tap="joinChallenge">参加挑战</button>
            <view class="joined-status" v-else>
              <text class="joined-text">✅ 已参加挑战</text>
              <text class="joined-hint">继续加油，完成挑战获得奖励！</text>
            </view>
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
      showDetailModal: false,
      selectedChallenge: null,
      isJoined: false,
      challengeProgress: {}
    }
  },
  
  computed: {
    store() {
      return useReadingStore()
    },
    
    activeChallenges() {
      return this.store.challenges.filter(c => c.status === 'active')
    },
    
    totalBooksRead() {
      // 统计已读书籍数量（通过日志）
      if (!this.store.readingLogs) return 0
      const uniqueBooks = new Set(this.store.readingLogs.map(l => l.bookId))
      return uniqueBooks.size
    },
    
    totalPoints() {
      // 简单计算：每读一本书10积分，每连续一天5积分
      return (this.totalBooksRead * 10) + (this.store.streakDays * 5)
    }
  },
  
  onLoad() {
    this.store.loadChallenges()
    this.store.loadReadingLogs()
    this.store.loadReadingStats()
    this.loadAllProgress()
  },
  
  methods: {
    getChallengeIcon(type) {
      const icons = {
        streak: '🔥',
        books: '📚',
        time: '⏱️',
        pages: '📄'
      }
      return icons[type] || '🎯'
    },
    
    getChallengeColor(type) {
      const colors = {
        streak: '#FF6B35',
        books: '#4CAF50',
        time: '#2196F3',
        pages: '#9C27B0'
      }
      return colors[type] || '#667eea'
    },
    
    getProgressPercent(challenge) {
      const progress = this.challengeProgress[challenge.id]
      if (!progress) return 0
      
      let target = 0
      if (challenge.type === 'streak') target = challenge.targetDays
      else if (challenge.type === 'books') target = challenge.targetBooks
      else if (challenge.type === 'time') target = challenge.targetMinutes
      else if (challenge.type === 'pages') target = challenge.targetPages
      
      if (target === 0) return 0
      return Math.min(100, Math.round((progress.currentValue / target) * 100))
    },
    
    getProgressValue(challenge) {
      const progress = this.challengeProgress[challenge.id]
      return progress?.currentValue || 0
    },
    
    getTargetDisplay(challenge) {
      if (challenge.type === 'streak') return `${challenge.targetDays}天`
      if (challenge.type === 'books') return `${challenge.targetBooks}本`
      if (challenge.type === 'time') return `${challenge.targetMinutes}分钟`
      if (challenge.type === 'pages') return `${challenge.targetPages}页`
      return ''
    },
    
    getChallengeStatus(challenge) {
      const progress = this.challengeProgress[challenge.id]
      if (!progress) return 'not-started'
      if (progress.completed) return 'completed'
      
      const percent = this.getProgressPercent(challenge)
      if (percent >= 50) return 'in-progress'
      return 'just-started'
    },
    
    getStatusText(challenge) {
      const status = this.getChallengeStatus(challenge)
      const texts = {
        'not-started': '未开始',
        'just-started': '进行中',
        'in-progress': '即将完成',
        'completed': '已完成'
      }
      return texts[status] || ''
    },
    
    getTypeName(type) {
      const names = {
        streak: '连续打卡',
        books: '阅读数量',
        time: '阅读时长',
        pages: '阅读页数'
      }
      return names[type] || '未知'
    },
    
    loadAllProgress() {
      this.store.challenges.forEach(challenge => {
        const progress = this.store.loadChallengeProgress(challenge.id)
        if (progress) {
          this.$set(this.challengeProgress, challenge.id, progress)
        }
      })
    },
    
    viewChallenge(challenge) {
      this.selectedChallenge = challenge
      const progress = this.store.loadChallengeProgress(challenge.id)
      this.isJoined = !!progress
      this.showDetailModal = true
    },
    
    closeDetail() {
      this.showDetailModal = false
      this.selectedChallenge = null
    },
    
    joinChallenge() {
      if (!this.selectedChallenge) return
      
      const progress = this.store.participateInChallenge(this.selectedChallenge.id)
      if (progress) {
        this.$set(this.challengeProgress, this.selectedChallenge.id, progress)
        this.isJoined = true
        uni.showToast({ title: '参加成功', icon: 'success' })
      }
    },
    
    goToLeaderboard() {
      uni.navigateTo({
        url: '/pages/gamification/leaderboard?type=reading'
      })
    }
  }
}
</script>

<style scoped>
.challenges-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

.header {
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
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

.stats-overview {
  display: flex;
  padding: 15px;
  gap: 10px;
  margin-top: -20px;
}

.stat-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.stat-icon {
  font-size: 20px;
  display: block;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  display: block;
}

.stat-label {
  font-size: 10px;
  color: #999;
}

.challenges-section {
  padding: 15px;
}

.section-header {
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.challenge-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.challenge-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.challenge-card.compact {
  display: flex;
  align-items: center;
  padding: 14px;
}

.challenge-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.challenge-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.challenge-icon-wrap.small {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.challenge-icon {
  font-size: 24px;
}

.challenge-info {
  flex: 1;
}

.challenge-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 3px;
}

.challenge-desc {
  font-size: 12px;
  color: #999;
}

.challenge-progress {
  margin-bottom: 12px;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-text {
  display: flex;
  justify-content: flex-end;
  gap: 3px;
  font-size: 12px;
}

.progress-current {
  color: #333;
  font-weight: bold;
}

.progress-target {
  color: #999;
}

.challenge-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.challenge-points {
  display: flex;
  align-items: center;
  gap: 4px;
}

.points-icon {
  font-size: 14px;
}

.points-value {
  font-size: 13px;
  color: #FF6B35;
  font-weight: bold;
}

.challenge-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
}

.challenge-status.not-started {
  background: #f0f0f0;
  color: #999;
}

.challenge-status.just-started {
  background: #E3F2FD;
  color: #2196F3;
}

.challenge-status.in-progress {
  background: #FFF3E0;
  color: #FF9800;
}

.challenge-status.completed {
  background: #E8F5E9;
  color: #4CAF50;
}

.challenge-arrow {
  font-size: 20px;
  color: #ccc;
}

.empty-challenges {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 50px;
  margin-bottom: 15px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.leaderboard-section {
  margin: 0 15px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.leaderboard-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.leaderboard-icon {
  font-size: 28px;
}

.leaderboard-title {
  font-size: 15px;
  font-weight: bold;
  color: white;
  display: block;
}

.leaderboard-desc {
  font-size: 12px;
  color: rgba(255,255,255,0.8);
}

.leaderboard-arrow {
  font-size: 24px;
  color: white;
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
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.detail-header {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.detail-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-icon {
  font-size: 30px;
}

.detail-title-wrap {
  flex: 1;
}

.detail-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.detail-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.detail-progress-section {
  margin-bottom: 20px;
}

.detail-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.detail-progress-bar {
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.detail-progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s;
}

.detail-progress-text {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  font-size: 14px;
}

.detail-current {
  font-weight: bold;
  color: #333;
}

.detail-target {
  color: #999;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.detail-info-item {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 12px;
}

.detail-info-label {
  font-size: 11px;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.detail-info-value {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.detail-action {
  margin-top: 10px;
}

.join-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: bold;
}

.joined-status {
  background: #E8F5E9;
  border-radius: 12px;
  padding: 15px;
  text-align: center;
}

.joined-text {
  font-size: 15px;
  font-weight: bold;
  color: #4CAF50;
  display: block;
}

.joined-hint {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}
</style>
