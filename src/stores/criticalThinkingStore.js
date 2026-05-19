// src/stores/criticalThinkingStore.js
// V73 Critical Thinking Training System — 思辨能力训练系统

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore'

// ============================================================================
// Types & Constants
// ============================================================================

// 谜题难度
export const PUZZLE_DIFFICULTY = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3
}

export const PUZZLE_DIFFICULTY_INFO = {
  [PUZZLE_DIFFICULTY.EASY]: { label: '简单', color: '#52C41A', stars: 1 },
  [PUZZLE_DIFFICULTY.MEDIUM]: { label: '中等', color: '#FA8C16', stars: 2 },
  [PUZZLE_DIFFICULTY.HARD]: { label: '困难', color: '#F5222D', stars: 3 }
}

// 辩论角色
export const DEBATE_SIDE = {
  PRO: 'pro',     // 正方
  CON: 'con'      // 反方
}

export const SIDE_INFO = {
  [DEBATE_SIDE.PRO]: { label: '正方', icon: '👍', color: '#1890FF' },
  [DEBATE_SIDE.CON]: { label: '反方', icon: '👎', color: '#F5222D' }
}

// 决策类型
export const DECISION_TYPE = {
  SIMPLE: 'simple',           // 简单决策
  COMPLEX: 'complex',         // 复杂决策
  ETHICAL: 'ethical'          // 伦理决策
}

export const DECISION_TYPE_INFO = {
  [DECISION_TYPE.SIMPLE]: { label: '简单决策', icon: '⚡', color: '#52C41A' },
  [DECISION_TYPE.COMPLEX]: { label: '复杂决策', icon: '🎯', color: '#FA8C16' },
  [DECISION_TYPE.ETHICAL]: { label: '伦理决策', icon: '⚖️', color: '#722ED1' }
}

// localStorage keys
const LOGIC_PROGRESS_KEY = 'ct_logic_progress'
const DEBATE_PROGRESS_KEY = 'ct_debate_progress'
const DECISION_PROGRESS_KEY = 'ct_decision_progress'

// ============================================================================
// Mock Data: Logic Puzzles
// ============================================================================

