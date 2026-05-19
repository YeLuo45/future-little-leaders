<template>
  <view class="allowance-page">
    <!-- 余额卡片 -->
    <view class="balance-card">
      <view class="balance-label">当前余额</view>
      <view class="balance-amount">¥{{ balance }}</view>
      <view class="balance-stats">
        <view class="stat-item income">
          <text class="stat-icon">↑</text>
          <text class="stat-value">¥{{ allowanceStats.totalIncome || 0 }}</text>
          <text class="stat-label">累计收入</text>
        </view>
        <view class="stat-item expense">
          <text class="stat-icon">↓</text>
          <text class="stat-value">¥{{ allowanceStats.totalExpense || 0 }}</text>
          <text class="stat-label">累计支出</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="btn income-btn" @click="showAddModal('income')">+ 收入</button>
      <button class="btn expense-btn" @click="showAddModal('expense')">- 支出</button>
    </view>

    <!-- 分类统计 -->
    <view class="section">
      <view class="section-title">分类统计</view>
      <view class="category-stats">
        <view class="category-row" v-if="Object.keys(allowanceStats.incomeByCategory || {}).length">
          <view class="category-title">收入</view>
          <view 
            class="category-item" 
            v-for="(amount, category) in allowanceStats.incomeByCategory" 
            :key="'income-' + category"
          >
            <text class="category-name">{{ category }}</text>
            <text class="category-amount income">¥{{ amount }}</text>
          </view>
        </view>
        <view class="category-row" v-if="Object.keys(allowanceStats.expenseByCategory || {}).length">
          <view class="category-title">支出</view>
          <view 
            class="category-item" 
            v-for="(amount, category) in allowanceStats.expenseByCategory" 
            :key="'expense-' + category"
          >
            <text class="category-name">{{ category }}</text>
            <text class="category-amount expense">¥{{ amount }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 记录列表 -->
    <view class="section">
      <view class="section-title">收支记录</view>
      <view class="record-list">
        <view 
          class="record-item" 
          v-for="record in recentAllowanceRecords" 
          :key="record.id"
        >
          <view class="record-icon" :class="record.type">
            {{ record.type === 'income' ? '↑' : '↓' }}
          </view>
          <view class="record-info">
            <text class="record-category">{{ record.category }}</text>
            <text class="record-note" v-if="record.note">{{ record.note }}</text>
            <text class="record-time">{{ formatTime(record.createTime) }}</text>
          </view>
          <view class="record-amount" :class="record.type">
            {{ record.type === 'income' ? '+' : '-' }}¥{{ record.amount }}
          </view>
          <view class="record-delete" @click="deleteRecord(record.id)">×</view>
        </view>
        <view class="empty-tip" v-if="recentAllowanceRecords.length === 0">
          暂无记录，开始记录你的零花钱吧！
        </view>
      </view>
    </view>

    <!-- 添加记录弹窗 -->
    <uni-popup ref="addModal" type="center">
      <view class="modal-content">
        <view class="modal-title">{{ modalType === 'income' ? '添加收入' : '添加支出' }}</view>
        
        <view class="form-item">
          <text class="form-label">金额</text>
          <input 
            class="form-input" 
            type="digit" 
            v-model="formData.amount" 
            placeholder="请输入金额"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">分类</text>
          <picker 
            :value="formData.categoryIndex" 
            :range="modalType === 'income' ? incomeCategories : expenseCategories"
            @change="onCategoryChange"
          >
            <view class="picker-value">
              {{ formData.category || '请选择分类' }}
            </view>
          </picker>
        </view>
        
        <view class="form-item">
          <text class="form-label">备注</text>
          <input 
            class="form-input" 
            v-model="formData.note" 
            placeholder="可选填备注"
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

// 余额
const balance = computed(() => financeStore.balance)

// 收入分类
const incomeCategories = computed(() => financeStore.incomeCategories)

// 支出分类
const expenseCategories = computed(() => financeStore.expenseCategories)

// 最近记录
const recentAllowanceRecords = computed(() => financeStore.recentAllowanceRecords)

// 统计
const allowanceStats = computed(() => financeStore.allowanceStats)

// 弹窗引用
const addModal = ref(null)

// 弹窗类型
const modalType = ref('income')

// 表单数据
const formData = ref({
  amount: '',
  category: '',
  categoryIndex: 0,
  note: ''
})

// 显示添加弹窗
const showAddModal = (type) => {
  modalType.value = type
  formData.value = {
    amount: '',
    category: '',
    categoryIndex: 0,
    note: ''
  }
  addModal.value.open()
}

// 关闭弹窗
const closeModal = () => {
  addModal.value.close()
}

// 分类选择
const onCategoryChange = (e) => {
  const index = e.detail.value
  formData.value.categoryIndex = index
  const categories = modalType.value === 'income' ? incomeCategories.value : expenseCategories.value
  formData.value.category = categories[index] || ''
}

// 提交记录
const submitRecord = () => {
  const { amount, category } = formData.value
  
  if (!amount || parseFloat(amount) <= 0) {
    uni.showToast({ title: '请输入正确金额', icon: 'none' })
    return
  }
  
  if (!category) {
    uni.showToast({ title: '请选择分类', icon: 'none' })
    return
  }
  
  financeStore.addAllowance(
    modalType.value,
    parseFloat(amount),
    category,
    formData.value.note
  )
  
  closeModal()
  uni.showToast({ 
    title: modalType.value === 'income' ? '收入已记录' : '支出已记录', 
    icon: 'success' 
  })
}

// 删除记录
const deleteRecord = (recordId) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条记录吗？',
    success: (res) => {
      if (res.confirm) {
        financeStore.deleteAllowanceRecord(recordId)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
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

// 初始化
onMounted(() => {
  financeStore.init()
})
</script>

<style scoped>
.allowance-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  color: #fff;
  margin-bottom: 20rpx;
}

.balance-label {
  font-size: 28rpx;
  opacity: 0.9;
}

.balance-amount {
  font-size: 72rpx;
  font-weight: bold;
  margin: 10rpx 0 30rpx;
}

.balance-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-icon {
  font-size: 32rpx;
  display: block;
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.8;
  display: block;
  margin-top: 8rpx;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  color: #fff;
}

.income-btn {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.expense-btn {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
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
  margin-bottom: 20rpx;
  color: #333;
}

.category-stats {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.category-row {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.category-title {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.category-item:last-child {
  border-bottom: none;
}

.category-name {
  font-size: 28rpx;
  color: #333;
}

.category-amount {
  font-size: 28rpx;
  font-weight: bold;
}

.category-amount.income {
  color: #11998e;
}

.category-amount.expense {
  color: #eb3349;
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
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #fff;
  margin-right: 16rpx;
}

.record-icon.income {
  background: #11998e;
}

.record-icon.expense {
  background: #eb3349;
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

.record-note {
  font-size: 24rpx;
  color: #666;
  margin-top: 4rpx;
}

.record-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.record-amount {
  font-size: 32rpx;
  font-weight: bold;
  margin-right: 16rpx;
}

.record-amount.income {
  color: #11998e;
}

.record-amount.expense {
  color: #eb3349;
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
  margin-bottom: 30rpx;
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
  margin-top: 40rpx;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
</style>
