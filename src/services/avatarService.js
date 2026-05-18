/**
 * V53 Avatar Service
 * 个性化虚拟形象服务 - 自定义头像、换装、表情动作、成就解锁
 */

// 存储键
const AVATAR_DATA_KEY = 'avatar_data'
const AVATAR_WARDROBE_KEY = 'avatar_wardrobe'
const AVATAR_ACHIEVEMENTS_KEY = 'avatar_achievements'

// 脸型配置
export const FACE_SHAPES = {
  round: { id: 'round', name: '圆润', icon: '○', color: '#FFD9B3' },
  oval: { id: 'oval', name: '椭圆', icon: '◯', color: '#FFE4C4' },
  square: { id: 'square', name: '方正', icon: '□', color: '#DEB887' },
  heart: { id: 'heart', name: '心形', icon: '♡', color: '#FFC0CB' }
}

// 发型配置
export const HAIR_STYLES = {
  short: { id: 'short', name: '短发', icon: '👦', unlockLevel: 1 },
  long: { id: 'long', name: '长发', icon: '👧', unlockLevel: 1 },
  curly: { id: 'curly', name: '卷发', icon: '🧒', unlockLevel: 3 },
  ponytail: { id: 'ponytail', name: '马尾', icon: '🎀', unlockLevel: 2 },
  bald: { id: 'bald', name: '光头', icon: '👨‍🦲', unlockLevel: 1 }
}

// 肤色配置
export const SKIN_TONES = {
  light: { id: 'light', name: '白皙', color: '#FFE4C4', unlockLevel: 1 },
  medium: { id: 'medium', name: '健康', color: '#DEB887', unlockLevel: 1 },
  tan: { id: 'tan', name: '小麦', color: '#D2691E', unlockLevel: 1 },
  dark: { id: 'dark', name: '深色', color: '#8B4513', unlockLevel: 1 }
}

// 眼睛配置
export const EYE_STYLES = {
  normal: { id: 'normal', name: '普通', icon: '👀', unlockLevel: 1 },
  big: { id: 'big', name: '大眼', icon: '👁️', unlockLevel: 2 },
  happy: { id: 'happy', name: '笑眼', icon: '^-^', unlockLevel: 1 },
  cute: { id: 'cute', name: '可爱', icon: '◕‿◕', unlockLevel: 3 }
}

// 配饰配置
export const ACCESSORIES = {
  none: { id: 'none', name: '无', icon: '', unlockLevel: 1, price: 0 },
  hat: { id: 'hat', name: '帽子', icon: '🎅', unlockLevel: 2, price: 100 },
  glasses: { id: 'glasses', name: '眼镜', icon: '👓', unlockLevel: 2, price: 80 },
  scarf: { id: 'scarf', name: '围巾', icon: '🧣', unlockLevel: 3, price: 120 },
  crown: { id: 'crown', name: '皇冠', icon: '👑', unlockLevel: 5, price: 500 },
  bow: { id: 'bow', name: '蝴蝶结', icon: '🎀', unlockLevel: 2, price: 90 }
}

// 服装配置
export const OUTFITS = {
  casual: { id: 'casual', name: '休闲装', icon: '👕', unlockLevel: 1, price: 0, category: 'top' },
  formal: { id: 'formal', name: '正装', icon: '👔', unlockLevel: 2, price: 150, category: 'top' },
  sporty: { id: 'sporty', name: '运动装', icon: '🏃', unlockLevel: 1, price: 0, category: 'top' },
  princess: { id: 'princess', name: '公主裙', icon: '👗', unlockLevel: 4, price: 300, category: 'dress' },
  superhero: { id: 'superhero', name: '超级英雄', icon: '🦸', unlockLevel: 5, price: 400, category: 'top' },
  traditional: { id: 'traditional', name: '传统服饰', icon: '👘', unlockLevel: 3, price: 200, category: 'dress' },
  pajamas: { id: 'pajamas', name: '睡衣', icon: '睡衣', unlockLevel: 1, price: 0, category: 'top' },
  uniform: { id: 'uniform', name: '校服', icon: '🎒', unlockLevel: 1, price: 0, category: 'top' }
}

