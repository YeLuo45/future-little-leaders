<!-- 添加时间线事件 -->
<template>
  <view class="page-container">
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">记录成长</text>
      <view class="nav-right" @tap="saveEvent">
        <text class="save-btn">保存</text>
      </view>
    </view>

    <view class="form-content">
      <!-- 选择图标 -->
      <view class="form-item">
        <text class="form-label">选择图标</text>
        <view class="icon-selector">
          <view 
            class="icon-item" 
            v-for="icon in iconOptions" 
            :key="icon"
            :class="{ active: eventData.icon === icon }"
            @tap="eventData.icon = icon"
          >
            <text>{{ icon }}</text>
          </view>
        </view>
      </view>

      <!-- 事件标题 -->
      <view class="form-item">
        <text class="form-label">事件标题 *</text>
        <input class="form-input" v-model="eventData.title" placeholder="例如：学会骑自行车" />
      </view>

      <!-- 事件日期 -->
      <view class="form-item">
        <text class="form-label">发生日期 *</text>
        <picker mode="date" @change="onDateChange">
          <view class="form-input date-picker">
            <text>{{ eventData.date || '选择日期' }}</text>
          </view>
        </picker>
      </view>

      <!-- 事件描述 -->
      <view class="form-item">
        <text class="form-label">详细描述</text>
        <textarea class="form-textarea" v-model="eventData.description" placeholder="记录下这个重要时刻的细节..." rows="4"></textarea>
      </view>

      <!-- 标签 -->
      <view class="form-item">
        <text class="form-label">标签（可选）</text>
        <view class="tag-input">
          <view class="tag-list">
            <view class="tag-item" v-for="(tag, index) in eventData.tags" :key="index">
              <text>{{ tag }}</text>
              <text class="tag-close" @tap="removeTag(index)">×</text>
            </view>
          </view>
          <input class="tag-add-input" v-model="newTag" placeholder="添加标签" @confirm="addTag" />
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
    
    const iconOptions = ['📝', '🏆', '⭐', '🌟', '🎉', '🎊', '🎈', '👶', '🚶', '🎂', '🎁', '📚', '🎨', '⚽', '🎵']
    const newTag = ref('')
    
    const eventData = ref({
      title: '',
      icon: '⭐',
      date: new Date().toISOString().split('T')[0],
      description: '',
      tags: []
    })

    const goBack = () => uni.navigateBack()

    const onDateChange = (e) => {
      eventData.value.date = e.detail.value
    }

    const addTag = () => {
      if (newTag.value && !eventData.value.tags.includes(newTag.value)) {
        eventData.value.tags.push(newTag.value)
        newTag.value = ''
      }
    }

    const removeTag = (index) => {
      eventData.value.tags.splice(index, 1)
    }

    const saveEvent = () => {
      if (!eventData.value.title) {
        uni.showToast({ title: '请输入事件标题', icon: 'none' })
        return
      }
      
      const event = store.addEvent(eventData.value)
      
      if (event) {
        uni.showToast({ title: '已记录', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 1000)
      }
    }

    return {
      iconOptions,
      eventData,
      newTag,
      goBack,
      onDateChange,
      addTag,
      removeTag,
      saveEvent
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

.tag-input {
  background: #fff;
  border-radius: 12rpx;
  padding: 16rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.tag-item {
  display: flex;
  align-items: center;
  background: rgba(102, 126, 234, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #667eea;
}

.tag-close {
  margin-left: 8rpx;
  font-size: 28rpx;
}

.tag-add-input {
  font-size: 28rpx;
  color: #999;
}
</style>
