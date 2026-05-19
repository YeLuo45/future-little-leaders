<!-- 添加里程碑 -->
<template>
  <view class="page-container">
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">添加里程碑</text>
      <view class="nav-right" @tap="saveMilestone">
        <text class="save-btn">保存</text>
      </view>
    </view>

    <view class="form-content">
      <!-- 里程碑图标 -->
      <view class="form-item">
        <text class="form-label">选择图标</text>
        <view class="icon-selector">
          <view 
            class="icon-item" 
            v-for="icon in iconOptions" 
            :key="icon"
            :class="{ active: milestoneData.icon === icon }"
            @tap="milestoneData.icon = icon"
          >
            <text>{{ icon }}</text>
          </view>
        </view>
      </view>

      <!-- 里程碑标题 -->
      <view class="form-item">
        <text class="form-label">里程碑名称 *</text>
        <input class="form-input" v-model="milestoneData.title" placeholder="例如：学会游泳" />
      </view>

      <!-- 里程碑描述 -->
      <view class="form-item">
        <text class="form-label">详细描述</text>
        <textarea class="form-textarea" v-model="milestoneData.description" placeholder="描述这个成长目标..." rows="3"></textarea>
      </view>

      <!-- 目标日期 -->
      <view class="form-item">
        <text class="form-label">目标日期</text>
        <picker mode="date" @change="onDateChange">
          <view class="form-input date-picker">
            <text>{{ milestoneData.targetDate || '选择日期' }}</text>
          </view>
        </picker>
      </view>

      <!-- 预设模板 -->
      <view class="form-item">
        <text class="form-label">快速添加</text>
        <view class="template-list">
          <view class="template-item" v-for="tpl in templates" :key="tpl.title" @tap="applyTemplate(tpl)">
            <text class="tpl-icon">{{ tpl.icon }}</text>
            <text class="tpl-title">{{ tpl.title }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'
import { useGrowthPortfolioStore } from '@/stores/growthPortfolioStore.js'

export default {
  setup() {
    const store = useGrowthPortfolioStore()
    
    const iconOptions = ['🏆', '⭐', '🎯', '🌟', '💪', '📚', '🎨', '⚽', '🎵', '🚴', '🏀', '🏊']
    
    const templates = [
      { icon: '🏊', title: '学会游泳' },
      { icon: '🚴', title: '学会骑车' },
      { icon: '📚', title: '独立阅读' },
      { icon: '🎨', title: '完成画作' },
      { icon: '💪', title: '学会轮滑' },
      { icon: '🏆', title: '获得奖状' }
    ]
    
    const milestoneData = ref({
      title: '',
      icon: '🎯',
      description: '',
      targetDate: ''
    })

    const goBack = () => uni.navigateBack()

    const onDateChange = (e) => {
      milestoneData.value.targetDate = e.detail.value
    }

    const applyTemplate = (tpl) => {
      milestoneData.value.icon = tpl.icon
      milestoneData.value.title = tpl.title
    }

    const saveMilestone = () => {
      if (!milestoneData.value.title) {
        uni.showToast({ title: '请输入里程碑名称', icon: 'none' })
        return
      }
      
      const milestone = store.addMilestoneItem(milestoneData.value)
      
      if (milestone) {
        uni.showToast({ title: '已添加', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 1000)
      }
    }

    return {
      iconOptions,
      templates,
      milestoneData,
      goBack,
      onDateChange,
      applyTemplate,
      saveMilestone
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 60px 32rpx 32rpx;
  background: #fff;
}

.nav-left .icon {
  font-size: 48rpx;
  color: #333;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.nav-right {
  width: 100rpx;
  text-align: right;
}

.save-btn {
  font-size: 32rpx;
  color: #667eea;
  font-weight: bold;
}

.form-content {
  padding: 32rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.form-input {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 30rpx;
}

.form-textarea {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 30rpx;
  width: 100%;
  box-sizing: border-box;
}

.date-picker {
  display: flex;
  align-items: center;
}

.icon-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.icon-item {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12rpx;
  font-size: 40rpx;
}

.icon-item.active {
  background: #667eea;
}

.template-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.template-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx 16rpx;
}

.tpl-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.tpl-title {
  font-size: 24rpx;
  color: #666;
}
</style>
