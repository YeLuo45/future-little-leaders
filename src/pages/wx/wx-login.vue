<template>
  <view class="wx-login-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="decoration-circle circle-1"></view>
      <view class="decoration-circle circle-2"></view>
      <view class="decoration-circle circle-3"></view>
    </view>

    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">微信登录</text>
      <view class="placeholder"></view>
    </view>

    <!-- Logo 区域 -->
    <view class="logo-section">
      <view class="logo-wrapper">
        <text class="logo-icon">🦁</text>
      </view>
      <text class="app-name">未来小领袖</text>
      <text class="app-slogan">陪伴孩子成长的亲子任务平台</text>
    </view>

    <!-- 登录状态 -->
    <view v-if="isLoggedIn" class="logged-in-section">
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <view class="user-info">
          <image class="avatar" :src="session.userInfo.avatar" mode="aspectFill" />
          <view class="user-details">
            <text class="nickname">{{ session.userInfo.nickname }}</text>
            <view class="bind-status">
              <text class="status-badge" :class="bindStatusClass">
                {{ bindStatusText }}
              </text>
            </view>
          </view>
        </view>
        <view class="user-stats">
          <view class="stat-item">
            <text class="stat-value">{{ session.points || 0 }}</text>
            <text class="stat-label">积分</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ memberLevelText }}</text>
            <text class="stat-label">会员</text>
          </view>
        </view>
      </view>

      <!-- 绑定已有账号 -->
      <view v-if="session.bind_status === 'new'" class="bind-section">
        <text class="section-title">绑定已有账号</text>
        <view class="bind-form">
          <input
            v-model="bindAccount"
            class="bind-input"
            placeholder="请输入账号"
            type="text"
          />
          <input
            v-model="bindPassword"
            class="bind-input"
            placeholder="请输入密码"
            type="password"
            password
          />
          <button class="bind-btn" @click="handleBindAccount">
            <text>确认绑定</text>
          </button>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <button class="action-btn primary-btn" @click="goToHome">
          <text class="btn-icon">🏠</text>
          <text>进入首页</text>
        </button>
        <button class="action-btn logout-btn" @click="handleLogout">
          <text class="btn-icon">🚪</text>
          <text>退出登录</text>
        </button>
      </view>
    </view>

    <!-- 登录表单 -->
    <view v-else class="login-section">
      <!-- 隐私协议提示 -->
      <view class="privacy-notice">
        <view class="notice-icon">📋</view>
        <view class="notice-content">
          <text class="notice-title">登录须知</text>
          <text class="notice-desc">登录即表示同意</text>
          <view class="notice-links">
            <text class="link" @click="openPrivacy">《隐私政策》</text>
            <text class="link" @click="openTerms">《用户协议》</text>
          </view>
        </view>
      </view>

      <!-- 授权按钮 -->
      <button
        class="wx-auth-btn"
        :class="{ loading: isLoading }"
        :disabled="isLoading"
        @click="handleWxLogin"
      >
        <view v-if="isLoading" class="loading-spinner"></view>
        <template v-else>
          <text class="wx-icon">微信</text>
          <text class="btn-text">微信一键登录</text>
        </template>
      </button>

      <!-- 其他登录方式 -->
      <view class="other-login">
        <view class="divider">
          <view class="divider-line"></view>
          <text class="divider-text">其他登录方式</text>
          <view class="divider-line"></view>
        </view>
        <view class="other-methods">
          <view class="method-item" @click="goToPhoneLogin">
            <text class="method-icon">📱</text>
            <text class="method-text">手机号登录</text>
          </view>
          <view class="method-item" @click="goToRegister">
            <text class="method-icon">📝</text>
            <text class="method-text">注册账号</text>
          </view>
        </view>
      </view>

      <!-- 错误提示 -->
      <view v-if="errorMsg" class="error-tip">
        <text>{{ errorMsg }}</text>
      </view>
    </view>

    <!-- Toast 提示 -->
    <view v-if="toast.show" class="toast" :class="toast.type">
      <text>{{ toast.message }}</text>
    </view>
  </view>
</template>

<script>
import wxMiniService from '@/services/wxMiniService.js'

