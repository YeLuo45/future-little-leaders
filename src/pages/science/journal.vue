<template>
  <view class="journal-page">
    <!-- Tab切换 -->
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'records' }"
        @click="currentTab = 'records'"
      >
        实验记录
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'awards' }"
        @click="currentTab = 'awards'"
      >
        科学成就
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'ranking' }"
        @click="currentTab = 'ranking'"
      >
        排行榜
      </view>
    </view>

    <!-- 实验记录列表 -->
    <view class="records-section" v-if="currentTab === 'records'">
      <view class="section-header">
        <text class="section-title">我的实验记录</text>
        <text class="record-count">{{ journalEntries.length }}篇</text>
      </view>
      
      <view class="journal-list" v-if="journalEntries.length > 0">
        <view 
          class="journal-card" 
          v-for="entry in journalEntries" 
          :key="entry.id"
          @click="handleViewEntry(entry)"
        >
          <view class="card-header">
            <view class="exp-category" :style="{ backgroundColor: getCategoryColor(entry.category) }">
              {{ getCategoryIcon(entry.category) }}
            </view>
            <view class="entry-meta">
              <text class="entry-title">{{ entry.experimentTitle }}</text>
              <text class="entry-date">{{ formatDate(entry.completedAt) }}</text>
            </view>
          </view>
          
          <view class="observations-preview" v-if="entry.observations && entry.observations.length > 0">
            <text class="preview-label">观察记录:</text>
            <text class="preview-text">{{ entry.observations[0]?.content || '无' }}</text>
          </view>
          
          <view class="card-footer">
            <view class="points-earned">
              <text class="points-icon">⭐</text>
              <text class="points-value">+{{ entry.points || 0 }}</text>
            </view>
            <view class="action-btns">
              <button class="action-btn edit-btn" @click.stop="handleEditEntry(entry)">编辑</button>
              <button class="action-btn delete-btn" @click.stop="handleDeleteEntry(entry)">删除</button>
            </view>
          </view>
        </view>
      </view>
      
      <view class="empty-state" v-else>
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无实验记录</text>
        <text class="empty-hint">完成实验后将自动生成记录</text>
      </view>
    </view>

    <!-- 科学成就 -->
    <view class="awards-section" v-if="currentTab === 'awards'">
      <view class="awards-summary">
        <view class="summary-item">
          <text class="summary-value">{{ unlockedAwardsCount }}</text>
          <text class="summary-label">已解锁</text>
        </view>
        <view class="summary-divider"></view>
        <view class="summary-item">
          <text class="summary-value">{{ awards.length }}</text>
          <text class="summary-label">总成就数</text>
        </view>
      </view>
      
      <view class="awards-grid">
        <view 
          class="award-card" 
          v-for="award in awards" 
          :key="award.id"
          :class="{ locked: !award.isUnlocked }"
        >
          <view class="award-icon">
            <text v-if="award.isUnlocked">{{ award.icon }}</text>
            <text v-else>🔒</text>
          </view>
          <view class="award-name">{{ award.name }}</view>
          <view class="award-desc">{{ award.description }}</view>
          <view class="award-status" v-if="award.isUnlocked">
            <text class="unlocked-text">已解锁</text>
          </view>
          <view class="award-status" v-else>
            <text class="locked-text">未解锁</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 排行榜 -->
    <view class="ranking-section" v-if="currentTab === 'ranking'">
      <view class="ranking-header">
        <text class="ranking-title">🏆 科学小达人排行榜</text>
      </view>
      
      <view class="ranking-list">
        <view 
          class="ranking-item" 
          v-for="(item, index) in leaderboard" 
          :key="index"
          :class="{ topThree: index < 3 }"
        >
          <view class="rank-number">
            <text v-if="index === 0" class="medal gold">🥇</text>
            <text v-else-if="index === 1" class="medal silver">🥈</text>
            <text v-else-if="index === 2" class="medal bronze">🥉</text>
            <text v-else class="rank-text">{{ index + 1 }}</text>
          </view>
          <view class="rank-avatar">
            <text class="avatar-placeholder">{{ getAvatarPlaceholder(item.babyName) }}</text>
          </view>
          <view class="rank-info">
            <text class="rank-name">{{ item.babyName }}</text>
            <text class="rank-detail">完成{{ item.completedCount }}个实验</text>
          </view>
          <view class="rank-points">
            <text class="points-num">{{ item.points }}</text>
            <text class="points-label">积分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加/编辑记录弹窗 -->
    <view class="modal-overlay" v-if="showModal" @click="showModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ isEditing ? '编辑记录' : '添加记录' }}</text>
          <text class="modal-close" @click="showModal = false">×</text>
        </view>
        
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">实验名称</text>
            <input 
              type="text" 
              v-model="formData.experimentTitle"
              placeholder="请输入实验名称"
              class="form-input"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">观察笔记</text>
            <textarea 
              v-model="formData.observations"
              placeholder="记录你的观察和发现..."
              class="form-textarea"
              rows="4"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">实验结果</text>
            <textarea 
              v-model="formData.result"
              placeholder="记录实验结果和分析..."
              class="form-textarea"
              rows="3"
            />
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="cancel-btn" @click="showModal = false">取消</button>
          <button class="save-btn" @click="handleSaveEntry">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useScienceStore } from '@/stores/scienceStore.js'
