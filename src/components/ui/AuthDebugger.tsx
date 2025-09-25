import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from './Card';
import { Button } from './Button';

export const AuthDebugger: React.FC = () => {
  const [showDebugger, setShowDebugger] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const authState = useAuthStore();

  useEffect(() => {
    const checkSupabaseAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: { session } } = await supabase.auth.getSession();
        setSupabaseUser(user);
        setSupabaseSession(session);
      } catch (error) {
        console.error('Erreur vérification Supabase:', error);
      }
    };

    checkSupabaseAuth();
  }, []);

  if (!showDebugger) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowDebugger(true)}
          size="sm"
          variant="outline"
          className="bg-white shadow-lg"
        >
          🔍 Debug Auth
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              🔍 Debug Authentification
            </h2>
            <Button variant="outline" size="sm" onClick={() => setShowDebugger(false)}>
              Fermer
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              État du Store Zustand
            </h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(authState, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Session Supabase
            </h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(supabaseSession, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Utilisateur Supabase
            </h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(supabaseUser, null, 2)}
            </pre>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={async () => {
                await authState.initializeAuth();
                const { data: { user } } = await supabase.auth.getUser();
                const { data: { session } } = await supabase.auth.getSession();
                setSupabaseUser(user);
                setSupabaseSession(session);
              }}
              size="sm"
            >
              🔄 Recharger
            </Button>
            
            <Button
              onClick={async () => {
                await authState.logout();
                setSupabaseUser(null);
                setSupabaseSession(null);
              }}
              variant="outline"
              size="sm"
            >
              🚪 Déconnexion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
