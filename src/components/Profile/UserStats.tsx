import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useMissingPersonsStore } from '../../store/missingPersonsStore';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { FileText, Calendar, MapPin, AlertTriangle } from 'lucide-react';

interface UserStats {
  totalReports: number;
  activeReports: number;
  foundReports: number;
  closedReports: number;
  reportsThisMonth: number;
  reportsThisYear: number;
}

export const UserStats: React.FC = () => {
  const { user } = useAuthStore();
  const { loadReports } = useMissingPersonsStore();
  const [stats, setStats] = useState<UserStats>({
    totalReports: 0,
    activeReports: 0,
    foundReports: 0,
    closedReports: 0,
    reportsThisMonth: 0,
    reportsThisYear: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStats = async () => {
      if (!user?.id) return;

      setLoading(true);

      try {
        // Charger tous les rapports
        await loadReports();
        
        // Filtrer les rapports créés par l'utilisateur
        const allReports = useMissingPersonsStore.getState().reports;
        const userReports = allReports.filter(report => 
          report.createdBy === user.id
        );

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const newStats: UserStats = {
          totalReports: userReports.length,
          activeReports: userReports.filter(r => r.status === 'active').length,
          foundReports: userReports.filter(r => r.status === 'found').length,
          closedReports: userReports.filter(r => r.status === 'closed').length,
          reportsThisMonth: userReports.filter(r => {
            const reportDate = new Date(r.createdAt);
            return reportDate.getMonth() === currentMonth && 
                   reportDate.getFullYear() === currentYear;
          }).length,
          reportsThisYear: userReports.filter(r => {
            const reportDate = new Date(r.createdAt);
            return reportDate.getFullYear() === currentYear;
          }).length
        };

        setStats(newStats);
      } catch (error) {
        console.error('Erreur calcul statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateStats();
  }, [user?.id, loadReports]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Statistiques</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: 'Total des rapports',
      value: stats.totalReports,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Rapports actifs',
      value: stats.activeReports,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Personnes retrouvées',
      value: stats.foundReports,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Ce mois-ci',
      value: stats.reportsThisMonth,
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Statistiques</h3>
        <p className="text-sm text-gray-600">
          Vue d'ensemble de votre activité
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`${stat.bgColor} rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-2 rounded-lg bg-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Rapports cette année:</span>
            <span className="font-medium">{stats.reportsThisYear}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>Rapports fermés:</span>
            <span className="font-medium">{stats.closedReports}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
