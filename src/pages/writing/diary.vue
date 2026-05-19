<template>
  <view class="diary-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>日记本</text>
      </view>
      <view class="header-right">
        <text class="icon" @click="showCalendar">📅</text>
      </view>
    </view>

    <!-- 日期选择 -->
    <view class="date-selector">
      <view class="date-nav" @click="prevDay">
        <text>◀</text>
      </view>
      <view class="date-display">
        <text class="date-main">{{ formatDateMain(selectedDate) }}</text>
        <text class="date-week">{{ formatWeekDay(selectedDate) }}</text>
      </view>
      <view class="date-nav" @click="nextDay">
        <text>▶</text>
      </view>
    </view>

    <!-- 天气心情 -->
    <view class="mood-weather-bar">
      <view class="weather-selector">
        <text class="selector-label">天气</text>
        <view class="selector-options">
          <text
            v-for="w in weatherOptions"
            :key="w.value"
            class="option"
            :class="{ active: diaryForm.weather === w.value }"
            @click="diaryForm.weather = w.value"
          >{{ w.emoji }}</text>
        </view>
      </view>
      <view class="mood-selector">
        <text class="selector-label">心情</text>
        <view class="selector-options">
          <text
            v-for="m in moodOptions"
            :key="m.value"
            class="option"
            :class="{ active: diaryForm.mood === m.value }"
            @click="diaryForm.mood = m.value"
          >{{ m.emoji }}</text>
        </view>
      </view>
    </view>

    <!-- 日记内容 -->
    <view class="diary-content">
      <input
        v-model="diaryForm.title"
        class="diary-title-input"
        placeholder="给今天起个标题..."
      />
      <textarea
        v-model="diaryForm.content"
        class="diary-textarea"
        placeholder="今天发生了什么有趣的事情？"
      />
      <view class="word-count">
        <text>{{ diaryForm.content.length }} 字</text>
      </view>
    </view>

    <!-- 写作提示 -->
    <view v-if="currentPrompt" class="prompt-section" @click="refreshPrompt">
      <text class="prompt-icon">{{ currentPrompt.emoji }}</text>
      <text class="prompt-text">{{ currentPrompt.content }}</text>
    </view>

    <!-- 保存按钮 -->
    <view class="action-bar">
      <button class="btn-save" @click="saveDiary">保存日记</button>
    </view>

    <!-- 历史日记列表 -->
    <view class="history-section">
      <view class="section-header">
        <text class="section-title">最近日记</text>
      </view>
      <scroll-view class="history-list" scroll-x>
        <view
          v-for="diary in recentDiaries"
          :key="diary.id"
          class="history-item"
          @click="loadDiary(diary)"
        >
          <text class="history-date">{{ formatDateShort(diary.date) }}</text>
          <text class="history-weather">{{ getWeatherEmoji(diary.weather) }}</text>
          <text class="history-mood">{{ getMoodEmoji(diary.mood) }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { useWritingStore } from '@/stores/writingStore'

export default {
  data() {
    return {
      selectedDate: new Date().toISOString().split('T')[0],
      editingDiaryId: null,
      diaryForm: {
        title: '',
        content: '',
        weather: 'sunny',
        mood: 'happy'
      },
      weatherOptions: [
        { value: 'sunny', emoji: '☀️' },
        { value: 'cloudy', emoji: '⛅' },
        { value: 'rainy', emoji: '🌧️' },
        { value: 'snowy', emoji: '❄️' },
        { value: 'windy', emoji: '💨' }
      ],
      moodOptions: [
        { value: 'happy', emoji: '😊' },
        { value: 'excited', emoji: '🤩' },
        { value: 'calm', emoji: '😌' },
        { value: 'worried', emoji: '😟' },
        { value: 'sad', emoji: '😢' },
        { value: 'angry', emoji: '😠' }
      ],
      currentPrompt: null
    }
  },
  computed: {
    diaries() {
      return this.writingStore.diaries
    },
    recentDiaries() {
      return this.diaries.slice(0, 14)
    },
    writingStore() {
      return useWritingStore()
    }
  },
  onLoad() {
    this.writingStore.init()
    this.checkTodayDiary()
    this.refreshPrompt()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    showCalendar() {
      uni.showDatePicker({
        currentDate: this.selectedDate,
        success: (res) => {
          this.selectedDate = res.dateStr
          this.checkTodayDiary()
        }
      })
    },
    prevDay() {
      const date = new Date(this.selectedDate)
      date.setDate(date.getDate() - 1)
      this.selectedDate = date.toISOString().split('T')[0]
      this.checkTodayDiary()
    },
    nextDay() {
      const date = new Date(this.selectedDate)
      date.setDate(date.getDate() + 1)
      this.selectedDate = date.toISOString().split('T')[0]
      this.checkTodayDiary()
    },
    formatDateMain(dateStr) {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}月${date.getDate()}日`
    },
    formatWeekDay(dateStr) {
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const date = new Date(dateStr)
      return days[date.getDay()]
    },
    formatDateShort(dateStr) {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}/${date.getDate()}`
    },
    checkTodayDiary() {
      const existing = this.writingStore.getDiaryByDate(this.selectedDate)
      if (existing) {
        this.editingDiaryId = existing.id
        this.diaryForm = {
          title: existing.title || '',
          content: existing.content || '',
          weather: existing.weather || 'sunny',
          mood: existing.mood || 'happy'
        }
      } else {
        this.editingDiaryId = null
        this.diaryForm = {
          title: '',
          content: '',
          weather: 'sunny',
          mood: 'happy'
        }
      }
    },
    loadDiary(diary) {
      this.selectedDate = diary.date
      this.editingDiaryId = diary.id
      this.diaryForm = {
        title: diary.title || '',
        content: diary.content || '',
        weather: diary.weather || 'sunny',
        mood: diary.mood || 'happy'
      }
    },
    refreshPrompt() {
      this.currentPrompt = this.writingStore.getRandomPrompt('diary')
    },
    getWeatherEmoji(weather) {
      const w = this.weatherOptions.find(item => item.value === weather)
      return w ? w.emoji : '☀️'
    },
    getMoodEmoji(mood) {
      const m = this.moodOptions.find(item => item.value === mood)
      return m ? m.emoji : '😊'
    },
    saveDiary() {
      if (!this.diaryForm.content.trim() && !this.diaryForm.title.trim()) {
        uni.showToast({ title: '请输入日记内容', icon: 'none' })
        return
      }
      
      const data = {
        ...this.diaryForm,
        date: this.selectedDate
      }
      
      if (this.editingDiaryId) {
        this.writingStore.updateDiary(this.editingDiaryId, data)
        uni.showToast({ title: '日记已更新', icon: 'success' })
      } else {
        const diary = this.writingStore.createDiary(data)
        this.editingDiaryId = diary.id
        uni.showToast({ title: '日记已保存', icon: 'success' })
      }
    }
  }
}
</script>

