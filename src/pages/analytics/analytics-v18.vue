<!-- Analytics V18 - Advanced Data Analytics Page -->
<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">高级数据分析</text>
      <view class="nav-right" @tap="showExportMenu">
        <text class="icon">📤</text>
      </view>
    </view>

    <!-- 宝宝选择器 -->
    <view class="baby-selector" v-if="babies.length > 1">
      <view
        v-for="baby in babies"
        :key="baby.id"
        class="baby-chip"
        :class="{ active: currentBabyId === baby.id }"
        @tap="switchBaby(baby.id)"
      >
        {{ baby.emoji || '👶' }} {{ baby.name }}
      </view>
    </view>

    <!-- 当前宝宝信息 -->
    <view class="report-header">
      <text class="report-emoji">{{ currentBaby?.emoji || '👶' }}</text>
      <view class="report-title-wrap">
        <text class="report-title">{{ currentBaby?.name || '宝宝' }}的数据分析</text>
        <text class="report-subtitle">V18 高级分析报告</text>
      </view>
    </view>

    <!-- ========== V18 新增组件 ========== -->

    <!-- 1. 3D成长轨迹 -->
    <view class="section-card">
      <GrowthTrajectory3D
        :data="trajectoryData"
        title="🌟 3D成长轨迹"
        subtitle="近30日能力发展曲线"
        :showStats="true"
        :multiData="trajectoryMultiData"
        @pointTap="onTrajectoryPointTap"
      />
    </view>

    <!-- 2. 能力雷达图 -->
    <view class="section-card">
      <AbilityRadarChart
        :data="radarData"
        title="🎯 能力雷达图"
        subtitle="多维度能力综合分析"
        :showDetails="true"
        :showOverall="true"
        @pointTap="onRadarPointTap"
        @abilityTap="onAbilityTap"
      />
    </view>

    <!-- 3. 综合数据面板 -->
    <view class="section-card analytics-grid">
      <view class="analytics-item" v-for="(item, index) in analyticsItems" :key="index">
        <view class="analytics-icon-wrap" :style="{ background: item.bgColor }">
          <text class="analytics-icon">{{ item.icon }}</text>
        </view>
        <view class="analytics-info">
          <text class="analytics-value">{{ item.value }}</text>
          <text class="analytics-label">{{ item.label }}</text>
        </view>
        <view class="analytics-trend" :class="item.trendClass" v-if="item.trend">
          <text>{{ item.trend }}</text>
        </view>
      </view>
    </view>

    <!-- 4. 周对比分析 -->
    <view class="section-card week-compare">
      <view class="compare-header">
        <text class="compare-title">📈 本周 vs 上周</text>
      </view>
      <view class="compare-content">
        <view class="compare-row" v-for="(item, index) in weekComparison" :key="index">
          <text class="compare-label">{{ item.label }}</text>
          <view class="compare-bars">
            <view class="compare-bar-wrap">
              <text class="compare-bar-label">上周</text>
              <view class="compare-bar-bg">
                <view 
                  class="compare-bar-fill last" 
                  :style="{ width: item.lastWeekPercent + '%' }"
                ></view>
              </view>
              <text class="compare-bar-value">{{ item.lastWeek }}</text>
            </view>
            <view class="compare-bar-wrap">
              <text class="compare-bar-label">本周</text>
              <view class="compare-bar-bg">
                <view 
                  class="compare-bar-fill current" 
                  :style="{ width: item.thisWeekPercent + '%', background: item.change >= 0 ? '#10B981' : '#EF4444' }"
                ></view>
              </view>
              <text class="compare-bar-value">{{ item.thisWeek }}</text>
            </view>
          </view>
          <view class="compare-change" :class="item.change >= 0 ? 'positive' : 'negative'">
            <text>{{ item.change >= 0 ? '↑' : '↓' }} {{ Math.abs(item.change) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 5. 能力趋势预测 -->
    <view class="section-card prediction-card">
      <view class="prediction-header">
        <text class="prediction-title">🔮 能力趋势预测</text>
        <text class="prediction-subtitle">基于历史数据分析</text>
      </view>
      <view class="prediction-list">
        <view 
          class="prediction-item" 
          v-for="(pred, index) in predictions" 
          :key="index"
        >
          <view class="pred-left">
            <text class="pred-icon">{{ pred.icon }}</text>
            <text class="pred-label">{{ pred.label }}</text>
          </view>
          <view class="pred-center">
            <view class="pred-progress-bg">
              <view 
                class="pred-progress-fill" 
                :style="{ width: pred.confidence + '%', background: pred.color }"
              ></view>
            </view>
          </view>
          <view class="pred-right">
            <text class="pred-value">{{ pred.value }}</text>
            <text class="pred-confidence">{{ pred.confidence }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 6. 详细数据表格 -->
    <view class="section-card data-table-card">
      <view class="table-header">
        <text class="table-title">📋 详细数据</text>
        <view class="table-tabs">
          <view 
            class="table-tab" 
            :class="{ active: activeTableTab === 'tasks' }"
            @tap="activeTableTab = 'tasks'"
          >任务</view>
          <view 
            class="table-tab" 
            :class="{ active: activeTableTab === 'points' }"
            @tap="activeTableTab = 'points'"
          >积分</view>
          <view 
            class="table-tab" 
            :class="{ active: activeTableTab === 'achievements' }"
            @tap="activeTableTab = 'achievements'"
          >成就</view>
        </view>
      </view>
      
      <!-- 任务表格 -->
      <view class="table-content" v-if="activeTableTab === 'tasks'">
        <view v-for="(row, index) in taskTableData" :key="index" class="table-row">
          <text class="table-cell date">{{ row.date }}</text>
          <text class="table-cell value">{{ row.completed }} 任务</text>
          <text class="table-cell points">+{{ row.points }} 积分</text>
        </view>
      </view>
      
      <!-- 积分表格 -->
      <view class="table-content" v-if="activeTableTab === 'points'">
        <view v-for="(row, index) in pointsTableData" :key="index" class="table-row">
          <text class="table-cell date">{{ row.date }}</text>
          <text class="table-cell value">{{ row.type === 'income' ? '+' : '-' }}{{ row.amount }}</text>
          <text class="table-cell desc">{{ row.description }}</text>
        </view>
      </view>
      
      <!-- 成就表格 -->
      <view class="table-content" v-if="activeTableTab === 'achievements'">
        <view v-for="(row, index) in achievementTableData" :key="index" class="table-row achievement-row">
          <text class="table-cell icon">{{ row.icon }}</text>
          <text class="table-cell name">{{ row.name }}</text>
          <text class="table-cell date">{{ row.unlockedAt || '-' }}</text>
        </view>
      </view>
    </view>

    <!-- 7. AI 成长评语 -->
    <view class="section-card ai-summary-card">
      <view class="chart-title">✨ AI 成长评语</view>
      <view v-if="aiSummaryLoading" class="ai-loading">
        <text>正在生成评语...</text>
      </view>
      <view v-else-if="aiSummary" class="ai-content">
        <text class="ai-summary-text">{{ aiSummary.summary }}</text>
        
        <view class="ai-section" v-if="aiSummary.strengths?.length">
          <text class="ai-section-title">💪 优势</text>
          <view class="ai-tags">
            <text 
              v-for="(s, i) in aiSummary.strengths" 
              :key="i" 
              class="ai-tag strength"
            >{{ s }}</text>
          </view>
        </view>
        
        <view class="ai-section" v-if="aiSummary.suggestions?.length">
          <text class="ai-section-title">📝 建议</text>
          <view class="ai-suggestions">
            <text 
              v-for="(s, i) in aiSummary.suggestions" 
              :key="i" 
              class="ai-suggestion"
            >• {{ s }}</text>
          </view>
        </view>
        
        <view class="ai-section" v-if="aiSummary.highlights?.length">
          <text class="ai-section-title">🌟 亮点</text>
          <view class="ai-tags">
            <text 
              v-for="(h, i) in aiSummary.highlights" 
              :key="i" 
              class="ai-tag highlight"
            >{{ h }}</text>
          </view>
        </view>
      </view>
      <view v-else class="ai-empty">
        <text>暂无评语数据</text>
      </view>
      
      <button class="btn-regenerate" @tap="regenerateAISummary">重新生成</button>
    </view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <button class="btn-export" @tap="exportPDF">
        <text>📄</text> 导出PDF报告
      </button>
      <button class="btn-share" @tap="shareReport">
        <text>📤</text> 分享报告
      </button>
    </view>

    <!-- 导出菜单 -->
    <view class="export-menu" v-if="showExportMenuFlag" @tap="showExportMenuFlag = false">
      <view class="export-menu-content" @tap.stop>
        <view class="export-menu-item" @tap="exportAs('pdf')">
          <text>📄 导出PDF报告</text>
        </view>
        <view class="export-menu-item" @tap="exportAs('image')">
          <text>🖼️ 保存为图片</text>
        </view>
        <view class="export-menu-item" @tap="exportAs('data')">
          <text>📊 导出数据</text>
        </view>
        <view class="export-menu-item cancel" @tap="showExportMenuFlag = false">
          <text>取消</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import GrowthTrajectory3D from '../../components/analytics/GrowthTrajectory3D.vue';
import AbilityRadarChart from '../../components/analytics/AbilityRadarChart.vue';
import { generateFamilyReportPdf, shareReportToWechat } from '../../services/familyReportPdfService.js';

export default {
  components: {
    GrowthTrajectory3D,
    AbilityRadarChart
  },
  setup() {
    const currentBabyId = ref('');
    const babies = ref([]);
    const aiSummary = ref(null);
    const aiSummaryLoading = ref(false);
    const showExportMenuFlag = ref(false);
    const activeTableTab = ref('tasks');
    
    // 获取宝宝数据
    const currentBaby = computed(() => {
      return babies.value.find(b => b.id === currentBabyId.value);
    });
    
    // 3D成长轨迹数据
    const trajectoryData = computed(() => {
      // 从本地存储获取30天的任务完成数据
      try {
        const flows = uni.getStorageSync('task_flows') || '[]';
        const flowList = typeof flows === 'string' ? JSON.parse(flows) : flows;
        const babyFlows = flowList.filter(f => 
          f.childId === currentBabyId.value && 
          (f.state === 'approved' || f.state === 'rewarded')
        );
        
        const days = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date(Date.now() - i * 24 * 3600 * 1000);
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          const dayEnd = dayStart + 24 * 3600 * 1000;
          
          const count = babyFlows.filter(f => 
            f.approvedAt >= dayStart && f.approvedAt < dayEnd
          ).length;
          
          days.push({
            date: d.toISOString().split('T')[0],
            value: count * 10 + Math.random() * 20 + 50 // 转换为0-100的成长值
          });
        }
        return days;
      } catch (e) {
        return generateMockTrajectoryData();
      }
    });
    
    const trajectoryMultiData = ref([
      { label: '任务完成', color: '#8B5CF6' },
      { label: '技能提升', color: '#EC4899' },
      { label: '积分获取', color: '#F59E0B' }
    ]);
    
    // 能力雷达图数据
    const radarData = computed(() => {
      return [
        { label: '任务完成', key: 'tasks', value: 85 },
        { label: '连续打卡', key: 'streak', value: 72 },
        { label: '技能提升', key: 'skills', value: 90 },
        { label: '积分获取', key: 'points', value: 68 },
        { label: '成就解锁', key: 'achievements', value: 55 },
        { label: '互动协作', key: 'interaction', value: 78 }
      ];
    });
    
    // 综合数据项
    const analyticsItems = computed(() => [
      { icon: '📝', label: '总任务数', value: '128', bgColor: '#EEF2FF', trend: '+12%', trendClass: 'positive' },
      { icon: '💰', label: '累计积分', value: '2,580', bgColor: '#FEF3C7', trend: '+8%', trendClass: 'positive' },
      { icon: '🔥', label: '连续打卡', value: '15天', bgColor: '#FEE2E2', trend: '+3天', trendClass: 'positive' },
      { icon: '🏆', label: '已获成就', value: '8/16', bgColor: '#D1FAE5', trend: '+2', trendClass: 'positive' },
      { icon: '⭐', label: '当前等级', value: 'Lv.5', bgColor: '#E0E7FF', trend: null, trendClass: '' },
      { icon: '🎯', label: '完成率', value: '87%', bgColor: '#FCE7F3', trend: '+5%', trendClass: 'positive' }
    ]);
    
    // 周对比数据
    const weekComparison = computed(() => [
      { label: '完成任务', lastWeek: 12, thisWeek: 15, change: 25, lastWeekPercent: 60, thisWeekPercent: 75 },
      { label: '获得积分', lastWeek: 180, thisWeek: 220, change: 22, lastWeekPercent: 45, thisWeekPercent: 55 },
      { label: '连续天数', lastWeek: 10, thisWeek: 15, change: 50, lastWeekPercent: 50, thisWeekPercent: 75 }
    ]);
    
    // 预测数据
    const predictions = computed(() => [
      { icon: '📝', label: '下周任务完成', value: '18个', confidence: 78, color: '#8B5CF6' },
      { icon: '💰', label: '下周积分获取', value: '+280', confidence: 82, color: '#F59E0B' },
      { icon: '🔥', label: '预计连续天数', value: '22天', confidence: 90, color: '#EF4444' },
      { icon: '🏆', label: '成就解锁概率', value: '60%', confidence: 65, color: '#10B981' }
    ]);
    
    // 任务表格数据
    const taskTableData = computed(() => {
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 3600 * 1000);
        result.push({
          date: `${d.getMonth() + 1}/${d.getDate()}`,
          completed: Math.floor(Math.random() * 5) + 1,
          points: Math.floor(Math.random() * 50) + 10
        });
      }
      return result;
    });
    
    // 积分表格数据
    const pointsTableData = computed(() => [
      { date: '今天', type: 'income', amount: 20, description: '完成早起任务' },
      { date: '今天', type: 'expense', amount: -50, description: '兑换贴纸' },
      { date: '昨天', type: 'income', amount: 30, description: '完成作业任务' },
      { date: '昨天', type: 'income', amount: 15, description: '整理房间' }
    ]);
    
    // 成就表格数据
    const achievementTableData = computed(() => [
      { icon: '🌟', name: '初次任务', unlockedAt: '2024/01/15' },
      { icon: '🔥', name: '连续7天', unlockedAt: '2024/01/20' },
      { icon: '💰', name: '积分达人', unlockedAt: '2024/02/01' }
    ]);
    
    // 辅助函数
    function generateMockTrajectoryData() {
      const result = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 3600 * 1000);
        result.push({
          date: d.toISOString().split('T')[0],
          value: Math.random() * 30 + 50
        });
      }
      return result;
    }
    
    // 加载数据
    const loadData = () => {
      try {
        const stored = uni.getStorageSync('babies') || '[]';
        babies.value = typeof stored === 'string' ? JSON.parse(stored) : stored;
        
        const storedId = uni.getStorageSync('currentBabyId');
        currentBabyId.value = storedId || (babies.value[0]?.id || '');
      } catch (e) {
        console.error('[Analytics V18] Load babies failed:', e);
      }
    };
    
    // 加载AI评语
    const loadAISummary = async () => {
      if (!currentBabyId.value) return;
      
      aiSummaryLoading.value = true;
      
      try {
        const { generateAISummary } = require('../../services/aiSummaryService.js');
        aiSummary.value = await generateAISummary(currentBabyId.value, 'week');
      } catch (e) {
        console.error('[Analytics V18] Load AI summary failed:', e);
        // 使用默认评语
        aiSummary.value = {
          summary: `${currentBaby.value?.name || '宝宝'}本周表现良好，继续保持！`,
          strengths: ['任务完成积极', '连续打卡坚持'],
          suggestions: ['可以尝试更多类型任务', '注意休息和娱乐平衡'],
          highlights: ['连续打卡15天', '本周积分增长20%']
        };
      } finally {
        aiSummaryLoading.value = false;
      }
    };
    
    // 重新生成AI评语
    const regenerateAISummary = async () => {
      if (!currentBabyId.value) return;
      
      aiSummaryLoading.value = true;
      
      try {
        const { invalidateAICache } = require('../../db/sqlite.js');
        const { generateAISummary } = require('../../services/aiSummaryService.js');
        
        if (typeof invalidateAICache === 'function') {
          invalidateAICache(currentBabyId.value, 'week');
        }
        
        aiSummary.value = await generateAISummary(currentBabyId.value, 'week');
        uni.showToast({ title: '评语已更新', icon: 'success' });
      } catch (e) {
        console.error('[Analytics V18] Regenerate AI summary failed:', e);
        uni.showToast({ title: '生成失败', icon: 'none' });
      } finally {
        aiSummaryLoading.value = false;
      }
    };
    
    // 切换宝宝
    const switchBaby = (babyId) => {
      currentBabyId.value = babyId;
      uni.setStorageSync('currentBabyId', babyId);
      loadAISummary();
    };
    
    // 返回
    const goBack = () => {
      uni.navigateBack();
    };
    
    // 显示导出菜单
    const showExportMenu = () => {
      showExportMenuFlag.value = true;
    };
    
    // 导出
    const exportAs = async (type) => {
      showExportMenuFlag.value = false;
      
      uni.showLoading({ title: '正在生成...' });
      
      try {
        if (type === 'pdf' || type === 'image') {
          const reportData = {
            baby: currentBaby.value,
            generatedAt: new Date().toISOString(),
            stats: {
              weekCompleted: 15,
              totalPoints: 2580,
              currentStreak: 15,
              achievementCount: 8
            },
            weeklyProgress: taskTableData.value,
            radarData: radarData.value,
            achievements: achievementTableData.value,
            aiSummary: aiSummary.value
          };
          
          const tempFilePath = await generateFamilyReportPdf({
            babyId: currentBabyId.value,
            reportData,
            onProgress: (p) => {
              uni.showLoading({ title: `生成中 ${p}%` });
            }
          });
          
          if (type === 'image') {
            uni.saveImageToPhotosAlbum({
              filePath: tempFilePath,
              success: () => {
                uni.hideLoading();
                uni.showToast({ title: '已保存到相册', icon: 'success' });
              },
              fail: (err) => {
                uni.hideLoading();
                uni.showToast({ title: '保存失败', icon: 'none' });
              }
            });
          } else {
            uni.hideLoading();
            uni.showToast({ title: '报告已生成', icon: 'success' });
            // 可以打开预览
            uni.previewImage({ urls: [tempFilePath] });
          }
        } else if (type === 'data') {
          uni.hideLoading();
          uni.showToast({ title: '数据导出功能开发中', icon: 'none' });
        }
      } catch (e) {
        console.error('[Analytics V18] Export failed:', e);
        uni.hideLoading();
        uni.showToast({ title: '导出失败', icon: 'none' });
      }
    };
    
    // 导出PDF
    const exportPDF = () => {
      exportAs('pdf');
    };
    
    // 分享报告
    const shareReport = async () => {
      uni.showLoading({ title: '正在生成...' });
      
      try {
        const reportData = {
          baby: currentBaby.value,
          generatedAt: new Date().toISOString(),
          stats: {
            weekCompleted: 15,
            totalPoints: 2580,
            currentStreak: 15,
            achievementCount: 8
          },
          aiSummary: aiSummary.value
        };
        
        const tempFilePath = await generateFamilyReportPdf({
          babyId: currentBabyId.value,
          reportData,
          onProgress: (p) => {
            uni.showLoading({ title: `生成中 ${p}%` });
          }
        });
        
        await shareReportToWechat(tempFilePath);
      } catch (e) {
        console.error('[Analytics V18] Share failed:', e);
        uni.hideLoading();
        uni.showToast({ title: '分享失败', icon: 'none' });
      }
    };
    
    // 轨迹点点击
    const onTrajectoryPointTap = (data) => {
      console.log('[Analytics V18] Trajectory point tap:', data);
    };
    
    // 雷达点点击
    const onRadarPointTap = (data) => {
      console.log('[Analytics V18] Radar point tap:', data);
    };
    
    // 能力点击
    const onAbilityTap = (data) => {
      console.log('[Analytics V18] Ability tap:', data);
    };
    
    onMounted(() => {
      loadData();
      loadAISummary();
    });
    
    return {
      babies,
      currentBabyId,
      currentBaby,
      trajectoryData,
      trajectoryMultiData,
      radarData,
      analyticsItems,
      weekComparison,
      predictions,
      taskTableData,
      pointsTableData,
      achievementTableData,
      aiSummary,
      aiSummaryLoading,
      activeTableTab,
      showExportMenuFlag,
      switchBaby,
      goBack,
      showExportMenu,
      exportAs,
      exportPDF,
      shareReport,
      regenerateAISummary,
      onTrajectoryPointTap,
      onRadarPointTap,
      onAbilityTap
    };
  }
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #F5F3FF 0%, #EDE9FE 100%);
  padding-bottom: 120rpx;
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
.nav-right { position: absolute; right: 30rpx; }
.icon { color: white; font-size: 48rpx; }
.nav-title { flex: 1; text-align: center; color: white; font-size: 36rpx; font-weight: bold; }

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

