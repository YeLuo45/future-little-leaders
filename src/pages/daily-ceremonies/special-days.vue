<!-- 特别日仪式页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">特别日仪式</text>
      <view class="nav-right" @tap="goToAddSpecialDay">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- 即将到来 -->
    <view class="section" v-if="upcomingDays.length > 0">
      <text class="section-title">🎉 即将到来</text>
      <view class="upcoming-list">
        <view 
          v-for="day in upcomingDays" 
          :key="day.id"
          class="upcoming-card"
          :style="{ borderLeftColor: getDayTypeColor(day.type) }"
        >
          <view class="card-header">
            <text class="day-icon">{{ getDayTypeIcon(day.type) }}</text>
            <view class="day-info">
              <text class="day-name">{{ day.name }}</text>
              <text class="day-date">{{ formatDate(day.date) }}</text>
            </view>
            <text class="days-left" :class="{ today: isToday(day.date) }">
              {{ getDaysLeft(day.date) }}
            </text>
          </view>
          <text class="day-desc" v-if="day.description">{{ day.description }}</text>
          <view class="card-actions" v-if="isToday(day.date) && !day.isCompleted">
            <button class="celebrate-btn" @tap="openCelebration(day)">
              开始庆祝 🎊
            </button>
          </view>
          <view class="completed-tag" v-if="day.isCompleted">
            <text>✓ 已庆祝</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 全部特别日 -->
    <view class="section">
      <text class="section-title">📅 全部特别日</text>
      <view class="all-days-list">
        <view 
          v-for="day in allDays" 
          :key="day.id"
          class="day-item"
          :class="{ completed: day.isCompleted }"
        >
          <text class="item-icon">{{ getDayTypeIcon(day.type) }}</text>
          <view class="item-info">
            <text class="item-name">{{ day.name }}</text>
            <text class="item-date">{{ formatDate(day.date) }}</text>
          </view>
          <view class="item-actions">
            <text v-if="day.isCompleted" class="item-status completed">已完成</text>
            <text v-else class="item-status pending">待庆祝</text>
          </view>
        </view>
        <view v-if="allDays.length === 0" class="empty-state">
          <text class="empty-icon">🎂</text>
          <text class="empty-text">暂无特别日</text>
          <text class="empty-hint">点击右上角 + 创建第一个特别日</text>
        </view>
      </view>
    </view>

    <!-- 特别日类型说明 -->
    <view class="section">
      <text class="section-title">💡 特别日类型</text>
      <view class="type-grid">
        <view class="type-card" v-for="(type, key) in SPECIAL_DAY_TYPES" :key="key">
          <text class="type-icon">{{ type.icon }}</text>
          <text class="type-name">{{ type.name }}</text>
        </view>
      </view>
    </view>

    <!-- 庆祝弹窗 -->
    <view class="celebration-modal" v-if="showCelebrationModal" @tap="closeCelebration">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">🎊 庆祝 {{ selectedDay?.name }}</text>
        
        <view class="celebration-options">
          <view class="option-item" @tap="selectCelebration('cake')">
            <text class="option-icon">🎂</text>
            <text class="option-name">切蛋糕</text>
          </view>
          <view class="option-item" @tap="selectCelebration('photo')">
            <text class="option-icon">📸</text>
            <text class="option-name">拍照留念</text>
          </view>
          <view class="option-item" @tap="selectCelebration('wish')">
            <text class="option-icon">🎁</text>
            <text class="option-name">许愿祝福</text>
          </view>
          <view class="option-item" @tap="selectCelebration('video')">
            <text class="option-icon">🎬</text>
            <text class="option-name">录制视频</text>
          </view>
        </view>

        <view class="celebration-note">
          <textarea 
            class="note-input" 
            v-model="celebrationNote"
            placeholder="写下这一刻的感想..."
            maxlength="200"
          />
        </view>

        <view class="modal-actions">
          <button class="cancel-btn" @tap="closeCelebration">取消</button>
          <button class="confirm-btn" @tap="confirmCelebration">完成庆祝</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useDailyCeremoniesStore } from '@/stores/dailyCeremoniesStore.js'
import { SPECIAL_DAY_TYPES } from '@/services/dailyCeremoniesService.js'

