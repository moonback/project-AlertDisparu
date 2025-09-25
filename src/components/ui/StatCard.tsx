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
  variant?: 'default' | 'cyber' | 'glass' | 'neon';
  glow?: boolean;
  pulse?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
  variant = 'default',
  glow = false,
  pulse = false
}) => {
  const variants = {
    default: {
      container: 'bg-dark-800/50 border-dark-700/50',
      title: 'text-dark-300',
      value: 'text-white',
      description: 'text-dark-400',
      icon: 'bg-dark-700/50 border-dark-600/50'
    },
    cyber: {
      container: 'bg-dark-800/80 border-neon-green/30 shadow-neon-green',
      title: 'text-neon-green',
      value: 'text-neon-green',
      description: 'text-dark-300',
      icon: 'bg-neon-green/10 border-neon-green/30'
    },
    glass: {
      container: 'bg-white/5 border-white/20 backdrop-blur-xl',
      title: 'text-white',
      value: 'text-white',
      description: 'text-white/70',
      icon: 'bg-white/10 border-white/20'
    },
    neon: {
      container: 'bg-gradient-to-br from-dark-800/50 to-dark-700/50 border-neon-blue/30 shadow-neon-blue',
      title: 'text-neon-blue',
      value: 'text-white',
      description: 'text-dark-300',
      icon: 'bg-neon-blue/10 border-neon-blue/30'
    }
  };

  const currentVariant = variants[variant];

  return (
    <div className={cn(
      'relative rounded-2xl border shadow-dark-glass hover:shadow-neon-blue transition-all duration-300 p-6 overflow-hidden',
      currentVariant.container,
      glow && 'animate-glow-pulse',
      className
    )}>
      {/* Effet de scan pour les cartes cyber */}
      {variant === 'cyber' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/5 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-2000"></div>
      )}
      
      {/* Effet hologramme pour les cartes glass */}
      {variant === 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-hologram"></div>
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={cn("text-sm font-display font-semibold mb-1 tracking-wider", currentVariant.title)}>
              {title.toUpperCase()}
            </p>
            <p className={cn("text-3xl font-display font-bold mb-2", currentVariant.value, pulse && "animate-pulse")}>
              {value}
            </p>
            {description && (
              <p className={cn("text-sm font-mono", currentVariant.description)}>
                {description.toUpperCase()}
              </p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <span className={cn(
                  'text-sm font-mono font-bold',
                  trend.positive ? 'text-system-success' : 'text-system-error'
                )}>
                  {trend.positive ? '+' : ''}{trend.value}%
                </span>
                <span className={cn("text-sm ml-2 font-mono", currentVariant.description)}>
                  {trend.label.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 ml-4">
              <div className={cn("p-3 rounded-xl border", currentVariant.icon)}>
                <span className={cn(
                  "h-6 w-6",
                  variant === 'cyber' ? 'text-neon-green' :
                  variant === 'glass' ? 'text-white' :
                  variant === 'neon' ? 'text-neon-blue' : 'text-white'
                )}>
                  {icon}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
