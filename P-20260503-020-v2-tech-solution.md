# future-little-leaders V2 — 技术方案

## 1. 概述

本文档描述 V2 版本 P0 模块的技术实现方案：
- M1: 成就系统
- M2: 成长报告
- M3: 任务模板

---

## 2. 技术架构

### 2.1 技术栈
- **框架**: uni-app（多平台 H5）
- **前端**: Vue 3 + Composition API
- **状态管理**: Pinia 2.1.7
- **存储**: localStorage
- **构建**: Vite

### 2.2 文件变更

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新增 | `src/stores/achievementStore.js` | 成就状态管理 |
| 新增 | `src/stores/reportStore.js` | 成长报告状态管理 |
| 新增 | `src/stores/taskTemplateStore.js` | 任务模板状态管理 |
| 新增 | `src/pages/achievement/achievement.vue` | 成就页面 |
| 新增 | `src/pages/report/report.vue` | 成长报告页面 |
| 修改 | `src/pages/index/index.vue` | 添加报告入口、周报弹窗触发 |
| 修改 | `src/pages/task/add-task.vue` | 添加模板选择器 |
| 修改 | `src/pages/profile/profile.vue` | 添加成就入口 |
| 修改 | `pages.json` | 添加新页面路由 |

---

## 3. M1: 成就系统

### 3.1 数据结构

```javascript
// localStorage keys
const ACHIEVEMENTS_KEY = 'achievements'  // 已解锁成就
const ACHIEVEMENT_NOTIFICATIONS_KEY = 'achievement_notifications'  // 待显示通知

// 成就定义（静态配置）
const ACHIEVEMENT_DEFINITIONS = [
  // 坚持类
  { id: 'streak_7', name: '初出茅庐', description: '连续打卡7天', icon: '🏆', category: 'streak', condition: { type: 'streak', value: 7 } },
  { id: 'streak_30', name: '持之以恒', description: '连续打卡30天', icon: '💪', category: 'streak', condition: { type: 'streak', value: 30 } },
  { id: 'streak_100', name: '百年树人', description: '连续打卡100天', icon: '👑', category: 'streak', condition: { type: 'streak', value: 100 } },

  // 数量类
  { id: 'tasks_100', name: '小试牛刀', description: '累计完成任务100次', icon: '📝', category: 'count', condition: { type: 'tasks_completed', value: 100 } },
  { id: 'points_1000', name: '积少成多', description: '累计获得1000积分', icon: '💎', category: 'count', condition: { type: 'points_earned', value: 1000 } },
  { id: 'points_5000', name: '富甲一方', description: '累计获得5000积分', icon: '🪙', category: 'count', condition: { type: 'points_earned', value: 5000 } },

  // 收集类
  { id: 'tags_all', name: '全能标签', description: '使用过所有任务标签', icon: '🏷️', category: 'collect', condition: { type: 'tags_unlocked', value: 'all' } },
  { id: 'first_exchange', name: '初次兑换', description: '完成首次商品兑换', icon: '🎁', category: 'collect', condition: { type: 'exchanges_count', value: 1 } },

  // 特殊类
  { id: 'first_baby', name: '喜添新丁', description: '添加第一个宝宝', icon: '👶', category: 'special', condition: { type: 'babies_count', value: 1 } },
  { id: 'level_10', name: '小有成就', description: '宝宝达到10级', icon: '⭐', category: 'special', condition: { type: 'baby_level', value: 10 } },
  { id: 'perfect_week', name: '完美一周', description: '一周内每天完成任务', icon: '🌟', category: 'special', condition: { type: 'perfect_week', value: true } },
  { id: 'first_template', name: '模板达人', description: '使用模板创建任务', icon: '📋', category: 'special', condition: { type: 'template_used', value: true } },

  // 更多成就...
  { id: 'tasks_500', name: '熟能生巧', description: '累计完成任务500次', icon: '🎯', category: 'count', condition: { type: 'tasks_completed', value: 500 } },
  { id: 'points_10000', name: '富可敌国', description: '累计获得10000积分', icon: '💰', category: 'count', condition: { type: 'points_earned', value: 10000 } },
  { id: 'babies_2', name: '双喜临门', description: '添加第二个宝宝', icon: '👫', category: 'special', condition: { type: 'babies_count', value: 2 } },
  { id: 'streak_7_all', name: '全员坚持', description: '所有宝宝都连续打卡7天', icon: '👨‍👩‍👧‍👦', category: 'streak', condition: { type: 'all_babies_streak', value: 7 } },
  { id: 'community_first', name: '社区之星', description: '发布第一篇社区动态', icon: '📢', category: 'special', condition: { type: 'posts_count', value: 1 } },
  { id: 'level_50', name: '卓尔不凡', description: '宝宝达到50级', icon: '🌈', category: 'special', condition: { type: 'baby_level', value: 50 } },
]

// 已解锁成就存储格式
{
  unlockedAchievements: [
    { id: 'streak_7', unlockedAt: '2026-05-03T10:00:00Z', pointsAwarded: 50 }
  ]
}
```

