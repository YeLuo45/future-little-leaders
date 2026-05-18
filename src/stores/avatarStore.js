import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import avatarService from '@/services/avatarService.js'

/**
 * V53 Avatar Store
 * 个性化虚拟形象状态管理
 */
export const useAvatarStore = defineStore('avatar', () => {
  // 状态
  const avatarData = ref(null)
  const wardrobeData = ref(null)
  const achievementsData = ref(null)
  const isLoading = ref(false)
  const currentExpression = ref('happy')
  const isAnimating = ref(false)
  const showAchievementModal = ref(false)
  const newAchievement = ref(null)
  const showLevelUpModal = ref(false)
  const newLevel = ref(1)

  // 初始化
  const init = () => {
    loadAvatarData()
    loadWardrobeData()
    loadAchievementsData()
  }

  // 加载头像数据
  const loadAvatarData = () => {
    avatarData.value = avatarService.getAvatarData()
    currentExpression.value = avatarData.value.expression || 'happy'
  }

  // 加载衣柜数据
  const loadWardrobeData = () => {
    wardrobeData.value = avatarService.getWardrobeData()
  }

  // 加载成就数据
  const loadAchievementsData = () => {
    achievementsData.value = avatarService.getAchievementsData()
  }

  // 更新头像
  const updateAvatar = (updates) => {
    avatarData.value = avatarService.updateAvatar(updates)
  }

  // 设置脸型
  const setFaceShape = (faceShapeId) => {
    updateAvatar({ faceShape: faceShapeId })
    triggerExpGain(5)
  }

  // 设置发型
  const setHairStyle = (hairStyleId) => {
    updateAvatar({ hairStyle: hairStyleId })
    triggerExpGain(5)
  }

  // 设置肤色
  const setSkinTone = (skinToneId) => {
    updateAvatar({ skinTone: skinToneId })
    triggerExpGain(5)
  }

  // 设置眼睛
  const setEyeStyle = (eyeStyleId) => {
    updateAvatar({ eyeStyle: eyeStyleId })
    triggerExpGain(5)
  }

  // 设置配饰
  const setAccessories = (accessoryId) => {
    const owned = wardrobeData.value.ownedAccessories
    if (!owned.includes(accessoryId)) {
      uni.showToast({ title: '请先解锁该配饰', icon: 'none' })
      return
    }
    updateAvatar({ accessories: accessoryId })
    triggerExpGain(3)
  }

  // 设置服装
  const setOutfit = (outfitId) => {
    const owned = wardrobeData.value.ownedOutfits
    if (!owned.includes(outfitId)) {
      uni.showToast({ title: '请先解锁该服装', icon: 'none' })
      return
    }
    updateAvatar({ outfit: outfitId })
    triggerExpGain(3)
  }

  // 设置表情
  const setExpression = (expressionId) => {
    const result = avatarService.setExpression(expressionId)
    if (result.success) {
      currentExpression.value = expressionId
      avatarData.value = result.avatarData
      playExpressionAnimation(expressionId)
    } else {
      uni.showToast({ title: result.message, icon: 'none' })
    }
  }

  // 播放表情动画
  const playExpressionAnimation = (expressionId) => {
    isAnimating.value = true
    setTimeout(() => {
      isAnimating.value = false
    }, 1000)
  }

  // 触发经验获取
  const triggerExpGain = (amount = 10) => {
    const result = avatarService.addExp(amount)
    avatarData.value = result.avatarData
    
    if (result.leveledUp) {
      newLevel.value = result.newLevel
      showLevelUpModal.value = true
      uni.$emit('avatarLevelUp', result.newLevel)
    }
    
    if (result.newAchievements && result.newAchievements.length > 0) {
      newAchievement.value = result.newAchievements[0]
      showAchievementModal.value = true
      result.newAchievements.forEach(a => {
        uni.$emit('avatarAchievementUnlocked', a)
      })
    }
  }

  // 购买物品
  const purchaseItem = (itemType, itemId) => {
    const result = avatarService.purchaseItem(itemType, itemId)
    
    if (result.success) {
      loadWardrobeData()
      loadAchievementsData()
      
      if (result.newAchievement) {
        newAchievement.value = result.newAchievement
        showAchievementModal.value = true
        uni.$emit('avatarAchievementUnlocked', result.newAchievement)
      }
      
      uni.showToast({ title: result.message, icon: 'success' })
    } else {
      uni.showToast({ title: result.message, icon: 'none' })
    }
    
    return result
  }

  // 关闭成就弹窗
  const closeAchievementModal = () => {
    showAchievementModal.value = false
    newAchievement.value = null
  }

  // 关闭升级弹窗
  const closeLevelUpModal = () => {
    showLevelUpModal.value = false
  }

  // 计算属性
  const hasAvatar = computed(() => !!avatarData.value)

  const faceShapeInfo = computed(() => {
    if (!avatarData.value) return null
    return avatarService.FACE_SHAPES[avatarData.value.faceShape]
  })

  const hairStyleInfo = computed(() => {
    if (!avatarData.value) return null
    return avatarService.HAIR_STYLES[avatarData.value.hairStyle]
  })

  const skinToneInfo = computed(() => {
    if (!avatarData.value) return null
    return avatarService.SKIN_TONES[avatarData.value.skinTone]
  })

  const eyeStyleInfo = computed(() => {
    if (!avatarData.value) return null
    return avatarService.EYE_STYLES[avatarData.value.eyeStyle]
  })

  const accessoryInfo = computed(() => {
    if (!avatarData.value) return null
    return avatarService.ACCESSORIES[avatarData.value.accessories]
  })

  const outfitInfo = computed(() => {
    if (!avatarData.value) return null
    return avatarService.OUTFITS[avatarData.value.outfit]
  })

  const expressionInfo = computed(() => {
    if (!avatarData.value) return null
    return avatarService.EXPRESSIONS[avatarData.value.expression || currentExpression.value]
  })

  const expToNextLevel = computed(() => {
    if (!avatarData.value) return 100
    const currentLevelExp = (avatarData.value.level - 1) * 100
    const nextLevelExp = avatarData.value.level * 100
    return Math.max(0, nextLevelExp - avatarData.value.totalExp)
  })

  const progressToNextLevel = computed(() => {
    if (!avatarData.value) return 0
    const currentLevelExp = (avatarData.value.level - 1) * 100
    const expInLevel = avatarData.value.totalExp - currentLevelExp
    return Math.min(100, Math.round((expInLevel / 100) * 100))
  })

  const expressionAnimClass = computed(() => {
    return avatarService.getExpressionAnimation(currentExpression.value)
  })

  const unlockedOutfits = computed(() => {
    if (!wardrobeData.value) return []
    return wardrobeData.value.ownedOutfits.map(id => avatarService.OUTFITS[id]).filter(Boolean)
  })

  const lockedOutfits = computed(() => {
    if (!wardrobeData.value) return []
    const allOutfits = Object.values(avatarService.OUTFITS)
    return allOutfits.filter(o => !wardrobeData.value.ownedOutfits.includes(o.id))
  })

  const unlockedAccessories = computed(() => {
    if (!wardrobeData.value) return []
    return wardrobeData.value.ownedAccessories.map(id => avatarService.ACCESSORIES[id]).filter(Boolean)
  })

  const lockedAccessories = computed(() => {
    if (!wardrobeData.value) return []
    const allAccessories = Object.values(avatarService.ACCESSORIES)
    return allAccessories.filter(a => !wardrobeData.value.ownedAccessories.includes(a.id))
  })

  const unlockedExpressions = computed(() => {
    if (!wardrobeData.value) return []
    return wardrobeData.value.ownedExpressions.map(id => avatarService.EXPRESSIONS[id]).filter(Boolean)
  })

  const lockedExpressions = computed(() => {
    if (!wardrobeData.value) return []
    const allExpressions = Object.values(avatarService.EXPRESSIONS)
    return allExpressions.filter(e => !wardrobeData.value.ownedExpressions.includes(e.id))
  })

  const allAchievements = computed(() => {
    return Object.values(avatarService.AVATAR_ACHIEVEMENTS)
  })

  const unlockedAchievementsList = computed(() => {
    if (!achievementsData.value) return []
    return achievementsData.value.unlockedAchievements.map(id => avatarService.AVATAR_ACHIEVEMENTS[id]).filter(Boolean)
  })

  const achievementProgress = computed(() => {
    if (!achievementsData.value) return { unlocked: 0, total: 0 }
    const total = Object.keys(avatarService.AVATAR_ACHIEVEMENTS).length
    return {
      unlocked: achievementsData.value.unlockedAchievements.length,
      total
    }
  })

  // 获取头像显示信息（用于组合展示）
  const avatarDisplay = computed(() => {
    if (!avatarData.value) return ''
    const parts = []
    if (skinToneInfo.value) parts.push(skinToneInfo.value.color)
    if (faceShapeInfo.value) parts.push(faceShapeInfo.value.icon)
    if (hairStyleInfo.value) parts.push(hairStyleInfo.value.icon)
    if (eyeStyleInfo.value) parts.push(eyeStyleInfo.value.icon)
    if (accessoryInfo.value) parts.push(accessoryInfo.value.icon)
    if (outfitInfo.value) parts.push(outfitInfo.value.icon)
    parts.push(expressionInfo.value?.icon || '😊')
    return parts.join(' ')
  })

  return {
    // 状态
    avatarData,
    wardrobeData,
    achievementsData,
    isLoading,
    currentExpression,
    isAnimating,
    showAchievementModal,
    newAchievement,
    showLevelUpModal,
    newLevel,

    // 计算属性
    hasAvatar,
    faceShapeInfo,
    hairStyleInfo,
    skinToneInfo,
    eyeStyleInfo,
    accessoryInfo,
    outfitInfo,
    expressionInfo,
    expToNextLevel,
    progressToNextLevel,
    expressionAnimClass,
    unlockedOutfits,
    lockedOutfits,
    unlockedAccessories,
    lockedAccessories,
    unlockedExpressions,
    lockedExpressions,
    allAchievements,
    unlockedAchievementsList,
    achievementProgress,
    avatarDisplay,

    // 方法
    init,
    loadAvatarData,
    loadWardrobeData,
    loadAchievementsData,
    updateAvatar,
    setFaceShape,
    setHairStyle,
    setSkinTone,
    setEyeStyle,
    setAccessories,
    setOutfit,
    setExpression,
    playExpressionAnimation,
    triggerExpGain,
    purchaseItem,
    closeAchievementModal,
    closeLevelUpModal
  }
})
