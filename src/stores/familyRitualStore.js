/**
 * V35 Family Ritual Store
 * 家庭仪式系统：每日 ritual、每周挑战、回忆存档、家庭任务
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import { usePointsStore } from './pointsStore.js'

const RITUALS_KEY = 'family_daily_rituals'
const CHALLENGES_KEY = 'family_weekly_challenges'
const MEMORIES_KEY = 'family_memories'
const MISSIONS_KEY = 'family_missions'

export const useFamilyRitualStore = defineStore('familyRitual', () => {
  const babyStore = useBabyStore()
  const pointsStore = usePointsStore()

  // ========== 状态 ==========
  const dailyRituals = ref([])           // 每日仪式列表
  const weeklyChallenges = ref([])        // 每周挑战列表
  const memories = ref([])               // 回忆存档
  const familyMissions = ref([])          // 家庭任务

  // ========== 计算属性 ==========
  
  // 今日 ritual 打卡情况
  const todayRituals = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return dailyRituals.value.map(ritual => {
      const todayLog = ritual.logs?.find(log => log.date === today)
      return {
        ...ritual,
        completed: !!todayLog,
        completedMembers: todayLog?.completedBy || []
      }
    })
  })

  // 进行中的挑战
  const activeChallenges = computed(() => {
    const now = new Date().toISOString()
    return weeklyChallenges.value.filter(c => 
      c.status === 'active' && c.endTime > now
    )
  })

  // 进行中的家庭任务
  const activeMissions = computed(() => {
    return familyMissions.value.filter(m => m.status === 'active')
  })

  // 回忆时间线（按时间倒序）
  const memoryTimeline = computed(() => {
    return [...memories.value].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  })

  // ========== 初始化 ==========
  const init = () => {
    loadRituals()
    loadChallenges()
    loadMemories()
    loadMissions()
  }

  // ========== 每日仪式 ==========
  const loadRituals = () => {
    try {
      const stored = uni.getStorageSync(RITUALS_KEY)
      dailyRituals.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('加载每日仪式失败:', e)
      dailyRituals.value = []
    }
  }

  const saveRituals = () => {
    uni.setStorageSync(RITUALS_KEY, JSON.stringify(dailyRituals.value))
  }

  // 创建每日仪式
  const createRitual = (name, time, template, description = '') => {
    const ritual = {
      id: 'ritual_' + Date.now(),
      name,
      time,
      template, // 'breakfast_story' | 'bedtime_review' | 'custom'
      description,
      status: 'active',
      createdAt: new Date().toISOString(),
      logs: [] // { date, completedBy: [childId,...] }
    }
    dailyRituals.value.push(ritual)
    saveRituals()
    return ritual
  }

  // 打卡每日仪式
  const checkInRitual = (ritualId, childId) => {
    const ritual = dailyRituals.value.find(r => r.id === ritualId)
    if (!ritual) return false

    const today = new Date().toISOString().split('T')[0]
    if (!ritual.logs) ritual.logs = []

    let todayLog = ritual.logs.find(log => log.date === today)
    if (!todayLog) {
      todayLog = { date: today, completedBy: [] }
      ritual.logs.push(todayLog)
    }

    if (!todayLog.completedBy.includes(childId)) {
      todayLog.completedBy.push(childId)
      
      // 全员完成奖励
      const allChildren = babyStore.babies
      if (todayLog.completedBy.length === allChildren.length && allChildren.length > 1) {
        const bonusPoints = 10 * allChildren.length
        allChildren.forEach(child => {
          pointsStore.addBabyPoints(child.id, bonusPoints, `家庭仪式全员奖励: ${ritual.name}`)
        })
      }

      saveRituals()
      return true
    }
    return false
  }

  // 获取仪式连续打卡天数
  const getRitualStreak = (ritualId) => {
    const ritual = dailyRituals.value.find(r => r.id === ritualId)
    if (!ritual || !ritual.logs || ritual.logs.length === 0) return 0

    const sortedLogs = [...ritual.logs].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )

    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].date)
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)
      
      if (logDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  // ========== 每周挑战 ==========
  const loadChallenges = () => {
    try {
      const stored = uni.getStorageSync(CHALLENGES_KEY)
      weeklyChallenges.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('加载每周挑战失败:', e)
      weeklyChallenges.value = []
    }
  }

  const saveChallenges = () => {
    uni.setStorageSync(CHALLENGES_KEY, JSON.stringify(weeklyChallenges.value))
  }

  // 创建每周挑战
  const createChallenge = (title, category, targetValue, participantIds, duration = 7) => {
    const now = new Date()
    const challenge = {
      id: 'challenge_' + Date.now(),
      title,
      category, // 'sports' | 'reading' | 'cooking' | 'other'
      targetValue: parseInt(targetValue),
      participantIds, // [childId,...]
      progress: {}, // { childId: currentValue }
      status: 'active',
      startTime: now.toISOString(),
      endTime: new Date(now.getTime() + duration * 24 * 60 * 60 * 1000).toISOString(),
      multiplierActive: false, // 全员参与时积分倍增
      createdAt: now.toISOString()
    }
    
    // 初始化进度
    participantIds.forEach(id => {
      challenge.progress[id] = 0
    })

    weeklyChallenges.value.push(challenge)
    saveChallenges()
    return challenge
  }

  // 更新挑战进度
  const updateChallengeProgress = (challengeId, childId, increment = 1) => {
    const challenge = weeklyChallenges.value.find(c => c.id === challengeId)
    if (!challenge || challenge.status !== 'active') return false

    if (!challenge.progress[childId]) {
      challenge.progress[childId] = 0
    }
    challenge.progress[childId] += increment

    // 检查是否全员参与（积分倍增激活）
    const allParticipantsJoined = challenge.participantIds.every(
      id => challenge.progress[id] > 0
    )
    challenge.multiplierActive = allParticipantsJoined

    saveChallenges()
    return true
  }

  // 完成挑战
  const completeChallenge = (challengeId) => {
    const challenge = weeklyChallenges.value.find(c => c.id === challengeId)
    if (!challenge) return null

    challenge.status = 'finished'
    
    // 计算排名和奖励
    const results = Object.entries(challenge.progress)
      .map(([childId, score]) => ({ childId, score }))
      .sort((a, b) => b.score - a.score)

    // 基础奖励 + 全员倍增奖励
    results.forEach((result, index) => {
      const basePoints = (3 - index) * 20 // 1st: 60, 2nd: 40, 3rd: 20
      const bonus = challenge.multiplierActive ? basePoints : Math.floor(basePoints / 2)
      pointsStore.addBabyPoints(result.childId, bonus, `每周挑战完成: ${challenge.title}`)
    })

    saveChallenges()
    return { ...challenge, results }
  }

  // 获取挑战进度百分比
  const getChallengeProgressPercent = (challengeId, childId) => {
    const challenge = weeklyChallenges.value.find(c => c.id === challengeId)
    if (!challenge) return 0
    const current = challenge.progress[childId] || 0
    return Math.min(100, Math.round((current / challenge.targetValue) * 100))
  }

  // ========== 回忆存档 ==========
  const loadMemories = () => {
    try {
      const stored = uni.getStorageSync(MEMORIES_KEY)
      memories.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('加载回忆存档失败:', e)
      memories.value = []
    }
  }

  const saveMemories = () => {
    uni.setStorageSync(MEMORIES_KEY, JSON.stringify(memories.value))
  }

  // 添加回忆
  const addMemory = (title, type, content, tags = [], metadata = {}) => {
    const memory = {
      id: 'memory_' + Date.now(),
      title,
      type, // 'photo' | 'video' | 'text'
      content, // URL or text
      tags,
      metadata, // { location, event, ... }
      status: 'active',
      aiDescription: generateMemoryDescription(title, type, tags),
      createdAt: new Date().toISOString()
    }
    memories.value.unshift(memory)
    saveMemories()
    return memory
  }

  // AI 生成回忆描述（模拟）
  const generateMemoryDescription = (title, type, tags) => {
    const typeLabel = type === 'photo' ? '照片' : type === 'video' ? '视频' : '文字'
    const tagLabel = tags.length > 0 ? `关于${tags.join('、')}` : '珍贵时刻'
    return `这是一段美好的家庭${typeLabel}，${tagLabel}。${title}`
  }

  // 删除回忆
  const deleteMemory = (memoryId) => {
    const index = memories.value.findIndex(m => m.id === memoryId)
    if (index !== -1) {
      memories.value.splice(index, 1)
      saveMemories()
      return true
    }
    return false
  }

  // 按标签筛选回忆
  const getMemoriesByTag = (tag) => {
    return memories.value.filter(m => m.tags.includes(tag))
  }

  // ========== 家庭任务 ==========
  const loadMissions = () => {
    try {
      const stored = uni.getStorageSync(MISSIONS_KEY)
      familyMissions.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('加载家庭任务失败:', e)
      familyMissions.value = []
    }
  }

  const saveMissions = () => {
    uni.setStorageSync(MISSIONS_KEY, JSON.stringify(familyMissions.value))
  }

  // 创建家庭任务
  const createMission = (title, description, targetValue, participantIds, category = 'general') => {
    const mission = {
      id: 'mission_' + Date.now(),
      title,
      description,
      category, // 'travel' | 'renovation' | 'collection' | 'general'
      targetValue: parseInt(targetValue),
      participantIds,
      progress: {}, // { childId: contributedValue }
      status: 'active',
      contributions: [], // { childId, value, date }
      celebrationShown: false,
      createdAt: new Date().toISOString()
    }

    participantIds.forEach(id => {
      mission.progress[id] = 0
    })

    familyMissions.value.push(mission)
    saveMissions()
    return mission
  }

  // 贡献进度
  const contributeToMission = (missionId, childId, value) => {
    const mission = familyMissions.value.find(m => m.id === missionId)
    if (!mission || mission.status !== 'active') return false

    if (!mission.progress[childId]) {
      mission.progress[childId] = 0
    }
    mission.progress[childId] += value

    mission.contributions.push({
      childId,
      value,
      date: new Date().toISOString()
    })

    // 检查是否完成
    const totalProgress = Object.values(mission.progress).reduce((a, b) => a + b, 0)
    if (totalProgress >= mission.targetValue) {
      mission.status = 'completed'
      mission.completedAt = new Date().toISOString()
    }

    saveMissions()
    return true
  }

  // 获取任务完成百分比
  const getMissionProgressPercent = (missionId) => {
    const mission = familyMissions.value.find(m => m.id === missionId)
    if (!mission) return 0
    const total = Object.values(mission.progress).reduce((a, b) => a + b, 0)
    return Math.min(100, Math.round((total / mission.targetValue) * 100))
  }

  // 完成庆祝
  const celebrateMission = (missionId) => {
    const mission = familyMissions.value.find(m => m.id === missionId)
    if (!mission || !mission.celebrationShown) return false
    
    mission.celebrationShown = true
    saveMissions()
    return true
  }

  return {
    // 状态
    dailyRituals,
    weeklyChallenges,
    memories,
    familyMissions,
    // 计算属性
    todayRituals,
    activeChallenges,
    activeMissions,
    memoryTimeline,
    // 方法
    init,
    // 每日仪式
    createRitual,
    checkInRitual,
    getRitualStreak,
    // 每周挑战
    createChallenge,
    updateChallengeProgress,
    completeChallenge,
    getChallengeProgressPercent,
    // 回忆存档
    addMemory,
    deleteMemory,
    getMemoriesByTag,
    // 家庭任务
    createMission,
    contributeToMission,
    getMissionProgressPercent,
    celebrateMission
  }
})
