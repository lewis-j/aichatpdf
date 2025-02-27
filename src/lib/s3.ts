import AWS from "aws-sdk";
import { ContentType } from "./contentTypes/client";

export async function uploadToS3(file: File) {
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

    const file_key = `uploads/${Date.now().toString()}-${file.name.replace(
      " ",
      "-"
    )}`;
    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
      Key: file_key,
      Body: file,
      // Type assertion for documentation - shows that S3's ContentType
      // uses the same MIME types defined in our SUPPORTED_CONTENT_TYPES
      ContentType: file.type as ContentType,
    };
    const upload = s3
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        console.log(
          "Uploading to S3...",
          parseInt(((evt.loaded * 100) / evt.total).toString()) + "%"
        );
      })
      .promise();

    await upload.then((data) =>
      console.log("succesfully uploaded to S3!", file_key, data)
    );
    return Promise.resolve({
      file_key,
      file_name: file.name,
    });
  } catch (error) {
    console.error(error);
  }
}

export function getS3Url(file_key: string) {
  const url = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${file_key}`;
  return url;
}
