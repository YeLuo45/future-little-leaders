/**
 * V88 Character Quest Service
 * 品格修炼服务 - 品德修炼任务、品格等级、修炼日记、品格证书
 */

import { useBabyStore } from '@/stores/babyStore.js'

// ==================== 常量定义 ====================

// 品格类型
export const CHARACTER_TYPES = {
  HONESTY: 'honesty',      // 诚实
  KINDNESS: 'kindness',    // 善良
  COURAGE: 'courage',      // 勇敢
  GRATITUDE: 'gratitude'   // 感恩
}

// 品格emoji和颜色
export const CHARACTER_INFO = {
  [CHARACTER_TYPES.HONESTY]: {
    label: '诚实',
    emoji: '🤝',
    color: '#4A90D9',
    description: '说真话、守信用、不隐瞒'
  },
  [CHARACTER_TYPES.KINDNESS]: {
    label: '善良',
    emoji: '💖',
    color: '#E91E63',
    description: '帮助他人、关爱弱势群体'
  },
  [CHARACTER_TYPES.COURAGE]: {
    label: '勇敢',
    emoji: '🦁',
    color: '#FF9800',
    description: '面对困难不退缩、敢于担当'
  },
  [CHARACTER_TYPES.GRATITUDE]: {
    label: '感恩',
    emoji: '🌸',
    color: '#9C27B0',
    description: '感谢帮助过自己的人'
  }
}

// 等级定义
export const LEVELS = {
  L1: { level: 1, name: '品格萌芽', minExp: 0, maxExp: 100 },
  L2: { level: 2, name: '品格幼苗', minExp: 100, maxExp: 300 },
  L3: { level: 3, name: '品格小树', minExp: 300, maxExp: 600 },
  L4: { level: 4, name: '品格大树', minExp: 600, maxExp: 1000 },
  L5: { level: 5, name: '品格栋梁', minExp: 1000, maxExp: Infinity }
}

// 任务类型
export const QUEST_TYPES = {
  DAILY: 'daily',          // 日常任务
  WEEKLY: 'weekly',       // 周任务
  SPECIAL: 'special',     // 特殊任务
  CHALLENGE: 'challenge'  // 挑战任务
}

// 任务状态
export const QUEST_STATUS = {
  AVAILABLE: 'available', // 可领取
  IN_PROGRESS: 'in_progress', // 进行中
  COMPLETED: 'completed',   // 已完成
  EXPIRED: 'expired'         // 已过期
}

// ==================== 数据存储 ====================

let characterData = {
  levels: {},        // { babyId: { honesty: {exp, level}, kindness: {...}, ... } }
  quests: [],        // 所有任务
  questRecords: [],  // 任务记录
  journalEntries: [], // 日记记录
  certificates: []   // 证书
}

let initialized = false

// ==================== 初始化 ====================

const init = () => {
  if (initialized) return
  
  // 从本地存储加载数据
  const savedData = uni.getStorageSync('characterQuestData')
  if (savedData) {
    characterData = savedData
  }
  
  initialized = true
}

// 保存数据到本地存储
const saveData = () => {
  uni.setStorageSync('characterQuestData', characterData)
}

// ==================== 品格等级相关 ====================

/**
 * 获取品格等级信息
 */
const getCharacterLevel = (babyId, characterType) => {
  if (!characterData.levels[babyId]) {
    characterData.levels[babyId] = {}
  }
  if (!characterData.levels[babyId][characterType]) {
    characterData.levels[babyId][characterType] = {
      exp: 0,
      level: 1,
      totalExp: 0
    }
  }
  return characterData.levels[babyId][characterType]
}

/**
 * 获取所有品格等级
 */
const getAllCharacterLevels = (babyId) => {
  const result = {}
  Object.values(CHARACTER_TYPES).forEach(type => {
    result[type] = getCharacterLevel(babyId, type)
  })
  return result
}

/**
 * 增加经验值
 */
const addExp = (babyId, characterType, exp) => {
  const levelInfo = getCharacterLevel(babyId, characterType)
  levelInfo.exp += exp
  levelInfo.totalExp += exp
  
  // 检查升级
  const oldLevel = levelInfo.level
  for (const [key, level] of Object.entries(LEVELS)) {
    if (levelInfo.exp >= level.minExp && levelInfo.exp < level.maxExp) {
      levelInfo.level = level.level
      break
    }
  }
  
  saveData()
  
  return {
    leveledUp: levelInfo.level > oldLevel,
    newLevel: levelInfo.level,
    exp: levelInfo.exp
  }
}

/**
 * 计算升级进度百分比
 */
const getLevelProgress = (babyId, characterType) => {
  const levelInfo = getCharacterLevel(babyId, characterType)
  const currentLevelDef = Object.values(LEVELS).find(l => l.level === levelInfo.level)
  
  if (!currentLevelDef || currentLevelDef.maxExp === Infinity) {
    return 100
  }
  
  const expInLevel = levelInfo.exp - currentLevelDef.minExp
  const levelRange = currentLevelDef.maxExp - currentLevelDef.minExp
  return Math.round((expInLevel / levelRange) * 100)
}

