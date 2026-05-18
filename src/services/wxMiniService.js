/**
 * 微信小程序服务
 * 提供微信登录、小程序码生成、微信运动同步、微信支付等功能
 */

/**
 * 生成唯一 ID
 * @returns {string}
 */
const generateId = () => {
  return 'wx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
}

/**
 * 格式化日期
 * @param {Date|string} date - 日期
 * @returns {string}
 */
const formatDate = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const wxMiniService = {
  /**
   * 获取 App 实例 (单例)
   */
  app: null,

  /**
   * 初始化服务
   */
  init() {
    // #ifdef MP-WEIXIN
    this.app = getApp()
    // #endif
    return this
  },

  // ==================== 微信登录 ====================

  /**
   * 微信登录 (mock 授权流程)
   * 实际项目中需要配合后端接口完成 openid 获取和账号绑定
   * @returns {Promise<Object>}
   */
  async wxLogin() {
    return new Promise((resolve, reject) => {
      // #ifdef MP-WEIXIN
      uni.getUserProfile({
        desc: '用于完善用户资料',
        success: async (res) => {
          const userInfo = res.userInfo
          // Mock 登录成功
          const mockSession = {
            openid: 'wx_' + generateId(),
            session_key: 'mock_session_' + Date.now(),
            userInfo: {
              nickname: userInfo.nickName,
              avatar: userInfo.avatarUrl,
              gender: userInfo.gender,
              country: userInfo.country,
              province: userInfo.province,
              city: userInfo.city
            },
            bind_status: 'new', // 'new' | 'bound' | 'existing'
            points: 0,
            member_level: 0,
            created_at: new Date().toISOString()
          }
          
          // 存储登录信息
          try {
            uni.setStorageSync('wx_session', mockSession)
          } catch (e) {
            console.error('[wxMiniService] Storage sync failed:', e)
          }
          
          resolve(mockSession)
        },
        fail: (err) => {
          console.error('[wxMiniService] wx.getUserProfile failed:', err)
          reject({ errMsg: err.errMsg || '用户拒绝授权' })
        }
      })
      // #endif

      // #ifndef MP-WEIXIN
      // H5 环境 Mock
      const mockSession = {
        openid: 'mock_openid_' + generateId(),
        session_key: 'mock_session_' + Date.now(),
        userInfo: {
          nickname: '微信用户(Mock)',
          avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
          gender: 1,
          country: '中国',
          province: '广东',
          city: '深圳'
        },
        bind_status: 'new',
        points: 100,
        member_level: 0,
        created_at: new Date().toISOString()
      }
      
      try {
        uni.setStorageSync('wx_session', mockSession)
      } catch (e) {
        console.error('[wxMiniService] Storage sync failed:', e)
      }
      
      resolve(mockSession)
      // #endif
    })
  },

  /**
   * 检查登录状态
   * @returns {Object|null}
   */
  checkLoginStatus() {
    try {
      const session = uni.getStorageSync('wx_session')
      return session || null
    } catch (e) {
      return null
    }
  },

  /**
   * 退出登录
   */
  logout() {
    try {
      uni.removeStorageSync('wx_session')
      return true
    } catch (e) {
      return false
    }
  },

  /**
   * 绑定已有账号
   * @param {string} account - 账号
   * @param {string} password - 密码
   * @returns {Promise<Object>}
   */
  async bindExistingAccount(account, password) {
    // Mock 账号绑定
    return new Promise((resolve) => {
      setTimeout(() => {
        const session = uni.getStorageSync('wx_session') || {}
        session.bind_status = 'bound'
        session.account = account
        uni.setStorageSync('wx_session', session)
        resolve({ success: true, message: '绑定成功' })
      }, 500)
    })
  },

  // ==================== 小程序码生成 ====================

  /**
   * 生成分享小程序码配置
   * @param {Object} options - 配置选项
   * @param {string} options.scene - 场景参数 (最大32个可见字符)
   * @param {string} options.page - 页面路径 (必须是已发布的小程序存在的页面)
   * @param {number} options.width - 二维码宽度 (默认 430)
   * @param {boolean} options.auto_color - 自动配置线条颜色 (默认 false)
   * @param {Object} options.env_version - 版本 (develop | trial | release)
   * @returns {Promise<Object>}
   */
  async generateShareQRCode(options = {}) {
    const defaultOptions = {
      scene: 'from=share',
      page: 'pages/index/index',
      width: 430,
      auto_color: false,
      env_version: 'release',
      line_color: { r: 66, g: 133, b: 244 }
    }

    const qrOptions = { ...defaultOptions, ...options }

    return new Promise((resolve, reject) => {
      // #ifdef MP-WEIXIN
      // 微信小程序码生成需要通过后端 API 调用
      // 这里 Mock 返回本地生成的临时码
      uni.request({
        url: 'https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token=mock_token',
        method: 'POST',
        data: {
          scene: qrOptions.scene,
          page: qrOptions.page,
          width: qrOptions.width,
          auto_color: qrOptions.auto_color,
          line_color: qrOptions.line_color,
          env_version: qrOptions.env_version
        },
        success: (res) => {
          if (res.data.errcode) {
            // Mock 成功场景 (实际项目中移除)
            resolve({
              success: true,
              mock: true,
              codeUrl: '/static/images/mock-qrcode.png',
              scene: qrOptions.scene,
              page: qrOptions.page
            })
          } else {
            resolve({
              success: true,
              codeUrl: 'data:image/png;base64,' + res.data.buffer
            })
          }
        },
        fail: (err) => {
          // Mock 成功场景
          console.warn('[wxMiniService] generateShareQRCode API failed, using mock:', err)
          resolve({
            success: true,
            mock: true,
            codeUrl: '/static/images/mock-qrcode.png',
            scene: qrOptions.scene,
            page: qrOptions.page
          })
        }
      })
      // #endif

      // #ifndef MP-WEIXIN
      resolve({
        success: true,
        mock: true,
        codeUrl: '/static/images/mock-qrcode.png',
        scene: qrOptions.scene,
        page: qrOptions.page,
        message: '小程序码仅在微信小程序环境中可用'
      })
      // #endif
    })
  },

  /**
   * 生成分享链接
   * @param {string} path - 页面路径
   * @param {Object} params - 参数
   * @returns {string}
   */
  generateShareLink(path, params = {}) {
    const query = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')
    
    const baseUrl = 'https://api.future-little-leaders.com'
    return `${baseUrl}/${path}?${query}&from=wx_share`
  },

  // ==================== 微信运动同步 ====================

  /**
   * 获取微信运动步数 (需要用户授权)
   * @returns {Promise<Object>}
   */
  async getWeRunData() {
    return new Promise((resolve, reject) => {
      // #ifdef MP-WEIXIN
      uni.getWeRunData({
        success: (res) => {
          // 加密数据，需要后端解密
          // 这里 Mock 返回步数
          resolve({
            success: true,
            mock: true,
            stepInfoList: [
              { step: 8500, timestamp: Date.now() - 86400000 },
              { step: 10200, timestamp: Date.now() - 172800000 },
              { step: 7300, timestamp: Date.now() - 259200000 },
              { step: 9600, timestamp: Date.now() - 345600000 },
              { step: 11000, timestamp: Date.now() - 432000000 },
              { step: 8800, timestamp: Date.now() - 518400000 },
              { step: 12500, timestamp: Date.now() }
            ],
            todaySteps: 12500,
            message: '微信运动数据获取成功'
          })
        },
        fail: (err) => {
          console.error('[wxMiniService] getWeRunData failed:', err)
          reject({ errMsg: err.errMsg || '获取微信运动步数失败' })
        }
      })
      // #endif

      // #ifndef MP-WEIXIN
      // Mock 步数
      resolve({
        success: true,
        mock: true,
        stepInfoList: [
          { step: 8500, timestamp: Date.now() - 86400000, date: formatDate(Date.now() - 86400000) },
          { step: 10200, timestamp: Date.now() - 172800000, date: formatDate(Date.now() - 172800000) },
          { step: 7300, timestamp: Date.now() - 259200000, date: formatDate(Date.now() - 259200000) },
          { step: 9600, timestamp: Date.now() - 345600000, date: formatDate(Date.now() - 345600000) },
          { step: 11000, timestamp: Date.now() - 432000000, date: formatDate(Date.now() - 432000000) },
          { step: 8800, timestamp: Date.now() - 518400000, date: formatDate(Date.now() - 518400000) },
          { step: 12500, timestamp: Date.now(), date: formatDate(Date.now()) }
        ],
        todaySteps: 12500,
        message: '微信运动数据(Mock)'
      })
      // #endif
    })
  },

  /**
   * 检查微信运动授权状态
   * @returns {Promise<boolean>}
   */
  async checkWeRunAuth() {
    return new Promise((resolve) => {
      // #ifdef MP-WEIXIN
      uni.getSetting({
        success: (res) => {
          const scope = res.authSetting['scope.werun']
          resolve(!!scope)
        },
        fail: () => resolve(false)
      })
      // #endif

      // #ifndef MP-WEIXIN
      resolve(true)
      // #endif
    })
  },

  /**
   * 请求微信运动授权
   * @returns {Promise<boolean>}
   */
  async authorizeWeRun() {
    return new Promise((resolve) => {
      // #ifdef MP-WEIXIN
      uni.authorize({
        scope: 'scope.werun',
        success: () => resolve(true),
        fail: () => resolve(false)
      })
      // #endif

      // #ifndef MP-WEIXIN
      resolve(true)
      // #endif
    })
  },

  /**
   * 步数兑换积分
   * @param {number} steps - 步数
   * @returns {Promise<Object>}
   */
  async exchangeStepsToPoints(steps) {
    // 步数兑换规则：每1000步兑换1积分，每日上限10积分
    const exchangeRate = 1000
    const dailyLimit = 10
    const points = Math.min(Math.floor(steps / exchangeRate), dailyLimit)

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          steps,
          points,
          exchangeRate,
          dailyLimit,
          message: `成功将${steps}步兑换为${points}积分`
        })
      }, 300)
    })
  },

  /**
   * 获取今日兑换记录
   * @param {string} userId - 用户ID
   * @returns {Promise<Object|null>}
   */
  async getTodayExchangeRecord(userId) {
    const today = formatDate(new Date())
    try {
      const records = uni.getStorageSync('wx_steps_records') || []
      const todayRecord = records.find(r => r.date === today && r.userId === userId)
      return todayRecord || null
    } catch (e) {
      return null
    }
  },

  /**
   * 保存兑换记录
   * @param {string} userId - 用户ID
   * @param {number} steps - 步数
   * @param {number} points - 积分
   */
  async saveExchangeRecord(userId, steps, points) {
    const today = formatDate(new Date())
    try {
      const records = uni.getStorageSync('wx_steps_records') || []
      const todayIndex = records.findIndex(r => r.date === today && r.userId === userId)
      
      if (todayIndex >= 0) {
        records[todayIndex].steps = steps
        records[todayIndex].points = points
        records[todayIndex].updatedAt = new Date().toISOString()
      } else {
        records.push({
          userId,
          date: today,
          steps,
          points,
          createdAt: new Date().toISOString()
        })
      }
      
      uni.setStorageSync('wx_steps_records', records)
      return true
    } catch (e) {
      return false
    }
  },

  // ==================== 微信支付 ====================

  /**
   * 发起支付请求
   * @param {Object} options - 支付选项
   * @param {string} options.orderId - 订单ID
   * @param {number} options.amount - 金额 (单位: 元)
   * @param {string} options.productName - 商品名称
   * @param {string} options.productDesc - 商品描述
   * @returns {Promise<Object>}
   */
  async requestPayment(options = {}) {
    const { orderId, amount, productName, productDesc } = options

    // #ifdef MP-WEIXIN
    // 实际支付需要后端生成预支付订单
    return new Promise((resolve, reject) => {
      uni.requestPayment({
        timeStamp: String(Date.now()),
        nonceStr: generateId(),
        package: 'prepay_id=mock_prepay_' + orderId,
        signType: 'MD5',
        paySign: 'mock_paysign_' + Date.now(),
        success: (res) => {
          resolve({
            success: true,
            errMsg: res.errMsg,
            orderId,
            amount,
            payTime: new Date().toISOString()
          })
        },
        fail: (err) => {
          console.error('[wxMiniService] requestPayment failed:', err)
          reject({ errMsg: err.errMsg || '支付失败' })
        }
      })
    })
    // #endif

    // #ifndef MP-WEIXIN
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          mock: true,
          errMsg: 'requestPayment:ok',
          orderId,
          amount,
          payTime: new Date().toISOString(),
          message: '支付成功(Mock)'
        })
      }, 1000)
    })
    // #endif
  },

  /**
   * 积分充值
   * @param {string} amount - 充值金额 (10 | 50 | 100)
   * @returns {Promise<Object>}
   */
  async rechargePoints(amount) {
    // 充值比例：1元 = 10积分
    const ratio = 10
    const points = amount * ratio
    const orderId = 'RC' + Date.now() + '_' + generateId()

    const payResult = await this.requestPayment({
      orderId,
      amount,
      productName: `积分充值 - ${amount}元`,
      productDesc: `充值${points}积分`
    })

    if (payResult.success) {
      return {
        success: true,
        orderId,
        amount,
        points,
        ratio,
        message: `成功充值${points}积分`
      }
    }

    return payResult
  },

  /**
   * 季度会员订阅
   * @param {string} planId - 套餐ID (quarterly | yearly)
   * @returns {Promise<Object>}
   */
  async subscribeMember(planId = 'quarterly') {
    const plans = {
      quarterly: { name: '季度会员', amount: 30, duration: 90, discount: 0.9 },
      yearly: { name: '年度会员', amount: 100, duration: 365, discount: 0.75 }
    }

    const plan = plans[planId] || plans.quarterly
    const orderId = 'SUB' + Date.now() + '_' + generateId()

    const payResult = await this.requestPayment({
      orderId,
      amount: plan.amount,
      productName: `${plan.name}订阅`,
      productDesc: `订阅${plan.duration}天，享受${Math.round((1 - plan.discount) * 100)}%优惠`
    })

    if (payResult.success) {
      const session = uni.getStorageSync('wx_session') || {}
      session.member_level = planId === 'yearly' ? 2 : 1
      session.member_expire = new Date(Date.now() + plan.duration * 86400000).toISOString()
      uni.setStorageSync('wx_session', session)

      return {
        success: true,
        orderId,
        plan: plan.name,
        duration: plan.duration,
        memberLevel: session.member_level,
        expireDate: session.member_expire,
        message: `成功订阅${plan.name}`
      }
    }

    return payResult
  },

  /**
   * 获取会员状态
   * @returns {Object}
   */
  getMemberStatus() {
    const session = uni.getStorageSync('wx_session') || {}
    const now = new Date()
    const expireDate = session.member_expire ? new Date(session.member_expire) : null
    const isActive = expireDate && expireDate > now

    return {
      isMember: !!session.member_level && isActive,
      level: session.member_level || 0,
      expireDate: session.member_expire || null,
      isExpired: expireDate ? expireDate <= now : true
    }
  },

  // ==================== 工具方法 ====================

  /**
   * 获取设备信息
   * @returns {Object}
   */
  getDeviceInfo() {
    // #ifdef MP-WEIXIN
    return uni.getDeviceInfo()
    // #endif
    
    // #ifndef MP-WEIXIN
    return {
      brand: 'Mock',
      model: 'Mock Device',
      system: 'Mock OS',
      platform: 'h5'
    }
    // #endif
  },

  /**
   * 检查网络状态
   * @returns {Promise<Object>}
   */
  async checkNetwork() {
    return new Promise((resolve) => {
      // #ifdef MP-WEIXIN
      uni.getNetworkType({
        success: (res) => {
          resolve({
            isConnected: res.networkType !== 'none',
            networkType: res.networkType
          })
        },
        fail: () => resolve({ isConnected: false, networkType: 'unknown' })
      })
      // #endif

      // #ifndef MP-WEIXIN
      resolve({ isConnected: true, networkType: 'wifi' })
      // #endif
    })
  }
}

export default wxMiniService
