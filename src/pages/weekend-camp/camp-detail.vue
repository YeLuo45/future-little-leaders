<template>
  <view class="camp-detail-page" v-if="camp">
    <!-- 头部 -->
    <view class="detail-header" :class="getTypeClass(camp.type)">
      <view class="header-top">
        <view class="back-btn" @tap="goBack">
          <text>‹</text>
        </view>
        <view class="share-btn" @tap="shareCamp">
          <text>分享</text>
        </view>
      </view>
      <view class="camp-type-badge">
        <text class="type-icon">{{ getTypeIcon(camp.type) }}</text>
        <text class="type-name">{{ store.getTypeName(camp.type) }}</text>
      </view>
      <text class="camp-title">{{ camp.title }}</text>
      <view class="camp-tags">
        <text v-for="tag in camp.tags" :key="tag" class="tag">{{ tag }}</text>
      </view>
    </view>

    <!-- 基本信息 -->
    <view class="info-section">
      <view class="info-row">
        <text class="info-icon">📅</text>
        <text class="info-text">{{ formatDate(camp.startDate) }} {{ camp.time }}</text>
      </view>
      <view class="info-row">
        <text class="info-icon">📍</text>
        <text class="info-text">{{ camp.location }}</text>
      </view>
      <view class="info-row">
        <text class="info-icon">👶</text>
        <text class="info-text">适合 {{ camp.ageRange }} 岁宝宝</text>
      </view>
      <view class="info-row">
        <text class="info-icon">👥</text>
        <text class="info-text">{{ camp.enrolledCount }}/{{ camp.capacity }} 人已报名</text>
        <view class="capacity-bar">
          <view class="capacity-progress" :style="{width: (camp.enrolledCount / camp.capacity * 100) + '%'}"></view>
        </view>
      </view>
      <view class="info-row">
        <text class="info-icon">🎫</text>
        <text class="info-text points">报名费 ¥{{ camp.price }} | 奖励 {{ camp.points }} 积分</text>
      </view>
    </view>

    <!-- 活动介绍 -->
    <view class="section">
      <text class="section-title">活动介绍</text>
      <text class="section-content">{{ camp.description }}</text>
    </view>

    <!-- 活动安排 -->
    <view class="section">
      <text class="section-title">活动安排</text>
      <view class="schedule-list">
        <view v-for="(item, index) in camp.schedule" :key="index" class="schedule-item">
          <view class="schedule-time">{{ item.time }}</view>
          <view class="schedule-dot"></view>
          <view class="schedule-activity">{{ item.activity }}</view>
        </view>
      </view>
    </view>

    <!-- 准备物品 -->
    <view class="section" v-if="camp.requirements && camp.requirements.length > 0">
      <text class="section-title">准备物品</text>
      <view class="requirements-list">
        <text v-for="(req, index) in camp.requirements" :key="index" class="requirement-item">
          {{ req }}
        </text>
      </view>
    </view>

    <!-- 活动状态 -->
    <view class="section">
      <text class="section-title">活动状态</text>
      <view class="status-row">
        <view class="status-badge" :style="{background: store.getStatusColor(camp.status)}">
          {{ store.getStatusName(camp.status) }}
        </view>
        <text class="status-text" v-if="camp.status === 'registration'">
          {{ camp.capacity - camp.enrolledCount }}个名额剩余
        </text>
      </view>
    </view>

    <!-- 我的报名状态 -->
    <view class="section my-registration" v-if="myRegistration">
      <text class="section-title">我的报名</text>
      <view class="registration-info">
        <view class="reg-status">
          <text class="reg-label">报名状态：</text>
          <text class="reg-value" :class="getRegistrationClass(myRegistration.status)">
            {{ getRegistrationText(myRegistration.status) }}
          </text>
        </view>
        <view class="reg-time">
          <text class="reg-label">报名时间：</text>
          <text class="reg-value">{{ formatFullDate(myRegistration.registeredAt) }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="reward-info">
        <text class="reward-icon">🎫</text>
        <text class="reward-text">报名即得 {{ camp.points }} 积分</text>
      </view>
      <view class="action-buttons">
        <view class="cancel-btn" v-if="myRegistration && myRegistration.status !== 'cancelled'" @tap="cancelRegistration">
          <text>取消报名</text>
        </view>
        <view class="register-btn" v-if="!myRegistration || myRegistration.status === 'cancelled'" @tap="registerForCamp">
          <text>立即报名</text>
        </view>
        <view class="completed-btn" v-if="myRegistration && myRegistration.status === 'confirmed' && isToday(camp.startDate)" @tap="markAttended">
          <text>签到参加</text>
        </view>
      </view>
    </view>

    <!-- 分享弹窗 -->
    <view class="modal" v-if="showShareModal" @tap.stop="closeShareModal">
      <view class="modal-content share-modal" @tap.stop>
        <text class="share-title">分享活动</text>
        <view class="share-preview">
          <view class="share-icon">{{ getTypeIcon(camp.type) }}</view>
          <text class="share-camp-title">{{ camp.title }}</text>
          <text class="share-camp-info">{{ camp.location }} | {{ formatDate(camp.startDate) }}</text>
        </view>
        <view class="share-actions">
          <view class="share-btn-item" @tap="shareToFriend">
            <text class="share-btn-icon">👨‍👩‍👧</text>
            <text class="share-btn-text">分享给好友</text>
          </view>
          <view class="share-btn-item" @tap="shareToMoments">
            <text class="share-btn-icon">📱</text>
            <text class="share-btn-text">分享到朋友圈</text>
          </view>
        </view>
        <view class="close-share" @tap="closeShareModal">
          <text>取消</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useWeekendCampStore } from '@/stores/weekendCampStore.js'

