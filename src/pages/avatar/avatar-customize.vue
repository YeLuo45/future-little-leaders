<template>
  <view class="avatar-customize">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">头像定制</text>
      <text class="subtitle">打造独一无二的你</text>
    </view>

    <!-- Avatar 预览 -->
    <view class="avatar-preview" :style="{ background: 'linear-gradient(135deg, ' + (avatarStore.avatarData?.color || '#8477fa') + '20 0%, ' + (avatarStore.avatarData?.color || '#8477fa') + '10 100%)' }">
      <view class="preview-card">
        <text class="avatar-display" :class="{ animating: avatarStore.isAnimating }">
          {{ avatarStore.avatarDisplay }}
        </text>
        <view class="level-info">
          <text class="level-badge">Lv.{{ avatarStore.avatarData?.level || 1 }}</text>
          <view class="exp-bar">
            <view class="exp-fill" :style="{ width: avatarStore.progressToNextLevel + '%' }"></view>
          </view>
          <text class="exp-text">{{ avatarStore.avatarData?.totalExp || 0 }} 经验</text>
        </view>
      </view>
    </view>

    <!-- 定制选项 -->
    <view class="customize-sections">
      <!-- 脸型 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">脸型</text>
          <text class="section-current">{{ avatarStore.faceShapeInfo?.name || '' }}</text>
        </view>
        <view class="options-grid">
          <view
            v-for="(shape, key) in faceShapes"
            :key="key"
            class="option-item"
            :class="{ active: avatarStore.avatarData?.faceShape === key }"
            @click="avatarStore.setFaceShape(key)"
          >
            <text class="option-icon">{{ shape.icon }}</text>
            <text class="option-name">{{ shape.name }}</text>
          </view>
        </view>
      </view>

      <!-- 发型 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">发型</text>
          <text class="section-current">{{ avatarStore.hairStyleInfo?.name || '' }}</text>
        </view>
        <view class="options-grid">
          <view
            v-for="(hair, key) in hairStyles"
            :key="key"
            class="option-item"
            :class="{ active: avatarStore.avatarData?.hairStyle === key, locked: avatarStore.avatarData?.level < hair.unlockLevel }"
            @click="handleSelectHair(key, hair)"
          >
            <text class="option-icon">{{ hair.icon }}</text>
            <text class="option-name">{{ hair.name }}</text>
            <text class="lock-icon" v-if="avatarStore.avatarData?.level < hair.unlockLevel">🔒</text>
          </view>
        </view>
      </view>

      <!-- 肤色 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">肤色</text>
          <text class="section-current">{{ avatarStore.skinToneInfo?.name || '' }}</text>
        </view>
        <view class="options-grid skin-grid">
          <view
            v-for="(skin, key) in skinTones"
            :key="key"
            class="option-item skin-item"
            :class="{ active: avatarStore.avatarData?.skinTone === key }"
            @click="avatarStore.setSkinTone(key)"
          >
            <view class="skin-color" :style="{ background: skin.color }"></view>
            <text class="option-name">{{ skin.name }}</text>
          </view>
        </view>
      </view>

      <!-- 眼睛 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">眼睛</text>
          <text class="section-current">{{ avatarStore.eyeStyleInfo?.name || '' }}</text>
        </view>
        <view class="options-grid">
          <view
            v-for="(eye, key) in eyeStyles"
            :key="key"
            class="option-item"
            :class="{ active: avatarStore.avatarData?.eyeStyle === key, locked: avatarStore.avatarData?.level < eye.unlockLevel }"
            @click="handleSelectEye(key, eye)"
          >
            <text class="option-icon">{{ eye.icon }}</text>
            <text class="option-name">{{ eye.name }}</text>
            <text class="lock-icon" v-if="avatarStore.avatarData?.level < eye.unlockLevel">🔒</text>
          </view>
        </view>
      </view>

      <!-- 表情动作 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">表情</text>
          <text class="section-current">{{ avatarStore.expressionInfo?.name || '' }}</text>
        </view>
        <view class="options-grid">
          <view
            v-for="(expr, key) in expressions"
            :key="key"
            class="option-item expression-item"
            :class="{ active: avatarStore.currentExpression === key, locked: !isExpressionUnlocked(key) }"
            @click="handleSelectExpression(key, expr)"
          >
            <text class="option-icon">{{ expr.icon }}</text>
            <text class="option-name">{{ expr.name }}</text>
            <text class="lock-icon" v-if="!isExpressionUnlocked(key)">🔒</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 成就弹窗 -->
    <view class="achievement-modal" v-if="avatarStore.showAchievementModal" @click="avatarStore.closeAchievementModal">
      <view class="modal-content" @click.stop>
        <text class="achievement-icon">{{ newAchievement?.icon || '🎉' }}</text>
        <text class="achievement-title">成就解锁！</text>
        <text class="achievement-name">{{ newAchievement?.name || '' }}</text>
        <text class="achievement-desc">{{ newAchievement?.description || '' }}</text>
        <text class="achievement-points">+{{ newAchievement?.points || 0 }} 积分</text>
        <button class="modal-btn" @click="avatarStore.closeAchievementModal">太棒了！</button>
      </view>
    </view>

    <!-- 升级弹窗 -->
    <view class="levelup-modal" v-if="avatarStore.showLevelUpModal" @click="avatarStore.closeLevelUpModal">
      <view class="modal-content" @click.stop>
        <text class="levelup-icon">⬆️</text>
        <text class="levelup-title">升级了！</text>
        <text class="levelup-level">Lv.{{ avatarStore.newLevel }}</text>
        <text class="levelup-desc">恭喜！你离更酷的头像更近了一步</text>
        <button class="modal-btn" @click="avatarStore.closeLevelUpModal">继续</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAvatarStore } from '@/stores/avatarStore.js'
