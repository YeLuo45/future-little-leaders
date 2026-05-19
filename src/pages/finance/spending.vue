<template>
  <view class="spending-page">
    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">¥{{ spendingStats.totalAmount || 0 }}</text>
        <text class="stat-label">总消费</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ spendingStats.recordCount || 0 }}</text>
        <text class="stat-label">笔数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">¥{{ spendingStats.avgAmount?.toFixed(1) || 0 }}</text>
        <text class="stat-label">平均</text>
      </view>
    </view>

    <!-- 消费习惯分析 -->
    <view class="habit-card" v-if="spendingHabits">
      <view class="habit-header">
        <text class="habit-title">消费习惯分析</text>
        <text class="habit-type" :class="spendingHabits.habit">{{ spendingHabits.habit }}</text>
      </view>
      <text class="habit-suggestion">{{ spendingHabits.suggestion }}</text>
      <view class="habit-detail">
        <view class="detail-item">
          <text class="detail-label">日均消费频率</text>
          <text class="detail-value">{{ spendingHabits.avgDailyFrequency }} 次</text>
        </view>
        <view class="detail-item" v-if="spendingHabits.topCategory">
          <text class="detail-label">最爱消费</text>
          <text class="detail-value">{{ spendingHabits.topCategory[0] }}</text>
        </view>
      </view>
    </view>

    <!-- 添加记录按钮 -->
    <button class="add-btn" @click="showAddModal">+ 记录消费</button>

    <!-- 分类统计 -->
    <view class="section" v-if="Object.keys(spendingStats.byCategory || {}).length > 0">
      <view class="section-title">分类统计</view>
      <view class="category-list">
        <view 
          class="category-item" 
          v-for="(amount, category) in spendingStats.byCategory" 
          :key="category"
        >
          <view class="category-info">
            <text class="category-name">{{ category }}</text>
            <text class="category-percent">{{ getPercent(amount) }}%</text>
          </view>
          <view class="category-bar">
            <view class="category-fill" :style="{ width: getPercent(amount) + '%' }"></view>
          </view>
          <text class="category-amount">¥{{ amount }}</text>
        </view>
      </view>
    </view>

    <!-- 消费记录列表 -->
    <view class="section">
      <view class="section-title">消费记录</view>
      <view class="record-list">
        <view 
          class="record-item" 
          v-for="record in recentSpendingRecords" 
          :key="record.id"
        >
          <view class="record-icon">
            <text>{{ getCategoryIcon(record.category) }}</text>
          </view>
          <view class="record-info">
            <text class="record-category">{{ record.category }}</text>
            <text class="record-desc" v-if="record.description">{{ record.description }}</text>
            <text class="record-time">{{ formatTime(record.createTime) }}</text>
          </view>
          <view class="record-right">
            <text class="record-amount">-¥{{ record.amount }}</text>
            <text class="record-payment">{{ getPaymentLabel(record.paymentMethod) }}</text>
          </view>
          <view class="record-delete" @click="deleteRecord(record.id)">×</view>
        </view>
        
        <view class="empty-tip" v-if="recentSpendingRecords.length === 0">
          暂无消费记录，开始记录你的消费吧！
        </view>
      </view>
    </view>

    <!-- 添加记录弹窗 -->
    <uni-popup ref="addModal" type="center">
      <view class="modal-content">
        <view class="modal-title">记录消费</view>
        
        <view class="form-item">
          <text class="form-label">金额</text>
          <input 
            class="form-input" 
            type="digit" 
            v-model="formData.amount" 
            placeholder="请输入消费金额"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">消费分类</text>
          <picker 
            :value="formData.categoryIndex" 
            :range="categories"
            @change="onCategoryChange"
          >
            <view class="picker-value">
              {{ formData.category || '请选择分类' }}
            </view>
          </picker>
        </view>
        
        <view class="form-item">
          <text class="form-label">支付方式</text>
          <picker 
            :value="formData.paymentIndex" 
            :range="paymentMethods" 
            range-key="label"
            @change="onPaymentChange"
          >
            <view class="picker-value">
              {{ formData.paymentMethodLabel || '请选择支付方式' }}
            </view>
          </picker>
        </view>
        
        <view class="form-item">
          <text class="form-label">备注描述</text>
          <input 
            class="form-input" 
            v-model="formData.description" 
            placeholder="可选填消费描述"
          />
        </view>
        
        <view class="modal-buttons">
          <button class="modal-btn cancel" @click="closeModal">取消</button>
          <button class="modal-btn confirm" @click="submitRecord">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFinanceStore } from '@/stores/financeStore.js'

const financeStore = useFinanceStore()

// 消费统计
const spendingStats = computed(() => financeStore.spendingStats)

// 消费习惯
const spendingHabits = computed(() => financeStore.spendingHabits)

// 最近消费记录
const recentSpendingRecords = computed(() => financeStore.recentSpendingRecords)

// 消费分类
const categories = ['学习用品', '零食', '玩具', '游戏', '娱乐', '餐饮', '服装', '爱心捐赠', '其他']

