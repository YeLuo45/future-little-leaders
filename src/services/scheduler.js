/**
 * Scheduler Service - Schedule flow tasks as daily reminders
 * Uses localStorage to persist scheduled tasks and checks on app launch
 */

const SCHEDULED_TASKS_KEY = 'scheduled_flow_tasks'

/**
 * Scheduled task structure
 * @typedef {Object} ScheduledTask
 * @property {string} id - Unique task ID
 * @property {string} flowId - Flow ID this task belongs to
 * @property {string} nodeId - Node ID to trigger
 * @property {string} title - Task title
 * @property {string} time - Scheduled time (HH:mm)
 * @property {Array<string>} days - Days of week (0-6, 0=Sunday)
 * @property {boolean} enabled - Whether task is active
 * @property {string} babyId - Baby profile ID
 * @property {string} createdAt - Creation timestamp
 */

/**
 * Get all scheduled tasks from storage
 * @returns {ScheduledTask[]}
 */
function getScheduledTasks() {
  try {
    const stored = uni.getStorageSync(SCHEDULED_TASKS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('[Scheduler] Failed to get scheduled tasks:', e)
    return []
  }
}

/**
 * Save scheduled tasks to storage
 * @param {ScheduledTask[]} tasks
 */
function saveScheduledTasks(tasks) {
  try {
    uni.setStorageSync(SCHEDULED_TASKS_KEY, JSON.stringify(tasks))
    console.log('[Scheduler] Saved tasks:', tasks.length)
  } catch (e) {
    console.error('[Scheduler] Failed to save tasks:', e)
  }
}

/**
 * Register a flow's nodes as scheduled tasks
 * @param {object} flow - Flow object with nodes
 * @param {string} babyId - Baby profile ID
 * @returns {ScheduledTask[]} Created tasks
 */
export function registerFlowAsTask(flow, babyId) {
  if (!flow || !flow.nodes || flow.nodes.length === 0) {
    console.warn('[Scheduler] No nodes to schedule')
    return []
  }
  
  // Get existing tasks for this flow
  const existingTasks = getScheduledTasks().filter(t => t.flowId === flow.id)
  
  // Remove existing tasks for this flow
  const allTasks = getScheduledTasks().filter(t => t.flowId !== flow.id)
  
  // Create new tasks for each node
  const newTasks = flow.nodes.map(node => {
    // Find existing task for this node to preserve time settings
    const existing = existingTasks.find(t => t.nodeId === node.id)
    
    return {
      id: existing?.id || `task-${Date.now()}-${node.id}`,
      flowId: flow.id,
      nodeId: node.id,
      title: node.config?.title || node.label || '任务',
      time: existing?.time || getDefaultTimeForNode(node),
      days: existing?.days || [0, 1, 2, 3, 4, 5, 6], // Every day by default
      enabled: existing?.enabled ?? true,
      babyId: babyId || '',
      createdAt: existing?.createdAt || new Date().toISOString()
    }
  })
  
  // Combine and save
  const combinedTasks = [...allTasks, ...newTasks]
  saveScheduledTasks(combinedTasks)
  
  // Schedule notifications for new tasks
  newTasks.forEach(task => {
    if (task.enabled) {
      scheduleNotification(task)
    }
  })
  
  console.log('[Scheduler] Registered', newTasks.length, 'tasks for flow', flow.id)
  return newTasks
}

/**
 * Get default reminder time based on node type
 * @param {object} node - Node object
 * @returns {string} Time string (HH:mm)
 */
function getDefaultTimeForNode(node) {
  const typeDefaults = {
    checkin: '08:00',
    study: '19:00',
    exercise: '07:00',
    habit: '21:00'
  }
  return typeDefaults[node.type] || '09:00'
}

/**
 * Schedule a notification for a task
 * @param {ScheduledTask} task - Task to schedule
 */
function scheduleNotification(task) {
  // In H5/uni-app, we use setTimeout-based approach
  // For a real app, you'd use uni.showNotification or similar
  
  const now = new Date()
  const [hours, minutes] = task.time.split(':').map(Number)
  
  const scheduledTime = new Date()
  scheduledTime.setHours(hours, minutes, 0, 0)
  
  // If time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1)
  }
  
  const delay = scheduledTime.getTime() - now.getTime()
  
  // Store timeout ID for potential cancellation
  task._timeoutId = setTimeout(() => {
    triggerTaskNotification(task)
    
    // Reschedule for next day if recurring
    if (task.days && task.days.length < 7) {
      // Specific days - recalculate
      scheduleNextOccurrence(task)
    } else {
      // Every day - reschedule for tomorrow
      task._timeoutId = setTimeout(() => {
        triggerTaskNotification(task)
      }, 24 * 60 * 60 * 1000)
    }
  }, delay)
  
  console.log('[Scheduler] Scheduled task:', task.title, 'at', task.time, 'in', Math.round(delay / 1000 / 60), 'minutes')
}

