<template>
  <view class="relaxation-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <text class="page-title">放松练习</text>
        <text class="page-subtitle">深呼吸，让自己平静下来</text>
      </view>
    </view>

    <!-- 放松类型选择 -->
    <view class="types-section" v-if="!selectedExercise">
      <view class="section-title">选择放松方式</view>
      <view class="types-grid">
        <view 
          v-for="type in relaxationTypes" 
          :key="type.id"
          class="type-card"
          :class="{active: selectedType === type.id}"
          @tap="selectType(type.id)"
        >
          <text class="type-icon">{{ type.icon }}</text>
          <text class="type-name">{{ type.name }}</text>
          <text class="type-desc">{{ type.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 练习列表 -->
    <view class="exercises-section" v-if="selectedType && !selectedExercise">
      <view class="section-header">
        <text class="back-btn" @tap="selectedType = null">← 返回</text>
        <text class="section-title">{{ currentTypeName }}</text>
      </view>
      
      <view class="exercises-list">
        <view 
          v-for="exercise in currentExercises" 
          :key="exercise.id"
          class="exercise-card"
          @tap="startExercise(exercise)"
        >
          <view class="exercise-icon">
            <text>{{ getTypeIcon(selectedType) }}</text>
          </view>
          <view class="exercise-info">
            <text class="exercise-title">{{ exercise.title }}</text>
            <text class="exercise-desc">{{ exercise.description }}</text>
            <view class="exercise-meta">
              <text class="duration">⏱ {{ exercise.duration }}秒</text>
              <text class="steps-count">{{ exercise.steps.length }}步</text>
            </view>
          </view>
          <text class="start-icon">▶</text>
        </view>
      </view>
    </view>

    <!-- 练习进行中 -->
    <view class="exercise-session" v-if="selectedExercise && isExercising">
      <!-- 顶部信息 -->
      <view class="session-header">
        <text class="session-title">{{ selectedExercise.title }}</text>
        <view class="session-progress">
          <text>第 {{ currentStep + 1 }} 步 / 共 {{ selectedExercise.steps.length }} 步</text>
        </view>
      </view>

      <!-- 圆形进度 -->
      <view class="circle-progress">
        <view class="circle-bg"></view>
        <view 
          class="circle-fill" 
          :style="{transform: `rotate(${progressAngle}deg)`}"
        ></view>
        <view class="circle-content">
          <text class="step-number">{{ currentStep + 1 }}</text>
          <text class="step-total">/ {{ selectedExercise.steps.length }}</text>
        </view>
      </view>

      <!-- 步骤内容 -->
      <view class="step-content">
        <text class="step-text">{{ selectedExercise.steps[currentStep] }}</text>
      </view>

      <!-- 呼吸动画提示 -->
      <view class="breath-hint" v-if="selectedType === 'breathing'">
        <view class="breath-circle" :class="breathPhase"></view>
      </view>

      <!-- 控制按钮 -->
      <view class="session-controls">
        <button class="control-btn prev" @tap="prevStep" :disabled="currentStep === 0">
          ← 上一步
        </button>
        <button class="control-btn next" @tap="nextStep">
          {{ currentStep === selectedExercise.steps.length - 1 ? '完成' : '下一步' }}
        </button>
      </view>

      <!-- 放弃按钮 -->
      <view class="quit-area">
        <text class="quit-btn" @tap="quitExercise">放弃练习</text>
      </view>
    </view>

    <!-- 练习完成 -->
    <view class="exercise-complete" v-if="showComplete">
      <view class="complete-card">
        <text class="complete-icon">🎉</text>
        <text class="complete-title">练习完成！</text>
        <text class="complete-desc">你完成了一次{{ currentTypeName }}练习</text>
        
        <view class="complete-stats">
          <view class="stat-item">
            <text class="stat-value">{{ selectedExercise.duration }}</text>
            <text class="stat-label">练习时长(秒)</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ selectedExercise.steps.length }}</text>
            <text class="stat-label">完成步数</text>
          </view>
        </view>

        <!-- 反馈 -->
        <view class="feedback-section">
          <text class="feedback-label">感觉怎么样？</text>
          <view class="feedback-options">
            <view 
              v-for="fb in feedbackOptions" 
              :key="fb.value"
              class="feedback-btn"
              :class="{selected: feedback === fb.value}"
              @tap="feedback = fb.value"
            >
              <text>{{ fb.emoji }}</text>
              <text class="fb-text">{{ fb.label }}</text>
            </view>
          </view>
        </view>

        <view class="complete-actions">
          <button class="again-btn" @tap="doAgain">再练一次</button>
          <button class="done-btn" @tap="finishSession">完成</button>
        </view>
      </view>
    </view>

    <!-- 练习历史 -->
    <view class="history-section" v-if="!selectedType && !selectedExercise && !showComplete">
      <view class="section-header">
        <text class="section-title">最近练习</text>
      </view>

      <view class="stats-overview" v-if="store.relaxationStats">
        <view class="stat-card">
          <text class="stat-value">{{ store.relaxationStats.totalSessions }}</text>
          <text class="stat-label">总练习次数</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ formatDuration(store.relaxationStats.totalDuration) }}</text>
          <text class="stat-label">总练习时长</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ store.relaxationCompletionRate }}%</text>
          <text class="stat-label">完成率</text>
        </view>
      </view>

      <view class="history-list" v-if="store.relaxationHistory.length">
        <view 
          v-for="session in store.relaxationHistory" 
          :key="session.id"
          class="history-item"
        >
          <view class="history-icon">
            <text>{{ getTypeIcon(session.exerciseType) }}</text>
          </view>
          <view class="history-info">
            <text class="history-title">{{ getExerciseName(session.exerciseId) }}</text>
            <text class="history-date">{{ formatDate(session.completedAt) }}</text>
          </view>
          <view class="history-status">
            <text v-if="session.completed" class="status-done">已完成</text>
            <text v-else class="status-incomplete">未完成</text>
          </view>
        </view>
      </view>

      <view class="empty-history" v-else>
        <text class="empty-text">还没有练习记录</text>
        <text class="empty-hint">开始一个放松练习吧</text>
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="bottom-nav">
      <view class="nav-item" @tap="goToRecognition">
        <text class="nav-icon">🎭</text>
        <text class="nav-text">识别训练</text>
      </view>
      <view class="nav-item" @tap="goToJournal">
        <text class="nav-icon">📝</text>
        <text class="nav-text">情绪日记</text>
      </view>
      <view class="nav-item active">
        <text class="nav-icon">🧘</text>
        <text class="nav-text">放松练习</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useEmotionStore } from '@/stores/emotionStore.js'
