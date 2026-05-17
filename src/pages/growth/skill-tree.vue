<template>
  <view class="skill-tree-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="deco-circle deco-1"></view>
      <view class="deco-circle deco-2"></view>
      <view class="deco-circle deco-3"></view>
    </view>
    
    <!-- 顶部标题区 -->
    <view class="header-section">
      <view class="header-top">
        <view class="back-btn" @tap="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="page-title">技能成长图谱</text>
        <view class="header-right">
          <text class="total-progress">{{ totalProgress.percent }}%</text>
        </view>
      </view>
      
      <!-- 总进度条 -->
      <view class="total-progress-bar">
        <view class="progress-track">
          <view 
            class="progress-fill" 
            :style="{ width: totalProgress.percent + '%' }"
          ></view>
        </view>
        <text class="progress-label">
          已解锁 {{ totalProgress.unlocked }} / {{ totalProgress.total }} 个技能
        </text>
      </view>
    </view>
    
    <!-- Tab切换 -->
    <view class="tree-tabs">
      <view 
        v-for="tree in skillTrees" 
        :key="tree.id"
        class="tab-item"
        :class="{ active: currentTreeId === tree.id }"
        :style="currentTreeId === tree.id ? { borderBottomColor: tree.color } : {}"
        @tap="onTabChange(tree.id)"
      >
        <text class="tab-icon">{{ tree.icon }}</text>
        <text class="tab-name">{{ tree.name }}</text>
      </view>
    </view>
    
    <!-- 技能树画布 -->
    <view class="canvas-container">
      <scroll-view 
        class="canvas-scroll" 
        scroll-x 
        scroll-y
        :enhanced="true"
        :bounces="false"
      >
        <SkillTreeCanvas
          v-if="currentTreeNodes.length > 0"
          :nodes="currentTreeNodes"
          :tree-color="currentTree?.color || '#4A90D9'"
          :width="750"
          :height="550"
          :get-node-status="getNodeStatus"
          :get-node-progress="getNodeProgress"
          @node-tap="onNodeTap"
        />
      </scroll-view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="currentTreeNodes.length === 0">
        <text class="empty-icon">🌱</text>
        <text class="empty-text">正在加载技能树...</text>
      </view>
    </view>
    
    <!-- 技能树进度 -->
    <view class="tree-progress">
      <text class="tree-progress-text">
        {{ currentTree?.name }}: {{ treeProgress.unlocked }}/{{ treeProgress.total }}
      </text>
      <view class="tree-progress-bar">
        <view 
          class="tree-progress-fill" 
          :style="{ 
            width: treeProgress.percent + '%',
            backgroundColor: currentTree?.color 
          }"
        ></view>
      </view>
    </view>
    
    <!-- 节点详情弹窗 -->
    <SkillNodeDetail
      :show="showNodeDetail"
      :node-id="selectedNode?.id || ''"
      :node-details="selectedNodeDetails"
      :node-color="currentTree?.color || '#4A90D9'"
      :baby-id="currentBabyId"
      @close="closeNodeDetail"
    />
    
    <!-- 解锁动画 -->
    <view class="unlock-overlay" v-if="showUnlockAnimation">
      <view class="unlock-effect">
        <text class="unlock-icon">{{ unlockingNode?.icon || '⭐' }}</text>
        <text class="unlock-text">技能解锁!</text>
        <text class="unlock-name">{{ unlockingNode?.name }}</text>
        <text class="unlock-points" v-if="unlockingPoints > 0">+{{ unlockingPoints }} 积分</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBabyStore } from '../../stores/babyStore'
import { useSkillTreeStore } from '../../stores/skillTreeStore'
import { getSkillNode, isNodeUnlocked, getOrCreateNodeStats } from '../../db/sqlite.js'
import SkillTreeCanvas from '../../components/skill-tree/SkillTreeCanvas.vue'
import SkillNodeDetail from '../../components/skill-tree/SkillNodeDetail.vue'

const babyStore = useBabyStore()
const skillTreeStore = useSkillTreeStore()

// 状态
const showNodeDetail = ref(false)
const selectedNode = ref(null)
const showUnlockAnimation = ref(false)
const unlockingNode = ref(null)
const unlockingPoints = ref(0)

// 计算属性
const currentBabyId = computed(() => babyStore.currentBabyId)
const skillTrees = computed(() => skillTreeStore.skillTrees)
const currentTreeId = computed(() => skillTreeStore.currentTreeId)
const currentTree = computed(() => skillTreeStore.currentTree)
const currentTreeNodes = computed(() => skillTreeStore.currentTreeNodes)
const totalProgress = computed(() => skillTreeStore.totalProgress)
const treeProgress = computed(() => skillTreeStore.getTreeProgress(currentTreeId.value))

// 获取节点状态
const getNodeStatus = (nodeId) => {
  return skillTreeStore.getNodeStatus(nodeId)
}

// 获取节点进度
const getNodeProgress = (nodeId) => {
  return skillTreeStore.getNodeProgress(nodeId)
}

