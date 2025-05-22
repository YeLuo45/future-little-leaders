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
      <view class="chart-wrapper" id="taskTrendChart"></view>
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

    <view class="empty-state" v-if="totalTasks === 0">
      <text class="empty-text">暂无任务数据</text>
      <view class="empty-action">
        <button class="refresh-button" @tap="refreshData">刷新数据</button>
      </view>
    </view>
  </view>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
  import { useThemeStore } from '@/stores/theme';
  import { usePointsStore } from '@/stores/pointsStore';
  import * as echarts from 'echarts/core';
  import { LineChart } from 'echarts/charts';
  import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent
  } from 'echarts/components';
  import { CanvasRenderer } from 'echarts/renderers';

  // 注册必需的组件
  echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    LineChart,
    CanvasRenderer
  ]);

  // 初始化主题和积分Store
  const themeStore = useThemeStore();
  const pointsStore = usePointsStore();
  const isDarkMode = computed(() => themeStore.isDarkMode);

  // 响应式数据
  const activeTimeRange = ref('7');
  const totalTasks = ref(0);
  const completionRate = ref(0);
  // 总积分
  const totalScore = ref(0);
  let chartInstance = null;

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

    // 检查是否为Blob URL，可能是无效的
    if (avatar && avatar.startsWith('blob:')) {
      console.log('检测到Blob类型头像，可能无效，改用emoji表情代替');
      // Blob URL可能已失效，返回null表示没有有效头像
      return null;
    }

    // 非Blob URL的普通URL头像
    if (avatar && !avatar.startsWith('blob:')) {
      return avatar;
    }

    // 无头像或头像无效
    return null;
  });

  // 获取宝宝默认头像
  const getDefaultAvatar = (babyId) => {
    // 基于宝宝ID返回一个默认表情头像
    // 使用宝宝ID的最后一个字符作为随机种子
    const lastChar = babyId ? babyId.charAt(babyId.length - 1) : '0';
    const lastDigit = parseInt(lastChar, 16) % 5; // 获取0-4的值

    // 定义几个可爱的表情作为默认头像
    const defaultAvatars = ['👶', '👼', '🧒', '👦', '👧'];
    return defaultAvatars[lastDigit];
  };

  // 加载宝宝信息
  const loadBabies = () => {
    try {
      // 加载宝宝列表
      const storedBabies = uni.getStorageSync('babies') || '[]';
      babies.value = typeof storedBabies === 'string' ? JSON.parse(storedBabies) : storedBabies;

      // 加载当前选中宝宝
      const storedCurrentBabyId = uni.getStorageSync('currentBabyId');
      currentBabyId.value = storedCurrentBabyId || (babies.value[0]?.id || '');

      // 更新积分显示
      updateShowPoints();
    } catch (e) {
      console.error('加载宝宝信息失败:', e);
    }
  };

  // 切换宝宝
  const onBabyChange = (e) => {
    const idx = e.detail.value;
    if (babies.value[idx]) {
      // 记录之前的宝宝ID，用于检测变化
      const oldBabyId = currentBabyId.value;
      const newBabyId = babies.value[idx].id;

      // 只有宝宝ID发生变化时才触发更新
      if (oldBabyId !== newBabyId) {
        console.log(`[趋势页] 切换宝宝: 从[${oldBabyId}]到[${newBabyId}]`);

        // 更新本地状态
        currentBabyId.value = newBabyId;

        // 同步保存到本地存储
        uni.setStorageSync('currentBabyId', newBabyId);

        // 用setTimeout确保事件在状态更新后触发
        setTimeout(() => {
          // 广播宝宝切换事件，传递完整宝宝信息
          uni.$emit('babyChanged', {
            babyId: newBabyId,
            babyInfo: babies.value[idx],
            source: 'statistics',  // 标记事件来源
            timestamp: Date.now() // 添加时间戳避免重复
          });

          // 强制发送通知给其他页面
          uni.showToast({
            title: `已切换到"${babies.value[idx].name}"`,
            icon: 'none',
            duration: 1500
          });
        }, 50);

        // 强制重新加载数据并更新图表
        updateShowPoints();
        loadTaskData();
      }
    }
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
    // 从存储中读取当前宝宝ID
    const storedBabyId = uni.getStorageSync('currentBabyId');

    // 如果本地状态与存储不一致，更新本地状态
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
      // 从本地存储加载已完成的任务列表
      const storedCompletedTasks = uni.getStorageSync('completedTaskList');
      let completedTasks = [];

      if (storedCompletedTasks) {
        completedTasks = JSON.parse(storedCompletedTasks);
        console.log('加载到已完成任务:', completedTasks.length);
      }

      // 从本地存储加载所有任务列表
      const storedTasks = uni.getStorageSync('taskList');
      let allTasks = [];

      if (storedTasks) {
        allTasks = JSON.parse(storedTasks);
        console.log('加载到所有任务:', allTasks.length);
      }

      // 筛选当前宝宝的任务
      if (currentBabyId.value) {
        completedTasks = completedTasks.filter(task => task.babyId === currentBabyId.value);
        allTasks = allTasks.filter(task => task.babyId === currentBabyId.value);
      } else {
        completedTasks = [];
        allTasks = [];
      }

      // 根据选择的时间范围生成图表数据
      const days = parseInt(activeTimeRange.value);
      const data = await generateDataFromTasks(completedTasks, allTasks, days);

      // 更新图表
      updateChartWithData(data);
    } catch (e) {
      console.error('加载任务数据失败:', e);
      // 如果出错，显示一个空图表
      updateChartWithData({
        dates: [],
        completed: [],
        total: []
      });
    }
  };

  // 从任务数据生成图表数据
  const generateDataFromTasks = (completedTasks, allTasks, days) => {
    return new Promise((resolve) => {
      const data = {
        dates: [],
        completed: [],
        total: []
      };

      const now = new Date();
      let totalTaskCount = 0;
      let completedTaskCount = 0;

      // 生成日期范围
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);

        // 日期格式化
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        data.dates.push(dateStr);

        // 日期的开始时间（当天0点）
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        // 日期的结束时间（当天23:59:59）
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // 计算当天完成的任务数量
        const dayCompletedTasks = completedTasks.filter(task => {
          const completedAt = new Date(task.completedAt);
          return completedAt >= startOfDay && completedAt <= endOfDay;
        });

        // 当天的总任务数（包括所有状态的任务）
        const dayAllTasksCount = allTasks.filter(task => {
          const createdAt = new Date(task.createdAt);
          return createdAt <= endOfDay; // 只统计在当天结束前创建的任务
        }).length;

        const dayCompletedCount = dayCompletedTasks.length;

        data.completed.push(dayCompletedCount);
        data.total.push(dayAllTasksCount);

        totalTaskCount += dayAllTasksCount;
        completedTaskCount += dayCompletedCount;
      }

      // 更新统计信息
      totalTasks.value = totalTaskCount;
      if (totalTaskCount > 0) {
        completionRate.value = Math.round((completedTaskCount / totalTaskCount) * 100);
      } else {
        completionRate.value = 0;
      }

      resolve(data);
    });
  };

  // 更新图表数据
  const updateChartWithData = (data) => {
    if (chartInstance) {
      chartInstance.setOption({
        xAxis: {
          data: data.dates
        },
        series: [
          {
            name: '完成任务',
            data: data.completed
          },
          {
            name: '总任务',
            data: data.total
          }
        ]
      });
    } else {
      // 初次加载时初始化图表
      initChart(data);
    }
  };

  // 手动刷新数据
  const refreshData = () => {
    // 使用振动API反馈
    if (uni.vibrateShort) {
      uni.vibrateShort({
        success: function () {
          console.log('振动成功');
        }
      });
    }

    // 重新加载宝宝信息
    loadBabies();

    // 重新加载任务数据
    loadTaskData();

    // 显示提示
    uni.showToast({
      title: '数据已刷新',
      icon: 'success',
      duration: 1500
    });
  };

  // 初始化图表
  const initChart = (data) => {
    // 确保DOM已经准备好
    // #ifndef MP-WEIXIN
    nextTick(() => {
      const chartDom = document.getElementById('taskTrendChart');
      if (!chartDom) {
        console.error('找不到图表DOM元素');
        return;
      }
      
      chartInstance = echarts.init(chartDom);
      
      const option = {
        title: {
          text: '任务完成趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['完成任务', '总任务'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.dates
        },
        yAxis: {
          type: 'value',
          minInterval: 1
        },
        series: [
          {
            name: '完成任务',
            type: 'line',
            data: data.completed,
            itemStyle: {
              color: '#8477fa'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(132, 119, 250, 0.5)' },
                  { offset: 1, color: 'rgba(132, 119, 250, 0.1)' }
                ]
              }
            }
          },
          {
            name: '总任务',
            type: 'line',
            data: data.total,
            itemStyle: {
              color: '#ff9c6e'
            }
          }
        ]
      };
      
      chartInstance.setOption(option);
    });
    // #endif
    
    // #ifdef MP-WEIXIN
    initMpChart(data);
    // #endif
  };

  // 处理窗口大小变化
  const handleResize = () => {
    if (chartInstance) {
      chartInstance.resize();
    }
  };

  // 组件挂载时
  onMounted(async () => {
    // 初始化主题
    if (themeStore.initTheme) {
      themeStore.initTheme();
    }

    // 初始化积分Store
    if (pointsStore.init) {
      pointsStore.init();
    }

    // 加载宝宝信息
    loadBabies();

    // 加载任务数据
    await loadTaskData();

    // 监听窗口大小变化
    // #ifndef MP-WEIXIN
    window.addEventListener('resize', handleResize);
    // #endif
    
    // 添加任务列表刷新事件监听
    uni.$on('refreshTaskList', () => {
      loadTaskData();
    });

    // 添加积分更新事件监听
    uni.$on('pointsUpdated', updateShowPoints);

    // 添加宝宝积分更新事件监听
    uni.$on('babyPointsUpdated', (data) => {
      if (data && data.babyId === currentBabyId.value) {
        totalScore.value = data.points;
      }
    });

    // 监听宝宝变更事件
    uni.$on('babyChanged', (data) => {
      // 检查是否为对象(新格式)或字符串(旧格式)
      const babyId = typeof data === 'object' ? data.babyId : data;
      const source = typeof data === 'object' ? (data.source || 'unknown') : 'unknown';

      // 避免自己触发的事件导致循环
      if (source === 'statistics') {
        console.log('[趋势页] 忽略自己触发的宝宝变更事件');
        return;
      }

      // 只有当ID变化时才更新
      if (currentBabyId.value !== babyId) {
        console.log(`[趋势页] 接收到来自[${source}]的宝宝变更事件: ${babyId}`);
        currentBabyId.value = babyId;

        // 强制刷新处理
        loadBabies();
        loadTaskData();
        updateShowPoints();
      }
    });

    // 添加宝宝列表刷新事件监听
    uni.$on('refreshBabyList', () => {
      console.log('[趋势页] 接收到宝宝列表刷新事件');
      loadBabies();
      loadTaskData();
    });
    
    // 页面加载时主动检查宝宝状态
    checkBabyStatus();
  });

  // 组件卸载时
  onUnmounted(() => {
    // 移除事件监听
    // #ifndef MP-WEIXIN
    window.removeEventListener('resize', handleResize);
    // #endif
    
    // 移除自定义事件监听
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

  // 小程序兼容代码
  // 小程序中的初始化
  const initMpChart = async (data) => {
    // #ifdef MP-WEIXIN
    // 需要等待页面渲染完成
    const query = uni.createSelectorQuery();
    query.select('#taskTrendChart').boundingClientRect().exec(async (res) => {
      if (res[0]) {
        const { width, height } = res[0];
        
        // 动态引入微信小程序的echarts组件
        const mpChart = echarts.init(null, null, {
          width: width,
          height: height,
          devicePixelRatio: uni.getSystemInfoSync().pixelRatio
        });
        
        chartInstance = mpChart;
        
        // 设置图表选项
        const option = {
          title: {
            text: '任务完成趋势',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['完成任务', '总任务'],
            bottom: 0
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '15%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.dates
          },
          yAxis: {
            type: 'value',
            minInterval: 1
          },
          series: [
            {
              name: '完成任务',
              type: 'line',
              data: data.completed,
              itemStyle: {
                color: '#8477fa'
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: 'rgba(132, 119, 250, 0.5)' },
                    { offset: 1, color: 'rgba(132, 119, 250, 0.1)' }
                  ]
                }
              }
            },
            {
              name: '总任务',
              type: 'line',
              data: data.total,
              itemStyle: {
                color: '#ff9c6e'
              }
            }
          ]
        };
        
        mpChart.setOption(option);
      }
    });
    // #endif
  };
</script>

<script>
  export default {
    // uni-app生命周期方法
    onShow() {
      // 避免在安装后直接调用
      setTimeout(() => {
        // 检查宝宝状态
        checkBabyStatus();
        
        // 刷新数据
        loadTaskData();
      }, 200);
    }
  };
</script>

<style lang="scss" scoped>

  /* 页面容器 */
  .page-container {
    min-height: 100vh;
    padding-bottom: 50px;
    background-color: #f8f8f8;
    position: relative;
    z-index: 0;
    /* 确保页面容器的z-index低于其他元素 */
    overflow: hidden;
    /* 防止内容溢出 */
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
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .chart-wrapper {
    width: 100%;
    height: 300px;
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