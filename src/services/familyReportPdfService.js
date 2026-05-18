// familyReportPdfService.js - 家庭报告PDF生成服务
// 使用 canvas 绘制 + uni.canvasToTempFilePath 生成图片，再拼接为"PDF"(实际上是长图片)

/**
 * 生成家庭成长报告PDF（实际上是高质量图片）
 * @param {Object} options - 报告选项
 * @param {string} options.babyId - 宝宝ID
 * @param {Object} options.reportData - 报告数据
 * @param {Function} options.onProgress - 进度回调
 * @returns {Promise<string>} - 返回生成的图片临时路径
 */
export async function generateFamilyReportPdf(options) {
  const { babyId, reportData, onProgress } = options;
  
  return new Promise(async (resolve, reject) => {
    try {
      // 1. 创建离屏 canvas
      const canvasWidth = 750; // 标准宽度
      const canvasHeight = 2200; // 内容高度
      const canvas = uni.createOffscreenCanvas({
        type: '2d',
        width: canvasWidth,
        height: canvasHeight
      });
      
      const ctx = canvas.getContext('2d');
      
      // 2. 设置字体
      ctx.font = '30px sans-serif';
      ctx.textBaseline = 'top';
      
      let yPos = 40;
      const leftMargin = 40;
      const rightMargin = canvasWidth - 40;
      const contentWidth = rightMargin - leftMargin;
      
      // 3. 绘制报告封面
      onProgress?.(10);
      drawCover(ctx, reportData, canvasWidth, yPos, leftMargin, rightMargin);
      yPos += 280;
      
      // 4. 绘制统计概览
      onProgress?.(25);
      yPos = drawStatsOverview(ctx, reportData, canvasWidth, yPos, leftMargin, rightMargin);
      
      // 5. 绘制成长轨迹图表
      onProgress?.(40);
      yPos = drawGrowthTrajectory(ctx, reportData, canvasWidth, yPos, leftMargin, rightMargin);
      
      // 6. 绘制能力雷达图
      onProgress?.(60);
      yPos = drawAbilityRadar(ctx, reportData, canvasWidth, yPos, leftMargin, rightMargin);
      
      // 7. 绘制成就列表
      onProgress?.(75);
      yPos = drawAchievements(ctx, reportData, canvasWidth, yPos, leftMargin, rightMargin);
      
      // 8. 绘制AI评语和建议
      onProgress?.(85);
      yPos = drawAISummary(ctx, reportData, canvasWidth, yPos, leftMargin, rightMargin);
      
      // 9. 绘制页脚
      onProgress?.(95);
      drawFooter(ctx, reportData, canvasWidth, canvasHeight);
      
      // 10. 导出为图片
      const tempFilePath = await exportCanvasToImage(canvas, canvasWidth, canvasHeight);
      
      onProgress?.(100);
      resolve(tempFilePath);
      
    } catch (error) {
      console.error('[PDF Service] 生成报告失败:', error);
      reject(error);
    }
  });
}

/**
 * 绘制报告封面
 */
function drawCover(ctx, data, canvasWidth, yPos, leftMargin, rightMargin) {
  const centerX = canvasWidth / 2;
  
  // 渐变背景
  const gradient = ctx.createLinearGradient(0, 0, canvasWidth, 300);
  gradient.addColorStop(0, '#8B5CF6');
  gradient.addColorStop(1, '#7C3AED');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, 260);
  
  // 宝宝头像/表情
  ctx.font = '120px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.baby?.avatar || '👶', centerX, yPos + 20);
  
  // 标题
  ctx.font = 'bold 48px sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText(`${data.baby?.name || '宝宝'}成长报告`, centerX, yPos + 160);
  
  // 日期
  ctx.font = '28px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  const reportDate = data.generatedAt ? new Date(data.generatedAt).toLocaleDateString('zh-CN') : new Date().toLocaleDateString('zh-CN');
  ctx.fillText(`报告日期: ${reportDate}`, centerX, yPos + 220);
}

/**
 * 绘制统计概览
 */
