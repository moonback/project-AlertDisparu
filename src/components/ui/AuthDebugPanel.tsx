import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { logAuthDiagnostics } from '../../utils/authDiagnostics';

export const AuthDebugPanel: React.FC = () => {
  const { user, isAuthenticated, token, loading, retryInitialize } = useAuthStore();
  const [sessionInfo, setSessionInfo] = React.useState<any>(null);

  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSessionInfo(session);
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error);
      }
    };

    checkSession();
    
    // Vérifier la session toutes les 5 secondes
    const interval = setInterval(checkSession, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg max-w-md text-xs font-mono z-50">
      <h3 className="text-yellow-400 font-bold mb-2">🔍 AUTH DEBUG PANEL</h3>
      
      <div className="space-y-2">
        <div>
          <span className="text-blue-400">Store State:</span>
          <div className="ml-2">
            <div>Loading: <span className={loading ? 'text-red-400' : 'text-green-400'}>{loading.toString()}</span></div>
            <div>Authenticated: <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>{isAuthenticated.toString()}</span></div>
            <div>Has User: <span className={user ? 'text-green-400' : 'text-red-400'}>{user ? 'Yes' : 'No'}</span></div>
            <div>Has Token: <span className={token ? 'text-green-400' : 'text-red-400'}>{token ? 'Yes' : 'No'}</span></div>
          </div>
        </div>

        {user && (
          <div>
            <span className="text-blue-400">User Info:</span>
            <div className="ml-2">
              <div>ID: {user.id}</div>
              <div>Email: {user.email}</div>
              <div>Name: {user.firstName} {user.lastName}</div>
              <div>Role: {user.role}</div>
            </div>
          </div>
        )}

        <div>
          <span className="text-blue-400">Supabase Session:</span>
          <div className="ml-2">
            <div>Has Session: <span className={sessionInfo ? 'text-green-400' : 'text-red-400'}>{sessionInfo ? 'Yes' : 'No'}</span></div>
            {sessionInfo && (
              <>
                <div>User ID: {sessionInfo.user?.id}</div>
                <div>Email: {sessionInfo.user?.email}</div>
                <div>Has Token: <span className={sessionInfo.access_token ? 'text-green-400' : 'text-red-400'}>{sessionInfo.access_token ? 'Yes' : 'No'}</span></div>
                <div>Expires: {sessionInfo.expires_at ? new Date(sessionInfo.expires_at * 1000).toLocaleString() : 'N/A'}</div>
              </>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-600">
          <span className="text-blue-400">Sync Status:</span>
          <div className="ml-2">
            <div>Store vs Session: <span className={isAuthenticated === !!sessionInfo ? 'text-green-400' : 'text-red-400'}>
              {isAuthenticated === !!sessionInfo ? 'SYNCED' : 'OUT OF SYNC'}
            </span></div>
            {user && sessionInfo && (
              <div>User ID Match: <span className={user.id === sessionInfo.user?.id ? 'text-green-400' : 'text-red-400'}>
                {user.id === sessionInfo.user?.id ? 'MATCH' : 'MISMATCH'}
              </span></div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-600">
          <span className="text-blue-400">Actions:</span>
          <div className="mt-1 space-x-1">
            <button 
              onClick={retryInitialize}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs"
            >
              {loading ? 'Loading...' : 'Retry Init'}
            </button>
            <button 
              onClick={logAuthDiagnostics}
              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
            >
              Diagnostics
            </button>
            <button 
              onClick={() => {
                localStorage.setItem('disable-debug-panel', 'true');
                window.location.reload();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
            >
              Hide Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
