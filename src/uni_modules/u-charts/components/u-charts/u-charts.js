/*
 * uCharts®
 * 高性能跨平台图表库，支持H5、APP、小程序（微信/支付宝/百度/头条/QQ/360）、Vue、Taro等支持canvas的框架平台
 * Copyright (c) 2021 QIUN®秋云 https://www.ucharts.cn All rights reserved.
 * Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
 * 复制使用请保留本段注释，感谢支持开源！
 * 
 * uCharts®官方网站
 * https://www.uCharts.cn
 * 
 * 开源地址:
 * https://gitee.com/uCharts/uCharts
 * 
 * uni-app插件市场地址：
 * http://ext.dcloud.net.cn/plugin?id=271
 * 
 */

class uCharts {
  constructor(opts) {
    this.opts = opts;
    this.config = {
      ...opts,
      pixelRatio: opts.pixelRatio || 1,
      padding: opts.padding || [15, 15, 45, 45],
      enableScroll: false,
      legend: {
        show: true,
        position: 'bottom',
        float: 'center',
        padding: 5,
        margin: 15,
        ...opts.legend
      },
      xAxis: {
        fontSize: 11,
        fontColor: '#666666',
        rotateLabel: false,
        ...opts.xAxis
      },
      yAxis: {
        fontSize: 11,
        fontColor: '#666666',
        gridType: 'dash',
        splitNumber: 4,
        ...opts.yAxis
      }
    };
    
    this.context = uni.createCanvasContext(this.config.canvasId, this);
    this.chartData = {};
    this.event = {};
    
    this.init();
  }
  
  init() {
    const ctx = this.context;
    const { width, height, background } = this.config;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    ctx.setFillStyle(background);
    ctx.fillRect(0, 0, width, height);
    
    if (this.config.series.length === 0) {
      return;
    }
    
    this.drawAxis();
    this.drawSeries();
    this.drawLegend();
    
    ctx.draw();
  }
  
  drawAxis() {
    const ctx = this.context;
    const { width, height, categories, xAxis, yAxis, padding } = this.config;
    const [paddingTop, paddingRight, paddingBottom, paddingLeft] = padding;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    // 计算Y轴范围
    const allValues = this.config.series.reduce((arr, item) => [...arr, ...item.data], []);
    let maxValue = Math.max(...allValues, 0);
    const minValue = Math.min(...allValues, 0);
    
    // 处理最大值
    if (typeof yAxis.data[0].max === 'function') {
      maxValue = yAxis.data[0].max(maxValue);
    }
    
    // 确保最小值间距
    if (maxValue - minValue < 1) {
      maxValue = minValue + 2; // 增加最小范围
    }
    
    const valueRange = maxValue - minValue;
    const gridCount = yAxis.splitNumber || 3;
    
    // 绘制Y轴网格和标签
    for (let i = 0; i <= gridCount; i++) {
      const value = minValue + (valueRange * i) / gridCount;
      const y = height - paddingBottom - (chartHeight * i) / gridCount;
      
      // 绘制网格线
      if (yAxis.gridType === 'dash') {
        ctx.beginPath();
        ctx.setLineDash([yAxis.dashLength || 4, yAxis.dashLength || 4]);
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.setStrokeStyle('#EEEEEE'); // 淡化网格线颜色
        ctx.setLineWidth(0.5);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // 绘制Y轴标签
      const yData = yAxis.data[0];
      const formatValue = yData.format ? yData.format(value) : value.toFixed(0);
      ctx.setFontSize(yData.fontSize);
      ctx.setFillStyle(yData.fontColor);
      ctx.setTextAlign('right');
      ctx.fillText(formatValue, paddingLeft - 8, y + 4);
    }
    
    // 绘制X轴
    ctx.beginPath();
    ctx.setLineWidth(1);
    ctx.setStrokeStyle('#EEEEEE'); // 淡化X轴颜色
    ctx.moveTo(paddingLeft, height - paddingBottom);
    ctx.lineTo(width - paddingRight, height - paddingBottom);
    ctx.stroke();
    
    // 绘制X轴标签
    if (categories.length > 0) {
      const step = chartWidth / (categories.length - 1);
      categories.forEach((item, index) => {
        const x = paddingLeft + step * index;
        const y = height - paddingBottom + xAxis.marginBottom;
        
        ctx.save();
        ctx.setFontSize(xAxis.fontSize);
        ctx.setFillStyle(xAxis.fontColor);
        ctx.setTextAlign('center');
        
        if (xAxis.rotateLabel) {
          ctx.translate(x, y);
          ctx.rotate((-xAxis.rotateAngle || -45) * Math.PI / 180);
          const formattedValue = xAxis.format ? xAxis.format(item) : item;
          ctx.fillText(formattedValue, 0, 0);
        } else {
          const formattedValue = xAxis.format ? xAxis.format(item) : item;
          ctx.fillText(formattedValue, x, y);
        }
        
        ctx.restore();
      });
    }
  }
  
  drawSeries() {
    const ctx = this.context;
    const { width, height, series, categories, padding, extra } = this.config;
    const [paddingTop, paddingRight, paddingBottom, paddingLeft] = padding;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    // 计算数值范围
    const allValues = series.reduce((arr, item) => [...arr, ...item.data], []);
    let maxValue = Math.max(...allValues, 0);
    const minValue = Math.min(...allValues, 0);
    
    // 处理最大值
    if (typeof this.config.yAxis.data[0].max === 'function') {
      maxValue = this.config.yAxis.data[0].max(maxValue);
    }
    
    const valueRange = maxValue - minValue;
    
    // 先绘制所有线条
    series.forEach(item => {
      const points = [];
      
      item.data.forEach((value, index) => {
        const x = paddingLeft + (chartWidth / (categories.length - 1)) * index;
        const y = height - paddingBottom - (chartHeight * (value - minValue)) / valueRange;
        points.push([x, y]);
      });
      
      // 绘制线条
      ctx.beginPath();
      ctx.setLineWidth(extra.line.width);
      ctx.setStrokeStyle(item.color);
      
      if (extra.line.onShadow) {
        ctx.setShadow(0, 2, 4, 'rgba(0,0,0,0.1)');
      }
      
      points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point[0], point[1]);
        } else {
          ctx.lineTo(point[0], point[1]);
        }
      });
      
