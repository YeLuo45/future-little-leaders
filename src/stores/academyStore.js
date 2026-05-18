// src/stores/academyStore.js
// V20 家长成长学院 Store - 管理知识库/视频课/专家问答状态

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ==================== Mock 数据 ====================

const MOCK_ARTICLES = [
  {
    id: 'art-001',
    title: '0-3岁宝宝语言发展关键期',
    summary: '揭秘婴幼儿语言爆发的秘密，掌握这些技巧让宝宝更早开口说话。',
    category: '0-3岁',
    dimension: '语言能力',
    content: '语言发展是宝宝成长中最令人期待的里程碑之一。在0-3岁阶段，宝宝会经历语言发展的关键期...\n\n1. 0-6个月：倾听期\n宝宝开始倾听周围的声音，对人声特别敏感。\n\n2. 6-12个月：发音期\n宝宝开始发出咿呀声，尝试模仿音调变化。\n\n3. 12-18个月：单词期\n宝宝通常会说出第一个有意义的单词。\n\n4. 18-24个月：短语期\n词汇量快速增长，开始说简单的短语。\n\n5. 24-36个月：句子期\n宝宝能够说完整的句子，表达复杂想法。\n\n**家长指南**：多与宝宝对话、阅读绘本、回应宝宝的发音，都能有效促进语言发展。',
    relatedVideos: ['c001', 'c003'],
    date: '2024-01-15',
    readTime: 8
  },
  {
    id: 'art-002',
    title: '3-6岁儿童社交能力培养',
    summary: '帮助孩子建立健康的人际关系，从学会分享开始。',
    category: '3-6岁',
    dimension: '社交能力',
    content: '3-6岁是儿童社交能力发展的关键时期，这个阶段的孩子开始与同龄人互动...\n\n**社交发展里程碑**：\n- 3-4岁：平行游戏期\n- 4-5岁：合作游戏萌芽\n- 5-6岁：真正的合作游戏\n\n**培养策略**：\n1. 创造社交机会\n2. 引导分享与轮流\n3. 培养同理心\n4. 正确处理冲突',
    relatedVideos: ['c002'],
    date: '2024-01-18',
    readTime: 10
  },
  {
    id: 'art-003',
    title: '6-12岁儿童注意力训练',
    summary: '提升学习效率，从培养专注力开始，专家支招家庭训练法。',
    category: '6-12岁',
    dimension: '专注力',
    content: '注意力是学习的基础，6-12岁是培养注意力的黄金期...\n\n**注意力发展阶段**：\n- 6-7岁：有意注意开始发展\n- 8-10岁：注意范围扩大\n- 10-12岁：注意稳定性增强\n\n**训练方法**：\n1. 番茄工作法（儿童版）\n2. 冥想与呼吸练习\n3. 感官统合训练\n4. 游戏化训练',
    relatedVideos: ['c004', 'c005'],
    date: '2024-01-20',
    readTime: 12
  },
  {
    id: 'art-004',
    title: '儿童情绪管理入门',
    summary: '教会孩子认识和管理情绪，是父母的一堂必修课。',
    category: '3-6岁',
    dimension: '情绪管理',
    content: '情绪管理能力影响孩子的一生，帮助孩子认识情绪是第一步...\n\n**情绪认知三部曲**：\n1. 命名情绪\n2. 理解情绪产生原因\n3. 学习调节方法\n\n**实用工具**：\n- 情绪脸谱卡\n- 情绪日记\n- 冷静角设置',
    relatedVideos: ['c006'],
    date: '2024-01-22',
    readTime: 9
  }
]

const MOCK_COURSES = [
  {
    id: 'c001',
    title: '儿童发展心理学基础',
    cover: '/static/course/course1.jpg',
    duration: 1800,
    completed: false,
    progress: 65,
    category: '心理学',
    lessons: 12,
    completedLessons: 8,
    expert: '张教授',
    expertTitle: '儿童心理学专家',
    description: '系统讲解0-12岁儿童心理发展规律，帮助家长更好地理解孩子。'
  },
  {
    id: 'c002',
    title: '正面管教：温和而坚定',
    cover: '/static/course/course2.jpg',
    duration: 2400,
    completed: true,
    progress: 100,
    category: '教育方法',
    lessons: 10,
    completedLessons: 10,
    expert: '李老师',
    expertTitle: '家庭教育指导师',
    description: '学习不惩罚、不娇纵的有效育儿方法。'
  },
  {
    id: 'c003',
    title: '亲子沟通的艺术',
    cover: '/static/course/course3.jpg',
    duration: 1500,
    completed: false,
    progress: 30,
    category: '沟通技巧',
    lessons: 8,
    completedLessons: 2,
    expert: '王博士',
    expertTitle: '沟通心理学博士',
    description: '改善亲子关系，从有效沟通开始。'
  },
  {
    id: 'c004',
    title: '儿童专注力提升训练营',
    cover: '/static/course/course4.jpg',
    duration: 3600,
    completed: false,
    progress: 0,
    category: '能力培养',
    lessons: 15,
    completedLessons: 0,
    expert: '刘教练',
    expertTitle: '注意力训练专家',
    description: '15天专注力训练计划，有效提升孩子注意力。'
  },
  {
    id: 'c005',
    title: '数学启蒙教育指南',
    cover: '/static/course/course5.jpg',
    duration: 1200,
    completed: false,
    progress: 50,
    category: '学科启蒙',
    lessons: 6,
    completedLessons: 3,
    expert: '陈老师',
    expertTitle: '幼教专家',
    description: '在生活中培养数学思维，让数学学习变得有趣。'
  },
  {
    id: 'c006',
    title: '儿童营养与健康管理',
    cover: '/static/course/course6.jpg',
    duration: 2000,
    completed: false,
    progress: 0,
    category: '健康管理',
    lessons: 10,
    completedLessons: 0,
    expert: '赵医生',
    expertTitle: '儿科营养师',
    description: '科学喂养，让孩子健康成长。'
  }
]

