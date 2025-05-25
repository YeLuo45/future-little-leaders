<!-- 首页模板 -->
<template>
  <view class="page-container" :class="{ 'dark-mode': isDarkMode }">
    <!-- 顶部标题区域 -->
    <view class="page-header">
      <view class="header-content">
        <view class="title-section">
          <text class="title">亲子任务</text>
          <text class="subtitle">今日成长任务完成情况</text>
        </view>
        <view class="points">{{ totalScore }}积分</view>
      </view>

      <!-- 宝宝选择器 -->
      <view class="baby-selector">
        <picker :range="babies" range-key="name" @change="onBabyChange" :value="currentBabyIndex">
          <view class="baby-select-view">
            <!-- <image class="baby-icon" :src="currentBabyAvatar || getDefaultAvatar(currentBabyId)" mode="aspectFill"></image> -->
            <image v-if="currentBabyAvatar" class="baby-icon" :src="currentBabyAvatar" mode="aspectFill"></image>
            <text v-else class="baby-icon-placeholder">{{ getDefaultAvatar(currentBabyId) }}</text>
            <text class="baby-name">{{ currentBabyName || '选择宝宝' }}</text>
            <text class="selector-arrow">▼</text>
          </view>
        </picker>
        <!-- <text class="refresh-btn" @tap="manualRefreshTasks">🔄</text> -->
      </view>
    </view>

    <!-- 语录轮播 -->
    <swiper class="quote-swiper" autoplay circular :interval="5000" :duration="500">
      <swiper-item v-for="(quote, index) in quotes" :key="index">
        <view class="quote-item">
          <text class="quote-text">{{ quote.text }}</text>
          <text class="quote-author">—— {{ quote.author }}</text>
        </view>
      </swiper-item>
    </swiper>

    <!-- 搜索框 -->
    <view class="search-box" :class="{ 'dark-mode': isDarkMode }">
      <text class="search-icon">🔍</text>
      <input type="text" v-model="searchKeyword" placeholder="搜索任务" class="search-input" confirm-type="search"
        @confirm="searchTasks" />
      <text class="search-clear" v-if="searchKeyword" @tap="clearSearch">✕</text>
    </view>

    <!-- 内容区域 -->
    <scroll-view scroll-y class="content-list" :scroll-top="scrollTop" @scroll="handleScroll" :enable-back-to-top="true"
      :show-scrollbar="true" :enhanced="true" :bounces="true" :scroll-with-animation="true" :scroll-anchoring="true">
      <!-- 布局切换按钮 -->
      <view class="layout-switcher-fixed">
        <button v-for="n in [1, 2]" :key="n" :class="['layout-btn', layoutType === n ? 'active' : '']"
          @tap="setLayoutType(n)">{{ n }}列</button>
      </view>
      <!-- 进行中的任务 -->
      <view class="task-section">
        <view class="section-header" @tap="toggleOngoingCollapse">
          <text class="section-title">进行中的任务 ({{ ongoingTasks.length }})</text>
          <text class="collapse-icon" :class="{ 'up': !isOngoingCollapsed }">▲</text>
        </view>
        <view v-if="!isOngoingCollapsed">
          <view class="task-list" :class="[`layout-${layoutType}`]">
            <view class="task-item" v-for="(task, index) in ongoingTasks" :key="task.id">
              <view class="task-header">
                <view class="task-left">
                  <view class="task-icon">📝</view>
                  <!-- <view class="task-points">
                  <text class="points-icon">🔥</text>
                  <text class="points-value">{{ task.points }}积分</text>
                </view> -->
                </view>
                <text class="task-title">{{ task.title }}</text>
                <view class="task-points">
                  <text class="points-icon">🔥</text>
                  <text class="points-value">{{ task.points }}积分</text>
                </view>
              </view>
              <view class="task-tags">
                <view v-for="(tag, tagIndex) in (task.tags || [])" :key="tagIndex" class="task-tag">
                  {{ tag }}
                </view>
              </view>
              <view class="task-description">{{ task.description || '暂无描述' }}</view>
              <view class="task-action">

                <button class="complete-btn" @tap="completeTask(task)">完成打卡</button>
              </view>
            </view>
            <!-- 无任务提示 -->
            <view class="empty-state" v-if="!ongoingTasks || ongoingTasks.length === 0">
              <text class="empty-text">暂无进行中的任务</text>
            </view>
          </view>
        </view>
      </view>
      <!-- 周期性任务 -->
      <view class="task-section">
        <view class="section-header" @tap="toggleRecurringCollapse">
          <text class="section-title">周期性任务 ({{ recurringTasks.length }})</text>
          <text class="collapse-icon" :class="{ 'up': !isRecurringCollapsed }">▲</text>
        </view>
        <view v-show="!isRecurringCollapsed">
          <view class="task-list" :class="[`layout-${layoutType}`]">
            <template v-if="recurringTasks && recurringTasks.length > 0">
              <view class="task-card" v-for="(task, index) in recurringTasks" :key="'recurring-' + task.id">
                <view class="task-header">
                  <view class="task-left">
                    <view class="task-icon">📅</view>
                  </view>
                  <text class="task-title">{{ task.title }}</text>
                  <view class="task-points">
                    <text class="points-icon">🔥</text>
                    <text class="points-value">{{ task.points }}积分</text>
                  </view>
                </view>
                <view class="task-tags">
                  <view v-for="(tag, tagIndex) in (task.tags || [])" :key="tagIndex" class="task-tag">
                    {{ tag }}
                  </view>
                </view>
                <view class="task-description">{{ task.description || '暂无描述' }}</view>
                <view class="task-action">
                  <button class="complete-btn" @tap="completeTask(task)">完成打卡</button>
                </view>
              </view>
            </template>
            <!-- 无任务提示 -->
            <view class="empty-state" v-else>
              <text class="empty-text">暂无周期性任务</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 悬浮添加按钮 -->
    <view class="float-btn" :class="{ 'dark-mode': isDarkMode }" @tap="showAddTaskModal">
      <!-- <text>+</text> -->
      <text>＋</text>
    </view>

    <!-- 删除确认模态框 -->
    <view class="modal-mask" v-if="showDeleteModal" @tap="cancelDelete"></view>
    <view class="delete-modal" v-if="showDeleteModal">
      <view class="delete-modal-title">确认删除</view>
      <view class="delete-modal-content">
        确定要删除任务"{{ taskToDelete?.title }}"吗？
      </view>
      <view class="delete-modal-buttons">
        <button class="delete-modal-btn delete-cancel" @tap="cancelDelete">取消</button>
        <button class="delete-modal-btn delete-confirm" @tap="confirmDelete">确认</button>
      </view>
    </view>
  </view>
