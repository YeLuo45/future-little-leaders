<!-- 任务审核 - 家长端 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">任务审核</text>
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

    <!-- 审核列表 -->
    <scroll-view scroll-y class="audit-list">
      <view v-if="filteredFlows.length > 0">
        <view
          v-for="flow in filteredFlows"
          :key="flow.id"
          class="audit-card"
        >
          <!-- 宝宝信息 -->
          <view class="baby-info">
            <text class="baby-avatar">{{ getBabyEmoji(flow.childId) }}</text>
            <text class="baby-name">{{ getBabyName(flow.childId) }}</text>
          </view>

          <!-- 任务信息 -->
          <view class="task-info">
            <text class="task-title">{{ flow.taskTitle }}</text>
            <view class="task-meta">
              <text class="task-points">🔥 {{ flow.rewardPoints }}积分</text>
              <text class="task-time">{{ formatTime(flow.createdAt) }}</text>
            </view>
          </view>

          <!-- 打卡说明 -->
          <view v-if="flow.evidence" class="evidence-box">
            <text class="evidence-label">打卡说明：</text>
            <text class="evidence-text">{{ flow.evidence }}</text>
          </view>

          <!-- 打回原因 -->
          <view v-if="flow.state === 'rejected' && flow.rejectionReason" class="reject-box">
            <text class="reject-label">已打回：</text>
            <text>{{ flow.rejectionReason }}</text>
          </view>

          <!-- 操作 -->
          <view class="audit-actions">
            <!-- pending_approval: 通过 / 打回 -->
            <template v-if="flow.state === 'pending_approval'">
              <button class="action-btn btn-approve" @tap="approveFlow(flow.id)">通过</button>
              <button class="action-btn btn-reject" @tap="rejectFlow(flow.id)">打回</button>
            </template>

            <!-- 已通过 -->
            <text v-if="flow.state === 'approved' || flow.state === 'rewarded'" class="status-text approved">
              ✅ 已通过
            </text>

            <!-- 已打回 -->
            <text v-if="flow.state === 'rejected'" class="status-text rejected">
              ❌ 已打回
            </text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">✅</text>
        <text class="empty-text">暂无{{ activeTab === 'pending' ? '待审核' : '' }}任务</text>
      </view>
    </scroll-view>

    <!-- 返回 -->
    <view class="float-back" @tap="goBack">←</view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const activeTab = ref('pending');
    const allFlows = ref([]);
    const babies = ref([]);

    const tabs = [
      { key: 'pending', label: '待审核' },
      { key: 'reviewed', label: '已审核' },
      { key: 'all', label: '全部' },
    ];

    const pendingCount = computed(() => {
      return allFlows.value.filter(f => f.state === 'pending_approval').length;
    });

    const filteredFlows = computed(() => {
      if (activeTab.value === 'pending') {
        return allFlows.value.filter(f => f.state === 'pending_approval');
      }
      if (activeTab.value === 'reviewed') {
        return allFlows.value.filter(f => ['approved', 'rewarded', 'rejected'].includes(f.state));
      }
      return allFlows.value;
    });

    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const getBabyName = (childId) => {
      const baby = babies.value.find(b => b.id === childId);
      return baby ? baby.name : '未知宝宝';
    };

    const getBabyEmoji = (childId) => {
      const lastChar = childId ? childId.charAt(childId.length - 1) : '0';
      const digit = parseInt(lastChar, 16) % 5;
      const emojis = ['👶', '👼', '🧒', '👦', '👧'];
      return emojis[digit];
    };

    const loadData = () => {
      // 加载宝宝列表
      try {
        const stored = uni.getStorageSync('babies') || '[]';
        babies.value = typeof stored === 'string' ? JSON.parse(stored) : stored;
      } catch (e) {
        console.error('加载宝宝失败:', e);
      }

      // 加载所有流转
      try {
        const { getTaskFlows } = require('../../services/collaborationService');
        allFlows.value = getTaskFlows() || [];
      } catch (e) {
        console.error('加载流转失败:', e);
      }
    };

    onMounted(() => {
      loadData();
    });

    const approveFlow = (flowId) => {
      uni.showModal({
        title: '确认通过',
        content: '确定要通过该任务的审核吗？积分将自动发放。',
        success: async (res) => {
          if (res.confirm) {
            try {
              const { approveTaskFlow } = require('../../services/collaborationService');
              await approveTaskFlow(flowId);
              uni.showToast({ title: '已通过，积分已发放', icon: 'success' });
              uni.$emit('refreshTaskList');
              loadData();
            } catch (e) {
              console.error('审核通过失败:', e);
              uni.showToast({ title: '操作失败', icon: 'none' });
            }
          }
        }
      });
    };

    const rejectFlow = (flowId) => {
      uni.showModal({
        title: '打回任务',
        editable: true,
        placeholderText: '请输入打回原因',
        success: (res) => {
          if (res.confirm && res.content) {
            try {
              const { rejectTaskFlow } = require('../../services/collaborationService');
              rejectTaskFlow(flowId, res.content);
              uni.showToast({ title: '已打回', icon: 'success' });
              loadData();
            } catch (e) {
              console.error('打回失败:', e);
              uni.showToast({ title: '操作失败', icon: 'none' });
            }
          }
        }
      });
    };

    const goBack = () => {
      uni.navigateBack();
    };

    return {
      activeTab,
      tabs,
      filteredFlows,
      pendingCount,
      formatTime,
      getBabyName,
      getBabyEmoji,
      approveFlow,
      rejectFlow,
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
.filter-tabs {
  display: flex;
  background: white;
  padding: 20rpx;
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
.audit-list {
  height: calc(100vh - 300rpx);
  padding: 20rpx;
}
.audit-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
}
.baby-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.baby-avatar { font-size: 40rpx; }
.baby-name { font-size: 28rpx; color: #333; font-weight: bold; }
.task-info { margin-bottom: 16rpx; }
.task-title { font-size: 30rpx; color: #333; font-weight: bold; display: block; margin-bottom: 8rpx; }
.task-meta { display: flex; gap: 20rpx; }
.task-points { font-size: 26rpx; color: #F59E0B; font-weight: bold; }
.task-time { font-size: 24rpx; color: #999; }
.evidence-box {
  background: #F0FDF4;
  border-radius: 10rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
  font-size: 26rpx;
}
.evidence-label { color: #10B981; font-weight: bold; }
.evidence-text { color: #333; }
.reject-box {
  background: #FEF2F2;
  border-radius: 10rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
  font-size: 26rpx;
  color: #EF4444;
}
.reject-label { font-weight: bold; }
.audit-actions {
  display: flex;
  gap: 20rpx;
  padding-top: 10rpx;
}
.action-btn {
  flex: 1;
  padding: 20rpx 0;
  border-radius: 30rpx;
  font-size: 28rpx;
  border: none;
  color: white;
  text-align: center;
}
.btn-approve { background: #10B981; }
.btn-reject { background: #EF4444; }
.status-text { font-size: 28rpx; padding: 20rpx 0; }
.status-text.approved { color: #10B981; }
.status-text.rejected { color: #EF4444; }
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
}
.empty-icon { font-size: 100rpx; margin-bottom: 30rpx; }
.empty-text { font-size: 32rpx; color: #666; }
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
