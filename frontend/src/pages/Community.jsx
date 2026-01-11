import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import PostCard from '../components/community/PostCard';
import CreatePostModal from '../components/community/CreatePostModal';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isAuthenticated, isVerified } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    fetchPosts();
  }, [category]);

  const fetchPosts = async () => {
    try {
      const params = category ? { category } : {};
      const response = await api.get('/api/posts', { params });
      setPosts(response.data.posts || []);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('community.title')}
        </h1>
        {isAuthenticated && isVerified && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t('community.createPost')}
          </button>
        )}
        {isAuthenticated && !isVerified && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('community.verifiedOnly')}
          </p>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setCategory('')}
          className={`px-4 py-2 rounded-lg ${
            category === ''
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setCategory('routes')}
          className={`px-4 py-2 rounded-lg ${
            category === 'routes'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          {t('community.categories.routes')}
        </button>
        <button
          onClick={() => setCategory('destinations')}
          className={`px-4 py-2 rounded-lg ${
            category === 'destinations'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          {t('community.categories.destinations')}
        </button>
        <button
          onClick={() => setCategory('travel-tips')}
          className={`px-4 py-2 rounded-lg ${
            category === 'travel-tips'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          {t('community.categories.travelTips')}
        </button>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-12">{t('common.loading')}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          No posts found
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handlePostCreated}
        />
      )}
    </div>
  );
};

export default Community;

