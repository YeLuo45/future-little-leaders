/**
 * V90 Dream Journal Service
 * 梦想日记系统 - 梦想清单、愿景板、目标追踪
 */

// ==================== 常量定义 ====================

// 梦想状态
export const DREAM_STATUS = {
  ACTIVE: 'active',           // 进行中
  COMPLETED: 'completed',      // 已完成
  ABANDONED: 'abandoned'       // 已放弃
}

// 梦想分类
export const DREAM_CATEGORY = {
  EDUCATION: 'education',     // 教育成长
  CAREER: 'career',           // 职业发展
  HEALTH: 'health',           // 健康运动
  TRAVEL: 'travel',           // 旅游出行
  SKILL: 'skill',             // 技能学习
  FAMILY: 'family',           // 家庭生活
  HOBBY: 'hobby',             // 兴趣爱好
  OTHER: 'other'              // 其他
}

// 梦想分类信息
export const DREAM_CATEGORY_INFO = {
  [DREAM_CATEGORY.EDUCATION]: { label: '教育成长', emoji: '📚', color: '#4A90D9' },
  [DREAM_CATEGORY.CAREER]: { label: '职业发展', emoji: '💼', color: '#FF9800' },
  [DREAM_CATEGORY.HEALTH]: { label: '健康运动', emoji: '🏃', color: '#4CAF50' },
  [DREAM_CATEGORY.TRAVEL]: { label: '旅游出行', emoji: '✈️', color: '#00BCD4' },
  [DREAM_CATEGORY.SKILL]: { label: '技能学习', emoji: '🎯', color: '#9C27B0' },
  [DREAM_CATEGORY.FAMILY]: { label: '家庭生活', emoji: '🏠', color: '#E91E63' },
  [DREAM_CATEGORY.HOBBY]: { label: '兴趣爱好', emoji: '🎨', color: '#FF5722' },
  [DREAM_CATEGORY.OTHER]: { label: '其他', emoji: '⭐', color: '#607D8B' }
}

// 里程碑状态
export const MILESTONE_STATUS = {
  PENDING: 'pending',         // 待完成
  IN_PROGRESS: 'in_progress', // 进行中
  COMPLETED: 'completed'      // 已完成
}

// localStorage keys
const DREAMS_KEY = 'dream_journal_dreams'
const MILESTONES_KEY = 'dream_journal_milestones'
const VISION_IMAGES_KEY = 'dream_journal_vision_images'

// ==================== 辅助函数 ====================

