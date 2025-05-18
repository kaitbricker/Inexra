import React from 'react';
import { motion } from 'framer-motion';

type Status = 'active' | 'suspended' | 'pending';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  active: {
    color: 'bg-green-100 text-green-800',
    icon: (
      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
    ),
  },
  suspended: {
    color: 'bg-red-100 text-red-800',
    icon: (
      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
    ),
  },
  pending: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: (
      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
    ),
  },
} as const;

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}
    >
      <span className="mr-1.5">{config.icon}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </motion.span>
  );
}

interface StatusBadgeWithTooltipProps extends StatusBadgeProps {
  tooltip?: string;
}

export function StatusBadgeWithTooltip({ tooltip, ...props }: StatusBadgeWithTooltipProps) {
  return (
    <div className="group relative inline-block">
      <StatusBadge {...props} />
      {tooltip && (
        <div className="absolute z-10 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {tooltip}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
}

interface StatusBadgeWithUpdateProps extends StatusBadgeProps {
  onStatusChange?: (newStatus: Status) => void;
}

export function StatusBadgeWithUpdate({ onStatusChange, ...props }: StatusBadgeWithUpdateProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleClick = async () => {
    if (!onStatusChange) return;

    setIsUpdating(true);
    try {
      // Simulate status change animation
      await new Promise((resolve) => setTimeout(resolve, 500));
      onStatusChange(props.status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`cursor-pointer ${isUpdating ? 'opacity-50' : ''}`}
    >
      <StatusBadge {...props} />
    </motion.div>
  );
} 