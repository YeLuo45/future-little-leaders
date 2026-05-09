/**
 * Collaboration Service - Task Flow Orchestrator
 *
 * Manages task flow state machine, points distribution, achievement triggers,
 * and collaboration notifications between children and parents.
 *
 * Storage: uni.getStorageSync/setStorageSync, key='task_flows'
 * State validation: TaskFlowStateMachine.getNextState()
 */

'use strict';

// ============================================================================
// Task Flow State Machine
// ============================================================================

/**
 * Task flow states - 7 states aligned with PRD
 */
const TaskFlowState = {
  PENDING: 'pending',           // 任务待领取
  ASSIGNED: 'assigned',         // 已分配给孩子
  IN_PROGRESS: 'in_progress',   // 孩子正在执行
  PENDING_APPROVAL: 'pending_approval', // 待家长审核
  APPROVED: 'approved',         // 审核通过
  REJECTED: 'rejected',         // 审核拒绝
  REWARDED: 'rewarded',         // 已发放积分奖励
};

/**
 * State transitions - aligned with familyCollaborationFlow.js
 */
const TaskFlowTransitions = {
  [TaskFlowState.PENDING]: {
    nextState: TaskFlowState.ASSIGNED,
    action: 'assign',
  },
  [TaskFlowState.ASSIGNED]: {
    nextState: TaskFlowState.IN_PROGRESS,
    action: 'start',
  },
  [TaskFlowState.IN_PROGRESS]: {
    nextState: TaskFlowState.PENDING_APPROVAL,
    action: 'complete',
  },
  [TaskFlowState.PENDING_APPROVAL]: {
    nextState: TaskFlowState.APPROVED,
    action: 'approve',
    altNextState: TaskFlowState.REJECTED,
    altAction: 'reject',
  },
  [TaskFlowState.APPROVED]: {
    nextState: TaskFlowState.REWARDED,
    action: 'reward',
  },
  [TaskFlowState.REJECTED]: {
    nextState: TaskFlowState.IN_PROGRESS,
    action: 'resubmit',
  },
};

/**
 * TaskFlowStateMachine - validates and executes state transitions
 */
const TaskFlowStateMachine = {
  getNextState(currentState, action) {
    const transition = TaskFlowTransitions[currentState];
    if (!transition) return null;
    if (transition.action === action) return transition.nextState;
    if (transition.altAction === action) return transition.altNextState || null;
    return null;
  },
  isValidTransition(currentState, action) {
    return this.getNextState(currentState, action) !== null;
  },
  getValidActions(currentState) {
    const transition = TaskFlowTransitions[currentState];
    if (!transition) return [];
    const actions = [transition.action];
    if (transition.altAction) actions.push(transition.altAction);
    return actions;
  },
};

// ============================================================================
// Storage Helper (uni-app compatible)
// ============================================================================

const STORAGE_KEY = 'task_flows';

function loadTaskFlows() {
  try {
    const data = uni.getStorageSync(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('[CollaborationService] Failed to load task flows:', e);
    return [];
  }
}

function saveTaskFlows(flows) {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(flows));
  } catch (e) {
    console.error('[CollaborationService] Failed to save task flows:', e);
  }
}

