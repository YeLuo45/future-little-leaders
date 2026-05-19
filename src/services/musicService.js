/**
 * V66 Music & Rhythm Service
 * 音乐与节奏服务 - 音乐欣赏、节奏游戏、乐器认知
 */

// Storage keys
const MUSIC_APPRECIATION_KEY = 'music_appreciation'
const RHYTHM_GAMES_KEY = 'rhythm_games'
const INSTRUMENTS_KEY = 'music_instruments'
const MUSIC_RECORDS_KEY = 'music_records'

// ==================== 音乐欣赏常量 ====================

export const MUSIC_CATEGORIES = {
  CLASSICAL: { id: 'classical', name: '古典音乐', icon: '🎻', color: '#9B59B6' },
  CHILDREN: { id: 'children', name: '儿歌', icon: '🎵', color: '#3498DB' },
  FOLK: { id: 'folk', name: '民乐', icon: '🎷', color: '#E74C3C' },
  WORLD: { id: 'world', name: '世界音乐', icon: '🌍', color: '#1ABC9C' },
  LULLABY: { id: 'lullaby', name: '摇篮曲', icon: '🌙', color: '#9B59B6' }
}

export const MUSIC_GENRES = {
  SYMPHONY: 'symphony',
  PIANO: 'piano',
  VIOLIN: 'violin',
  ORCHESTRA: 'orchestra',
  NURSERY: 'nursery',
  FOLKSONG: 'folksong',
  TRADITIONAL: 'traditional'
}

// ==================== 乐器家族常量 ====================

export const INSTRUMENT_FAMILIES = {
  STRINGS: { id: 'strings', name: '弦乐', icon: '🎻', color: '#E74C3C' },
  WOODWIND: { id: 'woodwind', name: '木管', icon: '🎵', color: '#3498DB' },
  BRASS: { id: 'brass', name: '铜管', icon: '🎺', color: '#F39C12' },
  PERCUSSION: { id: 'percussion', name: '打击乐', icon: '🥁', color: '#1ABC9C' },
  KEYBOARD: { id: 'keyboard', name: '键盘', icon: '🎹', color: '#9B59B6' },
  VOICE: { id: 'voice', name: '声乐', icon: '🎤', color: '#E91E63' },
  FOLK: { id: 'folk', name: '民族乐器', icon: '🪕', color: '#2ECC71' }
}

// ==================== 节奏游戏难度 ====================

export const RHYTHM_DIFFICULTIES = {
  EASY: { id: 'easy', name: '简单', bpm: 60, speed: 1.0, color: '#2ECC71' },
  MEDIUM: { id: 'medium', name: '中等', bpm: 90, speed: 1.2, color: '#F39C12' },
  HARD: { id: 'hard', name: '困难', bpm: 120, speed: 1.5, color: '#E74C3C' }
}

// ==================== 内置音乐库 ====================

