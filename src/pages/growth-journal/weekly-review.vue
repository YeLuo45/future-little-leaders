<template>
  <view class="weekly-review-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>周记月记</text>
      </view>
      <view class="header-right" @click="createReview">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- Tab 切换 -->
    <view class="tabs">
      <view 
        class="tab" 
        :class="{ active: activeTab === 'weekly' }"
        @click="activeTab = 'weekly'"
      >
        周记
      </view>
      <view 
        class="tab" 
        :class="{ active: activeTab === 'monthly' }"
        @click="activeTab = 'monthly'"
      >
        月记
      </view>
    </view>

    <!-- 周记列表 -->
    <view class="review-list" v-if="activeTab === 'weekly'">
      <view 
        class="review-card" 
        v-for="review in weeklyReviews" 
        :key="review.id"
        @click="editReview('weekly', review)"
      >
        <view class="review-header">
          <text class="review-period">{{ review.year }}年第{{ review.week }}周</text>
          <text class="review-date">{{ review.startDate }} ~ {{ review.endDate }}</text>
        </view>
        <view class="review-summary" v-if="review.summary">
          {{ review.summary }}
        </view>
        <view class="review-footer">
          <view class="review-stats">
            <text class="stat-item">🏆 {{ review.achievements?.length || 0 }} 成就</text>
            <text class="stat-item">🎯 {{ review.goals?.length || 0 }} 目标</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="weeklyReviews.length === 0">
        <text class="empty-icon">📅</text>
        <text class="empty-text">暂无周记</text>
        <text class="empty-hint">点击右上角 + 写第一篇周记</text>
      </view>
    </view>

    <!-- 月记列表 -->
    <view class="review-list" v-if="activeTab === 'monthly'">
      <view 
        class="review-card" 
        v-for="review in monthlyReviews" 
        :key="review.id"
        @click="editReview('monthly', review)"
      >
        <view class="review-header">
          <text class="review-period">{{ review.year }}年{{ review.month }}月</text>
        </view>
        <view class="review-summary" v-if="review.summary">
          {{ review.summary }}
        </view>
        <view class="review-footer">
          <view class="review-stats">
            <text class="stat-item">🏆 {{ review.achievements?.length || 0 }} 成就</text>
            <text class="stat-item">🎯 {{ review.goals?.length || 0 }} 目标</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="monthlyReviews.length === 0">
        <text class="empty-icon">📆</text>
        <text class="empty-text">暂无月记</text>
        <text class="empty-hint">点击右上角 + 写第一篇月记</text>
      </view>
    </view>

    <!-- 编辑弹窗 -->
    <view class="dialog-overlay" v-if="showDialog" @click="closeDialog">
      <view class="dialog" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">{{ isEditing ? '编辑' : '新建' }}{{ dialogType === 'weekly' ? '周记' : '月记' }}</text>
          <text class="dialog-close" @click="closeDialog">×</text>
        </view>
        <view class="dialog-body">
          <!-- 周记编辑 -->
          <template v-if="dialogType === 'weekly'">
            <view class="form-row">
              <view class="form-item">
                <text class="form-label">年份</text>
                <input class="form-input" type="number" v-model="editForm.year" placeholder="2024" />
              </view>
              <view class="form-item">
                <text class="form-label">周数</text>
                <input class="form-input" type="number" v-model="editForm.week" placeholder="1" />
              </view>
            </view>
            <view class="form-row">
              <view class="form-item">
                <text class="form-label">开始日期</text>
                <input class="form-input" v-model="editForm.startDate" placeholder="YYYY-MM-DD" />
              </view>
              <view class="form-item">
                <text class="form-label">结束日期</text>
                <input class="form-input" v-model="editForm.endDate" placeholder="YYYY-MM-DD" />
              </view>
            </view>
          </template>

          <!-- 月记编辑 -->
          <template v-if="dialogType === 'monthly'">
            <view class="form-row">
              <view class="form-item">
                <text class="form-label">年份</text>
                <input class="form-input" type="number" v-model="editForm.year" placeholder="2024" />
              </view>
              <view class="form-item">
                <text class="form-label">月份</text>
                <input class="form-input" type="number" v-model="editForm.month" placeholder="1" />
              </view>
            </view>
          </template>

          <!-- 总结 -->
          <view class="form-item">
            <text class="form-label">本周/本月总结</text>
            <textarea class="form-textarea" v-model="editForm.summary" placeholder="回顾一下..." :rows="3" />
          </view>

          <!-- 成就 -->
          <view class="form-item">
            <view class="form-label-row">
              <text class="form-label">成就</text>
              <text class="form-add" @click="addAchievement">+ 添加</text>
            </view>
            <view class="tag-list">
              <view 
                class="tag-item" 
                v-for="(item, index) in editForm.achievements" 
                :key="index"
              >
                <input class="tag-input" v-model="editForm.achievements[index]" />
                <text class="tag-delete" @click="removeAchievement(index)">×</text>
              </view>
            </view>
          </view>

          <!-- 挑战 -->
          <view class="form-item">
            <view class="form-label-row">
              <text class="form-label">挑战</text>
              <text class="form-add" @click="addChallenge">+ 添加</text>
            </view>
            <view class="tag-list">
              <view 
                class="tag-item" 
                v-for="(item, index) in editForm.challenges" 
                :key="index"
              >
                <input class="tag-input" v-model="editForm.challenges[index]" />
                <text class="tag-delete" @click="removeChallenge(index)">×</text>
              </view>
            </view>
          </view>

          <!-- 目标 -->
          <view class="form-item">
            <view class="form-label-row">
              <text class="form-label">下期目标</text>
              <text class="form-add" @click="addGoal">+ 添加</text>
            </view>
            <view class="tag-list">
              <view 
                class="tag-item" 
                v-for="(item, index) in editForm.goals" 
                :key="index"
              >
                <input class="tag-input" v-model="editForm.goals[index]" />
                <text class="tag-delete" @click="removeGoal(index)">×</text>
              </view>
            </view>
          </view>

          <!-- 成长分析 -->
          <view class="form-item">
            <text class="form-label">成长分析</text>
            <textarea class="form-textarea" v-model="editForm.growthAnalysis" placeholder="分析一下这期间的成长..." :rows="3" />
          </view>

          <view class="dialog-footer">
            <button class="btn-cancel" @click="closeDialog">取消</button>
            <button class="btn-save" @click="saveReview">保存</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useGrowthJournalStore } from '@/stores/growthJournalStore.js'

