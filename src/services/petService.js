/**
 * V51 Pet Service
 * 虚拟宠物服务 - 宠物领养、喂养、进化
 */

// 存储键
const PET_DATA_KEY = 'pet_data'
const PET_STATS_KEY = 'pet_stats'

// 宠物类型配置
export const PET_TYPES = {
  cat: { id: 'cat', name: '猫咪', icon: '🐱', color: '#FFB347' },
  dog: { id: 'dog', name: '小狗', icon: '🐶', color: '#87CEEB' },
  rabbit: { id: 'rabbit', name: '小兔子', icon: '🐰', color: '#FFB6C1' },
  dragon: { id: 'dragon', name: '小龙', icon: '🐉', color: '#DDA0DD' }
}

// 宠物进化阶段
export const EVOLUTION_STAGES = {
  baby: { id: 'baby', name: '宝宝', minExp: 0, iconSuffix: '' },
  child: { id: 'child', name: '幼年', minExp: 100, iconSuffix: '' },
  adult: { id: 'adult', name: '成年', minExp: 300, iconSuffix: '' },
  teen: { id: 'teen', name: '少年', minExp: 600, iconSuffix: '' },
  elder: { id: 'elder', name: '老年', minExp: 1000, iconSuffix: '' }
}

// 宠物状态
export const PET_STATES = {
  normal: { id: 'normal', name: '正常', icon: '😊' },
  happy: { id: 'happy', name: '开心', icon: '😊' },
  sad: { id: 'sad', name: '难过', icon: '😢' },
  sick: { id: 'sick', name: '生病', icon: '🤒' },
  sleeping: { id: 'sleeping', name: '睡觉', icon: '😴' },
  playing: { id: 'playing', name: '玩耍', icon: '🎮' },
  hungry: { id: 'hungry', name: '饿了', icon: '🍖' },
  dirty: { id: 'dirty', name: '脏了', icon: '😷' }
}

// 获取宠物类型
export const getPetType = (typeId) => {
  return PET_TYPES[typeId] || PET_TYPES.cat
}

// 获取进化阶段
export const getEvolutionStage = (exp) => {
  const stages = Object.values(EVOLUTION_STAGES).sort((a, b) => b.minExp - a.minExp)
  return stages.find(stage => exp >= stage.minExp) || EVOLUTION_STAGES.baby
}

