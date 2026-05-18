<template>
  <view class="add-friend-page">
    <view class="header">
      <text class="page-title">添加同伴</text>
    </view>

    <view class="tab-section">
      <view class="tab" :class="{ active: activeTab === 'invite' }" @click="activeTab = 'invite'">
        生成邀请码
      </view>
      <view class="tab" :class="{ active: activeTab === 'join' }" @click="activeTab = 'join'">
        输入邀请码
      </view>
    </view>

    <view class="content-section">
      <!-- 生成邀请码 -->
      <view v-if="activeTab === 'invite'" class="invite-section">
        <view class="invite-code-card">
          <text class="invite-label">您的邀请码</text>
          <text class="invite-code">{{ inviteCode }}</text>
          <text class="invite-hint">分享给好友，让他们输入此码添加你</text>
        </view>

        <view class="my-info">
          <text class="info-label">您的信息</text>
          <view class="info-card">
            <text class="emoji">{{ myEmoji }}</text>
            <text class="name">{{ babyStore.currentBabyName }}</text>
            <text class="points">积分: {{ pointsStore.currentBabyPoints }}</text>
          </view>
        </view>

        <button class="copy-btn" @click="copyInviteCode">复制邀请码</button>
      </view>

      <!-- 输入邀请码 -->
      <view v-if="activeTab === 'join'" class="join-section">
        <view class="input-card">
          <text class="input-label">输入好友的邀请码</text>
          <input
            type="text"
            v-model="inputCode"
            class="code-input"
            maxlength="6"
            placeholder="请输入6位邀请码"
            @input="onCodeInput"
          />
          <text class="input-hint">邀请码为6位字母数字组合</text>
        </view>

        <view class="friend-preview" v-if="foundFriend">
          <text class="preview-label">找到好友</text>
          <view class="preview-card">
            <text class="emoji">{{ foundFriendEmoji }}</text>
            <text class="name">{{ foundFriend.name }}</text>
            <text class="points">积分: {{ foundFriendPoints }}分</text>
          </view>
        </view>

        <button class="add-btn" @click="sendFriendRequest" :disabled="!canAdd">添加好友</button>
      </view>
    </view>

    <view class="tips-section">
      <text class="tips-title">温馨提示</text>
      <text class="tip-item">• 每日赠送积分限额50分</text>
      <text class="tip-item">• 可以向好友发起成长PK挑战</text>
      <text class="tip-item">• 组队任务需要2-4人共同完成</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFriendStore } from '@/stores/friendStore'
import { useBabyStore } from '@/stores/babyStore'
import { usePointsStore } from '@/stores/pointsStore'

const friendStore = useFriendStore()
const babyStore = useBabyStore()
const pointsStore = usePointsStore()

const activeTab = ref('invite')
const inviteCode = ref('')
const inputCode = ref('')
const foundFriend = ref(null)

const myEmoji = computed(() => {
  const emojis = ['👶', '👼', '🧒', '👦', '👧']
  const id = babyStore.currentBabyId
  const index = id ? id.charCodeAt(0) % 5 : 0
  return emojis[index]
})

const foundFriendEmoji = computed(() => {
  if (!foundFriend.value) return '👶'
  const emojis = ['👶', '👼', '🧒', '👦', '👧']
  const index = foundFriend.value.id.charCodeAt(0) % 5
  return emojis[index]
})

const foundFriendPoints = computed(() => {
  if (!foundFriend.value) return 0
  return pointsStore.getBabyPoints(foundFriend.value.id)
})

const canAdd = computed(() => {
  return inputCode.value.length === 6 && foundFriend.value
})

const onCodeInput = () => {
  const code = inputCode.value.toUpperCase()
  inputCode.value = code
  // 模拟查找好友，实际应该通过服务器或本地数据库查找
  // 这里简单模拟：如果输入的是 INVITE 则找到当前用户作为好友（仅供测试）
  if (code.length === 6) {
    const mockFriend = babyStore.babies.find(b => b.id !== babyStore.currentBabyId)
    if (mockFriend) {
      foundFriend.value = mockFriend
    } else {
      foundFriend.value = null
    }
  } else {
    foundFriend.value = null
  }
}

const copyInviteCode = () => {
  uni.setClipboardData({
    data: inviteCode.value,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' })
    }
  })
}

const sendFriendRequest = async () => {
  if (!canAdd.value) return

  const result = await friendStore.addFriend(foundFriend.value.id, 'pending')
  if (result) {
    uni.showToast({ title: '已发送邀请', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } else {
    uni.showToast({ title: '添加失败', icon: 'none' })
  }
}

onMounted(() => {
  friendStore.init()
  // 生成邀请码（实际应该关联到用户ID）
  inviteCode.value = friendStore.generateInviteCode()
})
</script>

<style scoped>
.add-friend-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
}

.header {
  margin-bottom: 24rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
}

.tab-section {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  font-size: 28rpx;
  color: #666;
  border-radius: 12rpx;
}

.tab.active {
  background: #8477fa;
  color: #fff;
}

.content-section {
  margin-bottom: 32rpx;
}

.invite-section {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.invite-code-card {
  background: linear-gradient(135deg, #8477fa 0%, #a599fa 100%);
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  text-align: center;
  color: #fff;
}

.invite-label {
  font-size: 28rpx;
  opacity: 0.9;
  display: block;
  margin-bottom: 16rpx;
}

.invite-code {
  font-size: 64rpx;
  font-weight: 700;
  letter-spacing: 8rpx;
  display: block;
  margin-bottom: 16rpx;
}

.invite-hint {
  font-size: 24rpx;
  opacity: 0.8;
}

.my-info {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.info-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.emoji {
  font-size: 60rpx;
}

.name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.points {
  font-size: 26rpx;
  color: #8477fa;
}

.copy-btn {
  height: 88rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
}

.join-section {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.input-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
}

.input-label {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.code-input {
  width: 100%;
  height: 88rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 36rpx;
  text-align: center;
  letter-spacing: 8rpx;
}

.input-hint {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-top: 12rpx;
  text-align: center;
}

.friend-preview {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.preview-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.preview-card .name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.add-btn {
  height: 88rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
}

.add-btn[disabled] {
  background: #ccc;
  color: #fff;
}

.tips-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.tips-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.tip-item {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}
</style>
