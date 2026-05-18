// src/services/aiTutorService.js
// V36 AI Tutor Pipeline - Multi-Agent Collaborative Learning Service
// 多Agent协作学习管道服务

import { useBabyStore } from '@/stores/babyStore.js'

// ==================== 常量定义 ====================

// Agent 类型
export const AGENT_TYPES = {
  ORCHESTRATOR: 'orchestrator',
  MATH: 'math',
  CHINESE: 'chinese',
  ENGLISH: 'english',
  LIFE: 'life'
}

// Agent 配置
export const AGENT_CONFIGS = {
  orchestrator: {
    id: 'orchestrator',
    name: '学习管家',
    emoji: '🎓',
    enabled: true,
    personality: 'strict',
    expertise: ['意图识别', '任务调度', '协作协调'],
    welcomeMsg: '你好！我是你的学习管家，可以帮你协调各科学习哦~'
  },
  math: {
    id: 'math',
    name: '数学导师',
    emoji: '🔢',
    enabled: true,
    personality: 'strict',
    expertise: ['计算', '应用题', '几何', '逻辑思维'],
    welcomeMsg: '你好！我是数学导师，一起探索数学的奥秘吧~'
  },
  chinese: {
    id: 'chinese',
    name: '语文导师',
    emoji: '📝',
    enabled: true,
    personality: 'patient',
    expertise: ['拼音', '识字', '阅读理解', '写作', '造句'],
    welcomeMsg: '你好！我是语文导师，让我们一起感受语言的魅力~'
  },
  english: {
    id: 'english',
    name: '英语导师',
    emoji: '🔤',
    enabled: true,
    personality: 'lively',
    expertise: ['单词记忆', '口语练习', '听力训练', '字母'],
    welcomeMsg: 'Hello! I\'m your English tutor! Let\'s learn English together~'
  },
  life: {
    id: 'life',
    name: '生活导师',
    emoji: '🏠',
    enabled: true,
    personality: 'patient',
    expertise: ['自理能力', '安全教育', '礼仪习惯', '整理收纳'],
    welcomeMsg: '你好！我是生活导师，生活技能从小培养~'
  }
}

// 意图类型
export const INTENT_TYPES = {
  GREETING: 'greeting',
  MATH_HELP: 'math_help',
  CHINESE_HELP: 'chinese_help',
  ENGLISH_HELP: 'english_help',
  LIFE_HELP: 'life_help',
  MULTI_AGENT: 'multi_agent',  // 需要多Agent协作
  PROGRESS_QUERY: 'progress_query',
  ENCOURAGEMENT: 'encouragement',
  GENERAL: 'general'
}

// 心情类型
export const TUTOR_MOODS = {
  HAPPY: 'happy',
  ENCOURAGING: 'encouraging',
  EXCITED: 'excited',
  CALM: 'calm',
  SERIOUS: 'serious'
}

// ==================== 辅助函数 ====================

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

/**
 * 随机选择数组元素
 */
function randomPick(arr) {
  if (!arr || arr.length === 0) return ''
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 格式化模板字符串
 */
function formatTemplate(template, data) {
  let result = template
  Object.keys(data).forEach(key => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), data[key])
  })
  return result
}

/**
 * 检测关键词
 */
function containsKeywords(text, keywords) {
  const lowerText = text.toLowerCase()
  return keywords.some(kw => lowerText.includes(kw))
}

// ==================== 意图识别引擎 ====================

/**
 * 识别用户学习意图
 * @param {string} text - 用户输入
 * @returns {object} { intent, confidence, requiresAgents }
 */
