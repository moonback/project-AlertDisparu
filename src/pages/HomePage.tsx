import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMissingPersonsStore } from '../store/missingPersonsStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Search, MapPin, AlertTriangle, Users, Clock, Shield } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { reports } = useMissingPersonsStore();
  
  const activeReports = reports.filter(report => report.status === 'active');
  const recentReports = reports
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Search className="h-12 w-12 text-red-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">AlertDisparu</h1>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Une plateforme sécurisée, conforme au RGPD, connectant les familles, les autorités et les communautés 
              pour retrouver les personnes disparues rapidement et en toute sécurité.
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/inscription">
                  <Button size="lg" className="w-full sm:w-auto">
                    Commencer
                  </Button>
                </Link>
                <Link to="/connexion">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Se connecter
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signalement">
                  <Button size="lg" className="w-full sm:w-auto">
                    Signaler une disparition
                  </Button>
                </Link>
                <Link to="/rapports">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
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
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{activeReports.length}</div>
                <div className="text-sm text-gray-600">Cas actifs</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{reports.length}</div>
                <div className="text-sm text-gray-600">Rapports totaux</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {new Set(reports.map(r => r.locationDisappeared.city)).size}
                </div>
                <div className="text-sm text-gray-600">Villes couvertes</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Reports */}
      {isAuthenticated && recentReports.length > 0 && (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Rapports récents</h2>
              <Link to="/rapports">
                <Button variant="outline">Voir tous les rapports</Button>
              </Link>
            </div>
            <p className="mt-2 text-gray-600">Personnes disparues signalées récemment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {report.photo ? (
                      <img
                        src={report.photo}
                        alt={`${report.firstName} ${report.lastName}`}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Search className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {report.firstName} {report.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {report.age} ans • {report.locationDisappeared.city}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(report.dateDisappeared).toLocaleDateString()}
                      </div>
                      
                      <Link to={`/rapports/${report.id}`} className="mt-2 inline-block">
                        <Button size="sm" variant="outline">Voir les détails</Button>
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
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Pourquoi choisir AlertDisparu ?</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Construit avec la sécurité, la confidentialité et l'efficacité au cœur
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Conforme RGPD</h3>
                <p className="text-gray-600">
                  Conformité totale aux réglementations de protection des données. Votre vie privée et votre sécurité sont notre priorité absolue.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <MapPin className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Alertes de localisation</h3>
                <p className="text-gray-600">
                  Recevez des notifications lorsque vous êtes près d'un endroit où quelqu'un a disparu. Aidez en gardant les yeux ouverts.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Porté par la communauté</h3>
                <p className="text-gray-600">
                  Connectez les familles, les autorités et les bénévoles dans un effort coordonné pour retrouver les personnes disparues.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Emergency Information */}
      <div className="bg-red-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Situation d'urgence ?</h2>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            Si quelqu'un vient de disparaître ou si vous êtes en danger immédiat, contactez d'abord les services d'urgence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:15">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white text-red-600 hover:bg-gray-100">
                Appeler le 15
              </Button>
            </a>
            <a href="tel:17">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-red-600">
                Non-urgence : 17
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};