/**
 * V28 Accessibility Utilities - 无障碍辅助功能工具集
 * 提供 ARIA 标签、键盘导航、屏幕阅读器优化等功能
 */

// 检测系统是否启用高对比度模式
export function prefersHighContrast() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-contrast: more)').matches || false
}

// 检测系统是否启用减少动画模式
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false
}

// 键盘事件处理 - Enter/Space 触发按钮
export function handleKeyboardActivate(callback) {
  return (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      callback(event)
    }
  }
}

// Escape 关闭弹窗
export function handleEscapeKey(callback) {
  return (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      callback(event)
    }
  }
}

// Tab 键导航处理 - 确保在指定范围内循环
export function trapFocus(containerRef) {
  const focusableElements = () => {
    if (!containerRef?.value) return []
    const selector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '.focusable'
    ].join(',')
    return Array.from(containerRef.value.querySelectorAll(selector))
  }

  const handleTrap = (event) => {
    if (event.key !== 'Tab') return
    
    const focusables = focusableElements()
    if (focusables.length === 0) return
    
    const firstFocusable = focusables[0]
    const lastFocusable = focusables[focusables.length - 1]
    
    if (event.shiftKey && document.activeElement === firstFocusable) {
      event.preventDefault()
      lastFocusable.focus()
    } else if (!event.shiftKey && document.activeElement === lastFocusable) {
      event.preventDefault()
      firstFocusable.focus()
    }
  }

  return {
    onMounted() {
      document.addEventListener('keydown', handleTrap)
      // 初始聚焦到第一个元素
      setTimeout(() => {
        const focusables = focusableElements()
        if (focusables.length > 0) {
          focusables[0].focus()
        }
      }, 100)
    },
    onUnmounted() {
      document.removeEventListener('keydown', handleTrap)
    }
  }
}

// 生成唯一的 ARIA ID
let ariaIdCounter = 0
export function generateAriaId(prefix = 'aria') {
  return `${prefix}-${++ariaIdCounter}`
}

// 为动态内容创建 aria-live 区域
export function createAriaLiveRegion(liveRegionRef, politeness = 'polite') {
  return {
    announce(message, priority = 'polite') {
      if (!liveRegionRef?.value) return
      
      const level = priority === 'assertive' ? 'aria-live="assertive"' : `aria-live="${politeness}"`
      liveRegionRef.value.setAttribute('aria-live', priority)
      liveRegionRef.value.textContent = ''
      
      // 延迟一下让屏幕阅读器检测到变化
      setTimeout(() => {
        liveRegionRef.value.textContent = message
      }, 100)
    },
    clear() {
      if (liveRegionRef?.value) {
        liveRegionRef.value.textContent = ''
      }
    }
  }
}

// 表单验证错误关联 - aria-describedby
export function connectFormError(inputId, errorId) {
  const input = document.getElementById(inputId)
  const error = document.getElementById(errorId)
  
  if (input && error) {
    const existing = input.getAttribute('aria-describedby') || ''
    const ids = existing.split(' ').filter(Boolean)
    if (!ids.includes(errorId)) {
      ids.push(errorId)
      input.setAttribute('aria-describedby', ids.join(' '))
    }
  }
}

// 按钮点击状态 - aria-pressed
export function toggleButtonPressed(buttonRef) {
  if (!buttonRef?.value) return false
  
  const isPressed = buttonRef.value.getAttribute('aria-pressed') === 'true'
  buttonRef.value.setAttribute('aria-pressed', !isPressed)
  return !isPressed
}

// 展开/折叠状态 - aria-expanded
export function toggleExpanded(elementRef) {
  if (!elementRef?.value) return false
  
  const isExpanded = elementRef.value.getAttribute('aria-expanded') === 'true'
  elementRef.value.setAttribute('aria-expanded', !isExpanded)
  return !isExpanded
}

// 设置选中状态 - aria-selected
export function setSelected(elementRef, selected) {
  if (!elementRef?.value) return
  elementRef.value.setAttribute('aria-selected', selected)
}

// 设置禁用状态 - aria-disabled
export function setDisabled(elementRef, disabled) {
  if (!elementRef?.value) return
  elementRef.value.setAttribute('aria-disabled', disabled)
  if (disabled) {
    elementRef.value.setAttribute('tabindex', '-1')
  } else {
    elementRef.value.removeAttribute('tabindex')
  }
}

// 图片加载失败处理 - 更新 alt 文本
export function handleImageError(imgRef, fallbackText = '图片加载失败') {
  if (!imgRef?.value) return
  imgRef.value.setAttribute('alt', fallbackText)
  imgRef.value.setAttribute('role', 'img')
}

// 隐藏装饰性元素 - aria-hidden
export function markAsDecorative(elementRef) {
  if (!elementRef?.value) return
  elementRef.value.setAttribute('aria-hidden', 'true')
}

// 检查元素是否可见（辅助屏幕阅读器）
export function isVisible(element) {
  if (!element) return false
  const style = window.getComputedStyle(element)
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         element.getAttribute('aria-hidden') !== 'true'
}

// 获取最佳焦点管理策略
export function getFocusManagement() {
  return {
    // 聚焦到元素
    focus(element, options = {}) {
      if (!element) return
      element.focus(options)
      // 确保在视口中可见
      element.scrollIntoView({ block: 'center', behavior: 'smooth' })
    },
    
    // 聚焦到第一个可聚焦子元素
    focusFirst(container) {
      if (!container) return
      const focusable = container.querySelector(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable) {
        focusable.focus()
      }
    },
    
    // 聚焦到最后一个可聚焦子元素
    focusLast(container) {
      if (!container) return
      const focusables = container.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusables.length > 0) {
        focusables[focusables.length - 1].focus()
      }
    }
  }
}

// 导出组合式 API 用法
export function useA11y() {
  return {
    prefersHighContrast,
    prefersReducedMotion,
    handleKeyboardActivate,
    handleEscapeKey,
    trapFocus,
    generateAriaId,
    createAriaLiveRegion,
    connectFormError,
    toggleButtonPressed,
    toggleExpanded,
    setSelected,
    setDisabled,
    handleImageError,
    markAsDecorative,
    isVisible,
    getFocusManagement
  }
}

export default {
  prefersHighContrast,
  prefersReducedMotion,
  handleKeyboardActivate,
  handleEscapeKey,
  trapFocus,
  generateAriaId,
  createAriaLiveRegion,
  connectFormError,
  toggleButtonPressed,
  toggleExpanded,
  setSelected,
  setDisabled,
  handleImageError,
  markAsDecorative,
  isVisible,
  getFocusManagement,
  useA11y
}
