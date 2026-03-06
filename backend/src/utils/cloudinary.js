import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export function getSignedVideoUrl(publicId, expiresInSeconds = 3600) {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const signature = crypto
    .createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${expiresAt}${process.env.CLOUDINARY_API_SECRET}`)
    .digest("hex");

  return cloudinary.url(publicId, {
    resource_type: "video",
    secure: true,
    sign_url: true,
    type: "authenticated",
    version: expiresAt,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    signature
  });
}

export async function uploadVideo(filePath, publicId) {
  return cloudinary.uploader.upload(filePath, {
    resource_type: "video",
    public_id: publicId,
    type: "authenticated",
    overwrite: true
  });
}

export { cloudinary };

