import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import {
  FileExtension,
  ContentType,
  getDefaultExtension,
} from "./contentTypes/client";

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

    const headObject = await s3.headObject(params).promise();
    const contentType = headObject.ContentType!;
    // Get the corresponding file extension for this content type (e.g., '.pdf' for 'application/pdf')
    const extension = getDefaultExtension(contentType as ContentType);
    const file_name = path.join(tempDir, `file-${Date.now()}${extension}`);

    const fileStream = fs.createWriteStream(file_name);
    const s3Stream = s3.getObject(params).createReadStream();
    await new Promise((resolve, reject) => {
      s3Stream.pipe(fileStream).on("error", reject).on("finish", resolve);
    });

    return { file_name, extension };
  } catch (error) {
    console.error(error);
    return null;
  }
}
