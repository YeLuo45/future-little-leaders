/**
 * V67 Science Experiment Service
 * 科学实验系统服务 - 实验库、虚拟实验、实验记录
 */

import { useBabyStore } from '@/stores/babyStore.js'

// Storage keys
const SCIENCE_EXPERIMENTS_KEY = 'science_experiments'
const SCIENCE_JOURNAL_KEY = 'science_journal'
const SCIENCE_AWARDS_KEY = 'science_awards'
const SCIENCE_PROGRESS_KEY = 'science_progress'

// ============================================================================
// 实验类型定义
// ============================================================================

export const SCIENCE_CATEGORIES = {
  physics: { id: 'physics', name: '物理', icon: '⚡', color: '#3498DB' },
  chemistry: { id: 'chemistry', name: '化学', icon: '🧪', color: '#9B59B6' },
  biology: { id: 'biology', name: '生物', icon: '🌱', color: '#27AE60' }
}

export const DIFFICULTY_LEVELS = {
  easy: { id: 'easy', name: '简单', color: '#2ECC71' },
  medium: { id: 'medium', name: '中等', color: '#F39C12' },
  hard: { id: 'hard', name: '困难', color: '#E74C3C' }
}

export const SAFETY_LEVELS = {
  safe: { id: 'safe', name: '安全', icon: '✅', color: '#2ECC71' },
  warning: { id: 'warning', name: '需注意', icon: '⚠️', color: '#F39C12' },
  danger: { id: 'danger', name: '危险', icon: '❌', color: '#E74C3C' }
}

// ============================================================================
// 实验库
// ============================================================================

