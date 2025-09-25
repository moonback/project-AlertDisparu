import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  BarChart3,
  Eye,
  CheckCircle,
  AlertTriangle,
  Sun,
  Moon,
  Cloud
} from 'lucide-react';
import { TemporalPattern } from '../../types/analytics';

interface TemporalPatternsChartProps {
  patterns: TemporalPattern[];
  compact?: boolean;
}

export const TemporalPatternsChart: React.FC<TemporalPatternsChartProps> = ({
  patterns,
  compact = false
}) => {
  const [selectedView, setSelectedView] = useState<'hour' | 'day' | 'month'>('hour');
  const [selectedMetric, setSelectedMetric] = useState<'count' | 'confidence' | 'verification'>('count');

  // Données agrégées par heure
  const hourlyData = useMemo(() => {
    const hourMap = new Map<number, {
      hour: number;
      observationCount: number;
      averageConfidence: number;
      verifiedPercentage: number;
      totalObservations: number;
    }>();

    patterns.forEach(pattern => {
      const hour = pattern.hour;
      if (!hourMap.has(hour)) {
        hourMap.set(hour, {
          hour,
          observationCount: 0,
          averageConfidence: 0,
          verifiedPercentage: 0,
          totalObservations: 0
        });
      }

      const data = hourMap.get(hour)!;
      data.observationCount += pattern.observationCount;
      data.totalObservations += pattern.observationCount;
      data.averageConfidence = (data.averageConfidence * (data.totalObservations - pattern.observationCount) + pattern.averageConfidence * pattern.observationCount) / data.totalObservations;
      data.verifiedPercentage = (data.verifiedPercentage * (data.totalObservations - pattern.observationCount) + pattern.verifiedPercentage * pattern.observationCount) / data.totalObservations;
    });

    return Array.from(hourMap.values()).sort((a, b) => a.hour - b.hour);
  }, [patterns]);

  // Données agrégées par jour de la semaine
  const dailyData = useMemo(() => {
    const dayMap = new Map<number, {
      dayOfWeek: number;
      dayName: string;
      observationCount: number;
      averageConfidence: number;
      verifiedPercentage: number;
      totalObservations: number;
    }>();

    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    patterns.forEach(pattern => {
      const day = pattern.dayOfWeek;
      if (!dayMap.has(day)) {
        dayMap.set(day, {
          dayOfWeek: day,
          dayName: dayNames[day],
          observationCount: 0,
          averageConfidence: 0,
          verifiedPercentage: 0,
          totalObservations: 0
        });
      }

      const data = dayMap.get(day)!;
      data.observationCount += pattern.observationCount;
      data.totalObservations += pattern.observationCount;
      data.averageConfidence = (data.averageConfidence * (data.totalObservations - pattern.observationCount) + pattern.averageConfidence * pattern.observationCount) / data.totalObservations;
      data.verifiedPercentage = (data.verifiedPercentage * (data.totalObservations - pattern.observationCount) + pattern.verifiedPercentage * pattern.observationCount) / data.totalObservations;
    });

    return Array.from(dayMap.values()).sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }, [patterns]);

  // Données agrégées par mois
  const monthlyData = useMemo(() => {
    const monthMap = new Map<number, {
      month: number;
      monthName: string;
      observationCount: number;
      averageConfidence: number;
      verifiedPercentage: number;
      totalObservations: number;
    }>();

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    patterns.forEach(pattern => {
      const month = pattern.month;
      if (!monthMap.has(month)) {
        monthMap.set(month, {
          month,
          monthName: monthNames[month],
          observationCount: 0,
          averageConfidence: 0,
          verifiedPercentage: 0,
          totalObservations: 0
        });
      }

      const data = monthMap.get(month)!;
      data.observationCount += pattern.observationCount;
      data.totalObservations += pattern.observationCount;
      data.averageConfidence = (data.averageConfidence * (data.totalObservations - pattern.observationCount) + pattern.averageConfidence * pattern.observationCount) / data.totalObservations;
      data.verifiedPercentage = (data.verifiedPercentage * (data.totalObservations - pattern.observationCount) + pattern.verifiedPercentage * pattern.observationCount) / data.totalObservations;
    });

    return Array.from(monthMap.values()).sort((a, b) => a.month - b.month);
  }, [patterns]);

  const getCurrentData = () => {
    switch (selectedView) {
      case 'hour': return hourlyData;
      case 'day': return dailyData;
      case 'month': return monthlyData;
      default: return hourlyData;
    }
  };

  const getMetricValue = (data: any) => {
    switch (selectedMetric) {
      case 'count': return data.observationCount;
      case 'confidence': return data.averageConfidence;
      case 'verification': return data.verifiedPercentage;
      default: return data.observationCount;
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'count': return 'Nombre d\'observations';
      case 'confidence': return 'Confiance moyenne';
      case 'verification': return 'Taux de vérification (%)';
      default: return 'Nombre d\'observations';
    }
  };

  const getMetricColor = (value: number, maxValue: number) => {
    const ratio = value / maxValue;
    if (ratio >= 0.8) return 'bg-blue-500';
    if (ratio >= 0.6) return 'bg-blue-400';
    if (ratio >= 0.4) return 'bg-blue-300';
    if (ratio >= 0.2) return 'bg-blue-200';
    return 'bg-blue-100';
  };

  const getTimeIcon = (hour: number) => {
    if (hour >= 6 && hour < 12) return <Sun className="h-4 w-4 text-yellow-500" />;
    if (hour >= 12 && hour < 18) return <Sun className="h-4 w-4 text-orange-500" />;
    if (hour >= 18 && hour < 22) return <Moon className="h-4 w-4 text-purple-500" />;
    return <Moon className="h-4 w-4 text-blue-500" />;
  };

  const getTimePeriod = (hour: number) => {
    if (hour >= 6 && hour < 12) return 'Matin';
    if (hour >= 12 && hour < 18) return 'Après-midi';
    if (hour >= 18 && hour < 22) return 'Soirée';
    return 'Nuit';
  };

  // Statistiques globales
  const totalObservations = patterns.reduce((sum, p) => sum + p.observationCount, 0);
  const peakHour = hourlyData.reduce((max, data) => 
    data.observationCount > max.observationCount ? data : max, hourlyData[0] || { hour: 0, observationCount: 0 }
  );
  const peakDay = dailyData.reduce((max, data) => 
    data.observationCount > max.observationCount ? data : max, dailyData[0] || { dayName: 'N/A', observationCount: 0 }
  );

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{peakHour.hour}h</div>
            <div className="text-xs text-gray-600">Heure de pointe</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{peakDay.dayName}</div>
            <div className="text-xs text-gray-600">Jour actif</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{totalObservations}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>

        {/* Graphique simple */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Activité par heure</h4>
          <div className="flex items-end space-x-1 h-20">
            {hourlyData.slice(0, 12).map((data) => {
              const maxCount = Math.max(...hourlyData.map(d => d.observationCount));
              const height = (data.observationCount / maxCount) * 100;
              
              return (
                <div key={data.hour} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full ${getMetricColor(data.observationCount, maxCount)} rounded-t`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${data.hour}h: ${data.observationCount} observations`}
                  />
                  <span className="text-xs text-gray-600 mt-1">{data.hour}h</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalObservations}</div>
            <div className="text-sm text-gray-600">Observations totales</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
              {getTimeIcon(peakHour.hour)}
              <span className="ml-2">{peakHour.hour}h</span>
            </div>
            <div className="text-sm text-gray-600">Heure de pointe</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{peakDay.dayName}</div>
            <div className="text-sm text-gray-600">Jour le plus actif</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(patterns.reduce((sum, p) => sum + p.averageConfidence, 0) / patterns.length * 100)}%
            </div>
            <div className="text-sm text-gray-600">Confiance moyenne</div>
          </CardContent>
        </Card>
      </div>

      {/* Contrôles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Vue:</span>
          <div className="flex space-x-1">
            {[
              { key: 'hour', label: 'Par heure', icon: Clock },
              { key: 'day', label: 'Par jour', icon: Calendar },
              { key: 'month', label: 'Par mois', icon: BarChart3 }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={selectedView === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedView(key as any)}
                leftIcon={<Icon className="h-4 w-4" />}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Métrique:</span>
          <div className="flex space-x-1">
            {[
              { key: 'count', label: 'Nombre', icon: BarChart3 },
              { key: 'confidence', label: 'Confiance', icon: CheckCircle },
              { key: 'verification', label: 'Vérification', icon: Eye }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={selectedMetric === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric(key as any)}
                leftIcon={<Icon className="h-4 w-4" />}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Graphique principal */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {getMetricLabel()} - {selectedView === 'hour' ? 'Par heure' : selectedView === 'day' ? 'Par jour de la semaine' : 'Par mois'}
          </h3>
          
          <div className="space-y-4">
            {getCurrentData().map((data, index) => {
              const value = getMetricValue(data);
              const maxValue = Math.max(...getCurrentData().map(d => getMetricValue(d)));
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {selectedView === 'hour' && getTimeIcon(data.hour)}
                      <span className="font-medium text-gray-900">
                        {selectedView === 'hour' 
                          ? `${data.hour}h (${getTimePeriod(data.hour)})`
                          : selectedView === 'day'
                          ? data.dayName
                          : data.monthName
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {selectedMetric === 'confidence' 
                          ? `${value.toFixed(1)}/3`
                          : selectedMetric === 'verification'
                          ? `${value.toFixed(1)}%`
                          : value
                        }
                      </span>
                      
                      {selectedMetric === 'confidence' && (
                        <Badge variant={
                          value >= 2.5 ? 'success' : 
                          value >= 2 ? 'default' : 'secondary'
                        } size="sm">
                          {value >= 2.5 ? 'Élevée' : value >= 2 ? 'Moyenne' : 'Faible'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getMetricColor(value, maxValue)}`}
                      style={{ width: `${Math.max((value / maxValue) * 100, 2)}%` }}
                    />
                  </div>
                  
                  {selectedMetric === 'count' && (
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Observations: {data.observationCount}</span>
                      <span>Confiance: {(data.averageConfidence * 100).toFixed(1)}%</span>
                      <span>Vérifiées: {data.verifiedPercentage.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Insights temporels
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Périodes d'activité</h4>
              <div className="space-y-2">
                {[
                  { period: 'Matin (6h-12h)', hours: hourlyData.filter(d => d.hour >= 6 && d.hour < 12) },
                  { period: 'Après-midi (12h-18h)', hours: hourlyData.filter(d => d.hour >= 12 && d.hour < 18) },
                  { period: 'Soirée (18h-22h)', hours: hourlyData.filter(d => d.hour >= 18 && d.hour < 22) },
                  { period: 'Nuit (22h-6h)', hours: hourlyData.filter(d => d.hour >= 22 || d.hour < 6) }
                ].map(({ period, hours }) => {
                  const total = hours.reduce((sum, h) => sum + h.observationCount, 0);
                  const percentage = (total / totalObservations) * 100;
                  
                  return (
                    <div key={period} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{period}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{total}</span>
                        <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Tendances hebdomadaires</h4>
              <div className="space-y-2">
                {dailyData.map((data) => {
                  const percentage = (data.observationCount / totalObservations) * 100;
                  const isWeekend = data.dayOfWeek === 0 || data.dayOfWeek === 6;
                  
                  return (
                    <div key={data.dayOfWeek} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">{data.dayName}</span>
                        {isWeekend && (
                          <Badge variant="default" size="sm">Weekend</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{data.observationCount}</span>
                        <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
