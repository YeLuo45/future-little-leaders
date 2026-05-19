<template>
  <view class="journal-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>修炼日记</text>
      </view>
      <view class="header-right">
        <text class="icon" @click="saveEntry">✓</text>
      </view>
    </view>

    <!-- 日期选择 -->
    <view class="date-selector">
      <view class="date-nav" @click="prevDay">
        <text>◀</text>
      </view>
      <view class="date-display" @click="showDatePicker">
        <text>{{ formatDate(selectedDate) }}</text>
      </view>
      <view class="date-nav" @click="nextDay">
        <text>▶</text>
      </view>
    </view>

    <!-- 品格类型选择 -->
    <view class="character-selector">
      <view 
        v-for="type in characterTypes" 
        :key="type"
        :class="['character-item', { selected: selectedType === type }]"
        :style="selectedType === type ? { backgroundColor: getCharacterInfo(type).color + '30', borderColor: getCharacterInfo(type).color } : {}"
        @click="selectType(type)"
      >
        <text class="char-emoji">{{ getCharacterInfo(type).emoji }}</text>
        <text class="char-label">{{ getCharacterInfo(type).label }}</text>
      </view>
    </view>

    <!-- 日记表单 -->
    <view class="journal-form">
      <input 
        class="title-input" 
        v-model="formData.title" 
        placeholder="今天发生了什么..."
        placeholder-class="placeholder"
      />
      
      <textarea 
        class="content-input" 
        v-model="formData.content"
        placeholder="记录你的品格修炼心得..."
        placeholder-class="placeholder"
        maxlength="500"
      ></textarea>
      
      <view class="char-count">
        <text>{{ formData.content.length }}/500</text>
      </view>

      <!-- 标签选择 -->
      <view class="tags-section">
        <text class="tags-label">相关标签</text>
        <view class="tags-list">
          <view 
            v-for="tag in availableTags" 
            :key="tag"
            :class="['tag-item', { selected: formData.tags.includes(tag) }]"
            @click="toggleTag(tag)"
          >
            <text>{{ tag }}</text>
          </view>
        </view>
      </view>

      <!-- 心情选择 -->
      <view class="mood-section">
        <text class="mood-label">今天的心情</text>
        <view class="mood-list">
          <view 
            v-for="(emoji, key) in moodOptions" 
            :key="key"
            :class="['mood-item', { selected: formData.mood === key }]"
            @click="selectMood(key)"
          >
            <text class="mood-emoji">{{ emoji }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 历史日记 -->
    <view class="history-section" v-if="recentEntries.length > 0">
      <view class="section-header">
        <text class="section-title">最近日记</text>
      </view>
      <view class="history-list">
        <view 
          v-for="entry in recentEntries" 
          :key="entry.id"
          class="history-item"
          @click="loadEntry(entry)"
        >
          <view class="history-date">
            <text class="date-text">{{ formatShortDate(entry.date) }}</text>
          </view>
          <view class="history-info">
            <text class="history-type" :style="{ color: getCharacterInfo(entry.characterType)?.color }">
              {{ getCharacterInfo(entry.characterType)?.emoji }} {{ getCharacterInfo(entry.characterType)?.label }}
            </text>
            <text class="history-title">{{ entry.title }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCharacterQuestStore } from '@/stores/characterQuestStore.js'

const characterQuestStore = useCharacterQuestStore()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedType = ref(null)
const formData = ref({
  title: '',
  content: '',
  mood: 'neutral',
  tags: []
})

const moodOptions = {
  happy: '😊',
  excited: '🤩',
  calm: '😌',
  worried: '😟',
  sad: '😢',
  neutral: '😐'
}

const availableTags = ['诚实', '善良', '勇敢', '感恩', '助人', '分享', '努力', '坚持']

const characterTypes = computed(() => characterQuestStore.getAllCharacterTypes())
const getCharacterInfo = (type) => characterQuestStore.getCharacterInfo(type)

const recentEntries = computed(() => {
  return characterQuestStore.journalEntries.slice(0, 5)
})

const selectType = (type) => {
  selectedType.value = selectedType.value === type ? null : type
}

const selectMood = (mood) => {
  formData.value.mood = mood
}

const toggleTag = (tag) => {
  const tags = formData.value.tags
  const index = tags.indexOf(tag)
  if (index > -1) {
    tags.splice(index, 1)
  } else {
    tags.push(tag)
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

const formatShortDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const prevDay = () => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() - 1)
  selectedDate.value = date.toISOString().split('T')[0]
}

const nextDay = () => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + 1)
  selectedDate.value = date.toISOString().split('T')[0]
}

