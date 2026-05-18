<template>
  <view class="sync-status-badge" @click="showDetail">
    <view class="status-icon" :class="status">
      <text v-if="status === 'syncing'">🔄</text>
      <text v-else-if="status === 'synced'">✓</text>
      <text v-else-if="status === 'error'">❌</text>
      <text v-else-if="status === 'conflict'">⚠️</text>
      <text v-else>⏸️</text>
    </view>
    <text class="status-label" v-if="showLabel">{{ labelText }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'idle'
  },
  lastSyncTime: { type: Date, default: null },
  pendingCount: { type: Number, default: 0 },
  showLabel: { type: Boolean, default: false }
})

const labelText = computed(() => {
  switch (props.status) {
    case 'syncing': return '同步中...'
    case 'synced': return '已同步'
    case 'error': return '同步失败'
    case 'conflict': return '有冲突'
    default: return '离线'
  }
})

function showDetail() {
  // 可以扩展为显示详细信息弹窗
  console.log('[SyncStatus]', {
    status: props.status,
    lastSyncTime: props.lastSyncTime,
    pendingCount: props.pendingCount
  })
}
</script>

<style scoped>
.sync-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  background: #f5f5f5;
}

.status-icon {
  font-size: 14px;
}

.status-icon.syncing {
  animation: spin 1s linear infinite;
}

.status-label {
  font-size: 12px;
  color: #666;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>