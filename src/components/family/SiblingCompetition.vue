<!--
  兄弟姐妹竞赛组件
  支持创建和展示兄弟姐妹之间的任务竞赛
-->
<template>
  <view class="sibling-competition">
    <!-- 头部 -->
    <view class="competition-header">
      <text class="header-title">🏆 兄弟姐妹竞赛</text>
      <view class="header-btn" @tap="onCreateCompetition" hover-class="hover">
        <text>发起竞赛</text>
      </view>
    </view>

    <!-- 进行中的竞赛 -->
    <view class="section">
      <text class="section-title">进行中</text>
      <view v-if="ongoingCompetitions.length === 0" class="empty-state">
        <text class="empty-text">暂无进行中的竞赛</text>
      </view>
      <view v-else class="competition-list">
        <view
          v-for="comp in ongoingCompetitions"
          :key="comp.id"
          class="competition-card ongoing"
        >
          <view class="comp-header">
            <text class="comp-title">{{ comp.title }}</text>
            <view class="comp-status" :class="'status-' + comp.status">
              <text>{{ comp.status === 'ongoing' ? '进行中' : '已结束' }}</text>
            </view>
          </view>

          <view class="comp-info">
            <text class="comp-meta">📅 {{ formatDuration(comp) }}</text>
            <text class="comp-meta">👥 {{ comp.participantIds.length }}人参与</text>
          </view>

          <!-- 参赛者卡片 -->
          <view class="participants">
            <view
              v-for="participant in getParticipants(comp)"
              :key="participant.id"
              class="participant-card"
              :class="{ leading: isLeading(comp, participant.id) }"
            >
              <text class="participant-avatar">{{ participant.avatar || '👶' }}</text>
              <text class="participant-name">{{ participant.name }}</text>
              <text class="participant-score">{{ getParticipantScore(comp, participant.id) }}</text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="comp-actions">
            <view class="action-btn" @tap="onUpdateScore(comp.id)" hover-class="hover">
              <text>更新成绩</text>
            </view>
            <view class="action-btn primary" @tap="onFinishCompetition(comp.id)" hover-class="hover">
              <text>结束竞赛</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 已结束的竞赛 -->
    <view class="section">
      <text class="section-title">历史竞赛</text>
      <view v-if="finishedCompetitions.length === 0" class="empty-state">
        <text class="empty-text">暂无历史竞赛</text>
      </view>
      <view v-else class="competition-list">
        <view
          v-for="comp in displayedFinishedCompetitions"
          :key="comp.id"
          class="competition-card finished"
        >
          <view class="comp-header">
            <text class="comp-title">{{ comp.title }}</text>
            <view class="comp-status finished">
              <text>已结束</text>
            </view>
          </view>

          <view class="comp-winner" v-if="getWinner(comp)">
            <text class="winner-label">🏆 获胜者</text>
            <text class="winner-name">{{ getWinner(comp).name }}</text>
            <text class="winner-score">{{ getWinner(comp).score }}分</text>
          </view>

          <view class="comp-participants-summary">
            <text
              v-for="participant in getParticipants(comp)"
              :key="participant.id"
              class="summary-item"
            >
              {{ participant.name }}: {{ getParticipantScore(comp, participant.id) }}分
            </text>
          </view>
        </view>
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
          <text class="input-label">参赛儿童（可多选）</text>
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
            </view>
          </view>
        </view>

        <view class="input-group">
          <text class="input-label">持续天数</text>
          <picker
            :range="durationOptions"
            @change="onSelectDuration"
            :value="selectedDurationIndex"
          >
            <view class="picker-value">
              {{ durationOptions[selectedDurationIndex] }}天
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
        <text class="popup-title">更新竞赛成绩</text>

        <view class="input-group">
          <text class="input-label">选择儿童</text>
          <picker
            :range="updateScoreParticipants"
            range-key="name"
            @change="onSelectUpdateParticipant"
            :value="updateScoreParticipantIndex"
          >
            <view class="picker-value">
              {{ updateScoreParticipant ? updateScoreParticipant.name : '请选择' }}
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
import { ref, computed } from 'vue'
import { useFamilyStore } from '@/stores/familyStore.js'

const familyStore = useFamilyStore()

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

// 创建竞赛表单
const createPopup = ref(null)
const newCompTitle = ref('')
const newCompParticipants = ref([])
const newCompDuration = computed(() => durationOptions[selectedDurationIndex.value])

