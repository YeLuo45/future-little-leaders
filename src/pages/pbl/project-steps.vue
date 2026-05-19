<!-- V72 PBL Project Steps — 项目阶段指导页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">项目阶段</text>
      <view class="nav-right">
        <text class="info-icon" @tap="showGuide">📖</text>
      </view>
    </view>

    <!-- 项目选择器 -->
    <view class="project-selector" v-if="myProjects.length > 0">
      <scroll-view scroll-x class="project-tabs">
        <view
          v-for="project in myProjects"
          :key="project.id"
          class="project-tab"
          :class="{ active: currentProjectId === project.id }"
          @tap="selectProject(project.id)"
        >
          <text class="tab-name">{{ project.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 阶段进度展示 -->
    <view class="stage-progress" v-if="currentProject">
      <view class="progress-header">
        <text class="progress-title">{{ currentProject.name }}</text>
        <text class="progress-percent">{{ stageProgress }}%</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: stageProgress + '%' }"></view>
      </view>
      <view class="current-stage">
        <text class="stage-icon">{{ currentStageInfo?.icon }}</text>
        <text class="stage-label">当前阶段：{{ currentStageInfo?.label }}</text>
      </view>
    </view>

    <!-- 阶段列表 -->
    <scroll-view scroll-y class="stage-list">
      <view class="stage-card" v-for="stage in stages" :key="stage.key" :class="{ completed: isStageCompleted(stage.key), current: isCurrentStage(stage.key) }">
        <view class="stage-header">
          <view class="stage-order" :class="{ completed: isStageCompleted(stage.key), current: isCurrentStage(stage.key) }">
            <text v-if="!isStageCompleted(stage.key)">{{ stage.order }}</text>
            <text v-else>✓</text>
          </view>
          <view class="stage-title-area">
            <text class="stage-name">{{ stage.icon }} {{ stage.label }}</text>
            <text class="stage-desc">{{ getStageDescription(stage.key) }}</text>
          </view>
        </view>

        <!-- 任务列表 -->
        <view class="task-list" v-if="isCurrentStage(stage.key) && currentProgress">
          <view
            v-for="(task, index) in currentProgress.tasks"
            :key="task.id"
            class="task-item"
            :class="{ completed: task.completed }"
          >
            <view class="task-checkbox" @tap="toggleTask(index)">
              <text class="checkbox-icon">{{ task.completed ? '☑️' : '⬜' }}</text>
            </view>
            <text class="task-title">{{ task.title }}</text>
          </view>
        </view>

        <!-- 阶段操作 -->
        <view class="stage-actions" v-if="isCurrentStage(stage.key)">
          <button class="advance-btn" @tap="onAdvanceStage" v-if="!isLastStage">
            {{ isStageTasksCompleted ? '完成当前阶段' : '完成任务后继续' }}
          </button>
          <button class="complete-btn" @tap="onCompleteProject" v-else-if="isStageTasksCompleted">
            完成项目
          </button>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="myProjects.length === 0">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无进行中的项目</text>
        <button class="start-btn" @tap="goToLibrary">去项目库看看</button>
      </view>
    </scroll-view>

    <!-- 笔记弹窗 -->
    <view class="notes-popup" v-if="showNotes" @tap.self="showNotes = false">
      <view class="notes-dialog">
        <view class="notes-header">
          <text class="notes-title">项目笔记</text>
          <text class="close-icon" @tap="showNotes = false">×</text>
        </view>
        <textarea
          class="notes-input"
          v-model="notesContent"
          placeholder="记录你的项目心得、发现和问题..."
        ></textarea>
        <button class="save-btn" @tap="saveNotes">保存笔记</button>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions" v-if="currentProject">
      <button class="action-btn notes-btn" @tap="showNotes = true">
        <text class="btn-icon">📝</text>
        <text class="btn-text">笔记</text>
      </button>
      <button class="action-btn team-btn" @tap="goToTeam">
        <text class="btn-icon">👥</text>
        <text class="btn-text">团队</text>
      </button>
    </view>

    <!-- 底部 Tab -->
    <view class="bottom-tab">
      <view class="tab-item" @tap="goToLibrary">
        <text class="tab-icon">📚</text>
        <text class="tab-text">项目库</text>
      </view>
      <view class="tab-item active">
        <text class="tab-icon">📋</text>
        <text class="tab-text">项目阶段</text>
      </view>
      <view class="tab-item" @tap="goToTeam">
        <text class="tab-icon">👥</text>
        <text class="tab-text">团队协作</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usePblStore, PROJECT_STAGES, STAGE_INFO } from '@/stores/pblStore'

