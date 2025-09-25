import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMissingPersonsStore } from '../store/missingPersonsStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Search, MapPin, AlertTriangle, Users, Clock, Shield, Heart, Eye } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { reports, loadReports } = useMissingPersonsStore();

  useEffect(() => {
    loadReports();
  }, [loadReports]);
  
  const activeReports = reports.filter(report => report.status === 'active');
  const recentReports = reports
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-50 via-white to-amber-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <Search className="h-16 w-16 text-primary-600 mr-4" />
                <div className="absolute -top-2 -right-2 h-6 w-6 bg-amber-500 rounded-full animate-pulse"></div>
              </div>
              <h1 className="text-5xl font-bold text-gray-900">AlertDisparu</h1>
            </div>
            <p className="text-xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              Une plateforme sécurisée, conforme au RGPD, connectant les familles, les autorités et les communautés 
              pour retrouver les personnes disparues rapidement et en toute sécurité.
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/inscription">
                  <Button size="xl" className="w-full sm:w-auto" leftIcon={<Heart className="h-6 w-6" />}>
                    Rejoindre la communauté
                  </Button>
                </Link>
                <Link to="/connexion">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">
                    Se connecter
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signalement">
                  <Button size="xl" className="w-full sm:w-auto" leftIcon={<AlertTriangle className="h-6 w-6" />}>
                    Signaler une disparition
                  </Button>
                </Link>
                <Link to="/rapports">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto" leftIcon={<Search className="h-6 w-6" />}>
                    Rechercher les rapports
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      {isAuthenticated && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Impact de la communauté</h2>
              <p className="text-gray-600">Ensemble, nous faisons la différence</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card variant="elevated" className="text-center animate-fade-in">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-red-100 rounded-full">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{activeReports.length}</div>
                  <div className="text-lg font-semibold text-gray-700 mb-1">Cas actifs</div>
                  <div className="text-sm text-gray-500">Personnes recherchées actuellement</div>
                </CardContent>
              </Card>
              
              <Card variant="elevated" className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{reports.length}</div>
                  <div className="text-lg font-semibold text-gray-700 mb-1">Rapports totaux</div>
                  <div className="text-sm text-gray-500">Signalements enregistrés</div>
                </CardContent>
              </Card>
              
              <Card variant="elevated" className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <MapPin className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {new Set(reports.map(r => r.locationDisappeared.city)).size}
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mb-1">Villes couvertes</div>
                  <div className="text-sm text-gray-500">Communautés actives</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Recent Reports */}
      {isAuthenticated && recentReports.length > 0 && (
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-gray-900">Rapports récents</h2>
              <Link to="/rapports">
                <Button variant="outline" leftIcon={<Eye className="h-4 w-4" />}>
                  Voir tous les rapports
                </Button>
              </Link>
            </div>
            <p className="text-gray-600">Personnes disparues signalées récemment par la communauté</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentReports.map((report, index) => (
              <Card key={report.id} variant="elevated" className="hover:shadow-strong transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {report.photo ? (
                      <img
                        src={report.photo}
                        alt={`${report.firstName} ${report.lastName}`}
                        className="w-20 h-20 object-cover rounded-xl shadow-soft"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center shadow-soft">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {report.firstName} {report.lastName}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {report.age} ans • {report.locationDisappeared.city}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Clock className="h-4 w-4 mr-2" />
                        Disparu le {new Date(report.dateDisappeared).toLocaleDateString()}
                      </div>
                      
                      <Link to={`/rapports/${report.id}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          Voir les détails
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Pourquoi choisir AlertDisparu ?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Construit avec la sécurité, la confidentialité et l'efficacité au cœur de notre mission
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="elevated" className="text-center hover:shadow-strong transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-red-100 rounded-full">
                    <Shield className="h-12 w-12 text-red-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Conforme RGPD</h3>
                <p className="text-gray-600 leading-relaxed">
                  Conformité totale aux réglementations de protection des données. Votre vie privée et votre sécurité sont notre priorité absolue.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="text-center hover:shadow-strong transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <MapPin className="h-12 w-12 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Alertes de localisation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Recevez des notifications lorsque vous êtes près d'un endroit où quelqu'un a disparu. Aidez en gardant les yeux ouverts.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="text-center hover:shadow-strong transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-green-100 rounded-full">
                    <Users className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Porté par la communauté</h3>
                <p className="text-gray-600 leading-relaxed">
                  Connectez les familles, les autorités et les bénévoles dans un effort coordonné pour retrouver les personnes disparues.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      
    </div>
  );
};