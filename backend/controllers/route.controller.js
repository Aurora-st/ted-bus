import Route from '../models/Route.model.js';

const seedRoutes = [
  {
    routeNumber: 'DL-JP-01',
    name: 'Delhi → Jaipur',
    startLocation: { address: 'Delhi, India' },
    endLocation: { address: 'Jaipur, Rajasthan, India' },
    distance: 281,
    averageDuration: 330
  },
  {
    routeNumber: 'BLR-MYS-01',
    name: 'Bengaluru → Mysuru',
    startLocation: { address: 'Bengaluru, Karnataka, India' },
    endLocation: { address: 'Mysuru, Karnataka, India' },
    distance: 144,
    averageDuration: 210
  },
  {
    routeNumber: 'MUM-PUN-01',
    name: 'Mumbai → Pune',
    startLocation: { address: 'Mumbai, Maharashtra, India' },
    endLocation: { address: 'Pune, Maharashtra, India' },
    distance: 149,
    averageDuration: 210
  }
];

export const listRoutes = async (req, res) => {
  try {
    const existingCount = await Route.countDocuments({});
    if (existingCount === 0) {
      await Route.insertMany(seedRoutes, { ordered: true });
    }

    const routes = await Route.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select('name routeNumber startLocation endLocation distance averageDuration');

    res.json({
      routes: routes.map((r) => ({
        _id: r._id,
        routeNumber: r.routeNumber,
        name: r.name,
        origin: r.startLocation?.address || '',
        destination: r.endLocation?.address || '',
        distanceKm: r.distance,
        durationMin: r.averageDuration
      }))
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error fetching routes' });
  }
};

