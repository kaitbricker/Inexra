import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  onClick,
  removable = false,
  onRemove,
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  const badgeClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const content = (
    <>
      {children}
      {removable && (
        <button
          type="button"
          className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-current hover:bg-current hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
        >
          <span className="sr-only">Remove</span>
          <svg
            className="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </>
  );

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      className={badgeClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {content}
    </motion.span>
  );
}

interface BadgeGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function BadgeGroup({ children, className = '' }: BadgeGroupProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {children}
    </div>
  );
}

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'online' | 'offline' | 'away' | 'busy';
}

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const statusConfig = {
    online: {
      variant: 'success' as const,
      label: 'Online',
    },
    offline: {
      variant: 'default' as const,
      label: 'Offline',
    },
    away: {
      variant: 'warning' as const,
      label: 'Away',
    },
    busy: {
      variant: 'error' as const,
      label: 'Busy',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      {...props}
    >
      <span className="relative flex h-2 w-2 mr-1.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75`} />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
      </span>
      {config.label}
    </Badge>
  );
} 