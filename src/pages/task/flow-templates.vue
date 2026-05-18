<template>
  <view class="flow-templates-page">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="icon">←</text>
      </view>
      <text class="title">模板市场</text>
      <view class="placeholder"></view>
    </view>

    <!-- Tabs -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'builtin' }"
        @click="activeTab = 'builtin'"
      >
        <text>推荐模板</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'user' }"
        @click="activeTab = 'user'"
      >
        <text>我的模板</text>
      </view>
    </view>

    <!-- Search Bar -->
    <view class="search-bar">
      <input
        class="search-input"
        v-model="searchKeyword"
        placeholder="搜索模板名称或标签..."
        @input="onSearch"
      />
    </view>

    <!-- Template List -->
    <scroll-view class="template-list" scroll-y>
      <view v-if="activeTab === 'builtin'">
        <view class="builtin-badge">官方</view>
        <view
          class="template-card"
          v-for="template in filteredBuiltinTemplates"
          :key="template.id"
          @click="showPreview(template)"
        >
          <view class="card-icon">{{ template.icon }}</view>
          <view class="card-content">
            <text class="card-title">{{ template.name }}</text>
            <text class="card-desc">{{ template.description }}</text>
            <view class="card-meta">
              <text class="node-count">{{ template.nodes.length }} 个节点</text>
              <view class="tags">
                <text class="tag" v-for="tag in template.tags" :key="tag">{{ tag }}</text>
              </view>
            </view>
          </view>
          <view class="card-arrow">›</view>
        </view>

        <view v-if="filteredBuiltinTemplates.length === 0" class="empty-state">
          <text class="empty-icon">🔍</text>
          <text class="empty-text">未找到匹配的模板</text>
        </view>
      </view>

      <view v-else>
        <view
          class="template-card"
          v-for="template in filteredUserTemplates"
          :key="template.id"
          @click="showPreview(template)"
        >
          <view class="card-icon">📋</view>
          <view class="card-content">
            <text class="card-title">{{ template.name }}</text>
            <text class="card-desc">{{ template.description || '自定义流程' }}</text>
            <view class="card-meta">
              <text class="node-count">{{ template.nodes?.length || 0 }} 个节点</text>
            </view>
          </view>
          <view class="card-arrow">›</view>
        </view>

        <view v-if="filteredUserTemplates.length === 0" class="empty-state">
          <text class="empty-icon">📝</text>
          <text class="empty-text">暂无自定义模板</text>
        </view>
      </view>
    </scroll-view>

    <!-- Import Section -->
    <view class="import-section">
      <text class="import-title">导入自定义模板</text>
      <view class="import-buttons">
        <button class="import-btn" @click="chooseJSONFile">导入 JSON</button>
        <button class="import-btn" @click="chooseYAMLFile">导入 YAML</button>
      </view>
    </view>

    <!-- Preview Modal -->
    <view class="preview-modal" v-if="showModal" @click="closePreview">
      <view class="preview-content" @click.stop>
        <view class="preview-header">
          <text class="preview-icon">{{ currentTemplate?.icon }}</text>
          <text class="preview-title">{{ currentTemplate?.name }}</text>
          <view class="close-btn" @click="closePreview">×</view>
        </view>

        <scroll-view class="preview-body" scroll-y>
          <text class="preview-desc">{{ currentTemplate?.description }}</text>
          
          <view class="node-list-title">节点列表</view>
          <view 
            class="node-item" 
            v-for="(node, index) in currentTemplate?.nodes" 
            :key="node.id"
          >
            <text class="node-index">{{ index + 1 }}</text>
            <text class="node-type-icon">{{ getNodeIcon(node.type) }}</text>
            <view class="node-info">
              <text class="node-label">{{ node.label }}</text>
              <text class="node-config">{{ node.config.title }}</text>
            </view>
            <text class="node-points">+{{ node.config.points }}分</text>
          </view>

          <view class="connection-hint">
            <text>连接: {{ currentTemplate?.connections?.length || 0 }} 条</text>
          </view>
        </scroll-view>

        <view class="preview-footer">
          <button class="action-btn secondary" @click="exportTemplate">导出</button>
          <button class="action-btn primary" @click="importTemplate">导入使用</button>
        </view>
      </view>
    </view>

    <!-- Export Modal -->
    <view class="preview-modal" v-if="showExportModal" @click="closeExportModal">
      <view class="preview-content export-modal" @click.stop>
        <view class="preview-header">
          <text class="preview-title">导出模板</text>
          <view class="close-btn" @click="closeExportModal">×</view>
        </view>
        <view class="export-options">
          <button class="export-option" @click="doExportJSON">导出为 JSON</button>
          <button class="export-option" @click="doExportYAML">导出为 YAML</button>
          <button class="export-option" @click="doCopyJSON">复制 JSON</button>
          <button class="export-option" @click="doCopyYAML">复制 YAML</button>
        </view>
      </view>
    </view>

    <!-- Toast -->
    <view class="toast" v-if="toast.show">{{ toast.message }}</view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getFlowTemplates } from '@/data/flowTemplates.js'
