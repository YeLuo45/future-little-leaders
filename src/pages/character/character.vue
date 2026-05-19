<template>
  <view class="character-container">
    <!-- 顶部标题区 -->
    <view class="header-section">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="user-info">
          <text class="greeting">{{ greeting }}</text>
          <text class="level-badge">品格等级 Lv.{{ overallLevel }}</text>
        </view>
        <view class="exp-bar-container">
          <text class="exp-label">总经验</text>
          <view class="exp-bar">
            <view class="exp-fill" :style="{ width: overallExpProgress + '%' }"></view>
          </view>
          <text class="exp-text">{{ statistics.totalExp }} EXP</text>
        </view>
      </view>
    </view>

    <!-- 品格等级卡片 -->
    <view class="character-cards">
      <view 
        v-for="type in characterTypes" 
        :key="type"
        class="character-card"
        :style="{ backgroundColor: getCharacterInfo(type).color + '20', borderColor: getCharacterInfo(type).color }"
        @tap="selectCharacter(type)"
      >
        <view class="character-icon" :style="{ backgroundColor: getCharacterInfo(type).color }">
          <text>{{ getCharacterInfo(type).emoji }}</text>
        </view>
        <view class="character-info">
          <text class="character-name">{{ getCharacterInfo(type).label }}</text>
          <text class="character-level">Lv.{{ getCharacterLevel(type).level }} {{ getLevelName(getCharacterLevel(type).level) }}</text>
          <view class="character-exp-bar">
            <view class="exp-fill" :style="{ width: levelProgress[type]?.progress + '%', backgroundColor: getCharacterInfo(type).color }"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- Tab切换区 -->
    <view class="tab-container">
      <view class="tab-header">
        <view 
          v-for="tab in tabs" 
          :key="tab.key"
          :class="['tab-item', { active: currentTab === tab.key }]"
          @tap="switchTab(tab.key)"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>

      <!-- 任务Tab -->
      <view v-if="currentTab === 'quests'" class="tab-content">
        <view class="section-header">
          <text class="section-title">今日任务</text>
          <view class="quest-stats">
            <text class="stat-text">{{ completedQuestCount }}/{{ todayQuests.length }}</text>
          </view>
        </view>
        <view class="quest-list">
          <view 
            v-for="quest in todayQuests" 
            :key="quest.id"
            class="quest-card"
            :class="{ completed: quest.status === 'completed', in_progress: quest.status === 'in_progress' }"
            @tap="handleQuestTap(quest)"
          >
            <view class="quest-status">
              <text v-if="quest.status === 'completed'" class="status-icon">✓</text>
              <text v-else-if="quest.status === 'in_progress'" class="status-icon doing">⟳</text>
              <text v-else class="status-icon available">○</text>
            </view>
            <view class="quest-info">
              <view class="quest-header">
                <text class="quest-type">{{ getCharacterInfo(quest.characterType).emoji }}</text>
                <text class="quest-title">{{ quest.title }}</text>
              </view>
              <text class="quest-desc">{{ quest.description }}</text>
              <view class="quest-rewards">
                <text class="reward-item" :style="{ color: getCharacterInfo(quest.characterType).color }">+{{ quest.exp }} EXP</text>
              </view>
            </view>
            <view class="quest-action" v-if="quest.status === 'available'" @tap.stop="acceptQuest(quest)">
              <text>领取</text>
            </view>
            <view class="quest-action" v-else-if="quest.status === 'in_progress'" @tap.stop="completeQuest(quest)">
              <text>完成</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 日记Tab -->
      <view v-if="currentTab === 'journal'" class="tab-content">
        <view class="section-header">
          <text class="section-title">修炼日记</text>
          <text class="section-more" @tap="goToJournal">写日记</text>
        </view>
        <view class="journal-list" v-if="journalEntries.length > 0">
          <view 
            v-for="entry in displayJournals" 
            :key="entry.id"
            class="journal-card"
            @tap="viewJournal(entry)"
          >
            <view class="journal-date">
              <text class="date-day">{{ formatDay(entry.date) }}</text>
              <text class="date-month">{{ formatMonth(entry.date) }}</text>
            </view>
            <view class="journal-content">
              <view class="journal-header">
                <text class="journal-type" :style="{ color: getCharacterInfo(entry.characterType)?.color }">
                  {{ getCharacterInfo(entry.characterType)?.emoji }} {{ getCharacterInfo(entry.characterType)?.label }}
                </text>
              </view>
              <text class="journal-title">{{ entry.title }}</text>
              <text class="journal-preview">{{ entry.content.substring(0, 50) }}...</text>
            </view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <text class="empty-icon">📝</text>
          <text class="empty-text">还没有日记记录</text>
          <text class="empty-desc">记录你的品格修炼心得</text>
        </view>
      </view>

      <!-- 证书Tab -->
      <view v-if="currentTab === 'certificates'" class="tab-content">
        <view class="section-header">
          <text class="section-title">品格证书</text>
        </view>
        <view class="certificate-list" v-if="certificates.length > 0">
          <view 
            v-for="cert in certificates" 
            :key="cert.id"
            class="certificate-card"
            :style="{ borderColor: getCharacterInfo(cert.characterType)?.color }"
            @tap="viewCertificate(cert)"
          >
            <view class="cert-badge" :style="{ backgroundColor: getCharacterInfo(cert.characterType)?.color }">
              <text>{{ getCharacterInfo(cert.characterType)?.emoji }}</text>
            </view>
            <view class="cert-info">
              <text class="cert-title">{{ getCharacterInfo(cert.characterType)?.label }}品格证书</text>
              <text class="cert-level">等级：Lv.{{ cert.level }} {{ getLevelName(cert.level) }}</text>
              <text class="cert-date">获得日期：{{ formatCertDate(cert.earnedAt) }}</text>
            </view>
            <text class="cert-number">{{ cert.certificateNumber }}</text>
          </view>
        </view>
        <view class="empty-state" v-else>
          <text class="empty-icon">🏆</text>
          <text class="empty-text">还没有获得证书</text>
          <text class="empty-desc">品格等级达到3级可获得证书</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCharacterQuestStore } from '@/stores/characterQuestStore.js'

