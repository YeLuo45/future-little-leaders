<template>
  <view class="chronicle-page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">📜 家庭大事记</text>
      <text class="subtitle">记录家庭重要时刻与回忆</text>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ active: currentTab === 'timeline' }"
        @click="currentTab = 'timeline'"
      >
        <text class="tab-icon">📅</text>
        <text class="tab-text">时间线</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'yearbook' }"
        @click="openYearBook"
      >
        <text class="tab-icon">📖</text>
        <text class="tab-text">年鉴</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'add' }"
        @click="openAddModal"
      >
        <text class="tab-icon">➕</text>
        <text class="tab-text">记录</text>
      </view>
    </view>

    <!-- 年份选择器 -->
    <view class="year-selector">
      <scroll-view scroll-x class="year-scroll">
        <view
          v-for="year in availableYears"
          :key="year"
          class="year-chip"
          :class="{ active: selectedYear === year }"
          @click="selectedYear = year"
        >
          <text class="year-text">{{ year }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 时间线视图 -->
    <view class="timeline-section" v-if="currentTab === 'timeline'">
      <view
        v-for="(chronicles, month) in groupedChronicles"
        :key="month"
        class="month-group"
      >
        <view class="month-header">
          <text class="month-label">{{ month }}</text>
        </view>

        <view
          v-for="chronicle in chronicles"
          :key="chronicle.id"
          class="chronicle-item"
          :class="{ major: chronicle.impact === 'major' }"
          @click="viewChronicle(chronicle)"
        >
          <view class="chronicle-date">
            <text class="day">{{ new Date(chronicle.eventDate).getDate() }}</text>
            <text class="weekday">{{ getWeekday(chronicle.eventDate) }}</text>
          </view>

          <view class="chronicle-content">
            <view class="chronicle-header">
              <text class="chronicle-icon">{{ getCategoryIcon(chronicle.category) }}</text>
              <text class="chronicle-title">{{ chronicle.title }}</text>
              <view class="impact-badge" v-if="chronicle.impact === 'major'">
                <text>重要</text>
              </view>
            </view>
            <text class="chronicle-desc" v-if="chronicle.description">
              {{ chronicle.description }}
            </text>
            <view class="chronicle-meta">
              <text class="meta-item" v-if="chronicle.location">
                📍 {{ chronicle.location }}
              </text>
              <text class="meta-item" v-if="chronicle.participants?.length">
                👨‍👩‍👧‍👦 {{ chronicle.participants.join(', ') }}
              </text>
            </view>
            <view class="chronicle-tags" v-if="chronicle.photos?.length">
              <text class="tag">📷 {{ chronicle.photos.length }}张照片</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="memoryStore.chronicles.length === 0">
        <text class="empty-icon">📜</text>
        <text class="empty-text">还没有大事记</text>
        <text class="empty-hint">记录家庭的第一个重要时刻吧</text>
      </view>
    </view>

    <!-- 添加大事记弹窗 -->
    <view class="add-modal" v-if="showAddModal" @click="closeAddModal">
      <view class="add-content" @click.stop>
        <text class="modal-title">记录大事记</text>

        <view class="form-item">
          <text class="form-label">标题</text>
          <input
            class="form-input"
            v-model="form.title"
            placeholder="输入事件标题"
          />
        </view>

        <view class="form-item">
          <text class="form-label">描述</text>
          <textarea
            class="form-textarea"
            v-model="form.description"
            placeholder="描述这个重要时刻"
          />
        </view>

        <view class="form-item">
          <text class="form-label">日期</text>
          <picker
            mode="date"
            :value="formDate"
            @change="onDateChange"
          >
            <view class="picker-value">
              {{ formDate || '选择日期' }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">类别</text>
          <view class="category-grid">
            <view
              v-for="cat in CHRONICLE_CATEGORIES"
              :key="cat.key"
              class="category-item"
              :class="{ active: form.category === cat.key }"
              @click="form.category = cat.key"
            >
              <text class="category-icon">{{ cat.icon }}</text>
              <text class="category-name">{{ cat.name }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">重要程度</text>
          <view class="impact-selector">
            <view
              v-for="impact in IMPACT_OPTIONS"
              :key="impact.key"
              class="impact-item"
              :class="{ active: form.impact === impact.key }"
              @click="form.impact = impact.key"
            >
              <text class="impact-icon">{{ impact.icon }}</text>
              <text class="impact-name">{{ impact.name }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">地点（可选）</text>
          <input
            class="form-input"
            v-model="form.location"
            placeholder="输入地点"
          />
        </view>

        <view class="form-item">
          <text class="form-label">参与成员（逗号分隔）</text>
          <input
            class="form-input"
            v-model="participantsInput"
            placeholder="如：爸爸,妈妈,宝宝"
          />
        </view>

        <view class="form-actions">
          <view class="cancel-btn" @click="closeAddModal">取消</view>
          <view class="submit-btn" @click="submitChronicle">保存</view>
        </view>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <view class="detail-modal" v-if="selectedChronicle" @click="closeDetail">
      <view class="detail-content" @click.stop>
        <view class="detail-header">
          <text class="detail-icon">{{ getCategoryIcon(selectedChronicle.category) }}</text>
          <text class="detail-title">{{ selectedChronicle.title }}</text>
          <text class="detail-date">{{ formatDate(selectedChronicle.eventDate) }}</text>
          <view class="impact-badge major" v-if="selectedChronicle.impact === 'major'">
            <text>重要事件</text>
          </view>
        </view>

        <view class="detail-body">
          <text class="detail-desc" v-if="selectedChronicle.description">
            {{ selectedChronicle.description }}
          </text>

          <view class="detail-meta" v-if="selectedChronicle.location || selectedChronicle.participants?.length">
            <text class="meta-item" v-if="selectedChronicle.location">
              📍 {{ selectedChronicle.location }}
            </text>
            <text class="meta-item" v-if="selectedChronicle.participants?.length">
              👨‍👩‍👧‍👦 {{ selectedChronicle.participants.join(', ') }}
            </text>
          </view>
        </view>

        <view class="detail-actions">
          <view class="action-btn" @click="shareChronicle">
            <text>📤 分享</text>
          </view>
          <view class="action-btn" @click="editChronicleDetail">
            <text>✏️ 编辑</text>
          </view>
          <view class="action-btn delete" @click="confirmDeleteChronicle">
            <text>🗑️ 删除</text>
          </view>
        </view>

        <view class="close-btn" @click="closeDetail">✕</view>
      </view>
    </view>

    <!-- 年鉴弹窗 -->
    <view class="yearbook-modal" v-if="showYearBookModal" @click="closeYearBook">
      <view class="yearbook-content" @click.stop>
        <view class="yearbook-header">
          <text class="yearbook-title">{{ yearBookData.year }} 年家庭年鉴</text>
          <text class="yearbook-subtitle">年度回顾</text>
        </view>

        <view class="yearbook-stats">
          <view class="stat-item">
            <text class="stat-value">{{ yearBookData.chronicleCount || 0 }}</text>
            <text class="stat-label">大事记</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ yearBookData.photoCount || 0 }}</text>
            <text class="stat-label">照片</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ yearBookData.milestoneCount || 0 }}</text>
            <text class="stat-label">里程碑</text>
          </view>
        </view>

        <view class="yearbook-section">
          <text class="section-title">年度大事件</text>
          <view
            v-for="chronicle in yearBookData.chronicles"
            :key="chronicle.id"
            class="yearbook-item"
            @click="viewChronicle(chronicle)"
          >
            <text class="item-date">{{ formatDateShort(chronicle.eventDate) }}</text>
            <text class="item-icon">{{ getCategoryIcon(chronicle.category) }}</text>
            <text class="item-title">{{ chronicle.title }}</text>
          </view>
          <view class="empty-mini" v-if="!yearBookData.chronicles?.length">
            <text>暂无记录</text>
          </view>
        </view>

        <view class="close-btn" @click="closeYearBook">✕</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMemoryStore } from '../../stores/memoryStore.js'
