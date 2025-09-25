import React, { useEffect } from 'react';
import { useMissingPersonsStore } from '../store/missingPersonsStore';
import { SearchFilters } from '../components/Reports/SearchFilters';
import { ReportCard } from '../components/Reports/ReportCard';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Plus, Search, AlertTriangle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReportsPage: React.FC = () => {
  const { filteredReports, searchFilters, loadReports, isLoading } = useMissingPersonsStore();

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header avec effet glass */}
      <div className="glass-hero p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center mb-4">
              <Search className="h-8 w-8 text-primary-600 mr-3 animate-glow" />
              <h1 className="text-4xl font-bold text-gray-900 glass-shimmer">Rapports de personnes disparues</h1>
            </div>
            <p className="text-gray-700 text-lg">
              {filteredReports.length} rapport{filteredReports.length !== 1 ? 's' : ''} trouvé{filteredReports.length !== 1 ? 's' : ''}
              {Object.keys(searchFilters).length > 0 && ' (filtrés)'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link to="/signalement">
              <Button variant="glass" leftIcon={<Plus className="h-4 w-4" />}>
                Nouveau signalement
              </Button>
            </Link>
            <Link to="/signalement/alerte">
              <Button variant="glass" leftIcon={<FileText className="h-4 w-4" />}>
                Depuis une affiche
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <SearchFilters />

      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Chargement des rapports..." />
        </div>
      )}

      {filteredReports.length === 0 ? (
        <Card variant="elevated" className="text-center py-12">
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gray-100 rounded-full">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Aucun rapport trouvé</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {Object.keys(searchFilters).length > 0 
                ? 'Essayez d\'ajuster vos filtres de recherche pour voir plus de résultats.'
                : 'Il n\'y a actuellement aucun rapport de personne disparue.'
              }
            </p>
            <Link to="/signalement">
              <Button leftIcon={<AlertTriangle className="h-4 w-4" />}>
                Signaler une disparition
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
  );
};