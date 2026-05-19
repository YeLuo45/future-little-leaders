<!-- V72 PBL Team Collaboration — 小组协作页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">团队协作</text>
      <view class="nav-right">
        <text class="add-icon" @tap="showCreateTeam">➕</text>
      </view>
    </view>

    <!-- 我的团队 -->
    <view class="section">
      <text class="section-title">我的团队</text>
      <view class="team-list">
        <view
          v-for="team in myTeams"
          :key="team.id"
          class="team-card"
          :class="{ active: currentTeamId === team.id }"
          @tap="selectTeam(team.id)"
        >
          <view class="team-header">
            <text class="team-icon">👥</text>
            <view class="team-info">
              <text class="team-name">{{ team.name }}</text>
              <text class="team-project">{{ getProjectName(team.projectId) }}</text>
            </view>
            <view class="member-count">
              <text class="count">{{ getMemberCount(team.id) }}</text>
              <text class="label">人</text>
            </view>
          </view>
          <view class="team-members">
            <view
              v-for="member in getTeamMembers(team.id)"
              :key="member.id"
              class="member-tag"
              :style="{ borderColor: getRoleColor(member.role) }"
            >
              <text class="member-icon">{{ getRoleIcon(member.role) }}</text>
              <text class="member-name">{{ member.name }}</text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="myTeams.length === 0">
          <text class="empty-icon">👥</text>
          <text class="empty-text">你还没有加入任何团队</text>
          <button class="join-btn" @tap="showJoinTeam">加入团队</button>
        </view>
      </view>
    </view>

    <!-- 团队详情 -->
    <view class="section team-detail" v-if="currentTeam">
      <view class="detail-header">
        <text class="detail-title">{{ currentTeam.name }}</text>
        <view class="team-status">
          <text class="status-dot"></text>
          <text class="status-text">进行中</text>
        </view>
      </view>

      <!-- 角色分配 -->
      <view class="role-section">
        <text class="sub-title">角色分配</text>
        <view class="role-list">
          <view
            v-for="roleKey in roleKeys"
            :key="roleKey"
            class="role-item"
            :class="{ assigned: getMemberByRole(roleKey) }"
          >
            <view class="role-info">
              <text class="role-icon">{{ ROLE_INFO[roleKey].icon }}</text>
              <text class="role-name">{{ ROLE_INFO[roleKey].label }}</text>
            </view>
            <view class="role-assignee" v-if="getMemberByRole(roleKey)">
              <text class="assignee-name">{{ getMemberByRole(roleKey).name }}</text>
              <text class="change-btn" @tap="changeRole(getMemberByRole(roleKey).id)" v-if="isLeader">改</text>
            </view>
            <text class="unassigned" v-else>待分配</text>
          </view>
        </view>
      </view>

      <!-- 成果展示 -->
      <view class="presentation-section">
        <text class="sub-title">成果展示</text>
        <view class="presentation-area">
          <textarea
            class="presentation-input"
            v-model="presentationContent"
            placeholder="记录团队成果和发现..."
          ></textarea>
          <button class="save-presentation-btn" @tap="savePresentation">保存成果</button>
        </view>
      </view>

      <!-- 团队操作 -->
      <view class="team-actions">
        <button class="leave-btn" @tap="onLeaveTeam" v-if="!isLeader">
          退出团队
        </button>
        <button class="disband-btn" @tap="onDisbandTeam" v-if="isLeader">
          解散团队
        </button>
      </view>
    </view>

    <!-- 全部团队 -->
    <view class="section">
      <text class="section-title">全部团队</text>
      <view class="all-teams-list">
        <view
          v-for="team in allTeams"
          :key="team.id"
          class="team-card simple"
        >
          <view class="team-header">
            <text class="team-icon">👥</text>
            <view class="team-info">
              <text class="team-name">{{ team.name }}</text>
              <text class="team-project">{{ getProjectName(team.projectId) }}</text>
            </view>
            <button class="join-team-btn" @tap="onJoinTeam(team.id)" v-if="!isInTeam(team.id)">
              加入
            </button>
            <text class="joined-tag" v-else>已加入</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 创建团队弹窗 -->
    <view class="popup" v-if="showCreate" @tap.self="showCreate = false">
      <view class="popup-dialog">
        <view class="popup-header">
          <text class="popup-title">创建团队</text>
          <text class="close-icon" @tap="showCreate = false">×</text>
        </view>
        <view class="popup-body">
          <view class="form-item">
            <text class="form-label">选择项目</text>
            <picker :value="selectedProjectIndex" :range="projectOptions" range-key="name" @change="onProjectChange">
              <view class="picker-value">
                {{ projectOptions[selectedProjectIndex]?.name || '请选择' }}
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">团队名称</text>
            <input class="form-input" v-model="newTeamName" placeholder="请输入团队名称" />
          </view>
          <view class="form-item">
            <text class="form-label">你的名字</text>
            <input class="form-input" v-model="myName" placeholder="请输入你的名字" />
          </view>
        </view>
        <button class="confirm-btn" @tap="onCreateTeam">创建</button>
      </view>
    </view>

    <!-- 加入团队弹窗 -->
    <view class="popup" v-if="showJoin" @tap.self="showJoin = false">
      <view class="popup-dialog">
        <view class="popup-header">
          <text class="popup-title">加入团队</text>
          <text class="close-icon" @tap="showJoin = false">×</text>
        </view>
        <view class="popup-body">
          <view class="form-item">
            <text class="form-label">选择团队</text>
            <picker :value="selectedTeamIndex" :range="availableTeams" range-key="name" @change="onTeamSelect">
              <view class="picker-value">
                {{ availableTeams[selectedTeamIndex]?.name || '请选择' }}
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">你的名字</text>
            <input class="form-input" v-model="myName" placeholder="请输入你的名字" />
          </view>
          <view class="form-item">
            <text class="form-label">选择角色</text>
            <picker :value="selectedRoleIndex" :range="roleOptions" @change="onRoleChange">
              <view class="picker-value">
                {{ roleOptions[selectedRoleIndex] || '请选择' }}
              </view>
            </picker>
          </view>
        </view>
        <button class="confirm-btn" @tap="onConfirmJoin">加入</button>
      </view>
    </view>

    <!-- 底部 Tab -->
    <view class="bottom-tab">
      <view class="tab-item" @tap="goToLibrary">
        <text class="tab-icon">📚</text>
        <text class="tab-text">项目库</text>
      </view>
      <view class="tab-item" @tap="goToSteps">
        <text class="tab-icon">📋</text>
        <text class="tab-text">项目阶段</text>
      </view>
      <view class="tab-item active">
        <text class="tab-icon">👥</text>
        <text class="tab-text">团队协作</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usePblStore, TEAM_ROLES, ROLE_INFO } from '@/stores/pblStore'

