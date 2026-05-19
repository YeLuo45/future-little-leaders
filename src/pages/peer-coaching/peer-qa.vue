<template>
  <view class="peer-qa-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>同伴答疑</text>
      </view>
      <view class="header-right" @click="goToMyQuestions">
        <text class="icon">📝</text>
      </view>
    </view>

    <!-- 标签切换 -->
    <view class="tabs">
      <view 
        class="tab" 
        :class="{ active: currentTab === 'all' }"
        @click="currentTab = 'all'"
      >
        <text>全部问题</text>
      </view>
      <view 
        class="tab" 
        :class="{ active: currentTab === 'my' }"
        @click="currentTab = 'my'"
      >
        <text>我的问题</text>
      </view>
      <view 
        class="tab" 
        :class="{ active: currentTab === 'buddy' }"
        @click="currentTab = 'buddy'"
      >
        <text>伙伴的问题</text>
        <view class="tab-badge" v-if="buddyQuestionCount > 0">{{ buddyQuestionCount }}</view>
      </view>
    </view>

    <!-- 问题列表 -->
    <view class="question-list">
      <view 
        class="question-item" 
        v-for="question in displayedQuestions" 
        :key="question.id"
        @click="goToQuestionDetail(question)"
      >
        <view class="question-header">
          <view class="author-info">
            <text class="author-avatar">{{ question.authorAvatar }}</text>
            <text class="author-name">{{ question.authorName }}</text>
          </view>
          <view class="question-status" :class="question.status">
            {{ getStatusLabel(question.status) }}
          </view>
        </view>
        <view class="question-content">
          <text class="question-title">{{ question.title }}</text>
          <text class="question-desc">{{ getPreview(question.content) }}</text>
        </view>
        <view class="question-footer">
          <view class="question-tags">
            <text class="tag category" :style="{ background: getCategoryColor(question.category) }">
              {{ getCategoryLabel(question.category) }}
            </text>
          </view>
          <view class="question-meta">
            <text class="answer-count">{{ getAnswerCount(question.id) }} 回答</text>
            <text class="question-time">{{ formatDate(question.createdAt) }}</text>
          </view>
        </view>
      </view>

      <view class="empty-tip" v-if="displayedQuestions.length === 0">
        <text>暂无问题</text>
      </view>
    </view>

    <!-- 发布问题按钮 -->
    <view class="fab" @click="showPostModal = true">
      <text class="fab-icon">+</text>
    </view>

    <!-- 发布问题弹窗 -->
    <view class="modal" v-if="showPostModal" @click="showPostModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">发布问题</text>
          <text class="modal-close" @click="showPostModal = false">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">问题标题</text>
            <input 
              class="form-input" 
              v-model="postForm.title" 
              placeholder="请输入问题标题"
              maxlength="50"
            />
          </view>
          <view class="form-item">
            <text class="form-label">问题详情</text>
            <textarea 
              class="form-textarea" 
              v-model="postForm.content" 
              placeholder="请详细描述你的问题..."
              maxlength="500"
            />
          </view>
          <view class="form-item">
            <text class="form-label">选择领域</text>
            <view class="category-selector">
              <text 
                class="category-option" 
                v-for="(info, key) in SKILL_INFO" 
                :key="key"
                :class="{ selected: postForm.category === key }"
                @click="postForm.category = key"
              >
                {{ info.icon }} {{ info.label }}
              </text>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">添加标签</text>
            <view class="tag-input">
              <view class="tag" v-for="(tag, index) in postForm.tags" :key="index">
                {{ tag }}
                <text class="tag-remove" @click="removeTag(index)">×</text>
              </view>
              <input 
                class="tag-input-field" 
                v-model="newTag" 
                placeholder="输入标签后回车"
                @confirm="addTag"
              />
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-secondary" @click="showPostModal = false">取消</button>
          <button class="btn-primary" @click="postQuestion">发布</button>
        </view>
      </view>
    </view>

    <!-- 问题详情弹窗 -->
    <view class="modal" v-if="showDetailModal" @click="closeDetail">
      <view class="modal-content detail-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">问题详情</text>
          <text class="modal-close" @click="closeDetail">×</text>
        </view>
        <view class="modal-body">
          <view class="detail-question">
            <view class="question-header">
              <view class="author-info">
                <text class="author-avatar">{{ selectedQuestion?.authorAvatar }}</text>
                <text class="author-name">{{ selectedQuestion?.authorName }}</text>
              </view>
              <view class="question-status" :class="selectedQuestion?.status">
                {{ getStatusLabel(selectedQuestion?.status) }}
              </view>
            </view>
            <text class="question-title">{{ selectedQuestion?.title }}</text>
            <text class="question-content">{{ selectedQuestion?.content }}</text>
            <view class="question-tags">
              <text class="tag category" :style="{ background: getCategoryColor(selectedQuestion?.category) }">
                {{ getCategoryLabel(selectedQuestion?.category) }}
              </text>
            </view>
          </view>

          <!-- 答案列表 -->
          <view class="answers-section">
            <view class="answers-header">
              <text class="answers-title">回答 ({{ answers.length }})</text>
            </view>
            <view class="answer-list">
              <view 
                class="answer-item" 
                v-for="answer in answers" 
                :key="answer.id"
                :class="{ accepted: answer.isAccepted }"
              >
                <view class="answer-header">
                  <view class="author-info">
                    <text class="author-avatar">{{ answer.authorAvatar }}</text>
                    <text class="author-name">{{ answer.authorName }}</text>
                  </view>
                  <view class="accepted-badge" v-if="answer.isAccepted">
                    <text>✓ 已采纳</text>
                  </view>
                </view>
                <text class="answer-content">{{ answer.content }}</text>
                <view class="answer-footer">
                  <text class="answer-time">{{ formatDate(answer.createdAt) }}</text>
                  <button 
                    class="accept-btn" 
                    v-if="canAcceptAnswer(answer)"
                    @click="doAcceptAnswer(answer.id)"
                  >
                    采纳
                  </button>
                </view>
              </view>
              <view class="empty-answers" v-if="answers.length === 0">
                <text>暂无回答，快来回复吧！</text>
              </view>
            </view>
          </view>

          <!-- 回答输入 -->
          <view class="answer-input-section" v-if="canAnswer">
            <textarea 
              class="answer-textarea" 
              v-model="answerForm.content" 
              placeholder="写下你的回答..."
              maxlength="300"
            />
            <button class="btn-primary" @click="submitAnswer">提交回答</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePeerCoachingStore } from '@/stores/peerCoachingStore.js'
