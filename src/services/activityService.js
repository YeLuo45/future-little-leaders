/**
 * V45 亲子活动服务
 * 支持亲子活动库、步骤指导、协作任务、成果展示
 */

// localStorage keys
const ACTIVITIES_KEY = 'parent_child_activities'
const CREATIONS_KEY = 'my_creations'
const COLLAB_TASKS_KEY = 'collab_tasks'

// 活动类型
export const ACTIVITY_TYPES = {
  handcraft: { id: 'handcraft', name: '手工', icon: '🎨', color: '#FF6B6B' },
  science: { id: 'science', name: '科学实验', icon: '🔬', color: '#4ECDC4' },
  cooking: { id: 'cooking', name: '烹饪', icon: '🍳', color: '#FFE66D' },
  gardening: { id: 'gardening', name: '园艺', icon: '🌱', color: '#95E1A3' }
}

// 年龄段
export const AGE_GROUPS = {
  3_5: { id: '3_5', name: '3-5岁', min: 3, max: 5 },
  6_8: { id: '6_8', name: '6-8岁', min: 6, max: 8 },
  9_12: { id: '9_12', name: '9-12岁', min: 9, max: 12 }
}

// 内置活动数据
const BUILT_IN_ACTIVITIES = [
  {
    id: 'activity_1',
    type: 'handcraft',
    title: '彩色纸风车',
    description: '用彩纸制作可爱的风车，锻炼孩子动手能力',
    ageGroup: '3_5',
    duration: 30,
    difficulty: 'easy',
    materials: ['彩色卡纸', '剪刀', '图钉', '木棍'],
    steps: [
      { order: 1, content: '将正方形彩纸沿对角线对折', timer: 0 },
      { order: 2, content: '沿另一条对角线再对折', timer: 0 },
      { order: 3, content: '用剪刀从四角向中心剪开（留2cm不剪断）', timer: 0 },
      { order: 4, content: '将剪开的四个角折向中心，用图钉固定', timer: 0 },
      { order: 5, content: '把图钉固定在木棍上，完成！', timer: 0 }
    ],
    points: 20,
    collabPoints: 10,
    image: '/static/images/activity-windmill.png'
  },
  {
    id: 'activity_2',
    type: 'science',
    title: '彩虹摩天轮',
    description: '利用水与光线折射原理制作彩虹摩天轮',
    ageGroup: '6_8',
    duration: 45,
    difficulty: 'medium',
    materials: ['水彩纸', '剪刀', '水彩笔', '胶水', '手电筒'],
    steps: [
      { order: 1, content: '在纸上画一个圆，分成6等份', timer: 300 },
      { order: 2, content: '用不同颜色涂满每个区域', timer: 600 },
      { order: 3, content: '剪下圆形，在中心戳一个小孔', timer: 0 },
      { order: 4, content: '用手电筒照射旋转的纸盘，观察彩虹效果', timer: 0 }
    ],
    points: 30,
    collabPoints: 15,
    image: '/static/images/activity-rainbow.png'
  },
  {
    id: 'activity_3',
    type: 'cooking',
    title: '水果拼盘',
    description: '一起制作美丽的水果拼盘，学习水果知识',
    ageGroup: '3_5',
    duration: 30,
    difficulty: 'easy',
    materials: ['各种水果', '切菜板', '儿童安全刀', '牙签'],
    steps: [
      { order: 1, content: '和孩子一起清洗水果', timer: 0 },
      { order: 2, content: '认识不同水果的颜色和形状', timer: 0 },
      { order: 3, content: '在切菜板上切成小块（家长协助）', timer: 0 },
      { order: 4, content: '一起摆出漂亮的图案', timer: 0 },
      { order: 5, content: '用牙签固定，拍照留念！', timer: 0 }
    ],
    points: 25,
    collabPoints: 12,
    image: '/static/images/activity-fruit.png'
  },
  {
    id: 'activity_4',
    type: 'gardening',
    title: '豆芽成长记',
    description: '观察豆芽的生长过程，记录植物成长',
    ageGroup: '6_8',
    duration: 1440,
    difficulty: 'easy',
    materials: ['绿豆', '浇水壶', '透明容器', '湿纸巾', '记录本'],
    steps: [
      { order: 1, content: '将绿豆浸泡在水中8小时', timer: 480 },
      { order: 2, content: '把绿豆放入透明容器，铺在湿纸巾上', timer: 0 },
      { order: 3, content: '每天浇水2次，记录豆芽生长情况', timer: 0 },
      { order: 4, content: '观察并记录：第1天、第3天、第5天的变化', timer: 0 },
      { order: 5, content: '拍摄豆芽成长照片，完成记录本', timer: 0 }
    ],
    points: 35,
    collabPoints: 18,
    image: '/static/images/activity-sprout.png'
  },
  {
    id: 'activity_5',
    type: 'science',
    title: '火山爆发实验',
    description: '模拟火山爆发，学习化学反应知识',
    ageGroup: '9_12',
    duration: 60,
    difficulty: 'medium',
    materials: ['小苏打', '白醋', '红色食用色素', '洗洁精', '塑料瓶', '橡皮泥'],
    steps: [
      { order: 1, content: '用橡皮泥在塑料瓶周围堆成火山形状', timer: 900 },
      { order: 2, content: '在瓶中加入3勺小苏打', timer: 0 },
      { order: 3, content: '滴入几滴红色色素和洗洁精', timer: 0 },
      { order: 4, content: '慢慢倒入白醋，观察火山爆发！', timer: 0 },
      { order: 5, content: '解释原理：小苏打+醋=二氧化碳气体', timer: 0 }
    ],
    points: 40,
    collabPoints: 20,
    image: '/static/images/activity-volcano.png'
  },
  {
    id: 'activity_6',
    type: 'handcraft',
    title: '手工贺卡',
    description: '为父母制作感恩节贺卡',
    ageGroup: '6_8',
    duration: 40,
    difficulty: 'easy',
    materials: ['卡纸', '彩纸', '剪刀', '胶水', '水彩笔', '亮片'],
    steps: [
      { order: 1, content: '对折卡纸作为贺卡底', timer: 0 },
      { order: 2, content: '用彩纸剪出心形或其他图案', timer: 600 },
      { order: 3, content: '装饰贺卡正面，贴上亮片', timer: 0 },
      { order: 4, content: '写下想对爸爸妈妈说的话', timer: 0 },
      { order: 5, content: '完成！拍照留念或直接送给爸爸妈妈', timer: 0 }
    ],
    points: 22,
    collabPoints: 11,
    image: '/static/images/activity-card.png'
  }
]

