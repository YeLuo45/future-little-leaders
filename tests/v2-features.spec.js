/**
 * future-little-leaders V2 功能测试用例
 * 
 * 测试范围:
 * - M1: 成就系统 (achievementStore + achievement.vue)
 * - M2: 成长报告 (reportStore + report.vue)
 * - M3: 任务模板 (taskTemplateStore + template-picker)
 */

// ============================================================
// M1: 成就系统测试用例
// ============================================================

describe('M1: 成就系统', () => {
  describe('achievementStore 单元测试', () => {
    
    /**
     * TC-M1-001: 成就解锁基础流程
     * 
     * 前置条件: localStorage 无成就数据
     * 输入: unlock('streak_7', 50)
     * 预期输出:
     *   - unlockedAchievements 包含 { id: 'streak_7', pointsAwarded: 50 }
     *   - pendingNotifications 包含解锁通知
     *   - unlockedCount === 1
     */
    test('TC-M1-001: unlock() should add achievement to unlocked list', () => {
      // Given: fresh store
      const store = createAchievementStore()
      
      // When
      store.unlock('streak_7', 50)
      
      // Then
      expect(store.unlockedAchievements).toHaveLength(1)
      expect(store.unlockedAchievements[0].id).toBe('streak_7')
      expect(store.unlockedAchievements[0].pointsAwarded).toBe(50)
      expect(store.pendingNotifications).toHaveLength(1)
      expect(store.pendingNotifications[0].name).toBe('初出茅庐')
    })

    /**
     * TC-M1-002: 重复解锁应被拒绝
     * 
     * 前置条件: streak_7 已解锁
     * 输入: unlock('streak_7', 50)
     * 预期输出:
     *   - unlock() 返回 false
     *   - unlockedAchievements 长度不变
     */
    test('TC-M1-002: unlock() should reject duplicate achievements', () => {
      // Given
      const store = createAchievementStore()
      store.unlock('streak_7', 50)
      
      // When
      const result = store.unlock('streak_7', 50)
      
      // Then
      expect(result).toBe(false)
      expect(store.unlockedAchievements).toHaveLength(1)
    })

    /**
     * TC-M1-003: 解锁通知队列管理
     * 
     * 前置条件: 已解锁 2 个成就
     * 输入: popNotification() × 2
     * 预期输出:
     *   - 第一次返回第一个通知
     *   - 第二次返回第二个通知
     *   - 第三次返回 undefined
     */
    test('TC-M1-003: popNotification() should return notifications in FIFO order', () => {
      // Given
      const store = createAchievementStore()
      store.unlock('streak_7', 50)
      store.unlock('tasks_100', 100)
      
      // When & Then
      const first = store.popNotification()
      expect(first.name).toBe('初出茅庐')
      
      const second = store.popNotification()
      expect(second.name).toBe('小试牛刀')
      
      const third = store.popNotification()
      expect(third).toBeUndefined()
    })

    /**
     * TC-M1-004: isUnlocked() 状态查询
     * 
     * 输入: isUnlocked('streak_7') 在解锁前后
     * 预期输出:
     *   - 解锁前返回 false
     *   - 解锁后返回 true
     */
    test('TC-M1-004: isUnlocked() should return correct unlock status', () => {
      // Given
      const store = createAchievementStore()
      
      // When & Then
      expect(store.isUnlocked('streak_7')).toBe(false)
      
      store.unlock('streak_7', 50)
      
      expect(store.isUnlocked('streak_7')).toBe(true)
      expect(store.isUnlocked('tasks_100')).toBe(false)
    })

    /**
     * TC-M1-005: checkAndUnlock() 自动检查逻辑
     * 
     * 输入: checkAndUnlock({ currentStreak: 7, tasksCompleted: 50 })
     * 预期输出:
     *   - streak_7 自动解锁（连续7天）
     *   - tasks_100 不解锁（需100个任务）
     */
    test('TC-M1-005: checkAndUnlock() should auto-unlock based on stats', () => {
      // Given
      const store = createAchievementStore()
      
      // When
      store.checkAndUnlock({ currentStreak: 7, tasksCompleted: 50 })
      
      // Then
      expect(store.isUnlocked('streak_7')).toBe(true)
      expect(store.isUnlocked('tasks_100')).toBe(false)
    })

    /**
     * TC-M1-006: 持久化存储
     * 
     * 前置条件: localStorage 可用
     * 输入: unlock() → 重新初始化 store
     * 预期输出:
     *   - 数据正确保存到 localStorage
     *   - 重新初始化后数据恢复
     */
    test('TC-M1-006: achievements should persist in localStorage', () => {
      // Given
      const store = createAchievementStore()
      store.unlock('streak_7', 50)
      
      // When: simulate page reload
      const newStore = createAchievementStore()
      newStore.init()
      
      // Then
      expect(newStore.isUnlocked('streak_7')).toBe(true)
    })

    /**
     * TC-M1-007: 计算属性验证
     * 
     * 输入: 解锁 3 个成就
     * 预期输出:
     *   - unlockedCount === 3
     *   - totalCount === 18（总成就数）
     */
    test('TC-M1-007: computed properties should return correct counts', () => {
      // Given
      const store = createAchievementStore()
      
      // When
      store.unlock('streak_7', 50)
      store.unlock('tasks_100', 100)
      store.unlock('first_baby', 30)
      
      // Then
      expect(store.unlockedCount).toBe(3)
      expect(store.totalCount).toBe(18)
    })
  })

  describe('achievement.vue 组件测试', () => {
    
    /**
     * TC-M1-008: 成就列表渲染 - 已解锁
     * 
     * 前置条件: 已解锁 2 个成就
     * 预期输出:
     *   - 显示 "已解锁 (2)" 标题
     *   - 显示对应的成就图标和名称
     *   - locked 列表不包含这些成就
     */
    test('TC-M1-008: should display unlocked achievements correctly', () => {
      // Given
      const store = createAchievementStore()
      store.unlock('streak_7', 50)
      store.unlock('tasks_100', 100)
      
      // When
      const wrapper = mount(AchievementPage, { props: { store } })
      
      // Then
      expect(wrapper.find('.section-title:has-text("已解锁 (2)")').exists()).toBe(true)
      expect(wrapper.findAll('.achievement-item.unlocked')).toHaveLength(2)
    })

    /**
     * TC-M1-009: 成就列表渲染 - 未解锁
     * 
     * 前置条件: 无解锁成就
     * 预期输出:
     *   - 显示 "未解锁 (18)" 标题
     *   - 所有成就显示为 locked 状态
     *   - 图标显示为 🔒
     */
    test('TC-M1-009: should display locked achievements with lock icon', () => {
      // Given
      const store = createAchievementStore()
      
      // When
      const wrapper = mount(AchievementPage, { props: { store } })
      
      // Then
      expect(wrapper.find('.section-title:has-text("未解锁 (18)")').exists()).toBe(true)
      expect(wrapper.findAll('.achievement-item.locked')).toHaveLength(18)
      expect(wrapper.findAll('.achievement-icon:has-text("🔒")')).toHaveLength(18)
    })

    /**
     * TC-M1-010: 成就详情弹窗
     * 
     * 前置条件: 已解锁 1 个成就
     * 输入: 点击该成就
     * 预期输出:
     *   - 弹出详情弹窗
     *   - 显示成就名称、描述、积分
     */
    test('TC-M1-010: should show achievement detail popup on click', () => {
      // Given
      const store = createAchievementStore()
      store.unlock('streak_7', 50)
      
      // When
      const wrapper = mount(AchievementPage, { props: { store } })
      wrapper.find('.achievement-item.unlocked').trigger('tap')
      
      // Then
      expect(wrapper.find('.unlock-modal').isVisible()).toBe(true)
      expect(wrapper.find('.unlock-name').text()).toBe('初出茅庐')
      expect(wrapper.find('.unlock-points').text()).toBe('+50 积分')
    })

    /**
     * TC-M1-011: 成就进度显示
     * 
     * 预期输出:
     *   - 导航栏显示 "X/18" 格式
     */
    test('TC-M1-011: nav bar should display achievement progress', () => {
      // Given
      const store = createAchievementStore()
      store.unlock('streak_7', 50)
      
      // When
      const wrapper = mount(AchievementPage, { props: { store } })
      
      // Then
      expect(wrapper.find('.nav-right').text()).toBe('1/18')
    })
  })

  describe('成就系统集成测试', () => {
    
    /**
     * TC-M1-012: 任务完成触发动成就检查
     * 
     * 场景: 用户完成第 100 个任务
     * 预期:
     *   - 自动解锁 "小试牛刀" 成就
     *   - 显示成就解锁通知
     */
    test('TC-M1-012: completing 100th task should unlock achievement', async () => {
      // Given
      const taskStore = createTaskStore()
      const achievementStore = createAchievementStore()
      
      // Simulate 99 completed tasks
      for (let i = 0; i < 99; i++) {
        taskStore.completeTask(`task-${i}`)
      }
      
      // When: complete 100th task
      await taskStore.completeTask('task-99')
      
      // Trigger achievement check
      achievementStore.checkAndUnlock({
        currentStreak: taskStore.currentStreak,
        tasksCompleted: taskStore.completedCount
      })
      
      // Then
      expect(achievementStore.isUnlocked('tasks_100')).toBe(true)
    })

    /**
     * TC-M1-013: 连续打卡触发动成就检查
     * 
     * 场景: 用户连续打卡第 7 天
     * 预期:
     *   - 自动解锁 "初出茅庐" 成就
     */
    test('TC-M1-013: 7-day streak should unlock streak_7 achievement', () => {
      // Given
      const achievementStore = createAchievementStore()
      
      // When
      achievementStore.checkAndUnlock({ currentStreak: 7, tasksCompleted: 0 })
      
      // Then
      expect(achievementStore.isUnlocked('streak_7')).toBe(true)
    })
  })
})

