// src/stores/scienceMuseumStore.js
// V94 Science Museum System — 科学博物馆系统

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore'

// ============================================================================
// Types & Constants
// ============================================================================

// 展厅类型
export const HALL_TYPE = {
  TECHNOLOGY: 'technology',     // 科技史展厅
  PHYSICS: 'physics',            // 物理世界
  CHEMISTRY: 'chemistry',        // 化学奇妙
  BIOLOGY: 'biology',            // 生物探秘
  SPACE: 'space',               // 宇宙探索
  EARTH: 'earth'                // 地球科学
}

export const HALL_TYPE_INFO = {
  [HALL_TYPE.TECHNOLOGY]: { label: '科技史展厅', icon: '🏛️', color: '#722ED1' },
  [HALL_TYPE.PHYSICS]: { label: '物理世界', icon: '⚡', color: '#1890FF' },
  [HALL_TYPE.CHEMISTRY]: { label: '化学奇妙', icon: '🧪', color: '#52C41A' },
  [HALL_TYPE.BIOLOGY]: { label: '生物探秘', icon: '🧬', color: '#F5222D' },
  [HALL_TYPE.SPACE]: { label: '宇宙探索', icon: '🚀', color: '#FA8C16' },
  [HALL_TYPE.EARTH]: { label: '地球科学', icon: '🌍', color: '#13C2C2' }
}

// 展品类型
export const EXHIBIT_TYPE = {
  INTERACTIVE: 'interactive',   // 互动展品
  DEMO: 'demo',                // 实验演示
  EXPLAIN: 'explain'           // 原理讲解
}

export const EXHIBIT_TYPE_INFO = {
  [EXHIBIT_TYPE.INTERACTIVE]: { label: '互动展品', icon: '🎮', color: '#1890FF' },
  [EXHIBIT_TYPE.DEMO]: { label: '实验演示', icon: '🔬', color: '#52C41A' },
  [EXHIBIT_TYPE.EXPLAIN]: { label: '原理讲解', icon: '📚', color: '#722ED1' }
}

// localStorage keys
const MUSEUM_PROGRESS_KEY = 'sm_museum_progress'
const COLLECTION_KEY = 'sm_collection'

// ============================================================================
// Mock Data: Museum Halls
// ============================================================================

const MOCK_HALLS = [
  {
    id: 'hall_tech',
    name: '科技史展厅',
    description: '从钻木取火到人工智能，见证人类科技发展的伟大历程',
    type: HALL_TYPE.TECHNOLOGY,
    image: '/static/science-museum/tech-hall.jpg',
    exhibits: ['exhibit_fire', 'exhibit_wheel', 'exhibit_print', 'exhibit_steam', 'exhibit_electric', 'exhibit_computer'],
    unlocked: true
  },
  {
    id: 'hall_physics',
    name: '物理世界',
    description: '探索力、热、声、光、电的奥秘',
    type: HALL_TYPE.PHYSICS,
    image: '/static/science-museum/physics-hall.jpg',
    exhibits: ['exhibit_pendulum', 'exhibit_magnet', 'exhibit_optics', 'exhibit_electricity'],
    unlocked: true
  },
  {
    id: 'hall_chemistry',
    name: '化学奇妙',
    description: '感受元素的神奇变化，探索物质的本质',
    type: HALL_TYPE.CHEMISTRY,
    image: '/static/science-museum/chemistry-hall.jpg',
    exhibits: ['exhibit_color', 'exhibit_bubble', 'exhibit_crystal', 'exhibit_reaction'],
    unlocked: true
  },
  {
    id: 'hall_biology',
    name: '生物探秘',
    description: '走进生命的世界，了解动植物的奇妙',
    type: HALL_TYPE.BIOLOGY,
    image: '/static/science-museum/biology-hall.jpg',
    exhibits: ['exhibit_cell', 'exhibit_dna', 'exhibit_evolution', 'exhibit_ecosystem'],
    unlocked: false,
    unlockCondition: '完成科技史展厅所有展品'
  },
  {
    id: 'hall_space',
    name: '宇宙探索',
    description: '遨游星空，了解太阳系和宇宙的奥秘',
    type: HALL_TYPE.SPACE,
    image: '/static/science-museum/space-hall.jpg',
    exhibits: ['exhibit_solar', 'exhibit_planet', 'exhibit_star', 'exhibit_blackhole'],
    unlocked: false,
    unlockCondition: '完成物理世界展厅所有展品'
  },
  {
    id: 'hall_earth',
    name: '地球科学',
    description: '了解地球的结构、气候和地质变迁',
    type: HALL_TYPE.EARTH,
    image: '/static/science-museum/earth-hall.jpg',
    exhibits: ['exhibit_layer', 'exhibit_volcano', 'exhibit_weather', 'exhibit_mineral'],
    unlocked: false,
    unlockCondition: '完成化学奇妙展厅所有展品'
  }
]

