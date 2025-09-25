import React, { useState } from 'react';
import { Header } from './Header';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SetupHelper } from '../ui/SetupHelper';
import { Button } from '../ui/Button';
import { Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showSetupHelper, setShowSetupHelper] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Alerte mode démo */}
      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-800">
                    <strong>Mode démo activé :</strong> L'application fonctionne avec des données de démonstration. 
                    Configurez Supabase pour utiliser les vraies fonctionnalités.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSetupHelper(true)}
                className="flex items-center space-x-1 bg-white text-amber-800 border-amber-300 hover:bg-amber-50"
              >
                <Settings className="h-4 w-4" />
                <span>Configurer</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <main className="flex-1">
        {children}
      </main>

      <SetupHelper 
        isVisible={showSetupHelper} 
        onClose={() => setShowSetupHelper(false)} 
      />
    </div>
  );
};