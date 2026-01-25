/**
 * Dashboard Performance Tracking
 * Tracks dashboard load times and component performance
 */

export interface PerformanceMetric {
  metric: string;
  value: number;
  timestamp: string;
  url?: string;
  userAgent?: string;
}

/**
 * Log dashboard load performance
 */
export const logDashboardLoad = (loadTime: number) => {
  console.log(`[Dashboard Performance] Initial load: ${loadTime}ms`);
  
  // Log to analytics in production
  if (import.meta.env.PROD) {
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: 'dashboard_load_time',
        value: loadTime,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    }).catch(console.error);
  }
};

/**
 * Log component render performance
 */
export const logComponentRender = (componentName: string, renderTime: number) => {
  console.log(`[Dashboard Performance] ${componentName} render: ${renderTime}ms`);
  
  if (import.meta.env.PROD) {
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: `component_render_${componentName.toLowerCase()}`,
        value: renderTime,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    }).catch(console.error);
  }
};

/**
 * Start performance measurement
 */
export const startPerformanceMeasure = () => {
  return performance.now();
};

/**
 * End performance measurement and log
 */
export const endPerformanceMeasure = (startTime: number, label: string) => {
  const duration = performance.now() - startTime;
  console.log(`[Dashboard Performance] ${label}: ${duration}ms`);
  return duration;
};
