/**
 * V89 Weekend Camp Store
 * 周末营系统状态管理
 * 主题周末活动、户外探索、创意工坊、社交活动、积分奖励
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import weekendCampService, {
  CAMP_ACTIVITY_TYPE,
  CAMP_STATUS,
  REGISTRATION_STATUS,
  REWARD_TYPE
} from '@/services/weekendCampService.js'

export const useWeekendCampStore = defineStore('weekendCamp', () => {
  // ==================== 状态 ====================
  
  // 周末营列表
  const camps = ref([])
  
  // 推荐的周末营
  const recommendedCamps = ref([])
  
  // 当前选中的周末营
  const currentCamp = ref(null)
  
  // 我的报名列表
  const myRegistrations = ref([])
  
  // 当前报名详情
  const currentRegistration = ref(null)
  
  // 宝宝的周末营奖励
  const myRewards = ref([])
  
  // 宝宝的周末营积分
  const myPoints = ref(0)
  
  // 分享记录
  const shares = ref([])
  
  // 加载状态
  const isLoading = ref(false)
  
  // 错误信息
  const errorMessage = ref('')
  
  // 当前Tab
  const currentTab = ref('discover') // discover | my-camps | calendar | rewards
  
  // 筛选条件
  const filterType = ref('') // 活动类型筛选
  const filterStatus = ref('') // 状态筛选
  
  // ==================== 计算属性 ====================
  
  const babyStore = useBabyStore()
  const currentBabyId = computed(() => babyStore.currentBabyId)
  const currentBaby = computed(() => babyStore.currentBaby)
  
  // 按类型分组的周末营
  const campsByType = computed(() => {
    const grouped = {}
    Object.keys(CAMP_ACTIVITY_TYPE).forEach(key => {
      grouped[CAMP_ACTIVITY_TYPE[key]] = camps.value.filter(
        c => c.type === CAMP_ACTIVITY_TYPE[key]
      )
    })
    return grouped
  })
  
  // 我报名的周末营
  const registeredCamps = computed(() => {
    if (!currentBabyId.value) return []
    return myRegistrations.value
      .filter(r => r.status !== REGISTRATION_STATUS.CANCELLED)
      .map(r => {
        const camp = weekendCampService.getCampById(r.campId)
        return camp ? { ...camp, registration: r } : null
      })
      .filter(Boolean)
  })
  
  // 即将开始的周末营
  const upcomingCamps = computed(() => {
    return camps.value.filter(
      c => c.status === CAMP_STATUS.UPCOMING || c.status === CAMP_STATUS.REGISTRATION
    )
  })
  
  // 进行中的周末营
  const ongoingCamps = computed(() => {
    return camps.value.filter(c => c.status === CAMP_STATUS.ONGOING)
  })
  
  // 已完成的周末营
  const completedCamps = computed(() => {
    return camps.value.filter(c => c.status === CAMP_STATUS.COMPLETED)
  })
  
  // 活动类型选项
  const activityTypes = computed(() => [
    { value: CAMP_ACTIVITY_TYPE.OUTDOOR_EXPLORATION, label: '🌲 户外探索', icon: '🌲' },
    { value: CAMP_ACTIVITY_TYPE.CREATIVE_WORKSHOP, label: '🎨 创意工坊', icon: '🎨' },
    { value: CAMP_ACTIVITY_TYPE.SOCIAL_PARTY, label: '🎉 社交派对', icon: '🎉' },
    { value: CAMP_ACTIVITY_TYPE.THEME_CAMP, label: '⭐ 主题周末营', icon: '⭐' }
  ])
  
  // 徽章列表
  const badges = computed(() => {
    return myRewards.value.filter(r => r.type === REWARD_TYPE.BADGE)
  })
  
  // ==================== 初始化 ====================
  
  const init = () => {
    if (!currentBabyId.value) return
    loadCamps()
    loadMyRegistrations()
    loadMyRewards()
    loadMyPoints()
  }
  
  // ==================== 加载方法 ====================
  
  /**
   * 加载周末营列表
   */
  const loadCamps = (filter = {}) => {
    camps.value = weekendCampService.getCampsList(filter)
  }
  
  /**
   * 加载推荐周末营
   */
  const loadRecommendedCamps = () => {
    recommendedCamps.value = weekendCampService.getRecommendedCamps(currentBabyId.value)
  }
  
  /**
   * 加载周末营详情
   */
  const loadCampDetail = (campId) => {
    currentCamp.value = weekendCampService.getCampById(campId)
    return currentCamp.value
  }
  
  /**
   * 加载我的报名列表
   */
  const loadMyRegistrations = () => {
    if (!currentBabyId.value) return
    myRegistrations.value = weekendCampService.getMyRegistrations(currentBabyId.value)
  }
  
  /**
   * 加载我的奖励
   */
  const loadMyRewards = () => {
    if (!currentBabyId.value) return
    myRewards.value = weekendCampService.getBabyRewards(currentBabyId.value)
  }
  
  /**
   * 加载我的积分
   */
  const loadMyPoints = () => {
    if (!currentBabyId.value) return
    myPoints.value = weekendCampService.getBabyCampPoints(currentBabyId.value)
  }
  
  /**
   * 加载分享记录
   */
  const loadShares = (campId = null) => {
    shares.value = weekendCampService.getShares({ campId })
  }
  
  // ==================== 周末营管理 ====================
  
  /**
   * 创建周末营
   */
  const createNewCamp = (campData) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }
    
    isLoading.value = true
    errorMessage.value = ''
    
    try {
      const camp = weekendCampService.createCamp({
        ...campData,
        creatorId: currentBabyId.value,
        creatorName: currentBaby.value?.name || '我'
      })
      
      if (camp) {
        camps.value.unshift(camp)
      }
      
      return camp
    } catch (e) {
      errorMessage.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 更新周末营
   */
  const updateCamp = (campId, updates) => {
    const camp = weekendCampService.updateCamp(campId, updates)
    if (camp) {
      const index = camps.value.findIndex(c => c.id === campId)
      if (index !== -1) {
        camps.value[index] = camp
      }
      if (currentCamp.value?.id === campId) {
        currentCamp.value = camp
      }
    }
    return camp
  }
  
  /**
   * 删除周末营
   */
  const removeCamp = (campId) => {
    const success = weekendCampService.deleteCamp(campId)
    if (success) {
      camps.value = camps.value.filter(c => c.id !== campId)
    }
    return success
  }
  
  // ==================== 报名管理 ====================
  
  /**
   * 报名参加周末营
   */
  const registerForCamp = (campId) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }
    
    isLoading.value = true
    errorMessage.value = ''
    
    try {
      const registration = weekendCampService.registerForCamp(
        campId,
        currentBabyId.value,
        currentBaby.value?.name || '我'
      )
      
      if (registration) {
        myRegistrations.value.push(registration)
        // 更新营地的报名人数
        loadCamps()
      }
      
      return registration
    } catch (e) {
      errorMessage.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 取消报名
   */
  const cancelMyRegistration = (registrationId) => {
    const success = weekendCampService.cancelRegistration(registrationId)
    if (success) {
      const index = myRegistrations.value.findIndex(r => r.id === registrationId)
      if (index !== -1) {
        myRegistrations.value[index].status = REGISTRATION_STATUS.CANCELLED
      }
      loadCamps()
    }
    return success
  }
  
  /**
   * 确认报名状态
   */
  const confirmMyRegistration = (registrationId) => {
    const registration = weekendCampService.confirmRegistration(registrationId)
    if (registration) {
      const index = myRegistrations.value.findIndex(r => r.id === registrationId)
      if (index !== -1) {
        myRegistrations.value[index] = registration
      }
    }
    return registration
  }
  
  /**
   * 标记已参加
   */
  const markAttended = (registrationId) => {
    const registration = weekendCampService.markAttended(registrationId)
    if (registration) {
      const index = myRegistrations.value.findIndex(r => r.id === registrationId)
      if (index !== -1) {
        myRegistrations.value[index] = registration
      }
      // 检查并发放奖励
      checkAndGrantRewards()
      // 刷新积分
      loadMyPoints()
    }
    return registration
  }
  
  // ==================== 奖励管理 ====================
  
  /**
   * 检查并发放奖励
   */
  const checkAndGrantRewards = () => {
    if (!currentBabyId.value) return []
    const newRewards = weekendCampService.checkAndGrantRewards(currentBabyId.value)
    if (newRewards.length > 0) {
      loadMyRewards()
    }
    return newRewards
  }
  
  // ==================== 分享管理 ====================
  
  /**
   * 创建分享
   */
  const createShare = (campId, shareData) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }
    
    const share = weekendCampService.createShare(campId, currentBabyId.value, {
      ...shareData,
      babyName: currentBaby.value?.name || '我'
    })
    
    if (share) {
      shares.value.push(share)
    }
    
    return share
  }
  
  // ==================== 辅助方法 ====================
  
  /**
   * 检查是否已报名某个营地
   */
  const isRegistered = (campId) => {
    return myRegistrations.value.some(
      r => r.campId === campId && r.status !== REGISTRATION_STATUS.CANCELLED
    )
  }
  
  /**
   * 获取某个营地的报名状态
   */
  const getRegistrationStatus = (campId) => {
    const registration = myRegistrations.value.find(
      r => r.campId === campId && r.status !== REGISTRATION_STATUS.CANCELLED
    )
    return registration?.status || null
  }
  
  /**
   * 获取活动类型的显示名称
   */
  const getTypeName = (type) => {
    const typeMap = {
      [CAMP_ACTIVITY_TYPE.OUTDOOR_EXPLORATION]: '户外探索',
      [CAMP_ACTIVITY_TYPE.CREATIVE_WORKSHOP]: '创意工坊',
      [CAMP_ACTIVITY_TYPE.SOCIAL_PARTY]: '社交派对',
      [CAMP_ACTIVITY_TYPE.THEME_CAMP]: '主题周末营'
    }
    return typeMap[type] || type
  }
  
  /**
   * 获取活动状态的显示名称
   */
  const getStatusName = (status) => {
    const statusMap = {
      [CAMP_STATUS.UPCOMING]: '即将开始',
      [CAMP_STATUS.REGISTRATION]: '报名中',
      [CAMP_STATUS.ONGOING]: '进行中',
      [CAMP_STATUS.COMPLETED]: '已完成',
      [CAMP_STATUS.CANCELLED]: '已取消'
    }
    return statusMap[status] || status
  }
  
  /**
   * 获取状态对应的颜色
   */
  const getStatusColor = (status) => {
    const colorMap = {
      [CAMP_STATUS.UPCOMING]: '#999999',
      [CAMP_STATUS.REGISTRATION]: '#07c160',
      [CAMP_STATUS.ONGOING]: '#1677ff',
      [CAMP_STATUS.COMPLETED]: '#8477fa',
      [CAMP_STATUS.CANCELLED]: '#ff4d4f'
    }
    return colorMap[status] || '#999999'
  }
  
  /**
   * 按类型筛选
   */
  const setFilterType = (type) => {
    filterType.value = type
    loadCamps(type ? { type } : {})
  }
  
  /**
   * 按状态筛选
   */
  const setFilterStatus = (status) => {
    filterStatus.value = status
    loadCamps(status ? { status } : {})
  }
  
  return {
    // ==================== 状态 ====================
    camps,
    recommendedCamps,
    currentCamp,
    myRegistrations,
    currentRegistration,
    myRewards,
    myPoints,
    shares,
    isLoading,
    errorMessage,
    currentTab,
    filterType,
    filterStatus,
    
    // ==================== 计算属性 ====================
    campsByType,
    registeredCamps,
    upcomingCamps,
    ongoingCamps,
    completedCamps,
    activityTypes,
    badges,
    
    // ==================== 初始化 ====================
    init,
    
    // ==================== 加载方法 ====================
    loadCamps,
    loadRecommendedCamps,
    loadCampDetail,
    loadMyRegistrations,
    loadMyRewards,
    loadMyPoints,
    loadShares,
    
    // ==================== 周末营管理 ====================
    createNewCamp,
    updateCamp,
    removeCamp,
    
    // ==================== 报名管理 ====================
    registerForCamp,
    cancelMyRegistration,
    confirmMyRegistration,
    markAttended,
    
    // ==================== 奖励管理 ====================
    checkAndGrantRewards,
    
    // ==================== 分享管理 ====================
    createShare,
    
    // ==================== 辅助方法 ====================
    isRegistered,
    getRegistrationStatus,
    getTypeName,
    getStatusName,
    getStatusColor,
    setFilterType,
    setFilterStatus
  }
})
