<template>
  <view class="science-lab-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">🧪 虚拟实验室</text>
      <view class="header-stats">
        <view class="stat-item">
          <text class="stat-value">{{ store.sciencePoints.totalPoints }}</text>
          <text class="stat-label">积分</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">Lvl {{ store.scienceLevel }}</text>
          <text class="stat-label">等级</text>
        </view>
      </view>
    </view>

    <!-- 科学类型选择 -->
    <view class="science-types">
      <view 
        class="type-tab"
        :class="{ active: store.selectedScienceType === type.id }"
        v-for="type in store.scienceTypes"
        :key="type.id"
        @click="store.selectedScienceType = type.id"
      >
        <text class="type-icon">{{ type.icon }}</text>
        <text class="type-name">{{ type.name }}</text>
      </view>
    </view>

    <!-- 实验列表 -->
    <view class="experiments-section">
      <view class="section-header">
        <text class="section-title">可做实验</text>
        <text class="section-count">{{ filteredExperiments.length }} 个</text>
      </view>

      <view v-if="filteredExperiments.length === 0" class="empty-state">
        <text class="empty-icon">🔬</text>
        <text class="empty-text">暂无{{ currentTypeName }}实验</text>
      </view>

      <view class="experiment-list">
        <view 
          class="experiment-card"
          v-for="exp in filteredExperiments"
          :key="exp.id"
          @click="startExperiment(exp)"
        >
          <view class="exp-header">
            <view class="exp-icon" :style="{ backgroundColor: getScienceColor(exp.type) }">
              <text>{{ getScienceIcon(exp.type) }}</text>
            </view>
            <view class="exp-info">
              <text class="exp-title">{{ exp.title }}</text>
              <view class="exp-meta">
                <text class="exp-type">{{ getScienceName(exp.type) }}</text>
                <text class="exp-difficulty" :class="exp.difficulty">{{ getDifficultyText(exp.difficulty) }}</text>
              </view>
            </view>
            <view class="exp-points">
              <text class="points-value">+{{ exp.points }}</text>
            </view>
          </view>
          <text class="exp-desc">{{ exp.description }}</text>
          <view class="exp-footer">
            <view class="exp-duration">
              <text>⏱️ {{ exp.duration }}分钟</text>
            </view>
            <view class="exp-safety" :class="exp.safetyLevel">
              <text>{{ getSafetyText(exp.safetyLevel) }}</text>
            </view>
            <view v-if="exp.isCompleted" class="exp-completed">
              <text>✓ 已完成</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 实验进行中弹窗 -->
    <uni-popup ref="experimentPopup" type="bottom" :mask-click="false">
      <view class="experiment-popup" v-if="store.currentExperiment">
        <view class="popup-header">
          <text class="popup-title">{{ store.currentExperiment.title }}</text>
          <text class="popup-close" @click="closeExperiment">✕</text>
        </view>
        
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
        <text class="progress-text">步骤 {{ store.currentStep + 1 }} / {{ store.currentExperiment.steps.length }}</text>

        <view class="step-content" v-if="currentStepData">
          <text class="step-title">{{ currentStepData.title }}</text>
          <text class="step-desc">{{ currentStepData.description }}</text>
        </view>

        <view class="popup-actions">
          <button 
            class="btn-prev" 
            :disabled="store.currentStep === 0"
            @click="store.prevStep()"
          >上一步</button>
          <button 
            class="btn-next" 
            v-if="store.currentStep < store.currentExperiment.steps.length - 1"
            @click="store.nextStep()"
          >下一步</button>
          <button 
            class="btn-complete" 
            v-else
            @click="completeExperiment"
          >完成实验</button>
        </view>
      </view>
    </uni-popup>

    <!-- 完成记录弹窗 -->
    <uni-popup ref="recordPopup" type="center">
      <view class="record-popup">
        <text class="record-title">🎉 实验完成！</text>
        <view class="record-info">
          <text class="record-points">+{{ store.currentExperiment?.points || 0 }} 积分</text>
        </view>
        <view class="record-input">
          <text class="input-label">记录你的发现（选填）:</text>
          <textarea 
            class="input-area" 
            v-model="experimentRecord" 
            placeholder="写下你的实验发现和感想..."
            maxlength="200"
          />
        </view>
        <button class="btn-save" @click="saveExperimentRecord">保存记录</button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { useScienceLabStore } from '@/stores/scienceLabStore.js'

