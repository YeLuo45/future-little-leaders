<!-- 家庭仪表盘 - 家长端 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <text class="nav-title">家庭仪表盘</text>
    </view>

    <!-- 宝宝选择器 -->
    <view class="baby-selector-bar">
      <picker :range="babies" range-key="name" @change="onBabyChange" :value="currentBabyIndex">
        <view class="baby-picker">
          <text class="baby-emoji">{{ currentBabyEmoji }}</text>
          <text class="baby-name">{{ currentBabyName || '选择宝宝' }}</text>
          <text class="arrow">▼</text>
        </view>
      </picker>
    </view>

    <!-- 家庭成员 -->
    <view class="section">
      <text class="section-title">家庭成员</text>
      <scroll-view scroll-x class="members-scroll">
        <view class="members-row">
          <view v-for="member in familyMembers" :key="member.id" class="member-card">
            <text class="member-avatar">{{ member.icon || '👤' }}</text>
            <text class="member-name">{{ member.nickname }}</text>
            <view class="member-role-badge" :class="`role-${member.role}`">
              {{ roleLabels[member.role] || member.role }}
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-grid">
      <view class="stat-card">
        <text class="stat-icon">📝</text>
        <text class="stat-value">{{ stats.completedCount }}</text>
        <text class="stat-label">本周完成</text>
      </view>
      <view class="stat-card" @tap="goToAudit">
        <text class="stat-icon">🔍</text>
        <text class="stat-value">{{ stats.pendingCount }}</text>
        <text class="stat-label">待审核</text>
        <view v-if="stats.pendingCount > 0" class="stat-badge">!</view>
      </view>
      <view class="stat-card">
        <text class="stat-icon">🔥</text>
        <text class="stat-value">{{ stats.totalPoints }}</text>
        <text class="stat-label">已获积分</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">🏆</text>
        <text class="stat-value">{{ stats.continuousDays }}</text>
        <text class="stat-label">连续天数</text>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="section">
      <text class="section-title">快捷操作</text>
      <view class="quick-actions">
        <view class="action-card" @tap="goToAddTask">
          <text class="action-icon">➕</text>
          <text class="action-label">分配任务</text>
        </view>
        <view class="action-card" @tap="goToAudit">
          <text class="action-icon">🔍</text>
          <text class="action-label">审核任务</text>
        </view>
        <view class="action-card" @tap="goToMembers">
          <text class="action-icon">👥</text>
          <text class="action-label">家庭成员</text>
        </view>
      </view>
    </view>

    <!-- 最近成就 -->
    <view class="section" v-if="recentAchievements.length > 0">
      <text class="section-title">最近成就</text>
      <view v-for="achievement in recentAchievements" :key="achievement.id" class="achievement-card">
        <text class="achievement-icon">{{ achievement.icon }}</text>
        <view class="achievement-info">
          <text class="achievement-name">{{ achievement.name }}</text>
          <text class="achievement-desc">{{ achievement.description }}</text>
        </view>
      </view>
    </view>

    <!-- 返回首页 -->
    <view class="float-back" @tap="goHome">🏠</view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const babies = ref([]);
    const currentBabyIndex = ref(0);
    const currentBabyId = ref('');
    const familyMembers = ref([]);
    const allFlows = ref([]);

    const roleLabels = {
      parent: '家长',
      child: '孩子',
      elder: '长辈',
    };

    const emojis = ['👶', '👼', '🧒', '👦', '👧'];

    const currentBabyName = computed(() => {
      const baby = babies.value[currentBabyIndex.value];
      return baby ? baby.name : '';
    });

    const currentBabyEmoji = computed(() => {
      const baby = babies.value[currentBabyIndex.value];
      if (!baby) return '👶';
      const lastChar = baby.id ? baby.id.charAt(baby.id.length - 1) : '0';
      return emojis[parseInt(lastChar, 16) % 5];
    });

    const stats = computed(() => {
      if (!currentBabyId.value) {
        return { completedCount: 0, pendingCount: 0, totalPoints: 0, continuousDays: 0 };
      }
      const { getDashboardStats } = require('../../utils/FamilyGrowthContext');
      const data = getDashboardStats(currentBabyId.value);
      return {
        completedCount: data.weekCompleted || 0,
        pendingCount: data.pendingCount || 0,
        inProgressCount: data.inProgressCount || 0,
        totalPoints: data.totalPoints || 0,
        weeklyEarned: data.weeklyEarned || 0,
        continuousDays: data.continuousDays || 0,
        achievementCount: data.achievementCount || 0,
        totalAchievements: data.totalAchievements || 0,
        _raw: data,
      };
    });

    const recentAchievements = computed(() => {
      if (!currentBabyId.value) return [];
      const { getAchievementsSummary } = require('../../utils/FamilyGrowthContext');
      const summary = getAchievementsSummary(currentBabyId.value);
      return (summary.unlocked || []).slice(-3).reverse();
    });

    const loadFamilyMembers = () => {
      try {
        const { getFamilyMembers } = require('../../services/familyService');
        familyMembers.value = getFamilyMembers() || [];
      } catch (e) {
        console.error('加载家庭成员失败:', e);
      }
    };

    const loadBabies = () => {
      try {
        const stored = uni.getStorageSync('babies') || '[]';
        babies.value = typeof stored === 'string' ? JSON.parse(stored) : stored;
        const storedId = uni.getStorageSync('currentBabyId');
        currentBabyId.value = storedId || (babies.value[0]?.id || '');
        const idx = babies.value.findIndex(b => b.id === currentBabyId.value);
        currentBabyIndex.value = idx !== -1 ? idx : 0;
      } catch (e) {
        console.error('加载宝宝失败:', e);
      }
    };

    const loadFlows = () => {
      try {
        const { getChildFlows } = require('../../services/collaborationService');
        if (currentBabyId.value) {
          allFlows.value = getChildFlows(currentBabyId.value) || [];
        }
      } catch (e) {
        console.error('加载流转失败:', e);
      }
    };

    onMounted(() => {
      loadBabies();
      loadFamilyMembers();
      loadFlows();
    });

    const onBabyChange = (e) => {
      const idx = e.detail.value;
      currentBabyIndex.value = idx;
      if (babies.value[idx]) {
        currentBabyId.value = babies.value[idx].id;
        uni.setStorageSync('currentBabyId', currentBabyId.value);
        loadFlows();
      }
    };

    const goToAddTask = () => {
      uni.navigateTo({ url: '/pages/task/add-task' });
    };

    const goToAudit = () => {
      uni.navigateTo({ url: '/pages/task/task-audit' });
    };

    const goToMembers = () => {
      uni.navigateTo({ url: '/pages/family/family-members' });
    };

    const goHome = () => {
      uni.switchTab({ url: '/pages/index/index' });
    };

    return {
      babies,
      currentBabyIndex,
      currentBabyName,
      currentBabyEmoji,
      familyMembers,
      roleLabels,
      stats,
      recentAchievements,
      onBabyChange,
      goToAddTask,
      goToAudit,
      goToMembers,
      goHome,
    };
  }
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  padding: 90rpx 40rpx 60rpx;
}
.nav-title {
  color: white;
  font-size: 36rpx;
  font-weight: bold;
}
.baby-selector-bar {
  background: white;
  padding: 20rpx 30rpx;
}
.baby-picker {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.baby-emoji { font-size: 40rpx; }
.baby-name { font-size: 28rpx; color: #333; }
.arrow { font-size: 24rpx; color: #999; }
.section {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}
.members-scroll { width: 100%; }
.members-row {
  display: flex;
  gap: 24rpx;
}
.member-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 140rpx;
}
.member-avatar { font-size: 60rpx; margin-bottom: 8rpx; }
.member-name { font-size: 24rpx; color: #333; margin-bottom: 8rpx; }
.member-role-badge {
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  color: white;
}
.role-parent { background: #8B5CF6; }
.role-child { background: #3B82F6; }
.role-elder { background: #F59E0B; }
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  padding: 20rpx;
}
.stat-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.stat-icon { font-size: 48rpx; margin-bottom: 10rpx; }
.stat-value { font-size: 48rpx; font-weight: bold; color: #333; }
.stat-label { font-size: 24rpx; color: #999; margin-top: 8rpx; }
.stat-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: #EF4444;
  color: white;
  font-size: 20rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20rpx;
}
.action-card {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border-radius: 16rpx;
  padding: 30rpx 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.action-icon { font-size: 48rpx; margin-bottom: 10rpx; }
.action-label { font-size: 24rpx; color: white; }
.achievement-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  background: #F5F3FF;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}
.achievement-icon { font-size: 48rpx; }
.achievement-info { display: flex; flex-direction: column; }
.achievement-name { font-size: 28rpx; color: #333; font-weight: bold; }
.achievement-desc { font-size: 24rpx; color: #666; }
.float-back {
  position: fixed;
  bottom: 40rpx;
  right: 40rpx;
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  box-shadow: 0 4rpx 16rpx rgba(139, 92, 246, 0.4);
}
</style>
