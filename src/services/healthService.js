/**
 * V71 Health & Nutrition Service
 * 健康营养系统 - 饮食记录、营养分析、健康提醒、饮食习惯培养
 */

// Storage keys
const FOOD_DIARY_KEY = 'food_diary'
const NUTRITION_GOALS_KEY = 'nutrition_goals'
const HEALTH_REMINDERS_KEY = 'health_reminders'
const MEAL_PLANS_KEY = 'meal_plans'
const RECIPES_KEY = 'healthy_recipes'

// ============================================================================
// Meal Types / 餐次类型
// ============================================================================

export const MEAL_TYPES = {
  breakfast: { id: 'breakfast', name: '早餐', icon: '🌅', timeRange: '06:00-09:00' },
  lunch: { id: 'lunch', name: '午餐', icon: '☀️', timeRange: '11:00-13:00' },
  dinner: { id: 'dinner', name: '晚餐', icon: '🌙', timeRange: '17:00-20:00' },
  snack: { id: 'snack', name: '加餐', icon: '🍎', timeRange: '全天' }
}

export const getMealType = (id) => {
  return Object.values(MEAL_TYPES).find(m => m.id === id) || MEAL_TYPES.snack
}

// ============================================================================
// Nutrition Constants / 营养常量
// ============================================================================

export const NUTRIENTS = {
  protein: { id: 'protein', name: '蛋白质', unit: 'g', icon: '💪', color: '#FF6B6B' },
  carbohydrate: { id: 'carbohydrate', name: '碳水化合物', unit: 'g', icon: '🍞', color: '#FFB84C' },
  fat: { id: 'fat', name: '脂肪', unit: 'g', icon: '🧈', color: '#A8E6CF' },
  fiber: { id: 'fiber', name: '膳食纤维', unit: 'g', icon: '🥬', color: '#88D8B0' },
  vitaminA: { id: 'vitaminA', name: '维生素A', unit: 'μg', icon: '🥕', color: '#FF8B94' },
  vitaminC: { id: 'vitaminC', name: '维生素C', unit: 'mg', icon: '🍊', color: '#FFE5B4' },
  vitaminD: { id: 'vitaminD', name: '维生素D', unit: 'μg', icon: '☀️', color: '#FFFACD' },
  calcium: { id: 'calcium', name: '钙', unit: 'mg', icon: '🥛', color: '#E0FFFF' },
  iron: { id: 'iron', name: '铁', unit: 'mg', icon: '🥩', color: '#CD853F' },
  water: { id: 'water', name: '水分', unit: 'ml', icon: '💧', color: '#87CEEB' }
}

// Daily nutrition goals for children (ages 6-12)
export const DEFAULT_NUTRITION_GOALS = {
  calories: { value: 1800, unit: 'kcal', name: '热量' },
  protein: { value: 60, unit: 'g', name: '蛋白质' },
  carbohydrate: { value: 250, unit: 'g', name: '碳水化合物' },
  fat: { value: 60, unit: 'g', name: '脂肪' },
  fiber: { value: 20, unit: 'g', name: '膳食纤维' },
  vitaminA: { value: 600, unit: 'μg', name: '维生素A' },
  vitaminC: { value: 80, unit: 'mg', name: '维生素C' },
  vitaminD: { value: 10, unit: 'μg', name: '维生素D' },
  calcium: { value: 1000, unit: 'mg', name: '钙' },
  iron: { value: 12, unit: 'mg', name: '铁' },
  water: { value: 1600, unit: 'ml', name: '水分' }
}

// ============================================================================
// Food Database / 食物数据库 (简化的本地数据)
// ============================================================================

