<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <text class="nav-title">欢迎使用</text>
      <view class="nav-right"></view>
    </view>

    <view class="content">
      <!-- 欢迎信息 -->
      <view class="welcome-section">
        <text class="welcome-icon">👨‍👩‍👧‍👦</text>
        <text class="welcome-title">创建您的家庭</text>
        <text class="welcome-desc">邀请家人一起参与育儿任务管理</text>
      </view>

      <!-- 角色选择 -->
      <view class="input-section">
        <text class="section-title">选择您的角色</text>
        <view class="role-grid">
          <view 
            v-for="(roleInfo, roleKey) in FAMILY_ROLES" 
            :key="roleKey"
            class="role-item"
            :class="{ active: selectedRole === roleKey }"
            @tap="selectRole(roleKey)"
          >
            <text class="role-icon">{{ roleInfo.icon }}</text>
            <text class="role-label">{{ roleInfo.label }}</text>
          </view>
        </view>
      </view>

      <!-- 昵称输入 -->
      <view class="input-section">
        <text class="section-title">您的昵称</text>
        <view class="nickname-input-box">
          <input 
            class="nickname-input" 
            v-model="nickname" 
            maxlength="20"
            placeholder="请输入您的昵称"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <!-- 确认按钮 -->
      <button 
        class="confirm-btn" 
        :disabled="!canConfirm"
        @tap="handleCreate"
      >
        创建家庭
      </button>

      <!-- 已有家庭入口 -->
      <view class="join-section">
        <text class="join-text">已有家庭？</text>
        <text class="join-btn" @tap="goToJoin">加入家庭</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FAMILY_ROLES, initFamily } from '@/services/familyService'

const selectedRole = ref('')
const nickname = ref('')

const canConfirm = computed(() => {
  return selectedRole.value && nickname.value.trim().length > 0
})

const selectRole = (role) => {
  selectedRole.value = role
}

const handleCreate = () => {
  if (!canConfirm.value) return
  
  try {
    initFamily(nickname.value.trim(), selectedRole.value)
    uni.showToast({ title: '创建成功', icon: 'success' })
    
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}

const goToJoin = () => {
  uni.navigateTo({ url: '/pages/family/invite-join' })
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.nav-right { width: 60px; }

.content {
  padding: 40px 24px 24px;
}

.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.welcome-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.welcome-desc {
  font-size: 14px;
  color: #666;
}

.input-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: block;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.role-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  background: #fff;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.role-item.active {
  border-color: #667eea;
  background: #667eea10;
}

.role-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.role-label {
  font-size: 12px;
  color: #666;
}

.role-item.active .role-label {
  color: #667eea;
  font-weight: 600;
}

.nickname-input-box {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.nickname-input {
  font-size: 15px;
  color: #333;
}

.input-placeholder {
  color: #ccc;
}

.confirm-btn {
  width: 100%;
  height: 48px;
  line-height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  margin-top: 16px;
}

.confirm-btn[disabled] {
  background: #ddd;
  color: #999;
}

.join-section {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.join-text {
  font-size: 14px;
  color: #666;
}

.join-btn {
  font-size: 14px;
  color: #667eea;
  margin-left: 8px;
}
</style>