import { downloadAsJSON, downloadAsYAML, copyAsJSON, copyAsYAML } from '@/utils/flowExporter.js'
import { importFromJSON, importFromYAML, validateFlow } from '@/utils/flowImporter.js'
import { useFlowStore } from '@/stores/flowStore.js'

const flowStore = useFlowStore()

// Tab state
const activeTab = ref('builtin')

// Search
const searchKeyword = ref('')
const allTemplates = getFlowTemplates()
const userTemplates = computed(() => flowStore.flows || [])

const filteredBuiltinTemplates = computed(() => {
  let templates = allTemplates
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    templates = templates.filter(t =>
      t.name.toLowerCase().includes(keyword) ||
      t.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }
  return templates
})

const filteredUserTemplates = computed(() => {
  let templates = userTemplates.value
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    templates = templates.filter(t =>
      t.name.toLowerCase().includes(keyword)
    )
  }
  return templates
})

// Preview Modal
const showModal = ref(false)
const currentTemplate = ref(null)

function showPreview(template) {
  currentTemplate.value = template
  showModal.value = true
}

function closePreview() {
  showModal.value = false
}

function getNodeIcon(type) {
  const icons = {
    checkin: '✅',
    study: '📚',
    exercise: '🏃',
    habit: '🌱'
  }
  return icons[type] || '📋'
}

// Export Modal
const showExportModal = ref(false)

function exportTemplate() {
  showExportModal.value = true
}

function closeExportModal() {
  showExportModal.value = false
}

function doExportJSON() {
  downloadAsJSON(currentTemplate.value)
  closeExportModal()
  showToast('已下载 JSON 文件')
}

function doExportYAML() {
  downloadAsYAML(currentTemplate.value)
  closeExportModal()
  showToast('已下载 YAML 文件')
}

async function doCopyJSON() {
  const success = await copyAsJSON(currentTemplate.value)
  closeExportModal()
  showToast(success ? '已复制到剪贴板' : '复制失败')
}

async function doCopyYAML() {
  const success = await copyAsYAML(currentTemplate.value)
  closeExportModal()
  showToast(success ? '已复制到剪贴板' : '复制失败')
}

// Import Template
function importTemplate() {
  if (!currentTemplate.value) return
  
  // Create new flow from template
  const newFlow = flowStore.createFlow(currentTemplate.value.name + ' (副本)')
  
  // Deep copy nodes with new IDs
  const nodeIdMap = {}
  const newNodes = currentTemplate.value.nodes.map(node => {
    const newId = 'node-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    nodeIdMap[node.id] = newId
    return {
      ...JSON.parse(JSON.stringify(node)),
      id: newId
    }
  })
  
  // Update connections with new node IDs
  const newConnections = currentTemplate.value.connections.map(conn => ({
    ...conn,
    id: 'conn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    source: nodeIdMap[conn.source] || conn.source,
    target: nodeIdMap[conn.target] || conn.target
  }))
  
  // Load into store
  flowStore.loadFlow(newFlow.id)
  flowStore.clearCanvas()
  
  // Add nodes
  newNodes.forEach(node => {
    flowStore.currentFlow.nodes.push(node)
  })
  
  // Add connections
  newConnections.forEach(conn => {
    flowStore.currentFlow.connections.push(conn)
  })
  
  flowStore.saveFlow()
  
  closePreview()
  showToast('模板导入成功')
  
  // Navigate to flow builder
  setTimeout(() => {
    uni.navigateTo({
      url: '/pages/task/flow-builder'
    })
  }, 500)
}

// File Import
function chooseJSONFile() {
  chooseFile('application/json')
}

function chooseYAMLFile() {
  chooseFile('application/x-yaml')
}

function chooseFile(accept) {
  // Use uni.chooseMessageFile for H5 compatibility
  if (typeof uni !== 'undefined' && uni.chooseMessageFile) {
    uni.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: accept === 'application/json' ? ['.json'] : ['.yaml', '.yml'],
      success: (res) => {
        const file = res.tempFiles[0]
        const fs = typeof uni !== 'undefined' && uni.getFileInfo ? null : null
        
        // Read file content using FileReader-like approach
        const reader = new FileReader()
        // For H5, we need to use the path
        if (window && window.readFile) {
          // Native H5
        }
        
        // Simpler: use XMLHttpRequest or fetch
        if (typeof fetch !== 'undefined') {
          fetch(file.path)
            .then(r => r.text())
            .then(text => handleImportFile(text, accept))
            .catch(() => {
              showToast('读取文件失败')
            })
        } else {
          // Fallback - direct read for uni-app
          try {
            const content = require('fs').readFileSync(file.path, 'utf8')
            handleImportFile(content, accept)
          } catch (e) {
            showToast('请使用 JSON 或 YAML 格式导入')
          }
        }
      },
      fail: () => {
        showToast('选择文件失败')
      }
    })
  } else {
    // Fallback: use hidden input
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept === 'application/json' ? '.json' : '.yaml,.yml'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        handleImportFile(e.target.result, accept)
      }
      reader.onerror = () => {
        showToast('读取文件失败')
      }
      reader.readAsText(file)
    }
    input.click()
  }
}

