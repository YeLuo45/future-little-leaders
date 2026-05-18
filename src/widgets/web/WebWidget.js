/**
 * Web Widget - Cross-Platform Embeddable Widget
 * Web Widget - 可嵌入任何网页的小组件件
 * 
 * 功能：
 * 1. 独立运行的Web Component
 * 2. 支持嵌入到任何网页
 * 3. 数据通过postMessage通信
 * 4. 主题自适应
 */

'use strict';

// ========== Widget 配置 ==========

const WEB_WIDGET_CONFIG = {
  name: 'LittleLeadersWebWidget',
  version: '1.0.0',
  
  // 默认尺寸
  defaultSize: {
    width: 320,
    height: 400
  },
  
  // 支持的尺寸
  sizes: {
    compact: { width: 280, height: 200 },
    standard: { width: 320, height: 400 },
    large: { width: 400, height: 500 }
  },
  
  // 主题配置
  themes: {
    light: {
      background: '#ffffff',
      text: '#333333',
      primary: '#2196F3',
      secondary: '#FF9800',
      success: '#4CAF50',
      border: '#E0E0E0'
    },
    dark: {
      background: '#1E1E1E',
      text: '#FFFFFF',
      primary: '#64B5F6',
      secondary: '#FFB74D',
      success: '#81C784',
      border: '#424242'
    }
  },
  
  // 事件类型
  events: {
    READY: 'little-leaders:ready',
    TASK_CHECKIN: 'little-leaders:task-checkin',
    QUICK_CHECKIN: 'little-leaders:quick-checkin',
    OPEN_APP: 'little-leaders:open-app',
    ERROR: 'little-leaders:error'
  },
  
  // 分类图标
  categoryIcons: {
    study: '📚',
    exercise: '🏃',
    habit: '✨'
  },
  
  // Deep Link基础
  deepLinkBase: 'littleleaders://'
};

// ========== 任务数据模型 ==========

/**
 * @typedef {Object} WebTaskItem
 * @property {string} id - 任务ID
 * @property {string} title - 任务标题
 * @property {string} category - 分类
 * @property {number} rewardPoints - 积分
 * @property {boolean} completed - 是否完成
 * @property {string} dueTime - 截止时间
 */

/**
 * @typedef {Object} WebWidgetData
 * @property {string} babyName - 宝宝名称
 * @property {WebTaskItem[]} tasks - 任务列表
 * @property {number} totalPoints - 总积分
 * @property {number} completedCount - 已完成数
 */

// ========== Web Widget 核心类 ==========

/**
 * Web Widget 类
 * 实现Web Component规范
 */
class LittleLeadersWebWidget extends HTMLElement {
  constructor() {
    super();
    
    // Shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // 配置
    this._config = {
      size: 'standard',
      theme: 'light',
      babyId: null,
      showHeader: true,
      showFooter: true
    };
    
    // 数据
    this._data = null;
    
    // 状态
    this._isReady = false;
  }
  
  // ========== 生命周期 ==========
  
  /**
   * 组件初始化
   */
  connectedCallback() {
    this._render();
    this._bindEvents();
    
    // 通知准备就绪
    setTimeout(() => {
      this._isReady = true;
      this._emit(WEB_WIDGET_CONFIG.events.READY, { version: WEB_WIDGET_CONFIG.version });
    }, 0);
  }
  
  /**
   * 组件销毁
   */
  disconnectedCallback() {
    this._unbindEvents();
  }
  
  /**
   * 属性变化监听
   */
  static get observedAttributes() {
    return ['size', 'theme', 'baby-id', 'show-header', 'show-footer'];
  }
  
  /**
   * 属性变化处理
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'size':
        this._config.size = newValue;
        break;
      case 'theme':
        this._config.theme = newValue;
        break;
      case 'baby-id':
        this._config.babyId = newValue;
        break;
      case 'show-header':
        this._config.showHeader = newValue !== 'false';
        break;
      case 'show-footer':
        this._config.showFooter = newValue !== 'false';
        break;
    }
    
    if (this._isReady) {
      this._render();
    }
  }
  
  // ========== 公开API ==========
  
  /**
   * 设置Widget数据
   * @param {WebWidgetData} data - 组件数据
   */
  setData(data) {
    this._data = data;
    this._updateContent();
  }
  
  /**
   * 获取组件数据
   * @returns {WebWidgetData}
   */
  getData() {
    return this._data;
  }
  
  /**
   * 更新主题
   * @param {string} theme - 主题名称
   */
  setTheme(theme) {
    this._config.theme = theme;
    this._applyTheme();
  }
  
