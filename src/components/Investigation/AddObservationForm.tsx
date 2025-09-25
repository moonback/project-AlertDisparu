import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { GeocodingStatus } from '../ui/GeocodingStatus';
import { PhotoUpload, PhotoUploadItem } from '../ui/PhotoUpload';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Car, 
  Users,
  Save,
  X,
  Image
} from 'lucide-react';
import { geocodeLocation } from '../../services/geocoding';
import { useGeocoding } from '../../hooks/useGeocoding';
import { ConfidenceLevel } from '../../types';
import { useMissingPersonsStore } from '../../store/missingPersonsStore';
import { supabase } from '../../lib/supabase';

const observationSchema = z.object({
  observerName: z.string().min(2, 'Le nom de l\'observateur doit contenir au moins 2 caractères'),
  observerPhone: z.string().optional(),
  observerEmail: z.string().email('Veuillez entrer une adresse email valide').optional().or(z.literal('')),
  observationDate: z.string().min(1, 'La date est requise'),
  observationTime: z.string().optional(),
  locationAddress: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  locationCity: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
  locationState: z.string().min(2, "L'État/la région doit contenir au moins 2 caractères"),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  confidenceLevel: z.enum(['low', 'medium', 'high'], {
    required_error: 'Veuillez sélectionner le niveau de confiance'
  }),
  clothingDescription: z.string().optional(),
  behaviorDescription: z.string().optional(),
  companions: z.string().optional(),
  vehicleInfo: z.string().optional(),
  witnessContactConsent: z.boolean().refine(val => val === true, {
    message: 'Vous devez obtenir le consentement du témoin pour le contact'
  })
});

type ObservationFormData = z.infer<typeof observationSchema>;

const confidenceOptions = [
  { value: 'high', label: 'Élevée - Je suis certain(e) que c\'était cette personne' },
  { value: 'medium', label: 'Moyenne - Je pense que c\'était cette personne' },
  { value: 'low', label: 'Faible - Je ne suis pas sûr(e), mais cela pourrait être cette personne' }
];

