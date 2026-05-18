// i18n 主入口 - V37 Multi-language Support + Cultural Localization
import { ref, computed } from 'vue'
import zhCN from './messages/zh-CN.js'
import zhTW from './messages/zh-TW.js'
import zhHK from './messages/zh-HK.js'
import enUS from './messages/en-US.js'
import en from './messages/en.js'
import ja from './messages/ja.js'
import ko from './messages/ko.js'

const messages = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'zh-HK': zhHK,
  'en-US': enUS,
  'en': en,
  'ja': ja,
  'ko': ko
}

// 映射簡化的 locale 到完整 locale
const LOCALE_MAP = {
  'zh': 'zh-CN',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
  'en': 'en-US',
  'ja': 'ja',
  'ko': 'ko'
}

// 檢測系統語言
function detectSystemLocale() {
  try {
    const sys = uni.getSystemInfoSync().language || 'zh-CN'
    if (sys.startsWith('zh-HK') || sys.startsWith('zh-MO')) return 'zh-HK'
    if (sys.startsWith('zh-TW') || sys.startsWith('zh-Hant')) return 'zh-TW'
    if (sys.startsWith('en')) return 'en-US'
    if (sys.startsWith('ja')) return 'ja'
    if (sys.startsWith('ko')) return 'ko'
    return 'zh-CN'
  } catch { return 'zh-CN' }
}

// 解析 locale，支援簡化版本
function resolveLocale(locale) {
  if (!locale) return 'zh-CN'
  if (messages[locale]) return locale
  return LOCALE_MAP[locale] || 'zh-CN'
}

// 載入保存的語言偏好，沒有則檢測系統語言
function loadLocale() {
  try {
    const saved = uni.getStorageSync('fll_locale')
    const resolved = resolveLocale(saved)
    if (resolved && messages[resolved]) return resolved
  } catch {}
  return detectSystemLocale()
}

const currentLocale = ref(loadLocale())

export function t(key) {
  const msg = messages[currentLocale.value]
  if (!msg) return key
  const keys = key.split('.')
  let value = msg
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key
    }
  }
  return typeof value === 'string' ? value : key
}

// 響應式翻譯，配合 Vue 3 Composition API
export function useI18n() {
  const locale = computed(() => currentLocale.value)
  return { locale, t }
}

// 設置語言並持久化
export function setLocale(locale) {
  const resolved = resolveLocale(locale)
  if (!messages[resolved]) return false
  currentLocale.value = resolved
  try {
    uni.setStorageSync('fll_locale', resolved)
  } catch {}
  return true
}

// 獲取支援的語言列表
export function getSupportedLocales() {
  return [
    { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
    { code: 'zh-TW', name: '繁体中文', nativeName: '繁體中文' },
    { code: 'zh-HK', name: '粤语', nativeName: '廣東話' },
    { code: 'en-US', name: 'English (US)', nativeName: 'English (US)' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' }
  ]
}

// 獲取翻譯消息物件
export function getMessages() {
  return messages
}

// V37: 獲取區域名稱
export function getLocaleRegionName(locale) {
  const regionNames = {
    'zh-CN': '中国大陆',
    'zh-TW': '台灣',
    'zh-HK': '香港',
    'en-US': 'United States',
    'en-EU': 'Europe',
    'en-SEA': 'Southeast Asia',
    'en': 'English',
    'ja': '日本',
    'ko': '한국'
  }
  return regionNames[locale] || ''
}

export function createLocaleI18n() {
  return {
    t,
    locale: currentLocale,
    setLocale,
    getSupportedLocales,
    getMessages,
    getLocaleRegionName
  }
}
