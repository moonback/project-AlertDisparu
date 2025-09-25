import React from 'react';
import { cn } from '../../utils/cn';
import { AlertTriangle, MapPin, Clock, User } from 'lucide-react';

interface ProximityAlertProps {
  personName: string;
  age: number;
  location: string;
  distance: number;
  lastSeen: string;
  photo?: string;
  onViewDetails: () => void;
  onDismiss: () => void;
  className?: string;
}

export const ProximityAlert: React.FC<ProximityAlertProps> = ({
  personName,
  age,
  location,
  distance,
  lastSeen,
  photo,
  onViewDetails,
  onDismiss,
  className
}) => {
  return (
    <div className={cn(
      'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-medium',
      'animate-slide-down',
      className
    )}>
      <div className="flex items-start space-x-3">
        {/* Alert Icon */}
        <div className="flex-shrink-0">
          <div className="p-2 bg-amber-100 rounded-full">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-amber-900">
              Personne disparue à proximité
            </h3>
            <button
              onClick={onDismiss}
              className="text-amber-600 hover:text-amber-800 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-start space-x-3">
            {/* Photo */}
            {photo ? (
              <img
                src={photo}
                alt={personName}
                className="w-12 h-12 object-cover rounded-lg border border-amber-200"
              />
            ) : (
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center border border-amber-200">
                <User className="h-6 w-6 text-amber-600" />
              </div>
            )}

            {/* Details */}
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-1">
                {personName}, {age} ans
              </h4>
              
              <div className="space-y-1 text-sm text-amber-800">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3 w-3" />
                  <span>{location}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3" />
                  <span>Disparu le {lastSeen}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="font-medium">À {distance} km de votre position</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-amber-700">
              Gardez les yeux ouverts et contactez les autorités si vous avez des informations.
            </p>
            
            <button
              onClick={onViewDetails}
              className="px-3 py-1 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
            >
              Voir les détails
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
