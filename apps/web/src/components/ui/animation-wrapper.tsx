'use client';

import { ReactNode, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGPUAcceleration, animationPresets, type AnimationConfig } from './animation-utils';

interface AnimationWrapperProps {
  children: ReactNode;
  config?: AnimationConfig;
  className?: string;
  onAnimationComplete?: () => void;
  isVisible?: boolean;
  interactive?: boolean;
  mobileOptimized?: boolean;
  preset?: keyof typeof animationPresets;
}

const defaultConfig: AnimationConfig = {
  type: 'fade',
  duration: 0.3,
  delay: 0,
  easing: 'easeInOut',
  direction: 'up',
  distance: 20,
  perspective: 1000,
  rotateX: 0,
  rotateY: 0,
  scale: 1,
  shadow: false,
  threshold: 0.1,
  once: true,
  amount: 0.3,
  bounce: 0.5,
  float: 10,
  flip: 180,
};

export function AnimationWrapper({
  children,
  config = defaultConfig,
  className,
  onAnimationComplete,
  isVisible = true,
  interactive = false,
  mobileOptimized = false,
  preset,
}: AnimationWrapperProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const ref = useRef<HTMLDivElement>(null);
  const { gpuStyle } = useGPUAcceleration();
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isDragging /* setIsDragging */] = useState(false);

  // Memoize the optimized config to prevent unnecessary re-renders
  const optimizedConfig = useMemo(() => {
    const baseConfig = preset ? animationPresets[preset] : config;
    const defaultValues = {
      duration: 0.3,
      delay: 0,
      perspective: 1000,
      stiffness: 300,
      damping: 30,
    };

    return {
      ...baseConfig,
      duration: mobileOptimized
        ? (baseConfig.duration || defaultValues.duration) * 0.7
        : baseConfig.duration || defaultValues.duration,
      delay: mobileOptimized
        ? (baseConfig.delay || defaultValues.delay) * 0.7
        : baseConfig.delay || defaultValues.delay,
      perspective: baseConfig.perspective || defaultValues.perspective,
      stiffness: baseConfig.stiffness || defaultValues.stiffness,
      damping: baseConfig.damping || defaultValues.damping,
    };
  }, [config, preset, mobileOptimized]);

  // Memoize the variants to prevent unnecessary re-renders
  const variants = useMemo(
    () => ({
      initial: { opacity: 0, y: 20 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          type: 'spring',
          stiffness: optimizedConfig.stiffness,
          damping: optimizedConfig.damping,
          duration: optimizedConfig.duration,
          delay: optimizedConfig.delay,
        },
      },
      exit: {
        opacity: 0,
        y: -20,
        transition: {
          duration: optimizedConfig.duration * 0.5,
        },
      },
    }),
    [optimizedConfig]
  );

  // Memoize the mouse move handler
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = event.clientX - centerX;
      const mouseY = event.clientY - centerY;

      const rotateX = (mouseY / (rect.height / 2)) * -10;
      const rotateY = (mouseX / (rect.width / 2)) * 10;

      ref.current.style.transform = `perspective(${optimizedConfig.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    },
    [interactive, optimizedConfig.perspective]
  );

  // Memoize the mouse leave handler
  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = `perspective(${optimizedConfig.perspective}px) rotateX(0deg) rotateY(0deg)`;
  }, [optimizedConfig.perspective]);

  // Memoize the touch handlers
  const handleTouchStart = useCallback(() => {
    if (!interactive || !ref.current) return;
    ref.current.style.transform = `perspective(${optimizedConfig.perspective}px) scale(0.95)`;
  }, [interactive, optimizedConfig.perspective]);

  const handleTouchEnd = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = `perspective(${optimizedConfig.perspective}px) scale(1)`;
  }, [optimizedConfig.perspective]);

  // Set up intersection observer
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Handle visibility changes
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(
        () => {
          setShouldRender(false);
        },
        optimizedConfig.duration ? optimizedConfig.duration * 1000 : 300
      );
      return () => clearTimeout(timer);
    }
  }, [isVisible, optimizedConfig.duration]);

  if (!shouldRender) return null;

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={isIntersecting ? 'animate' : 'initial'}
      exit="exit"
      variants={variants}
      onAnimationComplete={onAnimationComplete}
      className={className}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseLeave={interactive ? handleMouseLeave : undefined}
      onTouchStart={interactive ? handleTouchStart : undefined}
      onTouchEnd={interactive ? handleTouchEnd : undefined}
      style={{
        ...(interactive
          ? {
              transformStyle: 'preserve-3d',
              ...gpuStyle,
            }
          : gpuStyle),
        ...(isDragging && {
          cursor: 'grabbing',
        }),
      }}
    >
      {children}
    </motion.div>
  );
}

// Staggered animation wrapper for lists
export function StaggeredAnimationWrapper({
  children,
  config = defaultConfig,
  className,
  staggerDelay = 0.1,
  threshold = 0.1,
  mobileOptimized = false,
}: Omit<AnimationWrapperProps, 'onAnimationComplete' | 'isVisible'> & {
  staggerDelay?: number;
  threshold?: number;
  mobileOptimized?: boolean;
}) {
  const variants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: mobileOptimized ? staggerDelay * 0.7 : staggerDelay,
          delayChildren: mobileOptimized ? 0.05 : 0.1,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          type: 'spring',
          stiffness: config.stiffness || 300,
          damping: config.damping || 30,
        },
      },
    },
  };

  return (
    <motion.div
      variants={variants.container}
      initial="hidden"
      animate="visible"
      className={className}
      viewport={{ once: true, amount: threshold }}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div key={index} variants={variants.item}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={variants.item}>{children}</motion.div>
      )}
    </motion.div>
  );
}

// Hover animation wrapper for interactive elements
export function HoverAnimationWrapper({
  children,
  className,
  scale = 1.05,
  shadow = true,
  color,
  transition = { type: 'spring', stiffness: 400, damping: 10 },
  mobileOptimized = false,
}: Omit<AnimationWrapperProps, 'config' | 'onAnimationComplete' | 'isVisible'> & {
  scale?: number;
  shadow?: boolean;
  color?: string;
  transition?: Record<string, unknown>;
  mobileOptimized?: boolean;
}) {
  return (
    <motion.div
      whileHover={
        mobileOptimized
          ? undefined
          : {
              scale,
              boxShadow: shadow ? '0 10px 30px -10px rgba(0,0,0,0.2)' : undefined,
              color: color,
            }
      }
      whileTap={{ scale: 0.95 }}
      transition={mobileOptimized ? { duration: 0.1 } : transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Micro-interaction wrapper for feedback states
export function FeedbackAnimationWrapper({
  children,
  className,
  type = 'success',
  duration = 0.5,
  mobileOptimized = false,
}: Omit<AnimationWrapperProps, 'config' | 'onAnimationComplete' | 'isVisible'> & {
  type?: 'success' | 'error' | 'loading';
  duration?: number;
  mobileOptimized?: boolean;
}) {
  const variants = {
    success: {
      initial: { scale: 0 },
      animate: {
        scale: [0, 1.2, 1],
        transition: {
          duration: mobileOptimized ? duration * 0.7 : duration,
          times: [0, 0.6, 1],
          ease: 'easeOut',
        },
      },
    },
    error: {
      animate: {
        x: [0, -10, 10, -10, 10, 0],
        transition: {
          duration: mobileOptimized ? duration * 0.7 : duration,
          ease: 'easeInOut',
        },
      },
    },
    loading: {
      animate: {
        scale: [1, 1.1, 1],
        opacity: [1, 0.7, 1],
        transition: {
          duration: mobileOptimized ? duration * 0.7 : duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
  };

  return (
    <motion.div variants={variants[type]} initial="initial" animate="animate" className={className}>
      {children}
    </motion.div>
  );
}
