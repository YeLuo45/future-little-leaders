<template>
  <view class="pet-evolution">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="back-btn" @click="goBack">←</text>
      <text class="title">进化路线</text>
    </view>

    <!-- 宠物信息 -->
    <view class="pet-info-card" :style="{ background: petStore.petData?.color }">
      <text class="pet-icon">{{ petStore.petTypeInfo?.icon }}</text>
      <view class="pet-detail">
        <text class="pet-name">{{ petStore.petData?.name }}</text>
        <text class="pet-stage">当前阶段: {{ petStore.petStageInfo?.name }}</text>
      </view>
    </view>

    <!-- 进化阶段 -->
    <view class="evolution-stages">
      <text class="section-title">进化阶段</text>
      <view class="stages-list">
        <view 
          v-for="(stage, index) in evolutionPath" 
          :key="stage.id"
          class="stage-item"
          :class="{ 
            'current': stage.id === petStore.petData?.stage,
            'locked': index > currentIndex,
            'passed': index < currentIndex
          }"
        >
          <view class="stage-icon-wrapper">
            <text class="stage-icon">{{ petStore.petTypeInfo?.icon }}</text>
            <view class="stage-status" v-if="index === currentIndex">
              <text>✨</text>
            </view>
          </view>
          <view class="stage-info">
            <text class="stage-name">{{ stage.name }}</text>
            <text class="stage-exp" v-if="index > 0">需要 {{ stage.expRequired }} 经验</text>
            <text class="stage-exp" v-else>初始阶段</text>
          </view>
          <view class="stage-connector" v-if="index < evolutionPath.length - 1"></view>
        </view>
      </view>
    </view>

    <!-- 进化条件 -->
    <view class="evolution-conditions">
      <text class="section-title">进化条件</text>
      <view class="condition-card">
        <view class="condition-header">
          <text class="condition-title">如何让宠物进化？</text>
        </view>
        <view class="condition-list">
          <view class="condition-item">
            <text class="condition-icon">📋</text>
            <view class="condition-content">
              <text class="condition-name">完成任务</text>
              <text class="condition-desc">每完成任务获得 20 经验值</text>
            </view>
          </view>
          <view class="condition-item">
            <text class="condition-icon">🎮</text>
            <view class="condition-content">
              <text class="condition-name">与宠物玩耍</text>
              <text class="condition-desc">每次玩耍获得 10 经验值</text>
            </view>
          </view>
          <view class="condition-item">
            <text class="condition-icon">📅</text>
            <view class="condition-content">
              <text class="condition-name">每日登录</text>
              <text class="condition-desc">每日登录奖励 15 经验值</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 当前进度 -->
    <view class="current-progress">
      <text class="section-title">当前进度</text>
      <view class="progress-card">
        <view class="progress-header">
          <text class="progress-pet">{{ petStore.petData?.name }}</text>
          <text class="progress-exp">{{ petStore.petData?.exp || 0 }} / {{ nextStageExp }} EXP</text>
        </view>
        <view class="progress-bar-bg">
          <view 
            class="progress-bar-fill" 
            :style="{ width: progressPercent + '%' }"
          ></view>
        </view>
        <text class="progress-tip" v-if="petStore.nextStage">
          再获得 {{ petStore.expToNextStage }} 经验即可进化为 {{ petStore.nextStage.name }}
        </text>
        <text class="progress-tip max-stage" v-else>
          {{ petStore.petData?.name }} 已达到最高进化阶段！
        </text>
      </view>
    </view>

    <!-- 进化历史 -->
    <view class="evolution-history" v-if="petStore.petData?.evolutionHistory?.length > 0">
      <text class="section-title">进化历史</text>
      <view class="history-list">
        <view 
          v-for="(record, index) in petStore.petData.evolutionHistory" 
          :key="index"
          class="history-item"
        >
          <text class="history-icon">✨</text>
          <text class="history-text">
            {{ formatStage(record.from) }} → {{ formatStage(record.to) }}
          </text>
          <text class="history-date">{{ formatDate(record.at) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePetStore } from '@/stores/petStore.js'

const petStore = usePetStore()

const evolutionPath = computed(() => {
  return petStore.evolutionPath?.stages || []
})

const currentIndex = computed(() => {
  return petStore.currentStageIndex
})

const nextStageExp = computed(() => {
  if (!petStore.nextStage) return petStore.petData?.exp || 0
  return petStore.nextStage.expRequired
})

const progressPercent = computed(() => {
  if (!petStore.nextStage) return 100
  return petStore.progressToNextStage
})

const formatStage = (stageId) => {
  const stageNames = {
    baby: '宝宝',
    child: '幼年',
    teen: '少年',
    adult: '成年',
    elder: '老年'
  }
  return stageNames[stageId] || stageId
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  petStore.init()
})
</script>

<style scoped>
.pet-evolution {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.back-btn {
  font-size: 24px;
  color: #333;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.pet-info-card {
  background: linear-gradient(135deg, #8477fa 0%, #9b95f9 100%);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.pet-icon {
  font-size: 48px;
}

.pet-detail .pet-name {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

.pet-stage {
  font-size: 14px;
  color: rgba(255,255,255,0.9);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
  display: block;
}

.evolution-stages {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.stages-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.stage-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  position: relative;
}

.stage-item.locked {
  opacity: 0.5;
}

.stage-item.passed .stage-icon-wrapper {
  background: #e8e8e8;
}

.stage-item.current .stage-icon-wrapper {
  background: #8477fa;
  box-shadow: 0 0 12px rgba(132, 119, 250, 0.5);
}

.stage-icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.stage-icon {
  font-size: 28px;
}

.stage-status {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.stage-info {
  flex: 1;
}

.stage-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
}

.stage-exp {
  font-size: 12px;
  color: #999;
}

.stage-connector {
  position: absolute;
  left: 25px;
  top: 62px;
  width: 2px;
  height: 20px;
  background: #ddd;
}

.stage-item.passed .stage-connector {
  background: #8477fa;
}

.evolution-conditions {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.condition-card {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 12px;
}

.condition-header {
  margin-bottom: 8px;
}

.condition-title {
  font-size: 14px;
  color: #333;
}

.condition-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.condition-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.condition-icon {
  font-size: 24px;
}

.condition-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
}

.condition-desc {
  font-size: 12px;
  color: #999;
}

.current-progress {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.progress-card {
  background: linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #ffe066;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-pet {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.progress-exp {
  font-size: 14px;
  color: #996600;
}

.progress-bar-bg {
  height: 10px;
  background: rgba(0,0,0,0.1);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #8477fa 0%, #9b95f9 100%);
  border-radius: 5px;
  transition: width 0.3s;
}

.progress-tip {
  font-size: 12px;
  color: #996600;
}

.progress-tip.max-stage {
  color: #8477fa;
  font-weight: bold;
}

.evolution-history {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8f8f8;
  border-radius: 8px;
}

.history-icon {
  font-size: 16px;
}

.history-text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.history-date {
  font-size: 12px;
  color: #999;
}
</style>
