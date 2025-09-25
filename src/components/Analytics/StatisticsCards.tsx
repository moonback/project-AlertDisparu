import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  BarChart3, 
  CheckCircle, 
  TrendingUp, 
  MapPin, 
  Clock,
  Users,
  Eye,
  AlertTriangle,
  Star,
  Activity
} from 'lucide-react';

interface StatisticsCardsProps {
  statistics: {
    totalObservations: number;
    verifiedObservations: number;
    averageConfidence: number;
    topCities: Array<{ city: string; count: number }>;
    peakHours: Array<{ hour: number; count: number }>;
    credibilityDistribution: {
      high: number;
      medium: number;
      low: number;
    };
  };
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ statistics }) => {
  const verificationRate = statistics.totalObservations > 0 
    ? (statistics.verifiedObservations / statistics.totalObservations) * 100 
    : 0;

  const confidencePercentage = (statistics.averageConfidence / 3) * 100;

  const totalCredibility = statistics.credibilityDistribution.high + 
                          statistics.credibilityDistribution.medium + 
                          statistics.credibilityDistribution.low;

  const highCredibilityPercentage = totalCredibility > 0 
    ? (statistics.credibilityDistribution.high / totalCredibility) * 100 
    : 0;

  const getConfidenceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVerificationColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-blue-600';
    if (percentage >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (percentage: number) => {
    if (percentage >= 80) return 'Excellente';
    if (percentage >= 60) return 'Bonne';
    if (percentage >= 40) return 'Moyenne';
    return 'Faible';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Observations totales */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Observations totales</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalObservations}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Données collectées</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observations vérifiées */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Observations vérifiées</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.verifiedObservations}</p>
              <p className={`text-sm font-medium ${getVerificationColor(verificationRate)}`}>
                {verificationRate.toFixed(1)}% du total
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${verificationRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confiance moyenne */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confiance moyenne</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.averageConfidence.toFixed(1)}/3
              </p>
              <p className={`text-sm font-medium ${getConfidenceColor(confidencePercentage)}`}>
                {getConfidenceLabel(confidencePercentage)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${confidencePercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Qualité des témoignages */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Haute crédibilité</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.credibilityDistribution.high}</p>
              <p className={`text-sm font-medium ${getConfidenceColor(highCredibilityPercentage)}`}>
                {highCredibilityPercentage.toFixed(1)}% des témoignages
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex space-x-1">
              <div className="flex-1 bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ 
                    width: `${totalCredibility > 0 ? (statistics.credibilityDistribution.high / totalCredibility) * 100 : 0}%` 
                  }}
                />
              </div>
              <div className="flex-1 bg-yellow-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{ 
                    width: `${totalCredibility > 0 ? (statistics.credibilityDistribution.medium / totalCredibility) * 100 : 0}%` 
                  }}
                />
              </div>
              <div className="flex-1 bg-red-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ 
                    width: `${totalCredibility > 0 ? (statistics.credibilityDistribution.low / totalCredibility) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Élevée</span>
              <span>Moyenne</span>
              <span>Faible</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
