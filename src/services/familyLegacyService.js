/**
 * V100 Family Legacy Service
 * 家族传承系统服务层
 * 家族历史、家族树、家训传承、家族荣誉
 */

// ============================================================================
// Types & Constants
// ============================================================================

// 代际级别
export const GENERATION_LEVEL = {
  GREAT_GRANDPARENT: 1,  // 曾祖父母
  GRANDPARENT: 2,         // 祖父母
  PARENT: 3,              // 父母
  CHILD: 4,               // 子女
  GRANDCHILD: 5,          // 孙子女
  GREAT_GRANDCHILD: 6     // 曾孙子女
}

export const GENERATION_INFO = {
  [GENERATION_LEVEL.GREAT_GRANDPARENT]: { label: '曾祖父母', icon: '👴👵', level: 1 },
  [GENERATION_LEVEL.GRANDPARENT]: { label: '祖父母', icon: '👴👵', level: 2 },
  [GENERATION_LEVEL.PARENT]: { label: '父母', icon: '👨👩', level: 3 },
  [GENERATION_LEVEL.CHILD]: { label: '子女', icon: '👦👧', level: 4 },
  [GENERATION_LEVEL.GRANDCHILD]: { label: '孙子女', icon: '👶', level: 5 },
  [GENERATION_LEVEL.GREAT_GRANDCHILD]: { label: '曾孙子女', icon: '🧒', level: 6 }
}

// 关系类型
export const RELATION_TYPE = {
  FATHER: 'father',
  MOTHER: 'mother',
  SON: 'son',
  DAUGHTER: 'daughter',
  GRANDSON: 'grandson',
  GRANDDAUGHTER: 'granddaughter',
  GRANDFATHER: 'grandfather',
  GRANDMOTHER: 'grandmother',
  SPOUSE: 'spouse',
  SIBLING: 'sibling'
}

// 家族荣誉类型
export const HONOR_TYPE = {
  ACHIEVEMENT: 'achievement',     // 成就
  MILESTONE: 'milestone',         // 里程碑
  LEGACY: 'legacy',               // 传承
  STORY: 'story'                  // 故事
}

export const HONOR_INFO = {
  [HONOR_TYPE.ACHIEVEMENT]: { label: '成就', icon: '🏆', color: '#FFD700' },
  [HONOR_TYPE.MILESTONE]: { label: '里程碑', icon: '🎯', color: '#1890FF' },
  [HONOR_TYPE.LEGACY]: { label: '传承', icon: '📜', color: '#722ED1' },
  [HONOR_TYPE.STORY]: { label: '故事', icon: '📖', color: '#52C41A' }
}

// localStorage keys
const FAMILY_HISTORY_KEY = 'family_legacy_history'
const FAMILY_TREE_KEY = 'family_legacy_tree'
const FAMILY_LEGACY_KEY = 'family_legacy_legacies'
const FAMILY_HONORS_KEY = 'family_legacy_honors'
const FAMILY_STORIES_KEY = 'family_legacy_stories'

// ============================================================================
// Storage Helpers
// ============================================================================

