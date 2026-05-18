<!-- 每日仪式页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">每日仪式</text>
      <view class="nav-right" @tap="showAddRitual">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- 今日仪式列表 -->
    <view class="section">
      <text class="section-title">🌅 今日仪式</text>
      <view v-if="todayRituals.length > 0" class="ritual-list">
        <view 
          v-for="ritual in todayRituals" 
          :key="ritual.id" 
          class="ritual-card"
          :class="{ completed: ritual.completed }"
        >
          <view class="ritual-header">
            <text class="ritual-icon">{{ getRitualIcon(ritual.template) }}</text>
            <view class="ritual-info">
              <text class="ritual-name">{{ ritual.name }}</text>
              <text class="ritual-time">{{ ritual.time }}</text>
            </view>
            <view class="ritual-status">
              <text v-if="ritual.completed" class="status-badge completed">✓ 已完成</text>
              <text v-else class="status-badge pending">⏳ 待打卡</text>
            </view>
          </view>
          
          <view class="ritual-progress">
            <text class="progress-text">打卡成员: {{ ritual.completedMembers.length }}/{{ children.length }}</text>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: getCompletionPercent(ritual) + '%' }"></view>
            </view>
          </view>

          <view class="ritual-actions">
            <button 
              v-if="!ritual.completed" 
              class="checkin-btn" 
              @tap="checkIn(ritual.id)"
            >打卡</button>
            <text v-else class="streak-hint">连续 {{ getStreak(ritual.id) }} 天</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-state">
        <text class="empty-icon">🌅</text>
        <text class="empty-text">暂无每日仪式</text>
        <text class="empty-hint">点击右上角 + 创建第一个家庭仪式</text>
      </view>
    </view>

    <!-- 模板快捷创建 -->
    <view class="section">
      <text class="section-title">📋 快速添加模板</text>
      <view class="template-grid">
        <view 
          v-for="tpl in templates" 
          :key="tpl.key" 
          class="template-card"
          @tap="quickAddRitual(tpl)"
        >
          <text class="tpl-icon">{{ tpl.icon }}</text>
          <text class="tpl-name">{{ tpl.name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useFamilyRitualStore } from '@/stores/familyRitualStore.js'
import { useBabyStore } from '@/stores/babyStore.js'
import { RITUAL_TEMPLATES } from '@/services/familyRitualService.js'

export default {
  setup() {
    const ritualStore = useFamilyRitualStore()
    const babyStore = useBabyStore()
    const templates = RITUAL_TEMPLATES

    onMounted(() => {
      ritualStore.init()
      babyStore.loadBabies()
    })

    const children = computed(() => babyStore.babies)
    const todayRituals = computed(() => ritualStore.todayRituals)

    const getRitualIcon = (template) => {
      const tpl = templates.find(t => t.key === template)
      return tpl ? tpl.icon : '✨'
    }

    const getCompletionPercent = (ritual) => {
      if (children.value.length === 0) return 0
      return Math.round((ritual.completedMembers.length / children.value.length) * 100)
    }

    const getStreak = (ritualId) => {
      return ritualStore.getRitualStreak(ritualId)
    }

    const checkIn = (ritualId) => {
      const currentBabyId = babyStore.currentBabyId
      if (!currentBabyId) {
        uni.showToast({ title: '请先选择宝宝', icon: 'none' })
        return
      }
      ritualStore.checkInRitual(ritualId, currentBabyId)
      uni.showToast({ title: '打卡成功！', icon: 'success' })
    }

    const showAddRitual = () => {
      uni.showModal({
        title: '创建每日仪式',
        editable: true,
        placeholderText: '请输入仪式名称',
        success: (res) => {
          if (res.content && res.content.trim()) {
            ritualStore.createRitual(
              res.content.trim(),
              '08:00',
              'custom',
              ''
            )
            uni.showToast({ title: '创建成功', icon: 'success' })
          }
        }
      })
    }

    const quickAddRitual = (tpl) => {
      ritualStore.createRitual(tpl.name, '08:00', tpl.key, tpl.description)
      uni.showToast({ title: `已添加"${tpl.name}"`, icon: 'success' })
    }

    const goBack = () => {
      uni.navigateBack()
    }

    return {
      templates,
      children,
      todayRituals,
      getRitualIcon,
      getCompletionPercent,
      getStreak,
      checkIn,
      showAddRitual,
      quickAddRitual,
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.nav-left .icon, .nav-right .icon {
  font-size: 24px;
  color: #fff;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.nav-right {
  width: 40px;
  text-align: center;
}

.section {
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
  display: block;
}

.ritual-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ritual-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.ritual-card.completed {
  border-left: 4px solid #52c41a;
}

.ritual-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.ritual-icon {
  font-size: 32px;
  margin-right: 12px;
}

.ritual-info {
  flex: 1;
}

.ritual-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
}

.ritual-time {
  font-size: 12px;
  color: #999;
}

.status-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-badge.completed {
  background: #d9f7be;
  color: #52c41a;
}

.status-badge.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.ritual-progress {
  margin-bottom: 12px;
}

.progress-text {
  font-size: 12px;
  color: #666;
  display: block;
  margin-bottom: 4px;
}

.progress-bar {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f093fb, #f5576c);
  border-radius: 3px;
  transition: width 0.3s;
}

.ritual-actions {
  display: flex;
  justify-content: flex-end;
}

.checkin-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 24px;
  font-size: 14px;
}

.streak-hint {
  font-size: 12px;
  color: #fa8c16;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: #fff;
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 16px;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 12px;
  color: #999;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.template-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.tpl-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 4px;
}

.tpl-name {
  font-size: 12px;
  color: #666;
}
</style>
