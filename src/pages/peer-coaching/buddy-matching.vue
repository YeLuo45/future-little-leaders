<template>
  <view class="buddy-matching-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>学习伙伴匹配</text>
      </view>
      <view class="header-right">
        <text class="icon">👥</text>
      </view>
    </view>

    <!-- 当前匹配状态 -->
    <view class="match-status" v-if="hasBuddy">
      <view class="status-badge matched">
        <text>已匹配</text>
      </view>
      <view class="current-buddy">
        <view class="buddy-avatar">{{ buddyMatch.partnerAvatar }}</view>
        <view class="buddy-details">
          <text class="buddy-name">{{ buddyMatch.partnerName }}</text>
          <view class="buddy-tags">
            <text class="tag skill" v-for="skill in buddyMatch.partnerSkills" :key="skill">
              {{ getSkillLabel(skill) }}
            </text>
          </view>
        </view>
      </view>
      <view class="match-info">
        <text class="info-label">匹配方式：</text>
        <text class="info-value">{{ getMatchTypeLabel(buddyMatch.matchType) }}</text>
      </view>
    </view>

    <!-- 未匹配状态 -->
    <view class="match-status unmatched" v-else>
      <view class="status-badge pending">
        <text>待匹配</text>
      </view>
      <view class="unmatched-tip">
        <text>还没有匹配的学习伙伴</text>
      </view>
      <button class="btn-primary" @click="showMatchModal = true">开始匹配</button>
    </view>

    <!-- 我的信息 -->
    <view class="my-profile">
      <view class="section-header">
        <text class="section-title">我的信息</text>
        <text class="section-edit" @click="showEditModal = true">编辑</text>
      </view>
      <view class="profile-card">
        <view class="profile-avatar">{{ myProfile.avatar }}</view>
        <view class="profile-info">
          <text class="profile-name">{{ myProfile.name }}</text>
          <view class="profile-tags">
            <view class="tag-group">
              <text class="tag-label">强项：</text>
              <text class="tag skill" v-for="skill in myProfile.strongSkills" :key="skill">
                {{ getSkillLabel(skill) }}
              </text>
            </view>
            <view class="tag-group">
              <text class="tag-label">兴趣：</text>
              <text class="tag interest" v-for="interest in myProfile.interests" :key="interest">
                {{ getSkillLabel(interest) }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 推荐伙伴列表 -->
    <view class="recommendations">
      <view class="section-header">
        <text class="section-title">推荐伙伴</text>
        <text class="section-more" @click="refreshRecommendations">刷新</text>
      </view>
      <view class="buddy-list">
        <view 
          class="buddy-item" 
          v-for="buddy in recommendedBuddies" 
          :key="buddy.id"
          @click="selectBuddy(buddy)"
        >
          <view class="buddy-avatar">{{ buddy.avatar }}</view>
          <view class="buddy-info">
            <text class="buddy-name">{{ buddy.name }}</text>
            <view class="buddy-tags">
              <text class="tag skill" v-for="skill in buddy.skills?.slice(0, 2)" :key="skill">
                {{ getSkillLabel(skill) }}
              </text>
            </view>
          </view>
          <button class="btn-small" @click.stop="requestMatch(buddy)">匹配</button>
        </view>
        <view class="empty-tip" v-if="recommendedBuddies.length === 0">
          <text>暂无推荐伙伴，请稍后再试</text>
        </view>
      </view>
    </view>

    <!-- 编辑个人资料弹窗 -->
    <view class="modal" v-if="showEditModal" @click="showEditModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">编辑我的信息</text>
          <text class="modal-close" @click="showEditModal = false">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">昵称</text>
            <input class="form-input" v-model="editForm.name" placeholder="请输入昵称" />
          </view>
          <view class="form-item">
            <text class="form-label">头像</text>
            <view class="avatar-selector">
              <text 
                class="avatar-option" 
                v-for="avatar in avatarOptions" 
                :key="avatar"
                :class="{ selected: editForm.avatar === avatar }"
                @click="editForm.avatar = avatar"
              >
                {{ avatar }}
              </text>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">强项技能（可教给伙伴）</text>
            <view class="skill-selector">
              <text 
                class="skill-option" 
                v-for="(info, key) in SKILL_INFO" 
                :key="key"
                :class="{ selected: editForm.strongSkills.includes(key) }"
                @click="toggleSkill(editForm.strongSkills, key)"
              >
                {{ info.icon }} {{ info.label }}
              </text>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">兴趣领域</text>
            <view class="skill-selector">
              <text 
                class="skill-option" 
                v-for="(info, key) in SKILL_INFO" 
                :key="key"
                :class="{ selected: editForm.interests.includes(key) }"
                @click="toggleSkill(editForm.interests, key)"
              >
                {{ info.icon }} {{ info.label }}
              </text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-secondary" @click="showEditModal = false">取消</button>
          <button class="btn-primary" @click="saveProfile">保存</button>
        </view>
      </view>
    </view>

    <!-- 匹配请求弹窗 -->
    <view class="modal" v-if="showMatchModal" @click="showMatchModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">匹配设置</text>
          <text class="modal-close" @click="showMatchModal = false">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">匹配方式</text>
            <view class="match-type-selector">
              <view 
                class="type-option" 
                :class="{ selected: matchType === 'skill_complement' }"
                @click="matchType = 'skill_complement'"
              >
                <text class="type-icon">🔄</text>
                <text class="type-name">技能互补</text>
                <text class="type-desc">你的强项教给伙伴，伙伴的强项教给你</text>
              </view>
              <view 
                class="type-option" 
                :class="{ selected: matchType === 'interest_match' }"
                @click="matchType = 'interest_match'"
              >
                <text class="type-icon">🎯</text>
                <text class="type-name">兴趣匹配</text>
                <text class="type-desc">找到有共同兴趣的伙伴一起学习</text>
              </view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-secondary" @click="showMatchModal = false">取消</button>
          <button class="btn-primary" @click="startMatching">开始匹配</button>
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
  MATCH_TYPE,
  MATCH_STATUS 
} from '@/services/peerCoachingService.js'

