<template>
  <view class="drawing-board-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">🎨 绘画创作</text>
      <view class="header-actions">
        <button class="btn-undo" @click="handleUndo" :disabled="!canUndo">撤销</button>
        <button class="btn-save" @click="showSaveModal = true">保存</button>
      </view>
    </view>

    <!-- 画布区域 -->
    <view class="canvas-container">
      <canvas
        class="drawing-canvas"
        canvas-id="drawingCanvas"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
      ></canvas>
      
      <!-- 空白画布提示 -->
      <view v-if="!hasDrawing" class="canvas-placeholder">
        <text class="placeholder-icon">🖌️</text>
        <text class="placeholder-text">开始你的绘画创作</text>
      </view>
    </view>

    <!-- 工具栏 -->
    <view class="toolbar">
      <!-- 画笔工具 -->
      <view class="tool-section">
        <text class="section-label">工具</text>
        <view class="tool-grid">
          <view
            v-for="tool in store.drawingTools"
            :key="tool.id"
            class="tool-item"
            :class="{ active: store.drawingBoard.currentTool === tool.id }"
            @click="selectTool(tool.id)"
          >
            <text class="tool-icon">{{ tool.icon }}</text>
            <text class="tool-name">{{ tool.name }}</text>
          </view>
        </view>
      </view>

      <!-- 颜色选择 -->
      <view class="tool-section">
        <text class="section-label">颜色</text>
        <view class="color-grid">
          <view
            v-for="color in store.drawingColors"
            :key="color"
            class="color-item"
            :class="{ active: store.drawingBoard.currentColor === color }"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
          ></view>
        </view>
      </view>

      <!-- 画笔大小 -->
      <view class="tool-section">
        <text class="section-label">大小: {{ store.drawingBoard.lineWidth }}</text>
        <slider
          class="size-slider"
          :value="store.drawingBoard.lineWidth"
          :min="1"
          :max="20"
          :step="1"
          activeColor="#FF6B6B"
          @change="handleSizeChange"
        />
      </view>

      <!-- 快捷操作 -->
      <view class="tool-section actions">
        <button class="action-btn clear" @click="handleClear">清空</button>
        <button class="action-btn redo" @click="handleRedo" :disabled="!canRedo">重做</button>
      </view>
    </view>

    <!-- AI 建议 -->
    <view v-if="aiSuggestions.length > 0" class="ai-suggestions">
      <view class="suggestion-header">
        <text class="suggestion-icon">💡</text>
        <text class="suggestion-title">AI 创作建议</text>
      </view>
      <view class="suggestion-list">
        <text v-for="(suggestion, index) in aiSuggestions" :key="index" class="suggestion-item">
          {{ index + 1 }}. {{ suggestion }}
        </text>
      </view>
    </view>

    <!-- 保存弹窗 -->
    <view v-if="showSaveModal" class="modal-overlay" @click="showSaveModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">保存作品</text>
          <text class="modal-close" @click="showSaveModal = false">✕</text>
        </view>
        
        <view class="modal-body">
          <view class="form-group">
            <text class="form-label">作品名称</text>
            <input
              class="form-input"
              v-model="workTitle"
              placeholder="给你的作品起个名字"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">作品描述</text>
            <textarea
              class="form-textarea"
              v-model="workDescription"
              placeholder="描述一下你的创作..."
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">标签（用逗号分隔）</text>
            <input
              class="form-input"
              v-model="workTags"
              placeholder="如：风景, 春天, 彩色"
            />
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="btn-cancel" @click="showSaveModal = false">取消</button>
          <button class="btn-confirm" @click="handleSave">保存作品</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useArtStudioStore } from '@/stores/artStudioStore.js'

const store = useArtStudioStore()

// 画布上下文
let ctx = null
const canvasWidth = ref(0)
const canvasHeight = ref(0)

// 状态
const hasDrawing = ref(false)
const showSaveModal = ref(false)
const workTitle = ref('')
const workDescription = ref('')
const workTags = ref('')
const aiSuggestions = ref([])

// 上一个点
let lastX = 0
let lastY = 0

// 计算属性
const canUndo = computed(() => store.drawingBoard.historyIndex > 0)
const canRedo = computed(() => store.drawingBoard.historyIndex < store.drawingBoard.history.length - 1)

// 初始化画布
onMounted(() => {
  initCanvas()
  loadAiSuggestions()
})

const initCanvas = () => {
  const query = uni.createSelectorQuery()
  query.select('.canvas-container').boundingClientRect()
  query.exec((res) => {
    if (res[0]) {
      canvasWidth.value = res[0].width
      canvasHeight.value = res[0].height - 60
      
      // 获取 canvas 上下文
      const canvas = uni.createCanvasContext('drawingCanvas')
      ctx = canvas
      
      // 设置画布尺寸
      ctx.width = canvasWidth.value
      ctx.height = canvasHeight.value
      
      // 设置默认样式
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      // 重绘历史
      if (store.drawingBoard.history.length > 0 && store.drawingBoard.historyIndex >= 0) {
        redrawFromHistory()
      }
    }
  })
}

