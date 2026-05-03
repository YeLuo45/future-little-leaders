import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore'

/**
 * 积分信息管理Store
 * 管理宝宝积分、积分历史记录等
 */
export const usePointsStore = defineStore('points', () => {
  // 状态
  const pointsRecords = ref([])   // 积分记录列表
  const exchangeRecords = ref([]) // 兑换记录列表
  const babyPoints = ref({})      // 宝宝积分映射表 {babyId: points}
  
  // 获取宝宝Store
  const babyStore = useBabyStore()
  
  // 计算属性
  // 当前宝宝的积分总数
  const currentBabyPoints = computed(() => {
    const babyId = babyStore.currentBabyId
    return getBabyPoints(babyId)
  })
  
  // 当前宝宝的积分记录
  const currentBabyPointsRecords = computed(() => {
    const babyId = babyStore.currentBabyId
    return pointsRecords.value.filter(record => record.babyId === babyId)
  })
  
  // 当前宝宝的兑换记录
  const currentBabyExchangeRecords = computed(() => {
    const babyId = babyStore.currentBabyId
    return exchangeRecords.value.filter(record => record.babyId === babyId)
  })
  
  // 方法
  // 加载积分记录
  const loadPointsRecords = () => {
    try {
      const records = uni.getStorageSync('pointsRecords')
      if (records) {
        pointsRecords.value = JSON.parse(records)
      }
    } catch (e) {
      console.error('加载积分记录失败:', e)
      pointsRecords.value = []
    }
  }
  
  // 保存积分记录
  const savePointsRecords = () => {
    try {
      uni.setStorageSync('pointsRecords', JSON.stringify(pointsRecords.value))
      return true
    } catch (e) {
      console.error('保存积分记录失败:', e)
      return false
    }
  }
  
  // 加载兑换记录
  const loadExchangeRecords = () => {
    try {
      const records = uni.getStorageSync('exchangeHistory')
      if (records) {
        exchangeRecords.value = JSON.parse(records)
      }
    } catch (e) {
      console.error('加载兑换记录失败:', e)
      exchangeRecords.value = []
    }
  }
  
  // 保存兑换记录
  const saveExchangeRecords = () => {
    try {
      uni.setStorageSync('exchangeHistory', JSON.stringify(exchangeRecords.value))
      return true
    } catch (e) {
      console.error('保存兑换记录失败:', e)
      return false
    }
  }
  
  // 加载宝宝积分数据
  const loadBabyPoints = () => {
    try {
      const pointsData = uni.getStorageSync('babyPointsRecords')
      if (pointsData) {
        babyPoints.value = JSON.parse(pointsData)
      }
    } catch (e) {
      console.error('加载宝宝积分失败:', e)
      babyPoints.value = {}
    }
    
    // 从积分记录中重新计算宝宝积分总额
    recalculateBabyPoints()
  }
  
  // 保存宝宝积分数据
  const saveBabyPoints = () => {
    try {
      console.log('saveBabyPoints', babyPoints.value)
      uni.setStorageSync('babyPointsRecords', JSON.stringify(babyPoints.value))
      return true
    } catch (e) {
      console.error('保存宝宝积分失败:', e)
      return false
    }
  }
  
  // 重新计算所有宝宝的积分总额
  const recalculateBabyPoints = () => {
    // 清空当前积分数据
    babyPoints.value = {}
    
    // 从所有积分记录中重新计算
    pointsRecords.value.forEach(record => {
      const { babyId, points, type } = record

      const pointsInt = parseInt(points)
      if (!babyId) return
      
      // 初始化宝宝积分
      if (babyPoints.value[babyId] === undefined) {
        babyPoints.value[babyId] = 0
      }

      babyPoints.value[babyId] = parseInt(babyPoints.value[babyId])
      
      // 收入加积分，支出减积分
      if (type === 'income') {
        babyPoints.value[babyId] += pointsInt
      } else if (type === 'expense') {
        babyPoints.value[babyId] -= pointsInt
      }
    })
    
    // 保存更新后的积分数据
    saveBabyPoints()
  }
  
  // 获取宝宝积分
  const getBabyPoints = (babyId) => {
    if (!babyId) return 0
    
    // 从内存中获取,将其转换为整型
    const points = babyPoints.value[babyId] || 0

    return parseInt(points)
  }
  
  // 添加积分记录
  const addPointsRecord = (babyId, points, desc = '完成任务', type = 'income') => {
    if (!babyId) return false
    
    // 创建新的积分记录
    const newRecord = {
      id: Date.now().toString(),
      babyId,
      points,
      description: desc,
      type, // 'income' or 'expense'
      createdAt: new Date().toISOString()
    }
    
    // 添加到记录列表
    pointsRecords.value.push(newRecord)
    
    // 保存记录
    savePointsRecords()
    
    // 更新宝宝积分
    if (type === 'income') {
      // 初始化宝宝积分
      if (babyPoints.value[babyId] === undefined) {
        babyPoints.value[babyId] = 0
      }
      babyPoints.value[babyId] += points
    } else if (type === 'expense') {
      // 初始化宝宝积分
      if (babyPoints.value[babyId] === undefined) {
        babyPoints.value[babyId] = 0
      }
      babyPoints.value[babyId] -= points
    }
    saveBabyPoints()
    
    // 广播积分更新事件
    uni.$emit('pointsUpdated', babyId)
    uni.$emit('babyPointsUpdated', { babyId, points: getBabyPoints(babyId) })
    
    return true
  }
  
  // 添加宝宝积分
  const addBabyPoints = (babyId, points, desc = '完成任务') => {
    if (!babyId || points <= 0) return false

    return addPointsRecord(babyId, parseInt(points), desc, 'income')
  }
  
  // 扣除宝宝积分
  const deductBabyPoints = (babyId, points, desc = '兑换商品') => {
    if (!babyId || points <= 0) return false
    
    // 检查积分余额
    const currentPoints = getBabyPoints(babyId)
    const deductPoints = parseInt(points)
    if (currentPoints < deductPoints) {
      return false
    }

    return addPointsRecord(babyId, deductPoints, desc, 'expense')
  }
  
  // 添加兑换记录
  const addExchangeRecord = (babyId, product) => {
    if (!babyId || !product) return false
    
    // 创建兑换记录
    const exchangeRecord = {
      id: Date.now().toString(),
      babyId,
      productName: product.name,
      points: product.points,
      exchangeTime: new Date().toISOString(),
      status: '兑换成功'
    }
    
    // 添加到兑换记录
    exchangeRecords.value.unshift(exchangeRecord)
    
    // 保存兑换记录
    saveExchangeRecords()
    
    return true
  }
  
  // 兑换商品
  const exchangeProduct = async (babyId, product) => {
    if (!babyId || !product) return false
    
    // 检查积分余额
    const currentPoints = getBabyPoints(babyId)
    if (currentPoints < product.points) {
      uni.showToast({
        title: '积分不足',
        icon: 'none'
      })
      return false
    }
    
    // 扣除积分
    const success = deductBabyPoints(babyId, product.points, `兑换${product.name}`)
    if (!success) {
      uni.showToast({
        title: '兑换失败，请重试',
        icon: 'none'
      })
      return false
    }
    
    // 添加兑换记录
    addExchangeRecord(babyId, product)
    
    uni.showToast({
      title: '兑换成功',
      icon: 'success'
    })
    
    return true
  }
  
  // 初始化Store
  const init = () => {
    loadPointsRecords()
    loadExchangeRecords()
    loadBabyPoints()
  }
  
  return {
    // 状态
    pointsRecords,
    exchangeRecords,
    babyPoints,
    
    // 计算属性
    currentBabyPoints,
    currentBabyPointsRecords,
    currentBabyExchangeRecords,
    
    // 方法
    loadPointsRecords,
    loadExchangeRecords,
    loadBabyPoints,
    getBabyPoints,
    addBabyPoints,
    deductBabyPoints,
    exchangeProduct,
    recalculateBabyPoints,
    init
  }
}) 