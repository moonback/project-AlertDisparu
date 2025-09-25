import React, { useState, useEffect } from 'react';
import { BarChart3, Users, MapPin, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DataInsightsProps {
  onInsightClick: (insight: string) => void;
}

interface InsightsData {
  activeReports: number;
  totalObservations: number;
  verifiedObservations: number;
  recentObservations: number;
  highPriorityReports: number;
  emergencyReports: number;
  topCities: { city: string; count: number }[];
  recentActivity: string;
}

export const DataInsights: React.FC<DataInsightsProps> = ({ onInsightClick }) => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);

      // Récupérer les signalements actifs
      const { data: reports, error: reportsError } = await supabase
        .from('missing_persons')
        .select('*')
        .eq('status', 'active');

      if (reportsError) throw reportsError;

      // Récupérer les observations récentes (7 derniers jours)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: observations, error: obsError } = await supabase
        .from('investigation_observations')
        .select(`
          id,
          observation_date,
          observation_time,
          location_city,
          location_state,
          is_verified,
          confidence_level,
          description,
          observer_name
        `)
        .gte('observation_date', weekAgo.toISOString().split('T')[0]);

      if (obsError) throw obsError;

      // Calculer les statistiques
      const activeReports = reports?.length || 0;
      const highPriorityReports = reports?.filter(r => r.priority === 'high' || r.priority === 'critical').length || 0;
      const emergencyReports = reports?.filter(r => r.is_emergency).length || 0;

      // Observations
      const allObservations = observations || [];
      const verifiedObservations = allObservations.filter(o => o.is_verified).length;
      const recentObservations = allObservations.length;

      // Top villes
      const cityCount = new Map<string, number>();
      allObservations.forEach(obs => {
        const count = cityCount.get(obs.location_city) || 0;
        cityCount.set(obs.location_city, count + 1);
      });
      const topCities = Array.from(cityCount.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Activité récente
      const today = new Date().toLocaleDateString('fr-FR');
      const todayObservations = allObservations.filter(o => 
        new Date(o.observation_date).toLocaleDateString('fr-FR') === today
      ).length;

      const insightsData: InsightsData = {
        activeReports,
        totalObservations: recentObservations,
        verifiedObservations,
        recentObservations,
        highPriorityReports,
        emergencyReports,
        topCities,
        recentActivity: todayObservations > 0 
          ? `${todayObservations} observation(s) aujourd'hui`
          : 'Aucune activité aujourd\'hui'
      };

      setInsights(insightsData);
    } catch (error) {
      console.error('Erreur lors du chargement des insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Données en temps réel</h4>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Données en temps réel</h4>
        <div className="text-sm text-gray-500">
          Impossible de charger les données
        </div>
      </div>
    );
  }

  const insightsCards = [
    {
      icon: AlertTriangle,
      title: 'Signalements actifs',
      value: insights.activeReports,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      clickText: `Analyse les ${insights.activeReports} signalements actifs et leurs priorités`
    },
    {
      icon: BarChart3,
      title: 'Observations récentes',
      value: insights.recentObservations,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      clickText: `Analyse les ${insights.recentObservations} observations des 7 derniers jours`
    },
    {
      icon: Users,
      title: 'Observations vérifiées',
      value: insights.verifiedObservations,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      clickText: `Analyse les ${insights.verifiedObservations} observations vérifiées par les autorités`
    },
    {
      icon: TrendingUp,
      title: 'Haute priorité',
      value: insights.highPriorityReports,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      clickText: `Analyse les ${insights.highPriorityReports} cas de haute priorité nécessitant une attention immédiate`
    }
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700">Données en temps réel</h4>
      
      {/* Cartes d'insights */}
      <div className="grid grid-cols-2 gap-2">
        {insightsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <button
              key={index}
              onClick={() => onInsightClick(card.clickText)}
              className={`${card.bgColor} p-3 rounded-lg hover:shadow-md transition-shadow text-left`}
            >
              <div className="flex items-center space-x-2">
                <Icon size={16} className={card.color} />
                <div>
                  <div className="text-lg font-semibold text-gray-900">{card.value}</div>
                  <div className="text-xs text-gray-600">{card.title}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Activité récente */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Clock size={14} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Activité récente</span>
        </div>
        <div className="text-sm text-gray-600">{insights.recentActivity}</div>
        
        {insights.topCities.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">Top villes d'observation :</div>
            <div className="flex flex-wrap gap-1">
              {insights.topCities.map((city, index) => (
                <span
                  key={index}
                  className="inline-block bg-white px-2 py-1 rounded text-xs text-gray-600"
                >
                  {city.city} ({city.count})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions rapides basées sur les données */}
      <div className="space-y-2">
        <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          Actions suggérées
        </h5>
        <div className="space-y-1">
          {insights.emergencyReports > 0 && (
            <button
              onClick={() => onInsightClick("Analyse immédiate des cas d'urgence")}
              className="w-full text-left p-2 bg-red-50 hover:bg-red-100 rounded text-sm text-red-700 transition-colors"
            >
              🚨 {insights.emergencyReports} cas d'urgence nécessitent une attention
            </button>
          )}
          
          {insights.verifiedObservations < insights.recentObservations / 2 && (
            <button
              onClick={() => onInsightClick("Planifier la vérification des observations en attente")}
              className="w-full text-left p-2 bg-yellow-50 hover:bg-yellow-100 rounded text-sm text-yellow-700 transition-colors"
            >
              ⚠️ Vérification des observations en retard
            </button>
          )}
          
          {insights.recentObservations > 10 && (
            <button
              onClick={() => onInsightClick("Analyser les patterns et tendances récentes")}
              className="w-full text-left p-2 bg-blue-50 hover:bg-blue-100 rounded text-sm text-blue-700 transition-colors"
            >
              📊 Forte activité d'observation - analyser les tendances
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