// 从历史重绘画布
const redrawFromHistory = () => {
  if (!ctx) return
  
  const historyData = store.drawingBoard.history[store.drawingBoard.historyIndex]
  if (historyData && historyData.data) {
    hasDrawing.value = true
    // 绘制历史数据
    ctx.clearRect(0, 0, ctx.width, ctx.height)
    historyData.data.forEach(path => {
      drawPath(path)
    })
    ctx.draw()
  }
}

// 绘制路径
const drawPath = (path) => {
  if (!ctx || path.points.length < 2) return
  
  ctx.beginPath()
  ctx.strokeStyle = path.color
  ctx.lineWidth = path.lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  ctx.moveTo(path.points[0].x, path.points[0].y)
  for (let i = 1; i < path.points.length; i++) {
    ctx.lineTo(path.points[i].x, path.points[i].y)
  }
  ctx.stroke()
}

// 选择工具
const selectTool = (toolId) => {
  if (toolId === 'eraser') {
    store.setDrawingTool('eraser')
  } else {
    store.setDrawingTool(toolId)
  }
}

// 选择颜色
const selectColor = (color) => {
  store.setDrawingColor(color)
  if (store.drawingBoard.currentTool === 'eraser') {
    store.setDrawingTool('brush')
  }
}

// 调整画笔大小
const handleSizeChange = (e) => {
  store.setLineWidth(e.detail.value)
}

// 触摸开始
const handleTouchStart = (e) => {
  if (e.touches.length !== 1) return
  
  const touch = e.touches[0]
  lastX = touch.clientX
  lastY = touch.clientY
  
  store.drawingBoard.isDrawing = true
  store.drawingBoard.currentPath = {
    points: [{ x: lastX, y: lastY }],
    color: store.drawingBoard.currentTool === 'eraser' ? '#FFFFFF' : store.drawingBoard.currentColor,
    lineWidth: store.drawingBoard.currentTool === 'eraser' ? 20 : store.drawingBoard.lineWidth
  }
}

// 触摸移动
const handleTouchMove = (e) => {
  if (!store.drawingBoard.isDrawing || e.touches.length !== 1) return
  
  const touch = e.touches[0]
  const x = touch.clientX
  const y = touch.clientY
  
  // 绘制线条
  ctx.beginPath()
  ctx.strokeStyle = store.drawingBoard.currentTool === 'eraser' ? '#FFFFFF' : store.drawingBoard.currentColor
  ctx.lineWidth = store.drawingBoard.currentTool === 'eraser' ? 20 : store.drawingBoard.lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  ctx.draw(true)
  
  // 保存点
  if (store.drawingBoard.currentPath) {
    store.drawingBoard.currentPath.points.push({ x, y })
  }
  
  hasDrawing.value = true
  lastX = x
  lastY = y
}

// 触摸结束
const handleTouchEnd = () => {
  if (store.drawingBoard.currentPath && store.drawingBoard.currentPath.points.length > 1) {
    store.saveDrawingHistory([...store.drawingBoard.history, store.drawingBoard.currentPath])
  }
  store.drawingBoard.isDrawing = false
  store.drawingBoard.currentPath = null
}

// 鼠标事件（PC端）
const handleMouseDown = (e) => {
  lastX = e.clientX
  lastY = e.clientY
  store.drawingBoard.isDrawing = true
  store.drawingBoard.currentPath = {
    points: [{ x: lastX, y: lastY }],
    color: store.drawingBoard.currentTool === 'eraser' ? '#FFFFFF' : store.drawingBoard.currentColor,
    lineWidth: store.drawingBoard.currentTool === 'eraser' ? 20 : store.drawingBoard.lineWidth
  }
}

const handleMouseMove = (e) => {
  if (!store.drawingBoard.isDrawing) return
  
  const x = e.clientX
  const y = e.clientY
  
  ctx.beginPath()
  ctx.strokeStyle = store.drawingBoard.currentTool === 'eraser' ? '#FFFFFF' : store.drawingBoard.currentColor
  ctx.lineWidth = store.drawingBoard.currentTool === 'eraser' ? 20 : store.drawingBoard.lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  ctx.draw(true)
  
  if (store.drawingBoard.currentPath) {
    store.drawingBoard.currentPath.points.push({ x, y })
  }
  
  hasDrawing.value = true
  lastX = x
  lastY = y
}

const handleMouseUp = () => {
  handleTouchEnd()
}

// 撤销
const handleUndo = () => {
  const historyData = store.undoDrawing()
  if (historyData) {
    ctx.clearRect(0, 0, ctx.width, ctx.height)
    if (store.drawingBoard.history.length > 0) {
      store.drawingBoard.history.forEach(pathData => {
        drawPath(pathData)
      })
    }
    ctx.draw()
    hasDrawing.value = store.drawingBoard.historyIndex >= 0
  }
}

