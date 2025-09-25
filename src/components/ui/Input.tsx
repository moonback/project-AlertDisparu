import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  variant?: 'default' | 'glass';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    success = false,
    leftIcon, 
    rightIcon, 
    showPasswordToggle = false,
    variant = 'default',
    className, 
    type = 'text', 
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    
    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password') 
      : type;
    
    const hasLeftIcon = leftIcon || showPasswordToggle;
    const hasRightIcon = rightIcon || (showPasswordToggle && type === 'password');
    
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-semibold text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 h-5 w-5">{leftIcon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={cn(
              variant === 'glass' ? 'glass-input' : 'input-field',
              hasLeftIcon && 'pl-10',
              hasRightIcon && 'pr-10',
              error && variant === 'default' && 'error',
              error && variant === 'glass' && 'border-red-300 focus:ring-red-400',
              success && variant === 'default' && 'border-green-300 focus:ring-green-500',
              success && variant === 'glass' && 'border-green-400 focus:ring-green-400',
              isFocused && !error && !success && variant === 'default' && 'ring-2 ring-primary-500',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {hasRightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {showPasswordToggle && type === 'password' ? (
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              ) : (
                <span className="text-gray-400 h-5 w-5">{rightIcon}</span>
              )}
            </div>
          )}
          
          {success && !error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
        
        {error && (
          <div className="flex items-center space-x-1">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';