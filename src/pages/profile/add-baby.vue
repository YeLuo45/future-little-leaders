<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">添加宝宝</text>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <!-- 宝宝姓名 -->
      <view class="form-item">
        <text class="form-label">宝宝姓名</text>
        <input class="form-input" v-model="form.name" placeholder="请输入宝宝姓名" placeholder-class="placeholder" />
      </view>

      <!-- 宝宝性别 -->
      <view class="form-item">
        <text class="form-label">性别</text>
        <view class="type-selector">
          <view class="type-item" :class="{ 'selected': form.gender === '男' }" @tap="form.gender = '男'">
            男
          </view>
          <view class="type-item" :class="{ 'selected': form.gender === '女' }" @tap="form.gender = '女'">
            女
          </view>
        </view>
      </view>

      <!-- 宝宝头像 -->
      <view class="form-item">
        <text class="form-label">宝宝头像</text>
        <view class="avatar-selector" @tap="chooseAvatar">
          <image :src="form.avatar || '/static/avatar.svg'" class="avatar-preview"></image>
          <text class="avatar-tip">点击选择头像</text>
        </view>
      </view>

      <!-- 出生日期 -->
      <view class="form-item">
        <text class="form-label">出生日期</text>
        <picker mode="date" :value="form.birthday" @change="onBirthdayChange" start="2015-01-01" end="2025-12-31">
          <view class="date-picker">
            <text v-if="!form.birthday" class="placeholder">请选择日期</text>
            <text v-else>{{form.birthday}}</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-btn-container">
      <button class="submit-btn" @tap="submit" :disabled="!isFormValid">
        创建宝宝
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const form = ref({
  name: '',
  gender: '',
  avatar: '',
  birthday: ''
});

// 表单验证
const isFormValid = computed(() => {
  return form.value.name && form.value.gender && form.value.birthday;
});

function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.value.avatar = res.tempFilePaths[0];
    }
  });
}

function onBirthdayChange(e) {
  form.value.birthday = e.detail.value;
}

function goBack() {
  uni.navigateBack();
}

function submit() {
  if (!isFormValid.value) {
    uni.showToast({ 
      title: '请完善宝宝信息', 
      icon: 'none' 
    });
    return;
  }
  
  try {
    // 生成新宝宝id
    const newId = 'baby_' + Date.now();
    
    // 获取原有宝宝列表
    let babies = uni.getStorageSync('babies') || [];
    if (typeof babies === 'string') {
      babies = JSON.parse(babies);
    }
    
    // 添加新宝宝
    babies.push({ 
      id: newId, 
      name: form.value.name, 
      gender: form.value.gender, 
      avatar: form.value.avatar, 
      birthday: form.value.birthday 
    });
    
    // 保存宝宝列表
    uni.setStorageSync('babies', babies);
    
    // 设为当前宝宝
    uni.setStorageSync('currentBabyId', newId);
    
    // 广播宝宝变更事件
    uni.$emit('babyChanged', newId);
    
    uni.showToast({ 
      title: '宝宝添加成功', 
      icon: 'success' 
    });
    
    // 返回上一页
    setTimeout(() => {
      uni.navigateBack({
        delta: 1,
        success: () => {
          // 触发profile页刷新
          uni.$emit('refreshBabyList');
        }
      });
    }, 1500);
  } catch (e) {
    console.error('保存宝宝信息失败', e);
    uni.showToast({ 
      title: '创建失败，请重试', 
      icon: 'none' 
    });
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 40rpx;
}

/* 导航栏样式 */
.nav-bar {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  height: 88rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  padding: 10rpx 30rpx 20rpx 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.nav-left {
  padding: 20rpx;
  margin-left: -20rpx;
}

.nav-icon {
  font-size: 40rpx;
  color: white;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
  color: white;
}

/* 表单容器 */
.form-container {
  padding: 30rpx;
  background-color: #fff;
  margin: 20rpx 30rpx;
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

.placeholder {
  color: #999;
}

/* 性别选择器 */
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

/* 头像选择 */
.avatar-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding: 30rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  cursor: pointer;
}

.avatar-preview {
  width: 150rpx;
  height: 150rpx;
  border-radius: 75rpx;
  border: 4rpx solid #f0f0f0;
  background-color: #fff;
}

.avatar-tip {
  font-size: 24rpx;
  color: #7C3AED;
}

/* 日期选择器 */
.date-picker {
  width: 100%;
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

.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(132, 119, 250, 0.2);
}

.submit-btn[disabled] {
  background: linear-gradient(135deg, #9f8eff, #8477fa);
  box-shadow: none;
  color: #666;
}
</style> 