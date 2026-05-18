/**
 * V55 Game Service
 * 协作游戏服务 - 协作解谜、团队挑战、棋盘游戏、实时对战
 */

// 存储键
const GAME_DATA_KEY = 'game_data'
const COOP_PROGRESS_KEY = 'coop_progress'
const TEAM_CHALLENGE_KEY = 'team_challenge'
const BOARD_GAME_KEY = 'board_game'
const BATTLE_HISTORY_KEY = 'battle_history'

// 游戏类型
export const GAME_TYPES = {
  COOP_PUZZLE: 'coop_puzzle',
  TEAM_CHALLENGE: 'team_challenge',
  BOARD_GAME: 'board_game',
  REAL_TIME_BATTLE: 'real_time_battle'
}

// 协作解谜题目库
export const COOP_PUZZLES = [
  {
    id: 'puzzle_001',
    title: '家庭密码',
    description: '找出数字规律',
    difficulty: 1,
    type: 'math',
    hint: '每个数字是前两个数字的和',
    solution: '34',
    exp: 20,
    points: 50
  },
  {
    id: 'puzzle_002',
    title: '图形推理',
    description: '找出下一个图形',
    difficulty: 2,
    type: 'pattern',
    hint: '注意边的数量',
    solution: '五边形',
    exp: 30,
    points: 80
  },
  {
    id: 'puzzle_003',
    title: '词语接龙',
    description: '家庭成员轮流接龙',
    difficulty: 1,
    type: 'word',
    hint: '注意同一个字开头',
    solution: '完成',
    exp: 15,
    points: 40
  },
  {
    id: 'puzzle_004',
    title: '逻辑推理',
    description: '谁拿走了玩具',
    difficulty: 3,
    type: 'logic',
    hint: '用排除法',
    solution: '哥哥',
    exp: 40,
    points: 100
  },
  {
    id: 'puzzle_005',
    title: '数学迷宫',
    description: '走出数学迷宫',
    difficulty: 2,
    type: 'math',
    hint: '每步都是加3',
    solution: '右左右下',
    exp: 25,
    points: 70
  }
]

// 团队挑战任务
export const TEAM_CHALLENGES = [
  {
    id: 'challenge_001',
    title: '家务接力',
    description: '家庭成员轮流完成家务',
    type: 'relay',
    targetCount: 5,
    expReward: 50,
    pointsReward: 100,
    members: ['爸爸', '妈妈', '孩子']
  },
  {
    id: 'challenge_002',
    title: '阅读接力',
    description: '一起读完一本书',
    type: 'relay',
    targetCount: 10,
    expReward: 80,
    pointsReward: 150,
    members: ['爸爸', '妈妈', '孩子']
  },
  {
    id: 'challenge_003',
    title: '运动挑战',
    description: '家庭运动总时长',
    type: 'accumulate',
    targetMinutes: 120,
    expReward: 60,
    pointsReward: 120,
    members: ['爸爸', '妈妈', '孩子']
  },
  {
    id: 'challenge_004',
    title: '早起打卡',
    description: '连续7天早起',
    type: 'streak',
    targetDays: 7,
    expReward: 100,
    pointsReward: 200,
    members: ['爸爸', '妈妈', '孩子']
  }
]

// 棋盘游戏配置
export const BOARD_GAMES = [
  {
    id: 'board_001',
    name: '知识大富翁',
    description: '通过回答问题前进',
    icon: '🎲',
    color: '#FF6B6B',
    squares: 30,
    questionTypes: ['math', 'science', 'art', 'sports', 'music']
  },
  {
    id: 'board_002',
    name: '家庭探险',
    description: '家庭成员合作探险',
    icon: '🗺️',
    color: '#4ECDC4',
    squares: 24,
    questionTypes: ['logic', 'word', 'pattern']
  },
  {
    id: 'board_003',
    name: '成长之路',
    description: '记录成长足迹',
    icon: '🌟',
    color: '#FFE66D',
    squares: 20,
    questionTypes: ['math', 'logic']
  }
]

// 实时对战类型
export const BATTLE_TYPES = {
  QUIZ: 'quiz',
  SPEED: 'speed',
  ACCURACY: 'accuracy'
}

// 获取协作进度
export const getCoopProgress = () => {
  try {
    const stored = uni.getStorageSync(COOP_PROGRESS_KEY)
    return stored ? JSON.parse(stored) : initCoopProgress()
  } catch (e) {
    return initCoopProgress()
  }
}

// 初始化协作进度
export const initCoopProgress = () => {
  const progress = {
    totalScore: 0,
    puzzlesSolved: 0,
    currentPuzzleIndex: 0,
    history: [],
    teamMembers: [],
    familyScore: 0
  }
  uni.setStorageSync(COOP_PROGRESS_KEY, JSON.stringify(progress))
  return progress
}

