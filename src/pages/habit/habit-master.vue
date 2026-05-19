<!-- V81 Habit Master 习惯养成系统 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">习惯大师</text>
      <view class="nav-right" @tap="showAddHabit">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- 统计概览卡片 -->
    <view class="stats-overview">
      <view class="stat-card main-stat">
        <text class="stat-icon">🎯</text>
        <view class="stat-info">
          <text class="stat-value">{{ habitStore.habitCompletionRate }}%</text>
          <text class="stat-label">今日完成率</text>
        </view>
      </view>
      <view class="stat-row">
        <view class="stat-card small">
          <text class="stat-icon">🔥</text>
          <text class="stat-value">{{ habitStore.statistics.longestStreak }}</text>
          <text class="stat-label">最长连续</text>
        </view>
        <view class="stat-card small">
          <text class="stat-icon">📝</text>
          <text class="stat-value">{{ habitStore.statistics.completedToday }}</text>
          <text class="stat-label">今日已打卡</text>
        </view>
        <view class="stat-card small">
          <text class="stat-icon">✨</text>
          <text class="stat-value">{{ habitStore.activeHabits.length }}</text>
          <text class="stat-label">进行中</text>
        </view>
      </view>
    </view>

    <!-- Tab切换 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @tap="activeTab = tab.key"
      >
        <text class="tab-icon">{{ tab.icon }}</text>
        <text class="tab-name">{{ tab.name }}</text>
      </view>
    </view>

    <!-- 习惯列表 -->
    <scroll-view scroll-y class="content-area" v-if="activeTab === 'habits'">
      <!-- 习惯列表 -->
      <view class="section" v-if="habitStore.activeHabits.length > 0">
        <view
          v-for="habit in habitStore.activeHabits"
          :key="habit.id"
          class="habit-card"
          :class="{ checked: isCheckedToday(habit.id) }"
        >
          <view class="habit-left">
            <view class="habit-icon" :style="{ backgroundColor: habit.color + '20' }">
              <text class="icon-emoji">{{ habit.icon }}</text>
            </view>
            <view class="habit-info">
              <text class="habit-name">{{ habit.name }}</text>
              <view class="habit-meta">
                <text class="habit-streak">🔥 {{ habit.currentStreak }}天</text>
                <text class="habit-category">{{ categoryLabels[habit.category] || habit.category }}</text>
              </view>
            </view>
          </view>
          <view class="habit-right">
            <view class="points-display" v-if="isCheckedToday(habit.id)">
              <text class="points-value">+{{ getHabitPoints(habit.id) }}</text>
            </view>
            <button
              v-else
              class="checkin-btn"
              :style="{ backgroundColor: habit.color }"
              @tap="handleCheckIn(habit.id)"
            >
              打卡
            </button>
            <view class="habit-actions">
              <text class="action-btn" @tap="showHabitDetail(habit)">⋯</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">🌱</text>
        <text class="empty-title">还没有习惯</text>
        <text class="empty-hint">点击右上角+添加你的第一个习惯</text>
        <button class="add-btn" @tap="showAddHabit">添加习惯</button>
      </view>

      <!-- 已暂停的习惯 -->
      <view class="section paused-section" v-if="pausedHabits.length > 0">
        <text class="section-title">已暂停</text>
        <view
          v-for="habit in pausedHabits"
          :key="habit.id"
          class="habit-card paused"
          @tap="showHabitDetail(habit)"
        >
          <view class="habit-left">
            <view class="habit-icon" :style="{ backgroundColor: habit.color + '20' }">
              <text class="icon-emoji">{{ habit.icon }}</text>
            </view>
            <view class="habit-info">
              <text class="habit-name">{{ habit.name }}</text>
              <text class="habit-streak">已暂停</text>
            </view>
          </view>
          <text class="resume-btn" @tap.stop="habitStore.resumeHabit(habit.id)">恢复</text>
        </view>
      </view>
    </scroll-view>

    <!-- 21天挑战 -->
    <scroll-view scroll-y class="content-area" v-if="activeTab === 'challenges'">
      <view class="section">
        <view class="section-header">
          <text class="section-title">进行中的挑战</text>
          <text class="section-count">{{ habitStore.inProgressChallenges.length }}</text>
        </view>

        <view
          v-for="challenge in habitStore.inProgressChallenges"
          :key="challenge.id"
          class="challenge-card"
        >
          <view class="challenge-header">
            <view class="challenge-icon" :style="{ backgroundColor: challenge.habitColor + '20' }">
              <text class="icon-emoji">{{ challenge.habitIcon }}</text>
            </view>
            <view class="challenge-info">
              <text class="challenge-name">{{ challenge.habitName }}</text>
              <text class="challenge-days">第 {{ challenge.currentDay }}/{{ challenge.targetDays }} 天</text>
            </view>
          </view>

          <view class="challenge-progress">
            <view class="progress-bar">
              <view
                class="progress-fill"
                :style="{
                  width: (challenge.currentDay / challenge.targetDays * 100) + '%',
                  backgroundColor: challenge.habitColor
                }"
              ></view>
            </view>
            <view class="milestones">
              <view
                v-for="milestone in [7, 14, 21]"
                :key="milestone"
                class="milestone"
                :class="{ reached: challenge.milestoneReached.includes(milestone) }"
              >
                <text class="milestone-day">{{ milestone }}</text>
                <text class="milestone-label">天</text>
              </view>
            </view>
          </view>

          <view class="challenge-actions" v-if="!challenge.completedDays.includes(todayString)">
            <button
              class="challenge-checkin-btn"
              :style="{ backgroundColor: challenge.habitColor }"
              @tap="handleChallengeCheckIn(challenge)"
            >
              今日打卡
            </button>
          </view>
          <view class="challenge-completed" v-else>
            <text class="completed-badge">✓ 今日已完成</text>
          </view>
        </view>

        <!-- 无进行中挑战 -->
        <view class="empty-state small" v-if="habitStore.inProgressChallenges.length === 0">
          <text class="empty-icon">🏆</text>
          <text class="empty-title">没有进行中的挑战</text>
          <text class="empty-hint">在习惯详情页发起21天挑战</text>
        </view>
      </view>

      <!-- 已完成的挑战 -->
      <view class="section" v-if="habitStore.completedChallenges.length > 0">
        <view class="section-header">
          <text class="section-title">已完成的挑战</text>
          <text class="section-count">{{ habitStore.completedChallenges.length }}</text>
        </view>

        <view
          v-for="challenge in habitStore.completedChallenges"
          :key="challenge.id"
          class="challenge-card completed"
        >
          <view class="challenge-header">
            <view class="challenge-icon completed-icon">
              <text class="icon-emoji">🏆</text>
            </view>
            <view class="challenge-info">
              <text class="challenge-name">{{ challenge.habitName }}</text>
              <text class="challenge-badge" v-if="challenge.certificateEarned">获得证书</text>
            </view>
          </view>
          <text class="challenge-date">完成于 {{ formatDate(challenge.completedAt) }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 习惯链 -->
    <scroll-view scroll-y class="content-area" v-if="activeTab === 'chains'">
      <view class="section">
        <view class="section-header">
          <text class="section-title">习惯链</text>
          <text class="add-chain-btn" @tap="showAddChain">+ 添加习惯链</text>
        </view>

        <view
          v-for="chain in habitStore.habitChains"
          :key="chain.id"
          class="chain-card"
        >
          <view class="chain-header">
            <text class="chain-name">{{ chain.name }}</text>
            <text class="chain-status" :class="chain.status">{{ chain.status === 'active' ? '进行中' : '已停用' }}</text>
          </view>
          <text class="chain-desc" v-if="chain.description">{{ chain.description }}</text>

          <view class="chain-relation">
            <view class="chain-habit upstream">
              <text class="chain-habit-name">{{ getHabitName(chain.upstreamHabitId) }}</text>
              <text class="chain-label">上游</text>
            </view>
            <view class="chain-arrow">→</view>
            <view class="chain-habit downstream">
              <text class="chain-habit-name">{{ getHabitName(chain.downstreamHabitId) }}</text>
              <text class="chain-label">下游</text>
            </view>
          </view>

          <view class="chain-reward">
            <text class="reward-label">完成上游后，下游习惯额外获得</text>
            <text class="reward-value">+{{ chain.bonusPoints }}分</text>
          </view>

          <view class="chain-actions">
            <text class="chain-delete" @tap="deleteChain(chain.id)">删除</text>
          </view>
        </view>

        <!-- 无习惯链 -->
        <view class="empty-state small" v-if="habitStore.habitChains.length === 0">
          <text class="empty-icon">🔗</text>
          <text class="empty-title">还没有习惯链</text>
          <text class="empty-hint">习惯链可以绑定上游/下游习惯，完成上游后下游获得额外奖励</text>
          <button class="add-btn" @tap="showAddChain">添加习惯链</button>
        </view>
      </view>
    </scroll-view>

    <!-- 添加习惯弹窗 -->
    <view v-if="showHabitModal" class="modal-overlay" @tap="showHabitModal = false">
      <view class="modal-content habit-modal" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingHabit ? '编辑习惯' : '添加习惯' }}</text>
          <text class="modal-close" @tap="showHabitModal = false">×</text>
        </view>

        <view class="form-item">
          <text class="form-label">习惯名称</text>
          <input class="form-input" v-model="habitForm.name" placeholder="如：每天阅读30分钟" />
        </view>

        <view class="form-item">
          <text class="form-label">描述（可选）</text>
          <input class="form-input" v-model="habitForm.description" placeholder="简短描述这个习惯" />
        </view>

        <view class="form-item">
          <text class="form-label">图标</text>
          <view class="icon-picker">
            <text
              v-for="icon in iconOptions"
              :key="icon"
              class="icon-option"
              :class="{ selected: habitForm.icon === icon }"
              @tap="habitForm.icon = icon"
            >{{ icon }}</text>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">分类</text>
          <view class="category-picker">
            <view
              v-for="(label, key) in categoryLabels"
              :key="key"
              class="category-option"
              :class="{ selected: habitForm.category === key }"
              @tap="habitForm.category = key"
            >
              <text>{{ label }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">颜色</text>
          <view class="color-picker">
            <view
              v-for="color in colorOptions"
              :key="color"
              class="color-option"
              :class="{ selected: habitForm.color === color }"
              :style="{ backgroundColor: color }"
              @tap="habitForm.color = color"
            ></view>
          </view>
        </view>

        <view class="form-actions">
          <button class="btn-cancel" @tap="showHabitModal = false">取消</button>
          <button class="btn-confirm" @tap="saveHabit">{{ editingHabit ? '保存' : '添加' }}</button>
        </view>
      </view>
    </view>

    <!-- 添加习惯链弹窗 -->
    <view v-if="showChainModal" class="modal-overlay" @tap="showChainModal = false">
      <view class="modal-content chain-modal" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加习惯链</text>
          <text class="modal-close" @tap="showChainModal = false">×</text>
        </view>

        <view class="form-item">
          <text class="form-label">习惯链名称</text>
          <input class="form-input" v-model="chainForm.name" placeholder="如：阅读-写作联动" />
        </view>

        <view class="form-item">
          <text class="form-label">上游习惯（先完成）</text>
          <picker
            :value="upstreamIndex"
            :range="habitOptions"
            range-key="name"
            @change="upstreamIndex = $event.detail.value"
          >
            <view class="picker-display">
              <text>{{ chainForm.upstreamHabitId ? getHabitName(chainForm.upstreamHabitId) : '请选择' }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">下游习惯（后完成）</text>
          <picker
            :value="downstreamIndex"
            :range="habitOptions"
            range-key="name"
            @change="downstreamIndex = $event.detail.value"
          >
            <view class="picker-display">
              <text>{{ chainForm.downstreamHabitId ? getHabitName(chainForm.downstreamHabitId) : '请选择' }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">额外奖励积分</text>
          <input class="form-input" type="number" v-model="chainForm.bonusPoints" placeholder="默认5分" />
        </view>

        <view class="form-actions">
          <button class="btn-cancel" @tap="showChainModal = false">取消</button>
          <button class="btn-confirm" @tap="saveChain">添加</button>
        </view>
      </view>
    </view>

    <!-- 打卡结果弹窗 -->
    <view v-if="showResultModal" class="modal-overlay" @tap="showResultModal = false">
      <view class="modal-content result-modal" @tap.stop>
        <text class="result-icon">🎉</text>
        <text class="result-title">打卡成功！</text>
        <view class="result-streak" v-if="resultData.streak > 0">
          <text class="streak-fire">🔥</text>
          <text class="streak-count">{{ resultData.streak }}天连续</text>
        </view>
        <view class="result-points">
          <text class="points-earned">+{{ resultData.points }}</text>
          <text class="points-label">积分</text>
        </view>
        <view class="result-chain" v-if="resultData.chainBonus && resultData.chainBonus.points > 0">
          <text class="chain-label">习惯链加成</text>
          <text class="chain-points">+{{ resultData.chainBonus.points }}</text>
          <text class="chain-trigger">（来自：{{ resultData.chainBonus.triggeredBy.join(', ') }}）</text>
        </view>
        <button class="result-close-btn" @tap="showResultModal = false">好的</button>
      </view>
    </view>

    <!-- 习惯详情弹窗 -->
    <view v-if="showDetailModal" class="modal-overlay" @tap="showDetailModal = false">
      <view class="modal-content detail-modal" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ currentDetailHabit.name }}</text>
          <text class="modal-close" @tap="showDetailModal = false">×</text>
        </view>

        <view class="detail-stats" v-if="habitStats">
          <view class="detail-stat">
            <text class="detail-stat-value">{{ habitStats.currentStreak }}</text>
            <text class="detail-stat-label">当前连续</text>
          </view>
          <view class="detail-stat">
            <text class="detail-stat-value">{{ habitStats.longestStreak }}</text>
            <text class="detail-stat-label">最长连续</text>
          </view>
          <view class="detail-stat">
            <text class="detail-stat-value">{{ habitStats.totalCheckIns }}</text>
            <text class="detail-stat-label">总打卡</text>
          </view>
          <view class="detail-stat">
            <text class="detail-stat-value">{{ habitStats.completionRate }}%</text>
            <text class="detail-stat-label">完成率</text>
          </view>
        </view>

        <view class="detail-actions">
          <button
            class="btn-start-challenge"
            v-if="!hasActiveChallenge(currentDetailHabit.id)"
            @tap="startChallenge(currentDetailHabit.id)"
          >
            发起21天挑战
          </button>
          <button class="btn-pause" v-else @tap="pauseHabit(currentDetailHabit.id)">
            暂停习惯
          </button>
          <button class="btn-delete" @tap="deleteHabit(currentDetailHabit.id)">
            删除习惯
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useHabitStore } from '@/stores/habitStore'