export function recognizeIntent(text) {
  const lowerText = text.toLowerCase()
  
  // 数学相关关键词
  const mathKeywords = ['数学', '计算', '加', '减', '乘', '除', '等于', '题', '数字', '图形', '面积', '周长', '几何']
  
  // 语文相关关键词
  const chineseKeywords = ['字', '词', '句', '拼音', '阅读', '写作', '语文', '课文', '背诵', '造句', '识字']
  
  // 英语相关关键词
  const englishKeywords = ['英语', '英文', '单词', 'word', 'speak', '口语', '字母', '听力', '说英语']
  
  // 生活相关关键词
  const lifeKeywords = ['整理', '穿衣', '吃饭', '安全', '礼仪', '收拾', '做家务', '洗', '扫地']
  
  // 打招呼
  const greetingKeywords = ['你好', 'hi', 'hello', '嗨', '在吗', '早上好', '晚安']
  
  // 进度查询
  const progressKeywords = ['学得怎么样', '进步了吗', '表现如何', '进度', '学了什么']
  
  // 鼓励需求
  const encouragementKeywords = ['累了', '不想学', '好难', '不会', '听不懂', '沮丧']
  
  // 检测意图
  const mathScore = mathKeywords.filter(kw => lowerText.includes(kw)).length
  const chineseScore = chineseKeywords.filter(kw => lowerText.includes(kw)).length
  const englishScore = englishKeywords.filter(kw => lowerText.includes(kw)).length
  const lifeScore = lifeKeywords.filter(kw => lowerText.includes(kw)).length
  
  // 问候
  if (containsKeywords(text, greetingKeywords) && text.length < 20) {
    return { intent: INTENT_TYPES.GREETING, confidence: 0.9, requiresAgents: ['orchestrator'] }
  }
  
  // 进度查询
  if (containsKeywords(text, progressKeywords)) {
    return { intent: INTENT_TYPES.PROGRESS_QUERY, confidence: 0.8, requiresAgents: ['orchestrator'] }
  }
  
  // 鼓励需求
  if (containsKeywords(text, encouragementKeywords)) {
    return { intent: INTENT_TYPES.ENCOURAGEMENT, confidence: 0.85, requiresAgents: ['orchestrator'] }
  }
  
  // 找出最高分的学科
  const scores = [
    { type: INTENT_TYPES.MATH_HELP, score: mathScore, agents: ['math'] },
    { type: INTENT_TYPES.CHINESE_HELP, score: chineseScore, agents: ['chinese'] },
    { type: INTENT_TYPES.ENGLISH_HELP, score: englishScore, agents: ['english'] },
    { type: INTENT_TYPES.LIFE_HELP, score: lifeScore, agents: ['life'] }
  ]
  
  scores.sort((a, b) => b.score - a.score)
  
  // 如果有匹配的学科
  if (scores[0].score > 0) {
    // 检查是否需要多Agent协作（如应用题需要语文+数学）
    if (mathScore > 0 && chineseScore > 0 && scores[0].score === mathScore) {
      return {
        intent: INTENT_TYPES.MULTI_AGENT,
        confidence: 0.85,
        requiresAgents: ['math', 'chinese']
      }
    }
    return {
      intent: scores[0].type,
      confidence: Math.min(0.5 + scores[0].score * 0.15, 0.95),
      requiresAgents: scores[0].agents
    }
  }
  
  return { intent: INTENT_TYPES.GENERAL, confidence: 0.5, requiresAgents: ['orchestrator'] }
}

// ==================== Orchestrator Agent ====================

/**
 * 协调器Agent - 理解意图，分发任务
 */
const OrchestratorAgent = {
  /**
   * 处理协调请求
   */
  process(text, context = []) {
    const intentResult = recognizeIntent(text)
    
    return {
      agentId: 'orchestrator',
      intent: intentResult.intent,
      requiresAgents: intentResult.requiresAgents,
      routingHint: this.getRoutingHint(intentResult.intent),
      encouragement: this.generateEncouragement(text)
    }
  },
  
  /**
   * 获取路由提示
   */
  getRoutingHint(intent) {
    const hints = {
      [INTENT_TYPES.GREETING]: 'direct',
      [INTENT_TYPES.MATH_HELP]: 'math',
      [INTENT_TYPES.CHINESE_HELP]: 'chinese',
      [INTENT_TYPES.ENGLISH_HELP]: 'english',
      [INTENT_TYPES.LIFE_HELP]: 'life',
      [INTENT_TYPES.MULTI_AGENT]: 'collaborative',
      [INTENT_TYPES.PROGRESS_QUERY]: 'orchestrator',
      [INTENT_TYPES.ENCOURAGEMENT]: 'orchestrator',
      [INTENT_TYPES.GENERAL]: 'orchestrator'
    }
    return hints[intent] || 'orchestrator'
  },
  
  /**
   * 生成鼓励语
   */
  generateEncouragement(text) {
    const lowerText = text.toLowerCase()
    if (containsKeywords(text, ['累', '疲劳'])) {
      return '学习累了要休息一下哦，短暂休息后才能更好地吸收知识~'
    }
    if (containsKeywords(text, ['难', '不会'])) {
      return '遇到困难是学习的正常过程，每解决一个问题你就在进步！'
    }
    if (containsKeywords(text, ['沮丧', '不开心'])) {
      return '心情不好的时候可以告诉我，或者休息一下再做任务~'
    }
    return null
  },
  
  /**
   * 生成欢迎语
   */
  getWelcome() {
    return AGENT_CONFIGS.orchestrator.welcomeMsg
  }
}

// ==================== Math Agent ====================

/**
 * 数学导师Agent - 专注数学辅导
 */
