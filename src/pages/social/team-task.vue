<template>
  <view class="team-task-page">
    <view class="header">
      <text class="page-title">组队任务</text>
      <button class="create-btn" @click="showCreateModal = true">创建队伍</button>
    </view>

    <view class="tab-section">
      <view class="tab" :class="{ active: activeTab === 'my-team' }" @click="activeTab = 'my-team'">
        我的队伍
      </view>
      <view class="tab" :class="{ active: activeTab === 'join' }" @click="activeTab = 'join'">
        加入队伍
      </view>
    </view>

    <view class="content-section">
      <!-- 我的队伍 -->
      <view v-if="activeTab === 'my-team'" class="my-team-section">
        <view v-if="!myTeam" class="empty-state">
          <text class="empty-icon">👥</text>
          <text class="empty-text">还没有加入任何队伍</text>
          <button class="action-btn" @click="activeTab = 'join'">加入队伍</button>
        </view>

        <view v-else class="team-card">
          <view class="team-header">
            <text class="team-name">{{ myTeam.name }}</text>
            <text class="team-status" :class="myTeam.status">{{ statusText }}</text>
          </view>

          <view class="team-progress">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: teamProgressPercent + '%' }"></view>
            </view>
            <text class="progress-text">{{ myTeam.current_progress || 0 }} / {{ myTeam.total_points }} 积分</text>
          </view>

          <view class="team-description" v-if="myTeam.description">
            {{ myTeam.description }}
          </view>

          <view class="team-time">
            <text>时间: {{ formatDate(myTeam.start_date) }} - {{ formatDate(myTeam.end_date) }}</text>
          </view>

          <view class="members-section">
            <text class="section-label">队员 ({{ myTeamMembers.length }}/{{ myTeam.member_count }})</text>
            <view class="member-list">
              <view v-for="member in myTeamMembers" :key="member.id" class="member-item">
                <text class="emoji">{{ getMemberEmoji(member) }}</text>
                <text class="member-name">{{ getMemberName(member) }}</text>
                <text class="contribution">{{ member.contribution }}分</text>
              </view>
            </view>
          </view>

          <view class="team-actions" v-if="myTeam.status === 'active'">
            <button class="leave-btn" @click="leaveTeam">退出队伍</button>
          </view>
        </view>
      </view>

      <!-- 加入队伍 -->
      <view v-if="activeTab === 'join'" class="join-section">
        <view v-if="availableTeams.length === 0" class="empty-state">
          <text class="empty-icon">🔍</text>
          <text class="empty-text">暂无可加入的队伍</text>
        </view>

        <view v-else class="team-list">
          <view v-for="team in availableTeams" :key="team.id" class="team-item">
            <view class="team-info">
              <text class="team-name">{{ team.name }}</text>
              <text class="team-meta">{{ team.member_count }}人队伍 | {{ team.status }}</text>
            </view>
            <view class="team-points">
              <text class="total-points">{{ team.total_points }}分</text>
              <button class="join-btn" @click="joinTeam(team.id)">加入</button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 创建队伍弹窗 -->
    <view class="create-modal" v-if="showCreateModal" @click="showCreateModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">创建队伍</text>

        <view class="form-item">
          <text class="label">队伍名称</text>
          <input v-model="newTeam.name" class="input" placeholder="给队伍起个名字" />
        </view>

        <view class="form-item">
          <text class="label">队伍描述</text>
          <textarea v-model="newTeam.description" class="textarea" placeholder="描述队伍任务..." />
        </view>

        <view class="form-item">
          <text class="label">队伍人数</text>
          <view class="count-select">
            <view
              v-for="n in [2, 3, 4]"
              :key="n"
              class="count-item"
              :class="{ active: newTeam.member_count === n }"
              @click="newTeam.member_count = n"
            >
              {{ n }}人
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="label">任务周期</text>
          <view class="count-select">
            <view
              v-for="d in [3, 7, 14]"
              :key="d"
              class="count-item"
              :class="{ active: newTeam.duration === d }"
              @click="newTeam.duration = d"
            >
              {{ d }}天
            </view>
          </view>
        </view>

        <view class="modal-actions">
          <button class="cancel-btn" @click="showCreateModal = false">取消</button>
          <button class="confirm-btn" @click="createTeam">创建</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useBabyStore } from '@/stores/babyStore'

const babyStore = useBabyStore()

const activeTab = ref('my-team')
const showCreateModal = ref(false)
const teams = ref([])
const teamMembers = ref([])

const newTeam = reactive({
  name: '',
  description: '',
  member_count: 3,
  duration: 7
})

const myTeam = computed(() => {
  const babyId = babyStore.currentBabyId
  const membership = teamMembers.value.find(m => m.baby_id === babyId)
  if (!membership) return null
  return teams.value.find(t => t.id === membership.team_id)
})

const myTeamMembers = computed(() => {
  if (!myTeam.value) return []
  return teamMembers.value.filter(m => m.team_id === myTeam.value.id)
})

const availableTeams = computed(() => {
  return teams.value.filter(t => {
    if (t.status !== 'recruiting') return false
    const members = teamMembers.value.filter(m => m.team_id === t.id)
    if (members.length >= t.member_count) return false
    const hasMe = members.some(m => m.baby_id === babyStore.currentBabyId)
    return !hasMe
  })
})

const statusText = computed(() => {
  const map = {
    recruiting: '招募中',
    active: '进行中',
    completed: '已完成'
  }
  return map[myTeam.value?.status] || ''
})

