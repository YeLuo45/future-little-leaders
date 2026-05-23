/**
 * Agent Memory Storage — sql.js based persistence layer
 * V102: Persistent memory across sessions
 */

import { initSqlJs, openDatabase } from '@/db/sqlite.js'

const DB_NAME = 'agent_memory.db'

class AgentMemoryStorage {
  constructor() {
    this.db = null
    this.ready = false
  }

  async init() {
    if (this.ready) return
    try {
      const SQL = await initSqlJs()
      this.db = await openDatabase(SQL, DB_NAME)
      await this.initTables()
      this.ready = true
    } catch (e) {
      console.warn('AgentMemoryStorage init failed, using memory fallback:', e)
      this.memoryFallback = new Map()
      this.ready = true
    }
  }

  async initTables() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS agent_memories (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        layer TEXT NOT NULL,
        data TEXT NOT NULL,
        ts INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)
    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_agent_layer ON agent_memories(agent_id, layer)
    `)
  }

  async get(key) {
    if (!this.ready) await this.init()
    if (this.memoryFallback) {
      return this.memoryFallback.get(key)
    }
    try {
      const stmt = this.db.prepare('SELECT data FROM agent_memories WHERE id = ?')
      stmt.bind([key])
      if (stmt.step()) {
        const row = stmt.getAsObject()
        stmt.free()
        return row.data
      }
      stmt.free()
      return null
    } catch (e) {
      console.warn('Memory get error:', e)
      return null
    }
  }

  async set(key, value) {
    if (!this.ready) await this.init()
    if (this.memoryFallback) {
      this.memoryFallback.set(key, value)
      return
    }
    try {
      // Check if exists
      const exists = await this.get(key)
      if (exists !== null) {
        this.db.run('UPDATE agent_memories SET data = ?, ts = ? WHERE id = ?', [value, Date.now(), key])
      } else {
        this.db.run('INSERT INTO agent_memories (id, agent_id, layer, data, ts) VALUES (?, ?, ?, ?, ?)',
          [key, key.split('_')[0], key.split('_')[1] || 'L4', value, Date.now()])
      }
    } catch (e) {
      console.warn('Memory set error:', e)
    }
  }

  async delete(key) {
    if (!this.ready) await this.init()
    if (this.memoryFallback) {
      this.memoryFallback.delete(key)
      return
    }
    try {
      this.db.run('DELETE FROM agent_memories WHERE id = ?', [key])
    } catch (e) {
      console.warn('Memory delete error:', e)
    }
  }

  async getByAgent(agentId, layer = null) {
    if (!this.ready) await this.init()
    if (this.memoryFallback) {
      const results = []
      for (const [k, v] of this.memoryFallback) {
        if (k.startsWith(agentId)) {
          if (!layer || k.includes(layer)) {
            results.push({ id: k, data: v })
          }
        }
      }
      return results
    }
    try {
      let sql = 'SELECT * FROM agent_memories WHERE agent_id = ?'
      const params = [agentId]
      if (layer) {
        sql += ' AND layer = ?'
        params.push(layer)
      }
      sql += ' ORDER BY ts DESC'
      const results = []
      const stmt = this.db.prepare(sql)
      stmt.bind(params)
      while (stmt.step()) {
        results.push(stmt.getAsObject())
      }
      stmt.free()
      return results
    } catch (e) {
      console.warn('Memory getByAgent error:', e)
      return []
    }
  }

  async clearAgent(agentId) {
    if (!this.ready) await this.init()
    if (this.memoryFallback) {
      for (const k of this.memoryFallback.keys()) {
        if (k.startsWith(agentId)) {
          this.memoryFallback.delete(k)
        }
      }
      return
    }
    try {
      this.db.run('DELETE FROM agent_memories WHERE agent_id = ?', [agentId])
    } catch (e) {
      console.warn('Memory clearAgent error:', e)
    }
  }
}

// Singleton instance
let storageInstance = null

export async function getAgentMemoryStorage() {
  if (!storageInstance) {
    storageInstance = new AgentMemoryStorage()
    await storageInstance.init()
  }
  return storageInstance
}

export { AgentMemoryStorage }