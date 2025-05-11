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
  try {
    const id = babyId || getCurrentBabyId();
    if (!id) return 0;
    
    const key = `babyScore_${id}`;
    const points = uni.getStorageSync(key);
    return points ? parseInt(points) : 0;
  } catch (e) {
    console.error(`读取宝宝(${babyId})积分失败:`, e);
    return 0;
  }
};

// 更新宝宝积分
export const updateBabyPoints = (points, babyId) => {
  try {
    const id = babyId || getCurrentBabyId();
    if (!id) return;
    
    const key = `babyScore_${id}`;
    uni.setStorageSync(key, points);
    
    // 更新当前宝宝的总积分
    if (id === getCurrentBabyId()) {
      updateTotalPoints(points);
    }
    
    // 发送宝宝积分更新事件
    uni.$emit('babyPointsUpdated', { babyId: id, points });
  } catch (e) {
    console.error(`保存宝宝(${babyId})积分失败:`, e);
  }
};

// 增加宝宝积分
export const addBabyPoints = (amount, babyId) => {
  const id = babyId || getCurrentBabyId();
  if (!id) return;
  
  const currentPoints = getBabyPoints(id);
  const newPoints = parseInt(currentPoints) + parseInt(amount);
  console.log(`宝宝(${id})积分:`, currentPoints, amount, newPoints);
  updateBabyPoints(newPoints, id);
};

// 减少宝宝积分
export const deductBabyPoints = (amount, babyId) => {
  const id = babyId || getCurrentBabyId();
  if (!id) return false;
  
  const currentPoints = getBabyPoints(id);
  if (currentPoints >= amount) {
    updateBabyPoints(currentPoints - amount, id);
    return true;
  }
  return false;
};

// 获取总积分 - 兼容旧版本，返回当前宝宝积分
export const getTotalPoints = () => {
  try {
    const currentBabyId = getCurrentBabyId();
    // 如果有当前宝宝ID，则返回该宝宝的积分
    if (currentBabyId) {
      return getBabyPoints(currentBabyId);
    }
    
    // 兼容旧版本 - 如果没有宝宝ID，返回总积分
    const points = uni.getStorageSync('totalScore');
    return points ? parseInt(points) : 0;
  } catch (e) {
    console.error('读取积分失败:', e);
    return 0;
  }
};

// 更新总积分 - 兼容旧版本，同时设置当前宝宝积分
export const updateTotalPoints = (points) => {
  try {
    // 保存总积分（用于兼容旧版本）
    uni.setStorageSync('totalScore', points);
    
    // 同时更新当前宝宝的积分
    const currentBabyId = getCurrentBabyId();
    if (currentBabyId) {
      const key = `babyScore_${currentBabyId}`;
      uni.setStorageSync(key, points);
    }
    
    // 发送积分更新事件
    uni.$emit('pointsUpdated', points);
  } catch (e) {
    console.error('保存积分失败:', e);
  }
};

// 增加积分 - 兼容旧版本，同时增加当前宝宝积分
export const addPoints = (amount) => {
  const currentBabyId = getCurrentBabyId();
  if (currentBabyId) {
    // 如果有当前宝宝，则调用宝宝积分增加函数
    addBabyPoints(amount, currentBabyId);
  } else {
    // 兼容旧版本
    const currentPoints = getTotalPoints();
    const newPoints = parseInt(currentPoints) + parseInt(amount);
    console.log('积分:', currentPoints, amount, newPoints);
    updateTotalPoints(newPoints);
  }
};

// 减少积分 - 兼容旧版本，同时减少当前宝宝积分
export const deductPoints = (amount) => {
  const currentBabyId = getCurrentBabyId();
  if (currentBabyId) {
    // 如果有当前宝宝，则调用宝宝积分减少函数
    return deductBabyPoints(amount, currentBabyId);
  } else {
    // 兼容旧版本
    const currentPoints = getTotalPoints();
    if (currentPoints >= amount) {
      updateTotalPoints(currentPoints - amount);
      return true;
    }
    return false;
  }
}; 