function generateId(prefix = 'dream') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`
}

function now() {
  return new Date().toISOString()
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// ==================== 内置梦想数据 ====================

const BUILT_IN_DREAMS = [
  {
    id: 'dream_1',
    title: '学会游泳',
    description: '掌握四种泳姿，能够连续游200米',
    category: DREAM_CATEGORY.HEALTH,
    coverImage: '',
    targetDate: '2026-12-31',
    status: DREAM_STATUS.ACTIVE,
    progress: 30,
    tags: ['运动', '技能'],
    images: [],
    createdAt: now()
  },
  {
    id: 'dream_2',
    title: '环游中国',
    description: '在小学毕业前走访10个省份，了解各地风土人情',
    category: DREAM_CATEGORY.TRAVEL,
    coverImage: '',
    targetDate: '2028-06-01',
    status: DREAM_STATUS.ACTIVE,
    progress: 20,
    tags: ['旅行', '探索'],
    images: [],
    createdAt: now()
  },
  {
    id: 'dream_3',
    title: '钢琴考级',
    description: '通过钢琴八级考试，能演奏经典曲目',
    category: DREAM_CATEGORY.SKILL,
    coverImage: '',
    targetDate: '2027-08-01',
    status: DREAM_STATUS.ACTIVE,
    progress: 45,
    tags: ['音乐', '考级'],
    images: [],
    createdAt: now()
  }
]

const BUILT_IN_MILESTONES = [
  {
    id: 'ms_1',
    dreamId: 'dream_1',
    title: '克服恐水心理',
    description: '能够不带泳圈在浅水区站立',
    status: MILESTONE_STATUS.COMPLETED,
    completedAt: now(),
    createdAt: now()
  },
  {
    id: 'ms_2',
    dreamId: 'dream_1',
    title: '学会自由泳',
    description: '掌握自由泳基本动作，能游25米',
    status: MILESTONE_STATUS.IN_PROGRESS,
    completedAt: null,
    createdAt: now()
  },
  {
    id: 'ms_3',
    dreamId: 'dream_2',
    title: '北京之旅',
    description: '参观故宫、长城、颐和园',
    status: MILESTONE_STATUS.COMPLETED,
    completedAt: now(),
    createdAt: now()
  },
  {
    id: 'ms_4',
    dreamId: 'dream_2',
    title: '江南之行',
    description: '游览苏州、杭州、西塘古镇',
    status: MILESTONE_STATUS.PENDING,
    completedAt: null,
    createdAt: now()
  }
]

// ==================== 存储操作函数 ====================

function getDreams() {
  try {
    const data = uni.getStorageSync(DREAMS_KEY)
    if (!data) {
      uni.setStorageSync(DREAMS_KEY, JSON.stringify(BUILT_IN_DREAMS))
      return BUILT_IN_DREAMS
    }
    return JSON.parse(data)
  } catch (e) {
    return BUILT_IN_DREAMS
  }
}

function saveDreams(dreams) {
  uni.setStorageSync(DREAMS_KEY, JSON.stringify(dreams))
}

function getMilestones() {
  try {
    const data = uni.getStorageSync(MILESTONES_KEY)
    if (!data) {
      uni.setStorageSync(MILESTONES_KEY, JSON.stringify(BUILT_IN_MILESTONES))
      return BUILT_IN_MILESTONES
    }
    return JSON.parse(data)
  } catch (e) {
    return BUILT_IN_MILESTONES
  }
}

function saveMilestones(milestones) {
  uni.setStorageSync(MILESTONES_KEY, JSON.stringify(milestones))
}

function getVisionImages() {
  try {
    const data = uni.getStorageSync(VISION_IMAGES_KEY)
    if (!data) {
      uni.setStorageSync(VISION_IMAGES_KEY, JSON.stringify([]))
      return []
    }
    return JSON.parse(data)
  } catch (e) {
    return []
  }
}

function saveVisionImages(images) {
  uni.setStorageSync(VISION_IMAGES_KEY, JSON.stringify(images))
}

// ==================== 梦想相关函数 ====================

/**
 * 获取所有梦想
 */
export function getDreamsList(filter = {}) {
  let dreams = getDreams()
  
  if (filter.category) {
    dreams = dreams.filter(d => d.category === filter.category)
  }
  if (filter.status) {
    dreams = dreams.filter(d => d.status === filter.status)
  }
  if (filter.babyId) {
    dreams = dreams.filter(d => d.babyId === filter.babyId)
  }
  
  return dreams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

/**
 * 获取梦想详情
 */
export function getDreamById(dreamId) {
  const dreams = getDreams()
  return dreams.find(d => d.id === dreamId) || null
}

/**
 * 创建梦想
 */
export function createDream(dreamData) {
  const dreams = getDreams()
  const newDream = {
    id: generateId('dream'),
    ...dreamData,
    status: DREAM_STATUS.ACTIVE,
    progress: 0,
    images: [],
    createdAt: now()
  }
  dreams.unshift(newDream)
  saveDreams(dreams)
  return newDream
}

/**
 * 更新梦想
 */
export function updateDream(dreamId, updates) {
  const dreams = getDreams()
  const index = dreams.findIndex(d => d.id === dreamId)
  if (index === -1) return null
  
  dreams[index] = { ...dreams[index], ...updates }
  saveDreams(dreams)
  return dreams[index]
}

/**
 * 删除梦想
 */
export function deleteDream(dreamId) {
  const dreams = getDreams()
  const filtered = dreams.filter(d => d.id !== dreamId)
  if (filtered.length === dreams.length) return false
  saveDreams(filtered)
  
  // 同时删除关联的里程碑
  const milestones = getMilestones()
  const filteredMilestones = milestones.filter(m => m.dreamId !== dreamId)
  saveMilestones(filteredMilestones)
  
  return true
}

/**
 * 添加图片到梦想
 */
export function addDreamImage(dreamId, imageData) {
  const dreams = getDreams()
  const index = dreams.findIndex(d => d.id === dreamId)
  if (index === -1) return null
  
  const image = {
    id: generateId('img'),
    ...imageData,
    createdAt: now()
  }
  
  dreams[index].images.push(image)
  saveDreams(dreams)
  return image
}

/**
 * 移除梦想图片
 */
export function removeDreamImage(dreamId, imageId) {
  const dreams = getDreams()
  const index = dreams.findIndex(d => d.id === dreamId)
  if (index === -1) return false
  
  dreams[index].images = dreams[index].images.filter(img => img.id !== imageId)
  saveDreams(dreams)
  return true
}

// ==================== 里程碑相关函数 ====================

/**
 * 获取梦想的里程碑
 */
export function getDreamMilestones(dreamId) {
  const milestones = getMilestones()
  return milestones
    .filter(m => m.dreamId === dreamId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

/**
 * 获取所有宝宝的里程碑
 */
export function getAllMilestones(babyId) {
  const dreams = getDreams().filter(d => d.babyId === babyId)
  const dreamIds = dreams.map(d => d.id)
  const milestones = getMilestones()
  return milestones.filter(m => dreamIds.includes(m.dreamId))
}

/**
 * 创建里程碑
 */
export function createMilestone(milestoneData) {
  const milestones = getMilestones()
  const newMilestone = {
    id: generateId('ms'),
    ...milestoneData,
    status: MILESTONE_STATUS.PENDING,
    completedAt: null,
    createdAt: now()
  }
  milestones.push(newMilestone)
  saveMilestones(milestones)
  return newMilestone
}

/**
 * 更新里程碑
 */
export function updateMilestone(milestoneId, updates) {
  const milestones = getMilestones()
  const index = milestones.findIndex(m => m.id === milestoneId)
  if (index === -1) return null
  
  milestones[index] = { ...milestones[index], ...updates }
  saveMilestones(milestones)
  return milestones[index]
}

/**
 * 删除里程碑
 */
export function deleteMilestone(milestoneId) {
  const milestones = getMilestones()
  const filtered = milestones.filter(m => m.id !== milestoneId)
  if (filtered.length === milestones.length) return false
  saveMilestones(filtered)
  return true
}

/**
 * 标记里程碑完成
 */
export function completeMilestone(milestoneId) {
  const milestone = updateMilestone(milestoneId, {
    status: MILESTONE_STATUS.COMPLETED,
    completedAt: now()
  })
  
  if (milestone) {
    // 更新梦想进度
    updateDreamProgress(milestone.dreamId)
  }
  
  return milestone
}

/**
 * 更新梦想进度
 */
export function updateDreamProgress(dreamId) {
  const milestones = getDreamMilestones(dreamId)
  if (milestones.length === 0) return
  
  const completedCount = milestones.filter(m => m.status === MILESTONE_STATUS.COMPLETED).length
  const progress = Math.round((completedCount / milestones.length) * 100)
  
  const dream = getDreamById(dreamId)
  if (dream && progress >= 100) {
    updateDream(dreamId, { progress, status: DREAM_STATUS.COMPLETED })
  } else {
    updateDream(dreamId, { progress })
  }
}

// ==================== 愿景板相关函数 ====================

/**
 * 获取愿景板图片
 */
export function getVisionImagesList(filter = {}) {
  let images = getVisionImages()
  
  if (filter.babyId) {
    images = images.filter(img => img.babyId === filter.babyId)
  }
  if (filter.category) {
    images = images.filter(img => img.category === filter.category)
  }
  
  return images.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

/**
 * 添加愿景板图片
 */
export function addVisionImage(imageData) {
  const images = getVisionImages()
  const newImage = {
    id: generateId('vision'),
    ...imageData,
    createdAt: now()
  }
  images.unshift(newImage)
  saveVisionImages(images)
  return newImage
}

/**
 * 删除愿景板图片
 */
export function deleteVisionImage(imageId) {
  const images = getVisionImages()
  const filtered = images.filter(img => img.id !== imageId)
  if (filtered.length === images.length) return false
  saveVisionImages(filtered)
  return true
}

/**
 * 更新愿景板图片信息
 */
export function updateVisionImage(imageId, updates) {
  const images = getVisionImages()
  const index = images.findIndex(img => img.id === imageId)
  if (index === -1) return null
  
  images[index] = { ...images[index], ...updates }
  saveVisionImages(images)
  return images[index]
}

// ==================== 统计数据 ====================

/**
 * 获取梦想统计
 */
export function getDreamStatistics(babyId) {
  const dreams = getDreams().filter(d => d.babyId === babyId)
  const milestones = getAllMilestones(babyId)
  
  const activeCount = dreams.filter(d => d.status === DREAM_STATUS.ACTIVE).length
  const completedCount = dreams.filter(d => d.status === DREAM_STATUS.COMPLETED).length
  const totalMilestones = milestones.length
  const completedMilestones = milestones.filter(m => m.status === MILESTONE_STATUS.COMPLETED).length
  
  // 按分类统计
  const byCategory = {}
  Object.values(DREAM_CATEGORY).forEach(cat => {
    const catDreams = dreams.filter(d => d.category === cat)
    byCategory[cat] = {
      total: catDreams.length,
      completed: catDreams.filter(d => d.status === DREAM_STATUS.COMPLETED).length
    }
  })
  
  return {
    totalDreams: dreams.length,
    activeCount,
    completedCount,
    totalMilestones,
    completedMilestones,
    completionRate: dreams.length > 0 ? Math.round((completedCount / dreams.length) * 100) : 0,
    byCategory
  }
}

// ==================== 导出所有常量 ====================

export default {
  DREAM_STATUS,
  DREAM_CATEGORY,
  DREAM_CATEGORY_INFO,
  MILESTONE_STATUS,
  getDreamsList,
  getDreamById,
  createDream,
  updateDream,
  deleteDream,
  addDreamImage,
  removeDreamImage,
  getDreamMilestones,
  getAllMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  completeMilestone,
  getVisionImagesList,
  addVisionImage,
  deleteVisionImage,
  updateVisionImage,
  getDreamStatistics
}