function drawStatsOverview(ctx, data, canvasWidth, yPos, leftMargin, rightMargin) {
  const contentWidth = rightMargin - leftMargin;
  
  // 标题
  ctx.font = 'bold 36px sans-serif';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'left';
  ctx.fillText('📊 数据概览', leftMargin, yPos);
  yPos += 60;
  
  // 统计卡片
  const stats = [
    { label: '本周完成', value: data.stats?.weekCompleted || 0, unit: '任务', color: '#8B5CF6' },
    { label: '累计积分', value: data.stats?.totalPoints || 0, unit: '积分', color: '#F59E0B' },
    { label: '连续打卡', value: data.stats?.currentStreak || 0, unit: '天', color: '#10B981' },
    { label: '成就解锁', value: data.stats?.achievementCount || 0, unit: '个', color: '#EC4899' }
  ];
  
  const cardWidth = (contentWidth - 30) / 2;
  const cardHeight = 140;
  
  stats.forEach((stat, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = leftMargin + col * (cardWidth + 30);
    const y = yPos + row * (cardHeight + 20);
    
    // 卡片背景
    ctx.fillStyle = 'white';
    drawRoundedRect(ctx, x, y, cardWidth, cardHeight, 16);
    ctx.fill();
    
    // 顶部色条
    ctx.fillStyle = stat.color;
    ctx.fillRect(x + 20, y + 20, 60, 8);
    
    // 数值
    ctx.font = 'bold 56px sans-serif';
    ctx.fillStyle = stat.color;
    ctx.textAlign = 'left';
    ctx.fillText(stat.value.toString(), x + 20, y + 45);
    
    // 单位
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText(stat.unit, x + 20 + ctx.measureText(stat.value.toString()).width + 10, y + 75);
    
    // 标签
    ctx.font = '26px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(stat.label, x + 20, y + 95);
  });
  
  return yPos + Math.ceil(stats.length / 2) * (cardHeight + 20) + 40;
}

/**
 * 绘制成长轨迹（用简化柱状图表示）
 */
function drawGrowthTrajectory(ctx, data, canvasWidth, yPos, leftMargin, rightMargin) {
  const contentWidth = rightMargin - leftMargin;
  
  // 标题
  ctx.font = 'bold 36px sans-serif';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'left';
  ctx.fillText('🌟 成长轨迹', leftMargin, yPos);
  yPos += 60;
  
  // 7日数据柱状图
  const chartData = data.weeklyProgress || generateMockWeeklyData();
  const chartHeight = 200;
  const barWidth = (contentWidth - 60) / 7;
  const maxValue = Math.max(...chartData.map(d => d.value || 1), 1);
  
  chartData.forEach((item, index) => {
    const barHeight = ((item.value || 0) / maxValue) * chartHeight;
    const x = leftMargin + 30 + index * barWidth + barWidth * 0.1;
    const y = yPos + chartHeight - barHeight;
    const w = barWidth * 0.8;
    
    // 渐变填充
    const gradient = ctx.createLinearGradient(0, y, 0, yPos + chartHeight);
    gradient.addColorStop(0, '#8B5CF6');
    gradient.addColorStop(1, '#A78BFA');
    ctx.fillStyle = gradient;
    drawRoundedRect(ctx, x, y, w, barHeight, 8);
    ctx.fill();
    
    // 数值
    if (item.value > 0) {
      ctx.font = 'bold 22rpx sans-serif';
      ctx.fillStyle = '#8B5CF6';
      ctx.textAlign = 'center';
      ctx.fillText(item.value.toString(), x + w / 2, y - 10);
    }
    
    // 日期标签
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    ctx.fillText(item.date || '', x + w / 2, yPos + chartHeight + 10);
  });
  
  return yPos + chartHeight + 60;
}

/**
 * 绘制能力雷达图（用条形图模拟）
 */
