'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
  onClick?: () => void;
}

export function Avatar({
  src,
  alt = '',
  size = 'md',
  status,
  className = '',
  onClick,
}: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-14 w-14',
  };

  const statusColors = {
    online: 'bg-green-400',
    offline: 'bg-gray-400',
    away: 'bg-yellow-400',
    busy: 'bg-red-400',
  };

  const statusSizes = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-3.5 w-3.5',
  };

  const statusPositions = {
    sm: 'bottom-0 right-0',
    md: 'bottom-0 right-0',
    lg: 'bottom-0 right-0',
    xl: 'bottom-0 right-0',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const renderContent = () => {
    if (src) {
      return <img src={src} alt={alt} className="h-full w-full rounded-full object-cover" />;
    }

    if (alt) {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600">
          <span className="text-sm font-medium">{getInitials(alt)}</span>
        </div>
      );
    }

    return (
      <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100">
        <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative inline-block ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {renderContent()}
      {status && (
        <span
          className={`absolute ${statusPositions[size]} ${statusSizes[size]} ${statusColors[status]} rounded-full ring-2 ring-white`}
        />
      )}
    </motion.div>
  );
}

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  className?: string;
}

export function AvatarGroup({ children, max = 5, className = '' }: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const visibleAvatars = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleAvatars.map((child, index) => (
        <div key={index} className="inline-block" style={{ zIndex: visibleAvatars.length - index }}>
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600 ring-2 ring-white">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

interface AvatarStackProps {
  children: React.ReactNode;
  className?: string;
}

export function AvatarStack({ children, className = '' }: AvatarStackProps) {
  return (
    <div className={`flex flex-col -space-y-2 ${className}`}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className="inline-block"
          style={{ zIndex: React.Children.count(children) - index }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
