import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../api/axios';

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function buildSteps(origin, destination, routeName) {
  const name = routeName ? ` (${routeName})` : '';
  return [
    `Start at ${origin}`,
    `Board the bus${name}`,
    `Travel towards ${destination}`,
    `Arrive at ${destination}`
  ];
}

const RoutePlanning = () => {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/routes');
        setRoutes(res.data.routes || []);
      } catch (e) {
        toast.error('Failed to load routes');
      }
    })();
  }, []);

  const selectedRoute = useMemo(
    () => routes.find((r) => String(r._id) === String(selectedRouteId)) || null,
    [routes, selectedRouteId]
  );

  const canPlan = useMemo(() => !!selectedRouteId, [selectedRouteId]);

  const handlePlan = async () => {
    if (!canPlan) {
      toast.error('Please select a route');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      // simulate async to keep UI interactive
      await new Promise((r) => setTimeout(r, 500));
      const origin = selectedRoute?.origin || 'Origin';
      const destination = selectedRoute?.destination || 'Destination';
      setResult({
        distanceKm: selectedRoute?.distanceKm ?? 0,
        durationMin: selectedRoute?.durationMin ?? 0,
        steps: buildSteps(origin, destination, selectedRoute?.name),
        origin,
        destination
      });
      toast.success('Route planned!');
    } catch (e) {
      toast.error('Failed to plan route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('routePlanning.title')}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Plan a route instantly—no maps, no paid APIs.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-purple-500/10" />
        <div className="relative p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Select route
            </label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full rounded-xl border border-gray-200/70 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a route…</option>
              {routes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
            {selectedRoute && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                {selectedRoute.origin} → {selectedRoute.destination}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <button
              onClick={handlePlan}
              disabled={loading || !canPlan}
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700"
            >
              {loading ? 'Planning…' : 'Plan Route'}
            </button>

            <div className="text-xs text-gray-600 dark:text-gray-300">
              Tip: Try city-to-city routes for more realistic estimates.
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl border border-white/20 bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl shadow-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Estimated trip
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {result.origin} → {result.destination}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="rounded-xl bg-gray-900 text-white px-4 py-2 shadow">
                  <div className="text-xs opacity-80">Distance</div>
                  <div className="text-lg font-semibold">{result.distanceKm.toFixed(0)} km</div>
                </div>
                <div className="rounded-xl bg-gray-900 text-white px-4 py-2 shadow">
                  <div className="text-xs opacity-80">Duration</div>
                  <div className="text-lg font-semibold">{clamp(result.durationMin, 10, 9999)} min</div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Suggested steps
              </h3>
              <ol className="space-y-2">
                {result.steps.map((s, idx) => (
                  <li key={idx} className="flex gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="text-gray-700 dark:text-gray-200">{s}</div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePlanning;

