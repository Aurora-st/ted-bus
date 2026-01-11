import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {t('common.welcome')} to Bus Travel Platform
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Your comprehensive solution for bus travel planning, community engagement, and route reviews
        </p>
        {!isAuthenticated && (
          <div className="space-x-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t('common.register')}
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {t('common.login')}
            </Link>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            {t('common.community')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Connect with fellow travelers, share experiences, and discover new routes
          </p>
          <Link
            to="/community"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Explore Community →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            {t('common.routePlanning')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Plan your journey with interactive maps, compare routes, and save favorites
          </p>
          <Link
            to="/route-planning"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Plan Route →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            {t('common.reviews')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Read and write reviews about routes, help others make informed decisions
          </p>
          <Link
            to="/reviews"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            View Reviews →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

