<template>
  <view class="reminders-page">
    <!-- Header -->
    <view class="header">
      <text class="title">健康提醒</text>
      <text class="subtitle">养成健康习惯，从现在开始</text>
    </view>

    <!-- Active Reminders -->
    <view class="reminders-section">
      <view class="section-header">
        <text class="section-title">提醒设置</text>
        <view class="header-actions">
          <text class="action-btn" @click="showAddReminder">➕ 添加</text>
        </view>
      </view>

      <view class="reminder-list">
        <view 
          v-for="reminder in reminders" 
          :key="reminder.id"
          class="reminder-item"
          :class="{ disabled: !reminder.enabled }"
        >
          <view class="reminder-icon">{{ reminder.icon }}</view>
          <view class="reminder-info">
            <text class="reminder-name">{{ reminder.name }}</text>
            <text class="reminder-desc">{{ reminder.message }}</text>
            <text class="reminder-interval">每 {{ reminder.interval }} 分钟提醒</text>
          </view>
          <view class="reminder-toggle" @click="toggleReminder(reminder.id)">
            <view class="toggle-track" :class="{ active: reminder.enabled }">
              <view class="toggle-thumb"></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Quick Actions -->
    <view class="quick-actions">
      <text class="section-title">快捷操作</text>
      <view class="action-grid">
        <view class="action-card" @click="quickAction('water')">
          <text class="action-icon">💧</text>
          <text class="action-name">喝水</text>
          <text class="action-desc">记录饮水</text>
        </view>
        <view class="action-card" @click="quickAction('eye')">
          <text class="action-icon">👀</text>
          <text class="action-name">眼保健操</text>
          <text class="action-desc">休息眼睛</text>
        </view>
        <view class="action-card" @click="quickAction('stretch')">
          <text class="action-icon">🧘</text>
          <text class="action-name">伸展运动</text>
          <text class="action-desc">活动身体</text>
        </view>
        <view class="action-card" @click="quickAction('meal')">
          <text class="action-icon">🍽️</text>
          <text class="action-name">用餐提醒</text>
          <text class="action-desc">规律饮食</text>
        </view>
      </view>
    </view>

    <!-- Meal Plans -->
    <view class="meal-plans-section">
      <view class="section-header">
        <text class="section-title">饮食计划</text>
        <text class="action-btn" @click="showAddPlan">➕ 新建</text>
      </view>

      <view v-if="mealPlans.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">还没有饮食计划</text>
        <text class="empty-hint">创建饮食计划，培养健康习惯</text>
      </view>

      <view class="plan-list">
        <view 
          v-for="plan in mealPlans" 
          :key="plan.id"
          class="plan-item"
        >
          <view class="plan-info">
            <text class="plan-name">{{ plan.name }}</text>
            <text class="plan-desc">{{ plan.description }}</text>
          </view>
          <view class="plan-actions">
            <text class="plan-btn" @click="editPlan(plan)">✏️</text>
            <text class="plan-btn" @click="deletePlan(plan.id)">🗑️</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Tips -->
    <view class="tips-section">
      <text class="section-title">健康小贴士</text>
      <view class="tips-carousel">
        <view class="tip-card" v-for="(tip, idx) in healthTips" :key="idx">
          <text class="tip-icon">{{ tip.icon }}</text>
          <text class="tip-title">{{ tip.title }}</text>
          <text class="tip-content">{{ tip.content }}</text>
        </view>
      </view>
    </view>

    <!-- Add/Edit Reminder Modal -->
    <view v-if="showReminderModal" class="modal-overlay" @click="hideReminderModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingReminder ? '编辑提醒' : '添加提醒' }}</text>
          <text class="modal-close" @click="hideReminderModal">✕</text>
        </view>
        
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">提醒名称</text>
            <input class="form-input" v-model="reminderForm.name" placeholder="如：喝水提醒" />
          </view>
          
          <view class="form-item">
            <text class="form-label">提醒消息</text>
            <input class="form-input" v-model="reminderForm.message" placeholder="提醒内容" />
          </view>
          
          <view class="form-item">
            <text class="form-label">提醒间隔（分钟）</text>
            <input class="form-input" type="number" v-model="reminderForm.interval" placeholder="60" />
          </view>
          
          <view class="form-item">
            <text class="form-label">选择图标</text>
            <view class="icon-picker">
              <text 
                v-for="icon in iconOptions" 
                :key="icon"
                :class="['icon-option', { selected: reminderForm.icon === icon }]"
                @click="reminderForm.icon = icon"
              >{{ icon }}</text>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="btn-cancel" @click="hideReminderModal">取消</button>
          <button class="btn-confirm" @click="saveReminder">保存</button>
        </view>
      </view>
    </view>

    <!-- Add/Edit Plan Modal -->
    <view v-if="showPlanModal" class="modal-overlay" @click="hidePlanModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingPlan ? '编辑计划' : '新建计划' }}</text>
          <text class="modal-close" @click="hidePlanModal">✕</text>
        </view>
        
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">计划名称</text>
            <input class="form-input" v-model="planForm.name" placeholder="如：健康成长计划" />
          </view>
          
          <view class="form-item">
            <text class="form-label">计划描述</text>
            <textarea class="form-textarea" v-model="planForm.description" placeholder="简要描述..."></textarea>
          </view>
          
          <view class="form-item">
            <text class="form-label">目标餐次</text>
            <view class="meal-picker">
              <view 
                v-for="meal in mealTypes" 
                :key="meal.id"
                :class="['meal-option', { selected: planForm.meals.includes(meal.id) }]"
                @click="togglePlanMeal(meal.id)"
              >
                <text class="meal-icon">{{ meal.icon }}</text>
                <text class="meal-name">{{ meal.name }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="btn-cancel" @click="hidePlanModal">取消</button>
          <button class="btn-confirm" @click="savePlan">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useHealthStore } from '@/stores/healthStore.js'
