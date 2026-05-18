/**
 * Data Export Service
 * Handles data export in multiple formats (JSON, CSV, PDF-like)
 * Supports data portability and cross-platform migration
 */

import { sha256 } from '../utils/hashService'

const EXPORT_DATA_KEY = 'export_data'

/**
 * Data types that can be exported
 */
export const DATA_TYPES = {
  TASKS: 'tasks',
  ACHIEVEMENTS: 'achievements',
  POINTS: 'points',
  GROWTH_RECORDS: 'growth_records',
  FAMILY_DATA: 'family_data',
  PROFILE: 'profile'
}

/**
 * Export formats
 */
export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  PDF: 'pdf'
}

/**
 * Collect all user data for export
 * @param {object} options - Export options
 * @returns {Promise<object>}
 */
export async function collectExportData(options = {}) {
  const {
    dataTypes = Object.values(DATA_TYPES),
    babyId = null,
    startDate = null,
    endDate = null,
    format = EXPORT_FORMATS.JSON
  } = options
  
  const exportData = {
    meta: {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: 'FutureLittleLeaders',
      format,
      dataTypes,
      includes: dataTypes
    },
    data: {}
  }
  
  // Collect tasks
  if (dataTypes.includes(DATA_TYPES.TASKS)) {
    exportData.data.tasks = collectTasks(babyId, startDate, endDate)
  }
  
  // Collect achievements
  if (dataTypes.includes(DATA_TYPES.ACHIEVEMENTS)) {
    exportData.data.achievements = collectAchievements(babyId)
  }
  
  // Collect points records
  if (dataTypes.includes(DATA_TYPES.POINTS)) {
    exportData.data.points = collectPoints(babyId)
  }
  
  // Collect growth records
  if (dataTypes.includes(DATA_TYPES.GROWTH_RECORDS)) {
    exportData.data.growthRecords = collectGrowthRecords(babyId, startDate, endDate)
  }
  
  // Collect family data
  if (dataTypes.includes(DATA_TYPES.FAMILY_DATA)) {
    exportData.data.family = collectFamilyData()
  }
  
  // Collect profile data
  if (dataTypes.includes(DATA_TYPES.PROFILE)) {
    exportData.data.profile = collectProfileData(babyId)
  }
  
  // Generate content hash for integrity verification
  exportData.meta.contentHash = await sha256(JSON.stringify(exportData.data))
  
  return exportData
}

/**
 * Collect task data
 */
function collectTasks(babyId, startDate, endDate) {
  try {
    let tasks = JSON.parse(uni.getStorageSync('tasks') || '[]')
    
    if (babyId) {
      tasks = tasks.filter(t => t.babyId === babyId)
    }
    
    if (startDate) {
      const start = new Date(startDate)
      tasks = tasks.filter(t => new Date(t.createdAt) >= start)
    }
    
    if (endDate) {
      const end = new Date(endDate)
      tasks = tasks.filter(t => new Date(t.createdAt) <= end)
    }
    
    // Get task records
    const taskRecords = JSON.parse(uni.getStorageSync('task_records') || '[]')
    
    return {
      items: tasks,
      records: babyId ? taskRecords.filter(r => r.babyId === babyId) : taskRecords,
      totalCount: tasks.length
    }
  } catch (e) {
    console.error('Failed to collect tasks:', e)
    return { items: [], records: [], totalCount: 0 }
  }
}

/**
 * Collect achievement data
 */
function collectAchievements(babyId) {
  try {
    const babyAchievements = JSON.parse(uni.getStorageSync('babyAchievements') || '{}')
    const taskCountByBaby = JSON.parse(uni.getStorageSync('taskCountByBaby') || '{}')
    const streakByBaby = JSON.parse(uni.getStorageSync('streakByBaby') || '{}')
    const totalPointsByBaby = JSON.parse(uni.getStorageSync('totalPointsByBaby') || '{}')
    
    if (babyId) {
      return {
        achievements: babyAchievements[babyId] || [],
        taskCount: taskCountByBaby[babyId] || 0,
        streak: streakByBaby[babyId] || { count: 0, lastDate: null },
        totalPoints: totalPointsByBaby[babyId] || 0
      }
    }
    
    return {
      allBabyAchievements: babyAchievements,
      allTaskCounts: taskCountByBaby,
      allStreaks: streakByBaby,
      allTotalPoints: totalPointsByBaby
    }
  } catch (e) {
    console.error('Failed to collect achievements:', e)
    return { achievements: [], taskCount: 0, streak: { count: 0 }, totalPoints: 0 }
  }
}

