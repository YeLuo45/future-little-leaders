/**
 * V62 Geography Service
 * 世界地理与文化服务 - 环球旅行、国家文化、地理知识、国际友谊
 */

const STORAGE_KEY = 'geography_data'

// 默认数据
const getDefaultData = () => ({
  tours: [],
  checkins: [],
  cultures: [],
  learnedFacts: [],
  penPals: [],
  languageProgress: {},
  userStats: {
    totalPoints: 0,
    countriesVisited: 0,
    culturesExplored: 0,
    factsLearned: 0,
    penPalsCount: 0,
    languagesStarted: 0
  },
  badges: []
})

// 获取本地数据
const getLocalData = () => {
  try {
    const data = uni.getStorageSync(STORAGE_KEY)
    if (data) {
      return { ...getDefaultData(), ...JSON.parse(data) }
    }
  } catch (e) {
    console.error('Failed to load geography data:', e)
  }
  return getDefaultData()
}

// 保存数据到本地
const saveData = (data) => {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('Failed to save geography data:', e)
    return false
  }
}

// 环球旅行目的地
const tourDestinations = [
  {
    id: 'tour-china',
    country: '中国',
    city: '北京',
    continent: '亚洲',
    description: '古老的东方文明，古老的首都',
    highlights: ['长城', '故宫', '天坛', '颐和园'],
    culture: '中国传统文化',
    points: 20,
    difficulty: 'easy'
  },
  {
    id: 'tour-japan',
    country: '日本',
    city: '东京',
    continent: '亚洲',
    description: '传统与现代完美融合的国度',
    highlights: ['富士山', '浅草寺', '东京塔', '秋叶原'],
    culture: '日本文化',
    points: 25,
    difficulty: 'medium'
  },
  {
    id: 'tour-france',
    country: '法国',
    city: '巴黎',
    continent: '欧洲',
    description: '浪漫之都，艺术与时尚的中心',
    highlights: ['埃菲尔铁塔', '卢浮宫', '凯旋门', '凡尔赛宫'],
    culture: '法国文化',
    points: 30,
    difficulty: 'medium'
  },
  {
    id: 'tour-usa',
    country: '美国',
    city: '纽约',
    continent: '北美洲',
    description: '多元文化的熔炉，梦想之地',
    highlights: ['自由女神像', '时代广场', '中央公园', '帝国大厦'],
    culture: '美国文化',
    points: 30,
    difficulty: 'medium'
  },
  {
    id: 'tour-uk',
    country: '英国',
    city: '伦敦',
    continent: '欧洲',
    description: '皇室传统与绅士风度的国度',
    highlights: ['大本钟', '白金汉宫', '塔桥', '大英博物馆'],
    culture: '英国文化',
    points: 25,
    difficulty: 'medium'
  },
  {
    id: 'tour-australia',
    country: '澳大利亚',
    city: '悉尼',
    continent: '大洋洲',
    description: '南半球的阳光与自然',
    highlights: ['悉尼歌剧院', '海港大桥', '大堡礁', '袋鼠'],
    culture: '澳大利亚文化',
    points: 35,
    difficulty: 'hard'
  },
  {
    id: 'tour-egypt',
    country: '埃及',
    city: '开罗',
    continent: '非洲',
    description: '古老文明的发源地，金字塔之国',
    highlights: ['金字塔', '狮身人面像', '尼罗河', '卢克索神庙'],
    culture: '古埃及文化',
    points: 40,
    difficulty: 'hard'
  },
  {
    id: 'tour-brazil',
    country: '巴西',
    city: '里约热内卢',
    continent: '南美洲',
    description: '桑巴与足球的激情国度',
    highlights: ['基督像', '科帕卡瓦纳海滩', '亚马逊雨林', '狂欢节'],
    culture: '巴西文化',
    points: 35,
    difficulty: 'hard'
  },
  {
    id: 'tour-india',
    country: '印度',
    city: '新德里',
    continent: '亚洲',
    description: '神秘的文明古国，多彩的民族',
    highlights: ['泰姬陵', '红堡', '莲花寺', '恒河'],
    culture: '印度文化',
    points: 30,
    difficulty: 'medium'
  },
  {
    id: 'tour-southafrica',
    country: '南非',
    city: '开普敦',
    continent: '非洲',
    description: '彩虹之国的自然奇观',
    highlights: ['桌山', '好望角', '克鲁格国家公园', '企鹅滩'],
    culture: '南非文化',
    points: 40,
    difficulty: 'hard'
  }
]

