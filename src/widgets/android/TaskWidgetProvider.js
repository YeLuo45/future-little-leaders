/**
 * Android Widget - Task Widget Provider (App Widget)
 * 任务Widget提供者 - Android桌面小组件
 * 
 * 使用方式：
 * 1. 在AndroidManifest.xml中注册AppWidgetProvider
 * 2. 创建XML布局文件
 * 3. 实现TaskWidgetProvider类
 */

'use strict';

// ========== Widget 配置常量 ==========

const WIDGET_CONFIG = {
  // Widget基本信息
  kind: 'TaskWidgetProvider',
  displayName: '今日任务',
  description: '展示今日任务和快速打卡',
  
  // AppWidget配置
  appWidgetSizes: [
    { name: 'small', minWidth: 110, minHeight: 40 },
    { name: 'medium', minWidth: 180, minHeight: 110 },
    { name: 'large', minWidth: 250, minHeight: 180 }
  ],
  
  // 更新配置
  updateInterval: 15 * 60 * 1000, // 15分钟
  updateDuringQuietHours: false,
  
  // 分类图标
  categoryIcons: {
    study: 0x7F020001, // R.drawable.ic_study
    exercise: 0x7F020002, // R.drawable.ic_exercise
    habit: 0x7F020003  // R.drawable.ic_habit
  },
  
  // Deep Link配置
  deepLinks: {
    quickCheckin: 'littleleaders://quick-checkin',
    taskCheckin: 'littleleaders://checkin/{taskId}',
    allTasks: 'littleleaders://all-tasks'
  }
};

// ========== 数据模型 ==========

/**
 * @typedef {Object} AndroidTaskItem
 * @property {string} id - 任务ID
 * @property {string} title - 任务标题
 * @property {string} category - 任务分类
 * @property {number} rewardPoints - 奖励积分
 * @property {boolean} completed - 是否完成
 * @property {string} dueTime - 截止时间
 */

/**
 * @typedef {Object} WidgetUpdateData
 * @property {string} babyName - 宝宝名称
 * @property {AndroidTaskItem[]} tasks - 任务列表
 * @property {number} totalPoints - 总积分
 * @property {number} completedCount - 已完成数量
 * @property {string} lastUpdate - 最后更新时间
 */

// ========== RemoteViews 工厂 ==========

/**
 * Android RemoteViews 工厂类
 * 生成不同尺寸的Widget布局
 */
class RemoteViewsFactory {
  constructor() {
    this.layouts = {};
    this.data = null;
  }
  
  /**
   * 设置Widget数据
   * @param {WidgetUpdateData} data - Widget数据
   */
  setData(data) {
    this.data = data;
  }
  
  /**
   * 生成Small Widget RemoteViews
   * @returns {Object} RemoteViews配置
   */
  createSmallWidget() {
    return {
      layoutId: 'widget_task_small',
      views: {
        // 远程视图ID映射
        textBabyName: { id: 'text_baby_name', text: this.data?.babyName || '宝宝' },
        textTaskCount: { 
          id: 'text_task_count', 
          text: `${this.data?.completedCount || 0}/${this.data?.tasks?.length || 0}` 
        },
        textPoints: { id: 'text_points', text: `🔥 ${this.data?.totalPoints || 0}` },
        
        // 点击事件
        pendingIntent: {
          action: 'quick_checkin',
          uri: 'littleleaders://quick-checkin'
        }
      }
    };
  }
  
  /**
   * 生成Medium Widget RemoteViews
   * @returns {Object} RemoteViews配置
   */
  createMediumWidget() {
    const tasks = this.data?.tasks?.slice(0, 3) || [];
    
    return {
      layoutId: 'widget_task_medium',
      views: {
        // 头部信息
        textBabyName: { id: 'text_baby_name', text: this.data?.babyName || '宝宝' },
        textTaskCount: { 
          id: 'text_task_count', 
          text: `今日任务: ${this.data?.completedCount || 0}/${this.data?.tasks?.length || 0}` 
        },
        textPoints: { id: 'text_points', text: `🔥 ${this.data?.totalPoints || 0}积分` },
        
        // 任务列表
        taskItems: tasks.map((task, index) => ({
          id: `task_item_${index}`,
          title: task.title,
          category: task.category,
          icon: WIDGET_CONFIG.categoryIcons[task.category],
          completed: task.completed,
          pendingIntent: {
            action: task.completed ? 'view_task' : 'checkin_task',
            uri: `littleleaders://${task.completed ? 'task' : 'checkin'}/${task.id}`
          }
        })),
        
        // 按钮
        btnQuickCheckin: {
          id: 'btn_quick_checkin',
          pendingIntent: {
            action: 'quick_checkin',
            uri: 'littleleaders://quick-checkin'
          }
        }
      }
    };
  }
  