export const getScienceExperiments = () => {
  try {
    const data = uni.getStorageSync(SCIENCE_EXPERIMENTS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getScienceExperiments error:', e)
  }
  return getDefaultExperiments()
}

export const getDefaultExperiments = () => [
  {
    id: 'exp_1',
    title: '彩虹牛奶',
    description: '利用表面活性剂和食用色素，观察彩虹般的色彩流动',
    category: 'chemistry',
    difficulty: 'easy',
    duration: 15,
    points: 20,
    safetyLevel: 'safe',
    materials: ['牛奶', '食用色素', '棉签', '洗洁精', '盘子'],
    steps: [
      { order: 1, title: '准备材料', description: '牛奶、食用色素、棉签、洗洁精、盘子', image: '' },
      { order: 2, title: '倒入牛奶', description: '在盘子里倒入适量牛奶，覆盖盘底即可', image: '' },
      { order: 3, title: '添加色素', description: '将不同颜色的食用色素滴在牛奶表面', image: '' },
      { order: 4, title: '观察反应', description: '用棉签蘸取洗洁精，轻轻触碰牛奶表面，观察彩虹流动', image: '' }
    ],
    principle: '洗洁精会降低牛奶表面的张力，导致色素快速流动形成彩虹效果。',
    isCompleted: false,
    completedAt: null,
    completionRecord: null
  },
  {
    id: 'exp_2',
    title: '火山爆发',
    description: '利用小苏打和醋的化学反应，模拟火山喷发',
    category: 'chemistry',
    difficulty: 'medium',
    duration: 20,
    points: 30,
    safetyLevel: 'warning',
    materials: ['小苏打', '白醋', '食用色素', '橡皮泥', '纸板', '红色素'],
    steps: [
      { order: 1, title: '搭建火山模型', description: '用橡皮泥或纸板搭建火山模型', image: '' },
      { order: 2, title: '加入小苏打', description: '在火山口加入3勺小苏打', image: '' },
      { order: 3, title: '添加食用色素', description: '滴入几滴红色食用色素', image: '' },
      { order: 4, title: '制造喷发', description: '快速倒入白醋，观察火山喷发', image: '' }
    ],
    principle: '小苏打（碳酸氢钠）与醋（醋酸）反应生成二氧化碳气体，产生大量气泡模拟火山喷发。',
    isCompleted: false,
    completedAt: null,
    completionRecord: null
  },
  {
    id: 'exp_3',
    title: '电路小实验',
    description: '组装简单电路，点亮小灯泡',
    category: 'physics',
    difficulty: 'medium',
    duration: 25,
    points: 35,
    safetyLevel: 'warning',
    materials: ['电池', '导线', '开关', '小灯泡'],
    steps: [
      { order: 1, title: '准备材料', description: '电池、导线、开关、小灯泡', image: '' },
      { order: 2, title: '连接电路', description: '按照电路图连接各元件', image: '' },
      { order: 3, title: '测试电路', description: '闭合开关，观察灯泡是否发光', image: '' },
      { order: 4, title: '记录结果', description: '记录灯泡亮度，分析电路原理', image: '' }
    ],
    principle: '电流从电池正极流出，经过导线和开关，流过灯泡，回到电池负极，形成完整电路。',
    isCompleted: false,
    completedAt: null,
    completionRecord: null
  },
  {
    id: 'exp_4',
    title: '植物生长观察',
    description: '观察植物从种子到发芽的完整过程',
    category: 'biology',
    difficulty: 'easy',
    duration: 30,
    points: 25,
    safetyLevel: 'safe',
    materials: ['豆类种子', '棉花', '土壤', '种植盆', '放大镜'],
    steps: [
      { order: 1, title: '准备种子', description: '选择豆类种子，浸泡一夜', image: '' },
      { order: 2, title: '种植', description: '将种子放入湿润的棉花或土壤中', image: '' },
      { order: 3, title: '日常观察', description: '每天记录种子的变化', image: '' },
      { order: 4, title: '完成报告', description: '绘制生长过程图表', image: '' }
    ],
    principle: '种子萌发需要水分、温度和空气。胚根突破种皮向下生长形成根，胚芽向上生长形成茎和叶。',
    isCompleted: false,
    completedAt: null,
    completionRecord: null
  },
  {
    id: 'exp_5',
    title: '声音的传播',
    description: '探究声音在不同介质中的传播特性',
    category: 'physics',
    difficulty: 'easy',
    duration: 20,
    points: 20,
    safetyLevel: 'safe',
    materials: ['音叉', '水盆', '棉线', '金属棒', '气球'],
    steps: [
      { order: 1, title: '准备材料', description: '准备好实验材料', image: '' },
      { order: 2, title: '空气传播', description: '敲击音叉，在空气中听声音', image: '' },
      { order: 3, title: '固体传播', description: '用棉线连接音叉，贴近耳朵敲击', image: '' },
      { order: 4, title: '液体传播', description: '将敲击的音叉放入水中，观察水波', image: '' }
    ],
    principle: '声音需要介质传播，固体传声最快，液体次之，气体最慢。真空不能传声。',
    isCompleted: false,
    completedAt: null,
    completionRecord: null
  },
  {
    id: 'exp_6',
    title: '光合作用实验',
    description: '验证植物光合作用产生氧气',
    category: 'biology',
    difficulty: 'medium',
    duration: 30,
    points: 35,
    safetyLevel: 'safe',
    materials: ['水草', '玻璃瓶', '阳光', ' magnifying glass'],
    steps: [
      { order: 1, title: '准备水草', description: '取新鲜水草放入玻璃瓶中', image: '' },
      { order: 2, title: '阳光照射', description: '将玻璃瓶置于阳光下', image: '' },
      { order: 3, title: '观察气泡', description: '用放大镜观察水草产生的气泡', image: '' },
      { order: 4, title: '记录数据', description: '记录气泡产生的数量和速度', image: '' }
    ],
    principle: '水草在阳光下进行光合作用，吸收二氧化碳释放氧气，产生的气泡就是氧气。',
    isCompleted: false,
    completedAt: null,
    completionRecord: null
  }
]

export const filterExperiments = (filters = {}) => {
  const experiments = getScienceExperiments()
  return experiments.filter(exp => {
    if (filters.category && exp.category !== filters.category) return false
    if (filters.difficulty && exp.difficulty !== filters.difficulty) return false
    if (filters.completedOnly && !exp.isCompleted) return false
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      if (!exp.title.toLowerCase().includes(keyword) && 
          !exp.description.toLowerCase().includes(keyword)) {
        return false
      }
    }
    return true
  })
}

export const getExperimentById = (id) => {
  const experiments = getScienceExperiments()
  return experiments.find(e => e.id === id)
}

// ============================================================================
// 实验完成记录
// ============================================================================

export const completeExperiment = (experimentId, record) => {
  try {
    const experiments = getScienceExperiments()
    const experiment = experiments.find(e => e.id === experimentId)
    if (experiment) {
      experiment.isCompleted = true
      experiment.completedAt = new Date().toISOString()
      experiment.completionRecord = record
      uni.setStorageSync(SCIENCE_EXPERIMENTS_KEY, JSON.stringify(experiments))
      
      // 更新积分
      updateSciencePoints(experiment.points)
      // 检查成就
      checkAndUnlockAwards()
      
      return experiment
    }
    return null
  } catch (e) {
    console.error('completeExperiment error:', e)
    return null
  }
}

