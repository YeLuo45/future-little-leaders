/**
 * V4 SQLite 初始化 — sql.js WebAssembly SQLite
 * 替代 localStorage 作为主数据存储
 */

import { SCHEMA, INDEXES } from './schema.js'

let db = null
let SQL = null

// sql.js CDN 地址
const SQLJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.min.js'

/**
 * 加载 sql.js（从 CDN）
 * @returns {Promise<SQL>}
 */
async function loadSqlJs() {
  if (SQL) return SQL
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('sql.js 仅支持浏览器环境'))
      return
    }
    const script = document.createElement('script')
    script.src = SQLJS_CDN
    script.onload = () => {
      // sql.js 加载后通过 window.SQL 初始化
      window.SQL_CONFIG = { locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}` }
      window.initSqlJs(window.SQL_CONFIG).then(resolve).catch(reject)
    }
    script.onerror = () => reject(new Error(`加载 sql.js 失败: ${SQLJS_CDN}`))
    document.head.appendChild(script)
  })
}

/**
 * 初始化数据库
 * @param {Uint8Array} [existingData] - 可选：已有数据（恢复用）
 * @returns {Promise<Database>}
 */
export async function initDatabase(existingData) {
  if (db) return db

  console.log('[V4][SQLite] 初始化中...')

  SQL = await loadSqlJs()

  if (existingData) {
    db = new SQL.Database(existingData)
    console.log('[V4][SQLite] 从已有数据恢复')
  } else {
    db = new SQL.Database()
    console.log('[V4][SQLite] 创建新数据库')
  }

  // 创建表
  for (const tableName of Object.keys(SCHEMA)) {
    db.run(SCHEMA[tableName])
    console.log(`[V4][SQLite] 创建表: ${tableName}`)
  }

  // 创建索引
  for (const idxSql of INDEXES) {
    db.run(idxSql)
  }

  console.log('[V4][SQLite] 初始化完成')
  return db
}

/**
 * 获取数据库实例
 */
export function getDb() {
  if (!db) throw new Error('[V4][SQLite] 数据库未初始化，请先调用 initDatabase()')
  return db
}

/**
 * 导出数据库为 Uint8Array（用于持久化到 IndexedDB/localStorage）
 */
export function exportDatabase() {
  if (!db) return null
  return new Uint8Array(db.export())
}

// ===== CRUD Helper =====

/**
 * 插入数据
 * @param {string} table
 * @param {object} row
 */
export function insert(table, row) {
  const keys = Object.keys(row)
  const values = Object.values(row)
  const placeholders = keys.map(() => '?').join(',')
  const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`
  getDb().run(sql, values)
}

/**
 * 按 ID 查询单条
 * @param {string} table
 * @param {string} id
 * @returns {object|null}
 */
export function queryById(table, id) {
  const sql = `SELECT * FROM ${table} WHERE id = ? LIMIT 1`
  const result = getDb().exec(sql, [id])
  if (!result.length || !result[0].values.length) return null
  return rowToObject(result[0].columns, result[0].values[0])
}

/**
 * 查询表中所有记录
 * @param {string} table
 * @returns {object[]}
 */
export function queryAll(table) {
  const sql = `SELECT * FROM ${table}`
  const result = getDb().exec(sql)
  if (!result.length) return []
  return result[0].values.map(row => rowToObject(result[0].columns, row))
}

/**
 * 按条件查询
 * @param {string} table
 * @param {object} where - { column: value }
 * @returns {object[]}
 */
export function queryWhere(table, where) {
  const entries = Object.entries(where)
  const whereClause = entries.map(([k]) => `${k} = ?`).join(' AND ')
  const values = entries.map(([, v]) => v)
  const sql = `SELECT * FROM ${table} WHERE ${whereClause}`
  const result = getDb().exec(sql, values)
  if (!result.length) return []
  return result[0].values.map(row => rowToObject(result[0].columns, row))
}

/**
 * 更新记录
 * @param {string} table
 * @param {string} id
 * @param {object} data
 */
export function update(table, id, data) {
  const entries = Object.entries(data)
  const setClause = entries.map(([k]) => `${k} = ?`).join(', ')
  const values = [...entries.map(([, v]) => v), id]
  const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`
  getDb().run(sql, values)
}

/**
 * 删除记录
 * @param {string} table
 * @param {string} id
 */
export function remove(table, id) {
  const sql = `DELETE FROM ${table} WHERE id = ?`
  getDb().run(sql, [id])
}

/**
 * 执行原生 SQL（供高级用法）
 * @param {string} sql
 * @param {any[]} [params]
 * @returns {any}
 */
export function raw(sql, params = []) {
  return getDb().exec(sql, params)
}

// ===== Helper =====

/**
 * 将 sql.js 结果列+值转换为对象
 */
function rowToObject(columns, values) {
  const obj = {}
  columns.forEach((col, i) => {
    obj[col] = values[i]
  })
  return obj
}