import { CHRONICLE_CATEGORIES } from '../../services/memoryService.js'
import { exportChronicleAsText } from '../../services/memoryService.js'

const memoryStore = useMemoryStore()

// 常量
const IMPACT_OPTIONS = [
  { key: 'major', name: '重要', icon: '⭐' },
  { key: 'normal', name: '普通', icon: '📝' },
  { key: 'minor', name: '小事', icon: '💫' }
]

// 当前 Tab
const currentTab = ref('timeline')

// 弹窗状态
const showAddModal = ref(false)
const showYearBookModal = ref(false)
const selectedChronicle = ref(null)

// 选中年份
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)

const availableYears = computed(() => {
  const years = new Set([currentYear])
  memoryStore.chronicles.forEach(c => {
    years.add(new Date(c.eventDate).getFullYear())
  })
  return Array.from(years).sort((a, b) => b - a)
})

// 表单
const form = ref({
  title: '',
  description: '',
  eventDate: new Date().toISOString(),
  category: 'other',
  impact: 'normal',
  location: '',
  participants: []
})

const formDate = ref('')
const participantsInput = ref('')

// 年鉴数据
const yearBookData = ref({})

// ========== 计算属性 ==========

const yearChronicles = computed(() => {
  return memoryStore.getYearChronicles(selectedYear.value)
})