// ============================================================================
// 实验记录 (Science Journal)
// ============================================================================

export const getJournalEntries = () => {
  try {
    const babyStore = useBabyStore()
    if (!babyStore.currentBabyId) return []
    
    const data = uni.getStorageSync(`${SCIENCE_JOURNAL_KEY}_${babyStore.currentBabyId}`)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getJournalEntries error:', e)
  }
  return []
}

export const getDefaultJournalEntries = () => []

export const addJournalEntry = (entry) => {
  try {
    const babyStore = useBabyStore()
    if (!babyStore.currentBabyId) return null
    
    const entries = getJournalEntries()
    const newEntry = {
      id: `journal_${Date.now()}`,
      babyId: babyStore.currentBabyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...entry
    }
    entries.unshift(newEntry)
    uni.setStorageSync(`${SCIENCE_JOURNAL_KEY}_${babyStore.currentBabyId}`, JSON.stringify(entries))
    return newEntry
  } catch (e) {
    console.error('addJournalEntry error:', e)
    return null
  }
}

export const updateJournalEntry = (entryId, updates) => {
  try {
    const babyStore = useBabyStore()
    if (!babyStore.currentBabyId) return null
    
    const entries = getJournalEntries()
    const entry = entries.find(e => e.id === entryId)
    if (entry) {
      Object.assign(entry, updates, { updatedAt: new Date().toISOString() })
      uni.setStorageSync(`${SCIENCE_JOURNAL_KEY}_${babyStore.currentBabyId}`, JSON.stringify(entries))
      return entry
    }
    return null
  } catch (e) {
    console.error('updateJournalEntry error:', e)
    return null
  }
}

export const deleteJournalEntry = (entryId) => {
  try {
    const babyStore = useBabyStore()
    if (!babyStore.currentBabyId) return false
    
    const entries = getJournalEntries()
    const filtered = entries.filter(e => e.id !== entryId)
    uni.setStorageSync(`${SCIENCE_JOURNAL_KEY}_${babyStore.currentBabyId}`, JSON.stringify(filtered))
    return true
  } catch (e) {
    console.error('deleteJournalEntry error:', e)
    return false
  }
}

export const getJournalEntryById = (entryId) => {
  const entries = getJournalEntries()
  return entries.find(e => e.id === entryId)
}

// ============================================================================
// 科学积分
// ============================================================================

export const getSciencePoints = () => {
  try {
    const babyStore = useBabyStore()
    if (!babyStore.currentBabyId) return { totalPoints: 0, level: 1 }
    
    const data = uni.getStorageSync(`${SCIENCE_PROGRESS_KEY}_${babyStore.currentBabyId}`)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getSciencePoints error:', e)
  }
  return { totalPoints: 0, level: 1, completedCount: 0, streakDays: 0 }
}

export const updateSciencePoints = (points) => {
  try {
    const babyStore = useBabyStore()
    if (!babyStore.currentBabyId) return null
    
    const data = getSciencePoints()
    data.totalPoints += points
    data.level = Math.floor(data.totalPoints / 100) + 1
    
    const experiments = getScienceExperiments()
    data.completedCount = experiments.filter(e => e.isCompleted).length
    
    uni.setStorageSync(`${SCIENCE_PROGRESS_KEY}_${babyStore.currentBabyId}`, JSON.stringify(data))
    return data
  } catch (e) {
    console.error('updateSciencePoints error:', e)
    return null
  }
}

// ============================================================================
// 科学成就 (Science Awards)
// ============================================================================

export const getScienceAwards = () => {
  try {
    const babyStore = useBabyStore()
    if (!babyStore.currentBabyId) return getDefaultAwards()
    
    const data = uni.getStorageSync(`${SCIENCE_AWARDS_KEY}_${babyStore.currentBabyId}`)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getScienceAwards error:', e)
  }
  return getDefaultAwards()
}

