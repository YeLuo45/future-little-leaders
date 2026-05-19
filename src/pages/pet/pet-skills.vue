<template>
  <view class="pet-skills">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="back-btn" @click="goBack">←</text>
      <text class="title">宠物技能</text>
    </view>

    <!-- 无宠物提示 -->
    <view class="no-pet-tip" v-if="!petStore.hasPet">
      <text class="tip-icon">🐾</text>
      <text class="tip-text">领养宠物后才能使用技能系统</text>
      <button class="back-home-btn" @click="goBack">返回首页</button>
    </view>

    <template v-else>
      <!-- 宠物信息卡片 -->
      <view class="pet-info-card" :style="{ background: petStore.petData?.color }">
        <text class="pet-icon">{{ petStore.petTypeInfo?.icon }}</text>
        <view class="pet-detail">
          <text class="pet-name">{{ petStore.petData?.name }}</text>
          <text class="pet-level">Lv.{{ petStore.petData?.level }}</text>
        </view>
        <view class="equipped-count">
          <text class="count-num">{{ petStore.equippedSkills.length }}</text>
          <text class="count-label">/4 已装备</text>
        </view>
      </view>

      <!-- 技能列表 -->
      <view class="skills-section">
        <text class="section-title">我的技能</text>
        <view class="skills-list">
          <view 
            v-for="skill in petStore.availableSkills" 
            :key="skill.id"
            class="skill-card"
            :class="{ equipped: skill.isEquipped, 'max-level': skill.level >= 10 }"
          >
            <view class="skill-header">
              <view class="skill-icon-wrapper" :class="skill.type">
                <text class="skill-icon">{{ skill.icon }}</text>
              </view>
              <view class="skill-info">
                <text class="skill-name">{{ skill.name }}</text>
                <text class="skill-type-badge">{{ getSkillTypeName(skill.type) }}</text>
              </view>
              <view class="skill-level">
                <text class="level-num">Lv.{{ skill.level }}</text>
                <text class="level-max" v-if="skill.level >= 10">MAX</text>
              </view>
            </view>
            
            <view class="skill-stats">
              <view class="stat-item">
                <text class="stat-label">威力</text>
                <text class="stat-value">{{ petStore.getSkillPower(skill.id, skill.level) }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">经验</text>
                <text class="stat-value">{{ skill.exp }}/50</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">状态</text>
                <text class="stat-value" :class="{ equipped: skill.isEquipped }">
                  {{ skill.isEquipped ? '已装备' : '未装备' }}
                </text>
              </view>
            </view>
            
            <view class="skill-progress">
              <view class="exp-bar">
                <view class="exp-fill" :style="{ width: (skill.exp / 50 * 100) + '%' }"></view>
              </view>
            </view>
            
            <view class="skill-actions">
              <button 
                class="action-btn equip" 
                :class="{ active: skill.isEquipped }"
                @click="handleEquip(skill.id)"
              >
                {{ skill.isEquipped ? '取消装备' : '装备' }}
              </button>
              <button 
                class="action-btn upgrade" 
                :disabled="skill.level >= 10 || skill.exp < 50"
                @click="handleUpgrade(skill.id)"
              >
                升级
              </button>
            </view>
          </view>
        </view>
      </view>

      <!-- 技能说明 -->
      <view class="skill-tips">
        <text class="tips-title">💡 技能说明</text>
        <view class="tips-content">
          <text class="tip-item">• 每个宠物有4个专属技能</text>
          <text class="tip-item">• 最多可以装备4个技能</text>
          <text class="tip-item">• 技能经验在竞赛中获得</text>
          <text class="tip-item">• 技能升至10级后无法继续升级</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePetStore } from '@/stores/petStore.js'

const petStore = usePetStore()

const getSkillTypeName = (type) => {
  const names = {
    attack: '攻击',
    defense: '防御',
    support: '辅助',
    special: '特殊'
  }
  return names[type] || type
}

const handleEquip = (skillId) => {
  const result = petStore.equipSkill(skillId)
  if (!result.success) {
    uni.showToast({ title: result.message, icon: 'none' })
  }
}

const handleUpgrade = (skillId) => {
  const result = petStore.upgradeSkill(skillId)
  if (result.success) {
    uni.showToast({ title: `升级成功！威力提升至${result.newPower}`, icon: 'success' })
  } else {
    uni.showToast({ title: result.message, icon: 'none' })
  }
}

const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  petStore.init()
})
</script>

<style scoped>
.pet-skills {
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

.no-pet-tip {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.tip-icon {
  font-size: 48px;
}

.tip-text {
  font-size: 14px;
  color: #666;
}

.back-home-btn {
  background: #8477fa;
  color: #fff;
  border-radius: 20px;
  padding: 10px 24px;
  font-size: 14px;
  margin-top: 12px;
}

.pet-info-card {
  background: linear-gradient(135deg, #8477fa 0%, #9b95f9 100%);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.pet-icon {
  font-size: 40px;
}

.pet-detail {
  flex: 1;
}

.pet-name {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  display: block;
}

.pet-level {
  font-size: 12px;
  color: rgba(255,255,255,0.9);
}

.equipped-count {
  text-align: center;
}

.count-num {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  display: block;
}

.count-label {
  font-size: 11px;
  color: rgba(255,255,255,0.8);
}

.skills-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
  display: block;
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  border: 2px solid transparent;
}

.skill-card.equipped {
  border-color: #8477fa;
}

.skill-card.max-level {
  background: linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%);
}

.skill-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.skill-icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.skill-icon-wrapper.attack {
  background: #fff0f0;
}

.skill-icon-wrapper.defense {
  background: #e8f4ff;
}

.skill-icon-wrapper.support {
  background: #f0fff0;
}

.skill-icon-wrapper.special {
  background: #fff8e8;
}

.skill-info {
  flex: 1;
}

.skill-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
}

.skill-type-badge {
  font-size: 11px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 8px;
  margin-top: 2px;
  display: inline-block;
}

.skill-level {
  text-align: right;
}

.level-num {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
}

.level-max {
  font-size: 10px;
  color: #ff9800;
  font-weight: bold;
}

.skill-stats {
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 11px;
  color: #999;
  display: block;
}

.stat-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
}

.stat-value.equipped {
  color: #8477fa;
}

.skill-progress {
  margin-bottom: 12px;
}

.exp-bar {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, #8477fa 0%, #9b95f9 100%);
  border-radius: 2px;
  transition: width 0.3s;
}

.skill-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border-radius: 20px;
  font-size: 13px;
  border: none;
  background: #f5f5f5;
  color: #333;
}

.action-btn.equip {
  background: #8477fa;
  color: #fff;
}

.action-btn.equip.active {
  background: #f5f5f5;
  color: #8477fa;
}

.action-btn.upgrade {
  background: #fff3e0;
  color: #ff9800;
}

.action-btn.upgrade:disabled {
  background: #f5f5f5;
  color: #ccc;
}

.skill-tips {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
}

.tips-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  display: block;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tip-item {
  font-size: 12px;
  color: #666;
  line-height: 1.6;
}
</style>
