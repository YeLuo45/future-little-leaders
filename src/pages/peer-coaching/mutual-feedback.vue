<template>
  <view class="mutual-feedback-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>互评反馈</text>
      </view>
      <view class="header-right">
        <text class="icon">⭐</text>
      </view>
    </view>

    <!-- 反馈统计 -->
    <view class="stats-overview">
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ feedbackStats.sentCount || 0 }}</text>
          <text class="stat-label">我发出的</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ feedbackStats.receivedCount || 0 }}</text>
          <text class="stat-label">收到的</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ feedbackStats.avgRating || 0 }}</text>
          <text class="stat-label">平均评分</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ feedbackStats.encouragementCount || 0 }}</text>
          <text class="stat-label">鼓励留言</text>
        </view>
      </view>
    </view>

    <!-- 标签切换 -->
    <view class="tabs">
      <view 
        class="tab" 
        :class="{ active: currentTab === 'received' }"
        @click="currentTab = 'received'"
      >
        <text>收到的反馈</text>
        <view class="tab-badge" v-if="feedbackStats.receivedCount > 0">{{ feedbackStats.receivedCount }}</view>
      </view>
      <view 
        class="tab" 
        :class="{ active: currentTab === 'sent' }"
        @click="currentTab = 'sent'"
      >
        <text>我发出的</text>
      </view>
    </view>

    <!-- 反馈列表 -->
    <view class="feedback-list">
      <view 
        class="feedback-item" 
        v-for="feedback in displayedFeedbacks" 
        :key="feedback.id"
      >
        <view class="feedback-header">
          <view class="author-info">
            <text class="author-avatar">{{ feedback.fromAvatar }}</text>
            <view class="author-details">
              <text class="author-name">{{ feedback.fromName }}</text>
              <view class="feedback-type" :class="feedback.type">
                {{ getTypeLabel(feedback.type) }}
              </view>
            </view>
          </view>
          <view class="rating" v-if="feedback.rating">
            <text class="star" v-for="i in 5" :key="i" :class="{ filled: i <= feedback.rating }">★</text>
          </view>
        </view>
        <view class="feedback-content">
          <text>{{ feedback.content }}</text>
        </view>
        <view class="feedback-footer">
          <text class="feedback-time">{{ formatDate(feedback.createdAt) }}</text>
          <button class="reply-btn" @click="showReplyModal(feedback)" v-if="currentTab === 'received'">
            回复鼓励
          </button>
        </view>
      </view>

      <view class="empty-tip" v-if="displayedFeedbacks.length === 0">
        <text>{{ currentTab === 'received' ? '暂无收到的反馈' : '你还没有发出反馈' }}</text>
      </view>
    </view>

    <!-- 发送反馈按钮 -->
    <view class="fab" @click="showSendModal = true">
      <text class="fab-icon">✉️</text>
    </view>

    <!-- 发送反馈弹窗 -->
    <view class="modal" v-if="showSendModal" @click="showSendModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">发送反馈</text>
          <text class="modal-close" @click="showSendModal = false">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">反馈类型</text>
            <view class="type-selector">
              <view 
                class="type-option" 
                :class="{ selected: sendForm.type === 'progress' }"
                @click="sendForm.type = 'progress'"
              >
                <text class="type-icon">📈</text>
                <text class="type-name">学习进度</text>
              </view>
              <view 
                class="type-option" 
                :class="{ selected: sendForm.type === 'encouragement' }"
                @click="sendForm.type = 'encouragement'"
              >
                <text class="type-icon">💪</text>
                <text class="type-name">鼓励留言</text>
              </view>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">评分</text>
            <view class="rating-selector">
              <text 
                class="star" 
                v-for="i in 5" 
                :key="i"
                :class="{ filled: i <= sendForm.rating }"
                @click="sendForm.rating = i"
              >★</text>
              <text class="rating-text">{{ sendForm.rating }} 星</text>
            </view>
          </view>

          <view class="form-item">
            <text class="form-label">反馈内容</text>
            <textarea 
              class="form-textarea" 
              v-model="sendForm.content" 
              :placeholder="getPlaceholder()"
              maxlength="200"
            />
            <text class="char-count">{{ sendForm.content.length }}/200</text>
          </view>

          <!-- 快捷短语 -->
          <view class="quick-phrases">
            <text class="quick-phrases-title">快捷短语：</text>
            <view class="phrases-list">
              <text 
                class="phrase-tag" 
                v-for="phrase in quickPhrases" 
                :key="phrase"
                @click="appendPhrase(phrase)"
              >
                {{ phrase }}
              </text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-secondary" @click="showSendModal = false">取消</button>
          <button class="btn-primary" @click="sendFeedback">发送</button>
        </view>
      </view>
    </view>

    <!-- 回复鼓励弹窗 -->
    <view class="modal" v-if="showReplyModal" @click="closeReplyModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">回复鼓励</text>
          <text class="modal-close" @click="closeReplyModal">×</text>
        </view>
        <view class="modal-body">
          <view class="reply-to">
            <text class="reply-label">回复给：</text>
            <text class="reply-author">{{ replyingTo?.fromName }}</text>
          </view>
          <view class="form-item">
            <text class="form-label">鼓励内容</text>
            <textarea 
              class="form-textarea" 
              v-model="replyForm.content" 
              placeholder="写下你的鼓励和感谢..."
              maxlength="200"
            />
          </view>
          <view class="quick-phrases">
            <text class="quick-phrases-title">快捷短语：</text>
            <view class="phrases-list">
              <text 
                class="phrase-tag" 
                v-for="phrase in encouragementPhrases" 
                :key="phrase"
                @click="replyForm.content = phrase"
              >
                {{ phrase }}
              </text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-secondary" @click="closeReplyModal">取消</button>
          <button class="btn-primary" @click="sendReply">发送</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePeerCoachingStore } from '@/stores/peerCoachingStore.js'
