<!-- 家庭仪式 - 主入口页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">家庭仪式</text>
    </view>

    <!-- 功能模块卡片 -->
    <view class="module-grid">
      <view class="module-card" @tap="navigateTo('daily-ritual')">
        <text class="module-icon">🌅</text>
        <text class="module-title">每日仪式</text>
        <text class="module-desc">培养日常家庭习惯</text>
        <view class="module-badge" v-if="todayCompletedCount > 0">{{ todayCompletedCount }}/{{ totalRitualCount }}</view>
      </view>

      <view class="module-card" @tap="navigateTo('weekly-challenge')">
        <text class="module-icon">🏆</text>
        <text class="module-title">每周挑战</text>
        <text class="module-desc">全家一起完成挑战</text>
        <view class="module-badge" v-if="activeChallengeCount > 0">{{ activeChallengeCount }}</view>
      </view>

      <view class="module-card" @tap="navigateTo('memory-archive')">
        <text class="module-icon">📸</text>
        <text class="module-title">回忆存档</text>
        <text class="module-desc">记录家庭珍贵时刻</text>
        <view class="module-badge" v-if="memoryCount > 0">{{ memoryCount }}</view>
      </view>

      <view class="module-card" @tap="navigateTo('family-mission')">
        <text class="module-icon">🎯</text>
        <text class="module-title">家庭任务</text>
        <text class="module-desc">全家共同目标</text>
        <view class="module-badge" v-if="activeMissionCount > 0">{{ activeMissionCount }}</view>
      </view>
    </view>

    <!-- 家庭积分池 -->
    <view class="pool-section">
      <view class="pool-header">
        <text class="pool-title">🏠 家庭积分池</text>
        <text class="pool-value">{{ familyPointsPool }}</text>
      </view>
      <view class="pool-hint">全员参与可获得积分倍增奖励</view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useFamilyRitualStore } from '@/stores/familyRitualStore.js'
import { useFamilyStore } from '@/stores/familyStore.js'

export default {
  setup() {
    const ritualStore = useFamilyRitualStore()
    const familyStore = useFamilyStore()

    onMounted(() => {
      ritualStore.init()
      familyStore.loadFamilyPointsPool()
    })

    const todayCompletedCount = computed(() => {
      return ritualStore.todayRituals.filter(r => r.completed).length
    })

    const totalRitualCount = computed(() => {
      return ritualStore.todayRituals.length
    })

    const activeChallengeCount = computed(() => {
      return ritualStore.activeChallenges.length
    })

    const memoryCount = computed(() => {
      return ritualStore.memories.length
    })

    const activeMissionCount = computed(() => {
      return ritualStore.activeMissions.length
    })

    const familyPointsPool = computed(() => {
      return familyStore.familyPointsPool
    })

    const navigateTo = (page) => {
      uni.navigateTo({ url: `/pages/family-ritual/${page}` })
    }

    const goBack = () => {
      uni.navigateBack()
    }

    return {
      todayCompletedCount,
      totalRitualCount,
      activeChallengeCount,
      memoryCount,
      activeMissionCount,
      familyPointsPool,
      navigateTo,
      goBack
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 60px 16px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.nav-left .icon {
  font-size: 24px;
  color: #fff;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  margin-right: 40px;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
}

.module-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px 16px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.module-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 8px;
}

.module-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.module-desc {
  font-size: 12px;
  color: #999;
  display: block;
}

.module-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #667eea;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}

.pool-section {
  margin: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  color: #fff;
}

.pool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.pool-title {
  font-size: 14px;
}

.pool-value {
  font-size: 28px;
  font-weight: bold;
}

.pool-hint {
  font-size: 12px;
  opacity: 0.8;
}
</style>
