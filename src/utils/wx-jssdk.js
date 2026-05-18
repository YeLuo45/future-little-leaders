/**
 * 微信 JSSDK 封装
 * #ifdef H5: H5 端使用微信 JSSDK
 * #ifdef MP-WEIXIN: 小程序端直接调用 wx API
 */

// #ifdef H5
/**
 * H5 端微信 JSSDK 封装
 * 需要引入微信 JSSDK: https://res.wx.qq.com/open/js/jweixin-1.6.0.js
 */
const wxJssdk = {
  configReady: false,
  shareConfig: null,

  /**
   * 初始化 JSSDK 配置
   * @param {Object} options - 初始化选项
   * @param {string} options.appId - 微信公众号 appId
   * @param {string} options.timestamp - 签名时间戳
   * @param {string} options.nonceStr - 随机字符串
   * @param {string} options.signature - 签名
   */
  async init(options = {}) {
    const defaultOptions = {
      appId: '',
      timestamp: Math.floor(Date.now() / 1000).toString(),
      nonceStr: Math.random().toString(36).substring(2, 15),
      signature: '',
      debug: false,
      jsApiList: [
        'updateAppMessageShareData',
        'updateTimelineShareData',
        'chooseImage',
        'previewImage',
        'uploadImage',
        'downloadImage',
        'getLocalImgData',
        'openLocation',
        'getLocation'
      ]
    }

    const config = { ...defaultOptions, ...options }

    return new Promise((resolve, reject) => {
      if (typeof wx === 'undefined') {
        console.warn('[WX JSSDK] wx object not found, running in mock mode')
        this.configReady = true
        resolve(true)
        return
      }

      wx.config({
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        debug: config.debug,
        jsApiList: config.jsApiList,
        success: () => {
          this.configReady = true
          resolve(true)
        },
        fail: (err) => {
          console.error('[WX JSSDK] config failed:', err)
          reject(err)
        }
      })
    })
  },

  /**
   * 检查 API 是否可用
   * @param {string} apiName - API 名称
   * @returns {Promise<boolean>}
   */
  checkJsApi(apiName) {
    return new Promise((resolve, reject) => {
      if (typeof wx === 'undefined') {
        resolve(false)
        return
      }

      wx.checkJsApi({
        jsApiList: [apiName],
        success: (res) => {
          resolve(res.checkResult[apiName] === true)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  /**
   * 获取地理位置
   * @returns {Promise<{latitude: number, longitude: number}>}
   */
  getLocation() {
    return new Promise((resolve, reject) => {
      if (typeof wx === 'undefined') {
        // Mock 模式
        resolve({ latitude: 39.9042, longitude: 116.4074 })
        return
      }

      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude
          })
        },
        fail: (err) => {
          console.error('[WX JSSDK] getLocation failed:', err)
          reject(err)
        }
      })
    })
  },

  /**
   * 分享给朋友
   * @param {Object} options - 分享配置
   */
  shareToFriend(options = {}) {
    const defaultOptions = {
      title: 'future-little-leaders',
      desc: '亲子任务管理应用',
      link: window.location.href,
      imgUrl: '',
      success: () => {},
      fail: () => {}
    }

    const shareOptions = { ...defaultOptions, ...options }

    if (typeof wx === 'undefined') {
      console.warn('[WX JSSDK] shareToFriend: wx not available, using mock')
      shareOptions.success()
      return
    }

    wx.updateAppMessageShareData({
      title: shareOptions.title,
      desc: shareOptions.desc,
      link: shareOptions.link,
      imgUrl: shareOptions.imgUrl,
      success: () => {
        shareOptions.success()
      },
      fail: (err) => {
        console.error('[WX JSSDK] shareToFriend failed:', err)
        shareOptions.fail(err)
      }
    })
  },

  /**
   * 分享到朋友圈
   * @param {Object} options - 分享配置
   */
  shareToTimeline(options = {}) {
    const defaultOptions = {
      title: 'future-little-leaders',
      link: window.location.href,
      imgUrl: '',
      success: () => {},
      fail: () => {}
    }

    const shareOptions = { ...defaultOptions, ...options }

    if (typeof wx === 'undefined') {
      console.warn('[WX JSSDK] shareToTimeline: wx not available, using mock')
      shareOptions.success()
      return
    }

    wx.updateTimelineShareData({
      title: shareOptions.title,
      link: shareOptions.link,
      imgUrl: shareOptions.imgUrl,
      success: () => {
        shareOptions.success()
      },
      fail: (err) => {
        console.error('[WX JSSDK] shareToTimeline failed:', err)
        shareOptions.fail(err)
      }
    })
  },

  /**
   * 选择图片
   * @param {number} count - 选择数量
   * @returns {Promise<string[]>} - 图片本地路径数组
   */
  chooseImage(count = 1) {
    return new Promise((resolve, reject) => {
      if (typeof wx === 'undefined') {
        resolve([])
        return
      }

      wx.chooseImage({
        count,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          resolve(res.localIds || [])
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  /**
   * 预览图片
   * @param {string[]} urls - 图片 URL 数组
   * @param {number} current - 当前显示图片索引
   */
  previewImage(urls, current = 0) {
    if (typeof wx === 'undefined') {
      console.warn('[WX JSSDK] previewImage: wx not available')
      return
    }

    wx.previewImage({
      current: urls[current],
      urls
    })
  },

  /**
   * 上传图片
   * @param {string} localId - 本地图片 ID
   * @returns {Promise<string>} - 服务器端图片 ID
   */
  uploadImage(localId) {
    return new Promise((resolve, reject) => {
      if (typeof wx === 'undefined') {
        resolve('')
        return
      }

      wx.uploadImage({
        localId,
        isShowProgressTips: 1,
        success: (res) => {
          resolve(res.serverId)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  /**
   * 保存图片到相册
   * @param {string} localId - 本地图片 ID
   * @returns {Promise<boolean>}
   */
  saveImageToPhotosAlbum(localId) {
    return new Promise((resolve, reject) => {
      if (typeof wx === 'undefined') {
        console.warn('[WX JSSDK] saveImageToPhotosAlbum: wx not available')
        resolve(false)
        return
      }

      wx.saveImageToPhotosAlbum({
        localId,
        success: () => resolve(true),
        fail: (err) => reject(err)
      })
    })
  },

  /**
   * 调起微信扫一扫
   * @returns {Promise<string>} - 扫描结果
   */
  scanQRCode() {
    return new Promise((resolve, reject) => {
      if (typeof wx === 'undefined') {
        resolve('')
        return
      }

      wx.scanQRCode({
        needResult: 1,
        scanType: ['qrCode', 'barCode'],
        success: (res) => {
          resolve(res.resultStr)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  /**
   * 打开位置
   * @param {Object} options - 位置选项
   */
  openLocation(options = {}) {
    const defaultOptions = {
      latitude: 39.9042,
      longitude: 116.4074,
      name: '',
      address: '',
      scale: 15
    }

    const locationOptions = { ...defaultOptions, ...options }

    if (typeof wx === 'undefined') {
      console.warn('[WX JSSDK] openLocation: wx not available')
      return
    }

    wx.openLocation(locationOptions)
  }
}

export default wxJssdk
// #endif

// #ifdef MP-WEIXIN
/**
 * 小程序端直接调用 wx API
 */
const wxMiniProgram = {
  /**
   * 获取当前位置
   * @returns {Promise<{latitude: number, longitude: number}>}
   */
  getLocation() {
    return new Promise((resolve, reject) => {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude
          })
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  /**
   * 分享给朋友
   * @param {Object} options - 分享配置
   */
  shareToFriend(options = {}) {
    const defaultOptions = {
      title: 'future-little-leaders',
      path: '/pages/index/index',
      imageUrl: ''
    }

    const shareOptions = { ...defaultOptions, ...options }

    wx.shareAppMessage({
      title: shareOptions.title,
      path: shareOptions.path,
      imageUrl: shareOptions.imageUrl
    })
  },

  /**
   * 分享到朋友圈
   * @param {Object} options - 分享配置
   */
  shareToTimeline(options = {}) {
    const defaultOptions = {
      title: 'future-little-leaders',
      query: ''
    }

    const shareOptions = { ...defaultOptions, ...options }

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })

    // 朋友圈分享
    wx.onShareTimeline(() => ({
      title: shareOptions.title,
      query: shareOptions.query,
      imageUrl: shareOptions.imageUrl || ''
    }))
  },

  /**
   * 选择图片
   * @param {number} count - 选择数量
   * @returns {Promise<string[]>} - 图片临时路径数组
   */
  chooseImage(count = 1) {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          resolve(res.tempFilePaths || [])
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  /**
   * 预览图片
   * @param {string[]} urls - 图片路径数组
   * @param {number} current - 当前显示图片索引
   */
  previewImage(urls, current = 0) {
    wx.previewImage({
      current: urls[current],
      urls
    })
  },

  /**
   * 保存图片到相册
   * @param {string} filePath - 图片路径
   * @returns {Promise<boolean>}
   */
  saveImageToPhotosAlbum(filePath) {
    return new Promise((resolve, reject) => {
      wx.saveImageToPhotosAlbum({
        filePath,
        success: () => resolve(true),
        fail: (err) => reject(err)
      })
    })
  },

  /**
   * 调起微信扫一扫
   * @returns {Promise<string>} - 扫描结果
   */
  scanQRCode() {
    return new Promise((resolve, reject) => {
      wx.scanCode({
        success: (res) => {
          resolve(res.result)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  /**
   * 打开位置
   * @param {Object} options - 位置选项
   */
  openLocation(options = {}) {
    const defaultOptions = {
      latitude: 39.9042,
      longitude: 116.4074,
      name: '',
      address: '',
      scale: 15
    }

    const locationOptions = { ...defaultOptions, ...options }

    wx.openLocation(locationOptions)
  },

  /**
   * 设置分享菜单
   * @param {Object} options - 分享选项
   */
  showShareMenu(options = {}) {
    const defaultOptions = {
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    }

    wx.showShareMenu({
      ...defaultOptions,
      ...options
    })
  },

  /**
   * 开启用户截屏监听
   * @param {Function} callback - 截屏回调
   */
  onUserCaptureScreen(callback) {
    wx.onUserCaptureScreen(callback)
  },

  /**
   * 检查 Session 是否有效
   * @returns {Promise<boolean>}
   */
  checkSession() {
    return new Promise((resolve, reject) => {
      wx.checkSession({
        success: () => resolve(true),
        fail: () => resolve(false)
      })
    })
  },

  /**
   * 获取小程序唯一标识
   * @returns {string}
   */
  getMiniProgramId() {
    return wx.getAccountInfoSync().miniProgram.appId
  }
}

export default wxMiniProgram
// #endif

// #ifndef H5 && !MP-WEIXIN
/**
 * 非微信环境 Mock 实现
 */
const wxMock = {
  configReady: true,

  async init(options = {}) {
    console.warn('[WX Mock] Running in mock mode - not H5 or MP-WEIXIN')
    return true
  },

  async getLocation() {
    return { latitude: 39.9042, longitude: 116.4074 }
  },

  async checkJsApi() {
    return false
  },

  shareToFriend(options = {}) {
    console.warn('[WX Mock] shareToFriend called')
    options.success?.()
  },

  shareToTimeline(options = {}) {
    console.warn('[WX Mock] shareToTimeline called')
    options.success?.()
  },

  async chooseImage(count = 1) {
    return []
  },

  previewImage(urls, current = 0) {
    console.warn('[WX Mock] previewImage called')
  },

  async uploadImage(localId) {
    return ''
  },

  async saveImageToPhotosAlbum() {
    return false
  },

  async scanQRCode() {
    return ''
  },

  openLocation(options = {}) {
    console.warn('[WX Mock] openLocation called')
  }
}

export default wxMock
// #endif