import peerCoachingService, { 
  SKILL_INFO, 
  SKILL_CATEGORY,
  QUESTION_STATUS 
} from '@/services/peerCoachingService.js'

const peerCoachingStore = usePeerCoachingStore()

// 状态
const currentTab = ref('all')
const showPostModal = ref(false)
const showDetailModal = ref(false)
const selectedQuestion = ref(null)
const newTag = ref('')

// 发布表单
const postForm = ref({
  title: '',
  content: '',
  category: SKILL_CATEGORY.MATH,
  tags: []
})

// 回答表单
const answerForm = ref({
  content: ''
})

// 页面加载
onMounted(() => {
  peerCoachingStore.init()
  peerCoachingStore.loadQuestions()
})

// 计算属性
const displayedQuestions = computed(() => {
  if (currentTab.value === 'my') {
    return peerCoachingStore.sortedMyQuestions
  } else if (currentTab.value === 'buddy') {
    return peerCoachingStore.sortedBuddyQuestions
  }
  return [...peerCoachingStore.questions].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )
})

const buddyQuestionCount = computed(() => peerCoachingStore.sortedBuddyQuestions.length)

const answers = computed(() => {
  if (!selectedQuestion.value) return []
  return peerCoachingService.getAnswersByQuestion(selectedQuestion.value.id)
})

const canAnswer = computed(() => {
  if (!selectedQuestion.value) return false
  // 只能回答别人的问题
  return selectedQuestion.value.authorId !== 'user_001'
})

const canAcceptAnswer = (answer) => {
  if (!selectedQuestion.value) return false
  // 只有问题的作者可以采纳，且问题尚未关闭
  if (selectedQuestion.value.authorId !== 'user_001') return false
  if (selectedQuestion.value.status === QUESTION_STATUS.CLOSED) return false
  return true
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 跳转到我的问题列表
const goToMyQuestions = () => {
  currentTab.value = 'my'
}

// 获取状态标签
const getStatusLabel = (status) => {
  const labels = {
    [QUESTION_STATUS.OPEN]: '开放中',
    [QUESTION_STATUS.ANSWERED]: '已采纳',
    [QUESTION_STATUS.CLOSED]: '已关闭'
  }
  return labels[status] || status
}

// 获取分类标签
const getCategoryLabel = (category) => {
  return SKILL_INFO[category]?.label || category
}

// 获取分类颜色
const getCategoryColor = (category) => {
  return SKILL_INFO[category]?.color || '#999'
}

// 获取内容预览
const getPreview = (content) => {
  if (!content) return ''
  return content.length > 80 ? content.substring(0, 80) + '...' : content
}

// 获取答案数量
const getAnswerCount = (questionId) => {
  return peerCoachingService.getAnswersByQuestion(questionId).length
}

// 格式化日期
const formatDate = (dateStr) => {
  return peerCoachingStore.formatDate(dateStr)
}

// 跳转到问题详情
const goToQuestionDetail = (question) => {
  selectedQuestion.value = question
  showDetailModal.value = true
  peerCoachingStore.loadQuestionDetail(question.id)
}

// 关闭详情
const closeDetail = () => {
  showDetailModal.value = false
  selectedQuestion.value = null
  answerForm.value.content = ''
}

// 添加标签
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !postForm.value.tags.includes(tag)) {
    postForm.value.tags.push(tag)
  }
  newTag.value = ''
}