// 文化发现内容
const cultureContent = [
  {
    id: 'culture-chinese-new-year',
    title: '春节',
    country: '中国',
    category: '节日庆典',
    description: '中国最重要的传统节日，庆祝农历新年',
    content: '春节是中国最隆重的传统节日，人们会贴春联、放鞭炮、吃年夜饭、拜年、发红包等。春节象征着辞旧迎新，阖家团圆。',
    traditions: ['贴春联', '放鞭炮', '吃年夜饭', '发红包', '拜年'],
    food: ['饺子', '年糕', '鱼', '汤圆'],
    icon: '🧧',
    points: 10
  },
  {
    id: 'culture-japan-sakura',
    title: '樱花节',
    country: '日本',
    category: '节日庆典',
    description: '日本春天欣赏樱花的传统活动',
    content: '樱花节是日本的传统节日，人们会在樱花树下野餐、赏花。樱花象征着生命的短暂与美丽，教导人们珍惜当下。',
    traditions: ['赏樱', '野餐', '樱花祭典', '和服出游'],
    food: ['樱花饼', '清酒', '饭团'],
    icon: '🌸',
    points: 10
  },
  {
    id: 'culture-thanksgiving',
    title: '感恩节',
    country: '美国',
    category: '节日庆典',
    description: '美国感谢丰收和祝福的节日',
    content: '感恩节是美国传统节日，人们会与家人团聚，一起吃火鸡大餐，感谢一年的收获和祝福。',
    traditions: ['吃火鸡', '家庭聚餐', '橄榄球比赛', '黑色星期五购物'],
    food: ['火鸡', '南瓜派', '红薯', '玉米'],
    icon: '🦃',
    points: 10
  },
  {
    id: 'culture-diwali',
    title: '排灯节',
    country: '印度',
    category: '节日庆典',
    description: '印度最重要的光明节',
    content: '排灯节是印度教最盛大的节日之一，象征着光明战胜黑暗、善良战胜邪恶。人们会点燃油灯、燃放烟花、交换礼物。',
    traditions: ['点油灯', '燃放烟花', '交换礼物', '打扫房屋'],
    food: ['印度甜点', '炸物', '奶茶'],
    icon: '🪔',
    points: 10
  },
  {
    id: 'culture-french-cuisine',
    title: '法国美食文化',
    country: '法国',
    category: '美食文化',
    description: '世界著名的法国料理文化',
    content: '法国美食文化是世界文化遗产，以其精致的烹饪技艺和独特的风味闻名。法国人讲究用餐礼仪，享受美食是生活的重要组成部分。',
    traditions: ['慢慢用餐', '品尝葡萄酒', '新鲜食材', '烹饪艺术'],
    food: ['法棍', '奶酪', '蜗牛', '鹅肝', '马卡龙'],
    icon: '🥐',
    points: 10
  },
  {
    id: 'culture-italian-pizza',
    title: '意大利披萨文化',
    country: '意大利',
    category: '美食文化',
    description: '源自意大利的世界美食',
    content: '披萨是意大利最著名的美食之一，起源于那不勒斯。真正的意大利披萨使用新鲜食材和传统的砖窑烤制。',
    traditions: ['新鲜食材', '传统烤制', '分享美食', '家庭聚餐'],
    food: ['玛格丽特披萨', '四季披萨', '意面', '意式浓缩咖啡'],
    icon: '🍕',
    points: 10
  },
  {
    id: 'culture-korean-wave',
    title: '韩流文化',
    country: '韩国',
    category: '流行文化',
    description: '韩国流行文化的全球影响',
    content: '韩流是指韩国流行文化的国际影响力，包括韩剧、K-pop、韩国电影、韩国美食等。韩国文化注重礼仪和传统与现代的结合。',
    traditions: ['K-pop', '韩剧', '韩国料理', '泡菜文化'],
    food: ['泡菜', '烤肉', '拌饭', '参鸡汤'],
    icon: '🇰🇷',
    points: 10
  },
  {
    id: 'culture-brazil-carnival',
    title: '巴西狂欢节',
    country: '巴西',
    category: '节日庆典',
    description: '世界上最大的狂欢节',
    content: '巴西狂欢节是世界上最大、最热闹的狂欢节，象征着热情、活力和桑巴音乐的灵魂。人们会穿着华丽的服装，跳着桑巴舞。',
    traditions: ['桑巴舞', '花车游行', '盛装狂欢', '街头派对'],
    food: ['巴西烤肉', '凯文史三明治', '热带水果'],
    icon: '💃',
    points: 10
  }
]

