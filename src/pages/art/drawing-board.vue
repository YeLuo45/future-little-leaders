<template>
  <view class="drawing-board-page">
    <!-- 顶部工具栏 -->
    <view class="toolbar">
      <view class="tool-section">
        <view 
          class="tool-btn" 
          v-for="tool in drawingTools" 
          :key="tool.id"
          :class="{ active: currentTool === tool.id }"
          @click="handleSelectTool(tool.id)"
        >
          <text class="tool-icon">{{ tool.icon }}</text>
          <text class="tool-name">{{ tool.name }}</text>
        </view>
      </view>
      
      <view class="action-btns">
        <view class="action-btn" @click="handleUndo">
          <text>↩️</text>
        </view>
        <view class="action-btn" @click="handleRedo">
          <text>↪️</text>
        </view>
        <view class="action-btn" @click="handleClear">
          <text>🗑️</text>
        </view>
        <view class="action-btn save-btn" @click="handleSave">
          <text>💾</text>
        </view>
      </view>
    </view>

    <!-- 颜色选择 -->
    <view class="color-bar">
      <view 
        class="color-item" 
        v-for="color in drawingColors" 
        :key="color"
        :style="{ backgroundColor: color }"
        :class="{ active: currentColor === color }"
        @click="handleSelectColor(color)"
      ></view>
    </view>

    <!-- 线条粗细 -->
    <view class="line-width-bar">
      <view 
        class="width-item" 
        v-for="width in lineWidths" 
        :key="width.id"
        :class="{ active: currentLineWidth === width.value }"
        @click="handleSelectWidth(width.value)"
      >
        <view class="width-preview" :style="{ width: width.value * 3 + 'rpx', height: width.value * 3 + 'rpx' }"></view>
      </view>
    </view>

    <!-- 画布 -->
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
    </view>

    <!-- 保存弹窗 -->
    <view class="save-modal" v-if="showSaveModal" @click="closeSaveModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">保存作品</text>
        <input 
          class="work-title-input" 
          v-model="workTitle" 
          placeholder="请输入作品名称"
        />
        <view class="modal-actions">
          <button class="cancel-btn" @click="closeSaveModal">取消</button>
          <button class="confirm-btn" @click="confirmSave">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useArtStore } from '@/stores/artStore.js'

const artStore = useArtStore()

// 工具
const currentTool = computed(() => artStore.drawingBoard.currentTool)
const currentColor = computed(() => artStore.drawingBoard.currentColor)
const currentLineWidth = computed(() => artStore.drawingBoard.lineWidth)
const drawingTools = computed(() => artStore.drawingTools)
const drawingColors = computed(() => artStore.drawingColors)
const lineWidths = computed(() => artStore.lineWidths)

// 保存弹窗
const showSaveModal = ref(false)
const workTitle = ref('')

// 画布上下文
let ctx = null
let isDrawing = false
let lastX = 0
let lastY = 0

onMounted(() => {
  initCanvas()
})

const initCanvas = () => {
  const query = uni.createSelectorQuery()
  query.select('.drawing-canvas')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (res[0]) {
        const canvas = res[0].node
        const dpr = uni.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx = canvas.getContext('2d')
        ctx.scale(dpr, dpr)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    })
}

const handleSelectTool = (toolId) => {
  artStore.setDrawingTool(toolId)
}

const handleSelectColor = (color) => {
  artStore.setDrawingColor(color)
}

const handleSelectWidth = (width) => {
  artStore.setLineWidth(width)
}

const handleTouchStart = (e) => {
  isDrawing = true
  const touch = e.touches[0]
  lastX = touch.x
  lastY = touch.y
}

const handleTouchMove = (e) => {
  if (!isDrawing) return
  const touch = e.touches[0]
  drawLine(lastX, lastY, touch.x, touch.y)
  lastX = touch.x
  lastY = touch.y
}

const handleTouchEnd = () => {
  isDrawing = false
  saveToHistory()
}

const handleMouseDown = (e) => {
  isDrawing = true
  lastX = e.clientX
  lastY = e.clientY
}

const handleMouseMove = (e) => {
  if (!isDrawing) return
  drawLine(lastX, lastY, e.clientX, e.clientY)
  lastX = e.clientX
  lastY = e.clientY
}

const handleMouseUp = () => {
  isDrawing = false
  saveToHistory()
}

const drawLine = (x1, y1, x2, y2) => {
  if (!ctx) return
  
  ctx.beginPath()
  ctx.strokeStyle = currentTool.value === 'eraser' ? '#FFFFFF' : currentColor.value
  ctx.lineWidth = currentLineWidth.value
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

const saveToHistory = () => {
  const query = uni.createSelectorQuery()
  query.select('.drawing-canvas').fields({ node: true }).exec((res) => {
    if (res[0] && res[0].node) {
      const canvas = res[0].node
      const imageData = canvas.toDataURL()
      artStore.saveDrawingHistory(imageData)
    }
  })
}

const handleUndo = () => {
  const prevState = artStore.undoDrawing()
  if (prevState && ctx) {
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = prevState.data
  }
}

const handleRedo = () => {
  const nextState = artStore.redoDrawing()
  if (nextState && ctx) {
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = nextState.data
  }
}

const handleClear = () => {
  if (ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    artStore.clearDrawingBoard()
  }
}

const handleSave = () => {
  showSaveModal.value = true
}

const closeSaveModal = () => {
  showSaveModal.value = false
  workTitle.value = ''
}

const confirmSave = () => {
  const query = uni.createSelectorQuery()
  query.select('.drawing-canvas').fields({ node: true }).exec((res) => {
    if (res[0] && res[0].node) {
      const canvas = res[0].node
      const imageData = canvas.toDataURL()
      artStore.saveDrawingWork({
        title: workTitle.value || '我的绘画',
        description: '',
        imageData: imageData,
        duration: 30,
        tags: []
      })
      closeSaveModal()
      uni.showToast({ title: '保存成功', icon: 'success' })
    }
  })
}
</script>

<style scoped>
.drawing-board-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.toolbar {
  background: #fff;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tool-section {
  display: flex;
  gap: 16rpx;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 20rpx;
  border-radius: 12rpx;
  background: #f0f0f0;
}

.tool-btn.active {
  background: #8477fa;
  color: #fff;
}

.tool-icon {
  font-size: 32rpx;
}

.tool-name {
  font-size: 20rpx;
  margin-top: 4rpx;
}

.action-btns {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.save-btn {
  background: #8477fa;
}

.color-bar {
  background: #fff;
  padding: 16rpx 20rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.color-item {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 2px solid transparent;
}

.color-item.active {
  border-color: #333;
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #333;
}

.line-width-bar {
  background: #fff;
  padding: 16rpx 20rpx;
  display: flex;
  gap: 24rpx;
  align-items: center;
}

.width-item {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  background: #f0f0f0;
}

.width-item.active {
  background: #8477fa;
}

.width-preview {
  background: #333;
  border-radius: 50%;
}

.canvas-container {
  flex: 1;
  padding: 20rpx;
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
}

.drawing-canvas {
  width: 100%;
  height: 600rpx;
  background: #fff;
  border: 2px dashed #ddd;
  border-radius: 12rpx;
}

.save-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  padding: 40rpx;
  border-radius: 20rpx;
  width: 600rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 24rpx;
  text-align: center;
}

.work-title-input {
  border: 1px solid #ddd;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  margin-bottom: 24rpx;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.confirm-btn {
  background: #8477fa;
  color: #fff;
}
</style>
