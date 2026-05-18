/**
 * Open API - 开放平台API封装
 * V42 Developer SDK + Plugin API
 * 
 * @version 1.0.0
 * @date 2026-05-19
 */

'use strict';

import { LittleLeadersSDK, WebHookEventType, SDKEvents } from '../sdk/littleLeadersSDK.js';

// ========== SDK 初始化配置 ==========

const OPEN_API_CONFIG = {
  // 生产环境
  production: {
    apiBaseUrl: 'https://api.littleleaders.com/v1',
    authUrl: 'https://auth.littleleaders.com/oauth',
    wsUrl: 'wss://api.littleleaders.com/ws'
  },
  // 开发环境
  development: {
    apiBaseUrl: 'https://dev-api.littleleaders.com/v1',
    authUrl: 'https://dev-auth.littleleaders.com/oauth',
    wsUrl: 'wss://dev-api.littleleaders.com/ws'
  },
  // 测试环境
  test: {
    apiBaseUrl: 'https://test-api.littleleaders.com/v1',
    authUrl: 'https://test-auth.littleleaders.com/oauth',
    wsUrl: 'wss://test-api.littleleaders.com/ws'
  }
};

// 获取当前环境配置
function getEnvConfig() {
  // #ifdef H5
  const host = window.location.hostname;
  if (host.includes('dev-')) return OPEN_API_CONFIG.development;
  if (host.includes('test-')) return OPEN_API_CONFIG.test;
  // #endif
  return OPEN_API_CONFIG.production;
}

// ========== 认证信息存储 ==========

const AUTH_STORAGE_KEY = 'open_platform_auth';
const PLUGIN_STORAGE_KEY = 'open_platform_plugin_data';

/**
 * 认证信息管理
 */
class AuthManager {
  constructor() {
    this.sdk = null;
    this.initialized = false;
  }

  /**
   * 初始化SDK
   * @param {Object} config - 配置
   */
  init(config) {
    const envConfig = getEnvConfig();
    const sdkConfig = {
      ...config,
      apiBaseUrl: config?.apiBaseUrl || envConfig.apiBaseUrl,
      authUrl: config?.authUrl || envConfig.authUrl
    };
    
    this.sdk = new LittleLeadersSDK(sdkConfig);
    this.initialized = true;
    return this.sdk;
  }

  /**
   * 检查是否已授权
   */
  isAuthorized() {
    return this.sdk?.isAuthorized() || false;
  }

  /**
   * 获取授权URL
   */
  getAuthUrl() {
    return this.sdk?.getAuthUrl() || '';
  }

  /**
   * 处理授权回调
   */
  async handleCallback(code) {
    return this.sdk?.handleAuthCallback(code);
  }

  /**
   * 静默登录
   */
  async silentLogin() {
    return this.sdk?.silentLogin() || false;
  }

  /**
   * 退出登录
   */
  logout() {
    this.sdk?.logout();
  }

  /**
   * 获取SDK实例
   */
  getSDK() {
    return this.sdk;
  }
}

// 单例
const authManager = new AuthManager();

// ========== 插件数据存储 ==========

/**
 * 插件本地数据管理
 */
class PluginDataStore {
  constructor() {
    this.namespace = 'default';
  }

  /**
   * 设置命名空间
   * @param {string} ns
   */
  setNamespace(ns) {
    this.namespace = ns;
  }

  /**
   * 保存数据
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    const fullKey = `${PLUGIN_STORAGE_KEY}_${this.namespace}_${key}`;
    try {
      uni.setStorageSync(fullKey, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Plugin data save failed:', e);
      return false;
    }
  }

  /**
   * 获取数据
   * @param {string} key
   * @param {*} defaultValue
   */
  get(key, defaultValue = null) {
    const fullKey = `${PLUGIN_STORAGE_KEY}_${this.namespace}_${key}`;
    try {
      const data = uni.getStorageSync(fullKey);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error('Plugin data read failed:', e);
      return defaultValue;
    }
  }