import peerCoachingService, { FEEDBACK_TYPE } from '@/services/peerCoachingService.js'

const peerCoachingStore = usePeerCoachingStore()

// 状态
const currentTab = ref('received')
const showSendModal = ref(false)
const showReplyModalFlag = ref(false)
const replyingTo = ref(null)

// 发送表单
const sendForm = ref({
  type: 'progress',
  rating: 5,
  content: ''
})

// 回复表单
const replyForm = ref({
  content: ''
})

// 快捷短语
const quickPhrases = [
  '今天的任务完成得很棒！',
  '继续保持这个学习节奏',
  '进步很大，加油！',
  '你的学习方法很有效',
  '一起努力，共同进步'
]

const encouragementPhrases = [
  '感谢你的鼓励！',
  '我们一起加油！',
  '有你的支持真好',
  '一起进步！',
  '谢谢你的反馈！'
]

// 页面加载
onMounted(() => {
  peerCoachingStore.init()
  peerCoachingStore.loadFeedbacks()
})

// 计算属性
const feedbackStats = computed(() => peerCoachingStore.feedbackStats)

const displayedFeedbacks = computed(() => {
  if (currentTab.value === 'received') {
    return peerCoachingStore.buddyFeedbacks
  }
  return peerCoachingStore.myFeedbacks
})

const showReplyModal = computed({
  get: () => showReplyModalFlag.value,
  set: (val) => { showReplyModalFlag.value = val }
})

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 获取反馈类型标签
const getTypeLabel = (type) => {
  return type === FEEDBACK_TYPE.PROGRESS ? '学习进度' : '鼓励留言'
}

// 获取占位提示
const getPlaceholder = () => {
  if (sendForm.value.type === FEEDBACK_TYPE.PROGRESS) {
    return '描述伙伴的学习表现、进度和成果...'
  }
  return '写下你对伙伴的鼓励和支持...'
}

// 格式化日期
const formatDate = (dateStr) => {
  return peerCoachingStore.formatDate(dateStr)
}

// 追加短语
const appendPhrase = (phrase) => {
  if (sendForm.value.content) {
    sendForm.value.content += ' ' + phrase
  } else {
    sendForm.value.content = phrase
  }
}

// 显示回复弹窗
const showReplyModalFn = (feedback) => {
  replyingTo.value = feedback
  showReplyModalFlag.value = true
}

// 关闭回复弹窗
const closeReplyModal = () => {
  showReplyModalFlag.value = false
  replyingTo.value = null
  replyForm.value.content = ''
}

