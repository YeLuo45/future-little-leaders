/**
 * V71 Health & Nutrition Store
 * 健康营养系统 Store - 饮食记录、营养分析、健康提醒、饮食习惯培养
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import healthService from '@/services/healthService.js'

export const useHealthStore = defineStore('health', () => {
  // =========================================================================
  // 状态
  // =========================================================================
  
  // 饮食日记
  const foodDiary = ref([])
  const todayDiary = ref(null)
  const weekDiary = ref([])
  const monthDiary = ref([])
  
  // 营养目标
  const nutritionGoals = ref({})
  
  // 健康提醒
  const reminders = ref([])
  
  // 饮食计划
  const mealPlans = ref([])
  
  // UI状态
  const currentTab = ref('diary') // diary | nutrition | reminders
  const selectedDate = ref(new Date().toISOString().split('T')[0])
  const selectedMealType = ref('breakfast')
  
  // 搜索
  const foodSearchResults = ref([])
  const searchKeyword = ref('')
  
  // =========================================================================
  // 初始化
  // =========================================================================
  
  const init = () => {
    loadTodayDiary()
    loadWeekDiary()
    loadMonthDiary()
    loadNutritionGoals()
    loadReminders()
    loadMealPlans()
  }
  
  // =========================================================================
  // 加载方法
  // =========================================================================
  
  const loadTodayDiary = () => {
    todayDiary.value = healthService.getFoodDiaryByDate(selectedDate.value)
  }
  
  const loadWeekDiary = () => {
    weekDiary.value = healthService.getWeekFoodDiary()
  }
  
  const loadMonthDiary = () => {
    monthDiary.value = healthService.getMonthFoodDiary()
  }
  
  const loadNutritionGoals = () => {
    nutritionGoals.value = healthService.getNutritionGoals()
  }
  
  const loadReminders = () => {
    reminders.value = healthService.getHealthReminders()
  }
  
  const loadMealPlans = () => {
    mealPlans.value = healthService.getMealPlans()
  }
  
  // =========================================================================
  // 计算属性
  // =========================================================================
  
  // 今日营养摄入
  const todayNutrition = computed(() => {
    if (!todayDiary.value) return null
    return todayDiary.value.totalNutrition || {}
  })
  
  // 营养目标完成度
  const nutritionProgress = computed(() => {
    const progress = {}
    const goals = nutritionGoals.value
    const actual = todayNutrition.value || {}
    
    Object.keys(goals).forEach(key => {
      const goal = goals[key]
      const actualValue = actual[key] || 0
      progress[key] = {
        ...goal,
        actual: actualValue,
        percentage: healthService.calculateNutritionPercentage(actualValue, goal)
      }
    })
    
    return progress
  })
  
  // 营养平衡分析
  const nutritionBalance = computed(() => {
    if (!todayNutrition.value) return null
    return healthService.analyzeNutritionBalance(todayNutrition.value)
  })
  
  // 周统计
  const weekStats = computed(() => {
    const diary = weekDiary.value
    const totals = {
      totalCalories: 0,
      avgCaloriesPerDay: 0,
      totalMeals: 0,
      daysLogged: diary.length
    }
    
    diary.forEach(day => {
      const nutrition = day.totalNutrition || {}
      totals.totalCalories += nutrition.calories || 0
      totals.totalMeals += countMeals(day.meals)
    })
    
    totals.avgCaloriesPerDay = totals.daysLogged > 0 
      ? Math.round(totals.totalCalories / totals.daysLogged) 
      : 0
    
    return totals
  })
  
  // 月统计
  const monthStats = computed(() => {
    const diary = monthDiary.value
    const totals = {
      totalCalories: 0,
      avgCaloriesPerDay: 0,
      totalMeals: 0,
      daysLogged: diary.length
    }
    
    diary.forEach(day => {
      const nutrition = day.totalNutrition || {}
      totals.totalCalories += nutrition.calories || 0
      totals.totalMeals += countMeals(day.meals)
    })
    
    totals.avgCaloriesPerDay = totals.daysLogged > 0 
      ? Math.round(totals.totalCalories / totals.daysLogged) 
      : 0
    
    return totals
  })
  
  // 帮助函数：计算一天中的餐次数量
  const countMeals = (meals) => {
    let count = 0
    Object.values(meals).forEach(mealList => {
      if (Array.isArray(mealList)) count += mealList.length
    })
    return count
  }
  
  // 获取当前选中日期的日记
  const selectedDateDiary = computed(() => {
    return foodDiary.value.find(d => d.date === selectedDate.value) || null
  })
  
  // 活跃提醒（已启用）
  const activeReminders = computed(() => {
    return reminders.value.filter(r => r.enabled)
  })
  
  // =========================================================================
  // 饮食日记操作
  // =========================================================================
  
  const addFoodEntry = (entry) => {
    const result = healthService.saveFoodDiaryEntry(entry)
    if (result) {
      loadTodayDiary()
      loadWeekDiary()
      loadMonthDiary()
    }
    return result
  }
  
  const removeFoodEntry = (mealType, entryId) => {
    const result = healthService.deleteFoodDiaryEntry(selectedDate.value, mealType, entryId)
    if (result) {
      loadTodayDiary()
      loadWeekDiary()
      loadMonthDiary()
    }
    return result
  }
  
  const searchFood = (keyword) => {
    searchKeyword.value = keyword
    foodSearchResults.value = healthService.searchFood(keyword)
    return foodSearchResults.value
  }
  
  const clearSearch = () => {
    searchKeyword.value = ''
    foodSearchResults.value = healthService.searchFood('')
  }
  
  // =========================================================================
  // 营养目标操作
  // =========================================================================
  
  const updateNutritionGoal = (key, value) => {
    nutritionGoals.value[key] = {
      ...nutritionGoals.value[key],
      value
    }
    healthService.saveNutritionGoals(nutritionGoals.value)
    return nutritionGoals.value
  }
  
  const updateNutritionGoals = (goals) => {
    nutritionGoals.value = { ...nutritionGoals.value, ...goals }
    healthService.saveNutritionGoals(nutritionGoals.value)
    return nutritionGoals.value
  }
  
  const resetGoals = () => {
    nutritionGoals.value = healthService.resetNutritionGoals()
    return nutritionGoals.value
  }
  
  // =========================================================================
  // 健康提醒操作
  // =========================================================================
  
  const toggleReminder = (id) => {
    reminders.value = healthService.toggleReminder(id)
    return reminders.value
  }
  
  const updateReminder = (reminder) => {
    reminders.value = healthService.saveHealthReminder(reminder)
    return reminders.value
  }
  
  // =========================================================================
  // 饮食计划操作
  // =========================================================================
  
  const addMealPlan = (plan) => {
    mealPlans.value = healthService.saveMealPlan(plan)
    return mealPlans.value
  }
  
  const removeMealPlan = (id) => {
    mealPlans.value = healthService.deleteMealPlan(id)
    return mealPlans.value
  }
  
  // =========================================================================
  // 数据导出
  // =========================================================================
  
  const exportData = () => {
    return healthService.exportHealthData()
  }
  
  // =========================================================================
  // 工具方法
  // =========================================================================
  
  const setSelectedDate = (date) => {
    selectedDate.value = date
    loadTodayDiary()
  }
  
  const setSelectedMealType = (type) => {
    selectedMealType.value = type
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
  
  const getMealTypeName = (type) => {
    return healthService.getMealType(type)?.name || type
  }
  
  const getMealTypeIcon = (type) => {
    return healthService.getMealType(type)?.icon || '🍽️'
  }
  
  const getFoodById = (id) => {
    return healthService.getFoodById(id)
  }
  
  const getRecipes = () => {
    return healthService.getRecipes()
  }
  
  const getRecipesByMealType = (mealType) => {
    return healthService.getRecipesByMealType(mealType)
  }
  
  return {
    // 状态
    foodDiary,
    todayDiary,
    weekDiary,
    monthDiary,
    nutritionGoals,
    reminders,
    mealPlans,
    currentTab,
    selectedDate,
    selectedMealType,
    foodSearchResults,
    searchKeyword,
    
    // 计算属性
    todayNutrition,
    nutritionProgress,
    nutritionBalance,
    weekStats,
    monthStats,
    selectedDateDiary,
    activeReminders,
    
    // 初始化
    init,
    
    // 加载方法
    loadTodayDiary,
    loadWeekDiary,
    loadMonthDiary,
    loadNutritionGoals,
    loadReminders,
    loadMealPlans,
    
    // 饮食日记
    addFoodEntry,
    removeFoodEntry,
    searchFood,
    clearSearch,
    
    // 营养目标
    updateNutritionGoal,
    updateNutritionGoals,
    resetGoals,
    
    // 健康提醒
    toggleReminder,
    updateReminder,
    
    // 饮食计划
    addMealPlan,
    removeMealPlan,
    
    // 导出
    exportData,
    
    // 工具方法
    setSelectedDate,
    setSelectedMealType,
    formatDate,
    getMealTypeName,
    getMealTypeIcon,
    getFoodById,
    getRecipes,
    getRecipesByMealType
  }
})
