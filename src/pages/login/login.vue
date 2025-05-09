<template>
  <view :class="['container', isDarkMode ? 'dark-mode' : '']">
    <!-- Logo和标题区域 -->
    <view class="logo-container">
      <view class="title-area">
        <view class="title">未来小领袖</view>
        <view class="subtitle">科学育儿，健康成长</view>
      </view>
    </view>
    
    <!-- 登录表单 -->
    <view class="form-card">
      <view class="form-header">用户登录</view>
      
      <view class="input-group">
        <text class="input-label">用户名</text>
        <view class="input-container">
          <input 
            class="input" 
            type="text" 
            v-model="username" 
            placeholder="请输入用户名" 
            placeholder-class="placeholder"
          />
        </view>
      </view>
      
      <view class="input-group">
        <text class="input-label">密码</text>
        <view class="input-container">
          <input 
            class="input" 
            :type="isPasswordVisible ? 'text' : 'password'" 
            v-model="password" 
            placeholder="请输入密码" 
            placeholder-class="placeholder"
          />
          <text 
            class="password-toggle" 
            @click="togglePasswordVisibility"
          >{{ isPasswordVisible ? '👁️' : '👁️‍🗨️' }}</text>
        </view>
      </view>
      
      <view class="remember-row">
        <view class="remember-me" @tap="remember = !remember">
          <view class="checkbox" :class="{ active: remember, 'dark-mode': isDarkMode }">
            <text class="checkbox-inner" v-if="remember">✓</text>
          </view>
          <text class="remember-text" :class="{'dark-mode': isDarkMode}">记住我</text>
        </view>
        <text class="forgot-text" @click="forgotPassword">忘记密码?</text>
      </view>
      
      <button class="login-btn" @click="login">登录</button>
      
      <view class="register-row">
        <text>还没有账号？</text>
        <text class="register-link" @click="register">立即注册</text>
      </view>
    </view>
    
    <view class="footer">
      © 2025 未来小领袖 v1.0.0
    </view>
  </view>
</template>

<script>
export default {
  // 组件数据
  data() {
    return {
      username: '', // 用户名
      password: '', // 密码
      remember: false, // 是否记住登录状态
      isPasswordVisible: false, // 控制密码是否显示
      isDarkMode: false // 是否处于暗模式
    }
  },
  onLoad() {
    // 读取本地存储的登录信息
    const loginInfo = uni.getStorageSync('loginInfo');
    if (loginInfo) {
      this.username = loginInfo.username || '';
      this.password = loginInfo.remember ? (loginInfo.password || '') : '';
      this.remember = loginInfo.remember || false;
    }
  },
  // 组件方法
  methods: {
    /**
     * 切换密码显示/隐藏状态
     */
    togglePasswordVisibility() {
      this.isPasswordVisible = !this.isPasswordVisible
    },
    
    /**
     * 处理登录按钮点击事件
     * 1. 验证表单
     * 2. 显示加载状态
     * 3. 模拟登录请求
     * 4. 处理登录结果
     */
    login() {
      if (!this.username) {
        uni.showToast({
          title: '请输入账号',
          icon: 'none'
        });
        return;
      }
      if (!this.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        });
        return;
      }
      
      // 如果选择了记住登录状态，则保存到本地存储
      if (this.remember) {
        uni.setStorageSync('loginInfo', {
          username: this.username,
          password: this.password,
          remember: true
        });
      } else {
        // 如果未选择记住登录状态，则清除之前的存储
        uni.removeStorageSync('loginInfo');
      }
      
      // 模拟登录请求
      uni.showLoading({
        title: '登录中...'
      });
      
      // 模拟服务端请求，只发送账号和密码
      setTimeout(() => {
        uni.hideLoading();
        
        // 保存用户登录状态
        uni.setStorageSync('isLoggedIn', true);
        uni.setStorageSync('username', this.username);
        
        uni.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500,
          success: () => {
            setTimeout(() => {
              uni.switchTab({
                url: '/pages/index/index'
              });
            }, 1500);
          }
        });
      }, 1500);
    },
    
    /**
     * 注册账号功能
     */
    register() {
      try {
        uni.navigateTo({
          url: '../register/register'
        });
      } catch (error) {
        console.error('导航失败:', error);
        uni.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    },
    
    /**
     * 忘记密码功能
     */
    forgotPassword() {
      try {
        uni.navigateTo({
          url: '../forgot-password/forgot-password'
        });
      } catch (error) {
        console.error('导航失败:', error);
        uni.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    }
  }
}
</script>

<style>
/* 登录页面整体容器 */
.container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #5a32ea, #8477fa);
  padding: 0;
}

.dark-mode {
  background: linear-gradient(135deg, #252840, #1a1c2a);
}

/* Logo和标题区域 */
.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
  text-align: center;
  padding: 0 40rpx;
}

.title-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  color: white;
  font-size: 64rpx;
  font-weight: bold;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 32rpx;
  margin-top: 10rpx;
}

/* 登录表单 */
.form-card {
  width: 90%;
  background-color: white;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
  margin: 0 auto 40rpx;
  max-width: 600rpx;
  position: relative;
}

.dark-mode .form-card {
  background-color: #2d2d3a;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.3);
}

.form-header {
  text-align: center;
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 40rpx;
}

.dark-mode .form-header {
  color: #e0e0e0;
}

/* 输入框组 */
.input-group {
  margin-bottom: 30rpx;
}

.input-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.dark-mode .input-label {
  color: #aaa;
}

.input-container {
  display: flex;
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  overflow: hidden;
}

.dark-mode .input-container {
  border-color: #444;
}

.input {
  flex: 1;
  height: 90rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #333;
}

.dark-mode .input {
  background-color: #3a3a48;
  color: #e0e0e0;
}

.placeholder {
  color: #999;
}

.dark-mode .placeholder {
  color: #777;
}

.password-toggle {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40rpx;
  color: #999;
  z-index: 2;
}

.dark-mode .password-toggle {
  color: #777;
}

/* 记住登录和忘记密码 */
.remember-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.remember-me {
  display: flex;
  align-items: center;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 1px solid #ddd;
  border-radius: 6rpx;
  margin-right: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-mode .checkbox {
  border-color: #555;
}

.checkbox.active {
  background-color: #5a32ea;
  border-color: #5a32ea;
}

.dark-mode .checkbox.active {
  background-color: #5a32ea;
  border-color: #5a32ea;
}

.checkbox-inner {
  color: white;
  font-size: 24rpx;
  line-height: 1;
}

.remember-text {
  font-size: 28rpx;
  color: #666;
}

.dark-mode .remember-text {
  color: #aaa;
}

.forgot-text {
  font-size: 28rpx;
  color: #5a32ea;
}

.dark-mode .forgot-text {
  color: #8477fa;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background-color: #5a32ea;
  color: white;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 45rpx;
  text-align: center;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 16rpx rgba(90, 50, 234, 0.3);
}

.dark-mode .login-btn {
  box-shadow: 0 8rpx 16rpx rgba(90, 50, 234, 0.2);
}

.login-btn:active {
  opacity: 0.9;
}

/* 注册链接 */
.register-row {
  text-align: center;
  font-size: 28rpx;
  color: #666;
}

.dark-mode .register-row {
  color: #aaa;
}

.register-link {
  color: #5a32ea;
  margin-left: 10rpx;
}

.dark-mode .register-link {
  color: #8477fa;
}

/* 页脚 */
.footer {
  width: 100%;
  margin-top: 40rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 20rpx 0;
}
</style> 