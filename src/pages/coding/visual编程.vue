<template>
  <view class="visual-programming-page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">🧩 图形化编程</text>
      <text class="subtitle">拖拽积木，创造程序</text>
    </view>

    <!-- 积木类别选择 -->
    <scroll-view scroll-x class="category-tabs">
      <view
        v-for="(category, index) in categories"
        :key="category.id"
        :class="['category-tab', { active: activeCategory === category.id }]"
        @click="selectCategory(category.id)"
      >
        <text>{{ category.icon }}</text>
        <text class="tab-name">{{ category.name }}</text>
      </view>
    </scroll-view>

    <!-- 积木工作区 -->
    <view class="workspace">
      <!-- 积木面板 -->
      <view class="blocks-panel">
        <text class="panel-title">积木库</text>
        <scroll-view scroll-y class="blocks-list">
          <view
            v-for="block in filteredBlocks"
            :key="block.id"
            class="block-item"
            :style="{ borderLeftColor: block.color }"
            @click="addBlock(block)"
          >
            <text class="block-icon">{{ block.icon }}</text>
            <text class="block-name">{{ block.name }}</text>
          </view>
        </scroll-view>
      </view>

      <!-- 程序区域 -->
      <view class="program-area">
        <view class="program-header">
          <text class="panel-title">我的程序</text>
          <view class="program-actions">
            <text class="action-btn" @click="clearProgram">清空</text>
            <text class="action-btn run" @click="runProgram">▶ 运行</text>
          </view>
        </view>
        
        <!-- 已选积木 -->
        <scroll-view scroll-y class="selected-blocks">
          <view
            v-for="(block, index) in selectedBlocks"
            :key="block.instanceId"
            class="selected-block"
            :style="{ borderLeftColor: block.color }"
            @click="removeBlock(block.instanceId)"
          >
            <text class="block-order">{{ index + 1 }}</text>
            <text class="block-icon">{{ block.icon }}</text>
            <text class="block-name">{{ block.name }}</text>
            <text class="remove-hint">点击移除</text>
          </view>
          <view v-if="selectedBlocks.length === 0" class="empty-program">
            <text>点击左侧积木添加到这里</text>
          </view>
        </scroll-view>

        <!-- 程序输出 -->
        <view v-if="currentProgram" class="program-output">
          <text class="output-title">运行结果</text>
          <text class="output-content">{{ getProgramOutput() }}</text>
        </view>
      </view>
    </view>

    <!-- 积木说明弹窗 -->
    <view v-if="selectedBlockInfo" class="block-info-modal" @click="closeBlockInfo">
      <view class="block-info-content" @click.stop>
        <text class="info-icon">{{ selectedBlockInfo.icon }}</text>
        <text class="info-name">{{ selectedBlockInfo.name }}</text>
        <text class="info-desc">{{ selectedBlockInfo.description }}</text>
        <text class="info-category">类别: {{ selectedBlockInfo.category }}</text>
        <text class="info-close" @click="closeBlockInfo">关闭</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCodingEducationStore } from '@/stores/codingEducationStore.js'

const store = useCodingEducationStore()

// 积木类别
const categories = [
  { id: 'all', name: '全部', icon: '📦' },
  { id: 'event', name: '事件', icon: '🚩' },
  { id: 'motion', name: '运动', icon: '➡️' },
  { id: 'looks', name: '外观', icon: '👤' },
  { id: 'sound', name: '声音', icon: '🔊' },
  { id: 'control', name: '控制', icon: '🔁' },
  { id: 'variable', name: '变量', icon: '📦' },
  { id: 'operator', name: '运算', icon: '➕' },
  { id: 'sensing', name: '侦测', icon: '👀' }
]

const activeCategory = ref('all')
const selectedBlockInfo = ref(null)

const filteredBlocks = computed(() => {
  if (activeCategory.value === 'all') {
    return store.visualBlocks
  }
  return store.visualBlocks.filter(b => b.category === activeCategory.value)
})