function drawAbilityRadar(ctx, data, canvasWidth, yPos, leftMargin, rightMargin) {
  const contentWidth = rightMargin - leftMargin;
  
  // 标题
  ctx.font = 'bold 36px sans-serif';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'left';
  ctx.fillText('🎯 能力分析', leftMargin, yPos);
  yPos += 60;
  
  // 雷达图用条形图表示
  const abilities = data.radarData || data.abilityData || [
    { label: '任务完成', value: 85 },
    { label: '连续打卡', value: 72 },
    { label: '技能提升', value: 90 },
    { label: '积分获取', value: 68 },
    { label: '成就解锁', value: 55 },
    { label: '互动协作', value: 78 }
  ];
  
  const barHeight = 40;
  const gap = 16;
  const labelWidth = 140;
  const barMaxWidth = contentWidth - labelWidth - 80;
  
  abilities.forEach((ability, index) => {
    const y = yPos + index * (barHeight + gap);
    
    // 标签
    ctx.font = '26px sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.fillText(ability.label, leftMargin, y + 8);
    
    // 进度条背景
    ctx.fillStyle = '#F3F4F6';
    drawRoundedRect(ctx, leftMargin + labelWidth, y, barMaxWidth, barHeight, 8);
    ctx.fill();
    
    // 进度条填充
    const fillWidth = (ability.value / 100) * barMaxWidth;
    if (fillWidth > 0) {
      const gradient = ctx.createLinearGradient(leftMargin + labelWidth, 0, leftMargin + labelWidth + fillWidth, 0);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#EC4899');
      ctx.fillStyle = gradient;
      drawRoundedRect(ctx, leftMargin + labelWidth, y, fillWidth, barHeight, 8);
      ctx.fill();
    }
    
    // 百分比
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'right';
    ctx.fillText(`${ability.value}%`, rightMargin, y + 8);
  });
  
  return yPos + abilities.length * (barHeight + gap) + 40;
}

/**
 * 绘制成就列表
 */
function drawAchievements(ctx, data, canvasWidth, yPos, leftMargin, rightMargin) {
  const contentWidth = rightMargin - leftMargin;
  
  // 标题
  ctx.font = 'bold 36px sans-serif';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'left';
  ctx.fillText('🏆 已获成就', leftMargin, yPos);
  yPos += 60;
  
  const achievements = data.achievements || [];
  
  if (achievements.length === 0) {
    ctx.font = '26px sans-serif';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    ctx.fillText('暂无成就，继续加油！', canvasWidth / 2, yPos + 40);
    yPos += 80;
  } else {
    const itemHeight = 80;
    achievements.slice(0, 6).forEach((ach, index) => {
      const y = yPos + index * itemHeight;
      
      // 成就图标
      ctx.font = '48px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(ach.icon || '🌟', leftMargin, y);
      
      // 成就名称
      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#333';
      ctx.fillText(ach.name || ach.title || '成就', leftMargin + 70, y + 5);
      
      // 成就描述
      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#888';
      ctx.fillText(ach.description || '', leftMargin + 70, y + 40);
      
      // 解锁日期
      if (ach.unlockedAt) {
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#10B981';
        ctx.textAlign = 'right';
        ctx.fillText(new Date(ach.unlockedAt).toLocaleDateString('zh-CN'), rightMargin, y + 20);
      }
    });
    
    yPos += achievements.slice(0, 6).length * itemHeight + 20;
  }
  
  return yPos + 20;
}

/**
 * 绘制AI评语和建议
 */
function drawAISummary(ctx, data, canvasWidth, yPos, leftMargin, rightMargin) {
  const contentWidth = rightMargin - leftMargin;
  
  // 标题
  ctx.font = 'bold 36px sans-serif';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'left';
  ctx.fillText('✨ AI成长评语', leftMargin, yPos);
  yPos += 60;
  
  // 卡片背景
  ctx.fillStyle = '#F9FAFB';
  drawRoundedRect(ctx, leftMargin, yPos, contentWidth, 280, 16);
  ctx.fill();
  
  const aiSummary = data.aiSummary || {};
  
  // 综合评语
  ctx.font = '28px sans-serif';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'left';
  const summaryText = aiSummary.summary || '本周表现不错，继续保持！';
  wrapText(ctx, summaryText, leftMargin + 30, yPos + 40, contentWidth - 60, 40);
  
  yPos += 100;
  
  // 优势
  if (aiSummary.strengths && aiSummary.strengths.length > 0) {
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#10B981';
    ctx.fillText('💪 优势:', leftMargin + 30, yPos);
    yPos += 40;
    
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#666';
    aiSummary.strengths.slice(0, 2).forEach((s, i) => {
      ctx.fillText(`• ${s}`, leftMargin + 40, yPos + i * 32);
    });
    yPos += 70;
  }
  
  // 建议
  if (aiSummary.suggestions && aiSummary.suggestions.length > 0) {
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#8B5CF6';
    ctx.fillText('📝 建议:', leftMargin + 30, yPos);
    yPos += 40;
    
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#666';
    aiSummary.suggestions.slice(0, 2).forEach((s, i) => {
      ctx.fillText(`• ${s}`, leftMargin + 40, yPos + i * 32);
    });
  }
  
  return yPos + 160;
}

