<template>
  <view class="green-challenges-page">
    <!-- 头部 -->
    <view class="header-card">
      <view class="header-content">
        <view class="header-left">
          <text class="header-icon">🌿</text>
          <view class="header-info">
            <text class="header-title">绿色生活挑战</text>
            <text class="header-subtitle">完成挑战获得徽章和积分</text>
          </view>
        </view>
        <view class="points-box">
          <text class="points-num">{{ totalPoints }}</text>
          <text class="points-label">总积分</text>
        </view>
      </view>
    </view>

    <!-- 环保数据追踪 -->
    <view class="tracking-card">
      <view class="tracking-title">我的环保贡献</view>
      <view class="tracking-stats">
        <view class="tracking-item">
          <view class="tracking-icon water">💧</view>
          <view class="tracking-info">
            <text class="tracking-value">{{ userStats?.waterSaved || 0 }}L</text>
            <text class="tracking-label">节水</text>
          </view>
        </view>
        <view class="tracking-item">
          <view class="tracking-icon electricity">⚡</view>
          <view class="tracking-info">
            <text class="tracking-value">{{ userStats?.electricitySaved || 0 }}度</text>
            <text class="tracking-label">节电</text>
          </view>
        </view>
        <view class="tracking-item">
          <view class="tracking-icon carbon">🌿</view>
          <view class="tracking-info">
            <text class="tracking-value">{{ userStats?.carbonReduced || 0 }}kg</text>
            <text class="tracking-label">减碳</text>
          </view>
        </view>
      </view>
      <view class="tracking-actions">
        <button class="track-btn" @click="showAddRecordDialog('water')">+ 节水</button>
        <button class="track-btn" @click="showAddRecordDialog('electricity')">+ 节电</button>
        <button class="track-btn" @click="showAddRecordDialog('carbon')">+ 减碳</button>
      </view>
    </view>

    <!-- 进行中的挑战 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">进行中的挑战</text>
        <text class="section-count">{{ activeChallenges.length }}个</text>
      </view>

      <view class="challenge-list" v-if="activeChallenges.length > 0">
        <view 
          class="challenge-item active" 
          v-for="challenge in activeChallenges" 
          :key="challenge.id"
        >
          <view class="challenge-header">
            <text class="challenge-icon">{{ getChallengeIcon(challenge.category) }}</text>
            <view class="challenge-info">
              <text class="challenge-title">{{ challenge.title }}</text>
              <text class="challenge-desc">{{ challenge.description }}</text>
            </view>
          </view>
          
          <view class="challenge-progress">
            <view class="progress-info">
              <text class="progress-text">进度: {{ challenge.currentValue || 0 }}/{{ challenge.targetValue }}{{ challenge.targetUnit }}</text>
              <text class="progress-percent">{{ getProgressPercent(challenge) }}%</text>
            </view>
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :style="{ width: getProgressPercent(challenge) + '%' }"
              ></view>
            </view>
          </view>

          <view class="challenge-days" v-if="challenge.daysCompleted">
            <text class="days-label">完成天数：</text>
            <view class="days-list">
              <text 
                class="day-item" 
                v-for="day in challenge.daysCompleted" 
                :key="day"
              >
                第{{ day + 1 }}天
              </text>
            </view>
          </view>

          <view class="challenge-actions">
            <button 
              v-if="challenge.category === '节水' || challenge.category === '节电' || challenge.category === '低碳'"
              class="record-day-btn"
              @click="recordDay(challenge)"
            >
              记录今日完成
            </button>
            <text class="challenge-reward">奖励: +{{ challenge.points }}积分</text>
          </view>
        </view>
      </view>

      <view class="empty-tip" v-else>
        <text>暂无进行中的挑战</text>
      </view>
    </view>

    <!-- 可参与的挑战 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">可参与的挑战</text>
      </view>

      <view class="challenge-list">
        <view 
          class="challenge-item" 
          v-for="challenge in availableChallenges" 
          :key="challenge.id"
        >
          <view class="challenge-header">
            <text class="challenge-icon">{{ getChallengeIcon(challenge.category) }}</text>
            <view class="challenge-info">
              <text class="challenge-title">{{ challenge.title }}</text>
              <text class="challenge-desc">{{ challenge.description }}</text>
            </view>
          </view>

          <view class="challenge-meta">
            <text class="meta-item">
              <text class="meta-icon">🎯</text>
              目标: {{ challenge.targetValue }}{{ challenge.targetUnit }}
            </text>
            <text class="meta-item">
              <text class="meta-icon">⏰</text>
              持续: {{ challenge.duration }}天
            </text>
            <text class="meta-item reward">
              <text class="meta-icon">⭐</text>
              +{{ challenge.points }}积分
            </text>
          </view>

          <button class="start-btn" @click="startChallenge(challenge)">
            开始挑战
          </button>
        </view>
      </view>
    </view>

    <!-- 已完成的挑战 -->
    <view class="section" v-if="completedChallenges.length > 0">
      <view class="section-header">
        <text class="section-title">已完成的挑战</text>
        <text class="section-count">{{ completedChallenges.length }}个</text>
      </view>

      <view class="challenge-list">
        <view 
          class="challenge-item completed" 
          v-for="challenge in completedChallenges" 
          :key="challenge.id"
        >
          <view class="challenge-header">
            <text class="challenge-icon">{{ getChallengeIcon(challenge.category) }}</text>
            <view class="challenge-info">
              <text class="challenge-title">{{ challenge.title }}</text>
              <text class="challenge-badge" v-if="challenge.badge">
                {{ getBadgeName(challenge.badge) }}
              </text>
            </view>
          </view>
          <view class="completed-tag">
            <text>✓ 已完成</text>
            <text class="reward-text">+{{ challenge.points }}积分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加记录弹窗 -->
    <uni-popup ref="addRecordDialog" type="center">
      <view class="add-record-popup">
        <view class="popup-title">{{ getRecordTypeName() }}记录</view>
        
        <view class="form-item">
          <text class="form-label">数量</text>
          <input 
            class="form-input" 
            type="digit" 
            v-model="recordValue" 
            :placeholder="getRecordPlaceholder()"
          />
          <text class="form-unit">{{ getRecordUnit() }}</text>
        </view>

        <view class="popup-buttons">
          <button class="popup-btn cancel" @click="closeAddRecordDialog">取消</button>
          <button class="popup-btn confirm" @click="submitRecord">确认</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEcoStore } from '@/stores/ecoStore.js'

