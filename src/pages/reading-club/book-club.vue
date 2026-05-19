<template>
  <view class="book-club-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <text class="page-title">📚 读书俱乐部</text>
        <text class="page-subtitle">加入书友圈，共享阅读乐趣</text>
      </view>
      <view class="create-btn" @tap="showCreateClub">
        <text>+</text>
      </view>
    </view>

    <!-- Tab导航 -->
    <view class="tab-bar">
      <view 
        class="tab" 
        :class="{active: activeTab === 'discover'}"
        @tap="switchTab('discover')"
      >
        发现
      </view>
      <view 
        class="tab" 
        :class="{active: activeTab === 'my'}"
        @tap="switchTab('my')"
      >
        我的俱乐部
      </view>
      <view 
        class="tab" 
        :class="{active: activeTab === 'reviews'}"
        @tap="switchTab('reviews')"
      >
        书评分享
      </view>
      <view 
        class="tab" 
        :class="{active: activeTab === 'excerpts'}"
        @tap="switchTab('excerpts')"
      >
        精彩摘录
      </view>
    </view>

    <!-- 发现俱乐部 -->
    <view class="content" v-if="activeTab === 'discover'">
      <!-- 推荐俱乐部 -->
      <view class="section" v-if="store.recommendedClubs.length > 0">
        <view class="section-header">
          <text class="section-title">🌟 推荐俱乐部</text>
        </view>
        <scroll-view class="club-scroll" scroll-x>
          <view 
            v-for="club in store.recommendedClubs" 
            :key="club.id"
            class="club-card"
            @tap="viewClub(club)"
          >
            <view class="club-cover">
              <text class="club-icon">📚</text>
            </view>
            <text class="club-name">{{ club.name }}</text>
            <text class="club-members">{{ club.memberCount }}位书友</text>
          </view>
        </scroll-view>
      </view>

      <!-- 全部俱乐部 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">全部俱乐部</text>
        </view>
        <view class="club-list">
          <view 
            v-for="club in store.clubs" 
            :key="club.id"
            class="club-item"
            @tap="viewClub(club)"
          >
            <view class="club-avatar">
              <text class="club-avatar-icon">📚</text>
            </view>
            <view class="club-info">
              <text class="club-item-name">{{ club.name }}</text>
              <text class="club-desc">{{ club.description }}</text>
              <view class="club-meta">
                <text class="meta-item">{{ club.memberCount }}位成员</text>
                <text class="meta-item">{{ club.bookCount }}本书</text>
                <text class="meta-tag">{{ club.ageRange }}岁</text>
              </view>
            </view>
            <view class="club-action">
              <view class="join-btn" @tap.stop="joinClub(club)" v-if="!isClubMember(club.id)">
                <text>加入</text>
              </view>
              <text class="joined-tag" v-else>已加入</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 我的俱乐部 -->
    <view class="content" v-if="activeTab === 'my'">
      <view class="empty-state" v-if="store.myClubs.length === 0">
        <text class="empty-icon">📖</text>
        <text class="empty-title">还没有加入俱乐部</text>
        <text class="empty-desc">去发现页加入感兴趣的俱乐部吧</text>
        <button class="start-btn" @tap="switchTab('discover')">发现俱乐部</button>
      </view>
      
      <view class="club-list" v-else>
        <view 
          v-for="club in store.myClubs" 
          :key="club.id"
          class="club-item"
          @tap="viewClub(club)"
        >
          <view class="club-avatar">
            <text class="club-avatar-icon">📚</text>
          </view>
          <view class="club-info">
            <text class="club-item-name">{{ club.name }}</text>
            <text class="club-desc">{{ club.description }}</text>
            <view class="club-meta">
              <text class="meta-item">{{ club.memberCount }}位成员</text>
              <text class="meta-item">{{ club.bookCount }}本书</text>
            </view>
          </view>
          <view class="club-arrow">
            <text>›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 书评分享 -->
    <view class="content" v-if="activeTab === 'reviews'">
      <view class="list-header">
        <text class="list-title">书评分享</text>
        <view class="publish-btn" @tap="goToPublishReview">
          <text>发布书评</text>
        </view>
      </view>
      
      <view class="review-list">
        <view 
          v-for="review in store.reviews" 
          :key="review.id"
          class="review-item"
          @tap="viewReview(review)"
        >
          <view class="review-header">
            <view class="reviewer-info">
              <text class="reviewer-avatar">👤</text>
              <text class="reviewer-name">{{ review.babyName }}</text>
            </view>
            <text class="review-time">{{ formatTime(review.createdAt) }}</text>
          </view>
          <text class="review-book">📖 {{ review.bookTitle }}</text>
          <text class="review-title">{{ review.title }}</text>
          <text class="review-content">{{ review.content }}</text>
          <view class="review-footer">
            <view class="review-stats">
              <text class="stat">❤️ {{ review.likes }}</text>
              <text class="stat">💬 {{ review.commentCount }}</text>
            </view>
            <view class="rating">
              <text v-for="i in 5" :key="i" :class="{filled: i <= review.rating}">⭐</text>
            </view>
          </view>
        </view>
        
        <view class="empty-state" v-if="store.reviews.length === 0">
          <text class="empty-icon">📝</text>
          <text class="empty-title">还没有书评</text>
          <text class="empty-desc">写下你的第一篇书评吧</text>
        </view>
      </view>
    </view>

    <!-- 精彩摘录 -->
    <view class="content" v-if="activeTab === 'excerpts'">
      <view class="list-header">
        <text class="list-title">精彩摘录</text>
        <view class="publish-btn" @tap="showAddExcerpt">
          <text>添加摘录</text>
        </view>
      </view>
      
      <view class="excerpt-list">
        <view 
          v-for="excerpt in store.excerpts" 
          :key="excerpt.id"
          class="excerpt-item"
        >
          <view class="excerpt-header">
            <text class="excerpt-book">📖 {{ excerpt.bookTitle }}</text>
            <text class="excerpt-chapter" v-if="excerpt.chapter">第{{ excerpt.chapter }}章</text>
          </view>
          <text class="excerpt-content">"{{ excerpt.content }}"</text>
          <view class="excerpt-footer">
            <text class="excerpt-author">—— {{ excerpt.babyName }}</text>
            <text class="excerpt-mood" v-if="excerpt.mood">{{ excerpt.mood }}</text>
          </view>
        </view>
        
        <view class="empty-state" v-if="store.excerpts.length === 0">
          <text class="empty-icon">📑</text>
          <text class="empty-title">还没有摘录</text>
          <text class="empty-desc">记录书中的精彩片段吧</text>
        </view>
      </view>
    </view>

    <!-- 创建俱乐部弹窗 -->
    <view class="modal" v-if="showCreateModal" @tap.stop="closeCreateModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">创建读书俱乐部</text>
          <view class="close-btn" @tap="closeCreateModal">×</view>
        </view>
        
        <view class="form-section">
          <text class="form-label">俱乐部名称 *</text>
          <input class="form-input" v-model="newClub.name" placeholder="给俱乐部起个名字" />
        </view>
        
        <view class="form-section">
          <text class="form-label">简介</text>
          <textarea class="form-textarea" v-model="newClub.description" placeholder="描述俱乐部的特点" />
        </view>
        
        <view class="form-section">
          <text class="form-label">年龄段</text>
          <input class="form-input" v-model="newClub.ageRange" placeholder="如：3-6" />
        </view>
        
        <view class="modal-footer">
          <button class="cancel-btn" @tap="closeCreateModal">取消</button>
          <button class="confirm-btn" @tap="createClub">创建</button>
        </view>
      </view>
    </view>

    <!-- 添加摘录弹窗 -->
    <view class="modal" v-if="showExcerptModal" @tap.stop="closeExcerptModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加精彩摘录</text>
          <view class="close-btn" @tap="closeExcerptModal">×</view>
        </view>
        
        <view class="form-section">
          <text class="form-label">书籍名称 *</text>
          <input class="form-input" v-model="newExcerpt.bookTitle" placeholder="书名" />
        </view>
        
        <view class="form-section">
          <text class="form-label">章节（选填）</text>
          <input class="form-input" v-model="newExcerpt.chapter" placeholder="第几章" />
        </view>
        
        <view class="form-section">
          <text class="form-label">摘录内容 *</text>
          <textarea class="form-textarea large" v-model="newExcerpt.content" placeholder="记录书中的精彩内容..." />
        </view>
        
        <view class="form-section">
          <text class="form-label">心情（选填）</text>
          <input class="form-input" v-model="newExcerpt.mood" placeholder="如：感动、震撼" />
        </view>
        
        <view class="modal-footer">
          <button class="cancel-btn" @tap="closeExcerptModal">取消</button>
          <button class="confirm-btn" @tap="saveExcerpt">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useReadingClubStore } from '@/stores/readingClubStore.js'

