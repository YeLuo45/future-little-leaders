<template>
  <view class="mood-journal-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>情绪日记</text>
      </view>
      <view class="header-right">
        <text class="icon" @click="goToAnalytics">📊</text>
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

    <!-- 今日情绪概览 -->
    <view class="today-overview" v-if="todayRecord">
      <view class="overview-card">
        <view class="overview-header">
          <text class="today-label">今日情绪</text>
          <text class="today-date">{{ formatFullDate(todayRecord.date) }}</text>
        </view>
        <view class="today-emotion">
          <text class="emotion-emoji">{{ store.getMoodEmoji(todayRecord.mood) }}</text>
          <view class="emotion-info">
            <text class="emotion-name">{{ store.getMoodName(todayRecord.mood) }}</text>
            <view class="intensity-stars">
              <view 
                v-for="i in 5" 
                :key="i"
                class="star"
                :class="{filled: i <= todayRecord.intensity}"
              ></view>
            </view>
          </view>
        </view>
        <text class="journal-trigger" v-if="todayRecord.trigger">触发因素：{{ todayRecord.trigger }}</text>
        <text class="journal-note" v-if="todayRecord.note">{{ todayRecord.note }}</text>
      </view>
    </view>

    <!-- 无记录提示 -->
    <view class="empty-state" v-if="!todayRecord">
      <view class="empty-icon">🌈</view>
      <text class="empty-title">今天还没有记录情绪</text>
      <text class="empty-desc">记录下你的情绪，了解自己的心情变化</text>
      <button class="start-btn" @click="showAddRecord">记录情绪</button>
    </view>

    <!-- 快速记录入口 -->
    <view class="quick-record" v-if="todayRecord" @click="showAddRecord">
      <text>✏️ 编辑记录</text>
    </view>

    <!-- 调节建议 -->
    <view class="tips-section" v-if="todayRecord">
      <view class="section-header">
        <text class="section-title">💡 情绪调节建议</text>
      </view>
      <view class="tips-list">
        <view 
          v-for="(tip, index) in currentTips" 
          :key="index"
          class="tip-item"
        >
          <text class="tip-icon">•</text>
          <text class="tip-text">{{ tip }}</text>
        </view>
      </view>
    </view>

    <!-- 放松练习 -->
    <view class="exercise-section">
      <view class="section-header">
        <text class="section-title">🧘 放松练习</text>
      </view>
      <view class="exercise-cards">
        <view class="exercise-card" @click="startBreathing">
          <text class="exercise-icon">🌬️</text>
          <text class="exercise-name">深呼吸</text>
          <text class="exercise-duration">60秒</text>
        </view>
        <view class="exercise-card" @click="startMindfulness">
          <text class="exercise-icon">🧠</text>
          <text class="exercise-name">正念冥想</text>
          <text class="exercise-duration">2分钟</text>
        </view>
      </view>
    </view>

    <!-- 历史记录列表 -->
    <view class="history-section">
      <view class="section-header">
        <text class="section-title">📅 历史记录</text>
        <text class="record-count">{{ store.moodRecords.length }}条</text>
      </view>
      
      <view 
        v-for="record in recentRecords" 
        :key="record.id"
        class="history-item"
        @click="viewRecord(record)"
      >
        <view class="history-emotion" :style="{backgroundColor: store.getMoodColor(record.mood)}">
          <text>{{ store.getMoodEmoji(record.mood) }}</text>
        </view>
        <view class="history-content">
          <view class="history-header">
            <text class="history-mood">{{ store.getMoodName(record.mood) }}</text>
            <text class="history-date">{{ formatShortDate(record.date) }}</text>
          </view>
          <text class="history-trigger" v-if="record.trigger">{{ record.trigger }}</text>
        </view>
        <view class="history-intensity">
          <view 
            v-for="i in 5" 
            :key="i"
            class="intensity-dot"
            :class="{filled: i <= record.intensity}"
          ></view>
        </view>
      </view>
    </view>

    <!-- 添加/编辑记录弹窗 -->
    <view v-if="showModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ isEditing ? '编辑记录' : '记录情绪' }}</text>
          <text class="modal-close" @click="closeModal">×</text>
        </view>

        <!-- 选择情绪 -->
        <view class="form-item">
          <text class="form-label">今天感觉怎么样？</text>
          <view class="mood-selector">
            <view 
              v-for="(emoji, type) in store.MOOD_EMOJIS" 
              :key="type"
              class="mood-item"
              :class="{selected: formData.mood === type}"
              :style="{borderColor: formData.mood === type ? store.getMoodColor(type) : 'transparent'}"
              @click="selectMood(type)"
            >
              <text class="mood-emoji">{{ emoji }}</text>
              <text class="mood-name">{{ store.getMoodName(type) }}</text>
            </view>
          </view>
        </view>

        <!-- 选择强度 -->
        <view class="form-item" v-if="formData.mood">
          <text class="form-label">情绪强度</text>
          <view class="intensity-selector">
            <view 
              v-for="level in 5" 
              :key="level"
              class="intensity-btn"
              :class="{selected: formData.intensity === level}"
              @click="formData.intensity = level"
            >
              <text>{{ level }}</text>
            </view>
          </view>
          <text class="intensity-hint">{{ getIntensityHint() }}</text>
        </view>

        <!-- 触发因素 -->
        <view class="form-item" v-if="formData.mood">
          <text class="form-label">触发因素（选填）</text>
          <view class="trigger-selector">
            <view 
              v-for="trigger in store.TRIGGER_OPTIONS" 
              :key="trigger"
              class="trigger-item"
              :class="{selected: formData.trigger === trigger}"
              @click="selectTrigger(trigger)"
            >
              <text>{{ trigger }}</text>
            </view>
          </view>
        </view>

        <!-- 备注 -->
        <view class="form-item" v-if="formData.mood">
          <text class="form-label">备注（选填）</text>
          <textarea 
            class="form-textarea"
            v-model="formData.note"
            placeholder="写下今天发生了什么..."
            maxlength="200"
          ></textarea>
          <text class="char-count">{{ formData.note.length }} / 200</text>
        </view>

        <!-- 调节建议预览 -->
        <view class="form-item" v-if="formData.mood && currentTips.length">
          <text class="form-label">调节建议</text>
          <view class="tips-preview">
            <text v-for="(tip, i) in currentTips" :key="i">• {{ tip }}</text>
          </view>
        </view>

        <view class="form-actions">
          <button class="btn-save" @click="saveRecord" :disabled="!formData.mood">
            {{ isEditing ? '保存' : '记录' }}
          </button>
        </view>
      </view>
    </view>

    <!-- 呼吸练习弹窗 -->
    <view v-if="showBreathingModal" class="modal-overlay" @click="closeBreathingModal">
      <view class="modal-content breathing-modal" @click.stop>
        <view class="breathing-circle" :class="breathingPhase">
          <text class="breathing-text">{{ breathingText }}</text>
          <text class="breathing-count">{{ breathingCount }}</text>
        </view>
        <text class="breathing-tip">保持呼吸节奏</text>
        <view class="breathing-progress">
          <view class="progress-bar" :style="{width: breathingProgress + '%'}"></view>
        </view>
        <button class="btn-stop" @click="stopBreathing">结束练习</button>
      </view>
    </view>

    <!-- 冥想练习弹窗 -->
    <view v-if="showMindfulnessModal" class="modal-overlay" @click="closeMindfulnessModal">
      <view class="modal-content mindfulness-modal" @click.stop>
        <text class="mindfulness-step">{{ mindfulnessStep }}</text>
        <text class="mindfulness-time">{{ mindfulnessTimeLeft }}秒</text>
        <view class="mindfulness-progress">
          <view class="progress-bar" :style="{width: mindfulnessProgress + '%'}"></view>
        </view>
        <button class="btn-stop" @click="stopMindfulness">结束练习</button>
      </view>
    </view>
  </view>
