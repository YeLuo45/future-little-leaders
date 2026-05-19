<template>
  <view class="pet-competition">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="back-btn" @click="goBack">←</text>
      <text class="title">宠物竞赛</text>
    </view>

    <!-- 无宠物提示 -->
    <view class="no-pet-tip" v-if="!petStore.hasPet">
      <text class="tip-icon">🏆</text>
      <text class="tip-text">领养宠物后才能参加竞赛</text>
      <button class="back-home-btn" @click="goBack">返回首页</button>
    </view>

    <template v-else>
      <!-- 宠物信息卡片 -->
      <view class="pet-info-card" :style="{ background: petStore.petData?.color }">
        <text class="pet-icon">{{ petStore.petTypeInfo?.icon }}</text>
        <view class="pet-detail">
          <text class="pet-name">{{ petStore.petData?.name }}</text>
          <text class="pet-level">Lv.{{ petStore.petData?.level }}</text>
        </view>
        <view class="pet-stats-mini">
          <text class="stat">HP {{ petStore.petStats?.health || 0 }}%</text>
        </view>
      </view>

      <!-- 难度选择 -->
      <view class="difficulty-section">
        <text class="section-title">选择难度</text>
        <view class="difficulty-list">
          <view 
            v-for="diff in difficulties" 
            :key="diff.id"
            class="difficulty-card"
            :class="{ active: petStore.selectedDifficulty === diff.id }"
            @click="selectDifficulty(diff.id)"
          >
            <text class="diff-icon">{{ diff.icon }}</text>
            <text class="diff-name">{{ diff.name }}</text>
            <view class="diff-rewards">
              <text class="reward-item">胜: +{{ diff.winExp }}EXP +{{ diff.winPoints }}分</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 已装备技能 -->
      <view class="equipped-section">
        <text class="section-title">已装备技能 ({{ petStore.equippedSkills.length }}/4)</text>
        <view class="equipped-list" v-if="petStore.equippedSkills.length > 0">
          <view 
            v-for="skill in petStore.equippedSkills" 
            :key="skill.id"
            class="equipped-skill"
          >
            <text class="skill-icon">{{ skill.icon }}</text>
            <text class="skill-name">{{ skill.name }}</text>
            <text class="skill-power">威力 {{ petStore.getSkillPower(skill.id, skill.level) }}</text>
          </view>
        </view>
        <view class="no-skills-tip" v-else>
          <text>请先在技能页面装备技能</text>
          <button @click="goToSkills">去装备</button>
        </view>
      </view>

      <!-- 开始竞赛按钮 -->
      <view class="start-section">
        <button 
          class="start-btn" 
          :disabled="petStore.equippedSkills.length === 0"
          @click="handleStartCompetition"
        >
          ⚔️ 开始竞赛
        </button>
      </view>

      <!-- 排行榜入口 -->
      <view class="leaderboard-section" @click="goToLeaderboard">
        <text class="section-title">🏆 排行榜</text>
        <view class="leaderboard-preview" v-if="petStore.leaderboard.length > 0">
          <view 
            v-for="(item, index) in petStore.leaderboard.slice(0, 3)" 
            :key="item.petId"
            class="rank-item"
          >
            <text class="rank-num" :class="'rank-' + (index + 1)">{{ index + 1 }}</text>
            <text class="rank-icon">{{ item.petName.charAt(0) }}*</text>
            <text class="rank-name">{{ item.petName }}</text>
            <text class="rank-points">{{ item.points }}分</text>
          </view>
        </view>
        <text class="more-tip" v-if="petStore.leaderboard.length > 3">查看更多排行榜...</text>
      </view>

      <!-- 竞赛历史 -->
      <view class="history-section">
        <text class="section-title">📋 竞赛记录</text>
        <view class="history-list" v-if="petStore.competitionHistory.length > 0">
          <view 
            v-for="record in petStore.competitionHistory.slice(0, 5)" 
            :key="record.id"
            class="history-item"
            :class="{ win: record.won }"
          >
            <view class="history-left">
              <text class="result-icon">{{ record.won ? '🏆' : '❌' }}</text>
              <view class="history-info">
                <text class="opponent">{{ record.opponent }}</text>
                <text class="difficulty-tag">{{ getDifficultyName(record.difficulty) }}</text>
              </view>
            </view>
            <view class="history-right">
              <text class="exp-change" :class="{ positive: record.won }">
                {{ record.won ? '+' : '' }}{{ record.expReward }}EXP
              </text>
              <text class="time">{{ formatTime(record.timestamp) }}</text>
            </view>
          </view>
        </view>
        <text class="no-history" v-else>暂无竞赛记录</text>
      </view>
    </template>

    <!-- 竞赛结果弹窗 -->
    <uni-popup ref="resultPopup" type="center">
      <view class="result-modal" v-if="petStore.competitionResult">
        <text class="result-icon">{{ petStore.competitionResult.won ? '🏆' : '😢' }}</text>
        <text class="result-title">{{ petStore.competitionResult.won ? '竞赛胜利！' : '竞赛失败' }}</text>
        
        <view class="battle-info">
          <view class="battle-row">
            <text class="my-pet">{{ petStore.petData?.name }}</text>
            <text class="vs">VS</text>
            <text class="opponent-pet">{{ petStore.competitionResult.opponent }}</text>
          </view>
          <view class="power-row">
            <text class="my-power">{{ petStore.competitionResult.myPower }}</text>
            <text class="power-label">战斗力</text>
            <text class="opp-power">{{ petStore.competitionResult.oppPower }}</text>
          </view>
        </view>
        
        <view class="rewards-info">
          <text class="reward-title">获得奖励</text>
          <view class="reward-row">
            <text class="reward-item">经验 +{{ petStore.competitionResult.expReward }}</text>
            <text class="reward-item" v-if="petStore.competitionResult.pointsReward > 0">
              积分 +{{ petStore.competitionResult.pointsReward }}
            </text>
          </view>
        </view>
        
        <button class="confirm-btn" @click="petStore.closeCompetitionModal">确定</button>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePetStore } from '@/stores/petStore.js'
