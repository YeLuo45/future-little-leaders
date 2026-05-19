/**
 * V70 Language Learning Service
 * 多语言学习系统 - 课程、词汇、口语练习
 */

const STORAGE_KEY = 'language_learning_data'

// 支持的语言
export const SUPPORTED_LANGUAGES = {
  english: { id: 'english', name: '英语', flag: '🇬🇧', nativeName: 'English' },
  japanese: { id: 'japanese', name: '日语', flag: '🇯🇵', nativeName: '日本語' },
  korean: { id: 'korean', name: '韩语', flag: '🇰🇷', nativeName: '한국어' },
  french: { id: 'french', name: '法语', flag: '🇫🇷', nativeName: 'Français' },
  spanish: { id: 'spanish', name: '西班牙语', flag: '🇪🇸', nativeName: 'Español' }
}

// 课程章节
const COURSE_CHAPTERS = {
  english: [
    { id: 'en_alphabet', title: '字母学习', lessons: ['字母 A-Z', '字母发音', '大小写对照'] },
    { id: 'en_greetings', title: '日常问候', lessons: ['Hello & Hi', 'Good morning', 'Good afternoon', 'Good evening'] },
    { id: 'en_numbers', title: '数字学习', lessons: ['1-10', '11-20', '21-100', '序数词'] },
    { id: 'en_colors', title: '颜色词汇', lessons: ['基本颜色', '颜色表达', '颜色配对'] },
    { id: 'en_family', title: '家庭成员', lessons: ['Family members', '介绍家人', '家庭对话'] }
  ],
  japanese: [
    { id: 'jp_hiragana', title: '平假名', lessons: ['あ行', 'か行', 'さ行', 'た行', 'な行'] },
    { id: 'jp_katakana', title: '片假名', lessons: ['ア行', 'カ行', 'サ行', 'タ行', 'ナ行'] },
    { id: 'jp_greetings', title: '日常问候', lessons: ['こんにちは', 'おはよう', 'こんばんは', 'さようなら'] },
    { id: 'jp_numbers', title: '数字学习', lessons: ['1-10', '11-20', '百千万'] },
    { id: 'jp_basic', title: '基础词汇', lessons: ['水', '食物', '动物', '方位'] }
  ],
  korean: [
    { id: 'kr_hangul', title: '韩文字母', lessons: ['子音', '母音', '收音', '字母歌'] },
    { id: 'kr_greetings', title: '日常问候', lessons: ['안녕하세요', '감사합니다', '再见', '对不起'] },
    { id: 'kr_numbers', title: '数字学习', lessons: ['固有词 1-10', '汉字词', '时间表达'] },
    { id: 'kr_basic', title: '基础词汇', lessons: ['食物', '动物', '家庭', '颜色'] }
  ],
  french: [
    { id: 'fr_alphabet', title: '法语字母', lessons: ['字母发音', '特殊字母', '字母组合'] },
    { id: 'fr_greetings', title: '日常问候', lessons: ['Bonjour', 'Bonsoir', 'Au revoir', 'Merci'] },
    { id: 'fr_numbers', title: '数字学习', lessons: ['1-20', '21-100', '百千百万'] },
    { id: 'fr_basic', title: '基础词汇', lessons: ['颜色', '食物', '动物', '衣服'] }
  ],
  spanish: [
    { id: 'es_alphabet', title: '西班牙语字母', lessons: ['字母发音', '特殊字符', '发音规则'] },
    { id: 'es_greetings', title: '日常问候', lessons: ['Hola', 'Buenos días', 'Buenas noches', 'Adiós'] },
    { id: 'es_numbers', title: '数字学习', lessons: ['1-20', '21-100', '百千百万'] },
    { id: 'es_basic', title: '基础词汇', lessons: ['颜色', '食物', '动物', '家庭'] }
  ]
}