/**
 * 获取总品格等级（综合等级）
 */
const getOverallLevel = (babyId) => {
  const allLevels = getAllCharacterLevels(babyId)
  const avgLevel = Object.values(allLevels).reduce((sum, l) => sum + l.level, 0) / 4
  return Math.floor(avgLevel) + 1
}

// ==================== 任务相关 ====================

/**
 * 获取每日任务
 */
const getDailyQuests = (babyId) => {
  const today = new Date().toISOString().split('T')[0]
  return characterData.quests.filter(q => 
    q.babyId === babyId && 
    q.type === QUEST_TYPES.DAILY && 
    q.date === today
  )
}

/**
 * 获取所有可用任务
 */
const getAvailableQuests = (babyId) => {
  const today = new Date().toISOString().split('T')[0]
  const quests = generateQuestsForBaby(babyId, today)
  
  // 合并已保存的任务状态
  return quests.map(q => {
    const saved = characterData.questRecords.find(r => r.questId === q.id && r.babyId === babyId)
    return {
      ...q,
      status: saved?.status || QUEST_STATUS.AVAILABLE,
      progress: saved?.progress || 0,
      recordId: saved?.id
    }
  })
}

/**
 * 为宝宝生成任务
 */
const generateQuestsForBaby = (babyId, date) => {
  const baseQuests = [
    // 诚实类任务
    {
      id: `honesty_daily_1_${date}`,
      characterType: CHARACTER_TYPES.HONESTY,
      type: QUEST_TYPES.DAILY,
      title: '说真话',
      description: '今天无论发生什么，都说实话',
      exp: 10,
      date,
      difficulty: 1
    },
    {
      id: `honesty_daily_2_${date}`,
      characterType: CHARACTER_TYPES.HONESTY,
      type: QUEST_TYPES.DAILY,
      title: '承认错误',
      description: '如果做错了事，主动承认',
      exp: 15,
      date,
      difficulty: 2
    },
    // 善良类任务
    {
      id: `kindness_daily_1_${date}`,
      characterType: CHARACTER_TYPES.KINDNESS,
      type: QUEST_TYPES.DAILY,
      title: '帮助家人',
      description: '主动帮助家人做一件事',
      exp: 10,
      date,
      difficulty: 1
    },
    {
      id: `kindness_daily_2_${date}`,
      characterType: CHARACTER_TYPES.KINDNESS,
      type: QUEST_TYPES.DAILY,
      title: '关心朋友',
      description: '问候或关心一位朋友',
      exp: 12,
      date,
      difficulty: 1
    },
    // 勇敢类任务
    {
      id: `courage_daily_1_${date}`,
      characterType: CHARACTER_TYPES.COURAGE,
      type: QUEST_TYPES.DAILY,
      title: '面对困难',
      description: '遇到困难不放弃，尝试解决',
      exp: 10,
      date,
      difficulty: 1
    },
    {
      id: `courage_daily_2_${date}`,
      characterType: CHARACTER_TYPES.COURAGE,
      type: QUEST_TYPES.DAILY,
      title: '尝试新事物',
      description: '勇敢尝试一件以前没做过的事',
      exp: 15,
      date,
      difficulty: 2
    },
    // 感恩类任务
    {
      id: `gratitude_daily_1_${date}`,
      characterType: CHARACTER_TYPES.GRATITUDE,
      type: QUEST_TYPES.DAILY,
      title: '说谢谢',
      description: '对帮助你的人说声谢谢',
      exp: 10,
      date,
      difficulty: 1
    },
    {
      id: `gratitude_daily_2_${date}`,
      characterType: CHARACTER_TYPES.GRATITUDE,
      type: QUEST_TYPES.DAILY,
      title: '感恩家人',
      description: '对家人表达感谢',
      exp: 12,
      date,
      difficulty: 1
    }
  ]
  
  return baseQuests.map(q => ({
    ...q,
    babyId
  }))
}

/**
 * 领取任务
 */
const acceptQuest = (babyId, questId) => {
  const record = {
    id: `record_${Date.now()}`,
    babyId,
    questId,
    status: QUEST_STATUS.IN_PROGRESS,
    progress: 0,
    startTime: new Date().toISOString()
  }
  
  characterData.questRecords.push(record)
  saveData()
  
  return record
}

/**
 * 更新任务进度
 */
const updateQuestProgress = (babyId, questId, progress) => {
  const record = characterData.questRecords.find(r => 
    r.babyId === babyId && r.questId === questId && r.status === QUEST_STATUS.IN_PROGRESS
  )
  
  if (record) {
    record.progress = Math.min(progress, 100)
    saveData()
  }
  
  return record
}

/**
 * 完成任务
 */
