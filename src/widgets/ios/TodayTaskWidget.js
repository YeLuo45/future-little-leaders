/**
 * iOS Widget - Today Task Widget (iOS 14+ WidgetKit)
 * 今日任务Widget - 独立展示今日任务和快速打卡
 * 
 * 使用方式：
 * 1. 创建Widget Extension
 * 2. 使用WidgetKit定义Timeline Provider
 * 3. 渲染今日任务卡片
 */

'use strict';

// ========== Widget 数据模型 ==========

/**
 * @typedef {Object} TaskItem
 * @property {string} id - 任务ID
 * @property {string} title - 任务标题
 * @property {string} category - 任务分类 (study/exercise/habit)
 * @property {number} rewardPoints - 奖励积分
 * @property {boolean} completed - 是否完成
 */

/**
 * @typedef {Object} WidgetData
 * @property {string} babyName - 宝宝名称
 * @property {TaskItem[]} tasks - 今日任务列表
 * @property {number} totalPoints - 总积分
 * @property {number} completedCount - 已完成数量
 */

/**
 * @typedef {Object} TimelineEntry
 * @property {Date} date - 日期
 * @property {WidgetData} data - Widget数据
 */

// ========== Widget 配置常量 ==========

const WIDGET_CONFIG = {
  kind: 'TodayTaskWidget',
  displayName: '今日任务',
  description: '展示今日任务和快速打卡',
  supportedFamilies: ['systemSmall', 'systemMedium', 'systemLarge'],
  
  // 尺寸配置
  sizes: {
    systemSmall: { width: 155, height: 155 },
    systemMedium: { width: 329, height: 155 },
    systemLarge: { width: 329, height: 345 }
  },
  
  // 刷新间隔（分钟）
  refreshInterval: 15,
  
  // 任务分类图标
  categoryIcons: {
    study: '📚',
    exercise: '🏃',
    habit: '✨'
  }
};

// ========== Timeline Provider ==========

/**
 * iOS Widget Timeline Provider
 * 生成Widget时间线数据
 */
class TodayTaskTimelineProvider {
  constructor() {
    this.dataSource = null;
  }
  
  /**
   * 设置数据源
   * @param {Object} dataSource - 外部数据源
   */
  setDataSource(dataSource) {
    this.dataSource = dataSource;
  }
  
  /**
   * 获取Placeholder数据
   * @returns {WidgetData}
   */
  placeholder() {
    return {
      babyName: '小明',
      tasks: [
        { id: '1', title: '完成数学作业', category: 'study', rewardPoints: 10, completed: false },
        { id: '2', title: '户外运动30分钟', category: 'exercise', rewardPoints: 15, completed: false },
        { id: '3', title: '整理房间', category: 'habit', rewardPoints: 5, completed: false }
      ],
      totalPoints: 100,
      completedCount: 2
    };
  }
  
  /**
   * 获取快照数据（用于预览）
   * @param {Date} date - 日期
   * @returns {WidgetData}
   */
  snapshot(date) {
    if (this.dataSource) {
      return this.dataSource.getWidgetData();
    }
    return this.placeholder();
  }
  
  /**
   * 生成时间线
   * @param {Date} date - 日期
   * @param {Function} completion - 完成回调
   */
  timeline(date, completion) {
    const entries = [];
    const now = new Date();
    
    // 生成从现在到一天内的时间线
    for (let i = 0; i < 24; i++) {
      const entryDate = new Date(now.getTime() + i * 60 * 60 * 1000);
      const data = this.dataSource 
        ? this.dataSource.getWidgetData(entryDate) 
        : this.placeholder();
      
      entries.push({
        date: entryDate,
        data: data
      });
    }
    
    completion(entries);
  }
  
  /**
   * 获取相关数据（用于Widget链接）
   * @param {string} identifier - 任务ID
   * @returns {Object}
   */
  getRelevantData(identifier) {
    if (this.dataSource) {
      return this.dataSource.getTaskById(identifier);
    }
    return null;
  }
}

// ========== Widget 渲染器 ==========

/**
 * iOS Widget 渲染器
 * 生成SwiftUI视图代码
 */
class TodayTaskWidgetRenderer {
  /**
   * 渲染Small Widget
   * @param {WidgetData} data - 数据
   * @returns {string} SwiftUI代码
   */
  renderSmall(data) {
    return `
struct SmallTodayTaskView: View {
  let data: WidgetData
  
  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      // 标题栏
      HStack {
        Text(data.babyName)
          .font(.headline)
          .foregroundColor(.primary)
        Spacer()
        Text("🔥\\(data.totalPoints)")
          .font(.caption)
          .foregroundColor(.orange)
      }
      
      Spacer()
      
      // 今日任务数
      Text("今日任务")
        .font(.caption2)
        .foregroundColor(.secondary)
      Text("\\(data.completedCount)/\\(data.tasks.count)")
        .font(.title)
        .fontWeight(.bold)
        .foregroundColor(.blue)
      
      Spacer()
      
      // 快速操作
      Link(destination: URL(string: "littleleaders://quick-checkin")!) {
        Text("快速打卡")
          .font(.caption)
          .foregroundColor(.white)
          .padding(.horizontal, 12)
          .padding(.vertical, 6)
          .background(Color.blue)
          .cornerRadius(12)
      }
    }
    .padding()
  }
}
`;
  }
  
