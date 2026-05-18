/**
 * V50 Gamified Science Lab Service
 * 游戏化科学实验室 - 虚拟实验操作、科学知识问答、科学竞赛和探索任务
 */

// Storage keys
const SCIENCE_EXPERIMENTS_KEY = 'science_experiments'
const SCIENCE_QUESTS_KEY = 'science_quests'
const SCIENCE_POINTS_KEY = 'science_points'
const SCIENCE_ACHIEVEMENTS_KEY = 'science_achievements'
const SCIENCE_ENCYCLOPEDIA_KEY = 'science_encyclopedia'

// ============================================================================
// 实验类型定义
// ============================================================================

export const SCIENCE_TYPES = {
  chemistry: { id: 'chemistry', name: '化学', icon: '🧪', color: '#9B59B6', pointsPerHour: 12 },
  physics: { id: 'physics', name: '物理', icon: '⚡', color: '#3498DB', pointsPerHour: 10 },
  biology: { id: 'biology', name: '生物', icon: '🌱', color: '#27AE60', pointsPerHour: 10 },
  earth: { id: 'earth', name: '地球科学', icon: '🌍', color: '#E67E22', pointsPerHour: 8 },
  astronomy: { id: 'astronomy', name: '天文', icon: '🚀', color: '#2C3E50', pointsPerHour: 15 }
}

export const EXPERIMENT_MATERIALS = {
  chemistry: ['烧杯', '试管', '量筒', '滴管', '酒精灯', '搅拌棒'],
  physics: ['电流表', '电压表', '磁铁', '透镜', '滑轮', '砝码'],
  biology: ['显微镜', '载玻片', '培养皿', '镊子', '解剖刀', '标本'],
  earth: ['岩石样本', '罗盘', '温度计', '湿度计', '地图', '指南针'],
  astronomy: ['望远镜', '天球仪', '星座图', '日晷', '星图', '计时器']
}

// ============================================================================
// 虚拟实验
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
    type: 'chemistry',
    difficulty: 'easy',
    duration: 15,
    points: 20,
    safetyLevel: 'safe',
    steps: [
      { title: '准备材料', description: '牛奶、食用色素、棉签、洗洁精、盘子' },
      { title: '倒入牛奶', description: '在盘子里倒入适量牛奶，覆盖盘底即可' },
      { title: '添加色素', description: '将不同颜色的食用色素滴在牛奶表面' },
      { title: '观察反应', description: '用棉签蘸取洗洁精，轻轻触碰牛奶表面，观察彩虹流动' }
    ],
    isCompleted: false,
    completedAt: null,
    record: null
  },
  {
    id: 'exp_2',
    title: '火山爆发',
    description: '利用小苏打和醋的化学反应，模拟火山喷发',
    type: 'chemistry',
    difficulty: 'medium',
    duration: 20,
    points: 30,
    safetyLevel: 'warning',
    steps: [
      { title: '搭建火山模型', description: '用橡皮泥或纸板搭建火山模型' },
      { title: '加入小苏打', description: '在火山口加入3勺小苏打' },
      { title: '添加食用色素', description: '滴入几滴红色食用色素' },
      { title: '制造喷发', description: '快速倒入白醋，观察火山喷发' }
    ],
    isCompleted: false,
    completedAt: null,
    record: null
  },
  {
    id: 'exp_3',
    title: '电路小实验',
    description: '组装简单电路，点亮小灯泡',
    type: 'physics',
    difficulty: 'medium',
    duration: 25,
    points: 35,
    safetyLevel: 'warning',
    steps: [
      { title: '准备材料', description: '电池、导线、开关、小灯泡' },
      { title: '连接电路', description: '按照电路图连接各元件' },
      { title: '测试电路', description: '闭合开关，观察灯泡是否发光' },
      { title: '记录结果', description: '记录灯泡亮度，分析电路原理' }
    ],
    isCompleted: false,
    completedAt: null,
    record: null
  },
  {
    id: 'exp_4',
    title: '植物生长观察',
    description: '观察植物从种子到发芽的完整过程',
    type: 'biology',
    difficulty: 'easy',
    duration: 30,
    points: 25,
    safetyLevel: 'safe',
    steps: [
      { title: '准备种子', description: '选择豆类种子，浸泡一夜' },
      { title: '种植', description: '将种子放入湿润的棉花或土壤中' },
      { title: '日常观察', description: '每天记录种子的变化' },
      { title: '完成报告', description: '绘制生长过程图表' }
    ],
    isCompleted: false,
    completedAt: null,
    record: null
  },
  {
    id: 'exp_5',
    title: '日晷制作',
    description: '制作古代计时工具，了解地球自转',
    type: 'astronomy',
    difficulty: 'hard',
    duration: 40,
    points: 50,
    safetyLevel: 'safe',
    steps: [
      { title: '准备材料', description: '圆形纸板、指南针、直尺、铅笔' },
      { title: '绘制刻度', description: '在纸板上画12等分，标注1-12' },
      { title: '制作指针', description: '用卡纸制作三角形指针' },
      { title: '测试校准', description: '在阳光下测试，调整指针角度' }
    ],
    isCompleted: false,
    completedAt: null,
    record: null
  }
]

