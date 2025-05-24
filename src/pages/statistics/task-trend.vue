<template>
  <!-- <view class="container">
    <u-navbar
      title="任务趋势"
      :autoBack="true"
      bgColor="#ffffff"
    ></u-navbar> -->

  <view class="page-container" :class="{ 'dark-mode': isDarkMode }">
    <!-- 顶部标题区域 -->
    <view class="page-header">
      <view class="header-content">
        <view class="title-section">
          <text class="title">成长趋势</text>
          <text class="subtitle">成长任务完成趋势</text>
        </view>
        <view class="points">{{ totalScore }}积分</view>
      </view>

      <!-- 宝宝选择器 -->
      <view class="baby-selector">
        <picker :range="babies" range-key="name" @change="onBabyChange" :value="currentBabyIndex">
          <view class="baby-select-view">
            <image v-if="currentBabyAvatar" class="baby-icon" :src="currentBabyAvatar" mode="aspectFill"></image>
            <text v-else class="baby-icon-placeholder">{{ getDefaultAvatar(currentBabyId) }}</text>
            <text class="baby-name">{{ currentBabyName || '选择宝宝' }}</text>
            <text class="selector-arrow">▼</text>
          </view>
        </picker>
        <text class="refresh-btn" @tap="refreshData">🔄</text>
      </view>
    </view>

    <view class="time-filter">
      <view class="time-tabs">
        <view class="time-range-selector">
          <view 
            class="time-range-item" 
            :class="{ 'active': activeTimeRange === '3' }"
            @tap="changeTimeRange('3')"
          >3天</view>
          <view 
            class="time-range-item" 
            :class="{ 'active': activeTimeRange === '7' }"
            @tap="changeTimeRange('7')"
          >7天</view>
          <view 
            class="time-range-item" 
            :class="{ 'active': activeTimeRange === '14' }"
            @tap="changeTimeRange('14')"
          >14天</view>
          <view 
            class="time-range-item" 
            :class="{ 'active': activeTimeRange === '30' }"
            @tap="changeTimeRange('30')"
          >30天</view>
        </view>
      </view>
    </view>

    <view class="chart-container">
      <view class="chart-wrapper">
        <canvas canvas-id="taskChart" id="taskChart" class="chart-canvas"></canvas>
      </view>
    </view>

    <view class="statistics-info">
      <view class="statistics-grid">
        <view class="statistics-item">
          <text class="statistics-value">{{ totalTasks }}</text>
          <text class="statistics-label">总任务数</text>
        </view>
        <view class="statistics-item">
          <text class="statistics-value">{{ completionRate }}%</text>
          <text class="statistics-label">完成率</text>
        </view>
      </view>
    </view>

    <!-- <view class="empty-state" v-if="totalTasks === 0">
      <text class="empty-text">暂无任务数据</text>
      <view class="empty-action">
        <button class="refresh-button" @tap="refreshData">刷新数据</button>
      </view>
    </view> -->
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { usePointsStore } from '@/stores/pointsStore';
import uCharts from '@/uni_modules/u-charts/components/u-charts/u-charts.js';
import { getShareConfig } from '@/utils/shareUtils';
import { useShare } from '@/utils/useShare';

let chartInstance = null;

// 初始化主题和积分Store
const themeStore = useThemeStore();
const pointsStore = usePointsStore();
const isDarkMode = computed(() => themeStore.isDarkMode);

// 响应式数据
const activeTimeRange = ref('7');
const totalTasks = ref(0);
const completionRate = ref(0);
const totalScore = ref(0);

