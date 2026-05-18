<!-- 每周挑战页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">每周挑战</text>
      <view class="nav-right" @tap="showCreateChallenge">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- 进行中的挑战 -->
    <view class="section">
      <text class="section-title">🏆 进行中的挑战</text>
      <view v-if="activeChallenges.length > 0" class="challenge-list">
        <view 
          v-for="challenge in activeChallenges" 
          :key="challenge.id" 
          class="challenge-card"
        >
          <view class="challenge-header">
            <text class="challenge-icon">{{ getCategoryIcon(challenge.category) }}</text>
            <view class="challenge-info">
              <text class="challenge-title">{{ challenge.title }}</text>
              <text class="challenge-meta">
                {{ getRemainingDays(challenge.endTime) }}天后结束
                <text v-if="challenge.multiplierActive" class="multiplier-tag">🔥全员倍增中</text>
              </text>
            </view>
          </view>

          <!-- 进度可视化 -->
          <view class="progress-section">
            <view 
              v-for="childId in challenge.participantIds" 
              :key="childId" 
              class="member-progress"
            >
              <text class="member-name">{{ getChildName(childId) }}</text>
              <view class="progress-bar">
                <view 
                  class="progress-fill" 
                  :style="{ width: getProgressPercent(challenge.id, childId) + '%' }"
                ></view>
              </view>
              <text class="progress-text">
                {{ challenge.progress[childId] || 0 }}/{{ challenge.targetValue }}
              </text>
            </view>
          </view>

          <view class="challenge-actions">
            <button class="join-btn" @tap="addProgress(challenge.id)">+1 进度</button>
          </view>
        </view>
      </view>
      <view v-else class="empty-state">
        <text class="empty-icon">🏆</text>
        <text class="empty-text">暂无进行中的挑战</text>
        <button class="create-btn" @tap="showCreateChallenge">创建挑战</button>
      </view>
    </view>

    <!-- 已完成的挑战 -->
    <view class="section" v-if="finishedChallenges.length > 0">
      <text class="section-title">✅ 已完成挑战</text>
      <view class="challenge-list">
        <view 
          v-for="challenge in finishedChallenges" 
          :key="challenge.id" 
          class="challenge-card finished"
        >
          <view class="challenge-header">
            <text class="challenge-icon">{{ getCategoryIcon(challenge.category) }}</text>
            <view class="challenge-info">
              <text class="challenge-title">{{ challenge.title }}</text>
              <text class="challenge-meta">已完成</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 挑战类别 -->
    <view class="section">
      <text class="section-title">📋 创建挑战</text>
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
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useFamilyRitualStore } from '@/stores/familyRitualStore.js'
import { useFamilyStore } from '@/stores/familyStore.js'
import { useBabyStore } from '@/stores/babyStore.js'
import { CHALLENGE_CATEGORIES } from '@/services/familyRitualService.js'

export default {
  setup() {
    const ritualStore = useFamilyRitualStore()
    const familyStore = useFamilyStore()
    const babyStore = useBabyStore()
    const categories = CHALLENGE_CATEGORIES

    onMounted(() => {
      ritualStore.init()
      familyStore.init()
      babyStore.loadBabies()
    })

    const activeChallenges = computed(() => ritualStore.activeChallenges)
    
    const finishedChallenges = computed(() => {
      return ritualStore.weeklyChallenges.filter(c => c.status === 'finished')
    })

    const children = computed(() => familyStore.children)

    const getCategoryIcon = (category) => {
      const cat = categories.find(c => c.key === category)
      return cat ? cat.icon : '🌟'
    }

    const getChildName = (childId) => {
      const child = children.value.find(c => c.id === childId)
      return child ? child.name : '未知'
    }

    const getRemainingDays = (endTime) => {
      const end = new Date(endTime)
      const now = new Date()
      const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
      return Math.max(0, diff)
    }

    const getProgressPercent = (challengeId, childId) => {
      return ritualStore.getChallengeProgressPercent(challengeId, childId)
    }

    const addProgress = (challengeId) => {
      const currentBabyId = babyStore.currentBabyId
      if (!currentBabyId) {
        uni.showToast({ title: '请先选择宝宝', icon: 'none' })
        return
      }
      ritualStore.updateChallengeProgress(challengeId, currentBabyId, 1)
      uni.showToast({ title: '进度+1', icon: 'success' })
    }

    const showCreateChallenge = () => {
      uni.showModal({
        title: '创建每周挑战',
        editable: true,
        placeholderText: '挑战名称（如：每天运动30分钟）',
        success: (res) => {
          if (res.content && res.content.trim()) {
            const participantIds = children.value.map(c => c.id)
            if (participantIds.length === 0) {
              uni.showToast({ title: '请先添加家庭成员', icon: 'none' })
              return
            }
            ritualStore.createChallenge(
              res.content.trim(),
              'other',
              7, // target value
              participantIds,
              7 // 7 days
            )
            uni.showToast({ title: '挑战创建成功', icon: 'success' })
          }
        }
      })
    }

    const selectCategoryAndCreate = (cat) => {
      uni.showModal({
        title: `创建${cat.name}`,
        editable: true,
        placeholderText: `输入挑战目标（如：${cat.examples[0]}）`,
        success: (res) => {
          if (res.content && res.content.trim()) {
            const participantIds = children.value.map(c => c.id)
            ritualStore.createChallenge(
              res.content.trim(),
              cat.key,
              7,
              participantIds,
              7
            )
            uni.showToast({ title: '挑战创建成功', icon: 'success' })
          }
        }
      })
    }

    const goBack = () => {
      uni.navigateBack()
    }

    return {
      categories,
      activeChallenges,
      finishedChallenges,
      getCategoryIcon,
      getChildName,
      getRemainingDays,
      getProgressPercent,
      addProgress,
      showCreateChallenge,
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
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
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

.challenge-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.challenge-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.challenge-card.finished {
  opacity: 0.7;
}

.challenge-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.challenge-icon {
  font-size: 36px;
  margin-right: 12px;
}

.challenge-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
}

.challenge-meta {
  font-size: 12px;
  color: #999;
}

.multiplier-tag {
  color: #f5222d;
  margin-left: 8px;
}

.progress-section {
  margin-bottom: 12px;
}

.member-progress {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.member-name {
  width: 60px;
  font-size: 12px;
  color: #666;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 0 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fa709a, #fee140);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-text {
  width: 50px;
  font-size: 11px;
  color: #999;
  text-align: right;
}

.challenge-actions {
  display: flex;
  justify-content: flex-end;
}

.join-btn {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 14px;
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
  margin-bottom: 16px;
}

.create-btn {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
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
</style>
