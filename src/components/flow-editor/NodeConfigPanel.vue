<template>
  <view class="config-panel" :class="{ open: !!node }">
    <view class="panel-header">
      <text class="panel-title">节点配置</text>
      <view class="close-btn" @click="onClose">×</view>
    </view>

    <scroll-view class="panel-body" scroll-y v-if="node">
      <!-- Common fields -->
      <view class="field-group">
        <text class="field-label">标题</text>
        <input class="field-input" v-model="localNode.config.title" placeholder="输入标题" @blur="onFieldChange" />
      </view>

      <view class="field-group">
        <text class="field-label">描述</text>
        <textarea class="field-textarea" v-model="localNode.config.description" placeholder="输入描述" @blur="onFieldChange" />
      </view>

      <view class="field-group" v-if="hasPoints">
        <text class="field-label">积分</text>
        <input class="field-input" type="number" v-model.number="localNode.config.points" placeholder="积分" @blur="onFieldChange" />
      </view>

      <!-- Condition node fields -->
      <view class="field-group" v-if="node.type === 'condition'">
        <text class="field-label">条件类型</text>
        <picker :value="conditionTypeIndex" :range="conditionTypes" @change="onConditionTypeChange">
          <view class="picker-value">{{ localNode.config.condition?.type || 'accuracy' }}</view>
        </picker>

        <text class="field-label" style="margin-top:12px;">阈值</text>
        <input class="field-input" type="number" v-model.number="localNode.config.condition.value" placeholder="阈值" @blur="onFieldChange" />

        <text class="field-label" style="margin-top:12px;">满足条件分支</text>
        <view class="branch-picker">
          <view class="branch-option yes" @click="onBranchClick('yes')">
            <text>✅ 是 →</text>
            <text class="branch-target">{{ getNodeLabel(localNode.config.condition?.branches?.yes) }}</text>
          </view>
          <view class="branch-option no" @click="onBranchClick('no')">
            <text>❌ 否 →</text>
            <text class="branch-target">{{ getNodeLabel(localNode.config.condition?.branches?.no) }}</text>
          </view>
        </view>
      </view>

      <!-- AI-adjust node fields -->
      <view class="field-group" v-if="node.type === 'ai-adjust'">
        <text class="field-label">调整模式</text>
        <picker :value="aiModeIndex" :range="aiModes" @change="onAiModeChange">
          <view class="picker-value">{{ localNode.config.mode || 'adaptive' }}</view>
        </picker>

        <text class="field-label" style="margin-top:12px;">触发阈值 (%)</text>
        <input class="field-input" type="number" v-model.number="localNode.config.threshold" placeholder="60" @blur="onFieldChange" />

        <text class="field-label" style="margin-top:12px;">难度调整步长</text>
        <input class="field-input" type="number" v-model.number="localNode.config.step" placeholder="1" min="1" max="2" @blur="onFieldChange" />

        <view class="ai-preview">
          <text class="ai-icon">🧙</text>
          <view class="ai-hint-box">
            <text class="ai-hint">{{ aiHint }}</text>
            <text class="ai-reason" v-if="previewResult">推荐：{{ previewResult.suggestion }} | {{ previewResult.reason }}</text>
            <text class="ai-dimension" v-if="previewResult && previewResult.dimensionAnalysis">
              准确率：{{ previewResult.dimensionAnalysis.avgAccuracy }}% | 趋势：{{ previewResult.dimensionAnalysis.overallTrend }}
            </text>
          </view>
        </view>
      </view>

      <!-- Node info -->
      <view class="node-info">
        <text class="info-label">节点类型: {{ nodeTypeLabel }}</text>
        <text class="info-label">节点ID: {{ node.id.slice(0, 8) }}...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { NODE_TYPES } from '../../stores/flowStore.js'
import { useFlowStore } from '../../stores/flowStore.js'
import { preview } from '../../services/aiAdjustService.js'

