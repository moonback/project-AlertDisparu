import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'neon' | 'cyber' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className,
  glow = false,
  pulse = false
}) => {
  const variants = {
    default: 'bg-dark-700 text-dark-200 border border-dark-600',
    success: 'bg-system-success/10 text-system-success border border-system-success/30',
    warning: 'bg-system-warning/10 text-system-warning border border-system-warning/30',
    error: 'bg-system-error/10 text-system-error border border-system-error/30',
    info: 'bg-system-info/10 text-system-info border border-system-info/30',
    outline: 'border border-dark-500 text-dark-300 bg-dark-800/50',
    neon: 'bg-neon-blue/10 text-neon-blue border border-neon-blue/30 shadow-neon-blue',
    cyber: 'bg-neon-green/10 text-neon-green border border-neon-green/30 shadow-neon-green font-mono',
    glass: 'bg-white/5 text-white border border-white/20 backdrop-blur-sm'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs font-mono tracking-wider',
    md: 'px-3 py-1.5 text-sm font-mono tracking-wider',
    lg: 'px-4 py-2 text-base font-mono tracking-wider'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-lg relative overflow-hidden',
        variants[variant],
        sizes[size],
        glow && 'animate-glow-pulse',
        pulse && 'animate-pulse',
        className
      )}
    >
      {/* Effet de scan pour les badges cyber */}
      {variant === 'cyber' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/20 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
      )}
      
      {/* Effet hologramme pour les badges glass */}
      {variant === 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-hologram"></div>
      )}
      
      <span className="relative z-10">{children}</span>
    </span>
  );
};
