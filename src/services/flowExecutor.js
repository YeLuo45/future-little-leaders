/**
 * FlowExecutor - 流程执行引擎
 * 负责按拓扑顺序执行节点，支持条件分支、AI自适应难度、中断恢复
 */

import { useFlowStore } from '../stores/flowStore.js'
import { useTaskStore } from '../stores/taskStore.js'
import { useChildStore } from '../stores/childStore.js'
import { analyze } from './aiAdjustService.js'

// 执行状态
export const EXEC_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

// 节点状态
export const NODE_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped'
}

const EXEC_KEY = 'flow_executions'

/**
 * 评估条件表达式
 * @param {object} condition - 条件配置 { type, operator, value }
 * @param {object} context - 执行上下文
 * @returns {boolean}
 */
function evaluateCondition(condition, context) {
  if (!condition || !condition.type) return true

  const { type, value } = condition

  switch (type) {
    case 'accuracy':
      return (context.accuracy || 0) >= value
    case 'streak':
      return (context.streak || 0) >= value
    case 'time':
      return (context.elapsed || 999) <= value
    case 'score':
      return (context.score || 0) >= value
    case 'always':
      return true
    case 'never':
      return false
    default:
      return true
  }
}

/**
 * 获取条件节点的分支目标
 */
function getConditionBranch(condition, context) {
  if (!condition || !condition.branches) return { nextNodeId: null, branch: null }
  const satisfied = evaluateCondition(condition, context)
  const branch = satisfied ? 'yes' : 'no'
  const nextNodeId = condition.branches[branch]
  return { nextNodeId, branch, satisfied }
}

/**
 * FlowExecutor 类
 */
class FlowExecutor {
  constructor() {
    this.status = EXEC_STATUS.IDLE
    this.currentFlowId = null
    this.currentNodeId = null
    this.completedNodeIds = []
    this.context = {}
    this.startedAt = null
    this.nodeCallbacks = []
    this.completeCallbacks = []
  }

  /**
   * 从localStorage恢复执行状态
   */
  static restore(flowId) {
    try {
      const stored = uni.getStorageSync(EXEC_KEY)
      if (!stored) return null
      const executions = JSON.parse(stored)
      return executions[flowId] || null
    } catch (e) {
      console.error('[FlowExecutor] restore failed:', e)
      return null
    }
  }

  /**
   * 保存执行状态到localStorage
   */
  _save() {
    if (!this.currentFlowId) return
    try {
      const stored = uni.getStorageSync(EXEC_KEY)
      const executions = stored ? JSON.parse(stored) : {}
      executions[this.currentFlowId] = {
        flowId: this.currentFlowId,
        startedAt: this.startedAt,
        currentNodeId: this.currentNodeId,
        completedNodeIds: this.completedNodeIds,
        context: this.context,
        status: this.status
      }
      uni.setStorageSync(EXEC_KEY, JSON.stringify(executions))
    } catch (e) {
      console.error('[FlowExecutor] _save failed:', e)
    }
  }

  /**
   * 清除执行状态
   */
  static clear(flowId) {
    try {
      const stored = uni.getStorageSync(EXEC_KEY)
      if (!stored) return
      const executions = JSON.parse(stored)
      delete executions[flowId]
      uni.setStorageSync(EXEC_KEY, JSON.stringify(executions))
    } catch (e) {
      console.error('[FlowExecutor] clear failed:', e)
    }
  }

  /**
   * 启动流程
   * @param {string} flowId - 流程ID
   * @param {object} context - 执行上下文 { childId, ... }
   */
  async start(flowId, context = {}) {
    const flowStore = useFlowStore()
    const flow = flowStore.flows.find(f => f.id === flowId)
    if (!flow) {
      console.error('[FlowExecutor] Flow not found:', flowId)
      return false
    }

    const restored = FlowExecutor.restore(flowId)
    if (restored && restored.status === EXEC_STATUS.PAUSED) {
      this._restoreFromState(restored)
    } else {
      this.currentFlowId = flowId
      this.currentNodeId = null
      this.completedNodeIds = []
      this.context = { ...context }
      this.startedAt = Date.now()
    }

    this.status = EXEC_STATUS.RUNNING
    this._save()
    console.log('[FlowExecutor] Started flow:', flowId)
    await this._runNextNode(flow)
    return true
  }

  _restoreFromState(state) {
    this.currentFlowId = state.flowId
    this.currentNodeId = state.currentNodeId
    this.completedNodeIds = state.completedNodeIds || []
    this.context = state.context || {}
    this.startedAt = state.startedAt
  }

  /**
   * 暂停执行
   */
  pause() {
    if (this.status !== EXEC_STATUS.RUNNING) return
    this.status = EXEC_STATUS.PAUSED
    this._save()
  }

  /**
   * 恢复执行
   */
  async resume() {
    if (this.status !== EXEC_STATUS.PAUSED) return false
    const flowStore = useFlowStore()
    const flow = flowStore.flows.find(f => f.id === this.currentFlowId)
    if (!flow) return false
    this.status = EXEC_STATUS.RUNNING
    this._save()
    await this._runNextNode(flow)
    return true
  }

