import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const { initializeAuth, loading, user, isAuthenticated, retryInitialize } = useAuthStore();

  useEffect(() => {
    console.log('🎯 [USE_AUTH] ===========================================');
    console.log('🎯 [USE_AUTH] Hook useAuth initialisé');
    console.log('🎯 [USE_AUTH] État initial:', {
      loading,
      hasUser: !!user,
      isAuthenticated,
      userEmail: user?.email || 'Aucun'
    });
    console.log('🎯 [USE_AUTH] ===========================================');

    // Initialiser l'authentification au montage du composant
    console.log('🎯 [USE_AUTH] Appel initializeAuth...');
    initializeAuth();

    // Écouter les changements d'authentification
    console.log('🎯 [USE_AUTH] Configuration de l\'écouteur onAuthStateChange...');
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AUTH_STATE_CHANGE] ===========================================');
      console.log('🔄 [AUTH_STATE_CHANGE] Événement détecté:', event);
      console.log('🔄 [AUTH_STATE_CHANGE] Session:', session ? {
        hasUser: !!session.user,
        userId: session.user?.id,
        userEmail: session.user?.email,
        hasAccessToken: !!session.access_token,
        expiresAt: session.expires_at
      } : 'Aucune session');
      
      if (event === 'SIGNED_IN' && session) {
        console.log('✅ [AUTH_STATE_CHANGE] Utilisateur connecté - Re-initialisation...');
        await initializeAuth();
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 [AUTH_STATE_CHANGE] Utilisateur déconnecté - Re-initialisation...');
        await initializeAuth();
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 [AUTH_STATE_CHANGE] Token rafraîchi - Re-initialisation...');
        await initializeAuth();
      } else {
        console.log('ℹ️ [AUTH_STATE_CHANGE] Autre événement:', event);
      }
      
      console.log('🔄 [AUTH_STATE_CHANGE] ===========================================');
    });

    console.log('🎯 [USE_AUTH] Écouteur configuré, subscription:', !!subscription);

    // Nettoyer l'abonnement au démontage
    return () => {
      console.log('🧹 [USE_AUTH] Nettoyage de l\'écouteur onAuthStateChange...');
      subscription.unsubscribe();
      console.log('🧹 [USE_AUTH] Écouteur supprimé');
    };
  }, [initializeAuth]);

  // Log des changements d'état
  useEffect(() => {
    console.log('📊 [USE_AUTH] État du store mis à jour:', {
      loading,
      hasUser: !!user,
      isAuthenticated,
      userEmail: user?.email || 'Aucun',
      userRole: user?.role || 'Aucun'
    });
  }, [loading, user, isAuthenticated]);

  // Retry automatique désactivé temporairement pour éviter les conflits avec hot reload
  // useEffect(() => {
  //   let retryTimeout: NodeJS.Timeout;
    
  //   // Seulement retry si on n'est pas en cours de chargement et qu'on n'a pas d'utilisateur
  //   if (!loading && !isAuthenticated && !user) {
  //     console.log('🔄 [USE_AUTH] État incohérent détecté, retry automatique dans 10 secondes...');
  //     retryTimeout = setTimeout(() => {
  //       // Vérifier à nouveau l'état avant de retry
  //       const currentState = useAuthStore.getState();
  //       if (!currentState.loading && !currentState.isAuthenticated && !currentState.user) {
  //         console.log('🔄 [USE_AUTH] Lancement du retry automatique...');
  //         retryInitialize();
  //       } else {
  //         console.log('🔄 [USE_AUTH] Retry annulé - état changé entre temps');
  //       }
  //     }, 10000); // Augmenté à 10 secondes
  //   }
    
  //   return () => {
  //     if (retryTimeout) {
  //       clearTimeout(retryTimeout);
  //     }
  //   };
  // }, [loading, isAuthenticated, user, retryInitialize]);

  return { loading };
};
