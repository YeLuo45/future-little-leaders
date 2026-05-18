/**
 * Locale Formatter - V37 Multi-language Support + Cultural Localization
 * 本地化格式工具：日期、貨幣、姓名等
 */

import { getCurrentRegion } from '@/services/localeService.js'

// 日期格式映射
const DATE_FORMATS = {
  'YYYY-MM-DD': '{year}-{month}-{day}',
  'YYYY/MM/DD': '{year}/{month}/{day}',
  'DD/MM/YYYY': '{day}/{month}/{year}',
  'MM/DD/YYYY': '{month}/{day}/{year}',
  'DD.MM.YYYY': '{day}.{month}.{year}'
}

// 數字格式化
export function formatNumber(num, locale = 'zh-CN') {
  if (typeof num !== 'number') {
    num = parseFloat(num) || 0
  }
  
  const locales = {
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'zh-HK': 'zh-HK',
    'en-US': 'en-US',
    'en-EU': 'en-EU',
    'en-SEA': 'en-US'
  }
  
  const localeId = locales[locale] || 'zh-CN'
  
  try {
    return new Intl.NumberFormat(localeId).format(num)
  } catch {
    return num.toString()
  }
}

// 格式化日期
export function formatDate(date, format = null, locale = null) {
  if (!date) return ''
  
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const region = locale ? { dateFormat: getDateFormatForLocale(locale) } : getCurrentRegion()
  const dateFormat = format || DATE_FORMATS[region.dateFormat] || DATE_FORMATS['YYYY-MM-DD']
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return dateFormat
    .replace('{year}', year)
    .replace('{month}', month)
    .replace('{day}', day)
}

// 獲取日期格式
function getDateFormatForLocale(locale) {
  const formats = {
    'zh-CN': 'YYYY-MM-DD',
    'zh-TW': 'YYYY/MM/DD',
    'zh-HK': 'DD/MM/YYYY',
    'en-US': 'MM/DD/YYYY',
    'en-EU': 'DD.MM.YYYY',
    'en-SEA': 'DD/MM/YYYY'
  }
  return formats[locale] || 'YYYY-MM-DD'
}

// 解析日期字符串
export function parseDate(dateStr, format = null) {
  if (!dateStr) return null
  
  const region = getCurrentRegion()
  const dateFormat = format || DATE_FORMATS[region.dateFormat] || DATE_FORMATS['YYYY-MM-DD']
  
  // 移除分隔符
  const separators = ['-', '/', '.']
  let separator = '-'
  for (const sep of separators) {
    if (dateFormat.includes(sep)) {
      separator = sep
      break
    }
  }
  
  const parts = dateStr.split(separator).map(p => parseInt(p, 10))
  if (parts.length !== 3) return null
  
  let year, month, day
  
  if (dateFormat.startsWith('{day}')) {
    [day, month, year] = parts
  } else if (dateFormat.startsWith('{month}')) {
    [month, day, year] = parts
  } else {
    [year, month, day] = parts
  }
  
  // 处理两位数年份
  if (year < 100) {
    year += year > 50 ? 1900 : 2000
  }
  
  const date = new Date(year, month - 1, day)
  return isNaN(date.getTime()) ? null : date
}

// 格式化貨幣
export function formatCurrency(amount, currencyCode = null, locale = null) {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0
  }
  
  const region = locale ? getRegionForLocale(locale) : getCurrentRegion()
  const currency = currencyCode || region.currencyCode || 'CNY'
  
  const currencySymbols = {
    CNY: '¥',
    TWD: 'NT$',
    HKD: 'HK$',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    KRW: '₩'
  }
  
  const symbol = currencySymbols[currency] || currency
  
  // 根据地区选择格式化方式
  const locales = {
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'zh-HK': 'zh-HK',
    'en-US': 'en-US',
    'en-EU': 'de-DE',
    'en-SEA': 'en-US'
  }
  
  const localeId = locales[region.id] || 'zh-CN'
  
  try {
    // 使用 Intl.NumberFormat 进行本地化数字格式化
    const formatted = new Intl.NumberFormat(localeId, {
      minimumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2
    }).format(amount)
    
    return `${symbol}${formatted}`
  } catch {
    return `${symbol}${amount.toFixed(2)}`
  }
}

