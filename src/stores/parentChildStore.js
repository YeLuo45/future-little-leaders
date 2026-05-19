/**
 * V86 Parent-Child Challenge Store
 * 亲子挑战系统：亲子组队、协作任务、家庭竞赛、亲子羁绊值
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import { usePointsStore } from './pointsStore.js'

const STORAGE_KEYS = {
  TEAMS: 'parent_child_teams',
  TASKS: 'parent_child_tasks',
  BATTLES: 'parent_child_battles',
  BOND_RECORDS: 'parent_child_bond_records',
  BATTLE_RANKS: 'parent_child_battle_ranks'
}

export const useParentChildStore = defineStore('parentChild', () => {
  const babyStore = useBabyStore()
  const pointsStore = usePointsStore()

  // ========== 状态 ==========
  const teams = ref([])                    // 亲子组队列表
  const collaborativeTasks = ref([])       // 协作任务列表
  const familyBattles = ref([])             // 家庭竞赛列表
  const bondRecords = ref([])               // 羁绊值记录
  const battleRankings = ref([])            // 战斗排行榜

  // ========== 计算属性 ==========

  // 当前宝宝参与的队伍
  const myTeams = computed(() => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return []
    return teams.value.filter(t => t.memberIds.includes(babyId))
  })

  // 当前宝宝参与的进行中任务
  const myActiveTasks = computed(() => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return []
    return collaborativeTasks.value.filter(
      t => t.teamId && t.status === 'active'
    )
  })

  // 进行中的家庭竞赛
  const activeBattles = computed(() => {
    const now = new Date().toISOString()
    return familyBattles.value.filter(b => b.status === 'active' && b.endTime > now)
  })

  // 获取当前宝宝的羁绊值（与每个家庭成员的）
  const myBondValues = computed(() => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return {}

    const bonds = {}
    const allBabyIds = babyStore.babies.map(b => b.id)

    allBabyIds.forEach(otherId => {
      if (otherId === babyId) return
      const record = bondRecords.value.find(
        r => (r.babyIdA === babyId && r.babyIdB === otherId) ||
             (r.babyIdA === otherId && r.babyIdB === babyId)
      )
      bonds[otherId] = record ? record.bondValue : 0
    })

    return bonds
  })

  // 我的总羁绊值
  const myTotalBond = computed(() => {
    return Object.values(myBondValues.value).reduce((sum, val) => sum + val, 0)
  })

  // ========== 初始化 ==========
  const init = () => {
    loadTeams()
    loadTasks()
    loadBattles()
    loadBondRecords()
    loadBattleRankings()
  }

  // ========== 亲子组队 ==========
  const loadTeams = () => {
    try {
      const stored = uni.getStorageSync(STORAGE_KEYS.TEAMS)
      teams.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('加载亲子组队失败:', e)
      teams.value = []
    }
  }

  const saveTeams = () => {
    uni.setStorageSync(STORAGE_KEYS.TEAMS, JSON.stringify(teams.value))
  }

  // 创建亲子队伍
  const createTeam = (name, parentId, childId, description = '') => {
    if (!parentId || !childId) return null
    if (parentId === childId) return null

    const team = {
      id: 'team_' + Date.now(),
      name,
      description,
      parentId,
      childId,
      memberIds: [parentId, childId],
      status: 'active',
      createdAt: new Date().toISOString(),
      taskCount: 0,
      completedTaskCount: 0,
      totalBondEarned: 0
    }

    teams.value.push(team)
    saveTeams()
    return team
  }

  // 解散队伍
  const dissolveTeam = (teamId) => {
    const index = teams.value.findIndex(t => t.id === teamId)
    if (index !== -1) {
      teams.value.splice(index, 1)
      saveTeams()
      return true
    }
    return false
  }

  // 获取宝宝的队伍
  const getTeamForBaby = (babyId) => {
    return teams.value.find(t => t.memberIds.includes(babyId))
  }

  // 获取队伍成员信息
  const getTeamMembers = (teamId) => {
    const team = teams.value.find(t => t.id === teamId)
    if (!team) return []

    return team.memberIds.map(id => {
      const baby = babyStore.babies.find(b => b.id === id)
      return baby ? { id: baby.id, name: baby.name, avatar: baby.avatar } : null
    }).filter(Boolean)
  }

  // ========== 协作任务 ==========
  const loadTasks = () => {
    try {
      const stored = uni.getStorageSync(STORAGE_KEYS.TASKS)
      collaborativeTasks.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('加载协作任务失败:', e)
      collaborativeTasks.value = []
    }
  }

  const saveTasks = () => {
    uni.setStorageSync(STORAGE_KEYS.TASKS, JSON.stringify(collaborativeTasks.value))
  }

  // 任务模板
  const taskTemplates = [
    { title: '一起阅读绘本30分钟', category: 'reading', bondGain: 10, points: 20 },
    { title: '完成亲子厨房小任务', category: 'cooking', bondGain: 15, points: 30 },
    { title: '户外运动30分钟', category: 'sports', bondGain: 12, points: 25 },
    { title: '共同完成手工制作', category: 'art', bondGain: 15, points: 30 },
    { title: '亲子绘画时光', category: 'art', bondGain: 10, points: 20 },
    { title: '一起做家务', category: 'life', bondGain: 8, points: 15 },
    { title: '亲子游戏时间', category: 'game', bondGain: 10, points: 20 },
    { title: '睡前故事时光', category: 'reading', bondGain: 12, points: 25 },
    { title: '亲子运动挑战', category: 'sports', bondGain: 15, points: 30 },
    { title: '一起观看教育视频', category: 'learning', bondGain: 8, points: 15 }
  ]

  // 创建协作任务
  const createTask = (teamId, title, category, targetValue, duration = 7) => {
    const team = teams.value.find(t => t.id === teamId)
    if (!team) return null

    const now = new Date()
    const task = {
      id: 'task_' + Date.now(),
      teamId,
      title,
      category,
      targetValue: parseInt(targetValue),
      currentProgress: 0,
      contributions: {}, // { babyId: contributedValue }
      status: 'active',
      startTime: now.toISOString(),
      endTime: new Date(now.getTime() + duration * 24 * 60 * 60 * 1000).toISOString(),
      bondReward: 10,
      pointsReward: 20,
      createdAt: now.toISOString()
    }

    // 初始化每个成员的贡献
    team.memberIds.forEach(id => {
      task.contributions[id] = 0
    })

    collaborativeTasks.value.push(task)
    team.taskCount++
    saveTasks()
    saveTeams()

    return task
  }

  // 从模板创建协作任务
  const createTaskFromTemplate = (teamId, templateIndex, duration = 7) => {
    const template = taskTemplates[templateIndex]
    if (!template) return null

    return createTask(teamId, template.title, template.category, 1, duration)
  }

  // 成员贡献进度
  const contributeToTask = (taskId, babyId, value = 1) => {
    const task = collaborativeTasks.value.find(t => t.id === taskId)
    if (!task || task.status !== 'active') return false

    if (!task.contributions[babyId]) {
      task.contributions[babyId] = 0
    }
    task.contributions[babyId] += value
    task.currentProgress = Object.values(task.contributions).reduce((a, b) => a + b, 0)

    // 检查是否完成
    if (task.currentProgress >= task.targetValue) {
      completeTask(taskId)
    }

    saveTasks()
    return true
  }

  // 完成协作任务
  const completeTask = (taskId) => {
    const task = collaborativeTasks.value.find(t => t.id === taskId)
    if (!task) return null

    task.status = 'completed'
    task.completedAt = new Date().toISOString()

    const team = teams.value.find(t => t.id === task.teamId)
    if (team) {
      team.completedTaskCount++
      team.totalBondEarned += task.bondReward

      // 给每个成员发放奖励
      team.memberIds.forEach(memberId => {
        pointsStore.addBabyPoints(memberId, task.pointsReward, `协作任务完成: ${task.title}`)

        // 增加羁绊值
        team.memberIds.forEach(otherId => {
          if (memberId !== otherId) {
            addBondValue(memberId, otherId, task.bondReward)
          }
        })
      })
    }

    saveTasks()
    saveTeams()
    return task
  }

  // 获取任务的成员进度
  const getTaskMemberProgress = (taskId, babyId) => {
    const task = collaborativeTasks.value.find(t => t.id === taskId)
    if (!task) return 0
    return task.contributions[babyId] || 0
  }

  // 获取队伍的所有任务
  const getTeamTasks = (teamId) => {
    return collaborativeTasks.value.filter(t => t.teamId === teamId)
  }

  // ========== 家庭竞赛 ==========
  const loadBattles = () => {
    try {
      const stored = uni.getStorageSync(STORAGE_KEYS.BATTLES)
      familyBattles.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('加载家庭竞赛失败:', e)
      familyBattles.value = []
    }
  }

  const saveBattles = () => {
    uni.setStorageSync(STORAGE_KEYS.BATTLES, JSON.stringify(familyBattles.value))
  }

  // 创建家庭竞赛
  const createBattle = (title, participantIds, duration = 7, category = 'points') => {
    const now = new Date()
    const battle = {
      id: 'battle_' + Date.now(),
      title,
      category, // 'points' | 'tasks' | 'bond'
      participantIds,
      scores: {}, // { babyId: score }
      status: 'active',
      startTime: now.toISOString(),
      endTime: new Date(now.getTime() + duration * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now.toISOString()
    }

    participantIds.forEach(id => {
      battle.scores[id] = 0
    })

    familyBattles.value.push(battle)
    saveBattles()
    return battle
  }

  // 更新竞赛分数
  const updateBattleScore = (battleId, babyId, increment) => {
    const battle = familyBattles.value.find(b => b.id === battleId)
    if (!battle || battle.status !== 'active') return false

    if (!battle.scores[babyId]) {
      battle.scores[babyId] = 0
    }
    battle.scores[babyId] += increment
    saveBattles()
    return true
  }

  // 结束竞赛并计算排名
  const finishBattle = (battleId) => {
    const battle = familyBattles.value.find(b => b.id === battleId)
    if (!battle) return null

    battle.status = 'finished'

    // 计算排名
    const sortedParticipants = Object.entries(battle.scores)
      .map(([babyId, score]) => ({ babyId, score }))
      .sort((a, b) => b.score - a.score)

    // 发放奖励
    const rewards = [100, 60, 30] // 前三名奖励
    sortedParticipants.forEach((p, index) => {
      if (index < 3) {
        pointsStore.addBabyPoints(p.babyId, rewards[index], `家庭竞赛奖励: ${battle.title}`)
      }
      updateBattleRanking(p.babyId, p.score)
    })

    saveBattles()
    return { ...battle, rankings: sortedParticipants }
  }

  // 获取宝宝的竞赛排名
  const getBattleRank = (battleId, babyId) => {
    const battle = familyBattles.value.find(b => b.id === battleId)
    if (!battle) return 0

    const sorted = Object.entries(battle.scores)
      .map(([id, score]) => ({ babyId: id, score }))
      .sort((a, b) => b.score - a.score)

    const index = sorted.findIndex(p => p.babyId === babyId)
    return index !== -1 ? index + 1 : 0
  }

  // ========== 羁绊值系统 ==========
  const loadBondRecords = () => {
    try {
      const stored = uni.getStorageSync(STORAGE_KEYS.BOND_RECORDS)
      bondRecords.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('加载羁绊值记录失败:', e)
      bondRecords.value = []
    }
  }

  const saveBondRecords = () => {
    uni.setStorageSync(STORAGE_KEYS.BOND_RECORDS, JSON.stringify(bondRecords.value))
  }

  // 增加羁绊值
  const addBondValue = (babyIdA, babyIdB, value) => {
    if (babyIdA === babyIdB) return

    let record = bondRecords.value.find(
      r => (r.babyIdA === babyIdA && r.babyIdB === babyIdB) ||
           (r.babyIdA === babyIdB && r.babyIdB === babyIdA)
    )

    if (record) {
      record.bondValue += value
      record.lastUpdated = new Date().toISOString()
      record.interactionCount++
    } else {
      record = {
        id: 'bond_' + Date.now(),
        babyIdA,
        babyIdB,
        bondValue: value,
        interactionCount: 1,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
      bondRecords.value.push(record)
    }

    saveBondRecords()
    return record
  }

  // 获取两个宝宝之间的羁绊值
  const getBondBetween = (babyIdA, babyIdB) => {
    const record = bondRecords.value.find(
      r => (r.babyIdA === babyIdA && r.babyIdB === babyIdB) ||
           (r.babyIdA === babyIdB && r.babyIdB === babyIdA)
    )
    return record ? record.bondValue : 0
  }

  // 羁绊等级
  const getBondLevel = (bondValue) => {
    if (bondValue >= 500) return { level: 5, name: '灵魂伴侣', nextThreshold: null }
    if (bondValue >= 300) return { level: 4, name: '心有灵犀', nextThreshold: 500 }
    if (bondValue >= 150) return { level: 3, name: '默契满分', nextThreshold: 300 }
    if (bondValue >= 50) return { level: 2, name: '情投意合', nextThreshold: 150 }
    return { level: 1, name: '初次相识', nextThreshold: 50 }
  }

  // 获取我的羁绊等级
  const myBondLevel = computed(() => {
    return getBondLevel(myTotalBond.value)
  })

  // ========== 战斗排行榜 ==========
  const loadBattleRankings = () => {
    try {
      const stored = uni.getStorageSync(STORAGE_KEYS.BATTLE_RANKS)
      battleRankings.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('加载战斗排行榜失败:', e)
      battleRankings.value = []
    }
  }

  const saveBattleRankings = () => {
    uni.setStorageSync(STORAGE_KEYS.BATTLE_RANKS, JSON.stringify(battleRankings.value))
  }

  // 更新战斗排名
  const updateBattleRanking = (babyId, score) => {
    const existing = battleRankings.value.find(r => r.babyId === babyId)
    if (existing) {
      existing.totalScore += score
      existing.battleCount++
      existing.lastUpdated = new Date().toISOString()
    } else {
      battleRankings.value.push({
        babyId,
        totalScore: score,
        battleCount: 1,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      })
    }

    // 保持排序
    battleRankings.value.sort((a, b) => b.totalScore - a.totalScore)
    saveBattleRankings()
  }

  // 获取排行榜
  const getBattleLeaderboard = () => {
    return battleRankings.value.map((rank, index) => {
      const baby = babyStore.babies.find(b => b.id === rank.babyId)
      return {
        ...rank,
        rank: index + 1,
        name: baby ? baby.name : '未知',
        avatar: baby ? baby.avatar : ''
      }
    })
  }

  // ========== 成就奖励 ==========
  const checkBondAchievements = (babyId) => {
    const achievements = []
    const babyIdOther = babyStore.babies.find(b => b.id !== babyId)?.id

    if (!babyIdOther) return achievements

    const bondValue = getBondBetween(babyId, babyIdOther)

    if (bondValue >= 50) {
      achievements.push({ id: 'bond_50', name: '初次羁绊', reward: 20 })
    }
    if (bondValue >= 150) {
      achievements.push({ id: 'bond_150', name: '默契搭档', reward: 50 })
    }
    if (bondValue >= 300) {
      achievements.push({ id: 'bond_300', name: '心有灵犀', reward: 100 })
    }
    if (bondValue >= 500) {
      achievements.push({ id: 'bond_500', name: '灵魂伴侣', reward: 200 })
    }

    return achievements
  }

  // ========== 互动统计 ==========
  const getInteractionStats = (babyId) => {
    const myTasks = collaborativeTasks.value.filter(t =>
      t.teamId && t.memberIds.includes(babyId)
    )

    const completedCount = myTasks.filter(t => t.status === 'completed').length
    const totalBondFromTasks = myTasks
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.bondReward, 0)

    return {
      totalTasks: myTasks.length,
      completedTasks: completedCount,
      totalBondEarned: totalBondFromTasks,
      participationRate: myTasks.length > 0
        ? Math.round((completedCount / myTasks.length) * 100)
        : 0
    }
  }

  // ========== 清理过期数据 ==========
  const cleanupExpiredData = () => {
    const now = new Date().toISOString()

    // 清理过期的任务
    collaborativeTasks.value = collaborativeTasks.value.filter(t =>
      t.status === 'active' || new Date(t.endTime) > now
    )

    // 清理过期的竞赛
    familyBattles.value = familyBattles.value.filter(b =>
      b.status === 'active' || new Date(b.endTime) > now
    )

    saveTasks()
    saveBattles()
  }

  return {
    // 状态
    teams,
    collaborativeTasks,
    familyBattles,
    bondRecords,
    battleRankings,

    // 计算属性
    myTeams,
    myActiveTasks,
    activeBattles,
    myBondValues,
    myTotalBond,
    myBondLevel,

    // 方法
    init,
    // 亲子组队
    createTeam,
    dissolveTeam,
    getTeamForBaby,
    getTeamMembers,
    // 协作任务
    createTask,
    createTaskFromTemplate,
    contributeToTask,
    completeTask,
    getTaskMemberProgress,
    getTeamTasks,
    // 家庭竞赛
    createBattle,
    updateBattleScore,
    finishBattle,
    getBattleRank,
    // 羁绊值
    addBondValue,
    getBondBetween,
    getBondLevel,
    checkBondAchievements,
    // 互动统计
    getInteractionStats,
    // 排行榜
    getBattleLeaderboard,
    // 清理
    cleanupExpiredData
  }
})
