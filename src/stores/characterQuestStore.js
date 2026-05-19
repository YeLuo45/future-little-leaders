/**
 * V88 Character Quest Store
 * 品格修炼系统状态管理
 * 品德修炼任务、品格等级、修炼日记、品格证书
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import characterQuestService, { 
  CHARACTER_TYPES,
  CHARACTER_INFO,
  LEVELS,
  QUEST_TYPES,
  QUEST_STATUS 
} from '@/services/characterQuestService.js'
import { useBabyStore } from './babyStore.js'

export const useCharacterQuestStore = defineStore('characterQuest', () => {
  // ==================== 状态 ====================

  // 品格等级
  const characterLevels = ref({})

  // 当前任务列表
  const availableQuests = ref([])

  // 任务记录
  const questRecords = ref([])

  // 日记列表
  const journalEntries = ref([])

  // 证书列表
  const certificates = ref([])

  // 当前选中的品格类型
  const selectedCharacterType = ref(null)

  // 当前选中的日记日期
  const selectedDate = ref(new Date().toISOString().split('T')[0])

  // 统计数据
  const statistics = ref({
    totalQuests: 0,
    completedQuests: 0,
    totalExp: 0,
    overallLevel: 1,
    journalCount: 0,
    certificateCount: 0
  })

  // 是否加载中
  const isLoading = ref(false)

  // ==================== 初始化 ====================

  const init = () => {
    characterQuestService.init()
    loadAllData()
  }

  const loadAllData = () => {
    const babyStore = useBabyStore()
    const babyId = babyStore.currentBabyId
    if (!babyId) return

    isLoading.value = true

    characterLevels.value = characterQuestService.getAllCharacterLevels(babyId)
    availableQuests.value = characterQuestService.getAvailableQuests(babyId)
    questRecords.value = characterQuestService.getQuestRecords(babyId)
    journalEntries.value = characterQuestService.getJournalEntries(babyId)
    certificates.value = characterQuestService.getCertificates(babyId)
    statistics.value = characterQuestService.getStatistics(babyId)

    isLoading.value = false
  }

  // ==================== 计算属性 ====================

  // 按品格类型分组的任务
  const questsByCharacterType = computed(() => {
    const grouped = {}
    Object.values(CHARACTER_TYPES).forEach(type => {
      grouped[type] = availableQuests.value.filter(q => q.characterType === type)
    })
    return grouped
  })

  // 今日任务
  const todayQuests = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return availableQuests.value.filter(q => q.date === today)
  })

  // 进行中的任务
  const inProgressQuests = computed(() => {
    return availableQuests.value.filter(q => q.status === QUEST_STATUS.IN_PROGRESS)
  })

  // 可领取的任务
  const newQuests = computed(() => {
    return availableQuests.value.filter(q => q.status === QUEST_STATUS.AVAILABLE)
  })

  // 已完成的任务
  const completedQuests = computed(() => {
    return questRecords.value.filter(r => r.status === QUEST_STATUS.COMPLETED)
  })

  // 按品格类型分组的日记
  const journalsByCharacterType = computed(() => {
    const grouped = {}
    Object.values(CHARACTER_TYPES).forEach(type => {
      grouped[type] = journalEntries.value.filter(j => j.characterType === type)
    })
    return grouped
  })

  // 品格等级进度
  const levelProgress = computed(() => {
    const progress = {}
    Object.entries(characterLevels.value).forEach(([type, info]) => {
      const currentLevelDef = Object.values(LEVELS).find(l => l.level === info.level)
      const expInLevel = currentLevelDef ? info.exp - currentLevelDef.minExp : 0
      const levelRange = currentLevelDef ? currentLevelDef.maxExp - currentLevelDef.minExp : 1
      progress[type] = {
        ...info,
        progress: currentLevelDef?.maxExp === Infinity ? 100 : Math.round((expInLevel / levelRange) * 100),
        levelName: currentLevelDef?.name || '未知'
      }
    })
    return progress
  })

  // ==================== 品格等级 Actions ====================

  const loadCharacterLevels = () => {
    const babyStore = useBabyStore()
    const babyId = babyStore.currentBabyId
    if (!babyId) return
    characterLevels.value = characterQuestService.getAllCharacterLevels(babyId)
  }

  const getCharacterLevel = (characterType) => {
    return characterLevels.value[characterType] || { exp: 0, level: 1 }
  }

  const addExp = (characterType, exp) => {
    const babyStore = useBabyStore()
    const babyId = babyStore.currentBabyId
    if (!babyId) return null

    const result = characterQuestService.addExp(babyId, characterType, exp)
    loadCharacterLevels()
    loadStatistics()

    // 检查证书
    if (result.leveledUp) {
      checkAndGenerateCertificates()
    }

    return result
  }

  const getLevelProgress = (characterType) => {
    const babyStore = useBabyStore()
    const babyId = babyStore.currentBabyId
    if (!babyId) return 0
    return characterQuestService.getLevelProgress(babyId, characterType)
  }

  // ==================== 任务 Actions ====================

  const loadQuests = () => {
    const babyStore = useBabyStore()
    const babyId = babyStore.currentBabyId
    if (!babyId) return
    availableQuests.value = characterQuestService.getAvailableQuests(babyId)
  }

  const acceptQuest = (questId) => {
    const babyStore = useBabyStore()
    const babyId = babyStore.currentBabyId
    if (!babyId) return null

    const record = characterQuestService.acceptQuest(babyId, questId)
    loadQuests()
    loadQuestRecords()
    return record
  }

  const updateQuestProgress = (questId, progress) => {
    const babyStore = useBabyStore()
    const babyId = babyStore.currentBabyId
    if (!babyId) return null

    const record = characterQuestService.updateQuestProgress(babyId, questId, progress)
    loadQuests()
    return record
  }

  const completeQuest = (questId) => {
    const babyStore = useBabyStore()
    const babyId = babyStore.currentBabyId
    if (!babyId) return null

    const result = characterQuestService.completeQuest(babyId, questId)
    if (result) {
      loadQuests()
      loadQuestRecords()
      loadCharacterLevels()
      loadStatistics()
    }
    return result
  }

  const loadQuestRecords = () => {
    const babyStore = useBabyStore()
    const babyId = babyStore.currentBabyId
    if (!babyId) return
    questRecords.value = characterQuestService.getQuestRecords(babyId)
  }

  const getQuestById = (questId) => {
    return characterQuestService.getQuestById(questId)
  }

  // ==================== 日记 Actions ====================

  const addJournalEntry = (data) => {
    const babyStore = useBabyStore()
    const babyId = babyStore.currentBabyId
    if (!babyId) return null

    const entry = characterQuestService.addJournalEntry(babyId, {
      ...data,
      date: data.date || selectedDate.value
    })
    loadJournalEntries()
    loadCharacterLevels()
    loadStatistics()
    return entry
  }

  const loadJournalEntries = () => {
    const babyStore = useBabyStore()
    const babyId = babyStore.currentBabyId
    if (!babyId) return
    journalEntries.value = characterQuestService.getJournalEntries(babyId)
  }

  const getJournalByDate = (date) => {
    const babyStore = useBabyStore()
    const babyId = babyStore.currentBabyId
    if (!babyId) return null
    return characterQuestService.getJournalByDate(babyId, date)
  }

  const setSelectedDate = (date) => {
    selectedDate.value = date
  }

  // ==================== 证书 Actions ====================

  const checkAndGenerateCertificates = () => {
    const babyStore = useBabyStore()
    const babyId = babyStore.currentBabyId
    if (!babyId) return []

    const newCerts = characterQuestService.checkAndGenerateCertificate(babyId)
    if (newCerts.length > 0) {
      loadCertificates()
      loadStatistics()
    }
    return newCerts
  }

  const loadCertificates = () => {
    const babyStore = useBabyStore()
    const babyId = babyStore.currentBabyId
    if (!babyId) return
    certificates.value = characterQuestService.getCertificates(babyId)
  }

  const getCertificateById = (certId) => {
    return characterQuestService.getCertificateById(certId)
  }

  // ==================== 统计 Actions ====================

  const loadStatistics = () => {
    const babyStore = useBabyStore()
    const babyId = babyStore.currentBabyId
    if (!babyId) return
    statistics.value = characterQuestService.getStatistics(babyId)
  }

  // ==================== 工具函数 ====================

  const getCharacterInfo = (characterType) => {
    return CHARACTER_INFO[characterType] || {}
  }

  const getAllCharacterTypes = () => {
    return Object.values(CHARACTER_TYPES)
  }

  const getLevelName = (level) => {
    const levelDef = Object.values(LEVELS).find(l => l.level === level)
    return levelDef?.name || '未知'
  }

  return {
    // 状态
    characterLevels,
    availableQuests,
    questRecords,
    journalEntries,
    certificates,
    selectedCharacterType,
    selectedDate,
    statistics,
    isLoading,

    // 计算属性
    questsByCharacterType,
    todayQuests,
    inProgressQuests,
    newQuests,
    completedQuests,
    journalsByCharacterType,
    levelProgress,

    // 初始化
    init,
    loadAllData,

    // 品格等级
    loadCharacterLevels,
    getCharacterLevel,
    addExp,
    getLevelProgress,

    // 任务
    loadQuests,
    acceptQuest,
    updateQuestProgress,
    completeQuest,
    loadQuestRecords,
    getQuestById,

    // 日记
    addJournalEntry,
    loadJournalEntries,
    getJournalByDate,
    setSelectedDate,

    // 证书
    checkAndGenerateCertificates,
    loadCertificates,
    getCertificateById,

    // 统计
    loadStatistics,

    // 工具
    getCharacterInfo,
    getAllCharacterTypes,
    getLevelName,

    // 常量
    CHARACTER_TYPES,
    CHARACTER_INFO,
    LEVELS,
    QUEST_TYPES,
    QUEST_STATUS
  }
})