/**
 * 绘制页脚
 */
function drawFooter(ctx, data, canvasWidth, canvasHeight) {
  const y = canvasHeight - 60;
  
  // 分隔线
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, y - 20);
  ctx.lineTo(canvasWidth - 40, y - 20);
  ctx.stroke();
  
  // 品牌标识
  ctx.font = '22px sans-serif';
  ctx.fillStyle = '#888';
  ctx.textAlign = 'center';
  ctx.fillText('由 亲子任务宝 生成', canvasWidth / 2, y);
  
  // 日期时间戳
  ctx.font = '20px sans-serif';
  ctx.fillText(`生成时间: ${new Date().toLocaleString('zh-CN')}`, canvasWidth / 2, y + 25);
}

/**
 * 导出Canvas为图片
 */
function exportCanvasToImage(canvas, width, height) {
  return new Promise((resolve, reject) => {
    try {
      // 获取像素数据
      const pixelData = canvas.toDataURL({
        format: 'png',
        quality: 1,
        width,
        height
      });
      
      // 保存到本地临时文件
      const filePath = `${uni.env.USER_DATA_PATH}/growth_report_${Date.now()}.png`;
      
      // 使用 uni.base64ToFile (如果支持) 或手动保存
      if (uni.base64ToFile) {
        uni.base64ToFile(pixelData.split(',')[1], filePath, (res) => {
          resolve(res);
        });
      } else {
        // 降级处理：直接返回 base64
        resolve(pixelData);
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 绘制圆角矩形
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * 文字换行
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split('');
  let line = '';
  let currentY = y;
  
  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i];
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = chars[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

/**
 * 生成模拟周数据
 */
function generateMockWeeklyData() {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 3600 * 1000);
    result.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      value: Math.floor(Math.random() * 8) + 1
    });
  }
  return result;
}

/**
 * 使用 canvas 绘制报告并导出图片
 * 用于实际渲染
 */
export async function renderReportToCanvas(canvasId, reportData) {
  return new Promise((resolve, reject) => {
    const query = uni.createSelectorQuery().select(`#${canvasId}`);
    query.boundingClientRect(async (rect) => {
      if (!rect) {
        reject(new Error('Canvas not found'));
        return;
      }
      
      const ctx = uni.createCanvasContext(canvasId);
      const dpr = uni.getSystemInfoSync().pixelRatio || 2;
      
      // 设置 canvas 尺寸
      ctx.scale(dpr, dpr);
      
      const canvasWidth = rect.width;
      const canvasHeight = 2200;
      
      // 绘制内容
      let yPos = 40;
      // ... (简化示例，实际调用上面的绘制函数)
      
      ctx.draw(false, () => {
        uni.canvasToTempFilePath({
          canvasId,
          fileType: 'png',
          quality: 1,
          success: (res) => resolve(res.tempFilePath),
          fail: reject
        });
      });
    }).exec();
  });
}

/**
 * 分享报告图片到微信
 */
export async function shareReportToWechat(tempFilePath) {
  try {
    // 微信分享图片
    if (uni.share) {
      await uni.share({
        type: 'image',
        imageUrl: tempFilePath,
        success: () => {
          uni.showToast({ title: '分享成功', icon: 'success' });
        },
        fail: (err) => {
          console.error('[PDF Service] 分享失败:', err);
          uni.showToast({ title: '分享失败', icon: 'none' });
        }
      });
    } else {
      // 保存到相册
      uni.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: () => {
          uni.showToast({ title: '已保存到相册', icon: 'success' });
        },
        fail: (err) => {
          console.error('[PDF Service] 保存失败:', err);
          uni.showToast({ title: '保存失败', icon: 'none' });
        }
      });
    }
  } catch (error) {
    console.error('[PDF Service] 分享/保存失败:', error);
    throw error;
  }
}

export default {
  generateFamilyReportPdf,
  renderReportToCanvas,
  shareReportToWechat,
  generateMockWeeklyData
}
