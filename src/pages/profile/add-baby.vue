<template>
  <view class="page-container" :class="{'dark-mode': isDarkMode}">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <view class="nav-title">添加宝宝</view>
    </view>

    <!-- 表单内容 -->
    <!-- 头像编辑 -->
    <view class="avatar-selector" @tap="showAvatarActionSheet">
      <image class="avatar-preview" :src="form.avatar || '/static/avatar.svg'" mode="aspectFill"></image>
      <view class="avatar-edit-icon">📷</view>
    </view>

    <view class="form-container">
      <!-- 宝宝昵称 -->
      <view class="form-item">
        <text class="form-label">宝宝昵称</text>
        <input class="form-input" v-model="form.name" placeholder="请输入宝宝昵称" />
      </view>
      
      <!-- 性别选择 -->
      <view class="form-item" @tap="openGenderModal">
        <text class="form-label">性别</text>
        <view class="form-value">{{ form.gender ? (form.gender === 'male' ? '男' : '女') : '请选择' }}</view>
      </view>
      
      <!-- 出生日期编辑 -->
      <view class="form-item" @tap="showDateModal = true">
        <text class="form-label">出生日期</text>
        <view class="form-value">{{ form.birthdate || '请选择' }}</view>
      </view>

      <!-- 保存按钮 -->
      <view class="btn-container">
        <button class="save-btn" @tap="saveBaby" :disabled="!isFormValid">添加宝宝</button>
      </view>
    </view>

    <!-- 头像选择弹窗 -->
    <view class="modal-mask" v-if="showAvatarModal" @tap="closeAvatarModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-title">更换头像</view>
        <view class="modal-option" @tap="chooseAvatar('camera')">拍照</view>
        <view class="modal-option" @tap="chooseAvatar('album')">本地相册</view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @tap="closeAvatarModal">取消</button>
        </view>
      </view>
    </view>
    
    <!-- 性别选择弹窗 -->
    <view class="modal-mask" v-if="showGenderModal" @tap="closeGenderModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-title">选择性别</view>
        <view class="gender-options">
          <view class="gender-option" :class="{'selected': tempGender === 'female'}" @tap="selectGender('female')">
            <radio :checked="tempGender === 'female'" color="#007AFF" />
            <text>女</text>
          </view>
          <view class="gender-option" :class="{'selected': tempGender === 'male'}" @tap="selectGender('male')">
            <radio :checked="tempGender === 'male'" color="#007AFF" />
            <text>男</text>
          </view>
        </view>
        <view class="modal-actions">
          <button class="modal-btn cancel" @tap="closeGenderModal">取消</button>
          <button class="modal-btn confirm" @tap="confirmGender">确定</button>
        </view>
      </view>
    </view>
    
    <!-- 日期选择弹窗 -->
    <view class="modal-mask" v-if="showDateModal" @tap="closeDateModal">
      <view class="modal-content date-picker-modal" @tap.stop>
        <view class="date-picker-title">选择出生日期</view>
        <view class="date-picker-container">
          <picker-view class="date-picker" :indicator-style="indicatorStyle" :value="datePickerValue" @change="onDatePickerChange">
            <picker-view-column>
              <view class="picker-item" v-for="year in yearsList" :key="year">{{ year }}年</view>
            </picker-view-column>
            <picker-view-column>
              <view class="picker-item" v-for="month in 12" :key="month">{{ month }}月</view>
            </picker-view-column>
            <picker-view-column>
              <view class="picker-item" v-for="day in daysInMonth" :key="day">{{ day }}日</view>
            </picker-view-column>
          </picker-view>
        </view>
        <view class="modal-actions date-picker-actions">
          <button class="modal-btn cancel" @tap="closeDateModal">取消</button>
          <button class="modal-btn confirm" @tap="confirmDate">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { isDarkTheme } from '@/utils/themeUtils.js';

