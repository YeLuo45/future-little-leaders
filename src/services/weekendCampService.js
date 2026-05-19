/**
 * V89 Weekend Camp Service
 * 周末营服务层
 * 主题周末活动、户外探索、创意工坊、社交活动
 */

// ==================== 常量定义 ====================

// 活动类型
export const CAMP_ACTIVITY_TYPE = {
  OUTDOOR_EXPLORATION: 'outdoor_exploration',   // 户外探索
  CREATIVE_WORKSHOP: 'creative_workshop',       // 创意工坊
  SOCIAL_PARTY: 'social_party',                 // 社交派对
  THEME_CAMP: 'theme_camp'                       // 主题周末营
}

// 活动状态
export const CAMP_STATUS = {
  UPCOMING: 'upcoming',     // 即将开始
  REGISTRATION: 'registration', // 报名中
  ONGOING: 'ongoing',       // 进行中
  COMPLETED: 'completed',  // 已完成
  CANCELLED: 'cancelled'    // 已取消
}

// 报名状态
export const REGISTRATION_STATUS = {
  PENDING: 'pending',       // 待确认
  CONFIRMED: 'confirmed',   // 已确认
  CANCELLED: 'cancelled',   // 已取消
  ATTENDED: 'attended'      // 已参加
}

// 奖励类型
export const REWARD_TYPE = {
  POINTS: 'points',         // 积分
  BADGE: 'badge',           // 徽章
  CERTIFICATE: 'certificate' // 证书
}

// localStorage keys
const CAMPS_KEY = 'weekend_camps'
const CAMP_REGISTRATIONS_KEY = 'weekend_camp_registrations'
const CAMP_ACTIVITIES_KEY = 'weekend_camp_activities'
const CAMP_REWARDS_KEY = 'weekend_camp_rewards'
const CAMP_SHARES_KEY = 'weekend_camp_shares'

// ==================== 辅助函数 ====================