const characterQuestStore = useCharacterQuestStore()

const currentTab = ref('quests')
const tabs = [
  { key: 'quests', label: '任务' },
  { key: 'journal', label: '日记' },
  { key: 'certificates', label: '证书' }
]

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好，开始今天的品格修炼！'
  if (hour < 18) return '下午好，继续加油！'
  return '晚上好，回顾今天的成长！'
})

const characterTypes = computed(() => characterQuestStore.getAllCharacterTypes())
const getCharacterInfo = (type) => characterQuestStore.getCharacterInfo(type)
const getCharacterLevel = (type) => characterQuestStore.getCharacterLevel(type)
const getLevelName = (level) => characterQuestStore.getLevelName(level)
const levelProgress = computed(() => characterQuestStore.levelProgress)
const statistics = computed(() => characterQuestStore.statistics)
const todayQuests = computed(() => characterQuestStore.todayQuests)
const journalEntries = computed(() => characterQuestStore.journalEntries)
const certificates = computed(() => characterQuestStore.certificates)

const completedQuestCount = computed(() => {
  return todayQuests.value.filter(q => q.status === 'completed').length
})

const overallLevel = computed(() => {
  return statistics.value.overallLevel || 1
})

const overallExpProgress = computed(() => {
  const levels = characterQuestStore.characterLevels
  if (!levels || Object.keys(levels).length === 0) return 0
  const avgExp = Object.values(levels).reduce((sum, l) => sum + (l.exp || 0), 0) / 4
  return Math.min(100, Math.round((avgExp / 1000) * 100))
})

const displayJournals = computed(() => {
  return journalEntries.value.slice(0, 5)
})

const selectCharacter = (type) => {
  characterQuestStore.selectedCharacterType = type
  currentTab.value = 'quests'
}

const switchTab = (key) => {
  currentTab.value = key
}

const handleQuestTap = (quest) => {
  if (quest.status === 'available') {
    acceptQuest(quest)
  } else if (quest.status === 'in_progress') {
    completeQuest(quest)
  }
}

