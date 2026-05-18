<template>
  <view class="sports-challenges-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">运动挑战</text>
      <view class="header-actions">
        <button class="btn-create" @click="showCreateTeamModal = true">+ 创建队伍</button>
      </view>
    </view>

    <!-- 标签切换 -->
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'events' }"
        @click="currentTab = 'events'"
      >
        <text>运动会</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'teams' }"
        @click="currentTab = 'teams'"
      >
        <text>组队挑战</text>
      </view>
    </view>

    <!-- 运动会列表 -->
    <view v-if="currentTab === 'events'" class="events-section">
      <!-- 即将开始 -->
      <view class="subsection">
        <view class="subsection-header">
          <text class="subsection-title">🔥 即将开始</text>
        </view>
        <view v-if="upcomingEvents.length === 0" class="empty-hint">
          <text>暂无即将开始的运动会</text>
        </view>
        <view v-else class="events-list">
          <view 
            v-for="event in upcomingEvents" 
            :key="event.id"
            class="event-card"
            :class="{ joined: event.isJoined }"
          >
            <view class="event-header">
              <view class="event-badge" :class="event.type">
                {{ getEventTypeName(event.type) }}
              </view>
              <text class="event-date">{{ formatDateRange(event.startDate, event.endDate) }}</text>
            </view>
            
            <text class="event-name">{{ event.name }}</text>
            <text class="event-desc">{{ event.description }}</text>
            
            <view class="event-info">
              <view class="info-item">
                <text class="info-icon">👥</text>
                <text class="info-text">{{ event.participantCount }}/{{ event.maxParticipants }}</text>
              </view>
              <view class="info-item">
                <text class="info-icon">⭐</text>
                <text class="info-text">{{ event.points }}积分</text>
              </view>
            </view>
            
            <view class="event-projects">
              <text class="projects-label">项目:</text>
              <text class="projects-list">{{ event.events.join('、') }}</text>
            </view>
            
            <view class="event-actions">
              <button 
                v-if="!event.isJoined" 
                class="btn-join"
                :disabled="event.participantCount >= event.maxParticipants"
                @click="handleJoinEvent(event.id)"
              >
                {{ event.participantCount >= event.maxParticipants ? '已满员' : '报名参加' }}
              </button>
              <text v-else class="joined-tag">✓ 已报名</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 已结束 -->
      <view class="subsection">
        <view class="subsection-header">
          <text class="subsection-title">📋 已结束</text>
        </view>
        <view v-if="endedEvents.length === 0" class="empty-hint">
          <text>暂无已结束的运动会</text>
        </view>
        <view v-else class="events-list">
          <view 
            v-for="event in endedEvents" 
            :key="event.id"
            class="event-card ended"
          >
            <view class="event-header">
              <view class="event-badge grey">已结束</view>
              <text class="event-date">{{ formatDateRange(event.startDate, event.endDate) }}</text>
            </view>
            
            <text class="event-name">{{ event.name }}</text>
            
            <view v-if="event.myResult" class="my-result">
              <text class="result-label">我的成绩:</text>
              <text class="result-value">第{{ event.myResult.rank }}名 · {{ event.myResult.score }}分</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 组队挑战列表 -->
    <view v-if="currentTab === 'teams'" class="teams-section">
      <!-- 我的队伍 -->
      <view class="subsection">
        <view class="subsection-header">
          <text class="subsection-title">👥 我的队伍</text>
        </view>
        <view v-if="myTeams.length === 0" class="empty-hint">
          <text>还没有加入任何队伍</text>
          <text class="hint-sub">可以创建新队伍或加入已有队伍</text>
        </view>
        <view v-else class="teams-list">
          <view 
            v-for="team in myTeams" 
            :key="team.id"
            class="team-card"
            @click="goToTeamDetail(team)"
          >
            <view class="team-header">
              <text class="team-name">{{ team.name }}</text>
              <view class="team-status" :class="team.status">{{ team.status === 'active' ? '进行中' : '已结束' }}</view>
            </view>
            
            <view class="team-leader">
              <text class="leader-label">队长:</text>
              <text class="leader-name">{{ team.leaderName }}</text>
            </view>
            
            <view class="team-members">
              <text>👥 {{ team.memberCount }}/{{ team.maxMembers }}人</text>
              <text class="member-sep">|</text>
              <text>⭐ {{ team.totalPoints }}积分</text>
            </view>
            
            <view class="team-weekly">
              <text class="weekly-label">本周进度:</text>
              <view class="weekly-progress">
                <view class="progress-bar">
                  <view 
                    class="progress-fill" 
                    :style="{ width: getWeeklyProgress(team) + '%' }"
                  ></view>
                </view>
                <text class="progress-text">{{ team.weeklyProgress }}/{{ team.weeklyGoal }}</text>
              </view>
            </view>
            
            <view v-if="team.challenges.length > 0" class="team-challenges">
              <view 
                v-for="ch in team.challenges" 
                :key="ch.id"
                class="challenge-item"
              >
                <text class="challenge-name">{{ ch.name }}</text>
                <text class="challenge-progress">{{ ch.current }}/{{ ch.target }}{{ ch.unit }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 推荐队伍 -->
      <view class="subsection">
        <view class="subsection-header">
          <text class="subsection-title">🌟 推荐队伍</text>
        </view>
        <view v-if="recommendedTeams.length === 0" class="empty-hint">
          <text>暂无推荐队伍</text>
        </view>
        <view v-else class="teams-list">
          <view 
            v-for="team in recommendedTeams" 
            :key="team.id"
            class="team-card recommend"
          >
            <view class="team-header">
              <text class="team-name">{{ team.name }}</text>
              <text class="team-rank">🏆 Top {{ getTeamRank(team) }}</text>
            </view>
            
            <view class="team-leader">
              <text class="leader-label">队长:</text>
              <text class="leader-name">{{ team.leaderName }}</text>
            </view>
            
            <view class="team-members">
              <text>👥 {{ team.memberCount }}/{{ team.maxMembers }}人</text>
              <text class="member-sep">|</text>
              <text>⭐ {{ team.totalPoints }}积分</text>
            </view>
            
            <view class="team-actions">
              <button 
                class="btn-join-team"
                :disabled="team.memberCount >= team.maxMembers"
                @click.stop="handleJoinTeam(team.id)"
              >
                {{ team.memberCount >= team.maxMembers ? '已满' : '加入' }}
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 创建队伍弹窗 -->
    <view v-if="showCreateTeamModal" class="modal-overlay" @click="showCreateTeamModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">创建队伍</text>
          <text class="modal-close" @click="showCreateTeamModal = false">✕</text>
        </view>
        
        <view class="modal-body">
          <view class="form-group">
            <text class="form-label">队伍名称</text>
            <input 
              class="form-input" 
              v-model="newTeam.name" 
              placeholder="给队伍起个名字"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">队伍规模</text>
            <view class="size-options">
              <view 
                v-for="size in teamSizes" 
                :key="size.value"
                class="size-item"
                :class="{ active: newTeam.maxMembers === size.value }"
                @click="newTeam.maxMembers = size.value"
              >
                {{ size.label }}
              </view>
            </view>
          </view>
          
          <view class="form-group">
            <text class="form-label">每周目标积分</text>
            <input 
              class="form-input" 
              type="number" 
              v-model="newTeam.weeklyGoal" 
              placeholder="如: 300"
            />
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="btn-cancel" @click="showCreateTeamModal = false">取消</button>
          <button class="btn-confirm" @click="handleCreateTeam">创建</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useActivityTrackerStore } from '@/stores/activityTrackerStore.js'

