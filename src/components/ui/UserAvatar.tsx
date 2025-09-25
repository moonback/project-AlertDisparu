import React, { useState, useEffect } from 'react';
import { User, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

interface UserAvatarProps {
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  showIndicator?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-6 w-6'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  userId, 
  size = 'md', 
  showIndicator = false,
  className = ''
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
      <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse ${className}`}></div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {profilePicture ? (
        <img
          src={profilePicture}
          alt={displayName}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 hover:border-red-300 transition-colors`}
        />
      ) : (
        <div className={`${sizeClasses[size]} bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200 hover:border-red-300 transition-colors`}>
          <User className={`${iconSizes[size]} text-gray-500`} />
        </div>
      )}
      
      {/* Indicateur de photo manquante */}
      {showIndicator && !loading && !profilePicture && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-white">
          <Camera className="h-2 w-2 text-white" />
        </div>
      )}
    </div>
  );
};
