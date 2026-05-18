<template>
  <view class="study-groups-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">学习小组</text>
      <view class="header-actions">
        <button class="btn-create" @click="showCreateModal = true">+ 创建小组</button>
      </view>
    </view>

    <!-- 标签切换 -->
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'all' }"
        @click="currentTab = 'all'"
      >全部小组</view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'joined' }"
        @click="currentTab = 'joined'"
      >已加入</view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'rank' }"
        @click="currentTab = 'rank'"
      >排行榜</view>
    </view>

    <!-- 全部/已加入小组列表 -->
    <view v-if="currentTab !== 'rank'" class="groups-list">
      <view 
        class="group-card" 
        v-for="group in displayedGroups" 
        :key="group.id"
        @click="goToGroupDetail(group)"
      >
        <view class="group-header">
          <view class="group-cover" :style="{ backgroundColor: getGroupColor(group.rank) }">
            <text class="group-icon">{{ getSubjectIcon(group.subject) }}</text>
          </view>
          <view class="group-info">
            <text class="group-name">{{ group.name }}</text>
            <text class="group-subject">{{ group.subject }}</text>
          </view>
          <view class="group-rank" v-if="group.rank <= 3">
            <text class="rank-badge" :class="'rank-' + group.rank">第{{ group.rank }}名</text>
          </view>
        </view>
        
        <view class="group-desc">{{ group.description }}</view>
        
        <view class="group-tags">
          <text class="tag" v-for="tag in group.tags" :key="tag">{{ tag }}</text>
        </view>
        
        <view class="group-footer">
          <view class="group-stats">
            <text class="stat">👥 {{ group.memberCount }}/{{ group.maxMembers }}</text>
            <text class="stat">⭐ {{ group.totalPoints }}积分</text>
          </view>
          <view class="group-action">
            <button 
              v-if="!group.isJoined && group.memberCount < group.maxMembers" 
              class="btn-join"
              @click.stop="handleJoin(group.id)"
            >加入</button>
            <text v-else-if="group.isJoined" class="joined-tag">已加入 ✓</text>
            <text v-else class="full-tag">已满员</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 排行榜 -->
    <view v-else class="leaderboard">
      <view class="leaderboard-header">
        <text class="leaderboard-title">🏆 学习小组排行榜</text>
      </view>
      <view class="leaderboard-list">
        <view 
          class="leaderboard-item"
          v-for="(group, index) in store.topGroups"
          :key="group.id"
          :class="{ 'top-three': index < 3 }"
        >
          <view class="rank-number">
            <text v-if="index === 0" class="medal">🥇</text>
            <text v-else-if="index === 1" class="medal">🥈</text>
            <text v-else-if="index === 2" class="medal">🥉</text>
            <text v-else class="rank-text">{{ index + 1 }}</text>
          </view>
          <view class="leaderboard-info">
            <text class="leaderboard-name">{{ group.name }}</text>
            <text class="leaderboard-subject">{{ group.subject }}</text>
          </view>
          <view class="leaderboard-points">
            <text class="points">{{ group.totalPoints }}</text>
            <text class="points-label">积分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 创建小组弹窗 -->
    <view class="modal-overlay" v-if="showCreateModal" @click="showCreateModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">创建学习小组</text>
          <text class="modal-close" @click="showCreateModal = false">✕</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">小组名称</text>
          <input 
            class="form-input" 
            v-model="newGroup.name" 
            placeholder="请输入小组名称"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">小组描述</text>
          <textarea 
            class="form-textarea" 
            v-model="newGroup.description" 
            placeholder="请输入小组描述"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">学科分类</text>
          <view class="subject-selector">
            <view 
              class="subject-option" 
              :class="{ selected: newGroup.subject === s }"
              v-for="s in subjects" 
              :key="s"
              @click="newGroup.subject = s"
            >{{ s }}</view>
          </view>
        </view>
        
        <view class="form-item">
          <text class="form-label">小组标签</text>
          <input 
            class="form-input" 
            v-model="newGroup.tags" 
            placeholder="用逗号分隔，如：数学,竞赛"
          />
        </view>
        
        <button class="btn-submit" @click="handleCreate">创建小组</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSocialLearningStore } from '@/stores/socialLearningStore.js'

