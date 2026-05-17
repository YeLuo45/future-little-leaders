/**
 * V4 Key Management Module
 * Uses Web Crypto API for PBKDF2 key derivation
 */

const ITERATIONS = 100000
const KEY_LENGTH = 256
const SALT_LENGTH = 16

/**
 * Generate a random salt
 * @returns {Uint8Array}
 */
export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
}

/**
 * Convert ArrayBuffer to base64 string
 */
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToBuffer(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Derive a key from PIN using PBKDF2
 * @param {string} pin - User PIN
 * @param {Uint8Array|string} salt - Salt (generated or imported)
 * @returns {Promise<CryptoKey>}
 */
export async function deriveKey(pin, salt) {
  const encoder = new TextEncoder()
  const pinBuffer = encoder.encode(pin)
  
  // Import PIN as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    pinBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )
  
  // Convert salt if string
  const saltBuffer = typeof salt === 'string' ? base64ToBuffer(salt) : salt
  
  // Derive AES-GCM key
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    true, // extractable
    ['encrypt', 'decrypt']
  )
  
  return key
}

/**
 * Export key to base64 string (for QR code)
 * @param {CryptoKey} key
 * @returns {string} Base64 encoded key data
 */
export async function exportKey(key) {
  const exported = await crypto.subtle.exportKey('raw', key)
  return bufferToBase64(exported)
}

/**
 * Import key from base64 string
 * @param {string} keyData - Base64 encoded key
 * @returns {Promise<CryptoKey>}
 */
export async function importKey(keyData) {
  const keyBuffer = base64ToBuffer(keyData)
  return crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM', length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * Generate a new random key (for initial setup)
 * @returns {Promise<{key: CryptoKey, salt: string, keyData: string}>}
 */
export async function generateKey() {
  const salt = generateSalt()
  const key = await deriveKey('', salt) // Empty PIN for generated key
  
  // The key is derived from empty PIN with random salt
  // This is essentially a random key stored securely
  
  const keyData = await exportKey(key)
  const saltBase64 = bufferToBase64(salt)
  
  return {
    key,
    salt: saltBase64,
    keyData
  }
}

/**
 * Check if encryption is available
 */
export function isEncryptionAvailable() {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.getRandomValues === 'function'
}