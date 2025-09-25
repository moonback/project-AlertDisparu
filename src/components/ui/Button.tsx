import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'warning' | 'neon' | 'glass' | 'cyber';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  glow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  leftIcon,
  rightIcon,
  glow = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium font-display transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden';
  
  const variants = {
    primary: 'bg-neon-blue text-dark-900 hover:bg-neon-cyan focus:ring-neon-blue shadow-neon-blue border border-neon-blue/30',
    secondary: 'bg-dark-700 text-dark-100 hover:bg-dark-600 focus:ring-dark-500 border border-dark-500',
    danger: 'bg-system-error text-white hover:bg-red-600 focus:ring-system-error shadow-neon-red border border-system-error/30',
    outline: 'border border-dark-400 text-dark-100 hover:bg-dark-700/50 focus:ring-dark-500 backdrop-blur-sm',
    ghost: 'text-dark-200 hover:bg-dark-700/50 focus:ring-dark-500 backdrop-blur-sm',
    warning: 'bg-system-warning text-dark-900 hover:bg-neon-amber focus:ring-system-warning shadow-neon-amber border border-system-warning/30',
    neon: 'bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:from-neon-cyan hover:to-neon-purple focus:ring-neon-blue shadow-neon-blue border border-neon-blue/50',
    glass: 'bg-white/10 text-white hover:bg-white/20 focus:ring-white/50 backdrop-blur-md border border-white/20 shadow-glass',
    cyber: 'bg-dark-800 text-neon-green hover:bg-dark-700 focus:ring-neon-green border border-neon-green/50 shadow-neon-green font-mono'
  };
  
  const sizes = {
    xs: 'px-3 py-1.5 text-xs rounded-lg',
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-2.5 text-sm rounded-xl',
    lg: 'px-8 py-3 text-base rounded-xl',
    xl: 'px-10 py-4 text-lg rounded-2xl'
  };
  
  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  };

  const glowStyles = glow ? 'animate-glow-pulse' : '';
  
  return (
    <button
      className={cn(
        baseStyles, 
        variants[variant], 
        sizes[size], 
        glowStyles,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Effet de scan pour les boutons cyber */}
      {variant === 'cyber' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/20 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
      )}
      
      {/* Effet hologramme pour les boutons glass */}
      {variant === 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-hologram"></div>
      )}
      
      {isLoading ? (
        <Loader2 className={cn('animate-spin', iconSizes[size], children ? 'mr-2' : '')} />
      ) : leftIcon ? (
        <span className={cn(iconSizes[size], children ? 'mr-2' : '', 'relative z-10')}>{leftIcon}</span>
      ) : null}
      
      <span className="relative z-10">{children}</span>
      
      {!isLoading && rightIcon && (
        <span className={cn(iconSizes[size], children ? 'ml-2' : '', 'relative z-10')}>{rightIcon}</span>
      )}
    </button>
  );
};