<!-- 成长报告页 -->
<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">成长报告</text>
      <view class="nav-right"></view>
    </view>

    <!-- 宝宝切换 -->
    <view class="baby-selector" v-if="babies.length > 1">
      <view
        v-for="baby in babies"
        :key="baby.id"
        class="baby-chip"
        :class="{ active: currentBabyId === baby.id }"
        @tap="switchBaby(baby.id)"
      >
        {{ baby.name }}
      </view>
    </view>

    <!-- 当前宝宝名 -->
    <view class="report-header">
      <text class="report-emoji">{{ currentBaby?.emoji || '👶' }}</text>
      <view class="report-title-wrap">
        <text class="report-title">{{ currentBaby?.name || '宝宝' }}的成长报告</text>
        <text class="report-subtitle">近7日数据概览</text>
      </view>
    </view>

    <!-- 统计卡片区 -->
    <view class="stats-grid">
      <view class="stat-card">
        <text class="stat-value">{{ localStats.weekCompleted || 0 }}</text>
        <text class="stat-label">本周完成</text>
        <text class="stat-unit">任务</text>
      </view>
      <view class="stat-card">
        <text class="stat-value text-gold">{{ localStats.weeklyEarned || 0 }}</text>
        <text class="stat-label">本周获得</text>
        <text class="stat-unit">积分</text>
      </view>
      <view class="stat-card">
        <text class="stat-value text-purple">{{ localStats.achievementCount || 0 }}/{{ localStats.totalAchievements || 0 }}</text>
        <text class="stat-label">成就解锁</text>
        <text class="stat-unit">已解锁</text>
      </view>
      <view class="stat-card">
        <text class="stat-value text-green">{{ localStats.continuousDays || 0 }}</text>
        <text class="stat-label">连续活跃</text>
        <text class="stat-unit">天数</text>
      </view>
    </view>

    <!-- 任务完成柱状图 -->
    <view class="chart-card">
      <view class="chart-title">📊 本周任务完成</view>
      <view class="bar-chart">
        <view v-for="item in taskChartData" :key="item.date" class="bar-item">
          <view class="bar-wrap">
            <view
              class="bar-fill"
              :style="{ height: item.barHeight + 'rpx' }"
            ></view>
          </view>
          <text class="bar-value">{{ item.count }}</text>
          <text class="bar-label">{{ item.date }}</text>
        </view>
      </view>
    </view>

    <!-- 积分获取柱状图 -->
    <view class="chart-card">
      <view class="chart-title">💰 本周积分获取</view>
      <view class="bar-chart">
        <view v-for="item in pointsChartData" :key="item.date" class="bar-item">
          <view class="bar-wrap">
            <view
              class="bar-fill bar-fill-gold"
              :style="{ height: item.barHeight + 'rpx' }"
            ></view>
          </view>
          <text class="bar-value">{{ item.points }}</text>
          <text class="bar-label">{{ item.date }}</text>
        </view>
      </view>
    </view>

    <!-- 任务状态分布 -->
    <view class="chart-card">
      <view class="chart-title">📋 任务状态分布</view>
      <view class="task-distribution">
        <view class="dist-item">
          <view class="dist-bar-wrap">
            <view class="dist-bar dist-bar-blue" :style="{ width: distWidth('inProgress') }"></view>
          </view>
          <text class="dist-label">进行中</text>
          <text class="dist-value">{{ taskStats.inProgress || 0 }}</text>
        </view>
        <view class="dist-item">
          <view class="dist-bar-wrap">
            <view class="dist-bar dist-bar-orange" :style="{ width: distWidth('pending') }"></view>
          </view>
          <text class="dist-label">待审核</text>
          <text class="dist-value">{{ taskStats.pending || 0 }}</text>
        </view>
        <view class="dist-item">
          <view class="dist-bar-wrap">
            <view class="dist-bar dist-bar-green" :style="{ width: distWidth('weekCompleted') }"></view>
          </view>
          <text class="dist-label">本周完成</text>
          <text class="dist-value">{{ localStats.weekCompleted || 0 }}</text>
        </view>
      </view>
    </view>

    <!-- 成就进度 -->
    <view class="chart-card">
      <view class="chart-title">🏆 成就进度</view>
      <view class="achievement-progress">
        <view class="progress-bar-wrap">
          <view
            class="progress-bar-fill"
            :style="{ width: achievementProgress + '%' }"
          ></view>
        </view>
        <text class="progress-text">
          {{ achievementData?.unlockedCount || 0 }} / {{ achievementData?.totalCount || 0 }} 已解锁
        </text>
      </view>
      <!-- 已解锁成就列表 -->
      <view class="achievement-list" v-if="achievementData?.unlocked?.length > 0">
        <view
          v-for="ach in achievementData.unlocked"
          :key="ach.id"
          class="achievement-badge"
        >
          <text class="achievement-icon">{{ ach.icon }}</text>
          <text class="achievement-name">{{ ach.name }}</text>
        </view>
      </view>
      <view class="empty-achievement" v-else>
        <text class="empty-hint">暂无已解锁成就，继续加油！</text>
      </view>
    </view>

    <!-- AI 成长总结 -->
    <view class="chart-card ai-summary-card">
      <view class="chart-title">✨ AI 成长评语</view>
      <!-- Loading Skeleton -->
      <view v-if="aiSummaryLoading" class="ai-summary-skeleton">
        <view class="skeleton-line skeleton-title"></view>
        <view class="skeleton-line"></view>
        <view class="skeleton-line"></view>
        <view class="skeleton-tags">
          <view class="skeleton-tag"></view>
          <view class="skeleton-tag"></view>
          <view class="skeleton-tag"></view>
        </view>
      </view>
      <!-- AI Summary Content -->
      <view v-else-if="aiSummary" class="ai-summary-content">
        <view class="ai-summary-section">
          <text class="ai-summary-text">{{ aiSummary.summary }}</text>
        </view>
        <!-- Strengths Tags -->
        <view class="ai-summary-section" v-if="aiSummary.strengths?.length">
          <text class="ai-section-label">💪 优势</text>
          <view class="ai-tags-wrap">
            <text
              v-for="(strength, idx) in aiSummary.strengths"
              :key="idx"
              class="ai-tag ai-tag-strength"
            >{{ strength }}</text>
          </view>
        </view>
        <!-- Suggestions List -->
        <view class="ai-summary-section" v-if="aiSummary.suggestions?.length">
          <text class="ai-section-label">📝 建议</text>
          <view class="ai-suggestions">
            <view
              v-for="(suggestion, idx) in aiSummary.suggestions"
              :key="idx"
              class="ai-suggestion-item"
            >
              <text class="ai-suggestion-bullet">•</text>
              <text class="ai-suggestion-text">{{ suggestion }}</text>
            </view>
          </view>
        </view>
        <!-- Highlights -->
        <view class="ai-summary-section" v-if="aiSummary.highlights?.length">
          <text class="ai-section-label">🌟 亮点</text>
          <view class="ai-tags-wrap">
            <text
              v-for="(highlight, idx) in aiSummary.highlights"
              :key="idx"
              class="ai-tag ai-tag-highlight"
            >{{ highlight }}</text>
          </view>
        </view>
        <!-- Regenerate Button -->
        <view class="ai-regenerate-wrap">
          <button class="btn-regenerate" @tap="regenerateAISummary">重新生成</button>
        </view>
      </view>
      <!-- Fallback when no data -->
      <view v-else class="ai-summary-empty">
        <text class="empty-hint">AI 总结生成中...</text>
      </view>
    </view>

    <!-- 返回按钮 -->
    <view class="bottom-btn-wrap">
      <button class="btn-back" @tap="goBack">返回仪表盘</button>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const currentBabyId = ref('');
    const localStats = ref({});
    const taskChartData = ref([]);
    const pointsChartData = ref([]);
    const achievementData = ref({});
    const taskStats = ref({});
    const aiSummary = ref(null);
    const aiSummaryLoading = ref(true);

    const babies = ref([]);

    const loadData = () => {
      if (!currentBabyId.value) return;

      try {
        const { getDashboardStats, getWeeklyTimeline, getWeeklyPointsTimeline, getAchievementsSummary } =
          require('../../utils/FamilyGrowthContext');

        const stats = getDashboardStats(currentBabyId.value);
        localStats.value = {
          weekCompleted: stats.weekCompleted || 0,
          weeklyEarned: stats.weeklyEarned || 0,
          achievementCount: stats.achievementCount || 0,
          totalAchievements: stats.totalAchievements || 0,
          continuousDays: stats.continuousDays || 0,
        };
        taskStats.value = {
          inProgress: stats.inProgressCount || 0,
          pending: stats.pendingCount || 0,
        };

        // 任务柱状图
        const timeline = getWeeklyTimeline(currentBabyId.value);
        const maxTask = Math.max(...timeline.map(d => d.count), 1);
        taskChartData.value = timeline.map(d => ({
          date: d.date,
          count: d.count,
          barHeight: Math.max(4, Math.round((d.count / maxTask) * 120)),
        }));

        // 积分柱状图
        const pointsTimeline = getWeeklyPointsTimeline(currentBabyId.value);
        const maxPoints = Math.max(...pointsTimeline.map(d => d.points), 1);
        pointsChartData.value = pointsTimeline.map(d => ({
          date: d.date,
          points: d.points,
          barHeight: Math.max(4, Math.round((d.points / maxPoints) * 120)),
        }));

        // 成就数据
        achievementData.value = getAchievementsSummary(currentBabyId.value);

      } catch (e) {
        console.error('[growth-report] Load data failed:', e);
      }
    };

    const loadAISummary = async () => {
      if (!currentBabyId.value) return;
      
      aiSummaryLoading.value = true;
      aiSummary.value = null;
      
      try {
        const { getGrowthReport } = require('../../services/growthReportService');
        const report = getGrowthReport(currentBabyId.value);
        if (report && report.aiSummary) {
          aiSummary.value = report.aiSummary;
        }
      } catch (e) {
        console.error('[growth-report] Load AI summary failed:', e);
      } finally {
        aiSummaryLoading.value = false;
      }
    };

    const regenerateAISummary = async () => {
      if (!currentBabyId.value) return;
      
      aiSummaryLoading.value = true;
      
      try {
        const { invalidateAICache } = require('../../db/sqlite');
        const { generateAISummary } = require('../../services/aiSummaryService');
        
        // Invalidate cache
        invalidateAICache(currentBabyId.value, 'week');
        
        // Regenerate
        aiSummary.value = await generateAISummary(currentBabyId.value, 'week');
      } catch (e) {
        console.error('[growth-report] Regenerate AI summary failed:', e);
      } finally {
        aiSummaryLoading.value = false;
      }
    };

    const achievementProgress = computed(() => {
      if (!achievementData.value?.totalCount) return 0;
      return Math.round(
        (achievementData.value.unlockedCount / achievementData.value.totalCount) * 100
      );
    });

    const currentBaby = computed(() => {
      return babies.value.find(b => b.id === currentBabyId.value);
    });

    const distWidth = (key) => {
      const total = (taskStats.value.inProgress || 0) +
        (taskStats.value.pending || 0) +
        (localStats.value.weekCompleted || 0);
      if (total === 0) return '0%';
      const val = key === 'inProgress' ? (taskStats.value.inProgress || 0)
        : key === 'pending' ? (taskStats.value.pending || 0)
        : (localStats.value.weekCompleted || 0);
      return Math.max(2, Math.round((val / total) * 100)) + '%';
    };

    onMounted(() => {
      // 获取宝宝列表
      try {
        const { useBabyStore } = require('../../stores/babyStore');
        const babyStore = useBabyStore();
        babies.value = babyStore.babies || [];

        // 当前宝宝
        const storedId = uni.getStorageSync('currentBabyId');
        currentBabyId.value = storedId || (babies.value[0]?.id || '');
      } catch (e) {
        console.error('[growth-report] Load babies failed:', e);
      }

      loadData();
      loadAISummary();

      // 监听宝宝切换
      uni.$on('baby:switched', (babyId) => {
        currentBabyId.value = babyId;
        loadData();
        loadAISummary();
      });
    });

    const switchBaby = (babyId) => {
      currentBabyId.value = babyId;
      uni.setStorageSync('currentBabyId', babyId);
      loadData();
    };

    const goBack = () => {
      uni.navigateBack();
    };

    return {
      babies,
      currentBabyId,
      currentBaby,
      localStats,
      taskChartData,
      pointsChartData,
      achievementData,
      achievementProgress,
      taskStats,
      distWidth,
      switchBaby,
      goBack,
      aiSummary,
      aiSummaryLoading,
      regenerateAISummary
    };
  }
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #F5F3FF 0%, #EDE9FE 100%);
  padding-bottom: 40rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  height: 88rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  padding: 90rpx 40rpx 60rpx;
  position: relative;
}
.nav-left { position: absolute; left: 30rpx; }
.icon { color: white; font-size: 48rpx; font-weight: bold; }
.nav-title { flex: 1; text-align: center; color: white; font-size: 36rpx; font-weight: bold; }
.nav-right { position: absolute; right: 30rpx; width: 60rpx; }

