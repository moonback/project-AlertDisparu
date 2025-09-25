import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Filter,
  Calendar
} from 'lucide-react';
import { TimelineEvent, AnalyticsFilters } from '../../types/analytics';

interface TimelineChartProps {
  timeline: TimelineEvent[];
  compact?: boolean;
  filters?: AnalyticsFilters;
  onFilterChange?: (filters: Partial<AnalyticsFilters>) => void;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({
  timeline,
  compact = false,
  filters = {},
  onFilterChange
}) => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filtrer les événements selon les critères
  const filteredTimeline = useMemo(() => {
    let filtered = [...timeline];

    if (filters.confidence && filters.confidence.length > 0) {
      filtered = filtered.filter(event => filters.confidence!.includes(event.confidence));
    }

    if (filters.verified !== undefined) {
      filtered = filtered.filter(event => event.verified === filters.verified);
    }

    if (filters.dateRange?.start) {
      filtered = filtered.filter(event => event.timestamp >= filters.dateRange!.start!);
    }

    if (filters.dateRange?.end) {
      filtered = filtered.filter(event => event.timestamp <= filters.dateRange!.end!);
    }

    return filtered;
  }, [timeline, filters]);

  // Grouper les événements par date
  const groupedEvents = useMemo(() => {
    const groups = new Map<string, TimelineEvent[]>();
    
    filteredTimeline.forEach(event => {
      const date = new Date(event.timestamp).toDateString();
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(event);
    });

    return Array.from(groups.entries()).sort((a, b) => 
      new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  }, [filteredTimeline]);

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'observation':
        return <Eye className="h-4 w-4" />;
      case 'verification':
        return <CheckCircle className="h-4 w-4" />;
      case 'update':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (event: TimelineEvent) => {
    if (event.verified) return 'bg-green-500';
    
    switch (event.confidence) {
      case 'high':
        return 'bg-blue-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'success';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleConfidenceFilter = (confidence: string) => {
    if (!onFilterChange) return;
    
    const currentConfidence = filters.confidence || [];
    const newConfidence = currentConfidence.includes(confidence as any)
      ? currentConfidence.filter(c => c !== confidence)
      : [...currentConfidence, confidence as any];
    
    onFilterChange({ confidence: newConfidence.length > 0 ? newConfidence : undefined });
  };

  const handleVerifiedFilter = () => {
    if (!onFilterChange) return;
    
    const currentVerified = filters.verified;
    if (currentVerified === true) {
      onFilterChange({ verified: undefined });
    } else {
      onFilterChange({ verified: true });
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {filteredTimeline.slice(0, 5).map((event) => (
          <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-3 h-3 rounded-full mt-1 ${getEventColor(event)}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {event.title}
                </span>
                <Badge variant={getConfidenceBadgeColor(event.confidence)} size="sm">
                  {event.confidence}
                </Badge>
                {event.verified && (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {event.description}
              </p>
              <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{new Date(event.timestamp).toLocaleDateString('fr-FR')}</span>
                <MapPin className="h-3 w-3 ml-2" />
                <span className="truncate">{event.location.address}</span>
              </div>
            </div>
          </div>
        ))}
        
        {filteredTimeline.length > 5 && (
          <p className="text-xs text-gray-500 text-center">
            +{filteredTimeline.length - 5} autres événements
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          leftIcon={<Filter className="h-4 w-4" />}
        >
          Filtres
        </Button>
        
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Confiance:</span>
              {['high', 'medium', 'low'].map(conf => (
                <Button
                  key={conf}
                  variant={filters.confidence?.includes(conf as any) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleConfidenceFilter(conf)}
                >
                  {conf === 'high' ? 'Élevée' : conf === 'medium' ? 'Moyenne' : 'Faible'}
                </Button>
              ))}
            </div>
            
            <Button
              variant={filters.verified === true ? "default" : "outline"}
              size="sm"
              onClick={handleVerifiedFilter}
              leftIcon={<CheckCircle className="h-4 w-4" />}
            >
              Vérifiées seulement
            </Button>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {groupedEvents.map(([date, events]) => (
          <div key={date} className="mb-8">
            {/* Date header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 pb-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {new Date(date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <p className="text-sm text-gray-600">
                {events.length} événement{events.length > 1 ? 's' : ''}
              </p>
            </div>

            {/* Events */}
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedEvent?.id === event.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Timeline dot */}
                    <div className="relative">
                      <div className={`w-4 h-4 rounded-full ${getEventColor(event)} flex items-center justify-center`}>
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      {event !== events[events.length - 1] && (
                        <div className="absolute top-4 left-1/2 w-0.5 h-16 bg-gray-300 transform -translate-x-1/2" />
                      )}
                    </div>

                    {/* Event content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {getEventIcon(event)}
                        <h4 className="text-base font-semibold text-gray-900">
                          {event.title}
                        </h4>
                        <Badge variant={getConfidenceBadgeColor(event.confidence)} size="sm">
                          Confiance {event.confidence}
                        </Badge>
                        {event.verified && (
                          <Badge variant="success" size="sm" leftIcon={<CheckCircle className="h-3 w-3" />}>
                            Vérifié
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(event.timestamp).toLocaleTimeString('fr-FR')}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate max-w-[200px]">{event.location.address}</span>
                        </div>

                        {event.metadata?.observerName && (
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{event.metadata.observerName}</span>
                          </div>
                        )}

                        {event.metadata?.distanceFromDisappearance && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.metadata.distanceFromDisappearance.toFixed(1)} km</span>
                          </div>
                        )}

                        {event.metadata?.hasPhotos && (
                          <div className="flex items-center space-x-1 text-blue-600">
                            <Eye className="h-4 w-4" />
                            <span>Photos</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Event details modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Détails de l'événement
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  Fermer
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Titre</h4>
                  <p className="text-gray-700">{selectedEvent.title}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedEvent.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Date et heure</h4>
                    <p className="text-gray-700">
                      {new Date(selectedEvent.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Niveau de confiance</h4>
                    <Badge variant={getConfidenceBadgeColor(selectedEvent.confidence)}>
                      {selectedEvent.confidence}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Localisation</h4>
                  <p className="text-gray-700">{selectedEvent.location.address}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Coordonnées: {selectedEvent.location.lat.toFixed(6)}, {selectedEvent.location.lng.toFixed(6)}
                  </p>
                </div>

                {selectedEvent.metadata && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Métadonnées</h4>
                    <div className="space-y-2">
                      {selectedEvent.metadata.observerName && (
                        <p className="text-sm">
                          <span className="font-medium">Observateur:</span> {selectedEvent.metadata.observerName}
                        </p>
                      )}
                      {selectedEvent.metadata.distanceFromDisappearance && (
                        <p className="text-sm">
                          <span className="font-medium">Distance:</span> {selectedEvent.metadata.distanceFromDisappearance.toFixed(1)} km
                        </p>
                      )}
                      {selectedEvent.metadata.hasPhotos && (
                        <p className="text-sm">
                          <span className="font-medium">Photos:</span> Disponibles
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
