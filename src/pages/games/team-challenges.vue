<template>
  <view class="team-challenges-page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">团队挑战</text>
      <text class="subtitle">接力完成任务 · 团队排行榜</text>
    </view>

    <!-- 挑战统计 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ challengeStats.active }}</text>
        <text class="stat-label">进行中</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ challengeStats.completed }}</text>
        <text class="stat-label">已完成</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ challengeStats.total }}</text>
        <text class="stat-label">总挑战</text>
      </view>
    </view>

    <!-- 进行中的挑战 -->
    <view class="section">
      <text class="section-title">进行中的挑战</text>
      <view class="challenge-list">
        <view
          v-for="challenge in activeChallenges"
          :key="challenge.id"
          class="challenge-card"
        >
          <view class="challenge-header">
            <text class="challenge-icon">{{ getChallengeIcon(challenge.type) }}</text>
            <view class="challenge-info">
              <text class="challenge-title">{{ challenge.title }}</text>
              <text class="challenge-desc">{{ challenge.description }}</text>
            </view>
          </view>

          <view class="challenge-progress">
            <view class="progress-bar">
              <view
                class="progress-fill"
                :style="{ width: getProgressPercent(challenge) + '%' }"
              ></view>
            </view>
            <text class="progress-text">
              {{ challenge.progress }} / {{ getTargetValue(challenge) }}
            </text>
          </view>

          <view class="challenge-members">
            <text class="members-label">参与成员：</text>
            <view class="member-tags">
              <text
                v-for="member in challenge.members"
                :key="member"
                class="member-tag"
              >
                {{ member }}
              </text>
            </view>
          </view>

          <view class="challenge-actions">
            <button class="join-btn" @click="joinChallenge(challenge.id)">
              参与挑战
            </button>
            <button class="progress-btn" @click="showProgressUpdate(challenge)">
              更新进度
            </button>
          </view>
        </view>

        <view v-if="activeChallenges.length === 0" class="empty-state">
          <text>暂无进行中的挑战</text>
        </view>
      </view>
    </view>

    <!-- 已完成的挑战 -->
    <view class="section">
      <text class="section-title">已完成的挑战</text>
      <view class="challenge-list">
        <view
          v-for="challenge in completedChallenges"
          :key="challenge.id"
          class="challenge-card completed"
        >
          <view class="challenge-header">
            <text class="challenge-icon">{{ getChallengeIcon(challenge.type) }}</text>
            <view class="challenge-info">
              <text class="challenge-title">{{ challenge.title }}</text>
              <text class="challenge-desc">{{ challenge.description }}</text>
            </view>
            <view class="completed-badge">
              <text>✓</text>
            </view>
          </view>

          <view class="reward-info">
            <text class="reward-item">+{{ challenge.expReward }}经验</text>
            <text class="reward-item">+{{ challenge.pointsReward }}积分</text>
          </view>

          <view class="completed-by">
            <text class="completed-label">完成者：</text>
            <text class="completed-names">{{ challenge.completedBy.join('、') }}</text>
          </view>
        </view>

        <view v-if="completedChallenges.length === 0" class="empty-state">
          <text>暂无已完成的挑战</text>
        </view>
      </view>
    </view>

    <!-- 团队排行榜 -->
    <view class="section">
      <text class="section-title">团队排行榜</text>
      <view class="leaderboard-card">
        <view
          v-for="(member, index) in leaderboard"
          :key="member.name"
          class="leaderboard-item"
        >
          <view class="rank" :class="'rank-' + (index + 1)">
            <text>{{ index + 1 }}</text>
          </view>
          <view class="member-info">
            <text class="member-name">{{ member.name }}</text>
            <text class="member-stats">
              解谜{{ member.puzzlesSolved }} · 挑战{{ member.challengesCompleted }}
            </text>
          </view>
          <text class="member-score">{{ member.score }}分</text>
        </view>

        <view v-if="leaderboard.length === 0" class="empty-state">
          <text>暂无排行数据</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useGameStore } from '@/stores/gameStore.js'

