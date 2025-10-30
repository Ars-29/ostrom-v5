import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

const ScrollProgressContext = createContext(0);

// Throttle function to limit scroll event frequency
const throttle = (func: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastExecTime = 0;
  
  return (...args: any[]) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

export const ScrollProgressProvider = ({ children }: { children: React.ReactNode }) => {
    const [scrollProgress, setScrollProgress] = useState(0);

    // Memoize the scroll handler to prevent recreation on every render
    const handleScroll = useCallback(() => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
        setScrollProgress(progress);
    }, []);

    // Throttled scroll handler to improve performance
    const throttledScrollHandler = useMemo(
        () => throttle(handleScroll, 16), // ~60fps
        [handleScroll]
    );

    useEffect(() => {
        window.addEventListener('scroll', throttledScrollHandler, { passive: true });

        return () => {
            window.removeEventListener('scroll', throttledScrollHandler);
        };
    }, [throttledScrollHandler]);

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => scrollProgress, [scrollProgress]);

    return (
        <ScrollProgressContext.Provider value={contextValue}>
            {children}
        </ScrollProgressContext.Provider>
    );
};

export const useScrollProgress = () => {
    return useContext(ScrollProgressContext);
};