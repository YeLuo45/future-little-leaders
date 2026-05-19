// src/stores/pblStore.js
// V72 PBL Project Learning System — 项目制学习系统

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore'

// ============================================================================
// Types & Constants
// ============================================================================

// 项目分类
export const PROJECT_CATEGORIES = {
  SCIENCE: 'science',     // 科学
  SOCIAL: 'social',       // 社会
  ENVIRONMENT: 'environment'  // 环境
}

export const CATEGORY_INFO = {
  [PROJECT_CATEGORIES.SCIENCE]: { label: '科学', icon: '🔬', color: '#1890FF' },
  [PROJECT_CATEGORIES.SOCIAL]: { label: '社会', icon: '🏛️', color: '#FA8C16' },
  [PROJECT_CATEGORIES.ENVIRONMENT]: { label: '环境', icon: '🌱', color: '#52C41A' }
}

// 难度等级
export const DIFFICULTY_LEVELS = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3
}

export const DIFFICULTY_INFO = {
  [DIFFICULTY_LEVELS.EASY]: { label: '简单', color: '#52C41A' },
  [DIFFICULTY_LEVELS.MEDIUM]: { label: '中等', color: '#FA8C16' },
  [DIFFICULTY_LEVELS.HARD]: { label: '困难', color: '#F5222D' }
}

// 项目阶段
export const PROJECT_STAGES = {
  EXPLORATION: 'exploration',     // 探索阶段
  PLANNING: 'planning',           // 计划阶段
  EXECUTION: 'execution',          // 执行阶段
  PRESENTATION: 'presentation',    // 展示阶段
  REFLECTION: 'reflection'         // 反思阶段
}

export const STAGE_INFO = {
  [PROJECT_STAGES.EXPLORATION]: { label: '探索', icon: '🔍', order: 1 },
  [PROJECT_STAGES.PLANNING]: { label: '计划', icon: '📋', order: 2 },
  [PROJECT_STAGES.EXECUTION]: { label: '执行', icon: '⚙️', order: 3 },
  [PROJECT_STAGES.PRESENTATION]: { label: '展示', icon: '🎤', order: 4 },
  [PROJECT_STAGES.REFLECTION]: { label: '反思', icon: '💭', order: 5 }
}

// 团队角色
export const TEAM_ROLES = {
  LEADER: 'leader',           // 组长
  RECORDER: 'recorder',       // 记录员
  PRESENTER: 'presenter',     // 展示员
  RESEARCHER: 'researcher'    // 调研员
}

export const ROLE_INFO = {
  [TEAM_ROLES.LEADER]: { label: '组长', icon: '👑', color: '#F5222D' },
  [TEAM_ROLES.RECORDER]: { label: '记录员', icon: '✏️', color: '#1890FF' },
  [TEAM_ROLES.PRESENTER]: { label: '展示员', icon: '🎤', color: '#722ED1' },
  [TEAM_ROLES.RESEARCHER]: { label: '调研员', icon: '🔬', color: '#52C41A' }
}

// localStorage keys
const PROJECTS_KEY = 'pbl_projects'
const TEAMS_KEY = 'pbl_teams'
const TEAM_MEMBERS_KEY = 'pbl_team_members'
const PROJECT_PROGRESS_KEY = 'pbl_project_progress'

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_PROJECTS = [
  {
    id: 'proj_1',
    name: '校园植物调查',
    description: '调查校园内不同植物的种类、分布和生长环境',
    category: PROJECT_CATEGORIES.SCIENCE,
    difficulty: DIFFICULTY_LEVELS.EASY,
    duration: '2周',
    stages: Object.values(PROJECT_STAGES),
    coverImage: '',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'proj_2',
    name: '社区垃圾分类研究',
    description: '调研社区垃圾分类现状，提出改进建议',
    category: PROJECT_CATEGORIES.ENVIRONMENT,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    duration: '3周',
    stages: Object.values(PROJECT_STAGES),
    coverImage: '',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 'proj_3',
    name: '传统节日文化探索',
    description: '了解传统节日的由来、习俗和文化意义',
    category: PROJECT_CATEGORIES.SOCIAL,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    duration: '4周',
    stages: Object.values(PROJECT_STAGES),
    coverImage: '',
    createdAt: new Date(Date.now() - 21 * 86400000).toISOString()
  },
  {
    id: 'proj_4',
    name: '水资源保护行动',
    description: '调查学校或社区水资源使用情况，提出节水方案',
    category: PROJECT_CATEGORIES.ENVIRONMENT,
    difficulty: DIFFICULTY_LEVELS.HARD,
    duration: '4周',
    stages: Object.values(PROJECT_STAGES),
    coverImage: '',
    createdAt: new Date(Date.now() - 28 * 86400000).toISOString()
  },
  {
    id: 'proj_5',
    name: '简易风力发电机制作',
    description: '设计并制作简易风力发电机模型',
    category: PROJECT_CATEGORIES.SCIENCE,
    difficulty: DIFFICULTY_LEVELS.HARD,
    duration: '3周',
    stages: Object.values(PROJECT_STAGES),
    coverImage: '',
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString()
  }
]

