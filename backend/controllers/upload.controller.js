import multer from 'multer';
import crypto from 'crypto';
import { uploadImageBuffer, buildImageUrl } from '../services/cloudinary.service.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export const uploadSingleImageMiddleware = upload.single('image');

export const uploadImage = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: 'Missing image file (field name: image)' });
    }

    const ext = (req.file.mimetype || '').split('/')[1] || 'jpg';
    const publicId = `post_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${ext}`;

    const result = await uploadImageBuffer({
      buffer: req.file.buffer,
      folder: 'ted-bus/uploads',
      publicId
    });

    // Store URLs only (Mongo stores result.secure_url; thumbnails are derived URLs)
    const url = result.secure_url;
    const thumbnailUrl = buildImageUrl(result.public_id, { width: 320, height: 240, crop: 'fill' });
    const optimizedUrl = buildImageUrl(result.public_id, { width: 1280 });

    res.status(201).json({
      message: 'Image uploaded',
      url,
      optimizedUrl,
      thumbnailUrl
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Server error uploading image' });
  }
};

