<template>
  <view class="share-card-page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">分享卡片</text>
      <view class="right-btn" @click="showHistory">
        <text class="icon">📋</text>
      </view>
    </view>

    <!-- 模板选择 -->
    <view class="template-section">
      <text class="section-title">选择模板</text>
      <scroll-view class="template-list" scroll-x>
        <view
          v-for="template in templates"
          :key="template.id"
          class="template-item"
          :class="{ active: selectedTemplate === template.id }"
          @click="selectTemplate(template.id)"
        >
          <view class="template-preview" :style="{ background: template.backgroundColor }">
            <text class="template-icon">🎨</text>
          </view>
          <text class="template-name">{{ template.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 卡片预览 -->
    <view class="preview-section">
      <text class="section-title">卡片预览</text>
      <view class="card-preview">
        <share-poster
          ref="posterRef"
          :template="selectedTemplate"
          :card-data="cardData"
          :width="300"
          :height="400"
        />
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <button class="action-btn save-btn" @click="saveToAlbum">
        <text class="btn-icon">💾</text>
        <text class="btn-text">保存图片</text>
      </button>
      <button class="action-btn share-btn" @click="shareToFriend">
        <text class="btn-icon">👥</text>
        <text class="btn-text">分享给朋友</text>
      </button>
      <button class="action-btn timeline-btn" @click="shareToTimeline">
        <text class="btn-icon">📱</text>
        <text class="btn-text">分享到朋友圈</text>
      </button>
    </view>

    <!-- 生成中提示 -->
    <view v-if="isGenerating" class="loading-mask">
      <view class="loading-content">
        <text class="loading-text">正在生成海报...</text>
      </view>
    </view>

    <!-- 历史记录弹窗 -->
    <view v-if="showHistoryModal" class="modal-mask" @click="showHistoryModal = false">
      <view class="modal-content history-modal" @click.stop>
        <text class="modal-title">分享历史</text>
        <scroll-view class="history-list" scroll-y>
          <view v-if="shareHistory.length === 0" class="empty-history">
            <text>暂无分享记录</text>
          </view>
          <view
            v-for="item in shareHistory"
            :key="item.id"
            class="history-item"
            @click="loadHistoryItem(item)"
          >
            <text class="history-template">{{ item.card_template }}</text>
            <text class="history-time">{{ formatTime(item.created_at) }}</text>
          </view>
        </scroll-view>
        <button class="close-btn" @click="showHistoryModal = false">关闭</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useBabyStore } from '@/stores/babyStore'
import { useAchievementStore } from '@/stores/achievementStore'
import wxService from '@/services/wxService'
import sharePoster from '@/components/wx/share-poster.vue'

const babyStore = useBabyStore()
const achievementStore = useAchievementStore()

const posterRef = ref(null)
const selectedTemplate = ref('default')
const isGenerating = ref(false)
const showHistoryModal = ref(false)
const shareHistory = ref([])

const templates = wxService.getCardTemplates()

const cardData = reactive({
  baby_id: '',
  baby_name: '小小领袖',
  baby_avatar: '',
  baby_emoji: '👶',
  achievements: [],
  achievement_count: 0,
  total_points: 0,
  level: 1,
  template: 'default',
  created_at: '',
  date: '',
  time: ''
})

const goBack = () => {
  uni.navigateBack()
}

const showHistory = () => {
  loadShareHistory()
  showHistoryModal.value = true
}

const loadShareHistory = async () => {
  try {
    const userId = babyStore.currentUserId || 'default_user'
    shareHistory.value = await wxService.getShareHistory(userId)
  } catch (err) {
    console.error('[share-card] Failed to load share history:', err)
  }
}

const loadHistoryItem = (item) => {
  try {
    const data = JSON.parse(item.card_data)
    Object.assign(cardData, data)
    selectedTemplate.value = item.card_template || 'default'
    showHistoryModal.value = false
  } catch (err) {
    console.error('[share-card] Failed to parse history data:', err)
  }
}

const selectTemplate = (templateId) => {
  selectedTemplate.value = templateId
  cardData.template = templateId
}

const updateCardData = () => {
  const currentBaby = babyStore.currentBaby
  
  cardData.baby_id = currentBaby?.id || ''
  cardData.baby_name = currentBaby?.name || '小小领袖'
  cardData.baby_avatar = currentBaby?.avatar || ''
  cardData.baby_emoji = currentBaby?.emoji || '👶'
  cardData.total_points = currentBaby?.total_points || 0
  cardData.level = currentBaby?.level || 1
  
  // 获取成就
  const achievements = achievementStore?.achievements || []
  cardData.achievements = achievements.slice(0, 3)
  cardData.achievement_count = achievements.length
  
  const now = new Date()
  cardData.created_at = now.toISOString()
  cardData.date = now.toLocaleDateString('zh-CN')
  cardData.time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const saveToAlbum = async () => {
  try {
    isGenerating.value = true
    
    // 生成海报
    const posterData = await posterRef.value?.generatePoster()
    if (!posterData) {
      throw new Error('海报生成失败')
    }

    // #ifdef H5
    // H5 端下载
    const link = document.createElement('a')
    link.download = `share-card-${Date.now()}.png`
    link.href = posterData
    link.click()
    uni.showToast({ title: '图片已下载', icon: 'success' })
    // #endif

    // #ifdef MP-WEIXIN
    // 小程序端保存到相册
    const saved = await wx.saveImageToPhotosAlbum({
      filePath: posterData
    })
    if (saved) {
      uni.showToast({ title: '已保存到相册', icon: 'success' })
    }
    // #endif

    // 保存分享记录
    await saveShareRecord()
  } catch (err) {
    console.error('[share-card] Failed to save:', err)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    isGenerating.value = false
  }
}

const shareToFriend = async () => {
  try {
    updateCardData()
    
    await wxService.shareToFriend({
      title: `${cardData.baby_name}的成长记录`,
      desc: `累计${cardData.achievement_count}个成就，等级Lv.${cardData.level}`,
      path: `/pages/wx/share-card?baby_id=${cardData.baby_id}`,
      imageUrl: cardData.baby_avatar,
      extra: { card_data: cardData }
    })
    
    await saveShareRecord()
  } catch (err) {
    console.error('[share-card] Failed to share to friend:', err)
    uni.showToast({ title: '分享失败', icon: 'none' })
  }
}

const shareToTimeline = async () => {
  try {
    updateCardData()
    
    await wxService.shareToTimeline({
      title: `${cardData.baby_name}的成长记录 - ${cardData.achievement_count}个成就`,
      query: `baby_id=${cardData.baby_id}`,
      imageUrl: cardData.baby_avatar,
      extra: { card_data: cardData }
    })
    
    await saveShareRecord()
  } catch (err) {
    console.error('[share-card] Failed to share to timeline:', err)
    uni.showToast({ title: '分享失败', icon: 'none' })
  }
}

const saveShareRecord = async () => {
  try {
    const shareData = {
      id: 'share_' + Date.now(),
      user_id: babyStore.currentUserId || 'default_user',
      baby_id: cardData.baby_id,
      share_type: 'card',
      card_template: selectedTemplate.value,
      card_data: cardData
    }
    
    await wxService.saveShareRecord(shareData)
  } catch (err) {
    console.error('[share-card] Failed to save share record:', err)
  }
}

const formatTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN')
}

onMounted(async () => {
  await wxService.init()
  updateCardData()
})
</script>

<style scoped>
.share-card-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
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
.right-btn {
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

.template-section,
.preview-section {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.template-list {
  white-space: nowrap;
}

.template-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-right: 24rpx;
  width: 160rpx;
}

.template-item.active .template-preview {
  border: 4rpx solid #8477fa;
}

.template-preview {
  width: 140rpx;
  height: 180rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid transparent;
}

.template-icon {
  font-size: 60rpx;
}

.template-name {
  font-size: 24rpx;
  color: #666;
  margin-top: 12rpx;
}

.preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-preview {
  width: 300px;
  height: 400px;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 16rpx;
  padding: 24rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-size: 28rpx;
}

.save-btn {
  background: #fff;
  color: #8477fa;
  border: 2rpx solid #8477fa;
}

.share-btn {
  background: #8477fa;
  color: #fff;
}

.timeline-btn {
  background: #07c160;
  color: #fff;
}

.btn-icon {
  margin-right: 8rpx;
  font-size: 32rpx;
}

.loading-mask {
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

.loading-content {
  background: #fff;
  padding: 40rpx 60rpx;
  border-radius: 16rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #333;
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
  padding: 32rpx;
  width: 600rpx;
  max-height: 800rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 24rpx;
  display: block;
}

.history-list {
  max-height: 500rpx;
}

.empty-history {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.history-template {
  font-size: 28rpx;
  color: #333;
}

.history-time {
  font-size: 24rpx;
  color: #999;
}

.close-btn {
  width: 100%;
  height: 80rpx;
  background: #8477fa;
  color: #fff;
  border-radius: 40rpx;
  margin-top: 24rpx;
  border: none;
  font-size: 28rpx;
}
</style>
