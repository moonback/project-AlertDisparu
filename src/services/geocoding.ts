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
 * Normalise des segments d'adresse (trim, espaces, accents/régions communes)
 */
const normalizePart = (value: string): string => {
  if (!value) return '';
  const v = value
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .trim();
  // Corrections courantes FR
  return v
    .replace(/ile[- ]?de[- ]?france/gi, 'Île-de-France')
    .replace(/yvelines/gi, 'Yvelines')
    .replace(/paris/gi, 'Paris');
};

/**
 * Calcule un score de confiance basé sur la précision du résultat
 */
const calculateConfidence = (result: any): number => {
  const precision = result?.importance || 0;
  if (precision > 0.8) return 1.0;
  if (precision > 0.6) return 0.8;
  if (precision > 0.4) return 0.6;
  if (precision > 0.2) return 0.4;
  return 0.2;
};

/**
 * Point d'appel Nominatim pour une requête libre
 */
const geocodeFreeQuery = async (query: string): Promise<GeocodingResult> => {
  const encodedAddress = encodeURIComponent(query);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=fr&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'AlertDisparu/1.0 (contact@alertdisparu.fr)',
      'Accept': 'application/json',
      'Accept-Language': 'fr-FR,fr;q=0.9'
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

  const confidence = calculateConfidence(result);
  return {
    coordinates,
    formattedAddress: result.display_name,
    confidence
  };
};

/**
 * Géocode une adresse complète en coordonnées GPS
 */
export const geocodeAddress = async (address: string): Promise<GeocodingResult> => {
  try {
    const normalized = normalizePart(address);
    console.log('🌍 Géocodage de l\'adresse:', normalized);
    return await geocodeFreeQuery(normalized);
  } catch (error) {
    console.error('❌ Erreur de géocodage:', error);
    throw {
      message: error instanceof Error ? error.message : 'Erreur inconnue lors du géocodage',
      code: 'GEOCODING_ERROR'
    } as GeocodingError;
  }
};

/**
 * Géocode une adresse construite à partir des composants avec fallbacks
 */
export const geocodeLocation = async (
  address: string,
  city: string,
  state: string,
  country: string = 'France'
): Promise<GeocodingResult> => {
  const a = normalizePart(address);
  const c = normalizePart(city);
  const s = normalizePart(state);
  const k = normalizePart(country || 'France');

  // Générer plusieurs variantes de requêtes (de la plus précise à la plus large)
  const queries: string[] = [
    `${a}, ${c}, ${s}, ${k}`,
    `${a}, ${c} ${s}, ${k}`,
    `${a}, ${c}, ${k}`,
    `${c}, ${s}, ${k}`,
    `${a}, ${k}`,
    `${c}, ${k}`,
  ].filter(Boolean);

  let lastError: any = null;
  for (const q of queries) {
    try {
      console.log('🌍 Tentative géocodage avec:', q);
      const result = await geocodeFreeQuery(q);
      console.log('✅ Géocodage réussi:', result);
      return result;
    } catch (err) {
      lastError = err;
      console.warn('⚠️ Tentative échouée pour', q, err);
      continue;
    }
  }

  // Échec: remonter une erreur claire
  throw {
    message: lastError instanceof Error ? lastError.message : 'Aucun résultat trouvé pour cette adresse',
    code: 'GEOCODING_ERROR'
  } as GeocodingError;
};

/**
 * Valide si des coordonnées sont valides
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
 */
export const reverseGeocode = async (coordinates: Coordinates): Promise<string> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AlertDisparu/1.0 (contact@alertdisparu.fr)',
        'Accept': 'application/json',
        'Accept-Language': 'fr-FR,fr;q=0.9'
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