const completeQuest = (babyId, questId) => {
  const record = characterData.questRecords.find(r => 
    r.babyId === babyId && r.questId === questId
  )
  
  if (!record) return null
  
  // 找到任务获取经验值
  const quest = characterData.quests.find(q => q.id === questId)
  if (quest) {
    const result = addExp(babyId, quest.characterType, quest.exp)
    
    record.status = QUEST_STATUS.COMPLETED
    record.completedAt = new Date().toISOString()
    record.expGained = quest.exp
    
    saveData()
    
    return {
      record,
      expGained: quest.exp,
      ...result
    }
  }
  
  return null
}

/**
 * 获取任务记录
 */
const getQuestRecords = (babyId, limit = 20) => {
  return characterData.questRecords
    .filter(r => r.babyId === babyId)
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, limit)
}

/**
 * 获取任务详情
 */
const getQuestById = (questId) => {
  return characterData.quests.find(q => q.id === questId)
}

// ==================== 日记相关 ====================

/**
 * 添加日记
 */
const addJournalEntry = (babyId, data) => {
  const entry = {
    id: `journal_${Date.now()}`,
    babyId,
    date: data.date || new Date().toISOString().split('T')[0],
    characterType: data.characterType,
    title: data.title,
    content: data.content,
    mood: data.mood || 'neutral',
    tags: data.tags || [],
    createdAt: new Date().toISOString()
  }
  
  characterData.journalEntries.push(entry)
  saveData()
  
  // 根据品格类型增加经验
  if (data.characterType) {
    addExp(babyId, data.characterType, 5)
  }
  
  return entry
}

/**
 * 获取日记列表
 */
const getJournalEntries = (babyId, limit = 50) => {
  return characterData.journalEntries
    .filter(e => e.babyId === babyId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit)
}

/**
 * 获取某日的日记
 */
const getJournalByDate = (babyId, date) => {
  return characterData.journalEntries.find(e => 
    e.babyId === babyId && e.date === date
  )
}

/**
 * 获取按品格类型分组的日记
 */
const getJournalByCharacterType = (babyId, characterType) => {
  return characterData.journalEntries
    .filter(e => e.babyId === babyId && e.characterType === characterType)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

// ==================== 证书相关 ====================

/**
 * 检查并生成证书
 */
const checkAndGenerateCertificate = (babyId) => {
  const levels = getAllCharacterLevels(babyId)
  
  // 检查是否满足证书条件（某个品格达到3级）
  const certifiableTypes = Object.entries(levels)
    .filter(([type, info]) => info.level >= 3)
    .map(([type]) => type)
  
  const certificates = []
  
  certifiableTypes.forEach(type => {
    // 检查是否已有该类型证书
    const existing = characterData.certificates.find(c => 
      c.babyId === babyId && c.characterType === type
    )
    
    if (!existing) {
      const cert = {
        id: `cert_${type}_${Date.now()}`,
        babyId,
        characterType: type,
        level: levels[type].level,
        earnedAt: new Date().toISOString(),
        certificateNumber: `CC${Date.now()}`
      }
      characterData.certificates.push(cert)
      certificates.push(cert)
    }
  })
  
  if (certificates.length > 0) {
    saveData()
  }
  
  return certificates
}

/**
 * 获取证书列表
 */
const getCertificates = (babyId) => {
  return characterData.certificates
    .filter(c => c.babyId === babyId)
    .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
}

/**
 * 获取证书详情
 */
const getCertificateById = (certId) => {
  return characterData.certificates.find(c => c.id === certId)
}

// ==================== 统计相关 ====================

/**
 * 获取统计数据
 */
const getStatistics = (babyId) => {
  const records = characterData.questRecords.filter(r => r.babyId === babyId)
  const levels = getAllCharacterLevels(babyId)
  
  const completedQuests = records.filter(r => r.status === QUEST_STATUS.COMPLETED)
  const totalExp = Object.values(levels).reduce((sum, l) => sum + l.totalExp, 0)
  
  return {
    totalQuests: records.length,
    completedQuests: completedQuests.length,
    totalExp,
    overallLevel: getOverallLevel(babyId),
    levels,
    journalCount: characterData.journalEntries.filter(e => e.babyId === babyId).length,
    certificateCount: characterData.certificates.filter(c => c.babyId === babyId).length
  }
}

// ==================== 导出 ====================

export default {
  // 常量
  CHARACTER_TYPES,
  CHARACTER_INFO,
  LEVELS,
  QUEST_TYPES,
  QUEST_STATUS,
  
  // 初始化
  init,
  
  // 品格等级
  getCharacterLevel,
  getAllCharacterLevels,
  addExp,
  getLevelProgress,
  getOverallLevel,
  
  // 任务
  getDailyQuests,
  getAvailableQuests,
  acceptQuest,
  updateQuestProgress,
  completeQuest,
  getQuestRecords,
  getQuestById,
  
  // 日记
  addJournalEntry,
  getJournalEntries,
  getJournalByDate,
  getJournalByCharacterType,
  
  // 证书
  checkAndGenerateCertificate,
  getCertificates,
  getCertificateById,
  
  // 统计
  getStatistics
}
