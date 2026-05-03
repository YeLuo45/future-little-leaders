// useShare.js
// 组合式API：统一注册分享功能
// 用法：在setup中调用 useShare(page, dataGetter)
// page: 页面标识（如'index'、'shop'、'statistics'、'profile'）
// dataGetter: 返回当前页面分享所需数据的函数（返回对象）

import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { getShareConfig } from './shareUtils';

/**
 * 注册页面分享功能
 * @param {string} page 页面标识
 * @param {Function} dataGetter 返回页面分享数据的函数
 */
export function useShare(page, dataGetter) {
  // 注册分享给朋友
  onShareAppMessage(() => {
    const data = typeof dataGetter === 'function' ? dataGetter() : {};
    return getShareConfig({ page, data });
  });

  // 注册分享到朋友圈
  onShareTimeline(() => {
    const data = typeof dataGetter === 'function' ? dataGetter() : {};
    const config = getShareConfig({ page, data });
    return {
      title: config.title,
      query: config.query,
      imageUrl: config.imageUrl
    };
  });
}

/**
 * 说明：
 * 1. 该hook需在setup中调用。
 * 2. dataGetter应返回最新的响应式数据（如ref、computed等），以保证分享内容实时。
 * 3. 适用于所有需要分享功能的页面。
 */ 