export default {
  name: 'AddBaby',
  setup() {
    const isDarkMode = ref(false);
    // 表单数据结构统一
    const form = ref({
      name: '',
      birthdate: '',
      avatar: '',
      gender: '',
      id: '',
      createdAt: ''
    });
    
    // 控制弹窗
    const showAvatarModal = ref(false);
    const showGenderModal = ref(false);
    const showDateModal = ref(false);
    const tempGender = ref('');
    
    // 日期选择器
    const yearsList = ref([]);
    const datePickerValue = ref([0, 0, 0]);
    const indicatorStyle = "height: 34px; line-height: 34px;";
    
    // 计算当前月有多少天
    const daysInMonth = computed(() => {
      const year = yearsList.value[datePickerValue.value[0]] || new Date().getFullYear();
      const month = datePickerValue.value[1] + 1; // 月份从0开始
      return new Date(year, month, 0).getDate();
    });
    
    // 初始化年份列表 - 从1900年到今年
    const initYearsList = () => {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let year = 1900; year <= currentYear; year++) {
        years.push(year);
      }
      yearsList.value = years;
    };
    
    // 初始化日期选择器
    const initDatePicker = () => {
      if (form.value.birthdate) {
        const [year, month, day] = form.value.birthdate.split('-').map(Number);
        const yearIndex = yearsList.value.findIndex(y => y === year);
        datePickerValue.value = [
          yearIndex > -1 ? yearIndex : 0,
          month - 1,
          day - 1
        ];
      } else {
        // 默认设置为当前日期
        const now = new Date();
        const yearIndex = yearsList.value.findIndex(y => y === now.getFullYear());
        datePickerValue.value = [
          yearIndex > -1 ? yearIndex : 0,
          now.getMonth(),
          now.getDate() - 1
        ];
      }
    };
    
    // 处理日期选择器变化
    const onDatePickerChange = (e) => {
      datePickerValue.value = e.detail.value;
    };

    // 表单有效性验证
    const isFormValid = computed(() => {
      return form.value.name.trim() !== '' && 
             form.value.birthdate !== '' && 
             form.value.gender !== '';
    });

    // 头像弹窗
    const showAvatarActionSheet = () => {
      showAvatarModal.value = true;
    };
    
    // 关闭头像弹窗
    const closeAvatarModal = () => {
      showAvatarModal.value = false;
    };
    
    // 选择头像
    const chooseAvatar = (type) => {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: type === 'camera' ? ['camera'] : ['album'],
        success: (res) => {
          form.value.avatar = res.tempFilePaths[0];
          closeAvatarModal();
        }
      });
    };
    
    // 打开性别弹窗
    const openGenderModal = () => {
      tempGender.value = form.value.gender;
      showGenderModal.value = true;
    };
    
    // 关闭性别弹窗
    const closeGenderModal = () => {
      showGenderModal.value = false;
    };
    
    // 选择性别
    const selectGender = (gender) => {
      tempGender.value = gender;
    };
    
    // 确认性别
    const confirmGender = () => {
      form.value.gender = tempGender.value;
      closeGenderModal();
    };

    // 打开日期弹窗
    const openDateModal = () => {
      showDateModal.value = true;
      initDatePicker();
    };
    
    // 关闭日期弹窗
    const closeDateModal = () => {
      showDateModal.value = false;
    };
    
    // 确认日期
    const confirmDate = () => {
      const year = yearsList.value[datePickerValue.value[0]];
      const month = String(datePickerValue.value[1] + 1).padStart(2, '0');
      const day = String(datePickerValue.value[2] + 1).padStart(2, '0');
      form.value.birthdate = `${year}-${month}-${day}`;
      closeDateModal();
    };

    // 保存宝宝信息
    const saveBaby = () => {
      if (!isFormValid.value) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return;
      }

      try {
        // 获取现有的宝宝列表
        let babies = [];
        try {
          const storedBabies = uni.getStorageSync('babies');
          babies = storedBabies ? JSON.parse(storedBabies) : [];
        } catch (e) {
          console.error('读取宝宝列表失败:', e);
          babies = [];
        }

        // 检查宝宝数量上限
        if (babies.length >= 3) {
          uni.showModal({
            title: '提示',
            content: '最多只能添加3个宝宝',
            showCancel: false
          });
          return;
        }

        // 创建新宝宝对象
        const newBaby = {
          id: 'baby_' + Date.now(),
          name: form.value.name.trim(),
          birthdate: form.value.birthdate,
          gender: form.value.gender,
          avatar: form.value.avatar || '/static/avatar.svg',
          createdAt: new Date().toISOString()
        };

        // 添加到列表
        babies.push(newBaby);

        // 保存到存储
        uni.setStorageSync('babies', JSON.stringify(babies));

        // 如果是第一个宝宝，设置为当前宝宝
        if (babies.length === 1) {
          uni.setStorageSync('currentBabyId', newBaby.id);
        }

        // 广播宝宝列表更新事件
        uni.$emit('refreshBabyList');
        
        // 广播宝宝变更事件，确保首页能够感知到变化
        uni.$emit('babyChanged', newBaby.id);
        
        // 广播任务列表刷新事件，确保首页刷新任务
        uni.$emit('refreshTaskList');

        uni.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 2000,
          success: () => {
            setTimeout(() => {
              uni.navigateBack({
                success: () => {
                  // 确保返回上一页后也能刷新
                  setTimeout(() => {
                    uni.$emit('refreshBabyList');
                    uni.$emit('babyChanged', newBaby.id);
                  }, 500);
                }
              });
            }, 1500);
          }
        });
      } catch (e) {
        console.error('保存宝宝信息失败:', e);
        uni.showToast({
          title: '添加失败',
          icon: 'none'
        });
      }
    };

    // 返回上一页
    const goBack = () => {
      uni.navigateBack();
    };

    onMounted(() => {
      isDarkMode.value = isDarkTheme();
      // 初始化日期选择器
      initYearsList();
      initDatePicker();
    });

    return {
      isDarkMode,
      form,
      showAvatarModal,
      showGenderModal,
      tempGender,
      showDateModal,
      datePickerValue,
      yearsList,
      daysInMonth,
      indicatorStyle,
      isFormValid,
      showAvatarActionSheet,
      closeAvatarModal,
      chooseAvatar,
      openGenderModal,
      closeGenderModal,
      selectGender,
      confirmGender,
      openDateModal,
      closeDateModal,
      confirmDate,
      onDatePickerChange,
      saveBaby,
      goBack
    };
  }
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f8f8f8;
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
	padding: 60rpx 40rpx 60rpx 40rpx;
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
  padding: 0 30rpx;
}

