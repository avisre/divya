import crypto from "crypto";
import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";

const BUCKET_NAME = "bookingVideos";

function getBucket() {
  if (!mongoose.connection.db) {
    throw new Error("Mongo connection is not ready");
  }

  return new GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME });
}

export function createVideoShareToken() {
  return crypto.randomBytes(24).toString("hex");
}

export async function saveVideoBuffer(buffer, { filename, contentType, metadata = {} }) {
  return new Promise((resolve, reject) => {
    const uploadStream = getBucket().openUploadStream(filename, {
      contentType,
      metadata
    });

    uploadStream.on("error", reject);
    uploadStream.on("finish", () => {
      resolve({
        id: uploadStream.id.toString(),
        filename: uploadStream.filename,
        contentType
      });
    });

    uploadStream.end(buffer);
  });
}

export function openVideoDownloadStream(fileId) {
  return getBucket().openDownloadStream(new ObjectId(fileId));
}

export async function getStoredVideoInfo(fileId) {
  const files = await getBucket()
    .find({ _id: new ObjectId(fileId) })
    .toArray();

  return files[0] || null;
}

export async function deleteStoredVideo(fileId) {
  if (!fileId) return;
  await getBucket().delete(new ObjectId(fileId));
}