// ============================================================================
// Mock Data: Exhibits
// ============================================================================

const MOCK_EXHIBITS = [
  // 科技史展厅
  {
    id: 'exhibit_fire',
    hallId: 'hall_tech',
    name: '钻木取火',
    description: '体验原始人如何利用摩擦生热来生火',
    type: EXHIBIT_TYPE.INTERACTIVE,
    difficulty: 1,
    principle: '摩擦生热：当两个物体相互摩擦时，机械能转化为热能。当温度达到燃点时，物质就会燃烧。',
    history: '约100万年前，人类学会了使用火，这是人类进化史上的重要里程碑。',
    interactiveSteps: [
      '双手握住木棍顶端',
      '在木板上快速来回摩擦',
      '观察产生的热量和火星',
      '收集火星到引火物上'
    ],
    points: 10
  },
  {
    id: 'exhibit_wheel',
    hallId: 'hall_tech',
    name: '轮子的发明',
    description: '了解轮子如何改变人类的运输方式',
    type: EXHIBIT_TYPE.EXPLAIN,
    difficulty: 1,
    principle: '轮子利用滚动摩擦代替滑动摩擦，大大减少了移动物体所需的力。',
    history: '约5500年前，苏美尔人发明了陶轮，这是轮子最早的应用。',
    points: 10
  },
  {
    id: 'exhibit_print',
    hallId: 'hall_tech',
    name: '活字印刷',
    description: '体验中国古代四大发明之一的印刷术',
    type: EXHIBIT_TYPE.DEMO,
    difficulty: 2,
    principle: '活字印刷使用可移动的单个字符，可以重复排列使用，大大提高了印刷效率。',
    history: '北宋时期，毕昇发明了活字印刷术，比欧洲古腾堡早约400年。',
    demoSteps: [
      '选择需要的活字',
      '排列成想要印刷的文本',
      '涂墨',
      '覆盖纸张并压印'
    ],
    points: 15
  },
  {
    id: 'exhibit_steam',
    hallId: 'hall_tech',
    name: '蒸汽机原理',
    description: '理解蒸汽如何驱动机器运转',
    type: EXHIBIT_TYPE.INTERACTIVE,
    difficulty: 2,
    principle: '蒸汽膨胀产生压力，推动活塞运动，将热能转化为机械能。',
    history: '瓦特改进了蒸汽机，开启了工业革命的大门。',
    interactiveSteps: [
      '向容器中加水',
      '加热使水沸腾',
      '观察蒸汽推动活塞',
      '调整阀门控制蒸汽流量'
    ],
    points: 15
  },
  {
    id: 'exhibit_electric',
    hallId: 'hall_tech',
    name: '电磁感应',
    description: '探索电与磁的相互作用',
    type: EXHIBIT_TYPE.INTERACTIVE,
    difficulty: 2,
    principle: '变化的磁场可以在导体中产生电流，这是发电机的基本原理。',
    history: '法拉第在1831年发现了电磁感应现象，为电气时代奠定了基础。',
    interactiveSteps: [
      '观察磁铁在线圈中运动',
      '注意电流表指针的变化',
      '改变运动速度观察效果',
      '尝试不同方向的磁铁'
    ],
    points: 20
  },
  {
    id: 'exhibit_computer',
    hallId: 'hall_tech',
    name: '计算机原理',
    description: '了解从算盘到超级计算机的发展',
    type: EXHIBIT_TYPE.EXPLAIN,
    difficulty: 3,
    principle: '计算机使用二进制（0和1）来表示和处理所有信息，通过逻辑门实现计算。',
    history: '从1946年的ENIAC到今天的AI，计算机经历了飞速的发展。',
    points: 25
  },
  // 物理世界展厅
  {
    id: 'exhibit_pendulum',
    hallId: 'hall_physics',
    name: '傅科摆',
    description: '亲眼见证地球自转的证据',
    type: EXHIBIT_TYPE.DEMO,
    difficulty: 2,
    principle: '傅科摆的摆动平面相对于地球保持不变，看起来在慢慢旋转，实际上是地球在转动。',
    demoSteps: [
      '观察摆锤的初始方向',
      '等待一段时间',
      '注意摆动平面的变化',
      '理解地球自转的含义'
    ],
    points: 20
  },
  {
    id: 'exhibit_magnet',
    hallId: 'hall_physics',
    name: '磁铁的世界',
    description: '探索磁力的神奇性质',
    type: EXHIBIT_TYPE.INTERACTIVE,
    difficulty: 1,
    principle: '磁铁具有吸引铁、钴、镍等物质的性质，同极相斥、异极相吸。',
    interactiveSteps: [
      '用磁铁吸引各种物品',
      '观察哪些能被吸引',
      '将两个磁铁靠近',
      '观察相斥和相吸现象'
    ],
    points: 10
  },
  {
    id: 'exhibit_optics',
    hallId: 'hall_physics',
    name: '光的奥秘',
    description: '探索光的折射、反射和颜色',
    type: EXHIBIT_TYPE.INTERACTIVE,
    difficulty: 2,
    principle: '光在不同介质中传播速度不同，会发生折射。白光由七种颜色组成，通过棱镜可以分解。',
    interactiveSteps: [
      '用三棱镜分解白光',
      '观察彩虹的形成',
      '通过透镜观察成像',
      '体验哈哈镜的反射'
    ],
    points: 15
  },
  {
    id: 'exhibit_electricity',
    hallId: 'hall_physics',
    name: '静电现象',
    description: '体验静电的趣味实验',
    type: EXHIBIT_TYPE.INTERACTIVE,
    difficulty: 1,
    principle: '摩擦可以使物体带电，带相同电荷的物体相斥，带不同电荷的物体相吸。',
    interactiveSteps: [
      '用气球摩擦头发',
      '观察气球吸附在墙上',
      '尝试让两个气球相斥',
      '用验电器检测带电'
    ],
    points: 10
  },
  // 化学奇妙展厅
  {
    id: 'exhibit_color',
    hallId: 'hall_chemistry',
    name: '酸碱指示剂',
    description: '用紫甘蓝汁检测酸碱',
    type: EXHIBIT_TYPE.DEMO,
    difficulty: 1,
    principle: '紫甘蓝汁中的花青素在酸性和碱性溶液中会呈现不同的颜色。',
    demoSteps: [
      '挤出紫甘蓝汁',
      '分别加入醋和肥皂水',
      '观察颜色变化',
      '测试其他溶液的酸碱性'
    ],
    points: 10
  },
  {
    id: 'exhibit_bubble',
    hallId: 'hall_chemistry',
    name: '泡泡的奥秘',
    description: '探索表面张力的神奇',
    type: EXHIBIT_TYPE.INTERACTIVE,
    difficulty: 1,
    principle: '水的表面张力使得泡泡形成球形，因为球形能用最小的表面积包裹最大的体积。',
    interactiveSteps: [
      '配置泡泡水',
      '尝试不同形状的泡泡工具',
      '观察泡泡表面的彩虹',
      '尝试叠放多个泡泡'
    ],
    points: 10
  },
  {
    id: 'exhibit_crystal',
    hallId: 'hall_chemistry',
    name: '晶体生长',
    description: '观察晶体形成的美丽过程',
    type: EXHIBIT_TYPE.DEMO,
    difficulty: 2,
    principle: '当溶液中的溶质超过溶解度时，溶质会结晶析出，形成美丽的几何形状。',
    demoSteps: [
      '配置饱和盐水溶液',
      '放入晶种或细线',
      '等待水分蒸发',
      '观察晶体的形成'
    ],
    points: 15
  },
  {
    id: 'exhibit_reaction',
    hallId: 'hall_chemistry',
    name: '化学反应',
    description: '观察酸碱中和反应',
    type: EXHIBIT_TYPE.DEMO,
    difficulty: 2,
    principle: '酸和碱反应会产生盐和水，并放出热量，这就是中和反应。',
    demoSteps: [
      '向烧杯中加入氢氧化钠溶液',
      '滴入酚酞指示剂',
      '慢慢加入稀盐酸',
      '观察颜色变化和放热现象'
    ],
    points: 15
  }
]

