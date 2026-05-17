/**
 * V4 数据加密 — AES-256-GCM
 * 默认不启用，通过 URL param ?encrypted=1 激活
 */

const ALGORITHM = 'AES-GCM'

/**
 * 加密数据（按行加密）
 * @param {object|string} data
 * @param {CryptoKey} key
 * @returns {Promise<string>} base64(iv:ciphertext)
 */
export async function encrypt(data, key) {
  const encoder = new TextEncoder()
  const plaintext = typeof data === 'string' ? data : JSON.stringify(data)
  const iv = crypto.getRandomValues(new Uint8Array(12))  // 96-bit IV for GCM

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  )

  // 拼接 IV + ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), iv.length)

  // base64 编码
  return btoa(String.fromCharCode(...combined))
}

/**
 * 解密数据
 * @param {string} encrypted - base64(iv:ciphertext)
 * @param {CryptoKey} key
 * @param {boolean} [asObject] - 是否解析为对象
 * @returns {Promise<object|string>}
 */
export async function decrypt(encrypted, key, asObject = true) {
  const combined = new Uint8Array(
    atob(encrypted).split('').map(c => c.charCodeAt(0))
  )

  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  )

  const decoder = new TextDecoder()
  const decoded = decoder.decode(plaintext)
  if (asObject) {
    try { return JSON.parse(decoded) } catch (e) { return decoded }
  }
  return decoded
}

/**
 * 加密 SQLite 行数据
 * @param {object} row - 单条记录
 * @param {CryptoKey} key
 * @returns {Promise<object>} - { ...row, _encrypted: true }
 */
export async function encryptRow(row, key) {
  const fields = { ...row }
  // 移除技术字段
  const dataToEncrypt = { ...fields }
  delete dataToEncrypt.id
  delete dataToEncrypt.isEncrypted

  const encrypted = await encrypt(dataToEncrypt, key)
  return { ...fields, _encrypted: encrypted, isEncrypted: 1 }
}

/**
 * 解密 SQLite 行数据
 * @param {object} row - 加密行
 * @param {CryptoKey} key
 * @returns {Promise<object>}
 */
export async function decryptRow(row, key) {
  if (!row._encrypted) return row
  const decrypted = await decrypt(row._encrypted, key)
  return { ...row, ...decrypted, isEncrypted: 0 }
}