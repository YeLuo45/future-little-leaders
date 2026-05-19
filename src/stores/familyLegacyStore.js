/**
 * V100 Family Legacy Store
 * 家族传承系统状态管理
 * 家族历史、家族树、家训传承、家族荣誉
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import familyLegacyService from '@/services/familyLegacyService.js'

export const useFamilyLegacyStore = defineStore('familyLegacy', () => {
  // ==================== 状态 ====================
  
  // 家族历史记录
  const histories = ref([])
  
  // 家族树数据
  const familyTree = ref({ rootId: null, members: [] })
  
  // 家训列表
  const legacies = ref([])
  
  // 家族荣誉列表
  const honors = ref([])
  
  // 家族故事列表
  const stories = ref([])
  
  // 当前选中的成员
  const currentMemberId = ref(null)
  
  // 当前标签页
  const currentTab = ref('history')

  // ==================== 初始化 ====================

  const init = () => {
    familyLegacyService.initFamilyLegacy()
    loadHistories()
    loadFamilyTree()
    loadLegacies()
    loadHonors()
    loadStories()
  }

  // ==================== 加载方法 ====================

  const loadHistories = () => {
    histories.value = familyLegacyService.getFamilyHistory()
  }

  const loadFamilyTree = () => {
    familyTree.value = familyLegacyService.getFamilyTree()
  }

  const loadLegacies = () => {
    legacies.value = familyLegacyService.getFamilyLegacies()
  }

  const loadHonors = () => {
    honors.value = familyLegacyService.getFamilyHonors()
  }

  const loadStories = () => {
    stories.value = familyLegacyService.getFamilyStories()
  }

  // ==================== 计算属性 ====================

  // 活跃家训
  const activeLegacies = computed(() => {
    return legacies.value.filter(l => l.status === 'active')
  })

  // 已传承家训
  const passedDownLegacies = computed(() => {
    return legacies.value.filter(l => l.passedDown)
  })

  // 按类型分组的荣誉
  const honorsByType = computed(() => {
    const grouped = {}
    honors.value.forEach(honor => {
      if (!grouped[honor.type]) {
        grouped[honor.type] = []
      }
      grouped[honor.type].push(honor)
    })
    return grouped
  })

  // 按年份分组的历史
  const historiesByYear = computed(() => {
    const grouped = {}
    histories.value.forEach(history => {
      const year = new Date(history.createdAt).getFullYear()
      if (!grouped[year]) grouped[year] = []
      grouped[year].push(history)
    })
    return grouped
  })

  // 按年份分组的故事
  const storiesByYear = computed(() => {
    const grouped = {}
    stories.value.forEach(story => {
      const year = new Date(story.createdAt).getFullYear()
      if (!grouped[year]) grouped[year] = []
      grouped[year].push(story)
    })
    return grouped
  })

  // 当前选中的成员
  const currentMember = computed(() => {
    if (!currentMemberId.value) return null
    return familyTree.value.members.find(m => m.id === currentMemberId.value)
  })

  // 统计信息
  const statistics = computed(() => {
    return familyLegacyService.getStatistics()
  })

  // 家族树层级结构
  const treeHierarchy = computed(() => {
    const { rootId, members } = familyTree.value
    if (!rootId || members.length === 0) return []

    const buildTree = (memberId) => {
      const member = members.find(m => m.id === memberId)
      if (!member) return null

      const children = members.filter(m => 
        m.relations?.some(r => r.relatedId === memberId && 
          [familyLegacyService.RELATION_TYPE.SON, familyLegacyService.RELATION_TYPE.DAUGHTER].includes(r.type))
      )

      return {
        ...member,
        children: children.map(c => buildTree(c.id)).filter(Boolean)
      }
    }

    return buildTree(rootId) || []
  })

  // ==================== 家族历史操作 ====================

  const addHistory = (history) => {
    const newHistory = familyLegacyService.addFamilyHistory(history)
    loadHistories()
    return newHistory
  }

  const updateHistory = (id, updates) => {
    const updated = familyLegacyService.updateFamilyHistory(id, updates)
    loadHistories()
    return updated
  }

  const removeHistory = (id) => {
    familyLegacyService.deleteFamilyHistory(id)
    loadHistories()
  }

  // ==================== 家族树操作 ====================

  const addMember = (member) => {
    const newMember = familyLegacyService.addFamilyMember(member)
    loadFamilyTree()
    return newMember
  }

  const updateMember = (id, updates) => {
    const updated = familyLegacyService.updateFamilyMember(id, updates)
    loadFamilyTree()
    return updated
  }

  const removeMember = (id) => {
    familyLegacyService.deleteFamilyMember(id)
    loadFamilyTree()
  }

  const setRelation = (memberId, parentId, relationType) => {
    const updated = familyLegacyService.setMemberRelation(memberId, parentId, relationType)
    loadFamilyTree()
    return updated
  }

  const selectMember = (memberId) => {
    currentMemberId.value = memberId
  }

  const setRootMember = (memberId) => {
    familyTree.value.rootId = memberId
    uni.setStorageSync('family_legacy_tree', JSON.stringify(familyTree.value))
  }

  // ==================== 家训操作 ====================

  const addLegacy = (legacy) => {
    const newLegacy = familyLegacyService.addFamilyLegacy(legacy)
    loadLegacies()
    return newLegacy
  }

  const updateLegacy = (id, updates) => {
    const updated = familyLegacyService.updateFamilyLegacy(id, updates)
    loadLegacies()
    return updated
  }

  const removeLegacy = (id) => {
    familyLegacyService.deleteFamilyLegacy(id)
    loadLegacies()
  }

  const markPassedDown = (id) => {
    familyLegacyService.markLegacyPassedDown(id)
    loadLegacies()
  }

  // ==================== 家族荣誉操作 ====================

  const addHonor = (honor) => {
    const newHonor = familyLegacyService.addFamilyHonor(honor)
    loadHonors()
    return newHonor
  }

  const updateHonor = (id, updates) => {
    const updated = familyLegacyService.updateFamilyHonor(id, updates)
    loadHonors()
    return updated
  }

  const removeHonor = (id) => {
    familyLegacyService.deleteFamilyHonor(id)
    loadHonors()
  }

  // ==================== 家族故事操作 ====================

  const addStory = (story) => {
    const newStory = familyLegacyService.addFamilyStory(story)
    loadStories()
    return newStory
  }

  const updateStory = (id, updates) => {
    const updated = familyLegacyService.updateFamilyStory(id, updates)
    loadStories()
    return updated
  }

  const removeStory = (id) => {
    familyLegacyService.deleteFamilyStory(id)
    loadStories()
  }

  // ==================== 导出 ====================

  const exportData = () => {
    return {
      familyTree: familyTree.value,
      histories: histories.value,
      legacies: legacies.value,
      honors: honors.value,
      stories: stories.value,
      exportedAt: new Date().toISOString()
    }
  }

  // ==================== 返回 ====================

  return {
    // 状态
    histories,
    familyTree,
    legacies,
    honors,
    stories,
    currentMemberId,
    currentTab,

    // 计算属性
    activeLegacies,
    passedDownLegacies,
    honorsByType,
    historiesByYear,
    storiesByYear,
    currentMember,
    statistics,
    treeHierarchy,

    // 方法 - 初始化
    init,

    // 方法 - 加载
    loadHistories,
    loadFamilyTree,
    loadLegacies,
    loadHonors,
    loadStories,

    // 方法 - 家族历史
    addHistory,
    updateHistory,
    removeHistory,

    // 方法 - 家族树
    addMember,
    updateMember,
    removeMember,
    setRelation,
    selectMember,
    setRootMember,

    // 方法 - 家训
    addLegacy,
    updateLegacy,
    removeLegacy,
    markPassedDown,

    // 方法 - 家族荣誉
    addHonor,
    updateHonor,
    removeHonor,

    // 方法 - 家族故事
    addStory,
    updateStory,
    removeStory,

    // 方法 - 导出
    exportData
  }
})
