<template>
  <view class="daily-reflection-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>每日反思</text>
      </view>
      <view class="header-right" @click="saveReflection">
        <text class="save-btn">保存</text>
      </view>
    </view>

    <!-- 日期选择 -->
    <view class="date-selector">
      <view class="date-nav" @click="prevDay">
        <text class="nav-arrow">‹</text>
      </view>
      <view class="date-display">
        <text class="date-main">{{ formatDate(selectedDate) }}</text>
        <text class="date-week">{{ formatWeek(selectedDate) }}</text>
      </view>
      <view class="date-nav" @click="nextDay">
        <text class="nav-arrow">›</text>
      </view>
    </view>

    <!-- 心情选择 -->
    <view class="mood-section">
      <text class="section-label">今日心情</text>
      <view class="mood-grid">
        <view 
          class="mood-item" 
          v-for="(info, key) in MOOD_INFO" 
          :key="key"
          :class="{ selected: formData.mood === key }"
          :style="formData.mood === key ? { background: info.color, color: '#fff' } : {}"
          @click="formData.mood = key"
        >
          <text class="mood-icon">{{ info.icon }}</text>
          <text class="mood-label">{{ info.label }}</text>
        </view>
      </view>
    </view>

    <!-- 收获 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">🌟 今日收获</text>
        <text class="section-add" @click="addItem('harvests')">+ 添加</text>
      </view>
      <view class="item-list">
        <view 
          class="item-row" 
          v-for="(item, index) in formData.harvests" 
          :key="index"
        >
          <input 
            class="item-input" 
            v-model="formData.harvests[index]" 
            placeholder="今天学到了什么？"
          />
          <text class="item-delete" @click="removeItem('harvests', index)">×</text>
        </view>
        <view class="empty-hint" v-if="formData.harvests.length === 0" @click="addItem('harvests')">
          点击添加收获
        </view>
      </view>
    </view>

    <!-- 不足 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">📝 可以改进</text>
        <text class="section-add" @click="addItem('improvements')">+ 添加</text>
      </view>
      <view class="item-list">
        <view 
          class="item-row" 
          v-for="(item, index) in formData.improvements" 
          :key="index"
        >
          <input 
            class="item-input" 
            v-model="formData.improvements[index]" 
            placeholder="有什么可以做得更好？"
          />
          <text class="item-delete" @click="removeItem('improvements', index)">×</text>
        </view>
        <view class="empty-hint" v-if="formData.improvements.length === 0" @click="addItem('improvements')">
          点击添加改进点
        </view>
      </view>
    </view>

    <!-- 感恩 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">🙏 感恩记录</text>
        <text class="section-add" @click="addItem('gratitudes')">+ 添加</text>
      </view>
      <view class="item-list">
        <view 
          class="item-row" 
          v-for="(item, index) in formData.gratitudes" 
          :key="index"
        >
          <input 
            class="item-input" 
            v-model="formData.gratitudes[index]" 
            placeholder="今天想感谢谁？"
          />
          <text class="item-delete" @click="removeItem('gratitudes', index)">×</text>
        </view>
        <view class="empty-hint" v-if="formData.gratitudes.length === 0" @click="addItem('gratitudes')">
          点击添加感恩
        </view>
      </view>
    </view>

    <!-- 明日目标 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">🎯 明日目标</text>
        <text class="section-add" @click="addItem('goals')">+ 添加</text>
      </view>
      <view class="item-list">
        <view 
          class="item-row" 
          v-for="(item, index) in formData.goals" 
          :key="index"
        >
          <input 
            class="item-input" 
            v-model="formData.goals[index]" 
            placeholder="明天想完成什么？"
          />
          <text class="item-delete" @click="removeItem('goals', index)">×</text>
        </view>
        <view class="empty-hint" v-if="formData.goals.length === 0" @click="addItem('goals')">
          点击添加目标
        </view>
      </view>
    </view>

    <!-- 自由书写 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">💭 自由书写</text>
      </view>
      <textarea 
        class="free-textarea" 
        v-model="formData.content" 
        placeholder="今天还有什么想记录的..."
        :rows="4"
      ></textarea>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useGrowthJournalStore } from '@/stores/growthJournalStore.js'
