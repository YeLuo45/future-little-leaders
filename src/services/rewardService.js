/**
 * V12 积分商城兑换服务
 * 处理虚拟商品兑换业务逻辑
 */

import { getDatabase, insert, query } from '@/db/sqlite.js'
import { TABLES } from '@/db/schema.js'
import { usePointsStore } from '@/stores/pointsStore.js'
import { useRewardStore } from '@/stores/rewardStore.js'

/**
 * 扣除积分并写入兑换记录
 * 使用 SQLite transaction 保证原子性
 *
 * @param {string} babyId - 宝宝ID
 * @param {string} rewardItemId - 商品ID
 * @returns {Promise<{success: boolean, message: string, record?: object}>}
 */
export async function exchangeReward(babyId, rewardItemId) {
  // 参数校验
  if (!babyId || !rewardItemId) {
    return {
      success: false,
      message: '参数错误'
    }
  }

  // 获取商品信息
  const rewardStore = useRewardStore()
  const rewardItem = rewardStore.getItemById(rewardItemId)

  if (!rewardItem) {
    return {
      success: false,
      message: '商品不存在'
    }
  }

  if (!rewardItem.active || rewardItem.active === 0) {
    return {
      success: false,
      message: '商品已下架'
    }
  }

  // 检查积分是否足够
  const pointsStore = usePointsStore()
  const currentPoints = pointsStore.getBabyPoints(babyId)
  const cost = parseInt(rewardItem.pointsCost)

  if (currentPoints < cost) {
    return {
      success: false,
      message: `积分不足，需要 ${cost} 积分，当前 ${currentPoints} 积分`
    }
  }

  // 检查库存（-1 表示无限）
  if (rewardItem.stock !== -1 && parseInt(rewardItem.stock) <= 0) {
    return {
      success: false,
      message: '商品已售罄'
    }
  }

  try {
    const db = getDatabase()
    if (!db) {
      // 降级：使用内存操作
      return await exchangeRewardFallback(babyId, rewardItem, pointsStore)
    }

    // 开始事务
    db.run('BEGIN TRANSACTION')

    try {
      const now = new Date().toISOString()
      const recordId = `exchange_${Date.now()}_${babyId}`

      // 1. 扣除积分 - 使用 expense 类型
      const pointsDeducted = pointsStore.deductBabyPoints(
        babyId,
        cost,
        `兑换${rewardItem.name}`
      )

      if (!pointsDeducted) {
        db.run('ROLLBACK')
        return {
          success: false,
          message: '积分扣除失败'
        }
      }

      // 2. 写入兑换记录
      const exchangeRecord = {
        id: recordId,
        babyId,
        rewardItemId: rewardItem.id,
        rewardItemName: rewardItem.name,
        rewardItemIcon: rewardItem.icon,
        pointsCost: cost,
        status: 'completed',
        exchangedAt: now,
        createdAt: now,
        updatedAt: now
      }

      const columns = Object.keys(exchangeRecord).join(', ')
      const placeholders = Object.keys(exchangeRecord).map(() => '?').join(', ')
      const values = Object.values(exchangeRecord)

      db.run(
        `INSERT INTO ${TABLES.EXCHANGE_RECORDS} (${columns}) VALUES (${placeholders})`,
        values
      )

      // 3. 提交事务
      db.run('COMMIT')

      // 保存数据库
      const { saveDatabase } = await import('@/db/sqlite.js')
      saveDatabase()

      console.log(`[V12] ${babyId} 兑换 ${rewardItem.name} 成功，消耗 ${cost} 积分`)

      return {
        success: true,
        message: '兑换成功',
        record: exchangeRecord
      }
    } catch (e) {
      db.run('ROLLBACK')
      throw e
    }
  } catch (e) {
    console.error('[V12] 兑换失败:', e)
    return {
      success: false,
      message: '兑换失败，请重试'
    }
  }
}

/**
 * 降级兑换逻辑（当数据库不可用时）
 */
async function exchangeRewardFallback(babyId, rewardItem, pointsStore) {
  try {
    const now = new Date().toISOString()
    const recordId = `exchange_${Date.now()}_${babyId}`
    const cost = parseInt(rewardItem.pointsCost)

    // 扣除积分
    const pointsDeducted = pointsStore.deductBabyPoints(
      babyId,
      cost,
      `兑换${rewardItem.name}`
    )

    if (!pointsDeducted) {
      return {
        success: false,
        message: '积分扣除失败'
      }
    }

    // 添加兑换记录到内存
    const exchangeRecord = {
      id: recordId,
      babyId,
      rewardItemId: rewardItem.id,
      rewardItemName: rewardItem.name,
      rewardItemIcon: rewardItem.icon,
      pointsCost: cost,
      status: 'completed',
      exchangedAt: now,
      createdAt: now,
      updatedAt: now
    }

    // 尝试写入数据库（如果可用）
    try {
      const db = getDatabase()
      if (db) {
        const columns = Object.keys(exchangeRecord).join(', ')
        const placeholders = Object.keys(exchangeRecord).map(() => '?').join(', ')
        const values = Object.values(exchangeRecord)
        db.run(
          `INSERT INTO ${TABLES.EXCHANGE_RECORDS} (${columns}) VALUES (${placeholders})`,
          values
        )
        const { saveDatabase } = await import('@/db/sqlite.js')
        saveDatabase()
      }
    } catch (dbErr) {
      console.warn('[V12] 兑换记录未写入数据库（内存保留）:', dbErr)
    }

    return {
      success: true,
      message: '兑换成功',
      record: exchangeRecord
    }
  } catch (e) {
    console.error('[V12] 降级兑换失败:', e)
    return {
      success: false,
      message: '兑换失败，请重试'
    }
  }
}

/**
 * 获取宝宝的兑换记录
 * @param {string} babyId - 宝宝ID
 * @returns {array} 兑换记录列表（按时间倒序）
 */
export function getExchangeRecords(babyId) {
  if (!babyId) return []

  try {
    const records = query(TABLES.EXCHANGE_RECORDS, {
      where: { babyId },
      orderBy: 'exchangedAt DESC'
    })
    return records
  } catch (e) {
    console.error('[V12] 获取兑换记录失败:', e)
    return []
  }
}

/**
 * 获取所有兑换记录（管理员用）
 * @param {number} limit - 限制返回数量
 * @param {number} offset - 偏移量
 * @returns {array} 兑换记录列表
 */
export function getAllExchangeRecords(limit = 50, offset = 0) {
  try {
    const records = query(TABLES.EXCHANGE_RECORDS, {
      orderBy: 'exchangedAt DESC',
      limit,
      offset
    })
    return records
  } catch (e) {
    console.error('[V12] 获取所有兑换记录失败:', e)
    return []
  }
}

/**
 * 检查宝宝是否已兑换过某个商品
 * @param {string} babyId - 宝宝ID
 * @param {string} rewardItemId - 商品ID
 * @returns {boolean}
 */
export function hasExchanged(babyId, rewardItemId) {
  if (!babyId || !rewardItemId) return false

  try {
    const records = query(TABLES.EXCHANGE_RECORDS, {
      where: { babyId, rewardItemId }
    })
    return records.length > 0
  } catch (e) {
    console.error('[V12] 检查兑换状态失败:', e)
    return false
  }
}

export default {
  exchangeReward,
  getExchangeRecords,
  getAllExchangeRecords,
  hasExchanged
}
