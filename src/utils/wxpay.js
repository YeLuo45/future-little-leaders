/**
 * 微信支付工具
 * 提供微信支付相关工具函数
 */

/**
 * 生成支付订单号
 * @param {string} type - 订单类型 (RC: 充值, SUB: 订阅, BUY: 购买)
 * @returns {string}
 */
export const generateOrderId = (type = 'ORDER') => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `${type}${timestamp}_${random}`
}

/**
 * 格式化金额 (分 -> 元)
 * @param {number} fen - 金额(分)
 * @returns {string}
 */
export const formatAmount = (fen) => {
  return (fen / 100).toFixed(2)
}

/**
 * 充值套餐配置
 */
export const RECHARGE_PACKAGES = [
  {
    id: 'rc_10',
    amount: 10,
    points: 100,
    bonus: 0,
    label: '10元',
    description: '100积分',
    popular: false
  },
  {
    id: 'rc_50',
    amount: 50,
    points: 500,
    bonus: 50,
    label: '50元',
    description: '550积分',
    popular: true
  },
  {
    id: 'rc_100',
    amount: 100,
    points: 1000,
    bonus: 150,
    label: '100元',
    description: '1150积分',
    popular: false
  }
]

/**
 * 会员套餐配置
 */
export const MEMBER_PACKAGES = [
  {
    id: 'quarterly',
    name: '季度会员',
    amount: 30,
    duration: 90,
    discount: 0.9,
    features: [
      '解锁全部任务模板',
      '专属成就徽章',
      '每月100积分赠送',
      '专属客服支持'
    ],
    saving: '省12元'
  },
  {
    id: 'yearly',
    name: '年度会员',
    amount: 100,
    duration: 365,
    discount: 0.75,
    features: [
      '季度会员全部权益',
      '专属头像框',
      '每月300积分赠送',
      '优先体验新功能',
      '专属活动参与权'
    ],
    saving: '省220元'
  }
]

/**
 * 支付状态
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
}

/**
 * 支付结果码
 */
export const PAYMENT_RESULT = {
  SUCCESS: 'requestPayment:ok',
  CANCEL: 'requestPayment:fail cancel',
  FAIL: 'requestPayment:fail'
}

/**
 * 验证支付结果
 * @param {string} errMsg - 微信返回的错误信息
 * @returns {Object}
 */
export const validatePaymentResult = (errMsg) => {
  if (!errMsg) {
    return {
      success: false,
      status: PAYMENT_STATUS.FAILED,
      message: '支付结果未知'
    }
  }

  if (errMsg === PAYMENT_RESULT.SUCCESS) {
    return {
      success: true,
      status: PAYMENT_STATUS.SUCCESS,
      message: '支付成功'
    }
  }

  if (errMsg.includes('cancel')) {
    return {
      success: false,
      status: PAYMENT_STATUS.CANCELLED,
      message: '用户取消支付'
    }
  }

  return {
    success: false,
    status: PAYMENT_STATUS.FAILED,
    message: '支付失败'
  }
}

/**
 * 获取订单状态描述
 * @param {string} status - 订单状态
 * @returns {string}
 */
export const getOrderStatusText = (status) => {
  const statusMap = {
    [PAYMENT_STATUS.PENDING]: '待支付',
    [PAYMENT_STATUS.PROCESSING]: '支付中',
    [PAYMENT_STATUS.SUCCESS]: '已支付',
    [PAYMENT_STATUS.FAILED]: '支付失败',
    [PAYMENT_STATUS.CANCELLED]: '已取消',
    [PAYMENT_STATUS.REFUNDED]: '已退款'
  }
  return statusMap[status] || '未知状态'
}

/**
 * 获取订单状态颜色
 * @param {string} status - 订单状态
 * @returns {string}
 */
export const getOrderStatusColor = (status) => {
  const colorMap = {
    [PAYMENT_STATUS.PENDING]: '#ff9800',
    [PAYMENT_STATUS.PROCESSING]: '#2196f3',
    [PAYMENT_STATUS.SUCCESS]: '#4caf50',
    [PAYMENT_STATUS.FAILED]: '#f44336',
    [PAYMENT_STATUS.CANCELLED]: '#9e9e9e',
    [PAYMENT_STATUS.REFUNDED]: '#ff5722'
  }
  return colorMap[status] || '#999'
}

/**
 * 计算支付签名 (简化版)
 * @param {Object} params - 签名参数
 * @returns {string}
 */
export const calculatePaySign = (params) => {
  const { timeStamp, nonceStr, packageStr, signType = 'MD5' } = params
  
  // 实际项目中应该在后端签名，这里仅作演示
  const signStr = `timeStamp=${timeStamp}&nonceStr=${nonceStr}&package=${packageStr}&key=your_wechat_pay_key`
  
  // 简化的签名计算
  let hash = 0
  const str = signStr + signType
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return Math.abs(hash).toString(16).toUpperCase()
}

/**
 * 生成支付参数 (简化版)
 * @param {Object} orderInfo - 订单信息
 * @returns {Object}
 */
export const generatePaymentParams = (orderInfo) => {
  const { orderId, amount } = orderInfo
  const timeStamp = String(Date.now())
  const nonceStr = 'wx' + Date.now() + Math.random().toString(36).substring(2)
  
  return {
    timeStamp,
    nonceStr,
    package: `prepay_id=mock_prepay_${orderId}`,
    signType: 'MD5',
    paySign: calculatePaySign({
      timeStamp,
      nonceStr,
      packageStr: `prepay_id=mock_prepay_${orderId}`,
      signType: 'MD5'
    })
  }
}

/**
 * 保存本地支付记录
 * @param {Object} record - 支付记录
 * @returns {boolean}
 */
export const savePaymentRecord = (record) => {
  try {
    const records = uni.getStorageSync('wx_payment_records') || []
    const existingIndex = records.findIndex(r => r.orderId === record.orderId)
    
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], ...record, updatedAt: new Date().toISOString() }
    } else {
      records.push({
        ...record,
        createdAt: new Date().toISOString()
      })
    }
    
    uni.setStorageSync('wx_payment_records', records)
    return true
  } catch (e) {
    console.error('[wxpay] savePaymentRecord failed:', e)
    return false
  }
}

/**
 * 获取支付记录
 * @param {string} orderId - 订单ID
 * @returns {Object|null}
 */
export const getPaymentRecord = (orderId) => {
  try {
    const records = uni.getStorageSync('wx_payment_records') || []
    return records.find(r => r.orderId === orderId) || null
  } catch (e) {
    return null
  }
}

/**
 * 获取用户所有支付记录
 * @param {number} limit - 限制数量
 * @returns {Array}
 */
export const getPaymentHistory = (limit = 20) => {
  try {
    const records = uni.getStorageSync('wx_payment_records') || []
    return records
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  } catch (e) {
    return []
  }
}

export default {
  generateOrderId,
  formatAmount,
  RECHARGE_PACKAGES,
  MEMBER_PACKAGES,
  PAYMENT_STATUS,
  PAYMENT_RESULT,
  validatePaymentResult,
  getOrderStatusText,
  getOrderStatusColor,
  calculatePaySign,
  generatePaymentParams,
  savePaymentRecord,
  getPaymentRecord,
  getPaymentHistory
}
