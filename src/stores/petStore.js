import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import petService from '@/services/petService.js'

/**
 * V51 Pet Store
 * 虚拟宠物状态管理
 */
export const usePetStore = defineStore('pet', () => {
  // 状态
  const petData = ref(null)
  const petStats = ref(null)
  const isLoading = ref(false)
  const showEvolutionModal = ref(false)
  const evolutionResult = ref(null)

  // 初始化
  const init = () => {
    loadPetData()
    loadPetStats()
  }

  // 加载宠物数据
  const loadPetData = () => {
    petData.value = petService.getPetData()
  }

  // 加载宠物属性
  const loadPetStats = () => {
    petStats.value = petService.getPetStats()
  }

  // 创建宠物
  const adoptPet = (typeId, name) => {
    isLoading.value = true
    try {
      const newPet = petService.createPet(typeId, name)
      petData.value = newPet
      petStats.value = petService.getPetStats()
      uni.showToast({ title: '领养成功！', icon: 'success' })
      uni.$emit('petAdopted', newPet)
      return newPet
    } finally {
      isLoading.value = false
    }
  }

  // 喂养宠物
  const feed = (foodType = 'normal') => {
    const result = petService.feedPet(foodType)
    if (result) {
      petData.value = result.petData
      petStats.value = result.stats
      if (result.petData.state === 'happy') {
        uni.showToast({ title: '宠物很开心！', icon: 'none' })
      }
    }
    return result
  }

  // 与宠物玩耍
  const play = () => {
    const result = petService.playWithPet()
    if (result) {
      petData.value = result.petData
      petStats.value = result.stats
      uni.$emit('petPlayed', result.stats)
    }
    return result
  }

  // 清洁宠物
  const clean = () => {
    const result = petService.cleanPet()
    if (result) {
      petData.value = result.petData
      petStats.value = result.stats
    }
    return result
  }

  // 治疗宠物
  const heal = () => {
    const result = petService.healPet()
    if (result) {
      petData.value = result.petData
      petStats.value = result.stats
      uni.showToast({ title: '宠物康复了！', icon: 'success' })
    }
    return result
  }

  // 完成任务触发
  const onTaskCompleted = () => {
    const result = petService.onTaskCompleted()
    if (result) {
      petData.value = result.petData
      petStats.value = result.stats
      checkEvolution()
    }
    return result
  }

  // 每日登录触发
  const onDailyLogin = () => {
    const result = petService.onDailyLogin()
    if (result) {
      petData.value = result.petData
      petStats.value = result.stats
      checkEvolution()
    }
    return result
  }

  // 检查进化
  const checkEvolution = () => {
    if (!petData.value || !petStats.value) return
    
    const stage = petService.getEvolutionStage(petData.value.exp)
    if (stage.id !== petData.value.stage) {
      evolutionResult.value = {
        oldStage: petData.value.stage,
        newStage: stage.id,
        petData: petData.value
      }
      showEvolutionModal.value = true
      uni.$emit('petEvolved', evolutionResult.value)
    }
  }

  // 关闭进化弹窗
  const closeEvolutionModal = () => {
    showEvolutionModal.value = false
    evolutionResult.value = null
  }

  // 计算属性
  const hasPet = computed(() => !!petData.value)

  const petStageInfo = computed(() => {
    if (!petData.value) return null
    return petService.getEvolutionStage(petData.value.exp)
  })

  const petTypeInfo = computed(() => {
    if (!petData.value) return null
    return petService.getPetType(petData.value.typeId)
  })

  const evolutionPath = computed(() => {
    if (!petData.value) return null
    return petService.getEvolutionPath(petData.value.typeId)
  })

  const currentStageIndex = computed(() => {
    if (!petData.value) return 0
    const path = evolutionPath.value
    return path.stages.findIndex(s => s.id === petData.value.stage)
  })

  const nextStage = computed(() => {
    if (!petData.value) return null
    const path = evolutionPath.value
    const nextIndex = currentStageIndex.value + 1
    return nextIndex < path.stages.length ? path.stages[nextIndex] : null
  })

  const expToNextStage = computed(() => {
    if (!petData.value || !nextStage.value) return 0
    return Math.max(0, nextStage.value.expRequired - petData.value.exp)
  })

  const progressToNextStage = computed(() => {
    if (!petData.value || !nextStage.value) return 100
    const path = evolutionPath.value
    const currentStage = path.stages[currentStageIndex.value]
    const expInStage = petData.value.exp - currentStage.expRequired
    const expNeeded = nextStage.value.expRequired - currentStage.expRequired
    return Math.min(100, Math.round((expInStage / expNeeded) * 100))
  })

  const petMoodEmoji = computed(() => {
    if (!petStats.value) return '😊'
    if (petStats.value.health < 30) return '🤒'
    if (petStats.value.hunger < 30) return '🍖'
    if (petStats.value.mood < 30) return '😢'
    if (petStats.value.cleanliness < 30) return '😷'
    if (petStats.value.mood > 80) return '😊'
    return '😐'
  })

  const needsAttention = computed(() => {
    if (!petStats.value) return false
    return petStats.value.hunger < 40 || 
           petStats.value.mood < 40 || 
           petStats.value.health < 40 ||
           petStats.value.cleanliness < 40
  })

  // 获取状态提示
  const getStatusTips = computed(() => {
    if (!petStats.value) return []
    const tips = []
    if (petStats.value.hunger < 40) tips.push({ type: 'hunger', message: '宠物饿了', icon: '🍖' })
    if (petStats.value.mood < 40) tips.push({ type: 'mood', message: '宠物心情不好', icon: '😢' })
    if (petStats.value.health < 40) tips.push({ type: 'health', message: '宠物生病了', icon: '🤒' })
    if (petStats.value.cleanliness < 40) tips.push({ type: 'clean', message: '宠物需要清洁', icon: '🛁' })
    return tips
  })

  return {
    // 状态
    petData,
    petStats,
    isLoading,
    showEvolutionModal,
    evolutionResult,

    // 计算属性
    hasPet,
    petStageInfo,
    petTypeInfo,
    evolutionPath,
    currentStageIndex,
    nextStage,
    expToNextStage,
    progressToNextStage,
    petMoodEmoji,
    needsAttention,
    getStatusTips,

    // 方法
    init,
    loadPetData,
    loadPetStats,
    adoptPet,
    feed,
    play,
    clean,
    heal,
    onTaskCompleted,
    onDailyLogin,
    checkEvolution,
    closeEvolutionModal
  }
})
