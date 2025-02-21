import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import {
  contentTypeToExtension,
  FileContentType,
  FileExtension,
} from "./fileTypes";

// Create temp directory if it doesn't exist
const tempDir = path.join(process.cwd(), "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

export async function downloadFromS3(
  file_key: string
): Promise<{ file_name: string; extension: FileExtension } | null> {
  try {
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    });
    const s3 = new AWS.S3({
      params: {
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
      },
      region: "us-east-2",
    });
    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
      Key: file_key,
    };
    const obj = await s3.getObject(params).promise();

    const contentType = obj.ContentType!;
    const extension = contentTypeToExtension(contentType as FileContentType);
    const file_name = path.join(tempDir, `file-${Date.now()}${extension}`);

    fs.writeFileSync(file_name, obj.Body as Buffer);
    return { file_name, extension };
  } catch (error) {
    console.error(error);
    return null;
  }
}
