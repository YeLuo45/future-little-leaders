<!-- 家庭任务页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">家庭任务</text>
      <view class="nav-right" @tap="showCreateMission">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- 进行中的任务 -->
    <view class="section">
      <text class="section-title">🎯 进行中的任务</text>
      
      <view v-if="activeMissions.length > 0" class="mission-list">
        <view 
          v-for="mission in activeMissions" 
          :key="mission.id" 
          class="mission-card"
          :class="'category-' + mission.category"
        >
          <view class="mission-header">
            <text class="mission-icon">{{ getCategoryIcon(mission.category) }}</text>
            <view class="mission-info">
              <text class="mission-title">{{ mission.title }}</text>
              <text class="mission-desc">{{ mission.description }}</text>
            </view>
            <view class="mission-percent">
              <text class="percent-value">{{ getMissionPercent(mission.id) }}%</text>
            </view>
          </view>

          <!-- 总进度条 -->
          <view class="total-progress">
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :style="{ width: getMissionPercent(mission.id) + '%' }"
              ></view>
            </view>
            <text class="progress-label">
              {{ getTotalProgress(mission.id) }}/{{ mission.targetValue }}
            </text>
          </view>

          <!-- 成员贡献 -->
          <view class="contributions">
            <text class="contrib-title">👨‍👩‍👧 家庭成员贡献</text>
            <view 
              v-for="childId in mission.participantIds" 
              :key="childId" 
              class="contrib-row"
            >
              <text class="contrib-name">{{ getChildName(childId) }}</text>
              <view class="contrib-bar-wrap">
                <view 
                  class="contrib-bar"
                  :style="{ width: getContribPercent(mission, childId) + '%' }"
                ></view>
              </view>
              <text class="contrib-value">{{ mission.progress[childId] || 0 }}</text>
              <button 
                class="contrib-btn" 
                size="mini"
                @tap="addContribution(mission.id, childId)"
              >+</button>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-icon">🎯</text>
        <text class="empty-text">暂无进行中的任务</text>
        <text class="empty-hint">创建一个家庭共同目标吧</text>
        <button class="create-btn" @tap="showCreateMission">创建任务</button>
      </view>
    </view>

    <!-- 已完成的任务 -->
    <view class="section" v-if="completedMissions.length > 0">
      <text class="section-title">🎉 已完成的任务</text>
      <view class="mission-list">
        <view 
          v-for="mission in completedMissions" 
          :key="mission.id" 
          class="mission-card completed"
        >
          <view class="mission-header">
            <text class="mission-icon">{{ getCategoryIcon(mission.category) }}</text>
            <view class="mission-info">
              <text class="mission-title">{{ mission.title }}</text>
            </view>
            <text class="completed-badge">✓ 完成</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 任务类别 -->
    <view class="section">
      <text class="section-title">📋 快速创建</text>
      <view class="category-grid">
        <view 
          v-for="cat in categories" 
          :key="cat.key" 
          class="category-card"
          @tap="selectCategoryAndCreate(cat)"
        >
          <text class="cat-icon">{{ cat.icon }}</text>
          <text class="cat-name">{{ cat.name }}</text>
        </view>
      </view>
    </view>

    <!-- 完成庆祝弹窗 -->
    <view class="celebration-overlay" v-if="showCelebration" @tap="closeCelebration">
      <view class="celebration-content">
        <text class="celebration-icon">🎉</text>
        <text class="celebration-title">任务完成！</text>
        <text class="celebration-text">{{ celebrationMission?.title }}</text>
        <text class="celebration-hint">感谢每一位家庭成员的付出</text>
        <button class="celebration-btn" @tap="closeCelebration">太棒了！</button>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useFamilyRitualStore } from '@/stores/familyRitualStore.js'
import { useFamilyStore } from '@/stores/familyStore.js'
import { MISSION_CATEGORIES } from '@/services/familyRitualService.js'

