import { useCallback, useState } from 'react';
import { analyzeAlertPosterWithGemini, AlertPosterExtraction, AlertPosterAnalysisResponse } from '../services/geminiAlertPoster';

export interface UseAlertPosterAnalysisReturn {
  isAnalyzing: boolean;
  result: AlertPosterExtraction | null;
  error: string | null;
  analyze: (imageFile: File) => Promise<void>;
  clear: () => void;
}

export function useAlertPosterAnalysis(): UseAlertPosterAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AlertPosterExtraction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (imageFile: File) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const response: AlertPosterAnalysisResponse = await analyzeAlertPosterWithGemini(imageFile);
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error || 'Erreur lors de l\'analyse de l\'affiche');
      }
    } catch (e) {
      setError(`Erreur inattendue: ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { isAnalyzing, result, error, analyze, clear };
}