// 获取所有活动
export const getActivities = () => {
  try {
    const stored = uni.getStorageSync(ACTIVITIES_KEY)
    if (stored) {
      const customActivities = JSON.parse(stored)
      return [...BUILT_IN_ACTIVITIES, ...customActivities]
    }
    return BUILT_IN_ACTIVITIES
  } catch (e) {
    console.error('获取活动列表失败:', e)
    return BUILT_IN_ACTIVITIES
  }
}

// 按条件筛选活动
export const filterActivities = (filters = {}) => {
  const allActivities = getActivities()
  return allActivities.filter(activity => {
    if (filters.type && activity.type !== filters.type) return false
    if (filters.ageGroup && activity.ageGroup !== filters.ageGroup) return false
    if (filters.difficulty && activity.difficulty !== filters.difficulty) return false
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      if (!activity.title.toLowerCase().includes(keyword) &&
          !activity.description.toLowerCase().includes(keyword)) {
        return false
      }
    }
    return true
  })
}

// 获取单个活动详情
export const getActivityById = (id) => {
  const activities = getActivities()
  return activities.find(a => a.id === id) || null
}

// 添加自定义活动
export const addCustomActivity = (activity) => {
  try {
    const stored = uni.getStorageSync(ACTIVITIES_KEY)
    const customActivities = stored ? JSON.parse(stored) : []
    const newActivity = {
      ...activity,
      id: 'custom_' + Date.now(),
      createdAt: new Date().toISOString()
    }
    customActivities.unshift(newActivity)
    uni.setStorageSync(ACTIVITIES_KEY, JSON.stringify(customActivities))
    return newActivity
  } catch (e) {
    console.error('添加自定义活动失败:', e)
    return null
  }
}

