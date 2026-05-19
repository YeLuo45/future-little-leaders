<template>
  <view class="vocabulary-page">
    <!-- 头部 -->
    <view class="header-card">
      <view class="header-left">
        <text class="header-icon">📝</text>
        <view class="header-info">
          <text class="title">词汇记忆</text>
          <text class="subtitle">{{ currentLangInfo?.name || '' }} 词汇</text>
        </view>
      </view>
      <view class="header-right">
        <view class="stats-badge">
          <text class="stats-label">已学</text>
          <text class="stats-value">{{ learnedCount }}/{{ totalCount }}</text>
        </view>
      </view>
    </view>
    
    <!-- 语言选择器 -->
    <view class="language-selector">
      <scroll-view scroll-x class="language-scroll">
        <view class="language-tabs">
          <view
            class="language-tab"
            v-for="lang in supportedLanguages"
            :key="lang.id"
            :class="{ active: currentLanguage === lang.id }"
            @click="switchLanguage(lang.id)"
          >
            <text class="tab-flag">{{ lang.flag }}</text>
            <text class="tab-name">{{ lang.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 分类筛选 -->
    <view class="category-section">
      <view class="category-tabs">
        <view
          class="category-tab"
          :class="{ active: currentCategory === 'all' }"
          @click="selectCategory('all')"
        >
          全部
        </view>
        <view
          class="category-tab"
          v-for="cat in categories"
          :key="cat"
          :class="{ active: currentCategory === cat }"
          @click="selectCategory(cat)"
        >
          {{ getCategoryName(cat) }}
        </view>
      </view>
    </view>
    
    <!-- 词汇卡片列表 -->
    <view class="vocabulary-list">
      <view
        class="vocab-card"
        v-for="(word, index) in filteredVocabulary"
        :key="index"
        :class="{ learned: isWordLearned(word, index) }"
        @click="flipCard(index)"
      >
        <view class="card-inner" :class="{ flipped: flippedCards.includes(index) }">
          <!-- 卡片正面 -->
          <view class="card-front">
            <view class="card-category">
              <text class="category-tag">{{ getCategoryName(word.category) }}</text>
            </view>
            <text class="word-text">{{ word.word }}</text>
            <text class="word-hint">点击查看释义</text>
          </view>
          <!-- 卡片背面 -->
          <view class="card-back">
            <view class="card-category">
              <text class="category-tag">{{ getCategoryName(word.category) }}</text>
            </view>
            <text class="translation-text">{{ word.translation }}</text>
            <text class="pronunciation-text">{{ word.pronunciation }}</text>
            <view class="learn-btn" v-if="!isWordLearned(word, index)" @click.stop="markAsLearned(word, index)">
              <text>标记已学</text>
            </view>
            <view class="learned-badge" v-else>
              <text>✓ 已掌握</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 学习进度条 -->
    <view class="progress-bar-section">
      <view class="progress-info">
        <text class="progress-text">学习进度</text>
        <text class="progress-percent">{{ progressPercentage }}%</text>
      </view>
      <view class="progress-track">
        <view class="progress-fill" :style="{ width: progressPercentage + '%' }"></view>
      </view>
    </view>
    
    <!-- 底部统计 -->
    <view class="bottom-stats">
      <view class="stat-item">
        <text class="stat-icon">🔥</text>
        <text class="stat-value">{{ streakDays }}</text>
        <text class="stat-label">连续天数</text>
      </view>
      <view class="stat-item">
        <text class="stat-icon">⭐</text>
        <text class="stat-value">{{ totalPoints }}</text>
        <text class="stat-label">总积分</text>
      </view>
      <view class="stat-item">
        <text class="stat-icon">📚</text>
        <text class="stat-value">{{ learnedCount }}</text>
        <text class="stat-label">已学词汇</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLanguageStore } from '@/stores/languageStore.js'

const languageStore = useLanguageStore()

// 状态
const currentCategory = ref('all')
const flippedCards = ref([])

// 计算属性
const supportedLanguages = computed(() => languageStore.supportedLanguages)
const currentLanguage = computed(() => languageStore.currentLanguage)
const currentLangInfo = computed(() => languageStore.currentLanguageInfo)
const allVocabulary = computed(() => languageStore.currentVocabulary)
const categories = computed(() => languageStore.vocabularyCategories)
const totalPoints = computed(() => languageStore.totalPoints)
const streakDays = computed(() => languageStore.streakDays)

const filteredVocabulary = computed(() => {
  if (currentCategory.value === 'all') {
    return allVocabulary.value
  }
  return allVocabulary.value.filter(v => v.category === currentCategory.value)
})

const learnedCount = computed(() => {
  return languageStore.currentVocabularyProgress.learned || 0
})

const totalCount = computed(() => {
  return languageStore.currentVocabularyProgress.total || 0
})

const progressPercentage = computed(() => {
  return languageStore.currentVocabularyProgress.percentage || 0
})

// 切换语言
const switchLanguage = (langId) => {
  languageStore.selectLanguage(langId)
  currentCategory.value = 'all'
  flippedCards.value = []
}

// 选择分类
const selectCategory = (category) => {
  currentCategory.value = category
  flippedCards.value = []
}

// 获取分类名称
const getCategoryName = (category) => {
  const map = {
    greetings: '问候',
    numbers: '数字',
    colors: '颜色',
    family: '家庭',
    food: '食物',
    animals: '动物',
    body: '身体',
    time: '时间'
  }
  return map[category] || category
}

// 翻转卡片
const flipCard = (index) => {
  if (flippedCards.value.includes(index)) {
    flippedCards.value = flippedCards.value.filter(i => i !== index)
  } else {
    flippedCards.value.push(index)
  }
}

// 检查单词是否已学习
const isWordLearned = (word, index) => {
  const vocabList = allVocabulary.value
  const actualIndex = allVocabulary.value.indexOf(word)
  return languageStore.userStats?.languageStats?.[currentLanguage.value]?.vocabularyProgress?.learned > actualIndex
}

// 标记为已学习
const markAsLearned = (word, index) => {
  const vocabList = allVocabulary.value
  const actualIndex = allVocabulary.value.indexOf(word)
  languageStore.learnVocabulary(actualIndex)
  uni.showToast({ title: '已掌握 +5积分', icon: 'success' })
}

onMounted(() => {
  languageStore.init()
})
</script>

<style scoped>
.vocabulary-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 200rpx;
}

