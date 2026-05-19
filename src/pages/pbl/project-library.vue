<!-- V72 PBL Project Library — PBL项目库页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">PBL项目库</text>
      <view class="nav-right">
        <text class="filter-icon" @tap="showFilter = !showFilter">🔍</text>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ totalProjects }}</text>
        <text class="stat-label">全部项目</text>
      </view>
      <view class="stat-item" v-for="(count, cat) in projectsByCategory" :key="cat">
        <text class="stat-value">{{ count }}</text>
        <text class="stat-label">{{ getCategoryLabel(cat) }}</text>
      </view>
    </view>

    <!-- 筛选面板 -->
    <view class="filter-panel" v-if="showFilter">
      <view class="filter-section">
        <text class="filter-title">分类</text>
        <view class="filter-tags">
          <view
            class="filter-tag"
            :class="{ active: filterCategory === null }"
            @tap="applyFilter(null, filterDifficulty)"
          >
            全部
          </view>
          <view
            v-for="(info, key) in CATEGORY_INFO"
            :key="key"
            class="filter-tag"
            :class="{ active: filterCategory === key }"
            :style="filterCategory === key ? { background: info.color } : {}"
            @tap="applyFilter(key, filterDifficulty)"
          >
            {{ info.icon }} {{ info.label }}
          </view>
        </view>
      </view>
      <view class="filter-section">
        <text class="filter-title">难度</text>
        <view class="filter-tags">
          <view
            class="filter-tag"
            :class="{ active: filterDifficulty === null }"
            @tap="applyFilter(filterCategory, null)"
          >
            全部
          </view>
          <view
            v-for="(info, key) in DIFFICULTY_INFO"
            :key="key"
            class="filter-tag"
            :class="{ active: filterDifficulty === key }"
            :style="filterDifficulty === key ? { background: info.color } : {}"
            @tap="applyFilter(filterCategory, key)"
          >
            {{ info.label }}
          </view>
        </view>
      </view>
    </view>

    <!-- 项目列表 -->
    <scroll-view scroll-y class="project-list">
      <view class="project-grid">
        <view
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
          @tap="onProjectTap(project)"
        >
          <view class="project-cover" :style="{ background: getCategoryColor(project.category) }">
            <text class="project-icon">{{ getCategoryIcon(project.category) }}</text>
          </view>
          <view class="project-info">
            <text class="project-name">{{ project.name }}</text>
            <text class="project-desc">{{ project.description }}</text>
            <view class="project-meta">
              <text class="meta-tag difficulty" :style="{ color: getDifficultyColor(project.difficulty) }">
                {{ getDifficultyLabel(project.difficulty) }}
              </text>
              <text class="meta-tag duration">⏱️ {{ project.duration }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredProjects.length === 0">
        <text class="empty-icon">📂</text>
        <text class="empty-text">暂无符合条件的项目</text>
        <button class="reset-btn" @tap="resetFilter">重置筛选</button>
      </view>
    </scroll-view>

    <!-- 底部 Tab -->
    <view class="bottom-tab">
      <view class="tab-item active">
        <text class="tab-icon">📚</text>
        <text class="tab-text">项目库</text>
      </view>
      <view class="tab-item" @tap="goToSteps">
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
import { usePblStore, CATEGORY_INFO, DIFFICULTY_INFO, DIFFICULTY_LEVELS } from '@/stores/pblStore'

export default {
  setup() {
    const store = usePblStore()

    const showFilter = ref(false)
    const filterCategory = ref(null)
    const filterDifficulty = ref(null)

    const filteredProjects = computed(() => {
      let result = store.projects
      if (filterCategory.value) {
        result = result.filter(p => p.category === filterCategory.value)
      }
      if (filterDifficulty.value) {
        result = result.filter(p => p.difficulty === filterDifficulty.value)
      }
      return result
    })

    const totalProjects = computed(() => store.projects.length)
    const projectsByCategory = computed(() => store.projectsByCategory)

    onMounted(() => {
      store.init()
    })

    const applyFilter = (category, difficulty) => {
      filterCategory.value = category
      filterDifficulty.value = difficulty
      showFilter.value = false
    }

    const resetFilter = () => {
      filterCategory.value = null
      filterDifficulty.value = null
    }

    const getCategoryLabel = (cat) => {
      return CATEGORY_INFO[cat]?.label || cat
    }

    const getCategoryIcon = (cat) => {
      return CATEGORY_INFO[cat]?.icon || '📁'
    }

    const getCategoryColor = (cat) => {
      return CATEGORY_INFO[cat]?.color || '#999'
    }

    const getDifficultyLabel = (level) => {
      return DIFFICULTY_INFO[level]?.label || ''
    }

    const getDifficultyColor = (level) => {
      return DIFFICULTY_INFO[level]?.color || '#999'
    }

    const onProjectTap = (project) => {
      store.selectProject(project.id)
      uni.showModal({
        title: project.name,
        content: `${project.description}\n\n难度：${getDifficultyLabel(project.difficulty)}\n时长：${project.duration}\n阶段：${project.stages.length}个阶段`,
        confirmText: '开始项目',
        cancelText: '关闭',
        success: (res) => {
          if (res.confirm) {
            goToSteps()
          }
        }
      })
    }

    const goBack = () => {
      uni.navigateBack()
    }

    const goToSteps = () => {
      uni.navigateTo({ url: '/pages/pbl/project-steps' })
    }

    const goToTeam = () => {
      uni.navigateTo({ url: '/pages/pbl/team-collaboration' })
    }

    return {
      showFilter,
      filterCategory,
      filterDifficulty,
      filteredProjects,
      totalProjects,
      projectsByCategory,
      CATEGORY_INFO,
      DIFFICULTY_INFO,
      applyFilter,
      resetFilter,
      getCategoryLabel,
      getCategoryIcon,
      getCategoryColor,
      getDifficultyLabel,
      getDifficultyColor,
      onProjectTap,
      goBack,
      goToSteps,
      goToTeam
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

.icon, .filter-icon {
  font-size: 40rpx;
}

.stats-card {
  display: flex;
  background: #FFFFFF;
  padding: 24rpx;
  margin: 16rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
  display: block;
}

.filter-panel {
  background: #FFFFFF;
  padding: 20rpx 24rpx;
  margin: 0 16rpx 16rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.filter-section {
  margin-bottom: 16rpx;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-title {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
  display: block;
  font-weight: 500;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.filter-tag {
  padding: 10rpx 20rpx;
  border-radius: 24rpx;
  background: #F5F5F5;
  font-size: 24rpx;
  color: #666;
  transition: all 150ms;
}

.filter-tag.active {
  background: #1890FF;
  color: #FFFFFF;
}

.project-list {
  padding: 0 16rpx;
  height: calc(100vh - 500rpx);
}

.project-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.project-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  display: flex;
}

.project-cover {
  width: 160rpx;
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.project-icon {
  font-size: 64rpx;
}

.project-info {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
}

.project-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.project-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  display: flex;
  gap: 16rpx;
  margin-top: auto;
  padding-top: 12rpx;
}

.meta-tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  background: #F5F5F5;
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

.reset-btn {
  padding: 12rpx 32rpx;
  background: #1890FF;
  color: #FFFFFF;
  border-radius: 24rpx;
  font-size: 26rpx;
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
