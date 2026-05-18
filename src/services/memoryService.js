/**
 * V54 Family Memory Archive Service
 * 家庭回忆档案服务层
 */

// Storage Keys
const PHOTOS_KEY = 'memory_photos'
const ALBUMS_KEY = 'memory_albums'
const MILESTONES_KEY = 'memory_milestones'
const CHRONICLES_KEY = 'memory_chronicles'

// ========== 照片时间线服务 ==========

export const getPhotos = () => {
  try {
    const stored = uni.getStorageSync(PHOTOS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取照片失败:', e)
    return []
  }
}

export const savePhotos = (photos) => {
  uni.setStorageSync(PHOTOS_KEY, JSON.stringify(photos))
}

export const addPhoto = (photo) => {
  const photos = getPhotos()
  const newPhoto = {
    id: 'photo_' + Date.now(),
    ...photo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  photos.unshift(newPhoto)
  savePhotos(photos)
  return newPhoto
}

export const updatePhoto = (photoId, updates) => {
  const photos = getPhotos()
  const index = photos.findIndex(p => p.id === photoId)
  if (index !== -1) {
    photos[index] = {
      ...photos[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    savePhotos(photos)
    return photos[index]
  }
  return null
}

export const deletePhoto = (photoId) => {
  const photos = getPhotos()
  const index = photos.findIndex(p => p.id === photoId)
  if (index !== -1) {
    photos.splice(index, 1)
    savePhotos(photos)
    return true
  }
  return false
}

export const getPhotosByAlbum = (albumId) => {
  const photos = getPhotos()
  return photos.filter(p => p.albumId === albumId)
}

export const getPhotosByDateRange = (startDate, endDate) => {
  const photos = getPhotos()
  return photos.filter(p => {
    const photoDate = new Date(p.createdAt)
    return photoDate >= new Date(startDate) && photoDate <= new Date(endDate)
  })
}

// ========== 相册服务 ==========

export const getAlbums = () => {
  try {
    const stored = uni.getStorageSync(ALBUMS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取相册失败:', e)
    return []
  }
}

export const saveAlbums = (albums) => {
  uni.setStorageSync(ALBUMS_KEY, JSON.stringify(albums))
}

export const createAlbum = (album) => {
  const albums = getAlbums()
  const newAlbum = {
    id: 'album_' + Date.now(),
    ...album,
    photoCount: 0,
    coverPhoto: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  albums.unshift(newAlbum)
  saveAlbums(albums)
  return newAlbum
}

export const updateAlbum = (albumId, updates) => {
  const albums = getAlbums()
  const index = albums.findIndex(a => a.id === albumId)
  if (index !== -1) {
    albums[index] = {
      ...albums[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    saveAlbums(albums)
    return albums[index]
  }
  return null
}

export const deleteAlbum = (albumId) => {
  const albums = getAlbums()
  const index = albums.findIndex(a => a.id === albumId)
  if (index !== -1) {
    albums.splice(index, 1)
    saveAlbums(albums)
    return true
  }
  return false
}

// ========== 成长里程碑服务 ==========

export const getMilestones = () => {
  try {
    const stored = uni.getStorageSync(MILESTONES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取里程碑失败:', e)
    return []
  }
}

export const saveMilestones = (milestones) => {
  uni.setStorageSync(MILESTONES_KEY, JSON.stringify(milestones))
}

export const addMilestone = (milestone) => {
  const milestones = getMilestones()
  const newMilestone = {
    id: 'milestone_' + Date.now(),
    ...milestone,
    status: 'achieved',
    achievedAt: milestone.achievedAt || new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
  milestones.unshift(newMilestone)
  saveMilestones(milestones)
  return newMilestone
}

export const updateMilestone = (milestoneId, updates) => {
  const milestones = getMilestones()
  const index = milestones.findIndex(m => m.id === milestoneId)
  if (index !== -1) {
    milestones[index] = {
      ...milestones[index],
      ...updates
    }
    saveMilestones(milestones)
    return milestones[index]
  }
  return null
}

export const deleteMilestone = (milestoneId) => {
  const milestones = getMilestones()
  const index = milestones.findIndex(m => m.id === milestoneId)
  if (index !== -1) {
    milestones.splice(index, 1)
    saveMilestones(milestones)
    return true
  }
  return false
}

export const getMilestonesByChild = (childId) => {
  const milestones = getMilestones()
  return milestones.filter(m => m.childId === childId)
}

export const getUpcomingMilestones = () => {
  const milestones = getMilestones()
  const now = new Date()
  return milestones
    .filter(m => m.status === 'planned' && new Date(m.plannedDate) > now)
    .sort((a, b) => new Date(a.plannedDate) - new Date(b.plannedDate))
}

// ========== 家庭大事记服务 ==========

export const getChronicles = () => {
  try {
    const stored = uni.getStorageSync(CHRONICLES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取大事记失败:', e)
    return []
  }
}

export const saveChronicles = (chronicles) => {
  uni.setStorageSync(CHRONICLES_KEY, JSON.stringify(chronicles))
}

export const addChronicle = (chronicle) => {
  const chronicles = getChronicles()
  const newChronicle = {
    id: 'chronicle_' + Date.now(),
    ...chronicle,
    createdAt: new Date().toISOString()
  }
  chronicles.unshift(newChronicle)
  saveChronicles(chronicles)
  return newChronicle
}

export const updateChronicle = (chronicleId, updates) => {
  const chronicles = getChronicles()
  const index = chronicles.findIndex(c => c.id === chronicleId)
  if (index !== -1) {
    chronicles[index] = {
      ...chronicles[index],
      ...updates
    }
    saveChronicles(chronicles)
    return chronicles[index]
  }
  return null
}

export const deleteChronicle = (chronicleId) => {
  const chronicles = getChronicles()
  const index = chronicles.findIndex(c => c.id === chronicleId)
  if (index !== -1) {
    chronicles.splice(index, 1)
    saveChronicles(chronicles)
    return true
  }
  return false
}

export const getChroniclesByYear = (year) => {
  const chronicles = getChronicles()
  return chronicles.filter(c => {
    const chronicleYear = new Date(c.eventDate).getFullYear()
    return chronicleYear === year
  })
}

export const getChroniclesByCategory = (category) => {
  const chronicles = getChronicles()
  return chronicles.filter(c => c.category === category)
}

// ========== 导出分享 ==========

export const exportChronicleAsText = (chronicle) => {
  const date = new Date(chronicle.eventDate).toLocaleDateString('zh-CN')
  let text = `📅 ${date}\n`
  text += `📝 ${chronicle.title}\n`
  if (chronicle.description) {
    text += `${chronicle.description}\n`
  }
  if (chronicle.participants && chronicle.participants.length > 0) {
    text += `👨‍👩‍👧‍👦 参与成员: ${chronicle.participants.join(', ')}\n`
  }
  return text
}

export const exportMilestoneAsText = (milestone) => {
  const date = new Date(milestone.achievedAt).toLocaleDateString('zh-CN')
  let text = `🌟 ${milestone.title}\n`
  text += `📅 达成日期: ${date}\n`
  if (milestone.description) {
    text += `${milestone.description}\n`
  }
  return text
}

// ========== 模板数据 ==========

export const MILESTONE_TEMPLATES = [
  { key: 'first_step', name: '第一步', icon: '👣', description: '宝宝迈出第一步' },
  { key: 'first_word', name: '第一句话', icon: '💬', description: '宝宝说出第一个词' },
  { key: 'first_tooth', name: '第一颗牙', icon: '🦷', description: '宝宝长出第一颗牙' },
  { key: 'first_food', name: '第一次辅食', icon: '🍼', description: '宝宝开始添加辅食' },
  { key: 'first_birthday', name: '一周岁', icon: '🎂', description: '宝宝一岁生日' },
  { key: 'first_daycare', name: '第一天托班', icon: '🏫', description: '宝宝开始上学' },
  { key: 'first_bike', name: '第一次骑车', icon: '🚲', description: '学会骑自行车' },
  { key: 'first_swim', name: '第一次游泳', icon: '🏊', description: '第一次游泳' },
  { key: 'custom', name: '自定义', icon: '✨', description: '记录自定义里程碑' }
]

export const CHRONICLE_CATEGORIES = [
  { key: 'travel', name: '旅行', icon: '✈️', description: '家庭旅行' },
  { key: 'celebration', name: '庆典', icon: '🎉', description: '生日、节日庆典' },
  { key: 'achievement', name: '成就', icon: '🏆', description: '重要成就' },
  { key: 'health', name: '健康', icon: '🏥', description: '健康相关事件' },
  { key: 'education', name: '教育', icon: '📚', description: '教育相关事件' },
  { key: 'family', name: '家庭', icon: '👨‍👩‍👧‍👦', description: '家庭聚会、活动' },
  { key: 'other', name: '其他', icon: '📝', description: '其他重要事件' }
]

export const ALBUM_TEMPLATES = [
  { key: 'yearly', name: '年度相册', icon: '📅', description: '按年份整理照片' },
  { key: 'travel', name: '旅行相册', icon: '✈️', description: '旅行照片集' },
  { key: 'birthday', name: '生日相册', icon: '🎂', description: '生日照片集' },
  { key: 'daily', name: '日常相册', icon: '🏠', description: '日常生活记录' },
  { key: 'holiday', name: '节日相册', icon: '🎄', description: '节日照片集' },
  { key: 'custom', name: '自定义相册', icon: '✨', description: '创建自定义相册' }
]
