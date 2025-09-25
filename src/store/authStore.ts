import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { getAuthErrorMessage } from '../utils/errorMessages';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      loading: false,
      
      login: async (email: string, password: string) => {
        set({ loading: true });
        
        try {
          // plus de mode démo

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ loading: false });
            return { success: false, error: getAuthErrorMessage(error.message) };
          }

          if (data.user) {
            // Récupérer le profil utilisateur
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profileError) {
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

            set({
              user,
              isAuthenticated: true,
              token: data.session?.access_token || null,
              loading: false
            });

            return { success: true };
          }

          return { success: false, error: 'Erreur de connexion' };
        } catch (error) {
          set({ loading: false });
          return { success: false, error: 'Erreur de connexion' };
        }
      },
      
      register: async (userData) => {
        set({ loading: true });
        
        try {
          // plus de mode démo

          // Créer le compte utilisateur
          const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
          });

          if (error) {
            set({ loading: false });
            return { success: false, error: getAuthErrorMessage(error.message) };
          }

          if (data.user) {
            // Créer le profil utilisateur
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: userData.email,
                first_name: userData.firstName,
                last_name: userData.lastName,
                role: userData.role
              });

            if (profileError) {
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

            set({
              user,
              isAuthenticated: true,
              token: data.session?.access_token || null,
              loading: false
            });

            return { success: true };
          }

          return { success: false, error: 'Erreur lors de l\'inscription' };
        } catch (error) {
          set({ loading: false });
          return { success: false, error: 'Erreur lors de l\'inscription' };
        }
      },
      
      logout: async () => {
        set({ loading: true });
        
        try {
          await supabase.auth.signOut();
          set({
            user: null,
            isAuthenticated: false,
            token: null,
            loading: false
          });
        } catch (error) {
          set({ loading: false });
          console.error('Erreur lors de la déconnexion:', error);
        }
      },

      initializeAuth: async () => {
        console.log('🔐 Initialisation de l\'authentification...');
        set({ loading: true });
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          console.log('📋 Session Supabase:', session);
          
          if (session?.user) {
            console.log('👤 Utilisateur trouvé dans la session:', session.user.id);
            
            // Récupérer le profil utilisateur
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            console.log('👥 Profil utilisateur:', { profile, profileError });

            if (!profileError && profile) {
              const user: User = {
                id: profile.id,
                email: profile.email,
                firstName: profile.first_name,
                lastName: profile.last_name,
                role: profile.role
              };

              console.log('✅ Utilisateur configuré dans le store:', user);

              set({
                user,
                isAuthenticated: true,
                token: session.access_token,
                loading: false
              });
            } else {
              console.error('❌ Erreur profil utilisateur:', profileError);
              set({ loading: false });
            }
          } else {
            console.log('❌ Aucune session trouvée - vérification du store local');
            
            // Vérifier si on a un utilisateur dans le store local
            const currentState = get();
            if (currentState.user && currentState.isAuthenticated) {
              console.log('🔄 Tentative de re-synchronisation avec Supabase...');
              
              // Essayer de rafraîchir la session avec le token local
              try {
                const { data: { user: refreshedUser }, error: refreshError } = await supabase.auth.getUser();
                
                if (refreshedUser && !refreshError) {
                  console.log('✅ Session Supabase restaurée:', refreshedUser.id);
                  
                  // Récupérer le profil
                  const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', refreshedUser.id)
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
                      token: currentState.token,
                      loading: false
                    });
                    return;
                  }
                }
              } catch (refreshErr) {
                console.error('❌ Échec de la re-synchronisation:', refreshErr);
              }
              
              // Si la re-synchronisation échoue, déconnecter
              console.log('🚪 Déconnexion forcée - session Supabase invalide');
              set({
                user: null,
                isAuthenticated: false,
                token: null,
                loading: false
              });
            } else {
              set({ loading: false });
            }
          }
        } catch (error) {
          set({ loading: false });
          console.error('💥 Erreur lors de l\'initialisation de l\'authentification:', error);
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token
      })
    }
  )
);