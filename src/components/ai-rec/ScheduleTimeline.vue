<template>
  <view class="schedule-timeline">
    <view class="timeline-header">
      <text class="timeline-title">今日日程</text>
      <text class="timeline-points">预计 {{ totalPoints }} 积分</text>
    </view>

    <view class="timeline-body">
      <view
        v-for="(slot, index) in slots"
        :key="index"
        class="timeline-slot"
        :class="{ 'has-tasks': slot.tasks && slot.tasks.length > 0 }"
      >
        <!-- 时间线 -->
        <view class="slot-line">
          <view class="slot-dot" :class="{ 'is-active': slot.tasks && slot.tasks.length > 0 }"></view>
          <view class="slot-connector" v-if="index < slots.length - 1"></view>
        </view>

        <!-- 时间信息 -->
        <view class="slot-time">
          <text class="time-text">{{ slot.time }}</text>
          <text class="time-label">{{ slot.label }}</text>
        </view>

        <!-- 任务列表 -->
        <view class="slot-tasks">
          <view v-if="slot.tasks && slot.tasks.length > 0" class="task-list">
            <view
              v-for="task in slot.tasks"
              :key="task.id"
              class="slot-task-item"
              @click="handleTaskClick(task)"
            >
              <text class="task-icon">{{ task.icon || '📝' }}</text>
              <text class="task-name">{{ task.name }}</text>
              <text class="task-points">+{{ task.points }}</text>
            </view>
          </view>
          <view v-else class="empty-slot">
            <text class="empty-text">暂无任务</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="timeline-footer" v-if="showActions">
      <button class="action-btn primary" @click="handleImport">
        <text>一键导入任务列表</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  slots: {
    type: Array,
    default: () => []
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['task-click', 'import'])

function handleTaskClick(task) {
  emit('task-click', task)
}

function handleImport() {
  emit('import', props.slots)
}
</script>

<style scoped>
.schedule-timeline {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #F3F4F6;
}

.timeline-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
}

.timeline-points {
  font-size: 26rpx;
  color: #7C3AED;
  font-weight: 500;
}

.timeline-body {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-slot {
  display: flex;
  gap: 20rpx;
  min-height: 100rpx;
}

.slot-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24rpx;
  flex-shrink: 0;
}

.slot-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #E5E7EB;
  border: 4rpx solid #F3F4F6;
  flex-shrink: 0;
  margin-top: 8rpx;
}

.slot-dot.is-active {
  background: #7C3AED;
  border-color: #DDD6FE;
}

.slot-connector {
  width: 4rpx;
  flex: 1;
  min-height: 60rpx;
  background: linear-gradient(180deg, #DDD6FE 0%, #F3F4F6 100%);
  margin: 8rpx 0;
}

.slot-time {
  width: 160rpx;
  flex-shrink: 0;
  padding-top: 4rpx;
}

.time-text {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #1F2937;
}

.time-label {
  display: block;
  font-size: 22rpx;
  color: #9CA3AF;
  margin-top: 4rpx;
}

.slot-tasks {
  flex: 1;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.slot-task-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 16rpx;
  background: #FAFAFA;
  border-radius: 16rpx;
}

.slot-task-item:active {
  background: #F3F4F6;
}

.task-icon {
  font-size: 28rpx;
}

.task-name {
  flex: 1;
  font-size: 26rpx;
  color: #1F2937;
}

.task-points {
  font-size: 24rpx;
  color: #7C3AED;
  font-weight: 500;
}

.empty-slot {
  padding: 12rpx 0;
}

.empty-text {
  font-size: 24rpx;
  color: #9CA3AF;
}

.timeline-footer {
  margin-top: 32rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #F3F4F6;
}

.action-btn {
  width: 100%;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
  color: #FFFFFF;
}

.action-btn::after {
  border: none;
}
</style>
