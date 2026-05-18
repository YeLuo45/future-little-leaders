<template>
  <view class="flow-history">
    <!-- Header -->
    <view class="history-header">
      <text class="header-title">执行历史</text>
      <view class="close-btn" @click="$emit('close')">×</view>
    </view>

    <!-- Stats summary -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-value">{{ totalRuns }}</text>
        <text class="stat-label">总执行</text>
      </view>
      <view class="stat-item success">
        <text class="stat-value">{{ successRate }}%</text>
        <text class="stat-label">成功率</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ totalPoints }}</text>
        <text class="stat-label">累计积分</text>
      </view>
    </view>

    <!-- History list -->
    <scroll-view class="history-list" scroll-y>
      <view
        v-for="record in history"
        :key="record.id"
        class="history-card"
        :class="record.status"
        @click="showDetail(record)"
      >
        <view class="card-left">
          <text class="card-icon">{{ record.status === 'completed' ? '✅' : record.status === 'failed' ? '❌' : '⏸️' }}</text>
        </view>
        <view class="card-content">
          <text class="card-title">{{ record.flowName }}</text>
          <text class="card-time">{{ formatTime(record.startTime) }}</text>
          <view class="card-nodes">
            <text class="node-done">{{ record.completedNodes }}/{{ record.totalNodes }} 节点</text>
            <text v-if="record.points" class="card-points">+{{ record.points }}分</text>
          </view>
        </view>
        <view class="card-arrow">›</view>
      </view>

      <view v-if="history.length === 0" class="empty-state">
        <text class="empty-icon">📊</text>
        <text class="empty-text">暂无执行记录</text>
      </view>
    </scroll-view>

    <!-- Detail modal -->
    <view class="detail-modal" v-if="selectedRecord" @click="selectedRecord = null">
      <view class="detail-content" @click.stop>
        <view class="detail-header">
          <text class="detail-title">{{ selectedRecord.flowName }}</text>
          <view class="close-btn" @click="selectedRecord = null">×</view>
        </view>
        <scroll-view class="detail-body" scroll-y>
          <view class="detail-meta">
            <text>开始: {{ formatTime(selectedRecord.startTime) }}</text>
            <text v-if="selectedRecord.endTime">结束: {{ formatTime(selectedRecord.endTime) }}</text>
            <text>耗时: {{ formatDuration(selectedRecord.startTime, selectedRecord.endTime) }}</text>
            <text>状态: {{ selectedRecord.status }}</text>
          </view>

          <view class="node-execution-list">
            <text class="section-title">节点执行详情</text>
            <view
              v-for="(node, idx) in selectedRecord.nodeHistory"
              :key="idx"
              class="execution-item"
              :class="node.status"
            >
              <text class="exec-icon">{{ node.status === 'completed' ? '✅' : '⏭️' }}</text>
              <text class="exec-name">{{ node.nodeName }}</text>
              <text class="exec-time" v-if="node.duration">{{ node.duration }}ms</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FlowHistory',

  props: {
    flowId: {
      type: String,
      default: null
    }
  },

  emits: ['close'],

  data() {
    return {
      history: [],
      selectedRecord: null
    }
  },

  computed: {
    totalRuns() {
      return this.history.length
    },

    successRate() {
      if (!this.history.length) return 0
      const completed = this.history.filter(r => r.status === 'completed').length
      return Math.round((completed / this.history.length) * 100)
    },

    totalPoints() {
      return this.history.reduce((sum, r) => sum + (r.points || 0), 0)
    }
  },

  mounted() {
    this.loadHistory()
  },

  methods: {
    loadHistory() {
      const key = this.flowId ? `flow_history_${this.flowId}` : 'flow_history_all'
      try {
        const data = localStorage.getItem(key)
        this.history = data ? JSON.parse(data) : []
        // Sort by startTime desc
        this.history.sort((a, b) => b.startTime - a.startTime)
      } catch (e) {
        this.history = []
      }
    },

    saveHistory() {
      const key = this.flowId ? `flow_history_${this.flowId}` : 'flow_history_all'
      localStorage.setItem(key, JSON.stringify(this.history))
    },

    showDetail(record) {
      this.selectedRecord = record
    },

    formatTime(timestamp) {
      if (!timestamp) return '-'
      const d = new Date(timestamp)
      return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
    },

    formatDuration(start, end) {
      if (!end) return '进行中'
      const ms = end - start
      if (ms < 1000) return `${ms}ms`
      return `${(ms / 1000).toFixed(1)}s`
    },

    // Called by parent to record a new execution
    recordExecution(executionData) {
      const record = {
        id: 'exec-' + Date.now(),
        flowName: executionData.flowName || '未命名流程',
        flowId: executionData.flowId || this.flowId,
        startTime: executionData.startTime || Date.now(),
        endTime: executionData.endTime || null,
        status: executionData.status || 'completed',
        completedNodes: executionData.completedNodes || 0,
        totalNodes: executionData.totalNodes || 0,
        points: executionData.points || 0,
        nodeHistory: executionData.nodeHistory || []
      }
      this.history.unshift(record)
      // Keep last 50 records
      if (this.history.length > 50) {
        this.history = this.history.slice(0, 50)
      }
      this.saveHistory()
      return record
    },

    clearHistory() {
      this.history = []
      this.saveHistory()
    }
  }
}
</script>

<style scoped>
.flow-history {
  position: fixed;
  top: 0;
  right: -360px;
  width: 340px;
  height: 100vh;
  background: #fff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
}

.flow-history.open {
  right: 0;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #999;
  border-radius: 50%;
  background: #eee;
  cursor: pointer;
}

.stats-bar {
  display: flex;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  gap: 8px;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: #fff;
  border-radius: 8px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-item.success .stat-value {
  color: #22c55e;
}

.stat-label {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.history-card {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.history-card.completed {
  border-left: 3px solid #22c55e;
}

.history-card.failed {
  border-left: 3px solid #ef4444;
}

.history-card.paused {
  border-left: 3px solid #f59e0b;
}

.card-left {
  margin-right: 12px;
}

.card-icon {
  font-size: 24px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 2px;
}

.card-time {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.card-nodes {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-done {
  font-size: 12px;
  color: #666;
}

.card-points {
  font-size: 12px;
  color: #22c55e;
  font-weight: 500;
}

.card-arrow {
  font-size: 20px;
  color: #ccc;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

/* Detail modal */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1100;
  display: flex;
  align-items: flex-end;
}

.detail-content {
  background: #fff;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.detail-body {
  flex: 1;
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.detail-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-meta text {
  font-size: 13px;
  color: #666;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: block;
}

.node-execution-list {
  margin-top: 12px;
}

.execution-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 6px;
}

.exec-icon {
  font-size: 16px;
  margin-right: 8px;
}

.exec-name {
  flex: 1;
  font-size: 13px;
  color: #333;
}

.exec-time {
  font-size: 12px;
  color: #999;
}
</style>
