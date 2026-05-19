<template>
  <view class="savings-page">
    <!-- 总览卡片 -->
    <view class="overview-card">
      <view class="overview-item">
        <text class="overview-value">{{ activeGoals.length }}</text>
        <text class="overview-label">进行中</text>
      </view>
      <view class="overview-divider"></view>
      <view class="overview-item">
        <text class="overview-value">{{ completedGoals.length }}</text>
        <text class="overview-label">已达成</text>
      </view>
      <view class="overview-divider"></view>
      <view class="overview-item">
        <text class="overview-value">¥{{ totalSaved }}</text>
        <text class="overview-label">已储蓄</text>
      </view>
    </view>

    <!-- 创建目标按钮 -->
    <button class="create-btn" @click="showCreateModal">+ 创建储蓄目标</button>

    <!-- 进行中目标 -->
    <view class="section" v-if="activeGoals.length > 0">
      <view class="section-title">进行中的目标</view>
      <view class="goal-list">
        <view 
          class="goal-card" 
          v-for="goal in activeGoals" 
          :key="goal.id"
        >
          <view class="goal-header">
            <text class="goal-name">{{ goal.name }}</text>
            <text class="goal-deadline" v-if="goal.deadline">
              {{ formatDeadline(goal.deadline) }}
            </text>
          </view>
          
          <view class="goal-progress">
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :style="{ width: getGoalProgress(goal) + '%' }"
              ></view>
            </view>
            <text class="progress-text">{{ getGoalProgress(goal) }}%</text>
          </view>
          
          <view class="goal-amount">
            <text class="current">¥{{ goal.currentAmount }}</text>
            <text class="separator">/</text>
            <text class="target">¥{{ goal.targetAmount }}</text>
          </view>
          
          <view class="goal-actions">
            <button class="action-btn deposit" @click="showDepositModal(goal)">存入</button>
            <button class="action-btn withdraw" @click="showWithdrawModal(goal)">取出</button>
            <button class="action-btn cancel" @click="onCancelGoal(goal.id)">取消</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 已完成目标 -->
    <view class="section" v-if="completedGoals.length > 0">
      <view class="section-title">已达成目标</view>
      <view class="goal-list">
        <view 
          class="goal-card completed" 
          v-for="goal in completedGoals" 
          :key="goal.id"
        >
          <view class="goal-header">
            <text class="goal-name">{{ goal.name }}</text>
            <text class="completed-badge">✓ 已达成</text>
          </view>
          
          <view class="goal-progress">
            <view class="progress-bar">
              <view class="progress-fill completed" style="width: 100%"></view>
            </view>
            <text class="progress-text">100%</text>
          </view>
          
          <view class="goal-amount">
            <text class="current">¥{{ goal.currentAmount }}</text>
            <text class="separator">/</text>
            <text class="target">¥{{ goal.targetAmount }}</text>
          </view>
          
          <view class="goal-actions">
            <button class="action-btn delete" @click="onDeleteGoal(goal.id)">删除</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="activeGoals.length === 0 && completedGoals.length === 0">
      <text class="empty-icon">🎯</text>
      <text class="empty-text">还没有储蓄目标</text>
      <text class="empty-sub">点击上方按钮创建你的第一个目标吧！</text>
    </view>

    <!-- 创建目标弹窗 -->
    <uni-popup ref="createModal" type="center">
      <view class="modal-content">
        <view class="modal-title">创建储蓄目标</view>
        
        <view class="form-item">
          <text class="form-label">目标名称</text>
          <input 
            class="form-input" 
            v-model="createForm.name" 
            placeholder="例如：玩具汽车"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">目标金额</text>
          <input 
            class="form-input" 
            type="digit" 
            v-model="createForm.targetAmount" 
            placeholder="例如：200"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">截止日期（可选）</text>
          <picker mode="date" @change="onDeadlineChange">
            <view class="picker-value">
              {{ createForm.deadline || '不设置截止日期' }}
            </view>
          </picker>
        </view>
        
        <view class="form-item">
          <text class="form-label">描述（可选）</text>
          <input 
            class="form-input" 
            v-model="createForm.description" 
            placeholder="目标的详细描述"
          />
        </view>
        
        <view class="modal-buttons">
          <button class="modal-btn cancel" @click="closeCreateModal">取消</button>
          <button class="modal-btn confirm" @click="submitCreate">创建</button>
        </view>
      </view>
    </uni-popup>

    <!-- 存入弹窗 -->
    <uni-popup ref="depositModal" type="center">
      <view class="modal-content">
        <view class="modal-title">存入储蓄</view>
        <view class="modal-subtitle">目标：{{ selectedGoal?.name }}</view>
        
        <view class="form-item">
          <text class="form-label">存入金额</text>
          <input 
            class="form-input" 
            type="digit" 
            v-model="depositAmount" 
            placeholder="请输入金额"
          />
        </view>
        
        <view class="modal-buttons">
          <button class="modal-btn cancel" @click="closeDepositModal">取消</button>
          <button class="modal-btn confirm" @click="submitDeposit">确定存入</button>
        </view>
      </view>
    </uni-popup>

    <!-- 取出弹窗 -->
    <uni-popup ref="withdrawModal" type="center">
      <view class="modal-content">
        <view class="modal-title">取出储蓄</view>
        <view class="modal-subtitle">目标：{{ selectedGoal?.name }}</view>
        <view class="modal-info">可取出金额：¥{{ selectedGoal?.currentAmount || 0 }}</view>
        
        <view class="form-item">
          <text class="form-label">取出金额</text>
          <input 
            class="form-input" 
            type="digit" 
            v-model="withdrawAmount" 
            placeholder="请输入金额"
          />
        </view>
        
        <view class="modal-buttons">
          <button class="modal-btn cancel" @click="closeWithdrawModal">取消</button>
          <button class="modal-btn confirm" @click="submitWithdraw">确定取出</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFinanceStore } from '@/stores/financeStore.js'