interface AddObservationFormProps {
  missingPersonId: string;
  missingPersonName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddObservationForm: React.FC<AddObservationFormProps> = ({
  missingPersonId,
  missingPersonName,
  onSuccess,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoUploadItem[]>([]);
  const { geocodingStatus, geocodingResult, geocodingError, geocodeAddress } = useGeocoding(1000);
  const { addObservation } = useMissingPersonsStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ObservationFormData>({
    resolver: zodResolver(observationSchema)
  });
  
  const witnessContactConsent = watch('witnessContactConsent');
  
  // Géocoder automatiquement quand les champs d'adresse changent
  const handleAddressChange = useCallback(() => {
    const address = watch('locationAddress');
    const city = watch('locationCity');
    const state = watch('locationState');
    
    geocodeAddress(address, city, state);
  }, [watch, geocodeAddress]);
  
  // Fonction pour uploader les photos vers Supabase Storage
  const uploadPhotos = async (photos: PhotoUploadItem[]): Promise<string[]> => {
    if (photos.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    
    for (const photo of photos) {
      try {
        // Créer un nom de fichier unique
        const fileExt = photo.file.name.split('.').pop();
        const fileName = `observation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        // Upload vers Supabase Storage
        const { data, error } = await supabase.storage
          .from('investigation-photos')
          .upload(fileName, photo.file);
        
        if (error) {
          console.error('Erreur upload photo:', error);
          continue;
        }
        
        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from('investigation-photos')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(urlData.publicUrl);
      } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
      }
    }
    
    return uploadedUrls;
  };

  const onSubmit = async (data: ObservationFormData) => {
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
      
      // Uploader les photos si il y en a
      let photoUrls: string[] = [];
      let photoDescriptions: string[] = [];
      
      if (photos.length > 0) {
        photoUrls = await uploadPhotos(photos);
        photoDescriptions = photos.map(photo => photo.description);
      }
      
      const observationData = {
        missingPersonId,
        observerName: data.observerName,
        observerPhone: data.observerPhone || undefined,
        observerEmail: data.observerEmail || undefined,
        observationDate: data.observationDate,
        observationTime: data.observationTime || undefined,
        location: {
          address: data.locationAddress,
          city: data.locationCity,
          state: data.locationState,
          country: 'France',
          coordinates: coordinates
        },
        description: data.description,
        confidenceLevel: data.confidenceLevel,
        clothingDescription: data.clothingDescription || undefined,
        behaviorDescription: data.behaviorDescription || undefined,
        companions: data.companions || undefined,
        vehicleInfo: data.vehicleInfo || undefined,
        witnessContactConsent: data.witnessContactConsent,
        photos: photoUrls.length > 0 ? photoUrls : undefined,
        photoDescriptions: photoDescriptions.length > 0 ? photoDescriptions : undefined
      };
      
      console.log('📝 Données de l\'observation à envoyer:', observationData);
      
      const result = await addObservation(observationData);
      
      if (result.success) {
        setIsLoading(false);
        onSuccess();
      } else {
        setError(result.error || 'Erreur lors de l\'ajout de l\'observation');
        setIsLoading(false);
      }
      
    } catch (error) {
      setError(`Erreur inattendue: ${error}`);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Ajouter une observation</h1>
        <p className="mt-2 text-gray-600">
          Rapportez un lieu et une heure où vous avez aperçu {missingPersonName}
        </p>
      </div>
      
      {error && (
        <Alert variant="error" title="Erreur" className="mb-6">
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Informations sur l'observateur */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Informations sur l'observateur</h2>
            <p className="text-sm text-gray-600">
              Vos coordonnées permettront aux autorités de vous contacter si nécessaire.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Votre nom complet"
                leftIcon={<User className="h-5 w-5" />}
                {...register('observerName')}
                error={errors.observerName?.message}
                required
              />
              
              <Input
                label="Numéro de téléphone"
                type="tel"
                leftIcon={<Phone className="h-5 w-5" />}
                {...register('observerPhone')}
                error={errors.observerPhone?.message}
                placeholder="+33 6 12 34 56 78"
              />
              
              <Input
                label="Adresse email"
                type="email"
                leftIcon={<Mail className="h-5 w-5" />}
                {...register('observerEmail')}
                error={errors.observerEmail?.message}
                className="md:col-span-2"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Date, heure et localisation */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Quand et où avez-vous vu cette personne ?
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date de l'observation"
                  type="date"
                  leftIcon={<Calendar className="h-5 w-5" />}
                  {...register('observationDate')}
                  error={errors.observationDate?.message}
                  required
                />
                
                <Input
                  label="Heure approximative"
                  type="time"
                  leftIcon={<Clock className="h-5 w-5" />}
                  {...register('observationTime')}
                  error={errors.observationTime?.message}
                />
              </div>
              
              <Input
                label="Adresse exacte"
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
        
        {/* Description de l'observation */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Description de l'observation</h2>
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
                  placeholder="Décrivez ce que vous avez observé : l'apparence de la personne, ses actions, son comportement, etc."
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
              
              <Select
                label="Niveau de confiance"
                options={confidenceOptions}
                {...register('confidenceLevel')}
                error={errors.confidenceLevel?.message}
                required
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Vêtements portés
                </label>
                <textarea
                  {...register('clothingDescription')}
                  rows={2}
                  className="input-field"
                  placeholder="Décrivez les vêtements, chaussures, accessoires que portait la personne..."
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Comportement observé
                </label>
                <textarea
                  {...register('behaviorDescription')}
                  rows={2}
                  className="input-field"
                  placeholder="Comment se comportait la personne ? Était-elle calme, agitée, en fuite, etc. ?"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Personnes accompagnant
                </label>
                <textarea
                  {...register('companions')}
                  rows={2}
                  className="input-field"
                  placeholder="Y avait-il d'autres personnes avec elle ? Décrivez-les..."
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Informations sur un véhicule
                </label>
                <textarea
                  {...register('vehicleInfo')}
                  rows={2}
                  className="input-field"
                  placeholder="Si la personne était dans un véhicule, décrivez-le (marque, couleur, plaque, etc.)..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Photos */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Image className="h-5 w-5 mr-2" />
              Photos de l'observation
            </h2>
            <p className="text-sm text-gray-600">
              Ajoutez des photos pour illustrer votre observation (optionnel)
            </p>
          </CardHeader>
          <CardContent>
            <PhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={5}
              maxSizeMB={5}
            />
          </CardContent>
        </Card>
        
        {/* Consentement et soumission */}
        <Card>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="witnessConsent"
                  {...register('witnessContactConsent')}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="witnessConsent" className="text-sm font-medium text-gray-900">
                    Consentement au contact <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    J'autorise les autorités et les enquêteurs à me contacter pour obtenir des informations 
                    supplémentaires concernant cette observation. Je comprends que mes coordonnées seront 
                    utilisées uniquement dans le cadre de cette enquête.
                  </p>
                </div>
              </div>
              {errors.witnessContactConsent && (
                <p className="text-sm text-red-600">{errors.witnessContactConsent.message}</p>
              )}
              
              <Alert variant="info" title="Confidentialité">
                Vos informations personnelles seront protégées et utilisées uniquement pour cette enquête. 
                Elles ne seront pas partagées publiquement.
              </Alert>
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Enregistrer l'observation
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