// 地理知识库
const geographyFacts = [
  {
    id: 'geo-1',
    title: '世界七大洲',
    content: '地球上有七大洲：亚洲、非洲、北美洲、南美洲、欧洲、大洋洲和南极洲。',
    category: '地理概念',
    ageRange: '6-8',
    points: 5
  },
  {
    id: 'geo-2',
    title: '什么是经纬线？',
    content: '经线是连接南北极的线，纬线是环绕地球的线。经纬度帮助我们确定地球上的任何位置。',
    category: '地理概念',
    ageRange: '8-10',
    points: 8
  },
  {
    id: 'geo-3',
    title: '世界最高峰',
    content: '珠穆朗玛峰是世界最高峰，海拔8848米，位于喜马拉雅山脉，是中国和尼泊尔的边界。',
    category: '地形地貌',
    ageRange: '6-10',
    points: 8
  },
  {
    id: 'geo-4',
    title: '热带雨林',
    content: '亚马逊雨林是世界上最大的热带雨林，被称为"地球之肺"，生产了全球20%的氧气。',
    category: '地形地貌',
    ageRange: '7-12',
    points: 10
  },
  {
    id: 'geo-5',
    title: '世界最大海洋',
    content: '太平洋是世界上最大的海洋，面积约1.65亿平方公里，比所有陆地加起来还要大。',
    category: '地理概念',
    ageRange: '6-10',
    points: 8
  },
  {
    id: 'geo-6',
    title: '什么是时区？',
    content: '时区是地球上使用同一时间的区域。由于地球自转，世界被分为24个时区，每隔15度换一个时区。',
    category: '地理概念',
    ageRange: '9-12',
    points: 10
  },
  {
    id: 'geo-7',
    title: '极地地区',
    content: '北极和南极是地球上最冷的地区。北极是冰雪覆盖的海洋，南极是冰雪覆盖的大陆。',
    category: '地形地貌',
    ageRange: '6-10',
    points: 8
  },
  {
    id: 'geo-8',
    title: '世界最长河流',
    content: '尼罗河是世界最长的河流，全长约6650公里，流经非洲东北部，最终注入地中海。',
    category: '地形地貌',
    ageRange: '7-12',
    points: 10
  },
  {
    id: 'geo-9',
    title: '什么是气候带？',
    content: '地球上有热带、温带和寒带三个主要气候带。赤道附近是热带，两极附近是寒带，中间是温带。',
    category: '气候',
    ageRange: '8-12',
    points: 10
  },
  {
    id: 'geo-10',
    title: '世界面积最大的国家',
    content: '俄罗斯是世界面积最大的国家，横跨欧亚两个大洲，面积约1709万平方公里。',
    category: '国家地理',
    ageRange: '6-10',
    points: 8
  },
  {
    id: 'geo-11',
    title: '沙漠生态系统',
    content: '沙漠是年降水量极少的地方，但沙漠中也有独特的动植物适应了干旱环境，如仙人掌和骆驼。',
    category: '生态系统',
    ageRange: '8-12',
    points: 10
  },
  {
    id: 'geo-12',
    title: '什么是人口密度？',
    content: '人口密度是指每平方公里居住的人口数量。城市人口密度高，农村人口密度低。',
    category: '人文地理',
    ageRange: '9-12',
    points: 10
  }
]

