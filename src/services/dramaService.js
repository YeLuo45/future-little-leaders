/**
 * V92 Creative Drama Service
 * 创意戏剧系统服务
 */

// 角色类型
export const DRAMA_ROLES = {
  HERO: 'hero',           // 主角
  VILLAIN: 'villain',     // 反派
  WISEMAN: 'wiseman',     // 智者
  COMIC: 'comic',         // 喜剧角色
  NARRATOR: 'narrator'    // 旁白
}

// 角色类型信息
export const ROLE_INFO = {
  [DRAMA_ROLES.HERO]: { icon: '🦸', label: '主角', description: '故事的核心人物' },
  [DRAMA_ROLES.VILLAIN]: { icon: '😈', label: '反派', description: '制造冲突的角色' },
  [DRAMA_ROLES.WISEMAN]: { icon: '🧙', label: '智者', description: '指引方向的角色' },
  [DRAMA_ROLES.COMIC]: { icon: '🤡', label: '喜剧角色', description: '带来欢乐的角色' },
  [DRAMA_ROLES.NARRATOR]: { icon: '📖', label: '旁白', description: '讲述故事的角色' }
}

// 场景类型
export const SCENE_TYPES = {
  FAIRY_TALE: 'fairy_tale',       // 童话故事
  ADVENTURE: 'adventure',         // 冒险故事
  DAILY_LIFE: 'daily_life',       // 日常生活
  HISTORY: 'history',             // 历史故事
  SCIENCE_FICTION: 'sci_fi'      // 科幻故事
}

// 场景类型信息
export const SCENE_TYPE_INFO = {
  [SCENE_TYPES.FAIRY_TALE]: { icon: '🏰', label: '童话故事', color: '#ff6b9d' },
  [SCENE_TYPES.ADVENTURE]: { icon: '🗺️', label: '冒险故事', color: '#4ecdc4' },
  [SCENE_TYPES.DAILY_LIFE]: { icon: '🏠', label: '日常生活', color: '#45b7d1' },
  [SCENE_TYPES.HISTORY]: { icon: '⚔️', label: '历史故事', color: '#96ceb4' },
  [SCENE_TYPES.SCI_FI]: { icon: '🚀', label: '科幻故事', color: '#a855f7' }
}

// 难度等级
export const DIFFICULTY = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3
}

// 难度信息
export const DIFFICULTY_INFO = {
  [DIFFICULTY.EASY]: { label: '简单', color: '#22c55e', stars: 1 },
  [DIFFICULTY.MEDIUM]: { label: '中等', color: '#f59e0b', stars: 2 },
  [DIFFICULTY.HARD]: { label: '困难', color: '#ef4444', stars: 3 }
}

// 评分等级
export const SCORE_LEVEL = {
  S: { label: 'S', color: '#ffd700', description: '完美表演' },
  A: { label: 'A', color: '#c0c0c0', description: '出色表演' },
  B: { label: 'B', color: '#cd7f32', description: '良好表演' },
  C: { label: 'C', color: '#888888', description: '一般表演' },
  D: { label: 'D', color: '#666666', description: '需要努力' }
}

// 内置角色库
const CHARACTERS = [
  {
    id: 'char_001',
    name: '小红帽',
    role: DRAMA_ROLES.HERO,
    description: '勇敢善良的小姑娘',
    costumes: ['red_hood', 'grandma_dress', 'hunter_outfit'],
    defaultCostume: 'red_hood',
    emotions: ['happy', 'sad', 'scared', 'brave']
  },
  {
    id: 'char_002',
    name: '大灰狼',
    role: DRAMA_ROLES.VILLAIN,
    description: '狡猾的森林动物',
    costumes: ['wolf_default', 'grandma_disguise'],
    defaultCostume: 'wolf_default',
    emotions: ['evil', 'hungry', 'clever', 'defeated']
  },
  {
    id: 'char_003',
    name: '森林智者',
    role: DRAMA_ROLES.WISEMAN,
    description: '古老的树木精灵',
    costumes: ['green_robe', 'golden_robe'],
    defaultCostume: 'green_robe',
    emotions: ['wise', 'calm', 'happy', 'worried']
  },
  {
    id: 'char_004',
    name: '小丑波波',
    role: DRAMA_ROLES.COMIC,
    description: '马戏团的开心果',
    costumes: ['circus_clown', 'party_clown', 'magic_clown'],
    defaultCostume: 'circus_clown',
    emotions: ['funny', 'sad', 'surprised', 'proud']
  },
  {
    id: 'char_005',
    name: '旁白先生',
    role: DRAMA_ROLES.NARRATOR,
    description: '故事的讲述者',
    costumes: ['scholar', 'theater_director'],
    defaultCostume: 'scholar',
    emotions: ['calm', 'excited', 'dramatic', 'peaceful']
  },
  {
    id: 'char_006',
    name: '勇敢的骑士',
    role: DRAMA_ROLES.HERO,
    description: '保护王国的勇士',
    costumes: ['silver_armor', 'golden_armor', 'dragon_slayer'],
    defaultCostume: 'silver_armor',
    emotions: ['brave', 'proud', 'worried', 'determined']
  }
]

