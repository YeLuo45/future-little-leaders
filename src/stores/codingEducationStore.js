import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import codingEducationService from '@/services/codingEducationService.js'

/**
 * V59 Coding Education Store
 * 编程教育状态管理
 */
export const useCodingEducationStore = defineStore('codingEducation', () => {
  // 视觉编程块
  const visualBlocks = ref([])
  const selectedBlocks = ref([])
  const currentProgram = ref(null)
  
  // 代码块学习
  const codeBlockLevels = ref([])
  const currentLevelIndex = ref(0)
  const completedLevels = ref([])
  
  // 编程挑战
  const challenges = ref([])
  const currentChallenge = ref(null)
  const completedChallenges = ref([])
  const challengeCode = ref('')
  
  // 创意项目
  const creativeProjects = ref([])
  const userProjects = ref([])
  const currentProject = ref(null)
  
  // 统计数据
  const totalPoints = ref(0)
  const totalExp = ref(0)
  const rank = ref('初学者')
  
  // 加载状态
  const isLoading = ref(false)
  
  // Tab索引
  const activeTab = ref(0)
  
  // 初始化
  const init = () => {
    loadVisualBlocks()
    loadCodeBlockLevels()
    loadChallenges()
    loadCreativeProjects()
    loadUserProjects()
    loadStats()
  }
  
  // 加载视觉编程块
  const loadVisualBlocks = () => {
    visualBlocks.value = codingEducationService.getVisualBlocks()
  }
  
  // 按类别获取积木
  const getBlocksByCategory = (category) => {
    return codingEducationService.getBlocksByCategory(category)
  }
  
  // 添加积木到程序
  const addBlockToProgram = (block) => {
    selectedBlocks.value.push({ ...block, instanceId: `block_${Date.now()}_${Math.random()}` })
  }
  
  // 移除积木
  const removeBlock = (instanceId) => {
    const index = selectedBlocks.value.findIndex(b => b.instanceId === instanceId)
    if (index > -1) {
      selectedBlocks.value.splice(index, 1)
    }
  }
  
  // 清空程序
  const clearProgram = () => {
    selectedBlocks.value = []
  }
  
  // 运行程序
  const runProgram = () => {
    currentProgram.value = {
      blocks: [...selectedBlocks.value],
      executedAt: new Date().toISOString()
    }
    return currentProgram.value
  }
  
  // 加载代码块学习关卡
  const loadCodeBlockLevels = () => {
    codeBlockLevels.value = codingEducationService.CODE_BLOCK_LEVELS
    const progress = codingEducationService.getCodeBlockProgress()
    completedLevels.value = progress.completedLevels
    currentLevelIndex.value = progress.currentLevel
  }
  
  // 获取当前关卡
  const getCurrentLevel = () => {
    return codeBlockLevels.value[currentLevelIndex.value]
  }
  
  // 完成关卡
  const completeLevel = (levelId, exp, points) => {
    if (!completedLevels.value.includes(levelId)) {
      completedLevels.value.push(levelId)
      totalExp.value += exp
      totalPoints.value += points
      rank.value = codingEducationService.completeChallenge(levelId, points, exp).rank
      
      // 保存进度
      codingEducationService.saveCodeBlockProgress({
        completedLevels: completedLevels.value,
        currentLevel: currentLevelIndex.value + 1,
        totalExp: totalExp.value
      })
    }
    
    // 自动进入下一关
    if (currentLevelIndex.value < codeBlockLevels.value.length - 1) {
      currentLevelIndex.value++
    }
  }
  
  // 下一关
  const nextLevel = () => {
    if (currentLevelIndex.value < codeBlockLevels.value.length - 1) {
      currentLevelIndex.value++
    }
  }
  
  // 上一关
  const prevLevel = () => {
    if (currentLevelIndex.value > 0) {
      currentLevelIndex.value--
    }
  }
  
  // 加载编程挑战
  const loadChallenges = () => {
    challenges.value = codingEducationService.getCodingChallenges()
    const progress = codingEducationService.getChallengeProgress()
    completedChallenges.value = progress.completedChallenges
    totalPoints.value = progress.totalPoints
    rank.value = progress.rank
  }
  
  // 选择挑战
  const selectChallenge = (challenge) => {
    currentChallenge.value = challenge
    challengeCode.value = challenge.template || ''
  }
  
  // 更新代码
  const updateChallengeCode = (code) => {
    challengeCode.value = code
  }
  
  // 提交挑战答案
  const submitChallenge = (challengeId, code) => {
    const challenge = challenges.value.find(c => c.id === challengeId)
    if (challenge) {
      completeLevel(challengeId, challenge.exp, challenge.points)
      if (!completedChallenges.value.includes(challengeId)) {
        completedChallenges.value.push(challengeId)
      }
    }
    return challenge
  }
  
  // 加载创意项目
  const loadCreativeProjects = () => {
    creativeProjects.value = codingEducationService.getCreativeProjects()
  }
  
  // 加载用户项目
  const loadUserProjects = () => {
    userProjects.value = codingEducationService.getUserProjects()
  }
  
  // 创建新项目
  const createProject = (projectData) => {
    const newProject = codingEducationService.saveUserProject({
      ...projectData,
      id: `project_${Date.now()}`
    })
    userProjects.value.push(newProject)
    return newProject
  }
  
  // 保存项目
  const saveProject = (project) => {
    codingEducationService.saveUserProject(project)
    const index = userProjects.value.findIndex(p => p.id === project.id)
    if (index >= 0) {
      userProjects.value[index] = project
    }
    return project
  }
  
  // 删除项目
  const deleteProject = (projectId) => {
    const projects = userProjects.value.filter(p => p.id !== projectId)
    try {
      uni.setStorageSync('coding_projects', JSON.stringify(projects))
      userProjects.value = projects
    } catch (e) {}
  }
  
  // 加载统计数据
  const loadStats = () => {
    const stats = codingEducationService.getCodingStats()
    totalPoints.value = stats.totalPoints
    rank.value = stats.rank
  }
  
  // 获取统计数据
  const getStats = computed(() => {
    return {
      totalPoints: totalPoints.value,
      rank: rank.value,
      challengesCompleted: completedChallenges.value.length,
      levelsCompleted: completedLevels.value.length,
      projectsCreated: userProjects.value.length,
      blocksLearned: visualBlocks.value.length
    }
  })
  
  // 设置当前Tab
  const setActiveTab = (index) => {
    activeTab.value = index
  }
  
  // 重置挑战代码
  const resetChallengeCode = () => {
    if (currentChallenge.value) {
      challengeCode.value = currentChallenge.value.template || ''
    }
  }
  
  return {
    // 状态
    visualBlocks,
    selectedBlocks,
    currentProgram,
    codeBlockLevels,
    currentLevelIndex,
    completedLevels,
    challenges,
    currentChallenge,
    completedChallenges,
    challengeCode,
    creativeProjects,
    userProjects,
    currentProject,
    totalPoints,
    totalExp,
    rank,
    isLoading,
    activeTab,
    
    // 计算属性
    getStats,
    
    // 方法
    init,
    loadVisualBlocks,
    getBlocksByCategory,
    addBlockToProgram,
    removeBlock,
    clearProgram,
    runProgram,
    loadCodeBlockLevels,
    getCurrentLevel,
    completeLevel,
    nextLevel,
    prevLevel,
    loadChallenges,
    selectChallenge,
    updateChallengeCode,
    submitChallenge,
    loadCreativeProjects,
    loadUserProjects,
    createProject,
    saveProject,
    deleteProject,
    loadStats,
    setActiveTab,
    resetChallengeCode
  }
})
