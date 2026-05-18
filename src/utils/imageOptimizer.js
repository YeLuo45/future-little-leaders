/**
 * V27: Image Optimization Utility
 * Provides WebP detection, progressive loading, and lazy loading helpers
 */

/**
 * Check if browser supports WebP format
 * @returns {Promise<boolean>}
 */
export function supportsWebP() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0 && img.height > 0);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  });
}

/**
 * Get optimal image URL with WebP support
 * @param {string} url - Original image URL
 * @param {object} options - Optimization options
 * @returns {string}
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url) return url;
  
  const { width, height, quality = 80 } = options;
  
  // If already a data URI or external URL, return as-is
  if (url.startsWith('data:') || url.startsWith('http')) {
    return url;
  }
  
  // V27: For local images, append query params for optimization
  const separator = url.includes('?') ? '&' : '?';
  let optimizedUrl = url;
  
  if (width) optimizedUrl += `${separator}w=${width}`;
  if (height) optimizedUrl += `${separator}h=${height}`;
  if (quality) optimizedUrl += `${separator}q=${quality}`;
  
  return optimizedUrl;
}

/**
 * V27: Intersection Observer based lazy loading
 * @param {HTMLElement} element - Target element
 * @param {Function} callback - Callback when element is visible
 * @param {object} options - Observer options
 * @returns {Function} - Cleanup function
 */
export function createLazyObserver(element, callback, options = {}) {
  if (typeof IntersectionObserver === 'undefined') {
    // Fallback: execute immediately
    callback();
    return () => {};
  }
  
  const defaultOptions = {
    root: null,
    rootMargin: '50px 0px', // Start loading 50px before viewport
    threshold: 0
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback();
        observer.unobserve(element);
      }
    });
  }, { ...defaultOptions, ...options });
  
  observer.observe(element);
  
  return () => observer.disconnect();
}

/**
 * V27: Progressive image loading with blur placeholder
 * @param {string} src - Image source
 * @param {string} placeholderSrc - Low quality placeholder
 * @returns {object} - Image state handlers
 */
export function createProgressiveImage(src, placeholderSrc = '') {
  const state = {
    isLoaded: false,
    isError: false,
    currentSrc: placeholderSrc
  };
  
  const loadImage = () => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        state.isLoaded = true;
        state.currentSrc = src;
        resolve();
      };
      img.onerror = (err) => {
        state.isError = true;
        reject(err);
      };
      img.src = src;
    });
  };
  
  return {
    state,
    loadImage,
    // Returns CSS class for transition
    getImageClass: () => {
      if (state.isError) return 'img-error';
      if (state.isLoaded) return 'img-loaded img-progressive';
      return 'img-loading';
    }
  };
}

/**
 * V27: Debounce utility for runtime performance
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * V27: Throttle utility for runtime performance
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Minimum interval in ms
 * @returns {Function}
 */
export function throttle(fn, limit = 300) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * V27: Virtual scroll position calculator
 * @param {number} scrollTop - Current scroll position
 * @param {number} itemHeight - Height of each item
 * @param {number} containerHeight - Visible container height
 * @param {number} buffer - Extra items to render
 * @returns {object} - { startIndex, endIndex, offsetY }
 */
export function calculateVirtualScroll(scrollTop, itemHeight, containerHeight, buffer = 3) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + buffer * 2, Infinity);
  const offsetY = startIndex * itemHeight;
  
  return { startIndex, endIndex, offsetY };
}