function generateId() {
  return `flow_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// ============================================================================
// ============================================================================
// Notification System (NotificationService)
// ============================================================================

let _notificationService = null;
function getNotificationService() {
  if (!_notificationService) {
    try {
      _notificationService = require('./notificationService');
    } catch (e) {
      console.warn('[CollaborationService] NotificationService not available:', e.message);
    }
  }
  return _notificationService;
}

function sendNotification(type, data) {
  const ns = getNotificationService();
  if (!ns) return;
  try {
    switch (type) {
      case 'task_flow_created':
        ns.sendTaskAssigned(data.childId, data.taskTitle, data.rewardPoints, data.taskId);
        break;
      case 'task_approved':
        ns.sendTaskApproved(data.childId, data.taskTitle, data.rewardPoints, data.taskId);
        break;
      case 'task_rejected':
        ns.sendTaskRejected(data.childId, data.taskTitle, data.reason, data.taskId);
        break;
      case 'task_resubmitted':
        ns.sendTaskResubmitted(data.parentId, data.taskTitle, data.childId, data.childName);
        break;
      case 'achievement_unlocked':
        // data: { childId, childName, achievements }
        if (data.achievements && data.achievements.length > 0) {
          data.achievements.forEach(ach => {
            ns.sendAchievementUnlocked(data.childId, data.childName, ach.name, ach.icon);
          });
        }
        break;
      default:
        // Fallback: generic notification
        ns.send({ type, recipientId: data.childId || data.recipientId,
          title: type, content: JSON.stringify(data) });
    }
  } catch (e) {
    console.warn('[CollaborationService] Notification send failed:', e.message);
  }
}

// ============================================================================
// Achievement Trigger (Dynamic Import - pointsStore / achievementStore)
// ============================================================================

/**
 * Trigger achievement check after task approval
 * @param {string} childId
 * @param {object} context - { completedTaskCount, totalPointsEarned, continuousDays, weeklyDays, exchangeCount }
 */
async function checkAchievements(childId, context) {
  try {
    const { useAchievementTrigger } = require('./achievementTrigger');
    const trigger = useAchievementTrigger();
    const newAchievements = trigger.checkAchievements(childId, context);
    if (newAchievements && newAchievements.length > 0) {
      sendNotification('achievement_unlocked', { childId, achievements: newAchievements });
    }
  } catch (e) {
    console.debug('[CollaborationService] Achievement check skipped:', e.message);
  }
}

// ============================================================================
// Points Distribution
// ============================================================================

/**
 * Award points to a child
 * @param {string} childId
 * @param {number} points
 * @param {string} reason
 */
async function awardPoints(childId, points, reason) {
  try {
    const { usePointsStore } = require('../stores/pointsStore');
    const pointsStore = usePointsStore();
    if (typeof pointsStore.addBabyPoints === 'function') {
      pointsStore.addBabyPoints(childId, points, reason);
      return true;
    }
    return false;
  } catch (e) {
    console.error('[CollaborationService] Failed to award points:', e);
    return false;
  }
}

// ============================================================================
// Task Flow Service API
// ============================================================================

/**
 * Create a new task flow (called when parent assigns task to child)
 * @param {string} taskId
 * @param {string} childId
 * @param {number} rewardPoints
 * @param {string} taskTitle
 * @returns {object} flow
 */
function createTaskFlow(taskId, childId, rewardPoints, taskTitle) {
  const flow = {
    id: generateId(),
    taskId,
    childId,
    taskTitle,
    rewardPoints,
    state: TaskFlowState.ASSIGNED, // 创建时直接 assigned（已分配）
    evidence: null,
    rejectionReason: null,
    createdAt: Date.now(),
    completedAt: null,
    approvedAt: null,
  };
  const flows = loadTaskFlows();
  flows.push(flow);
  saveTaskFlows(flows);
  sendNotification('task_flow_created', { flowId: flow.id, taskId, childId, rewardPoints });
  return flow;
}

/**
 * Start task flow (child begins working)
 * @param {string} flowId
 * @returns {object|null}
 */
function startTaskFlow(flowId) {
  const flows = loadTaskFlows();
  const flow = flows.find(f => f.id === flowId);
  if (!flow) { console.error('[CollaborationService] Flow not found:', flowId); return null; }
  const nextState = TaskFlowStateMachine.getNextState(flow.state, 'start');
  if (!nextState) { console.error('[CollaborationService] Invalid transition:', flow.state, 'start'); return null; }
  flow.state = nextState;
  saveTaskFlows(flows);
  sendNotification('task_flow_started', { flowId });
  return flow;
}

/**
 * Complete task flow - child submits evidence
 * @param {string} flowId
 * @param {string} evidence
 * @returns {object|null}
 */
function completeTaskFlow(flowId, evidence) {
  const flows = loadTaskFlows();
  const flow = flows.find(f => f.id === flowId);
  if (!flow) { console.error('[CollaborationService] Flow not found:', flowId); return null; }
  const nextState = TaskFlowStateMachine.getNextState(flow.state, 'complete');
  if (!nextState) { console.error('[CollaborationService] Invalid transition:', flow.state, 'complete'); return null; }
  flow.state = nextState;
  flow.evidence = evidence;
  flow.completedAt = Date.now();
  saveTaskFlows(flows);
  sendNotification('task_pending_approval', { flowId, taskTitle: flow.taskTitle, childId: flow.childId, evidence });
  return flow;
}

/**
 * Approve task flow - parent accepts, auto awards points + triggers achievement
 * @param {string} flowId
 * @returns {Promise<object|null>}
 */
async function approveTaskFlow(flowId) {
  const flows = loadTaskFlows();
  const flow = flows.find(f => f.id === flowId);
  if (!flow) { console.error('[CollaborationService] Flow not found:', flowId); return null; }
  const nextState = TaskFlowStateMachine.getNextState(flow.state, 'approve');
  if (!nextState) { console.error('[CollaborationService] Invalid transition:', flow.state, 'approve'); return null; }
  flow.state = nextState;
  flow.approvedAt = Date.now();
  saveTaskFlows(flows);

  // Auto-award points
  const reason = `任务奖励：${flow.taskTitle}`;
  await awardPoints(flow.childId, flow.rewardPoints, reason);

  // Immediately mark as rewarded (积分发放后自动标记)
  flow.state = TaskFlowState.REWARDED;
  saveTaskFlows(flows);

  // Build context and check achievements
  const ctx = buildChildContext(flow.childId);
  await checkAchievements(flow.childId, ctx);

  // Notify child
  sendNotification('task_approved', { flowId, taskTitle: flow.taskTitle, rewardPoints: flow.rewardPoints });

  return flow;
}

/**
 * Reject task flow - parent sends back
 * @param {string} flowId
 * @param {string} reason
 * @returns {object|null}
 */
function rejectTaskFlow(flowId, reason) {
  const flows = loadTaskFlows();
  const flow = flows.find(f => f.id === flowId);
  if (!flow) { console.error('[CollaborationService] Flow not found:', flowId); return null; }
  const nextState = TaskFlowStateMachine.getNextState(flow.state, 'reject');
  if (!nextState) { console.error('[CollaborationService] Invalid transition:', flow.state, 'reject'); return null; }
  flow.state = nextState;
  flow.rejectionReason = reason;
  saveTaskFlows(flows);
  sendNotification('task_rejected', { flowId, taskTitle: flow.taskTitle, reason });
  return flow;
}

/**
 * Resubmit task flow - child re-submits after rejection
 * @param {string} flowId
 * @param {string} evidence
 * @returns {object|null}
 */
function resubmitTaskFlow(flowId, evidence) {
  const flows = loadTaskFlows();
  const flow = flows.find(f => f.id === flowId);
  if (!flow) { console.error('[CollaborationService] Flow not found:', flowId); return null; }
  const nextState = TaskFlowStateMachine.getNextState(flow.state, 'resubmit');
  if (!nextState) { console.error('[CollaborationService] Invalid transition:', flow.state, 'resubmit'); return null; }
  flow.state = nextState;
  flow.evidence = evidence;
  flow.completedAt = Date.now();
  saveTaskFlows(flows);
  sendNotification('task_resubmitted', { flowId, taskTitle: flow.taskTitle, childId: flow.childId, evidence });
  return flow;
}

/**
 * Get all flows for a child
 * @param {string} childId
 * @returns {object[]}
 */
function getChildFlows(childId) {
  return loadTaskFlows().filter(f => f.childId === childId);
}

/**
 * Get all pending approval flows (parent view)
 * @returns {object[]}
 */
function getPendingApprovalFlows() {
  return loadTaskFlows().filter(f => f.state === TaskFlowState.PENDING_APPROVAL);
}

/**
 * Get a specific flow by ID
 * @param {string} flowId
 * @returns {object|null}
 */
function getTaskFlow(flowId) {
  return loadTaskFlows().find(f => f.id === flowId) || null;
}

/**
 * Cancel a flow (only if in created/assigned/in_progress)
 * @param {string} flowId
 * @returns {object|null}
 */
function cancelTaskFlow(flowId) {
  const flows = loadTaskFlows();
  const flowIndex = flows.findIndex(f => f.id === flowId);
  if (flowIndex === -1) { console.error('[CollaborationService] Flow not found:', flowId); return null; }
  const flow = flows[flowIndex];
  const cancellable = [TaskFlowState.PENDING, TaskFlowState.ASSIGNED, TaskFlowState.IN_PROGRESS];
  if (!cancellable.includes(flow.state)) {
    console.error('[CollaborationService] Cannot cancel flow in state:', flow.state); return null;
  }
  flows.splice(flowIndex, 1);
  saveTaskFlows(flows);
  sendNotification('task_cancelled', { flowId, taskTitle: flow.taskTitle });
  return flow;
}

/**
 * Get statistics for a child
 * @param {string} childId
 * @returns {object}
 */
function getChildStats(childId) {
  const flows = getChildFlows(childId);
  const stats = {
    total: flows.length,
    assigned: 0,
    in_progress: 0,
    pending_approval: 0,
    approved: 0,
    rejected: 0,
    rewarded: 0,
    totalPointsEarned: 0,
  };
  flows.forEach(f => {
    switch (f.state) {
      case TaskFlowState.ASSIGNED: stats.assigned++; break;
      case TaskFlowState.IN_PROGRESS: stats.in_progress++; break;
      case TaskFlowState.PENDING_APPROVAL: stats.pending_approval++; break;
      case TaskFlowState.APPROVED: stats.approved++; break;
      case TaskFlowState.REJECTED: stats.rejected++; break;
      case TaskFlowState.REWARDED:
        stats.rewarded++;
        stats.totalPointsEarned += f.rewardPoints;
        break;
    }
  });
  return stats;
}

/**
 * Build context for achievement check
 * @param {string} childId
 * @returns {object}
 */
function buildChildContext(childId) {
  try {
    const { usePointsStore } = require('../stores/pointsStore');
    const pointsStore = usePointsStore();
    const flows = loadTaskFlows().filter(f => f.childId === childId && f.state === TaskFlowState.REWARDED);
    return {
      completedTaskCount: flows.length,
      totalPointsEarned: pointsStore.getBabyPoints ? pointsStore.getBabyPoints(childId) : 0,
      continuousDays: calculateContinuousDays(flows),
      weeklyDays: calculateWeeklyDays(flows),
      exchangeCount: pointsStore.exchangeRecords ? pointsStore.exchangeRecords.filter(r => r.babyId === childId).length : 0,
    };
  } catch (e) {
    return { completedTaskCount: 0, totalPointsEarned: 0, continuousDays: 0, weeklyDays: 0, exchangeCount: 0 };
  }
}

function calculateContinuousDays(flows) {
  if (!flows || flows.length === 0) return 0;
  return 1; // stub - 需要根据 completedAt 计算
}

function calculateWeeklyDays(flows) {
  if (!flows || flows.length === 0) return 0;
  return flows.length; // stub
}

// ============================================================================
// Export
// ============================================================================

const collaborationService = {
  TaskFlowState,
  TaskFlowStateMachine,
  createTaskFlow,
  startTaskFlow,
  completeTaskFlow,
  approveTaskFlow,
  rejectTaskFlow,
  resubmitTaskFlow,
  getChildFlows,
  getPendingApprovalFlows,
  getTaskFlow,
  cancelTaskFlow,
  getChildStats,
  buildChildContext,
  setNotificationCallback: notify,
  STORAGE_KEY,
};

module.exports = collaborationService;
