/**
 * Plugin Manager Service - V33 Plugin Marketplace + Theme System
 * 插件管理服务 - 处理插件的安装、卸载、启用、禁用等功能
 */

// 插件类型枚举
export const PluginType = {
  FEATURE: 'feature',     // 功能插件
  THEME: 'theme',          // 主题插件
  WIDGET: 'widget',        // 小部件插件
  INTEGRATION: 'integration' // 集成插件
};

// 插件状态枚举
export const PluginStatus = {
  INSTALLED: 'installed',   // 已安装
  ENABLED: 'enabled',        // 已启用
  DISABLED: 'disabled',      // 已禁用
  UPDATE_AVAILABLE: 'update_available' // 有可用更新
};

// 内置功能插件定义
const BUILT_IN_PLUGINS = {
  'math-game': {
    id: 'math-game',
    name: '数学游戏',
    description: '有趣的数学练习游戏',
    version: '1.0.0',
    author: 'Future Little Leaders',
    type: PluginType.FEATURE,
    icon: '/static/plugins/math-game.png',
    screenshots: ['/static/plugins/math-game-1.png'],
    size: '2.5MB',
    downloads: 12580,
    rating: 4.8,
    reviewCount: 342,
    builtIn: true,
    bundle: null // 内置插件不需要远程加载
  },
  'drawing-board': {
    id: 'drawing-board',
    name: '绘画板',
    description: '培养创造力的绘画工具',
    version: '1.0.0',
    author: 'Future Little Leaders',
    type: PluginType.FEATURE,
    icon: '/static/plugins/drawing-board.png',
    screenshots: ['/static/plugins/drawing-board-1.png'],
    size: '3.2MB',
    downloads: 9830,
    rating: 4.9,
    reviewCount: 256,
    builtIn: true,
    bundle: null
  },
  'music-player': {
    id: 'music-player',
    name: '音乐播放器',
    description: '播放摇篮曲和儿童音乐',
    version: '1.0.0',
    author: 'Future Little Leaders',
    type: PluginType.FEATURE,
    icon: '/static/plugins/music-player.png',
    screenshots: ['/static/plugins/music-player-1.png'],
    size: '1.8MB',
    downloads: 7650,
    rating: 4.7,
    reviewCount: 189,
    builtIn: true,
    bundle: null
  },
  'reading-record': {
    id: 'reading-record',
    name: '阅读记录',
    description: '记录孩子阅读成长的工具',
    version: '1.0.0',
    author: 'Future Little Leaders',
    type: PluginType.FEATURE,
    icon: '/static/plugins/reading-record.png',
    screenshots: ['/static/plugins/reading-record-1.png'],
    size: '1.5MB',
    downloads: 6540,
    rating: 4.6,
    reviewCount: 134,
    builtIn: true,
    bundle: null
  }
};

// 插件状态存储
let pluginState = {
  installedPlugins: {},    // 已安装插件列表
  enabledPlugins: [],       // 已启用插件ID列表
  pluginSettings: {}       // 插件设置
};

// 插件加载回调
const pluginLoadCallbacks = {};

/**
 * 初始化插件管理器
 */
export function initPluginManager() {
  // 从本地存储加载插件状态
  const savedInstalled = uni.getStorageSync('installedPlugins');
  if (savedInstalled) {
    try {
      pluginState.installedPlugins = JSON.parse(savedInstalled);
    } catch (e) {
      pluginState.installedPlugins = {};
    }
  }
  
  const savedEnabled = uni.getStorageSync('enabledPlugins');
  if (savedEnabled) {
    try {
      pluginState.enabledPlugins = JSON.parse(savedEnabled);
    } catch (e) {
      pluginState.enabledPlugins = [];
    }
  }
  
  const savedSettings = uni.getStorageSync('pluginSettings');
  if (savedSettings) {
    try {
      pluginState.pluginSettings = JSON.parse(savedSettings);
    } catch (e) {
      pluginState.pluginSettings = {};
    }
  }
  
  console.log('插件管理器已初始化');
}

/**
 * 获取所有可用插件（内置 + 已安装）
 */
