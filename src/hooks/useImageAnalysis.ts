import { useState, useCallback } from 'react';
import { analyzeImageWithGemini, ImageAnalysisResult, GeminiAnalysisResponse } from '../services/gemini';

export interface UseImageAnalysisReturn {
  isAnalyzing: boolean;
  analysisResult: ImageAnalysisResult | null;
  error: string | null;
  analyzeImage: (imageFile: File, missingPersonName: string, missingPersonDescription?: string) => Promise<void>;
  clearAnalysis: () => void;
}

/**
 * Hook pour gérer l'analyse d'images avec Gemini
 */
export function useImageAnalysis(): UseImageAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = useCallback(async (
    imageFile: File,
    missingPersonName: string,
    missingPersonDescription?: string
  ) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response: GeminiAnalysisResponse = await analyzeImageWithGemini(
        imageFile,
        missingPersonName,
        missingPersonDescription
      );

      if (response.success && response.data) {
        setAnalysisResult(response.data);
      } else {
        setError(response.error || 'Erreur lors de l\'analyse de l\'image');
      }
    } catch (err) {
      setError(`Erreur inattendue: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    analysisResult,
    error,
    analyzeImage,
    clearAnalysis
  };
}