// 语言学习内容
const languageContent = [
  {
    id: 'lang-english',
    language: '英语',
    greeting: 'Hello!',
    thankYou: 'Thank you!',
    goodbye: 'Goodbye!',
    numbers: ['One', 'Two', 'Three', 'Four', 'Five'],
    basics: ['Yes', 'No', 'Please', 'Sorry', 'Help'],
    progress: 0
  },
  {
    id: 'lang-chinese',
    language: '中文',
    greeting: '你好！',
    thankYou: '谢谢！',
    goodbye: '再见！',
    numbers: ['一', '二', '三', '四', '五'],
    basics: ['是', '不', '请', '对不起', '帮助'],
    progress: 0
  },
  {
    id: 'lang-japanese',
    language: '日语',
    greeting: 'こんにちは！',
    thankYou: 'ありがとう！',
    goodbye: 'さようなら！',
    numbers: ['一', '二', '三', '四', '五'],
    basics: ['はい', 'いいえ', 'お願いします', 'ごめんなさい', '助けて'],
    progress: 0
  },
  {
    id: 'lang-spanish',
    language: '西班牙语',
    greeting: '¡Hola!',
    thankYou: '¡Gracias!',
    goodbye: '¡Adiós!',
    numbers: ['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco'],
    basics: ['Sí', 'No', 'Por favor', 'Lo siento', 'Ayuda'],
    progress: 0
  },
  {
    id: 'lang-french',
    language: '法语',
    greeting: 'Bonjour!',
    thankYou: 'Merci!',
    goodbye: 'Au revoir!',
    numbers: ['Un', 'Deux', 'Trois', 'Quatre', 'Cinq'],
    basics: ['Oui', 'Non', "S'il vous plaît", 'Pardon', 'Aide'],
    progress: 0
  }
]

// 国际笔友
const penPalTemplates = [
  {
    id: 'penpal-1',
    name: 'Emma',
    country: '英国',
    age: 10,
    interests: ['Reading', 'Piano', 'Drawing'],
    language: 'English',
    level: 'Intermediate'
  },
  {
    id: 'penpal-2',
    name: 'Takeshi',
    country: '日本',
    age: 11,
    interests: ['Soccer', 'Video Games', 'Animals'],
    language: 'Japanese',
    level: 'Beginner'
  },
  {
    id: 'penpal-3',
    name: 'Marie',
    country: '法国',
    age: 10,
    interests: ['Ballet', 'Cooking', 'Nature'],
    language: 'French',
    level: 'Intermediate'
  },
  {
    id: 'penpal-4',
    name: 'Carlos',
    country: '西班牙',
    age: 11,
    interests: ['Football', 'Music', 'Swimming'],
    language: 'Spanish',
    level: 'Beginner'
  },
  {
    id: 'penpal-5',
    name: 'Sophie',
    country: '德国',
    age: 10,
    interests: ['Science', 'Biking', 'Art'],
    language: 'German',
    level: 'Beginner'
  }
]

// 徽章定义
const badgeDefinitions = {
  'world-traveler': { name: '环球旅行家', icon: '🌍', description: '访问5个国家' },
  'culture-explorer': { name: '文化探索者', icon: '🗺️', description: '探索10种文化' },
  'geography-master': { name: '地理大师', icon: '📚', description: '学习20个地理知识' },
  'language-learner': { name: '语言学习者', icon: '🗣️', description: '开始学习一门新语言' },
  'pen-pal-friend': { name: '笔友之友', icon: '✉️', description: '交到3个国际笔友' },
  'culture-ambassador': { name: '文化大使', icon: '🎭', description: '了解20个国家文化' }
}