function handleImportFile(text, expectedType) {
  try {
    let flow
    if (expectedType === 'application/json') {
      flow = importFromJSON(text)
    } else {
      flow = importFromYAML(text)
    }
    
    const validation = validateFlow(flow)
    if (!validation.valid) {
      showToast('模板校验失败: ' + validation.errors.join(', '))
      return
    }
    
    // Create new flow
    const newFlow = flowStore.createFlow(flow.name || '导入的流程')
    flowStore.loadFlow(newFlow.id)
    flowStore.clearCanvas()
    
    // Import nodes
    const nodeIdMap = {}
    flow.nodes.forEach(node => {
      const newId = 'node-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
      nodeIdMap[node.id] = newId
      flowStore.currentFlow.nodes.push({
        ...JSON.parse(JSON.stringify(node)),
        id: newId
      })
    })
    
    // Import connections
    flow.connections.forEach(conn => {
      flowStore.currentFlow.connections.push({
        ...conn,
        id: 'conn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        source: nodeIdMap[conn.source] || conn.source,
        target: nodeIdMap[conn.target] || conn.target
      })
    })
    
    flowStore.saveFlow()
    showToast('导入成功')
    
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/task/flow-builder'
      })
    }, 500)
  } catch (e) {
    showToast('导入失败: ' + e.message)
  }
}

// Search handler
function onSearch() {
  // Computed will auto-update
}

// Toast
const toast = ref({ show: false, message: '' })

function showToast(message) {
  toast.value = { show: true, message }
  setTimeout(() => {
    toast.value.show = false
  }, 2000)
}

// Navigation
function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.flow-templates-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 24px;
  color: #333;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.placeholder {
  width: 40px;
}

.search-bar {
  padding: 12px 16px;
  background: #fff;
}

.search-input {
  background: #f5f5f5;
  border-radius: 20px;
  padding: 10px 16px;
  font-size: 14px;
}

.template-list {
  flex: 1;
  padding: 12px 16px;
}

.template-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-icon {
  width: 50px;
  height: 50px;
  background: #f0f0ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 12px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 13px;
  color: #666;
  display: block;
  margin-bottom: 8px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-count {
  font-size: 12px;
  color: #999;
}

.tags {
  display: flex;
  gap: 4px;
}

.tag {
  font-size: 10px;
  color: #8477fa;
  background: #f0f0ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.card-arrow {
  font-size: 24px;
  color: #ccc;
  margin-left: 8px;
}

.tab-bar {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 16px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
}

.tab-item.active {
  color: #8477fa;
  border-bottom-color: #8477fa;
  font-weight: 500;
}

.builtin-badge {
  display: inline-block;
  font-size: 10px;
  color: #fff;
  background: #8477fa;
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.import-section {
  padding: 16px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.import-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  display: block;
}

.import-buttons {
  display: flex;
  gap: 12px;
}

.import-btn {
  flex: 1;
  background: #8477fa;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 0;
  font-size: 14px;
}

/* Preview Modal */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}

.preview-content {
  background: #fff;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.preview-icon {
  font-size: 32px;
  margin-right: 12px;
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  position: absolute;
  right: 16px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #999;
}

.preview-body {
  flex: 1;
  padding: 16px;
  max-height: 50vh;
}

.preview-desc {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 16px;
}

.node-list-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.node-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 8px;
}

.node-index {
  width: 24px;
  height: 24px;
  background: #8477fa;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-right: 10px;
}

.node-type-icon {
  font-size: 20px;
  margin-right: 10px;
}

.node-info {
  flex: 1;
}

.node-label {
  font-size: 14px;
  color: #333;
  display: block;
}

.node-config {
  font-size: 12px;
  color: #999;
}

.node-points {
  font-size: 12px;
  color: #8477fa;
  font-weight: 600;
}

.connection-hint {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 12px;
}

.preview-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  flex: 1;
  padding: 12px 0;
  border-radius: 8px;
  font-size: 14px;
  border: none;
}

.action-btn.secondary {
  background: #f5f5f5;
  color: #666;
}

.action-btn.primary {
  background: #8477fa;
  color: #fff;
}

/* Export Modal */
.export-modal {
  max-height: 50vh;
  border-radius: 20px 20px 0 0;
}

.export-options {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.export-option {
  padding: 14px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  text-align: center;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 200;
}
</style>