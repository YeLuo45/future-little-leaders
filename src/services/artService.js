/**
 * V68 Art Workshop Service
 * 美术工作坊系统 - 绘画工具、手工制作、美术课程、作品展示
 */

// Storage keys
const ART_WORKS_KEY = 'art_works'
const CRAFT_TUTORIALS_KEY = 'craft_tutorials'
const ART_COURSES_KEY = 'art_courses'
const GALLERY_KEY = 'gallery'

// ============================================================================
// Drawing Tools
// ============================================================================

export const DRAWING_TOOLS = {
  brush: { id: 'brush', name: '画笔', icon: '🖌️' },
  crayon: { id: 'crayon', name: '蜡笔', icon: '🖍️' },
  pencil: { id: 'pencil', name: '铅笔', icon: '✏️' },
  marker: { id: 'marker', name: '马克笔', icon: '🖊️' },
  eraser: { id: 'eraser', name: '橡皮', icon: '🧽' }
}

export const DRAWING_COLORS = [
  '#FF6B6B', '#FF8E53', '#FFD93D', '#6BCB77', '#4D96FF',
  '#9B59B6', '#E74C3C', '#2ECC71', '#3498DB', '#F39C12',
  '#1ABC9C', '#E91E63', '#8B4513', '#000000', '#FFFFFF'
]

export const LINE_WIDTHS = [
  { id: 'thin', name: '细', value: 2 },
  { id: 'medium', name: '中', value: 5 },
  { id: 'thick', name: '粗', value: 10 },
  { id: 'extra-thick', name: '特粗', value: 20 }
]

// ============================================================================
// Drawing Works Management
// ============================================================================