.form-item {
  padding-bottom: 36rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.dark-mode .form-label {
  color: #aaa;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
}

.form-value {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
}

.avatar-selector {
  padding-top: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
  position: relative;
}

.avatar-preview {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  border: 6rpx solid #eee;
}

.avatar-edit-icon {
  position: absolute;
  bottom: 0;
  right: 50%;
  transform: translateX(50rpx);
  background: #fff;
  border-radius: 50%;
  padding: 2rpx;
  font-size: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.08);
}

.btn-container {
  margin-top: 60rpx;
}

.save-btn {
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

.save-btn[disabled] {
  background: linear-gradient(135deg, #9f8eff, #8477fa);
  color: #666;
  box-shadow: none;
}

/* 弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  width: 100%;
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  overflow: hidden;
}

.modal-title {
  font-size: 32rpx;
  text-align: center;
  padding: 30rpx 0;
  font-weight: bold;
  border-bottom: 1px solid #eee;
}

.modal-option {
  padding: 30rpx 0;
  font-size: 28rpx;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.modal-footer {
  padding: 20rpx;
}

.modal-actions {
  display: flex;
  border-top: 1px solid #eee;
}

.modal-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 28rpx;
  text-align: center;
  border: none;
  background: #fff;
  border-radius: 0;
}

.cancel {
  color: #666;
}

.confirm {
  color: #007AFF;
  font-weight: bold;
}

/* 日期选择器 */
.date-picker-modal {
  height: auto;
  max-height: 90vh;
}

.date-picker-title {
  font-size: 32rpx;
  text-align: center;
  padding: 30rpx 0;
  font-weight: bold;
  border-bottom: 1px solid #eee;
}

.date-picker-container {
  height: 400rpx;
  overflow: hidden;
}

.date-picker {
  width: 100%;
  height: 400rpx;
}

.picker-item {
  height: 34px;
  line-height: 34px;
  text-align: center;
  font-size: 28rpx;
  color: #333;
}

.date-picker-actions {
  border-top: 1px solid #eee;
}

/* 性别选择 */
.gender-options {
  padding: 30rpx;
}

.gender-option {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid #eee;
  position: relative;
  z-index: 1;
}

.gender-option text {
  margin-left: 20rpx;
  font-size: 28rpx;
}

.gender-option.selected {
  color: #007AFF;
}

/* 增加一个透明的覆盖层，使整行可点击 */
.gender-option::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
</style>

<!--
变更说明：
- 重构add-baby.vue，复用profile-edit.vue的组件
- 使用相同的日期选择器组件，统一样式和交互体验
- 统一表单数据结构，简化代码逻辑
- 保持与个人信息编辑页一致的UI风格
--> 