// 内置场景库
const SCENES = [
  {
    id: 'scene_001',
    title: '小红帽的森林之旅',
    type: SCENE_TYPES.FAIRY_TALE,
    role: DRAMA_ROLES.HERO,
    difficulty: DIFFICULTY.EASY,
    description: '帮助小红帽学会如何与陌生人安全交流',
    situation: '小红帽要去奶奶家，但她迷路了，遇到了一个友善的陌生人...',
    choices: [
      { id: 'c1', text: '礼貌地询问方向但保持警惕', isCorrect: true, score: 30, feedback: '很好，你懂得保护自己！' },
      { id: 'c2', text: '跟着陌生人走', isCorrect: false, score: 0, feedback: '危险！不要跟陌生人走。' },
      { id: 'c3', text: '大声拒绝并跑开', isCorrect: true, score: 25, feedback: '很好，但记得找大人帮忙。' }
    ],
    tips: '记住：不要跟陌生人走，但可以寻求警察或保安的帮助。'
  },
  {
    id: 'scene_002',
    title: '骑士的勇气考验',
    type: SCENE_TYPES.ADVENTURE,
    role: DRAMA_ROLES.HERO,
    difficulty: DIFFICULTY.MEDIUM,
    description: '面对困难时展现勇气和智慧',
    situation: '骑士面前有一条危险的河流和对面的恶龙...',
    choices: [
      { id: 'c1', text: '寻找过河的方法后再战恶龙', isCorrect: true, score: 30, feedback: '你很有智慧！' },
      { id: 'c2', text: '直接跳入河中游过去', isCorrect: true, score: 20, feedback: '你很勇敢，但要注意安全。' },
      { id: 'c3', text: '放弃任务转身离开', isCorrect: false, score: 0, feedback: '勇敢不是鲁莽，但也要面对挑战。' }
    ],
    tips: '真正的勇敢不是盲目冒险，而是理性面对困难。'
  },
  {
    id: 'scene_003',
    title: '小丑的生日派对',
    type: SCENE_TYPES.DAILY_LIFE,
    role: DRAMA_ROLES.COMIC,
    difficulty: DIFFICULTY.EASY,
    description: '让朋友们在派对上开心起来',
    situation: '派对上一个小朋友闷闷不乐地坐在角落...',
    choices: [
      { id: 'c1', text: '做一个有趣的鬼脸逗他笑', isCorrect: true, score: 30, feedback: '太棒了！你的幽默感很棒！' },
      { id: 'c2', text: '走过去问他为什么不开心', isCorrect: true, score: 25, feedback: '关心朋友是好事！' },
      { id: 'c3', text: '不管他继续表演', isCorrect: false, score: 10, feedback: '有时候关心比表演更重要。' }
    ],
    tips: '关心他人的感受，比只顾自己表演更有意义。'
  },
  {
    id: 'scene_004',
    title: '智者的选择',
    type: SCENE_TYPES.HISTORY,
    role: DRAMA_ROLES.WISEMAN,
    difficulty: DIFFICULTY.HARD,
    description: '用智慧帮助他人做出正确选择',
    situation: '两个农夫为了一口水井争吵不休，都说是自己的...',
    choices: [
      { id: 'c1', text: '让他们轮流使用水井', isCorrect: true, score: 30, feedback: '智慧分享让大家都能受益！' },
      { id: 'c2', text: '建议他们一起挖一口新的井', isCorrect: true, score: 35, feedback: '合作创造更多价值！' },
      { id: 'c3', text: '让他们自己解决', isCorrect: false, score: 5, feedback: '有时候中立的建议也是有用的。' }
    ],
    tips: '智者不是给出答案，而是引导人们找到共同的解决方案。'
  },
  {
    id: 'scene_005',
    title: '太空探险家',
    type: SCENE_TYPES.SCI_FI,
    role: DRAMA_ROLES.HERO,
    difficulty: DIFFICULTY.MEDIUM,
    description: '在太空站遇到紧急情况时的应对',
    situation: '太空站的警报响起，氧气正在泄漏，你需要做出决定...',
    choices: [
      { id: 'c1', text: '立即穿上宇航服并报告指挥中心', isCorrect: true, score: 30, feedback: '冷静和专业是你的优点！' },
      { id: 'c2', text: '先帮助其他宇航员穿上宇航服', isCorrect: true, score: 35, feedback: '团队精神非常棒！' },
      { id: 'c3', text: '惊慌失措地跑来跑去', isCorrect: false, score: 0, feedback: '紧急情况下保持冷静很重要。' }
    ],
    tips: '团队合作和冷静应对是太空探险的关键。'
  }
]