export default {
  data() {
    return {
      campId: '',
      camp: null,
      myRegistration: null,
      showShareModal: false
    }
  },
  
  computed: {
    store() {
      return useWeekendCampStore()
    }
  },
  
  onLoad(options) {
    if (options.campId) {
      this.campId = options.campId
      this.loadCampDetail()
    }
  },
  
  methods: {
    loadCampDetail() {
      this.camp = this.store.loadCampDetail(this.campId)
      if (this.store.currentBabyId) {
        this.myRegistration = this.store.myRegistrations.find(
          r => r.campId === this.campId && r.status !== 'cancelled'
        )
      }
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    getTypeIcon(type) {
      const iconMap = {
        'outdoor_exploration': '🌲',
        'creative_workshop': '🎨',
        'social_party': '🎉',
        'theme_camp': '⭐'
      }
      return iconMap[type] || '🏕️'
    },
    
    getTypeClass(type) {
      const classMap = {
        'outdoor_exploration': 'type-forest',
        'creative_workshop': 'type-art',
        'social_party': 'type-party',
        'theme_camp': 'type-star'
      }
      return classMap[type] || ''
    },
    
    formatDate(dateStr) {
      if (!dateStr) return ''
      const [year, month, day] = dateStr.split('-')
      return `${year}年${month}月${day}日`
    },
    
    formatFullDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    
    isToday(dateStr) {
      if (!dateStr) return false
      const today = new Date()
      const target = new Date(dateStr)
      return today.toDateString() === target.toDateString()
    },
    
    getRegistrationClass(status) {
      const classMap = {
        'pending': 'status-pending',
        'confirmed': 'status-confirmed',
        'attended': 'status-attended',
        'cancelled': 'status-cancelled'
      }
      return classMap[status] || ''
    },
    
    getRegistrationText(status) {
      const textMap = {
        'pending': '待确认',
        'confirmed': '已确认',
        'attended': '已参加',
        'cancelled': '已取消'
      }
      return textMap[status] || status
    },
    
    registerForCamp() {
      if (!this.store.currentBabyId) {
        uni.showToast({ title: '请先选择宝宝', icon: 'none' })
        return
      }
      
      uni.showModal({
        title: '确认报名',
        content: `确定报名参加"${this.camp.title}"吗？费用 ¥${this.camp.price}`,
        success: (res) => {
          if (res.confirm) {
            const result = this.store.registerForCamp(this.campId)
            if (result) {
              uni.showToast({ title: '报名成功', icon: 'success' })
              this.myRegistration = result
              this.loadCampDetail()
            } else if (this.store.errorMessage) {
              uni.showToast({ title: this.store.errorMessage, icon: 'none' })
            }
          }
        }
      })
    },
    
    cancelRegistration() {
      if (!this.myRegistration) return
      
      uni.showModal({
        title: '确认取消',
        content: '确定要取消报名吗？',
        success: (res) => {
          if (res.confirm) {
            const success = this.store.cancelMyRegistration(this.myRegistration.id)
            if (success) {
              uni.showToast({ title: '已取消报名', icon: 'success' })
              this.myRegistration = null
              this.loadCampDetail()
            }
          }
        }
      })
    },
    
    markAttended() {
      if (!this.myRegistration) return
      
      uni.showModal({
        title: '确认签到',
        content: '确认参加此活动？',
        success: (res) => {
          if (res.confirm) {
            const result = this.store.markAttended(this.myRegistration.id)
            if (result) {
              uni.showToast({ title: '签到成功，获得 ' + this.camp.points + ' 积分', icon: 'success' })
              this.myRegistration = result
              // 检查是否有新徽章
              const newRewards = this.store.checkAndGrantRewards()
              if (newRewards.length > 0) {
                uni.showToast({ title: '恭喜获得徽章：' + newRewards[0].name, icon: 'success' })
              }
            }
          }
        }
      })
    },
    
    shareCamp() {
      this.showShareModal = true
    },
    
    closeShareModal() {
      this.showShareModal = false
    },
    
    shareToFriend() {
      this.store.createShare(this.campId, { type: 'friend' })
      uni.showToast({ title: '分享成功', icon: 'success' })
      this.closeShareModal()
    },
    
    shareToMoments() {
      this.store.createShare(this.campId, { type: 'moments' })
      uni.showToast({ title: '分享成功', icon: 'success' })
      this.closeShareModal()
    }
  }
}
</script>

<style scoped>
.camp-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.detail-header {
  padding: 40px 20px 30px;
  color: white;
  position: relative;
}

.type-forest { background: linear-gradient(135deg, #10b759, #0d9049); }
.type-art { background: linear-gradient(135deg, #ff6b6b, #ff8e53); }
.type-party { background: linear-gradient(135deg, #a855f7, #7c3aed); }
.type-star { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.2);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.share-btn {
  padding: 6px 16px;
  background: rgba(255,255,255,0.2);
  border-radius: 16px;
  font-size: 13px;
}

.camp-type-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255,255,255,0.2);
  padding: 6px 12px;
  border-radius: 16px;
  margin-bottom: 10px;
}

.type-icon {
  font-size: 16px;
  margin-right: 6px;
}

.type-name {
  font-size: 13px;
}

.camp-title {
  font-size: 24px;
  font-weight: bold;
  display: block;
  margin-bottom: 10px;
}

.camp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: rgba(255,255,255,0.2);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.info-section {
  background: white;
  margin: -20px 15px 15px;
  border-radius: 12px;
  padding: 15px;
  position: relative;
  z-index: 1;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-row:last-child {
  border-bottom: none;
}

.info-icon {
  font-size: 16px;
  margin-right: 10px;
}

.info-text {
  font-size: 14px;
  color: #333;
}

.info-text.points {
  color: #ff9500;
}

.capacity-bar {
  flex: 1;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  margin-left: 10px;
}

.capacity-progress {
  height: 100%;
  background: #10b759;
  border-radius: 3px;
}

.section {
  background: white;
  margin: 0 15px 15px;
  border-radius: 12px;
  padding: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  display: block;
}

.section-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.schedule-list {
  display: flex;
  flex-direction: column;
}

.schedule-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 0;
}

.schedule-time {
  width: 60px;
  font-size: 13px;
  color: #10b759;
  font-weight: bold;
}

.schedule-dot {
  width: 10px;
  height: 10px;
  background: #10b759;
  border-radius: 50%;
  margin: 2px 12px 0;
  position: relative;
}

.schedule-dot::after {
  content: '';
  position: absolute;
  top: 10px;
  left: 3px;
  width: 2px;
  height: 30px;
  background: #eee;
}

.schedule-item:last-child .schedule-dot::after {
  display: none;
}

.schedule-activity {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.requirements-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.requirement-item {
  background: #f5f5f5;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
}

.status-text {
  font-size: 13px;
  color: #666;
}

.my-registration {
  border: 1px solid #10b759;
}

.registration-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reg-status, .reg-time {
  display: flex;
  align-items: center;
}

.reg-label {
  font-size: 13px;
  color: #999;
}

.reg-value {
  font-size: 13px;
  color: #333;
}

.status-pending { color: #ff9500; }
.status-confirmed { color: #1677ff; }
.status-attended { color: #10b759; }
.status-cancelled { color: #ff4d4f; }

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

.reward-info {
  display: flex;
  align-items: center;
}

.reward-icon {
  font-size: 16px;
  margin-right: 4px;
}

.reward-text {
  font-size: 13px;
  color: #ff9500;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.cancel-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
}

.register-btn {
  background: #10b759;
  color: white;
  padding: 10px 30px;
  border-radius: 20px;
  font-size: 14px;
}

.completed-btn {
  background: #1677ff;
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
}

/* Share Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  width: 100%;
}

.share-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  text-align: center;
  display: block;
  margin-bottom: 20px;
}

.share-preview {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
}

.share-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.share-camp-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.share-camp-info {
  font-size: 13px;
  color: #999;
}

.share-actions {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 20px;
}

.share-btn-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.share-btn-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.share-btn-text {
  font-size: 13px;
  color: #666;
}

.close-share {
  text-align: center;
  padding: 15px;
  font-size: 14px;
  color: #999;
}
</style>