export default {
  setup() {
    const habitStore = useHabitStore()

    const activeTab = ref('habits')
    const showHabitModal = ref(false)
    const showChainModal = ref(false)
    const showResultModal = ref(false)
    const showDetailModal = ref(false)
    const editingHabit = ref(null)
    const currentDetailHabit = ref(null)
    const habitStats = ref(null)
    const upstreamIndex = ref(-1)
    const downstreamIndex = ref(-1)

    const tabs = [
      { key: 'habits', name: '习惯', icon: '✨' },
      { key: 'challenges', name: '挑战', icon: '🏆' },
      { key: 'chains', name: '习惯链', icon: '🔗' }
    ]

    const categoryLabels = {
      general: '通用',
      health: '健康',
      learning: '学习',
      life: '生活',
      social: '社交'
    }

    const iconOptions = ['✨', '📚', '🏃', '💪', '🎨', '🎵', '💤', '🥗', '💧', '🧘', '📝', '🌱']

    const colorOptions = ['#FF6B35', '#F7931E', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']

    const habitForm = ref({
      name: '',
      description: '',
      icon: '✨',
      color: '#FF6B35',
      category: 'general'
    })

    const chainForm = ref({
      name: '',
      upstreamHabitId: '',
      downstreamHabitId: '',
      bonusPoints: 5
    })

    const resultData = ref({
      points: 0,
      streak: 0,
      chainBonus: { points: 0, triggeredBy: [] }
    })

    const todayString = computed(() => habitStore.getTodayString())

    const pausedHabits = computed(() => {
      return habitStore.habits.filter(h => h.status === 'paused')
    })

    const habitOptions = computed(() => {
      return habitStore.activeHabits.map(h => ({ id: h.id, name: h.name }))
    })

    const isCheckedToday = (habitId) => {
      const records = habitStore.habitRecords[habitId] || []
      return records.some(r => r.date === todayString.value)
    }

    const getHabitPoints = (habitId) => {
      const records = habitStore.habitRecords[habitId] || []
      const todayRecords = records.filter(r => r.date === todayString.value)
      return todayRecords.reduce((sum, r) => sum + r.points + (r.streakBonus || 0) + (r.chainBonus || 0), 0)
    }

    const getHabitName = (habitId) => {
      const habit = habitStore.habits.find(h => h.id === habitId)
      return habit ? habit.name : '未知习惯'
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    const hasActiveChallenge = (habitId) => {
      return habitStore.inProgressChallenges.some(c => c.habitId === habitId)
    }

    const handleCheckIn = (habitId) => {
      const result = habitStore.checkIn(habitId)
      if (result.success) {
        resultData.value = {
          points: result.points,
          streak: result.streak,
          chainBonus: result.chainBonus
        }
        showResultModal.value = true
      } else {
        uni.showToast({ title: result.message, icon: 'none' })
      }
    }

    const handleChallengeCheckIn = (challenge) => {
      const result = habitStore.updateChallengeProgress(challenge.id)
      if (result.success) {
        if (challenge.currentDay + 1 >= challenge.targetDays) {
          uni.showToast({ title: '🏆 挑战完成！获得证书！', icon: 'success' })
        } else {
          uni.showToast({ title: '打卡成功！', icon: 'success' })
        }
      } else {
        uni.showToast({ title: result.message, icon: 'none' })
      }
    }

    const showAddHabit = () => {
      editingHabit.value = null
      habitForm.value = {
        name: '',
        description: '',
        icon: '✨',
        color: '#FF6B35',
        category: 'general'
      }
      showHabitModal.value = true
    }

    const showHabitDetail = (habit) => {
      currentDetailHabit.value = habit
      habitStats.value = habitStore.getHabitStats(habit.id)
      showDetailModal.value = true
    }

    const saveHabit = () => {
      if (!habitForm.value.name.trim()) {
        uni.showToast({ title: '请输入习惯名称', icon: 'none' })
        return
      }

      if (editingHabit.value) {
        habitStore.updateHabit(editingHabit.value.id, habitForm.value)
      } else {
        habitStore.createHabit(habitForm.value)
      }
      showHabitModal.value = false
    }

    const showAddChain = () => {
      chainForm.value = {
        name: '',
        upstreamHabitId: '',
        downstreamHabitId: '',
        bonusPoints: 5
      }
      upstreamIndex.value = -1
      downstreamIndex.value = -1
      showChainModal.value = true
    }

    const saveChain = () => {
      if (!chainForm.value.name.trim()) {
        uni.showToast({ title: '请输入习惯链名称', icon: 'none' })
        return
      }

      if (habitOptions.value.length < 2) {
        uni.showToast({ title: '需要至少2个习惯才能创建习惯链', icon: 'none' })
        return
      }

      if (upstreamIndex.value >= 0) {
        chainForm.value.upstreamHabitId = habitOptions.value[upstreamIndex.value].id
      }
      if (downstreamIndex.value >= 0) {
        chainForm.value.downstreamHabitId = habitOptions.value[downstreamIndex.value].id
      }

      if (!chainForm.value.upstreamHabitId || !chainForm.value.downstreamHabitId) {
        uni.showToast({ title: '请选择上游和下游习惯', icon: 'none' })
        return
      }

      if (chainForm.value.upstreamHabitId === chainForm.value.downstreamHabitId) {
        uni.showToast({ title: '上游和下游习惯不能相同', icon: 'none' })
        return
      }

      habitStore.createHabitChain(chainForm.value)
      showChainModal.value = false
    }

    const deleteChain = (chainId) => {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条习惯链吗？',
        success: (res) => {
          if (res.confirm) {
            habitStore.deleteHabitChain(chainId)
          }
        }
      })
    }

    const startChallenge = (habitId) => {
      const result = habitStore.startChallenge(habitId)
      if (result.success) {
        showDetailModal.value = false
        activeTab.value = 'challenges'
        uni.showToast({ title: '21天挑战已发起！', icon: 'success' })
      } else {
        uni.showToast({ title: result.message, icon: 'none' })
      }
    }

    const pauseHabit = (habitId) => {
      habitStore.pauseHabit(habitId)
      showDetailModal.value = false
    }

    const deleteHabit = (habitId) => {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个习惯吗？相关打卡记录也将被删除。',
        success: (res) => {
          if (res.confirm) {
            habitStore.deleteHabit(habitId)
            showDetailModal.value = false
          }
        }
      })
    }

    const goBack = () => {
      uni.navigateBack()
    }

    onMounted(() => {
      habitStore.init()
    })

    return {
      habitStore,
      activeTab,
      tabs,
      showHabitModal,
      showChainModal,
      showResultModal,
      showDetailModal,
      editingHabit,
      currentDetailHabit,
      habitStats,
      habitForm,
      chainForm,
      resultData,
      todayString,
      pausedHabits,
      habitOptions,
      categoryLabels,
      iconOptions,
      colorOptions,
      upstreamIndex,
      downstreamIndex,
      isCheckedToday,
      getHabitPoints,
      getHabitName,
      formatDate,
      hasActiveChallenge,
      handleCheckIn,
      handleChallengeCheckIn,
      showAddHabit,
      showHabitDetail,
      saveHabit,
      showAddChain,
      saveChain,
      deleteChain,
      startChallenge,
      pauseHabit,
      deleteHabit,
      goBack
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  height: 88rpx;
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  padding: 90rpx 40rpx 60rpx;
  position: relative;
}