</template>

<script>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useThemeStore } from '@/stores/theme';
  import { usePointsStore } from '@/stores/pointsStore';
  import { verifyAuth } from '@/utils/authUtils';
  import { getShareConfig } from '@/utils/shareUtils';
  import { useShare } from '@/utils/useShare';

  export default {
    setup() {
      const themeStore = useThemeStore();
      const pointsStore = usePointsStore();
      const isDarkMode = computed(() => themeStore.isDarkMode);

      // 搜索相关
      const searchKeyword = ref('');

      // 特色功能
      const features = ref([
        {
          icon: '📚',
          title: '育儿知识',
          path: '/pages/knowledge/index'
        },
        {
          icon: '🍼',
          title: '喂养指南',
          path: '/pages/feeding/index'
        },
        {
          icon: '💤',
          title: '睡眠建议',
          path: '/pages/sleep/index'
        },
        {
          icon: '🧠',
          title: '智力开发',
          path: '/pages/development/index'
        }
      ]);

      // 育儿语录数据
      const quotes = ref([
        { text: "市场先生每天都来敲门，他时而兴奋，时而沮丧，如果你能冷静思考，他是你最好的朋友。", author: "沃伦·巴菲特" },
        { text: "在别人恐惧时贪婪，在别人贪婪时恐惧。", author: "沃伦·巴菲特" },
        { text: "股市是一个把钱从急躁的人手里转移到耐心的人手里的装置。", author: "沃伦·巴菲特" },
        { text: "价格是你付出的，价值是你得到的。", author: "本杰明·格雷厄姆" },
        { text: "安全边际是投资者的最佳伙伴。", author: "本杰明·格雷厄姆" }
      ]);

      // 任务数据
      const taskList = ref([]);
      // 已完成任务的快照列表
      const completedTasks = ref([]);

      // 折叠状态
      const isOngoingCollapsed = ref(false);
      const isRecurringCollapsed = ref(false);

      // 总积分
      const totalScore = ref(0);

      // 删除确认模态框
      const showDeleteModal = ref(false);
      const taskToDelete = ref(null);
      const deleteIndex = ref(-1);

      // 添加滚动相关状态
      const scrollTop = ref(0);
      const isScrollReady = ref(false);

      // 定时器ID
      let intervalId;

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
      const getDefaultAvatar = (babyId) => {
        // 基于宝宝ID返回一个默认表情头像
        // 使用宝宝ID的最后一个字符作为随机种子
        const lastChar = babyId ? babyId.charAt(babyId.length - 1) : '0';
        const lastDigit = parseInt(lastChar, 16) % 5; // 获取0-4的值

        // 定义几个可爱的表情作为默认头像
        const defaultAvatars = ['👶', '👼', '🧒', '👦', '👧'];
        return defaultAvatars[lastDigit];
      };

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
          console.log('当前宝宝头像:', avatar, '宝宝ID:', currentBabyId.value);
          return avatar;
        }

        // 无头像或头像无效
        console.log('宝宝无有效头像，使用默认表情');
        return null;
      });

      // 修复无效的Blob URL
      const fixInvalidBlobAvatars = () => {
        let needUpdate = false;

        // 检查每个宝宝的头像
        babies.value.forEach(baby => {
          if (baby.avatar && baby.avatar.startsWith('blob:')) {
            console.log(`修复宝宝[${baby.name}]的Blob头像`);
            // 将无效的Blob URL删除，改用默认头像
            baby.avatar = '';
            needUpdate = true;
          }
        });

        // 如果有修改，保存回存储
        if (needUpdate) {
          try {
            uni.setStorageSync('babies', JSON.stringify(babies.value));
            console.log('已修复并保存宝宝头像数据');
          } catch (e) {
            console.error('保存修复后的宝宝数据失败:', e);
          }
        }
      };

      // 加载宝宝信息
      const loadBabies = () => {
        try {
          // 加载宝宝列表
          const storedBabies = uni.getStorageSync('babies') || '[]';
          babies.value = typeof storedBabies === 'string' ? JSON.parse(storedBabies) : storedBabies;

          // 修复无效的Blob URL头像
          fixInvalidBlobAvatars();

          // 加载当前选中宝宝
          const storedCurrentBabyId = uni.getStorageSync('currentBabyId');
          currentBabyId.value = storedCurrentBabyId || (babies.value[0]?.id || '');

          // 打印更详细的宝宝信息
          // console.log('加载宝宝信息:', babies.value.length, '个宝宝',
          //   '当前选中:', currentBabyId.value);

          // 检查是否有宝宝没有头像
          const babiesWithoutAvatar = babies.value.filter(b => !b.avatar);
          if (babiesWithoutAvatar.length > 0) {
            console.log('警告: 有', babiesWithoutAvatar.length, '个宝宝没有头像');
          }

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
            console.log(`[首页] 切换宝宝: 从[${oldBabyId}]到[${newBabyId}]`);

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
                source: 'index',  // 标记事件来源
                timestamp: Date.now() // 添加时间戳避免重复
              });

              // 强制发送通知给其他页面
              uni.showToast({
                title: `已切换到"${babies.value[idx].name}"`,
                icon: 'none',
                duration: 1500
              });
            }, 50);

            // 强制重新加载本页面数据
            loadTasksAndPointsFromStorage();
            updateShowPoints();
            refreshTasks(); // 刷新任务状态

            // 强制刷新UI
            setTimeout(() => {
              const temp = [...taskList.value];
              taskList.value = [];
              taskList.value = temp;
            }, 100);
          }
        }
      };

      // 刷新周期性任务
      const refreshTasks = () => {

        let updateFlag = false;

        const now = new Date();
        console.log('刷新周期性任务, time:', now);
        taskList.value.forEach(task => {
          // 周期性任务 
          const isRecurring = task.type === 'recurring';
          if (!isRecurring) {
            return;
          }

          // 进行中任务
          const isOngoing = task.status === 'ongoing';
          if (isOngoing) {
            return;
          }

          // 将ISO字符串转换为Date对象再获取时间戳
          let resettimestammp = new Date(task.resetTime).getTime();
          console.log('检查任务:', task.title, resettimestammp, now.getTime());
          // 周期性任务且已完成任务、resetTime小于当前时间
          if (resettimestammp < now.getTime()) {
            // 这里可以执行重置任务的逻辑
            let nextResetTime = 0;
            // 周期性任务，默认24小时
            let interval = 24 * 3600;
            if (task.recurringType === 'weekly') {
              // 获取当前星期几
              let weekday = now.getDay();
              if (weekday === 0) {
                weekday = 7
              }
              for (let i = 1; i <= 7; i++) {
                let nextWeekday = (weekday + i) % 7;
                if (task.weekdays.includes(nextWeekday)) {
                  interval = i * 24 * 3600;
                  break;
                }
              }
              console.log(`重置任务: ${task.title}, 周设置: ${task.weekdays}, 间隔: ${interval}秒`);

            }

            nextResetTime = new Date(now.getTime() + interval * 1000);
            // 设置时、分、秒、毫秒为 0
            nextResetTime.setHours(0, 0, 0, 0);

            // 更新下一次重置时间和状态、进度
            task.resetTime = nextResetTime;
            task.status = 'ongoing';
            task.completed = '0';
            task.completedAt = null;

            updateFlag = true;
          }
        });

        // 如果更新了任务列表，则保存到本地存储 
        if (updateFlag) {
          uni.setStorageSync('taskList', JSON.stringify(taskList.value));
        }

      };

      // 计算进行中的任务
      const ongoingTasks = computed(() => {
        // 添加依赖currentBabyId，确保它变化时重新计算
        const babyId = currentBabyId.value;
        console.log('计算ongoingTasks，当前宝宝:', babyId);

        return taskList.value
          .filter(task => {

            // 如果task.babyId是undefined，则认为过滤
            if (task.babyId === undefined) {
              return false;
            }
            // 如果当前没有宝宝，则过滤
            if (!babyId) {
              return false;
            }

            // 普通任务
            const isNormal = task.type === 'normal';
            // 进行中任务
            const isOngoing = task.status === 'ongoing';
            // 搜索关键字 
            const matchesSearch = !searchKeyword.value || task.title.includes(searchKeyword.value);
            // 当前宝宝的任务 (如果任务有babyId且与当前选中的不同，则过滤掉)
            const isBabyTask = task.babyId === babyId;
            // 返回符合条件的任务
            return isNormal && isOngoing && matchesSearch && isBabyTask;
          })
          // 按创建时间排序
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });

      // 计算周期性任务
      const recurringTasks = computed(() => {
        // 添加依赖currentBabyId，确保它变化时重新计算
        const babyId = currentBabyId.value;
        console.log('计算recurringTasks，当前宝宝:', babyId);

        const tasks = taskList.value
          .filter(task => {
            // 如果task.babyId是undefined，则认为过滤
            if (task.babyId === undefined) {
              return false;
            }
            // 如果不是当前宝宝的任务，则过滤
            if (task.babyId !== babyId) {
              return false;
            }
            // 不是周期性任务，则过滤
            if (task.type !== 'recurring') {
              return false;
            }
            // 不是进行中任务，则过滤
            if (task.status !== 'ongoing') {
              return false;
            }

            // 搜索关键字
            const matchesSearch = !searchKeyword.value || task.title.includes(searchKeyword.value);
            if (!matchesSearch) {
              return false;
            }

            let curdayTask = false;
            if (task.recurringType === 'weekly') {
              const now = new Date();
              let weekday = now.getDay();
              if (weekday === 0) {
                weekday = 7;
              }
              // 检查是否在weekdays中
              curdayTask = task.weekdays.includes(weekday);
            } else {
              curdayTask = true;
            }

            console.log('curdayTask:', task.title, task.weekdays, curdayTask);

            // 返回符合条件的任务
            return curdayTask;
          })
          // 按创建时间排序
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return tasks;
      });

      // 清除搜索内容
      const clearSearch = () => {

        searchKeyword.value = '';
      };

      // 搜索任务
      const searchTasks = () => {
        // 搜索逻辑已在计算属性中处理
        uni.showToast({
          title: '搜索: ' + searchKeyword.value,
          icon: 'none',
          duration: 1000
        });
      };

      // 切换进行中任务的折叠状态
      const toggleOngoingCollapse = () => {
        isOngoingCollapsed.value = !isOngoingCollapsed.value;
        console.log('进行中任务折叠状态:', isOngoingCollapsed.value);
      };

      // 切换周期性任务的折叠状态
      const toggleRecurringCollapse = () => {
        isRecurringCollapsed.value = !isRecurringCollapsed.value;
        console.log('周期性任务折叠状态:', isRecurringCollapsed.value);
      };

      // 格式化日期
      const formatDate = (date) => {
        if (!date) return '';
        if (typeof date === 'string') {
          date = new Date(date);
        }
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      };

      // 计算进度百分比
      const calculateProgress = (completed, total) => {
        if (!total || total <= 0) return 0;
        const percentage = (completed / total) * 100;
        return Math.min(percentage, 100);
      };

      // 更新积分显示
      const updateShowPoints = () => {
        if (currentBabyId.value) {
          totalScore.value = pointsStore.getBabyPoints(currentBabyId.value);
        } else {
          totalScore.value = 0;
        }
      };

      // 完成任务
      const completeTask = (task) => {
        // 检查是否开启认证模式
        verifyAuth(
          // 验证成功或不需要验证的回调
          () => {
            // 认证成功后继续完成任务
            completeTaskAfterAuth(task);
          },
          // 验证失败的回调
          (error) => {
            console.error('认证失败:', error);
            // 验证失败不做任何操作
          }
        );
      };

      // 认证后完成任务
      const completeTaskAfterAuth = (task) => {
        // 更新任务状态
        const index = taskList.value.findIndex(t => t.id === task.id);
        if (index !== -1) {
          taskList.value[index].status = 'completed';
          taskList.value[index].completed = task.total;
          taskList.value[index].completedAt = new Date().toISOString();

          // 确保任务关联到当前宝宝
          if (!taskList.value[index].babyId && currentBabyId.value) {
            taskList.value[index].babyId = currentBabyId.value;
          }

          // 添加到已完成任务列表 
          completedTasks.value.push(task);
          // 进行截断，最多存储100条
          while (completedTasks.value.length > 100) {
            completedTasks.value.shift();
          }

          // 更新积分
          const taskPoints = task.points || 10;
          // 使用宝宝ID增加积分
          if (currentBabyId.value) {
            // 添加更详细的描述信息
            const description = `完成任务：${task.title}`;
            pointsStore.addBabyPoints(currentBabyId.value, taskPoints, description);
          } else {
            console.warn('未找到当前宝宝ID，无法添加积分');
          }

          // 更新积分显示
          updateShowPoints();

          // 更新本地存储
          try {
            uni.setStorageSync('taskList', JSON.stringify(taskList.value));
            uni.setStorageSync('completedTaskList', JSON.stringify(completedTasks.value));

            uni.showToast({
              title: '打卡成功！',
              icon: 'success'
            });
          } catch (e) {
            console.error('保存任务状态失败', e);
            uni.showToast({
              title: '保存失败，请重试',
              icon: 'none'
            });
          }
        }
      };

      // 确认删除任务
      const confirmDelete = (task, index) => {
        taskToDelete.value = task;
        deleteIndex.value = index;
        showDeleteModal.value = true;
      };

      // 取消删除
      const cancelDelete = () => {
        showDeleteModal.value = false;
        taskToDelete.value = null;
        deleteIndex.value = -1;
      };

      // 显示添加任务模态框
      const showAddTaskModal = () => {
        // 跳转前确保有宝宝，否则提示先添加宝宝
        if (!currentBabyId.value && babies.value.length === 0) {
          uni.showModal({
            title: '提示',
            content: '请先在"我的"页面添加宝宝',
            showCancel: false
          });
          return;
        }

        // 正常跳转添加任务页面
        uni.navigateTo({
          url: '../task/add-task'
        });
      };

      // 导航到功能页面
      const navigateToFeature = (feature) => {
        if (feature.path) {
          uni.navigateTo({
            url: feature.path
          });
        } else {
          uni.showToast({
            title: '功能开发中...',
            icon: 'none'
          });
        }
      };

      // 从本地存储加载任务列表
      const loadTasksAndPointsFromStorage = () => {
        try {
          const storedTasks = uni.getStorageSync('taskList');
          if (storedTasks) {
            const parsedTasks = JSON.parse(storedTasks);
            // console.log('从本地加载的任务列表:', parsedTasks);
            // 过滤非当前宝宝的任务
            // 注意：这里不过滤taskList本身，只在computed中过滤显示
            taskList.value = parsedTasks;

            // 移除已完成的普通任务
            let updateFlag = false;
            for (let i = 0; i < taskList.value.length; i++) {
              if (taskList.value[i].type === 'normal' && taskList.value[i].status === 'completed') {
                updateFlag = true;
                taskList.value.splice(i, 1);
                console.log("remove normal completed task:", taskList.value)
              }
            }

            // 转换日期字符串为Date对象
            taskList.value.forEach(task => {
              if (typeof task.createdAt === 'string') {
                task.createdAt = new Date(task.createdAt);
              }
              // 确保任务类型和状态正确
              if (!task.type) task.type = 'normal';
              if (!task.status) task.status = 'ongoing';

              // 当检测是周任务，将weekdays按照升序排序
              if (task.recurringType === 'weekly') {
                task.weekdays = task.weekdays.sort((a, b) => a - b);
                console.log('周任务，将weekdays按照升序排序:', task.title, task.weekdays);
              }
            });

            if (updateFlag) {
              uni.setStorageSync('taskList', JSON.stringify(taskList.value));
            }

            // 添加调试日志，检查当前宝宝的任务数量
            const babyTasks = parsedTasks.filter(t => !t.babyId || t.babyId === currentBabyId.value);
            console.log(`当前宝宝(${currentBabyId.value})的任务:`, babyTasks.length);
          }

          // 加载已完成任务列表
          const storedCompletedTasks = uni.getStorageSync('completedTaskList');
          if (storedCompletedTasks) {
            const parsedCompletedTasks = JSON.parse(storedCompletedTasks);
            // console.log('加载的已完成任务列表:', parsedCompletedTasks);
            completedTasks.value = parsedCompletedTasks;
          }

          // 更新积分显示
          updateShowPoints();
        } catch (e) {
          console.error('读取任务列表失败', e);
        }
      };

      // 处理滚动事件
      const handleScroll = (e) => {
        if (isScrollReady.value) {
          // console.log('Scroll position:', e.detail.scrollTop);
        }
      };

      // 重置滚动位置
      const resetScroll = () => {
        if (isScrollReady.value) {
          scrollTop.value = 0;
        }
      };

      // 手动刷新任务
      const manualRefreshTasks = () => {
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

        // 重新加载任务
        loadTasksAndPointsFromStorage();

        // 刷新周期性任务
        refreshTasks();

        // 显示提示
        uni.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1000
        });

        console.log('手动刷新任务完成');
      };

      // 添加宝宝当前状态检查函数
      const checkBabyStatus = () => {
        // 从存储中读取当前宝宝ID
        const storedBabyId = uni.getStorageSync('currentBabyId');

        // 如果本地状态与存储不一致，更新本地状态
        if (currentBabyId.value !== storedBabyId && storedBabyId) {
          console.log(`[首页] 检测到宝宝状态不一致，从存储同步: ${storedBabyId}`);
          currentBabyId.value = storedBabyId;
          loadBabies();
          loadTasksAndPointsFromStorage();
          updateShowPoints();
        }
      };

      // 分享给朋友
      const onShareAppMessage = (res) => {
        return getShareConfig({
          page: 'index',
          data: {
            currentBabyId: currentBabyId.value,
            babies: babies.value,
            totalScore: totalScore.value,
            ongoingTasks: ongoingTasks.value
          }
        });
      };

      // 分享到朋友圈
      const onShareTimeline = () => {
        const config = getShareConfig({
          page: 'index',
          data: {
            currentBabyId: currentBabyId.value,
            babies: babies.value,
            totalScore: totalScore.value,
            ongoingTasks: ongoingTasks.value
          }
        });
        return {
          title: config.title,
          query: config.query,
          imageUrl: config.imageUrl
        };
      };


      // // 注册分享功能
      // useShare('index', () => ({
      //   currentBabyId: currentBabyId.value,
      //   babies: babies.value,
      //   totalScore: totalScore.value,
      //   ongoingTasks: ongoingTasks.value
      // }));

      const layoutType = ref(2); // 默认2列
      const setLayoutType = (n) => { layoutType.value = n; };

      onMounted(() => {
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

        // 加载任务列表
        loadTasksAndPointsFromStorage();
        // 立即检查任务
        refreshTasks();
        // 0点检查一次任务
        const now = new Date();
        const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const timeToNextDay = nextDay.getTime() - now.getTime();
        console.log('0点检查任务, time:', now, timeToNextDay);
        // 设置定时器
        intervalId = setInterval(refreshTasks, 3600 * 1000);

        // 添加任务列表刷新事件监听
        uni.$on('refreshTaskList', () => {
          loadTasksAndPointsFromStorage();
        });

        // 添加积分更新事件监听
        uni.$on('pointsUpdated', updateShowPoints);

        // 添加宝宝积分更新事件监听
        uni.$on('babyPointsUpdated', (data) => {
          if (data && data.babyId === currentBabyId.value) {
            totalScore.value = data.points;
          }
        });

        // 监听宝宝变更事件，使用加强版事件处理
        uni.$on('babyChanged', (data) => {
          // 检查是否为对象(新格式)或字符串(旧格式)
          const babyId = typeof data === 'object' ? data.babyId : data;
          const source = typeof data === 'object' ? (data.source || 'unknown') : 'unknown';

          // 避免自己触发的事件导致循环
          if (source === 'index') {
            console.log('[首页] 忽略自己触发的宝宝变更事件');
            return;
          }

          // 只有当ID变化时才更新
          if (currentBabyId.value !== babyId) {
            console.log(`[首页] 接收到来自[${source}]的宝宝变更事件: ${babyId}`);
            currentBabyId.value = babyId;

            // 强制刷新处理
            loadBabies();
            loadTasksAndPointsFromStorage();
            updateShowPoints();

            // 延迟刷新UI
            setTimeout(() => {
              console.log('[首页] 完成宝宝变更响应');
            }, 200);
          }
        });

        // 添加宝宝列表刷新事件监听
        uni.$on('refreshBabyList', () => {
          console.log('接收到宝宝列表刷新事件');
          // 重新加载宝宝列表
          loadBabies();
          // 刷新任务列表
          loadTasksAndPointsFromStorage();
        });

        // 默认展开所有列表
        isOngoingCollapsed.value = false;
        isRecurringCollapsed.value = false;

        // 确保在组件挂载后再设置滚动位置
        setTimeout(() => {
          isScrollReady.value = true;
          resetScroll();
        }, 300);

        // 页面加载时主动检查宝宝状态
        checkBabyStatus();
      });

      onUnmounted(() => {
        // 移除事件监听
        uni.$off('refreshTaskList');
        uni.$off('pointsUpdated');
        uni.$off('babyPointsUpdated');
        uni.$off('babyChanged');
        uni.$off('refreshBabyList');
        isScrollReady.value = false;
        // 停止定时器
        clearInterval(intervalId);
      });

      return {
        isDarkMode,
        searchKeyword,
        features,
        taskList,
        ongoingTasks,
        recurringTasks,
        isOngoingCollapsed,
        isRecurringCollapsed,
        totalScore,
        showDeleteModal,
        taskToDelete,
        deleteIndex,
        babies,
        currentBabyId,
        currentBabyName,
        currentBabyAvatar,
        currentBabyIndex,
        onBabyChange,
        manualRefreshTasks,
        clearSearch,
        searchTasks,
        toggleOngoingCollapse,
        toggleRecurringCollapse,
        formatDate,
        calculateProgress,
        completeTask,
        confirmDelete,
        cancelDelete,
        showAddTaskModal,
        navigateToFeature,
        scrollTop,
        handleScroll,
        resetScroll,
        getDefaultAvatar,
        checkBabyStatus,
        loadTasksAndPointsFromStorage,
        onShareAppMessage,
        onShareTimeline,
        layoutType,
        setLayoutType
      };
    },
    // uni-app生命周期方法作为组件选项
    onShow() {
      // 每次页面显示时检查宝宝状态
      this.checkBabyStatus();

      // 重新加载任务列表
      this.loadTasksAndPointsFromStorage();
    }
  };
