import dotenv from 'dotenv';

dotenv.config();

const required = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'FRONTEND_URL'
];

const missing = required.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');
if (missing.length > 0) {
  // Fail fast in production; keep dev experience reasonable
  const msg = `Missing required env vars: ${missing.join(', ')}`;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(msg);
  } else {
    // eslint-disable-next-line no-console
    console.warn(`⚠️  ${msg}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: process.env.FRONTEND_URL,
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  }
};

