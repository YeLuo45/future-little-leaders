/**
 * V22 多儿童家庭服务
 * 扩展原有的familyService.js，支持多儿童家庭管理
 */

// localStorage keys
const FAMILY_POOL_KEY = 'family_points_pool'
const POOL_RECORDS_KEY = 'family_pool_records'
const SIBLING_COMPETITIONS_KEY = 'sibling_competitions'

// 积分池操作
export const getFamilyPoolBalance = () => {
  try {
    const balance = uni.getStorageSync(FAMILY_POOL_KEY)
    return balance ? parseInt(balance) : 0
  } catch (e) {
    console.error('获取家庭积分池余额失败:', e)
    return 0
  }
}

export const setFamilyPoolBalance = (balance) => {
  uni.setStorageSync(FAMILY_POOL_KEY, balance.toString())
}

// 积分池记录操作
export const getPoolRecords = () => {
  try {
    const stored = uni.getStorageSync(POOL_RECORDS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取积分池记录失败:', e)
    return []
  }
}

export const addPoolRecord = (record) => {
  const records = getPoolRecords()
  records.unshift({
    id: Date.now().toString(),
    ...record,
    createdAt: new Date().toISOString()
  })
  uni.setStorageSync(POOL_RECORDS_KEY, JSON.stringify(records))
  return records
}

// 兄弟姐妹竞赛操作
export const getSiblingCompetitions = () => {
  try {
    const stored = uni.getStorageSync(SIBLING_COMPETITIONS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取兄弟姐妹竞赛失败:', e)
    return []
  }
}

export const saveSiblingCompetitions = (competitions) => {
  uni.setStorageSync(SIBLING_COMPETITIONS_KEY, JSON.stringify(competitions))
}

export const createSiblingCompetition = (title, taskType, participantIds, duration = 7) => {
  const competitions = getSiblingCompetitions()
  const competition = {
    id: 'comp_' + Date.now(),
    title,
    taskType,
    participantIds,
    duration,
    status: 'ongoing',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
    results: [],
    createdAt: new Date().toISOString()
  }
  competitions.unshift(competition)
  saveSiblingCompetitions(competitions)
  return competition
}

export const updateCompetitionScore = (competitionId, childId, score) => {
  const competitions = getSiblingCompetitions()
  const competition = competitions.find(c => c.id === competitionId)
  if (!competition) return null

  const existingResult = competition.results.find(r => r.childId === childId)
  if (existingResult) {
    existingResult.score = score
  } else {
    competition.results.push({ childId, score, rank: 0 })
  }

  // 重新排序
  competition.results.sort((a, b) => b.score - a.score)
  competition.results.forEach((r, i) => r.rank = i + 1)

  saveSiblingCompetitions(competitions)
  return competition
}

export const finishSiblingCompetition = (competitionId) => {
  const competitions = getSiblingCompetitions()
  const competition = competitions.find(c => c.id === competitionId)
  if (!competition) return null

  competition.status = 'finished'
  saveSiblingCompetitions(competitions)
  return competition
}

// 格式化转账记录描述
export const formatTransferDesc = (record) => {
  if (record.type === 'help_bonus') {
    return record.reason
  }
  if (record.fromType === 'pool') {
    return `分配给${record.toChildName || '儿童'}`
  }
  if (record.toType === 'pool') {
    return `从${record.fromChildName || '儿童'}存入`
  }
  if (record.fromChildId && record.toChildId) {
    return `${record.fromChildName || '儿童'} → ${record.toChildName || '儿童'}`
  }
  return record.reason || '积分变动'
}

// 获取家庭成员（从babyStore获取宝宝数据）
export const getFamilyMembers = () => {
  try {
    // 简单返回本地存储的宝宝列表作为家庭成员
    const babies = uni.getStorageSync('babies') || '[]'
    return JSON.parse(babies)
  } catch (e) {
    return []
  }
}

// 获取当前家庭成员ID（返回当前选中的宝宝ID）
export const getCurrentMemberId = () => {
  try {
    return uni.getStorageSync('current_baby_id') || ''
  } catch (e) {
    return ''
  }
}

// 检查是否已加入家庭（通过是否有家庭积分池记录判断）
export const hasJoinedFamily = () => {
  try {
    const balance = uni.getStorageSync('family_points_pool')
    return balance !== '' && balance !== null
  } catch (e) {
    return false
  }
}

export default {
  getFamilyPoolBalance,
  setFamilyPoolBalance,
  getPoolRecords,
  addPoolRecord,
  getSiblingCompetitions,
  saveSiblingCompetitions,
  createSiblingCompetition,
  updateCompetitionScore,
  finishSiblingCompetition,
  formatTransferDesc
}
