import React, { useEffect } from 'react';
import { useMissingPersonsStore } from '../store/missingPersonsStore';
import { SearchFilters } from '../components/Reports/SearchFilters';
import { ReportCard } from '../components/Reports/ReportCard';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Plus, Search, AlertTriangle, FileText, Activity, Database, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReportsPage: React.FC = () => {
  const { filteredReports, searchFilters, loadReports, isLoading } = useMissingPersonsStore();

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
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
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-neon-blue/20 rounded-full blur-lg animate-pulse"></div>
                  <Search className="h-10 w-10 text-neon-blue relative z-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-display font-bold text-white mb-2">
                    BASE DE DONNÉES RAPPORTS
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-neon-green" />
                      <span className="text-sm font-mono text-dark-300">
                        {filteredReports.length} ENREGISTREMENT{filteredReports.length !== 1 ? 'S' : ''}
                      </span>
                    </div>
                    {Object.keys(searchFilters).length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-system-warning" />
                        <span className="text-sm font-mono text-system-warning">FILTRÉS</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Link to="/signalement">
                  <Button variant="neon" size="lg" leftIcon={<Plus className="h-4 w-4" />} glow>
                    NOUVEAU SIGNALEMENT
                  </Button>
                </Link>
                <Link to="/signalement/alerte">
                  <Button variant="cyber" size="lg" leftIcon={<FileText className="h-4 w-4" />}>
                    DEPUIS AFFICHE
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Indicateurs de statut */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-system-success rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-dark-400">BASE DE DONNÉES: ACTIVE</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-3 w-3 text-neon-blue" />
                <span className="text-xs font-mono text-dark-400">DERNIÈRE SYNCHRO: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

      <SearchFilters />

        {isLoading && (
          <div className="flex justify-center py-12">
            <Card variant="glass" className="p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-neon-blue/20 rounded-full blur-lg animate-pulse"></div>
                  <LoadingSpinner size="lg" />
                </div>
                <p className="text-white font-mono text-sm tracking-wider">
                  CHARGEMENT DE LA BASE DE DONNÉES...
                </p>
              </div>
            </Card>
          </div>
        )}

        {filteredReports.length === 0 ? (
          <Card variant="cyber" className="text-center py-12" glow>
            <CardHeader>
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-system-warning/20 rounded-full blur-lg animate-pulse"></div>
                  <div className="relative p-4 bg-system-warning/10 rounded-full border border-system-warning/30">
                    <Search className="h-12 w-12 text-system-warning" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-neon-green mb-4">AUCUN RAPPORT TROUVÉ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-dark-300 font-mono mb-8 max-w-md mx-auto">
                {Object.keys(searchFilters).length > 0 
                  ? 'AJUSTEZ VOS FILTRES DE RECHERCHE POUR OBTENIR PLUS DE RÉSULTATS.'
                  : 'AUCUN RAPPORT DE PERSONNE DISPARUE ACTUELLEMENT EN BASE.'
                }
              </p>
              <Link to="/signalement">
                <Button variant="neon" size="lg" leftIcon={<AlertTriangle className="h-4 w-4" />} glow>
                  SIGNALER UNE DISPARITION
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};