// 表情配置
export const EXPRESSIONS = {
  happy: { id: 'happy', name: '开心', icon: '😊', animClass: 'bounce', unlockLevel: 1 },
  sad: { id: 'sad', name: '难过', icon: '😢', animClass: 'shake', unlockLevel: 1 },
  excited: { id: 'excited', name: '兴奋', icon: '🤩', animClass: 'spin', unlockLevel: 2 },
  love: { id: 'love', name: '爱心', icon: '😍', animClass: 'pulse', unlockLevel: 2 },
  surprised: { id: 'surprised', name: '惊讶', icon: '😮', animClass: 'jump', unlockLevel: 1 },
  thinking: { id: 'thinking', name: '思考', icon: '🤔', animClass: 'sway', unlockLevel: 3 },
  sleepy: { id: 'sleepy', name: '困倦', icon: '😴', animClass: 'fade', unlockLevel: 1 },
  proud: { id: 'proud', name: '得意', icon: '😎', animClass: 'shine', unlockLevel: 4 }
}

// Avatar 成就定义
export const AVATAR_ACHIEVEMENTS = {
  first_customize: {
    id: 'first_customize',
    name: '形象设计师',
    description: '完成第一次头像自定义',
    icon: '🎨',
    points: 20,
    unlockLevel: 1
  },
  collect_5_outfits: {
    id: 'collect_5_outfits',
    name: '小小衣柜',
    description: '解锁5套服装',
    icon: '👗',
    points: 50,
    unlockLevel: 1
  },
  collect_all_accessories: {
    id: 'collect_all_accessories',
    name: '配饰达人',
    description: '解锁所有配饰',
    icon: '💎',
    points: 100,
    unlockLevel: 5
  },
  avatar_level_5: {
    id: 'avatar_level_5',
    name: '小有名气',
    description: '头像等级达到5级',
    icon: '⭐',
    points: 80,
    unlockLevel: 5
  },
  avatar_level_10: {
    id: 'avatar_level_10',
    name: '明星头像',
    description: '头像等级达到10级',
    icon: '🌟',
    points: 150,
    unlockLevel: 10
  },
  use_all_expressions: {
    id: 'use_all_expressions',
    name: '表情大师',
    description: '使用过所有表情',
    icon: '😁',
    points: 60,
    unlockLevel: 3
  },
  first_wardrobe_item: {
    id: 'first_wardrobe_item',
    name: '购物初体验',
    description: '购买第一件衣柜物品',
    icon: '🛍️',
    points: 30,
    unlockLevel: 1
  },
  royal_style: {
    id: 'royal_style',
    name: '皇室风格',
    description: '解锁皇冠和公主裙',
    icon: '👑',
    points: 100,
    unlockLevel: 5
  }
}

