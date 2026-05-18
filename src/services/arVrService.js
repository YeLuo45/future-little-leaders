/**
 * V39 AR/VR Service
 * AR/VR功能服务层
 */

// AR状态
const AR_STATES = {
  IDLE: 'idle',
  SCANNING: 'scanning',
  TRACKING: 'tracking',
  ERROR: 'error'
}

// AR能力检测
export const checkArCapability = () => {
  // 模拟AR能力检测
  const hasCamera = true // 实际应检测 camera API
  const hasWebGL = checkWebGLSupport()
  const hasGyroscope = typeof wx !== 'undefined' && wx.onGyroscopeChange
  
  return {
    supported: hasCamera && hasWebGL,
    features: {
      ar: hasCamera && hasWebGL,
      webgl: hasWebGL,
      gyroscope: !!hasGyroscope
    }
  }
}

// WebGL支持检测
export const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch (e) {
    return false
  }
}

// AR扫描管理器
export class ArScanner {
  constructor() {
    this.state = AR_STATES.IDLE
    this.onStateChange = null
    this.onDetectionResult = null
  }

  startScan() {
    if (this.state === AR_STATES.SCANNING) return
    
    this.state = AR_STATES.SCANNING
    this.notifyStateChange()
    
    // 模拟扫描延迟
    setTimeout(() => {
      this.processScan()
    }, 3000)
  }

  stopScan() {
    this.state = AR_STATES.IDLE
    this.notifyStateChange()
  }

  processScan() {
    // 模拟AR检测结果
    this.state = AR_STATES.TRACKING
    this.notifyStateChange()
    
    if (this.onDetectionResult) {
      this.onDetectionResult({
        success: true,
        data: {
          type: 'task_planet',
          id: 'planet_001',
          name: '任务星球',
          distance: 1.5
        }
      })
    }
  }

  notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange(this.state)
    }
  }
}

// 3D渲染管理器
export class Renderer3D {
  constructor(canvas) {
    this.canvas = canvas
    this.gl = null
    this.scenes = new Map()
    this.currentScene = null
    this.animationId = null
  }

  init() {
    if (!this.canvas) return false
    
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl')
    if (!this.gl) return false
    
    this.setupGL()
    return true
  }

  setupGL() {
    const gl = this.gl
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)
  }

  createScene(id) {
    const scene = {
      id,
      objects: [],
      camera: { x: 0, y: 0, z: 5 },
      lights: []
    }
    this.scenes.set(id, scene)
    return scene
  }

  setActiveScene(id) {
    this.currentScene = this.scenes.get(id)
  }

  addObject(sceneId, object) {
    const scene = this.scenes.get(sceneId)
    if (scene) {
      scene.objects.push(object)
    }
  }

  render() {
    if (!this.gl || !this.currentScene) return
    
    const gl = this.gl
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    
    // 渲染逻辑
    this.renderScene(this.currentScene)
    
    this.animationId = requestAnimationFrame(() => this.render())
  }

  renderScene(scene) {
    // 基础渲染实现
    scene.objects.forEach(obj => {
      // 3D对象渲染
    })
  }

  startAnimation() {
    if (!this.animationId) {
      this.render()
    }
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  dispose() {
    this.stopAnimation()
    this.scenes.clear()
    this.gl = null
  }
}

// 成就3D画廊管理器
export class AchievementGallery3D {
  constructor() {
    this.achievements = []
    this.currentIndex = 0
    this.rotation = { x: 0, y: 0 }
  }

  setAchievements(achievements) {
    this.achievements = achievements
  }

  rotate(deltaX, deltaY) {
    this.rotation.y += deltaX * 0.5
    this.rotation.x = Math.max(-15, Math.min(10, this.rotation.x + deltaY * 0.3))
  }

  getDisplayAchievements() {
    return this.achievements.slice(0, 8)
  }

  selectAchievement(index) {
    this.currentIndex = index
  }

  getSelectedAchievement() {
    return this.achievements[this.currentIndex] || null
  }
}

// 虚拟奖励空间管理器
export class RewardSpaceManager {
  constructor() {
    this.trophies = []
    this.unlockedTrophies = new Set()
    this.pendingRewards = []
  }

  loadTrophies(trophies) {
    this.trophies = trophies
    trophies.forEach(t => {
      if (t.isUnlocked) {
        this.unlockedTrophies.add(t.id)
      }
    })
  }

  unlockTrophy(trophyId) {
    this.unlockedTrophies.add(trophyId)
    const trophy = this.trophies.find(t => t.id === trophyId)
    if (trophy) {
      trophy.isUnlocked = true
    }
  }

  addPendingReward(reward) {
    this.pendingRewards.push(reward)
  }

  claimReward(rewardId) {
    const index = this.pendingRewards.findIndex(r => r.id === rewardId)
    if (index > -1) {
      return this.pendingRewards.splice(index, 1)[0]
    }
    return null
  }

  claimAllRewards() {
    const rewards = [...this.pendingRewards]
    this.pendingRewards = []
    return rewards
  }

  getUnlockedCount() {
    return this.unlockedTrophies.size
  }

  getTotalCount() {
    return this.trophies.length
  }
}

// AR特效管理器
export class ArEffectsManager {
  constructor() {
    this.particles = []
    this.confetti = []
  }

  createParticleEffect(options = {}) {
    const {
      x = 0.5,
      y = 0.5,
      count = 20,
      icons = ['✨', '⭐', '🌟']
    } = options

    const particles = []
    for (let i = 0; i < count; i++) {
      particles.push({
        id: `particle_${Date.now()}_${i}`,
        icon: icons[Math.floor(Math.random() * icons.length)],
        x: x + (Math.random() - 0.5) * 0.2,
        y: y + (Math.random() - 0.5) * 0.2,
        scale: 0.5 + Math.random(),
        delay: Math.random() * 0.5,
        duration: 1 + Math.random()
      })
    }
    return particles
  }

  createConfetti(options = {}) {
    const {
      count = 50,
      colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181']
    } = options

    const confetti = []
    for (let i = 0; i < count; i++) {
      confetti.push({
        id: `confetti_${Date.now()}_${i}`,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.random(),
        rotation: Math.random() * 720,
        delay: Math.random() * 0.8,
        duration: 1.5 + Math.random()
      })
    }
    return confetti
  }

  createCelebrationBurst() {
    return {
      rays: Array.from({ length: 12 }, (_, i) => i * 30),
      duration: 500
    }
  }
}

// 导出管理器实例
let arScannerInstance = null
let effectsManagerInstance = null
let gallery3DInstance = null
let rewardSpaceInstance = null

export const getArScanner = () => {
  if (!arScannerInstance) {
    arScannerInstance = new ArScanner()
  }
  return arScannerInstance
}

export const getEffectsManager = () => {
  if (!effectsManagerInstance) {
    effectsManagerInstance = new ArEffectsManager()
  }
  return effectsManagerInstance
}

export const getAchievementGallery3D = () => {
  if (!gallery3DInstance) {
    gallery3DInstance = new AchievementGallery3D()
  }
  return gallery3DInstance
}

export const getRewardSpaceManager = () => {
  if (!rewardSpaceInstance) {
    rewardSpaceInstance = new RewardSpaceManager()
  }
  return rewardSpaceInstance
}

export default {
  checkArCapability,
  checkWebGLSupport,
  ArScanner,
  Renderer3D,
  AchievementGallery3D,
  RewardSpaceManager,
  ArEffectsManager,
  getArScanner,
  getEffectsManager,
  getAchievementGallery3D,
  getRewardSpaceManager
}
