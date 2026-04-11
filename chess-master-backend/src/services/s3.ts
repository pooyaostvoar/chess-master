import { S3Client } from "@aws-sdk/client-s3";
import { readSecret } from "../utils/secret";

let client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "us-east-1",
      endpoint: "http://minio:9000",
      credentials: {
        accessKeyId:
          readSecret("/run/secrets/minio_access_key_id") ?? "minioadmin",
        secretAccessKey:
          readSecret("/run/secrets/minio_secret_access_key") ?? "minioadmin",
      },
      forcePathStyle: true,
    });
  }
  return client;
}
