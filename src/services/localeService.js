/**
 * Locale Service - V37 Multi-language Support + Cultural Localization
 * 地區選擇、文化節日主題、課程大綱對齊服務
 */

// 地區定義
export const REGIONS = {
  'zh-CN': {
    id: 'zh-CN',
    name: '中国大陆',
    nameEn: 'China (Mainland)',
    currency: '¥',
    currencyCode: 'CNY',
    dateFormat: 'YYYY-MM-DD',
    curriculum: 'chinaRjb'
  },
  'zh-TW': {
    id: 'zh-TW',
    name: '台灣',
    nameEn: 'Taiwan',
    currency: 'NT$',
    currencyCode: 'TWD',
    dateFormat: 'YYYY/MM/DD',
    curriculum: 'chinaRjb'
  },
  'zh-HK': {
    id: 'zh-HK',
    name: '香港',
    nameEn: 'Hong Kong',
    currency: 'HK$',
    currencyCode: 'HKD',
    dateFormat: 'DD/MM/YYYY',
    curriculum: 'chinaRjb'
  },
  'en-US': {
    id: 'en-US',
    name: 'United States',
    nameEn: 'United States',
    currency: '$',
    currencyCode: 'USD',
    dateFormat: 'MM/DD/YYYY',
    curriculum: 'usCcss'
  },
  'en-EU': {
    id: 'en-EU',
    name: 'Europe',
    nameEn: 'Europe',
    currency: '€',
    currencyCode: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    curriculum: 'ukNational'
  },
  'en-SEA': {
    id: 'en-SEA',
    name: 'Southeast Asia',
    nameEn: 'Southeast Asia',
    currency: '$',
    currencyCode: 'USD',
    dateFormat: 'DD/MM/YYYY',
    curriculum: 'usCcss'
  }
}

// 課程大綱定義
export const CURRICULUMS = {
  chinaRjb: {
    id: 'chinaRjb',
    name: "人教版",
    nameEn: "People's Education Edition",
    country: 'china',
    grades: ['一年級', '二年級', '三年級', '四年級', '五年級', '六年級']
  },
  chinaSjk: {
    id: 'chinaSjk',
    name: '蘇教版',
    nameEn: 'Suzhou Education Edition',
    country: 'china',
    grades: ['一年級', '二年級', '三年級', '四年級', '五年級', '六年級']
  },
  usCcss: {
    id: 'usCcss',
    name: 'CCSS',
    nameEn: 'Common Core State Standards',
    country: 'usa',
    grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6']
  },
  ukNational: {
    id: 'ukNational',
    name: 'National Curriculum',
    nameEn: 'UK National Curriculum',
    country: 'uk',
    grades: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6']
  }
}

// 文化節日定義
export const FESTIVALS = {
  // 中國節日
  springFestival: {
    id: 'springFestival',
    name: '春節',
    nameEn: 'Spring Festival',
    type: 'chinese',
    dateRule: 'lunar',
    month: 1,
    day: 1,
    theme: 'red'
  },
  lanternFestival: {
    id: 'lanternFestival',
    name: '元宵節',
    nameEn: 'Lantern Festival',
    type: 'chinese',
    dateRule: 'lunar',
    month: 1,
    day: 15,
    theme: 'yellow'
  },
  midAutumn: {
    id: 'midAutumn',
    name: '中秋節',
    nameEn: 'Mid-Autumn Festival',
    type: 'chinese',
    dateRule: 'lunar',
    month: 8,
    day: 15,
    theme: 'purple'
  },
  dragonBoat: {
    id: 'dragonBoat',
    name: '端午節',
    nameEn: 'Dragon Boat Festival',
    type: 'chinese',
    dateRule: 'lunar',
    month: 5,
    day: 5,
    theme: 'green'
  },
  qingming: {
    id: 'qingming',
    name: '清明節',
    nameEn: 'Qingming Festival',
    type: 'chinese',
    dateRule: 'solar',
    month: 4,
    day: 5,
    theme: 'green'
  },
  // 西方節日
  christmas: {
    id: 'christmas',
    name: '聖誕節',
    nameEn: 'Christmas',
    type: 'western',
    dateRule: 'solar',
    month: 12,
    day: 25,
    theme: 'red'
  },
  thanksgiving: {
    id: 'thanksgiving',
    name: '感恩節',
    nameEn: 'Thanksgiving',
    type: 'western',
    dateRule: 'us',
    month: 11,
    day: 4, // 第四個星期四
    theme: 'orange'
  },
  halloween: {
    id: 'halloween',
    name: '萬聖節',
    nameEn: 'Halloween',
    type: 'western',
    dateRule: 'solar',
    month: 10,
    day: 31,
    theme: 'orange'
  },
  easter: {
    id: 'easter',
    name: '復活節',
    nameEn: 'Easter',
    type: 'western',
    dateRule: 'easter',
    month: 0, // 計算得出
    day: 0,
    theme: 'yellow'
  },
  valentine: {
    id: 'valentine',
    name: '情人節',
    nameEn: "Valentine's Day",
    type: 'western',
    dateRule: 'solar',
    month: 2,
    day: 14,
    theme: 'pink'
  }
}

