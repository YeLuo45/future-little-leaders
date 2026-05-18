<template>
  <view class="challenge-card" :class="statusClass" @click="onClick">
    <view class="header">
      <text class="challenge-name">{{ challenge.name }}</text>
      <text class="status-tag" :class="statusClass">{{ statusText }}</text>
    </view>
    <view class="type-info">
      <text class="type-label">{{ typeLabel }}</text>
      <text class="target">目标: {{ challenge.target_value }}</text>
    </view>
    <view class="progress-section" v-if="showProgress">
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
      </view>
      <text class="progress-text">{{ myProgress }}/{{ challenge.target_value }}</text>
    </view>
    <view class="footer">
      <text class="time-range">{{ timeRangeText }}</text>
      <text class="participants" v-if="participantCount > 0">{{ participantCount }}人参与</text>
    </view>
    <view class="leaderboard-preview" v-if="showLeaderboard && topParticipants.length > 0">
      <view class="leader-item" v-for="(p, index) in topParticipants.slice(0, 3)" :key="p.id">
        <text class="rank">{{ index + 1 }}</text>
        <text class="leader-name">{{ p.baby?.name || '神秘小伙伴' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  challenge: {
    type: Object,
    required: true
  },
  myProgress: {
    type: Number,
    default: 0
  },
  participantCount: {
    type: Number,
    default: 0
  },
  topParticipants: {
    type: Array,
    default: () => []
  },
  showProgress: {
    type: Boolean,
    default: true
  },
  showLeaderboard: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const statusClass = computed(() => {
  const now = new Date()
  const endDate = new Date(props.challenge.end_date)
  const startDate = new Date(props.challenge.start_date)

  if (now < startDate) return 'pending'
  if (now > endDate) return 'ended'
  return 'active'
})

const statusText = computed(() => {
  const map = {
    pending: '未开始',
    active: '进行中',
    ended: '已结束'
  }
  return map[statusClass.value] || '进行中'
})

const typeLabel = computed(() => {
  const map = {
    task_count: '任务数',
    points: '积分数'
  }
  return map[props.challenge.type] || '任务数'
})

const progressPercent = computed(() => {
  if (!props.challenge.target_value) return 0
  return Math.min(100, (props.myProgress / props.challenge.target_value) * 100)
})

const timeRangeText = computed(() => {
  const start = new Date(props.challenge.start_date)
  const end = new Date(props.challenge.end_date)
  const formatDate = (d) => `${d.getMonth() + 1}/${d.getDate()}`
  return `${formatDate(start)} - ${formatDate(end)}`
})

const onClick = () => {
  emit('click', props.challenge)
}
</script>

<style scoped>
.challenge-card {
  padding: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.challenge-card.pending {
  opacity: 0.7;
  border-left: 4rpx solid #ffc107;
}

.challenge-card.active {
  border-left: 4rpx solid #8477fa;
}

.challenge-card.ended {
  opacity: 0.6;
  border-left: 4rpx solid #999;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.challenge-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.status-tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.status-tag.pending {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.status-tag.active {
  background: rgba(132, 119, 250, 0.1);
  color: #8477fa;
}

.status-tag.ended {
  background: rgba(153, 153, 153, 0.1);
  color: #999;
}

.type-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.type-label {
  font-size: 24rpx;
  color: #666;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.target {
  font-size: 24rpx;
  color: #8477fa;
  font-weight: 500;
}

.progress-section {
  margin-bottom: 16rpx;
}

.progress-bar {
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8477fa, #a599fa);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 22rpx;
  color: #666;
  text-align: right;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-range {
  font-size: 22rpx;
  color: #999;
}

.participants {
  font-size: 22rpx;
  color: #8477fa;
}

.leaderboard-preview {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.leader-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 8rpx 0;
}

.rank {
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #8477fa;
  color: #fff;
  border-radius: 50%;
  font-size: 22rpx;
  font-weight: 600;
}

.leader-item:nth-child(1) .rank {
  background: #ffd700;
}

.leader-item:nth-child(2) .rank {
  background: #c0c0c0;
}

.leader-item:nth-child(3) .rank {
  background: #cd7f32;
}

.leader-name {
  font-size: 26rpx;
  color: #333;
}
</style>
