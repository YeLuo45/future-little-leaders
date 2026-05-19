<template>
  <view class="speaking-page">
    <!-- 头部 -->
    <view class="header-card">
      <view class="header-left">
        <text class="header-icon">🗣️</text>
        <view class="header-info">
          <text class="title">口语练习</text>
          <text class="subtitle">{{ currentLangInfo?.name || '' }} 对话</text>
        </view>
      </view>
      <view class="header-right">
        <view class="points-badge">
          <text class="points-icon">⭐</text>
          <text class="points-value">{{ totalPoints }}</text>
        </view>
      </view>
    </view>
    
    <!-- 语言选择器 -->
    <view class="language-selector">
      <scroll-view scroll-x class="language-scroll">
        <view class="language-tabs">
          <view
            class="language-tab"
            v-for="lang in supportedLanguages"
            :key="lang.id"
            :class="{ active: currentLanguage === lang.id }"
            @click="switchLanguage(lang.id)"
          >
            <text class="tab-flag">{{ lang.flag }}</text>
            <text class="tab-name">{{ lang.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 练习进度 -->
    <view class="progress-section">
      <view class="progress-header">
        <text class="progress-title">练习进度</text>
        <text class="progress-percent">{{ speakingProgress.percentage }}%</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: speakingProgress.percentage + '%' }"></view>
      </view>
      <view class="progress-stats">
        <text class="stat-text">已完成 {{ speakingProgress.completed }}/{{ speakingProgress.total }} 个对话</text>
      </view>
    </view>
    
    <!-- 对话列表 -->
    <view class="dialogues-section">
      <view class="section-title">常用对话</view>
      <view class="dialogues-list">
        <view
          class="dialogue-card"
          v-for="dialogue in dialogues"
          :key="dialogue.id"
          @click="openDialogue(dialogue)"
        >
          <view class="dialogue-icon">
            <text>{{ getDialogueIcon(dialogue) }}</text>
          </view>
          <view class="dialogue-content">
            <text class="dialogue-title">{{ dialogue.title }}</text>
            <text class="dialogue-scenario">{{ dialogue.scenario }}</text>
          </view>
          <view class="dialogue-status">
            <text class="status-badge" v-if="isDialogueCompleted(dialogue.id)">✓</text>
            <text class="status-untouched" v-else>📖</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 对话详情弹窗 -->
    <view class="dialogue-modal" v-if="showDialogueModal">
      <view class="modal-mask" @click="closeDialogueModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">{{ selectedDialogue?.title }}</text>
          <text class="modal-close" @click="closeDialogueModal">✕</text>
        </view>
        <view class="modal-body">
          <view class="scenario-tag">
            <text>📍 {{ selectedDialogue?.scenario }}</text>
          </view>
          
          <!-- 对话内容 -->
          <view class="dialogue-content-list">
            <view
              class="dialogue-item"
              v-for="(line, index) in selectedDialogue?.dialogues"
              :key="index"
              :class="line.speaker"
            >
              <view class="speaker-badge">
                <text>{{ line.speaker }}</text>
              </view>
              <view class="dialogue-bubble">
                <text class="dialogue-text">{{ line.text }}</text>
                <text class="dialogue-translation">{{ line.translation }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="practice-btn" @click="startPractice">
            <text class="btn-icon">🎤</text>
            <text>开始跟读练习</text>
          </button>
        </view>
      </view>
    </view>
    
    <!-- 练习弹窗 -->
    <view class="practice-modal" v-if="showPracticeModal">
      <view class="modal-mask" @click="closePracticeModal"></view>
      <view class="modal-content practice-content">
        <view class="modal-header">
          <text class="modal-title">跟读练习</text>
          <text class="modal-close" @click="closePracticeModal">✕</text>
        </view>
        
        <view class="practice-body">
          <!-- 当前句子 -->
          <view class="current-sentence" v-if="currentDialogueIndex < selectedDialogue?.dialogues.length">
            <view class="sentence-speaker">
              {{ selectedDialogue.dialogues[currentDialogueIndex].speaker }}
            </view>
            <text class="sentence-text">
              {{ selectedDialogue.dialogues[currentDialogueIndex].text }}
            </text>
            <text class="sentence-translation">
              {{ selectedDialogue.dialogues[currentDialogueIndex].translation }}
            </text>
          </view>
          
          <!-- 跟读按钮 -->
          <view class="record-section">
            <view class="record-btn" :class="{ recording: isRecording }" @click="toggleRecording">
              <text class="record-icon">{{ isRecording ? '⏹️' : '🎤' }}</text>
              <text class="record-text">{{ isRecording ? '停止' : '点击跟读' }}</text>
            </view>
          </view>
          
          <!-- 进度指示 -->
          <view class="practice-progress">
            <text class="progress-text">{{ currentDialogueIndex + 1 }} / {{ selectedDialogue?.dialogues.length }}</text>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="next-btn" @click="nextSentence" v-if="currentDialogueIndex < selectedDialogue?.dialogues.length - 1">
            下一句
          </button>
          <button class="finish-btn" @click="finishPractice" v-else>
            完成练习
          </button>
        </view>
      </view>
    </view>
    
    <!-- 完成弹窗 -->
    <view class="complete-modal" v-if="showCompleteModal">
      <view class="modal-mask"></view>
      <view class="modal-content complete-content">
        <view class="complete-icon">🎉</view>
        <text class="complete-title">练习完成！</text>
        <text class="complete-score">获得 {{ earnedPoints }} 积分</text>
        <button class="close-btn" @click="closeCompleteModal">关闭</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLanguageStore } from '@/stores/languageStore.js'

const languageStore = useLanguageStore()

// 状态
const showDialogueModal = ref(false)
const showPracticeModal = ref(false)
const showCompleteModal = ref(false)
const selectedDialogue = ref(null)
const currentDialogueIndex = ref(0)
const isRecording = ref(false)
const earnedPoints = ref(0)

// 计算属性
const supportedLanguages = computed(() => languageStore.supportedLanguages)
const currentLanguage = computed(() => languageStore.currentLanguage)
const currentLangInfo = computed(() => languageStore.currentLanguageInfo)
const dialogues = computed(() => languageStore.currentSpeakingDialogues)
const totalPoints = computed(() => languageStore.totalPoints)
const speakingProgress = computed(() => languageStore.currentSpeakingProgress)

// 获取对话图标
const getDialogueIcon = (dialogue) => {
  if (dialogue.title.includes('打招呼') || dialogue.title.includes('问候')) return '👋'
  if (dialogue.title.includes('购物')) return '🛒'
  if (dialogue.title.includes('餐厅')) return '🍽️'
  if (dialogue.title.includes('问路')) return '🗺️'
  return '💬'
}

// 检查对话是否完成
const isDialogueCompleted = (dialogueId) => {
  const progress = languageStore.userStats?.languageStats?.[currentLanguage.value]?.speakingProgress
  return progress?.completed > 0
}

// 切换语言
const switchLanguage = (langId) => {
  languageStore.selectLanguage(langId)
}

// 打开对话详情
const openDialogue = (dialogue) => {
  selectedDialogue.value = dialogue
  currentDialogueIndex.value = 0
  showDialogueModal.value = true
}

// 关闭对话弹窗
const closeDialogueModal = () => {
  showDialogueModal.value = false
}

// 开始练习
const startPractice = () => {
  showDialogueModal.value = false
  showPracticeModal.value = true
  currentDialogueIndex.value = 0
  isRecording.value = false
}

// 关闭练习弹窗
const closePracticeModal = () => {
  showPracticeModal.value = false
  isRecording.value = false
}

// 切换录音状态
const toggleRecording = () => {
  isRecording.value = !isRecording.value
  if (isRecording.value) {
    // 模拟录音
    setTimeout(() => {
      isRecording.value = false
      uni.showToast({ title: '跟读成功', icon: 'success' })
    }, 2000)
  }
}

// 下一句
const nextSentence = () => {
  if (currentDialogueIndex.value < selectedDialogue.value.dialogues.length - 1) {
    currentDialogueIndex.value++
  }
}

// 完成练习
const finishPractice = () => {
  showPracticeModal.value = false
  const result = languageStore.completeSpeakingPractice(selectedDialogue.value.id, 100)
  earnedPoints.value = 15
  showCompleteModal.value = true
}

// 关闭完成弹窗
const closeCompleteModal = () => {
  showCompleteModal.value = false
}

onMounted(() => {
  languageStore.init()
})
</script>

<style scoped>
.speaking-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 40rpx;
}