// 用户数据管理
let userData = {
  characters: [],
  scenes: [],
  scripts: [],
  stats: {
    totalScore: 0,
    completedScenes: 0,
    createdScripts: 0,
    costumes: 0,
    influence: 0,
    creativity: 0,
    expression: 0
  },
  unlockedCharacters: ['char_001'],
  unlockedCostumes: {
    'char_001': ['red_hood']
  },
  sceneHistory: [],
  scriptHistory: []
}

// 获取角色库
const getCharacters = () => {
  return CHARACTERS
}

// 获取已解锁角色
const getUnlockedCharacters = () => {
  return CHARACTERS.filter(char => userData.unlockedCharacters.includes(char.id))
}

// 获取角色详情
const getCharacter = (charId) => {
  return CHARACTERS.find(char => char.id === charId)
}

// 解锁角色
const unlockCharacter = (charId) => {
  if (!userData.unlockedCharacters.includes(charId)) {
    userData.unlockedCharacters.push(charId)
    return true
  }
  return false
}

// 获取已解锁服装
const getUnlockedCostumes = (charId) => {
  return userData.unlockedCostumes[charId] || []
}

// 解锁服装
const unlockCostume = (charId, costumeId) => {
  if (!userData.unlockedCostumes[charId]) {
    userData.unlockedCostumes[charId] = []
  }
  if (!userData.unlockedCostumes[charId].includes(costumeId)) {
    userData.unlockedCostumes[charId].push(costumeId)
    userData.stats.costumes++
    return true
  }
  return false
}

// 获取场景库
const getScenes = () => {
  return SCENES
}

// 按类型获取场景
const getScenesByType = (type) => {
  return SCENES.filter(scene => scene.type === type)
}

// 获取场景详情
const getScene = (sceneId) => {
  return SCENES.find(scene => scene.id === sceneId)
}

// 完成场景
const completeScene = (sceneId, choiceId, score) => {
  const scene = getScene(sceneId)
  if (!scene) return null
  
  const choice = scene.choices.find(c => c.id === choiceId)
  
  // 记录历史
  userData.sceneHistory.push({
    sceneId,
    choiceId,
    score,
    timestamp: Date.now()
  })
  
  // 更新统计
  userData.stats.completedScenes++
  userData.stats.totalScore += score
  
  // 根据表现提升属性
  if (choice?.isCorrect) {
    userData.stats.influence += Math.floor(score / 10)
    userData.stats.creativity += Math.floor(score / 15)
  }
  
  // 返回评分
  let level = SCORE_LEVEL.D
  if (score >= 30) level = SCORE_LEVEL.S
  else if (score >= 25) level = SCORE_LEVEL.A
  else if (score >= 20) level = SCORE_LEVEL.B
  else if (score >= 10) level = SCORE_LEVEL.C
  
  // 可能解锁新角色
  if (userData.stats.completedScenes >= 3 && !userData.unlockedCharacters.includes('char_002')) {
    unlockCharacter('char_002')
  }
  if (userData.stats.completedScenes >= 5 && !userData.unlockedCharacters.includes('char_003')) {
    unlockCharacter('char_003')
  }
  
  return {
    score,
    level,
    feedback: choice?.feedback || '',
    nextScene: getNextRecommendedScene(scene.type)
  }
}