const financeStore = useFinanceStore()

// 激活的目标
const activeGoals = computed(() => financeStore.activeGoals)

// 已完成的目标
const completedGoals = computed(() => financeStore.completedGoals)

// 总已储蓄金额
const totalSaved = computed(() => {
  return activeGoals.value.reduce((sum, g) => sum + g.currentAmount, 0) + 
    completedGoals.value.reduce((sum, g) => sum + g.currentAmount, 0)
})

// 弹窗引用
const createModal = ref(null)
const depositModal = ref(null)
const withdrawModal = ref(null)

// 选中目标
const selectedGoal = ref(null)

// 创建表单
const createForm = ref({
  name: '',
  targetAmount: '',
  deadline: '',
  description: ''
})

// 存入/取出金额
const depositAmount = ref('')
const withdrawAmount = ref('')

// 获取目标进度
const getGoalProgress = (goal) => {
  return financeStore.getGoalProgress(goal)
}

// 格式化截止日期
const formatDeadline = (deadline) => {
  if (!deadline) return ''
  const date = new Date(deadline)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日截止`
}

// 显示创建弹窗
const showCreateModal = () => {
  createForm.value = {
    name: '',
    targetAmount: '',
    deadline: '',
    description: ''
  }
  createModal.value.open()
}

// 关闭创建弹窗
const closeCreateModal = () => {
  createModal.value.close()
}

// 截止日期选择
const onDeadlineChange = (e) => {
  createForm.value.deadline = e.detail.value
}

// 提交创建
const submitCreate = () => {
  if (!createForm.value.name.trim()) {
    uni.showToast({ title: '请输入目标名称', icon: 'none' })
    return
  }
  
  if (!createForm.value.targetAmount || parseFloat(createForm.value.targetAmount) <= 0) {
    uni.showToast({ title: '请输入正确的目标金额', icon: 'none' })
    return
  }
  
  financeStore.createSavingsGoal(
    createForm.value.name.trim(),
    parseFloat(createForm.value.targetAmount),
    createForm.value.deadline || null,
    createForm.value.description.trim()
  )
  
  closeCreateModal()
  uni.showToast({ title: '目标已创建', icon: 'success' })
}

// 显示存入弹窗
const showDepositModal = (goal) => {
  selectedGoal.value = goal
  depositAmount.value = ''
  depositModal.value.open()
}

// 关闭存入弹窗
const closeDepositModal = () => {
  depositModal.value.close()
  selectedGoal.value = null
}

// 提交存入
const submitDeposit = () => {
  if (!depositAmount.value || parseFloat(depositAmount.value) <= 0) {
    uni.showToast({ title: '请输入正确的金额', icon: 'none' })
    return
  }
  
  financeStore.depositToGoal(selectedGoal.value.id, parseFloat(depositAmount.value))
  closeDepositModal()
}

// 显示取出弹窗
const showWithdrawModal = (goal) => {
  selectedGoal.value = goal
  withdrawAmount.value = ''
  withdrawModal.value.open()
}

// 关闭取出弹窗
const closeWithdrawModal = () => {
  withdrawModal.value.close()
  selectedGoal.value = null
}

// 提交取出
const submitWithdraw = () => {
  if (!withdrawAmount.value || parseFloat(withdrawAmount.value) <= 0) {
    uni.showToast({ title: '请输入正确的金额', icon: 'none' })
    return
  }
  
  if (parseFloat(withdrawAmount.value) > selectedGoal.value.currentAmount) {
    uni.showToast({ title: '超过可取出金额', icon: 'none' })
    return
  }
  
  financeStore.withdrawFromGoal(selectedGoal.value.id, parseFloat(withdrawAmount.value))
  closeWithdrawModal()
}

// 取消目标
const onCancelGoal = (goalId) => {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消这个储蓄目标吗？',
    success: (res) => {
      if (res.confirm) {
        financeStore.cancelGoal(goalId)
        uni.showToast({ title: '目标已取消', icon: 'success' })
      }
    }
  })
}

// 删除目标
const onDeleteGoal = (goalId) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个已达成目标吗？',
    success: (res) => {
      if (res.confirm) {
        financeStore.deleteGoal(goalId)
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
.savings-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.overview-card {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20rpx;
}

.overview-item {
  text-align: center;
}

.overview-value {
  font-size: 48rpx;
  font-weight: bold;
  display: block;
}

.overview-label {
  font-size: 24rpx;
  opacity: 0.9;
  display: block;
  margin-top: 8rpx;
}

.overview-divider {
  width: 2rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.4);
}

.create-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.goal-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.goal-card {
  background: #f9f9f9;
  border-radius: 16rpx;
  padding: 24rpx;
}

.goal-card.completed {
  background: #f0fff4;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.goal-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.goal-deadline {
  font-size: 24rpx;
  color: #666;
}

.completed-badge {
  font-size: 24rpx;
  color: #11998e;
  font-weight: bold;
}

.goal-progress {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.progress-bar {
  flex: 1;
  height: 16rpx;
  background: #e0e0e0;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8rpx;
  transition: width 0.3s;
}

.progress-fill.completed {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.progress-text {
  font-size: 26rpx;
  color: #666;
  min-width: 80rpx;
  text-align: right;
}

.goal-amount {
  text-align: center;
  margin-bottom: 20rpx;
}

.goal-amount .current {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.goal-amount .separator {
  font-size: 28rpx;
  color: #999;
  margin: 0 8rpx;
}

.goal-amount .target {
  font-size: 28rpx;
  color: #666;
}

.goal-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  border: none;
}

.action-btn.deposit {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
}

.action-btn.withdraw {
  background: #f0f0f0;
  color: #666;
}

.action-btn.cancel {
  background: #fff5f5;
  color: #eb3349;
}

.action-btn.delete {
  background: #fff5f5;
  color: #eb3349;
}

.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  display: block;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 16rpx;
}

.empty-sub {
  font-size: 26rpx;
  color: #999;
  display: block;
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
  margin-bottom: 10rpx;
  color: #333;
}

.modal-subtitle {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  margin-bottom: 30rpx;
}

.modal-info {
  font-size: 28rpx;
  color: #11998e;
  text-align: center;
  margin-bottom: 30rpx;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
</style>
