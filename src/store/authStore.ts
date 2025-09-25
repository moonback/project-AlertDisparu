import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { getAuthErrorMessage } from '../utils/errorMessages';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  initializing: boolean;
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
        set({ loading: true });
        
        try {
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
        }
      },

      initializeAuth: async () => {
        const currentState = get();
        
        // Protection contre les initialisations multiples
        if (currentState.initializing) {
          return;
        }
        
        // Protection contre les hot reloads fréquents
        if (currentState.user && currentState.isAuthenticated) {
          return;
        }
        
        set({ loading: true, initializing: true });
        
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            set({
              user: null,
              isAuthenticated: false,
              token: null,
              loading: false,
              initializing: false
            });
            return;
          }
          
          if (session?.user) {
            // Récupérer le profil utilisateur
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
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
                token: session.access_token,
                loading: false,
                initializing: false
              });
            } else {
              set({
                user: null,
                isAuthenticated: false,
                token: null,
                loading: false,
                initializing: false
              });
            }
          } else {
            set({
              user: null,
              isAuthenticated: false,
              token: null,
              loading: false,
              initializing: false
            });
          }
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            token: null,
            loading: false,
            initializing: false
          });
        }
      },

      retryInitialize: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await get().initializeAuth();
      }
}));