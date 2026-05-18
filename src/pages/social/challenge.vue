<template>
  <view class="challenge-page">
    <view class="header">
      <text class="page-title">成长PK</text>
      <button class="create-btn" @click="showCreateModal = true">发起挑战</button>
    </view>

    <view class="tab-section">
      <view class="tab" :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'">
        进行中
      </view>
      <view class="tab" :class="{ active: activeTab === 'my-challenges' }" @click="activeTab = 'my-challenges'">
        我的挑战
      </view>
      <view class="tab" :class="{ active: activeTab === 'weekly' }" @click="activeTab = 'weekly'">
        周排行
      </view>
    </view>

    <view class="content-section">
      <!-- 进行中挑战 -->
      <view v-if="activeTab === 'active'">
        <view v-if="activeChallenges.length === 0" class="empty-state">
          <text class="empty-icon">🏆</text>
          <text class="empty-text">暂无可参与的挑战</text>
          <button class="action-btn" @click="showCreateModal = true">发起挑战</button>
        </view>
        <view v-else class="challenge-list">
          <view v-for="challenge in activeChallenges" :key="challenge.id" class="challenge-wrapper">
            <challenge-card
              :challenge="challenge"
              :my-progress="getMyProgress(challenge.id)"
              :participant-count="getParticipantCount(challenge.id)"
              :top-participants="getTopParticipants(challenge.id)"
              :show-leaderboard="true"
              @click="openChallengeDetail"
            />
            <button
              v-if="!isJoined(challenge.id)"
              class="join-challenge-btn"
              @click="joinChallenge(challenge.id)"
            >
              加入挑战
            </button>
          </view>
        </view>
      </view>

      <!-- 我的挑战 -->
      <view v-if="activeTab === 'my-challenges'">
        <view v-if="myParticipations.length === 0" class="empty-state">
          <text class="empty-icon">📋</text>
          <text class="empty-text">还没有参与过任何挑战</text>
        </view>
        <view v-else class="challenge-list">
          <view v-for="p in myParticipations" :key="p.id" class="my-challenge-item">
            <view class="challenge-info">
              <text class="challenge-name">{{ getChallengeName(p.challenge_id) }}</text>
              <text class="challenge-rank">当前排名: 第{{ p.rank }}名</text>
            </view>
            <view class="challenge-progress">
              <text class="progress-text">{{ p.current_value }} / {{ getChallengeTarget(p.challenge_id) }}</text>
              <view class="progress-bar">
                <view
                  class="progress-fill"
                  :style="{ width: getChallengeProgress(p) + '%' }"
                ></view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 周排行 -->
      <view v-if="activeTab === 'weekly'">
        <view v-if="weeklyChallenges.length === 0" class="empty-state">
          <text class="empty-icon">📊</text>
          <text class="empty-text">本周暂无挑战数据</text>
        </view>
        <view v-else class="weekly-leaderboard">
          <view v-for="(item, index) in weeklyLeaderboard" :key="item.baby_id" class="leader-item">
            <view class="rank-badge" :class="'rank-' + (index + 1)">
              <text>{{ index + 1 }}</text>
            </view>
            <text class="leader-emoji">{{ getBabyEmoji(item.baby_id) }}</text>
            <text class="leader-name">{{ getBabyName(item.baby_id) }}</text>
            <text class="leader-points">{{ item.total_value }}分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 创建挑战弹窗 -->
    <view class="create-modal" v-if="showCreateModal" @click="showCreateModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">发起挑战</text>

        <view class="form-item">
          <text class="label">挑战名称</text>
          <input v-model="newChallenge.name" class="input" placeholder="给挑战起个名字" />
        </view>

        <view class="form-item">
          <text class="label">挑战类型</text>
          <view class="type-select">
            <view
              class="type-item"
              :class="{ active: newChallenge.type === 'task_count' }"
              @click="newChallenge.type = 'task_count'"
            >
              任务数
            </view>
            <view
              class="type-item"
              :class="{ active: newChallenge.type === 'points' }"
              @click="newChallenge.type = 'points'"
            >
              积分数
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="label">目标值</text>
          <input
            type="number"
            v-model="newChallenge.target_value"
            class="input"
            placeholder="挑战目标"
          />
        </view>

        <view class="form-item">
          <text class="label">挑战周期</text>
          <view class="duration-select">
            <view
              v-for="d in [3, 7, 14]"
              :key="d"
              class="duration-item"
              :class="{ active: newChallenge.duration === d }"
              @click="newChallenge.duration = d"
            >
              {{ d }}天
            </view>
          </view>
        </view>

        <view class="modal-actions">
          <button class="cancel-btn" @click="showCreateModal = false">取消</button>
          <button class="confirm-btn" @click="createChallenge">发起</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useChallengeStore } from '@/stores/challengeStore'
import { useBabyStore } from '@/stores/babyStore'
import { usePointsStore } from '@/stores/pointsStore'
import challengeCard from '@/components/social/challenge-card.vue'

const challengeStore = useChallengeStore()
const babyStore = useBabyStore()
const pointsStore = usePointsStore()

const activeTab = ref('active')
const showCreateModal = ref(false)

const newChallenge = reactive({
  name: '',
  type: 'task_count',
  target_value: 10,
  duration: 7
})

