import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMissingPersonsStore } from '../../store/missingPersonsStore';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { ArrowLeft, MapPin, Calendar, User, Phone, Mail, Share, AlertTriangle, Clock, Eye, Info, AlertCircle } from 'lucide-react';
import { CaseTypeBadge } from '../ui/CaseTypeBadge';
import { InvestigationObservations } from '../Investigation/InvestigationObservations';

export const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getReportById } = useMissingPersonsStore();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'investigation'>('details');
  
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

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
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
            <h1 className="text-3xl font-bold text-gray-900">
              {report.firstName} {report.lastName}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <p className="text-lg text-gray-600">
                Disparu(e) depuis {daysSinceMissing} jour{daysSinceMissing !== 1 ? 's' : ''}
              </p>
              <CaseTypeBadge 
                caseType={report.caseType} 
                priority={report.priority}
                isEmergency={report.isEmergency}
              />
            </div>
          </div>
          <Button onClick={handleShare} leftIcon={<Share className="h-4 w-4" />}>
            Partager le rapport
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Détails du rapport
            </button>
            <button
              onClick={() => setActiveTab('investigation')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'investigation'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <Card variant="elevated">
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
          <Card variant="elevated">
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
          <Card variant="elevated">
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card variant="elevated">
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
          <Card variant="elevated">
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

          {/* Emergency Contacts */}
          <Card variant="elevated">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Services d'urgence
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <dt className="text-gray-500 mb-1">Urgence</dt>
                  <dd>
                    <a href="tel:112" className="text-red-600 hover:text-red-700 font-bold text-lg">
                      112
                    </a>
                  </dd>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <dt className="text-gray-500 mb-1">Police</dt>
                  <dd>
                    <a href="tel:17" className="text-blue-600 hover:text-blue-700 font-bold text-lg">
                      17
                    </a>
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