const MOCK_LOGIC_PUZZLES = [
  {
    id: 'puzzle_1',
    title: '谁吃了蛋糕？',
    description: '小明、小红、小华三个人，有一个人吃了蛋糕。已知：1) 小明说不是我吃的 2) 小红说她也没吃 3) 三个人中只有一个人说了真话',
    options: ['小明', '小红', '小华'],
    answer: '小华',
    explanation: '小明说"不是我吃的"和小红说"她也没吃"不可能同时为真。如果小红说的是真的，那小明说的也是真的，矛盾。所以小明在说谎，蛋糕是小明吃的。',
    difficulty: PUZZLE_DIFFICULTY.EASY,
    category: 'deduction',
    hint: '尝试用假设法，假设某人的话是真的，看是否会产生矛盾'
  },
  {
    id: 'puzzle_2',
    title: '运动会安排',
    description: '跑步、跳远、铅球三个项目，安排在周一、周二、周三。已知：1) 跑步不在周一 2) 跳远不在周三 3) 铅球在跳远之后的一天',
    options: ['周一:跳远,周二:铅球,周三:跑步', '周一:铅球,周二:跑步,周三:跳远', '周一:跑步,周二:跳远,周三:铅球', '周一:铅球,周二:跳远,周三:跑步'],
    answer: '周一:铅球,周二:跑步,周三:跳远',
    explanation: '铅球在跳远之后，跳远不在周三，所以铅球也不在周一和周二（跳远之后的"一天"）。排除后，铅球只能在周三。但铅球在跳远之后，所以跳远只能在周二。周一就是跑步。',
    difficulty: PUZZLE_DIFFICULTY.MEDIUM,
    category: 'sequencing',
    hint: '从铅球的位置开始推理，注意"之后的一天"意味着相邻'
  },
  {
    id: 'puzzle_3',
    title: '钥匙在哪里？',
    description: '四个盒子排成一排：红、蓝、绿、黄。钥匙在其中一个盒子里。提示：1) 钥匙不在红盒子里 2) 蓝盒子在绿盒子的左边 3) 黄盒子在最右边，但钥匙不在它里面',
    options: ['红盒子', '蓝盒子', '绿盒子', '黄盒子'],
    answer: '绿盒子',
    explanation: '黄盒子在最右边且没有钥匙，所以钥匙在红、蓝、绿中。蓝盒子在绿盒子左边，所以蓝可能是1号或2号。如果蓝是1号，绿是2号或3号或4号，但绿不能是4号（钥匙不在黄盒子），所以绿可以是2号或3号。如果蓝是2号，绿是3号或4号，绿可以是3号。假设各种情况，总能找到矛盾，最终只有绿盒子符合所有条件。',
    difficulty: PUZZLE_DIFFICULTY.HARD,
    category: 'logic',
    hint: '使用排除法，逐步排除不符合条件的盒子'
  },
  {
    id: 'puzzle_4',
    title: '年龄之谜',
    description: '爸爸、妈妈、儿子、女儿四人年龄不同。已知：1) 爸爸比妈妈大 2) 儿子不是最小的 3) 女儿比爸爸年轻 4) 妈妈的年龄在中间',
    options: ['爸爸第一，妈妈第二', '爸爸第一，女儿第二', '妈妈第一，儿子第二', '爸爸第一，儿子第二'],
    answer: '爸爸第一，妈妈第二',
    explanation: '妈妈的年龄在中间，所以她是第二小的。爸爸比妈妈大，所以爸爸是第一或第二，但不能是第二，所以爸爸是第一。女儿比爸爸年轻，所以女儿在爸爸后面。妈妈是第二，所以女儿是第三或第四。儿子不是最小的，所以女儿可能是第三或第四。综合排序：爸爸 > 妈妈 > (女儿/儿子) > (儿子/女儿)。如果女儿是第三，儿子是第四，符合所有条件。',
    difficulty: PUZZLE_DIFFICULTY.MEDIUM,
    category: 'comparison',
    hint: '先确定妈妈的位置，然后根据大小关系排列其他人'
  },
  {
    id: 'puzzle_5',
    title: '水果分配',
    description: '苹果、香蕉、橙子、葡萄分配给甲、乙、丙、丁四人，每人一种。已知：1) 甲不要苹果 2) 乙不要香蕉也不要在两头 3) 丙要橙子 4) 丁要在两端',
    options: ['甲:葡萄,乙:橙子,丙:苹果,丁:香蕉', '甲:香蕉,乙:橙子,丙:葡萄,丁:苹果', '甲:葡萄,乙:橙子,丙:香蕉,丁:苹果', '甲:香蕉,乙:葡萄,丙:橙子,丁:苹果'],
    answer: '甲:葡萄,乙:橙子,丙:香蕉,丁:苹果',
    explanation: '丁在两端，丙要橙子。乙不要香蕉也不要在两头，所以乙只能在中间两个位置。甲不要苹果。尝试分配：丁在左端或右端。假设丁在左端(位置1)，则位置4是另一端。乙只能在位置2或3。丙要橙子，所以丙可能是位置2、3或4。逐步推理，如果甲不要苹果，那么甲可能是香蕉或葡萄或橙子... 最终符合所有条件的分配是：甲:葡萄,乙:橙子,丙:香蕉,丁:苹果。',
    difficulty: PUZZLE_DIFFICULTY.HARD,
    category: 'allocation',
    hint: '画一个表格，列出每个人的可能选择，逐步排除'
  }
]

// ============================================================================
// Mock Data: Debate Topics
// ============================================================================

