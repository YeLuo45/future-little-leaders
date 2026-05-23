/**
 * V101 Chinese Agent
 * 语文Agent - 拼音学习与声调练习、识字卡片与笔画顺序
 */

import { AGENT_TYPES, createResponse, DIFFICULTY_LEVELS, TASK_STATUS } from './agentProtocol.js'

// ============================================================================
// ChineseAgent状态
// ============================================================================

const chineseAgentState = {
  currentCharacter: null,
  currentPinyin: null,
  learningHistory: [],
  masteredCharacters: [],
  wrongCharacters: [],
  difficultyLevel: 'INTERMEDIATE',
  currentTone: null,
  sessionStartTime: null
}

// ============================================================================
// 拼音数据
// ============================================================================

const PINYIN_DATA = {
  initials: ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'],
  finals: ['a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong'],
  tones: [
    { tone: 1, name: '第一声', symbol: 'ˉ', example: '妈 mā' },
    { tone: 2, name: '第二声', symbol: 'ˊ', example: '麻 má' },
    { tone: 3, name: '第三声', symbol: 'ˇ', example: '马 mǎ' },
    { tone: 4, name: '第四声', symbol: 'ˋ', example: '骂 mà' }
  ]
}

// ============================================================================
// 汉字数据示例
// ============================================================================

const CHARACTER_DATA = [
  { char: '人', pinyin: 'rén', strokeCount: 2, meaning: '人，人类' },
  { char: '大', pinyin: 'dà', strokeCount: 3, meaning: '大小' },
  { char: '小', pinyin: 'xiǎo', strokeCount: 3, meaning: '大小' },
  { char: '中', pinyin: 'zhōng', strokeCount: 4, meaning: '中间' },
  { char: '国', pinyin: 'guó', strokeCount: 8, meaning: '国家' },
  { char: '日', pinyin: 'rì', strokeCount: 4, meaning: '太阳，日子' },
  { char: '月', pinyin: 'yuè', strokeCount: 4, meaning: '月亮' },
  { char: '水', pinyin: 'shuǐ', strokeCount: 4, meaning: '水' },
  { char: '火', pinyin: 'huǒ', strokeCount: 4, meaning: '火焰' },
  { char: '山', pinyin: 'shān', strokeCount: 3, meaning: '高山' },
  { char: '木', pinyin: 'mù', strokeCount: 4, meaning: '树木' },
  { char: '土', pinyin: 'tǔ', strokeCount: 3, meaning: '土地' },
  { char: '天', pinyin: 'tiān', strokeCount: 4, meaning: '天空' },
  { char: '上', pinyin: 'shàng', strokeCount: 3, meaning: '上面' },
  { char: '下', pinyin: 'xià', strokeCount: 3, meaning: '下面' }
]

// ============================================================================
// 笔画顺序数据
// ============================================================================

const STROKE_ORDER = {
  '人': ['丿', '乀'],
  '大': ['一', '丿', '乀'],
  '小': ['丨', '丿', '丶'],
  '中': ['丨', '口', '丨'],
  '国': ['冂', '王', '口', '一', '王'],
  '日': ['丨', 'ㄱ', '一', '丨'],
  '月': ['丿', '丨', 'ㄱ', '一'],
  '水': ['亻', '㇀', '丶', '亅'],
  '火': ['丿', '丶', '丶', '乀'],
  '山': ['丨', '∟', '丨']
}

// ============================================================================
// 处理请求
// ============================================================================

