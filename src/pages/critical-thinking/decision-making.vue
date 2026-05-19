<template>
  <view class="decision-making-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">决策训练</text>
      <text class="nav-placeholder"></text>
    </view>

    <!-- 场景类型筛选 -->
    <view class="filter-section">
      <view
        v-for="type in decisionTypes"
        :key="type.value"
        class="filter-tag"
        :class="{ active: selectedType === type.value }"
        :style="selectedType === type.value ? { background: type.color } : {}"
        @click="filterByType(type.value)"
      >
        {{ type.icon }} {{ type.label }}
      </view>
    </view>

    <!-- 决策场景列表 -->
    <view class="scenarios-list">
      <view
        v-for="scenario in filteredScenarios"
        :key="scenario.id"
        class="scenario-card"
        @click="selectScenario(scenario)"
      >
        <view class="scenario-header">
          <view class="type-badge" :style="{ background: getTypeInfo(scenario.type).color }">
            {{ getTypeInfo(scenario.type).icon }} {{ getTypeInfo(scenario.type).label }}
          </view>
          <view v-if="getDecisionProgress(scenario.id).completed" class="completed-badge">
            ✓ 已完成
          </view>
        </view>
        <text class="scenario-title">{{ scenario.title }}</text>
        <text class="scenario-situation">{{ scenario.situation }}</text>
        <view class="scenario-footer">
          <view class="difficulty-badge" :style="{ background: getDifficultyInfo(scenario.difficulty).color }">
            {{ getDifficultyInfo(scenario.difficulty).label }}
          </view>
          <text class="options-count">{{ scenario.options.length }} 个选项</text>
        </view>
      </view>

      <view v-if="filteredScenarios.length === 0" class="empty-state">
        <text>暂无决策场景</text>
      </view>
    </view>

    <!-- 决策场景详情弹窗 -->
    <view v-if="showScenarioModal" class="modal-overlay" @click="closeScenarioModal">
      <view class="modal-content scenario-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ currentScenario.title }}</text>
          <text class="modal-close" @click="closeScenarioModal">×</text>
        </view>

        <view class="scenario-info">
          <view class="type-badge" :style="{ background: getTypeInfo(currentScenario.type).color }">
            {{ getTypeInfo(currentScenario.type).icon }} {{ getTypeInfo(currentScenario.type).label }}
          </view>
          <view class="diff-badge" :style="{ background: getDifficultyInfo(currentScenario.difficulty).color }">
            {{ getDifficultyInfo(currentScenario.difficulty).label }}
          </view>
        </view>

        <!-- 情境描述 -->
        <view class="situation-section">
          <text class="section-label">📋 情境:</text>
          <text class="situation-text">{{ currentScenario.situation }}</text>
        </view>

        <!-- 选项列表 -->
        <view class="options-section">
          <text class="section-label">🤔 你会怎么做?</text>
          <view
            v-for="option in currentScenario.options"
            :key="option.id"
            class="option-item"
            :class="{
              selected: selectedOptionId === option.id,
              correct: showResult && option.id === selectedOptionId && option.score >= 4,
              wrong: showResult && option.id === selectedOptionId && option.score < 4
            }"
            @click="selectOption(option.id)"
          >
            <view class="option-radio">
              <view v-if="selectedOptionId === option.id" class="radio-inner"></view>
            </view>
            <text class="option-text">{{ option.text }}</text>
          </view>
        </view>

        <!-- 反思输入 -->
        <view v-if="selectedOptionId && !showResult" class="reflection-section">
          <text class="section-label">💭 反思 (可选):</text>
          <textarea
            class="reflection-input"
            v-model="reflectionText"
            placeholder="思考你为什么做出这个选择..."
            maxlength="300"
          />
        </view>

        <!-- 结果展示 -->
        <view v-if="showResult" class="result-section">
          <view class="result-header" :class="{ good: selectedOption && selectedOption.score >= 4 }">
            <text class="result-icon">{{ selectedOption && selectedOption.score >= 4 ? '🌟' : '💪' }}</text>
            <text class="result-text">
              {{ selectedOption && selectedOption.score >= 4 ? '很好的选择!' : '继续加油!' }}
            </text>
            <text class="score-text">得分: {{ selectedOption ? selectedOption.score : 0 }}/5</text>
          </view>

          <view class="consequence-box">
            <text class="consequence-label">📝 后果分析:</text>
            <text class="consequence-text">{{ selectedOption ? selectedOption.consequence : '' }}</text>
          </view>

          <view class="analysis-box">
            <text class="analysis-label">💡 决策指导:</text>
            <text class="analysis-text">{{ currentScenario.analysis }}</text>
          </view>
        </view>

        <view class="modal-actions">
          <button v-if="!showResult" class="submit-btn" @click="submitDecision" :disabled="!selectedOptionId">
            提交决策
          </button>
          <button v-else class="done-btn" @click="finishScenario">
            完成
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useCriticalThinkingStore, DECISION_TYPE, DECISION_TYPE_INFO, PUZZLE_DIFFICULTY_INFO } from '@/stores/criticalThinkingStore.js'