### 3.2 achievementStore 实现

```javascript
// src/stores/achievementStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAchievementStore = defineStore('achievement', () => {
  const unlockedAchievements = ref([])  // 已解锁成就列表
  const pendingNotifications = ref([])  // 待显示的通知队列

  // 初始化
  const init = () => {
    try {
      const stored = uni.getStorageSync('achievements')
      unlockedAchievements.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      unlockedAchievements.value = []
    }
  }

  // 检查是否已解锁
  const isUnlocked = (achievementId) => {
    return unlockedAchievements.value.some(a => a.id === achievementId)
  }

  // 解锁成就
  const unlock = (achievementId, points = 0) => {
    if (isUnlocked(achievementId)) return false

    unlockedAchievements.value.push({
      id: achievementId,
      unlockedAt: new Date().toISOString(),
      pointsAwarded: points
    })

    save()

    // 添加到通知队列
    const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId)
    if (achievement) {
      pendingNotifications.value.push({
        id: achievementId,
        name: achievement.name,
        icon: achievement.icon,
        description: achievement.description,
        points: points
      })
    }

    return true
  }

  // 弹出通知
  const popNotification = () => {
    return pendingNotifications.value.shift()
  }

  // 计算属性
  const unlockedCount = computed(() => unlockedAchievements.value.length)
  const totalCount = ACHIEVEMENT_DEFINITIONS.length

  // 保存
  const save = () => {
    uni.setStorageSync('achievements', JSON.stringify(unlockedAchievements.value))
  }

  // 检查所有条件并解锁
  const checkAndUnlock = (stats) => {
    // streak_7
    if (stats.currentStreak >= 7 && !isUnlocked('streak_7')) {
      unlock('streak_7', 50)
    }
    // ... 其他检查类似
  }

  return {
    unlockedAchievements,
    pendingNotifications,
    init,
    isUnlocked,
    unlock,
    popNotification,
    unlockedCount,
    totalCount,
    checkAndUnlock
  }
})
```

### 3.3 成就页面

```vue
<!-- src/pages/achievement/achievement.vue -->
<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">←</view>
      <text class="nav-title">成就</text>
      <view class="nav-right">{{ unlockedCount }}/{{ totalCount }}</view>
    </view>

    <!-- 成就列表 -->
    <scroll-view scroll-y class="achievement-list">
      <!-- 已解锁 -->
      <view class="achievement-section">
        <text class="section-title">已解锁 ({{ unlockedCount }})</text>
        <view class="achievement-grid">
          <view v-for="achievement in unlockedList" :key="achievement.id"
                class="achievement-item unlocked" @tap="showDetail(achievement)">
            <text class="achievement-icon">{{ achievement.icon }}</text>
            <text class="achievement-name">{{ achievement.name }}</text>
          </view>
        </view>
      </view>

      <!-- 未解锁 -->
      <view class="achievement-section">
        <text class="section-title">未解锁 ({{ totalCount - unlockedCount }})</text>
        <view class="achievement-grid">
          <view v-for="achievement in lockedList" :key="achievement.id"
                class="achievement-item locked" @tap="showDetail(achievement)">
            <text class="achievement-icon">🔒</text>
            <text class="achievement-name">{{ achievement.name }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 解锁弹窗 -->
    <uni-popup ref="unlockPopup" type="center">
      <view class="unlock-modal">
        <text class="unlock-icon">{{ currentAchievement?.icon }}</text>
        <text class="unlock-title">成就解锁！</text>
        <text class="unlock-name">{{ currentAchievement?.name }}</text>
        <text class="unlock-desc">{{ currentAchievement?.description }}</text>
        <text class="unlock-points">+{{ currentAchievement?.points }} 积分</text>
        <button @tap="closeUnlock">确定</button>
      </view>
    </uni-popup>
  </view>
</template>
```

---

## 4. M2: 成长报告

### 4.1 数据结构