export default {
  setup() {
    const store = usePblStore()

    // 弹窗状态
    const showCreate = ref(false)
    const showJoin = ref(false)
    const selectedProjectIndex = ref(0)
    const selectedTeamIndex = ref(0)
    const selectedRoleIndex = ref(0)
    const newTeamName = ref('')
    const myName = ref('')
    const presentationContent = ref('')

    const roleKeys = computed(() => Object.keys(TEAM_ROLES))

    const myTeams = computed(() => store.myTeams)
    const allTeams = computed(() => store.teams)
    const currentTeamId = computed(() => store.currentTeamId)
    const currentTeam = computed(() => store.currentTeam)

    const isLeader = computed(() => {
      if (!currentTeam.value || !store.currentBabyId) return false
      const member = store.teamMembers.find(
        m => m.teamId === currentTeam.value.id && m.babyId === store.currentBabyId
      )
      return member?.role === TEAM_ROLES.LEADER
    })

    const projects = computed(() => store.projects)

    const projectOptions = computed(() => {
      return projects.value.map(p => ({ id: p.id, name: p.name }))
    })

    const availableTeams = computed(() => {
      return allTeams.value.filter(t => !store.getTeamMembers(t.id).some(m => m.babyId === store.currentBabyId))
    })

    const roleOptions = computed(() => {
      return Object.entries(ROLE_INFO).map(([key, info]) => info.label)
    })

    onMounted(() => {
      store.init()
    })

    const getProjectName = (projectId) => {
      const project = store.getProjectById(projectId)
      return project?.name || '未知项目'
    }

    const getMemberCount = (teamId) => {
      return store.getTeamMembers(teamId).length
    }

    const getTeamMembers = (teamId) => {
      return store.getTeamMembers(teamId)
    }

    const getMemberByRole = (roleKey) => {
      if (!currentTeam.value) return null
      return store.getTeamMembers(currentTeam.value.id).find(m => m.role === roleKey)
    }

    const getRoleIcon = (role) => ROLE_INFO[role]?.icon || '👤'
    const getRoleColor = (role) => ROLE_INFO[role]?.color || '#999'

    const isInTeam = (teamId) => {
      return store.getTeamMembers(teamId).some(m => m.babyId === store.currentBabyId)
    }

    const selectTeam = (teamId) => {
      store.selectTeam(teamId)
      const progress = store.getProjectProgress(
        store.teams.find(t => t.id === teamId)?.projectId,
        teamId,
        store.currentBabyId
      )
      presentationContent.value = progress?.notes || ''
    }

    const showCreateTeam = () => {
      newTeamName.value = ''
      myName.value = ''
      selectedProjectIndex.value = 0
      showCreate.value = true
    }

    const onProjectChange = (e) => {
      selectedProjectIndex.value = e.detail.value
    }

    const onCreateTeam = () => {
      if (!newTeamName.value.trim()) {
        uni.showToast({ title: '请输入团队名称', icon: 'none' })
        return
      }
      if (!myName.value.trim()) {
        uni.showToast({ title: '请输入你的名字', icon: 'none' })
        return
      }
      const projectId = projectOptions.value[selectedProjectIndex.value]?.id
      if (!projectId) {
        uni.showToast({ title: '请选择项目', icon: 'none' })
        return
      }

      const team = store.createTeam(projectId, newTeamName.value)
      store.joinTeam(team.id, store.currentBabyId, myName.value, TEAM_ROLES.LEADER)
      store.selectTeam(team.id)

      showCreate.value = false
      uni.showToast({ title: '团队创建成功', icon: 'success' })
    }

    const showJoinTeam = () => {
      if (availableTeams.value.length === 0) {
        uni.showToast({ title: '暂无可加入的团队', icon: 'none' })
        return
      }
      myName.value = ''
      selectedRoleIndex.value = 0
      showJoin.value = true
    }

    const onTeamSelect = (e) => {
      selectedTeamIndex.value = e.detail.value
    }

    const onRoleChange = (e) => {
      selectedRoleIndex.value = e.detail.value
    }

    const onJoinTeam = (teamId) => {
      const team = allTeams.value.find(t => t.id === teamId)
      if (!team) return

      uni.showModal({
        title: '加入团队',
        content: `确定加入「${team.name}」吗？`,
        success: (res) => {
          if (res.confirm) {
            const roleKey = Object.keys(TEAM_ROLES)[selectedRoleIndex.value]
            store.joinTeam(teamId, store.currentBabyId, myName.value || '我', roleKey)
            store.selectTeam(teamId)
            showJoin.value = false
            uni.showToast({ title: '加入成功', icon: 'success' })
          }
        }
      })
    }

    const onConfirmJoin = () => {
      if (!myName.value.trim()) {
        uni.showToast({ title: '请输入你的名字', icon: 'none' })
        return
      }
      const team = availableTeams.value[selectedTeamIndex.value]
      if (!team) {
        uni.showToast({ title: '请选择团队', icon: 'none' })
        return
      }
      const roleKey = Object.keys(TEAM_ROLES)[selectedRoleIndex.value]
      store.joinTeam(team.id, store.currentBabyId, myName.value, roleKey)
      store.selectTeam(team.id)
      showJoin.value = false
      uni.showToast({ title: '加入成功', icon: 'success' })
    }

    const changeRole = (memberId) => {
      uni.showModal({
        title: '修改角色',
        content: '请选择新角色',
        success: (res) => {
          if (res.confirm) {
            const roleKey = Object.keys(TEAM_ROLES)[selectedRoleIndex.value]
            store.updateMemberRole(memberId, roleKey)
            uni.showToast({ title: '角色已修改', icon: 'success' })
          }
        }
      })
    }

    const savePresentation = () => {
      if (!currentTeam.value) return
      const progress = store.getOrCreateProgress(
        currentTeam.value.projectId,
        currentTeam.value.id,
        store.currentBabyId
      )
      store.updateProgressNotes(
        currentTeam.value.projectId,
        currentTeam.value.id,
        store.currentBabyId,
        presentationContent.value
      )
      uni.showToast({ title: '成果已保存', icon: 'success' })
    }

    const onLeaveTeam = () => {
      if (!currentTeam.value) return
      uni.showModal({
        title: '退出团队',
        content: '确定退出该团队吗？',
        success: (res) => {
          if (res.confirm) {
            store.leaveTeam(currentTeam.value.id, store.currentBabyId)
            store.selectTeam(null)
            uni.showToast({ title: '已退出团队', icon: 'success' })
          }
        }
      })
    }

    const onDisbandTeam = () => {
      if (!currentTeam.value) return
      uni.showModal({
        title: '解散团队',
        content: '确定解散该团队吗？此操作不可恢复！',
        success: (res) => {
          if (res.confirm) {
            // 移除所有成员
            const members = store.getTeamMembers(currentTeam.value.id)
            members.forEach(m => {
              store.leaveTeam(currentTeam.value.id, m.babyId)
            })
            store.selectTeam(null)
            uni.showToast({ title: '团队已解散', icon: 'success' })
          }
        }
      })
    }

    const goBack = () => {
      uni.navigateBack()
    }

    const goToLibrary = () => {
      uni.navigateTo({ url: '/pages/pbl/project-library' })
    }

    const goToSteps = () => {
      uni.navigateTo({ url: '/pages/pbl/project-steps' })
    }

    return {
      showCreate,
      showJoin,
      selectedProjectIndex,
      selectedTeamIndex,
      selectedRoleIndex,
      newTeamName,
      myName,
      presentationContent,
      roleKeys,
      myTeams,
      allTeams,
      currentTeamId,
      currentTeam,
      isLeader,
      projectOptions,
      availableTeams,
      roleOptions,
      ROLE_INFO,
      getProjectName,
      getMemberCount,
      getTeamMembers,
      getMemberByRole,
      getRoleIcon,
      getRoleColor,
      isInTeam,
      selectTeam,
      showCreateTeam,
      onProjectChange,
      onCreateTeam,
      showJoinTeam,
      onTeamSelect,
      onRoleChange,
      onJoinTeam,
      onConfirmJoin,
      changeRole,
      savePresentation,
      onLeaveTeam,
      onDisbandTeam,
      goBack,
      goToLibrary,
      goToSteps
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 120rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #F0F0F0;
}

.nav-left, .nav-right {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.icon, .add-icon {
  font-size: 40rpx;
}

.section {
  margin: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.team-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  border: 2rpx solid transparent;
}

.team-card.active {
  border-color: #1890FF;
}

.team-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.team-icon {
  font-size: 48rpx;
}

.team-info {
  flex: 1;
}

.team-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.team-project {
  font-size: 24rpx;
  color: #999;
}

.member-count {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.member-count .count {
  font-size: 32rpx;
  font-weight: bold;
  color: #1890FF;
}

.member-count .label {
  font-size: 22rpx;
  color: #999;
}

.team-members {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #F0F0F0;
}

.member-tag {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 12rpx;
  border-radius: 16rpx;
  background: #F5F5F5;
  border: 2rpx solid;
}

.member-icon {
  font-size: 24rpx;
}

.member-name {
  font-size: 22rpx;
  color: #333;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  background: #FFFFFF;
  border-radius: 16rpx;
}

.empty-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.join-btn {
  padding: 12rpx 32rpx;
  background: #1890FF;
  color: #FFFFFF;
  border-radius: 24rpx;
  font-size: 26rpx;
  border: none;
}

.team-detail {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.detail-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.team-status {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #52C41A;
}

.status-text {
  font-size: 24rpx;
  color: #52C41A;
}

.sub-title {
  font-size: 26rpx;
  font-weight: 500;
  color: #666;
  margin-bottom: 16rpx;
  display: block;
}

.role-section {
  margin-bottom: 24rpx;
}

.role-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.role-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx;
  background: #F9F9F9;
  border-radius: 12rpx;
}

.role-item.assigned {
  background: #E6F7FF;
}

.role-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.role-icon {
  font-size: 32rpx;
}

.role-name {
  font-size: 26rpx;
  color: #333;
}

.role-assignee {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.assignee-name {
  font-size: 24rpx;
  color: #1890FF;
}

.change-btn {
  font-size: 22rpx;
  color: #999;
  padding: 4rpx 12rpx;
  background: #FFFFFF;
  border-radius: 8rpx;
}

.unassigned {
  font-size: 24rpx;
  color: #999;
}

.presentation-section {
  margin-bottom: 24rpx;
}

.presentation-area {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.presentation-input {
  width: 100%;
  height: 200rpx;
  border: 1rpx solid #E6E6E6;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 26rpx;
  text-align: left;
  box-sizing: border-box;
}

.save-presentation-btn {
  padding: 12rpx;
  background: #1890FF;
  color: #FFFFFF;
  border-radius: 20rpx;
  font-size: 26rpx;
  border: none;
}

.team-actions {
  display: flex;
  gap: 16rpx;
}

.leave-btn, .disband-btn {
  flex: 1;
  padding: 14rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  border: none;
}

.leave-btn {
  background: #FFFFFF;
  color: #666;
  border: 1rpx solid #E6E6E6;
}

.disband-btn {
  background: #FF4D4F;
  color: #FFFFFF;
}

.all-teams-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.team-card.simple {
  padding: 16rpx;
}

.team-card.simple .team-header {
  gap: 12rpx;
}

.team-card.simple .team-icon {
  font-size: 36rpx;
}

.team-card.simple .team-name {
  font-size: 26rpx;
}

.join-team-btn {
  padding: 8rpx 20rpx;
  background: #1890FF;
  color: #FFFFFF;
  border-radius: 16rpx;
  font-size: 22rpx;
  border: none;
}

.joined-tag {
  font-size: 22rpx;
  color: #52C41A;
}

.popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.popup-dialog {
  width: 600rpx;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-icon {
  font-size: 48rpx;
  color: #999;
}

.popup-body {
  margin-bottom: 24rpx;
}

.form-item {
  margin-bottom: 20rpx;
}

.form-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #E6E6E6;
  border-radius: 12rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.picker-value {
  height: 80rpx;
  border: 1rpx solid #E6E6E6;
  border-radius: 12rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  color: #333;
}

.confirm-btn {
  width: 100%;
  padding: 16rpx;
  background: #1890FF;
  color: #FFFFFF;
  border-radius: 24rpx;
  font-size: 28rpx;
  border: none;
}

.bottom-tab {
  display: flex;
  justify-content: space-around;
  padding: 16rpx 0;
  background: #FFFFFF;
  border-top: 1rpx solid #F0F0F0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx 40rpx;
}

.tab-item.active .tab-icon,
.tab-item.active .tab-text {
  color: #1890FF;
}

.tab-icon {
  font-size: 40rpx;
  margin-bottom: 4rpx;
}

.tab-text {
  font-size: 22rpx;
  color: #999;
}
</style>
