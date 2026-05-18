<template>
  <view class="share-poster">
    <canvas
      v-if="shouldRender"
      :canvas-id="canvasId"
      :id="canvasId"
      class="poster-canvas"
      :style="{ width: width + 'px', height: height + 'px' }"
    />
    <image v-if="posterImage" :src="posterImage" class="poster-image" mode="aspectFit" />
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  template: {
    type: String,
    default: 'default'
  },
  cardData: {
    type: Object,
    default: () => ({})
  },
  width: {
    type: Number,
    default: 300
  },
  height: {
    type: Number,
    default: 400
  }
})

const canvasId = 'share-poster-canvas-' + Math.random().toString(36).substring(2, 9)
const shouldRender = ref(true)
const posterImage = ref('')

// 模板配置
const templateConfig = {
  default: {
    primaryColor: '#8477fa',
    backgroundColor: '#f5f5f5',
    gradient: null
  },
  gradient: {
    primaryColor: '#667eea',
    backgroundColor: '#764ba2',
    gradient: ['#667eea', '#764ba2']
  },
  star: {
    primaryColor: '#f093fb',
    backgroundColor: '#f5576c',
    gradient: ['#f093fb', '#f5576c']
  },
  nature: {
    primaryColor: '#38f9d7',
    backgroundColor: '#43e97b',
    gradient: ['#38f9d7', '#43e97b']
  }
}

const currentTemplate = computed(() => {
  return templateConfig[props.template] || templateConfig.default
})

/**
 * 绘制圆角矩形
 * @param {CanvasContext} ctx - canvas 上下文
 * @param {number} x - x 坐标
 * @param {number} y - y 坐标
 * @param {number} w - 宽度
 * @param {number} h - 高度
 * @param {number} r - 圆角半径
 */
const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/**
 * 绘制圆形图片
 * @param {CanvasContext} ctx - canvas 上下文
 * @param {CanvasImage} img - 图片对象
 * @param {number} x - 圆心 x 坐标
 * @param {number} y - 圆心 y 坐标
 * @param {number} r - 半径
 */
const circleImg = (ctx, img, x, y, r) => {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(img, x - r, y - r, r * 2, r * 2)
  ctx.restore()
}

/**
 * 绘制文字（支持自动换行）
 * @param {CanvasContext} ctx - canvas 上下文
 * @param {string} text - 文本
 * @param {number} x - x 坐标
 * @param {number} y - y 坐标
 * @param {number} maxWidth - 最大宽度
 * @param {number} lineHeight - 行高
 */
const drawText = (ctx, text, x, y, maxWidth, lineHeight = 24) => {
  const chr = text.split('')
  let temp = ''
  const row = []

  for (let a = 0; a < chr.length; a++) {
    if (ctx.measureText(temp).width < maxWidth) {
      temp += chr[a]
    } else {
      row.push(temp)
      temp = chr[a]
    }
  }
  row.push(temp)

  let yPos = y
  for (let b = 0; b < row.length; b++) {
    ctx.fillText(row[b], x, yPos)
    yPos += lineHeight
  }
}

