<!-- SkillTreeSummary.vue - 技能树进度摘要组件 -->
<template>
  <view class="skill-tree-summary">
    <view class="section-header">
      <text class="section-title">技能树进度</text>
      <text class="section-badge">V6</text>
    </view>
    
    <view class="trees-grid">
      <view
        v-for="tree in skillTrees"
        :key="tree.id"
        class="tree-card"
        :style="{ borderLeftColor: tree.color }"
      >
        <view class="tree-icon-row">
          <text class="tree-icon">{{ tree.icon }}</text>
          <view class="tree-info">
            <text class="tree-name">{{ tree.name }}</text>
            <text class="tree-progress">{{ tree.unlocked }}/{{ tree.total }}</text>
          </view>
        </view>
        <!-- 进度条 -->
        <view class="progress-bar">
          <view
            class="progress-fill"
            :style="{
              width: progressPercent(tree.unlocked, tree.total) + '%',
              backgroundColor: tree.color
            }"
          ></view>
        </view>
        <!-- 进度标签 -->
        <view class="progress-labels">
          <text class="progress-label-left">已解锁 {{ tree.unlocked }}</text>
          <text class="progress-label-right">总计 {{ tree.total }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SkillTreeSummary',
  props: {
    skillTreeProgress: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      defaultTrees: [
        { id: 'knowledge', name: '知识探索', icon: '📚', color: '#4A90D9', unlocked: 0, total: 7 },
        { id: 'habit', name: '习惯养成', icon: '🌱', color: '#52C41A', unlocked: 0, total: 8 },
        { id: 'social', name: '社交达人', icon: '🤝', color: '#FA8C16', unlocked: 0, total: 7 },
        { id: 'creative', name: '创意大师', icon: '🎨', color: '#722ED1', unlocked: 0, total: 6 }
      ]
    }
  },
  computed: {
    skillTrees() {
      // 合并默认数据和传入数据
      return this.defaultTrees.map(tree => {
        const progress = this.skillTreeProgress[tree.id]
        if (progress && typeof progress === 'object') {
          return {
            ...tree,
            unlocked: progress.unlocked || 0,
            total: progress.total || tree.total
          }
        }
        // 如果是数组 [unlocked, total]
        if (Array.isArray(progress)) {
          return { ...tree, unlocked: progress[0] || 0, total: progress[1] || tree.total }
        }
        return tree
      })
    }
  },
  methods: {
    progressPercent(unlocked, total) {
      if (!total || total === 0) return 0
      return Math.round((unlocked / total) * 100)
    }
  }
}
</script>

<style scoped>
.skill-tree-summary {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 20rpx;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}
.section-badge {
  font-size: 18rpx;
  background: #F3E8FF;
  color: #8B5CF6;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}
.trees-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}
.tree-card {
  background: #FAFAFA;
  border-radius: 12rpx;
  padding: 20rpx;
  border-left: 6rpx solid #8B5CF6;
}
.tree-icon-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.tree-icon {
  font-size: 40rpx;
}
.tree-info {
  display: flex;
  flex-direction: column;
}
.tree-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}
.tree-progress {
  font-size: 22rpx;
  color: #666;
}
.progress-bar {
  height: 10rpx;
  background: #E5E7EB;
  border-radius: 5rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}
.progress-fill {
  height: 100%;
  border-radius: 5rpx;
  transition: width 0.3s ease;
}
.progress-labels {
  display: flex;
  justify-content: space-between;
}
.progress-label-left,
.progress-label-right {
  font-size: 18rpx;
  color: #9CA3AF;
}
</style>