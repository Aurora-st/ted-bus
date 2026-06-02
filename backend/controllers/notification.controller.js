import * as notificationService from '../services/notification.service.js';
import NotificationPreference from '../models/NotificationPreference.model.js';

/**
 * Get user notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    
    const result = await notificationService.getUserNotifications(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    });

    res.json(result);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user._id
    );

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user._id);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get notification preferences
 */
export const getPreferences = async (req, res) => {
  try {
    let preferences = await NotificationPreference.findOne({ user: req.user._id });
    
    if (!preferences) {
      preferences = await NotificationPreference.create({ user: req.user._id });
    }

    res.json(preferences);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update notification preferences
 */
export const updatePreferences = async (req, res) => {
  try {
    // Whitelist allowed fields to prevent mass assignment
    const {
      emailEnabled,
      pushEnabled,
      bookingConfirmation,
      cancellation,
      scheduleChange,
      journeyReminder,
      promotion,
      social
    } = req.body || {};

    const update = {};
    if (typeof emailEnabled === 'boolean') update.emailEnabled = emailEnabled;
    if (typeof pushEnabled === 'boolean') update.pushEnabled = pushEnabled;
    if (bookingConfirmation) update.bookingConfirmation = bookingConfirmation;
    if (cancellation) update.cancellation = cancellation;
    if (scheduleChange) update.scheduleChange = scheduleChange;
    if (journeyReminder) update.journeyReminder = journeyReminder;
    if (promotion) update.promotion = promotion;
    if (social) update.social = social;

    const preferences = await NotificationPreference.findOneAndUpdate(
      { user: req.user._id },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: 'Preferences updated successfully', preferences });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

