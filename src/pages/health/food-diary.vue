<template>
  <view class="food-diary-page">
    <!-- Header -->
    <view class="header">
      <text class="title">饮食日记</text>
      <text class="subtitle">记录每一餐，健康成长</text>
    </view>

    <!-- Date Selector -->
    <view class="date-selector">
      <view class="date-nav" @click="prevDay">
        <text class="nav-arrow">◀</text>
      </view>
      <view class="date-display" @click="showDatePicker">
        <text class="date-text">{{ formatDate(selectedDate) }}</text>
        <text class="date-icon">📅</text>
      </view>
      <view class="date-nav" @click="nextDay">
        <text class="nav-arrow">▶</text>
      </view>
    </view>

    <!-- Meal Type Tabs -->
    <view class="meal-tabs">
      <view 
        v-for="meal in mealTypes" 
        :key="meal.id"
        :class="['meal-tab', { active: selectedMealType === meal.id }]"
        @click="selectMealType(meal.id)"
      >
        <text class="meal-icon">{{ meal.icon }}</text>
        <text class="meal-name">{{ meal.name }}</text>
        <text class="meal-count">{{ getMealCount(meal.id) }}项</text>
      </view>
    </view>

    <!-- Today's Nutrition Summary -->
    <view class="nutrition-summary" v-if="todayNutrition">
      <view class="summary-item">
        <text class="summary-value">{{ todayNutrition.calories || 0 }}</text>
        <text class="summary-unit">kcal</text>
      </view>
      <view class="summary-divider"></view>
      <view class="summary-item">
        <text class="summary-value">{{ todayNutrition.protein || 0 }}g</text>
        <text class="summary-label">蛋白质</text>
      </view>
      <view class="summary-item">
        <text class="summary-value">{{ todayNutrition.carbohydrate || 0 }}g</text>
        <text class="summary-label">碳水</text>
      </view>
      <view class="summary-item">
        <text class="summary-value">{{ todayNutrition.fat || 0 }}g</text>
        <text class="summary-label">脂肪</text>
      </view>
    </view>

    <!-- Food List for Selected Meal -->
    <scroll-view class="food-list" scroll-y>
      <view v-if="currentMealFoods.length === 0" class="empty-state">
        <text class="empty-icon">🍽️</text>
        <text class="empty-text">还没有添加食物</text>
        <text class="empty-hint">点击下方添加食物</text>
      </view>

      <view 
        v-for="food in currentMealFoods" 
        :key="food.id"
        class="food-item"
      >
        <view class="food-info">
          <text class="food-name">{{ food.name }}</text>
          <text class="food-detail">{{ food.portion }} · {{ food.calories }}kcal</text>
        </view>
        <view class="food-actions">
          <text class="delete-btn" @click="deleteFood(food.id)">🗑️</text>
        </view>
      </view>
    </scroll-view>

    <!-- Add Food Button -->
    <view class="add-food-section">
      <button class="add-food-btn" @click="showFoodSelector">
        <text class="btn-icon">➕</text>
        <text class="btn-text">添加食物</text>
      </button>
    </view>

    <!-- Food Selector Modal -->
    <view v-if="showSelector" class="modal-overlay" @click="hideFoodSelector">
      <view class="modal-content food-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择食物</text>
          <text class="modal-close" @click="hideFoodSelector">✕</text>
        </view>
        
        <view class="search-bar">
          <input 
            class="search-input" 
            v-model="searchKeyword"
            placeholder="搜索食物..."
            @input="onSearchInput"
          />
        </view>

        <scroll-view class="food-options" scroll-y>
          <view 
            v-for="food in searchResults" 
            :key="food.id"
            class="food-option"
            @click="selectFood(food)"
          >
            <view class="option-info">
              <text class="option-name">{{ food.name }}</text>
              <text class="option-detail">{{ food.category }} · {{ food.portion }}</text>
            </view>
            <view class="option-nutrition">
              <text class="option-calories">{{ food.calories }}kcal</text>
              <text class="option-protein">蛋白{{ food.protein }}g</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import { useHealthStore } from '@/stores/healthStore.js'

