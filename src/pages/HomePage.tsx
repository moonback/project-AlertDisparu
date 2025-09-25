import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMissingPersonsStore } from '../store/missingPersonsStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { 
  Search, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Shield, 
  Heart, 
  Eye, 
  Plus,
  Filter,
  TrendingUp,
  Calendar,
  FileText,
  Activity,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { reports, loadReports } = useMissingPersonsStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadReports();
  }, [loadReports]);
  
  // Statistiques et filtres
  const activeReports = reports.filter(report => report.status === 'active');
  const foundReports = reports.filter(report => report.status === 'found');
  const emergencyReports = reports.filter(report => report.isEmergency);
  const highPriorityReports = reports.filter(report => report.priority === 'high' || report.priority === 'critical');
  
  // Rapports récents selon la période sélectionnée
  const getFilteredReports = () => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (selectedTimeframe) {
      case '7d':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        filterDate.setDate(now.getDate() - 90);
        break;
      default:
        return reports;
    }
    
    return reports.filter(report => new Date(report.createdAt) >= filterDate);
  };

  const filteredReports = getFilteredReports();
  const recentReports = filteredReports
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  // Statistiques par type de cas
  const caseTypeStats = reports.reduce((acc, report) => {
    acc[report.caseType] = (acc[report.caseType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calcul du taux de résolution
  const resolutionRate = reports.length > 0 ? Math.round((foundReports.length / reports.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header du tableau de bord */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tableau de bord d'investigation</h1>
                <p className="text-gray-600 mt-1">Centre de contrôle pour la recherche de personnes disparues</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select 
                    value={selectedTimeframe} 
                    onChange={(e) => setSelectedTimeframe(e.target.value as '7d' | '30d' | '90d' | 'all')}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="7d">7 derniers jours</option>
                    <option value="30d">30 derniers jours</option>
                    <option value="90d">90 derniers jours</option>
                    <option value="all">Tout</option>
                  </select>
                </div>
                <Link to="/signalement">
                  <Button leftIcon={<Plus className="h-4 w-4" />}>
                    Nouveau signalement
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Cas actifs"
            value={activeReports.length}
            icon={<AlertTriangle className="h-5 w-5" />}
            description="En cours d'investigation"
          />
          <StatCard
            title="Cas résolus"
            value={foundReports.length}
            icon={<CheckCircle className="h-5 w-5" />}
            description={`${resolutionRate}% de taux de résolution`}
          />
          <StatCard
            title="Urgences"
            value={emergencyReports.length}
            icon={<Zap className="h-5 w-5" />}
            description="Cas prioritaires"
          />
          <StatCard
            title="Haute priorité"
            value={highPriorityReports.length}
            icon={<Target className="h-5 w-5" />}
            description="Cas critiques"
          />
        </div>

        {/* Graphiques et analyses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Répartition par type de cas */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Répartition par type de cas</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(caseTypeStats).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 capitalize">
                        {type.replace('_', ' ')}
                      </span>
                    </div>
                    <Badge variant="default">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Nouveaux signalements</span>
                  </div>
                  <span className="text-sm font-medium">{filteredReports.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Période sélectionnée</span>
                  </div>
                  <span className="text-sm font-medium">
                    {selectedTimeframe === 'all' ? 'Tout' : selectedTimeframe}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-600">Taux de résolution</span>
                  </div>
                  <span className="text-sm font-medium">{resolutionRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Actions rapides</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/signalement" className="block">
                  <Button variant="outline" className="w-full justify-start" leftIcon={<Plus className="h-4 w-4" />}>
                    Nouveau signalement
                  </Button>
                </Link>
                <Link to="/rapports" className="block">
                  <Button variant="outline" className="w-full justify-start" leftIcon={<Search className="h-4 w-4" />}>
                    Rechercher dans les rapports
                  </Button>
                </Link>
                <Link to="/carte" className="block">
                  <Button variant="outline" className="w-full justify-start" leftIcon={<MapPin className="h-4 w-4" />}>
                    Voir la carte interactive
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rapports récents et urgents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cas urgents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  Cas urgents
                </h3>
                <Badge variant="error">{emergencyReports.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {emergencyReports.length > 0 ? (
                <div className="space-y-4">
                  {emergencyReports.slice(0, 3).map((report) => (
                    <div key={report.id} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      {report.photo ? (
                        <img
                          src={report.photo}
                          alt={`${report.firstName} ${report.lastName}`}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {report.firstName} {report.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {report.age} ans • {report.locationDisappeared.city}
                        </p>
                        <p className="text-xs text-red-600 font-medium">
                          Disparu le {new Date(report.dateDisappeared).toLocaleDateString()}
                        </p>
                      </div>
                      <Link to={`/rapports/${report.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                  {emergencyReports.length > 3 && (
                    <div className="text-center">
                      <Link to="/rapports?filter=emergency">
                        <Button variant="outline" size="sm">
                          Voir tous les cas urgents ({emergencyReports.length})
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>Aucun cas urgent actuellement</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rapports récents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 text-blue-500 mr-2" />
                  Rapports récents
                </h3>
                <Link to="/rapports">
                  <Button variant="outline" size="sm" leftIcon={<Eye className="h-3 w-3" />}>
                    Voir tout
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentReports.length > 0 ? (
                <div className="space-y-4">
                  {recentReports.slice(0, 4).map((report) => (
                    <div key={report.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      {report.photo ? (
                        <img
                          src={report.photo}
                          alt={`${report.firstName} ${report.lastName}`}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {report.firstName} {report.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {report.age} ans • {report.locationDisappeared.city}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant={report.priority === 'high' || report.priority === 'critical' ? 'error' : 'default'}
                            className="text-xs"
                          >
                            {report.priority}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Link to={`/rapports/${report.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Aucun rapport récent</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      

      {/* Message pour les utilisateurs non connectés */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-br from-primary-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="mb-8">
              <Shield className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Accès sécurisé requis</h2>
              <p className="text-lg text-gray-600 mb-8">
                Ce tableau de bord d'investigation nécessite une authentification pour garantir la sécurité des données sensibles.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/inscription">
                <Button size="lg" leftIcon={<Heart className="h-5 w-5" />}>
                  Créer un compte
                </Button>
              </Link>
              <Link to="/connexion">
                <Button variant="outline" size="lg">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};