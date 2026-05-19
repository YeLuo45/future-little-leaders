<!-- 知识树首页 - 显示所有学科知识树 -->
<template>
  <view class="knowledge-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">知识树</text>
      <view class="nav-right" @tap="goToStats">
        <text class="icon">📊</text>
      </view>
    </view>

    <!-- 总体进度卡片 -->
    <view class="overall-progress-card" :style="{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }">
      <view class="progress-info">
        <text class="progress-label">总体进度</text>
        <view class="progress-main">
          <text class="progress-percent">{{ store.totalProgress.percent }}%</text>
          <text class="progress-detail">已解锁 {{ store.totalProgress.completed }}/{{ store.totalProgress.total }} 节点</text>
        </view>
      </view>
      <view class="progress-circle">
        <view class="circle-bg"></view>
        <view class="circle-fill" :style="{ width: store.totalProgress.percent + '%' }"></view>
      </view>
    </view>

    <!-- 学科选择标签 -->
    <scroll-view scroll-x class="subject-tabs">
      <view class="tab-list">
        <view 
          v-for="tree in store.knowledgeTrees" 
          :key="tree.id"
          class="tab-item"
          :class="{ active: currentTreeId === tree.id }"
          :style="currentTreeId === tree.id ? { borderBottomColor: tree.color } : {}"
          @tap="selectTree(tree.id)"
        >
          <text class="tab-icon">{{ tree.icon }}</text>
          <text class="tab-name">{{ tree.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 知识树内容 -->
    <scroll-view scroll-y class="tree-content" @scroll="onScroll">
      <!-- 当前学科进度 -->
      <view class="current-tree-header">
        <view class="tree-info">
          <text class="tree-icon">{{ currentTree?.icon }}</text>
          <view class="tree-detail">
            <text class="tree-name">{{ currentTree?.name }}</text>
            <text class="tree-desc">{{ currentTree?.description }}</text>
          </view>
        </view>
        <view class="tree-progress-badge" :style="{ background: currentTree?.color + '20', color: currentTree?.color }">
          {{ getTreeProgress(currentTree.id).percent }}%
        </view>
      </view>

      <!-- 知识树可视化 -->
      <view class="tree-visualization">
        <KnowledgeTreeCanvas
          :nodes="currentTreeNodes"
          :treeColor="currentTree?.color || '#4A90D9'"
          :width="700"
          :height="canvasHeight"
          :getNodeStatus="getNodeStatus"
          :getNodeProgress="getNodeProgress"
          @nodeTap="onNodeTap"
        />
      </view>

      <!-- 节点详情提示 -->
      <view class="node-hint" v-if="selectedNode">
        <view class="hint-header">
          <text class="hint-icon">{{ currentTree?.icon }}</text>
          <text class="hint-title">{{ selectedNode.name }}</text>
        </view>
        <text class="hint-desc">{{ getNodeHintDesc(selectedNode) }}</text>
        <view class="hint-actions">
          <button class="hint-btn primary" @tap="startLearning(selectedNode)">
            {{ getNodeBtnText(selectedNode) }}
          </button>
          <button class="hint-btn secondary" @tap="selectedNode = null">关闭</button>
        </view>
      </view>

      <!-- 学习推荐 -->
      <view class="recommendations-section">
        <text class="section-title">推荐学习</text>
        <view class="recommend-list">
          <view 
            v-for="node in recommendedNodes" 
            :key="node.id"
            class="recommend-item"
            @tap="onNodeTap(node)"
          >
            <view class="recommend-icon" :style="{ background: currentTree?.color + '20' }">
              <text>{{ currentTree?.icon }}</text>
            </view>
            <view class="recommend-info">
              <text class="recommend-name">{{ node.name }}</text>
              <text class="recommend-meta">难度: {{ node.difficulty }} | 积分: {{ node.points }}</text>
            </view>
            <text class="recommend-arrow">›</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useKnowledgeTreeStore } from '@/stores/knowledgeTreeStore.js'
import { NODE_STATUS } from '@/stores/knowledgeTreeStore.js'
import KnowledgeTreeCanvas from '@/components/knowledge-tree/KnowledgeTreeCanvas.vue'

const store = useKnowledgeTreeStore()

const currentTreeId = ref(null)
const selectedNode = ref(null)
const canvasHeight = ref(600)

onMounted(() => {
  store.init()
  if (store.knowledgeTrees.length > 0) {
    selectTree(store.knowledgeTrees[0].id)
  }
})

const currentTree = computed(() => {
  return store.knowledgeTrees.find(t => t.id === currentTreeId.value) || null
})

const currentTreeNodes = computed(() => {
  return currentTree.value?.nodes || []
})

const selectTree = (treeId) => {
  currentTreeId.value = treeId
  store.selectTree(treeId)
  selectedNode.value = null
  // 根据节点数量调整画布高度
  const nodeCount = currentTreeNodes.value.length
  canvasHeight.value = Math.max(600, nodeCount * 80)
}

const getTreeProgress = (treeId) => {
  return store.getTreeProgress(treeId)
}

const getNodeStatus = (nodeId) => {
  return store.getNodeStatus(nodeId)
}

const getNodeProgress = (nodeId) => {
  return store.getNodeProgress(nodeId)
}

const getNodeHintDesc = (node) => {
  const status = getNodeStatus(node.id)
  switch (status) {
    case NODE_STATUS.COMPLETED:
      return '已完成学习，继续加油！'
    case NODE_STATUS.IN_PROGRESS:
      return `学习进度: ${getNodeProgress(node.id)}%，继续完成吧！`
    case NODE_STATUS.AVAILABLE:
      return '可以开始学习了！'
    default:
      return '需要先完成前置知识才能解锁'
  }
}

const getNodeBtnText = (node) => {
  const status = getNodeStatus(node.id)
  switch (status) {
    case NODE_STATUS.COMPLETED:
      return '再次学习'
    case NODE_STATUS.IN_PROGRESS:
      return '继续学习'
    case NODE_STATUS.AVAILABLE:
      return '开始学习'
    default:
      return '查看详情'
  }
}

const recommendedNodes = computed(() => {
  const nodes = currentTreeNodes.value
  const available = []
  const inProgress = []
  
  for (const node of nodes) {
    const status = getNodeStatus(node.id)
    if (status === NODE_STATUS.AVAILABLE) {
      available.push({ ...node, priority: 2 })
    } else if (status === NODE_STATUS.IN_PROGRESS) {
      inProgress.push({ ...node, priority: 1 })
    }
  }
  
  return [...available, ...inProgress].slice(0, 5)
})

const onNodeTap = (node) => {
  selectedNode.value = node
}

const startLearning = (node) => {
  const status = getNodeStatus(node.id)
  if (status === NODE_STATUS.LOCKED) {
    uni.showToast({ title: '请先完成前置知识', icon: 'none' })
    return
  }
  
  if (status === NODE_STATUS.COMPLETED || status === NODE_STATUS.IN_PROGRESS) {
    uni.navigateTo({ url: `/pages/knowledge/learning?nodeId=${node.id}&treeId=${currentTreeId.value}` })
  } else {
    // 解锁并开始
    store.unlockNode(node.id)
    uni.navigateTo({ url: `/pages/knowledge/learning?nodeId=${node.id}&treeId=${currentTreeId.value}` })
  }
}

const onScroll = (e) => {
  // 可以在这里处理滚动
}

const goBack = () => {
  uni.navigateBack()
}

const goToStats = () => {
  uni.navigateTo({ url: '/pages/knowledge/knowledge-stats' })
}
</script>

<style scoped>
.knowledge-page {
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

/* 总体进度卡片 */
.overall-progress-card {
  margin: 24rpx 32rpx;
  padding: 32rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
}

.progress-label {
  font-size: 24rpx;
  opacity: 0.9;
}

.progress-main {
  margin-top: 8rpx;
}

.progress-percent {
  font-size: 56rpx;
  font-weight: bold;
}

.progress-detail {
  font-size: 22rpx;
  opacity: 0.8;
}

.progress-circle {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  overflow: hidden;
  position: relative;
}

.circle-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.3);
}

