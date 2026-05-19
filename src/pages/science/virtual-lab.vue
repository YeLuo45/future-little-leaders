<template>
  <view class="virtual-lab-page">
    <!-- 实验信息头部 -->
    <view class="lab-header" v-if="currentExperiment">
      <view class="exp-info">
        <text class="exp-category-tag" :style="{ backgroundColor: getCategoryColor }">
          {{ getCategoryIcon }} {{ getCategoryName }}
        </text>
        <text class="exp-title">{{ currentExperiment.title }}</text>
      </view>
      <view class="safety-warn" v-if="currentExperiment.safetyLevel === 'warning'">
        <text class="warn-icon">⚠️</text>
        <text class="warn-text">请在家长指导下进行</text>
      </view>
    </view>

    <!-- 实验材料 -->
    <view class="materials-section" v-if="currentExperiment">
      <view class="section-title">
        <text>📦 实验材料</text>
      </view>
      <view class="materials-list">
        <view 
          class="material-item" 
          v-for="(material, index) in currentExperiment.materials" 
          :key="index"
        >
          {{ material }}
        </view>
      </view>
    </view>

    <!-- 实验步骤 -->
    <view class="steps-section">
      <view class="section-title">
        <text>📝 实验步骤</text>
        <text class="step-indicator">步骤 {{ currentStep + 1 }}/{{ totalSteps }}</text>
      </view>
      
      <!-- 步骤进度条 -->
      <view class="step-progress">
        <view 
          class="progress-dot" 
          v-for="(step, index) in currentExperiment?.steps || []" 
          :key="index"
          :class="{ active: index <= currentStep, completed: index < currentStep }"
          @click="handleGoToStep(index)"
        >
          <text v-if="index < currentStep" class="check-icon">✓</text>
          <text v-else>{{ index + 1 }}</text>
        </view>
        <view class="progress-line">
          <view 
            class="line-fill" 
            :style="{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }"
          ></view>
        </view>
      </view>

      <!-- 当前步骤详情 -->
      <view class="step-content" v-if="currentStepDetail">
        <view class="step-number">步骤 {{ currentStepDetail.order }}</view>
        <view class="step-title">{{ currentStepDetail.title }}</view>
        <view class="step-desc">{{ currentStepDetail.description }}</view>
        
        <!-- 科学原理提示 -->
        <view class="principle-tip" v-if="currentStep === totalSteps - 1">
          <text class="tip-icon">💡</text>
          <view class="tip-content">
            <text class="tip-title">科学原理</text>
            <text class="tip-text">{{ currentExperiment.principle }}</text>
          </view>
        </view>
      </view>

      <!-- 步骤导航按钮 -->
      <view class="step-nav">
        <button 
          class="nav-btn prev-btn" 
          :disabled="currentStep === 0"
          @click="handlePrevStep"
        >
          上一步
        </button>
        <button 
          class="nav-btn next-btn" 
          v-if="currentStep < totalSteps - 1"
          @click="handleNextStep"
        >
          下一步
        </button>
        <button 
          class="nav-btn complete-btn" 
          v-else
          @click="handleCompleteExperiment"
        >
          完成实验
        </button>
      </view>
    </view>

    <!-- 观察记录区域 -->
    <view class="observation-section">
      <view class="section-title">
        <text>🔍 观察记录</text>
      </view>
      
      <view class="observation-input">
        <input 
          type="text" 
          v-model="observationText"
          placeholder="记录你的观察发现..."
          class="obs-input"
        />
        <button class="add-obs-btn" @click="handleAddObservation">添加</button>
      </view>
      
      <view class="observations-list" v-if="observations.length > 0">
        <view 
          class="obs-item" 
          v-for="(obs, index) in observations" 
          :key="index"
        >
          <text class="obs-step">步骤{{ obs.stepIndex + 1 }}:</text>
          <text class="obs-content">{{ obs.content }}</text>
          <text class="obs-time">{{ formatTime(obs.timestamp) }}</text>
        </view>
      </view>
      
      <view class="empty-obs" v-else>
        <text>暂无观察记录，开始记录你的发现吧！</text>
      </view>
    </view>

    <!-- 底部操作区 -->
    <view class="action-bar">
      <button class="exit-btn" @click="handleExitLab">退出实验</button>
      <button class="start-btn" @click="handleStartExperiment" v-if="!isVirtualLabActive">
        开始实验
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useScienceStore } from '@/stores/scienceStore.js'
import { SCIENCE_CATEGORIES } from '@/services/scienceService.js'

const scienceStore = useScienceStore()

const observationText = ref('')

// 当前实验
const currentExperiment = computed(() => scienceStore.currentExperiment)
const currentStep = computed(() => scienceStore.currentStep)
const currentStepDetail = computed(() => scienceStore.currentStepDetail)
const totalSteps = computed(() => currentExperiment.value?.steps?.length || 0)
const isVirtualLabActive = computed(() => scienceStore.isVirtualLabActive)

// 观察记录
const observations = computed(() => scienceStore.virtualLabState.observations)