const growthJournalStore = useGrowthJournalStore()

// Tab状态
const activeTab = ref('weekly')

// 周记月记数据
const weeklyReviews = computed(() => growthJournalStore.weeklyReviews)
const monthlyReviews = computed(() => growthJournalStore.monthlyReviews)

// 编辑弹窗
const showDialog = ref(false)
const dialogType = ref('weekly')
const isEditing = ref(false)
const editingId = ref(null)

const editForm = reactive({
  year: new Date().getFullYear(),
  week: 1,
  month: new Date().getMonth() + 1,
  startDate: '',
  endDate: '',
  summary: '',
  achievements: [],
  challenges: [],
  goals: [],
  growthAnalysis: ''
})

// 初始化
onMounted(() => {
  growthJournalStore.init()
  // 设置当前周
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const diff = now - startOfYear
  const oneWeek = 604800000
  editForm.week = Math.ceil(diff / oneWeek)
})

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 创建新记录
const createReview = () => {
  isEditing.value = false
  editingId.value = null
  
  const now = new Date()
  editForm.year = now.getFullYear()
  editForm.month = now.getMonth() + 1
  editForm.summary = ''
  editForm.achievements = []
  editForm.challenges = []
  editForm.goals = []
  editForm.growthAnalysis = ''
  
  if (activeTab.value === 'weekly') {
    // 计算当前周
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const diff = now - startOfYear
    const oneWeek = 604800000
    editForm.week = Math.ceil(diff / oneWeek)
    
    // 计算周的起止日期
    const weekRange = growthJournalStore.getWeekDateRange(editForm.year, editForm.week)
    editForm.startDate = weekRange.startDate
    editForm.endDate = weekRange.endDate
    dialogType.value = 'weekly'
  } else {
    dialogType.value = 'monthly'
  }
  
  showDialog.value = true
}