const teamProgressPercent = computed(() => {
  if (!myTeam.value || !myTeam.value.total_points) return 0
  return Math.min(100, ((myTeam.value.current_progress || 0) / myTeam.value.total_points) * 100)
})

const getMemberEmoji = (member) => {
  const emojis = ['👶', '👼', '🧒', '👦', '👧']
  const index = member.baby_id ? member.baby_id.charCodeAt(0) % 5 : 0
  return emojis[index]
}

const getMemberName = (member) => {
  const baby = babyStore.babies.find(b => b.id === member.baby_id)
  return baby?.name || '神秘小伙伴'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const loadTeams = () => {
  try {
    const stored = uni.getStorageSync('social_teams')
    if (stored) teams.value = JSON.parse(stored)
    const members = uni.getStorageSync('social_team_members')
    if (members) teamMembers.value = JSON.parse(members)
  } catch (e) {
    console.error('加载队伍失败:', e)
  }
}

const saveTeams = () => {
  uni.setStorageSync('social_teams', JSON.stringify(teams.value))
}

const saveTeamMembers = () => {
  uni.setStorageSync('social_team_members', JSON.stringify(teamMembers.value))
}

const createTeam = () => {
  if (!newTeam.name.trim()) {
    uni.showToast({ title: '请输入队伍名称', icon: 'none' })
    return
  }

  const now = new Date()
  const endDate = new Date(now.getTime() + newTeam.duration * 24 * 60 * 60 * 1000)

  const team = {
    id: uuidv4(),
    name: newTeam.name,
    description: newTeam.description,
    total_points: 0,
    member_count: newTeam.member_count,
    current_progress: 0,
    status: 'recruiting',
    start_date: now.toISOString(),
    end_date: endDate.toISOString(),
    created_at: now.toISOString()
  }

  const membership = {
    id: uuidv4(),
    team_id: team.id,
    baby_id: babyStore.currentBabyId,
    contribution: 0,
    joined_at: now.toISOString()
  }

  teams.value.push(team)
  teamMembers.value.push(membership)
  saveTeams()
  saveTeamMembers()

  showCreateModal.value = false
  Object.assign(newTeam, { name: '', description: '', member_count: 3, duration: 7 })

  uni.showToast({ title: '队伍创建成功', icon: 'success' })
  activeTab.value = 'my-team'
}

const joinTeam = (teamId) => {
  const existing = teamMembers.value.find(
    m => m.team_id === teamId && m.baby_id === babyStore.currentBabyId
  )
  if (existing) {
    uni.showToast({ title: '已在队伍中', icon: 'none' })
    return
  }

  const team = teams.value.find(t => t.id === teamId)
  if (!team) return

  const members = teamMembers.value.filter(m => m.team_id === teamId)
  if (members.length >= team.member_count) {
    uni.showToast({ title: '队伍已满', icon: 'none' })
    return
  }

  const membership = {
    id: uuidv4(),
    team_id: teamId,
    baby_id: babyStore.currentBabyId,
    contribution: 0,
    joined_at: new Date().toISOString()
  }

  teamMembers.value.push(membership)
  saveTeamMembers()

  if (members.length + 1 >= team.member_count) {
    team.status = 'active'
    saveTeams()
  }

  uni.showToast({ title: '加入成功', icon: 'success' })
  activeTab.value = 'my-team'
}

const leaveTeam = () => {
  if (!myTeam.value) return

  teamMembers.value = teamMembers.value.filter(
    m => !(m.team_id === myTeam.value.id && m.baby_id === babyStore.currentBabyId)
  )
  saveTeamMembers()

  const remaining = teamMembers.value.filter(m => m.team_id === myTeam.value.id)
  if (remaining.length === 0) {
    teams.value = teams.value.filter(t => t.id !== myTeam.value.id)
  }
  saveTeams()

  uni.showToast({ title: '已退出队伍', icon: 'success' })
}

onMounted(() => {
  loadTeams()
})
</script>

<style scoped>
.team-task-page {
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

.team-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.team-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

.team-status {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

.team-status.recruiting {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.team-status.active {
  background: rgba(132, 119, 250, 0.1);
  color: #8477fa;
}

.team-status.completed {
  background: rgba(81, 207, 102, 0.1);
  color: #51cf66;
}

.team-progress {
  margin-bottom: 20rpx;
}

.progress-bar {
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8477fa, #a599fa);
  border-radius: 8rpx;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
  text-align: right;
}

.team-description {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.team-time {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 24rpx;
}

.members-section {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
}

.section-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
}

.member-item .emoji {
  font-size: 40rpx;
}

.member-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.contribution {
  font-size: 24rpx;
  color: #8477fa;
}

.team-actions {
  margin-top: 24rpx;
}

.leave-btn {
  width: 100%;
  height: 80rpx;
  background: #fff;
  color: #ff6b6b;
  border: 1rpx solid #ff6b6b;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.team-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.team-info {
  flex: 1;
}

.team-info .team-name {
  font-size: 30rpx;
  display: block;
  margin-bottom: 8rpx;
}

.team-meta {
  font-size: 22rpx;
  color: #999;
}

.team-points {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.total-points {
  font-size: 28rpx;
  font-weight: 600;
  color: #8477fa;
}

.join-btn {
  font-size: 24rpx;
  padding: 12rpx 24rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 8rpx;
  border: none;
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

.textarea {
  width: 100%;
  height: 160rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
}

.count-select {
  display: flex;
  gap: 16rpx;
}

.count-item {
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

.count-item.active {
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
