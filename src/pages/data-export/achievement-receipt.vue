<template>
  <view class="achievement-receipt">
    <!-- Header with verification status -->
    <view class="receipt-header">
      <view class="status-badge" :class="receiptStatus">
        <text v-if="receiptStatus === 'verified'">✅ {{ $t('blockchain.verified') }}</text>
        <text v-else-if="receiptStatus === 'invalid'">❌ {{ $t('blockchain.invalid') }}</text>
        <text v-else>🔄 {{ $t('blockchain.verifying') }}</text>
      </view>
    </view>

    <!-- Receipt card -->
    <view class="receipt-card">
      <!-- Network info -->
      <view class="network-info">
        <view class="network-item">
          <text class="network-label">{{ $t('blockchain.network') }}</text>
          <text class="network-value">{{ receipt?.network?.network || 'Mock Network' }}</text>
        </view>
        <view class="network-item">
          <text class="network-label">{{ $t('blockchain.chainId') }}</text>
          <text class="network-value">{{ receipt?.network?.chainId || 'N/A' }}</text>
        </view>
        <view class="network-item">
          <text class="network-label">{{ $t('blockchain.blockHeight') }}</text>
          <text class="network-value">{{ receipt?.network?.blockHeight || 'N/A' }}</text>
        </view>
      </view>

      <!-- Transaction hash -->
      <view class="tx-section">
        <view class="section-label">{{ $t('blockchain.txHash') }}</view>
        <view class="tx-hash">{{ receipt?.txHash || '' }}</view>
        <view class="tx-hash-actions">
          <view class="hash-action" @click="copyHash">
            <text>📋 {{ $t('blockchain.copyHash') }}</text>
          </view>
          <view class="hash-action" @click="viewOnExplorer">
            <text>🔗 {{ $t('blockchain.viewExplorer') }}</text>
          </view>
        </view>
      </view>

      <!-- Receipt type -->
      <view class="receipt-type">
        <view class="type-badge" :class="receipt?.data?.type">
          <text v-if="receipt?.data?.type === 'ACHIEVEMENT_UNLOCK'">🏆 {{ $t('blockchain.achievementUnlock') }}</text>
          <text v-else-if="receipt?.data?.type === 'TASK_COMPLETION'">✅ {{ $t('blockchain.taskCompletion') }}</text>
          <text v-else>📜 {{ $t('blockchain.receipt') }}</text>
        </view>
      </view>

      <!-- Receipt content -->
      <view class="receipt-content">
        <!-- Achievement receipt content -->
        <view v-if="receipt?.data?.type === 'ACHIEVEMENT_UNLOCK'" class="achievement-detail">
          <view class="achievement-icon">{{ receipt.data.achievementIcon || '🏆' }}</view>
          <view class="achievement-name">{{ receipt.data.achievementName || '' }}</view>
          <view class="achievement-rarity">
            <text v-for="i in (receipt.data.rarity || 1)" :key="i">⭐</text>
          </view>
        </view>

        <!-- Task completion content -->
        <view v-else-if="receipt?.data?.type === 'TASK_COMPLETION'" class="task-detail">
          <view class="task-title">{{ receipt.data.taskTitle || '' }}</view>
          <view class="task-points">
            <text>+{{ receipt.data.rewardPoints || 0 }} {{ $t('blockchain.points') }}</text>
          </view>
        </view>

        <!-- Generic content -->
        <view v-else class="generic-content">
          <view class="content-type">{{ receipt?.data?.type || '' }}</view>
        </view>
      </view>

      <!-- Timestamp and confirmations -->
      <view class="receipt-meta">
        <view class="meta-item">
          <text class="meta-label">{{ $t('blockchain.timestamp') }}</text>
          <text class="meta-value">{{ formatTimestamp(receipt?.timestamp) }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">{{ $t('blockchain.confirmations') }}</text>
          <text class="meta-value">{{ receipt?.confirmations || 0 }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">{{ $t('blockchain.blockNumber') }}</text>
          <text class="meta-value">#{{ receipt?.blockNumber || 'N/A' }}</text>
        </view>
      </view>
    </view>

    <!-- Verification section -->
    <view class="verification-section">
      <view class="section-title">{{ $t('blockchain.verifyReceipt') }}</view>
      
      <view class="verify-input">
        <input 
          type="text" 
          v-model="verifyHashInput" 
          :placeholder="$t('blockchain.enterHash')"
          class="hash-input"
        />
        <button class="verify-btn" @click="verifyReceiptByHash">
          {{ $t('blockchain.verify') }}
        </button>
      </view>

      <view v-if="verifyResult !== null" class="verify-result">
        <view v-if="verifyResult" class="result-success">
          <text>✅ {{ $t('blockchain.validReceipt') }}</text>
        </view>
        <view v-else class="result-failed">
          <text>❌ {{ $t('blockchain.invalidReceipt') }}</text>
        </view>
      </view>
    </view>

    <!-- NFT-style achievement card -->
    <view v-if="receipt?.data?.type === 'ACHIEVEMENT_UNLOCK'" class="nft-card">
      <view class="nft-header">
        <text class="nft-label">🎨 {{ $t('blockchain.achievementNFT') }}</text>
      </view>
      <view class="nft-content">
        <view class="nft-icon">{{ receipt.data.achievementIcon || '🏆' }}</view>
        <view class="nft-title">{{ receipt.data.achievementName || '' }}</view>
        <view class="nft-description">
          {{ $t('blockchain.achievementProof') }}
        </view>
        <view class="nft-properties">
          <view class="nft-property">
            <text class="property-label">{{ $t('blockchain.rarity') }}</text>
            <text class="property-value">{{ receipt.data.rarity || 1 }}⭐</text>
          </view>
          <view class="nft-property">
            <text class="property-label">{{ $t('blockchain.unlockedAt') }}</text>
            <text class="property-value">{{ formatTimestamp(receipt.data.unlockedAt) }}</text>
          </view>
        </view>
      </view>
      <view class="nft-footer">
        <text class="nft-id">ID: {{ receipt?.txHash?.slice(0, 16) || 'N/A' }}...</text>
      </view>
    </view>

    <!-- Receipt history -->
    <view class="receipt-history">
      <view class="section-title">{{ $t('blockchain.receiptHistory') }}</view>
      
      <view v-if="achievementReceipts.length === 0" class="empty-state">
        <text>📜 {{ $t('blockchain.noReceipts') }}</text>
      </view>

      <view 
        v-for="r in achievementReceipts" 
        :key="r.txHash"
        class="receipt-item"
        @click="loadReceipt(r)"
      >
        <view class="receipt-item-icon">
          {{ r.data?.type === 'ACHIEVEMENT_UNLOCK' ? '🏆' : '✅' }}
        </view>
        <view class="receipt-item-content">
          <view class="receipt-item-title">
            {{ r.data?.achievementName || r.data?.taskTitle || r.data?.type || '' }}
          </view>
          <view class="receipt-item-date">
            {{ formatTimestamp(r.timestamp) }}
          </view>
        </view>
        <view class="receipt-item-hash">
          {{ r.txHash?.slice(0, 8) || '' }}...
        </view>
      </view>
    </view>

    <!-- Action buttons -->
    <view class="action-buttons">
      <button class="action-btn" @click="shareReceipt">
        {{ $t('blockchain.shareReceipt') }}
      </button>
    </view>
  </view>
</template>

<script>
import { useI18n } from '@/plugins/i18n'
import { getAchievementReceipts, getReceiptByHash, verifyAchievementReceipt } from '@/services/blockchainReceiptService'

const { t } = useI18n()

export default {
  data() {
    return {
      receipt: null,
      receiptStatus: 'pending',
      verifyHashInput: '',
      verifyResult: null,
      achievementReceipts: []
    }
  },
  onLoad(options) {
    // Load receipt from options or default list
    if (options.txHash) {
      this.loadReceiptByHash(options.txHash)
    }
    
    // Load achievement receipts list
    this.loadAchievementReceipts()
  },
  onShow() {
    // Refresh receipt list
    this.loadAchievementReceipts()
  },
  methods: {
    loadReceipt(receipt) {
      this.receipt = receipt
      this.verifyReceiptIntegrity()
    },
    loadReceiptByHash(txHash) {
      const receipt = getReceiptByHash(txHash)
      if (receipt) {
        this.receipt = receipt
        this.verifyReceiptIntegrity()
      } else {
        uni.showToast({
          title: t('blockchain.receiptNotFound'),
          icon: 'none'
        })
      }
    },
    async verifyReceiptIntegrity() {
      if (!this.receipt) return
      
      this.receiptStatus = 'verifying'
      
      try {
        const isValid = await verifyAchievementReceipt(this.receipt)
        this.receiptStatus = isValid ? 'verified' : 'invalid'
      } catch (e) {
        console.error('Verification failed:', e)
        this.receiptStatus = 'invalid'
      }
    },
    async verifyReceiptByHash() {
      if (!this.verifyHashInput.trim()) {
        uni.showToast({
          title: t('blockchain.enterHashToVerify'),
          icon: 'none'
        })
        return
      }
      
      const receipt = getReceiptByHash(this.verifyHashInput.trim())
      if (!receipt) {
        this.verifyResult = false
        uni.showToast({
          title: t('blockchain.receiptNotFound'),
          icon: 'none'
        })
        return
      }
      
      try {
        this.verifyResult = await verifyAchievementReceipt(receipt)
      } catch (e) {
        this.verifyResult = false
      }
    },
    copyHash() {
      if (!this.receipt?.txHash) return
      
      uni.setClipboardData({
        data: this.receipt.txHash,
        success: () => {
          uni.showToast({
            title: t('blockchain.hashCopied'),
            icon: 'success'
          })
        }
      })
    },
    viewOnExplorer() {
      if (!this.receipt?.proofUrl) return
      
      // In real app, this would open the blockchain explorer
      uni.showToast({
        title: t('blockchain.explorerNotAvailable'),
        icon: 'none'
      })
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return 'N/A'
      const date = new Date(timestamp)
      return date.toLocaleString()
    },
    loadAchievementReceipts() {
      this.achievementReceipts = getAchievementReceipts()
    },
    shareReceipt() {
      if (!this.receipt) return
      
      const shareText = this.receipt.data?.type === 'ACHIEVEMENT_UNLOCK'
        ? `🏆 I unlocked "${this.receipt.data.achievementName}" on FutureLittleLeaders! TX: ${this.receipt.txHash}`
        : `✅ I completed "${this.receipt.data.taskTitle}" on FutureLittleLeaders! TX: ${this.receipt.txHash}`
      
      uni.share({
        provider: 'weixin',
        type: 0,
        title: t('blockchain.shareTitle'),
        content: shareText,
        success: () => {
          uni.showToast({
            title: t('blockchain.shareSuccess'),
            icon: 'success'
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.achievement-receipt {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding: 20rpx;
}

.receipt-header {
  display: flex;
  justify-content: center;
  padding: 30rpx;
}

.status-badge {
  padding: 12rpx 30rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  font-weight: bold;
}

.status-badge.verified {
  background: linear-gradient(135deg, #52c41a, #73d13d);
  color: white;
}

.status-badge.invalid {
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
  color: white;
}

.status-badge.verifying {
  background: linear-gradient(135deg, #1890ff, #69c0ff);
  color: white;
}

.receipt-card {
  background: linear-gradient(145deg, #2d2d44, #1f1f33);
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.3);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
}

.network-info {
  display: flex;
  justify-content: space-between;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20rpx;
}

.network-item {
  text-align: center;
}

.network-label {
  display: block;
  font-size: 20rpx;
  color: #888;
  margin-bottom: 4rpx;
}

.network-value {
  font-size: 22rpx;
  color: #8477fa;
  font-weight: bold;
}

.tx-section {
  margin-bottom: 20rpx;
}

.section-label {
  font-size: 22rpx;
  color: #888;
  margin-bottom: 8rpx;
}

.tx-hash {
  font-size: 20rpx;
  color: #69c0ff;
  font-family: monospace;
  word-break: break-all;
  margin-bottom: 12rpx;
  padding: 12rpx;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8rpx;
}

.tx-hash-actions {
  display: flex;
  gap: 20rpx;
}

.hash-action {
  padding: 8rpx 16rpx;
  background: rgba(132, 119, 250, 0.2);
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #8477fa;
}

.receipt-type {
  margin-bottom: 20rpx;
}

.type-badge {
  display: inline-block;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  background: linear-gradient(135deg, #8477fa, #a599ff);
  color: white;
}

.receipt-content {
  text-align: center;
  padding: 30rpx;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.achievement-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.achievement-name {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 8rpx;
}

.achievement-rarity {
  font-size: 28rpx;
  color: #ffd700;
}

.task-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 12rpx;
}

.task-points {
  font-size: 28rpx;
  color: #52c41a;
}

.content-type {
  font-size: 28rpx;
  color: #888;
}

.receipt-meta {
  display: flex;
  justify-content: space-between;
}

.meta-item {
  text-align: center;
}

.meta-label {
  display: block;
  font-size: 20rpx;
  color: #666;
  margin-bottom: 4rpx;
}

.meta-value {
  font-size: 24rpx;
  color: #aaa;
}

.verification-section {
  background: white;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.verify-input {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.hash-input {
  flex: 1;
  padding: 16rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.verify-btn {
  padding: 16rpx 30rpx;
  background: #8477fa;
  color: white;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.verify-result {
  padding: 16rpx;
  border-radius: 8rpx;
  text-align: center;
  font-size: 26rpx;
}

.result-success {
  background: #e8f5e9;
  color: #2e7d32;
}

.result-failed {
  background: #ffebee;
  color: #c62828;
}

.nft-card {
  background: linear-gradient(145deg, #2d2d44, #1f1f33);
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  border: 2rpx solid rgba(255, 215, 0, 0.3);
}

.nft-header {
  padding: 20rpx;
  background: rgba(255, 215, 0, 0.1);
}

.nft-label {
  font-size: 24rpx;
  color: #ffd700;
}

.nft-content {
  padding: 40rpx 30rpx;
  text-align: center;
}

.nft-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.nft-title {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 12rpx;
}

.nft-description {
  font-size: 24rpx;
  color: #888;
  margin-bottom: 30rpx;
}

.nft-properties {
  display: flex;
  justify-content: space-around;
}

.nft-property {
  text-align: center;
}

.property-label {
  display: block;
  font-size: 20rpx;
  color: #666;
  margin-bottom: 4rpx;
}

.property-value {
  font-size: 26rpx;
  color: #8477fa;
}

.nft-footer {
  padding: 16rpx;
  background: rgba(0, 0, 0, 0.2);
  text-align: center;
}

.nft-id {
  font-size: 20rpx;
  color: #666;
  font-family: monospace;
}

.receipt-history {
  background: white;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.empty-state {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}

.receipt-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.receipt-item:last-child {
  border-bottom: none;
}

.receipt-item-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.receipt-item-content {
  flex: 1;
}

.receipt-item-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 4rpx;
}

.receipt-item-date {
  font-size: 22rpx;
  color: #999;
}

.receipt-item-hash {
  font-size: 22rpx;
  color: #8477fa;
  font-family: monospace;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  padding: 24rpx;
  background: linear-gradient(135deg, #8477fa, #a599ff);
  color: white;
  border-radius: 12rpx;
  font-size: 28rpx;
  text-align: center;
}
</style>
