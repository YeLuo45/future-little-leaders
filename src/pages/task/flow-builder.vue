<template>
  <view class="flow-builder">
    <!-- Header -->
    <view class="builder-header">
      <view class="header-left" @click="goBack">
        <text class="back-btn">←</text>
      </view>
      <view class="header-title">
        <input 
          v-if="isEditingName"
          class="title-input"
          v-model="flowName"
          @blur="finishEditName"
          @confirm="finishEditName"
          focus
        />
        <text v-else @click="startEditName" class="title-text">{{ flowName || '未命名流程' }}</text>
      </view>
      <view class="header-right">
        <text class="save-btn" @click="saveFlow">保存</text>
      </view>
    </view>
    
    <!-- Main content -->
    <view class="builder-content">
      <!-- Left panel: Node types -->
      <view class="node-panel">
        <view class="panel-title">添加节点</view>
        <view class="node-types">
          <view 
            v-for="(config, type) in NODE_TYPES" 
            :key="type"
            class="node-type-item"
            :style="{ borderColor: config.color }"
            draggable="true"
            @dragstart="onNodeTypeDragStart($event, type)"
            @touchstart="onNodeTypeTouchStart($event, type)"
          >
            <text class="node-type-icon">{{ config.icon }}</text>
            <text class="node-type-label">{{ config.label }}</text>
          </view>
        </view>
        
        <view class="panel-title" style="margin-top: 20px;">操作</view>
        <view class="action-buttons">
          <view class="action-btn" @click="clearCanvas">
            <text>🗑️ 清空画布</text>
          </view>
          <view class="action-btn" @click="previewFlow">
            <text>👁️ 预览流程</text>
          </view>
        </view>
      </view>
      
      <!-- Center: Canvas -->
      <view 
        class="canvas-wrapper"
        ref="canvasWrapper"
        @drop="onDrop"
        @dragover.prevent
        @touchend="onTouchEnd"
      >
        <FlowEditor
          :nodes="currentNodes"
          :connections="currentConnections"
          :selectedNodeId="selectedNodeId"
          :selectedConnectionId="selectedConnectionId"
          @select-node="onSelectNode"
          @select-connection="onSelectConnection"
          @update:nodes="onNodesUpdate"
          @delete-node="onDeleteNode"
          @delete-connection="onDeleteConnection"
          ref="flowEditor"
        />
        
        <!-- Connection mode indicator -->
        <view v-if="isConnectingMode" class="connection-hint">
          <text>点击另一个节点端口完成连接</text>
          <text class="cancel-hint" @click="cancelConnection">取消</text>
        </view>
      </view>
      
      <!-- Right panel: Properties -->
      <view class="property-panel" :class="{ 'show': selectedNode }">
        <view class="panel-title">节点属性</view>
        
        <view v-if="selectedNode" class="property-form">
          <view class="form-item">
            <text class="form-label">名称</text>
            <input 
              class="form-input"
              v-model="selectedNode.config.title"
              placeholder="输入节点名称"
              @input="onNodeConfigChange"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">描述</text>
            <textarea 
              class="form-textarea"
              v-model="selectedNode.config.description"
              placeholder="输入描述"
              @input="onNodeConfigChange"
            ></textarea>
          </view>
          
          <view class="form-item">
            <text class="form-label">积分</text>
            <input 
              class="form-input"
              type="number"
              v-model.number="selectedNode.config.points"
              placeholder="积分"
              @input="onNodeConfigChange"
            />
          </view>
          
          <view class="form-actions">
            <view class="form-btn duplicate-btn" @click="duplicateSelectedNode">
              <text>📋 复制节点</text>
            </view>
          </view>
        </view>
        
        <view v-else class="no-selection">
          <text>选择一个节点查看属性</text>
        </view>
      </view>
    </view>
    
    <!-- Toast message -->
    <view v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </view>
  </view>
</template>

<script>
import FlowEditor from '../../components/flow-editor/FlowEditor.vue'
import { useFlowStore, NODE_TYPES } from '../../stores/flowStore.js'
import { mapState, mapWritableState } from 'pinia'

