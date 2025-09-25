import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useMissingPersonsStore } from '../../store/missingPersonsStore';
import { Button } from '../ui/Button';
import { User, MapPin, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const MissingPersonsMap: React.FC = () => {
  const { filteredReports, calculateDistance } = useMissingPersonsStore();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyReports, setNearbyReports] = useState<string[]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
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

  // Default center (United States)
  const defaultCenter: [number, number] = [39.8283, -98.5795];
  const mapCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter;

  // Custom icon for missing persons
  const missingPersonIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Custom icon for user location
  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Missing Persons Map</h1>
        <p className="mt-2 text-gray-600">
          Interactive map showing locations where people were last seen. 
          {userLocation && nearbyReports.length > 0 && (
            <span className="text-amber-600 font-medium ml-2">
              ⚠️ {nearbyReports.length} missing person{nearbyReports.length !== 1 ? 's' : ''} near your location
            </span>
          )}
        </p>
      </div>

      {nearbyReports.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
            <h3 className="text-sm font-medium text-amber-800">
              Missing persons in your area
            </h3>
          </div>
          <p className="text-sm text-amber-700">
            There {nearbyReports.length === 1 ? 'is' : 'are'} {nearbyReports.length} missing person{nearbyReports.length !== 1 ? 's' : ''} reported within 50km of your current location. Please keep an eye out and report any sightings to local authorities.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
        <MapContainer
          center={mapCenter}
          zoom={userLocation ? 10 : 4}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User location marker */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold">Your Location</h3>
                  <p className="text-sm text-gray-600">Current position</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Missing persons markers */}
          {filteredReports.map((report) => (
            <Marker
              key={report.id}
              position={[
                report.locationDisappeared.coordinates.lat,
                report.locationDisappeared.coordinates.lng
              ]}
              icon={missingPersonIcon}
            >
              <Popup maxWidth={300}>
                <div className="p-2">
                  <div className="flex items-start space-x-3">
                    {report.photo ? (
                      <img
                        src={report.photo}
                        alt={`${report.firstName} ${report.lastName}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {report.firstName} {report.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {report.age} years old • {report.gender}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{report.locationDisappeared.city}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Last seen: {new Date(report.dateDisappeared).toLocaleDateString()}
                      </p>
                      
                      <Link to={`/reports/${report.id}`}>
                        <Button size="sm" className="mt-2 w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span>Missing Person Location</span>
            </div>
            {userLocation && (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                <span>Your Location</span>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <p>Total Reports: {filteredReports.length}</p>
            {userLocation && (
              <p>Nearby Alerts: {nearbyReports.length}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};