// 编辑记录
const editReview = (type, review) => {
  isEditing.value = true
  editingId.value = review.id
  dialogType.value = type
  
  editForm.year = review.year
  editForm.summary = review.summary || ''
  editForm.achievements = [...(review.achievements || [])]
  editForm.challenges = [...(review.challenges || [])]
  editForm.goals = [...(review.goals || [])]
  editForm.growthAnalysis = review.growthAnalysis || ''
  
  if (type === 'weekly') {
    editForm.week = review.week
    editForm.startDate = review.startDate
    editForm.endDate = review.endDate
  } else {
    editForm.month = review.month
  }
  
  showDialog.value = true
}

// 关闭弹窗
const closeDialog = () => {
  showDialog.value = false
}

// 添加成就
const addAchievement = () => {
  editForm.achievements.push('')
}

const removeAchievement = (index) => {
  editForm.achievements.splice(index, 1)
}

// 添加挑战
const addChallenge = () => {
  editForm.challenges.push('')
}

const removeChallenge = (index) => {
  editForm.challenges.splice(index, 1)
}

// 添加目标
const addGoal = () => {
  editForm.goals.push('')
}

const removeGoal = (index) => {
  editForm.goals.splice(index, 1)
}

// 保存记录
const saveReview = () => {
  const data = {
    year: parseInt(editForm.year),
    summary: editForm.summary,
    achievements: editForm.achievements.filter(a => a.trim()),
    challenges: editForm.challenges.filter(c => c.trim()),
    goals: editForm.goals.filter(g => g.trim()),
    growthAnalysis: editForm.growthAnalysis
  }
  
  if (dialogType.value === 'weekly') {
    data.week = parseInt(editForm.week)
    data.startDate = editForm.startDate
    data.endDate = editForm.endDate
    growthJournalStore.saveWeeklyReview(data)
  } else {
    data.month = parseInt(editForm.month)
    growthJournalStore.saveMonthlyReview(data)
  }
  
  closeDialog()
  
  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })
}
</script>

<style scoped>
.weekly-review-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
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

.tabs {
  display: flex;
  background: #fff;
  padding: 0 20px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 15px 0;
  font-size: 15px;
  color: #666;
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.review-list {
  padding: 15px;
}

.review-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.review-header {
  margin-bottom: 8px;
}

.review-period {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.review-date {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.review-summary {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 10px;
}

.review-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}

.review-stats {
  display: flex;
  gap: 15px;
}

.stat-item {
  font-size: 12px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
}

.empty-icon {
  display: block;
  font-size: 48px;
  margin-bottom: 10px;
}

.empty-text {
  display: block;
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.empty-hint {
  display: block;
  font-size: 13px;
  color: #999;
}

/* 弹窗样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.dialog {
  width: 100%;
  max-height: 85vh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.dialog-close {
  font-size: 24px;
  color: #999;
}

.dialog-body {
  padding: 15px 20px;
  max-height: calc(85vh - 60px);
  overflow-y: auto;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.form-item {
  flex: 1;
  margin-bottom: 15px;
}

.form-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.form-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.form-add {
  font-size: 13px;
  color: #667eea;
}

.form-input {
  width: 100%;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  box-sizing: border-box;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  display: flex;
  align-items: center;
  background: #f0f0f0;
  border-radius: 6px;
  padding: 5px 10px;
}

.tag-input {
  width: 100px;
  font-size: 13px;
  background: transparent;
}

.tag-delete {
  color: #ff4d4f;
  margin-left: 5px;
  font-size: 16px;
}

.dialog-footer {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 15px;
  text-align: center;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-save {
  background: #667eea;
  color: #fff;
}
</style>