// 图表配置
const chartConfig = {
  type: 'line',
  canvasId: 'taskChart',
  canvas2d: true,
  background: '#FFFFFF',
  animation: true,
  timing: 'easeOut',
  duration: 1000,
  width: 340,
  height: 280,
  padding: [40, 20, 80, 50],
  categories: [],
  series: [],
  xAxis: {
    disableGrid: true,
    fontColor: '#666666',
    fontSize: 12,
    rotateLabel: true,
    rotateAngle: 35,
    marginBottom: 28,
    format: (text) => {
      const parts = text.split('/');
      return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}`;
    }
  },
  yAxis: {
    gridType: 'dash',
    dashLength: 4,
    splitNumber: 3,
    data: [{
      min: 0,
      max: (max) => {
        if (max <= 0) return 2;
        if (max <= 1) return 3;
        return Math.ceil(max * 1.5);
      },
      fontColor: '#666666',
      fontSize: 12,
      textAlign: 'right',
      width: 40,
      format: (val) => {
        if (val === 0) return '0';
        if (val >= 1000) return (val/1000).toFixed(1) + 'k';
        return val.toFixed(0);
      }
    }]
  },
  legend: {
    show: true,
    position: 'bottom',
    float: 'center',
    padding: 10,
    margin: 18,
    fontSize: 13,
    lineHeight: 13,
    itemGap: 40,
    itemWidth: 18,
    itemHeight: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 6
  },
  extra: {
    line: {
      type: 'straight',
      width: 2.5,
      activeType: 'hollow',
      linearType: 'custom',
      onShadow: true,
      addPoint: true,
      activeOpacity: 0.1,
      lineCap: 'round'
    }
  }
};

// 宝宝相关
const babies = ref([]);
const currentBabyId = ref('');
const currentBabyName = computed(() => {
  const baby = babies.value.find(b => b.id === currentBabyId.value);
  return baby ? baby.name : (babies.value.length > 0 ? '选择宝宝' : '暂无宝宝');
});
const currentBabyIndex = computed(() => {
  return babies.value.findIndex(b => b.id === currentBabyId.value);
});
const currentBabyAvatar = computed(() => {
  const baby = babies.value.find(b => b.id === currentBabyId.value);
  let avatar = baby ? baby.avatar : '';
  if (avatar && avatar.startsWith('blob:')) return null;
  if (avatar && !avatar.startsWith('blob:')) return avatar;
  return null;
});

// 获取宝宝默认头像
const getDefaultAvatar = (babyId) => {
  const lastChar = babyId ? babyId.charAt(babyId.length - 1) : '0';
  const lastDigit = parseInt(lastChar, 16) % 5;
  const defaultAvatars = ['👶', '👼', '🧒', '👦', '👧'];
  return defaultAvatars[lastDigit];
};

// 更新积分显示
const updateShowPoints = () => {
  if (currentBabyId.value) {
    totalScore.value = pointsStore.getBabyPoints(currentBabyId.value);
  } else {
    totalScore.value = 0;
  }
};

// 切换时间范围
const changeTimeRange = (range) => {
  activeTimeRange.value = range;
  loadTaskData();
};

// 检查宝宝状态
const checkBabyStatus = () => {
  const storedBabyId = uni.getStorageSync('currentBabyId');
  if (currentBabyId.value !== storedBabyId && storedBabyId) {
    console.log(`[趋势页] 检测到宝宝状态不一致，从存储同步: ${storedBabyId}`);
    currentBabyId.value = storedBabyId;
    loadBabies();
    updateShowPoints();
    loadTaskData();
  }
};

// 加载任务数据
const loadTaskData = async () => {
  try {
    const storedCompletedTasks = uni.getStorageSync('completedTaskList');
    let completedTasks = [];
    
    if (storedCompletedTasks) {
      completedTasks = JSON.parse(storedCompletedTasks);
      console.log('加载到已完成任务:', completedTasks.length);
    }

    const storedTasks = uni.getStorageSync('taskList');
    let allTasks = [];
    
    if (storedTasks) {
      allTasks = JSON.parse(storedTasks);
      console.log('加载到所有任务:', allTasks.length);
    }

    if (currentBabyId.value) {
      completedTasks = completedTasks.filter(task => task.babyId === currentBabyId.value);
      allTasks = allTasks.filter(task => task.babyId === currentBabyId.value);
    } else {
      completedTasks = [];
      allTasks = [];
    }

    const days = parseInt(activeTimeRange.value);
    const data = await generateDataFromTasks(completedTasks, allTasks, days);
    
    updateChartWithData(data);
  } catch (e) {
    console.error('加载任务数据失败:', e);
    updateChartWithData({
      categories: [],
      completed: [],
      total: []
    });
  }
};

// 从任务数据生成图表数据
const generateDataFromTasks = (completedTasks, allTasks, days) => {
  return new Promise((resolve) => {
    const data = {
      categories: [],
      completed: [],
      total: []
    };
    
    const now = new Date();
    let totalTaskCount = 0;
    let completedTaskCount = 0;
    
    const minPoints = Math.max(3, days);
    
    for (let i = minPoints - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const dateStr = `${month}/${day}`;
      data.categories.push(dateStr);
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const dayCompletedTasks = completedTasks.filter(task => {
        const completedAt = new Date(task.completedAt);
        return completedAt >= startOfDay && completedAt <= endOfDay;
      });
      
      const dayAllTasksCount = allTasks.filter(task => {
        const createdAt = new Date(task.createdAt);
        return createdAt <= endOfDay;
      }).length;
      
      const dayCompletedCount = dayCompletedTasks.length;
      
      data.completed.push(dayCompletedCount);
      data.total.push(dayAllTasksCount);
      
      totalTaskCount = Math.max(totalTaskCount, dayAllTasksCount);
      completedTaskCount += dayCompletedCount;
    }
    
    totalTasks.value = totalTaskCount;
    completionRate.value = totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0;
    
    resolve(data);
  });
};

// 更新图表数据
const updateChartWithData = (data) => {
  const config = {
    ...chartConfig,
    categories: data.categories,
    series: [
      {
        name: '完成任务',
        data: data.completed,
        color: '#8477fa',
        pointStyle: 'circle',
        pointColor: '#8477fa',
        pointSelectedColor: '#8477fa'
      },
      {
        name: '总任务',
        data: data.total,
        color: '#ff9c6e',
        pointStyle: 'circle',
        pointColor: '#ff9c6e',
        pointSelectedColor: '#ff9c6e'
      }
    ]
  };

  if (!chartInstance) {
    chartInstance = new uCharts(config);
  } else {
    chartInstance.updateData(config);
  }
};

// 手动刷新数据
const refreshData = () => {
  if (uni.vibrateShort) {
    uni.vibrateShort({
      success: function () {
        console.log('振动成功');
      }
    });
  }

  loadBabies();
  loadTaskData();

  uni.showToast({
    title: '数据已刷新',
    icon: 'success',
    duration: 1500
  });
};

// 补全loadBabies
const loadBabies = () => {
  try {
    const storedBabies = uni.getStorageSync('babies') || '[]';
    babies.value = typeof storedBabies === 'string' ? JSON.parse(storedBabies) : storedBabies;
    const storedCurrentBabyId = uni.getStorageSync('currentBabyId');
    currentBabyId.value = storedCurrentBabyId || (babies.value[0]?.id || '');
    updateShowPoints();
  } catch (e) {
    console.error('加载宝宝信息失败:', e);
  }
};

// 补全onBabyChange
const onBabyChange = (e) => {
  const idx = e.detail.value;
  if (babies.value[idx]) {
    const oldBabyId = currentBabyId.value;
    const newBabyId = babies.value[idx].id;
    if (oldBabyId !== newBabyId) {
      currentBabyId.value = newBabyId;
      uni.setStorageSync('currentBabyId', newBabyId);
      setTimeout(() => {
        uni.$emit('babyChanged', {
          babyId: newBabyId,
          babyInfo: babies.value[idx],
          source: 'statistics',
          timestamp: Date.now()
        });
        uni.showToast({ title: `已切换到"${babies.value[idx].name}"`, icon: 'none', duration: 1500 });
      }, 50);
      updateShowPoints();
      loadTaskData();
    }
  }
};

// 组件挂载时
onMounted(() => {
  console.log('组件挂载');
  
  if (themeStore.initTheme) {
    themeStore.initTheme();
  }

  if (pointsStore.init) {
    pointsStore.init();
  }
  
  loadBabies();
  
  setTimeout(() => {
    loadTaskData();
  }, 300);
  
  checkBabyStatus();

  uni.$on('refreshTaskList', () => {
    loadTaskData();
  });

  uni.$on('pointsUpdated', updateShowPoints);

  uni.$on('babyPointsUpdated', (data) => {
    if (data && data.babyId === currentBabyId.value) {
      totalScore.value = data.points;
    }
  });

  uni.$on('babyChanged', (data) => {
    const babyId = typeof data === 'object' ? data.babyId : data;
    const source = typeof data === 'object' ? (data.source || 'unknown') : 'unknown';

    if (source === 'statistics') {
      console.log('[趋势页] 忽略自己触发的宝宝变更事件');
      return;
    }

    if (currentBabyId.value !== babyId) {
      console.log(`[趋势页] 接收到来自[${source}]的宝宝变更事件: ${babyId}`);
      currentBabyId.value = babyId;

      loadBabies();
      loadTaskData();
      updateShowPoints();
    }
  });

  uni.$on('refreshBabyList', () => {
    console.log('[趋势页] 接收到宝宝列表刷新事件');
    loadBabies();
    loadTaskData();
  });

  // 注册分享功能
  useShare('statistics', () => ({
    currentBabyId: currentBabyId.value,
    babies: babies.value,
    totalScore: totalScore.value,
    completionRate: completionRate.value
  }));
});

// 组件卸载时
onUnmounted(() => {
  console.log('组件卸载');
  
  uni.$off('refreshTaskList');
  uni.$off('pointsUpdated');
  uni.$off('babyPointsUpdated');
  uni.$off('babyChanged');
  uni.$off('refreshBabyList');

  // 销毁图表实例
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

// 提供生命周期钩子
const onPageShow = () => {
  console.log('页面显示');
  checkBabyStatus();
  loadTaskData();
};

// 处理页面参数
const onLoad = (options) => {
  console.log('[趋势页] 页面加载参数:', options);
  
  if (options && options.babyId) {
    const targetBabyId = options.babyId;
    // 检查是否是有效的宝宝ID
    const storedBabies = uni.getStorageSync('babies') || '[]';
    const babiesList = typeof storedBabies === 'string' ? JSON.parse(storedBabies) : storedBabies;
    
    if (babiesList.some(baby => baby.id === targetBabyId)) {
      console.log('[趋势页] 从分享链接设置宝宝:', targetBabyId);
      currentBabyId.value = targetBabyId;
      uni.setStorageSync('currentBabyId', targetBabyId);
      
      // 触发宝宝变更事件
      uni.$emit('babyChanged', {
        babyId: targetBabyId,
        source: 'share',
        timestamp: Date.now()
      });
    }
  }
};

// 导出供选项API使用的方法
defineExpose({
  checkBabyStatus,
  loadTaskData,
  onPageShow,
  onLoad
});
</script>

<style lang="scss" scoped>

  /* 页面容器 */
  .page-container {
    min-height: 100vh;
    padding-bottom: 50px;
    background-color: #f8f8f8;
    position: relative;
    z-index: 0;
    overflow: hidden;
  }

  .page-header {
    padding: 140rpx 40rpx 30rpx 40rpx;
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    color: white;
    position: relative;
    border-radius: 0 0 30rpx 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(124, 58, 237, 0.3);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title-section {
    display: flex;
    flex-direction: column;
  }

  .title {
    margin-top: 10rpx;
    font-size: 48rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  }

  .subtitle {
    font-size: 28rpx;
    opacity: 0.9;
    margin-bottom: 10rpx;
  }

  .points {
    background-color: rgba(255, 255, 255, 0.25);
    padding: 12rpx 28rpx;
    border-radius: 40rpx;
    font-size: 34rpx;
    font-weight: bold;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  }

  /* 宝宝选择器 */
  .baby-selector {
    margin-top: 20rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.25);
    border-radius: 40rpx;
    padding: 10rpx 30rpx;
    width: 70%;
    margin-left: auto;
    margin-right: auto;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.15);
  }

  .baby-select-view {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }

  .baby-icon {
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
    margin-right: 16rpx;
    border: 2rpx solid #ffffff;
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  }

  .baby-icon-placeholder {
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
    margin-right: 16rpx;
    background-color: rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    border: 2rpx solid #ffffff;
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  }

  .baby-name {
    font-size: 32rpx;
    font-weight: bold;
    color: white;
    margin-right: 10rpx;
    text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
  }

  .selector-arrow {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
  }

  .refresh-btn {
    margin-left: 20rpx;
    font-size: 36rpx;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* 时间筛选 */
  .time-filter {
    background-color: #ffffff;
    margin: 15px 15px 10px 15px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  .time-tabs {
    width: 100%;
  }
  
  .time-range-selector {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
  }
  
  .time-range-item {
    flex: 1;
    text-align: center;
    padding: 10px 0;
    font-size: 14px;
    color: #666;
    border-bottom: 3px solid transparent;
    transition: all 0.3s;
  }
  
  .time-range-item.active {
    color: #8477fa;
    border-bottom-color: #8477fa;
    font-weight: bold;
  }

  /* 图表容器 */
  .chart-container {
    background-color: #ffffff;
    margin: 0 15px 15px 15px;
    padding: 0;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    height: 360px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chart-wrapper {
    width: 95%;
    height: 90%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chart-canvas {
    width: 100% !important;
    height: 100% !important;
    display: block;
    margin: 0 auto;
  }

  /* 统计信息 */
  .statistics-info {
    background-color: #ffffff;
    margin: 0 15px 15px 15px;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .statistics-grid {
    display: flex;
    justify-content: space-around;
  }

  .statistics-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
  }

  .statistics-value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
  }

  .statistics-label {
    font-size: 14px;
    color: #999;
  }

  /* 空状态 */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 20px;
    margin: 0 15px;
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .empty-text {
    font-size: 16px;
    color: #999;
    margin-bottom: 20px;
  }

  .empty-action {
    .refresh-button {
      padding: 10px 20px;
      background: linear-gradient(135deg, #8B5CF6, #7C3AED);
      color: white;
      border: none;
      border-radius: 30px;
      font-size: 14px;
      box-shadow: 0 4px 10px rgba(124, 58, 237, 0.2);
    }
  }
</style>