<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">宝宝管理</text>
      <view class="nav-right" @tap="navigateToAddBaby">
        <text class="add-text">添加</text>
      </view>
    </view>

    <scroll-view scroll-y class="content">
      <!-- 宝宝列表 -->
      <view class="baby-list" v-if="babies.length > 0">
        <view 
          v-for="baby in babiesWithGrowth" 
          :key="baby.babyId"
          class="baby-card"
          @tap="selectBaby(baby)"
        >
          <view class="baby-main">
            <image 
              class="baby-avatar" 
              :src="baby.avatar || '/static/avatar.svg'" 
              mode="aspectFill"
            />
            <view class="baby-info">
              <view class="baby-header">
                <text class="baby-name">{{ baby.babyName }}</text>
                <text class="baby-level">Lv.{{ baby.level }}</text>
              </view>
              <view class="baby-stats">
                <text class="stat-item">{{ baby.totalTasks }}任务</text>
                <text class="stat-divider">|</text>
                <text class="stat-item">{{ baby.currentStreak }}天连续</text>
                <text class="stat-divider">|</text>
                <text class="stat-item points">{{ baby.totalPoints }}积分</text>
              </view>
            </view>
            <view class="select-indicator" v-if="currentBabyId === baby.babyId">
              <text class="check-icon">✓</text>
            </view>
          </view>
          
          <!-- 成长报告入口 -->
          <view class="growth-report-entry" @tap.stop="viewGrowthReport(baby.babyId)">
            <text class="growth-icon">📊</text>
            <text class="growth-text">查看M2成长报告</text>
            <text class="growth-arrow">></text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-view">
        <text class="empty-icon">👶</text>
        <text class="empty-text">还没有添加宝宝</text>
        <button class="add-baby-btn" @tap="navigateToAddBaby">添加宝宝</button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import growthReportService from '@/services/growthReportService'

const babies = ref([])
const currentBabyId = ref('')

// 宝宝列表（带成长数据）
const babiesWithGrowth = computed(() => {
  return growthReportService.getBabiesWithGrowthData()
})

// 加载宝宝列表
const loadBabies = () => {
  try {
    const stored = uni.getStorageSync('babies')
    babies.value = stored ? JSON.parse(stored) : []
    
    const storedBabyId = uni.getStorageSync('currentBabyId')
    currentBabyId.value = storedBabyId || (babies.value.length > 0 ? babies.value[0].id : '')
  } catch (e) {
    console.error('加载宝宝列表失败:', e)
    babies.value = []
  }
}

// 选择宝宝
const selectBaby = (baby) => {
  currentBabyId.value = baby.babyId
  uni.setStorageSync('currentBabyId', baby.babyId)
  
  // 广播宝宝切换事件
  uni.$emit('babyChanged', {
    babyId: baby.babyId,
    babyInfo: baby,
    source: 'baby-management',
    timestamp: Date.now()
  })
  
  uni.showToast({
    title: `已选择"${baby.babyName}"`,
    icon: 'none',
    duration: 1500
  })
}

// 查看成长报告
const viewGrowthReport = (babyId) => {
  // 先切换到该宝宝
  uni.setStorageSync('currentBabyId', babyId)
  
  uni.navigateTo({
    url: '/pages/growth-report/growth-report'
  })
}

// 跳转到添加宝宝
const navigateToAddBaby = () => {
  if (babies.value.length >= 3) {
    uni.showModal({
      title: '提示',
      content: '最多只能添加3个宝宝',
      showCancel: false
    })
    return
  }
  
  uni.navigateTo({
    url: '/pages/profile/add-baby'
  })
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 初始化
onMounted(() => {
  loadBabies()
  
  // 监听宝宝列表刷新
  uni.$on('refreshBabyList', loadBabies)
})

// 页面卸载时移除监听
import { onUnmounted } from 'vue'
onUnmounted(() => {
  uni.$off('refreshBabyList', loadBabies)
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

.nav-left {
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

.nav-right {
  width: 60px;
  text-align: right;
}

.add-text {
  font-size: 14px;
  color: #007aff;
}

.content {
  height: calc(100vh - 44px);
  padding: 16px;
}

.baby-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.baby-card {
  background-color: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.baby-main {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.baby-avatar {
  width: 56px;
  height: 56px;
  border-radius: 28px;
  margin-right: 12px;
}

.baby-info {
  flex: 1;
}

.baby-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.baby-name {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin-right: 8px;
}

.baby-level {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
}

.baby-stats {
  display: flex;
  align-items: center;
}

.stat-item {
  font-size: 12px;
  color: #666;
}

.stat-divider {
  margin: 0 6px;
  color: #ddd;
}

.stat-item.points {
  color: #ff9500;
  font-weight: 500;
}

.select-indicator {
  width: 24px;
  height: 24px;
  background-color: #00b578;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
}

/* 成长报告入口 */
.growth-report-entry {
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 12px;
  padding: 12px;
  margin-top: 8px;
}

.growth-icon {
  font-size: 18px;
  margin-right: 8px;
}

.growth-text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.growth-arrow {
  font-size: 14px;
  color: #999;
}

/* 空状态 */
.empty-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

.add-baby-btn {
  width: 160px;
  height: 44px;
  line-height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 22px;
  font-size: 15px;
  border: none;
}
</style>