const showDatePicker = () => {
  uni.showDatePicker({
    currentDate: selectedDate.value,
    success: (res) => {
      selectedDate.value = res.dateStr
    }
  })
}

const saveEntry = () => {
  if (!formData.value.title && !formData.value.content) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }

  const entry = characterQuestStore.addJournalEntry({
    date: selectedDate.value,
    characterType: selectedType.value,
    title: formData.value.title || '品格修炼',
    content: formData.value.content,
    mood: formData.value.mood,
    tags: formData.value.tags
  })

  if (entry) {
    uni.showToast({ title: '保存成功', icon: 'success' })
    // 重置表单
    formData.value = {
      title: '',
      content: '',
      mood: 'neutral',
      tags: []
    }
    selectedType.value = null
  }
}

const loadEntry = (entry) => {
  selectedDate.value = entry.date
  selectedType.value = entry.characterType
  formData.value = {
    title: entry.title,
    content: entry.content,
    mood: entry.mood || 'neutral',
    tags: entry.tags || []
  }
}

const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  characterQuestStore.init()
  
  // 检查是否有传入日期
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage.options?.date) {
    selectedDate.value = currentPage.options.date
  }
})
</script>

<style scoped>
.journal-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding-bottom: 120rpx;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 40rpx 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-left, .header-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 36rpx;
  color: #ffffff;
}

.header-title {
  flex: 1;
  text-align: center;
}

.header-title text {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 40rpx;
  gap: 30rpx;
}

.date-nav {
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-nav text {
  font-size: 24rpx;
  color: #ffffff;
}

.date-display {
  background: rgba(255, 255, 255, 0.1);
  padding: 16rpx 40rpx;
  border-radius: 30rpx;
}

.date-display text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: bold;
}

.character-selector {
  display: flex;
  gap: 16rpx;
  padding: 0 40rpx 30rpx;
  overflow-x: auto;
}

.character-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  border-radius: 16rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  min-width: 120rpx;
}

.character-item.selected {
  background: rgba(255, 255, 255, 0.1);
}

.char-emoji {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.char-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.journal-form {
  margin: 0 40rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 30rpx;
}

.title-input {
  width: 100%;
  font-size: 30rpx;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.content-input {
  width: 100%;
  height: 200rpx;
  font-size: 28rpx;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 10rpx;
}

.char-count {
  text-align: right;
  margin-bottom: 30rpx;
}

.char-count text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.4);
}

.tags-section {
  margin-bottom: 30rpx;
}

.tags-label, .mood-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-bottom: 16rpx;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 12rpx 20rpx;
  border-radius: 20rpx;
}

.tag-item.selected {
  background: rgba(102, 126, 234, 0.5);
}

.tag-item text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.mood-section {
  margin-bottom: 20rpx;
}

.mood-list {
  display: flex;
  gap: 16rpx;
}

.mood-item {
  width: 70rpx;
  height: 70rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mood-item.selected {
  background: rgba(102, 126, 234, 0.5);
  border: 2rpx solid #667eea;
}

.mood-emoji {
  font-size: 36rpx;
}

.history-section {
  margin: 40rpx 40rpx 0;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
}

.history-list {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  overflow: hidden;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.history-item:last-child {
  border-bottom: none;
}

.history-date {
  width: 80rpx;
  text-align: center;
}

.date-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.history-info {
  flex: 1;
}

.history-type {
  font-size: 22rpx;
  display: block;
  margin-bottom: 4rpx;
}

.history-title {
  font-size: 26rpx;
  color: #ffffff;
}
</style>
