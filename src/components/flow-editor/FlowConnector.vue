<template>
  <svg class="flow-connector" :style="svgStyle">
    <!-- Connection path -->
    <path
      :d="pathData"
      :stroke="color"
      stroke-width="2"
      fill="none"
      marker-end="url(#arrowhead)"
      class="connector-path"
      :class="{ 'selected': isSelected }"
      @click="onClick"
    />
    
    <!-- Arrowhead definition -->
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon
          points="0 0, 10 3.5, 0 7"
          :fill="color"
        />
      </marker>
    </defs>
  </svg>
</template>

<script>
export default {
  name: 'FlowConnector',
  
  props: {
    connection: {
      type: Object,
      required: true
    },
    sourceNode: {
      type: Object,
      required: true
    },
    targetNode: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['select', 'delete'],
  
  computed: {
    // Node dimensions
    nodeWidth() {
      return 120
    },
    
    nodeHeight() {
      return 60
    },
    
    // Port positions
    sourceX() {
      return this.sourceNode.x + this.nodeWidth / 2
    },
    
    sourceY() {
      return this.sourceNode.y + this.nodeHeight // bottom of node
    },
    
    targetX() {
      return this.targetNode.x + this.nodeWidth / 2
    },
    
    targetY() {
      return this.targetNode.y // top of node
    },
    
    // SVG canvas size
    svgStyle() {
      const minX = Math.min(this.sourceX, this.targetX) - 20
      const minY = Math.min(this.sourceY, this.targetY) - 20
      const maxX = Math.max(this.sourceX, this.targetX) + 20
      const maxY = Math.max(this.sourceY, this.targetY) + 20
      
      return {
        position: 'absolute',
        left: `${minX}px`,
        top: `${minY}px`,
        width: `${maxX - minX}px`,
        height: `${maxY - minY}px`,
        pointerEvents: 'none',
        overflow: 'visible'
      }
    },
    
    // Bezier path data
    pathData() {
      const sx = this.sourceX
      const sy = this.sourceY
      const tx = this.targetX
      const ty = this.targetY
      
      // Offset to SVG coordinate system
      const offsetX = parseFloat(this.svgStyle.left)
      const offsetY = parseFloat(this.svgStyle.top)
      
      const x1 = sx - offsetX
      const y1 = sy - offsetY
      const x2 = tx - offsetX
      const y2 = ty - offsetY
      
      // Calculate control points for bezier curve
      const dx = x2 - x1
      const dy = y2 - y1
      
      // Vertical distance
      const verticalDist = Math.abs(dy)
      
      // Control point offset (curvature)
      const cpOffset = Math.min(verticalDist * 0.5, 80)
      
      // Start from bottom of source, end at top of target
      const startX = x1
      const startY = y1
      const endX = x2
      const endY = y2
      
      // Control points - curve downwards then up
      const cp1x = startX
      const cp1y = startY + cpOffset
      const cp2x = endX
      const cp2y = endY - cpOffset
      
      return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`
    },
    
    // Color based on source node type
    color() {
      return this.isSelected ? '#ef4444' : '#94a3b8'
    }
  },
  
  methods: {
    onClick(e) {
      console.log('[V5] Connector clicked:', this.connection.id)
      e.stopPropagation()
      this.$emit('select', this.connection.id)
    }
  }
}
</script>

<style scoped>
.flow-connector {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.connector-path {
  pointer-events: stroke;
  cursor: pointer;
  transition: stroke 0.2s;
}

.connector-path:hover {
  stroke-width: 3;
}

.connector-path.selected {
  stroke-width: 3;
  stroke-dasharray: 5, 5;
  animation: dash 0.5s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -10;
  }
}
</style>