  /**
   * 渲染Medium Widget
   * @param {WidgetData} data - 数据
   * @returns {string} SwiftUI代码
   */
  renderMedium(data) {
    const taskItems = data.tasks.slice(0, 3).map(task => `
      HStack {
        Text("${WIDGET_CONFIG.categoryIcons[task.category] || '📝'}")
          .font(.title3)
        VStack(alignment: .leading) {
          Text("${task.title}")
            .font(.subheadline)
            .lineLimit(1)
          Text("+${task.rewardPoints}积分")
            .font(.caption2)
            .foregroundColor(.orange)
        }
        Spacer()
        ${task.completed ? `
          Image(systemName: "checkmark.circle.fill")
            .foregroundColor(.green)
        ` : `
          Link(destination: URL(string: "littleleaders://checkin/${task.id}")!) {
            Image(systemName: "circle")
              .foregroundColor(.gray)
          }
        `}
      }
    `).join('');
    
    return `
struct MediumTodayTaskView: View {
  let data: WidgetData
  
  var body: some View {
    HStack(spacing: 16) {
      // 左侧统计
      VStack(alignment: .leading, spacing: 8) {
        Text(data.babyName)
          .font(.headline)
        Text("今日任务")
          .font(.caption)
          .foregroundColor(.secondary)
        Text("\\(data.completedCount)/\\(data.tasks.count)")
          .font(.largeTitle)
          .fontWeight(.bold)
          .foregroundColor(.blue)
        Text("🔥\\(data.totalPoints)积分")
          .font(.caption)
          .foregroundColor(.orange)
      }
      .frame(minWidth: 100)
      
      Divider()
      
      // 右侧任务列表
      VStack(alignment: .leading, spacing: 6) {
        ${taskItems}
      }
    }
    .padding()
  }
}
`;
  }
  
  /**
   * 渲染Large Widget
   * @param {WidgetData} data - 数据
   * @returns {string} SwiftUI代码
   */
  renderLarge(data) {
    const taskItems = data.tasks.map(task => `
      HStack {
        Text("${WIDGET_CONFIG.categoryIcons[task.category] || '📝'}")
          .font(.title2)
        VStack(alignment: .leading) {
          Text("${task.title}")
            .font(.body)
          Text("+${task.rewardPoints}积分")
            .font(.caption)
            .foregroundColor(.orange)
        }
        Spacer()
        if ${task.completed} {
          Image(systemName: "checkmark.circle.fill")
            .foregroundColor(.green)
        } else {
          Link(destination: URL(string: "littleleaders://checkin/${task.id}")!) {
            Image(systemName: "circle")
              .foregroundColor(.blue)
          }
        }
      }
      .padding(.vertical, 8)
    `).join('');
    
    return `
struct LargeTodayTaskView: View {
  let data: WidgetData
  
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      // 头部
      HStack {
        Text("🌟 \\(data.babyName) - 今日任务")
          .font(.headline)
        Spacer()
        Text("🔥\\(data.totalPoints)")
          .foregroundColor(.orange)
      }
      
      Divider()
      
      // 进度条
      ProgressView(value: Double(data.completedCount), total: Double(data.tasks.count))
        .tint(.blue)
      Text("已完成 \\(data.completedCount)/\\(data.tasks.count) 项任务")
        .font(.caption)
        .foregroundColor(.secondary)
      
      Divider()
      
      // 任务列表
      ScrollView {
        VStack(spacing: 4) {
          ${taskItems}
        }
      }
      
      Spacer()
      
      // 底部快捷操作
      HStack {
        Link(destination: URL(string: "littleleaders://quick-checkin")!) {
          Label("快速打卡", systemImage: "checkmark.circle")
            .font(.caption)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(16)
        }
        Spacer()
        Link(destination: URL(string: "littleleaders://all-tasks")!) {
          Label("查看全部", systemImage: "list.bullet")
            .font(.caption)
            .foregroundColor(.blue)
        }
      }
    }
    .padding()
  }
}
`;
  }
  
  /**
   * 根据Family类型渲染
   * @param {string} family - Widget尺寸 family
   * @param {WidgetData} data - 数据
   * @returns {string}
   */
  render(family, data) {
    switch (family) {
      case 'systemSmall':
        return this.renderSmall(data);
      case 'systemMedium':
        return this.renderMedium(data);
      case 'systemLarge':
        return this.renderLarge(data);
      default:
        return this.renderSmall(data);
    }
  }
}

// ========== Widget Deep Link Handler ==========

/**
 * 处理Widget Deep Link
 * @param {string} url - 链接URL
 * @returns {Object} 处理结果
 */
function handleWidgetDeepLink(url) {
  const parsed = new URL(url);
  
  if (parsed.hostname === 'quick-checkin') {
    return {
      action: 'quick-checkin',
      route: '/pages/task/quick-checkin',
      params: {}
    };
  }
  
  if (parsed.hostname === 'checkin') {
    const taskId = parsed.pathname.replace('/', '');
    return {
      action: 'checkin',
      route: '/pages/task/checkin',
      params: { taskId }
    };
  }
  
  if (parsed.hostname === 'all-tasks') {
    return {
      action: 'all-tasks',
      route: '/pages/task/my-tasks',
      params: {}
    };
  }
  
  return null;
}

// ========== 导出 ==========

module.exports = {
  WIDGET_CONFIG,
  TodayTaskTimelineProvider,
  TodayTaskWidgetRenderer,
  handleWidgetDeepLink
};
