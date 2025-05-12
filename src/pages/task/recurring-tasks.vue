<template>
  <view class="page-container" :class="{'dark-mode': isDarkMode}">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <view class="nav-title">周期性任务</view>
    </view>

    <!-- 宝宝选择器 -->
    <view class="baby-selector" v-if="babies.length > 0">
      <picker :range="babies" range-key="name" @change="onBabyChange">
        <view class="baby-select-view">
          <text class="baby-select-text">当前宝宝：</text>
          <text class="baby-name">{{ currentBabyName }}</text>
          <text class="baby-arrow">▼</text>
        </view>
      </picker>
    </view>

    <!-- 任务列表 -->
    <view class="tasks-list">
      <view v-if="recurringTasks.length === 0" class="empty-state">
        <text class="empty-text">暂无周期性任务</text>
      </view>
      <view v-else class="task-item" v-for="(task, index) in recurringTasks" :key="index">
        <view class="task-header">
          <text class="task-title">{{ task.title }}</text>
          <text class="task-type">{{ getTaskTypeText(task.recurringType) }}</text>
        </view>
        <view class="task-details">
          <text class="task-description">{{ task.description || '暂无描述' }}</text>
          <text class="task-reset-time">下次重置: {{ formatDate(task.resetTime) }}</text>
        </view>
        <view class="task-actions">
          <button class="edit-btn" @tap="editTask(task)">编辑</button>
          <button class="delete-btn" @tap="deleteTask(task)">删除</button>
        </view>
      </view>
    </view>

    <!-- 添加按钮 -->
    <!-- <view class="float-btn" @tap="showAddTaskModal">
      <text>＋</text>
    </view> -->

    <!-- 添加/编辑任务弹窗 -->
    <view class="modal-mask" v-if="showModal" @tap="closeModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ isEditing ? '编辑任务' : '添加任务' }}</text>
        </view>
        <view class="modal-body">
          <input class="modal-input" v-model="taskForm.title" placeholder="任务名称" />
          <textarea class="modal-textarea" v-model="taskForm.description" placeholder="任务描述" />
          <picker mode="selector" :range="taskTypes" @change="onTaskTypeChange">
            <view class="picker-view">
              <text>任务类型：</text>
              <text>{{ taskForm.recurringType || '请选择' }}</text>
            </view>
          </picker>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @tap="closeModal">取消</button>
          <button class="modal-btn confirm" @tap="saveTask">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { isDarkTheme } from '@/utils/themeUtils.js';

export default {
  name: 'RecurringTasks',
  setup() {
    const isDarkMode = ref(false);
    const recurringTasks = ref([]);
    const showModal = ref(false);
    const isEditing = ref(false);
    const currentTask = ref(null);
    
    // 宝宝相关
    const babies = ref([]);
    const currentBabyId = ref('');
    const currentBabyName = computed(() => {
      if (!Array.isArray(babies.value) || babies.value.length === 0) {
        return '暂无宝宝';
      }
      const baby = babies.value.find(b => b && b.id === currentBabyId.value);
      return baby ? baby.name : '请选择宝宝';
    });

    const taskTypes = ['每日', '每周', '每月'];
    const taskForm = ref({
      title: '',
      description: '',
      recurringType: ''
    });

    // 加载宝宝信息
    const loadBabies = () => {
      try {
        const storedBabies = uni.getStorageSync('babies') || '[]';
        babies.value = typeof storedBabies === 'string' ? JSON.parse(storedBabies) : (Array.isArray(storedBabies) ? storedBabies : []);
        
        const storedBabyId = uni.getStorageSync('currentBabyId');
        currentBabyId.value = storedBabyId || (babies.value.length > 0 ? babies.value[0].id : '');
        
        if (babies.value.length > 0 && !storedBabyId) {
          uni.setStorageSync('currentBabyId', currentBabyId.value);
        }
      } catch (e) {
        console.error('加载宝宝信息失败:', e);
        babies.value = [];
      }
    };

    // 切换宝宝
    const onBabyChange = (e) => {
      const idx = e.detail.value;
      if (idx >= 0 && idx < babies.value.length && babies.value[idx]) {
        currentBabyId.value = babies.value[idx].id;
        uni.setStorageSync('currentBabyId', currentBabyId.value);
        loadRecurringTasks();
      }
    };

    // 加载周期性任务
    const loadRecurringTasks = () => {
      try {
        const tasks = uni.getStorageSync('taskList') || '[]';
        const allTasks = JSON.parse(tasks);
        recurringTasks.value = allTasks.filter(task => 
          task.type === 'recurring' && 
          (!task.babyId || task.babyId === currentBabyId.value)
        );
      } catch (e) {
        console.error('加载周期性任务失败:', e);
        recurringTasks.value = [];
      }
    };

    // 获取任务类型文本
    const getTaskTypeText = (type) => {
      const typeMap = {
        'daily': '每日',
        'weekly': '每周',
        'monthly': '每月'
      };
      return typeMap[type] || '未知';
    };

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '未设置';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    // 显示添加任务弹窗
    const showAddTaskModal = () => {
      isEditing.value = false;
      taskForm.value = {
        title: '',
        description: '',
        recurringType: ''
      };
      showModal.value = true;
    };

    // 编辑任务
    const editTask = (task) => {
      isEditing.value = true;
      currentTask.value = task;
      taskForm.value = { ...task };
      showModal.value = true;
    };

    // 删除任务
    const deleteTask = (task) => {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个任务吗？',
        success: (res) => {
          if (res.confirm) {
            try {
              const tasks = JSON.parse(uni.getStorageSync('taskList') || '[]');
              const index = tasks.findIndex(t => t.id === task.id);
              if (index !== -1) {
                tasks.splice(index, 1);
                uni.setStorageSync('taskList', JSON.stringify(tasks));
                loadRecurringTasks();
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
              }
            } catch (e) {
              console.error('删除任务失败:', e);
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              });
            }
          }
        }
      });
    };

    // 保存任务
    const saveTask = () => {
      if (!taskForm.value.title || !taskForm.value.recurringType) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return;
      }

      try {
        const tasks = JSON.parse(uni.getStorageSync('taskList') || '[]');
        const now = new Date();
        const resetTime = new Date(now.getTime() + 24 * 3600 * 1000);
        resetTime.setHours(0, 0, 0, 0);

        if (isEditing.value && currentTask.value) {
          const index = tasks.findIndex(t => t.id === currentTask.value.id);
          if (index !== -1) {
            tasks[index] = {
              ...tasks[index],
              ...taskForm.value,
              babyId: currentBabyId.value
            };
          }
        } else {
          tasks.push({
            id: 'task_' + Date.now(),
            ...taskForm.value,
            type: 'recurring',
            status: 'ongoing',
            completed: '0',
            resetTime: resetTime,
            babyId: currentBabyId.value
          });
        }

        uni.setStorageSync('taskList', JSON.stringify(tasks));
        loadRecurringTasks();
        closeModal();
        uni.showToast({
          title: isEditing.value ? '更新成功' : '添加成功',
          icon: 'success'
        });
      } catch (e) {
        console.error('保存任务失败:', e);
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    };

    // 关闭弹窗
    const closeModal = () => {
      showModal.value = false;
      isEditing.value = false;
      currentTask.value = null;
    };

    // 任务类型选择
    const onTaskTypeChange = (e) => {
      const typeMap = {
        '0': 'daily',
        '1': 'weekly',
        '2': 'monthly'
      };
      taskForm.value.recurringType = typeMap[e.detail.value];
    };

    // 返回上一页
    const goBack = () => {
      uni.navigateBack();
    };

    onMounted(() => {
      isDarkMode.value = isDarkTheme();
      loadBabies();
      loadRecurringTasks();

      // 添加宝宝列表更新事件监听
      uni.$on('refreshBabyList', () => {
        loadBabies();
        loadRecurringTasks();
      });
    });

    onUnmounted(() => {
      uni.$off('refreshBabyList');
    });

    return {
      isDarkMode,
      recurringTasks,
      showModal,
      isEditing,
      taskForm,
      taskTypes,
      babies,
      currentBabyName,
      onBabyChange,
      getTaskTypeText,
      formatDate,
      showAddTaskModal,
      editTask,
      deleteTask,
      saveTask,
      closeModal,
      onTaskTypeChange,
      goBack
    };
  }
};
</script>

