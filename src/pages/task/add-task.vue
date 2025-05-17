<!-- 添加任务页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">添加任务</text>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <!-- 任务标题 -->
      <view class="form-item">
        <text class="form-label">任务标题</text>
        <input class="form-input" v-model="taskForm.title" placeholder="请输入任务标题" placeholder-class="placeholder" />
      </view>

      <!-- 任务描述 -->
      <view class="form-item">
        <text class="form-label">任务描述</text>
        <textarea class="form-textarea" v-model="taskForm.description" type="string" placeholder="请输入任务描述(不超过50字)"
          placeholder-class="placeholder" />
      </view>


      <!-- 宝宝选择器 -->
      <view class="form-item">
        <text class="form-label">选择宝宝</text>
        <view class="baby-selector">
          <picker :range="babies" range-key="name" @change="onBabyChange" :value="currentBabyIndex">
            <view class="baby-picker">
              <text class="baby-name">{{ currentBabyName || '请选择宝宝' }}</text>
              <text class="baby-arrow">▼</text>
            </view>
          </picker>
        </view>
      </view>

      <!-- 任务标签 -->
      <view class="form-item">
        <text class="form-label">任务标签</text>
        <!-- 标签分类选择器 -->
        <view class="tag-categories">
          <view 
            v-for="(category, catIndex) in tagCategories" 
            :key="catIndex"
            class="tag-category" 
            :class="{ 'active': selectedCategory === catIndex }"
            @tap="selectedCategory = catIndex"
          >
            {{ category.name }}
          </view>
        </view>
        
        <!-- 当前分类下的标签 -->
        <view class="tags-container">
          <view 
            v-for="(tag, index) in tagCategories[selectedCategory].tags" 
            :key="index" 
            class="tag-item" 
            :class="[
              `tag-${tagCategories[selectedCategory].colorClass}`,
              { 'selected': taskForm.tags.includes(tag) }
            ]" 
            @tap="toggleTag(tag)"
          >
            {{ tag }}
          </view>
        </view>
      </view>

      <!-- 任务类型 -->
      <view class="form-item">
        <text class="form-label">任务类型</text>
        <view class="type-selector">
          <view class="type-item" :class="{ 'selected': taskForm.type === 'normal' }" @tap="taskForm.type = 'normal'">
            普通任务
          </view>
          <view class="type-item" :class="{ 'selected': taskForm.type === 'recurring' }"
            @tap="taskForm.type = 'recurring'">
            周期性任务
          </view>
        </view>
      </view>

      <!-- 周期性设置 -->
      <view class="form-item" v-if="taskForm.type === 'recurring'">
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
          <view class="recurring-item" :class="{ 'selected': taskForm.recurringType === 'monthly' }"
            @tap="taskForm.recurringType = 'monthly'">
            每月
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

        <!-- 每月选择 -->
        <view class="monthday-selector" v-if="taskForm.recurringType === 'monthly'">
          <view v-for="day in 31" :key="day" class="monthday-item"
            :class="{ 'selected': taskForm.monthDays.includes(day) }" @tap="toggleMonthDay(day)">
            {{ day }}日
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

      <!-- 任务时长 -->
      <!-- <view class="form-item">
        <text class="form-label">任务时长（分钟）</text>
        <input class="form-input" v-model="taskForm.total" type="number" placeholder="请输入任务时长"
          placeholder-class="placeholder" />
      </view> -->

      <!-- 任务积分 -->
      <view class="form-item">
        <text class="form-label">任务积分</text>
        <input class="form-input" v-model="taskForm.points" type="number" placeholder="请输入任务积分"
          placeholder-class="placeholder" />
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-btn-container">
      <button class="submit-btn" @tap="submitTask" :disabled="!isFormValid">
        创建任务
      </button>
    </view>
  </view>
</template>