// ============================================================
// M2: 成长报告测试用例
// ============================================================

describe('M2: 成长报告', () => {
  describe('reportStore 单元测试', () => {
    
    /**
     * TC-M2-001: 周报生成 - 基础数据
     * 
     * 输入: 本周完成任务 15 个，获得积分 120，支出 50
     * 预期输出:
     *   - 周报包含正确的 tasksCompleted: 15
     *   - 周报包含正确的 pointsEarned: 120
     *   - 周报包含正确的 pointsSpent: 50
     */
    test('TC-M2-001: generateWeeklyReport() should calculate correct stats', () => {
      // Given
      const store = createReportStore()
      const taskRecords = [
        { id: '1', completedAt: '2026-05-04T10:00:00Z' },
        // ... 15 completed tasks
      ]
      const pointsRecords = [
        { type: 'earn', amount: 120, createdAt: '2026-05-04' },
        { type: 'spend', amount: 50, createdAt: '2026-05-05' }
      ]
      
      // When
      const report = store.generateWeeklyReport(taskRecords, pointsRecords)
      
      // Then
      expect(report.tasksCompleted).toBe(15)
      expect(report.pointsEarned).toBe(120)
      expect(report.pointsSpent).toBe(50)
    })

    /**
     * TC-M2-002: 周报生成 - 只统计本周数据
     * 
     * 输入: 混合本周和上周的任务记录
     * 预期输出:
     *   - 只统计本周数据
     *   - 上周数据被排除
     */
    test('TC-M2-002: weekly report should only include current week data', () => {
      // Given
      const store = createReportStore()
      const mixedRecords = [
        { id: '1', completedAt: '2026-05-04T10:00:00Z' },  // This week
        { id: '2', completedAt: '2026-04-28T10:00:00Z' },  // Last week - should be excluded
      ]
      
      // When
      const report = store.generateWeeklyReport(mixedRecords, [])
      
      // Then
      expect(report.tasksCompleted).toBe(1)
    })

    /**
     * TC-M2-003: getCurrentWeek() ISO 格式
     * 
     * 输入: 日期 2026-05-03
     * 预期输出: '2026-W18'
     */
    test('TC-M2-003: getCurrentWeek() should return ISO week format', () => {
      // Given
      const store = createReportStore()
      
      // When
      const week = store.getCurrentWeek()
      
      // Then
      expect(week).toMatch(/^\d{4}-W\d{2}$/)
    })

    /**
     * TC-M2-004: 周报更新 - 同周重复生成
     * 
     * 前置条件: 已生成第 18 周周报
     * 输入: 再次生成第 18 周周报
     * 预期输出:
     *   - 覆盖原有周报
     *   - weeklyReports 长度不变
     */
    test('TC-M2-004: generating same week report should overwrite', () => {
      // Given
      const store = createReportStore()
      store.generateWeeklyReport([{ id: '1', completedAt: '2026-05-04' }], [])
      
      // When
      store.generateWeeklyReport([{ id: '1', completedAt: '2026-05-04' }, { id: '2', completedAt: '2026-05-05' }], [])
      
      // Then
      expect(store.weeklyReports).toHaveLength(1)
      expect(store.weeklyReports[0].tasksCompleted).toBe(2)
    })

    /**
     * TC-M2-005: getWeekDates() 日期范围计算
     * 
     * 输入: '2026-W18'
     * 预期输出:
     *   - startDate: '2026-05-01'
     *   - endDate: '2026-05-07'
     */
    test('TC-M2-005: getWeekDates() should return correct date range', () => {
      // Given
      const store = createReportStore()
      
      // When
      const dates = store.getWeekDates('2026-W18')
      
      // Then
      expect(dates.startDate).toBe('2026-05-01')
      expect(dates.endDate).toBe('2026-05-07')
    })

    /**
     * TC-M2-006: 月报生成
     * 
     * 输入: 4月份数据
     * 预期输出:
     *   - month === '2026-04'
     *   - 正确统计月数据
     */
    test('TC-M2-006: generateMonthlyReport() should create monthly summary', () => {
      // Given
      const store = createReportStore()
      const aprilTasks = Array(62).fill({ id: 't', completedAt: '2026-04-15' })
      const aprilPoints = [
        { type: 'earn', amount: 480, createdAt: '2026-04-15' },
        { type: 'spend', amount: 200, createdAt: '2026-04-20' }
      ]
      
      // When
      const report = store.generateMonthlyReport(aprilTasks, aprilPoints)
      
      // Then
      expect(report.month).toBe('2026-04')
      expect(report.tasksCompleted).toBe(62)
      expect(report.pointsEarned).toBe(480)
    })

    /**
     * TC-M2-007: 历史周报查询
     * 
     * 前置条件: 已生成 4 周周报
     * 预期输出:
     *   - historyWeekly 包含 4 条记录
     *   - 按周次降序排列
     */
    test('TC-M2-007: historyWeekly should return sorted weekly reports', () => {
      // Given
      const store = createReportStore()
      // ... generate 4 weeks of reports
      
      // When
      const history = store.historyWeekly
      
      // Then
      expect(history).toHaveLength(4)
      // Verify sorted by week descending
    })

    /**
     * TC-M2-008: 持久化存储
     * 
     * 预期: 重启后周报数据不丢失
     */
    test('TC-M2-008: reports should persist after page reload', () => {
      // Given
      const store = createReportStore()
      store.generateWeeklyReport([{ id: '1', completedAt: '2026-05-04' }], [])
      
      // When
      const newStore = createReportStore()
      newStore.init()
      
      // Then
      expect(newStore.weeklyReports).toHaveLength(1)
    })
  })

  describe('report.vue 组件测试', () => {
    
    /**
     * TC-M2-009: 周报统计卡片渲染
     * 
     * 预期输出:
     *   - 显示 "完成任务" 卡片，值为 15
     *   - 显示 "获得积分" 卡片，值为 120
     *   - 显示 "连续天数" 卡片，值为 5
     */
    test('TC-M2-009: should display weekly stats cards correctly', () => {
      // Given
      const store = createReportStore()
      store.generateWeeklyReport(
        Array(15).fill({ id: 't', completedAt: '2026-05-04' }),
        []
      )
      
      // When
      const wrapper = mount(ReportPage, { props: { store } })
      
      // Then
      expect(wrapper.find('.stat-value:has-text("15")').exists()).toBe(true)
    })

    /**
     * TC-M2-010: 鼓励文案生成
     * 
     * 输入: 完成任务 15 个，连续 5 天
     * 预期输出: 显示对应的鼓励文案
     */
    test('TC-M2-010: should display encourage message based on performance', () => {
      // Given
      const store = createReportStore()
      store.generateWeeklyReport(
        Array(15).fill({ id: 't', completedAt: '2026-05-04' }),
        []
      )
      
      // When
      const wrapper = mount(ReportPage, { props: { store } })
      
      // Then
      expect(wrapper.find('.encourage-text').exists()).toBe(true)
    })

    /**
     * TC-M2-011: 历史周报列表
     * 
     * 预期: 显示历史周报列表，每项显示周次和统计
     */
    test('TC-M2-011: should display history weekly reports list', () => {
      // Given
      const store = createReportStore()
      // ... generate multiple weeks
      
      // When
      const wrapper = mount(ReportPage, { props: { store } })
      
      // Then
      expect(wrapper.findAll('.history-item')).toHaveLength(4)
    })

    /**
     * TC-M2-012: 周报详情查看
     * 
     * 输入: 点击某条历史周报
     * 预期: 显示该周详细报告
     */
    test('TC-M2-012: clicking history item should show detail', () => {
      // Given
      const store = createReportStore()
      // ... generate reports
      
      // When
      const wrapper = mount(ReportPage, { props: { store } })
      wrapper.find('.history-item').trigger('tap')
      
      // Then
      expect(wrapper.find('.detail-modal').isVisible()).toBe(true)
    })
  })
})