// 获取默认头像数据
export const getDefaultAvatar = () => {
  return {
    id: 'avatar_' + Date.now(),
    faceShape: 'round',
    hairStyle: 'short',
    skinTone: 'light',
    eyeStyle: 'normal',
    accessories: 'none',
    outfit: 'casual',
    expression: 'happy',
    color: '#8477fa',
    level: 1,
    exp: 0,
    totalExp: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// 获取头像数据
export const getAvatarData = () => {
  try {
    const stored = uni.getStorageSync(AVATAR_DATA_KEY)
    return stored ? JSON.parse(stored) : getDefaultAvatar()
  } catch (e) {
    console.error('获取头像数据失败:', e)
    return getDefaultAvatar()
  }
}

// 保存头像数据
export const saveAvatarData = (avatarData) => {
  avatarData.updatedAt = new Date().toISOString()
  uni.setStorageSync(AVATAR_DATA_KEY, JSON.stringify(avatarData))
}

// 获取衣柜数据
export const getWardrobeData = () => {
  try {
    const stored = uni.getStorageSync(AVATAR_WARDROBE_KEY)
    return stored ? JSON.parse(stored) : {
      ownedOutfits: ['casual', 'sporty', 'pajamas', 'uniform'],
      ownedAccessories: ['none'],
      ownedExpressions: ['happy', 'sad', 'surprised', 'sleepy']
    }
  } catch (e) {
    return {
      ownedOutfits: ['casual', 'sporty', 'pajamas', 'uniform'],
      ownedAccessories: ['none'],
      ownedExpressions: ['happy', 'sad', 'surprised', 'sleepy']
    }
  }
}

// 保存衣柜数据
export const saveWardrobeData = (wardrobeData) => {
  uni.setStorageSync(AVATAR_WARDROBE_KEY, JSON.stringify(wardrobeData))
}

// 获取成就数据
export const getAchievementsData = () => {
  try {
    const stored = uni.getStorageSync(AVATAR_ACHIEVEMENTS_KEY)
    return stored ? JSON.parse(stored) : {
      unlockedAchievements: [],
      totalPoints: 0
    }
  } catch (e) {
    return {
      unlockedAchievements: [],
      totalPoints: 0
    }
  }
}

// 保存成就数据
export const saveAchievementsData = (achievementsData) => {
  uni.setStorageSync(AVATAR_ACHIEVEMENTS_KEY, JSON.stringify(achievementsData))
}

// 解锁成就
export const unlockAchievement = (achievementId) => {
  const achievementsData = getAchievementsData()
  const achievement = AVATAR_ACHIEVEMENTS[achievementId]
  
  if (!achievement || achievementsData.unlockedAchievements.includes(achievementId)) {
    return { unlocked: false, achievement: null }
  }
  
  achievementsData.unlockedAchievements.push(achievementId)
  achievementsData.totalPoints += achievement.points
  
  saveAchievementsData(achievementsData)
  
  return { unlocked: true, achievement }
}

// 检查成就条件
export const checkAchievements = (avatarData, wardrobeData) => {
  const results = []
  
  // 第一次自定义
  if (avatarData.faceShape || avatarData.hairStyle) {
    const result = unlockAchievement('first_customize')
    if (result.unlocked) results.push(result.achievement)
  }
  
  // 解锁5套服装
  if (wardrobeData.ownedOutfits.length >= 5) {
    const result = unlockAchievement('collect_5_outfits')
    if (result.unlocked) results.push(result.achievement)
  }
  
  // 解锁所有配饰
  const allAccessories = Object.keys(ACCESSORIES)
  const hasAllAccessories = allAccessories.every(a => wardrobeData.ownedAccessories.includes(a))
  if (hasAllAccessories) {
    const result = unlockAchievement('collect_all_accessories')
    if (result.unlocked) results.push(result.achievement)
  }
  
  // 头像等级5
  if (avatarData.level >= 5) {
    const result = unlockAchievement('avatar_level_5')
    if (result.unlocked) results.push(result.achievement)
  }
  
  // 头像等级10
  if (avatarData.level >= 10) {
    const result = unlockAchievement('avatar_level_10')
    if (result.unlocked) results.push(result.achievement)
  }
  
  // 使用所有表情
  const allExpressions = Object.keys(EXPRESSIONS)
  const usedAllExpressions = allExpressions.every(e => wardrobeData.ownedExpressions.includes(e))
  if (usedAllExpressions) {
    const result = unlockAchievement('use_all_expressions')
    if (result.unlocked) results.push(result.achievement)
  }
  
  // 皇室风格
  if (wardrobeData.ownedAccessories.includes('crown') && wardrobeData.ownedOutfits.includes('princess')) {
    const result = unlockAchievement('royal_style')
    if (result.unlocked) results.push(result.achievement)
  }
  
  return results
}

// 购买物品
export const purchaseItem = (itemType, itemId) => {
  const wardrobeData = getWardrobeData()
  const avatarData = getAvatarData()
  
  let item, ownedList
  if (itemType === 'outfit') {
    item = OUTFITS[itemId]
    ownedList = wardrobeData.ownedOutfits
  } else if (itemType === 'accessory') {
    item = ACCESSORIES[itemId]
    ownedList = wardrobeData.ownedAccessories
  } else if (itemType === 'expression') {
    item = EXPRESSIONS[itemId]
    ownedList = wardrobeData.ownedExpressions
  }
  
  if (!item) return { success: false, message: '物品不存在' }
  if (ownedList.includes(itemId)) return { success: false, message: '已拥有该物品' }
  if (avatarData.level < item.unlockLevel) return { success: false, message: `需要等级${item.unlockLevel}才能解锁` }
  
  // 检查是否第一次购买
  const wasEmpty = ownedList.length === (itemType === 'accessory' && itemId === 'none' ? 1 : 0)
  
  if (itemType === 'outfit') {
    wardrobeData.ownedOutfits.push(itemId)
  } else if (itemType === 'accessory') {
    wardrobeData.ownedAccessories.push(itemId)
  } else if (itemType === 'expression') {
    wardrobeData.ownedExpressions.push(itemId)
  }
  
  saveWardrobeData(wardrobeData)
  
  // 检查首次购买成就
  if (wasEmpty) {
    const result = unlockAchievement('first_wardrobe_item')
    if (result.unlocked) {
      return { success: true, message: '购买成功！', newAchievement: result.achievement }
    }
  }
  
  // 检查其他成就
  const newAchievements = checkAchievements(avatarData, wardrobeData)
  
  return { success: true, message: '购买成功！', newAchievements }
}

// 添加经验值
export const addExp = (amount) => {
  const avatarData = getAvatarData()
  avatarData.exp += amount
  avatarData.totalExp += amount
  
  // 计算等级 (每100经验一级)
  const newLevel = Math.floor(avatarData.totalExp / 100) + 1
  const leveledUp = newLevel > avatarData.level
  
  if (leveledUp) {
    avatarData.level = newLevel
  }
  
  saveAvatarData(avatarData)
  
  // 检查等级相关成就
  const wardrobeData = getWardrobeData()
  const newAchievements = checkAchievements(avatarData, wardrobeData)
  
  return {
    avatarData,
    leveledUp,
    newLevel,
    newAchievements
  }
}

// 更新头像外观
export const updateAvatar = (updates) => {
  const avatarData = getAvatarData()
  Object.assign(avatarData, updates)
  saveAvatarData(avatarData)
  return avatarData
}

// 设置表情
export const setExpression = (expressionId) => {
  const wardrobeData = getWardrobeData()
  
  if (!wardrobeData.ownedExpressions.includes(expressionId)) {
    return { success: false, message: '未解锁该表情' }
  }
  
  const avatarData = getAvatarData()
  avatarData.expression = expressionId
  saveAvatarData(avatarData)
  
  return { success: true, avatarData }
}

// 获取表情动画
export const getExpressionAnimation = (expressionId) => {
  const expression = EXPRESSIONS[expressionId]
  return expression ? expression.animClass : ''
}

export default {
  FACE_SHAPES,
  HAIR_STYLES,
  SKIN_TONES,
  EYE_STYLES,
  ACCESSORIES,
  OUTFITS,
  EXPRESSIONS,
  AVATAR_ACHIEVEMENTS,
  getDefaultAvatar,
  getAvatarData,
  saveAvatarData,
  getWardrobeData,
  saveWardrobeData,
  getAchievementsData,
  saveAchievementsData,
  unlockAchievement,
  checkAchievements,
  purchaseItem,
  addExp,
  updateAvatar,
  setExpression,
  getExpressionAnimation
}
