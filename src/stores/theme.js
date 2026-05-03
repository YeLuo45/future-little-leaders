import { reactive, computed } from 'vue';

const state = reactive({
  darkMode: false
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

  // 计算属性：是否为暗黑模式
  const isDarkMode = computed(() => state.darkMode);

  return {
    initTheme,
    toggleTheme,
    setTheme,
    isDarkMode
  };
} 