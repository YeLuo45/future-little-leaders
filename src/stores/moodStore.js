/**
 * V82 Mood Journal Store
 * 情绪日记系统状态管理
 * 情绪追踪、情绪分析、情绪调节建议、心理健康引导
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'

export const useMoodStore = defineStore('mood', () => {
  // ==================== 常量 ====================

  // 情绪类型
  const MOOD_TYPES = {
    HAPPY: 'happy',      // 开心
    CALM: 'calm',         // 平静
    ANXIOUS: 'anxious',  // 焦虑
    SAD: 'sad',          // 难过
    ANGRY: 'angry'       // 愤怒
  }

  // 情绪emoji映射
  const MOOD_EMOJIS = {
    [MOOD_TYPES.HAPPY]: '😊',
    [MOOD_TYPES.CALM]: '😌',
    [MOOD_TYPES.ANXIOUS]: '😰',
    [MOOD_TYPES.SAD]: '😢',
    [MOOD_TYPES.ANGRY]: '😠'
  }

  // 情绪颜色映射
  const MOOD_COLORS = {
    [MOOD_TYPES.HAPPY]: '#FFD93D',
    [MOOD_TYPES.CALM]: '#1ABC9C',
    [MOOD_TYPES.ANXIOUS]: '#E74C3C',
    [MOOD_TYPES.SAD]: '#6C9BCF',
    [MOOD_TYPES.ANGRY]: '#FF6B6B'
  }

  // 情绪名称映射
  const MOOD_NAMES = {
    [MOOD_TYPES.HAPPY]: '开心',
    [MOOD_TYPES.CALM]: '平静',
    [MOOD_TYPES.ANXIOUS]: '焦虑',
    [MOOD_TYPES.SAD]: '难过',
    [MOOD_TYPES.ANGRY]: '愤怒'
  }

  // 触发因素选项
  const TRIGGER_OPTIONS = [
    '学习压力', '人际关系', '家庭因素', '睡眠不足',
    '身体健康', '兴趣爱好', '获得成就', '天气变化', '其他'
  ]

  // 调节建议
  const REGULATION_TIPS = {
    [MOOD_TYPES.HAPPY]: [
      '继续保持好心情！',
      '可以尝试帮助他人，传递快乐',
      '记录今天的美好时刻'
    ],
    [MOOD_TYPES.CALM]: [
      '平静是最好的状态',
      '可以尝试冥想或阅读',
      '享受当下的宁静'
    ],
    [MOOD_TYPES.ANXIOUS]: [
      '深呼吸，慢慢吸气4秒，屏住4秒，呼出4秒',
      '尝试54321 grounding技术：说出5样看到的、4样摸到的...',
      '把焦虑写下来，分析是否可以控制'
    ],
    [MOOD_TYPES.SAD]: [
      '允许自己悲伤，这是正常的情绪',
      '和信任的人聊聊你的感受',
      '做一些让自己舒服的事情'
    ],
    [MOOD_TYPES.ANGRY]: [
      '先离开让你生气的环境',
      '深呼吸10次',
      '尝试用运动发泄情绪'
    ]
  }

  // 深呼吸练习配置
  const BREATHING_EXERCISE = {
    name: '深呼吸放松',
    duration: 60, // 秒
    inhale: 4,
    hold: 4,
    exhale: 4,
    cycles: 4
  }

  // 正念冥想引导
  const MINDFULNESS_GUIDE = {
    name: '正念冥想',
    duration: 120, // 秒
    steps: [
      { text: '找一个舒适的姿势坐下', time: 10 },
      { text: '闭上眼睛，慢慢呼吸', time: 15 },
      { text: '关注当下的身体感受', time: 20 },
      { text: '如果思绪飘走，温柔地把它带回来', time: 25 },
      { text: '感受周围的声响', time: 20 },
      { text: '慢慢睁开眼睛，回到当下', time: 10 }
    ]
  }

  // ==================== 状态 ====================

  // 情绪记录列表
  const moodRecords = ref([])

  // 统计数据
  const statistics = ref({
    totalRecords: 0,
    moodDistribution: {},
    weeklyData: [],
    monthlyData: [],
    averageIntensity: 0,
    dominantMood: null
  })

  // 当前选中的日期
  const selectedDate = ref(new Date().toISOString().split('T')[0])

  // 是否正在加载
  const isLoading = ref(false)

  // 错误信息
  const errorMessage = ref('')

  // 今日记录
  const todayRecord = ref(null)

  // 冥想/呼吸练习状态
  const exerciseState = ref({
    isActive: false,
    currentStep: 0,
    progress: 0,
    type: null // 'breathing' | 'mindfulness'
  })

  // ==================== 计算属性 ====================

  const babyStore = useBabyStore()
  const currentBabyId = computed(() => babyStore.currentBabyId)

  const hasRecords = computed(() => moodRecords.value.length > 0)

  // 获取今日记录
  const todayMood = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return moodRecords.value.find(r => r.date === today) || null
  })

  // 获取本周数据
  const weeklyMoods = computed(() => {
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(today.getDate() - 7)
    return moodRecords.value.filter(r => {
      const recordDate = new Date(r.date)
      return recordDate >= weekAgo && recordDate <= today
    })
  })

  // 获取本月数据
  const monthlyMoods = computed(() => {
    const today = new Date()
    const monthAgo = new Date(today)
    monthAgo.setDate(today.getDate() - 30)
    return moodRecords.value.filter(r => {
      const recordDate = new Date(r.date)
      return recordDate >= monthAgo && recordDate <= today
    })
  })

  // ==================== 持久化 ====================

  const STORAGE_KEY = 'mood_journal_records'

  const loadFromStorage = () => {
    try {
      const data = uni.getStorageSync(STORAGE_KEY)
      if (data) {
        moodRecords.value = JSON.parse(data)
      }
    } catch (e) {
      console.error('加载情绪记录失败:', e)
    }
  }

  const saveToStorage = () => {
    try {
      uni.setStorageSync(STORAGE_KEY, JSON.stringify(moodRecords.value))
    } catch (e) {
      console.error('保存情绪记录失败:', e)
    }
  }

  // ==================== 方法 ====================

  /**
   * 初始化
   */
  const init = () => {
    loadFromStorage()
    updateTodayRecord()
    calculateStatistics()
  }

  /**
   * 更新今日记录
   */
  const updateTodayRecord = () => {
    const today = new Date().toISOString().split('T')[0]
    todayRecord.value = moodRecords.value.find(r => r.date === today) || null
  }

  /**
   * 添加情绪记录
   */
  const addMoodRecord = (recordData) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const today = new Date().toISOString().split('T')[0]
      const existingIndex = moodRecords.value.findIndex(r => r.date === today)

      const newRecord = {
        id: 'mood_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        babyId: currentBabyId.value,
        date: today,
        mood: recordData.mood,
        intensity: recordData.intensity || 3,
        trigger: recordData.trigger || null,
        note: recordData.note || '',
        createdAt: new Date().toISOString()
      }

      if (existingIndex >= 0) {
        // 更新今日记录
        newRecord.id = moodRecords.value[existingIndex].id
        newRecord.createdAt = moodRecords.value[existingIndex].createdAt
        moodRecords.value[existingIndex] = newRecord
      } else {
        // 添加新记录
        moodRecords.value.unshift(newRecord)
      }

      saveToStorage()
      updateTodayRecord()
      calculateStatistics()

      return newRecord
    } catch (e) {
      errorMessage.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 删除情绪记录
   */
  const deleteMoodRecord = (recordId) => {
    const index = moodRecords.value.findIndex(r => r.id === recordId)
    if (index >= 0) {
      moodRecords.value.splice(index, 1)
      saveToStorage()
      updateTodayRecord()
      calculateStatistics()
    }
  }

  /**
   * 计算统计数据
   */
  const calculateStatistics = () => {
    if (moodRecords.value.length === 0) {
      statistics.value = {
        totalRecords: 0,
        moodDistribution: {},
        weeklyData: [],
        monthlyData: [],
        averageIntensity: 0,
        dominantMood: null
      }
      return
    }

    // 情绪分布
    const distribution = {}
    let totalIntensity = 0
    let maxCount = 0
    let dominant = null

    for (const record of moodRecords.value) {
      if (!distribution[record.mood]) {
        distribution[record.mood] = { count: 0, totalIntensity: 0 }
      }
      distribution[record.mood].count++
      distribution[record.mood].totalIntensity += record.intensity || 3
      totalIntensity += record.intensity || 3

      if (distribution[record.mood].count > maxCount) {
        maxCount = distribution[record.mood].count
        dominant = record.mood
      }
    }

    // 计算每周数据
    const weeklyData = calculateWeeklyData()

    // 计算每月数据
    const monthlyData = calculateMonthlyData()

    statistics.value = {
      totalRecords: moodRecords.value.length,
      moodDistribution: distribution,
      weeklyData,
      monthlyData,
      averageIntensity: Math.round(totalIntensity / moodRecords.value.length * 10) / 10,
      dominantMood: dominant
    }
  }

  /**
   * 计算每周数据
   */
  const calculateWeeklyData = () => {
    const today = new Date()
    const data = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayNames = ['日', '一', '二', '三', '四', '五', '六']

      const record = moodRecords.value.find(r => r.date === dateStr)
      data.push({
        date: dateStr,
        day: dayNames[date.getDay()],
        mood: record ? record.mood : null,
        intensity: record ? record.intensity : 0
      })
    }

    return data
  }

  /**
   * 计算每月数据
   */
  const calculateMonthlyData = () => {
    const today = new Date()
    const data = []

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const record = moodRecords.value.find(r => r.date === dateStr)
      data.push({
        date: dateStr,
        day: date.getDate(),
        mood: record ? record.mood : null,
        intensity: record ? record.intensity : 0
      })
    }

    return data
  }

  /**
   * 设置选中的日期
   */
  const setSelectedDate = (dateStr) => {
    selectedDate.value = dateStr
  }

  /**
   * 获取指定日期的记录
   */
  const getRecordByDate = (dateStr) => {
    return moodRecords.value.find(r => r.date === dateStr) || null
  }

  /**
   * 获取情绪颜色
   */
  const getMoodColor = (moodType) => {
    return MOOD_COLORS[moodType] || '#999999'
  }

  /**
   * 获取情绪emoji
   */
  const getMoodEmoji = (moodType) => {
    return MOOD_EMOJIS[moodType] || '❓'
  }

  /**
   * 获取情绪名称
   */
  const getMoodName = (moodType) => {
    return MOOD_NAMES[moodType] || '未知'
  }

  /**
   * 获取调节建议
   */
  const getRegulationTips = (moodType) => {
    return REGULATION_TIPS[moodType] || ['保持积极心态']
  }

  /**
   * 获取深呼吸练习
   */
  const getBreathingExercise = () => {
    return BREATHING_EXERCISE
  }

  /**
   * 获取正念冥想引导
   */
  const getMindfulnessGuide = () => {
    return MINDFULNESS_GUIDE
  }

  /**
   * 开始呼吸练习
   */
  const startBreathingExercise = () => {
    exerciseState.value = {
      isActive: true,
      currentStep: 0,
      progress: 0,
      type: 'breathing'
    }
  }

  /**
   * 开始冥想练习
   */
  const startMindfulnessExercise = () => {
    exerciseState.value = {
      isActive: true,
      currentStep: 0,
      progress: 0,
      type: 'mindfulness'
    }
  }

  /**
   * 停止练习
   */
  const stopExercise = () => {
    exerciseState.value = {
      isActive: false,
      currentStep: 0,
      progress: 0,
      type: null
    }
  }

  /**
   * 更新练习进度
   */
  const updateExerciseProgress = (step, progress) => {
    exerciseState.value.currentStep = step
    exerciseState.value.progress = progress
  }

  /**
   * 切换宝宝时重新加载
   */
  const onBabyChange = () => {
    // 按宝宝筛选记录
    calculateStatistics()
  }

  // ==================== 暴露 ====================

  return {
    // 常量
    MOOD_TYPES,
    MOOD_EMOJIS,
    MOOD_COLORS,
    MOOD_NAMES,
    TRIGGER_OPTIONS,
    REGULATION_TIPS,
    BREATHING_EXERCISE,
    MINDFULNESS_GUIDE,

    // 状态
    moodRecords,
    statistics,
    selectedDate,
    isLoading,
    errorMessage,
    todayRecord,
    exerciseState,

    // 计算属性
    currentBabyId,
    hasRecords,
    todayMood,
    weeklyMoods,
    monthlyMoods,

    // 方法
    init,
    addMoodRecord,
    deleteMoodRecord,
    calculateStatistics,
    setSelectedDate,
    getRecordByDate,
    getMoodColor,
    getMoodEmoji,
    getMoodName,
    getRegulationTips,
    getBreathingExercise,
    getMindfulnessGuide,
    startBreathingExercise,
    startMindfulnessExercise,
    stopExercise,
    updateExerciseProgress,
    onBabyChange
  }
})