  /**
   * 更新尺寸
   * @param {string} size - 尺寸名称
   */
  setSize(size) {
    this._config.size = size;
    this._applySize();
  }
  
  /**
   * 刷新数据
   */
  async refresh() {
    // 触发刷新事件，让外部处理数据获取
    this._emit(WEB_WIDGET_CONFIG.events.READY, { action: 'refresh' });
  }
  
  /**
   * 销毁组件
   */
  destroy() {
    this._unbindEvents();
    this.shadowRoot.innerHTML = '';
    this._isReady = false;
  }
  
  // ========== 私有方法 ==========
  
  /**
   * 渲染组件
   */
  _render() {
    const theme = WEB_WIDGET_CONFIG.themes[this._config.theme];
    const size = WEB_WIDGET_CONFIG.sizes[this._config.size] || WEB_WIDGET_CONFIG.defaultSize;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: ${size.width}px;
          height: ${size.height}px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .widget-container {
          width: 100%;
          height: 100%;
          background: ${theme.background};
          border: 1px solid ${theme.border};
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        ${this._config.showHeader ? `
        .widget-header {
          padding: 12px 16px;
          background: ${theme.primary};
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .widget-header .title {
          font-size: 14px;
          font-weight: 600;
        }
        
        .widget-header .points {
          font-size: 12px;
          opacity: 0.9;
        }
        ` : ''}
        
        .widget-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }
        
        .task-item {
          display: flex;
          align-items: center;
          padding: 10px;
          margin-bottom: 8px;
          background: ${theme.background};
          border: 1px solid ${theme.border};
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .task-item:hover {
          border-color: ${theme.primary};
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }
        
        .task-item.completed {
          opacity: 0.7;
        }
        
        .task-icon {
          font-size: 24px;
          margin-right: 12px;
        }
        
        .task-content {
          flex: 1;
        }
        
        .task-title {
          font-size: 14px;
          color: ${theme.text};
          margin-bottom: 4px;
        }
        
        .task-meta {
          font-size: 12px;
          color: ${theme.secondary};
        }
        
        .task-check {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid ${theme.border};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        
        .task-item.completed .task-check {
          background: ${theme.success};
          border-color: ${theme.success};
          color: white;
        }
        
        .widget-footer {
          padding: 12px 16px;
          border-top: 1px solid ${theme.border};
          display: flex;
          gap: 8px;
        }
        
        .widget-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .widget-btn.primary {
          background: ${theme.primary};
          color: white;
        }
        
        .widget-btn.primary:hover {
          opacity: 0.9;
        }
        
        .widget-btn.secondary {
          background: transparent;
          color: ${theme.primary};
          border: 1px solid ${theme.primary};
        }
        
        .widget-btn.secondary:hover {
          background: ${theme.primary}10;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: ${theme.text};
          opacity: 0.6;
        }
        
        .empty-state .icon {
          font-size: 48px;
          margin-bottom: 12px;
        }
        
        .progress-section {
          margin-bottom: 16px;
        }
        
        .progress-bar {
          height: 8px;
          background: ${theme.border};
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: ${theme.primary};
          transition: width 0.3s ease;
        }
        
        .progress-text {
          font-size: 12px;
          color: ${theme.text};
          opacity: 0.7;
          margin-top: 4px;
        }
        
        /* 滚动条样式 */
        .widget-body::-webkit-scrollbar {
          width: 4px;
        }
        
        .widget-body::-webkit-scrollbar-thumb {
          background: ${theme.border};
          border-radius: 2px;
        }
      </style>
      
      <div class="widget-container">
        ${this._config.showHeader ? `
        <div class="widget-header">
          <span class="title">🌟 ${this._data?.babyName || '加载中...'}</span>
          <span class="points">🔥 ${this._data?.totalPoints || 0}积分</span>
        </div>
        ` : ''}
        
        <div class="widget-body">
          ${this._renderBody(theme)}
        </div>
        
        ${this._config.showFooter ? `
        <div class="widget-footer">
          <button class="widget-btn primary" data-action="quick-checkin">快速打卡</button>
          <button class="widget-btn secondary" data-action="all-tasks">查看全部</button>
        </div>
        ` : ''}
      </div>
    `;
  }
  
  /**
   * 渲染内容区
   */
  _renderBody(theme) {
    if (!this._data) {
      return `
        <div class="empty-state">
          <div class="icon">📋</div>
          <div>正在加载任务...</div>
        </div>
      `;
    }
    
    const tasks = this._data.tasks || [];
    
    if (tasks.length === 0) {
      return `
        <div class="empty-state">
          <div class="icon">🎉</div>
          <div>今日任务已全部完成！</div>
        </div>
      `;
    }
    
    const progress = tasks.length > 0 
      ? Math.round((this._data.completedCount || 0) / tasks.length * 100) 
      : 0;
    
    const taskList = tasks.slice(0, 5).map(task => `
      <div class="task-item ${task.completed ? 'completed' : ''}" 
           data-task-id="${task.id}"
           data-action="${task.completed ? 'view-task' : 'checkin'}">
        <span class="task-icon">${WEB_WIDGET_CONFIG.categoryIcons[task.category] || '📝'}</span>
        <div class="task-content">
          <div class="task-title">${task.title}</div>
          <div class="task-meta">+${task.rewardPoints}积分 · ${task.dueTime || ''}</div>
        </div>
        <div class="task-check">${task.completed ? '✓' : ''}</div>
      </div>
    `).join('');
    
    return `
      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="progress-text">已完成 ${this._data.completedCount || 0}/${tasks.length} 项任务</div>
      </div>
      ${taskList}
    `;
  }
  
  /**
   * 更新内容（不重新渲染整个组件）
   */
  _updateContent() {
    if (!this._isReady) return;
    this._render();
  }
  
  /**
   * 应用主题
   */
  _applyTheme() {
    this._render();
  }
  
  /**
   * 应用尺寸
   */
  _applySize() {
    const size = WEB_WIDGET_CONFIG.sizes[this._config.size] || WEB_WIDGET_CONFIG.defaultSize;
    this.style.width = `${size.width}px`;
    this.style.height = `${size.height}px`;
  }
  
  /**
   * 绑定事件
   */
  _bindEvents() {
    // 任务项点击
    this.shadowRoot.addEventListener('click', (e) => {
      const taskItem = e.target.closest('.task-item');
      const btn = e.target.closest('.widget-btn');
      
      if (taskItem) {
        const taskId = taskItem.dataset.taskId;
        const action = taskItem.dataset.action;
        
        if (action === 'checkin') {
          this._handleTaskCheckin(taskId);
        } else {
          this._handleViewTask(taskId);
        }
      }
      
      if (btn) {
        const action = btn.dataset.action;
        
        if (action === 'quick-checkin') {
          this._handleQuickCheckin();
        } else if (action === 'all-tasks') {
          this._handleAllTasks();
        }
      }
    });
    
    // 监听来自外部的消息
    window.addEventListener('message', this._handleMessage.bind(this));
  }
  
  /**
   * 解绑事件
   */
  _unbindEvents() {
    window.removeEventListener('message', this._handleMessage.bind(this));
  }
  
  /**
   * 处理来自外部的消息
   */
  _handleMessage(event) {
    const { type, data } = event.data || {};
    
    switch (type) {
      case 'set-data':
        this.setData(data);
        break;
      case 'set-theme':
        this.setTheme(data);
        break;
      case 'refresh':
        this.refresh();
        break;
      case 'error':
        console.error('[LittleLeadersWidget] Error:', data);
        break;
    }
  }
  
  /**
   * 处理任务打卡
   */
  _handleTaskCheckin(taskId) {
    this._emit(WEB_WIDGET_CONFIG.events.TASK_CHECKIN, { taskId });
  }
  
  /**
   * 处理快速打卡
   */
  _handleQuickCheckin() {
    this._emit(WEB_WIDGET_CONFIG.events.QUICK_CHECKIN, {});
  }
  
  /**
   * 处理查看任务
   */
  _handleViewTask(taskId) {
    this._emit(WEB_WIDGET_CONFIG.events.OPEN_APP, { 
      action: 'view-task',
      taskId 
    });
  }
  
  /**
   * 处理查看全部
   */
  _handleAllTasks() {
    this._emit(WEB_WIDGET_CONFIG.events.OPEN_APP, { 
      action: 'all-tasks' 
    });
  }
  
  /**
   * 发送事件
   */
  _emit(eventType, data) {
    // 发送到父窗口
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: eventType, data }, '*');
    }
    
    // 触发内部事件
    this.dispatchEvent(new CustomEvent(eventType, { 
      detail: data,
      bubbles: true,
      composed: true
    }));
  }
}

// 注册Web Component
if (!customElements.get(WEB_WIDGET_CONFIG.name)) {
  customElements.define(WEB_WIDGET_CONFIG.name, LittleLeadersWebWidget);
}

// ========== Widget 初始化辅助函数 ==========

/**
 * 初始化并注入Widget脚本
 * @param {Object} options - 配置选项
 * @returns {Promise}
 */
async function initLittleLeadersWidget(options = {}) {
  const {
    containerId,
    size = 'standard',
    theme = 'light',
    babyId = null,
    apiEndpoint = null
  } = options;
  
  return new Promise((resolve, reject) => {
    try {
      // 检查是否已加载
      if (customElements.get(WEB_WIDGET_CONFIG.name)) {
        const widget = document.createElement(WEB_WIDGET_CONFIG.name);
        
        if (containerId) {
          const container = document.getElementById(containerId);
          if (container) {
            container.appendChild(widget);
          }
        } else {
          document.body.appendChild(widget);
        }
        
        // 设置属性
        widget.setAttribute('size', size);
        widget.setAttribute('theme', theme);
        if (babyId) {
          widget.setAttribute('baby-id', babyId);
        }
        
        // 如果有API端点，获取数据
        if (apiEndpoint) {
          fetchWidgetData(apiEndpoint, babyId)
            .then(data => widget.setData(data))
            .catch(err => console.warn('Failed to fetch widget data:', err));
        }
        
        resolve(widget);
        return;
      }
      
      // 等待组件定义
      customElements.whenDefined(WEB_WIDGET_CONFIG.name)
        .then(() => {
          const widget = initLittleLeadersWidget(options);
          resolve(widget);
        });
        
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 从API获取Widget数据
 * @param {string} endpoint - API端点
 * @param {string} babyId - 宝宝ID
 * @returns {Promise<WebWidgetData>}
 */
async function fetchWidgetData(endpoint, babyId) {
  try {
    const url = babyId ? `${endpoint}?baby_id=${babyId}` : endpoint;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[LittleLeadersWidget] Fetch error:', error);
    
    // 返回默认数据
    return {
      babyName: '小明',
      tasks: [
        { id: '1', title: '完成数学作业', category: 'study', rewardPoints: 10, completed: false, dueTime: '18:00' },
        { id: '2', title: '户外运动30分钟', category: 'exercise', rewardPoints: 15, completed: false, dueTime: '17:00' },
        { id: '3', title: '整理房间', category: 'habit', rewardPoints: 5, completed: true, dueTime: '20:00' }
      ],
      totalPoints: 100,
      completedCount: 1
    };
  }
}

// ========== 嵌入代码生成器 ==========

/**
 * 生成嵌入代码
 * @param {Object} options - 配置选项
 * @returns {string}
 */
function generateEmbedCode(options = {}) {
  const {
    size = 'standard',
    theme = 'light',
    babyId = '',
    position = 'right',
    margin = '20px'
  } = options;
  
  const positionStyles = {
    left: `left: ${margin}; bottom: ${margin};`,
    right: `right: ${margin}; bottom: ${margin};`,
    'bottom-left': `left: ${margin}; bottom: ${margin};`,
    'bottom-right': `right: ${margin}; bottom: ${margin};`
  };
  
  return `<!-- Little Leaders Widget -->
<div id="little-leaders-widget-container" style="position: fixed; ${positionStyles[position] || positionStyles.right}; z-index: 999999;"></div>

<script>
(function() {
  // 创建Widget元素
  var widget = document.createElement('little-leaders-web-widget');
  widget.setAttribute('size', '${size}');
  widget.setAttribute('theme', '${theme}');
  ${babyId ? `widget.setAttribute('baby-id', '${babyId}');` : ''}
  
  // 添加到容器
  var container = document.getElementById('little-leaders-widget-container');
  if (container) {
    container.appendChild(widget);
  } else {
    document.body.appendChild(widget);
  }
  
  // 监听事件
  widget.addEventListener('little-leaders:task-checkin', function(e) {
    console.log('Task checkin:', e.detail);
    // 处理任务打卡
    // window.location.href = 'littleleaders://checkin/' + e.detail.taskId;
  });
  
  widget.addEventListener('little-leaders:quick-checkin', function(e) {
    console.log('Quick checkin:', e.detail);
    // 处理快速打卡
    // window.location.href = 'littleleaders://quick-checkin';
  });
  
  widget.addEventListener('little-leaders:open-app', function(e) {
    console.log('Open app:', e.detail);
    // 打开App
    // window.location.href = 'littleleaders://all-tasks';
  });
  
  // 可选：从API加载数据
  // widget.setData({ babyName: '小明', tasks: [...], totalPoints: 100, completedCount: 2 });
})();
</script>`;
}

// ========== 导出 ==========

module.exports = {
  WEB_WIDGET_CONFIG,
  LittleLeadersWebWidget,
  initLittleLeadersWidget,
  generateEmbedCode,
  fetchWidgetData
};