export default {
  data() {
    return {
      selectedChallenge: null
    }
  },
  computed: {
    gameStore() {
      return useGameStore()
    },
    activeChallenges() {
      return this.gameStore.activeChallenges
    },
    completedChallenges() {
      return this.gameStore.completedChallenges
    },
    challengeStats() {
      return this.gameStore.challengeStats
    },
    leaderboard() {
      return this.gameStore.leaderboard
    }
  },
  onLoad() {
    this.gameStore.init()
  },
  methods: {
    getChallengeIcon(type) {
      const icons = {
        relay: '🏃',
        accumulate: '⏰',
        streak: '🔥'
      }
      return icons[type] || '🎯'
    },
    getTargetValue(challenge) {
      if (challenge.type === 'relay') return challenge.targetCount
      if (challenge.type === 'accumulate') return challenge.targetMinutes
      if (challenge.type === 'streak') return challenge.targetDays
      return challenge.targetCount || 0
    },
    getProgressPercent(challenge) {
      const target = this.getTargetValue(challenge)
      if (!target) return 0
      return Math.min(100, Math.round((challenge.progress / target) * 100))
    },
    joinChallenge(challengeId) {
      const result = this.gameStore.joinChallenge(challengeId, '我')
      if (result) {
        uni.showToast({ title: '参与成功！', icon: 'success' })
      }
    },
    showProgressUpdate(challenge) {
      this.selectedChallenge = challenge
      uni.showModal({
        title: '更新进度',
        placeholderText: '请输入当前进度',
        editable: true,
        success: (res) => {
          if (res.confirm && res.content) {
            const progress = parseInt(res.content, 10)
            if (!isNaN(progress)) {
              const result = this.gameStore.updateChallengeProgress(
                challenge.id,
                progress,
                '我'
              )
              if (result && result.completed) {
                uni.showToast({
                  title: '恭喜挑战完成！',
                  icon: 'success'
                })
              }
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.team-challenges-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%);
  padding: 20rpx;
}

.header {
  text-align: center;
  padding: 40rpx 0;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10rpx;
}

.stats-card {
  display: flex;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #f5576c;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.section {
  margin: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
  display: block;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.challenge-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.challenge-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.challenge-card.completed {
  opacity: 0.8;
  background: #f8f9fa;
}

.challenge-header {
  display: flex;
  align-items: flex-start;
}

.challenge-icon {
  font-size: 60rpx;
  margin-right: 20rpx;
}

.challenge-info {
  flex: 1;
}

.challenge-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.challenge-desc {
  font-size: 26rpx;
  color: #666;
  margin-top: 8rpx;
  display: block;
}

.completed-badge {
  width: 48rpx;
  height: 48rpx;
  background: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
}

.challenge-progress {
  margin-top: 20rpx;
}

.progress-bar {
  height: 16rpx;
  background: #e0e0e0;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  border-radius: 8rpx;
  transition: width 0.3s;
}

.progress-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
  text-align: right;
}

.challenge-members {
  margin-top: 16rpx;
}

.members-label,
.completed-label {
  font-size: 24rpx;
  color: #999;
}

.member-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 8rpx;
}

.member-tag {
  background: #f0f0f0;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #666;
}

.challenge-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.join-btn,
.progress-btn {
  flex: 1;
  height: 70rpx;
  line-height: 70rpx;
  border-radius: 35rpx;
  font-size: 28rpx;
  border: none;
}

.join-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #ffffff;
}

.progress-btn {
  background: #f0f0f0;
  color: #333;
}

.reward-info {
  display: flex;
  gap: 20rpx;
  margin-top: 16rpx;
}

.reward-item {
  font-size: 24rpx;
  color: #f5576c;
  background: #ffebee;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.completed-by {
  margin-top: 12rpx;
}

.completed-names {
  font-size: 24rpx;
  color: #666;
  margin-left: 8rpx;
}

.leaderboard-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.leaderboard-item:last-child {
  border-bottom: none;
}

.rank {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  margin-right: 16rpx;
}

.rank.rank-1 {
  background: #ffd700;
  color: #fff;
}

.rank.rank-2 {
  background: #c0c0c0;
  color: #fff;
}

.rank.rank-3 {
  background: #cd7f32;
  color: #fff;
}

.rank.rank-4,
.rank.rank-5 {
  background: #e0e0e0;
  color: #666;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.member-stats {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.member-score {
  font-size: 32rpx;
  font-weight: bold;
  color: #f5576c;
}

.empty-state {
  text-align: center;
  padding: 60rpx;
  color: #999;
  font-size: 28rpx;
  background: #ffffff;
  border-radius: 20rpx;
}
</style>