export function getAllPlugins() {
  return {
    ...BUILT_IN_PLUGINS,
    ...pluginState.installedPlugins
  };
}

/**
 * 获取已安装插件列表
 */
export function getInstalledPlugins() {
  const installed = { ...BUILT_IN_PLUGINS };
  Object.keys(pluginState.installedPlugins).forEach(id => {
    installed[id] = pluginState.installedPlugins[id];
  });
  return installed;
}

/**
 * 获取已启用插件ID列表
 */
export function getEnabledPluginIds() {
  return pluginState.enabledPlugins;
}

/**
 * 检查插件是否已安装
 * @param {String} pluginId - 插件ID
 */
export function isPluginInstalled(pluginId) {
  return !!(BUILT_IN_PLUGINS[pluginId] || pluginState.installedPlugins[pluginId]);
}

/**
 * 检查插件是否已启用
 * @param {String} pluginId - 插件ID
 */
export function isPluginEnabled(pluginId) {
  return pluginState.enabledPlugins.includes(pluginId);
}

/**
 * 安装插件
 * @param {Object} pluginData - 插件数据
 * @param {Function} onProgress - 进度回调
 */
export async function installPlugin(pluginData, onProgress) {
  const { id, name, bundle } = pluginData;
  
  if (isPluginInstalled(id)) {
    console.log(`插件 ${name} 已安装`);
    return { success: false, message: '插件已安装' };
  }
  
  try {
    // 模拟下载进度
    if (onProgress) onProgress(0);
    
    // 如果有远程 bundle，进行加载
    if (bundle) {
      if (onProgress) onProgress(30);
      // 动态加载插件 bundle
      await loadPluginBundle(id, bundle);
    }
    
    if (onProgress) onProgress(80);
    
    // 保存插件数据
    pluginState.installedPlugins[id] = {
      ...pluginData,
      installedAt: Date.now(),
      status: PluginStatus.INSTALLED
    };
    
    // 默认启用
    if (!pluginState.enabledPlugins.includes(id)) {
      pluginState.enabledPlugins.push(id);
    }
    
    savePluginState();
    
    if (onProgress) onProgress(100);
    
    console.log(`插件 ${name} 安装成功`);
    return { success: true, message: '安装成功' };
  } catch (error) {
    console.error(`插件 ${name} 安装失败:`, error);
    return { success: false, message: error.message };
  }
}

/**
 * 卸载插件
 * @param {String} pluginId - 插件ID
 */
export function uninstallPlugin(pluginId) {
  // 不能卸载内置插件
  if (BUILT_IN_PLUGINS[pluginId]) {
    return { success: false, message: '不能卸载内置插件' };
  }
  
  if (!pluginState.installedPlugins[pluginId]) {
    return { success: false, message: '插件未安装' };
  }
  
  const pluginName = pluginState.installedPlugins[pluginId].name;
  
  // 移除插件
  delete pluginState.installedPlugins[pluginId];
  
  // 从启用列表中移除
  const index = pluginState.enabledPlugins.indexOf(pluginId);
  if (index > -1) {
    pluginState.enabledPlugins.splice(index, 1);
  }
  
  // 移除插件设置
  delete pluginState.pluginSettings[pluginId];
  
  savePluginState();
  
  console.log(`插件 ${pluginName} 已卸载`);
  return { success: true, message: '卸载成功' };
}

/**
 * 启用插件
 * @param {String} pluginId - 插件ID
 */
export function enablePlugin(pluginId) {
  if (!isPluginInstalled(pluginId)) {
    return { success: false, message: '插件未安装' };
  }
  
  if (isPluginEnabled(pluginId)) {
    return { success: true, message: '插件已启用' };
  }
  
  pluginState.enabledPlugins.push(pluginId);
  savePluginState();
  
  // 触发插件加载回调
  if (pluginLoadCallbacks[pluginId]) {
    pluginLoadCallbacks[pluginId].forEach(cb => cb());
  }
  
  console.log(`插件 ${pluginId} 已启用`);
  return { success: true, message: '启用成功' };
}

/**
 * 禁用插件
 * @param {String} pluginId - 插件ID
 */
