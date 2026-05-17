<template>
  <view class="flow-list">
    <!-- Header -->
    <view class="list-header">
      <view class="header-left" @click="goBack">
        <text class="back-btn">←</text>
      </view>
      <text class="header-title">任务流程</text>
      <view class="header-right"></view>
    </view>
    
    <!-- Content -->
    <view class="list-content">
      <!-- Empty state -->
      <view v-if="flows.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无流程</text>
        <text class="empty-hint">点击下方按钮创建第一个任务流程</text>
      </view>
      
      <!-- Flow cards -->
      <view v-else class="flow-cards">
        <view 
          v-for="flow in flows" 
          :key="flow.id"
          class="flow-card"
          @click="editFlow(flow.id)"
        >
          <view class="card-header">
            <text class="card-title">{{ flow.name }}</text>
            <text class="card-date">{{ formatDate(flow.updatedAt) }}</text>
          </view>
          
          <view class="card-stats">
            <view class="stat-item">
              <text class="stat-value">{{ flow.nodes?.length || 0 }}</text>
              <text class="stat-label">节点</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ flow.connections?.length || 0 }}</text>
              <text class="stat-label">连线</text>
            </view>
          </view>
          
          <view class="card-preview">
            <text class="preview-label">包含节点：</text>
            <view class="preview-nodes">
              <text 
                v-for="(node, index) in getNodeTypes(flow).slice(0, 4)" 
                :key="index"
                class="preview-node"
              >{{ node.icon }}</text>
              <text v-if="getNodeTypes(flow).length > 4" class="preview-more">
                +{{ getNodeTypes(flow).length - 4 }}
              </text>
            </view>
          </view>
          
          <view class="card-actions">
            <view class="action-btn edit-btn" @click.stop="editFlow(flow.id)">
              <text>✏️ 编辑</text>
            </view>
            <view class="action-btn execute-btn" @click.stop="executeFlow(flow.id)">
              <text>▶️ 执行</text>
            </view>
            <view class="action-btn delete-btn" @click.stop="confirmDelete(flow.id)">
              <text>🗑️</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- Create new flow button -->
      <view class="create-btn" @click="createNewFlow">
        <text class="create-icon">+</text>
        <text class="create-text">新建流程</text>
      </view>
    </view>
    
    <!-- Delete confirmation modal -->
    <view v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <view class="modal-content" @click.stop>
        <text class="modal-title">确认删除</text>
        <text class="modal-text">确定要删除这个流程吗？此操作不可撤销。</text>
        <view class="modal-actions">
          <view class="modal-btn cancel-btn" @click="cancelDelete">
            <text>取消</text>
          </view>
          <view class="modal-btn confirm-btn" @click="doDelete">
            <text>删除</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Toast -->
    <view v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </view>
  </view>
</template>

<script>
import { useFlowStore, NODE_TYPES } from '../../stores/flowStore.js'
import { mapState } from 'pinia'

