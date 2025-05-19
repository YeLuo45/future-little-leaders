<template>
  <view class="page-container" :class="{ 'dark-mode': isDarkMode }">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <view class="nav-title">周期性任务</view>
    </view>

    <!-- 宝宝选择器 -->
    <view class="baby-selector" v-if="babies.length > 0">
      <!-- <picker :range="babies" range-key="name" @change="onBabyChange"> -->
      <picker :range="babies" range-key="name">
        <view class="baby-select-view">
          <text class="baby-select-text">当前宝宝：</text>
          <text class="baby-name">{{ currentBabyName }}</text>
          <!-- <text class="baby-arrow">▼</text> -->
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
          <view class="task-tags" v-if="task.tags && task.tags.length > 0">
            <text v-for="(tag, tagIndex) in task.tags" :key="tagIndex" class="task-tag"
              :class="getTagColorClass(tag)">{{ tag }}</text>
          </view>
          <text class="task-reset-time">下次重置: {{ formatDate(task.resetTime) }}</text>
        </view>
        <view class="task-actions">
          <!-- <button class="edit-btn" @tap="editTask(task)">编辑</button> -->
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
          <text class="modal-title">编辑任务</text>
          <text class="modal-close" @tap="closeModal">×</text>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <!-- 任务标题 -->
          <view class="form-item">
            <text class="form-label">任务标题</text>
            <input class="form-input" v-model="taskForm.title" placeholder="请输入任务标题" placeholder-class="placeholder" />
          </view>

          <!-- 任务描述 -->
          <view class="form-item">
            <text class="form-label">任务描述</text>
            <textarea class="form-textarea" v-model="taskForm.description" placeholder="请输入任务描述(不超过50字)"
              placeholder-class="placeholder" />
          </view>

          <!-- 任务标签 -->
          <view class="form-item">
            <text class="form-label">任务标签</text>
            <!-- 标签分类选择器 -->
            <view class="tag-categories">
              <view v-for="(category, catIndex) in tagCategories" :key="catIndex" class="tag-category"
                :class="{ 'active': selectedCategory === catIndex }" @tap="selectedCategory = catIndex">
                {{ category.name }}
              </view>
            </view>

            <!-- 当前分类下的标签 -->
            <view class="tags-container">
              <view v-for="(tag, index) in tagCategories[selectedCategory].tags" :key="index" class="tag-item" :class="[
                `tag-${tagCategories[selectedCategory].colorClass}`,
                { 'selected': taskForm.tags.includes(tag) }
              ]" @tap="toggleTag(tag)">
                {{ tag }}
              </view>
            </view>
          </view>

          <!-- 重复周期 -->
          <view class="form-item">
            <text class="form-label">重复周期</text>
            <view class="recurring-selector">
              <view class="recurring-item" :class="{ 'selected': taskForm.recurringType === 'daily' }"
                @tap="taskForm.recurringType = 'daily'">
                每日
              </view>
              <view class="recurring-item" :class="{ 'selected': taskForm.recurringType === 'weekly' }"
                @tap="taskForm.recurringType = 'weekly'">
                每周
              </view>
              <view class="recurring-item" :class="{ 'selected': taskForm.recurringType === 'custom' }"
                @tap="taskForm.recurringType = 'custom'">
                自定义
              </view>
            </view>

            <!-- 每周选择 -->
            <view class="weekday-selector" v-if="taskForm.recurringType === 'weekly'">
              <view v-for="(day, index) in weekdays" :key="index" class="weekday-item"
                :class="{ 'selected': taskForm.weekdays.includes(day.value) }" @tap="toggleWeekday(day.value)">
                {{ day.label }}
              </view>
            </view>

            <!-- 自定义时间点 -->
            <view class="custom-time" v-if="taskForm.recurringType === 'custom'">
              <view class="time-input">
                <text>开始时间：</text>
                <picker mode="time" :value="taskForm.customStartTime" @change="onStartTimeChange">
                  <view class="picker-value">{{ taskForm.customStartTime || '请选择' }}</view>
                </picker>
              </view>
              <view class="time-input">
                <text>结束时间：</text>
                <picker mode="time" :value="taskForm.customEndTime" @change="onEndTimeChange">
                  <view class="picker-value">{{ taskForm.customEndTime || '请选择' }}</view>
                </picker>
              </view>
            </view>
          </view>

          <!-- 任务积分 -->
          <view class="form-item">
            <text class="form-label">任务积分</text>
            <input class="form-input" v-model="taskForm.points" type="number" placeholder="请输入任务积分"
              placeholder-class="placeholder" />
          </view>
        </scroll-view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @tap="closeModal">取消</button>
          <button class="modal-btn confirm" @tap="saveTask" :disabled="!isFormValid">确定</button>
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

      // 标签分类数据
      const selectedCategory = ref(0);
      const tagCategories = ref([
        {
          name: '生活习惯',
          colorClass: 'lifestyle',
          tags: ['规律作息', '健康饮食', '卫生自理', '时间管理', '物品整理']
        },
        {
          name: '学习思维',
          colorClass: 'learning',
          tags: ['深度阅读', '专注做事', '主动提问', '抗挫能力', '创新思维']
        },
        {
          name: '心理品德',
          colorClass: 'mental',
          tags: ['情绪管理', '同理心', '感恩意识', '责任感', '诚实待人', '界限感']
        },
        {
          name: '社会适应',
          colorClass: 'social',
          tags: ['数字素养', '环保意识', '安全意识', '多元包容', '劳动价值观']
        },
        {
          name: '社交与运动',
          colorClass: 'activity',
          tags: ['社交与冲突解决', '团队合作', '运动习惯', '公共秩序', '沟通表达']
        },
        {
          name: '财商培养',
          colorClass: 'finance',
          tags: ['金钱认知', '财富管理', '财富创造', '社会责任']
        }
      ]);

      // 星期选项
      const weekdays = [
        { label: '周一', value: 1 },
        { label: '周二', value: 2 },
        { label: '周三', value: 3 },
        { label: '周四', value: 4 },
        { label: '周五', value: 5 },
        { label: '周六', value: 6 },
        { label: '周日', value: 7 }
      ];

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

      
      const taskForm = ref({
        title: '',
        description: '',
        recurringType: '',
        tags: [],
        weekdays: [],
        customStartTime: '',
        customEndTime: '',
        points: '',
        completed: 0,
        status: 'ongoing',
        babyId: ''
      });

      const authSettings = ref({
        isEnabled: false,
        hasPassword: false,
        hasBiometric: false
      });

      // 表单验证
      const isFormValid = computed(() => {
        const baseValidation = taskForm.value.title &&
          taskForm.value.description.length <= 50 &&
          taskForm.value.tags.length > 0 &&
          taskForm.value.points > 0;

        if (taskForm.value.recurringType === 'weekly') {
          return baseValidation && taskForm.value.weekdays.length > 0;
        } else if (taskForm.value.recurringType === 'custom') {
          return baseValidation && taskForm.value.customStartTime && taskForm.value.customEndTime;
        }

        return baseValidation;
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
          console.log('开始加载周期性任务，当前宝宝ID:', currentBabyId.value);
          const tasksStr = uni.getStorageSync('taskList');
          console.log('获取到的任务列表字符串:', tasksStr);

          if (!tasksStr) {
            console.log('任务列表为空，初始化为空数组');
            recurringTasks.value = [];
            return;
          }

          const allTasks = JSON.parse(tasksStr);
          console.log('解析后的所有任务:', allTasks);

          recurringTasks.value = allTasks.filter(task => {
            const isRecurring = task.type === 'recurring';
            const matchesBaby = !task.babyId || task.babyId === currentBabyId.value;
            console.log(`任务 ${task.id} - 是否周期性: ${isRecurring}, 是否匹配当前宝宝: ${matchesBaby}`);
            return isRecurring && matchesBaby;
          });

          console.log('过滤后的周期性任务:', recurringTasks.value);
        } catch (e) {
          console.error('加载周期性任务失败:', e, '\n详细错误:', e.stack);
          recurringTasks.value = [];
          uni.showToast({
            title: '加载任务失败: ' + e.message,
            icon: 'none',
            duration: 2000
          });
        }
      };

      // 获取任务类型文本
      const getTaskTypeText = (type) => {
        const typeMap = {
          'daily': '每日',
          'weekly': '每周',
          'monthly': '每月',
          'custom': '每日自定义'
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
          recurringType: '',
          tags: [],
          weekdays: [],
          customStartTime: '',
          customEndTime: '',
          points: '',
          completed: 0,
          status: 'ongoing',
          babyId: ''
        };
        showModal.value = true;
      };

      // 编辑任务
      const editTask = (task) => {
        uni.navigateTo({
          url: `/pages/task/edit-recurring-task?taskId=${task.id}`
        });
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

      // 切换标签选择
      const toggleTag = (tag) => {
        const index = taskForm.value.tags.indexOf(tag);
        if (index === -1) {
          if (taskForm.value.tags.length < 3) {
            taskForm.value.tags.push(tag);
          } else {
            uni.showToast({
              title: '最多选择3个标签',
              icon: 'none'
            });
          }
        } else {
          taskForm.value.tags.splice(index, 1);
        }
      };

      // 切换星期选择
      const toggleWeekday = (day) => {
        const index = taskForm.value.weekdays.indexOf(day);
        if (index === -1) {
          taskForm.value.weekdays.push(day);
        } else {
          taskForm.value.weekdays.splice(index, 1);
        }
      };

      // 自定义时间选择
      const onStartTimeChange = (e) => {
        taskForm.value.customStartTime = e.detail.value;
      };

      const onEndTimeChange = (e) => {
        taskForm.value.customEndTime = e.detail.value;
      };

      // 获取标签样式
      const getTagColorClass = (tag) => {
        for (const category of tagCategories.value) {
          if (category.tags.includes(tag)) {
            return `tag-${category.colorClass}`;
          }
        }
        return 'tag-default';
      };

      // 返回上一页
      const goBack = () => {
        uni.navigateBack();
      };

      // 加载认证设置
      const loadAuthSettings = () => {
        try {
          const settings = uni.getStorageSync('authSettings');
          if (settings) {
            authSettings.value = JSON.parse(settings);
          }
        } catch (e) {
          console.error('加载认证设置失败:', e);
        }
      };

      // 验证身份
      const verifyIdentity = () => {
        return new Promise((resolve, reject) => {
          if (!authSettings.value.isEnabled) {
            resolve(true);
            return;
          }

          // 如果开启了生物识别
          if (authSettings.value.hasBiometric) {
            uni.startSoterAuthentication({
              requestAuthModes: ['fingerPrint'],
              challenge: 'challenge',
              authContent: '请验证指纹',
              success: () => {
                resolve(true);
              },
              fail: () => {
                // 如果生物识别失败，尝试密码验证
                if (authSettings.value.hasPassword) {
                  uni.showModal({
                    title: '验证失败',
                    content: '是否使用密码验证？',
                    success: (res) => {
                      if (res.confirm) {
                        uni.showModal({
                          title: '密码验证',
                          editable: true,
                          placeholderText: '请输入密码',
                          success: (res) => {
                            const password = uni.getStorageSync('authPassword');
                            if (res.content === password) {
                              resolve(true);
                            } else {
                              uni.showToast({
                                title: '密码错误',
                                icon: 'none'
                              });
                              reject(new Error('密码错误'));
                            }
                          }
                        });
                      } else {
                        reject(new Error('验证取消'));
                      }
                    }
                  });
                } else {
                  reject(new Error('验证失败'));
                }
              }
            });
          } else if (authSettings.value.hasPassword) {
            // 如果只开启了密码验证
            uni.showModal({
              title: '密码验证',
              editable: true,
              placeholderText: '请输入密码',
              success: (res) => {
                const password = uni.getStorageSync('authPassword');
                if (res.content === password) {
                  resolve(true);
                } else {
                  uni.showToast({
                    title: '密码错误',
                    icon: 'none'
                  });
                  reject(new Error('密码错误'));
                }
              }
            });
          } else {
            reject(new Error('未设置验证方式'));
          }
        });
      };

      // 完成任务
      const completeTask = async (task) => {
        try {
          await verifyIdentity();
          // 验证通过，执行完成任务逻辑
          // ... 原有的完成任务逻辑 ...
        } catch (error) {
          console.error('验证失败:', error);
          uni.showToast({
            title: '验证失败，无法完成任务',
            icon: 'none'
          });
        }
      };

      onMounted(() => {
        isDarkMode.value = isDarkTheme();
        loadBabies();
        loadRecurringTasks();
        loadAuthSettings();

        // 添加宝宝列表更新事件监听
        uni.$on('refreshBabyList', () => {
          loadBabies();
          loadRecurringTasks();
        });

        // 添加宝宝切换事件监听
        uni.$on('babyChanged', (babyId) => {
          currentBabyId.value = babyId;
          loadRecurringTasks();
        });

        // 添加任务更新事件监听
        uni.$on('taskUpdated', (data) => {
          console.log('收到任务更新事件:', data);
          loadRecurringTasks();
        });
      });

      onUnmounted(() => {
        uni.$off('refreshBabyList');
        uni.$off('babyChanged');
        uni.$off('taskUpdated');
      });

      return {
        isDarkMode,
        recurringTasks,
        showModal,
        isEditing,
        taskForm,
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
        tagCategories,
        selectedCategory,
        weekdays,
        isFormValid,
        toggleTag,
        toggleWeekday,
        onStartTimeChange,
        onEndTimeChange,
        getTagColorClass,
        goBack,
        completeTask
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
    padding: 90rpx 40rpx 60rpx 40rpx;
    position: relative;
  }

  .nav-left {
    position: absolute;
    left: 30rpx;
    z-index: 1;
  }

  .icon {
    color: white;
    font-size: 48rpx;
    font-weight: bold;
  }

  .nav-title {
    flex: 1;
    text-align: center;
    color: white;
    font-size: 48rpx;
    font-weight: bold;
  }

  /* 宝宝选择器样式 */
  .baby-selector {
    margin: 20rpx;
    padding: 20rpx;
    background-color: white;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: center;
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
    color: #7C3AED;
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
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
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

  .edit-btn,
  .delete-btn {
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
    width: 90%;
    max-width: 600rpx;
    background-color: white;
    border-radius: 24rpx;
    overflow: hidden;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .dark-mode .modal-content {
    background-color: #2a2a2a;
  }

  .modal-header {
    padding: 30rpx;
    text-align: center;
    border-bottom: 1rpx solid #eee;
    position: relative;
  }

  .modal-close {
    position: absolute;
    right: 30rpx;
    top: 50%;
    transform: translateY(-50%);
    font-size: 40rpx;
    color: #999;
    cursor: pointer;
  }

  .modal-body {
    padding: 30rpx;
    max-height: 60vh;
    overflow-y: auto;
  }

  .form-item {
    margin-bottom: 30rpx;
  }

  .form-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
  }

  .dark-mode .form-label {
    color: #fff;
  }

  .form-input {
    width: 100%;
    height: 80rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #333;
  }

  .dark-mode .form-input {
    background-color: #333;
    color: #fff;
  }

  .form-textarea {
    width: 100%;
    height: 160rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 28rpx;
    color: #333;
  }

  .dark-mode .form-textarea {
    background-color: #333;
    color: #fff;
  }

  /* 标签分类和标签样式 */
  .tag-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 16rpx;
  }

  .tag-category {
    flex: 1;
    text-align: center;
    padding: 16rpx 24rpx;
    border-radius: 12rpx;
    font-size: 26rpx;
    color: #666;
    background-color: #f5f5f5;
    transition: all 0.3s;
    min-width: 140rpx;
  }

  .tag-category.active {
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    color: #fff;
    font-weight: bold;
    box-shadow: 0 4rpx 12rpx rgba(132, 119, 250, 0.3);
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-top: 20rpx;
    padding: 16rpx;
    border-radius: 16rpx;
    background-color: rgba(245, 245, 245, 0.7);
    max-height: 360rpx;
    overflow-y: auto;
  }

  .tag-item {
    padding: 12rpx 24rpx;
    border-radius: 30rpx;
    font-size: 26rpx;
    color: #fff;
    transition: all 0.3s;
  }

  .tag-item.selected {
    transform: scale(1.05);
    box-shadow: 0 4rpx 12rpx rgba(132, 119, 250, 0.3);
  }

  /* 标签颜色类 */
  .tag-lifestyle {
    background-color: #6366F1;
  }

  .tag-learning {
    background-color: #3B82F6;
  }

  .tag-mental {
    background-color: #EC4899;
  }

  .tag-social {
    background-color: #10B981;
  }

  .tag-activity {
    background-color: #F59E0B;
  }

  .tag-finance {
    background-color: #059669;
  }

  /* 重复周期选择器样式 */
  .recurring-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 20rpx;
  }

  .recurring-item {
    flex: 1;
    min-width: 140rpx;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #666;
    transition: all 0.3s;
  }

  .recurring-item.selected {
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    color: #fff;
  }

  /* 星期选择器样式 */
  .weekday-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-top: 20rpx;
  }

  .weekday-item {
    width: 80rpx;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    font-size: 26rpx;
    color: #666;
    transition: all 0.3s;
  }

  .weekday-item.selected {
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    color: #fff;
  }

  /* 自定义时间选择器样式 */
  .custom-time {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    margin-top: 20rpx;
  }

  .time-input {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }

  .time-input text {
    font-size: 28rpx;
    color: #666;
  }

  .picker-value {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #333;
  }

  /* 按钮样式 */
  .modal-footer {
    padding: 20rpx;
    display: flex;
    gap: 20rpx;
    border-top: 1rpx solid #eee;
  }

  .modal-btn {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    font-size: 28rpx;
    border-radius: 44rpx;
  }

  .cancel {
    background-color: #f5f5f5;
    color: #666;
  }

  .confirm {
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    color: white;
  }

  .confirm[disabled] {
    background: linear-gradient(135deg, #9f8eff, #8477fa);
    opacity: 0.7;
  }

  /* 任务列表中的标签样式 */
  .task-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin: 12rpx 0;
  }

  .task-tag {
    font-size: 24rpx;
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    color: #fff;
  }
</style>