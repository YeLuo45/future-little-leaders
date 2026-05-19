<template>
  <view class="poetry-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>诗歌创作</text>
      </view>
      <view class="header-right" @click="showTemplates">
        <text class="icon">📚</text>
      </view>
    </view>

    <!-- 诗歌类型选择 -->
    <view class="style-selector">
      <view
        v-for="style in styleOptions"
        :key="style.value"
        class="style-option"
        :class="{ active: poetryForm.style === style.value }"
        @click="selectStyle(style.value)"
      >
        <text class="style-emoji">{{ style.emoji }}</text>
        <text class="style-name">{{ style.label }}</text>
      </view>
    </view>

    <!-- 诗歌编辑区 -->
    <view class="poetry-editor">
      <input
        v-model="poetryForm.title"
        class="poetry-title-input"
        placeholder="诗歌标题（可选）"
      />
      
      <!-- 俳句格式提示 -->
      <view v-if="poetryForm.style === 'haiku'" class="haiku-hint">
        <text>俳句格式：5-7-5 共三行</text>
      </view>
      
      <textarea
        v-model="poetryForm.content"
        class="poetry-textarea"
        :placeholder="getPlaceholder()"
        @input="updateLineCount"
      />
      
      <!-- 行数和字数 -->
      <view class="poetry-stats">
        <text>{{ lineCount }} 行</text>
        <text>{{ poetryForm.content.length }} 字</text>
      </view>
      
      <!-- 诗歌预览 -->
      <view v-if="poetryForm.content" class="poetry-preview">
        <view class="preview-header">
          <text class="preview-title">{{ poetryForm.title || '无题' }}</text>
          <text class="preview-style">{{ getStyleLabel() }}</text>
        </view>
        <view class="preview-content">
          <view v-for="(line, index) in previewLines" :key="index" class="preview-line">
            <text>{{ line }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 主题和心情 -->
    <view class="meta-section">
      <view class="meta-item">
        <text class="meta-label">主题</text>
        <input
          v-model="poetryForm.theme"
          class="meta-input"
          placeholder="诗歌主题..."
        />
      </view>
      <view class="meta-item">
        <text class="meta-label">写作心情</text>
        <view class="mood-selector">
          <text
            v-for="m in moodOptions"
            :key="m.value"
            class="mood-option"
            :class="{ active: poetryForm.mood === m.value }"
            @click="poetryForm.mood = m.value"
          >{{ m.emoji }}</text>
        </view>
      </view>
    </view>

    <!-- 写作提示 -->
    <view v-if="currentPrompt" class="prompt-section" @click="refreshPrompt">
      <text class="prompt-icon">{{ currentPrompt.emoji }}</text>
      <view class="prompt-content">
        <text class="prompt-title">{{ currentPrompt.title }}</text>
        <text class="prompt-text">{{ currentPrompt.content }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-bar">
      <button class="btn-draft" @click="saveAsDraft">保存草稿</button>
      <button class="btn-save" @click="savePoem">完成</button>
    </view>

    <!-- 诗歌列表 -->
    <view class="poetry-list-section">
      <view class="section-header">
        <text class="section-title">我的诗歌</text>
      </view>
      <scroll-view class="poetry-list" scroll-x>
        <view
          v-for="poem in poems"
          :key="poem.id"
          class="poetry-item"
          @click="loadPoem(poem)"
        >
          <text class="poem-title">{{ poem.title || '无题' }}</text>
          <text class="poem-preview">{{ getPreview(poem.content) }}</text>
          <view class="poem-meta">
            <text class="poem-style">{{ getStyleEmoji(poem.style) }}</text>
            <text class="poem-date">{{ formatDate(poem.updatedAt) }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 模板弹窗 -->
    <view v-if="showTemplateModal" class="modal-overlay" @click="closeTemplates">
      <view class="template-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">诗歌模板</text>
          <text class="modal-close" @click="closeTemplates">×</text>
        </view>
        <view class="template-list">
          <view
            v-for="tpl in templates"
            :key="tpl.id"
            class="template-item"
            @click="applyTemplate(tpl)"
          >
            <text class="tpl-emoji">{{ tpl.emoji }}</text>
            <view class="tpl-info">
              <text class="tpl-name">{{ tpl.name }}</text>
              <text class="tpl-desc">{{ tpl.description }}</text>
            </view>
          </view>
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
      editingPoemId: null,
      showTemplateModal: false,
      poetryForm: {
        title: '',
        content: '',
        style: 'free',
        theme: '',
        mood: 'calm'
      },
      lineCount: 0,
      styleOptions: [
        { value: 'free', label: '自由诗', emoji: '✍️' },
        { value: 'rhymed', label: '押韵诗', emoji: '🎵' },
        { value: 'haiku', label: '俳句', emoji: '🍃' },
        { value: 'limerick', label: '五行诗', emoji: '🎭' }
      ],
      moodOptions: [
        { value: 'happy', emoji: '😊' },
        { value: 'excited', emoji: '🤩' },
        { value: 'calm', emoji: '😌' },
        { value: 'melancholy', emoji: '😢' },
        { value: 'grateful', emoji: '🙏' }
      ],
      templates: [],
      currentPrompt: null
    }
  },
  computed: {
    poems() {
      return this.writingStore.poems
    },
    previewLines() {
      if (!this.poetryForm.content) return []
      return this.poetryForm.content.split('\n').filter(l => l.trim())
    },
    writingStore() {
      return useWritingStore()
    }
  },
  onLoad() {
    this.writingStore.init()
    this.templates = this.writingStore.getPoetryTemplates()
    this.refreshPrompt()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    selectStyle(style) {
      this.poetryForm.style = style
    },
    getPlaceholder() {
      const placeholders = {
        free: '用词语描绘你的心情...\n让想象力自由飞翔',
        rhymed: '试着让句子末尾押韵\naabb 或 abab 格式都可以',
        haiku: '第一行 5 个音节\n第二行 7 个音节\n第三行 5 个音节',
        limerick: '五行诗：aabba 韵律\n适合讲述有趣的故事'
      }
      return placeholders[this.poetryForm.style] || '开始创作...'
    },
    getStyleLabel() {
      const style = this.styleOptions.find(s => s.value === this.poetryForm.style)
      return style ? style.label : ''
    },
    getStyleEmoji(style) {
      const s = this.styleOptions.find(item => item.value === style)
      return s ? s.emoji : '✍️'
    },
    updateLineCount() {
      this.lineCount = this.previewLines.length
    },
    refreshPrompt() {
      this.currentPrompt = this.writingStore.getRandomPrompt('poetry')
    },
    getPreview(content) {
      if (!content) return ''
      const firstLine = content.split('\n')[0]
      return firstLine.length > 20 ? firstLine.substring(0, 20) + '...' : firstLine
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}/${date.getDate()}`
    },
    showTemplates() {
      this.showTemplateModal = true
    },
    closeTemplates() {
      this.showTemplateModal = false
    },
    applyTemplate(tpl) {
      if (tpl.structure) {
        // 俳句等有固定格式的模板
        this.poetryForm.content = tpl.structure
      }
      this.closeTemplates()
    },
    loadPoem(poem) {
      this.editingPoemId = poem.id
      this.poetryForm = {
        title: poem.title || '',
        content: poem.content || '',
        style: poem.style || 'free',
        theme: poem.theme || '',
        mood: poem.mood || 'calm'
      }
      this.updateLineCount()
    },
    saveAsDraft() {
      this.poetryForm.isDraft = true
      this.savePoem()
    },
    savePoem() {
      if (!this.poetryForm.content.trim()) {
        uni.showToast({ title: '请输入诗歌内容', icon: 'none' })
        return
      }
      
      if (this.editingPoemId) {
        this.writingStore.updatePoem(this.editingPoemId, this.poetryForm)
        uni.showToast({ title: '诗歌已更新', icon: 'success' })
      } else {
        this.writingStore.createPoem(this.poetryForm)
        this.editingPoemId = null
        uni.showToast({ title: '诗歌已保存', icon: 'success' })
      }
    }
  }
}
</script>

<style scoped>
.poetry-page {
  min-height: 100vh;
  background-color: #f0f9ff;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  background: linear-gradient(135deg, #74b9ff 0%, #a29bfe 100%);
  color: white;
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

.style-selector {
  display: flex;
  padding: 16px;
  background-color: white;
  gap: 12px;
}

.style-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 12px;
  background-color: #f8f9fa;
}

.style-option.active {
  background: linear-gradient(135deg, #74b9ff 0%, #a29bfe 100%);
  color: white;
}

.style-emoji {
  font-size: 24px;
  margin-bottom: 4px;
}

.style-name {
  font-size: 12px;
}

.poetry-editor {
  padding: 16px;
  background-color: white;
  margin: 8px 0;
}

.poetry-title-input {
  width: 100%;
  height: 48px;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  border: none;
  margin-bottom: 12px;
}

.haiku-hint {
  background-color: #e8f4ff;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #0984e3;
}

.poetry-textarea {
  width: 100%;
  min-height: 180px;
  font-size: 16px;
  line-height: 2;
  color: #333;
  border: none;
  font-family: 'KaiTi', '楷体', serif;
}

.poetry-stats {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.poetry-preview {
  margin-top: 16px;
  padding: 16px;
  background-color: #fef9f3;
  border-radius: 12px;
  border: 1px solid #ffeaa7;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.preview-style {
  font-size: 12px;
  color: #999;
}

.preview-content {
  font-family: 'KaiTi', '楷体', serif;
  font-size: 18px;
  line-height: 2;
  color: #2d3436;
  text-align: center;
}

.preview-line {
  margin: 4px 0;
}

.meta-section {
  padding: 16px;
  background-color: white;
}

.meta-item {
  margin-bottom: 16px;
}

.meta-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.meta-input {
  width: 100%;
  height: 40px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
}

.mood-selector {
  display: flex;
  gap: 12px;
}

.mood-option {
  font-size: 24px;
  opacity: 0.5;
}

.mood-option.active {
  opacity: 1;
  transform: scale(1.2);
}

.prompt-section {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background-color: #f0f0ff;
  margin: 8px 16px;
  border-radius: 12px;
}

.prompt-icon {
  font-size: 24px;
  margin-right: 12px;
}

.prompt-content {
  flex: 1;
}

.prompt-title {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.prompt-text {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.action-bar {
  display: flex;
  gap: 12px;
  padding: 16px;
}

.btn-draft, .btn-save {
  flex: 1;
  height: 48px;
  border-radius: 24px;
  font-size: 16px;
  border: none;
}

.btn-draft {
  background-color: #dfe6e9;
  color: #636e72;
}

.btn-save {
  background: linear-gradient(135deg, #74b9ff 0%, #a29bfe 100%);
  color: white;
}

.poetry-list-section {
  padding: 16px;
}

.section-header {
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #666;
}

.poetry-list {
  display: flex;
  white-space: nowrap;
}

.poetry-item {
  width: 160px;
  padding: 16px;
  background-color: white;
  border-radius: 12px;
  margin-right: 12px;
}

.poem-title {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.poem-preview {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.poem-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.poem-style {
  font-size: 16px;
}

.poem-date {
  font-size: 10px;
  color: #ccc;
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

.template-modal {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  max-height: 60vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 24px;
  color: #999;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 12px;
}

.tpl-emoji {
  font-size: 32px;
  margin-right: 16px;
}

.tpl-info {
  flex: 1;
}

.tpl-name {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.tpl-desc {
  font-size: 12px;
  color: #999;
}
</style>
