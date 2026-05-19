<template>
  <view class="club-detail-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="back-btn" @tap="goBack">
          <text>‹</text>
        </view>
        <view class="club-info" v-if="club">
          <view class="club-avatar">
            <text class="club-icon">📚</text>
          </view>
          <text class="club-name">{{ club.name }}</text>
          <text class="club-desc">{{ club.description }}</text>
          <view class="club-tags">
            <text class="tag" v-for="tag in club.tags" :key="tag">{{ tag }}</text>
          </view>
          <view class="club-stats">
            <view class="stat-item">
              <text class="stat-value">{{ club.memberCount }}</text>
              <text class="stat-label">成员</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ club.bookCount }}</text>
              <text class="stat-label">藏书</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ club.ageRange }}</text>
              <text class="stat-label">岁</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-bar" v-if="club">
      <view class="join-btn" v-if="!isMember" @tap="joinClub">
        <text>加入俱乐部</text>
      </view>
      <view class="leave-btn" v-else @tap="leaveClub">
        <text>退出俱乐部</text>
      </view>
    </view>

    <!-- Tab导航 -->
    <view class="tab-bar">
      <view 
        class="tab" 
        :class="{active: activeTab === 'books'}"
        @tap="switchTab('books')"
      >
        俱乐部藏书
      </view>
      <view 
        class="tab" 
        :class="{active: activeTab === 'activity'}"
        @tap="switchTab('activity')"
      >
        活动
      </view>
      <view 
        class="tab" 
        :class="{active: activeTab === 'discuss'}"
        @tap="switchTab('discuss')"
      >
        读书圈
      </view>
      <view 
        class="tab" 
        :class="{active: activeTab === 'rank'}"
        @tap="switchTab('rank')"
      >
        排行榜
      </view>
    </view>

    <!-- 俱乐部藏书 -->
    <view class="content" v-if="activeTab === 'books'">
      <view class="section-header">
        <text class="section-title">📖 俱乐部藏书</text>
        <view class="add-btn" @tap="showAddBook" v-if="isMember">
          <text>+</text>
        </view>
      </view>
      
      <view class="book-list" v-if="store.clubBooks.length > 0">
        <view 
          v-for="book in store.clubBooks" 
          :key="book.id"
          class="book-item"
        >
          <view class="book-cover">
            <text class="book-icon">📖</text>
          </view>
          <view class="book-info">
            <text class="book-title">{{ book.title }}</text>
            <text class="book-author" v-if="book.author">{{ book.author }}</text>
            <text class="book-desc" v-if="book.description">{{ book.description }}</text>
          </view>
          <text class="book-added-by" v-if="book.addedBy">by {{ book.addedBy }}</text>
        </view>
      </view>
      
      <view class="empty-state" v-else>
        <text class="empty-icon">📚</text>
        <text class="empty-text">俱乐部还没有藏书</text>
      </view>
    </view>

    <!-- 活动 -->
    <view class="content" v-if="activeTab === 'activity'">
      <view class="section-header">
        <text class="section-title">🎯 进行中的活动</text>
      </view>
      
      <view class="activity-list" v-if="store.clubActivities.length > 0">
        <view 
          v-for="activity in store.clubActivities" 
          :key="activity.id"
          class="activity-item"
        >
          <view class="activity-badge">
            <text>{{ activity.type === 'reading' ? '📖' : '💬' }}</text>
          </view>
          <view class="activity-info">
            <text class="activity-title">{{ activity.title }}</text>
            <text class="activity-desc">{{ activity.description }}</text>
            <view class="activity-meta">
              <text class="activity-date">{{ activity.startDate }} ~ {{ activity.endDate }}</text>
              <text class="activity-participants">{{ activity.participantCount }}人参与</text>
            </view>
          </view>
          <view class="activity-status" :class="activity.status">
            <text>{{ activity.status === 'active' ? '进行中' : '已结束' }}</text>
          </view>
        </view>
      </view>
      
      <view class="empty-state" v-else>
        <text class="empty-icon">🎯</text>
        <text class="empty-text">暂无活动</text>
      </view>
    </view>

    <!-- 读书圈 -->
    <view class="content" v-if="activeTab === 'discuss'">
      <view class="section-header">
        <text class="section-title">💬 读书圈讨论</text>
        <view class="add-btn" @tap="showCreateDiscussion" v-if="isMember">
          <text>+</text>
        </view>
      </view>
      
      <view class="discussion-list" v-if="store.discussions.length > 0">
        <view 
          v-for="discussion in store.discussions" 
          :key="discussion.id"
          class="discussion-item"
          @tap="viewDiscussion(discussion)"
        >
          <view class="discussion-header">
            <text class="discussion-author">{{ discussion.babyName }}</text>
            <text class="discussion-time">{{ formatTime(discussion.createdAt) }}</text>
          </view>
          <text class="discussion-title">{{ discussion.title }}</text>
          <text class="discussion-content">{{ discussion.content }}</text>
          <view class="discussion-footer">
            <text class="discussion-stat">❤️ {{ discussion.likes }}</text>
            <text class="discussion-stat">💬 {{ discussion.replyCount }}</text>
          </view>
        </view>
      </view>
      
      <view class="empty-state" v-else>
        <text class="empty-icon">💬</text>
        <text class="empty-text">暂无讨论</text>
        <text class="empty-hint" v-if="isMember">发起第一个话题吧</text>
      </view>
    </view>

    <!-- 排行榜 -->
    <view class="content" v-if="activeTab === 'rank'">
      <view class="section-header">
        <text class="section-title">🏆 阅读排行榜</text>
      </view>
      
      <view class="leaderboard" v-if="store.clubLeaderboard.length > 0">
        <view 
          v-for="(member, index) in store.clubLeaderboard" 
          :key="member.id"
          class="rank-item"
          :class="'rank-' + (index + 1)"
        >
          <view class="rank-badge">
            <text v-if="index < 3">🥇🥈🥉"[index]" : "{{ index + 1 }}"</text>
          </view>
          <view class="rank-info">
            <text class="rank-name">{{ member.babyName }}</text>
            <view class="rank-stats">
              <text class="rank-stat">阅读{{ member.readingDays }}天</text>
              <text class="rank-stat">读完{{ member.booksRead }}本</text>
            </view>
          </view>
        </view>
      </view>
      
      <view class="empty-state" v-else>
        <text class="empty-icon">🏆</text>
        <text class="empty-text">暂无排行数据</text>
      </view>
    </view>

    <!-- 添加藏书弹窗 -->
    <view class="modal" v-if="showBookModal" @tap.stop="closeBookModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加藏书</text>
          <view class="close-btn" @tap="closeBookModal">×</view>
        </view>
        
        <view class="form-section">
          <text class="form-label">书名 *</text>
          <input class="form-input" v-model="newBook.title" placeholder="书名" />
        </view>
        
        <view class="form-section">
          <text class="form-label">作者</text>
          <input class="form-input" v-model="newBook.author" placeholder="作者" />
        </view>
        
        <view class="form-section">
          <text class="form-label">简介</text>
          <textarea class="form-textarea" v-model="newBook.description" placeholder="书籍简介" />
        </view>
        
        <view class="modal-footer">
          <button class="cancel-btn" @tap="closeBookModal">取消</button>
          <button class="confirm-btn" @tap="addBook">添加</button>
        </view>
      </view>
    </view>

    <!-- 创建讨论弹窗 -->
    <view class="modal" v-if="showDiscussionModal" @tap.stop="closeDiscussionModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">发起讨论</text>
          <view class="close-btn" @tap="closeDiscussionModal">×</view>
        </view>
        
        <view class="form-section">
          <text class="form-label">话题标题 *</text>
          <input class="form-input" v-model="newDiscussion.title" placeholder="讨论的话题" />
        </view>
        
        <view class="form-section">
          <text class="form-label">内容 *</text>
          <textarea class="form-textarea large" v-model="newDiscussion.content" placeholder="详细描述..." />
        </view>
        
        <view class="modal-footer">
          <button class="cancel-btn" @tap="closeDiscussionModal">取消</button>
          <button class="confirm-btn" @tap="createDiscussion">发布</button>
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
      clubId: '',
      club: null,
      isMember: false,
      activeTab: 'books',
      showBookModal: false,
      showDiscussionModal: false,
      newBook: {
        title: '',
        author: '',
        description: ''
      },
      newDiscussion: {
        title: '',
        content: ''
      }
    }
  },
  
  computed: {
    store() {
      return useReadingClubStore()
    }
  },
  
  onLoad(options) {
    if (options.clubId) {
      this.clubId = options.clubId
      this.loadClubDetail()
    }
  },
  
  methods: {
    loadClubDetail() {
      this.club = this.store.loadClubDetail(this.clubId)
      this.isMember = this.store.clubMembers.some(m => m.babyId === this.store.currentBabyId)
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    switchTab(tab) {
      this.activeTab = tab
    },
    
    joinClub() {
      const result = this.store.joinNewClub(this.clubId)
      if (result) {
        this.isMember = true
        uni.showToast({ title: '加入成功', icon: 'success' })
      }
    },
    
    leaveClub() {
      uni.showModal({
        title: '提示',
        content: '确定要退出这个俱乐部吗？',
        success: (res) => {
          if (res.confirm) {
            const result = this.store.leaveCurrentClub(this.clubId)
            if (result) {
              this.isMember = false
              uni.showToast({ title: '已退出', icon: 'success' })
            }
          }
        }
      })
    },
    
    showAddBook() {
      this.newBook = { title: '', author: '', description: '' }
      this.showBookModal = true
    },
    
    closeBookModal() {
      this.showBookModal = false
    },
    
    addBook() {
      if (!this.newBook.title) {
        uni.showToast({ title: '请输入书名', icon: 'none' })
        return
      }
      
      const book = this.store.addClubBook(this.clubId, {
        ...this.newBook,
        addedBy: this.store.currentBaby?.name || '我'
      })
      
      if (book) {
        uni.showToast({ title: '添加成功', icon: 'success' })
        this.closeBookModal()
      }
    },
    
    showCreateDiscussion() {
      this.newDiscussion = { title: '', content: '' }
      this.showDiscussionModal = true
    },
    
    closeDiscussionModal() {
      this.showDiscussionModal = false
    },
    
    createDiscussion() {
      if (!this.newDiscussion.title || !this.newDiscussion.content) {
        uni.showToast({ title: '请填写完整', icon: 'none' })
        return
      }
      
      const discussion = this.store.createNewDiscussion(this.clubId, this.newDiscussion)
      if (discussion) {
        uni.showToast({ title: '发布成功', icon: 'success' })
        this.closeDiscussionModal()
      }
    },
    
    viewDiscussion(discussion) {
      uni.navigateTo({
        url: `/pages/reading-club/discussion-detail?discussionId=${discussion.id}&clubId=${this.clubId}`
      })
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
.club-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

.header {
  position: relative;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-content {
  position: relative;
  padding: 40px 20px 20px;
  color: white;
}

.back-btn {
  font-size: 32px;
  margin-bottom: 20px;
}

.club-info {
  text-align: center;
}

.club-avatar {
  width: 80px;
  height: 80px;
  background: rgba(255,255,255,0.2);
  border-radius: 16px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.club-icon {
  font-size: 40px;
}

.club-name {
  font-size: 20px;
  font-weight: bold;
  display: block;
  margin-bottom: 6px;
}

.club-desc {
  font-size: 13px;
  opacity: 0.9;
  display: block;
  margin-bottom: 12px;
}

.club-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 15px;
}

.tag {
  background: rgba(255,255,255,0.2);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
}

.club-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  display: block;
}

.stat-label {
  font-size: 11px;
  opacity: 0.8;
}

.action-bar {
  padding: 0 20px;
  margin-top: -10px;
}

.join-btn, .leave-btn {
  background: white;
  border-radius: 25px;
  padding: 12px;
  text-align: center;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.join-btn {
  color: #667eea;
}

.leave-btn {
  color: #999;
}

.tab-bar {
  display: flex;
  background: white;
  margin: 15px;
  border-radius: 12px;
  padding: 4px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 13px;
  color: #666;
  border-radius: 8px;
}

.tab.active {
  background: #667eea;
  color: white;
}

.content {
  padding: 0 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.add-btn {
  width: 28px;
  height: 28px;
  background: #667eea;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.book-list, .activity-list, .discussion-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.book-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.book-item:last-child {
  border-bottom: none;
}

.book-cover {
  width: 50px;
  height: 65px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.book-icon {
  font-size: 24px;
}

.book-info {
  flex: 1;
}

.book-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 2px;
}

.book-author {
  font-size: 12px;
  color: #666;
  display: block;
  margin-bottom: 2px;
}

.book-desc {
  font-size: 11px;
  color: #999;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-added-by {
  font-size: 10px;
  color: #999;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-badge {
  width: 45px;
  height: 45px;
  background: #f0f7ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 20px;
}

.activity-info {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.activity-desc {
  font-size: 12px;
  color: #666;
  display: block;
  margin-bottom: 4px;
}

.activity-meta {
  display: flex;
  gap: 10px;
}

.activity-date, .activity-participants {
  font-size: 10px;
  color: #999;
}

.activity-status {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 8px;
}

.activity-status.active {
  background: rgba(76,175,80,0.1);
  color: #4CAF50;
}

.activity-status.ended {
  background: rgba(0,0,0,0.05);
  color: #999;
}

.discussion-item {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.discussion-item:last-child {
  border-bottom: none;
}

.discussion-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.discussion-author {
  font-size: 13px;
  color: #333;
  font-weight: bold;
}

.discussion-time {
  font-size: 11px;
  color: #999;
}

.discussion-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 6px;
}

.discussion-content {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: block;
  margin-bottom: 10px;
}

.discussion-footer {
  display: flex;
  gap: 15px;
}

.discussion-stat {
  font-size: 12px;
  color: #999;
}

.leaderboard {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-item.rank-1 {
  background: rgba(255,215,0,0.1);
}

.rank-item.rank-2 {
  background: rgba(192,192,192,0.1);
}

.rank-item.rank-3 {
  background: rgba(205,127,50,0.1);
}

.rank-badge {
  width: 35px;
  font-size: 18px;
  text-align: center;
  margin-right: 12px;
}

.rank-info {
  flex: 1;
}

.rank-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.rank-stats {
  display: flex;
  gap: 10px;
}

.rank-stat {
  font-size: 11px;
  color: #666;
}

.empty-state {
  background: white;
  border-radius: 12px;
  text-align: center;
  padding: 50px 20px;
}

.empty-icon {
  font-size: 50px;
  display: block;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 12px;
  color: #999;
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
  background: white;
  border-radius: 16px;
  padding: 20px;
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
