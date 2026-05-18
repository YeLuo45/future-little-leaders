<template>
  <view class="emotion-journal-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <text class="page-title">情绪日记</text>
        <text class="page-subtitle">记录每天的情绪变化</text>
      </view>
      <view class="add-btn" @tap="showAddJournal">
        <text>+</text>
      </view>
    </view>

    <!-- 今日情绪概览 -->
    <view class="today-overview" v-if="todayJournal">
      <view class="overview-card">
        <view class="overview-header">
          <text class="today-label">今日情绪</text>
          <text class="today-date">{{ formatDate(todayJournal.createdAt) }}</text>
        </view>
        <view class="today-emotion">
          <text class="emotion-emoji">{{ store.getEmotionEmoji(todayJournal.emotion) }}</text>
          <view class="emotion-info">
            <text class="emotion-name">{{ getEmotionName(todayJournal.emotion) }}</text>
            <view class="intensity-stars">
              <view 
                v-for="i in 5" 
                :key="i"
                class="star"
                :class="{filled: i <= todayJournal.intensity}"
              ></view>
            </view>
          </view>
        </view>
        <text class="journal-title" v-if="todayJournal.title">{{ todayJournal.title }}</text>
      </view>
    </view>

    <!-- 无日记提示 -->
    <view class="empty-state" v-if="!store.hasJournals && !showForm">
      <view class="empty-icon">📝</view>
      <text class="empty-title">还没有情绪日记</text>
      <text class="empty-desc">记录下你的情绪，了解自己的心情变化</text>
      <button class="start-btn" @tap="showAddJournal">写日记</button>
    </view>

    <!-- 日记列表 -->
    <view class="journal-list" v-if="!showForm">
      <view class="list-header">
        <text class="list-title">历史记录</text>
        <text class="journal-count">{{ store.emotionJournals.length }}篇</text>
      </view>

      <view 
        v-for="journal in store.emotionJournals" 
        :key="journal.id"
        class="journal-card"
        @tap="viewJournal(journal)"
      >
        <view class="journal-card-header">
          <view class="emotion-badge" :style="{background: getEmotionColor(journal.emotion)}">
            <text>{{ store.getEmotionEmoji(journal.emotion) }}</text>
          </view>
          <view class="journal-meta">
            <text class="journal-emotion-name">{{ getEmotionName(journal.emotion) }}</text>
            <text class="journal-date">{{ formatDate(journal.createdAt) }}</text>
          </view>
          <view class="intensity-indicator">
            <view 
              v-for="i in 5" 
              :key="i"
              class="intensity-dot"
              :class="{filled: i <= journal.intensity}"
            ></view>
          </view>
        </view>
        <text class="journal-card-title" v-if="journal.title">{{ journal.title }}</text>
        <text class="journal-card-content" v-if="journal.content">{{ truncateContent(journal.content) }}</text>
      </view>
    </view>

    <!-- 添加日记表单 -->
    <view class="add-form" v-if="showForm">
      <view class="form-card">
        <view class="form-header">
          <text class="form-title">{{ isEditing ? '编辑日记' : '写日记' }}</text>
          <view class="close-btn" @tap="closeForm">
            <text>×</text>
          </view>
        </view>

        <!-- 选择情绪 -->
        <view class="form-section">
          <text class="section-label">今天感觉怎么样？</text>
          <view class="emotion-selector">
            <view 
              v-for="(emoji, type) in EMOTION_EMOJIS" 
              :key="type"
              class="emotion-item"
              :class="{selected: newJournal.emotion === type}"
              @tap="selectEmotion(type)"
            >
              <text class="emotion-emoji">{{ emoji }}</text>
            </view>
          </view>
        </view>

        <!-- 选择强度 -->
        <view class="form-section" v-if="newJournal.emotion">
          <text class="section-label">情绪强度</text>
          <view class="intensity-selector">
            <view 
              v-for="level in 5" 
              :key="level"
              class="intensity-btn"
              :class="{selected: newJournal.intensity === level}"
              @tap="newJournal.intensity = level"
            >
              <text>{{ level }}</text>
            </view>
          </view>
          <text class="intensity-hint">{{ getIntensityHint() }}</text>
        </view>

        <!-- 日记标题 -->
        <view class="form-section" v-if="newJournal.emotion">
          <text class="section-label">给日记起个标题（选填）</text>
          <input 
            class="form-input"
            v-model="newJournal.title"
            placeholder="例如：开心的一天"
            maxlength="30"
          />
        </view>

        <!-- 日记内容 -->
        <view class="form-section" v-if="newJournal.emotion">
          <text class="section-label">写下今天发生了什么</text>
          <textarea 
            class="form-textarea"
            v-model="newJournal.content"
            placeholder="今天发生了什么事情让你有这样的感受？"
            maxlength="500"
          ></textarea>
          <text class="char-count">{{ newJournal.content.length }} / 500</text>
        </view>

        <!-- 调节方法 -->
        <view class="form-section" v-if="newJournal.emotion && suggestions.length">
          <text class="section-label">情绪调节建议</text>
          <view class="suggestions-list">
            <view 
              v-for="(suggestion, idx) in suggestions" 
              :key="idx"
              class="suggestion-item"
            >
              <text class="suggestion-icon">💡</text>
              <text class="suggestion-text">{{ suggestion }}</text>
            </view>
          </view>
        </view>

        <!-- 提交按钮 -->
        <view class="form-actions">
          <button class="cancel-btn" @tap="closeForm">取消</button>
          <button class="submit-btn" @tap="submitJournal" :disabled="!canSubmit">
            保存日记
          </button>
        </view>
      </view>
    </view>

    <!-- 日记详情 -->
    <view class="journal-detail" v-if="showDetail && selectedJournal">
      <view class="detail-card">
        <view class="detail-header">
          <view class="detail-emotion">
            <text class="detail-emoji">{{ store.getEmotionEmoji(selectedJournal.emotion) }}</text>
            <view class="detail-emotion-info">
              <text class="detail-emotion-name">{{ getEmotionName(selectedJournal.emotion) }}</text>
              <view class="detail-intensity">
                <view 
                  v-for="i in 5" 
                  :key="i"
                  class="intensity-dot"
                  :class="{filled: i <= selectedJournal.intensity}"
                ></view>
              </view>
            </view>
          </view>
          <view class="detail-date">{{ formatDate(selectedJournal.createdAt) }}</view>
        </view>

        <text class="detail-title" v-if="selectedJournal.title">{{ selectedJournal.title }}</text>
        
        <view class="detail-content" v-if="selectedJournal.content">
          <text>{{ selectedJournal.content }}</text>
        </view>

        <!-- 调节建议 -->
        <view class="detail-suggestions" v-if="selectedJournal.emotion">
          <text class="suggestions-title">调节建议</text>
          <view class="suggestions-list">
            <view 
              v-for="(suggestion, idx) in getSuggestions(selectedJournal.emotion)" 
              :key="idx"
              class="suggestion-item"
            >
              <text class="suggestion-icon">💡</text>
              <text class="suggestion-text">{{ suggestion }}</text>
            </view>
          </view>
        </view>

        <view class="detail-actions">
          <button class="close-detail-btn" @tap="closeDetail">关闭</button>
        </view>
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="bottom-nav">
      <view class="nav-item" @tap="goToRecognition">
        <text class="nav-icon">🎭</text>
        <text class="nav-text">识别训练</text>
      </view>
      <view class="nav-item active">
        <text class="nav-icon">📝</text>
        <text class="nav-text">情绪日记</text>
      </view>
      <view class="nav-item" @tap="goToRelaxation">
        <text class="nav-icon">🧘</text>
        <text class="nav-text">放松练习</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useEmotionStore } from '@/stores/emotionStore.js'
