import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, LayersControl } from 'react-leaflet';
import { useMissingPersonsStore } from '../../store/missingPersonsStore';
import { Button } from '../ui/Button';
import { 
  User, 
  MapPin, 
  AlertTriangle, 
  Filter, 
  Search, 
  Calendar, 
  Eye, 
  Clock, 
  Map,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Share2,
  Download,
  Settings,
  Bell,
  Target,
  Navigation,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './MissingPersonsMap.css';
import { MapHelp } from './MapHelp';
import L from 'leaflet';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Composant de contrôle de la carte
const MapControls: React.FC<{
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onToggleLayers: () => void;
  onShowHelp: () => void;
  showLayers: boolean;
}> = ({ onZoomIn, onZoomOut, onResetView, onToggleLayers, onShowHelp, showLayers }) => (
  <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
    <div className="glass-card p-1 map-controls">
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-white/20 rounded transition-colors"
        title="Zoom avant"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-white/20 rounded transition-colors"
        title="Zoom arrière"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        onClick={onResetView}
        className="p-2 hover:bg-white/20 rounded transition-colors"
        title="Vue par défaut"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
      <button
        onClick={onToggleLayers}
        className={`p-2 hover:bg-white/20 rounded transition-colors ${showLayers ? 'bg-primary-500/20' : ''}`}
        title="Afficher les couches"
      >
        <Layers className="h-4 w-4" />
      </button>
      <button
        onClick={onShowHelp}
        className="p-2 hover:bg-white/20 rounded transition-colors"
        title="Aide"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
    </div>
  </div>
);

// Composant de recherche et filtres
const SearchFilters: React.FC<{
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
  nearbyCount: number;
}> = ({ onSearch, onFilterChange, nearbyCount }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gender: 'all',
    caseType: 'all',
    priority: 'all',
    dateRange: { start: '', end: '' },
    ageRange: { min: 0, max: 100 }
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="mb-6 glass-card p-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Barre de recherche */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, ville..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2 glass-input focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Bouton filtres */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 glass-button hover:bg-blue-700 transition-colors"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres
          {nearbyCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {nearbyCount}
            </span>
          )}
        </button>
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="male">Homme</option>
              <option value="female">Femme</option>
              <option value="other">Autre</option>
            </select>
          </div>

          {/* Type de cas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de cas</label>
            <select
              value={filters.caseType}
              onChange={(e) => handleFilterChange('caseType', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="disappearance">Disparition</option>
              <option value="runaway">Fugue</option>
              <option value="abduction">Enlèvement</option>
              <option value="missing_adult">Adulte disparu</option>
              <option value="missing_child">Enfant disparu</option>
            </select>
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes</option>
              <option value="critical">Critique</option>
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>
          </div>

          {/* Plage d'âge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.ageRange.min}
                onChange={(e) => handleFilterChange('ageRange', { ...filters.ageRange, min: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.ageRange.max}
                onChange={(e) => handleFilterChange('ageRange', { ...filters.ageRange, max: parseInt(e.target.value) || 100 })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MissingPersonsMap: React.FC = () => {
  const { filteredReports, calculateDistance, loadReports, updateFilters } = useMissingPersonsStore();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyReports, setNearbyReports] = useState<string[]>([]);
  const [showLayers, setShowLayers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([46.2276, 2.2137]);
  const [mapZoom, setMapZoom] = useState(4);
  const [showHelp, setShowHelp] = useState(false);
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter([location.lat, location.lng]);
          setMapZoom(10);
          
          // Find nearby reports (within 50km)
          const nearby = filteredReports
            .filter(report => {
              const distance = calculateDistance(
                location.lat,
                location.lng,
                report.locationDisappeared.coordinates.lat,
                report.locationDisappeared.coordinates.lng
              );
              return distance < 50;
            })
            .map(report => report.id);
          
          setNearbyReports(nearby);
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, [filteredReports, calculateDistance]);

  // Fonctions de contrôle de la carte
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    const center = userLocation ? [userLocation.lat, userLocation.lng] : [46.2276, 2.2137];
    const zoom = userLocation ? 10 : 4;
    setMapCenter(center as [number, number]);
    setMapZoom(zoom);
    if (mapRef.current) {
      mapRef.current.setView(center as [number, number], zoom);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateFilters({ query });
  };

  const handleFilterChange = (filters: any) => {
    updateFilters(filters);
  };

  // Icônes personnalisées selon la priorité et le type de cas
  const getIconForReport = (report: any) => {
    let color = 'red'; // Par défaut
    if (report.priority === 'critical') color = 'darkred';
    else if (report.priority === 'high') color = 'red';
    else if (report.priority === 'medium') color = 'orange';
    else if (report.priority === 'low') color = 'lightred';

    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  // Icône pour la position utilisateur
  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Icône pour les cas d'urgence
  const emergencyIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [30, 46],
    iconAnchor: [15, 46],
    popupAnchor: [1, -34],
    shadowSize: [46, 46]
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* En-tête avec effet glass */}
      <div className="glass-hero p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 glass-shimmer">Carte des disparitions</h1>
            <p className="text-gray-700 text-lg">
              Carte interactive montrant les lieux où les personnes ont été vues pour la dernière fois.
            </p>
          </div>
          
          {/* Statistiques rapides */}
          <div className="flex gap-4 mt-4 md:mt-0">
            <div className="glass-floating px-4 py-2 text-center stat-card">
              <div className="text-2xl font-bold text-red-600">{filteredReports.length}</div>
              <div className="text-sm text-gray-600">Rapports actifs</div>
            </div>
            {userLocation && (
              <div className="glass-floating px-4 py-2 text-center stat-card" style={{animationDelay: '1s'}}>
                <div className="text-2xl font-bold text-amber-600">{nearbyReports.length}</div>
                <div className="text-sm text-gray-600">À proximité</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerte proximité */}
      {userLocation && nearbyReports.length > 0 && (
        <div className="glass-card-strong p-4 mb-6 proximity-alert border-amber-200/50">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 animate-glow" />
            <h3 className="text-sm font-medium text-amber-800">
              Personnes disparues dans votre zone
            </h3>
          </div>
          <p className="text-sm text-amber-700">
            Il y a {nearbyReports.length} personne{nearbyReports.length !== 1 ? 's' : ''} disparue{nearbyReports.length !== 1 ? 's' : ''} signalée{nearbyReports.length !== 1 ? 's' : ''} dans un rayon de 50km de votre position actuelle. Restez vigilant et signalez toute observation aux autorités locales.
          </p>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <SearchFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        nearbyCount={nearbyReports.length}
      />

      {/* Carte principale */}
      <div className="relative glass-card overflow-hidden" style={{ height: '700px' }}>
        <MapContainer
          ref={mapRef}
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          whenReady={() => {
            if (mapRef.current) {
              mapRef.current.on('moveend', () => {
                if (mapRef.current) {
                  const center = mapRef.current.getCenter();
                  setMapCenter([center.lat, center.lng]);
                  setMapZoom(mapRef.current.getZoom());
                }
              });
            }
          }}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Topographie">
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          
          {/* Position utilisateur avec cercle de proximité */}
          {userLocation && (
            <>
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold text-blue-600">Votre position</h3>
                    <p className="text-sm text-gray-600">Position actuelle</p>
                    <div className="mt-2">
                      <Target className="h-4 w-4 inline mr-1" />
                      <span className="text-xs">Centre de recherche</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* Cercle de proximité (50km) */}
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={50000}
                pathOptions={{
                  color: '#3B82F6',
                  fillColor: '#3B82F6',
                  fillOpacity: 0.1,
                  weight: 2
                }}
              />
            </>
          )}
          
          {/* Marqueurs des personnes disparues */}
          {filteredReports.map((report) => {
            const isNearby = nearbyReports.includes(report.id);
            const isEmergency = report.isEmergency || report.priority === 'critical';
            const icon = isEmergency ? emergencyIcon : getIconForReport(report);
            
            return (
              <Marker
                key={report.id}
                position={[
                  report.locationDisappeared.coordinates.lat,
                  report.locationDisappeared.coordinates.lng
                ]}
                icon={icon}
              >
                <Popup maxWidth={350} className="custom-popup">
                  <div className="p-3">
                    <div className="flex items-start space-x-3">
                      {report.photo ? (
                        <img
                          src={report.photo}
                          alt={`${report.firstName} ${report.lastName}`}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {report.firstName} {report.lastName}
                          </h3>
                          {isEmergency && (
                            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600">
                            {report.age} ans • {report.gender === 'male' ? 'Homme' : report.gender === 'female' ? 'Femme' : 'Autre'}
                          </p>
                          
                          <div className="flex items-center text-gray-500">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{report.locationDisappeared.city}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span>Disparu le {new Date(report.dateDisappeared).toLocaleDateString('fr-FR')}</span>
                          </div>
                          
                          {report.priority && (
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                report.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                report.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {report.priority === 'critical' ? 'Critique' :
                                 report.priority === 'high' ? 'Élevée' :
                                 report.priority === 'medium' ? 'Moyenne' : 'Faible'}
                              </span>
                            </div>
                          )}
                          
                          {isNearby && (
                            <div className="flex items-center text-amber-600">
                              <Bell className="h-3 w-3 mr-1" />
                              <span className="text-xs font-medium">Près de vous</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 flex gap-2">
                          <Link to={`/rapports/${report.id}`} className="flex-1">
                            <Button size="sm" className="w-full text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              Détails
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs"
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({
                                  title: `${report.firstName} ${report.lastName} - Personne disparue`,
                                  text: `Personne disparue à ${report.locationDisappeared.city}`,
                                  url: window.location.origin + `/rapports/${report.id}`
                                });
                              }
                            }}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        
        {/* Contrôles de la carte */}
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          onToggleLayers={() => setShowLayers(!showLayers)}
          onShowHelp={() => setShowHelp(true)}
          showLayers={showLayers}
        />
      </div>

      {/* Légende et statistiques */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Légende */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Légende</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-600 rounded-full mr-3"></div>
              <span>Priorité critique</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
              <span>Priorité élevée</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
              <span>Priorité moyenne</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-400 rounded-full mr-3"></div>
              <span>Priorité faible</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
              <span>Votre position</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
              <span>Cas d'urgence</span>
            </div>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistiques</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-2xl font-bold text-gray-900">{filteredReports.length}</div>
              <div className="text-gray-600">Rapports totaux</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {filteredReports.filter(r => r.priority === 'critical').length}
              </div>
              <div className="text-gray-600">Cas critiques</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredReports.filter(r => r.gender === 'male').length}
              </div>
              <div className="text-gray-600">Hommes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600">
                {filteredReports.filter(r => r.gender === 'female').length}
              </div>
              <div className="text-gray-600">Femmes</div>
            </div>
          </div>
          
          {userLocation && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Alertes à proximité :</span>
                  <span className="font-medium text-amber-600">{nearbyReports.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rayon de recherche :</span>
                  <span className="font-medium">50 km</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composant d'aide */}
      <MapHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};