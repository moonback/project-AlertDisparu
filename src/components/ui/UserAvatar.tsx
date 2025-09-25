import React, { useState, useEffect } from 'react';
import { User, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

interface UserAvatarProps {
  userId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showIndicator?: boolean;
  className?: string;
  variant?: 'default' | 'ring' | 'shadow';
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8'
};

const variants = {
  default: '',
  ring: 'ring-2 ring-primary-200',
  shadow: 'shadow-soft'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  userId, 
  size = 'md', 
  showIndicator = false,
  className = '',
  variant = 'default'
}) => {
  const { user: currentUser } = useAuthStore();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const targetUserId = userId || currentUser?.id;
  const displayName = userId ? 'Utilisateur' : `${currentUser?.firstName} ${currentUser?.lastName}`;

  useEffect(() => {
    const loadProfilePicture = async () => {
      if (!targetUserId) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('profile_picture')
          .eq('id', targetUserId)
          .single();

        if (!error && data?.profile_picture) {
          setProfilePicture(data.profile_picture);
        }
      } catch (error) {
        console.log('Erreur lors du chargement de la photo de profil:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfilePicture();
  }, [targetUserId]);

  // Écouter les changements de photo de profil en temps réel
  useEffect(() => {
    if (!targetUserId) return;

    const channel = supabase
      .channel(`profile_picture_changes_${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${targetUserId}`
        },
        (payload) => {
          if (payload.new.profile_picture !== undefined) {
            setProfilePicture(payload.new.profile_picture);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetUserId]);

  if (loading) {
    return (
      <div className={cn(
        sizeClasses[size], 
        'bg-gray-200 rounded-full animate-pulse',
        variants[variant],
        className
      )}></div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {profilePicture ? (
        <img
          src={profilePicture}
          alt={displayName}
          className={cn(
            sizeClasses[size],
            'rounded-full object-cover border-2 border-gray-200 hover:border-primary-300 transition-all duration-200',
            variants[variant]
          )}
        />
      ) : (
        <div className={cn(
          sizeClasses[size],
          'bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-2 border-gray-200 hover:border-primary-300 transition-all duration-200',
          variants[variant]
        )}>
          <User className={cn(iconSizes[size], 'text-gray-500')} />
        </div>
      )}
      
      {/* Indicateur de photo manquante */}
      {showIndicator && !loading && !profilePicture && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-soft flex items-center justify-center">
          <Camera className="h-2 w-2 text-white" />
        </div>
      )}
      
      {/* Indicateur de statut en ligne */}
      {showIndicator && !loading && profilePicture && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-soft"></div>
      )}
    </div>
  );
};
