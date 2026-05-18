<!--
  V22 兄弟姐妹任务竞赛页面
  支持发起和管理兄弟姐妹之间的任务竞赛
-->
<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack" hover-class="hover">
        <text>←</text>
      </view>
      <text class="nav-title">兄弟姐妹竞赛</text>
      <view class="nav-actions">
        <view class="nav-btn" @tap="onCreateCompetition" hover-class="hover">
          <text>+ 发起</text>
        </view>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="stats-overview">
      <view class="stat-card">
        <text class="stat-icon">🏆</text>
        <text class="stat-value">{{ ongoingCompetitions.length }}</text>
        <text class="stat-label">进行中</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">📜</text>
        <text class="stat-value">{{ finishedCompetitions.length }}</text>
        <text class="stat-label">已结束</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">👥</text>
        <text class="stat-value">{{ children.length }}</text>
        <text class="stat-label">参赛儿童</text>
      </view>
    </view>

    <!-- 进行中的竞赛 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">🔥 进行中</text>
        <text class="section-count">{{ ongoingCompetitions.length }}个</text>
      </view>

      <view v-if="ongoingCompetitions.length === 0" class="empty-state">
        <text class="empty-icon">🏆</text>
        <text class="empty-title">暂无进行中的竞赛</text>
        <text class="empty-desc">点击右上角"发起"创建新竞赛</text>
      </view>

      <view v-else class="competition-list">
        <view
          v-for="comp in ongoingCompetitions"
          :key="comp.id"
          class="competition-card ongoing"
        >
          <view class="comp-header">
            <view class="comp-title-row">
              <text class="comp-title">{{ comp.title }}</text>
              <view class="comp-status-badge ongoing">
                <text>进行中</text>
              </view>
            </view>
            <view class="comp-meta">
              <text class="meta-item">📅 {{ formatEndTime(comp.endTime) }}</text>
              <text class="meta-item">👥 {{ comp.participantIds.length }}人</text>
            </view>
          </view>

          <!-- 参赛者进度 -->
          <view class="participants-section">
            <view
              v-for="participant in getParticipants(comp)"
              :key="participant.id"
              class="participant-item"
              :class="{ leading: isLeading(comp, participant.id) }"
              @tap="onUpdateParticipantScore(comp.id, participant.id)"
            >
              <view class="participant-rank" v-if="getParticipantRank(comp, participant.id) <= 3">
                {{ getParticipantRank(comp, participant.id) === 1 ? '🥇' : getParticipantRank(comp, participant.id) === 2 ? '🥈' : '🥉' }}
              </view>
              <text class="participant-avatar">{{ participant.avatar || '👶' }}</text>
              <view class="participant-info">
                <text class="participant-name">{{ participant.name }}</text>
                <view class="progress-bar">
                  <view
                    class="progress-fill"
                    :style="{ width: getProgressWidth(comp, participant.id) + '%' }"
                  ></view>
                </view>
              </view>
              <view class="participant-score">
                <text class="score-value">{{ getParticipantScore(comp, participant.id) }}</text>
                <text class="score-label">分</text>
              </view>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="comp-actions">
            <view class="action-btn secondary" @tap="onShareCompetition(comp.id)" hover-class="hover">
              <text>📤 分享</text>
            </view>
            <view class="action-btn primary" @tap="onFinishCompetition(comp.id)" hover-class="hover">
              <text>🏁 结束</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 已结束的竞赛 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">📜 历史竞赛</text>
        <text class="section-count">{{ finishedCompetitions.length }}个</text>
      </view>

      <view v-if="finishedCompetitions.length === 0" class="empty-state small">
        <text class="empty-desc">暂无历史竞赛记录</text>
      </view>

      <view v-else class="competition-list">
        <view
          v-for="comp in displayedFinishedCompetitions"
          :key="comp.id"
          class="competition-card finished"
        >
          <view class="comp-header">
            <view class="comp-title-row">
              <text class="comp-title">{{ comp.title }}</text>
              <view class="comp-status-badge finished">
                <text>已结束</text>
              </view>
            </view>
            <text class="comp-date">结束于 {{ formatDate(comp.endTime) }}</text>
          </view>

          <!-- 获胜者展示 -->
          <view class="winner-section" v-if="getWinner(comp)">
            <text class="winner-label">🏆 获胜者</text>
            <view class="winner-card">
              <text class="winner-avatar">{{ getWinner(comp).avatar || '👶' }}</text>
              <text class="winner-name">{{ getWinner(comp).name }}</text>
              <text class="winner-score">{{ getWinner(comp).score }}分</text>
            </view>
          </view>

          <!-- 所有参赛者成绩 -->
          <view class="results-summary">
            <view
              v-for="participant in getParticipants(comp)"
              :key="participant.id"
              class="result-item"
              :class="{ winner: isWinner(comp, participant.id) }"
            >
              <text class="result-rank">
                {{ getParticipantRank(comp, participant.id) <= 3 ? (getParticipantRank(comp, participant.id) === 1 ? '🥇' : getParticipantRank(comp, participant.id) === 2 ? '🥈' : '🥉') : getParticipantRank(comp, participant.id) }}
              </text>
              <text class="result-avatar">{{ participant.avatar || '👶' }}</text>
              <text class="result-name">{{ participant.name }}</text>
              <text class="result-score">{{ getParticipantScore(comp, participant.id) }}分</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="finishedCompetitions.length > 5" class="load-more" @tap="onLoadMoreHistory" hover-class="hover">
        <text>查看更多历史竞赛</text>
      </view>
    </view>

    <!-- 创建竞赛弹窗 -->
    <uni-popup ref="createPopup" type="center">
      <view class="popup-content">
        <text class="popup-title">发起新竞赛</text>

        <view class="input-group">
          <text class="input-label">竞赛名称</text>
          <input
            v-model="newCompTitle"
            placeholder="如：谁先完成作业"
            class="input-field"
          />
        </view>

        <view class="input-group">
          <text class="input-label">竞赛类型</text>
          <picker
            :range="taskTypes"
            range-key="label"
            @change="onSelectTaskType"
            :value="selectedTaskTypeIndex"
          >
            <view class="picker-value">
              {{ selectedTaskType ? selectedTaskType.label : '请选择' }}
            </view>
          </picker>
        </view>

        <view class="input-group">
          <text class="input-label">参赛儿童（2-5人）</text>
          <view class="child-selector">
            <view
              v-for="child in children"
              :key="child.id"
              class="child-option"
              :class="{ selected: newCompParticipants.includes(child.id) }"
              @tap="toggleParticipant(child.id)"
            >
              <text class="child-avatar">{{ child.avatar || '👶' }}</text>
              <text class="child-name">{{ child.name }}</text>
              <view class="child-check" v-if="newCompParticipants.includes(child.id)">✓</view>
            </view>
          </view>
        </view>

        <view class="input-group">
          <text class="input-label">持续时间</text>
          <picker
            :range="durationOptions"
            @change="onSelectDuration"
            :value="selectedDurationIndex"
          >
            <view class="picker-value">
              {{ durationOptions[selectedDurationIndex] }} 天
            </view>
          </picker>
        </view>

        <view class="popup-actions">
          <view class="popup-btn cancel" @tap="closeCreatePopup">
            <text>取消</text>
          </view>
          <view class="popup-btn confirm" @tap="confirmCreate">
            <text>发起竞赛</text>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 更新成绩弹窗 -->
    <uni-popup ref="updateScorePopup" type="center">
      <view class="popup-content">
        <text class="popup-title">更新成绩</text>

        <view class="current-competition-info" v-if="currentCompetition">
          <text class="info-title">{{ currentCompetition.title }}</text>
        </view>

        <view class="input-group">
          <text class="input-label">选择儿童</text>
          <picker
            :range="updateParticipants"
            range-key="name"
            @change="onSelectUpdateParticipant"
            :value="updateParticipantIndex"
          >
            <view class="picker-value">
              {{ updateParticipant ? updateParticipant.name : '请选择' }}
            </view>
          </picker>
        </view>

        <view class="input-group">
          <text class="input-label">成绩分数</text>
          <input
            type="number"
            v-model="updateScoreValue"
            placeholder="请输入分数"
            class="input-field"
          />
        </view>

        <view class="popup-actions">
          <view class="popup-btn cancel" @tap="closeUpdateScorePopup">
            <text>取消</text>
          </view>
          <view class="popup-btn confirm" @tap="confirmUpdateScore">
            <text>确认更新</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFamilyStore } from '@/stores/familyStore.js'
