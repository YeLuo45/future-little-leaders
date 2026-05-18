/**
 * Theme Store - V33 Plugin Marketplace + Theme System
 * 支持多主题切换的主题管理系统
 */

import { reactive, computed } from 'vue';

// 内置主题定义
export const BUILT_IN_THEMES = {
  light: {
    id: 'light',
    name: '默认亮色',
    type: 'built-in',
    preview: '/static/themes/light-preview.png',
    variables: {
      '--primary-color': '#4a3aff',
      '--primary-light': '#6b5aff',
      '--primary-dark': '#2a1aff',
      '--primary-shadow': 'rgba(74, 58, 255, 0.3)',
      '--bg-main': '#f5f5f5',
      '--bg-card': '#ffffff',
      '--bg-input': '#ffffff',
      '--text-main': '#333333',
      '--text-secondary': '#666666',
      '--text-tertiary': '#999999',
      '--border-color': '#e0e0e0'
    }
  },
  dark: {
    id: 'dark',
    name: '暗夜模式',
    type: 'built-in',
    preview: '/static/themes/dark-preview.png',
    variables: {
      '--primary-color': '#6b5aff',
      '--primary-light': '#8b7aff',
      '--primary-dark': '#4a3aff',
      '--primary-shadow': 'rgba(107, 90, 255, 0.3)',
      '--bg-main': '#1a1a2e',
      '--bg-card': '#16213e',
      '--bg-input': '#0f3460',
      '--text-main': '#ffffff',
      '--text-secondary': '#e0e0e0',
      '--text-tertiary': '#a0a0a0',
      '--border-color': '#2a2a4e'
    }
  }
};

// 状态
const state = reactive({
  currentThemeId: 'light',
  installedThemes: {},
  customThemes: {},
  isLoading: false
});

// 主题缓存
let themeCache = null;

/**
 * 应用主题 CSS 变量到 DOM
 * @param {Object} variables - CSS 变量对象
 */
function applyThemeVariables(variables) {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/**
 * 加载主题样式
 * @param {String} themeId - 主题ID
 */
async function loadThemeStyle(themeId) {
  // 检查内置主题
  if (BUILT_IN_THEMES[themeId]) {
    applyThemeVariables(BUILT_IN_THEMES[themeId].variables);
    return;
  }
  
  // 检查已安装的自定义主题
  const customTheme = state.installedThemes[themeId];
  if (customTheme) {
    applyThemeVariables(customTheme.variables);
    return;
  }
  
  // 从本地存储加载
  const savedTheme = uni.getStorageSync(`theme_${themeId}`);
  if (savedTheme) {
    try {
      const themeData = JSON.parse(savedTheme);
      applyThemeVariables(themeData.variables);
    } catch (e) {
      console.error(`加载主题 ${themeId} 失败:`, e);
    }
  }
}

export function useThemeStore() {
  // 获取当前主题
  const currentTheme = computed(() => {
    if (BUILT_IN_THEMES[state.currentThemeId]) {
      return BUILT_IN_THEMES[state.currentThemeId];
    }
    return state.installedThemes[state.currentThemeId] || BUILT_IN_THEMES.light;
  });

  // 获取所有可用主题
  const allThemes = computed(() => {
    return {
      ...BUILT_IN_THEMES,
      ...state.installedThemes
    };
  });

  // 获取自定义主题列表
  const customThemesList = computed(() => {
    return Object.values(state.installedThemes);
  });

  // 初始化主题系统
  function initTheme() {
    // 加载保存的主题
    const savedThemeId = uni.getStorageSync('currentThemeId');
    if (savedThemeId) {
      state.currentThemeId = savedThemeId;
    } else {
      state.currentThemeId = 'light';
    }
    
    // 加载已安装的自定义主题列表
    const installedThemes = uni.getStorageSync('installedThemes');
    if (installedThemes) {
      try {
        state.installedThemes = JSON.parse(installedThemes);
      } catch (e) {
        state.installedThemes = {};
      }
    }
    
    // 应用当前主题
    loadThemeStyle(state.currentThemeId);
    
    // 添加主题类名到 html
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', state.currentThemeId);
    }
  }

  // 设置主题
  function setTheme(themeId) {
    if (!allThemes.value[themeId]) {
      console.warn(`主题 ${themeId} 不存在`);
      return false;
    }
    
    state.currentThemeId = themeId;
    uni.setStorageSync('currentThemeId', themeId);
    loadThemeStyle(themeId);
    
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeId);
    }
    
    console.log(`主题已切换到: ${allThemes.value[themeId].name}`);
    return true;
  }

  // 安装自定义主题
  function installTheme(themeData) {
    const { id, name, variables, preview } = themeData;
    
    if (!id || !name || !variables) {
      console.error('主题数据不完整');
      return false;
    }
    
    const customTheme = {
      id,
      name,
      type: 'custom',
      preview: preview || '',
      variables,
      installedAt: Date.now()
    };
    
    state.installedThemes[id] = customTheme;
    uni.setStorageSync('installedThemes', JSON.stringify(state.installedThemes));
    uni.setStorageSync(`theme_${id}`, JSON.stringify(customTheme));
    
    console.log(`主题 ${name} 安装成功`);
    return true;
  }

  // 卸载自定义主题
  function uninstallTheme(themeId) {
    // 不能卸载内置主题
    if (BUILT_IN_THEMES[themeId]) {
      console.warn('不能卸载内置主题');
      return false;
    }
    
    if (!state.installedThemes[themeId]) {
      console.warn(`主题 ${themeId} 未安装`);
      return false;
    }
    
    const themeName = state.installedThemes[themeId].name;
    delete state.installedThemes[themeId];
    uni.setStorageSync('installedThemes', JSON.stringify(state.installedThemes));
    uni.removeStorageSync(`theme_${themeId}`);
    
    // 如果当前使用该主题，切换到默认主题
    if (state.currentThemeId === themeId) {
      setTheme('light');
    }
    
    console.log(`主题 ${themeName} 已卸载`);
    return true;
  }

  // 获取主题预览URL
  function getThemePreview(themeId) {
    const theme = allThemes.value[themeId];
    return theme ? theme.preview : '';
  }

  // 验证主题变量格式
  function validateThemeVariables(variables) {
    if (typeof variables !== 'object') return false;
    
    const requiredVars = [
      '--primary-color',
      '--bg-main',
      '--text-main'
    ];
    
    for (const key of requiredVars) {
      if (!variables[key]) {
        console.warn(`主题变量缺少必需项: ${key}`);
        return false;
      }
    }
    
    return true;
  }

  // 导出主题为 JSON
  function exportTheme(themeId) {
    const theme = allThemes.value[themeId];
    if (!theme) return null;
    
    return JSON.stringify({
      id: theme.id,
      name: theme.name,
      variables: theme.variables,
      preview: theme.preview
    }, null, 2);
  }

  return {
    state,
    currentTheme,
    allThemes,
    customThemesList,
    initTheme,
    setTheme,
    installTheme,
    uninstallTheme,
    getThemePreview,
    validateThemeVariables,
    exportTheme,
    BUILT_IN_THEMES
  };
}
