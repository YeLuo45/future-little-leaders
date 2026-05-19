<!-- 添加特别日页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">创建特别日</text>
      <view class="nav-right" @tap="saveSpecialDay">
        <text class="save-text">保存</text>
      </view>
    </view>

    <!-- 表单内容 -->
    <view class="form-section">
      <!-- 特别日名称 -->
      <view class="form-item">
        <text class="form-label">特别日名称</text>
        <input 
          class="form-input" 
          v-model="formData.name"
          placeholder="例如：我的生日、期中考试日"
          maxlength="20"
        />
      </view>

      <!-- 特别日类型 -->
      <view class="form-item">
        <text class="form-label">特别日类型</text>
        <view class="type-selector">
          <view 
            v-for="(type, key) in SPECIAL_DAY_TYPES" 
            :key="key"
            class="type-option"
            :class="{ selected: formData.type === key }"
            @tap="selectType(key)"
          >
            <text class="type-icon">{{ type.icon }}</text>
            <text class="type-name">{{ type.name }}</text>
          </view>
        </view>
      </view>

      <!-- 日期选择 -->
      <view class="form-item">
        <text class="form-label">日期</text>
        <picker mode="date" :value="formData.date" @change="onDateChange">
          <view class="date-display">
            <text class="date-text">{{ formData.date || '请选择日期' }}</text>
            <text class="date-arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 描述 -->
      <view class="form-item">
        <text class="form-label">描述（可选）</text>
        <textarea 
          class="form-textarea" 
          v-model="formData.description"
          placeholder="添加一些备注或祝福..."
          maxlength="100"
        />
      </view>
    </view>

    <!-- 快捷日期 -->
    <view class="quick-dates-section">
      <text class="section-title">📅 快捷选择</text>
      <view class="quick-dates">
        <view 
          v-for="qd in quickDates" 
          :key="qd.label"
          class="quick-date-item"
          @tap="selectQuickDate(qd)"
        >
          <text class="qd-icon">{{ qd.icon }}</text>
          <text class="qd-label">{{ qd.label }}</text>
        </view>
      </view>
    </view>

    <!-- 特别日预览 -->
    <view class="preview-section" v-if="formData.name">
      <text class="section-title">👀 预览</text>
      <view class="preview-card">
        <text class="preview-icon">{{ selectedTypeIcon }}</text>
        <view class="preview-info">
          <text class="preview-name">{{ formData.name }}</text>
          <text class="preview-date" v-if="formData.date">{{ formatPreviewDate }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import { useDailyCeremoniesStore } from '@/stores/dailyCeremoniesStore.js'
import { SPECIAL_DAY_TYPES } from '@/services/dailyCeremoniesService.js'

export default {
  setup() {
    const store = useDailyCeremoniesStore()

    const formData = ref({
      name: '',
      type: 'milestone',
      date: '',
      description: ''
    })

    const quickDates = ref([
      { icon: '🎂', label: '明天生日', days: 1 },
      { icon: '🎄', label: '圣诞节', date: '2026-12-25' },
      { icon: '🎆', label: '元旦', date: '2027-01-01' },
      { icon: '🏆', label: '期末考试', date: '' },
      { icon: '⭐', label: '自定义', days: null }
    ])

    const selectedTypeIcon = computed(() => {
      return SPECIAL_DAY_TYPES[formData.value.type]?.icon || '⭐'
    })

    const formatPreviewDate = computed(() => {
      if (!formData.value.date) return ''
      const date = new Date(formData.value.date)
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}月${day}日`
    })

    const selectType = (type) => {
      formData.value.type = type
    }

    const onDateChange = (e) => {
      formData.value.date = e.detail.value
    }

    const selectQuickDate = (qd) => {
      if (qd.days !== null && qd.days !== undefined) {
        const date = new Date()
        date.setDate(date.getDate() + qd.days)
        formData.value.date = date.toISOString().split('T')[0]
      } else if (qd.date) {
        formData.value.date = qd.date
      }
    }

    const saveSpecialDay = () => {
      if (!formData.value.name.trim()) {
        uni.showToast({ title: '请输入特别日名称', icon: 'none' })
        return
      }
      if (!formData.value.date) {
        uni.showToast({ title: '请选择日期', icon: 'none' })
        return
      }

      store.addSpecialDay(
        formData.value.name.trim(),
        formData.value.type,
        formData.value.date,
        formData.value.description.trim()
      )

      uni.showToast({ title: '创建成功！', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }

    const goBack = () => {
      uni.navigateBack()
    }

    return {
      SPECIAL_DAY_TYPES,
      formData,
      quickDates,
      selectedTypeIcon,
      formatPreviewDate,
      selectType,
      onDateChange,
      selectQuickDate,
      saveSpecialDay,
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

.nav-left .icon {
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
  width: 80rpx;
  text-align: center;
}

.save-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: bold;
}

.form-section {
  margin: 0 32rpx 32rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.form-item {
  margin-bottom: 28rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 26rpx;
  font-weight: bold;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.type-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
}

.type-option {
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx 8rpx;
  text-align: center;
  border: 3rpx solid transparent;
  transition: all 0.2s;
}

.type-option.selected {
  background: #fff;
  border-color: #ff9a9e;
  box-shadow: 0 2rpx 12rpx rgba(255, 154, 158, 0.3);
}

.type-icon {
  font-size: 36rpx;
  display: block;
  margin-bottom: 6rpx;
}

.type-name {
  font-size: 22rpx;
  color: #666;
}

.type-option.selected .type-name {
  color: #ff6b6b;
  font-weight: bold;
}

.date-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 24rpx 20rpx;
}

.date-text {
  font-size: 28rpx;
  color: #333;
}

.date-arrow {
  font-size: 36rpx;
  color: #999;
}

.quick-dates-section {
  margin: 0 32rpx 32rpx;
}

.section-title {
  font-size: 26rpx;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16rpx;
  display: block;
}

.quick-dates {
  display: flex;
  gap: 16rpx;
  overflow-x: auto;
  padding-bottom: 8rpx;
}

.quick-date-item {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.qd-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.qd-label {
  font-size: 24rpx;
  color: #666;
}

.preview-section {
  margin: 0 32rpx;
}

.preview-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.preview-icon {
  font-size: 56rpx;
  margin-right: 20rpx;
}

.preview-info {
  flex: 1;
}

.preview-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.preview-date {
  font-size: 24rpx;
  color: #999;
}
</style>
