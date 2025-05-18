import { useState, useRef, useEffect } from 'react';
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
  delay = 0.2,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = trigger.left + (trigger.width - tooltip.width) / 2;
        y = trigger.top - tooltip.height - 8;
        break;
      case 'right':
        x = trigger.right + 8;
        y = trigger.top + (trigger.height - tooltip.height) / 2;
        break;
      case 'bottom':
        x = trigger.left + (trigger.width - tooltip.width) / 2;
        y = trigger.bottom + 8;
        break;
      case 'left':
        x = trigger.left - tooltip.width - 8;
        y = trigger.top + (trigger.height - tooltip.height) / 2;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    x = Math.max(8, Math.min(x, viewport.width - tooltip.width - 8));
    y = Math.max(8, Math.min(y, viewport.height - tooltip.height - 8));

    setTooltipPosition({ x, y });
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, delay }}
            style={{
              position: 'fixed',
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              zIndex: 50,
            }}
            className={`bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg ${className}`}
          >
            {content}
            <div
              className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
                position === 'top'
                  ? 'bottom-[-4px] left-1/2 -translate-x-1/2'
                  : position === 'right'
                    ? 'left-[-4px] top-1/2 -translate-y-1/2'
                    : position === 'bottom'
                      ? 'top-[-4px] left-1/2 -translate-x-1/2'
                      : 'right-[-4px] top-1/2 -translate-y-1/2'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
