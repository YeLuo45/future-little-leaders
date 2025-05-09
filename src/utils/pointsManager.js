// 获取总积分
export const getTotalPoints = () => {
  try {
    const points = uni.getStorageSync('totalScore');
    return points ? parseInt(points) : 0;
  } catch (e) {
    console.error('读取积分失败:', e);
    return 0;
  }
};

// 更新总积分
export const updateTotalPoints = (points) => {
  try {
    uni.setStorageSync('totalScore', points);
    // 发送积分更新事件
    uni.$emit('pointsUpdated', points);
  } catch (e) {
    console.error('保存积分失败:', e);
  }
};

// 增加积分
export const addPoints = (amount) => {
  const currentPoints = getTotalPoints();
  const newPoints = parseInt(currentPoints) + parseInt(amount);
  console.log('积分:', currentPoints, amount, newPoints);
  updateTotalPoints(newPoints);
};

// 减少积分
export const deductPoints = (amount) => {
  const currentPoints = getTotalPoints();
  if (currentPoints >= amount) {
    updateTotalPoints(currentPoints - amount);
    return true;
  }
  return false;
}; 