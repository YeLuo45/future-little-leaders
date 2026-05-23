/**
 * V101 English Agent
 * 英语Agent - 单词记忆与口语对话、情景对话练习
 */

import { AGENT_TYPES, createResponse, DIFFICULTY_LEVELS } from './agentProtocol.js'

// ============================================================================
// EnglishAgent状态
// ============================================================================

const englishAgentState = {
  currentWord: null,
  currentDialogue: null,
  vocabularyList: [],
  masteredWords: [],
  wrongWords: [],
  dialogueHistory: [],
  difficultyLevel: 'INTERMEDIATE',
  sessionStartTime: null
}

// ============================================================================
// 单词数据
// ============================================================================

const VOCABULARY_DATA = {
  BEGINNER: [
    { word: 'hello', chinese: '你好', category: 'greeting' },
    { word: 'bye', chinese: '再见', category: 'greeting' },
    { word: 'thank you', chinese: '谢谢', category: 'greeting' },
    { word: 'sorry', chinese: '对不起', category: 'greeting' },
    { word: 'yes', chinese: '是的', category: 'greeting' },
    { word: 'no', chinese: '不', category: 'greeting' },
    { word: 'cat', chinese: '猫', category: 'animal' },
    { word: 'dog', chinese: '狗', category: 'animal' },
    { word: 'book', chinese: '书', category: 'object' },
    { word: 'water', chinese: '水', category: 'object' }
  ],
  INTERMEDIATE: [
    { word: 'beautiful', chinese: '美丽的', category: 'adjective' },
    { word: 'happy', chinese: '开心的', category: 'adjective' },
    { word: 'friend', chinese: '朋友', category: 'noun' },
    { word: 'family', chinese: '家人', category: 'noun' },
    { word: 'school', chinese: '学校', category: 'noun' },
    { word: 'teacher', chinese: '老师', category: 'noun' },
    { word: 'play', chinese: '玩', category: 'verb' },
    { word: 'learn', chinese: '学习', category: 'verb' },
    { word: 'eat', chinese: '吃', category: 'verb' },
    { word: 'drink', chinese: '喝', category: 'verb' }
  ],
  ADVANCED: [
    { word: 'adventure', chinese: '冒险', category: 'noun' },
    { word: 'imagination', chinese: '想象力', category: 'noun' },
    { word: 'knowledge', chinese: '知识', category: 'noun' },
    { word: 'delicious', chinese: '美味的', category: 'adjective' },
    { word: 'wonderful', chinese: '精彩的', category: 'adjective' },
    { word: 'understand', chinese: '理解', category: 'verb' },
    { word: 'remember', chinese: '记住', category: 'verb' },
    { word: 'practice', chinese: '练习', category: 'verb' }
  ],
  EXPERT: [
    { word: 'philosophy', chinese: '哲学', category: 'noun' },
    { word: 'psychology', chinese: '心理学', category: 'noun' },
    { word: 'environment', chinese: '环境', category: 'noun' },
    { word: 'accomplish', chinese: '完成', category: 'verb' },
    { word: 'communicate', chinese: '交流', category: 'verb' }
  ]
}

// ============================================================================
// 情景对话数据
// ============================================================================

const DIALOGUE_DATA = {
  greeting: {
    title: '打招呼',
    scenario: '你在学校遇到朋友',
    dialogue: [
      { speaker: 'friend', english: 'Hello! How are you?', chinese: '你好！你好吗？' },
      { speaker: 'me', english: 'I\'m fine, thank you. And you?', chinese: '我很好，谢谢。你呢？', options: ['I\'m great!', 'I\'m okay.', 'Not bad!'] },
      { speaker: 'friend', english: 'I\'m great too!', chinese: '我也很好！' }
    ]
  },
  shopping: {
    title: '购物',
    scenario: '在商店买水果',
    dialogue: [
      { speaker: 'shopkeeper', english: 'Can I help you?', chinese: '我可以帮你吗？' },
      { speaker: 'me', english: 'I want some apples, please.', chinese: '我想要一些苹果。', options: ['I want some apples.', 'Do you have apples?', 'Apples, please.'] },
      { speaker: 'shopkeeper', english: 'How many do you want?', chinese: '你想要多少？' },
      { speaker: 'me', english: 'Five apples, please.', chinese: '请给我五个苹果。', options: ['Five apples.', 'Some apples.', 'Five, please.'] },
      { speaker: 'shopkeeper', english: 'Here you are!', chinese: '给你！' }
    ]
  },
  classroom: {
    title: '教室',
    scenario: '在教室里和老师对话',
    dialogue: [
      { speaker: 'teacher', english: 'Who can answer this question?', chinese: '谁能回答这个问题？' },
      { speaker: 'me', english: 'I can try!', chinese: '我可以试试！', options: ['I can try!', 'Me, please!', 'Let me try.'] },
      { speaker: 'teacher', english: 'Very good! What is this?', chinese: '很好！这是什么？' },
      { speaker: 'me', english: 'This is a book.', chinese: '这是一本书。', options: ['This is a book.', 'It is book.', 'A book.'] }
    ]
  }
}

