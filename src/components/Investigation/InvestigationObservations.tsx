import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMissingPersonsStore } from '../../store/missingPersonsStore';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Modal } from '../ui/Modal';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Car,
  Users,
  X,
  Image
} from 'lucide-react';
import { InvestigationObservation, ConfidenceLevel } from '../../types';
import { AddObservationForm } from './AddObservationForm';

interface InvestigationObservationsProps {
  className?: string;
}

export const InvestigationObservations: React.FC<InvestigationObservationsProps> = ({ className = '' }) => {
  const { id } = useParams<{ id: string }>();
  const { getReportById, getObservationsByReportId, deleteObservation } = useMissingPersonsStore();
  const [observations, setObservations] = useState<InvestigationObservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [observationToDelete, setObservationToDelete] = useState<InvestigationObservation | null>(null);

  const report = id ? getReportById(id) : null;

  // Charger les observations
  useEffect(() => {
    const loadObservations = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const observationsData = await getObservationsByReportId(id);
        setObservations(observationsData);
      } catch (err) {
        setError('Erreur lors du chargement des observations');
        console.error('Error loading observations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadObservations();
  }, [id, getObservationsByReportId]);

  const handleDeleteClick = (observation: InvestigationObservation) => {
    setObservationToDelete(observation);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!observationToDelete) return;
    
    try {
      const result = await deleteObservation(observationToDelete.id);
      if (result.success) {
        setObservations(prev => prev.filter(o => o.id !== observationToDelete.id));
        setShowDeleteModal(false);
        setObservationToDelete(null);
      } else {
        setError(result.error || 'Erreur lors de la suppression de l\'observation');
      }
    } catch (err) {
      setError('Erreur lors de la suppression de l\'observation');
      console.error('Error deleting observation:', err);
    }
  };

  const getConfidenceColor = (level: ConfidenceLevel) => {
    switch (level) {
      case 'high': return 'success';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getConfidenceLabel = (level: ConfidenceLevel) => {
    switch (level) {
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return 'Inconnue';
    }
  };

  if (!report) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert variant="error" title="Erreur">
          Rapport introuvable
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des observations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Observations d'Investigation</h2>
          <p className="text-gray-600 mt-1">
            Lieux et heures où {report.firstName} {report.lastName} a été aperçu(e)
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Ajouter une observation
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="elevated">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{observations.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {observations.filter(o => o.isVerified).length}
            </div>
            <div className="text-sm text-gray-600">Vérifiées</div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {observations.filter(o => o.confidenceLevel === 'high').length}
            </div>
            <div className="text-sm text-gray-600">Haute confiance</div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(observations.map(o => o.location.city)).size}
            </div>
            <div className="text-sm text-gray-600">Villes</div>
          </CardContent>
        </Card>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
      )}

      {/* Liste des observations */}
      {observations.length === 0 ? (
        <Card variant="elevated">
          <CardContent className="p-8 text-center">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune observation
            </h3>
            <p className="text-gray-600 mb-4">
              Aucune observation n'a encore été rapportée pour ce cas.
            </p>
            <Button 
              onClick={() => setShowAddForm(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Ajouter la première observation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {observations.map((observation) => (
            <Card key={observation.id} variant="elevated" className="hover:shadow-strong transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Informations principales */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-lg font-bold text-gray-900">
                            Observation du {new Date(observation.observationDate).toLocaleDateString('fr-FR')}
                          </h3>
                          {observation.isVerified && (
                            <Badge variant="success" size="sm" leftIcon={<CheckCircle className="h-3 w-3" />}>
                              Vérifiée
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <Badge variant={getConfidenceColor(observation.confidenceLevel)} size="sm">
                            Confiance {getConfidenceLabel(observation.confidenceLevel)}
                          </Badge>
                          {observation.observationTime && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{observation.observationTime}</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{observation.location.address}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{observation.location.city}, {observation.location.state}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span>Observé par {observation.observerName}</span>
                          </div>
                          {observation.distanceFromDisappearance && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{observation.distanceFromDisappearance.toFixed(1)} km du lieu de disparition</span>
                            </div>
                          )}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-gray-700 leading-relaxed">{observation.description}</p>
                        </div>

                        {/* Photos de l'observation */}
                        {observation.photos && observation.photos.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                              <Image className="h-4 w-4 mr-2" />
                              Photos ({observation.photos.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {observation.photos.map((photoUrl, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={photoUrl}
                                    alt={`Photo ${index + 1} de l'observation`}
                                    className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => {
                                      // Ouvrir la photo en plein écran
                                      window.open(photoUrl, '_blank');
                                    }}
                                  />
                                  {observation.photoDescriptions && observation.photoDescriptions[index] && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-b-lg">
                                      {observation.photoDescriptions[index]}
                                    </div>
                                  )}
                                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Eye className="h-3 w-3 text-gray-600" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Informations supplémentaires */}
                        <div className="space-y-2">
                          {observation.clothingDescription && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Vêtements :</span>
                              <span className="text-gray-600 ml-2">{observation.clothingDescription}</span>
                            </div>
                          )}
                          {observation.behaviorDescription && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Comportement :</span>
                              <span className="text-gray-600 ml-2">{observation.behaviorDescription}</span>
                            </div>
                          )}
                          {observation.companions && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="font-medium text-gray-700">Accompagné de :</span>
                              <span className="ml-2">{observation.companions}</span>
                            </div>
                          )}
                          {observation.vehicleInfo && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Car className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="font-medium text-gray-700">Véhicule :</span>
                              <span className="ml-2">{observation.vehicleInfo}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />}>
                          Modifier
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          leftIcon={<Trash2 className="h-4 w-4" />}
                          onClick={() => handleDeleteClick(observation)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>

                    {/* Informations de contact du témoin */}
                    {(observation.observerPhone || observation.observerEmail) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Contact du témoin :</h4>
                        <div className="flex flex-wrap gap-4">
                          {observation.observerPhone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              <a href={`tel:${observation.observerPhone}`} className="hover:text-primary-600 transition-colors">
                                {observation.observerPhone}
                              </a>
                            </div>
                          )}
                          {observation.observerEmail && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              <a href={`mailto:${observation.observerEmail}`} className="hover:text-primary-600 transition-colors">
                                {observation.observerEmail}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout d'observation */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-strong max-w-7xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Ajouter une observation</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  leftIcon={<X className="h-4 w-4" />}
                >
                  Fermer
                </Button>
              </div>
              <div className="p-6">
                <AddObservationForm
                  missingPersonId={id!}
                  missingPersonName={`${report.firstName} ${report.lastName}`}
                  onSuccess={() => {
                    setShowAddForm(false);
                    // Recharger les observations
                    const loadObservations = async () => {
                      try {
                        const observationsData = await getObservationsByReportId(id!);
                        setObservations(observationsData);
                      } catch (err) {
                        console.error('Error reloading observations:', err);
                      }
                    };
                    loadObservations();
                  }}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer cette observation ?
          </p>
          <p className="text-sm text-red-600">
            Cette action est irréversible et supprimera définitivement toutes les données associées.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