const getStorage = (key, defaultValue = []) => {
  try {
    const stored = uni.getStorageSync(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch (e) {
    console.error(`获取${key}失败:`, e)
    return defaultValue
  }
}

const setStorage = (key, value) => {
  try {
    uni.setStorageSync(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.error(`保存${key}失败:`, e)
    return false
  }
}

// ============================================================================
// Family History Operations
// ============================================================================

// 获取家族历史记录
export const getFamilyHistory = () => {
  return getStorage(FAMILY_HISTORY_KEY, [])
}

// 添加家族历史记录
export const addFamilyHistory = (history) => {
  const histories = getFamilyHistory()
  const newHistory = {
    id: 'history_' + Date.now(),
    ...history,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  histories.unshift(newHistory)
  setStorage(FAMILY_HISTORY_KEY, histories)
  return newHistory
}

// 更新家族历史记录
export const updateFamilyHistory = (id, updates) => {
  const histories = getFamilyHistory()
  const index = histories.findIndex(h => h.id === id)
  if (index === -1) return null
  
  histories[index] = {
    ...histories[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  setStorage(FAMILY_HISTORY_KEY, histories)
  return histories[index]
}

// 删除家族历史记录
export const deleteFamilyHistory = (id) => {
  const histories = getFamilyHistory()
  const filtered = histories.filter(h => h.id !== id)
  setStorage(FAMILY_HISTORY_KEY, filtered)
  return true
}

// ============================================================================
// Family Tree Operations
// ============================================================================

// 获取家族树数据
export const getFamilyTree = () => {
  return getStorage(FAMILY_TREE_KEY, {
    rootId: null,
    members: []
  })
}

// 添加家族成员
export const addFamilyMember = (member) => {
  const tree = getFamilyTree()
  const newMember = {
    id: 'member_' + Date.now(),
    ...member,
    createdAt: new Date().toISOString()
  }
  
  // 如果没有根节点，设置新成员为根节点
  if (!tree.rootId) {
    tree.rootId = newMember.id
  }
  
  tree.members.push(newMember)
  setStorage(FAMILY_TREE_KEY, tree)
  return newMember
}

// 更新家族成员
export const updateFamilyMember = (id, updates) => {
  const tree = getFamilyTree()
  const index = tree.members.findIndex(m => m.id === id)
  if (index === -1) return null
  
  tree.members[index] = {
    ...tree.members[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  setStorage(FAMILY_TREE_KEY, tree)
  return tree.members[index]
}

// 删除家族成员
export const deleteFamilyMember = (id) => {
  const tree = getFamilyTree()
  tree.members = tree.members.filter(m => m.id !== id)
  
  // 如果删除的是根节点，选择新的根节点
  if (tree.rootId === id && tree.members.length > 0) {
    tree.rootId = tree.members[0].id
  }
  
  setStorage(FAMILY_TREE_KEY, tree)
  return true
}

// 设置成员关系
export const setMemberRelation = (memberId, parentId, relationType) => {
  const tree = getFamilyTree()
  const member = tree.members.find(m => m.id === memberId)
  if (!member) return null
  
  if (!member.relations) {
    member.relations = []
  }
  
  // 移除旧的关系（如果有）
  member.relations = member.relations.filter(r => r.relatedId !== parentId)
  
  // 添加新关系
  member.relations.push({
    relatedId: parentId,
    type: relationType,
    createdAt: new Date().toISOString()
  })
  
  setStorage(FAMILY_TREE_KEY, tree)
  return member
}

// 获取成员的所有关系
export const getMemberRelations = (memberId) => {
  const tree = getFamilyTree()
  const member = tree.members.find(m => m.id === memberId)
  return member?.relations || []
}

// ============================================================================
// Family Legacy (家训) Operations
// ============================================================================

// 获取家训列表
export const getFamilyLegacies = () => {
  return getStorage(FAMILY_LEGACY_KEY, [])
}

// 添加家训
export const addFamilyLegacy = (legacy) => {
  const legacies = getFamilyLegacies()
  const newLegacy = {
    id: 'legacy_' + Date.now(),
    ...legacy,
    status: 'active',
    passedDown: false,
    createdAt: new Date().toISOString()
  }
  legacies.unshift(newLegacy)
  setStorage(FAMILY_LEGACY_KEY, legacies)
  return newLegacy
}

// 更新家训
export const updateFamilyLegacy = (id, updates) => {
  const legacies = getFamilyLegacies()
  const index = legacies.findIndex(l => l.id === id)
  if (index === -1) return null
  
  legacies[index] = {
    ...legacies[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  setStorage(FAMILY_LEGACY_KEY, legacies)
  return legacies[index]
}

// 删除家训
export const deleteFamilyLegacy = (id) => {
  const legacies = getFamilyLegacies()
  const filtered = legacies.filter(l => l.id !== id)
  setStorage(FAMILY_LEGACY_KEY, filtered)
  return true
}

// 标记家训已传承
export const markLegacyPassedDown = (id) => {
  return updateFamilyLegacy(id, { passedDown: true, passedDownAt: new Date().toISOString() })
}

// ============================================================================
// Family Honors Operations
// ============================================================================

// 获取家族荣誉列表
export const getFamilyHonors = () => {
  return getStorage(FAMILY_HONORS_KEY, [])
}

// 添加家族荣誉
export const addFamilyHonor = (honor) => {
  const honors = getFamilyHonors()
  const newHonor = {
    id: 'honor_' + Date.now(),
    ...honor,
    earnedAt: honor.earnedAt || new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
  honors.unshift(newHonor)
  setStorage(FAMILY_HONORS_KEY, honors)
  return newHonor
}

// 更新家族荣誉
export const updateFamilyHonor = (id, updates) => {
  const honors = getFamilyHonors()
  const index = honors.findIndex(h => h.id === id)
  if (index === -1) return null
  
  honors[index] = {
    ...honors[index],
    ...updates
  }
  setStorage(FAMILY_HONORS_KEY, honors)
  return honors[index]
}

// 删除家族荣誉
export const deleteFamilyHonor = (id) => {
  const honors = getFamilyHonors()
  const filtered = honors.filter(h => h.id !== id)
  setStorage(FAMILY_HONORS_KEY, filtered)
  return true
}

// ============================================================================
// Family Stories Operations
// ============================================================================

// 获取家族故事列表
export const getFamilyStories = () => {
  return getStorage(FAMILY_STORIES_KEY, [])
}

// 添加家族故事
export const addFamilyStory = (story) => {
  const stories = getFamilyStories()
  const newStory = {
    id: 'story_' + Date.now(),
    ...story,
    createdAt: new Date().toISOString()
  }
  stories.unshift(newStory)
  setStorage(FAMILY_STORIES_KEY, stories)
  return newStory
}

// 更新家族故事
export const updateFamilyStory = (id, updates) => {
  const stories = getFamilyStories()
  const index = stories.findIndex(s => s.id === id)
  if (index === -1) return null
  
  stories[index] = {
    ...stories[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  setStorage(FAMILY_STORIES_KEY, stories)
  return stories[index]
}

// 删除家族故事
export const deleteFamilyStory = (id) => {
  const stories = getFamilyStories()
  const filtered = stories.filter(s => s.id !== id)
  setStorage(FAMILY_STORIES_KEY, filtered)
  return true
}

// ============================================================================
// Statistics
// ============================================================================

export const getStatistics = () => {
  const tree = getFamilyTree()
  const legacies = getFamilyLegacies()
  const honors = getFamilyHonors()
  const stories = getFamilyStories()
  const histories = getFamilyHistory()
  
  return {
    memberCount: tree.members.length,
    legacyCount: legacies.length,
    activeLegacyCount: legacies.filter(l => l.status === 'active').length,
    passedDownLegacyCount: legacies.filter(l => l.passedDown).length,
    honorCount: honors.length,
    storyCount: stories.length,
    historyCount: histories.length
  }
}

// ============================================================================
// Initialization
// ============================================================================

export const initFamilyLegacy = () => {
  // 确保存储结构存在
  if (!uni.getStorageSync(FAMILY_TREE_KEY)) {
    setStorage(FAMILY_TREE_KEY, { rootId: null, members: [] })
  }
  if (!uni.getStorageSync(FAMILY_LEGACY_KEY)) {
    setStorage(FAMILY_LEGACY_KEY, [])
  }
  if (!uni.getStorageSync(FAMILY_HONORS_KEY)) {
    setStorage(FAMILY_HONORS_KEY, [])
  }
  if (!uni.getStorageSync(FAMILY_STORIES_KEY)) {
    setStorage(FAMILY_STORIES_KEY, [])
  }
  if (!uni.getStorageSync(FAMILY_HISTORY_KEY)) {
    setStorage(FAMILY_HISTORY_KEY, [])
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  GENERATION_LEVEL,
  GENERATION_INFO,
  RELATION_TYPE,
  HONOR_TYPE,
  HONOR_INFO,
  getFamilyHistory,
  addFamilyHistory,
  updateFamilyHistory,
  deleteFamilyHistory,
  getFamilyTree,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  setMemberRelation,
  getMemberRelations,
  getFamilyLegacies,
  addFamilyLegacy,
  updateFamilyLegacy,
  deleteFamilyLegacy,
  markLegacyPassedDown,
  getFamilyHonors,
  addFamilyHonor,
  updateFamilyHonor,
  deleteFamilyHonor,
  getFamilyStories,
  addFamilyStory,
  updateFamilyStory,
  deleteFamilyStory,
  getStatistics,
  initFamilyLegacy
}
