/**
 * Little Leaders Developer SDK - V42
 * 第三方开发者SDK - 支持OAuth 2.0认证
 * 
 * @version 1.0.0
 * @date 2026-05-19
 */

'use strict';

// ========== SDK 配置 ==========

const SDK_CONFIG = {
  version: '1.0.0',
  apiBaseUrl: 'https://api.littleleaders.com/v1',
  authUrl: 'https://auth.littleleaders.com/oauth',
  webhookUrl: 'https://api.littleleaders.com/webhooks',
  timeout: 30000,
  retryAttempts: 3
};

// ========== OAuth 2.0 认证 ==========

/**
 * OAuth 2.0 认证管理器
 */
class OAuthManager {
  constructor(config) {
    this.clientId = config.clientId || '';
    this.clientSecret = config.clientSecret || '';
    this.redirectUri = config.redirectUri || '';
    this.scopes = config.scopes || ['read', 'write'];
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
  }

  /**
   * 获取授权URL
   * @returns {string} 授权URL
   */
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(' ')
    });
    return `${SDK_CONFIG.authUrl}/authorize?${params.toString()}`;
  }

  /**
   * 使用授权码交换Token
   * @param {string} code - 授权码
   * @returns {Promise<Object>} Token信息
   */
  async exchangeCodeForToken(code) {
    const response = await fetch(`${SDK_CONFIG.authUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri
      })
    });
    
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`);
    }
    
    const data = await response.json();
    this._saveToken(data);
    return data;
  }

  /**
   * 刷新Access Token
   * @returns {Promise<Object>} 新Token信息
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${SDK_CONFIG.authUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret
      })
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    this._saveToken(data);
    return data;
  }

  /**
   * 保存Token到存储
   * @param {Object} data - Token数据
   */
  _saveToken(data) {
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token || this.refreshToken;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    // 持久化存储
    try {
      uni.setStorageSync('sdk_auth_token', JSON.stringify({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        tokenExpiry: this.tokenExpiry
      }));
    } catch (e) {
      console.warn('Token storage failed:', e);
    }
  }

  /**
   * 从存储恢复Token
   */
  restoreToken() {
    try {
      const saved = uni.getStorageSync('sdk_auth_token');
      if (saved) {
        const data = JSON.parse(saved);
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        this.tokenExpiry = data.tokenExpiry;
        return true;
      }
    } catch (e) {
      console.warn('Token restore failed:', e);
    }
    return false;
  }

  /**
   * 检查Token是否有效
   * @returns {boolean}
   */
  isTokenValid() {
    return this.accessToken && (!this.tokenExpiry || Date.now() < this.tokenExpiry);
  }

  /**
   * 获取授权Header
   * @returns {Object}
   */
  getAuthHeader() {
    return { 'Authorization': `Bearer ${this.accessToken}` };
  }
}

// ========== API 请求客户端 ==========

/**
 * API请求客户端
 */
class APIClient {
  constructor(oauthManager) {
    this.oauth = oauthManager;
    this.baseUrl = SDK_CONFIG.apiBaseUrl;
  }

  /**
   * 发起API请求
   * @param {string} method - HTTP方法
   * @param {string} endpoint - API端点
   * @param {Object} data - 请求数据
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>}
   */
  async request(method, endpoint, data = null, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-SDK-Version': SDK_CONFIG.version,
      ...this.oauth.getAuthHeader()
    };

    const config = {
      method,
      headers,
      timeout: options.timeout || SDK_CONFIG.timeout
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    let lastError;
    for (let attempt = 0; attempt < SDK_CONFIG.retryAttempts; attempt++) {
      try {
        const response = await this._fetch(url, config);
        return response;
      } catch (error) {
        lastError = error;
        
        // Token过期，尝试刷新
        if (error.status === 401 && this.oauth.refreshToken) {
          try {
            await this.oauth.refreshAccessToken();
            config.headers = { ...config.headers, ...this.oauth.getAuthHeader() };
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }
        
        // 非重试错误或已达重试次数
        if (!this._isRetryable(error) || attempt >= SDK_CONFIG.retryAttempts - 1) {
          throw error;
        }
      }
    }
    
    throw lastError;
  }

  /**
   * 执行fetch请求
   * @private
   */
  async _fetch(url, config) {
    // #ifdef H5
    const response = await fetch(url, config);
    // #endif
    
    // #ifndef H5
    // uni-app 环境使用uni.request
    return new Promise((resolve, reject) => {
      uni.request({
        url,
        method: config.method,
        header: config.headers,
        data: config.body ? JSON.parse(config.body) : null,
        timeout: config.timeout,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject({ status: res.statusCode, data: res.data });
          }
        },
        fail: reject
      });
    });
    // #endif
    
