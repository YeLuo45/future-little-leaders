<!-- 晨间惯例页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">晨间惯例</text>
      <view class="nav-right" @tap="showAddItem">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- 今日状态 -->
    <view class="status-banner" :class="{ completed: store.isMorningComplete }">
      <view class="banner-content">
        <text class="banner-icon">{{ store.isMorningComplete ? '🌟' : '🌅' }}</text>
        <view class="banner-info">
          <text class="banner-title">{{ store.isMorningComplete ? '今日晨间已完成' : '开始今日晨间惯例' }}</text>
          <text class="banner-subtitle" v-if="store.morningStreak > 0">🔥 连续 {{ store.morningStreak }} 天</text>
        </view>
      </view>
      <view class="banner-progress">
        <text class="progress-num">{{ store.morningProgress }}%</text>
        <view class="progress-ring">
          <view class="ring-fill" :style="{ transform: `rotate(${store.morningProgress * 3.6}deg)` }"></view>
        </view>
      </view>
    </view>

    <!-- 惯例列表 -->
    <view class="routine-section">
      <text class="section-title">📋 晨间检查清单</text>
      <view class="routine-list">
        <view 
          v-for="item in store.activeMorningItems" 
          :key="item.id"
          class="routine-item"
          :class="{ completed: item.completed, disabled: store.isMorningComplete }"
          @tap="toggleItem(item)"
        >
          <view class="item-checkbox">
            <text v-if="item.completed" class="check-icon">✓</text>
          </view>
          <view class="item-icon">{{ item.icon }}</view>
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-desc">{{ item.description }}</text>
          </view>
          <text class="item-duration" v-if="item.defaultDuration">{{ item.defaultDuration }}分钟</text>
        </view>
      </view>
    </view>

    <!-- 快速添加模板 -->
    <view class="templates-section" v-if="!store.isMorningComplete">
      <text class="section-title">✨ 快速添加</text>
      <view class="template-chips">
        <view 
          v-for="tpl in availableTemplates" 
          :key="tpl.id"
          class="template-chip"
          @tap="addFromTemplate(tpl)"
        >
          <text class="chip-icon">{{ tpl.icon }}</text>
          <text class="chip-name">{{ tpl.name }}</text>
        </view>
      </view>
    </view>

    <!-- 完成按钮 -->
    <view class="action-section" v-if="!store.isMorningComplete">
      <button 
        class="complete-btn" 
        :class="{ ready: canComplete }"
        @tap="completeRoutine"
        :disabled="!canComplete"
      >
        {{ canComplete ? '完成晨间惯例 🌅' : '完成更多项目后领取奖励' }}
      </button>
    </view>

    <!-- 今日完成提示 -->
    <view class="completed-hint" v-if="store.isMorningComplete">
      <text class="hint-icon">🎉</text>
      <text class="hint-text">太棒了！明天继续坚持哦</text>
    </view>
  </view>
</template>

<script>
import { computed } from 'vue'
import { useDailyCeremoniesStore } from '@/stores/dailyCeremoniesStore.js'
import { MORNING_ROUTINE_TEMPLATES } from '@/services/dailyCeremoniesService.js'

export default {
  setup() {
    const store = useDailyCeremoniesStore()

    const availableTemplates = computed(() => {
      const existingIds = store.morningRoutine.map(i => i.id)
      return MORNING_ROUTINE_TEMPLATES.filter(t => !existingIds.includes(t.id))
    })

    const canComplete = computed(() => {
      const activeItems = store.activeMorningItems
      const completedCount = activeItems.filter(i => i.completed).length
      return activeItems.length > 0 && completedCount === activeItems.length
    })

    const toggleItem = (item) => {
      if (store.isMorningComplete) return
      store.toggleMorningItem(item.id)
    }

    const addFromTemplate = (tpl) => {
      store.morningRoutine.push({
        ...tpl,
        order: store.morningRoutine.length,
        completed: false,
        isActive: true
      })
      uni.showToast({ title: `已添加"${tpl.name}"`, icon: 'success' })
    }

    const showAddItem = () => {
      uni.showModal({
        title: '添加晨间项目',
        editable: true,
        placeholderText: '请输入项目名称',
        success: (res) => {
          if (res.content && res.content.trim()) {
            store.morningRoutine.push({
              id: 'custom_' + Date.now(),
              name: res.content.trim(),
              icon: '✨',
              description: '自定义项目',
              defaultDuration: 5,
              order: store.morningRoutine.length,
              completed: false,
              isActive: true
            })
            uni.showToast({ title: '添加成功', icon: 'success' })
          }
        }
      })
    }

    const completeRoutine = () => {
      const record = store.completeMorningRoutine()
      if (record) {
        uni.showToast({ title: `获得 ${record.expGained} 经验！`, icon: 'success' })
      }
    }

    const goBack = () => {
      uni.navigateBack()
    }

    return {
      store,
      availableTemplates,
      canComplete,
      toggleItem,
      addFromTemplate,
      showAddItem,
      completeRoutine,
      goBack
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #ffecd2 0%, #fcb69f 100%);
  padding-bottom: 120rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 60px 32rpx 32rpx;
  background: transparent;
}

.nav-left .icon, .nav-right .icon {
  font-size: 48rpx;
  color: #fff;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.nav-right {
  width: 60rpx;
  text-align: center;
}

.status-banner {
  margin: 0 32rpx 32rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.status-banner.completed {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.banner-content {
  display: flex;
  align-items: center;
}

.banner-icon {
  font-size: 56rpx;
  margin-right: 20rpx;
}

.banner-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.banner-subtitle {
  font-size: 24rpx;
  color: #ff6b6b;
}

.banner-progress {
  display: flex;
  align-items: center;
}

.progress-num {
  font-size: 36rpx;
  font-weight: bold;
  color: #fcb69f;
  margin-right: 12rpx;
}

.progress-ring {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f0f0f0;
  position: relative;
  overflow: hidden;
}

.ring-fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #fcb69f, #ff9a9e);
  transform-origin: center;
}

.routine-section {
  margin: 0 32rpx 32rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20rpx;
  display: block;
}

.routine-list {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.routine-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s;
}

.routine-item:last-child {
  border-bottom: none;
}

.routine-item.completed {
  background: #fafafa;
}

.routine-item.disabled {
  opacity: 0.6;
}

.item-checkbox {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 3rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.routine-item.completed .item-checkbox {
  background: #52c41a;
  border-color: #52c41a;
}

.check-icon {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}

.item-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.routine-item.completed .item-name {
  text-decoration: line-through;
  color: #999;
}

.item-desc {
  font-size: 24rpx;
  color: #999;
}

.item-duration {
  font-size: 22rpx;
  color: #bbb;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.templates-section {
  margin: 0 32rpx 32rpx;
}

.template-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.template-chip {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 12rpx 20rpx;
  border-radius: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.chip-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.chip-name {
  font-size: 24rpx;
  color: #666;
}

.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, transparent, rgba(252, 182, 159, 0.95));
}

.complete-btn {
  width: 100%;
  padding: 28rpx 0;
  border-radius: 50rpx;
  background: #ccc;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
}

.complete-btn.ready {
  background: linear-gradient(135deg, #fcb69f 0%, #ff9a9e 100%);
  box-shadow: 0 8rpx 32rpx rgba(252, 182, 159, 0.5);
}

.completed-hint {
  position: fixed;
  bottom: 40rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 20rpx 40rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.hint-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.hint-text {
  font-size: 28rpx;
  color: #52c41a;
  font-weight: bold;
}
</style>