// 获取宠物数据
export const getPetData = () => {
  try {
    const stored = uni.getStorageSync(PET_DATA_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (e) {
    console.error('获取宠物数据失败:', e)
    return null
  }
}

// 保存宠物数据
export const savePetData = (petData) => {
  uni.setStorageSync(PET_DATA_KEY, JSON.stringify(petData))
}

// 创建新宠物
export const createPet = (typeId, name) => {
  const petType = getPetType(typeId)
  const petData = {
    id: 'pet_' + Date.now(),
    typeId,
    name,
    typeName: petType.name,
    icon: petType.icon,
    color: petType.color,
    exp: 0,
    level: 1,
    stage: 'baby',
    state: 'happy',
    createdAt: new Date().toISOString(),
    lastFedAt: new Date().toISOString(),
    lastPlayedAt: new Date().toISOString(),
    lastCleanedAt: new Date().toISOString(),
    evolutionHistory: []
  }
  savePetData(petData)
  initPetStats(petData.id)
  return petData
}

// 初始化宠物属性
export const initPetStats = (petId) => {
  const stats = {
    petId,
    hunger: 100,       // 饥饿度 0-100
    mood: 100,         // 心情 0-100
    health: 100,       // 健康 0-100
    cleanliness: 100,  // 清洁度 0-100
    exp: 0,            // 经验值
    totalDays: 0,      // 养育天数
    taskCount: 0       // 完成任务数
  }
  uni.setStorageSync(PET_STATS_KEY, JSON.stringify(stats))
  return stats
}

// 获取宠物属性
export const getPetStats = () => {
  try {
    const stored = uni.getStorageSync(PET_STATS_KEY)
    return stored ? JSON.parse(stored) : initPetStats(null)
  } catch (e) {
    return initPetStats(null)
  }
}

// 保存宠物属性
export const savePetStats = (stats) => {
  uni.setStorageSync(PET_STATS_KEY, JSON.stringify(stats))
}

// 喂养宠物
export const feedPet = (foodType = 'normal') => {
  const stats = getPetStats()
  const petData = getPetData()
  if (!petData || !stats) return null

  const foodValues = {
    normal: 20,
    premium: 40,
    special: 60
  }
  
  stats.hunger = Math.min(100, stats.hunger + (foodValues[foodType] || 20))
  petData.lastFedAt = new Date().toISOString()
  
  // 心情也会提升
  stats.mood = Math.min(100, stats.mood + 5)
  
  savePetStats(stats)
  savePetData(petData)
  
  // 检查进化
  checkEvolution(petData, stats)
  
  return { stats, petData }
}

// 与宠物玩耍
export const playWithPet = () => {
  const stats = getPetStats()
  const petData = getPetData()
  if (!petData || !stats) return null

  stats.mood = Math.min(100, stats.mood + 25)
  stats.hunger = Math.max(0, stats.hunger - 10) // 玩耍会饿
  petData.lastPlayedAt = new Date().toISOString()
  
  // 增加经验
  addExp(petData, stats, 10)
  
  savePetStats(stats)
  savePetData(petData)
  
  return { stats, petData }
}

// 清洁宠物
export const cleanPet = () => {
  const stats = getPetStats()
  const petData = getPetData()
  if (!petData || !stats) return null

  stats.cleanliness = Math.min(100, stats.cleanliness + 40)
  petData.lastCleanedAt = new Date().toISOString()
  
  savePetStats(stats)
  savePetData(petData)
  
  return { stats, petData }
}

// 治疗宠物
export const healPet = () => {
  const stats = getPetStats()
  const petData = getPetData()
  if (!petData || !stats) return null

  stats.health = Math.min(100, stats.health + 50)
  petData.state = 'happy'
  
  savePetStats(stats)
  savePetData(petData)
  
  return { stats, petData }
}

// 添加经验值
export const addExp = (petData, stats, amount) => {
  if (!petData || !stats) return
  
  stats.exp += amount
  petData.exp = stats.exp
  
  // 检查升级
  const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2100]
  const newLevel = levelThresholds.filter(t => stats.exp >= t).length
  if (newLevel > petData.level) {
    petData.level = newLevel
  }
  
  // 检查进化
  checkEvolution(petData, stats)
}

// 检查进化
export const checkEvolution = (petData, stats) => {
  if (!petData || !stats) return
  
  const currentStage = getEvolutionStage(petData.exp)
  if (currentStage.id !== petData.stage) {
    const oldStage = petData.stage
    petData.stage = currentStage.id
    
    // 记录进化历史
    petData.evolutionHistory.push({
      from: oldStage,
      to: currentStage.id,
      at: new Date().toISOString()
    })
    
    savePetData(petData)
    
    return { evolved: true, oldStage, newStage: currentStage.id }
  }
  
  return { evolved: false }
}

// 更新宠物状态
export const updatePetState = () => {
  const stats = getPetStats()
  const petData = getPetData()
  if (!petData || !stats) return petData

  // 根据属性计算状态
  if (stats.health < 30) {
    petData.state = 'sick'
  } else if (stats.hunger < 30) {
    petData.state = 'hungry'
  } else if (stats.mood < 30) {
    petData.state = 'sad'
  } else if (stats.cleanliness < 30) {
    petData.state = 'dirty'
  } else if (stats.mood > 80) {
    petData.state = 'happy'
  } else {
    petData.state = 'normal'
  }
  
  savePetData(petData)
  return petData
}

// 完成任务后调用，增加经验
export const onTaskCompleted = () => {
  const stats = getPetStats()
  const petData = getPetData()
  if (!petData || !stats) return

  stats.taskCount++
  addExp(petData, stats, 20)
  
  // 心情提升
  stats.mood = Math.min(100, stats.mood + 10)
  
  savePetStats(stats)
  savePetData(petData)
  
  return { stats, petData }
}

// 连续登录奖励
export const onDailyLogin = () => {
  const stats = getPetStats()
  const petData = getPetData()
  if (!petData || !stats) return

  stats.totalDays++
  addExp(petData, stats, 15)
  
  savePetStats(stats)
  savePetData(petData)
  
  return { stats, petData }
}

// 获取进化路线信息
export const getEvolutionPath = (typeId) => {
  const petType = getPetType(typeId)
  return {
    type: petType,
    stages: [
      { ...EVOLUTION_STAGES.baby, icon: petType.icon, expRequired: 0 },
      { ...EVOLUTION_STAGES.child, icon: petType.icon, expRequired: 100 },
      { ...EVOLUTION_STAGES.teen, icon: petType.icon, expRequired: 300 },
      { ...EVOLUTION_STAGES.adult, icon: petType.icon, expRequired: 600 },
      { ...EVOLUTION_STAGES.elder, icon: petType.icon, expRequired: 1000 }
    ]
  }
}

// 删除宠物
export const deletePet = () => {
  uni.removeStorageSync(PET_DATA_KEY)
  uni.removeStorageSync(PET_STATS_KEY)
}

export default {
  PET_TYPES,
  EVOLUTION_STAGES,
  PET_STATES,
  getPetType,
  getEvolutionStage,
  getPetData,
  savePetData,
  createPet,
  initPetStats,
  getPetStats,
  savePetStats,
  feedPet,
  playWithPet,
  cleanPet,
  healPet,
  addExp,
  checkEvolution,
  updatePetState,
  onTaskCompleted,
  onDailyLogin,
  getEvolutionPath,
  deletePet
}
