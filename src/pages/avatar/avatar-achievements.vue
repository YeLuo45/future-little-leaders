<template>
  <view class="avatar-achievements">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">Avatar 成就</text>
      <text class="subtitle">解锁专属外观</text>
    </view>

    <!-- 进度概览 -->
    <view class="progress-overview">
      <view class="progress-card">
        <view class="progress-stats">
          <view class="stat-item">
            <text class="stat-value">{{ avatarStore.achievementProgress.unlocked }}</text>
            <text class="stat-label">已解锁</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ avatarStore.achievementProgress.total }}</text>
            <text class="stat-label">总成就</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ avatarStore.achievementsData?.totalPoints || 0 }}</text>
            <text class="stat-label">总积分</text>
          </view>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
        <text class="progress-text">完成进度 {{ progressPercent }}%</text>
      </view>
    </view>

    <!-- Avatar 等级 -->
    <view class="level-card">
      <view class="level-left">
        <text class="level-icon">🏆</text>
        <view class="level-info">
          <text class="level-title">当前等级</text>
          <text class="level-value">Lv.{{ avatarStore.avatarData?.level || 1 }}</text>
        </view>
      </view>
      <view class="level-right">
        <text class="level-exp">{{ avatarStore.avatarData?.totalExp || 0 }} 经验值</text>
        <text class="level-next">距离下一级还需 {{ avatarStore.expToNextLevel }} 经验</text>
      </view>
    </view>

    <!-- 成就列表 -->
    <view class="achievements-list">
      <view class="list-title">成就列表</view>
      <view
        v-for="achievement in avatarStore.allAchievements"
        :key="achievement.id"
        class="achievement-item"
        :class="{ unlocked: isUnlocked(achievement.id) }"
      >
        <view class="achievement-icon-wrap">
          <text class="achievement-icon">{{ achievement.icon }}</text>
          <view class="unlock-badge" v-if="isUnlocked(achievement.id)">✓</view>
        </view>
        <view class="achievement-info">
          <text class="achievement-name">{{ achievement.name }}</text>
          <text class="achievement-desc">{{ achievement.description }}</text>
          <view class="achievement-meta">
            <text class="achievement-level">要求: Lv.{{ achievement.unlockLevel }}</text>
            <text class="achievement-points">+{{ achievement.points }}积分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 已解锁成就详情 -->
    <view class="unlocked-section" v-if="avatarStore.unlockedAchievementsList.length > 0">
      <view class="list-title">已解锁 ({{ avatarStore.unlockedAchievementsList.length }})</view>
      <view class="unlocked-grid">
        <view
          v-for="achievement in avatarStore.unlockedAchievementsList"
          :key="achievement.id"
          class="unlocked-badge"
        >
          <text class="badge-icon">{{ achievement.icon }}</text>
          <text class="badge-name">{{ achievement.name }}</text>
        </view>
      </view>
    </view>

    <!-- 稀有外观说明 -->
    <view class="rare-items-section">
      <view class="list-title">稀有外观预览</view>
      <view class="rare-items-grid">
        <view class="rare-item">
          <text class="rare-icon">👑</text>
          <text class="rare-name">皇冠</text>
          <text class="rare-level">Lv.5</text>
        </view>
        <view class="rare-item">
          <text class="rare-icon">🦸</text>
          <text class="rare-name">超级英雄</text>
          <text class="rare-level">Lv.5</text>
        </view>
        <view class="rare-item">
          <text class="rare-icon">👗</text>
          <text class="rare-name">公主裙</text>
          <text class="rare-level">Lv.4</text>
        </view>
        <view class="rare-item">
          <text class="rare-icon">🌟</text>
          <text class="rare-name">明星头像</text>
          <text class="rare-level">Lv.10</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAvatarStore } from '@/stores/avatarStore.js'

const avatarStore = useAvatarStore()

const progressPercent = computed(() => {
  const p = avatarStore.achievementProgress
  if (p.total === 0) return 0
  return Math.round((p.unlocked / p.total) * 100)
})

const isUnlocked = (achievementId) => {
  return avatarStore.achievementsData?.unlockedAchievements?.includes(achievementId) || false
}

onMounted(() => {
  avatarStore.init()
})
</script>

<style scoped>
.avatar-achievements {
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

.progress-overview {
  margin-bottom: 16px;
}

.progress-card {
  background: linear-gradient(135deg, #8477fa 0%, #9b95f9 100%);
  border-radius: 16px;
  padding: 20px;
  color: #fff;
}

.progress-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  display: block;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.stat-divider {
  width: 1px;
  background: rgba(255,255,255,0.3);
}

.progress-bar {
  height: 8px;
  background: rgba(255,255,255,0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #fff;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  text-align: center;
  opacity: 0.9;
}

.level-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-icon {
  font-size: 40px;
}

.level-info {
  display: flex;
  flex-direction: column;
}

.level-title {
  font-size: 12px;
  color: #666;
}

.level-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.level-right {
  text-align: right;
}

.level-exp {
  font-size: 14px;
  color: #8477fa;
  font-weight: bold;
  display: block;
}

.level-next {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  display: block;
}

.achievements-list {
  margin-bottom: 16px;
}

.list-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.achievement-item {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  display: flex;
  gap: 14px;
  align-items: center;
  border: 2px solid transparent;
}

.achievement-item.unlocked {
  border-color: #8477fa;
}

.achievement-icon-wrap {
  position: relative;
  width: 50px;
  height: 50px;
  background: #f5f5f5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.achievement-item.unlocked .achievement-icon-wrap {
  background: #f0eeff;
}

.achievement-icon {
  font-size: 28px;
}

.unlock-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  background: #8477fa;
  color: #fff;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
}

.achievement-desc {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
  display: block;
}

.achievement-meta {
  display: flex;
  gap: 12px;
  margin-top: 6px;
}

.achievement-level {
  font-size: 11px;
  color: #999;
}

.achievement-points {
  font-size: 11px;
  color: #f59e0b;
  font-weight: bold;
}

.unlocked-section {
  margin-bottom: 16px;
}

.unlocked-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.unlocked-badge {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: 2px solid #8477fa;
}

.badge-icon {
  font-size: 24px;
}

.badge-name {
  font-size: 10px;
  color: #333;
  text-align: center;
}

.rare-items-section {
  margin-bottom: 16px;
}

.rare-items-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.rare-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border: 2px solid #f59e0b;
}

.rare-icon {
  font-size: 36px;
}

.rare-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.rare-level {
  font-size: 12px;
  color: #f59e0b;
  font-weight: bold;
}
</style>
