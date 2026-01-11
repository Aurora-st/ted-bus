import nodemailer from 'nodemailer';
import Notification from '../models/Notification.model.js';
import NotificationPreference from '../models/NotificationPreference.model.js';
import User from '../models/User.model.js';

/**
 * Email transporter configuration
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send email notification
 */
const sendEmail = async (userEmail, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject,
      html
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send push notification (Firebase Cloud Messaging)
 * Note: Requires Firebase Admin SDK setup
 */
const sendPushNotification = async (userFcmToken, title, body) => {
  try {
    // In production, use Firebase Admin SDK
    // const admin = require('firebase-admin');
    // const message = { notification: { title, body }, token: userFcmToken };
    // await admin.messaging().send(message);
    
    // For now, return success (implement FCM in production)
    console.log('Push notification:', { title, body, token: userFcmToken });
    return { success: true };
  } catch (error) {
    console.error('Push notification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create and send notification
 */
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  translations = {},
  channels = ['email', 'push'],
  relatedId = null,
  relatedType = null
}) => {
  try {
    // Get user preferences
    const preferences = await NotificationPreference.findOne({ user: userId });
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user wants this type of notification
    const shouldSendEmail = preferences?.emailEnabled && 
      (preferences[type]?.email !== false || type === 'promotion' && preferences.promotion.email);
    const shouldSendPush = preferences?.pushEnabled && 
      (preferences[type]?.push !== false || type === 'promotion' && preferences.promotion.push);

    // Create notification record
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      translations,
      channels: [],
      relatedId,
      relatedType
    });

    // Send email if enabled
    if (shouldSendEmail && channels.includes('email')) {
      notification.channels.push('email');
      const emailResult = await sendEmail(user.email, title, `<p>${message}</p>`);
      
      if (emailResult.success) {
        notification.emailSent = true;
        notification.status = 'sent';
      } else {
        notification.emailError = emailResult.error;
        notification.status = 'failed';
      }
    }

    // Send push if enabled
    if (shouldSendPush && channels.includes('push') && user.fcmToken) {
      notification.channels.push('push');
      const pushResult = await sendPushNotification(user.fcmToken, title, message);
      
      if (pushResult.success) {
        notification.pushSent = true;
        if (notification.status !== 'failed') {
          notification.status = 'sent';
        }
      } else {
        notification.pushError = pushResult.error;
        notification.status = 'failed';
      }
    }

    await notification.save();

    // Retry logic for failed notifications
    if (notification.status === 'failed' && notification.retryCount < 3) {
      setTimeout(async () => {
        notification.retryCount += 1;
        notification.status = 'retrying';
        await notification.save();
        // Retry sending
        await createNotification({
          userId,
          type,
          title,
          message,
          translations,
          channels: notification.channels,
          relatedId,
          relatedType
        });
      }, 60000); // Retry after 1 minute
    }

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false }) => {
  const query = { user: userId };
  if (unreadOnly) {
    query.read = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Notification.countDocuments(query);

  return { notifications, total, page, totalPages: Math.ceil(total / limit) };
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  notification.read = true;
  notification.readAt = new Date();
  await notification.save();

  return notification;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { user: userId, read: false },
    { read: true, readAt: new Date() }
  );
};