.nav-left, .nav-right {
  width: 60rpx;
}

.icon {
  color: white;
  font-size: 48rpx;
  font-weight: bold;
}

.nav-title {
  flex: 1;
  text-align: center;
  color: white;
  font-size: 36rpx;
  font-weight: bold;
}

.stats-overview {
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  padding: 20rpx 30rpx 40rpx;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.main-stat {
  margin-bottom: 20rpx;
  justify-content: center;
}

.stat-icon {
  font-size: 48rpx;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
  margin-top: 4rpx;
}

.stat-row {
  display: flex;
  gap: 16rpx;
}

.stat-card.small {
  flex: 1;
  flex-direction: column;
  text-align: center;
  padding: 16rpx;
}

.stat-card.small .stat-icon {
  font-size: 32rpx;
}

.stat-card.small .stat-value {
  font-size: 32rpx;
  margin-top: 8rpx;
}

.stat-card.small .stat-label {
  font-size: 20rpx;
}

.tab-bar {
  display: flex;
  background: white;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 24rpx 0;
  position: relative;
}

.tab-item.active {
  color: #FF6B35;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: #FF6B35;
  border-radius: 2rpx;
}

.tab-icon {
  font-size: 32rpx;
}

.tab-name {
  font-size: 28rpx;
  font-weight: 500;
}

.content-area {
  height: calc(100vh - 400rpx);
  padding: 20rpx 30rpx;
}

.section {
  margin-bottom: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-count {
  font-size: 24rpx;
  color: #999;
  background: #f0f0f0;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.habit-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.habit-card.checked {
  opacity: 0.7;
  background: #fafafa;
}

.habit-card.paused {
  opacity: 0.6;
}

.habit-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.habit-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-emoji {
  font-size: 40rpx;
}

.habit-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.habit-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.habit-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.habit-streak {
  font-size: 24rpx;
  color: #FF6B35;
}

.habit-category {
  font-size: 22rpx;
  color: #999;
  background: #f5f5f5;
  padding: 2rpx 12rpx;
  border-radius: 10rpx;
}

.habit-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.points-display {
  background: #E8F5E9;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
}

.points-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #4CAF50;
}

.checkin-btn {
  padding: 16rpx 32rpx;
  border-radius: 24rpx;
  color: white;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
}

.habit-actions {
  padding: 8rpx;
}

.action-btn {
  font-size: 36rpx;
  color: #999;
  padding: 8rpx 16rpx;
}

.resume-btn {
  font-size: 26rpx;
  color: #FF6B35;
  padding: 8rpx 16rpx;
}

.empty-state {
  text-align: center;
  padding: 80rpx 40rpx;
  background: white;
  border-radius: 16rpx;
}

.empty-state.small {
  padding: 40rpx 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
  display: block;
  margin-bottom: 30rpx;
}

.add-btn {
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  color: white;
  border: none;
  padding: 20rpx 40rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
}

.paused-section {
  margin-top: 30rpx;
}

.paused-section .section-title {
  font-size: 28rpx;
  color: #999;
}

/* Challenge styles */
.challenge-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.challenge-card.completed {
  opacity: 0.7;
}

.challenge-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.challenge-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.completed-icon {
  background: #FFF3E0;
}

.challenge-info {
  flex: 1;
}

.challenge-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.challenge-days {
  font-size: 24rpx;
  color: #FF6B35;
  margin-top: 4rpx;
}

.challenge-badge {
  font-size: 22rpx;
  color: #4CAF50;
  background: #E8F5E9;
  padding: 2rpx 12rpx;
  border-radius: 10rpx;
  margin-left: 8rpx;
}

.challenge-progress {
  margin-bottom: 20rpx;
}

.progress-bar {
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.progress-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.milestones {
  display: flex;
  justify-content: space-between;
  padding: 0 20rpx;
}

.milestone {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.4;
}

.milestone.reached {
  opacity: 1;
}

.milestone-day {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.milestone.reached .milestone-day {
  color: #FF6B35;
}

.milestone-label {
  font-size: 20rpx;
  color: #999;
}

.challenge-actions {
  display: flex;
  justify-content: center;
}

.challenge-checkin-btn {
  padding: 16rpx 48rpx;
  border-radius: 24rpx;
  color: white;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
}

.challenge-completed {
  text-align: center;
}

.completed-badge {
  font-size: 26rpx;
  color: #4CAF50;
  font-weight: bold;
}

.challenge-date {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  display: block;
  margin-top: 8rpx;
}

/* Chain styles */
.chain-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.chain-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.chain-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.chain-status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
}

.chain-status.active {
  color: #4CAF50;
  background: #E8F5E9;
}

.chain-status.inactive {
  color: #999;
  background: #f5f5f5;
}

.chain-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
}

.chain-relation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 16rpx;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

.chain-habit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.chain-habit-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.chain-label {
  font-size: 22rpx;
  color: #999;
}

.chain-arrow {
  font-size: 36rpx;
  color: #FF6B35;
}

.chain-reward {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.reward-label {
  font-size: 24rpx;
  color: #666;
}

.reward-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #FF6B35;
}

.chain-actions {
  text-align: right;
}

.chain-delete {
  font-size: 24rpx;
  color: #F44336;
}

.add-chain-btn {
  font-size: 26rpx;
  color: #FF6B35;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.habit-modal, .chain-modal {
  padding-bottom: 60rpx;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 48rpx;
  color: #999;
  padding: 0 20rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.icon-option {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
}

.icon-option.selected {
  background: #FFE5DC;
  border: 2rpx solid #FF6B35;
}

.category-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.category-option {
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border-radius: 20rpx;
  font-size: 26rpx;
}

.category-option.selected {
  background: #FFE5DC;
  color: #FF6B35;
}

.color-picker {
  display: flex;
  gap: 16rpx;
}

.color-option {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
}

.color-option.selected {
  border: 4rpx solid #333;
  box-shadow: 0 0 0 4rpx white, 0 0 0 6rpx currentColor;
}

.picker-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.picker-arrow {
  color: #999;
  font-size: 24rpx;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-confirm {
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  color: white;
}

/* Result modal */
.result-modal {
  text-align: center;
  padding: 60rpx 40rpx;
}

.result-icon {
  font-size: 100rpx;
  display: block;
  margin-bottom: 20rpx;
}

.result-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.result-streak {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-bottom: 20rpx;
}

.streak-fire {
  font-size: 36rpx;
}

.streak-count {
  font-size: 28rpx;
  color: #FF6B35;
  font-weight: bold;
}

.result-points {
  margin-bottom: 20rpx;
}

.points-earned {
  font-size: 56rpx;
  font-weight: bold;
  color: #FF6B35;
}

.points-label {
  font-size: 28rpx;
  color: #666;
  margin-left: 8rpx;
}

.result-chain {
  background: #FFF8E1;
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
}

.chain-label {
  font-size: 24rpx;
  color: #666;
}

.chain-points {
  font-size: 28rpx;
  font-weight: bold;
  color: #FF9800;
}

.chain-trigger {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-top: 4rpx;
}

.result-close-btn {
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  color: white;
  border: none;
  padding: 24rpx 60rpx;
  border-radius: 30rpx;
  font-size: 30rpx;
}

/* Detail modal */
.detail-modal {
  padding: 40rpx;
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.detail-stat {
  background: #f9f9f9;
  padding: 24rpx;
  border-radius: 16rpx;
  text-align: center;
}

.detail-stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #FF6B35;
  display: block;
}

.detail-stat-label {
  font-size: 24rpx;
  color: #666;
  margin-top: 4rpx;
}

.detail-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.btn-start-challenge {
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  color: white;
  border: none;
  padding: 24rpx;
  border-radius: 30rpx;
  font-size: 30rpx;
}

.btn-pause {
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 24rpx;
  border-radius: 30rpx;
  font-size: 30rpx;
}

.btn-delete {
  background: white;
  color: #F44336;
  border: 2rpx solid #F44336;
  padding: 24rpx;
  border-radius: 30rpx;
  font-size: 30rpx;
}
</style>
