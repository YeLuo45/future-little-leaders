/**
 * Time Management Store
 * 时间管理状态管理 - Pinia Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import timeService from '../services/timeService'

export const useTimeStore = defineStore('time', () => {
  // ============ 状态 ============
  
  // 日程相关
  const schedules = ref([])
  const selectedDate = ref(new Date().toISOString().split('T')[0])
  
  // 番茄钟相关
  const pomodoroConfig = ref(timeService.getPomodoroConfig())
  const pomodoroState = ref({
    isRunning: false,
    isPaused: false,
    currentPhase: 'work',  // work, shortBreak, longBreak
    remainingSeconds: 25 * 60,
    completedPomodoros: 0,
    currentTask: ''
  })
  let pomodoroTimer = null
  
  // 习惯相关
  const habits = ref([])
  const habitRecords = ref([])
  
  // 时间追踪相关
  const activeTracking = ref([])
  
  // ============ 计算属性 ============
  
  // 当前日期的日程
  const todaySchedules = computed(() => {
    return timeService.getSchedulesByDate(selectedDate.value)
  })
  
  // 今日番茄统计
  const todayPomodoroStats = computed(() => {
    return timeService.getTodayPomodoroStats()
  })
  
  // 本周番茄统计
  const weekPomodoroStats = computed(() => {
    return timeService.getWeekPomodoroStats()
  })
  
  // 今日习惯打卡情况
  const todayHabitCheckins = computed(() => {
    return timeService.getHabitRecordsByDate(selectedDate.value)
  })
  
  // 格式化剩余时间
  const formattedRemainingTime = computed(() => {
    const minutes = Math.floor(pomodoroState.value.remainingSeconds / 60)
    const seconds = pomodoroState.value.remainingSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })
  
  // ============ 日程方法 ============
  
  const loadSchedules = () => {
    schedules.value = timeService.getSchedules()
  }
  
  const setSelectedDate = (date) => {
    selectedDate.value = date
  }
  
  const addSchedule = (scheduleData) => {
    const schedule = timeService.createSchedule({
      ...scheduleData,
      date: selectedDate.value
    })
    loadSchedules()
    return schedule
  }
  
  const updateSchedule = (scheduleId, updates) => {
    const schedule = timeService.updateSchedule(scheduleId, updates)
    loadSchedules()
    return schedule
  }
  
  const removeSchedule = (scheduleId) => {
    timeService.deleteSchedule(scheduleId)
    loadSchedules()
  }
  
  const completeSchedule = (scheduleId) => {
    const schedule = timeService.completeSchedule(scheduleId)
    loadSchedules()
    return schedule
  }
  
  // ============ 番茄钟方法 ============
  
  const loadPomodoroConfig = () => {
    pomodoroConfig.value = timeService.getPomodoroConfig()
  }
  
  const updatePomodoroConfig = (config) => {
    pomodoroConfig.value = { ...pomodoroConfig.value, ...config }
    timeService.savePomodoroConfig(pomodoroConfig.value)
  }
  
  const startPomodoro = (taskTitle = '') => {
    if (pomodoroTimer) {
      clearInterval(pomodoroTimer)
    }
    
    pomodoroState.value = {
      isRunning: true,
      isPaused: false,
      currentPhase: 'work',
      remainingSeconds: pomodoroConfig.value.workDuration * 60,
      completedPomodoros: pomodoroState.value.completedPomodoros,
      currentTask: taskTitle
    }
    
    pomodoroTimer = setInterval(() => {
      if (pomodoroState.value.remainingSeconds > 0) {
        pomodoroState.value.remainingSeconds--
      } else {
        onPomodoroPhaseComplete()
      }
    }, 1000)
  }
  
  const pausePomodoro = () => {
    if (pomodoroTimer) {
      clearInterval(pomodoroTimer)
      pomodoroTimer = null
    }
    pomodoroState.value.isPaused = true
    pomodoroState.value.isRunning = false
  }
  
  const resumePomodoro = () => {
    if (pomodoroState.value.isPaused) {
      pomodoroState.value.isPaused = false
      pomodoroState.value.isRunning = true
      
      pomodoroTimer = setInterval(() => {
        if (pomodoroState.value.remainingSeconds > 0) {
          pomodoroState.value.remainingSeconds--
        } else {
          onPomodoroPhaseComplete()
        }
      }, 1000)
    }
  }
  
  const stopPomodoro = () => {
    if (pomodoroTimer) {
      clearInterval(pomodoroTimer)
      pomodoroTimer = null
    }
    
    pomodoroState.value = {
      isRunning: false,
      isPaused: false,
      currentPhase: 'work',
      remainingSeconds: pomodoroConfig.value.workDuration * 60,
      completedPomodoros: pomodoroState.value.completedPomodoros,
      currentTask: ''
    }
  }
  
  const onPomodoroPhaseComplete = () => {
    if (pomodoroTimer) {
      clearInterval(pomodoroTimer)
      pomodoroTimer = null
    }
    
    const currentPhase = pomodoroState.value.currentPhase
    
    // 记录完成
    timeService.addPomodoroRecord({
      type: currentPhase,
      duration: currentPhase === 'work' 
        ? pomodoroConfig.value.workDuration 
        : (currentPhase === 'shortBreak' ? pomodoroConfig.value.shortBreak : pomodoroConfig.value.longBreak),
      completed: true,
      taskTitle: pomodoroState.value.currentTask
    })
    
    if (currentPhase === 'work') {
      pomodoroState.value.completedPomodoros++
      
      // 判断进入休息还是工作
      if (pomodoroState.value.completedPomodoros % pomodoroConfig.value.longBreakInterval === 0) {
        pomodoroState.value.currentPhase = 'longBreak'
        pomodoroState.value.remainingSeconds = pomodoroConfig.value.longBreak * 60
      } else {
        pomodoroState.value.currentPhase = 'shortBreak'
        pomodoroState.value.remainingSeconds = pomodoroConfig.value.shortBreak * 60
      }
      
      // 自动开始休息
      pomodoroTimer = setInterval(() => {
        if (pomodoroState.value.remainingSeconds > 0) {
          pomodoroState.value.remainingSeconds--
        } else {
          onPomodoroPhaseComplete()
        }
      }, 1000)
      
      // 发送通知
      uni.$emit('pomodoroWorkComplete', { completedPomodoros: pomodoroState.value.completedPomodoros })
    } else {
      // 休息结束，进入工作
      pomodoroState.value.currentPhase = 'work'
      pomodoroState.value.remainingSeconds = pomodoroConfig.value.workDuration * 60
      pomodoroState.value.isRunning = false
      
      // 发送通知
      uni.$emit('pomodoroBreakComplete')
    }
  }
  
  const skipPhase = () => {
    pomodoroState.value.remainingSeconds = 0
  }
  
  // ============ 习惯方法 ============
  
  const loadHabits = () => {
    habits.value = timeService.getHabits()
    habitRecords.value = timeService.getHabitRecords()
  }
  
  const addHabit = (habitData) => {
    const habit = timeService.createHabit(habitData)
    loadHabits()
    return habit
  }
  
  const updateHabit = (habitId, updates) => {
    const habit = timeService.updateHabit(habitId, updates)
    loadHabits()
    return habit
  }
  
  const removeHabit = (habitId) => {
    timeService.deleteHabit(habitId)
    loadHabits()
  }
  
  const checkInHabit = (habitId, date = null) => {
    const record = timeService.checkInHabit(habitId, date)
    habitRecords.value = timeService.getHabitRecords()
    return record
  }
  
  const uncheckHabit = (habitId, date = null) => {
    timeService.uncheckHabit(habitId, date)
    habitRecords.value = timeService.getHabitRecords()
  }
  
  const getHabitStreak = (habitId) => {
    return timeService.getHabitStreak(habitId)
  }
  
  const isHabitCheckedIn = (habitId, date = null) => {
    const targetDate = date || selectedDate.value
    return habitRecords.value.some(r => r.habitId === habitId && r.date === targetDate)
  }
  
  // ============ 时间追踪方法 ============
  
  const loadActiveTracking = () => {
    activeTracking.value = timeService.getActiveTracking()
  }
  
  const startTracking = (taskId, taskTitle) => {
    timeService.startTimeTracking(taskId, taskTitle)
    loadActiveTracking()
  }
  
  const stopTracking = (taskId) => {
    const result = timeService.stopTimeTracking(taskId)
    loadActiveTracking()
    return result
  }
  
  const getTimeAnalytics = (startDate, endDate) => {
    return timeService.getTimeAnalytics(startDate, endDate)
  }
  
  // ============ 初始化 ============
  
  const init = () => {
    loadSchedules()
    loadPomodoroConfig()
    loadHabits()
    loadActiveTracking()
    
    // 初始化番茄钟时间
    pomodoroState.value.remainingSeconds = pomodoroConfig.value.workDuration * 60
  }
  
  // ============ 清理 ============
  
  const cleanup = () => {
    if (pomodoroTimer) {
      clearInterval(pomodoroTimer)
      pomodoroTimer = null
    }
  }
  
  return {
    // 状态
    schedules,
    selectedDate,
    pomodoroConfig,
    pomodoroState,
    habits,
    habitRecords,
    activeTracking,
    
    // 计算属性
    todaySchedules,
    todayPomodoroStats,
    weekPomodoroStats,
    todayHabitCheckins,
    formattedRemainingTime,
    
    // 日程方法
    loadSchedules,
    setSelectedDate,
    addSchedule,
    updateSchedule,
    removeSchedule,
    completeSchedule,
    
    // 番茄钟方法
    loadPomodoroConfig,
    updatePomodoroConfig,
    startPomodoro,
    pausePomodoro,
    resumePomodoro,
    stopPomodoro,
    skipPhase,
    
    // 习惯方法
    loadHabits,
    addHabit,
    updateHabit,
    removeHabit,
    checkInHabit,
    uncheckHabit,
    getHabitStreak,
    isHabitCheckedIn,
    
    // 时间追踪方法
    loadActiveTracking,
    startTracking,
    stopTracking,
    getTimeAnalytics,
    
    // 生命周期
    init,
    cleanup
  }
})