const MOCK_QUESTIONS = [
  {
    id: 'q001',
    title: '孩子3岁了还不会说话，正常吗？',
    content: '我家宝宝3岁了，只会叫爸爸妈妈，其他词汇量很少，不知道是否需要看医生？',
    category: '发育',
    images: [],
    status: 'answered',
    answer: '3岁孩子语言发展有个体差异，但如果词汇量明显落后于同龄人，建议：\n1. 先做全面发育评估\n2. 排除听力问题\n3. 创造丰富的语言环境\n4. 必要时寻求语言治疗师帮助',
    answerDate: '2024-01-20',
    expert: '张教授'
  },
  {
    id: 'q002',
    title: '孩子上幼儿园总是哭怎么办？',
    content: '孩子刚上幼儿园，每天早上都哭着不想去，已经一个月了还是这样。',
    category: '心理',
    images: [],
    status: 'answered',
    answer: '这是典型的分离焦虑，可以尝试：\n1. 提前带孩子参观幼儿园\n2. 建立固定的告别仪式\n3. 准时接送，建立信任\n4. 与老师密切配合\n5. 理解孩子的情绪，给予安抚',
    answerDate: '2024-01-18',
    expert: '李老师'
  },
  {
    id: 'q003',
    title: '如何培养孩子的阅读习惯？',
    content: '想让孩子爱上阅读，但每次给他读书他都坐不住，应该从什么时候开始培养？',
    category: '教育',
    images: [],
    status: 'answered',
    answer: '阅读习惯培养建议：\n1. 从6个月开始就可以亲子共读\n2. 选择适龄的绘本\n3. 固定阅读时间\n4. 让阅读变得有趣\n5. 父母以身作则\n6. 不要强迫，保护兴趣',
    answerDate: '2024-01-15',
    expert: '王博士'
  }
]

