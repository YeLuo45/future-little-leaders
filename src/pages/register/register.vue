<template>
  <view :class="['container', isDarkMode ? 'dark-mode' : '']">
    <!-- 装饰元素 -->
    <view class="decoration decoration-1"></view>
    <view class="decoration decoration-2"></view>
    
    <image class="logo" src="/static/logo.png" mode="aspectFill"></image>
    
    <view class="title">创建新账号</view>
    <view class="subtitle">填写以下信息完成注册</view>
    
    <view class="form">
      <view class="input-group">
        <text class="input-label">手机号</text>
        <input 
          class="input" 
          type="text" 
          v-model="username" 
          placeholder="请输入手机号" 
          placeholder-class="placeholder"
          maxlength="11"
        />
        <text class="iconfont input-icon">&#xe647;</text>
      </view>
      
      <view class="input-group">
        <text class="input-label">密码</text>
        <input 
          class="input" 
          :type="isPasswordVisible ? 'text' : 'password'" 
          v-model="password" 
          placeholder="请输入密码" 
          placeholder-class="placeholder"
        />
        <text 
          class="iconfont password-toggle" 
          @click="togglePasswordVisibility"
        >{{ isPasswordVisible ? '&#xe647;' : '&#xe600;' }}</text>
      </view>
      
      <view class="input-group">
        <text class="input-label">确认密码</text>
        <input 
          class="input" 
          :type="isConfirmPasswordVisible ? 'text' : 'password'" 
          v-model="confirmPassword" 
          placeholder="请再次输入密码" 
          placeholder-class="placeholder"
        />
        <text 
          class="iconfont password-toggle" 
          @click="toggleConfirmPasswordVisibility"
        >{{ isConfirmPasswordVisible ? '&#xe647;' : '&#xe600;' }}</text>
      </view>
      
      <!-- 同意服务条款 -->
      <view class="agreement-row">
        <view class="agreement" @tap="toggleAgreement">
          <view class="checkbox" :class="{ active: isAgreed, 'dark-mode': isDarkMode }">
            <text class="checkbox-inner" v-if="isAgreed"></text>
          </view>
          <text class="agreement-text" :class="{'dark-mode': isDarkMode}">我已阅读并同意<text class="agreement-link">《服务条款》</text></text>
        </view>
      </view>
      
      <view class="button register-btn" @click="register">
        <view class="button-text">注册</view>
      </view>
      
      <view class="options">
        <text>已有账号?</text>
        <text class="option-btn" @click="goToLogin">立即登录</text>
      </view>
    </view>
    
    <!-- <view class="footer">
      © 2023 任务管理系统 v1.0.0
    </view> -->
  </view>
</template>

<script>
import { isDarkTheme } from '@/utils/themeUtils.js';

