/**
 * V101 Math Agent
 * 数学Agent - 加减法/乘法/除法游戏化教学、错题重练与难度自适应
 */

import { AGENT_TYPES, createResponse, createLearningFeedback, DIFFICULTY_LEVELS, TASK_STATUS } from './agentProtocol.js'
import { generateProblem, checkAnswer, MATH_OPERATIONS, DIFFICULTY_LEVELS as SERVICE_DIFFICULTY } from '../mathService.js'

// ============================================================================
// MathAgent状态
// ============================================================================

const mathAgentState = {
  currentProblem: null,
  problemHistory: [],
  wrongAnswers: [],
  difficultyLevel: 'INTERMEDIATE',
  correctCount: 0,
  totalAttempts: 0,
  streakCount: 0,
  sessionStartTime: null
}

// ============================================================================
// 处理请求
// ============================================================================

export const handleRequest = async (request) => {
  const { action, data } = request.payload
  
  mathAgentState.sessionStartTime = mathAgentState.sessionStartTime || Date.now()
  
  switch (action) {
    case 'addition':
    case 'subtraction':
    case 'multiplication':
    case 'division':
      return generateMathProblem(action, data)
    case 'general':
      return getGeneralMathResponse(data)
    case 'get_next':
      return generateMathProblem(data.operation || 'addition', data)
    case 'check_answer':
      return checkUserAnswer(data.userAnswer, data.problemId)
    case 'review_wrong':
      return getWrongAnswerReview()
    case 'adjust_difficulty':
      return adjustDifficulty(data.level)
    default:
      return createResponse(request.id, false, null, { code: 'UNKNOWN_ACTION', message: '未知操作' })
  }
}

// ============================================================================
// 处理转介
// ============================================================================

export const handleTransfer = async (transferMsg) => {
  const { task, context } = transferMsg.payload
  
  // 恢复上下文
  if (context) {
    mathAgentState.difficultyLevel = context.difficultyLevel || 'INTERMEDIATE'
    if (context.wrongAnswers) {
      mathAgentState.wrongAnswers = context.wrongAnswers
    }
  }
  
  // 继续执行任务
  return handleRequest({
    id: transferMsg.id,
    payload: {
      action: task.action,
      data: { ...task.data, context }
    }
  })
}

// ============================================================================
// 生成数学问题
// ============================================================================

const generateMathProblem = (operation, data = {}) => {
  // 难度映射
  const difficultyMap = {
    'BEGINNER': 'easy',
    'INTERMEDIATE': 'medium',
    'ADVANCED': 'hard',
    'EXPERT': 'expert'
  }
  
  const serviceDifficulty = difficultyMap[mathAgentState.difficultyLevel] || 'medium'
  
  // 生成问题
  const problem = generateProblem(operation, serviceDifficulty)
  
  // 存储当前问题
  mathAgentState.currentProblem = {
    ...problem,
    status: TASK_STATUS.IN_PROGRESS,
    generatedAt: Date.now()
  }
  
  // 构建游戏化响应
  const responseData = {
    problem: {
      id: problem.id,
      a: problem.a,
      b: problem.b,
      operation: problem.operation,
      symbol: problem.symbol
    },
    difficulty: mathAgentState.difficultyLevel,
    operationName: MATH_OPERATIONS[operation]?.name || '数学',
    streakCount: mathAgentState.streakCount,
    correctCount: mathAgentState.correctCount,
    totalAttempts: mathAgentState.totalAttempts,
    encouragement: getEncouragement()
  }
  
  return createResponse('math_' + Date.now(), true, responseData)
}

// ============================================================================
// 检查答案
// ============================================================================

const checkUserAnswer = (userAnswer, problemId) => {
  if (!mathAgentState.currentProblem || mathAgentState.currentProblem.id !== problemId) {
    return createResponse(problemId, false, null, { code: 'INVALID_PROBLEM', message: '问题ID无效' })
  }
  
  const problem = mathAgentState.currentProblem
  const isCorrect = checkAnswer(problem, userAnswer)
  
  // 更新统计
  mathAgentState.totalAttempts++
  mathAgentState.correctCount += isCorrect ? 1 : 0
  mathAgentState.streakCount = isCorrect ? mathAgentState.streakCount + 1 : 0
  
  // 记录错题
  if (!isCorrect) {
    mathAgentState.wrongAnswers.push({
      ...problem,
      userAnswer: parseInt(userAnswer),
      correctAnswer: problem.answer,
      answeredAt: Date.now()
    })
  }
  
  // 保存历史
  mathAgentState.problemHistory.push({
    ...problem,
    userAnswer: parseInt(userAnswer),
    isCorrect,
    answeredAt: Date.now()
  })
  
  // 难度自适应
  autoAdjustDifficulty()
  
  // 构建反馈
  const feedbackData = {
    isCorrect,
    correctAnswer: problem.answer,
    userAnswer: parseInt(userAnswer),
    streakCount: mathAgentState.streakCount,
    correctCount: mathAgentState.correctCount,
    totalAttempts: mathAgentState.totalAttempts,
    accuracy: Math.round((mathAgentState.correctCount / mathAgentState.totalAttempts) * 100),
    feedback: isCorrect ? getPositiveFeedback() : getCorrectionFeedback(problem),
    shouldTransfer: !isCorrect && mathAgentState.wrongAnswers.length > 3
  }
  
  return createResponse(problemId, true, feedbackData)
}

