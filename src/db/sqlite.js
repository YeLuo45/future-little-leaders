/**
 * V4 SQLite Database Layer
 * Uses sql.js (WebAssembly SQLite) for offline-first storage
 */

import { SCHEMA } from './schema.js'

let db = null
let SQL = null

/**
 * Initialize sql.js database
 * @returns {Promise<{db: any, SQL: any}>}
 */
export async function initDatabase() {
  console.log('[V4] Initializing SQLite database...')
  
  if (db && SQL) {
    console.log('[V4] SQLite already initialized')
    return { db, SQL }
  }

  return new Promise((resolve, reject) => {
    // Load sql.js from CDN
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.min.js'
    script.onload = async () => {
      try {
        // Initialize sql.js
        SQL = await window.initSqlJs({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        })
        
        // Try to load existing database from localStorage
        let data = null
        try {
          const stored = localStorage.getItem('v4_sqlite_db')
          if (stored) {
            const raw = atob(stored)
            const bytes = new Uint8Array(raw.length)
            for (let i = 0; i < raw.length; i++) {
              bytes[i] = raw.charCodeAt(i)
            }
            data = bytes.buffer
          }
        } catch (e) {
          console.log('[V4] No existing database found, creating new one')
        }
        
        // Create or open database
        db = data ? new SQL.Database(new Uint8Array(data)) : new SQL.Database()
        
        // Run schema creation
        db.run(SCHEMA)
        
        // Try to enable WAL mode (may not work in all browsers)
        try {
          db.run('PRAGMA journal_mode=WAL')
        } catch (e) {
          console.log('[V4] WAL mode not supported, using default')
        }
        
        console.log('[V4] SQLite database initialized successfully')
        resolve({ db, SQL })
      } catch (e) {
        console.error('[V4] Failed to initialize SQLite:', e)
        reject(e)
      }
    }
    script.onerror = (e) => {
      console.error('[V4] Failed to load sql.js:', e)
      reject(new Error('Failed to load sql.js'))
    }
    document.head.appendChild(script)
  })
}

/**
 * Save database to localStorage (for persistence)
 */
export function saveDatabase() {
  if (!db) return
  try {
    const data = db.export()
    const binary = String.fromCharCode.apply(null, data)
    localStorage.setItem('v4_sqlite_db', btoa(binary))
  } catch (e) {
    console.error('[V4] Failed to save database:', e)
  }
}

/**
 * Get database instance
 */
export function getDatabase() {
  return db
}

/**
 * Insert a row into a table
 * @param {string} table - Table name
 * @param {object} data - Data to insert
 * @returns {object} - { success: boolean, id?: string }
 */
