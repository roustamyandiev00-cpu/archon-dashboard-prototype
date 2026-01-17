import { useEffect, useState } from "react";

/**
 * Custom hook for media query matching
 * @param query - CSS media query string
 * @returns boolean indicating if the media query matches
 * 
 * @example
 * const isDesktop = useMediaQuery("(min-width: 1024px)");
 * const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1024px)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Define callback
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } 
    // Fallback for older browsers
    else {
      // @ts-ignore - for older browsers
      mediaQuery.addListener(handler);
      // @ts-ignore - for older browsers
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}