.header-card {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  color: #fff;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-icon {
  font-size: 64rpx;
  margin-right: 20rpx;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
}

.subtitle {
  font-size: 26rpx;
  opacity: 0.9;
  margin-top: 4rpx;
}

.points-badge {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
}

.points-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.points-value {
  font-size: 32rpx;
  font-weight: bold;
}

.language-selector {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.language-scroll {
  width: 100%;
}

.language-tabs {
  display: flex;
  gap: 20rpx;
}

.language-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 30rpx;
  border-radius: 16rpx;
  background: #f5f5f5;
  transition: all 0.3s;
}

.language-tab.active {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
}

.tab-flag {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.tab-name {
  font-size: 24rpx;
  font-weight: 500;
}

.progress-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.progress-title {
  font-size: 28rpx;
  color: #666;
}

.progress-percent {
  font-size: 28rpx;
  font-weight: bold;
  color: #fa709a;
}

.progress-bar {
  height: 16rpx;
  background: #eee;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
  border-radius: 8rpx;
  transition: width 0.3s;
}

.progress-stats {
  margin-top: 12rpx;
}

.stat-text {
  font-size: 24rpx;
  color: #999;
}

.dialogues-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.dialogues-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.dialogue-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  transition: all 0.3s;
}

.dialogue-card:active {
  background: #eee;
}