const peerCoachingStore = usePeerCoachingStore()

// 弹窗状态
const showEditModal = ref(false)
const showMatchModal = ref(false)

// 匹配类型
const matchType = ref('skill_complement')

// 编辑表单
const editForm = ref({
  name: '小明',
  avatar: '😊',
  strongSkills: [SKILL_CATEGORY.MATH, SKILL_CATEGORY.CODING],
  interests: [SKILL_CATEGORY.SCIENCE, SKILL_CATEGORY.SPORTS]
})

// 我的资料（模拟）
const myProfile = ref({
  id: 'user_001',
  name: '小明',
  avatar: '😊',
  strongSkills: [SKILL_CATEGORY.MATH, SKILL_CATEGORY.CODING],
  interests: [SKILL_CATEGORY.SCIENCE, SKILL_CATEGORY.SPORTS],
  weakSkills: [SKILL_CATEGORY.READING, SKILL_CATEGORY.WRITING]
})

// 头像选项
const avatarOptions = ['😊', '😎', '🤗', '😇', '🥰', '🤩', '😺', '🐱']

// 计算属性
const buddyMatch = computed(() => peerCoachingStore.buddyMatch)
const hasBuddy = computed(() => peerCoachingStore.hasBuddy)
const recommendedBuddies = computed(() => peerCoachingStore.recommendedBuddies)

// 页面加载
onMounted(() => {
  peerCoachingStore.init()
  peerCoachingStore.loadRecommendedBuddies()
})

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 获取技能标签
const getSkillLabel = (skill) => {
  return SKILL_INFO[skill]?.label || skill
}

// 获取匹配类型标签
const getMatchTypeLabel = (type) => {
  const labels = {
    [MATCH_TYPE.SKILL_COMPLEMENT]: '技能互补',
    [MATCH_TYPE.INTEREST_MATCH]: '兴趣匹配',
    [MATCH_TYPE.RANDOM]: '随机匹配'
  }
  return labels[type] || type
}

