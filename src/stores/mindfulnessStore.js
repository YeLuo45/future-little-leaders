// src/stores/mindfulnessStore.js
// V93 Mindfulness Garden System — 正念花园系统

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore'

// ============================================================================
// Types & Constants
// ============================================================================

// 冥想类型
export const MEDITATION_TYPE = {
  BASIC: 'basic',           // 基础冥想
  GUIDED: 'guided',         // 引导式冥想
  TIMER: 'timer'            // 冥想计时
}

export const MEDITATION_TYPE_INFO = {
  [MEDITATION_TYPE.BASIC]: { label: '基础冥想', icon: '🧘', color: '#52C41A' },
  [MEDITATION_TYPE.GUIDED]: { label: '引导式冥想', icon: '🎧', color: '#1890FF' },
  [MEDITATION_TYPE.TIMER]: { label: '冥想计时', icon: '⏱️', color: '#722ED1' }
}

// 呼吸训练类型
export const BREATHING_TYPE = {
  BASIC: 'basic',           // 基础呼吸
  GAME: 'game',             // 呼吸游戏
  RELAXATION: 'relaxation'  // 放松技巧
}

export const BREATHING_TYPE_INFO = {
  [BREATHING_TYPE.BASIC]: { label: '基础呼吸', icon: '💨', color: '#52C41A' },
  [BREATHING_TYPE.GAME]: { label: '呼吸游戏', icon: '🎮', color: '#FA8C16' },
  [BREATHING_TYPE.RELAXATION]: { label: '放松技巧', icon: '🌿', color: '#1890FF' }
}

// 正念游戏类型
export const MINDFULNESS_GAME_TYPE = {
  FOCUS: 'focus',           // 专注力训练
  RELAX: 'relax',           // 放松挑战
  AWARENESS: 'awareness'    // 觉察练习
}

export const GAME_TYPE_INFO = {
  [MINDFULNESS_GAME_TYPE.FOCUS]: { label: '专注力训练', icon: '🎯', color: '#F5222D' },
  [MINDFULNESS_GAME_TYPE.RELAX]: { label: '放松挑战', icon: '🌸', color: '#722ED1' },
  [MINDFULNESS_GAME_TYPE.AWARENESS]: { label: '觉察练习', icon: '🔔', color: '#FA8C16' }
}

// localStorage keys
const MEDITATION_PROGRESS_KEY = 'mg_meditation_progress'
const BREATHING_PROGRESS_KEY = 'mg_breathing_progress'
const GAME_PROGRESS_KEY = 'mg_game_progress'

// ============================================================================
// Mock Data: Meditation Sessions
// ============================================================================

const MOCK_MEDITATIONS = [
  {
    id: 'med_1',
    title: '清晨静心',
    description: '适合早晨起床后进行的简短冥想，帮助清醒头脑',
    duration: 300, // 5分钟
    type: MEDITATION_TYPE.BASIC,
    difficulty: 1,
    steps: [
      '找一个舒适的坐姿，背部挺直但放松',
      '轻轻闭上眼睛，做几次深呼吸',
      '将注意力放在呼吸上，感受空气进入身体',
      '如果思绪飘走，温柔地把它带回来',
      '继续专注于呼吸，直到闹钟响起'
    ]
  },
  {
    id: 'med_2',
    title: '身体扫描',
    description: '从头到脚扫描身体，感受每个部位的放松',
    duration: 600, // 10分钟
    type: MEDITATION_TYPE.GUIDED,
    difficulty: 2,
    steps: [
      '躺下或坐在舒适的位置',
      '先放松全身肌肉，从脚开始',
      '慢慢向上移动注意力，扫描每个身体部位',
      '感受每个部位的重量和温度',
      '将放松的感觉带到全身'
    ]
  },
  {
    id: 'med_3',
    title: '专注呼吸',
    description: '纯呼吸练习，培养专注力',
    duration: 300,
    type: MEDITATION_TYPE.TIMER,
    difficulty: 1,
    steps: [
      '舒适坐姿，脊柱挺直',
      '闭眼，将注意力集中在鼻尖',
      '感受呼吸时空气的冷热流动',
      '计数呼吸，从1到10，循环往复',
      '分心时重新回到计数'
    ]
  },
  {
    id: 'med_4',
    title: '感恩冥想',
    description: '培养感恩之心的引导式冥想',
    duration: 480, // 8分钟
    type: MEDITATION_TYPE.GUIDED,
    difficulty: 2,
    steps: [
      '找一个安静的地方坐好',
      '深呼吸三次，放松身体',
      '想想今天值得感恩的三件事',
      '感受感恩带来的温暖',
      '将这份感恩扩展到更多人'
    ]
  },
  {
    id: 'med_5',
    title: '睡前放松',
    description: '帮助入睡的简短冥想',
    duration: 600,
    type: MEDITATION_TYPE.GUIDED,
    difficulty: 1,
    steps: [
      '躺在床上，舒服地伸展身体',
      '从脚开始，逐个放松每个肌肉群',
      '呼吸变得缓慢而深沉',
      '想象一个宁静的地方',
      '让自己慢慢进入睡眠'
    ]
  }
]

