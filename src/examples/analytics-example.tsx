import React, { useState, useEffect } from 'react';
import { AnalyticsDashboard } from '../components/Analytics';
import { AnalyticsService } from '../services/analytics';
import { AnalyticsData, AnalyticsQuery } from '../types/analytics';

/**
 * Exemple d'utilisation du système d'Analytics
 * Ce composant démontre comment intégrer et utiliser le tableau de bord analytique
 */
export const AnalyticsExample: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<string>('example-case-id');

  // Simuler le chargement des données
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Exemple de requête d'analytics
        const query: AnalyticsQuery = {
          missingPersonId: selectedCase,
          timeRange: 'all',
          filters: {
            // Exemple de filtres
            confidence: ['high', 'medium'],
            verified: true
          }
        };

        // Dans un vrai environnement, ceci ferait un appel à l'API
        // const data = await AnalyticsService.getAnalyticsData(query);
        
        // Pour l'exemple, on simule des données
        const mockData: AnalyticsData = {
          timeline: [
            {
              id: '1',
              type: 'observation',
              title: 'Observation par Jean Dupont',
              description: 'Personne aperçue dans le centre-ville, portant une veste bleue',
              timestamp: '2024-01-15T14:30:00Z',
              confidence: 'high',
              verified: true,
              location: {
                lat: 48.8566,
                lng: 2.3522,
                address: 'Place de la Bastille, Paris'
              },
              metadata: {
                observerName: 'Jean Dupont',
                distanceFromDisappearance: 5.2,
                hasPhotos: true
              }
            },
            {
              id: '2',
              type: 'verification',
              title: 'Observation vérifiée',
              description: 'Vérifiée par les autorités',
              timestamp: '2024-01-15T16:45:00Z',
              confidence: 'high',
              verified: true,
              location: {
                lat: 48.8566,
                lng: 2.3522,
                address: 'Place de la Bastille, Paris'
              }
            }
          ],
          heatmap: [
            {
              lat: 48.8566,
              lng: 2.3522,
              intensity: 0.8,
              observationCount: 15,
              city: 'Paris',
              confidence: { high: 8, medium: 5, low: 2 }
            },
            {
              lat: 48.8584,
              lng: 2.2945,
              intensity: 0.6,
              observationCount: 10,
              city: 'Paris',
              confidence: { high: 5, medium: 3, low: 2 }
            }
          ],
          temporalPatterns: [
            {
              hour: 14,
              dayOfWeek: 1,
              month: 0,
              observationCount: 5,
              averageConfidence: 2.8,
              verifiedPercentage: 80
            },
            {
              hour: 18,
              dayOfWeek: 2,
              month: 0,
              observationCount: 3,
              averageConfidence: 2.2,
              verifiedPercentage: 66.7
            }
          ],
          witnessCredibility: [
            {
              observerId: 'witness-1',
              observerName: 'Jean Dupont',
              totalObservations: 5,
              verifiedObservations: 4,
              credibilityScore: 85,
              factors: {
                consistency: 90,
                verificationRate: 80,
                detailQuality: 85,
                responseTime: 75,
                photoQuality: 95
              },
              trend: 'improving',
              lastObservation: '2024-01-15T14:30:00Z'
            },
            {
              observerId: 'witness-2',
              observerName: 'Marie Martin',
              totalObservations: 3,
              verifiedObservations: 2,
              credibilityScore: 70,
              factors: {
                consistency: 75,
                verificationRate: 66.7,
                detailQuality: 70,
                responseTime: 80,
                photoQuality: 60
              },
              trend: 'stable',
              lastObservation: '2024-01-14T10:15:00Z'
            }
          ],
          statistics: {
            totalObservations: 25,
            verifiedObservations: 18,
            averageConfidence: 2.4,
            topCities: [
              { city: 'Paris', count: 15 },
              { city: 'Lyon', count: 6 },
              { city: 'Marseille', count: 4 }
            ],
            peakHours: [
              { hour: 14, count: 8 },
              { hour: 18, count: 6 },
              { hour: 10, count: 4 }
            ],
            credibilityDistribution: {
              high: 12,
              medium: 8,
              low: 5
            }
          }
        };

        // Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAnalyticsData(mockData);
      } catch (err) {
        setError('Erreur lors du chargement des données d\'analytics');
        console.error('Error loading analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [selectedCase]);

  // Gestion des erreurs
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chargement des analytics...</h3>
          <p className="text-gray-600">Analyse des données d'investigation en cours</p>
        </div>
      </div>
    );
  }

  // Affichage du tableau de bord
  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête de démonstration */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Exemple - Système d'Analytics
                </h1>
                <p className="text-gray-600 mt-1">
                  Démonstration du tableau de bord analytique pour les observations d'investigation
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Cas sélectionné: <span className="font-medium">{selectedCase}</span>
                </div>
                
                <select
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="example-case-id">Cas d'exemple</option>
                  <option value="case-2">Cas 2</option>
                  <option value="case-3">Cas 3</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau de bord analytics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalyticsDashboard />
      </div>

      {/* Informations de démonstration */}
      <div className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Mode Démonstration
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Cet exemple utilise des données simulées pour démontrer les fonctionnalités du système d'analytics. 
                    Dans un environnement de production, ces données seraient récupérées depuis votre base de données d'observations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsExample;
