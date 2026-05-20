<template>
  <view
    class="flow-node"
    :class="{ 'selected': isSelected, 'connecting': isConnecting, 'preview-highlight': isPreviewHighlighted, 'running': isRunning, 'completed': isCompleted }"
    :style="nodeStyle"
    @mousedown="onMouseDown"
    @touchstart="onTouchStart"
  >
    <!-- Preview glow animation -->
    <view v-if="isPreviewHighlighted" class="preview-glow"></view>

    <!-- Drag handle -->
    <view class="node-drag-handle">
      <text class="drag-icon">⋮⋮</text>
    </view>

    <!-- Node content -->
    <view class="node-content">
      <text class="node-icon">{{ nodeIcon }}</text>
      <text class="node-label">{{ nodeLabel }}</text>
      <text v-if="executionTimeBadge" class="execution-time-badge">{{ executionTimeBadge }}</text>
      <text v-if="branchDecision" class="branch-decision-badge" :data-value="branchDecision">{{ branchDecision === 'true' ? 'T' : 'F' }}</text>
    </view>

    <!-- Condition node: dual output ports -->
    <template v-if="node.type === 'condition'">
      <!-- True port (left) -->
      <view
        class="node-port output-port true-port"
        :style="truePortStyle"
        @mousedown.stop="onTruePortMouseDown"
        @touchstart.stop="onTruePortTouchStart"
      >
        <text class="port-label">T</text>
      </view>
      <!-- False port (right) -->
      <view
        class="node-port output-port false-port"
        :style="falsePortStyle"
        @mousedown.stop="onFalsePortMouseDown"
        @touchstart.stop="onFalsePortTouchStart"
      >
        <text class="port-label">F</text>
      </view>
    </template>
    <template v-else>
      <!-- Default output port (bottom center) -->
      <view
        class="node-port output-port"
        :style="outputPortStyle"
        @mousedown.stop="onOutputPortMouseDown"
        @touchstart.stop="onOutputPortTouchStart"
      ></view>
    </template>

    <!-- Input port (top) -->
    <view
      class="node-port input-port"
      :style="inputPortStyle"
      @mousedown.stop="onInputPortMouseDown"
      @touchstart.stop="onInputPortTouchStart"
    ></view>
  </view>
</template>

<script>
import { NODE_TYPES } from '../../stores/flowStore.js'

