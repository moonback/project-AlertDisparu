/**
 * Service de cache pour les scénarios de résolution
 * Améliore les performances en évitant les régénérations inutiles
 */

import { ResolutionScenariosResponse } from './geminiResolutionScenarios';
import { SavedResolutionScenario } from '../types';

// Cache en mémoire pour les scénarios générés
const generatedScenariosCache = new Map<string, {
  data: ResolutionScenariosResponse;
  timestamp: number;
  ttl: number; // Time to live en millisecondes
}>();

// Cache en mémoire pour les scénarios sauvegardés
const savedScenariosCache = new Map<string, {
  data: SavedResolutionScenario[];
  timestamp: number;
  ttl: number;
}>();

// Configuration du cache
const CACHE_CONFIG = {
  GENERATED_TTL: 30 * 60 * 1000, // 30 minutes pour les scénarios générés
  SAVED_TTL: 5 * 60 * 1000, // 5 minutes pour les scénarios sauvegardés
  MAX_CACHE_SIZE: 100 // Maximum 100 entrées par cache
};

/**
 * Génère une clé de cache basée sur les données du rapport
 */
function generateCacheKey(reportId: string, observationsHash?: string): string {
  return `scenario_${reportId}_${observationsHash || 'default'}`;
}

/**
 * Génère un hash des observations pour détecter les changements
 */
function generateObservationsHash(observations: any[]): string {
  const hash = observations
    .map(obs => `${obs.id}_${obs.observationDate}_${obs.confidenceLevel}`)
    .join('|');
  
  // Hash simple basé sur la longueur et le contenu
  return btoa(hash).substring(0, 16);
}

/**
 * Nettoie le cache des entrées expirées
 */
function cleanupCache<T>(cache: Map<string, { data: T; timestamp: number; ttl: number }>): void {
  const now = Date.now();
  const entries = Array.from(cache.entries());
  
  // Supprimer les entrées expirées
  entries.forEach(([key, value]) => {
    if (now - value.timestamp > value.ttl) {
      cache.delete(key);
    }
  });
  
  // Limiter la taille du cache
  if (cache.size > CACHE_CONFIG.MAX_CACHE_SIZE) {
    const sortedEntries = entries
      .filter(([_, value]) => now - value.timestamp <= value.ttl)
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Supprimer les entrées les plus anciennes
    const toDelete = sortedEntries.slice(0, cache.size - CACHE_CONFIG.MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => cache.delete(key));
  }
}

/**
 * Cache pour les scénarios générés
 */
export class GeneratedScenariosCache {
  /**
   * Récupère un scénario généré depuis le cache
   */
  static get(reportId: string, observations: any[]): ResolutionScenariosResponse | null {
    cleanupCache(generatedScenariosCache);
    
    const observationsHash = generateObservationsHash(observations);
    const cacheKey = generateCacheKey(reportId, observationsHash);
    const cached = generatedScenariosCache.get(cacheKey);
    
    if (cached) {
      console.log('🎯 Cache hit pour scénarios générés:', cacheKey);
      return cached.data;
    }
    
    console.log('❌ Cache miss pour scénarios générés:', cacheKey);
    return null;
  }
  
  /**
   * Met en cache un scénario généré
   */
  static set(reportId: string, observations: any[], data: ResolutionScenariosResponse): void {
    cleanupCache(generatedScenariosCache);
    
    const observationsHash = generateObservationsHash(observations);
    const cacheKey = generateCacheKey(reportId, observationsHash);
    
    generatedScenariosCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: CACHE_CONFIG.GENERATED_TTL
    });
    
    console.log('💾 Scénarios générés mis en cache:', cacheKey);
  }
  
  /**
   * Invalide le cache pour un rapport spécifique
   */
  static invalidate(reportId: string): void {
    const keysToDelete = Array.from(generatedScenariosCache.keys())
      .filter(key => key.startsWith(`scenario_${reportId}_`));
    
    keysToDelete.forEach(key => generatedScenariosCache.delete(key));
    console.log('🗑️ Cache invalidé pour le rapport:', reportId);
  }
  
  /**
   * Vide complètement le cache
   */
  static clear(): void {
    generatedScenariosCache.clear();
    console.log('🧹 Cache des scénarios générés vidé');
  }
  
  /**
   * Retourne les statistiques du cache
   */
  static getStats(): { size: number; entries: string[] } {
    cleanupCache(generatedScenariosCache);
    return {
      size: generatedScenariosCache.size,
      entries: Array.from(generatedScenariosCache.keys())
    };
  }
}

/**
 * Cache pour les scénarios sauvegardés
 */
export class SavedScenariosCache {
  /**
   * Récupère les scénarios sauvegardés depuis le cache
   */
  static get(reportId: string): SavedResolutionScenario[] | null {
    cleanupCache(savedScenariosCache);
    
    const cached = savedScenariosCache.get(reportId);
    
    if (cached) {
      console.log('🎯 Cache hit pour scénarios sauvegardés:', reportId);
      return cached.data;
    }
    
    console.log('❌ Cache miss pour scénarios sauvegardés:', reportId);
    return null;
  }
  
  /**
   * Met en cache les scénarios sauvegardés
   */
  static set(reportId: string, data: SavedResolutionScenario[]): void {
    cleanupCache(savedScenariosCache);
    
    savedScenariosCache.set(reportId, {
      data,
      timestamp: Date.now(),
      ttl: CACHE_CONFIG.SAVED_TTL
    });
    
    console.log('💾 Scénarios sauvegardés mis en cache:', reportId);
  }
  
  /**
   * Invalide le cache pour un rapport spécifique
   */
  static invalidate(reportId: string): void {
    savedScenariosCache.delete(reportId);
    console.log('🗑️ Cache invalidé pour le rapport:', reportId);
  }
  
  /**
   * Vide complètement le cache
   */
  static clear(): void {
    savedScenariosCache.clear();
    console.log('🧹 Cache des scénarios sauvegardés vidé');
  }
  
  /**
   * Retourne les statistiques du cache
   */
  static getStats(): { size: number; entries: string[] } {
    cleanupCache(savedScenariosCache);
    return {
      size: savedScenariosCache.size,
      entries: Array.from(savedScenariosCache.keys())
    };
  }
}

/**
 * Service de cache unifié
 */
export class ScenarioCacheService {
  /**
   * Nettoie tous les caches
   */
  static cleanup(): void {
    GeneratedScenariosCache.clear();
    SavedScenariosCache.clear();
  }
  
  /**
   * Retourne les statistiques de tous les caches
   */
  static getAllStats(): {
    generated: { size: number; entries: string[] };
    saved: { size: number; entries: string[] };
  } {
    return {
      generated: GeneratedScenariosCache.getStats(),
      saved: SavedScenariosCache.getStats()
    };
  }
  
  /**
   * Invalide tous les caches pour un rapport
   */
  static invalidateReport(reportId: string): void {
    GeneratedScenariosCache.invalidate(reportId);
    SavedScenariosCache.invalidate(reportId);
  }
}

// Nettoyage automatique du cache toutes les 10 minutes
setInterval(() => {
  GeneratedScenariosCache.getStats();
  SavedScenariosCache.getStats();
}, 10 * 60 * 1000);
