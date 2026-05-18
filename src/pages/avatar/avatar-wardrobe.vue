<template>
  <view class="avatar-wardrobe">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">虚拟衣柜</text>
      <text class="subtitle">解锁更多装扮</text>
    </view>

    <!-- Avatar 预览 -->
    <view class="avatar-preview">
      <view class="preview-avatar">
        <text class="avatar-display">{{ avatarStore.avatarDisplay }}</text>
      </view>
      <view class="preview-info">
        <text class="level-text">等级 {{ avatarStore.avatarData?.level || 1 }}</text>
        <text class="points-text">成就积分 {{ avatarStore.achievementsData?.totalPoints || 0 }}</text>
      </view>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ active: currentTab === 'outfits' }"
        @click="currentTab = 'outfits'"
      >
        <text class="tab-icon">👔</text>
        <text class="tab-text">服装</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'accessories' }"
        @click="currentTab = 'accessories'"
      >
        <text class="tab-icon">💎</text>
        <text class="tab-text">配饰</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'expressions' }"
        @click="currentTab = 'expressions'"
      >
        <text class="tab-icon">😊</text>
        <text class="tab-text">表情</text>
      </view>
    </view>

    <!-- 服装列表 -->
    <view class="items-section" v-if="currentTab === 'outfits'">
      <view class="section-title">
        <text>已拥有 ({{ avatarStore.unlockedOutfits.length }})</text>
      </view>
      <view class="items-grid">
        <view
          v-for="outfit in avatarStore.unlockedOutfits"
          :key="outfit.id"
          class="item-card owned"
          :class="{ selected: avatarStore.avatarData?.outfit === outfit.id }"
          @click="avatarStore.setOutfit(outfit.id)"
        >
          <text class="item-icon">{{ outfit.icon }}</text>
          <text class="item-name">{{ outfit.name }}</text>
          <text class="item-badge" v-if="avatarStore.avatarData?.outfit === outfit.id">穿着中</text>
        </view>
      </view>

      <view class="section-title locked-title" v-if="avatarStore.lockedOutfits.length > 0">
        <text>未解锁 ({{ avatarStore.lockedOutfits.length }})</text>
      </view>
      <view class="items-grid" v-if="avatarStore.lockedOutfits.length > 0">
        <view
          v-for="outfit in avatarStore.lockedOutfits"
          :key="outfit.id"
          class="item-card locked"
          @click="handlePurchase('outfit', outfit)"
        >
          <text class="item-icon">{{ outfit.icon }}</text>
          <text class="item-name">{{ outfit.name }}</text>
          <view class="item-requirement">
            <text class="level-req">Lv.{{ outfit.unlockLevel }}</text>
            <text class="price" v-if="outfit.price > 0">{{ outfit.price }}积分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 配饰列表 -->
    <view class="items-section" v-if="currentTab === 'accessories'">
      <view class="section-title">
        <text>已拥有 ({{ avatarStore.unlockedAccessories.length }})</text>
      </view>
      <view class="items-grid">
        <view
          v-for="acc in avatarStore.unlockedAccessories"
          :key="acc.id"
          class="item-card owned"
          :class="{ selected: avatarStore.avatarData?.accessories === acc.id }"
          @click="avatarStore.setAccessories(acc.id)"
        >
          <text class="item-icon">{{ acc.icon }}</text>
          <text class="item-name">{{ acc.name }}</text>
          <text class="item-badge" v-if="avatarStore.avatarData?.accessories === acc.id">佩戴中</text>
        </view>
      </view>

      <view class="section-title locked-title" v-if="avatarStore.lockedAccessories.length > 0">
        <text>未解锁 ({{ avatarStore.lockedAccessories.length }})</text>
      </view>
      <view class="items-grid" v-if="avatarStore.lockedAccessories.length > 0">
        <view
          v-for="acc in avatarStore.lockedAccessories"
          :key="acc.id"
          class="item-card locked"
          @click="handlePurchase('accessory', acc)"
        >
          <text class="item-icon">{{ acc.icon }}</text>
          <text class="item-name">{{ acc.name }}</text>
          <view class="item-requirement">
            <text class="level-req">Lv.{{ acc.unlockLevel }}</text>
            <text class="price" v-if="acc.price > 0">{{ acc.price }}积分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 表情列表 -->
    <view class="items-section" v-if="currentTab === 'expressions'">
      <view class="section-title">
        <text>已解锁 ({{ avatarStore.unlockedExpressions.length }})</text>
      </view>
      <view class="items-grid">
        <view
          v-for="expr in avatarStore.unlockedExpressions"
          :key="expr.id"
          class="item-card owned expression-card"
          :class="{ selected: avatarStore.currentExpression === expr.id }"
          @click="avatarStore.setExpression(expr.id)"
        >
          <text class="item-icon">{{ expr.icon }}</text>
          <text class="item-name">{{ expr.name }}</text>
          <text class="item-badge" v-if="avatarStore.currentExpression === expr.id">使用中</text>
        </view>
      </view>

      <view class="section-title locked-title" v-if="avatarStore.lockedExpressions.length > 0">
        <text>未解锁 ({{ avatarStore.lockedExpressions.length }})</text>
      </view>
      <view class="items-grid" v-if="avatarStore.lockedExpressions.length > 0">
        <view
          v-for="expr in avatarStore.lockedExpressions"
          :key="expr.id"
          class="item-card locked"
          @click="handlePurchase('expression', expr)"
        >
          <text class="item-icon">{{ expr.icon }}</text>
          <text class="item-name">{{ expr.name }}</text>
          <view class="item-requirement">
            <text class="level-req">Lv.{{ expr.unlockLevel }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 成就弹窗 -->
    <view class="achievement-modal" v-if="avatarStore.showAchievementModal" @click="avatarStore.closeAchievementModal">
      <view class="modal-content" @click.stop>
        <text class="achievement-icon">{{ newAchievement?.icon || '🎉' }}</text>
        <text class="achievement-title">成就解锁！</text>
        <text class="achievement-name">{{ newAchievement?.name || '' }}</text>
        <text class="achievement-desc">{{ newAchievement?.description || '' }}</text>
        <text class="achievement-points">+{{ newAchievement?.points || 0 }} 积分</text>
        <button class="modal-btn" @click="avatarStore.closeAchievementModal">太棒了！</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAvatarStore } from '@/stores/avatarStore.js'
