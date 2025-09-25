import { supabase } from '../lib/supabase';

export interface AuthDiagnostics {
  supabaseConnection: boolean;
  sessionStatus: 'valid' | 'invalid' | 'none' | 'error';
  sessionDetails?: any;
  profileStatus: 'found' | 'missing' | 'error';
  profileDetails?: any;
  rlsEnabled: boolean;
  errors: string[];
}

export const runAuthDiagnostics = async (): Promise<AuthDiagnostics> => {
  const diagnostics: AuthDiagnostics = {
    supabaseConnection: false,
    sessionStatus: 'none',
    profileStatus: 'missing',
    rlsEnabled: false,
    errors: []
  };

  try {
    console.log('🔍 [DIAGNOSTICS] Début des diagnostics d\'authentification...');

    // 1. Test de connexion Supabase
    console.log('🔍 [DIAGNOSTICS] Test de connexion Supabase...');
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        diagnostics.errors.push(`Erreur connexion Supabase: ${error.message}`);
      } else {
        diagnostics.supabaseConnection = true;
        console.log('✅ [DIAGNOSTICS] Connexion Supabase OK');
      }
    } catch (err) {
      diagnostics.errors.push(`Exception connexion Supabase: ${err}`);
    }

    // 2. Vérification de la session
    console.log('🔍 [DIAGNOSTICS] Vérification de la session...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        diagnostics.sessionStatus = 'error';
        diagnostics.errors.push(`Erreur getSession: ${error.message}`);
      } else if (session) {
        diagnostics.sessionStatus = 'valid';
        diagnostics.sessionDetails = {
          hasUser: !!session.user,
          userId: session.user?.id,
          userEmail: session.user?.email,
          hasAccessToken: !!session.access_token,
          expiresAt: session.expires_at,
          expiresIn: session.expires_in
        };
        console.log('✅ [DIAGNOSTICS] Session valide trouvée');
      } else {
        diagnostics.sessionStatus = 'none';
        console.log('ℹ️ [DIAGNOSTICS] Aucune session trouvée');
      }
    } catch (err) {
      diagnostics.sessionStatus = 'error';
      diagnostics.errors.push(`Exception getSession: ${err}`);
    }

    // 3. Vérification du profil utilisateur
    if (diagnostics.sessionStatus === 'valid' && diagnostics.sessionDetails?.userId) {
      console.log('🔍 [DIAGNOSTICS] Vérification du profil utilisateur...');
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', diagnostics.sessionDetails.userId)
          .single();

        if (error) {
          diagnostics.profileStatus = 'error';
          diagnostics.errors.push(`Erreur profil: ${error.message}`);
        } else if (profile) {
          diagnostics.profileStatus = 'found';
          diagnostics.profileDetails = {
            id: profile.id,
            email: profile.email,
            first_name: profile.first_name,
            last_name: profile.last_name,
            role: profile.role
          };
          console.log('✅ [DIAGNOSTICS] Profil utilisateur trouvé');
        } else {
          diagnostics.profileStatus = 'missing';
          diagnostics.errors.push('Profil utilisateur manquant');
        }
      } catch (err) {
        diagnostics.profileStatus = 'error';
        diagnostics.errors.push(`Exception profil: ${err}`);
      }
    }

    // 4. Test RLS (Row Level Security)
    console.log('🔍 [DIAGNOSTICS] Test RLS...');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error && error.message.includes('RLS')) {
        diagnostics.rlsEnabled = true;
        console.log('✅ [DIAGNOSTICS] RLS activé');
      } else if (error) {
        diagnostics.errors.push(`Erreur test RLS: ${error.message}`);
      } else {
        console.log('⚠️ [DIAGNOSTICS] RLS possiblement désactivé');
      }
    } catch (err) {
      diagnostics.errors.push(`Exception test RLS: ${err}`);
    }

    console.log('🔍 [DIAGNOSTICS] Diagnostics terminés:', diagnostics);
    return diagnostics;

  } catch (error) {
    diagnostics.errors.push(`Erreur générale diagnostics: ${error}`);
    console.error('💥 [DIAGNOSTICS] Erreur générale:', error);
    return diagnostics;
  }
};

export const logAuthDiagnostics = async () => {
  const diagnostics = await runAuthDiagnostics();
  
  console.log('📊 [DIAGNOSTICS] ===========================================');
  console.log('📊 [DIAGNOSTICS] RÉSULTATS DES DIAGNOSTICS');
  console.log('📊 [DIAGNOSTICS] ===========================================');
  console.log('📊 [DIAGNOSTICS] Connexion Supabase:', diagnostics.supabaseConnection ? '✅ OK' : '❌ ERREUR');
  console.log('📊 [DIAGNOSTICS] Statut session:', diagnostics.sessionStatus);
  console.log('📊 [DIAGNOSTICS] Statut profil:', diagnostics.profileStatus);
  console.log('📊 [DIAGNOSTICS] RLS activé:', diagnostics.rlsEnabled ? '✅ OUI' : '❓ INCONNU');
  
  if (diagnostics.errors.length > 0) {
    console.log('📊 [DIAGNOSTICS] Erreurs détectées:');
    diagnostics.errors.forEach((error, index) => {
      console.log(`📊 [DIAGNOSTICS] ${index + 1}. ${error}`);
    });
  } else {
    console.log('📊 [DIAGNOSTICS] ✅ Aucune erreur détectée');
  }
  
  console.log('📊 [DIAGNOSTICS] ===========================================');
  
  return diagnostics;
};