// ============================================================
// M3: 任务模板测试用例
// ============================================================

describe('M3: 任务模板', () => {
  describe('taskTemplateStore 单元测试', () => {
    
    /**
     * TC-M3-001: 获取所有模板
     * 
     * 预期输出:
     *   - allTemplates 包含 10 个预设模板
     *   - 自定义模板 + 预设模板 = 全部
     */
    test('TC-M3-001: allTemplates should include default templates', () => {
      // Given
      const store = createTaskTemplateStore()
      
      // When
      const templates = store.allTemplates
      
      // Then
      expect(templates.length).toBeGreaterThanOrEqual(10)
    })

    /**
     * TC-M3-002: 按标签分类
     * 
     * 预期输出:
     *   - templatesByTag['学习'] 包含阅读、写字等模板
     *   - templatesByTag['运动'] 包含运动相关模板
     */
    test('TC-M3-002: templatesByTag should group templates by tag', () => {
      // Given
      const store = createTaskTemplateStore()
      
      // When
      const byTag = store.templatesByTag
      
      // Then
      expect(byTag['学习']).toBeDefined()
      expect(byTag['运动']).toBeDefined()
      expect(byTag['学习'].length).toBeGreaterThan(0)
    })

    /**
     * TC-M3-003: 添加自定义模板
     * 
     * 输入: { title: '练习钢琴', description: '每天练习30分钟', points: 10, tags: ['才艺'] }
     * 预期输出:
     *   - customTemplates 包含新模板
     *   - 新模板有 id 和 createdAt
     */
    test('TC-M3-003: addCustomTemplate() should add and return new template', () => {
      // Given
      const store = createTaskTemplateStore()
      
      // When
      const newTemplate = store.addCustomTemplate({
        title: '练习钢琴',
        description: '每天练习30分钟',
        points: 10,
        tags: ['才艺']
      })
      
      // Then
      expect(store.customTemplates).toHaveLength(1)
      expect(newTemplate.id).toBeDefined()
      expect(newTemplate.createdAt).toBeDefined()
      expect(newTemplate.title).toBe('练习钢琴')
    })

    /**
     * TC-M3-004: 删除自定义模板
     * 
     * 前置条件: 有 1 个自定义模板
     * 输入: deleteCustomTemplate(templateId)
     * 预期输出:
     *   - customTemplates 为空
     *   - 预设模板不受影响
     */
    test('TC-M3-004: deleteCustomTemplate() should remove custom template', () => {
      // Given
      const store = createTaskTemplateStore()
      const template = store.addCustomTemplate({ title: '测试', description: '', points: 5, tags: ['测试'] })
      
      // When
      store.deleteCustomTemplate(template.id)
      
      // Then
      expect(store.customTemplates).toHaveLength(0)
      // Default templates should still exist
      expect(store.allTemplates.length).toBeGreaterThanOrEqual(10)
    })

    /**
     * TC-M3-005: 预设模板不可删除
     * 
     * 输入: 尝试删除 id 为 't1' 的预设模板
     * 预期输出:
     *   - deleteCustomTemplate 返回 false 或无效
     *   - 预设模板保留
     */
    test('TC-M3-005: deleting default template should have no effect', () => {
      // Given
      const store = createTaskTemplateStore()
      const initialCount = store.allTemplates.length
      
      // When
      store.deleteCustomTemplate('t1')  // Default template
      
      // Then
      expect(store.allTemplates.length).toBe(initialCount)
    })

    /**
     * TC-M3-006: 模板搜索
     * 
     * 输入: searchTemplates('阅读')
     * 预期输出: 包含 "阅读" 的模板列表
     */
    test('TC-M3-006: searchTemplates() should find matching templates', () => {
      // Given
      const store = createTaskTemplateStore()
      
      // When
      const results = store.searchTemplates('阅读')
      
      // Then
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(t => t.title.includes('阅读'))).toBe(true)
    })

    /**
     * TC-M3-007: 持久化
     * 
     * 预期: 自定义模板持久化到 localStorage
     */
    test('TC-M3-007: custom templates should persist in localStorage', () => {
      // Given
      const store = createTaskTemplateStore()
      store.addCustomTemplate({ title: '测试', description: '', points: 5, tags: ['测试'] })
      
      // When
      const newStore = createTaskTemplateStore()
      newStore.init()
      
      // Then
      expect(newStore.customTemplates).toHaveLength(1)
    })
  })

  describe('template-picker 组件测试', () => {
    
    /**
     * TC-M3-008: 模板分类展示
     * 
     * 预期:
     *   - 按标签分类显示模板
     *   - 每个分类显示对应模板数量
     */
    test('TC-M3-008: should display templates grouped by category', () => {
      // Given
      const store = createTaskTemplateStore()
      
      // When
      const wrapper = mount(TemplatePicker, { props: { store } })
      
      // Then
      expect(wrapper.find('.template-category').exists()).toBe(true)
    })

    /**
     * TC-M3-009: 模板选择
     * 
     * 输入: 点击某个模板
     * 预期:
     *   - 触发 select 事件
     *   - 传递模板数据
     */
    test('TC-M3-009: selecting template should emit select event', () => {
      // Given
      const store = createTaskTemplateStore()
      const wrapper = mount(TemplatePicker, { props: { store } })
      
      // When
      wrapper.find('.template-item').trigger('tap')
      
      // Then
      expect(wrapper.emitted('select')).toBeTruthy()
    })

    /**
     * TC-M3-010: 模板预览
     * 
     * 输入: 长按/悬停模板
     * 预期: 显示模板详情（描述、积分、标签）
     */
    test('TC-M3-010: long press should show template preview', () => {
      // Given
      const store = createTaskTemplateStore()
      const wrapper = mount(TemplatePicker, { props: { store } })
      
      // When
      wrapper.find('.template-item').trigger('longpress')
      
      // Then
      expect(wrapper.find('.template-preview').isVisible()).toBe(true)
    })

    /**
     * TC-M3-011: 搜索过滤
     * 
     * 输入: 搜索 "阅读"
     * 预期:
     *   - 只显示包含 "阅读" 的模板
     *   - 其他分类隐藏
     */
    test('TC-M3-011: search should filter displayed templates', () => {
      // Given
      const store = createTaskTemplateStore()
      const wrapper = mount(TemplatePicker, { props: { store } })
      
      // When
      wrapper.find('.search-input').setValue('阅读')
      
      // Then
      const displayed = wrapper.findAll('.template-item')
      displayed.forEach(item => {
        expect(item.text()).toContain('阅读')
      })
    })
  })

  describe('模板使用集成测试', () => {
    
    /**
     * TC-M3-012: 从模板创建任务
     * 
     * 场景: 用户选择 "早起打卡" 模板创建任务
     * 预期:
     *   - 任务标题为 "早起打卡"
     *   - 积分为 5
     *   - 标签为 ['生活习惯']
     *   - 触发 "模板达人" 成就检查
     */
    test('TC-M3-012: creating task from template should populate fields', () => {
      // Given
      const taskStore = createTaskStore()
      const templateStore = createTaskTemplateStore()
      const achievementStore = createAchievementStore()
      
      const template = templateStore.allTemplates.find(t => t.title === '早起打卡')
      
      // When
      taskStore.createFromTemplate(template)
      
      // Then
      expect(taskStore.currentTask.title).toBe('早起打卡')
      expect(taskStore.currentTask.points).toBe(5)
      expect(taskStore.currentTask.tags).toContain('生活习惯')
      
      // Achievement check
      achievementStore.checkAndUnlock({ templateUsed: true })
      expect(achievementStore.isUnlocked('first_template')).toBe(true)
    })
  })
})

