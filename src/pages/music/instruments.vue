<template>
  <view class="instruments-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">🎻 乐器认知</text>
      <view class="header-actions">
        <view class="filter-btn" @click="showFilterModal = true">
          <text>🔍 筛选</text>
        </view>
      </view>
    </view>

    <!-- 乐器家族导航 -->
    <scroll-view class="family-nav" scroll-x>
      <view
        class="family-tab"
        :class="{ active: selectedFamily === '' }"
        @click="selectFamily('')"
      >
        <text>全部</text>
      </view>
      <view
        v-for="family in store.INSTRUMENT_FAMILIES"
        :key="family.id"
        class="family-tab"
        :class="{ active: selectedFamily === family.id }"
        @click="selectFamily(family.id)"
      >
        <text class="family-icon">{{ family.icon }}</text>
        <text class="family-name">{{ family.name }}</text>
      </view>
    </scroll-view>

    <!-- 乐器统计 -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-value">{{ displayedInstruments.length }}</text>
        <text class="stat-label">种乐器</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ familyCount }}</text>
        <text class="stat-label">个家族</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ learnedCount }}</text>
        <text class="stat-label">已学习</text>
      </view>
    </view>

    <!-- 乐器列表 -->
    <view class="instruments-list">
      <view
        v-for="instrument in displayedInstruments"
        :key="instrument.id"
        class="instrument-card"
        @click="viewInstrument(instrument)"
      >
        <view class="instrument-icon-wrap" :style="{ backgroundColor: getFamilyColor(instrument.family) + '20' }">
          <text class="instrument-icon">{{ instrument.icon }}</text>
        </view>
        <view class="instrument-info">
          <text class="instrument-name">{{ instrument.name }}</text>
          <text class="instrument-family">{{ getFamilyName(instrument.family) }}</text>
          <view class="instrument-tags">
            <text class="instrument-tag sound">音色: {{ instrument.sound }}</text>
          </view>
        </view>
        <view class="instrument-arrow">
          <text>›</text>
        </view>
      </view>
    </view>

    <!-- 乐器详情弹窗 -->
    <view v-if="showDetail" class="modal-overlay" @click="showDetail = false">
      <view class="modal-content instrument-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedInstrument?.name }}</text>
          <text class="modal-close" @click="showDetail = false">✕</text>
        </view>
        <view v-if="selectedInstrument" class="detail-body">
          <!-- 乐器图标 -->
          <view class="detail-icon-wrap" :style="{ backgroundColor: getFamilyColor(selectedInstrument.family) + '30' }">
            <text class="detail-icon">{{ selectedInstrument.icon }}</text>
          </view>

          <!-- 基本信息 -->
          <view class="info-section">
            <view class="info-row">
              <text class="info-label">乐器家族</text>
              <text class="info-value">{{ getFamilyName(selectedInstrument.family) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">音色特点</text>
              <text class="info-value">{{ selectedInstrument.sound }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">适合年龄</text>
              <text class="info-value">{{ selectedInstrument.ageRange }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">难度等级</text>
              <view class="difficulty-stars">
                <text v-for="i in 5" :key="i" class="star" :class="{ filled: i <= selectedInstrument.difficulty }">
                  ⭐
                </text>
              </view>
            </view>
          </view>

          <!-- 乐器描述 -->
          <view class="desc-section">
            <text class="section-title">乐器介绍</text>
            <text class="desc-text">{{ selectedInstrument.description }}</text>
          </view>

          <!-- 有趣知识 -->
          <view class="funfact-section">
            <text class="section-title">🎉 你知道吗？</text>
            <view class="funfact-card">
              <text class="funfact-text">{{ selectedInstrument.funFact }}</text>
            </view>
          </view>

          <!-- 乐器发声演示 -->
          <view class="sound-section">
            <text class="section-title">🎧 听一听</text>
            <view class="sound-demo" @click="playSound(selectedInstrument)">
              <text class="demo-icon">{{ isPlaying ? '⏸️' : '▶️' }}</text>
              <text class="demo-text">{{ isPlaying ? '停止' : '播放乐器声音' }}</text>
            </view>
            <text class="sound-tip">提示：实际项目中需要预置音频文件</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 筛选弹窗 -->
    <view v-if="showFilterModal" class="modal-overlay" @click="showFilterModal = false">
      <view class="modal-content filter-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">筛选乐器</text>
          <text class="modal-close" @click="showFilterModal = false">✕</text>
        </view>
        <view class="filter-body">
          <view class="filter-group">
            <text class="filter-label">乐器家族</text>
            <view class="filter-options">
              <view
                class="filter-option"
                :class="{ active: filterFamily === '' }"
                @click="setFilterFamily('')"
              >
                全部
              </view>
              <view
                v-for="family in store.INSTRUMENT_FAMILIES"
                :key="family.id"
                class="filter-option"
                :class="{ active: filterFamily === family.id }"
                @click="setFilterFamily(family.id)"
              >
                {{ family.icon }} {{ family.name }}
              </view>
            </view>
          </view>

          <view class="filter-group">
            <text class="filter-label">难度筛选</text>
            <view class="filter-options">
              <view
                class="filter-option"
                :class="{ active: filterDifficulty === 0 }"
                @click="setFilterDifficulty(0)"
              >
                全部
              </view>
              <view
                v-for="diff in [1, 2, 3, 4, 5]"
                :key="diff"
                class="filter-option"
                :class="{ active: filterDifficulty === diff }"
                @click="setFilterDifficulty(diff)"
              >
                {{ '⭐'.repeat(diff) }} ({{ getDifficultyName(diff) }})
              </view>
            </view>
          </view>
        </view>
        <view class="filter-footer">
          <button class="btn-reset" @click="resetFilter">重置</button>
          <button class="btn-apply" @click="applyFilter">应用</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMusicStore } from '@/stores/musicStore.js'

const store = useMusicStore()

// 状态
const selectedFamily = ref('')
const showDetail = ref(false)
const showFilterModal = ref(false)
const selectedInstrument = ref(null)
const isPlaying = ref(false)
const filterFamily = ref('')
const filterDifficulty = ref(0)

// 筛选后的乐器列表
const displayedInstruments = computed(() => {
  let list = store.instrumentsLibrary

  // 按家族筛选
  if (selectedFamily.value) {
    list = list.filter(inst => inst.family === selectedFamily.value)
  }

  // 按筛选弹窗条件
  if (filterFamily.value) {
    list = list.filter(inst => inst.family === filterFamily.value)
  }
  if (filterDifficulty.value > 0) {
    list = list.filter(inst => inst.difficulty === filterDifficulty.value)
  }

  return list
})

// 家族数量
const familyCount = computed(() => {
  return Object.keys(store.instrumentFamilies).length
})

// 已学习数量
const learnedCount = computed(() => {
  return 0 // 可以关联学习记录来计算
})

// 获取家族名称
const getFamilyName = (familyId) => {
  const family = Object.values(store.INSTRUMENT_FAMILIES).find(f => f.id === familyId)
  return family ? family.name : '未知'
}

// 获取家族颜色
const getFamilyColor = (familyId) => {
  const family = Object.values(store.INSTRUMENT_FAMILIES).find(f => f.id === familyId)
  return family ? family.color : '#999'
}

// 选择家族
const selectFamily = (family) => {
  selectedFamily.value = family
}

// 查看乐器详情
const viewInstrument = (instrument) => {
  selectedInstrument.value = instrument
  store.viewInstrument(instrument)
  showDetail.value = true
}

// 播放声音
const playSound = (instrument) => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    uni.showToast({
      title: `播放${instrument.name}声音`,
      icon: 'none'
    })
    // 实际项目中需要播放预置音频
    setTimeout(() => {
      isPlaying.value = false
    }, 3000)
  }
}

// 设置筛选 - 家族
const setFilterFamily = (family) => {
  filterFamily.value = family
}

// 设置筛选 - 难度
const setFilterDifficulty = (diff) => {
  filterDifficulty.value = diff
}

// 重置筛选
const resetFilter = () => {
  filterFamily.value = ''
  filterDifficulty.value = 0
}

// 应用筛选
const applyFilter = () => {
  selectedFamily.value = filterFamily.value
  showFilterModal.value = false
}

// 获取难度名称
const getDifficultyName = (diff) => {
  const names = { 1: '入门', 2: '简单', 3: '中等', 4: '困难', 5: '专业' }
  return names[diff] || '未知'
}

// 初始化
onMounted(() => {
  store.loadInstrumentsLibrary()
})
</script>

<style scoped>
.instruments-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 32rpx 24rpx;
  background-color: #fff;
}