const MOCK_TEAMS = [
  {
    id: 'team_1',
    projectId: 'proj_1',
    name: '植物探索小队',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'team_2',
    projectId: 'proj_2',
    name: '环保先锋组',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  }
]

const MOCK_TEAM_MEMBERS = [
  { id: 'tm_1', teamId: 'team_1', babyId: 'baby_1', role: TEAM_ROLES.LEADER, name: '小明', joinedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'tm_2', teamId: 'team_1', babyId: 'baby_2', role: TEAM_ROLES.RECORDER, name: '小红', joinedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'tm_3', teamId: 'team_2', babyId: 'baby_1', role: TEAM_ROLES.LEADER, name: '小明', joinedAt: new Date(Date.now() - 10 * 86400000).toISOString() }
]

const MOCK_PROGRESS = [
  {
    id: 'prog_1',
    projectId: 'proj_1',
    teamId: 'team_1',
    babyId: 'baby_1',
    currentStage: PROJECT_STAGES.PLANNING,
    tasks: [
      { id: 'task_1', title: '确定调查范围', completed: true, completedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
      { id: 'task_2', title: '制作调查表格', completed: true, completedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: 'task_3', title: '实地调查', completed: false }
    ],
    notes: '已完成初步探索，准备开始实地调查',
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
]

// ============================================================================
// Store Definition
// ============================================================================

export const usePblStore = defineStore('pbl', () => {
  const babyStore = useBabyStore()

  // ---------- State ----------
  const projects = ref([])                 // 项目列表
  const teams = ref([])                   // 团队列表
  const teamMembers = ref([])             // 团队成员列表
  const projectProgress = ref([])          // 项目进度
  const currentProjectId = ref(null)       // 当前选中的项目ID
  const currentTeamId = ref(null)          // 当前选中的团队ID
  const filterCategory = ref(null)        // 筛选分类
  const filterDifficulty = ref(null)      // 筛选难度

  // ---------- Computed ----------

  // 当前宝宝ID
  const currentBabyId = computed(() => babyStore.currentBabyId)

  // 过滤后的项目列表
  const filteredProjects = computed(() => {
    let result = projects.value
    if (filterCategory.value) {
      result = result.filter(p => p.category === filterCategory.value)
    }
    if (filterDifficulty.value) {
      result = result.filter(p => p.difficulty === filterDifficulty.value)
    }
    return result
  })

  // 按分类统计项目数量
  const projectsByCategory = computed(() => {
    const counts = {}
    Object.keys(PROJECT_CATEGORIES).forEach(key => {
      counts[PROJECT_CATEGORIES[key]] = projects.value.filter(p => p.category === PROJECT_CATEGORIES[key]).length
    })
    return counts
  })

  // 当前项目的进度
  const currentProjectProgress = computed(() => {
    if (!currentProjectId.value) return null
    return projectProgress.value.find(p => p.projectId === currentProjectId.value && p.babyId === currentBabyId.value)
  })

  // 当前团队信息
  const currentTeam = computed(() => {
    if (!currentTeamId.value) return null
    return teams.value.find(t => t.id === currentTeamId.value)
  })

  // 当前团队的成员
  const currentTeamMembers = computed(() => {
    if (!currentTeamId.value) return []
    return teamMembers.value.filter(m => m.teamId === currentTeamId.value)
  })

  // 我参与的团队
  const myTeams = computed(() => {
    if (!currentBabyId.value) return []
    const myMemberIds = teamMembers.value
      .filter(m => m.babyId === currentBabyId.value)
      .map(m => m.teamId)
    return teams.value.filter(t => myMemberIds.includes(t.id))
  })

  // ---------- ID Generation ----------

  const generateId = (prefix) => {
    return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`
  }

  // ---------- Init ----------

  const init = () => {
    loadProjects()
    loadTeams()
    loadTeamMembers()
    loadProjectProgress()
  }

  // ---------- Project Methods ----------

  const loadProjects = () => {
    try {
      const stored = uni.getStorageSync(PROJECTS_KEY)
      if (stored) {
        projects.value = JSON.parse(stored)
      } else {
        projects.value = MOCK_PROJECTS
        saveProjects()
      }
    } catch (e) {
      console.error('[PblStore] 加载项目失败:', e)
      projects.value = MOCK_PROJECTS
    }
  }

  const saveProjects = () => {
    try {
      uni.setStorageSync(PROJECTS_KEY, JSON.stringify(projects.value))
    } catch (e) {
      console.error('[PblStore] 保存项目失败:', e)
    }
  }

  const getProjectById = (projectId) => {
    return projects.value.find(p => p.id === projectId)
  }

  const selectProject = (projectId) => {
    currentProjectId.value = projectId
  }

  // ---------- Team Methods ----------

  const loadTeams = () => {
    try {
      const stored = uni.getStorageSync(TEAMS_KEY)
      if (stored) {
        teams.value = JSON.parse(stored)
      } else {
        teams.value = MOCK_TEAMS
        saveTeams()
      }
    } catch (e) {
      console.error('[PblStore] 加载团队失败:', e)
      teams.value = MOCK_TEAMS
    }
  }

  const saveTeams = () => {
    try {
      uni.setStorageSync(TEAMS_KEY, JSON.stringify(teams.value))
    } catch (e) {
      console.error('[PblStore] 保存团队失败:', e)
    }
  }

  const createTeam = (projectId, teamName) => {
    const team = {
      id: generateId('team'),
      projectId,
      name: teamName,
      createdAt: new Date().toISOString()
    }
    teams.value.push(team)
    saveTeams()
    return team
  }

  const joinTeam = (teamId, babyId, name, role = TEAM_ROLES.RESEARCHER) => {
    const existing = teamMembers.value.find(m => m.teamId === teamId && m.babyId === babyId)
    if (existing) return existing

    const member = {
      id: generateId('tm'),
      teamId,
      babyId,
      role,
      name,
      joinedAt: new Date().toISOString()
    }
    teamMembers.value.push(member)
    saveTeamMembers()
    return member
  }

  const leaveTeam = (teamId, babyId) => {
    const index = teamMembers.value.findIndex(m => m.teamId === teamId && m.babyId === babyId)
    if (index !== -1) {
      teamMembers.value.splice(index, 1)
      saveTeamMembers()
    }
  }

  const selectTeam = (teamId) => {
    currentTeamId.value = teamId
  }

  // ---------- Team Member Methods ----------

  const loadTeamMembers = () => {
    try {
      const stored = uni.getStorageSync(TEAM_MEMBERS_KEY)
      if (stored) {
        teamMembers.value = JSON.parse(stored)
      } else {
        teamMembers.value = MOCK_TEAM_MEMBERS
        saveTeamMembers()
      }
    } catch (e) {
      console.error('[PblStore] 加载团队成员失败:', e)
      teamMembers.value = MOCK_TEAM_MEMBERS
    }
  }

  const saveTeamMembers = () => {
    try {
      uni.setStorageSync(TEAM_MEMBERS_KEY, JSON.stringify(teamMembers.value))
    } catch (e) {
      console.error('[PblStore] 保存团队成员失败:', e)
    }
  }

  const updateMemberRole = (memberId, newRole) => {
    const member = teamMembers.value.find(m => m.id === memberId)
    if (member) {
      member.role = newRole
      saveTeamMembers()
    }
  }

  const getTeamMembers = (teamId) => {
    return teamMembers.value.filter(m => m.teamId === teamId)
  }

  // ---------- Progress Methods ----------

  const loadProjectProgress = () => {
    try {
      const stored = uni.getStorageSync(PROJECT_PROGRESS_KEY)
      if (stored) {
        projectProgress.value = JSON.parse(stored)
      } else {
        projectProgress.value = MOCK_PROGRESS
        saveProjectProgress()
      }
    } catch (e) {
      console.error('[PblStore] 加载进度失败:', e)
      projectProgress.value = MOCK_PROGRESS
    }
  }

  const saveProjectProgress = () => {
    try {
      uni.setStorageSync(PROJECT_PROGRESS_KEY, JSON.stringify(projectProgress.value))
    } catch (e) {
      console.error('[PblStore] 保存进度失败:', e)
    }
  }

  const getOrCreateProgress = (projectId, teamId, babyId) => {
    let progress = projectProgress.value.find(
      p => p.projectId === projectId && p.teamId === teamId && p.babyId === babyId
    )
    if (!progress) {
      const project = getProjectById(projectId)
      progress = {
        id: generateId('prog'),
        projectId,
        teamId,
        babyId,
        currentStage: PROJECT_STAGES.EXPLORATION,
        tasks: [],
        notes: '',
        updatedAt: new Date().toISOString()
      }
      if (project) {
        progress.tasks = project.stages.map((stage, index) => ({
          id: generateId('task'),
          title: `阶段${index + 1}：${STAGE_INFO[stage]?.label || stage}`,
          completed: index === 0,
          completedAt: index === 0 ? new Date().toISOString() : null
        }))
      }
      projectProgress.value.push(progress)
      saveProjectProgress()
    }
    return progress
  }

  const advanceStage = (projectId, teamId, babyId) => {
    const progress = getOrCreateProgress(projectId, teamId, babyId)
    const stages = Object.values(PROJECT_STAGES)
    const currentIndex = stages.indexOf(progress.currentStage)
    if (currentIndex < stages.length - 1) {
      progress.currentStage = stages[currentIndex + 1]
      progress.updatedAt = new Date().toISOString()
      // 标记当前阶段任务完成
      const currentTask = progress.tasks.find(t => t.title.includes(STAGE_INFO[progress.currentStage]?.label || ''))
      if (currentTask && !currentTask.completed) {
        currentTask.completed = true
        currentTask.completedAt = new Date().toISOString()
      }
      saveProjectProgress()
      return true
    }
    return false
  }

  const completeStage = (projectId, teamId, babyId) => {
    return advanceStage(projectId, teamId, babyId)
  }

  const updateProgressNotes = (projectId, teamId, babyId, notes) => {
    const progress = getOrCreateProgress(projectId, teamId, babyId)
    progress.notes = notes
    progress.updatedAt = new Date().toISOString()
    saveProjectProgress()
  }

  const getProjectProgress = (projectId, teamId, babyId) => {
    return projectProgress.value.find(
      p => p.projectId === projectId && p.teamId === teamId && p.babyId === babyId
    )
  }

  const getMyProjects = () => {
    if (!currentBabyId.value) return []
    const myTeamIds = teamMembers.value
      .filter(m => m.babyId === currentBabyId.value)
      .map(m => m.teamId)
    const myTeamProjects = teams.value
      .filter(t => myTeamIds.includes(t.id))
      .map(t => t.projectId)
    return projects.value.filter(p => myTeamProjects.includes(p.id))
  }

  // ---------- Filter Methods ----------

  const setFilter = (category, difficulty) => {
    filterCategory.value = category
    filterDifficulty.value = difficulty
  }

  const clearFilters = () => {
    filterCategory.value = null
    filterDifficulty.value = null
  }

  // ---------- Utility ----------

  const formatTime = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'

    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const getStageProgress = (projectId) => {
    if (!currentBabyId.value) return 0
    const progress = projectProgress.value.find(
      p => p.projectId === projectId && p.babyId === currentBabyId.value
    )
    if (!progress) return 0
    const stages = Object.values(PROJECT_STAGES)
    const currentIndex = stages.indexOf(progress.currentStage)
    return Math.round(((currentIndex + 1) / stages.length) * 100)
  }

  return {
    // State
    projects,
    teams,
    teamMembers,
    projectProgress,
    currentProjectId,
    currentTeamId,
    filterCategory,
    filterDifficulty,

    // Computed
    currentBabyId,
    filteredProjects,
    projectsByCategory,
    currentProjectProgress,
    currentTeam,
    currentTeamMembers,
    myTeams,

    // Methods
    init,
    generateId,
    loadProjects,
    saveProjects,
    getProjectById,
    selectProject,
    createTeam,
    joinTeam,
    leaveTeam,
    selectTeam,
    loadTeamMembers,
    saveTeamMembers,
    updateMemberRole,
    getTeamMembers,
    getOrCreateProgress,
    advanceStage,
    completeStage,
    updateProgressNotes,
    getProjectProgress,
    getMyProjects,
    setFilter,
    clearFilters,
    formatTime,
    getStageProgress,

    // Constants
    PROJECT_CATEGORIES,
    CATEGORY_INFO,
    DIFFICULTY_LEVELS,
    DIFFICULTY_INFO,
    PROJECT_STAGES,
    STAGE_INFO,
    TEAM_ROLES,
    ROLE_INFO
  }
})
