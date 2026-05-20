<template>
  <view class="flow-editor" @click="onCanvasClick">
    <!-- Zoom controls -->
    <view class="zoom-controls">
      <view class="zoom-btn" @click="zoomIn">+</view>
      <text class="zoom-level">{{ Math.round(scale * 100) }}%</text>
      <view class="zoom-btn" @click="zoomOut">-</view>
      <view class="zoom-btn" @click="resetZoom">⟲</view>
    </view>
    
    <!-- Canvas container -->
    <view 
      class="canvas-container"
      ref="canvasContainer"
      @mousedown="onCanvasMouseDown"
      @mousemove="onCanvasMouseMove"
      @mouseup="onCanvasMouseUp"
      @touchstart="onCanvasTouchStart"
      @touchmove="onCanvasTouchMove"
      @touchend="onCanvasTouchEnd"
      @wheel="onWheel"
      >
        <!-- Canvas content (transformable) -->
        <view
          class="canvas-content"
          :style="canvasStyle"
        >
          <!-- Connections layer (SVG) -->
          <FlowConnector
            v-for="conn in connections"
            :key="conn.id"
            :connection="conn"
            :sourceNode="getNodeById(conn.source)"
            :targetNode="getNodeById(conn.target)"
            :isSelected="selectedConnectionId === conn.id"
            :isRunning="runningNodeId === conn.source"
            @select="onConnectionSelect"
            @delete="onConnectionDelete"
          />

          <!-- Temp connection line while dragging -->
        <svg v-if="connectingState.isConnecting" class="temp-connector" :style="tempConnectorStyle">
          <path
            :d="tempPathData"
            stroke="#3b82f6"
            stroke-width="2"
            fill="none"
            stroke-dasharray="5,5"
          />
        </svg>
        
        <!-- Nodes layer -->
        <FlowNode
          v-for="node in nodes"
          :key="node.id"
          :node="node"
          :isSelected="selectedNodeId === node.id"
          :isConnecting="isDraggingFromPort && connectingFromNodeId === node.id"
          :isPreviewHighlighted="previewHighlightNodeId === node.id"
          :isRunning="runningNodeId === node.id"
          :isCompleted="completedNodeIds.includes(node.id)"
          :nodeExecutionTime="nodeExecutionTimes[node.id]"
          :branchDecision="branchDecisions[node.id]"
          @select="onNodeSelect"
          @dragstart="onNodeDragStart"
          @portdragstart="onPortDragStart"
          @inputportdragstart="onInputPortDragStart"
          @trueportdragstart="onTruePortDragStart"
          @falseportdragstart="onFalsePortDragStart"
        />
      </view>
    </view>
    
    <!-- Delete button (shown when something selected) -->
    <view 
      v-if="selectedNodeId || selectedConnectionId"
      class="delete-btn"
      @click="onDelete"
    >
      🗑️ 删除
    </view>
  </view>
</template>

<script>
import FlowNode from './FlowNode.vue'
import FlowConnector from './FlowConnector.vue'
import { NODE_TYPES } from '../../stores/flowStore.js'