// ============================================================
// E2E 测试用例
// ============================================================

describe('E2E: 完整用户流程', () => {
  
  /**
   * TC-E2E-001: 新用户完成第一个任务并解锁成就
   * 
   * 步骤:
   *   1. 登录 App
   *   2. 添加宝宝 "小明"
   *   3. 从模板创建任务 "早起打卡"
   *   4. 完成任务
   *   5. 检查成就
   * 
   * 预期:
   *   - "喜添新丁" 成就自动解锁
   *   - "模板达人" 成就自动解锁
   */
  test('TC-E2E-001: new user flow - add baby, create task from template, complete', async () => {
    // Step 1: Login
    await page.goto('/pages/index/index')
    await page.fill('#username', 'testuser')
    await page.fill('#password', 'testpass')
    await page.click('#login-btn')
    
    // Step 2: Add baby
    await page.click('[data-testid="add-baby-btn"]')
    await page.fill('#baby-name', '小明')
    await page.selectOption('#baby-gender', 'male')
    await page.click('#save-baby-btn')
    
    // Verify achievement unlocked
    await page.waitForSelector('.achievement-notification')
    expect(await page.locator('.achievement-name').text()).toBe('喜添新丁')
    
    // Step 3: Create task from template
    await page.click('[data-testid="add-task-btn"]')
    await page.click('[data-testid="template-picker-btn"]')
    await page.click('.template-item:has-text("早起打卡")')
    await page.click('[data-testid="confirm-template-btn"]')
    
    // Step 4: Complete task
    await page.click('[data-testid="complete-task-btn"]')
    
    // Step 5: Check achievements
    await page.click('[data-testid="profile-tab"]')
    await page.click('[data-testid="achievement-entry"]')
    
    // Verify achievements
    const achievements = await page.locator('.achievement-item.unlocked').all()
    expect(achievements.length).toBeGreaterThanOrEqual(2)
  })

  /**
   * TC-E2E-002: 一周连续打卡生成周报
   * 
   * 步骤:
   *   1-7. 连续 7 天每天完成至少 1 个任务
   *   8. 查看周报
   * 
   * 预期:
   *   - 周报显示 streakDays: 7
   *   - "初出茅庐" 成就已解锁
   */
  test('TC-E2E-002: 7-day streak should generate report and unlock achievement', async () => {
    // Simulate 7 days
    for (let day = 1; day <= 7; day++) {
      await page.goto('/pages/index/index')
      await page.click('[data-testid="add-task-btn"]')
      await page.click('.template-item:first-child')
      await page.click('[data-testid="complete-task-btn"]')
      // Simulate next day
      await page.evaluate(() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        // Mock system date
      })
    }
    
    // Check weekly report
    await page.goto('/pages/report/report')
    
    expect(await page.locator('.streak-days').text()).toBe('7')
    
    // Check achievement
    await page.goto('/pages/achievement/achievement')
    expect(await page.locator('.achievement-item:has-text("初出茅庐").unlocked').exists()).toBe(true)
  })

  /**
   * TC-E2E-003: 积分商城兑换
   * 
   * 步骤:
   *   1. 积累 1000 积分
   *   2. 进入积分商城
   *   3. 兑换商品
   * 
   * 预期:
   *   - "初次兑换" 成就解锁
   *   - 积分扣除成功
   */
  test('TC-E2E-003: first exchange should unlock achievement', async () => {
    // Given: user has 1000+ points
    const store = createPointStore()
    store.addPoints(1500)
    
    // When
    await page.goto('/pages/shop/shop')
    await page.click('.shop-item:first-child')
    await page.click('#exchange-btn')
    
    // Then
    expect(await page.locator('.achievement-notification:has-text("初次兑换")').exists()).toBe(true)
    expect(store.getBalance()).toBeLessThan(1500)
  })
})

