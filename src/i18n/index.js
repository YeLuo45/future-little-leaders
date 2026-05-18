// i18n 主入口 - 轻量级国际化方案
import { ref, computed } from 'vue'
import zhCN from './messages/zh-CN.js'
import zhTW from './messages/zh-TW.js'
import en from './messages/en.js'
import zhHK from './messages/zh-HK.js'
import ja from './messages/ja.js'
import ko from './messages/ko.js'

const messages = { 'zh-CN': zhCN, 'zh-TW': zhTW, en, 'zh-HK': zhHK, ja, ko }

// 检测系统语言
function detectSystemLocale() {
  try {
    const sys = uni.getSystemInfoSync().language || 'zh-CN'
    if (sys.startsWith('zh-HK') || sys.startsWith('zh-MO')) return 'zh-HK'
    if (sys.startsWith('zh-TW') || sys.startsWith('zh-Hant')) return 'zh-TW'
    if (sys.startsWith('en')) return 'en'
    if (sys.startsWith('ja')) return 'ja'
    if (sys.startsWith('ko')) return 'ko'
    return 'zh-CN'
  } catch { return 'zh-CN' }
}

// 加载保存的语言偏好，没有则检测系统语言
function loadLocale() {
  try {
    const saved = uni.getStorageSync('fll_locale')
    if (saved && messages[saved]) return saved
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

// 响应式翻译，配合 Vue 3 Composition API
export function useI18n() {
  const locale = computed(() => currentLocale.value)
  return { locale, t }
}

// 设置语言并持久化
export function setLocale(locale) {
  if (!messages[locale]) return false
  currentLocale.value = locale
  try {
    uni.setStorageSync('fll_locale', locale)
  } catch {}
  return true
}

// 获取支持的语言列表
export function getSupportedLocales() {
  return [
    { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
    { code: 'zh-TW', name: '繁体中文', nativeName: '繁體中文' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zh-HK', name: '粤语', nativeName: '廣東話' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' }
  ]
}

export function createLocaleI18n() {
  return { t, locale: currentLocale, setLocale, getSupportedLocales }
}
