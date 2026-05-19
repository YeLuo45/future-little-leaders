/**
 * Writing Store
 * 创意写作状态管理 - Pinia Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import writingService from '../services/writingService'

export const useWritingStore = defineStore('writing', () => {
  // ============ 状态 ============
  
  // 故事相关
  const stories = ref([])
  const currentStory = ref(null)
  
  // 日记相关
  const diaries = ref([])
  const currentDiary = ref(null)
  
  // 诗歌相关
  const poems = ref([])
  const currentPoem = ref(null)
  
  // 写作提示
  const writingPrompts = ref([])
  const currentPrompt = ref(null)
  
  // 统计数据
  const writingStats = ref({
    totalStories: 0,
    totalDiaries: 0,
    totalPoems: 0,
    totalWordCount: 0,
    recentWorks: []
  })
  
  // ============ 计算属性 ============
  
  // 故事数量
  const storyCount = computed(() => stories.value.length)
  
  // 日记数量
  const diaryCount = computed(() => diaries.value.length)
  
  // 诗歌数量
  const poemCount = computed(() => poems.value.length)
  
  // 总字数
  const totalWordCount = computed(() => {
    return stories.value.reduce((sum, s) => sum + (s.wordCount || 0), 0) +
           diaries.value.reduce((sum, d) => sum + (d.wordCount || 0), 0) +
           poems.value.reduce((sum, p) => sum + (p.wordCount || 0), 0)
  })
  
  // 最近作品
  const recentWorks = computed(() => {
    const all = [
      ...stories.value.slice(0, 5).map(s => ({ type: 'story', ...s })),
      ...diaries.value.slice(0, 5).map(d => ({ type: 'diary', ...d })),
      ...poems.value.slice(0, 5).map(p => ({ type: 'poem', ...p }))
    ]
    return all.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 10)
  })
  
  // ============ 故事方法 ============
  
  const loadStories = () => {
    stories.value = writingService.getStories()
  }
  
  const setCurrentStory = (story) => {
    currentStory.value = story
  }
  
  const createStory = (storyData) => {
    const story = writingService.createStory(storyData)
    loadStories()
    return story
  }
  
  const updateStory = (storyId, updates) => {
    const story = writingService.updateStory(storyId, updates)
    loadStories()
    if (currentStory.value && currentStory.value.id === storyId) {
      currentStory.value = story
    }
    return story
  }
  
  const removeStory = (storyId) => {
    writingService.deleteStory(storyId)
    loadStories()
    if (currentStory.value && currentStory.value.id === storyId) {
      currentStory.value = null
    }
  }
  
  // ============ 日记方法 ============
  
  const loadDiaries = () => {
    diaries.value = writingService.getDiaries()
  }
  
  const setCurrentDiary = (diary) => {
    currentDiary.value = diary
  }
  
  const createDiary = (diaryData) => {
    const diary = writingService.createDiary(diaryData)
    loadDiaries()
    return diary
  }
  
  const updateDiary = (diaryId, updates) => {
    const diary = writingService.updateDiary(diaryId, updates)
    loadDiaries()
    if (currentDiary.value && currentDiary.value.id === diaryId) {
      currentDiary.value = diary
    }
    return diary
  }
  
  const removeDiary = (diaryId) => {
    writingService.deleteDiary(diaryId)
    loadDiaries()
    if (currentDiary.value && currentDiary.value.id === diaryId) {
      currentDiary.value = null
    }
  }
  
  const getDiaryByDate = (date) => {
    return writingService.getDiaryByDate(date)
  }
  
  // ============ 诗歌方法 ============
  
  const loadPoems = () => {
    poems.value = writingService.getPoems()
  }
  
  const setCurrentPoem = (poem) => {
    currentPoem.value = poem
  }
  
  const createPoem = (poemData) => {
    const poem = writingService.createPoem(poemData)
    loadPoems()
    return poem
  }
  
  const updatePoem = (poemId, updates) => {
    const poem = writingService.updatePoem(poemId, updates)
    loadPoems()
    if (currentPoem.value && currentPoem.value.id === poemId) {
      currentPoem.value = poem
    }
    return poem
  }
  
  const removePoem = (poemId) => {
    writingService.deletePoem(poemId)
    loadPoems()
    if (currentPoem.value && currentPoem.value.id === poemId) {
      currentPoem.value = null
    }
  }
  
  // ============ 写作提示方法 ============
  
  const loadWritingPrompts = () => {
    writingPrompts.value = writingService.getWritingPrompts()
  }
  
  const getRandomPrompt = (type = 'all') => {
    currentPrompt.value = writingService.getRandomPrompt(type)
    return currentPrompt.value
  }
  
  const getPromptsByType = (type) => {
    if (type === 'all') return writingPrompts.value
    return writingPrompts.value.filter(p => p.type === type)
  }
  
  // ============ 模板方法 ============
  
  const getStoryTemplates = () => {
    return writingService.STORY_TEMPLATES
  }
  
  const getDiaryTemplates = () => {
    return writingService.DIARY_TEMPLATES
  }
  
  const getPoetryTemplates = () => {
    return writingService.POETRY_TEMPLATES
  }
  
  // ============ 统计方法 ============
  
  const loadWritingStats = () => {
    writingStats.value = writingService.getWritingStats()
  }
  
  // ============ 初始化 ============
  
  const init = () => {
    loadStories()
    loadDiaries()
    loadPoems()
    loadWritingPrompts()
    loadWritingStats()
  }
  
  return {
    // 状态
    stories,
    currentStory,
    diaries,
    currentDiary,
    poems,
    currentPoem,
    writingPrompts,
    currentPrompt,
    writingStats,
    
    // 计算属性
    storyCount,
    diaryCount,
    poemCount,
    totalWordCount,
    recentWorks,
    
    // 故事方法
    loadStories,
    setCurrentStory,
    createStory,
    updateStory,
    removeStory,
    
    // 日记方法
    loadDiaries,
    setCurrentDiary,
    createDiary,
    updateDiary,
    removeDiary,
    getDiaryByDate,
    
    // 诗歌方法
    loadPoems,
    setCurrentPoem,
    createPoem,
    updatePoem,
    removePoem,
    
    // 写作提示方法
    loadWritingPrompts,
    getRandomPrompt,
    getPromptsByType,
    
    // 模板方法
    getStoryTemplates,
    getDiaryTemplates,
    getPoetryTemplates,
    
    // 统计方法
    loadWritingStats,
    
    // 生命周期
    init
  }
})