  /**
   * 删除数据
   * @param {string} key
   */
  remove(key) {
    const fullKey = `${PLUGIN_STORAGE_KEY}_${this.namespace}_${key}`;
    try {
      uni.removeStorageSync(fullKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * 清空命名空间下所有数据
   */
  clear() {
    try {
      const info = uni.getStorageInfoSync();
      const keys = info.keys || [];
      const prefix = `${PLUGIN_STORAGE_KEY}_${this.namespace}_`;
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          uni.removeStorageSync(key);
        }
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}

// ========== WebHook 事件处理 ==========

/**
 * WebHook事件处理器
 */
class WebHookHandler {
  constructor() {
    this.subscriptions = new Map();
    this.sdkEvents = new SDKEvents();
  }

  /**
   * 订阅事件
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   */
  subscribe(eventType, callback) {
    this.sdkEvents.on(eventType, callback);
  }

  /**
   * 取消订阅
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   */
  unsubscribe(eventType, callback) {
    this.sdkEvents.off(eventType, callback);
  }

  /**
   * 处理收到的WebHook事件
   * @param {Object} event - 事件对象
   */
  handleEvent(event) {
    const { type, data } = event;
    this.sdkEvents.emit(type, data);
    
    // 触发全局事件
    this.sdkEvents.emit('*', event);
  }

  /**
   * 注册远程WebHook订阅
   * @param {string} eventType - 事件类型
   * @param {string} url - 回调URL
   * @param {string} secret - 签名密钥
   */
  async registerRemote(eventType, url, secret) {
    const sdk = authManager.getSDK();
    if (sdk?.webhooks) {
      return sdk.webhooks.subscribe(eventType, url, secret);
    }
    return { success: false, message: 'SDK not initialized' };
  }

  /**
   * 获取已订阅的事件列表
   */
  async getSubscriptions() {
    const sdk = authManager.getSDK();
    if (sdk?.webhooks) {
      return sdk.webhooks.list();
    }
    return [];
  }
}

// 单例
const webHookHandler = new WebHookHandler();

// ========== 权限检查 ==========

/**
 * 权限定义
 */
export const Permission = {
  READ_TASKS: 'read_tasks',
  WRITE_TASKS: 'write_tasks',
  READ_POINTS: 'read_points',
  WRITE_POINTS: 'write_points',
  READ_ACHIEVEMENTS: 'read_achievements',
  READ_FAMILY: 'read_family',
  WRITE_FAMILY: 'write_family'
};

/**
 * 权限检查器
 */
class PermissionChecker {
  constructor() {
    this.grantedPermissions = new Set();
  }

  /**
   * 请求权限
   * @param {string[]} permissions - 权限列表
   * @returns {Promise<boolean>}
   */
  async request(permissions) {
    // 在实际实现中，这里会调用SDK的权限请求
    // 目前模拟实现
    permissions.forEach(p => this.grantedPermissions.add(p));
    return true;
  }

  /**
   * 检查是否有权限
   * @param {string} permission - 权限
   * @returns {boolean}
   */
  has(permission) {
    return this.grantedPermissions.has(permission);
  }

  /**
   * 检查是否有所有指定权限
   * @param {string[]} permissions
   * @returns {boolean}
   */
  hasAll(permissions) {
    return permissions.every(p => this.grantedPermissions.has(p));
  }

  /**
   * 清除权限
   */
  clear() {
    this.grantedPermissions.clear();
  }
}

const permissionChecker = new PermissionChecker();

// ========== 开放数据标准 ==========

/**
 * 开放数据格式标准
 */
export const OpenDataStandard = {
  // 任务数据格式
  Task: {
    id: 'string',
    title: 'string',
    description: 'string',
    category: 'string', // study|exercise|habit
    rewardPoints: 'number',
    status: 'string', // pending|completed|failed
    dueTime: 'string', // ISO8601
    completedAt: 'string', // ISO8601
    babyId: 'string',
    familyId: 'string'
  },

  // 积分变动格式
  PointsChange: {
    id: 'string',
    amount: 'number', // 正数增加，负数减少
    balance: 'number',
    reason: 'string',
    type: 'string', // reward|purchase|transfer|adjustment
    taskId: 'string|null',
    createdAt: 'string' // ISO8601
  },

  // 成就格式
  Achievement: {
    id: 'string',
    name: 'string',
    description: 'string',
    icon: 'string',
    category: 'string',
    unlockedAt: 'string|null', // ISO8601
    babyId: 'string'
  },

  // 家庭成员格式
  FamilyMember: {
    id: 'string',
    name: 'string',
    role: 'string', // parent|child
    avatar: 'string',
    points: 'number',
    joinedAt: 'string' // ISO8601
  },

  // WebHook事件格式
  WebHookEvent: {
    id: 'string',
    type: 'string', // task.completed|points.changed|achievement.unlocked
    timestamp: 'string', // ISO8601
    data: 'object'
  }
};

// ========== 数据导出 ==========

/**
 * 导出数据为标准格式
 * @param {string} type - 数据类型
 * @param {*} data - 原始数据
 * @returns {Object}
 */
function exportToStandardFormat(type, data) {
  const standard = OpenDataStandard[type];
  if (!standard) {
    throw new Error(`Unknown data type: ${type}`);
  }

  const result = {};
  Object.keys(standard).forEach(key => {
    if (data[key] !== undefined) {
      result[key] = data[key];
    }
  });
  
  return {
    format: 'littleleaders-open-v1',
    type,
    data: result,
    exportedAt: new Date().toISOString()
  };
}

// ========== API 导出 ==========

/**
 * Open Platform API 主类
 */
export class OpenAPI {
  constructor() {
    this.auth = authManager;
    this.plugins = new PluginDataStore();
    this.webhooks = webHookHandler;
    this.permissions = permissionChecker;
  }

  /**
   * 初始化开放平台
   * @param {Object} config - 配置
   */
  init(config) {
    this.auth.init(config);
  }

  /**
   * 检查授权状态
   */
  isAuthorized() {
    return this.auth.isAuthorized();
  }

  /**
   * 获取授权URL
   */
  getAuthUrl() {
    return this.auth.getAuthUrl();
  }

  /**
   * 处理OAuth回调
   * @param {string} code
   */
  async handleAuthCallback(code) {
    return this.auth.handleCallback(code);
  }

  /**
   * 静默登录
   */
  async silentLogin() {
    return this.auth.silentLogin();
  }

  /**
   * 退出登录
   */
  logout() {
    this.auth.logout();
  }

  /**
   * 获取任务API
   */
  get tasks() {
    return this.auth.sdk?.tasks;
  }

  /**
   * 获取积分API
   */
  get points() {
    return this.auth.sdk?.points;
  }

  /**
   * 获取成就API
   */
  get achievements() {
    return this.auth.sdk?.achievements;
  }

  /**
   * 获取家庭API
   */
  get family() {
    return this.auth.sdk?.family;
  }

  /**
   * 获取插件API
   */
  get plugins() {
    return this.auth.sdk?.plugins;
  }

  /**
   * 订阅WebHook事件
   * @param {string} eventType
   * @param {Function} callback
   */
  onWebHook(eventType, callback) {
    this.webhooks.subscribe(eventType, callback);
  }

  /**
   * 取消WebHook订阅
   * @param {string} eventType
   * @param {Function} callback
   */
  offWebHook(eventType, callback) {
    this.webhooks.unsubscribe(eventType, callback);
  }

  /**
   * 导出数据为标准格式
   * @param {string} type - 数据类型
   * @param {*} data - 数据
   */
  exportData(type, data) {
    return exportToStandardFormat(type, data);
  }

  /**
   * 获取SDK版本信息
   */
  getVersionInfo() {
    return this.auth.sdk?.getVersionInfo() || {};
  }
}

// 单例
const openAPI = new OpenAPI();

// ========== 嵌入式插件API ==========

/**
 * 嵌入式插件上下文
 */
export class PluginContext {
  constructor(pluginId) {
    this.pluginId = pluginId;
    this.pluginData = new PluginDataStore();
    this.pluginData.setNamespace(pluginId);
  }

  /**
   * 获取插件配置
   */
  async getConfig() {
    const sdk = authManager.getSDK();
    return sdk?.plugins?.getConfig(this.pluginId);
  }

  /**
   * 保存插件数据
   * @param {Object} data
   */
  async saveData(data) {
    const sdk = authManager.getSDK();
    if (sdk?.plugins) {
      return sdk.plugins.saveData(this.pluginId, data);
    }
    // 本地存储
    return this.pluginData.set('data', data);
  }

  /**
   * 获取插件数据
   */
  async getData() {
    const sdk = authManager.getSDK();
    if (sdk?.plugins) {
      return sdk.plugins.getData(this.pluginId);
    }
    return this.pluginData.get('data', {});
  }

  /**
   * 获取当前用户
   */
  async getCurrentUser() {
    const sdk = authManager.getSDK();
    return sdk?.plugins?.getCurrentUser();
  }

  /**
   * 获取当前宝宝
   */
  async getCurrentBaby() {
    const sdk = authManager.getSDK();
    return sdk?.plugins?.getCurrentBaby();
  }

  /**
   * 创建任务
   * @param {Object} taskData
   */
  async createTask(taskData) {
    const sdk = authManager.getSDK();
    return sdk?.plugins?.createTask(taskData);
  }

  /**
   * 添加积分
   * @param {number} points
   * @param {string} reason
   */
  async addPoints(points, reason) {
    const sdk = authManager.getSDK();
    return sdk?.plugins?.addPoints(points, reason);
  }

  /**
   * 发送WebHook事件
   * @param {string} eventType
   * @param {Object} data
   */
  emitEvent(eventType, data) {
    webHookHandler.handleEvent({
      id: `plugin_${Date.now()}`,
      type: eventType,
      timestamp: new Date().toISOString(),
      data: { ...data, pluginId: this.pluginId }
    });
  }
}

// ========== 导出 ==========

export {
  OpenAPI,
  PluginContext,
  OpenDataStandard,
  Permission,
  WebHookEventType,
  authManager,
  webHookHandler,
  permissionChecker,
  OPEN_API_CONFIG,
  exportToStandardFormat
};

export default openAPI;