export function insert(table, data) {
  if (!db) {
    console.error('[V4] Database not initialized')
    return { success: false }
  }
  
  const now = new Date().toISOString()
  const id = data.id || Date.now().toString()
  
  // Add timestamps
  data.createdAt = data.createdAt || now
  data.updatedAt = now
  
  const columns = Object.keys(data)
  const values = Object.values(data)
  const placeholders = columns.map(() => '?').join(', ')
  
  try {
    db.run(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
      values
    )
    saveDatabase()
    return { success: true, id }
  } catch (e) {
    console.error('[V4] Insert failed:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Update a row in a table
 * @param {string} table - Table name
 * @param {string} id - Row ID
 * @param {object} data - Data to update
 * @returns {object} - { success: boolean }
 */
export function update(table, id, data) {
  if (!db) {
    console.error('[V4] Database not initialized')
    return { success: false }
  }
  
  data.updatedAt = new Date().toISOString()
  
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ')
  const values = [...Object.values(data), id]
  
  try {
    db.run(
      `UPDATE ${table} SET ${sets} WHERE id = ?`,
      values
    )
    saveDatabase()
    return { success: true }
  } catch (e) {
    console.error('[V4] Update failed:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Delete a row from a table
 * @param {string} table - Table name
 * @param {string} id - Row ID
 * @returns {object} - { success: boolean }
 */
export function del(table, id) {
  if (!db) {
    console.error('[V4] Database not initialized')
    return { success: false }
  }
  
  try {
    db.run(`DELETE FROM ${table} WHERE id = ?`, [id])
    saveDatabase()
    return { success: true }
  } catch (e) {
    console.error('[V4] Delete failed:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Query rows from a table
 * @param {string} table - Table name
 * @param {object} options - Query options
 * @returns {array} - Array of rows
 */
export function query(table, options = {}) {
  if (!db) {
    console.error('[V4] Database not initialized')
    return []
  }
  
  const { where, orderBy, limit, offset } = options
  
  let sql = `SELECT * FROM ${table}`
  const params = []
  
  if (where) {
    const conditions = Object.keys(where).map(k => {
      params.push(where[k])
      return `${k} = ?`
    })
    sql += ` WHERE ${conditions.join(' AND ')}`
  }
  
  if (orderBy) {
    sql += ` ORDER BY ${orderBy}`
  } else {
    sql += ` ORDER BY createdAt DESC`
  }
  
  if (limit) {
    sql += ` LIMIT ${parseInt(limit)}`
  }
  
  if (offset) {
    sql += ` OFFSET ${parseInt(offset)}`
  }
  
  try {
    const results = db.exec(sql, params)
    if (!results.length) return []
    
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => {
        obj[col] = row[i]
      })
      return obj
    })
  } catch (e) {
    console.error('[V4] Query failed:', e)
    return []
  }
}

/**
 * Get a single row by ID
 * @param {string} table - Table name
 * @param {string} id - Row ID
 * @returns {object|null}
 */
export function getById(table, id) {
  const results = query(table, { where: { id } })
  return results.length ? results[0] : null
}

/**
 * Run raw SQL (for advanced operations)
 * @param {string} sql - SQL query
 * @param {array} params - Query parameters
 * @returns {any}
 */
export function raw(sql, params = []) {
  if (!db) {
    console.error('[V4] Database not initialized')
    return null
  }
  
  try {
    const results = db.exec(sql, params)
    if (!results.length) return []
    
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => {
        obj[col] = row[i]
      })
      return obj
    })
  } catch (e) {
    console.error('[V4] Raw query failed:', e)
    return null
  }
}

// ==================== V6 Skill Tree CRUD ====================

import { TABLES } from './schema.js'

/**
 * Initialize skill trees and nodes (called once on first V6 init)
 */
export function initSkillTrees() {
  if (!db) {
    console.error('[V6] Database not initialized')
    return { success: false }
  }
  
  // Check if already initialized
  const existingTrees = query(TABLES.SKILL_TREES)
  if (existingTrees.length > 0) {
    console.log('[V6] Skill trees already initialized')
    return { success: true, count: existingTrees.length }
  }
  
  const now = new Date().toISOString()
  
  // Define four skill trees
  const trees = [
    { id: 'knowledge', name: '知识探索', description: '数学基础知识学习', icon: '📚', color: '#4A90D9' },
    { id: 'habit', name: '习惯养成', description: '日常生活习惯培养', icon: '🌱', color: '#52C41A' },
    { id: 'social', name: '社交达人', description: '人际交往能力培养', icon: '🤝', color: '#FA8C16' },
    { id: 'creative', name: '创意大师', description: '创造力与想象力培养', icon: '🎨', color: '#722ED1' }
  ]
  
  // Insert trees
  for (const tree of trees) {
    insert(TABLES.SKILL_TREES, { ...tree, createdAt: now, updatedAt: now })
  }
  
  // Define skill nodes for each tree
  const nodes = [
    // Knowledge tree - 识数→加法→减法→乘法→除法
    { id: 'k_t0_1', treeId: 'knowledge', name: '识数基础', description: '认识数字1-10', icon: '🔢', tier: 0, prerequisiteIds: '[]', conditionType: 'task_complete', conditionCount: 1, conditionTag: 'math', comparator: '>=', pointsReward: 10, autoUnlock: 1 },
    { id: 'k_t1_1', treeId: 'knowledge', name: '加法入门', description: '掌握10以内加法', icon: '➕', tier: 1, prerequisiteIds: '["k_t0_1"]', conditionType: 'task_complete', conditionCount: 3, conditionTag: 'math', comparator: '>=', pointsReward: 15, autoUnlock: 1 },
    { id: 'k_t1_2', treeId: 'knowledge', name: '减法入门', description: '掌握10以内减法', icon: '➖', tier: 1, prerequisiteIds: '["k_t0_1"]', conditionType: 'task_complete', conditionCount: 3, conditionTag: 'math', comparator: '>=', pointsReward: 15, autoUnlock: 1 },
    { id: 'k_t2_1', treeId: 'knowledge', name: '加法进阶', description: '掌握20以内加法', icon: '🧮', tier: 2, prerequisiteIds: '["k_t1_1"]', conditionType: 'task_complete', conditionCount: 5, conditionTag: 'math', comparator: '>=', pointsReward: 20, autoUnlock: 1 },
    { id: 'k_t2_2', treeId: 'knowledge', name: '减法进阶', description: '掌握20以内减法', icon: '📐', tier: 2, prerequisiteIds: '["k_t1_2"]', conditionType: 'task_complete', conditionCount: 5, conditionTag: 'math', comparator: '>=', pointsReward: 20, autoUnlock: 1 },
    { id: 'k_t3_1', treeId: 'knowledge', name: '乘法入门', description: '认识乘法概念', icon: '✖️', tier: 3, prerequisiteIds: '["k_t2_1"]', conditionType: 'task_complete', conditionCount: 3, conditionTag: 'math', comparator: '>=', pointsReward: 25, autoUnlock: 1 },
    { id: 'k_t3_2', treeId: 'knowledge', name: '除法入门', description: '认识除法概念', icon: '➗', tier: 3, prerequisiteIds: '["k_t2_2"]', conditionType: 'task_complete', conditionCount: 3, conditionTag: 'math', comparator: '>=', pointsReward: 25, autoUnlock: 1 },
    
    // Habit tree - 早睡早起→早晚刷牙→整理房间等
    { id: 'h_t0_1', treeId: 'habit', name: '早睡早起', description: '按时作息养成', icon: '🌙', tier: 0, prerequisiteIds: '[]', conditionType: 'streak', conditionCount: 7, conditionTag: 'sleep', comparator: '>=', pointsReward: 10, autoUnlock: 1 },
    { id: 'h_t1_1', treeId: 'habit', name: '早晚刷牙', description: '养成刷牙好习惯', icon: '🦷', tier: 1, prerequisiteIds: '["h_t0_1"]', conditionType: 'streak', conditionCount: 7, conditionTag: 'brush', comparator: '>=', pointsReward: 15, autoUnlock: 1 },
    { id: 'h_t1_2', treeId: 'habit', name: '整理床铺', description: '起床后整理床铺', icon: '🛏️', tier: 1, prerequisiteIds: '["h_t0_1"]', conditionType: 'task_complete', conditionCount: 7, conditionTag: 'clean', comparator: '>=', pointsReward: 15, autoUnlock: 1 },
    { id: 'h_t2_1', treeId: 'habit', name: '整理房间', description: '保持房间整洁', icon: '🏠', tier: 2, prerequisiteIds: '["h_t1_2"]', conditionType: 'task_complete', conditionCount: 5, conditionTag: 'clean', comparator: '>=', pointsReward: 20, autoUnlock: 1 },
    { id: 'h_t2_2', treeId: 'habit', name: '垃圾分类', description: '学习垃圾分类', icon: '♻️', tier: 2, prerequisiteIds: '["h_t1_1"]', conditionType: 'task_complete', conditionCount: 5, conditionTag: 'eco', comparator: '>=', pointsReward: 20, autoUnlock: 1 },
    { id: 'h_t2_3', treeId: 'habit', name: '帮忙洗碗', description: '餐后帮忙收拾碗筷', icon: '🍽️', tier: 2, prerequisiteIds: '["h_t1_1"]', conditionType: 'task_complete', conditionCount: 5, conditionTag: 'help', comparator: '>=', pointsReward: 20, autoUnlock: 1 },
    { id: 'h_t3_1', treeId: 'habit', name: '独立穿衣', description: '自己穿衣服', icon: '👕', tier: 3, prerequisiteIds: '["h_t2_1"]', conditionType: 'task_complete', conditionCount: 7, conditionTag: 'self_care', comparator: '>=', pointsReward: 25, autoUnlock: 1 },
    { id: 'h_t3_2', treeId: 'habit', name: '餐桌整理', description: '餐前摆好餐具', icon: '🍴', tier: 3, prerequisiteIds: '["h_t2_3"]', conditionType: 'task_complete', conditionCount: 7, conditionTag: 'help', comparator: '>=', pointsReward: 25, autoUnlock: 1 },
    
    // Social tree - 打招呼→自我介绍→分享玩具→帮助他人
    { id: 's_t0_1', treeId: 'social', name: '礼貌问候', description: '学会问好和道别', icon: '👋', tier: 0, prerequisiteIds: '[]', conditionType: 'task_complete', conditionCount: 1, conditionTag: 'greet', comparator: '>=', pointsReward: 10, autoUnlock: 1 },
    { id: 's_t1_1', treeId: 'social', name: '自我介绍', description: '能够介绍自己', icon: '🙋', tier: 1, prerequisiteIds: '["s_t0_1"]', conditionType: 'task_complete', conditionCount: 3, conditionTag: 'intro', comparator: '>=', pointsReward: 15, autoUnlock: 1 },
    { id: 's_t1_2', treeId: 'social', name: '分享玩具', description: '愿意与他人分享', icon: '🧸', tier: 1, prerequisiteIds: '["s_t0_1"]', conditionType: 'task_complete', conditionCount: 3, conditionTag: 'share', comparator: '>=', pointsReward: 15, autoUnlock: 1 },
    { id: 's_t2_1', treeId: 'social', name: '帮助他人', description: '主动帮助有需要的人', icon: '🤝', tier: 2, prerequisiteIds: '["s_t1_1", "s_t1_2"]', conditionType: 'task_complete', conditionCount: 5, conditionTag: 'help', comparator: '>=', pointsReward: 20, autoUnlock: 1 },
    { id: 's_t2_2', treeId: 'social', name: '团队合作', description: '参与团队活动', icon: '👥', tier: 2, prerequisiteIds: '["s_t1_2"]', conditionType: 'task_complete', conditionCount: 3, conditionTag: 'team', comparator: '>=', pointsReward: 20, autoUnlock: 1 },
    { id: 's_t3_1', treeId: 'social', name: '冲突解决', description: '学会和平解决争端', icon: '⚖️', tier: 3, prerequisiteIds: '["s_t2_1"]', conditionType: 'task_complete', conditionCount: 3, conditionTag: 'conflict', comparator: '>=', pointsReward: 25, autoUnlock: 1 },
    { id: 's_t3_2', treeId: 'social', name: '领导能力', description: '带领小团队完成任务', icon: '⭐', tier: 3, prerequisiteIds: '["s_t2_2"]', conditionType: 'task_complete', conditionCount: 3, conditionTag: 'lead', comparator: '>=', pointsReward: 25, autoUnlock: 1 },
    
    // Creative tree - 涂色→画画→折纸→积木
    { id: 'c_t0_1', treeId: 'creative', name: '自由涂色', description: '在轮廓内涂色', icon: '🎨', tier: 0, prerequisiteIds: '[]', conditionType: 'task_complete', conditionCount: 1, conditionTag: 'color', comparator: '>=', pointsReward: 10, autoUnlock: 1 },
    { id: 'c_t1_1', treeId: 'creative', name: '简笔画', description: '绘制简单图形', icon: '✏️', tier: 1, prerequisiteIds: '["c_t0_1"]', conditionType: 'task_complete', conditionCount: 3, conditionTag: 'draw', comparator: '>=', pointsReward: 15, autoUnlock: 1 },
    { id: 'c_t1_2', treeId: 'creative', name: '折纸入门', description: '基础折纸技巧', icon: '📄', tier: 1, prerequisiteIds: '["c_t0_1"]', conditionType: 'task_complete', conditionCount: 3, conditionTag: 'fold', comparator: '>=', pointsReward: 15, autoUnlock: 1 },
    { id: 'c_t2_1', treeId: 'creative', name: '积木搭建', description: '用积木搭建结构', icon: '🧱', tier: 2, prerequisiteIds: '["c_t1_1"]', conditionType: 'task_complete', conditionCount: 5, conditionTag: 'build', comparator: '>=', pointsReward: 20, autoUnlock: 1 },
    { id: 'c_t2_2', treeId: 'creative', name: '黏土造型', description: '用黏土塑造物品', icon: '🎭', tier: 2, prerequisiteIds: '["c_t1_2"]', conditionType: 'task_complete', conditionCount: 5, conditionTag: 'clay', comparator: '>=', pointsReward: 20, autoUnlock: 1 },
    { id: 'c_t3_1', treeId: 'creative', name: '创意绘画', description: '独立完成一幅画', icon: '🖼️', tier: 3, prerequisiteIds: '["c_t2_1"]', conditionType: 'task_complete', conditionCount: 3, conditionTag: 'draw', comparator: '>=', pointsReward: 25, autoUnlock: 1 },
    { id: 'c_t3_2', treeId: 'creative', name: '故事创作', description: '讲述或表演故事', icon: '📖', tier: 3, prerequisiteIds: '["c_t2_2"]', conditionType: 'task_complete', conditionCount: 3, conditionTag: 'story', comparator: '>=', pointsReward: 25, autoUnlock: 1 }
  ]
  
  // Insert nodes
  for (const node of nodes) {
    insert(TABLES.SKILL_NODES, { ...node, createdAt: now, updatedAt: now })
  }
  
  console.log(`[V6] Initialized ${trees.length} skill trees with ${nodes.length} nodes`)
  return { success: true, treeCount: trees.length, nodeCount: nodes.length }
}

/**
 * Get all nodes for a specific skill tree
 */
export function getNodesByTree(treeId) {
  if (!db) {
    console.error('[V6] Database not initialized')
    return []
  }
  return query(TABLES.SKILL_NODES, { where: { treeId }, orderBy: 'tier ASC' })
}

/**
 * Get a single node by ID
 */
export function getSkillNode(nodeId) {
  return getById(TABLES.SKILL_NODES, nodeId)
}

/**
 * Get all skill trees
 */
export function getAllSkillTrees() {
  return query(TABLES.SKILL_TREES)
}

/**
 * Get node stats for a baby
 */
export function getNodeStats(nodeId, babyId) {
  const results = query(TABLES.SKILL_NODE_STATS, { where: { nodeId, babyId } })
  return results.length ? results[0] : null
}

/**
 * Get all stats for a baby across all nodes
 */
export function getBabyNodeStats(babyId) {
  return query(TABLES.SKILL_NODE_STATS, { where: { babyId } })
}

/**
 * Initialize or get node stats for a baby
 */
export function getOrCreateNodeStats(nodeId, babyId) {
  let stats = getNodeStats(nodeId, babyId)
  if (!stats) {
    const now = new Date().toISOString()
    const id = `${nodeId}_${babyId}`
    insert(TABLES.SKILL_NODE_STATS, {
      id,
      nodeId,
      babyId,
      currentProgress: 0,
      bestProgress: 0,
      attemptCount: 0,
      unlockAttemptTimestamps: '[]',
      unlockedAt: null,
      createdAt: now,
      updatedAt: now
    })
    stats = getNodeStats(nodeId, babyId)
  }
  return stats
}

/**
 * Update node progress for a baby
 * @param {string} nodeId - Node ID
 * @param {string} babyId - Baby ID
 * @param {number} progress - Progress to add
 * @returns {object} - { success, unlocked, stats }
 */
export function updateNodeProgress(nodeId, babyId, progress = 1) {
  if (!db) {
    console.error('[V6] Database not initialized')
    return { success: false }
  }
  
  const node = getSkillNode(nodeId)
  if (!node) {
    console.error('[V6] Node not found:', nodeId)
    return { success: false }
  }
  
  const stats = getOrCreateNodeStats(nodeId, babyId)
  const newProgress = stats.currentProgress + progress
  const newBest = Math.max(stats.bestProgress, newProgress)
  
  // Update stats
  update(TABLES.SKILL_NODE_STATS, stats.id, {
    currentProgress: newProgress,
    bestProgress: newBest
  })
  
  // Check if unlocked
  const targetCount = node.conditionCount
  const comparator = node.comparator || '>='
  let shouldUnlock = false
  
  if (comparator === '>=') {
    shouldUnlock = newProgress >= targetCount
  } else if (comparator === '==') {
    shouldUnlock = newProgress === targetCount
  } else if (comparator === '<') {
    shouldUnlock = newProgress < targetCount
  }
  
  let unlocked = false
  if (shouldUnlock && !stats.unlockedAt) {
    // Check prerequisites
    const prereqs = JSON.parse(node.prerequisiteIds || '[]')
    if (prereqs.length === 0 || checkPrerequisites(prereqs, babyId)) {
      unlocked = unlockNode(nodeId, babyId, node)
    }
  }
  
  return {
    success: true,
    unlocked,
    progress: newProgress,
    target: targetCount
  }
}

/**
 * Check if all prerequisites are met for a baby
 */
function checkPrerequisites(prerequisiteIds, babyId) {
  for (const prereqId of prerequisiteIds) {
    const prereqStats = getNodeStats(prereqId, babyId)
    if (!prereqStats || !prereqStats.unlockedAt) {
      return false
    }
  }
  return true
}

/**
 * Unlock a skill node for a baby
 */
export function unlockNode(nodeId, babyId, node) {
  if (!db) {
    console.error('[V6] Database not initialized')
    return false
  }
  
  const stats = getNodeStats(nodeId, babyId)
  if (!stats) {
    console.error('[V6] Stats not found for unlock:', nodeId, babyId)
    return false
  }
  
  const now = new Date().toISOString()
  
  // Update stats to mark as unlocked
  update(TABLES.SKILL_NODE_STATS, stats.id, {
    unlockedAt: now,
    currentProgress: node.conditionCount
  })
  
  // Emit unlock event
  uni.$emit('nodeUnlocked', {
    nodeId,
    babyId,
    node,
    points: node.pointsReward
  })
  
  // Emit points event if configured
  if (node.pointsReward > 0) {
    uni.$emit('pointsEarned', {
      babyId,
      points: node.pointsReward,
      source: 'skill_tree',
      description: `解锁技能: ${node.name}`
    })
  }
  
  return true
}

/**
 * Check if a node is unlocked for a baby
 */
export function isNodeUnlocked(nodeId, babyId) {
  const stats = getNodeStats(nodeId, babyId)
  return stats && !!stats.unlockedAt
}

/**
 * Check if a node is available (prerequisites met but not yet unlocked)
 */
export function isNodeAvailable(nodeId, babyId) {
  const node = getSkillNode(nodeId)
  if (!node) return false
  
  const stats = getNodeStats(nodeId, babyId)
  if (stats && stats.unlockedAt) return false
  
  const prereqs = JSON.parse(node.prerequisiteIds || '[]')
  return checkPrerequisites(prereqs, babyId)
}

/**
 * Self-evolution: adjust threshold if连续失败
 * Called when a node fails repeatedly
 */
export function adjustThreshold(nodeId, babyId, multiplier = 0.9) {
  if (!db) return { success: false }
  
  const node = getSkillNode(nodeId)
  if (!node) return { success: false }
  
  const stats = getOrCreateNodeStats(nodeId, babyId)
  
  // If连续3次失败且未解锁，阈值下调10%
  if (stats.attemptCount >= 3 && !stats.unlockedAt) {
    const newCount = Math.max(1, Math.floor(node.conditionCount * multiplier))
    
    // Update the node's condition count
    update(TABLES.SKILL_NODES, nodeId, {
      conditionCount: newCount
    })
    
    // Reset attempt count
    update(TABLES.SKILL_NODE_STATS, stats.id, {
      attemptCount: 0
    })
    
    console.log(`[V6] Adjusted threshold for ${nodeId}: ${node.conditionCount} -> ${newCount}`)
    return { success: true, adjusted: true, newCount }
  }
  
  return { success: true, adjusted: false }
}

/**
 * Record an unlock attempt (for tracking failures)
 */
export function recordUnlockAttempt(nodeId, babyId) {
  const stats = getOrCreateNodeStats(nodeId, babyId)
  const timestamps = JSON.parse(stats.unlockAttemptTimestamps || '[]')
  timestamps.push(new Date().toISOString())
  
  update(TABLES.SKILL_NODE_STATS, stats.id, {
    attemptCount: stats.attemptCount + 1,
    unlockAttemptTimestamps: JSON.stringify(timestamps)
  })
}