export default {
  name: 'FlowBuilder',
  
  components: {
    FlowEditor
  },
  
  data() {
    return {
      NODE_TYPES,
      isEditingName: false,
      flowName: '',
      isConnectingMode: false,
      connectingSourceNode: null,
      toast: {
        show: false,
        type: 'info',
        message: ''
      },
      // Track drag state
      dragNodeType: null,
      touchNodeType: null
    }
  },
  
  computed: {
    ...mapState(useFlowStore, ['currentFlow', 'currentNodes', 'currentConnections', 'selectedNodeId', 'selectedConnectionId']),
    ...mapWritableState(useFlowStore, ['selectedNodeId']),
    
    selectedNode() {
      if (!this.selectedNodeId) return null
      return this.currentNodes.find(n => n.id === this.selectedNodeId) || null
    }
  },
  
  onLoad(options) {
    console.log('[V5] Flow builder loaded:', options)
    
    const flowStore = useFlowStore()
    flowStore.init()
    
    if (options.flowId) {
      flowStore.loadFlow(options.flowId)
      this.flowName = flowStore.currentFlow?.name || '未命名流程'
    } else {
      // Create a new flow
      const newFlow = flowStore.createFlow('新流程')
      flowStore.loadFlow(newFlow.id)
      this.flowName = '新流程'
    }
  },
  
  onUnload() {
    console.log('[V5] Flow builder unloaded')
    const flowStore = useFlowStore()
    // Don't auto-save on unload, let user explicitly save
  },
  
  methods: {
    // Navigation
    goBack() {
      console.log('[V5] Going back')
      uni.navigateBack()
    },
    
    // Name editing
    startEditName() {
      this.isEditingName = true
    },
    
    finishEditName() {
      this.isEditingName = false
      if (this.currentFlow) {
        this.currentFlow.name = this.flowName
      }
    },
    
    // Save flow
    saveFlow() {
      console.log('[V5] Saving flow')
      const flowStore = useFlowStore()
      
      if (this.currentFlow) {
        this.currentFlow.name = this.flowName
        flowStore.saveFlow()
        this.showToast('保存成功', 'success')
      }
    },
    
    // Node type drag start
    onNodeTypeDragStart(e, type) {
      console.log('[V5] Node type drag start:', type)
      this.dragNodeType = type
      e.dataTransfer.setData('nodeType', type)
      e.dataTransfer.effectAllowed = 'copy'
    },
    
    // Node type touch start (for mobile)
    onNodeTypeTouchStart(e, type) {
      console.log('[V5] Node type touch start:', type)
      this.touchNodeType = type
    },
    
    // Touch end on canvas (for mobile)
    onTouchEnd(e) {
      if (this.touchNodeType) {
        console.log('[V5] Touch end with node type:', this.touchNodeType)
        
        const touch = e.changedTouches[0]
        if (touch && this.$refs.flowEditor) {
          const rect = this.$refs.canvasWrapper.getBoundingClientRect()
          const x = touch.clientX
          const y = touch.clientY
          
          const canvasX = x - rect.left
          const canvasY = y - rect.top
          
          const flowStore = useFlowStore()
          flowStore.addNode(this.touchNodeType, canvasX - 60, canvasY - 30)
        }
        this.touchNodeType = null
      }
    },
    
    // Drop on canvas
    onDrop(e) {
      console.log('[V5] Drop on canvas')
      const type = e.dataTransfer.getData('nodeType')
      if (!type) return
      
      const flowStore = useFlowStore()
      
      // Get drop position relative to canvas
      const rect = this.$refs.canvasWrapper.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Add node at position
      const node = flowStore.addNode(type, x - 60, y - 30)
      if (node) {
        flowStore.selectNode(node.id)
        this.showToast(`已添加${NODE_TYPES[type].label}`, 'success')
      }
      
      this.dragNodeType = null
    },
    
    // Node selection
    onSelectNode(nodeId) {
      console.log('[V5] Node selected:', nodeId)
      this.selectedNodeId = nodeId
    },
    
    onSelectConnection(connectionId) {
      console.log('[V5] Connection selected:', connectionId)
      this.selectedConnectionId = connectionId
    },
    
    // Node/connection updates
    onNodesUpdate(nodes) {
      console.log('[V5] Nodes updated')
      const flowStore = useFlowStore()
      if (flowStore.currentFlow) {
        flowStore.currentFlow.nodes = nodes
      }
    },
    
    onDeleteNode(nodeId) {
      console.log('[V5] Delete node:', nodeId)
      const flowStore = useFlowStore()
      flowStore.removeNode(nodeId)
      this.selectedNodeId = null
      this.showToast('节点已删除', 'info')
    },
    
    onDeleteConnection(connectionId) {
      console.log('[V5] Delete connection:', connectionId)
      const flowStore = useFlowStore()
      flowStore.removeConnection(connectionId)
      this.selectedConnectionId = null
      this.showToast('连线已删除', 'info')
    },
    
    // Node config change
    onNodeConfigChange() {
      const flowStore = useFlowStore()
      if (this.selectedNode) {
        flowStore.updateNodeConfig(this.selectedNode.id, this.selectedNode.config)
      }
    },
    
    // Duplicate node
    duplicateSelectedNode() {
      if (!this.selectedNodeId) return
      console.log('[V5] Duplicate node:', this.selectedNodeId)
      const flowStore = useFlowStore()
      const newNode = flowStore.duplicateNode(this.selectedNodeId)
      if (newNode) {
        flowStore.selectNode(newNode.id)
        this.showToast('节点已复制', 'success')
      }
    },
    
    // Clear canvas
    clearCanvas() {
      console.log('[V5] Clear canvas')
      const flowStore = useFlowStore()
      flowStore.clearCanvas()
      this.selectedNodeId = null
      this.showToast('画布已清空', 'info')
    },
    
    // Preview flow
    previewFlow() {
      console.log('[V5] Preview flow')
      if (this.currentNodes.length === 0) {
        this.showToast('请先添加节点', 'warning')
        return
      }
      
      // Show flow preview
      const flowData = {
        name: this.flowName,
        nodes: this.currentNodes,
        connections: this.currentConnections
      }
      
      uni.showModal({
        title: '流程预览',
        content: `节点数量: ${flowData.nodes.length}\n连线数量: ${flowData.connections.length}`,
        showCancel: false
      })
    },
    
    // Cancel connection mode
    cancelConnection() {
      this.isConnectingMode = false
      this.connectingSourceNode = null
    },
    
    // Toast helper
    showToast(message, type = 'info') {
      this.toast = { show: true, type, message }
      setTimeout(() => {
        this.toast.show = false
      }, 2000)
    }
  }
}
</script>

