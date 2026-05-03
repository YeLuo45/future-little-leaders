import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

/**
 * 宝宝信息管理Store
 * 管理宝宝列表、当前选中宝宝等信息
 */
export const useBabyStore = defineStore('baby', () => {
  // 状态
  const babies = ref([])
  const currentBabyId = ref('')
  
  // 计算属性
  // 当前选中的宝宝
  const currentBaby = computed(() => {
    return babies.value.find(baby => baby.id === currentBabyId.value) || null
  })
  
  // 当前宝宝名称
  const currentBabyName = computed(() => {
    const baby = currentBaby.value
    return baby ? baby.name : '请选择宝宝'
  })
  
  // 当前宝宝头像
  const currentBabyAvatar = computed(() => {
    const baby = currentBaby.value
    if (!baby) return null
    
    let avatar = baby.avatar || ''
    
    // 检查是否为Blob URL，可能是无效的
    if (avatar && avatar.startsWith('blob:')) {
      console.log('检测到Blob类型头像，可能无效，改用emoji表情代替')
      return null
    }
    
    return avatar
  })
  
  // 方法
  // 加载宝宝列表
  const loadBabies = () => {
    try {
      const storedBabies = uni.getStorageSync('babies') || '[]'
      babies.value = typeof storedBabies === 'string' ? JSON.parse(storedBabies) : storedBabies
      
      // 加载当前宝宝ID
      const storedBabyId = uni.getStorageSync('currentBabyId')
      currentBabyId.value = storedBabyId || (babies.value.length > 0 ? babies.value[0].id : '')
      
      // 如果存在宝宝且未设置当前宝宝ID，设置第一个宝宝为当前宝宝
      if (babies.value.length > 0 && !currentBabyId.value) {
        currentBabyId.value = babies.value[0].id
        uni.setStorageSync('currentBabyId', currentBabyId.value)
      }
      
      // 修复无效的Blob URL头像
      fixInvalidBlobAvatars()
      
    } catch (e) {
      console.error('加载宝宝信息失败:', e)
      babies.value = []
    }
  }
  
  // 保存宝宝列表
  const saveBabies = () => {
    try {
      uni.setStorageSync('babies', JSON.stringify(babies.value))
      return true
    } catch (e) {
      console.error('保存宝宝列表失败:', e)
      return false
    }
  }
  
  // 设置当前宝宝
  const setCurrentBaby = (babyId) => {
    currentBabyId.value = babyId
    uni.setStorageSync('currentBabyId', babyId)
    // 广播宝宝切换事件
    uni.$emit('babyChanged', babyId)
  }
  
  // 添加宝宝
  const addBaby = (baby) => {
    // 创建新宝宝对象
    const newBaby = {
      id: uuidv4(),
      name: baby.name,
      gender: baby.gender,
      birthdate: baby.birthdate,
      avatar: baby.avatar || '',
      createdAt: new Date().toISOString()
    }
    
    // 添加到列表
    babies.value.push(newBaby)
    
    // 如果是第一个宝宝，设置为当前宝宝
    if (babies.value.length === 1) {
      setCurrentBaby(newBaby.id)
    }
    
    // 保存
    saveBabies()
    
    // 广播宝宝列表更新事件
    uni.$emit('refreshBabyList')
    
    return newBaby
  }
  
  // 更新宝宝信息
  const updateBaby = (id, data) => {
    const index = babies.value.findIndex(b => b.id === id)
    if (index !== -1) {
      // 更新宝宝信息
      babies.value[index] = { ...babies.value[index], ...data }
      // 保存更新
      saveBabies()
      // 广播宝宝列表更新事件
      uni.$emit('refreshBabyList')
      return true
    }
    return false
  }
  
  // 删除宝宝
  const deleteBaby = (id) => {
    // 删除前的宝宝数
    const beforeCount = babies.value.length
    
    // 从列表中移除
    babies.value = babies.value.filter(b => b.id !== id)
    
    // 如果删除的是当前选中的宝宝，重置当前宝宝
    if (currentBabyId.value === id) {
      currentBabyId.value = babies.value.length > 0 ? babies.value[0].id : ''
      uni.setStorageSync('currentBabyId', currentBabyId.value)
    }
    
    // 保存更新
    saveBabies()
    
    // 广播宝宝列表更新事件
    uni.$emit('refreshBabyList')
    
    // 判断是否删除成功
    return babies.value.length < beforeCount
  }
  
  // 获取默认头像
  const getDefaultAvatar = (babyId) => {
    // 基于宝宝ID返回一个默认表情头像
    const lastChar = babyId ? babyId.charAt(babyId.length - 1) : '0'
    const lastDigit = parseInt(lastChar, 16) % 5 // 获取0-4的值
    
    // 定义几个可爱的表情作为默认头像
    const defaultAvatars = ['👶', '👼', '🧒', '👦', '👧']
    return defaultAvatars[lastDigit]
  }
  
  // 修复无效的Blob URL头像
  const fixInvalidBlobAvatars = () => {
    let needUpdate = false
    
    // 检查每个宝宝的头像
    babies.value.forEach(baby => {
      if (baby.avatar && baby.avatar.startsWith('blob:')) {
        // 将无效的Blob URL删除，改用默认头像
        baby.avatar = ''
        needUpdate = true
      }
    })
    
    // 如果有修改，保存回存储
    if (needUpdate) {
      saveBabies()
    }
  }
  
  // 格式化宝宝年龄
  const formatAge = (birthdate) => {
    if (!birthdate) return '年龄未知'
    
    const birth = new Date(birthdate)
    const now = new Date()
    
    let years = now.getFullYear() - birth.getFullYear()
    let months = now.getMonth() - birth.getMonth()
    
    if (months < 0) {
      years--
      months += 12
    }
    
    if (years > 0) {
      return `${years}岁${months > 0 ? months + '个月' : ''}`
    } else {
      return `${months}个月`
    }
  }
  
  // 初始化Store
  const init = () => {
    loadBabies()
  }
  
  return {
    // 状态
    babies,
    currentBabyId,
    
    // 计算属性
    currentBaby,
    currentBabyName,
    currentBabyAvatar,
    
    // 方法
    loadBabies,
    saveBabies,
    setCurrentBaby,
    addBaby,
    updateBaby,
    deleteBaby,
    getDefaultAvatar,
    formatAge,
    init
  }
}) 