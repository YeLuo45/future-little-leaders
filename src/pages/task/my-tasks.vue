<!-- 我的任务 - 儿童端 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">我的任务</text>
    </view>

    <!-- 宝宝选择器 -->
    <view class="baby-selector-bar">
      <picker :range="babies" range-key="name" @change="onBabyChange" :value="currentBabyIndex">
        <view class="baby-picker">
          <text class="baby-name">{{ currentBabyName || '请选择宝宝' }}</text>
          <text class="arrow">▼</text>
        </view>
      </picker>
    </view>

    <!-- 标签筛选 -->
    <view class="filter-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @tap="activeTab = tab.key"
      >
        {{ tab.label }}
        <text v-if="tab.key === 'pending' && pendingCount > 0" class="badge">{{ pendingCount }}</text>
      </view>
    </view>

    <!-- 任务列表 -->
    <scroll-view scroll-y class="flow-list">
      <view v-if="filteredFlows.length > 0">
        <view
          v-for="flow in filteredFlows"
          :key="flow.id"
          class="flow-card"
        >
          <!-- 状态标签 -->
          <view class="flow-header">
            <view class="state-badge" :class="`state-${flow.state}`">
              {{ stateLabels[flow.state] || flow.state }}
            </view>
            <text class="flow-points">🔥 {{ flow.rewardPoints }}积分</text>
          </view>

          <!-- 任务信息 -->
          <view class="flow-content">
            <text class="flow-title">{{ flow.taskTitle }}</text>
            <text class="flow-time">{{ formatTime(flow.createdAt) }}</text>
          </view>

          <!-- 打回原因 -->
          <view v-if="flow.state === 'rejected' && flow.rejectionReason" class="reject-reason">
            <text class="reject-label">打回原因：</text>
            <text>{{ flow.rejectionReason }}</text>
          </view>

          <!-- 操作按钮 -->
          <view class="flow-actions">
            <!-- assigned 状态：开始任务 -->
            <button
              v-if="flow.state === 'assigned'"
              class="action-btn btn-start"
              @tap="startFlow(flow.id)"
            >开始</button>

            <!-- in_progress 状态：完成打卡 -->
            <button
              v-if="flow.state === 'in_progress'"
              class="action-btn btn-complete"
              @tap="completeFlow(flow.id)"
            >完成打卡</button>

            <!-- rejected 状态：查看原因 + 重新提交 -->
            <button
              v-if="flow.state === 'rejected'"
              class="action-btn btn-reason"
              @tap="viewReason(flow.rejectionReason)"
            >查看原因</button>
            <button
              v-if="flow.state === 'rejected'"
              class="action-btn btn-resubmit"
              @tap="resubmitFlow(flow.id)"
            >重新提交</button>

            <!-- pending_approval 状态：等待审核 -->
            <text v-if="flow.state === 'pending_approval'" class="waiting-text">等待家长审核...</text>

            <!-- rewarded 状态：已完成 -->
            <text v-if="flow.state === 'rewarded'" class="done-text">✅ 已获得奖励</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无任务</text>
        <text class="empty-hint">快去完成家长分配的任务吧！</text>
      </view>
    </scroll-view>

    <!-- 返回按钮 -->
    <view class="float-back" @tap="goBack">←</view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const babies = ref([]);
    const currentBabyIndex = ref(0);
    const currentBabyId = ref('');
    const activeTab = ref('all');
    const allFlows = ref([]);

    const tabs = [
      { key: 'all', label: '全部' },
      { key: 'ongoing', label: '进行中' },
      { key: 'pending', label: '待审核' },
      { key: 'done', label: '已完成' },
    ];

    const stateLabels = {
      assigned: '已分配',
      in_progress: '进行中',
      pending_approval: '待审核',
      approved: '已通过',
      rejected: '已打回',
      rewarded: '已完成',
    };

    const currentBabyName = computed(() => {
      const baby = babies.value[currentBabyIndex.value];
      return baby ? baby.name : '';
    });

    const pendingCount = computed(() => {
      return allFlows.value.filter(f => f.state === 'pending_approval').length;
    });

    const filteredFlows = computed(() => {
      if (activeTab.value === 'all') return allFlows.value;
      if (activeTab.value === 'ongoing') {
        return allFlows.value.filter(f => ['assigned', 'in_progress'].includes(f.state));
      }
      if (activeTab.value === 'pending') {
        return allFlows.value.filter(f => f.state === 'pending_approval');
      }
      if (activeTab.value === 'done') {
        return allFlows.value.filter(f => ['rewarded', 'rejected', 'approved'].includes(f.state));
      }
      return allFlows.value;
    });

    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
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
      loadFlows();
      // 监听流转更新事件
      uni.$on('collab:notification', () => {
        loadFlows();
      });
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

    const startFlow = (flowId) => {
      try {
        const { startTaskFlow } = require('../../services/collaborationService');
        startTaskFlow(flowId);
        uni.showToast({ title: '任务已开始', icon: 'success' });
        loadFlows();
      } catch (e) {
        console.error('开始任务失败:', e);
        uni.showToast({ title: '操作失败', icon: 'none' });
      }
    };

    const completeFlow = (flowId) => {
      uni.showModal({
        title: '完成打卡',
        placeholderText: '打卡说明（选填）',
        editable: true,
        success: (res) => {
          if (res.confirm) {
            try {
              const { completeTaskFlow } = require('../../services/collaborationService');
              completeTaskFlow(flowId, res.content || '完成打卡');
              uni.showToast({ title: '已提交审核', icon: 'success' });
              uni.$emit('refreshTaskList');
              loadFlows();
            } catch (e) {
              console.error('完成任务失败:', e);
              uni.showToast({ title: '操作失败', icon: 'none' });
            }
          }
        }
      });
    };

    const resubmitFlow = (flowId) => {
      uni.showModal({
        title: '重新提交',
        placeholderText: '重新填写打卡说明',
        editable: true,
        success: (res) => {
          if (res.confirm) {
            try {
              const { resubmitTaskFlow } = require('../../services/collaborationService');
              resubmitTaskFlow(flowId, res.content || '重新提交');
              uni.showToast({ title: '已重新提交', icon: 'success' });
              loadFlows();
            } catch (e) {
              console.error('重新提交失败:', e);
            }
          }
        }
      });
    };

    const viewReason = (reason) => {
      uni.showModal({
        title: '打回原因',
        content: reason || '无',
        showCancel: false,
      });
    };

    const goBack = () => {
      uni.navigateBack();
    };

    return {
      babies,
      currentBabyIndex,
      currentBabyName,
      activeTab,
      tabs,
      filteredFlows,
      pendingCount,
      formatTime,
      onBabyChange,
      startFlow,
      completeFlow,
      resubmitFlow,
      viewReason,
      goBack,
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
  height: 88rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  padding: 90rpx 40rpx 60rpx;
  position: relative;
}
.nav-left { position: absolute; left: 30rpx; }
.icon { color: white; font-size: 48rpx; font-weight: bold; }
.nav-title { flex: 1; text-align: center; color: white; font-size: 36rpx; font-weight: bold; }
.baby-selector-bar {
  background: white;
  padding: 20rpx 30rpx;
}
.baby-picker {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.baby-name { font-size: 28rpx; color: #333; }
.arrow { font-size: 24rpx; color: #999; }
.filter-tabs {
  display: flex;
  background: white;
  padding: 0 20rpx 20rpx;
  gap: 20rpx;
}
.tab-item {
  padding: 12rpx 28rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
  background: #f0f0f0;
  position: relative;
}
.tab-item.active {
  background: #8B5CF6;
  color: white;
}
.badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: #EF4444;
  color: white;
  font-size: 20rpx;
  padding: 4rpx 10rpx;
  border-radius: 20rpx;
  min-width: 32rpx;
  text-align: center;
}
.flow-list {
  height: calc(100vh - 400rpx);
  padding: 20rpx;
}
.flow-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
}
.flow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.state-badge {
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
  font-size: 22rpx;
  color: white;
}
.state-assigned { background: #8B5CF6; }
.state-in_progress { background: #F59E0B; }
.state-pending_approval { background: #3B82F6; }
.state-approved { background: #10B981; }
.state-rejected { background: #EF4444; }
.state-rewarded { background: #10B981; }
.flow-points { font-size: 26rpx; color: #F59E0B; font-weight: bold; }
.flow-content { margin-bottom: 16rpx; }
.flow-title { font-size: 30rpx; color: #333; font-weight: bold; display: block; margin-bottom: 8rpx; }
.flow-time { font-size: 24rpx; color: #999; }
.reject-reason {
  background: #FEF2F2;
  padding: 16rpx;
  border-radius: 10rpx;
  margin-bottom: 16rpx;
  font-size: 24rpx;
  color: #EF4444;
}
.reject-label { font-weight: bold; }
.flow-actions {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}
.action-btn {
  padding: 16rpx 36rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  border: none;
  color: white;
}
.btn-start { background: #8B5CF6; }
.btn-complete { background: #F59E0B; }
.btn-reason { background: #EF4444; }
.btn-resubmit { background: #3B82F6; }
.waiting-text { font-size: 26rpx; color: #999; padding: 16rpx 0; }
.done-text { font-size: 26rpx; color: #10B981; padding: 16rpx 0; }
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
}
.empty-icon { font-size: 120rpx; margin-bottom: 30rpx; }
.empty-text { font-size: 32rpx; color: #333; font-weight: bold; margin-bottom: 16rpx; }
.empty-hint { font-size: 26rpx; color: #999; }
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
</style>
