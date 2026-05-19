<template>
  <view class="knowledge-tree-canvas" :style="canvasStyle">
    <!-- SVG连线层 -->
    <svg class="connections-layer" :viewBox="`0 0 ${svgWidth} ${svgHeight}`">
      <defs>
        <linearGradient id="lineGradientUnlocked" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#52c41a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#389e0d;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="lineGradientAvailable" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#1890ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#096dd9;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="lineGradientLocked" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#d9d9d9;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#bfbfbf;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- 绘制连线 -->
      <path
        v-for="(conn, idx) in connections"
        :key="'conn-' + idx"
        :d="conn.path"
        :stroke="conn.color"
        stroke-width="3"
        stroke-linecap="round"
        :stroke-dasharray="conn.unlocked ? 'none' : '8,4'"
        fill="none"
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
        @tap="onNodeTap(node)"
      >
        <KnowledgeNode
          :node="node"
          :status="getNodeStatus(node.id)"
          :progress="getNodeProgress(node.id)"
          :color="treeColor"
          :size="nodeSize"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import KnowledgeNode from './KnowledgeNode.vue'

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
    default: 800
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

// 节点大小（rpx）
const nodeSize = 100
const TIER_HEIGHT = 180 // 每层之间的高度
const H_GAP = 200 // 水平方向节点间距

// SVG实际尺寸（按比例缩小）
const svgWidth = computed(() => props.width * 0.75)
const svgHeight = computed(() => props.height * 0.75)

const canvasStyle = computed(() => ({
  width: `${props.width}rpx`,
  height: `${props.height}rpx`
}))

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
  Object.keys(tiers).sort((a, b) => Number(a) - Number(b)).forEach((tierStr) => {
    const tier = Number(tierStr)
    const tierNodes = tiers[tierStr]
    const tierY = tier * TIER_HEIGHT + 60 // 顶部留出一些空间
    
    // 计算该层节点的总宽度
    const totalWidth = tierNodes.length * H_GAP
    const startX = canvasCenterX - totalWidth / 2 + H_GAP / 2
    
    tierNodes.forEach((node, nodeIdx) => {
      result.push({
        ...node,
        x: startX + nodeIdx * H_GAP - nodeSize / 2,
        y: tierY,
        tier,
        index: nodeIdx
      })
    })
  })
  
  return result
})

// 获取连线颜色
const getLineColor = (status) => {
  if (status === 'completed') return 'url(#lineGradientUnlocked)'
  if (status === 'in_progress' || status === 'available') return 'url(#lineGradientAvailable)'
  return 'url(#lineGradientLocked)'
}

// 生成连线数据（使用曲线连接）
const connections = computed(() => {
  const paths = []
  
  for (const node of positionedNodes.value) {
    const prereqIds = JSON.parse(node.prerequisiteIds || '[]')
    
    for (const prereqId of prereqIds) {
      const prereqNode = positionedNodes.value.find(n => n.id === prereqId)
      if (!prereqNode) continue
      
      // 计算连线起点和终点（节点中心）
      const x1 = prereqNode.x + nodeSize / 2
      const y1 = prereqNode.y + nodeSize / 2
      const x2 = node.x + nodeSize / 2
      const y2 = node.y + nodeSize / 2
      
      // 检查前置节点状态
      const prereqStatus = props.getNodeStatus(prereqId)
      const unlocked = prereqStatus === 'completed'
      
      // 生成贝塞尔曲线路径
      const midY = (y1 + y2) / 2
      const pathD = `M ${x1 * 0.75} ${y1 * 0.75} Q ${x1 * 0.75} ${midY * 0.75} ${(x1 + x2) * 0.375} ${midY * 0.75} T ${x2 * 0.75} ${y2 * 0.75}`
      
      paths.push({
        path: pathD,
        color: getLineColor(unlocked ? 'completed' : 'locked'),
        unlocked
      })
    }
  }
  
  return paths
})

const onNodeTap = (node) => {
  emit('nodeTap', node)
}
</script>

<style scoped>
.knowledge-tree-canvas {
  position: relative;
  overflow: auto;
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