// 发送反馈
const sendFeedback = () => {
  if (!sendForm.value.content.trim()) {
    uni.showToast({ title: '请输入反馈内容', icon: 'none' })
    return
  }
  
  const buddyMatch = peerCoachingStore.buddyMatch
  if (!buddyMatch || !buddyMatch.partnerId) {
    uni.showToast({ title: '请先匹配学习伙伴', icon: 'none' })
    return
  }
  
  peerCoachingStore.sendFeedback({
    fromId: 'user_001',
    fromName: '小明',
    fromAvatar: '😊',
    toId: buddyMatch.partnerId,
    toName: buddyMatch.partnerName,
    type: sendForm.value.type,
    content: sendForm.value.content,
    rating: sendForm.value.rating
  })
  
  // 重置表单
  sendForm.value = {
    type: 'progress',
    rating: 5,
    content: ''
  }
  
  showSendModal.value = false
  
  uni.showToast({ title: '发送成功', icon: 'success' })
  
  // 切换到已发送
  currentTab.value = 'sent'
}

// 发送回复
const sendReply = () => {
  if (!replyForm.value.content.trim()) {
    uni.showToast({ title: '请输入鼓励内容', icon: 'none' })
    return
  }
  
  const buddyMatch = peerCoachingStore.buddyMatch
  if (!buddyMatch || !buddyMatch.partnerId) {
    uni.showToast({ title: '请先匹配学习伙伴', icon: 'none' })
    return
  }
  
  peerCoachingStore.sendFeedback({
    fromId: 'user_001',
    fromName: '小明',
    fromAvatar: '😊',
    toId: buddyMatch.partnerId,
    toName: buddyMatch.partnerName,
    type: FEEDBACK_TYPE.ENCOURAGEMENT,
    content: replyForm.value.content,
    rating: 5
  })
  
  replyForm.value.content = ''
  closeReplyModal()
  
  uni.showToast({ title: '鼓励已发送', icon: 'success' })
}
</script>

<style scoped>
.mutual-feedback-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px 20px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.header-left .icon,
.header-right .icon {
  font-size: 20px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.stats-overview {
  background: #fff;
  margin: 15px;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.tabs {
  display: flex;
  background: #fff;
  padding: 0 15px;
  border-bottom: 1px solid #f0f0f0;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 14px;
  color: #666;
  position: relative;
}

.tab.active {
  color: #667eea;
  font-weight: 600;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: #667eea;
  border-radius: 2px;
}

.tab-badge {
  position: absolute;
  top: 8px;
  right: 25%;
  background: #f5222d;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.feedback-list {
  padding: 15px;
}

.feedback-item {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.author-info {
  display: flex;
  align-items: center;
}

.author-avatar {
  font-size: 24px;
  margin-right: 10px;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.feedback-type {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 4px;
  display: inline-block;
}

.feedback-type.progress {
  background: #e6f7ff;
  color: #1890ff;
}

.feedback-type.encouragement {
  background: #fff7e6;
  color: #fa8c16;
}

.rating {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 14px;
  color: #d9d9d9;
}

.star.filled {
  color: #fa8c16;
}

.feedback-content {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 12px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.feedback-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feedback-time {
  font-size: 11px;
  color: #999;
}

.reply-btn {
  font-size: 12px;
  padding: 4px 12px;
  background: #fff7e6;
  color: #fa8c16;
  border: none;
  border-radius: 4px;
}

.empty-tip {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.fab {
  position: fixed;
  right: 20px;
  bottom: 30px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.fab-icon {
  font-size: 24px;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}

.modal-content {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: #fff;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 24px;
  color: #999;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;
}

.modal-footer .btn-primary {
  flex: 1;
}

.btn-secondary {
  flex: 1;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 15px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 15px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.type-selector {
  display: flex;
  gap: 10px;
}

.type-option {
  flex: 1;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
}

.type-option.selected {
  border-color: #667eea;
  background: #f0f0ff;
}

.type-icon {
  display: block;
  font-size: 24px;
  margin-bottom: 6px;
}

.type-name {
  font-size: 13px;
  color: #333;
}

.rating-selector {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-selector .star {
  font-size: 28px;
  cursor: pointer;
}

.rating-text {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}

.form-textarea {
  width: 100%;
  height: 100px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  resize: none;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.quick-phrases {
  margin-top: 15px;
}

.quick-phrases-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.phrases-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.phrase-tag {
  font-size: 12px;
  padding: 6px 12px;
  background: #f0f0f0;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
}

.phrase-tag:hover {
  background: #e6f7ff;
  color: #1890ff;
}

.reply-to {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.reply-label {
  font-size: 13px;
  color: #666;
  margin-right: 8px;
}

.reply-author {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
</style>
