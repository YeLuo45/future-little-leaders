<template>
  <view class="debate-practice-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">辩论练习</text>
      <text class="nav-placeholder"></text>
    </view>

    <!-- 辩论主题列表 -->
    <view class="topics-list">
      <view
        v-for="topic in topics"
        :key="topic.id"
        class="topic-card"
        @click="selectTopic(topic)"
      >
        <view class="topic-header">
          <text class="topic-title">{{ topic.title }}</text>
          <view v-if="getDebateProgress(topic.id).completed" class="completed-badge">
            ✓ 已完成
          </view>
        </view>
        <view class="topic-meta">
          <view class="difficulty-badge" :style="{ background: getDifficultyInfo(topic.difficulty).color }">
            {{ getDifficultyInfo(topic.difficulty).label }}
          </view>
          <text class="quality-text" v-if="getDebateProgress(topic.id).completed">
            得分: {{ getDebateProgress(topic.id).quality || 0 }}/10
          </text>
        </view>
        <view class="topic-preview">
          <view class="preview-side pro">
            <text class="side-label">👍 正方:</text>
            <text class="points-text">{{ topic.proPoints.slice(0, 2).join('、') }}...</text>
          </view>
          <view class="preview-side con">
            <text class="side-label">👎 反方:</text>
            <text class="points-text">{{ topic.conPoints.slice(0, 2).join('、') }}...</text>
          </view>
        </view>
      </view>

      <view v-if="topics.length === 0" class="empty-state">
        <text>暂无辩论主题</text>
      </view>
    </view>

    <!-- 辩论练习弹窗 -->
    <view v-if="showDebateModal" class="modal-overlay" @click="closeDebateModal">
      <view class="modal-content debate-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ currentTopic.title }}</text>
          <text class="modal-close" @click="closeDebateModal">×</text>
        </view>

        <view class="difficulty-info">
          <view class="diff-badge" :style="{ background: getDifficultyInfo(currentTopic.difficulty).color }">
            {{ getDifficultyInfo(currentTopic.difficulty).label }}
          </view>
        </view>

        <!-- 角色选择 -->
        <view v-if="!selectedSide" class="side-selection">
          <text class="section-label">选择你的立场:</text>
          <view class="side-buttons">
            <view class="side-btn pro" @click="selectSide('pro')">
              <text class="side-icon">👍</text>
              <text class="side-name">正方</text>
              <text class="side-desc">支持该观点</text>
            </view>
            <view class="side-btn con" @click="selectSide('con')">
              <text class="side-icon">👎</text>
              <text class="side-name">反方</text>
              <text class="side-desc">反对该观点</text>
            </view>
          </view>
        </view>

        <!-- 论证输入 -->
        <view v-if="selectedSide && !showResult" class="debate-content">
          <view class="argument-section">
            <text class="section-label">你的论证:</text>
            <textarea
              class="argument-input"
              v-model="argumentText"
              placeholder="输入你的论证观点..."
              maxlength="500"
            />
            <text class="char-count">{{ argumentText.length }}/500</text>
          </view>

          <!-- 谬误识别 -->
          <view class="fallacy-section">
            <text class="section-label">识别逻辑谬误 (可选):</text>
            <view class="fallacy-tips">
              <text class="fallacy-tip">提示: 注意人身攻击、稻草人、虚假两难等常见谬误</text>
            </view>
            <view class="fallacy-input-row">
              <input
                class="fallacy-input"
                v-model="fallacyInput"
                placeholder="输入你发现的谬误类型..."
              />
              <button class="add-fallacy-btn" @click="addFallacy">添加</button>
            </view>
            <view class="fallacy-tags">
              <view
                v-for="(fallacy, index) in identifiedFallacies"
                :key="index"
                class="fallacy-tag"
              >
                <text>{{ fallacy }}</text>
                <text class="remove-tag" @click="removeFallacy(index)">×</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 结果展示 -->
        <view v-if="showResult" class="result-section">
          <view class="result-header">
            <text class="result-title">练习完成!</text>
            <text class="result-score">得分: {{ resultData.quality }}/10</text>
          </view>

          <view class="result-analysis">
            <view class="analysis-item correct">
              <text class="analysis-label">✓ 正确识别的谬误:</text>
              <text class="analysis-text" v-if="resultData.correctlyIdentified && resultData.correctlyIdentified.length">
                {{ resultData.correctlyIdentified.map(f => f.description).join('; ') }}
              </text>
              <text class="analysis-text" v-else>无</text>
            </view>
            <view class="analysis-item missed">
              <text class="analysis-label">✗ 遗漏的谬误:</text>
              <text class="analysis-text" v-if="resultData.missedFallacies && resultData.missedFallacies.length">
                {{ resultData.missedFallacies.map(f => f.description).join('; ') }}
              </text>
              <text class="analysis-text" v-else>无</text>
            </view>
          </view>

          <view class="your-argument">
            <text class="argument-label">你的论证:</text>
            <text class="argument-text">{{ argumentText }}</text>
          </view>
        </view>

        <view class="modal-actions">
          <button v-if="!selectedSide" class="cancel-btn" @click="closeDebateModal">
            取消
          </button>
          <button v-else-if="!showResult" class="submit-btn" @click="submitArgument" :disabled="!argumentText">
            提交论证
          </button>
          <button v-else class="done-btn" @click="finishDebate">
            完成
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useCriticalThinkingStore, PUZZLE_DIFFICULTY_INFO, DEBATE_SIDE } from '@/stores/criticalThinkingStore.js'

