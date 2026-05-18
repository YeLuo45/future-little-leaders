<template>
  <view class="music-create-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">🎵 音乐创作</text>
      <view class="header-actions">
        <button class="btn-save" @click="showSaveModal = true">保存</button>
      </view>
    </view>

    <!-- 乐器选择 -->
    <view class="instrument-section">
      <text class="section-title">选择乐器</text>
      <view class="instrument-grid">
        <view
          v-for="inst in store.musicInstruments"
          :key="inst.id"
          class="instrument-item"
          :class="{ active: selectedInstrument === inst.id }"
          @click="selectInstrument(inst.id)"
        >
          <text class="instrument-icon">{{ inst.icon }}</text>
          <text class="instrument-name">{{ inst.name }}</text>
        </view>
      </view>
    </view>

    <!-- 节拍/节奏选择 -->
    <view class="tempo-section">
      <text class="section-title">选择节奏</text>
      <view class="tempo-grid">
        <view
          v-for="tempo in store.musicTempos"
          :key="tempo.id"
          class="tempo-item"
          :class="{ active: selectedTempo === tempo.id }"
          @click="selectTempo(tempo.id)"
        >
          <text class="tempo-name">{{ tempo.name }}</text>
          <text class="tempo-bpm">{{ tempo.bpm }} BPM</text>
        </view>
      </view>
    </view>

    <!-- 虚拟琴键/鼓垫 -->
    <view class="pad-section">
      <text class="section-title">{{ getInstrumentTitle() }}</text>
      
      <!-- 钢琴键盘 -->
      <view v-if="selectedInstrument === 'piano'" class="piano-container">
        <view class="piano">
          <view
            v-for="note in pianoNotes"
            :key="note.id"
            class="piano-key"
            :class="{ black: note.isBlack, pressed: pressedKeys.includes(note.id) }"
            @touchstart="playNote(note)"
            @touchend="releaseNote(note)"
          >
            <text class="note-label">{{ note.label }}</text>
          </view>
        </view>
      </view>
      
      <!-- 鼓垫 -->
      <view v-else-if="selectedInstrument === 'drum'" class="drum-container">
        <view class="drum-grid">
          <view
            v-for="(pad, index) in drumPads"
            :key="index"
            class="drum-pad"
            :style="{ backgroundColor: pad.color }"
            :class="{ active: activePads.includes(index) }"
            @touchstart="triggerPad(index)"
          >
            <text class="pad-icon">{{ pad.icon }}</text>
            <text class="pad-name">{{ pad.name }}</text>
          </view>
        </view>
      </view>
      
      <!-- 其他乐器 -->
      <view v-else class="other-instrument-container">
        <view class="play-button" @click="playMelody">
          <text class="play-icon">{{ isPlaying ? '⏸️' : '▶️' }}</text>
          <text class="play-text">{{ isPlaying ? '停止' : '播放旋律' }}</text>
        </view>
      </view>
    </view>

    <!-- 录制控制 -->
    <view class="record-section">
      <view class="record-controls">
        <button
          class="record-btn"
          :class="{ recording: isRecording }"
          @click="toggleRecording"
        >
          <text class="record-icon">{{ isRecording ? '⏹️' : '🔴' }}</text>
          <text class="record-text">{{ isRecording ? '停止录制' : '开始录制' }}</text>
        </button>
        
        <view class="record-time">
          <text class="time-value">{{ formatTime(recordTime) }}</text>
          <text class="time-label">录制时长</text>
        </view>
      </view>
      
      <!-- 录制的节奏显示 -->
      <view v-if="recordedBeats.length > 0" class="recorded-beats">
        <text class="beats-label">已录制 {{ recordedBeats.length }} 个音符</text>
        <view class="beats-visual">
          <view
            v-for="(beat, index) in recordedBeats.slice(-20)"
            :key="index"
            class="beat-dot"
            :style="{ backgroundColor: beat.color }"
          ></view>
        </view>
        <button class="btn-clear-beats" @click="clearRecordedBeats">清空录制</button>
      </view>
    </view>

    <!-- AI 建议 -->
    <view v-if="aiSuggestions.length > 0" class="ai-suggestions">
      <view class="suggestion-header">
        <text class="suggestion-icon">💡</text>
        <text class="suggestion-title">AI 音乐建议</text>
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
          <text class="modal-title">保存音乐作品</text>
          <text class="modal-close" @click="showSaveModal = false">✕</text>
        </view>
        
        <view class="modal-body">
          <view class="form-group">
            <text class="form-label">作品名称</text>
            <input
              class="form-input"
              v-model="workTitle"
              placeholder="给你的音乐起个名字"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useArtStudioStore } from '@/stores/artStudioStore.js'

