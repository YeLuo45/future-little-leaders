/**
 * AI Adjust Service - 自适应难度算法
 * 根据儿童历史表现动态调整推荐任务难度
 */

// 难度等级定义
export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard']
export const DIFFICULTY_SCORES = { easy: 1, medium: 2, hard: 3 }

// 7个追踪维度
export const DIMENSIONS = ['语言', '逻辑', '体能', '自律', '社交', '创造', '自理']

/**
 * 难度分数转等级
 */
export function scoreToDifficulty(score) {
  if (score <= 1.3) return 'easy'
  if (score <= 2.0) return 'medium'
  return 'hard'
}

/**
 * 计算平均值
 */
function avg(arr) {
  if (!arr || arr.length === 0) return 0
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

/**
 * 按维度分组
 */
function groupBy(arr, key) {
  return arr.reduce((groups, item) => {
    const val = item[key] || '未知'
    if (!groups[val]) groups[val] = []
    groups[val].push(item)
    return groups
  }, {})
}

/**
 * 计算单维度趋势
 * @param {Array} records - 该维度的历史记录（按时间排序）
 * @returns {'improving'|'declining'|'stable'}
 */
function calcDimensionTrend(records) {
  if (records.length < 3) return 'stable'
  
  // 最近3次 vs 更早3次
  const recent = records.slice(-3).map(r => r.accuracy || r.score || 0)
  const older = records.slice(-6, -3).map(r => r.accuracy || r.score || 0)
  
  if (older.length === 0) return 'stable'
  
  const recentAvg = avg(recent)
  const olderAvg = avg(older)
  
  const diff = recentAvg - olderAvg
  if (diff > 10) return 'improving'
  if (diff < -10) return 'declining'
  return 'stable'
}

/**
 * 分析表现记录，计算维度趋势
 * @param {Array} performance - 历史表现记录
 * @returns {object} 维度分析结果
 */
export function analyzeDimensionTrends(performance) {
  if (!performance || performance.length === 0) {
    return { dimensionTrends: {}, overallTrend: 'stable' }
  }
  
  const byDimension = groupBy(performance, 'dimension')
  const dimensionTrends = {}
  let improvingCount = 0
  let decliningCount = 0
  
  for (const [dim, records] of Object.entries(byDimension)) {
    // 按时间排序（假设 records 已是时间顺序）
    const sorted = [...records].sort((a, b) => (a.completedAt || 0) - (b.completedAt || 0))
    const trend = calcDimensionTrend(sorted)
    dimensionTrends[dim] = {
      trend,
      count: sorted.length,
      recentAvg: avg(sorted.slice(-3))
    }
    if (trend === 'improving') improvingCount++
    if (trend === 'declining') decliningCount++
  }
  
  let overallTrend = 'stable'
  if (decliningCount > improvingCount && decliningCount >= 2) {
    overallTrend = 'declining'
  } else if (improvingCount > decliningCount && improvingCount >= 2) {
    overallTrend = 'improving'
  }
  
  return { dimensionTrends, overallTrend }
}

/**
 * 核心自适应难度分析
 * @param {Array} recentPerformance - 最近表现记录
 * @param {object} config - 节点配置 { mode, threshold, step, trackingDimensions }
 * @returns {object} { suggestion, currentLevel, nextLevel, dimensionAnalysis, reason }
 */
export function analyze(recentPerformance = [], config = {}) {
  const {
    mode = 'adaptive',
    threshold = 60,
    step = 1,
    trackingDimensions = DIMENSIONS
  } = config
  
  // 基础数据
  const history = Array.isArray(recentPerformance) ? recentPerformance : []
  const validRecords = history.filter(r => typeof r.accuracy === 'number' || typeof r.score === 'number')
  
  // 默认返回值
  const defaultResult = {
    suggestion: 'keep',
    currentLevel: 'medium',
    nextLevel: 'medium',
    dimensionAnalysis: null,
    reason: '无足够数据，使用默认难度'
  }
  
  // 强制模式
  if (mode === 'easier') {
    return {
      suggestion: 'easier',
      currentLevel: getCurrentLevel(history),
      nextLevel: stepDown(getCurrentLevel(history)),
      dimensionAnalysis: null,
      reason: '手动指定：降低难度'
    }
  }
  
  if (mode === 'harder') {
    return {
      suggestion: 'harder',
      currentLevel: getCurrentLevel(history),
      nextLevel: stepUp(getCurrentLevel(history)),
      dimensionAnalysis: null,
      reason: '手动指定：提升难度'
    }
  }
  
  // adaptive 模式
  if (validRecords.length === 0) {
    return defaultResult
  }
  
  // 计算整体平均准确率
  const avgAccuracy = avg(validRecords.map(r => r.accuracy || r.score || 0))
  const currentLevel = getCurrentLevel(validRecords)
  
  // 维度趋势分析
  const { dimensionTrends, overallTrend } = analyzeDimensionTrends(validRecords)
  
  // 决策逻辑
  let suggestion = 'keep'
  let reason = ''
  
  if (avgAccuracy < threshold) {
    suggestion = 'easier'
    reason = `准确率${avgAccuracy.toFixed(1)}% < 阈值${threshold}%`
  } else if (avgAccuracy > threshold + 20) {
    suggestion = 'harder'
    reason = `准确率${avgAccuracy.toFixed(1)}% > 阈值${threshold + 20}%`
  } else {
    // 趋势分析
    if (overallTrend === 'declining') {
      suggestion = 'easier'
      reason = '多维度表现呈下降趋势'
    } else if (overallTrend === 'improving') {
      suggestion = 'harder'
      reason = '多维度表现呈上升趋势'
    } else {
      suggestion = 'keep'
      reason = '表现稳定，维持当前难度'
    }
  }
  
  // 计算下一难度
  const nextLevel = suggestion === 'harder' 
    ? stepUpWithLimit(currentLevel, step)
    : suggestion === 'easier'
    ? stepDownWithLimit(currentLevel, step)
    : currentLevel
  
  return {
    suggestion,
    currentLevel,
    nextLevel,
    dimensionAnalysis: {
      avgAccuracy: avgAccuracy.toFixed(1),
      overallTrend,
      dimensionTrends
    },
    reason
  }
}

/**
 * 从历史记录推断当前难度等级
 */
function getCurrentLevel(history) {
  if (history.length === 0) return 'medium'
  
  const difficulties = history
    .filter(r => r.difficulty)
    .map(r => r.difficulty)
  
  if (difficulties.length === 0) return 'medium'
  
  // 众数
  const counts = {}
  difficulties.forEach(d => { counts[d] = (counts[d] || 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

/**
 * 提升一级难度（不超过 hard）
 */
function stepUp(level, step = 1) {
  const idx = DIFFICULTY_LEVELS.indexOf(level)
  return DIFFICULTY_LEVELS[Math.min(idx + step, DIFFICULTY_LEVELS.length - 1)]
}

/**
 * 降低一级难度（不低于 easy）
 */
function stepDown(level, step = 1) {
  const idx = DIFFICULTY_LEVELS.indexOf(level)
  return DIFFICULTY_LEVELS[Math.max(idx - step, 0)]
}

/**
 * 带限制的难度调整
 */
function stepUpWithLimit(level, step) {
  const next = stepUp(level, step)
  // 不超过 hard
  return next
}

function stepDownWithLimit(level, step) {
  const next = stepDown(level, step)
  // 不低于 easy
  return next
}

/**
 * 模拟执行预览（给 NodeConfigPanel 用）
 * 基于模拟数据返回算法预览结果
 */
export function preview(config = {}) {
  // 模拟一些历史数据用于预览
  const mockPerformance = [
    { taskId: 't1', dimension: '逻辑', difficulty: 'medium', accuracy: 65, score: 78, completedAt: Date.now() - 86400000 * 4 },
    { taskId: 't2', dimension: '逻辑', difficulty: 'medium', accuracy: 72, score: 82, completedAt: Date.now() - 86400000 * 3 },
    { taskId: 't3', dimension: '逻辑', difficulty: 'hard', accuracy: 55, score: 65, completedAt: Date.now() - 86400000 * 2 },
    { taskId: 't4', dimension: '语言', difficulty: 'easy', accuracy: 88, score: 95, completedAt: Date.now() - 86400000 * 1 },
  ]
  return analyze(mockPerformance, config)
}

export default { analyze, preview, DIFFICULTY_LEVELS, DIFFICULTY_SCORES, DIMENSIONS, analyzeDimensionTrends }
