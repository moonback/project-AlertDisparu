import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useMissingPersonsStore } from '../../store/missingPersonsStore';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Clock, Eye, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'report_created' | 'report_viewed' | 'report_updated' | 'location_nearby';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<any>;
  color: string;
}

export const RecentActivity: React.FC = () => {
  const { user } = useAuthStore();
  const { loadReports } = useMissingPersonsStore();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user?.id) return;

      setLoading(true);

      try {
        // Charger tous les rapports
        await loadReports();
        
        // Simuler des activités récentes basées sur les données
        const allReports = useMissingPersonsStore.getState().reports;
        const userReports = allReports.filter(report => 
          report.createdBy === user.id
        );

        const mockActivities: ActivityItem[] = [
          ...userReports.slice(0, 3).map(report => ({
            id: `report_${report.id}`,
            type: 'report_created' as const,
            title: 'Rapport créé',
            description: `Vous avez créé un rapport pour ${report.firstName} ${report.lastName}`,
            timestamp: report.createdAt,
            icon: AlertTriangle,
            color: 'text-red-600'
          })),
          ...userReports.slice(0, 2).map(report => ({
            id: `viewed_${report.id}`,
            type: 'report_viewed' as const,
            title: 'Rapport consulté',
            description: `Votre rapport pour ${report.firstName} ${report.lastName} a été consulté`,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            icon: Eye,
            color: 'text-blue-600'
          })),
          ...userReports.slice(0, 1).map(report => ({
            id: `nearby_${report.id}`,
            type: 'location_nearby' as const,
            title: 'Position à proximité',
            description: `Quelqu'un a été signalé près du lieu de disparition de ${report.firstName}`,
            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            icon: MapPin,
            color: 'text-amber-600'
          }))
        ];

        // Trier par timestamp (plus récent en premier)
        mockActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setActivities(mockActivities.slice(0, 5)); // Limiter à 5 activités
      } catch (error) {
        console.error('Erreur chargement activités:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user?.id, loadReports]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `Il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? 's' : ''}`;
    
    return time.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Activité récente
          </h3>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Aucune activité récente à afficher.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