const ecoStore = useEcoStore()

// 弹窗引用
const addRecordDialog = ref(null)

// 记录类型和值
const recordType = ref('')
const recordValue = ref('')

// 总积分
const totalPoints = computed(() => ecoStore.totalPoints)

// 用户统计
const userStats = computed(() => ecoStore.userStats)

// 进行中的挑战
const activeChallenges = computed(() => ecoStore.activeChallenges)

// 已完成的挑战
const completedChallenges = computed(() => ecoStore.completedChallenges)

// 可参与的挑战（未开始的）
const availableChallenges = computed(() => {
  const startedIds = ecoStore.challenges.map(c => c.templateId)
  const allChallenges = ecoStore.challenges.length > 0 
    ? ecoStore.challenges 
    : ecoService.getChallenges ? ecoService.getChallenges() : []
  
  // 如果store里的challenges是空的就用默认的
  if (allChallenges.every(c => c.status)) {
    return []
  }
  
  return allChallenges.filter(c => !startedIds.includes(c.id))
})

// 获取挑战图标
const getChallengeIcon = (category) => {
  const icons = {
    '节水': '💧',
    '节电': '⚡',
    '低碳': '🚲',
    '减塑': '♻️',
    '分类': '🗑️'
  }
  return icons[category] || '🌿'
}

// 获取进度百分比
const getProgressPercent = (challenge) => {
  if (!challenge.targetValue) return 0
  return Math.min(100, Math.round((challenge.currentValue / challenge.targetValue) * 100))
}

// 获取徽章名称
const getBadgeName = (badgeId) => {
  const definitions = ecoStore.badgeDefinitions
  return definitions[badgeId]?.name || badgeId
}

// 开始挑战
const startChallenge = (challenge) => {
  uni.showModal({
    title: '开始挑战',
    content: `确定开始"${challenge.title}"吗？`,
    success: (res) => {
      if (res.confirm) {
        ecoStore.startChallenge(challenge.id)
        uni.showToast({ title: '挑战开始！', icon: 'success' })
      }
    }
  })
}

// 记录完成一天
const recordDay = (challenge) => {
  const today = new Date().getDay()
  const daysCompleted = challenge.daysCompleted || []
  
  if (daysCompleted.includes(today)) {
    uni.showToast({ title: '今日已记录', icon: 'none' })
    return
  }
  
  uni.showModal({
    title: '记录完成',
    content: `确认今天完成了"${challenge.title}"吗？`,
    success: (res) => {
      if (res.confirm) {
        ecoStore.recordChallengeDay(challenge.id, today)
        uni.showToast({ title: '已记录！', icon: 'success' })
      }
    }
  })
}

// 显示添加记录弹窗
const showAddRecordDialog = (type) => {
  recordType.value = type
  recordValue.value = ''
  addRecordDialog.value.open()
}

// 关闭添加记录弹窗
const closeAddRecordDialog = () => {
  addRecordDialog.value.close()
}

