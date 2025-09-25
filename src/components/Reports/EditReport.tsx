import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMissingPersonsStore } from '../../store/missingPersonsStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { GeocodingStatus } from '../ui/GeocodingStatus';
import { 
  Upload, 
  X, 
  MapPin, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  Clock, 
  AlertTriangle,
  ArrowLeft,
  Save
} from 'lucide-react';
import { geocodeLocation } from '../../services/geocoding';
import { useGeocoding } from '../../hooks/useGeocoding';

const editReportSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  age: z
    .number()
    .min(0, "L'âge doit être positif")
    .max(150, "L'âge doit être raisonnable"),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Veuillez sélectionner le genre'
  }),
  caseType: z.enum(['disappearance', 'runaway', 'abduction', 'missing_adult', 'missing_child'], {
    required_error: 'Veuillez sélectionner le type de cas'
  }),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  dateDisappeared: z.string().min(1, 'La date est requise'),
  timeDisappeared: z.string().optional(),
  locationAddress: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  locationCity: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
  locationState: z.string().min(2, "L'État/la région doit contenir au moins 2 caractères"),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  circumstances: z.string().optional(),
  clothingDescription: z.string().optional(),
  personalItems: z.string().optional(),
  medicalInfo: z.string().optional(),
  behavioralInfo: z.string().optional(),
  reporterName: z.string().min(2, 'Le nom du déclarant doit contenir au moins 2 caractères'),
  reporterRelationship: z.string().min(2, 'Le lien avec la personne doit être précisé'),
  reporterPhone: z.string().min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres'),
  reporterEmail: z.string().email('Veuillez entrer une adresse email valide'),
  status: z.enum(['active', 'found', 'closed']),
  isEmergency: z.boolean()
});

type EditReportFormData = z.infer<typeof editReportSchema>;

const genderOptions = [
  { value: 'male', label: 'Homme' },
  { value: 'female', label: 'Femme' },
  { value: 'other', label: 'Autre' }
];

const caseTypeOptions = [
  { value: 'disappearance', label: 'Disparition générale' },
  { value: 'runaway', label: 'Fugue' },
  { value: 'abduction', label: 'Enlèvement' },
  { value: 'missing_adult', label: 'Adulte disparu' },
  { value: 'missing_child', label: 'Enfant disparu' }
];

const priorityOptions = [
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Élevée' },
  { value: 'critical', label: 'Critique' }
];

const statusOptions = [
  { value: 'active', label: 'Actif' },
  { value: 'found', label: 'Retrouvé' },
  { value: 'closed', label: 'Fermé' }
];