<script>
  import { ref, computed, onMounted } from 'vue';

  export default {
    setup() {
      // 标签分类数据
      const selectedCategory = ref(0); // 默认选中第一个分类
      
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
      
      // 原有的可选标签列表（保留用作备用）
      const availableTags = [
        '阅读', '认知', '健康', '运动', '营养',
        '睡眠', '语言', '思维', '安全', '情感', '社交'
      ];

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
      const currentBabyIndex = ref(0);
      const currentBabyName = computed(() => {
        const selectedBaby = babies.value[currentBabyIndex.value];
        return selectedBaby ? selectedBaby.name : '';
      });

      // 表单数据
      const taskForm = ref({
        title: '',
        description: '',
        tags: [],
        type: 'normal', // 'normal' 或 'recurring'
        recurringType: 'daily', // 只支持type为'recurring'时，支持'daily', 'weekly', 'monthly', 'custom'
        weekdays: [], // 每周重复的日期
        monthDays: [], // 每月重复的日期
        customStartTime: '', // 自定义开始时间
        customEndTime: '', // 自定义结束时间
        total: '',
        points: '',
        completed: 0,
        status: 'ongoing',
        createdAt: null,
        babyId: '' // 关联的宝宝ID
      });

      // 组件挂载时获取宝宝列表和当前宝宝ID
      onMounted(() => {
        // 加载宝宝列表
        try {
          const storedBabies = uni.getStorageSync('babies') || '[]';
          babies.value = typeof storedBabies === 'string' ? JSON.parse(storedBabies) : storedBabies;

          // 加载当前选中宝宝
          const currentBabyId = uni.getStorageSync('currentBabyId');
          taskForm.value.babyId = currentBabyId || (babies.value.length > 0 ? babies.value[0].id : '');

          // 设置初始选中的宝宝索引
          if (taskForm.value.babyId) {
            const index = babies.value.findIndex(baby => baby.id === taskForm.value.babyId);
            if (index !== -1) {
              currentBabyIndex.value = index;
            }
          }

          console.log('加载宝宝信息:', babies.value, taskForm.value.babyId);

          // 如果没有宝宝，提示用户先添加宝宝
          if (babies.value.length === 0) {
            uni.showModal({
              title: '提示',
              content: '请先在"我的"页面添加宝宝',
              showCancel: false,
              success: () => {
                uni.switchTab({
                  url: '/pages/profile/profile'
                });
              }
            });
          }
        } catch (e) {
          console.error('加载宝宝信息失败:', e);
        }
      });

      // 切换宝宝
      const onBabyChange = (e) => {
        const idx = e.detail.value;
        currentBabyIndex.value = idx;
        if (babies.value[idx]) {
          taskForm.value.babyId = babies.value[idx].id;
          console.log('切换宝宝:', babies.value[idx].name, '宝宝ID:', taskForm.value.babyId);
        }
      };

      // 表单验证 - 添加宝宝ID检查, 任务描述不超过50字
      const isFormValid = computed(() => {
        const baseValidation = taskForm.value.title &&
          taskForm.value.description.length <= 50 &&
          taskForm.value.tags.length > 0 &&
          // taskForm.value.total > 0 &&
          taskForm.value.points > 0 &&
          taskForm.value.babyId; // 确保选择了宝宝

        if (taskForm.value.type === 'recurring') {
          switch (taskForm.value.recurringType) {
            case 'weekly':
              return baseValidation && taskForm.value.weekdays.length > 0;
            case 'monthly':
              return baseValidation && taskForm.value.monthDays.length > 0;
            case 'custom':
              return baseValidation && taskForm.value.customStartTime && taskForm.value.customEndTime;
            default:
              return baseValidation;
          }
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
      };

      // 切换日期选择
      const toggleMonthDay = (day) => {
        const index = taskForm.value.monthDays.indexOf(day);
        if (index === -1) {
          taskForm.value.monthDays.push(day);
        } else {
          taskForm.value.monthDays.splice(index, 1);
        }
      };

      // 自定义时间选择
      const onStartTimeChange = (e) => {
        taskForm.value.customStartTime = e.detail.value;
      };

      const onEndTimeChange = (e) => {
        taskForm.value.customEndTime = e.detail.value;
      };

      // 获取标签样式 - 使用分类颜色替代个别标签颜色
      const getTagColorClass = (tag) => {
        // 查找标签所属的分类
        for (const category of tagCategories.value) {
          if (category.tags.includes(tag)) {
            return category.colorClass;
          }
        }
        
        // 如果找不到，使用旧的映射（保留兼容性）
        const tagMap = {
          '阅读': 'education',
          '认知': 'cognitive',
          '健康': 'health',
          '运动': 'fitness',
          '营养': 'nutrition',
          '睡眠': 'sleep',
          '语言': 'language',
          '思维': 'growth',
          '安全': 'default',
          '情感': 'cognitive',
          '社交': 'education'
        };
        return tagMap[tag] || 'default';
      };

      // 返回上一页
      const goBack = () => {
        uni.navigateBack();
      };

      // 提交任务
      const submitTask = () => {
        if (!isFormValid.value) {
          // 如果表单验证不通过，则提示用户
          uni.showToast({
            title: '请完善任务信息',
            icon: 'none'
          });
          return;
        }

        // 设置创建时间和状态
        taskForm.value.createdAt = new Date();
        taskForm.value.status = 'ongoing'; // 确保设置任务状态为进行中
        taskForm.value.completed = 0; // 初始化已完成时间为0

        // 确保任务关联到当前宝宝
        const currentBabyId = uni.getStorageSync('currentBabyId');
        if (currentBabyId && !taskForm.value.babyId) {
          taskForm.value.babyId = currentBabyId;
          console.log('关联任务到宝宝:', currentBabyId);
        }

        // 从本地存储获取现有任务列表
        try {
          let taskList = uni.getStorageSync('taskList') || '[]';
          taskList = JSON.parse(taskList);

          // 生成新任务ID
          const newId = taskList.length > 0 ? Math.max(...taskList.map(t => t.id)) + 1 : 1;
          taskForm.value.id = newId;

          let resetTime = 0;
          if (taskForm.value.type === 'recurring') {
            // 周期性任务，默认24小时
            let interval = 24 * 3600;
            if (taskForm.value.recurringType === 'weekly') {
              interval = 7 * 24 * 3600;
            } else if (taskForm.value.recurringType === 'monthly') {
              interval = 30 * 24 * 3600;
            }
            // else if (taskForm.value.recurringType === 'custom') {
            //   interval = taskForm.value.customEndTime - taskForm.value.customStartTime;
            // }

            const now = new Date();
            resetTime = new Date(now.getTime() + interval * 1000);
            // 设置时、分、秒、毫秒为 0
            resetTime.setHours(0, 0, 0, 0);
          }

          // 添加新任务
          const newTask = {
            ...taskForm.value,
            type: taskForm.value.type, // 确保类型正确设置
            status: 'ongoing', // 确保状态正确设置
            completed: 0,
            createdAt: new Date(),
            resetTime: resetTime
          };

          taskList.push(newTask);

          // 保存更新后的任务列表
          uni.setStorageSync('taskList', JSON.stringify(taskList));

          uni.showToast({
            title: '任务创建成功',
            icon: 'success'
          });

          // 返回上一页并刷新
          setTimeout(() => {
            uni.navigateBack({
              delta: 1,
              success: () => {
                // 触发首页刷新
                uni.$emit('refreshTaskList');
              }
            });
          }, 1500);
        } catch (e) {
          console.error('保存任务失败', e);
          uni.showToast({
            title: '创建失败，请重试',
            icon: 'none'
          });
        }
      };

      return {
        taskForm,
        availableTags,
        tagCategories,
        selectedCategory,
        weekdays,
        isFormValid,
        toggleTag,
        toggleWeekday,
        toggleMonthDay,
        onStartTimeChange,
        onEndTimeChange,
        getTagColorClass,
        goBack,
        submitTask,
        babies,
        currentBabyIndex,
        currentBabyName,
        onBabyChange
      };
    }
  };
</script>

<style scoped>
  .page-container {
    min-height: 100vh;
    background-color: #f8f8f8;
    padding-bottom: 40rpx;
  }

  /* 导航栏样式 */
  .nav-bar {
    display: flex;
    align-items: center;
    height: 88rpx;
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    padding: 75rpx 40rpx 60rpx 40rpx;
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


  /* 表单容器 */
  .form-container {
    padding: 30rpx;
    background-color: #fff;
    margin-top: 20rpx;
    border-radius: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
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

  .form-input {
    width: 100%;
    height: 80rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #333;
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

  .placeholder {
    color: #999;
  }

  /* 标签样式 */
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
    background-color: #8477fa;
    transition: all 0.3s;
  }

  .tag-item.selected {
    transform: scale(1.05);
    box-shadow: 0 4rpx 12rpx rgba(132, 119, 250, 0.3);
    color: black;
  }

  /* 标签颜色 */
  .tag-education {
    background-color: #4CAF50;
  }

  .tag-cognitive {
    background-color: #2196F3;
  }

  .tag-health {
    background-color: #F44336;
  }

  .tag-fitness {
    background-color: #FF9800;
  }

  .tag-nutrition {
    background-color: #9C27B0;
  }

  .tag-sleep {
    background-color: #607D8B;
  }

  .tag-language {
    background-color: #E91E63;
  }

  .tag-growth {
    background-color: #00BCD4;
  }

  .tag-default {
    background-color: #8477fa;
  }

  /* 新增分类颜色 */
  .tag-lifestyle {
    background-color: #6366F1; /* 紫色系 - 生活习惯 */
  }

  .tag-learning {
    background-color: #3B82F6; /* 蓝色系 - 学习思维 */
  }

  .tag-mental {
    background-color: #EC4899; /* 粉色系 - 心理品德 */
  }

  .tag-social {
    background-color: #10B981; /* 绿色系 - 社会适应 */
  }

  .tag-activity {
    background-color: #F59E0B; /* 橙色系 - 社交与运动 */
  }

  .tag-finance {
    background-color: #059669; /* 深绿色系 - 财商培养 */
  }

  /* 任务类型选择器 */
  .type-selector {
    display: flex;
    gap: 20rpx;
  }

  .type-item {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #666;
    transition: all 0.3s;
  }

  .type-item.selected {
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    color: #fff;
  }

  /* 重复周期选择器 */
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

  /* 星期选择器 */
  .weekday-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
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

  /* 日期选择器 */
  .monthday-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .monthday-item {
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

  .monthday-item.selected {
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    color: #fff;
  }

  /* 自定义时间选择器 */
  .custom-time {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
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

  /* 提交按钮 */
  .submit-btn-container {
    padding: 40rpx 30rpx;
  }

  .submit-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    color: white;
    font-size: 32rpx;
    border-radius: 44rpx;
    border: none;
    box-shadow: 0 6rpx 16rpx rgba(132, 119, 250, 0.3);
  }

  /* .submit-btn:active {
    transform: translateY(2rpx);
    box-shadow: 0 2rpx 8rpx rgba(132, 119, 250, 0.2);
    color: white;
  } */

  .submit-btn[disabled] {
    /* transform: translateY(2rpx); */
    background: linear-gradient(135deg, #9f8eff, #8477fa);
    box-shadow: none;
    color: #666;
  }

  /* 添加宝宝选择器样式 */
  .baby-selector {
    width: 100%;
  }

  .baby-picker {
    width: 100%;
    height: 80rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 20rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .baby-name {
    font-size: 28rpx;
    color: #333;
    flex: 1;
  }

  .baby-arrow {
    font-size: 24rpx;
    color: #999;
    margin-left: 10rpx;
  }

  /* 标签分类选择器 */
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

  /* 优化标签选择体验 - 当财商培养分类被选中时的特殊样式 */
  .tag-categories .tag-category:nth-child(6).active {
    background: linear-gradient(135deg, #047857, #10B981);
  }

  /* 财商培养标签样式调整，确保文字清晰显示 */
  .tag-finance.tag-item {
    font-size: 24rpx;
    padding: 10rpx 20rpx;
  }
</style>