      ctx.stroke();
      ctx.setShadow(0, 0, 0, 'rgba(0,0,0,0)');
    });
    
    // 再绘制所有数据点
    series.forEach(item => {
      const points = [];
      
      item.data.forEach((value, index) => {
        const x = paddingLeft + (chartWidth / (categories.length - 1)) * index;
        const y = height - paddingBottom - (chartHeight * (value - minValue)) / valueRange;
        points.push([x, y]);
      });
      
      if (extra.line.addPoint) {
        points.forEach(point => {
          // 外圈
          ctx.beginPath();
          ctx.setFillStyle(item.color);
          ctx.arc(point[0], point[1], 4, 0, 2 * Math.PI);
          ctx.fill();
          
          // 内圈
          if (extra.line.activeType === 'hollow') {
            ctx.beginPath();
            ctx.setFillStyle('#FFFFFF');
            ctx.arc(point[0], point[1], 2.5, 0, 2 * Math.PI);
            ctx.fill();
          }
        });
      }
    });
  }
  
  drawLegend() {
    const ctx = this.context;
    const { legend, series, width, height } = this.config;
    if (!legend.show) return;
    
    const itemWidth = legend.itemWidth || 15;
    const itemHeight = legend.itemHeight || 15;
    const itemGap = legend.itemGap || 35;
    const fontSize = legend.fontSize || 11;
    const margin = legend.margin || 20;
    
    // 计算图例总宽度
    let totalWidth = 0;
    series.forEach((item, index) => {
      ctx.setFontSize(fontSize);
      const textWidth = ctx.measureText(item.name).width;
      totalWidth += itemWidth + 5 + textWidth;
      if (index < series.length - 1) {
        totalWidth += itemGap;
      }
    });
    
    // 绘制图例背景
    const legendPadding = 10;
    const legendHeight = itemHeight + legendPadding * 2;
    const legendY = height - legendHeight - margin;
    const legendX = (width - totalWidth) / 2 - legendPadding;
    const legendWidth = totalWidth + legendPadding * 2;
    
    if (legend.backgroundColor) {
      ctx.beginPath();
      ctx.setFillStyle(legend.backgroundColor);
      // 使用圆角矩形
      const radius = legend.borderRadius || 4;
      this.drawRoundRect(ctx, legendX, legendY, legendWidth, legendHeight, radius);
      ctx.fill();
    }
    
    // 绘制图例项
    let startX = (width - totalWidth) / 2;
    const y = legendY + legendPadding;
    
    series.forEach((item, index) => {
      // 绘制图例标记
      ctx.beginPath();
      ctx.setFillStyle(item.color);
      ctx.rect(startX, y + (itemHeight - itemWidth) / 2, itemWidth, itemWidth);
      ctx.fill();
      
      // 绘制图例文字
      ctx.setFontSize(fontSize);
      ctx.setFillStyle('#666666');
      ctx.setTextAlign('left');
      const textWidth = ctx.measureText(item.name).width;
      ctx.fillText(item.name, startX + itemWidth + 5, y + itemHeight - 2);
      
      startX += itemWidth + 5 + textWidth + itemGap;
    });
  }
  
  // 辅助方法：绘制圆角矩形
  drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }
  
  updateData(opts) {
    this.opts = opts;
    Object.assign(this.config, opts);
    this.init();
  }
  
  dispose() {
    this.context = null;
    this.config = null;
    this.opts = null;
    this.chartData = null;
    this.event = null;
  }
}

export default uCharts; 