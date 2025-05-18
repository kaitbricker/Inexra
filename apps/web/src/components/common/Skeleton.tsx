import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  height?: number | string;
  width?: number | string;
}

export function Skeleton({
  className = '',
  variant = 'text',
  animation = 'pulse',
  height,
  width,
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: '',
  };

  const style = {
    height: height || (variant === 'text' ? '1em' : '100%'),
    width: width || (variant === 'text' ? '100%' : '100%'),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

interface SkeletonTextProps extends Omit<SkeletonProps, 'variant'> {
  lines?: number;
  spacing?: number | string;
}

export function SkeletonText({
  lines = 3,
  spacing = '0.5rem',
  className = '',
  ...props
}: SkeletonTextProps) {
  return (
    <div className={`space-y-[${spacing}] ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          className={index === lines - 1 ? 'w-3/4' : ''}
          {...props}
        />
      ))}
    </div>
  );
}

interface SkeletonAvatarProps extends Omit<SkeletonProps, 'variant'> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function SkeletonAvatar({ size = 'md', className = '', ...props }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-14 w-14',
  };

  return <Skeleton variant="circular" className={`${sizeClasses[size]} ${className}`} {...props} />;
}

interface SkeletonImageProps extends Omit<SkeletonProps, 'variant'> {
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
}

export function SkeletonImage({
  aspectRatio = 'square',
  className = '',
  ...props
}: SkeletonImageProps) {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  return (
    <Skeleton
      variant="rectangular"
      className={`${aspectRatioClasses[aspectRatio]} ${className}`}
      {...props}
    />
  );
}

interface SkeletonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function SkeletonGroup({ children, className = '' }: SkeletonGroupProps) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

interface SkeletonStackProps {
  children: React.ReactNode;
  className?: string;
}

export function SkeletonStack({ children, className = '' }: SkeletonStackProps) {
  return <div className={`flex flex-col space-y-4 ${className}`}>{children}</div>;
}
