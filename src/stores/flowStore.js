import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

// Node type definitions
export const NODE_TYPES = {
  checkin:   { icon: '✅', label: '打卡任务',   color: '#10B981' },
  study:     { icon: '📚', label: '学习任务',   color: '#3B82F6' },
  exercise:  { icon: '🏃', label: '运动任务',   color: '#F59E0B' },
  habit:     { icon: '🌱', label: '习惯养成',   color: '#8B5CF6' },
  condition: { icon: '🔀', label: '条件分支',   color: '#EC4899' },
  'ai-adjust': { icon: '🧙', label: 'AI难度调整', color: '#8B5CF6' },
  scheduled: { icon: '⏰', label: '定时提醒',   color: '#1890FF' }
}

// localStorage key for flows
const FLOWS_KEY = 'flow_templates'

/**
 * Flow Store - Manages task flow templates
 * Stores flow definitions with nodes and connections in SQLite
 */
export const useFlowStore = defineStore('flow', () => {
  // All saved flows
  const flows = ref([])
  
  // Currently editing flow
  const currentFlow = ref(null)
  
  // Currently selected node ID
  const selectedNodeId = ref(null)
  
  // Computed: nodes of current flow
  const currentNodes = computed(() => {
    return currentFlow.value?.nodes || []
  })
  
  // Computed: connections of current flow
  const currentConnections = computed(() => {
    return currentFlow.value?.connections || []
  })
  
  // Computed: selected node
  const selectedNode = computed(() => {
    if (!selectedNodeId.value || !currentFlow.value) return null
    return currentFlow.value.nodes.find(n => n.id === selectedNodeId.value) || null
  })

  /**
   * Initialize store from localStorage/JSON
   */
  const init = () => {
    console.log('[V5] Initializing flow store...')
    try {
      const stored = uni.getStorageSync(FLOWS_KEY)
      flows.value = stored ? JSON.parse(stored) : []
      console.log('[V5] Loaded flows:', flows.value.length)
    } catch (e) {
      console.error('[V5] Failed to load flows:', e)
      flows.value = []
    }
  }

  /**
   * Save flows to localStorage
   */
  const saveFlows = () => {
    try {
      uni.setStorageSync(FLOWS_KEY, JSON.stringify(flows.value))
      console.log('[V5] Flows saved, count:', flows.value.length)
    } catch (e) {
      console.error('[V5] Failed to save flows:', e)
    }
  }

  /**
   * Create a new empty flow
   * @param {string} name - Flow name
   * @returns {object} New flow object
   */
  const createFlow = (name = '新流程') => {
    const newFlow = {
      id: uuidv4(),
      name,
      nodes: [],
      connections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    flows.value.push(newFlow)
    saveFlows()
    console.log('[V5] Created new flow:', newFlow.id)
    return newFlow
  }

  /**
   * Load a flow for editing
   * @param {string} flowId - Flow ID
   */
  const loadFlow = (flowId) => {
    const flow = flows.value.find(f => f.id === flowId)
    if (flow) {
      currentFlow.value = JSON.parse(JSON.stringify(flow)) // Deep copy
      selectedNodeId.value = null
      console.log('[V5] Loaded flow:', flowId)
    } else {
      console.error('[V5] Flow not found:', flowId)
    }
  }

  /**
   * Save current flow (update in flows array)
   */
  const saveFlow = () => {
    if (!currentFlow.value) return false
    
    const index = flows.value.findIndex(f => f.id === currentFlow.value.id)
    if (index !== -1) {
      currentFlow.value.updatedAt = new Date().toISOString()
      flows.value[index] = JSON.parse(JSON.stringify(currentFlow.value))
      saveFlows()
      console.log('[V5] Flow saved:', currentFlow.value.id)
      return true
    }
    return false
  }

  /**
   * Delete a flow
   * @param {string} flowId - Flow ID to delete
   */
  const deleteFlow = (flowId) => {
    const index = flows.value.findIndex(f => f.id === flowId)
    if (index !== -1) {
      flows.value.splice(index, 1)
      saveFlows()
      console.log('[V5] Flow deleted:', flowId)
      return true
    }
    return false
  }

  /**
   * Add a node to current flow
   * @param {string} type - Node type (checkin/study/exercise/habit)
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {object} New node
   */
  const addNode = (type, x, y) => {
    if (!currentFlow.value) {
      console.error('[V5] No flow loaded')
      return null
    }
    
    const nodeType = NODE_TYPES[type] || NODE_TYPES.checkin
    let defaultConfig = {
      title: nodeType.label,
      description: '',
      points: 5
    }

    // 条件分支节点默认配置
    if (type === 'condition') {
      defaultConfig = {
        title: nodeType.label,
        description: '根据条件选择分支',
        condition: {
          type: 'accuracy',
          operator: 'gte',
          value: 80,
          branches: { yes: null, no: null }
        }
      }
    }

    // AI 调整节点默认配置
    if (type === 'ai-adjust') {
      defaultConfig = {
        title: nodeType.label,
        description: '根据表现动态调整难度',
        mode: 'adaptive',
        threshold: 60,
        step: 1
      }
    }

    // 定时提醒节点默认配置
    if (type === 'scheduled') {
      defaultConfig = {
        title: nodeType.label,
        description: '定时提醒任务执行',
        cycle: 'daily',
        weekdays: [],
        timeOfDay: '09:00',
        reminderTitle: '',
        reminderContent: ''
      }
    }

    const newNode = {
      id: uuidv4(),
      type,
      x,
      y,
      label: nodeType.label,
      config: defaultConfig
    }
    
    currentFlow.value.nodes.push(newNode)
    console.log('[V5] Node added:', newNode.id, type)
    return newNode
  }

  /**
   * Remove a node from current flow
   * @param {string} nodeId - Node ID
   */
  const removeNode = (nodeId) => {
    if (!currentFlow.value) return
    
    // Remove node
    currentFlow.value.nodes = currentFlow.value.nodes.filter(n => n.id !== nodeId)
    
    // Remove related connections
    currentFlow.value.connections = currentFlow.value.connections.filter(
      c => c.source !== nodeId && c.target !== nodeId
    )
    
    if (selectedNodeId.value === nodeId) {
      selectedNodeId.value = null
    }
    
    console.log('[V5] Node removed:', nodeId)
  }

  /**
   * Update node position
   * @param {string} nodeId - Node ID
   * @param {number} x - New X position
   * @param {number} y - New Y position
   */
  const updateNodePosition = (nodeId, x, y) => {
    if (!currentFlow.value) return
    
    const node = currentFlow.value.nodes.find(n => n.id === nodeId)
    if (node) {
      node.x = x
      node.y = y
    }
  }

  /**
   * Update node config
   * @param {string} nodeId - Node ID
   * @param {object} config - New config
   */
  const updateNodeConfig = (nodeId, config) => {
    if (!currentFlow.value) return
    
    const node = currentFlow.value.nodes.find(n => n.id === nodeId)
    if (node) {
      node.config = { ...node.config, ...config }
      console.log('[V5] Node config updated:', nodeId)
    }
  }

  /**
   * Connect two nodes
   * @param {string} sourceId - Source node ID
   * @param {string} targetId - Target node ID
   * @returns {object|null} New connection or null
   */
  const connectNodes = (sourceId, targetId) => {
    if (!currentFlow.value) return null
    
    // Check if connection already exists
    const exists = currentFlow.value.connections.some(
      c => c.source === sourceId && c.target === targetId
    )
    if (exists) {
      console.log('[V5] Connection already exists')
      return null
    }
    
    const newConnection = {
      id: uuidv4(),
      source: sourceId,
      target: targetId
    }
    
    currentFlow.value.connections.push(newConnection)
    console.log('[V5] Nodes connected:', sourceId, '->', targetId)
    return newConnection
  }

  /**
   * Remove a connection
   * @param {string} connectionId - Connection ID
   */
  const removeConnection = (connectionId) => {
    if (!currentFlow.value) return
    
    currentFlow.value.connections = currentFlow.value.connections.filter(
      c => c.id !== connectionId
    )
    console.log('[V5] Connection removed:', connectionId)
  }

  /**
   * Select a node
   * @param {string|null} nodeId - Node ID or null to deselect
   */
  const selectNode = (nodeId) => {
    selectedNodeId.value = nodeId
    console.log('[V5] Node selected:', nodeId)
  }

  /**
   * Duplicate a node
   * @param {string} nodeId - Node ID to duplicate
   * @returns {object|null} New node or null
   */
  const duplicateNode = (nodeId) => {
    if (!currentFlow.value) return null
    
    const node = currentFlow.value.nodes.find(n => n.id === nodeId)
    if (!node) return null
    
    const newNode = {
      ...JSON.parse(JSON.stringify(node)),
      id: uuidv4(),
      x: node.x + 30,
      y: node.y + 30
    }
    
    currentFlow.value.nodes.push(newNode)
    console.log('[V5] Node duplicated:', nodeId, '->', newNode.id)
    return newNode
  }

  /**
   * Clear current flow canvas
   */
  const clearCanvas = () => {
    if (!currentFlow.value) return
    currentFlow.value.nodes = []
    currentFlow.value.connections = []
    selectedNodeId.value = null
    console.log('[V5] Canvas cleared')
  }

  /**
   * Close current flow (clear editing state)
   */
  const closeFlow = () => {
    currentFlow.value = null
    selectedNodeId.value = null
    console.log('[V5] Flow closed')
  }

  // Execution state
  const executionState = ref({})

  /**
   * Save execution state for a flow
   */
  const saveExecutionState = (flowId, state) => {
    executionState.value[flowId] = { ...state, updatedAt: Date.now() }
    try {
      uni.setStorageSync('flow_exec_state', JSON.stringify(executionState.value))
    } catch (e) {
      console.error('[flowStore] saveExecutionState failed:', e)
    }
  }

  /**
   * Load execution state for a flow
   */
  const loadExecutionState = (flowId) => {
    try {
      const stored = uni.getStorageSync('flow_exec_state')
      if (stored) executionState.value = JSON.parse(stored)
    } catch (e) {
      console.error('[flowStore] loadExecutionState failed:', e)
    }
    return executionState.value[flowId] || null
  }

  /**
   * Clear execution state for a flow
   */
  const clearExecutionState = (flowId) => {
    delete executionState.value[flowId]
    try {
      uni.setStorageSync('flow_exec_state', JSON.stringify(executionState.value))
    } catch (e) {
      console.error('[flowStore] clearExecutionState failed:', e)
    }
  }

  /**
   * Get built-in flow templates
   */
  const getBuiltInTemplates = () => {
    return [
      {
        id: 'tpl-21days-habit',
        name: '21天习惯养成',
        icon: '🌱',
        description: '每日打卡任务，配合AI动态调整难度，21天养成好习惯',
        tags: ['习惯', '21天', 'AI'],
        nodes: [
          { id: 'n1', type: 'checkin', x: 200, y: 50, label: '每日打卡', config: { title: '每日打卡', description: '完成当天任务打卡', points: 10 } },
          { id: 'n2', type: 'ai-adjust', x: 200, y: 150, label: 'AI难度调整', config: { title: 'AI难度调整', mode: 'adaptive', threshold: 60, step: 1 } },
          { id: 'n3', type: 'habit', x: 200, y: 250, label: '习惯任务', config: { title: '习惯任务', description: '根据AI建议调整的任务', points: 15 } }
        ],
        connections: [
          { id: 'c1', source: 'n1', target: 'n2' },
          { id: 'c2', source: 'n2', target: 'n3' }
        ]
      },
      {
        id: 'tpl-math-adventure',
        name: '数学闯关',
        icon: '🔢',
        description: '三关数学题，难度递进，连续答对进入下一关',
        tags: ['数学', '闯关'],
        nodes: [
          { id: 'n1', type: 'study', x: 150, y: 50, label: '第一关', config: { title: '第一关：基础题', description: '10以内加减法', points: 5 } },
          { id: 'n2', type: 'condition', x: 150, y: 150, label: '是否过关', config: { title: '是否过关', condition: { type: 'accuracy', operator: 'gte', value: 80, branches: { yes: 'n3', no: 'n4' } } } },
          { id: 'n3', type: 'study', x: 80, y: 250, label: '第二关', config: { title: '第二关：进阶题', description: '20以内加减法', points: 10 } },
          { id: 'n4', type: 'study', x: 220, y: 250, label: '巩固练习', config: { title: '巩固练习', description: '继续练习基础题', points: 5 } },
          { id: 'n5', type: 'study', x: 80, y: 350, label: '第三关', config: { title: '第三关：挑战题', description: '混合运算', points: 15 } }
        ],
        connections: [
          { id: 'c1', source: 'n1', target: 'n2' },
          { id: 'c2', source: 'n2', target: 'n3', branch: 'yes' },
          { id: 'c3', source: 'n2', target: 'n4', branch: 'no' },
          { id: 'c4', source: 'n3', target: 'n5' },
          { id: 'c5', source: 'n4', target: 'n5' }
        ]
      },
      {
        id: 'tpl-weekend-sports',
        name: '周末运动计划',
        icon: '🏃',
        description: '运动任务，条件分支判断天气',
        tags: ['运动', '天气', '周末'],
        nodes: [
          { id: 'n1', type: 'exercise', x: 200, y: 50, label: '户外运动', config: { title: '户外运动', description: '跑步或球类运动30分钟', points: 10 } },
          { id: 'n2', type: 'condition', x: 200, y: 150, label: '天气判断', config: { title: '天气判断', condition: { type: 'accuracy', operator: 'gte', value: 100, branches: { yes: 'n3', no: 'n4' } } } },
          { id: 'n3', type: 'checkin', x: 100, y: 250, label: '户外打卡', config: { title: '户外打卡', description: '完成户外运动', points: 15 } },
          { id: 'n4', type: 'exercise', x: 300, y: 250, label: '室内运动', config: { title: '室内运动', description: '在家做体操或跳绳', points: 10 } }
        ],
        connections: [
          { id: 'c1', source: 'n1', target: 'n2' },
          { id: 'c2', source: 'n2', target: 'n3', branch: 'yes' },
          { id: 'c3', source: 'n2', target: 'n4', branch: 'no' }
        ]
      },
      {
        id: 'tpl-bedtime-reading',
        name: '睡前阅读',
        icon: '📖',
        description: '阅读打卡任务，需要家长确认完成',
        tags: ['阅读', '睡前', '习惯'],
        nodes: [
          { id: 'n1', type: 'habit', x: 200, y: 50, label: '阅读任务', config: { title: '睡前阅读', description: '阅读绘本20分钟', points: 8 } },
          { id: 'n2', type: 'checkin', x: 200, y: 150, label: '打卡记录', config: { title: '打卡记录', description: '记录阅读完成情况', points: 5 } }
        ],
        connections: [
          { id: 'c1', source: 'n1', target: 'n2' }
        ]
      },
      {
        id: 'tpl-weekly-review',
        name: '学习复盘',
        icon: '📊',
        description: '本周学习任务汇总，生成周报',
        tags: ['复盘', '周报', '学习'],
        nodes: [
          { id: 'n1', type: 'study', x: 120, y: 50, label: '数学复盘', config: { title: '数学复盘', description: '回顾本周数学学习', points: 5 } },
          { id: 'n2', type: 'study', x: 280, y: 50, label: '语文复盘', config: { title: '语文复盘', description: '回顾本周语文学习', points: 5 } },
          { id: 'n3', type: 'checkin', x: 200, y: 150, label: '生成周报', config: { title: '生成周报', description: '汇总本周学习情况', points: 10 } }
        ],
        connections: [
          { id: 'c1', source: 'n1', target: 'n3' },
          { id: 'c2', source: 'n2', target: 'n3' }
        ]
      }
    ]
  }

  /**
   * Import a template as a new flow
   */
  const importTemplate = (template) => {
    const newFlow = {
      id: uuidv4(),
      name: template.name,
      nodes: template.nodes.map(n => ({ ...n, id: uuidv4() })),
      connections: [], // 重建连接（复用原ID不行）
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 重建连接（把模板节点ID映射到新ID）
    const nodeIdMap = {}
    template.nodes.forEach((n, i) => {
      nodeIdMap[n.id] = newFlow.nodes[i].id
    })

    // 重新建立连接
    template.connections.forEach(conn => {
      const newSourceId = nodeIdMap[conn.source]
      const newTargetId = nodeIdMap[conn.target]
      if (newSourceId && newTargetId) {
        newFlow.connections.push({
          id: uuidv4(),
          source: newSourceId,
          target: newTargetId,
          branch: conn.branch || null
        })
      }
    })

    flows.value.push(newFlow)
    saveFlows()
    console.log('[V5] Template imported as flow:', newFlow.id, newFlow.name)
    return newFlow
  }

  return {
    // Constants
    NODE_TYPES,

    // State
    flows,
    currentFlow,
    selectedNodeId,

    // Computed
    currentNodes,
    currentConnections,
    selectedNode,

    // Methods
    init,
    createFlow,
    loadFlow,
    saveFlow,
    deleteFlow,
    addNode,
    removeNode,
    updateNodePosition,
    updateNodeConfig,
    connectNodes,
    removeConnection,
    selectNode,
    duplicateNode,
    clearCanvas,
    closeFlow,

    // Execution
    saveExecutionState,
    loadExecutionState,
    clearExecutionState,

    // Templates
    getBuiltInTemplates,
    importTemplate
  }
})