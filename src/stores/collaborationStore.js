// src/stores/collaborationStore.js
// V21 家校协作 Store — 班级动态、聊天、智能提醒

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore'

// ============================================================================
// Types & Constants
// ============================================================================

// 班级动态类型
export const FEED_TYPES = {
  HOMEWORK: 'homework',       // 作业
  NOTICE: 'notice',           // 通知
  PRAISE: 'praise',          // 表扬
  ACTIVITY: 'activity'        // 活动
}

export const FEED_TYPE_INFO = {
  [FEED_TYPES.HOMEWORK]: { label: '作业', icon: '📝', color: '#4A90D9' },
  [FEED_TYPES.NOTICE]: { label: '通知', icon: '📢', color: '#FA8C16' },
  [FEED_TYPES.PRAISE]: { label: '表扬', icon: '🌟', color: '#52C41A' },
  [FEED_TYPES.ACTIVITY]: { label: '活动', icon: '🎉', color: '#722ED1' }
}

// 提醒类型
export const REMINDER_TYPES = {
  TASK_INCOMPLETE: 'task_incomplete',   // 任务未完成提醒家长
  ESCALATION: 'escalation',              // 连续3天未完成升级提醒教师
  ACHIEVEMENT: 'achievement'              // 成就达成通知家长
}

// 提醒渠道
export const REMINDER_CHANNELS = {
  APP: 'app',
  SMS: 'sms',
  EMAIL: 'email'
}

// localStorage keys
const CLASS_FEED_KEY = 'class_feeds'
const CHAT_MESSAGES_KEY = 'chat_messages'
const REMINDER_CONFIG_KEY = 'reminder_config'

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_CLASSES = [
  { id: 'class_1', name: '小班（星星班）', teacherName: '王老师', teacherAvatar: '' },
  { id: 'class_2', name: '中班（月亮班）', teacherName: '李老师', teacherAvatar: '' }
]

const MOCK_TEACHERS = [
  { id: 'teacher_1', name: '王老师', classId: 'class_1', avatar: '' },
  { id: 'teacher_2', name: '李老师', classId: 'class_2', avatar: '' }
]

const MOCK_FEEDS = [
  {
    id: 'feed_1',
    classId: 'class_1',
    teacherId: 'teacher_1',
    teacherName: '王老师',
    type: FEED_TYPES.HOMEWORK,
    title: '今日数学作业',
    content: '请家长协助小朋友完成第15页练习题1-5题。',
    images: [],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    readBy: []
  },
  {
    id: 'feed_2',
    classId: 'class_1',
    teacherId: 'teacher_1',
    teacherName: '王老师',
    type: FEED_TYPES.NOTICE,
    title: '周末活动通知',
    content: '本周六上午9点将在幼儿园操场举办亲子运动会，请准时参加。',
    images: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    readBy: []
  },
  {
    id: 'feed_3',
    classId: 'class_1',
    teacherId: 'teacher_1',
    teacherName: '王老师',
    type: FEED_TYPES.PRAISE,
    title: '今日表扬',
    content: '表扬张小朋友课堂上积极回答问题，课后主动帮助同学。',
    images: [],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    readBy: []
  },
  {
    id: 'feed_4',
    classId: 'class_1',
    teacherId: 'teacher_1',
    teacherName: '王老师',
    type: FEED_TYPES.ACTIVITY,
    title: '下周活动预告',
    content: '下周我们将开展"春天来了"主题手工课，需要小朋友带彩色卡纸和剪刀。',
    images: [],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    readBy: []
  }
]

// ============================================================================
// Store Definition
// ============================================================================

