<template>
  <view :class="['container', isDarkMode ? 'dark-mode' : '']">
    <!-- 装饰元素 -->
    <view class="decoration decoration-1"></view>
    <view class="decoration decoration-2"></view>
    
    <!-- <image class="logo" src="/static/logo.png" mode="aspectFill"></image> -->
    
    <view class="title">找回密码</view>
    <view class="subtitle">重置你的账号密码</view>
    
    <view class="form">
      <!-- 手机号输入框 -->
      <view class="input-group">
        <text class="input-label">手机号</text>
        <input 
          class="input" 
          type="text" 
          v-model="phone" 
          placeholder="请输入手机号" 
          placeholder-class="placeholder"
          maxlength="11"
        />
        <text class="iconfont input-icon">&#xe647;</text>
      </view>
      
      <!-- 验证码输入框 -->
      <view class="input-group verification-group">
        <text class="input-label">验证码</text>
        <view class="verification-input-row">
          <input 
            class="input verification-input" 
            type="text" 
            v-model="code" 
            placeholder="请输入验证码" 
            placeholder-class="placeholder"
            maxlength="6"
          />
          <view class="verification-btn" @click="sendCode" :class="{ disabled: countDown > 0 }">
            {{ countDown > 0 ? `${countDown}秒后重发` : '获取验证码' }}
          </view>
        </view>
      </view>
      
      <!-- 新密码输入框 -->
      <view class="input-group">
        <text class="input-label">新密码</text>
        <input 
          class="input" 
          :type="isPasswordVisible ? 'text' : 'password'" 
          v-model="password" 
          placeholder="请输入新密码" 
          placeholder-class="placeholder"
        />
        <text 
          class="iconfont password-toggle" 
          @click="togglePasswordVisibility"
        >{{ isPasswordVisible ? '&#xe647;' : '&#xe600;' }}</text>
      </view>
      
      <!-- 确认新密码输入框 -->
      <view class="input-group">
        <text class="input-label">确认新密码</text>
        <input 
          class="input" 
          :type="isConfirmPasswordVisible ? 'text' : 'password'" 
          v-model="confirmPassword" 
          placeholder="请再次输入新密码" 
          placeholder-class="placeholder"
        />
        <text 
          class="iconfont password-toggle" 
          @click="toggleConfirmPasswordVisibility"
        >{{ isConfirmPasswordVisible ? '&#xe647;' : '&#xe600;' }}</text>
      </view>
      
      <view class="button reset-btn" @click="resetPassword">
        <view class="button-text">重置密码</view>
      </view>
      
      <view class="options">
        <text>记起密码?</text>
        <text class="option-btn" @click="goToLogin">返回登录</text>
      </view>
    </view>
    
    <view class="footer">
      © 2023 任务管理系统 v1.0.0
    </view>
  </view>
</template>

<script>
import { isDarkTheme } from '@/utils/themeUtils.js';

