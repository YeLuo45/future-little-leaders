/**
 * V54 Family Memory Archive Store
 * 家庭回忆档案：照片时间线、成长里程碑、家庭大事记
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import { usePointsStore } from './pointsStore.js'
import {
  getPhotos, savePhotos, addPhoto, updatePhoto, deletePhoto,
  getAlbums, saveAlbums, createAlbum, updateAlbum, deleteAlbum,
  getMilestones, saveMilestones, addMilestone, updateMilestone, deleteMilestone,
  getChronicles, saveChronicles, addChronicle, updateChronicle, deleteChronicle
} from '../services/memoryService.js'

export const useMemoryStore = defineStore('memory', () => {
  const babyStore = useBabyStore()
  const pointsStore = usePointsStore()

  // ========== 状态 ==========
  const photos = ref([])
  const albums = ref([])
  const milestones = ref([])
  const chronicles = ref([])

  // ========== 计算属性 ==========

  // 照片时间线（按日期倒序）
  const photoTimeline = computed(() => {
    return [...photos.value].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  })

  // 按年份分组的照片
  const photosByYear = computed(() => {
    const grouped = {}
    photos.value.forEach(photo => {
      const year = new Date(photo.createdAt).getFullYear()
      if (!grouped[year]) grouped[year] = []
      grouped[year].push(photo)
    })
    return grouped
  })

  // 相册列表（带照片数量）
  const albumList = computed(() => {
    return albums.value.map(album => ({
      ...album,
      photoCount: photos.value.filter(p => p.albumId === album.id).length
    }))
  })

  // 里程碑时间线（按日期倒序）
  const milestoneTimeline = computed(() => {
    return [...milestones.value].sort((a, b) =>
      new Date(b.achievedAt) - new Date(a.achievedAt)
    )
  })

  // 按宝宝分组的里程碑
  const milestonesByChild = computed(() => {
    const grouped = {}
    babyStore.babies.forEach(baby => {
      grouped[baby.id] = milestones.value
        .filter(m => m.childId === baby.id)
        .sort((a, b) => new Date(b.achievedAt) - new Date(a.achievedAt))
    })
    return grouped
  })

  // 大事记时间线（按日期倒序）
  const chronicleTimeline = computed(() => {
    return [...chronicles.value].sort((a, b) =>
      new Date(b.eventDate) - new Date(a.eventDate)
    )
  })

  // 按年份分组的大事记
  const chroniclesByYear = computed(() => {
    const grouped = {}
    chronicles.value.forEach(chronicle => {
      const year = new Date(chronicle.eventDate).getFullYear()
      if (!grouped[year]) grouped[year] = []
      grouped[year].push(chronicle)
    })
    return grouped
  })

  // ========== 初始化 ==========
  const init = () => {
    loadPhotos()
    loadAlbums()
    loadMilestones()
    loadChronicles()
  }

  // ========== 照片操作 ==========
  const loadPhotos = () => {
    photos.value = getPhotos()
  }

  const uploadPhoto = (photoData) => {
    const photo = addPhoto({
      url: photoData.url,
      title: photoData.title || '',
      description: photoData.description || '',
      tags: photoData.tags || [],
      albumId: photoData.albumId || null,
      location: photoData.location || '',
      babyId: photoData.babyId || null
    })
    photos.value = getPhotos()
    return photo
  }

  const editPhoto = (photoId, updates) => {
    const updated = updatePhoto(photoId, updates)
    if (updated) {
      photos.value = getPhotos()
    }
    return updated
  }

  const removePhoto = (photoId) => {
    const result = deletePhoto(photoId)
    if (result) {
      photos.value = getPhotos()
    }
    return result
  }

  const getPhotosInAlbum = (albumId) => {
    return photos.value.filter(p => p.albumId === albumId)
  }

  // ========== 相册操作 ==========
  const loadAlbums = () => {
    albums.value = getAlbums()
  }

  const createNewAlbum = (albumData) => {
    const album = createAlbum({
      name: albumData.name,
      description: albumData.description || '',
      coverPhoto: albumData.coverPhoto || null,
      template: albumData.template || 'custom'
    })
    albums.value = getAlbums()
    return album
  }

  const editAlbum = (albumId, updates) => {
    const updated = updateAlbum(albumId, updates)
    if (updated) {
      albums.value = getAlbums()
    }
    return updated
  }

  const removeAlbum = (albumId) => {
    // 同时删除相册中的照片关联
    photos.value.forEach(photo => {
      if (photo.albumId === albumId) {
        updatePhoto(photo.id, { albumId: null })
      }
    })
    const result = deleteAlbum(albumId)
    if (result) {
      albums.value = getAlbums()
      photos.value = getPhotos()
    }
    return result
  }

  // ========== 里程碑操作 ==========
  const loadMilestones = () => {
    milestones.value = getMilestones()
  }

  const recordMilestone = (milestoneData) => {
    const milestone = addMilestone({
      childId: milestoneData.childId,
      title: milestoneData.title,
      description: milestoneData.description || '',
      icon: milestoneData.icon || '🌟',
      category: milestoneData.category || 'custom',
      plannedDate: milestoneData.plannedDate || null,
      achievedAt: milestoneData.achievedAt || new Date().toISOString(),
      photos: milestoneData.photos || [],
      notes: milestoneData.notes || ''
    })
    milestones.value = getMilestones()

    // 里程碑达成奖励
    if (milestoneData.childId) {
      pointsStore.addBabyPoints(
        milestoneData.childId,
        50,
        `达成里程碑: ${milestoneData.title}`
      )
    }

    return milestone
  }

  const editMilestone = (milestoneId, updates) => {
    const updated = updateMilestone(milestoneId, updates)
    if (updated) {
      milestones.value = getMilestones()
    }
    return updated
  }

  const removeMilestone = (milestoneId) => {
    const result = deleteMilestone(milestoneId)
    if (result) {
      milestones.value = getMilestones()
    }
    return result
  }

  const getChildMilestones = (childId) => {
    return milestones.value.filter(m => m.childId === childId)
  }

  const getUpcomingMilestones = () => {
    const now = new Date()
    return milestones.value
      .filter(m => m.status === 'planned' && new Date(m.plannedDate) > now)
      .sort((a, b) => new Date(a.plannedDate) - new Date(b.plannedDate))
  }

  // ========== 大事记操作 ==========
  const loadChronicles = () => {
    chronicles.value = getChronicles()
  }

  const recordChronicle = (chronicleData) => {
    const chronicle = addChronicle({
      title: chronicleData.title,
      description: chronicleData.description || '',
      eventDate: chronicleData.eventDate || new Date().toISOString(),
      category: chronicleData.category || 'other',
      participants: chronicleData.participants || [],
      location: chronicleData.location || '',
      photos: chronicleData.photos || [],
      impact: chronicleData.impact || 'normal' // 'major' | 'normal' | 'minor'
    })
    chronicles.value = getChronicles()
    return chronicle
  }

  const editChronicle = (chronicleId, updates) => {
    const updated = updateChronicle(chronicleId, updates)
    if (updated) {
      chronicles.value = getChronicles()
    }
    return updated
  }

  const removeChronicle = (chronicleId) => {
    const result = deleteChronicle(chronicleId)
    if (result) {
      chronicles.value = getChronicles()
    }
    return result
  }

  const getYearChronicles = (year) => {
    return chronicles.value.filter(c =>
      new Date(c.eventDate).getFullYear() === year
    )
  }

  const getCategoryChronicles = (category) => {
    return chronicles.value.filter(c => c.category === category)
  }

  // ========== 年鉴生成 ==========
  const generateYearBook = (year) => {
    const yearChronicles = getYearChronicles(year)
    const yearPhotos = photos.value.filter(p =>
      new Date(p.createdAt).getFullYear() === year
    )

    return {
      year,
      chronicles: yearChronicles,
      photos: yearPhotos,
      milestoneCount: milestones.value.filter(m =>
        new Date(m.achievedAt).getFullYear() === year
      ).length,
      photoCount: yearPhotos.length
    }
  }

  return {
    // 状态
    photos,
    albums,
    milestones,
    chronicles,
    // 计算属性
    photoTimeline,
    photosByYear,
    albumList,
    milestoneTimeline,
    milestonesByChild,
    chronicleTimeline,
    chroniclesByYear,
    // 方法
    init,
    // 照片
    loadPhotos,
    uploadPhoto,
    editPhoto,
    removePhoto,
    getPhotosInAlbum,
    // 相册
    loadAlbums,
    createNewAlbum,
    editAlbum,
    removeAlbum,
    // 里程碑
    loadMilestones,
    recordMilestone,
    editMilestone,
    removeMilestone,
    getChildMilestones,
    getUpcomingMilestones,
    // 大事记
    loadChronicles,
    recordChronicle,
    editChronicle,
    removeChronicle,
    getYearChronicles,
    getCategoryChronicles,
    // 年鉴
    generateYearBook
  }
})
