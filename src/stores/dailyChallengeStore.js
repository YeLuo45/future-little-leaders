import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore'
import { usePointsStore } from './pointsStore'

/**
 * V80 Daily Challenge Store
 * 每日挑战系统：每日任务刷新、挑战日历、连续挑战奖励、难度递进
 */
export const useDailyChallengeStore = defineStore('dailyChallenge', () => {
  const babyStore = useBabyStore()
  const pointsStore = usePointsStore()

  // 每日任务列表
  const dailyTasks = ref([])
  // 完成任务记录
  const completedTasks = ref([])
  // 连续挑战天数
  const streakDays = ref(0)
  // 最后完成日期
  const lastCompletedDate = ref(null)
  // 用户积分
  const challengePoints = ref(0)

  // 难度等级配置
  const difficultyTiers = {
    easy: { name: '简单', points: 10, streakBonus: 5 },
    medium: { name: '中等', points: 20, streakBonus: 10 },
    hard: { name: '困难', points: 30, streakBonus: 15 },
    expert: { name: '专家', points: 50, streakBonus: 25 }
  }

  // 连续奖励配置
  const streakRewards = {
    3: { bonus: 20, badge: 'streak_3' },
    7: { bonus: 50, badge: 'streak_7' },
    14: { bonus: 100, badge: 'streak_14' },
    30: { bonus: 200, badge: 'streak_30' }
  }

  // 任务模板池
  const taskTemplates = [
    { title: '阅读绘本30分钟', category: 'reading', difficulty: 'easy' },
    { title: '练习写字15分钟', category: 'writing', difficulty: 'easy' },
    { title: '完成数学口算20道', category: 'math', difficulty: 'medium' },
    { title: '背诵古诗一首', category: 'language', difficulty: 'easy' },
    { title: '户外运动30分钟', category: 'health', difficulty: 'medium' },
    { title: '整理自己的房间', category: 'life', difficulty: 'easy' },
    { title: '帮助家人做家务', category: 'life', difficulty: 'medium' },
    { title: '画一幅创意画', category: 'art', difficulty: 'medium' },
    { title: '学习新英语单词10个', category: 'language', difficulty: 'medium' },
    { title: '完成科学小实验', category: 'science', difficulty: 'hard' },
    { title: '跳绳100个', category: 'health', difficulty: 'easy' },
    { title: '阅读科普文章', category: 'reading', difficulty: 'medium' },
    { title: '练习乐器20分钟', category: 'art', difficulty: 'medium' },
    { title: '完成思维逻辑题5道', category: 'critical', difficulty: 'hard' },
    { title: '写一篇日记', category: 'writing', difficulty: 'medium' }
  ]

  // 获取今日日期字符串
  const getTodayString = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }

  // 检查是否需要刷新任务
  const needsRefresh = () => {
    const today = getTodayString()
    return lastCompletedDate.value !== today
  }

  // 初始化
  const init = () => {
    loadDailyChallenges()
    loadCompletedTasks()
    loadStreakData()
    if (needsRefresh()) {
      refreshDailyTasks()
    }
  }

  // 加载数据
  const loadDailyChallenges = () => {
    try {
      const stored = uni.getStorageSync('daily_challenges')
      if (stored) {
        const data = JSON.parse(stored)
        dailyTasks.value = data.tasks || []
        challengePoints.value = data.points || 0
      }
    } catch (e) {
      console.error('加载每日挑战失败:', e)
      dailyTasks.value = []
    }
  }

  const saveDailyChallenges = () => {
    try {
      uni.setStorageSync('daily_challenges', JSON.stringify({
        tasks: dailyTasks.value,
        points: challengePoints.value
      }))
      return true
    } catch (e) {
      console.error('保存每日挑战失败:', e)
      return false
    }
  }

  const loadCompletedTasks = () => {
    try {
      const stored = uni.getStorageSync('completed_daily_tasks')
      if (stored) {
        completedTasks.value = JSON.parse(stored)
      }
    } catch (e) {
      completedTasks.value = []
    }
  }

  const saveCompletedTasks = () => {
    try {
      uni.setStorageSync('completed_daily_tasks', JSON.stringify(completedTasks.value))
    } catch (e) {
      console.error('保存完成任务记录失败:', e)
    }
  }

  const loadStreakData = () => {
    try {
      const stored = uni.getStorageSync('challenge_streak')
      if (stored) {
        const data = JSON.parse(stored)
        streakDays.value = data.streakDays || 0
        lastCompletedDate.value = data.lastDate || null
      }
    } catch (e) {
      streakDays.value = 0
    }
  }

  const saveStreakData = () => {
    try {
      uni.setStorageSync('challenge_streak', JSON.stringify({
        streakDays: streakDays.value,
        lastDate: lastCompletedDate.value
      }))
    } catch (e) {
      console.error('保存连续挑战数据失败:', e)
    }
  }

  // 刷新每日任务
  const refreshDailyTasks = () => {
    const today = getTodayString()
    const shuffled = [...taskTemplates].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 5)

    dailyTasks.value = selected.map((template, index) => ({
      id: `task_${today}_${index}`,
      title: template.title,
      category: template.category,
      difficulty: template.difficulty,
      points: difficultyTiers[template.difficulty].points,
      completed: false,
      date: today
    }))

    saveDailyChallenges()
  }

  // 完成任务
  const completeTask = (taskId) => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return { success: false, message: '请先选择宝宝' }

    const task = dailyTasks.value.find(t => t.id === taskId)
    if (!task) return { success: false, message: '任务不存在' }
    if (task.completed) return { success: false, message: '任务已完成' }

    // 标记完成
    task.completed = true
    task.completedAt = new Date().toISOString()

    // 记录完成
    const record = {
      taskId: task.id,
      taskTitle: task.title,
      difficulty: task.difficulty,
      points: task.points,
      date: task.date,
      completedAt: task.completedAt
    }
    completedTasks.value.push(record)

    // 计算积分
    let earnedPoints = task.points

    // 检查连续奖励
    const today = getTodayString()
    if (lastCompletedDate.value !== today) {
      // 新的一天，检查是否连续
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

      if (lastCompletedDate.value === yesterdayStr) {
        streakDays.value++
      } else if (lastCompletedDate.value !== today) {
        streakDays.value = 1 // 重新开始计数
      }
      lastCompletedDate.value = today
    }

    // 连续天数加成
    const streakBonus = difficultyTiers[task.difficulty].streakBonus
    earnedPoints += streakBonus

    // 检查里程碑奖励
    if (streakRewards[streakDays.value]) {
      const milestoneReward = streakRewards[streakDays.value]
      earnedPoints += milestoneReward.bonus
      uni.$emit('streakMilestoneReached', { days: streakDays.value, bonus: milestoneReward.bonus })
    }

    // 更新总积分
    challengePoints.value += earnedPoints

    // 保存数据
    saveDailyChallenges()
    saveCompletedTasks()
    saveStreakData()

    // 发放积分到宝宝账户
    pointsStore.addBabyPoints(babyId, earnedPoints, `每日挑战:${task.title}`)

    return {
      success: true,
      points: earnedPoints,
      streakBonus,
      streakDays: streakDays.value,
      milestone: streakRewards[streakDays.value] || null
    }
  }

  // 计算属性
  const todayTasks = computed(() => {
    const today = getTodayString()
    return dailyTasks.value.filter(t => t.date === today)
  })

  const completedTodayCount = computed(() => {
    return todayTasks.value.filter(t => t.completed).length
  })

  const todayProgress = computed(() => {
    const total = todayTasks.value.length
    if (total === 0) return 0
    return Math.round((completedTodayCount.value / total) * 100)
  })

  const allCompletedToday = computed(() => {
    return todayTasks.value.length > 0 && todayTasks.value.every(t => t.completed)
  })

  const currentStreakReward = computed(() => {
    return streakRewards[streakDays.value] || null
  })

  const nextStreakReward = computed(() => {
    const milestones = Object.keys(streakRewards).map(Number).sort((a, b) => a - b)
    const nextMilestone = milestones.find(m => m > streakDays.value)
    if (nextMilestone) {
      return { days: nextMilestone, ...streakRewards[nextMilestone] }
    }
    return null
  })

  // 获取月份统计数据
  const getMonthlyStats = (year, month) => {
    const completedInMonth = completedTasks.value.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month
    })

    const totalDays = new Date(year, month, 0).getDate()
    const activeDays = new Set(completedInMonth.map(r => r.date)).size
    const totalPoints = completedInMonth.reduce((sum, r) => sum + r.points, 0)

    // 构建日历数据
    const calendar = []
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayRecords = completedInMonth.filter(r => r.date === dateStr)
      calendar.push({
        day,
        date: dateStr,
        completed: dayRecords.length > 0,
        taskCount: dayRecords.length,
        points: dayRecords.reduce((sum, r) => sum + r.points, 0)
      })
    }

    return {
      activeDays,
      totalDays,
      totalPoints,
      completionRate: Math.round((activeDays / totalDays) * 100),
      calendar
    }
  }

  // 获取排行榜数据
  const getLeaderboard = () => {
    // 从已完成记录中汇总数据
    const userStats = {}
    completedTasks.value.forEach(record => {
      if (!userStats[record.date]) {
        userStats[record.date] = { tasks: 0, points: 0 }
      }
      userStats[record.date].tasks++
      userStats[record.date].points += record.points
    })

    return Object.entries(userStats)
      .map(([date, stats]) => ({
        date,
        tasksCompleted: stats.tasks,
        pointsEarned: stats.points
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  // 获取难度分布
  const difficultyDistribution = computed(() => {
    const dist = { easy: 0, medium: 0, hard: 0, expert: 0 }
    todayTasks.value.forEach(task => {
      if (dist[task.difficulty] !== undefined) {
        dist[task.difficulty]++
      }
    })
    return dist
  })

  return {
    // 状态
    dailyTasks,
    completedTasks,
    streakDays,
    lastCompletedDate,
    challengePoints,
    difficultyTiers,
    streakRewards,

    // 计算属性
    todayTasks,
    completedTodayCount,
    todayProgress,
    allCompletedToday,
    currentStreakReward,
    nextStreakReward,
    difficultyDistribution,

    // 方法
    init,
    refreshDailyTasks,
    completeTask,
    getMonthlyStats,
    getLeaderboard,
    getTodayString
  }
})
