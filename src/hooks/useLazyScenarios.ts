import { useState, useEffect, useCallback, useRef } from 'react';
import { SavedResolutionScenario } from '../types';
import { GeneratedScenariosCache, SavedScenariosCache } from '../services/scenarioCache';

interface UseLazyScenariosOptions {
  reportId: string;
  observations: any[];
  generateScenarios: (reportId: string, observations: any[]) => Promise<any>;
  loadSavedScenarios: (reportId: string) => Promise<SavedResolutionScenario[]>;
  debounceMs?: number;
  preloadThreshold?: number; // Distance en pixels avant de précharger
}

interface UseLazyScenariosReturn {
  // État des scénarios générés
  generatedScenarios: any | null;
  generatedLoading: boolean;
  generatedError: string | null;
  
  // État des scénarios sauvegardés
  savedScenarios: SavedResolutionScenario[];
  savedLoading: boolean;
  savedError: string | null;
  
  // Actions
  generateScenarios: () => Promise<void>;
  refreshSavedScenarios: () => Promise<void>;
  invalidateCache: () => void;
  
  // Statistiques
  cacheStats: {
    generated: { size: number; entries: string[] };
    saved: { size: number; entries: string[] };
  };
}

/**
 * Hook pour le chargement paresseux des scénarios avec cache et optimisations
 */
export function useLazyScenarios({
  reportId,
  observations,
  generateScenarios: generateScenariosFn,
  loadSavedScenarios: loadSavedScenariosFn,
  debounceMs = 300,
  preloadThreshold = 200
}: UseLazyScenariosOptions): UseLazyScenariosReturn {
  
  // États pour les scénarios générés
  const [generatedScenarios, setGeneratedScenarios] = useState<any | null>(null);
  const [generatedLoading, setGeneratedLoading] = useState(false);
  const [generatedError, setGeneratedError] = useState<string | null>(null);
  
  // États pour les scénarios sauvegardés
  const [savedScenarios, setSavedScenarios] = useState<SavedResolutionScenario[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);
  
  // Refs pour éviter les appels multiples
  const generatingRef = useRef(false);
  const loadingSavedRef = useRef(false);
  
  // Cache des statistiques
  const [cacheStats, setCacheStats] = useState({
    generated: { size: 0, entries: [] as string[] },
    saved: { size: 0, entries: [] as string[] }
  });

  /**
   * Met à jour les statistiques du cache
   */
  const updateCacheStats = useCallback(() => {
    setCacheStats({
      generated: GeneratedScenariosCache.getStats(),
      saved: SavedScenariosCache.getStats()
    });
  }, []);

  /**
   * Génère les scénarios avec cache et debouncing
   */
  const generateScenarios = useCallback(async () => {
    if (generatingRef.current) {
      console.log('⏳ Génération déjà en cours, ignorée');
      return;
    }

    // Vérifier le cache d'abord
    const cached = GeneratedScenariosCache.get(reportId, observations);
    if (cached) {
      console.log('🎯 Utilisation du cache pour les scénarios générés');
      setGeneratedScenarios(cached.data || null);
      setGeneratedError(cached.error || null);
      updateCacheStats();
      return;
    }

    generatingRef.current = true;
    setGeneratedLoading(true);
    setGeneratedError(null);

    try {
      console.log('🚀 Génération de nouveaux scénarios...');
      const result = await generateScenariosFn(reportId, observations);
      
      if (result.success) {
        setGeneratedScenarios(result.data || null);
        setGeneratedError(result.error || null);
        
        // Mettre en cache le résultat
        GeneratedScenariosCache.set(reportId, observations, result);
        updateCacheStats();
        
        // Rafraîchir les scénarios sauvegardés si un nouveau a été créé
        if (result.savedScenarioId) {
          await refreshSavedScenarios();
        }
      } else {
        setGeneratedError(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('❌ Erreur génération scénarios:', error);
      setGeneratedError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setGeneratedLoading(false);
      generatingRef.current = false;
    }
  }, [reportId, observations, generateScenariosFn, updateCacheStats]);

  /**
   * Charge les scénarios sauvegardés avec cache
   */
  const refreshSavedScenarios = useCallback(async () => {
    if (loadingSavedRef.current) {
      console.log('⏳ Chargement sauvegardés déjà en cours, ignoré');
      return;
    }

    // Vérifier le cache d'abord
    const cached = SavedScenariosCache.get(reportId);
    if (cached) {
      console.log('🎯 Utilisation du cache pour les scénarios sauvegardés');
      setSavedScenarios(cached);
      updateCacheStats();
      return;
    }

    loadingSavedRef.current = true;
    setSavedLoading(true);
    setSavedError(null);

    try {
      console.log('📥 Chargement des scénarios sauvegardés...');
      const scenarios = await loadSavedScenariosFn(reportId);
      
      setSavedScenarios(scenarios);
      
      // Mettre en cache le résultat
      SavedScenariosCache.set(reportId, scenarios);
      updateCacheStats();
    } catch (error) {
      console.error('❌ Erreur chargement scénarios sauvegardés:', error);
      setSavedError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setSavedLoading(false);
      loadingSavedRef.current = false;
    }
  }, [reportId, loadSavedScenariosFn, updateCacheStats]);

  /**
   * Invalide le cache pour ce rapport
   */
  const invalidateCache = useCallback(() => {
    GeneratedScenariosCache.invalidate(reportId);
    SavedScenariosCache.invalidate(reportId);
    updateCacheStats();
    console.log('🗑️ Cache invalidé pour le rapport:', reportId);
  }, [reportId, updateCacheStats]);

  /**
   * Charge les scénarios sauvegardés au montage
   */
  useEffect(() => {
    refreshSavedScenarios();
  }, [refreshSavedScenarios]);

  /**
   * Met à jour les statistiques du cache périodiquement
   */
  useEffect(() => {
    updateCacheStats();
    const interval = setInterval(updateCacheStats, 30000); // Toutes les 30 secondes
    return () => clearInterval(interval);
  }, [updateCacheStats]);

  /**
   * Précharge les scénarios quand l'utilisateur approche du bouton
   */
  useEffect(() => {
    const handleScroll = () => {
      const generateButton = document.querySelector('[data-scenario-generate-button]');
      if (generateButton) {
        const rect = generateButton.getBoundingClientRect();
        const distanceToButton = rect.top - window.innerHeight;
        
        if (distanceToButton <= preloadThreshold && !generatedScenarios && !generatedLoading) {
          console.log('🎯 Préchargement des scénarios...');
          generateScenarios();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [generateScenarios, generatedScenarios, generatedLoading, preloadThreshold]);

  return {
    // État des scénarios générés
    generatedScenarios,
    generatedLoading,
    generatedError,
    
    // État des scénarios sauvegardés
    savedScenarios,
    savedLoading,
    savedError,
    
    // Actions
    generateScenarios,
    refreshSavedScenarios,
    invalidateCache,
    
    // Statistiques
    cacheStats
  };
}