// ============================================================================
// Mock Data: Breathing Exercises
// ============================================================================

const MOCK_BREATHING_EXERCISES = [
  {
    id: 'breath_1',
    title: '4-7-8 呼吸法',
    description: '帮助放松和入睡的呼吸技巧',
    duration: 180,
    type: BREATHING_TYPE.BASIC,
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 4,
    steps: [
      '用鼻子轻轻吸气，数4下',
      '屏住呼吸，数7下',
      '用嘴巴缓慢呼气，数8下',
      '重复这个循环'
    ]
  },
  {
    id: 'breath_2',
    title: '平静之海',
    description: '像海浪一样的呼吸节奏',
    duration: 240,
    type: BREATHING_TYPE.BASIC,
    inhale: 4,
    hold: 2,
    exhale: 6,
    cycles: 6,
    steps: [
      '坐直，放松肩膀',
      '吸气，像海浪慢慢涌起（4秒）',
      '短暂屏住呼吸',
      '呼气，像海浪缓缓退去（6秒）',
      '感受呼吸的节奏感'
    ]
  },
  {
    id: 'breath_3',
    title: '呼吸追逐',
    description: '跟随圆圈大小变化进行呼吸',
    duration: 180,
    type: BREATHING_TYPE.GAME,
    inhale: 4,
    hold: 0,
    exhale: 4,
    cycles: 6,
    steps: [
      '看着呼吸指示圆圈',
      '圆圈变大时吸气',
      '圆圈缩小时呼气',
      '保持呼吸平稳',
      '专注于圆圈的节奏'
    ]
  },
  {
    id: 'breath_4',
    title: '色彩呼吸',
    description: '用想象色彩来引导呼吸',
    duration: 300,
    type: BREATHING_TYPE.GAME,
    inhale: 5,
    hold: 2,
    exhale: 5,
    cycles: 5,
    steps: [
      '想象自己吸入蓝色的平静',
      '屏气时感受平静在体内扩散',
      '呼气时释放所有紧张',
      '每次呼吸让平静更深',
      '结束时感受全身放松'
    ]
  },
  {
    id: 'breath_5',
    title: '渐进式放松',
    description: '结合呼吸和肌肉放松',
    duration: 360,
    type: BREATHING_TYPE.RELAXATION,
    inhale: 4,
    hold: 2,
    exhale: 6,
    cycles: 6,
    steps: [
      '深吸一口气，同时紧绷脚部肌肉',
      '呼气时放松脚部',
      '深吸气，紧绷小腿',
      '呼气时放松',
      '继续向上移动到全身'
    ]
  }
]

// ============================================================================
// Mock Data: Mindfulness Games
// ============================================================================

const MOCK_MINDFULNESS_GAMES = [
  {
    id: 'game_1',
    title: '数字专注',
    description: '按顺序点击1-25，训练专注力',
    type: MINDFULNESS_GAME_TYPE.FOCUS,
    difficulty: 1,
    gridSize: 5,
    timeLimit: 60,
    tips: [
      '保持平稳呼吸',
      '不要急躁，一步一步来',
      '眼睛扫视整个画面'
    ]
  },
  {
    id: 'game_2',
    title: '记忆花园',
    description: '记住花朵出现的位置和顺序',
    type: MINDFULNESS_GAME_TYPE.FOCUS,
    difficulty: 2,
    levels: 5,
    tips: [
      '先观察，不要着急点击',
      '可以分批记忆',
      '保持冷静很重要'
    ]
  },
  {
    id: 'game_3',
    title: '呼吸同步',
    description: '跟随呼吸节奏点击圆圈',
    type: MINDFULNESS_GAME_TYPE.RELAX,
    difficulty: 1,
    rounds: 10,
    tips: [
      '让呼吸自然平稳',
      '不要刻意控制节奏',
      '专注于当下'
    ]
  },
  {
    id: 'game_4',
    title: '放松挑战',
    description: '在限定时间内保持身体完全放松',
    type: MINDFULNESS_GAME_TYPE.RELAX,
    difficulty: 2,
    duration: 30,
    tips: [
      '先紧绷再放松更容易',
      '感受每一块肌肉',
      '不要勉强自己'
    ]
  },
  {
    id: 'game_5',
    title: '五感探索',
    description: '说出看到、听到、触摸到的5样东西',
    type: MINDFULNESS_GAME_TYPE.AWARENESS,
    difficulty: 1,
    duration: 120,
    tips: [
      '从视觉开始',
      '倾听周围的声音',
      '感受身体的触觉'
    ]
  },
  {
    id: 'game_6',
    title: '情绪天气',
    description: '观察并命名当前的"情绪天气"',
    type: MINDFULNESS_GAME_TYPE.AWARENESS,
    difficulty: 2,
    duration: 180,
    tips: [
      '情绪像天气，会来也会走',
      '不要评判，只是观察',
      '给情绪命名可以帮助平静'
    ]
  }
]

