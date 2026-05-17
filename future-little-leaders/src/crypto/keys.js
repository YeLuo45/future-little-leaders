/**
 * V4 密钥管理 — PBKDF2 密钥派生
 * 用于 E2E 加密（可选功能）
 */

const ITERATIONS = 100000
const KEY_LENGTH = 256

/**
 * 从 PIN 派生 AES 密钥
 * @param {string} pin - 用户输入的 PIN
 * @param {Uint8Array} salt - 盐值
 * @returns {Promise<CryptoKey>}
 */
export async function deriveKey(pin, salt) {
  const encoder = new TextEncoder()
  const pinKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    pinKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,  // 非导出
    ['encrypt', 'decrypt']
  )
}

/**
 * 生成随机盐
 * @returns {Uint8Array}
 */
export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16))
}

/**
 * 导出密钥为 base64 字符串（用于 QR 码分享）
 * @param {CryptoKey} key
 * @returns {Promise<string>}
 */
export async function exportKey(key) {
  const exported = await crypto.subtle.exportKey('raw', key)
  return btoa(String.fromCharCode(...new Uint8Array(exported)))
}

/**
 * 从 base64 字符串导入密钥
 * @param {string} keyStr
 * @returns {Promise<CryptoKey>}
 */
export async function importKey(keyStr) {
  const binary = atob(keyStr)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return crypto.subtle.importKey(
    'raw',
    bytes,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * 生成家庭密钥（PIN + 盐）并导出分享字符串
 * @param {string} pin - 4-6 位数字 PIN
 * @returns {Promise<{key: CryptoKey, shareString: string}>}
 */
export async function createFamilyKey(pin) {
  const salt = generateSalt()
  const key = await deriveKey(pin, salt)
  const keyStr = await exportKey(key)
  // 分享格式: base64(salt):base64(key)
  const shareString = `${btoa(String.fromCharCode(...salt))}:${keyStr}`
  return { key, shareString }
}

/**
 * 从分享字符串恢复密钥
 * @param {string} shareString - createFamilyKey 生成的分享字符串
 * @param {string} pin - PIN（需与创建时一致）
 * @returns {Promise<CryptoKey>}
 */
export async function restoreFamilyKey(shareString, pin) {
  const [saltStr, keyStr] = shareString.split(':')
  const salt = new Uint8Array(atob(saltStr).split('').map(c => c.charCodeAt(0)))
  return deriveKey(pin, salt)
}