// 词汇数据
const VOCABULARY_DATA = {
  english: [
    { word: 'hello', translation: '你好', pronunciation: 'həˈloʊ', category: 'greetings' },
    { word: 'goodbye', translation: '再见', pronunciation: 'ɡʊdˈbaɪ', category: 'greetings' },
    { word: 'thank you', translation: '谢谢', pronunciation: 'θæŋk juː', category: 'greetings' },
    { word: 'please', translation: '请', pronunciation: 'pliːz', category: 'greetings' },
    { word: 'sorry', translation: '对不起', pronunciation: 'ˈsɒri', category: 'greetings' },
    { word: 'one', translation: '一', pronunciation: 'wʌn', category: 'numbers' },
    { word: 'two', translation: '二', pronunciation: 'tuː', category: 'numbers' },
    { word: 'three', translation: '三', pronunciation: 'θriː', category: 'numbers' },
    { word: 'red', translation: '红色', pronunciation: 'rɛd', category: 'colors' },
    { word: 'blue', translation: '蓝色', pronunciation: 'bluː', category: 'colors' },
    { word: 'mother', translation: '妈妈', pronunciation: 'ˈmʌðər', category: 'family' },
    { word: 'father', translation: '爸爸', pronunciation: 'ˈfɑːðər', category: 'family' }
  ],
  japanese: [
    { word: 'こんにちは', translation: '你好', pronunciation: 'konnichiwa', category: 'greetings' },
    { word: 'さようなら', translation: '再见', pronunciation: 'sayounara', category: 'greetings' },
    { word: 'ありがとう', translation: '谢谢', pronunciation: 'arigatou', category: 'greetings' },
    { word: 'ごめんなさい', translation: '对不起', pronunciation: 'gomennasai', category: 'greetings' },
    { word: '一つ', translation: '一', pronunciation: 'hitotsu', category: 'numbers' },
    { word: '二つ', translation: '二', pronunciation: 'futatsu', category: 'numbers' },
    { word: '三つ', translation: '三', pronunciation: 'mittsu', category: 'numbers' },
    { word: '赤い', translation: '红色', pronunciation: 'akai', category: 'colors' },
    { word: '青い', translation: '蓝色', pronunciation: 'aoi', category: 'colors' },
    { word: '母さん', translation: '妈妈', pronunciation: 'kaasan', category: 'family' },
    { word: '父さん', translation: '爸爸', pronunciation: 'toosan', category: 'family' }
  ],
  korean: [
    { word: '안녕하세요', translation: '你好', pronunciation: 'annyeonghaseyo', category: 'greetings' },
    { word: '안녕히 가세요', translation: '再见', pronunciation: 'annyeonghi gaseyo', category: 'greetings' },
    { word: '감사합니다', translation: '谢谢', pronunciation: 'gamsahamnida', category: 'greetings' },
    { word: '对不起', translation: '对不起', pronunciation: 'mianhae', category: 'greetings' },
    { word: '하나', translation: '一', pronunciation: 'hana', category: 'numbers' },
    { word: '둘', translation: '二', pronunciation: 'dul', category: 'numbers' },
    { word: '셋', translation: '三', pronunciation: 'set', category: 'numbers' },
    { word: '어머니', translation: '妈妈', pronunciation: 'eomeoni', category: 'family' },
    { word: '아버지', translation: '爸爸', pronunciation: 'abeoji', category: 'family' }
  ],
  french: [
    { word: 'bonjour', translation: '你好', pronunciation: 'bɔ̃ʒuʀ', category: 'greetings' },
    { word: 'au revoir', translation: '再见', pronunciation: 'o ʀəvwaʀ', category: 'greetings' },
    { word: 'merci', translation: '谢谢', pronunciation: 'mɛʀsi', category: 'greetings' },
    { word: 'pardon', translation: '对不起', pronunciation: 'paʀdɔ̃', category: 'greetings' },
    { word: 'un', translation: '一', pronunciation: 'œ̃', category: 'numbers' },
    { word: 'deux', translation: '二', pronunciation: 'dø', category: 'numbers' },
    { word: 'trois', translation: '三', pronunciation: 'tʀwa', category: 'numbers' },
    { word: 'mère', translation: '妈妈', pronunciation: 'mɛʀ', category: 'family' },
    { word: 'père', translation: '爸爸', pronunciation: 'pɛʀ', category: 'family' }
  ],
  spanish: [
    { word: 'hola', translation: '你好', pronunciation: 'ola', category: 'greetings' },
    { word: 'adiós', translation: '再见', pronunciation: 'adioh', category: 'greetings' },
    { word: 'gracias', translation: '谢谢', pronunciation: 'gɾaθiah', category: 'greetings' },
    { word: 'lo siento', translation: '对不起', pronunciation: 'loh sientoh', category: 'greetings' },
    { word: 'uno', translation: '一', pronunciation: 'uno', category: 'numbers' },
    { word: 'dos', translation: '二', pronunciation: 'doh', category: 'numbers' },
    { word: 'tres', translation: '三', pronunciation: 'tɾeh', category: 'numbers' },
    { word: 'madre', translation: '妈妈', pronunciation: 'maðɾe', category: 'family' },
    { word: 'padre', translation: '爸爸', pronunciation: 'paðɾe', category: 'family' }
  ]
}

