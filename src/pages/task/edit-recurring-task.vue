<!-- 编辑周期性任务页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">编辑任务</text>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <!-- 宝宝信息展示（不可更改） -->
      <view class="form-item">
        <text class="form-label">所属宝宝</text>
        <view class="baby-info">
          <text class="baby-name">{{ currentBabyName }}</text>
        </view>
      </view>

      <!-- 任务标题 -->
      <view class="form-item">
        <text class="form-label">任务标题</text>
        <input class="form-input" v-model="taskForm.title" placeholder="请输入任务标题" placeholder-class="placeholder" />
      </view>

      <!-- 任务描述 -->
      <view class="form-item">
        <text class="form-label">任务描述</text>
        <textarea class="form-textarea" v-model="taskForm.description" placeholder="请输入任务描述(不超过50字)" placeholder-class="placeholder" />
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
        <input class="form-input" v-model="taskForm.points" type="number" placeholder="请输入任务积分" placeholder-class="placeholder" />
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-btn-container">
      <button class="submit-btn" @tap="updateTask" :disabled="!isFormValid">
        保存修改
      </button>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
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

    // 表单数据
    const taskForm = ref({
      id: '',
      title: '',
      description: '',
      tags: [],
      type: 'recurring',
      recurringType: 'daily',
      weekdays: [],
      customStartTime: '',
      customEndTime: '',
      points: '',
      babyId: '',
      status: 'ongoing',
      completed: 0
    });

    // 当前宝宝信息
    const currentBabyName = ref('');

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
      // 确保weekdays按升序排序
      taskForm.value.weekdays.sort((a, b) => a - b);
    };

    // 自定义时间选择
    const onStartTimeChange = (e) => {
      taskForm.value.customStartTime = e.detail.value;
    };

    const onEndTimeChange = (e) => {
      taskForm.value.customEndTime = e.detail.value;
    };

    // 返回上一页
    const goBack = () => {
      uni.navigateBack();
    };

    // 更新任务
    const updateTask = () => {
      if (!isFormValid.value) {
        uni.showToast({
          title: '请完善任务信息',
          icon: 'none'
        });
        return;
      }

      try {
        // 从存储中获取任务列表
        let taskList = uni.getStorageSync('taskList') || '[]';
        taskList = JSON.parse(taskList);

        // 找到要更新的任务
        const taskIndex = taskList.findIndex(t => t.id === taskForm.value.id);
        if (taskIndex === -1) {
          throw new Error('任务不存在');
        }

        // 保留原有的不可变字段
        const originalTask = taskList[taskIndex];
        const updatedTask = {
          ...originalTask,
          ...taskForm.value,
          // 确保以下字段不被修改
          id: originalTask.id,
          babyId: originalTask.babyId,
          type: 'recurring',
          createdAt: originalTask.createdAt
        };

        // 更新任务列表
        taskList[taskIndex] = updatedTask;

        // 保存更新后的任务列表
        uni.setStorageSync('taskList', JSON.stringify(taskList));

        // 发送更新事件
        uni.$emit('taskUpdated', {
          taskId: updatedTask.id,
          task: updatedTask,
          timestamp: Date.now()
        });

        uni.showToast({
          title: '更新成功',
          icon: 'success'
        });

        // 返回上一页
        setTimeout(() => {
          uni.navigateBack({
            delta: 1
          });
        }, 1500);

      } catch (e) {
        console.error('更新任务失败:', e);
        uni.showToast({
          title: '更新失败，请重试',
          icon: 'none'
        });
      }
    };

    onMounted(() => {
      // 获取页面参数
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const taskId = currentPage.options.taskId;

      console.log('当前任务ID:', taskId); // 添加日志

      if (!taskId) {
        uni.showToast({
          title: '任务ID不存在',
          icon: 'none'
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
        return;
      }

      // 从存储中获取任务信息
      try {
        const taskListStr = uni.getStorageSync('taskList');
        console.log('获取到的任务列表字符串:', taskListStr); // 添加日志

        if (!taskListStr) {
          throw new Error('任务列表为空');
        }

        const taskList = JSON.parse(taskListStr);
        console.log('解析后的任务列表:', taskList, taskId); // 添加日志

        const task = taskList.find(t => t.id == taskId);
        console.log('找到的任务:', task); // 添加日志
        
        if (!task) {
          throw new Error('找不到对应ID的任务');
        }

        // 获取宝宝信息
        const babiesStr = uni.getStorageSync('babies');
        console.log('获取到的宝宝列表字符串:', babiesStr); // 添加日志

        if (babiesStr) {
          const babies = JSON.parse(babiesStr);
          const baby = babies.find(b => b.id === task.babyId);
          if (baby) {
            currentBabyName.value = baby.name;
          } else {
            console.warn('未找到对应的宝宝信息'); // 添加警告日志
          }
        }

        // 填充表单数据
        taskForm.value = {
          ...task,
          // 确保weekdays是数组
          weekdays: Array.isArray(task.weekdays) ? [...task.weekdays].sort((a, b) => a - b) : []
        };

        console.log('表单数据已填充:', taskForm.value); // 添加日志

      } catch (e) {
        console.error('加载任务信息失败:', e, '\n详细错误:', e.stack); // 添加详细错误信息
        uni.showToast({
          title: '加载失败: ' + e.message,
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 2000);
      }
    });

    return {
      taskForm,
      tagCategories,
      selectedCategory,
      weekdays,
      currentBabyName,
      isFormValid,
      toggleTag,
      toggleWeekday,
      onStartTimeChange,
      onEndTimeChange,
      goBack,
      updateTask
    };
  }
};
</script>

<style>
/* 复用add-task.vue的样式 */
.page-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 40rpx;
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

.form-container {
  padding: 30rpx;
  background-color: #fff;
  margin-top: 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.baby-info {
  background-color: #f5f5f5;
  padding: 20rpx;
  border-radius: 12rpx;
}

.baby-name {
  font-size: 28rpx;
  color: #666;
}

/* 其他样式与add-task.vue相同 */
</style> 