/**
 * Schedule next occurrence for specific days
 * @param {ScheduledTask} task 
 */
function scheduleNextOccurrence(task) {
  const now = new Date()
  const [hours, minutes] = task.time.split(':').map(Number)
  
  for (let i = 1; i <= 7; i++) {
    const nextDate = new Date(now)
    nextDate.setDate(nextDate.getDate() + i)
    
    if (task.days.includes(nextDate.getDay())) {
      nextDate.setHours(hours, minutes, 0, 0)
      const delay = nextDate.getTime() - now.getTime()
      
      task._timeoutId = setTimeout(() => {
        triggerTaskNotification(task)
        scheduleNextOccurrence(task) // Reschedule
      }, delay)
      break
    }
  }
}

/**
 * Trigger a task notification
 * @param {ScheduledTask} task 
 */
function triggerTaskNotification(task) {
  console.log('[Scheduler] Triggering task:', task.title)
  
  // In a real app, show a notification or trigger the task directly
  if (typeof uni !== 'undefined') {
    // uni.showNotification or similar API would go here
    // For now, store as pending notification
    const pendingKey = 'pending_task_notifications'
    try {
      const pending = JSON.parse(uni.getStorageSync(pendingKey) || '[]')
      pending.push({
        ...task,
        triggeredAt: new Date().toISOString()
      })
      uni.setStorageSync(pendingKey, JSON.stringify(pending))
    } catch (e) {
      console.error('[Scheduler] Failed to store pending notification:', e)
    }
  }
}

/**
 * Get tasks for a specific baby
 * @param {string} babyId 
 * @returns {ScheduledTask[]}
 */
export function getTasksForBaby(babyId) {
  return getScheduledTasks().filter(t => t.babyId === babyId)
}

/**
 * Get tasks for a specific flow
 * @param {string} flowId 
 * @returns {ScheduledTask[]}
 */
export function getTasksForFlow(flowId) {
  return getScheduledTasks().filter(t => t.flowId === flowId)
}

/**
 * Update a scheduled task
 * @param {string} taskId 
 * @param {Partial<ScheduledTask>} updates 
 */
export function updateScheduledTask(taskId, updates) {
  const tasks = getScheduledTasks()
  const index = tasks.findIndex(t => t.id === taskId)
  
  if (index === -1) {
    console.warn('[Scheduler] Task not found:', taskId)
    return false
  }
  
  // Cancel existing timeout
  if (tasks[index]._timeoutId) {
    clearTimeout(tasks[index]._timeoutId)
  }
  
  // Update task
  tasks[index] = { ...tasks[index], ...updates }
  saveScheduledTasks(tasks)
  
  // Reschedule if enabled
  if (tasks[index].enabled && updates.time !== undefined) {
    scheduleNotification(tasks[index])
  }
  
  return true
}

/**
 * Remove scheduled tasks for a flow
 * @param {string} flowId 
 */
export function unregisterFlowTasks(flowId) {
  const tasks = getScheduledTasks()
  
  // Cancel all timeouts
  tasks.filter(t => t.flowId === flowId).forEach(t => {
    if (t._timeoutId) {
      clearTimeout(t._timeoutId)
    }
  })
  
  // Remove from storage
  const remaining = tasks.filter(t => t.flowId !== flowId)
  saveScheduledTasks(remaining)
  
  console.log('[Scheduler] Unregistered tasks for flow:', flowId)
}

/**
 * Check and trigger any due tasks (call on app launch)
 */
export function checkDueTasks() {
  const tasks = getScheduledTasks().filter(t => t.enabled)
  const now = new Date()
  
  tasks.forEach(task => {
    const [hours, minutes] = task.time.split(':').map(Number)
    const taskTime = new Date()
    taskTime.setHours(hours, minutes, 0, 0)
    
    // Within last 5 minutes
    const diff = now.getTime() - taskTime.getTime()
    if (diff >= 0 && diff <= 5 * 60 * 1000) {
      triggerTaskNotification(task)
    }
  })
}

/**
 * Initialize scheduler - call on app start
 */
export function initScheduler() {
  console.log('[Scheduler] Initializing...')
  
  // Check for due tasks
  checkDueTasks()
  
  // Reschedule all enabled tasks
  const tasks = getScheduledTasks().filter(t => t.enabled)
  tasks.forEach(task => {
    scheduleNotification(task)
  })
  
  console.log('[Scheduler] Initialized with', tasks.length, 'active tasks')
}

export default {
  registerFlowAsTask,
  getTasksForBaby,
  getTasksForFlow,
  updateScheduledTask,
  unregisterFlowTasks,
  checkDueTasks,
  initScheduler
}