const MathAgent = {
  /**
   * 处理数学相关请求
   */
  process(text, context = []) {
    // 提取数学问题类型
    const problemType = this.detectProblemType(text)
    
    let response = {
      agentId: 'math',
      reply: '',
      steps: [],
      mood: TUTOR_MOODS.SERIOUS,
      actions: []
    }
    
    switch (problemType) {
      case 'calculation':
        response = this.handleCalculation(text)
        break
      case 'word_problem':
        response = this.handleWordProblem(text)
        break
      case 'geometry':
        response = this.handleGeometry(text)
        break
      default:
        response = this.handleGeneral(text)
    }
    
    return response
  },
  
  /**
   * 检测数学问题类型
   */
  detectProblemType(text) {
    if (containsKeywords(text, ['应用题', '问题'])) return 'word_problem'
    if (containsKeywords(text, ['图形', '面积', '周长', '边', '长', '宽'])) return 'geometry'
    if (containsKeywords(text, ['加', '减', '乘', '除', '等于', '算'])) return 'calculation'
    return 'general'
  },
  
  /**
   * 处理计算题
   */
  handleCalculation(text) {
    // 简单的计算题处理
    const calcPatterns = [
      /(\d+)\s*[加]\s*(\d+)/,
      /(\d+)\s*[-]\s*(\d+)/,
      /(\d+)\s*[乘]\s*(\d+)/,
      /(\d+)\s*[/]\s*(\d+)/
    ]
    
    let match = null
    let operator = ''
    
    if (text.includes('加') || text.includes('+')) {
      match = text.match(/(\d+)\s*[加+]\s*(\d+)/)
      operator = '加'
    } else if (text.includes('减') || text.includes('-')) {
      match = text.match(/(\d+)\s*[-]\s*(\d+)/)
      operator = '减'
    } else if (text.includes('乘') || text.includes('*')) {
      match = text.match(/(\d+)\s*[乘*]\s*(\d+)/)
      operator = '乘'
    } else if (text.includes('除') || text.includes('/')) {
      match = text.match(/(\d+)\s*[/除]\s*(\d+)/)
      operator = '除'
    }
    
    if (match) {
      const a = parseInt(match[1])
      const b = parseInt(match[2])
      let result = 0
      let resultText = ''
      
      switch (operator) {
        case '加': result = a + b; resultText = `${a} + ${b} = ${result}`; break
        case '减': result = a - b; resultText = `${a} - ${b} = ${result}`; break
        case '乘': result = a * b; resultText = `${a} × ${b} = ${result}`; break
        case '除': result = a / b; resultText = `${a} ÷ ${b} = ${result}`; break
      }
      
      return {
        agentId: 'math',
        reply: `让我来帮你计算：\n${resultText}\n\n答案是 ${result}，算对了吗？`,
        steps: [
          { step: 1, content: `看清题目：${a} ${operator} ${b}` },
          { step: 2, content: `运用${operator === '乘' ? '乘法' : operator === '除' ? '除法' : operator === '加' ? '加法' : '减法'}计算` },
          { step: 3, content: `得到结果：${result}` }
        ],
        mood: TUTOR_MOODS.EXCITED,
        actions: [{ type: 'next_practice', label: '再来一题' }]
      }
    }
    
    return this.handleGeneral(text)
  },
  
  /**
   * 处理应用题
   */
  handleWordProblem(text) {
    return {
      agentId: 'math',
      reply: '应用题要仔细读题哦！\n\n1. 先找出已知条件和问题\n2. 确定用什么方法计算\n3. 列式计算\n4. 检查答案\n\n可以告诉我题目具体是什么吗？我来帮你分析~',
      steps: [
        { step: 1, content: '认真读题，找出已知信息' },
        { step: 2, content: '明确要解决的问题' },
        { step: 3, content: '思考用什么数学方法' },
        { step: 4, content: '列式计算并检验' }
      ],
      mood: TUTOR_MOODS.CALM,
      actions: [{ type: 'analyze_problem', label: '分析我的题目' }]
    }
  },
  
  /**
   * 处理几何题
   */
  handleGeometry(text) {
    if (containsKeywords(text, ['面积'])) {
      return {
        agentId: 'math',
        reply: '求面积要用公式哦！\n\n📐 常见图形面积公式：\n• 长方形：长 × 宽\n• 正方形：边长 × 边长\n• 三角形：底 × 高 ÷ 2\n\n告诉我题目中的数字，我来帮你算~',
        steps: [],
        mood: TUTOR_MOODS.CALM,
        actions: [{ type: 'calculate_area', label: '帮我算面积' }]
      }
    }
    
    return {
      agentId: 'math',
      reply: '几何是很有意思的数学知识！\n\n你可以问我关于：\n• 图形的特点\n• 周长怎么算\n• 面积怎么算\n\n想学哪个呢？',
      steps: [],
      mood: TUTOR_MOODS.ENCOURAGING,
      actions: []
    }
  },
  
  /**
   * 处理一般数学问题
   */
  handleGeneral(text) {
    const responses = [
      '数学学习要多思考、多练习！有什么具体问题可以问我哦~',
      '我可以帮你解答数学问题，包括计算、应用题、几何等，快来问我吧！',
      '数学很有趣！告诉我你哪里不明白，我来给你讲解~'
    ]
    
    return {
      agentId: 'math',
      reply: randomPick(responses),
      steps: [],
      mood: TUTOR_MOODS.ENCOURAGING,
      actions: [{ type: 'show_examples', label: '看例题' }]
    }
  },
  
  getWelcome() {
    return AGENT_CONFIGS.math.welcomeMsg
  }
}

