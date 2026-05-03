// 分享功能工具函数
// 用于统一处理各页面的分享逻辑，便于维护和复用
// 推荐：新页面请使用 useShare 组合式API（见 useShare.js）统一注册分享
// 使用方法：import { getShareConfig } from '@/utils/shareUtils';
//         import { useShare } from '@/utils/useShare';
//         在setup中调用 useShare('index', () => ({...}))

/**
 * 获取页面的分享配置
 * @param {Object} options - 配置项
 * @param {string} options.page - 页面标识，如 'index', 'shop', 'statistics', 'profile' 等
 * @param {Object} options.data - 页面相关数据（如宝宝、积分、任务等）
 * @returns {Object} 分享配置对象
 */
export function getShareConfig({ page, data = {} }) {
  // 默认分享内容
  let config = {
    title: '亲子任务宝 - 宝宝科学成长',
    path: '/pages/index/index',
    imageUrl: '/static/logo/share-logo.png',
    query: ''
  };

  switch (page) {
    case 'index': {
      const { currentBabyId, babies, totalScore, ongoingTasks } = data;
      if (!currentBabyId) {
        config.title = '快来科学培养宝宝成长';
        config.path = '/pages/index/index';
      } else {
        const baby = (babies || []).find(b => b.id === currentBabyId);
        const babyName = baby ? baby.name : '宝宝';
        let shareTitle = `${babyName}今日已完成${ongoingTasks?.length || 0}个任务`;
        if (totalScore > 0) {
          shareTitle += `，累计${totalScore}积分！`;
        }
        config.title = shareTitle;
        config.path = `/pages/index/index?babyId=${currentBabyId}`;
        config.imageUrl = baby?.avatar || '/static/logo/share-logo.png';
        config.query = `babyId=${currentBabyId}`;
      }
      break;
    }
    case 'shop': {
      const { currentBabyId, babies, totalScore, products } = data;
      if (!currentBabyId) {
        config.title = '快来用积分兑换心仪礼品';
        config.path = '/pages/shop/shop';
      } else {
        const baby = (babies || []).find(b => b.id === currentBabyId);
        const babyName = baby ? baby.name : '宝宝';
        let shareTitle = `${babyName}已经获得${totalScore || 0}积分`;
        if ((products || []).length > 0) {
          shareTitle += '，快来看看能兑换什么礼品！';
        }
        config.title = shareTitle;
        config.path = `/pages/shop/shop?babyId=${currentBabyId}`;
        config.imageUrl = baby?.avatar || '/static/logo/share-logo.png';
        config.query = `babyId=${currentBabyId}`;
      }
      break;
    }
    case 'statistics': {
      const { currentBabyId, babies, totalScore, completionRate } = data;
      if (!currentBabyId) {
        config.title = '快来科学培养宝宝成长';
        config.path = '/pages/index/index';
      } else {
        const baby = (babies || []).find(b => b.id === currentBabyId);
        const babyName = baby ? baby.name : '宝宝';
        let shareTitle = `${babyName}的成长任务完成率${completionRate || 0}%`;
        if (totalScore > 0) {
          shareTitle += `，已获得${totalScore}积分！`;
        }
        config.title = shareTitle;
        config.path = `/pages/statistics/task-trend?babyId=${currentBabyId}`;
        config.imageUrl = baby?.avatar || '/static/logo/share-logo.png';
        config.query = `babyId=${currentBabyId}`;
      }
      break;
    }
    case 'profile': {
      const { userInfo, currentBabyId, babies, totalScore } = data;
      if (!currentBabyId) {
        config.title = '快来科学培养宝宝成长';
        config.path = '/pages/profile/profile';
      } else {
        const baby = (babies || []).find(b => b.id === currentBabyId);
        const babyName = baby ? baby.name : '宝宝';
        let shareTitle = `${userInfo?.nickname || '家长'}和${babyName}正在用亲子任务宝记录成长`;
        if (totalScore > 0) {
          shareTitle += `，已获得${totalScore}积分！`;
        }
        config.title = shareTitle;
        config.path = `/pages/profile/profile?babyId=${currentBabyId}`;
        config.imageUrl = baby?.avatar || '/static/logo/share-logo.png';
        config.query = `babyId=${currentBabyId}`;
      }
      break;
    }
    default:
      // 其他页面可扩展
      break;
  }

  return config;
} 