export const EditReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { geocodingStatus, geocodingResult, geocodingError, geocodeAddress } = useGeocoding(1000);
  const { getReportById, updateReport } = useMissingPersonsStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<EditReportFormData>({
    resolver: zodResolver(editReportSchema)
  });
  
  const isEmergency = watch('isEmergency');
  
  // Charger le rapport existant
  useEffect(() => {
    const loadReport = async () => {
      if (!id) return;
      
      setIsLoadingReport(true);
      setError(null);
      
      try {
        const report = getReportById(id);
        if (!report) {
          setError('Rapport introuvable');
          return;
        }

        // Pré-remplir le formulaire
        reset({
          firstName: report.firstName,
          lastName: report.lastName,
          age: report.age,
          gender: report.gender,
          caseType: report.caseType,
          priority: report.priority,
          dateDisappeared: report.dateDisappeared,
          timeDisappeared: report.timeDisappeared || '',
          locationAddress: report.locationDisappeared.address,
          locationCity: report.locationDisappeared.city,
          locationState: report.locationDisappeared.state,
          description: report.description,
          circumstances: report.circumstances || '',
          clothingDescription: report.clothingDescription || '',
          personalItems: report.personalItems || '',
          medicalInfo: report.medicalInfo || '',
          behavioralInfo: report.behavioralInfo || '',
          reporterName: report.reporterContact.name,
          reporterRelationship: report.reporterContact.relationship,
          reporterPhone: report.reporterContact.phone,
          reporterEmail: report.reporterContact.email,
          status: report.status,
          isEmergency: report.isEmergency
        });

        // Charger l'image existante
        if (report.photo) {
          setUploadedImage(report.photo);
        }

        // Géocoder l'adresse existante
        geocodeAddress(report.locationDisappeared.address, report.locationDisappeared.city, report.locationDisappeared.state);
        
      } catch (err) {
        setError('Erreur lors du chargement du rapport');
        console.error('Error loading report:', err);
      } finally {
        setIsLoadingReport(false);
      }
    };

    loadReport();
  }, [id, getReportById, reset, geocodeAddress]);
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setUploadedImage(null);
  };

  // Géocoder automatiquement quand les champs d'adresse changent
  const handleAddressChange = () => {
    const address = watch('locationAddress');
    const city = watch('locationCity');
    const state = watch('locationState');
    
    geocodeAddress(address, city, state);
  };
  
  const onSubmit = async (data: EditReportFormData) => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Utiliser les coordonnées géocodées si disponibles, sinon géocoder maintenant
      let coordinates = geocodingResult?.coordinates;
      
      if (!coordinates) {
        try {
          const result = await geocodeLocation(data.locationAddress, data.locationCity, data.locationState, 'France');
          coordinates = result.coordinates;
        } catch (error) {
          console.warn('⚠️ Géocodage échoué, utilisation de coordonnées par défaut:', error);
          // Coordonnées par défaut (Paris) en cas d'échec
          coordinates = { lat: 48.8566, lng: 2.3522 };
        }
      }
      
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        gender: data.gender,
        caseType: data.caseType,
        priority: data.priority,
        dateDisappeared: data.dateDisappeared,
        timeDisappeared: data.timeDisappeared || undefined,
        locationDisappeared: {
          address: data.locationAddress,
          city: data.locationCity,
          state: data.locationState,
          country: 'France',
          coordinates: coordinates
        },
        description: data.description,
        circumstances: data.circumstances || undefined,
        clothingDescription: data.clothingDescription || undefined,
        personalItems: data.personalItems || undefined,
        medicalInfo: data.medicalInfo || undefined,
        behavioralInfo: data.behavioralInfo || undefined,
        reporterContact: {
          name: data.reporterName,
          relationship: data.reporterRelationship,
          phone: data.reporterPhone,
          email: data.reporterEmail
        },
        status: data.status,
        isEmergency: data.isEmergency,
        photo: uploadedImage || undefined
      };
      
      const result = await updateReport(id, updateData);
      
      if (result.success) {
        navigate(`/rapports/${id}`);
      } else {
        setError(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      setError(`Erreur inattendue: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingReport) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement du rapport...</p>
        </div>
      </div>
    );
  }

  if (error && !isLoadingReport) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate('/mes-alertes')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Retour à mes alertes
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/mes-alertes')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          className="mb-4"
        >
          Retour à mes alertes
        </Button>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-10 w-10 text-primary-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Modifier le signalement</h1>
          </div>
          <p className="mt-2 text-gray-600">Mettez à jour les informations du signalement.</p>
        </div>
      </div>
      
      {error && (
        <Alert variant="error" title="Erreur" className="mb-6">
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Informations sur la personne disparue */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Informations sur la personne disparue</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Prénom"
                leftIcon={<User className="h-5 w-5" />}
                {...register('firstName')}
                error={errors.firstName?.message}
                required
              />
              
              <Input
                label="Nom"
                leftIcon={<User className="h-5 w-5" />}
                {...register('lastName')}
                error={errors.lastName?.message}
                required
              />
              
              <Input
                label="Âge"
                type="number"
                {...register('age', { valueAsNumber: true })}
                error={errors.age?.message}
                required
              />
              
              <Select
                label="Genre"
                options={genderOptions}
                {...register('gender')}
                error={errors.gender?.message}
                required
              />
              
              <Select
                label="Type de cas"
                options={caseTypeOptions}
                {...register('caseType')}
                error={errors.caseType?.message}
                required
              />
              
              <Select
                label="Priorité"
                options={priorityOptions}
                {...register('priority')}
                error={errors.priority?.message}
                required
              />
            </div>
            
            {/* Statut et urgence */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Statut du cas"
                options={statusOptions}
                {...register('status')}
                error={errors.status?.message}
                required
              />
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isEmergency"
                  {...register('isEmergency')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isEmergency" className="text-sm font-medium text-gray-900">
                  Cas d'urgence
                </label>
              </div>
            </div>
            
            {/* Téléversement de la photo */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo <span className="text-gray-500">(recommandée)</span>
              </label>
              
              {uploadedImage ? (
                <div className="relative inline-block">
                  <img
                    src={uploadedImage}
                    alt="Personne disparue"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-soft"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow-soft"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors bg-white">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <span className="text-primary-600 hover:text-primary-700 font-medium">
                        Téléverser une photo
                      </span>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10 Mo</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Localisation et date */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Dernière localisation connue & date
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date de disparition"
                  type="date"
                  leftIcon={<Calendar className="h-5 w-5" />}
                  {...register('dateDisappeared')}
                  error={errors.dateDisappeared?.message}
                  required
                />
                
                <Input
                  label="Heure approximative"
                  type="time"
                  leftIcon={<Clock className="h-5 w-5" />}
                  {...register('timeDisappeared')}
                  error={errors.timeDisappeared?.message}
                />
              </div>
              
              <Input
                label="Adresse"
                {...register('locationAddress', {
                  onChange: handleAddressChange
                })}
                error={errors.locationAddress?.message}
                placeholder="12 rue de l'Exemple"
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Ville"
                  {...register('locationCity', {
                    onChange: handleAddressChange
                  })}
                  error={errors.locationCity?.message}
                  required
                />
                
                <Input
                  label="État / Région"
                  {...register('locationState', {
                    onChange: handleAddressChange
                  })}
                  error={errors.locationState?.message}
                  placeholder="Île-de-France"
                  required
                />
              </div>

              {/* Statut du géocodage */}
              <GeocodingStatus
                status={geocodingStatus}
                result={geocodingResult}
                error={geocodingError}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Description */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Description & circonstances</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Description détaillée <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="input-field !min-h-[120px]"
                  placeholder="Décrivez les circonstances de la disparition, le comportement avant la disparition et toute information pertinente..."
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Circonstances spécifiques
                </label>
                <textarea
                  {...register('circumstances')}
                  rows={3}
                  className="input-field"
                  placeholder="Décrivez les circonstances particulières (conflit familial, problème scolaire, etc.)..."
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Vêtements portés au moment de la disparition
                </label>
                <textarea
                  {...register('clothingDescription')}
                  rows={2}
                  className="input-field"
                  placeholder="Décrivez les vêtements, chaussures, accessoires..."
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Objets personnels emportés ou laissés
                </label>
                <textarea
                  {...register('personalItems')}
                  rows={2}
                  className="input-field"
                  placeholder="Téléphone, portefeuille, clés, sac à dos, etc."
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Informations médicales importantes
                </label>
                <textarea
                  {...register('medicalInfo')}
                  rows={2}
                  className="input-field"
                  placeholder="Médicaments, conditions médicales, allergies..."
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Informations comportementales récentes
                </label>
                <textarea
                  {...register('behavioralInfo')}
                  rows={2}
                  className="input-field"
                  placeholder="Changements d'humeur, problèmes récents, habitudes..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Coordonnées du déclarant */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Coordonnées du déclarant</h2>
            <p className="text-sm text-gray-600">Ces informations permettront aux autorités de vous contacter au sujet du dossier.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Votre nom complet"
                leftIcon={<User className="h-5 w-5" />}
                {...register('reporterName')}
                error={errors.reporterName?.message}
                required
              />
              
              <Input
                label="Lien avec la personne disparue"
                leftIcon={<User className="h-5 w-5" />}
                {...register('reporterRelationship')}
                error={errors.reporterRelationship?.message}
                placeholder="Mère, ami, etc."
                required
              />
              
              <Input
                label="Numéro de téléphone"
                type="tel"
                leftIcon={<Phone className="h-5 w-5" />}
                {...register('reporterPhone')}
                error={errors.reporterPhone?.message}
                placeholder="+33 6 12 34 56 78"
                required
              />
              
              <Input
                label="Adresse email"
                type="email"
                leftIcon={<Mail className="h-5 w-5" />}
                {...register('reporterEmail')}
                error={errors.reporterEmail?.message}
                required
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Actions */}
        <Card>
          <CardContent>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/mes-alertes')}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Sauvegarder les modifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