.page-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 16rpx;
}

.filter-btn {
  padding: 12rpx 24rpx;
  background-color: #f5f5f5;
  border-radius: 24rpx;
  font-size: 26rpx;
}

/* 家族导航 */
.family-nav {
  display: flex;
  padding: 24rpx 32rpx;
  background-color: #fff;
  white-space: nowrap;
}

.family-tab {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 20rpx;
  margin-right: 12rpx;
  background-color: #f5f5f5;
  border-radius: 20rpx;
  min-width: 100rpx;
}

.family-tab.active {
  background: linear-gradient(135deg, #E74C3C, #C0392B);
}

.family-tab.active .family-name {
  color: #fff;
}

.family-icon {
  font-size: 28rpx;
  margin-bottom: 4rpx;
}

.family-name {
  font-size: 20rpx;
  color: #666;
}

/* 统计栏 */
.stats-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 24rpx 32rpx;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #E74C3C;
}

.stat-label {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background-color: #E0E0E0;
}

/* 乐器列表 */
.instruments-list {
  margin: 0 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.instrument-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
}

.instrument-icon-wrap {
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
}

.instrument-icon {
  font-size: 56rpx;
}

.instrument-info {
  flex: 1;
  margin-left: 20rpx;
}

.instrument-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.instrument-family {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.instrument-tags {
  display: flex;
  margin-top: 8rpx;
}

.instrument-tag {
  padding: 4rpx 12rpx;
  background-color: #f5f5f5;
  border-radius: 10rpx;
  font-size: 20rpx;
  color: #666;
}

.instrument-arrow {
  font-size: 40rpx;
  color: #ccc;
}

/* 详情弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 90%;
  max-height: 85vh;
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
}

.detail-body {
  padding: 32rpx;
  max-height: 70vh;
  overflow-y: auto;
}

.detail-icon-wrap {
  width: 160rpx;
  height: 160rpx;
  margin: 0 auto 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
}

.detail-icon {
  font-size: 96rpx;
}

/* 信息区域 */
.info-section {
  background-color: #f9f9f9;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 26rpx;
  color: #666;
}

.info-value {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.difficulty-stars {
  display: flex;
  gap: 4rpx;
}

.star {
  font-size: 24rpx;
  color: #E0E0E0;
}

.star.filled {
  color: #FFD700;
}

/* 描述区域 */
.desc-section {
  margin-bottom: 24rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.desc-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

/* 有趣知识 */
.funfact-section {
  margin-bottom: 24rpx;
}

.funfact-card {
  background: linear-gradient(135deg, #FFF9C4, #FFF59D);
  padding: 24rpx;
  border-radius: 16rpx;
}

.funfact-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

/* 声音演示 */
.sound-section {
  margin-bottom: 24rpx;
}

.sound-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  background-color: #E0F7FA;
  border-radius: 16rpx;
  gap: 16rpx;
}

.demo-icon {
  font-size: 48rpx;
}

.demo-text {
  font-size: 28rpx;
  color: #00897B;
  font-weight: 500;
}

.sound-tip {
  display: block;
  font-size: 22rpx;
  color: #999;
  text-align: center;
  margin-top: 12rpx;
}

/* 筛选弹窗 */
.filter-modal .modal-content {
  max-height: 70vh;
}

.filter-body {
  padding: 32rpx;
  max-height: 50vh;
  overflow-y: auto;
}

.filter-group {
  margin-bottom: 32rpx;
}

.filter-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.filter-option {
  padding: 12rpx 24rpx;
  background-color: #f5f5f5;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #666;
}

.filter-option.active {
  background: linear-gradient(135deg, #E74C3C, #C0392B);
  color: #fff;
}

.filter-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn-reset, .btn-apply {
  flex: 1;
  padding: 24rpx;
  border-radius: 48rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}

.btn-reset {
  background-color: #f5f5f5;
  color: #666;
}

.btn-apply {
  background: linear-gradient(135deg, #E74C3C, #C0392B);
  color: #fff;
}
</style>
