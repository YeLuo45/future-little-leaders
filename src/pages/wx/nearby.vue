<template>
  <view class="nearby-page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">附近的孩子</text>
      <view class="refresh-btn" @click="refreshLocation">
        <text class="icon">🔄</text>
      </view>
    </view>

    <!-- 位置信息 -->
    <view class="location-bar">
      <text class="location-icon">📍</text>
      <text class="location-text" v-if="currentLocation">
        {{ formatLocation(currentLocation) }}
      </text>
      <text class="location-text" v-else>正在获取位置...</text>
      <button class="location-btn" @click="requestLocationPermission">
        {{ hasLocationPermission ? '重新定位' : '开启定位' }}
      </button>
    </view>

    <!-- 搜索半径 -->
    <view class="radius-selector">
      <text class="radius-label">搜索范围：</text>
      <view class="radius-options">
        <view
          v-for="r in radiusOptions"
          :key="r.value"
          class="radius-item"
          :class="{ active: searchRadius === r.value }"
          @click="setRadius(r.value)"
        >
          {{ r.label }}
        </view>
      </view>
    </view>

    <!-- 附近孩子列表 -->
    <scroll-view
      class="nearby-list"
      scroll-y
      @scrolltolower="loadMore"
    >
      <view v-if="loading" class="loading-state">
        <text>正在搜索附近的孩子...</text>
      </view>

      <view v-else-if="!hasLocationPermission && !currentLocation" class="permission-state">
        <text class="permission-icon">🔒</text>
        <text class="permission-text">需要位置权限才能发现附近的孩子</text>
        <button class="permission-btn" @click="requestLocationPermission">
          开启定位
        </button>
      </view>

      <view v-else-if="nearbyKids.length === 0" class="empty-state">
        <text class="empty-icon">🔍</text>
        <text class="empty-text">附近暂未发现其他孩子</text>
        <text class="empty-hint">试试扩大搜索范围</text>
      </view>

      <view v-else class="kids-grid">
        <view
          v-for="kid in nearbyKids"
          :key="kid.id"
          class="kid-card"
          @click="viewKidDetail(kid)"
        >
          <view class="kid-avatar">
            <text class="kid-emoji">{{ kid.emoji || '👶' }}</text>
          </view>
          <view class="kid-info">
            <text class="kid-name">{{ kid.name || '神秘小伙伴' }}</text>
            <view class="kid-meta">
              <text class="kid-distance">{{ kid.formattedDistance }}</text>
              <text class="kid-age" v-if="kid.age">{{ kid.age }}岁</text>
            </view>
          </view>
          <view class="kid-actions">
            <button class="action-btn" @click.stop="sendFriendRequest(kid)">
              加好友
            </button>
            <button class="action-btn location-btn" @click.stop="showOnMap(kid)">
              地图
            </button>
          </view>
        </view>
      </view>

      <view v-if="hasMore" class="load-more" @click="loadMore">
        <text>加载更多</text>
      </view>
    </scroll-view>

    <!-- 孩子详情弹窗 -->
    <view v-if="showKidModal" class="modal-mask" @click="showKidModal = false">
      <view class="modal-content kid-detail-modal" @click.stop>
        <view class="detail-header">
          <text class="detail-emoji">{{ selectedKid?.emoji || '👶' }}</text>
          <text class="detail-name">{{ selectedKid?.name || '神秘小伙伴' }}</text>
        </view>
        <view class="detail-body">
          <view class="detail-row">
            <text class="detail-label">距离</text>
            <text class="detail-value">{{ selectedKid?.formattedDistance }}</text>
          </view>
          <view class="detail-row" v-if="selectedKid?.age">
            <text class="detail-label">年龄</text>
            <text class="detail-value">{{ selectedKid.age }}岁</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">最后在线</text>
            <text class="detail-value">{{ formatLastSeen(selectedKid?.lastSeen) }}</text>
          </view>
        </view>
        <view class="detail-actions">
          <button class="detail-action-btn primary" @click="sendFriendRequest(selectedKid)">
            发送好友请求
          </button>
          <button class="detail-action-btn" @click="showKidModal = false">
            关闭
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import locationService from '@/services/locationService'
import { friendService } from '@/services/friendService'

const loading = ref(false)
const hasLocationPermission = ref(false)
const currentLocation = ref(null)
const searchRadius = ref(5000)
const nearbyKids = ref([])
const showKidModal = ref(false)
const selectedKid = ref(null)
const hasMore = ref(false)
const page = ref(1)

const radiusOptions = [
  { label: '1km', value: 1000 },
  { label: '3km', value: 3000 },
  { label: '5km', value: 5000 },
  { label: '10km', value: 10000 }
]

const goBack = () => {
  uni.navigateBack()
}

const formatLocation = (location) => {
  if (!location) return ''
  return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
}

const formatLastSeen = (isoString) => {
  if (!isoString) return '未知'
  const date = new Date(isoString)
  const now = new Date()
  const diff = now - date
  const hours = Math.floor(diff / 3600000)
  
  if (hours < 1) return '刚刚'
  if (hours < 24) return `${hours}小时前`
  if (hours < 48) return '昨天'
  return `${Math.floor(hours / 24)}天前`
}