export function disablePlugin(pluginId) {
  if (!isPluginInstalled(pluginId)) {
    return { success: false, message: '插件未安装' };
  }
  
  const index = pluginState.enabledPlugins.indexOf(pluginId);
  if (index === -1) {
    return { success: true, message: '插件已禁用' };
  }
  
  pluginState.enabledPlugins.splice(index, 1);
  savePluginState();
  
  console.log(`插件 ${pluginId} 已禁用`);
  return { success: true, message: '禁用成功' };
}

/**
 * 获取插件设置
 * @param {String} pluginId - 插件ID
 */
export function getPluginSettings(pluginId) {
  return pluginState.pluginSettings[pluginId] || {};
}

/**
 * 保存插件设置
 * @param {String} pluginId - 插件ID
 * @param {Object} settings - 设置数据
 */
export function savePluginSettings(pluginId, settings) {
  pluginState.pluginSettings[pluginId] = {
    ...pluginState.pluginSettings[pluginId],
    ...settings,
    updatedAt: Date.now()
  };
  savePluginState();
}

/**
 * 加载插件 bundle（动态加载）
 * @param {String} pluginId - 插件ID
 * @param {String} bundleUrl - bundle URL
 */
async function loadPluginBundle(pluginId, bundleUrl) {
  // 在实际实现中，这里会动态加载 JS bundle
  // uni-app 中可以使用 require 或 import 动态加载
  // 这里作为占位实现
  return new Promise((resolve, reject) => {
    // 模拟异步加载
    setTimeout(() => {
      console.log(`插件 ${pluginId} bundle 已加载`);
      resolve();
    }, 500);
  });
}

/**
 * 注册插件加载回调
 * @param {String} pluginId - 插件ID
 * @param {Function} callback - 回调函数
 */
export function onPluginLoaded(pluginId, callback) {
  if (!pluginLoadCallbacks[pluginId]) {
    pluginLoadCallbacks[pluginId] = [];
  }
  pluginLoadCallbacks[pluginId].push(callback);
}

/**
 * 保存插件状态到本地存储
 */
function savePluginState() {
  uni.setStorageSync('installedPlugins', JSON.stringify(pluginState.installedPlugins));
  uni.setStorageSync('enabledPlugins', JSON.stringify(pluginState.enabledPlugins));
  uni.setStorageSync('pluginSettings', JSON.stringify(pluginState.pluginSettings));
}

/**
 * 获取插件详情
 * @param {String} pluginId - 插件ID
 */
export function getPlugin(pluginId) {
  const allPlugins = getAllPlugins();
  return allPlugins[pluginId] || null;
}

/**
 * 搜索插件
 * @param {String} keyword - 搜索关键词
 * @param {String} type - 插件类型过滤
 */
export function searchPlugins(keyword, type = null) {
  const allPlugins = getAllPlugins();
  const results = [];
  
  Object.values(allPlugins).forEach(plugin => {
    if (type && plugin.type !== type) return;
    
    const searchText = `${plugin.name} ${plugin.description}`.toLowerCase();
    if (searchText.includes(keyword.toLowerCase())) {
      results.push(plugin);
    }
  });
  
  return results;
}

/**
 * 按类型获取插件
 * @param {String} type - 插件类型
 */
export function getPluginsByType(type) {
  const allPlugins = getAllPlugins();
  return Object.values(allPlugins).filter(p => p.type === type);
}

/**
 * 获取插件市场推荐列表
 */
export function getMarketplaceFeatured() {
  const allPlugins = getAllPlugins();
  return Object.values(allPlugins)
    .filter(p => !isPluginInstalled(p.id))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
}

/**
 * 导出插件管理器 API
 */
export default {
  PluginType,
  PluginStatus,
  initPluginManager,
  getAllPlugins,
  getInstalledPlugins,
  getEnabledPluginIds,
  isPluginInstalled,
  isPluginEnabled,
  installPlugin,
  uninstallPlugin,
  enablePlugin,
  disablePlugin,
  getPluginSettings,
  savePluginSettings,
  onPluginLoaded,
  getPlugin,
  searchPlugins,
  getPluginsByType,
  getMarketplaceFeatured
};