export const FOOD_DATABASE = [
  // 主食类
  { id: 'rice', name: '米饭', category: '主食', calories: 116, protein: 2.6, carbohydrate: 25.6, fat: 0.3, fiber: 0.3, portion: '100g' },
  { id: 'noodle', name: '面条', category: '主食', calories: 138, protein: 4.5, carbohydrate: 25.0, fat: 1.6, fiber: 0.9, portion: '100g' },
  { id: 'bread', name: '面包', category: '主食', calories: 265, protein: 8.0, carbohydrate: 50.0, fat: 3.2, fiber: 2.0, portion: '100g' },
  { id: 'oatmeal', name: '燕麦', category: '主食', calories: 389, protein: 16.9, carbohydrate: 66.0, fat: 6.9, fiber: 10.6, portion: '100g' },

  // 蔬菜类
  { id: 'broccoli', name: '西兰花', category: '蔬菜', calories: 34, protein: 2.8, carbohydrate: 6.6, fat: 0.4, fiber: 2.6, vitaminC: 89.2, portion: '100g' },
  { id: 'carrot', name: '胡萝卜', category: '蔬菜', calories: 41, protein: 0.9, carbohydrate: 9.6, fat: 0.2, fiber: 2.8, vitaminA: 835, portion: '100g' },
  { id: 'spinach', name: '菠菜', category: '蔬菜', calories: 23, protein: 2.9, carbohydrate: 3.6, fat: 0.4, fiber: 2.2, vitaminA: 469, vitaminC: 28.1, portion: '100g' },
  { id: 'tomato', name: '番茄', category: '蔬菜', calories: 18, protein: 0.9, carbohydrate: 3.9, fat: 0.2, fiber: 1.2, vitaminC: 23.0, portion: '100g' },
  { id: 'cucumber', name: '黄瓜', category: '蔬菜', calories: 15, protein: 0.8, carbohydrate: 3.6, fat: 0.1, fiber: 0.5, portion: '100g' },

  // 水果类
  { id: 'apple', name: '苹果', category: '水果', calories: 52, protein: 0.3, carbohydrate: 13.8, fat: 0.2, fiber: 2.4, vitaminC: 4.6, portion: '100g' },
  { id: 'banana', name: '香蕉', category: '水果', calories: 93, protein: 1.4, carbohydrate: 22.8, fat: 0.2, fiber: 1.7, vitaminC: 8.7, portion: '100g' },
  { id: 'orange', name: '橙子', category: '水果', calories: 47, protein: 0.9, carbohydrate: 11.8, fat: 0.1, fiber: 2.4, vitaminC: 53.2, portion: '100g' },
  { id: 'grape', name: '葡萄', category: '水果', calories: 67, protein: 0.6, carbohydrate: 17.3, fat: 0.2, fiber: 0.9, vitaminC: 3.2, portion: '100g' },

  // 蛋白质类
  { id: 'egg', name: '鸡蛋', category: '蛋白质', calories: 144, protein: 13.3, carbohydrate: 1.5, fat: 8.8, fiber: 0, portion: '100g' },
  { id: 'milk', name: '牛奶', category: '蛋白质', calories: 54, protein: 3.0, carbohydrate: 3.4, fat: 3.2, fiber: 0, calcium: 104, portion: '100ml' },
  { id: 'chicken', name: '鸡肉', category: '蛋白质', calories: 165, protein: 31.0, carbohydrate: 0, fat: 3.6, fiber: 0, portion: '100g' },
  { id: 'fish', name: '鱼肉', category: '蛋白质', calories: 90, protein: 20.0, carbohydrate: 0, fat: 1.0, fiber: 0, portion: '100g' },
  { id: 'tofu', name: '豆腐', category: '蛋白质', calories: 81, protein: 8.1, carbohydrate: 3.8, fat: 3.7, fiber: 0.4, calcium: 164, portion: '100g' },

  // 饮品
  { id: 'water', name: '白开水', category: '饮品', calories: 0, protein: 0, carbohydrate: 0, fat: 0, fiber: 0, water: 250, portion: '250ml' },
  { id: 'juice', name: '果汁', category: '饮品', calories: 45, protein: 0.1, carbohydrate: 10.3, fat: 0.1, fiber: 0.1, vitaminC: 20.0, portion: '100ml' },
  { id: 'yogurt', name: '酸奶', category: '饮品', calories: 72, protein: 2.9, carbohydrate: 9.3, fat: 2.7, fiber: 0, calcium: 118, portion: '100g' }
]

