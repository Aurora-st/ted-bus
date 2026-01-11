import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import ReviewCard from '../components/reviews/ReviewCard';
import CreateReviewModal from '../components/reviews/CreateReviewModal';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isAuthenticated, isVerified } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      fetchReviews();
    }
  }, [selectedRoute]);

  const fetchRoutes = async () => {
    try {
      // In production, fetch from API
      // For demo, using mock data
      setRoutes([
        { _id: '1', name: 'Route 101', routeNumber: '101' },
        { _id: '2', name: 'Route 202', routeNumber: '202' }
      ]);
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    }
  };

  const fetchReviews = async () => {
    if (!selectedRoute) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/api/reviews/route/${selectedRoute}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('reviews.title')}
        </h1>
        {isAuthenticated && isVerified && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t('reviews.writeReview')}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Route
        </label>
        <select
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select a route...</option>
          {routes.map((route) => (
            <option key={route._id} value={route._id}>
              {route.name} ({route.routeNumber})
            </option>
          ))}
        </select>
      </div>

      {selectedRoute && (
        <>
          {loading ? (
            <div className="text-center py-12">{t('common.loading')}</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              No reviews yet for this route
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} onUpdate={fetchReviews} />
              ))}
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <CreateReviewModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchReviews();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Reviews;

