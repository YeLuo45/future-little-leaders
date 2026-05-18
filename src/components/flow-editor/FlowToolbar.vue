<template>
  <view class="flow-toolbar">
    <view class="toolbar-left">
      <view class="tool-btn" @click="onSave" title="保存">
        <text>💾</text>
        <text class="tool-label">保存</text>
      </view>
      <view class="tool-btn" @click="onClear" title="清空">
        <text>🗑️</text>
        <text class="tool-label">清空</text>
      </view>
    </view>

    <view class="toolbar-center">
      <view class="status-badge" :class="statusClass">
        <text class="status-dot"></text>
        <text class="status-text">{{ statusText }}</text>
      </view>
    </view>

    <view class="toolbar-right">
      <view class="tool-btn preview-btn" :class="{ active: isPreviewing }" @click="onPreview" title="预览流程">
        <text>👁️</text>
        <text class="tool-label">{{ isPreviewing ? '停止' : '预览' }}</text>
      </view>
      <view class="tool-btn" @click="onExecute" title="执行流程" v-if="showExecute">
        <text>▶️</text>
        <text class="tool-label">执行</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FlowToolbar',

  props: {
    isPreviewing: {
      type: Boolean,
      default: false
    },
    executionStatus: {
      type: String,
      default: 'idle' // idle, running, paused, completed
    },
    currentNodeName: {
      type: String,
      default: ''
    },
    showExecute: {
      type: Boolean,
      default: true
    }
  },

  emits: ['save', 'clear', 'preview', 'execute'],

  computed: {
    statusClass() {
      const map = {
        idle: 'status-idle',
        running: 'status-running',
        paused: 'status-paused',
        completed: 'status-completed'
      }
      return map[this.executionStatus] || 'status-idle'
    },

    statusText() {
      if (this.executionStatus === 'running' && this.currentNodeName) {
        return `执行中: ${this.currentNodeName}`
      }
      const map = {
        idle: '待执行',
        running: '执行中',
        paused: '已暂停',
        completed: '已完成'
      }
      return map[this.executionStatus] || '待执行'
    }
  },

  methods: {
    onSave() { this.$emit('save') },
    onClear() { this.$emit('clear') },
    onPreview() { this.$emit('preview') },
    onExecute() { this.$emit('execute') }
  }
}
</script>

<style scoped>
.flow-toolbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #fff;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  min-width: 48px;
}

.tool-btn:active {
  background: #f0f0f0;
}

.tool-btn.active {
  background: #e8f0fe;
}

.tool-label {
  font-size: 10px;
  color: #666;
}

.preview-btn.active {
  background: #fff3e0;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-idle {
  background: #f3f4f6;
  color: #666;
}
.status-idle .status-dot { background: #9ca3af; }

.status-running {
  background: #eff6ff;
  color: #1d4ed8;
}
.status-running .status-dot { background: #3b82f6; animation: pulse 1s infinite; }

.status-paused {
  background: #fffbeb;
  color: #b45309;
}
.status-paused .status-dot { background: #f59e0b; }

.status-completed {
  background: #f0fdf4;
  color: #166534;
}
.status-completed .status-dot { background: #22c55e; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
</parameter>
