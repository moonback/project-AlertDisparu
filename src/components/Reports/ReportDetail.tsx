import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMissingPersonsStore } from '../../store/missingPersonsStore';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { ArrowLeft, MapPin, Calendar, User, Phone, Mail, Share, AlertTriangle } from 'lucide-react';

export const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getReportById } = useMissingPersonsStore();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
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
          <h1 className="text-2xl font-bold text-gray-900">Rapport introuvable</h1>
          <p className="mt-2 text-gray-600">Le rapport de personne disparue que vous recherchez n'existe pas.</p>
          <Link to="/rapports" className="mt-4 inline-block">
            <Button>Retour aux rapports</Button>
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
      } catch (err) {
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
        <Link to="/rapports" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux rapports
        </Link>
        
        {/* Proximity Alert */}
        {isNearby && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-amber-800">
                  Vous êtes près du dernier lieu connu
                </h3>
                <p className="text-sm text-amber-700">
                  Vous êtes à environ {distance?.toFixed(1)} km de l'endroit où {report.firstName} a été vu(e) pour la dernière fois. 
                  Restez vigilant et contactez les autorités si vous voyez quelque chose.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {report.firstName} {report.lastName}
            </h1>
            <p className="mt-1 text-lg text-gray-600">
              Disparu(e) depuis {daysSinceMissing} jour{daysSinceMissing !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={handleShare} className="flex items-center space-x-2">
            <Share className="h-4 w-4" />
            <span>Partager le rapport</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo and Basic Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  {report.photo ? (
                    <img
                      src={report.photo}
                      alt={`${report.firstName} ${report.lastName}`}
                      className="w-48 h-48 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      <User className="h-24 w-24 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Informations de base</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Âge</dt>
                        <dd className="text-sm text-gray-900">{report.age} ans</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Genre</dt>
                        <dd className="text-sm text-gray-900">{report.gender === 'male' ? 'Homme' : report.gender === 'female' ? 'Femme' : 'Autre'}</dd>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Statut</h4>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      report.status === 'active' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {report.status === 'active' ? 'Disparu(e)' : 'Retrouvé(e)'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Known Location */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Dernier lieu connu
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-900">{report.locationDisappeared.address}</p>
                <p className="text-gray-600">
                  {report.locationDisappeared.city}, {report.locationDisappeared.state}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Vu(e) pour la dernière fois le {new Date(report.dateDisappeared).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Description et circonstances</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{report.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Informations de contact</h3>
              <p className="text-sm text-gray-600">
                Si vous avez des informations, veuillez contacter :
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Déclareur</dt>
                  <dd className="text-sm text-gray-900">{report.reporterContact.name}</dd>
                  <dd className="text-xs text-gray-600">({report.reporterContact.relationship})</dd>
                </div>
                
                <div className="flex items-center text-sm text-gray-900">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <a href={`tel:${report.reporterContact.phone}`} className="hover:text-red-600">
                    {report.reporterContact.phone}
                  </a>
                </div>
                
                <div className="flex items-center text-sm text-gray-900">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <a href={`mailto:${report.reporterContact.email}`} className="hover:text-red-600">
                    {report.reporterContact.email}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Informations du rapport</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">ID du rapport</dt>
                  <dd className="text-gray-900 font-mono">{report.id}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Soumis le</dt>
                  <dd className="text-gray-900">
                    {new Date(report.createdAt).toLocaleDateString('fr-FR')} à{' '}
                    {new Date(report.createdAt).toLocaleTimeString('fr-FR')}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Dernière mise à jour</dt>
                  <dd className="text-gray-900">
                    {new Date(report.updatedAt).toLocaleDateString('fr-FR')}
                  </dd>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Services d'urgence</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Urgence</dt>
                  <dd>
                    <a href="tel:112" className="text-red-600 hover:text-red-700 font-medium">
                      112
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Police</dt>
                  <dd>
                    <a href="tel:17" className="text-blue-600 hover:text-blue-700">
                      17
                    </a>
                  </dd>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};