import { SCIENCE_CATEGORIES } from '@/services/scienceService.js'

const scienceStore = useScienceStore()

const currentTab = ref('records')
const showModal = ref(false)
const isEditing = ref(false)
const currentEntryId = ref(null)

const formData = ref({
  experimentTitle: '',
  observations: '',
  result: ''
})

// 计算属性
const journalEntries = computed(() => scienceStore.journalEntries)
const awards = computed(() => scienceStore.awards)
const unlockedAwardsCount = computed(() => scienceStore.unlockedAwardsCount)
const leaderboard = computed(() => scienceStore.leaderboard)

// 分类信息
const getCategoryIcon = (category) => {
  const cat = Object.values(SCIENCE_CATEGORIES).find(c => c.id === category)
  return cat ? cat.icon : '🔬'
}

const getCategoryColor = (category) => {
  const cat = Object.values(SCIENCE_CATEGORIES).find(c => c.id === category)
  return cat ? cat.color : '#999'
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取头像占位符
const getAvatarPlaceholder = (name) => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

// 查看记录详情
const handleViewEntry = (entry) => {
  uni.showModal({
    title: entry.experimentTitle,
    content: `观察记录:\n${entry.observations?.map((o, i) => `${i + 1}. ${o.content}`).join('\n') || '无'}\n\n结果:\n${entry.result || '无'}`,
    showCancel: false
  })
}

// 编辑记录
const handleEditEntry = (entry) => {
  isEditing.value = true
  currentEntryId.value = entry.id
  formData.value = {
    experimentTitle: entry.experimentTitle || '',
    observations: entry.observations?.map(o => o.content).join('\n') || '',
    result: entry.result || ''
  }
  showModal.value = true
}

// 删除记录
const handleDeleteEntry = (entry) => {
  uni.showModal({
    title: '删除记录',
    content: '确定要删除这条实验记录吗？',
    success: (res) => {
      if (res.confirm) {
        scienceStore.removeEntry(entry.id)
        uni.showToast({ title: '删除成功', icon: 'success' })
      }
    }
  })
}

// 保存记录
const handleSaveEntry = () => {
  if (!formData.value.experimentTitle.trim()) {
    uni.showToast({ title: '请输入实验名称', icon: 'none' })
    return
  }
  
  const observations = formData.value.observations
    .split('\n')
    .filter(o => o.trim())
    .map(content => ({ content, timestamp: new Date().toISOString() }))
  
  if (isEditing.value) {
    scienceStore.updateEntry(currentEntryId.value, {
      experimentTitle: formData.value.experimentTitle,
      observations,
      result: formData.value.result
    })
    uni.showToast({ title: '更新成功', icon: 'success' })
  } else {
    scienceStore.addEntry({
      experimentTitle: formData.value.experimentTitle,
      observations,
      result: formData.value.result,
      completedAt: new Date().toISOString()
    })
    uni.showToast({ title: '添加成功', icon: 'success' })
  }
  
  showModal.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  formData.value = {
    experimentTitle: '',
    observations: '',
    result: ''
  }
  isEditing.value = false
  currentEntryId.value = null
}

// 初始化
onMounted(() => {
  scienceStore.loadJournalEntries()
  scienceStore.loadAwards()
  scienceStore.loadLeaderboard()
})
</script>

<style scoped>
.journal-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.tab-bar {
  display: flex;
  background: #fff;
  padding: 0 20rpx;
  border-bottom: 1px solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #667eea;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: #667eea;
  border-radius: 2rpx;
}

.records-section,
.awards-section,
.ranking-section {
  padding: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.record-count {
  font-size: 24rpx;
  color: #999;
}

.journal-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.journal-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.card-header {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.exp-category {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.entry-meta {
  flex: 1;
}

.entry-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.entry-date {
  font-size: 24rpx;
  color: #999;
}

.observations-preview {
  background: #f8f9fa;
  border-radius: 8rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
}

.preview-label {
  font-size: 24rpx;
  color: #667eea;
  font-weight: bold;
}

.preview-text {
  font-size: 26rpx;
  color: #666;
  margin-left: 8rpx;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1px solid #f0f0f0;
}

.points-earned {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.points-icon {
  font-size: 24rpx;
}

.points-value {
  font-size: 26rpx;
  color: #f39c12;
  font-weight: bold;
}

.action-btns {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  border: none;
}

.edit-btn {
  background: #e8f4fd;
  color: #3498db;
}

.delete-btn {
  background: #ffeaea;
  color: #e74c3c;
}

.empty-state {
  text-align: center;
  padding: 80rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #999;
}

.awards-summary {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.summary-item {
  flex: 1;
  text-align: center;
}

.summary-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}

.summary-label {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
}

.summary-divider {
  width: 2rpx;
  height: 60rpx;
  background: rgba(255,255,255,0.3);
}

.awards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.award-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
}

.award-card.locked {
  opacity: 0.6;
}

.award-icon {
  font-size: 60rpx;
  margin-bottom: 12rpx;
}

.award-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.award-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.unlocked-text {
  color: #2ecc71;
  font-size: 24rpx;
}

.locked-text {
  color: #999;
  font-size: 24rpx;
}

.ranking-header {
  margin-bottom: 20rpx;
}

.ranking-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.ranking-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
}

.ranking-item.topThree {
  background: linear-gradient(135deg, #fff5e6 0%, #fff 100%);
}

.rank-number {
  width: 60rpx;
  text-align: center;
}

.medal {
  font-size: 40rpx;
}

.rank-text {
  font-size: 28rpx;
  color: #999;
  font-weight: bold;
}

.rank-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.avatar-placeholder {
  font-size: 28rpx;
  color: #fff;
  font-weight: bold;
}

.rank-info {
  flex: 1;
}

.rank-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.rank-detail {
  font-size: 24rpx;
  color: #999;
}

.rank-points {
  text-align: right;
}

.points-num {
  font-size: 32rpx;
  font-weight: bold;
  color: #667eea;
  display: block;
}

.points-label {
  font-size: 22rpx;
  color: #999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.modal-content {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 48rpx;
  color: #999;
}

.modal-body {
  padding: 24rpx;
  max-height: 50vh;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 72rpx;
  padding: 0 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
  border-top: 1px solid #eee;
}

.cancel-btn,
.save-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}

.cancel-btn {
  background: #e0e0e0;
  color: #666;
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
</style>