const groupedChronicles = computed(() => {
  const grouped = {}
  yearChronicles.value.forEach(chronicle => {
    const date = new Date(chronicle.eventDate)
    const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`
    if (!grouped[monthKey]) grouped[monthKey] = []
    grouped[monthKey].push(chronicle)
  })
  return grouped
})

// ========== 方法 ==========

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

const formatDateShort = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const getWeekday = (dateStr) => {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return '周' + weekdays[new Date(dateStr).getDay()]
}

const getCategoryIcon = (category) => {
  const cat = CHRONICLE_CATEGORIES.find(c => c.key === category)
  return cat?.icon || '📝'
}

const onDateChange = (e) => {
  formDate.value = e.detail.value
  form.value.eventDate = new Date(e.detail.value).toISOString()
}

const openAddModal = () => {
  form.value = {
    title: '',
    description: '',
    eventDate: new Date().toISOString(),
    category: 'other',
    impact: 'normal',
    location: '',
    participants: []
  }
  formDate.value = ''
  participantsInput.value = ''
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}

const submitChronicle = () => {
  if (!form.value.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }

  const participants = participantsInput.value
    ? participantsInput.value.split(',').map(p => p.trim()).filter(p => p)
    : []

  memoryStore.recordChronicle({
    title: form.value.title,
    description: form.value.description,
    eventDate: form.value.eventDate,
    category: form.value.category,
    impact: form.value.impact,
    location: form.value.location,
    participants
  })

  uni.showToast({ title: '保存成功', icon: 'success' })
  closeAddModal()
  currentTab.value = 'timeline'
}

const viewChronicle = (chronicle) => {
  selectedChronicle.value = chronicle
}

const closeDetail = () => {
  selectedChronicle.value = null
}

const editChronicleDetail = () => {
  uni.showToast({ title: '编辑功能开发中', icon: 'none' })
}

const confirmDeleteChronicle = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条大事记吗？',
    success: (res) => {
      if (res.confirm) {
        memoryStore.removeChronicle(selectedChronicle.value.id)
        closeDetail()
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

const shareChronicle = () => {
  const text = exportChronicleAsText(selectedChronicle.value)
  // 模拟分享
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
    }
  })
}

const openYearBook = () => {
  yearBookData.value = memoryStore.generateYearBook(selectedYear.value)
  showYearBookModal.value = true
}

const closeYearBook = () => {
  showYearBookModal.value = false
}

// 初始化
memoryStore.init()
</script>

<style scoped>
.chronicle-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.header {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  padding: 40rpx 30rpx;
  color: #fff;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
}

.subtitle {
  font-size: 26rpx;
  opacity: 0.9;
  margin-top: 10rpx;
  display: block;
}

.tab-bar {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
}

.tab-icon {
  font-size: 40rpx;
  display: block;
}

.tab-text {
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
}

.tab-item.active .tab-text {
  color: #fa709a;
  font-weight: bold;
}

/* 年份选择器 */
.year-selector {
  background: #fff;
  padding: 20rpx 0;
}

.year-scroll {
  white-space: nowrap;
  padding: 0 20rpx;
}

.year-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100rpx;
  height: 60rpx;
  margin-right: 16rpx;
  border-radius: 30rpx;
  background: #f5f5f5;
}

.year-chip.active {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.year-chip.active .year-text {
  color: #fff;
  font-weight: bold;
}

.year-text {
  font-size: 28rpx;
  color: #666;
}

/* 时间线 */
.month-group {
  margin-bottom: 30rpx;
}

.month-header {
  padding: 16rpx 30rpx;
  background: rgba(250, 112, 154, 0.1);
}

.month-label {
  font-size: 28rpx;
  color: #fa709a;
  font-weight: bold;
}

.chronicle-item {
  display: flex;
  background: #fff;
  margin: 0 20rpx 16rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
}

.chronicle-item.major {
  border-left: 6rpx solid #fa709a;
}

.chronicle-date {
  width: 100rpx;
  padding: 20rpx;
  text-align: center;
  background: #fafafa;
}

.chronicle-item.major .chronicle-date {
  background: rgba(250, 112, 154, 0.1);
}

.day {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.weekday {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-top: 4rpx;
}

.chronicle-content {
  flex: 1;
  padding: 20rpx;
}

.chronicle-header {
  display: flex;
  align-items: center;
}

.chronicle-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.chronicle-title {
  font-size: 30rpx;
  font-weight: bold;
  flex: 1;
}

.impact-badge {
  font-size: 20rpx;
  color: #fa709a;
  background: rgba(250, 112, 154, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.chronicle-desc {
  font-size: 26rpx;
  color: #666;
  margin-top: 12rpx;
  line-height: 1.5;
  display: block;
}

.chronicle-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 12rpx;
}

.meta-item {
  font-size: 24rpx;
  color: #999;
}

.chronicle-tags {
  margin-top: 12rpx;
}

.tag {
  font-size: 24rpx;
  color: #fa709a;
  background: rgba(250, 112, 154, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  display: block;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  display: block;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
  margin-top: 16rpx;
  display: block;
}

/* 添加弹窗 */
.add-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.add-content {
  width: 100%;
  max-height: 85vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 30rpx;
  overflow-y: auto;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  display: block;
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.form-textarea {
  width: 100%;
  height: 120rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.picker-value {
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  font-size: 28rpx;
  background: #fff;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
}

.category-item {
  text-align: center;
  padding: 16rpx 8rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
}

.category-item.active {
  border-color: #fa709a;
  background: rgba(250, 112, 154, 0.1);
}

.category-icon {
  font-size: 36rpx;
  display: block;
}

.category-name {
  font-size: 22rpx;
  margin-top: 6rpx;
  display: block;
}

.impact-selector {
  display: flex;
  gap: 16rpx;
}

.impact-item {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
}

.impact-item.active {
  border-color: #fa709a;
  background: rgba(250, 112, 154, 0.1);
}

.impact-icon {
  font-size: 32rpx;
  display: block;
}

.impact-name {
  font-size: 24rpx;
  margin-top: 6rpx;
  display: block;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 44rpx;
  font-size: 32rpx;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.submit-btn {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
}

/* 详情弹窗 */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-content {
  width: 90%;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  position: relative;
}

.detail-header {
  text-align: center;
}

.detail-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 16rpx;
}

.detail-title {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}

.detail-date {
  font-size: 28rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
}

.impact-badge.major {
  display: inline-block;
  margin-top: 12rpx;
}

.detail-body {
  margin-top: 30rpx;
}

.detail-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  display: block;
}

.detail-meta {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.detail-meta .meta-item {
  font-size: 26rpx;
  color: #999;
}

.detail-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 30rpx;
}

.action-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 26rpx;
}

.action-btn.delete {
  background: #ffeaea;
  color: #e54d4d;
}

.close-btn {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 60rpx;
  height: 60rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

/* 年鉴弹窗 */
.yearbook-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.yearbook-content {
  width: 90%;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  overflow-y: auto;
  position: relative;
}

.yearbook-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.yearbook-title {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}

.yearbook-subtitle {
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.yearbook-stats {
  display: flex;
  justify-content: space-around;
  padding: 30rpx 0;
  background: #fafafa;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #fa709a;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.yearbook-section {
  margin-top: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
}

.yearbook-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.yearbook-item:last-child {
  border-bottom: none;
}

.item-date {
  font-size: 24rpx;
  color: #999;
  width: 80rpx;
}

.item-icon {
  font-size: 28rpx;
  margin: 0 12rpx;
}

.item-title {
  font-size: 28rpx;
  flex: 1;
}

.empty-mini {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 26rpx;
}
</style>