// 保存协作进度
export const saveCoopProgress = (progress) => {
  uni.setStorageSync(COOP_PROGRESS_KEY, JSON.stringify(progress))
}

// 获取当前解谜题目
export const getCurrentPuzzle = () => {
  const progress = getCoopProgress()
  if (progress.currentPuzzleIndex >= COOP_PUZZLES.length) {
    return null
  }
  return COOP_PUZZLES[progress.currentPuzzleIndex]
}

// 解答谜题
export const solvePuzzle = (puzzleId, answer, memberName) => {
  const puzzle = COOP_PUZZLES.find(p => p.id === puzzleId)
  if (!puzzle) return { success: false, message: '题目不存在' }

  const progress = getCoopProgress()
  const isCorrect = answer.trim() === puzzle.solution.trim()

  if (isCorrect) {
    progress.puzzlesSolved++
    progress.totalScore += puzzle.points
    progress.familyScore += puzzle.points
    progress.currentPuzzleIndex++
    progress.history.push({
      puzzleId,
      answer,
      correct: true,
      memberName,
      solvedAt: new Date().toISOString()
    })
    saveCoopProgress(progress)
    return {
      success: true,
      exp: puzzle.exp,
      points: puzzle.points,
      message: '回答正确！',
      isLastPuzzle: progress.currentPuzzleIndex >= COOP_PUZZLES.length
    }
  } else {
    progress.history.push({
      puzzleId,
      answer,
      correct: false,
      memberName,
      solvedAt: new Date().toISOString()
    })
    saveCoopProgress(progress)
    return {
      success: false,
      message: '回答错误，再试试吧！',
      hint: puzzle.hint
    }
  }
}

// 获取团队挑战数据
export const getTeamChallenges = () => {
  try {
    const stored = uni.getStorageSync(TEAM_CHALLENGE_KEY)
    return stored ? JSON.parse(stored) : initTeamChallenges()
  } catch (e) {
    return initTeamChallenges()
  }
}

// 初始化团队挑战
export const initTeamChallenges = () => {
  const challenges = TEAM_CHALLENGES.map(c => ({
    ...c,
    progress: 0,
    completed: false,
    completedBy: [],
    startedAt: null,
    finishedAt: null
  }))
  uni.setStorageSync(TEAM_CHALLENGE_KEY, JSON.stringify(challenges))
  return challenges
}

// 参与团队挑战
export const joinTeamChallenge = (challengeId, memberName) => {
  const challenges = getTeamChallenges()
  const challenge = challenges.find(c => c.id === challengeId)
  if (!challenge) return null

  if (!challenge.startedAt) {
    challenge.startedAt = new Date().toISOString()
  }
  if (!challenge.members.includes(memberName)) {
    challenge.members.push(memberName)
  }

  uni.setStorageSync(TEAM_CHALLENGE_KEY, JSON.stringify(challenges))
  return challenge
}

// 更新团队挑战进度
export const updateTeamChallengeProgress = (challengeId, progress, memberName) => {
  const challenges = getTeamChallenges()
  const challenge = challenges.find(c => c.id === challengeId)
  if (!challenge) return null

  challenge.progress = progress

  if (challenge.type === 'streak' && progress >= challenge.targetDays) {
    challenge.completed = true
    challenge.finishedAt = new Date().toISOString()
    if (!challenge.completedBy.includes(memberName)) {
      challenge.completedBy.push(memberName)
    }
  } else if (challenge.type === 'relay' && progress >= challenge.targetCount) {
    challenge.completed = true
    challenge.finishedAt = new Date().toISOString()
    if (!challenge.completedBy.includes(memberName)) {
      challenge.completedBy.push(memberName)
    }
  } else if (challenge.type === 'accumulate' && progress >= challenge.targetMinutes) {
    challenge.completed = true
    challenge.finishedAt = new Date().toISOString()
  }

  uni.setStorageSync(TEAM_CHALLENGE_KEY, JSON.stringify(challenges))
  return challenge
}

// 获取棋盘游戏数据
export const getBoardGames = () => {
  try {
    const stored = uni.getStorageSync(BOARD_GAME_KEY)
    return stored ? JSON.parse(stored) : initBoardGames()
  } catch (e) {
    return initBoardGames()
  }
}

// 初始化棋盘游戏
export const initBoardGames = () => {
  const games = BOARD_GAMES.map(g => ({
    ...g,
    played: 0,
    wins: 0,
    totalScore: 0,
    history: []
  }))
  uni.setStorageSync(BOARD_GAME_KEY, JSON.stringify(games))
  return games
}

