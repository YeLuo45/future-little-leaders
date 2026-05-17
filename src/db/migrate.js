/**
 * V4 Migration Layer
 * Migrates data from localStorage to SQLite
 */

import { insert, query } from './sqlite.js'
import { TABLES } from './schema.js'

const MIGRATION_KEY = 'v4_migration_completed'

/**
 * Check if migration has already been completed
 */
function isMigrationCompleted() {
  return localStorage.getItem(MIGRATION_KEY) === 'true'
}

/**
 * Mark migration as completed
 */
function markMigrationCompleted() {
  localStorage.setItem(MIGRATION_KEY, 'true')
}

/**
 * Migrate babies data
 */
function migrateBabies() {
  try {
    const stored = uni.getStorageSync('babies')
    if (!stored) return { success: true, count: 0 }
    
    const babies = typeof stored === 'string' ? JSON.parse(stored) : stored
    if (!Array.isArray(babies)) return { success: true, count: 0 }
    
    // Check if already migrated
    const existing = query(TABLES.BABIES)
    if (existing.length > 0) {
      console.log('[V4] Babies already migrated')
      return { success: true, count: existing.length }
    }
    
    let count = 0
    for (const baby of babies) {
      const now = new Date().toISOString()
      const result = insert(TABLES.BABIES, {
        id: baby.id,
        name: baby.name,
        gender: baby.gender || 'unknown',
        birthdate: baby.birthdate,
        avatar: baby.avatar || '',
        createdAt: baby.createdAt || now,
        updatedAt: now
      })
      if (result.success) count++
    }
    
    console.log(`[V4] Migrated ${count} babies`)
    return { success: true, count }
  } catch (e) {
    console.error('[V4] Failed to migrate babies:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Migrate points data
 */
function migratePoints() {
  try {
    // Migrate babyPoints
    const babyPointsData = uni.getStorageSync('babyPointsRecords')
    if (babyPointsData) {
      const babyPoints = typeof babyPointsData === 'string' ? JSON.parse(babyPointsData) : babyPointsData
      if (typeof babyPoints === 'object') {
        // Check if already migrated
        const existing = query(TABLES.POINTS)
        if (existing.length === 0) {
          // We'll recalculate from points records later, just mark as migrated
          localStorage.setItem('v4_points_migrated', JSON.stringify(babyPoints))
        }
      }
    }
    
    // Migrate points records
    const pointsRecords = uni.getStorageSync('pointsRecords')
    if (pointsRecords) {
      const records = typeof pointsRecords === 'string' ? JSON.parse(pointsRecords) : pointsRecords
      if (Array.isArray(records)) {
        const existing = query(TABLES.POINTS)
        if (existing.length === 0) {
          let count = 0
          for (const record of records) {
            const result = insert(TABLES.POINTS, {
              id: record.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
              babyId: record.babyId,
              points: record.points,
              description: record.description || '',
              type: record.type || 'income',
              createdAt: record.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })
            if (result.success) count++
          }
          console.log(`[V4] Migrated ${count} points records`)
        }
      }
    }
    
    return { success: true }
  } catch (e) {
    console.error('[V4] Failed to migrate points:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Migrate tasks data
 */
function migrateTasks() {
  try {
    const tasks = uni.getStorageSync('tasks')
    if (!tasks) return { success: true, count: 0 }
    
    const taskList = typeof tasks === 'string' ? JSON.parse(tasks) : tasks
    if (!Array.isArray(taskList)) return { success: true, count: 0 }
    
    // Check if already migrated
    const existing = query(TABLES.TASKS)
    if (existing.length > 0) {
      console.log('[V4] Tasks already migrated')
      return { success: true, count: existing.length }
    }
    
    let count = 0
    for (const task of taskList) {
      const result = insert(TABLES.TASKS, {
        id: task.id,
        title: task.title,
        description: task.description || '',
        tags: JSON.stringify(task.tags || []),
        type: task.type || 'normal',
        recurringType: task.recurringType || null,
        weekdays: JSON.stringify(task.weekdays || []),
        monthDays: JSON.stringify(task.monthDays || []),
        customStartTime: task.customStartTime || null,
        customEndTime: task.customEndTime || null,
        total: task.total || 0,
        points: task.points || 0,
        completed: task.completed || 0,
        status: task.status || 'ongoing',
        babyId: task.babyId,
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      if (result.success) count++
    }
    
    console.log(`[V4] Migrated ${count} tasks`)
    return { success: true, count }
  } catch (e) {
    console.error('[V4] Failed to migrate tasks:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Migrate checkins data
 */
function migrateCheckins() {
  try {
    const checkins = uni.getStorageSync('checkins')
    if (!checkins) return { success: true, count: 0 }
    
    const checkinList = typeof checkins === 'string' ? JSON.parse(checkins) : checkins
    if (!Array.isArray(checkinList)) return { success: true, count: 0 }
    
    // Check if already migrated
    const existing = query(TABLES.CHECKINS)
    if (existing.length > 0) {
      console.log('[V4] Checkins already migrated')
      return { success: true, count: existing.length }
    }
    
    let count = 0
    for (const checkin of checkinList) {
      const result = insert(TABLES.CHECKINS, {
        id: checkin.id,
        babyId: checkin.babyId,
        taskId: checkin.taskId || '',
        checkinTime: checkin.checkinTime || new Date().toISOString(),
        photo: checkin.photo || '',
        notes: checkin.notes || '',
        createdAt: checkin.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      if (result.success) count++
    }
    
    console.log(`[V4] Migrated ${count} checkins`)
    return { success: true, count }
  } catch (e) {
    console.error('[V4] Failed to migrate checkins:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Migrate achievements data
 */
function migrateAchievements() {
  try {
    const achievements = uni.getStorageSync('babyAchievements')
    if (!achievements) return { success: true, count: 0 }
    
    const achievementList = typeof achievements === 'string' ? JSON.parse(achievements) : achievements
    if (!Array.isArray(achievementList)) return { success: true, count: 0 }
    
    // Check if already migrated
    const existing = query(TABLES.ACHIEVEMENTS)
    if (existing.length > 0) {
      console.log('[V4] Achievements already migrated')
      return { success: true, count: existing.length }
    }
    
    let count = 0
    for (const achievement of achievementList) {
      const result = insert(TABLES.ACHIEVEMENTS, {
        id: achievement.id,
        babyId: achievement.babyId,
        achievementType: achievement.achievementType || 'general',
        title: achievement.title || '',
        description: achievement.description || '',
        icon: achievement.icon || '',
        unlockedAt: achievement.unlockedAt || null,
        createdAt: achievement.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      if (result.success) count++
    }
    
    console.log(`[V4] Migrated ${count} achievements`)
    return { success: true, count }
  } catch (e) {
    console.error('[V4] Failed to migrate achievements:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Migrate family members data
 */
function migrateFamilyMembers() {
  try {
    const members = uni.getStorageSync('familyMembers')
    if (!members) return { success: true, count: 0 }
    
    const memberList = typeof members === 'string' ? JSON.parse(members) : members
    if (!Array.isArray(memberList)) return { success: true, count: 0 }
    
    // Check if already migrated
    const existing = query(TABLES.FAMILY_MEMBERS)
    if (existing.length > 0) {
      console.log('[V4] Family members already migrated')
      return { success: true, count: existing.length }
    }
    
    let count = 0
    for (const member of memberList) {
      const result = insert(TABLES.FAMILY_MEMBERS, {
        id: member.id,
        name: member.name,
        role: member.role || 'member',
        avatar: member.avatar || '',
        createdAt: member.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      if (result.success) count++
    }
    
    console.log(`[V4] Migrated ${count} family members`)
    return { success: true, count }
  } catch (e) {
    console.error('[V4] Failed to migrate family members:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Clear localStorage data after migration
 */
function clearLocalStorage() {
  const keysToKeep = [
    'authSettings', 'authPassword', 'theme', 'v4_sqlite_db', 
    'v4_migration_completed', 'v4_points_migrated',
    'uni_app_version', 'uni_platform'
  ]
  
  // We'll keep these for backward compatibility, but main data is now in SQLite
  // Clear only the migrated data
  const keysToClear = [
    'babies', 'currentBabyId', 'pointsRecords', 'exchangeHistory',
    'babyPointsRecords', 'tasks', 'checkins', 'babyAchievements',
    'taskCountByBaby', 'streakByBaby', 'totalPointsByBaby',
    'exchangeCountByBaby', 'familyMembers'
  ]
  
  for (const key of keysToClear) {
    try {
      uni.removeStorageSync(key)
    } catch (e) {
      // ignore
    }
  }
  
  console.log('[V4] Cleared migrated localStorage keys')
}

/**
 * Run full migration from localStorage to SQLite
 * @returns {Promise<{success: boolean, details: object}>}
 */
export async function migrate() {
  console.log('[V4] Starting data migration from localStorage to SQLite...')
  
  if (isMigrationCompleted()) {
    console.log('[V4] Migration already completed, skipping')
    return { success: true, skipped: true }
  }
  
  const results = {
    babies: migrateBabies(),
    points: migratePoints(),
    tasks: migrateTasks(),
    checkins: migrateCheckins(),
    achievements: migrateAchievements(),
    familyMembers: migrateFamilyMembers()
  }
  
  // Mark as completed
  markMigrationCompleted()
  
  // Don't clear localStorage immediately in case migration needs to be re-run
  // clearLocalStorage()
  
  console.log('[V4] Migration completed:', results)
  return { success: true, details: results }
}

/**
 * Check if there is data to migrate
 * @returns {boolean}
 */
export function hasDataToMigrate() {
  const keys = ['babies', 'pointsRecords', 'tasks', 'checkins', 'babyAchievements']
  for (const key of keys) {
    try {
      const val = uni.getStorageSync(key)
      if (val) return true
    } catch (e) {
      // ignore
    }
  }
  return false
}

/**
 * V7: Migrate notifications from localStorage to SQLite
 */
function migrateNotifications() {
  try {
    const stored = uni.getStorageSync('collab_notifications')
    if (!stored) return { success: true, count: 0 }
    
    const notifications = typeof stored === 'string' ? JSON.parse(stored) : stored
    if (!Array.isArray(notifications)) return { success: true, count: 0 }
    
    // Check if already migrated
    const { getNotifications } = require('./sqlite.js')
    const existing = getNotifications('__migration_check__', { limit: 1 })
    
    let count = 0
    for (const n of notifications) {
      const result = require('./sqlite.js').insertNotification({
        id: n.id,
        channel: getChannelFromType(n.type),
        type: n.type,
        recipientId: n.recipientId,
        senderId: n.senderId || null,
        title: n.title,
        content: n.content,
        data: n.data || null,
        priority: n.priority || 'normal',
        read: n.read ? 1 : 0,
        createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
        expiresAt: null,
        synced: 0
      })
      if (result.success) count++
    }
    
    console.log(`[V7] Migrated ${count} notifications`)
    return { success: true, count }
  } catch (e) {
    console.error('[V7] Failed to migrate notifications:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Map old notification type to channel
 */
function getChannelFromType(type) {
  const typeToChannel = {
    task_assigned: 'task',
    task_approved: 'task',
    task_rejected: 'task',
    task_resubmitted: 'task',
    achievement_unlocked: 'achievement',
    points_earned: 'points'
  }
  return typeToChannel[type] || 'system'
}

/**
 * Run V7 notification migration
 * @returns {Promise<object>}
 */
export async function migrateNotificationsV7() {
  console.log('[V7] Starting notification migration...')
  
  const result = migrateNotifications()
  
  console.log('[V7] Notification migration completed:', result)
  return result
}