// 分类信息
const getCategoryIcon = computed(() => {
  const cat = Object.values(SCIENCE_CATEGORIES).find(c => c.id === currentExperiment.value?.category)
  return cat ? cat.icon : '🔬'
})

const getCategoryColor = computed(() => {
  const cat = Object.values(SCIENCE_CATEGORIES).find(c => c.id === currentExperiment.value?.category)
  return cat ? cat.color : '#999'
})

const getCategoryName = computed(() => {
  const cat = Object.values(SCIENCE_CATEGORIES).find(c => c.id === currentExperiment.value?.category)
  return cat ? cat.name : ''
})

// 步骤操作
const handleNextStep = () => {
  scienceStore.nextStep()
}

const handlePrevStep = () => {
  scienceStore.prevStep()
}

const handleGoToStep = (index) => {
  scienceStore.goToStep(index)
}

// 添加观察记录
const handleAddObservation = () => {
  if (!observationText.value.trim()) return
  scienceStore.addObservation(observationText.value)
  observationText.value = ''
}

// 开始实验
const handleStartExperiment = () => {
  scienceStore.startVirtualLab()
}

// 完成实验
const handleCompleteExperiment = () => {
  const record = {
    observations: observations.value,
    completedAt: new Date().toISOString(),
    steps: currentExperiment.value?.steps?.length || 0
  }
  
  uni.showModal({
    title: '完成实验',
    content: '恭喜你完成实验！是否保存记录？',
    success: (res) => {
      if (res.confirm) {
        scienceStore.completeVirtualExperiment(record)
        
        // 添加到实验记录
        scienceStore.addEntry({
          experimentId: currentExperiment.value.id,
          experimentTitle: currentExperiment.value.title,
          category: currentExperiment.value.category,
          observations: observations.value,
          completedAt: record.completedAt,
          points: currentExperiment.value.points
        })
        
        uni.showToast({ title: `获得${currentExperiment.value.points}积分！`, icon: 'success' })
        
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}

// 退出实验
const handleExitLab = () => {
  uni.showModal({
    title: '退出实验',
    content: '确定要退出吗？观察记录将不会保存。',
    success: (res) => {
      if (res.confirm) {
        scienceStore.exitVirtualLab()
        uni.navigateBack()
      }
    }
  })
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 初始化
onMounted(() => {
  if (!currentExperiment.value) {
    uni.navigateBack()
  }
})
</script>

<style scoped>
.virtual-lab-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.lab-header {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.exp-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.exp-category-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #fff;
  width: fit-content;
}

.exp-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.safety-warn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 16rpx;
  padding: 12rpx;
  background: #fff3cd;
  border-radius: 8rpx;
}

.warn-icon {
  font-size: 28rpx;
}

.warn-text {
  font-size: 24rpx;
  color: #856404;
}

.materials-section,
.steps-section,
.observation-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.step-indicator {
  font-size: 24rpx;
  font-weight: normal;
  color: #666;
}

.materials-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.material-item {
  background: #f0f0f0;
  padding: 12rpx 20rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #666;
}

.step-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-bottom: 30rpx;
  padding: 0 20rpx;
}

.progress-dot {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  color: #999;
  z-index: 1;
}

.progress-dot.active {
  background: #667eea;
  color: #fff;
}

.progress-dot.completed {
  background: #2ecc71;
  color: #fff;
}

.check-icon {
  font-size: 24rpx;
}

.progress-line {
  position: absolute;
  left: 40rpx;
  right: 40rpx;
  height: 4rpx;
  background: #e0e0e0;
  top: 50%;
  transform: translateY(-50%);
}

.line-fill {
  height: 100%;
  background: #667eea;
  transition: width 0.3s;
}

.step-content {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.step-number {
  font-size: 24rpx;
  color: #667eea;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.step-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.step-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.principle-tip {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
  padding: 16rpx;
  background: #e8f4fd;
  border-radius: 8rpx;
}

.tip-icon {
  font-size: 32rpx;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #3498db;
  display: block;
  margin-bottom: 8rpx;
}

.tip-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.step-nav {
  display: flex;
  gap: 20rpx;
}

.nav-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}

.prev-btn {
  background: #e0e0e0;
  color: #666;
}

.next-btn {
  background: #667eea;
  color: #fff;
}

.complete-btn {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
}

.observation-input {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.obs-input {
  flex: 1;
  height: 72rpx;
  padding: 0 20rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
  font-size: 26rpx;
}

.add-obs-btn {
  width: 120rpx;
  height: 72rpx;
  line-height: 72rpx;
  background: #667eea;
  color: #fff;
  border-radius: 36rpx;
  font-size: 26rpx;
  border: none;
}

.observations-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.obs-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  align-items: center;
}

.obs-step {
  font-size: 24rpx;
  color: #667eea;
  font-weight: bold;
}

.obs-content {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.obs-time {
  font-size: 22rpx;
  color: #999;
}

.empty-obs {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 26rpx;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.1);
}

.exit-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background: #e0e0e0;
  color: #666;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}

.start-btn {
  flex: 2;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}
</style>
