/**
 * Writing Service
 * 负责故事创作、日记和诗歌的存储管理
 */

import { getCurrentMemberId } from './familyService'

// Storage keys
const STORIES_KEY = 'writing_stories'
const DIARIES_KEY = 'writing_diaries'
const POEMS_KEY = 'writing_poems'
const WRITING_PROMPTS_KEY = 'writing_prompts'

// ============ Story Management ============

// 获取故事列表
export const getStories = () => {
  try {
    const stored = uni.getStorageSync(STORIES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('[WritingService] 获取故事失败:', e)
    return []
  }
}

// 保存故事列表
export const saveStories = (stories) => {
  uni.setStorageSync(STORIES_KEY, JSON.stringify(stories))
}

// 创建故事
export const createStory = (storyData) => {
  const memberId = getCurrentMemberId()
  const story = {
    id: 'story_' + Date.now(),
    createdBy: memberId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: storyData.title || '未命名故事',
    content: storyData.content || '',
    characters: storyData.characters || [],      // 角色列表
    plot: storyData.plot || '',                    // 情节
    setting: storyData.setting || '',              // 场景/背景
    template: storyData.template || null,         // 使用的模板
    genre: storyData.genre || 'adventure',         // 类型：adventure, fantasy, sci-fi, daily
    wordCount: (storyData.content || '').length,
    isDraft: storyData.isDraft !== undefined ? storyData.isDraft : true,
    ...storyData
  }
  
  const stories = getStories()
  stories.unshift(story)
  saveStories(stories)
  
  return story
}

// 更新故事
export const updateStory = (storyId, updates) => {
  const stories = getStories()
  const index = stories.findIndex(s => s.id === storyId)
  
  if (index === -1) {
    throw new Error('故事不存在')
  }
  
  updates.updatedAt = new Date().toISOString()
  updates.wordCount = updates.content ? updates.content.length : stories[index].wordCount
  
  stories[index] = { ...stories[index], ...updates }
  saveStories(stories)
  
  return stories[index]
}

// 删除故事
export const deleteStory = (storyId) => {
  const stories = getStories()
  const filtered = stories.filter(s => s.id !== storyId)
  saveStories(filtered)
}

// 获取故事详情
export const getStoryById = (storyId) => {
  const stories = getStories()
  return stories.find(s => s.id === storyId) || null
}

// ============ Diary Management ============

// 获取日记列表
export const getDiaries = () => {
  try {
    const stored = uni.getStorageSync(DIARIES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('[WritingService] 获取日记失败:', e)
    return []
  }
}

// 保存日记列表
export const saveDiaries = (diaries) => {
  uni.setStorageSync(DIARIES_KEY, JSON.stringify(diaries))
}

// 创建日记
export const createDiary = (diaryData) => {
  const memberId = getCurrentMemberId()
  const diary = {
    id: 'diary_' + Date.now(),
    createdBy: memberId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    date: diaryData.date || new Date().toISOString().split('T')[0], // YYYY-MM-DD
    title: diaryData.title || '',
    content: diaryData.content || '',
    weather: diaryData.weather || 'sunny',   // sunny, cloudy, rainy, snowy, windy
    mood: diaryData.mood || 'happy',          // happy, excited, calm, worried, sad, angry
    tags: diaryData.tags || [],
    wordCount: (diaryData.content || '').length,
    isDraft: diaryData.isDraft !== undefined ? diaryData.isDraft : true,
    ...diaryData
  }
  
  const diaries = getDiaries()
  diaries.unshift(diary)
  saveDiaries(diaries)
  
  return diary
}

// 更新日记
export const updateDiary = (diaryId, updates) => {
  const diaries = getDiaries()
  const index = diaries.findIndex(d => d.id === diaryId)
  
  if (index === -1) {
    throw new Error('日记不存在')
  }
  
  updates.updatedAt = new Date().toISOString()
  updates.wordCount = updates.content ? updates.content.length : diaries[index].wordCount
  
  diaries[index] = { ...diaries[index], ...updates }
  saveDiaries(diaries)
  
  return diaries[index]
}

// 删除日记
export const deleteDiary = (diaryId) => {
  const diaries = getDiaries()
  const filtered = diaries.filter(d => d.id !== diaryId)
  saveDiaries(filtered)
}

// 获取日记详情
export const getDiaryById = (diaryId) => {
  const diaries = getDiaries()
  return diaries.find(d => d.id === diaryId) || null
}

// 获取指定日期的日记
export const getDiaryByDate = (date) => {
  const diaries = getDiaries()
  return diaries.find(d => d.date === date) || null
}

// ============ Poetry Management ============

// 获取诗歌列表
export const getPoems = () => {
  try {
    const stored = uni.getStorageSync(POEMS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('[WritingService] 获取诗歌失败:', e)
    return []
  }
}

// 保存诗歌列表
export const savePoems = (poems) => {
  uni.setStorageSync(POEMS_KEY, JSON.stringify(poems))
}

// 创建诗歌
export const createPoem = (poemData) => {
  const memberId = getCurrentMemberId()
  const poem = {
    id: 'poem_' + Date.now(),
    createdBy: memberId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: poemData.title || '无题',
    content: poemData.content || '',
    style: poemData.style || 'free',          // free, rhymed, limerick, haiku
    theme: poemData.theme || '',               // 主题
    template: poemData.template || null,      // 使用的模板
    mood: poemData.mood || 'calm',            // 写作时的心情
    wordCount: (poemData.content || '').length,
    lineCount: (poemData.content || '').split('\n').length,
    isDraft: poemData.isDraft !== undefined ? poemData.isDraft : true,
    ...poemData
  }
  
  const poems = getPoems()
  poems.unshift(poem)
  savePoems(poems)
  
  return poem
}

// 更新诗歌
export const updatePoem = (poemId, updates) => {
  const poems = getPoems()
  const index = poems.findIndex(p => p.id === poemId)
  
  if (index === -1) {
    throw new Error('诗歌不存在')
  }
  
  updates.updatedAt = new Date().toISOString()
  updates.wordCount = updates.content ? updates.content.length : poems[index].wordCount
  updates.lineCount = updates.content ? updates.content.split('\n').length : poems[index].lineCount
  
  poems[index] = { ...poems[index], ...updates }
  savePoems(poems)
  
  return poems[index]
}

// 删除诗歌
export const deletePoem = (poemId) => {
  const poems = getPoems()
  const filtered = poems.filter(p => p.id !== poemId)
  savePoems(filtered)
}

// 获取诗歌详情
export const getPoemById = (poemId) => {
  const poems = getPoems()
  return poems.find(p => p.id === poemId) || null
}

// ============ Writing Prompts ============

// 获取写作提示列表
export const getWritingPrompts = () => {
  try {
    const stored = uni.getStorageSync(WRITING_PROMPTS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    // 默认提示
    return DEFAULT_WRITING_PROMPTS
  } catch (e) {
    console.error('[WritingService] 获取写作提示失败:', e)
    return DEFAULT_WRITING_PROMPTS
  }
}

// 保存写作提示（用户自定义）
export const saveWritingPrompts = (prompts) => {
  uni.setStorageSync(WRITING_PROMPTS_KEY, JSON.stringify(prompts))
}

// 获取随机写作提示
export const getRandomPrompt = (type = 'all') => {
  const prompts = getWritingPrompts()
  let filtered = prompts
  
  if (type !== 'all') {
    filtered = prompts.filter(p => p.type === type)
  }
  
  if (filtered.length === 0) return null
  
  const randomIndex = Math.floor(Math.random() * filtered.length)
  return filtered[randomIndex]
}

// 默认写作提示
const DEFAULT_WRITING_PROMPTS = [
  // 故事类
  {
    id: 'prompt_story_1',
    type: 'story',
    category: 'adventure',
    title: '神奇的冒险',
    content: '如果你能去任何一个地方冒险，你会去哪里？会发生什么故事？',
    emoji: '🚀'
  },
  {
    id: 'prompt_story_2',
    type: 'story',
    category: 'fantasy',
    title: '魔法世界',
    content: '你突然发现自己会魔法！你会做什么？',
    emoji: '✨'
  },
  {
    id: 'prompt_story_3',
    type: 'story',
    category: 'friendship',
    title: '最好的朋友',
    content: '描述你和你最好的朋友一起做过的最有趣的事情。',
    emoji: '👫'
  },
  {
    id: 'prompt_story_4',
    type: 'story',
    category: 'animal',
    title: '动物朋友',
    content: '如果你能和任何动物说话，你想和它说什么？',
    emoji: '🐾'
  },
  // 日记类
  {
    id: 'prompt_diary_1',
    type: 'diary',
    category: 'gratitude',
    title: '感恩日记',
    content: '今天你最感激的事情是什么？为什么？',
    emoji: '🙏'
  },
  {
    id: 'prompt_diary_2',
    type: 'diary',
    category: 'experience',
    title: '难忘的一天',
    content: '描述让你印象深刻的一天，发生了什么？你的感受如何？',
    emoji: '📅'
  },
  // 诗歌类
  {
    id: 'prompt_poetry_1',
    type: 'poetry',
    category: 'nature',
    title: '四季之歌',
    content: '用词语形容你最喜欢的季节，它是什么样的？',
    emoji: '🌸'
  },
  {
    id: 'prompt_poetry_2',
    type: 'poetry',
    category: 'emotion',
    title: '心情的颜色',
    content: '如果今天的心情是一种颜色，它是什么颜色？为什么？',
    emoji: '🎨'
  },
  {
    id: 'prompt_poetry_3',
    type: 'poetry',
    category: 'haiku',
    title: '俳句练习',
    content: '写一首简短的俳句（5-7-5音节），描述一个自然景象。',
    emoji: '🍃'
  }
]

// ============ Templates ============

// 故事模板
export const STORY_TEMPLATES = [
  {
    id: 'tpl_adventure',
    name: '冒险故事',
    description: '一个充满挑战和惊喜的冒险故事',
    structure: {
      beginning: '介绍主角和故事发生的地方',
      challenge: '主角遇到什么问题或挑战？',
      solution: '主角如何解决问题？',
      ending: '故事如何结束？主角学到了什么？'
    },
    emoji: '⚔️'
  },
  {
    id: 'tpl_fantasy',
    name: '奇幻故事',
    description: '充满想象力的魔法世界故事',
    structure: {
      beginning: '介绍魔法世界和神奇生物',
      discovery: '主角发现了什么神奇的事情？',
      adventure: '主角在魔法世界中经历了什么？',
      ending: '魔法世界的命运如何？'
    },
    emoji: '🔮'
  },
  {
    id: 'tpl_friendship',
    name: '友谊故事',
    description: '关于朋友之间的温馨故事',
    structure: {
      beginning: '介绍两个好朋友',
      event: '发生了一件什么事情？',
      feeling: '朋友们是如何互相帮助的？',
      ending: '他们的友谊发生了什么变化？'
    },
    emoji: '💝'
  }
]

// 日记模板
export const DIARY_TEMPLATES = [
  {
    id: 'tpl_simple',
    name: '简单日记',
    fields: ['今天做了什么？', '有什么开心的事？', '明天有什么计划？']
  },
  {
    id: 'tpl_gratitude',
    name: '感恩日记',
    fields: ['今天要感谢的人或事', '为什么感谢他们？', '我能为他们做什么？']
  },
  {
    id: 'tpl_learning',
    name: '学习日记',
    fields: ['今天学到了什么新知识？', '有没有遇到困难？', '明天想学什么？']
  }
]

// 诗歌模板
export const POETRY_TEMPLATES = [
  {
    id: 'tpl_haiku',
    name: '俳句',
    description: '日本传统诗歌形式，5-7-5音节',
    structure: '第一行5音节\n第二行7音节\n第三行5音节',
    lines: 3,
    emoji: '🌿'
  },
  {
    id: 'tpl_rhymed',
    name: '押韵诗',
    description: '尝试让句子末尾押韵',
    structure: '一二三句\n四五六句\n结尾要押韵',
    lines: 6,
    emoji: '🎵'
  },
  {
    id: 'tpl_acrostic',
    name: '藏头诗',
    description: '每行第一个字连起来是一句话',
    structure: '每行的第一个字组成隐藏的信息',
    lines: 5,
    emoji: '💌'
  }
]

// ============ Statistics ============

// 获取写作统计
export const getWritingStats = () => {
  const stories = getStories()
  const diaries = getDiaries()
  const poems = getPoems()
  
  return {
    totalStories: stories.length,
    totalDiaries: diaries.length,
    totalPoems: poems.length,
    totalWordCount: 
      stories.reduce((sum, s) => sum + (s.wordCount || 0), 0) +
      diaries.reduce((sum, d) => sum + (d.wordCount || 0), 0) +
      poems.reduce((sum, p) => sum + (p.wordCount || 0), 0),
    recentWorks: [
      ...stories.slice(0, 3).map(s => ({ type: 'story', ...s })),
      ...diaries.slice(0, 3).map(d => ({ type: 'diary', ...d })),
      ...poems.slice(0, 3).map(p => ({ type: 'poem', ...p }))
    ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5)
  }
}

// ============ Export ============

export default {
  // Story
  getStories,
  saveStories,
  createStory,
  updateStory,
  deleteStory,
  getStoryById,
  
  // Diary
  getDiaries,
  saveDiaries,
  createDiary,
  updateDiary,
  deleteDiary,
  getDiaryById,
  getDiaryByDate,
  
  // Poetry
  getPoems,
  savePoems,
  createPoem,
  updatePoem,
  deletePoem,
  getPoemById,
  
  // Prompts
  getWritingPrompts,
  saveWritingPrompts,
  getRandomPrompt,
  
  // Templates
  STORY_TEMPLATES,
  DIARY_TEMPLATES,
  POETRY_TEMPLATES,
  
  // Stats
  getWritingStats
}