import { RELAXATION_TYPES, getRelaxationExercises } from '@/services/emotionTrainingService.js'

const store = useEmotionStore()

// 放松类型
const relaxationTypes = [
  { id: RELAXATION_TYPES.BREATHING, name: '深呼吸', desc: '平复情绪', icon: '🌬️' },
  { id: RELAXATION_TYPES.VISUALIZATION, name: '形象化', desc: '放松想象', icon: '🏖️' },
  { id: RELAXATION_TYPES.BODY_SCAN, name: '身体扫描', desc: '释放紧张', icon: '🧘' },
  { id: RELAXATION_TYPES.STRETCHING, name: '伸展运动', desc: '活动身体', icon: '🤸' }
]

const selectedType = ref(null)
const selectedExercise = ref(null)
const isExercising = ref(false)
const currentStep = ref(0)
const showComplete = ref(false)
const progressAngle = ref(0)
const breathPhase = ref('inhale')
const feedback = ref('')
const exerciseStartTime = ref(null)

const feedbackOptions = [
  { value: 'great', emoji: '😄', label: '很棒' },
  { value: 'good', emoji: '🙂', label: '不错' },
  { value: 'normal', emoji: '😐', label: '一般' },
  { value: 'hard', emoji: '😓', label: '有点难' }
]

// 当前类型名称
const currentTypeName = computed(() => {
  const type = relaxationTypes.find(t => t.id === selectedType.value)
  return type?.name || ''
})

// 当前类型的练习
const currentExercises = computed(() => {
  if (!selectedType.value) return []
  return getRelaxationExercises(selectedType.value)
})

// 进度角度
const progressAngleComputed = computed(() => {
  if (!selectedExercise.value) return 0
  return (currentStep.value / (selectedExercise.value.steps.length - 1)) * 180
})

