/**
 * V4 Encryption Module
 * Uses AES-256-GCM for row-level encryption
 */

import { encrypt, decrypt } from './encrypt.js'

// Encryption state
let currentKey = null
let encryptionEnabled = false

/**
 * Enable encryption with a key
 * @param {CryptoKey} key
 */
export function setEncryptionKey(key) {
  currentKey = key
  encryptionEnabled = true
  console.log('[V4] Encryption enabled')
}

/**
 * Disable encryption
 */
export function clearEncryptionKey() {
  currentKey = null
  encryptionEnabled = false
  console.log('[V4] Encryption disabled')
}

/**
 * Check if encryption is active
 */
export function isEncryptionActive() {
  return encryptionEnabled && currentKey !== null
}

/**
 * Encrypt data if encryption is active
 * @param {any} data - Data to encrypt (will be JSON stringified)
 * @returns {string} - Encrypted base64 string or original stringified data
 */
export async function encryptIfActive(data) {
  if (!isEncryptionActive()) {
    return JSON.stringify(data)
  }
  
  return encrypt(data, currentKey)
}

/**
 * Decrypt data if encryption is active
 * @param {string} data - Encrypted base64 string
 * @returns {any} - Decrypted object or null if not encrypted
 */
export async function decryptIfActive(data) {
  if (!isEncryptionActive()) {
    try {
      return JSON.parse(data)
    } catch {
      return data
    }
  }
  
  return decrypt(data, currentKey)
}

/**
 * Enable encryption mode based on URL param
 * @returns {boolean} - Whether encryption was enabled
 */
export function checkUrlEncryptionParam() {
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('encrypted') === '1') {
      // Encryption is requested but needs a key to be set
      // The key should be set via importKey or derived from PIN
      console.log('[V4] Encryption requested via URL param')
      return true
    }
  } catch (e) {
    // URL not available (e.g., mini-program)
  }
  return false
}