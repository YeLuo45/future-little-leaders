<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">家庭成员</text>
      <view class="nav-right">
        <text class="share-text" @tap="showInviteModal = true">邀请</text>
      </view>
    </view>

    <scroll-view scroll-y class="content">
      <!-- 成员列表 -->
      <view class="member-list" v-if="members.length > 0">
        <view 
          v-for="member in members" 
          :key="member.id"
          class="member-card"
        >
          <view class="member-main">
            <view class="avatar-wrapper">
              <image 
                class="member-avatar" 
                :src="member.avatar || '/static/avatar.svg'" 
                mode="aspectFill"
              />
              <view class="role-badge" :style="{ backgroundColor: getRoleInfo(member.role).color }">
                <text class="role-icon">{{ getRoleInfo(member.role).icon }}</text>
              </view>
            </view>
            <view class="member-info">
              <view class="member-header">
                <text class="member-name">{{ member.nickname }}</text>
                <view class="role-tag" :style="{ backgroundColor: getRoleInfo(member.role).color + '20', color: getRoleInfo(member.role).color }">
                  <text class="role-label">{{ getRoleInfo(member.role).label }}</text>
                </view>
                <text class="owner-badge" v-if="member.isOwner">户主</text>
              </view>
              <text class="member-date">加入于 {{ formatDate(member.createdAt) }}</text>
            </view>
          </view>
          
          <!-- 非当前成员且是户主可操作 -->
          <view class="member-actions" v-if="member.id !== currentMemberId && isOwnerMember">
            <text class="action-btn" @tap="showRemoveConfirm(member)">移除</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-view">
        <text class="empty-icon">👨‍👩‍👧‍👦</text>
        <text class="empty-text">暂无家庭成员</text>
      </view>
    </scroll-view>

    <!-- 邀请码弹窗 -->
    <view class="modal-mask" v-if="showInviteModal" @tap="showInviteModal = false">
      <view class="invite-modal" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">邀请家庭成员</text>
          <text class="modal-close" @tap="showInviteModal = false">×</text>
        </view>
        <view class="modal-body">
          <text class="invite-desc">将此邀请码发送给家人</text>
          <view class="invite-code-box">
            <text class="invite-code">{{ inviteCode }}</text>
          </view>
          <text class="invite-hint">邀请码有效期为一次性使用</text>
          <button class="copy-btn" @tap="copyInviteCode">复制邀请码</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  getFamilyMembers, 
  getCurrentMemberId,
  getRoleInfo,
  generateInvite,
  isOwner
} from '@/services/familyService'

const members = ref([])
const currentMemberId = ref('')
const isOwnerMember = ref(false)
const showInviteModal = ref(false)
const inviteCode = ref('')

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 加载成员列表
const loadMembers = () => {
  members.value = getFamilyMembers()
  currentMemberId.value = getCurrentMemberId()
  isOwnerMember.value = isOwner()
}

// 生成邀请码
const handleGenerateInvite = () => {
  try {
    inviteCode.value = generateInvite()
    showInviteModal.value = true
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}

// 复制邀请码
const copyInviteCode = () => {
  uni.setClipboardData({
    data: inviteCode.value,
    success: () => {
      uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
    }
  })
}

// 显示移除确认
const showRemoveConfirm = (member) => {
  uni.showModal({
    title: '移除成员',
    content: `确定移除成员"${member.nickname}"吗？`,
    success: (res) => {
      if (res.confirm) {
        // TODO: 实现移除成员逻辑
        uni.showToast({ title: '移除成功', icon: 'success' })
        loadMembers()
      }
    }
  })
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  loadMembers()
  
  // 如果是户主，自动生成邀请码
  if (isOwnerMember.value) {
    handleGenerateInvite()
  }
  
  // 监听成员更新
  uni.$on('familyMembersUpdated', loadMembers)
})

import { onUnmounted } from 'vue'
onUnmounted(() => {
  uni.$off('familyMembersUpdated', loadMembers)
})
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
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left { width: 60px; }
.back-icon { font-size: 20px; color: #333; }

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.nav-right { width: 60px; text-align: right; }
.share-text { font-size: 14px; color: #007aff; }

.content {
  height: calc(100vh - 44px);
  padding: 16px;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.member-main {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  margin-right: 12px;
}

.member-avatar {
  width: 56px;
  height: 56px;
  border-radius: 28px;
}

.role-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 22px;
  height: 22px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.role-icon { font-size: 12px; }

.member-info { flex: 1; }

.member-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.member-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-right: 8px;
}

.role-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  margin-right: 6px;
}

.owner-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
}

.member-date {
  font-size: 12px;
  color: #999;
}

.member-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
}

.action-btn {
  color: #ff4d4f;
  font-size: 14px;
}

.empty-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-icon { font-size: 60px; margin-bottom: 16px; }
.empty-text { font-size: 16px; color: #666; }

/* 邀请码弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.invite-modal {
  width: 300px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 24px;
  color: #999;
  line-height: 1;
}

.modal-body {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.invite-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.invite-code-box {
  background: #f8f8f8;
  padding: 16px 32px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.invite-code {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #333;
}

.invite-hint {
  font-size: 12px;
  color: #999;
  margin-bottom: 20px;
}

.copy-btn {
  width: 100%;
  height: 44px;
  line-height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 22px;
  font-size: 15px;
  border: none;
}
</style>
