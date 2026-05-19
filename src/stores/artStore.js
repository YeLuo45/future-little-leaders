/**
 * V68 Art Workshop Store
 * 美术工作坊 Store - 绘画工具、手工制作、美术课程、作品展示
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import artService from '@/services/artService.js'

export const useArtStore = defineStore('art', () => {
  // =========================================================================
  // 状态
  // =========================================================================

  // 当前Tab
  const currentTab = ref('drawing') // drawing | crafts | courses | gallery

  // 绘画板状态
  const drawingBoard = ref({
    currentTool: 'brush',
    currentColor: '#000000',
    lineWidth: 5,
    history: [],
    historyIndex: -1,
    isDrawing: false
  })

  // 绘画作品列表
  const drawingWorks = ref([])

  // 手工教程
  const craftTutorials = ref([])

  // 美术课程
  const artCourses = ref([])

  // 画廊作品
  const galleryWorks = ref([])

  // 当前选中的项目
  const selectedWork = ref(null)
  const selectedTutorial = ref(null)
  const selectedCourse = ref(null)

  // =========================================================================
  // 初始化
  // =========================================================================

  const init = () => {
    loadDrawingWorks()
    loadCraftTutorials()
    loadArtCourses()
    loadGalleryWorks()
  }

  // =========================================================================
  // 加载方法
  // =========================================================================

  const loadDrawingWorks = () => {
    drawingWorks.value = artService.getDrawingWorks()
  }

  const loadCraftTutorials = () => {
    craftTutorials.value = artService.getCraftTutorials()
  }

  const loadArtCourses = () => {
    artCourses.value = artService.getArtCourses()
  }

  const loadGalleryWorks = () => {
    galleryWorks.value = artService.getGalleryWorks()
  }

  // =========================================================================
  // 绘画板方法
  // =========================================================================

  const setDrawingTool = (tool) => {
    drawingBoard.value.currentTool = tool
  }

  const setDrawingColor = (color) => {
    drawingBoard.value.currentColor = color
  }

  const setLineWidth = (width) => {
    drawingBoard.value.lineWidth = width
  }

  const saveDrawingHistory = (data) => {
    const historyData = {
      data: data,
      tool: drawingBoard.value.currentTool,
      color: drawingBoard.value.currentColor,
      lineWidth: drawingBoard.value.lineWidth
    }

    if (drawingBoard.value.historyIndex < drawingBoard.value.history.length - 1) {
      drawingBoard.value.history = drawingBoard.value.history.slice(0, drawingBoard.value.historyIndex + 1)
    }

    drawingBoard.value.history.push(historyData)
    drawingBoard.value.historyIndex = drawingBoard.value.history.length - 1

    if (drawingBoard.value.history.length > 50) {
      drawingBoard.value.history.shift()
      drawingBoard.value.historyIndex--
    }
  }

  const undoDrawing = () => {
    if (drawingBoard.value.historyIndex > 0) {
      drawingBoard.value.historyIndex--
      return drawingBoard.value.history[drawingBoard.value.historyIndex]
    }
    return null
  }

  const redoDrawing = () => {
    if (drawingBoard.value.historyIndex < drawingBoard.value.history.length - 1) {
      drawingBoard.value.historyIndex++
      return drawingBoard.value.history[drawingBoard.value.historyIndex]
    }
    return null
  }

  const clearDrawingBoard = () => {
    drawingBoard.value.history = []
    drawingBoard.value.historyIndex = -1
    drawingBoard.value.isDrawing = false
  }

  const saveDrawingWork = (workData) => {
    const newWork = artService.saveDrawingWork(workData)
    if (newWork) {
      loadDrawingWorks()
      return newWork
    }
    return null
  }

  const deleteDrawingWork = (workId) => {
    const success = artService.deleteDrawingWork(workId)
    if (success) {
      loadDrawingWorks()
    }
    return success
  }

  const toggleDrawingFavorite = (workId) => {
    const result = artService.toggleDrawingFavorite(workId)
    if (result !== false) {
      loadDrawingWorks()
    }
    return result
  }

  const shareDrawingWork = (workId) => {
    const success = artService.shareDrawingWork(workId)
    if (success) {
      loadDrawingWorks()
    }
    return success
  }

  // =========================================================================
  // 手工教程方法
  // =========================================================================

  const completeCraftTutorial = (tutorialId) => {
    const success = artService.completeCraftTutorial(tutorialId)
    if (success) {
      loadCraftTutorials()
    }
    return success
  }

  const selectTutorial = (tutorial) => {
    selectedTutorial.value = tutorial
  }

  // =========================================================================
  // 课程方法
  // =========================================================================

  const enrollCourse = (courseId) => {
    const success = artService.enrollCourse(courseId)
    if (success) {
      loadArtCourses()
    }
    return success
  }

  const completeLesson = (courseId, lessonId) => {
    const success = artService.completeLesson(courseId, lessonId)
    if (success) {
      loadArtCourses()
    }
    return success
  }

  const selectCourse = (course) => {
    selectedCourse.value = course
  }

  // =========================================================================
  // 画廊方法
  // =========================================================================

  const likeGalleryWork = (workId) => {
    const success = artService.likeGalleryWork(workId)
    if (success) {
      loadGalleryWorks()
    }
    return success
  }

  const shareGalleryWork = (workId) => {
    return artService.shareGalleryWork(workId)
  }

  const collectGalleryWork = (workId) => {
    return artService.collectGalleryWork(workId)
  }

  // =========================================================================
  // 计算属性
  // =========================================================================

  // 收藏的绘画作品
  const favoriteDrawingWorks = computed(() => {
    return drawingWorks.value.filter(w => w.isFavorite)
  })

  // 手工已完成数量
  const completedCraftCount = computed(() => {
    return craftTutorials.value.filter(t => t.isCompleted).length
  })

  // 课程已报名数量
  const enrolledCourseCount = computed(() => {
    return artCourses.value.filter(c => c.isEnrolled).length
  })

  // 绘画工具列表
  const drawingTools = computed(() => Object.values(artService.DRAWING_TOOLS))

  // 绘画颜色列表
  const drawingColors = computed(() => artService.DRAWING_COLORS)

  // 线条粗细列表
  const lineWidths = computed(() => artService.LINE_WIDTHS)

  return {
    // 状态
    currentTab,
    drawingBoard,
    drawingWorks,
    craftTutorials,
    artCourses,
    galleryWorks,
    selectedWork,
    selectedTutorial,
    selectedCourse,

    // 初始化
    init,

    // 加载方法
    loadDrawingWorks,
    loadCraftTutorials,
    loadArtCourses,
    loadGalleryWorks,

    // 绘画板方法
    setDrawingTool,
    setDrawingColor,
    setLineWidth,
    saveDrawingHistory,
    undoDrawing,
    redoDrawing,
    clearDrawingBoard,

    // 绘画作品方法
    saveDrawingWork,
    deleteDrawingWork,
    toggleDrawingFavorite,
    shareDrawingWork,

    // 手工教程方法
    completeCraftTutorial,
    selectTutorial,

    // 课程方法
    enrollCourse,
    completeLesson,
    selectCourse,

    // 画廊方法
    likeGalleryWork,
    shareGalleryWork,
    collectGalleryWork,

    // 计算属性
    favoriteDrawingWorks,
    completedCraftCount,
    enrolledCourseCount,
    drawingTools,
    drawingColors,
    lineWidths
  }
})