export default {
  data() {
    return {
      isLoggedIn: false,
      isLoading: false,
      session: null,
      bindAccount: '',
      bindPassword: '',
      errorMsg: '',
      toast: {
        show: false,
        message: '',
        type: 'info'
      }
    }
  },

  computed: {
    bindStatusClass() {
      const status = this.session?.bind_status
      return {
        new: 'status-new',
        bound: 'status-bound',
        existing: 'status-existing'
      }[status] || 'status-new'
    },

    bindStatusText() {
      const status = this.session?.bind_status
      return {
        new: '未绑定账号',
        bound: '已绑定账号',
        existing: '已有账号'
      }[status] || '未知状态'
    },

    memberLevelText() {
      const level = this.session?.member_level || 0
      return ['', '季度会员', '年度会员'][level] || '普通用户'
    }
  },

  onLoad() {
    this.checkLoginStatus()
  },

  methods: {
    /**
     * 检查登录状态
     */
    checkLoginStatus() {
      const session = wxMiniService.checkLoginStatus()
      if (session) {
        this.session = session
        this.isLoggedIn = true
      }
    },

    /**
     * 微信登录
     */
    async handleWxLogin() {
      if (this.isLoading) return

      this.isLoading = true
      this.errorMsg = ''

      try {
        const session = await wxMiniService.wxLogin()
        this.session = session
        this.isLoggedIn = true
        this.showToast('登录成功', 'success')
      } catch (err) {
        this.errorMsg = err.errMsg || '登录失败，请重试'
        this.showToast(this.errorMsg, 'error')
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 绑定已有账号
     */
    async handleBindAccount() {
      if (!this.bindAccount || !this.bindPassword) {
        this.showToast('请填写账号和密码', 'warning')
        return
      }

      try {
        const result = await wxMiniService.bindExistingAccount(
          this.bindAccount,
          this.bindPassword
        )
        if (result.success) {
          this.session.bind_status = 'bound'
          this.session.account = this.bindAccount
          this.showToast('绑定成功', 'success')
        }
      } catch (err) {
        this.showToast('绑定失败', 'error')
      }
    },

    /**
     * 退出登录
     */
    handleLogout() {
      wxMiniService.logout()
      this.session = null
      this.isLoggedIn = false
      this.bindAccount = ''
      this.bindPassword = ''
      this.showToast('已退出登录', 'info')
    },

    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack()
    },

    /**
     * 进入首页
     */
    goToHome() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    },

    /**
     * 手机号登录
     */
    goToPhoneLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      })
    },

    /**
     * 注册账号
     */
    goToRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
      })
    },

    /**
     * 打开隐私政策
     */
    openPrivacy() {
      uni.navigateTo({
        url: '/pages/settings/privacy'
      })
    },

    /**
     * 打开用户协议
     */
    openTerms() {
      uni.navigateTo({
        url: '/pages/settings/terms'
      })
    },

    /**
     * 显示 Toast
     */
    showToast(message, type = 'info') {
      this.toast = {
        show: true,
        message,
        type
      }
      setTimeout(() => {
        this.toast.show = false
      }, 2000)
    }
  }
}
</script>

<style scoped>
.wx-login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 300rpx;
  height: 300rpx;
  top: -100rpx;
  right: -50rpx;
}

.circle-2 {
  width: 200rpx;
  height: 200rpx;
  top: 400rpx;
  left: -80rpx;
}

.circle-3 {
  width: 150rpx;
  height: 150rpx;
  bottom: 200rpx;
  right: 50rpx;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  padding-top: calc(var(--status-bar-height) + 20rpx);
}

.back-btn,
.placeholder {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn .icon {
  font-size: 40rpx;
  color: #fff;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
}

.placeholder {
  visibility: hidden;
}

/* Logo 区域 */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.logo-wrapper {
  width: 160rpx;
  height: 160rpx;
  background: #fff;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
}

.logo-icon {
  font-size: 80rpx;
}

.app-name {
  font-size: 44rpx;
  font-weight: 700;
  color: #fff;
  margin-top: 30rpx;
}

.app-slogan {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 12rpx;
}

/* 登录区域 */
.login-section {
  padding: 0 40rpx;
}

.privacy-notice {
  display: flex;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 40rpx;
}

.notice-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  display: block;
}

.notice-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
  display: block;
}

.notice-links {
  display: flex;
  gap: 20rpx;
  margin-top: 8rpx;
}

.link {
  font-size: 24rpx;
  color: #ffd700;
}

.wx-auth-btn {
  width: 100%;
  height: 96rpx;
  background: #07c160;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  margin-bottom: 40rpx;
}

.wx-auth-btn.loading {
  background: #a0d9b4;
}

.wx-icon {
  font-size: 32rpx;
  color: #fff;
  margin-right: 12rpx;
}

.btn-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 其他登录方式 */
.other-login {
  margin-top: 20rpx;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: rgba(255, 255, 255, 0.3);
}

.divider-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  padding: 0 20rpx;
}

.other-methods {
  display: flex;
  justify-content: center;
  gap: 60rpx;
}

.method-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.method-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.method-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 已登录状态 */
.logged-in-section {
  padding: 0 40rpx;
}

.user-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.user-details {
  flex: 1;
}

.nickname {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.bind-status {
  margin-top: 10rpx;
}

.status-badge {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  background: #f0f0f0;
  color: #666;
}

.status-badge.status-new {
  background: #fff3e0;
  color: #ff9800;
}

.status-badge.status-bound {
  background: #e8f5e9;
  color: #4caf50;
}

.user-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #f0f0f0;
}

/* 绑定账号 */
.bind-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 24rpx;
}

.bind-form {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.bind-input {
  height: 88rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.bind-btn {
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.bind-btn text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
}

/* 操作按钮 */
.action-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-btn {
  height: 96rpx;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.action-btn .btn-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.action-btn text {
  font-size: 32rpx;
  font-weight: 600;
}

.primary-btn {
  background: #fff;
}

.primary-btn text {
  color: #333;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
}

.logout-btn text {
  color: #fff;
}

/* 错误提示 */
.error-tip {
  text-align: center;
  padding: 20rpx;
  background: rgba(255, 0, 0, 0.1);
  border-radius: 12rpx;
  margin-top: 20rpx;
}

.error-tip text {
  font-size: 26rpx;
  color: #ff6b6b;
}

/* Toast */
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 24rpx 48rpx;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 12rpx;
  z-index: 9999;
}

.toast text {
  font-size: 28rpx;
  color: #fff;
}

.toast.success {
  background: rgba(76, 175, 80, 0.9);
}

.toast.error {
  background: rgba(244, 67, 54, 0.9);
}

.toast.warning {
  background: rgba(255, 152, 0, 0.9);
}
</style>