export const searchFood = (keyword) => {
  if (!keyword) return FOOD_DATABASE.slice(0, 10)
  const lower = keyword.toLowerCase()
  return FOOD_DATABASE.filter(f => 
    f.name.toLowerCase().includes(lower) || 
    f.category.toLowerCase().includes(lower)
  ).slice(0, 20)
}

export const getFoodById = (id) => {
  return FOOD_DATABASE.find(f => f.id === id)
}

export const getFoodsByCategory = (category) => {
  return FOOD_DATABASE.filter(f => f.category === category)
}

// ============================================================================
// Food Diary Operations / 饮食日记操作
// ============================================================================

export const getFoodDiary = () => {
  try {
    const data = uni.getStorageSync(FOOD_DIARY_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getFoodDiary error:', e)
  }
  return []
}

export const saveFoodDiaryEntry = (entry) => {
  try {
    const diary = getFoodDiary()
    const today = new Date().toISOString().split('T')[0]
    
    // Find today's diary or create new
    let todayDiary = diary.find(d => d.date === today)
    if (!todayDiary) {
      todayDiary = { date: today, meals: [], totalNutrition: {}, createdAt: new Date().toISOString() }
      diary.push(todayDiary)
    }
    
    // Add meal entry
    const mealType = entry.mealType || 'snack'
    if (!todayDiary.meals[mealType]) {
      todayDiary.meals[mealType] = []
    }
    
    const foodEntry = {
      id: 'food_' + Date.now(),
      foodId: entry.foodId,
      name: entry.name,
      amount: entry.amount || 1,
      portion: entry.portion,
      calories: entry.calories || 0,
      protein: entry.protein || 0,
      carbohydrate: entry.carbohydrate || 0,
      fat: entry.fat || 0,
      fiber: entry.fiber || 0,
      vitaminC: entry.vitaminC || 0,
      vitaminA: entry.vitaminA || 0,
      calcium: entry.calcium || 0,
      iron: entry.iron || 0,
      water: entry.water || 0,
      loggedAt: new Date().toISOString()
    }
    
    todayDiary.meals[mealType].push(foodEntry)
    todayDiary.updatedAt = new Date().toISOString()
    
    // Update totals
    todayDiary.totalNutrition = calculateDayNutrition(todayDiary.meals)
    
    uni.setStorageSync(FOOD_DIARY_KEY, JSON.stringify(diary))
    return todayDiary
  } catch (e) {
    console.error('saveFoodDiaryEntry error:', e)
    return null
  }
}

export const deleteFoodDiaryEntry = (date, mealType, entryId) => {
  try {
    const diary = getFoodDiary()
    const dayDiary = diary.find(d => d.date === date)
    
    if (dayDiary && dayDiary.meals[mealType]) {
      dayDiary.meals[mealType] = dayDiary.meals[mealType].filter(e => e.id !== entryId)
      dayDiary.totalNutrition = calculateDayNutrition(dayDiary.meals)
      dayDiary.updatedAt = new Date().toISOString()
      uni.setStorageSync(FOOD_DIARY_KEY, JSON.stringify(diary))
      return dayDiary
    }
    return null
  } catch (e) {
    console.error('deleteFoodDiaryEntry error:', e)
    return null
  }
}

export const getFoodDiaryByDate = (date) => {
  const diary = getFoodDiary()
  return diary.find(d => d.date === date) || null
}

export const getWeekFoodDiary = () => {
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const startDate = weekAgo.toISOString().split('T')[0]
  const endDate = today.toISOString().split('T')[0]
  
  const diary = getFoodDiary()
  return diary.filter(d => d.date >= startDate && d.date <= endDate)
}

export const getMonthFoodDiary = () => {
  const today = new Date()
  const monthAgo = new Date(today)
  monthAgo.setDate(monthAgo.getDate() - 30)
  
  const startDate = monthAgo.toISOString().split('T')[0]
  const endDate = today.toISOString().split('T')[0]
  
  const diary = getFoodDiary()
  return diary.filter(d => d.date >= startDate && d.date <= endDate)
}

// ============================================================================
// Nutrition Calculation / 营养计算
// ============================================================================

export const calculateDayNutrition = (meals) => {
  const totals = {
    calories: 0,
    protein: 0,
    carbohydrate: 0,
    fat: 0,
    fiber: 0,
    vitaminA: 0,
    vitaminC: 0,
    vitaminD: 0,
    calcium: 0,
    iron: 0,
    water: 0
  }
  
  Object.values(meals).forEach(mealList => {
    if (Array.isArray(mealList)) {
      mealList.forEach(item => {
        totals.calories += item.calories || 0
        totals.protein += item.protein || 0
        totals.carbohydrate += item.carbohydrate || 0
        totals.fat += item.fat || 0
        totals.fiber += item.fiber || 0
        totals.vitaminA += item.vitaminA || 0
        totals.vitaminC += item.vitaminC || 0
        totals.vitaminD += item.vitaminD || 0
        totals.calcium += item.calcium || 0
        totals.iron += item.iron || 0
        totals.water += item.water || 0
      })
    }
  })
  
  return totals
}

export const calculateNutritionPercentage = (actual, goal) => {
  if (!goal || goal.value === 0) return 0
  const percent = (actual / goal.value) * 100
  return Math.min(100, Math.round(percent))
}

export const analyzeNutritionBalance = (nutrition) => {
  const analysis = {
    proteinRatio: 0,
    carbRatio: 0,
    fatRatio: 0,
    status: 'balanced', // balanced | high | low
    suggestions: []
  }
  
  const total = nutrition.protein + nutrition.carbohydrate + nutrition.fat
  if (total === 0) return analysis
  
  analysis.proteinRatio = Math.round((nutrition.protein / total) * 100)
  analysis.carbRatio = Math.round((nutrition.carbohydrate / total) * 100)
  analysis.fatRatio = Math.round((nutrition.fat / total) * 100)
  
  // 理想比例: 蛋白质 20-30%, 碳水 50-60%, 脂肪 20-30%
  if (analysis.proteinRatio < 15 || analysis.proteinRatio > 35) {
    analysis.status = 'unbalanced'
    analysis.suggestions.push({ type: 'protein', text: '蛋白质比例不太均衡，建议适量增减肉类、蛋奶类食物。' })
  }
  if (analysis.carbRatio < 40 || analysis.carbRatio > 70) {
    analysis.status = 'unbalanced'
    analysis.suggestions.push({ type: 'carb', text: '碳水化合物比例需要调整，注意粗细粮搭配。' })
  }
  if (analysis.fatRatio < 15 || analysis.fatRatio > 35) {
    analysis.status = 'unbalanced'
    analysis.suggestions.push({ type: 'fat', text: '脂肪摄入比例需要关注，建议选择健康脂肪来源。' })
  }
  
  if (analysis.status === 'balanced') {
    analysis.suggestions.push({ type: 'praise', text: '营养摄入比例良好！继续保持均衡饮食。' })
  }
  
  return analysis
}

// ============================================================================
// Nutrition Goals / 营养目标
// ============================================================================

export const getNutritionGoals = () => {
  try {
    const data = uni.getStorageSync(NUTRITION_GOALS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getNutritionGoals error:', e)
  }
  return { ...DEFAULT_NUTRITION_GOALS }
}

export const saveNutritionGoals = (goals) => {
  try {
    uni.setStorageSync(NUTRITION_GOALS_KEY, JSON.stringify(goals))
    return true
  } catch (e) {
    console.error('saveNutritionGoals error:', e)
    return false
  }
}

export const resetNutritionGoals = () => {
  return saveNutritionGoals({ ...DEFAULT_NUTRITION_GOALS })
}

// ============================================================================
// Health Reminders / 健康提醒
// ============================================================================

export const getHealthReminders = () => {
  try {
    const data = uni.getStorageSync(HEALTH_REMINDERS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getHealthReminders error:', e)
  }
  return getDefaultReminders()
}

export const getDefaultReminders = () => [
  { id: 'water', type: 'water', name: '喝水提醒', enabled: true, interval: 60, icon: '💧', message: '该喝水啦！保持身体水分充足。' },
  { id: 'eye', type: 'eye', name: '眼睛休息', enabled: true, interval: 30, icon: '👀', message: '让眼睛休息一下，远眺20秒。' },
  { id: 'stretch', type: 'stretch', name: '伸展运动', enabled: true, interval: 45, icon: '🧘', message: '站起来活动一下，伸展四肢。' },
  { id: 'meal', type: 'meal', name: '用餐提醒', enabled: true, interval: 240, icon: '🍽️', message: '该吃饭了！保持规律饮食习惯。' }
]

export const saveHealthReminder = (reminder) => {
  try {
    const reminders = getHealthReminders()
    const index = reminders.findIndex(r => r.id === reminder.id)
    
    if (index >= 0) {
      reminders[index] = { ...reminders[index], ...reminder }
    } else {
      reminders.push(reminder)
    }
    
    uni.setStorageSync(HEALTH_REMINDERS_KEY, JSON.stringify(reminders))
    return reminders
  } catch (e) {
    console.error('saveHealthReminder error:', e)
    return null
  }
}

export const toggleReminder = (id) => {
  try {
    const reminders = getHealthReminders()
    const reminder = reminders.find(r => r.id === id)
    if (reminder) {
      reminder.enabled = !reminder.enabled
      uni.setStorageSync(HEALTH_REMINDERS_KEY, JSON.stringify(reminders))
    }
    return reminders
  } catch (e) {
    console.error('toggleReminder error:', e)
    return null
  }
}

// ============================================================================
// Meal Plans / 饮食计划
// ============================================================================

export const getMealPlans = () => {
  try {
    const data = uni.getStorageSync(MEAL_PLANS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getMealPlans error:', e)
  }
  return []
}

export const saveMealPlan = (plan) => {
  try {
    const plans = getMealPlans()
    const index = plans.findIndex(p => p.id === plan.id)
    
    if (index >= 0) {
      plans[index] = { ...plans[index], ...plan, updatedAt: new Date().toISOString() }
    } else {
      plans.push({
        id: 'plan_' + Date.now(),
        createdAt: new Date().toISOString(),
        ...plan
      })
    }
    
    uni.setStorageSync(MEAL_PLANS_KEY, JSON.stringify(plans))
    return plans
  } catch (e) {
    console.error('saveMealPlan error:', e)
    return null
  }
}

export const deleteMealPlan = (id) => {
  try {
    const plans = getMealPlans()
    const filtered = plans.filter(p => p.id !== id)
    uni.setStorageSync(MEAL_PLANS_KEY, JSON.stringify(filtered))
    return filtered
  } catch (e) {
    console.error('deleteMealPlan error:', e)
    return null
  }
}

// ============================================================================
// Healthy Recipes / 健康食谱
// ============================================================================

export const HEALTHY_RECIPES = [
  {
    id: 'recipe_1',
    name: '彩虹蔬果沙拉',
    description: '五彩缤纷的蔬菜水果，富含维生素和膳食纤维',
    icon: '🌈',
    meals: ['breakfast', 'lunch'],
    nutrition: { calories: 180, protein: 4, carbohydrate: 35, fat: 3, fiber: 8 },
    ingredients: ['西兰花', '胡萝卜', '番茄', '苹果', '橙子'],
    steps: ['所有食材洗净切块', '淋上酸奶酱', '撒上少许坚果']
  },
  {
    id: 'recipe_2',
    name: '三文鱼蔬菜卷',
    description: '优质蛋白配搭多彩蔬菜，营养丰富',
    icon: '🍣',
    meals: ['lunch', 'dinner'],
    nutrition: { calories: 320, protein: 28, carbohydrate: 25, fat: 12, fiber: 5 },
    ingredients: ['三文鱼', '海苔', '黄瓜', '胡萝卜', '米饭'],
    steps: ['米饭铺在海苔上', '摆上蔬菜和鱼片', '卷起切块']
  },
  {
    id: 'recipe_3',
    name: '牛奶燕麦粥',
    description: '高纤维早餐，提供持久能量',
    icon: '🥣',
    meals: ['breakfast'],
    nutrition: { calories: 280, protein: 12, carbohydrate: 48, fat: 6, fiber: 6 },
    ingredients: ['燕麦', '牛奶', '香蕉', '坚果'],
    steps: ['燕麦煮至软糯', '加入热牛奶', '铺上切片香蕉和坚果']
  },
  {
    id: 'recipe_4',
    name: '鸡肉蔬菜汤',
    description: '温润滋补，暖胃暖心',
    icon: '🍲',
    meals: ['lunch', 'dinner'],
    nutrition: { calories: 220, protein: 25, carbohydrate: 15, fat: 8, fiber: 4 },
    ingredients: ['鸡肉', '胡萝卜', '土豆', '洋葱', '西兰花'],
    steps: ['鸡肉切块焯水', '蔬菜切块', '一起炖煮30分钟']
  },
  {
    id: 'recipe_5',
    name: '水果酸奶杯',
    description: '清爽健康的下午茶选择',
    icon: '🧁',
    meals: ['snack'],
    nutrition: { calories: 150, protein: 6, carbohydrate: 22, fat: 4, fiber: 2 },
    ingredients: ['酸奶', '草莓', '蓝莓', '蜂蜜'],
    steps: ['杯底铺一层酸奶', '放上水果', '再铺一层酸奶', '淋上蜂蜜']
  },
  {
    id: 'recipe_6',
    name: '菠菜鸡蛋卷',
    description: '补铁补钙，营养早餐',
    icon: '🥬',
    meals: ['breakfast'],
    nutrition: { calories: 250, protein: 15, carbohydrate: 8, fat: 18, fiber: 3 },
    ingredients: ['菠菜', '鸡蛋', '奶酪', '牛奶'],
    steps: ['菠菜焯水切碎', '鸡蛋打散加牛奶', '煎成蛋饼卷起']
  }
]

export const getRecipes = () => HEALTHY_RECIPES

export const getRecipeById = (id) => HEALTHY_RECIPES.find(r => r.id === id)

export const getRecipesByMealType = (mealType) => {
  return HEALTHY_RECIPES.filter(r => r.meals.includes(mealType))
}

// ============================================================================
// Data Export / 数据导出
// ============================================================================

export const exportHealthData = () => {
  const foodDiary = getFoodDiary()
  const nutritionGoals = getNutritionGoals()
  const reminders = getHealthReminders()
  const mealPlans = getMealPlans()
  
  return {
    exportDate: new Date().toISOString(),
    foodDiary,
    nutritionGoals,
    reminders,
    mealPlans
  }
}

// ============================================================================
// Default export
// ============================================================================

export default {
  // 餐次类型
  MEAL_TYPES,
  getMealType,
  
  // 营养常量
  NUTRIENTS,
  DEFAULT_NUTRITION_GOALS,
  
  // 食物数据库
  FOOD_DATABASE,
  searchFood,
  getFoodById,
  getFoodsByCategory,
  
  // 饮食日记
  getFoodDiary,
  saveFoodDiaryEntry,
  deleteFoodDiaryEntry,
  getFoodDiaryByDate,
  getWeekFoodDiary,
  getMonthFoodDiary,
  
  // 营养计算
  calculateDayNutrition,
  calculateNutritionPercentage,
  analyzeNutritionBalance,
  
  // 营养目标
  getNutritionGoals,
  saveNutritionGoals,
  resetNutritionGoals,
  
  // 健康提醒
  getHealthReminders,
  getDefaultReminders,
  saveHealthReminder,
  toggleReminder,
  
  // 饮食计划
  getMealPlans,
  saveMealPlan,
  deleteMealPlan,
  
  // 健康食谱
  HEALTHY_RECIPES,
  getRecipes,
  getRecipeById,
  getRecipesByMealType,
  
  // 导出
  exportHealthData
}