<style>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 50px;
}

.dark-mode {
  background-color: #1a1a1a;
  color: #ffffff;
}

.nav-bar {
  display: flex;
  align-items: center;
  height: 88rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  padding: 0 30rpx;
  position: relative;
}

.nav-left {
  position: absolute;
  left: 30rpx;
  z-index: 1;
}

.nav-title {
  flex: 1;
  text-align: center;
  color: white;
  font-size: 32rpx;
  font-weight: bold;
}

.baby-selector {
  margin: 20rpx;
  padding: 20rpx;
  background-color: white;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.dark-mode .baby-selector {
  background-color: #2a2a2a;
}

.baby-select-view {
  display: flex;
  align-items: center;
}

.baby-select-text {
  font-size: 28rpx;
  color: #666;
}

.dark-mode .baby-select-text {
  color: #999;
}

.baby-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin: 0 10rpx;
}

.dark-mode .baby-name {
  color: #fff;
}

.baby-arrow {
  font-size: 24rpx;
  color: #999;
}

.tasks-list {
  padding: 20rpx;
}

.task-item {
  background-color: white;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.dark-mode .task-item {
  background-color: #2a2a2a;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.task-title {
  font-size: 30rpx;
  font-weight: bold;
}

.task-type {
  font-size: 24rpx;
  color: #8477fa;
  background-color: rgba(132, 119, 250, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.task-details {
  margin-bottom: 20rpx;
}

.task-description {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.dark-mode .task-description {
  color: #999;
}

.task-reset-time {
  font-size: 24rpx;
  color: #999;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}

.edit-btn, .delete-btn {
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
}

.edit-btn {
  background-color: #8477fa;
  color: white;
}

.delete-btn {
  background-color: #ff4d4f;
  color: white;
}

.float-btn {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 48rpx;
  box-shadow: 0 4rpx 16rpx rgba(132, 119, 250, 0.3);
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  width: 600rpx;
  background-color: white;
  border-radius: 20rpx;
  overflow: hidden;
}

.dark-mode .modal-content {
  background-color: #2a2a2a;
}

.modal-header {
  padding: 30rpx;
  text-align: center;
  border-bottom: 1rpx solid #eee;
}

.dark-mode .modal-header {
  border-bottom-color: #333;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
}

.modal-body {
  padding: 30rpx;
}

.modal-input, .modal-textarea {
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  font-size: 28rpx;
}

.dark-mode .modal-input,
.dark-mode .modal-textarea {
  background-color: #333;
  color: #fff;
}

.picker-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.dark-mode .picker-view {
  background-color: #333;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #eee;
}

.dark-mode .modal-footer {
  border-top-color: #333;
}

.modal-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 28rpx;
}

.cancel {
  color: #666;
  border-right: 1rpx solid #eee;
}

.dark-mode .cancel {
  color: #999;
  border-right-color: #333;
}

.confirm {
  color: #8477fa;
  font-weight: bold;
}

.empty-state {
  padding: 60rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.dark-mode .empty-text {
  color: #666;
}
</style> 