import petService from '@/services/petService.js'

const petStore = usePetStore()

const difficulties = [
  { id: 'easy', name: '简单', icon: '🌱', winExp: 15, winPoints: 10 },
  { id: 'normal', name: '普通', icon: '⚔️', winExp: 30, winPoints: 25 },
  { id: 'hard', name: '困难', icon: '🔥', winExp: 50, winPoints: 50 }
]

const selectDifficulty = (difficulty) => {
  petStore.setDifficulty(difficulty)
}

const handleStartCompetition = () => {
  if (petStore.equippedSkills.length === 0) {
    uni.showToast({ title: '请先装备技能', icon: 'none' })
    return
  }
  const result = petStore.startCompetition()
  if (result.success) {
    resultPopup.value.open()
  }
}

const getDifficultyName = (difficulty) => {
  const diff = difficulties.find(d => d.id === difficulty)
  return diff ? diff.name : difficulty
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const goBack = () => {
  uni.navigateBack()
}

const goToSkills = () => {
  uni.navigateTo({ url: '/pages/pet/pet-skills' })
}

const goToLeaderboard = () => {
  uni.navigateTo({ url: '/pages/pet/pet-leaderboard' })
}

const resultPopup = ref(null)

onMounted(() => {
  petStore.init()
})
</script>

<style scoped>
.pet-competition {
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

.no-pet-tip {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.tip-icon {
  font-size: 48px;
}

.tip-text {
  font-size: 14px;
  color: #666;
}

.back-home-btn {
  background: #8477fa;
  color: #fff;
  border-radius: 20px;
  padding: 10px 24px;
  font-size: 14px;
  margin-top: 12px;
}

.pet-info-card {
  background: linear-gradient(135deg, #8477fa 0%, #9b95f9 100%);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.pet-icon {
  font-size: 40px;
}

.pet-detail {
  flex: 1;
}

.pet-name {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  display: block;
}

.pet-level {
  font-size: 12px;
  color: rgba(255,255,255,0.9);
}

.pet-stats-mini {
  text-align: right;
}

.pet-stats-mini .stat {
  font-size: 12px;
  color: rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.2);
  padding: 4px 8px;
  border-radius: 8px;
}

.difficulty-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
  display: block;
}

.difficulty-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.difficulty-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px 12px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.difficulty-card.active {
  border-color: #8477fa;
  background: #f8f7ff;
}

.diff-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 4px;
}

.diff-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.diff-rewards {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reward-item {
  font-size: 10px;
  color: #666;
}

.equipped-section {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
}

.equipped-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.equipped-skill {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.equipped-skill .skill-icon {
  font-size: 18px;
}

.equipped-skill .skill-name {
  font-size: 12px;
  color: #333;
}

.equipped-skill .skill-power {
  font-size: 10px;
  color: #8477fa;
  background: #f0eeff;
  padding: 2px 6px;
  border-radius: 6px;
}

.no-skills-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #fff9e6;
  border-radius: 12px;
}

.no-skills-tip text {
  font-size: 13px;
  color: #996600;
}

.no-skills-tip button {
  background: #8477fa;
  color: #fff;
  border-radius: 16px;
  padding: 6px 16px;
  font-size: 12px;
}

.start-section {
  margin-bottom: 20px;
}

.start-btn {
  width: 100%;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  color: #fff;
  border-radius: 24px;
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
  border: none;
}

.start-btn:disabled {
  background: #ccc;
}

.leaderboard-section {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
}

.leaderboard-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8f8f8;
  border-radius: 8px;
}

.rank-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ddd;
  font-size: 11px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-num.rank-1 {
  background: #ffd700;
}

.rank-num.rank-2 {
  background: #c0c0c0;
}

.rank-num.rank-3 {
  background: #cd7f32;
}

.rank-icon {
  font-size: 20px;
}

.rank-name {
  flex: 1;
  font-size: 13px;
  color: #333;
}

.rank-points {
  font-size: 12px;
  color: #8477fa;
  font-weight: bold;
}

.more-tip {
  font-size: 12px;
  color: #999;
  text-align: center;
  display: block;
  margin-top: 8px;
}

.history-section {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f8f8;
  border-radius: 10px;
  border-left: 3px solid #ccc;
}

.history-item.win {
  border-left-color: #8477fa;
  background: #f8f7ff;
}

.history-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-icon {
  font-size: 20px;
}

.history-info {
  display: flex;
  flex-direction: column;
}

.opponent {
  font-size: 13px;
  color: #333;
  font-weight: bold;
}

.difficulty-tag {
  font-size: 10px;
  color: #999;
}

.history-right {
  text-align: right;
}

.exp-change {
  font-size: 12px;
  color: #999;
  display: block;
}

.exp-change.positive {
  color: #8477fa;
  font-weight: bold;
}

.time {
  font-size: 10px;
  color: #999;
}

.no-history {
  font-size: 13px;
  color: #999;
  text-align: center;
  padding: 20px;
  display: block;
}

/* 结果弹窗样式 */
.result-modal {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  width: 300px;
  text-align: center;
}

.result-modal .result-icon {
  font-size: 60px;
  display: block;
  margin-bottom: 12px;
}

.result-modal .result-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20px;
}

.battle-info {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.battle-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 12px;
}

.my-pet, .opponent-pet {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.vs {
  font-size: 12px;
  color: #999;
}

.power-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.my-power, .opp-power {
  font-size: 18px;
  font-weight: bold;
  color: #8477fa;
}

.power-label {
  font-size: 11px;
  color: #999;
}

.rewards-info {
  margin-bottom: 20px;
}

.reward-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.reward-row {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.reward-row .reward-item {
  font-size: 14px;
  color: #8477fa;
  font-weight: bold;
}

.confirm-btn {
  background: #8477fa;
  color: #fff;
  border-radius: 20px;
  padding: 12px 40px;
  font-size: 14px;
  border: none;
}
</style>
