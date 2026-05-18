<template>
  <view class="sharing-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">知识分享</text>
      <view class="header-actions">
        <button class="btn-share" @click="showShareModal = true">发布分享</button>
      </view>
    </view>

    <!-- 标签切换 -->
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'all' }"
        @click="currentTab = 'all'"
      >全部</view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'note' }"
        @click="currentTab = 'note'"
      >学习笔记</view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'resource' }"
        @click="currentTab = 'resource'"
      >资源推荐</view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'experience' }"
        @click="currentTab = 'experience'"
      >学习心得</view>
    </view>

    <!-- 分享列表 -->
    <view class="sharing-list">
      <view 
        class="share-card"
        v-for="post in filteredPosts" 
        :key="post.id"
      >
        <view class="share-header">
          <view class="share-type" :class="post.type">{{ getTypeName(post.type) }}</view>
          <text class="share-time">{{ formatTime(post.createdAt) }}</text>
        </view>
        
        <view class="share-title">{{ post.title }}</view>
        <view class="share-content">{{ post.content }}</view>
        
        <view class="share-tags">
          <text class="tag" v-for="tag in post.tags" :key="tag">{{ tag }}</text>
          <text class="subject-tag">{{ post.subject }}</text>
        </view>
        
        <view class="share-footer">
          <view class="share-author">
            <text class="author-avatar">👤</text>
            <text class="author-name">{{ post.authorName }}</text>
          </view>
          <view class="share-stats">
            <text class="stat">👁️ {{ post.views }}</text>
            <text class="stat like-btn" @click="handleLike(post.id)">❤️ {{ post.likes }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 社交挑战入口 -->
    <view class="challenges-section">
      <view class="section-header">
        <text class="section-title">🏆 社交挑战</text>
        <text class="section-more" @click="goToChallenges">更多 »</text>
      </view>
      
      <view class="challenges-list">
        <view 
          class="challenge-card"
          v-for="challenge in store.activeChallenges" 
          :key="challenge.id"
          @click="goToChallengeDetail(challenge)"
        >
          <view class="challenge-header">
            <view class="challenge-type" :class="challenge.type">{{ getChallengeTypeName(challenge.type) }}</view>
            <view class="challenge-deadline">
              <text v-if="getDaysLeft(challenge.deadline) > 0">还剩{{ getDaysLeft(challenge.deadline) }}天</text>
              <text v-else class="deadline-ended">已结束</text>
            </view>
          </view>
          
          <view class="challenge-title">{{ challenge.title }}</view>
          <view class="challenge-desc">{{ challenge.description }}</view>
          
          <view class="challenge-progress">
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :style="{ width: (challenge.current / challenge.goal * 100) + '%' }"
              ></view>
            </view>
            <text class="progress-text">{{ challenge.current }}/{{ challenge.goal }}</text>
          </view>
          
          <view class="challenge-footer">
            <view class="challenge-reward">
              <text class="reward-icon">⭐</text>
              <text class="reward-points">{{ challenge.points }}积分</text>
            </view>
            <view class="challenge-participants">
              <text class="participants-icon">👥</text>
              <text class="participants-count">{{ challenge.participants }}人参与</text>
            </view>
            <button 
              class="btn-join-challenge"
              v-if="!challenge.joined"
              @click.stop="handleJoinChallenge(challenge.id)"
            >参与</button>
            <text class="joined-tag" v-else>已参与 ✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 发布分享弹窗 -->
    <view class="modal-overlay" v-if="showShareModal" @click="showShareModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">发布分享</text>
          <text class="modal-close" @click="showShareModal = false">✕</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">分享类型</text>
          <view class="type-selector">
            <view 
              class="type-option" 
              :class="{ selected: newPost.type === 'note' }"
              @click="newPost.type = 'note'"
            >📝 学习笔记</view>
            <view 
              class="type-option" 
              :class="{ selected: newPost.type === 'resource' }"
              @click="newPost.type = 'resource'"
            >📚 资源推荐</view>
            <view 
              class="type-option" 
              :class="{ selected: newPost.type === 'experience' }"
              @click="newPost.type = 'experience'"
            >💡 学习心得</view>
          </view>
        </view>
        
        <view class="form-item">
          <text class="form-label">标题</text>
          <input 
            class="form-input" 
            v-model="newPost.title" 
            placeholder="给分享起个标题"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">学科分类</text>
          <view class="subject-selector">
            <view 
              class="subject-option" 
              :class="{ selected: newPost.subject === s }"
              v-for="s in subjects" 
              :key="s"
              @click="newPost.subject = s"
            >{{ s }}</view>
          </view>
        </view>
        
        <view class="form-item">
          <text class="form-label">分享内容</text>
          <textarea 
            class="form-textarea" 
            v-model="newPost.content" 
            placeholder="分享你的学习心得、笔记或推荐资源..."
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">相关标签</text>
          <input 
            class="form-input" 
            v-model="newPost.tags" 
            placeholder="用逗号分隔，如：数学,学习方法"
          />
        </view>
        
        <button class="btn-submit" @click="handlePostShare">发布分享</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSocialLearningStore } from '@/stores/socialLearningStore.js'

const store = useSocialLearningStore()

const currentTab = ref('all')
const showShareModal = ref(false)

const newPost = ref({
  type: 'experience',
  title: '',
  subject: '综合',
  content: '',
  tags: ''
})

