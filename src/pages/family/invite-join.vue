<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">加入家庭</text>
      <view class="nav-right"></view>
    </view>

    <view class="content">
      <!-- 邀请码输入 -->
      <view class="input-section">
        <text class="section-title">输入邀请码</text>
        <view class="code-input-box">
          <input 
            class="code-input" 
            v-model="inviteCode" 
            maxlength="6" 
            placeholder="请输入6位邀请码"
            placeholder-class="input-placeholder"
            @input="onCodeInput"
          />
        </view>
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
            placeholder="请输入昵称"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <!-- 确认按钮 -->
      <button 
        class="confirm-btn" 
        :disabled="!canJoin"
        @tap="handleJoin"
      >
        加入家庭
      </button>

      <!-- 提示 -->
      <view class="tip-section">
        <text class="tip-text">加入后您可以参与家庭共享任务的管理</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FAMILY_ROLES, joinFamily } from '@/services/familyService'

const inviteCode = ref('')
const selectedRole = ref('')
const nickname = ref('')

const canJoin = computed(() => {
  return inviteCode.value.length === 6 && selectedRole.value && nickname.value.trim().length > 0
})

const onCodeInput = (e) => {
  // 强制大写
  inviteCode.value = e.detail.value.toUpperCase()
}

const selectRole = (role) => {
  selectedRole.value = role
}

const handleJoin = () => {
  if (!canJoin.value) return
  
  try {
    const member = joinFamily(inviteCode.value, nickname.value.trim(), selectedRole.value)
    uni.showToast({ title: '加入成功', icon: 'success' })
    
    // 触发事件刷新
    setTimeout(() => {
      uni.$emit('familyMembersUpdated')
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}

const goBack = () => {
  uni.navigateBack()
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

.nav-left { width: 60px; }
.back-icon { font-size: 20px; color: #333; }

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.nav-right { width: 60px; }

.content {
  padding: 24px 16px;
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

.code-input-box {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.code-input {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 6px;
  text-align: center;
  color: #333;
}

.input-placeholder {
  color: #ccc;
  font-size: 14px;
  letter-spacing: normal;
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

.tip-section {
  margin-top: 24px;
  text-align: center;
}

.tip-text {
  font-size: 12px;
  color: #999;
}
</style>
