// 获取当前选中的宝宝ID
export const getCurrentBabyId = () => {
  try {
    return uni.getStorageSync('currentBabyId') || '';
  } catch (e) {
    console.error('读取当前宝宝ID失败:', e);
    return '';
  }
};

// 获取宝宝积分
export const getBabyPoints = (babyId) => {
  if (!babyId) {
    return 0;
  }
  
  try {
    // 尝试获取宝宝积分记录
    const pointsRecords = uni.getStorageSync('babyPointsRecords') || '{}';
    const records = typeof pointsRecords === 'string' ? JSON.parse(pointsRecords) : pointsRecords;
    
    // 如果该宝宝有积分记录，返回积分
    if (records[babyId]) {
      return parseInt(records[babyId]) || 0;
    }
    
    return 0;
  } catch (e) {
    console.error('获取宝宝积分失败:', e);
    return 0;
  }
};

// 更新宝宝积分
export const updateBabyPoints = (babyId, points) => {
  if (!babyId) {
    return false;
  }
  
  try {
    // 获取现有宝宝积分记录
    const pointsRecords = uni.getStorageSync('babyPointsRecords') || '{}';
    const records = typeof pointsRecords === 'string' ? JSON.parse(pointsRecords) : pointsRecords;
    
    // 更新积分
    records[babyId] = points;
    
    // 存储到缓存
    uni.setStorageSync('babyPointsRecords', JSON.stringify(records));
    
    // 发布积分更新事件
    uni.$emit('babyPointsUpdated', { babyId, points });
    
    return true;
  } catch (e) {
    console.error('更新宝宝积分失败:', e);
    return false;
  }
};

// 添加宝宝积分
export const addBabyPoints = (babyId, points) => {
  if (!babyId || points <= 0) {
    return false;
  }
  
  try {
    const currentPoints = getBabyPoints(babyId);
    const newPoints = currentPoints + parseInt(points);
    return updateBabyPoints(babyId, newPoints);
  } catch (e) {
    console.error('添加宝宝积分失败:', e);
    return false;
  }
};

// 扣除宝宝积分
export const deductBabyPoints = (babyId, points) => {
  if (!babyId || points <= 0) {
    return false;
  }
  
  try {
    const currentPoints = getBabyPoints(babyId);
    
    // 积分不足
    if (currentPoints < points) {
      return false;
    }
    
    const newPoints = currentPoints - points;
    return updateBabyPoints(babyId, newPoints);
  } catch (e) {
    console.error('扣除宝宝积分失败:', e);
    return false;
  }
};




// 添加积分
export function addPoints(points, babyId) {
  try {
    // 如果指定了宝宝ID
    if (babyId) {
      addBabyPoints(babyId, points);
    } else {
      console.warn('未找到当前宝宝ID，无法添加积分');
    }
    return true;
  } catch (e) {
    console.error('添加积分失败:', e);
    return false;
  }
}

// 扣除积分
export function deductPoints(points, babyId) {
  try {
    // 如果指定了宝宝ID
    if (babyId) {
      return deductBabyPoints(babyId, points);
    }else{
      console.warn('未找到当前宝宝ID，无法扣除积分');
    }

    return true;
  } catch (e) {
    console.error('扣除积分失败:', e);
    return false;
  }
}