// 口语对话
const SPEAKING_DIALOGUES = {
  english: [
    {
      id: 'en_greet_1',
      title: '打招呼',
      scenario: '遇到朋友时',
      dialogues: [
        { speaker: 'A', text: 'Hello! How are you?', translation: '你好！你好吗？' },
        { speaker: 'B', text: "I'm fine, thank you. And you?", translation: '我很好，谢谢。你呢？' },
        { speaker: 'A', text: "I'm good too!", translation: '我也很好！' }
      ]
    },
    {
      id: 'en_shop_1',
      title: '购物',
      scenario: '在商店里',
      dialogues: [
        { speaker: 'A', text: 'How much is this?', translation: '这个多少钱？' },
        { speaker: 'B', text: "It's five dollars.", translation: '五美元。' },
        { speaker: 'A', text: "I'll take it!", translation: '我买了！' }
      ]
    }
  ],
  japanese: [
    {
      id: 'jp_greet_1',
      title: '打招呼',
      scenario: '遇到朋友时',
      dialogues: [
        { speaker: 'A', text: 'こんにちは！', translation: '你好！' },
        { speaker: 'B', text: 'こんにちは！お元気ですか？', translation: '你好！你身体好吗？' },
        { speaker: 'A', text: '元気です。あなたは？', translation: '我很好。你呢？' }
      ]
    }
  ],
  korean: [
    {
      id: 'kr_greet_1',
      title: '打招呼',
      scenario: '遇到朋友时',
      dialogues: [
        { speaker: 'A', text: '안녕하세요!', translation: '你好！' },
        { speaker: 'B', text: '안녕하세요!近来如何?', translation: '你好！近来如何？' },
        { speaker: 'A', text: '잘 지내요!', translation: '我过得好！' }
      ]
    }
  ],
  french: [
    {
      id: 'fr_greet_1',
      title: '打招呼',
      scenario: '遇到朋友时',
      dialogues: [
        { speaker: 'A', text: 'Bonjour! Comment allez-vous?', translation: '你好！你好吗？' },
        { speaker: 'B', text: 'Je vais bien, merci. Et vous?', translation: '我很好，谢谢。你呢？' },
        { speaker: 'A', text: 'Très bien aussi!', translation: '我也很好！' }
      ]
    }
  ],
  spanish: [
    {
      id: 'es_greet_1',
      title: '打招呼',
      scenario: '遇到朋友时',
      dialogues: [
        { speaker: 'A', text: '¡Hola! ¿Cómo estás?', translation: '你好！你好吗？' },
        { speaker: 'B', text: 'Muy bien, gracias. ¿Y tú?', translation: '我很好，谢谢。你呢？' },
        { speaker: 'A', text: '¡Muy bien también!', translation: '我也很好！' }
      ]
    }
  ]
}