  /**
   * 生成Large Widget RemoteViews
   * @returns {Object} RemoteViews配置
   */
  createLargeWidget() {
    const tasks = this.data?.tasks || [];
    
    return {
      layoutId: 'widget_task_large',
      views: {
        // 头部
        header: {
          babyName: this.data?.babyName || '宝宝',
          totalPoints: this.data?.totalPoints || 0,
          completedCount: this.data?.completedCount || 0,
          totalCount: tasks.length,
          progress: tasks.length > 0 
            ? Math.round((this.data?.completedCount || 0) / tasks.length * 100) 
            : 0
        },
        
        // 任务列表（支持滚动）
        taskListView: {
          id: 'task_list',
          views: tasks.map((task, index) => ({
            id: `task_item_${index}`,
            title: task.title,
            category: task.category,
            icon: WIDGET_CONFIG.categoryIcons[task.category],
            rewardPoints: task.rewardPoints,
            completed: task.completed,
            dueTime: task.dueTime,
            pendingIntent: {
              action: task.completed ? 'view_task' : 'checkin_task',
              uri: `littleleaders://${task.completed ? 'task' : 'checkin'}/${task.id}`
            }
          }))
        },
        
        // 底部按钮
        buttons: [
          {
            id: 'btn_quick_checkin',
            text: '快速打卡',
            icon: 'ic_checkin',
            pendingIntent: {
              action: 'quick_checkin',
              uri: 'littleleaders://quick-checkin'
            }
          },
          {
            id: 'btn_all_tasks',
            text: '查看全部',
            icon: 'ic_list',
            pendingIntent: {
              action: 'all_tasks',
              uri: 'littleleaders://all-tasks'
            }
          }
        ]
      }
    };
  }
  
  /**
   * 根据尺寸创建RemoteViews
   * @param {string} size - 尺寸类型 small|medium|large
   * @returns {Object}
   */
  create(size) {
    switch (size) {
      case 'small':
        return this.createSmallWidget();
      case 'medium':
        return this.createMediumWidget();
      case 'large':
        return this.createLargeWidget();
      default:
        return this.createSmallWidget();
    }
  }
}

// ========== AppWidgetProvider 实现模板 ==========

/**
 * Android AppWidgetProvider 实现模板
 * 这是Kotlin/Java代码的JavaScript模板
 */
class TaskWidgetProvider {
  constructor() {
    this.factory = new RemoteViewsFactory();
    this.config = WIDGET_CONFIG;
  }
  
  /**
   * onUpdate 回调实现
   * @param {Object} context - Android Context
   * @param {Object} appWidgetManager - AppWidgetManager
   * @param {number[]} appWidgetIds - Widget ID数组
   */
  onUpdate(context, appWidgetManager, appWidgetIds) {
    appWidgetIds.forEach(appWidgetId => {
      // 获取Widget尺寸
      const options = appWidgetManager.getAppWidgetOptions(appWidgetId);
      const size = this.getSizeCategory(options);
      
      // 获取Widget数据
      const widgetData = this.getWidgetData();
      this.factory.setData(widgetData);
      
      // 创建RemoteViews
      const remoteViews = this.factory.create(size);
      
      // 设置Widget
      appWidgetManager.updateAppWidget(appWidgetId, remoteViews);
    });
  }
  