export default {
  setup() {
    const store = usePblStore()

    const showNotes = ref(false)
    const notesContent = ref('')

    const stages = computed(() => {
      return Object.entries(STAGE_INFO).map(([key, info]) => ({
        key,
        ...info
      })).sort((a, b) => a.order - b.order)
    })

    const myProjects = computed(() => store.getMyProjects())

    const currentProjectId = computed(() => store.currentProjectId)

    const currentProject = computed(() => {
      if (!currentProjectId.value) return myProjects.value[0] || null
      return store.getProjectById(currentProjectId.value)
    })

    const currentProgress = computed(() => {
      if (!currentProject.value) return null
      const team = store.myTeams.find(t => t.projectId === currentProject.value.id)
      if (!team) return null
      return store.getOrCreateProgress(currentProject.value.id, team.id, store.currentBabyId)
    })

    const currentStageInfo = computed(() => {
      if (!currentProgress.value) return STAGE_INFO[PROJECT_STAGES.EXPLORATION]
      return STAGE_INFO[currentProgress.value.currentStage]
    })

    const stageProgress = computed(() => {
      if (!currentProject.value) return 0
      return store.getStageProgress(currentProject.value.id)
    })

    const isLastStage = computed(() => {
      if (!currentProgress.value) return false
      return currentProgress.value.currentStage === PROJECT_STAGES.REFLECTION
    })

    const isStageTasksCompleted = computed(() => {
      if (!currentProgress.value) return false
      const tasks = currentProgress.value.tasks
      return tasks.length > 0 && tasks.every(t => t.completed)
    })

    onMounted(() => {
      store.init()
      if (myProjects.value.length > 0 && !currentProjectId.value) {
        store.selectProject(myProjects.value[0].id)
      }
      if (currentProgress.value) {
        notesContent.value = currentProgress.value.notes || ''
      }
    })

    const isStageCompleted = (stageKey) => {
      if (!currentProgress.value) return false
      const stages = Object.values(PROJECT_STAGES)
      const currentIndex = stages.indexOf(currentProgress.value.currentStage)
      const stageIndex = stages.indexOf(stageKey)
      return stageIndex < currentIndex
    }

    const isCurrentStage = (stageKey) => {
      if (!currentProgress.value) return stageKey === PROJECT_STAGES.EXPLORATION
      return currentProgress.value.currentStage === stageKey
    }

    const getStageDescription = (stageKey) => {
      const descriptions = {
        [PROJECT_STAGES.EXPLORATION]: '发现问题，确定研究主题',
        [PROJECT_STAGES.PLANNING]: '制定计划，分解任务',
        [PROJECT_STAGES.EXECUTION]: '动手实践，收集数据',
        [PROJECT_STAGES.PRESENTATION]: '整理成果，准备展示',
        [PROJECT_STAGES.REFLECTION]: '回顾总结，反思收获'
      }
      return descriptions[stageKey] || ''
    }

    const toggleTask = (index) => {
      if (!currentProject.value || !currentProgress.value) return
      const team = store.myTeams.find(t => t.projectId === currentProject.value.id)
      if (!team) return
      const task = currentProgress.value.tasks[index]
      if (task) {
        task.completed = !task.completed
        task.completedAt = task.completed ? new Date().toISOString() : null
        store.saveProjectProgress()
      }
    }

    const onAdvanceStage = () => {
      if (!isStageTasksCompleted.value) {
        uni.showToast({ title: '请先完成任务', icon: 'none' })
        return
      }
      if (!currentProject.value) return
      const team = store.myTeams.find(t => t.projectId === currentProject.value.id)
      if (!team) {
        uni.showToast({ title: '请先加入团队', icon: 'none' })
        return
      }
      const advanced = store.advanceStage(currentProject.value.id, team.id, store.currentBabyId)
      if (advanced) {
        uni.showToast({ title: '阶段完成！', icon: 'success' })
      }
    }

    const onCompleteProject = () => {
      if (!isStageTasksCompleted.value) {
        uni.showToast({ title: '请先完成任务', icon: 'none' })
        return
      }
      uni.showModal({
        title: '完成项目',
        content: '恭喜完成项目！是否确认提交？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({ title: '项目完成！🎉', icon: 'success' })
          }
        }
      })
    }

    const selectProject = (projectId) => {
      store.selectProject(projectId)
      const progress = store.getProjectProgress(projectId, store.myTeams[0]?.id, store.currentBabyId)
      if (progress) {
        notesContent.value = progress.notes || ''
      }
    }

    const saveNotes = () => {
      if (!currentProject.value) return
      const team = store.myTeams.find(t => t.projectId === currentProject.value.id)
      if (!team) return
      store.updateProgressNotes(currentProject.value.id, team.id, store.currentBabyId, notesContent.value)
      showNotes.value = false
      uni.showToast({ title: '笔记已保存', icon: 'success' })
    }

    const showGuide = () => {
      uni.showModal({
        title: 'PBL学习指南',
        content: '1. 从项目库选择感兴趣的项目\n2. 加入或创建团队\n3. 按照5个阶段完成任务\n4. 每个阶段完成后点击继续\n5. 记录项目笔记，总结收获',
        showCancel: false
      })
    }

    const goBack = () => {
      uni.navigateBack()
    }

    const goToLibrary = () => {
      uni.navigateTo({ url: '/pages/pbl/project-library' })
    }

    const goToTeam = () => {
      uni.navigateTo({ url: '/pages/pbl/team-collaboration' })
    }

    return {
      showNotes,
      notesContent,
      stages,
      myProjects,
      currentProjectId,
      currentProject,
      currentProgress,
      currentStageInfo,
      stageProgress,
      isLastStage,
      isStageTasksCompleted,
      isStageCompleted,
      isCurrentStage,
      getStageDescription,
      toggleTask,
      onAdvanceStage,
      onCompleteProject,
      selectProject,
      saveNotes,
      showGuide,
      goBack,
      goToLibrary,
      goToTeam
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #F0F5FF;
  padding-bottom: 200rpx;
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

.icon, .info-icon {
  font-size: 40rpx;
}

.project-selector {
  background: #FFFFFF;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.project-tabs {
  white-space: nowrap;
  padding: 0 16rpx;
}

.project-tab {
  display: inline-flex;
  align-items: center;
  padding: 12rpx 24rpx;
  margin: 0 8rpx;
  border-radius: 24rpx;
  background: #F5F5F5;
  transition: all 150ms;
}

.project-tab.active {
  background: #1890FF;
}

.tab-name {
  font-size: 26rpx;
  color: #666;
  white-space: nowrap;
}

.project-tab.active .tab-name {
  color: #FFFFFF;
}

.stage-progress {
  background: #FFFFFF;
  margin: 16rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.progress-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.progress-percent {
  font-size: 28rpx;
  font-weight: bold;
  color: #1890FF;
}

.progress-bar {
  height: 12rpx;
  background: #E6E6E6;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1890FF 0%, #52C41A 100%);
  border-radius: 6rpx;
  transition: width 0.3s;
}

.current-stage {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.stage-icon {
  font-size: 32rpx;
}

.stage-label {
  font-size: 26rpx;
  color: #666;
}

.stage-list {
  padding: 0 16rpx;
  height: calc(100vh - 600rpx);
}

.stage-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  border-left: 6rpx solid #E6E6E6;
}

.stage-card.completed {
  border-left-color: #52C41A;
  opacity: 0.7;
}

.stage-card.current {
  border-left-color: #1890FF;
  border: 2rpx solid #1890FF;
}

.stage-header {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.stage-order {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #E6E6E6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  color: #666;
  flex-shrink: 0;
}

.stage-order.completed {
  background: #52C41A;
  color: #FFFFFF;
}

.stage-order.current {
  background: #1890FF;
  color: #FFFFFF;
}

.stage-title-area {
  flex: 1;
}

.stage-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.stage-desc {
  font-size: 24rpx;
  color: #999;
}

.task-list {
  margin-top: 20rpx;
  padding-left: 64rpx;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #999;
}

.checkbox-icon {
  font-size: 32rpx;
}

.task-title {
  font-size: 26rpx;
  color: #333;
}

.stage-actions {
  margin-top: 20rpx;
  padding-left: 64rpx;
}

.advance-btn, .complete-btn {
  padding: 16rpx 32rpx;
  border-radius: 24rpx;
  font-size: 26rpx;
  border: none;
  color: #FFFFFF;
}

.advance-btn {
  background: #1890FF;
}

.complete-btn {
  background: #52C41A;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 24rpx;
}

.start-btn {
  padding: 12rpx 32rpx;
  background: #1890FF;
  color: #FFFFFF;
  border-radius: 24rpx;
  font-size: 26rpx;
  border: none;
}

.notes-popup {
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

.notes-dialog {
  width: 600rpx;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.notes-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-icon {
  font-size: 48rpx;
  color: #999;
}

.notes-input {
  width: 100%;
  height: 300rpx;
  border: 1rpx solid #E6E6E6;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 28rpx;
  text-align: left;
  box-sizing: border-box;
}

.save-btn {
  margin-top: 20rpx;
  padding: 16rpx;
  background: #1890FF;
  color: #FFFFFF;
  border-radius: 24rpx;
  font-size: 28rpx;
  border: none;
}

.bottom-actions {
  position: fixed;
  bottom: 120rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 32rpx;
  padding: 16rpx;
  background: transparent;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 32rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  border: none;
}

.btn-icon {
  font-size: 36rpx;
  margin-bottom: 4rpx;
}

.btn-text {
  font-size: 22rpx;
  color: #666;
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
