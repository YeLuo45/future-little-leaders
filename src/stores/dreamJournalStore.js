/**
 * V90 Dream Journal Store
 * 梦想日记系统状态管理
 * 梦想清单、愿景板、目标追踪
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dreamJournalService, {
  DREAM_STATUS,
  DREAM_CATEGORY,
  DREAM_CATEGORY_INFO,
  MILESTONE_STATUS
} from '@/services/dreamJournalService.js'
import { useBabyStore } from './babyStore.js'

export const useDreamJournalStore = defineStore('dreamJournal', () => {
  // ==================== 状态 ====================

  // 梦想列表
  const dreams = ref([])

  // 当前选中的梦想
  const currentDream = ref(null)

  // 里程碑列表
  const milestones = ref([])

  // 愿景板图片
  const visionImages = ref([])

  // 统计数据
  const statistics = ref({
    totalDreams: 0,
    activeCount: 0,
    completedCount: 0,
    totalMilestones: 0,
    completedMilestones: 0,
    completionRate: 0,
    byCategory: {}
  })

  // 当前Tab
  const currentTab = ref('dreams') // dreams | vision | tracker

  // 筛选条件
  const filterCategory = ref('')
  const filterStatus = ref('')

  // 是否加载中
  const isLoading = ref(false)

  // 错误信息
  const errorMessage = ref('')

  // ==================== 计算属性 ====================

  const babyStore = useBabyStore()
  const currentBabyId = computed(() => babyStore.currentBabyId)
  const currentBaby = computed(() => babyStore.currentBaby)

  // 进行中的梦想
  const activeDreams = computed(() => {
    return dreams.value.filter(d => d.status === DREAM_STATUS.ACTIVE)
  })

  // 已完成的梦想
  const completedDreams = computed(() => {
    return dreams.value.filter(d => d.status === DREAM_STATUS.COMPLETED)
  })

  // 按分类分组的梦想
  const dreamsByCategory = computed(() => {
    const grouped = {}
    Object.values(DREAM_CATEGORY).forEach(cat => {
      grouped[cat] = dreams.value.filter(d => d.category === cat)
    })
    return grouped
  })

  // 分类选项
  const categoryOptions = computed(() => {
    return Object.entries(DREAM_CATEGORY_INFO).map(([key, info]) => ({
      value: key,
      label: `${info.emoji} ${info.label}`,
      ...info
    }))
  })

  // 当前梦想的里程碑
  const currentDreamMilestones = computed(() => {
    if (!currentDream.value) return []
    return milestones.value.filter(m => m.dreamId === currentDream.value.id)
  })

  // ==================== 初始化 ====================

  const init = () => {
    if (!currentBabyId.value) return
    loadAllData()
  }

  const loadAllData = () => {
    if (!currentBabyId.value) return

    isLoading.value = true
    errorMessage.value = ''

    try {
      loadDreams()
      loadMilestones()
      loadVisionImages()
      loadStatistics()
    } catch (e) {
      errorMessage.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  // ==================== 加载方法 ====================

  /**
   * 加载梦想列表
   */
  const loadDreams = (filter = {}) => {
    dreams.value = dreamJournalService.getDreamsList({
      ...filter,
      babyId: currentBabyId.value
    })
  }

  /**
   * 加载梦想详情
   */
  const loadDreamDetail = (dreamId) => {
    currentDream.value = dreamJournalService.getDreamById(dreamId)
    if (currentDream.value) {
      loadDreamMilestones(dreamId)
    }
    return currentDream.value
  }

  /**
   * 加载里程碑
   */
  const loadMilestones = () => {
    milestones.value = dreamJournalService.getAllMilestones(currentBabyId.value)
  }

  /**
   * 加载梦想的里程碑
   */
  const loadDreamMilestones = (dreamId) => {
    return dreamJournalService.getDreamMilestones(dreamId)
  }

  /**
   * 加载愿景板图片
   */
  const loadVisionImages = (filter = {}) => {
    visionImages.value = dreamJournalService.getVisionImagesList({
      ...filter,
      babyId: currentBabyId.value
    })
  }

  /**
   * 加载统计数据
   */
  const loadStatistics = () => {
    statistics.value = dreamJournalService.getDreamStatistics(currentBabyId.value)
  }

  // ==================== 梦想管理 ====================

  /**
   * 创建梦想
   */
  const createDream = (dreamData) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const dream = dreamJournalService.createDream({
        ...dreamData,
        babyId: currentBabyId.value,
        babyName: currentBaby.value?.name || '我'
      })

      if (dream) {
        dreams.value.unshift(dream)
        loadStatistics()
      }

      return dream
    } catch (e) {
      errorMessage.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新梦想
   */
  const updateDream = (dreamId, updates) => {
    const dream = dreamJournalService.updateDream(dreamId, updates)
    if (dream) {
      const index = dreams.value.findIndex(d => d.id === dreamId)
      if (index !== -1) {
        dreams.value[index] = dream
      }
      if (currentDream.value?.id === dreamId) {
        currentDream.value = dream
      }
      loadStatistics()
    }
    return dream
  }

  /**
   * 删除梦想
   */
  const removeDream = (dreamId) => {
    const success = dreamJournalService.deleteDream(dreamId)
    if (success) {
      dreams.value = dreams.value.filter(d => d.id !== dreamId)
      if (currentDream.value?.id === dreamId) {
        currentDream.value = null
      }
      loadStatistics()
    }
    return success
  }

  /**
   * 添加梦想图片
   */
  const addDreamImage = (dreamId, imageData) => {
    const image = dreamJournalService.addDreamImage(dreamId, imageData)
    if (image) {
      loadDreamDetail(dreamId)
    }
    return image
  }

  /**
   * 移除梦想图片
   */
  const removeDreamImage = (dreamId, imageId) => {
    const success = dreamJournalService.removeDreamImage(dreamId, imageId)
    if (success) {
      loadDreamDetail(dreamId)
    }
    return success
  }

  // ==================== 里程碑管理 ====================

  /**
   * 创建里程碑
   */
  const createMilestone = (milestoneData) => {
    const milestone = dreamJournalService.createMilestone(milestoneData)
    if (milestone) {
      milestones.value.push(milestone)
      loadStatistics()
    }
    return milestone
  }

  /**
   * 更新里程碑
   */
  const updateMilestone = (milestoneId, updates) => {
    const milestone = dreamJournalService.updateMilestone(milestoneId, updates)
    if (milestone) {
      const index = milestones.value.findIndex(m => m.id === milestoneId)
      if (index !== -1) {
        milestones.value[index] = milestone
      }
      loadStatistics()
    }
    return milestone
  }

  /**
   * 删除里程碑
   */
  const removeMilestone = (milestoneId) => {
    const success = dreamJournalService.deleteMilestone(milestoneId)
    if (success) {
      milestones.value = milestones.value.filter(m => m.id !== milestoneId)
      loadStatistics()
    }
    return success
  }

  /**
   * 标记里程碑完成
   */
  const completeMilestone = (milestoneId) => {
    const milestone = dreamJournalService.completeMilestone(milestoneId)
    if (milestone) {
      const index = milestones.value.findIndex(m => m.id === milestoneId)
      if (index !== -1) {
        milestones.value[index] = milestone
      }
      // 刷新梦想进度
      if (currentDream.value?.id === milestone.dreamId) {
        loadDreamDetail(milestone.dreamId)
      }
      loadStatistics()
      loadDreams()
    }
    return milestone
  }

  // ==================== 愿景板管理 ====================

  /**
   * 添加愿景板图片
   */
  const addVisionImage = (imageData) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }

    const image = dreamJournalService.addVisionImage({
      ...imageData,
      babyId: currentBabyId.value
    })

    if (image) {
      visionImages.value.unshift(image)
    }

    return image
  }

  /**
   * 删除愿景板图片
   */
  const removeVisionImage = (imageId) => {
    const success = dreamJournalService.deleteVisionImage(imageId)
    if (success) {
      visionImages.value = visionImages.value.filter(img => img.id !== imageId)
    }
    return success
  }

  /**
   * 更新愿景板图片
   */
  const updateVisionImage = (imageId, updates) => {
    const image = dreamJournalService.updateVisionImage(imageId, updates)
    if (image) {
      const index = visionImages.value.findIndex(img => img.id === imageId)
      if (index !== -1) {
        visionImages.value[index] = image
      }
    }
    return image
  }

  // ==================== 辅助方法 ====================

  /**
   * 切换Tab
   */
  const switchTab = (tab) => {
    currentTab.value = tab
  }

  /**
   * 设置分类筛选
   */
  const setFilterCategory = (category) => {
    filterCategory.value = category
    loadDreams(category ? { category } : {})
  }

  /**
   * 设置状态筛选
   */
  const setFilterStatus = (status) => {
    filterStatus.value = status
    loadDreams(status ? { status } : {})
  }

  /**
   * 获取分类信息
   */
  const getCategoryInfo = (category) => {
    return DREAM_CATEGORY_INFO[category] || DREAM_CATEGORY_INFO[DREAM_CATEGORY.OTHER]
  }

  /**
   * 获取状态名称
   */
  const getStatusName = (status) => {
    const statusMap = {
      [DREAM_STATUS.ACTIVE]: '进行中',
      [DREAM_STATUS.COMPLETED]: '已完成',
      [DREAM_STATUS.ABANDONED]: '已放弃'
    }
    return statusMap[status] || status
  }

  /**
   * 获取里程碑状态名称
   */
  const getMilestoneStatusName = (status) => {
    const statusMap = {
      [MILESTONE_STATUS.PENDING]: '待完成',
      [MILESTONE_STATUS.IN_PROGRESS]: '进行中',
      [MILESTONE_STATUS.COMPLETED]: '已完成'
    }
    return statusMap[status] || status
  }

  /**
   * 获取进度颜色
   */
  const getProgressColor = (progress) => {
    if (progress >= 100) return '#07c160'
    if (progress >= 50) return '#8477fa'
    return '#1677ff'
  }

  return {
    // ==================== 状态 ====================
    dreams,
    currentDream,
    milestones,
    visionImages,
    statistics,
    currentTab,
    filterCategory,
    filterStatus,
    isLoading,
    errorMessage,

    // ==================== 计算属性 ====================
    activeDreams,
    completedDreams,
    dreamsByCategory,
    categoryOptions,
    currentDreamMilestones,

    // ==================== 初始化 ====================
    init,
    loadAllData,

    // ==================== 加载方法 ====================
    loadDreams,
    loadDreamDetail,
    loadMilestones,
    loadDreamMilestones,
    loadVisionImages,
    loadStatistics,

    // ==================== 梦想管理 ====================
    createDream,
    updateDream,
    removeDream,
    addDreamImage,
    removeDreamImage,

    // ==================== 里程碑管理 ====================
    createMilestone,
    updateMilestone,
    removeMilestone,
    completeMilestone,

    // ==================== 愿景板管理 ====================
    addVisionImage,
    removeVisionImage,
    updateVisionImage,

    // ==================== 辅助方法 ====================
    switchTab,
    setFilterCategory,
    setFilterStatus,
    getCategoryInfo,
    getStatusName,
    getMilestoneStatusName,
    getProgressColor
  }
})