export default {
  data() {
    return {
      showDebateModal: false,
      currentTopic: null,
      selectedSide: null,
      argumentText: '',
      fallacyInput: '',
      identifiedFallacies: [],
      showResult: false,
      resultData: null
    }
  },
  computed: {
    ctStore() {
      return useCriticalThinkingStore()
    },
    topics() {
      return this.ctStore.debateTopics
    }
  },
  onLoad() {
    this.ctStore.init()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    getDifficultyInfo(difficulty) {
      return PUZZLE_DIFFICULTY_INFO[difficulty] || {}
    },
    selectTopic(topic) {
      this.currentTopic = topic
      this.selectedSide = null
      this.argumentText = ''
      this.fallacyInput = ''
      this.identifiedFallacies = []
      this.showResult = false
      this.showDebateModal = true
    },
    closeDebateModal() {
      this.showDebateModal = false
    },
    selectSide(side) {
      this.selectedSide = side
    },
    addFallacy() {
      if (this.fallacyInput && !this.identifiedFallacies.includes(this.fallacyInput)) {
        this.identifiedFallacies.push(this.fallacyInput)
        this.fallacyInput = ''
      }
    },
    removeFallacy(index) {
      this.identifiedFallacies.splice(index, 1)
    },
    submitArgument() {
      if (!this.argumentText) return

      const result = this.ctStore.submitDebateArgument(
        this.currentTopic.id,
        this.selectedSide,
        this.argumentText,
        this.identifiedFallacies.map(type => ({ type }))
      )

      this.resultData = result
      this.showResult = true
    },
    finishDebate() {
      this.closeDebateModal()
      uni.showToast({ title: '练习完成!', icon: 'success' })
    },
    getDebateProgress(topicId) {
      return this.ctStore.getDebateProgress(topicId)
    }
  }
}
</script>

<style scoped>
.debate-practice-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #c3cfe2 100%);
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.back-btn {
  font-size: 60rpx;
  color: #ffffff;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.nav-placeholder {
  width: 60rpx;
}

.topics-list {
  padding: 20rpx 30rpx;
}

.topic-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.topic-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.completed-badge {
  font-size: 22rpx;
  color: #52c41a;
  margin-left: 16rpx;
}

.topic-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.difficulty-badge {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #ffffff;
}

.quality-text {
  font-size: 24rpx;
  color: #667eea;
}

.topic-preview {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.preview-side {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
}

.side-label {
  font-size: 24rpx;
  font-weight: bold;
}

.preview-side.pro .side-label {
  color: #1890ff;
}

.preview-side.con .side-label {
  color: #f5222d;
}

.points-text {
  font-size: 24rpx;
  color: #666;
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 100rpx;
  color: #999;
}

/* Modal Styles */
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
  z-index: 999;
}

.modal-content {
  background: #ffffff;
  border-radius: 30rpx;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.modal-close {
  font-size: 50rpx;
  color: #999;
  padding: 0 20rpx;
}

.difficulty-info {
  padding: 16rpx 30rpx;
}

.diff-badge {
  display: inline-block;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #ffffff;
}

.side-selection {
  padding: 20rpx 30rpx;
}

.section-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.side-buttons {
  display: flex;
  gap: 20rpx;
}

.side-btn {
  flex: 1;
  padding: 30rpx;
  border-radius: 20rpx;
  text-align: center;
  border: 2rpx solid #eee;
}

.side-btn.pro {
  background: rgba(24, 144, 255, 0.1);
  border-color: #1890ff;
}

.side-btn.con {
  background: rgba(245, 34, 45, 0.1);
  border-color: #f5222d;
}

.side-icon {
  font-size: 48rpx;
  display: block;
  margin-bottom: 10rpx;
}

.side-name {
  font-size: 30rpx;
  font-weight: bold;
  display: block;
}

.side-desc {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-top: 8rpx;
}

.debate-content {
  padding: 20rpx 30rpx;
}

.argument-section {
  margin-bottom: 30rpx;
}

.argument-input {
  width: 100%;
  height: 150rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.char-count {
  font-size: 22rpx;
  color: #999;
  text-align: right;
  display: block;
  margin-top: 8rpx;
}

.fallacy-section {
  margin-bottom: 20rpx;
}

.fallacy-tips {
  background: #fff9e6;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
}

.fallacy-tip {
  font-size: 24rpx;
  color: #faad14;
}

.fallacy-input-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.fallacy-input {
  flex: 1;
  height: 70rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 26rpx;
}

.add-fallacy-btn {
  width: 120rpx;
  height: 70rpx;
  background: #667eea;
  color: #ffffff;
  border-radius: 12rpx;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fallacy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.fallacy-tag {
  display: flex;
  align-items: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 30rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  color: #667eea;
}

.remove-tag {
  margin-left: 10rpx;
  font-size: 30rpx;
  color: #999;
}

.result-section {
  padding: 20rpx 30rpx;
}

.result-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.result-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.result-score {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
  display: block;
  margin-top: 10rpx;
}

.result-analysis {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.analysis-item {
  margin-bottom: 16rpx;
}

.analysis-item:last-child {
  margin-bottom: 0;
}

.analysis-label {
  font-size: 26rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.analysis-item.correct .analysis-label {
  color: #52c41a;
}

.analysis-item.missed .analysis-label {
  color: #f5222d;
}

.analysis-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}

.your-argument {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
}

.argument-label {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.argument-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.modal-actions {
  padding: 30rpx;
}

.cancel-btn,
.submit-btn,
.done-btn {
  width: 100%;
  padding: 24rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  border: none;
}

.cancel-btn {
  background: #999;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.submit-btn[disabled] {
  background: #ccc;
}

.done-btn {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}
</style>