// 更新成绩弹窗
const updateScorePopup = ref(null)
const currentCompetitionId = ref('')
const updateScoreParticipants = computed(() => {
  if (!currentCompetitionId.value) return []
  const comp = familyStore.siblingCompetitions.find(c => c.id === currentCompetitionId.value)
  if (!comp) return []
  return children.value.filter(c => comp.participantIds.includes(c.id))
})
const updateScoreParticipantIndex = ref(0)
const updateScoreParticipant = computed(() => updateScoreParticipants.value[updateScoreParticipantIndex.value])
const updateScoreValue = ref('')

// 获取参赛儿童信息
const getParticipants = (competition) => {
  return children.value.filter(c => competition.participantIds.includes(c.id))
}

// 获取儿童分数
const getParticipantScore = (competition, childId) => {
  const result = competition.results.find(r => r.childId === childId)
  return result ? result.score : 0
}

// 是否领先
const isLeading = (competition, childId) => {
  const result = competition.results.find(r => r.childId === childId)
  if (!result || result.rank === 0) return false
  const sorted = [...competition.results].sort((a, b) => a.rank - b.rank)
  return sorted.length > 0 && sorted[0].childId === childId
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

// 格式化持续时间
const formatDuration = (competition) => {
  const start = new Date(competition.startTime)
  const end = new Date(competition.endTime)
  const now = new Date()

  if (now >= end) {
    return '已结束'
  }

  const remaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  return `剩余 ${remaining} 天`
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
    newCompDuration.value
  )

  closeCreatePopup()
  uni.showToast({ title: '竞赛已发起', icon: 'success' })
}

// 更新成绩
const onUpdateScore = (competitionId) => {
  currentCompetitionId.value = competitionId
  updateScoreParticipantIndex.value = 0
  updateScoreValue.value = ''
  updateScorePopup.value.open()
}

const closeUpdateScorePopup = () => {
  updateScorePopup.value.close()
}

const onSelectUpdateParticipant = (e) => {
  updateScoreParticipantIndex.value = e.detail.value
}

const confirmUpdateScore = () => {
  if (!updateScoreParticipant.value) {
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
    updateScoreParticipant.value.id,
    score
  )

  closeUpdateScorePopup()
  uni.showToast({ title: '成绩已更新', icon: 'success' })
}

// 结束竞赛
const onFinishCompetition = (competitionId) => {
  uni.showModal({
    title: '确认结束竞赛？',
    content: '结束后将给获胜者发放奖励积分',
    success: (res) => {
      if (res.confirm) {
        familyStore.finishCompetition(competitionId)
        uni.showToast({ title: '竞赛已结束', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped>
.sibling-competition {
  padding: 16rpx;
}

.competition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
}

.header-btn {
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
  border-radius: 16rpx;
}

.header-btn text {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 500;
}

.hover {
  opacity: 0.8;
}

.section {
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #6B7280;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

.empty-state {
  padding: 48rpx;
  text-align: center;
  background: #ffffff;
  border-radius: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #9CA3AF;
}

.competition-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.competition-card {
  background: #ffffff;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.comp-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1F2937;
}

.comp-status {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
}

.comp-status.status-ongoing {
  background: #FEF3C7;
  color: #D97706;
}

.comp-status.finished {
  background: #F3F4F6;
  color: #6B7280;
}

.comp-info {
  display: flex;
  gap: 24rpx;
  margin-bottom: 20rpx;
}

.comp-meta {
  font-size: 24rpx;
  color: #6B7280;
}

.participants {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.participant-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 16rpx;
  background: #F9FAFB;
  border-radius: 16rpx;
}

.participant-card.leading {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border: 2rpx solid #F59E0B;
}

.participant-avatar {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.participant-name {
  font-size: 24rpx;
  color: #6B7280;
  margin-bottom: 8rpx;
}

.participant-score {
  font-size: 32rpx;
  font-weight: 700;
  color: #1F2937;
}

.comp-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  background: #F3F4F6;
  border-radius: 12rpx;
  text-align: center;
}

.action-btn text {
  font-size: 26rpx;
  color: #6B7280;
}

.action-btn.primary {
  background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
}

.action-btn.primary text {
  color: #ffffff;
}

.comp-winner {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.winner-label {
  font-size: 24rpx;
  color: #D97706;
}

.winner-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2937;
  flex: 1;
}

.winner-score {
  font-size: 28rpx;
  font-weight: 700;
  color: #D97706;
}

.comp-participants-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.summary-item {
  font-size: 24rpx;
  color: #6B7280;
  background: #F9FAFB;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

/* 弹窗样式 */
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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  background: #F9FAFB;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  min-width: 120rpx;
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