// ==================== Chinese Agent ====================

/**
 * 语文导师Agent - 专注语文辅导
 */
const ChineseAgent = {
  /**
   * 处理语文相关请求
   */
  process(text, context = []) {
    const topic = this.detectTopic(text)
    
    let response = {
      agentId: 'chinese',
      reply: '',
      mood: TUTOR_MOODS.CALM,
      actions: []
    }
    
    switch (topic) {
      case 'pinyin':
        response = this.handlePinyin(text)
        break
      case 'reading':
        response = this.handleReading(text)
        break
      case 'writing':
        response = this.handleWriting(text)
        break
      case 'sentence':
        response = this.handleSentence(text)
        break
      default:
        response = this.handleGeneral(text)
    }
    
    return response
  },
  
  /**
   * 检测语文话题
   */
  detectTopic(text) {
    if (containsKeywords(text, ['拼音', '声母', '韵母', '整体认读'])) return 'pinyin'
    if (containsKeywords(text, ['阅读', '读', '理解'])) return 'reading'
    if (containsKeywords(text, ['写字', '写', '笔画', '偏旁'])) return 'writing'
    if (containsKeywords(text, ['造句', '句子', '句式'])) return 'sentence'
    return 'general'
  },
  
  /**
   * 处理拼音问题
   */
  handlePinyin(text) {
    return {
      agentId: 'chinese',
      reply: '拼音是语文学习的重要基础！\n\n📚 学习要点：\n• 声母：b p m f d t n l g k h j q x zh ch sh r z c s y w\n• 韵母：a o e i u ü\n• 整体认读音节：zhi chi shi ri zi ci si yi wu yu\n\n需要我教你哪个音节的拼读吗？',
      steps: [
        { step: 1, content: '分清声母和韵母' },
        { step: 2, content: '练习拼读规则' },
        { step: 3, content: '多读多练' }
      ],
      mood: TUTOR_MOODS.CALM,
      actions: [{ type: 'practice_pinyin', label: '练习拼音' }]
    }
  },
  
  /**
   * 处理阅读问题
   */
  handleReading(text) {
    return {
      agentId: 'chinese',
      reply: '阅读理解要多读几遍哦！\n\n📖 阅读技巧：\n1. 第一遍：通读全文，了解大概意思\n2. 第二遍：带着问题读，找出关键句\n3. 第三遍：思考文章表达的中心思想\n\n告诉我你读的是什么文章，我来帮你分析~',
      steps: [
        { step: 1, content: '通读全文，了解大意' },
        { step: 2, content: '找出文章的关键句' },
        { step: 3, content: '理解文章表达的意思' }
      ],
      mood: TUTOR_MOODS.CALM,
      actions: [{ type: 'analyze_text', label: '分析文章' }]
    }
  },
  
  /**
   * 处理写作问题
   */
  handleWriting(text) {
    return {
      agentId: 'chinese',
      reply: '写作文要有方法哦！\n\n✍️ 写作步骤：\n1. 审题：明确写什么\n2. 构思：想好要写的内容\n3. 列提纲：整理思路\n4. 写作：按照提纲写\n5. 检查：错别字和语句通顺\n\n你遇到的是哪类作文呢？写人、写事、写景还是状物？',
      steps: [],
      mood: TUTOR_MOODS.ENCOURAGING,
      actions: [{ type: 'writing_help', label: '帮我写作文' }]
    }
  },
  
  /**
   * 处理造句问题
   */
  handleSentence(text) {
    // 尝试提取要造句的词
    const words = ['春天', '开心', '学习', '朋友', '努力', '帮助', '美丽', '快乐']
    const foundWord = words.find(w => text.includes(w))
    
    if (foundWord) {
      const examples = {
        '春天': '春天来了，花儿开了，小草绿了。',
        '开心': '今天我学会了一道数学题，心里很开心。',
        '学习': '我们要好好学习，天天向上。',
        '朋友': '我有许多好朋友，我们经常一起玩耍。',
        '努力': '只有努力才能取得好成绩。',
        '帮助': '同学有困难时，我们要帮助他。',
        '美丽': '我的妈妈是一个美丽又善良的人。',
        '快乐': '过生日是很快乐的事情。'
      }
      
      return {
        agentId: 'chinese',
        reply: `造句其实不难！\n\n比如用"${foundWord}"可以这样造：\n"${examples[foundWord]}"\n\n注意：\n• 句子要完整（主语+谓语+宾语）\n• 表达的意思要清楚\n• 可以用学过的词语\n\n你也试试吧！`,
        steps: [
          { step: 1, content: '理解词语意思' },
          { step: 2, content: '联系生活实际' },
          { step: 3, content: '写出完整句子' }
        ],
        mood: TUTOR_MOODS.EXCITED,
        actions: [{ type: 'more_sentence', label: '再练一句' }]
      }
    }
    
    return {
      agentId: 'chinese',
      reply: '造句练习可以帮助我们更好地理解词语和表达！\n\n📝 造句小技巧：\n• 先理解词语的意思\n• 想想生活中有没有可以用到这个词的场景\n• 把句子写完整\n\n告诉我你想用哪个词造句？',
      steps: [],
      mood: TUTOR_MOODS.CALM,
      actions: [{ type: 'give_word', label: '给我一个词' }]
    }
  },
  
  /**
   * 处理一般语文问题
   */
  handleGeneral(text) {
    const responses = [
      '语文学习要注重积累！多读书、多背诵，慢慢就能提高~',
      '我可以帮你学习拼音、阅读理解、写作等，有什么想问的吗？',
      '语文是所有学科的基础，学好语文很重要哦！'
    ]
    
    return {
      agentId: 'chinese',
      reply: randomPick(responses),
      steps: [],
      mood: TUTOR_MOODS.ENCOURAGING,
      actions: [{ type: 'learn_more', label: '了解更多' }]
    }
  },
  
  getWelcome() {
    return AGENT_CONFIGS.chinese.welcomeMsg
  }
}

