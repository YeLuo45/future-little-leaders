import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 认证信息管理Store
 * 管理应用的认证设置、密码校验等功能
 */
export const useAuthStore = defineStore('auth', () => {
  // 状态
  const authSettings = ref({
    isEnabled: false,
    hasPassword: false,
    hasBiometric: false,
    hasFaceId: false
  })
  
  // 计算属性
  const hasAnyAuthMethod = computed(() => {
    return authSettings.value.hasPassword || 
           authSettings.value.hasBiometric || 
           authSettings.value.hasFaceId
  })
  
  // 加载认证设置
  const loadAuthSettings = () => {
    try {
      const settings = uni.getStorageSync('authSettings')
      if (settings) {
        authSettings.value = JSON.parse(settings)
      }
    } catch (e) {
      console.error('加载认证设置失败:', e)
    }
  }
  
  // 保存认证设置
  const saveAuthSettings = () => {
    try {
      uni.setStorageSync('authSettings', JSON.stringify(authSettings.value))
      return true
    } catch (e) {
      console.error('保存认证设置失败:', e)
      return false
    }
  }
  
  // 检查认证模式是否开启
  const isAuthModeEnabled = () => {
    return authSettings.value.isEnabled
  }
  
  // 验证用户身份
  const verifyAuth = (successCallback, failCallback = null) => {
    try {
      // 检查是否开启认证模式
      if (!isAuthModeEnabled()) {
        // 如果未开启认证模式，直接调用成功回调
        successCallback()
        return false
      }
      
      // 获取可用的认证方式
      const availableMethods = []
      if (authSettings.value.hasPassword) availableMethods.push('密码验证')
      if (authSettings.value.hasBiometric) availableMethods.push('指纹验证')
      if (authSettings.value.hasFaceId) availableMethods.push('人脸识别')
      
      if (availableMethods.length === 0) {
        uni.showToast({ title: '未设置认证方式', icon: 'none' })
        if (failCallback) failCallback(new Error('未设置认证方式'))
        return false
      }
      
      // 显示认证方式选择
      uni.showActionSheet({
        itemList: availableMethods,
        success: (res) => {
          const method = availableMethods[res.tapIndex]
          
          if (method === '密码验证') {
            passwordAuth(successCallback, failCallback)
          } else if (method === '指纹验证') {
            biometricAuth(successCallback, failCallback)
          } else if (method === '人脸识别') {
            faceIdAuth(successCallback, failCallback)
          }
        },
        fail: () => {
          // 用户取消选择
          if (failCallback) failCallback(new Error('用户取消验证'))
        }
      })
      
      return true
    } catch (e) {
      console.error('验证用户身份失败:', e)
      if (failCallback) failCallback(e)
      return false
    }
  }
  
  // 密码验证
  const passwordAuth = (successCallback, failCallback = null) => {
    try {
      // 显示加载提示
      uni.showLoading({
        title: '验证中...',
        mask: true
      })
      
      // 使用setTimeout确保加载提示显示出来
      setTimeout(() => {
        uni.hideLoading()
        
        uni.showModal({
          title: '请输入密码',
          content: '',            // 不设置初始内容
          editable: true,         // 允许编辑输入内容
          placeholderText: '请输入密码',
          password: true,         // 设置为密码输入，会显示为掩码
          success: (res) => {
            if (res.confirm) {
              const storedPassword = uni.getStorageSync('authPassword')
              if (res.content === storedPassword) {
                successCallback()
              } else {
                uni.showToast({ 
                  title: '密码错误', 
                  icon: 'none',
                  duration: 2000
                })
                if (failCallback) failCallback(new Error('密码错误'))
              }
            } else {
              // 用户点击取消
              if (failCallback) failCallback(new Error('用户取消验证'))
            }
          },
          fail: (err) => {
            console.error('密码验证弹窗失败:', err)
            if (failCallback) failCallback(err)
          }
        })
      }, 200)
    } catch (e) {
      uni.hideLoading()
      console.error('密码验证失败:', e)
      if (failCallback) failCallback(e)
    }
  }
  
  // 指纹验证
  const biometricAuth = (successCallback, failCallback = null) => {
    // #ifdef MP-WEIXIN
    uni.startSoterAuthentication({
      requestAuthModes: ['fingerPrint'],
      challenge: 'challenge',
      authContent: '请验证指纹',
      success: () => {
        successCallback()
      },
      fail: (err) => {
        console.error('指纹验证失败:', err)
        uni.showToast({ title: '指纹验证失败', icon: 'none' })
        if (failCallback) failCallback(err)
        
        // 验证失败后询问是否尝试其他方式
        tryOtherAuthMethod(successCallback, failCallback)
      }
    })
    // #endif
    
    // #ifndef MP-WEIXIN
    uni.showToast({ title: '当前环境不支持指纹验证', icon: 'none' })
    if (failCallback) failCallback(new Error('当前环境不支持指纹验证'))
    // #endif
  }
  
  // 人脸识别
  const faceIdAuth = (successCallback, failCallback = null) => {
    // #ifdef MP-WEIXIN
    uni.startSoterAuthentication({
      requestAuthModes: ['facial'],
      challenge: 'challenge',
      authContent: '请进行人脸识别',
      success: () => {
        successCallback()
      },
      fail: (err) => {
        console.error('人脸识别失败:', err)
        uni.showToast({ title: '人脸识别失败', icon: 'none' })
        if (failCallback) failCallback(err)
        
        // 验证失败后询问是否尝试其他方式
        tryOtherAuthMethod(successCallback, failCallback)
      }
    })
    // #endif
    
    // #ifndef MP-WEIXIN
    uni.showToast({ title: '当前环境不支持人脸识别', icon: 'none' })
    if (failCallback) failCallback(new Error('当前环境不支持人脸识别'))
    // #endif
  }
  
  // 验证失败后尝试其他认证方式
  const tryOtherAuthMethod = (successCallback, failCallback = null) => {
    if (!authSettings.value.hasPassword) return
    
    // 检查是否有密码验证方式
    if (authSettings.value.hasPassword) {
      uni.showModal({
        title: '验证失败',
        content: '是否使用密码验证？',
        success: (res) => {
          if (res.confirm) {
            passwordAuth(successCallback, failCallback)
          } else {
            if (failCallback) failCallback(new Error('用户取消验证'))
          }
        }
      })
    } else {
      if (failCallback) failCallback(new Error('验证失败，无其他可用验证方式'))
    }
  }
  
  // 设置密码
  const setPassword = (password) => {
    try {
      uni.setStorageSync('authPassword', password)
      authSettings.value.hasPassword = true
      saveAuthSettings()
      return true
    } catch (e) {
      console.error('设置密码失败:', e)
      return false
    }
  }
  
  // 验证密码
  const validatePassword = (oldPassword, newPassword, confirmPassword) => {
    // 检查原密码是否正确
    if (authSettings.value.hasPassword) {
      const storedPassword = uni.getStorageSync('authPassword')
      if (oldPassword !== storedPassword) {
        uni.showToast({
          title: '原密码错误',
          icon: 'none'
        })
        return false
      }
    }
    
    // 检查新密码
    if (!newPassword) {
      uni.showToast({
        title: '请输入新密码',
        icon: 'none'
      })
      return false
    }
    
    // 检查密码长度
    if (newPassword.length < 6 || newPassword.length > 40) {
      uni.showToast({
        title: '密码长度需要6-40个字符',
        icon: 'none'
      })
      return false
    }
    
    // 检查密码确认
    if (newPassword !== confirmPassword) {
      uni.showToast({
        title: '两次密码输入不一致',
        icon: 'none'
      })
      return false
    }
    
    return true
  }
  
  // 初始化Store
  const init = () => {
    loadAuthSettings()
  }
  
  return {
    // 状态
    authSettings,
    
    // 计算属性
    hasAnyAuthMethod,
    
    // 方法
    loadAuthSettings,
    saveAuthSettings,
    isAuthModeEnabled,
    verifyAuth,
    setPassword,
    validatePassword,
    init
  }
}) 