import { useBabyStore } from '@/stores/babyStore.js'
import { usePointsStore } from '@/stores/pointsStore.js'

const familyStore = useFamilyStore()
const babyStore = useBabyStore()
const pointsStore = usePointsStore()

// 儿童列表
const children = computed(() => familyStore.children)

// 进行中的竞赛
const ongoingCompetitions = computed(() => familyStore.getOngoingCompetitions())

// 已结束的竞赛
const finishedCompetitions = computed(() =>
  familyStore.siblingCompetitions.filter(c => c.status === 'finished')
)
const displayedFinishedCompetitions = computed(() => finishedCompetitions.value.slice(0, 5))

// 竞赛类型选项
const taskTypes = [
  { id: 'homework', label: '作业完成' },
  { id: 'reading', label: '阅读' },
  { id: 'exercise', label: '运动锻炼' },
  { id: 'chores', label: '家务劳动' },
  { id: 'practice', label: '技能练习' }
]
const selectedTaskTypeIndex = ref(0)
const selectedTaskType = computed(() => taskTypes[selectedTaskTypeIndex.value])

// 持续时间选项
const durationOptions = [3, 5, 7, 14, 30]
const selectedDurationIndex = ref(2)

// 创建竞赛弹窗
const createPopup = ref(null)
const newCompTitle = ref('')
const newCompParticipants = ref([])