// 移除标签
const removeTag = (index) => {
  postForm.value.tags.splice(index, 1)
}

// 发布问题
const postQuestion = () => {
  if (!postForm.value.title.trim()) {
    uni.showToast({ title: '请输入问题标题', icon: 'none' })
    return
  }
  
  const question = peerCoachingStore.postQuestion({
    authorId: 'user_001',
    authorName: '小明',
    authorAvatar: '😊',
    title: postForm.value.title,
    content: postForm.value.content,
    category: postForm.value.category,
    tags: postForm.value.tags
  })
  
  // 重置表单
  postForm.value = {
    title: '',
    content: '',
    category: SKILL_CATEGORY.MATH,
    tags: []
  }
  
  showPostModal.value = false
  
  uni.showToast({ title: '发布成功', icon: 'success' })
  
  // 切换到我的问题
  currentTab.value = 'my'
}

// 提交回答
const submitAnswer = () => {
  if (!answerForm.value.content.trim()) {
    uni.showToast({ title: '请输入回答内容', icon: 'none' })
    return
  }
  
  peerCoachingStore.addAnswer({
    questionId: selectedQuestion.value.id,
    authorId: 'user_001',
    authorName: '小明',
    authorAvatar: '😊',
    content: answerForm.value.content
  })
  
  answerForm.value.content = ''
  
  uni.showToast({ title: '回答提交成功', icon: 'success' })
}

// 采纳答案
const doAcceptAnswer = (answerId) => {
  peerCoachingStore.acceptAnswer(selectedQuestion.value.id, answerId)
  uni.showToast({ title: '已采纳该回答', icon: 'success' })
}
</script>

<style scoped>
.peer-qa-container {
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
  right: 20%;
  background: #f5222d;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.question-list {
  padding: 15px;
}

.question-item {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.author-info {
  display: flex;
  align-items: center;
}

.author-avatar {
  font-size: 20px;
  margin-right: 8px;
}

.author-name {
  font-size: 13px;
  color: #666;
}

.question-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.question-status.open {
  background: #e6f7ff;
  color: #1890ff;
}

.question-status.answered {
  background: #f6ffed;
  color: #52c41a;
}

.question-status.closed {
  background: #f5f5f5;
  color: #999;
}

.question-content {
  margin-bottom: 10px;
}

.question-title {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.question-desc {
  display: block;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.question-tags {
  display: flex;
  gap: 6px;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  color: #fff;
}

.question-meta {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: #999;
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
  font-size: 28px;
  color: #fff;
  font-weight: 300;
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

.form-input {
  width: 100%;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
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

.category-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-option {
  font-size: 12px;
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
}

.category-option.selected {
  background: #e6f7ff;
  color: #1890ff;
}

.tag-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  min-height: 42px;
}

.tag-input .tag {
  display: flex;
  align-items: center;
  background: #e6f7ff;
  color: #1890ff;
}

.tag-remove {
  margin-left: 4px;
  cursor: pointer;
}

.tag-input-field {
  flex: 1;
  min-width: 100px;
  border: none;
  outline: none;
  font-size: 14px;
}

/* Detail Modal */
.detail-modal {
  max-height: 90vh;
}

.detail-question {
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 15px;
}

.detail-question .question-title {
  font-size: 17px;
  margin-top: 10px;
}

.detail-question .question-content {
  display: block;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-top: 8px;
}

.answers-section {
  margin-top: 15px;
}

.answers-header {
  margin-bottom: 10px;
}

.answers-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.answer-list {
  max-height: 300px;
  overflow-y: auto;
}

.answer-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 10px;
}

.answer-item.accepted {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.accepted-badge {
  font-size: 11px;
  color: #52c41a;
}

.answer-content {
  display: block;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.answer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.answer-time {
  font-size: 11px;
  color: #999;
}

.accept-btn {
  font-size: 12px;
  padding: 4px 12px;
  background: #52c41a;
  color: #fff;
  border: none;
  border-radius: 4px;
}

.empty-answers {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 13px;
}

.answer-input-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.answer-textarea {
  width: 100%;
  height: 80px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  resize: none;
  margin-bottom: 10px;
}

.answer-input-section .btn-primary {
  width: 100%;
}
</style>