    // #ifdef H5
    if (!response.ok) {
      const error = { status: response.status };
      try {
        error.data = await response.json();
      } catch (e) {
        error.data = await response.text();
      }
      throw error;
    }
    return response.json();
    // #endif
  }

  /**
   * 判断错误是否可重试
   * @private
   */
  _isRetryable(error) {
    return error.status === 408 || error.status === 429 || error.status >= 500;
  }

  /**
   * GET请求
   * @param {string} endpoint
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request('GET', url);
  }

  /**
   * POST请求
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  /**
   * PUT请求
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }

  /**
   * DELETE请求
   * @param {string} endpoint
   * @returns {Promise<Object>}
   */
  delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
}

// ========== 任务 API ==========

/**
 * 任务管理API
 */
class TaskAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * 获取任务列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>}
   */
  async list(params = {}) {
    return this.client.get('/tasks', params);
  }

  /**
   * 获取单个任务
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>}
   */
  async get(taskId) {
    return this.client.get(`/tasks/${taskId}`);
  }

  /**
   * 创建任务
   * @param {Object} taskData - 任务数据
   * @returns {Promise<Object>}
   */
  async create(taskData) {
    return this.client.post('/tasks', taskData);
  }

  /**
   * 更新任务
   * @param {string} taskId - 任务ID
   * @param {Object} taskData - 更新数据
   * @returns {Promise<Object>}
   */
  async update(taskId, taskData) {
    return this.client.put(`/tasks/${taskId}`, taskData);
  }

  /**
   * 删除任务
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>}
   */
  async delete(taskId) {
    return this.client.delete(`/tasks/${taskId}`);
  }

  /**
   * 完成任务
   * @param {string} taskId - 任务ID
   * @param {Object} completionData - 完成数据（如打卡凭证）
   * @returns {Promise<Object>}
   */
  async complete(taskId, completionData = {}) {
    return this.client.post(`/tasks/${taskId}/complete`, completionData);
  }

  /**
   * 获取任务记录
   * @param {string} taskId - 任务ID
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>}
   */
  async getRecords(taskId, params = {}) {
    return this.client.get(`/tasks/${taskId}/records`, params);
  }
}

// ========== 积分 API ==========

/**
 * 积分管理API
 */
class PointsAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * 获取积分余额
   * @param {string} babyId - 宝宝ID（可选）
   * @returns {Promise<Object>}
   */
  async getBalance(babyId = null) {
    const endpoint = babyId ? `/points/balance/${babyId}` : '/points/balance';
    return this.client.get(endpoint);
  }

  /**
   * 获取积分变动记录
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>}
   */
  async getHistory(params = {}) {
    return this.client.get('/points/history', params);
  }

  /**
   * 赠送积分
   * @param {string} toUserId - 接收用户ID
   * @param {number} amount - 积分数量
   * @param {string} reason - 原因
   * @returns {Promise<Object>}
   */
  async transfer(toUserId, amount, reason = '') {
    return this.client.post('/points/transfer', {
      toUserId,
      amount,
      reason
    });
  }
}

// ========== 成就 API ==========

/**
 * 成就管理API
 */
class AchievementAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * 获取成就列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>}
   */
  async list(params = {}) {
    return this.client.get('/achievements', params);
  }

  /**
   * 获取已解锁成就
   * @param {string} babyId - 宝宝ID
   * @returns {Promise<Object>}
   */
  async getUnlocked(babyId) {
    return this.client.get(`/achievements/unlocked/${babyId}`);
  }

  /**
   * 获取成就详情
   * @param {string} achievementId - 成就ID
   * @returns {Promise<Object>}
   */
  async get(achievementId) {
    return this.client.get(`/achievements/${achievementId}`);
  }
}

// ========== 家庭 API ==========

/**
 * 家庭管理API
 */
class FamilyAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * 获取家庭信息
   * @param {string} familyId - 家庭ID
   * @returns {Promise<Object>}
   */
  async getInfo(familyId) {
    return this.client.get(`/families/${familyId}`);
  }

  /**
   * 获取家庭成员
   * @param {string} familyId - 家庭ID
   * @returns {Promise<Object>}
   */
  async getMembers(familyId) {
    return this.client.get(`/families/${familyId}/members`);
  }

  /**
   * 邀请成员
   * @param {string} familyId - 家庭ID
   * @param {Object} inviteData - 邀请数据
   * @returns {Promise<Object>}
   */
  async inviteMember(familyId, inviteData) {
    return this.client.post(`/families/${familyId}/invite`, inviteData);
  }

  /**
   * 获取家庭排行榜
   * @param {string} familyId - 家庭ID
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>}
   */
  async getLeaderboard(familyId, params = {}) {
    return this.client.get(`/families/${familyId}/leaderboard`, params);
  }
}

// ========== WebHook 管理 ==========

/**
 * WebHook事件类型
 */
export const WebHookEventType = {
  TASK_COMPLETED: 'task.completed',
  POINTS_CHANGED: 'points.changed',
  ACHIEVEMENT_UNLOCKED: 'achievement.unlocked',
  FAMILY_MEMBER_JOINED: 'family.member.joined',
  FAMILY_MEMBER_LEFT: 'family.member.left'
};

/**
 * WebHook管理器
 */
class WebHookManager {
  constructor(client) {
    this.client = client;
    this.listeners = new Map();
  }

  /**
   * 订阅WebHook事件
   * @param {string} eventType - 事件类型
   * @param {string} url - 回调URL
   * @param {string} secret - 签名密钥
   * @returns {Promise<Object>}
   */
  async subscribe(eventType, url, secret) {
    return this.client.post('/webhooks/subscribe', {
      eventType,
      url,
      secret
    });
  }

  /**
   * 取消订阅
   * @param {string} subscriptionId - 订阅ID
   * @returns {Promise<Object>}
   */
  async unsubscribe(subscriptionId) {
    return this.client.delete(`/webhooks/subscribe/${subscriptionId}`);
  }

  /**
   * 获取订阅列表
   * @returns {Promise<Object>}
   */
  async list() {
    return this.client.get('/webhooks/subscriptions');
  }

  /**
   * 本地监听事件（前端专用）
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  /**
   * 移除监听
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   */
  off(eventType, callback) {
    if (!this.listeners.has(eventType)) return;
    const callbacks = this.listeners.get(eventType);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * 触发事件（内部使用）
   * @param {string} eventType - 事件类型
   * @param {Object} data - 事件数据
   */
  _emit(eventType, data) {
    if (!this.listeners.has(eventType)) return;
    this.listeners.get(eventType).forEach(cb => cb(data));
  }
}

// ========== Plugin API ==========

/**
 * 插件API - 用于嵌入式插件
 */
class PluginAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * 获取插件配置
   * @param {string} pluginId - 插件ID
   * @returns {Promise<Object>}
   */
  async getConfig(pluginId) {
    return this.client.get(`/plugins/${pluginId}/config`);
  }

  /**
   * 保存插件数据
   * @param {string} pluginId - 插件ID
   * @param {Object} data - 插件数据
   * @returns {Promise<Object>}
   */
  async saveData(pluginId, data) {
    return this.client.put(`/plugins/${pluginId}/data`, data);
  }

  /**
   * 获取插件数据
   * @param {string} pluginId - 插件ID
   * @returns {Promise<Object>}
   */
  async getData(pluginId) {
    return this.client.get(`/plugins/${pluginId}/data`);
  }

  /**
   * 获取当前用户信息
   * @returns {Promise<Object>}
   */
  async getCurrentUser() {
    return this.client.get('/user/current');
  }

  /**
   * 获取当前宝宝的简要信息
   * @returns {Promise<Object>}
   */
  async getCurrentBaby() {
    return this.client.get('/baby/current');
  }

  /**
   * 写入任务数据
   * @param {Object} taskData - 任务数据
   * @returns {Promise<Object>}
   */
  async createTask(taskData) {
    return this.client.post('/tasks', taskData);
  }