export default {
  name: 'FlowNode',
  
  props: {
    node: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    isConnecting: {
      type: Boolean,
      default: false
    },
    isPreviewHighlighted: {
      type: Boolean,
      default: false
    },
    isRunning: {
      type: Boolean,
      default: false
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    nodeExecutionTime: {
      type: Number,
      default: null
    },
    branchDecision: {
      type: String,
      default: null
    }
  },

  emits: ['select', 'dragstart', 'portdragstart', 'inputportdragstart', 'trueportdragstart', 'falseportdragstart'],
  
  computed: {
    nodeTypeConfig() {
      return NODE_TYPES[this.node.type] || NODE_TYPES.checkin
    },
    
    nodeIcon() {
      return this.nodeTypeConfig.icon
    },
    
    nodeLabel() {
      return this.node.config?.title || this.nodeTypeConfig.label
    },
    
    isDarkMode() {
      const savedTheme = uni.getStorageSync('currentThemeId') || uni.getStorageSync('theme_mode') || 'light'
      return savedTheme === 'dark'
    },
    
    nodeStyle() {
      const config = this.nodeTypeConfig
      let opacity = 1
      if (this.isCompleted) opacity = 0.6
      return {
        left: `${this.node.x}px`,
        top: `${this.node.y}px`,
        borderColor: config.color,
        backgroundColor: this.isSelected ? `${config.color}15` : (this.isDarkMode ? '#1f1f1f' : '#fff'),
        animation: this.isRunning ? 'nodeRunningPulse 1s ease-in-out infinite' : 'none',
        opacity
      }
    },
    
    inputPortStyle() {
      return {
        backgroundColor: this.isDarkMode ? '#2a2a2a' : '#fff',
        borderColor: this.nodeTypeConfig.color
      }
    },
    
    outputPortStyle() {
      return {
        backgroundColor: this.nodeTypeConfig.color,
        borderColor: this.nodeTypeConfig.color
      }
    },

    truePortStyle() {
      return {
        backgroundColor: '#22c55e',
        borderColor: '#22c55e',
        left: '8px',
        transform: 'none'
      }
    },

    falsePortStyle() {
      return {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        right: '8px',
        transform: 'none'
      }
    },

    executionTimeBadge() {
      if (!this.nodeExecutionTime) return null
      if (this.nodeExecutionTime < 1000) return `${this.nodeExecutionTime}ms`
      return `${(this.nodeExecutionTime / 1000).toFixed(1)}s`
    }
  },

  methods: {
    onMouseDown(e) {
      console.log('[V5] Node mouse down:', this.node.id)
      this.$emit('select', this.node.id)
      this.$emit('dragstart', {
        nodeId: this.node.id,
        event: e
      })
    },
    
    onTouchStart(e) {
      console.log('[V5] Node touch start:', this.node.id)
      this.$emit('select', this.node.id)
      this.$emit('dragstart', {
        nodeId: this.node.id,
        event: e
      })
    },
    
    onOutputPortMouseDown(e) {
      console.log('[V5] Output port mouse down:', this.node.id)
      e.stopPropagation()
      this.$emit('portdragstart', {
        nodeId: this.node.id,
        portType: 'output',
        event: e
      })
    },
    
    onOutputPortTouchStart(e) {
      console.log('[V5] Output port touch start:', this.node.id)
      e.stopPropagation()
      this.$emit('portdragstart', {
        nodeId: this.node.id,
        portType: 'output',
        event: e
      })
    },
    
    onInputPortMouseDown(e) {
      console.log('[V5] Input port mouse down:', this.node.id)
      e.stopPropagation()
      this.$emit('inputportdragstart', {
        nodeId: this.node.id,
        portType: 'input',
        event: e
      })
    },
    
    onInputPortTouchStart(e) {
      console.log('[V5] Input port touch start:', this.node.id)
      e.stopPropagation()
      this.$emit('inputportdragstart', {
        nodeId: this.node.id,
        portType: 'input',
        event: e
      })
    },

    // True port (condition node)
    onTruePortMouseDown(e) {
      e.stopPropagation()
      this.$emit('trueportdragstart', { nodeId: this.node.id, portType: 'true', event: e })
    },

    onTruePortTouchStart(e) {
      e.stopPropagation()
      this.$emit('trueportdragstart', { nodeId: this.node.id, portType: 'true', event: e })
    },

    // False port (condition node)
    onFalsePortMouseDown(e) {
      e.stopPropagation()
      this.$emit('falseportdragstart', { nodeId: this.node.id, portType: 'false', event: e })
    },

    onFalsePortTouchStart(e) {
      e.stopPropagation()
      this.$emit('falseportdragstart', { nodeId: this.node.id, portType: 'false', event: e })
    }
  }
}
</script>

<style scoped>
.flow-node {
  position: absolute;
  width: 120px;
  min-height: 60px;
  border: 2px solid #ddd;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: move;
  user-select: none;
  transition: box-shadow 0.2s, background-color 0.2s;
}

.flow-node.selected {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.flow-node.connecting {
  cursor: crosshair;
}

/* Running animation */
.flow-node.running {
  animation: nodeRunningPulse 1s ease-in-out infinite !important;
  box-shadow: 0 0 20px var(--primary-color, #8477fa);
  z-index: 50;
}

@keyframes nodeRunningPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 10px var(--primary-color, #8477fa);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 25px var(--primary-color, #8477fa);
  }
}

/* Completed state */
.flow-node.completed {
  opacity: 0.7;
  border-color: #22c55e !important;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
}

.flow-node.completed::after {
  content: '✓';
  position: absolute;
  top: -8px;
  right: -8px;
  width: 18px;
  height: 18px;
  background: #22c55e;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* Preview highlight animation */
.flow-node.preview-highlight {
  box-shadow: 0 0 0 3px #3b82f6, 0 0 20px rgba(59, 130, 246, 0.5);
  transform: scale(1.05);
  z-index: 100;
}

.preview-glow {
  position: absolute;
  inset: -4px;
  border-radius: 16px;
  background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6);
  background-size: 300% 300%;
  animation: previewGlow 1.5s ease infinite;
  z-index: -1;
  opacity: 0.6;
}

@keyframes previewGlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.node-drag-handle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, rgba(0,0,0,0.05), transparent);
  border-radius: 10px 10px 0 0;
}

.drag-icon {
  font-size: 12px;
  color: #999;
  letter-spacing: -2px;
}

.node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 8px 12px;
  gap: 4px;
}

.node-icon {
  font-size: 24px;
}

.node-label {
  font-size: 12px;
  color: #333;
  text-align: center;
  word-break: break-word;
}

.execution-time-badge {
  position: absolute;
  bottom: 2px;
  right: 4px;
  font-size: 9px;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  padding: 1px 4px;
  border-radius: 8px;
  font-weight: 500;
}

.branch-decision-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  z-index: 20;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.branch-decision-badge[data-value="true"] {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.branch-decision-badge[data-value="false"] {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.node-port {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid;
  cursor: crosshair;
  z-index: 10;
}

.input-port {
  top: -7px;
  left: 50%;
  transform: translateX(-50%);
}

.output-port {
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%);
}

.input-port:hover,
.output-port:hover {
  transform: translateX(-50%) scale(1.3);
}

.true-port,
.false-port {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: bold;
  color: #fff;
}

.true-port .port-label {
  color: #fff;
}

.false-port .port-label {
  color: #fff;
}
</style>