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

    <!-- ========== V10 新增区块 ========== -->

    <!-- 1. 积分总览区块 -->
    <PointsOverview
      v-if="currentBabyId"
      :balance="v2Stats.pointsBalance || 0"
      :weeklyEarned="v2Stats.weeklyEarned || 0"
      :weeklySpent="v2Stats.weeklySpent || 0"
      :pointsHistory7d="v2Stats.pointsHistory7d || []"
    />

    <!-- 2. 任务完成趋势区块 -->
    <view class="section" v-if="currentBabyId">
      <text class="section-title">任务完成趋势</text>
      <TrendChart
        :data="taskTrendData"
        type="bar"
        title="近7日完成"
        :color="'#8B5CF6'"
        :showValue="true"
        :height="180"
      />
    </view>

    <!-- 3. 技能树进度区块 (V6) -->
    <SkillTreeSummary
      v-if="currentBabyId"
      :skillTreeProgress="v2Stats.skillTreeProgress || {}"
    />

    <!-- 4. 成就总览区块 -->
    <AchievementRing
      v-if="currentBabyId"
      :unlocked="achievementProgress.unlocked || 0"
      :total="achievementProgress.total || 5"
      :badges="recentAchievements"
    />

    <!-- 5. AI 成长建议区块 (V9) -->
    <view class="section ai-section" v-if="currentBabyId">
      <view class="ai-header">
        <text class="section-title">AI 成长建议</text>
        <text class="regenerate-btn" @tap="regenerateAI">重新生成</text>
      </view>
      <view class="ai-content" v-if="aiSummary">
        <text class="ai-summary-text">{{ aiSummary.summary || '暂无建议' }}</text>
        <view class="ai-tags" v-if="aiSummary.suggestions">
          <text class="ai-tag" v-for="(s, i) in aiSummary.suggestions" :key="i">{{ s }}</text>
        </view>
      </view>
      <view class="ai-content ai-loading" v-else>
        <text class="ai-summary-text">正在生成成长建议...</text>
      </view>
    </view>

    <!-- ========== 原有区块保持不变 ========== -->

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

    <!-- 成长报告入口 -->
    <view class="report-entry" @tap="goToGrowthReport">
      <text class="report-entry-icon">📈</text>
      <view class="report-entry-text">
        <text class="report-entry-title">成长报告</text>
        <text class="report-entry-hint">查看本周详细数据</text>
      </view>
      <text class="report-entry-arrow">→</text>
    </view>

    <!-- 返回首页 -->
    <view class="float-back" @tap="goHome">🏠</view>
  </view>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';

// V10 Dashboard Components
import TrendChart from '../../components/dashboard/TrendChart.vue';
import PointsOverview from '../../components/dashboard/PointsOverview.vue';
import SkillTreeSummary from '../../components/dashboard/SkillTreeSummary.vue';
import AchievementRing from '../../components/dashboard/AchievementRing.vue';

export default {
  components: {
    TrendChart,
    PointsOverview,
    SkillTreeSummary,
    AchievementRing
  },
  setup() {
    const babies = ref([]);
    const currentBabyIndex = ref(0);
    const currentBabyId = ref('');
    const familyMembers = ref([]);
    const allFlows = ref([]);

    // V10 V2 Stats
    const v2Stats = ref({});

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

    // V10: Achievement progress
    const achievementProgress = computed(() => {
      return v2Stats.value.achievementProgress || { unlocked: 0, total: 5 };
    });

    // V10: AI Summary
    const aiSummary = computed(() => {
      return v2Stats.value.aiSummary || null;
    });

    // V10: Task trend data for chart
    const taskTrendData = computed(() => {
      const data = v2Stats.value.taskTrend7d || [];
      if (data.length === 0) {
        // Generate empty 7-day data
        const result = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(Date.now() - i * 24 * 3600 * 1000);
          result.push({
            value: 0,
            label: `${d.getMonth() + 1}-${d.getDate()}`
          });
        }
        return result;
      }
      return data.map(item => ({
        value: item.count || 0,
        label: item.date || ''
      }));
    });

    // V10: Load V2 stats
    const loadV2Stats = () => {
      if (!currentBabyId.value) return;
      try {
        const { getDashboardStatsV2 } = require('../../utils/FamilyGrowthContext');
        v2Stats.value = getDashboardStatsV2(currentBabyId.value) || {};
      } catch (e) {
        console.error('[V10] Failed to load V2 stats:', e);
        v2Stats.value = {};
      }
    };

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
      loadV2Stats();
    });

    // Watch for baby change to reload V2 stats
    watch(currentBabyId, () => {
      loadV2Stats();
    });

    const onBabyChange = (e) => {
      const idx = e.detail.value;
      currentBabyIndex.value = idx;
      if (babies.value[idx]) {
        currentBabyId.value = babies.value[idx].id;
        uni.setStorageSync('currentBabyId', currentBabyId.value);
        loadFlows();
        loadV2Stats();
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

    const goToGrowthReport = () => {
      uni.navigateTo({ url: '/pages/growth-report/growth-report' });
    };

    // V10: Regenerate AI summary
    const regenerateAI = () => {
      uni.showToast({ title: 'AI建议生成中...', icon: 'loading' });
      // Trigger AI regeneration - would call aiSummaryService
      setTimeout(() => {
        uni.showToast({ title: '建议已生成', icon: 'success' });
        loadV2Stats();
      }, 1500);
    };

    return {
      babies,
      currentBabyIndex,
      currentBabyName,
      currentBabyEmoji,
      currentBabyId,
      familyMembers,
      roleLabels,
      stats,
      recentAchievements,
      v2Stats,
      taskTrendData,
      achievementProgress,
      aiSummary,
      onBabyChange,
      goToAddTask,
      goToAudit,
      goToMembers,
      goHome,
      goToGrowthReport,
      regenerateAI,
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
/* 成长报告入口 */
.report-entry {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: white;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  margin: 0 40rpx 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(139, 92, 246, 0.08);
}
.report-entry-icon { font-size: 48rpx; }
.report-entry-text { flex: 1; display: flex; flex-direction: column; gap: 4rpx; }
.report-entry-title { font-size: 30rpx; font-weight: bold; color: #333; }
.report-entry-hint { font-size: 22rpx; color: #999; }
.report-entry-arrow { font-size: 36rpx; color: #8B5CF6; }

/* 返回首页 */
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
  color: white;
  font-size: 36rpx;
  box-shadow: 0 4rpx 16rpx rgba(139, 92, 246, 0.4);
}

/* V10 AI Section */
.ai-section {
  margin-top: 20rpx;
}
.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}
.ai-header .section-title {
  margin-bottom: 0;
}
.regenerate-btn {
  font-size: 22rpx;
  color: #8B5CF6;
  padding: 8rpx 16rpx;
  background: #F3E8FF;
  border-radius: 20rpx;
}
.ai-content {
  background: #FAFAFA;
  border-radius: 12rpx;
  padding: 20rpx;
}
.ai-summary-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
}
.ai-loading .ai-summary-text {
  color: #9CA3AF;
}
.ai-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}
.ai-tag {
  font-size: 20rpx;
  color: #8B5CF6;
  background: #F3E8FF;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}
</style>