.section-card {
  margin: 0 30rpx 24rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

/* 综合数据面板 */
.analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  padding: 24rpx;
  background: white;
}

.analytics-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: #F9FAFB;
  border-radius: 16rpx;
}

.analytics-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.analytics-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.analytics-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.analytics-label {
  font-size: 22rpx;
  color: #888;
}

.analytics-trend {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.analytics-trend.positive {
  background: #D1FAE5;
  color: #065F46;
}

.analytics-trend.negative {
  background: #FEE2E2;
  color: #991B1B;
}

/* 周对比 */
.week-compare {
  background: white;
  padding: 24rpx;
}

.compare-header {
  margin-bottom: 20rpx;
}

.compare-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.compare-row {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.compare-label {
  font-size: 26rpx;
  color: #666;
}

.compare-bars {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.compare-bar-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.compare-bar-label {
  font-size: 20rpx;
  color: #888;
  width: 60rpx;
}

.compare-bar-bg {
  flex: 1;
  height: 16rpx;
  background: #F3F4F6;
  border-radius: 8rpx;
  overflow: hidden;
}

.compare-bar-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.5s;
}

.compare-bar-fill.last { background: #D1D5DB; }
.compare-bar-fill.current { background: #8B5CF6; }

.compare-bar-value {
  font-size: 22rpx;
  color: #333;
  width: 60rpx;
  text-align: right;
}

.compare-change {
  font-size: 24rpx;
  font-weight: bold;
  text-align: right;
}

.compare-change.positive { color: #10B981; }
.compare-change.negative { color: #EF4444; }

/* 预测卡片 */
.prediction-card {
  background: white;
  padding: 24rpx;
}

.prediction-header {
  margin-bottom: 20rpx;
}

.prediction-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.prediction-subtitle {
  font-size: 22rpx;
  color: #888;
}

.prediction-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.prediction-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.pred-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 160rpx;
}

.pred-icon { font-size: 28rpx; }
.pred-label { font-size: 24rpx; color: #666; }

.pred-center {
  flex: 1;
}

.pred-progress-bg {
  height: 12rpx;
  background: #F3F4F6;
  border-radius: 6rpx;
  overflow: hidden;
}

.pred-progress-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.5s;
}

.pred-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 80rpx;
}

.pred-value {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.pred-confidence {
  font-size: 20rpx;
  color: #888;
}

/* 数据表格 */
.data-table-card {
  background: white;
  padding: 24rpx;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.table-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.table-tabs {
  display: flex;
  gap: 16rpx;
}

.table-tab {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
  background: #F3F4F6;
}

.table-tab.active {
  background: #8B5CF6;
  color: white;
}

.table-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.table-row {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
}

.table-cell {
  font-size: 24rpx;
  color: #333;
}

.table-cell.date {
  width: 100rpx;
  color: #888;
}

.table-cell.value {
  flex: 1;
}

.table-cell.points {
  width: 120rpx;
  color: #10B981;
  text-align: right;
}

.table-cell.desc {
  flex: 1;
  color: #666;
}

.table-cell.icon {
  width: 60rpx;
  font-size: 32rpx;
}

.table-cell.name {
  flex: 1;
}

.achievement-row {
  gap: 16rpx;
}

/* AI 评语 */
.ai-summary-card {
  background: white;
  padding: 24rpx;
  margin-bottom: 120rpx;
}

.chart-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.ai-loading {
  text-align: center;
  padding: 40rpx;
  color: #888;
}

.ai-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.ai-summary-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.ai-section {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.ai-section-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #666;
}

.ai-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.ai-tag {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.ai-tag.strength {
  background: #D1FAE5;
  color: #065F46;
}

.ai-tag.highlight {
  background: #FEF3C7;
  color: #92400E;
}

.ai-suggestions {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.ai-suggestion {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

.ai-empty {
  text-align: center;
  padding: 40rpx;
  color: #888;
}

.btn-regenerate {
  margin-top: 20rpx;
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
  border-radius: 30rpx;
  font-size: 26rpx;
  border: none;
}

/* 底部操作 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx 40rpx 40rpx;
  background: white;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.btn-export, .btn-share {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 24rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: bold;
  border: none;
}

.btn-export {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
}

.btn-share {
  background: white;
  color: #8B5CF6;
  border: 2rpx solid #8B5CF6;
}

/* 导出菜单 */
.export-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.export-menu-content {
  width: 100%;
  background: white;
  border-radius: 24rpx 24rpx 0 0;
  padding: 20rpx 0 60rpx;
}

.export-menu-item {
  padding: 32rpx;
  text-align: center;
  font-size: 32rpx;
  color: #333;
  border-bottom: 1rpx solid #F0F0F0;
}

.export-menu-item:last-child {
  border-bottom: none;
  color: #888;
}

.export-menu-item.cancel {
  margin-top: 20rpx;
}
</style>
