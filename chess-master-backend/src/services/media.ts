import {
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

import crypto from "crypto";
import path from "path";
import { getS3Client } from "./s3";
import sharp from "sharp";

const BUCKET = "images";
let bucketReady = false;

async function ensureBucketExists() {
  if (bucketReady) return;
  try {
    await getS3Client().send(new HeadBucketCommand({ Bucket: BUCKET }));
  } catch (err: any) {
    if (err.$metadata?.httpStatusCode === 404) {
      await getS3Client().send(new CreateBucketCommand({ Bucket: BUCKET }));
    } else {
      throw err;
    }
  }
  bucketReady = true;
}

export async function uploadImage(
  file: Express.Multer.File
): Promise<{ filename: string; url: string }> {
  await ensureBucketExists();

  const ext = path.extname(file.originalname);
  const filename = crypto.randomBytes(16).toString("hex") + ext;

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return {
    filename,
    url: `/${filename}`,
  };
}

export async function compressImage(
  buffer: Buffer,
  mimeType: string
): Promise<Buffer> {
  const image = sharp(buffer);

  if (mimeType === "image/png") {
    return image.png({ quality: 60 }).toBuffer();
  }

  // default to jpeg compression
  return image.jpeg({ quality: 60 }).toBuffer();
}