// 开始棋盘游戏
export const startBoardGame = (gameId, players) => {
  const games = getBoardGames()
  const game = games.find(g => g.id === gameId)
  if (!game) return null

  const gameSession = {
    id: 'session_' + Date.now(),
    gameId,
    players,
    currentPlayerIndex: 0,
    positions: players.map(() => 0),
    scores: players.map(() => 0),
    startedAt: new Date().toISOString(),
    finishedAt: null,
    winner: null
  }

  return gameSession
}

// 移动棋盘位置
export const moveBoardPiece = (session, playerIndex, steps) => {
  if (!session) return null

  session.positions[playerIndex] += steps

  // 检查是否到达终点
  const game = BOARD_GAMES.find(g => g.id === session.gameId)
  if (game && session.positions[playerIndex] >= game.squares) {
    session.positions[playerIndex] = game.squares
    session.winner = session.players[playerIndex]
    session.finishedAt = new Date().toISOString()
  }

  // 切换到下一个玩家
  session.currentPlayerIndex = (playerIndex + 1) % session.players.length

  return session
}

// 完成棋盘游戏
export const finishBoardGame = (session, winner, scores) => {
  const games = getBoardGames()
  const game = games.find(g => g.id === session.gameId)
  if (!game) return null

  game.played++
  if (winner) {
    game.wins++
  }
  game.totalScore += scores.reduce((a, b) => a + b, 0)
  game.history.push({
    id: session.id,
    players: session.players,
    winner,
    scores,
    playedAt: new Date().toISOString()
  })

  uni.setStorageSync(BOARD_GAME_KEY, JSON.stringify(games))
  return game
}

// 获取对战历史
export const getBattleHistory = () => {
  try {
    const stored = uni.getStorageSync(BATTLE_HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    return []
  }
}

// 添加对战记录
export const addBattleRecord = (record) => {
  const history = getBattleHistory()
  history.unshift({
    id: 'battle_' + Date.now(),
    ...record,
    playedAt: new Date().toISOString()
  })
  // 只保留最近20条记录
  if (history.length > 20) {
    history.pop()
  }
  uni.setStorageSync(BATTLE_HISTORY_KEY, JSON.stringify(history))
  return history
}

// 开始实时对战
export const startRealTimeBattle = (battleType, players) => {
  const session = {
    id: 'battle_' + Date.now(),
    type: battleType,
    players,
    currentRound: 0,
    totalRounds: 5,
    scores: players.map(() => 0),
    startedAt: new Date().toISOString(),
    finishedAt: null,
    winner: null
  }
  return session
}

// 更新对战分数
export const updateBattleScore = (session, playerIndex, points) => {
  if (!session) return null
  session.scores[playerIndex] += points
  session.currentRound++

  if (session.currentRound >= session.totalRounds) {
    const maxScore = Math.max(...session.scores)
    const winnerIndex = session.scores.indexOf(maxScore)
    session.winner = session.players[winnerIndex]
    session.finishedAt = new Date().toISOString()

    addBattleRecord({
      type: session.type,
      players: session.players,
      winner: session.winner,
      scores: [...session.scores],
      rounds: session.totalRounds
    })
  }

  return session
}

// 获取家庭积分排行
export const getFamilyLeaderboard = () => {
  const coopProgress = getCoopProgress()
  const teamChallenges = getTeamChallenges()

  const leaderboard = coopProgress.teamMembers.map(member => {
    const memberPuzzles = coopProgress.history.filter(h => h.memberName === member)
    const completedChallenges = teamChallenges.filter(c =>
      c.completed && c.completedBy.includes(member)
    )

    return {
      name: member,
      score: memberPuzzles.filter(p => p.correct).length * 50 +
             completedChallenges.length * 100,
      puzzlesSolved: memberPuzzles.filter(p => p.correct).length,
      challengesCompleted: completedChallenges.length
    }
  })

  return leaderboard.sort((a, b) => b.score - a.score)
}

// 重置游戏数据
export const resetGameData = () => {
  uni.removeStorageSync(GAME_DATA_KEY)
  uni.removeStorageSync(COOP_PROGRESS_KEY)
  uni.removeStorageSync(TEAM_CHALLENGE_KEY)
  uni.removeStorageSync(BOARD_GAME_KEY)
  uni.removeStorageSync(BATTLE_HISTORY_KEY)
}

export default {
  GAME_TYPES,
  COOP_PUZZLES,
  TEAM_CHALLENGES,
  BOARD_GAMES,
  BATTLE_TYPES,
  getCoopProgress,
  initCoopProgress,
  saveCoopProgress,
  getCurrentPuzzle,
  solvePuzzle,
  getTeamChallenges,
  initTeamChallenges,
  joinTeamChallenge,
  updateTeamChallengeProgress,
  getBoardGames,
  initBoardGames,
  startBoardGame,
  moveBoardPiece,
  finishBoardGame,
  getBattleHistory,
  addBattleRecord,
  startRealTimeBattle,
  updateBattleScore,
  getFamilyLeaderboard,
  resetGameData
}
