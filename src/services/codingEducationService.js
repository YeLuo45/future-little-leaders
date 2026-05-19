/**
 * V59 Coding Education Service
 * 编程教育服务 - 图形化编程、代码块学习、编程挑战、创意编程项目
 */

// 存储键
const CODING_DATA_KEY = 'coding_data'
const VISUAL_BLOCKS_KEY = 'visual_blocks'
const CODE_CHALLENGES_KEY = 'code_challenges'
const CODING_PROJECTS_KEY = 'coding_projects'

// 编程块类型
export const BLOCK_TYPES = {
  EVENT: 'event',
  MOTION: 'motion',
  LOOKS: 'looks',
  SOUND: 'sound',
  CONTROL: 'control',
  VARIABLE: 'variable',
  OPERATOR: 'operator',
  SENSING: 'sensing'
}

// 难度等级
export const DIFFICULTY_LEVELS = {
  BEGINNER: 1,
  ELEMENTARY: 2,
  INTERMEDIATE: 3,
  ADVANCED: 4
}

// 图形化编程积木库
export const VISUAL_BLOCKS = [
  {
    id: 'block_001',
    type: BLOCK_TYPES.EVENT,
    name: '当绿旗被点击',
    icon: '🚩',
    color: '#4CAF50',
    description: '程序开始运行',
    category: 'event'
  },
  {
    id: 'block_002',
    type: BLOCK_TYPES.MOTION,
    name: '移动10步',
    icon: '➡️',
    color: '#2196F3',
    description: '向右移动指定的步数',
    category: 'motion'
  },
  {
    id: 'block_003',
    type: BLOCK_TYPES.MOTION,
    name: '旋转15度',
    icon: '🔄',
    color: '#2196F3',
    description: '顺时针旋转指定角度',
    category: 'motion'
  },
  {
    id: 'block_004',
    type: BLOCK_TYPES.LOOKS,
    name: '说你好！2秒',
    icon: '💬',
    color: '#9C27B0',
    description: '显示气泡对话框',
    category: 'looks'
  },
  {
    id: 'block_005',
    type: BLOCK_TYPES.CONTROL,
    name: '等待1秒',
    icon: '⏱️',
    color: '#FF9800',
    description: '暂停执行指定时间',
    category: 'control'
  },
  {
    id: 'block_006',
    type: BLOCK_TYPES.CONTROL,
    name: '重复10次',
    icon: '🔁',
    color: '#FF9800',
    description: '重复执行积木内的指令',
    category: 'control',
    hasLoop: true
  },
  {
    id: 'block_007',
    type: BLOCK_TYPES.CONTROL,
    name: '如果...那么',
    icon: '❓',
    color: '#FF9800',
    description: '条件判断',
    category: 'control',
    hasCondition: true
  },
  {
    id: 'block_008',
    type: BLOCK_TYPES.VARIABLE,
    name: '创建变量分数',
    icon: '📦',
    color: '#E91E63',
    description: '创建一个新的变量',
    category: 'variable'
  },
  {
    id: 'block_009',
    type: BLOCK_TYPES.VARIABLE,
    name: '将分数设为0',
    icon: '🔢',
    color: '#E91E63',
    description: '给变量赋值',
    category: 'variable'
  },
  {
    id: 'block_010',
    type: BLOCK_TYPES.OPERATOR,
    name: '1+1',
    icon: '➕',
    color: '#00BCD4',
    description: '数学运算',
    category: 'operator'
  },
  {
    id: 'block_011',
    type: BLOCK_TYPES.OPERATOR,
    name: '比较大小',
    icon: '⚖️',
    color: '#00BCD4',
    description: '比较两个数的大小',
    category: 'operator'
  },
  {
    id: 'block_012',
    type: BLOCK_TYPES.SENSING,
    name: '碰到边缘？',
    icon: '🖐️',
    color: '#00BCD4',
    description: '检测是否碰到边缘',
    category: 'sensing'
  }
]

