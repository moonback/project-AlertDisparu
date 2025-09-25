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
  variant?: 'default' | 'cyber' | 'glass' | 'neon';
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
    
    const variants = {
      default: {
        container: 'bg-dark-800/50 border-dark-600/50',
        input: 'bg-dark-800/50 text-white border-dark-600/50 focus:border-neon-blue/50 focus:ring-neon-blue/20',
        label: 'text-dark-200',
        icon: 'text-dark-400'
      },
      cyber: {
        container: 'bg-dark-800/80 border-neon-green/30 shadow-neon-green',
        input: 'bg-dark-800/80 text-neon-green border-neon-green/30 focus:border-neon-green/50 focus:ring-neon-green/20 font-mono',
        label: 'text-neon-green font-mono',
        icon: 'text-neon-green'
      },
      glass: {
        container: 'bg-white/5 border-white/20 backdrop-blur-xl',
        input: 'bg-white/5 text-white border-white/20 focus:border-white/40 focus:ring-white/20 backdrop-blur-xl',
        label: 'text-white',
        icon: 'text-white/70'
      },
      neon: {
        container: 'bg-dark-800/50 border-neon-blue/30 shadow-neon-blue',
        input: 'bg-dark-800/50 text-white border-neon-blue/30 focus:border-neon-blue/50 focus:ring-neon-blue/20',
        label: 'text-neon-blue',
        icon: 'text-neon-blue'
      }
    };

    const currentVariant = variants[variant];
    
    return (
      <div className="space-y-2">
        {label && (
          <label className={cn("block text-sm font-display font-semibold", currentVariant.label)}>
            {label.toUpperCase()}
            {props.required && <span className="text-system-error ml-1">*</span>}
          </label>
        )}
        
        <div className={cn("relative rounded-xl border transition-all duration-300", currentVariant.container)}>
          {/* Ligne de focus futuriste */}
          {isFocused && (
            <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent animate-scan-line"></div>
          )}
          
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className={cn("h-5 w-5", currentVariant.icon)}>{leftIcon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={cn(
              'w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 placeholder-dark-400',
              hasLeftIcon && 'pl-10',
              hasRightIcon && 'pr-10',
              error && 'border-system-error focus:border-system-error focus:ring-system-error/20',
              success && 'border-system-success focus:border-system-success focus:ring-system-success/20',
              currentVariant.input,
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {/* Effet de scan pour les inputs cyber */}
          {variant === 'cyber' && isFocused && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/5 to-transparent transform -skew-x-12 animate-scan-line"></div>
          )}
          
          {hasRightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {showPasswordToggle && type === 'password' ? (
                <button
                  type="button"
                  className={cn("transition-colors hover:opacity-70", currentVariant.icon)}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              ) : (
                <span className={cn("h-5 w-5", currentVariant.icon)}>{rightIcon}</span>
              )}
            </div>
          )}
          
          {success && !error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <CheckCircle className="h-5 w-5 text-system-success" />
            </div>
          )}
        </div>
        
        {error && (
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-system-error flex-shrink-0" />
            <p className="text-sm text-system-error font-mono">{error}</p>
          </div>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-dark-400 font-mono">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';