// ============================================================================
// Store Definition
// ============================================================================

export const useMindfulnessStore = defineStore('mindfulness', () => {
  const babyStore = useBabyStore()

  // ---------- State ----------

  const meditations = ref([])
  const breathingExercises = ref([])
  const mindfulnessGames = ref([])

  const meditationProgress = ref({})
  const breathingProgress = ref({})
  const gameProgress = ref({})

  const currentMeditationId = ref(null)
  const currentBreathingId = ref(null)
  const currentGameId = ref(null)

  // ---------- Computed ----------

  const currentBabyId = computed(() => babyStore.currentBabyId)

  // 已完成的冥想数
  const completedMeditationsCount = computed(() => {
    return Object.values(meditationProgress.value).filter(p => p.completed).length
  })

  // 已完成的呼吸训练数
  const completedBreathingCount = computed(() => {
    return Object.values(breathingProgress.value).filter(p => p.completed).length
  })

  // 已完成的游戏数
  const completedGamesCount = computed(() => {
    return Object.values(gameProgress.value).filter(p => p.completed).length
  })

  // 获取当前冥想
  const currentMeditation = computed(() => {
    if (!currentMeditationId.value) return null
    return meditations.value.find(m => m.id === currentMeditationId.value)
  })

  // 获取当前呼吸训练
  const currentBreathing = computed(() => {
    if (!currentBreathingId.value) return null
    return breathingExercises.value.find(b => b.id === currentBreathingId.value)
  })

  // 获取当前游戏
  const currentGame = computed(() => {
    if (!currentGameId.value) return null
    return mindfulnessGames.value.find(g => g.id === currentGameId.value)
  })

  // 统计信息
  const statistics = computed(() => ({
    meditationsCompleted: completedMeditationsCount.value,
    meditationsTotal: meditations.value.length,
    breathingCompleted: completedBreathingCount.value,
    breathingTotal: breathingExercises.value.length,
    gamesCompleted: completedGamesCount.value,
    gamesTotal: mindfulnessGames.value.length,
    totalScore: calculateTotalScore()
  }))

  // ---------- Helper Functions ----------

  const calculateTotalScore = () => {
    let score = 0
    Object.values(meditationProgress.value).forEach(p => {
      if (p.completed) score += (p.score || 0)
    })
    Object.values(breathingProgress.value).forEach(p => {
      if (p.completed) score += (p.score || 0)
    })
    Object.values(gameProgress.value).forEach(p => {
      if (p.completed) score += (p.score || 0)
    })
    return score
  }

  const generateId = (prefix) => {
    return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`
  }

  // ---------- Init ----------

  const init = () => {
    loadMeditations()
    loadBreathingExercises()
    loadMindfulnessGames()
    loadProgress()
  }

  // ---------- Meditation Methods ----------

  const loadMeditations = () => {
    meditations.value = MOCK_MEDITATIONS
  }

  const loadProgress = () => {
    try {
      const storedMeditation = uni.getStorageSync(MEDITATION_PROGRESS_KEY)
      if (storedMeditation) meditationProgress.value = JSON.parse(storedMeditation)

      const storedBreathing = uni.getStorageSync(BREATHING_PROGRESS_KEY)
      if (storedBreathing) breathingProgress.value = JSON.parse(storedBreathing)

      const storedGame = uni.getStorageSync(GAME_PROGRESS_KEY)
      if (storedGame) gameProgress.value = JSON.parse(storedGame)
    } catch (e) {
      console.error('[MindfulnessStore] 加载进度失败:', e)
    }
  }

  const saveMeditationProgress = () => {
    try {
      uni.setStorageSync(MEDITATION_PROGRESS_KEY, JSON.stringify(meditationProgress.value))
    } catch (e) {
      console.error('[MindfulnessStore] 保存冥想进度失败:', e)
    }
  }

  const selectMeditation = (meditationId) => {
    currentMeditationId.value = meditationId
  }

  const completeMeditation = (meditationId, duration) => {
    const meditation = meditations.value.find(m => m.id === meditationId)
    if (!meditation) return

    const progress = meditationProgress.value[meditationId] || {}
    progress.completed = true
    progress.completedAt = new Date().toISOString()
    progress.actualDuration = duration

    // 根据实际时长计算分数
    if (duration >= meditation.duration * 0.8) {
      progress.score = 3
    } else if (duration >= meditation.duration * 0.5) {
      progress.score = 2
    } else {
      progress.score = 1
    }

    meditationProgress.value[meditationId] = progress
    saveMeditationProgress()

    return { score: progress.score }
  }

  const getMeditationProgress = (meditationId) => {
    return meditationProgress.value[meditationId] || { completed: false, attempts: 0 }
  }

  // ---------- Breathing Methods ----------

  const loadBreathingExercises = () => {
    breathingExercises.value = MOCK_BREATHING_EXERCISES
  }

  const saveBreathingProgress = () => {
    try {
      uni.setStorageSync(BREATHING_PROGRESS_KEY, JSON.stringify(breathingProgress.value))
    } catch (e) {
      console.error('[MindfulnessStore] 保存呼吸进度失败:', e)
    }
  }

  const selectBreathing = (breathingId) => {
    currentBreathingId.value = breathingId
  }

  const completeBreathing = (breathingId, cyclesCompleted) => {
    const breathing = breathingExercises.value.find(b => b.id === breathingId)
    if (!breathing) return

    const progress = breathingProgress.value[breathingId] || {}
    progress.completed = true
    progress.completedAt = new Date().toISOString()
    progress.cyclesCompleted = cyclesCompleted

    // 根据完成圈数计算分数
    if (cyclesCompleted >= breathing.cycles) {
      progress.score = 3
    } else if (cyclesCompleted >= breathing.cycles * 0.5) {
      progress.score = 2
    } else {
      progress.score = 1
    }

    breathingProgress.value[breathingId] = progress
    saveBreathingProgress()

    return { score: progress.score }
  }

  const getBreathingProgress = (breathingId) => {
    return breathingProgress.value[breathingId] || { completed: false, cycles: 0 }
  }

  // ---------- Game Methods ----------

  const loadMindfulnessGames = () => {
    mindfulnessGames.value = MOCK_MINDFULNESS_GAMES
  }

  const saveGameProgress = () => {
    try {
      uni.setStorageSync(GAME_PROGRESS_KEY, JSON.stringify(gameProgress.value))
    } catch (e) {
      console.error('[MindfulnessStore] 保存游戏进度失败:', e)
    }
  }

  const selectGame = (gameId) => {
    currentGameId.value = gameId
  }

  const completeGame = (gameId, score) => {
    const game = mindfulnessGames.value.find(g => g.id === gameId)
    if (!game) return

    const progress = gameProgress.value[gameId] || {}
    progress.completed = true
    progress.completedAt = new Date().toISOString()
    progress.bestScore = Math.max(progress.bestScore || 0, score)

    // 根据游戏得分计算星级
    if (score >= 90) {
      progress.stars = 3
    } else if (score >= 70) {
      progress.stars = 2
    } else {
      progress.stars = 1
    }

    gameProgress.value[gameId] = progress
    saveGameProgress()

    return { stars: progress.stars, bestScore: progress.bestScore }
  }

  const getGameProgress = (gameId) => {
    return gameProgress.value[gameId] || { completed: false, bestScore: 0 }
  }

  // ---------- Clear ----------

  const clearCurrentMeditation = () => {
    currentMeditationId.value = null
  }

  const clearCurrentBreathing = () => {
    currentBreathingId.value = null
  }

  const clearCurrentGame = () => {
    currentGameId.value = null
  }

  return {
    // State
    meditations,
    breathingExercises,
    mindfulnessGames,
    meditationProgress,
    breathingProgress,
    gameProgress,
    currentMeditationId,
    currentBreathingId,
    currentGameId,

    // Computed
    currentBabyId,
    completedMeditationsCount,
    completedBreathingCount,
    completedGamesCount,
    currentMeditation,
    currentBreathing,
    currentGame,
    statistics,

    // Methods
    init,
    selectMeditation,
    completeMeditation,
    getMeditationProgress,
    selectBreathing,
    completeBreathing,
    getBreathingProgress,
    selectGame,
    completeGame,
    getGameProgress,
    clearCurrentMeditation,
    clearCurrentBreathing,
    clearCurrentGame
  }
})