// 狀態管理
let currentRegion = 'zh-CN'
let currentCurriculum = 'chinaRjb'
let currentFestivalTheme = null

// 初始化
function init() {
  try {
    const savedRegion = uni.getStorageSync('fll_region')
    if (savedRegion && REGIONS[savedRegion]) {
      currentRegion = savedRegion
      currentCurriculum = REGIONS[savedRegion].curriculum
    }
    
    const savedCurriculum = uni.getStorageSync('fll_curriculum')
    if (savedCurriculum && CURRICULUMS[savedCurriculum]) {
      currentCurriculum = savedCurriculum
    }
    
    const savedFestival = uni.getStorageSync('fll_festival_theme')
    if (savedFestival) {
      currentFestivalTheme = savedFestival
    }
  } catch (e) {
    console.error('初始化地區設置失敗:', e)
  }
}

// 獲取當前地區
export function getCurrentRegion() {
  return REGIONS[currentRegion] || REGIONS['zh-CN']
}

// 設置地區
export function setRegion(regionId) {
  if (!REGIONS[regionId]) {
    console.warn(`地區 ${regionId} 不存在`)
    return false
  }
  
  currentRegion = regionId
  currentCurriculum = REGIONS[regionId].curriculum
  
  try {
    uni.setStorageSync('fll_region', regionId)
    uni.setStorageSync('fll_curriculum', currentCurriculum)
  } catch (e) {
    console.error('保存地區設置失敗:', e)
  }
  
  console.log(`地區已設置為: ${REGIONS[regionId].name}`)
  return true
}

// 獲取支援的地區列表
export function getSupportedRegions() {
  return Object.values(REGIONS)
}

// 獲取當前課程大綱
export function getCurrentCurriculum() {
  return CURRICULUMS[currentCurriculum] || CURRICULUMS.chinaRjb
}

// 設置課程大綱
export function setCurriculum(curriculumId) {
  if (!CURRICULUMS[curriculumId]) {
    console.warn(`課程大綱 ${curriculumId} 不存在`)
    return false
  }
  
  currentCurriculum = curriculumId
  
  try {
    uni.setStorageSync('fll_curriculum', curriculumId)
  } catch (e) {
    console.error('保存課程大綱設置失敗:', e)
  }
  
  console.log(`課程大綱已設置為: ${CURRICULUMS[curriculumId].name}`)
  return true
}

// 獲取支援的課程大綱列表
export function getSupportedCurriculums() {
  return Object.values(CURRICULUMS)
}

// 根據地區獲取預設課程大綱
export function getCurriculumByRegion(regionId) {
  const region = REGIONS[regionId]
  if (!region) return CURRICULUMS.chinaRjb
  return CURRICULUMS[region.curriculum] || CURRICULUMS.chinaRjb
}

// 獲取當前節日主題
export function getCurrentFestivalTheme() {
  return currentFestivalTheme
}

// 設置節日主題
export function setFestivalTheme(festivalId) {
  if (!FESTIVALS[festivalId]) {
    console.warn(`節日 ${festivalId} 不存在`)
    return false
  }
  
  currentFestivalTheme = festivalId
  
  try {
    uni.setStorageSync('fll_festival_theme', festivalId)
  } catch (e) {
    console.error('保存節日主題設置失敗:', e)
  }
  
  console.log(`節日主題已設置為: ${FESTIVALS[festivalId].name}`)
  return true
}