.baby-selector {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 40rpx;
  flex-wrap: wrap;
}
.baby-chip {
  padding: 10rpx 28rpx;
  border-radius: 30rpx;
  background: rgba(139, 92, 246, 0.1);
  color: #7C3AED;
  font-size: 26rpx;
  border: 2rpx solid transparent;
}
.baby-chip.active {
  background: #7C3AED;
  color: white;
}

.report-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 20rpx 40rpx;
}
.report-emoji { font-size: 64rpx; }
.report-title { font-size: 36rpx; font-weight: bold; color: #333; display: block; }
.report-subtitle { font-size: 26rpx; color: #888; display: block; margin-top: 4rpx; }

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  padding: 0 40rpx 20rpx;
}
.stat-card {
  background: white;
  border-radius: 20rpx;
  padding: 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(139, 92, 246, 0.08);
}
.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  line-height: 1;
}
.text-gold { color: #F59E0B; }
.text-purple { color: #8B5CF6; }
.text-green { color: #10B981; }
.stat-label { font-size: 22rpx; color: #888; margin-top: 8rpx; }
.stat-unit { font-size: 20rpx; color: #bbb; }

.chart-card {
  background: white;
  border-radius: 20rpx;
  padding: 28rpx;
  margin: 0 40rpx 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(139, 92, 246, 0.08);
}
.chart-title { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 20rpx; }

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200rpx;
  gap: 8rpx;
}
.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}
.bar-wrap {
  height: 120rpx;
  display: flex;
  align-items: flex-end;
  width: 100%;
  justify-content: center;
}
.bar-fill {
  width: 70%;
  max-width: 48rpx;
  background: linear-gradient(180deg, #8B5CF6, #A78BFA);
  border-radius: 6rpx 6rpx 0 0;
  min-height: 4rpx;
  transition: height 0.3s;
}
.bar-fill-gold {
  background: linear-gradient(180deg, #F59E0B, #FCD34D);
}
.bar-value { font-size: 22rpx; color: #333; font-weight: bold; }
.bar-label { font-size: 18rpx; color: #888; }

.task-distribution {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.dist-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.dist-bar-wrap {
  flex: 1;
  height: 24rpx;
  background: #F3F4F6;
  border-radius: 12rpx;
  overflow: hidden;
}
.dist-bar {
  height: 100%;
  border-radius: 12rpx;
  transition: width 0.5s;
  min-width: 4rpx;
}
.dist-bar-blue { background: #3B82F6; }
.dist-bar-orange { background: #F59E0B; }
.dist-bar-green { background: #10B981; }
.dist-label { font-size: 24rpx; color: #666; width: 120rpx; }
.dist-value { font-size: 24rpx; color: #333; font-weight: bold; width: 60rpx; text-align: right; }

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}
.progress-bar-wrap {
  flex: 1;
  height: 20rpx;
  background: #F3F4F6;
  border-radius: 10rpx;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #8B5CF6, #A78BFA);
  border-radius: 10rpx;
  transition: width 0.5s;
}
.progress-text { font-size: 24rpx; color: #888; white-space: nowrap; }

.achievement-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.achievement-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #F5F3FF;
  border-radius: 30rpx;
  padding: 10rpx 20rpx;
}
.achievement-icon { font-size: 28rpx; }
.achievement-name { font-size: 24rpx; color: #7C3AED; }

.empty-achievement {
  padding: 20rpx 0;
  text-align: center;
}
.empty-hint { font-size: 26rpx; color: #999; }

.bottom-btn-wrap {
  padding: 20rpx 40rpx;
}
.btn-back {
  width: 100%;
  background: white;
  color: #7C3AED;
  border: 2rpx solid #7C3AED;
  border-radius: 40rpx;
  padding: 20rpx;
  font-size: 30rpx;
  font-weight: bold;
}

/* AI Summary Styles */
.ai-summary-card {
  margin-bottom: 120rpx;
}

.ai-summary-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.skeleton-line {
  height: 32rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8rpx;
}

.skeleton-title {
  width: 60%;
  height: 40rpx;
}

.skeleton-tags {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.skeleton-tag {
  width: 120rpx;
  height: 48rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 24rpx;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.ai-summary-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.ai-summary-section {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.ai-summary-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.ai-section-label {
  font-size: 26rpx;
  color: #666;
  font-weight: bold;
}

.ai-tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.ai-tag {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.ai-tag-strength {
  background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
  color: #065F46;
}

.ai-tag-highlight {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  color: #92400E;
}

.ai-suggestions {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.ai-suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
}

.ai-suggestion-bullet {
  color: #8B5CF6;
  font-size: 28rpx;
  line-height: 1.4;
}

.ai-suggestion-text {
  font-size: 26rpx;
  color: #555;
  line-height: 1.4;
}

.ai-regenerate-wrap {
  display: flex;
  justify-content: center;
  margin-top: 16rpx;
}

.btn-regenerate {
  padding: 12rpx 32rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
  border-radius: 30rpx;
  font-size: 26rpx;
  border: none;
}

.ai-summary-empty {
  padding: 20rpx 0;
  text-align: center;
}
</style>