// 支付方式
const paymentMethods = [
  { value: 'cash', label: '现金' },
  { value: 'card', label: '银行卡' },
  { value: 'digital', label: '电子支付' }
]

// 弹窗引用
const addModal = ref(null)

// 表单数据
const formData = ref({
  amount: '',
  category: '',
  categoryIndex: 0,
  paymentMethod: 'cash',
  paymentMethodLabel: '现金',
  paymentIndex: 0,
  description: ''
})

// 计算百分比
const getPercent = (amount) => {
  const total = spendingStats.value.totalAmount || 0
  if (total === 0) return 0
  return Math.round((amount / total) * 100)
}

// 获取分类图标
const getCategoryIcon = (category) => {
  const icons = {
    '学习用品': '📚',
    '零食': '🍪',
    '玩具': '🎮',
    '游戏': '🎯',
    '娱乐': '🎭',
    '餐饮': '🍔',
    '服装': '👕',
    '爱心捐赠': '❤️',
    '其他': '📦'
  }
  return icons[category] || '💰'
}

// 获取支付方式标签
const getPaymentLabel = (method) => {
  const labels = {
    'cash': '现金',
    'card': '银行卡',
    'digital': '电子支付'
  }
  return labels[method] || method
}

// 格式化时间
const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

// 显示添加弹窗
const showAddModal = () => {
  formData.value = {
    amount: '',
    category: '',
    categoryIndex: 0,
    paymentMethod: 'cash',
    paymentMethodLabel: '现金',
    paymentIndex: 0,
    description: ''
  }
  addModal.value.open()
}

// 关闭弹窗
const closeModal = () => {
  addModal.value.close()
}

// 分类选择
const onCategoryChange = (e) => {
  formData.value.categoryIndex = e.detail.value
  formData.value.category = categories[e.detail.value]
}

// 支付方式选择
const onPaymentChange = (e) => {
  const index = e.detail.value
  formData.value.paymentIndex = index
  formData.value.paymentMethod = paymentMethods[index].value
  formData.value.paymentMethodLabel = paymentMethods[index].label
}

// 提交记录
const submitRecord = () => {
  const { amount, category, paymentMethod, description } = formData.value
  
  if (!amount || parseFloat(amount) <= 0) {
    uni.showToast({ title: '请输入正确金额', icon: 'none' })
    return
  }
  
  if (!category) {
    uni.showToast({ title: '请选择分类', icon: 'none' })
    return
  }
  
  financeStore.addSpending(
    parseFloat(amount),
    category,
    description,
    paymentMethod
  )
  
  closeModal()
  uni.showToast({ title: '消费已记录', icon: 'success' })
}

// 删除记录
const deleteRecord = (recordId) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条消费记录吗？',
    success: (res) => {
      if (res.confirm) {
        financeStore.deleteSpendingRecord(recordId)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

// 初始化
onMounted(() => {
  financeStore.init()
})
</script>

<style scoped>
.spending-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.stats-card {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 44rpx;
  font-weight: bold;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.9;
  display: block;
  margin-top: 8rpx;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.4);
}

.habit-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.habit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.habit-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.habit-type {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-weight: 500;
}

.habit-type.节约型 {
  background: #e8f5e9;
  color: #11998e;
}

.habit-type.平衡型 {
  background: #fff3e0;
  color: #ff9800;
}

.habit-type.消费型 {
  background: #ffebee;
  color: #eb3349;
}

.habit-suggestion {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  display: block;
  margin-bottom: 20rpx;
}

.habit-detail {
  display: flex;
  gap: 40rpx;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 24rpx;
  color: #999;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-top: 4rpx;
}

.add-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  border: none;
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.category-info {
  display: flex;
  justify-content: space-between;
}

.category-name {
  font-size: 28rpx;
  color: #333;
}

.category-percent {
  font-size: 26rpx;
  color: #999;
}

.category-bar {
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}

.category-fill {
  height: 100%;
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
  border-radius: 6rpx;
  transition: width 0.3s;
}

.category-amount {
  font-size: 26rpx;
  color: #eb3349;
  font-weight: bold;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

.record-icon {
  width: 64rpx;
  height: 64rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 16rpx;
}

.record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.record-category {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.record-desc {
  font-size: 24rpx;
  color: #666;
  margin-top: 4rpx;
}

.record-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.record-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 16rpx;
}

.record-amount {
  font-size: 30rpx;
  font-weight: bold;
  color: #eb3349;
}

.record-payment {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.record-delete {
  font-size: 40rpx;
  color: #ccc;
  padding: 0 10rpx;
}

.empty-tip {
  text-align: center;
  padding: 60rpx;
  color: #999;
  font-size: 28rpx;
}

/* 弹窗样式 */
.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40rpx;
  color: #333;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.picker-value {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  line-height: 80rpx;
  color: #333;
  box-sizing: border-box;
}

.modal-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  border: none;
}

.modal-btn.cancel {
  background: #f0f0f0;
  color: #666;
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
  color: #fff;
}
</style>