// ============================================================================
// Mock Data: Collection Book
// ============================================================================

const MOCK_COLLECTIBLES = [
  { id: 'badge_pioneer', name: '科技先驱', description: '完成第一个科技史展厅展品', icon: '🏆', requireCount: 1 },
  { id: 'badge_explorer', name: '科技探索者', description: '完成科技史展厅所有展品', icon: '🔭', requireCount: 6 },
  { id: 'badge_physicist', name: '小小物理学家', description: '完成物理世界展厅所有展品', icon: '⚡', requireCount: 4 },
  { id: 'badge_chemist', name: '小小化学家', description: '完成化学奇妙展厅所有展品', icon: '🧪', requireCount: 4 },
  { id: 'badge_collector', name: '科学收藏家', description: '收集10个展品印章', icon: '📒', requireCount: 10 },
  { id: 'badge_master', name: '科学大师', description: '解锁所有展厅', icon: '🎓', requireCount: 6 }
]

// ============================================================================
// Store Definition
// ============================================================================

export const useScienceMuseumStore = defineStore('scienceMuseum', () => {
  const babyStore = useBabyStore()

  // ---------- State ----------

  const halls = ref([])
  const exhibits = ref([])
  const collectibles = ref([])

  const hallProgress = ref({})       // { hallId: { completedExhibits: [], unlocked: bool } }
  const exhibitProgress = ref({})    // { exhibitId: { completed: bool, stamps: int, completedAt: date } }
  const collectionProgress = ref({}) // { collectibleId: { count: int, unlocked: bool, unlockedAt: date } }

  const currentHallId = ref(null)
  const currentExhibitId = ref(null)

  // ---------- Computed ----------

  const currentBabyId = computed(() => babyStore.currentBabyId)

  // 解锁的展厅列表
  const unlockedHalls = computed(() => {
    return halls.value.filter(hall => {
      const progress = hallProgress.value[hall.id]
      return progress?.unlocked || hall.unlocked
    })
  })

  // 当前展厅
  const currentHall = computed(() => {
    if (!currentHallId.value) return null
    return halls.value.find(h => h.id === currentHallId.value)
  })

  // 当前展厅的展品
  const currentHallExhibits = computed(() => {
    if (!currentHallId.value) return []
    return exhibits.value.filter(e => e.hallId === currentHallId.value)
  })

  // 当前展品
  const currentExhibit = computed(() => {
    if (!currentExhibitId.value) return null
    return exhibits.value.find(e => e.id === currentExhibitId.value)
  })

  // 已完成的展品数
  const completedExhibitsCount = computed(() => {
    return Object.values(exhibitProgress.value).filter(p => p.completed).length
  })

  // 已收集的印章数
  const collectedStampsCount = computed(() => {
    return Object.values(exhibitProgress.value).reduce((sum, p) => sum + (p.stamps || 0), 0)
  })

  // 已解锁的收藏品数
  const unlockedCollectiblesCount = computed(() => {
    return Object.values(collectionProgress.value).filter(p => p.unlocked).length
  })

  // 统计信息
  const statistics = computed(() => ({
    totalHalls: halls.value.length,
    unlockedHalls: unlockedHalls.value.length,
    totalExhibits: exhibits.value.length,
    completedExhibits: completedExhibitsCount.value,
    totalStamps: collectedStampsCount.value,
    totalCollectibles: collectibles.value.length,
    unlockedCollectibles: unlockedCollectiblesCount.value,
    totalPoints: calculateTotalPoints()
  }))

  // ---------- Helper Functions ----------

  const calculateTotalPoints = () => {
    let points = 0
    Object.values(exhibitProgress.value).forEach(p => {
      if (p.completed) {
        const exhibit = exhibits.value.find(e => e.id === Object.keys(exhibitProgress.value).find(k => exhibitProgress.value[k] === p))
        if (exhibit) points += exhibit.points || 0
      }
    })
    return points
  }

  const generateId = (prefix) => {
    return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`
  }

  // ---------- Init ----------

  const init = () => {
    loadHalls()
    loadExhibits()
    loadCollectibles()
    loadProgress()
    checkHallUnlocks()
  }

  const loadHalls = () => {
    halls.value = MOCK_HALLS
  }

  const loadExhibits = () => {
    exhibits.value = MOCK_EXHIBITS
  }

  const loadCollectibles = () => {
    collectibles.value = MOCK_COLLECTIBLES
  }

  const loadProgress = () => {
    try {
      const storedHall = uni.getStorageSync(`${MUSEUM_PROGRESS_KEY}_halls`)
      if (storedHall) hallProgress.value = JSON.parse(storedHall)

      const storedExhibit = uni.getStorageSync(`${MUSEUM_PROGRESS_KEY}_exhibits`)
      if (storedExhibit) exhibitProgress.value = JSON.parse(storedExhibit)

      const storedCollection = uni.getStorageSync(`${MUSEUM_PROGRESS_KEY}_collection`)
      if (storedCollection) collectionProgress.value = JSON.parse(storedCollection)
    } catch (e) {
      console.error('[ScienceMuseumStore] 加载进度失败:', e)
    }
  }

  const saveProgress = () => {
    try {
      uni.setStorageSync(`${MUSEUM_PROGRESS_KEY}_halls`, JSON.stringify(hallProgress.value))
      uni.setStorageSync(`${MUSEUM_PROGRESS_KEY}_exhibits`, JSON.stringify(exhibitProgress.value))
      uni.setStorageSync(`${MUSEUM_PROGRESS_KEY}_collection`, JSON.stringify(collectionProgress.value))
    } catch (e) {
      console.error('[ScienceMuseumStore] 保存进度失败:', e)
    }
  }

  // ---------- Hall Methods ----------

  const checkHallUnlocks = () => {
    // 检查每个展厅的解锁条件
    const hallOrder = ['hall_tech', 'hall_physics', 'hall_chemistry', 'hall_biology', 'hall_space', 'hall_earth']
    
    hallOrder.forEach((hallId, index) => {
      if (index === 0) {
        // 第一个展厅默认解锁
        if (!hallProgress.value[hallId]) {
          hallProgress.value[hallId] = { unlocked: true, completedExhibits: [] }
        } else {
          hallProgress.value[hallId].unlocked = true
        }
      } else {
        // 其他展厅需要前置展厅完成
        const prevHallId = hallOrder[index - 1]
        const prevHall = halls.value.find(h => h.id === prevHallId)
        if (prevHall) {
          const prevExhibits = exhibits.value.filter(e => e.hallId === prevHallId)
          const completedCount = prevExhibits.filter(e => exhibitProgress.value[e.id]?.completed).length
          
          if (completedCount >= prevExhibits.length && prevExhibits.length > 0) {
            if (!hallProgress.value[hallId]) {
              hallProgress.value[hallId] = { unlocked: true, completedExhibits: [] }
            } else {
              hallProgress.value[hallId].unlocked = true
            }
          }
        }
      }
    })
    
    saveProgress()
  }

  const selectHall = (hallId) => {
    currentHallId.value = hallId
    currentExhibitId.value = null
  }

  const isHallUnlocked = (hallId) => {
    const hall = halls.value.find(h => h.id === hallId)
    if (!hall) return false
    if (hall.unlocked) return true
    return hallProgress.value[hallId]?.unlocked || false
  }

  const getHallProgress = (hallId) => {
    const hall = halls.value.find(h => h.id === hallId)
    if (!hall) return { completed: 0, total: 0, percentage: 0 }
    
    const hallExhibits = exhibits.value.filter(e => e.hallId === hallId)
    const completed = hallExhibits.filter(e => exhibitProgress.value[e.id]?.completed).length
    
    return {
      completed,
      total: hallExhibits.length,
      percentage: hallExhibits.length > 0 ? Math.round((completed / hallExhibits.length) * 100) : 0
    }
  }

  // ---------- Exhibit Methods ----------

  const selectExhibit = (exhibitId) => {
    currentExhibitId.value = exhibitId
  }

  const getExhibitProgress = (exhibitId) => {
    return exhibitProgress.value[exhibitId] || { completed: false, stamps: 0 }
  }

  const completeExhibit = (exhibitId, stamps = 1) => {
    const exhibit = exhibits.value.find(e => e.id === exhibitId)
    if (!exhibit) return null

    const progress = exhibitProgress.value[exhibitId] || {}
    progress.completed = true
    progress.completedAt = new Date().toISOString()
    progress.stamps = stamps
    
    exhibitProgress.value[exhibitId] = progress

    // 更新展厅进度
    if (!hallProgress.value[exhibit.hallId]) {
      hallProgress.value[exhibit.hallId] = { unlocked: true, completedExhibits: [] }
    }
    if (!hallProgress.value[exhibit.hallId].completedExhibits.includes(exhibitId)) {
      hallProgress.value[exhibit.hallId].completedExhibits.push(exhibitId)
    }

    saveProgress()
    checkHallUnlocks()
    checkCollectibles()

    return { 
      exhibitName: exhibit.name, 
      stamps,
      points: exhibit.points
    }
  }

  // ---------- Collection Methods ----------

  const checkCollectibles = () => {
    collectibles.value.forEach(item => {
      const progress = collectionProgress.value[item.id] || { count: 0, unlocked: false }
      
      // 计算当前计数
      let count = 0
      switch (item.id) {
        case 'badge_pioneer':
          count = completedExhibitsCount.value
          break
        case 'badge_explorer':
          const techExhibits = exhibits.value.filter(e => e.hallId === 'hall_tech')
          count = techExhibits.filter(e => exhibitProgress.value[e.id]?.completed).length
          break
        case 'badge_physicist':
          const physicsExhibits = exhibits.value.filter(e => e.hallId === 'hall_physics')
          count = physicsExhibits.filter(e => exhibitProgress.value[e.id]?.completed).length
          break
        case 'badge_chemist':
          const chemistryExhibits = exhibits.value.filter(e => e.hallId === 'hall_chemistry')
          count = chemistryExhibits.filter(e => exhibitProgress.value[e.id]?.completed).length
          break
        case 'badge_collector':
          count = collectedStampsCount.value
          break
        case 'badge_master':
          count = unlockedHalls.value.length
          break
      }

      // 检查是否解锁
      if (count >= item.requireCount && !progress.unlocked) {
        progress.unlocked = true
        progress.unlockedAt = new Date().toISOString()
      }
      progress.count = count

      collectionProgress.value[item.id] = progress
    })

    saveProgress()
  }

  const getCollectibleProgress = (collectibleId) => {
    return collectionProgress.value[collectibleId] || { count: 0, unlocked: false }
  }

  // ---------- Clear ----------

  const clearCurrentHall = () => {
    currentHallId.value = null
    currentExhibitId.value = null
  }

  const clearCurrentExhibit = () => {
    currentExhibitId.value = null
  }

  return {
    // State
    halls,
    exhibits,
    collectibles,
    hallProgress,
    exhibitProgress,
    collectionProgress,
    currentHallId,
    currentExhibitId,

    // Computed
    currentBabyId,
    unlockedHalls,
    currentHall,
    currentHallExhibits,
    currentExhibit,
    completedExhibitsCount,
    collectedStampsCount,
    unlockedCollectiblesCount,
    statistics,

    // Methods
    init,
    loadHalls,
    loadExhibits,
    loadCollectibles,
    loadProgress,
    saveProgress,
    selectHall,
    isHallUnlocked,
    getHallProgress,
    selectExhibit,
    getExhibitProgress,
    completeExhibit,
    getCollectibleProgress,
    clearCurrentHall,
    clearCurrentExhibit
  }
})
