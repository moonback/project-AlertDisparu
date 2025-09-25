import React from 'react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className
}) => {
  return (
    <div className={cn('glass-card p-6 hover:shadow-brand-glow transition-all duration-300', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={cn(
                'text-sm font-medium',
                trend.positive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-sm text-gray-500 ml-2">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="p-3 bg-white/30 rounded-full border border-white/20">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