<style scoped>
.flow-builder {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f0f0f0;
}

.builder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.header-left, .header-right {
  min-width: 60px;
}

.header-right {
  text-align: right;
}

.back-btn {
  font-size: 24px;
  color: #333;
}

.save-btn {
  color: #3b82f6;
  font-size: 16px;
  font-weight: 500;
}

.header-title {
  flex: 1;
  text-align: center;
}

.title-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.title-input {
  font-size: 16px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  width: 150px;
}

.builder-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.node-panel {
  width: 140px;
  background: #fff;
  border-right: 1px solid #eee;
  padding: 12px;
  overflow-y: auto;
}

.panel-title {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  font-weight: 500;
}

.node-types {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.node-type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: move;
  transition: transform 0.2s, box-shadow 0.2s;
}

.node-type-item:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.node-type-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.node-type-label {
  font-size: 11px;
  color: #666;
  text-align: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
}

.action-btn:active {
  background: #e8e8e8;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.connection-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 100;
  display: flex;
  gap: 12px;
  align-items: center;
}

.cancel-hint {
  color: #f59e0b;
  cursor: pointer;
}

.property-panel {
  width: 0;
  background: #fff;
  border-left: 1px solid #eee;
  overflow: hidden;
  transition: width 0.3s;
}

.property-panel.show {
  width: 200px;
}

.property-form {
  padding: 12px;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.form-input, .form-textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-textarea {
  min-height: 60px;
  resize: none;
}

.form-actions {
  margin-top: 20px;
}

.form-btn {
  padding: 10px;
  border-radius: 6px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 8px;
}

.duplicate-btn {
  background: #f0f9ff;
  color: #3b82f6;
}

.no-selection {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 12px;
}

.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000;
  animation: toast-in 0.3s ease;
}

.toast.success {
  background: #10b981;
  color: #fff;
}

.toast.info {
  background: #3b82f6;
  color: #fff;
}

.toast.warning {
  background: #f59e0b;
  color: #fff;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>