export default {
  // 获取所有数据
  getData() {
    return getLocalData()
  },

  // ==================== 环球旅行 ====================

  // 获取所有目的地
  getDestinations() {
    return tourDestinations
  },

  // 获取目的地详情
  getDestination(id) {
    return tourDestinations.find(d => d.id === id)
  },

  // 按大洲获取目的地
  getDestinationsByContinent(continent) {
    if (continent === '全部') return tourDestinations
    return tourDestinations.filter(d => d.continent === continent)
  },

  // 获取已访问的国家
  getVisitedCountries() {
    const data = getLocalData()
    return data.checkins.map(c => c.country)
  },

  // 旅行打卡
  checkin(destinationId) {
    const data = getLocalData()
    const destination = tourDestinations.find(d => d.id === destinationId)
    if (!destination) return null

    // 检查是否已打卡
    const existing = data.checkins.find(c => c.destinationId === destinationId)
    if (existing) return existing

    // 创建打卡记录
    const checkin = {
      destinationId,
      country: destination.country,
      city: destination.city,
      continent: destination.continent,
      checkinTime: new Date().toISOString(),
      points: destination.points
    }

    data.checkins.push(checkin)
    data.userStats.countriesVisited = data.checkins.length
    data.userStats.totalPoints += destination.points

    this.checkAndAwardBadges(data)
    saveData(data)
    return checkin
  },

  // 获取打卡记录
  getCheckins() {
    return getLocalData().checkins
  },

  // ==================== 文化发现 ====================

  // 获取文化内容
  getCultures(category = null) {
    if (category) {
      return cultureContent.filter(c => c.category === category)
    }
    return cultureContent
  },

  // 获取文化分类
  getCultureCategories() {
    return [...new Set(cultureContent.map(c => c.category))]
  },

  // 获取单个文化内容
  getCulture(id) {
    return cultureContent.find(c => c.id === id)
  },

  // 学习文化
  learnCulture(cultureId) {
    const data = getLocalData()
    if (!data.cultures.includes(cultureId)) {
      data.cultures.push(cultureId)
      const culture = cultureContent.find(c => c.id === cultureId)
      if (culture) {
        data.userStats.totalPoints += culture.points
        data.userStats.culturesExplored = data.cultures.length
      }
      this.checkAndAwardBadges(data)
      saveData(data)
    }
    return true
  },

  // 获取已学习的文化
  getLearnedCultures() {
    return getLocalData().cultures
  },

  // ==================== 地理知识 ====================

  // 获取地理知识
  getGeographyFacts(category = null) {
    if (category) {
      return geographyFacts.filter(f => f.category === category)
    }
    return geographyFacts
  },

  // 获取地理分类
  getGeographyCategories() {
    return [...new Set(geographyFacts.map(f => f.category))]
  },

  // 学习地理知识
  learnGeographyFact(factId) {
    const data = getLocalData()
    if (!data.learnedFacts.includes(factId)) {
      data.learnedFacts.push(factId)
      const fact = geographyFacts.find(f => f.id === factId)
      if (fact) {
        data.userStats.totalPoints += fact.points
        data.userStats.factsLearned = data.learnedFacts.length
      }
      this.checkAndAwardBadges(data)
      saveData(data)
    }
    return true
  },

  // 获取已学习的知识
  getLearnedFacts() {
    return getLocalData().learnedFacts
  },

  // 获取地理知识测试
  getGeographyQuiz() {
    return [
      {
        id: 'quiz-geo-1',
        question: '世界最高峰是什么？',
        options: [
          { text: '珠穆朗玛峰', correct: true },
          { text: '乔戈里峰', correct: false },
          { text: '干城章嘉峰', correct: false },
          { text: '马卡鲁峰', correct: false }
        ],
        explanation: '珠穆朗玛峰海拔8848米，是世界第一高峰。'
      },
      {
        id: 'quiz-geo-2',
        question: '地球上有几个大洲？',
        options: [
          { text: '5个', correct: false },
          { text: '6个', correct: false },
          { text: '7个', correct: true },
          { text: '8个', correct: false }
        ],
        explanation: '地球上有七大洲：亚洲、非洲、北美洲、南美洲、欧洲、大洋洲和南极洲。'
      },
      {
        id: 'quiz-geo-3',
        question: '世界最大洋是什么？',
        options: [
          { text: '大西洋', correct: false },
          { text: '印度洋', correct: false },
          { text: '太平洋', correct: true },
          { text: '北冰洋', correct: false }
        ],
        explanation: '太平洋是世界上最大的海洋，面积约1.65亿平方公里。'
      },
      {
        id: 'quiz-geo-4',
        question: '哪个国家被称为"地球之肺"？',
        options: [
          { text: '刚果', correct: false },
          { text: '巴西', correct: true },
          { text: '中国', correct: false },
          { text: '印度', correct: false }
        ],
        explanation: '亚马逊雨林位于巴西，被称为"地球之肺"，产生大量氧气。'
      },
      {
        id: 'quiz-geo-5',
        question: '世界上最长的河流是？',
        options: [
          { text: '亚马逊河', correct: false },
          { text: '长江', correct: false },
          { text: '尼罗河', correct: true },
          { text: '密西西比河', correct: false }
        ],
        explanation: '尼罗河全长约6650公里，是世界上最长的河流。'
      }
    ]
  },

  // ==================== 语言学习 ====================

  // 获取语言列表
  getLanguages() {
    const data = getLocalData()
    return languageContent.map(lang => ({
      ...lang,
      progress: data.languageProgress[lang.id] || 0
    }))
  },

  // 更新语言进度
  updateLanguageProgress(languageId, progress) {
    const data = getLocalData()
    data.languageProgress[languageId] = progress
    if (progress > 0 && data.userStats.languagesStarted === 0) {
      data.userStats.languagesStarted = Object.values(data.languageProgress).filter(p => p > 0).length
      this.checkAndAwardBadges(data)
    }
    saveData(data)
    return progress
  },

  // 学习语言基础
  learnLanguageBasics(languageId) {
    const data = getLocalData()
    const currentProgress = data.languageProgress[languageId] || 0
    data.languageProgress[languageId] = Math.min(currentProgress + 10, 100)
    this.checkAndAwardBadges(data)
    saveData(data)
    return data.languageProgress[languageId]
  },

  // ==================== 国际笔友 ====================

  // 获取笔友列表
  getPenPals() {
    const data = getLocalData()
    // 返回已添加的笔友
    return data.penPals
  },

  // 添加笔友
  addPenPal(palTemplateId) {
    const data = getLocalData()
    const template = penPalTemplates.find(p => p.id === palTemplateId)
    if (!template) return null

    // 检查是否已添加
    const existing = data.penPals.find(p => p.templateId === palTemplateId)
    if (existing) return existing

    const penPal = {
      ...template,
      templateId: palTemplateId,
      addedTime: new Date().toISOString(),
      messages: [],
      totalLetters: 0
    }

    data.penPals.push(penPal)
    data.userStats.penPalsCount = data.penPals.length
    this.checkAndAwardBadges(data)
    saveData(data)
    return penPal
  },

  // 获取推荐笔友
  getRecommendedPenPals() {
    const data = getLocalData()
    const addedIds = data.penPals.map(p => p.templateId)
    return penPalTemplates.filter(p => !addedIds.includes(p.id))
  },

  // 发送信件
  sendLetter(palId, content) {
    const data = getLocalData()
    const pal = data.penPals.find(p => p.id === palId)
    if (!pal) return null

    const letter = {
      id: `letter-${Date.now()}`,
      from: 'me',
      content,
      time: new Date().toISOString(),
      read: true
    }

    pal.messages.push(letter)
    pal.totalLetters++
    saveData(data)
    return letter
  },

  // ==================== 用户统计 ====================

  // 获取用户统计
  getUserStats() {
    return getLocalData().userStats
  },

  // 更新统计
  updateStats(type, value) {
    const data = getLocalData()
    if (data.userStats[type] !== undefined) {
      data.userStats[type] += value
      saveData(data)
    }
    return data.userStats
  },

  // ==================== 徽章 ====================

  // 获取徽章
  getBadges() {
    const data = getLocalData()
    return data.badges
  },

  // 检查并授予徽章
  checkAndAwardBadges(data) {
    const { userStats } = data

    // 环球旅行家 - 访问5个国家
    if (userStats.countriesVisited >= 5 && !data.badges.find(b => b.id === 'world-traveler')) {
      data.badges.push({ id: 'world-traveler', ...badgeDefinitions['world-traveler'], earnedTime: new Date().toISOString() })
    }

    // 文化探索者 - 探索10种文化
    if (userStats.culturesExplored >= 10 && !data.badges.find(b => b.id === 'culture-explorer')) {
      data.badges.push({ id: 'culture-explorer', ...badgeDefinitions['culture-explorer'], earnedTime: new Date().toISOString() })
    }

    // 地理大师 - 学习20个地理知识
    if (userStats.factsLearned >= 20 && !data.badges.find(b => b.id === 'geography-master')) {
      data.badges.push({ id: 'geography-master', ...badgeDefinitions['geography-master'], earnedTime: new Date().toISOString() })
    }

    // 语言学习者 - 开始学习一门新语言
    if (userStats.languagesStarted >= 1 && !data.badges.find(b => b.id === 'language-learner')) {
      data.badges.push({ id: 'language-learner', ...badgeDefinitions['language-learner'], earnedTime: new Date().toISOString() })
    }

    // 笔友之友 - 交到3个国际笔友
    if (userStats.penPalsCount >= 3 && !data.badges.find(b => b.id === 'pen-pal-friend')) {
      data.badges.push({ id: 'pen-pal-friend', ...badgeDefinitions['pen-pal-friend'], earnedTime: new Date().toISOString() })
    }

    // 文化大使 - 了解20个国家文化
    if (data.checkins.length >= 20 && !data.badges.find(b => b.id === 'culture-ambassador')) {
      data.badges.push({ id: 'culture-ambassador', ...badgeDefinitions['culture-ambassador'], earnedTime: new Date().toISOString() })
    }
  },

  // 获取徽章定义
  getBadgeDefinitions() {
    return badgeDefinitions
  },

  // 清空所有数据
  clearAllData() {
    uni.removeStorageSync(STORAGE_KEY)
    return true
  }
}
