/**
 * Study Room Store
 * 自习室状态管理 - Pinia Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import studyService from '../services/studyService'

export const useStudyStore = defineStore('study', () => {
  // ============ 状态 ============
  
  // 学习状态
  const studyState = ref({
    isRunning: false,
    isPaused: false,
    currentScene: 'library',  // library, forest, sea, rain
    currentTask: '',
    startTime: null,
    elapsedSeconds: 0
  })
  
  // 背景音状态
  const ambientState = ref({
    isAmbientPlaying: false,
    ambientScene: 'rain',  // rain, thunder, ocean, forest, fire, wind, cafe, night
    volume: 70,
    ambientTimerSeconds: 0
  })
  
  // 配置
  const studyConfig = ref(studyService.getStudyConfig())
  
  let studyTimer = null
  let ambientTimer = null
  
  // ============ 计算属性 ============
  
  // 格式化学习时间
  const formattedStudyTime = computed(() => {
    const minutes = Math.floor(studyState.value.elapsedSeconds / 60)
    const seconds = studyState.value.elapsedSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })
  
  // 今日学习统计
  const todayStudyStats = computed(() => {
    return studyService.getTodayStudyStats()
  })
  
  // 本周学习统计
  const weekStudyStats = computed(() => {
    return studyService.getWeekStudyStats()
  })
  
  // 总学习分钟数
  const totalStudyMinutes = computed(() => {
    return studyService.getTotalStudyMinutes()
  })
  
  // ============ 学习计时方法 ============
  
  const init = () => {
    studyConfig.value = studyService.getStudyConfig()
    studyState.value.currentScene = studyConfig.value.defaultScene || 'library'
  }
  
  const cleanup = () => {
    if (studyTimer) {
      clearInterval(studyTimer)
      studyTimer = null
    }
    if (ambientTimer) {
      clearInterval(ambientTimer)
      ambientTimer = null
    }
  }
  
  const startStudy = (task = '') => {
    if (studyTimer) {
      clearInterval(studyTimer)
    }
    
    studyState.value = {
      isRunning: true,
      isPaused: false,
      currentScene: studyState.value.currentScene,
      currentTask: task,
      startTime: new Date().toISOString(),
      elapsedSeconds: 0
    }
    
    studyTimer = setInterval(() => {
      if (studyState.value.isRunning && !studyState.value.isPaused) {
        studyState.value.elapsedSeconds++
      }
    }, 1000)
    
    // 发送通知
    uni.$emit('studyStart', { scene: studyState.value.currentScene, task })
  }
  
  const pauseStudy = () => {
    studyState.value.isPaused = true
    uni.$emit('studyPause')
  }
  
  const resumeStudy = () => {
    studyState.value.isPaused = false
    uni.$emit('studyResume')
  }
  
  const stopStudy = () => {
    if (studyTimer) {
      clearInterval(studyTimer)
      studyTimer = null
    }
    
    // 记录学习
    if (studyState.value.elapsedSeconds > 0) {
      const duration = Math.ceil(studyState.value.elapsedSeconds / 60)
      studyService.addStudyRecord({
        duration,
        scene: studyState.value.currentScene,
        task: studyState.value.currentTask,
        completed: true
      })
    }
    
    const completedSession = {
      scene: studyState.value.currentScene,
      task: studyState.value.currentTask,
      duration: Math.ceil(studyState.value.elapsedSeconds / 60),
      elapsedSeconds: studyState.value.elapsedSeconds
    }
    
    studyState.value = {
      isRunning: false,
      isPaused: false,
      currentScene: studyState.value.currentScene,
      currentTask: '',
      startTime: null,
      elapsedSeconds: 0
    }
    
    // 发送通知
    uni.$emit('studyStop', completedSession)
  }
  
  const setScene = (sceneId) => {
    studyState.value.currentScene = sceneId
    studyConfig.value.defaultScene = sceneId
    studyService.saveStudyConfig(studyConfig.value)
  }
  
  const setBreakInterval = (minutes) => {
    studyConfig.value.breakInterval = minutes
    studyService.saveStudyConfig(studyConfig.value)
  }
  
  // ============ 背景音方法 ============
  
  const setAmbientScene = (sceneId) => {
    ambientState.value.ambientScene = sceneId
  }
  
  const setVolume = (volume) => {
    ambientState.value.volume = volume
  }
  
  const toggleAmbient = () => {
    ambientState.value.isAmbientPlaying = !ambientState.value.isAmbientPlaying
  }
  
  const setAmbientTimer = (seconds) => {
    ambientState.value.ambientTimerSeconds = seconds
  }
  
  const playAmbient = () => {
    ambientState.value.isAmbientPlaying = true
    if (ambientTimer) {
      clearInterval(ambientTimer)
    }
    ambientTimer = setInterval(() => {
      ambientState.value.ambientTimerSeconds++
    }, 1000)
  }
  
  const stopAmbient = () => {
    ambientState.value.isAmbientPlaying = false
    if (ambientTimer) {
      clearInterval(ambientTimer)
      ambientTimer = null
    }
  }
  
  // ============ 记录获取方法 ============
  
  const getStudyRecords = () => {
    return studyService.getStudyRecords()
  }
  
  return {
    // 状态
    studyState,
    ambientState,
    studyConfig,
    
    // 计算属性
    formattedStudyTime,
    todayStudyStats,
    weekStudyStats,
    totalStudyMinutes,
    
    // 学习方法
    init,
    cleanup,
    startStudy,
    pauseStudy,
    resumeStudy,
    stopStudy,
    setScene,
    setBreakInterval,
    
    // 背景音方法
    setAmbientScene,
    setVolume,
    toggleAmbient,
    setAmbientTimer,
    playAmbient,
    stopAmbient,
    
    // 记录方法
    getStudyRecords
  }
})