export const getDrawingWorks = () => {
  try {
    const data = uni.getStorageSync(ART_WORKS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getDrawingWorks error:', e)
  }
  return getDefaultDrawingWorks()
}

export const getDefaultDrawingWorks = () => [
  {
    id: 'draw_1',
    title: '我的小花园',
    description: '用画笔描绘的美丽花园',
    imageData: '',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    duration: 30,
    points: 10,
    isFavorite: true,
    shareCount: 5,
    tags: ['花园', '自然']
  },
  {
    id: 'draw_2',
    title: '快乐的家庭',
    description: '画了我们一家人',
    imageData: '',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    duration: 45,
    points: 15,
    isFavorite: false,
    shareCount: 3,
    tags: ['家庭', '人物']
  }
]

export const saveDrawingWork = (workData) => {
  try {
    const works = getDrawingWorks()
    const newWork = {
      id: 'draw_' + Date.now(),
      title: workData.title || '我的绘画',
      description: workData.description || '',
      imageData: workData.imageData || '',
      createdAt: new Date().toISOString(),
      duration: workData.duration || 30,
      points: Math.round((workData.duration || 30) / 3),
      isFavorite: false,
      shareCount: 0,
      tags: workData.tags || []
    }
    works.unshift(newWork)
    uni.setStorageSync(ART_WORKS_KEY, JSON.stringify(works))
    return newWork
  } catch (e) {
    console.error('saveDrawingWork error:', e)
    return null
  }
}

export const deleteDrawingWork = (workId) => {
  try {
    const works = getDrawingWorks()
    const filtered = works.filter(w => w.id !== workId)
    uni.setStorageSync(ART_WORKS_KEY, JSON.stringify(filtered))
    return true
  } catch (e) {
    console.error('deleteDrawingWork error:', e)
    return false
  }
}

export const toggleDrawingFavorite = (workId) => {
  try {
    const works = getDrawingWorks()
    const work = works.find(w => w.id === workId)
    if (work) {
      work.isFavorite = !work.isFavorite
      uni.setStorageSync(ART_WORKS_KEY, JSON.stringify(works))
      return work.isFavorite
    }
    return false
  } catch (e) {
    console.error('toggleDrawingFavorite error:', e)
    return false
  }
}

export const shareDrawingWork = (workId) => {
  try {
    const works = getDrawingWorks()
    const work = works.find(w => w.id === workId)
    if (work) {
      work.shareCount++
      uni.setStorageSync(ART_WORKS_KEY, JSON.stringify(works))
      return true
    }
    return false
  } catch (e) {
    console.error('shareDrawingWork error:', e)
    return false
  }
}

// ============================================================================
// Craft Tutorials
// ============================================================================

export const getCraftTutorials = () => {
  try {
    const data = uni.getStorageSync(CRAFT_TUTORIALS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getCraftTutorials error:', e)
  }
  return getDefaultCraftTutorials()
}

export const getDefaultCraftTutorials = () => [
  {
    id: 'craft_1',
    title: '折纸小兔子',
    description: '可爱的小兔子折纸教程',
    difficulty: 'easy',
    duration: 15,
    materials: ['正方形纸', '水彩笔', '剪刀'],
    steps: [
      { step: 1, title: '准备纸张', content: '取一张正方形纸，对角折出三角形' },
      { step: 2, title: '折出耳朵', content: '将三角形的两个角向上折，形成兔子的耳朵' },
      { step: 3, title: '画眼睛', content: '用笔画出小兔子的眼睛' }
    ],
    imageUrl: '',
    points: 20,
    isCompleted: false
  },
  {
    id: 'craft_2',
    title: '黏土小怪兽',
    description: '用超轻黏土制作可爱小怪兽',
    difficulty: 'medium',
    duration: 30,
    materials: ['超轻黏土（多色）', '眼睛配件', '牙签'],
    steps: [
      { step: 1, title: '准备材料', content: '准备好各种颜色的黏土' },
      { step: 2, title: '捏出身体', content: '选择喜欢的颜色，捏出小怪兽的身体' },
      { step: 3, title: '添加眼睛', content: '用黏土或配件给怪兽加上大眼睛' },
      { step: 4, title: '完成细节', content: '添加角、腿等细节部分' }
    ],
    imageUrl: '',
    points: 35,
    isCompleted: false
  },
  {
    id: 'craft_3',
    title: '剪纸窗花',
    description: '传统剪纸艺术，制作精美窗花',
    difficulty: 'hard',
    duration: 45,
    materials: ['红纸', '剪刀', '铅笔', '橡皮'],
    steps: [
      { step: 1, title: '折叠纸张', content: '将红纸对折再对折' },
      { step: 2, title: '画出图案', content: '用铅笔画出要剪的图案' },
      { step: 3, title: '剪出图案', content: '小心地沿线条剪开' },
      { step: 4, title: '展开成品', content: '轻轻展开，一张漂亮的窗花就完成了' }
    ],
    imageUrl: '',
    points: 50,
    isCompleted: false
  }
]

export const completeCraftTutorial = (tutorialId) => {
  try {
    const tutorials = getCraftTutorials()
    const tutorial = tutorials.find(t => t.id === tutorialId)
    if (tutorial) {
      tutorial.isCompleted = true
      uni.setStorageSync(CRAFT_TUTORIALS_KEY, JSON.stringify(tutorials))
      return true
    }
    return false
  } catch (e) {
    console.error('completeCraftTutorial error:', e)
    return false
  }
}

// ============================================================================
// Art Courses
// ============================================================================

export const getArtCourses = () => {
  try {
    const data = uni.getStorageSync(ART_COURSES_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getArtCourses error:', e)
  }
  return getDefaultArtCourses()
}

export const getDefaultArtCourses = () => [
  {
    id: 'course_1',
    title: '绘画基础入门',
    description: '学习基本的绘画知识和技巧',
    category: 'drawing',
    difficulty: 'beginner',
    duration: 60,
    lessons: [
      { id: 'l1', title: '认识色彩', content: '学习红、黄、蓝三原色', isCompleted: false },
      { id: 'l2', title: '线条练习', content: '各种线条的画法', isCompleted: false },
      { id: 'l3', title: '简单形状', content: '圆形、方形、三角形的画法', isCompleted: false }
    ],
    points: 100,
    isEnrolled: false
  },
  {
    id: 'course_2',
    title: '水彩画技巧',
    description: '掌握水彩画的基本技法',
    category: 'drawing',
    difficulty: 'intermediate',
    duration: 90,
    lessons: [
      { id: 'l1', title: '水彩工具', content: '认识水彩画工具', isCompleted: false },
      { id: 'l2', title: '混色技巧', content: '学习颜色的混合', isCompleted: false },
      { id: 'l3', title: '湿画法', content: '湿画法的运用', isCompleted: false }
    ],
    points: 150,
    isEnrolled: false
  },
  {
    id: 'course_3',
    title: '手工艺术进阶',
    description: '提升手工制作技能',
    category: 'craft',
    difficulty: 'intermediate',
    duration: 120,
    lessons: [
      { id: 'l1', title: '材料选择', content: '如何选择合适的材料', isCompleted: false },
      { id: 'l2', title: '工具使用', content: '各种手工工具的安全使用', isCompleted: false },
      { id: 'l3', title: '创意设计', content: '如何设计独一无二的作品', isCompleted: false }
    ],
    points: 180,
    isEnrolled: false
  }
]

export const enrollCourse = (courseId) => {
  try {
    const courses = getArtCourses()
    const course = courses.find(c => c.id === courseId)
    if (course) {
      course.isEnrolled = true
      uni.setStorageSync(ART_COURSES_KEY, JSON.stringify(courses))
      return true
    }
    return false
  } catch (e) {
    console.error('enrollCourse error:', e)
    return false
  }
}

export const completeLesson = (courseId, lessonId) => {
  try {
    const courses = getArtCourses()
    const course = courses.find(c => c.id === courseId)
    if (course) {
      const lesson = course.lessons.find(l => l.id === lessonId)
      if (lesson) {
        lesson.isCompleted = true
        uni.setStorageSync(ART_COURSES_KEY, JSON.stringify(courses))
        return true
      }
    }
    return false
  } catch (e) {
    console.error('completeLesson error:', e)
    return false
  }
}

// ============================================================================
// Gallery
// ============================================================================

export const getGalleryWorks = () => {
  try {
    const data = uni.getStorageSync(GALLERY_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getGalleryWorks error:', e)
  }
  return getDefaultGalleryWorks()
}

export const getDefaultGalleryWorks = () => [
  {
    id: 'gallery_1',
    title: '春天的花園',
    author: '小明',
    type: 'drawing',
    imageData: '',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    likes: 25,
    isLiked: false,
    comments: 5
  },
  {
    id: 'gallery_2',
    title: '我的超级英雄',
    author: '小红',
    type: 'drawing',
    imageData: '',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    likes: 42,
    isLiked: true,
    comments: 12
  },
  {
    id: 'gallery_3',
    title: '折纸飞机',
    author: '小华',
    type: 'craft',
    imageData: '',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    likes: 18,
    isLiked: false,
    comments: 3
  }
]

export const likeGalleryWork = (workId) => {
  try {
    const works = getGalleryWorks()
    const work = works.find(w => w.id === workId)
    if (work) {
      work.isLiked = !work.isLiked
      work.likes += work.isLiked ? 1 : -1
      uni.setStorageSync(GALLERY_KEY, JSON.stringify(works))
      return true
    }
    return false
  } catch (e) {
    console.error('likeGalleryWork error:', e)
    return false
  }
}

export const shareGalleryWork = (workId) => {
  try {
    const works = getGalleryWorks()
    const work = works.find(w => w.id === workId)
    if (work) {
      uni.setStorageSync(GALLERY_KEY, JSON.stringify(works))
      return true
    }
    return false
  } catch (e) {
    console.error('shareGalleryWork error:', e)
    return false
  }
}

export const collectGalleryWork = (workId) => {
  try {
    const works = getGalleryWorks()
    const work = works.find(w => w.id === workId)
    if (work) {
      uni.setStorageSync(GALLERY_KEY, JSON.stringify(works))
      return true
    }
    return false
  } catch (e) {
    console.error('collectGalleryWork error:', e)
    return false
  }
}

export default {
  DRAWING_TOOLS,
  DRAWING_COLORS,
  LINE_WIDTHS,
  getDrawingWorks,
  saveDrawingWork,
  deleteDrawingWork,
  toggleDrawingFavorite,
  shareDrawingWork,
  getCraftTutorials,
  completeCraftTutorial,
  getArtCourses,
  enrollCourse,
  completeLesson,
  getGalleryWorks,
  likeGalleryWork,
  shareGalleryWork,
  collectGalleryWork
}
