<template>
  <view class="book-library-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <text class="page-title">📚 书籍库</text>
        <text class="page-subtitle">发现好书，培养阅读习惯</text>
      </view>
      <view class="add-btn" @tap="showAddBook">
        <text>+</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-scroll">
        <view 
          class="filter-chip" 
          :class="{active: filters.type === ''}"
          @tap="clearFilters"
        >
          全部
        </view>
        <view 
          v-for="(info, type) in READING_TYPES" 
          :key="type"
          class="filter-chip"
          :class="{active: filters.type === type}"
          @tap="setFilter('type', type)"
        >
          {{ info.name }}
        </view>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <input 
        class="search-input" 
        placeholder="搜索书名或作者..."
        v-model="searchKeyword"
        @confirm="doSearch"
      />
      <view class="search-btn" @tap="doSearch">
        <text>🔍</text>
      </view>
    </view>

    <!-- 推荐书籍 -->
    <view class="section" v-if="!searchKeyword && store.recommendedBooks.length > 0">
      <view class="section-header">
        <text class="section-title">⭐ 推荐阅读</text>
      </view>
      <scroll-view class="book-scroll" scroll-x>
        <view 
          v-for="book in store.recommendedBooks" 
          :key="book.id"
          class="book-card-small"
          @tap="viewBook(book)"
        >
          <view class="book-cover-placeholder">
            <text class="book-icon">📖</text>
          </view>
          <text class="book-title-small">{{ book.title }}</text>
          <text class="book-author-small">{{ book.author }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 书籍列表 -->
    <view class="book-list">
      <view class="list-header">
        <text class="list-title">全部书籍</text>
        <text class="book-count">{{ store.filteredBooks.length }}本</text>
      </view>

      <!-- 无书籍提示 -->
      <view class="empty-state" v-if="store.filteredBooks.length === 0">
        <text class="empty-icon">📚</text>
        <text class="empty-title">还没有书籍</text>
        <text class="empty-desc">添加第一本书，开启阅读之旅</text>
        <button class="start-btn" @tap="showAddBook">添加书籍</button>
      </view>

      <view 
        v-for="book in store.filteredBooks" 
        :key="book.id"
        class="book-item"
        @tap="viewBook(book)"
      >
        <view class="book-cover-placeholder large">
          <text class="book-icon">📖</text>
        </view>
        <view class="book-info">
          <text class="book-title">{{ book.title }}</text>
          <text class="book-author">{{ book.author }}</text>
          <view class="book-meta">
            <text class="book-type">{{ getTypeName(book.type) }}</text>
            <text class="book-difficulty" :class="'level-' + book.difficulty">
              {{ getDifficultyName(book.difficulty) }}
            </text>
            <text class="book-pages">{{ book.pages }}页</text>
          </view>
          <text class="book-desc" v-if="book.description">{{ book.description }}</text>
        </view>
        <view class="book-arrow">
          <text>›</text>
        </view>
      </view>
    </view>

    <!-- 添加书籍弹窗 -->
    <view class="modal" v-if="showAddModal" @tap.stop="closeModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加书籍</text>
          <view class="close-btn" @tap="closeModal">×</view>
        </view>
        
        <view class="form-section">
          <text class="form-label">书名 *</text>
          <input class="form-input" v-model="newBook.title" placeholder="请输入书名" />
        </view>
        
        <view class="form-section">
          <text class="form-label">作者 *</text>
          <input class="form-input" v-model="newBook.author" placeholder="请输入作者" />
        </view>
        
        <view class="form-section">
          <text class="form-label">书籍类型</text>
          <view class="type-selector">
            <view 
              v-for="(info, type) in READING_TYPES" 
              :key="type"
              class="type-chip"
              :class="{selected: newBook.type === type}"
              @tap="newBook.type = type"
            >
              {{ info.name }}
            </view>
          </view>
        </view>
        
        <view class="form-section">
          <text class="form-label">难度等级</text>
          <view class="difficulty-selector">
            <view 
              v-for="(name, level) in DIFFICULTY_LEVELS" 
              :key="level"
              class="difficulty-chip"
              :class="{selected: newBook.difficulty === level, ['level-' + level]: true}"
              @tap="newBook.difficulty = level"
            >
              {{ name }}
            </view>
          </view>
        </view>
        
        <view class="form-section">
          <text class="form-label">页数</text>
          <input class="form-input" type="number" v-model="newBook.pages" placeholder="请输入页数" />
        </view>
        
        <view class="form-section">
          <text class="form-label">简介</text>
          <textarea class="form-textarea" v-model="newBook.description" placeholder="请输入书籍简介" />
        </view>
        
        <view class="modal-footer">
          <button class="cancel-btn" @tap="closeModal">取消</button>
          <button class="confirm-btn" @tap="saveBook">保存</button>
        </view>
      </view>
    </view>

    <!-- 书籍详情弹窗 -->
    <view class="modal" v-if="showDetailModal" @tap.stop="closeDetail">
      <view class="modal-content large" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">书籍详情</text>
          <view class="close-btn" @tap="closeDetail">×</view>
        </view>
        
        <view class="detail-book" v-if="selectedBook">
          <view class="detail-cover">
            <text class="detail-icon">📖</text>
          </view>
          <view class="detail-info">
            <text class="detail-title">{{ selectedBook.title }}</text>
            <text class="detail-author">{{ selectedBook.author }}</text>
            <view class="detail-meta">
              <text class="meta-tag">{{ getTypeName(selectedBook.type) }}</text>
              <text class="meta-tag" :class="'level-' + selectedBook.difficulty">
                {{ getDifficultyName(selectedBook.difficulty) }}
              </text>
              <text class="meta-tag">{{ selectedBook.pages }}页</text>
            </view>
            <text class="detail-desc" v-if="selectedBook.description">
              {{ selectedBook.description }}
            </text>
          </view>
        </view>
        
        <view class="detail-actions">
          <view class="action-btn primary" @tap="startReading">
            <text>📖 开始阅读</text>
          </view>
          <view class="action-btn" @tap="startTest">
            <text>📝 阅读测试</text>
          </view>
        </view>
        
        <!-- 阅读笔记 -->
        <view class="notes-section">
          <view class="notes-header">
            <text class="notes-title">我的笔记</text>
            <view class="add-note-btn" @tap="showAddNote">
              <text>+ 添加</text>
            </view>
          </view>
          
          <view class="notes-list" v-if="bookNotes.length > 0">
            <view v-for="note in bookNotes" :key="note.id" class="note-item">
              <text class="note-date">{{ formatDate(note.createdAt) }}</text>
              <text class="note-content">{{ note.content }}</text>
            </view>
          </view>
          <view class="notes-empty" v-else>
            <text>还没有笔记，写下你的读后感吧</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加笔记弹窗 -->
    <view class="modal" v-if="showNoteModal" @tap.stop>
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加笔记</text>
          <view class="close-btn" @tap="closeNoteModal">×</view>
        </view>
        
        <view class="form-section">
          <text class="form-label">笔记内容</text>
          <textarea class="form-textarea large" v-model="newNote.content" placeholder="写下你的阅读感受..." />
        </view>
        
        <view class="modal-footer">
          <button class="cancel-btn" @tap="closeNoteModal">取消</button>
          <button class="confirm-btn" @tap="saveNote">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useReadingStore } from '@/stores/readingStore.js'
