<template>
  <view class="pen-pals-page">
    <!-- 头部 -->
    <view class="header-card">
      <view class="header-left">
        <text class="penpal-icon">✉️</text>
        <view class="header-info">
          <text class="title">国际笔友</text>
          <text class="subtitle">与世界各国小朋友交流</text>
        </view>
      </view>
      <view class="stats-badge">
        <text class="stats-num">{{ penPalsCount }}</text>
        <text class="stats-label">笔友</text>
      </view>
    </view>

    <!-- 我的笔友 -->
    <view class="section" v-if="penPals.length > 0">
      <view class="section-header">
        <text class="section-title">我的笔友</text>
      </view>
      <view class="penpals-list">
        <view
          class="penpal-card"
          v-for="pal in penPals"
          :key="pal.id"
          @click="openChat(pal)"
        >
          <view class="pal-avatar">
            <text class="avatar-emoji">{{ getCountryEmoji(pal.country) }}</text>
          </view>
          <view class="pal-info">
            <view class="pal-header">
              <text class="pal-name">{{ pal.name }}</text>
              <text class="pal-country">{{ pal.country }}</text>
            </view>
            <text class="pal-interests">{{ pal.interests.join('、') }}</text>
            <text class="pal-messages">{{ pal.totalLetters }}封信件</text>
          </view>
          <view class="chat-btn">
            <text>聊天</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 推荐笔友 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">推荐笔友</text>
        <text class="section-subtitle">寻找新朋友</text>
      </view>
      <view class="recommended-list">
        <view
          class="recommended-card"
          v-for="pal in recommendedPenPals"
          :key="pal.id"
        >
          <view class="rec-avatar">
            <text class="avatar-emoji">{{ getCountryEmoji(pal.country) }}</text>
          </view>
          <view class="rec-info">
            <text class="rec-name">{{ pal.name }}</text>
            <text class="rec-country">{{ pal.country }} · {{ pal.age }}岁</text>
            <text class="rec-interests">{{ pal.interests.join('、') }}</text>
          </view>
          <button class="add-btn" @click="addPenPal(pal.id)">添加</button>
        </view>
      </view>
      <view class="empty-tip" v-if="recommendedPenPals.length === 0">
        <text>暂无推荐笔友</text>
      </view>
    </view>

    <!-- 语言能力 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">我的语言能力</text>
      </view>
      <view class="languages-grid">
        <view
          class="language-card"
          v-for="lang in languages"
          :key="lang.id"
        >
          <text class="lang-name">{{ lang.language }}</text>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: lang.progress + '%' }"></view>
          </view>
          <text class="progress-text">{{ lang.progress }}%</text>
        </view>
      </view>
    </view>

    <!-- 聊天弹窗 -->
    <uni-popup ref="chatPopup" type="right">
      <view class="chat-popup" v-if="selectedPal">
        <view class="chat-header">
          <view class="chat-user">
            <text class="chat-avatar">{{ getCountryEmoji(selectedPal.country) }}</text>
            <view class="chat-user-info">
              <text class="chat-name">{{ selectedPal.name }}</text>
              <text class="chat-country">{{ selectedPal.country }}</text>
            </view>
          </view>
          <view class="close-btn" @click="closeChat">
            <text>✕</text>
          </view>
        </view>

        <scroll-view class="chat-messages" scroll-y>
          <view
            class="message-item"
            :class="{ 'from-me': msg.from === 'me' }"
            v-for="msg in selectedPal.messages"
            :key="msg.id"
          >
            <text class="message-content">{{ msg.content }}</text>
            <text class="message-time">{{ formatTime(msg.time) }}</text>
          </view>
          <view class="empty-messages" v-if="selectedPal.messages.length === 0">
            <text>还没有信件，开始写信吧！</text>
          </view>
        </scroll-view>

        <view class="chat-input">
          <input
            type="text"
            v-model="newMessage"
            placeholder="写信..."
            class="message-input"
          />
          <button class="send-btn" @click="sendMessage">发送</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGeographyStore } from '@/stores/geographyStore.js'

const geographyStore = useGeographyStore()

const selectedPal = ref(null)
const newMessage = ref('')
const chatPopup = ref(null)

const penPals = computed(() => geographyStore.penPals)
const penPalsCount = computed(() => geographyStore.penPalsCount)
const recommendedPenPals = computed(() => geographyStore.recommendedPenPals)
const languages = computed(() => geographyStore.languages)

