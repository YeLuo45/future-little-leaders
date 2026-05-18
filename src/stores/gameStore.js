import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import gameService from '@/services/gameService.js'

/**
 * V55 Game Store
 * 协作游戏状态管理
 */
export const useGameStore = defineStore('game', () => {
  // 协作解谜状态
  const coopProgress = ref(null)
  const currentPuzzle = ref(null)
  const isLoading = ref(false)

  // 团队挑战状态
  const teamChallenges = ref([])

  // 棋盘游戏状态
  const boardGames = ref([])
  const currentGameSession = ref(null)

  // 实时对战状态
  const battleSession = ref(null)
  const battleHistory = ref([])

  // 排行榜
  const leaderboard = ref([])

  // 初始化
  const init = () => {
    loadCoopProgress()
    loadTeamChallenges()
    loadBoardGames()
    loadBattleHistory()
    loadLeaderboard()
  }

  // 加载协作进度
  const loadCoopProgress = () => {
    coopProgress.value = gameService.getCoopProgress()
    currentPuzzle.value = gameService.getCurrentPuzzle()
  }

  // 加载团队挑战
  const loadTeamChallenges = () => {
    teamChallenges.value = gameService.getTeamChallenges()
  }

  // 加载棋盘游戏
  const loadBoardGames = () => {
    boardGames.value = gameService.getBoardGames()
  }

  // 加载对战历史
  const loadBattleHistory = () => {
    battleHistory.value = gameService.getBattleHistory()
  }

  // 加载排行榜
  const loadLeaderboard = () => {
    leaderboard.value = gameService.getFamilyLeaderboard()
  }

  // 解答谜题
  const submitPuzzleAnswer = (answer, memberName = '我') => {
    if (!currentPuzzle.value) return null

    isLoading.value = true
    try {
      const result = gameService.solvePuzzle(currentPuzzle.value.id, answer, memberName)
      if (result.success) {
        loadCoopProgress()
        currentPuzzle.value = gameService.getCurrentPuzzle()
        loadLeaderboard()
        uni.$emit('puzzleSolved', result)
      }
      return result
    } finally {
      isLoading.value = false
    }
  }

  // 参与团队挑战
  const joinChallenge = (challengeId, memberName) => {
    const challenge = gameService.joinTeamChallenge(challengeId, memberName)
    if (challenge) {
      loadTeamChallenges()
    }
    return challenge
  }

  // 更新挑战进度
  const updateChallengeProgress = (challengeId, progress, memberName) => {
    const challenge = gameService.updateTeamChallengeProgress(challengeId, progress, memberName)
    if (challenge) {
      loadTeamChallenges()
      loadLeaderboard()
    }
    return challenge
  }

  // 开始棋盘游戏
  const startBoardGame = (gameId, players) => {
    currentGameSession.value = gameService.startBoardGame(gameId, players)
    return currentGameSession.value
  }

  // 移动棋子
  const movePiece = (playerIndex, steps) => {
    if (!currentGameSession.value) return null
    currentGameSession.value = gameService.moveBoardPiece(currentGameSession.value, playerIndex, steps)
    return currentGameSession.value
  }

  // 完成棋盘游戏
  const finishGame = (winner, scores) => {
    if (!currentGameSession.value) return null
    const game = gameService.finishBoardGame(currentGameSession.value, winner, scores)
    currentGameSession.value = null
    loadBoardGames()
    loadLeaderboard()
    return game
  }

  // 开始实时对战
  const startBattle = (battleType, players) => {
    battleSession.value = gameService.startRealTimeBattle(battleType, players)
    return battleSession.value
  }

  // 更新对战分数
  const submitBattleAnswer = (playerIndex, points) => {
    if (!battleSession.value) return null
    battleSession.value = gameService.updateBattleScore(battleSession.value, playerIndex, points)
    loadBattleHistory()
    if (battleSession.value && battleSession.value.finishedAt) {
      loadLeaderboard()
    }
    return battleSession.value
  }

  // 计算属性 - 协作解谜
  const hasMorePuzzles = computed(() => currentPuzzle.value !== null)

  const coopStats = computed(() => {
    if (!coopProgress.value) return { score: 0, solved: 0, total: 0 }
    return {
      score: coopProgress.value.totalScore,
      solved: coopProgress.value.puzzlesSolved,
      total: gameService.COOP_PUZZLES.length
    }
  })

  // 计算属性 - 团队挑战
  const activeChallenges = computed(() => {
    if (!teamChallenges.value) return []
    return teamChallenges.value.filter(c => !c.completed)
  })

  const completedChallenges = computed(() => {
    if (!teamChallenges.value) return []
    return teamChallenges.value.filter(c => c.completed)
  })

  const challengeStats = computed(() => {
    if (!teamChallenges.value) return { active: 0, completed: 0, total: 0 }
    return {
      active: teamChallenges.value.filter(c => !c.completed).length,
      completed: teamChallenges.value.filter(c => c.completed).length,
      total: teamChallenges.value.length
    }
  })

  // 计算属性 - 棋盘游戏
  const boardGameStats = computed(() => {
    if (!boardGames.value) return []
    return boardGames.value.map(g => ({
      id: g.id,
      name: g.name,
      played: g.played,
      wins: g.wins,
      winRate: g.played > 0 ? Math.round((g.wins / g.played) * 100) : 0
    }))
  })

  // 计算属性 - 实时对战
  const recentBattles = computed(() => {
    return battleHistory.value.slice(0, 10)
  })

  const battleStats = computed(() => {
    if (!battleHistory.value.length) return { total: 0, wins: 0, winRate: 0 }
    return {
      total: battleHistory.value.length,
      wins: battleHistory.value.filter(b => b.winner === '我').length,
      winRate: 0
    }
  })

  // 重置数据
  const resetAllData = () => {
    gameService.resetGameData()
    loadCoopProgress()
    loadTeamChallenges()
    loadBoardGames()
    loadBattleHistory()
    loadLeaderboard()
    currentGameSession.value = null
    battleSession.value = null
  }

  return {
    // 状态
    coopProgress,
    currentPuzzle,
    isLoading,
    teamChallenges,
    boardGames,
    currentGameSession,
    battleSession,
    battleHistory,
    leaderboard,

    // 计算属性 - 协作解谜
    hasMorePuzzles,
    coopStats,

    // 计算属性 - 团队挑战
    activeChallenges,
    completedChallenges,
    challengeStats,

    // 计算属性 - 棋盘游戏
    boardGameStats,

    // 计算属性 - 实时对战
    recentBattles,
    battleStats,

    // 方法
    init,
    loadCoopProgress,
    loadTeamChallenges,
    loadBoardGames,
    loadBattleHistory,
    loadLeaderboard,
    submitPuzzleAnswer,
    joinChallenge,
    updateChallengeProgress,
    startBoardGame,
    movePiece,
    finishGame,
    startBattle,
    submitBattleAnswer,
    resetAllData
  }
})