export const getDefaultAwards = () => [
  { id: 'first_experiment', name: '初出茅庐', description: '完成第一个科学实验', icon: '🧪', category: 'experiment', isUnlocked: false, unlockedAt: null },
  { id: 'chemistry_starter', name: '化学小能手', description: '完成3个化学实验', icon: '⚗️', category: 'chemistry', isUnlocked: false, unlockedAt: null, requirement: 3 },
  { id: 'physics_starter', name: '物理小达人', description: '完成3个物理实验', icon: '⚡', category: 'physics', isUnlocked: false, unlockedAt: null, requirement: 3 },
  { id: 'biology_starter', name: '生物小专家', description: '完成3个生物实验', icon: '🔬', category: 'biology', isUnlocked: false, unlockedAt: null, requirement: 3 },
  { id: 'science_explorer', name: '科学探索家', description: '完成所有简单实验', icon: '🌟', category: 'experiment', isUnlocked: false, unlockedAt: null, requirement: 'all_easy' },
  { id: 'journal_writer', name: '记录达人', description: '撰写10篇实验记录', icon: '📝', category: 'journal', isUnlocked: false, unlockedAt: null, requirement: 10 },
  { id: 'science_master', name: '科学大师', description: '累计获得300科学积分', icon: '🏆', category: 'points', isUnlocked: false, unlockedAt: null, requirement: 300 },
  { id: 'curious_mind', name: '好奇小达人', description: '完成5个不同类型的实验', icon: '💡', category: 'experiment', isUnlocked: false, unlockedAt: null, requirement: 5 }
]

export const checkAndUnlockAwards = () => {
  try {
    const babyStore = useBabyStore()
    if (!babyStore.currentBabyId) return []
    
    const awards = getScienceAwards()
    const experiments = getScienceExperiments()
    const journalEntries = getJournalEntries()
    const points = getSciencePoints()
    
    const unlocked = []
    
    awards.forEach(award => {
      if (award.isUnlocked) return
      
      let shouldUnlock = false
      
      switch (award.id) {
        case 'first_experiment':
          shouldUnlock = experiments.filter(e => e.isCompleted).length >= 1
          break
        case 'chemistry_starter':
          shouldUnlock = experiments.filter(e => e.isCompleted && e.category === 'chemistry').length >= 3
          break
        case 'physics_starter':
          shouldUnlock = experiments.filter(e => e.isCompleted && e.category === 'physics').length >= 3
          break
        case 'biology_starter':
          shouldUnlock = experiments.filter(e => e.isCompleted && e.category === 'biology').length >= 3
          break
        case 'science_explorer':
          const easyExps = experiments.filter(e => e.difficulty === 'easy')
          shouldUnlock = easyExps.length > 0 && easyExps.every(e => e.isCompleted)
          break
        case 'journal_writer':
          shouldUnlock = journalEntries.length >= 10
          break
        case 'science_master':
          shouldUnlock = points.totalPoints >= 300
          break
        case 'curious_mind':
          const categories = new Set(experiments.filter(e => e.isCompleted).map(e => e.category))
          shouldUnlock = categories.size >= 5
          break
      }
      
      if (shouldUnlock) {
        award.isUnlocked = true
        award.unlockedAt = new Date().toISOString()
        unlocked.push(award)
      }
    })
    
    if (unlocked.length > 0) {
      uni.setStorageSync(`${SCIENCE_AWARDS_KEY}_${babyStore.currentBabyId}`, JSON.stringify(awards))
    }
    
    return unlocked
  } catch (e) {
    console.error('checkAndUnlockAwards error:', e)
    return []
  }
}

// ============================================================================
// 排行榜 (Leaderboard)
// ============================================================================

export const getLeaderboard = () => {
  try {
    const data = uni.getStorageSync('science_leaderboard')
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getLeaderboard error:', e)
  }
  // 返回模拟数据
  return [
    { rank: 1, babyName: '小明', points: 580, completedCount: 12, avatar: '' },
    { rank: 2, babyName: '小红', points: 420, completedCount: 9, avatar: '' },
    { rank: 3, babyName: '小华', points: 350, completedCount: 7, avatar: '' },
    { rank: 4, babyName: '小丽', points: 280, completedCount: 6, avatar: '' },
    { rank: 5, babyName: '小强', points: 220, completedCount: 5, avatar: '' }
  ]
}

export default {
  // 类型
  SCIENCE_CATEGORIES,
  DIFFICULTY_LEVELS,
  SAFETY_LEVELS,
  
  // 实验
  getScienceExperiments,
  filterExperiments,
  getExperimentById,
  completeExperiment,
  
  // 记录
  getJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalEntryById,
  
  // 积分
  getSciencePoints,
  updateSciencePoints,
  
  // 成就
  getScienceAwards,
  checkAndUnlockAwards,
  
  // 排行榜
  getLeaderboard
}