// ==================== English Agent ====================

/**
 * 英语导师Agent - 专注英语辅导
 */
const EnglishAgent = {
  /**
   * 处理英语相关请求
   */
  process(text, context = []) {
    const topic = this.detectTopic(text)
    
    let response = {
      agentId: 'english',
      reply: '',
      mood: TUTOR_MOODS.EXCITED,
      actions: []
    }
    
    switch (topic) {
      case 'vocabulary':
        response = this.handleVocabulary(text)
        break
      case 'speaking':
        response = this.handleSpeaking(text)
        break
      case 'listening':
        response = this.handleListening(text)
        break
      default:
        response = this.handleGeneral(text)
    }
    
    return response
  },
  
  /**
   * 检测英语话题
   */
  detectTopic(text) {
    if (containsKeywords(text, ['单词', 'word', '记', '背'])) return 'vocabulary'
    if (containsKeywords(text, ['口语', '说', 'speak', '读'])) return 'speaking'
    if (containsKeywords(text, ['听力', 'listen', '听'])) return 'listening'
    return 'general'
  },
  
  /**
   * 处理单词问题
   */
  handleVocabulary(text) {
    return {
      agentId: 'english',
      reply: '背单词有技巧哦！\n\n📚 单词记忆法：\n\n1️⃣ 联想记忆：把单词和图片、动作联系起来\n   例如：apple 苹果 → 想象一个红红的苹果\n\n2️⃣ 拼读记忆：会读就会写！\n   例如：cat [kæt] → c-a-t\n\n3️⃣ 场景记忆：把单词用在句子里\n   例如：I see a cat. 我看见一只猫。\n\n想学什么单词？我来教你！',
      steps: [
        { step: 1, content: '看单词，读出声' },
        { step: 2, content: '联想图片或意思' },
        { step: 3, content: '用单词说句子' },
        { step: 4, content: '多次复习' }
      ],
      mood: TUTOR_MOODS.EXCITED,
      actions: [{ type: 'teach_word', label: '教我背单词' }]
    }
  },
  
  /**
   * 处理口语问题
   */
  handleSpeaking(text) {
    return {
      agentId: 'english',
      reply: '英语口语要多说多练！\n\n🗣️ 练习方法：\n\n1️⃣ 每天朗读英语课文\n2️⃣ 试着用英语描述身边的事物\n3️⃣ 跟着音频模仿发音\n4️⃣ 不要怕犯错，勇敢开口！\n\n试试用英语介绍自己吧：\n"My name is ___. I am __ years old."',
      steps: [],
      mood: TUTOR_MOODS.EXCITED,
      actions: [{ type: 'practice_speaking', label: '口语练习' }]
    }
  },
  
  /**
   * 处理听力问题
   */
  handleListening(text) {
    return {
      agentId: 'english',
      reply: '提高听力要多听多练！\n\n👂 听力技巧：\n\n1️⃣ 听之前先看题，预测内容\n2️⃣ 集中注意力听关键词\n3️⃣ 遇到没听懂的不要慌，继续听后面的\n4️⃣ 听完尝试复述主要内容\n\n可以每天听一些简单的英语儿歌或故事哦~',
      steps: [],
      mood: TUTOR_MOODS.CALM,
      actions: [{ type: 'listening_practice', label: '听力练习' }]
    }
  },
  
  /**
   * 处理一般英语问题
   */
  handleGeneral(text) {
    const responses = [
      'Hello! English is fun! What would you like to learn today? 你想学什么呢？',
      '学英语要多听、多说、多读、多写！有什么问题尽管问我~',
      'Don\'t be shy! 勇敢说英语，错误是学习的一部分哦！'
    ]
    
    return {
      agentId: 'english',
      reply: randomPick(responses),
      steps: [],
      mood: TUTOR_MOODS.LIVELY || 'lively',
      actions: [{ type: 'start_learning', label: '开始学习' }]
    }
  },
  
  getWelcome() {
    return AGENT_CONFIGS.english.welcomeMsg
  }
}

