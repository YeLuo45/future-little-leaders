<template>
  <view class="certificate-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <view class="header-title">
        <text>品格证书</text>
      </view>
      <view class="header-right"></view>
    </view>

    <!-- 证书展示 -->
    <view class="certificate-display" v-if="certificate">
      <view class="cert-frame" :style="{ borderColor: getCharacterInfo(certificate.characterType)?.color }">
        <view class="cert-header">
          <text class="cert-badge-icon">{{ getCharacterInfo(certificate.characterType)?.emoji }}</text>
          <text class="cert-main-title">品格修炼证书</text>
          <text class="cert-subtitle">CHARACTER DEVELOPMENT CERTIFICATE</text>
        </view>
        
        <view class="cert-body">
          <text class="cert-label">授予</text>
          <text class="cert-name">{{ babyName }}</text>
          <text class="cert-label">在品格修炼道路上取得优异成绩</text>
          
          <view class="cert-character">
            <text class="cert-character-name">{{ getCharacterInfo(certificate.characterType)?.label }}</text>
            <text class="cert-character-desc">{{ getCharacterInfo(certificate.characterType)?.description }}</text>
          </view>
          
          <view class="cert-level-info">
            <text class="cert-level-label">达到等级</text>
            <text class="cert-level-value">Lv.{{ certificate.level }} {{ getLevelName(certificate.level) }}</text>
          </view>
          
          <view class="cert-date">
            <text>发证日期：{{ formatDate(certificate.earnedAt) }}</text>
          </view>
        </view>
        
        <view class="cert-footer">
          <text class="cert-number">{{ certificate.certificateNumber }}</text>
          <text class="cert-org">未来领袖培养计划</text>
        </view>
        
        <view class="cert-seal" :style="{ backgroundColor: getCharacterInfo(certificate.characterType)?.color }">
          <text class="seal-text">认证</text>
        </view>
      </view>
    </view>

    <!-- 无证书提示 -->
    <view class="empty-state" v-else>
      <text class="empty-icon">🏆</text>
      <text class="empty-title">暂未获得证书</text>
      <text class="empty-desc">继续努力提升品格等级，达到3级可获得证书</text>
      <button class="go-practice-btn" @click="goToPractice">去修炼</button>
    </view>

    <!-- 品格等级信息 -->
    <view class="level-info-section" v-if="certificate">
      <view class="section-header">
        <text class="section-title">当前品格等级</text>
      </view>
      <view class="level-cards">
        <view 
          v-for="type in characterTypes" 
          :key="type"
          class="level-card"
          :style="{ borderColor: getCharacterInfo(type)?.color }"
        >
          <view class="level-header">
            <text class="level-emoji">{{ getCharacterInfo(type)?.emoji }}</text>
            <text class="level-name">{{ getCharacterInfo(type)?.label }}</text>
          </view>
          <text class="level-value">Lv.{{ characterLevels[type]?.level || 1 }}</text>
          <text class="level-exp">{{ characterLevels[type]?.exp || 0 }} EXP</text>
          <view class="level-progress">
            <view 
              class="progress-fill" 
              :style="{ width: levelProgress[type]?.progress + '%', backgroundColor: getCharacterInfo(type)?.color }"
            ></view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCharacterQuestStore } from '@/stores/characterQuestStore.js'
import { useBabyStore } from '@/stores/babyStore.js'

const characterQuestStore = useCharacterQuestStore()
const babyStore = useBabyStore()

const certificateId = ref(null)
const certificate = ref(null)

const characterTypes = computed(() => characterQuestStore.getAllCharacterTypes())
const getCharacterInfo = (type) => characterQuestStore.getCharacterInfo(type)
const getLevelName = (level) => characterQuestStore.getLevelName(level)
const characterLevels = computed(() => characterQuestStore.characterLevels)
const levelProgress = computed(() => characterQuestStore.levelProgress)

const babyName = computed(() => {
  const baby = babyStore.currentBaby
  return baby?.name || '小领袖'
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

const goBack = () => {
  uni.navigateBack()
}

const goToPractice = () => {
  uni.switchTab({ url: '/pages/character/character' })
}

onMounted(() => {
  characterQuestStore.init()
  
  // 获取证书ID
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage.options?.id) {
    certificateId.value = currentPage.options.id
    certificate.value = characterQuestStore.getCertificateById(certificateId.value)
  }
})
</script>

<style scoped>
.certificate-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding-bottom: 120rpx;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 40rpx 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-left, .header-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 36rpx;
  color: #ffffff;
}

.header-title {
  flex: 1;
  text-align: center;
}

.header-title text {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.certificate-display {
  padding: 40rpx;
}

.cert-frame {
  background: linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%);
  border: 4rpx solid;
  border-radius: 20rpx;
  padding: 50rpx 40rpx;
  position: relative;
  overflow: hidden;
}

.cert-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.cert-badge-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 16rpx;
}

.cert-main-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 8rpx;
}

.cert-subtitle {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 4rpx;
}

.cert-body {
  text-align: center;
}

.cert-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  display: block;
  margin-bottom: 8rpx;
}

.cert-name {
  font-size: 44rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 20rpx;
}

.cert-character {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 30rpx;
  margin: 30rpx 0;
}

.cert-character-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 8rpx;
}

.cert-character-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.cert-level-info {
  margin: 30rpx 0;
}

.cert-level-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  display: block;
  margin-bottom: 8rpx;
}

.cert-level-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.cert-date {
  margin-top: 20rpx;
}

.cert-date text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.cert-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 40rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.cert-number {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.4);
}

.cert-org {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.cert-seal {
  position: absolute;
  right: 40rpx;
  bottom: 100rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}

.seal-text {
  font-size: 24rpx;
  font-weight: bold;
  color: #ffffff;
}

.empty-state {
  text-align: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  display: block;
  margin-bottom: 30rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
  display: block;
  margin-bottom: 40rpx;
}

.go-practice-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 28rpx;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  border: none;
}

.level-info-section {
  margin: 40rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
}

.level-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.level-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16rpx;
  padding: 24rpx;
  border: 2rpx solid;
}

.level-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.level-emoji {
  font-size: 32rpx;
}

.level-name {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: bold;
}

.level-value {
  font-size: 28rpx;
  color: #ffffff;
  display: block;
  margin-bottom: 4rpx;
}

.level-exp {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
  display: block;
  margin-bottom: 12rpx;
}

.level-progress {
  height: 8rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4rpx;
  transition: width 0.3s ease;
}
</style>