.dialogue-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
}

.dialogue-content {
  flex: 1;
}

.dialogue-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.dialogue-scenario {
  font-size: 24rpx;
  color: #999;
}

.status-badge {
  font-size: 36rpx;
  color: #4caf50;
}

.status-untouched {
  font-size: 36rpx;
}

/* 弹窗样式 */
.dialogue-modal,
.practice-modal,
.complete-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 90%;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.modal-body {
  padding: 30rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.scenario-tag {
  display: inline-block;
  background: #f0f0f0;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  margin-bottom: 24rpx;
  font-size: 26rpx;
  color: #666;
}

.dialogue-content-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.dialogue-item {
  display: flex;
  align-items: flex-start;
}

.dialogue-item.A {
  flex-direction: row;
}

.dialogue-item.B {
  flex-direction: row-reverse;
}

.speaker-badge {
  width: 56rpx;
  height: 56rpx;
  background: #667eea;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 28rpx;
  flex-shrink: 0;
}

.dialogue-item.B .speaker-badge {
  background: #f5576c;
}

.dialogue-bubble {
  max-width: 70%;
  padding: 20rpx 24rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  margin: 0 16rpx;
}

.dialogue-item.B .dialogue-bubble {
  background: #e8f5e9;
}

.dialogue-text {
  font-size: 28rpx;
  color: #333;
  display: block;
  font-weight: 500;
}

.dialogue-translation {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 8rpx;
}

.modal-footer {
  padding: 30rpx;
  border-top: 1rpx solid #eee;
}

.practice-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

/* 练习弹窗 */
.practice-content {
  max-height: 70vh;
}

.practice-body {
  padding: 30rpx;
}

.current-sentence {
  background: #f8f8f8;
  border-radius: 20rpx;
  padding: 40rpx;
  text-align: center;
  margin-bottom: 40rpx;
}

.sentence-speaker {
  display: inline-block;
  background: #667eea;
  color: #fff;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.sentence-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.sentence-translation {
  font-size: 26rpx;
  color: #999;
}

.record-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30rpx;
}

.record-btn {
  width: 200rpx;
  height: 200rpx;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.record-btn.recording {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee0979 100%);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.record-icon {
  font-size: 64rpx;
  margin-bottom: 10rpx;
}

.record-text {
  font-size: 26rpx;
  color: #fff;
  font-weight: 500;
}

.practice-progress {
  text-align: center;
}

.progress-text {
  font-size: 28rpx;
  color: #999;
}

.next-btn,
.finish-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
}

.finish-btn {
  background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
}

/* 完成弹窗 */
.complete-content {
  width: 80%;
  padding: 60rpx 40rpx;
  text-align: center;
}

.complete-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.complete-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.complete-score {
  font-size: 32rpx;
  color: #fa709a;
  display: block;
  margin-bottom: 40rpx;
}

.close-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
}
</style>