export default {
  data() {
    return {
      mealTypes: [
        { id: 'breakfast', name: '早餐', icon: '🌅' },
        { id: 'lunch', name: '午餐', icon: '☀️' },
        { id: 'dinner', name: '晚餐', icon: '🌙' },
        { id: 'snack', name: '加餐', icon: '🍎' }
      ],
      selectedMealType: 'breakfast',
      selectedDate: new Date().toISOString().split('T')[0],
      showSelector: false,
      searchKeyword: '',
      searchResults: []
    }
  },
  computed: {
    todayNutrition() {
      const healthStore = useHealthStore()
      return healthStore.todayNutrition
    },
    currentMealFoods() {
      const healthStore = useHealthStore()
      const diary = healthStore.todayDiary
      if (!diary || !diary.meals || !diary.meals[this.selectedMealType]) {
        return []
      }
      return diary.meals[this.selectedMealType]
    },
    getMealCount() {
      return (mealType) => {
        const healthStore = useHealthStore()
        const diary = healthStore.todayDiary
        if (!diary || !diary.meals || !diary.meals[mealType]) {
          return 0
        }
        return diary.meals[mealType].length
      }
    }
  },
  onLoad() {
    const healthStore = useHealthStore()
    healthStore.init()
    this.searchResults = healthStore.searchFood('')
  },
  methods: {
    formatDate(dateStr) {
      const date = new Date(dateStr)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (dateStr === today.toISOString().split('T')[0]) {
        return '今天'
      } else if (dateStr === yesterday.toISOString().split('T')[0]) {
        return '昨天'
      }
      return `${date.getMonth() + 1}月${date.getDate()}日`
    },
    prevDay() {
      const date = new Date(this.selectedDate)
      date.setDate(date.getDate() - 1)
      this.selectedDate = date.toISOString().split('T')[0]
      const healthStore = useHealthStore()
      healthStore.setSelectedDate(this.selectedDate)
    },
    nextDay() {
      const date = new Date(this.selectedDate)
      date.setDate(date.getDate() + 1)
      this.selectedDate = date.toISOString().split('T')[0]
      const healthStore = useHealthStore()
      healthStore.setSelectedDate(this.selectedDate)
    },
    showDatePicker() {
      uni.showDatePicker({
        currentDate: this.selectedDate,
        success: (res) => {
          this.selectedDate = res.date
          const healthStore = useHealthStore()
          healthStore.setSelectedDate(this.selectedDate)
        }
      })
    },
    selectMealType(type) {
      this.selectedMealType = type
      const healthStore = useHealthStore()
      healthStore.setSelectedMealType(type)
    },
    getMealCount(mealType) {
      const healthStore = useHealthStore()
      const diary = healthStore.todayDiary
      if (!diary || !diary.meals || !diary.meals[mealType]) {
        return 0
      }
      return diary.meals[mealType].length
    },
    showFoodSelector() {
      this.showSelector = true
      const healthStore = useHealthStore()
      this.searchResults = healthStore.searchFood('')
    },
    hideFoodSelector() {
      this.showSelector = false
      this.searchKeyword = ''
    },
    onSearchInput() {
      const healthStore = useHealthStore()
      this.searchResults = healthStore.searchFood(this.searchKeyword)
    },
    selectFood(food) {
      const healthStore = useHealthStore()
      healthStore.addFoodEntry({
        mealType: this.selectedMealType,
        foodId: food.id,
        name: food.name,
        amount: 1,
        portion: food.portion,
        calories: food.calories,
        protein: food.protein || 0,
        carbohydrate: food.carbohydrate || 0,
        fat: food.fat || 0,
        fiber: food.fiber || 0,
        vitaminC: food.vitaminC || 0,
        vitaminA: food.vitaminA || 0,
        calcium: food.calcium || 0,
        iron: food.iron || 0,
        water: food.water || 0
      })
      this.hideFoodSelector()
    },
    deleteFood(entryId) {
      const healthStore = useHealthStore()
      healthStore.removeFoodEntry(this.selectedMealType, entryId)
    }
  }
}
</script>

<style scoped>
.food-diary-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%);
  padding-bottom: 120px;
}

.header {
  padding: 40px 20px 20px;
  text-align: center;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  display: block;
}

.subtitle {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
  display: block;
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  gap: 20px;
}

.date-nav {
  padding: 8px 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.nav-arrow {
  font-size: 14px;
  color: #666;
}

.date-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.date-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.date-icon {
  font-size: 14px;
}

.meal-tabs {
  display: flex;
  padding: 10px 15px;
  gap: 8px;
}

.meal-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.2s;
}

.meal-tab.active {
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.meal-tab.active .meal-name,
.meal-tab.active .meal-count {
  color: #fff;
}

.meal-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.meal-name {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.meal-count {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.nutrition-summary {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 15px 15px;
  padding: 15px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-value {
  font-size: 20px;
  font-weight: bold;
  color: #FF6B6B;
}

.summary-unit {
  font-size: 12px;
  color: #999;
}

.summary-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.summary-divider {
  width: 1px;
  height: 30px;
  background: #eee;
}

.food-list {
  height: calc(100vh - 450px);
  padding: 0 15px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.empty-text {
  font-size: 16px;
  color: #999;
}

.empty-hint {
  font-size: 12px;
  color: #ccc;
  margin-top: 4px;
}

.food-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
}

.food-info {
  flex: 1;
}

.food-name {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.food-detail {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.delete-btn {
  font-size: 18px;
  padding: 5px 10px;
}

.add-food-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px 20px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.add-food-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
  border-radius: 24px;
  border: none;
}

.btn-icon {
  font-size: 18px;
}

.btn-text {
  font-size: 16px;
  color: #fff;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 20px 20px 0 0;
  width: 100%;
}

.food-modal {
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 20px;
  color: #999;
  padding: 5px;
}

.search-bar {
  padding: 10px 15px;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 15px;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 14px;
}

.food-options {
  flex: 1;
  padding: 0 15px;
  max-height: 50vh;
}

.food-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.option-info {
  flex: 1;
}

.option-name {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.option-detail {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.option-nutrition {
  text-align: right;
}

.option-calories {
  font-size: 14px;
  color: #FF6B6B;
  font-weight: 500;
}

.option-protein {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}
</style>
