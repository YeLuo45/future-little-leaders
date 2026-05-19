<template>
  <view class="story-creator-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>故事创作</text>
      </view>
      <view class="header-right" @click="showMenu">
        <text class="icon">☰</text>
      </view>
    </view>

    <!-- 故事列表 -->
    <scroll-view class="story-list" scroll-y>
      <view v-if="stories.length === 0" class="empty-state">
        <text class="empty-icon">📖</text>
        <text class="empty-text">还没有故事</text>
        <text class="empty-hint">点击右下角开始创作你的第一个故事</text>
      </view>

      <view
        v-for="story in stories"
        :key="story.id"
        class="story-item"
        :class="{ draft: story.isDraft }"
        @click="openStory(story)"
      >
        <view class="story-header">
          <text class="story-title">{{ story.title || '无标题' }}</text>
          <view v-if="story.isDraft" class="draft-badge">草稿</view>
        </view>
        <text v-if="story.content" class="story-preview">{{ getPreview(story.content) }}</text>
        <view class="story-meta">
          <text class="meta-item">{{ story.genre || '冒险' }}</text>
          <text class="meta-item">{{ story.wordCount || 0 }}字</text>
          <text class="meta-date">{{ formatDate(story.updatedAt) }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 写作提示卡片 -->
    <view v-if="showPrompt" class="prompt-card" @click="refreshPrompt">
      <view class="prompt-header">
        <text class="prompt-emoji">{{ currentPrompt?.emoji || '💡' }}</text>
        <text class="prompt-title">{{ currentPrompt?.title || '写作提示' }}</text>
      </view>
      <text class="prompt-content">{{ currentPrompt?.content || '点击刷新提示' }}</text>
    </view>

    <!-- 新建故事按钮 -->
    <view class="fab" @click="createNewStory">
      <text class="fab-icon">✏️</text>
    </view>

    <!-- 故事编辑弹窗 -->
    <view v-if="showEditor" class="modal-overlay" @click="closeEditor">
      <view class="editor-modal" @click.stop>
        <view class="editor-header">
          <text class="editor-title">{{ isNewStory ? '新故事' : '编辑故事' }}</text>
          <text class="editor-close" @click="closeEditor">×</text>
        </view>

        <!-- 基本信息 -->
        <view class="form-section">
          <view class="form-item">
            <text class="form-label">故事标题</text>
            <input
              v-model="storyForm.title"
              class="form-input"
              placeholder="给故事起个名字"
            />
          </view>

          <view class="form-item">
            <text class="form-label">故事类型</text>
            <view class="genre-selector">
              <view
                v-for="genre in genreOptions"
                :key="genre.value"
                class="genre-option"
                :class="{ active: storyForm.genre === genre.value }"
                @click="storyForm.genre = genre.value"
              >
                <text>{{ genre.emoji }} {{ genre.label }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 角色设定 -->
        <view class="form-section">
          <view class="section-header" @click="showCharacters = !showCharacters">
            <text class="section-title">角色设定</text>
            <text class="section-toggle">{{ showCharacters ? '▼' : '▶' }}</text>
          </view>
          <view v-if="showCharacters" class="characters-content">
            <view
              v-for="(char, index) in storyForm.characters"
              :key="index"
              class="character-item"
            >
              <input
                v-model="char.name"
                class="char-input"
                placeholder="角色名"
              />
              <input
                v-model="char.description"
                class="char-input"
                placeholder="角色特点"
              />
              <text class="char-remove" @click="removeCharacter(index)">×</text>
            </view>
            <view class="add-character" @click="addCharacter">
              <text>+ 添加角色</text>
            </view>
          </view>
        </view>

        <!-- 情节背景 -->
        <view class="form-section">
          <view class="form-item">
            <text class="form-label">情节简介</text>
            <textarea
              v-model="storyForm.plot"
              class="form-textarea small"
              placeholder="故事要讲什么？"
            />
          </view>
          <view class="form-item">
            <text class="form-label">场景背景</text>
            <textarea
              v-model="storyForm.setting"
              class="form-textarea small"
              placeholder="故事发生在什么地方？什么时间？"
            />
          </view>
        </view>

        <!-- 故事内容 -->
        <view class="form-section">
          <view class="form-item">
            <text class="form-label">故事内容</text>
            <textarea
              v-model="storyForm.content"
              class="form-textarea large"
              placeholder="开始你的故事创作..."
            />
          </view>
          <view class="word-count">
            <text>{{ storyForm.content.length }} 字</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="editor-actions">
          <button class="btn-draft" @click="saveAsDraft">保存草稿</button>
          <button class="btn-publish" @click="publishStory">发布</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useWritingStore } from '@/stores/writingStore'

export default {
  data() {
    return {
      showEditor: false,
      showPrompt: true,
      isNewStory: true,
      editingStoryId: null,
      showCharacters: false,
      storyForm: {
        title: '',
        content: '',
        genre: 'adventure',
        characters: [],
        plot: '',
        setting: ''
      },
      genreOptions: [
        { value: 'adventure', label: '冒险', emoji: '⚔️' },
        { value: 'fantasy', label: '奇幻', emoji: '🔮' },
        { value: 'sci-fi', label: '科幻', emoji: '🚀' },
        { value: 'daily', label: '日常', emoji: '🏠' }
      ],
      currentPrompt: null
    }
  },
  computed: {
    stories() {
      return this.writingStore.stories
    },
    writingStore() {
      return useWritingStore()
    }
  },
  onLoad() {
    this.writingStore.init()
    this.refreshPrompt()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    showMenu() {
      uni.showActionSheet({
        itemList: ['查看已发布', '查看草稿', '写作提示设置'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.filterStories(false)
          } else if (res.tapIndex === 1) {
            this.filterStories(true)
          }
        }
      })
    },
    filterStories(isDraft) {
      // 筛选显示
    },
    getPreview(content) {
      if (!content) return ''
      return content.length > 50 ? content.substring(0, 50) + '...' : content
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}/${date.getDate()}`
    },
    refreshPrompt() {
      this.currentPrompt = this.writingStore.getRandomPrompt('story')
    },
    openStory(story) {
      this.isNewStory = false
      this.editingStoryId = story.id
      this.storyForm = {
        title: story.title || '',
        content: story.content || '',
        genre: story.genre || 'adventure',
        characters: story.characters ? [...story.characters] : [],
        plot: story.plot || '',
        setting: story.setting || ''
      }
      this.showEditor = true
    },
    createNewStory() {
      this.isNewStory = true
      this.editingStoryId = null
      this.storyForm = {
        title: '',
        content: '',
        genre: 'adventure',
        characters: [],
        plot: '',
        setting: ''
      }
      this.showEditor = true
    },
    closeEditor() {
      this.showEditor = false
    },
    addCharacter() {
      this.storyForm.characters.push({ name: '', description: '' })
    },
    removeCharacter(index) {
      this.storyForm.characters.splice(index, 1)
    },
    saveAsDraft() {
      this.storyForm.isDraft = true
      this.saveStory()
    },
    publishStory() {
      if (!this.storyForm.title.trim()) {
        uni.showToast({ title: '请输入故事标题', icon: 'none' })
        return
      }
      this.storyForm.isDraft = false
      this.saveStory()
    },
    saveStory() {
      if (this.isNewStory) {
        this.writingStore.createStory(this.storyForm)
        uni.showToast({ title: '故事已保存', icon: 'success' })
      } else {
        this.writingStore.updateStory(this.editingStoryId, this.storyForm)
        uni.showToast({ title: '故事已更新', icon: 'success' })
      }
      this.closeEditor()
    }
  }
}
</script>

<style scoped>
.story-creator-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  background-color: #6c5ce7;
  color: white;
}

.header-left, .header-right {
  width: 40px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.icon {
  font-size: 20px;
}

.story-list {
  height: calc(100vh - 180px);
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  color: #666;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #999;
}

.story-item {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.story-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.story-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.draft-badge {
  background-color: #ffeaa7;
  color: #d63031;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
}

.story-preview {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 8px;
}

.story-meta {
  display: flex;
  align-items: center;
}

.meta-item {
  font-size: 12px;
  color: #999;
  margin-right: 12px;
}

.meta-date {
  font-size: 12px;
  color: #bbb;
  margin-left: auto;
}

.prompt-card {
  position: fixed;
  bottom: 100px;
  left: 16px;
  right: 16px;
  background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
  border-radius: 12px;
  padding: 16px;
  color: white;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
}

.prompt-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.prompt-emoji {
  font-size: 24px;
  margin-right: 8px;
}

.prompt-title {
  font-size: 14px;
  font-weight: bold;
}

.prompt-content {
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.9;
}

.fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
}

.fab-icon {
  font-size: 28px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.editor-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  overflow-y: auto;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  background-color: #6c5ce7;
  color: white;
}

.editor-title {
  font-size: 18px;
  font-weight: bold;
}

.editor-close {
  font-size: 24px;
}

.form-section {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
}

.form-textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
}

.form-textarea.small {
  height: 80px;
}

.form-textarea.large {
  height: 200px;
}

.genre-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.genre-option {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
}

.genre-option.active {
  background-color: #6c5ce7;
  color: white;
  border-color: #6c5ce7;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.section-toggle {
  font-size: 12px;
  color: #999;
}

.characters-content {
  padding: 8px 0;
}

.character-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.char-input {
  flex: 1;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0 10px;
  font-size: 13px;
}

.char-remove {
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #ff6b6b;
  color: white;
  text-align: center;
  line-height: 24px;
  font-size: 14px;
}

.add-character {
  padding: 8px 16px;
  color: #6c5ce7;
  font-size: 14px;
}

.word-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.editor-actions {
  display: flex;
  gap: 12px;
  padding: 16px;
  position: sticky;
  bottom: 0;
  background-color: white;
}

.btn-draft, .btn-publish {
  flex: 1;
  height: 48px;
  border-radius: 24px;
  font-size: 16px;
  border: none;
}

.btn-draft {
  background-color: #f0f0f0;
  color: #666;
}

.btn-publish {
  background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
  color: white;
}
</style>
