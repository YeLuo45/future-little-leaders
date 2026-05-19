import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dailyCeremoniesService from '@/services/dailyCeremoniesService.js'

/**
 * V97 Daily Ceremonies Store
 * 日常仪式状态管理 - 晨间惯例、晚间惯例、特别日仪式
 */
export const useDailyCeremoniesStore = defineStore('dailyCeremonies', () => {
  // 状态
  const morningRoutine = ref([])
  const eveningRoutine = ref([])
  const specialDays = ref([])
  const ceremonyRecords = ref([])
  const currentBabyId = ref(null)
  const isLoading = ref(false)
  
  // 初始化
  const init = () => {
    loadMorningRoutine()
    loadEveningRoutine()
    loadSpecialDays()
    loadCeremonyRecords()
  }
  
  // 加载晨间惯例
  const loadMorningRoutine = () => {
    morningRoutine.value = dailyCeremoniesService.getMorningRoutine()
  }
  
  // 加载晚间惯例
  const loadEveningRoutine = () => {
    eveningRoutine.value = dailyCeremoniesService.getEveningRoutine()
  }
  
  // 加载特别日
  const loadSpecialDays = () => {
    specialDays.value = dailyCeremoniesService.getSpecialDays()
  }
  
  // 加载仪式记录
  const loadCeremonyRecords = () => {
    ceremonyRecords.value = dailyCeremoniesService.getCeremonyRecords()
  }
  
  // 设置当前宝宝
  const setCurrentBaby = (babyId) => {
    currentBabyId.value = babyId
  }
  
  // 更新晨间惯例项目
  const updateMorningItem = (itemId, updates) => {
    const item = morningRoutine.value.find(i => i.id === itemId)
    if (item) {
      Object.assign(item, updates)
      dailyCeremoniesService.saveMorningRoutine(morningRoutine.value)
    }
  }
  
  // 更新晚间惯例项目
  const updateEveningItem = (itemId, updates) => {
    const item = eveningRoutine.value.find(i => i.id === itemId)
    if (item) {
      Object.assign(item, updates)
      dailyCeremoniesService.saveEveningRoutine(eveningRoutine.value)
    }
  }
  
  // 切换晨间项目完成状态
  const toggleMorningItem = (itemId) => {
    const item = morningRoutine.value.find(i => i.id === itemId)
    if (item) {
      item.completed = !item.completed
      dailyCeremoniesService.saveMorningRoutine(morningRoutine.value)
    }
  }
  
  // 切换晚间项目完成状态
  const toggleEveningItem = (itemId) => {
    const item = eveningRoutine.value.find(i => i.id === itemId)
    if (item) {
      item.completed = !item.completed
      dailyCeremoniesService.saveEveningRoutine(eveningRoutine.value)
    }
  }
  
  // 重置晨间惯例
  const resetMorningRoutine = () => {
    morningRoutine.value = dailyCeremoniesService.getDefaultMorningRoutine()
    dailyCeremoniesService.saveMorningRoutine(morningRoutine.value)
  }
  
  // 重置晚间惯例
  const resetEveningRoutine = () => {
    eveningRoutine.value = dailyCeremoniesService.getDefaultEveningRoutine()
    dailyCeremoniesService.saveEveningRoutine(eveningRoutine.value)
  }
  
  // 完成晨间惯例
  const completeMorningRoutine = (babyId) => {
    const items = morningRoutine.value.filter(i => i.isActive).map(i => ({
      id: i.id,
      name: i.name,
      completed: i.completed
    }))
    
    const record = dailyCeremoniesService.recordMorningCompletion(
      'morning_default',
      babyId || currentBabyId.value,
      items
    )
    
    // 重置完成状态
    morningRoutine.value.forEach(item => {
      item.completed = false
    })
    dailyCeremoniesService.saveMorningRoutine(morningRoutine.value)
    
    loadCeremonyRecords()
    return record
  }
  
  // 完成晚间惯例
  const completeEveningRoutine = (babyId) => {
    const items = eveningRoutine.value.filter(i => i.isActive).map(i => ({
      id: i.id,
      name: i.name,
      completed: i.completed
    }))
    
    const record = dailyCeremoniesService.recordEveningCompletion(
      'evening_default',
      babyId || currentBabyId.value,
      items
    )
    
    // 重置完成状态
    eveningRoutine.value.forEach(item => {
      item.completed = false
    })
    dailyCeremoniesService.saveEveningRoutine(eveningRoutine.value)
    
    loadCeremonyRecords()
    return record
  }
  
  // 创建特别日
  const addSpecialDay = (name, type, date, description) => {
    const newDay = dailyCeremoniesService.createSpecialDay(name, type, date, description)
    loadSpecialDays()
    return newDay
  }
  
  // 删除特别日
  const removeSpecialDay = (specialDayId) => {
    const days = specialDays.value.filter(d => d.id !== specialDayId)
    dailyCeremoniesService.saveSpecialDays(days)
    specialDays.value = days
  }
  
  // 完成特别日庆祝
  const celebrateSpecialDay = (specialDayId, celebration) => {
    const day = dailyCeremoniesService.completeSpecialDayCelebration(specialDayId, celebration)
    loadSpecialDays()
    return day
  }
  
  // 计算属性
  const todayStatus = computed(() => {
    return dailyCeremoniesService.getTodayCeremonyStatus()
  })
  
  const morningStreak = computed(() => {
    return dailyCeremoniesService.getStreakDays('morning')
  })
  
  const eveningStreak = computed(() => {
    return dailyCeremoniesService.getStreakDays('evening')
  })
  
  const upcomingSpecialDays = computed(() => {
    return dailyCeremoniesService.getUpcomingSpecialDays()
  })
  
  const activeMorningItems = computed(() => {
    return morningRoutine.value.filter(i => i.isActive)
  })
  
  const activeEveningItems = computed(() => {
    return eveningRoutine.value.filter(i => i.isActive)
  })
  
  const morningProgress = computed(() => {
    const active = activeMorningItems.value
    if (active.length === 0) return 0
    const completed = active.filter(i => i.completed).length
    return Math.round((completed / active.length) * 100)
  })
  
  const eveningProgress = computed(() => {
    const active = activeEveningItems.value
    if (active.length === 0) return 0
    const completed = active.filter(i => i.completed).length
    return Math.round((completed / active.length) * 100)
  })
  
  const isMorningComplete = computed(() => {
    return todayStatus.value.morningCompleted
  })
  
  const isEveningComplete = computed(() => {
    return todayStatus.value.eveningCompleted
  })
  
  const totalExpGained = computed(() => {
    return ceremonyRecords.value.reduce((sum, r) => sum + (r.expGained || 0), 0)
  })
  
  const weekRecords = computed(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]
    
    return ceremonyRecords.value.filter(r => r.date >= weekAgoStr)
  })
  
  return {
    // 状态
    morningRoutine,
    eveningRoutine,
    specialDays,
    ceremonyRecords,
    currentBabyId,
    isLoading,
    
    // 方法
    init,
    loadMorningRoutine,
    loadEveningRoutine,
    loadSpecialDays,
    loadCeremonyRecords,
    setCurrentBaby,
    updateMorningItem,
    updateEveningItem,
    toggleMorningItem,
    toggleEveningItem,
    resetMorningRoutine,
    resetEveningRoutine,
    completeMorningRoutine,
    completeEveningRoutine,
    addSpecialDay,
    removeSpecialDay,
    celebrateSpecialDay,
    
    // 计算属性
    todayStatus,
    morningStreak,
    eveningStreak,
    upcomingSpecialDays,
    activeMorningItems,
    activeEveningItems,
    morningProgress,
    eveningProgress,
    isMorningComplete,
    isEveningComplete,
    totalExpGained,
    weekRecords
  }
})
