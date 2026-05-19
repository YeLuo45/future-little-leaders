<template>
  <view class="review-detail-page">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <text>‹</text>
      </view>
      <text class="header-title">书评详情</text>
      <view class="more-btn" v-if="isOwner" @tap="showMoreActions">
        <text>···</text>
      </view>
    </view>

    <!-- 书评内容 -->
    <view class="review-content" v-if="review">
      <view class="review-header">
        <view class="reviewer-info">
          <text class="reviewer-avatar">👤</text>
          <view class="reviewer-detail">
            <text class="reviewer-name">{{ review.babyName }}</text>
            <text class="review-time">{{ formatTime(review.createdAt) }}</text>
          </view>
        </view>
        <view class="rating">
          <text v-for="i in 5" :key="i" :class="{filled: i <= review.rating}">⭐</text>
        </view>
      </view>
      
      <view class="review-book">
        <text>📖 {{ review.bookTitle }}</text>
      </view>
      
      <text class="review-title">{{ review.title }}</text>
      <text class="review-body">{{ review.content }}</text>
      
      <view class="review-tags" v-if="review.readingStyle">
        <text class="tag">
          {{ getReadingStyleName(review.readingStyle) }}
        </text>
      </view>
      
      <!-- 操作栏 -->
      <view class="action-bar">
        <view class="action-item" @tap="toggleLike">
          <text>{{ review.isLiked ? '❤️' : '🤍' }}</text>
          <text class="action-count">{{ review.likes || 0 }}</text>
        </view>
        <view class="action-item">
          <text>💬</text>
          <text class="action-count">{{ review.commentCount || 0 }}</text>
        </view>
      </view>
    </view>

    <!-- 评论区 -->
    <view class="comments-section">
      <view class="comments-header">
        <text class="comments-title">评论 ({{ reviewComments.length }})</text>
      </view>
      
      <view class="comments-list">
        <view 
          v-for="comment in reviewComments" 
          :key="comment.id"
          class="comment-item"
        >
          <text class="comment-avatar">👤</text>
          <view class="comment-body">
            <view class="comment-header">
              <text class="comment-name">{{ comment.babyName }}</text>
              <text class="comment-time">{{ formatTime(comment.createdAt) }}</text>
            </view>
            <text class="comment-content">{{ comment.content }}</text>
          </view>
        </view>
        
        <view class="empty-comments" v-if="reviewComments.length === 0">
          <text>还没有评论，快来抢沙发</text>
        </view>
      </view>
    </view>

    <!-- 底部评论输入 -->
    <view class="comment-input-bar">
      <input 
        class="comment-input" 
        v-model="newComment" 
        placeholder="写下你的评论..."
        @confirm="submitComment"
      />
      <view class="send-btn" @tap="submitComment">
        <text>发送</text>
      </view>
    </view>

    <!-- 操作菜单 -->
    <view class="modal" v-if="showActions" @tap="closeActions">
      <view class="action-sheet" @tap.stop>
        <view class="action-item" @tap="editReview">
          <text>📝</text>
          <text>编辑</text>
        </view>
        <view class="action-item danger" @tap="deleteReview">
          <text>🗑️</text>
          <text>删除</text>
        </view>
        <view class="action-item cancel" @tap="closeActions">
          <text>取消</text>
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
      reviewId: '',
      review: null,
      isOwner: false,
      showActions: false,
      newComment: ''
    }
  },
  
  computed: {
    store() {
      return useReadingClubStore()
    },
    
    reviewComments() {
      return this.store.reviewComments || []
    }
  },
  
  onLoad(options) {
    if (options.reviewId) {
      this.reviewId = options.reviewId
      this.loadReviewDetail()
    }
  },
  
  methods: {
    loadReviewDetail() {
      this.review = this.store.loadReviewDetail(this.reviewId)
      if (this.review) {
        this.isOwner = this.review.babyId === this.store.currentBabyId
      }
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    getReadingStyleName(style) {
      const names = {
        independent: '📖 独立阅读',
        parent_child: '👨‍👩‍👧 亲子共读',
        group: '👥 小组共读'
      }
      return names[style] || style
    },
    
    toggleLike() {
      if (!this.review) return
      
      if (this.review.isLiked) {
        this.store.unlikeMyReview(this.reviewId)
        this.review.likes = (this.review.likes || 0) - 1
        this.review.isLiked = false
      } else {
        this.store.likeMyReview(this.reviewId)
        this.review.likes = (this.review.likes || 0) + 1
        this.review.isLiked = true
      }
    },
    
    submitComment() {
      if (!this.newComment.trim()) {
        uni.showToast({ title: '请输入评论', icon: 'none' })
        return
      }
      
      const comment = this.store.commentOnReview(this.reviewId, this.newComment.trim())
      if (comment) {
        this.newComment = ''
        if (this.review) {
          this.review.commentCount = (this.review.commentCount || 0) + 1
        }
      }
    },
    
    showMoreActions() {
      this.showActions = true
    },
    
    closeActions() {
      this.showActions = false
    },
    
    editReview() {
      this.closeActions()
      uni.navigateTo({
        url: `/pages/reading-club/review-edit?reviewId=${this.reviewId}`
      })
    },
    
    deleteReview() {
      uni.showModal({
        title: '提示',
        content: '确定要删除这篇书评吗？',
        success: (res) => {
          if (res.confirm) {
            const success = this.store.removeReview(this.reviewId)
            if (success) {
              uni.showToast({ title: '已删除', icon: 'success' })
              setTimeout(() => {
                uni.navigateBack()
              }, 1500)
            }
          }
        }
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
.review-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.header {
  background: white;
  display: flex;
  align-items: center;
  padding: 40px 15px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.back-btn {
  font-size: 32px;
  color: #333;
  margin-right: 15px;
}

.header-title {
  flex: 1;
  font-size: 17px;
  font-weight: bold;
  color: #333;
}

.more-btn {
  font-size: 20px;
  color: #666;
  transform: rotate(90deg);
}

.review-content {
  background: white;
  padding: 20px 15px;
  margin-bottom: 10px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.reviewer-info {
  display: flex;
  gap: 10px;
}

.reviewer-avatar {
  font-size: 36px;
}

.reviewer-detail {
  display: flex;
  flex-direction: column;
}

.reviewer-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.review-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.rating text {
  font-size: 16px;
  opacity: 0.3;
}

.rating text.filled {
  opacity: 1;
}

.review-book {
  display: inline-block;
  background: rgba(102,126,234,0.1);
  color: #667eea;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 13px;
  margin-bottom: 12px;
}

.review-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12px;
}

.review-body {
  font-size: 15px;
  color: #333;
  line-height: 1.7;
  display: block;
  margin-bottom: 15px;
}

.review-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.tag {
  background: #f0f0f0;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
}

.action-bar {
  display: flex;
  gap: 30px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-count {
  font-size: 14px;
  color: #666;
}

.comments-section {
  background: white;
  padding: 15px;
}

.comments-header {
  margin-bottom: 15px;
}

.comments-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.comments-list {
  margin-bottom: 60px;
}

.comment-item {
  display: flex;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  font-size: 28px;
}

.comment-body {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.comment-name {
  font-size: 13px;
  font-weight: bold;
  color: #333;
}

.comment-time {
  font-size: 11px;
  color: #999;
}

.comment-content {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.empty-comments {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 14px;
}

.comment-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-top: 1px solid #f0f0f0;
}

.comment-input {
  flex: 1;
  height: 40px;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 0 15px;
  font-size: 14px;
}

.send-btn {
  background: #667eea;
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  margin-left: 10px;
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
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.action-sheet {
  width: 100%;
  background: white;
  border-radius: 16px 16px 0 0;
  padding: 10px 0 30px;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  font-size: 16px;
  color: #333;
}

.action-item.danger {
  color: #FF3B30;
}

.action-item.cancel {
  color: #999;
  border-top: 1px solid #f0f0f0;
  margin-top: 5px;
}
</style>