// 更新成绩弹窗
const updateScorePopup = ref(null)
const currentCompetitionId = ref('')
const currentCompetition = computed(() =>
  familyStore.siblingCompetitions.find(c => c.id === currentCompetitionId.value)
)
const updateParticipants = computed(() => {
  if (!currentCompetitionId.value) return []
  const comp = familyStore.siblingCompetitions.find(c => c.id === currentCompetitionId.value)
  if (!comp) return []
  return children.value.filter(c => comp.participantIds.includes(c.id))
})
const updateParticipantIndex = ref(0)
const updateParticipant = computed(() => updateParticipants.value[updateParticipantIndex.value])
const updateScoreValue = ref('')

// 历史记录分页
const historyPage = ref(1)

// 初始化
onMounted(() => {
  babyStore.init()
  pointsStore.init()
  familyStore.init()
})

// 获取参赛者信息
const getParticipants = (competition) => {
  return children.value.filter(c => competition.participantIds.includes(c.id))
}

// 获取参赛者分数
const getParticipantScore = (competition, childId) => {
  const result = competition.results.find(r => r.childId === childId)
  return result ? result.score : 0
}

// 获取参赛者排名
const getParticipantRank = (competition, childId) => {
  const result = competition.results.find(r => r.childId === childId)
  return result ? result.rank : 0
}

// 是否领先
const isLeading = (competition, childId) => {
  return getParticipantRank(competition, childId) === 1 && competition.results.length > 0
}

// 获取进度条宽度
const getProgressWidth = (competition, childId) => {
  const score = getParticipantScore(competition, childId)
  if (competition.results.length === 0) return 0
  const maxScore = Math.max(...competition.results.map(r => r.score))
  if (maxScore === 0) return 0
  return Math.round((score / maxScore) * 100)
}

// 获取获胜者
const getWinner = (competition) => {
  if (competition.results.length === 0) return null
  const sorted = [...competition.results].sort((a, b) => a.rank - b.rank)
  if (sorted.length === 0 || sorted[0].rank !== 1) return null
  const winnerId = sorted[0].childId
  const child = children.value.find(c => c.id === winnerId)
  if (!child) return null
  return {
    ...child,
    score: sorted[0].score
  }
}

// 是否是获胜者
const isWinner = (competition, childId) => {
  const winner = getWinner(competition)
  return winner && winner.id === childId
}

// 格式化结束时间
const formatEndTime = (timeStr) => {
  if (!timeStr) return '未知'
  const end = new Date(timeStr)
  const now = new Date()
  if (now >= end) return '已结束'
  const remaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  return `剩余 ${remaining} 天`
}

// 格式化日期
const formatDate = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 创建竞赛
const onCreateCompetition = () => {
  if (children.value.length < 2) {
    uni.showToast({ title: '至少需要2名儿童', icon: 'none' })
    return
  }
  newCompTitle.value = ''
  newCompParticipants.value = children.value.map(c => c.id)
  selectedTaskTypeIndex.value = 0
  selectedDurationIndex.value = 2
  createPopup.value.open()
}

const closeCreatePopup = () => {
  createPopup.value.close()
}

const onSelectTaskType = (e) => {
  selectedTaskTypeIndex.value = e.detail.value
}

const onSelectDuration = (e) => {
  selectedDurationIndex.value = e.detail.value
}

