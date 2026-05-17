import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

// Node type definitions
export const NODE_TYPES = {
  checkin: { icon: '✅', label: '打卡任务', color: '#10B981' },
  study: { icon: '📚', label: '学习任务', color: '#3B82F6' },
  exercise: { icon: '🏃', label: '运动任务', color: '#F59E0B' },
  habit: { icon: '🌱', label: '习惯养成', color: '#8B5CF6' }
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
    const newNode = {
      id: uuidv4(),
      type,
      x,
      y,
      label: nodeType.label,
      config: {
        title: nodeType.label,
        description: '',
        points: 5
      }
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
    closeFlow
  }
})