import { EMOTION_TYPES, EMOTION_EMOJIS, EMOTION_COLORS } from '@/services/emotionTrainingService.js'

const store = useEmotionStore()

const showForm = ref(false)
const showDetail = ref(false)
const isEditing = ref(false)
const selectedJournal = ref(null)

const newJournal = reactive({
  emotion: '',
  intensity: 3,
  title: '',
  content: ''
})

const EMOTION_EMOJIS_MAP = EMOTION_EMOJIS

// 今日日记
const todayJournal = computed(() => {
  const today = new Date().toDateString()
  return store.emotionJournals.find(j => 
    new Date(j.createdAt).toDateString() === today
  )
})

// 情绪名称映射
const emotionNames = {
  [EMOTION_TYPES.HAPPY]: '开心',
  [EMOTION_TYPES.SAD]: '伤心',
  [EMOTION_TYPES.ANGRY]: '生气',
  [EMOTION_TYPES.SCARED]: '害怕',
  [EMOTION_TYPES.SURPRISED]: '惊讶',
  [EMOTION_TYPES.DISGUSTED]: '厌恶',
  [EMOTION_TYPES.ANXIOUS]: '焦虑',
  [EMOTION_TYPES.CALM]: '平静',
  [EMOTION_TYPES.GRATEFUL]: '感恩',
  [EMOTION_TYPES.PROUD]: '自豪'
}

