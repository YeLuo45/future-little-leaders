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

// 宠物技能类型
export const PET_SKILL_TYPES = {
  // 攻击技能
  bite: { id: 'bite', name: '撕咬', type: 'attack', icon: '🦷', basePower: 10, description: '基础攻击技能' },
  scratch: { id: 'scratch', name: '抓挠', type: 'attack', icon: '🐾', basePower: 12, description: '快速攻击技能' },
  fireBreath: { id: 'fireBreath', name: '火焰吐息', type: 'attack', icon: '🔥', basePower: 25, description: '强力火系技能' },
  
  // 防御技能
  defend: { id: 'defend', name: '防御', type: 'defense', icon: '🛡️', basePower: 8, description: '减少受到的伤害' },
  shell: { id: 'shell', name: '龟壳', type: 'defense', icon: '🐢', basePower: 15, description: '强力防御技能' },
  
  // 辅助技能
  heal: { id: 'heal', name: '治愈', type: 'support', icon: '💚', basePower: 20, description: '恢复生命值' },
  cheer: { id: 'cheer', name: '鼓舞', type: 'support', icon: '✨', basePower: 15, description: '提升队友心情' },
  shield: { id: 'shield', name: '护盾', type: 'support', icon: '🔮', basePower: 12, description: '为队友提供护盾' },
  
  // 特殊技能
  thunder: { id: 'thunder', name: '雷霆一击', type: 'special', icon: '⚡', basePower: 30, description: '雷系大招' },
  ice: { id: 'ice', name: '冰冻', type: 'special', icon: '❄️', basePower: 22, description: '冰系控制技能' },
  starDust: { id: 'starDust', name: '星尘', type: 'special', icon: '⭐', basePower: 28, description: '龙族专属技能' }
}

// 获取宠物技能
export const getPetSkills = (typeId) => {
  const skillSets = {
    cat: ['bite', 'scratch', 'defend', 'heal'],
    dog: ['bite', 'scratch', 'cheer', 'defend'],
    rabbit: ['scratch', 'heal', 'shield', 'cheer'],
    dragon: ['fireBreath', 'thunder', 'starDust', 'ice']
  }
  const skills = skillSets[typeId] || skillSets.cat
  return skills.map(id => PET_SKILL_TYPES[id]).filter(Boolean)
}

// 技能等级配置
export const SKILL_LEVEL_CONFIG = {
  maxLevel: 10,
  expPerLevel: 50,
  powerIncreasePerLevel: 0.15 // 每级增加15%威力
}

// 计算技能威力
export const calculateSkillPower = (skillId, level) => {
  const skill = PET_SKILL_TYPES[skillId]
  if (!skill) return 0
  const config = SKILL_LEVEL_CONFIG
  const multiplier = 1 + (level - 1) * config.powerIncreasePerLevel
  return Math.round(skill.basePower * multiplier)
}

// 存储键
const PET_SKILLS_KEY = 'pet_skills'
const PET_EQUIPPED_SKILLS_KEY = 'pet_equipped_skills'
const PET_COMPETITION_KEY = 'pet_competition'
const PET_LEADERBOARD_KEY = 'pet_leaderboard'

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
  uni.removeStorageSync(PET_SKILLS_KEY)
  uni.removeStorageSync(PET_EQUIPPED_SKILLS_KEY)
}

// ========== 宠物技能系统 ==========

// 初始化宠物技能
export const initPetSkills = (petId) => {
  const petData = getPetData()
  if (!petData) return null
  
  const availableSkills = getPetSkills(petData.typeId)
  const skills = availableSkills.map(skill => ({
    id: skill.id,
    name: skill.name,
    icon: skill.icon,
    type: skill.type,
    level: 1,
    exp: 0,
    isEquipped: false
  }))
  
  // 默认装备前两个技能
  if (skills.length >= 2) {
    skills[0].isEquipped = true
    skills[1].isEquipped = true
  }
  
  uni.setStorageSync(PET_SKILLS_KEY, JSON.stringify(skills))
  return skills
}