function generateId(prefix = 'wc') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`
}

function now() {
  return new Date().toISOString()
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getWeekendDate(weekOffset = 0) {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysUntilSaturday = (6 - dayOfWeek + 7 * weekOffset) % 7 || 7
  const saturday = new Date(now)
  saturday.setDate(now.getDate() + daysUntilSaturday)
  return formatDate(saturday)
}

// ==================== 内置周末营活动数据 ====================

const BUILT_IN_CAMPS = [
  {
    id: 'camp_1',
    title: '🌲 森林探险周末营',
    description: '走进大自然，探索森林的奥秘！学习户外生存技能，观察动植物，体验丛林徒步。',
    type: CAMP_ACTIVITY_TYPE.OUTDOOR_EXPLORATION,
    coverImage: '/static/images/camp-forest.jpg',
    ageRange: '5-10',
    location: '郊野公园',
    startDate: getWeekendDate(1),
    endDate: getWeekendDate(1),
    time: '09:00-16:00',
    capacity: 20,
    enrolledCount: 12,
    price: 299,
    points: 100,
    status: CAMP_STATUS.REGISTRATION,
    tags: ['户外', '探险', '自然教育'],
    requirements: ['舒适运动服', '防晒霜', '水壶', '轻便背包'],
    schedule: [
      { time: '09:00', activity: '集合签到' },
      { time: '09:30', activity: '森林徒步探险' },
      { time: '11:30', activity: '户外生存技能学习' },
      { time: '12:30', activity: '午餐休息' },
      { time: '14:00', activity: '植物观察与采集' },
      { time: '15:30', activity: '自然手作' }
    ],
    createdAt: now()
  },
  {
    id: 'camp_2',
    title: '🎨 创意艺术周末工坊',
    description: '释放创造力！学习多种艺术创作技巧，制作属于自己的艺术作品。',
    type: CAMP_ACTIVITY_TYPE.CREATIVE_WORKSHOP,
    coverImage: '/static/images/camp-art.jpg',
    ageRange: '4-12',
    location: '创意美术中心',
    startDate: getWeekendDate(1),
    endDate: getWeekendDate(1),
    time: '10:00-17:00',
    capacity: 15,
    enrolledCount: 8,
    price: 399,
    points: 120,
    status: CAMP_STATUS.REGISTRATION,
    tags: ['美术', '创意', '手工'],
    requirements: ['旧衣服（便于创作）', '好奇心'],
    schedule: [
      { time: '10:00', activity: '艺术启蒙' },
      { time: '10:30', activity: '绘画创作' },
      { time: '12:00', activity: '午餐休息' },
      { time: '13:30', activity: '手工制作' },
      { time: '15:30', activity: '作品展示与分享' }
    ],
    createdAt: now()
  },
  {
    id: 'camp_3',
    title: '🎉 欢乐社交派对',
    description: '认识新朋友！有趣的互动游戏、才艺展示、欢乐派对时光。',
    type: CAMP_ACTIVITY_TYPE.SOCIAL_PARTY,
    coverImage: '/static/images/camp-party.jpg',
    ageRange: '4-8',
    location: '儿童活动中心',
    startDate: getWeekendDate(2),
    endDate: getWeekendDate(2),
    time: '14:00-18:00',
    capacity: 30,
    enrolledCount: 18,
    price: 99,
    points: 50,
    status: CAMP_STATUS.REGISTRATION,
    tags: ['社交', '游戏', '欢乐'],
    requirements: ['一颗快乐的心'],
    schedule: [
      { time: '14:00', activity: '签到与欢迎' },
      { time: '14:30', activity: '破冰游戏' },
      { time: '15:30', activity: '才艺展示' },
      { time: '16:30', activity: '团队协作游戏' },
      { time: '17:30', activity: '分享与告别' }
    ],
    createdAt: now()
  },
  {
    id: 'camp_4',
    title: '🔬 科学探索主题营',
    description: '小科学家集合！有趣的科学实验，探索物理、化学的奥秘。',
    type: CAMP_ACTIVITY_TYPE.THEME_CAMP,
    coverImage: '/static/images/camp-science.jpg',
    ageRange: '6-12',
    location: '科学实验室',
    startDate: getWeekendDate(2),
    endDate: getWeekendDate(2),
    time: '09:00-17:00',
    capacity: 12,
    enrolledCount: 6,
    price: 499,
    points: 150,
    status: CAMP_STATUS.REGISTRATION,
    tags: ['科学', '实验', '探索'],
    requirements: ['好奇心', '探索精神'],
    schedule: [
      { time: '09:00', activity: '科学热身' },
      { time: '09:30', activity: '物理实验' },
      { time: '11:30', activity: '化学实验' },
      { time: '12:30', activity: '午餐休息' },
      { time: '14:00', activity: '科学探索' },
      { time: '16:00', activity: '科学展示' }
    ],
    createdAt: now()
  },
  {
    id: 'camp_5',
    title: '🏕️ 露营体验周末营',
    description: '第一次露营体验！学习搭帐篷、野外烹饪、观星赏月。',
    type: CAMP_ACTIVITY_TYPE.OUTDOOR_EXPLORATION,
    coverImage: '/static/images/camp-camping.jpg',
    ageRange: '7-14',
    location: '户外营地',
    startDate: getWeekendDate(3),
    endDate: getWeekendDate(3),
    time: '15:00-次日11:00',
    capacity: 15,
    enrolledCount: 5,
    price: 599,
    points: 200,
    status: CAMP_STATUS.UPCOMING,
    tags: ['露营', '户外', '星空'],
    requirements: ['睡袋', '防潮垫', '手电筒', '换洗衣物'],
    schedule: [
      { time: '15:00', activity: '营地集合' },
      { time: '15:30', activity: '搭帐篷教学' },
      { time: '17:30', activity: '野外烹饪' },
      { time: '19:30', activity: '观星活动' },
      { time: '21:00', activity: '夜间探险' },
      { time: '22:00', activity: '休息' }
    ],
    createdAt: now()
  }
]

// 内置活动积分奖励配置
const BUILT_IN_REWARDS = [
  {
    id: 'reward_1',
    type: REWARD_TYPE.POINTS,
    name: '周末营参与奖励',
    description: '参加周末营活动获得积分',
    points: 50,
    icon: '🎫'
  },
  {
    id: 'reward_2',
    type: REWARD_TYPE.BADGE,
    name: '户外探索家',
    description: '完成3次户外探索活动',
    badgeId: 'outdoor_explorer',
    icon: '🏅'
  },
  {
    id: 'reward_3',
    type: REWARD_TYPE.BADGE,
    name: '创意小达人',
    description: '完成5次创意工坊活动',
    badgeId: 'creative_master',
    icon: '🎨'
  },
  {
    id: 'reward_4',
    type: REWARD_TYPE.BADGE,
    name: '社交小明星',
    description: '参加3次社交派对活动',
    badgeId: 'social_star',
    icon: '⭐'
  }
]

// ==================== 存储操作函数 ====================

function getCamps() {
  try {
    const data = uni.getStorageSync(CAMPS_KEY)
    if (!data) {
      uni.setStorageSync(CAMPS_KEY, JSON.stringify(BUILT_IN_CAMPS))
      return BUILT_IN_CAMPS
    }
    return JSON.parse(data)
  } catch (e) {
    return BUILT_IN_CAMPS
  }
}

function saveCamps(camps) {
  uni.setStorageSync(CAMPS_KEY, JSON.stringify(camps))
}

function getRegistrations() {
  try {
    const data = uni.getStorageSync(CAMP_REGISTRATIONS_KEY)
    if (!data) {
      uni.setStorageSync(CAMP_REGISTRATIONS_KEY, JSON.stringify([]))
      return []
    }
    return JSON.parse(data)
  } catch (e) {
    return []
  }
}

function saveRegistrations(registrations) {
  uni.setStorageSync(CAMP_REGISTRATIONS_KEY, JSON.stringify(registrations))
}

function getRewards() {
  try {
    const data = uni.getStorageSync(CAMP_REWARDS_KEY)
    if (!data) {
      uni.setStorageSync(CAMP_REWARDS_KEY, JSON.stringify(BUILT_IN_REWARDS))
      return BUILT_IN_REWARDS
    }
    return JSON.parse(data)
  } catch (e) {
    return BUILT_IN_REWARDS
  }
}

function saveRewards(rewards) {
  uni.setStorageSync(CAMP_REWARDS_KEY, JSON.stringify(rewards))
}

function getCampActivities(campId) {
  try {
    const data = uni.getStorageSync(`${CAMP_ACTIVITIES_KEY}_${campId}`)
    if (!data) {
      return []
    }
    return JSON.parse(data)
  } catch (e) {
    return []
  }
}

function saveCampActivities(campId, activities) {
  uni.setStorageSync(`${CAMP_ACTIVITIES_KEY}_${campId}`, JSON.stringify(activities))
}

// ==================== 俱乐部函数 ====================

/**
 * 获取所有周末营
 */
export function getCampsList(filter = {}) {
  let camps = getCamps()
  
  if (filter.type) {
    camps = camps.filter(c => c.type === filter.type)
  }
  if (filter.status) {
    camps = camps.filter(c => c.status === filter.status)
  }
  if (filter.ageRange) {
    camps = camps.filter(c => {
      const [min, max] = c.ageRange.split('-').map(Number)
      const target = parseInt(filter.ageRange)
      return target >= min && target <= max
    })
  }
  
  return camps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

/**
 * 获取周末营详情
 */
export function getCampById(campId) {
  const camps = getCamps()
  return camps.find(c => c.id === campId) || null
}

/**
 * 创建周末营活动
 */
export function createCamp(campData) {
  const camps = getCamps()
  const newCamp = {
    id: generateId('camp'),
    ...campData,
    enrolledCount: 0,
    status: CAMP_STATUS.UPCOMING,
    createdAt: now()
  }
  camps.unshift(newCamp)
  saveCamps(camps)
  return newCamp
}

/**
 * 更新周末营
 */
export function updateCamp(campId, updates) {
  const camps = getCamps()
  const index = camps.findIndex(c => c.id === campId)
  if (index === -1) return null
  
  camps[index] = { ...camps[index], ...updates }
  saveCamps(camps)
  return camps[index]
}

/**
 * 删除周末营
 */
export function deleteCamp(campId) {
  const camps = getCamps()
  const filtered = camps.filter(c => c.id !== campId)
  if (filtered.length === camps.length) return false
  saveCamps(filtered)
  return true
}

/**
 * 获取推荐周末营
 */
export function getRecommendedCamps(currentBabyId = null) {
  const camps = getCamps()
  const registrations = getRegistrations()
  const myCampIds = registrations
    .filter(r => r.babyId === currentBabyId)
    .map(r => r.campId)
  
  return camps
    .filter(c => !myCampIds.includes(c.id) && c.status === CAMP_STATUS.REGISTRATION)
    .slice(0, 5)
}

// ==================== 报名函数 ====================

/**
 * 获取报名列表
 */
export function getRegistrationsList(filter = {}) {
  let registrations = getRegistrations()
  
  if (filter.babyId) {
    registrations = registrations.filter(r => r.babyId === filter.babyId)
  }
  if (filter.campId) {
    registrations = registrations.filter(r => r.campId === filter.campId)
  }
  if (filter.status) {
    registrations = registrations.filter(r => r.status === filter.status)
  }
  
  return registrations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

/**
 * 获取宝宝的报名记录
 */
export function getMyRegistrations(babyId) {
  return getRegistrationsList({ babyId })
}

/**
 * 报名参加周末营
 */
export function registerForCamp(campId, babyId, babyName) {
  const registrations = getRegistrations()
  
  // 检查是否已报名
  const existing = registrations.find(
    r => r.campId === campId && r.babyId === babyId && r.status !== REGISTRATION_STATUS.CANCELLED
  )
  if (existing) {
    throw new Error('您已报名此活动')
  }
  
  // 检查容量
  const camp = getCampById(campId)
  if (!camp) {
    throw new Error('活动不存在')
  }
  if (camp.enrolledCount >= camp.capacity) {
    throw new Error('报名已满')
  }
  
  const newRegistration = {
    id: generateId('reg'),
    campId,
    babyId,
    babyName,
    status: REGISTRATION_STATUS.PENDING,
    registeredAt: now(),
    createdAt: now()
  }
  
  registrations.push(newRegistration)
  saveRegistrations(registrations)
  
  // 更新活动报名人数
  updateCamp(campId, { enrolledCount: camp.enrolledCount + 1 })
  
  return newRegistration
}

/**
 * 取消报名
 */
export function cancelRegistration(registrationId) {
  const registrations = getRegistrations()
  const index = registrations.findIndex(r => r.id === registrationId)
  if (index === -1) return false
  
  const registration = registrations[index]
  registration.status = REGISTRATION_STATUS.CANCELLED
  registration.cancelledAt = now()
  
  saveRegistrations(registrations)
  
  // 更新活动报名人数
  const camp = getCampById(registration.campId)
  if (camp) {
    updateCamp(registration.campId, { enrolledCount: Math.max(0, camp.enrolledCount - 1) })
  }
  
  return true
}

/**
 * 确认报名
 */
export function confirmRegistration(registrationId) {
  const registrations = getRegistrations()
  const index = registrations.findIndex(r => r.id === registrationId)
  if (index === -1) return null
  
  registrations[index].status = REGISTRATION_STATUS.CONFIRMED
  saveRegistrations(registrations)
  
  return registrations[index]
}

/**
 * 标记已参加
 */
export function markAttended(registrationId) {
  const registrations = getRegistrations()
  const index = registrations.findIndex(r => r.id === registrationId)
  if (index === -1) return null
  
  registrations[index].status = REGISTRATION_STATUS.ATTENDED
  registrations[index].attendedAt = now()
  saveRegistrations(registrations)
  
  return registrations[index]
}

// ==================== 奖励函数 ====================

/**
 * 获取奖励配置
 */
export function getRewardConfigs() {
  return getRewards()
}

/**
 * 获取宝宝的周末营奖励
 */
export function getBabyRewards(babyId) {
  try {
    const data = uni.getStorageSync(`${CAMP_REWARDS_KEY}_${babyId}`)
    if (!data) return []
    return JSON.parse(data)
  } catch (e) {
    return []
  }
}

/**
 * 记录宝宝获得的奖励
 */
export function addBabyReward(babyId, rewardData) {
  try {
    const rewards = getBabyRewards(babyId)
    const newReward = {
      id: generateId('breward'),
      babyId,
      ...rewardData,
      earnedAt: now()
    }
    rewards.push(newReward)
    uni.setStorageSync(`${CAMP_REWARDS_KEY}_${babyId}`, JSON.stringify(rewards))
    return newReward
  } catch (e) {
    return null
  }
}

/**
 * 检查并发放奖励
 */
export function checkAndGrantRewards(babyId) {
  const registrations = getMyRegistrations(babyId)
  const attendedCamps = registrations.filter(r => r.status === REGISTRATION_STATUS.ATTENDED)
  
  const rewards = []
  
  // 检查户外探索徽章
  const outdoorCamps = attendedCamps.filter(r => {
    const camp = getCampById(r.campId)
    return camp && camp.type === CAMP_ACTIVITY_TYPE.OUTDOOR_EXPLORATION
  })
  if (outdoorCamps.length >= 3) {
    const badge = {
      type: REWARD_TYPE.BADGE,
      badgeId: 'outdoor_explorer',
      name: '户外探索家',
      icon: '🏅',
      description: '完成3次户外探索活动'
    }
    const existing = getBabyRewards(babyId).find(
      r => r.badgeId === 'outdoor_explorer'
    )
    if (!existing) {
      rewards.push(addBabyReward(babyId, badge))
    }
  }
  
  // 检查创意工坊徽章
  const creativeCamps = attendedCamps.filter(r => {
    const camp = getCampById(r.campId)
    return camp && camp.type === CAMP_ACTIVITY_TYPE.CREATIVE_WORKSHOP
  })
  if (creativeCamps.length >= 5) {
    const badge = {
      type: REWARD_TYPE.BADGE,
      badgeId: 'creative_master',
      name: '创意小达人',
      icon: '🎨',
      description: '完成5次创意工坊活动'
    }
    const existing = getBabyRewards(babyId).find(
      r => r.badgeId === 'creative_master'
    )
    if (!existing) {
      rewards.push(addBabyReward(babyId, badge))
    }
  }
  
  // 检查社交派对徽章
  const socialCamps = attendedCamps.filter(r => {
    const camp = getCampById(r.campId)
    return camp && camp.type === CAMP_ACTIVITY_TYPE.SOCIAL_PARTY
  })
  if (socialCamps.length >= 3) {
    const badge = {
      type: REWARD_TYPE.BADGE,
      badgeId: 'social_star',
      name: '社交小明星',
      icon: '⭐',
      description: '参加3次社交派对活动'
    }
    const existing = getBabyRewards(babyId).find(
      r => r.badgeId === 'social_star'
    )
    if (!existing) {
      rewards.push(addBabyReward(babyId, badge))
    }
  }
  
  return rewards.filter(Boolean)
}

/**
 * 获取宝宝的总积分
 */
export function getBabyCampPoints(babyId) {
  const registrations = getMyRegistrations(babyId)
  let totalPoints = 0
  
  registrations.forEach(reg => {
    if (reg.status === REGISTRATION_STATUS.ATTENDED) {
      const camp = getCampById(reg.campId)
      if (camp) {
        totalPoints += camp.points || 0
      }
    }
  })
  
  // 加上获得的积分奖励
  const babyRewards = getBabyRewards(babyId)
  const pointsRewards = babyRewards.filter(r => r.type === REWARD_TYPE.POINTS)
  pointsRewards.forEach(r => {
    totalPoints += r.points || 0
  })
  
  return totalPoints
}

// ==================== 分享函数 ====================

/**
 * 创建分享记录
 */
export function createShare(campId, babyId, shareData) {
  try {
    const shares = []
    const data = uni.getStorageSync(CAMP_SHARES_KEY)
    if (data) {
      shares.push(...JSON.parse(data))
    }
    
    const newShare = {
      id: generateId('share'),
      campId,
      babyId,
      ...shareData,
      createdAt: now()
    }
    
    shares.push(newShare)
    uni.setStorageSync(CAMP_SHARES_KEY, JSON.stringify(shares))
    return newShare
  } catch (e) {
    return null
  }
}

/**
 * 获取分享记录
 */
export function getShares(filter = {}) {
  try {
    const data = uni.getStorageSync(CAMP_SHARES_KEY)
    if (!data) return []
    
    let shares = JSON.parse(data)
    
    if (filter.campId) {
      shares = shares.filter(s => s.campId === filter.campId)
    }
    if (filter.babyId) {
      shares = shares.filter(s => s.babyId === filter.babyId)
    }
    
    return shares.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (e) {
    return []
  }
}

export default {
  // 活动类型
  CAMP_ACTIVITY_TYPE,
  // 活动状态
  CAMP_STATUS,
  // 报名状态
  REGISTRATION_STATUS,
  // 奖励类型
  REWARD_TYPE,
  // 周末营操作
  getCampsList,
  getCampById,
  createCamp,
  updateCamp,
  deleteCamp,
  getRecommendedCamps,
  // 报名操作
  getRegistrationsList,
  getMyRegistrations,
  registerForCamp,
  cancelRegistration,
  confirmRegistration,
  markAttended,
  // 奖励操作
  getRewardConfigs,
  getBabyRewards,
  addBabyReward,
  checkAndGrantRewards,
  getBabyCampPoints,
  // 分享操作
  createShare,
  getShares
}
