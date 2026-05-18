/**
 * V49 Creative Arts Studio Store
 * 创意艺术工作室 Store - 绘画/音乐/舞蹈/戏剧等艺术创作，记录孩子艺术成长轨迹，与成就系统联动奖励
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import artStudioService from '@/services/artStudioService.js'

export const useArtStudioStore = defineStore('artStudio', () => {
  // =========================================================================
  // 状态
  // =========================================================================
  
  // 作品列表
  const artWorks = ref([])
  const favoriteWorks = ref([])
  
  // 艺术挑战
  const artChallenges = ref([])
  const myChallenges = ref([])
  
  // 艺术积分
  const artPoints = ref({ totalPoints: 0, level: 1, totalWorks: 0, totalHours: 0 })
  const weeklyStats = ref({ worksCount: 0, totalPoints: 0, byType: {} })
  
  // 创作时间线
  const timeline = ref([])
  
  // 成就
  const achievements = ref([])
  const unlockedAchievements = ref([])
  
  // UI 状态
  const currentTab = ref('create') // create | portfolio | challenges
  const selectedArtType = ref('drawing')
  const currentWork = ref(null)
  
  // 绘画板状态
  const drawingBoard = ref({
    currentTool: 'brush',
    currentColor: '#000000',
    lineWidth: 5,
    history: [],
    historyIndex: -1,
    isDrawing: false
  })
  
  // 音乐创作状态
  const musicCreator = ref({
    tempo: 'moderate',
    instrument: 'piano',
    beats: [],
    isRecording: false,
    recordingTime: 0
  })
  
  // =========================================================================
  // 初始化
  // =========================================================================
  
  const init = () => {
    loadArtWorks()
    loadArtChallenges()
    loadArtPoints()
    loadWeeklyStats()
    loadTimeline()
    loadAchievements()
  }
  
  // =========================================================================
  // 加载方法
  // =========================================================================
  
  const loadArtWorks = () => {
    artWorks.value = artStudioService.getArtWorks()
    favoriteWorks.value = artWorks.value.filter(w => w.isFavorite)
  }
  
  const loadArtChallenges = () => {
    artChallenges.value = artStudioService.getArtChallenges()
    myChallenges.value = artChallenges.value.filter(c => c.isJoined)
  }
  
  const loadArtPoints = () => {
    artPoints.value = artStudioService.getArtPoints()
  }
  
  const loadWeeklyStats = () => {
    weeklyStats.value = artStudioService.getWeeklyArtStats()
  }
  
  const loadTimeline = () => {
    timeline.value = artStudioService.getArtTimeline()
  }
  
  const loadAchievements = () => {
    achievements.value = artStudioService.getArtAchievements()
    unlockedAchievements.value = achievements.value.filter(a => a.isUnlocked)
  }
  
  // =========================================================================
  // 作品管理方法
  // =========================================================================
  
  const saveArtWork = (workData) => {
    const newWork = artStudioService.saveArtWork({
      ...workData,
      type: selectedArtType.value
    })
    if (newWork) {
      loadArtWorks()
      loadArtPoints()
      loadWeeklyStats()
      loadTimeline()
      checkAndUnlockAchievements()
      return newWork
    }
    return null
  }
  
  const deleteArtWork = (workId) => {
    const success = artStudioService.deleteArtWork(workId)
    if (success) {
      loadArtWorks()
      loadTimeline()
    }
    return success
  }
  
  const toggleFavorite = (workId) => {
    const result = artStudioService.toggleFavorite(workId)
    if (result !== false) {
      loadArtWorks()
    }
    return result
  }
  
  const shareArtWork = (workId) => {
    const success = artStudioService.shareArtWork(workId)
    if (success) {
      loadArtWorks()
      loadArtPoints()
    }
    return success
  }
  
  // =========================================================================
  // 挑战管理方法
  // =========================================================================
  
  const joinChallenge = (challengeId) => {
    const success = artStudioService.joinArtChallenge(challengeId)
    if (success) {
      loadArtChallenges()
    }
    return success
  }
  
  const updateChallengeProgress = (challengeId, progress) => {
    const success = artStudioService.updateChallengeProgress(challengeId, progress)
    if (success) {
      loadArtChallenges()
    }
    return success
  }
  
  // =========================================================================
  // 绘画板方法
  // =========================================================================
  
  const setDrawingTool = (tool) => {
    drawingBoard.value.currentTool = tool
  }
  
  const setDrawingColor = (color) => {
    drawingBoard.value.currentColor = color
  }
  
  const setLineWidth = (width) => {
    drawingBoard.value.lineWidth = width
  }
  
  const saveDrawingHistory = (data) => {
    // 保存绘制历史用于撤销
    const historyData = {
      data: data,
      tool: drawingBoard.value.currentTool,
      color: drawingBoard.value.currentColor,
      lineWidth: drawingBoard.value.lineWidth
    }
    
    // 如果当前不在历史末端，截断后面的历史
    if (drawingBoard.value.historyIndex < drawingBoard.value.history.length - 1) {
      drawingBoard.value.history = drawingBoard.value.history.slice(0, drawingBoard.value.historyIndex + 1)
    }
    
    drawingBoard.value.history.push(historyData)
    drawingBoard.value.historyIndex = drawingBoard.value.history.length - 1
    
    // 限制历史记录数量
    if (drawingBoard.value.history.length > 50) {
      drawingBoard.value.history.shift()
      drawingBoard.value.historyIndex--
    }
  }
  
  const undoDrawing = () => {
    if (drawingBoard.value.historyIndex > 0) {
      drawingBoard.value.historyIndex--
      return drawingBoard.value.history[drawingBoard.value.historyIndex]
    }
    return null
  }
  
  const redoDrawing = () => {
    if (drawingBoard.value.historyIndex < drawingBoard.value.history.length - 1) {
      drawingBoard.value.historyIndex++
      return drawingBoard.value.history[drawingBoard.value.historyIndex]
    }
    return null
  }
  
  const clearDrawingBoard = () => {
    drawingBoard.value.history = []
    drawingBoard.value.historyIndex = -1
    drawingBoard.value.isDrawing = false
  }
  
  // =========================================================================
  // 音乐创作方法
  // =========================================================================
  
  const setMusicTempo = (tempo) => {
    musicCreator.value.tempo = tempo
  }
  
  const setMusicInstrument = (instrument) => {
    musicCreator.value.instrument = instrument
  }
  
  const addBeat = (beat) => {
    musicCreator.value.beats.push(beat)
  }
  
  const clearBeats = () => {
    musicCreator.value.beats = []
    musicCreator.value.recordingTime = 0
  }
  
  const startRecording = () => {
    musicCreator.value.isRecording = true
    musicCreator.value.recordingTime = 0
    musicCreator.value.beats = []
  }
  
  const stopRecording = () => {
    musicCreator.value.isRecording = false
  }
  
  // =========================================================================
  // AI 建议
  // =========================================================================
  
  const getAiSuggestions = (artType) => {
    return artStudioService.generateAiSuggestions(artType || selectedArtType.value)
  }
  
  // =========================================================================
  // 成就检查
  // =========================================================================
  
  const checkAndUnlockAchievements = () => {
    const unlocked = artStudioService.checkAndUnlockAchievements()
    if (unlocked.length > unlockedAchievements.value.length) {
      loadAchievements()
      return unlocked[unlocked.length - 1] // 返回新解锁的成就
    }
    return null
  }
  
  // =========================================================================
  // 计算属性
  // =========================================================================
  
  // 按类型筛选作品
  const worksByType = computed(() => {
    return (type) => artWorks.value.filter(w => w.type === type)
  })
  
  // 作品总数
  const totalWorks = computed(() => artWorks.value.length)
  
  // 活跃挑战数
  const activeChallenges = computed(() => {
    return artChallenges.value.filter(c => c.status === 'active')
  })
  
  // 我的挑战进度
  const myChallengeProgress = computed(() => {
    const joined = artChallenges.value.filter(c => c.isJoined)
    const completed = joined.filter(c => c.progress >= 100)
    return {
      total: joined.length,
      completed: completed.length,
      inProgress: joined.length - completed.length
    }
  })
  
  // 艺术等级
  const artLevel = computed(() => artPoints.value.level)
  
  // 距离下一级还需要多少积分
  const pointsToNextLevel = computed(() => {
    const currentLevelPoints = (artPoints.value.level - 1) * 100
    return 100 - (artPoints.value.totalPoints - currentLevelPoints)
  })
  
  // 艺术类型列表
  const artTypes = computed(() => Object.values(artStudioService.ART_TYPES))
  
  // 绘画工具列表
  const drawingTools = computed(() => Object.values(artStudioService.DRAWING_TOOLS))
  
  // 绘画颜色列表
  const drawingColors = computed(() => artStudioService.DRAWING_COLORS)
  
  // 音乐节拍列表
  const musicTempos = computed(() => Object.values(artStudioService.MUSIC_TEMPOS))
  
  // 乐器列表
  const musicInstruments = computed(() => artStudioService.MUSIC_INSTRUMENTS)
  
  return {
    // 状态
    artWorks,
    favoriteWorks,
    artChallenges,
    myChallenges,
    artPoints,
    weeklyStats,
    timeline,
    achievements,
    unlockedAchievements,
    currentTab,
    selectedArtType,
    currentWork,
    drawingBoard,
    musicCreator,
    
    // 初始化
    init,
    
    // 加载方法
    loadArtWorks,
    loadArtChallenges,
    loadArtPoints,
    loadWeeklyStats,
    loadTimeline,
    loadAchievements,
    
    // 作品管理
    saveArtWork,
    deleteArtWork,
    toggleFavorite,
    shareArtWork,
    
    // 挑战管理
    joinChallenge,
    updateChallengeProgress,
    
    // 绘画板
    setDrawingTool,
    setDrawingColor,
    setLineWidth,
    saveDrawingHistory,
    undoDrawing,
    redoDrawing,
    clearDrawingBoard,
    
    // 音乐创作
    setMusicTempo,
    setMusicInstrument,
    addBeat,
    clearBeats,
    startRecording,
    stopRecording,
    
    // AI 建议
    getAiSuggestions,
    
    // 成就
    checkAndUnlockAchievements,
    
    // 计算属性
    worksByType,
    totalWorks,
    activeChallenges,
    myChallengeProgress,
    artLevel,
    pointsToNextLevel,
    artTypes,
    drawingTools,
    drawingColors,
    musicTempos,
    musicInstruments
  }
})
