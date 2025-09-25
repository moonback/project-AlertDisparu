import React from 'react';
import { ReportFromAlert } from '../components/Reports/ReportFromAlert';
import { Layout } from '../components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FileText, Activity, Database, AlertTriangle } from 'lucide-react';

export const ReportFromAlertPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-dark-900 relative overflow-hidden">
        {/* Arrière-plan futuriste */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-circuit-pattern opacity-10"></div>
        
        {/* Lignes de données en arrière-plan */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent animate-data-stream"></div>
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-green/10 to-transparent animate-data-stream" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-purple/10 to-transparent animate-data-stream" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
          {/* Header futuriste */}
          <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6 mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-transparent to-neon-purple/5 rounded-2xl"></div>
            <div className="relative">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-system-warning/20 rounded-full blur-lg animate-pulse"></div>
                  <AlertTriangle className="h-10 w-10 text-system-warning relative z-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-display font-bold text-white mb-2">
                    MODULE DE SIGNALEMENT DEPUIS AFFICHE
                  </h1>
                  <p className="text-dark-300 font-mono text-sm tracking-wider">
                    CRÉATION DE RAPPORT À PARTIR D'UNE AFFICHE DE PERSONNE DISPARUE
                  </p>
                </div>
              </div>
              
              {/* Indicateurs de statut */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-system-warning rounded-full animate-pulse"></div>
                  <span className="text-xs font-mono text-dark-400">MODE: CRÉATION</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-3 w-3 text-neon-blue" />
                  <span className="text-xs font-mono text-dark-400">DÉMARRÉ: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>

          <ReportFromAlert />
        </div>
      </div>
    </Layout>
  );
};

export default ReportFromAlertPage;