export default {
  setup() {
    const store = useDailyCeremoniesStore()
    const showCelebrationModal = ref(false)
    const selectedDay = ref(null)
    const celebrationNote = ref('')

    onMounted(() => {
      store.init()
    })

    const upcomingDays = computed(() => {
      return store.upcomingSpecialDays
    })

    const allDays = computed(() => {
      return [...store.specialDays].sort((a, b) => new Date(a.date) - new Date(b.date))
    })

    const getDayTypeIcon = (type) => {
      return SPECIAL_DAY_TYPES[type]?.icon || '⭐'
    }

    const getDayTypeColor = (type) => {
      return SPECIAL_DAY_TYPES[type]?.color || '#c9b1ff'
    }

    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}月${day}日`
    }

    const isToday = (dateStr) => {
      const today = new Date()
      const date = new Date(dateStr)
      return today.toDateString() === date.toDateString()
    }

    const getDaysLeft = (dateStr) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const date = new Date(dateStr)
      date.setHours(0, 0, 0, 0)
      const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24))
      
      if (diff === 0) return '今天!'
      if (diff === 1) return '明天'
      if (diff < 0) return '已过'
      return `${diff}天后`
    }

    const goToAddSpecialDay = () => {
      uni.navigateTo({ url: '/pages/daily-ceremonies/add-special-day' })
    }

    const openCelebration = (day) => {
      selectedDay.value = day
      showCelebrationModal.value = true
      celebrationNote.value = ''
    }

    const closeCelebration = () => {
      showCelebrationModal.value = false
      selectedDay.value = null
      celebrationNote.value = ''
    }

    const selectCelebration = (type) => {
      celebrationNote.value = celebrationNote.value + `[${type}]`
    }

    const confirmCelebration = () => {
      if (selectedDay.value) {
        store.celebrateSpecialDay(selectedDay.value.id, {
          type: 'celebration',
          note: celebrationNote.value,
          method: 'completed'
        })
        uni.showToast({ title: '庆祝完成！🎉', icon: 'success' })
        closeCelebration()
      }
    }

    const goBack = () => {
      uni.navigateBack()
    }

    return {
      store,
      SPECIAL_DAY_TYPES,
      upcomingDays,
      allDays,
      showCelebrationModal,
      selectedDay,
      celebrationNote,
      getDayTypeIcon,
      getDayTypeColor,
      formatDate,
      isToday,
      getDaysLeft,
      goToAddSpecialDay,
      openCelebration,
      closeCelebration,
      selectCelebration,
      confirmCelebration,
      goBack
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #ffecd2 0%, #ff9a9e 100%);
  padding-bottom: 40rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 60px 32rpx 32rpx;
  background: transparent;
}

.nav-left .icon, .nav-right .icon {
  font-size: 48rpx;
  color: #fff;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.nav-right {
  width: 60rpx;
  text-align: center;
}

.section {
  margin: 0 32rpx 32rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20rpx;
  display: block;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.upcoming-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 24rpx;
  border-left: 6rpx solid #ffd93d;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.day-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.day-info {
  flex: 1;
}

.day-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.day-date {
  font-size: 24rpx;
  color: #999;
}

.days-left {
  font-size: 26rpx;
  color: #666;
  font-weight: bold;
}

.days-left.today {
  color: #ff6b6b;
}

.day-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
}

.celebrate-btn {
  background: linear-gradient(135deg, #ffecd2 0%, #ff9a9e 100%);
  color: #fff;
  border: none;
  border-radius: 30rpx;
  padding: 12rpx 32rpx;
  font-size: 26rpx;
  font-weight: bold;
}

.completed-tag {
  text-align: right;
  color: #52c41a;
  font-size: 24rpx;
}

.all-days-list {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.day-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1px solid #f0f0f0;
}

.day-item:last-child {
  border-bottom: none;
}

.day-item.completed {
  opacity: 0.7;
}

.item-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.item-date {
  font-size: 24rpx;
  color: #999;
}

.item-status {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.item-status.completed {
  background: #e8f5e9;
  color: #52c41a;
}

.item-status.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.empty-state {
  text-align: center;
  padding: 60rpx 20rpx;
}

.empty-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #999;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.type-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16rpx;
  padding: 20rpx 8rpx;
  text-align: center;
}

.type-icon {
  font-size: 36rpx;
  display: block;
  margin-bottom: 8rpx;
}

.type-name {
  font-size: 22rpx;
  color: #666;
}

/* 庆祝弹窗 */
.celebration-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  width: 90%;
  max-width: 600rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  display: block;
  margin-bottom: 32rpx;
}

.celebration-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.option-item {
  background: #f5f5f5;
  border-radius: 16rpx;
  padding: 20rpx 8rpx;
  text-align: center;
}

.option-icon {
  font-size: 40rpx;
  display: block;
  margin-bottom: 8rpx;
}

.option-name {
  font-size: 22rpx;
  color: #666;
}

.celebration-note {
  margin-bottom: 24rpx;
}

.note-input {
  width: 100%;
  height: 120rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 26rpx;
  color: #333;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 20rpx 0;
  border-radius: 30rpx;
  font-size: 28rpx;
  border: none;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #ffecd2 0%, #ff9a9e 100%);
  color: #fff;
  font-weight: bold;
}
</style>
