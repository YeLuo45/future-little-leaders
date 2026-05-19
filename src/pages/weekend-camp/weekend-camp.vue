<template>
  <view class="weekend-camp-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <text class="page-title">🏕️ 周末营</text>
        <text class="page-subtitle">精彩活动，欢乐周末</text>
      </view>
      <view class="points-badge" @tap="goToRewards">
        <text class="points-icon">🎫</text>
        <text class="points-value">{{ store.myPoints }}</text>
      </view>
    </view>

    <!-- Tab导航 -->
    <view class="tab-bar">
      <view 
        class="tab" 
        :class="{active: store.currentTab === 'discover'}"
        @tap="switchTab('discover')"
      >
        发现
      </view>
      <view 
        class="tab" 
        :class="{active: store.currentTab === 'my-camps'}"
        @tap="switchTab('my-camps')"
      >
        我的活动
      </view>
      <view 
        class="tab" 
        :class="{active: store.currentTab === 'calendar'}"
        @tap="switchTab('calendar')"
      >
        日历
      </view>
      <view 
        class="tab" 
        :class="{active: store.currentTab === 'rewards'}"
        @tap="switchTab('rewards')"
      >
        奖励
      </view>
    </view>

    <!-- 发现页面 -->
    <view class="content" v-if="store.currentTab === 'discover'">
      <!-- 活动类型筛选 -->
      <view class="filter-section">
        <scroll-view class="filter-scroll" scroll-x>
          <view 
            class="filter-chip" 
            :class="{active: !store.filterType}"
            @tap="store.setFilterType('')"
          >
            全部
          </view>
          <view 
            v-for="type in store.activityTypes" 
            :key="type.value"
            class="filter-chip"
            :class="{active: store.filterType === type.value}"
            @tap="store.setFilterType(type.value)"
          >
            {{ type.icon }} {{ type.label.replace(/^[^\s]+\s/, '') }}
          </view>
        </scroll-view>
      </view>

      <!-- 推荐活动 -->
      <view class="section" v-if="store.recommendedCamps.length > 0 && !store.filterType">
        <view class="section-header">
          <text class="section-title">🌟 精彩推荐</text>
        </view>
        <scroll-view class="camp-scroll" scroll-x>
          <view 
            v-for="camp in store.recommendedCamps" 
            :key="camp.id"
            class="camp-card-small"
            @tap="viewCamp(camp)"
          >
            <view class="camp-cover" :class="getTypeClass(camp.type)">
              <text class="camp-icon">{{ getTypeIcon(camp.type) }}</text>
            </view>
            <text class="camp-name">{{ camp.title }}</text>
            <text class="camp-date">{{ formatDate(camp.startDate) }}</text>
          </view>
        </scroll-view>
      </view>

      <!-- 全部活动 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">
            {{ store.filterType ? store.getTypeName(store.filterType) : '全部活动' }}
          </text>
          <text class="section-count">{{ store.camps.length }}个活动</text>
        </view>
        
        <view class="camp-list">
          <view 
            v-for="camp in store.camps" 
            :key="camp.id"
            class="camp-item"
            @tap="viewCamp(camp)"
          >
            <view class="camp-cover-large" :class="getTypeClass(camp.type)">
              <text class="camp-icon-large">{{ getTypeIcon(camp.type) }}</text>
              <view class="camp-status" :style="{background: store.getStatusColor(camp.status)}">
                {{ store.getStatusName(camp.status) }}
              </view>
            </view>
            <view class="camp-info">
              <text class="camp-title">{{ camp.title }}</text>
              <text class="camp-desc">{{ camp.description }}</text>
              <view class="camp-meta">
                <text class="meta-item">📅 {{ formatDate(camp.startDate) }}</text>
                <text class="meta-item">📍 {{ camp.location }}</text>
                <text class="meta-item">👶 {{ camp.ageRange }}岁</text>
              </view>
              <view class="camp-footer">
                <view class="camp-enrollment">
                  <text class="enroll-text">{{ camp.enrolledCount }}/{{ camp.capacity }}人</text>
                  <view class="enroll-bar">
                    <view class="enroll-progress" :style="{width: (camp.enrolledCount / camp.capacity * 100) + '%'}"></view>
                  </view>
                </view>
                <view class="camp-action">
                  <text class="points-tag">🎫 {{ camp.points }}积分</text>
                  <view class="register-btn" v-if="!store.isRegistered(camp.id)" @tap.stop="registerForCamp(camp)">
                    <text>立即报名</text>
                  </view>
                  <text class="registered-tag" v-else>已报名</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <view class="empty-state" v-if="store.camps.length === 0">
          <text class="empty-icon">🏕️</text>
          <text class="empty-title">暂无活动</text>
          <text class="empty-desc">敬请期待更多精彩活动</text>
        </view>
      </view>
    </view>

    <!-- 我的活动 -->
    <view class="content" v-if="store.currentTab === 'my-camps'">
      <view class="empty-state" v-if="store.registeredCamps.length === 0">
        <text class="empty-icon">🎒</text>
        <text class="empty-title">还没有参加活动</text>
        <text class="empty-desc">去发现页报名感兴趣的活动吧</text>
        <button class="start-btn" @tap="switchTab('discover')">发现活动</button>
      </view>
      
      <view class="camp-list" v-else>
        <view 
          v-for="item in store.registeredCamps" 
          :key="item.id"
          class="camp-item my-camp-item"
          @tap="viewCamp(item)"
        >
          <view class="camp-cover-large" :class="getTypeClass(item.type)">
            <text class="camp-icon-large">{{ getTypeIcon(item.type) }}</text>
            <view class="camp-status" :style="{background: store.getStatusColor(item.status)}">
              {{ store.getStatusName(item.status) }}
            </view>
          </view>
          <view class="camp-info">
            <text class="camp-title">{{ item.title }}</text>
            <view class="camp-meta">
              <text class="meta-item">📅 {{ formatDate(item.startDate) }}</text>
              <text class="meta-item">📍 {{ item.location }}</text>
            </view>
            <view class="registration-status">
              <text class="status-tag" :class="getRegistrationClass(item.registration.status)">
                {{ getRegistrationText(item.registration.status) }}
              </text>
            </view>
          </view>
          <view class="camp-arrow">
            <text>›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 日历视图 -->
    <view class="content" v-if="store.currentTab === 'calendar'">
      <view class="calendar-header">
        <view class="calendar-nav">
          <text class="nav-btn" @tap="prevMonth">‹</text>
          <text class="current-month">{{ currentMonthLabel }}</text>
          <text class="nav-btn" @tap="nextMonth">›</text>
        </view>
      </view>
      
      <view class="calendar-grid">
        <view class="calendar-weekday">
          <text v-for="day in weekDays" :key="day" class="weekday-text">{{ day }}</text>
        </view>
        <view class="calendar-days">
          <view 
            v-for="day in calendarDays" 
            :key="day.date"
            class="calendar-day"
            :class="{
              'has-activity': day.hasActivity,
              'is-today': day.isToday,
              'is-past': day.isPast
            }"
          >
            <text class="day-number">{{ day.day }}</text>
            <view class="day-dot" v-if="day.hasActivity"></view>
          </view>
        </view>
      </view>
      
      <!-- 当日活动 -->
      <view class="day-activities" v-if="selectedDayActivities.length > 0">
        <text class="day-activities-title">{{ selectedDayLabel }}的活动</text>
        <view 
          v-for="camp in selectedDayActivities" 
          :key="camp.id"
          class="day-activity-item"
          @tap="viewCamp(camp)"
        >
          <text class="day-activity-icon">{{ getTypeIcon(camp.type) }}</text>
          <text class="day-activity-title">{{ camp.title }}</text>
          <text class="day-activity-time">{{ camp.time }}</text>
        </view>
      </view>
    </view>

    <!-- 奖励页面 -->
    <view class="content" v-if="store.currentTab === 'rewards'">
      <!-- 积分展示 -->
      <view class="points-overview">
        <view class="points-card">
          <text class="points-label">我的周末营积分</text>
          <text class="points-number">{{ store.myPoints }}</text>
          <text class="points-desc">参与活动获得更多积分</text>
        </view>
      </view>
      
      <!-- 徽章墙 -->
      <view class="badges-section">
        <view class="section-header">
          <text class="section-title">🏅 成就徽章</text>
        </view>
        <view class="badges-grid">
          <view 
            v-for="badge in allBadges" 
            :key="badge.badgeId"
            class="badge-item"
            :class="{earned: isBadgeEarned(badge.badgeId)}"
          >
            <text class="badge-icon">{{ badge.icon }}</text>
            <text class="badge-name">{{ badge.name }}</text>
            <text class="badge-desc">{{ badge.description }}</text>
          </view>
        </view>
      </view>
      
      <!-- 奖励记录 -->
      <view class="rewards-history">
        <view class="section-header">
          <text class="section-title">📜 获得记录</text>
        </view>
        <view class="reward-list">
          <view 
            v-for="reward in store.myRewards" 
            :key="reward.id"
            class="reward-item"
          >
            <text class="reward-icon">{{ reward.icon }}</text>
            <view class="reward-info">
              <text class="reward-name">{{ reward.name }}</text>
              <text class="reward-time">{{ formatRewardTime(reward.earnedAt) }}</text>
            </view>
          </view>
          <view class="empty-state small" v-if="store.myRewards.length === 0">
            <text class="empty-desc">还没有获得奖励</text>
          </view>
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
      weekDays: ['日', '一', '二', '三', '四', '五', '六'],
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      selectedDate: null
    }
  },
  
  computed: {
    store() {
      return useWeekendCampStore()
    },
    
    currentMonthLabel() {
      return `${this.currentYear}年${this.currentMonth + 1}月`
    },
    
    calendarDays() {
      const days = []
      const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay()
      const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate()
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // 上月空白
      for (let i = 0; i < firstDay; i++) {
        days.push({ day: '', date: '', hasActivity: false, isToday: false, isPast: false })
      }
      
      // 当月日期
      for (let d = 1; d <= daysInMonth; d++) {
        const date = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        const hasActivity = this.store.camps.some(c => c.startDate === date)
        const isToday = new Date(this.currentYear, this.currentMonth, d).getTime() === today.getTime()
        const isPast = new Date(this.currentYear, this.currentMonth, d) < today
        
        days.push({ day: d, date, hasActivity, isToday, isPast })
      }
      
      return days
    },
    
    selectedDayActivities() {
      if (!this.selectedDate) {
        const today = new Date()
        this.selectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      }
      return this.store.camps.filter(c => c.startDate === this.selectedDate)
    },
    
    selectedDayLabel() {
      if (!this.selectedDate) return ''
      const [year, month, day] = this.selectedDate.split('-')
      return `${month}月${day}日`
    },
    
    allBadges() {
      return [
        { badgeId: 'outdoor_explorer', name: '户外探索家', icon: '🏅', description: '完成3次户外探索活动' },
        { badgeId: 'creative_master', name: '创意小达人', icon: '🎨', description: '完成5次创意工坊活动' },
        { badgeId: 'social_star', name: '社交小明星', icon: '⭐', description: '参加3次社交派对活动' }
      ]
    }
  },
  
  onLoad() {
    this.store.loadCamps()
    this.store.loadRecommendedCamps()
    this.store.loadMyRegistrations()
    this.store.loadMyRewards()
    this.store.loadMyPoints()
  },
  
  onShow() {
    this.store.loadCamps()
    this.store.loadMyRegistrations()
  },
  
  methods: {
    switchTab(tab) {
      this.store.currentTab = tab
    },
    
    viewCamp(camp) {
      uni.navigateTo({
        url: `/pages/weekend-camp/camp-detail?campId=${camp.id}`
      })
    },
    
    registerForCamp(camp) {
      if (!this.store.currentBabyId) {
        uni.showToast({ title: '请先选择宝宝', icon: 'none' })
        return
      }
      
      uni.showModal({
        title: '确认报名',
        content: `确定报名参加"${camp.title}"吗？`,
        success: (res) => {
          if (res.confirm) {
            const result = this.store.registerForCamp(camp.id)
            if (result) {
              uni.showToast({ title: '报名成功', icon: 'success' })
              this.store.loadCamps()
            } else if (this.store.errorMessage) {
              uni.showToast({ title: this.store.errorMessage, icon: 'none' })
            }
          }
        }
      })
    },
    
    goToRewards() {
      this.store.currentTab = 'rewards'
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
      const [, month, day] = dateStr.split('-')
      return `${month}月${day}日`
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
    
    isBadgeEarned(badgeId) {
      return this.store.myRewards.some(r => r.badgeId === badgeId)
    },
    
    formatRewardTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11
        this.currentYear--
      } else {
        this.currentMonth--
      }
    },
    
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0
        this.currentYear++
      } else {
        this.currentMonth++
      }
    }
  }
}
</script>

