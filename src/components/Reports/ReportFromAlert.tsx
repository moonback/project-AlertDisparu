import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { QuickImageUpload } from '../ui/QuickImageUpload';
import { useAlertPosterAnalysis } from '../../hooks/useAlertPosterAnalysis';
import { AlertTriangle, FileText, Download, Wand2, CheckCircle } from 'lucide-react';
import { useMissingPersonsStore } from '../../store/missingPersonsStore';
import { LoadingSpinner } from '../ui/LoadingSpinner';

/**
 * Nouveau flux: créer un signalement à partir d'une affiche Alerte Enlèvement
 * N'altère pas le composant ReportForm existant.
 */
export const ReportFromAlert: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const { isAnalyzing, result, error, analyze, clear } = useAlertPosterAnalysis();
  const { addReport } = useMissingPersonsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnalyze = async () => {
    if (!file) return;
    await analyze(file);
  };

  const handleClear = () => {
    setFile(null);
    clear();
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const toReportPayload = async () => {
    if (!result || !file) return null;
    const [firstName, ...rest] = (result.victimName || '').split(' ').filter(Boolean);
    const lastName = rest.join(' ') || undefined;

    // Construire une description complète avec toutes les informations
    const descriptionParts: string[] = [];
    if (result.description) descriptionParts.push(`Résumé: ${result.description}`);
    
    // Description physique détaillée
    const physicalDesc = [];
    if (result.heightMeters) physicalDesc.push(`Taille: ${result.heightMeters}m`);
    if (result.weight) physicalDesc.push(`Poids: ${result.weight}`);
    if (result.hairColor || result.hairLength) physicalDesc.push(`Cheveux: ${[result.hairColor, result.hairLength].filter(Boolean).join(', ')}`);
    if (result.eyeColor) physicalDesc.push(`Yeux: ${result.eyeColor}`);
    if (result.bodyType) physicalDesc.push(`Corpulence: ${result.bodyType}`);
    if (physicalDesc.length > 0) descriptionParts.push(`Description physique: ${physicalDesc.join(', ')}`);
    
    // Vêtements et accessoires
    const clothingDesc = [];
    if (result.clothing) clothingDesc.push(result.clothing);
    if (result.accessories) clothingDesc.push(`Accessoires: ${result.accessories}`);
    if (result.shoes) clothingDesc.push(`Chaussures: ${result.shoes}`);
    if (clothingDesc.length > 0) descriptionParts.push(`Vêtements: ${clothingDesc.join(', ')}`);
    
    // Signes particuliers
    const marksDesc = [];
    if (result.distinctiveMarks) marksDesc.push(result.distinctiveMarks);
    if (result.scars) marksDesc.push(`Cicatrices: ${result.scars}`);
    if (result.tattoos) marksDesc.push(`Tatouages: ${result.tattoos}`);
    if (result.piercings) marksDesc.push(`Piercings: ${result.piercings}`);
    if (marksDesc.length > 0) descriptionParts.push(`Signes particuliers: ${marksDesc.join(', ')}`);
    
    // Véhicule et suspect
    if (result.vehicle) descriptionParts.push(`Véhicule: ${result.vehicle}`);
    if (result.licensePlate) descriptionParts.push(`Immatriculation: ${result.licensePlate}`);
    if (result.suspect) descriptionParts.push(`Suspect: ${result.suspect}`);
    if (result.suspectDescription) descriptionParts.push(`Description suspect: ${result.suspectDescription}`);
    
    // Informations de contact
    if (result.contactPhone) descriptionParts.push(`Contact: ${result.contactPhone}`);
    if (result.contactEmail) descriptionParts.push(`Email: ${result.contactEmail}`);
    
    const description = descriptionParts.join('\n');

    // Convertir l'image de l'affiche en base64 pour l'inclure comme photo
    const photoBase64 = await fileToBase64(file);

    // Construire la description détaillée pour le champ principal
    const detailedDescription = [
      result.description || 'Informations extraites depuis une affiche « Alerte Enlèvement »',
      '',
      '=== DESCRIPTION PHYSIQUE ===',
      ...physicalDesc.map(desc => `• ${desc}`),
      '',
      '=== VÊTEMENTS ET ACCESSOIRES ===',
      ...clothingDesc.map(desc => `• ${desc}`),
      '',
      '=== SIGNES PARTICULIERS ===',
      ...marksDesc.map(desc => `• ${desc}`),
      '',
      '=== VÉHICULE ET SUSPECT ===',
      ...(result.vehicle ? [`• Véhicule: ${result.vehicle}`] : []),
      ...(result.licensePlate ? [`• Immatriculation: ${result.licensePlate}`] : []),
      ...(result.suspect ? [`• Suspect: ${result.suspect}`] : []),
      ...(result.suspectDescription ? [`• Description suspect: ${result.suspectDescription}`] : []),
      '',
      '=== INFORMATIONS DE CONTACT ===',
      ...(result.contactPhone ? [`• Téléphone: ${result.contactPhone}`] : []),
      ...(result.contactEmail ? [`• Email: ${result.contactEmail}`] : []),
      ...(result.contactWebsite ? [`• Site web: ${result.contactWebsite}`] : [])
    ].filter(Boolean).join('\n');

    // Construire les circonstances spécifiques
    const specificCircumstances = [
      result.circumstances || 'Circonstances extraites de l\'affiche officielle',
      result.abductedAt ? `Date et heure: ${new Date(result.abductedAt).toLocaleString('fr-FR')}` : '',
      result.abductedLocation ? `Lieu: ${result.abductedLocation}` : '',
      result.abductedLocationDetails ? `Adresse précise: ${result.abductedLocationDetails}` : '',
      result.alertType ? `Type d'alerte: ${result.alertType}` : '',
      result.authorities ? `Autorités: ${result.authorities}` : ''
    ].filter(Boolean).join('\n');

    // Construire la description des vêtements
    const clothingDetails = [
      result.clothing || 'Vêtements mentionnés sur l\'affiche',
      result.accessories ? `Accessoires: ${result.accessories}` : '',
      result.shoes ? `Chaussures: ${result.shoes}` : ''
    ].filter(Boolean).join('\n');

    // Construire les objets personnels
    const personalItemsDetails = [
      result.accessories || 'Accessoires mentionnés sur l\'affiche',
      result.vehicle ? `Véhicule utilisé: ${result.vehicle}` : '',
      result.licensePlate ? `Immatriculation: ${result.licensePlate}` : ''
    ].filter(Boolean).join('\n');

    // Construire les informations médicales
    const medicalInfoDetails = [
      result.scars ? `Cicatrices: ${result.scars}` : '',
      result.tattoos ? `Tatouages: ${result.tattoos}` : '',
      result.piercings ? `Piercings: ${result.piercings}` : '',
      result.distinctiveMarks ? `Signes particuliers: ${result.distinctiveMarks}` : ''
    ].filter(Boolean).join('\n') || 'Aucune information médicale spécifique mentionnée sur l\'affiche';

    // Construire les informations comportementales
    const behavioralInfoDetails = [
      result.suspectDescription ? `Description du suspect: ${result.suspectDescription}` : '',
      result.circumstances ? `Circonstances rapportées: ${result.circumstances}` : '',
      result.urgency ? `Niveau d'urgence: ${result.urgency}` : ''
    ].filter(Boolean).join('\n') || 'Informations comportementales extraites de l\'affiche officielle';

    return {
      firstName: firstName || 'Inconnu',
      lastName: lastName || 'Inconnu',
      age: result.victimAge || undefined,
      gender: result.victimGender || undefined,
      photo: photoBase64,
      caseType: 'abduction' as const,
      dateDisappeared: result.abductedAt ? result.abductedAt.substring(0, 10) : undefined,
      timeDisappeared: result.abductedAt ? result.abductedAt.substring(11, 16) : undefined,
      locationDisappeared: {
        address: result.abductedLocationDetails || result.abductedLocation || '',
        city: result.abductedLocation || '',
        state: '',
        country: 'France',
        coordinates: { lat: 0, lng: 0 }
      },
      description: detailedDescription,
      circumstances: specificCircumstances,
      clothingDescription: clothingDetails,
      personalItems: personalItemsDetails,
      medicalInfo: medicalInfoDetails,
      behavioralInfo: behavioralInfoDetails,
      reporterContact: {
        name: 'Anonyme',
        relationship: 'Témoin',
        phone: result.contactPhone || '',
        email: result.contactEmail || ''
      },
      consentGiven: true,
      priority: 'high' as const,
      isEmergency: true
    };
  };

  const handleCreateReport = async () => {
    const payload = await toReportPayload();
    if (!payload) return;
    setIsSubmitting(true);
    const res = await addReport(payload as any);
    setIsSubmitting(false);
    if (!res.success) alert(res.error || 'Erreur lors de la création du signalement');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <AlertTriangle className="h-8 w-8 text-primary-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Créer un signalement depuis une affiche « Alerte Enlèvement »</h1>
        </div>
        <p className="text-gray-600">Téléchargez une image de l'affiche officielle. L'IA extraira les informations clés pour pré-remplir un nouveau signalement.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Affiche à analyser</h2>
          </div>
        </CardHeader>
        <CardContent>
          <QuickImageUpload onImageSelect={setFile} selectedFile={file} onClear={handleClear} />
          <div className="mt-4 flex items-center space-x-3">
            <Button onClick={handleAnalyze} disabled={!file || isAnalyzing} leftIcon={<Wand2 className="h-4 w-4" />}>Analyser l'affiche</Button>
            <Button variant="outline" onClick={handleClear}>Réinitialiser</Button>
          </div>

          {isAnalyzing && (
            <div className="mt-4 flex items-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-sm text-gray-600">Analyse en cours…</span>
            </div>
          )}

          {error && (
            <div className="mt-4">
              <Alert variant="error" title="Erreur d'analyse">{error}</Alert>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-3">
              <Alert variant="success" title="Analyse terminée">
                Les informations suivantes ont été extraites. Vérifiez et complétez si nécessaire.
              </Alert>
              <div className="bg-gray-50 rounded p-4 space-y-3 text-sm text-gray-800">
                {/* Informations sur la victime */}
                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-900 mb-2">👤 Informations sur la victime</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Nom:</strong> {result.victimName || '—'}</div>
                    <div><strong>Âge:</strong> {result.victimAge ?? '—'} ans</div>
                    <div><strong>Sexe:</strong> {result.victimGender || '—'}</div>
                    <div><strong>Ethnie:</strong> {result.victimEthnicity || '—'}</div>
                  </div>
                </div>

                {/* Description physique */}
                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-900 mb-2">👁️ Description physique</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Taille:</strong> {result.heightMeters ? `${result.heightMeters}m` : '—'}</div>
                    <div><strong>Poids:</strong> {result.weight || '—'}</div>
                    <div><strong>Cheveux:</strong> {[result.hairColor, result.hairLength, result.hairStyle].filter(Boolean).join(', ') || '—'}</div>
                    <div><strong>Yeux:</strong> {result.eyeColor || '—'}</div>
                    <div><strong>Corpulence:</strong> {result.bodyType || '—'}</div>
                    <div><strong>Teint:</strong> {result.skinTone || '—'}</div>
                  </div>
                </div>

                {/* Vêtements et accessoires */}
                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-900 mb-2">👕 Vêtements et accessoires</h4>
                  <div className="space-y-1">
                    <div><strong>Vêtements:</strong> {result.clothing || '—'}</div>
                    <div><strong>Accessoires:</strong> {result.accessories || '—'}</div>
                    <div><strong>Chaussures:</strong> {result.shoes || '—'}</div>
                  </div>
                </div>

                {/* Signes particuliers */}
                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-900 mb-2">🔍 Signes particuliers</h4>
                  <div className="space-y-1">
                    <div><strong>Signes généraux:</strong> {result.distinctiveMarks || '—'}</div>
                    <div><strong>Cicatrices:</strong> {result.scars || '—'}</div>
                    <div><strong>Tatouages:</strong> {result.tattoos || '—'}</div>
                    <div><strong>Piercings:</strong> {result.piercings || '—'}</div>
                  </div>
                </div>

                {/* Circonstances */}
                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-900 mb-2">📍 Circonstances</h4>
                  <div className="space-y-1">
                    <div><strong>Date/Heure:</strong> {result.abductedAt ? new Date(result.abductedAt).toLocaleString('fr-FR') : '—'}</div>
                    <div><strong>Lieu:</strong> {result.abductedLocation || '—'}</div>
                    <div><strong>Adresse précise:</strong> {result.abductedLocationDetails || '—'}</div>
                    <div><strong>Circonstances:</strong> {result.circumstances || '—'}</div>
                  </div>
                </div>

                {/* Véhicule */}
                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-900 mb-2">🚗 Véhicule</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Description:</strong> {result.vehicle || '—'}</div>
                    <div><strong>Couleur:</strong> {result.vehicleColor || '—'}</div>
                    <div><strong>Modèle:</strong> {result.vehicleModel || '—'}</div>
                    <div><strong>Immatriculation:</strong> {result.licensePlate || '—'}</div>
                  </div>
                </div>

                {/* Suspect */}
                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-900 mb-2">👤 Suspect</h4>
                  <div className="space-y-1">
                    <div><strong>Nom:</strong> {result.suspect || '—'}</div>
                    <div><strong>Âge:</strong> {result.suspectAge ? `${result.suspectAge} ans` : '—'}</div>
                    <div><strong>Description:</strong> {result.suspectDescription || '—'}</div>
                  </div>
                </div>

                {/* Informations de contact */}
                <div className="border-b pb-3">
                  <h4 className="font-semibold text-gray-900 mb-2">📞 Contact</h4>
                  <div className="space-y-1">
                    <div><strong>Téléphone:</strong> {result.contactPhone || '—'}</div>
                    <div><strong>Email:</strong> {result.contactEmail || '—'}</div>
                    <div><strong>Site web:</strong> {result.contactWebsite || '—'}</div>
                  </div>
                </div>

                {/* Informations générales */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">ℹ️ Informations générales</h4>
                  <div className="space-y-1">
                    <div><strong>Type d'alerte:</strong> {result.alertType || '—'}</div>
                    <div><strong>Numéro d'alerte:</strong> {result.alertNumber || '—'}</div>
                    <div><strong>Autorités:</strong> {result.authorities || '—'}</div>
                    <div><strong>Urgence:</strong> {result.urgency || '—'}</div>
                    <div><strong>Date affiche:</strong> {result.posterDate || '—'}</div>
                    <div><strong>Source:</strong> {result.posterSource || '—'}</div>
                    <div><strong>Confiance analyse:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                        result.confidence === 'high' ? 'bg-green-100 text-green-800' :
                        result.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.confidence === 'high' ? 'Élevée' : 
                         result.confidence === 'medium' ? 'Moyenne' : 'Faible'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={async () => {
                  const payload = await toReportPayload();
                  if (!payload) return;
                  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'signalement-pre-rempli.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}>Exporter JSON</Button>
                <Button onClick={handleCreateReport} disabled={isSubmitting} leftIcon={<CheckCircle className="h-4 w-4" />}>{isSubmitting ? 'Création…' : 'Créer le signalement'}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


