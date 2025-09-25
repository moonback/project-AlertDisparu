import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useMissingPersonsStore } from '../../store/missingPersonsStore';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Modal } from '../ui/Modal';
import { CaseTypeBadge } from '../ui/CaseTypeBadge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  MapPin, 
  User, 
  AlertTriangle,
  Clock,
  Search,
  Filter,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MissingPerson, CaseType, CasePriority } from '../../types';

interface MyAlertsProps {
  className?: string;
}

export const MyAlerts: React.FC<MyAlertsProps> = ({ className = '' }) => {
  const { user } = useAuthStore();
  const { reports, getReportsByUser, updateReport, deleteReport } = useMissingPersonsStore();
  const [myReports, setMyReports] = useState<MissingPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<MissingPerson | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>('all');

  // Charger les rapports de l'utilisateur
  useEffect(() => {
    const loadMyReports = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const userReports = await getReportsByUser(user.id);
        setMyReports(userReports);
      } catch (err) {
        setError('Erreur lors du chargement de vos signalements');
        console.error('Error loading user reports:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMyReports();
  }, [user?.id, getReportsByUser]);

  // Filtrer les rapports
  const filteredReports = myReports.filter(report => {
    const matchesSearch = !searchQuery || 
      report.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.locationDisappeared.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesCaseType = caseTypeFilter === 'all' || report.caseType === caseTypeFilter;
    
    return matchesSearch && matchesStatus && matchesCaseType;
  });

  // Gérer la suppression
  const handleDeleteClick = (report: MissingPerson) => {
    setReportToDelete(report);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;
    
    try {
      await deleteReport(reportToDelete.id);
      setMyReports(prev => prev.filter(r => r.id !== reportToDelete.id));
      setShowDeleteModal(false);
      setReportToDelete(null);
    } catch (err) {
      setError('Erreur lors de la suppression du signalement');
      console.error('Error deleting report:', err);
    }
  };

  // Gérer le changement de statut
  const handleStatusChange = async (reportId: string, newStatus: 'active' | 'found' | 'closed') => {
    try {
      await updateReport(reportId, { status: newStatus });
      setMyReports(prev => 
        prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r)
      );
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
      console.error('Error updating status:', err);
    }
  };

  // Statistiques
  const stats = {
    total: myReports.length,
    active: myReports.filter(r => r.status === 'active').length,
    found: myReports.filter(r => r.status === 'found').length,
    closed: myReports.filter(r => r.status === 'closed').length,
    emergency: myReports.filter(r => r.isEmergency).length
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement de vos signalements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes Signalements</h2>
          <p className="text-gray-600 mt-1">
            Gérez vos signalements de personnes disparues
          </p>
        </div>
        <Link to="/rapports/nouveau">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            Nouveau signalement
          </Button>
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card variant="elevated">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Actifs</div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.found}</div>
            <div className="text-sm text-gray-600">Retrouvés</div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
            <div className="text-sm text-gray-600">Fermés</div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.emergency}</div>
            <div className="text-sm text-gray-600">Urgences</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card variant="elevated">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans vos signalements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="found">Retrouvé</option>
                <option value="closed">Fermé</option>
              </select>
              <select
                value={caseTypeFilter}
                onChange={(e) => setCaseTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tous les types</option>
                <option value="disappearance">Disparition</option>
                <option value="runaway">Fugue</option>
                <option value="abduction">Enlèvement</option>
                <option value="missing_adult">Adulte disparu</option>
                <option value="missing_child">Enfant disparu</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages d'erreur */}
      {error && (
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
      )}

      {/* Liste des signalements */}
      {filteredReports.length === 0 ? (
        <Card variant="elevated">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {myReports.length === 0 ? 'Aucun signalement' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-600 mb-4">
              {myReports.length === 0 
                ? 'Vous n\'avez pas encore créé de signalement.' 
                : 'Aucun signalement ne correspond à vos critères de recherche.'
              }
            </p>
            {myReports.length === 0 && (
              <Link to="/rapports/nouveau">
                <Button leftIcon={<Plus className="h-4 w-4" />}>
                  Créer votre premier signalement
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} variant="elevated" className="hover:shadow-strong transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    {report.photo ? (
                      <img
                        src={report.photo}
                        alt={`${report.firstName} ${report.lastName}`}
                        className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Informations principales */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {report.firstName} {report.lastName}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <CaseTypeBadge 
                            caseType={report.caseType} 
                            priority={report.priority}
                            isEmergency={report.isEmergency}
                          />
                          <Badge variant={report.status === 'active' ? 'error' : 'success'} size="sm">
                            {report.status === 'active' ? 'Actif' : 
                             report.status === 'found' ? 'Retrouvé' : 'Fermé'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{report.age} ans • {report.gender === 'male' ? 'Homme' : report.gender === 'female' ? 'Femme' : 'Autre'}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{report.locationDisappeared.city}, {report.locationDisappeared.state}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span>Disparu le {new Date(report.dateDisappeared).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span>
                              {Math.floor((new Date().getTime() - new Date(report.dateDisappeared).getTime()) / (1000 * 60 * 60 * 24))} jour(s)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link to={`/rapports/${report.id}`}>
                          <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                            Voir
                          </Button>
                        </Link>
                        <Link to={`/rapports/${report.id}/modifier`}>
                          <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />}>
                            Modifier
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          leftIcon={<Trash2 className="h-4 w-4" />}
                          onClick={() => handleDeleteClick(report)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>

                    {/* Actions rapides pour le statut */}
                    {report.status === 'active' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Actions rapides :</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(report.id, 'found')}
                            className="text-green-600 hover:text-green-700 hover:border-green-300"
                          >
                            Marquer comme retrouvé
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(report.id, 'closed')}
                            className="text-gray-600 hover:text-gray-700 hover:border-gray-300"
                          >
                            Fermer le dossier
                          </Button>
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

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer le signalement de{' '}
            <strong>{reportToDelete?.firstName} {reportToDelete?.lastName}</strong> ?
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