// ==================== Life Agent ====================

/**
 * 生活导师Agent - 专注生活技能辅导
 */
const LifeAgent = {
  /**
   * 处理生活相关请求
   */
  process(text, context = []) {
    const topic = this.detectTopic(text)
    
    let response = {
      agentId: 'life',
      reply: '',
      mood: TUTOR_MOODS.HAPPY,
      actions: []
    }
    
    switch (topic) {
      case 'self_care':
        response = this.handleSelfCare(text)
        break
      case 'safety':
        response = this.handleSafety(text)
        break
      case 'etiquette':
        response = this.handleEtiquette(text)
        break
      default:
        response = this.handleGeneral(text)
    }
    
    return response
  },
  
  /**
   * 检测生活话题
   */
  detectTopic(text) {
    if (containsKeywords(text, ['穿衣', '整理', '收拾', '洗', '刷牙', '洗手'])) return 'self_care'
    if (containsKeywords(text, ['安全', '危险', '小心', '注意'])) return 'safety'
    if (containsKeywords(text, ['礼仪', '礼貌', '谢谢', '对不起', '请'])) return 'etiquette'
    return 'general'
  },
  
  /**
   * 处理自理能力
   */
  handleSelfCare(text) {
    if (containsKeywords(text, ['整理', '收拾'])) {
      return {
        agentId: 'life',
        reply: '整理房间是个好习惯！\n\n📦 整理技巧：\n\n1️⃣ 分类放：玩具放一堆，书放一堆，衣服放一堆\n2️⃣ 定点放：每样东西有固定的位置\n3️⃣ 用完放回：玩具玩完要放回原位\n\n试试从小区域开始整理，比如先整理书桌！',
        steps: [
          { step: 1, content: '把所有东西放在一起' },
          { step: 2, content: '分类：玩具/书/衣服' },
          { step: 3, content: '分别放回固定位置' }
        ],
        mood: TUTOR_MOODS.HAPPY,
        actions: [{ type: 'tidying_tips', label: '整理小技巧' }]
      }
    }
    
    return {
      agentId: 'life',
      reply: '学会自己的事情自己做！\n\n✨ 自理能力包括：\n• 自己穿衣、穿鞋\n• 整理书包和房间\n• 刷牙、洗脸、洗手\n• 收拾玩具\n\n这些都是很重要的技能哦！',
      steps: [],
      mood: TUTOR_MOODS.ENCOURAGING,
      actions: [{ type: 'skill_practice', label: '技能练习' }]
    }
  },
  
  /**
   * 处理安全教育
   */
  handleSafety(text) {
    return {
      agentId: 'life',
      reply: '安全第一！\n\n⚠️ 安全提醒：\n\n1️⃣ 居家安全：\n• 不爬窗户、不玩火电\n• 不给陌生人开门\n\n2️⃣ 户外安全：\n• 过马路看红绿灯\n• 不跟陌生人走\n\n3️⃣ 游戏安全：\n• 不做危险动作\n• 在安全的地方玩耍\n\n记住这些，安全最重要！',
      steps: [],
      mood: TUTOR_MOODS.SERIOUS,
      actions: [{ type: 'safety_rules', label: '安全守则' }]
    }
  },
  
  /**
   * 处理礼仪教育
   */
  handleEtiquette(text) {
    return {
      agentId: 'life',
      reply: '讲礼貌人人爱！\n\n🤝 基本礼仪：\n\n1️⃣ 见到熟人要问好\n2️⃣ 别人帮助要说"谢谢"\n3️⃣ 做错事要说"对不起"\n4️⃣ 请别人帮忙要说"请"\n5️⃣ 排队不插队\n\n懂礼貌的孩子最受欢迎哦~',
      steps: [],
      mood: TUTOR_MOODS.HAPPY,
      actions: [{ type: 'etiquette_practice', label: '礼仪练习' }]
    }
  },
  
  /**
   * 处理一般生活问题
   */
  handleGeneral(text) {
    const responses = [
      '生活技能是成长中很重要的一部分！有什么想学的吗？',
      '我可以教你整理房间、安全知识、礼貌礼仪等~',
      '自己的事情自己做，你是最棒的！'
    ]
    
    return {
      agentId: 'life',
      reply: randomPick(responses),
      steps: [],
      mood: TUTOR_MOODS.ENCOURAGING,
      actions: [{ type: 'explore_topics', label: '探索话题' }]
    }
  },
  
  getWelcome() {
    return AGENT_CONFIGS.life.welcomeMsg
  }
}

