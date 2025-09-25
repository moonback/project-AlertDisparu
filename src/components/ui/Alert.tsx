import React from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className
}) => {
  const variants = {
    success: {
      container: 'alert-success',
      icon: CheckCircle,
      iconColor: 'text-green-600'
    },
    error: {
      container: 'alert-error',
      icon: AlertCircle,
      iconColor: 'text-red-600'
    },
    warning: {
      container: 'alert-warning',
      icon: AlertTriangle,
      iconColor: 'text-amber-600'
    },
    info: {
      container: 'alert-info',
      icon: Info,
      iconColor: 'text-blue-600'
    }
  };

  const { container, icon: Icon, iconColor } = variants[variant];

  return (
    <div className={cn(container, 'flex items-start space-x-3', className)}>
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColor)} />
      
      <div className="flex-1">
        {title && (
          <h3 className="font-semibold mb-1">{title}</h3>
        )}
        <div className="text-sm">{children}</div>
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