export const useCollaborationStore = defineStore('collaboration', () => {
  const babyStore = useBabyStore()

  // ---------- State ----------
  const classFeeds = ref([])              // 班级动态列表
  const currentClassId = ref(null)       // 当前选中的班级ID
  const chatConversations = ref({})       // 聊天会话 { teacherId: [messages] }
  const activeTeacherId = ref(null)       // 当前聊天的教师ID
  const reminderConfig = ref({
    taskIncomplete: { app: true, sms: false, email: false },
    escalation: { app: true, sms: true, email: false },
    achievement: { app: true, sms: false, email: false }
  })
  const classes = ref(MOCK_CLASSES)
  const teachers = ref(MOCK_TEACHERS)

  // ---------- Computed ----------

  // 当前宝宝ID
  const currentBabyId = computed(() => babyStore.currentBabyId)

  // 当前班级的动态
  const currentClassFeeds = computed(() => {
    if (!currentClassId.value) return classFeeds.value
    return classFeeds.value.filter(f => f.classId === currentClassId.value)
  })

  // 未读动态数量
  const unreadFeedCount = computed(() => {
    if (!currentBabyId.value) return 0
    return currentClassFeeds.value.filter(f => !f.readBy.includes(currentBabyId.value)).length
  })

  // 当前聊天的消息
  const activeChatMessages = computed(() => {
    if (!activeTeacherId.value) return []
    return chatConversations.value[activeTeacherId.value] || []
  })

  // 未读聊天消息数
  const unreadChatCount = computed(() => {
    let total = 0
    Object.values(chatConversations.value).forEach(msgs => {
      total += msgs.filter(m => !m.read && m.role !== 'me').length
    })
    return total
  })

  // 当前宝宝未完成任务天数（mock）
  const incompleteTaskDays = ref(0)

  // ---------- Methods ----------

  // 初始化
  const init = () => {
    loadFeeds()
    loadChatMessages()
    loadReminderConfig()
  }

  // 加载班级动态
  const loadFeeds = () => {
    try {
      const stored = uni.getStorageSync(CLASS_FEED_KEY)
      if (stored) {
        classFeeds.value = JSON.parse(stored)
      } else {
        // 使用 mock 数据
        classFeeds.value = MOCK_FEEDS
        saveFeeds()
      }
    } catch (e) {
      console.error('[CollaborationStore] 加载动态失败:', e)
      classFeeds.value = MOCK_FEEDS
    }
  }

  // 保存动态
  const saveFeeds = () => {
    try {
      uni.setStorageSync(CLASS_FEED_KEY, JSON.stringify(classFeeds.value))
    } catch (e) {
      console.error('[CollaborationStore] 保存动态失败:', e)
    }
  }

  // 选择班级
  const selectClass = (classId) => {
    currentClassId.value = classId
  }

  // 标记动态已读
  const markFeedRead = (feedId) => {
    const babyId = currentBabyId.value
    if (!babyId) return

    const feed = classFeeds.value.find(f => f.id === feedId)
    if (feed && !feed.readBy.includes(babyId)) {
      feed.readBy.push(babyId)
      saveFeeds()
    }
  }

  // 标记所有动态已读
  const markAllFeedsRead = () => {
    const babyId = currentBabyId.value
    if (!babyId) return

    currentClassFeeds.value.forEach(feed => {
      if (!feed.readBy.includes(babyId)) {
        feed.readBy.push(babyId)
      }
    })
    saveFeeds()
  }

  // ---------- Chat Methods ----------

  // 加载聊天记录
  const loadChatMessages = () => {
    try {
      const stored = uni.getStorageSync(CHAT_MESSAGES_KEY)
      if (stored) {
        chatConversations.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('[CollaborationStore] 加载聊天记录失败:', e)
    }
  }

  // 保存聊天记录
  const saveChatMessages = () => {
    try {
      uni.setStorageSync(CHAT_MESSAGES_KEY, JSON.stringify(chatConversations.value))
    } catch (e) {
      console.error('[CollaborationStore] 保存聊天记录失败:', e)
    }
  }

  // 选择教师聊天
  const selectTeacher = (teacherId) => {
    activeTeacherId.value = teacherId
    if (!chatConversations.value[teacherId]) {
      chatConversations.value[teacherId] = []
    }
    // 标记对方消息为已读
    const msgs = chatConversations.value[teacherId]
    msgs.forEach(m => {
      if (m.role !== 'me') m.read = true
    })
    saveChatMessages()
  }

  // 发送消息
  const sendMessage = (content, type = 'text') => {
    if (!activeTeacherId.value || !content.trim()) return

    const msg = {
      id: 'msg_' + Date.now(),
      teacherId: activeTeacherId.value,
      role: 'me',
      type,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      read: true
    }

    if (!chatConversations.value[activeTeacherId.value]) {
      chatConversations.value[activeTeacherId.value] = []
    }
    chatConversations.value[activeTeacherId.value].push(msg)
    saveChatMessages()

    // Mock: 自动回复
    setTimeout(() => {
      mockTeacherReply(activeTeacherId.value)
    }, 1000)

    return msg
  }

  // Mock: 教师自动回复
  const mockTeacherReply = (teacherId) => {
    const teacher = teachers.value.find(t => t.id === teacherId)
    const replies = [
      '收到，我会关注一下。',
      '好的，有问题随时沟通。',
      '了解，孩子最近表现很不错！',
      '收到消息，我会尽快回复。'
    ]
    const reply = {
      id: 'msg_' + Date.now(),
      teacherId,
      role: 'teacher',
      type: 'text',
      content: replies[Math.floor(Math.random() * replies.length)],
      createdAt: new Date().toISOString(),
      read: activeTeacherId.value === teacherId
    }
    chatConversations.value[teacherId].push(reply)
    saveChatMessages()

    // 触发事件
    uni.$emit('collab:newMessage', reply)
  }

  // ---------- Reminder Config Methods ----------

  // 加载提醒配置
  const loadReminderConfig = () => {
    try {
      const stored = uni.getStorageSync(REMINDER_CONFIG_KEY)
      if (stored) {
        reminderConfig.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('[CollaborationStore] 加载提醒配置失败:', e)
    }
  }

  // 保存提醒配置
  const saveReminderConfig = () => {
    try {
      uni.setStorageSync(REMINDER_CONFIG_KEY, JSON.stringify(reminderConfig.value))
    } catch (e) {
      console.error('[CollaborationStore] 保存提醒配置失败:', e)
    }
  }

  // 更新提醒渠道
  const updateReminderChannel = (reminderType, channel, enabled) => {
    if (reminderConfig.value[reminderType]) {
      reminderConfig.value[reminderType][channel] = enabled
      saveReminderConfig()
    }
  }

  // 检查提醒渠道是否启用
  const isReminderChannelEnabled = (reminderType, channel) => {
    return reminderConfig.value[reminderType]?.[channel] ?? false
  }

  // ---------- Smart Reminder Logic ----------

  // 触发任务未完成提醒
  const triggerTaskIncompleteReminder = (babyId, babyName, taskTitle) => {
    const enabled = reminderConfig.value.taskIncomplete
    const notifications = []

    if (enabled.app) {
      notifications.push({
        id: 'reminder_' + Date.now() + '_app',
        type: REMINDER_TYPES.TASK_INCOMPLETE,
        channel: REMINDER_CHANNELS.APP,
        title: '任务未完成提醒',
        content: `「${babyName}」的任务「${taskTitle}」还未完成，请及时督促。`,
        babyId,
        createdAt: new Date().toISOString()
      })
    }

    return notifications
  }

  // 触发升级提醒（连续3天未完成）
  const triggerEscalationReminder = (babyId, babyName, taskTitle) => {
    const enabled = reminderConfig.value.escalation
    const notifications = []

    if (enabled.app) {
      notifications.push({
        id: 'reminder_' + Date.now() + '_app',
        type: REMINDER_TYPES.ESCALATION,
        channel: REMINDER_CHANNELS.APP,
        title: '任务连续未完成',
        content: `「${babyName}」的任务「${taskTitle}」已连续3天未完成，已通知教师关注。`,
        babyId,
        createdAt: new Date().toISOString()
      })
    }

    if (enabled.sms) {
      notifications.push({
        id: 'reminder_' + Date.now() + '_sms',
        type: REMINDER_TYPES.ESCALATION,
        channel: REMINDER_CHANNELS.SMS,
        title: 'SMS提醒',
        content: `【家校协作】${babyName}任务${taskTitle}连续3天未完成，请教师关注。`,
        babyId,
        createdAt: new Date().toISOString()
      })
    }

    return notifications
  }

  // 触发成就提醒
  const triggerAchievementReminder = (babyId, babyName, achievementName) => {
    const enabled = reminderConfig.value.achievement
    const notifications = []

    if (enabled.app) {
      notifications.push({
        id: 'reminder_' + Date.now() + '_app',
        type: REMINDER_TYPES.ACHIEVEMENT,
        channel: REMINDER_CHANNELS.APP,
        title: '🎉 成就达成',
        content: `恭喜！「${babyName}」达成了「${achievementName}」！`,
        babyId,
        createdAt: new Date().toISOString()
      })
    }

    return notifications
  }

  // ---------- Utility ----------

  // 获取班级教师列表
  const getTeachersByClass = (classId) => {
    return teachers.value.filter(t => t.classId === classId)
  }

  // 格式化时间显示
  const formatTime = (isoString) => {
    const date = new Date(isoString)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'

    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return {
    // State
    classFeeds,
    currentClassId,
    chatConversations,
    activeTeacherId,
    reminderConfig,
    classes,
    teachers,
    incompleteTaskDays,

    // Computed
    currentBabyId,
    currentClassFeeds,
    unreadFeedCount,
    activeChatMessages,
    unreadChatCount,

    // Methods
    init,
    selectClass,
    markFeedRead,
    markAllFeedsRead,
    selectTeacher,
    sendMessage,
    loadReminderConfig,
    updateReminderChannel,
    isReminderChannelEnabled,
    triggerTaskIncompleteReminder,
    triggerEscalationReminder,
    triggerAchievementReminder,
    getTeachersByClass,
    formatTime,

    // Constants
    FEED_TYPES,
    FEED_TYPE_INFO,
    REMINDER_TYPES,
    REMINDER_CHANNELS
  }
})
