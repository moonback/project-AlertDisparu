import React, { useState } from 'react';
import { Button } from './Button';
import { Card, CardContent, CardHeader } from './Card';
import { Alert } from './Alert';
import { LoadingSpinner } from './LoadingSpinner';
import { useImageAnalysis } from '../../hooks/useImageAnalysis';
import { 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Wand2, 
  Eye,
  RefreshCw,
  X
} from 'lucide-react';

interface ImageAnalysisProps {
  imageFile: File | null;
  missingPersonName: string;
  missingPersonDescription?: string;
  onAnalysisComplete: (result: any) => void;
  onClearAnalysis: () => void;
}

export const ImageAnalysis: React.FC<ImageAnalysisProps> = ({
  imageFile,
  missingPersonName,
  missingPersonDescription,
  onAnalysisComplete,
  onClearAnalysis
}) => {
  const { isAnalyzing, analysisResult, error, analyzeImage, clearAnalysis } = useImageAnalysis();
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    if (!imageFile) return;
    
    await analyzeImage(imageFile, missingPersonName, missingPersonDescription);
    setHasAnalyzed(true);
  };

  const handleApplyAnalysis = () => {
    if (analysisResult) {
      onAnalysisComplete(analysisResult);
    }
  };

  const handleClear = () => {
    clearAnalysis();
    onClearAnalysis();
    setHasAnalyzed(false);
  };

  if (!imageFile) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Eye className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">Aucune image sélectionnée pour l'analyse</p>
      </div>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Analyse intelligente de l'image
            </h3>
          </div>
          {hasAnalyzed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              leftIcon={<X className="h-4 w-4" />}
            >
              Effacer
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Utilisez l'IA pour analyser automatiquement l'image et remplir les champs
        </p>
      </CardHeader>
      
      <CardContent>
        {!hasAnalyzed ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-4">
                  Image sélectionnée : <strong>{imageFile.name}</strong>
                </p>
                <Button
                  onClick={handleAnalyze}
                  leftIcon={<Wand2 className="h-4 w-4" />}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'Analyse en cours...' : 'Analyser avec IA'}
                </Button>
              </div>
            </div>
            
            {isAnalyzing && (
              <div className="flex items-center justify-center p-4">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm text-gray-600">
                  Analyse de l'image en cours...
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {error ? (
              <Alert variant="error" title="Erreur d'analyse">
                <div className="space-y-2">
                  <p>{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAnalyze}
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                  >
                    Réessayer
                  </Button>
                </div>
              </Alert>
            ) : analysisResult ? (
              <div className="space-y-4">
                <Alert variant="success" title="Analyse terminée">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>L'image a été analysée avec succès</span>
                  </div>
                </Alert>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description générale</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {analysisResult.description}
                    </p>
                  </div>

                  {analysisResult.clothingDescription && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Vêtements observés</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {analysisResult.clothingDescription}
                      </p>
                    </div>
                  )}

                  {analysisResult.behaviorDescription && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Comportement observé</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {analysisResult.behaviorDescription}
                      </p>
                    </div>
                  )}

                  {analysisResult.companions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Personnes accompagnant</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {analysisResult.companions}
                      </p>
                    </div>
                  )}

                  {analysisResult.vehicleInfo && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Véhicule observé</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {analysisResult.vehicleInfo}
                      </p>
                    </div>
                  )}

                  {analysisResult.location && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Environnement observé</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {analysisResult.location}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Niveau de confiance:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      analysisResult.confidence === 'high' 
                        ? 'bg-green-100 text-green-800'
                        : analysisResult.confidence === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {analysisResult.confidence === 'high' ? 'Élevé' : 
                       analysisResult.confidence === 'medium' ? 'Moyen' : 'Faible'}
                    </span>
                  </div>

                  {analysisResult.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Suggestions</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {analysisResult.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleClear}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleApplyAnalysis}
                    leftIcon={<CheckCircle className="h-4 w-4" />}
                  >
                    Appliquer l'analyse
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
