import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const ReviewCard = ({ review, onUpdate }) => {
  const [upvoted, setUpvoted] = useState(false);
  const [upvotesCount, setUpvotesCount] = useState(review.upvotesCount || 0);
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to upvote');
      return;
    }

    try {
      await axios.post(`/api/reviews/${review._id}/upvote`);
      setUpvoted(true);
      setUpvotesCount(upvotesCount + 1);
    } catch (error) {
      toast.error('Failed to upvote');
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
            {review.user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {review.user?.name || 'Anonymous'}
              {review.isTrustedReviewer && (
                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                  Trusted Reviewer
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              {review.edited && ' (edited)'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl mb-1">{renderStars(review.rating)}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{review.rating}/5</p>
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
        {review.content}
      </p>

      <div className="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleUpvote}
          disabled={upvoted}
          className={`flex items-center space-x-2 ${
            upvoted ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <span>👍</span>
          <span>{upvotesCount}</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;

