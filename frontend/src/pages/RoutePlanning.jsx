import { useState } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer, Marker } from '@react-google-maps/api';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const RoutePlanning = () => {
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeName, setRouteName] = useState('');
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const mapContainerStyle = {
    width: '100%',
    height: '500px'
  };

  const center = {
    lat: 40.7128,
    lng: -74.0060
  };

  const handlePlanRoute = async () => {
    if (!startLocation || !destination) {
      toast.error('Please enter both start location and destination');
      return;
    }

    setLoading(true);
    try {
      // In a real app, you'd geocode the addresses first
      // For demo, using coordinates
      const response = await api.post('/api/route-planning/plan', {
        startLocation: {
          address: startLocation,
          coordinates: { lat: 40.7128, lng: -74.0060 } // Demo coordinates
        },
        destination: {
          address: destination,
          coordinates: { lat: 40.7589, lng: -73.9851 } // Demo coordinates
        }
      });
      setRouteData(response.data.route);
      toast.success('Route planned successfully!');
    } catch (error) {
      toast.error('Failed to plan route');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoute = async () => {
    if (!routeName || !routeData) {
      toast.error('Please plan a route and give it a name');
      return;
    }

    try {
      await api.post('/api/route-planning/save', {
        name: routeName,
        startLocation: {
          address: startLocation,
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        destination: {
          address: destination,
          coordinates: { lat: 40.7589, lng: -73.9851 }
        },
        distance: routeData.distance,
        duration: routeData.duration,
        routePolyline: routeData.polyline
      });
      toast.success('Route saved successfully!');
      setRouteName('');
    } catch (error) {
      toast.error('Failed to save route');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        {t('routePlanning.title')}
      </h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('routePlanning.startLocation')}
            </label>
            <input
              type="text"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              placeholder="Enter start location"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('routePlanning.destination')}
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handlePlanRoute}
          disabled={loading}
          className="w-full md:w-auto px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? t('common.loading') : t('routePlanning.planRoute')}
        </button>
      </div>

      {routeData && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Route Information
          </h2>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Distance</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {routeData.distance.toFixed(2)} km
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.round(routeData.duration)} minutes
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Traffic</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {routeData.durationInTraffic ? `${Math.round(routeData.durationInTraffic)} min` : 'N/A'}
              </p>
            </div>
          </div>
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="Route name"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSaveRoute}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {t('routePlanning.saveRoute')}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={10}
          >
            {routeData && routeData.polyline && (
              <DirectionsRenderer
                directions={{
                  routes: [{
                    overview_polyline: { points: routeData.polyline },
                    legs: [{
                      distance: { value: routeData.distance * 1000, text: `${routeData.distance} km` },
                      duration: { value: routeData.duration * 60, text: `${routeData.duration} min` }
                    }]
                  }]
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default RoutePlanning;