.header-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  color: #fff;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-icon {
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

.stats-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 24rpx;
  border-radius: 16rpx;
}

.stats-label {
  font-size: 22rpx;
  opacity: 0.9;
}

.stats-value {
  font-size: 32rpx;
  font-weight: bold;
}

.language-selector {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.language-scroll {
  width: 100%;
}

.language-tabs {
  display: flex;
  gap: 20rpx;
}

.language-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 30rpx;
  border-radius: 16rpx;
  background: #f5f5f5;
  transition: all 0.3s;
}

.language-tab.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.tab-flag {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.tab-name {
  font-size: 24rpx;
  font-weight: 500;
}

.category-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.category-tab {
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  background: #f5f5f5;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s;
}

.category-tab.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.vocabulary-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.vocab-card {
  perspective: 1000rpx;
  height: 280rpx;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card-inner.flipped {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20rpx;
  padding: 30rpx;
  box-sizing: border-box;
}

.card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.card-back {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.card-category {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
}

.category-tag {
  font-size: 22rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.word-text {
  font-size: 56rpx;
  font-weight: bold;
  text-align: center;
}

.word-hint {
  font-size: 24rpx;
  opacity: 0.8;
  margin-top: 16rpx;
}

.translation-text {
  font-size: 48rpx;
  font-weight: bold;
  text-align: center;
}

.pronunciation-text {
  font-size: 28rpx;
  opacity: 0.9;
  margin-top: 16rpx;
  text-align: center;
}

.learn-btn {
  margin-top: 20rpx;
  padding: 16rpx 40rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 30rpx;
  font-size: 26rpx;
}

.learned-badge {
  margin-top: 20rpx;
  padding: 16rpx 40rpx;
  background: rgba(76, 175, 80, 0.8);
  border-radius: 30rpx;
  font-size: 26rpx;
}

.vocab-card.learned .card-front {
  background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
}

.progress-bar-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.progress-text {
  font-size: 28rpx;
  color: #666;
}

.progress-percent {
  font-size: 28rpx;
  font-weight: bold;
  color: #f5576c;
}

.progress-track {
  height: 16rpx;
  background: #eee;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  border-radius: 8rpx;
  transition: width 0.3s;
}

.bottom-stats {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 40rpx;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}
</style>
