import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat' | 'glass' | 'cyber' | 'neon';
  interactive?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  variant = 'default',
  interactive = false,
  glow = false,
  ...props 
}) => {
  const variants = {
    default: 'bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl shadow-dark-glass',
    elevated: 'bg-dark-800/70 backdrop-blur-xl border border-dark-600/50 rounded-2xl shadow-dark-glass hover:shadow-neon-blue transition-all duration-300',
    outlined: 'bg-dark-800/30 backdrop-blur-xl border-2 border-dark-600/50 rounded-2xl hover:border-neon-blue/50 transition-all duration-300',
    flat: 'bg-dark-800/20 backdrop-blur-xl border border-dark-700/30 rounded-2xl hover:border-dark-600/50 transition-all duration-300',
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-glass hover:bg-white/10 transition-all duration-300',
    cyber: 'bg-dark-800/80 backdrop-blur-xl border border-neon-green/30 rounded-2xl shadow-neon-green hover:border-neon-green/50 transition-all duration-300',
    neon: 'bg-gradient-to-br from-dark-800/50 to-dark-700/50 backdrop-blur-xl border border-neon-blue/30 rounded-2xl shadow-neon-blue hover:shadow-neon-purple transition-all duration-300'
  };
  
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        variants[variant],
        interactive && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        glow && 'animate-glow-pulse',
        className
      )}
      {...props}
    >
      {/* Effet de scan pour les cartes cyber */}
      {variant === 'cyber' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/5 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-2000"></div>
      )}
      
      {/* Effet hologramme pour les cartes glass */}
      {variant === 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-hologram"></div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn('px-6 py-4 border-b border-dark-700/50', className)} {...props}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn('px-6 py-4 border-t border-dark-700/50 bg-dark-900/50 rounded-b-2xl', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <h3 className={cn('text-lg font-display font-bold text-white', className)} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <p className={cn('text-sm text-dark-300 mt-1 font-mono', className)} {...props}>
      {children}
    </p>
  );
};