export default {
  data() {
    return {
      phone: '', // 手机号
      code: '', // 验证码
      password: '', // 新密码
      confirmPassword: '', // 确认新密码
      isPasswordVisible: false, // 控制密码是否显示
      isConfirmPasswordVisible: false, // 控制确认密码是否显示
      countDown: 0, // 验证码倒计时
      timer: null, // 计时器
      isDarkMode: false // 是否处于暗模式
    }
  },
  onLoad() {
    this.isDarkMode = isDarkTheme();
  },
  onShow() {
    this.isDarkMode = isDarkTheme();
  },
  onUnload() {
    // 清除计时器
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
    /**
     * 切换密码显示状态
     */
    togglePasswordVisibility() {
      this.isPasswordVisible = !this.isPasswordVisible
    },
    
    /**
     * 切换确认密码显示状态
     */
    toggleConfirmPasswordVisibility() {
      this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible
    },
    
    /**
     * 发送验证码
     */
    sendCode() {
      // 如果正在倒计时，不允许重复发送
      if (this.countDown > 0) {
        return;
      }
      
      // 验证手机号
      if (!this.phone) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        });
        return;
      }
      
      if (!/^1\d{10}$/.test(this.phone)) {
        uni.showToast({
          title: '请输入有效的手机号',
          icon: 'none'
        });
        return;
      }
      
      // 显示加载状态
      uni.showLoading({
        title: '发送中...'
      });
      
      // 模拟发送验证码请求
      setTimeout(() => {
        uni.hideLoading();
        
        // 发送成功后启动倒计时
        this.startCountDown();
        
        uni.showToast({
          title: '验证码已发送',
          icon: 'success'
        });
      }, 1000);
    },
    
    /**
     * 开始倒计时
     */
    startCountDown() {
      this.countDown = 60;
      
      this.timer = setInterval(() => {
        this.countDown--;
        
        if (this.countDown <= 0) {
          clearInterval(this.timer);
          this.timer = null;
        }
      }, 1000);
    },
    
    /**
     * 重置密码
     */
    resetPassword() {
      // 表单验证
      if (!this.phone) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        });
        return;
      }
      
      if (!/^1\d{10}$/.test(this.phone)) {
        uni.showToast({
          title: '请输入有效的手机号',
          icon: 'none'
        });
        return;
      }
      
      if (!this.code) {
        uni.showToast({
          title: '请输入验证码',
          icon: 'none'
        });
        return;
      }
      
      if (!this.password) {
        uni.showToast({
          title: '请输入新密码',
          icon: 'none'
        });
        return;
      }
      
      if (this.password !== this.confirmPassword) {
        uni.showToast({
          title: '两次密码输入不一致',
          icon: 'none'
        });
        return;
      }
      
      // 显示加载状态
      uni.showLoading({
        title: '提交中...'
      });
      
      // 模拟重置密码请求
      setTimeout(() => {
        uni.hideLoading();
        
        uni.showToast({
          title: '密码重置成功',
          icon: 'success',
          duration: 2000,
          success: () => {
            // 重置成功后延迟跳转到登录页
            setTimeout(() => {
              this.goToLogin();
            }, 2000);
          }
        });
      }, 1500);
    },
    
    /**
     * 返回登录页
     */
    goToLogin() {
      uni.redirectTo({
        url: '../login/login'
      });
    }
  }
}
</script>

<style>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 60rpx 40rpx;
  background-color: #fff;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.dark-mode.container {
  background-color: #121212;
}

/* 装饰性元素 */
.decoration {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
  z-index: 0;
}