import avatarService from '@/services/avatarService.js'

const avatarStore = useAvatarStore()
const currentTab = ref('outfits')

const newAchievement = computed(() => avatarStore.newAchievement)

const handlePurchase = (itemType, item) => {
  if (avatarStore.avatarData?.level < item.unlockLevel) {
    uni.showToast({ title: `需要等级${item.unlockLevel}解锁`, icon: 'none' })
    return
  }
  avatarStore.purchaseItem(itemType, item.id)
}

onMounted(() => {
  avatarStore.init()
})
</script>

<style scoped>
.avatar-wardrobe {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
  padding-bottom: 100px;
}

.header {
  margin-bottom: 16px;
}

.header .title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  display: block;
}

.header .subtitle {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
  display: block;
}

.avatar-preview {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.preview-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #8477fa20 0%, #9b95f910 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-display {
  font-size: 40px;
}

.preview-info {
  flex: 1;
}

.level-text {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
}

.points-text {
  font-size: 12px;
  color: #8477fa;
  margin-top: 4px;
  display: block;
}

.tab-bar {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 16px;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s;
}

.tab-item.active {
  background: linear-gradient(135deg, #8477fa 0%, #9b95f9 100%);
}

.tab-item .tab-icon {
  font-size: 20px;
}

.tab-item .tab-text {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.tab-item.active .tab-text {
  color: #fff;
}

.items-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 14px;
  color: #333;
  font-weight: bold;
}

.locked-title {
  margin-top: 8px;
  color: #999;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.item-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.item-card.owned {
  cursor: pointer;
}

.item-card.owned.selected {
  border-color: #8477fa;
  background: #f0eeff;
}

.item-card.locked {
  opacity: 0.7;
  background: #f8f8f8;
}

.item-icon {
  font-size: 32px;
}

.item-name {
  font-size: 12px;
  color: #333;
  text-align: center;
}

.item-badge {
  font-size: 10px;
  color: #8477fa;
  background: #f0eeff;
  padding: 2px 8px;
  border-radius: 8px;
  position: absolute;
  top: 4px;
  right: 4px;
}

.item-requirement {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.level-req {
  font-size: 10px;
  color: #999;
}

.price {
  font-size: 10px;
  color: #f59e0b;
  font-weight: bold;
}

.expression-card {
  padding: 14px 10px;
}

.achievement-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  width: 280px;
}

.achievement-icon {
  font-size: 60px;
  display: block;
  margin-bottom: 16px;
}

.achievement-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.achievement-name {
  font-size: 18px;
  color: #8477fa;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
}

.achievement-desc {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 12px;
}

.achievement-points {
  font-size: 16px;
  color: #f59e0b;
  font-weight: bold;
  display: block;
  margin-bottom: 20px;
}

.modal-btn {
  background: linear-gradient(135deg, #8477fa 0%, #9b95f9 100%);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 12px 32px;
  font-size: 16px;
}
</style>
