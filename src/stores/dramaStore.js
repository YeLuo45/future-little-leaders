/**
 * V92 Creative Drama Store
 * 创意戏剧系统状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dramaService from '@/services/dramaService.js'

export const useDramaStore = defineStore('drama', () => {
  // ==================== 状态 ====================
  
  // 角色库
  const characters = ref([])
  
  // 已解锁角色
  const unlockedCharacters = ref([])
  
  // 当前选中的角色
  const currentCharacter = ref(null)
  
  // 当前角色的服装
  const currentCostume = ref(null)
  
  // 场景库
  const scenes = ref([])
  
  // 当前选中的场景
  const currentScene = ref(null)
  
  // 剧本库
  const scripts = ref([])
  
  // 当前选中的剧本
  const currentScript = ref(null)
  
  // 当前编辑的剧本
  const editingScript = ref(null)
  
  // 用户统计数据
  const userStats = ref(null)
  
  // 加载状态
  const isLoading = ref(false)
  
  // 表演进行状态
  const activePerformance = ref(null)
  
  // 角色换装状态
  const dressUpMode = ref(false)

  // ==================== 初始化 ====================
  
  const init = () => {
    loadCharacters()
    loadScenes()
    loadScripts()
    loadUserStats()
  }
  
  const loadCharacters = () => {
    characters.value = dramaService.getCharacters()
    unlockedCharacters.value = dramaService.getUnlockedCharacters()
  }
  
  const loadScenes = () => {
    scenes.value = dramaService.getScenes()
  }
  
  const loadScripts = () => {
    scripts.value = dramaService.getScripts()
  }
  
  const loadUserStats = () => {
    userStats.value = dramaService.getUserStats()
  }

  // ==================== 计算属性 ====================
  
  // 场景进度
  const sceneProgress = computed(() => dramaService.getSceneProgress())
  
  // 角色进度
  const characterProgress = computed(() => dramaService.getCharacterProgress())
  
  // 总评分
  const totalScore = computed(() => userStats.value?.totalScore || 0)
  
  // 影响力
  const influence = computed(() => userStats.value?.influence || 0)
  
  // 创造力
  const creativity = computed(() => userStats.value?.creativity || 0)
  
  // 表现力
  const expression = computed(() => userStats.value?.expression || 0)
  
  // 已完成场景数
  const completedScenesCount = computed(() => userStats.value?.completedScenes || 0)
  
  // 已创建剧本数
  const createdScriptsCount = computed(() => userStats.value?.createdScripts || 0)
  
  // 角色解锁信息
  const characterInfo = computed(() => dramaService.getCharacterProgress())
  
  // 场景解锁信息
  const sceneInfo = computed(() => dramaService.getSceneProgress())

  // ==================== 角色操作 ====================
  
  // 获取角色详情
  const getCharacter = (charId) => {
    return dramaService.getCharacter(charId)
  }
  
  // 选择角色
  const selectCharacter = (character) => {
    currentCharacter.value = character
    const costumes = dramaService.getUnlockedCostumes(character.id)
    currentCostume.value = costumes.length > 0 ? costumes[0] : null
  }
  
  // 获取角色的可用服装
  const getCharacterCostumes = (charId) => {
    return dramaService.getUnlockedCostumes(charId)
  }
  
  // 选择服装
  const selectCostume = (costumeId) => {
    currentCostume.value = costumeId
  }
  
  // 解锁角色
  const unlockCharacterById = (charId) => {
    const success = dramaService.unlockCharacter(charId)
    if (success) {
      loadCharacters()
      loadUserStats()
    }
    return success
  }
  
  // 解锁服装
  const unlockCostumeById = (charId, costumeId) => {
    const success = dramaService.unlockCostume(charId, costumeId)
    if (success) {
      loadUserStats()
    }
    return success
  }
  
  // 进入换装模式
  const enterDressUpMode = (character) => {
    selectCharacter(character)
    dressUpMode.value = true
  }
  
  // 退出换装模式
  const exitDressUpMode = () => {
    dressUpMode.value = false
    currentCharacter.value = null
    currentCostume.value = null
  }

  // ==================== 场景操作 ====================
  
  // 按类型获取场景
  const getScenesByType = (type) => {
    return dramaService.getScenesByType(type)
  }
  
  // 获取场景详情
  const getScene = (sceneId) => {
    return dramaService.getScene(sceneId)
  }
  
  // 选择场景
  const selectScene = (scene) => {
    currentScene.value = scene
  }
  
  // 开始表演
  const startPerformance = (scene) => {
    activePerformance.value = {
      sceneId: scene.id,
      startTime: Date.now(),
      currentSituation: scene.situation,
      choices: [...scene.choices]
    }
    return activePerformance.value
  }
  
  // 选择表演选项
  const makeChoice = (choiceId) => {
    if (!activePerformance.value) return null
    
    const scene = getScene(activePerformance.value.sceneId)
    const choice = scene.choices.find(c => c.id === choiceId)
    
    return {
      choiceId,
      isCorrect: choice?.isCorrect || false,
      feedback: choice?.feedback || '',
      score: choice?.score || 0
    }
  }
  
  // 完成表演
  const completePerformance = (choiceId, score) => {
    const result = dramaService.completeScene(
      activePerformance.value.sceneId,
      choiceId,
      score
    )
    activePerformance.value = null
    loadUserStats()
    return result
  }
  
  // 取消表演
  const cancelPerformance = () => {
    activePerformance.value = null
  }
  
  // 获取推荐场景
  const getRecommendedScene = () => {
    if (scenes.value.length > 0) {
      return dramaService.getNextRecommendedScene(scenes.value[0].type)
    }
    return null
  }

  // ==================== 剧本操作 ====================
  
  // 创建剧本
  const createScript = (scriptData) => {
    const newScript = dramaService.createScript(scriptData)
    loadScripts()
    loadUserStats()
    return newScript
  }
  
  // 更新剧本
  const updateScriptById = (scriptId, updates) => {
    const updated = dramaService.updateScript(scriptId, updates)
    loadScripts()
    return updated
  }
  
  // 删除剧本
  const deleteScriptById = (scriptId) => {
    const success = dramaService.deleteScript(scriptId)
    if (success) {
      loadScripts()
      loadUserStats()
    }
    return success
  }
  
  // 选择剧本进行编辑
  const selectScript = (script) => {
    currentScript.value = script
    editingScript.value = { ...script }
  }
  
  // 开始新剧本
  const startNewScript = () => {
    editingScript.value = {
      title: '',
      description: '',
      characterIds: [],
      dialogues: []
    }
    currentScript.value = null
  }
  
  // 更新编辑中的剧本
  const updateEditingScript = (updates) => {
    if (editingScript.value) {
      editingScript.value = { ...editingScript.value, ...updates }
    }
  }
  
  // 添加对白
  const addDialogue = (dialogue) => {
    if (!editingScript.value) return null
    const newDialogue = dramaService.addDialogue(editingScript.value.id, dialogue)
    if (newDialogue) {
      editingScript.value.dialogues.push(newDialogue)
    }
    return newDialogue
  }
  
  // 删除对白
  const removeDialogue = (dialogueId) => {
    if (!editingScript.value) return false
    const success = dramaService.removeDialogue(editingScript.value.id, dialogueId)
    if (success) {
      editingScript.value.dialogues = editingScript.value.dialogues.filter(
        d => d.id !== dialogueId
      )
    }
    return success
  }
  
  // 保存剧本
  const saveScript = () => {
    if (!editingScript.value) return null
    
    if (editingScript.value.id) {
      // 更新现有剧本
      const updated = dramaService.updateScript(editingScript.value.id, editingScript.value)
      loadScripts()
      return updated
    } else {
      // 创建新剧本
      const newScript = dramaService.createScript(editingScript.value)
      loadScripts()
      loadUserStats()
      return newScript
    }
  }
  
  // 取消编辑
  const cancelEditing = () => {
    editingScript.value = null
    currentScript.value = null
  }

  // ==================== 工具方法 ====================
  
  // 获取角色类型信息
  const getRoleInfo = () => dramaService.ROLE_INFO
  
  // 获取场景类型信息
  const getSceneTypeInfo = () => dramaService.SCENE_TYPE_INFO
  
  // 获取难度信息
  const getDifficultyInfo = () => dramaService.DIFFICULTY_INFO
  
  // 获取评分等级信息
  const getScoreLevelInfo = () => dramaService.SCORE_LEVEL
  
  // 重置数据
  const resetData = () => {
    const success = dramaService.resetData()
    if (success) {
      loadCharacters()
      loadScenes()
      loadScripts()
      loadUserStats()
    }
    return success
  }

  return {
    // 状态
    characters,
    unlockedCharacters,
    currentCharacter,
    currentCostume,
    scenes,
    currentScene,
    scripts,
    currentScript,
    editingScript,
    userStats,
    isLoading,
    activePerformance,
    dressUpMode,

    // 计算属性
    sceneProgress,
    characterProgress,
    totalScore,
    influence,
    creativity,
    expression,
    completedScenesCount,
    createdScriptsCount,
    characterInfo,
    sceneInfo,

    // 方法 - 初始化
    init,
    loadCharacters,
    loadScenes,
    loadScripts,
    loadUserStats,

    // 方法 - 角色操作
    getCharacter,
    selectCharacter,
    getCharacterCostumes,
    selectCostume,
    unlockCharacterById,
    unlockCostumeById,
    enterDressUpMode,
    exitDressUpMode,

    // 方法 - 场景操作
    getScenesByType,
    getScene,
    selectScene,
    startPerformance,
    makeChoice,
    completePerformance,
    cancelPerformance,
    getRecommendedScene,

    // 方法 - 剧本操作
    createScript,
    updateScriptById,
    deleteScriptById,
    selectScript,
    startNewScript,
    updateEditingScript,
    addDialogue,
    removeDialogue,
    saveScript,
    cancelEditing,

    // 方法 - 工具方法
    getRoleInfo,
    getSceneTypeInfo,
    getDifficultyInfo,
    getScoreLevelInfo,
    resetData
  }
})
