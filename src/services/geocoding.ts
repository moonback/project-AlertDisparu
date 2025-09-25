/**
 * Service de géocodage pour convertir les adresses en coordonnées GPS
 * Utilise l'API Nominatim d'OpenStreetMap (gratuite et sans clé API)
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  coordinates: Coordinates;
  formattedAddress: string;
  confidence: number;
}

export interface GeocodingError {
  message: string;
  code: string;
}

/**
 * Géocode une adresse complète en coordonnées GPS
 * @param address - Adresse complète à géocoder
 * @returns Promise avec les coordonnées ou une erreur
 */
export const geocodeAddress = async (address: string): Promise<GeocodingResult> => {
  try {
    // Construire l'URL de l'API Nominatim
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=fr&addressdetails=1`;
    
    console.log('🌍 Géocodage de l\'adresse:', address);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AlertDisparu/1.0 (contact@alertdisparu.fr)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('Aucun résultat trouvé pour cette adresse');
    }

    const result = data[0];
    const coordinates: Coordinates = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };

    // Calculer un score de confiance basé sur la précision
    const confidence = calculateConfidence(result);

    console.log('✅ Géocodage réussi:', {
      address: result.display_name,
      coordinates,
      confidence
    });

    return {
      coordinates,
      formattedAddress: result.display_name,
      confidence
    };

  } catch (error) {
    console.error('❌ Erreur de géocodage:', error);
    throw {
      message: error instanceof Error ? error.message : 'Erreur inconnue lors du géocodage',
      code: 'GEOCODING_ERROR'
    } as GeocodingError;
  }
};

/**
 * Géocode une adresse construite à partir des composants
 * @param address - Adresse de rue
 * @param city - Ville
 * @param state - Région/État
 * @param country - Pays (optionnel, par défaut France)
 * @returns Promise avec les coordonnées ou une erreur
 */
export const geocodeLocation = async (
  address: string,
  city: string,
  state: string,
  country: string = 'France'
): Promise<GeocodingResult> => {
  // Construire l'adresse complète
  const fullAddress = `${address}, ${city}, ${state}, ${country}`;
  return geocodeAddress(fullAddress);
};

/**
 * Calcule un score de confiance basé sur la précision du résultat
 * @param result - Résultat de l'API Nominatim
 * @returns Score de confiance entre 0 et 1
 */
const calculateConfidence = (result: any): number => {
  const precision = result.importance || 0;
  
  // Mapper l'importance (0-1) vers un score de confiance
  if (precision > 0.8) return 1.0;      // Très précis
  if (precision > 0.6) return 0.8;      // Précis
  if (precision > 0.4) return 0.6;      // Moyennement précis
  if (precision > 0.2) return 0.4;      // Peu précis
  return 0.2;                           // Très peu précis
};

/**
 * Valide si des coordonnées sont valides
 * @param coordinates - Coordonnées à valider
 * @returns true si les coordonnées sont valides
 */
export const validateCoordinates = (coordinates: Coordinates): boolean => {
  return (
    coordinates.lat >= -90 && coordinates.lat <= 90 &&
    coordinates.lng >= -180 && coordinates.lng <= 180 &&
    !isNaN(coordinates.lat) && !isNaN(coordinates.lng)
  );
};

/**
 * Calcule la distance entre deux points en kilomètres
 * @param coord1 - Première coordonnée
 * @param coord2 - Deuxième coordonnée
 * @returns Distance en kilomètres
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Service de géocodage inversé (coordonnées vers adresse)
 * @param coordinates - Coordonnées GPS
 * @returns Promise avec l'adresse formatée
 */
export const reverseGeocode = async (coordinates: Coordinates): Promise<string> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AlertDisparu/1.0 (contact@alertdisparu.fr)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.display_name) {
      throw new Error('Impossible de déterminer l\'adresse pour ces coordonnées');
    }

    return data.display_name;

  } catch (error) {
    console.error('❌ Erreur de géocodage inversé:', error);
    throw {
      message: error instanceof Error ? error.message : 'Erreur inconnue lors du géocodage inversé',
      code: 'REVERSE_GEOCODING_ERROR'
    } as GeocodingError;
  }
};
