<!-- 档案封面编辑 -->
<template>
  <view class="page-container">
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">编辑封面</text>
      <view class="nav-right" @tap="saveCover">
        <text class="save-btn">保存</text>
      </view>
    </view>

    <!-- 封面预览 -->
    <view class="cover-preview">
      <view class="preview-bg" :style="previewStyle">
        <text class="preview-icon">📁</text>
        <text class="preview-title">{{ coverData.title || '我的成长档案' }}</text>
      </view>
    </view>

    <!-- 封面设置 -->
    <view class="form-content">
      <!-- 封面图片 -->
      <view class="form-item">
        <text class="form-label">封面图片</text>
        <view class="image-upload" @tap="chooseImage">
          <image v-if="coverData.coverImage" :src="coverData.coverImage" mode="aspectFill" class="preview-image"></image>
          <view v-else class="upload-placeholder">
            <text class="upload-icon">🖼️</text>
            <text class="upload-text">点击上传封面图片</text>
          </view>
        </view>
      </view>

      <!-- 档案标题 -->
      <view class="form-item">
        <text class="form-label">档案标题</text>
        <input class="form-input" v-model="coverData.title" placeholder="例如：乐乐的成长档案" />
      </view>

      <!-- 预设封面 -->
      <view class="form-item">
        <text class="form-label">或选择预设封面</text>
        <view class="preset-grid">
          <view 
            class="preset-item" 
            v-for="preset in presets" 
            :key="preset.id"
            :style="{ background: preset.gradient }"
            @tap="applyPreset(preset)"
          >
            <text class="preset-icon">{{ preset.icon }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import { useGrowthPortfolioStore } from '@/stores/growthPortfolioStore.js'

export default {
  setup() {
    const store = useGrowthPortfolioStore()
    
    const presets = [
      { id: 1, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '📁' },
      { id: 2, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: '🎨' },
      { id: 3, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: '🌊' },
      { id: 4, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', icon: '🌿' },
      { id: 5, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', icon: '☀️' },
      { id: 6, gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', icon: '🌸' }
    ]
    
    const coverData = ref({
      coverImage: store.currentPortfolio?.coverImage || '',
      title: store.currentPortfolio?.title || '我的成长档案'
    })

    const previewStyle = computed(() => {
      if (coverData.value.coverImage) {
        return { backgroundImage: `url(${coverData.value.coverImage})` }
      }
      return { background: presets[0].gradient }
    })

    const goBack = () => uni.navigateBack()

    const chooseImage = () => {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          coverData.value.coverImage = res.tempFilePaths[0]
        }
      })
    }

    const applyPreset = (preset) => {
      coverData.value.coverImage = ''
      coverData.value.gradient = preset.gradient
    }

    const saveCover = () => {
      store.updateCover(coverData.value.coverImage, coverData.value.title)
      uni.showToast({ title: '封面已更新', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 1000)
    }

    return {
      presets,
      coverData,
      previewStyle,
      goBack,
      chooseImage,
      applyPreset,
      saveCover
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

.cover-preview {
  margin: 32rpx;
  border-radius: 24rpx;
  overflow: hidden;
  height: 300rpx;
}

.preview-bg {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
}

.preview-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.preview-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.form-content {
  padding: 0 32rpx 32rpx;
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

.image-upload {
  width: 100%;
  height: 300rpx;
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

.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.preset-item {
  height: 140rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preset-icon {
  font-size: 56rpx;
}
</style>