// 代码块学习关卡
export const CODE_BLOCK_LEVELS = [
  {
    id: 'level_001',
    title: '变量入门',
    description: '学习创建和使用变量',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    blocks: [BLOCK_TYPES.VARIABLE],
    challenge: '创建一个变量"年龄"，并设置为10',
    hint: '使用"创建变量"和"将变量设为"积木',
    solution: { variable: '年龄', value: 10 },
    exp: 20,
    points: 50
  },
  {
    id: 'level_002',
    title: '循环基础',
    description: '学习使用重复执行',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    blocks: [BLOCK_TYPES.CONTROL, BLOCK_TYPES.MOTION],
    challenge: '让角色重复移动10步5次',
    hint: '将"移动"积木放入"重复"积木中',
    solution: { action: 'move', times: 5, steps: 10 },
    exp: 30,
    points: 80
  },
  {
    id: 'level_003',
    title: '条件判断',
    description: '学习如果...那么',
    difficulty: DIFFICULTY_LEVELS.ELEMENTARY,
    blocks: [BLOCK_TYPES.CONTROL, BLOCK_TYPES.SENSING],
    challenge: '如果碰到边缘，就反弹',
    hint: '使用"如果...那么"和"碰到边缘"积木',
    solution: { condition: 'edge', action: 'bounce' },
    exp: 40,
    points: 100
  },
  {
    id: 'level_004',
    title: '计算器',
    description: '实现一个简单计算器',
    difficulty: DIFFICULTY_LEVELS.ELEMENTARY,
    blocks: [BLOCK_TYPES.VARIABLE, BLOCK_TYPES.OPERATOR],
    challenge: '计算 5 + 3 并显示结果',
    hint: '使用变量存储结果，用运算符计算',
    solution: { operation: 'add', a: 5, b: 3, result: 8 },
    exp: 50,
    points: 120
  },
  {
    id: 'level_005',
    title: '猜数字游戏',
    description: '综合运用所学知识',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    blocks: [BLOCK_TYPES.VARIABLE, BLOCK_TYPES.CONTROL, BLOCK_TYPES.OPERATOR, BLOCK_TYPES.LOOKS],
    challenge: '创建一个猜数字游戏',
    hint: '结合变量、循环和条件判断',
    solution: { game: 'guess_number', range: [1, 10] },
    exp: 80,
    points: 200
  }
]

// 编程挑战
export const CODING_CHALLENGES = [
  {
    id: 'challenge_001',
    title: 'Hello World',
    description: '输出Hello World',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    category: 'output',
    challenge: '使用代码块输出"Hello World"',
    hint: '使用"说你好"积木',
    template: '// 在下面添加代码块',
    solution: 'console.log("Hello World")',
    exp: 10,
    points: 30
  },
  {
    id: 'challenge_002',
    title: '计算1+2+3+...+10',
    description: '计算1到10的和',
    difficulty: DIFFICULTY_LEVELS.ELEMENTARY,
    category: 'loop',
    challenge: '使用循环计算1到10的和',
    hint: '使用重复执行积木累加',
    template: 'let sum = 0;\n// 循环添加',
    solution: 'let sum = 0;\nfor(let i = 1; i <= 10; i++) { sum += i; }',
    exp: 20,
    points: 50
  },
  {
    id: 'challenge_003',
    title: '找出最大数',
    description: '在数组中找最大值',
    difficulty: DIFFICULTY_LEVELS.ELEMENTARY,
    category: 'array',
    challenge: '找出[3,7,2,9,1]中的最大值',
    hint: '遍历数组比较每个元素',
    template: 'let arr = [3,7,2,9,1];\nlet max = arr[0];\n// 遍历比较',
    solution: 'let arr = [3,7,2,9,1]; let max = arr[0]; for(let i = 1; i < arr.length; i++) { if(arr[i] > max) max = arr[i]; }',
    exp: 30,
    points: 80
  },
  {
    id: 'challenge_004',
    title: '斐波那契数列',
    description: '生成斐波那契数列',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    category: 'algorithm',
    challenge: '生成前10个斐波那契数',
    hint: '每个数是前两个数的和',
    template: 'let fib = [1, 1];\n// 继续添加',
    solution: 'let fib = [1, 1]; for(let i = 2; i < 10; i++) { fib.push(fib[i-1] + fib[i-2]); }',
    exp: 50,
    points: 150
  },
  {
    id: 'challenge_005',
    title: '排序算法',
    description: '实现冒泡排序',
    difficulty: DIFFICULTY_LEVELS.ADVANCED,
    category: 'algorithm',
    challenge: '对[5,3,8,4,1]进行升序排序',
    hint: '相邻元素两两比较交换',
    template: 'let arr = [5,3,8,4,1];\n// 冒泡排序',
    solution: 'let arr = [5,3,8,4,1]; for(let i = 0; i < arr.length-1; i++) { for(let j = 0; j < arr.length-1-i; j++) { if(arr[j] > arr[j+1]) { let t = arr[j]; arr[j] = arr[j+1]; arr[j+1] = t; } } }',
    exp: 80,
    points: 200
  },
  {
    id: 'challenge_006',
    title: '回文判断',
    description: '判断是否是回文数',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    category: 'string',
    challenge: '判断12321是否是回文数',
    hint: '反转后与原数比较',
    template: 'let num = 12321;\n// 判断回文',
    solution: 'let num = 12321; let rev = parseInt(num.toString().split("").reverse().join("")); console.log(num === rev);',
    exp: 40,
    points: 100
  }
]