// 默认数据结构
const getDefaultData = () => ({
  // 用户学习的语言
  activeLanguages: ['english'],
  
  // 每种语言的学习进度
  languageProgress: {
    english: { chapter: 0, lesson: 0, completedLessons: [], points: 0 },
    japanese: { chapter: 0, lesson: 0, completedLessons: [], points: 0 },
    korean: { chapter: 0, lesson: 0, completedLessons: [], points: 0 },
    french: { chapter: 0, lesson: 0, completedLessons: [], points: 0 },
    spanish: { chapter: 0, lesson: 0, completedLessons: [], points: 0 }
  },
  
  // 词汇学习记录
  vocabularyProgress: {},
  
  // 口语练习记录
  speakingProgress: {},
  
  // 总积分
  totalPoints: 0,
  
  // 连续学习天数
  streakDays: 0,
  lastStudyDate: null
})

// 获取本地数据
const getLocalData = () => {
  try {
    const data = uni.getStorageSync(STORAGE_KEY)
    if (data) {
      return { ...getDefaultData(), ...JSON.parse(data) }
    }
  } catch (e) {
    console.error('Failed to load language learning data:', e)
  }
  return getDefaultData()
}

// 保存数据到本地
const saveData = (data) => {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('Failed to save language learning data:', e)
    return false
  }
}

