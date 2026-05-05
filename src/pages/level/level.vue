<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">我的等级</text>
      <view class="nav-right"></view>
    </view>

    <scroll-view scroll-y class="content">
      <!-- 等级卡片 -->
      <view class="level-card">
        <view class="level-header">
          <view class="avatar-container">
            <image 
              class="baby-avatar" 
              :src="babyInfo.avatar || '/static/avatar.svg'" 
              mode="aspectFill"
            />
            <view class="level-badge-ring">
              <text class="level-number">Lv.{{ currentLevel }}</text>
            </view>
          </view>
          <view class="baby-basic">
            <text class="baby-name">{{ babyInfo.name || '宝宝' }}</text>
            <text class="level-title">{{ levelTitle }}</text>
          </view>
        </view>
        
        <!-- 经验值进度 -->
        <view class="exp-section">
          <view class="exp-info">
            <text class="exp-label">经验值</text>
            <text class="exp-value">{{ currentExp }} / {{ expToNextLevel }}</text>
          </view>
          <view class="exp-bar-bg">
            <view class="exp-bar-fill" :style="{ width: expProgress + '%' }"></view>
          </view>
          <text class="exp-hint">再获得 {{ expToNextLevel - currentExp }} 经验值即可升级</text>
        </view>
      </view>

      <!-- 当前等级特权 -->
      <view class="privilege-section">
        <view class="section-title">
          <text class="title-icon">🎁</text>
          <text class="title-text">等级特权</text>
        </view>
        <view class="privilege-list">
          <view 
            v-for="(privilege, index) in currentPrivileges" 
            :key="index"
            class="privilege-item"
          >
            <text class="privilege-icon">{{ privilege.icon }}</text>
            <text class="privilege-text">{{ privilege.text }}</text>
          </view>
        </view>
      </view>

      <!-- 升级条件 -->
      <view class="condition-section">
        <view class="section-title">
          <text class="title-icon">📋</text>
          <text class="title-text">升级条件</text>
        </view>
        <view class="condition-list">
          <view class="condition-item">
            <view class="condition-icon completed">✓</view>
            <text class="condition-text">每完成一个任务：+10~50 经验值（根据任务难度）</text>
          </view>
          <view class="condition-item">
            <view class="condition-icon completed">✓</view>
            <text class="condition-text">连续打卡1天：+20 经验值</text>
          </view>
          <view class="condition-item">
            <view class="condition-icon completed">✓</view>
            <text class="condition-text">解锁成就：+50~200 经验值（根据成就稀有度）</text>
          </view>
          <view class="condition-item">
            <view class="condition-icon" :class="{ completed: totalExp >= 500 }">{{ totalExp >= 500 ? '✓' : '' }}</view>
            <text class="condition-text">兑换商品：消费积分的10%转换为经验值</text>
          </view>
        </view>
      </view>

      <!-- 等级排行榜（简单展示） -->
      <view class="rank-section">
        <view class="section-title">
          <text class="title-icon">🏆</text>
          <text class="title-text">等级一览</text>
        </view>
        <view class="rank-list">
          <view 
            v-for="level in levelList" 
            :key="level.lv"
            class="rank-item"
            :class="{ 
              'current': level.lv === currentLevel,
              'locked': level.lv > currentLevel
            }"
          >
            <view class="rank-level">
              <text class="rank-lv">Lv.{{ level.lv }}</text>
              <text class="rank-title">{{ level.title }}</text>
            </view>
            <view class="rank-exp">
              <text class="rank-exp-text">{{ level.minExp }} exp</text>
              <view class="rank-check" v-if="level.lv <= currentLevel">✓</view>
              <view class="rank-lock" v-else>🔒</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 经验值来源说明 -->
      <view class="source-section">
        <view class="section-title">
          <text class="title-icon">💡</text>
          <text class="title-text">经验值说明</text>
        </view>
        <view class="source-list">
          <view class="source-item">
            <text class="source-label">完成任务</text>
            <text class="source-value">+10~50/个</text>
          </view>
          <view class="source-item">
            <text class="source-label">连续打卡</text>
            <text class="source-value">+20/天</text>
          </view>
          <view class="source-item">
            <text class="source-label">解锁成就</text>
            <text class="source-value">+50~200/个</text>
          </view>
          <view class="source-item">
            <text class="source-label">积分兑换</text>
            <text class="source-value">+10%/消费</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import growthReportService from '@/services/growthReportService'
import { useBabyStore } from '@/stores/babyStore'
import { usePointsStore } from '@/stores/pointsStore'

const babyStore = useBabyStore()
const pointsStore = usePointsStore()

const babyInfo = ref({
  name: '',
  avatar: ''
})

// 从成长数据获取等级信息
const growthData = ref(null)

const currentLevel = computed(() => {
  return growthData.value?.level || 1
})

const currentExp = computed(() => {
  return growthData.value?.exp || 0
})

const expToNextLevel = computed(() => {
  return growthData.value?.expToNextLevel || 100
})

const expProgress = computed(() => {
  return growthData.value?.levelProgress || 0
})

const totalExp = computed(() => {
  // 累计积分作为总经验
  const babyId = babyStore.currentBabyId
  const points = pointsStore.getBabyPoints(babyId)
  return points
})