// 监听进度变化
import { watch } from 'vue'
watch(currentStep, (val) => {
  if (selectedExercise.value) {
    progressAngle.value = (val / (selectedExercise.value.steps.length - 1)) * 180
  }
})

// 呼吸动画定时器
let breathTimer = null

function getTypeIcon(type) {
  const typeData = relaxationTypes.find(t => t.id === type)
  return typeData?.icon || '🧘'
}

function getExerciseName(exerciseId) {
  for (const type of Object.values(RELAXATION_TYPES)) {
    const exercises = getRelaxationExercises(type)
    const found = exercises.find(e => e.id === exerciseId)
    if (found) return found.title
  }
  return '未知练习'
}

function selectType(type) {
  selectedType.value = type
}

function startExercise(exercise) {
  selectedExercise.value = exercise
  currentStep.value = 0
  progressAngle.value = 0
  isExercising.value = true
  showComplete.value = false
  exerciseStartTime.value = Date.now()
  
  // 启动呼吸动画
  if (selectedType.value === RELAXATION_TYPES.BREATHING) {
    startBreathAnimation()
  }
}

function startBreathAnimation() {
  breathPhase.value = 'inhale'
  breathTimer = setInterval(() => {
    breathPhase.value = breathPhase.value === 'inhale' ? 'exhale' : 'inhale'
  }, 4000)
}