// ============================================================================
// 处理请求
// ============================================================================

export const handleRequest = async (request) => {
  const { action, data } = request.payload
  
  englishAgentState.sessionStartTime = englishAgentState.sessionStartTime || Date.now()
  
  switch (action) {
    case 'vocabulary':
      return generateVocabularyPractice(data)
    case 'speaking':
      return generateSpeakingPractice(data)
    case 'dialogue':
      return generateDialoguePractice(data)
    case 'general':
      return getGeneralEnglishResponse(data)
    case 'check_word':
      return checkWordAnswer(data)
    case 'check_dialogue':
      return checkDialogueAnswer(data)
    case 'review_words':
      return getWrongWordReview()
    default:
      return createResponse(request.id, false, null, { code: 'UNKNOWN_ACTION', message: '未知操作' })
  }
}

// ============================================================================
// 处理转介
// ============================================================================

export const handleTransfer = async (transferMsg) => {
  const { task, context } = transferMsg.payload
  
  if (context) {
    englishAgentState.difficultyLevel = context.difficultyLevel || 'INTERMEDIATE'
  }
  
  return handleRequest({
    id: transferMsg.id,
    payload: {
      action: task.action,
      data: { ...task.data, context }
    }
  })
}

// ============================================================================
// 生成单词练习
// ============================================================================

const generateVocabularyPractice = (data = {}) => {
  const levelWords = VOCABULARY_DATA[englishAgentState.difficultyLevel] || VOCABULARY_DATA.INTERMEDIATE
  const wordData = levelWords[Math.floor(Math.random() * levelWords.length)]
  
  englishAgentState.currentWord = wordData
  
  return createResponse('vocab_' + Date.now(), true, {
    type: 'vocabulary',
    chinese: wordData.chinese,
    category: wordData.category,
    hint: `这个单词的意思是什么？提示：类别是${wordData.category}`,
    encouragement: getEncouragement('vocabulary')
  })
}

// ============================================================================
// 生成口语练习
// ============================================================================

const generateSpeakingPractice = (data = {}) => {
  const levelWords = VOCABULARY_DATA[englishAgentState.difficultyLevel] || VOCABULARY_DATA.INTERMEDIATE
  const wordData = levelWords[Math.floor(Math.random() * levelWords.length)]
  
  englishAgentState.currentWord = wordData
  
  return createResponse('speak_' + Date.now(), true, {
    type: 'speaking',
    prompt: `请用英语说: "${wordData.chinese}"`,
    expectedWord: wordData.word,
    chinese: wordData.chinese,
    hint: '试着用英语说出来～',
    encouragement: getEncouragement('speaking')
  })
}

// ============================================================================
// 生成情景对话练习
// ============================================================================

const generateDialoguePractice = (data = {}) => {
  const scenarios = Object.keys(DIALOGUE_DATA)
  const scenarioKey = data.scenario || scenarios[Math.floor(Math.random() * scenarios.length)]
  const dialogueData = DIALOGUE_DATA[scenarioKey]
  
  englishAgentState.currentDialogue = {
    ...dialogueData,
    currentStep: 0
  }
  
  return createResponse('dialogue_' + Date.now(), true, {
    type: 'dialogue',
    title: dialogueData.title,
    scenario: dialogueData.scenario,
    currentStep: 0,
    totalSteps: dialogueData.dialogue.length,
    speaker: dialogueData.dialogue[0].speaker,
    english: dialogueData.dialogue[0].english,
    chinese: dialogueData.dialogue[0].chinese,
    encouragement: `情景对话：${dialogueData.title}`
  })
}

// ============================================================================
// 检查单词答案
// ============================================================================

const checkWordAnswer = (data) => {
  if (!englishAgentState.currentWord) {
    return createResponse('check_word_' + Date.now(), false, null, { code: 'NO_ACTIVE_WORD', message: '没有正在进行的单词练习' })
  }
  
  const userAnswer = data.answer.toLowerCase().trim()
  const correctAnswer = englishAgentState.currentWord.word.toLowerCase()
  const isCorrect = userAnswer === correctAnswer
  
  if (!isCorrect) {
    englishAgentState.wrongWords.push({
      ...englishAgentState.currentWord,
      userAnswer: data.answer,
      type: 'vocabulary',
      timestamp: Date.now()
    })
  } else {
    englishAgentState.masteredWords.push({
      ...englishAgentState.currentWord,
      masteredAt: Date.now()
    })
  }
  
  return createResponse('check_word_' + Date.now(), true, {
    isCorrect,
    correctWord: englishAgentState.currentWord.word,
    userAnswer: data.answer,
    chinese: englishAgentState.currentWord.chinese,
    feedback: isCorrect 
      ? `太棒了！${englishAgentState.currentWord.word} 记忆得很好！🌟` 
      : `答案是 "${englishAgentState.currentWord.word}"，意思是 "${englishAgentState.currentWord.chinese}"。继续加油！💪`
  })
}