// 获取推荐的下一个场景
const getNextRecommendedScene = (currentType) => {
  const incompleteScenes = SCENES.filter(scene => 
    !userData.sceneHistory.some(h => h.sceneId === scene.id)
  )
  return incompleteScenes.length > 0 ? incompleteScenes[0] : null
}

// 获取用户剧本
const getScripts = () => {
  return userData.scripts
}

// 创建剧本
const createScript = (script) => {
  const newScript = {
    id: `script_${Date.now()}`,
    ...script,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    dialogues: script.dialogues || []
  }
  userData.scripts.push(newScript)
  userData.stats.createdScripts++
  return newScript
}

// 更新剧本
const updateScript = (scriptId, updates) => {
  const index = userData.scripts.findIndex(s => s.id === scriptId)
  if (index !== -1) {
    userData.scripts[index] = {
      ...userData.scripts[index],
      ...updates,
      updatedAt: Date.now()
    }
    return userData.scripts[index]
  }
  return null
}

// 删除剧本
const deleteScript = (scriptId) => {
  const index = userData.scripts.findIndex(s => s.id === scriptId)
  if (index !== -1) {
    userData.scripts.splice(index, 1)
    return true
  }
  return false
}

// 获取剧本详情
const getScript = (scriptId) => {
  return userData.scripts.find(s => s.id === scriptId)
}

// 添加对白到剧本
const addDialogue = (scriptId, dialogue) => {
  const script = getScript(scriptId)
  if (script) {
    const newDialogue = {
      id: `dlg_${Date.now()}`,
      ...dialogue,
      order: script.dialogues.length
    }
    script.dialogues.push(newDialogue)
    script.updatedAt = Date.now()
    return newDialogue
  }
  return null
}

// 删除对白
const removeDialogue = (scriptId, dialogueId) => {
  const script = getScript(scriptId)
  if (script) {
    const index = script.dialogues.findIndex(d => d.id === dialogueId)
    if (index !== -1) {
      script.dialogues.splice(index, 1)
      script.updatedAt = Date.now()
      return true
    }
  }
  return false
}

// 获取用户统计
const getUserStats = () => {
  return { ...userData.stats }
}

// 获取场景进度
const getSceneProgress = () => {
  const completed = userData.sceneHistory.length
  const total = SCENES.length
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0
  }
}

// 获取角色进度
const getCharacterProgress = () => {
  const unlocked = userData.unlockedCharacters.length
  const total = CHARACTERS.length
  return {
    unlocked,
    total,
    percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0
  }
}

// 重置数据
const resetData = () => {
  userData = {
    characters: [],
    scenes: [],
    scripts: [],
    stats: {
      totalScore: 0,
      completedScenes: 0,
      createdScripts: 0,
      costumes: 0,
      influence: 0,
      creativity: 0,
      expression: 0
    },
    unlockedCharacters: ['char_001'],
    unlockedCostumes: {
      'char_001': ['red_hood']
    },
    sceneHistory: [],
    scriptHistory: []
  }
  return true
}

export default {
  // 常量
  DRAMA_ROLES,
  ROLE_INFO,
  SCENE_TYPES,
  SCENE_TYPE_INFO,
  DIFFICULTY,
  DIFFICULTY_INFO,
  SCORE_LEVEL,
  
  // 方法
  getCharacters,
  getUnlockedCharacters,
  getCharacter,
  unlockCharacter,
  getUnlockedCostumes,
  unlockCostume,
  getScenes,
  getScenesByType,
  getScene,
  completeScene,
  getNextRecommendedScene,
  getScripts,
  createScript,
  updateScript,
  deleteScript,
  getScript,
  addDialogue,
  removeDialogue,
  getUserStats,
  getSceneProgress,
  getCharacterProgress,
  resetData
}