// 清除節日主題
export function clearFestivalTheme() {
  currentFestivalTheme = null
  try {
    uni.removeStorageSync('fll_festival_theme')
  } catch (e) {
    console.error('清除節日主題設置失敗:', e)
  }
}

// 獲取支援的節日列表
export function getSupportedFestivals() {
  return Object.values(FESTIVALS)
}

// 根據類型獲取節日
export function getFestivalsByType(type) {
  return Object.values(FESTIVALS).filter(f => f.type === type)
}

// 檢查當前是否有節日主題
export function hasFestivalTheme() {
  return currentFestivalTheme !== null
}

// 獲取節日主題變數
export function getFestivalThemeVariables(festivalId) {
  const festival = FESTIVALS[festivalId]
  if (!festival) return null
  
  const themeColors = {
    red: {
      '--primary-color': '#e53935',
      '--primary-light': '#ff6659',
      '--primary-dark': '#ab000d',
      '--primary-shadow': 'rgba(229, 57, 53, 0.3)',
      '--accent-color': '#ffeb3b'
    },
    yellow: {
      '--primary-color': '#fdd835',
      '--primary-light': '#ffff6b',
      '--primary-dark': '#c6a700',
      '--primary-shadow': 'rgba(253, 216, 53, 0.3)',
      '--accent-color': '#ff5722'
    },
    purple: {
      '--primary-color': '#8e24aa',
      '--primary-light': '#c158dc',
      '--primary-dark': '#5c007a',
      '--primary-shadow': 'rgba(142, 36, 170, 0.3)',
      '--accent-color': '#ffffff'
    },
    green: {
      '--primary-color': '#43a047',
      '--primary-light': '#76d275',
      '--primary-dark': '#00701a',
      '--primary-shadow': 'rgba(67, 160, 71, 0.3)',
      '--accent-color': '#ffffff'
    },
    orange: {
      '--primary-color': '#ff9800',
      '--primary-light': '#ffc947',
      '--primary-dark': '#c66900',
      '--primary-shadow': 'rgba(255, 152, 0, 0.3)',
      '--accent-color': '#4a3aff'
    },
    pink: {
      '--primary-color': '#ec407a',
      '--primary-light': '#f48fb1',
      '--primary-dark': '#b4004e',
      '--primary-shadow': 'rgba(236, 64, 122, 0.3)',
      '--accent-color': '#ffffff'
    }
  }
  
  return themeColors[festival.theme] || themeColors.red
}

// 自動檢測當前節日
export function detectCurrentFestival() {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  
  for (const festival of Object.values(FESTIVALS)) {
    if (festival.month === month && festival.day === day) {
      return festival
    }
  }
  
  return null
}

// 創建服務
export function createLocaleService() {
  return {
    // 地區
    getCurrentRegion,
    setRegion,
    getSupportedRegions,
    
    // 課程大綱
    getCurrentCurriculum,
    setCurriculum,
    getSupportedCurriculums,
    getCurriculumByRegion,
    
    // 節日主題
    getCurrentFestivalTheme,
    setFestivalTheme,
    clearFestivalTheme,
    getSupportedFestivals,
    getFestivalsByType,
    hasFestivalTheme,
    getFestivalThemeVariables,
    detectCurrentFestival,
    
    // 常量
    REGIONS,
    CURRICULUMS,
    FESTIVALS,
    
    // 初始化
    init
  }
}

// 自動初始化
init()

export default {
  getCurrentRegion,
  setRegion,
  getSupportedRegions,
  getCurrentCurriculum,
  setCurriculum,
  getSupportedCurriculums,
  getCurriculumByRegion,
  getCurrentFestivalTheme,
  setFestivalTheme,
  clearFestivalTheme,
  getSupportedFestivals,
  getFestivalsByType,
  hasFestivalTheme,
  getFestivalThemeVariables,
  detectCurrentFestival,
  REGIONS,
  CURRICULUMS,
  FESTIVALS,
  init
}
