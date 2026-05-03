import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// localStorage key
const TASK_TEMPLATES_KEY = 'task_templates'

// 预设模板 (10个)
const DEFAULT_TEMPLATES = [
  { id: 't1', title: '早起打卡', description: '按时起床，开始新的一天', points: 5, recurringType: 'daily', tags: ['生活习惯'], icon: '🌅' },
  { id: 't2', title: '阅读30分钟', description: '每天阅读，积累知识', points: 10, recurringType: 'daily', tags: ['学习'], icon: '📚' },
  { id: 't3', title: '整理房间', description: '保持整洁，养成好习惯', points: 5, recurringType: 'daily', tags: ['生活习惯'], icon: '🧹' },
  { id: 't4', title: '运动30分钟', description: '强身健体，活力满满', points: 10, recurringType: 'daily', tags: ['运动'], icon: '🏃' },
  { id: 't5', title: '帮忙做家务', description: '分担家务，懂得责任', points: 8, recurringType: 'daily', tags: ['生活习惯'], icon: '🏠' },
  { id: 't6', title: '按时睡觉', description: '早睡早起，健康成长', points: 5, recurringType: 'daily', tags: ['生活习惯'], icon: '🌙' },
  { id: 't7', title: '练习写字', description: '一手好字，受益终生', points: 8, recurringType: 'daily', tags: ['学习'], icon: '✏️' },
  { id: 't8', title: '完成作业', description: '认真学习，完成任务', points: 10, recurringType: 'daily', tags: ['学习'], icon: '📝' },
  { id: 't9', title: '主动问好', description: '礼貌待人，暖心互动', points: 3, recurringType: 'daily', tags: ['社交'], icon: '👋' },
  { id: 't10', title: '睡前阅读', description: '温馨阅读时光', points: 8, recurringType: 'daily', tags: ['学习'], icon: '📖' }
]

export const useTaskTemplateStore = defineStore('taskTemplate', () => {
  // 自定义模板状态
  const customTemplates = ref([])

  // 所有模板（预设 + 自定义）
  const allTemplates = computed(() => [...DEFAULT_TEMPLATES, ...customTemplates.value])

  // 按标签分类
  const templatesByTag = computed(() => {
    const grouped = {}
    allTemplates.value.forEach(t => {
      t.tags.forEach(tag => {
        if (!grouped[tag]) grouped[tag] = []
        grouped[tag].push(t)
      })
    })
    return grouped
  })

  // 添加自定义模板
  const addCustomTemplate = (template) => {
    const newTemplate = {
      id: `ct_${Date.now()}`,
      ...template,
      createdAt: new Date().toISOString()
    }
    customTemplates.value.push(newTemplate)
    save()
    return newTemplate
  }

  // 删除自定义模板
  const deleteCustomTemplate = (templateId) => {
    customTemplates.value = customTemplates.value.filter(t => t.id !== templateId)
    save()
  }

  // 搜索模板
  const searchTemplates = (query) => {
    if (!query || query.trim() === '') {
      return allTemplates.value
    }
    const lowerQuery = query.toLowerCase()
    return allTemplates.value.filter(t =>
      t.title.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  // 保存到localStorage
  const save = () => {
    try {
      uni.setStorageSync(TASK_TEMPLATES_KEY, JSON.stringify(customTemplates.value))
    } catch (e) {
      console.error('保存模板失败:', e)
    }
  }

  // 初始化
  const init = () => {
    try {
      const stored = uni.getStorageSync(TASK_TEMPLATES_KEY)
      customTemplates.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('加载模板失败:', e)
      customTemplates.value = []
    }
  }

  return {
    // 常量
    DEFAULT_TEMPLATES,
    
    // 状态
    customTemplates,
    
    // 计算属性
    allTemplates,
    templatesByTag,
    
    // 方法
    addCustomTemplate,
    deleteCustomTemplate,
    searchTemplates,
    init
  }
})
