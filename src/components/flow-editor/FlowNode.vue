<template>
  <view 
    class="flow-node"
    :class="{ 'selected': isSelected, 'connecting': isConnecting }"
    :style="nodeStyle"
    @mousedown="onMouseDown"
    @touchstart="onTouchStart"
  >
    <!-- Drag handle -->
    <view class="node-drag-handle">
      <text class="drag-icon">⋮⋮</text>
    </view>
    
    <!-- Node content -->
    <view class="node-content">
      <text class="node-icon">{{ nodeIcon }}</text>
      <text class="node-label">{{ nodeLabel }}</text>
    </view>
    
    <!-- Input port (top) -->
    <view 
      class="node-port input-port"
      :style="inputPortStyle"
      @mousedown.stop="onInputPortMouseDown"
      @touchstart.stop="onInputPortTouchStart"
    ></view>
    
    <!-- Output port (bottom) -->
    <view 
      class="node-port output-port"
      :style="outputPortStyle"
      @mousedown.stop="onOutputPortMouseDown"
      @touchstart.stop="onOutputPortTouchStart"
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
    }
  },
  
  emits: ['select', 'dragstart', 'portdragstart', 'inputportdragstart'],
  
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
    
    nodeStyle() {
      const config = this.nodeTypeConfig
      return {
        left: `${this.node.x}px`,
        top: `${this.node.y}px`,
        borderColor: config.color,
        backgroundColor: this.isSelected ? `${config.color}15` : '#fff'
      }
    },
    
    inputPortStyle() {
      return {
        backgroundColor: '#fff',
        borderColor: this.nodeTypeConfig.color
      }
    },
    
    outputPortStyle() {
      return {
        backgroundColor: this.nodeTypeConfig.color,
        borderColor: this.nodeTypeConfig.color
      }
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
</style>