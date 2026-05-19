/**
 * V97 Daily Ceremonies Service
 * 日常仪式服务 - 晨间惯例、晚间惯例、特别日仪式
 */

// 存储键
const MORNING_ROUTINE_KEY = 'daily_ceremonies_morning'
const EVENING_ROUTINE_KEY = 'daily_ceremonies_evening'
const SPECIAL_DAYS_KEY = 'daily_ceremonies_special'
const CEREMONY_RECORDS_KEY = 'daily_ceremonies_records'

// 晨间惯例模板
export const MORNING_ROUTINE_TEMPLATES = [
  { id: 'wake_up', name: '起床整理', icon: '🌅', description: '起床后整理床铺', defaultDuration: 5 },
  { id: 'wash_face', name: '洗漱', icon: '🚿', description: '洗脸刷牙', defaultDuration: 10 },
  { id: 'breakfast', name: '营养早餐', icon: '🍳', description: '和家人一起吃早餐', defaultDuration: 20 },
  { id: 'checklist', name: '早间检查清单', icon: '📋', description: '检查书包、文具、服装', defaultDuration: 5 },
  { id: 'stretch', name: '晨间拉伸', icon: '🧘', description: '简单的伸展运动', defaultDuration: 5 },
  { id: 'read', name: '晨间阅读', icon: '📚', description: '阅读15分钟', defaultDuration: 15 }
]

// 晚间惯例模板
export const EVENING_ROUTINE_TEMPLATES = [
  { id: 'homework', name: '完成作业', icon: '📝', description: '认真完成当日作业', defaultDuration: 30 },
  { id: 'review', name: '日终总结', icon: '📖', description: '回顾今日所学', defaultDuration: 10 },
  { id: 'prepare', name: '准备明日', icon: '🎒', description: '整理书包准备明天', defaultDuration: 5 },
  { id: 'bath', name: '洗漱洗澡', icon: '🛁', description: '清洁身体', defaultDuration: 15 },
  { id: 'story', name: '睡前故事', icon: '📕', description: '亲子共读或自主阅读', defaultDuration: 15 },
  { id: 'bed', name: '睡前仪式', icon: '🌙', description: '道晚安、拥抱', defaultDuration: 5 }
]

// 特别日类型
export const SPECIAL_DAY_TYPES = {
  birthday: { id: 'birthday', name: '生日', icon: '🎂', color: '#ff6b6b' },
  achievement: { id: 'achievement', name: '成就庆祝', icon: '🏆', color: '#ffd93d' },
  holiday: { id: 'holiday', name: '节日', icon: '🎉', color: '#6bcbff' },
  milestone: { id: 'milestone', name: '里程碑', icon: '⭐', color: '#c9b1ff' }
}