// 等级称号
const levelTitle = computed(() => {
  const lv = currentLevel.value
  if (lv <= 5) return '小小萌新'
  if (lv <= 10) return '成长小达人'
  if (lv <= 20) return '任务小能手'
  if (lv <= 30) return '坚持小勇士'
  if (lv <= 50) return '习惯小冠军'
  if (lv <= 80) return '卓越小榜样'
  return '传奇小领袖'
})

// 当前等级特权
const currentPrivileges = computed(() => {
  const lv = currentLevel.value
  const privileges = []
  
  if (lv >= 1) privileges.push({ icon: '⭐', text: '解锁基础任务类型' })
  if (lv >= 3) privileges.push({ icon: '🎨', text: '解锁成就徽章' })
  if (lv >= 5) privileges.push({ icon: '🛒', text: '解锁商城兑换' })
  if (lv >= 10) privileges.push({ icon: '📊', text: '解锁成长报告' })
  if (lv >= 15) privileges.push({ icon: '🏆', text: '专属等级徽章' })
  if (lv >= 20) privileges.push({ icon: '💎', text: '每周额外奖励' })
  if (lv >= 30) privileges.push({ icon: '👑', text: '专属头像框' })
  if (lv >= 50) privileges.push({ icon: '🌟', text: '优先客服通道' })
  
  return privileges.slice(0, 4) // 最多显示4个
})

// 等级列表
const levelList = [
  { lv: 1, title: '小小萌新', minExp: 0 },
  { lv: 5, title: '成长达人', minExp: 400 },
  { lv: 10, title: '任务能手', minExp: 1400 },
  { lv: 15, title: '坚持勇士', minExp: 2900 },
  { lv: 20, title: '习惯冠军', minExp: 4900 },
  { lv: 30, title: '卓越榜样', minExp: 10900 },
  { lv: 50, title: '传奇领袖', minExp: 30900 },
  { lv: 80, title: '永恒之星', minExp: 60900 }
]

// 加载数据
const loadData = () => {
  // 获取宝宝信息
  const currentBaby = babyStore.currentBaby
  if (currentBaby) {
    babyInfo.value = {
      name: currentBaby.name || '',
      avatar: currentBaby.avatar || ''
    }
  }
  
  // 获取成长数据中的等级信息
  const babyId = babyStore.currentBabyId
  if (babyId) {
    growthData.value = growthReportService.generateBabyGrowthReport(
      babyId,
      uni.getStorageSync('taskList') || [],
      pointsStore.pointsRecords
    )
  }
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 初始化
onMounted(() => {
  loadData()
  
  // 监听宝宝切换
  uni.$on('babyChanged', loadData)
})

import { onUnmounted } from 'vue'
onUnmounted(() => {
  uni.$off('babyChanged', loadData)
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left, .nav-right {
  width: 60px;
}

.back-icon {
  font-size: 20px;
  color: #333;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.content {
  height: calc(100vh - 44px);
  padding: 16px;
}

/* 等级卡片 */
.level-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.level-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-container {
  position: relative;
  margin-right: 16px;
}

.baby-avatar {
  width: 64px;
  height: 64px;
  border-radius: 32px;
  border: 3px solid #fff;
}

.level-badge-ring {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  border-radius: 12px;
  padding: 2px 8px;
  border: 2px solid #fff;
}

.level-number {
  font-size: 11px;
  font-weight: bold;
  color: #333;
}

.baby-basic {
  flex: 1;
}

.baby-name {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  display: block;
  margin-bottom: 4px;
}

.level-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

/* 经验值 */
.exp-section {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
}

.exp-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.exp-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.exp-value {
  font-size: 14px;
  color: #ffd700;
  font-weight: 600;
}

.exp-bar-bg {
  height: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  overflow: hidden;
}

.exp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700 0%, #ffeb3b 100%);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.exp-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;
  display: block;
}

/* 通用区块 */
.privilege-section,
.condition-section,
.rank-section,
.source-section {
  background-color: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.title-icon {
  font-size: 18px;
  margin-right: 8px;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 特权 */
.privilege-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.privilege-item {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 20px;
  padding: 8px 14px;
}

.privilege-icon {
  font-size: 16px;
  margin-right: 6px;
}

.privilege-text {
  font-size: 13px;
  color: #333;
}

/* 条件 */
.condition-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.condition-item {
  display: flex;
  align-items: flex-start;
}

.condition-icon {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background: #ddd;
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
}

.condition-icon.completed {
  background: #00b578;
}

.condition-text {
  font-size: 14px;
  color: #666;
  flex: 1;
  line-height: 20px;
}

/* 等级一览 */
.rank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rank-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 12px;
}

.rank-item.current {
  background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  border: 1px solid #667eea40;
}

.rank-item.locked {
  opacity: 0.6;
}

.rank-level {
  display: flex;
  align-items: center;
}

.rank-lv {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-right: 8px;
}

.rank-title {
  font-size: 13px;
  color: #666;
}

.rank-exp {
  display: flex;
  align-items: center;
}

.rank-exp-text {
  font-size: 12px;
  color: #999;
  margin-right: 8px;
}

.rank-check {
  width: 20px;
  height: 20px;
  background: #00b578;
  border-radius: 10px;
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-lock {
  font-size: 14px;
}

/* 经验值来源 */
.source-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.source-item {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.source-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.source-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
</style>