</script>

<style scoped>

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

  /* 搜索框 */
  .search-box {
    margin: 30rpx;
    height: 80rpx;
    background-color: white;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
  }


  .search-icon {
    margin-right: 20rpx;
    font-size: 32rpx;
    color: #999;
  }

  .search-input {
    flex: 1;
    font-size: 28rpx;
    color: #333;
  }

  .search-clear {
    color: #999;
    font-size: 32rpx;
    padding: 10rpx;
  }

  /* 内容列表 */
  .content-list {
    height: calc(100vh - 50rpx);
    padding: 0rpx 30rpx;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    z-index: 1;
    /* 确保scroll-view在悬浮按钮下方 */
  }

  /* 功能区块 */
  .feature-section {
    margin: 30rpx 0;
  }

  .feature-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    width: 100%;
  }

  .feature-item {
    background-color: white;
    border-radius: 20rpx;
    padding: 30rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  }

  .feature-icon {
    font-size: 48rpx;
    margin-bottom: 16rpx;
  }

  .feature-title {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
  }

  .collapse-icon.up {
    transform: rotate(180deg);
  }

  /* 任务卡片 */
  .task-card {
    background-color: white;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    padding: 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  }

  .task-content {
    display: flex;
    margin-bottom: 20rpx;
  }

  .task-left {
    margin-right: 20rpx;
  }

  .task-icon {
    width: 80rpx;
    height: 80rpx;
    background-color: #f5f5f5;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
  }

  .task-info {
    flex: 1;
  }

  .task-item {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    border-radius: 16rpx;
    background-color: #fff;
    padding: 28rpx 24rpx 24rpx 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(124, 58, 237, 0.06);
    position: relative;
    min-height: 120rpx;
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8rpx;
  }

  .task-title {
    font-size: 32rpx;
    color: #333;
    font-weight: bold;
    /* text-align: center; */
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .task-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 16rpx;
  }

  .task-tag {
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    background-color: #f5f5f5;
    color: #666;
  }



  .task-description {
    font-size: 26rpx;
    color: #666;
    margin: 8rpx 0 16rpx 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    /* 限制最多 2 行（根据需求调整） */
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    line-height: 30rpx;
    height: 60rpx;
    /* 2 行高度：30rpx × 2 = 60rpx，与 line-height 匹配 */
    word-break: break-all;
    /* 强制换行（解决连续字符/数字不换行问题） */
  }

  .task-points {
    font-size: 26rpx;
    color: #ff6b6b;
    font-weight: 500;
    padding-right: 20rpx;
  }

  .complete-btn {
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    color: white;
    font-size: 22rpx;
    padding: 12rpx 30rpx;
    border-radius: 30rpx;
    border: none;
  }


  /* 浮动按钮 */
  .float-btn {
    position: fixed;
    right: 40rpx;
    bottom: 180rpx;
    /* 增加底部距离 */
    width: 100rpx;
    height: 100rpx;
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 60rpx;
    box-shadow: 0 4rpx 16rpx rgba(132, 119, 250, 0.3);
    /* 提高z-index确保在最上层 */
    z-index: 100;
    transition: transform 0.2s ease;
  }

  .float-btn:active {
    transform: scale(0.95);
  }

  .dark-mode .float-btn {
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    box-shadow: 0 4rpx 16rpx rgba(108, 92, 231, 0.3);
  }

  /* 模态框 */
  .modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 999;
  }

  .delete-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600rpx;
    background-color: white;
    border-radius: 20rpx;
    padding: 40rpx;
    z-index: 1001;
  }

  .delete-modal-title {
    font-size: 32rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 30rpx;
  }

  .delete-modal-content {
    font-size: 28rpx;
    color: #666;
    text-align: center;
    margin-bottom: 40rpx;
  }

  .delete-modal-buttons {
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
  }

  .delete-modal-btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    border-radius: 40rpx;
    font-size: 28rpx;
  }

  .delete-cancel {
    background-color: #f5f5f5;
    color: #666;
  }

  .delete-confirm {
    background-color: #ff4d4f;
    color: white;
  }

  /* 标签颜色类 */
  .tag-education {
    background-color: #e3f2fd !important;
    color: #2196f3 !important;
  }

  .tag-cognitive {
    background-color: #ede7f6 !important;
    color: #673ab7 !important;
  }

  .tag-health {
    background-color: #e8f5e9 !important;
    color: #4caf50 !important;
  }

  .tag-fitness {
    background-color: #fff3e0 !important;
    color: #ff9800 !important;
  }

  .tag-nutrition {
    background-color: #ffebee !important;
    color: #f44336 !important;
  }

  .tag-sleep {
    background-color: #e0f7fa !important;
    color: #00bcd4 !important;
  }

  .tag-language {
    background-color: #fff8e1 !important;
    color: #ffc107 !important;
  }

  .tag-growth {
    background-color: #f3e5f5 !important;
    color: #9c27b0 !important;
  }

  .tag-default {
    background-color: #f5f5f5 !important;
    color: #9e9e9e !important;
  }

  /* 空状态 */
  .empty-state {
    padding: 60rpx 0;
    text-align: center;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }

  /* 调试信息 */
  .debug-info {
    padding: 10rpx 20rpx;
    background-color: #fff3e0;
    border-radius: 8rpx;
    margin-bottom: 20rpx;
    font-size: 24rpx;
    color: #ff9800;
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

  /* 语录轮播 */
  .quote-swiper {
    height: 160rpx;
    margin-bottom: 30rpx;
  }

  .quote-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: #eef5ff;
    height: 100%;
    padding: 20rpx;
    border-radius: 10rpx;
    border-left: 8rpx solid #1A73E8;
  }

  .quote-text {
    font-size: 28rpx;
    color: #333;
    line-height: 1.5;
  }

  .quote-author {
    font-size: 24rpx;
    color: #666;
    margin-top: 10rpx;
    text-align: right;
  }



  /* 布局切换按钮 */
  .layout-switcher-fixed {
    position: sticky;
    top: 0;
    right: 0;
    z-index: 10;
    display: flex;
    justify-content: center;
    background: transparent;
    padding: 10rpx 30rpx;
  }

  .layout-btn {
    flex: 1;
    text-align: center;
    margin: 0 30rpx;
    padding: 8rpx 20rpx;
    border-radius: 20rpx;
    background: white;
    color: #8477fa;
    border: 2rpx solid #e5e7eb;
    font-size: 24rpx;
    box-shadow: 0 2rpx 8rpx rgba(132, 119, 250, 0.08);
    transition: all 0.2s;
  }

  .layout-btn.active {
    background: #8477fa;
    color: #fff;
    border-color: #8477fa;
  }

  .task-list {
    display: flex;
    flex-wrap: wrap;
    padding: 10rpx;
    margin-left: 20rpx;
    margin-right: 20rpx;
  }

  .task-list.layout-1 .task-item,
  .task-list.layout-1 .task-card {
    width: 100%;
    margin-right: 0;
  }

  .task-list.layout-2 .task-item,
  .task-list.layout-2 .task-card {
    width: 40%;
    margin-right: 2%;
  }

  .task-list.layout-2 .task-item:nth-child(2n),
  .task-list.layout-2 .task-card:nth-child(2n) {
    margin-right: 0;
  }

  .task-list.layout-3 .task-item,
  .task-list.layout-3 .task-card {
    width: 23.5%;
    margin-right: 2%;
  }

  .task-list.layout-3 .task-item:nth-child(3n),
  .task-list.layout-3 .task-card:nth-child(3n) {
    margin-right: 0;
  }
</style>