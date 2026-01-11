import { useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import CommentSection from './CommentSection';

const PostCard = ({ post, onUpdate }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      if (liked) {
        await api.delete(`/api/posts/${post._id}/like`);
        setLiked(false);
        setLikesCount(likesCount - 1);
      } else {
        await api.post(`/api/posts/${post._id}/like`);
        setLiked(true);
        setLikesCount(likesCount + 1);
      }
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/community/post/${post._id}`;
    navigator.clipboard.writeText(url);
    toast.success('Post link copied to clipboard!');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
            {post.author?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {post.author?.name || 'Anonymous'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm">
          {post.category}
        </span>
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {post.title}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
        {post.content}
      </p>

      {post.images && post.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {post.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Post image ${idx + 1}`}
              className="w-full h-48 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      <div className="flex items-center space-x-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 ${
            liked ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <span>❤️</span>
          <span>{likesCount}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400"
        >
          <span>💬</span>
          <span>{post.commentsCount || 0}</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400"
        >
          <span>🔗</span>
          <span>{t('community.share')}</span>
        </button>
      </div>

      {showComments && (
        <CommentSection postId={post._id} />
      )}
    </div>
  );
};

export default PostCard;