export default {
  name: 'NodeConfigPanel',

  props: {
    node: {
      type: Object,
      default: null
    }
  },

  emits: ['update:node', 'close'],

  data() {
    return {
      localNode: null,
      conditionTypes: ['accuracy', 'streak', 'time', 'score', 'always'],
      aiModes: ['adaptive', 'easier', 'harder'],
      previewResult: null
    }
  },

  computed: {
    nodeTypeConfig() {
      if (!this.node) return {}
      return NODE_TYPES[this.node.type] || {}
    },

    nodeTypeLabel() {
      return this.nodeTypeConfig.label || this.node?.type || ''
    },

    hasPoints() {
      return ['checkin', 'study', 'exercise', 'habit'].includes(this.node?.type)
    },

    conditionTypeIndex() {
      const t = this.localNode?.config?.condition?.type || 'accuracy'
      return this.conditionTypes.indexOf(t)
    },

    aiModeIndex() {
      const m = this.localNode?.config?.mode || 'adaptive'
      return this.aiModes.indexOf(m)
    },

    aiHint() {
      const mode = this.localNode?.config?.mode || 'adaptive'
      const threshold = this.localNode?.config?.threshold || 60
      if (mode === 'easier') return `强制降低难度模式`
      if (mode === 'harder') return `强制提升难度模式`
      return `准确率<${threshold}%时降低难度，>${threshold + 20}%时提升`
    }
  },

  watch: {
    node: {
      handler(newNode) {
        if (newNode) {
          this.localNode = JSON.parse(JSON.stringify(newNode))
          // AI-adjust 节点加载时刷新预览
          if (newNode.type === 'ai-adjust') {
            this.refreshPreview()
          }
        } else {
          this.localNode = null
          this.previewResult = null
        }
      },
      immediate: true
    }
  },

  methods: {
    onFieldChange() {
      if (this.localNode) {
        this.$emit('update:node', JSON.parse(JSON.stringify(this.localNode)))
        // AI-adjust 配置变更时刷新预览
        if (this.localNode.type === 'ai-adjust') {
          this.refreshPreview()
        }
      }
    },

    refreshPreview() {
      if (!this.localNode || this.localNode.type !== 'ai-adjust') return
      this.previewResult = preview(this.localNode.config || {})
    },

    onConditionTypeChange(e) {
      const idx = e.detail.value
      if (!this.localNode.config.condition) {
        this.localNode.config.condition = { type: 'accuracy', operator: 'gte', value: 80, branches: { yes: null, no: null } }
      }
      this.localNode.config.condition.type = this.conditionTypes[idx]
      this.onFieldChange()
    },

    onAiModeChange(e) {
      const idx = e.detail.value
      this.localNode.config.mode = this.aiModes[idx]
      this.onFieldChange()
    },

    onBranchClick(branch) {
      if (!this.localNode.config.condition) return
      // Mark that we're selecting the target for this branch
      this.$emit('select-branch', branch)
    },

    setBranchTarget(branch, targetNodeId) {
      if (!this.localNode.config.condition) return
      if (!this.localNode.config.condition.branches) {
        this.localNode.config.condition.branches = { yes: null, no: null }
      }
      this.localNode.config.condition.branches[branch] = targetNodeId
      this.onFieldChange()
    },

    getNodeLabel(nodeId) {
      if (!nodeId) return '未选择'
      const flowStore = useFlowStore()
      if (!flowStore.currentFlow) return nodeId.slice(0, 8)
      const found = flowStore.currentFlow.nodes.find(n => n.id === nodeId)
      return found ? found.label : nodeId.slice(0, 8)
    },

    onClose() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.config-panel {
  position: fixed;
  top: 0;
  right: -320px;
  width: 300px;
  height: 100vh;
  background: #fff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
}

.config-panel.open {
  right: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #999;
  border-radius: 50%;
  background: #eee;
  cursor: pointer;
}

.panel-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.field-group {
  margin-bottom: 16px;
}

.field-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
}

.field-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: #fafafa;
}

.field-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: #fafafa;
  min-height: 60px;
  resize: vertical;
}

.picker-value {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: #fafafa;
}

.branch-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.branch-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.branch-option.yes {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.branch-option.no {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.branch-target {
  font-size: 12px;
  opacity: 0.7;
}

.ai-preview {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px;
  background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%);
  border-radius: 10px;
  margin-top: 12px;
}

.ai-hint-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ai-icon {
  font-size: 24px;
  line-height: 1;
}

.ai-hint {
  font-size: 12px;
  color: #6b21a8;
  font-weight: 500;
}

.ai-reason {
  font-size: 11px;
  color: #7c3aed;
}

.ai-dimension {
  font-size: 10px;
  color: #8b5cf6;
}

.node-info {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #999;
}
</style>