.circle-fill {
  position: absolute;
  height: 100%;
  background: #fff;
  transition: width 0.5s ease;
}

/* 学科标签 */
.subject-tabs {
  padding: 0 24rpx;
  margin-bottom: 16rpx;
}

.tab-list {
  display: flex;
  gap: 24rpx;
  padding: 8rpx 0;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  border-bottom: 4rpx solid transparent;
  transition: all 0.2s;
}

.tab-icon {
  font-size: 32rpx;
}

.tab-name {
  font-size: 28rpx;
  color: #6B7280;
}

.tab-item.active .tab-name {
  color: #1F2937;
  font-weight: 600;
}

/* 树内容区 */
.tree-content {
  flex: 1;
  padding: 0 32rpx;
}

.current-tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 24rpx;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.tree-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.tree-icon {
  font-size: 48rpx;
}

.tree-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
  display: block;
}

.tree-desc {
  font-size: 24rpx;
  color: #6B7280;
}

.tree-progress-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 600;
}

/* 树可视化 */
.tree-visualization {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
  overflow-x: auto;
}

/* 节点提示 */
.node-hint {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
}

.hint-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.hint-icon {
  font-size: 36rpx;
}

.hint-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
}

.hint-desc {
  font-size: 26rpx;
  color: #6B7280;
  line-height: 1.6;
  display: block;
  margin-bottom: 20rpx;
}

.hint-actions {
  display: flex;
  gap: 16rpx;
}

.hint-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.hint-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.hint-btn.secondary {
  background: #F3F4F6;
  color: #6B7280;
}

/* 推荐学习 */
.recommendations-section {
  padding-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 20rpx;
  display: block;
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.recommend-item {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

.recommend-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.recommend-info {
  flex: 1;
  margin-left: 16rpx;
}

.recommend-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #1F2937;
  display: block;
  margin-bottom: 4rpx;
}

.recommend-meta {
  font-size: 22rpx;
  color: #9CA3AF;
}

.recommend-arrow {
  font-size: 40rpx;
  color: #D1D5DB;
}
</style>