export const useAcademyStore = defineStore('academy', () => {
  // ==================== 状态 ====================

  // 知识库
  const articles = ref([])
  const selectedCategory = ref('全部')
  const selectedDimension = ref('全部')
  const isLoadingArticles = ref(false)

  // 视频课程
  const courses = ref([])
  const currentCourse = ref(null)
  const isLoadingCourses = ref(false)

  // 专家问答
  const questions = ref([])
  const myQuestions = ref([])
  const isSubmitting = ref(false)

  // 学习进度
  const learningStats = ref({
    totalLearningTime: 0,
    coursesCompleted: 0,
    articlesRead: 0,
    pointsEarned: 0
  })

  // ==================== 计算属性 ====================

  // 分类后的文章
  const filteredArticles = computed(() => {
    let result = articles.value
    if (selectedCategory.value !== '全部') {
      result = result.filter(a => a.category === selectedCategory.value)
    }
    if (selectedDimension.value !== '全部') {
      result = result.filter(a => a.dimension === selectedDimension.value)
    }
    return result
  })

  // 课程完成数
  const completedCoursesCount = computed(() => {
    return courses.value.filter(c => c.completed).length
  })

  // 进行中的课程
  const ongoingCourses = computed(() => {
    return courses.value.filter(c => !c.completed && c.progress > 0)
  })

  // ==================== 方法 ====================

  /**
   * 加载知识库文章
   */
  async function loadArticles() {
    isLoadingArticles.value = true
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      articles.value = MOCK_ARTICLES
      return true
    } catch (e) {
      console.error('[Academy] Failed to load articles:', e)
      return false
    } finally {
      isLoadingArticles.value = false
    }
  }

  /**
   * 获取文章详情
   */
  async function getArticleById(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return articles.value.find(a => a.id === id) || null
  }

  /**
   * 设置文章分类筛选
   */
  function setArticleFilter(category, dimension) {
    if (category !== undefined) selectedCategory.value = category
    if (dimension !== undefined) selectedDimension.value = dimension
  }

  /**
   * 标记文章已读
   */
  async function markArticleRead(articleId) {
    const article = articles.value.find(a => a.id === articleId)
    if (article) {
      article.read = true
      learningStats.value.articlesRead++
      learningStats.value.pointsEarned += 5
    }
  }

  /**
   * 加载课程列表
   */
  async function loadCourses() {
    isLoadingCourses.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      courses.value = MOCK_COURSES
      updateLearningStats()
      return true
    } catch (e) {
      console.error('[Academy] Failed to load courses:', e)
      return false
    } finally {
      isLoadingCourses.value = false
    }
  }

  /**
   * 获取课程详情
   */
  async function getCourseById(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return courses.value.find(c => c.id === id) || null
  }

  /**
   * 开始/继续课程
   */
  function startCourse(courseId) {
    const course = courses.value.find(c => c.id === courseId)
    if (course) {
      currentCourse.value = course
    }
  }

  /**
   * 更新课程进度
   */
  async function updateCourseProgress(courseId, progress) {
    const course = courses.value.find(c => c.id === courseId)
    if (course) {
      course.progress = progress
      if (progress >= 100 && !course.completed) {
        course.completed = true
        learningStats.value.coursesCompleted++
        learningStats.value.pointsEarned += 50
      }
      updateLearningStats()
    }
  }

  /**
   * 完成课程（模拟完成动画）
   */
  async function completeCourse(courseId) {
    const course = courses.value.find(c => c.id === courseId)
    if (course) {
      // 模拟播放完成动画
      await new Promise(resolve => setTimeout(resolve, 400))
      await updateCourseProgress(courseId, 100)
    }
  }

  /**
   * 加载问答列表
   */
  async function loadQuestions() {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      questions.value = MOCK_QUESTIONS
      return true
    } catch (e) {
      console.error('[Academy] Failed to load questions:', e)
      return false
    }
  }

  /**
   * 提交问题
   */
  async function submitQuestion(data) {
    isSubmitting.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      const newQuestion = {
        id: `q-${Date.now()}`,
        title: data.title,
        content: data.content,
        category: data.category,
        images: data.images || [],
        status: 'pending',
        submitDate: new Date().toISOString().split('T')[0]
      }
      myQuestions.value.unshift(newQuestion)
      questions.value.unshift(newQuestion)
      learningStats.value.pointsEarned += 10
      return true
    } catch (e) {
      console.error('[Academy] Failed to submit question:', e)
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * 模拟AI回答问题（mock）
   */
  async function getMockAnswer(questionId) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const mockAnswers = {
      'q-001': '感谢您的提问！根据您描述的情况，建议先观察孩子的整体发育情况...',
      'q-002': '这是一个很多家长都会遇到的问题...',
      'q-003': '培养阅读习惯越早越好...'
    }
    return mockAnswers[questionId] || '感谢您的提问，我们专家团队正在准备回复中...'
  }

  /**
   * 更新学习统计
   */
  function updateLearningStats() {
    const completed = courses.value.filter(c => c.completed).length
    const inProgress = courses.value.filter(c => c.progress > 0 && !c.completed)
    const totalTime = inProgress.reduce((sum, c) => sum + Math.floor(c.duration * c.progress / 100), 0)

    learningStats.value = {
      totalLearningTime: totalTime,
      coursesCompleted: completed,
      articlesRead: articles.value.filter(a => a.read).length,
      pointsEarned: completed * 50 + (articles.value.filter(a => a.read).length * 5)
    }
  }

  /**
   * 重置学院数据
   */
  function reset() {
    articles.value = []
    courses.value = []
    currentCourse.value = null
    questions.value = []
    myQuestions.value = []
    selectedCategory.value = '全部'
    selectedDimension.value = '全部'
    learningStats.value = {
      totalLearningTime: 0,
      coursesCompleted: 0,
      articlesRead: 0,
      pointsEarned: 0
    }
  }

  return {
    // 状态
    articles,
    selectedCategory,
    selectedDimension,
    isLoadingArticles,
    courses,
    currentCourse,
    isLoadingCourses,
    questions,
    myQuestions,
    isSubmitting,
    learningStats,

    // 计算属性
    filteredArticles,
    completedCoursesCount,
    ongoingCourses,

    // 方法
    loadArticles,
    getArticleById,
    setArticleFilter,
    markArticleRead,
    loadCourses,
    getCourseById,
    startCourse,
    updateCourseProgress,
    completeCourse,
    loadQuestions,
    submitQuestion,
    getMockAnswer,
    updateLearningStats,
    reset
  }
})