const store = useActivityTrackerStore()

// Tab 状态
const currentTab = ref('events')

// 弹窗状态
const showCreateTeamModal = ref(false)

// 新队伍表单
const newTeam = reactive({
  name: '',
  maxMembers: 5,
  weeklyGoal: 300
})

// 队伍规模选项
const teamSizes = [
  { label: '3人', value: 3 },
  { label: '5人', value: 5 },
  { label: '8人', value: 8 },
  { label: '10人', value: 10 }
]

// 运动会相关计算
const upcomingEvents = computed(() => store.sportsEvents.filter(e => e.status === 'upcoming'))
const endedEvents = computed(() => store.sportsEvents.filter(e => e.status === 'ended'))

// 队伍相关计算
const myTeams = computed(() => store.challengeTeams.filter(t => t.isJoined))
const recommendedTeams = computed(() => {
  return store.challengeTeams
    .filter(t => !t.isJoined && t.memberCount < t.maxMembers)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5)
})

// 获取事件类型名称
const getEventTypeName = (type) => {
  const names = {
    sports_day: '运动会',
    parent_child: '亲子',
    competition: '竞赛'
  }
  return names[type] || '活动'
}

// 格式化日期范围
const formatDateRange = (start, end) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const startStr = `${startDate.getMonth() + 1}/${startDate.getDate()}`
  if (start === end) return startStr
  const endStr = `${endDate.getMonth() + 1}/${endDate.getDate()}`
  return `${startStr} - ${endStr}`
}