export const completeExperiment = (experimentId, record) => {
  try {
    const experiments = getScienceExperiments()
    const experiment = experiments.find(e => e.id === experimentId)
    if (experiment) {
      experiment.isCompleted = true
      experiment.completedAt = new Date().toISOString()
      experiment.record = record
      uni.setStorageSync(SCIENCE_EXPERIMENTS_KEY, JSON.stringify(experiments))
      
      // 更新积分
      updateSciencePoints(experiment.points)
      
      return experiment
    }
    return null
  } catch (e) {
    console.error('completeExperiment error:', e)
    return null
  }
}

// ============================================================================
// 科学探索任务
// ============================================================================

export const getScienceQuests = () => {
  try {
    const data = uni.getStorageSync(SCIENCE_QUESTS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getScienceQuests error:', e)
  }
  return getDefaultQuests()
}

export const getDefaultQuests = () => [
  {
    id: 'quest_1',
    title: '水的三态变化',
    description: '探索水如何从液态变成固态和气态',
    type: 'physics',
    category: 'exploration',
    points: 30,
    xp: 50,
    difficulty: 'easy',
    tasks: [
      { id: 't1', title: '观察冰块融化', description: '记录冰块在室温下的融化过程', completed: false },
      { id: 't2', title: '观察水蒸发', description: '观察水加热后的变化', completed: false },
      { id: 't3', title: '制作冰晶', description: '冷冻盐水观察结晶', completed: false }
    ],
    rewards: { points: 30, badge: 'water_explorer' },
    isCompleted: false,
    progress: 0
  },
  {
    id: 'quest_2',
    title: '植物的秘密',
    description: '了解植物如何制造食物和呼吸',
    type: 'biology',
    category: 'exploration',
    points: 40,
    xp: 60,
    difficulty: 'medium',
    tasks: [
      { id: 't1', title: '认识植物结构', description: '观察并记录植物各部分名称', completed: false },
      { id: 't2', title: '光合作用实验', description: '测试植物释放氧气', completed: false },
      { id: 't3', title: '植物呼吸', description: '观察植物夜间吸收氧气', completed: false }
    ],
    rewards: { points: 40, badge: 'plant_expert' },
    isCompleted: false,
    progress: 0
  },
  {
    id: 'quest_3',
    title: '声音的奥秘',
    description: '探索声音是如何产生和传播的',
    type: 'physics',
    category: 'experiment',
    points: 35,
    xp: 55,
    difficulty: 'easy',
    tasks: [
      { id: 't1', title: '制作音叉', description: '用杯子和绳子制作简单乐器', completed: false },
      { id: 't2', title: '声音传播', description: '测试声音在不同介质中的传播', completed: false },
      { id: 't3', title: '记录音高', description: '记录不同材料的声音差异', completed: false }
    ],
    rewards: { points: 35, badge: 'sound_wizard' },
    isCompleted: false,
    progress: 0
  },
  {
    id: 'quest_4',
    title: '太阳系漫游',
    description: '认识太阳系八大行星',
    type: 'astronomy',
    category: 'knowledge',
    points: 50,
    xp: 80,
    difficulty: 'medium',
    tasks: [
      { id: 't1', title: '行星排序', description: '记住八大行星的顺序', completed: false },
      { id: 't2', title: '特征研究', description: '了解每个行星的特点', completed: false },
      { id: 't3', title: '制作模型', description: '制作太阳系模型', completed: false }
    ],
    rewards: { points: 50, badge: 'space_explorer' },
    isCompleted: false,
    progress: 0
  }
]

export const updateQuestProgress = (questId, taskId) => {
  try {
    const quests = getScienceQuests()
    const quest = quests.find(q => q.id === questId)
    if (quest) {
      const task = quest.tasks.find(t => t.id === taskId)
      if (task) {
        task.completed = true
        const completedCount = quest.tasks.filter(t => t.completed).length
        quest.progress = Math.round((completedCount / quest.tasks.length) * 100)
        
        if (quest.progress === 100) {
          quest.isCompleted = true
          updateSciencePoints(quest.points)
        }
        
        uni.setStorageSync(SCIENCE_QUESTS_KEY, JSON.stringify(quests))
        return quest
      }
    }
    return null
  } catch (e) {
    console.error('updateQuestProgress error:', e)
    return null
  }
}

// ============================================================================
// 科学百科
// ============================================================================

export const getScienceEncyclopedia = () => {
  try {
    const data = uni.getStorageSync(SCIENCE_ENCYCLOPEDIA_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getScienceEncyclopedia error:', e)
  }
  return getDefaultEncyclopedia()
}

export const getDefaultEncyclopedia = () => [
  {
    id: 'enc_1',
    title: '什么是化学？',
    category: 'chemistry',
    icon: '🧪',
    content: '化学是研究物质的组成、结构、性质以及变化规律的科学。我们身边的万事万物都由化学物质组成，水、空气、食物、甚至我们自己的身体都包含着无数的化学变化。',
    funFacts: [
      '人体大约由60%的化学元素组成',
      '世界上最古老的化学反应是火的发现',
      '彩虹的七种颜色是因为光线折射'
    ],
    relatedExperiments: ['exp_1', 'exp_2'],
    difficulty: 'easy'
  },
  {
    id: 'enc_2',
    title: '神奇的物理世界',
    category: 'physics',
    icon: '⚡',
    content: '物理学研究物质、能量、空间和时间的基本规律。从手机到宇宙飞船，从彩虹到雷电，都是物理学的应用。牛顿、爱因斯坦都是著名的物理学家。',
    funFacts: [
      '光速是宇宙中最快的速度',
      '闪电的温度比太阳表面还高',
      '声音无法在太空中传播'
    ],
    relatedExperiments: ['exp_3', 'exp_5'],
    difficulty: 'easy'
  },
  {
    id: 'enc_3',
    title: '生命的奥秘',
    category: 'biology',
    icon: '🌱',
    content: '生物学研究生命现象和生命活动规律。植物、动物、微生物都是生物学的研究对象。细胞是生命的基本单位，每个生物都由细胞构成。',
    funFacts: [
      '地球上有超过870万种生物',
      '细菌是地球上最早的生物',
      '人类和香蕉共享约60%的DNA'
    ],
    relatedExperiments: ['exp_4'],
    difficulty: 'easy'
  },
  {
    id: 'enc_4',
    title: '地球的故事',
    category: 'earth',
    icon: '🌍',
    content: '地球科学包括地质学、气象学、海洋学等。研究地球的形成、结构、运动和演化。地球已经存在了约46亿年，而我们人类只是地球历史的短暂一瞬。',
    funFacts: [
      '地球是太阳系中唯一有液态水的行星',
      '地核的温度比太阳表面还高',
      '珠穆朗玛峰还在慢慢长高'
    ],
    relatedExperiments: [],
    difficulty: 'medium'
  },
  {
    id: 'enc_5',
    title: '探索宇宙',
    category: 'astronomy',
    icon: '🚀',
    content: '天文学研究宇宙中的天体，包括星星、行星、星系等。宇宙浩瀚无垠，仅银河系就有数千亿颗恒星。我们头顶的星空藏着无尽的奥秘等待我们去探索。',
    funFacts: [
      '宇宙年龄约138亿年',
      '太阳质量占太阳系99.86%',
      '宇航员在月球上留下的脚印会保留100万年'
    ],
    relatedExperiments: ['exp_5'],
    difficulty: 'medium'
  },
  {
    id: 'enc_6',
    title: '伟大科学家的故事',
    category: 'stories',
    icon: '🏆',
    content: '从牛顿到爱因斯坦，从居里夫人到袁隆平，无数科学家用智慧和汗水推动人类进步。他们的故事告诉我们：科学需要好奇、勇气和坚持。',
    funFacts: [
      '爱因斯坦小时候说话很晚',
      '居里夫人两次获得诺贝尔奖',
      '袁隆平被誉为"杂交水稻之父"'
    ],
    relatedExperiments: [],
    difficulty: 'easy'
  }
]

export const markEncyclopediaRead = (encId) => {
  try {
    const encyclopedia = getScienceEncyclopedia()
    const item = encyclopedia.find(e => e.id === encId)
    if (item) {
      item.isRead = true
      item.readAt = new Date().toISOString()
      uni.setStorageSync(SCIENCE_ENCYCLOPEDIA_KEY, JSON.stringify(encyclopedia))
      return item
    }
    return null
  } catch (e) {
    console.error('markEncyclopediaRead error:', e)
    return null
  }
}

// ============================================================================
// 科学积分系统
// ============================================================================

export const getSciencePoints = () => {
  try {
    const data = uni.getStorageSync(SCIENCE_POINTS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getSciencePoints error:', e)
  }
  return {
    totalPoints: 0,
    level: 1,
    totalExperiments: 0,
    totalQuests: 0,
    achievements: [],
    weeklyGoal: 100,
    weeklyProgress: 0,
    streak: { current: 0, longest: 0 }
  }
}

export const updateSciencePoints = (points) => {
  try {
    const data = getSciencePoints()
    data.totalPoints += points
    
    // 计算等级 (每150积分升一级)
    data.level = Math.floor(data.totalPoints / 150) + 1
    
    // 更新周进度
    data.weeklyProgress += points
    
    // 更新连续学习天数
    const today = new Date().toDateString()
    const lastActive = data.lastActiveDate
    
    if (lastActive) {
      const lastDate = new Date(lastActive)
      const daysDiff = Math.floor((new Date(today) - lastDate) / 86400000)
      
      if (daysDiff === 1) {
        data.streak.current++
      } else if (daysDiff > 1) {
        data.streak.current = 1
      }
    } else {
      data.streak.current = 1
    }
    
    data.streak.longest = Math.max(data.streak.longest, data.streak.current)
    data.lastActiveDate = today
    
    uni.setStorageSync(SCIENCE_POINTS_KEY, JSON.stringify(data))
    return data
  } catch (e) {
    console.error('updateSciencePoints error:', e)
    return null
  }
}

// ============================================================================
// 科学成就
// ============================================================================

export const getScienceAchievements = () => {
  try {
    const data = uni.getStorageSync(SCIENCE_ACHIEVEMENTS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getScienceAchievements error:', e)
  }
  return [
    { id: 'first_experiment', name: '初出茅庐', description: '完成第一个科学实验', icon: '🧪', isUnlocked: false, unlockedAt: null },
    { id: 'chemistry_novice', name: '化学新手', description: '完成3个化学实验', icon: '⚗️', isUnlocked: false, unlockedAt: null },
    { id: 'physics_lover', name: '物理爱好者', description: '完成3个物理实验', icon: '⚡', isUnlocked: false, unlockedAt: null },
    { id: 'biology_explorer', name: '生物探索者', description: '完成3个生物实验', icon: '🔬', isUnlocked: false, unlockedAt: null },
    { id: 'science_master', name: '科学大师', description: '累计获得500科学积分', icon: '🏆', isUnlocked: false, unlockedAt: null },
    { id: 'curious_mind', name: '好奇心', description: '阅读10篇科学百科', icon: '💡', isUnlocked: false, unlockedAt: null }
  ]
}

export const checkAndUnlockAchievements = () => {
  try {
    const achievements = getScienceAchievements()
    const experiments = getScienceExperiments()
    const encyclopedia = getScienceEncyclopedia()
    const points = getSciencePoints()
    
    const unlocked = []
    
    achievements.forEach(achievement => {
      if (achievement.isUnlocked) return
      
      let shouldUnlock = false
      
      switch (achievement.id) {
        case 'first_experiment':
          shouldUnlock = experiments.filter(e => e.isCompleted).length >= 1
          break
        case 'chemistry_novice':
          shouldUnlock = experiments.filter(e => e.isCompleted && e.type === 'chemistry').length >= 3
          break
        case 'physics_lover':
          shouldUnlock = experiments.filter(e => e.isCompleted && e.type === 'physics').length >= 3
          break
        case 'biology_explorer':
          shouldUnlock = experiments.filter(e => e.isCompleted && e.type === 'biology').length >= 3
          break
        case 'science_master':
          shouldUnlock = points.totalPoints >= 500
          break
        case 'curious_mind':
          shouldUnlock = encyclopedia.filter(e => e.isRead).length >= 10
          break
      }
      
      if (shouldUnlock) {
        achievement.isUnlocked = true
        achievement.unlockedAt = new Date().toISOString()
        unlocked.push(achievement)
      }
    })
    
    if (unlocked.length > 0) {
      uni.setStorageSync(SCIENCE_ACHIEVEMENTS_KEY, JSON.stringify(achievements))
    }
    
    return unlocked
  } catch (e) {
    console.error('checkAndUnlockAchievements error:', e)
    return []
  }
}

// ============================================================================
// 竞赛相关
// ============================================================================

export const SCIENCE_COMPETITIONS = [
  {
    id: 'comp_1',
    title: '科学知识挑战赛',
    description: '回答科学问题，赢取积分',
    type: 'quiz',
    status: 'active',
    participantCount: 234,
    duration: 10,
    rewards: { points: 50, badge: 'quiz_master' }
  },
  {
    id: 'comp_2',
    title: '实验设计大赛',
    description: '设计一个创意实验',
    type: 'design',
    status: 'active',
    participantCount: 89,
    duration: 30,
    rewards: { points: 100, badge: 'innovator' }
  }
]

export const joinCompetition = (competitionId) => {
  const comp = SCIENCE_COMPETITIONS.find(c => c.id === competitionId)
  if (comp) {
    comp.participantCount++
    return true
  }
  return false
}

export default {
  // 类型
  SCIENCE_TYPES,
  EXPERIMENT_MATERIALS,
  
  // 实验
  getScienceExperiments,
  completeExperiment,
  
  // 任务
  getScienceQuests,
  updateQuestProgress,
  
  // 百科
  getScienceEncyclopedia,
  markEncyclopediaRead,
  
  // 积分
  getSciencePoints,
  updateSciencePoints,
  
  // 成就
  getScienceAchievements,
  checkAndUnlockAchievements,
  
  // 竞赛
  SCIENCE_COMPETITIONS,
  joinCompetition
}
