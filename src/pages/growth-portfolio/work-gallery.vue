<!-- 作品集管理 -->
<template>
  <view class="page-container">
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">作品集</text>
      <view class="nav-right" @tap="addNewWork">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view 
        class="filter-item" 
        :class="{ active: selectedType === null }"
        @tap="selectedType = null"
      >
        全部
      </view>
      <view 
        class="filter-item" 
        v-for="type in workTypes" 
        :key="type.id"
        :class="{ active: selectedType === type.id }"
        @tap="selectedType = type.id"
      >
        {{ type.icon }} {{ type.name }}
      </view>
    </view>

    <!-- 作品列表 -->
    <view class="works-grid" v-if="filteredWorks.length > 0">
      <view class="work-item" v-for="work in filteredWorks" :key="work.id" @tap="viewWork(work)">
        <image class="work-image" :src="work.thumbnail || '/static/default-work.png'" mode="aspectFill"></image>
        <view class="work-info">
          <text class="work-title">{{ work.title }}</text>
          <text class="work-meta">{{ work.typeName }} · {{ formatDate(work.createdAt) }}</text>
        </view>
        <view class="work-actions" @tap.stop="showWorkActions(work)">
          <text class="action-icon">⋮</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <text class="empty-icon">🎨</text>
      <text class="empty-text">还没有作品</text>
      <text class="empty-hint">点击右上角添加第一件作品</text>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useGrowthPortfolioStore } from '@/stores/growthPortfolioStore.js'
import { WORK_TYPES } from '@/services/growthPortfolioService.js'

export default {
  setup() {
    const store = useGrowthPortfolioStore()
    const selectedType = ref(null)

    const workTypes = Object.values(WORK_TYPES)

    onMounted(() => {
      if (!store.currentBabyId) {
        uni.navigateBack()
      }
    })

    const filteredWorks = computed(() => {
      if (!selectedType.value) return store.works
      return store.works.filter(w => w.type === selectedType.value)
    })

    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }

    const goBack = () => uni.navigateBack()

    const addNewWork = () => {
      uni.navigateTo({ url: '/pages/growth-portfolio/add-work' })
    }

    const viewWork = (work) => {
      uni.navigateTo({ url: `/pages/growth-portfolio/work-detail?workId=${work.id}` })
    }

    const showWorkActions = (work) => {
      uni.showActionSheet({
        itemList: ['编辑', '删除'],
        success: (res) => {
          if (res.tapIndex === 0) {
            uni.navigateTo({ url: `/pages/growth-portfolio/edit-work?workId=${work.id}` })
          } else if (res.tapIndex === 1) {
            confirmDelete(work)
          }
        }
      })
    }

    const confirmDelete = (work) => {
      uni.showModal({
        title: '删除作品',
        content: '确定要删除这个作品吗？',
        success: (res) => {
          if (res.confirm) {
            store.removeWork(work.id)
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
    }

    return {
      selectedType,
      workTypes,
      filteredWorks,
      formatDate,
      goBack,
      addNewWork,
      viewWork,
      showWorkActions
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

.nav-right .icon {
  color: #667eea;
}

.filter-bar {
  display: flex;
  padding: 20rpx 32rpx;
  background: #fff;
  overflow-x: auto;
  white-space: nowrap;
}

.filter-item {
  padding: 12rpx 24rpx;
  margin-right: 16rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #666;
  background: #f5f5f5;
}

.filter-item.active {
  background: #667eea;
  color: #fff;
}

.works-grid {
  padding: 32rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.work-item {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
}

.work-image {
  width: 100%;
  height: 300rpx;
  background: #eee;
}

.work-info {
  padding: 16rpx;
}

.work-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.work-meta {
  font-size: 22rpx;
  color: #999;
}

.work-actions {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 50rpx;
  height: 50rpx;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon {
  font-size: 32rpx;
  color: #666;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
}
</style>
