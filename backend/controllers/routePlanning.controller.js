import SavedRoute from '../models/SavedRoute.model.js';
import axios from 'axios';

/**
 * Plan a route using Google Maps API
 */
export const planRoute = async (req, res) => {
  try {
    const { startLocation, destination, waypoints = [] } = req.body;

    if (!startLocation || !destination) {
      return res.status(400).json({ 
        message: 'Start location and destination are required' 
      });
    }

    // Build waypoints string for Google Maps API
    const waypointsStr = waypoints
      .map(wp => `${wp.coordinates.lat},${wp.coordinates.lng}`)
      .join('|');

    // Call Google Maps Directions API
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLocation.coordinates.lat},${startLocation.coordinates.lng}&destination=${destination.coordinates.lat},${destination.coordinates.lng}${waypointsStr ? `&waypoints=${waypointsStr}` : ''}&key=${apiKey}`;

    const response = await axios.get(url);

    if (response.data.status !== 'OK') {
      return res.status(400).json({ 
        message: 'Route planning failed', 
        error: response.data.status 
      });
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    // Extract route information
    const routeData = {
      distance: leg.distance.value / 1000, // Convert to km
      duration: leg.duration.value / 60, // Convert to minutes
      durationInTraffic: leg.duration_in_traffic 
        ? leg.duration_in_traffic.value / 60 
        : leg.duration.value / 60,
      polyline: route.overview_polyline.points,
      steps: route.legs.map(leg => ({
        distance: leg.distance.text,
        duration: leg.duration.text,
        instruction: leg.html_instructions
      }))
    };

    res.json({
      message: 'Route planned successfully',
      route: routeData
    });
  } catch (error) {
    console.error('Plan route error:', error);
    res.status(500).json({ message: 'Server error planning route' });
  }
};

/**
 * Get detailed route information
 */
export const getRouteDetails = async (req, res) => {
  try {
    // In production, fetch from database or cache
    res.json({ message: 'Route details endpoint' });
  } catch (error) {
    console.error('Get route details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Save route to user's favorites
 */
export const saveRoute = async (req, res) => {
  try {
    const { name, startLocation, destination, waypoints, distance, duration, routePolyline, trafficInfo } = req.body;

    if (!name || !startLocation || !destination || !distance || !duration) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }

    const savedRoute = new SavedRoute({
      user: req.user._id,
      name,
      startLocation,
      destination,
      waypoints: waypoints || [],
      distance,
      duration,
      routePolyline: routePolyline || '',
      trafficInfo: trafficInfo || { trafficLevel: 'light' }
    });

    await savedRoute.save();

    res.status(201).json({
      message: 'Route saved successfully',
      route: savedRoute
    });
  } catch (error) {
    console.error('Save route error:', error);
    res.status(500).json({ message: 'Server error saving route' });
  }
};

/**
 * Get user's saved routes
 */
export const getSavedRoutes = async (req, res) => {
  try {
    const routes = await SavedRoute.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(routes);
  } catch (error) {
    console.error('Get saved routes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete saved route
 */
export const deleteSavedRoute = async (req, res) => {
  try {
    const route = await SavedRoute.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    await SavedRoute.findByIdAndDelete(req.params.id);

    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Compare multiple routes
 */
export const compareRoutes = async (req, res) => {
  try {
    const { routes } = req.body; // Array of route objects with startLocation, destination, waypoints

    if (!routes || routes.length < 2) {
      return res.status(400).json({ 
        message: 'At least 2 routes required for comparison' 
      });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // Plan all routes using Google Maps API
    const comparisons = await Promise.all(
      routes.map(async (route) => {
        const { startLocation, destination, waypoints = [] } = route;
        const waypointsStr = waypoints
          .map(wp => `${wp.coordinates.lat},${wp.coordinates.lng}`)
          .join('|');

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLocation.coordinates.lat},${startLocation.coordinates.lng}&destination=${destination.coordinates.lat},${destination.coordinates.lng}${waypointsStr ? `&waypoints=${waypointsStr}` : ''}&key=${apiKey}`;

        const response = await axios.get(url);
        
        if (response.data.status === 'OK' && response.data.routes[0]) {
          const routeData = response.data.routes[0];
          const leg = routeData.legs[0];
          
          return {
            ...route,
            distance: leg.distance.value / 1000,
            duration: leg.duration.value / 60,
            durationInTraffic: leg.duration_in_traffic 
              ? leg.duration_in_traffic.value / 60 
              : leg.duration.value / 60,
            polyline: routeData.overview_polyline.points
          };
        }
        
        return { ...route, error: 'Route planning failed' };
      })
    );

    // Sort by duration
    const sortedByDuration = [...comparisons].sort((a, b) => 
      (a.duration || Infinity) - (b.duration || Infinity)
    );
    const sortedByDistance = [...comparisons].sort((a, b) => 
      (a.distance || Infinity) - (b.distance || Infinity)
    );

    res.json({
      message: 'Routes compared successfully',
      comparisons,
      fastest: sortedByDuration[0],
      shortest: sortedByDistance[0]
    });
  } catch (error) {
    console.error('Compare routes error:', error);
    res.status(500).json({ message: 'Server error comparing routes' });
  }
};

