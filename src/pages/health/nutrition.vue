<template>
  <view class="nutrition-page">
    <!-- Header -->
    <view class="header">
      <text class="title">营养分析</text>
      <text class="subtitle">科学配比，健康成长</text>
    </view>

    <!-- Today's Progress -->
    <view class="progress-section">
      <view class="progress-header">
        <text class="section-title">今日摄入</text>
        <text class="date-label">{{ formatDate(selectedDate) }}</text>
      </view>

      <!-- Calorie Ring -->
      <view class="calorie-ring">
        <view class="ring-chart">
          <view class="ring-bg"></view>
          <view class="ring-progress" :style="{ transform: `rotate(${calorieRotation}deg)` }"></view>
          <view class="ring-center">
            <text class="calorie-value">{{ currentNutrition.calories || 0 }}</text>
            <text class="calorie-unit">kcal</text>
          </view>
        </view>
        <view class="calorie-info">
          <text class="goal-text">目标 {{ nutritionGoals.calories?.value || 1800 }} kcal</text>
          <text class="remaining-text">剩余 {{ remainingCalories }} kcal</text>
        </view>
      </view>
    </view>

    <!-- Macro Balance -->
    <view class="macro-section">
      <text class="section-title">三大营养素</text>
      <view class="macro-chart">
        <view class="macro-bar">
          <view class="bar-label">蛋白质</view>
          <view class="bar-track">
            <view class="bar-fill protein" :style="{ width: macroProgress.protein + '%' }"></view>
          </view>
          <view class="bar-value">{{ currentNutrition.protein || 0 }}g / {{ nutritionGoals.protein?.value || 60 }}g</view>
        </view>
        <view class="macro-bar">
          <view class="bar-label">碳水</view>
          <view class="bar-track">
            <view class="bar-fill carb" :style="{ width: macroProgress.carbohydrate + '%' }"></view>
          </view>
          <view class="bar-value">{{ currentNutrition.carbohydrate || 0 }}g / {{ nutritionGoals.carbohydrate?.value || 250 }}g</view>
        </view>
        <view class="macro-bar">
          <view class="bar-label">脂肪</view>
          <view class="bar-track">
            <view class="bar-fill fat" :style="{ width: macroProgress.fat + '%' }"></view>
          </view>
          <view class="bar-value">{{ currentNutrition.fat || 0 }}g / {{ nutritionGoals.fat?.value || 60 }}g</view>
        </view>
      </view>

      <!-- Macro Ratio Pie -->
      <view class="macro-pie">
        <view class="pie-chart">
          <view class="pie-segment protein" :style="{ transform: `rotate(${pieRotation}deg)`, clipPath: proteinClipPath }"></view>
          <view class="pie-segment carb" :style="{ transform: `rotate(${pieRotation + proteinAngle}deg)`, clipPath: carbClipPath }"></view>
          <view class="pie-segment fat" :style="{ transform: `rotate(${pieRotation + proteinAngle + carbAngle}deg)`, clipPath: fatClipPath }"></view>
          <view class="pie-center"></view>
        </view>
        <view class="pie-legend">
          <view class="legend-item">
            <view class="legend-color protein"></view>
            <text class="legend-text">蛋白质 {{ nutritionBalance?.proteinRatio || 0 }}%</text>
          </view>
          <view class="legend-item">
            <view class="legend-color carb"></view>
            <text class="legend-text">碳水 {{ nutritionBalance?.carbRatio || 0 }}%</text>
          </view>
          <view class="legend-item">
            <view class="legend-color fat"></view>
            <text class="legend-text">脂肪 {{ nutritionBalance?.fatRatio || 0 }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Vitamins & Minerals -->
    <view class="vitamins-section">
      <text class="section-title">维生素 & 矿物质</text>
      <view class="nutrient-grid">
        <view class="nutrient-item" v-for="nutrient in vitaminMinerals" :key="nutrient.id">
          <view class="nutrient-icon">{{ nutrient.icon }}</view>
          <view class="nutrient-info">
            <text class="nutrient-name">{{ nutrient.name }}</text>
            <view class="nutrient-bar">
              <view class="nutrient-fill" :style="{ width: getNutrientProgress(nutrient.id) + '%', background: nutrient.color }"></view>
            </view>
            <text class="nutrient-value">{{ getNutrientValue(nutrient.id) }}{{ nutrient.unit }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Balance Analysis -->
    <view class="analysis-section" v-if="nutritionBalance">
      <text class="section-title">膳食平衡分析</text>
      <view class="analysis-card" :class="nutritionBalance.status">
        <view class="analysis-status">
          <text class="status-icon">{{ nutritionBalance.status === 'balanced' ? '✅' : '⚠️' }}</text>
          <text class="status-text">{{ nutritionBalance.status === 'balanced' ? '营养均衡' : '需要调整' }}</text>
        </view>
        <view class="suggestions">
          <view class="suggestion-item" v-for="(s, idx) in nutritionBalance.suggestions" :key="idx">
            <text class="suggestion-icon">💡</text>
            <text class="suggestion-text">{{ s.text }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Week Stats -->
    <view class="stats-section">
      <text class="section-title">本周统计</text>
      <view class="stats-cards">
        <view class="stat-card">
          <text class="stat-value">{{ weekStats.avgCaloriesPerDay || 0 }}</text>
          <text class="stat-label">日均热量(kcal)</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ weekStats.daysLogged || 0 }}</text>
          <text class="stat-label">记录天数</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ weekStats.totalMeals || 0 }}</text>
          <text class="stat-label">总餐次</text>
        </view>
      </view>
    </view>

    <!-- Healthy Recipes -->
    <view class="recipes-section">
      <view class="section-header">
        <text class="section-title">健康食谱推荐</text>
        <text class="more-btn" @click="showAllRecipes">查看更多 ▶</text>
      </view>
      <scroll-view class="recipe-scroll" scroll-x>
        <view class="recipe-card" v-for="recipe in recipes" :key="recipe.id" @click="viewRecipe(recipe)">
          <text class="recipe-icon">{{ recipe.icon }}</text>
          <text class="recipe-name">{{ recipe.name }}</text>
          <text class="recipe-cal">{{ recipe.nutrition.calories }}kcal</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { useHealthStore } from '@/stores/healthStore.js'

