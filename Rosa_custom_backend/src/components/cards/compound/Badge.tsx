import React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  variant: {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-purple-100 text-purple-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    outline: 'text-gray-700 border border-gray-300',
  },
  size: {
    default: 'px-2.5 py-1 text-xs',
    sm: 'px-2 py-0.5 text-[10px]',
  },
};

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof badgeVariants['variant'];
  size?: keyof typeof badgeVariants['size'];
  icon?: React.ReactNode;
};

const Badge = ({ children, className, variant = 'default', size = 'default', icon }: BadgeProps) => {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold transition-colors',
        badgeVariants.variant[variant],
        badgeVariants.size[size],
        className
      )}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </div>
  );
};

export { Badge }; 