import { READING_TYPES, DIFFICULTY_LEVELS } from '@/services/readingService.js'

export default {
  data() {
    return {
      READING_TYPES,
      DIFFICULTY_LEVELS,
      searchKeyword: '',
      filters: {
        type: '',
        difficulty: '',
        ageGroup: '',
        keyword: ''
      },
      showAddModal: false,
      showDetailModal: false,
      showNoteModal: false,
      selectedBook: null,
      newBook: {
        title: '',
        author: '',
        type: 'picture_book',
        difficulty: 1,
        pages: 0,
        description: ''
      },
      newNote: {
        content: ''
      }
    }
  },
  
  computed: {
    store() {
      return useReadingStore()
    },
    
    bookNotes() {
      if (!this.selectedBook) return []
      return this.store.readingNotes.filter(n => n.bookId === this.selectedBook.id)
    }
  },
  
  onLoad() {
    this.store.loadBooks()
    this.store.loadReadingNotes()
  },
  
  methods: {
    setFilter(key, value) {
      this.filters.type = key === 'type' ? value : this.filters.type
      this.filters.difficulty = key === 'difficulty' ? value : this.filters.difficulty
      this.store.setFilters(this.filters)
    },
    
    clearFilters() {
      this.filters = {
        type: '',
        difficulty: '',
        ageGroup: '',
        keyword: ''
      }
      this.searchKeyword = ''
      this.store.clearFilters()
    },
    
    doSearch() {
      this.store.setFilters({ keyword: this.searchKeyword })
    },
    
    getTypeName(type) {
      return READING_TYPES[type]?.name || type
    },
    
    getDifficultyName(level) {
      const names = { 1: '简单', 2: '中等', 3: '困难' }
      return names[level] || '未知'
    },
    
    formatDate(dateStr) {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}/${date.getDate()}`
    },
    
    showAddBook() {
      this.newBook = {
        title: '',
        author: '',
        type: 'picture_book',
        difficulty: 1,
        pages: 0,
        description: ''
      }
      this.showAddModal = true
    },
    
    closeModal() {
      this.showAddModal = false
    },
    
    saveBook() {
      if (!this.newBook.title || !this.newBook.author) {
        uni.showToast({ title: '请填写书名和作者', icon: 'none' })
        return
      }
      
      const book = this.store.addNewBook(this.newBook)
      if (book) {
        uni.showToast({ title: '添加成功', icon: 'success' })
        this.closeModal()
      }
    },
    
    viewBook(book) {
      this.selectedBook = book
      this.store.loadBookDetail(book.id)
      this.showDetailModal = true
    },
    
    closeDetail() {
      this.showDetailModal = false
      this.selectedBook = null
    },
    
    startReading() {
      uni.navigateTo({
        url: `/pages/reading/reading-log?bookId=${this.selectedBook.id}`
      })
    },
    
    startTest() {
      uni.navigateTo({
        url: `/pages/reading/comprehension-test?bookId=${this.selectedBook.id}`
      })
    },
    
    showAddNote() {
      this.newNote.content = ''
      this.showNoteModal = true
    },
    
    closeNoteModal() {
      this.showNoteModal = false
    },
    
    saveNote() {
      if (!this.newNote.content) {
        uni.showToast({ title: '请输入笔记内容', icon: 'none' })
        return
      }
      
      this.store.addNote({
        bookId: this.selectedBook.id,
        bookTitle: this.selectedBook.title,
        content: this.newNote.content
      })
      
      uni.showToast({ title: '保存成功', icon: 'success' })
      this.closeNoteModal()
    }
  }
}
</script>

<style scoped>
.book-library-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px 30px;
  color: white;
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

.add-btn {
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

.filter-bar {
  background: white;
  padding: 15px 0;
  overflow-x: auto;
}

.filter-scroll {
  display: flex;
  gap: 10px;
  padding: 0 15px;
  white-space: nowrap;
}

.filter-chip {
  padding: 8px 16px;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
}

.filter-chip.active {
  background: #667eea;
  color: white;
}

.search-bar {
  display: flex;
  gap: 10px;
  padding: 15px;
  background: white;
}

.search-input {
  flex: 1;
  height: 40px;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 0 20px;
  font-size: 14px;
}

.search-btn {
  width: 40px;
  height: 40px;
  background: #667eea;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section {
  padding: 15px;
}

.section-header {
  margin-bottom: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.book-scroll {
  display: flex;
  gap: 15px;
  white-space: nowrap;
}

.book-card-small {
  width: 120px;
  flex-shrink: 0;
}

.book-cover-placeholder {
  width: 100px;
  height: 140px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.book-cover-placeholder.large {
  width: 80px;
  height: 110px;
}

.book-icon {
  font-size: 40px;
}

.book-title-small {
  font-size: 13px;
  font-weight: bold;
  color: #333;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author-small {
  font-size: 11px;
  color: #999;
}

.book-list {
  padding: 15px;
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

.book-count {
  font-size: 12px;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.empty-desc {
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}

.start-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 14px;
}

.book-item {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.book-info {
  flex: 1;
  margin-left: 15px;
}

.book-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.book-author {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.book-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.book-type, .book-difficulty, .book-pages {
  font-size: 11px;
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 10px;
  color: #666;
}

.book-difficulty.level-1 { background: #e8f5e9; color: #4caf50; }
.book-difficulty.level-2 { background: #fff3e0; color: #ff9800; }
.book-difficulty.level-3 { background: #ffebee; color: #f44336; }

.book-desc {
  font-size: 12px;
  color: #999;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-arrow {
  display: flex;
  align-items: center;
  font-size: 20px;
  color: #ccc;
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

.modal-content.large {
  max-height: 90vh;
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

.form-section {
  margin-bottom: 15px;
}

.form-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.form-input {
  width: 100%;
  height: 44px;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 0 15px;
  font-size: 14px;
}

.form-textarea {
  width: 100%;
  height: 120px;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 12px 15px;
  font-size: 14px;
}

.form-textarea.large {
  height: 200px;
}

.type-selector, .difficulty-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-chip, .difficulty-chip {
  padding: 8px 12px;
  background: #f0f0f0;
  border-radius: 15px;
  font-size: 13px;
  color: #666;
}

.type-chip.selected, .difficulty-chip.selected {
  background: #667eea;
  color: white;
}

.difficulty-chip.level-1.selected { background: #4caf50; }
.difficulty-chip.level-2.selected { background: #ff9800; }
.difficulty-chip.level-3.selected { background: #f44336; }

.modal-footer {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.confirm-btn {
  background: #667eea;
  color: white;
}

.detail-book {
  display: flex;
  margin-bottom: 20px;
}

.detail-cover {
  width: 120px;
  height: 160px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-icon {
  font-size: 50px;
}

.detail-info {
  flex: 1;
  margin-left: 15px;
}

.detail-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.detail-author {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.meta-tag {
  font-size: 12px;
  padding: 4px 10px;
  background: #f0f0f0;
  border-radius: 12px;
  color: #666;
}

.meta-tag.level-1 { background: #e8f5e9; color: #4caf50; }
.meta-tag.level-2 { background: #fff3e0; color: #ff9800; }
.meta-tag.level-3 { background: #ffebee; color: #f44336; }

.detail-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.detail-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.action-btn {
  flex: 1;
  height: 44px;
  background: #f0f0f0;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.notes-section {
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.notes-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.add-note-btn {
  font-size: 13px;
  color: #667eea;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.note-item {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
}

.note-date {
  font-size: 11px;
  color: #999;
  margin-bottom: 5px;
}

.note-content {
  font-size: 13px;
  color: #333;
  line-height: 1.5;
}

.notes-empty {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 13px;
}
</style>
