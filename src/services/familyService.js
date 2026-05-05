/**
 * 家庭成员服务
 * 负责家庭成员管理、邀请码生成与加入
 */

// localStorage keys
const FAMILY_MEMBERS_KEY = 'family_members'
const FAMILY_INVITE_CODES_KEY = 'family_invite_codes'
const CURRENT_MEMBER_ID_KEY = 'current_member_id'

// 角色定义
export const FAMILY_ROLES = {
  father: { label: '爸爸', icon: '👨', color: '#4A90D9' },
  mother: { label: '妈妈', icon: '👩', color: '#E99BB8' },
  grandpa: { label: '爷爷', icon: '👴', color: '#8B7355' },
  grandma: { label: '奶奶', icon: '👵', color: '#D4A574' },
  other: { label: '其他', icon: '👤', color: '#999999' }
}

// 生成6位邀请码
const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 获取当前成员ID
export const getCurrentMemberId = () => {
  return uni.getStorageSync(CURRENT_MEMBER_ID_KEY) || ''
}

// 获取当前成员信息
export const getCurrentMember = () => {
  const memberId = getCurrentMemberId()
  if (!memberId) return null
  const members = getFamilyMembers()
  return members.find(m => m.id === memberId) || null
}

// 判断是否是户主（创建者）
export const isOwner = () => {
  const member = getCurrentMember()
  return member?.isOwner === true
}

// 获取家庭成员列表
export const getFamilyMembers = () => {
  try {
    const stored = uni.getStorageSync(FAMILY_MEMBERS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取家庭成员失败:', e)
    return []
  }
}

// 保存家庭成员列表
const saveFamilyMembers = (members) => {
  uni.setStorageSync(FAMILY_MEMBERS_KEY, JSON.stringify(members))
}

// 获取邀请码列表
const getInviteCodes = () => {
  try {
    const stored = uni.getStorageSync(FAMILY_INVITE_CODES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取邀请码失败:', e)
    return []
  }
}

// 保存邀请码列表
const saveInviteCodes = (codes) => {
  uni.setStorageSync(FAMILY_INVITE_CODES_KEY, JSON.stringify(codes))
}

// 初始化家庭（户主创建）
export const initFamily = (nickname, role = 'father') => {
  const memberId = 'member_' + Date.now()
  const ownerMember = {
    id: memberId,
    role,
    nickname,
    avatar: '',
    createdAt: new Date().toISOString(),
    isOwner: true
  }
  
  saveFamilyMembers([ownerMember])
  uni.setStorageSync(CURRENT_MEMBER_ID_KEY, memberId)
  
  return memberId
}

// 生成邀请码
export const generateInvite = () => {
  const currentMember = getCurrentMember()
  if (!currentMember) {
    throw new Error('请先加入家庭')
  }
  
  const code = generateInviteCode()
  const invite = {
    code,
    createdBy: currentMember.id,
    createdAt: new Date().toISOString(),
    used: false,
    usedBy: null
  }
  
  const codes = getInviteCodes()
  codes.push(invite)
  saveInviteCodes(codes)
  
  return code
}

// 使用邀请码加入家庭
export const joinFamily = (code, nickname, role) => {
  const codes = getInviteCodes()
  const invite = codes.find(c => c.code === code && !c.used)
  
  if (!invite) {
    throw new Error('邀请码无效或已使用')
  }
  
  const members = getFamilyMembers()
  const newMemberId = 'member_' + Date.now()
  
  const newMember = {
    id: newMemberId,
    role,
    nickname,
    avatar: '',
    createdAt: new Date().toISOString(),
    isOwner: false,
    invitedBy: invite.createdBy
  }
  
  members.push(newMember)
  saveFamilyMembers(members)
  
  // 标记邀请码已使用
  invite.used = true
  invite.usedBy = newMemberId
  saveInviteCodes(codes)
  
  // 设置当前成员
  uni.setStorageSync(CURRENT_MEMBER_ID_KEY, newMemberId)
  
  return newMember
}

// 更新成员信息
export const updateMember = (memberId, updates) => {
  const members = getFamilyMembers()
  const index = members.findIndex(m => m.id === memberId)
  
  if (index === -1) {
    throw new Error('成员不存在')
  }
  
  members[index] = { ...members[index], ...updates }
  saveFamilyMembers(members)
  
  return members[index]
}

// 切换当前成员
export const switchMember = (memberId) => {
  const members = getFamilyMembers()
  const member = members.find(m => m.id === memberId)
  
  if (!member) {
    throw new Error('成员不存在')
  }
  
  uni.setStorageSync(CURRENT_MEMBER_ID_KEY, memberId)
  return member
}

// 获取家庭成员数量
export const getMemberCount = () => {
  return getFamilyMembers().length
}

// 检查是否已初始化家庭
export const isFamilyInitialized = () => {
  const members = getFamilyMembers()
  return members.length > 0
}

// 检查是否已加入家庭（用于判断是创建还是加入）
export const hasJoinedFamily = () => {
  const memberId = getCurrentMemberId()
  if (!memberId) return false
  const members = getFamilyMembers()
  return members.some(m => m.id === memberId)
}

// 退出家庭（仅限非户主）
export const leaveFamily = (memberId) => {
  const member = getFamilyMembers().find(m => m.id === memberId)
  if (!member) return
  
  if (member.isOwner) {
    throw new Error('户主无法退出家庭，请先转移所有权')
  }
  
  const members = getFamilyMembers().filter(m => m.id !== memberId)
  saveFamilyMembers(members)
  
  // 如果退出的是当前成员，切换到户主
  if (memberId === getCurrentMemberId()) {
    const owner = members.find(m => m.isOwner)
    if (owner) {
      uni.setStorageSync(CURRENT_MEMBER_ID_KEY, owner.id)
    } else {
      uni.removeStorageSync(CURRENT_MEMBER_ID_KEY)
    }
  }
}

// 获取角色信息
export const getRoleInfo = (role) => {
  return FAMILY_ROLES[role] || FAMILY_ROLES.other
}

export default {
  FAMILY_ROLES,
  getCurrentMemberId,
  getCurrentMember,
  isOwner,
  getFamilyMembers,
  initFamily,
  generateInvite,
  joinFamily,
  updateMember,
  switchMember,
  getMemberCount,
  isFamilyInitialized,
  hasJoinedFamily,
  leaveFamily,
  getRoleInfo
}