export const handleRequest = async (request) => {
  const { action, data } = request.payload
  
  chineseAgentState.sessionStartTime = chineseAgentState.sessionStartTime || Date.now()
  
  switch (action) {
    case 'pinyin':
      return generatePinyinPractice(data)
    case 'characters':
      return generateCharacterCard(data)
    case 'stroke_order':
      return generateStrokeOrderPractice(data)
    case 'general':
      return getGeneralChineseResponse(data)
    case 'check_pinyin':
      return checkPinyinAnswer(data)
    case 'check_character':
      return checkCharacterAnswer(data)
    case 'review_wrong':
      return getWrongCharacterReview()
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
    chineseAgentState.difficultyLevel = context.difficultyLevel || 'INTERMEDIATE'
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
// 生成拼音练习
// ============================================================================

const generatePinyinPractice = (data = {}) => {
  const targetTone = data.tone || PINYIN_DATA.tones[Math.floor(Math.random() * 4)]
  const randomFinal = PINYIN_DATA.finals[Math.floor(Math.random() * PINYIN_DATA.finals.length)]
  const randomInitial = PINYIN_DATA.initials[Math.floor(Math.random() * PINYIN_DATA.initials.length)]
  
  const pinyin = randomInitial + randomFinal
  const fullPinyin = pinyin + targetTone.symbol
  
  chineseAgentState.currentPinyin = {
    pinyin,
    tone: targetTone,
    fullPinyin
  }
  
  return createResponse('pinyin_' + Date.now(), true, {
    type: 'pinyin_tone',
    pinyin: pinyin,
    tone: targetTone.tone,
    toneName: targetTone.name,
    options: PINYIN_DATA.tones.map(t => ({
      tone: t.tone,
      name: t.name,
      symbol: t.symbol
    })),
    encouragement: getEncouragement('pinyin')
  })
}

// ============================================================================
// 生成识字卡片
// ============================================================================

const generateCharacterCard = (data = {}) => {
  const levelMap = {
    'BEGINNER': 5,
    'INTERMEDIATE': 10,
    'ADVANCED': 15,
    'EXPERT': 15
  }
  
  const maxIndex = levelMap[chineseAgentState.difficultyLevel] || 10
  const charData = CHARACTER_DATA[Math.floor(Math.random() * maxIndex)]
  
  chineseAgentState.currentCharacter = charData
  
  return createResponse('char_' + Date.now(), true, {
    type: 'character_card',
    character: charData.char,
    pinyin: charData.pinyin,
    meaning: charData.meaning,
    difficulty: chineseAgentState.difficultyLevel,
    tips: getCharacterTips(charData),
    encouragement: getEncouragement('character')
  })
}

// ============================================================================
// 生成笔画顺序练习
// ============================================================================

const generateStrokeOrderPractice = (data = {}) => {
  const charData = data.character ? CHARACTER_DATA.find(c => c.char === data.character) : CHARACTER_DATA[Math.floor(Math.random() * 5)]
  const strokes = STROKE_ORDER[charData.char] || ['一', '丨', '丿', '乀']
  
  chineseAgentState.currentCharacter = charData
  
  return createResponse('stroke_' + Date.now(), true, {
    type: 'stroke_order',
    character: charData.char,
    pinyin: charData.pinyin,
    strokeCount: charData.strokeCount,
    strokes: strokes,
    totalStrokes: strokes.length,
    currentStroke: 1,
    encouragement: `请写出 "${charData.char}" 字的笔画顺序，笔画数：${strokes.length}画`
  })
}

// ============================================================================
// 检查拼音答案
// ============================================================================

const checkPinyinAnswer = (data) => {
  if (!chineseAgentState.currentPinyin) {
    return createResponse('check_pinyin_' + Date.now(), false, null, { code: 'NO_ACTIVE_PINYIN', message: '没有正在进行的拼音练习' })
  }
  
  const isCorrect = data.selectedTone === chineseAgentState.currentPinyin.tone.tone
  
  if (!isCorrect) {
    chineseAgentState.wrongCharacters.push({
      ...chineseAgentState.currentPinyin,
      userAnswer: data.selectedTone,
      type: 'pinyin'
    })
  } else {
    chineseAgentState.masteredCharacters.push({
      ...chineseAgentState.currentPinyin,
      masteredAt: Date.now()
    })
  }
  
  return createResponse('check_pinyin_' + Date.now(), true, {
    isCorrect,
    correctTone: chineseAgentState.currentPinyin.tone.tone,
    correctToneName: chineseAgentState.currentPinyin.tone.name,
    userAnswer: data.selectedTone,
    example: chineseAgentState.currentPinyin.tone.example,
    feedback: isCorrect ? '太棒了！声调正确！🎉' : `答错了～正确的是${chineseAgentState.currentPinyin.tone.name}，${chineseAgentState.currentPinyin.tone.example}`
  })
}

// ============================================================================
// 检查汉字答案
// ============================================================================

const checkCharacterAnswer = (data) => {
  if (!chineseAgentState.currentCharacter) {
    return createResponse('check_char_' + Date.now(), false, null, { code: 'NO_ACTIVE_CHARACTER', message: '没有正在进行的识字练习' })
  }
  
  const isCorrect = data.userAnswer === chineseAgentState.currentCharacter.char
  
  if (!isCorrect) {
    chineseAgentState.wrongCharacters.push({
      ...chineseAgentState.currentCharacter,
      userAnswer: data.userAnswer,
      type: 'character'
    })
  }
  
  return createResponse('check_char_' + Date.now(), true, {
    isCorrect,
    correctCharacter: chineseAgentState.currentCharacter.char,
    userAnswer: data.userAnswer,
    meaning: chineseAgentState.currentCharacter.meaning,
    feedback: isCorrect ? '太棒了！汉字掌握得很好！🌟' : `答案是 "${chineseAgentState.currentCharacter.char}" 哦，再试试看！`
  })
}

// ============================================================================
// 错字复习
// ============================================================================

const getWrongCharacterReview = () => {
  if (chineseAgentState.wrongCharacters.length === 0) {
    return createResponse('review_' + Date.now(), true, {
      message: '太棒了！没有需要复习的汉字～',
      problems: []
    })
  }
  
  return createResponse('review_' + Date.now(), true, {
    problems: chineseAgentState.wrongCharacters.slice(-5),
    count: chineseAgentState.wrongCharacters.length
  })
}

// ============================================================================
// 获取汉字提示
// ============================================================================

const getCharacterTips = (charData) => {
  const tips = [
    `"${charData.char}" 字共有 ${charData.strokeCount} 画`,
    `"${charData.char}" 读作 ${charData.pinyin}`,
    `"${charData.char}" 的意思是 ${charData.meaning}`
  ]
  return tips
}

// ============================================================================
// 获取鼓励语
// ============================================================================

const getEncouragement = (type) => {
  const encouragements = {
    pinyin: [
      '拼音小达人，准备好了吗？📚',
      '声调练习开始啦！🎯',
      '一起学习拼音吧～ 🏀'
    ],
    character: [
      '识字小能手，开始认字啦！📖',
      '这个字你认识吗？🤔',
      '一起探索汉字的奥秘吧！✨'
    ]
  }
  const items = encouragements[type] || encouragements.character
  return items[Math.floor(Math.random() * items.length)]
}

// ============================================================================
// 通用语文响应
// ============================================================================

const getGeneralChineseResponse = (data) => {
  return createResponse('chinese_general_' + Date.now(), true, {
    message: '语文Agent准备好啦！你想练习什么呢？',
    options: [
      { action: 'pinyin', name: '拼音学习', icon: '🔤' },
      { action: 'characters', name: '识字卡片', icon: '📝' },
      { action: 'stroke_order', name: '笔画顺序', icon: '✍️' }
    ]
  })
}

// ============================================================================
// 获取Agent状态
// ============================================================================

export const getChineseAgentStatus = () => {
  return { ...chineseAgentState }
}

// ============================================================================
// 重置Agent状态
// ============================================================================

export const resetChineseAgent = () => {
  chineseAgentState.currentCharacter = null
  chineseAgentState.currentPinyin = null
  chineseAgentState.learningHistory = []
  chineseAgentState.masteredCharacters = []
  chineseAgentState.wrongCharacters = []
  chineseAgentState.difficultyLevel = 'INTERMEDIATE'
  chineseAgentState.currentTone = null
  chineseAgentState.sessionStartTime = null
}

// ============================================================================
// 导出ChineseAgent单例
// ============================================================================

export const ChineseAgent = {
  handleRequest,
  handleTransfer,
  getStatus: getChineseAgentStatus,
  reset: resetChineseAgent
}

export default ChineseAgent