export default {
  data() {
    return {
      selectedDate: new Date().toISOString().split('T')[0],
      recipes: []
    }
  },
  computed: {
    currentNutrition() {
      const healthStore = useHealthStore()
      return healthStore.todayNutrition || {}
    },
    nutritionGoals() {
      const healthStore = useHealthStore()
      return healthStore.nutritionGoals
    },
    nutritionBalance() {
      const healthStore = useHealthStore()
      return healthStore.nutritionBalance
    },
    weekStats() {
      const healthStore = useHealthStore()
      return healthStore.weekStats
    },
    nutritionProgress() {
      const healthStore = useHealthStore()
      return healthStore.nutritionProgress
    },
    remainingCalories() {
      const goal = this.nutritionGoals.calories?.value || 1800
      const actual = this.currentNutrition.calories || 0
      return Math.max(0, goal - actual)
    },
    calorieRotation() {
      const goal = this.nutritionGoals.calories?.value || 1800
      const actual = this.currentNutrition.calories || 0
      const percent = Math.min(100, (actual / goal) * 100)
      return (percent / 100) * 360
    },
    macroProgress() {
      const progress = {}
      const goals = this.nutritionGoals
      const actual = this.currentNutrition
      
      Object.keys(goals).forEach(key => {
        if (['protein', 'carbohydrate', 'fat'].includes(key)) {
          const goalValue = goals[key]?.value || 0
          const actualValue = actual[key] || 0
          progress[key] = goalValue > 0 ? Math.min(100, (actualValue / goalValue) * 100) : 0
        }
      })
      
      return progress
    },
    vitaminMinerals() {
      return [
        { id: 'vitaminA', name: '维生素A', icon: '🥕', unit: 'μg', color: '#FF8B94' },
        { id: 'vitaminC', name: '维生素C', icon: '🍊', unit: 'mg', color: '#FFE5B4' },
        { id: 'calcium', name: '钙', icon: '🥛', unit: 'mg', color: '#E0FFFF' },
        { id: 'iron', name: '铁', icon: '🥩', unit: 'mg', color: '#CD853F' },
        { id: 'fiber', name: '膳食纤维', icon: '🥬', unit: 'g', color: '#88D8B0' },
        { id: 'water', name: '水分', icon: '💧', unit: 'ml', color: '#87CEEB' }
      ]
    },
    pieRotation() {
      return -90
    },
    proteinAngle() {
      if (!this.nutritionBalance) return 120
      return (this.nutritionBalance.proteinRatio / 100) * 360
    },
    carbAngle() {
      if (!this.nutritionBalance) return 216
      return (this.nutritionBalance.carbRatio / 100) * 360
    },
    proteinClipPath() {
      return 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)'
    },
    carbClipPath() {
      return 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)'
    },
    fatClipPath() {
      return 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)'
    }
  },
  onLoad() {
    const healthStore = useHealthStore()
    healthStore.init()
    this.recipes = healthStore.getRecipes().slice(0, 4)
  },
  methods: {
    formatDate(dateStr) {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}月${date.getDate()}日`
    },
    getNutrientProgress(nutrientId) {
      const progress = this.nutritionProgress
      return progress[nutrientId]?.percentage || 0
    },
    getNutrientValue(nutrientId) {
      const actual = this.currentNutrition[nutrientId] || 0
      return Math.round(actual)
    },
    showAllRecipes() {
      uni.showToast({ title: '查看更多食谱', icon: 'none' })
    },
    viewRecipe(recipe) {
      uni.showModal({
        title: recipe.name,
        content: `${recipe.description}\n\n热量: ${recipe.nutrition.calories}kcal\n蛋白质: ${recipe.nutrition.protein}g\n碳水: ${recipe.nutrition.carbohydrate}g\n脂肪: ${recipe.nutrition.fat}g\n\n食材: ${recipe.ingredients.join(', ')}\n\n步骤: ${recipe.steps.join(' → ')}`,
        showCancel: false
      })
    }
  }
}
</script>

<style scoped>
.nutrition-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%);
  padding-bottom: 20px;
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

.progress-section,
.macro-section,
.vitamins-section,
.analysis-section,
.stats-section,
.recipes-section {
  margin: 15px;
  padding: 15px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
  display: block;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.more-btn {
  font-size: 13px;
  color: #4CAF50;
}

.date-label {
  font-size: 13px;
  color: #999;
}

/* Calorie Ring */
.calorie-ring {
  display: flex;
  align-items: center;
  gap: 20px;
}

.ring-chart {
  position: relative;
  width: 100px;
  height: 100px;
}

.ring-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 10px solid #f0f0f0;
  box-sizing: border-box;
}

.ring-progress {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 10px solid transparent;
  border-top-color: #FF6B6B;
  transition: transform 0.5s ease;
}

.ring-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.calorie-value {
  font-size: 20px;
  font-weight: bold;
  color: #FF6B6B;
  display: block;
}

.calorie-unit {
  font-size: 11px;
  color: #999;
}

.calorie-info {
  flex: 1;
}

.goal-text {
  font-size: 14px;
  color: #666;
}

.remaining-text {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

/* Macro Bars */
.macro-chart {
  margin-top: 10px;
}

.macro-bar {
  margin-bottom: 12px;
}

.bar-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.bar-track {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.bar-fill.protein { background: #FF6B6B; }
.bar-fill.carb { background: #FFB84C; }
.bar-fill.fat { background: #A8E6CF; }

.bar-value {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
  text-align: right;
}

/* Macro Pie */
.macro-pie {
  display: flex;
  align-items: center;
  margin-top: 20px;
  gap: 20px;
}

.pie-chart {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0f0f0;
  overflow: hidden;
}

.pie-segment {
  position: absolute;
  width: 50%;
  height: 50%;
  top: 0;
  left: 50%;
  transform-origin: 0% 100%;
}

.pie-segment.protein { background: #FF6B6B; }
.pie-segment.carb { background: #FFB84C; }
.pie-segment.fat { background: #A8E6CF; }

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 50%;
}

.pie-legend {
  flex: 1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-color.protein { background: #FF6B6B; }
.legend-color.carb { background: #FFB84C; }
.legend-color.fat { background: #A8E6CF; }

.legend-text {
  font-size: 13px;
  color: #666;
}

/* Vitamins Grid */
.nutrient-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.nutrient-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 10px;
}

.nutrient-icon {
  font-size: 24px;
}

.nutrient-info {
  flex: 1;
}

.nutrient-name {
  font-size: 12px;
  color: #666;
}

.nutrient-bar {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  margin: 4px 0;
  overflow: hidden;
}

.nutrient-fill {
  height: 100%;
  border-radius: 2px;
}

.nutrient-value {
  font-size: 11px;
  color: #999;
}

/* Analysis Card */
.analysis-card {
  padding: 15px;
  border-radius: 12px;
  background: #f9f9f9;
}

.analysis-card.balanced {
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
}

.analysis-card.unbalanced {
  background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%);
}

.analysis-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.status-icon {
  font-size: 20px;
}

.status-text {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.suggestions {
  margin-top: 8px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 6px;
}

.suggestion-icon {
  font-size: 14px;
}

.suggestion-text {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

/* Stats Cards */
.stats-cards {
  display: flex;
  gap: 10px;
}

.stat-card {
  flex: 1;
  text-align: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 10px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #4CAF50;
  display: block;
}

.stat-label {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

/* Recipe Scroll */
.recipe-scroll {
  white-space: nowrap;
}

.recipe-card {
  display: inline-block;
  width: 120px;
  padding: 15px;
  margin-right: 10px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e3f2fd 100%);
  border-radius: 12px;
  text-align: center;
}

.recipe-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 6px;
}

.recipe-name {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  display: block;
  white-space: normal;
}

.recipe-cal {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}
</style>