import healthService from '@/services/healthService.js'

export default {
  data() {
    return {
      showReminderModal: false,
      showPlanModal: false,
      editingReminder: null,
      editingPlan: null,
      reminderForm: {
        name: '',
        message: '',
        interval: 60,
        icon: '💧'
      },
      planForm: {
        name: '',
        description: '',
        meals: []
      },
      mealTypes: [
        { id: 'breakfast', name: '早餐', icon: '🌅' },
        { id: 'lunch', name: '午餐', icon: '☀️' },
        { id: 'dinner', name: '晚餐', icon: '🌙' },
        { id: 'snack', name: '加餐', icon: '🍎' }
      ],
      iconOptions: ['💧', '👀', '🧘', '🍽️', '🌅', '☀️', '🌙', '🍎', '🥗', '💪'],
      healthTips: [
        { icon: '💧', title: '定时饮水', content: '每小时喝一杯水，保持身体水分充足。' },
        { icon: '👀', title: '眼睛休息', content: '每用眼30分钟，远眺20秒，缓解眼部疲劳。' },
        { icon: '🧘', title: '适当运动', content: '每天进行适量的户外活动，增强体质。' },
        { icon: '🥗', title: '均衡饮食', content: '蔬菜水果不可少，荤素搭配要合理。' }
      ]
    }
  },
  computed: {
    reminders() {
      const healthStore = useHealthStore()
      return healthStore.reminders
    },
    mealPlans() {
      const healthStore = useHealthStore()
      return healthStore.mealPlans
    }
  },
  onLoad() {
    const healthStore = useHealthStore()
    healthStore.init()
  },
  methods: {
    toggleReminder(id) {
      const healthStore = useHealthStore()
      healthStore.toggleReminder(id)
    },
    showAddReminder() {
      this.editingReminder = null
      this.reminderForm = {
        name: '',
        message: '',
        interval: 60,
        icon: '💧'
      }
      this.showReminderModal = true
    },
    hideReminderModal() {
      this.showReminderModal = false
      this.editingReminder = null
    },
    saveReminder() {
      const healthStore = useHealthStore()
      const reminder = {
        id: this.editingReminder?.id || 'reminder_' + Date.now(),
        type: this.reminderForm.name.includes('水') ? 'water' : 
              this.reminderForm.name.includes('眼') ? 'eye' :
              this.reminderForm.name.includes('伸展') ? 'stretch' : 'meal',
        ...this.reminderForm,
        enabled: true
      }
      healthStore.updateReminder(reminder)
      this.hideReminderModal()
      uni.showToast({ title: '保存成功', icon: 'success' })
    },
    quickAction(type) {
      let message = ''
      switch(type) {
        case 'water':
          const waterLog = healthService.addWaterLog(250)
          message = waterLog ? `今日已喝 ${waterLog.totalMl}ml` : '记录失败'
          break
        case 'eye':
          healthService.addEyeBreakLog()
          message = '眼睛休息已记录'
          break
        case 'stretch':
          message = '伸展运动已记录'
          break
        case 'meal':
          message = '用餐提醒已发送'
          break
      }
      uni.showToast({ title: message, icon: 'none' })
    },
    showAddPlan() {
      this.editingPlan = null
      this.planForm = {
        name: '',
        description: '',
        meals: []
      }
      this.showPlanModal = true
    },
    hidePlanModal() {
      this.showPlanModal = false
      this.editingPlan = null
    },
    togglePlanMeal(mealId) {
      const idx = this.planForm.meals.indexOf(mealId)
      if (idx >= 0) {
        this.planForm.meals.splice(idx, 1)
      } else {
        this.planForm.meals.push(mealId)
      }
    },
    savePlan() {
      if (!this.planForm.name) {
        uni.showToast({ title: '请输入计划名称', icon: 'none' })
        return
      }
      const healthStore = useHealthStore()
      const plan = {
        id: this.editingPlan?.id || 'plan_' + Date.now(),
        ...this.planForm
      }
      healthStore.addMealPlan(plan)
      this.hidePlanModal()
      uni.showToast({ title: '保存成功', icon: 'success' })
    },
    editPlan(plan) {
      this.editingPlan = plan
      this.planForm = { ...plan }
      this.showPlanModal = true
    },
    deletePlan(id) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个饮食计划吗？',
        success: (res) => {
          if (res.confirm) {
            const healthStore = useHealthStore()
            healthStore.removeMealPlan(id)
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.reminders-page {
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

.reminders-section,
.quick-actions,
.meal-plans-section,
.tips-section {
  margin: 15px;
  padding: 15px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.action-btn {
  font-size: 13px;
  color: #4CAF50;
}

/* Reminder List */
.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reminder-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 12px;
  transition: opacity 0.2s;
}

.reminder-item.disabled {
  opacity: 0.5;
}

.reminder-icon {
  font-size: 32px;
}

.reminder-info {
  flex: 1;
}

.reminder-name {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.reminder-desc {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
  display: block;
}

.reminder-interval {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
  display: block;
}

/* Toggle */
.reminder-toggle {
  padding: 5px;
}

.toggle-track {
  width: 44px;
  height: 24px;
  background: #ddd;
  border-radius: 12px;
  position: relative;
  transition: background 0.2s;
}

.toggle-track.active {
  background: #4CAF50;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-track.active .toggle-thumb {
  transform: translateX(20px);
}

/* Quick Actions */
.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 8px;
  background: #f9f9f9;
  border-radius: 12px;
}

.action-icon {
  font-size: 28px;
  margin-bottom: 6px;
}

.action-name {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.action-desc {
  font-size: 10px;
  color: #999;
  margin-top: 2px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 30px 20px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.empty-text {
  font-size: 15px;
  color: #999;
}

.empty-hint {
  font-size: 12px;
  color: #ccc;
  margin-top: 4px;
}

/* Plan List */
.plan-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.plan-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 10px;
}

.plan-info {
  flex: 1;
}

.plan-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.plan-desc {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.plan-actions {
  display: flex;
  gap: 8px;
}

.plan-btn {
  font-size: 16px;
  padding: 5px;
}

/* Tips Carousel */
.tips-carousel {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.tip-card {
  flex-shrink: 0;
  width: 140px;
  padding: 12px;
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  border-radius: 12px;
  text-align: center;
}

.tip-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 6px;
}

.tip-title {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  display: block;
}

.tip-content {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  line-height: 1.3;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  max-height: 80vh;
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
}

.modal-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  border: none;
  font-size: 15px;
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;
}

.btn-confirm {
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
  color: #fff;
}

/* Form */
.form-item {
  margin-bottom: 15px;
}

.form-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
  display: block;
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 14px;
}

.form-textarea {
  width: 100%;
  height: 80px;
  padding: 10px 12px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
}

.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-option {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
}

.icon-option.selected {
  background: #E8F5E9;
  box-shadow: 0 0 0 2px #4CAF50;
}

.meal-picker {
  display: flex;
  gap: 8px;
}

.meal-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
}

.meal-option.selected {
  background: #E8F5E9;
}

.meal-icon {
  font-size: 20px;
}

.meal-name {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}
</style>
