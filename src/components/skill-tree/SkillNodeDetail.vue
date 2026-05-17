<template>
  <view class="skill-node-detail">
    <uni-popup type="center" :show="show" @close="close">
      <view class="detail-card" :style="{ borderColor: nodeColor }">
        <!-- 头部 -->
        <view class="detail-header" :style="{ backgroundColor: nodeColor }">
          <text class="node-icon">{{ nodeDetails?.icon || '⭐' }}</text>
          <text class="node-name">{{ nodeDetails?.name || '' }}</text>
        </view>
        
        <!-- 内容 -->
        <view class="detail-body">
          <!-- 描述 -->
          <view class="desc-section">
            <text class="label">技能描述</text>
            <text class="value">{{ nodeDetails?.description || '暂无描述' }}</text>
          </view>
          
          <!-- 状态 -->
          <view class="status-section">
            <view class="status-badge" :class="statusClass">
              <text>{{ statusText }}</text>
            </view>
          </view>
          
          <!-- 进度 -->
          <view class="progress-section">
            <text class="label">当前进度</text>
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :style="{ width: nodeDetails?.progressPercent + '%', backgroundColor: nodeColor }"
              ></view>
            </view>
            <text class="progress-text">
              {{ nodeDetails?.currentProgress || 0 }} / {{ nodeDetails?.conditionCount || 0 }}
            </text>
          </view>
          
          <!-- 前置条件 -->
          <view class="prereq-section" v-if="prerequisiteNodes.length > 0">
            <text class="label">前置条件</text>
            <view class="prereq-list">
              <view 
                v-for="prereq in prerequisiteNodes" 
                :key="prereq.id" 
                class="prereq-item"
                :class="{ unlocked: prereq.unlocked }"
              >
                <text class="prereq-icon">{{ prereq.icon }}</text>
                <text class="prereq-name">{{ prereq.name }}</text>
                <text class="prereq-status">{{ prereq.unlocked ? '✓' : '○' }}</text>
              </view>
            </view>
          </view>
          
          <!-- 奖励 -->
          <view class="reward-section" v-if="nodeDetails?.pointsReward > 0">
            <text class="label">解锁奖励</text>
            <view class="reward-item">
              <text class="reward-icon">⭐</text>
              <text class="reward-points">+{{ nodeDetails.pointsReward }} 积分</text>
            </view>
          </view>
          
          <!-- 解锁时间 -->
          <view class="unlock-time" v-if="nodeDetails?.unlockedAt">
            <text class="label">解锁时间</text>
            <text class="value">{{ formatTime(nodeDetails.unlockedAt) }}</text>
          </view>
          
          <!-- 最佳成绩 -->
          <view class="best-progress" v-if="nodeDetails?.bestProgress > 0">
            <text class="label">历史最佳</text>
            <text class="value">{{ nodeDetails.bestProgress }} 次</text>
          </view>
        </view>
        
        <!-- 关闭按钮 -->
        <view class="detail-footer">
          <button class="close-btn" @tap="close">知道了</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { getSkillNode } from '../../db/sqlite.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  nodeId: {
    type: String,
    default: ''
  },
  nodeDetails: {
    type: Object,
    default: null
  },
  nodeColor: {
    type: String,
    default: '#4A90D9'
  },
  babyId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const statusClass = computed(() => {
  if (!props.nodeDetails) return ''
  return props.nodeDetails.status || 'locked'
})

const statusText = computed(() => {
  if (!props.nodeDetails) return '未知'
  switch (props.nodeDetails.status) {
    case 'unlocked': return '已解锁'
    case 'available': return '可解锁'
    case 'locked': return '未解锁'
    default: return '未知'
  }
})

const prerequisiteNodes = computed(() => {
  if (!props.nodeDetails) return []
  
  const prereqIds = JSON.parse(props.nodeDetails.prerequisiteIds || '[]')
  if (!prereqIds.length) return []
  
  return prereqIds.map(id => {
    const node = getSkillNode(id)
    if (!node) return null
    
    // 检查是否已解锁 - 需要从父组件传入statsMap
    // 这里暂时返回基本信息
    return {
      id: node.id,
      name: node.name,
      icon: node.icon,
      unlocked: false
    }
  }).filter(n => n)
})

const formatTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.skill-node-detail {
  width: 100%;
}

.detail-card {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  border: 4rpx solid;
}

.detail-header {
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.node-icon {
  font-size: 80rpx;
}

.node-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.detail-body {
  padding: 30rpx;
}

.label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
  display: block;
}

.value {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.desc-section {
  margin-bottom: 24rpx;
}

.status-section {
  margin-bottom: 24rpx;
  display: flex;
  justify-content: center;
}

.status-badge {
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #fff;
}

.status-badge.unlocked {
  background: linear-gradient(135deg, #52c41a, #389e0d);
}

.status-badge.available {
  background: linear-gradient(135deg, #1890ff, #096dd9);
}

.status-badge.locked {
  background: linear-gradient(135deg, #999, #666);
}

.progress-section {
  margin-bottom: 24rpx;
}

.progress-bar {
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
  text-align: center;
  display: block;
}

.prereq-section {
  margin-bottom: 24rpx;
}

.prereq-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.prereq-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 16rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.prereq-item.unlocked {
  background: #f6ffed;
}

.prereq-icon {
  font-size: 32rpx;
}

.prereq-name {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.prereq-status {
  font-size: 28rpx;
  color: #52c41a;
}

.reward-section {
  margin-bottom: 24rpx;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx;
  background: linear-gradient(135deg, #fff9e6, #fffdf0);
  border-radius: 12rpx;
}

.reward-icon {
  font-size: 36rpx;
}

.reward-points {
  font-size: 28rpx;
  color: #fa8c16;
  font-weight: bold;
}

.unlock-time,
.best-progress {
  margin-bottom: 16rpx;
}

.detail-footer {
  padding: 20rpx 30rpx 30rpx;
}

.close-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(135deg, #8477fa, #6a5acd);
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}
</style>