<template>
  <view class="parent-child-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">亲子挑战</text>
      <button class="create-btn" @click="showCreateModal = true">发起挑战</button>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-section">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.name }}
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-section">
      <!-- 亲子组队 -->
      <view v-if="activeTab === 'teams'" class="teams-section">
        <view v-if="myTeams.length === 0" class="empty-state">
          <text class="empty-icon">👨‍👩‍👧‍👦</text>
          <text class="empty-text">还没有组建亲子队伍</text>
          <button class="action-btn" @click="showCreateTeamModal = true">创建队伍</button>
        </view>
        <view v-else class="team-list">
          <view v-for="team in myTeams" :key="team.id" class="team-card" @click="selectTeam(team)">
            <view class="team-header">
              <text class="team-name">{{ team.name }}</text>
              <text class="team-status" :class="team.status">{{ team.status === 'active' ? '进行中' : '已解散' }}</text>
            </view>
            <view class="team-members">
              <view v-for="member in getTeamMembers(team.id)" :key="member.id" class="member-item">
                <text class="member-avatar">{{ getMemberEmoji(member.id) }}</text>
                <text class="member-name">{{ member.name }}</text>
              </view>
            </view>
            <view class="team-stats">
              <view class="stat-item">
                <text class="stat-value">{{ team.taskCount }}</text>
                <text class="stat-label">任务数</text>
              </view>
              <view class="stat-item">
                <text class="stat-value">{{ team.completedTaskCount }}</text>
                <text class="stat-label">已完成</text>
              </view>
              <view class="stat-item">
                <text class="stat-value">{{ team.totalBondEarned }}</text>
                <text class="stat-label">羁绊值</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 协作任务 -->
      <view v-if="activeTab === 'tasks'" class="tasks-section">
        <view v-if="myActiveTasks.length === 0" class="empty-state">
          <text class="empty-icon">📋</text>
          <text class="empty-text">暂无进行中的协作任务</text>
          <button class="action-btn" @click="showCreateTaskModal = true">创建任务</button>
        </view>
        <view v-else class="task-list">
          <view v-for="task in myActiveTasks" :key="task.id" class="task-card">
            <view class="task-header">
              <text class="task-title">{{ task.title }}</text>
              <text class="task-category">{{ getCategoryName(task.category) }}</text>
            </view>
            <view class="task-progress">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: getTaskProgress(task) + '%' }"></view>
              </view>
              <text class="progress-text">{{ task.currentProgress }} / {{ task.targetValue }}</text>
            </view>
            <view class="task-members">
              <view v-for="(contribution, memberId) in task.contributions" :key="memberId" class="member-progress">
                <text class="member-name">{{ getMemberName(memberId) }}</text>
                <text class="member-value">{{ contribution }}</text>
              </view>
            </view>
            <view class="task-rewards">
              <text class="reward-item">⭐ {{ task.pointsReward }}积分</text>
              <text class="reward-item">💕 {{ task.bondReward }}羁绊</text>
            </view>
            <button class="contribute-btn" @click="showContributeModal(task)">贡献进度</button>
          </view>
        </view>
      </view>

      <!-- 家庭竞赛 -->
      <view v-if="activeTab === 'battles'" class="battles-section">
        <view v-if="activeBattles.length === 0" class="empty-state">
          <text class="empty-icon">🏆</text>
          <text class="empty-text">暂无可参与的家庭竞赛</text>
          <button class="action-btn" @click="showCreateBattleModal = true">发起竞赛</button>
        </view>
        <view v-else class="battle-list">
          <view v-for="battle in activeBattles" :key="battle.id" class="battle-card">
            <view class="battle-header">
              <text class="battle-title">{{ battle.title }}</text>
              <text class="battle-category">{{ getBattleCategoryName(battle.category) }}</text>
            </view>
            <view class="battle-timer">
              <text class="timer-label">剩余时间</text>
              <text class="timer-value">{{ getRemainingTime(battle.endTime) }}</text>
            </view>
            <view class="battle-scores">
              <view v-for="(score, babyId) in battle.scores" :key="babyId" class="score-item">
                <text class="score-rank">{{ getBattleRank(battle.id, babyId) }}</text>
                <text class="score-name">{{ getMemberName(babyId) }}</text>
                <text class="score-value">{{ score }}分</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 羁绊值 -->
      <view v-if="activeTab === 'bond'" class="bond-section">
        <view class="bond-overview">
          <view class="bond-level-card">
            <text class="level-icon">{{ myBondLevel.icon }}</text>
            <text class="level-name">{{ myBondLevel.name }}</text>
            <text class="level-value">总羁绊值: {{ myTotalBond }}</text>
            <view class="level-progress" v-if="myBondLevel.nextThreshold">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: getBondProgress(myTotalBond) + '%' }"></view>
              </view>
              <text class="progress-hint">再 {{ myBondLevel.nextThreshold - myTotalBond }} 可升级</text>
            </view>
          </view>
        </view>

        <view class="bond-relations">
          <text class="section-title">家庭羁绊关系</text>
          <view v-for="(bondValue, otherId) in myBondValues" :key="otherId" class="bond-item">
            <view class="bond-avatar">
              <text class="avatar-emoji">{{ getMemberEmoji(otherId) }}</text>
            </view>
            <view class="bond-info">
              <text class="bond-name">{{ getMemberName(otherId) }}</text>
              <text class="bond-value">💕 {{ bondValue }}</text>
            </view>
            <view class="bond-level-badge" :style="{ background: getBondColor(bondValue) }">
              {{ getBondLevelName(bondValue) }}
            </view>
          </view>
        </view>

        <view class="bond-stats">
          <text class="section-title">互动统计</text>
          <view class="stats-grid">
            <view class="stat-card">
              <text class="stat-value">{{ interactionStats.totalTasks }}</text>
              <text class="stat-label">参与任务</text>
            </view>
            <view class="stat-card">
              <text class="stat-value">{{ interactionStats.completedTasks }}</text>
              <text class="stat-label">已完成</text>
            </view>
            <view class="stat-card">
              <text class="stat-value">{{ interactionStats.totalBondEarned }}</text>
              <text class="stat-label">羁绊获取</text>
            </view>
            <view class="stat-card">
              <text class="stat-value">{{ interactionStats.participationRate }}%</text>
              <text class="stat-label">参与率</text>
            </view>
          </view>
        </view>

        <view class="battle-leaderboard">
          <text class="section-title">🏆 战斗排行榜</text>
          <view v-for="rank in leaderboard" :key="rank.babyId" class="leader-item">
            <view class="rank-badge" :class="'rank-' + rank.rank">
              <text>{{ rank.rank }}</text>
            </view>
            <text class="leader-name">{{ rank.name }}</text>
            <text class="leader-score">{{ rank.totalScore }}分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 创建队伍弹窗 -->
    <view class="modal" v-if="showCreateTeamModal" @click="showCreateTeamModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">创建亲子队伍</text>
        <view class="form-item">
          <text class="label">队伍名称</text>
          <input v-model="newTeam.name" class="input" placeholder="给队伍起个名字" />
        </view>
        <view class="form-item">
          <text class="label">选择孩子</text>
          <picker :value="childIndex" :range="childrenOptions" @change="onChildSelect">
            <view class="picker-value">{{ newTeam.childName || '请选择' }}</view>
          </picker>
        </view>
        <view class="modal-actions">
          <button class="cancel-btn" @click="showCreateTeamModal = false">取消</button>
          <button class="confirm-btn" @click="createTeam">创建</button>
        </view>
      </view>
    </view>

    <!-- 创建任务弹窗 -->
    <view class="modal" v-if="showCreateTaskModal" @click="showCreateTaskModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">创建协作任务</text>
        <view class="form-item">
          <text class="label">选择队伍</text>
          <picker :value="teamIndex" :range="teamOptions" @change="onTeamSelect">
            <view class="picker-value">{{ newTask.teamName || '请选择' }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">任务模板</text>
          <picker :value="templateIndex" :range="taskTemplates" range-key="title" @change="onTemplateSelect">
            <view class="picker-value">{{ newTask.templateName || '请选择' }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">持续时间（天）</text>
          <input type="number" v-model="newTask.duration" class="input" placeholder="如: 7" />
        </view>
        <view class="modal-actions">
          <button class="cancel-btn" @click="showCreateTaskModal = false">取消</button>
          <button class="confirm-btn" @click="createTask">创建</button>
        </view>
      </view>
    </view>

    <!-- 贡献进度弹窗 -->
    <view class="modal" v-if="showContributeModal" @click="showContributeModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">贡献进度</text>
        <text class="modal-subtitle">{{ selectedTask?.title }}</text>
        <view class="form-item">
          <text class="label">贡献值</text>
          <input type="number" v-model="contributeValue" class="input" placeholder="输入贡献值" />
        </view>
        <view class="modal-actions">
          <button class="cancel-btn" @click="showContributeModal = false">取消</button>
          <button class="confirm-btn" @click="submitContribution">提交</button>
        </view>
      </view>
    </view>

    <!-- 创建竞赛弹窗 -->
    <view class="modal" v-if="showCreateBattleModal" @click="showCreateBattleModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">发起家庭竞赛</text>
        <view class="form-item">
          <text class="label">竞赛名称</text>
          <input v-model="newBattle.title" class="input" placeholder="给竞赛起个名字" />
        </view>
        <view class="form-item">
          <text class="label">竞赛类型</text>
          <picker :value="battleCategoryIndex" :range="battleCategories" range-key="name" @change="onBattleCategorySelect">
            <view class="picker-value">{{ newBattle.categoryName || '请选择' }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">持续时间（天）</text>
          <input type="number" v-model="newBattle.duration" class="input" placeholder="如: 7" />
        </view>
        <view class="modal-actions">
          <button class="cancel-btn" @click="showCreateBattleModal = false">取消</button>
          <button class="confirm-btn" @click="createBattle">发起</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useParentChildStore } from '@/stores/parentChildStore'
import { useBabyStore } from '@/stores/babyStore'
import { getRecommendedTaskTemplates, getBattleCategoryConfig } from '@/services/parentChildService'

const parentChildStore = useParentChildStore()
const babyStore = useBabyStore()

const tabs = [
  { key: 'teams', name: '亲子组队' },
  { key: 'tasks', name: '协作任务' },
  { key: 'battles', name: '家庭竞赛' },
  { key: 'bond', name: '羁绊值' }
]

const activeTab = ref('teams')
const showCreateModal = ref(false)
const showCreateTeamModal = ref(false)
const showCreateTaskModal = ref(false)
const showContributeModal = ref(false)
const showCreateBattleModal = ref(false)

// 新建队伍
const newTeam = reactive({
  name: '',
  childId: '',
  childName: ''
})

// 新建任务
const newTask = reactive({
  teamId: '',
  teamName: '',
  templateIndex: 0,
  templateName: '',
  duration: 7
})

// 贡献
const contributeValue = ref(1)
const selectedTask = ref(null)

// 新建竞赛
const newBattle = reactive({
  title: '',
  category: 'points',
  categoryName: '积分对决',
  duration: 7
})

const taskTemplates = getRecommendedTaskTemplates()
const battleCategories = getBattleCategoryConfig()

// 计算属性
const myTeams = computed(() => parentChildStore.myTeams)
const myActiveTasks = computed(() => parentChildStore.myActiveTasks)
const activeBattles = computed(() => parentChildStore.activeBattles)
const myTotalBond = computed(() => parentChildStore.myTotalBond)
const myBondLevel = computed(() => parentChildStore.myBondLevel)
const myBondValues = computed(() => parentChildStore.myBondValues)
const leaderboard = computed(() => parentChildStore.getBattleLeaderboard())

const interactionStats = computed(() => {
  const babyId = babyStore.currentBabyId
  return parentChildStore.getInteractionStats(babyId)
})

const childrenOptions = computed(() => {
  return babyStore.babies.map(b => ({ id: b.id, name: b.name }))
})

const teamOptions = computed(() => {
  return parentChildStore.myTeams.map(t => ({ id: t.id, name: t.name }))
})

// 方法
const getTeamMembers = (teamId) => {
  return parentChildStore.getTeamMembers(teamId)
}

const getMemberName = (babyId) => {
  const baby = babyStore.babies.find(b => b.id === babyId)
  return baby ? baby.name : '未知'
}

const getMemberEmoji = (babyId) => {
  const emojis = ['👶', '👼', '🧒', '👦', '👧']
  const index = babyId ? babyId.charCodeAt(0) % 5 : 0
  return emojis[index]
}

const getCategoryName = (category) => {
  const names = {
    reading: '阅读',
    cooking: '烹饪',
    sports: '运动',
    art: '艺术',
    life: '生活',
    game: '游戏',
    learning: '学习'
  }
  return names[category] || category
}

const getBattleCategoryName = (category) => {
  const cat = battleCategories.find(c => c.id === category)
  return cat ? cat.name : category
}

const getTaskProgress = (task) => {
  if (!task.targetValue) return 0
  return Math.min(100, Math.round((task.currentProgress / task.targetValue) * 100))
}

const getRemainingTime = (endTime) => {
  const now = new Date()
  const end = new Date(endTime)
  const diff = end - now

  if (diff <= 0) return '已结束'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}天${hours}小时`
  return `${hours}小时`
}

const getBattleRank = (battleId, babyId) => {
  return parentChildStore.getBattleRank(battleId, babyId)
}

const getBondProgress = (value) => {
  const level = parentChildStore.getBondLevel(value)
  if (!level.nextThreshold) return 100

  const thresholds = [50, 150, 300, 500]
  const currentIndex = thresholds.findIndex(t => value < t)
  const prevThreshold = currentIndex === 0 ? 0 : thresholds[currentIndex - 1]
  const nextThreshold = thresholds[currentIndex]

  return Math.round(((value - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
}

const getBondColor = (value) => {
  if (value >= 500) return '#FF9800'
  if (value >= 300) return '#9C27B0'
  if (value >= 150) return '#2196F3'
  if (value >= 50) return '#4CAF50'
  return '#A0A0A0'
}

const getBondLevelName = (value) => {
  return parentChildStore.getBondLevel(value).name
}

const selectTeam = (team) => {
  // 导航到队伍详情
}

const onChildSelect = (e) => {
  const index = e.detail.value
  newTeam.childId = childrenOptions.value[index].id
  newTeam.childName = childrenOptions.value[index].name
}

const onTeamSelect = (e) => {
  const index = e.detail.value
  newTask.teamId = teamOptions.value[index].id
  newTask.teamName = teamOptions.value[index].name
}

const onTemplateSelect = (e) => {
  const index = e.detail.value
  newTask.templateIndex = index
  newTask.templateName = taskTemplates[index].title
}

const onBattleCategorySelect = (e) => {
  const index = e.detail.value
  newBattle.category = battleCategories[index].id
  newBattle.categoryName = battleCategories[index].name
}

const createTeam = () => {
  if (!newTeam.name.trim()) {
    uni.showToast({ title: '请输入队伍名称', icon: 'none' })
    return
  }
  if (!newTeam.childId) {
    uni.showToast({ title: '请选择孩子', icon: 'none' })
    return
  }

  parentChildStore.createTeam(newTeam.name, babyStore.currentUserId, newTeam.childId)
  showCreateTeamModal.value = false
  Object.assign(newTeam, { name: '', childId: '', childName: '' })
  uni.showToast({ title: '队伍创建成功', icon: 'success' })
}

const createTask = () => {
  if (!newTask.teamId) {
    uni.showToast({ title: '请选择队伍', icon: 'none' })
    return
  }

  parentChildStore.createTaskFromTemplate(newTask.teamId, newTask.templateIndex, newTask.duration)
  showCreateTaskModal.value = false
  Object.assign(newTask, { teamId: '', teamName: '', templateIndex: 0, templateName: '', duration: 7 })
  uni.showToast({ title: '任务创建成功', icon: 'success' })
}

const showContributeModal = (task) => {
  selectedTask.value = task
  contributeValue.value = 1
  showContributeModal.value = true
}

const submitContribution = () => {
  if (!selectedTask.value) return

  const babyId = babyStore.currentBabyId
  parentChildStore.contributeToTask(selectedTask.value.id, babyId, contributeValue.value)
  showContributeModal.value = false
  uni.showToast({ title: '贡献成功', icon: 'success' })
}

const createBattle = () => {
  if (!newBattle.title.trim()) {
    uni.showToast({ title: '请输入竞赛名称', icon: 'none' })
    return
  }

  const participantIds = babyStore.babies.map(b => b.id)
  parentChildStore.createBattle(newBattle.title, participantIds, newBattle.duration, newBattle.category)
  showCreateBattleModal.value = false
  Object.assign(newBattle, { title: '', category: 'points', categoryName: '积分对决', duration: 7 })
  uni.showToast({ title: '竞赛发起成功', icon: 'success' })
}

onMounted(() => {
  parentChildStore.init()
})
</script>

<style scoped>
.parent-child-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
}

.page-header {
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
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
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
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
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
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  color: #fff;
  border-radius: 40rpx;
  border: none;
}

.team-list, .task-list, .battle-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.team-card, .task-card, .battle-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.team-header, .task-header, .battle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.team-name, .task-title, .battle-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.team-status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.team-status.active {
  background: #e8f5e9;
  color: #4caf50;
}

.team-members {
  display: flex;
  gap: 24rpx;
  margin-bottom: 16rpx;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.member-avatar {
  font-size: 36rpx;
}

.member-name {
  font-size: 26rpx;
  color: #666;
}

.team-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff6b6b;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
}

.task-category, .battle-category {
  font-size: 22rpx;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.task-progress {
  margin-bottom: 16rpx;
}

.progress-bar {
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #ee5a5a);
  border-radius: 6rpx;
}

.progress-text {
  font-size: 22rpx;
  color: #666;
  text-align: right;
}

.task-members {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.member-progress {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #f5f5f5;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.member-value {
  font-size: 24rpx;
  font-weight: 600;
  color: #ff6b6b;
}

.task-rewards {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.reward-item {
  font-size: 24rpx;
  color: #666;
}

.contribute-btn {
  width: 100%;
  height: 72rpx;
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  color: #fff;
  border-radius: 36rpx;
  font-size: 28rpx;
  border: none;
}

.battle-timer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff5f5;
  padding: 12rpx 16rpx;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}

.timer-label {
  font-size: 24rpx;
  color: #666;
}

.timer-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff6b6b;
}

.battle-scores {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.score-item {
  display: flex;
  align-items: center;
  padding: 8rpx 0;
}

.score-rank {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 24rpx;
  font-weight: 600;
  margin-right: 12rpx;
}

.score-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.score-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff6b6b;
}

/* Bond Section */
.bond-overview {
  margin-bottom: 24rpx;
}

.bond-level-card {
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  border-radius: 16rpx;
  padding: 32rpx;
  text-align: center;
  color: #fff;
}

.level-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 16rpx;
}

.level-name {
  font-size: 36rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 8rpx;
}

.level-value {
  font-size: 28rpx;
  opacity: 0.9;
}

.level-progress {
  margin-top: 16rpx;
}

.progress-hint {
  font-size: 22rpx;
  opacity: 0.8;
  margin-top: 8rpx;
  display: block;
}

.bond-relations {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.bond-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.bond-item:last-child {
  border-bottom: none;
}

.bond-avatar {
  width: 80rpx;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.avatar-emoji {
  font-size: 48rpx;
}

.bond-info {
  flex: 1;
}

.bond-name {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.bond-value {
  font-size: 24rpx;
  color: #ff6b6b;
}

.bond-level-badge {
  font-size: 22rpx;
  color: #fff;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
}

.bond-stats {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.stat-card {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 24rpx;
  text-align: center;
}

.stat-card .stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #ff6b6b;
  display: block;
}

.stat-card .stat-label {
  font-size: 24rpx;
  color: #999;
}

.battle-leaderboard {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.leader-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
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

.leader-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.leader-score {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff6b6b;
}

/* Modal */
.modal {
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
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  width: 600rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  text-align: center;
  display: block;
  margin-bottom: 24rpx;
}

.modal-subtitle {
  font-size: 26rpx;
  color: #666;
  text-align: center;
  display: block;
  margin-bottom: 24rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.picker-value {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  line-height: 80rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 28rpx;
  border: none;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  color: #fff;
}
</style>
