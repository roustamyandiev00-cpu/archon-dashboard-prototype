// Performance optimalisatie utilities voor ARCHON.AI

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as unknown as T;
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as unknown as T;
};

// Memoization helper
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: any[]) => string
): T => {
  const cache = new Map();

  return ((...args: any[]) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as unknown as T;
};

// Intersection Observer voor lazy loading
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  if (typeof IntersectionObserver === 'undefined') {
    // Fallback voor oudere browsers
    return {
      observe: () => { },
      unobserve: () => { },
      disconnect: () => { },
      root: null,
      rootMargin: '',
      thresholds: [],
      takeRecords: () => []
    };
  }

  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
};

// Image loading optimization
export const optimizeImageLoading = (img: HTMLImageElement) => {
  img.loading = 'eager';
  img.decoding = 'async';

  // Lazy loading voor images buiten viewport
  if ('loading' in HTMLImageElement.prototype) {
    img.loading = 'lazy';
  }
};

// Virtual scrolling helper
export const calculateVisibleItems = (
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  totalItems: number
): { startIndex: number; endIndex: number; visibleCount: number } => {
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer voor smooth scrolling
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1);
  const endIndex = Math.min(totalItems, startIndex + visibleCount);

  return { startIndex, endIndex, visibleCount };
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();

  if (import.meta.env.DEV) {
    console.log(`[Performance] ${name}: ${end - start}ms`);
  }

  return end - start;
};

// Resource loading optimization
export const preloadCriticalResources = () => {
  const criticalResources = [
    '/fonts/inter-var.woff2',
    '/images/ai-assistant-orb.png',
    '/icons/favicon.ico'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.woff2') ? 'font' : 'image';
    document.head.appendChild(link);
  });
};

// Service Worker registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Critical CSS inlining
export const inlineCriticalCSS = () => {
  const criticalCSS = `
    .glass-card { backdrop-filter: blur(20px); }
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6) infinite; }
  `;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);
};
