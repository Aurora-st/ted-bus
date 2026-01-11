import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = unreadOnly ? { unreadOnly: 'true' } : {};
      const response = await axios.get('/api/notifications', { params });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('notifications.title')}
        </h1>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Unread only</span>
          </label>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {t('notifications.markAllRead')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">{t('common.loading')}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          {t('notifications.noNotifications')}
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md cursor-pointer ${
                !notification.read ? 'border-l-4 border-primary-600' : ''
              }`}
              onClick={() => !notification.read && markAsRead(notification._id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {notification.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    {notification.message}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && (
                  <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

