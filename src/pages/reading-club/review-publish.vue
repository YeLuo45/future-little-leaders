<template>
  <view class="publish-review-page">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <text>‹</text>
      </view>
      <text class="header-title">发布书评</text>
      <view class="publish-btn" @tap="publish">
        <text>发布</text>
      </view>
    </view>

    <!-- 表单 -->
    <view class="form">
      <!-- 选择书籍 -->
      <view class="form-section">
        <text class="form-label">书籍名称 *</text>
        <view class="book-selector" @tap="showBookPicker">
          <text v-if="reviewData.bookTitle">{{ reviewData.bookTitle }}</text>
          <text v-else class="placeholder">选择或输入书名</text>
          <text class="arrow">›</text>
        </view>
      </view>

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

    <!-- 书籍选择弹窗 -->
    <view class="modal" v-if="showBookModal" @tap.stop="closeBookModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">选择书籍</text>
          <view class="close-btn" @tap="closeBookModal">×</view>
        </view>
        
        <view class="book-input-section">
          <input 
            class="form-input" 
            v-model="customBookTitle" 
            placeholder="或直接输入书名"
          />
        </view>
        
        <view class="book-list-modal">
          <view 
            v-for="book in readingBooks" 
            :key="book.id"
            class="book-option"
            :class="{selected: selectedBookId === book.id}"
            @tap="selectBook(book)"
          >
            <view class="book-cover-small">
              <text>📖</text>
            </view>
            <view class="book-option-info">
              <text class="book-option-title">{{ book.title }}</text>
              <text class="book-option-author">{{ book.author }}</text>
            </view>
            <text class="check-mark" v-if="selectedBookId === book.id">✓</text>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="confirm-btn full" @tap="confirmBook">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useReadingClubStore } from '@/stores/readingClubStore.js'
import { useReadingStore } from '@/stores/readingStore.js'

export default {
  data() {
    return {
      reviewData: {
        bookId: '',
        bookTitle: '',
        title: '',
        content: '',
        rating: 5,
        readingStyle: 'independent'
      },
      showBookModal: false,
      selectedBookId: '',
      customBookTitle: ''
    }
  },
  
  computed: {
    store() {
      return useReadingClubStore()
    },
    
    readingStore() {
      return useReadingStore()
    },
    
    readingBooks() {
      return this.readingStore.books || []
    }
  },
  
  onLoad() {
    this.readingStore.loadBooks()
  },
  
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    showBookPicker() {
      this.showBookModal = true
    },
    
    closeBookModal() {
      this.showBookModal = false
    },
    
    selectBook(book) {
      this.selectedBookId = book.id
      this.customBookTitle = ''
    },
    
    confirmBook() {
      if (this.customBookTitle) {
        this.reviewData.bookTitle = this.customBookTitle
        this.reviewData.bookId = ''
      } else if (this.selectedBookId) {
        const book = this.readingBooks.find(b => b.id === this.selectedBookId)
        if (book) {
          this.reviewData.bookTitle = book.title
          this.reviewData.bookId = book.id
        }
      } else {
        uni.showToast({ title: '请选择或输入书名', icon: 'none' })
        return
      }
      this.closeBookModal()
    },
    
    publish() {
      if (!this.reviewData.bookTitle) {
        uni.showToast({ title: '请选择书籍', icon: 'none' })
        return
      }
      
      if (!this.reviewData.title) {
        uni.showToast({ title: '请输入标题', icon: 'none' })
        return
      }
      
      if (!this.reviewData.content) {
        uni.showToast({ title: '请输入书评内容', icon: 'none' })
        return
      }
      
      const result = this.store.publishReview(this.reviewData)
      if (result) {
        uni.showToast({ title: '发布成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } else {
        uni.showToast({ title: '发布失败', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.publish-review-page {
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

.publish-btn {
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

.book-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: white;
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

.modal-content {
  width: 100%;
  max-height: 80vh;
  background: white;
  border-radius: 16px 16px 0 0;
  padding: 20px;
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
  font-size: 24px;
  color: #999;
}

.book-input-section {
  margin-bottom: 15px;
}

.book-list-modal {
  max-height: 400px;
  overflow-y: auto;
}

.book-option {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 8px;
  background: #f9f9f9;
}

.book-option.selected {
  background: rgba(102,126,234,0.1);
}

.book-cover-small {
  width: 40px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
}

.book-option-info {
  flex: 1;
}

.book-option-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 2px;
}

.book-option-author {
  font-size: 12px;
  color: #666;
}

.check-mark {
  font-size: 18px;
  color: #667eea;
}

.modal-footer {
  margin-top: 15px;
}

.confirm-btn.full {
  width: 100%;
  height: 44px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 22px;
  font-size: 14px;
}
</style>
