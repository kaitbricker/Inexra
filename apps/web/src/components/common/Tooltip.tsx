import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 0,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 -translate-y-2',
    right: 'left-full top-1/2 -translate-y-1/2 translate-x-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 translate-y-2',
    left: 'right-full top-1/2 -translate-y-1/2 -translate-x-2',
  };

  const arrowClasses = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-gray-900',
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-r-gray-900',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-gray-900',
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-l-gray-900',
  };

  const variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
      x: position === 'left' ? 10 : position === 'right' ? -10 : 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
    },
  };

  return (
    <div
      ref={triggerRef}
      className="inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 ${positionClasses[position]} ${className}`}
            role="tooltip"
          >
            <div className="relative bg-gray-900 text-white text-sm py-1 px-2 rounded shadow-lg">
              {content}
              <div
                className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TooltipGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function TooltipGroup({ children, className = '' }: TooltipGroupProps) {
  return <div className={`inline-flex items-center space-x-2 ${className}`}>{children}</div>;
}

interface TooltipTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function TooltipTrigger({ children, className = '' }: TooltipTriggerProps) {
  return <div className={`inline-block ${className}`}>{children}</div>;
}

interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
}

export function TooltipContent({ children, className = '' }: TooltipContentProps) {
  return <div className={`inline-block ${className}`}>{children}</div>;
}