const requestLocationPermission = async () => {
  try {
    const granted = await locationService.requestLocationPermission()
    hasLocationPermission.value = granted
    
    if (granted) {
      await refreshLocation()
    } else {
      uni.showToast({
        title: '请开启位置权限',
        icon: 'none'
      })
    }
  } catch (err) {
    console.error('[nearby] Failed to request permission:', err)
  }
}

const refreshLocation = async () => {
  try {
    loading.value = true
    currentLocation.value = await locationService.getLocation()
    await loadNearbyKids()
  } catch (err) {
    console.error('[nearby] Failed to refresh location:', err)
    uni.showToast({
      title: '获取位置失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const setRadius = async (radius) => {
  searchRadius.value = radius
  page.value = 1
  nearbyKids.value = []
  await loadNearbyKids()
}

const loadNearbyKids = async () => {
  try {
    loading.value = true
    const kids = await locationService.getNearbyKids({
      radius: searchRadius.value,
      limit: 20
    })
    nearbyKids.value = kids
    hasMore.value = kids.length >= 20
  } catch (err) {
    console.error('[nearby] Failed to load nearby kids:', err)
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (!hasMore.value || loading.value) return
  
  try {
    loading.value = true
    page.value++
    const kids = await locationService.getNearbyKids({
      radius: searchRadius.value,
      limit: 20
    })
    nearbyKids.value = [...nearbyKids.value, ...kids]
    hasMore.value = kids.length >= 20
  } catch (err) {
    console.error('[nearby] Failed to load more:', err)
    page.value--
  } finally {
    loading.value = false
  }
}

const viewKidDetail = (kid) => {
  selectedKid.value = kid
  showKidModal.value = true
}

const sendFriendRequest = async (kid) => {
  try {
    await friendService.createFriendTable()
    
    const friend = {
      id: 'friend_' + Date.now(),
      owner_baby_id: 'current_baby_id', // 应该从 babyStore 获取
      friend_baby_id: kid.id,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await friendService.insertFriend(friend)
    
    uni.showToast({
      title: '已发送好友请求',
      icon: 'success'
    })
    
    showKidModal.value = false
  } catch (err) {
    console.error('[nearby] Failed to send friend request:', err)
    uni.showToast({
      title: '发送失败',
      icon: 'none'
    })
  }
}

const showOnMap = (kid) => {
  locationService.openLocation({
    latitude: kid.latitude,
    longitude: kid.longitude,
    name: kid.name,
    address: `距离 ${kid.formattedDistance}`
  })
}

onMounted(async () => {
  await locationService.init()
  await friendService.createFriendTable()
  
  hasLocationPermission.value = await locationService.checkLocationPermission()
  
  if (hasLocationPermission.value) {
    await refreshLocation()
  }
})
</script>

<style scoped>
.nearby-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.back-btn,
.refresh-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 36rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.location-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.location-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.location-text {
  flex: 1;
  font-size: 26rpx;
  color: #666;
}

.location-btn {
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 20rpx;
  border: none;
}

.radius-selector {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.radius-label {
  font-size: 26rpx;
  color: #666;
  margin-right: 16rpx;
}

.radius-options {
  display: flex;
  gap: 16rpx;
}

.radius-item {
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  background: #f5f5f5;
  color: #666;
  border-radius: 16rpx;
}

.radius-item.active {
  background: #8477fa;
  color: #fff;
}

.nearby-list {
  height: calc(100vh - 280rpx);
  padding: 16rpx 24rpx;
}

.loading-state,
.empty-state,
.permission-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.permission-icon,
.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.permission-text,
.empty-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #999;
}

.permission-btn {
  margin-top: 32rpx;
  font-size: 28rpx;
  padding: 20rpx 48rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 40rpx;
  border: none;
}

.kids-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.kid-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
}

.kid-avatar {
  width: 100rpx;
  height: 100rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.kid-emoji {
  font-size: 56rpx;
}

.kid-info {
  flex: 1;
}

.kid-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.kid-meta {
  display: flex;
  gap: 16rpx;
}

.kid-distance {
  font-size: 24rpx;
  color: #8477fa;
}

.kid-age {
  font-size: 24rpx;
  color: #999;
}

.kid-actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  font-size: 24rpx;
  padding: 12rpx 20rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 24rpx;
  border: none;
}

.action-btn.location-btn {
  background: #fff;
  color: #8477fa;
  border: 1rpx solid #8477fa;
}

.load-more {
  text-align: center;
  padding: 32rpx;
  color: #8477fa;
  font-size: 28rpx;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  border-radius: 24rpx;
  width: 600rpx;
  overflow: hidden;
}

.kid-detail-modal {
  padding: 0;
}

.detail-header {
  background: linear-gradient(135deg, #8477fa, #a599fa);
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-emoji {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.detail-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
}

.detail-body {
  padding: 32rpx;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 28rpx;
  color: #666;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
}

.detail-actions {
  padding: 24rpx 32rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.detail-action-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  border: none;
  font-size: 28rpx;
  background: #f5f5f5;
  color: #333;
}

.detail-action-btn.primary {
  background: #8477fa;
  color: #fff;
}
</style>
