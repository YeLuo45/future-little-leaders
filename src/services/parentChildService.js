/**
 * V86 Parent-Child Challenge Service
 * 亲子挑战服务：API调用、数据同步、推送通知
 */

/**
 * 获取推荐的亲子任务模板
 */
export const getRecommendedTaskTemplates = () => {
  return [
    { id: 1, title: '一起阅读绘本30分钟', category: 'reading', bondGain: 10, points: 20, icon: '📚' },
    { id: 2, title: '亲子厨房小任务', category: 'cooking', bondGain: 15, points: 30, icon: '🍳' },
    { id: 3, title: '户外运动30分钟', category: 'sports', bondGain: 12, points: 25, icon: '🏃' },
    { id: 4, title: '共同完成手工制作', category: 'art', bondGain: 15, points: 30, icon: '✂️' },
    { id: 5, title: '亲子绘画时光', category: 'art', bondGain: 10, points: 20, icon: '🎨' },
    { id: 6, title: '一起做家务', category: 'life', bondGain: 8, points: 15, icon: '🧹' },
    { id: 7, title: '亲子游戏时间', category: 'game', bondGain: 10, points: 20, icon: '🎮' },
    { id: 8, title: '睡前故事时光', category: 'reading', bondGain: 12, points: 25, icon: '🌙' },
    { id: 9, title: '亲子运动挑战', category: 'sports', bondGain: 15, points: 30, icon: '🏆' },
    { id: 10, title: '一起观看教育视频', category: 'learning', bondGain: 8, points: 15, icon: '📺' }
  ]
}

/**
 * 获取羁绊等级配置
 */
export const getBondLevelConfig = () => {
  return [
    { level: 1, name: '初次相识', minBond: 0, maxBond: 49, color: '#A0A0A0', icon: '🤝' },
    { level: 2, name: '情投意合', minBond: 50, maxBond: 149, color: '#4CAF50', icon: '💚' },
    { level: 3, name: '默契满分', minBond: 150, maxBond: 299, color: '#2196F3', icon: '💙' },
    { level: 4, name: '心有灵犀', minBond: 300, maxBond: 499, color: '#9C27B0', icon: '💜' },
    { level: 5, name: '灵魂伴侣', minBond: 500, maxBond: Infinity, color: '#FF9800', icon: '💛' }
  ]
}

/**
 * 获取家庭竞赛类型配置
 */
export const getBattleCategoryConfig = () => {
  return [
    { id: 'points', name: '积分对决', icon: '⭐', description: '比拼积分获取数量' },
    { id: 'tasks', name: '任务完成数', icon: '📋', description: '比拼任务完成数量' },
    { id: 'bond', name: '羁绊值增长', icon: '💕', description: '比拼羁绊值增长' }
  ]
}

/**
 * 格式化羁绊值显示
 */
export const formatBondValue = (value) => {
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k'
  }
  return value.toString()
}

/**
 * 获取羁绊等级进度百分比
 */
export const getBondProgressPercent = (currentValue, nextThreshold) => {
  if (!nextThreshold) return 100
  const prevThreshold = getPrevThreshold(currentValue)
  return Math.round(((currentValue - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
}

/**
 * 获取前一个阈值
 */
const getPrevThreshold = (value) => {
  if (value >= 500) return 500
  if (value >= 300) return 300
  if (value >= 150) return 150
  if (value >= 50) return 50
  return 0
}

/**
 * 生成任务完成通知
 */
export const generateTaskCompleteNotification = (task, teamName) => {
  return {
    title: '🎉 协作任务完成',
    content: `您和 "${teamName}" 共同完成了 "${task.title}"，获得 ${task.pointsReward} 积分和 ${task.bondReward} 羁绊值！`,
    type: 'task_complete',
    taskId: task.id
  }
}

/**
 * 生成竞赛结束通知
 */
export const generateBattleEndNotification = (battle, rankings) => {
  const winner = rankings[0]
  return {
    title: '🏆 家庭竞赛结束',
    content: `"${battle.title}" 已结束！冠军：${winner.name}，得分：${winner.score}`,
    type: 'battle_end',
    battleId: battle.id
  }
}

/**
 * 计算协作任务进度描述
 */
export const getTaskProgressDescription = (task) => {
  const percent = Math.round((task.currentProgress / task.targetValue) * 100)
  const members = Object.keys(task.contributions).length
  const activeMembers = Object.values(task.contributions).filter(v => v > 0).length

  if (percent >= 100) {
    return '任务已完成！'
  } else if (percent >= 75) {
    return '即将完成，还差一点！'
  } else if (percent >= 50) {
    return `进行中 (${activeMembers}/${members} 成员已参与)`
  } else if (percent > 0) {
    return `刚开始...`
  } else {
    return '等待开始'
  }
}

/**
 * 校验亲子组队数据
 */
export const validateTeamData = (name, parentId, childId) => {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: '请输入队伍名称' }
  }
  if (!parentId) {
    return { valid: false, message: '请选择家长' }
  }
  if (!childId) {
    return { valid: false, message: '请选择孩子' }
  }
  if (parentId === childId) {
    return { valid: false, message: '家长和孩子不能是同一个人' }
  }
  return { valid: true }
}

/**
 * 校验协作任务数据
 */
export const validateTaskData = (title, targetValue, duration) => {
  if (!title || title.trim().length === 0) {
    return { valid: false, message: '请输入任务名称' }
  }
  if (!targetValue || targetValue < 1) {
    return { valid: false, message: '目标值必须大于0' }
  }
  if (!duration || duration < 1) {
    return { valid: false, message: '持续时间必须大于0' }
  }
  return { valid: true }
}

/**
 * 校验家庭竞赛数据
 */
export const validateBattleData = (title, participantIds, duration) => {
  if (!title || title.trim().length === 0) {
    return { valid: false, message: '请输入竞赛名称' }
  }
  if (!participantIds || participantIds.length < 2) {
    return { valid: false, message: '至少需要2名参与者' }
  }
  if (!duration || duration < 1) {
    return { valid: false, message: '持续时间必须大于0' }
  }
  return { valid: true }
}
