/**
 * 家庭协作流状态机
 * Family Collaboration Flow State Machine
 */

// 状态常量数组
const TASK_FLOW_STATES = [
  'pending',
  'assigned',
  'in_progress',
  'pending_approval',
  'approved',
  'rejected',
  'rewarded'
]

// 转换规则定义：currentState -> { action: nextState }
const TRANSITIONS = {
  pending: {
    assign: 'assigned'
  },
  assigned: {
    start: 'in_progress'
  },
  in_progress: {
    complete: 'pending_approval'
  },
  pending_approval: {
    approve: 'approved',
    reject: 'rejected'
  },
  approved: {
    reward: 'rewarded'
  },
  rejected: {
    resubmit: 'in_progress'
  }
}

/**
 * 状态机类
 */
class TaskFlowStateMachine {
  constructor (initialState = 'pending') {
    if (!TASK_FLOW_STATES.includes(initialState)) {
      throw new Error(`Invalid initial state: ${initialState}`)
    }
    this.currentState = initialState
  }

  /**
   * 获取当前状态
   */
  getState () {
    return this.currentState
  }

  /**
   * 执行转换
   * @param {string} action - 操作名称
   * @returns {string|null} 转换后的状态，失败返回null
   */
  transition (action) {
    const stateTransitions = TRANSITIONS[this.currentState]
    if (!stateTransitions) {
      console.warn(`No transitions defined for state: ${this.currentState}`)
      return null
    }

    const nextState = stateTransitions[action]
    if (!nextState) {
      console.warn(`Invalid action '${action}' for current state '${this.currentState}'`)
      return null
    }

    this.currentState = nextState
    return nextState
  }

  /**
   * 检查是否可以执行某个动作
   * @param {string} action - 操作名称
   * @returns {boolean}
   */
  can (action) {
    const stateTransitions = TRANSITIONS[this.currentState]
    return stateTransitions && action in stateTransitions
  }

  /**
   * 获取当前状态可用的动作列表
   * @returns {string[]}
   */
  availableActions () {
    const stateTransitions = TRANSITIONS[this.currentState]
    return stateTransitions ? Object.keys(stateTransitions) : []
  }

  /**
   * 重置状态机到初始状态
   * @param {string} state - 要重置到的状态，默认pending
   */
  reset (state = 'pending') {
    if (!TASK_FLOW_STATES.includes(state)) {
      throw new Error(`Invalid state: ${state}`)
    }
    this.currentState = state
  }
}

export { TaskFlowStateMachine, TASK_FLOW_STATES }