const toggleParticipant = (childId) => {
  const index = newCompParticipants.value.indexOf(childId)
  if (index === -1) {
    if (newCompParticipants.value.length >= 5) {
      uni.showToast({ title: '最多5人参赛', icon: 'none' })
      return
    }
    newCompParticipants.value.push(childId)
  } else {
    if (newCompParticipants.value.length <= 2) {
      uni.showToast({ title: '至少需要2人参赛', icon: 'none' })
      return
    }
    newCompParticipants.value.splice(index, 1)
  }
}

const confirmCreate = () => {
  if (!newCompTitle.value.trim()) {
    uni.showToast({ title: '请输入竞赛名称', icon: 'none' })
    return
  }
  if (newCompParticipants.value.length < 2) {
    uni.showToast({ title: '请至少选择2名参赛者', icon: 'none' })
    return
  }

  familyStore.createCompetition(
    newCompTitle.value,
    selectedTaskType.value.id,
    newCompParticipants.value,
    durationOptions[selectedDurationIndex.value]
  )

  closeCreatePopup()
  uni.showToast({ title: '竞赛已发起', icon: 'success' })
}

// 更新参赛者成绩
const onUpdateParticipantScore = (competitionId, childId) => {
  currentCompetitionId.value = competitionId
  const participants = updateParticipants.value
  const index = participants.findIndex(p => p.id === childId)
  updateParticipantIndex.value = index >= 0 ? index : 0

  // 填充当前分数
  const competition = familyStore.siblingCompetitions.find(c => c.id === competitionId)
  if (competition) {
    const result = competition.results.find(r => r.childId === childId)
    updateScoreValue.value = result ? result.score.toString() : ''
  }

  updateScorePopup.value.open()
}

const closeUpdateScorePopup = () => {
  updateScorePopup.value.close()
}

const onSelectUpdateParticipant = (e) => {
  updateParticipantIndex.value = e.detail.value
  // 清空分数输入
  updateScoreValue.value = ''
}

const confirmUpdateScore = () => {
  if (!updateParticipant.value) {
    uni.showToast({ title: '请选择儿童', icon: 'none' })
    return
  }
  const score = parseInt(updateScoreValue.value)
  if (isNaN(score) || score < 0) {
    uni.showToast({ title: '请输入有效分数', icon: 'none' })
    return
  }

  familyStore.updateCompetitionResult(
    currentCompetitionId.value,
    updateParticipant.value.id,
    score
  )

  closeUpdateScorePopup()
  uni.showToast({ title: '成绩已更新', icon: 'success' })
}

// 分享竞赛
const onShareCompetition = (competitionId) => {
  const competition = familyStore.siblingCompetitions.find(c => c.id === competitionId)
  if (!competition) return

  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })

  uni.showToast({ title: '请点击右上角分享', icon: 'none' })
}

// 结束竞赛
const onFinishCompetition = (competitionId) => {
  uni.showModal({
    title: '确认结束竞赛？',
    content: '结束后将给获胜者发放50积分奖励',
    success: (res) => {
      if (res.confirm) {
        familyStore.finishCompetition(competitionId)
        uni.showToast({ title: '竞赛已结束', icon: 'success' })
      }
    }
  })
}

// 加载更多历史
const onLoadMoreHistory = () => {
  historyPage.value++
  // 实际应用中这里会加载更多数据
  uni.showToast({ title: '没有更多了', icon: 'none' })
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #F3F4F6;
  padding-bottom: 40rpx;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
}

.nav-back text {
  font-size: 32rpx;
  color: #ffffff;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #ffffff;
}

.nav-actions {
  display: flex;
  gap: 16rpx;
}

.nav-btn {
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
}

.nav-btn text {
  font-size: 26rpx;
  color: #ffffff;
}

.hover {
  opacity: 0.8;
}

/* 统计概览 */
.stats-overview {
  display: flex;
  padding: 24rpx 16rpx;
  gap: 16rpx;
}

.stat-card {
  flex: 1;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
  text-align: center;
}

.stat-icon {
  font-size: 40rpx;
  display: block;
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #1F2937;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  color: #6B7280;
}

/* 通用区块 */
.section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin: 0 16rpx 16rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1F2937;
}

.section-count {
  font-size: 24rpx;
  color: #6B7280;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
}

.empty-state.small {
  padding: 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 8rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #6B7280;
}

/* 竞赛列表 */
.competition-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.competition-card {
  background: #F9FAFB;
  border-radius: 20rpx;
  padding: 24rpx;
}

.competition-card.ongoing {
  border-left: 6rpx solid #F59E0B;
}

.competition-card.finished {
  border-left: 6rpx solid #9CA3AF;
}

