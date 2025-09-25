import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const { initializeAuth, loading } = useAuthStore();

  useEffect(() => {
    // Initialiser l'authentification au montage du composant
    initializeAuth();

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // L'utilisateur s'est connecté
        await initializeAuth();
      } else if (event === 'SIGNED_OUT') {
        // L'utilisateur s'est déconnecté
        await initializeAuth();
      }
    });

    // Nettoyer l'abonnement au démontage
    return () => subscription.unsubscribe();
  }, [initializeAuth]);

  return { loading };
};
