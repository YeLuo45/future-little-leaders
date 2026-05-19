<template>
  <view class="habits-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>习惯打卡</text>
      </view>
      <view class="header-right">
        <text class="icon" @click="showAddHabit">+</text>
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

    <!-- 打卡统计 -->
    <view class="checkin-stats">
      <view class="stats-overview">
        <view class="stat-circle">
          <text class="stat-value">{{ checkedInCount }}/{{ habits.length }}</text>
          <text class="stat-label">已打卡</text>
        </view>
        <view class="stats-right">
          <view class="stat-row">
            <text class="stat-label">连续打卡最长:</text>
            <text class="stat-highlight">{{ maxStreak }}天</text>
          </view>
          <view class="stat-row">
            <text class="stat-label">本周打卡:</text>
            <text class="stat-highlight">{{ weekCheckinCount }}次</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 习惯列表 -->
    <scroll-view class="habits-list" scroll-y>
      <view v-if="habits.length === 0" class="empty-state">
        <text class="empty-icon">🌱</text>
        <text class="empty-text">还没有习惯</text>
        <text class="empty-hint">点击右上角添加第一个习惯</text>
      </view>

      <view
        v-for="habit in habits"
        :key="habit.id"
        class="habit-item"
        :class="{ checked: isCheckedIn(habit.id) }"
        @click="toggleCheckin(habit)"
      >
        <view class="habit-icon" :style="{ backgroundColor: habit.color || '#8477fa' }">
          <text>{{ habit.icon || '⭐' }}</text>
        </view>
        <view class="habit-content">
          <view class="habit-header">
            <text class="habit-title">{{ habit.title }}</text>
            <view v-if="getStreak(habit.id) > 0" class="streak-badge">
              <text>🔥 {{ getStreak(habit.id) }}天</text>
            </view>
          </view>
          <text v-if="habit.description" class="habit-desc">{{ habit.description }}</text>
          <view class="habit-meta">
            <text class="habit-frequency">{{ getFrequencyLabel(habit.frequency) }}</text>
          </view>
        </view>
        <view class="habit-checkbox" :class="{ checked: isCheckedIn(habit.id) }">
          <text v-if="isCheckedIn(habit.id)">✓</text>
        </view>
        <view class="habit-actions" @click.stop="showHabitActions(habit)">
          <text class="action-icon">⋮</text>
        </view>
      </view>
    </scroll-view>

    <!-- 添加/编辑习惯弹窗 -->
    <view v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingHabit ? '编辑习惯' : '添加习惯' }}</text>
          <text class="modal-close" @click="closeModal">×</text>
        </view>

        <view class="form-item">
          <text class="form-label">习惯名称</text>
          <input
            v-model="habitForm.title"
            class="form-input"
            placeholder="例如：早起打卡、阅读30分钟"
          />
        </view>

        <view class="form-item">
          <text class="form-label">描述（可选）</text>
          <textarea
            v-model="habitForm.description"
            class="form-textarea"
            placeholder="描述你的习惯目标"
          />
        </view>

        <view class="form-item">
          <text class="form-label">图标</text>
          <view class="icon-selector">
            <view
              v-for="icon in iconOptions"
              :key="icon"
              class="icon-option"
              :class="{ active: habitForm.icon === icon }"
              @click="habitForm.icon = icon"
            >
              <text>{{ icon }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">颜色</text>
          <view class="color-selector">
            <view
              v-for="color in colorOptions"
              :key="color"
              class="color-option"
              :class="{ active: habitForm.color === color }"
              :style="{ backgroundColor: color }"
              @click="habitForm.color = color"
            />
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">频率</text>
          <view class="frequency-selector">
            <view
              class="freq-option"
              :class="{ active: habitForm.frequency === 'daily' }"
              @click="habitForm.frequency = 'daily'"
            >
              <text>每日</text>
            </view>
            <view
              class="freq-option"
              :class="{ active: habitForm.frequency === 'weekly' }"
              @click="habitForm.frequency = 'weekly'"
            >
              <text>每周</text>
            </view>
          </view>
        </view>

        <view v-if="habitForm.frequency === 'weekly'" class="form-item">
          <text class="form-label">每周目标天数</text>
          <view class="weekday-selector">
            <view
              v-for="(day, index) in weekDays"
              :key="index"
              class="weekday-option"
              :class="{ active: habitForm.targetDays.includes(index) }"
              @click="toggleTargetDay(index)"
            >
              <text>{{ day }}</text>
            </view>
          </view>
        </view>

        <view class="form-actions">
          <button v-if="editingHabit" class="btn-delete" @click="deleteHabit">删除</button>
          <button class="btn-save" @click="saveHabit">{{ editingHabit ? '保存' : '添加' }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useTimeStore } from '@/stores/timeStore'

export default {
  data() {
    return {
      showAddModal: false,
      editingHabit: null,
      habitForm: {
        title: '',
        description: '',
        icon: '⭐',
        color: '#8477fa',
        frequency: 'daily',
        targetDays: []
      },
      iconOptions: ['⭐', '🌅', '📚', '🏃', '💪', '🧘', '✏️', '🎯', '💤', '🥗', '💧', '🌱'],
      colorOptions: ['#8477fa', '#4a90d9', '#52c41a', '#fa8c16', '#ff4d4f', '#722ed1', '#13c2c2', '#faad14'],
      weekDays: ['日', '一', '二', '三', '四', '五', '六']
    }
  },
  computed: {
    selectedDate() {
      return this.timeStore.selectedDate
    },
    habits() {
      return this.timeStore.habits
    },
    habitRecords() {
      return this.timeStore.habitRecords
    },
    checkedInCount() {
      const today = this.selectedDate
      return this.habits.filter(h => this.isCheckedIn(h.id, today)).length
    },
    maxStreak() {
      if (this.habits.length === 0) return 0
      return Math.max(...this.habits.map(h => this.timeStore.getHabitStreak(h.id)))
    },
    weekCheckinCount() {
      const today = new Date()
      const weekAgo = new Date(today)
      weekAgo.setDate(today.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]
      const todayStr = today.toISOString().split('T')[0]
      
      return this.habitRecords.filter(r => 
        r.date && r.date >= weekAgoStr && r.date <= todayStr
      ).length
    },
    timeStore() {
      return useTimeStore()
    }
  },
  onLoad() {
    this.timeStore.init()
  },
  onUnload() {
    this.timeStore.cleanup()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    formatDate(dateStr) {
      const date = new Date(dateStr)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)

      if (date.toDateString() === today.toDateString()) {
        return '今天'
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return '明天'
      } else if (date.toDateString() === yesterday.toDateString()) {
        return '昨天'
      } else {
        return `${date.getMonth() + 1}月${date.getDate()}日`
      }
    },
    prevDay() {
      const date = new Date(this.selectedDate)
      date.setDate(date.getDate() - 1)
      this.timeStore.setSelectedDate(date.toISOString().split('T')[0])
    },
    nextDay() {
      const date = new Date(this.selectedDate)
      date.setDate(date.getDate() + 1)
      this.timeStore.setSelectedDate(date.toISOString().split('T')[0])
    },
    showDatePicker() {
      uni.showDatePicker({
        currentDate: this.selectedDate,
        success: (res) => {
          this.timeStore.setSelectedDate(res.dateStr)
        }
      })
    },
    isCheckedIn(habitId, date = null) {
      const targetDate = date || this.selectedDate
      return this.timeStore.isHabitCheckedIn(habitId, targetDate)
    },
    getStreak(habitId) {
      return this.timeStore.getHabitStreak(habitId)
    },
    getFrequencyLabel(frequency) {
      return frequency === 'daily' ? '每日' : '每周'
    },
    toggleCheckin(habit) {
      if (this.isCheckedIn(habit.id)) {
        this.timeStore.uncheckHabit(habit.id, this.selectedDate)
        uni.showToast({ title: '已取消打卡', icon: 'none' })
      } else {
        this.timeStore.checkInHabit(habit.id, this.selectedDate)
        uni.showToast({ title: '打卡成功 🎉', icon: 'success' })
      }
    },
    showAddHabit() {
      this.editingHabit = null
      this.habitForm = {
        title: '',
        description: '',
        icon: '⭐',
        color: '#8477fa',
        frequency: 'daily',
        targetDays: []
      }
      this.showAddModal = true
    },
    showHabitActions(habit) {
      uni.showActionSheet({
        itemList: ['编辑', '删除'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.editHabit(habit)
          } else if (res.tapIndex === 1) {
            this.confirmDeleteHabit(habit)
          }
        }
      })
    },
    editHabit(habit) {
      this.editingHabit = habit
      this.habitForm = {
        title: habit.title,
        description: habit.description || '',
        icon: habit.icon || '⭐',
        color: habit.color || '#8477fa',
        frequency: habit.frequency || 'daily',
        targetDays: habit.targetDays || []
      }
      this.showAddModal = true
    },
    toggleTargetDay(dayIndex) {
      const index = this.habitForm.targetDays.indexOf(dayIndex)
      if (index === -1) {
        this.habitForm.targetDays.push(dayIndex)
      } else {
        this.habitForm.targetDays.splice(index, 1)
      }
    },
    saveHabit() {
      if (!this.habitForm.title.trim()) {
        uni.showToast({ title: '请输入习惯名称', icon: 'none' })
        return
      }

      if (this.editingHabit) {
        this.timeStore.updateHabit(this.editingHabit.id, this.habitForm)
        uni.showToast({ title: '习惯已更新', icon: 'success' })
      } else {
        this.timeStore.addHabit(this.habitForm)
        uni.showToast({ title: '习惯已添加', icon: 'success' })
      }
      this.closeModal()
    },
    confirmDeleteHabit(habit) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除习惯"${habit.title}"吗？`,
        success: (res) => {
          if (res.confirm) {
            this.timeStore.removeHabit(habit.id)
            uni.showToast({ title: '习惯已删除', icon: 'success' })
          }
        }
      })
    },
    deleteHabit() {
      if (this.editingHabit) {
        this.confirmDeleteHabit(this.editingHabit)
      }
    },
    closeModal() {
      this.showAddModal = false
      this.editingHabit = null
    }
  }
}
</script>

<style scoped>
.habits-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  background-color: #8477fa;
  color: white;
}

.header-left, .header-right {
  width: 40px;
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

.date-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: white;
}

.date-nav {
  padding: 8px 16px;
  color: #8477fa;
}

.date-display {
  padding: 8px 24px;
  background-color: #f0f0ff;
  border-radius: 20px;
  margin: 0 16px;
}

.checkin-stats {
  background-color: white;
  padding: 16px;
  margin-top: 1px;
}

.stats-overview {
  display: flex;
  align-items: center;
}

.stat-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8477fa 0%, #a599fa 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
}

.stats-right {
  flex: 1;
}

.stat-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.stat-row .stat-label {
  font-size: 14px;
  color: #666;
}

.stat-highlight {
  margin-left: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #8477fa;
}

.habits-list {
  height: calc(100vh - 340px);
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 80px;
}

.empty-icon {
  font-size: 64px;
}

.empty-text {
  margin-top: 16px;
  font-size: 16px;
  color: #666;
}

.empty-hint {
  margin-top: 8px;
  font-size: 14px;
  color: #999;
}

.habit-item {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.habit-item.checked {
  background-color: #f9fff9;
}

.habit-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 12px;
}

.habit-content {
  flex: 1;
}

.habit-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.habit-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.streak-badge {
  padding: 2px 8px;
  background-color: #fff3e0;
  border-radius: 10px;
  font-size: 12px;
  color: #fa8c16;
}

.habit-desc {
  display: block;
  margin-top: 4px;
  font-size: 14px;
  color: #999;
}

.habit-meta {
  margin-top: 4px;
}

.habit-frequency {
  font-size: 12px;
  color: #999;
}

.habit-checkbox {
  width: 28px;
  height: 28px;
  border: 2px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  color: #52c41a;
  font-size: 16px;
  font-weight: bold;
}

.habit-checkbox.checked {
  background-color: #52c41a;
  border-color: #52c41a;
  color: white;
}

.habit-actions {
  padding: 4px 8px;
}

.action-icon {
  font-size: 18px;
  color: #999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background-color: white;
  border-radius: 16px 16px 0 0;
  padding: 20px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
}

.modal-close {
  font-size: 28px;
  color: #999;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
}

.form-textarea {
  width: 100%;
  height: 80px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
}

.icon-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-option {
  width: 44px;
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.icon-option.active {
  border-color: #8477fa;
  background-color: #f0f0ff;
}

.color-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-option {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid transparent;
}

.color-option.active {
  border-color: #333;
}

.frequency-selector {
  display: flex;
  gap: 12px;
}

.freq-option {
  flex: 1;
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
}

.freq-option.active {
  border-color: #8477fa;
  background-color: #8477fa;
  color: white;
}

.weekday-selector {
  display: flex;
  gap: 8px;
}

.weekday-option {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
}

.weekday-option.active {
  border-color: #8477fa;
  background-color: #8477fa;
  color: white;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-delete {
  flex: 1;
  height: 44px;
  background-color: #ff4d4f;
  color: white;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: none;
}

.btn-save {
  flex: 2;
  height: 44px;
  background-color: #8477fa;
  color: white;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: none;
}
</style>
