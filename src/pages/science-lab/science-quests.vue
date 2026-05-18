<template>
  <view class="science-quests-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">🔬 科学探索</text>
      <view class="header-stats">
        <view class="stat-item">
          <text class="stat-value">{{ store.sciencePoints.totalPoints }}</text>
          <text class="stat-label">总积分</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">🔥 {{ store.sciencePoints.streak?.current || 0 }}</text>
          <text class="stat-label">连续天数</text>
        </view>
      </view>
    </view>

    <!-- 进度概览 -->
    <view class="progress-overview">
      <view class="progress-card">
        <view class="progress-info">
          <text class="progress-title">本周进度</text>
          <text class="progress-value">{{ store.sciencePoints.weeklyProgress }} / {{ store.sciencePoints.weeklyGoal }}</text>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: weeklyProgressPercent + '%' }"></view>
        </view>
      </view>
    </view>

    <!-- 任务列表 -->
    <view class="quests-section">
      <view class="section-header">
        <text class="section-title">探索任务</text>
        <text class="section-count">{{ activeQuests.length }} 个进行中</text>
      </view>

      <view v-if="activeQuests.length === 0" class="empty-state">
        <text class="empty-icon">🎯</text>
        <text class="empty-text">暂无进行中的任务</text>
        <text class="empty-hint">完成所有任务，解锁成就</text>
      </view>

      <view class="quest-list">
        <view 
          class="quest-card"
          v-for="quest in store.scienceQuests"
          :key="quest.id"
          @click="selectQuest(quest)"
        >
          <view class="quest-header">
            <view class="quest-icon" :style="{ backgroundColor: getQuestColor(quest.type) }">
              <text>{{ getQuestIcon(quest.type) }}</text>
            </view>
            <view class="quest-info">
              <text class="quest-title">{{ quest.title }}</text>
              <view class="quest-meta">
                <text class="quest-type">{{ getTypeName(quest.type) }}</text>
                <text class="quest-difficulty" :class="quest.difficulty">{{ getDifficultyText(quest.difficulty) }}</text>
              </view>
            </view>
            <view class="quest-points">
              <text class="points-value">+{{ quest.points }}</text>
              <text class="points-label">积分</text>
            </view>
          </view>
          
          <text class="quest-desc">{{ quest.description }}</text>
          
          <view class="quest-progress">
            <view class="progress-bar-small">
              <view class="progress-fill" :style="{ width: quest.progress + '%' }"></view>
            </view>
            <text class="progress-text">{{ quest.progress }}%</text>
          </view>
          
          <view class="quest-tasks">
            <view 
              class="task-item"
              :class="{ completed: task.completed }"
              v-for="task in quest.tasks"
              :key="task.id"
              @click.stop="toggleTask(quest, task)"
            >
              <text class="task-check">{{ task.completed ? '✓' : '○' }}</text>
              <text class="task-title">{{ task.title }}</text>
            </view>
          </view>
          
          <view class="quest-footer">
            <text class="quest-reward">奖励: {{ quest.rewards?.points }}积分</text>
            <view v-if="quest.isCompleted" class="quest-completed-badge">
              <text>✓ 已完成</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 成就展示 -->
    <view class="achievements-section">
      <view class="section-header">
        <text class="section-title">🏆 科学成就</text>
      </view>
      <view class="achievement-list">
        <view 
          class="achievement-item"
          :class="{ unlocked: ach.isUnlocked }"
          v-for="ach in store.achievements"
          :key="ach.id"
        >
          <text class="achievement-icon">{{ ach.icon }}</text>
          <text class="achievement-name">{{ ach.name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useScienceLabStore } from '@/stores/scienceLabStore.js'

export default {
  computed: {
    store() {
      return useScienceLabStore()
    },
    activeQuests() {
      return this.store.scienceQuests.filter(q => !q.isCompleted)
    },
    weeklyProgressPercent() {
      const goal = this.store.sciencePoints.weeklyGoal || 100
      const progress = this.store.sciencePoints.weeklyProgress || 0
      return Math.min(100, (progress / goal) * 100)
    }
  },
  onLoad() {
    this.store.init()
  },
  methods: {
    selectQuest(quest) {
      this.store.selectQuest(quest.id)
    },
    toggleTask(quest, task) {
      if (task.completed) return
      this.store.selectQuest(quest.id)
      this.store.updateQuestTask(task.id)
    },
    getQuestIcon(type) {
      const icons = { chemistry: '🧪', physics: '⚡', biology: '🔬', earth: '🌍', astronomy: '🚀' }
      return icons[type] || '🔬'
    },
    getQuestColor(type) {
      const colors = { chemistry: '#9B59B6', physics: '#3498DB', biology: '#27AE60', earth: '#E67E22', astronomy: '#2C3E50' }
      return colors[type] || '#999'
    },
    getTypeName(type) {
      const names = { chemistry: '化学', physics: '物理', biology: '生物', earth: '地球科学', astronomy: '天文' }
      return names[type] || type
    },
    getDifficultyText(difficulty) {
      const texts = { easy: '简单', medium: '中等', hard: '困难' }
      return texts[difficulty] || difficulty
    }
  }
}
</script>

<style scoped>
.science-quests-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.page-header {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  padding: 20px;
  color: #fff;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
}

.header-stats {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.progress-overview {
  padding: 15px;
}

.progress-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-title {
  font-size: 14px;
  color: #666;
}

.progress-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.progress-bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
  border-radius: 4px;
  transition: width 0.3s;
}

.quests-section {
  padding: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.section-count {
  font-size: 12px;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.quest-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quest-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.quest-header {
  display: flex;
  align-items: center;
}

.quest-icon {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.quest-info {
  flex: 1;
  margin-left: 12px;
}

.quest-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.quest-meta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.quest-type {
  font-size: 11px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.quest-difficulty {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.quest-difficulty.easy {
  color: #27ae60;
  background: #e8f8f0;
}

.quest-difficulty.medium {
  color: #f39c12;
  background: #fef9e7;
}

.quest-difficulty.hard {
  color: #e74c3c;
  background: #fdedec;
}

.quest-points {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.points-value {
  font-size: 16px;
  font-weight: bold;
  color: #11998e;
}

.points-label {
  font-size: 10px;
  color: #999;
}

.quest-desc {
  font-size: 13px;
  color: #666;
  margin-top: 10px;
  line-height: 1.4;
}

.quest-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.progress-bar-small {
  flex: 1;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-small .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
  border-radius: 3px;
}

.progress-text {
  font-size: 11px;
  color: #999;
  min-width: 35px;
}

.quest-tasks {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 6px 0;
}

.task-check {
  font-size: 14px;
  color: #ccc;
  margin-right: 8px;
}

.task-item.completed .task-check {
  color: #27ae60;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #999;
}

.task-title {
  font-size: 13px;
  color: #333;
}

.quest-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.quest-reward {
  font-size: 12px;
  color: #f39c12;
}

.quest-completed-badge {
  font-size: 12px;
  color: #27ae60;
  background: #e8f8f0;
  padding: 4px 10px;
  border-radius: 12px;
}

.achievements-section {
  padding: 15px;
}

.achievement-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.achievement-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 10px;
  min-width: 70px;
  opacity: 0.5;
}

.achievement-item.unlocked {
  opacity: 1;
  background: linear-gradient(135deg, #fff 0%, #fffbe6 100%);
  border: 1px solid #f0c36d;
}

.achievement-icon {
  font-size: 28px;
}

.achievement-name {
  font-size: 10px;
  color: #666;
  margin-top: 4px;
  text-align: center;
}
</style>
