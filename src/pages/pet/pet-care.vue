<template>
  <view class="pet-home">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">我的宠物</text>
      <text class="subtitle" v-if="petStore.hasPet">{{ petStore.petData.name }}的成长记录</text>
    </view>

    <!-- 无宠物 - 领养界面 -->
    <view class="adoption-section" v-if="!petStore.hasPet">
      <view class="adoption-title">
        <text class="icon">🏠</text>
        <text>欢迎来到宠物伙伴世界</text>
      </view>
      <text class="adoption-desc">领养一只属于你的数字宠物，陪伴你一起成长！</text>
      
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
        确认领养
      </button>
    </view>

    <!-- 有宠物 - 宠物首页 -->
    <view class="pet-info-section" v-else>
      <!-- 宠物卡片 -->
      <view class="pet-card" :style="{ background: petStore.petData.color }">
        <view class="pet-main">
          <text class="pet-avatar">{{ getPetAvatar() }}</text>
          <view class="pet-details">
            <text class="pet-name">{{ petStore.petData.name }}</text>
            <text class="pet-type">{{ petStore.petTypeInfo.name }}</text>
            <view class="pet-stage">
              <text class="stage-badge">{{ petStore.petStageInfo.name }}</text>
              <text class="pet-level">Lv.{{ petStore.petData.level }}</text>
            </view>
          </view>
        </view>
        
        <!-- 经验条 -->
        <view class="exp-bar">
          <text class="exp-label">经验值 {{ petStore.petData.exp }}/{{ nextExp }}</text>
          <view class="exp-progress">
            <view class="exp-fill" :style="{ width: petStore.progressToNextStage + '%' }"></view>
          </view>
        </view>
      </view>

      <!-- 状态概览 -->
      <view class="status-overview">
        <view class="status-item" :class="{ low: petStore.petStats.hunger < 40 }">
          <text class="status-icon">🍖</text>
          <text class="status-name">饥饿</text>
          <view class="status-bar">
            <view class="status-fill" :style="{ width: petStore.petStats.hunger + '%' }"></view>
          </view>
          <text class="status-value">{{ petStore.petStats.hunger }}%</text>
        </view>
        <view class="status-item" :class="{ low: petStore.petStats.mood < 40 }">
          <text class="status-icon">{{ petStore.petMoodEmoji }}</text>
          <text class="status-name">心情</text>
          <view class="status-bar">
            <view class="status-fill" :style="{ width: petStore.petStats.mood + '%' }"></view>
          </view>
          <text class="status-value">{{ petStore.petStats.mood }}%</text>
        </view>
        <view class="status-item" :class="{ low: petStore.petStats.health < 40 }">
          <text class="status-icon">💚</text>
          <text class="status-name">健康</text>
          <view class="status-bar">
            <view class="status-fill" :style="{ width: petStore.petStats.health + '%' }"></view>
          </view>
          <text class="status-value">{{ petStore.petStats.health }}%</text>
        </view>
        <view class="status-item" :class="{ low: petStore.petStats.cleanliness < 40 }">
          <text class="status-icon">🛁</text>
          <text class="status-name">清洁</text>
          <view class="status-bar">
            <view class="status-fill" :style="{ width: petStore.petStats.cleanliness + '%' }"></view>
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
        <view class="action-btn" @click="goToCare">
          <text class="action-icon">🧹</text>
          <text class="action-name">照顾宠物</text>
        </view>
        <view class="action-btn" @click="goToEvolution">
          <text class="action-icon">✨</text>
          <text class="action-name">进化路线</text>
        </view>
      </view>
    </view>

    <!-- 进化弹窗 -->
    <uni-popup ref="evolutionPopup" type="center">
      <view class="evolution-modal" v-if="petStore.evolutionResult">
        <text class="evolution-title">🎉 进化成功！</text>
        <text class="evolution-stage">{{ petStore.evolutionResult.newStage }}</text>
        <text class="evolution-desc">你的宠物进化了！</text>
        <button @click="petStore.closeEvolutionModal">太棒了！</button>
      </view>
    </uni-popup>
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

const selectType = (type) => {
  selectedType.value = type
}

const handleAdopt = () => {
  if (!canAdopt.value) return
  petStore.adoptPet(selectedType.value, petName.value)
}

const getPetAvatar = () => {
  if (!petStore.petData) return '?'
  const stage = petStore.petStageInfo
  return petStore.petTypeInfo.icon
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

.adoption-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.adoption-title .icon {
  font-size: 24px;
}

.adoption-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

.pet-selector {
  margin-bottom: 20px;
}

.selector-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 12px;
  display: block;
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
  gap: 8px;
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
  color: #333;
}

.name-input-section {
  margin-bottom: 20px;
}

.input-label {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  display: block;
}

.name-input {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
}

.adopt-btn {
  background: #8477fa;
  color: #fff;
  border-radius: 24px;
  padding: 14px;
  font-size: 16px;
  width: 100%;
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
  background: linear-gradient(135deg, #8477fa 0%, #9b95f9 100%);
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

.status-overview {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.status-item {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-item.low {
  background: #fff0f0;
}

.status-icon {
  font-size: 20px;
}

.status-name {
  font-size: 12px;
  color: #666;
}

.status-bar {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.status-fill {
  height: 100%;
  background: #8477fa;
  border-radius: 2px;
  transition: width 0.3s;
}

.status-value {
  font-size: 12px;
  color: #333;
  font-weight: bold;
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

.action-icon {
  font-size: 32px;
}

.action-name {
  font-size: 14px;
  color: #333;
}

.evolution-modal {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  width: 280px;
}

.evolution-title {
  font-size: 20px;
  font-weight: bold;
  color: #8477fa;
  display: block;
  margin-bottom: 12px;
}

.evolution-stage {
  font-size: 24px;
  display: block;
  margin-bottom: 8px;
}

.evolution-desc {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 20px;
}

.evolution-modal button {
  background: #8477fa;
  color: #fff;
  border-radius: 20px;
  padding: 10px 24px;
}
</style>