// 获取宠物技能
export const getPetSkillsData = () => {
  try {
    const stored = uni.getStorageSync(PET_SKILLS_KEY)
    if (!stored) {
      const petData = getPetData()
      if (petData) {
        return initPetSkills(petData.id)
      }
      return []
    }
    return JSON.parse(stored)
  } catch (e) {
    console.error('获取宠物技能失败:', e)
    return []
  }
}

// 保存宠物技能
export const savePetSkills = (skills) => {
  uni.setStorageSync(PET_SKILLS_KEY, JSON.stringify(skills))
}

// 装备技能
export const equipSkill = (skillId) => {
  const skills = getPetSkillsData()
  const skill = skills.find(s => s.id === skillId)
  if (!skill) return null
  
  // 检查是否已装备
  if (skill.isEquipped) {
    skill.isEquipped = false
  } else {
    // 检查装备数量限制（最多4个）
    const equippedCount = skills.filter(s => s.isEquipped).length
    if (equippedCount >= 4) {
      return { success: false, message: '最多只能装备4个技能' }
    }
    skill.isEquipped = true
  }
  
  savePetSkills(skills)
  return { success: true, skills }
}

// 升级技能
export const upgradeSkill = (skillId) => {
  const skills = getPetSkillsData()
  const skill = skills.find(s => s.id === skillId)
  if (!skill) return null
  
  const config = SKILL_LEVEL_CONFIG
  if (skill.level >= config.maxLevel) {
    return { success: false, message: '技能已达最大等级' }
  }
  
  const expNeeded = config.expPerLevel
  if (skill.exp < expNeeded) {
    return { success: false, message: '技能经验不足' }
  }
  
  skill.exp -= expNeeded
  skill.level += 1
  
  savePetSkills(skills)
  return { success: true, skill, newPower: calculateSkillPower(skillId, skill.level) }
}

// 为技能添加经验
export const addSkillExp = (skillId, amount) => {
  const skills = getPetSkillsData()
  const skill = skills.find(s => s.id === skillId)
  if (!skill) return null
  
  skill.exp += amount
  savePetSkills(skills)
  return skill
}

// 获取已装备的技能
export const getEquippedSkills = () => {
  const skills = getPetSkillsData()
  return skills.filter(s => s.isEquipped)
}

// ========== 宠物竞赛系统 ==========

// 竞赛难度
export const COMPETITION_DIFFICULTY = {
  easy: { id: 'easy', name: '简单', winExp: 15, loseExp: 5, winPoints: 10 },
  normal: { id: 'normal', name: '普通', winExp: 30, loseExp: 10, winPoints: 25 },
  hard: { id: 'hard', name: '困难', winExp: 50, loseExp: 20, winPoints: 50 }
}

// 对手类型
const createOpponent = (difficulty) => {
  const opponents = {
    easy: [
      { name: '小黄鸭', icon: '🦆', level: 1 },
      { name: '小灰兔', icon: '🐰', level: 2 },
      { name: '小绿蛙', icon: '🐸', level: 1 }
    ],
    normal: [
      { name: '大黄狗', icon: '🐕', level: 5 },
      { name: '花猫咪', icon: '🐱', level: 6 },
      { name: '黑乌鸦', icon: '🐦‍⬛', level: 5 }
    ],
    hard: [
      { name: '火焰龙', icon: '🐉', level: 10 },
      { name: '钢铁狮', icon: '🦁', level: 12 },
      { name: '风暴鹰', icon: '🦅', level: 11 }
    ]
  }
  const list = opponents[difficulty] || opponents.easy
  return { ...list[Math.floor(Math.random() * list.length)], id: 'opp_' + Date.now() }
}