const activeChallenges = computed(() => challengeStore.activeChallenges)
const myParticipations = computed(() => challengeStore.myParticipations)
const weeklyChallenges = computed(() => challengeStore.getWeeklyChallenges())

const getMyProgress = (challengeId) => {
  const p = challengeStore.getMyProgress(challengeId)
  return p?.current_value || 0
}

const getParticipantCount = (challengeId) => {
  return challengeStore.participants.filter(p => p.challenge_id === challengeId).length
}

const getTopParticipants = (challengeId) => {
  return challengeStore.getLeaderboard(challengeId).slice(0, 3)
}

const isJoined = (challengeId) => {
  const babyId = babyStore.currentBabyId
  return challengeStore.participants.some(
    p => p.challenge_id === challengeId && p.baby_id === babyId
  )
}

const getChallengeName = (challengeId) => {
  const c = challengeStore.getChallengeById(challengeId)
  return c?.name || '挑战'
}

const getChallengeTarget = (challengeId) => {
  const c = challengeStore.getChallengeById(challengeId)
  return c?.target_value || 0
}

const getChallengeProgress = (participation) => {
  const c = challengeStore.getChallengeById(participation.challenge_id)
  if (!c) return 0
  return Math.min(100, (participation.current_value / c.target_value) * 100)
}

const weeklyLeaderboard = computed(() => {
  const result = []
  const babyPoints = {}

  weeklyChallenges.value.forEach(c => {
    const participants = challengeStore.participants.filter(p => p.challenge_id === c.id)
    participants.forEach(p => {
      if (!babyPoints[p.baby_id]) {
        babyPoints[p.baby_id] = 0
      }
      babyPoints[p.baby_id] += p.current_value
    })
  })

  Object.entries(babyPoints).forEach(([baby_id, total_value]) => {
    result.push({ baby_id, total_value })
  })

  return result.sort((a, b) => b.total_value - a.total_value)
})

const getBabyEmoji = (babyId) => {
  const emojis = ['👶', '👼', '🧒', '👦', '👧']
  const index = babyId ? babyId.charCodeAt(0) % 5 : 0
  return emojis[index]
}

const getBabyName = (babyId) => {
  const baby = babyStore.babies.find(b => b.id === babyId)
  return baby?.name || '神秘小伙伴'
}

const joinChallenge = (challengeId) => {
  challengeStore.joinChallenge(challengeId)
  uni.showToast({ title: '加入成功', icon: 'success' })
}

const createChallenge = () => {
  if (!newChallenge.name.trim()) {
    uni.showToast({ title: '请输入挑战名称', icon: 'none' })
    return
  }

  const challenge = challengeStore.createChallenge(
    newChallenge.name,
    newChallenge.type,
    newChallenge.target_value,
    newChallenge.duration
  )

  challengeStore.joinChallenge(challenge.id)

  showCreateModal.value = false
  Object.assign(newChallenge, { name: '', type: 'task_count', target_value: 10, duration: 7 })

  uni.showToast({ title: '挑战创建成功', icon: 'success' })
}

const openChallengeDetail = (challenge) => {
  // Navigate to challenge detail page or show modal
}

onMounted(() => {
  challengeStore.init()
})
</script>

<style scoped>
.challenge-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
}

.create-btn {
  font-size: 26rpx;
  padding: 12rpx 24rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 30rpx;
  border: none;
}

.tab-section {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  font-size: 28rpx;
  color: #666;
  border-radius: 12rpx;
}

.tab.active {
  background: #8477fa;
  color: #fff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 32rpx;
}

.action-btn {
  font-size: 28rpx;
  padding: 20rpx 48rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 40rpx;
  border: none;
}

.challenge-wrapper {
  margin-bottom: 16rpx;
}

.join-challenge-btn {
  width: 100%;
  height: 72rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 36rpx;
  font-size: 28rpx;
  border: none;
  margin-top: -8rpx;
}

.my-challenge-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.challenge-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.challenge-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.challenge-rank {
  font-size: 24rpx;
  color: #8477fa;
  background: rgba(132, 119, 250, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

.challenge-progress {
  margin-top: 12rpx;
}

.progress-text {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.progress-bar {
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8477fa, #a599fa);
  border-radius: 6rpx;
}

.weekly-leaderboard {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.leader-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.leader-item:last-child {
  border-bottom: none;
}

.rank-badge {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ccc;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  margin-right: 16rpx;
}

.rank-badge.rank-1 {
  background: #ffd700;
}

.rank-badge.rank-2 {
  background: #c0c0c0;
}

.rank-badge.rank-3 {
  background: #cd7f32;
}

.leader-emoji {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.leader-name {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.leader-points {
  font-size: 28rpx;
  font-weight: 600;
  color: #8477fa;
}

.create-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
  display: block;
  margin-bottom: 32rpx;
  text-align: center;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-item .label {
  font-size: 26rpx;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.type-select,
.duration-select {
  display: flex;
  gap: 16rpx;
}

.type-item,
.duration-item {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666;
}

.type-item.active,
.duration-item.active {
  background: #8477fa;
  color: #fff;
}

.modal-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  font-size: 32rpx;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: #8477fa;
  color: #fff;
}
</style>