const MOCK_DEBATE_TOPICS = [
  {
    id: 'debate_1',
    title: '小学生应该每天做作业吗？',
    proPoints: ['巩固当天学习内容', '培养自律习惯', '帮助家长了解学习情况'],
    conPoints: ['减少玩耍和休息时间', '可能产生厌学情绪', '限制课外活动'],
    logicFallacies: [
      { type: 'ad-hominem', description: '人身攻击：说对方是"不想学习的孩子"', critical: true },
      { type: 'straw-man', description: '稻草人：歪曲对方观点', critical: true },
      { type: 'false-dilemma', description: '虚假两难：只有"做作业"和"不做作业"两种选择', critical: true }
    ],
    difficulty: PUZZLE_DIFFICULTY.EASY
  },
  {
    id: 'debate_2',
    title: '是否应该禁止小学生使用手机？',
    proPoints: ['防止沉迷游戏', '保护视力健康', '减少网络风险'],
    conPoints: ['方便家长联系', '学习辅助工具', '培养自律能力'],
    logicFallacies: [
      { type: 'slippery-slope', description: '滑坡谬误：今天用手机，明天就会犯罪', critical: true },
      { type: 'bandwagon', description: '从众心理：大家都在禁止', critical: false },
      { type: 'appeal-to-authority', description: '权威谬误：专家说不好就是不好', critical: true }
    ],
    difficulty: PUZZLE_DIFFICULTY.MEDIUM
  },
  {
    id: 'debate_3',
    title: '是否应该给小学生零花钱？',
    proPoints: ['学习理财观念', '培养独立能力', '理解金钱价值'],
    conPoints: ['可能乱花钱', '增加家庭负担', '产生攀比心理'],
    logicFallacies: [
      { type: 'false-cause', description: '虚假因果：给零花钱就会乱花', critical: true },
      { type: 'oversimplification', description: '过度简化：有钱就会变坏', critical: true },
      { type: 'circular-reasoning', description: '循环论证：因为需要所以需要', critical: false }
    ],
    difficulty: PUZZLE_DIFFICULTY.MEDIUM
  },
  {
    id: 'debate_4',
    title: '是否应该取消考试？',
    proPoints: ['减少学生压力', '更注重综合能力', '培养创造力'],
    conPoints: ['无法检验学习效果', '失去学习目标', '不公平评价方式'],
    logicFallacies: [
      { type: 'either-or', description: '非此即彼：要么考试要么完全取消', critical: true },
      { type: 'appeal-to-emotion', description: '诉诸情感：学生们太痛苦了', critical: false },
      { type: 'hasty-generalization', description: '草率归纳：一个学生考不好就说考试没用', critical: true }
    ],
    difficulty: PUZZLE_DIFFICULTY.HARD
  }
]

// ============================================================================
// Mock Data: Decision Scenarios
// ============================================================================