<style scoped>
.diary-page {
  min-height: 100vh;
  background-color: #fef9f3;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  background-color: #fd79a8;
  color: white;
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
  padding: 20px;
  background-color: white;
}

.date-nav {
  padding: 8px 16px;
  color: #fd79a8;
  font-size: 14px;
}

.date-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
}

.date-main {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.date-week {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.mood-weather-bar {
  display: flex;
  padding: 16px;
  background-color: white;
  margin-top: 1px;
}

.weather-selector, .mood-selector {
  flex: 1;
}

.selector-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.selector-options {
  display: flex;
  gap: 8px;
}

.option {
  font-size: 24px;
  opacity: 0.5;
  cursor: pointer;
}

.option.active {
  opacity: 1;
  transform: scale(1.2);
}

.diary-content {
  padding: 16px;
  background-color: white;
  margin-top: 8px;
}

.diary-title-input {
  width: 100%;
  height: 48px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  border: none;
  margin-bottom: 12px;
}

.diary-title-input::placeholder {
  color: #ccc;
}

.diary-textarea {
  width: 100%;
  min-height: 200px;
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  border: none;
}

.diary-textarea::placeholder {
  color: #ccc;
}

.word-count {
  text-align: right;
  font-size: 12px;
  color: #ccc;
  margin-top: 8px;
}

.prompt-section {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #fff0f5;
  margin: 8px 16px;
  border-radius: 12px;
}

.prompt-icon {
  font-size: 24px;
  margin-right: 12px;
}

.prompt-text {
  flex: 1;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.action-bar {
  padding: 16px;
}

.btn-save {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 16px;
}

.history-section {
  padding: 16px;
}

.section-header {
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #666;
}

.history-list {
  display: flex;
  white-space: nowrap;
}

.history-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  border-radius: 12px;
  margin-right: 12px;
}

.history-date {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.history-weather, .history-mood {
  font-size: 18px;
  margin: 2px 0;
}
</style>
