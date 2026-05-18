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

// 家庭角色常量
export const FAMILY_ROLES = {
  father: { icon: '👨', label: '爸爸' },
  mother: { icon: '👩', label: '妈妈' },
  grandfather: { icon: '👴', label: '爷爷' },
  grandmother: { icon: '👵', label: '奶奶' },
  other: { icon: '👤', label: '其他' }
}

// 初始化家庭（创建者）
export const initFamily = (nickname, role) => {
  try {
    const familyId = 'family_' + Date.now()
    const memberId = 'member_' + Date.now()
    const familyData = {
      id: familyId,
      name: '我的家庭',
      createdAt: new Date().toISOString(),
      members: [{
        id: memberId,
        nickname,
        role,
        isOwner: true,
        joinedAt: new Date().toISOString()
      }]
    }
    uni.setStorageSync('family_data', JSON.stringify(familyData))
    uni.setStorageSync('current_member_id', memberId)
    uni.setStorageSync('family_points_pool', '0')
    return familyData
  } catch (e) {
    throw new Error('创建家庭失败')
  }
}

// 加入家庭
export const joinFamily = (inviteCode, nickname, role) => {
  try {
    const stored = uni.getStorageSync('family_data')
    const familyData = stored ? JSON.parse(stored) : null
    if (!familyData) throw new Error('家庭不存在')
    
    const memberId = 'member_' + Date.now()
    const member = {
      id: memberId,
      nickname,
      role,
      isOwner: false,
      joinedAt: new Date().toISOString()
    }
    familyData.members.push(member)
    uni.setStorageSync('family_data', JSON.stringify(familyData))
    uni.setStorageSync('current_member_id', memberId)
    return familyData
  } catch (e) {
    throw new Error('加入家庭失败')
  }
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
  FAMILY_ROLES,
  initFamily,
  joinFamily,
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