  /**
   * onReceive 广播处理
   * @param {Object} context - Android Context
   * @param {Object} intent - Intent对象
   */
  onReceive(context, intent) {
    const action = intent?.action;
    
    switch (action) {
      case 'quick_checkin':
        this.handleQuickCheckin(context, intent);
        break;
      case 'checkin_task':
        this.handleCheckinTask(context, intent);
        break;
      case 'view_task':
        this.handleViewTask(context, intent);
        break;
      case 'all_tasks':
        this.handleAllTasks(context, intent);
        break;
    }
  }
  
  /**
   * onDeleted 回调
   * @param {Object} context - Android Context
   * @param {number[]} appWidgetIds - 被删除的Widget ID数组
   */
  onDeleted(context, appWidgetIds) {
    // 清理Widget相关数据
    appWidgetIds.forEach(appWidgetId => {
      this.removeWidgetData(appWidgetId);
    });
  }
  
  /**
   * onEnabled 首次创建Widget时调用
   * @param {Object} context - Android Context
   */
  onEnabled(context) {
    // 初始化Widget数据存储
    this.initWidgetStorage();
  }
  
  /**
   * 处理快速打卡
   * @param {Object} context - Android Context
   * @param {Object} intent - Intent
   */
  handleQuickCheckin(context, intent) {
    // 打开快速打卡页面
    const pendingIntent = {
      flags: 0x10000000, // FLAG_ACTIVITY_NEW_TASK
      uri: 'littleleaders://quick-checkin'
    };
    
    // 发送广播或启动Activity
    return pendingIntent;
  }
  
  /**
   * 处理任务打卡
   * @param {Object} context - Android Context
   * @param {Object} intent - Intent
   */
  handleCheckinTask(context, intent) {
    const uri = intent?.uri;
    const taskId = this.extractTaskId(uri);
    
    if (taskId) {
      // 打开打卡确认页面
      return {
        flags: 0x10000000,
        uri: `littleleaders://checkin/${taskId}`
      };
    }
    
    return null;
  }
  
  /**
   * 处理查看任务
   * @param {Object} context - Android Context
   * @param {Object} intent - Intent
   */
  handleViewTask(context, intent) {
    return {
      flags: 0x10000000,
      uri: 'littleleaders://all-tasks'
    };
  }
  
  /**
   * 处理查看全部任务
   * @param {Object} context - Android Context
   * @param {Object} intent - Intent
   */
  handleAllTasks(context, intent) {
    return {
      flags: 0x10000000,
      uri: 'littleleaders://all-tasks'
    };
  }
  
  /**
   * 获取Widget尺寸分类
   * @param {Object} options - AppWidgetOptions
   * @returns {string}
   */
  getSizeCategory(options) {
    const minWidth = options?.minWidth || 0;
    const minHeight = options?.minHeight || 0;
    
    if (minWidth >= 250 && minHeight >= 180) {
      return 'large';
    } else if (minWidth >= 180 && minHeight >= 110) {
      return 'medium';
    }
    return 'small';
  }
  
  /**
   * 从URI提取任务ID
   * @param {string} uri - URI字符串
   * @returns {string|null}
   */
  extractTaskId(uri) {
    if (!uri) return null;
    const match = uri.match(/\/checkin\/([^\/]+)/);
    return match ? match[1] : null;
  }
  
  /**
   * 获取Widget数据（从数据源）
   * @returns {WidgetUpdateData}
   */
  getWidgetData() {
    // TODO: 从本地存储或网络获取真实数据
    return {
      babyName: '小明',
      tasks: [
        { id: '1', title: '完成数学作业', category: 'study', rewardPoints: 10, completed: false, dueTime: '18:00' },
        { id: '2', title: '户外运动30分钟', category: 'exercise', rewardPoints: 15, completed: false, dueTime: '17:00' },
        { id: '3', title: '整理房间', category: 'habit', rewardPoints: 5, completed: true, dueTime: '20:00' }
      ],
      totalPoints: 100,
      completedCount: 1,
      lastUpdate: new Date().toISOString()
    };
  }
  
  /**
   * 初始化Widget数据存储
   */
  initWidgetStorage() {
    // TODO: 初始化SharedPreferences或数据库
  }
  
  /**
   * 移除Widget数据
   * @param {number} appWidgetId - Widget ID
   */
  removeWidgetData(appWidgetId) {
    // TODO: 清理该Widget的数据
  }
}

