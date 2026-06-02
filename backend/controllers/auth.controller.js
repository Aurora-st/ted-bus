import User from '../models/User.model.js';
import NotificationPreference from '../models/NotificationPreference.model.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

async function sendVerificationEmail({ to, token }) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  // Keep it simple: token is returned to frontend, which can call verify endpoint.
  // If you later add a frontend "verify" page, you can change this to a link.
  const html = `
    <p>Welcome to Bus Travel Platform.</p>
    <p>Your verification code:</p>
    <p style="font-size:20px;letter-spacing:2px"><b>${token}</b></p>
    <p>This code expires in 30 minutes.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Verify your email',
    html
  });
}

/**
 * Register a new user
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = new User({ name, email, password });
    await user.save();

    // Create default notification preferences
    await NotificationPreference.create({ user: user._id });

    // Create verification token (production-grade)
    const verificationToken = crypto.randomBytes(16).toString('hex');
    user.emailVerificationTokenHash = sha256(verificationToken);
    user.emailVerificationExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    await sendVerificationEmail({ to: user.email, token: verificationToken });

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role
      },
      // Keep response backward compatible while enabling real verification.
      // Frontend may ignore this field; it’s safe to expose (one-time token).
      verificationToken: process.env.NODE_ENV === 'production' ? undefined : verificationToken
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
        language: user.language,
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Verify user email (simplified - in production, use email verification link)
 */
export const verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode, token } = req.body;

    // Production-grade verification: requires email + token
    const providedToken = token || verificationCode;
    if (!email || !providedToken) {
      return res.status(400).json({ message: 'Email and verification token are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If already verified, return success idempotently
    if (user.isVerified) {
      return res.json({ message: 'Email already verified' });
    }

    // In production, we must have a token hash set and not expired
    if (process.env.NODE_ENV === 'production') {
      if (!user.emailVerificationTokenHash || !user.emailVerificationExpiresAt) {
        return res.status(400).json({ message: 'No active verification token. Please re-register or request a new token.' });
      }
      if (user.emailVerificationExpiresAt.getTime() < Date.now()) {
        return res.status(400).json({ message: 'Verification token expired. Please request a new token.' });
      }

      const providedHash = sha256(String(providedToken));
      if (providedHash !== user.emailVerificationTokenHash) {
        return res.status(400).json({ message: 'Invalid verification token' });
      }
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

