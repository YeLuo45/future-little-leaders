<template>
  <view class="language-page">
    <!-- 头部 -->
    <view class="header-card">
      <view class="header-left">
        <text class="lang-icon">🗣️</text>
        <view class="header-info">
          <text class="title">语言学习</text>
          <text class="subtitle">学习世界常用语言</text>
        </view>
      </view>
    </view>

    <!-- 语言列表 -->
    <view class="languages-section">
      <view class="section-title">选择语言开始学习</view>
      <view class="languages-grid">
        <view
          class="language-card"
          v-for="lang in languages"
          :key="lang.id"
          :class="{ active: selectedLanguage?.id === lang.id }"
          @click="selectLanguage(lang)"
        >
          <text class="lang-flag">{{ getLangFlag(lang.language) }}</text>
          <text class="lang-name">{{ lang.language }}</text>
          <view class="lang-progress">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: lang.progress + '%' }"></view>
            </view>
            <text class="progress-text">{{ lang.progress }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 学习内容 -->
    <view class="learning-section" v-if="selectedLanguage">
      <view class="section-header">
        <text class="section-title">{{ selectedLanguage.language }}基础</text>
        <button class="learn-btn" @click="learnBasics" v-if="selectedLanguage.progress < 100">
          学习
        </button>
        <text class="completed-tag" v-else>已掌握</text>
      </view>

      <view class="learning-card">
        <view class="learn-item">
          <text class="learn-label">问候语</text>
          <text class="learn-value">{{ selectedLanguage.greeting }}</text>
        </view>
        <view class="learn-item">
          <text class="learn-label">谢谢</text>
          <text class="learn-value">{{ selectedLanguage.thankYou }}</text>
        </view>
        <view class="learn-item">
          <text class="learn-label">再见</text>
          <text class="learn-value">{{ selectedLanguage.goodbye }}</text>
        </view>
      </view>

      <view class="numbers-section">
        <text class="subsection-title">数字 1-5</text>
        <view class="numbers-row">
          <view class="number-item" v-for="(num, idx) in selectedLanguage.numbers" :key="idx">
            <text class="number-en">{{ idx + 1 }}</text>
            <text class="number-lang">{{ num }}</text>
          </view>
        </view>
      </view>

      <view class="basics-section">
        <text class="subsection-title">基础词汇</text>
        <view class="basics-grid">
          <view
            class="basic-item"
            v-for="(basic, idx) in selectedLanguage.basics"
            :key="idx"
          >
            <text class="basic-text">{{ basic }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 语言对比 -->
    <view class="comparison-section">
      <view class="section-title">多语言对比</view>
      <view class="comparison-table">
        <view class="table-header">
          <text class="table-cell">词语</text>
          <text class="table-cell" v-for="lang in learningLanguages" :key="lang.id">
            {{ lang.language }}
          </text>
        </view>
        <view class="table-row">
          <text class="table-cell">你好</text>
          <text class="table-cell" v-for="lang in learningLanguages" :key="lang.id">
            {{ lang.greeting }}
          </text>
        </view>
        <view class="table-row">
          <text class="table-cell">谢谢</text>
          <text class="table-cell" v-for="lang in learningLanguages" :key="lang.id">
            {{ lang.thankYou }}
          </text>
        </view>
        <view class="table-row">
          <text class="table-cell">再见</text>
          <text class="table-cell" v-for="lang in learningLanguages" :key="lang.id">
            {{ lang.goodbye }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGeographyStore } from '@/stores/geographyStore.js'

const geographyStore = useGeographyStore()

const selectedLanguage = ref(null)

const languages = computed(() => geographyStore.languages)

const learningLanguages = computed(() => {
  return languages.value.filter(l => l.progress > 0)
})

const getLangFlag = (language) => {
  const map = {
    '英语': '🇬🇧',
    '中文': '🇨🇳',
    '日语': '🇯🇵',
    '西班牙语': '🇪🇸',
    '法语': '🇫🇷'
  }
  return map[language] || '🌍'
}

const selectLanguage = (lang) => {
  selectedLanguage.value = lang
}

const learnBasics = () => {
  if (selectedLanguage.value) {
    geographyStore.learnLanguageBasics(selectedLanguage.value.id)
    // Refresh selected language
    const updated = languages.value.find(l => l.id === selectedLanguage.value.id)
    if (updated) {
      selectedLanguage.value = updated
    }
    uni.showToast({ title: '学习成功+10积分', icon: 'success' })
  }
}

onMounted(() => {
  geographyStore.init()
  if (languages.value.length > 0) {
    selectedLanguage.value = languages.value[0]
  }
})
</script>

<style scoped>
.language-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header-card {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  color: #fff;
  margin-bottom: 20rpx;
}

.header-left {
  display: flex;
  align-items: center;
}

.lang-icon {
  font-size: 64rpx;
  margin-right: 20rpx;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
}

.subtitle {
  font-size: 26rpx;
  opacity: 0.9;
  margin-top: 4rpx;
}

.languages-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.languages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.language-card {
  padding: 24rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2rpx solid transparent;
}

.language-card.active {
  border-color: #fa709a;
  background: #fff0f5;
}

.lang-flag {
  font-size: 56rpx;
  margin-bottom: 8rpx;
}

.lang-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.lang-progress {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-bar {
  width: 100%;
  height: 8rpx;
  background: #e0e0e0;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.progress-text {
  font-size: 22rpx;
  color: #666;
  margin-top: 8rpx;
}

.learning-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.learn-btn {
  padding: 12rpx 32rpx;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
  border-radius: 24rpx;
  font-size: 26rpx;
  border: none;
}

.completed-tag {
  font-size: 26rpx;
  color: #4caf50;
  font-weight: bold;
}

.learning-card {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.learn-item {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #eee;
}

.learn-item:last-child {
  border-bottom: none;
}

.learn-label {
  font-size: 28rpx;
  color: #666;
}

.learn-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.numbers-section,
.basics-section {
  margin-bottom: 20rpx;
}

.subsection-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.numbers-row {
  display: flex;
  gap: 12rpx;
}

.number-item {
  flex: 1;
  background: #f0f0f0;
  border-radius: 8rpx;
  padding: 16rpx;
  text-align: center;
}

.number-en {
  font-size: 28rpx;
  color: #999;
  display: block;
}

.number-lang {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-top: 4rpx;
}

.basics-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.basic-item {
  padding: 12rpx 20rpx;
  background: #fce4ec;
  border-radius: 20rpx;
}

.basic-text {
  font-size: 26rpx;
  color: #333;
}

.comparison-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.comparison-table {
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  overflow: hidden;
}

.table-header,
.table-row {
  display: flex;
}

.table-cell {
  flex: 1;
  padding: 16rpx 8rpx;
  text-align: center;
  font-size: 24rpx;
  border-bottom: 1rpx solid #eee;
}

.table-cell:first-child {
  background: #f9f9f9;
  font-weight: bold;
  color: #333;
}

.table-header .table-cell {
  background: #f5f5f5;
  font-weight: bold;
}

.table-row:last-child .table-cell {
  border-bottom: none;
}
</style>
