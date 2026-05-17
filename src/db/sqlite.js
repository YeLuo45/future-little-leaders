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