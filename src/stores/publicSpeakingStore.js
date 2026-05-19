/**
 * V74 Public Speaking Store
 * 演讲与口才系统状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import publicSpeakingService from '@/services/publicSpeakingService.js'

export const usePublicSpeakingStore = defineStore('publicSpeaking', () => {
  // ==================== 状态 ====================
  
  // 演讲模板
  const templates = ref([])
  
  // 当前选中的模板
  const currentTemplate = ref(null)
  
  // 演讲挑战
  const challenges = ref([])
  
  // 当前选中的挑战
  const currentChallenge = ref(null)
  
  // 练习状态
  const isPracticing = ref(false)
  const practiceData = ref(null)
  
  // 挑战状态
  const isChallenging = ref(false)
  const challengeData = ref(null)
  
  // 录音状态
  const isRecording = ref(false)
  const recordings = ref([])
  
  // 用户统计
  const userStats = ref(null)
  
  // 加载状态
  const isLoading = ref(false)

  // ==================== 初始化 ====================
  
  const init = () => {
    loadTemplates()
    loadChallenges()
    loadUserStats()
    loadRecordings()
  }
  
  const loadTemplates = () => {
    templates.value = publicSpeakingService.getTemplates()
  }
  
  const loadChallenges = () => {
    challenges.value = publicSpeakingService.getChallenges()
  }
  
  const loadUserStats = () => {
    userStats.value = publicSpeakingService.getUserStats()
  }
  
  const loadRecordings = () => {
    recordings.value = publicSpeakingService.getRecordings()
  }

  // ==================== 计算属性 ====================
  
  // 分类列表
  const categories = computed(() => publicSpeakingService.getCategories())
  
  // 练习进度
  const practiceProgress = computed(() => publicSpeakingService.getProgress())
  
  // 挑战进度
  const challengeProgress = computed(() => publicSpeakingService.getChallengeProgress())
  
  // 能力评分
  const abilityScores = computed(() => userStats.value?.abilityScores || {
    clarity: 0,
    confidence: 0,
    expression: 0,
    structure: 0
  })
  
  // 积分
  const totalPoints = computed(() => userStats.value?.totalPoints || 0)
  
  // 连续练习天数
  const streakDays = computed(() => userStats.value?.streakDays || 0)
  
  // 累计练习时长
  const totalPracticeTime = computed(() => userStats.value?.totalPracticeTime || 0)

  // ==================== 模板操作 ====================
  
  // 按分类获取模板
  const getTemplatesByCategory = (category) => {
    return publicSpeakingService.getTemplatesByCategory(category)
  }
  
  // 选择模板
  const selectTemplate = (template) => {
    currentTemplate.value = template
  }
  
  // 获取模板
  const getTemplate = (templateId) => {
    return publicSpeakingService.getTemplate(templateId)
  }
  
  // 获取分类信息
  const getCategoryInfo = (categoryId) => {
    return publicSpeakingService.getCategories().find(c => c.id === categoryId)
  }

  // ==================== 挑战操作 ====================
  
  // 按分类获取挑战
  const getChallengesByCategory = (category) => {
    return publicSpeakingService.getChallengesByCategory(category)
  }
  
  // 选择挑战
  const selectChallenge = (challenge) => {
    currentChallenge.value = challenge
  }
  
  // 获取挑战
  const getChallenge = (challengeId) => {
    return publicSpeakingService.getChallenge(challengeId)
  }

  // ==================== 练习操作 ====================
  
  // 开始练习
  const startPractice = (template, practiceInfo = {}) => {
    isPracticing.value = true
    practiceData.value = {
      templateId: template.id,
      startTime: Date.now(),
      duration: template.duration,
      ...practiceInfo
    }
  }
  
  // 更新练习数据
  const updatePracticeData = (data) => {
    practiceData.value = { ...practiceData.value, ...data }
  }
  
  // 完成练习
  const completePractice = (score, practiceResult) => {
    if (!practiceData.value) return null
    
    const result = publicSpeakingService.completePractice(
      practiceData.value.templateId,
      score,
      { ...practiceData.value, ...practiceResult }
    )
    
    isPracticing.value = false
    practiceData.value = null
    loadUserStats()
    
    return result
  }
  
  // 取消练习
  const cancelPractice = () => {
    isPracticing.value = false
    practiceData.value = null
  }

  // ==================== 挑战操作 ====================
  
  // 开始挑战
  const startChallenge = (challenge, challengeInfo = {}) => {
    isChallenging.value = true
    challengeData.value = {
      challengeId: challenge.id,
      startTime: Date.now(),
      duration: challenge.duration,
      ...challengeInfo
    }
  }
  
  // 更新挑战数据
  const updateChallengeData = (data) => {
    challengeData.value = { ...challengeData.value, ...data }
  }
  
  // 完成挑战
  const completeChallenge = (score, challengeResult) => {
    if (!challengeData.value) return null
    
    const result = publicSpeakingService.completeChallenge(
      challengeData.value.challengeId,
      score,
      { ...challengeData.value, ...challengeResult }
    )
    
    isChallenging.value = false
    challengeData.value = null
    loadUserStats()
    
    return result
  }
  
  // 取消挑战
  const cancelChallenge = () => {
    isChallenging.value = false
    challengeData.value = null
  }

  // ==================== 录音操作 ====================
  
  // 开始录音
  const startRecording = (recordingInfo = {}) => {
    isRecording.value = true
    return true
  }
  
  // 停止录音
  const stopRecording = (recordingData) => {
    isRecording.value = false
    const recording = publicSpeakingService.saveRecording(recordingData)
    loadRecordings()
    return recording
  }
  
  // 删除录音
  const deleteRecording = (recordingId) => {
    const success = publicSpeakingService.deleteRecording(recordingId)
    if (success) {
      loadRecordings()
    }
    return success
  }
  
  // 获取录音列表
  const getRecordings = () => {
    return publicSpeakingService.getRecordings()
  }

  // ==================== 数据查询 ====================
  
  // 获取已完成练习
  const getCompletedPractices = () => {
    return publicSpeakingService.getCompletedPractices()
  }
  
  // 获取挑战记录
  const getChallengeRecords = () => {
    return publicSpeakingService.getChallengeRecords()
  }
  
  // 获取语速训练数据
  const getPacingTraining = () => {
    return publicSpeakingService.getPacingTraining()
  }
  
  // 获取停顿训练数据
  const getPauseTraining = () => {
    return publicSpeakingService.getPauseTraining()
  }

  return {
    // 状态
    templates,
    currentTemplate,
    challenges,
    currentChallenge,
    isPracticing,
    practiceData,
    isChallenging,
    challengeData,
    isRecording,
    recordings,
    userStats,
    isLoading,
    
    // 计算属性
    categories,
    practiceProgress,
    challengeProgress,
    abilityScores,
    totalPoints,
    streakDays,
    totalPracticeTime,
    
    // 方法 - 初始化
    init,
    loadTemplates,
    loadChallenges,
    loadUserStats,
    loadRecordings,
    
    // 方法 - 模板操作
    getTemplatesByCategory,
    selectTemplate,
    getTemplate,
    getCategoryInfo,
    
    // 方法 - 挑战操作
    getChallengesByCategory,
    selectChallenge,
    getChallenge,
    
    // 方法 - 练习操作
    startPractice,
    updatePracticeData,
    completePractice,
    cancelPractice,
    
    // 方法 - 挑战操作
    startChallenge,
    updateChallengeData,
    completeChallenge,
    cancelChallenge,
    
    // 方法 - 录音操作
    startRecording,
    stopRecording,
    deleteRecording,
    getRecordings,
    
    // 方法 - 数据查询
    getCompletedPractices,
    getChallengeRecords,
    getPacingTraining,
    getPauseTraining
  }
})