</template>

<script>
import { useMoodStore } from '@/stores/moodStore.js'

export default {
  data() {
    return {
      showModal: false,
      showBreathingModal: false,
      showMindfulnessModal: false,
      isEditing: false,
      selectedDate: new Date().toISOString().split('T')[0],
      formData: {
        mood: '',
        intensity: 3,
        trigger: '',
        note: ''
      },
      // 呼吸练习状态
      breathingPhase: 'inhale', // inhale, hold, exhale
      breathingText: '吸气',
      breathingCount: 4,
      breathingProgress: 0,
      breathingTimer: null,
      breathingCycle: 0,
      // 冥想状态
      mindfulnessStep: '',
      mindfulnessTimeLeft: 0,
      mindfulnessProgress: 0,
      mindfulnessTimer: null,
      mindfulnessIndex: 0
    }
  },
  computed: {
    store() {
      return useMoodStore()
    },
    todayRecord() {
      return this.store.todayMood
    },
    recentRecords() {
      return this.store.moodRecords.slice(0, 10)
    },
    currentTips() {
      if (!this.formData.mood) return []
      return this.store.getRegulationTips(this.formData.mood)
    }
  },
  onLoad() {
    this.store.init()
    this.selectedDate = this.store.selectedDate
  },
  onUnload() {
    this.stopBreathing()
    this.stopMindfulness()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    goToAnalytics() {
      uni.navigateTo({
        url: '/pages/mood/mood-analytics'
      })
    },
    formatDate(dateStr) {
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
    },
    formatFullDate(dateStr) {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    formatShortDate(dateStr) {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}/${date.getDate()}`
    },
    prevDay() {
      const date = new Date(this.selectedDate)
      date.setDate(date.getDate() - 1)
      this.selectedDate = date.toISOString().split('T')[0]
      this.store.setSelectedDate(this.selectedDate)
    },
    nextDay() {
      const date = new Date(this.selectedDate)
      date.setDate(date.getDate() + 1)
      this.selectedDate = date.toISOString().split('T')[0]
      this.store.setSelectedDate(this.selectedDate)
    },
    showDatePicker() {
      uni.showDatePicker({
        currentDate: this.selectedDate,
        success: (res) => {
          this.selectedDate = res.dateStr
          this.store.setSelectedDate(this.selectedDate)
        }
      })
    },
    showAddRecord() {
      this.isEditing = false
      this.formData = {
        mood: '',
        intensity: 3,
        trigger: '',
        note: ''
      }
      this.showModal = true
    },
    viewRecord(record) {
      this.isEditing = true
      this.formData = {
        mood: record.mood,
        intensity: record.intensity || 3,
        trigger: record.trigger || '',
        note: record.note || ''
      }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
    },
    selectMood(type) {
      this.formData.mood = type
    },
    selectTrigger(trigger) {
      if (this.formData.trigger === trigger) {
        this.formData.trigger = ''
      } else {
        this.formData.trigger = trigger
      }
    },
    getIntensityHint() {
      const hints = {
        1: '很轻微',
        2: '较轻',
        3: '一般',
        4: '较强',
        5: '非常强烈'
      }
      return hints[this.formData.intensity] || ''
    },
    saveRecord() {
      if (!this.formData.mood) {
        uni.showToast({ title: '请选择情绪', icon: 'none' })
        return
      }

      this.store.addMoodRecord(this.formData)
      uni.showToast({ title: '记录成功', icon: 'success' })
      this.closeModal()
    },
    
    // 呼吸练习
    startBreathing() {
      this.showBreathingModal = true
      this.breathingCycle = 0
      this.runBreathingCycle()
    },
    runBreathingCycle() {
      const exercise = this.store.getBreathingExercise()
      let count = exercise.inhale
      
      // 吸气
      this.breathingPhase = 'inhale'
      this.breathingText = '吸气'
      this.breathingCount = count
      
      const timer = setInterval(() => {
        count--
        if (count > 0) {
          this.breathingCount = count
        } else {
          clearInterval(timer)
          
          // 屏住
          count = exercise.hold
          this.breathingPhase = 'hold'
          this.breathingText = '屏住'
          this.breathingCount = count
          
          const holdTimer = setInterval(() => {
            count--
            if (count > 0) {
              this.breathingCount = count
            } else {
              clearInterval(holdTimer)
              
              // 呼气
              count = exercise.exhale
              this.breathingPhase = 'exhale'
              this.breathingText = '呼气'
              this.breathingCount = count
              
              const exhaleTimer = setInterval(() => {
                count--
                if (count > 0) {
                  this.breathingCount = count
                } else {
                  clearInterval(exhaleTimer)
                  this.breathingCycle++
                  this.breathingProgress = (this.breathingCycle / exercise.cycles) * 100
                  
                  if (this.breathingCycle < exercise.cycles) {
                    this.runBreathingCycle()
                  } else {
                    this.closeBreathingModal()
                    uni.showToast({ title: '练习完成！', icon: 'success' })
                  }
                }
              }, 1000)
            }
          }, 1000)
        }
      }, 1000)
      
      this.breathingTimer = timer
    },
    stopBreathing() {
      if (this.breathingTimer) {
        clearInterval(this.breathingTimer)
        this.breathingTimer = null
      }
      this.showBreathingModal = false
    },
    closeBreathingModal() {
      this.stopBreathing()
    },
    
    // 冥想练习
    startMindfulness() {
      this.showMindfulnessModal = true
      const guide = this.store.getMindfulnessGuide()
      this.mindfulnessIndex = 0
      this.runMindfulnessStep(guide)
    },
    runMindfulnessStep(guide) {
      if (this.mindfulnessIndex >= guide.steps.length) {
        this.closeMindfulnessModal()
        uni.showToast({ title: '冥想完成！', icon: 'success' })
        return
      }
      
      const step = guide.steps[this.mindfulnessIndex]
      this.mindfulnessStep = step.text
      this.mindfulnessTimeLeft = step.time
      
      this.mindfulnessTimer = setInterval(() => {
        this.mindfulnessTimeLeft--
        this.mindfulnessProgress = ((guide.duration - this.getRemainingTime(guide)) / guide.duration) * 100
        
        if (this.mindfulnessTimeLeft <= 0) {
          clearInterval(this.mindfulnessTimer)
          this.mindfulnessIndex++
          if (this.mindfulnessIndex < guide.steps.length) {
            this.runMindfulnessStep(guide)
          } else {
            this.closeMindfulnessModal()
            uni.showToast({ title: '冥想完成！', icon: 'success' })
          }
        }
      }, 1000)
    },
    getRemainingTime(guide) {
      let total = 0
      for (let i = this.mindfulnessIndex + 1; i < guide.steps.length; i++) {
        total += guide.steps[i].time
      }
      return total + this.mindfulnessTimeLeft
    },
    stopMindfulness() {
      if (this.mindfulnessTimer) {
        clearInterval(this.mindfulnessTimer)
        this.mindfulnessTimer = null
      }
      this.showMindfulnessModal = false
    },
    closeMindfulnessModal() {
      this.stopMindfulness()
    }
  }
}
</script>

<style scoped>
.mood-journal-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 30px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  background: linear-gradient(135deg, #8477fa 0%, #a599fa 100%);
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
  font-size: 14px;
}

.today-overview {
  padding: 16px;
}

.overview-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.today-label {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.today-date {
  font-size: 12px;
  color: #999;
}

.today-emotion {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.emotion-emoji {
  font-size: 48px;
  margin-right: 16px;
}

.emotion-info {
  flex: 1;
}

.emotion-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.intensity-stars {
  display: flex;
  gap: 4px;
}

.star {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #e0e0e0;
}

.star.filled {
  background-color: #FFD93D;
}

.journal-trigger {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

.journal-note {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
  display: block;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
}

.start-btn {
  background: linear-gradient(135deg, #8477fa 0%, #a599fa 100%);
  color: white;
  border: none;
  border-radius: 24px;
  padding: 12px 32px;
  font-size: 16px;
}

.quick-record {
  text-align: center;
  padding: 12px;
  color: #8477fa;
  font-size: 14px;
}

.tips-section, .exercise-section, .history-section {
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.record-count {
  font-size: 12px;
  color: #999;
}

.tips-list {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-icon {
  color: #8477fa;
  margin-right: 8px;
}

.tip-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.exercise-cards {
  display: flex;
  gap: 12px;
}

.exercise-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.exercise-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.exercise-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.exercise-duration {
  font-size: 12px;
  color: #999;
}

.history-section {
  padding-bottom: 30px;
}

.history-item {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
}

.history-emotion {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 20px;
}

.history-content {
  flex: 1;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-mood {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.history-date {
  font-size: 12px;
  color: #999;
}

.history-trigger {
  font-size: 12px;
  color: #999;
}

.history-intensity {
  display: flex;
  gap: 4px;
}

.intensity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e0e0e0;
}

.intensity-dot.filled {
  background-color: #FFD93D;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 20px;
  width: 100%;
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
  color: #333;
}

.modal-close {
  font-size: 24px;
  color: #999;
  padding: 4px 8px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.mood-selector {
  display: flex;
  justify-content: space-between;
}

.mood-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.mood-emoji {
  font-size: 32px;
  margin-bottom: 4px;
}

.mood-name {
  font-size: 12px;
  color: #666;
}

.mood-item.selected .mood-name {
  color: #8477fa;
  font-weight: bold;
}

.intensity-selector {
  display: flex;
  gap: 8px;
}

.intensity-btn {
  flex: 1;
  padding: 12px;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #666;
}

.intensity-btn.selected {
  background: #8477fa;
  color: white;
}

.intensity-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: center;
}

.trigger-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.trigger-item {
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 16px;
  font-size: 12px;
  color: #666;
}

.trigger-item.selected {
  background: #e8e4ff;
  color: #8477fa;
}

.form-textarea {
  width: 100%;
  height: 100px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  box-sizing: border-box;
}

.char-count {
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 4px;
}

.tips-preview {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  color: #666;
}

.tips-preview text {
  display: block;
  margin-bottom: 4px;
}

.form-actions {
  margin-top: 20px;
}

.btn-save {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #8477fa 0%, #a599fa 100%);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: bold;
}

.btn-save:disabled {
  background: #ccc;
}

/* 呼吸练习弹窗 */
.breathing-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.breathing-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8477fa 0%, #a599fa 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  transition: transform 1s ease;
}

.breathing-circle.inhale {
  transform: scale(1.2);
}

.breathing-circle.hold {
  transform: scale(1.2);
}

.breathing-circle.exhale {
  transform: scale(1);
}

.breathing-text {
  font-size: 20px;
  color: white;
  font-weight: bold;
}

.breathing-count {
  font-size: 48px;
  color: white;
  font-weight: bold;
}

.breathing-tip {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

.breathing-progress {
  width: 200px;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 24px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #8477fa 0%, #a599fa 100%);
  transition: width 0.3s;
}

.btn-stop {
  padding: 12px 32px;
  background: white;
  border: 2px solid #8477fa;
  color: #8477fa;
  border-radius: 24px;
  font-size: 14px;
}

/* 冥想弹窗 */
.mindfulness-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.mindfulness-step {
  font-size: 24px;
  color: #333;
  margin-bottom: 16px;
  line-height: 1.5;
}

.mindfulness-time {
  font-size: 48px;
  font-weight: bold;
  color: #8477fa;
  margin-bottom: 24px;
}

.mindfulness-progress {
  width: 200px;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 24px;
}
</style>
