<template>
  <view class="edit-review-page">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <text>‹</text>
      </view>
      <text class="header-title">编辑书评</text>
      <view class="save-btn" @tap="saveReview">
        <text>保存</text>
      </view>
    </view>

    <!-- 表单 -->
    <view class="form">
      <!-- 书评标题 -->
      <view class="form-section">
        <text class="form-label">标题 *</text>
        <input 
          class="form-input" 
          v-model="reviewData.title" 
          placeholder="给你的书评起个标题"
        />
      </view>

      <!-- 书评内容 -->
      <view class="form-section">
        <text class="form-label">书评内容 *</text>
        <textarea 
          class="form-textarea" 
          v-model="reviewData.content" 
          placeholder="写下你对这本书的感受、推荐理由..."
        />
      </view>

      <!-- 评分 -->
      <view class="form-section">
        <text class="form-label">评分</text>
        <view class="rating-selector">
          <view 
            v-for="i in 5" 
            :key="i"
            class="star"
            :class="{filled: i <= reviewData.rating}"
            @tap="reviewData.rating = i"
          >
            <text>⭐</text>
          </view>
        </view>
      </view>

      <!-- 阅读方式 -->
      <view class="form-section">
        <text class="form-label">阅读方式</text>
        <view class="style-selector">
          <view 
            class="style-chip"
            :class="{selected: reviewData.readingStyle === 'independent'}"
            @tap="reviewData.readingStyle = 'independent'"
          >
            <text>📖</text> 独立阅读
          </view>
          <view 
            class="style-chip"
            :class="{selected: reviewData.readingStyle === 'parent_child'}"
            @tap="reviewData.readingStyle = 'parent_child'"
          >
            <text>👨‍👩‍👧</text> 亲子共读
          </view>
          <view 
            class="style-chip"
            :class="{selected: reviewData.readingStyle === 'group'}"
            @tap="reviewData.readingStyle = 'group'"
          >
            <text>👥</text> 小组共读
          </view>
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
      reviewData: {
        title: '',
        content: '',
        rating: 5,
        readingStyle: 'independent'
      }
    }
  },
  
  computed: {
    store() {
      return useReadingClubStore()
    }
  },
  
  onLoad(options) {
    if (options.reviewId) {
      this.reviewId = options.reviewId
      this.loadReview()
    }
  },
  
  methods: {
    loadReview() {
      const review = this.store.loadReviewDetail(this.reviewId)
      if (review) {
        this.reviewData = {
          title: review.title,
          content: review.content,
          rating: review.rating,
          readingStyle: review.readingStyle
        }
      }
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    saveReview() {
      if (!this.reviewData.title) {
        uni.showToast({ title: '请输入标题', icon: 'none' })
        return
      }
      
      if (!this.reviewData.content) {
        uni.showToast({ title: '请输入书评内容', icon: 'none' })
        return
      }
      
      const result = this.store.editMyReview(this.reviewId, this.reviewData)
      if (result) {
        uni.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } else {
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.edit-review-page {
  min-height: 100vh;
  background: #f5f5f5;
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

.save-btn {
  background: #667eea;
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
}

.form {
  padding: 20px 15px;
}

.form-section {
  margin-bottom: 20px;
}

.form-label {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 10px;
}

.form-input {
  width: 100%;
  height: 44px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  background: white;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  height: 200px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  background: white;
  box-sizing: border-box;
}

.rating-selector {
  display: flex;
  gap: 10px;
}

.star {
  font-size: 32px;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}

.style-selector {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.style-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 15px;
  background: white;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  border: 1px solid #eee;
}

.style-chip.selected {
  background: #667eea;
  color: white;
  border-color: #667eea;
}
</style>
