import { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

/**
 * Component Skeleton Loader
 * Used as fallback while lazy-loaded components are loading
 */
function ComponentSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-card">
            <div className="p-6 space-y-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-8 w-[140px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </Card>
        
        <Card className="glass-card">
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-[150px]" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Page Skeleton Loader
 * More lightweight skeleton for page-level loading
 */
function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-[300px]" />
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

/**
 * Card Skeleton Loader
 * For individual cards
 */
function CardSkeleton() {
  return (
    <Card className="glass-card">
      <div className="p-6 space-y-3">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-3 w-[80px]" />
      </div>
    </Card>
  );
}

interface LazyLoadOptions {
  /**
   * Custom fallback component to show while loading
   */
  fallback?: React.ReactNode;
  
  /**
   * Type of skeleton to use: 'component', 'page', or 'card'
   * @default 'component'
   */
  skeletonType?: 'component' | 'page' | 'card';
  
  /**
   * Minimum time to show the loading state (in ms)
   * Prevents flashing for very fast loads
   * @default 300
   */
  minLoadTime?: number;
}

/**
 * Lazy load a component with automatic skeleton fallback
 * 
 * @param importFn - Dynamic import function
 * @param options - Configuration options
 * @returns Component wrapped with lazy loading and suspense
 * 
 * @example
 * // Basic usage
 * const Dashboard = lazyLoadComponent(() => import('./pages/Dashboard'));
 * 
 * @example
 * // With custom skeleton type
 * const Projecten = lazyLoadComponent(
 *   () => import('./pages/Projecten'),
 *   { skeletonType: 'page' }
 * );
 * 
 * @example
 * // With custom fallback
 * const Klanten = lazyLoadComponent(
 *   () => import('./pages/Klanten'),
 *   { fallback: <div>Loading customers...</div> }
 * );
 */
export const lazyLoadComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) => {
  const {
    fallback,
    skeletonType = 'component',
    minLoadTime = 300
  } = options;

  // Create the lazy component
  const LazyComponent = lazy(() => {
    const start = Date.now();
    
    return importFn().then(module => {
      const elapsed = Date.now() - start;
      const remaining = minLoadTime - elapsed;
      
      // If load was too fast, add artificial delay to prevent flashing
      if (remaining > 0) {
        return new Promise(resolve => {
          setTimeout(() => resolve(module), remaining);
        });
      }
      
      return module;
    });
  });

  // Return the wrapped component
  return (props: any) => {
    let defaultFallback;
    
    switch (skeletonType) {
      case 'page':
        defaultFallback = <PageSkeleton />;
        break;
      case 'card':
        defaultFallback = <CardSkeleton />;
        break;
      case 'component':
      default:
        defaultFallback = <ComponentSkeleton />;
        break;
    }

    return (
      <Suspense fallback={fallback || defaultFallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
};

/**
 * Preload a lazy component
 * Useful for prefetching routes or components before they're needed
 * 
 * @example
 * // Preload on hover
 * <Link 
 *   to="/dashboard" 
 *   onMouseEnter={() => preloadComponent(() => import('./pages/Dashboard'))}
 * >
 *   Dashboard
 * </Link>
 */
export const preloadComponent = (importFn: () => Promise<any>) => {
  importFn().catch(() => {
    // Silently catch errors during preload
    // The actual load will handle errors properly
  });
};

/**
 * Export skeleton components for direct use
 */
export { ComponentSkeleton, PageSkeleton, CardSkeleton };
