<!-- 作品详情 -->
<template>
  <view class="page-container">
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">作品详情</text>
      <view class="nav-right" @tap="showActions">
        <text class="icon">⋮</text>
      </view>
    </view>

    <!-- 作品图片 -->
    <image class="work-image" :src="work?.thumbnail || '/static/default-work.png'" mode="widthFix"></image>

    <!-- 作品信息 -->
    <view class="work-info">
      <view class="info-header">
        <text class="work-title">{{ work?.title || '无标题' }}</text>
        <view class="work-type-badge">
          <text>{{ work?.typeName || work?.type }}</text>
        </view>
      </view>
      
      <text class="work-date">{{ formatDate(work?.createdAt) }}</text>
      
      <view class="work-description" v-if="work?.description">
        <text class="desc-label">作品描述</text>
        <text class="desc-content">{{ work.description }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <view class="action-btn" @tap="addToPortfolio">
        <text class="btn-icon">📁</text>
        <text class="btn-text">添加到档案</text>
      </view>
      <view class="action-btn" @tap="shareWork">
        <text class="btn-icon">📤</text>
        <text class="btn-text">分享作品</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useGrowthPortfolioStore } from '@/stores/growthPortfolioStore.js'

export default {
  setup() {
    const store = useGrowthPortfolioStore()
    const workId = ref('')
    const work = ref(null)

    onMounted(() => {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const options = currentPage.options || currentPage.$page?.options || {}
      workId.value = options.workId
      
      if (workId.value) {
        work.value = store.works.find(w => w.id === workId.value)
      }
    })

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    }

    const goBack = () => uni.navigateBack()

    const showActions = () => {
      uni.showActionSheet({
        itemList: ['编辑', '删除'],
        success: (res) => {
          if (res.tapIndex === 0) {
            editWork()
          } else if (res.tapIndex === 1) {
            deleteWork()
          }
        }
      })
    }

    const editWork = () => {
      uni.navigateTo({ url: `/pages/growth-portfolio/edit-work?workId=${workId.value}` })
    }

    const deleteWork = () => {
      uni.showModal({
        title: '删除作品',
        content: '确定要删除这个作品吗？',
        success: (res) => {
          if (res.confirm) {
            store.removeWork(workId.value)
            uni.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => uni.navigateBack(), 1000)
          }
        }
      })
    }

    const addToPortfolio = () => {
      uni.showToast({ title: '已添加到档案', icon: 'success' })
    }

    const shareWork = () => {
      uni.showToast({ title: '分享功能开发中', icon: 'none' })
    }

    return {
      work,
      formatDate,
      goBack,
      showActions
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

.nav-left .icon, .nav-right .icon {
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

.work-image {
  width: 100%;
  background: #eee;
}

.work-info {
  padding: 32rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.work-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.work-type-badge {
  background: rgba(102, 126, 234, 0.1);
  padding: 8rpx 20rpx;
  border-radius: 32rpx;
}

.work-type-badge text {
  font-size: 24rpx;
  color: #667eea;
}

.work-date {
  font-size: 26rpx;
  color: #999;
  display: block;
  margin-bottom: 24rpx;
}

.work-description {
  border-top: 1px solid #f0f0f0;
  padding-top: 24rpx;
}

.desc-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.desc-content {
  font-size: 30rpx;
  color: #333;
  display: block;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  padding: 32rpx;
  gap: 24rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
}

.btn-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.btn-text {
  font-size: 26rpx;
  color: #666;
}
</style>
