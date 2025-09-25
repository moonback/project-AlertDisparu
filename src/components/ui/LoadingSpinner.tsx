import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2, Search } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  variant?: 'default' | 'dots' | 'pulse' | 'search';
  color?: 'primary' | 'white' | 'gray';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Chargement...',
  className = '',
  variant = 'default',
  color = 'primary'
}) => {
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-600'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className={cn('rounded-full animate-bounce', colorClasses[color], sizeClasses[size])} style={{ animationDelay: '0ms' }}></div>
            <div className={cn('rounded-full animate-bounce', colorClasses[color], sizeClasses[size])} style={{ animationDelay: '150ms' }}></div>
            <div className={cn('rounded-full animate-bounce', colorClasses[color], sizeClasses[size])} style={{ animationDelay: '300ms' }}></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={cn('rounded-full animate-pulse bg-current', sizeClasses[size])}></div>
        );
      
      case 'search':
        return (
          <Search className={cn('animate-spin', colorClasses[color], sizeClasses[size])} />
        );
      
      default:
        return (
          <Loader2 className={cn('animate-spin', colorClasses[color], sizeClasses[size])} />
        );
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
      {renderSpinner()}
      {text && (
        <p className={cn('font-medium', colorClasses[color], textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
};