// 重做
const handleRedo = () => {
  const historyData = store.redoDrawing()
  if (historyData) {
    drawPath(historyData)
    ctx.draw()
    hasDrawing.value = true
  }
}

// 清空
const handleClear = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空画布吗？',
    success: (res) => {
      if (res.confirm) {
        ctx.clearRect(0, 0, ctx.width, ctx.height)
        ctx.draw()
        store.clearDrawingBoard()
        hasDrawing.value = false
      }
    }
  })
}

// 加载 AI 建议
const loadAiSuggestions = () => {
  aiSuggestions.value = store.getAiSuggestions('drawing')
}

// 保存作品
const handleSave = () => {
  if (!workTitle.value.trim()) {
    uni.showToast({ title: '请输入作品名称', icon: 'none' })
    return
  }
  
  // 获取画布内容
  uni.canvasToTempFilePath({
    canvasId: 'drawingCanvas',
    success: (res) => {
      const tags = workTags.value.split(',').map(t => t.trim()).filter(t => t)
      
      const workData = {
        title: workTitle.value,
        description: workDescription.value,
        imageData: res.tempFilePath,
        tags: tags,
        duration: 30
      }
      
      const result = store.saveArtWork(workData)
      if (result) {
        uni.showToast({ title: '作品保存成功！', icon: 'success' })
        showSaveModal.value = false
        workTitle.value = ''
        workDescription.value = ''
        workTags.value = ''
        
        // 更新 AI 建议
        loadAiSuggestions()
      } else {
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    },
    fail: () => {
      // 即使获取图片失败，也保存一个空白作品
      const tags = workTags.value.split(',').map(t => t.trim()).filter(t => t)
      const workData = {
        title: workTitle.value,
        description: workDescription.value,
        tags: tags,
        duration: 30
      }
      
      const result = store.saveArtWork(workData)
      if (result) {
        uni.showToast({ title: '作品保存成功！', icon: 'success' })
        showSaveModal.value = false
      }
    }
  })
}

// 初始化
store.init()
</script>

<style scoped>
.drawing-board-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 32rpx 24rpx;
  background-color: #fff;
}

.page-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 16rpx;
}

.btn-undo, .btn-save {
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  font-size: 26rpx;
  border: none;
}

.btn-undo {
  background-color: #f0f0f0;
  color: #666;
}

.btn-undo:not(:disabled) {
  background-color: #FFE4E1;
  color: #FF6B6B;
}

.btn-save {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: #fff;
}

/* 画布容器 */
.canvas-container {
  flex: 1;
  background-color: #fff;
  margin: 24rpx 32rpx;
  border-radius: 16rpx;
  position: relative;
  min-height: 500rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.drawing-canvas {
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 16rpx;
}

.canvas-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.placeholder-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 16rpx;
}

.placeholder-text {
  font-size: 28rpx;
  color: #999;
}

/* 工具栏 */
.toolbar {
  background-color: #fff;
  padding: 24rpx 32rpx;
  border-radius: 24rpx 24rpx 0 0;
}

.tool-section {
  margin-bottom: 20rpx;
}

.tool-section:last-child {
  margin-bottom: 0;
}

.section-label {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 12rpx;
}

.tool-grid {
  display: flex;
  gap: 16rpx;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  min-width: 80rpx;
}

.tool-item.active {
  background-color: #FFE4E1;
  border: 2rpx solid #FF6B6B;
}

.tool-icon {
  font-size: 36rpx;
  margin-bottom: 4rpx;
}

.tool-name {
  font-size: 20rpx;
  color: #666;
}

.tool-item.active .tool-name {
  color: #FF6B6B;
}

/* 颜色选择 */
.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.color-item {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 3rpx solid transparent;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.color-item.active {
  border-color: #333;
  transform: scale(1.1);
}

/* 大小滑块 */
.size-slider {
  width: 100%;
}

/* 操作按钮 */
.tool-section.actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}

.action-btn.clear {
  background-color: #f0f0f0;
  color: #666;
}

.action-btn.redo {
  background-color: #f0f0f0;
  color: #666;
}

.action-btn.redo:not(:disabled) {
  background-color: #E3F2FD;
  color: #2196F3;
}

/* AI 建议 */
.ai-suggestions {
  background-color: #FFF9E6;
  margin: 0 32rpx 24rpx;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  border-left: 4rpx solid #FFD700;
}

.suggestion-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.suggestion-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.suggestion-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #B8860B;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.suggestion-item {
  font-size: 24rpx;
  color: #8B7355;
  line-height: 1.5;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  padding: 8rpx;
}

.modal-body {
  padding: 32rpx;
}

.form-group {
  margin-bottom: 24rpx;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  padding: 20rpx 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  padding: 20rpx 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 28rpx;
  min-height: 120rpx;
  box-sizing: border-box;
}

.modal-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}

.btn-cancel {
  background-color: #f0f0f0;
  color: #666;
}

.btn-confirm {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: #fff;
}
</style>
