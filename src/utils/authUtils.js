/**
 * 认证工具函数
 * 提供统一的认证接口，方便在应用各处复用认证逻辑
 */

/**
 * 检查认证模式是否开启
 * @returns {Boolean} 是否开启认证模式
 */
export function isAuthModeEnabled() {
  try {
    const authSettings = uni.getStorageSync('authSettings');
    if (authSettings) {
      const settings = JSON.parse(authSettings);
      return settings.isEnabled;
    }
    return false;
  } catch (e) {
    console.error('检查认证设置失败:', e);
    return false;
  }
}

/**
 * 获取认证设置
 * @returns {Object|null} 认证设置对象或null
 */
export function getAuthSettings() {
  try {
    const authSettings = uni.getStorageSync('authSettings');
    if (authSettings) {
      return JSON.parse(authSettings);
    }
    return null;
  } catch (e) {
    console.error('获取认证设置失败:', e);
    return null;
  }
}

/**
 * 保存认证设置
 * @param {Object} settings 认证设置对象
 * @returns {Boolean} 是否保存成功
 */
export function saveAuthSettings(settings) {
  try {
    uni.setStorageSync('authSettings', JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('保存认证设置失败:', e);
    return false;
  }
}

/**
 * 验证用户身份
 * @param {Function} successCallback 验证成功后的回调函数
 * @param {Function} failCallback 验证失败的回调函数
 * @returns {Boolean} 是否需要验证
 */
export function verifyAuth(successCallback, failCallback = null) {
  try {
    // 检查是否开启认证模式
    if (!isAuthModeEnabled()) {
      // 如果未开启认证模式，直接调用成功回调
      successCallback();
      return false;
    }
    
    // 获取认证设置
    const authSettings = getAuthSettings();
    if (!authSettings) {
      if (failCallback) failCallback(new Error('获取认证设置失败'));
      return false;
    }
    
    // 获取可用的认证方式
    const availableMethods = [];
    if (authSettings.hasPassword) availableMethods.push('密码验证');
    if (authSettings.hasBiometric) availableMethods.push('指纹验证');
    if (authSettings.hasFaceId) availableMethods.push('人脸识别');
    
    if (availableMethods.length === 0) {
      uni.showToast({ title: '未设置认证方式', icon: 'none' });
      if (failCallback) failCallback(new Error('未设置认证方式'));
      return false;
    }
    
    // 显示认证方式选择
    uni.showActionSheet({
      itemList: availableMethods,
      success: (res) => {
        const method = availableMethods[res.tapIndex];
        
        if (method === '密码验证') {
          passwordAuth(successCallback, failCallback);
        } else if (method === '指纹验证') {
          biometricAuth(successCallback, failCallback);
        } else if (method === '人脸识别') {
          faceIdAuth(successCallback, failCallback);
        }
      },
      fail: () => {
        // 用户取消选择
        if (failCallback) failCallback(new Error('用户取消验证'));
      }
    });
    
    return true;
  } catch (e) {
    console.error('验证用户身份失败:', e);
    if (failCallback) failCallback(e);
    return false;
  }
}

/**
 * 密码验证
 * @param {Function} successCallback 验证成功后的回调函数
 * @param {Function} failCallback 验证失败的回调函数
 */
function passwordAuth(successCallback, failCallback = null) {
  try {
    // 显示加载提示
    uni.showLoading({
      title: '验证中...',
      mask: true
    });
    
    // 使用setTimeout确保加载提示显示出来
    setTimeout(() => {
      uni.hideLoading();
      
      uni.showModal({
        title: '请输入密码',
        content: '',            // 不设置初始内容
        editable: true,         // 允许编辑输入内容
        placeholderText: '请输入密码',
        password: true,         // 设置为密码输入，会显示为掩码
        success: (res) => {
          if (res.confirm) {
            const storedPassword = uni.getStorageSync('authPassword');
            if (res.content === storedPassword) {
              successCallback();
            } else {
              uni.showToast({ 
                title: '密码错误', 
                icon: 'none',
                duration: 2000
              });
              if (failCallback) failCallback(new Error('密码错误'));
            }
          } else {
            // 用户点击取消
            if (failCallback) failCallback(new Error('用户取消验证'));
          }
        },
        fail: (err) => {
          console.error('密码验证弹窗失败:', err);
          if (failCallback) failCallback(err);
        }
      });
    }, 200);
  } catch (e) {
    uni.hideLoading();
    console.error('密码验证失败:', e);
    if (failCallback) failCallback(e);
  }
}

/**
 * 指纹验证
 * @param {Function} successCallback 验证成功后的回调函数
 * @param {Function} failCallback 验证失败的回调函数
 */
function biometricAuth(successCallback, failCallback = null) {
  // #ifdef MP-WEIXIN
  uni.startSoterAuthentication({
    requestAuthModes: ['fingerPrint'],
    challenge: 'challenge',
    authContent: '请验证指纹',
    success: () => {
      successCallback();
    },
    fail: (err) => {
      console.error('指纹验证失败:', err);
      uni.showToast({ title: '指纹验证失败', icon: 'none' });
      if (failCallback) failCallback(err);
      
      // 验证失败后询问是否尝试其他方式
      tryOtherAuthMethod(successCallback, failCallback);
    }
  });
  // #endif
  
  // #ifndef MP-WEIXIN
  uni.showToast({ title: '当前环境不支持指纹验证', icon: 'none' });
  if (failCallback) failCallback(new Error('当前环境不支持指纹验证'));
  // #endif
}

/**
 * 人脸识别
 * @param {Function} successCallback 验证成功后的回调函数
 * @param {Function} failCallback 验证失败的回调函数
 */
function faceIdAuth(successCallback, failCallback = null) {
  // #ifdef MP-WEIXIN
  uni.startSoterAuthentication({
    requestAuthModes: ['facial'],
    challenge: 'challenge',
    authContent: '请进行人脸识别',
    success: () => {
      successCallback();
    },
    fail: (err) => {
      console.error('人脸识别失败:', err);
      uni.showToast({ title: '人脸识别失败', icon: 'none' });
      if (failCallback) failCallback(err);
      
      // 验证失败后询问是否尝试其他方式
      tryOtherAuthMethod(successCallback, failCallback);
    }
  });
  // #endif
  
  // #ifndef MP-WEIXIN
  uni.showToast({ title: '当前环境不支持人脸识别', icon: 'none' });
  if (failCallback) failCallback(new Error('当前环境不支持人脸识别'));
  // #endif
}

/**
 * 验证失败后尝试其他认证方式
 * @param {Function} successCallback 验证成功后的回调函数
 * @param {Function} failCallback 验证失败的回调函数
 */
function tryOtherAuthMethod(successCallback, failCallback = null) {
  const authSettings = getAuthSettings();
  if (!authSettings) return;
  
  // 检查是否有密码验证方式
  if (authSettings.hasPassword) {
    uni.showModal({
      title: '验证失败',
      content: '是否使用密码验证？',
      success: (res) => {
        if (res.confirm) {
          passwordAuth(successCallback, failCallback);
        } else {
          if (failCallback) failCallback(new Error('用户取消验证'));
        }
      }
    });
  } else {
    if (failCallback) failCallback(new Error('验证失败，无其他可用验证方式'));
  }
} 