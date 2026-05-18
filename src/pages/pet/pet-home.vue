<template>
  <view class="pet-home">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">宠物伙伴</text>
      <text class="subtitle" v-if="petStore.hasPet">{{ petStore.petData.name }}的成长记录</text>
    </view>

    <!-- 无宠物 - 领养界面 -->
    <view class="adoption-section" v-if="!petStore.hasPet">
      <view class="adoption-welcome">
        <text class="welcome-icon">🏠</text>
        <text class="welcome-title">欢迎来到宠物伙伴世界</text>
        <text class="welcome-desc">领养一只属于你的数字宠物，陪伴你一起成长！</text>
      </view>
      
      <!-- 宠物选择 -->
      <view class="pet-selector">
        <text class="selector-title">选择你的宠物伙伴</text>
        <view class="pet-options">
          <view 
            v-for="(pet, key) in petTypes" 
            :key="key"
            class="pet-option"
            :class="{ active: selectedType === key }"
            @click="selectType(key)"
          >
            <text class="pet-icon">{{ pet.icon }}</text>
            <text class="pet-name">{{ pet.name }}</text>
            <text class="pet-desc">性格温顺可爱</text>
          </view>
        </view>
      </view>

      <!-- 命名 -->
      <view class="name-input-section" v-if="selectedType">
        <text class="input-label">为你的宠物取个名字</text>
        <input 
          class="name-input" 
          v-model="petName" 
          placeholder="输入名字（2-8个字符）"
          maxlength="8"
        />
      </view>

      <!-- 确认领养 -->
      <button 
        class="adopt-btn" 
        :disabled="!canAdopt"
        @click="handleAdopt"
      >
        🐾 确认领养
      </button>
    </view>

    <!-- 有宠物 - 宠物首页 -->
    <view class="pet-info-section" v-else>
      <!-- 宠物卡片 -->
      <view class="pet-card" :style="{ background: 'linear-gradient(135deg, ' + petStore.petData.color + ' 0%, ' + petStore.petData.color + '88 100%)' }">
        <view class="pet-main">
          <text class="pet-avatar">{{ petStore.petTypeInfo?.icon }}</text>
          <view class="pet-details">
            <text class="pet-name">{{ petStore.petData.name }}</text>
            <text class="pet-type">{{ petStore.petTypeInfo?.name }}</text>
            <view class="pet-stage">
              <text class="stage-badge">{{ petStore.petStageInfo?.name }}</text>
              <text class="pet-level">Lv.{{ petStore.petData.level }}</text>
            </view>
          </view>
        </view>
        
        <!-- 经验条 -->
        <view class="exp-bar">
          <text class="exp-label">经验值 {{ petStore.petData.exp }} / {{ nextExp }}</text>
          <view class="exp-progress">
            <view class="exp-fill" :style="{ width: petStore.progressToNextStage + '%' }"></view>
          </view>
          <text class="exp-next" v-if="petStore.nextStage">距离 {{ petStore.nextStage.name }}还需 {{ petStore.expToNextStage }} 经验</text>
        </view>
      </view>

      <!-- 状态概览 -->
      <view class="status-overview">
        <view class="status-header">
          <text class="status-title">宠物状态</text>
          <text class="pet-mood-text">{{ petStore.petMoodEmoji }} {{ currentMoodText }}</text>
        </view>
        <view class="status-item" :class="{ low: petStore.petStats.hunger < 40 }">
          <text class="status-icon">🍖</text>
          <view class="status-content">
            <text class="status-name">饱腹度</text>
            <view class="status-bar">
              <view class="status-fill hunger" :style="{ width: petStore.petStats.hunger + '%' }"></view>
            </view>
          </view>
          <text class="status-value">{{ petStore.petStats.hunger }}%</text>
        </view>
        <view class="status-item" :class="{ low: petStore.petStats.mood < 40 }">
          <text class="status-icon">😊</text>
          <view class="status-content">
            <text class="status-name">心情</text>
            <view class="status-bar">
              <view class="status-fill mood" :style="{ width: petStore.petStats.mood + '%' }"></view>
            </view>
          </view>
          <text class="status-value">{{ petStore.petStats.mood }}%</text>
        </view>
        <view class="status-item" :class="{ low: petStore.petStats.health < 40 }">
          <text class="status-icon">💚</text>
          <view class="status-content">
            <text class="status-name">健康</text>
            <view class="status-bar">
              <view class="status-fill health" :style="{ width: petStore.petStats.health + '%' }"></view>
            </view>
          </view>
          <text class="status-value">{{ petStore.petStats.health }}%</text>
        </view>
        <view class="status-item" :class="{ low: petStore.petStats.cleanliness < 40 }">
          <text class="status-icon">🛁</text>
          <view class="status-content">
            <text class="status-name">清洁</text>
            <view class="status-bar">
              <view class="status-fill cleanliness" :style="{ width: petStore.petStats.cleanliness + '%' }"></view>
            </view>
          </view>
          <text class="status-value">{{ petStore.petStats.cleanliness }}%</text>
        </view>
      </view>

      <!-- 状态提示 -->
      <view class="status-tips" v-if="petStore.needsAttention">
        <text class="tips-title">⚠️ 需要关注</text>
        <view class="tips-list">
          <text v-for="tip in petStore.getStatusTips" :key="tip.type" class="tip-item">
            {{ tip.icon }} {{ tip.message }}
          </text>
        </view>
      </view>

      <!-- 快速操作 -->
      <view class="quick-actions">
        <view class="action-btn primary" @click="goToCare">
          <text class="action-icon">🧹</text>
          <text class="action-name">照顾宠物</text>
        </view>
        <view class="action-btn secondary" @click="goToEvolution">
          <text class="action-icon">✨</text>
          <text class="action-name">进化路线</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePetStore } from '@/stores/petStore.js'