// 获取选中节点的详细信息
const selectedNodeDetails = computed(() => {
  if (!selectedNode.value) return null
  return skillTreeStore.getNodeDetails(selectedNode.value.id)
})

// 方法
const goBack = () => {
  uni.navigateBack()
}

const onTabChange = (treeId) => {
  skillTreeStore.selectTree(treeId)
}

const onNodeTap = (node) => {
  selectedNode.value = node
  showNodeDetail.value = true
}

const closeNodeDetail = () => {
  showNodeDetail.value = false
  selectedNode.value = null
}

// 显示解锁动画
const showUnlockEffect = (node, points) => {
  unlockingNode.value = node
  unlockingPoints.value = points || 0
  showUnlockAnimation.value = true
  
  setTimeout(() => {
    showUnlockAnimation.value = false
    unlockingNode.value = null
    unlockingPoints.value = 0
  }, 2000)
}

// 监听节点解锁事件
const setupEventListeners = () => {
  uni.$on('nodeUnlocked', (data) => {
    if (data.babyId === currentBabyId.value) {
      showUnlockEffect(data.node, data.points)
    }
  })
  
  // 监听任务完成事件，触发技能树进度更新
  uni.$on('taskCompleted', (data) => {
    if (data.babyId === currentBabyId.value) {
      const tags = data.tags || []
      const results = skillTreeStore.onTaskComplete(data.babyId, tags)
      
      if (results && results.length > 0) {
        console.log('[V6] Nodes unlocked from task:', results)
      }
    }
  })
  
  // 监听打卡事件
  uni.$on('checkinRecorded', (data) => {
    if (data.babyId === currentBabyId.value) {
      skillTreeStore.onCheckin(data.babyId, data.taskId, data.tags || [])
    }
  })
  
  // 监听连续打卡更新
  uni.$on('streakUpdated', (data) => {
    if (data.babyId === currentBabyId.value) {
      skillTreeStore.onStreakUpdate(data.babyId, data.streakDays, data.tag)
    }
  })
  
  // 监听宝宝切换
  uni.$on('babyChanged', (data) => {
    skillTreeStore.onBabyChange(data.babyId)
  })
}

// 初始化
onMounted(() => {
  // 初始化技能树
  skillTreeStore.init()
  
  // 默认选中第一棵树
  if (skillTrees.value.length > 0 && !currentTreeId.value) {
    skillTreeStore.selectTree(skillTrees.value[0].id)
  }
  
  // 设置事件监听
  setupEventListeners()
})

// 监听宝宝切换
watch(currentBabyId, (newBabyId) => {
  if (newBabyId) {
    skillTreeStore.onBabyChange(newBabyId)
  }
})
</script>

<style scoped>
.skill-tree-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f5ff 0%, #ffffff 100%);
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 400rpx;
  overflow: hidden;
  pointer-events: none;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.deco-1 {
  width: 300rpx;
  height: 300rpx;
  background: #4A90D9;
  top: -100rpx;
  right: -50rpx;
}

.deco-2 {
  width: 200rpx;
  height: 200rpx;
  background: #52C41A;
  top: 100rpx;
  left: -50rpx;
}

.deco-3 {
  width: 150rpx;
  height: 150rpx;
  background: #FA8C16;
  top: 200rpx;
  right: 100rpx;
}

.header-section {
  padding: 60rpx 30rpx 20rpx;
  position: relative;
  z-index: 1;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.back-icon {
  font-size: 32rpx;
  color: #333;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

.total-progress {
  font-size: 28rpx;
  font-weight: bold;
  color: #8477fa;
}

.total-progress-bar {
  margin-top: 16rpx;
}

.progress-track {
  height: 12rpx;
  background: #e0e0e0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8477fa, #6a5acd);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.tree-tabs {
  display: flex;
  padding: 0 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
  z-index: 1;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 4rpx solid transparent;
  transition: all 0.2s ease;
}

.tab-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.tab-name {
  font-size: 24rpx;
  color: #666;
}

.tab-item.active .tab-name {
  color: #333;
  font-weight: bold;
}

.canvas-container {
  padding: 30rpx;
  position: relative;
  z-index: 1;
}

.canvas-scroll {
  height: 550rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.tree-progress {
  padding: 20rpx 30rpx 40rpx;
  position: relative;
  z-index: 1;
}

.tree-progress-text {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.tree-progress-bar {
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
}

.tree-progress-fill {
  height: 100%;
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

/* 解锁动画 */
.unlock-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.unlock-effect {
  width: 500rpx;
  padding: 60rpx 40rpx;
  background: #fff;
  border-radius: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: scaleIn 0.4s ease;
}

@keyframes scaleIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.unlock-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
  animation: bounce 0.6s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20rpx); }
}

.unlock-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #52c41a;
  margin-bottom: 10rpx;
}

.unlock-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.unlock-points {
  font-size: 32rpx;
  font-weight: bold;
  color: #fa8c16;
}
</style>