// 创意编程项目
export const CREATIVE_PROJECTS = [
  {
    id: 'project_001',
    title: '动画故事',
    description: '用积木创建一个小动画',
    icon: '🎬',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    features: ['多个角色', '移动动画', '对话气泡'],
    exp: 50,
    points: 100
  },
  {
    id: 'project_002',
    title: '简易游戏',
    description: '制作一个简单的跳跃游戏',
    icon: '🎮',
    difficulty: DIFFICULTY_LEVELS.ELEMENTARY,
    features: ['角色控制', '障碍物', '计分系统'],
    exp: 80,
    points: 180
  },
  {
    id: 'project_003',
    title: '计算器APP',
    description: '做一个功能完整的计算器',
    icon: '🧮',
    difficulty: DIFFICULTY_LEVELS.ELEMENTARY,
    features: ['加减乘除', '清零', '结果显示'],
    exp: 70,
    points: 150
  },
  {
    id: 'project_004',
    title: '画图板',
    description: '用代码画画',
    icon: '🎨',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    features: ['多种颜色', '线条粗细', '橡皮擦'],
    exp: 100,
    points: 250
  },
  {
    id: 'project_005',
    title: '音乐播放器',
    description: '播放自定义音乐',
    icon: '🎵',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    features: ['播放暂停', '进度条', '播放列表'],
    exp: 120,
    points: 300
  }
]

/**
 * 获取所有视觉块
 */
export const getVisualBlocks = () => {
  try {
    const data = uni.getStorageSync(VISUAL_BLOCKS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {}
  return VISUAL_BLOCKS
}

/**
 * 按类别获取积木
 */
export const getBlocksByCategory = (category) => {
  return VISUAL_BLOCKS.filter(block => block.category === category)
}

/**
 * 获取代码块学习进度
 */
export const getCodeBlockProgress = () => {
  try {
    const data = uni.getStorageSync(CODE_CHALLENGES_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {}
  return {
    completedLevels: [],
    currentLevel: 0,
    totalExp: 0
  }
}

/**
 * 保存代码块学习进度
 */
export const saveCodeBlockProgress = (progress) => {
  try {
    uni.setStorageSync(CODE_CHALLENGES_KEY, JSON.stringify(progress))
  } catch (e) {}
}

/**
 * 获取编程挑战列表
 */
export const getCodingChallenges = () => {
  return CODING_CHALLENGES
}

/**
 * 获取挑战进度
 */
export const getChallengeProgress = () => {
  try {
    const data = uni.getStorageSync(`${CODE_CHALLENGES_KEY}_progress`)
    if (data) return JSON.parse(data)
  } catch (e) {}
  return {
    completedChallenges: [],
    totalPoints: 0,
    rank: '初学者'
  }
}

/**
 * 完成挑战并保存进度
 */
export const completeChallenge = (challengeId, points, exp) => {
  const progress = getChallengeProgress()
  if (!progress.completedChallenges.includes(challengeId)) {
    progress.completedChallenges.push(challengeId)
    progress.totalPoints += points
    progress.rank = calculateRank(progress.totalPoints)
    try {
      uni.setStorageSync(`${CODE_CHALLENGES_KEY}_progress`, JSON.stringify(progress))
    } catch (e) {}
  }
  return progress
}

/**
 * 计算等级
 */
const calculateRank = (points) => {
  if (points >= 1000) return '编程大师'
  if (points >= 500) return '代码高手'
  if (points >= 200) return '编程达人'
  if (points >= 100) return '编程新手'
  return '初学者'
}

/**
 * 获取创意项目列表
 */
export const getCreativeProjects = () => {
  return CREATIVE_PROJECTS
}

/**
 * 获取用户创意作品
 */
export const getUserProjects = () => {
  try {
    const data = uni.getStorageSync(CODING_PROJECTS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {}
  return []
}

/**
 * 保存用户创意作品
 */
export const saveUserProject = (project) => {
  const projects = getUserProjects()
  const existingIndex = projects.findIndex(p => p.id === project.id)
  if (existingIndex >= 0) {
    projects[existingIndex] = project
  } else {
    project.id = `project_${Date.now()}`
    project.createdAt = new Date().toISOString()
    projects.push(project)
  }
  try {
    uni.setStorageSync(CODING_PROJECTS_KEY, JSON.stringify(projects))
  } catch (e) {}
  return project
}

/**
 * 获取编程统计数据
 */
export const getCodingStats = () => {
  const challengeProgress = getChallengeProgress()
  const codeBlockProgress = getCodeBlockProgress()
  const userProjects = getUserProjects()
  
  return {
    totalPoints: challengeProgress.totalPoints,
    rank: challengeProgress.rank,
    challengesCompleted: challengeProgress.completedChallenges.length,
    levelsCompleted: codeBlockProgress.completedLevels.length,
    projectsCreated: userProjects.length,
    blocksLearned: getVisualBlocks().length
  }
}

export default {
  BLOCK_TYPES,
  DIFFICULTY_LEVELS,
  VISUAL_BLOCKS,
  CODE_BLOCK_LEVELS,
  CODING_CHALLENGES,
  CREATIVE_PROJECTS,
  getVisualBlocks,
  getBlocksByCategory,
  getCodeBlockProgress,
  saveCodeBlockProgress,
  getCodingChallenges,
  getChallengeProgress,
  completeChallenge,
  getCreativeProjects,
  getUserProjects,
  saveUserProject,
  getCodingStats
}
