<template>
  <view class="peer-tutoring-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">同伴辅导</text>
      <view class="header-actions">
        <button class="btn-ask" @click="showAskModal = true">发布问题</button>
      </view>
    </view>

    <!-- 标签切换 -->
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'questions' }"
        @click="currentTab = 'questions'"
      >
        问题求助
        <text class="tab-badge" v-if="store.unsolvedQuestions.length">{{ store.unsolvedQuestions.length }}</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'explanations' }"
        @click="currentTab = 'explanations'"
      >知识点</view>
    </view>

    <!-- 问题列表 -->
    <view v-if="currentTab === 'questions'" class="questions-list">
      <view 
        class="question-card"
        v-for="q in store.peerQuestions" 
        :key="q.id"
        @click="goToDetail(q)"
      >
        <view class="question-header">
          <view class="question-subject">{{ q.subject }}</view>
          <view class="question-status" :class="{ solved: q.solved }">
            {{ q.solved ? '已解决 ✓' : '待解答' }}
          </view>
        </view>
        
        <view class="question-title">{{ q.title }}</view>
        <view class="question-content">{{ q.content }}</view>
        
        <view class="question-tags">
          <text class="tag" v-for="tag in q.tags" :key="tag">{{ tag }}</text>
        </view>
        
        <view class="question-footer">
          <view class="question-author">
            <text class="author-avatar">👤</text>
            <text class="author-name">{{ q.authorName }}</text>
          </view>
          <view class="question-stats">
            <text class="stat">💬 {{ q.answers.length }}</text>
            <text class="stat">❤️ {{ getTotalLikes(q) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 知识点列表 -->
    <view v-else class="explanations-list">
      <view 
        class="explanation-card"
        v-for="exp in store.knowledgeExplanations" 
        :key="exp.id"
      >
        <view class="exp-header">
          <view class="exp-subject">{{ exp.subject }}</view>
          <view class="exp-topic">{{ exp.topic }}</view>
        </view>
        
        <view class="exp-title">{{ exp.title }}</view>
        <view class="exp-content">{{ exp.content }}</view>
        
        <view class="exp-footer">
          <view class="exp-author">
            <text class="author-avatar">👨‍🏫</text>
            <text class="author-name">{{ exp.authorName }}</text>
          </view>
          <view class="exp-stats">
            <text class="stat">👁️ {{ exp.views }}</text>
            <text class="stat">❤️ {{ exp.likes }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 发布问题弹窗 -->
    <view class="modal-overlay" v-if="showAskModal" @click="showAskModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">发布问题</text>
          <text class="modal-close" @click="showAskModal = false">✕</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">问题标题</text>
          <input 
            class="form-input" 
            v-model="newQuestion.title" 
            placeholder="请简要描述你的问题"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">学科分类</text>
          <view class="subject-selector">
            <view 
              class="subject-option" 
              :class="{ selected: newQuestion.subject === s }"
              v-for="s in subjects" 
              :key="s"
              @click="newQuestion.subject = s"
            >{{ s }}</view>
          </view>
        </view>
        
        <view class="form-item">
          <text class="form-label">问题详情</text>
          <textarea 
            class="form-textarea" 
            v-model="newQuestion.content" 
            placeholder="详细描述你的问题..."
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">相关标签</text>
          <input 
            class="form-input" 
            v-model="newQuestion.tags" 
            placeholder="用逗号分隔，如：数学,应用题"
          />
        </view>
        
        <button class="btn-submit" @click="handlePostQuestion">发布问题</button>
      </view>
    </view>

    <!-- 问题详情页 -->
    <view class="modal-overlay" v-if="selectedQuestion" @click="selectedQuestion = null">
      <view class="detail-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">问题详情</text>
          <text class="modal-close" @click="selectedQuestion = null">✕</text>
        </view>
        
        <scroll-view scroll-y class="detail-content">
          <view class="detail-question">
            <view class="detail-subject">{{ selectedQuestion.subject }}</view>
            <view class="detail-title">{{ selectedQuestion.title }}</view>
            <view class="detail-content-text">{{ selectedQuestion.content }}</view>
          </view>
          
          <view class="answers-section">
            <view class="answers-header">
              <text class="answers-count">{{ selectedQuestion.answers.length }} 个回答</text>
            </view>
            
            <view 
              class="answer-item"
              v-for="answer in selectedQuestion.answers"
              :key="answer.id"
            >
              <view class="answer-header">
                <view class="answer-author">
                  <text class="author-avatar">👤</text>
                  <text class="author-name">{{ answer.authorName }}</text>
                </view>
                <view class="answer-actions">
                  <text 
                    class="accept-btn" 
                    v-if="!answer.isAccepted && selectedQuestion.authorId === 'current_user'"
                    @click="handleAcceptAnswer(selectedQuestion.id, answer.id)"
                  >采纳</text>
                  <text class="accepted-tag" v-if="answer.isAccepted">✓ 已采纳</text>
                </view>
              </view>
              <view class="answer-content">{{ answer.content }}</view>
              <view class="answer-footer">
                <text class="answer-time">{{ formatTime(answer.createdAt) }}</text>
                <view class="answer-likes">
                  <text class="like-btn" @click="handleLikeAnswer(selectedQuestion.id, answer.id)">❤️ {{ answer.likes }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 我的回答 -->
          <view class="my-answer" v-if="selectedQuestion.authorId !== 'current_user'">
            <textarea 
              class="form-textarea" 
              v-model="myAnswer" 
              placeholder="写下你的回答..."
            />
            <button class="btn-submit" @click="handleSubmitAnswer(selectedQuestion.id)">提交回答</button>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSocialLearningStore } from '@/stores/socialLearningStore.js'

const store = useSocialLearningStore()

const currentTab = ref('questions')
const showAskModal = ref(false)
const selectedQuestion = ref(null)
const myAnswer = ref('')

const newQuestion = ref({
  title: '',
  subject: '数学',
  content: '',
  tags: ''
})

const subjects = ['数学', '语文', '英语', '科学', '综合']

onMounted(() => {
  store.loadPeerQuestions()
  store.loadKnowledgeExplanations()
})

const getTotalLikes = (question) => {
  return question.answers.reduce((sum, a) => sum + a.likes, 0)
}

const formatTime = (timestamp) => {
  const diff = Date.now() - timestamp
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return Math.floor(diff / 86400000) + '天前'
}

const handlePostQuestion = () => {
  if (!newQuestion.value.title.trim()) {
    uni.showToast({ title: '请输入问题标题', icon: 'none' })
    return
  }
  const tags = newQuestion.value.tags.split(',').map(t => t.trim()).filter(t => t)
  store.postPeerQuestion({
    title: newQuestion.value.title,
    subject: newQuestion.value.subject,
    content: newQuestion.value.content,
    tags
  })
  newQuestion.value = { title: '', subject: '数学', content: '', tags: '' }
  showAskModal.value = false
  uni.showToast({ title: '发布成功', icon: 'success' })
}

const handleSubmitAnswer = (questionId) => {
  if (!myAnswer.value.trim()) {
    uni.showToast({ title: '请输入回答', icon: 'none' })
    return
  }
  store.answerPeerQuestion(questionId, myAnswer.value)
  myAnswer.value = ''
  store.loadPeerQuestions()
  // 刷新详情
  const updated = store.peerQuestions.find(q => q.id === questionId)
  if (updated) selectedQuestion.value = updated
  uni.showToast({ title: '回答成功', icon: 'success' })
}

const handleAcceptAnswer = (questionId, answerId) => {
  store.acceptAnswer(questionId, answerId)
  const updated = store.peerQuestions.find(q => q.id === questionId)
  if (updated) selectedQuestion.value = updated
}

const handleLikeAnswer = (questionId, answerId) => {
  store.likeAnswer(questionId, answerId)
  const updated = store.peerQuestions.find(q => q.id === questionId)
  if (updated) selectedQuestion.value = updated
}

const goToDetail = (question) => {
  selectedQuestion.value = question
}
</script>

<style scoped>
.peer-tutoring-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.page-header {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A5A 100%);
  padding: 40rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.btn-ask {
  background: #fff;
  color: #FF6B6B;
  border: none;
  border-radius: 30rpx;
  padding: 16rpx 30rpx;
  font-size: 26rpx;
  font-weight: 600;
}

.tab-bar {
  display: flex;
  background: #fff;
  padding: 0 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #FF6B6B;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 6rpx;
  background: #FF6B6B;
  border-radius: 3rpx;
}

.tab-badge {
  background: #FF6B6B;
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  margin-left: 8rpx;
}

.questions-list,
.explanations-list {
  padding: 20rpx;
}

.question-card,
.explanation-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.question-header,
.exp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.question-subject,
.exp-subject {
  background: #FFF0F0;
  color: #FF6B6B;
  padding: 6rpx 16rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
}

.question-status {
  color: #FF9800;
  font-size: 24rpx;
}

.question-status.solved {
  color: #4CAF50;
}

.exp-topic {
  color: #999;
  font-size: 22rpx;
}

.question-title,
.exp-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
}

.question-content,
.exp-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20rpx;
}

.question-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.tag {
  background: #F0F0F5;
  color: #666;
  padding: 6rpx 16rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
}

.question-footer,
.exp-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-author,
.exp-author {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.author-avatar {
  font-size: 28rpx;
}

.author-name {
  font-size: 24rpx;
  color: #666;
}

.question-stats,
.exp-stats {
  display: flex;
  gap: 20rpx;
}

.stat {
  font-size: 24rpx;
  color: #999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.modal-content,
.detail-modal {
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 30rpx;
  width: 100%;
}

.detail-modal {
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 15rpx;
}

.form-input {
  border: 1rpx solid #ddd;
  border-radius: 15rpx;
  padding: 20rpx;
  font-size: 28rpx;
  width: 100%;
  box-sizing: border-box;
}

.form-textarea {
  border: 1rpx solid #ddd;
  border-radius: 15rpx;
  padding: 20rpx;
  font-size: 28rpx;
  width: 100%;
  height: 150rpx;
  box-sizing: border-box;
}

.subject-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.subject-option {
  padding: 12rpx 25rpx;
  border: 1rpx solid #ddd;
  border-radius: 25rpx;
  font-size: 24rpx;
  color: #666;
}

.subject-option.selected {
  background: #FF6B6B;
  color: #fff;
  border-color: #FF6B6B;
}

.btn-submit {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A5A 100%);
  color: #fff;
  border: none;
  border-radius: 30rpx;
  padding: 24rpx;
  font-size: 30rpx;
  font-weight: bold;
  margin-top: 20rpx;
}

.detail-content {
  flex: 1;
  max-height: 70vh;
}

.detail-question {
  margin-bottom: 30rpx;
}

.detail-subject {
  display: inline-block;
  background: #FFF0F0;
  color: #FF6B6B;
  padding: 6rpx 16rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
  margin-bottom: 15rpx;
}

.detail-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
}

.detail-content-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.answers-section {
  border-top: 1rpx solid #eee;
  padding-top: 20rpx;
}

.answers-header {
  margin-bottom: 20rpx;
}

.answers-count {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.answer-item {
  background: #F9F9F9;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.answer-author {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.accept-btn {
  color: #4CAF50;
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border: 1rpx solid #4CAF50;
  border-radius: 15rpx;
}

.accepted-tag {
  color: #4CAF50;
  font-size: 24rpx;
}

.answer-content {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
  margin-bottom: 15rpx;
}

.answer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.answer-time {
  font-size: 22rpx;
  color: #999;
}

.like-btn {
  font-size: 24rpx;
  color: #FF6B6B;
}

.my-answer {
  border-top: 1rpx solid #eee;
  padding-top: 20rpx;
  margin-top: 20rpx;
}
</style>