const acceptQuest = (quest) => {
  const record = characterQuestStore.acceptQuest(quest.id)
  if (record) {
    uni.showToast({ title: '任务已领取', icon: 'success' })
  }
}

const completeQuest = (quest) => {
  const result = characterQuestStore.completeQuest(quest.id)
  if (result) {
    uni.showToast({ title: `获得 ${result.expGained} EXP`, icon: 'success' })
    if (result.leveledUp) {
      uni.showToast({ title: `升级！Lv.${result.newLevel}`, icon: 'none' })
    }
  }
}

const goToJournal = () => {
  uni.navigateTo({ url: '/pages/character/character-journal' })
}

const viewJournal = (entry) => {
  uni.navigateTo({ url: `/pages/character/character-journal?date=${entry.date}` })
}

const viewCertificate = (cert) => {
  uni.navigateTo({ url: `/pages/character/character-certificate?id=${cert.id}` })
}

const formatDay = (dateStr) => {
  const date = new Date(dateStr)
  return date.getDate()
}

const formatMonth = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月`
}

const formatCertDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

onMounted(() => {
  characterQuestStore.init()
})
</script>

<style scoped>
.character-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding-bottom: 120rpx;
}

.header-section {
  position: relative;
  padding: 120rpx 40rpx 40rpx;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 0 40rpx 40rpx;
}

.header-content {
  position: relative;
  z-index: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.greeting {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.level-badge {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #ffffff;
}

.exp-bar-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.exp-label {
  font-size: 24rpx;
  color: #ffffff;
  opacity: 0.8;
}

.exp-bar {
  flex: 1;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6rpx;
  overflow: hidden;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.exp-text {
  font-size: 24rpx;
  color: #ffffff;
  opacity: 0.8;
}

.character-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 0 40rpx;
  margin-top: -20rpx;
}

.character-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  gap: 16rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
}

.character-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  flex-shrink: 0;
}

.character-info {
  flex: 1;
  min-width: 0;
}

.character-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
}

.character-level {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-top: 4rpx;
}

.character-exp-bar {
  height: 8rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4rpx;
  margin-top: 12rpx;
  overflow: hidden;
}

.tab-container {
  margin: 30rpx 40rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 30rpx;
  overflow: hidden;
}

.tab-header {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 30rpx 30rpx 0 0;
}

.tab-item {
  flex: 1;
  padding: 30rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.tab-item.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.tab-content {
  padding: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.quest-stats {
  background: rgba(255, 255, 255, 0.1);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.stat-text {
  font-size: 24rpx;
  color: #ffffff;
}

.quest-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.quest-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.quest-card.completed {
  opacity: 0.6;
}

.quest-card.in_progress {
  border-left: 4rpx solid #4CAF50;
}

.quest-status {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.status-icon.doing {
  color: #4CAF50;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.quest-info {
  flex: 1;
  min-width: 0;
}

.quest-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.quest-type {
  font-size: 28rpx;
}

.quest-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
}

.quest-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  display: block;
  margin-bottom: 8rpx;
}

.quest-rewards {
  display: flex;
  gap: 16rpx;
}

.reward-item {
  font-size: 22rpx;
  font-weight: bold;
}

.quest-action {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16rpx 24rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.quest-action text {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: bold;
}

.journal-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.journal-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  gap: 20rpx;
}

.journal-date {
  width: 80rpx;
  text-align: center;
  flex-shrink: 0;
}

.date-day {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
}

.date-month {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
}

.journal-content {
  flex: 1;
  min-width: 0;
}

.journal-header {
  margin-bottom: 8rpx;
}

.journal-type {
  font-size: 24rpx;
  font-weight: bold;
}

.journal-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 8rpx;
}

.journal-preview {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.section-more {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.certificate-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.certificate-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16rpx;
  padding: 24rpx;
  border: 2rpx solid;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.cert-badge {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  flex-shrink: 0;
}

.cert-info {
  flex: 1;
}

.cert-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
}

.cert-level {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-top: 4rpx;
}

.cert-date {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
  display: block;
  margin-top: 4rpx;
}

.cert-number {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.4);
}

.empty-state {
  text-align: center;
  padding: 60rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #ffffff;
  display: block;
  margin-bottom: 8rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}
</style>