export default {
  name: 'FlowEditor',
  
  components: {
    FlowNode,
    FlowConnector
  },
  
  props: {
    nodes: {
      type: Array,
      default: () => []
    },
    connections: {
      type: Array,
      default: () => []
    },
    selectedNodeId: {
      type: String,
      default: null
    },
    selectedConnectionId: {
      type: String,
      default: null
    },
    runningNodeId: {
      type: String,
      default: null
    },
    completedNodeIds: {
      type: Array,
      default: () => []
    },
    nodeExecutionTimes: {
      type: Object,
      default: () => {}
    },
    branchDecisions: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['update:nodes', 'update:connections', 'select-node', 'select-connection', 'delete-node', 'delete-connection', 'node-run-start'],
  
  data() {
    return {
      scale: 1,
      translateX: 0,
      translateY: 0,

      // Panning state
      isPanning: false,
      panStartX: 0,
      panStartY: 0,

      // Node dragging state
      draggingNodeId: null,
      dragStartX: 0,
      dragStartY: 0,
      nodeStartX: 0,
      nodeStartY: 0,

      // Connecting state
      connectingState: {
        isConnecting: false,
        sourceNodeId: null,
        sourcePortType: null, // 'output', 'true', 'false'
        tempX: 0,
        tempY: 0
      },

      // Preview highlight state
      previewHighlightNodeId: null
    }
  },
  
  computed: {
    canvasStyle() {
      return {
        transform: `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`,
        transformOrigin: '0 0'
      }
    },
    
    tempConnectorStyle() {
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '5000px',
        height: '5000px',
        pointerEvents: 'none',
        overflow: 'visible'
      }
    },
    
    tempPathData() {
      if (!this.connectingState.isConnecting) return ''
      
      const sourceNode = this.getNodeById(this.connectingState.sourceNodeId)
      if (!sourceNode) return ''
      
      const nodeWidth = 120
      const nodeHeight = 60
      
      const x1 = sourceNode.x + nodeWidth / 2
      const y1 = sourceNode.y + nodeHeight
      const x2 = this.connectingState.tempX
      const y2 = this.connectingState.tempY
      
      const cpOffset = Math.min(Math.abs(y2 - y1) * 0.5, 80)
      
      return `M ${x1} ${y1} C ${x1} ${y1 + cpOffset}, ${x2} ${y2 - cpOffset}, ${x2} ${y2}`
    },
    
    NODE_TYPES() {
      return NODE_TYPES
    }
  },
  
  methods: {
    // Get node by ID
    getNodeById(nodeId) {
      return this.nodes.find(n => n.id === nodeId) || null
    },
    
    // Zoom methods
    zoomIn() {
      this.scale = Math.min(this.scale + 0.1, 2)
      console.log('[V5] Zoom in:', this.scale)
    },
    
    zoomOut() {
      this.scale = Math.max(this.scale - 0.1, 0.3)
      console.log('[V5] Zoom out:', this.scale)
    },
    
    resetZoom() {
      this.scale = 1
      this.translateX = 0
      this.translateY = 0
      console.log('[V5] Reset zoom')
    },
    
    // Canvas events
    onCanvasClick(e) {
      console.log('[V5] Canvas clicked')
      // Deselect when clicking empty canvas
      if (e.target.classList.contains('canvas-content') || e.target.classList.contains('canvas-container')) {
        this.$emit('select-node', null)
        this.$emit('select-connection', null)
      }
    },
    
    onCanvasMouseDown(e) {
      if (e.button !== 0) return // Only left click
      
      // Check if clicking on empty canvas area
      if (e.target.classList.contains('canvas-content') || e.target.classList.contains('connections-layer')) {
        this.isPanning = true
        this.panStartX = e.clientX - this.translateX
        this.panStartY = e.clientY - this.translateY
        console.log('[V5] Canvas pan started')
      }
    },
    
    onCanvasMouseMove(e) {
      // Handle panning
      if (this.isPanning) {
        this.translateX = e.clientX - this.panStartX
        this.translateY = e.clientY - this.panStartY
      }
      
      // Handle node dragging
      if (this.draggingNodeId) {
        const dx = (e.clientX - this.dragStartX) / this.scale
        const dy = (e.clientY - this.dragStartY) / this.scale
        
        const newX = this.nodeStartX + dx
        const newY = this.nodeStartY + dy
        
        this.$emit('update:nodes', this.nodes.map(n => {
          if (n.id === this.draggingNodeId) {
            return { ...n, x: newX, y: newY }
          }
          return n
        }))
      }
      
      // Handle connection dragging
      if (this.connectingState.isConnecting) {
        const rect = e.target.getBoundingClientRect()
        this.connectingState.tempX = (e.clientX - rect.left - this.translateX) / this.scale
        this.connectingState.tempY = (e.clientY - rect.top - this.translateY) / this.scale
      }
    },
    
    onCanvasMouseUp(e) {
      // End panning
      if (this.isPanning) {
        this.isPanning = false
        console.log('[V5] Canvas pan ended')
      }
      
      // End node dragging
      if (this.draggingNodeId) {
        console.log('[V5] Node drag ended:', this.draggingNodeId)
        this.draggingNodeId = null
      }
      
      // End connecting
      if (this.connectingState.isConnecting) {
        this.connectingState.isConnecting = false
        this.connectingState.sourceNodeId = null
        console.log('[V5] Connection cancelled')
      }
    },
    
    // Touch events for mobile
    onCanvasTouchStart(e) {
      if (e.touches.length === 1) {
        const touch = e.touches[0]
        const target = e.target
        
        if (target.classList.contains('canvas-content') || target.classList.contains('connections-layer')) {
          this.isPanning = true
          this.panStartX = touch.clientX - this.translateX
          this.panStartY = touch.clientY - this.translateY
        }
      }
    },
    
    onCanvasTouchMove(e) {
      if (e.touches.length === 1) {
        const touch = e.touches[0]
        
        if (this.isPanning) {
          this.translateX = touch.clientX - this.panStartX
          this.translateY = touch.clientY - this.panStartY
        }
        
        if (this.draggingNodeId) {
          const dx = (touch.clientX - this.dragStartX) / this.scale
          const dy = (touch.clientY - this.dragStartY) / this.scale
          
          const newX = this.nodeStartX + dx
          const newY = this.nodeStartY + dy
          
          this.$emit('update:nodes', this.nodes.map(n => {
            if (n.id === this.draggingNodeId) {
              return { ...n, x: newX, y: newY }
            }
            return n
          }))
        }
      }
    },
    
    onCanvasTouchEnd(e) {
      this.isPanning = false
      this.draggingNodeId = null
      this.connectingState.isConnecting = false
    },
    
    // Wheel zoom
    onWheel(e) {
      e.preventDefault()
      
      const delta = e.deltaY > 0 ? -0.05 : 0.05
      const newScale = Math.max(0.3, Math.min(2, this.scale + delta))
      
      // Zoom towards mouse position
      const rect = e.target.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      this.translateX -= mouseX * (newScale - this.scale)
      this.translateY -= mouseY * (newScale - this.scale)
      
      this.scale = newScale
      console.log('[V5] Wheel zoom:', this.scale)
    },
    
    // Node events
    onNodeSelect(nodeId) {
      console.log('[V5] Node selected:', nodeId)
      this.$emit('select-node', nodeId)
      this.$emit('select-connection', null)
    },
    
    onNodeDragStart({ nodeId, event }) {
      console.log('[V5] Node drag start:', nodeId)
      this.draggingNodeId = nodeId
      
      const node = this.getNodeById(nodeId)
      if (node) {
        this.dragStartX = event.clientX || event.touches[0].clientX
        this.dragStartY = event.clientY || event.touches[0].clientY
        this.nodeStartX = node.x
        this.nodeStartY = node.y
      }
    },
    
    // Port drag start (from output port - creates connection)
    onPortDragStart({ nodeId, portType, event }) {
      console.log('[V5] Port drag start:', nodeId, portType)
      
      const clientX = event.clientX || event.touches[0].clientX
      const clientY = event.clientY || event.touches[0].clientY
      
      const rect = event.target.getBoundingClientRect()
      
      this.connectingState = {
        isConnecting: true,
        sourceNodeId: nodeId,
        tempX: clientX - rect.left - this.translateX,
        tempY: clientY - rect.top - this.translateY
      }
    },
    
    // Input port drag start (from input port - creates connection)
    onInputPortDragStart({ nodeId, portType, event }) {
      console.log('[V5] Input port drag start:', nodeId, portType)
      
      const clientX = event.clientX || event.touches[0].clientX
      const clientY = event.clientY || event.touches[0].clientY
      
      const rect = event.target.getBoundingClientRect()
      
      this.connectingState = {
        isConnecting: true,
        sourceNodeId: nodeId,
        tempX: clientX - rect.left - this.translateX,
        tempY: clientY - rect.top - this.translateY
      }
    },
    
    // Connection events
    onConnectionSelect(connectionId) {
      console.log('[V5] Connection selected:', connectionId)
      this.$emit('select-connection', connectionId)
      this.$emit('select-node', null)
    },
    
    onConnectionDelete(connectionId) {
      console.log('[V5] Connection delete:', connectionId)
      this.$emit('delete-connection', connectionId)
    },
    
    // Delete selected
    onDelete() {
      if (this.selectedNodeId) {
        console.log('[V5] Delete selected node:', this.selectedNodeId)
        this.$emit('delete-node', this.selectedNodeId)
      } else if (this.selectedConnectionId) {
        console.log('[V5] Delete selected connection:', this.selectedConnectionId)
        this.$emit('delete-connection', this.selectedConnectionId)
      }
    },
    
    // Public method to handle dropping a new node type onto canvas
    addNodeAtPosition(type, x, y) {
      // Convert screen coordinates to canvas coordinates
      const canvasRect = this.$refs.canvasContainer?.getBoundingClientRect()
      if (!canvasRect) return null

      const canvasX = (x - canvasRect.left - this.translateX) / this.scale
      const canvasY = (y - canvasRect.top - this.translateY) / this.scale

      console.log('[V5] Adding node at position:', type, canvasX, canvasY)
      return { type, x: canvasX, y: canvasY }
    },

    // True port drag (condition node)
    onTruePortDragStart({ nodeId, portType, event }) {
      console.log('[V5] True port drag start:', nodeId)
      const clientX = event.clientX || event.touches[0].clientX
      const clientY = event.clientY || event.touches[0].clientY
      const rect = event.target.getBoundingClientRect()
      this.connectingState = {
        isConnecting: true,
        sourceNodeId: nodeId,
        sourcePortType: 'true',
        tempX: clientX - rect.left - this.translateX,
        tempY: clientY - rect.top - this.translateY
      }
    },

    // False port drag (condition node)
    onFalsePortDragStart({ nodeId, portType, event }) {
      console.log('[V5] False port drag start:', nodeId)
      const clientX = event.clientX || event.touches[0].clientX
      const clientY = event.clientY || event.touches[0].clientY
      const rect = event.target.getBoundingClientRect()
      this.connectingState = {
        isConnecting: true,
        sourceNodeId: nodeId,
        sourcePortType: 'false',
        tempX: clientX - rect.left - this.translateX,
        tempY: clientY - rect.top - this.translateY
      }
    },

    // Public: set preview highlight from parent
    setPreviewHighlight(nodeId) {
      this.previewHighlightNodeId = nodeId
    }
  }
}
</script>

<style scoped>
.flow-editor {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg-main, #f5f5f5);
  background-image: 
    radial-gradient(circle, var(--border-color, #ddd) 1px, transparent 1px);
  background-size: 20px 20px;
}

[data-theme="dark"] .flow-editor {
  background-image: 
    radial-gradient(circle, #333 1px, transparent 1px);
}

.canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  cursor: grab;
}

.canvas-container:active {
  cursor: grabbing;
}

.canvas-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 5000px;
  height: 5000px;
}

.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.temp-connector {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.zoom-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: #fff;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.zoom-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.zoom-btn:active {
  background: #e0e0e0;
}

.zoom-level {
  font-size: 12px;
  color: #666;
  margin: 4px 0;
}

.delete-btn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 12px 20px;
  background: #ef4444;
  color: #fff;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  z-index: 100;
}

.delete-btn:active {
  background: #dc2626;
}
</style>