const store = useArtStudioStore()

// 状态
const selectedInstrument = ref('piano')
const selectedTempo = ref('moderate')
const isRecording = ref(false)
const recordTime = ref(0)
const recordedBeats = ref([])
const isPlaying = ref(false)
const pressedKeys = ref([])
const activePads = ref([])
const showSaveModal = ref(false)
const workTitle = ref('')
const workDescription = ref('')
const aiSuggestions = ref([])

// 定时器
let recordTimer = null
let recordingInterval = null

// 钢琴音符
const pianoNotes = [
  { id: 'C4', label: '1', note: 'C4', isBlack: false },
  { id: 'D4', label: '2', note: 'D4', isBlack: false },
  { id: 'E4', label: '3', note: 'E4', isBlack: false },
  { id: 'F4', label: '4', note: 'F4', isBlack: false },
  { id: 'G4', label: '5', note: 'G4', isBlack: false },
  { id: 'A4', label: '6', note: 'A4', isBlack: false },
  { id: 'B4', label: '7', note: 'B4', isBlack: false },
  { id: 'C5', label: '1+', note: 'C5', isBlack: false },
  { id: 'D5', label: '2+', note: 'D5', isBlack: false },
  { id: 'E5', label: '3+', note: 'E5', isBlack: false }
]

// 鼓垫
const drumPads = [
  { name: '底鼓', icon: '🥁', color: '#FF6B6B' },
  { name: '军鼓', icon: '🎯', color: '#4ECDC4' },
  { name: '踩镲', icon: '💥', color: '#FFD93D' },
  { name: '低音', icon: '🎸', color: '#9B59B6' },
  { name: '小鼓', icon: '✨', color: '#45B7D1' },
  { name: '通鼓', icon: '🔔', color: '#96CEB4' },
  { name: '吊镲', icon: '🌟', color: '#F39C12' },
  { name: '锣', icon: '🎊', color: '#E91E63' }
]

// 获取乐器标题
const getInstrumentTitle = () => {
  const inst = store.musicInstruments.find(i => i.id === selectedInstrument.value)
  return inst ? inst.name + '键盘' : '键盘'
}

// 选择乐器
const selectInstrument = (instId) => {
  selectedInstrument.value = instId
  clearRecordedBeats()
}

// 选择节拍
const selectTempo = (tempoId) => {
  selectedTempo.value = tempoId
}

// 播放音符
const playNote = (note) => {
  pressedKeys.value.push(note.id)
  
  // 播放音效 (实际项目中需要使用 AudioContext 或预加载音频)
  try {
    const audioCtx = uni.createInnerAudioContext()
    // 这里使用音符频率生成简单的提示音
    const freqMap = {
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
      'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
      'D5': 587.33, 'E5': 659.25
    }
    // uni-app 不支持直接播放频率，需要预置音频文件
    // 这里简化处理，实际应该用预置的音频文件
    audioCtx.destroy()
  } catch (e) {
    console.log('Audio not supported')
  }
  
  // 如果正在录制，记录音符
  if (isRecording.value) {
    const tempo = store.musicTempos.find(t => t.id === selectedTempo.value)
    recordedBeats.value.push({
      note: note.note,
      instrument: selectedInstrument.value,
      time: recordTime.value,
      color: '#FF6B6B'
    })
  }
}

// 释放音符
const releaseNote = (note) => {
  const index = pressedKeys.value.indexOf(note.id)
  if (index > -1) {
    pressedKeys.value.splice(index, 1)
  }
}

// 触发鼓垫
const triggerPad = (index) => {
  activePads.value.push(index)
  setTimeout(() => {
    const i = activePads.value.indexOf(index)
    if (i > -1) {
      activePads.value.splice(i, 1)
    }
  }, 150)
  
  // 播放鼓声 (简化处理)
  const pad = drumPads[index]
  
  // 如果正在录制，记录鼓点
  if (isRecording.value) {
    recordedBeats.value.push({
      pad: index,
      instrument: 'drum',
      time: recordTime.value,
      color: pad.color
    })
  }
}

// 播放旋律（其他乐器）
const playMelody = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    // 简化的旋律播放
    setTimeout(() => {
      isPlaying.value = false
    }, 5000)
  }
}

// 切换录制状态
const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// 开始录制
const startRecording = () => {
  isRecording.value = true
  recordTime.value = 0
  recordedBeats.value = []
  
  recordingInterval = setInterval(() => {
    recordTime.value++
  }, 1000)
}

