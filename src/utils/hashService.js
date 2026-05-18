/**
 * Hash Service
 * Provides SHA-256 hashing for blockchain receipt generation
 * Uses Web Crypto API (available in uni-app)
 */

/**
 * Convert string to ArrayBuffer
 * @param {string} str 
 * @returns {Uint8Array}
 */
function stringToBytes(str) {
  return new TextEncoder().encode(str)
}

/**
 * Convert ArrayBuffer to hex string
 * @param {ArrayBuffer} buffer 
 * @returns {string}
 */
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Generate SHA-256 hash of a string
 * @param {string} content - Content to hash
 * @returns {Promise<string>} Hex-encoded hash
 */
export async function sha256(content) {
  const data = stringToBytes(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return bufferToHex(hashBuffer)
}

/**
 * Generate a mock blockchain transaction hash
 * @param {string} data - Data to include in the hash
 * @param {string} timestamp - ISO timestamp
 * @returns {Promise<string>} Mock transaction hash
 */
export async function generateTxHash(data, timestamp) {
  const content = `${data}|${timestamp}|${Math.random().toString(36)}`
  return sha256(content)
}

/**
 * Verify data integrity against a hash
 * @param {string} data - Original data
 * @param {string} expectedHash - Expected hash value
 * @returns {Promise<boolean>}
 */
export async function verifyHash(data, expectedHash) {
  const computedHash = await sha256(data)
  return computedHash === expectedHash
}

/**
 * Generate a content hash for achievement receipts
 * @param {object} receiptData - Receipt data object
 * @returns {Promise<string>}
 */
export async function hashReceiptData(receiptData) {
  const canonicalString = JSON.stringify(receiptData, Object.keys(receiptData).sort())
  return sha256(canonicalString)
}

export default {
  sha256,
  generateTxHash,
  verifyHash,
  hashReceiptData
}
