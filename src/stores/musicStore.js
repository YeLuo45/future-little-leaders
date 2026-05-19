/**
 * V66 Music & Rhythm Store
 * 音乐与节奏状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import {
  getMusicLibrary,
  filterMusic,
  getInstrumentsLibrary,
  filterInstruments,
  getInstrumentsByFamily,
  getRhythmGames,
  getMusicKnowledge,
  getMusicStats,
  addMusicRecord,
  MUSIC_CATEGORIES,
  INSTRUMENT_FAMILIES,
  RHYTHM_DIFFICULTIES
} from '@/services/musicService.js'

export const useMusicStore = defineStore('music', () => {
  // ==================== 状态 ====================

  // 音乐库
  const musicLibrary = ref([])
  const currentMusic = ref(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)

  // 乐器库
  const instrumentsLibrary = ref([])
  const instrumentFamilies = ref({})
  const currentInstrument = ref(null)

  // 节奏游戏
  const rhythmGames = ref([])
  const currentGame = ref(null)
  const gameScore = ref(0)
  const gameAccuracy = ref(0)

  // 音乐知识
  const musicKnowledge = ref([])

  // 统计数据
  const musicStats = ref(null)

  // 筛选条件
  const filters = ref({
    category: '',
    genre: '',
    keyword: '',
    mood: ''
  })

  // 乐器筛选
  const instrumentFilter = ref('')

  // 加载状态
  const isLoading = ref(false)

  // 错误信息
  const errorMessage = ref('')

  // ==================== 计算属性 ====================

  const babyStore = useBabyStore()
  const currentBabyId = computed(() => babyStore.currentBabyId)

  // 筛选后的音乐
  const filteredMusic = computed(() => {
    return filterMusic(filters.value)
  })

  // 按分类分组的音乐
  const musicByCategory = computed(() => {
    const grouped = {}
    Object.values(MUSIC_CATEGORIES).forEach(cat => {
      grouped[cat.id] = {
        ...cat,
        items: musicLibrary.value.filter(m => m.category === cat.id)
      }
    })
    return grouped
  })

  // 推荐音乐（适合年龄段）
  const recommendedMusic = computed(() => {
    const age = babyStore.currentBaby?.age || 5
    return musicLibrary.value.filter(m => {
      const matchAge = m.suitableAge.includes('-')
        ? age >= parseInt(m.suitableAge.split('-')[0]) && age <= parseInt(m.suitableAge.split('-')[1].replace('岁', ''))
        : age <= parseInt(m.suitableAge.replace('岁', ''))
      return matchAge && m.difficulty <= 2
    }).slice(0, 5)
  })

  // 可用的节奏游戏
  const availableGames = computed(() => {
    const level = babyStore.currentBaby?.level || 1
    return rhythmGames.value.filter(game => {
      if (game.isUnlocked) return true
      return (game.unlockLevel || 0) <= level
    })
  })

  // 游戏进度
  const gameProgress = computed(() => {
    if (rhythmGames.value.length === 0) return 0
    const unlocked = availableGames.value.length
    const total = rhythmGames.value.length
    return Math.round((unlocked / total) * 100)
  })

  // 播放进度
  const playProgress = computed(() => {
    if (duration.value === 0) return 0
    return Math.round((currentTime.value / duration.value) * 100)
  })

  // ==================== 方法 ====================

  /**
   * 初始化
   */
  const init = () => {
    loadMusicLibrary()
    loadInstrumentsLibrary()
    loadRhythmGames()
    loadMusicKnowledge()
    if (currentBabyId.value) {
      loadMusicStats()
    }
  }

  /**
   * 加载音乐库
   */
  const loadMusicLibrary = () => {
    musicLibrary.value = getMusicLibrary()
  }

  /**
   * 设置筛选条件
   */
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * 清除筛选条件
   */
  const clearFilters = () => {
    filters.value = {
      category: '',
      genre: '',
      keyword: '',
      mood: ''
    }
  }

  /**
   * 播放音乐
   */
  const playMusic = (music) => {
    currentMusic.value = music
    isPlaying.value = true
    duration.value = music.duration || 180
    currentTime.value = 0
    
    // 记录收听
    if (currentBabyId.value) {
      addMusicRecord(currentBabyId.value, {
        type: 'listen',
        musicId: music.id,
        title: music.title,
        category: music.category,
        duration: music.duration
      })
    }
  }

  /**
   * 暂停播放
   */
  const pauseMusic = () => {
    isPlaying.value = false
  }

  /**
   * 停止播放
   */
  const stopMusic = () => {
    isPlaying.value = false
    currentMusic.value = null
    currentTime.value = 0
    duration.value = 0
  }

  /**
   * 更新播放时间
   */
  const updatePlayTime = (time) => {
    currentTime.value = time
  }

  /**
   * 加载乐器库
   */
  const loadInstrumentsLibrary = () => {
    instrumentsLibrary.value = getInstrumentsLibrary()
    instrumentFamilies.value = getInstrumentsByFamily()
  }

  /**
   * 设置乐器筛选
   */
  const setInstrumentFilter = (family) => {
    instrumentFilter.value = family
  }

  /**
   * 获取筛选后的乐器
   */
  const getFilteredInstruments = computed(() => {
    return filterInstruments(instrumentFilter.value)
  })

  /**
   * 查看乐器详情
   */
  const viewInstrument = (instrument) => {
    currentInstrument.value = instrument
    
    // 记录浏览
    if (currentBabyId.value) {
      addMusicRecord(currentBabyId.value, {
        type: 'instrument',
        instrumentId: instrument.id,
        instrumentName: instrument.name,
        family: instrument.family
      })
    }
    
    return instrument
  }

  /**
   * 加载节奏游戏
   */
  const loadRhythmGames = () => {
    rhythmGames.value = getRhythmGames()
  }

  /**
   * 开始游戏
   */
  const startGame = (game) => {
    currentGame.value = {
      ...game,
      startTime: new Date().toISOString(),
      currentScore: 0,
      combo: 0,
      maxCombo: 0,
      accuracy: 100,
      isPlaying: true
    }
    gameScore.value = 0
    gameAccuracy.value = 100
  }

  /**
   * 更新游戏分数
   */
  const updateGameScore = (score, combo, accuracy) => {
    if (currentGame.value) {
      currentGame.value.currentScore = score
      currentGame.value.combo = combo
      currentGame.value.maxCombo = Math.max(currentGame.value.maxCombo, combo)
      currentGame.value.accuracy = accuracy
      gameScore.value = score
      gameAccuracy.value = accuracy
    }
  }

  /**
   * 结束游戏
   */
  const endGame = (finalScore, accuracy) => {
    if (!currentGame.value || !currentBabyId.value) {
      currentGame.value = null
      return null
    }

    const result = {
      gameId: currentGame.value.id,
      title: currentGame.value.title,
      score: finalScore || gameScore.value,
      accuracy: accuracy || gameAccuracy.value,
      maxCombo: currentGame.value.maxCombo,
      playedAt: new Date().toISOString()
    }

    // 记录游戏成绩
    addMusicRecord(currentBabyId.value, {
      type: 'game',
      gameId: currentGame.value.id,
      title: currentGame.value.title,
      score: result.score,
      accuracy: result.accuracy,
      maxCombo: result.maxCombo
    })

    // 更新游戏最高分
    const gameIndex = rhythmGames.value.findIndex(g => g.id === currentGame.value.id)
    if (gameIndex !== -1) {
      rhythmGames.value[gameIndex].playCount++
      if (result.score > rhythmGames.value[gameIndex].maxScore) {
        rhythmGames.value[gameIndex].maxScore = result.score
      }
    }

    currentGame.value = null
    return result
  }

  /**
   * 加载音乐知识
   */
  const loadMusicKnowledge = () => {
    musicKnowledge.value = getMusicKnowledge()
  }

  /**
   * 加载音乐统计
   */
  const loadMusicStats = () => {
    if (!currentBabyId.value) return
    musicStats.value = getMusicStats(currentBabyId.value)
  }

  /**
   * 宝宝切换时重新加载
   */
  const onBabyChange = (babyId) => {
    loadMusicStats()
  }

  // ==================== 暴露 ====================

  return {
    // 状态
    musicLibrary,
    currentMusic,
    isPlaying,
    currentTime,
    duration,
    instrumentsLibrary,
    instrumentFamilies,
    currentInstrument,
    rhythmGames,
    currentGame,
    gameScore,
    gameAccuracy,
    musicKnowledge,
    musicStats,
    filters,
    instrumentFilter,
    isLoading,
    errorMessage,

    // 计算属性
    currentBabyId,
    filteredMusic,
    musicByCategory,
    recommendedMusic,
    availableGames,
    gameProgress,
    playProgress,
    getFilteredInstruments,

    // 方法
    init,
    loadMusicLibrary,
    setFilters,
    clearFilters,
    playMusic,
    pauseMusic,
    stopMusic,
    updatePlayTime,
    loadInstrumentsLibrary,
    setInstrumentFilter,
    viewInstrument,
    loadRhythmGames,
    startGame,
    updateGameScore,
    endGame,
    loadMusicKnowledge,
    loadMusicStats,
    onBabyChange,

    // 常量
    MUSIC_CATEGORIES,
    INSTRUMENT_FAMILIES,
    RHYTHM_DIFFICULTIES
  }
})