export default {
  setup() {
    const ritualStore = useFamilyRitualStore()
    const familyStore = useFamilyStore()
    const categories = MISSION_CATEGORIES
    const showCelebration = ref(false)
    const celebrationMission = ref(null)

    onMounted(() => {
      ritualStore.init()
      familyStore.init()
    })

    const activeMissions = computed(() => ritualStore.activeMissions)

    const completedMissions = computed(() => {
      return ritualStore.familyMissions.filter(m => m.status === 'completed')
    })

    const children = computed(() => familyStore.children)

    const getCategoryIcon = (category) => {
      const cat = categories.find(c => c.key === category)
      return cat ? cat.icon : '🎯'
    }

    const getChildName = (childId) => {
      const child = children.value.find(c => c.id === childId)
      return child ? child.name : '未知'
    }

    const getMissionPercent = (missionId) => {
      return ritualStore.getMissionProgressPercent(missionId)
    }

    const getTotalProgress = (missionId) => {
      const mission = ritualStore.familyMissions.find(m => m.id === missionId)
      if (!mission) return 0
      return Object.values(mission.progress).reduce((a, b) => a + b, 0)
    }

    const getContribPercent = (mission, childId) => {
      const value = mission.progress[childId] || 0
      return Math.min(100, Math.round((value / mission.targetValue) * 100))
    }

    const addContribution = (missionId, childId) => {
      ritualStore.contributeToMission(missionId, childId, 1)
      
      // 检查是否完成
      const mission = ritualStore.familyMissions.find(m => m.id === missionId)
      if (mission && mission.status === 'completed' && !mission.celebrationShown) {
        celebrationMission.value = mission
        showCelebration.value = true
        mission.celebrationShown = true
      }
    }

    const closeCelebration = () => {
      showCelebration.value = false
    }

    const showCreateMission = () => {
      uni.showModal({
        title: '创建家庭任务',
        editable: true,
        placeholderText: '任务名称（如：一起存钱去旅行）',
        success: (res) => {
          if (res.content?.trim()) {
            const participantIds = children.value.map(c => c.id)
            if (participantIds.length === 0) {
              uni.showToast({ title: '请先添加家庭成员', icon: 'none' })
              return
            }
            ritualStore.createMission(
              res.content.trim(),
              '家庭共同努力的目标',
              100, // default target
              participantIds,
              'general'
            )
            uni.showToast({ title: '任务创建成功', icon: 'success' })
          }
        }
      })
    }

    const selectCategoryAndCreate = (cat) => {
      uni.showModal({
        title: `创建${cat.name}`,
        editable: true,
        placeholderText: `输入目标（如：存够旅行基金）`,
        success: (res) => {
          if (res.content?.trim()) {
            const participantIds = children.value.map(c => c.id)
            ritualStore.createMission(
              res.content.trim(),
              `${cat.name}目标`,
              100,
              participantIds,
              cat.key
            )
            uni.showToast({ title: '任务创建成功', icon: 'success' })
          }
        }
      })
    }

    const goBack = () => {
      uni.navigateBack()
    }

    return {
      categories,
      showCelebration,
      celebrationMission,
      activeMissions,
      completedMissions,
      getCategoryIcon,
      getChildName,
      getMissionPercent,
      getTotalProgress,
      getContribPercent,
      addContribution,
      closeCelebration,
      showCreateMission,
      selectCategoryAndCreate,
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
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.nav-left .icon, .nav-right .icon {
  font-size: 24px;
  color: #333;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #333;
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

.mission-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mission-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.mission-card.completed {
  opacity: 0.7;
}

.mission-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.mission-icon {
  font-size: 32px;
  margin-right: 12px;
}

.mission-info {
  flex: 1;
}

.mission-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
}

.mission-desc {
  font-size: 12px;
  color: #999;
}

.mission-percent {
  text-align: right;
}

.percent-value {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
}

.total-progress {
  margin-bottom: 16px;
}

.progress-bar {
  height: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 5px;
  transition: width 0.3s;
}

.progress-label {
  font-size: 12px;
  color: #999;
}

.contributions {
  border-top: 1px solid #f5f5f5;
  padding-top: 12px;
}

.contrib-title {
  font-size: 12px;
  color: #666;
  display: block;
  margin-bottom: 8px;
}

.contrib-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.contrib-name {
  width: 50px;
  font-size: 12px;
  color: #666;
}

.contrib-bar-wrap {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  margin: 0 8px;
  overflow: hidden;
}

.contrib-bar {
  height: 100%;
  background: #667eea;
  border-radius: 3px;
}

.contrib-value {
  width: 30px;
  font-size: 11px;
  color: #999;
  text-align: right;
}

.contrib-btn {
  margin-left: 8px;
  background: #667eea;
  color: #fff;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 4px;
}

.completed-badge {
  font-size: 12px;
  color: #52c41a;
  background: #d9f7be;
  padding: 4px 8px;
  border-radius: 4px;
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
  display: block;
  margin-bottom: 16px;
}

.create-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.category-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.cat-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 4px;
}

.cat-name {
  font-size: 14px;
  color: #666;
}

.celebration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.celebration-content {
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 300px;
}

.celebration-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.celebration-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.celebration-text {
  font-size: 16px;
  color: #666;
  display: block;
  margin-bottom: 8px;
}

.celebration-hint {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 20px;
}

.celebration-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 12px 32px;
  font-size: 16px;
}
</style>