```javascript
// localStorage keys
const WEEKLY_REPORTS_KEY = 'weekly_reports'
const MONTHLY_REPORTS_KEY = 'monthly_reports'

// 周报格式
{
  week: '2026-W18',  // ISO 周次
  startDate: '2026-05-01',
  endDate: '2026-05-07',
  tasksCompleted: 15,
  tasksTotal: 21,
  pointsEarned: 120,
  pointsSpent: 50,
  streakDays: 5,
  topTags: ['学习', '运动'],
  babyProgress: {
    'baby-id-1': { tasksCompleted: 15, level: 5 }
  }
}

// 月报格式
{
  month: '2026-04',
  tasksCompleted: 62,
  pointsEarned: 480,
  pointsSpent: 200,
  longestStreak: 12,
  achievementsUnlocked: 3,
  babyProgress: {
    'baby-id-1': { tasksCompleted: 62, level: 8 }
  }
}
```

### 4.2 reportStore 实现

```javascript
// src/stores/reportStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useReportStore = defineStore('report', () => {
  const weeklyReports = ref([])
  const monthlyReports = ref([])

  // 获取当前周次 ISO 格式
  const getCurrentWeek = () => {
    const now = new Date()
    const year = new Date(now.getFullYear(), 0, 1)
    const weekNum = Math.ceil(((now - year) / 86400000 + year.getDay() + 1) / 7)
    return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
  }

  // 获取本周开始和结束日期
  const getWeekDates = (weekStr) => {
    const [year, week] = weekStr.split('-W').map(Number)
    const jan1 = new Date(year, 0, 1)
    const days = (week - 1) * 7
    const startDate = new Date(jan1.getTime() + days * 86400000)
    const endDate = new Date(startDate.getTime() + 6 * 86400000)
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }

  // 生成周报
  const generateWeeklyReport = (taskRecords, pointsRecords, babyId) => {
    const week = getCurrentWeek()
    const { startDate, endDate } = getWeekDates(week)

    // 过滤本周数据
    const weekTasks = taskRecords.filter(t => {
      const taskDate = new Date(t.completedAt).toISOString().split('T')[0]
      return taskDate >= startDate && taskDate <= endDate
    })

    const weekPoints = pointsRecords.filter(p => {
      const pointDate = new Date(p.createdAt).toISOString().split('T')[0]
      return pointDate >= startDate && pointDate <= endDate
    })

    const report = {
      week,
      startDate,
      endDate,
      tasksCompleted: weekTasks.length,
      tasksTotal: weekTasks.length,  // 简化
      pointsEarned: weekPoints.filter(p => p.type === 'earn').reduce((sum, p) => sum + p.amount, 0),
      pointsSpent: weekPoints.filter(p => p.type === 'spend').reduce((sum, p) => sum + p.amount, 0),
      streakDays: calculateStreak(taskRecords),  // 需从 taskStore 获取
    }

    // 检查是否已存在
    const existingIndex = weeklyReports.value.findIndex(r => r.week === week)
    if (existingIndex >= 0) {
      weeklyReports.value[existingIndex] = report
    } else {
      weeklyReports.value.push(report)
    }

    save()
    return report
  }

  // 保存
  const save = () => {
    uni.setStorageSync(WEEKLY_REPORTS_KEY, JSON.stringify(weeklyReports.value))
    uni.setStorageSync(MONTHLY_REPORTS_KEY, JSON.stringify(monthlyReports.value))
  }

  // 初始化
  const init = () => {
    try {
      const weekly = uni.getStorageSync(WEEKLY_REPORTS_KEY)
      const monthly = uni.getStorageSync(MONTHLY_REPORTS_KEY)
      weeklyReports.value = weekly ? JSON.parse(weekly) : []
      monthlyReports.value = monthly ? JSON.parse(monthly) : []
    } catch (e) {
      weeklyReports.value = []
      monthlyReports.value = []
    }
  }

  return {
    weeklyReports,
    monthlyReports,
    generateWeeklyReport,
    getCurrentWeek,
    init
  }
})
```

### 4.3 报告页面