// ============================================================
// 测试辅助函数
// ============================================================

/**
 * 创建模拟 AchievementStore
 * 用于单元测试隔离
 */
function createAchievementStore() {
  const ACHIEVEMENT_DEFINITIONS = [
    { id: 'streak_7', name: '初出茅庐', description: '连续打卡7天', icon: '🏆', category: 'streak', condition: { type: 'streak', value: 7 } },
    { id: 'streak_30', name: '持之以恒', description: '连续打卡30天', icon: '💪', category: 'streak', condition: { type: 'streak', value: 30 } },
    { id: 'streak_100', name: '百年树人', description: '连续打卡100天', icon: '👑', category: 'streak', condition: { type: 'streak', value: 100 } },
    { id: 'tasks_100', name: '小试牛刀', description: '累计完成任务100次', icon: '📝', category: 'count', condition: { type: 'tasks_completed', value: 100 } },
    { id: 'tasks_500', name: '熟能生巧', description: '累计完成任务500次', icon: '🎯', category: 'count', condition: { type: 'tasks_completed', value: 500 } },
    { id: 'points_1000', name: '积少成多', description: '累计获得1000积分', icon: '💎', category: 'count', condition: { type: 'points_earned', value: 1000 } },
    { id: 'points_5000', name: '富甲一方', description: '累计获得5000积分', icon: '🪙', category: 'count', condition: { type: 'points_earned', value: 5000 } },
    { id: 'points_10000', name: '富可敌国', description: '累计获得10000积分', icon: '💰', category: 'count', condition: { type: 'points_earned', value: 10000 } },
    { id: 'tags_all', name: '全能标签', description: '使用过所有任务标签', icon: '🏷️', category: 'collect', condition: { type: 'tags_unlocked', value: 'all' } },
    { id: 'first_exchange', name: '初次兑换', description: '完成首次商品兑换', icon: '🎁', category: 'collect', condition: { type: 'exchanges_count', value: 1 } },
    { id: 'first_baby', name: '喜添新丁', description: '添加第一个宝宝', icon: '👶', category: 'special', condition: { type: 'babies_count', value: 1 } },
    { id: 'level_10', name: '小有成就', description: '宝宝达到10级', icon: '⭐', category: 'special', condition: { type: 'baby_level', value: 10 } },
    { id: 'perfect_week', name: '完美一周', description: '一周内每天完成任务', icon: '🌟', category: 'special', condition: { type: 'perfect_week', value: true } },
    { id: 'first_template', name: '模板达人', description: '使用模板创建任务', icon: '📋', category: 'special', condition: { type: 'template_used', value: true } },
    { id: 'babies_2', name: '双喜临门', description: '添加第二个宝宝', icon: '👫', category: 'special', condition: { type: 'babies_count', value: 2 } },
    { id: 'streak_7_all', name: '全员坚持', description: '所有宝宝都连续打卡7天', icon: '👨‍👩‍👧‍👦', category: 'streak', condition: { type: 'all_babies_streak', value: 7 } },
    { id: 'community_first', name: '社区之星', description: '发布第一篇社区动态', icon: '📢', category: 'special', condition: { type: 'posts_count', value: 1 } },
    { id: 'level_50', name: '卓尔不凡', description: '宝宝达到50级', icon: '🌈', category: 'special', condition: { type: 'baby_level', value: 50 } },
  ]

  return {
    unlockedAchievements: [],
    pendingNotifications: [],
    init: () => {},
    isUnlocked: (id) => false,
    unlock: (id, points) => {},
    popNotification: () => undefined,
    get unlockedCount() { return this.unlockedAchievements.length },
    get totalCount() { return ACHIEVEMENT_DEFINITIONS.length },
    checkAndUnlock: (stats) => {},
  }
}

/**
 * 创建模拟 ReportStore
 */
function createReportStore() {
  return {
    weeklyReports: [],
    monthlyReports: [],
    generateWeeklyReport: () => ({}),
    getCurrentWeek: () => '2026-W18',
    getWeekDates: (week) => ({ startDate: '2026-05-01', endDate: '2026-05-07' }),
    init: () => {},
  }
}

/**
 * 创建模拟 TaskTemplateStore
 */
function createTaskTemplateStore() {
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

  return {
    customTemplates: [],
    allTemplates: [...DEFAULT_TEMPLATES],
    templatesByTag: {},
    addCustomTemplate: (t) => {},
    deleteCustomTemplate: (id) => {},
    searchTemplates: (query) => [],
    init: () => {},
  }
}

// Mock helpers
function createTaskStore() {
  return {
    completeTask: async (id) => {},
    createFromTemplate: (template) => {},
    currentStreak: 0,
    completedCount: 0,
  }
}

function createPointStore() {
  return {
    addPoints: (amount) => {},
    getBalance: () => 0,
  }
}
