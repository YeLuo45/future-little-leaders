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
          :runningNodeId="runningNodeId"
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
      <NodeConfigPanel
        :node="selectedNodeForConfig"
        @update:node="onNodeConfigUpdate"
        @close="selectedNodeId = null"
        @select-branch="onSelectBranch"
      />
    </view>

    <!-- Bottom toolbar -->
    <FlowToolbar
      :isPreviewing="isPreviewing"
      :executionStatus="executionStatus"
      :currentNodeName="currentPreviewNodeName"
      @save="saveFlow"
      @clear="clearCanvas"
      @preview="togglePreview"
      @execute="executeFlow"
      @history="showHistory"
    />

    <!-- Flow history panel -->
    <FlowHistory
      :flowId="currentFlow?.id"
      :class="{ open: showHistory }"
      @close="showHistory = false"
      ref="flowHistory"
    />
    
    <!-- Toast message -->
    <view v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </view>
  </view>
</template>

<script>
import FlowEditor from '../../components/flow-editor/FlowEditor.vue'
import NodeConfigPanel from '../../components/flow-editor/NodeConfigPanel.vue'
import FlowToolbar from '../../components/flow-editor/FlowToolbar.vue'
import FlowHistory from '../../components/flow-editor/FlowHistory.vue'
import { useFlowStore, NODE_TYPES } from '../../stores/flowStore.js'
import { FlowExecutor } from '../../services/flowExecutor.js'
import { mapState, mapWritableState } from 'pinia'

export default {
  name: 'FlowBuilder',
  
  components: {
    FlowEditor,
    NodeConfigPanel,
    FlowToolbar,
    FlowHistory
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
      touchNodeType: null,
      // Preview state
      isPreviewing: false,
      previewNodeIds: [],
      previewIndex: 0,
      previewTimer: null,
      executionStatus: 'idle',
      currentPreviewNodeName: '',
      // Branch selection state
      branchSelectionTarget: null,
      branchSelectionBranch: null,
      // History panel
      showHistory: false,
      runningNodeId: null
    }
  },
  
  computed: {
    ...mapState(useFlowStore, ['currentFlow', 'currentNodes', 'currentConnections', 'selectedNodeId', 'selectedConnectionId']),
    ...mapWritableState(useFlowStore, ['selectedNodeId']),
    
    selectedNode() {
      if (!this.selectedNodeId) return null
      return this.currentNodes.find(n => n.id === this.selectedNodeId) || null
    },

    selectedNodeForConfig() {
      return this.selectedNode
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
    },

    // Preview flow (sequential node highlight)
    togglePreview() {
      if (this.isPreviewing) {
        this.stopPreview()
      } else {
        this.startPreview()
      }
    },

    startPreview() {
      if (this.currentNodes.length === 0) {
        this.showToast('请先添加节点', 'warning')
        return
      }
      this.isPreviewing = true
      this.executionStatus = 'running'
      // Build execution order via topological sort
      const ordered = this.buildExecutionOrder()
      this.previewNodeIds = ordered
      this.previewIndex = 0
      this.highlightNextPreviewNode()
    },

    stopPreview() {
      this.isPreviewing = false
      this.executionStatus = 'idle'
      this.previewNodeIds = []
      this.previewIndex = 0
      this.currentPreviewNodeName = ''
      if (this.previewTimer) {
        clearTimeout(this.previewTimer)
        this.previewTimer = null
      }
      // Clear highlight via FlowEditor ref
      this.$refs.flowEditor?.setPreviewHighlight(null)
    },

    highlightNextPreviewNode() {
      if (!this.isPreviewing || this.previewIndex >= this.previewNodeIds.length) {
        this.showToast('预览结束', 'info')
        this.isPreviewing = false
        this.executionStatus = 'completed'
        this.$refs.flowEditor?.setPreviewHighlight(null)
        return
      }
      const nodeId = this.previewNodeIds[this.previewIndex]
      const node = this.currentNodes.find(n => n.id === nodeId)
      if (node) {
        this.currentPreviewNodeName = node.config?.title || node.label || node.type
        // Use FlowEditor ref to set preview highlight
        this.$refs.flowEditor?.setPreviewHighlight(nodeId)
      }
      this.previewIndex++
      this.previewTimer = setTimeout(() => this.highlightNextPreviewNode(), 400)
    },

    buildExecutionOrder() {
      // Simple topological sort based on connections
      const nodeIds = this.currentNodes.map(n => n.id)
      const inDegree = {}
      const adj = {}
      nodeIds.forEach(id => {
        inDegree[id] = 0
        adj[id] = []
      })
      this.currentConnections.forEach(conn => {
        if (adj[conn.source]) {
          adj[conn.source].push(conn.target)
          inDegree[conn.target] = (inDegree[conn.target] || 0) + 1
        }
      })
      const queue = nodeIds.filter(id => !inDegree[id])
      const result = []
      while (queue.length) {
        const id = queue.shift()
        result.push(id)
        adj[id].forEach(target => {
          inDegree[target]--
          if (inDegree[target] === 0) queue.push(target)
        })
      }
      return result.length ? result : nodeIds
    },

    executeFlow() {
      if (!this.currentFlow || this.currentNodes.length === 0) {
        this.showToast('请先保存流程', 'warning')
        return
      }
      const executor = new FlowExecutor(this.currentFlow)
      executor.start()
      this.showToast('流程已开始', 'success')
      this.executionStatus = 'running'
    },

    onNodeConfigUpdate(updatedNode) {
      if (!updatedNode) return
      const flowStore = useFlowStore()
      flowStore.updateNodeConfig(updatedNode.id, updatedNode.config)
      this.$emit('update:nodes', this.currentNodes.map(n =>
        n.id === updatedNode.id ? { ...n, config: updatedNode.config } : n
      ))
    },

    onSelectBranch({ branch, targetNodeId }) {
      // Update the condition node's branch target
      console.log('[V5] Branch selection:', branch, targetNodeId)
    },

    showHistory() {
      this.showHistory = !this.showHistory
    },

    executeFlow() {
      if (!this.currentFlow || this.currentNodes.length === 0) {
        this.showToast('请先保存流程', 'warning')
        return
      }
      const executor = new FlowExecutor(this.currentFlow)
      const startTime = Date.now()
      this.executionStatus = 'running'

      // Animate through nodes sequentially
      const nodeIds = this.currentNodes.map(n => n.id)
      let index = 0

      const animateNext = () => {
        if (index < nodeIds.length) {
          this.runningNodeId = nodeIds[index]
          index++
          setTimeout(animateNext, 600)
        } else {
          this.runningNodeId = null
          const endTime = Date.now()
          this.$refs.flowHistory?.recordExecution({
            flowName: this.flowName,
            flowId: this.currentFlow.id,
            startTime,
            endTime,
            totalNodes: this.currentNodes.length,
            completedNodes: this.currentNodes.length,
            points: Math.floor(Math.random() * 50) + 10,
            status: 'completed'
          })
          this.executionStatus = 'idle'
          this.showToast('流程执行完成', 'success')
        }
      }

      // Record execution start
      this.$refs.flowHistory?.recordExecution({
        flowName: this.flowName,
        flowId: this.currentFlow.id,
        startTime,
        totalNodes: this.currentNodes.length,
        completedNodes: 0,
        status: 'running'
      })

      executor.start()
      animateNext()
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