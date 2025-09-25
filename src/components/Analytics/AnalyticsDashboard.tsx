import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Alert } from '../ui/Alert';
import { 
  BarChart3, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Users, 
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Eye,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { AnalyticsService } from '../../services/analytics';
import { AnalyticsData, AnalyticsFilters, AnalyticsQuery } from '../../types/analytics';
import { TimelineChart } from './TimelineChart';
import { HeatmapMap } from './HeatmapMap';
import { TemporalPatternsChart } from './TemporalPatternsChart';
import { WitnessCredibilityTable } from './WitnessCredibilityTable';
import { StatisticsCards } from './StatisticsCards';

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const { id } = useParams<{ id: string }>();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('all');
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'heatmap' | 'patterns' | 'credibility'>('overview');

  // Charger les données d'analytics
  useEffect(() => {
    if (id) {
      loadAnalyticsData();
    }
  }, [id, timeRange, filters]);

  const loadAnalyticsData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const query: AnalyticsQuery = {
        missingPersonId: id,
        timeRange,
        filters
      };
      
      const data = await AnalyticsService.getAnalyticsData(query);
      setAnalyticsData(data);
    } catch (err) {
      setError('Erreur lors du chargement des données d\'analytics');
      console.error('Error loading analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as any);
  };

  const handleFilterChange = (newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${id}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!id) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert variant="error" title="Erreur">
          ID de cas manquant
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Chargement des données d'analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert variant="error" title="Erreur">
          <div className="space-y-3">
            <p>{error}</p>
            <Button onClick={loadAnalyticsData} leftIcon={<RefreshCw className="h-4 w-4" />}>
              Réessayer
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert variant="error" title="Aucune donnée">
          Aucune donnée d'analytics disponible pour ce cas.
        </Alert>
      </div>
    );
  }

  const timeRangeOptions = [
    { value: 'week', label: '7 derniers jours' },
    { value: 'month', label: '30 derniers jours' },
    { value: 'quarter', label: '3 derniers mois' },
    { value: 'year', label: 'Dernière année' },
    { value: 'all', label: 'Toutes les données' }
  ];

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'heatmap', label: 'Carte thermique', icon: MapPin },
    { id: 'patterns', label: 'Patterns temporels', icon: TrendingUp },
    { id: 'credibility', label: 'Crédibilité témoins', icon: Users }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec contrôles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord Analytique</h2>
          <p className="text-gray-600 mt-1">
            Analyse des observations et patterns d'investigation
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            options={timeRangeOptions}
            className="min-w-[200px]"
          />
          
          <Button
            variant="outline"
            onClick={loadAnalyticsData}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Actualiser
          </Button>
          
          <Button
            variant="outline"
            onClick={exportData}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques globales */}
      <StatisticsCards statistics={analyticsData.statistics} />

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Activité récente
                </h3>
              </CardHeader>
              <CardContent>
                <TimelineChart 
                  timeline={analyticsData.timeline.slice(0, 10)} 
                  compact={true}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Zones d'activité
                </h3>
              </CardHeader>
              <CardContent>
                <HeatmapMap 
                  heatmapData={analyticsData.heatmap} 
                  compact={true}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Patterns temporels
                </h3>
              </CardHeader>
              <CardContent>
                <TemporalPatternsChart 
                  patterns={analyticsData.temporalPatterns}
                  compact={true}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Top témoins
                </h3>
              </CardHeader>
              <CardContent>
                <WitnessCredibilityTable 
                  witnesses={analyticsData.witnessCredibility.slice(0, 5)}
                  compact={true}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'timeline' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Timeline des Observations
              </h3>
              <p className="text-sm text-gray-600">
                Chronologie complète des événements avec filtres interactifs
              </p>
            </CardHeader>
            <CardContent>
              <TimelineChart 
                timeline={analyticsData.timeline}
                compact={false}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'heatmap' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Carte Thermique Géographique
              </h3>
              <p className="text-sm text-gray-600">
                Visualisation des zones avec le plus d'observations
              </p>
            </CardHeader>
            <CardContent>
              <HeatmapMap 
                heatmapData={analyticsData.heatmap}
                compact={false}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'patterns' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Patterns Temporels
              </h3>
              <p className="text-sm text-gray-600">
                Analyse des tendances temporelles et saisonnières
              </p>
            </CardHeader>
            <CardContent>
              <TemporalPatternsChart 
                patterns={analyticsData.temporalPatterns}
                compact={false}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'credibility' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Crédibilité des Témoins
              </h3>
              <p className="text-sm text-gray-600">
                Évaluation de la fiabilité et de la qualité des témoignages
              </p>
            </CardHeader>
            <CardContent>
              <WitnessCredibilityTable 
                witnesses={analyticsData.witnessCredibility}
                compact={false}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
