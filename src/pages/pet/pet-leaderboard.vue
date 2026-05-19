<template>
  <view class="pet-leaderboard">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="back-btn" @click="goBack">←</text>
      <text class="title">竞赛排行榜</text>
    </view>

    <!-- 我的排名 -->
    <view class="my-rank-card" v-if="petStore.hasPet && myRank">
      <view class="rank-badge">
        <text class="rank-num">{{ myRank.rank }}</text>
      </view>
      <view class="my-info">
        <text class="my-name">{{ petStore.petData?.name }}</text>
        <text class="my-level">Lv.{{ petStore.petData?.level }}</text>
      </view>
      <view class="my-score">
        <text class="score-value">{{ myRank.points }}</text>
        <text class="score-label">竞赛积分</text>
      </view>
    </view>

    <!-- 排行榜列表 -->
    <view class="leaderboard-section">
      <view class="leaderboard-list">
        <view 
          v-for="(item, index) in petStore.leaderboard" 
          :key="item.petId"
          class="leaderboard-item"
          :class="{ 
            'top-three': index < 3,
            'is-me': item.petId === petStore.petData?.id
          }"
        >
          <view class="rank-cell">
            <text class="rank-num" v-if="index >= 3">{{ index + 1 }}</text>
            <text class="rank-medal" v-else>{{ getMedalEmoji(index) }}</text>
          </view>
          <view class="pet-cell">
            <text class="pet-avatar">{{ getPetEmoji(item.petName) }}</text>
            <view class="pet-info">
              <text class="pet-name">{{ item.petName }}</text>
              <text class="pet-level">Lv.{{ item.level }}</text>
            </view>
          </view>
          <view class="score-cell">
            <text class="points">{{ item.points }}</text>
            <text class="wins" v-if="item.totalWins > 0">胜 {{ item.totalWins }}</text>
          </view>
        </view>
      </view>

      <view class="empty-tip" v-if="petStore.leaderboard.length === 0">
        <text class="empty-icon">🏆</text>
        <text class="empty-text">暂无排行榜数据</text>
        <text class="empty-hint">参加竞赛即可上榜！</text>
      </view>
    </view>

    <!-- 竞赛入口 -->
    <view class="competition-entry" @click="goToCompetition">
      <text class="entry-icon">⚔️</text>
      <text class="entry-text">参加宠物竞赛</text>
      <text class="entry-arrow">→</text>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePetStore } from '@/stores/petStore.js'

const petStore = usePetStore()

const myRank = computed(() => {
  if (!petStore.hasPet || !petStore.leaderboard.length) return null
  const petId = petStore.petData?.id
  const index = petStore.leaderboard.findIndex(item => item.petId === petId)
  if (index === -1) return null
  return {
    rank: index + 1,
    points: petStore.leaderboard[index].points,
    wins: petStore.leaderboard[index].totalWins
  }
})

const getMedalEmoji = (index) => {
  const medals = ['🥇', '🥈', '🥉']
  return medals[index] || ''
}

const getPetEmoji = (name) => {
  // 根据名字生成一个随机的宠物表情
  const emojis = ['🐱', '🐶', '🐰', '🐉']
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return emojis[hash % emojis.length]
}

const goBack = () => {
  uni.navigateBack()
}

const goToCompetition = () => {
  uni.navigateBack()
}

onMounted(() => {
  petStore.init()
})
</script>

<style scoped>
.pet-leaderboard {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.back-btn {
  font-size: 24px;
  color: #333;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.my-rank-card {
  background: linear-gradient(135deg, #8477fa 0%, #9b95f9 100%);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.rank-badge {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-badge .rank-num {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

.my-info {
  flex: 1;
}

.my-name {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  display: block;
}

.my-level {
  font-size: 12px;
  color: rgba(255,255,255,0.8);
}

.my-score {
  text-align: center;
}

.score-value {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  display: block;
}

.score-label {
  font-size: 11px;
  color: rgba(255,255,255,0.8);
}

.leaderboard-section {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 12px;
  gap: 12px;
}

.leaderboard-item.top-three {
  background: #f8f7ff;
  border: 1px solid #e8e6ff;
}

.leaderboard-item.is-me {
  background: linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%);
  border: 1px solid #ffe066;
}

.rank-cell {
  width: 36px;
  text-align: center;
}

.rank-num {
  font-size: 16px;
  font-weight: bold;
  color: #666;
}

.rank-medal {
  font-size: 24px;
}

.pet-cell {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.pet-avatar {
  font-size: 32px;
  width: 44px;
  height: 44px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pet-info {
  display: flex;
  flex-direction: column;
}

.pet-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.pet-level {
  font-size: 11px;
  color: #999;
}

.score-cell {
  text-align: right;
}

.points {
  font-size: 16px;
  font-weight: bold;
  color: #8477fa;
  display: block;
}

.wins {
  font-size: 10px;
  color: #999;
}

.empty-tip {
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-icon {
  font-size: 48px;
}

.empty-text {
  font-size: 14px;
  color: #666;
}

.empty-hint {
  font-size: 12px;
  color: #999;
}

.competition-entry {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.entry-icon {
  font-size: 24px;
}

.entry-text {
  flex: 1;
  font-size: 15px;
  font-weight: bold;
  color: #fff;
}

.entry-arrow {
  font-size: 18px;
  color: #fff;
}
</style>