```vue
<!-- src/pages/report/report.vue -->
<template>
  <view class="page-container">
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">←</view>
      <text class="nav-title">成长报告</text>
    </view>

    <scroll-view scroll-y class="report-content">
      <!-- 周报 -->
      <view class="report-section">
        <view class="section-header">
          <text class="section-title">本周周报</text>
          <text class="section-date">{{ currentWeekStart }} ~ {{ currentWeekEnd }}</text>
        </view>

        <view class="stats-grid">
          <view class="stat-card">
            <text class="stat-value">{{ weeklyReport.tasksCompleted }}</text>
            <text class="stat-label">完成任务</text>
          </view>
          <view class="stat-card">
            <text class="stat-value">{{ weeklyReport.pointsEarned }}</text>
            <text class="stat-label">获得积分</text>
          </view>
          <view class="stat-card">
            <text class="stat-value">{{ weeklyReport.streakDays }}</text>
            <text class="stat-label">连续天数</text>
          </view>
        </view>

        <!-- 鼓励文案 -->
        <view class="encourage-text">
          {{ getEncourageMessage() }}
        </view>
      </view>

      <!-- 历史周报 -->
      <view class="report-section">
        <text class="section-title">历史周报</text>
        <view class="history-list">
          <view v-for="report in historyWeekly" :key="report.week"
                class="history-item" @tap="showWeeklyDetail(report)">
            <text class="history-week">{{ report.week }}</text>
            <text class="history-stats">{{ report.tasksCompleted }}任务 / {{ report.pointsEarned }}积分</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>
```

---

## 5. M3: 任务模板

### 5.1 数据结构

```javascript
// localStorage keys
const TASK_TEMPLATES_KEY = 'task_templates'

// 预设模板
const DEFAULT_TEMPLATES = [
  { id: 't1', title: '早起打卡', description: '按时起床，开始新的一天', points: 5, recurringType: 'daily', tags: ['生活习惯'] },
  { id: 't2', title: '阅读30分钟', description: '每天阅读，积累知识', points: 10, recurringType: 'daily', tags: ['学习'] },
  { id: 't3', title: '整理房间', description: '保持整洁，养成好习惯', points: 5, recurringType: 'daily', tags: ['生活习惯'] },
  { id: 't4', title: '运动30分钟', description: '强身健体，活力满满', points: 10, recurringType: 'daily', tags: ['运动'] },
  { id: 't5', title: '帮忙做家务', description: '分担家务，懂得责任', points: 8, recurringType: 'daily', tags: ['生活习惯'] },
  { id: 't6', title: '按时睡觉', description: '早睡早起，健康成长', points: 5, recurringType: 'daily', tags: ['生活习惯'] },
  { id: 't7', title: '练习写字', description: '一手好字，受益终生', points: 8, recurringType: 'daily', tags: ['学习'] },
  { id: 't8', title: '完成作业', description: '认真学习，完成任务', points: 10, recurringType: 'daily', tags: ['学习'] },
  { id: 't9', title: '主动问好', description: '礼貌待人，暖心互动', points: 3, recurringType: 'daily', tags: ['社交'] },
  { id: 't10', title: '睡前阅读', description: '温馨阅读时光', points: 8, recurringType: 'daily', tags: ['学习'] },
]

// 用户自定义模板
{
  customTemplates: [
    { id: 'ct1', title: '练习钢琴', description: '每天练习30分钟', points: 10, recurringType: 'daily', tags: ['才艺'] }
  ]
}
```

### 5.2 taskTemplateStore 实现

```javascript
// src/stores/taskTemplateStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTaskTemplateStore = defineStore('taskTemplate', () => {
  const customTemplates = ref([])

  // 所有模板（预设 + 自定义）
  const allTemplates = computed(() => [...DEFAULT_TEMPLATES, ...customTemplates.value])

  // 按标签分类
  const templatesByTag = computed(() => {
    const grouped = {}
    allTemplates.value.forEach(t => {
      t.tags.forEach(tag => {
        if (!grouped[tag]) grouped[tag] = []
        grouped[tag].push(t)
      })
    })
    return grouped
  })

  // 添加自定义模板
  const addCustomTemplate = (template) => {
    const newTemplate = {
      id: `ct_${Date.now()}`,
      ...template,
      createdAt: new Date().toISOString()
    }
    customTemplates.value.push(newTemplate)
    save()
    return newTemplate
  }

  // 删除自定义模板
  const deleteCustomTemplate = (templateId) => {
    customTemplates.value = customTemplates.value.filter(t => t.id !== templateId)
    save()
  }

  // 保存
  const save = () => {
    uni.setStorageSync(TASK_TEMPLATES_KEY, JSON.stringify(customTemplates.value))
  }

  // 初始化
  const init = () => {
    try {
      const stored = uni.getStorageSync(TASK_TEMPLATES_KEY)
      customTemplates.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      customTemplates.value = []
    }
  }

  return {
    customTemplates,
    allTemplates,
    templatesByTag,
    addCustomTemplate,
    deleteCustomTemplate,
    init
  }
})
```