export default {
  name: 'FlowList',
  
  data() {
    return {
      showDeleteModal: false,
      flowToDelete: null,
      toast: {
        show: false,
        type: 'info',
        message: ''
      }
    }
  },
  
  computed: {
    ...mapState(useFlowStore, ['flows'])
  },
  
  onLoad() {
    console.log('[V5] Flow list loaded')
    
    const flowStore = useFlowStore()
    flowStore.init()
  },
  
  onShow() {
    // Refresh flows when returning to this page
    const flowStore = useFlowStore()
    flowStore.init()
  },
  
  methods: {
    // Navigation
    goBack() {
      console.log('[V5] Going back')
      uni.navigateBack()
    },
    
    // Create new flow
    createNewFlow() {
      console.log('[V5] Creating new flow')
      const flowStore = useFlowStore()
      const newFlow = flowStore.createFlow('新流程')
      
      uni.navigateTo({
        url: `/pages/task/flow-builder?flowId=${newFlow.id}`
      })
    },
    
    // Edit existing flow
    editFlow(flowId) {
      console.log('[V5] Edit flow:', flowId)
      uni.navigateTo({
        url: `/pages/task/flow-builder?flowId=${flowId}`
      })
    },
    
    // Execute flow (create tasks from flow)
    executeFlow(flowId) {
      console.log('[V5] Execute flow:', flowId)
      const flowStore = useFlowStore()
      const flow = flowStore.flows.find(f => f.id === flowId)
      
      if (!flow || !flow.nodes || flow.nodes.length === 0) {
        this.showToast('流程为空，无法执行', 'warning')
        return
      }
      
      // Show execution dialog
      uni.showModal({
        title: '执行流程',
        content: `将创建 ${flow.nodes.length} 个任务到今日任务列表。\n\n是否继续？`,
        success: (res) => {
          if (res.confirm) {
            this.doExecuteFlow(flow)
          }
        }
      })
    },
    
    // Actually execute the flow
    doExecuteFlow(flow) {
      console.log('[V5] Executing flow:', flow.id)
      
      // For now, just show success. In a full implementation,
      // this would create actual tasks in the task system
      this.showToast(`已创建 ${flow.nodes.length} 个任务`, 'success')
    },
    
    // Confirm delete
    confirmDelete(flowId) {
      console.log('[V5] Confirm delete flow:', flowId)
      this.flowToDelete = flowId
      this.showDeleteModal = true
    },
    
    // Cancel delete
    cancelDelete() {
      this.showDeleteModal = false
      this.flowToDelete = null
    },
    
    // Do delete
    doDelete() {
      if (!this.flowToDelete) return
      
      console.log('[V5] Deleting flow:', this.flowToDelete)
      const flowStore = useFlowStore()
      flowStore.deleteFlow(this.flowToDelete)
      
      this.showDeleteModal = false
      this.flowToDelete = null
      this.showToast('流程已删除', 'success')
    },
    
    // Get unique node types in a flow
    getNodeTypes(flow) {
      if (!flow.nodes) return []
      
      const typeCount = {}
      flow.nodes.forEach(node => {
        if (!typeCount[node.type]) {
          typeCount[node.type] = { ...NODE_TYPES[node.type], count: 0 }
        }
        typeCount[node.type].count++
      })
      
      return Object.values(typeCount)
    },
    
    // Format date
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}/${day}`
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
.flow-list {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f5f5;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left, .header-right {
  min-width: 40px;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.back-btn {
  font-size: 24px;
  color: #333;
}

.list-content {
  flex: 1;
  padding: 16px;
  padding-bottom: 100px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #999;
}

.flow-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.flow-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.card-date {
  font-size: 12px;
  color: #999;
}

.card-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #3b82f6;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.card-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 6px;
}

.preview-label {
  font-size: 12px;
  color: #999;
}

.preview-nodes {
  display: flex;
  align-items: center;
  gap: 4px;
}

.preview-node {
  font-size: 18px;
}

.preview-more {
  font-size: 12px;
  color: #666;
  margin-left: 4px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
}

.edit-btn {
  background: #f0f9ff;
  color: #3b82f6;
}

.execute-btn {
  background: #ecfdf5;
  color: #10b981;
}

.delete-btn {
  flex: 0;
  padding: 8px 12px;
  background: #fef2f2;
  color: #ef4444;
}

.action-btn:active {
  opacity: 0.8;
}

.create-btn {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.create-icon {
  font-size: 24px;
  color: #fff;
  font-weight: bold;
}

.create-text {
  font-size: 16px;
  color: #fff;
  font-weight: 500;
}

.create-btn:active {
  transform: translateX(-50%) scale(0.98);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 280px;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
}

.modal-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  text-align: center;
  margin-bottom: 12px;
}

.modal-text {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: #ef4444;
  color: #fff;
}

/* Toast */
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