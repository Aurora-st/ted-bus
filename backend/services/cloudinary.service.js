import { v2 as cloudinary } from 'cloudinary';

function assertCloudinaryEnv() {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    const err = new Error(`Cloudinary env missing: ${missing.join(', ')}`);
    err.statusCode = 500;
    throw err;
  }
}

export function initCloudinary() {
  assertCloudinaryEnv();
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

export async function uploadImageBuffer({
  buffer,
  folder = 'ted-bus',
  publicId,
  tags = [],
  resourceType = 'image'
}) {
  initCloudinary();

  return await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        tags,
        overwrite: true
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

export function buildImageUrl(publicId, { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = {}) {
  initCloudinary();
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { quality, fetch_format: format },
      ...(width || height ? [{ width, height, crop }] : [])
    ]
  });
}