// ==================== Agent Map ====================

const AGENT_MAP = {
  orchestrator: OrchestratorAgent,
  math: MathAgent,
  chinese: ChineseAgent,
  english: EnglishAgent,
  life: LifeAgent
}

// ==================== Tutor Pipeline ====================

/**
 * 执行多Agent管道
 * @param {string} text - 用户输入
 * @param {array} context - 对话上下文
 * @param {object} options - 配置选项
 * @returns {Promise<object>} 处理结果
 */
export async function executePipeline(text, context = [], options = {}) {
  // 模拟异步延迟
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400))
  
  // Step 1: 意图识别（由Orchestrator处理）
  const intentResult = OrchestratorAgent.process(text, context)
  
  // 如果需要多Agent协作
  if (intentResult.requiresAgents.length > 1) {
    return executeMultiAgentCollaboration(text, context, intentResult, options)
  }
  
  // 单Agent处理
  const agentId = intentResult.requiresAgents[0]
  const agent = AGENT_MAP[agentId]
  
  if (!agent) {
    return {
      success: false,
      reply: '抱歉，我现在不知道该怎么回答你...',
      agentId: 'orchestrator',
      mood: TUTOR_MOODS.CALM
    }
  }
  
  const result = agent.process(text, context)
  
  // 如果有鼓励语，添加在回复前面
  if (intentResult.encouragement && result.reply) {
    result.reply = intentResult.encouragement + '\n\n' + result.reply
  }
  
  return {
    success: true,
    ...result,
    intent: intentResult.intent,
    routingHint: intentResult.routingHint
  }
}

/**
 * 执行多Agent协作
 */
async function executeMultiAgentCollaboration(text, context, intentResult, options) {
  const requiredAgents = intentResult.requiresAgents
  
  // 并行处理多个Agent
  const agentPromises = requiredAgents.map(agentId => {
    const agent = AGENT_MAP[agentId]
    return agent ? agent.process(text, context) : null
  })
  
  const agentResults = await Promise.all(agentPromises)
  
  // 合并结果
  const validResults = agentResults.filter(r => r !== null)
  
  if (validResults.length === 0) {
    return {
      success: false,
      reply: '抱歉，我现在没办法帮你...',
      agentId: 'orchestrator',
      mood: TUTOR_MOODS.CALM
    }
  }
  
  // 合并回复
  let combinedReply = ''
  if (validResults.length === 1) {
    combinedReply = validResults[0].reply
  } else {
    combinedReply = '这个问题需要几个科目一起学习哦！\n\n'
    validResults.forEach((result, index) => {
      combinedReply += `【${AGENT_CONFIGS[requiredAgents[index]]?.name || result.agentId}】\n${result.reply}\n\n`
    })
    combinedReply += '综合起来理解，会更容易掌握哦！💪'
  }
  
  // 合并步骤
  const allSteps = validResults.flatMap(r => r.steps || [])
  
  // 合并动作
  const allActions = validResults.flatMap(r => r.actions || [])
  
  return {
    success: true,
    agentId: 'orchestrator',
    reply: combinedReply,
    steps: allSteps.slice(0, 6),  // 限制步骤数量
    mood: TUTOR_MOODS.ENCOURAGING,
    actions: allActions.slice(0, 3),
    collaborative: true,
    participatingAgents: requiredAgents,
    intent: intentResult.intent,
    routingHint: 'collaborative'
  }
}

/**
 * 获取Agent配置
 */
