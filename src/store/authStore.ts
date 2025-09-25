import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { getAuthErrorMessage } from '../utils/errorMessages';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  initializing: boolean; // Protection contre les initialisations multiples
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  retryInitialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      loading: false,
      initializing: false,
      
      login: async (email: string, password: string) => {
        console.log('🔐 [LOGIN] Début de la connexion pour:', email);
        set({ loading: true });
        
        try {
          console.log('🔐 [LOGIN] Tentative de connexion Supabase...');
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          console.log('🔐 [LOGIN] Réponse Supabase:', { 
            hasUser: !!data.user, 
            hasSession: !!data.session,
            hasError: !!error,
            errorMessage: error?.message 
          });

          if (error) {
            console.error('❌ [LOGIN] Erreur Supabase:', error);
            set({ loading: false });
            return { success: false, error: getAuthErrorMessage(error.message) };
          }

          if (data.user) {
            console.log('✅ [LOGIN] Utilisateur trouvé, ID:', data.user.id);
            
            // Récupérer le profil utilisateur
            console.log('👤 [LOGIN] Récupération du profil utilisateur...');
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            console.log('👤 [LOGIN] Profil récupéré:', { 
              hasProfile: !!profile, 
              hasError: !!profileError,
              profileError: profileError?.message,
              profileData: profile ? {
                id: profile.id,
                email: profile.email,
                first_name: profile.first_name,
                last_name: profile.last_name,
                role: profile.role
              } : null
            });

            if (profileError) {
              console.error('❌ [LOGIN] Erreur profil:', profileError);
              set({ loading: false });
              return { success: false, error: 'Erreur lors de la récupération du profil' };
            }

            const user: User = {
              id: profile.id,
              email: profile.email,
              firstName: profile.first_name,
              lastName: profile.last_name,
              role: profile.role
            };

            console.log('✅ [LOGIN] Utilisateur configuré:', user);
            console.log('🔑 [LOGIN] Token session:', data.session?.access_token ? 'Présent' : 'Absent');

            set({
              user,
              isAuthenticated: true,
              token: data.session?.access_token || null,
              loading: false
            });

            console.log('🎉 [LOGIN] Connexion réussie et store mis à jour');
            return { success: true };
          }

          console.error('❌ [LOGIN] Aucun utilisateur dans la réponse');
          return { success: false, error: 'Erreur de connexion' };
        } catch (error) {
          console.error('💥 [LOGIN] Exception:', error);
          set({ loading: false });
          return { success: false, error: 'Erreur de connexion' };
        }
      },
      
      register: async (userData) => {
        console.log('📝 [REGISTER] Début de l\'inscription pour:', userData.email);
        console.log('📝 [REGISTER] Données utilisateur:', {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role
        });
        set({ loading: true });
        
        try {
          // Créer le compte utilisateur
          console.log('📝 [REGISTER] Création du compte Supabase...');
          const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
          });

          console.log('📝 [REGISTER] Réponse Supabase:', { 
            hasUser: !!data.user, 
            hasSession: !!data.session,
            hasError: !!error,
            errorMessage: error?.message 
          });

          if (error) {
            console.error('❌ [REGISTER] Erreur Supabase:', error);
            set({ loading: false });
            return { success: false, error: getAuthErrorMessage(error.message) };
          }

          if (data.user) {
            console.log('✅ [REGISTER] Utilisateur créé, ID:', data.user.id);
            
            // Créer le profil utilisateur
            console.log('👤 [REGISTER] Création du profil utilisateur...');
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: userData.email,
                first_name: userData.firstName,
                last_name: userData.lastName,
                role: userData.role
              });

            console.log('👤 [REGISTER] Création profil:', { 
              hasError: !!profileError,
              profileError: profileError?.message 
            });

            if (profileError) {
              console.error('❌ [REGISTER] Erreur création profil:', profileError);
              set({ loading: false });
              return { success: false, error: 'Erreur lors de la création du profil' };
            }

            const user: User = {
              id: data.user.id,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role
            };

            console.log('✅ [REGISTER] Utilisateur configuré:', user);
            console.log('🔑 [REGISTER] Token session:', data.session?.access_token ? 'Présent' : 'Absent');

            set({
              user,
              isAuthenticated: true,
              token: data.session?.access_token || null,
              loading: false
            });

            console.log('🎉 [REGISTER] Inscription réussie et store mis à jour');
            return { success: true };
          }

          console.error('❌ [REGISTER] Aucun utilisateur dans la réponse');
          return { success: false, error: 'Erreur lors de l\'inscription' };
        } catch (error) {
          console.error('💥 [REGISTER] Exception:', error);
          set({ loading: false });
          return { success: false, error: 'Erreur lors de l\'inscription' };
        }
      },
      
      logout: async () => {
        console.log('🚪 [LOGOUT] Début de la déconnexion');
        const currentUser = get().user;
        console.log('🚪 [LOGOUT] Utilisateur actuel:', currentUser?.email || 'Aucun');
        
        set({ loading: true });
        
        try {
          console.log('🚪 [LOGOUT] Appel signOut Supabase...');
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            console.error('❌ [LOGOUT] Erreur Supabase:', error);
          } else {
            console.log('✅ [LOGOUT] SignOut Supabase réussi');
          }
          
          set({
            user: null,
            isAuthenticated: false,
            token: null,
            loading: false
          });
          
          console.log('🎉 [LOGOUT] Store mis à jour et utilisateur déconnecté');
        } catch (error) {
          console.error('💥 [LOGOUT] Exception:', error);
          set({ loading: false });
        }
      },

      initializeAuth: async () => {
        const currentState = get();
        
        // Protection contre les initialisations multiples
        if (currentState.initializing) {
          console.log('🔐 [INIT_AUTH] Initialisation déjà en cours, abandon...');
          return;
        }
        
        // Protection contre les hot reloads fréquents
        if (currentState.user && currentState.isAuthenticated) {
          console.log('🔐 [INIT_AUTH] Utilisateur déjà connecté, abandon...');
          return;
        }
        
        console.log('🔐 [INIT_AUTH] ===========================================');
        console.log('🔐 [INIT_AUTH] Début de l\'initialisation de l\'authentification');
        console.log('🔐 [INIT_AUTH] ===========================================');
        
        console.log('🔐 [INIT_AUTH] État actuel du store:', {
          hasUser: !!currentState.user,
          isAuthenticated: currentState.isAuthenticated,
          hasToken: !!currentState.token,
          userEmail: currentState.user?.email || 'Aucun'
        });
        
        set({ loading: true, initializing: true });
        
        try {
          console.log('🔐 [INIT_AUTH] Récupération de la session Supabase...');
          
          // Ajouter un timeout pour éviter les blocages
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout getSession')), 30000) // Augmenté à 30 secondes
          );
          
          const sessionResponse = await Promise.race([sessionPromise, timeoutPromise]);
          const { data: { session }, error: sessionError } = sessionResponse as any;
          
          console.log('🔐 [INIT_AUTH] Réponse complète getSession:', sessionResponse);
          
          console.log('📋 [INIT_AUTH] Réponse getSession:', {
            hasSession: !!session,
            hasError: !!sessionError,
            sessionError: sessionError?.message,
            sessionData: session ? {
              hasUser: !!session.user,
              userId: session.user?.id,
              userEmail: session.user?.email,
              hasAccessToken: !!session.access_token,
              tokenExpiresAt: session.expires_at,
              expiresIn: session.expires_in
            } : null
          });
          
          if (sessionError) {
            console.error('❌ [INIT_AUTH] Erreur getSession:', sessionError);
            set({
              user: null,
              isAuthenticated: false,
              token: null,
              loading: false
            });
            return;
          }
          
          if (session?.user) {
            console.log('✅ [INIT_AUTH] Session trouvée pour utilisateur:', session.user.email);
            console.log('👤 [INIT_AUTH] Détails utilisateur session:', {
              id: session.user.id,
              email: session.user.email,
              created_at: session.user.created_at,
              last_sign_in_at: session.user.last_sign_in_at
            });
            
            // Récupérer le profil utilisateur
            console.log('👤 [INIT_AUTH] Récupération du profil utilisateur...');
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            console.log('👥 [INIT_AUTH] Profil récupéré:', { 
              hasProfile: !!profile,
              hasError: !!profileError,
              profileError: profileError?.message,
              profileData: profile ? {
                id: profile.id,
                email: profile.email,
                first_name: profile.first_name,
                last_name: profile.last_name,
                role: profile.role,
                created_at: profile.created_at,
                updated_at: profile.updated_at
              } : null
            });

            if (!profileError && profile) {
              const user: User = {
                id: profile.id,
                email: profile.email,
                firstName: profile.first_name,
                lastName: profile.last_name,
                role: profile.role
              };

              console.log('✅ [INIT_AUTH] Utilisateur configuré:', user);
              console.log('🔑 [INIT_AUTH] Token session:', session.access_token ? 'Présent' : 'Absent');

              set({
                user,
                isAuthenticated: true,
                token: session.access_token,
                loading: false,
                initializing: false
              });
              
              console.log('🎉 [INIT_AUTH] Store mis à jour avec succès');
              console.log('🔐 [INIT_AUTH] ===========================================');
              console.log('🔐 [INIT_AUTH] Initialisation terminée - UTILISATEUR CONNECTÉ');
              console.log('🔐 [INIT_AUTH] ===========================================');
            } else {
              console.error('❌ [INIT_AUTH] Erreur profil utilisateur:', profileError);
              set({
                user: null,
                isAuthenticated: false,
                token: null,
                loading: false,
                initializing: false
              });
              console.log('🔐 [INIT_AUTH] ===========================================');
              console.log('🔐 [INIT_AUTH] Initialisation terminée - ERREUR PROFIL');
              console.log('🔐 [INIT_AUTH] ===========================================');
            }
          } else {
            console.log('❌ [INIT_AUTH] Aucune session trouvée');
            set({
              user: null,
              isAuthenticated: false,
              token: null,
              loading: false,
              initializing: false
            });
            console.log('🔐 [INIT_AUTH] ===========================================');
            console.log('🔐 [INIT_AUTH] Initialisation terminée - AUCUNE SESSION');
            console.log('🔐 [INIT_AUTH] ===========================================');
          }
        } catch (error) {
          console.error('💥 [INIT_AUTH] Exception lors de l\'initialisation:', error);
          
          // Si c'est un timeout, essayer une approche alternative
          if (error instanceof Error && error.message === 'Timeout getSession') {
            console.log('⏰ [INIT_AUTH] Timeout détecté, tentative alternative...');
            
            try {
              // Essayer getUser() comme alternative
              const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
              console.log('👤 [INIT_AUTH] getUser() résultat:', { currentUser: !!currentUser, userError });
              
              if (currentUser && !userError) {
                console.log('✅ [INIT_AUTH] Utilisateur trouvé via getUser(), tentative de récupération du profil...');
                
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', currentUser.id)
                  .single();

                if (!profileError && profile) {
                  const user: User = {
                    id: profile.id,
                    email: profile.email,
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    role: profile.role
                  };

                  set({
                    user,
                    isAuthenticated: true,
                    token: null, // Pas de token disponible
                    loading: false
                  });
                  
                  console.log('🎉 [INIT_AUTH] Récupération réussie via getUser()');
                  return;
                }
              }
            } catch (altError) {
              console.error('❌ [INIT_AUTH] Échec de la méthode alternative:', altError);
            }
          }
          
          set({
            user: null,
            isAuthenticated: false,
            token: null,
            loading: false
          });
          console.log('🔐 [INIT_AUTH] ===========================================');
          console.log('🔐 [INIT_AUTH] Initialisation terminée - ERREUR EXCEPTION');
          console.log('🔐 [INIT_AUTH] ===========================================');
        }
      },

      retryInitialize: async () => {
        console.log('🔄 [RETRY_INIT] Nouvelle tentative d\'initialisation...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde
        await get().initializeAuth();
      }
}));