export const getMusicLibrary = () => {
  try {
    const data = uni.getStorageSync(MUSIC_APPRECIATION_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getMusicLibrary error:', e)
  }
  return getDefaultMusicLibrary()
}

export const getDefaultMusicLibrary = () => [
  // 古典音乐
  {
    id: 'music_1',
    title: '小星星变奏曲',
    composer: '莫扎特',
    category: MUSIC_CATEGORIES.CLASSICAL.id,
    genre: MUSIC_GENRES.PIANO,
    duration: 180,
    cover: '/static/images/music-stars.jpg',
    description: '根据英国民谣《闪烁的小星星》改编的钢琴变奏曲',
    tags: ['钢琴', '变奏曲', '入门级'],
    difficulty: 1,
    mood: ['欢快', '明亮'],
    suitableAge: '3-6岁'
  },
  {
    id: 'music_2',
    title: '土耳其进行曲',
    composer: '莫扎特',
    category: MUSIC_CATEGORIES.CLASSICAL.id,
    genre: MUSIC_GENRES.PIANO,
    duration: 240,
    cover: '/static/images/music-turkey.jpg',
    description: '充满活力和童趣的古典钢琴名曲',
    tags: ['钢琴', '进行曲', '节奏明快'],
    difficulty: 2,
    mood: ['活泼', '欢快'],
    suitableAge: '4-8岁'
  },
  {
    id: 'music_3',
    title: '四季 - 春',
    composer: '维瓦尔第',
    category: MUSIC_CATEGORIES.CLASSICAL.id,
    genre: MUSIC_GENRES.ORCHESTRA,
    duration: 300,
    cover: '/static/images/music-spring.jpg',
    description: '用音乐描绘春天生机勃勃的景象',
    tags: ['交响乐', '协奏曲', '春天'],
    difficulty: 2,
    mood: ['欢快', '明媚'],
    suitableAge: '5-10岁'
  },
  // 儿歌
  {
    id: 'music_4',
    title: '小星星',
    composer: '英国民谣',
    category: MUSIC_CATEGORIES.CHILDREN.id,
    genre: MUSIC_GENRES.NURSERY,
    duration: 90,
    cover: '/static/images/music-star.jpg',
    description: '经典的中英双语儿歌',
    tags: ['经典', '双语', '认知'],
    difficulty: 1,
    mood: ['温馨', '可爱'],
    suitableAge: '0-6岁'
  },
  {
    id: 'music_5',
    title: '两只老虎',
    composer: '法国民谣',
    category: MUSIC_CATEGORIES.CHILDREN.id,
    genre: MUSIC_GENRES.NURSERY,
    duration: 60,
    cover: '/static/images/music-tiger.jpg',
    description: '节奏简单有趣的动物认知儿歌',
    tags: ['动物', '认知', '节奏'],
    difficulty: 1,
    mood: ['活泼', '有趣'],
    suitableAge: '1-5岁'
  },
  {
    id: 'music_6',
    title: '童年',
    composer: '罗大佑',
    category: MUSIC_CATEGORIES.CHILDREN.id,
    genre: MUSIC_GENRES.FOLKSONG,
    duration: 270,
    cover: '/static/images/music-childhood.jpg',
    description: '描述童年美好时光的经典中文歌曲',
    tags: ['中文', '成长', '回忆'],
    difficulty: 2,
    mood: ['温馨', '怀旧'],
    suitableAge: '6-12岁'
  },
  // 民乐
  {
    id: 'music_7',
    title: '彩云追月',
    composer: '任光',
    category: MUSIC_CATEGORIES.FOLK.id,
    genre: MUSIC_GENRES.TRADITIONAL,
    duration: 210,
    cover: '/static/images/music-moon.jpg',
    description: '优美典雅的中国民族管弦乐作品',
    tags: ['民乐', '管弦', '意境'],
    difficulty: 2,
    mood: ['优美', '宁静'],
    suitableAge: '5-12岁'
  },
  {
    id: 'music_8',
    title: '金蛇狂舞',
    composer: '聂耳',
    category: MUSIC_CATEGORIES.FOLK.id,
    genre: MUSIC_GENRES.TRADITIONAL,
    duration: 180,
    cover: '/static/images/music-snake.jpg',
    description: '欢快热烈的民族打击乐合奏',
    tags: ['民乐', '节日', '热烈'],
    difficulty: 2,
    mood: ['热烈', '喜庆'],
    suitableAge: '4-10岁'
  },
  // 摇篮曲
  {
    id: 'music_9',
    title: '摇篮曲',
    composer: '勃拉姆斯',
    category: MUSIC_CATEGORIES.LULLABY.id,
    genre: MUSIC_GENRES.PIANO,
    duration: 180,
    cover: '/static/images/music-lullaby.jpg',
    description: '柔和安宁的经典摇篮曲',
    tags: ['催眠', '安眠', '经典'],
    difficulty: 1,
    mood: ['安静', '柔和'],
    suitableAge: '0-6岁'
  },
  {
    id: 'music_10',
    title: '小毛驴',
    composer: '儿童民谣',
    category: MUSIC_CATEGORIES.CHILDREN.id,
    genre: MUSIC_GENRES.NURSERY,
    duration: 75,
    cover: '/static/images/music-donkey.jpg',
    description: '有趣的动物认知儿歌',
    tags: ['动物', '认知', '趣味'],
    difficulty: 1,
    mood: ['活泼', '可爱'],
    suitableAge: '1-5岁'
  }
]

// ==================== 乐器库 ====================

export const getInstrumentsLibrary = () => {
  try {
    const data = uni.getStorageSync(INSTRUMENTS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getInstrumentsLibrary error:', e)
  }
  return getDefaultInstrumentsLibrary()
}

export const getDefaultInstrumentsLibrary = () => [
  // 弦乐
  {
    id: 'inst_1',
    name: '小提琴',
    family: INSTRUMENT_FAMILIES.STRINGS.id,
    icon: '🎻',
    description: '弦乐中高音域的代表乐器，音色优美细腻',
    sound: '悠扬细腻',
    difficulty: 4,
    ageRange: '5岁以上',
    funFact: '小提琴有四根弦，从粗到细分别是G、D、A、E'
  },
  {
    id: 'inst_2',
    name: '大提琴',
    family: INSTRUMENT_FAMILIES.STRINGS.id,
    icon: '🎻',
    description: '弦乐中低音域的代表，音色深沉温暖',
    sound: '深沉温暖',
    difficulty: 4,
    ageRange: '6岁以上',
    funFact: '大提琴演奏者需要坐着演奏，琴身比小提琴大很多'
  },
  {
    id: 'inst_3',
    name: '吉他',
    family: INSTRUMENT_FAMILIES.STRINGS.id,
    icon: '🎸',
    description: '既能弹奏和弦又能演奏旋律的流行乐器',
    sound: '温暖多变',
    difficulty: 3,
    ageRange: '6岁以上',
    funFact: '吉他有6根弦，最粗的弦发出的声音最低沉'
  },
  // 木管
  {
    id: 'inst_4',
    name: '长笛',
    family: INSTRUMENT_FAMILIES.WOODWIND.id,
    icon: '🎵',
    description: '木管乐器的代表，音色清澈明亮',
    sound: '清澈明亮',
    difficulty: 3,
    ageRange: '7岁以上',
    funFact: '长笛是金属做的，但属于木管乐器家族哦'
  },
  {
    id: 'inst_5',
    name: '单簧管',
    family: INSTRUMENT_FAMILIES.WOODWIND.id,
    icon: '🎵',
    description: '也称为黑管，音色丰富表现力强',
    sound: '浑厚圆润',
    difficulty: 3,
    ageRange: '7岁以上',
    funFact: '单簧管只有一个簧片，靠振动发声'
  },
  // 铜管
  {
    id: 'inst_6',
    name: '小号',
    family: INSTRUMENT_FAMILIES.BRASS.id,
    icon: '🎺',
    description: '铜管乐器中高音代表，声音明亮有力',
    sound: '明亮有力',
    difficulty: 3,
    ageRange: '8岁以上',
    funFact: '小号是铜管家族中音域最高的乐器'
  },
  {
    id: 'inst_7',
    name: '圆号',
    family: INSTRUMENT_FAMILIES.BRASS.id,
    icon: '🎺',
    description: '铜管与木管的结合，音色柔和雄壮',
    sound: '柔和雄壮',
    difficulty: 4,
    ageRange: '8岁以上',
    funFact: '圆号也叫法国号，是交响乐团中人数最多的乐器'
  },
  // 打击乐
  {
    id: 'inst_8',
    name: '架子鼓',
    family: INSTRUMENT_FAMILIES.PERCUSSION.id,
    icon: '🥁',
    description: '节奏的支柱，为音乐提供律动',
    sound: '节奏强劲',
    difficulty: 3,
    ageRange: '5岁以上',
    funFact: '一套架子鼓通常包括底鼓、军鼓、踩镲和通鼓'
  },
  {
    id: 'inst_9',
    name: '铃鼓',
    family: INSTRUMENT_FAMILIES.PERCUSSION.id,
    icon: '🪘',
    description: '古老而有趣的打击乐器，适合低龄儿童',
    sound: '清脆悦耳',
    difficulty: 1,
    ageRange: '3岁以上',
    funFact: '铃鼓的边缘镶嵌着小金属片，摇动时会发出清脆的声音'
  },
  // 键盘
  {
    id: 'inst_10',
    name: '钢琴',
    family: INSTRUMENT_FAMILIES.KEYBOARD.id,
    icon: '🎹',
    description: '乐器之王，能演奏丰富多样的音乐',
    sound: '音域宽广',
    difficulty: 5,
    ageRange: '4岁以上',
    funFact: '钢琴有88个琴键，其中52个白键和36个黑键'
  },
  {
    id: 'inst_11',
    name: '电子琴',
    family: INSTRUMENT_FAMILIES.KEYBOARD.id,
    icon: '🎹',
    description: '功能多样的键盘乐器，可以模仿各种音色',
    sound: '丰富多变',
    difficulty: 2,
    ageRange: '4岁以上',
    funFact: '电子琴可以模仿钢琴、小提琴、甚至宇宙的声音'
  },
  // 声乐
  {
    id: 'inst_12',
    name: '人声',
    family: INSTRUMENT_FAMILIES.VOICE.id,
    icon: '🎤',
    description: '最自然最美的乐器，分为童声、男声、女声',
    sound: '情感丰富',
    difficulty: 2,
    ageRange: '不限',
    funFact: '每个人的声音都是独一无二的，就像指纹一样'
  },
  // 民乐
  {
    id: 'inst_13',
    name: '二胡',
    family: INSTRUMENT_FAMILIES.FOLK.id,
    icon: '🪕',
    description: '中国代表性的弦乐器，音色富有表现力',
    sound: '婉转悠扬',
    difficulty: 4,
    ageRange: '6岁以上',
    funFact: '二胡只有两根弦，却能表达喜怒哀乐各种情感'
  },
  {
    id: 'inst_14',
    name: '琵琶',
    family: INSTRUMENT_FAMILIES.FOLK.id,
    icon: '🪕',
    description: '中国古典弹拨乐器，技法丰富多样',
    sound: '颗粒分明',
    difficulty: 4,
    ageRange: '6岁以上',
    funFact: '琵琶的演奏技巧非常丰富，有「嘈嘈切切错杂弹」之说'
  },
  {
    id: 'inst_15',
    name: '古筝',
    family: INSTRUMENT_FAMILIES.FOLK.id,
    icon: '🪕',
    description: '中国古老的弦乐器，音色优美典雅',
    sound: '余音绕梁',
    difficulty: 3,
    ageRange: '5岁以上',
    funFact: '古筝有21根弦，音域宽广，表现力丰富'
  }
]

// ==================== 节奏游戏 ====================

export const getRhythmGames = () => {
  try {
    const data = uni.getStorageSync(RHYTHM_GAMES_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getRhythmGames error:', e)
  }
  return getDefaultRhythmGames()
}

export const getDefaultRhythmGames = () => [
  {
    id: 'rhythm_1',
    title: '节拍大师',
    description: '跟随节拍点击屏幕，训练节奏感',
    difficulty: RHYTHM_DIFFICULTIES.EASY.id,
    bpm: 60,
    duration: 60,
    cover: '/static/images/rhythm-master.jpg',
    icon: '🎯',
    maxScore: 100,
    isUnlocked: true,
    playCount: 0
  },
  {
    id: 'rhythm_2',
    title: '鼓点达人',
    description: '敲击鼓点，感受节奏的乐趣',
    difficulty: RHYTHM_DIFFICULTIES.EASY.id,
    bpm: 80,
    duration: 90,
    cover: '/static/images/rhythm-drum.jpg',
    icon: '🥁',
    maxScore: 100,
    isUnlocked: true,
    playCount: 0
  },
  {
    id: 'rhythm_3',
    title: '音乐打击',
    description: '跟随音乐节拍进行打击乐练习',
    difficulty: RHYTHM_DIFFICULTIES.MEDIUM.id,
    bpm: 100,
    duration: 120,
    cover: '/static/images/rhythm-beat.jpg',
    icon: '🎵',
    maxScore: 100,
    isUnlocked: false,
    unlockLevel: 5,
    playCount: 0
  },
  {
    id: 'rhythm_4',
    title: '节拍训练营',
    description: '系统学习节拍知识，循序渐进',
    difficulty: RHYTHM_DIFFICULTIES.MEDIUM.id,
    bpm: 90,
    duration: 180,
    cover: '/static/images/rhythm-train.jpg',
    icon: '📚',
    maxScore: 100,
    isUnlocked: false,
    unlockLevel: 10,
    playCount: 0
  },
  {
    id: 'rhythm_5',
    title: '节奏挑战',
    description: '高难度节奏挑战，考验极限',
    difficulty: RHYTHM_DIFFICULTIES.HARD.id,
    bpm: 120,
    duration: 120,
    cover: '/static/images/rhythm-challenge.jpg',
    icon: '🏆',
    maxScore: 100,
    isUnlocked: false,
    unlockLevel: 15,
    playCount: 0
  }
]

// ==================== 音乐知识 ====================

export const getMusicKnowledge = () => [
  {
    id: 'knowledge_1',
    title: '什么是节拍？',
    content: '节拍是音乐的骨架，像是心跳一样有规律地跳动。比如1-2-1-2这样反复的节奏就是节拍。',
    category: 'basics',
    icon: '💓'
  },
  {
    id: 'knowledge_2',
    title: '音的高低',
    content: '声音有高有低，就像爬山一样。音高高就像爬到山顶，声音尖尖的；音低就像在山脚，声音低低的。',
    category: 'basics',
    icon: '⛰️'
  },
  {
    id: 'knowledge_3',
    title: '什么是节奏？',
    content: '节奏是音乐中长短不同声音的组合，就像跳舞时的步伐，有快有慢，有轻有重。',
    category: 'basics',
    icon: '💃'
  },
  {
    id: 'knowledge_4',
    title: '认识乐器家族',
    content: '乐器分为四大家族：弦乐、木管、铜管和打击乐。每个家族都有自己的声音特点。',
    category: 'instruments',
    icon: '🎻'
  },
  {
    id: 'knowledge_5',
    title: '钢琴的由来',
    content: '钢琴发明于300多年前的意大利，最初叫「弱和强」，因为它可以弹出强弱不同的声音。',
    category: 'history',
    icon: '📜'
  }
]

// ==================== 辅助函数 ====================

function generateId(prefix = 'music') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`
}

function now() {
  return new Date().toISOString()
}

// ==================== 音乐记录 ====================

export const getMusicRecords = (babyId) => {
  try {
    const data = uni.getStorageSync(`${MUSIC_RECORDS_KEY}_${babyId}`)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getMusicRecords error:', e)
  }
  return []
}

export const addMusicRecord = (babyId, record) => {
  const records = getMusicRecords(babyId)
  const newRecord = {
    id: generateId('record'),
    ...record,
    babyId,
    createdAt: now()
  }
  records.unshift(newRecord)
  try {
    uni.setStorageSync(`${MUSIC_RECORDS_KEY}_${babyId}`, JSON.stringify(records))
  } catch (e) {
    console.error('addMusicRecord error:', e)
  }
  return newRecord
}

export const getMusicStats = (babyId) => {
  const records = getMusicRecords(babyId)
  const today = new Date().toISOString().split('T')[0]
  const todayRecords = records.filter(r => r.createdAt.startsWith(today))
  
  return {
    totalListening: records.filter(r => r.type === 'listen').length,
    totalGames: records.filter(r => r.type === 'game').length,
    totalInstruments: records.filter(r => r.type === 'instrument').length,
    todayListening: todayRecords.filter(r => r.type === 'listen').length,
    totalMinutes: Math.round(records.reduce((sum, r) => sum + (r.duration || 0), 0) / 60),
    favoriteCategory: getFavoriteCategory(records),
    favoriteInstrument: getFavoriteInstrument(records)
  }
}

function getFavoriteCategory(records) {
  const listenRecords = records.filter(r => r.type === 'listen')
  if (listenRecords.length === 0) return null
  const counts = {}
  listenRecords.forEach(r => {
    counts[r.category] = (counts[r.category] || 0) + 1
  })
  const max = Math.max(...Object.values(counts))
  return Object.keys(counts).find(k => counts[k] === max)
}

function getFavoriteInstrument(records) {
  const instRecords = records.filter(r => r.type === 'instrument')
  if (instRecords.length === 0) return null
  const counts = {}
  instRecords.forEach(r => {
    counts[r.instrumentId] = (counts[r.instrumentId] || 0) + 1
  })
  const max = Math.max(...Object.values(counts))
  return Object.keys(counts).find(k => counts[k] === max)
}

// ==================== 搜索过滤 ====================

export const filterMusic = (filters) => {
  const library = getMusicLibrary()
  return library.filter(music => {
    if (filters.category && music.category !== filters.category) return false
    if (filters.genre && music.genre !== filters.genre) return false
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase()
      if (!music.title.toLowerCase().includes(kw) && 
          !music.composer.toLowerCase().includes(kw) &&
          !music.description.toLowerCase().includes(kw)) {
        return false
      }
    }
    if (filters.mood && !music.mood.includes(filters.mood)) return false
    return true
  })
}

export const filterInstruments = (family) => {
  const library = getInstrumentsLibrary()
  if (!family) return library
  return library.filter(inst => inst.family === family)
}

export const getInstrumentsByFamily = () => {
  const library = getInstrumentsLibrary()
  const grouped = {}
  Object.values(INSTRUMENT_FAMILIES).forEach(family => {
    grouped[family.id] = {
      ...family,
      instruments: library.filter(inst => inst.family === family.id)
    }
  })
  return grouped
}