import avatarService from '@/services/avatarService.js'

const avatarStore = useAvatarStore()

const faceShapes = avatarService.FACE_SHAPES
const hairStyles = avatarService.HAIR_STYLES
const skinTones = avatarService.SKIN_TONES
const eyeStyles = avatarService.EYE_STYLES
const expressions = avatarService.EXPRESSIONS

const newAchievement = computed(() => avatarStore.newAchievement)

const isExpressionUnlocked = (expressionId) => {
  return avatarStore.wardrobeData?.ownedExpressions?.includes(expressionId) || false
}

const handleSelectHair = (key, hair) => {
  if (avatarStore.avatarData?.level < hair.unlockLevel) {
    uni.showToast({ title: `需要等级${hair.unlockLevel}解锁`, icon: 'none' })
    return
  }
  avatarStore.setHairStyle(key)
}

const handleSelectEye = (key, eye) => {
  if (avatarStore.avatarData?.level < eye.unlockLevel) {
    uni.showToast({ title: `需要等级${eye.unlockLevel}解锁`, icon: 'none' })
    return
  }
  avatarStore.setEyeStyle(key)
}

const handleSelectExpression = (key, expr) => {
  if (!isExpressionUnlocked(key)) {
    uni.showToast({ title: '请先在衣柜解锁该表情', icon: 'none' })
    return
  }
  avatarStore.setExpression(key)
}

onMounted(() => {
  avatarStore.init()
})
</script>

<style scoped>
.avatar-customize {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
  padding-bottom: 100px;
}

.header {
  margin-bottom: 16px;
}

.header .title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  display: block;
}

.header .subtitle {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
  display: block;
}

.avatar-preview {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
}

.preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-display {
  font-size: 80px;
  background: #fff;
  border-radius: 50%;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.avatar-display.animating {
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.level-info {
  width: 100%;
  text-align: center;
}

.level-badge {
  background: linear-gradient(135deg, #8477fa 0%, #9b95f9 100%);
  color: #fff;
  padding: 4px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
}

.exp-bar {
  height: 6px;
  background: #eee;
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, #8477fa 0%, #9b95f9 100%);
  border-radius: 3px;
  transition: width 0.3s;
}

.exp-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  display: block;
}

.customize-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.section-current {
  font-size: 14px;
  color: #8477fa;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.skin-grid {
  grid-template-columns: repeat(4, 1fr);
}

.option-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: #f8f8f8;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s;
  cursor: pointer;
}

.option-item.active {
  border-color: #8477fa;
  background: #f0eeff;
}

.option-item.locked {
  opacity: 0.5;
}

.option-icon {
  font-size: 28px;
}

.option-name {
  font-size: 11px;
  color: #666;
  text-align: center;
}

.lock-icon {
  font-size: 12px;
  position: absolute;
  top: 4px;
  right: 4px;
}

.skin-item {
  padding: 8px;
}

.skin-color {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #eee;
}

.expression-item {
  padding: 10px 6px;
}

/* 成就弹窗 */
.achievement-modal,
.levelup-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  width: 280px;
}

.achievement-icon,
.levelup-icon {
  font-size: 60px;
  display: block;
  margin-bottom: 16px;
}

.achievement-title,
.levelup-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.achievement-name,
.levelup-level {
  font-size: 18px;
  color: #8477fa;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
}

.achievement-desc,
.levelup-desc {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 12px;
}

.achievement-points {
  font-size: 16px;
  color: #f59e0b;
  font-weight: bold;
  display: block;
  margin-bottom: 20px;
}

.modal-btn {
  background: linear-gradient(135deg, #8477fa 0%, #9b95f9 100%);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 12px 32px;
  font-size: 16px;
}
</style>
