import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Eye,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  Search
} from 'lucide-react';
import { WitnessCredibility } from '../../types/analytics';

interface WitnessCredibilityTableProps {
  witnesses: WitnessCredibility[];
  compact?: boolean;
}

export const WitnessCredibilityTable: React.FC<WitnessCredibilityTableProps> = ({
  witnesses,
  compact = false
}) => {
  const [sortBy, setSortBy] = useState<'credibility' | 'observations' | 'verification' | 'name'>('credibility');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWitness, setSelectedWitness] = useState<WitnessCredibility | null>(null);

  // Filtrer et trier les témoins
  const processedWitnesses = useMemo(() => {
    let filtered = witnesses.filter(witness =>
      witness.observerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'credibility':
          aValue = a.credibilityScore;
          bValue = b.credibilityScore;
          break;
        case 'observations':
          aValue = a.totalObservations;
          bValue = b.totalObservations;
          break;
        case 'verification':
          aValue = a.factors.verificationRate;
          bValue = b.factors.verificationRate;
          break;
        case 'name':
          aValue = a.observerName.toLowerCase();
          bValue = b.observerName.toLowerCase();
          break;
        default:
          aValue = a.credibilityScore;
          bValue = b.credibilityScore;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return compact ? filtered.slice(0, 5) : filtered;
  }, [witnesses, sortBy, sortOrder, searchTerm, compact]);

  const getCredibilityColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'default';
    return 'secondary';
  };

  const getCredibilityLabel = (score: number) => {
    if (score >= 80) return 'Excellente';
    if (score >= 70) return 'Bonne';
    if (score >= 60) return 'Moyenne';
    if (score >= 40) return 'Faible';
    return 'Très faible';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'En amélioration';
      case 'declining':
        return 'En déclin';
      default:
        return 'Stable';
    }
  };

  const getFactorScore = (score: number) => {
    if (score >= 80) return { color: 'text-green-600', label: 'Excellent' };
    if (score >= 60) return { color: 'text-blue-600', label: 'Bon' };
    if (score >= 40) return { color: 'text-yellow-600', label: 'Moyen' };
    return { color: 'text-red-600', label: 'Faible' };
  };

  // Statistiques globales
  const totalWitnesses = witnesses.length;
  const averageCredibility = witnesses.reduce((sum, w) => sum + w.credibilityScore, 0) / totalWitnesses;
  const topWitness = witnesses.reduce((max, w) => w.credibilityScore > max.credibilityScore ? w : max, witnesses[0] || { credibilityScore: 0, observerName: 'N/A' });
  const verifiedWitnesses = witnesses.filter(w => w.factors.verificationRate > 50).length;

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{totalWitnesses}</div>
            <div className="text-xs text-gray-600">Témoins</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{Math.round(averageCredibility)}</div>
            <div className="text-xs text-gray-600">Score moyen</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{verifiedWitnesses}</div>
            <div className="text-xs text-gray-600">Fiables</div>
          </div>
        </div>

        {/* Top témoins */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Top témoins</h4>
          {processedWitnesses.map((witness, index) => (
            <div key={witness.observerId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                  {witness.observerName}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getCredibilityColor(witness.credibilityScore)} size="sm">
                  {Math.round(witness.credibilityScore)}
                </Badge>
                <span className="text-xs text-gray-600">
                  {witness.totalObservations}
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
            <div className="text-2xl font-bold text-blue-600">{totalWitnesses}</div>
            <div className="text-sm text-gray-600">Témoins actifs</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{Math.round(averageCredibility)}</div>
            <div className="text-sm text-gray-600">Score moyen</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{verifiedWitnesses}</div>
            <div className="text-sm text-gray-600">Témoins fiables</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 truncate" title={topWitness.observerName}>
              {topWitness.observerName}
            </div>
            <div className="text-sm text-gray-600">Meilleur témoin</div>
          </CardContent>
        </Card>
      </div>

      {/* Contrôles de recherche et tri */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un témoin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Trier par:</span>
          <div className="flex space-x-1">
            {[
              { key: 'credibility', label: 'Crédibilité', icon: Star },
              { key: 'observations', label: 'Observations', icon: Eye },
              { key: 'verification', label: 'Vérification', icon: CheckCircle },
              { key: 'name', label: 'Nom', icon: Users }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={sortBy === key ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (sortBy === key) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(key as any);
                    setSortOrder('desc');
                  }
                }}
                leftIcon={<Icon className="h-4 w-4" />}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau des témoins */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Témoin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score de crédibilité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taux de vérification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedWitnesses.map((witness) => (
                  <tr key={witness.observerId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {witness.observerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Dernière observation: {new Date(witness.lastObservation).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getCredibilityColor(witness.credibilityScore)}>
                          {Math.round(witness.credibilityScore)}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {getCredibilityLabel(witness.credibilityScore)}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{witness.totalObservations}</div>
                      <div className="text-sm text-gray-500">
                        {witness.verifiedObservations} vérifiées
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {Math.round(witness.factors.verificationRate)}%
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${witness.factors.verificationRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(witness.trend)}
                        <span className="text-sm text-gray-900">
                          {getTrendLabel(witness.trend)}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWitness(witness)}
                        leftIcon={<Eye className="h-4 w-4" />}
                      >
                        Détails
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de détails du témoin */}
      {selectedWitness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Profil de crédibilité - {selectedWitness.observerName}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWitness(null)}
                >
                  Fermer
                </Button>
              </div>

              <div className="space-y-6">
                {/* Score global */}
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {Math.round(selectedWitness.credibilityScore)}
                  </div>
                  <div className="text-lg text-gray-700 mb-2">
                    {getCredibilityLabel(selectedWitness.credibilityScore)}
                  </div>
                  <Badge variant={getCredibilityColor(selectedWitness.credibilityScore)}>
                    Score de crédibilité
                  </Badge>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{selectedWitness.totalObservations}</div>
                    <div className="text-sm text-gray-600">Observations totales</div>
                  </div>
                  <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{selectedWitness.verifiedObservations}</div>
                    <div className="text-sm text-gray-600">Observations vérifiées</div>
                  </div>
                </div>

                {/* Facteurs de crédibilité */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Analyse des facteurs</h4>
                  <div className="space-y-4">
                    {[
                      { key: 'consistency', label: 'Cohérence des témoignages', icon: CheckCircle },
                      { key: 'verificationRate', label: 'Taux de vérification', icon: Star },
                      { key: 'detailQuality', label: 'Qualité des détails', icon: Eye },
                      { key: 'responseTime', label: 'Temps de réponse', icon: Clock },
                      { key: 'photoQuality', label: 'Qualité des photos', icon: Eye }
                    ].map(({ key, label, icon: Icon }) => {
                      const score = selectedWitness.factors[key as keyof typeof selectedWitness.factors];
                      const { color, label: scoreLabel } = getFactorScore(score);
                      
                      return (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Icon className="h-5 w-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900">{label}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  score >= 80 ? 'bg-green-500' :
                                  score >= 60 ? 'bg-blue-500' :
                                  score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${color}`}>
                              {Math.round(score)} ({scoreLabel})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tendance */}
                <div className="flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-lg">
                  {getTrendIcon(selectedWitness.trend)}
                  <span className="text-sm font-medium text-gray-900">
                    Tendance: {getTrendLabel(selectedWitness.trend)}
                  </span>
                </div>

                {/* Dernière activité */}
                <div className="text-center text-sm text-gray-600">
                  Dernière observation: {new Date(selectedWitness.lastObservation).toLocaleString('fr-FR')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
