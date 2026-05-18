import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import { usePointsStore } from './pointsStore.js'
import { useLeaderboardStore } from './leaderboardStore.js'

/**
 * V22 多儿童家庭管理Store
 * 支持多儿童家庭的统一管理视图
 */
export const useFamilyStore = defineStore('family', () => {
  // 状态
  const children = ref([])                    // 家庭儿童列表
  const selectedChildId = ref('')             // 当前选中的儿童ID
  const familyPointsPool = ref(0)             // 家庭共享积分池
  const pointsTransferRecords = ref([])       // 积分转账记录
  const siblingCompetitions = ref([])         // 兄弟姐妹竞赛列表
  const familyAchievements = ref({})          // 家庭成就对比数据

  // 儿童Store
  const babyStore = useBabyStore()
  const pointsStore = usePointsStore()
  const leaderboardStore = useLeaderboardStore()

  // 家庭积分池存储键
  const FAMILY_POOL_KEY = 'family_points_pool'
  const POOL_RECORDS_KEY = 'family_pool_records'
  const SIBLING_COMPETITIONS_KEY = 'sibling_competitions'

  // 计算属性
  // 当前选中的儿童
  const selectedChild = computed(() => {
    return children.value.find(c => c.id === selectedChildId.value) || null
  })

  // 按积分排序的儿童排行
  const childrenRanking = computed(() => {
    return [...children.value].sort((a, b) => {
      const pointsA = pointsStore.getBabyPoints(a.id)
      const pointsB = pointsStore.getBabyPoints(b.id)
      return pointsB - pointsA
    })
  })

  // 获取所有儿童积分
  const childrenPointsMap = computed(() => {
    const map = {}
    children.value.forEach(child => {
      map[child.id] = pointsStore.getBabyPoints(child.id)
    })
    return map
  })

  // 方法
  // 初始化家庭Store
  const init = () => {
    loadChildren()
    loadFamilyPointsPool()
    loadPointsTransferRecords()
    loadSiblingCompetitions()
  }

  // 加载家庭儿童列表（从babyStore同步）
  const loadChildren = () => {
    // 使用babyStore中的宝宝作为儿童
    children.value = babyStore.babies.map(baby => ({
      id: baby.id,
      name: baby.name,
      avatar: baby.avatar || babyStore.getDefaultAvatar(baby.id),
      gender: baby.gender,
      birthdate: baby.birthdate,
      age: babyStore.formatAge(baby.birthdate),
      points: pointsStore.getBabyPoints(baby.id),
      rank: 0
    }))

    // 更新排名
    updateChildrenRanks()

    // 设置当前选中的儿童
    if (!selectedChildId.value && children.value.length > 0) {
      selectedChildId.value = babyStore.currentBabyId || children.value[0].id
    }
  }

  // 更新儿童排名
  const updateChildrenRanks = () => {
    const sorted = [...children.value].sort((a, b) => {
      const pointsA = pointsStore.getBabyPoints(a.id)
      const pointsB = pointsStore.getBabyPoints(b.id)
      return pointsB - pointsA
    })
    sorted.forEach((child, index) => {
      const original = children.value.find(c => c.id === child.id)
      if (original) {
        original.rank = index + 1
      }
    })
  }

  // 选择儿童
  const selectChild = (childId) => {
    selectedChildId.value = childId
    babyStore.setCurrentBaby(childId)
  }

  // 获取儿童积分
  const getChildPoints = (childId) => {
    return pointsStore.getBabyPoints(childId)
  }

  // 刷新儿童积分
  const refreshChildrenPoints = () => {
    children.value.forEach(child => {
      child.points = pointsStore.getBabyPoints(child.id)
    })
    updateChildrenRanks()
  }

  // ========== 家庭积分池 ==========

  // 加载家庭积分池
  const loadFamilyPointsPool = () => {
    try {
      const stored = uni.getStorageSync(FAMILY_POOL_KEY)
      familyPointsPool.value = stored ? parseInt(stored) : 0
    } catch (e) {
      console.error('加载家庭积分池失败:', e)
      familyPointsPool.value = 0
    }
  }

  // 保存家庭积分池
  const saveFamilyPointsPool = () => {
    uni.setStorageSync(FAMILY_POOL_KEY, familyPointsPool.value.toString())
  }

  // 加载积分转账记录
  const loadPointsTransferRecords = () => {
    try {
      const stored = uni.getStorageSync(POOL_RECORDS_KEY)
      pointsTransferRecords.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('加载积分转账记录失败:', e)
      pointsTransferRecords.value = []
    }
  }

  // 保存积分转账记录
  const savePointsTransferRecords = () => {
    uni.setStorageSync(POOL_RECORDS_KEY, JSON.stringify(pointsTransferRecords.value))
  }

  // 从家庭积分池分配积分给儿童
  const allocatePointsFromPool = (childId, points, reason = '积分分配') => {
    if (points <= 0) return false
    if (familyPointsPool.value < points) {
      uni.showToast({ title: '积分池余额不足', icon: 'none' })
      return false
    }

    // 从积分池扣除
    familyPointsPool.value -= points
    saveFamilyPointsPool()

    // 给儿童添加积分
    pointsStore.addBabyPoints(childId, points, reason)

    // 记录转账
    const record = {
      id: Date.now().toString(),
      fromType: 'pool',
      toChildId: childId,
      points,
      reason,
      createdAt: new Date().toISOString()
    }
    pointsTransferRecords.value.unshift(record)
    savePointsTransferRecords()

    refreshChildrenPoints()
    return true
  }

  // 儿童将积分存入积分池
  const depositPointsToPool = (childId, points, reason = '积分存入') => {
    if (points <= 0) return false
    const childPoints = pointsStore.getBabyPoints(childId)
    if (childPoints < points) {
      uni.showToast({ title: '积分不足', icon: 'none' })
      return false
    }

    // 扣除儿童积分
    pointsStore.deductBabyPoints(childId, points, reason)

    // 存入积分池
    familyPointsPool.value += points
    saveFamilyPointsPool()

    // 记录转账
    const record = {
      id: Date.now().toString(),
      fromChildId: childId,
      toType: 'pool',
      points,
      reason,
      createdAt: new Date().toISOString()
    }
    pointsTransferRecords.value.unshift(record)
    savePointsTransferRecords()

    refreshChildrenPoints()
    return true
  }

  // 儿童之间转账积分
  const transferPointsBetweenChildren = (fromChildId, toChildId, points, reason = '积分转账') => {
    if (points <= 0) return false
    if (fromChildId === toChildId) return false

    const fromPoints = pointsStore.getBabyPoints(fromChildId)
    if (fromPoints < points) {
      uni.showToast({ title: '积分不足', icon: 'none' })
      return false
    }

    // 扣除发送方积分
    pointsStore.deductBabyPoints(fromChildId, points, `转给${getChildName(toChildId)}`)
    // 给接收方添加积分
    pointsStore.addBabyPoints(toChildId, points, `收到${getChildName(fromChildId)}的转账`)

    // 记录转账
    const record = {
      id: Date.now().toString(),
      fromChildId,
      toChildId,
      points,
      reason,
      createdAt: new Date().toISOString()
    }
    pointsTransferRecords.value.unshift(record)
    savePointsTransferRecords()

    refreshChildrenPoints()
    return true
  }

  // 获取儿童名称
  const getChildName = (childId) => {
    const child = children.value.find(c => c.id === childId)
    return child ? child.name : '未知'
  }

  // 向积分池添加积分（家长奖励）
  const addPointsToPool = (points, reason = '家长奖励') => {
    if (points <= 0) return false
    familyPointsPool.value += points
    saveFamilyPointsPool()

    // 记录
    const record = {
      id: Date.now().toString(),
      fromType: 'parent_reward',
      toType: 'pool',
      points,
      reason,
      createdAt: new Date().toISOString()
    }
    pointsTransferRecords.value.unshift(record)
    savePointsTransferRecords()

    return true
  }

  // ========== 兄弟姐妹竞赛 ==========

  // 加载兄弟姐妹竞赛
  const loadSiblingCompetitions = () => {
    try {
      const stored = uni.getStorageSync(SIBLING_COMPETITIONS_KEY)
      siblingCompetitions.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('加载兄弟姐妹竞赛失败:', e)
      siblingCompetitions.value = []
    }
  }

  // 保存兄弟姐妹竞赛
  const saveSiblingCompetitions = () => {
    uni.setStorageSync(SIBLING_COMPETITIONS_KEY, JSON.stringify(siblingCompetitions.value))
  }

  // 创建竞赛
  const createCompetition = (title, taskType, participantIds, duration = 7) => {
    const competition = {
      id: 'comp_' + Date.now(),
      title,
      taskType,
      participantIds,
      duration, // 持续天数
      status: 'ongoing', // ongoing, finished
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
      results: [], // { childId, score, rank }
      createdAt: new Date().toISOString()
    }
    siblingCompetitions.value.unshift(competition)
    saveSiblingCompetitions()
    return competition
  }

  // 更新竞赛结果
  const updateCompetitionResult = (competitionId, childId, score) => {
    const competition = siblingCompetitions.value.find(c => c.id === competitionId)
    if (!competition) return false

    const existingResult = competition.results.find(r => r.childId === childId)
    if (existingResult) {
      existingResult.score = score
    } else {
      competition.results.push({ childId, score, rank: 0 })
    }

    // 重新排序
    competition.results.sort((a, b) => b.score - a.score)
    competition.results.forEach((r, i) => r.rank = i + 1)

    saveSiblingCompetitions()
    return true
  }

  // 结束竞赛
  const finishCompetition = (competitionId) => {
    const competition = siblingCompetitions.value.find(c => c.id === competitionId)
    if (!competition) return false

    competition.status = 'finished'

    // 给获胜者奖励
    if (competition.results.length > 0) {
      const winner = competition.results[0]
      const bonus = 50 // 获胜奖励积分
      pointsStore.addBabyPoints(winner.childId, bonus, `竞赛获胜奖励: ${competition.title}`)
    }

    saveSiblingCompetitions()
    refreshChildrenPoints()
    return true
  }

  // 获取进行中的竞赛
  const getOngoingCompetitions = () => {
    return siblingCompetitions.value.filter(c => c.status === 'ongoing')
  }

  // 获取儿童的竞赛历史
  const getChildCompetitionHistory = (childId) => {
    return siblingCompetitions.value.filter(c =>
      c.participantIds.includes(childId)
    )
  }

  // 获取儿童的竞赛胜率
  const getChildWinRate = (childId) => {
    const history = getChildCompetitionHistory(childId)
    if (history.length === 0) return 0

    const wins = history.filter(c => {
      const winner = c.results.find(r => r.rank === 1)
      return winner && winner.childId === childId
    }).length

    return Math.round((wins / history.length) * 100)
  }

  // ========== 互助奖励 ==========

  // 记录互助行为
  const recordHelpAction = (helperChildId, helpedChildId, points, taskName) => {
    if (points <= 0) return false
    if (helperChildId === helpedChildId) return false

    // 给帮助者奖励
    const bonusPoints = Math.ceil(points * 0.2) // 20% bonus
    pointsStore.addBabyPoints(helperChildId, bonusPoints, `帮助兄弟姐妹: ${taskName}`)

    // 记录到转账记录
    const record = {
      id: Date.now().toString(),
      fromChildId: helperChildId,
      toChildId: helpedChildId,
      points: bonusPoints,
      reason: `互助奖励: ${taskName}`,
      type: 'help_bonus',
      createdAt: new Date().toISOString()
    }
    pointsTransferRecords.value.unshift(record)
    savePointsTransferRecords()

    refreshChildrenPoints()
    return true
  }

  // ========== 家庭成就对比 ==========

  // 获取家庭能力雷达图数据
  const getFamilyRadarData = () => {
    const skills = ['学习', '运动', '艺术', '社交', '自理']
    const data = {}

    children.value.forEach(child => {
      // 模拟能力数据（实际应从技能树等获取）
      data[child.id] = {
        name: child.name,
        values: [
          Math.floor(Math.random() * 40) + 60, // 学习 60-100
          Math.floor(Math.random() * 40) + 60, // 运动
          Math.floor(Math.random() * 40) + 60, // 艺术
          Math.floor(Math.random() * 40) + 60, // 社交
          Math.floor(Math.random() * 40) + 60  // 自理
        ]
      }
    })

    return { skills, data }
  }

  // 获取家庭里程碑对比
  const getFamilyMilestoneComparison = () => {
    const milestones = [
      { id: 'first_task', name: '完成首个任务', icon: '🎯' },
      { id: 'week_streak', name: '连续7天', icon: '🔥' },
      { id: 'points_100', name: '获得100积分', icon: '⭐' },
      { id: 'points_500', name: '获得500积分', icon: '🌟' },
      { id: 'competition_win', name: '赢得竞赛', icon: '🏆' }
    ]

    const comparison = {}
    children.value.forEach(child => {
      comparison[child.id] = {
        name: child.name,
        achievements: [],
        totalPoints: pointsStore.getBabyPoints(child.id)
      }

      // 检查各里程碑
      milestones.forEach(m => {
        let achieved = false
        switch (m.id) {
          case 'first_task':
            achieved = true // 假设都有
            break
          case 'week_streak':
            achieved = child.points >= 70
            break
          case 'points_100':
            achieved = comparison[child.id].totalPoints >= 100
            break
          case 'points_500':
            achieved = comparison[child.id].totalPoints >= 500
            break
          case 'competition_win':
            achieved = getChildWinRate(child.id) > 0
            break
        }
        if (achieved) {
          comparison[child.id].achievements.push(m.id)
        }
      })
    })

    return { milestones, comparison }
  }

  // 生成对比报告
  const generateComparisonReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      childrenSummary: children.value.map(child => ({
        id: child.id,
        name: child.name,
        points: pointsStore.getBabyPoints(child.id),
        rank: child.rank,
        competitionsJoined: getChildCompetitionHistory(child.id).length,
        competitionsWon: getChildCompetitionHistory(child.id).filter(c => {
          const winner = c.results.find(r => r.rank === 1)
          return winner && winner.childId === child.id
        }).length,
        winRate: getChildWinRate(child.id)
      })),
      familyTotalPoints: familyPointsPool.value + Object.values(childrenPointsMap.value).reduce((a, b) => a + b, 0),
      poolBalance: familyPointsPool.value
    }
    return report
  }

  // 监听积分变化事件
  uni.$on('pointsUpdated', () => {
    refreshChildrenPoints()
  })

  uni.$on('babyPointsUpdated', () => {
    refreshChildrenPoints()
  })

  return {
    // 状态
    children,
    selectedChildId,
    familyPointsPool,
    pointsTransferRecords,
    siblingCompetitions,
    familyAchievements,

    // 计算属性
    selectedChild,
    childrenRanking,
    childrenPointsMap,

    // 方法
    init,
    loadChildren,
    selectChild,
    getChildPoints,
    refreshChildrenPoints,
    getChildName,

    // 积分池
    loadFamilyPointsPool,
    allocatePointsFromPool,
    depositPointsToPool,
    transferPointsBetweenChildren,
    addPointsToPool,

    // 竞赛
    loadSiblingCompetitions,
    createCompetition,
    updateCompetitionResult,
    finishCompetition,
    getOngoingCompetitions,
    getChildCompetitionHistory,
    getChildWinRate,

    // 互助
    recordHelpAction,

    // 对比
    getFamilyRadarData,
    getFamilyMilestoneComparison,
    generateComparisonReport
  }
})

export default useFamilyStore
