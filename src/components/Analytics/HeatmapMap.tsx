import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  MapPin, 
  Eye, 
  TrendingUp, 
  Users,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { HeatmapData } from '../../types/analytics';

interface HeatmapMapProps {
  heatmapData: HeatmapData[];
  compact?: boolean;
}

export const HeatmapMap: React.FC<HeatmapMapProps> = ({
  heatmapData,
  compact = false
}) => {
  const [selectedLocation, setSelectedLocation] = useState<HeatmapData | null>(null);
  const [sortBy, setSortBy] = useState<'intensity' | 'count' | 'confidence'>('intensity');

  // Trier et filtrer les données
  const processedData = useMemo(() => {
    let sorted = [...heatmapData];

    switch (sortBy) {
      case 'intensity':
        sorted.sort((a, b) => b.intensity - a.intensity);
        break;
      case 'count':
        sorted.sort((a, b) => b.observationCount - a.observationCount);
        break;
      case 'confidence':
        const confidenceScore = (data: HeatmapData) => 
          (data.confidence.high * 3 + data.confidence.medium * 2 + data.confidence.low * 1) / 
          data.observationCount;
        sorted.sort((a, b) => confidenceScore(b) - confidenceScore(a));
        break;
    }

    return compact ? sorted.slice(0, 5) : sorted;
  }, [heatmapData, sortBy, compact]);

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 0.8) return 'bg-red-500';
    if (intensity >= 0.6) return 'bg-orange-500';
    if (intensity >= 0.4) return 'bg-yellow-500';
    if (intensity >= 0.2) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getIntensityTextColor = (intensity: number) => {
    if (intensity >= 0.4) return 'text-white';
    return 'text-gray-900';
  };

  const getConfidenceScore = (data: HeatmapData) => {
    const total = data.confidence.high + data.confidence.medium + data.confidence.low;
    if (total === 0) return 0;
    return ((data.confidence.high * 3 + data.confidence.medium * 2 + data.confidence.low * 1) / total) * 100;
  };

  const getConfidenceLevel = (score: number) => {
    if (score >= 80) return 'Élevée';
    if (score >= 60) return 'Moyenne';
    return 'Faible';
  };

  const getConfidenceBadgeColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'default';
    return 'secondary';
  };

  // Statistiques globales
  const totalObservations = heatmapData.reduce((sum, data) => sum + data.observationCount, 0);
  const averageIntensity = heatmapData.reduce((sum, data) => sum + data.intensity, 0) / heatmapData.length;
  const topCity = heatmapData.reduce((max, data) => 
    data.observationCount > max.observationCount ? data : max, heatmapData[0] || { observationCount: 0, city: 'N/A' }
  );

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{totalObservations}</div>
            <div className="text-sm text-gray-600">Observations totales</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{heatmapData.length}</div>
            <div className="text-sm text-gray-600">Zones couvertes</div>
          </div>
        </div>

        {/* Top 5 des zones */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Zones les plus actives</h4>
          {processedData.map((data, index) => (
            <div key={`${data.lat}-${data.lng}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getIntensityColor(data.intensity)}`} />
                <span className="text-sm font-medium text-gray-900">{data.city}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="default" size="sm">
                  {data.observationCount}
                </Badge>
                <span className="text-xs text-gray-600">
                  {Math.round(data.intensity * 100)}%
                </span>
              </div>
            </div>
          ))}
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
            <div className="text-2xl font-bold text-green-600">{heatmapData.length}</div>
            <div className="text-sm text-gray-600">Zones géographiques</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{Math.round(averageIntensity * 100)}%</div>
            <div className="text-sm text-gray-600">Intensité moyenne</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{topCity.city}</div>
            <div className="text-sm text-gray-600">Zone la plus active</div>
          </CardContent>
        </Card>
      </div>

      {/* Contrôles de tri */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Trier par:</span>
          <div className="flex space-x-1">
            {[
              { key: 'intensity', label: 'Intensité', icon: TrendingUp },
              { key: 'count', label: 'Nombre', icon: Users },
              { key: 'confidence', label: 'Confiance', icon: CheckCircle }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={sortBy === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(key as any)}
                leftIcon={<Icon className="h-4 w-4" />}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          {processedData.length} zone{processedData.length > 1 ? 's' : ''} affichée{processedData.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Légende d'intensité:</span>
        <div className="flex items-center space-x-2">
          {[
            { intensity: 0.8, label: 'Très élevée' },
            { intensity: 0.6, label: 'Élevée' },
            { intensity: 0.4, label: 'Moyenne' },
            { intensity: 0.2, label: 'Faible' },
            { intensity: 0, label: 'Très faible' }
          ].map(({ intensity, label }) => (
            <div key={intensity} className="flex items-center space-x-1">
              <div className={`w-3 h-3 rounded-full ${getIntensityColor(intensity)}`} />
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des zones */}
      <div className="space-y-3">
        {processedData.map((data, index) => {
          const confidenceScore = getConfidenceScore(data);
          const confidenceLevel = getConfidenceLevel(confidenceScore);
          
          return (
            <div
              key={`${data.lat}-${data.lng}`}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all"
              onClick={() => setSelectedLocation(data)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Indicateur d'intensité */}
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full ${getIntensityColor(data.intensity)} flex items-center justify-center`}>
                      <span className={`text-sm font-bold ${getIntensityTextColor(data.intensity)}`}>
                        {index + 1}
                      </span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
                      <MapPin className="h-2 w-2 text-gray-600" />
                    </div>
                  </div>

                  {/* Informations de la zone */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{data.city}</h3>
                      <Badge variant={getConfidenceBadgeColor(confidenceScore)} size="sm">
                        {confidenceLevel}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{data.observationCount} observation{data.observationCount > 1 ? 's' : ''}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{Math.round(data.intensity * 100)}% intensité</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>{data.confidence.high} haute confiance</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Ouvrir la localisation dans Google Maps
                      window.open(
                        `https://www.google.com/maps?q=${data.lat},${data.lng}`,
                        '_blank'
                      );
                    }}
                    leftIcon={<MapPin className="h-4 w-4" />}
                  >
                    Voir sur carte
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLocation(data);
                    }}
                    leftIcon={<Eye className="h-4 w-4" />}
                  >
                    Détails
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de détails */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Détails de la zone
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLocation(null)}
                >
                  Fermer
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Localisation</h4>
                  <p className="text-gray-700">{selectedLocation.city}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Coordonnées: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Observations</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedLocation.observationCount}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Intensité</h4>
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full ${getIntensityColor(selectedLocation.intensity)}`} />
                      <span className="text-lg font-semibold">
                        {Math.round(selectedLocation.intensity * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Répartition par confiance</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">Haute confiance</span>
                      </div>
                      <span className="text-sm font-medium">{selectedLocation.confidence.high}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-sm">Confiance moyenne</span>
                      </div>
                      <span className="text-sm font-medium">{selectedLocation.confidence.medium}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm">Faible confiance</span>
                      </div>
                      <span className="text-sm font-medium">{selectedLocation.confidence.low}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      window.open(
                        `https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`,
                        '_blank'
                      );
                    }}
                    leftIcon={<MapPin className="h-4 w-4" />}
                  >
                    Ouvrir dans Google Maps
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Copier les coordonnées
                      navigator.clipboard.writeText(`${selectedLocation.lat}, ${selectedLocation.lng}`);
                    }}
                  >
                    Copier coordonnées
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