/**
 * Collect points data
 */
function collectPoints(babyId) {
  try {
    const pointsRecords = JSON.parse(uni.getStorageSync('points_records') || '[]')
    
    return {
      records: babyId ? pointsRecords.filter(p => p.babyId === babyId) : pointsRecords,
      totalCount: pointsRecords.length
    }
  } catch (e) {
    console.error('Failed to collect points:', e)
    return { records: [], totalCount: 0 }
  }
}

/**
 * Collect growth records
 */
function collectGrowthRecords(babyId, startDate, endDate) {
  try {
    // Collect from various sources
    const taskRecords = JSON.parse(uni.getStorageSync('task_records') || '[]')
    const achievements = JSON.parse(uni.getStorageSync('babyAchievements') || '{}')
    const streaks = JSON.parse(uni.getStorageSync('streakByBaby') || '{}')
    
    let records = []
    
    // Add task completion records
    taskRecords.forEach(record => {
      if (!babyId || record.babyId === babyId) {
        if (!startDate || new Date(record.completedAt) >= new Date(startDate)) {
          if (!endDate || new Date(record.completedAt) <= new Date(endDate)) {
            records.push({
              type: 'TASK_COMPLETION',
              date: record.completedAt,
              babyId: record.babyId,
              taskTitle: record.taskTitle,
              taskId: record.taskId
            })
          }
        }
      }
    })
    
    // Add achievement unlock records
    if (babyId && achievements[babyId]) {
      achievements[babyId].forEach(ach => {
        if (ach.unlocked && ach.unlockedAt) {
          records.push({
            type: 'ACHIEVEMENT_UNLOCK',
            date: ach.unlockedAt,
            babyId,
            achievementId: ach.id
          })
        }
      })
    }
    
    // Sort by date descending
    records.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    return {
      items: records,
      totalCount: records.length
    }
  } catch (e) {
    console.error('Failed to collect growth records:', e)
    return { items: [], totalCount: 0 }
  }
}

/**
 * Collect family data
 */
function collectFamilyData() {
  try {
    const family = JSON.parse(uni.getStorageSync('family') || '{}')
    const familyMembers = JSON.parse(uni.getStorageSync('familyMembers') || '[]')
    
    return {
      family,
      members: familyMembers,
      memberCount: familyMembers.length
    }
  } catch (e) {
    console.error('Failed to collect family data:', e)
    return { family: {}, members: [], memberCount: 0 }
  }
}

/**
 * Collect profile data
 */
function collectProfileData(babyId) {
  try {
    const babies = JSON.parse(uni.getStorageSync('babies') || '[]')
    
    return {
      babies: babyId ? babies.filter(b => b.id === babyId) : babies,
      babyCount: babies.length
    }
  } catch (e) {
    console.error('Failed to collect profile data:', e)
    return { babies: [], babyCount: 0 }
  }
}

/**
 * Export data as JSON string
 * @param {object} data - Data to export
 * @returns {string}
 */
export function exportAsJSON(data) {
  return JSON.stringify(data, null, 2)
}

/**
 * Export data as CSV string
 * @param {object} data - Data to export
 * @returns {string}
 */
export function exportAsCSV(data) {
  const lines = []
  
  // Add meta info as comments
  lines.push('# Data Export from FutureLittleLeaders')
  lines.push(`# Exported at: ${data.meta.exportedAt}`)
  lines.push(`# Format version: ${data.meta.version}`)
  lines.push('')
  
  // Export tasks
  if (data.data.tasks && data.data.tasks.items) {
    lines.push('# Tasks')
    lines.push('TASK_ID,TASK_TITLE,STATUS,REWARD_POINTS,CREATED_AT,COMPLETED_AT,BABY_ID')
    
    data.data.tasks.items.forEach(task => {
      lines.push([
        task.id || '',
        `"${(task.title || '').replace(/"/g, '""')}"`,
        task.status || '',
        task.rewardPoints || 0,
        task.createdAt || '',
        task.completedAt || '',
        task.babyId || ''
      ].join(','))
    })
    lines.push('')
  }
  
  // Export achievements
  if (data.data.achievements && data.data.achievements.achievements) {
    lines.push('# Achievements')
    lines.push('ACHIEVEMENT_ID,NAME,UNLOCKED,UNLOCKED_AT,BABY_ID')
    
    data.data.achievements.achievements.forEach(ach => {
      lines.push([
        ach.id || '',
        `"${(ach.name || '').replace(/"/g, '""')}"`,
        ach.unlocked ? 'YES' : 'NO',
        ach.unlockedAt || '',
        ach.babyId || ''
      ].join(','))
    })
    lines.push('')
  }
  
  // Export growth records
  if (data.data.growthRecords && data.data.growthRecords.items) {
    lines.push('# Growth Records')
    lines.push('DATE,TYPE,DESCRIPTION,BABY_ID')
    
    data.data.growthRecords.items.forEach(record => {
      const description = record.taskTitle || record.achievementId || ''
      lines.push([
        record.date || '',
        record.type || '',
        `"${description.replace(/"/g, '""')}"`,
        record.babyId || ''
      ].join(','))
    })
  }
  
  return lines.join('\n')
}