const subjects = ['综合', '数学', '语文', '英语', '科学', '阅读']

onMounted(() => {
  store.loadSharingPosts()
  store.loadSocialChallenges()
})

const filteredPosts = computed(() => {
  if (currentTab.value === 'all') return store.sharingPosts
  return store.sharingPosts.filter(p => p.type === currentTab.value)
})

const getTypeName = (type) => {
  const names = { note: '📝笔记', resource: '📚资源', experience: '💡心得' }
  return names[type] || '📝'
}

const getChallengeTypeName = (type) => {
  const names = { team: '🤝组队', competition: '🏆竞赛', collaboration: '🤝互助' }
  return names[type] || '🤝'
}

const formatTime = (timestamp) => {
  const diff = Date.now() - timestamp
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return Math.floor(diff / 86400000) + '天前'
}

const getDaysLeft = (deadline) => {
  const diff = deadline - Date.now()
  return Math.max(0, Math.floor(diff / 86400000))
}

const handlePostShare = () => {
  if (!newPost.value.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }
  const tags = newPost.value.tags.split(',').map(t => t.trim()).filter(t => t)
  store.postSharing({
    type: newPost.value.type,
    title: newPost.value.title,
    subject: newPost.value.subject,
    content: newPost.value.content,
    tags
  })
  newPost.value = { type: 'experience', title: '', subject: '综合', content: '', tags: '' }
  showShareModal.value = false
  uni.showToast({ title: '发布成功', icon: 'success' })
}

const handleLike = (postId) => {
  store.likeSharing(postId)
}

const handleJoinChallenge = (challengeId) => {
  store.joinChallenge(challengeId)
}

const goToChallenges = () => {
  uni.showToast({ title: '挑战详情页开发中', icon: 'none' })
}

const goToChallengeDetail = (challenge) => {
  uni.showToast({ title: challenge.title, icon: 'none' })
}
</script>

<style scoped>
.sharing-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.page-header {
  background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
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

.btn-share {
  background: #fff;
  color: #4ECDC4;
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
  font-size: 26rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #4ECDC4;
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
  background: #4ECDC4;
  border-radius: 3rpx;
}

.sharing-list {
  padding: 20rpx;
}

.share-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.share-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.share-type {
  padding: 6rpx 16rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
  font-weight: bold;
}

.share-type.note { background: #E3F2FD; color: #2196F3; }
.share-type.resource { background: #FFF3E0; color: #FF9800; }
.share-type.experience { background: #E8F5E9; color: #4CAF50; }

.share-time {
  font-size: 22rpx;
  color: #999;
}

.share-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
}

.share-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.share-tags {
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

.subject-tag {
  background: #E8F5E9;
  color: #4CAF50;
  padding: 6rpx 16rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
}

.share-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.share-author {
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

.share-stats {
  display: flex;
  gap: 20rpx;
}

.stat {
  font-size: 24rpx;
  color: #999;
}

.like-btn {
  color: #FF6B6B;
}

.challenges-section {
  padding: 0 20rpx;
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

.section-more {
  font-size: 26rpx;
  color: #4ECDC4;
}

.challenges-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.challenge-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 25rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.challenge-type {
  padding: 6rpx 16rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
  font-weight: bold;
}

.challenge-type.team { background: #E3F2FD; color: #2196F3; }
.challenge-type.competition { background: #FFF3E0; color: #FF9800; }
.challenge-type.collaboration { background: #E8F5E9; color: #4CAF50; }

.challenge-deadline {
  font-size: 22rpx;
  color: #FF9800;
}

.deadline-ended {
  color: #999;
}

.challenge-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.challenge-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.challenge-progress {
  display: flex;
  align-items: center;
  gap: 15rpx;
  margin-bottom: 20rpx;
}

.progress-bar {
  flex: 1;
  height: 12rpx;
  background: #F0F0F0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ECDC4 0%, #44A08D 100%);
  border-radius: 6rpx;
}

.progress-text {
  font-size: 22rpx;
  color: #999;
  min-width: 80rpx;
  text-align: right;
}

.challenge-footer {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.challenge-reward,
.challenge-participants {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.reward-icon,
.participants-icon {
  font-size: 24rpx;
}

.reward-points {
  font-size: 24rpx;
  color: #FF9800;
  font-weight: bold;
}

.participants-count {
  font-size: 24rpx;
  color: #999;
}

.btn-join-challenge {
  margin-left: auto;
  background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
  color: #fff;
  border: none;
  border-radius: 25rpx;
  padding: 12rpx 30rpx;
  font-size: 24rpx;
}

.joined-tag {
  margin-left: auto;
  color: #4CAF50;
  font-size: 24rpx;
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

.modal-content {
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 30rpx;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
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

.type-selector {
  display: flex;
  gap: 15rpx;
}

.type-option {
  flex: 1;
  text-align: center;
  padding: 16rpx 10rpx;
  border: 1rpx solid #ddd;
  border-radius: 15rpx;
  font-size: 24rpx;
  color: #666;
}

.type-option.selected {
  background: #4ECDC4;
  color: #fff;
  border-color: #4ECDC4;
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
  background: #4ECDC4;
  color: #fff;
  border-color: #4ECDC4;
}

.btn-submit {
  background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
  color: #fff;
  border: none;
  border-radius: 30rpx;
  padding: 24rpx;
  font-size: 30rpx;
  font-weight: bold;
  margin-top: 20rpx;
}
</style>