const selectedBlocks = computed(() => store.selectedBlocks)
const currentProgram = computed(() => store.currentProgram)

const selectCategory = (categoryId) => {
  activeCategory.value = categoryId
}

const addBlock = (block) => {
  store.addBlockToProgram(block)
  selectedBlockInfo.value = block
}

const removeBlock = (instanceId) => {
  store.removeBlock(instanceId)
}

const clearProgram = () => {
  store.clearProgram()
}

const runProgram = () => {
  store.runProgram()
}

const getProgramOutput = () => {
  if (!currentProgram.value) return ''
  const blocks = currentProgram.value.blocks
  if (blocks.length === 0) return '没有可执行的积木'
  
  const outputs = blocks.map((block, index) => {
    return `${index + 1}. ${block.name}`
  })
  return outputs.join('\n')
}

const closeBlockInfo = () => {
  selectedBlockInfo.value = null
}

// 初始化
store.loadVisualBlocks()
</script>

<style scoped>
.visual-programming-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx;
}

.header {
  text-align: center;
  padding: 30rpx 0;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
}

.subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10rpx;
  display: block;
}

.category-tabs {
  display: flex;
  white-space: nowrap;
  padding: 10rpx 0;
  margin-bottom: 20rpx;
}

.category-tab {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 15rpx 25rpx;
  margin: 0 8rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
}

.category-tab.active {
  background: rgba(255, 255, 255, 0.4);
}

.category-tab text {
  color: #ffffff;
}

.tab-name {
  font-size: 22rpx;
  margin-top: 5rpx;
}

.workspace {
  display: flex;
  height: calc(100vh - 280rpx);
  gap: 20rpx;
}

.blocks-panel {
  width: 35%;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
}

.panel-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.blocks-list {
  flex: 1;
  overflow: hidden;
}

.block-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  margin-bottom: 15rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
  border-left: 8rpx solid #ccc;
}

.block-icon {
  font-size: 36rpx;
  margin-right: 15rpx;
}

.block-name {
  font-size: 26rpx;
  color: #333;
}

.program-area {
  flex: 1;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
}

.program-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.program-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  padding: 10rpx 25rpx;
  background: #f0f0f0;
  border-radius: 15rpx;
  font-size: 24rpx;
  color: #666;
}

.action-btn.run {
  background: #4CAF50;
  color: #ffffff;
}

.selected-blocks {
  flex: 1;
  overflow: hidden;
}

.selected-block {
  display: flex;
  align-items: center;
  padding: 20rpx;
  margin-bottom: 15rpx;
  background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15rpx;
  border-left: 8rpx solid #ccc;
}

.block-order {
  width: 40rpx;
  height: 40rpx;
  background: #667eea;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  margin-right: 15rpx;
}

.selected-block .block-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.selected-block .block-name {
  flex: 1;
  font-size: 26rpx;
}

.remove-hint {
  font-size: 20rpx;
  color: #999;
}

.empty-program {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200rpx;
  color: #999;
  font-size: 26rpx;
}

.program-output {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #1a1a2e;
  border-radius: 15rpx;
  max-height: 200rpx;
}

.output-title {
  font-size: 24rpx;
  color: #4CAF50;
  margin-bottom: 10rpx;
  display: block;
}

.output-content {
  font-size: 24rpx;
  color: #00ff00;
  font-family: monospace;
  white-space: pre-wrap;
  display: block;
}

.block-info-modal {
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

.block-info-content {
  background: #ffffff;
  border-radius: 30rpx;
  padding: 40rpx;
  text-align: center;
  width: 80%;
}

.info-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}

.info-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.info-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.info-category {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 30rpx;
}

.info-close {
  padding: 15rpx 50rpx;
  background: #667eea;
  color: #ffffff;
  border-radius: 30rpx;
  font-size: 28rpx;
}
</style>