const getCountryEmoji = (country) => {
  const map = {
    '英国': '🇬🇧',
    '日本': '🇯🇵',
    '法国': '🇫🇷',
    '西班牙': '🇪🇸',
    '德国': '🇩🇪'
  }
  return map[country] || '🌍'
}

const addPenPal = (templateId) => {
  geographyStore.addPenPal(templateId)
  uni.showToast({ title: '添加成功', icon: 'success' })
}

const openChat = (pal) => {
  selectedPal.value = pal
  chatPopup.value.open()
}

const closeChat = () => {
  chatPopup.value.close()
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  geographyStore.sendLetter(selectedPal.value.id, newMessage.value)
  selectedPal.value.messages.push({
    id: `letter-${Date.now()}`,
    from: 'me',
    content: newMessage.value,
    time: new Date().toISOString(),
    read: true
  })
  newMessage.value = ''
}

const formatTime = (time) => {
  const date = new Date(time)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

onMounted(() => {
  geographyStore.init()
})
</script>

<style scoped>
.pen-pals-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header-card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.header-left {
  display: flex;
  align-items: center;
}

.penpal-icon {
  font-size: 64rpx;
  margin-right: 20rpx;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
}

.subtitle {
  font-size: 26rpx;
  opacity: 0.9;
  margin-top: 4rpx;
}

.stats-badge {
  background: rgba(255,255,255,0.2);
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  text-align: center;
}

.stats-num {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}

.stats-label {
  font-size: 24rpx;
  opacity: 0.9;
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-subtitle {
  font-size: 24rpx;
  color: #999;
}

.penpals-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.penpal-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  gap: 16rpx;
}

.pal-avatar {
  width: 80rpx;
  height: 80rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-emoji {
  font-size: 48rpx;
}

.pal-info {
  flex: 1;
}

.pal-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.pal-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.pal-country {
  font-size: 24rpx;
  color: #00f2fe;
}

.pal-interests {
  font-size: 24rpx;
  color: #666;
  margin-top: 4rpx;
  display: block;
}

.pal-messages {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
  display: block;
}

.chat-btn {
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
  border-radius: 24rpx;
  font-size: 26rpx;
}

.recommended-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.recommended-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  gap: 16rpx;
}

.rec-avatar {
  width: 80rpx;
  height: 80rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rec-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.rec-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.rec-country {
  font-size: 24rpx;
  color: #00f2fe;
  margin-top: 4rpx;
}

.rec-interests {
  font-size: 24rpx;
  color: #666;
  margin-top: 4rpx;
}

.add-btn {
  padding: 12rpx 24rpx;
  background: #4facfe;
  color: #fff;
  border-radius: 24rpx;
  font-size: 26rpx;
  border: none;
}

.languages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.language-card {
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lang-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.progress-bar {
  width: 100%;
  height: 12rpx;
  background: #e0e0e0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 6rpx;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
}

.empty-tip {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}

/* 聊天弹窗 */
.chat-popup {
  width: 100vw;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.chat-user {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.chat-avatar {
  font-size: 48rpx;
}

.chat-user-info {
  display: flex;
  flex-direction: column;
}

.chat-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.chat-country {
  font-size: 24rpx;
  color: #00f2fe;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #666;
}

.chat-messages {
  flex: 1;
  padding: 20rpx;
}

.message-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 20rpx;
  max-width: 80%;
}

.message-item.from-me {
  align-items: flex-end;
  align-self: flex-end;
}

.message-content {
  padding: 16rpx 20rpx;
  background: #f0f0f0;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #333;
}

.message-item.from-me .message-content {
  background: #4facfe;
  color: #fff;
}

.message-time {
  font-size: 20rpx;
  color: #999;
  margin-top: 8rpx;
}

.empty-messages {
  text-align: center;
  padding: 100rpx;
  color: #999;
  font-size: 28rpx;
}

.chat-input {
  display: flex;
  gap: 16rpx;
  padding: 20rpx;
  border-top: 1rpx solid #eee;
}

.message-input {
  flex: 1;
  padding: 16rpx 20rpx;
  background: #f5f5f5;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.send-btn {
  padding: 16rpx 32rpx;
  background: #4facfe;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}
</style>
