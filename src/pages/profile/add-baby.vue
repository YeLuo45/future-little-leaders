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
    <view class="form-container">
      <view class="form-group">
        <text class="form-label">宝宝昵称</text>
        <input class="form-input" v-model="babyName" placeholder="请输入宝宝昵称" />
      </view>
      
      <view class="form-group">
        <text class="form-label">出生日期</text>
        <picker mode="date" :value="birthdate" :end="today" @change="onBirthdateChange">
          <view class="picker-view">
            <text>{{ birthdate || '请选择出生日期' }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>

      <view class="form-group">
        <text class="form-label">头像</text>
        <view class="avatar-selector">
          <view class="avatar-preview" @tap="selectAvatar">
            <image :src="selectedAvatar || '/static/avatar.svg'" mode="aspectFill" class="avatar-image"></image>
            <view class="avatar-overlay">
              <text class="avatar-text">点击选择</text>
            </view>
          </view>
        </view>
      </view>

      <button class="submit-btn" @tap="saveBaby" :disabled="!isFormValid">添加宝宝</button>
    </view>

    <!-- 头像选择弹窗 -->
    <view class="modal-mask" v-if="showAvatarModal" @tap="closeAvatarModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">选择头像</text>
        </view>
        <view class="modal-body">
          <view class="avatar-grid">
            <view 
              class="avatar-option" 
              v-for="(avatar, index) in defaultAvatars" 
              :key="index"
              @tap="selectDefaultAvatar(avatar)"
            >
              <image class="avatar-preview" :src="avatar" mode="aspectFill"></image>
            </view>
            <view class="avatar-option upload" @tap="uploadCustomAvatar">
              <text class="upload-icon">📤</text>
              <text class="upload-text">上传</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @tap="closeAvatarModal">取消</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { isDarkTheme } from '@/utils/themeUtils.js';

export default {
  name: 'AddBaby',
  setup() {
    const isDarkMode = ref(false);
    const babyName = ref('');
    const birthdate = ref('');
    const today = new Date().toISOString().split('T')[0]; // 今天日期，格式为YYYY-MM-DD
    const selectedAvatar = ref('');
    const showAvatarModal = ref(false);
    
    // 默认头像列表
    const defaultAvatars = [
      '/static/avatars/baby1.png',
      '/static/avatars/baby2.png',
      '/static/avatars/baby3.png',
      '/static/avatars/baby4.png',
      '/static/avatars/baby5.png',
      '/static/avatars/baby6.png',
    ];

    // 表单有效性验证
    const isFormValid = computed(() => {
      return babyName.value.trim() !== '' && birthdate.value !== '';
    });

    // 出生日期变更
    const onBirthdateChange = (e) => {
      birthdate.value = e.detail.value;
    };

    // 选择头像
    const selectAvatar = () => {
      showAvatarModal.value = true;
    };

    // 关闭头像选择弹窗
    const closeAvatarModal = () => {
      showAvatarModal.value = false;
    };

    // 选择默认头像
    const selectDefaultAvatar = (avatar) => {
      selectedAvatar.value = avatar;
      closeAvatarModal();
    };

    // 上传自定义头像
    const uploadCustomAvatar = () => {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          // 在真实应用中，这里应该上传到服务器
          // 这里直接使用临时路径
          selectedAvatar.value = tempFilePath;
          closeAvatarModal();
        }
      });
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

        // 创建新宝宝对象
        const newBaby = {
          id: 'baby_' + Date.now(),
          name: babyName.value.trim(),
          birthdate: birthdate.value,
          avatar: selectedAvatar.value || '/static/avatar.svg',
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

        uni.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 2000,
          success: () => {
            setTimeout(() => {
              uni.navigateBack();
            }, 2000);
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
    });

    return {
      isDarkMode,
      babyName,
      birthdate,
      today,
      selectedAvatar,
      showAvatarModal,
      defaultAvatars,
      isFormValid,
      onBirthdateChange,
      selectAvatar,
      closeAvatarModal,
      selectDefaultAvatar,
      uploadCustomAvatar,
      saveBaby,
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

.icon {
  color: white;
  font-size: 36rpx;
}

.nav-title {
  flex: 1;
  text-align: center;
  color: white;
  font-size: 32rpx;
  font-weight: bold;
}

.form-container {
  padding: 30rpx;
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.dark-mode .form-label {
  color: #aaa;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background-color: white;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.dark-mode .form-input {
  background-color: #2a2a2a;
  color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
}

.picker-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 80rpx;
  background-color: white;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.dark-mode .picker-view {
  background-color: #2a2a2a;
  color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
}

.picker-arrow {
  color: #999;
  font-size: 24rpx;
}

.avatar-selector {
  display: flex;
  justify-content: center;
  padding: 20rpx 0;
}

.avatar-preview {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 100rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60rpx;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: white;
  font-size: 24rpx;
}

.submit-btn {
  margin-top: 40rpx;
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(139, 92, 246, 0.3);
}

.submit-btn[disabled] {
  opacity: 0.6;
  background: linear-gradient(135deg, #b5a5f8, #a694f0);
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

.avatar-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.avatar-option {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  overflow: hidden;
}

.avatar-preview {
  width: 100%;
  height: 100%;
}

.avatar-option.upload {
  background-color: #f0f0f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.dark-mode .avatar-option.upload {
  background-color: #333;
}

.upload-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.upload-text {
  font-size: 24rpx;
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
}

.dark-mode .cancel {
  color: #999;
}
</style> 