// 切换技能选择
const toggleSkill = (arr, skill) => {
  const index = arr.indexOf(skill)
  if (index === -1) {
    arr.push(skill)
  } else {
    arr.splice(index, 1)
  }
}

// 保存个人资料
const saveProfile = () => {
  myProfile.value = {
    ...editForm.value,
    id: 'user_001'
  }
  showEditModal.value = false
}

// 刷新推荐
const refreshRecommendations = () => {
  peerCoachingStore.loadRecommendedBuddies()
}

// 选择伙伴
const selectBuddy = (buddy) => {
  // 查看伙伴详情
}

// 请求匹配
const requestMatch = (buddy) => {
  peerCoachingStore.findAndMatchBuddy({
    ...myProfile.value,
    userId: myProfile.value.id,
    userName: myProfile.value.name,
    userAvatar: myProfile.value.avatar
  })
  
  uni.showToast({
    title: '匹配成功！',
    icon: 'success'
  })
}

// 开始匹配
const startMatching = () => {
  // 基于选定的匹配类型进行匹配
  peerCoachingStore.findAndMatchBuddy({
    ...myProfile.value,
    userId: myProfile.value.id,
    userName: myProfile.value.name,
    userAvatar: myProfile.value.avatar,
    matchType: matchType.value
  })
  
  showMatchModal.value = false
  
  if (hasBuddy.value) {
    uni.showToast({
      title: '匹配成功！',
      icon: 'success'
    })
  } else {
    uni.showToast({
      title: '暂未找到合适伙伴',
      icon: 'none'
    })
  }
}
</script>

<style scoped>
.buddy-matching-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
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

.match-status {
  background: #fff;
  margin: 15px;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.status-badge {
  display: inline-block;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  margin-bottom: 15px;
}

.status-badge.matched {
  background: #f6ffed;
  color: #52c41a;
}

.status-badge.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.current-buddy {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.buddy-avatar {
  width: 60px;
  height: 60px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-right: 15px;
}

.buddy-details {
  flex: 1;
}

.buddy-name {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.buddy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.tag.skill {
  background: #e6f7ff;
  color: #1890ff;
}

.tag.interest {
  background: #fff7e6;
  color: #fa8c16;
}

.tag-label {
  font-size: 11px;
  color: #999;
  margin-right: 4px;
}

.match-info {
  font-size: 13px;
  color: #666;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.unmatched-tip {
  text-align: center;
  padding: 20px 0;
  color: #999;
  font-size: 14px;
}

.btn-primary {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 15px;
}

.my-profile,
.recommendations {
  padding: 0 15px;
  margin-top: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-edit,
.section-more {
  font-size: 12px;
  color: #667eea;
}

.profile-card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.profile-avatar {
  width: 60px;
  height: 60px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-right: 15px;
}

.profile-info {
  flex: 1;
}

.profile-name {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.profile-tags {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tag-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.buddy-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.buddy-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.buddy-item:last-child {
  border-bottom: none;
}

.buddy-item .buddy-avatar {
  width: 45px;
  height: 45px;
  font-size: 24px;
  margin-right: 12px;
}

.buddy-item .buddy-info {
  flex: 1;
}

.buddy-item .buddy-name {
  font-size: 15px;
  margin-bottom: 4px;
}

.btn-small {
  font-size: 12px;
  padding: 6px 15px;
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 6px;
}

.empty-tip {
  padding: 30px 15px;
  text-align: center;
  color: #999;
  font-size: 13px;
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

.avatar-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.avatar-option {
  width: 45px;
  height: 45px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
}

.avatar-option.selected {
  background: #e6f7ff;
  box-shadow: 0 0 0 2px #1890ff;
}

.skill-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-option {
  font-size: 12px;
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
}

.skill-option.selected {
  background: #e6f7ff;
  color: #1890ff;
}

.match-type-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.type-option {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
}

.type-option.selected {
  border-color: #667eea;
  background: #f0f0ff;
}

.type-icon {
  font-size: 20px;
  margin-right: 8px;
}

.type-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.type-desc {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  margin-left: 28px;
}
</style>