// ============================================================================
// 错题重练
// ============================================================================

const getWrongAnswerReview = () => {
  if (mathAgentState.wrongAnswers.length === 0) {
    return createResponse('review_' + Date.now(), true, {
      message: '太棒了！没有错题需要复习～',
      problems: []
    })
  }
  
  // 取最近3道错题
  const reviewProblems = mathAgentState.wrongAnswers.slice(-3)
  
  return createResponse('review_' + Date.now(), true, {
    problems: reviewProblems.map(p => ({
      id: p.id,
      a: p.a,
      b: p.b,
      operation: p.operation,
      symbol: p.symbol,
      correctAnswer: p.answer,
      userAnswer: p.userAnswer
    })),
    count: reviewProblems.length,
    totalWrong: mathAgentState.wrongAnswers.length
  })
}

// ============================================================================
// 难度调整
// ============================================================================

const adjustDifficulty = (level) => {
  if (!DIFFICULTY_LEVELS[level]) {
    return createResponse('difficulty_' + Date.now(), false, null, { code: 'INVALID_LEVEL', message: '无效难度级别' })
  }
  
  mathAgentState.difficultyLevel = level
  
  return createResponse('difficulty_' + Date.now(), true, {
    level: mathAgentState.difficultyLevel,
    message: `难度已调整为 ${level}`
  })
}

// ============================================================================
// 难度自适应
// ============================================================================

const autoAdjustDifficulty = () => {
  const accuracy = mathAgentState.correctCount / mathAgentState.totalAttempts
  
  // 连续答对5题且准确率>90%，提高难度
  if (mathAgentState.streakCount >= 5 && accuracy > 0.9) {
    const levelOrder = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']
    const currentIndex = levelOrder.indexOf(mathAgentState.difficultyLevel)
    if (currentIndex < levelOrder.length - 1) {
      mathAgentState.difficultyLevel = levelOrder[currentIndex + 1]
    }
  }
  
  // 连续答错3题且准确率<60%，降低难度
  const recentWrong = mathAgentState.problemHistory.slice(-3).filter(p => !p.isCorrect).length
  if (recentWrong >= 3 && accuracy < 0.6) {
    const levelOrder = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']
    const currentIndex = levelOrder.indexOf(mathAgentState.difficultyLevel)
    if (currentIndex > 0) {
      mathAgentState.difficultyLevel = levelOrder[currentIndex - 1]
    }
  }
}

// ============================================================================
// 获取鼓励语
// ============================================================================

const getEncouragement = () => {
  const encouragements = [
    '准备好了吗？来挑战一下吧！🎯',
    '数学小天才，是时候展现真正的技术了！🧮',
    '加油！相信你能做对！💪',
    '让我们一起探索数学的奥秘吧！✨',
    '开动脑筋，想一想～ 🧠'
  ]
  return encouragements[Math.floor(Math.random() * encouragements.length)]
}

// ============================================================================
// 获取正面反馈
// ============================================================================

const getPositiveFeedback = () => {
  const feedbacks = [
    '太棒了！回答正确！🌟',
    '厉害！继续保持！🎉',
    '正确！你真是个数学小能手！⭐',
    '答对了！太聪明了！👏',
    '完美！继续加油！💯'
  ]
  return feedbacks[Math.floor(Math.random() * feedbacks.length)]
}

// ============================================================================
// 获取纠错反馈
// ============================================================================

const getCorrectionFeedback = (problem) => {
  return `其实答案是 ${problem.answer} 哦～ 让我帮你分析一下：${problem.a} ${problem.symbol} ${problem.b} = ${problem.answer}。别灰心，继续努力！💪`
}

// ============================================================================
// 通用数学响应
// ============================================================================

const getGeneralMathResponse = (data) => {
  return createResponse('math_general_' + Date.now(), true, {
    message: '数学Agent准备好啦！你想练习哪种运算呢？',
    options: [
      { operation: 'addition', name: '加法', icon: '➕' },
      { operation: 'subtraction', name: '减法', icon: '➖' },
      { operation: 'multiplication', name: '乘法', icon: '✖️' },
      { operation: 'division', name: '除法', icon: '➗' }
    ],
    recentTopics: mathAgentState.problemHistory.slice(-5).map(p => p.operation)
  })
}

// ============================================================================
// 获取Agent状态
// ============================================================================

export const getMathAgentStatus = () => {
  return {
    ...mathAgentState,
    accuracy: mathAgentState.totalAttempts > 0 
      ? Math.round((mathAgentState.correctCount / mathAgentState.totalAttempts) * 100) 
      : 0
  }
}

// ============================================================================
// 重置Agent状态
// ============================================================================

export const resetMathAgent = () => {
  mathAgentState.currentProblem = null
  mathAgentState.problemHistory = []
  mathAgentState.wrongAnswers = []
  mathAgentState.difficultyLevel = 'INTERMEDIATE'
  mathAgentState.correctCount = 0
  mathAgentState.totalAttempts = 0
  mathAgentState.streakCount = 0
  mathAgentState.sessionStartTime = null
}

// ============================================================================
// 导出MathAgent单例
// ============================================================================

export const MathAgent = {
  handleRequest,
  handleTransfer,
  getStatus: getMathAgentStatus,
  reset: resetMathAgent
}

export default MathAgent