// ============================================================================
// 检查对话答案
// ============================================================================

const checkDialogueAnswer = (data) => {
  if (!englishAgentState.currentDialogue) {
    return createResponse('check_dialogue_' + Date.now(), false, null, { code: 'NO_ACTIVE_DIALOGUE', message: '没有正在进行的对话练习' })
  }
  
  const dialogue = englishAgentState.currentDialogue
  const currentStep = dialogue.currentStep
  const currentExchange = dialogue.dialogue[currentStep]
  
  // 查找用户应该回复的步骤（speaker是me的步骤）
  let targetStep = currentStep
  for (let i = currentStep; i < dialogue.dialogue.length; i++) {
    if (dialogue.dialogue[i].speaker === 'me') {
      targetStep = i
      break
    }
  }
  
  const targetExchange = dialogue.dialogue[targetStep]
  const userAnswer = (data.answer || '').toLowerCase().trim()
  
  // 简化的匹配逻辑 - 检查是否包含关键词
  const isCorrect = targetExchange.options 
    ? targetExchange.options.some(opt => opt.toLowerCase().includes(userAnswer) || userAnswer.includes(opt.toLowerCase().split(',')[0]))
    : true
  
  if (!isCorrect) {
    dialogue.wrongSteps = dialogue.wrongSteps || []
    dialogue.wrongSteps.push(targetStep)
  }
  
  // 移动到下一步
  const nextStep = targetStep + 1
  dialogue.currentStep = nextStep
  
  if (nextStep >= dialogue.dialogue.length) {
    return createResponse('check_dialogue_' + Date.now(), true, {
      isCorrect: true,
      isComplete: true,
      message: '太棒了！对话练习完成！🎉',
      feedback: '恭喜完成整个情景对话！'
    })
  }
  
  const nextExchange = dialogue.dialogue[nextStep]
  
  return createResponse('check_dialogue_' + Date.now(), true, {
    isCorrect,
    isComplete: false,
    currentStep: nextStep,
    totalSteps: dialogue.dialogue.length,
    speaker: nextExchange.speaker,
    english: nextExchange.english,
    chinese: nextExchange.chinese,
    options: nextExchange.options || null,
    feedback: isCorrect ? '说得很好！👏' : `可以这样说：${nextExchange.options ? nextExchange.options[0] : nextExchange.english}`
  })
}

// ============================================================================
// 错词复习
// ============================================================================

const getWrongWordReview = () => {
  if (englishAgentState.wrongWords.length === 0) {
    return createResponse('review_' + Date.now(), true, {
      message: '太棒了！没有需要复习的单词～',
      words: []
    })
  }
  
  return createResponse('review_' + Date.now(), true, {
    words: englishAgentState.wrongWords.slice(-5),
    count: englishAgentState.wrongWords.length
  })
}

// ============================================================================
// 获取鼓励语
// ============================================================================

const getEncouragement = (type) => {
  const encouragements = {
    vocabulary: [
      '单词小达人，准备好了吗？📚',
      '来挑战一下单词吧！🎯',
      '背单词时间到～ 🏆'
    ],
    speaking: [
      '大胆开口说英语！🗣️',
      '英语小主播，开始练习吧！🎤',
      '说得更流利～ 💬'
    ],
    dialogue: [
      '情景对话开始啦！🎭',
      '扮演角色，练习对话吧！🎬',
      '沉浸式英语学习～ 🌟'
    ]
  }
  const items = encouragements[type] || encouragements.vocabulary
  return items[Math.floor(Math.random() * items.length)]
}

// ============================================================================
// 通用英语响应
// ============================================================================

const getGeneralEnglishResponse = (data) => {
  return createResponse('english_general_' + Date.now(), true, {
    message: '英语Agent准备好啦！你想练习什么呢？',
    options: [
      { action: 'vocabulary', name: '背单词', icon: '📖' },
      { action: 'speaking', name: '口语练习', icon: '🗣️' },
      { action: 'dialogue', name: '情景对话', icon: '🎭' }
    ]
  })
}

// ============================================================================
// 获取Agent状态
// ============================================================================

export const getEnglishAgentStatus = () => {
  return { ...englishAgentState }
}

// ============================================================================
// 重置Agent状态
// ============================================================================

export const resetEnglishAgent = () => {
  englishAgentState.currentWord = null
  englishAgentState.currentDialogue = null
  englishAgentState.vocabularyList = []
  englishAgentState.masteredWords = []
  englishAgentState.wrongWords = []
  englishAgentState.dialogueHistory = []
  englishAgentState.difficultyLevel = 'INTERMEDIATE'
  englishAgentState.sessionStartTime = null
}

// ============================================================================
// 导出EnglishAgent单例
// ============================================================================

export const EnglishAgent = {
  handleRequest,
  handleTransfer,
  getStatus: getEnglishAgentStatus,
  reset: resetEnglishAgent
}

export default EnglishAgent