// 获取晨间惯例
export const getMorningRoutine = () => {
  try {
    const stored = uni.getStorageSync(MORNING_ROUTINE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    return getDefaultMorningRoutine()
  } catch (e) {
    console.error('获取晨间惯例失败:', e)
    return getDefaultMorningRoutine()
  }
}

// 保存晨间惯例
export const saveMorningRoutine = (routine) => {
  uni.setStorageSync(MORNING_ROUTINE_KEY, JSON.stringify(routine))
}

// 获取晚间惯例
export const getEveningRoutine = () => {
  try {
    const stored = uni.getStorageSync(EVENING_ROUTINE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    return getDefaultEveningRoutine()
  } catch (e) {
    console.error('获取晚间惯例失败:', e)
    return getDefaultEveningRoutine()
  }
}

// 保存晚间惯例
export const saveEveningRoutine = (routine) => {
  uni.setStorageSync(EVENING_ROUTINE_KEY, JSON.stringify(routine))
}

// 获取默认晨间惯例
export const getDefaultMorningRoutine = () => {
  return MORNING_ROUTINE_TEMPLATES.slice(0, 4).map(tpl => ({
    ...tpl,
    order: MORNING_ROUTINE_TEMPLATES.indexOf(tpl),
    completed: false,
    isActive: true
  }))
}

// 获取默认晚间惯例
export const getDefaultEveningRoutine = () => {
  return EVENING_ROUTINE_TEMPLATES.slice(0, 4).map(tpl => ({
    ...tpl,
    order: EVENING_ROUTINE_TEMPLATES.indexOf(tpl),
    completed: false,
    isActive: true
  }))
}

// 获取特别日列表
export const getSpecialDays = () => {
  try {
    const stored = uni.getStorageSync(SPECIAL_DAYS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取特别日列表失败:', e)
    return []
  }
}

// 保存特别日列表
export const saveSpecialDays = (days) => {
  uni.setStorageSync(SPECIAL_DAYS_KEY, JSON.stringify(days))
}

// 创建特别日
export const createSpecialDay = (name, type, date, description = '') => {
  const days = getSpecialDays()
  const newDay = {
    id: 'special_' + Date.now(),
    name,
    type,
    date,
    description,
    createdAt: new Date().toISOString(),
    celebrations: [],
    isCompleted: false
  }
  days.push(newDay)
  saveSpecialDays(days)
  return newDay
}

// 获取仪式记录
export const getCeremonyRecords = () => {
  try {
    const stored = uni.getStorageSync(CEREMONY_RECORDS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取仪式记录失败:', e)
    return []
  }
}

// 保存仪式记录
export const saveCeremonyRecords = (records) => {
  uni.setStorageSync(CEREMONY_RECORDS_KEY, JSON.stringify(records))
}

// 记录晨间惯例完成
export const recordMorningCompletion = (routineId, babyId, items) => {
  const records = getCeremonyRecords()
  const today = new Date().toISOString().split('T')[0]
  
  const record = {
    id: 'record_' + Date.now(),
    type: 'morning',
    routineId,
    babyId,
    date: today,
    items,
    completedAt: new Date().toISOString(),
    expGained: calculateExpForRoutine('morning', items)
  }
  
  records.push(record)
  saveCeremonyRecords(records)
  return record
}

// 记录晚间惯例完成
export const recordEveningCompletion = (routineId, babyId, items) => {
  const records = getCeremonyRecords()
  const today = new Date().toISOString().split('T')[0]
  
  const record = {
    id: 'record_' + Date.now(),
    type: 'evening',
    routineId,
    babyId,
    date: today,
    items,
    completedAt: new Date().toISOString(),
    expGained: calculateExpForRoutine('evening', items)
  }
  
  records.push(record)
  saveCeremonyRecords(records)
  return record
}

// 计算仪式经验值
export const calculateExpForRoutine = (type, items) => {
  const completedCount = items.filter(item => item.completed).length
  const baseExp = type === 'morning' ? 15 : 20
  const perItemExp = 5
  return baseExp + (completedCount * perItemExp)
}

// 获取今日仪式状态
export const getTodayCeremonyStatus = () => {
  const records = getCeremonyRecords()
  const today = new Date().toISOString().split('T')[0]
  
  const todayRecords = records.filter(r => r.date === today)
  
  return {
    morningCompleted: todayRecords.some(r => r.type === 'morning'),
    eveningCompleted: todayRecords.some(r => r.type === 'evening'),
    morningRecord: todayRecords.find(r => r.type === 'morning'),
    eveningRecord: todayRecords.find(r => r.type === 'evening')
  }
}

// 获取连续完成天数
export const getStreakDays = (type) => {
  const records = getCeremonyRecords()
  const filteredRecords = records.filter(r => r.type === type)
  
  if (filteredRecords.length === 0) return 0
  
  // 按日期排序
  const dates = [...new Set(filteredRecords.map(r => r.date))].sort().reverse()
  
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  for (const dateStr of dates) {
    const recordDate = new Date(dateStr)
    recordDate.setHours(0, 0, 0, 0)
    
    const diffDays = Math.floor((currentDate - recordDate) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 1) {
      streak++
      currentDate = recordDate
    } else {
      break
    }
  }
  
  return streak
}

// 完成特别日庆祝
export const completeSpecialDayCelebration = (specialDayId, celebration) => {
  const days = getSpecialDays()
  const day = days.find(d => d.id === specialDayId)
  
  if (day) {
    day.celebrations.push({
      ...celebration,
      completedAt: new Date().toISOString()
    })
    day.isCompleted = true
    saveSpecialDays(days)
  }
  
  return day
}

// 获取即将到来的特别日
export const getUpcomingSpecialDays = () => {
  const days = getSpecialDays()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return days
    .filter(day => {
      const dayDate = new Date(day.date)
      dayDate.setHours(0, 0, 0, 0)
      return dayDate >= today && !day.isCompleted
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5)
}

export default {
  MORNING_ROUTINE_TEMPLATES,
  EVENING_ROUTINE_TEMPLATES,
  SPECIAL_DAY_TYPES,
  getMorningRoutine,
  saveMorningRoutine,
  getEveningRoutine,
  saveEveningRoutine,
  getDefaultMorningRoutine,
  getDefaultEveningRoutine,
  getSpecialDays,
  saveSpecialDays,
  createSpecialDay,
  getCeremonyRecords,
  saveCeremonyRecords,
  recordMorningCompletion,
  recordEveningCompletion,
  calculateExpForRoutine,
  getTodayCeremonyStatus,
  getStreakDays,
  completeSpecialDayCelebration,
  getUpcomingSpecialDays
}