export default {
  data() {
    return {
      activeTab: 'discover',
      showCreateModal: false,
      showExcerptModal: false,
      newClub: {
        name: '',
        description: '',
        ageRange: ''
      },
      newExcerpt: {
        bookTitle: '',
        chapter: '',
        content: '',
        mood: ''
      }
    }
  },
  
  computed: {
    store() {
      return useReadingClubStore()
    }
  },
  
  onLoad() {
    this.store.loadClubs()
    this.store.loadReviews()
    this.store.loadExcerpts()
  },
  
  onShow() {
    if (!uni.getStorageSync('reading_clubs')) {
      this.store.loadClubs()
    }
  },
  
  methods: {
    switchTab(tab) {
      this.activeTab = tab
    },
    
    isClubMember(clubId) {
      return this.store.myClubs.some(c => c.id === clubId)
    },
    
    viewClub(club) {
      uni.navigateTo({
        url: `/pages/reading-club/club-detail?clubId=${club.id}`
      })
    },
    
    joinClub(club) {
      const result = this.store.joinNewClub(club.id)
      if (result) {
        uni.showToast({ title: '加入成功', icon: 'success' })
      }
    },
    
    showCreateClub() {
      this.newClub = { name: '', description: '', ageRange: '' }
      this.showCreateModal = true
    },
    
    closeCreateModal() {
      this.showCreateModal = false
    },
    
    createClub() {
      if (!this.newClub.name) {
        uni.showToast({ title: '请输入俱乐部名称', icon: 'none' })
        return
      }
      
      const club = this.store.createNewClub(this.newClub)
      if (club) {
        uni.showToast({ title: '创建成功', icon: 'success' })
        this.closeCreateModal()
      }
    },
    
    viewReview(review) {
      uni.navigateTo({
        url: `/pages/reading-club/review-detail?reviewId=${review.id}`
      })
    },
    
    goToPublishReview() {
      uni.navigateTo({
        url: '/pages/reading-club/review-publish'
      })
    },
    
    showAddExcerpt() {
      this.newExcerpt = { bookTitle: '', chapter: '', content: '', mood: '' }
      this.showExcerptModal = true
    },
    
    closeExcerptModal() {
      this.showExcerptModal = false
    },
    
    saveExcerpt() {
      if (!this.newExcerpt.bookTitle || !this.newExcerpt.content) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      
      const excerpt = this.store.addNewExcerpt(this.newExcerpt)
      if (excerpt) {
        uni.showToast({ title: '保存成功', icon: 'success' })
        this.closeExcerptModal()
      }
    },
    
    formatTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
      
      return `${date.getMonth() + 1}/${date.getDate()}`
    }
  }
}
</script>

