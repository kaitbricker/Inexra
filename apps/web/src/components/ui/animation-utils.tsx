'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

export type AnimationType =
  | 'fade'
  | 'slide'
  | 'scale'
  | 'spring'
  | 'parallax'
  | 'tilt'
  | 'modal'
  | 'flip'
  | 'float'
  | 'bounce'
  | 'scroll';

export interface AnimationConfig {
  type: AnimationType;
  duration?: number;
  delay?: number;
  easing?: string;
  stiffness?: number;
  damping?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  perspective?: number;
  rotateX?: number;
  rotateY?: number;
  scale?: number;
  shadow?: boolean;
  color?: string;
  threshold?: number;
  once?: boolean;
  amount?: number;
  bounce?: number;
  float?: number;
  flip?: number;
}

// GPU Acceleration Hook
export function useGPUAcceleration() {
  const [isGPUSupported, setIsGPUSupported] = useState(false);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setIsGPUSupported(!!gl);
  }, []);

  const gpuStyle = {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    perspective: '1000px',
    willChange: 'transform',
  };

  return { isGPUSupported, gpuStyle };
}

// Debounce Hook
export function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const newTimeoutId = setTimeout(() => {
        callback(...args);
      }, delay);
      setTimeoutId(newTimeoutId);
    }) as T,
    [callback, delay]
  );
}

// Animation Presets
export const animationPresets: Record<string, AnimationConfig> = {
  fade: {
    type: 'fade',
    duration: 0.3,
    delay: 0,
    easing: 'easeInOut',
  },
  slide: {
    type: 'slide',
    duration: 0.3,
    delay: 0,
    direction: 'up',
    distance: 20,
    stiffness: 300,
    damping: 30,
  },
  scale: {
    type: 'scale',
    duration: 0.3,
    delay: 0,
    scale: 1,
    stiffness: 400,
    damping: 20,
  },
  bounce: {
    type: 'bounce',
    duration: 0.3,
    delay: 0,
    bounce: 0.5,
    stiffness: 500,
    damping: 15,
  },
  tilt: {
    type: 'tilt',
    duration: 0.3,
    delay: 0,
    perspective: 1000,
    rotateX: 10,
    rotateY: 10,
  },
  modal: {
    type: 'modal',
    duration: 0.3,
    delay: 0,
    scale: 1,
    stiffness: 300,
    damping: 25,
  },
  flip: {
    type: 'flip',
    duration: 0.3,
    delay: 0,
    flip: 180,
    perspective: 1000,
  },
  float: {
    type: 'float',
    duration: 2,
    delay: 0,
    float: 10,
  },
};

// Custom AnimatePresence Component
interface CustomAnimatePresenceProps {
  children: React.ReactNode;
  initial?: boolean;
  onExitComplete?: () => void;
}

export const CustomAnimatePresence: React.FC<CustomAnimatePresenceProps> = ({
  children,
  initial = false,
  onExitComplete,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const { isGPUSupported, gpuStyle } = useGPUAcceleration();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(false);
      onExitComplete?.();
    }, 300); // Match the exit animation duration
    return () => clearTimeout(timer);
  }, [onExitComplete]);

  if (isExiting) return null;

  return (
    <motion.div
      initial={initial ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
      style={isGPUSupported ? gpuStyle : undefined}
    >
      {children}
    </motion.div>
  );
};

// Breakpoint Hook
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else setBreakpoint('xl');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

// Animation Cache Hook
export function useAnimationCache() {
  const cache = new Map<string, boolean>();

  const getCachedState = useCallback((key: string) => {
    return cache.get(key);
  }, []);

  const setCachedState = useCallback((key: string, value: boolean) => {
    cache.set(key, value);
  }, []);

  return { getCachedState, setCachedState };
}

// Optimized Intersection Observer Hook
export function useOptimizedIntersectionObserver(options: IntersectionObserverInit) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observe = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  const unobserve = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, options);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options]);

  return { isIntersecting, isVisible, observe, unobserve };
}

// Gesture Detection Hook
export function useGestureDetection() {
  const [isLongPress, setIsLongPress] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(
    null
  );
  const [isPinching, setIsPinching] = useState(false);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  return {
    isLongPress,
    isSwiping,
    swipeDirection,
    isPinching,
    scale,
    isDragging,
    dragPosition,
  };
}

// Performance Monitor Hook
export function usePerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const [memoryUsage, setMemoryUsage] = useState(0);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }

      if ('memory' in performance) {
        setMemoryUsage((performance as any).memory.usedJSHeapSize / 1048576);
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return { fps, memoryUsage };
}

// Device Testing Hook
export function useDeviceTesting() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    hasTouch: false,
    hasReducedMotion: false,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      setDeviceInfo({
        isMobile: /mobile|android|iphone|ipad|ipod/i.test(userAgent),
        isTablet: /ipad|android(?!.*mobile)/i.test(userAgent),
        isDesktop: !/mobile|android|iphone|ipad|ipod/i.test(userAgent),
        hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        hasReducedMotion: mediaQuery.matches,
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  return deviceInfo;
}

// Breakpoint Animation Helper
export function getBreakpointAnimation(breakpoint: 'sm' | 'md' | 'lg' | 'xl') {
  const breakpointSettings = {
    sm: {
      distance: 10,
      scale: 0.95,
      stiffness: 200,
      damping: 20,
    },
    md: {
      distance: 15,
      scale: 0.97,
      stiffness: 300,
      damping: 25,
    },
    lg: {
      distance: 20,
      scale: 1,
      stiffness: 400,
      damping: 30,
    },
    xl: {
      distance: 25,
      scale: 1.02,
      stiffness: 500,
      damping: 35,
    },
  };

  return breakpointSettings[breakpoint];
}
