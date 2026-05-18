<!--
  家庭积分池组件
  展示家庭共享积分池余额和转账记录
-->
<template>
  <view class="family-points-pool">
    <!-- 积分池余额卡片 -->
    <view class="pool-balance-card">
      <view class="balance-header">
        <text class="balance-icon">🏦</text>
        <text class="balance-title">家庭积分池</text>
      </view>
      <view class="balance-amount">
        <text class="amount-value">{{ poolBalance }}</text>
        <text class="amount-unit">积分</text>
      </view>
      <view class="balance-actions">
        <view class="action-btn primary" @tap="onAllocate" hover-class="hover">
          <text>分配积分</text>
        </view>
        <view class="action-btn" @tap="onDeposit" hover-class="hover">
          <text>存入积分</text>
        </view>
      </view>
    </view>

    <!-- 转账记录列表 -->
    <view class="transfer-records">
      <view class="records-header">
        <text class="records-title">积分变动记录</text>
        <text class="records-count">共 {{ records.length }} 条</text>
      </view>

      <view v-if="records.length === 0" class="empty-state">
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无积分变动记录</text>
      </view>

      <scroll-view v-else scroll-y class="records-list">
        <view
          v-for="record in displayedRecords"
          :key="record.id"
          class="record-item"
        >
          <view class="record-icon" :class="getRecordIconClass(record)">
            <text>{{ getRecordIcon(record) }}</text>
          </view>
          <view class="record-info">
            <text class="record-desc">{{ formatRecordDesc(record) }}</text>
            <text class="record-time">{{ formatTime(record.createdAt) }}</text>
          </view>
          <view class="record-points" :class="getPointsClass(record)">
            <text>{{ getPointsChange(record) }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 分配积分弹窗 -->
    <uni-popup ref="allocatePopup" type="center">
      <view class="popup-content">
        <text class="popup-title">分配积分</text>
        <view class="input-group">
          <text class="input-label">选择儿童</text>
          <picker
            :range="children"
            range-key="name"
            @change="onSelectChild"
            :value="selectedChildIndex"
          >
            <view class="picker-value">
              {{ selectedChild ? selectedChild.name : '请选择' }}
            </view>
          </picker>
        </view>
        <view class="input-group">
          <text class="input-label">分配积分</text>
          <input
            type="number"
            v-model="allocateAmount"
            placeholder="请输入积分数量"
            class="input-field"
          />
        </view>
        <view class="popup-actions">
          <view class="popup-btn cancel" @tap="closeAllocatePopup">
            <text>取消</text>
          </view>
          <view class="popup-btn confirm" @tap="confirmAllocate">
            <text>确认分配</text>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 存入积分弹窗 -->
    <uni-popup ref="depositPopup" type="center">
      <view class="popup-content">
        <text class="popup-title">存入积分</text>
        <view class="input-group">
          <text class="input-label">选择儿童</text>
          <picker
            :range="children"
            range-key="name"
            @change="onSelectChild"
            :value="selectedChildIndex"
          >
            <view class="picker-value">
              {{ selectedChild ? selectedChild.name : '请选择' }}
            </view>
          </picker>
        </view>
        <view class="input-group">
          <text class="input-label">存入积分</text>
          <input
            type="number"
            v-model="depositAmount"
            placeholder="请输入积分数量"
            class="input-field"
          />
        </view>
        <view class="popup-actions">
          <view class="popup-btn cancel" @tap="closeDepositPopup">
            <text>取消</text>
          </view>
          <view class="popup-btn confirm" @tap="confirmDeposit">
            <text>确认存入</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFamilyStore } from '@/stores/familyStore.js'

const familyStore = useFamilyStore()

// 积分池余额
const poolBalance = computed(() => familyStore.familyPointsPool)

// 儿童列表
const children = computed(() => familyStore.children)

// 转账记录
const records = computed(() => familyStore.pointsTransferRecords)
const displayedRecords = computed(() => records.value.slice(0, 20))

// 选择状态
const selectedChildIndex = ref(0)
const selectedChild = computed(() => children.value[selectedChildIndex.value])

// 弹窗状态
const allocatePopup = ref(null)
const depositPopup = ref(null)
const allocateAmount = ref('')
const depositAmount = ref('')

// 分配积分
const onAllocate = () => {
  if (children.value.length === 0) {
    uni.showToast({ title: '暂无儿童', icon: 'none' })
    return
  }
  selectedChildIndex.value = 0
  allocateAmount.value = ''
  allocatePopup.value.open()
}

const closeAllocatePopup = () => {
  allocatePopup.value.close()
}

const onSelectChild = (e) => {
  selectedChildIndex.value = e.detail.value
}

const confirmAllocate = () => {
  const amount = parseInt(allocateAmount.value)
  if (!amount || amount <= 0) {
    uni.showToast({ title: '请输入有效积分', icon: 'none' })
    return
  }
  const success = familyStore.allocatePointsFromPool(
    selectedChild.value.id,
    amount,
    '家长分配积分'
  )
  if (success) {
    closeAllocatePopup()
    uni.showToast({ title: '分配成功', icon: 'success' })
  }
}

// 存入积分
const onDeposit = () => {
  if (children.value.length === 0) {
    uni.showToast({ title: '暂无儿童', icon: 'none' })
    return
  }
  selectedChildIndex.value = 0
  depositAmount.value = ''
  depositPopup.value.open()
}