// 获取记录类型名称
const getRecordTypeName = () => {
  const names = {
    'water': '节水',
    'electricity': '节电',
    'carbon': '减碳'
  }
  return names[recordType.value] || ''
}

// 获取记录单位
const getRecordUnit = () => {
  const units = {
    'water': '升',
    'electricity': '度',
    'carbon': '千克'
  }
  return units[recordType.value] || ''
}

// 获取记录提示
const getRecordPlaceholder = () => {
  const placeholders = {
    'water': '请输入节水升数',
    'electricity': '请输入节电度数',
    'carbon': '请输入减碳千克数'
  }
  return placeholders[recordType.value] || ''
}

// 提交记录
const submitRecord = () => {
  const value = parseFloat(recordValue.value)
  if (isNaN(value) || value <= 0) {
    uni.showToast({ title: '请输入正确数值', icon: 'none' })
    return
  }
  
  ecoStore.updateEcoStats(recordType.value, value)
  closeAddRecordDialog()
  uni.showToast({ title: '已记录环保贡献！', icon: 'success' })
}

// 初始化
onMounted(() => {
  ecoStore.init()
})
</script>

<style scoped>
.green-challenges-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header-card {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  color: #fff;
  margin-bottom: 20rpx;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-icon {
  font-size: 56rpx;
  margin-right: 16rpx;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
}

.header-subtitle {
  font-size: 24rpx;
  opacity: 0.9;
  margin-top: 4rpx;
}

.points-box {
  text-align: center;
  background: rgba(255,255,255,0.2);
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
}

.points-num {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}

.points-label {
  font-size: 22rpx;
  opacity: 0.9;
}

.tracking-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.tracking-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.tracking-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}

.tracking-item {
  display: flex;
  align-items: center;
}

.tracking-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 12rpx;
}

.tracking-icon.water {
  background: #e3f2fd;
}

.tracking-icon.electricity {
  background: #fff3e0;
}

.tracking-icon.carbon {
  background: #e8f5e9;
}

.tracking-info {
  display: flex;
  flex-direction: column;
}

.tracking-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.tracking-label {
  font-size: 22rpx;
  color: #666;
}

.tracking-actions {
  display: flex;
  gap: 16rpx;
}

.track-btn {
  flex: 1;
  padding: 16rpx;
  font-size: 24rpx;
  background: #f5f5f5;
  color: #11998e;
  border-radius: 24rpx;
  border: none;
}

.section {
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

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-count {
  font-size: 24rpx;
  color: #999;
}

.challenge-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.challenge-item {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
  border: 2rpx solid transparent;
}

.challenge-item.active {
  background: #e8f5e9;
  border-color: #81c784;
}

.challenge-item.completed {
  background: #f5f5f5;
  opacity: 0.8;
}

.challenge-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.challenge-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.challenge-info {
  flex: 1;
}

.challenge-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.challenge-desc {
  font-size: 24rpx;
  color: #666;
  margin-top: 4rpx;
  display: block;
}

.challenge-badge {
  font-size: 22rpx;
  background: #ff9800;
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-top: 8rpx;
  display: inline-block;
}

.challenge-progress {
  margin-bottom: 16rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
}

.progress-percent {
  font-size: 24rpx;
  color: #11998e;
  font-weight: bold;
}

.progress-bar {
  height: 12rpx;
  background: #e0e0e0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border-radius: 6rpx;
  transition: width 0.3s;
}

.challenge-days {
  margin-bottom: 16rpx;
}

.days-label {
  font-size: 24rpx;
  color: #666;
}

.days-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}

.day-item {
  font-size: 22rpx;
  background: #11998e;
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.challenge-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-day-btn {
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  background: #11998e;
  color: #fff;
  border-radius: 24rpx;
  border: none;
}

.challenge-reward {
  font-size: 24rpx;
  color: #ff9800;
  font-weight: bold;
}

.challenge-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.meta-item {
  font-size: 24rpx;
  color: #666;
}

.meta-item.reward {
  color: #ff9800;
  font-weight: bold;
}

.meta-icon {
  margin-right: 4rpx;
}

.start-btn {
  width: 100%;
  padding: 20rpx;
  font-size: 28rpx;
  font-weight: bold;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
  border-radius: 44rpx;
  border: none;
}

.completed-tag {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #4caf50;
  font-size: 26rpx;
  font-weight: bold;
}

.reward-text {
  color: #ff9800;
}

.empty-tip {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}

/* 添加记录弹窗 */
.add-record-popup {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
}

.popup-title {
  font-size: 34rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40rpx;
  color: #333;
}

.form-item {
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  width: 100rpx;
}

.form-input {
  flex: 1;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.form-unit {
  font-size: 28rpx;
  color: #666;
  margin-left: 16rpx;
}

.popup-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.popup-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  border: none;
}

.popup-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.popup-btn.confirm {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
}
</style>
