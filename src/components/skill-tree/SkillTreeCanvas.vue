<template>
  <view class="skill-tree-canvas" :style="canvasStyle">
    <!-- SVG连线层 -->
    <svg class="connections-layer" :viewBox="`0 0 ${canvasWidth} ${canvasHeight}`">
      <defs>
        <linearGradient id="lineGradientUnlocked" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#52c41a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#389e0d;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="lineGradientLocked" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#d9d9d9;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#bfbfbf;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- 绘制连线 -->
      <line 
        v-for="(conn, idx) in connections" 
        :key="'conn-' + idx"
        :x1="conn.x1" 
        :y1="conn.y1" 
        :x2="conn.x2" 
        :y2="conn.y2"
        :stroke="conn.unlocked ? 'url(#lineGradientUnlocked)' : 'url(#lineGradientLocked)'"
        stroke-width="3"
        stroke-linecap="round"
        :stroke-dasharray="conn.unlocked ? 'none' : '8,4'"
      />
    </svg>
    
    <!-- 节点层 -->
    <view class="nodes-layer">
      <view 
        v-for="node in positionedNodes" 
        :key="node.id" 
        class="node-wrapper"
        :style="{
          left: node.x + 'rpx',
          top: node.y + 'rpx'
        }"
      >
        <SkillNode
          :node="node"
          :status="getNodeStatus(node.id)"
          :current-progress="getNodeProgress(node.id)"
          :node-color="treeColor"
          :size="90"
          @tap="onNodeTap(node)"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, toRef } from 'vue'
import SkillNode from './SkillNode.vue'

const props = defineProps({
  nodes: {
    type: Array,
    default: () => []
  },
  treeColor: {
    type: String,
    default: '#4A90D9'
  },
  width: {
    type: Number,
    default: 700
  },
  height: {
    type: Number,
    default: 500
  },
  getNodeStatus: {
    type: Function,
    default: () => 'locked'
  },
  getNodeProgress: {
    type: Function,
    default: () => 0
  }
})

const emit = defineEmits(['nodeTap'])

const canvasWidth = computed(() => props.width)
const canvasHeight = computed(() => props.height)

const canvasStyle = computed(() => ({
  width: `${props.width}rpx`,
  height: `${props.height}rpx`
}))

// 节点大小（rpx）
const NODE_SIZE = 90
const TIER_HEIGHT = 160 // 每层之间的高度
const H_GAP = 180 // 水平方向节点间距

// 计算每层节点的位置
const positionedNodes = computed(() => {
  if (!props.nodes.length) return []
  
  // 按tier分组
  const tiers = {}
  for (const node of props.nodes) {
    const tier = node.tier || 0
    if (!tiers[tier]) tiers[tier] = []
    tiers[tier].push(node)
  }
  
  const result = []
  const canvasCenterX = props.width / 2
  
  // 遍历每个tier
  Object.keys(tiers).sort((a, b) => Number(a) - Number(b)).forEach((tierStr, tierIdx) => {
    const tier = Number(tierStr)
    const tierNodes = tiers[tierStr]
    const tierY = tier * TIER_HEIGHT + 40 // 顶部留出一些空间
    
    // 计算该层节点的总宽度
    const totalWidth = tierNodes.length * H_GAP
    const startX = canvasCenterX - totalWidth / 2 + H_GAP / 2
    
    tierNodes.forEach((node, nodeIdx) => {
      result.push({
        ...node,
        x: startX + nodeIdx * H_GAP - NODE_SIZE / 2,
        y: tierY,
        tier,
        index: nodeIdx
      })
    })
  })
  
  return result
})

// 生成连线数据
const connections = computed(() => {
  const lines = []
  
  for (const node of positionedNodes.value) {
    const prereqIds = JSON.parse(node.prerequisiteIds || '[]')
    
    for (const prereqId of prereqIds) {
      const prereqNode = positionedNodes.value.find(n => n.id === prereqId)
      if (!prereqNode) continue
      
      // 计算连线起点和终点（节点中心）
      const x1 = prereqNode.x + NODE_SIZE / 2
      const y1 = prereqNode.y + NODE_SIZE / 2
      const x2 = node.x + NODE_SIZE / 2
      const y2 = node.y + NODE_SIZE / 2
      
      // 检查前置节点是否解锁
      const prereqOriginal = props.nodes.find(n => n.id === prereqId)
      const unlocked = props.getNodeStatus(prereqId) === 'unlocked'
      
      lines.push({
        x1: x1 * 0.75, // 转换为实际svg坐标
        y1: y1 * 0.75,
        x2: x2 * 0.75,
        y2: y2 * 0.75,
        unlocked
      })
    }
  }
  
  return lines
})

const onNodeTap = (node) => {
  emit('nodeTap', node)
}
</script>

<style scoped>
.skill-tree-canvas {
  position: relative;
  overflow: hidden;
}

.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.nodes-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.node-wrapper {
  position: absolute;
  transition: transform 0.2s ease;
}
</style>