// 获取周进度
const getWeeklyProgress = (team) => {
  if (!team.weeklyGoal) return 0
  return Math.min(100, Math.round((team.weeklyProgress / team.weeklyGoal) * 100))
}

// 获取队伍排名
const getTeamRank = (team) => {
  const sorted = [...store.challengeTeams].sort((a, b) => b.totalPoints - a.totalPoints)
  const index = sorted.findIndex(t => t.id === team.id)
  return index + 1
}

// 加入运动会
const handleJoinEvent = (eventId) => {
  const success = store.joinSportsEvent(eventId)
  if (success) {
    uni.showToast({ title: '报名成功!', icon: 'success' })
  }
}

// 创建队伍
const handleCreateTeam = () => {
  if (!newTeam.name) {
    uni.showToast({ title: '请输入队伍名称', icon: 'none' })
    return
  }
  
  const team = store.createChallengeTeam({
    name: newTeam.name,
    maxMembers: newTeam.maxMembers,
    weeklyGoal: parseInt(newTeam.weeklyGoal) || 300
  })
  
  if (team) {
    uni.showToast({ title: '队伍创建成功!', icon: 'success' })
    showCreateTeamModal.value = false
    newTeam.name = ''
    newTeam.maxMembers = 5
    newTeam.weeklyGoal = 300
  }
}

// 加入队伍
const handleJoinTeam = (teamId) => {
  const success = store.joinChallengeTeam(teamId)
  if (success) {
    uni.showToast({ title: '加入成功!', icon: 'success' })
  }
}

// 跳转到队伍详情
const goToTeamDetail = (team) => {
  // 可以导航到队伍详情页
  console.log('Go to team detail:', team.id)
}

// 初始化
store.init()
</script>

<style scoped>
.sports-challenges-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 32rpx 24rpx;
  background-color: #fff;
}

.page-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
}

.btn-create {
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-radius: 32rpx;
  font-size: 28rpx;
  border: none;
}

/* Tab栏 */
.tab-bar {
  display: flex;
  background: #fff;
  padding: 0 32rpx;
  border-bottom: 1px solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 30rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #667eea;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 6rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 3rpx;
}

/* 区块 */
.subsection {
  margin: 24rpx 32rpx;
}

.subsection-header {
  margin-bottom: 20rpx;
}

.subsection-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

/* 空状态 */
.empty-hint {
  text-align: center;
  padding: 40rpx 0;
  background: #fff;
  border-radius: 16rpx;
}

.empty-hint text {
  display: block;
  font-size: 28rpx;
  color: #999;
}

.hint-sub {
  font-size: 24rpx !important;
  margin-top: 8rpx;
}