<style scoped>
.weekend-camp-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

.header {
  background: linear-gradient(135deg, #10b759 0%, #0d9049 100%);
  padding: 40px 20px 30px;
  color: white;
  position: relative;
}

.header-content {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 5px;
}

.points-badge {
  position: absolute;
  right: 20px;
  top: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 20px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.points-icon {
  font-size: 16px;
}

.points-value {
  font-size: 14px;
  font-weight: bold;
}

.tab-bar {
  display: flex;
  background: white;
  padding: 0 10px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 15px 0;
  font-size: 14px;
  color: #666;
  position: relative;
}

.tab.active {
  color: #10b759;
  font-weight: bold;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: #10b759;
  border-radius: 2px;
}

.content {
  padding: 15px;
}

.filter-section {
  margin-bottom: 15px;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-chip {
  display: inline-block;
  padding: 8px 16px;
  background: white;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  margin-right: 10px;
  border: 1px solid #eee;
}

.filter-chip.active {
  background: #10b759;
  color: white;
  border-color: #10b759;
}

.section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.section-count {
  font-size: 12px;
  color: #999;
}

.camp-scroll {
  white-space: nowrap;
}

.camp-card-small {
  display: inline-block;
  width: 140px;
  margin-right: 12px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  vertical-align: top;
}

.camp-cover {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camp-icon {
  font-size: 32px;
}

.camp-name {
  display: block;
  padding: 8px 10px 2px;
  font-size: 13px;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.camp-date {
  display: block;
  padding: 0 10px 10px;
  font-size: 11px;
  color: #999;
}

.camp-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.camp-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.camp-cover-large {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.camp-icon-large {
  font-size: 48px;
}

.camp-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  color: white;
}

.type-forest { background: linear-gradient(135deg, #10b759, #0d9049); }
.type-art { background: linear-gradient(135deg, #ff6b6b, #ff8e53); }
.type-party { background: linear-gradient(135deg, #a855f7, #7c3aed); }
.type-star { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }

.camp-info {
  padding: 12px;
}

.camp-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.camp-desc {
  font-size: 13px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}

.camp-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.meta-item {
  font-size: 12px;
  color: #999;
}

.camp-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.camp-enrollment {
  flex: 1;
}

.enroll-text {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.enroll-bar {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  width: 100px;
}

.enroll-progress {
  height: 100%;
  background: #10b759;
  border-radius: 2px;
}

.camp-action {
  display: flex;
  align-items: center;
  gap: 10px;
}

.points-tag {
  font-size: 12px;
  color: #ff9500;
}

.register-btn {
  background: #10b759;
  color: white;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
}

.registered-tag {
  color: #10b759;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.empty-title {
  font-size: 16px;
  color: #333;
  font-weight: bold;
  margin-bottom: 5px;
}

.empty-desc {
  font-size: 14px;
  color: #999;
  margin-bottom: 15px;
}

.start-btn {
  background: #10b759;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 30px;
  font-size: 14px;
}

/* Calendar styles */
.calendar-header {
  background: white;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 10px;
}

.calendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-btn {
  font-size: 24px;
  color: #10b759;
  padding: 5px 15px;
}

.current-month {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.calendar-grid {
  background: white;
  border-radius: 12px;
  padding: 15px;
}

.calendar-weekday {
  display: flex;
  margin-bottom: 10px;
}

.weekday-text {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #999;
}

.calendar-days {
  display: flex;
  flex-wrap: wrap;
}

.calendar-day {
  width: 14.28%;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.day-number {
  font-size: 14px;
  color: #333;
}

.calendar-day.is-today .day-number {
  background: #10b759;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-day.is-past .day-number {
  color: #ccc;
}

.day-dot {
  width: 4px;
  height: 4px;
  background: #10b759;
  border-radius: 50%;
  position: absolute;
  bottom: 4px;
}

.day-activities {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-top: 10px;
}

.day-activities-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  display: block;
}

.day-activity-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.day-activity-item:last-child {
  border-bottom: none;
}

.day-activity-icon {
  font-size: 20px;
  margin-right: 10px;
}

.day-activity-title {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.day-activity-time {
  font-size: 12px;
  color: #999;
}

/* Rewards styles */
.points-overview {
  margin-bottom: 20px;
}

.points-card {
  background: linear-gradient(135deg, #10b759, #0d9049);
  border-radius: 16px;
  padding: 25px;
  text-align: center;
  color: white;
}

.points-label {
  font-size: 14px;
  opacity: 0.9;
}

.points-number {
  font-size: 48px;
  font-weight: bold;
  display: block;
  margin: 10px 0;
}

.points-desc {
  font-size: 12px;
  opacity: 0.8;
}

.badges-section {
  margin-bottom: 20px;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.badge-item {
  background: white;
  border-radius: 12px;
  padding: 15px 10px;
  text-align: center;
  opacity: 0.5;
}

.badge-item.earned {
  opacity: 1;
  border: 2px solid #10b759;
}

.badge-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 5px;
}

.badge-name {
  font-size: 12px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 2px;
}

.badge-desc {
  font-size: 10px;
  color: #999;
}

.rewards-history {
  background: white;
  border-radius: 12px;
  padding: 15px;
}

.reward-list {
  display: flex;
  flex-direction: column;
}

.reward-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.reward-item:last-child {
  border-bottom: none;
}

.reward-icon {
  font-size: 24px;
  margin-right: 12px;
}

.reward-info {
  flex: 1;
}

.reward-name {
  font-size: 14px;
  color: #333;
  display: block;
  margin-bottom: 2px;
}

.reward-time {
  font-size: 12px;
  color: #999;
}

.empty-state.small {
  padding: 20px;
}

.my-camp-item {
  display: flex;
  align-items: center;
}

.my-camp-item .camp-cover-large {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.my-camp-item .camp-icon-large {
  font-size: 32px;
}

.my-camp-item .camp-info {
  flex: 1;
  padding: 10px;
}

.my-camp-item .camp-title {
  font-size: 14px;
}

.my-camp-item .camp-meta {
  margin-bottom: 5px;
}

.registration-status {
  margin-top: 5px;
}

.status-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
}

.status-pending {
  background: #fff7e6;
  color: #ff9500;
}

.status-confirmed {
  background: #e6f7ff;
  color: #1677ff;
}

.status-attended {
  background: #f6ffed;
  color: #10b759;
}

.status-cancelled {
  background: #fff1f0;
  color: #ff4d4f;
}

.camp-arrow {
  font-size: 20px;
  color: #ccc;
  padding-right: 10px;
}
</style>
