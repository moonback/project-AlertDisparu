import { useState, useCallback, useRef } from 'react';
import { geocodeLocation, GeocodingResult, GeocodingError } from '../services/geocoding';

export interface UseGeocodingReturn {
  geocodingStatus: 'idle' | 'loading' | 'success' | 'error';
  geocodingResult: GeocodingResult | null;
  geocodingError: string;
  geocodeAddress: (address: string, city: string, state: string) => Promise<void>;
  clearGeocoding: () => void;
}

/**
 * Hook personnalisé pour gérer le géocodage d'adresses
 * @param debounceMs - Délai de debounce en millisecondes (défaut: 1000)
 * @returns Objet avec l'état du géocodage et les fonctions utilitaires
 */
export const useGeocoding = (debounceMs: number = 1000): UseGeocodingReturn => {
  const [geocodingStatus, setGeocodingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult | null>(null);
  const [geocodingError, setGeocodingError] = useState<string>('');
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const geocodeAddress = useCallback(async (address: string, city: string, state: string) => {
    // Annuler le timeout précédent s'il existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Si l'adresse est vide, réinitialiser l'état
    if (!address) {
      setGeocodingStatus('idle');
      setGeocodingResult(null);
      setGeocodingError('');
      return;
    }

    // Débouncer l'appel API
    timeoutRef.current = setTimeout(async () => {
      setGeocodingStatus('loading');
      setGeocodingError('');

      try {
        const result = await geocodeLocation(address, city, state, 'France');
        setGeocodingResult(result);
        setGeocodingStatus('success');
        console.log('✅ Géocodage réussi:', result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors du géocodage';
        setGeocodingError(errorMessage);
        setGeocodingStatus('error');
        console.error('❌ Erreur de géocodage:', error);
      }
    }, debounceMs);
  }, [debounceMs]);

  const clearGeocoding = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setGeocodingStatus('idle');
    setGeocodingResult(null);
    setGeocodingError('');
  }, []);

  return {
    geocodingStatus,
    geocodingResult,
    geocodingError,
    geocodeAddress,
    clearGeocoding
  };
};