// 獲取地區物件
function getRegionForLocale(locale) {
  const regions = {
    'zh-CN': { id: 'zh-CN', currencyCode: 'CNY' },
    'zh-TW': { id: 'zh-TW', currencyCode: 'TWD' },
    'zh-HK': { id: 'zh-HK', currencyCode: 'HKD' },
    'en-US': { id: 'en-US', currencyCode: 'USD' },
    'en-EU': { id: 'en-EU', currencyCode: 'EUR' },
    'en-SEA': { id: 'en-SEA', currencyCode: 'USD' }
  }
  return regions[locale] || regions['zh-CN']
}

// 格式化姓名
export function formatName(givenName, familyName, order = null) {
  const region = getCurrentRegion()
  const nameOrder = order || region.nameOrder || 'familyFirst'
  
  if (!givenName && !familyName) return ''
  
  if (nameOrder === 'givenFirst') {
    return `${givenName || ''} ${familyName || ''}`.trim()
  } else {
    return `${familyName || ''} ${givenName || ''}`.trim()
  }
}

// 解析姓名
export function parseName(fullName, order = null) {
  if (!fullName) return { givenName: '', familyName: '' }
  
  const region = getCurrentRegion()
  const nameOrder = order || region.nameOrder || 'familyFirst'
  
  // 假設姓名由空格分隔
  const parts = fullName.trim().split(/\s+/)
  
  if (parts.length === 1) {
    return nameOrder === 'givenFirst' 
      ? { givenName: parts[0], familyName: '' }
      : { givenName: '', familyName: parts[0] }
  }
  
  if (nameOrder === 'givenFirst') {
    return {
      givenName: parts[0],
      familyName: parts.slice(1).join(' ')
    }
  } else {
    return {
      familyName: parts[0],
      givenName: parts.slice(1).join(' ')
    }
  }
}

// 格式化電話號碼
export function formatPhone(phone, regionId = null) {
  if (!phone) return ''
  
  const region = regionId ? { id: regionId } : getCurrentRegion()
  
  // 移除非數字字符
  const digits = phone.replace(/\D/g, '')
  
  if (region.id === 'zh-CN' || region.id === 'zh-TW' || region.id === 'zh-HK') {
    // 中國/台灣/香港格式
    if (digits.length === 11) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
    } else if (digits.length === 10) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`
    }
  } else if (region.id === 'en-US') {
    // 美國格式
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
  }
  
  return phone
}

// 格式化相對時間
export function formatRelativeTime(date, locale = null) {
  if (!date) return ''
  
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const now = new Date()
  const diff = now - d
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  const localeId = locale || getCurrentRegion().id || 'zh-CN'
  
  const rtf = new Intl.RelativeTimeFormat(localeId, { numeric: 'auto' })
  
  if (days > 0) {
    return rtf.format(-days, 'day')
  } else if (hours > 0) {
    return rtf.format(-hours, 'hour')
  } else if (minutes > 0) {
    return rtf.format(-minutes, 'minute')
  } else {
    return rtf.format(-seconds, 'second')
  }
}

// 獲取名稱順序
export function getNameOrder(regionId = null) {
  const region = regionId ? { id: regionId } : getCurrentRegion()
  
  // 中國/日本/韓國：姓在前
  const familyFirstLocales = ['zh-CN', 'zh-TW', 'zh-HK', 'ja', 'ko']
  
  if (familyFirstLocales.includes(region.id)) {
    return 'familyFirst'
  }
  
  return 'givenFirst'
}

// 導出工具物件
export function createLocaleFormatter() {
  return {
    formatNumber,
    formatDate,
    parseDate,
    formatCurrency,
    formatName,
    parseName,
    formatPhone,
    formatRelativeTime,
    getNameOrder,
    DATE_FORMATS
  }
}

export default {
  formatNumber,
  formatDate,
  parseDate,
  formatCurrency,
  formatName,
  parseName,
  formatPhone,
  formatRelativeTime,
  getNameOrder,
  DATE_FORMATS
}
