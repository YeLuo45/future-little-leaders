/**
 * V4 Encrypt/Decrypt Module
 * AES-256-GCM encryption for row-level data
 */

/**
 * Convert string to Uint8Array
 */
function stringToBytes(str) {
  const encoder = new TextEncoder()
  return encoder.encode(str)
}

/**
 * Convert Uint8Array to string
 */
function bytesToString(bytes) {
  const decoder = new TextDecoder()
  return decoder.decode(bytes)
}

/**
 * Convert ArrayBuffer to base64
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
 * Convert base64 to Uint8Array
 */
function base64ToBytes(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Encrypt data using AES-256-GCM
 * @param {any} data - Data to encrypt (will be JSON stringified)
 * @param {CryptoKey} key - AES-GCM key
 * @returns {Promise<string>} - Base64 encoded IV:ciphertext
 */
export async function encrypt(data, key) {
  const plaintext = JSON.stringify(data)
  const plaintextBytes = stringToBytes(plaintext)
  
  // Generate random IV (12 bytes for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintextBytes
  )
  
  // Combine IV + ciphertext and encode as base64
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), iv.length)
  
  return bufferToBase64(combined.buffer)
}

/**
 * Decrypt data using AES-256-GCM
 * @param {string} encryptedData - Base64 encoded IV:ciphertext
 * @param {CryptoKey} key - AES-GCM key
 * @returns {Promise<any>} - Decrypted object
 */
export async function decrypt(encryptedData, key) {
  const combined = base64ToBytes(encryptedData)
  
  // Extract IV (first 12 bytes) and ciphertext
  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)
  
  // Decrypt
  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )
  
  const plaintext = bytesToString(new Uint8Array(plaintextBuffer))
  return JSON.parse(plaintext)
}