/**
 * Export data in JSON-LD format for cross-platform portability
 * @param {object} data - Data to export
 * @returns {object}
 */
export function exportAsJSONLD(data) {
  const jsonld = {
    '@context': {
      '@vocab': 'https://schema.org/',
      fll: 'https://futurelittleleaders.com/vocab#',
      foaf: 'http://xmlns.com/foaf/0.1/'
    },
    '@type': 'Dataset',
    name: 'FutureLittleLeaders User Data Export',
    description: 'User data export from FutureLittleLeaders app',
    version: data.meta.version,
    dateCreated: data.meta.exportedAt,
    creator: {
      '@type': 'Organization',
      name: 'FutureLittleLeaders'
    },
    distribution: [
      {
        '@type': 'DataDownload',
        contentUrl: 'internal://json',
        encodingFormat: 'application/json',
        contentSize: exportAsJSON(data).length
      },
      {
        '@type': 'DataDownload',
        contentUrl: 'internal://csv',
        encodingFormat: 'text/csv',
        contentSize: exportAsCSV(data).length
      }
    ],
    includedData: []
  }
  
  // Add tasks as structured data
  if (data.data.tasks && data.data.tasks.items) {
    jsonld.includedData.push({
      '@type': 'fll:TaskCollection',
      fll: {
        taskCount: data.data.tasks.totalCount
      },
      itemListElement: data.data.tasks.items.map(task => ({
        '@type': 'fll:Task',
        identifier: task.id,
        name: task.title,
        description: task.description || '',
        fll: {
          status: task.status,
          rewardPoints: task.rewardPoints,
          completedAt: task.completedAt
        }
      }))
    })
  }
  
  // Add achievements as structured data
  if (data.data.achievements && data.data.achievements.achievements) {
    jsonld.includedData.push({
      '@type': 'fll:AchievementCollection',
      fll: {
        achievementCount: data.data.achievements.achievements.filter(a => a.unlocked).length
      },
      itemListElement: data.data.achievements.achievements.map(ach => ({
        '@type': 'fll:Achievement',
        identifier: ach.id,
        name: ach.name,
        description: ach.description || '',
        fll: {
          unlocked: ach.unlocked,
          unlockedAt: ach.unlockedAt,
          rarity: ach.rare
        }
      }))
    })
  }
  
  // Add profile as structured data
  if (data.data.profile && data.data.profile.babies) {
    jsonld.includedData.push({
      '@type': 'fll:BabyCollection',
      itemListElement: data.data.profile.babies.map(baby => ({
        '@type': 'fll:Baby',
        identifier: baby.id,
        name: baby.name,
        fll: {
          gender: baby.gender,
          birthdate: baby.birthdate
        }
      }))
    })
  }
  
  return jsonld
}

/**
 * Download data as file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType = 'application/json') {
  // Convert content to base64 for uni-app file download
  const base64 = uni.arrayBufferToBase64 ? 
    (typeof content === 'string' ? 
      uni.base64ToArrayBuffer(btoa(unescape(encodeURIComponent(content)))) : content) :
    content
  
  const savedFile = uni.saveFile ? 
    new Promise((resolve, reject) => {
      const filePath = `${wx.env.USER_DATA_PATH}/${filename}`
      const fs = wx.getFileSystemManager()
      fs.writeFile({
        filePath,
        data: content,
        encoding: 'utf8',
        success: () => resolve(filePath),
        fail: reject
      })
    }) : Promise.resolve(null)
  
  return savedFile
}

/**
 * Generate export filename
 * @param {string} format - Export format
 * @returns {string}
 */
export function generateExportFilename(format) {
  const date = new Date().toISOString().split('T')[0]
  const timestamp = Date.now()
  return `fll_export_${date}_${timestamp}.${format}`
}

export default {
  DATA_TYPES,
  EXPORT_FORMATS,
  collectExportData,
  exportAsJSON,
  exportAsCSV,
  exportAsJSONLD,
  downloadFile,
  generateExportFilename
}
