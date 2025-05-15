<!-- 个人信息编辑页面 -->
<template>
  <view class="page-container">

     <!-- 顶部导航栏 -->
     <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <view class="nav-title">编辑资料</view>
    </view>


    <!-- 头像编辑 -->
    <view class="avatar-selector" @tap="showAvatarActionSheet">
      <image class="avatar-preview" :src="form.avatar || '/static/avatar.svg'" mode="aspectFill"></image>
      <view class="avatar-edit-icon">📷</view>
    </view>
    <!-- 昵称编辑 -->
    <view class="form-item">
      <text class="form-label">昵称</text>
      <input class="form-input" v-model="form.nickname" maxlength="20" placeholder="请输入昵称" />
    </view>
    <!-- 性别编辑 -->
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
      <button class="save-btn" @tap="saveProfile" :disabled="!isFormValid">保存</button>
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
        <view class="modal-title">修改性别</view>
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
          <button class="modal-btn confirm" @tap="confirmGender">保存</button>
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
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { isDarkTheme } from '@/utils/themeUtils';
import { verifyAuth } from '@/utils/authUtils';

export default {
  name: 'ProfileEdit',
  setup() {
    // 表单数据
    const form = ref({
      avatar: '',
      nickname: '',
      gender: '',
      birthdate: ''
    });
    
    // 控制弹窗
    const showAvatarModal = ref(false);
    const showGenderModal = ref(false);
    const showDateModal = ref(false);
    const tempGender = ref('');
    
    // 日期选择器
    const yearsList = ref([]);
    const datePickerValue = ref([0, 0, 0]);
    const tempDate = ref('');
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
      console.log("yearsList:", yearsList.value);
    };
    
    // 根据出生日期设置日期选择器初始值
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
    
    // 表单校验
    const isFormValid = computed(() => {
      return form.value.nickname.length >= 2 && 
             form.value.nickname.length <= 20 && 
             form.value.gender && 
             form.value.birthdate;
    });

     // 返回上一页
     const goBack = () => {
      uni.navigateBack();
    };

    
    // 加载用户信息
    onMounted(() => {
      try {
        const user = uni.getStorageSync('userInfo');
        if (user) {
          const info = JSON.parse(user);
          form.value = {
            avatar: info.avatar || '',
            nickname: info.nickname || '',
            gender: info.gender || '',
            birthdate: info.birthdate || ''
          };
        }
        
        // 初始化日期选择器
        initYearsList();
        initDatePicker();
      } catch (e) {
        console.error('加载用户信息失败:', e);
      }
    });
    
    // 保存信息
    const saveProfile = () => {
      if (!isFormValid.value) {
        uni.showToast({ title: '请完善信息', icon: 'none' });
        return;
      }
      
      // 修改个人信息前进行身份验证
      verifyAuth(
        // 验证成功回调
        () => {
          try {
            const user = uni.getStorageSync('userInfo');
            let info = user ? JSON.parse(user) : {};
            info = { ...info, ...form.value };
            uni.setStorageSync('userInfo', JSON.stringify(info));
            uni.showToast({ title: '保存成功', icon: 'success' });
            setTimeout(() => {
              uni.navigateBack();
              uni.$emit('refreshUserInfo');
            }, 1000);
          } catch (e) {
            uni.showToast({ title: '保存失败', icon: 'none' });
          }
        },
        // 验证失败回调
        (error) => {
          console.error('验证失败:', error);
          uni.showToast({
            title: '验证失败，无法保存',
            icon: 'none'
          });
        }
      );
    };
    
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
        },
        fail: () => {
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
      console.log("form.value.birthdate:", form.value.birthdate);
      closeDateModal();
    };
    
    return {
      form,
      showAvatarModal,
      showGenderModal,
      showDateModal,
      datePickerValue,
      yearsList,
      daysInMonth,
      tempGender,
      isFormValid,
      saveProfile,
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
      indicatorStyle,
      goBack
    };
  }
};
</script>

<style scoped>
.page-container {
  /* min-height: 100vh;
  background: #f8f8f8;
  padding: 40rpx 30rpx; */
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
.form-item {
  padding-bottom: 36rpx;
  padding-left: 30rpx;
  padding-right: 30rpx;
}
.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
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
.btn-container {
  margin-top: 60rpx;
  padding-left: 30rpx;
  padding-right: 30rpx;
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
</style>

<!--
变更说明：
- 修复头像选择弹窗错误显示问题，调整为点击头像后才显示
- 修复性别选择弹窗交互问题，参考图集实现样式
- 实现出生日期选择器，使用滚轮选择方式，支持年月日选择
- 优化UI样式，与图集保持一致
--> 