import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import financeService from '@/services/financeService.js'

/**
 * V60 Finance Store
 * 财商教育状态管理
 */
export const useFinanceStore = defineStore('finance', () => {
  // ==================== 状态 ====================
  const allowanceData = ref(null)
  const savingsGoals = ref([])
  const spendingRecords = ref([])
  const isLoading = ref(false)

  // ==================== 初始化 ====================
  const init = () => {
    loadAllData()
  }

  const loadAllData = () => {
    allowanceData.value = financeService.getAllowanceData()
    savingsGoals.value = financeService.getSavingsGoals()
    spendingRecords.value = financeService.getSpendingRecords()
  }

  // ==================== 零花钱相关 ====================
  
  // 余额
  const balance = computed(() => allowanceData.value?.balance || 0)

  // 收入分类
  const incomeCategories = computed(() => 
    allowanceData.value?.categories?.income || []
  )

  // 支出分类
  const expenseCategories = computed(() => 
    allowanceData.value?.categories?.expense || []
  )

  // 最近记录
  const recentAllowanceRecords = computed(() => 
    (allowanceData.value?.records || []).slice(0, 20)
  )

  // 零花钱统计
  const allowanceStats = computed(() => 
    financeService.getAllowanceStats()
  )

  // 添加零花钱记录
  const addAllowance = (type, amount, category, note = '') => {
    isLoading.value = true
    try {
      const result = financeService.addAllowanceRecord(type, amount, category, note)
      allowanceData.value = financeService.getAllowanceData()
      uni.$emit('financeUpdated', { type: 'allowance' })
      return result
    } finally {
      isLoading.value = false
    }
  }

  // 删除零花钱记录
  const deleteAllowanceRecord = (recordId) => {
    const success = financeService.deleteAllowanceRecord(recordId)
    if (success) {
      allowanceData.value = financeService.getAllowanceData()
      uni.$emit('financeUpdated', { type: 'allowance' })
    }
    return success
  }

  // ==================== 储蓄目标相关 ====================

  // 激活的目标
  const activeGoals = computed(() => 
    savingsGoals.value.filter(g => g.status === 'active')
  )

  // 已完成的目标
  const completedGoals = computed(() => 
    savingsGoals.value.filter(g => g.status === 'completed')
  )

  // 获取目标进度
  const getGoalProgress = (goal) => {
    return financeService.getGoalProgress(goal)
  }

  // 创建储蓄目标
  const createSavingsGoal = (name, targetAmount, deadline = null, description = '') => {
    isLoading.value = true
    try {
      const goal = financeService.createSavingsGoal(name, targetAmount, deadline, description)
      savingsGoals.value = financeService.getSavingsGoals()
      uni.$emit('financeUpdated', { type: 'savingsGoal' })
      return goal
    } finally {
      isLoading.value = false
    }
  }

  // 存入储蓄
  const depositToGoal = (goalId, amount) => {
    const goal = financeService.depositToGoal(goalId, amount)
    if (goal) {
      savingsGoals.value = financeService.getSavingsGoals()
      uni.$emit('financeUpdated', { type: 'savingsGoal' })
      if (goal.status === 'completed') {
        uni.showToast({ title: '恭喜目标达成！', icon: 'success' })
        uni.$emit('savingsGoalCompleted', goal)
      }
    }
    return goal
  }

  // 取出储蓄
  const withdrawFromGoal = (goalId, amount) => {
    const goal = financeService.withdrawFromGoal(goalId, amount)
    if (goal) {
      savingsGoals.value = financeService.getSavingsGoals()
      uni.$emit('financeUpdated', { type: 'savingsGoal' })
    }
    return goal
  }

  // 取消目标
  const cancelGoal = (goalId) => {
    const success = financeService.cancelGoal(goalId)
    if (success) {
      savingsGoals.value = financeService.getSavingsGoals()
      uni.$emit('financeUpdated', { type: 'savingsGoal' })
    }
    return success
  }

  // 删除目标
  const deleteGoal = (goalId) => {
    const success = financeService.deleteGoal(goalId)
    if (success) {
      savingsGoals.value = financeService.getSavingsGoals()
      uni.$emit('financeUpdated', { type: 'savingsGoal' })
    }
    return success
  }

  // ==================== 消费记录相关 ====================

  // 最近消费记录
  const recentSpendingRecords = computed(() => 
    spendingRecords.value.slice(0, 50)
  )

  // 消费统计
  const spendingStats = computed(() => 
    financeService.getSpendingStats()
  )

  // 消费习惯分析
  const spendingHabits = computed(() => 
    financeService.getSpendingHabits()
  )

  // 添加消费记录
  const addSpending = (amount, category, description = '', paymentMethod = 'cash') => {
    isLoading.value = true
    try {
      const record = financeService.addSpendingRecord(amount, category, description, paymentMethod)
      spendingRecords.value = financeService.getSpendingRecords()
      uni.$emit('financeUpdated', { type: 'spending' })
      return record
    } finally {
      isLoading.value = false
    }
  }

  // 删除消费记录
  const deleteSpendingRecord = (recordId) => {
    const success = financeService.deleteSpendingRecord(recordId)
    if (success) {
      spendingRecords.value = financeService.getSpendingRecords()
      uni.$emit('financeUpdated', { type: 'spending' })
    }
    return success
  }

  // ==================== 财商知识相关 ====================

  // 知识列表
  const moneyKnowledge = computed(() => 
    financeService.getMoneyKnowledge()
  )

  // 测试题目
  const moneyQuiz = computed(() => 
    financeService.getMoneyQuiz()
  )

  // ==================== 通用方法 ====================

  // 刷新数据
  const refresh = () => {
    loadAllData()
  }

  // 清空所有数据
  const clearAllData = () => {
    financeService.clearAllData()
    loadAllData()
    uni.$emit('financeUpdated', { type: 'all' })
  }

  return {
    // 状态
    allowanceData,
    savingsGoals,
    spendingRecords,
    isLoading,

    // 计算属性 - 零花钱
    balance,
    incomeCategories,
    expenseCategories,
    recentAllowanceRecords,
    allowanceStats,

    // 计算属性 - 储蓄目标
    activeGoals,
    completedGoals,

    // 计算属性 - 消费记录
    recentSpendingRecords,
    spendingStats,
    spendingHabits,

    // 计算属性 - 财商知识
    moneyKnowledge,
    moneyQuiz,

    // 方法 - 通用
    init,
    loadAllData,
    refresh,
    clearAllData,

    // 方法 - 零花钱
    addAllowance,
    deleteAllowanceRecord,

    // 方法 - 储蓄目标
    getGoalProgress,
    createSavingsGoal,
    depositToGoal,
    withdrawFromGoal,
    cancelGoal,
    deleteGoal,

    // 方法 - 消费记录
    addSpending,
    deleteSpendingRecord
  }
})