export default {
  data() {
    return {
      selectedType: null,
      showScenarioModal: false,
      currentScenario: null,
      selectedOptionId: null,
      reflectionText: '',
      showResult: false,
      decisionTypes: [
        { value: null, label: '全部', icon: '📋', color: '#666' },
        { value: DECISION_TYPE.SIMPLE, label: '简单决策', icon: DECISION_TYPE_INFO[DECISION_TYPE.SIMPLE].icon, color: DECISION_TYPE_INFO[DECISION_TYPE.SIMPLE].color },
        { value: DECISION_TYPE.COMPLEX, label: '复杂决策', icon: DECISION_TYPE_INFO[DECISION_TYPE.COMPLEX].icon, color: DECISION_TYPE_INFO[DECISION_TYPE.COMPLEX].color },
        { value: DECISION_TYPE.ETHICAL, label: '伦理决策', icon: DECISION_TYPE_INFO[DECISION_TYPE.ETHICAL].icon, color: DECISION_TYPE_INFO[DECISION_TYPE.ETHICAL].color }
      ]
    }
  },
  computed: {
    ctStore() {
      return useCriticalThinkingStore()
    },
    scenarios() {
      return this.ctStore.decisionScenarios
    },
    filteredScenarios() {
      if (!this.selectedType) return this.scenarios
      return this.ctStore.getScenariosByType(this.selectedType)
    }
  },
  onLoad() {
    this.ctStore.init()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    getTypeInfo(type) {
      return DECISION_TYPE_INFO[type] || {}
    },
    getDifficultyInfo(difficulty) {
      return PUZZLE_DIFFICULTY_INFO[difficulty] || {}
    },
    filterByType(type) {
      this.selectedType = type
    },
    selectScenario(scenario) {
      this.currentScenario = scenario
      this.selectedOptionId = null
      this.reflectionText = ''
      this.showResult = false
      this.showScenarioModal = true
    },
    closeScenarioModal() {
      this.showScenarioModal = false
    },
    selectOption(optionId) {
      if (!this.showResult) {
        this.selectedOptionId = optionId
      }
    },
    submitDecision() {
      if (!this.selectedOptionId || !this.currentScenario) return

      const result = this.ctStore.submitDecision(
        this.currentScenario.id,
        this.selectedOptionId,
        this.reflectionText
      )

      this.showResult = true
    },
    finishScenario() {
      this.closeScenarioModal()
      uni.showToast({ title: '决策完成!', icon: 'success' })
    },
    getDecisionProgress(scenarioId) {
      return this.ctStore.getDecisionProgress(scenarioId)
    }
  }
}
</script>

<style scoped>
.decision-making-page {
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

.filter-section {
  display: flex;
  padding: 20rpx 30rpx;
  gap: 16rpx;
  flex-wrap: wrap;
}

.filter-tag {
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  background: #ffffff;
  font-size: 26rpx;
  color: #666;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.filter-tag.active {
  color: #ffffff;
}

.scenarios-list {
  padding: 20rpx 30rpx;
}

.scenario-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.type-badge {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #ffffff;
}

.completed-badge {
  font-size: 22rpx;
  color: #52c41a;
}

.scenario-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.scenario-situation {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
  line-height: 1.4;
}

.scenario-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.difficulty-badge {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #ffffff;
}

.options-count {
  font-size: 22rpx;
  color: #999;
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

.scenario-info {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 30rpx;
}

.diff-badge {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #ffffff;
}

.situation-section {
  padding: 0 30rpx 20rpx;
}

.section-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.situation-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 16rpx;
  display: block;
}

.options-section {
  padding: 0 30rpx 20rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid transparent;
}

.option-item.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.option-item.correct {
  border-color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
}

.option-item.wrong {
  border-color: #f5222d;
  background: rgba(245, 34, 45, 0.1);
}

.option-radio {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 4rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.option-item.selected .option-radio {
  border-color: #667eea;
}

.radio-inner {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #667eea;
}

.option-text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
  line-height: 1.4;
}

.reflection-section {
  padding: 0 30rpx 20rpx;
}

.reflection-input {
  width: 100%;
  height: 100rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.result-section {
  padding: 20rpx 30rpx;
}

.result-header {
  text-align: center;
  padding: 30rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.result-header.good {
  background: rgba(82, 196, 26, 0.1);
}

.result-icon {
  font-size: 60rpx;
  display: block;
}

.result-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-top: 10rpx;
}

.score-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
  display: block;
  margin-top: 10rpx;
}

.consequence-box,
.analysis-box {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
}

.consequence-label,
.analysis-label {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.consequence-text,
.analysis-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.modal-actions {
  padding: 30rpx;
}

.submit-btn,
.done-btn {
  width: 100%;
  padding: 24rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.submit-btn[disabled] {
  background: #ccc;
}

.done-btn {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}
</style>
