/**
 * V35 Family Ritual Service
 * 家庭仪式系统服务层
 */

// Storage Keys
const RITUALS_KEY = 'family_daily_rituals'
const CHALLENGES_KEY = 'family_weekly_challenges'
const MEMORIES_KEY = 'family_memories'
const MISSIONS_KEY = 'family_missions'

// ========== 每日仪式服务 ==========

export const getDailyRituals = () => {
  try {
    const stored = uni.getStorageSync(RITUALS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取每日仪式失败:', e)
    return []
  }
}

export const saveDailyRituals = (rituals) => {
  uni.setStorageSync(RITUALS_KEY, JSON.stringify(rituals))
}

export const createRitualRecord = (ritual) => {
  const rituals = getDailyRituals()
  rituals.push({
    id: 'ritual_' + Date.now(),
    ...ritual,
    status: 'active',
    createdAt: new Date().toISOString(),
    logs: []
  })
  saveDailyRituals(rituals)
  return rituals
}

// ========== 每周挑战服务 ==========

export const getWeeklyChallenges = () => {
  try {
    const stored = uni.getStorageSync(CHALLENGES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取每周挑战失败:', e)
    return []
  }
}

export const saveWeeklyChallenges = (challenges) => {
  uni.setStorageSync(CHALLENGES_KEY, JSON.stringify(challenges))
}

export const createChallengeRecord = (challenge) => {
  const challenges = getWeeklyChallenges()
  challenges.push({
    id: 'challenge_' + Date.now(),
    ...challenge,
    status: 'active',
    createdAt: new Date().toISOString()
  })
  saveWeeklyChallenges(challenges)
  return challenges
}

export const getActiveChallenges = () => {
  const challenges = getWeeklyChallenges()
  const now = new Date().toISOString()
  return challenges.filter(c => c.status === 'active' && c.endTime > now)
}

// ========== 回忆存档服务 ==========

export const getMemories = () => {
  try {
    const stored = uni.getStorageSync(MEMORIES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取回忆存档失败:', e)
    return []
  }
}

export const saveMemories = (memories) => {
  uni.setStorageSync(MEMORIES_KEY, JSON.stringify(memories))
}

export const addMemoryRecord = (memory) => {
  const memories = getMemories()
  const newMemory = {
    id: 'memory_' + Date.now(),
    ...memory,
    aiDescription: generateAIRecall(memory),
    createdAt: new Date().toISOString()
  }
  memories.unshift(newMemory)
  saveMemories(memories)
  return newMemory
}

// AI 生成回忆描述
export const generateAIRecall = (memory) => {
  const { title, type, tags = [] } = memory
  const typeLabel = type === 'photo' ? '照片' : type === 'video' ? '视频' : '文字'
  const tagStr = tags.length > 0 ? `关于${tags.join('、')}` : '珍贵时刻'
  return `这是一段美好的家庭${typeLabel}，${tagStr}。${title}`
}

// ========== 家庭任务服务 ==========

export const getFamilyMissions = () => {
  try {
    const stored = uni.getStorageSync(MISSIONS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取家庭任务失败:', e)
    return []
  }
}

export const saveFamilyMissions = (missions) => {
  uni.setStorageSync(MISSIONS_KEY, JSON.stringify(missions))
}

export const createMissionRecord = (mission) => {
  const missions = getFamilyMissions()
  missions.push({
    id: 'mission_' + Date.now(),
    ...mission,
    status: 'active',
    contributions: [],
    createdAt: new Date().toISOString()
  })
  saveFamilyMissions(missions)
  return missions
}

export const getActiveMissions = () => {
  const missions = getFamilyMissions()
  return missions.filter(m => m.status === 'active')
}

// ========== 导出分享 ==========

export const exportMemoryAsText = (memory) => {
  const date = new Date(memory.createdAt).toLocaleDateString('zh-CN')
  let text = `📅 ${date}\n`
  text += `📝 ${memory.title}\n`
  text += `${memory.aiDescription}\n`
  if (memory.tags && memory.tags.length > 0) {
    text += `🏷️ ${memory.tags.join(', ')}\n`
  }
  return text
}

// ========== 模板数据 ==========

export const RITUAL_TEMPLATES = [
  { key: 'breakfast_story', name: '早餐故事', icon: '🌅', description: '每天早餐时分享一个故事或趣事' },
  { key: 'bedtime_review', name: '睡前复盘', icon: '🌙', description: '睡前回顾今天完成的事情' },
  { key: 'gratitude_share', name: '感恩分享', icon: '💝', description: '分享今天最感恩的一件事' },
  { key: 'exercise_together', name: '一起运动', icon: '🏃', description: '全家一起进行体育锻炼' },
  { key: 'reading_time', name: '阅读时光', icon: '📚', description: '每天固定阅读时间' },
  { key: 'custom', name: '自定义', icon: '✨', description: '创建你自己的家庭仪式' }
]

export const CHALLENGE_CATEGORIES = [
  { key: 'sports', name: '运动挑战', icon: '🏃', examples: ['每天跑步', '跳绳', '游泳'] },
  { key: 'reading', name: '阅读挑战', icon: '📖', examples: ['读书时长', '阅读页数', '读书分享'] },
  { key: 'cooking', name: '烹饪挑战', icon: '🍳', examples: ['学做新菜', '帮厨', '准备早餐'] },
  { key: 'creative', name: '创意挑战', icon: '🎨', examples: ['画画', '手工', '写作'] },
  { key: 'other', name: '其他挑战', icon: '🌟', examples: ['其他自定义挑战'] }
]

export const MISSION_CATEGORIES = [
  { key: 'travel', name: '旅行计划', icon: '✈️' },
  { key: 'renovation', name: '装修改造', icon: '🏠' },
  { key: 'collection', name: '收藏目标', icon: '🏆' },
  { key: 'general', name: '共同目标', icon: '🎯' }
]
