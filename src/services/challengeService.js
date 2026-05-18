import { TABLES } from '../db/schema'

let db = null

const initDb = () => {
  if (!db && typeof uni !== 'undefined') {
    const SQLiteDB = require('../db/sqlite').SQLiteDB
    db = SQLiteDB.getInstance()
  }
}

export const challengeService = {
  async createChallengeTable() {
    initDb()
    if (!db) return false
    const sql = `
      CREATE TABLE IF NOT EXISTS ${TABLES.CHALLENGES} (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        target_value INTEGER NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `
    return db.execute(sql)
  },

  async createParticipantTable() {
    initDb()
    if (!db) return false
    const sql = `
      CREATE TABLE IF NOT EXISTS ${TABLES.CHALLENGE_PARTICIPANTS} (
        id TEXT PRIMARY KEY,
        challenge_id TEXT NOT NULL,
        baby_id TEXT NOT NULL,
        current_value INTEGER DEFAULT 0,
        rank INTEGER DEFAULT 0,
        joined_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `
    return db.execute(sql)
  },

  async insertChallenge(challenge) {
    initDb()
    if (!db) return false
    const sql = `
      INSERT INTO ${TABLES.CHALLENGES} (id, name, type, target_value, start_date, end_date, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    return db.execute(sql, [
      challenge.id,
      challenge.name,
      challenge.type,
      challenge.target_value,
      challenge.start_date,
      challenge.end_date,
      challenge.status,
      challenge.created_at,
      challenge.updated_at
    ])
  },

  async getActiveChallenges() {
    initDb()
    if (!db) return []
    const now = new Date().toISOString()
    const sql = `
      SELECT * FROM ${TABLES.CHALLENGES}
      WHERE status = 'active' AND end_date > ?
      ORDER BY created_at DESC
    `
    const result = await db.query(sql, [now])
    return result || []
  },

  async getChallengeById(id) {
    initDb()
    if (!db) return null
    const sql = `SELECT * FROM ${TABLES.CHALLENGES} WHERE id = ?`
    const result = await db.query(sql, [id])
    return result && result.length > 0 ? result[0] : null
  },

  async updateChallengeStatus(id, status) {
    initDb()
    if (!db) return false
    const sql = `
      UPDATE ${TABLES.CHALLENGES}
      SET status = ?, updated_at = ?
      WHERE id = ?
    `
    return db.execute(sql, [status, new Date().toISOString(), id])
  },

  async insertParticipant(participant) {
    initDb()
    if (!db) return false
    const sql = `
      INSERT INTO ${TABLES.CHALLENGE_PARTICIPANTS} (id, challenge_id, baby_id, current_value, rank, joined_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    return db.execute(sql, [
      participant.id,
      participant.challenge_id,
      participant.baby_id,
      participant.current_value,
      participant.rank,
      participant.joined_at,
      participant.updated_at
    ])
  },

  async getParticipantsByChallenge(challengeId) {
    initDb()
    if (!db) return []
    const sql = `
      SELECT * FROM ${TABLES.CHALLENGE_PARTICIPANTS}
      WHERE challenge_id = ?
      ORDER BY rank ASC
    `
    const result = await db.query(sql, [challengeId])
    return result || []
  },

  async getParticipant(challengeId, babyId) {
    initDb()
    if (!db) return null
    const sql = `
      SELECT * FROM ${TABLES.CHALLENGE_PARTICIPANTS}
      WHERE challenge_id = ? AND baby_id = ?
    `
    const result = await db.query(sql, [challengeId, babyId])
    return result && result.length > 0 ? result[0] : null
  },

  async updateParticipantProgress(id, currentValue) {
    initDb()
    if (!db) return false
    const sql = `
      UPDATE ${TABLES.CHALLENGE_PARTICIPANTS}
      SET current_value = ?, updated_at = ?
      WHERE id = ?
    `
    return db.execute(sql, [currentValue, new Date().toISOString(), id])
  },

  async updateParticipantRank(id, rank) {
    initDb()
    if (!db) return false
    const sql = `
      UPDATE ${TABLES.CHALLENGE_PARTICIPANTS}
      SET rank = ?, updated_at = ?
      WHERE id = ?
    `
    return db.execute(sql, [rank, new Date().toISOString(), id])
  }
}
