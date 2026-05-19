/**
 * V60 Finance Service
 * 财商教育服务 - 零花钱管理、储蓄目标、消费记录
 */

const STORAGE_KEY = 'finance_data'

// 默认数据
const getDefaultData = () => ({
  allowance: {
    balance: 0,
    records: [],
    categories: {
      income: ['零花钱', '奖励', '红包', '劳动所得', '其他收入'],
      expense: ['学习用品', '零食', '玩具', '游戏', '娱乐', '爱心捐赠', '其他支出']
    }
  },
  savingsGoals: [],
  spendingRecords: []
})

// 获取本地数据
const getLocalData = () => {
  try {
    const data = uni.getStorageSync(STORAGE_KEY)
    if (data) {
      return { ...getDefaultData(), ...JSON.parse(data) }
    }
  } catch (e) {
    console.error('Failed to load finance data:', e)
  }
  return getDefaultData()
}

// 保存数据到本地
const saveData = (data) => {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('Failed to save finance data:', e)
    return false
  }
}

export default {
  // 获取所有数据
  getData() {
    return getLocalData()
  },

  // ==================== 零花钱管理 ====================
  
  // 获取零花钱数据
  getAllowanceData() {
    return getLocalData().allowance
  },

  // 添加零花钱记录
  addAllowanceRecord(type, amount, category, note = '') {
    const data = getLocalData()
    const record = {
      id: Date.now().toString(),
      type, // 'income' | 'expense'
      amount: Math.abs(amount),
      category,
      note,
      createTime: new Date().toISOString()
    }
    
    // 更新余额
    if (type === 'income') {
      data.allowance.balance += Math.abs(amount)
    } else {
      data.allowance.balance -= Math.abs(amount)
    }
    
    data.allowance.records.unshift(record)
    saveData(data)
    
    return { record, newBalance: data.allowance.balance }
  },

  // 获取余额
  getBalance() {
    return getLocalData().allowance.balance
  },

  // 获取零花钱记录
  getAllowanceRecords(limit = 50) {
    const records = getLocalData().allowance.records
    return limit ? records.slice(0, limit) : records
  },

  // 获取收入支出统计
  getAllowanceStats(dateRange = null) {
    const data = getLocalData()
    const records = data.allowance.records
    
    let filteredRecords = records
    if (dateRange) {
      const start = new Date(dateRange.start).getTime()
      const end = new Date(dateRange.end).getTime()
      filteredRecords = records.filter(r => {
        const time = new Date(r.createTime).getTime()
        return time >= start && time <= end
      })
    }
    
    const income = filteredRecords.filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0)
    const expense = filteredRecords.filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)
    
    // 按分类统计
    const incomeByCategory = {}
    const expenseByCategory = {}
    
    income.forEach(r => {
      incomeByCategory[r.category] = (incomeByCategory[r.category] || 0) + r.amount
    })
    
    expense.forEach(r => {
      expenseByCategory[r.category] = (expenseByCategory[r.category] || 0) + r.amount
    })
    
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: data.allowance.balance,
      incomeByCategory,
      expenseByCategory,
      recordCount: filteredRecords.length
    }
  },

  // 删除零花钱记录
  deleteAllowanceRecord(recordId) {
    const data = getLocalData()
    const index = data.allowance.records.findIndex(r => r.id === recordId)
    if (index === -1) return false
    
    const record = data.allowance.records[index]
    // 恢复余额
    if (record.type === 'income') {
      data.allowance.balance -= record.amount
    } else {
      data.allowance.balance += record.amount
    }
    
    data.allowance.records.splice(index, 1)
    saveData(data)
    return true
  },

  // ==================== 储蓄目标 ====================

  // 获取储蓄目标列表
  getSavingsGoals() {
    return getLocalData().savingsGoals
  },

  // 创建储蓄目标
  createSavingsGoal(name, targetAmount, deadline = null, description = '') {
    const data = getLocalData()
    const goal = {
      id: Date.now().toString(),
      name,
      targetAmount: Math.abs(targetAmount),
      currentAmount: 0,
      deadline,
      description,
      status: 'active', // 'active' | 'completed' | 'cancelled'
      createTime: new Date().toISOString(),
      completedTime: null
    }
    data.savingsGoals.push(goal)
    saveData(data)
    return goal
  },

  // 存入储蓄
  depositToGoal(goalId, amount) {
    const data = getLocalData()
    const goal = data.savingsGoals.find(g => g.id === goalId)
    if (!goal || goal.status !== 'active') return null
    
    const depositAmount = Math.abs(amount)
    goal.currentAmount += depositAmount
    
    // 检查是否达成目标
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed'
      goal.completedTime = new Date().toISOString()
    }
    
    saveData(data)
    return goal
  },

  // 取出储蓄
  withdrawFromGoal(goalId, amount) {
    const data = getLocalData()
    const goal = data.savingsGoals.find(g => g.id === goalId)
    if (!goal || goal.status === 'cancelled') return null
    
    const withdrawAmount = Math.abs(amount)
    if (withdrawAmount > goal.currentAmount) return null
    
    goal.currentAmount -= withdrawAmount
    if (goal.status === 'completed') {
      goal.status = 'active'
      goal.completedTime = null
    }
    
    saveData(data)
    return goal
  },

  // 更新目标进度
  updateGoalProgress(goalId, currentAmount) {
    const data = getLocalData()
    const goal = data.savingsGoals.find(g => g.id === goalId)
    if (!goal) return null
    
    goal.currentAmount = Math.max(0, Math.min(currentAmount, goal.targetAmount))
    
    if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
      goal.status = 'completed'
      goal.completedTime = new Date().toISOString()
    } else if (goal.currentAmount < goal.targetAmount && goal.status === 'completed') {
      goal.status = 'active'
      goal.completedTime = null
    }
    
    saveData(data)
    return goal
  },

  // 取消目标
  cancelGoal(goalId) {
    const data = getLocalData()
    const goal = data.savingsGoals.find(g => g.id === goalId)
    if (!goal) return false
    
    goal.status = 'cancelled'
    saveData(data)
    return true
  },

  // 删除目标
  deleteGoal(goalId) {
    const data = getLocalData()
    const index = data.savingsGoals.findIndex(g => g.id === goalId)
    if (index === -1) return false
    
    data.savingsGoals.splice(index, 1)
    saveData(data)
    return true
  },

  // 获取目标进度百分比
  getGoalProgress(goal) {
    if (!goal || goal.targetAmount <= 0) return 0
    return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
  },

  // ==================== 消费记录 ====================

  // 获取消费记录
  getSpendingRecords(limit = 100) {
    const records = getLocalData().spendingRecords
    return limit ? records.slice(0, limit) : records
  },

  // 添加消费记录
  addSpendingRecord(amount, category, description = '', paymentMethod = 'cash') {
    const data = getLocalData()
    const record = {
      id: Date.now().toString(),
      amount: Math.abs(amount),
      category,
      description,
      paymentMethod, // 'cash' | 'card' | 'digital'
      createTime: new Date().toISOString()
    }
    data.spendingRecords.unshift(record)
    saveData(data)
    return record
  },

  // 删除消费记录
  deleteSpendingRecord(recordId) {
    const data = getLocalData()
    const index = data.spendingRecords.findIndex(r => r.id === recordId)
    if (index === -1) return false
    
    data.spendingRecords.splice(index, 1)
    saveData(data)
    return true
  },

  // 获取消费分类统计
  getSpendingStats(dateRange = null, groupBy = 'category') {
    const data = getLocalData()
    let records = data.spendingRecords
    
    if (dateRange) {
      const start = new Date(dateRange.start).getTime()
      const end = new Date(dateRange.end).getTime()
      records = records.filter(r => {
        const time = new Date(r.createTime).getTime()
        return time >= start && time <= end
      })
    }
    
    const totalAmount = records.reduce((sum, r) => sum + r.amount, 0)
    
    // 按分类统计
    const byCategory = {}
    records.forEach(r => {
      byCategory[r.category] = (byCategory[r.category] || 0) + r.amount
    })
    
    // 按日期统计
    const byDate = {}
    records.forEach(r => {
      const date = r.createTime.split('T')[0]
      byDate[date] = (byDate[date] || 0) + r.amount
    })
    
    // 按支付方式统计
    const byPaymentMethod = {}
    records.forEach(r => {
      byPaymentMethod[r.paymentMethod] = (byPaymentMethod[r.paymentMethod] || 0) + r.amount
    })
    
    // 计算平均消费
    const avgAmount = records.length > 0 ? totalAmount / records.length : 0
    
    return {
      totalAmount,
      recordCount: records.length,
      avgAmount,
      byCategory,
      byDate,
      byPaymentMethod,
      topCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0] || null
    }
  },

  // 获取消费习惯分析
  getSpendingHabits(dateRange = null) {
    const stats = this.getSpendingStats(dateRange)
    const records = dateRange ? this.getSpendingRecords(500).filter(r => {
      const start = new Date(dateRange.start).getTime()
      const end = new Date(dateRange.end).getTime()
      const time = new Date(r.createTime).getTime()
      return time >= start && time <= end
    }) : this.getSpendingRecords(500)
    
    // 分析消费频率
    const dailyCount = {}
    records.forEach(r => {
      const date = r.createTime.split('T')[0]
      dailyCount[date] = (dailyCount[date] || 0) + 1
    })
    
    const avgFrequency = Object.keys(dailyCount).length > 0 
      ? records.length / Object.keys(dailyCount).length 
      : 0
    
    // 判断消费习惯
    let habit = '节约型'
    if (stats.avgAmount > 50) {
      habit = '消费型'
    } else if (stats.avgAmount > 20) {
      habit = '平衡型'
    }
    
    return {
      habit,
      avgDailyFrequency: avgFrequency.toFixed(1),
      totalSpent: stats.totalAmount,
      transactionCount: stats.recordCount,
      topCategory: stats.topCategory,
      suggestion: this.getHabitSuggestion(habit, stats)
    }
  },

  // 获取习惯建议
  getHabitSuggestion(habit, stats) {
    const suggestions = {
      '节约型': '继续保持良好的消费习惯，可以尝试将一部分钱用于储蓄或投资自己！',
      '平衡型': '消费比较平衡，建议记录大额支出，培养储蓄习惯。',
      '消费型': '消费较高，建议制定每周消费预算，学会区分需要和想要。'
    }
    return suggestions[habit] || suggestions['平衡型']
  },

  // ==================== 财富知识 ====================

  // 财商知识库
  getMoneyKnowledge() {
    return [
      {
        id: 'basics-1',
        title: '什么是零花钱？',
        content: '零花钱是父母或长辈给孩子的钱，让孩子学习管理金钱。',
        category: '基础概念',
        ageRange: '6-8'
      },
      {
        id: 'basics-2',
        title: '收入与支出',
        content: '收入是你得到的钱，支出是你花掉的钱。学会记录每一笔收入和支出！',
        category: '基础概念',
        ageRange: '6-8'
      },
      {
        id: 'basics-3',
        title: '储蓄的重要性',
        content: '把一部分钱存起来，以后可以买更想要的东西，或者应对紧急情况。',
        category: '储蓄',
        ageRange: '7-9'
      },
      {
        id: 'saving-1',
        title: '先存后花',
        content: '每次得到零花钱，先把一部分存起来，剩下的再用来花。',
        category: '储蓄技巧',
        ageRange: '8-10'
      },
      {
        id: 'saving-2',
        title: '设定储蓄目标',
        content: '想要买一个玩具车？算出需要多少钱，设定目标，慢慢存！',
        category: '储蓄技巧',
        ageRange: '8-10'
      },
      {
        id: 'spending-1',
        title: '需要 vs 想要',
        content: '需要是生活中必须的，想要是让我们开心的。学会区分它们！',
        category: '消费智慧',
        ageRange: '9-12'
      },
      {
        id: 'spending-2',
        title: '货比三家',
        content: '买东西前看看不同地方的价格，选性价比最高的。',
        category: '消费智慧',
        ageRange: '9-12'
      },
      {
        id: 'concept-1',
        title: '什么是银行？',
        content: '银行是保管钱的地方，把钱存银行可以安全还能获得利息。',
        category: '金融知识',
        ageRange: '10-12'
      },
      {
        id: 'concept-2',
        title: '什么是利息？',
        content: '把钱存银行，银行会给你一些小奖励，这就是利息。',
        category: '金融知识',
        ageRange: '10-12'
      },
      {
        id: 'concept-3',
        title: '什么是预算？',
        content: '预算就是计划好怎么花钱，帮你控制支出，不超支。',
        category: '金融知识',
        ageRange: '10-12'
      }
    ]
  },

  // 获取财商测试题目
  getMoneyQuiz() {
    return [
      {
        id: 'quiz-1',
        question: '你得到100元零花钱，最好的做法是？',
        options: [
          { text: '立刻全部花掉', correct: false },
          { text: '全部存起来，一分不花', correct: false },
          { text: '一部分存起来，一部分用于合理消费', correct: true },
          { text: '买最贵的玩具', correct: false }
        ],
        explanation: '合理分配零花钱，既要储蓄也要学会合理消费。'
      },
      {
        id: 'quiz-2',
        question: '以下哪个是"需要"而不是"想要"？',
        options: [
          { text: '最新款手机', correct: false },
          { text: '冰淇淋', correct: false },
          { text: '学校用的书包', correct: true },
          { text: '游戏皮肤', correct: false }
        ],
        explanation: '书包是学习必需品，而手机、冰淇淋、游戏皮肤都是想要的。'
      },
      {
        id: 'quiz-3',
        question: '储蓄有什么好处？',
        options: [
          { text: '钱会变多', correct: false },
          { text: '可以买更贵的东西，应对紧急情况', correct: true },
          { text: '没有好处', correct: false },
          { text: '会让钱变少', correct: false }
        ],
        explanation: '储蓄可以积少成多，实现大目标，也能应对突发情况。'
      },
      {
        id: 'quiz-4',
        question: '买东西时应该怎么做？',
        options: [
          { text: '看到就买', correct: false },
          { text: '不需要比较，直接买', correct: false },
          { text: '先比较价格和质量，再决定', correct: true },
          { text: '只看价格，不看质量', correct: false }
        ],
        explanation: '货比三家才能买到性价比最高的东西。'
      },
      {
        id: 'quiz-5',
        question: '如果一个玩具要200元，你每周只有20元零花钱，你应该？',
        options: [
          { text: '借钱买', correct: false },
          { text: '不买了', correct: false },
          { text: '设定储蓄目标，每周存一点', correct: true },
          { text: '偷钱买', correct: false }
        ],
        explanation: '设定储蓄目标，10周就能存够买玩具的钱了！'
      }
    ]
  },

  // ==================== 数据重置 ====================

  // 清空所有数据
  clearAllData() {
    uni.removeStorageSync(STORAGE_KEY)
    return true
  },

  // 导出数据
  exportData() {
    return getLocalData()
  }
}
