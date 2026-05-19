/**
 * V69 Math Playground Store
 * 数学游乐场 Store - 数学游戏、速算训练、数学探索、成就系统
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import mathService from '@/services/mathService.js'

export const useMathStore = defineStore('math', () => {
  // =========================================================================
  // 状态
  // =========================================================================

  // 当前Tab
  const currentTab = ref('games') // games | mental | exploration | achievements

  // 数学游戏状态
  const currentGame = ref({
    isPlaying: false,
    currentProblem: null,
    problems: [],
    currentIndex: 0,
    correctAnswers: 0,
    startTime: null,
    endTime: null,
    operation: 'add',
    difficulty: 'easy'
  })

  // 速算训练状态
  const mentalMathState = ref({
    isRunning: false,
    duration: 60,
    timeLeft: 60,
    problems: [],
    currentIndex: 0,
    correctAnswers: 0,
    mode: 'timed_challenge' // timed_challenge | accuracy_training
  })

  // 数学游戏记录
  const gameRecords = ref([])

  // 速算记录
  const mentalMathRecords = ref([])

  // 数学探索话题
  const explorationTopics = ref([])

  // 成就
  const achievements = ref([])

  // 当前选中的话题
  const selectedTopic = ref(null)
  const selectedLesson = ref(null)

  // =========================================================================
  // 初始化
  // =========================================================================

  const init = () => {
    loadGameRecords()
    loadMentalMathRecords()
    loadExplorationTopics()
    loadAchievements()
  }

  // =========================================================================
  // 加载方法
  // =========================================================================

  const loadGameRecords = () => {
    gameRecords.value = mathService.getMathGames()
  }

  const loadMentalMathRecords = () => {
    mentalMathRecords.value = mathService.getMentalMathRecords()
  }

  const loadExplorationTopics = () => {
    explorationTopics.value = mathService.getExplorationTopics()
  }

  const loadAchievements = () => {
    achievements.value = mathService.getAchievements()
  }

  // =========================================================================
  // 数学游戏方法
  // =========================================================================

  const startGame = (operation, difficulty, questionCount = 10) => {
    const problems = []
    for (let i = 0; i < questionCount; i++) {
      problems.push(mathService.generateProblem(operation, difficulty))
    }
    
    currentGame.value = {
      isPlaying: true,
      currentProblem: problems[0],
      problems,
      currentIndex: 0,
      correctAnswers: 0,
      startTime: Date.now(),
      endTime: null,
      operation,
      difficulty
    }
  }

  const submitAnswer = (userAnswer) => {
    if (!currentGame.value.isPlaying || !currentGame.value.currentProblem) {
      return { correct: false, isFinished: false }
    }

    const isCorrect = mathService.checkAnswer(currentGame.value.currentProblem, userAnswer)
    
    if (isCorrect) {
      currentGame.value.correctAnswers++
    }

    // Move to next problem
    const nextIndex = currentGame.value.currentIndex + 1
    
    if (nextIndex >= currentGame.value.problems.length) {
      // Game finished
      currentGame.value.endTime = Date.now()
      currentGame.value.isPlaying = false
      currentGame.value.currentProblem = null
      
      // Save record
      const timeSpent = Math.round((currentGame.value.endTime - currentGame.value.startTime) / 1000)
      const stars = calculateStars(currentGame.value.correctAnswers, currentGame.value.problems.length)
      
      const record = mathService.saveMathGame({
        type: 'arithmetic',
        operation: currentGame.value.operation,
        difficulty: currentGame.value.difficulty,
        totalQuestions: currentGame.value.problems.length,
        correctAnswers: currentGame.value.correctAnswers,
        score: currentGame.value.correctAnswers * 10,
        timeSpent,
        stars
      })
      
      if (record) {
        loadGameRecords()
        // Check achievements
        checkGameAchievements()
      }
      
      return { correct: isCorrect, isFinished: true, record }
    } else {
      currentGame.value.currentIndex = nextIndex
      currentGame.value.currentProblem = currentGame.value.problems[nextIndex]
      return { correct: isCorrect, isFinished: false }
    }
  }

  const calculateStars = (correct, total) => {
    const percentage = correct / total
    if (percentage >= 0.9) return 3
    if (percentage >= 0.7) return 2
    if (percentage >= 0.5) return 1
    return 0
  }

  const endGame = () => {
    currentGame.value.isPlaying = false
    currentGame.value.currentProblem = null
  }

  const checkGameAchievements = () => {
    // Check for first game achievement
    mathService.unlockAchievement('ach_1')
    loadAchievements()
  }

  // =========================================================================
  // 速算训练方法
  // =========================================================================

  const startMentalMath = (mode, difficulty, duration) => {
    const problems = []
    // Generate enough problems for the session
    const count = mode === 'timed_challenge' ? Math.ceil(duration / 3) : 30
    
    for (let i = 0; i < count; i++) {
      const operations = ['add', 'subtract', 'multiply', 'divide']
      const op = operations[Math.floor(Math.random() * operations.length)]
      problems.push(mathService.generateProblem(op, difficulty))
    }
    
    mentalMathState.value = {
      isRunning: true,
      duration,
      timeLeft: duration,
      problems,
      currentIndex: 0,
      correctAnswers: 0,
      mode
    }
  }

  const submitMentalAnswer = (userAnswer) => {
    if (!mentalMathState.value.isRunning) {
      return { correct: false }
    }

    const isCorrect = mathService.checkAnswer(mentalMathState.value.problems[mentalMathState.value.currentIndex], userAnswer)
    
    if (isCorrect) {
      mentalMathState.value.correctAnswers++
    }

    const nextIndex = mentalMathState.value.currentIndex + 1
    
    if (nextIndex >= mentalMathState.value.problems.length) {
      // Session finished
      mentalMathState.value.isRunning = false
      
      // Save record
      const record = mathService.saveMentalMathRecord({
        type: mentalMathState.value.mode,
        difficulty: mentalMathState.value.difficulty || 'medium',
        duration: mentalMathState.value.duration,
        totalQuestions: mentalMathState.value.problems.length,
        correctAnswers: mentalMathState.value.correctAnswers
      })
      
      if (record) {
        loadMentalMathRecords()
        // Check mental math achievements
        checkMentalAchievements()
      }
      
      return { correct: isCorrect, isFinished: true, record }
    } else {
      mentalMathState.value.currentIndex = nextIndex
      return { correct: isCorrect, isFinished: false }
    }
  }

  const updateTimeLeft = (time) => {
    mentalMathState.value.timeLeft = time
  }

  const endMentalMath = () => {
    mentalMathState.value.isRunning = false
  }

  const checkMentalAchievements = () => {
    // Check accuracy achievement
    const latestRecord = mentalMathRecords.value[0]
    if (latestRecord && latestRecord.accuracy >= 90) {
      mathService.unlockAchievement('ach_2')
      loadAchievements()
    }
  }

  // =========================================================================
  // 数学探索方法
  // =========================================================================

  const selectTopic = (topic) => {
    selectedTopic.value = topic
  }

  const selectLesson = (lesson) => {
    selectedLesson.value = lesson
  }

  const learnLesson = (topicId, lessonId) => {
    const success = mathService.markLessonLearned(topicId, lessonId)
    if (success) {
      loadExplorationTopics()
      // Check exploration achievement
      checkExplorationAchievements()
    }
    return success
  }

  const checkExplorationAchievements = () => {
    mathService.unlockAchievement('ach_3')
    loadAchievements()
  }

  // =========================================================================
  // 成就方法
  // =========================================================================

  const unlockAchievement = (achievementId) => {
    const success = mathService.unlockAchievement(achievementId)
    if (success) {
      loadAchievements()
    }
    return success
  }

  const getRank = (totalScore) => {
    return mathService.calculateRank(totalScore)
  }

  // =========================================================================
  // 计算属性
  // =========================================================================

  // 总积分
  const totalScore = computed(() => {
    let score = 0
    gameRecords.value.forEach(r => score += r.score || 0)
    return score
  })

  // 当前段位
  const currentRank = computed(() => {
    return mathService.calculateRank(totalScore.value)
  })

  // 已解锁成就
  const unlockedAchievements = computed(() => {
    return achievements.value.filter(a => a.isUnlocked)
  })

  // 成就完成率
  const achievementProgress = computed(() => {
    const total = achievements.value.length
    const unlocked = unlockedAchievements.value.length
    return total > 0 ? Math.round((unlocked / total) * 100) : 0
  })

  // 平均准确率
  const averageAccuracy = computed(() => {
    if (mentalMathRecords.value.length === 0) return 0
    const sum = mentalMathRecords.value.reduce((acc, r) => acc + r.accuracy, 0)
    return Math.round(sum / mentalMathRecords.value.length)
  })

  // 已学习课时
  const learnedLessonsCount = computed(() => {
    let count = 0
    explorationTopics.value.forEach(topic => {
      topic.lessons.forEach(lesson => {
        if (lesson.isLearned) count++
      })
    })
    return count
  })

  // 总课时数
  const totalLessonsCount = computed(() => {
    let count = 0
    explorationTopics.value.forEach(topic => {
      count += topic.lessons.length
    })
    return count
  })

  return {
    // 状态
    currentTab,
    currentGame,
    mentalMathState,
    gameRecords,
    mentalMathRecords,
    explorationTopics,
    achievements,
    selectedTopic,
    selectedLesson,

    // 初始化
    init,

    // 加载方法
    loadGameRecords,
    loadMentalMathRecords,
    loadExplorationTopics,
    loadAchievements,

    // 数学游戏方法
    startGame,
    submitAnswer,
    endGame,

    // 速算训练方法
    startMentalMath,
    submitMentalAnswer,
    updateTimeLeft,
    endMentalMath,

    // 数学探索方法
    selectTopic,
    selectLesson,
    learnLesson,

    // 成就方法
    unlockAchievement,
    getRank,

    // 计算属性
    totalScore,
    currentRank,
    unlockedAchievements,
    achievementProgress,
    averageAccuracy,
    learnedLessonsCount,
    totalLessonsCount
  }
})
