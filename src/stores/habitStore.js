/**
 * V81 Habit Master Store
 * 习惯养成系统状态管理
 * 习惯追踪、21天挑战、习惯链绑定、成就激励
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import { usePointsStore } from './pointsStore.js'

export const useHabitStore = defineStore('habit', () => {
  // ==================== 状态 ====================

  // 习惯列表
  const habits = ref([])

  // 习惯打卡记录 (habitId -> records[])
  const habitRecords = ref({})

  // 21天挑战列表
  const challenges = ref([])

  // 习惯链定义
  const habitChains = ref([])

  // 当前选中的习惯
  const currentHabit = ref(null)

  // 统计数据
  const statistics = ref({
    totalHabits: 0,
    activeHabits: 0,
    completedToday: 0,
    longestStreak: 0,
    totalCheckIns: 0,
    chainBonuses: 0
  })

  // ==================== 工具函数 ====================

  const getTodayString = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }

  const getDateString = (date) => {
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const daysBetween = (date1, date2) => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diffTime = Math.abs(d2 - d1)
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  // ==================== 持久化 ====================

  const STORAGE_KEYS = {
    HABITS: 'habit_master_habits',
    RECORDS: 'habit_master_records',
    CHALLENGES: 'habit_master_challenges',
    CHAINS: 'habit_master_chains'
  }

  const loadFromStorage = () => {
    try {
      const habitsData = uni.getStorageSync(STORAGE_KEYS.HABITS)
      if (habitsData) habits.value = JSON.parse(habitsData)

      const recordsData = uni.getStorageSync(STORAGE_KEYS.RECORDS)
      if (recordsData) habitRecords.value = JSON.parse(recordsData)

      const challengesData = uni.getStorageSync(STORAGE_KEYS.CHALLENGES)
      if (challengesData) challenges.value = JSON.parse(challengesData)

      const chainsData = uni.getStorageSync(STORAGE_KEYS.CHAINS)
      if (chainsData) habitChains.value = JSON.parse(chainsData)
    } catch (e) {
      console.error('加载习惯数据失败:', e)
    }
  }

  const saveToStorage = () => {
    try {
      uni.setStorageSync(STORAGE_KEYS.HABITS, JSON.stringify(habits.value))
      uni.setStorageSync(STORAGE_KEYS.RECORDS, JSON.stringify(habitRecords.value))
      uni.setStorageSync(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges.value))
      uni.setStorageSync(STORAGE_KEYS.CHAINS, JSON.stringify(habitChains.value))
    } catch (e) {
      console.error('保存习惯数据失败:', e)
    }
  }

  // ==================== 初始化 ====================

  const init = () => {
    loadFromStorage()
    updateStatistics()
  }

  // ==================== 习惯管理 ====================

  const createHabit = (habitData) => {
    const babyStore = useBabyStore()
    if (!babyStore.currentBabyId) {
      return { success: false, message: '请先选择宝宝' }
    }

    const now = new Date().toISOString()
    const newHabit = {
      id: `habit_${Date.now()}`,
      babyId: babyStore.currentBabyId,
      name: habitData.name,
      description: habitData.description || '',
      icon: habitData.icon || '✨',
      color: habitData.color || '#FF6B35',
      category: habitData.category || 'general', // general, health, learning, life, social
      frequency: habitData.frequency || 'daily', // daily, weekly
      targetDays: habitData.targetDays || [], // [1,2,3,4,5,6,0] for weekly
      reminderTime: habitData.reminderTime || null,
      startDate: getTodayString(),
      status: 'active', // active, paused, completed
      currentStreak: 0,
      longestStreak: 0,
      totalCheckIns: 0,
      lastCheckIn: null,
      createdAt: now,
      updatedAt: now
    }

    habits.value.push(newHabit)
    habitRecords.value[newHabit.id] = []
    saveToStorage()
    updateStatistics()

    return { success: true, habit: newHabit }
  }

  const updateHabit = (habitId, updates) => {
    const index = habits.value.findIndex(h => h.id === habitId)
    if (index === -1) return { success: false, message: '习惯不存在' }

    habits.value[index] = {
      ...habits.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    saveToStorage()
    return { success: true, habit: habits.value[index] }
  }

  const deleteHabit = (habitId) => {
    const index = habits.value.findIndex(h => h.id === habitId)
    if (index === -1) return { success: false, message: '习惯不存在' }

    habits.value.splice(index, 1)
    delete habitRecords.value[habitId]
    saveToStorage()
    updateStatistics()
    return { success: true }
  }

  const pauseHabit = (habitId) => {
    return updateHabit(habitId, { status: 'paused' })
  }

  const resumeHabit = (habitId) => {
    return updateHabit(habitId, { status: 'active' })
  }

  // ==================== 打卡功能 ====================

  const checkIn = (habitId) => {
    const babyStore = useBabyStore()
    const pointsStore = usePointsStore()
    const habit = habits.value.find(h => h.id === habitId)

    if (!habit) return { success: false, message: '习惯不存在' }
    if (habit.status !== 'active') return { success: false, message: '习惯已暂停或完成' }

    const today = getTodayString()
    const records = habitRecords.value[habitId] || []

    // 检查今天是否已打卡
    const alreadyChecked = records.some(r => r.date === today)
    if (alreadyChecked) return { success: false, message: '今日已打卡' }

    // 记录打卡
    const record = {
      id: `record_${Date.now()}`,
      habitId,
      date: today,
      checkInTime: new Date().toISOString(),
      points: 10,
      streakBonus: 0
    }

    // 计算连续打卡
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = getDateString(yesterday)

    let streakBonus = 0
    if (habit.lastCheckIn === yesterdayStr) {
      // 连续打卡
      habit.currentStreak++
    } else if (habit.lastCheckIn !== today) {
      // 断开，重新计数
      habit.currentStreak = 1
    }

    // 连续打卡加成 (每7天额外奖励)
    if (habit.currentStreak > 0 && habit.currentStreak % 7 === 0) {
      streakBonus = 50
      record.streakBonus = streakBonus
    }

    // 更新最长连续
    if (habit.currentStreak > habit.longestStreak) {
      habit.longestStreak = habit.currentStreak
    }

    habit.totalCheckIns++
    habit.lastCheckIn = today
    habit.updatedAt = new Date().toISOString()

    // 保存记录
    if (!habitRecords.value[habitId]) {
      habitRecords.value[habitId] = []
    }
    habitRecords.value[habitId].push(record)

    // 计算积分
    let earnedPoints = record.points + streakBonus

    // 习惯链加成
    const chainBonus = calculateChainBonus(habitId)
    earnedPoints += chainBonus.points
    record.chainBonus = chainBonus.points

    // 发放积分
    if (earnedPoints > 0) {
      pointsStore.addBabyPoints(babyStore.currentBabyId, earnedPoints, `习惯打卡:${habit.name}`)
    }

    saveToStorage()
    updateStatistics()

    return {
      success: true,
      record,
      streak: habit.currentStreak,
      points: earnedPoints,
      chainBonus
    }
  }

  const uncheckIn = (habitId) => {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return { success: false, message: '习惯不存在' }

    const today = getTodayString()
    const records = habitRecords.value[habitId] || []
    const todayIndex = records.findIndex(r => r.date === today)

    if (todayIndex === -1) return { success: false, message: '今日未打卡' }

    // 删除记录
    records.splice(todayIndex, 1)

    // 重新计算连续天数 (简化处理)
    if (habit.currentStreak > 0) {
      habit.currentStreak--
    }
    habit.totalCheckIns = Math.max(0, habit.totalCheckIns - 1)

    // 重新查找最后打卡日期
    if (records.length > 0) {
      const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date))
      habit.lastCheckIn = sortedRecords[0].date
    } else {
      habit.lastCheckIn = null
    }

    habit.updatedAt = new Date().toISOString()
    saveToStorage()
    updateStatistics()

    return { success: true }
  }

  // ==================== 21天挑战 ====================

  const startChallenge = (habitId) => {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return { success: false, message: '习惯不存在' }

    // 检查是否已有进行中的挑战
    const existingChallenge = challenges.value.find(
      c => c.habitId === habitId && c.status === 'in_progress'
    )
    if (existingChallenge) return { success: false, message: '该习惯已有进行中的挑战' }

    const today = getTodayString()
    const challenge = {
      id: `challenge_${Date.now()}`,
      habitId,
      habitName: habit.name,
      habitIcon: habit.icon,
      habitColor: habit.color,
      startDate: today,
      targetDays: 21,
      currentDay: 0,
      completedDays: [],
      status: 'in_progress', // in_progress, completed, failed
      milestoneReached: [], // 7, 14, 21
      certificateEarned: false,
      startedAt: new Date().toISOString(),
      completedAt: null
    }

    challenges.value.push(challenge)
    saveToStorage()

    return { success: true, challenge }
  }

  const updateChallengeProgress = (challengeId) => {
    const challenge = challenges.value.find(c => c.id === challengeId)
    if (!challenge) return { success: false, message: '挑战不存在' }

    const today = getTodayString()
    if (challenge.completedDays.includes(today)) {
      return { success: false, message: '今日已完成打卡' }
    }

    const habit = habits.value.find(h => h.id === challenge.habitId)
    if (!habit) return { success: false, message: '关联习惯不存在' }

    // 添加今天到完成列表
    challenge.completedDays.push(today)
    challenge.currentDay = challenge.completedDays.length

    // 检查里程碑
    const milestones = [7, 14, 21]
    milestones.forEach(day => {
      if (challenge.currentDay >= day && !challenge.milestoneReached.includes(day)) {
        challenge.milestoneReached.push(day)
        uni.$emit('challengeMilestoneReached', {
          challengeId,
          milestone: day,
          totalDays: challenge.targetDays
        })
      }
    })

    // 检查是否完成
    if (challenge.currentDay >= challenge.targetDays) {
      challenge.status = 'completed'
      challenge.completedAt = new Date().toISOString()
      challenge.certificateEarned = true

      // 发放完成奖励
      const babyStore = useBabyStore()
      const pointsStore = usePointsStore()
      const completionBonus = 200
      pointsStore.addBabyPoints(babyStore.currentBabyId, completionBonus, `21天挑战完成:${challenge.habitName}`)

      uni.$emit('challengeCompleted', { challengeId, habitName: challenge.habitName })
    }

    saveToStorage()
    return { success: true, challenge }
  }

  const getChallengeProgress = (habitId) => {
    return challenges.value.filter(c => c.habitId === habitId)
  }

  // ==================== 习惯链 ====================

  const createHabitChain = (chainData) => {
    const newChain = {
      id: `chain_${Date.now()}`,
      name: chainData.name,
      description: chainData.description || '',
      upstreamHabitId: chainData.upstreamHabitId,
      downstreamHabitId: chainData.downstreamHabitId,
      rewardMultiplier: chainData.rewardMultiplier || 1.2, // 完成上游后下游习惯奖励加成
      bonusPoints: chainData.bonusPoints || 5,
      status: 'active',
      createdAt: new Date().toISOString()
    }

    habitChains.value.push(newChain)
    saveToStorage()

    return { success: true, chain: newChain }
  }

  const deleteHabitChain = (chainId) => {
    const index = habitChains.value.findIndex(c => c.id === chainId)
    if (index === -1) return { success: false, message: '习惯链不存在' }

    habitChains.value.splice(index, 1)
    saveToStorage()
    return { success: true }
  }

  const calculateChainBonus = (habitId) => {
    let totalBonus = 0
    let chainNames = []

    habitChains.value.forEach(chain => {
      if (chain.status !== 'active') return

      const today = getTodayString()

      // 检查是否是下游习惯
      if (chain.downstreamHabitId === habitId) {
        // 检查上游习惯今天是否完成
        const upstreamRecords = habitRecords.value[chain.upstreamHabitId] || []
        const upstreamCompletedToday = upstreamRecords.some(r => r.date === today)

        if (upstreamCompletedToday) {
          totalBonus += chain.bonusPoints
          const upstreamHabit = habits.value.find(h => h.id === chain.upstreamHabitId)
          if (upstreamHabit) {
            chainNames.push(upstreamHabit.name)
          }
        }
      }
    })

    return {
      points: totalBonus,
      triggeredBy: chainNames
    }
  }

  const getUpstreamChains = (habitId) => {
    return habitChains.value.filter(c => c.downstreamHabitId === habitId && c.status === 'active')
  }

  const getDownstreamChains = (habitId) => {
    return habitChains.value.filter(c => c.upstreamHabitId === habitId && c.status === 'active')
  }

  // ==================== 统计数据 ====================

  const updateStatistics = () => {
    const today = getTodayString()
    let completedToday = 0
    let longestStreak = 0
    let totalCheckIns = 0

    habits.value.forEach(habit => {
      if (habit.status === 'active') {
        if (habit.lastCheckIn === today) {
          completedToday++
        }
        if (habit.longestStreak > longestStreak) {
          longestStreak = habit.longestStreak
        }
      }
      totalCheckIns += habit.totalCheckIns
    })

    statistics.value = {
      totalHabits: habits.value.length,
      activeHabits: habits.value.filter(h => h.status === 'active').length,
      completedToday,
      longestStreak,
      totalCheckIns,
      chainBonuses: Object.values(habitRecords.value).flat().reduce((sum, r) => sum + (r.chainBonus || 0), 0)
    }
  }

  // ==================== 计算属性 ====================

  const activeHabits = computed(() => {
    return habits.value.filter(h => h.status === 'active')
  })

  const habitsByCategory = computed(() => {
    const grouped = {}
    habits.value.forEach(habit => {
      if (!grouped[habit.category]) {
        grouped[habit.category] = []
      }
      grouped[habit.category].push(habit)
    })
    return grouped
  })

  const todayCheckedHabits = computed(() => {
    const today = getTodayString()
    return habits.value.filter(h => {
      const records = habitRecords.value[h.id] || []
      return records.some(r => r.date === today)
    })
  })

  const todayUncheckedHabits = computed(() => {
    const today = getTodayString()
    return habits.value.filter(h => {
      if (h.status !== 'active') return false
      const records = habitRecords.value[h.id] || []
      return !records.some(r => r.date === today)
    })
  })

  const inProgressChallenges = computed(() => {
    return challenges.value.filter(c => c.status === 'in_progress')
  })

  const completedChallenges = computed(() => {
    return challenges.value.filter(c => c.status === 'completed')
  })

  const habitCompletionRate = computed(() => {
    const active = activeHabits.value
    if (active.length === 0) return 0
    const today = getTodayString()
    let completed = 0
    active.forEach(h => {
      const records = habitRecords.value[h.id] || []
      if (records.some(r => r.date === today)) {
        completed++
      }
    })
    return Math.round((completed / active.length) * 100)
  })

  // ==================== 获取习惯详情 ====================

  const getHabitById = (habitId) => {
    return habits.value.find(h => h.id === habitId)
  }

  const getHabitRecords = (habitId) => {
    return habitRecords.value[habitId] || []
  }

  const getHabitStats = (habitId) => {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return null

    const records = habitRecords.value[habitId] || []
    const totalPoints = records.reduce((sum, r) => sum + r.points + (r.streakBonus || 0) + (r.chainBonus || 0), 0)

    // 计算本周完成天数
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const weekStartStr = getDateString(weekStart)

    const weekRecords = records.filter(r => r.date >= weekStartStr)
    const weekDays = new Set(weekRecords.map(r => r.date)).size

    // 计算本月完成天数
    const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
    const monthRecords = records.filter(r => r.date >= monthStart)
    const monthDays = new Set(monthRecords.map(r => r.date)).size

    // 计算完成率 (假设习惯设定了目标天数)
    const last30Days = []
    for (let i = 0; i < 30; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      last30Days.push(getDateString(d))
    }
    const completedIn30Days = records.filter(r => last30Days.includes(r.date)).length
    const completionRate = Math.round((completedIn30Days / 30) * 100)

    return {
      habitId,
      habitName: habit.name,
      totalCheckIns: habit.totalCheckIns,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      totalPoints,
      weekDays,
      monthDays,
      completionRate
    }
  }

  // ==================== 导出 ====================

  return {
    // 状态
    habits,
    habitRecords,
    challenges,
    habitChains,
    currentHabit,
    statistics,

    // 初始化
    init,

    // 习惯管理
    createHabit,
    updateHabit,
    deleteHabit,
    pauseHabit,
    resumeHabit,
    getHabitById,
    getHabitRecords,
    getHabitStats,

    // 打卡
    checkIn,
    uncheckIn,

    // 21天挑战
    startChallenge,
    updateChallengeProgress,
    getChallengeProgress,

    // 习惯链
    createHabitChain,
    deleteHabitChain,
    calculateChainBonus,
    getUpstreamChains,
    getDownstreamChains,

    // 计算属性
    activeHabits,
    habitsByCategory,
    todayCheckedHabits,
    todayUncheckedHabits,
    inProgressChallenges,
    completedChallenges,
    habitCompletionRate,

    // 工具
    getTodayString,
    getDateString
  }
})