import growthJournalService, { MOOD_INFO, MOOD_TYPE } from '@/services/growthJournalService.js'

const growthJournalStore = useGrowthJournalStore()

// 当前日期
const today = new Date().toISOString().split('T')[0]
const selectedDate = ref(today)

// 表单数据
const formData = reactive({
  mood: MOOD_TYPE.CALM,
  harvests: [],
  improvements: [],
  gratitudes: [],
  goals: [],
  content: ''
})

// 加载已有数据
onMounted(() => {
  growthJournalStore.init()
  
  // 获取URL参数中的日期
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const dateParam = currentPage.options?.date
  
  if (dateParam) {
    selectedDate.value = dateParam
  }
  
  loadReflection()
})

// 加载指定日期的反思
const loadReflection = () => {
  const existing = growthJournalStore.getReflectionByDate(selectedDate.value)
  if (existing) {
    formData.mood = existing.mood || MOOD_TYPE.CALM
    formData.harvests = [...(existing.harvests || [])]
    formData.improvements = [...(existing.improvements || [])]
    formData.gratitudes = [...(existing.gratitudes || [])]
    formData.goals = [...(existing.goals || [])]
    formData.content = existing.content || ''
  } else {
    formData.mood = MOOD_TYPE.CALM
    formData.harvests = []
    formData.improvements = []
    formData.gratitudes = []
    formData.goals = []
    formData.content = ''
  }
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 日期导航
const prevDay = () => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() - 1)
  selectedDate.value = date.toISOString().split('T')[0]
  loadReflection()
}

const nextDay = () => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + 1)
  const maxDate = new Date().toISOString().split('T')[0]
  if (selectedDate.value < maxDate) {
    selectedDate.value = date.toISOString().split('T')[0]
    loadReflection()
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

const formatWeek = (dateStr) => {
  const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const date = new Date(dateStr)
  return weeks[date.getDay()]
}

// 添加项目
const addItem = (field) => {
  formData[field].push('')
}

// 移除项目
const removeItem = (field, index) => {
  formData[field].splice(index, 1)
}

// 保存反思
const saveReflection = () => {
  // 过滤空项
  const data = {
    date: selectedDate.value,
    mood: formData.mood,
    harvests: formData.harvests.filter(h => h.trim()),
    improvements: formData.improvements.filter(i => i.trim()),
    gratitudes: formData.gratitudes.filter(g => g.trim()),
    goals: formData.goals.filter(g => g.trim()),
    content: formData.content
  }
  
  growthJournalStore.saveDailyReflection(data)
  
  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })
}
</script>

<style scoped>
.daily-reflection-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 30px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px 20px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.save-btn {
  background: rgba(255,255,255,0.2);
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 14px;
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 15px;
  margin-bottom: 10px;
}

.date-nav {
  padding: 10px 20px;
}

.nav-arrow {
  font-size: 24px;
  color: #667eea;
}

.date-display {
  text-align: center;
  min-width: 120px;
}

.date-main {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.date-week {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.mood-section {
  background: #fff;
  margin: 0 15px 10px;
  border-radius: 12px;
  padding: 15px;
}

.section-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.mood-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 5px;
  background: #f5f5f5;
  border-radius: 8px;
  transition: all 0.2s;
}

.mood-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.mood-label {
  font-size: 11px;
  color: #666;
}

.mood-item.selected .mood-label {
  color: #fff;
}

.section {
  background: #fff;
  margin: 0 15px 10px;
  border-radius: 12px;
  padding: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.section-add {
  font-size: 13px;
  color: #667eea;
}

.item-list {
  min-height: 50px;
}

.item-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.item-input {
  flex: 1;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  color: #333;
}

.item-delete {
  font-size: 20px;
  color: #ff4d4f;
  padding: 5px 10px;
  margin-left: 5px;
}

.empty-hint {
  text-align: center;
  color: #ccc;
  font-size: 13px;
  padding: 15px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #ddd;
}

.free-textarea {
  width: 100%;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
}
</style>