  /**
   * 记录积分变动
   * @param {number} points - 积分变动
   * @param {string} reason - 原因
   * @returns {Promise<Object>}
   */
  async addPoints(points, reason) {
    return this.client.post('/points/add', { points, reason });
  }
}

// ========== 主 SDK 类 ==========

/**
 * Little Leaders SDK 主类
 */
export class LittleLeadersSDK {
  /**
   * 构造函数
   * @param {Object} config - SDK配置
   * @param {string} config.clientId - 客户端ID
   * @param {string} config.clientSecret - 客户端密钥
   * @param {string} config.redirectUri - 回调URI
   * @param {string[]} [config.scopes] - OAuth范围
   */
  constructor(config = {}) {
    this.config = { ...SDK_CONFIG, ...config };
    this.oauth = new OAuthManager(config);
    this.client = new APIClient(this.oauth);
    
    // 初始化API模块
    this.tasks = new TaskAPI(this.client);
    this.points = new PointsAPI(this.client);
    this.achievements = new AchievementAPI(this.client);
    this.family = new FamilyAPI(this.client);
    this.webhooks = new WebHookManager(this.client);
    this.plugins = new PluginAPI(this.client);
    
    // 恢复已保存的Token
    this.oauth.restoreToken();
  }

  /**
   * 初始化SDK（恢复会话）
   * @returns {boolean} 是否成功恢复
   */
  init() {
    return this.oauth.restoreToken();
  }

  /**
   * 检查是否已授权
   * @returns {boolean}
   */
  isAuthorized() {
    return this.oauth.isTokenValid();
  }

  /**
   * 获取授权URL
   * @returns {string}
   */
  getAuthUrl() {
    return this.oauth.getAuthorizationUrl();
  }

  /**
   * 处理OAuth回调
   * @param {string} code - 授权码
   * @returns {Promise<Object>}
   */
  async handleAuthCallback(code) {
    return this.oauth.exchangeCodeForToken(code);
  }

  /**
   * 静默登录（使用刷新Token）
   * @returns {Promise<boolean>}
   */
  async silentLogin() {
    if (this.oauth.refreshToken) {
      try {
        await this.oauth.refreshAccessToken();
        return true;
      } catch (e) {
        console.error('Silent login failed:', e);
      }
    }
    return false;
  }

  /**
   * 退出登录
   */
  logout() {
    this.oauth.accessToken = null;
    this.oauth.refreshToken = null;
    this.oauth.tokenExpiry = null;
    try {
      uni.removeStorageSync('sdk_auth_token');
    } catch (e) {
      console.warn('Token removal failed:', e);
    }
  }

  /**
   * 验证签名（用于验证WebHook请求）
   * @param {string} payload - 请求体
   * @param {string} signature - 签名
   * @param {string} secret - 密钥
   * @returns {boolean}
   */
  static verifySignature(payload, signature, secret) {
    // #ifdef H5
    const crypto = require('/src/utils/crypto');
    if (crypto && crypto.digest) {
      const expected = crypto.digest('sha256', secret + payload);
      return expected === signature;
    }
    // #endif
    return signature === secret + '_' + payload;
  }

  /**
   * 生成SDK版本信息
   * @returns {Object}
   */
  getVersionInfo() {
    return {
      version: SDK_CONFIG.version,
      apiVersion: 'v1',
      supportedEvents: Object.values(WebHookEventType)
    };
  }
}

// ========== SDK事件（前端本地监听） ==========

/**
 * SDK本地事件管理器
 */
export class SDKEvents {
  constructor() {
    this._listeners = {};
  }

  /**
   * 监听事件
   * @param {string} event - 事件名
   * @param {Function} callback - 回调
   */
  on(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
  }

  /**
   * 移除监听
   * @param {string} event - 事件名
   * @param {Function} callback - 回调
   */
  off(event, callback) {
    if (!this._listeners[event]) return;
    const idx = this._listeners[event].indexOf(callback);
    if (idx > -1) this._listeners[event].splice(idx, 1);
  }

  /**
   * 触发事件
   * @param {string} event - 事件名
   * @param {*} data - 数据
   */
  emit(event, data) {
    if (!this._listeners[event]) return;
    this._listeners[event].forEach(cb => cb(data));
  }
}

// 导出事件类型
export { WebHookEventType };

// 默认导出
export default LittleLeadersSDK;