// 强度提示
const intensityHints = {
  1: '一点点',
  2: '有点',
  3: '一般',
  4: '比较强烈',
  5: '非常强烈'
}

const suggestions = computed(() => {
  if (!newJournal.emotion) return []
  return store.getSuggestions(newJournal.emotion)
})

const canSubmit = computed(() => {
  return newJournal.emotion && newJournal.content.trim().length > 0
})

function getEmotionName(emotionType) {
  return emotionNames[emotionType] || emotionType
}

function getEmotionColor(emotionType) {
  return EMOTION_COLORS[emotionType] || '#999999'
}

function getIntensityHint() {
  return intensityHints[newJournal.intensity] || ''
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const today = now.toDateString()
  const yesterday = new Date(now.setDate(now.getDate() - 1)).toDateString()
  
  if (date.toDateString() === today) {
    return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (date.toDateString() === yesterday) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function truncateContent(content) {
  if (content.length <= 50) return content
  return content.substring(0, 50) + '...'
}

function showAddJournal() {
  isEditing.value = false
  newJournal.emotion = ''
  newJournal.intensity = 3
  newJournal.title = ''
  newJournal.content = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

function selectEmotion(emotionType) {
  newJournal.emotion = emotionType
}

function submitJournal() {
  if (!canSubmit.value) return
  
  const journal = store.addEmotionJournal({
    emotion: newJournal.emotion,
    intensity: newJournal.intensity,
    title: newJournal.title,
    content: newJournal.content
  })
  
  if (journal) {
    closeForm()
  }
}

function viewJournal(journal) {
  selectedJournal.value = journal
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
  selectedJournal.value = null
}

function getSuggestions(emotionType) {
  return store.getSuggestions(emotionType)
}

function goToRecognition() {
  uni.navigateTo({ url: '/pages/emotion-training/emotion-recognition' })
}

function goToRelaxation() {
  uni.navigateTo({ url: '/pages/emotion-training/relaxation' })
}
</script>

<style scoped>
.emotion-journal-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 60rpx 40rpx 80rpx;
  color: #fff;
  position: relative;
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 40rpx;
  font-weight: 600;
  display: block;
}

.page-subtitle {
  font-size: 28rpx;
  opacity: 0.9;
  margin-top: 10rpx;
  display: block;
}

.add-btn {
  position: absolute;
  right: 40rpx;
  top: 60rpx;
  width: 70rpx;
  height: 70rpx;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  text-align: center;
  line-height: 70rpx;
  font-size: 50rpx;
}

/* 今日概览 */
.today-overview {
  padding: 30rpx;
  margin-top: -40rpx;
}

.overview-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 35rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25rpx;
}

.today-label {
  font-size: 28rpx;
  color: #666;
}

.today-date {
  font-size: 24rpx;
  color: #999;
}

.today-emotion {
  display: flex;
  align-items: center;
  gap: 25rpx;
}

.today-emotion .emotion-emoji {
  font-size: 80rpx;
}

.emotion-info {
  flex: 1;
}

.emotion-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.intensity-stars {
  display: flex;
  gap: 8rpx;
  margin-top: 10rpx;
}

.star {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #e8e8e8;
}

.star.filled {
  background: #ffc107;
}

.journal-title {
  font-size: 28rpx;
  color: #666;
  margin-top: 20rpx;
  display: block;
}

/* 空状态 */
.empty-state {
  padding: 100rpx 60rpx;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.empty-desc {
  font-size: 28rpx;
  color: #666;
  margin-top: 15rpx;
  display: block;
}

.start-btn {
  margin-top: 50rpx;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  font-size: 32rpx;
  padding: 25rpx 80rpx;
  border-radius: 50rpx;
  border: none;
}

/* 日记列表 */
.journal-list {
  padding: 30rpx;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25rpx;
}

.list-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.journal-count {
  font-size: 26rpx;
  color: #999;
}

.journal-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}

.journal-card-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.emotion-badge {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emotion-badge text {
  font-size: 50rpx;
}

.journal-meta {
  flex: 1;
}

.journal-emotion-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.journal-date {
  font-size: 24rpx;
  color: #999;
  margin-top: 5rpx;
  display: block;
}

.intensity-indicator {
  display: flex;
  gap: 6rpx;
}

.intensity-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #e8e8e8;
}

.intensity-dot.filled {
  background: #ffc107;
}

.journal-card-title {
  font-size: 28rpx;
  color: #333;
  margin-top: 20rpx;
  display: block;
  font-weight: 500;
}

.journal-card-content {
  font-size: 26rpx;
  color: #666;
  margin-top: 10rpx;
  display: block;
  line-height: 1.5;
}

/* 添加表单 */
.add-form {
  padding: 30rpx;
}

.form-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.form-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  background: #f5f5f5;
  border-radius: 50%;
  text-align: center;
  line-height: 60rpx;
  font-size: 40rpx;
  color: #999;
}