const MOCK_DECISION_SCENARIOS = [
  {
    id: 'decision_1',
    title: '考试没考好怎么办？',
    type: DECISION_TYPE.SIMPLE,
    situation: '这次数学考试只得了70分，比上次退步了。',
    options: [
      { id: 'a', text: '把试卷藏起来，不让家长知道', consequence: '暂时没问题，但问题会积累，最终更严重', score: 1 },
      { id: 'b', text: '主动告诉家长，分析原因，制定改进计划', consequence: '可能短期受批评，但能真正进步', score: 5 },
      { id: 'c', text: '怪老师出题太难', consequence: '不反思就无法进步', score: 2 }
    ],
    analysis: '诚实面对问题是成长的第一步。通过分析失败的原因，可以找到改进的方法。',
    difficulty: PUZZLE_DIFFICULTY.EASY
  },
  {
    id: 'decision_2',
    title: '朋友邀请你逃课去玩',
    type: DECISION_TYPE.COMPLEX,
    situation: '好朋友小强悄悄告诉你，今天下午有一节不重要的课，邀请你一起逃课去打游戏。还说大家都不会发现的。',
    options: [
      { id: 'a', text: '好朋友邀请不好拒绝，一起去', consequence: '违反纪律，可能被发现，影响学业和信任', score: 1 },
      { id: 'b', text: '拒绝小强，但告诉老师', consequence: '可能失去朋友，但维护了纪律和自己', score: 3 },
      { id: 'c', text: '拒绝小强，但替他保密，课后一起玩', consequence: '既坚持原则，又维护友谊', score: 5 },
      { id: 'd', text: '假装答应，然后告诉家长', consequence: '需要家长帮助处理，情况可能复杂化', score: 4 }
    ],
    analysis: '既要坚持原则（不逃课），又要考虑如何维护友谊。需要权衡短期关系和长期影响。',
    difficulty: PUZZLE_DIFFICULTY.MEDIUM
  },
  {
    id: 'decision_3',
    title: '发现同学偷东西怎么办？',
    type: DECISION_TYPE.ETHICAL,
    situation: '你看到班上的小军偷偷把别人的铅笔盒放进自己的书包。那是你的好朋友小明的铅笔盒，是他妈妈出差时特意买给他的。',
    options: [
      { id: 'a', text: '当场大声喊"小军偷东西"', consequence: '可能让小军很没面子，产生对抗', score: 2 },
      { id: 'b', text: '假装没看见', consequence: '小军可能再犯，小明会失去心爱的东西', score: 1 },
      { id: 'c', text: '课后私下找小军，告诉他这样做不对，鼓励他放回去', consequence: '给小军改过的机会，保护他的尊严', score: 5 },
      { id: 'd', text: '直接告诉老师', consequence: '解决问题，但可能伤害小军', score: 3 }
    ],
    analysis: '处理道德困境时，既要维护正义，也要考虑如何最小化伤害。给犯错的人改正的机会往往比直接惩罚更有效。',
    difficulty: PUZZLE_DIFFICULTY.HARD
  },
  {
    id: 'decision_4',
    title: '竞选班干部如何表现？',
    type: DECISION_TYPE.COMPLEX,
    situation: '班级要选举班长，你想参加竞选。但你的好朋友小丽也很想当，而且她学习比你好，人缘也更广。你应该如何准备竞选演讲？',
    options: [
      { id: 'a', text: '在演讲中说小丽的坏话，让大家不要选她', consequence: '短期可能有效，但伤害友谊，失去信誉', score: 1 },
      { id: 'b', text: '实事求是地展示自己的优势，不攻击小丽', consequence: '公平竞争，无论结果如何都保持尊严', score: 5 },
      { id: 'c', text: '承诺给大家发礼物来拉票', consequence: '违反选举公平原则，被发现会很尴尬', score: 2 },
      { id: 'd', text: '退出竞选，让小丽当选', consequence: '失去展示自己的机会', score: 3 }
    ],
    analysis: '公平的竞争展示了真正的能力。通过攻击对手获得的胜利不是真正的胜利。',
    difficulty: PUZZLE_DIFFICULTY.MEDIUM
  }
]

// ============================================================================
// Store Definition
// ============================================================================

