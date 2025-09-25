import React from 'react';
import { Loader2, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import { GeocodingResult } from '../../services/geocoding';

interface GeocodingStatusProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  result?: GeocodingResult | null;
  error?: string;
  className?: string;
}

export const GeocodingStatus: React.FC<GeocodingStatusProps> = ({
  status,
  result,
  error,
  className = ''
}) => {
  if (status === 'idle') {
    return null;
  }

  if (status === 'loading') {
    return (
      <div className={`flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200 ${className}`}>
        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
        <span className="text-sm text-blue-800">Géocodage de l'adresse en cours...</span>
      </div>
    );
  }

  if (status === 'success' && result) {
    return (
      <div className={`flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Adresse géocodée avec succès</p>
          <p className="text-xs text-green-600">
            Coordonnées: {result.coordinates.lat.toFixed(6)}, {result.coordinates.lng.toFixed(6)}
          </p>
          <p className="text-xs text-green-600">
            Confiance: {Math.round(result.confidence * 100)}%
          </p>
          {result.formattedAddress && (
            <p className="text-xs text-green-600 truncate">
              Adresse: {result.formattedAddress}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (status === 'error' && error) {
    return (
      <div className={`flex items-center space-x-2 p-3 bg-amber-50 rounded-lg border border-amber-200 ${className}`}>
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800">Géocodage échoué</p>
          <p className="text-xs text-amber-600">{error}</p>
          <p className="text-xs text-amber-600">Des coordonnées par défaut seront utilisées.</p>
        </div>
      </div>
    );
  }

  return null;
};