export default {
  data() {
    return {
      experimentRecord: ''
    }
  },
  computed: {
    store() {
      return useScienceLabStore()
    },
    filteredExperiments() {
      return this.store.experimentsByType(this.store.selectedScienceType)
    },
    currentTypeName() {
      const type = this.store.scienceTypes.find(t => t.id === this.store.selectedScienceType)
      return type ? type.name : ''
    },
    currentStepData() {
      if (this.store.currentExperiment && this.store.currentExperiment.steps) {
        return this.store.currentExperiment.steps[this.store.currentStep]
      }
      return null
    },
    progressPercent() {
      if (!this.store.currentExperiment) return 0
      return ((this.store.currentStep + 1) / this.store.currentExperiment.steps.length) * 100
    }
  },
  onLoad() {
    this.store.init()
  },
  methods: {
    startExperiment(exp) {
      if (exp.isCompleted) {
        uni.showToast({ title: '已完成过该实验', icon: 'none' })
        return
      }
      this.store.selectExperiment(exp.id)
      this.$refs.experimentPopup.open()
    },
    closeExperiment() {
      this.$refs.experimentPopup.close()
      this.store.resetCurrentExperiment()
    },
    completeExperiment() {
      this.$refs.experimentPopup.close()
      this.$refs.recordPopup.open()
    },
    saveExperimentRecord() {
      this.store.completeCurrentExperiment({
        record: this.experimentRecord,
        completedAt: new Date().toISOString()
      })
      this.$refs.recordPopup.close()
      this.experimentRecord = ''
      uni.showToast({ title: '实验完成！积分+', icon: 'success' })
    },
    getScienceIcon(type) {
      const icons = { chemistry: '🧪', physics: '⚡', biology: '🔬', earth: '🌍', astronomy: '🚀' }
      return icons[type] || '🔬'
    },
    getScienceColor(type) {
      const colors = { chemistry: '#9B59B6', physics: '#3498DB', biology: '#27AE60', earth: '#E67E22', astronomy: '#2C3E50' }
      return colors[type] || '#999'
    },
    getScienceName(type) {
      const names = { chemistry: '化学', physics: '物理', biology: '生物', earth: '地球科学', astronomy: '天文' }
      return names[type] || type
    },
    getDifficultyText(difficulty) {
      const texts = { easy: '简单', medium: '中等', hard: '困难' }
      return texts[difficulty] || difficulty
    },
    getSafetyText(level) {
      const texts = { safe: '安全', warning: '需小心', danger: '危险' }
      return texts[level] || level
    }
  }
}
</script>

<style scoped>
.science-lab-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: #fff;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
}

.header-stats {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.science-types {
  display: flex;
  gap: 8px;
  padding: 15px;
  overflow-x: auto;
  background: #fff;
}

.type-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 15px;
  border-radius: 10px;
  background: #f0f0f0;
  min-width: 60px;
}

.type-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.type-icon {
  font-size: 24px;
}

.type-name {
  font-size: 11px;
  margin-top: 4px;
}

.experiments-section {
  padding: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.section-count {
  font-size: 12px;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.experiment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.experiment-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.exp-header {
  display: flex;
  align-items: center;
}

.exp-icon {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.exp-info {
  flex: 1;
  margin-left: 12px;
}

.exp-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.exp-meta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.exp-type {
  font-size: 11px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.exp-difficulty {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.exp-difficulty.easy {
  color: #27ae60;
  background: #e8f8f0;
}

.exp-difficulty.medium {
  color: #f39c12;
  background: #fef9e7;
}

.exp-difficulty.hard {
  color: #e74c3c;
  background: #fdedec;
}

.exp-points {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.exp-desc {
  font-size: 13px;
  color: #666;
  margin-top: 10px;
  line-height: 1.4;
}

.exp-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.exp-duration {
  font-size: 12px;
  color: #666;
}

.exp-safety {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.exp-safety.safe {
  color: #27ae60;
  background: #e8f8f0;
}

.exp-safety.warning {
  color: #f39c12;
  background: #fef9e7;
}

.exp-safety.danger {
  color: #e74c3c;
  background: #fdedec;
}

.exp-completed {
  margin-left: auto;
  font-size: 12px;
  color: #27ae60;
}

/* Popup Styles */
.experiment-popup {
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  min-height: 60vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.popup-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.popup-close {
  font-size: 20px;
  color: #999;
  padding: 5px;
}

.progress-bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  margin: 15px 0 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: #999;
  text-align: center;
}

.step-content {
  margin: 20px 0;
  padding: 20px;
  background: #f8f8f8;
  border-radius: 12px;
}

.step-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10px;
}

.step-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.popup-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-prev, .btn-next, .btn-complete {
  flex: 1;
  padding: 12px;
  border-radius: 25px;
  font-size: 14px;
  border: none;
}

.btn-prev {
  background: #eee;
  color: #666;
}

.btn-next {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn-complete {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
}

.btn-prev[disabled] {
  opacity: 0.5;
}

.record-popup {
  background: #fff;
  border-radius: 20px;
  padding: 25px;
  width: 300px;
  text-align: center;
}

.record-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15px;
}

.record-info {
  margin-bottom: 15px;
}

.record-points {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
}

.record-input {
  text-align: left;
  margin-bottom: 15px;
}

.input-label {
  font-size: 13px;
  color: #666;
  display: block;
  margin-bottom: 8px;
}

.input-area {
  width: 100%;
  height: 80px;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 10px;
  font-size: 14px;
  box-sizing: border-box;
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 14px;
}
</style>