const closeDepositPopup = () => {
  depositPopup.value.close()
}

const confirmDeposit = () => {
  const amount = parseInt(depositAmount.value)
  if (!amount || amount <= 0) {
    uni.showToast({ title: '请输入有效积分', icon: 'none' })
    return
  }
  const success = familyStore.depositPointsToPool(
    selectedChild.value.id,
    amount,
    '存入积分池'
  )
  if (success) {
    closeDepositPopup()
    uni.showToast({ title: '存入成功', icon: 'success' })
  }
}

// 格式化记录描述
const formatRecordDesc = (record) => {
  if (record.type === 'help_bonus') {
    return record.reason || '互助奖励'
  }
  if (record.fromType === 'pool') {
    return `分配给 ${familyStore.getChildName(record.toChildId)}`
  }
  if (record.toType === 'pool') {
    return `${familyStore.getChildName(record.fromChildId)} 存入`
  }
  if (record.fromChildId && record.toChildId) {
    return `${familyStore.getChildName(record.fromChildId)} → ${familyStore.getChildName(record.toChildId)}`
  }
  if (record.fromType === 'parent_reward') {
    return record.reason || '家长奖励'
  }
  return record.reason || '积分变动'
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`

  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 获取记录图标
const getRecordIcon = (record) => {
  if (record.type === 'help_bonus') return '🤝'
  if (record.fromType === 'pool') return '📤'
  if (record.toType === 'pool') return '📥'
  if (record.fromType === 'parent_reward') return '👨‍👩‍👧'
  return '💰'
}

const getRecordIconClass = (record) => {
  if (record.type === 'help_bonus') return 'icon-help'
  if (record.fromType === 'pool') return 'icon-out'
  if (record.toType === 'pool') return 'icon-in'
  if (record.fromType === 'parent_reward') return 'icon-reward'
  return 'icon-transfer'
}

// 获取积分变化文字
const getPointsChange = (record) => {
  if (record.fromType === 'pool') return `-${record.points}`
  if (record.toType === 'pool') return `+${record.points}`
  if (record.fromChildId && record.toChildId) {
    return record.fromChildId === selectedChild.value?.id ? `-${record.points}` : `+${record.points}`
  }
  return record.points > 0 ? `+${record.points}` : `${record.points}`
}

const getPointsClass = (record) => {
  if (record.fromType === 'pool') return 'points-out'
  if (record.toType === 'pool') return 'points-in'
  if (record.fromChildId && record.toChildId) {
    return record.fromChildId === selectedChild.value?.id ? 'points-out' : 'points-in'
  }
  return 'points-neutral'
}
</script>

<style scoped>
.family-points-pool {
  padding: 16rpx;
}

.pool-balance-card {
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.balance-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.balance-icon {
  font-size: 40rpx;
  margin-right: 12rpx;
}

.balance-title {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.balance-amount {
  display: flex;
  align-items: baseline;
  margin-bottom: 32rpx;
}

.amount-value {
  font-size: 72rpx;
  font-weight: 700;
  color: #ffffff;
}

.amount-unit {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 12rpx;
}

.balance-actions {
  display: flex;
  gap: 24rpx;
}

.action-btn {
  flex: 1;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  text-align: center;
}

.action-btn text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
}

.action-btn.primary {
  background: #ffffff;
}

.action-btn.primary text {
  color: #667EEA;
}

.hover {
  opacity: 0.8;
}

.transfer-records {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.records-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
}

.records-count {
  font-size: 24rpx;
  color: #6B7280;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx;
}

.empty-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #9CA3AF;
}

.records-list {
  max-height: 500rpx;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F3F4F6;
}

.record-item:last-child {
  border-bottom: none;
}

.record-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 16rpx;
}

.icon-in {
  background: #DCFCE7;
}

.icon-out {
  background: #FEE2E2;
}

.icon-help {
  background: #FEF3C7;
}

.icon-reward {
  background: #E0E7FF;
}

.icon-transfer {
  background: #F3F4F6;
}

.record-info {
  flex: 1;
}

.record-desc {
  font-size: 28rpx;
  color: #1F2937;
  display: block;
  margin-bottom: 8rpx;
}

.record-time {
  font-size: 24rpx;
  color: #9CA3AF;
}

.record-points {
  font-size: 32rpx;
  font-weight: 600;
}

.points-in {
  color: #10B981;
}

.points-out {
  color: #EF4444;
}

.points-neutral {
  color: #6B7280;
}

/* 弹窗样式 */
.popup-content {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  width: 600rpx;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1F2937;
  display: block;
  text-align: center;
  margin-bottom: 40rpx;
}

.input-group {
  margin-bottom: 32rpx;
}

.input-label {
  font-size: 28rpx;
  color: #6B7280;
  display: block;
  margin-bottom: 12rpx;
}

.picker-value {
  padding: 24rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #1F2937;
}

.input-field {
  padding: 24rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.popup-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 40rpx;
}

.popup-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 16rpx;
  text-align: center;
}

.popup-btn.cancel {
  background: #F3F4F6;
}

.popup-btn.cancel text {
  font-size: 28rpx;
  color: #6B7280;
}

.popup-btn.confirm {
  background: #8B5CF6;
}

.popup-btn.confirm text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
}
</style>
