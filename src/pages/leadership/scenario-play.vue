<template>
  <view class="scenario-play-container">
    <!-- 顶部区域 -->
    <view class="header-section">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="nav-bar">
          <text class="back-btn" @tap="goBack">←</text>
          <text class="title">角色扮演</text>
          <view class="placeholder"></view>
        </view>
      </view>
    </view>

    <!-- 场景内容 -->
    <scroll-view scroll-y class="content-scroll">
      <view class="scenario-content" v-if="currentScenario">
        <!-- 场景信息卡片 -->
        <view class="scenario-info-card">
          <view class="scenario-type">
            {{ getScenarioTypeInfo()[currentScenario.type].icon }} {{ getScenarioTypeInfo()[currentScenario.type].label }}
          </view>
          <text class="scenario-title">{{ currentScenario.title }}</text>
          <text class="scenario-desc">{{ currentScenario.description }}</text>
          
          <!-- 角色提示 -->
          <view class="role-card">
            <view class="role-badge">
              {{ getRoleInfo()[currentScenario.role].icon }} {{ getRoleInfo()[currentScenario.role].label }}
            </view>
            <text class="role-context">{{ currentScenario.context }}</text>
          </view>
        </view>

        <!-- 情境展示 -->
        <view class="situation-card" v-if="!isCompleted">
          <view class="situation-icon">💭</view>
          <view class="situation-content">
            <text class="situation-label">当前情境</text>
            <text class="situation-text">{{ currentScenario.situation }}</text>
          </view>
        </view>

        <!-- 选项列表 -->
        <view class="options-section" v-if="!isCompleted">
          <text class="section-title">请选择你的行动：</text>
          <view class="options-list">
            <view 
              v-for="option in currentScenario.options" 
              :key="option.id"
              class="option-card"
              @tap="selectOption(option)"
            >
              <text class="option-text">{{ option.text }}</text>
            </view>
          </view>
        </view>

        <!-- 结果展示 -->
        <view class="result-card" v-if="isCompleted">
          <view class="result-header">
            <text class="result-icon">🎉</text>
            <text class="result-title">完成！</text>
          </view>
          
          <view class="result-choice">
            <text class="choice-label">你的选择：</text>
            <text class="choice-text">{{ selectedOption?.text }}</text>
          </view>
          
          <view class="result-outcome">
            <text class="outcome-label">结果：</text>
            <text class="outcome-text">{{ selectedOption?.result }}</text>
          </view>
          
          <view class="result-rewards">
            <text class="rewards-label">属性变化：</text>
            <view class="rewards-list">
              <view class="reward-item" v-if="selectedOption?.effect?.influence">
                <text>{{ STATS_INFO[LEADERSHIP_STATS.INFLUENCE].icon }}</text>
                <text>+{{ selectedOption.effect.influence }}</text>
              </view>
              <view class="reward-item" v-if="selectedOption?.effect?.decision">
                <text>{{ STATS_INFO[LEADERSHIP_STATS.DECISION].icon }}</text>
                <text>+{{ selectedOption.effect.decision }}</text>
              </view>
              <view class="reward-item" v-if="selectedOption?.effect?.communication">
                <text>{{ STATS_INFO[LEADERSHIP_STATS.COMMUNICATION].icon }}</text>
                <text>+{{ selectedOption.effect.communication }}</text>
              </view>
            </view>
          </view>
          
          <view class="level-up-hint" v-if="completionResult?.leveledUp">
            <text>🎊 升级到 Lv.{{ completionResult.newLevel }}！</text>
          </view>
        </view>
      </view>
      
      <view v-else class="empty-state">
        <text>场景不存在</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLeadershipStore } from '@/stores/leadershipStore'
import { LEADERSHIP_STATS, STATS_INFO } from '@/services/leadershipService'

const leadershipStore = useLeadershipStore()

const selectedOption = ref(null)
const completionResult = ref(null)

const currentScenario = computed(() => leadershipStore.currentScenario)

const isCompleted = computed(() => {
  if (!currentScenario.value) return false
  return leadershipStore.completedScenarios.some(s => s.id === currentScenario.value.id)
})

const getRoleInfo = () => leadershipStore.getRoleInfo()
const getScenarioTypeInfo = () => leadershipStore.getScenarioTypeInfo()

const selectOption = (option) => {
  if (!currentScenario.value) return
  
  selectedOption.value = option
  leadershipStore.startScenario(currentScenario.value)
  
  const result = leadershipStore.completeScenarioChoice(currentScenario.value.id, option.id)
  completionResult.value = result
  
  if (result?.leveledUp) {
    uni.showModal({
      title: '🎉 升级了！',
      content: `恭喜升级到 Lv.${result.newLevel}！`,
      showCancel: false
    })
  }
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.scenario-play-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
}

.header-section {
  position: relative;
  padding: 120rpx 40rpx 40rpx;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  background: linear-gradient(135deg, #722ed1 0%, #eb4888 100%);
  border-radius: 0 0 40rpx 40rpx;
}

.header-content {
  position: relative;
  z-index: 1;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  font-size: 40rpx;
  color: #ffffff;
  padding: 10rpx 20rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.placeholder {
  width: 60rpx;
}

.content-scroll {
  height: calc(100vh - 240rpx);
  padding: 0 40rpx;
}

.scenario-content {
  padding-bottom: 120rpx;
}

.scenario-info-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-top: -20rpx;
}

.scenario-type {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  display: inline-block;
  background: rgba(114, 46, 209, 0.3);
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.scenario-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
  display: block;
}

.scenario-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin-bottom: 30rpx;
  display: block;
}

.role-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 30rpx;
  border-left: 6rpx solid #722ed1;
}

.role-badge {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12rpx;
  display: block;
}

.role-context {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

.situation-card {
  background: linear-gradient(135deg, rgba(250, 140, 22, 0.15) 0%, rgba(250, 140, 22, 0.05) 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-top: 30rpx;
  display: flex;
  gap: 20rpx;
  border: 2rpx solid rgba(250, 140, 22, 0.3);
}

.situation-icon {
  font-size: 50rpx;
}

.situation-content {
  flex: 1;
}

.situation-label {
  font-size: 24rpx;
  color: #FA8C16;
  margin-bottom: 12rpx;
  display: block;
  font-weight: bold;
}

.situation-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.options-section {
  margin-top: 40rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 24rpx;
  display: block;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.option-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 30rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.option-card:active {
  background: rgba(255, 255, 255, 0.15);
  border-color: #722ed1;
}

.option-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

.result-card {
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.15) 0%, rgba(82, 196, 26, 0.05) 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-top: 30rpx;
  border: 2rpx solid rgba(82, 196, 26, 0.3);
}

.result-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 30rpx;
}

.result-icon {
  font-size: 80rpx;
}

.result-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #52C41A;
}

.result-choice, .result-outcome {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.choice-label, .outcome-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8rpx;
  display: block;
}

.choice-text {
  font-size: 28rpx;
  color: #ffffff;
  line-height: 1.5;
}

.outcome-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.result-rewards {
  margin-top: 20rpx;
}

.rewards-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 16rpx;
  display: block;
}

.rewards-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.1);
  padding: 12rpx 20rpx;
  border-radius: 30rpx;
}

.reward-item text {
  font-size: 28rpx;
  color: #52C41A;
}

.level-up-hint {
  margin-top: 30rpx;
  text-align: center;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 20rpx;
  border-radius: 16rpx;
}

.level-up-hint text {
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx;
}

.empty-state text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.5);
}
</style>