function stopBreathAnimation() {
  if (breathTimer) {
    clearInterval(breathTimer)
    breathTimer = null
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function nextStep() {
  if (!selectedExercise.value) return
  
  if (currentStep.value < selectedExercise.value.steps.length - 1) {
    currentStep.value++
  } else {
    // 完成练习
    completeExercise()
  }
}

function quitExercise() {
  stopBreathAnimation()
  isExercising.value = false
  selectedExercise.value = null
  currentStep.value = 0
}

function completeExercise() {
  stopBreathAnimation()
  isExercising.value = false
  showComplete.value = true
  
  // 计算时长
  const duration = Math.round((Date.now() - exerciseStartTime.value) / 1000)
  
  // 记录练习
  store.logRelaxationSession({
    exerciseId: selectedExercise.value.id,
    exerciseType: selectedType.value,
    duration,
    completed: true,
    feedback: feedback.value
  })
}

function doAgain() {
  showComplete.value = false
  feedback.value = ''
  startExercise(selectedExercise.value)
}

function finishSession() {
  showComplete.value = false
  selectedExercise.value = null
  selectedType.value = null
  feedback.value = ''
}

function formatDuration(seconds) {
  if (seconds < 60) return seconds + '秒'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function goToRecognition() {
  uni.navigateTo({ url: '/pages/emotion-training/emotion-recognition' })
}

function goToJournal() {
  uni.navigateTo({ url: '/pages/emotion-training/emotion-journal' })
}

onUnmounted(() => {
  stopBreathAnimation()
})
</script>

<style scoped>
.relaxation-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 60rpx 40rpx 80rpx;
  color: #fff;
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

/* 类型选择 */
.types-section {
  padding: 40rpx 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.back-btn {
  font-size: 28rpx;
  color: #4facfe;
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25rpx;
}

.type-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  text-align: center;
  box-shadow: 0 4rpx 15rpx rgba(0,0,0,0.05);
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.type-card.active {
  border-color: #4facfe;
  background: #f0f8ff;
}

.type-icon {
  font-size: 70rpx;
  display: block;
  margin-bottom: 15rpx;
}

.type-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.type-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

/* 练习列表 */
.exercises-section {
  padding: 30rpx;
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.exercise-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  gap: 25rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}

.exercise-icon {
  width: 100rpx;
  height: 100rpx;
  background: #f0f8ff;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exercise-icon text {
  font-size: 50rpx;
}

.exercise-info {
  flex: 1;
}

.exercise-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.exercise-desc {
  font-size: 26rpx;
  color: #666;
  margin-top: 8rpx;
  display: block;
}

.exercise-meta {
  display: flex;
  gap: 20rpx;
  margin-top: 10rpx;
}

.duration, .steps-count {
  font-size: 24rpx;
  color: #999;
}

.start-icon {
  font-size: 32rpx;
  color: #4facfe;
}

/* 练习进行中 */
.exercise-session {
  padding: 40rpx 30rpx;
  text-align: center;
}

.session-header {
  margin-bottom: 50rpx;
}

.session-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.session-progress {
  margin-top: 15rpx;
}

.session-progress text {
  font-size: 26rpx;
  color: #999;
}

/* 圆形进度 */
.circle-progress {
  position: relative;
  width: 300rpx;
  height: 300rpx;
  margin: 0 auto 50rpx;
}

.circle-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #f0f8ff;
}

.circle-fill {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(#4facfe 0deg, transparent 0deg);
  transition: transform 0.5s ease;
}

.circle-content {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.step-number {
  font-size: 80rpx;
  font-weight: 700;
  color: #4facfe;
}

.step-total {
  font-size: 28rpx;
  color: #999;
}

/* 步骤内容 */
.step-content {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 15rpx rgba(0,0,0,0.05);
}

.step-text {
  font-size: 32rpx;
  color: #333;
  line-height: 1.6;
}

/* 呼吸动画 */
.breath-hint {
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.breath-circle {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  transition: all 2s ease;
}

.breath-circle.inhale {
  transform: scale(1.5);
  opacity: 0.7;
}

.breath-circle.exhale {
  transform: scale(1);
  opacity: 1;
}

/* 控制按钮 */
.session-controls {
  display: flex;
  gap: 20rpx;
}

.control-btn {
  flex: 1;
  height: 90rpx;
  border-radius: 50rpx;
  font-size: 30rpx;
  border: none;
}

.control-btn.prev {
  background: #f5f5f5;
  color: #666;
}

.control-btn.next {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
}

.control-btn[disabled] {
  opacity: 0.5;
}

.quit-area {
  margin-top: 40rpx;
}

.quit-btn {
  font-size: 26rpx;
  color: #999;
}

/* 练习完成 */
.exercise-complete {
  padding: 40rpx 30rpx;
}

.complete-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08);
}

.complete-icon {
  font-size: 120rpx;
  display: block;
}

.complete-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  margin-top: 30rpx;
  display: block;
}

.complete-desc {
  font-size: 28rpx;
  color: #666;
  margin-top: 15rpx;
  display: block;
}

.complete-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 50rpx;
  padding: 30rpx 0;
  border-top: 1rpx solid #eee;
  border-bottom: 1rpx solid #eee;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #4facfe;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
}

/* 反馈 */
.feedback-section {
  margin-top: 40rpx;
}

.feedback-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 20rpx;
}

.feedback-options {
  display: flex;
  justify-content: space-around;
}

.feedback-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #f8f8f8;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.feedback-btn.selected {
  background: #f0f8ff;
  border-color: #4facfe;
}

.feedback-btn text:first-child {
  font-size: 50rpx;
}

.fb-text {
  font-size: 24rpx;
  color: #666;
}

.complete-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 50rpx;
}

.again-btn {
  flex: 1;
  height: 90rpx;
  background: #f8f8f8;
  color: #666;
  font-size: 30rpx;
  border-radius: 50rpx;
  border: none;
}

.done-btn {
  flex: 2;
  height: 90rpx;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
  font-size: 30rpx;
  border-radius: 50rpx;
  border: none;
}

/* 历史记录 */
.history-section {
  padding: 30rpx;
}

.stats-overview {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}

.stat-card .stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #4facfe;
  display: block;
}

.stat-card .stat-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.history-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.history-icon {
  width: 80rpx;
  height: 80rpx;
  background: #f0f8ff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-icon text {
  font-size: 40rpx;
}

.history-info {
  flex: 1;
}

.history-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  display: block;
}

.history-date {
  font-size: 24rpx;
  color: #999;
  margin-top: 5rpx;
  display: block;
}

.history-status {
  font-size: 24rpx;
}

.status-done {
  color: #52c41a;
}

.status-incomplete {
  color: #999;
}

.empty-history {
  text-align: center;
  padding: 60rpx 0;
}

.empty-text {
  font-size: 30rpx;
  color: #333;
  display: block;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
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
  color: #4facfe;
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