<style scoped>
.book-club-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px 30px;
  color: white;
  position: relative;
}

.header-content {
  display: flex;
  flex-direction: column;
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

.create-btn {
  position: absolute;
  right: 20px;
  top: 40px;
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.tab-bar {
  display: flex;
  background: white;
  padding: 0 10px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 15px 0;
  font-size: 14px;
  color: #666;
  position: relative;
}

.tab.active {
  color: #667eea;
  font-weight: bold;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: #667eea;
  border-radius: 2px;
}

.content {
  padding: 15px;
}

.section {
  margin-bottom: 20px;
}

.section-header {
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.club-scroll {
  white-space: nowrap;
}

.club-card {
  display: inline-block;
  width: 140px;
  margin-right: 12px;
  background: white;
  border-radius: 12px;
  padding: 15px;
  text-align: center;
}

.club-cover {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.club-icon {
  font-size: 36px;
}

.club-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.club-members {
  font-size: 12px;
  color: #999;
}

.club-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.club-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.club-item:last-child {
  border-bottom: none;
}

.club-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.club-avatar-icon {
  font-size: 28px;
}

.club-info {
  flex: 1;
}

.club-item-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.club-desc {
  font-size: 12px;
  color: #666;
  display: block;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.club-meta {
  display: flex;
  gap: 10px;
}

.meta-item {
  font-size: 11px;
  color: #999;
}

.meta-tag {
  font-size: 11px;
  color: #667eea;
  background: rgba(102,126,234,0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.club-action {
  margin-left: 10px;
}

.join-btn {
  background: #667eea;
  color: white;
  padding: 6px 14px;
  border-radius: 15px;
  font-size: 12px;
}

.joined-tag {
  color: #4CAF50;
  font-size: 12px;
}

.club-arrow {
  font-size: 20px;
  color: #ccc;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.list-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.publish-btn {
  background: #667eea;
  color: white;
  padding: 6px 14px;
  border-radius: 15px;
  font-size: 12px;
}

.review-list, .excerpt-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.review-item, .excerpt-item {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-child, .excerpt-item:last-child {
  border-bottom: none;
}

.review-header, .excerpt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reviewer-avatar {
  font-size: 20px;
}

.reviewer-name {
  font-size: 13px;
  color: #333;
}

.review-time, .excerpt-chapter {
  font-size: 11px;
  color: #999;
}

.review-book {
  font-size: 12px;
  color: #667eea;
  display: block;
  margin-bottom: 6px;
}

.review-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 6px;
}

.review-content {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: block;
  margin-bottom: 10px;
}

.review-footer, .excerpt-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-stats {
  display: flex;
  gap: 15px;
}

.stat {
  font-size: 12px;
  color: #999;
}

.rating text {
  font-size: 12px;
  opacity: 0.3;
}

.rating text.filled {
  opacity: 1;
}

.excerpt-book {
  font-size: 13px;
  color: #667eea;
  font-weight: bold;
}

.excerpt-content {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  font-style: italic;
  display: block;
  margin: 10px 0;
}

.excerpt-author {
  font-size: 12px;
  color: #999;
}

.excerpt-mood {
  font-size: 12px;
  color: #FF6B35;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 60px;
  display: block;
  margin-bottom: 15px;
}

.empty-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #999;
  display: block;
  margin-bottom: 20px;
}

.start-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 30px;
  font-size: 14px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-height: 80vh;
  background: white;
  border-radius: 16px;
  padding: 20px;
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
  font-size: 24px;
  color: #999;
}

.form-section {
  margin-bottom: 15px;
}

.form-label {
  font-size: 13px;
  color: #666;
  display: block;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  height: 44px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  height: 100px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-textarea.large {
  height: 150px;
}

.modal-footer {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  font-size: 14px;
  border: none;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.confirm-btn {
  background: #667eea;
  color: white;
}
</style>
