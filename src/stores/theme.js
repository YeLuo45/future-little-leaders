import { reactive, computed } from 'vue';
import { prefersHighContrast } from '@/utils/a11y.js';

const state = reactive({
  darkMode: false,
  highContrast: false
});

export function useThemeStore() {
  // 初始化主题
  function initTheme() {
    // 检查localStorage中是否有保存的主题设置
    const savedTheme = uni.getStorageSync('theme');
    
    if (savedTheme) {
      state.darkMode = savedTheme === 'dark';
    } else {
      // 默认使用亮色主题
      state.darkMode = false;
      // 保存主题设置
      uni.setStorageSync('theme', 'light');
    }
    
    // V28: 检测系统高对比度偏好
    const savedHighContrast = uni.getStorageSync('highContrast');
    if (savedHighContrast !== null) {
      state.highContrast = savedHighContrast === 'true';
    } else {
      // 检测系统偏好
      state.highContrast = prefersHighContrast();
    }
    
    // V28: 应用高对比度主题
    applyHighContrast(state.highContrast);
  }

  // V28: 应用高对比度主题到 DOM
  function applyHighContrast(enabled) {
    if (typeof document !== 'undefined') {
      if (enabled) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    }
  }

  // 切换主题
  function toggleTheme() {
    state.darkMode = !state.darkMode;
    // 保存用户主题偏好
    uni.setStorageSync('theme', state.darkMode ? 'dark' : 'light');
  }

  // 设置特定主题
  function setTheme(isDark) {
    state.darkMode = isDark;
    // 保存用户主题偏好
    uni.setStorageSync('theme', isDark ? 'dark' : 'light');
  }

  // V28: 切换高对比度模式
  function toggleHighContrast() {
    state.highContrast = !state.highContrast;
    uni.setStorageSync('highContrast', String(state.highContrast));
    applyHighContrast(state.highContrast);
    console.log('高对比度模式已' + (state.highContrast ? '开启' : '关闭'));
  }

  // V28: 设置高对比度模式
  function setHighContrast(enabled) {
    state.highContrast = enabled;
    uni.setStorageSync('highContrast', String(enabled));
    applyHighContrast(enabled);
  }

  // 计算属性：是否为暗黑模式
  const isDarkMode = computed(() => state.darkMode);
  
  // V28: 计算属性：是否为高对比度模式
  const isHighContrast = computed(() => state.highContrast);

  return {
    initTheme,
    toggleTheme,
    setTheme,
    toggleHighContrast,
    setHighContrast,
    isDarkMode,
    isHighContrast
  };
} 