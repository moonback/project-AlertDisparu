import React, { useState, useCallback } from 'react';
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
import { Upload, X, MapPin, User, Calendar, Phone, Mail, Clock, Brain, CheckCircle } from 'lucide-react';
import { ImageAnalysis } from '../ui/ImageAnalysis';
import { QuickImageUpload } from '../ui/QuickImageUpload';
import { GeminiSetupHelper } from '../ui/GeminiSetupHelper';
import { useNavigate } from 'react-router-dom';
import { geocodeLocation } from '../../services/geocoding';
import { useGeocoding } from '../../hooks/useGeocoding';

const reportSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  age: z
    .number()
    .min(0, "L'âge doit être positif")
    .max(150, "L'âge doit être raisonnable"),
  gender: z.enum(['male', 'female', 'other'], {
    message: 'Veuillez sélectionner le genre'
  }),
  caseType: z.enum(['disappearance', 'runaway', 'abduction', 'missing_adult', 'missing_child'], {
    message: 'Veuillez sélectionner le type de cas'
  }),
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
  consentGiven: z.boolean().refine(val => val === true, {
    message: 'Vous devez donner votre consentement pour partager ces informations'
  })
});

type ReportFormData = z.infer<typeof reportSchema>;

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

export const ReportForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedImageForAnalysis, setSelectedImageForAnalysis] = useState<File | null>(null);
  const [fieldsAutoFilled, setFieldsAutoFilled] = useState(false);
  const { geocodingStatus, geocodingResult, geocodingError, geocodeAddress } = useGeocoding(1000);
  const { addReport } = useMissingPersonsStore();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema)
  });
  
  const consentGiven = watch('consentGiven');
  
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Utilitaire pour convertir un File en data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve((e.target?.result as string) || '');
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Appliquer les résultats d'analyse aux champs du formulaire
  const handleAnalysisComplete = useCallback(async (analysisResult: any) => {
    if (analysisResult.description) setValue('description', analysisResult.description);
    if (analysisResult.clothingDescription) setValue('clothingDescription', analysisResult.clothingDescription);
    if (analysisResult.behaviorDescription) setValue('behavioralInfo', analysisResult.behaviorDescription);

    setFieldsAutoFilled(true);

    // Définir la photo du signalement depuis l'image analysée
    if (selectedImageForAnalysis) {
      try {
        const dataUrl = await fileToDataUrl(selectedImageForAnalysis);
        setUploadedImage(dataUrl);
      } catch {
        // noop
      }
    }

    // Effacer la sélection après application
    setSelectedImageForAnalysis(null);
  }, [selectedImageForAnalysis, setValue]);

  const handleClearAnalysis = useCallback(() => {
    setSelectedImageForAnalysis(null);
  }, []);
  
  const removeImage = () => {
    setUploadedImage(null);
  };

  // Géocoder automatiquement quand les champs d'adresse changent
  const handleAddressChange = useCallback(() => {
    const address = watch('locationAddress');
    const city = watch('locationCity');
    const state = watch('locationState');
    
    geocodeAddress(address, city, state);
  }, [watch, geocodeAddress]);
  
  const onSubmit = async (data: ReportFormData) => {
    setIsLoading(true);
    console.log('🚀 Début soumission rapport:', data);
    
    try {
      // Utiliser les coordonnées géocodées si disponibles, sinon géocoder maintenant
      let coordinates = geocodingResult?.coordinates;
      
      if (!coordinates) {
        console.log('🌍 Géocodage en cours pour la soumission...');
        try {
          const result = await geocodeLocation(data.locationAddress, data.locationCity, data.locationState, 'France');
          coordinates = result.coordinates;
          console.log('✅ Géocodage réussi pour la soumission:', coordinates);
        } catch (error) {
          console.warn('⚠️ Géocodage échoué, utilisation de coordonnées par défaut:', error);
          // Coordonnées par défaut (Paris) en cas d'échec
          coordinates = { lat: 48.8566, lng: 2.3522 };
        }
      }
      
      const reportData = {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        gender: data.gender,
        photo: uploadedImage || undefined,
        caseType: data.caseType,
        dateDisappeared: data.dateDisappeared,
        timeDisappeared: data.timeDisappeared,
        locationDisappeared: {
          address: data.locationAddress,
          city: data.locationCity,
          state: data.locationState,
          country: 'France',
          coordinates: coordinates
        },
        description: data.description,
        circumstances: data.circumstances,
        clothingDescription: data.clothingDescription,
        personalItems: data.personalItems,
        medicalInfo: data.medicalInfo,
        behavioralInfo: data.behavioralInfo,
        reporterContact: {
          name: data.reporterName,
          relationship: data.reporterRelationship,
          phone: data.reporterPhone,
          email: data.reporterEmail
        },
        consentGiven: data.consentGiven,
        priority: 'medium' as const, // Sera calculé automatiquement par le trigger
        isEmergency: false // Sera calculé automatiquement par le trigger
      };
      
      console.log('📝 Données du rapport à envoyer:', reportData);
      
      const result = await addReport(reportData);
      
      console.log('📊 Résultat de l\'ajout:', result);
      
      if (result.success) {
        console.log('✅ Rapport ajouté avec succès, redirection...');
        navigate('/rapports');
      } else {
        console.error('❌ Erreur lors de l\'ajout:', result.error);
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('💥 Erreur exception lors de la soumission:', error);
      alert(`Erreur inattendue: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header avec effet glass */}
      <div className="glass-hero p-6 mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <User className="h-12 w-12 text-primary-600 mr-3 animate-glow" />
          <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse shadow-brand-glow"></div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2 glass-shimmer">Signaler une personne disparue</h1>
        <p className="mt-2 text-gray-700">Merci de fournir un maximum d'informations pour aider les recherches.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Analyse d'image en premier */}
        <Card variant="glass">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-primary-600 animate-glow" />
              Analyse intelligente d'image
            </h2>
            <p className="text-sm text-gray-600">
              Commencez par analyser une photo pour pré-remplir automatiquement la description et les détails.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <QuickImageUpload
                onImageSelect={setSelectedImageForAnalysis}
                selectedFile={selectedImageForAnalysis}
                onClear={handleClearAnalysis}
              />

              <ImageAnalysis
                imageFile={selectedImageForAnalysis}
                missingPersonName={`${watch('firstName') || ''} ${watch('lastName') || ''}`.trim()}
                onAnalysisComplete={handleAnalysisComplete}
                onClearAnalysis={handleClearAnalysis}
              />

              <GeminiSetupHelper />
            </div>
          </CardContent>
        </Card>
        {/* Informations sur la personne disparue */}
        <Card variant="glass">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-600" />
              Informations sur la personne disparue
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                variant="glass"
                label="Prénom"
                leftIcon={<User className="h-5 w-5" />}
                {...register('firstName')}
                error={errors.firstName?.message}
                required
              />
              
              <Input
                variant="glass"
                label="Nom"
                leftIcon={<User className="h-5 w-5" />}
                {...register('lastName')}
                error={errors.lastName?.message}
                required
              />
              
              <Input
                variant="glass"
                label="Âge"
                type="number"
                {...register('age', { valueAsNumber: true })}
                error={errors.age?.message}
                required
              />
              
              <Select
                variant="glass"
                label="Genre"
                options={genderOptions}
                {...register('gender')}
                error={errors.gender?.message}
                required
              />
              
              <Select
                variant="glass"
                label="Type de cas"
                options={caseTypeOptions}
                {...register('caseType')}
                error={errors.caseType?.message}
                required
              />
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
                <div className="glass-card border-2 border-dashed border-white/30 rounded-xl p-6 text-center hover:border-primary-400/50 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-primary-400" />
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
        <Card variant="glass">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary-600" />
              Dernière localisation connue & date
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  variant="glass"
                  label="Date de disparition"
                  type="date"
                  leftIcon={<Calendar className="h-5 w-5" />}
                  {...register('dateDisappeared')}
                  error={errors.dateDisappeared?.message}
                  required
                />
                
                <Input
                  variant="glass"
                  label="Heure approximative"
                  type="time"
                  leftIcon={<Clock className="h-5 w-5" />}
                  {...register('timeDisappeared')}
                  error={errors.timeDisappeared?.message}
                />
              </div>
              
              <Input
                variant="glass"
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
                  variant="glass"
                  label="Ville"
                  {...register('locationCity', {
                    onChange: handleAddressChange
                  })}
                  error={errors.locationCity?.message}
                  required
                />
                
                <Input
                  variant="glass"
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
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
                Description & circonstances
              </h2>
              {fieldsAutoFilled && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Champs remplis automatiquement</span>
                </div>
              )}
            </div>
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
                  className="glass-input !min-h-[120px]"
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
                  className="glass-input"
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
                  className="glass-input"
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
                  className="glass-input"
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
                  className="glass-input"
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
                  className="glass-input"
                  placeholder="Changements d'humeur, problèmes récents, habitudes..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Coordonnées du déclarant */}
        <Card variant="glass">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Phone className="h-5 w-5 mr-2 text-primary-600" />
              Coordonnées du déclarant
            </h2>
            <p className="text-sm text-gray-600">Ces informations permettront aux autorités de vous contacter au sujet du dossier.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                variant="glass"
                label="Votre nom complet"
                leftIcon={<User className="h-5 w-5" />}
                {...register('reporterName')}
                error={errors.reporterName?.message}
                required
              />
              
              <Input
                variant="glass"
                label="Lien avec la personne disparue"
                leftIcon={<User className="h-5 w-5" />}
                {...register('reporterRelationship')}
                error={errors.reporterRelationship?.message}
                placeholder="Mère, ami, etc."
                required
              />
              
              <Input
                variant="glass"
                label="Numéro de téléphone"
                type="tel"
                leftIcon={<Phone className="h-5 w-5" />}
                {...register('reporterPhone')}
                error={errors.reporterPhone?.message}
                placeholder="+33 6 12 34 56 78"
                required
              />
              
              <Input
                variant="glass"
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
        
        {/* Consentement et soumission */}
        <Card variant="glass">
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="consent"
                  {...register('consentGiven')}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-white/30 bg-white/20 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="consent" className="text-sm font-medium text-gray-900">
                    Consentement au partage d'informations <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    J'autorise la diffusion de ces informations pour aider à retrouver cette personne disparue. 
                    Je comprends que ces informations pourront être partagées avec les forces de l'ordre, les bénévoles 
                    et le public afin d'aider aux recherches. Je confirme être autorisé à partager ces informations.
                  </p>
                </div>
              </div>
              {errors.consentGiven && (
                <p className="text-sm text-red-600">{errors.consentGiven.message}</p>
              )}
              
              <Alert variant="info" title="Confidentialité (RGPD)">
                Vos données personnelles ne seront utilisées que pour la recherche de la personne disparue et seront 
                traitées conformément à notre politique de confidentialité.
              </Alert>
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/rapports')}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="glass"
                isLoading={isLoading}
                disabled={!consentGiven}
              >
                Envoyer le signalement
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};