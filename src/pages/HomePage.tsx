import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMissingPersonsStore } from '../store/missingPersonsStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
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

      {/* Header du tableau de bord futuriste */}
      <div className="bg-dark-800/50 backdrop-blur-xl border-b border-dark-700/50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-transparent to-neon-purple/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-system-success rounded-full animate-pulse"></div>
                    <span className="text-xs font-mono text-dark-400 tracking-wider">SYSTEM STATUS: ONLINE</span>
                  </div>
                  <div className="w-px h-4 bg-dark-600"></div>
                  <span className="text-xs font-mono text-dark-400 tracking-wider">LAST UPDATE: {new Date().toLocaleTimeString()}</span>
                </div>
                <h1 className="text-4xl font-display font-bold text-white mb-2">
                  TABLEAU DE BORD D'INVESTIGATION
                </h1>
                <p className="text-dark-300 font-mono text-sm tracking-wider">
                  CENTRE DE CONTRÔLE POUR LA RECHERCHE DE PERSONNES DISPARUES
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-dark-700/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-dark-600/30">
                  <Filter className="h-4 w-4 text-neon-blue" />
                  <select 
                    value={selectedTimeframe} 
                    onChange={(e) => setSelectedTimeframe(e.target.value as '7d' | '30d' | '90d' | 'all')}
                    className="bg-transparent text-white font-mono text-sm border-none focus:outline-none focus:ring-0"
                  >
                    <option value="7d" className="bg-dark-800">7 DERNIERS JOURS</option>
                    <option value="30d" className="bg-dark-800">30 DERNIERS JOURS</option>
                    <option value="90d" className="bg-dark-800">90 DERNIERS JOURS</option>
                    <option value="all" className="bg-dark-800">TOUT</option>
                  </select>
                </div>
                <Link to="/signalement">
                  <Button variant="neon" size="lg" leftIcon={<Plus className="h-4 w-4" />} glow>
                    NOUVEAU SIGNALEMENT
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales futuristes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Cas actifs */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6 hover:border-neon-blue/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-neon-blue/10 rounded-xl border border-neon-blue/30">
                  <AlertTriangle className="h-6 w-6 text-neon-blue" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-display font-bold text-white">{activeReports.length}</div>
                  <div className="text-xs font-mono text-dark-400 tracking-wider">ACTIFS</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-dark-200">EN COURS D'INVESTIGATION</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-1 bg-dark-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-xs font-mono text-neon-blue">100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cas résolus */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-system-success/10 to-neon-green/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6 hover:border-system-success/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-system-success/10 rounded-xl border border-system-success/30">
                  <CheckCircle className="h-6 w-6 text-system-success" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-display font-bold text-white">{foundReports.length}</div>
                  <div className="text-xs font-mono text-dark-400 tracking-wider">RÉSOLUS</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-dark-200">TAUX DE RÉSOLUTION</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-1 bg-dark-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-system-success to-neon-green rounded-full" style={{ width: `${resolutionRate}%` }}></div>
                  </div>
                  <span className="text-xs font-mono text-system-success">{resolutionRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Urgences */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-system-error/10 to-neon-red/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6 hover:border-system-error/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-system-error/10 rounded-xl border border-system-error/30">
                  <Zap className="h-6 w-6 text-system-error animate-pulse" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-display font-bold text-white">{emergencyReports.length}</div>
                  <div className="text-xs font-mono text-dark-400 tracking-wider">URGENCES</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-dark-200">CAS PRIORITAIRES</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-1 bg-dark-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-system-error to-neon-red rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-xs font-mono text-system-error">CRITIQUE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Haute priorité */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-system-warning/10 to-neon-amber/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6 hover:border-system-warning/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-system-warning/10 rounded-xl border border-system-warning/30">
                  <Target className="h-6 w-6 text-system-warning" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-display font-bold text-white">{highPriorityReports.length}</div>
                  <div className="text-xs font-mono text-dark-400 tracking-wider">HAUTE PRIORITÉ</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-dark-200">CAS CRITIQUES</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-1 bg-dark-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-system-warning to-neon-amber rounded-full"></div>
                  </div>
                  <span className="text-xs font-mono text-system-warning">ÉLEVÉE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques et analyses futuristes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Répartition par type de cas */}
          <Card variant="cyber" glow>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-neon-green" />
                <CardTitle>RÉPARTITION PAR TYPE DE CAS</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(caseTypeStats).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-2 bg-dark-700/30 rounded-lg border border-dark-600/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse"></div>
                      <span className="text-sm text-dark-200 font-mono uppercase tracking-wider">
                        {type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="px-3 py-1 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                      <span className="text-sm font-display font-bold text-neon-green">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-neon-blue" />
                <CardTitle>ACTIVITÉ RÉCENTE</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-4 w-4 text-system-success" />
                    <span className="text-sm text-dark-200 font-mono">NOUVEAUX SIGNALEMENTS</span>
                  </div>
                  <span className="text-lg font-display font-bold text-white">{filteredReports.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-neon-blue" />
                    <span className="text-sm text-dark-200 font-mono">PÉRIODE SÉLECTIONNÉE</span>
                  </div>
                  <span className="text-lg font-display font-bold text-neon-blue">
                    {selectedTimeframe === 'all' ? 'TOUT' : selectedTimeframe.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-4 w-4 text-neon-purple" />
                    <span className="text-sm text-dark-200 font-mono">TAUX DE RÉSOLUTION</span>
                  </div>
                  <span className="text-lg font-display font-bold text-neon-purple">{resolutionRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card variant="neon" glow>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-neon-blue" />
                <CardTitle>ACTIONS RAPIDES</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/signalement" className="block">
                  <Button variant="cyber" className="w-full justify-start" leftIcon={<Plus className="h-4 w-4" />}>
                    NOUVEAU SIGNALEMENT
                  </Button>
                </Link>
                <Link to="/rapports" className="block">
                  <Button variant="outline" className="w-full justify-start" leftIcon={<Search className="h-4 w-4" />}>
                    RECHERCHER DANS LES RAPPORTS
                  </Button>
                </Link>
                <Link to="/carte" className="block">
                  <Button variant="outline" className="w-full justify-start" leftIcon={<MapPin className="h-4 w-4" />}>
                    VOIR LA CARTE INTERACTIVE
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