import { TABLES } from '../db/schema'

let db = null

const initDb = () => {
  if (!db && typeof uni !== 'undefined') {
    const SQLiteDB = require('../db/sqlite').SQLiteDB
    db = SQLiteDB.getInstance()
  }
}

export const friendService = {
  async createFriendTable() {
    initDb()
    if (!db) return false
    const sql = `
      CREATE TABLE IF NOT EXISTS ${TABLES.FRIENDS} (
        id TEXT PRIMARY KEY,
        owner_baby_id TEXT NOT NULL,
        friend_baby_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `
    return db.execute(sql)
  },

  async insertFriend(friend) {
    initDb()
    if (!db) return false
    const sql = `
      INSERT INTO ${TABLES.FRIENDS} (id, owner_baby_id, friend_baby_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    return db.execute(sql, [
      friend.id,
      friend.owner_baby_id,
      friend.friend_baby_id,
      friend.status,
      friend.created_at,
      friend.updated_at
    ])
  },

  async updateFriendStatus(id, status) {
    initDb()
    if (!db) return false
    const sql = `
      UPDATE ${TABLES.FRIENDS}
      SET status = ?, updated_at = ?
      WHERE id = ?
    `
    return db.execute(sql, [status, new Date().toISOString(), id])
  },

  async getFriendsByOwner(ownerBabyId) {
    initDb()
    if (!db) return []
    const sql = `
      SELECT * FROM ${TABLES.FRIENDS}
      WHERE owner_baby_id = ? AND status = 'accepted'
      ORDER BY created_at DESC
    `
    const result = await db.query(sql, [ownerBabyId])
    return result || []
  },

  async getPendingRequests(friendBabyId) {
    initDb()
    if (!db) return []
    const sql = `
      SELECT * FROM ${TABLES.FRIENDS}
      WHERE friend_baby_id = ? AND status = 'pending'
      ORDER BY created_at DESC
    `
    const result = await db.query(sql, [friendBabyId])
    return result || []
  },

  async deleteFriend(id) {
    initDb()
    if (!db) return false
    const sql = `DELETE FROM ${TABLES.FRIENDS} WHERE id = ?`
    return db.execute(sql, [id])
  },

  async createPointGiftTable() {
    initDb()
    if (!db) return false
    const sql = `
      CREATE TABLE IF NOT EXISTS ${TABLES.POINT_GIFTS} (
        id TEXT PRIMARY KEY,
        from_baby_id TEXT NOT NULL,
        to_baby_id TEXT NOT NULL,
        points INTEGER NOT NULL,
        message TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `
    return db.execute(sql)
  },

  async insertPointGift(gift) {
    initDb()
    if (!db) return false
    const sql = `
      INSERT INTO ${TABLES.POINT_GIFTS} (id, from_baby_id, to_baby_id, points, message, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    return db.execute(sql, [
      gift.id,
      gift.from_baby_id,
      gift.to_baby_id,
      gift.points,
      gift.message,
      gift.created_at,
      gift.updated_at
    ])
  },

  async getSentGifts(fromBabyId) {
    initDb()
    if (!db) return []
    const sql = `
      SELECT * FROM ${TABLES.POINT_GIFTS}
      WHERE from_baby_id = ?
      ORDER BY created_at DESC
    `
    const result = await db.query(sql, [fromBabyId])
    return result || []
  },

  async getReceivedGifts(toBabyId) {
    initDb()
    if (!db) return []
    const sql = `
      SELECT * FROM ${TABLES.POINT_GIFTS}
      WHERE to_baby_id = ?
      ORDER BY created_at DESC
    `
    const result = await db.query(sql, [toBabyId])
    return result || []
  }
}