// 开始竞赛
export const startCompetition = (difficulty = 'normal') => {
  const petData = getPetData()
  const petStats = getPetStats()
  const equippedSkills = getEquippedSkills()
  
  if (!petData || !petStats) {
    return { success: false, message: '没有宠物无法参加竞赛' }
  }
  
  if (equippedSkills.length === 0) {
    return { success: false, message: '请先装备至少一个技能' }
  }
  
  const opponent = createOpponent(difficulty)
  const difficultyConfig = COMPETITION_DIFFICULTY[difficulty] || COMPETITION_DIFFICULTY.normal
  
  // 计算我方战斗力
  const myPower = equippedSkills.reduce((sum, skill) => {
    return sum + calculateSkillPower(skill.id, skill.level)
  }, 0) + (petData.level * 5) + Math.round(petStats.health / 10)
  
  // 计算对方战斗力
  const oppPower = opponent.level * 8 + Math.floor(Math.random() * 20)
  
  // 宠物心情影响
  const moodBonus = petStats.mood > 70 ? 1.2 : (petStats.mood < 40 ? 0.8 : 1)
  
  const finalMyPower = Math.round(myPower * moodBonus)
  const won = finalMyPower > oppPower
  
  // 奖励计算
  const expReward = won ? difficultyConfig.winExp : difficultyConfig.loseExp
  const pointsReward = won ? difficultyConfig.winPoints : 0
  
  // 更新宠物属性
  addExp(petData, petStats, expReward)
  savePetStats(petStats)
  
  // 为所有技能增加经验
  equippedSkills.forEach(skill => {
    addSkillExp(skill.id, won ? 10 : 3)
  })
  
  // 记录竞赛结果
  const competitionResult = {
    id: 'comp_' + Date.now(),
    difficulty,
    opponent: opponent.name,
    opponentIcon: opponent.icon,
    myPower: finalMyPower,
    oppPower,
    won,
    expReward,
    pointsReward,
    timestamp: new Date().toISOString()
  }
  
  saveCompetitionResult(competitionResult)
  updateLeaderboard(petData.id, petData.name, won ? pointsReward : 0, petData.level)
  
  return {
    success: true,
    result: competitionResult
  }
}

// 保存竞赛结果
export const saveCompetitionResult = (result) => {
  try {
    const history = uni.getStorageSync(PET_COMPETITION_KEY) || '[]'
    const list = JSON.parse(history)
    list.unshift(result)
    // 只保留最近20条记录
    if (list.length > 20) list.pop()
    uni.setStorageSync(PET_COMPETITION_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('保存竞赛结果失败:', e)
  }
}

// 获取竞赛历史
export const getCompetitionHistory = () => {
  try {
    const stored = uni.getStorageSync(PET_COMPETITION_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    return []
  }
}

// 更新排行榜
export const updateLeaderboard = (petId, petName, points, level) => {
  try {
    const stored = uni.getStorageSync(PET_LEADERBOARD_KEY) || '[]'
    let list = JSON.parse(stored)
    
    // 查找是否已有记录
    const existing = list.find(item => item.petId === petId)
    if (existing) {
      existing.points += points
      existing.totalWins += points > 0 ? 1 : 0
      existing.level = level
      existing.lastUpdate = new Date().toISOString()
    } else {
      list.push({
        petId,
        petName,
        points,
        totalWins: points > 0 ? 1 : 0,
        level,
        lastUpdate: new Date().toISOString()
      })
    }
    
    // 按积分排序
    list.sort((a, b) => b.points - a.points)
    // 只保留前50名
    if (list.length > 50) list = list.slice(0, 50)
    
    uni.setStorageSync(PET_LEADERBOARD_KEY, JSON.stringify(list))
    return list
  } catch (e) {
    console.error('更新排行榜失败:', e)
    return []
  }
}

// 获取排行榜
export const getLeaderboard = () => {
  try {
    const stored = uni.getStorageSync(PET_LEADERBOARD_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    return []
  }
}

export default {
  PET_TYPES,
  EVOLUTION_STAGES,
  PET_STATES,
  PET_SKILL_TYPES,
  SKILL_LEVEL_CONFIG,
  COMPETITION_DIFFICULTY,
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
  deletePet,
  getPetSkills,
  calculateSkillPower,
  initPetSkills,
  getPetSkillsData,
  savePetSkills,
  equipSkill,
  upgradeSkill,
  addSkillExp,
  getEquippedSkills,
  startCompetition,
  getCompetitionHistory,
  getLeaderboard
}