  /**
   * 获取执行状态
   */
  getStatus() {
    return {
      status: this.status,
      flowId: this.currentFlowId,
      currentNodeId: this.currentNodeId,
      completedNodeIds: this.completedNodeIds,
      context: this.context,
      startedAt: this.startedAt
    }
  }

  /**
   * 注册节点完成回调
   */
  onNodeComplete(callback) {
    this.nodeCallbacks.push(callback)
  }

  /**
   * 注册流程完成回调
   */
  onFlowComplete(callback) {
    this.completeCallbacks.push(callback)
  }

  /**
   * 执行下一个节点
   */
  async _runNextNode(flow) {
    if (this.status !== EXEC_STATUS.RUNNING) return

    const nextNodeId = this._findNextNode(flow)
    if (!nextNodeId) {
      this.status = EXEC_STATUS.COMPLETED
      this._save()
      this._emitComplete({ flowId: this.currentFlowId, context: this.context })
      return
    }

    this.currentNodeId = nextNodeId
    this._save()

    const node = flow.nodes.find(n => n.id === nextNodeId)
    console.log('[FlowExecutor] Running node:', nextNodeId, node?.type)

    const result = await this._executeNode(node, flow)

    if (!this.completedNodeIds.includes(nextNodeId)) {
      this.completedNodeIds.push(nextNodeId)
    }
    if (result?.context) {
      this.context = { ...this.context, ...result.context }
    }

    this._save()
    this._emitNodeComplete(node, result)

    await new Promise(r => setTimeout(r, 300))
    await this._runNextNode(flow)
  }

  /**
   * 找下一个节点
   */
  _findNextNode(flow) {
    const { nodes, connections } = flow

    if (!this.currentNodeId && this.completedNodeIds.length === 0) {
      const startNodes = nodes.filter(n => !connections.some(c => c.target === n.id))
      return startNodes.length > 0 ? startNodes[0].id : null
    }

    const outgoing = connections.filter(c => c.source === this.currentNodeId)
    if (outgoing.length === 0) return null

    for (const conn of outgoing) {
      const targetNode = nodes.find(n => n.id === conn.target)
      if (!targetNode) continue
      if (this.completedNodeIds.includes(conn.target)) continue
      return conn.target
    }
    return null
  }

  /**
   * 通过节点ID执行节点
   */
  async _executeNodeById(nodeId, flow) {
    const node = flow.nodes.find(n => n.id === nodeId)
    if (!node) return { context: {} }
    return this._executeNode(node, flow)
  }

  /**
   * 执行单个节点
   */
  async _executeNode(node, flow) {
    const taskStore = useTaskStore()

    switch (node.type) {
      case 'condition': {
        const { nextNodeId, branch, satisfied } = getConditionBranch(node.config, this.context)
        console.log('[FlowExecutor] Condition:', node.id, 'branch:', branch, 'satisfied:', satisfied)
        this.context._lastConditionBranch = branch
        if (nextNodeId) {
          this.currentNodeId = nextNodeId
          return this._executeNodeById(nextNodeId, flow)
        }
        return { context: { _lastConditionBranch: branch } }
      }

      case 'ai-adjust': {
        // 使用完整的自适应难度算法
        const result = analyze(this.context._recentPerformance || [], node.config || {})
        const { suggestion, currentLevel, nextLevel, dimensionAnalysis, reason } = result

        this.context._aiSuggestion = suggestion
        this.context._difficultyLevel = nextLevel
        this.context._aiAnalysis = dimensionAnalysis
        this.context._aiReason = reason

        console.log('[FlowExecutor] AI adjust:', suggestion, 'level:', currentLevel, '→', nextLevel, '|', reason)
        if (dimensionAnalysis) {
          console.log('[FlowExecutor] Dimension analysis:', JSON.stringify(dimensionAnalysis.dimensionTrends))
        }
        return { 
          context: { 
            _aiSuggestion: suggestion, 
            _difficultyLevel: nextLevel,
            _aiAnalysis: dimensionAnalysis,
            _aiReason: reason
          } 
        }
      }

      case 'checkin':
      case 'study':
      case 'exercise':
      case 'habit': {
        const taskData = {
          title: node.config?.title || node.label,
          description: node.config?.description || '',
          points: node.config?.points || 5,
          type: node.type,
          flowId: this.currentFlowId,
          flowNodeId: node.id,
          status: 'pending'
        }
        try {
          if (taskStore && typeof taskStore.createTask === 'function') {
            const task = await taskStore.createTask(taskData)
            this.context._lastTaskId = task?.id
          }
        } catch (e) {
          console.warn('[FlowExecutor] createTask failed:', e)
        }
        return { context: { _lastNodeType: node.type, _lastNodeLabel: node.label } }
      }

      default:
        return { context: {} }
    }
  }

  /**
   * 触发节点完成回调
   */
  _emitNodeComplete(node, result) {
    for (const cb of this.nodeCallbacks) {
      try { cb(node, result, this.getStatus()) } catch (e) { console.error(e) }
    }
  }

  /**
   * 触发流程完成回调
   */
  _emitComplete(result) {
    for (const cb of this.completeCallbacks) {
      try { cb(result) } catch (e) { console.error(e) }
    }
  }
}

// 单例
let _executor = null

export function getFlowExecutor() {
  if (!_executor) _executor = new FlowExecutor()
  return _executor
}

export default FlowExecutor