// 获取我的成果
export const getCreations = () => {
  try {
    const stored = uni.getStorageSync(CREATIONS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取成果列表失败:', e)
    return []
  }
}

// 添加成果
export const addCreation = (creation) => {
  try {
    const creations = getCreations()
    const newCreation = {
      ...creation,
      id: 'creation_' + Date.now(),
      createdAt: new Date().toISOString()
    }
    creations.unshift(newCreation)
    uni.setStorageSync(CREATIONS_KEY, JSON.stringify(creations))
    return newCreation
  } catch (e) {
    console.error('添加成果失败:', e)
    return null
  }
}

// 更新成果
export const updateCreation = (id, updates) => {
  try {
    const creations = getCreations()
    const index = creations.findIndex(c => c.id === id)
    if (index !== -1) {
      creations[index] = { ...creations[index], ...updates }
      uni.setStorageSync(CREATIONS_KEY, JSON.stringify(creations))
      return creations[index]
    }
    return null
  } catch (e) {
    console.error('更新成果失败:', e)
    return null
  }
}

// 删除成果
export const deleteCreation = (id) => {
  try {
    const creations = getCreations()
    const filtered = creations.filter(c => c.id !== id)
    uni.setStorageSync(CREATIONS_KEY, JSON.stringify(filtered))
    return true
  } catch (e) {
    console.error('删除成果失败:', e)
    return false
  }
}

// 获取协作任务
export const getCollabTasks = () => {
  try {
    const stored = uni.getStorageSync(COLLAB_TASKS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('获取协作任务失败:', e)
    return []
  }
}

// 创建协作任务
export const createCollabTask = (task) => {
  try {
    const tasks = getCollabTasks()
    const newTask = {
      ...task,
      id: 'collab_' + Date.now(),
      status: 'pending',
      parentCompleted: false,
      childCompleted: false,
      createdAt: new Date().toISOString()
    }
    tasks.unshift(newTask)
    uni.setStorageSync(COLLAB_TASKS_KEY, JSON.stringify(tasks))
    return newTask
  } catch (e) {
    console.error('创建协作任务失败:', e)
    return null
  }
}

// 更新协作任务进度
export const updateCollabTask = (id, updates) => {
  try {
    const tasks = getCollabTasks()
    const index = tasks.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates }
      // 检查是否双方都完成
      if (tasks[index].parentCompleted && tasks[index].childCompleted) {
        tasks[index].status = 'completed'
        tasks[index].completedAt = new Date().toISOString()
      }
      uni.setStorageSync(COLLAB_TASKS_KEY, JSON.stringify(tasks))
      return tasks[index]
    }
    return null
  } catch (e) {
    console.error('更新协作任务失败:', e)
    return null
  }
}

// 完成任务获得积分
export const awardCollabPoints = (taskId, points) => {
  try {
    const pointsStore = require('./pointsStore').usePointsStore?.()
    if (pointsStore) {
      // 家长和孩子各获得一半积分
      const parentPoints = Math.floor(points / 2)
      const childPoints = Math.floor(points / 2)
      // 这里需要根据实际用户角色来分配
      // 暂时存入家庭积分池
      const familyService = require('./familyService')
      const currentPool = familyService.getFamilyPoolBalance()
      familyService.setFamilyPoolBalance(currentPool + points)
      return { parentPoints, childPoints, totalPoints: points }
    }
    return null
  } catch (e) {
    console.error('奖励积分失败:', e)
    return null
  }
}

// 分享成果
export const shareCreation = (creationId, channel = 'family') => {
  try {
    const creations = getCreations()
    const creation = creations.find(c => c.id === creationId)
    if (!creation) return null

    const shareData = {
      id: creation.id,
      title: creation.title,
      description: creation.description,
      image: creation.photo,
      channel,
      sharedAt: new Date().toISOString()
    }
    // 实际分享逻辑由uni.share处理
    return shareData
  } catch (e) {
    console.error('分享成果失败:', e)
    return null
  }
}

export default {
  ACTIVITY_TYPES,
  AGE_GROUPS,
  getActivities,
  filterActivities,
  getActivityById,
  addCustomActivity,
  getCreations,
  addCreation,
  updateCreation,
  deleteCreation,
  getCollabTasks,
  createCollabTask,
  updateCollabTask,
  awardCollabPoints,
  shareCreation
}
