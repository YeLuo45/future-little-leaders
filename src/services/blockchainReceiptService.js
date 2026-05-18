/**
 * Blockchain Receipt Service (Mock)
 * Generates blockchain-like receipts for task completion and achievements
 * This is a mock implementation for demonstration purposes
 */

import { generateTxHash, hashReceiptData } from '../utils/hashService'

const RECEIPTS_KEY = 'blockchain_receipts'
const ACHIEVEMENT_RECEIPTS_KEY = 'achievement_receipts'

/**
 * Get mock network info
 * @returns {object}
 */
function getMockNetworkInfo() {
  return {
    chainId: 'mock-chain-001',
    network: 'FutureLittleLeaders-TestNet',
    blockHeight: Math.floor(Math.random() * 1000000) + 500000,
    consensus: 'PoA-Mock'
  }
}

/**
 * Generate a mock transaction receipt
 * @param {object} data - Transaction data
 * @returns {Promise<object>}
 */
export async function generateTransactionReceipt(data) {
  const timestamp = new Date().toISOString()
  const txHash = await generateTxHash(JSON.stringify(data), timestamp)
  
  const receipt = {
    txHash,
    timestamp,
    status: 'confirmed',
    blockNumber: Math.floor(Math.random() * 1000000) + 500000,
    confirmations: Math.floor(Math.random() * 100) + 1,
    from: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
    to: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
    value: '0',
    gasUsed: '21000',
    network: getMockNetworkInfo(),
    data,
    proofUrl: `https://mock-blockchain.futurelittleleaders.com/tx/${txHash}`
  }
  
  return receipt
}

/**
 * Generate a task completion receipt
 * @param {object} task - Task data
 * @param {string} babyId - Baby ID
 * @param {object} metadata - Additional metadata
 * @returns {Promise<object>}
 */
export async function generateTaskReceipt(task, babyId, metadata = {}) {
  const receiptData = {
    type: 'TASK_COMPLETION',
    taskId: task.id,
    taskTitle: task.title,
    babyId,
    completedAt: task.completedAt || new Date().toISOString(),
    rewardPoints: task.rewardPoints || 0,
    ...metadata
  }
  
  const receipt = await generateTransactionReceipt(receiptData)
  
  // Save to local storage
  saveReceipt(receipt)
  
  return receipt
}

/**
 * Generate an achievement receipt
 * @param {object} achievement - Achievement data
 * @param {string} babyId - Baby ID
 * @returns {Promise<object>}
 */
export async function generateAchievementReceipt(achievement, babyId) {
  const receiptData = {
    type: 'ACHIEVEMENT_UNLOCK',
    achievementId: achievement.id,
    achievementName: achievement.name,
    achievementIcon: achievement.icon,
    babyId,
    unlockedAt: achievement.unlockedAt || new Date().toISOString(),
    rarity: achievement.rare || 1
  }
  
  const receipt = await generateTransactionReceipt(receiptData)
  
  // Save achievement receipt separately
  saveAchievementReceipt(receipt)
  
  return receipt
}

/**
 * Save receipt to local storage
 * @param {object} receipt 
 */
function saveReceipt(receipt) {
  try {
    const stored = uni.getStorageSync(RECEIPTS_KEY) || '[]'
    const receipts = JSON.parse(stored)
    receipts.unshift(receipt)
    // Keep only last 1000 receipts
    if (receipts.length > 1000) {
      receipts.splice(1000)
    }
    uni.setStorageSync(RECEIPTS_KEY, JSON.stringify(receipts))
  } catch (e) {
    console.error('Failed to save receipt:', e)
  }
}

/**
 * Save achievement receipt to local storage
 * @param {object} receipt 
 */
function saveAchievementReceipt(receipt) {
  try {
    const stored = uni.getStorageSync(ACHIEVEMENT_RECEIPTS_KEY) || '[]'
    const receipts = JSON.parse(stored)
    receipts.unshift(receipt)
    uni.setStorageSync(ACHIEVEMENT_RECEIPTS_KEY, JSON.stringify(receipts))
  } catch (e) {
    console.error('Failed to save achievement receipt:', e)
  }
}

/**
 * Get all task completion receipts
 * @returns {array}
 */
export function getAllReceipts() {
  try {
    const stored = uni.getStorageSync(RECEIPTS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('Failed to get receipts:', e)
    return []
  }
}

/**
 * Get all achievement receipts
 * @returns {array}
 */
export function getAchievementReceipts() {
  try {
    const stored = uni.getStorageSync(ACHIEVEMENT_RECEIPTS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('Failed to get achievement receipts:', e)
    return []
  }
}

/**
 * Get receipt by transaction hash
 * @param {string} txHash 
 * @returns {object|null}
 */
export function getReceiptByHash(txHash) {
  const receipts = getAllReceipts()
  const achievementReceipts = getAchievementReceipts()
  
  const found = receipts.find(r => r.txHash === txHash)
  if (found) return found
  
  return achievementReceipts.find(r => r.txHash === txHash) || null
}

/**
 * Verify receipt integrity
 * @param {object} receipt 
 * @returns {Promise<boolean>}
 */
export async function verifyReceipt(receipt) {
  if (!receipt || !receipt.txHash || !receipt.data) {
    return false
  }
  
  try {
    const computedHash = await generateTxHash(JSON.stringify(receipt.data), receipt.timestamp)
    return computedHash === receipt.txHash
  } catch (e) {
    console.error('Failed to verify receipt:', e)
    return false
  }
}

/**
 * Verify achievement receipt integrity
 * @param {object} receipt 
 * @returns {Promise<boolean>}
 */
export async function verifyAchievementReceipt(receipt) {
  return verifyReceipt(receipt)
}

export default {
  generateTransactionReceipt,
  generateTaskReceipt,
  generateAchievementReceipt,
  getAllReceipts,
  getAchievementReceipts,
  getReceiptByHash,
  verifyReceipt,
  verifyAchievementReceipt
}