export function getAgentConfig(agentId) {
  return AGENT_CONFIGS[agentId] || null
}

/**
 * 获取所有启用的Agent配置
 */
export function getEnabledAgents() {
  return Object.values(AGENT_CONFIGS).filter(config => config.enabled)
}

/**
 * 创建新会话
 */
export function createSession(babyId, initialMessage = '') {
  const babyStore = useBabyStore()
  const currentBaby = babyStore.currentBaby || {}
  
  const session = {
    id: generateId(),
    babyId: babyId || currentBaby.id || 'default',
    babyName: currentBaby.name || '小朋友',
    agents: Object.keys(AGENT_CONFIGS),
    messages: [],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // 添加初始消息
  if (initialMessage) {
    session.messages.push({
      id: generateId(),
      role: 'user',
      content: initialMessage,
      timestamp: new Date().toISOString()
    })
  }
  
  // 添加欢迎消息
  session.messages.push({
    id: generateId(),
    role: 'orchestrator',
    agentId: 'orchestrator',
    content: AGENT_CONFIGS.orchestrator.welcomeMsg,
    timestamp: new Date().toISOString()
  })
  
  return session
}

/**
 * 获取会话历史
 */
export function getSessionHistory(sessionId) {
  try {
    const sessions = uni.getStorageSync('tutor_sessions') || '[]'
    const parsed = typeof sessions === 'string' ? JSON.parse(sessions) : sessions
    const session = parsed.find(s => s.id === sessionId)
    return session || null
  } catch (e) {
    console.error('[AITutor] Failed to get session history:', e)
    return null
  }
}

/**
 * 保存会话
 */
export function saveSession(session) {
  try {
    const sessions = uni.getStorageSync('tutor_sessions') || '[]'
    const parsed = typeof sessions === 'string' ? JSON.parse(sessions) : sessions
    
    const index = parsed.findIndex(s => s.id === session.id)
    if (index >= 0) {
      parsed[index] = { ...session, updatedAt: new Date().toISOString() }
    } else {
      parsed.push(session)
    }
    
    uni.setStorageSync('tutor_sessions', JSON.stringify(parsed))
    return true
  } catch (e) {
    console.error('[AITutor] Failed to save session:', e)
    return false
  }
}

/**
 * 加载所有会话
 */
export function loadAllSessions() {
  try {
    const sessions = uni.getStorageSync('tutor_sessions') || '[]'
    return typeof sessions === 'string' ? JSON.parse(sessions) : sessions
  } catch (e) {
    console.error('[AITutor] Failed to load sessions:', e)
    return []
  }
}

/**
 * 删除会话
 */
export function deleteSession(sessionId) {
  try {
    const sessions = uni.getStorageSync('tutor_sessions') || '[]'
    const parsed = typeof sessions === 'string' ? JSON.parse(sessions) : sessions
    const filtered = parsed.filter(s => s.id !== sessionId)
    uni.setStorageSync('tutor_sessions', JSON.stringify(filtered))
    return true
  } catch (e) {
    console.error('[AITutor] Failed to delete session:', e)
    return false
  }
}

/**
 * 保存学习记录
 */
export function saveLearningRecord(record) {
  try {
    const records = uni.getStorageSync('tutor_learning_records') || '[]'
    const parsed = typeof records === 'string' ? JSON.parse(records) : records
    parsed.push({
      ...record,
      id: generateId(),
      timestamp: new Date().toISOString()
    })
    
    // 只保留最近200条
    if (parsed.length > 200) {
      parsed.splice(0, parsed.length - 200)
    }
    
    uni.setStorageSync('tutor_learning_records', JSON.stringify(parsed))
    return true
  } catch (e) {
    console.error('[AITutor] Failed to save learning record:', e)
    return false
  }
}

/**
 * 获取学习记录
 */
export function getLearningRecords(babyId) {
  try {
    const records = uni.getStorageSync('tutor_learning_records') || '[]'
    const parsed = typeof records === 'string' ? JSON.parse(records) : records
    return babyId ? parsed.filter(r => r.babyId === babyId) : parsed
  } catch (e) {
    console.error('[AITutor] Failed to get learning records:', e)
    return []
  }
}

// ==================== 导出 ====================

export default {
  // Agent配置
  AGENT_TYPES,
  AGENT_CONFIGS,
  TUTOR_MOODS,
  
  // 核心函数
  recognizeIntent,
  executePipeline,
  
  // Agent配置函数
  getAgentConfig,
  getEnabledAgents,
  
  // 会话管理
  createSession,
  getSessionHistory,
  saveSession,
  loadAllSessions,
  deleteSession,
  
  // 学习记录
  saveLearningRecord,
  getLearningRecords
}
