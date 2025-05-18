import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered' | 'flat';
  hoverEffect?: boolean;
}

export function Card({
  title,
  subtitle,
  children,
  footer,
  onClick,
  className = '',
  variant = 'default',
  hoverEffect = false,
}: CardProps) {
  const baseClasses = 'rounded-lg bg-white';
  const variantClasses = {
    default: 'shadow',
    elevated: 'shadow-lg',
    bordered: 'border border-gray-200',
    flat: '',
  };

  const hoverClasses = hoverEffect ? 'transition-transform duration-200 hover:scale-[1.02]' : '';

  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`;

  const content = (
    <>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">{footer}</div>
      )}
    </>
  );

  const cardContent = onClick ? (
    <button type="button" className="w-full text-left" onClick={onClick}>
      {content}
    </button>
  ) : (
    content
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={cardClasses}
    >
      {cardContent}
    </motion.div>
  );
}

interface CardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CardGrid({ children, columns = 3, gap = 'md', className = '' }: CardGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

interface CardListProps {
  children: React.ReactNode;
  className?: string;
}

export function CardList({ children, className = '' }: CardListProps) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}
