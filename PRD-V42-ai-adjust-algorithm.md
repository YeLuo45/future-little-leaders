# PRD-V42: AI-Adjust 节点自适应难度算法

## 1. 概述

**功能**：为 AI-Adjust 节点实现完整的自适应难度算法，根据儿童历史表现动态调整推荐任务难度。

**问题**：当前 ai-adjust 节点仅做简单阈值比较（accuracy < 60% → easier），无法追踪多维度能力变化趋势。

## 2. 算法设计

### 2.1 数据模型

```javascript
// 执行上下文中的表现记录
this.context._recentPerformance = [
  { taskId, dimension, difficulty, accuracy, score, timeSpent, completedAt },
  ...
]

// 难度等级
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard']
const DIFFICULTY_SCORES = { easy: 1, medium: 2, hard: 3 }
```

### 2.2 自适应算法

**输入**：
- `_recentPerformance`：最近 N 条表现记录（默认 10 条）
- 当前节点配置的 `threshold`（默认 60）和 `mode`（adaptive/easier/harder）

**维度能力追踪**：
- 7 个维度：语言、逻辑、体能、自律、社交、创造、自理
- 每维度计算：最近 5 次平均准确率、趋势（上升/下降/稳定）

**难度决策规则**：
```
IF mode === 'easier': suggestion = 'easier'
ELIF mode === 'harder': suggestion = 'harder'
ELSE:
  // adaptive mode
  avgAccuracy = average(recentPerformance.map(p => p.accuracy))
  
  IF avgAccuracy < threshold:
    suggestion = 'easier'
  ELIF avgAccuracy > threshold + 20:
    suggestion = 'harder'
  ELSE:
    // 趋势分析
    dimensionTrend = calculateDimensionTrend(recentPerformance)
    IF dimensionTrend === 'declining': suggestion = 'easier'
    ELIF dimensionTrend === 'improving': suggestion = 'harder'
    ELSE: suggestion = 'keep'
```

### 2.3 维度趋势计算

```javascript
function calculateDimensionTrend(performance) {
  // 按维度分组
  const byDimension = groupBy(performance, 'dimension')
  
  for (const [dim, records] of Object.entries(byDimension)) {
    if (records.length < 3) continue
    // 最近3次 vs 更早3次的趋势
    const recent = records.slice(-3).map(r => r.accuracy)
    const older = records.slice(-6, -3).map(r => r.accuracy)
    const recentAvg = avg(recent)
    const olderAvg = avg(older)
    
    if (recentAvg > olderAvg + 10) return 'improving'
    if (recentAvg < olderAvg - 10) return 'declining'
  }
  return 'stable'
}
```

## 3. UI 增强

### 3.1 FlowNode 难度徽章

- AI-Adjust 节点执行后显示当前难度等级（DifficultyBadge）
- 执行完成时 difficulty 变化则显示动画提示

### 3.2 NodeConfigPanel 增强

- 新增"追踪维度"多选（默认全选）
- 新增"考虑趋势"开关（默认开启）
- 实时显示算法预览（基于当前上下文模拟）

## 4. 数据流

```
FlowExecutor._executeNode(ai-adjust)
  → aiAdjustService.analyze(recentPerformance, nodeConfig)
  → 返回 { suggestion, currentLevel, nextLevel, dimensionAnalysis }
  → 更新 context._aiSuggestion, context._difficultyLevel
  → FlowNode 接收 props 显示 DifficultyBadge
```

## 5. 验收标准

- [ ] 连续 3 次 accuracy < 60%，suggestion 返回 'easier'
- [ ] 连续 3 次 accuracy > 80%，suggestion 返回 'harder'
- [ ] 维度趋势下降时，优先建议 easier
- [ ] DifficultyBadge 正确显示 easy/medium/hard
- [ ] node --check 语法验证通过
