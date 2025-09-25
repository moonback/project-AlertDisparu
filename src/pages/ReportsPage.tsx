import React, { useEffect } from 'react';
import { useMissingPersonsStore } from '../store/missingPersonsStore';
import { SearchFilters } from '../components/Reports/SearchFilters';
import { ReportCard } from '../components/Reports/ReportCard';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReportsPage: React.FC = () => {
  const { filteredReports, searchFilters, loadReports, isLoading } = useMissingPersonsStore();

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Missing Persons Reports</h1>
          <p className="mt-2 text-gray-600">
            {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
            {Object.keys(searchFilters).length > 0 && ' (filtered)'}
          </p>
        </div>
        
        <Link to="/signalement">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nouveau signalement</span>
          </Button>
        </Link>
      </div>

      <SearchFilters />

      {isLoading && (
        <div className="text-center text-gray-600 py-8">Chargement des rapports...</div>
      )}

      {filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
          <p className="text-gray-600 mb-6">
            {Object.keys(searchFilters).length > 0 
              ? 'Try adjusting your search filters to see more results.'
              : 'There are currently no missing person reports.'
            }
          </p>
          <Link to="/signalement">
            <Button>Signaler une disparition</Button>
          </Link>
        </div>
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