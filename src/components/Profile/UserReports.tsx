import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMissingPersonsStore } from '../../store/missingPersonsStore';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Calendar, MapPin, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

interface UserReport {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  photo?: string;
  dateDisappeared: string;
  locationDisappeared: {
    city: string;
    state: string;
  };
  description: string;
  status: 'active' | 'found' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export const UserReports: React.FC = () => {
  const { user } = useAuthStore();
  const { loadReports } = useMissingPersonsStore();
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserReports = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      try {
        // Charger tous les rapports
        await loadReports();
        
        // Filtrer les rapports créés par l'utilisateur
        const allReports = useMissingPersonsStore.getState().reports;
        const filteredReports = allReports.filter(report => 
          report.createdBy === user.id
        );

        setUserReports(filteredReports);
      } catch (err) {
        setError('Erreur lors du chargement de vos rapports');
        console.error('Erreur chargement rapports utilisateur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReports();
  }, [user?.id, loadReports]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'found':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Disparu(e)';
      case 'found':
        return 'Retrouvé(e)';
      case 'closed':
        return 'Fermé';
      default:
        return status;
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male':
        return 'Homme';
      case 'female':
        return 'Femme';
      case 'other':
        return 'Autre';
      default:
        return gender;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Mes rapports</h3>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Mes rapports</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Mes rapports</h3>
          <Link to="/signalement">
            <Button size="sm">
              Nouveau rapport
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-600">
          {userReports.length === 0 
            ? 'Aucun rapport créé pour le moment'
            : `${userReports.length} rapport${userReports.length !== 1 ? 's' : ''} créé${userReports.length !== 1 ? 's' : ''}`
          }
        </p>
      </CardHeader>
      <CardContent>
        {userReports.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Vous n'avez pas encore créé de rapport de disparition.
            </p>
            <Link to="/signalement">
              <Button>
                Créer votre premier rapport
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userReports.map((report) => (
              <div
                key={report.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    {report.photo ? (
                      <img
                        src={report.photo}
                        alt={`${report.firstName} ${report.lastName}`}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">
                          {report.firstName[0]}{report.lastName[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informations */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {report.firstName} {report.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {report.age} ans • {getGenderLabel(report.gender)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                      </div>
                    </div>

                    {/* Détails */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{report.locationDisappeared.city}, {report.locationDisappeared.state}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          Disparu(e) le {new Date(report.dateDisappeared).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {report.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Créé le {new Date(report.createdAt).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(report.createdAt).toLocaleTimeString('fr-FR')}
                      </div>
                      
                      <Link to={`/rapports/${report.id}`}>
                        <Button size="sm" variant="outline" className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir les détails
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