export default {
  // ==================== 语言基础数据 ====================
  
  // 获取支持的语言列表
  getSupportedLanguages() {
    return Object.values(SUPPORTED_LANGUAGES)
  },
  
  // 获取语言信息
  getLanguageInfo(langId) {
    return SUPPORTED_LANGUAGES[langId] || null
  },
  
  // ==================== 课程相关 ====================
  
  // 获取课程章节
  getCourseChapters(langId) {
    return COURSE_CHAPTERS[langId] || []
  },
  
  // 获取课程内容
  getCourseLessons(langId, chapterId) {
    const chapters = COURSE_CHAPTERS[langId] || []
    const chapter = chapters.find(c => c.id === chapterId)
    return chapter ? chapter.lessons : []
  },
  
  // 完成课程学习
  completeLesson(langId, chapterId, lessonIndex) {
    const data = getLocalData()
    const lessonId = `${langId}_${chapterId}_${lessonIndex}`
    
    if (!data.languageProgress[langId]) {
      data.languageProgress[langId] = { chapter: 0, lesson: 0, completedLessons: [], points: 0 }
    }
    
    // 标记课程完成
    if (!data.languageProgress[langId].completedLessons.includes(lessonId)) {
      data.languageProgress[langId].completedLessons.push(lessonId)
      data.languageProgress[langId].points += 10
      data.totalPoints += 10
    }
    
    // 更新进度
    data.languageProgress[langId].chapter = COURSE_CHAPTERS[langId]?.findIndex(c => c.id === chapterId) || 0
    
    saveData(data)
    return { success: true, points: data.languageProgress[langId].points }
  },
  
  // ==================== 词汇相关 ====================
  
  // 获取词汇列表
  getVocabulary(langId) {
    return VOCABULARY_DATA[langId] || []
  },
  
  // 获取词汇分类
  getVocabularyCategories(langId) {
    const vocab = VOCABULARY_DATA[langId] || []
    const categories = [...new Set(vocab.map(v => v.category))]
    return categories
  },
  
  // 获取某分类的词汇
  getVocabularyByCategory(langId, category) {
    const vocab = VOCABULARY_DATA[langId] || []
    if (!category || category === 'all') return vocab
    return vocab.filter(v => v.category === category)
  },
  
  // 学习词汇（标记为已学习）
  learnVocabulary(langId, wordIndex) {
    const data = getLocalData()
    const key = `${langId}_vocab_${wordIndex}`
    
    if (!data.vocabularyProgress[key]) {
      data.vocabularyProgress[key] = { learned: true, reviewCount: 0, lastReview: null }
      data.totalPoints += 5
    }
    
    saveData(data)
    return { success: true, totalPoints: data.totalPoints }
  },
  
  // 获取词汇学习进度
  getVocabularyProgress(langId) {
    const data = getLocalData()
    const vocab = VOCABULARY_DATA[langId] || []
    const learned = vocab.filter((v, idx) => data.vocabularyProgress[`${langId}_vocab_${idx}`]).length
    return {
      total: vocab.length,
      learned,
      percentage: vocab.length > 0 ? Math.round((learned / vocab.length) * 100) : 0
    }
  },
  
  // ==================== 口语相关 ====================
  
  // 获取口语对话列表
  getSpeakingDialogues(langId) {
    return SPEAKING_DIALOGUES[langId] || []
  },
  
  // 完成口语练习
  completeSpeakingPractice(langId, dialogueId, score) {
    const data = getLocalData()
    const key = `${langId}_speaking_${dialogueId}`
    
    if (!data.speakingProgress[key]) {
      data.speakingProgress[key] = { completed: true, bestScore: score, attempts: 1 }
      data.totalPoints += 15
    } else {
      data.speakingProgress[key].attempts += 1
      if (score > data.speakingProgress[key].bestScore) {
        data.speakingProgress[key].bestScore = score
        data.totalPoints += 5 // 提高分数时给额外积分
      }
    }
    
    saveData(data)
    return { success: true, totalPoints: data.totalPoints }
  },
  
  // 获取口语练习进度
  getSpeakingProgress(langId) {
    const data = getLocalData()
    const dialogues = SPEAKING_DIALOGUES[langId] || []
    const completed = dialogues.filter(d => data.speakingProgress[`${langId}_speaking_${d.id}`]).length
    return {
      total: dialogues.length,
      completed,
      percentage: dialogues.length > 0 ? Math.round((completed / dialogues.length) * 100) : 0
    }
  },
  
  // ==================== 用户数据 ====================
  
  // 获取所有学习数据
  getAllData() {
    return getLocalData()
  },
  
  // 获取用户统计
  getUserStats() {
    const data = getLocalData()
    const langStats = {}
    
    Object.keys(SUPPORTED_LANGUAGES).forEach(langId => {
      const vocabProgress = this.getVocabularyProgress(langId)
      const speakingProgress = this.getSpeakingProgress(langId)
      langStats[langId] = {
        ...data.languageProgress[langId],
        vocabularyProgress: vocabProgress,
        speakingProgress: speakingProgress
      }
    })
    
    return {
      totalPoints: data.totalPoints,
      streakDays: data.streakDays,
      activeLanguages: data.activeLanguages,
      languageStats: langStats
    }
  },
  
  // 添加学习语言
  addActiveLanguage(langId) {
    const data = getLocalData()
    if (!data.activeLanguages.includes(langId)) {
      data.activeLanguages.push(langId)
      saveData(data)
    }
    return data.activeLanguages
  },
  
  // 更新连续学习天数
  updateStreak() {
    const data = getLocalData()
    const today = new Date().toDateString()
    const lastDate = data.lastStudyDate ? new Date(data.lastStudyDate).toDateString() : null
    
    if (lastDate === today) {
      return data.streakDays
    }
    
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (lastDate === yesterday.toDateString()) {
      data.streakDays += 1
    } else if (lastDate !== today) {
      data.streakDays = 1
    }
    
    data.lastStudyDate = new Date().toISOString()
    saveData(data)
    return data.streakDays
  },
  
  // 重置数据
  resetData() {
    try {
      uni.removeStorageSync(STORAGE_KEY)
      return true
    } catch (e) {
      console.error('Failed to reset language learning data:', e)
      return false
    }
  }
}