.comp-header {
  margin-bottom: 20rpx;
}

.comp-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.comp-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1F2937;
}

.comp-status-badge {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
}

.comp-status-badge.ongoing {
  background: #FEF3C7;
  color: #D97706;
}

.comp-status-badge.finished {
  background: #F3F4F6;
  color: #6B7280;
}

.comp-meta {
  display: flex;
  gap: 24rpx;
}

.meta-item {
  font-size: 24rpx;
  color: #6B7280;
}

.comp-date {
  font-size: 24rpx;
  color: #9CA3AF;
}

/* 参赛者 */
.participants-section {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.participant-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background: #ffffff;
  border-radius: 12rpx;
  transition: all 0.2s;
}

.participant-item.leading {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border: 2rpx solid #F59E0B;
}

.participant-rank {
  width: 40rpx;
  font-size: 24rpx;
  text-align: center;
}

.participant-avatar {
  font-size: 40rpx;
  margin-right: 12rpx;
}

.participant-info {
  flex: 1;
}

.participant-name {
  font-size: 26rpx;
  font-weight: 500;
  color: #1F2937;
  display: block;
  margin-bottom: 8rpx;
}

.progress-bar {
  height: 8rpx;
  background: #E5E7EB;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #F59E0B 0%, #F97316 100%);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.participant-score {
  display: flex;
  align-items: baseline;
  margin-left: 16rpx;
}

.score-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #1F2937;
}

.score-label {
  font-size: 22rpx;
  color: #6B7280;
  margin-left: 4rpx;
}

/* 操作按钮 */
.comp-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  text-align: center;
}

.action-btn text {
  font-size: 26rpx;
  font-weight: 500;
}

.action-btn.secondary {
  background: #ffffff;
}

.action-btn.secondary text {
  color: #6B7280;
}

.action-btn.primary {
  background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
}

.action-btn.primary text {
  color: #ffffff;
}

/* 获胜者 */
.winner-section {
  margin-bottom: 16rpx;
}

.winner-label {
  font-size: 24rpx;
  color: #D97706;
  display: block;
  margin-bottom: 8rpx;
}

.winner-card {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border-radius: 12rpx;
}

.winner-avatar {
  font-size: 40rpx;
  margin-right: 12rpx;
}

.winner-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2937;
}

.winner-score {
  font-size: 28rpx;
  font-weight: 700;
  color: #D97706;
}

/* 成绩汇总 */
.results-summary {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 12rpx;
  background: #ffffff;
  border-radius: 8rpx;
}

.result-item.winner {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
}

.result-rank {
  width: 40rpx;
  font-size: 24rpx;
  text-align: center;
}

.result-avatar {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.result-name {
  flex: 1;
  font-size: 26rpx;
  color: #1F2937;
}

.result-score {
  font-size: 26rpx;
  font-weight: 600;
  color: #6B7280;
}

.result-item.winner .result-score {
  color: #D97706;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 24rpx;
  margin-top: 16rpx;
}

.load-more text {
  font-size: 26rpx;
  color: #8B5CF6;
}

/* 弹窗 */
.popup-content {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  width: 640rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1F2937;
  display: block;
  text-align: center;
  margin-bottom: 40rpx;
}

.current-competition-info {
  background: #F9FAFB;
  padding: 16rpx;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  text-align: center;
}

.info-title {
  font-size: 28rpx;
  color: #1F2937;
  font-weight: 500;
}

.input-group {
  margin-bottom: 32rpx;
}

.input-label {
  font-size: 28rpx;
  color: #6B7280;
  display: block;
  margin-bottom: 12rpx;
}

.picker-value,
.input-field {
  padding: 24rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #1F2937;
}

.child-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.child-option {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  background: #F9FAFB;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  min-width: 130rpx;
}

.child-option.selected {
  background: #EDE9FE;
  border-color: #8B5CF6;
}

.child-avatar {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.child-name {
  font-size: 24rpx;
  color: #6B7280;
}

.child-option.selected .child-name {
  color: #8B5CF6;
  font-weight: 500;
}

.child-check {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 32rpx;
  height: 32rpx;
  background: #8B5CF6;
  color: #ffffff;
  font-size: 20rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 40rpx;
}

.popup-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 16rpx;
  text-align: center;
}

.popup-btn.cancel {
  background: #F3F4F6;
}

.popup-btn.cancel text {
  font-size: 28rpx;
  color: #6B7280;
}

.popup-btn.confirm {
  background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
}

.popup-btn.confirm text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
}
</style>
