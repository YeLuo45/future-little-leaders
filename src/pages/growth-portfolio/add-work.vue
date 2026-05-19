<!-- 添加作品 -->
<template>
  <view class="page-container">
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">添加作品</text>
      <view class="nav-right" @tap="saveWork">
        <text class="save-btn">保存</text>
      </view>
    </view>

    <view class="form-content">
      <!-- 作品图片 -->
      <view class="form-item">
        <text class="form-label">作品图片</text>
        <view class="image-upload" @tap="chooseImage">
          <image v-if="workData.thumbnail" :src="workData.thumbnail" mode="aspectFill" class="preview-image"></image>
          <view v-else class="upload-placeholder">
            <text class="upload-icon">📷</text>
            <text class="upload-text">点击上传图片</text>
          </view>
        </view>
      </view>

      <!-- 作品标题 -->
      <view class="form-item">
        <text class="form-label">作品标题 *</text>
        <input class="form-input" v-model="workData.title" placeholder="请输入作品标题" />
      </view>

      <!-- 作品类型 -->
      <view class="form-item">
        <text class="form-label">作品类型 *</text>
        <view class="type-selector">
          <view 
            class="type-item" 
            v-for="type in workTypes" 
            :key="type.id"
            :class="{ active: workData.type === type.id }"
            @tap="workData.type = type.id"
          >
            <text class="type-icon">{{ type.icon }}</text>
            <text class="type-name">{{ type.name }}</text>
          </view>
        </view>
      </view>

      <!-- 作品描述 -->
      <view class="form-item">
        <text class="form-label">作品描述</text>
        <textarea class="form-textarea" v-model="workData.description" placeholder="描述一下这个作品..." rows="4"></textarea>
      </view>

      <!-- 创作日期 -->
      <view class="form-item">
        <text class="form-label">创作日期</text>
        <picker mode="date" @change="onDateChange">
          <view class="form-input date-picker">
            <text>{{ workData.date || '选择日期' }}</text>
          </view>
        </picker>
      </view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'
import { useGrowthPortfolioStore } from '@/stores/growthPortfolioStore.js'
import { WORK_TYPES } from '@/services/growthPortfolioService.js'

export default {
  setup() {
    const store = useGrowthPortfolioStore()
    const workTypes = Object.values(WORK_TYPES)
    
    const workData = ref({
      title: '',
      type: 'drawing',
      thumbnail: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    })

    const goBack = () => uni.navigateBack()

    const chooseImage = () => {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          workData.value.thumbnail = res.tempFilePaths[0]
        }
      })
    }

    const onDateChange = (e) => {
      workData.value.date = e.detail.value
    }

    const saveWork = () => {
      if (!workData.value.title) {
        uni.showToast({ title: '请输入作品标题', icon: 'none' })
        return
      }
      
      const typeInfo = workTypes.find(t => t.id === workData.value.type)
      const work = store.addWork({
        ...workData.value,
        typeName: typeInfo?.name || workData.value.type
      })
      
      if (work) {
        uni.showToast({ title: '作品已添加', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 1000)
      }
    }

    return {
      workTypes,
      workData,
      goBack,
      chooseImage,
      onDateChange,
      saveWork
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

.image-upload {
  width: 100%;
  height: 400rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.upload-text {
  font-size: 28rpx;
  color: #999;
}

.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  min-width: 120rpx;
}

.type-item.active {
  background: #667eea;
}

.type-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.type-name {
  font-size: 24rpx;
  color: #666;
}

.type-item.active .type-name {
  color: #fff;
}
</style>