### 5.3 模板选择器（add-task.vue 扩展）

```vue
<!-- 在 add-task.vue 中添加模板选择区域 -->
<template>
  <!-- 原有表单... -->

  <!-- 模板选择区域 -->
  <view class="form-item template-section" v-if="showTemplateSelector">
    <text class="form-label">快速添加</text>
    <scroll-view scroll-x class="template-scroll">
      <view class="template-list">
        <view v-for="template in allTemplates" :key="template.id"
              class="template-card" @tap="applyTemplate(template)">
          <text class="template-title">{{ template.title }}</text>
          <text class="template-points">+{{ template.points }}</text>
        </view>
      </view>
    </scroll-view>
    <view class="template-tip">点击模板快速填充</view>
  </view>
</template>

<script>
// 在 add-task.vue 的 script 中
import { useTaskTemplateStore } from '@/stores/taskTemplateStore'

const templateStore = useTaskTemplateStore()

const applyTemplate = (template) => {
  taskForm.value.title = template.title
  taskForm.value.description = template.description || ''
  taskForm.value.points = template.points
  taskForm.value.tags = template.tags || []
  taskForm.value.type = 'recurring'
  taskForm.value.recurringType = template.recurringType
  // 关闭模板选择器
  showTemplateSelector.value = false
}
</script>
```

---

## 6. 路由配置 (pages.json)

```json
{
  "pages": [
    // ... 原有页面
    {
      "path": "pages/achievement/achievement",
      "style": {
        "navigationBarTitleText": "成就",
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/report/report",
      "style": {
        "navigationBarTitleText": "成长报告",
        "navigationStyle": "custom"
      }
    }
  ]
}
```

---

## 7. 触发点集成

### 7.1 成就触发检查点

在关键位置调用 `achievementStore.checkAndUnlock()`:

| 操作 | 触发位置 | 检查条件 |
|------|----------|----------|
| 完成任务 | taskStore.completeTask() | streak_7, tasks_100, tasks_500 |
| 积分变动 | pointsStore | points_1000, points_5000, points_10000 |
| 添加宝宝 | babyStore.addBaby() | first_baby, babies_2 |
| 商品兑换 | shopStore.exchange() | first_exchange |
| 宝宝升级 | babyStore | level_10, level_50 |

### 7.2 周报生成检查

在应用启动时检查是否需要生成周报:

```javascript
// App.vue onShow
onShow(() => {
  const lastWeeklyCheck = uni.getStorageSync('lastWeeklyCheck') || ''
  const currentWeek = reportStore.getCurrentWeek()

  if (lastWeeklyCheck !== currentWeek) {
    // 生成上周周报
    reportStore.generateWeeklyReport(taskRecords, pointsRecords, currentBabyId)
    uni.setStorageSync('lastWeeklyCheck', currentWeek)

    // 弹出周报（如果上周有数据）
    const lastWeekReport = reportStore.getLastWeekReport()
    if (lastWeekReport && lastWeekReport.tasksCompleted > 0) {
      showWeeklyPopup(lastWeekReport)
    }
  }
})
```

---

## 8. 文件清单

| 操作 | 文件 | 行数估算 |
|------|------|----------|
| 新增 | src/stores/achievementStore.js | ~150 |
| 新增 | src/stores/reportStore.js | ~120 |
| 新增 | src/stores/taskTemplateStore.js | ~80 |
| 新增 | src/pages/achievement/achievement.vue | ~200 |
| 新增 | src/pages/report/report.vue | ~180 |
| 修改 | src/pages/index/index.vue | +30 |
| 修改 | src/pages/task/add-task.vue | +50 |
| 修改 | src/pages/profile/profile.vue | +20 |
| 修改 | pages.json | +15 |
| **总计** | | **~845 行** |

---

## 9. 验收检查点

### M1 成就系统
- [ ] 18个成就全部可解锁
- [ ] 解锁弹窗正确显示
- [ ] 成就页面显示已解锁/未解锁
- [ ] 数据持久化正常

### M2 成长报告
- [ ] 周报数据准确
- [ ] 报告入口可见
- [ ] 历史报告可查看

### M3 任务模板
- [ ] 10个预设模板可用
- [ ] 点击模板快速填充表单
- [ ] 支持自定义模板