.form-section {
  margin-bottom: 40rpx;
}

.section-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 20rpx;
}

.emotion-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.emotion-item {
  width: 100rpx;
  height: 100rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.emotion-item.selected {
  background: #fff0f5;
  border-color: #f5576c;
}

.emotion-item .emotion-emoji {
  font-size: 55rpx;
}

.intensity-selector {
  display: flex;
  gap: 20rpx;
}

.intensity-btn {
  flex: 1;
  height: 80rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  text-align: center;
  line-height: 80rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #666;
  border: 2rpx solid transparent;
}

.intensity-btn.selected {
  background: #fff0f5;
  border-color: #f5576c;
  color: #f5576c;
}

.intensity-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 15rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 90rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 30rpx;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  height: 250rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 30rpx;
  font-size: 30rpx;
  box-sizing: border-box;
}

.char-count {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  margin-top: 10rpx;
  display: block;
}

.suggestions-list {
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 15rpx;
  margin-bottom: 15rpx;
}

.suggestion-item:last-child {
  margin-bottom: 0;
}

.suggestion-icon {
  font-size: 28rpx;
}

.suggestion-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.cancel-btn {
  flex: 1;
  height: 90rpx;
  background: #f5f5f5;
  color: #666;
  font-size: 30rpx;
  border-radius: 50rpx;
  border: none;
}

.submit-btn {
  flex: 2;
  height: 90rpx;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  font-size: 30rpx;
  border-radius: 50rpx;
  border: none;
}

.submit-btn[disabled] {
  background: #ccc;
}

/* 日记详情 */
.journal-detail {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}

.detail-card {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 40rpx;
  max-height: 85vh;
  overflow-y: auto;
  width: 100%;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30rpx;
}

.detail-emotion {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.detail-emoji {
  font-size: 80rpx;
}

.detail-emotion-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.detail-intensity {
  display: flex;
  gap: 8rpx;
  margin-top: 10rpx;
}

.detail-date {
  font-size: 26rpx;
  color: #999;
}

.detail-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.detail-content {
  padding: 25rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.detail-content text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.detail-suggestions {
  margin-top: 30rpx;
}

.suggestions-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.detail-actions {
  margin-top: 40rpx;
}

.close-detail-btn {
  width: 100%;
  height: 90rpx;
  background: #f5f5f5;
  color: #666;
  font-size: 30rpx;
  border-radius: 50rpx;
  border: none;
}

/* 底部导航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  justify-content: space-around;
  padding: 20rpx 0;
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
}

.nav-item {
  text-align: center;
  padding: 10rpx 30rpx;
}

.nav-item.active .nav-icon,
.nav-item.active .nav-text {
  color: #f5576c;
}

.nav-icon {
  font-size: 44rpx;
  display: block;
}

.nav-text {
  font-size: 22rpx;
  color: #999;
  margin-top: 5rpx;
  display: block;
}
</style>