// ========== XML布局模板 ==========

/**
 * Widget XML布局模板
 */
const WIDGET_XML_LAYOUTS = {
  small: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="8dp"
    android:background="@drawable/widget_background">
    
    <TextView
        android:id="@+id/text_baby_name"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:textSize="12sp"
        android:textStyle="bold" />
    
    <TextView
        android:id="@+id/text_task_count"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:gravity="center"
        android:textSize="24sp"
        android:textColor="#2196F3" />
    
    <TextView
        android:id="@+id/text_points"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:textSize="10sp"
        android:textColor="#FF9800" />
    
</LinearLayout>`,

  medium: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="horizontal"
    android:padding="12dp"
    android:background="@drawable/widget_background">
    
    <!-- 左侧统计 -->
    <LinearLayout
        android:layout_width="0dp"
        android:layout_height="match_parent"
        android:layout_weight="1"
        android:orientation="vertical">
        
        <TextView
            android:id="@+id/text_baby_name"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:textSize="14sp"
            android:textStyle="bold" />
        
        <TextView
            android:id="@+id/text_task_count"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:textSize="12sp"
            android:textColor="#666666" />
        
        <TextView
            android:id="@+id/text_points"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:textSize="16sp"
            android:textColor="#FF9800" />
        
        <Button
            android:id="@+id/btn_quick_checkin"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:text="快速打卡"
            android:textSize="12sp" />
            
    </LinearLayout>
    
    <!-- 右侧任务列表 -->
    <ListView
        android:id="@+id/list_tasks"
        android:layout_width="0dp"
        android:layout_height="match_parent"
        android:layout_weight="1" />
    
</LinearLayout>`,

  large: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="12dp"
    android:background="@drawable/widget_background">
    
    <!-- 头部 -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal">
        
        <TextView
            android:id="@+id/text_header"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:textSize="16sp"
            android:textStyle="bold" />
        
        <TextView
            android:id="@+id/text_points"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textSize="14sp"
            android:textColor="#FF9800" />
            
    </LinearLayout>
    
    <!-- 进度条 -->
    <ProgressBar
        android:id="@+id/progress_bar"
        style="@android:style/Widget.ProgressBar.Horizontal"
        android:layout_width="match_parent"
        android:layout_height="8dp"
        android:layout_marginTop="8dp"
        android:max="100"
        android:progress="30" />
    
    <TextView
        android:id="@+id/text_progress"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:textSize="10sp"
        android:textColor="#666666" />
    
    <!-- 任务列表 -->
    <ListView
        android:id="@+id/list_tasks"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:layout_marginTop="8dp" />
    
    <!-- 底部按钮 -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:layout_marginTop="8dp">
        
        <Button
            android:id="@+id/btn_quick_checkin"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="快速打卡"
            android:textSize="12sp" />
            
        <Button
            android:id="@+id/btn_all_tasks"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="查看全部"
            android:textSize="12sp" />
            
    </LinearLayout>
    
</LinearLayout>`
};

// ========== AndroidManifest.xml 配置模板 ==========

/**
 * AndroidManifest.xml Widget注册模板
 */
const MANIFEST_TEMPLATE = `<!-- Widget Provider 注册 -->
<receiver
    android:name=".widget.TaskWidgetProvider"
    android:exported="true"
    android:label="@string/widget_task_name"
    android:resizeMode="horizontal|vertical"
    android:targetCellWidth="2"
    android:targetCellHeight="2"
    android:minWidth="110dp"
    android:minHeight="40dp">
    
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    
    <intent-filter>
        <action android:name="littleleaders.QUICK_CHECKIN" />
        <action android:name="littleleaders.CHECKIN_TASK" />
        <action android:name="littleleaders.VIEW_TASK" />
        <action android:name="littleleaders.ALL_TASKS" />
    </intent-filter>
    
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/task_widget_info" />
        
</receiver>`;

// ========== 导出 ==========

module.exports = {
  WIDGET_CONFIG,
  RemoteViewsFactory,
  TaskWidgetProvider,
  WIDGET_XML_LAYOUTS,
  MANIFEST_TEMPLATE
};
