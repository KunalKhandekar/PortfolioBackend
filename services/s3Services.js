import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY_ID || process.env.AWS_SECRET_KEY,
  },
});

const bucket = process.env.AWS_BUCKET_NAME;

export const generatePreSignedUploadURL = async ({ Key, ContentType }) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key,
    ContentType,
  });

  const preSignedUploadURL = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
    signableHeaders: new Set(["content-type"]),
  });
  return preSignedUploadURL;
};

export const deleteS3Object = async ({ Key }) => {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key,
  });

  const res = await s3Client.send(command);
  return res;
};