/* 运动会卡片 */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.event-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  border: 2px solid transparent;
}

.event-card.joined {
  border-color: #667eea;
}

.event-card.ended {
  opacity: 0.7;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.event-badge {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  background: #FFE4B5;
  color: #8B4513;
}

.event-badge.sports_day {
  background: #E6F3FF;
  color: #1890FF;
}

.event-badge.parent_child {
  background: #F0FFF0;
  color: #52C41A;
}

.event-badge.competition {
  background: #FFF0F0;
  color: #FF4D4F;
}

.event-badge.grey {
  background: #f5f5f5;
  color: #999;
}

.event-date {
  font-size: 24rpx;
  color: #999;
}

.event-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.event-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
}

.event-info {
  display: flex;
  gap: 32rpx;
  margin-bottom: 12rpx;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.info-icon {
  font-size: 28rpx;
}

.info-text {
  font-size: 26rpx;
  color: #666;
}

.event-projects {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.projects-label {
  margin-right: 8rpx;
}

.event-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-join {
  padding: 12rpx 32rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-radius: 24rpx;
  font-size: 26rpx;
  border: none;
}

.btn-join[disabled] {
  background: #ccc;
}

.joined-tag {
  color: #667eea;
  font-size: 28rpx;
}

.my-result {
  margin-top: 12rpx;
  padding: 12rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
}

.result-label {
  font-size: 24rpx;
  color: #999;
}

.result-value {
  font-size: 26rpx;
  color: #FF6B6B;
  font-weight: 600;
}

/* 队伍卡片 */
.teams-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
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
  margin-bottom: 12rpx;
}

.team-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.team-status {
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
}

.team-status.active {
  background: #E6F3FF;
  color: #1890FF;
}

.team-rank {
  font-size: 24rpx;
  color: #FF6B6B;
}

.team-leader {
  margin-bottom: 8rpx;
}

.leader-label {
  font-size: 24rpx;
  color: #999;
  margin-right: 8rpx;
}

.leader-name {
  font-size: 26rpx;
  color: #666;
}

.team-members {
  display: flex;
  gap: 16rpx;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.member-sep {
  color: #ddd;
}

.team-weekly {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.weekly-label {
  font-size: 24rpx;
  color: #999;
  flex-shrink: 0;
}

.weekly-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.progress-bar {
  flex: 1;
  height: 12rpx;
  background: #eee;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 6rpx;
  transition: width 0.3s;
}

.progress-text {
  font-size: 22rpx;
  color: #666;
  flex-shrink: 0;
}

.team-challenges {
  background: #f8f8f8;
  border-radius: 8rpx;
  padding: 12rpx;
}

.challenge-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 0;
}

.challenge-item:not(:last-child) {
  border-bottom: 1px solid #eee;
}

.challenge-name {
  font-size: 24rpx;
  color: #666;
}

.challenge-progress {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 600;
}

.team-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12rpx;
}

.btn-join-team {
  padding: 10rpx 28rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-radius: 20rpx;
  font-size: 24rpx;
  border: none;
}

.btn-join-team[disabled] {
  background: #ccc;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-content {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.modal-body {
  padding: 32rpx;
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  border-top: 1px solid #eee;
}

.btn-cancel {
  flex: 1;
  padding: 24rpx 0;
  background: #f5f5f5;
  color: #666;
  border-radius: 12rpx;
  border: none;
  font-size: 30rpx;
}

.btn-confirm {
  flex: 1;
  padding: 24rpx 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-radius: 12rpx;
  border: none;
  font-size: 30rpx;
}

/* 表单 */
.form-group {
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  padding: 20rpx 24rpx;
  border: 1px solid #ddd;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.size-options {
  display: flex;
  gap: 16rpx;
}

.size-item {
  flex: 1;
  padding: 16rpx 0;
  text-align: center;
  border: 2px solid #eee;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #666;
}

.size-item.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}
</style>