export default {
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: '',
      isPasswordVisible: false,
      isConfirmPasswordVisible: false,
      isAgreed: false,
      isDarkMode: false
    }
  },
  onLoad() {
    this.isDarkMode = isDarkTheme();
  },
  onShow() {
    this.isDarkMode = isDarkTheme();
  },
  methods: {
    togglePasswordVisibility() {
      this.isPasswordVisible = !this.isPasswordVisible
    },
    toggleConfirmPasswordVisibility() {
      this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible
    },
    toggleAgreement() {
      this.isAgreed = !this.isAgreed
    },
    register() {
      // 验证表单
      if (!this.username) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return
      }
      
      // 验证手机号
      if (!/^1\d{10}$/.test(this.username)) {
        uni.showToast({
          title: '请输入有效的手机号',
          icon: 'none'
        })
        return
      }
      
      if (!this.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        })
        return
      }
      
      if (this.password !== this.confirmPassword) {
        uni.showToast({
          title: '两次密码输入不一致',
          icon: 'none'
        })
        return
      }
      
      if (!this.isAgreed) {
        uni.showToast({
          title: '请同意服务条款',
          icon: 'none'
        })
        return
      }
      
      // 发送注册请求
      uni.showLoading({
        title: '注册中...'
      })
      
      // 模拟注册成功
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '注册成功',
          icon: 'success'
        })
        // 注册成功后跳转到登录页
        setTimeout(() => {
          this.goToLogin()
        }, 1500)
      }, 2000)
    },
    goToLogin() {
      // 跳转到登录页面
      try {
        uni.navigateTo({
          url: '../login/login',
          success: function() {
            console.log('导航成功');
          },
          fail: function(err) {
            console.error('导航失败', err);
            uni.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
      } catch (e) {
        console.error('导航异常', e);
        uni.showToast({
          title: '页面跳转异常',
          icon: 'none'
        });
      }
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

.register-btn {
  background: linear-gradient(135deg, #9f8eff, #8477fa);
}

.dark-mode .register-btn {
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

/* 注册页面整体容器 */
.register-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 15vh; /* 顶部留出一定空间 */
  background-color: #8477fa; /* 使用纯色背景与图片匹配 */
  overflow: hidden;
}

/* 装饰性圆形元素 */
.decorator {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  z-index: 1;
}

/* 右上角的大圆形 */
.decorator-1 {
  width: 220px;
  height: 220px;
  top: -110px;
  right: -110px;
}

/* 左下角的小圆形 */
.decorator-2 {
  width: 180px;
  height: 180px;
  bottom: -90px;
  left: -90px;
}

/* 页面标题区域 */
.register-header {
  width: 100%;
  padding: 0 40rpx;
  margin-bottom: 60rpx;
  position: relative;
  z-index: 2;
}

/* 主标题 */
.register-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 16rpx;
}

/* 副标题 */
.register-subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 注册表单容器 */
.register-form {
  width: 85%;
  margin: 0 auto;
  background-color: white;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 40rpx;
  position: relative;
  z-index: 2;
}

/* 表单项分组 */
.form-group {
  margin-bottom: 30rpx;
}

/* 表单标签文字 */
.form-label {
  display: block;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

/* 输入框容器 */
.input-container {
  position: relative;
  width: 100%;
  border: 1px solid #f0f0f0;
  border-radius: 8rpx;
  height: 90rpx;
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
}

/* 输入框前面的图标 */
.input-container .iconfont {
  margin-left: 20rpx;
  color: #c0c0c0;
  font-size: 36rpx;
}

/* 输入框样式 */
.input-field {
  flex: 1;
  height: 100%;
  padding: 0 20rpx;
  font-size: 28rpx;
  background-color: transparent;
}

/* 密码框右侧的眼睛图标 */
.input-container .icon-eye,
.input-container .icon-eye-slash {
  margin-right: 20rpx;
  font-size: 36rpx;
  color: #c0c0c0;
}

/* 同意条款选项容器 */
.agreement {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  margin-bottom: 40rpx;
}

/* 同意条款文字样式 */
.agreement text {
  font-size: 26rpx;
  color: #666;
  margin-left: 4rpx;
}

/* 链接样式 */
.link {
  color: #8477fa;
}

/* 注册按钮样式 */
.register-button {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background-color: #8477fa;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 32rpx;
  font-weight: 500;
  letter-spacing: 2rpx;
}

/* 页脚区域 */
.register-footer {
  display: flex;
  justify-content: center;
  margin-top: 60rpx;
  position: relative;
  z-index: 2;
}

/* 页脚文字样式 */
.register-footer text {
  color: white;
  font-size: 26rpx;
  opacity: 0.9;
}

/* 页脚链接文字 */
.footer-link {
  color: white;
  font-size: 26rpx;
  opacity: 0.9;
  font-weight: bold;
  margin-left: 8rpx;
  text-decoration: underline;
}

/* 字体图标样式 - 如App.vue中样式不可用，使用以下样式 */
@font-face {
  font-family: "iconfont";
  src: url('data:font/truetype;charset=utf-8;base64,AAEAAAALAIAAAwAwR1NVQrD+s+0AAAE4AAAAQk9TLzI8fEg3AAABfAAAAFZjbWFwB3F8LwAAAeQAAAGgZ2x5ZuWIN0cAAAOMAAAB/GhlYWQcteM3AAAA4AAAADZoaGVhB94DiAAAALwAAAAkaG10eA+qAAAAAAHUAAAADGxvY2EAXAFUAAADQAAAACJTY3VwL9+gEAAABHQAAAEBAAEAAAAAAABMyk1AAAAAAAAABAMAAQAAAAAAALQVW7dfDzz1AAsD6AAAAADaSCPpAAAAANpII+kAAP/bA+kC5gAAAAgAAgAAAAAAAAABAAACzP7oAAAD6AAAAAAD6QABAAAAAAAAAAAAAAAAAAAAAwAAUAAAAwAAAAICJQGQAAUAAAK5AswAAACPArsCzAAAAeUAMQECAAACAAUDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFBmRWQAQOYA5gMCzP/MALQC5gAUAAAAAQAAAAAAAAPoAAAD6AAAA+gAAAAAAAIAAAADAAAAFAADAAEAAAAUAAQBlAAAAGAAgAABAADmAOYB5gPmBeYH5gnmC+YP5hHmFeYZ5hvmHeYf5iHmI+Yl5ifmKeYr5i3mL+Yx5jPmNeY35jnmO+Y95j/mQeZD5kXmR+ZJ5kvmTeZP5lHmU+ZV5lfmWeZb5l3mYeZj//8AAOYA5gHmA+YF5gfmCeYL5g/mEeYV5hnmG+Yd5h/mIeYj5iXmJ+Yp5ivmLeYv5jHmM+Y15jfmOeY75j3mP+ZB5kPmReZH5knmS+ZN5k/mUeZT5lXmV+ZZ5lvmXeZh5mP//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWAAAAACAAEABAAFAAYABwAIAAkACgALAAwADQAOAA8AEAARABIAEwAUABUAFgAXABgAGQAaABsAHAAdAB4AHwAgACEAIgAjACQAJQAmACcAKAApACoAKwAAAAAAAwAAAAAC7gLmAAMADwAbAAABNyEHATI2NTQmIyIGFRQWEzI2NTQmIyIGFRQWAXMg/kggAXMzSkozM0pKMzNKSjMzSkoC5pCQ/KBKMzNKSjMzSgJwSjMzSkozM0oAAAAGAAD/2wPpAuYAAwAHAAwAEAAUABgAAAEzFSMDMxUjJSEVIRUhARUzNQMhFSEnNSEVAjKXl8jIyP19AfT+DAH0/gzIyAH0/gzI/gwCJsjI/tzIyMjIAUbIyP7cyPLIyAAAAAADAAD/2wPpAuYAGQAzAE0AAAEmBgcOAQcOASMiJicuASMiBgcOARcBHgE3PgE3PgE3PgEXHgEXHgEXMjY3PgEnAS4BBwUGJicmNjc2Nz4BNzY3Njc+ATc2FhceAQcGFhcWBgJ7DBsMBxULChgNBQwGCRQMCxkLCwgD/l8MGQsHFgoIEAgNGw4JEgkKFQsLGAsLCAQBpQsZDf67HT0REQkhJRQgDw4KBwYDCQMEDAQFAgMHFggIFgLfCwgDAxEICAgCAQMJCwsLDB0O/lwKCAMDEQgHDwYNBAYFDAcHDQILCwwdDgGkCggDiwgWCAkVDRQMCBISFRgRHhIRGQYBBgUMBQ4dDAsdAAAAAAAAEgDeAAEAAAAAAAAAAQAAAAEAAAAAAAEABwABAAEAAAAAAAIABwAIAAEAAAAAAAMABwAPAAEAAAAAAAQABwAWAAEAAAAAAAUACwAdAAEAAAAAAAYABwAoAAEAAAAAAAoALAAvAAEAAAAAAAsAEgBbAAMAAQQJAAAAAgBtAAMAAQQJAAEADgBvAAMAAQQJAAIADgB9AAMAAQQJAAMADgCLAAMAAQQJAAQADgCZAAMAAQQJAAUAFgCnAAMAAQQJAAYADgC9AAMAAQQJAAoAWADLAAMAAQQJAAsAJAEjAEMAcgBlAGEAdABlAGQAIABiAHkAIABpAGMAbwBuAGYAbwBuAHQAAENyZWF0ZWQgYnkgaWNvbmZvbnQAAGkAYwBvAG4AZgBvAG4AdAAAaWNvbmZvbnQAAFIAZQBnAHUAbABhAHIAAFJlZ3VsYXIAAGkAYwBvAG4AZgBvAG4AdAAAaWNvbmZvbnQAAGkAYwBvAG4AZgBvAG4AdAAAaWNvbmZvbnQAAFYAZQByAHMAaQBvAG4AIAAxAC4AMAAAVmVyc2lvbiAxLjAAAGkAYwBvAG4AZgBvAG4AdAAAaWNvbmZvbnQAAEcAZQBuAGUAcgBhAHQAZQBkACAAYgB5ACAAcwB2AGcAMgB0AHQAZgAgAGYAcgBvAG0AIABGAG8AbgB0AGUAbABsAG8AIABwAHIAbwBqAGUAYwB0AC4AAEdlbmVyYXRlZCBieSBzdmcydHRmIGZyb20gRm9udGVsbG8gcHJvamVjdC4AAGgAdAB0AHAAOgAvAC8AZgBvAG4AdABlAGwAbABvAC4AYwBvAG0AAGh0dHA6Ly9mb250ZWxsby5jb20AAAIAAAAAAAAACgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwECAQMBBAAEcGFzczASc3ltYm9sLXl1YW55aW5jYW4AAAAAAAAB//8AAgABAAAADAAAABYAAAACAAEAAQACAAABBAABAAAAAgAAAAAAAAABAAAAANNZKIoAAAAA2kgj6QAAAADaSCPp') format('truetype');
}

/* 如基础样式在App.vue中未全局引入，可在此处添加 */
.iconfont {
  font-family: "iconfont" !important;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-user:before {
  content: "\e7ae";
}

.icon-lock:before {
  content: "\e7c9";
}

.icon-eye:before {
  content: "\e78f";
}

.icon-eye-slash:before {
  content: "\e8ff";
}

/* 同意条款样式 */
.agreement-row {
  margin-bottom: 40rpx;
}

.agreement {
  display: flex;
  align-items: center;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #ddd;
  border-radius: 6rpx;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.active {
  border-color: #8477fa;
  background-color: rgba(132, 119, 250, 0.05);
}

.dark-mode .checkbox {
  border-color: #444;
}

.dark-mode .checkbox.active {
  border-color: #5e52c9;
  background-color: rgba(94, 82, 201, 0.1);
}

.checkbox-inner {
  width: 20rpx;
  height: 20rpx;
  background-color: #8477fa;
  border-radius: 3rpx;
}

.dark-mode .checkbox-inner {
  background-color: #5e52c9;
}

.agreement-text {
  font-size: 26rpx;
  color: #666;
}

.dark-mode .agreement-text {
  color: #999;
}

.agreement-link {
  color: #8477fa;
}

.dark-mode .agreement-link {
  color: #9f8eff;
}
</style> 