import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMissingPersonsStore } from '../../store/missingPersonsStore';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { ArrowLeft, MapPin, Calendar, User, Phone, Mail, Share, Clock, Eye, Info, AlertCircle, Search, CheckCircle, TrendingUp, Camera, Plus } from 'lucide-react';
import { CaseTypeBadge } from '../ui/CaseTypeBadge';
import { InvestigationObservations } from '../Investigation/InvestigationObservations';
import { InvestigationObservation } from '../../types';

export const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getReportById, getObservationsByReportId } = useMissingPersonsStore();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'investigation'>('details');
  const [observations, setObservations] = useState<InvestigationObservation[]>([]);
  const [observationsLoading, setObservationsLoading] = useState(false);
  
  const report = id ? getReportById(id) : null;

  useEffect(() => {
    // Get user's current location for proximity alert
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  // Charger les observations quand le rapport change
  useEffect(() => {
    if (report?.id) {
      setObservationsLoading(true);
      getObservationsByReportId(report.id)
        .then(setObservations)
        .catch(console.error)
        .finally(() => setObservationsLoading(false));
    }
  }, [report?.id, getObservationsByReportId]);

  if (!report) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Eye className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Rapport introuvable</h1>
          <p className="mt-2 text-gray-600 mb-8">Le rapport de personne disparue que vous recherchez n'existe pas.</p>
          <Link to="/rapports">
            <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Retour aux rapports
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Disparu(e) : ${report.firstName} ${report.lastName}`,
          text: `Aidez à retrouver ${report.firstName} ${report.lastName}, vu(e) pour la dernière fois à ${report.locationDisappeared.city}`,
          url: window.location.href
        });
      } catch {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Calculate distance if user location is available
  const distance = userLocation && report.locationDisappeared.coordinates
    ? useMissingPersonsStore.getState().calculateDistance(
        userLocation.lat,
        userLocation.lng,
        report.locationDisappeared.coordinates.lat,
        report.locationDisappeared.coordinates.lng
      )
    : null;

  const isNearby = distance && distance < 50; // Within 50km
  const daysSinceMissing = Math.floor(
    (new Date().getTime() - new Date(report.dateDisappeared).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculer les statistiques des observations
  const getObservationStats = () => {
    if (!observations.length) return null;
    
    const verifiedCount = observations.filter(obs => obs.isVerified).length;
    const highConfidenceCount = observations.filter(obs => obs.confidenceLevel === 'high').length;
    const citiesCount = new Set(observations.map(obs => obs.location.city)).size;
    const photosCount = observations.reduce((total, obs) => total + (obs.photos?.length || 0), 0);
    const latestObservation = observations[0]; // Déjà triées par date décroissante
    
    return {
      total: observations.length,
      verified: verifiedCount,
      highConfidence: highConfidenceCount,
      cities: citiesCount,
      photos: photosCount,
      latest: latestObservation
    };
  };

  const stats = getObservationStats();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header avec effet glass */}
      <div className="glass-hero p-6 mb-8">
        <Link to="/rapports" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux rapports
        </Link>
        
        {/* Proximity Alert */}
        {isNearby && (
          <Alert variant="warning" title="Vous êtes près du dernier lieu connu" className="mb-6">
            Vous êtes à environ {distance?.toFixed(1)} km de l'endroit où {report.firstName} a été vu(e) pour la dernière fois. 
            Restez vigilant et contactez les autorités si vous voyez quelque chose.
          </Alert>
        )}
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 glass-shimmer">
              {report.firstName} {report.lastName}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <p className="text-lg text-gray-700">
                Disparu(e) depuis {daysSinceMissing} jour{daysSinceMissing !== 1 ? 's' : ''}
              </p>
              <CaseTypeBadge 
                caseType={report.caseType} 
                priority={report.priority}
                isEmergency={report.isEmergency}
              />
            </div>
          </div>
          <Button variant="glass" onClick={handleShare} leftIcon={<Share className="h-4 w-4" />}>
            Partager le rapport
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <div className="glass-card p-2">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'details'
                  ? 'glass-nav-item active'
                  : 'glass-nav-item'
              }`}
            >
              Détails du rapport
            </button>
            <button
              onClick={() => setActiveTab('investigation')}
              className={`py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'investigation'
                  ? 'glass-nav-item active'
                  : 'glass-nav-item'
              }`}
            >
              Investigation
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'details' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo and Basic Info */}
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  {report.photo ? (
                    <img
                      src={report.photo}
                      alt={`${report.firstName} ${report.lastName}`}
                      className="w-48 h-48 object-cover rounded-xl border border-gray-200 shadow-soft"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border border-gray-200 flex items-center justify-center shadow-soft">
                      <User className="h-24 w-24 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de base</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <dt className="text-sm font-medium text-gray-500 mb-1">Âge</dt>
                        <dd className="text-lg font-semibold text-gray-900">{report.age} ans</dd>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <dt className="text-sm font-medium text-gray-500 mb-1">Genre</dt>
                        <dd className="text-lg font-semibold text-gray-900">{report.gender === 'male' ? 'Homme' : report.gender === 'female' ? 'Femme' : 'Autre'}</dd>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant={report.status === 'active' ? 'error' : 'success'} size="lg">
                      {report.status === 'active' ? 'Disparu(e)' : 'Retrouvé(e)'}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{daysSinceMissing} jour{daysSinceMissing !== 1 ? 's' : ''}</span>
                    </div>
                    {report.isEmergency && (
                      <div className="flex items-center text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="font-medium">URGENCE</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Known Location */}
          <Card variant="glass">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                Dernier lieu connu
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 font-medium">{report.locationDisappeared.address}</p>
                  <p className="text-gray-600 mt-1">
                    {report.locationDisappeared.city}, {report.locationDisappeared.state}
                  </p>
                </div>
                <div className="flex items-center text-sm text-gray-500 bg-blue-50 rounded-lg p-3">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Vu(e) pour la dernière fois le {new Date(report.dateDisappeared).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card variant="glass">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary-600" />
                Description et circonstances
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{report.description}</p>
                </div>
                
                {report.circumstances && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Circonstances spécifiques</h4>
                    <p className="text-blue-800">{report.circumstances}</p>
                  </div>
                )}
                
                {report.timeDisappeared && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-1">Heure de disparition</h4>
                    <p className="text-gray-700">{report.timeDisappeared}</p>
                  </div>
                )}
                
                {report.clothingDescription && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-1">Vêtements portés</h4>
                    <p className="text-gray-700">{report.clothingDescription}</p>
                  </div>
                )}
                
                {report.personalItems && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-1">Objets personnels</h4>
                    <p className="text-gray-700">{report.personalItems}</p>
                  </div>
                )}
                
                {report.medicalInfo && (
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <h4 className="font-medium text-red-900 mb-1">Informations médicales importantes</h4>
                    <p className="text-red-800">{report.medicalInfo}</p>
                  </div>
                )}
                
                {report.behavioralInfo && (
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <h4 className="font-medium text-yellow-900 mb-1">Informations comportementales</h4>
                    <p className="text-yellow-800">{report.behavioralInfo}</p>
                  </div>
                )}

                {/* Section Investigation */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                    <Search className="h-5 w-5 mr-2" />
                    Investigation - Résumé des observations et témoignages
                  </h4>
                  
                  {observationsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-blue-600 mt-2">Chargement des observations...</p>
                    </div>
                  ) : stats ? (
                    <div className="space-y-4">
                      {/* Statistiques principales */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-blue-100">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 text-blue-600 mr-2" />
                            <div>
                              <dt className="text-xs font-medium text-blue-600">Total</dt>
                              <dd className="text-lg font-bold text-blue-900">{stats.total}</dd>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-100">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            <div>
                              <dt className="text-xs font-medium text-green-600">Vérifiées</dt>
                              <dd className="text-lg font-bold text-green-900">{stats.verified}</dd>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-purple-100">
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 text-purple-600 mr-2" />
                            <div>
                              <dt className="text-xs font-medium text-purple-600">Haute confiance</dt>
                              <dd className="text-lg font-bold text-purple-900">{stats.highConfidence}</dd>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-orange-100">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-orange-600 mr-2" />
                            <div>
                              <dt className="text-xs font-medium text-orange-600">Villes</dt>
                              <dd className="text-lg font-bold text-orange-900">{stats.cities}</dd>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Photos */}
                      {stats.photos > 0 && (
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="flex items-center">
                            <Camera className="h-4 w-4 text-gray-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                              {stats.photos} photo{stats.photos > 1 ? 's' : ''} disponible{stats.photos > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Dernière observation */}
                      {stats.latest && (
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Dernière observation</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{new Date(stats.latest.observationDate).toLocaleDateString('fr-FR')}</span>
                              {stats.latest.observationTime && (
                                <>
                                  <Clock className="h-4 w-4 ml-3 mr-1 text-gray-400" />
                                  <span>{stats.latest.observationTime}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{stats.latest.location.city}, {stats.latest.location.state}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <User className="h-4 w-4 mr-2 text-gray-400" />
                              <span>Par {stats.latest.observerName}</span>
                            </div>
                            <div className="mt-2">
                              <Badge variant={stats.latest.confidenceLevel === 'high' ? 'success' : stats.latest.confidenceLevel === 'medium' ? 'warning' : 'default'} size="sm">
                                Confiance {stats.latest.confidenceLevel === 'high' ? 'élevée' : stats.latest.confidenceLevel === 'medium' ? 'moyenne' : 'faible'}
                              </Badge>
                              {stats.latest.isVerified && (
                                <Badge variant="success" size="sm" className="ml-2">
                                  Vérifiée
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Lien vers l'onglet investigation */}
                      <div className="text-center pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveTab('investigation')}
                          leftIcon={<Search className="h-4 w-4" />}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          Voir toutes les observations
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Search className="h-12 w-12 text-blue-300 mx-auto mb-3" />
                      <p className="text-blue-600 text-sm">Aucune observation pour le moment</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab('investigation')}
                        className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-50"
                        leftIcon={<Plus className="h-4 w-4" />}
                      >
                        Ajouter la première observation
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card variant="glass">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-primary-600" />
                Informations de contact
              </h3>
              <p className="text-sm text-gray-600">
                Si vous avez des informations, veuillez contacter :
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Déclareur</dt>
                  <dd className="text-sm font-semibold text-gray-900">{report.reporterContact.name}</dd>
                  <dd className="text-xs text-gray-600">({report.reporterContact.relationship})</dd>
                </div>
                
                <div className="flex items-center text-sm text-gray-900 bg-blue-50 rounded-lg p-3">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  <a href={`tel:${report.reporterContact.phone}`} className="hover:text-primary-600 transition-colors font-medium">
                    {report.reporterContact.phone}
                  </a>
                </div>
                
                <div className="flex items-center text-sm text-gray-900 bg-green-50 rounded-lg p-3">
                  <Mail className="h-4 w-4 mr-2 text-green-600" />
                  <a href={`mailto:${report.reporterContact.email}`} className="hover:text-primary-600 transition-colors font-medium">
                    {report.reporterContact.email}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Information */}
          <Card variant="glass">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary-600" />
                Informations du rapport
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-gray-500 mb-1">ID du rapport</dt>
                  <dd className="text-gray-900 font-mono text-xs">{report.id}</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-gray-500 mb-1">Soumis le</dt>
                  <dd className="text-gray-900">
                    {new Date(report.createdAt).toLocaleDateString('fr-FR')} à{' '}
                    {new Date(report.createdAt).toLocaleTimeString('fr-FR')}
                  </dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-gray-500 mb-1">Dernière mise à jour</dt>
                  <dd className="text-gray-900">
                    {new Date(report.updatedAt).toLocaleDateString('fr-FR')}
                  </dd>
                </div>
              </div>
            </CardContent>
          </Card>

          

        </div>
      </div>
      ) : (
        <InvestigationObservations />
      )}
    </div>
  );
};