const store = useSocialLearningStore()

const currentTab = ref('all')
const showCreateModal = ref(false)
const newGroup = ref({
  name: '',
  description: '',
  subject: '综合',
  tags: ''
})

const subjects = ['综合', '数学', '语文', '英语', '科学', '阅读']

onMounted(() => {
  store.loadStudyGroups()
  store.loadGroupLeaderboard()
})

const displayedGroups = computed(() => {
  if (currentTab.value === 'joined') {
    return store.studyGroups.filter(g => g.isJoined)
  }
  return store.studyGroups
})

const getGroupColor = (rank) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
  return colors[(rank - 1) % colors.length]
}

const getSubjectIcon = (subject) => {
  const icons = {
    '数学': '🔢', '语文': '📖', '英语': '🌍', '科学': '🔬', '阅读': '📚', '综合': '📝'
  }
  return icons[subject] || '📝'
}

const handleJoin = (groupId) => {
  store.joinStudyGroup(groupId)
}

const handleCreate = () => {
  if (!newGroup.value.name.trim()) {
    uni.showToast({ title: '请输入小组名称', icon: 'none' })
    return
  }
  const tags = newGroup.value.tags.split(',').map(t => t.trim()).filter(t => t)
  store.createStudyGroup({
    name: newGroup.value.name,
    description: newGroup.value.description,
    subject: newGroup.value.subject,
    tags
  })
  newGroup.value = { name: '', description: '', subject: '综合', tags: '' }
  showCreateModal.value = false
  uni.showToast({ title: '创建成功', icon: 'success' })
}

const goToGroupDetail = (group) => {
  store.setCurrentGroup(group)
  uni.navigateTo({ url: `/pages/social-learning/group-detail?groupId=${group.id}` })
}
</script>

<style scoped>
.study-groups-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.btn-create {
  background: #fff;
  color: #667eea;
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
  border-bottom: 1rpx solid #eee;
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
  color: #667eea;
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
  background: #667eea;
  border-radius: 3rpx;
}

.groups-list {
  padding: 20rpx;
}

.group-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.group-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.group-cover {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.group-icon {
  font-size: 50rpx;
}

.group-info {
  flex: 1;
}

.group-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.group-subject {
  font-size: 24rpx;
  color: #999;
}

.group-rank {
  margin-left: auto;
}

.rank-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: bold;
}

.rank-badge.rank-1 { background: #FFF3E0; color: #FF9800; }
.rank-badge.rank-2 { background: #F5F5F5; color: #9E9E9E; }
.rank-badge.rank-3 { background: #FFF8E1; color: #CD7F32; }

.group-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 20rpx;
  line-height: 1.5;
}

.group-tags {
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

.group-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-stats {
  display: flex;
  gap: 30rpx;
}

.stat {
  font-size: 24rpx;
  color: #999;
}

.btn-join {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 25rpx;
  padding: 12rpx 30rpx;
  font-size: 24rpx;
}

.joined-tag {
  color: #4CAF50;
  font-size: 24rpx;
}

.full-tag {
  color: #999;
  font-size: 24rpx;
}

.leaderboard {
  padding: 20rpx;
}

.leaderboard-header {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.leaderboard-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.leaderboard-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.leaderboard-item.top-three {
  background: #FFFBF0;
}

.leaderboard-item:last-child {
  border-bottom: none;
}

.rank-number {
  width: 60rpx;
  text-align: center;
}

.medal {
  font-size: 40rpx;
}

.rank-text {
  font-size: 28rpx;
  color: #999;
  font-weight: bold;
}

.leaderboard-info {
  flex: 1;
  margin-left: 20rpx;
}

.leaderboard-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.leaderboard-subject {
  font-size: 22rpx;
  color: #999;
}

.leaderboard-points {
  text-align: right;
}

.points {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF9800;
  display: block;
}

.points-label {
  font-size: 20rpx;
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
  background: #667eea;
  color: #fff;
  border-color: #667eea;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 30rpx;
  padding: 24rpx;
  font-size: 30rpx;
  font-weight: bold;
  margin-top: 20rpx;
}
</style>
