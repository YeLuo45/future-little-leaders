<!-- 知识树学习页面 -->
<template>
  <view class="learning-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">{{ nodeInfo?.name || '学习' }}</text>
      <view class="nav-right"></view>
    </view>

    <!-- 学习内容区 -->
    <scroll-view scroll-y class="learning-content">
      <!-- 节点信息 -->
      <view class="node-header" :style="{ background: 'linear-gradient(135deg, ' + treeColor + ' 0%, ' + treeColor + '99 100%)' }">
        <view class="node-icon">
          <text>{{ treeIcon }}</text>
        </view>
        <view class="node-info">
          <text class="node-name">{{ nodeInfo?.name }}</text>
          <text class="node-meta">难度: {{ nodeInfo?.difficulty }} | 积分: {{ nodeInfo?.points }}</text>
        </view>
        <view class="progress-badge">
          <text>{{ progress }}%</text>
        </view>
      </view>

      <!-- 进度条 -->
      <view class="progress-section">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress + '%', background: treeColor }"></view>
        </view>
        <view class="progress-status">
          <text v-if="progress >= 100">🎉 已完成!</text>
          <text v-else>学习中...</text>
        </view>
      </view>

      <!-- 学习资源 -->
      <view class="resources-section">
        <text class="section-title">学习资源</text>
        <view class="resource-list">
          <view 
            v-for="(resource, idx) in learningContent?.resources" 
            :key="idx"
            class="resource-item"
            :class="{ completed: completedResources.includes(idx) }"
            @tap="playResource(resource, idx)"
          >
            <view class="resource-icon">
              <text v-if="resource.type === 'video'">🎬</text>
              <text v-else-if="resource.type === 'game'">🎮</text>
              <text v-else>📝</text>
            </view>
            <view class="resource-info">
              <text class="resource-title">{{ resource.title }}</text>
              <text class="resource-duration">{{ resource.duration }}分钟</text>
            </view>
            <view class="resource-status">
              <text v-if="completedResources.includes(idx)" class="completed-text">✓</text>
              <text v-else class="arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 完成学习按钮 -->
      <view class="complete-section">
        <button 
          class="complete-btn" 
          :class="{ disabled: progress < 100 }"
          @tap="completeLearning"
        >
          <text v-if="progress >= 100">🎉 完成学习</text>
          <text v-else>完成全部学习后领取</text>
        </button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useKnowledgeTreeStore } from '@/stores/knowledgeTreeStore.js'
import { getNodeLearningContent } from '@/services/knowledgeTreeService.js'

const store = useKnowledgeTreeStore()

const nodeId = ref('')
const treeId = ref('')
const completedResources = ref([])
const currentResource = ref(null)

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  
  nodeId.value = options.nodeId || ''
  treeId.value = options.treeId || ''
  
  store.init()
  store.selectTree(treeId.value)
  
  // 恢复已完成的资源
  const details = store.getNodeDetails(nodeId.value)
  if (details?.progress > 0) {
    // 根据进度计算已完成的资源数
    const content = getNodeLearningContent(nodeId.value)
    const total = content?.resources?.length || 0
    const completed = Math.floor((details.progress / 100) * total)
    completedResources.value = Array.from({ length: completed }, (_, i) => i)
  }
})

const nodeInfo = computed(() => {
  return store.currentTreeNodes.find(n => n.id === nodeId.value) || null
})

const treeColor = computed(() => {
  return store.currentTree?.color || '#4A90D9'
})

const treeIcon = computed(() => {
  return store.currentTree?.icon || '📚'
})

const learningContent = computed(() => {
  return getNodeLearningContent(nodeId.value)
})

const progress = computed(() => {
  const details = store.getNodeDetails(nodeId.value)
  if (!details) return 0
  if (details.status === 'completed') return 100
  return details.progress || 0
})

const playResource = (resource, idx) => {
  // 模拟播放资源
  uni.showLoading({ title: '加载中...' })
  
  setTimeout(() => {
    uni.hideLoading()
    
    // 标记资源完成
    if (!completedResources.value.includes(idx)) {
      completedResources.value.push(idx)
      
      // 更新进度
      const content = getNodeLearningContent(nodeId.value)
      const total = content?.resources?.length || 1
      const newProgress = Math.round(((completedResources.value.length) / total) * 100)
      store.updateNodeProgress(nodeId.value, newProgress)
    }
    
    uni.showToast({ title: '资源已看完', icon: 'success' })
  }, 1500)
}

const completeLearning = () => {
  if (progress.value < 100) {
    uni.showToast({ title: '请先完成所有学习资源', icon: 'none' })
    return
  }
  
  store.completeNode(nodeId.value)
  
  uni.showModal({
    title: '🎉 恭喜完成!',
    content: `你已完成 "${nodeInfo.value?.name}" 的学习，获得 ${nodeInfo.value?.points} 积分！`,
    showCancel: false,
    success: () => {
      uni.navigateBack()
    }
  })
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.learning-page {
  min-height: 100vh;
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #E5E7EB;
}

.nav-left, .nav-right {
  width: 80rpx;
}

.icon {
  font-size: 40rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1F2937;
}

.learning-content {
  flex: 1;
}

/* 节点头部 */
.node-header {
  padding: 40rpx 32rpx;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.node-icon {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255,255,255,0.2);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52rpx;
}

.node-info {
  flex: 1;
}

.node-name {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.node-meta {
  font-size: 24rpx;
  opacity: 0.9;
}

.progress-badge {
  background: rgba(255,255,255,0.2);
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  font-weight: bold;
}

/* 进度条 */
.progress-section {
  padding: 32rpx;
  background: #fff;
  margin-bottom: 24rpx;
}

.progress-bar {
  height: 16rpx;
  background: #E5E7EB;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-status {
  margin-top: 12rpx;
  text-align: center;
  font-size: 24rpx;
  color: #6B7280;
}

/* 学习资源 */
.resources-section {
  padding: 0 32rpx 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 20rpx;
  display: block;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.resource-item {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 28rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
  transition: all 0.2s;
}

.resource-item.completed {
  background: #F0FDF4;
}

.resource-icon {
  width: 80rpx;
  height: 80rpx;
  background: #F3F4F6;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.resource-info {
  flex: 1;
  margin-left: 20rpx;
}

.resource-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #1F2937;
  display: block;
  margin-bottom: 4rpx;
}

.resource-duration {
  font-size: 22rpx;
  color: #9CA3AF;
}

.resource-status {
  font-size: 36rpx;
  color: #D1D5DB;
}

.completed-text {
  color: #52c41a;
  font-size: 36rpx;
  font-weight: bold;
}

/* 完成按钮 */
.complete-section {
  padding: 32rpx;
  margin-bottom: 40rpx;
}

.complete-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 48rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.complete-btn.disabled {
  background: #D1D5DB;
  color: #9CA3AF;
}
</style>