// 停止录制
const stopRecording = () => {
  isRecording.value = false
  if (recordingInterval) {
    clearInterval(recordingInterval)
    recordingInterval = null
  }
}

// 清空录制
const clearRecordedBeats = () => {
  recordedBeats.value = []
  recordTime.value = 0
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 保存作品
const handleSave = () => {
  if (!workTitle.value.trim()) {
    uni.showToast({ title: '请输入作品名称', icon: 'none' })
    return
  }
  
  const workData = {
    title: workTitle.value,
    description: workDescription.value,
    audioData: '', // 实际项目中应该保存音频数据
    duration: recordTime.value || 30,
    tags: [selectedInstrument.value, selectedTempo.value]
  }
  
  const result = store.saveArtWork(workData)
  if (result) {
    uni.showToast({ title: '作品保存成功！', icon: 'success' })
    showSaveModal.value = false
    workTitle.value = ''
    workDescription.value = ''
    clearRecordedBeats()
  } else {
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

// 加载 AI 建议
const loadAiSuggestions = () => {
  aiSuggestions.value = store.getAiSuggestions('music')
}

// 初始化
onMounted(() => {
  store.init()
  loadAiSuggestions()
})

onUnmounted(() => {
  if (recordingInterval) {
    clearInterval(recordingInterval)
  }
})
</script>

<style scoped>
.music-create-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
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

.btn-save {
  padding: 12rpx 32rpx;
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: #fff;
  border-radius: 24rpx;
  font-size: 28rpx;
  border: none;
}

/* 乐器选择 */
.instrument-section, .tempo-section, .pad-section {
  margin: 24rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.instrument-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.instrument-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 16rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
}

.instrument-item.active {
  background-color: #E0F7FA;
  border-color: #4ECDC4;
}

.instrument-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.instrument-name {
  font-size: 24rpx;
  color: #666;
}

.instrument-item.active .instrument-name {
  color: #00897B;
}

/* 节拍选择 */
.tempo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.tempo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
}

.tempo-item.active {
  background-color: #FFF3E0;
  border-color: #FF9800;
}

.tempo-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.tempo-bpm {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

/* 钢琴键盘 */
.piano-container {
  overflow-x: auto;
}

.piano {
  display: flex;
  height: 200rpx;
  position: relative;
}

.piano-key {
  flex: 1;
  background-color: #fff;
  border: 2rpx solid #ddd;
  border-radius: 0 0 8rpx 8rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 16rpx;
  position: relative;
}

.piano-key.black {
  background-color: #333;
  color: #fff;
  height: 120rpx;
  margin-top: -30rpx;
  z-index: 1;
  flex: 0.7;
}

.piano-key.pressed {
  background-color: #4ECDC4;
}

.piano-key.black.pressed {
  background-color: #00897B;
}

.note-label {
  font-size: 22rpx;
  color: #999;
}

.piano-key.black .note-label {
  color: #666;
}

/* 鼓垫 */
.drum-container {
  padding: 20rpx 0;
}

.drum-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.drum-pad {
  aspect-ratio: 1;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: transform 0.1s, opacity 0.1s;
}

.drum-pad.active {
  transform: scale(0.95);
  opacity: 1;
}

.pad-icon {
  font-size: 40rpx;
  margin-bottom: 4rpx;
}

.pad-name {
  font-size: 20rpx;
  color: #fff;
  font-weight: 600;
}

/* 其他乐器容器 */
.other-instrument-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 0;
}

.play-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 60rpx;
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  border-radius: 50%;
  color: #fff;
}

.play-icon {
  font-size: 64rpx;
  margin-bottom: 8rpx;
}

.play-text {
  font-size: 28rpx;
}

/* 录制控制 */
.record-section {
  margin: 24rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.record-controls {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.record-btn {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  background-color: #f0f0f0;
  border-radius: 32rpx;
  border: none;
}

.record-btn.recording {
  background-color: #FFEBEE;
}

.record-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.record-text {
  font-size: 26rpx;
  color: #666;
}

.record-btn.recording .record-text {
  color: #FF5252;
}

.record-time {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  font-family: monospace;
}

.time-label {
  font-size: 22rpx;
  color: #999;
}

.recorded-beats {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.beats-label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.beats-visual {
  display: flex;
  gap: 6rpx;
  overflow-x: auto;
  padding: 8rpx 0;
  margin-bottom: 12rpx;
}

.beat-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.btn-clear-beats {
  font-size: 24rpx;
  color: #999;
  background: none;
  border: none;
  padding: 8rpx 16rpx;
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
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: #fff;
}
</style>
