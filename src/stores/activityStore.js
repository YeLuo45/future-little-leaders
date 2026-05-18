import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  getActivities, 
  filterActivities, 
  getActivityById,
  getCreations,
  addCreation,
  updateCreation,
  deleteCreation,
  getCollabTasks,
  createCollabTask,
  updateCollabTask,
  ACTIVITY_TYPES,
  AGE_GROUPS
} from '../services/activityService.js'

/**
 * V45 亲子活动Store
 * 管理活动库、步骤指导、成果展示、协作任务
 */
export const useActivityStore = defineStore('activity', () => {
  // 状态
  const activities = ref([])
  const currentActivity = ref(null)
  const currentStep = ref(0)
  const creations = ref([])
  const collabTasks = ref([])
  const filters = ref({
    type: '',
    ageGroup: '',
    difficulty: '',
    keyword: ''
  })

  // 计算属性
  const filteredActivities = computed(() => {
    return filterActivities(filters.value)
  })

  const activityTypes = computed(() => Object.values(ACTIVITY_TYPES))

  const ageGroups = computed(() => Object.values(AGE_GROUPS))

  const myCreations = computed(() => creations.value)

  const pendingCollabTasks = computed(() => {
    return collabTasks.value.filter(t => t.status === 'pending')
  })

  const completedCollabTasks = computed(() => {
    return collabTasks.value.filter(t => t.status === 'completed')
  })

  // 方法
  const loadActivities = () => {
    activities.value = getActivities()
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      type: '',
      ageGroup: '',
      difficulty: '',
      keyword: ''
    }
  }

  const loadActivityDetail = (id) => {
    currentActivity.value = getActivityById(id)
    currentStep.value = 0
    return currentActivity.value
  }

  const nextStep = () => {
    if (currentActivity.value && currentStep.value < currentActivity.value.steps.length - 1) {
      currentStep.value++
      return true
    }
    return false
  }

  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
      return true
    }
    return false
  }

  const goToStep = (index) => {
    if (currentActivity.value && index >= 0 && index < currentActivity.value.steps.length) {
      currentStep.value = index
      return true
    }
    return false
  }

  const completeStep = (stepIndex) => {
    if (!currentActivity.value) return false
    const step = currentActivity.value.steps[stepIndex]
    if (step) {
      step.completed = true
      step.completedAt = new Date().toISOString()
      return true
    }
    return false
  }

  const loadCreations = () => {
    creations.value = getCreations()
  }

  const saveCreation = (creation) => {
    const newCreation = addCreation(creation)
    if (newCreation) {
      creations.value.unshift(newCreation)
      return newCreation
    }
    return null
  }

  const editCreation = (id, updates) => {
    const updated = updateCreation(id, updates)
    if (updated) {
      const index = creations.value.findIndex(c => c.id === id)
      if (index !== -1) {
        creations.value[index] = updated
      }
      return updated
    }
    return null
  }

  const removeCreation = (id) => {
    const success = deleteCreation(id)
    if (success) {
      creations.value = creations.value.filter(c => c.id !== id)
    }
    return success
  }

  const loadCollabTasks = () => {
    collabTasks.value = getCollabTasks()
  }

  const startCollabTask = (task) => {
    const newTask = createCollabTask(task)
    if (newTask) {
      collabTasks.value.unshift(newTask)
      return newTask
    }
    return null
  }

  const completeParentPart = (taskId) => {
    const task = updateCollabTask(taskId, { parentCompleted: true })
    if (task) {
      const index = collabTasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        collabTasks.value[index] = task
      }
    }
    return task
  }

  const completeChildPart = (taskId) => {
    const task = updateCollabTask(taskId, { childCompleted: true })
    if (task) {
      const index = collabTasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        collabTasks.value[index] = task
      }
    }
    return task
  }

  const init = () => {
    loadActivities()
    loadCreations()
    loadCollabTasks()
  }

  return {
    // 状态
    activities,
    currentActivity,
    currentStep,
    creations,
    collabTasks,
    filters,
    // 计算属性
    filteredActivities,
    activityTypes,
    ageGroups,
    myCreations,
    pendingCollabTasks,
    completedCollabTasks,
    // 方法
    loadActivities,
    setFilters,
    clearFilters,
    loadActivityDetail,
    nextStep,
    prevStep,
    goToStep,
    completeStep,
    loadCreations,
    saveCreation,
    editCreation,
    removeCreation,
    loadCollabTasks,
    startCollabTask,
    completeParentPart,
    completeChildPart,
    init
  }
})