.decoration-1 {
  width: 500rpx;
  height: 500rpx;
  background: linear-gradient(135deg, #8477fa, #b7a6ff);
  top: -200rpx;
  left: -200rpx;
  transform: rotate(15deg);
}

.decoration-2 {
  width: 300rpx;
  height: 300rpx;
  background: linear-gradient(135deg, #77d9ff, #a6e9ff);
  bottom: -150rpx;
  right: -150rpx;
  transform: rotate(45deg);
}

.dark-mode .decoration-1 {
  background: linear-gradient(135deg, #5e52c9, #6d5fcf);
}

.dark-mode .decoration-2 {
  background: linear-gradient(135deg, #3d8aa8, #4d9cc0);
}

.logo {
  width: 180rpx;
  height: 180rpx;
  margin: 0 auto 60rpx;
  position: relative;
  z-index: 1;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15rpx);
  }
}

.title {
  font-size: 44rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20rpx;
  color: #333;
  position: relative;
  z-index: 1;
}

.subtitle {
  font-size: 28rpx;
  color: #999;
  text-align: center;
  margin-bottom: 80rpx;
  position: relative;
  z-index: 1;
}

.dark-mode .title {
  color: #e0e0e0;
}

.dark-mode .subtitle {
  color: #777;
}

.form {
  position: relative;
  z-index: 1;
  width: 100%;
}

.input-group {
  margin-bottom: 40rpx;
  position: relative;
}

.input-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 15rpx;
  display: block;
}

.dark-mode .input-label {
  color: #aaa;
}

.input {
  width: 100%;
  height: 100rpx;
  background-color: #f8f8f8;
  border-radius: 20rpx;
  padding: 0 80rpx 0 30rpx;
  font-size: 32rpx;
  color: #333;
  border: 2rpx solid transparent;
  transition: all 0.3s;
  box-sizing: border-box;
}

.input:focus {
  border-color: #8477fa;
  background-color: #fff;
  box-shadow: 0 6rpx 20rpx rgba(132, 119, 250, 0.1);
}

.dark-mode .input {
  background-color: #2a2a2a;
  color: #e0e0e0;
}

.dark-mode .input:focus {
  border-color: #5e52c9;
  background-color: #2a2a2a;
  box-shadow: 0 6rpx 20rpx rgba(94, 82, 201, 0.2);
}

.input-icon {
  position: absolute;
  right: 30rpx;
  top: 50%;
  color: #999;
  font-size: 36rpx;
  z-index: 2;
}

.dark-mode .input-icon {
  color: #777;
}

.password-toggle {
  position: absolute;
  right: 30rpx;
  bottom: 32rpx;
  color: #999;
  font-size: 36rpx;
  z-index: 2;
}

.dark-mode .password-toggle {
  color: #777;
}

/* 验证码相关样式 */
.verification-group {
  margin-bottom: 40rpx;
}

.verification-input-row {
  display: flex;
  position: relative;
}

.verification-input {
  flex: 1;
  padding-right: 240rpx;
}

.verification-btn {
  position: absolute;
  right: 0;
  top: 0;
  height: 100rpx;
  line-height: 100rpx;
  background-color: #8477fa;
  color: white;
  font-size: 28rpx;
  border-radius: 0 20rpx 20rpx 0;
  padding: 0 30rpx;
  text-align: center;
  min-width: 180rpx;
  box-sizing: border-box;
}

.dark-mode .verification-btn {
  background-color: #5e52c9;
}

.verification-btn.disabled {
  background-color: #ccc;
  color: #fff;
}

.dark-mode .verification-btn.disabled {
  background-color: #444;
  color: #aaa;
}

.button {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  border-radius: 50rpx;
  color: white;
  font-size: 32rpx;
  margin-top: 60rpx;
  position: relative;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 10rpx 30rpx rgba(132, 119, 250, 0.3);
  transition: all 0.3s;
}

.button:active {
  transform: translateY(3rpx);
  box-shadow: 0 5rpx 15rpx rgba(132, 119, 250, 0.2);
}

.reset-btn {
  background: linear-gradient(135deg, #9f8eff, #8477fa);
}

.dark-mode .reset-btn {
  background: linear-gradient(135deg, #6e62c9, #5e52c9);
  box-shadow: 0 10rpx 30rpx rgba(94, 82, 201, 0.3);
}

.dark-mode .button:active {
  box-shadow: 0 5rpx 15rpx rgba(94, 82, 201, 0.2);
}

.button::after {
  content: '';
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, transparent 10.01%);
  background-repeat: no-repeat;
  background-position: 50%;
  transform: scale(10, 10);
  opacity: 0;
  transition: transform 0.5s, opacity 1s;
}

.button:active::after {
  transform: scale(0, 0);
  opacity: 0.3;
  transition: 0s;
}

.button-text {
  position: relative;
  z-index: 2;
}

.options {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
  font-size: 28rpx;
  color: #999;
  position: relative;
  z-index: 1;
}

.dark-mode .options {
  color: #777;
}

.option-btn {
  color: #8477fa;
}

.dark-mode .option-btn {
  color: #9f8eff;
}

.footer {
  position: absolute;
  bottom: 60rpx;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 24rpx;
  color: #999;
  z-index: 1;
}

.dark-mode .footer {
  color: #777;
}
</style> 