import petService from '@/services/petService.js'

const petStore = usePetStore()
const selectedType = ref('')
const petName = ref('')

const petTypes = petService.PET_TYPES

const nextExp = computed(() => {
  if (!petStore.nextStage) return petStore.petData.exp + 500
  return petStore.nextStage.expRequired
})

const canAdopt = computed(() => {
  return selectedType.value && petName.value.length >= 2 && petName.value.length <= 8
})

const currentMoodText = computed(() => {
  const mood = petStore.petStats?.mood || 0
  if (mood >= 80) return '非常开心'
  if (mood >= 60) return '开心'
  if (mood >= 40) return '一般'
  if (mood >= 20) return '有点难过'
  return '很伤心'
})

const selectType = (type) => {
  selectedType.value = type
}

const handleAdopt = () => {
  if (!canAdopt.value) return
  petStore.adoptPet(selectedType.value, petName.value)
}

const goToCare = () => {
  uni.navigateTo({ url: '/pages/pet/pet-care' })
}

const goToEvolution = () => {
  uni.navigateTo({ url: '/pages/pet/pet-evolution' })
}

onMounted(() => {
  petStore.init()
})
</script>

<style scoped>
.pet-home {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.header .title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.header .subtitle {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.adoption-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
}

.adoption-welcome {
  text-align: center;
  margin-bottom: 24px;
}

.welcome-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.welcome-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.welcome-desc {
  font-size: 14px;
  color: #666;
}

.pet-selector {
  margin-bottom: 20px;
}

.selector-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 12px;
  display: block;
  font-weight: bold;
}

.pet-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.pet-option {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.pet-option.active {
  border-color: #8477fa;
  background: #f0eeff;
}

.pet-option .pet-icon {
  font-size: 40px;
}

.pet-option .pet-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.pet-option .pet-desc {
  font-size: 11px;
  color: #999;
}

.name-input-section {
  margin-bottom: 20px;
}

.input-label {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  display: block;
  font-weight: bold;
}

.name-input {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #eee;
}

.adopt-btn {
  background: linear-gradient(135deg, #8477fa 0%, #9b95f9 100%);
  color: #fff;
  border-radius: 24px;
  padding: 14px;
  font-size: 16px;
  width: 100%;
  border: none;
}

.adopt-btn[disabled] {
  background: #ccc;
}

.pet-info-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pet-card {
  border-radius: 16px;
  padding: 20px;
  color: #fff;
}

.pet-main {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.pet-avatar {
  font-size: 60px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pet-details {
  flex: 1;
}

.pet-details .pet-name {
  font-size: 22px;
  font-weight: bold;
}

.pet-details .pet-type {
  font-size: 14px;
  opacity: 0.9;
}

.pet-stage {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.stage-badge {
  background: rgba(255,255,255,0.3);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 12px;
}

.pet-level {
  font-size: 12px;
  opacity: 0.9;
}

.exp-bar {
  background: rgba(255,255,255,0.2);
  border-radius: 8px;
  padding: 8px 12px;
}

.exp-label {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 4px;
  display: block;
}

.exp-progress {
  height: 6px;
  background: rgba(255,255,255,0.3);
  border-radius: 3px;
  overflow: hidden;
}

.exp-fill {
  height: 100%;
  background: #fff;
  border-radius: 3px;
  transition: width 0.3s;
}

.exp-next {
  font-size: 11px;
  opacity: 0.8;
  margin-top: 4px;
  display: block;
}

.status-overview {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.pet-mood-text {
  font-size: 12px;
  color: #666;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.status-item.low {
  background: #fff0f0;
  margin: 0 -12px;
  padding: 8px 12px;
  border-radius: 8px;
}

.status-icon {
  font-size: 20px;
  width: 28px;
  text-align: center;
}

.status-content {
  flex: 1;
}

.status-name {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  display: block;
}

.status-bar {
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.status-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.status-fill.hunger {
  background: #FF9F43;
}

.status-fill.mood {
  background: #FFC312;
}

.status-fill.health {
  background: #26de81;
}

.status-fill.cleanliness {
  background: #4bcffa;
}

.status-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  width: 45px;
  text-align: right;
}

.status-tips {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
}

.tips-title {
  font-size: 14px;
  color: #ff6b6b;
  font-weight: bold;
  margin-bottom: 8px;
  display: block;
}

.tips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tip-item {
  background: #fff0f0;
  color: #ff6b6b;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #8477fa 0%, #9b95f9 100%);
  color: #fff;
}

.action-btn.secondary {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.action-icon {
  font-size: 32px;
}

.action-btn.primary .action-name {
  color: #fff;
}

.action-btn.secondary .action-name {
  color: #333;
}

.action-name {
  font-size: 14px;
  font-weight: bold;
}
</style>
