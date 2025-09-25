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

  const toReportPayload = () => {
    if (!result) return null;
    const [firstName, ...rest] = (result.victimName || '').split(' ').filter(Boolean);
    const lastName = rest.join(' ') || undefined;

    const descriptionParts: string[] = [];
    if (result.description) descriptionParts.push(result.description);
    if (result.distinctiveMarks) descriptionParts.push(`Signes particuliers: ${result.distinctiveMarks}`);
    if (result.vehicle) descriptionParts.push(`Véhicule: ${result.vehicle}`);
    if (result.suspect) descriptionParts.push(`Suspect: ${result.suspect}`);
    const description = descriptionParts.join('\n');

    return {
      firstName: firstName || 'Inconnu',
      lastName: lastName || 'Inconnu',
      age: result.victimAge || undefined,
      gender: result.victimGender || undefined,
      photo: undefined as string | undefined,
      caseType: 'abduction' as const,
      dateDisappeared: result.abductedAt ? result.abductedAt.substring(0, 10) : undefined,
      timeDisappeared: undefined,
      locationDisappeared: {
        address: result.abductedLocation || '',
        city: '',
        state: '',
        country: 'France',
        coordinates: { lat: 0, lng: 0 }
      },
      description,
      circumstances: 'Informations extraites automatiquement depuis une affiche « Alerte Enlèvement ». À vérifier.',
      clothingDescription: result.clothing || undefined,
      personalItems: undefined,
      medicalInfo: undefined,
      behavioralInfo: undefined,
      reporterContact: {
        name: 'Anonyme',
        relationship: 'Témoin',
        phone: '',
        email: ''
      },
      consentGiven: true,
      priority: 'high' as const,
      isEmergency: true
    };
  };

  const handleCreateReport = async () => {
    const payload = toReportPayload();
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
              <div className="bg-gray-50 rounded p-4 space-y-2 text-sm text-gray-800">
                <div><strong>Nom victime:</strong> {result.victimName || '—'}</div>
                <div><strong>Âge:</strong> {result.victimAge ?? '—'}</div>
                <div><strong>Sexe:</strong> {result.victimGender || '—'}</div>
                <div><strong>Taille (m):</strong> {result.heightMeters ?? '—'}</div>
                <div><strong>Cheveux:</strong> {[result.hairColor, result.hairLength].filter(Boolean).join(', ') || '—'}</div>
                <div><strong>Yeux:</strong> {result.eyeColor || '—'}</div>
                <div><strong>Vêtements:</strong> {result.clothing || '—'}</div>
                <div><strong>Lieu/Date enlèvement:</strong> {result.abductedLocation || '—'} {result.abductedAt ? `(${result.abductedAt})` : ''}</div>
                <div><strong>Véhicule:</strong> {result.vehicle || '—'}</div>
                <div><strong>Suspect:</strong> {result.suspect || '—'}</div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={() => {
                  const payload = toReportPayload();
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