const generatePoster = async () => {
  try {
    shouldRender.value = true
    posterImage.value = ''

    await nextTick()

    // #ifdef H5
    const canvas = document.getElementById(canvasId)
    if (!canvas) {
      console.warn('[share-poster] Canvas not found')
      return null
    }
    const ctx = canvas.getContext('2d')
    // #endif

    // #ifdef MP-WEIXIN
    const ctx = uni.createCanvasContext(canvasId)
    // #endif

    const dpr = 2 // 设备像素比
    const width = props.width
    const height = props.height

    // 设置 canvas 尺寸
    // #ifdef MP-WEIXIN
    ctx.setDevicePixelRatio(dpr)
    // #endif

    // 绘制背景
    const template = currentTemplate.value
    if (template.gradient) {
      // 渐变背景
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, template.gradient[0])
      gradient.addColorStop(1, template.gradient[1])
      ctx.fillStyle = gradient
    } else {
      ctx.fillStyle = template.backgroundColor
    }
    
    roundRect(ctx, 0, 0, width, height, 20)
    ctx.fill()

    // 绘制顶部装饰
    ctx.fillStyle = template.primaryColor
    ctx.beginPath()
    ctx.arc(width - 40, 40, 60, 0, 2 * Math.PI)
    ctx.fill()

    // 绘制标题栏
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    roundRect(ctx, 20, 20, width - 40, 60, 15)
    ctx.fill()

    ctx.fillStyle = template.primaryColor
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText('🏆 成长成就', 40, 58)

    // 绘制头像区域
    const avatarX = width / 2
    const avatarY = 120
    const avatarR = 50

    // 头像背景
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(avatarX, avatarY, avatarR + 5, 0, 2 * Math.PI)
    ctx.fill()

    // 头像（使用 emoji）
    ctx.fillStyle = '#fff'
    ctx.font = '60px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(props.cardData.baby_emoji || '👶', avatarX, avatarY + 20)

    // 绘制昵称
    ctx.fillStyle = '#333'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(props.cardData.baby_name || '小小领袖', avatarX, avatarY + 80)

    // 绘制等级
    ctx.fillStyle = template.primaryColor
    ctx.font = '18px sans-serif'
    ctx.fillText(`Lv.${props.cardData.level || 1}`, avatarX, avatarY + 105)

    // 绘制成就区域
    const achievements = props.cardData.achievements || []
    const startY = 230
    const cardPadding = 20

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    roundRect(ctx, cardPadding, startY, width - cardPadding * 2, 100, 12)
    ctx.fill()

    ctx.fillStyle = '#333'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('🏅 最近成就', cardPadding + 15, startY + 30)

    if (achievements.length > 0) {
      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#666'
      achievements.slice(0, 3).forEach((ach, index) => {
        const y = startY + 55 + index * 18
        ctx.fillText(`• ${ach.name || ach.title || '成就'}`, cardPadding + 15, y)
      })
    } else {
      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#999'
      ctx.fillText('暂无成就记录', cardPadding + 15, startY + 60)
    }

    // 绘制统计信息
    const statsY = startY + 120
    const statWidth = (width - cardPadding * 2) / 2

    // 成就数量
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    roundRect(ctx, cardPadding, statsY, statWidth - 5, 60, 10)
    ctx.fill()
    ctx.fillStyle = template.primaryColor
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(props.cardData.achievement_count || '0', width / 4, statsY + 30)
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#666'
    ctx.fillText('成就数', width / 4, statsY + 48)

    // 总积分
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    roundRect(ctx, width / 2 + 5, statsY, statWidth - 5, 60, 10)
    ctx.fill()
    ctx.fillStyle = '#ff9500'
    ctx.font = 'bold 20px sans-serif'
    ctx.fillText(props.cardData.total_points || '0', width * 3 / 4, statsY + 30)
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#666'
    ctx.fillText('总积分', width * 3 / 4, statsY + 48)

    // 绘制底部时间
    ctx.textAlign = 'center'
    ctx.fillStyle = '#999'
    ctx.font = '12px sans-serif'
    ctx.fillText(props.cardData.time || '', width / 2, height - 30)
    ctx.fillText('future-little-leaders', width / 2, height - 15)

    // #ifdef MP-WEIXIN
    ctx.draw(false, () => {
      uni.canvasToTempFilePath({
        canvasId: canvasId,
        success: (res) => {
          posterImage.value = res.tempFilePath
        },
        fail: (err) => {
          console.error('[share-poster] Failed to generate:', err)
        }
      })
    })
    // #endif

    // #ifdef H5
    const dataUrl = canvas.toDataURL('image/png')
    posterImage.value = dataUrl
    return dataUrl
    // #endif

    return posterImage.value
  } catch (err) {
    console.error('[share-poster] Failed to generate poster:', err)
    return null
  }
}

// 监听模板和数据变化
watch([() => props.template, () => props.cardData], () => {
  shouldRender.value = false
  nextTick(() => {
    shouldRender.value = true
  })
}, { deep: true })

onMounted(() => {
  // 初始化时自动生成
  if (props.cardData && props.cardData.baby_name) {
    setTimeout(() => {
      generatePoster()
    }, 100)
  }
})

defineExpose({
  generatePoster
})
</script>

<style scoped>
.share-poster {
  width: 100%;
  height: 100%;
  position: relative;
}

.poster-canvas {
  position: absolute;
  top: 0;
  left: 0;
}

.poster-image {
  width: 100%;
  height: 100%;
}
</style>