export const useCriticalThinkingStore = defineStore('criticalThinking', () => {
  const babyStore = useBabyStore()

  // ---------- State ----------
  const logicPuzzles = ref([])
  const debateTopics = ref([])
  const decisionScenarios = ref([])
  const logicProgress = ref({})  // { puzzleId: { completed, score, attempts } }
  const debateProgress = ref({})  // { topicId: { completed, side, quality } }
  const decisionProgress = ref({})  // { scenarioId: { completed, optionId, reflection } }
  const currentPuzzleId = ref(null)
  const currentTopicId = ref(null)
  const currentScenarioId = ref(null)

  // ---------- Computed ----------

  const currentBabyId = computed(() => babyStore.currentBabyId)

  // 已完成的谜题数
  const completedPuzzlesCount = computed(() => {
    return Object.values(logicProgress.value).filter(p => p.completed).length
  })

  // 已完成的辩论数
  const completedDebatesCount = computed(() => {
    return Object.values(debateProgress.value).filter(p => p.completed).length
  })

  // 已完成的决策数
  const completedDecisionsCount = computed(() => {
    return Object.values(decisionProgress.value).filter(p => p.completed).length
  })

  // 获取当前谜题
  const currentPuzzle = computed(() => {
    if (!currentPuzzleId.value) return null
    return logicPuzzles.value.find(p => p.id === currentPuzzleId.value)
  })

  // 获取当前辩论主题
  const currentTopic = computed(() => {
    if (!currentTopicId.value) return null
    return debateTopics.value.find(t => t.id === currentTopicId.value)
  })

  // 获取当前决策场景
  const currentScenario = computed(() => {
    if (!currentScenarioId.value) return null
    return decisionScenarios.value.find(s => s.id === currentScenarioId.value)
  })

  // 统计信息
  const statistics = computed(() => ({
    puzzlesCompleted: completedPuzzlesCount.value,
    puzzlesTotal: logicPuzzles.value.length,
    debatesCompleted: completedDebatesCount.value,
    debatesTotal: debateTopics.value.length,
    decisionsCompleted: completedDecisionsCount.value,
    decisionsTotal: decisionScenarios.value.length,
    totalScore: calculateTotalScore()
  }))

  // ---------- Helper Functions ----------

  const calculateTotalScore = () => {
    let score = 0
    Object.values(logicProgress.value).forEach(p => {
      if (p.completed) score += (p.score || 0)
    })
    Object.values(debateProgress.value).forEach(p => {
      if (p.completed) score += (p.score || 0)
    })
    Object.values(decisionProgress.value).forEach(p => {
      if (p.completed) score += (p.score || 0)
    })
    return score
  }

  const generateId = (prefix) => {
    return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`
  }

  // ---------- Init ----------

  const init = () => {
    loadPuzzles()
    loadDebates()
    loadDecisions()
    loadProgress()
  }

  // ---------- Puzzle Methods ----------

  const loadPuzzles = () => {
    logicPuzzles.value = MOCK_LOGIC_PUZZLES
  }

  const loadProgress = () => {
    try {
      const storedLogic = uni.getStorageSync(LOGIC_PROGRESS_KEY)
      if (storedLogic) logicProgress.value = JSON.parse(storedLogic)
      
      const storedDebate = uni.getStorageSync(DEBATE_PROGRESS_KEY)
      if (storedDebate) debateProgress.value = JSON.parse(storedDebate)
      
      const storedDecision = uni.getStorageSync(DECISION_PROGRESS_KEY)
      if (storedDecision) decisionProgress.value = JSON.parse(storedDecision)
    } catch (e) {
      console.error('[CriticalThinkingStore] 加载进度失败:', e)
    }
  }

  const saveLogicProgress = () => {
    try {
      uni.setStorageSync(LOGIC_PROGRESS_KEY, JSON.stringify(logicProgress.value))
    } catch (e) {
      console.error('[CriticalThinkingStore] 保存逻辑进度失败:', e)
    }
  }

  const saveDebateProgress = () => {
    try {
      uni.setStorageSync(DEBATE_PROGRESS_KEY, JSON.stringify(debateProgress.value))
    } catch (e) {
      console.error('[CriticalThinkingStore] 保存辩论进度失败:', e)
    }
  }

  const saveDecisionProgress = () => {
    try {
      uni.setStorageSync(DECISION_PROGRESS_KEY, JSON.stringify(decisionProgress.value))
    } catch (e) {
      console.error('[CriticalThinkingStore] 保存决策进度失败:', e)
    }
  }

  const selectPuzzle = (puzzleId) => {
    currentPuzzleId.value = puzzleId
  }

  const submitPuzzleAnswer = (puzzleId, answer) => {
    const puzzle = logicPuzzles.value.find(p => p.id === puzzleId)
    if (!puzzle) return { correct: false }

    const correct = answer === puzzle.answer
    const progress = logicProgress.value[puzzleId] || { attempts: 0 }
    
    progress.attempts = (progress.attempts || 0) + 1
    progress.completed = correct
    progress.lastAnswer = answer
    progress.correct = correct
    
    if (correct) {
      // 根据尝试次数计算分数
      if (progress.attempts === 1) {
        progress.score = 3  // 一次答对满分
      } else if (progress.attempts === 2) {
        progress.score = 2
      } else {
        progress.score = 1
      }
      progress.completedAt = new Date().toISOString()
    }

    logicProgress.value[puzzleId] = progress
    saveLogicProgress()

    return {
      correct,
      explanation: puzzle.explanation,
      score: progress.score
    }
  }

  const getPuzzleProgress = (puzzleId) => {
    return logicProgress.value[puzzleId] || { completed: false, attempts: 0 }
  }

  // ---------- Debate Methods ----------

  const loadDebates = () => {
    debateTopics.value = MOCK_DEBATE_TOPICS
  }

  const selectTopic = (topicId) => {
    currentTopicId.value = topicId
  }

  const submitDebateArgument = (topicId, side, argument, identifyFallacy) => {
    const topic = debateTopics.value.find(t => t.id === topicId)
    if (!topic) return { quality: 0 }

    // 评估论证质量
    let quality = 0
    const correctlyIdentified = []
    const missedFallacies = []
    
    if (identifyFallacy && identifyFallacy.length > 0) {
      topic.logicFallacies.forEach(f => {
        if (f.critical) {
          const found = identifyFallacy.find(fi => fi.type === f.type)
          if (found) {
            quality += 2
            correctlyIdentified.push(f)
          } else {
            missedFallacies.push(f)
          }
        }
      })
    }

    // 基础分：提交了论证
    quality += 1

    // 扣分：如果识别错了谬误
    if (identifyFallacy) {
      identifyFallacy.forEach(fi => {
        const isRealFallacy = topic.logicFallacies.find(f => f.type === fi.type)
        if (!isRealFallacy) {
          quality -= 1
        }
      })
    }

    quality = Math.max(0, Math.min(quality, 10))

    const progress = debateProgress.value[topicId] || {}
    progress.side = side
    progress.argument = argument
    progress.identifiedFallacies = correctlyIdentified
    progress.missedFallacies = missedFallacies
    progress.quality = quality
    progress.completed = true
    progress.completedAt = new Date().toISOString()

    debateProgress.value[topicId] = progress
    saveDebateProgress()

    return {
      quality,
      correctlyIdentified,
      missedFallacies
    }
  }

  const getDebateProgress = (topicId) => {
    return debateProgress.value[topicId] || { completed: false }
  }

  // ---------- Decision Methods ----------

  const loadDecisions = () => {
    decisionScenarios.value = MOCK_DECISION_SCENARIOS
  }

  const selectScenario = (scenarioId) => {
    currentScenarioId.value = scenarioId
  }

  const submitDecision = (scenarioId, optionId, reflection) => {
    const scenario = decisionScenarios.value.find(s => s.id === scenarioId)
    if (!scenario) return { score: 0 }

    const option = scenario.options.find(o => o.id === optionId)
    const score = option ? option.score : 0

    const progress = decisionProgress.value[scenarioId] || {}
    progress.optionId = optionId
    progress.reflection = reflection
    progress.score = score
    progress.completed = true
    progress.completedAt = new Date().toISOString()

    decisionProgress.value[scenarioId] = progress
    saveDecisionProgress()

    return {
      score,
      consequence: option?.consequence || '',
      analysis: scenario.analysis
    }
  }

  const getDecisionProgress = (scenarioId) => {
    return decisionProgress.value[scenarioId] || { completed: false }
  }

  const getScenariosByType = (type) => {
    return decisionScenarios.value.filter(s => s.type === type)
  }

  const getPuzzlesByDifficulty = (difficulty) => {
    return logicPuzzles.value.filter(p => p.difficulty === difficulty)
  }

  // ---------- Reset ----------

  const resetProgress = () => {
    logicProgress.value = {}
    debateProgress.value = {}
    decisionProgress.value = {}
    saveLogicProgress()
    saveDebateProgress()
    saveDecisionProgress()
  }

  return {
    // State
    logicPuzzles,
    debateTopics,
    decisionScenarios,
    logicProgress,
    debateProgress,
    decisionProgress,
    currentPuzzleId,
    currentTopicId,
    currentScenarioId,
    
    // Computed
    currentBabyId,
    completedPuzzlesCount,
    completedDebatesCount,
    completedDecisionsCount,
    currentPuzzle,
    currentTopic,
    currentScenario,
    statistics,
    
    // Methods
    init,
    selectPuzzle,
    submitPuzzleAnswer,
    getPuzzleProgress,
    selectTopic,
    submitDebateArgument,
    getDebateProgress,
    selectScenario,
    submitDecision,
    getDecisionProgress,
    getScenariosByType,
    getPuzzlesByDifficulty,
    resetProgress
  }
})
