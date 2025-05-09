/**
 * 主题工具类 - 用于管理应用的暗色/亮色主题切换
 */

// 当前主题状态 - 默认为亮色模式
let isDarkMode = false;

// 获取本地存储的主题设置
function initTheme() {
  try {
    // 检查本地存储中是否有保存的主题设置
    const savedTheme = uni.getStorageSync('theme_mode');
    if (savedTheme === 'dark') {
      isDarkMode = true;
      console.log('已从本地存储加载暗色主题设置');
    } else {
      console.log('使用默认亮色主题设置');
    }
  } catch (e) {
    console.error('读取主题设置失败', e);
  }
}

// 获取当前主题模式
export function isDarkTheme() {
  return isDarkMode;
}

// 切换主题模式
export function toggleTheme() {
  isDarkMode = !isDarkMode;
  saveTheme();
  console.log('主题已切换为: ' + (isDarkMode ? '暗色' : '亮色'));
  return isDarkMode;
}

// 设置主题为暗色模式
export function setDarkTheme() {
  isDarkMode = true;
  saveTheme();
  console.log('主题已设置为暗色');
}

// 设置主题为亮色模式
export function setLightTheme() {
  isDarkMode = false;
  saveTheme();
  console.log('主题已设置为亮色');
}

// 保存主题设置到本地存储
function saveTheme() {
  try {
    uni.setStorageSync('theme_mode', isDarkMode ? 'dark' : 'light');
  } catch (e) {
    console.error('保存主题设置失败', e);
  }
}

// 初始化主题设置
initTheme(); 